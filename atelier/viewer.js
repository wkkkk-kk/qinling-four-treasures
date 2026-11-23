const $=id=>document.getElementById(id);
const vertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
layout(location=3) in vec4 joints;
layout(location=4) in vec4 weights;
uniform mat4 bones[25];
uniform mat3 rotation;
uniform float scale;
uniform float aspect;
uniform float focusY;
out vec3 N;
out vec3 P;
out vec2 UV;
void main(){
 mat4 skin=weights.x*bones[int(joints.x)]+weights.y*bones[int(joints.y)]+weights.z*bones[int(joints.z)]+weights.w*bones[int(joints.w)];
 vec3 p=rotation*((skin*vec4(pos,1.)).xyz-vec3(0.,focusY,0.));
 P=p;N=rotation*mat3(skin)*normal;UV=uv;
 gl_Position=vec4(p.x*scale/aspect,p.y*scale,-p.z*.35,1.);
}`;
const fragment=`#version 300 es
precision highp float;
in vec3 N;in vec3 P;in vec2 UV;
uniform vec3 base;
uniform sampler2D cloth;
uniform sampler2D normals;
uniform sampler2D orm;
uniform bool fabric;
out vec4 pixel;
void main(){
 vec3 n=normalize(N),color=base;
 float rough=.82,metal=0.;
 if(fabric){
  color=pow(texture(cloth,UV).rgb,vec3(2.2));vec3 params=texture(orm,UV).rgb;rough=params.g;metal=params.b;
  vec3 a=dFdx(P),b=dFdy(P);vec2 ua=dFdx(UV),ub=dFdy(UV);vec3 v=cross(b,n),w=cross(n,a);
  vec3 t=v*ua.x+w*ub.x,bt=v*ua.y+w*ub.y;float d=max(dot(t,t),dot(bt,bt));
  if(d>1e-12){vec3 detail=texture(normals,UV).rgb*2.-1.;n=normalize(n*detail.z+.38*(t*detail.x+bt*detail.y)*inversesqrt(d));}
 }
 vec3 light=normalize(vec3(-.46,.68,.77));float diffuse=max(0.,dot(n,light)),fill=max(0.,dot(n,normalize(vec3(.8,.1,.45))));
 float gloss=pow(max(dot(n,normalize(light+vec3(0,0,1))),0.),mix(60.,7.,rough))*(.016+.06*metal);
 pixel=vec4(pow(clamp(color*(.58+.67*diffuse+.16*fill)+vec3(gloss),0.,1.),vec3(1./2.2)),1.);
}`;
let gl,model,program,uniforms,angle=0,pitch=.02,zoom=1,focus=0,playing=false,time=0,last=0,request=0,generation=0;
async function get(file,mode){const response=await fetch(file);if(!response.ok)throw Error(file);return response[mode]();}
function shader(type,source){
 const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
 if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;
}
async function loadModel(){
 const [bytes,poses,actions]=await Promise.all([get('jinyue.glb','arrayBuffer'),get('poses.bin','arrayBuffer'),get('actions.json','json')]);
 const dv=new DataView(bytes),length=dv.getUint32(12,true),bin=28+length;
 const obj=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,length)));
 if(actions.joints!==25||poses.byteLength%1600)throw Error('姿态数据不完整');
 const gpu=new Map();
 function bind(i,target){const view=obj.bufferViews[i];if(!gpu.has(i)){
  const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,new Uint8Array(bytes,bin+(view.byteOffset||0),view.byteLength),gl.STATIC_DRAW);gpu.set(i,b);
 }else gl.bindBuffer(target,gpu.get(i));}
 const textured=obj.materials.find(m=>m.name==='Forest vest');
 const ids=[textured.pbrMetallicRoughness.baseColorTexture.index,textured.normalTexture.index,textured.pbrMetallicRoughness.metallicRoughnessTexture.index];
 for(const [unit,id] of ids.entries()){
  const pic=obj.images[obj.textures[id].source],view=obj.bufferViews[pic.bufferView],image=await createImageBitmap(new Blob([new Uint8Array(bytes,bin+(view.byteOffset||0),view.byteLength)],{type:pic.mimeType}),{colorSpaceConversion:'none'});
  gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);image.close();
 }
 const parts=obj.meshes[0].primitives.map(p=>{
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  for(const [idx,key] of ['POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0'].entries()){
   const a=obj.accessors[p.attributes[key]],view=obj.bufferViews[a.bufferView];bind(a.bufferView,gl.ARRAY_BUFFER);gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,{VEC2:2,VEC3:3,VEC4:4}[a.type],a.componentType,!!a.normalized,view.byteStride||0,a.byteOffset||0);
  }
  const a=obj.accessors[p.indices];bind(a.bufferView,gl.ELEMENT_ARRAY_BUFFER);const m=obj.materials[p.material];return {vao,count:a.count,type:a.componentType,offset:a.byteOffset||0,color:(m.pbrMetallicRoughness.baseColorFactor||[1,1,1]).slice(0,3),fabric:m===textured};
 });
 return {parts,actions,poses:new Float32Array(poses)};
}
function draw(timestamp){
 request=0;if(!model)return;
 if(playing&&last)time+=(timestamp-last)/1000;last=timestamp;
 const canvas=$('scene'),ratio=Math.min(window.devicePixelRatio||1,2),width=Math.max(1,Math.round(canvas.clientWidth*ratio)),height=Math.max(1,Math.round(canvas.clientHeight*ratio));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}gl.viewport(0,0,width,height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const action=model.actions.clips[$('clip').value];const frame=action?action[0]+Math.floor(time*model.actions.fps)%action[1]:0;
 const ca=Math.cos(angle),sa=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);
 gl.uniformMatrix3fv(uniforms.rotation,false,[ca,sp*sa,-cp*sa,0,cp,sp,sa,-sp*ca,cp*ca]);
 gl.uniform1f(uniforms.scale,.88*zoom);gl.uniform1f(uniforms.aspect,width/height);gl.uniform1f(uniforms.focusY,focus);
 gl.uniformMatrix4fv(uniforms.bones,false,model.poses.subarray(frame*400,(frame+1)*400));
 for(const p of model.parts){gl.uniform3fv(uniforms.base,p.color);gl.uniform1i(uniforms.fabric,p.fabric?1:0);gl.bindVertexArray(p.vao);gl.drawElements(gl.TRIANGLES,p.count,p.type,p.offset);}
 if(playing)refresh();
}
function refresh(){if(compatibility){fallbackView();return;}if(model&&!request)request=requestAnimationFrame(draw);}
function setPlay(active){playing=active;last=0;$('play').textContent=active?'暂停动作':'播放动作';refresh();}
let compatibility=false,fallbackIndex=-1;
function fallbackView(){
 const video=$('fallbackClip'),cover=$('cover'),clip=$('clip').value;
 const step=((Math.round(angle*24/(Math.PI*2))%24)+24)%24;
 if(step!==fallbackIndex){cover.src='frames/angle-'+String(step).padStart(2,'0')+'.webp';fallbackIndex=step;}
 const factor='scale('+zoom+')';cover.style.transform=factor;video.style.transform=factor;
 if(clip){
  if(video.dataset.clip!==clip){video.src='frames/'+clip+'.mp4';video.dataset.clip=clip;}
  video.hidden=false;cover.hidden=true;
  if(playing&&video.paused)video.play().catch(()=>{playing=false;$('play').textContent='播放动作';});
  else if(!playing&&!video.paused)video.pause();
 }else{video.pause();video.hidden=true;cover.hidden=false;}
}
function showCompatibility(){
 compatibility=true;model=null;const cover=$('cover');
 $('scene').hidden=true;$('tools').hidden=false;$('load').hidden=true;cover.tabIndex=0;
 $('message').textContent='已切换至逐角度渲染预览。可转动查看马甲，并播放动作视频。';
 $('hint').textContent='左右拖动或使用方向键可切换 24 个视角。动作视频使用固定机位。';
 let prev=null;
 cover.onpointerdown=e=>{if(e.isPrimary){cover.setPointerCapture(e.pointerId);prev=e.clientX;}};
 cover.onpointermove=e=>{if(prev===null||!e.isPrimary)return;angle+=(e.clientX-prev)*.012;prev=e.clientX;fallbackView();};
 cover.onlostpointercapture=()=>prev=null;cover.ondragstart=()=>false;
 cover.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=(e.key==='ArrowLeft'?-1:1)*Math.PI/12;fallbackView();}};
 fallbackView();
}
async function start(){
 const token=++generation;$('load').disabled=true;$('message').textContent='正在载入彩色模型…';
 try{
  gl=$('scene').getContext('webgl2',{antialias:true});if(!gl)throw Error('WebGL 2');
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);uniforms=Object.fromEntries(['rotation','scale','aspect','focusY','base','fabric','bones'].map(n=>[n,gl.getUniformLocation(program,n==='bones'?'bones[0]':n)]));
  ['cloth','normals','orm'].forEach((n,i)=>gl.uniform1i(gl.getUniformLocation(program,n),i));const result=await loadModel();if(token!==generation)return;model=result;
  gl.enable(gl.DEPTH_TEST);gl.clearColor(.90,.91,.86,1);$('cover').hidden=true;$('scene').hidden=false;$('tools').hidden=false;$('load').hidden=true;$('message').textContent='已载入彩色模型。';refresh();
 }catch(err){console.info('Using rendered fallback:',err.message);showCompatibility();}
 finally{$('load').disabled=false;}
}
$('load').addEventListener('click',start);$('zoom').oninput=e=>{zoom=Number(e.target.value);refresh();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(compatibility){$('clip').value='';$('play').disabled=true;setPlay(false);}const v=b.dataset.view;angle=v==='back'?Math.PI:0;pitch=.02;zoom=v==='detail'?2.35:1;focus=v==='detail'?-.015:0;$('zoom').value=zoom;refresh();});
$('clip').onchange=()=>{time=0;$('play').disabled=!$('clip').value;setPlay(!!$('clip').value);};
$('play').onclick=()=>setPlay(!playing);
let drag=null;const canvas=$('scene');
canvas.onpointerdown=e=>{if(!e.isPrimary)return;canvas.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY];};
canvas.onpointermove=e=>{if(!drag||!e.isPrimary)return;angle+=(e.clientX-drag[0])*.009;pitch=Math.max(-.9,Math.min(.9,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];refresh();};
canvas.onlostpointercapture=()=>drag=null;
canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();angle+=e.key==='ArrowLeft'?-.14:e.key==='ArrowRight'?.14:0;pitch=Math.max(-.9,Math.min(.9,pitch+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0)));refresh();};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();generation++;model=null;setPlay(false);$('scene').hidden=true;$('cover').hidden=false;$('tools').hidden=true;$('load').hidden=false;$('message').textContent='图形上下文已暂停，可重新打开模型。';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlay(false);});new ResizeObserver(refresh).observe(canvas);
