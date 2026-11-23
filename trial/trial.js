const $=id=>document.getElementById(id);
const fields=[['sent','发送成功'],['read','缩略图可读'],['open','接收端可打开'],['saved','接收后可保存'],['loop','动画持续循环']];
const priority=['T03','T07','T15','T27','G19'];
const storageKey='jinyue-device-test-1';
let records={};
try {const stored=JSON.parse(localStorage.getItem(storageKey)||'{}');if(stored&&typeof stored==='object'&&!Array.isArray(stored))records=stored;} catch {}
let visible=priority.map(id=>items.find(item=>item.id===id));
let current,prepared=null,loadToken=0,dirty=false;
function switchAllowed(){return !dirty||confirm('此项有未保存的记录，继续切换？');}
function showList(list,id){visible=list;$('item').replaceChildren(...list.map(e=>new Option(e.label,e.id)));selectItem(id||list[0].id);}
function progress(){
 const saved=items.filter(e=>records[e.id]?.date).length;
 const complete=items.filter(e=>fields.filter(([key])=>key!=='loop'||e.gif).every(([key])=>['通过','异常'].includes(records[e.id]?.[key]))).length;
 $('progress').textContent='32 张浅底、32 张透明细边、8 张二维动态、6 张三维动态。已记录 '+saved+' / '+items.length+' 项，其中 '+complete+' 项已填写全部适用检查。';
}
function selectItem(id){
 current=items.find(e=>e.id===id);$('item').value=id;dirty=false;const record=records[id]||{};
 for(const k of ['sender','receiver','channel','notes'])$(k).value=record[k]||'';
 $('checks').replaceChildren();
 for(const [key,name] of fields){
  if(key==='loop'&&!current.gif)continue;
  const label=document.createElement('label');label.htmlFor=key;label.textContent=name;
  const sel=document.createElement('select');sel.id=key;sel.append(...['待测','通过','异常'].map(v=>new Option(v,v)));sel.value=record[key]||'待测';$('checks').append(label,sel);
 }
 for(const key of ['light','dark']){$(key).src=current.src;$(key).alt=current.label;}
 $('download').href=current.src;$('download').download=current.filename;
 const ix=visible.findIndex(e=>e.id===id);$('prev').disabled=ix===0;$('next').disabled=ix===visible.length-1;
 $('status').textContent=record.date?'上次记录 '+new Date(record.date).toLocaleString():'此项尚无实测记录。';progress();
 prepareFile(current);
}
async function prepareFile(e){
 const token=++loadToken;prepared=null;$('share').hidden=true;$('share').style.display='none';$('shareStatus').textContent='可下载文件后，在测试会话中作为图片发送。';
 if(!navigator.canShare||!navigator.share||location.protocol==='file:')return;
 try{
  const response=await fetch(e.src);if(!response.ok)throw Error();
  const file=new File([await response.blob()],e.filename,{type:e.gif?'image/gif':'image/png'});
  if(token!==loadToken||!navigator.canShare({files:[file]}))return;
  prepared=file;$('share').hidden=false;$('share').style.display='';$('shareStatus').textContent='可调用系统分享面板，选择自己的测试会话。';
 }catch{}
}
$('share').onclick=async()=>{if(!prepared)return;const token=loadToken;try{await navigator.share({files:[prepared]});if(token===loadToken)$('shareStatus').textContent='已返回试发台，请在接收端确认后填写记录。';}catch(e){if(token===loadToken)$('shareStatus').textContent=e.name==='AbortError'?'已退出系统分享。':'当前应用未能分享此文件，请先下载。';}};
$('save').onclick=()=>{
 const r={};for(const k of ['sender','receiver','channel','notes',...fields.map(f=>f[0])])if($(k))r[k]=$(k).value.trim();
 if(!fields.some(([k])=>r[k]==='通过'||r[k]==='异常')){$('status').textContent='请至少填写一项已观察到的结果。';return;}
 r.date=new Date().toISOString();records[current.id]=r;dirty=false;progress();
 try{localStorage.setItem(storageKey,JSON.stringify(records));$('status').textContent='已保存在此浏览器。';}catch{$('status').textContent='本浏览器未允许持久保存，请立即导出 CSV。';}
};
function goStep(step){if(!switchAllowed())return;const i=visible.indexOf(current)+step;if(visible[i])selectItem(visible[i].id);}
$('prev').onclick=()=>goStep(-1);$('next').onclick=()=>goStep(1);
$('item').onchange=()=>{const id=$('item').value;if(switchAllowed())selectItem(id);else $('item').value=current.id;};
$('priority').onclick=()=>{if(switchAllowed())showList(priority.map(id=>items.find(e=>e.id===id)));};
$('all').onclick=()=>{if(switchAllowed())showList(items,current.id);};
document.querySelectorAll('.panel')[1].addEventListener('input',()=>dirty=true);
window.addEventListener('beforeunload',ev=>{if(dirty){ev.preventDefault();ev.returnValue='';}});
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
$('export').onclick=()=>{
 const rows=[['编号','文件','发送端','接收端','渠道',...fields.map(f=>f[1]),'备注','记录时间 UTC']];
 for(const e of items){const r=records[e.id]||{};rows.push([e.id,e.filename,r.sender,r.receiver,r.channel,...fields.map(([k])=>k==='loop'&&!e.gif?'不适用':r[k]||'待测'),r.notes,r.date]);}
 const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='金跃_收发记录_'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
};
$('trans').onclick=()=>{if(switchAllowed())showList(items.filter(e=>e.id.startsWith('T')));};
const facialItems=items.filter(e=>e.id.startsWith('F'));
$('facial').onclick=()=>{if(switchAllowed())showList(facialItems);};
const initial=new URLSearchParams(location.search).get('item');
const direct=items.find(e=>e.id===initial);
if(direct)showList(items.filter(e=>e.id[0]===direct.id[0]),direct.id);
else showList(visible);
