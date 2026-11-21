'use strict';
// The catalog is built after the authored world has finished spawning.
const layoutInit=devInit;
devInit=async function(){
  layoutInit();
  if(window.MP)return;
  const counts=new Map(),entries=[],owners=new Map(),key='frontisle-layout-v1-'+S.seed;
  let active=false,selected=null,group=[],saved={};
  const panel=document.createElement('div'),button=document.createElement('button');
  button.className='btn';button.textContent='구조물 배치';devBar.append(button,panel);
  panel.innerHTML='<small>꾹 눌러 끌기 · 짧게 눌러 회전</small><br><label>방향 <input type="range" min="0" max="360" step="1" style="width:95px"><output></output></label> <button>적용</button> <button>취소</button> <button>항구 전체</button><div></div>';
  panel.hidden=true;
  const angle=panel.querySelector('input'),status=panel.lastElementChild;
  const [apply,cancel,whole]=panel.querySelectorAll('button');
  function record(m,name,opts={}){
    if(!m)return;
    const {x,y,z}=m.position,r=m.rotation.y;
    const base=name+':'+x.toFixed(3)+':'+z.toFixed(3);
    const ordinal=counts.get(base)||0;counts.set(base,ordinal+1);
    const id=base+':'+ordinal;
    const e={id,base,m,name,x,y,z,r,...opts};
    entries.push(e);owners.set(m,e);return e;
  }
  for(const p of PORTS){
    for(const m of p.g.children.slice()){
      if(!m.isMesh)continue;
      const x=m.position.x,z=m.position.z;
      const boat=PBOATS.find(b=>b.m===m),dock=DOCKS.find(d=>Math.hypot(d.x-x,d.z-z)<.01);
      const ferry=boat && structs.find(s=>s.t==='ferry' && s.pi===p.i && Math.hypot(s.x-x,s.z-z)<.1);
      const prop=p.pp?.find(q=>Math.hypot(q[0]-x,q[1]-z)<.01);
      const lamp=p.g.children.find(l=>PLAMPS.includes(l)&&Math.hypot(l.position.x-x,l.position.z-z)<.6);
      record(m,ferry?'항구 배':dock?'부두':'항구 소품',{p,boat,dock,s:ferry,prop,lamp});
    }
    const anchor=new THREE.Object3D();anchor.position.set(p.x,0,p.z);anchor.rotation.y=p.r;
    record(anchor,p.n,{anchor:p,p});
  }
  function registerStruct(s){
    if(s.in||s.t==='ferry'||owners.has(s.m))return;
    const p=PORTS.find(p=>s.pi===p.i || dist(p.x,p.z,s.x,s.z)<(p.town?32:21));
    record(s.m,sdef(s).n||s.t,{s,p});
  }
  structs.forEach(registerStruct);
  for(const m of scene.children)if(m.userData.layoutName){
    const {x,z}=m.position;
    const block=m.userData.layoutBlock||structs.find(s=>dist(x,z,s.x,s.z)<.02 && sdef(s).g==='nil');
    record(m,m.userData.layoutName,{block,dock:DOCKS.find(d=>dist(d.x,d.z,x,z)<.01)});
  }
  function move(e,x,z,r){
    const {m,s,p}=e,dr=r-m.rotation.y,ox=m.position.x,oz=m.position.z;
    if(e.anchor){
      const safe=PORT_SAFE[p.i],a=safe[0]-ox,b=safe[1]-oz;
      safe[0]=x+a*Math.cos(dr)+b*Math.sin(dr);safe[1]=z-a*Math.sin(dr)+b*Math.cos(dr);
      Object.assign(p,{x,z,r,dx:Math.sin(r),dz:Math.cos(r)});
    }
    if(e.dock){
      const d=e.dock;
      for(const bucket of Object.values(DOCKG)){const i=bucket.indexOf(d);if(i>=0)bucket.splice(i,1)}
      DOCKS.splice(DOCKS.indexOf(d),1);e.dock=addDock(x,z,r,d.hw,d.hl,d.y);
    }
    if(e.lamp){const l=e.lamp.position,a=l.x-ox,b=l.z-oz;l.x=x+a*Math.cos(dr)+b*Math.sin(dr);l.z=z-a*Math.sin(dr)+b*Math.cos(dr)}
    if(s){if(s.own&&isZoneT(s.t))homeKey(s);Object.assign(s,{x,z,r});s.m.position.x=x;s.m.position.z=z;s.m.rotation.y=r}
    if(e.block){
      const b=e.block,a=b.x-ox,h=b.z-oz;
      b.x=x+a*Math.cos(dr)+h*Math.sin(dr);b.z=z-a*Math.sin(dr)+h*Math.cos(dr);b.r=(b.r||0)+dr;
      b.m.position.set(b.x,hAt(b.x,b.z),b.z);b.m.rotation.y=b.r;
    }
    if(e.prop){e.prop[0]=x;e.prop[1]=z}
    if(!e.dock&&!e.boat&&!e.anchor)m.position.y=e.y+hAt(x,z)-hAt(e.x,e.z);
    m.position.x=x;m.position.z=z;m.rotation.y=r;
    if(p && m.parent===p.g)scene.attach(m);
  }
  const response=await fetch('assets/world-layout.json');
  if(!response.ok)throw Error('기본 배치를 불러올 수 없어요');
  const published=await response.json();
  if(published.version!==1 || !published.objects || Array.isArray(published.objects))
    throw Error('기본 배치 파일을 확인하세요');
  const defaults=published.seed==null||published.seed===S.seed?published.objects:{};
  try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
  const valid=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
  for(const e of entries){
    const v=valid(saved[e.id])?saved[e.id]:defaults[e.id];
    if(valid(v))move(e,...v);
  }
  const output=document.createElement('button');
  output.textContent='배치 내보내기';
  const upload=document.createElement('a');
  upload.textContent='GitHub에 배치 올리기';
  upload.href='https://github.com/wjdwogh-06/ter-1029/upload/main/assets';
  upload.target='_blank';upload.rel='noopener';
  panel.append(output,document.createTextNode(' '),upload);
  output.onclick=()=>{
    if(!active||!DEV.on)return;
    if(gesture){toast('선택한 구조물을 먼저 적용하거나 취소하세요');return}
    const objects={};
    for(const e of entries){
      const v=saved[e.id]??defaults[e.id];
      if(!e.s?.own&&valid(v))objects[e.id]=v;
    }
    const json=JSON.stringify({version:1,seed:S.seed,objects},null,2);
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='world-layout.json';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
  let gesture=null,frame=0;
  const rotation=angle.parentElement;
  angle.oninput=()=>rotation.querySelector("output").textContent=angle.value+"°";
  function select(e,all=false){
    selected=e;
    group=(all?entries.filter(q=>q.p===e.p):[e]).map(q=>({e:q,x:q.m.position.x,z:q.m.position.z,r:q.m.rotation.y}));
    angle.value=Math.round((e.m.rotation.y*180/Math.PI%360+360)%360);
    angle.oninput();rotation.hidden=apply.hidden=cancel.hidden=false;
    status.textContent=e.name+' 선택';whole.disabled=!e.p;
  }
  let dest;
  function clear(){rotation.hidden=apply.hidden=cancel.hidden=true;selected=null;group=[];dest=null;status.textContent='구조물 선택';whole.disabled=true}
  function close(){abortDrag();clear();active=false;panel.hidden=true;button.textContent='구조물 배치'}
  button.onclick=()=>{if(active)return close();if(!DEV.on)return;structs.forEach(registerStruct);clear();active=true;panel.hidden=false;button.textContent='배치 종료'};
  cancel.onclick=clear;
  whole.onclick=()=>{if(selected?.p){dest=null;select(entries.find(q=>q.anchor===selected.p),true);status.textContent="항구 시설을 꾹 눌러 함께 이동"}};
  apply.onclick=()=>commit(+angle.value*Math.PI/180);
  function commit(radians){
    if(!active||!DEV.on||!selected||!Number.isFinite(radians))return;
    const pos=selected.m.position,[x,z]=dest||[pos.x,pos.z],rot=radians-selected.m.rotation.y;
    const ox=pos.x,oz=pos.z,c=Math.cos(rot),sn=Math.sin(rot);
    for(const q of group){
      const a=q.x-ox,b=q.z-oz,v=[x+a*c+b*sn,z-a*sn+b*c,q.r+rot];
      move(q.e,...v);if(!q.e.s?.own)saved[q.e.id]=v;
    }
    try{localStorage.setItem(key,JSON.stringify(saved));save();clear();toast('배치를 저장했어요')}catch{toast('이 기기에 배치를 저장하지 못했어요')}
  };
  function restore(){
    if(!gesture?.drag)return;
    for(const q of group){q.e.m.position.x=q.x;q.e.m.position.z=q.z}
  }
  function abortDrag(){
    if(!gesture)return;
    clearTimeout(gesture.timer);cancelAnimationFrame(frame);frame=0;restore();gesture=null;
  }
  function preview(){
    frame=0;
    const g=gesture;if(!g?.drag)return;
    const at=groundAt(g.mx,g.my);if(!at)return;
    const dx=at[0]-g.origin[0],dz=at[1]-g.origin[1];
    for(const q of group){q.e.m.position.x=q.x+dx;q.e.m.position.z=q.z+dz}
    dest=[g.baseX+dx,g.baseZ+dz];
  }
  function stop(ev){ev.preventDefault();ev.stopImmediatePropagation()}
  window.addEventListener('pointerdown',ev=>{
    if(!active||!DEV.on||mode!=='play'||ev.target!==cv||gesture)return;
    if([joyC(),rjC()].some(([x,y,r])=>Math.hypot(ev.clientX-x,ev.clientY-y)<r*1.5))return;
    _ray.setFromCamera({x:ev.clientX/innerWidth*2-1,y:1-ev.clientY/innerHeight*2},cam);
    const hits=_ray.intersectObjects(entries.filter(e=>!e.anchor&&e.m.parent&&e.m.visible).map(e=>e.m),true);
    let hit;for(const h of hits){let m=h.object;while(m&&!owners.has(m))m=m.parent;if(m){hit=owners.get(m);break}}
    if(!hit)return;
    stop(ev);cv.setPointerCapture(ev.pointerId);
    const g=gesture={id:ev.pointerId,x:ev.clientX,y:ev.clientY,mx:ev.clientX,my:ev.clientY,hit};
    g.timer=setTimeout(()=>{
      if(gesture!==g||!DEV.on||!active)return;
      g.origin=groundAt(g.x,g.y);if(!g.origin)return;
      if(!(selected?.anchor&&selected.p===hit.p))select(hit);
      g.baseX=selected.m.position.x;g.baseZ=selected.m.position.z;
      g.drag=true;rotation.hidden=apply.hidden=cancel.hidden=true;
      status.textContent=selected.name+' 이동 중';
    },360);
  },true);
  window.addEventListener('pointermove',ev=>{
    const g=gesture;if(g?.id!==ev.pointerId)return;stop(ev);
    g.mx=ev.clientX;g.my=ev.clientY;
    if(!g.drag && Math.hypot(g.mx-g.x,g.my-g.y)>10){clearTimeout(g.timer);g.slipped=true}
    if(g.drag&&!frame)frame=requestAnimationFrame(preview);
  },true);
  window.addEventListener('pointerup',ev=>{
    const g=gesture;if(g?.id!==ev.pointerId)return;stop(ev);
    if(!active||!DEV.on){abortDrag();clear();return}
    if(g.drag){
      g.mx=ev.clientX;g.my=ev.clientY;cancelAnimationFrame(frame);preview();abortDrag();
      // Moving never rounds the object's existing angle.
      const old=selected.m.rotation.y;
      commit(old);
    }else{abortDrag();if(!g.slipped){dest=null;select(g.hit)}}
  },true);
  for(const type of ['pointercancel','lostpointercapture'])window.addEventListener(type,ev=>{
    if(gesture?.id===ev.pointerId){abortDrag();clear()}
  },true);
  window.addEventListener('blur',()=>{if(gesture){abortDrag();clear()}});
  const prev=devHud;devHud=function(){prev();if(active&&!DEV.on)close()};
};
