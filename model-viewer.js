const asset = name => new URL('./assets/' + name, import.meta.url).href;
const limit = (value, min, max) => Math.max(min, Math.min(max, value));

const vertexSource = `
attribute vec3 position;
attribute vec3 normal;
uniform vec2 angles;
uniform vec2 scale;
varying vec3 lightingNormal;
vec3 rotate(vec3 p) {
  float sy = sin(angles.x), cy = cos(angles.x);
  float sx = sin(angles.y), cx = cos(angles.y);
  vec3 v = vec3(cy*p.x + sy*p.z, p.y, cy*p.z - sy*p.x);
  return vec3(v.x, cx*v.y - sx*v.z, sx*v.y + cx*v.z);
}
void main() {
  vec3 v = rotate(position);
  lightingNormal = rotate(normal);
  gl_Position = vec4(scale * v.xy + vec2(0.0, -0.03), -0.50*v.z, 1.0);
}`;
const fragmentSource = `
precision mediump float;
varying vec3 lightingNormal;
void main() {
  vec3 n = normalize(lightingNormal);
  float key = max(0.0, dot(n, normalize(vec3(-0.45, 0.61, 0.65))));
  float fill = max(0.0, dot(n, normalize(vec3(0.80, 0.20, 0.55))));
  gl_FragColor = vec4(vec3(0.938, 0.902, 0.82) * (0.40 + 0.53*key + 0.13*fill), 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || 'Shader compilation failed');
  }
  return shader;
}

// The local GLB contains a single indexed primitive with float positions and normals.
function loadGeometry(gl, bytes) {
  const header = new DataView(bytes);
  if (header.getUint32(0,true) !== 0x46546c67 || header.getUint32(4,true) !== 2 ||
      header.getUint32(12,true) === 0 || header.getUint32(16,true) !== 0x4e4f534a) {
    throw new Error('Invalid GLB');
  }
  const jsonLength = header.getUint32(12,true);
  const descriptor = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,jsonLength)));
  const binStart = 28 + jsonLength;
  const primitive = descriptor.meshes[0].primitives[0];
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
  gl.useProgram(program);
  const buffers = [];
  function bind(accessorIndex, target) {
    const accessor = descriptor.accessors[accessorIndex];
    const view = descriptor.bufferViews[accessor.bufferView];
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, new Uint8Array(bytes, binStart + (view.byteOffset || 0), view.byteLength), gl.STATIC_DRAW);
    buffers.push(buffer);
    return accessor;
  }
  for (const [name, index] of [['position',primitive.attributes.POSITION], ['normal',primitive.attributes.NORMAL]]) {
    const accessor = bind(index,gl.ARRAY_BUFFER);
    const attribute = gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 3, accessor.componentType, false, 0, accessor.byteOffset || 0);
  }
  const indices = bind(primitive.indices,gl.ELEMENT_ARRAY_BUFFER);
  const angles = gl.getUniformLocation(program,'angles');
  const scale = gl.getUniformLocation(program,'scale');
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);
  return {
    draw(yaw, pitch, zoom) {
      const canvas = gl.canvas;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1,Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1,Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0,0,width,height);
      const aspect = width / height;
      const base = 0.86 * zoom * Math.min(aspect / 0.75, 1);
      gl.uniform2f(angles,yaw,pitch);
      gl.uniform2f(scale,base/aspect,base);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES,indices.count,indices.componentType,indices.byteOffset || 0);
    },
    dispose() {
      for (const buffer of buffers) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  };
}

class JinyueModel extends HTMLElement {
  connectedCallback() {
    this.classList.add('jy-model');
    this.innerHTML = `
      <div class="jy-model-stage">
        <img class="jy-model-poster" width="760" height="760" loading="lazy" alt="金跃灰模正面，围巾垂在胸前，卷尾从左肩侧露出。">
        <canvas class="jy-model-canvas" tabindex="0" role="group" aria-label="金跃立体模型，方向键旋转，加减键缩放，Home 键复位" hidden></canvas>
        <div class="jy-model-spin" tabindex="0" role="group" aria-label="360° 分帧预览，左右方向键旋转，加减键缩放，Home 键复位" hidden><span class="jy-model-spin-frame"></span></div>
        <video class="jy-model-video" aria-label="金跃灰模转台视频" controls playsinline loop muted preload="none" hidden></video>
      </div>
      <div class="jy-model-bar">
        <p class="jy-model-note" role="status">金跃灰模 · 正面</p>
        <div class="jy-model-actions">
          <button type="button" data-do="start">交互查看</button>
          <button type="button" data-do="left" aria-label="向左旋转" hidden>左转</button>
          <button type="button" data-do="right" aria-label="向右旋转" hidden>右转</button>
          <button type="button" data-do="out" aria-label="缩小模型" hidden>−</button>
          <button type="button" data-do="in" aria-label="放大模型" hidden>＋</button>
          <button type="button" data-do="reset" hidden>复位</button>
          <button type="button" data-do="video">看转台</button>
        </div>
      </div>`;
    this.controller = new AbortController();
    this.stage = this.querySelector('.jy-model-stage');
    this.canvas = this.querySelector('canvas');
    this.spin = this.querySelector('.jy-model-spin');
    this.frame = this.querySelector('.jy-model-spin-frame');
    this.spinLoaded = false;
    this.noWebGL = false;
    this.poster = this.querySelector('img');
    this.poster.src = asset('jinyue-model-poster.webp');
    this.video = this.querySelector('video');
    this.note = this.querySelector('[role="status"]');
    this.mode = 'poster';
    this.yaw = this.pitch = 0;
    this.zoom = 1;
    this.pointers = new Map();
    const on = (element,type,callback,options={}) =>
      element.addEventListener(type,callback,{...options, signal:this.controller.signal});
    on(this, 'click', event => {
      const button = event.target.closest('button[data-do]');
      if (button) this.act(button.dataset.do);
    });
    on(this.stage, 'keydown', event => {
      if (this.mode !== 'model' && this.mode !== 'spin') return;
      const keyActions = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Home:'reset','+':'in','=':'in','-':'out'};
      const action = keyActions[event.key];
      if (action) {event.preventDefault();this.act(action);}
    });
    on(this.stage,'pointerdown',event => {
      if (event.button !== 0 || (this.mode !== 'model' && this.mode !== 'spin')) return;
      this.stage.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, [event.clientX,event.clientY]);
    });
    on(this.stage,'pointermove',event => {
      const previous = this.pointers.get(event.pointerId);
      if (!previous) return;
      const next = [event.clientX,event.clientY];
      if (this.pointers.size === 1) {
        this.yaw += (next[0]-previous[0]) * 0.012;
        if (this.mode === 'model') this.pitch += (next[1]-previous[1]) * 0.012;
      } else if (this.pointers.size === 2) {
        const other = [...this.pointers].find(([id])=>id!==event.pointerId)[1];
        const before = Math.hypot(previous[0]-other[0],previous[1]-other[1]);
        if (before > 2) this.zoom *= Math.hypot(next[0]-other[0],next[1]-other[1]) / before;
      }
      this.pointers.set(event.pointerId,next);
      this.renderPose();
    });
    for (const event of ['pointerup','pointercancel','lostpointercapture']) {
      on(this.stage,event,e=>this.pointers.delete(e.pointerId));
    }
    on(this.canvas,'webglcontextlost',event => {
      event.preventDefault();
      this.mesh = null;
      this.noWebGL = true;
      if (this.mode === 'model' || this.mode === 'loading') this.startSpin();
    });
    if ('ResizeObserver' in window) {
      this.observer = new ResizeObserver(()=>this.renderPose());
      this.observer.observe(this.querySelector('.jy-model-stage'));
    } else on(window,'resize',()=>this.renderPose());
  }

  disconnectedCallback() {
    this.controller.abort();
    this.observer?.disconnect();
    this.mesh?.dispose();
    this.mesh = null;
    this.video.pause();
  }

  setMode(mode, text) {
    this.mode = mode;
    const interactive = mode === 'model' || mode === 'spin';
    this.pointers.clear();
    this.note.textContent = text;
    this.poster.hidden = interactive || mode === 'video';
    this.spin.hidden = mode !== 'spin';
    this.canvas.hidden = mode !== 'model';
    this.video.hidden = mode !== 'video';
    for (const button of this.querySelectorAll('button')) {
      const action = button.dataset.do;
      button.hidden = action === 'start' ? interactive || mode === 'loading'
        : action === 'video' ? mode === 'video' || mode === 'loading'
        : !interactive;
    }
    if (mode !== 'video') this.video.pause();
  }

  renderPose() {
    if (this.mode !== 'model' && this.mode !== 'spin') return;
    this.pitch = limit(this.pitch, -1.2, 1.2);
    this.zoom = limit(this.zoom, 0.65, 2.6);
    if (this.mode === 'spin') {
      const frameNumber = (Math.round(this.yaw * 36 / (Math.PI*2)) % 36 + 36) % 36;
      const column = frameNumber % 9;
      const row = Math.floor(frameNumber/9);
      this.frame.style.backgroundPosition = (column * 100 / 8) + '% ' + (row * 100 / 3) + '%';
      this.frame.style.setProperty('--jy-model-zoom',this.zoom);
    } else this.mesh?.draw(this.yaw,this.pitch,this.zoom);
  }

  async startSpin() {
    this.setMode('loading','正在载入 360° 分帧预览…');
    try {
      if (!this.spinLoaded) {
        const texture = new Image();
        texture.src = asset('jinyue-model-spin.webp');
        await texture.decode();
        if (!this.isConnected) return;
        this.frame.style.backgroundImage = 'url("' + texture.src + '")';
        this.spinLoaded = true;
      }
      this.setMode('spin','360° 分帧预览 · 左右拖动旋转');
      this.renderPose();
      this.spin.focus({preventScroll:true});
    } catch {
      if (this.isConnected) this.showVideo('360° 预览未能载入，可观看转台影像');
    }
  }

  showVideo(text) {
    if (!this.video.getAttribute('src')) this.video.src = asset('turntable.mp4');
    this.setMode('video',text);
    this.video.focus();
  }

  async startModel() {
    if (this.mode === 'loading') return;
    if (this.noWebGL) {await this.startSpin();return;}
    this.setMode('loading','正在载入立体模型…');
    try {
      if (!this.mesh) {
        const gl = this.canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,preserveDrawingBuffer:false});
        if (!gl || gl.isContextLost()) {this.noWebGL = true;await this.startSpin();return;}
        const response = await fetch(asset('jinyue-model.glb'),{signal:this.controller.signal});
        if (!response.ok) throw new Error('Model unavailable');
        this.mesh = loadGeometry(gl,await response.arrayBuffer());
      }
      this.setMode('model','拖动旋转 · 双指缩放');
      this.renderPose();
      this.canvas.focus({preventScroll:true});
    } catch (error) {
      if (error.name !== 'AbortError') {this.noWebGL = true;await this.startSpin();}
    }
  }

  act(action) {
    if (action === 'start') {this.startModel();return;}
    if (action === 'video') {this.showVideo('金跃灰模 · 转台影像');return;}
    if (this.mode !== 'model' && this.mode !== 'spin') return;
    switch(action) {
      case 'left':this.yaw -= Math.PI/8;break;
      case 'right':this.yaw += Math.PI/8;break;
      case 'up':this.pitch -= Math.PI/12;break;
      case 'down':this.pitch += Math.PI/12;break;
      case 'in':this.zoom *= 1.18;break;
      case 'out':this.zoom /= 1.18;break;
      case 'reset':this.yaw=this.pitch=0;this.zoom=1;break;
    }
    this.renderPose();
  }
}
if (!customElements.get('jinyue-model')) customElements.define('jinyue-model',JinyueModel);
