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
  const history=[];
  const undo=document.createElement('button');
  undo.textContent='↶ 되돌리기';undo.disabled=true;
  function options(label,values,initial,suffix){
    const wrap=document.createElement('label'), select=document.createElement('select');
    wrap.append(label,select);panel.append(wrap);
    for(const n of values)select.add(new Option(n?n+suffix:'자유',String(n)));
    let stored;try{stored=localStorage.getItem('layout-setting-'+label)}catch{}
    select.value=String(stored!==null && stored!==undefined && values.includes(+stored)?+stored:initial);
    select.addEventListener('change',()=>{try{localStorage.setItem('layout-setting-'+label,select.value)}catch{}});
    return select;
  }
  const spacing=options('이동 간격',[0,.1,.25,.5,1,2.5,5],.5,'m');
  const turnStep=options('회전 간격',[1,5,15,45,90],1,'°');
  panel.append(undo);
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
  // Keep the exact objects for undo, including their gameplay registrations.
  function setDeleted(e,deleted){
    if(Boolean(e.reinstate)===deleted)return;
    if(!deleted){
      for(const restore of e.reinstate.reverse())restore();
      delete e.reinstate;return;
    }
    const restore=e.reinstate=[];
    function detach(node){
      if(!node?.parent)return;
      const parent=node.parent;parent.remove(node);restore.push(()=>parent.add(node));
    }
    function drop(list,item){
      if(!list||!item)return;
      const i=list.indexOf(item);if(i<0)return;
      list.splice(i,1);restore.push(()=>list.splice(Math.min(i,list.length),0,item));
    }
    function detachStruct(s){
      if(!s||!structs.includes(s))return;
      detach(s.m);detach(s.zg);
      for(const list of [structs,lightsrc,warmsrc,POI.lhS])drop(list,s);
    }
    if(e.s?.own&&isZoneT(e.s.t)){
      const hk=homeKey(e.s);
      for(const item of structs.filter(q=>q.in&&q.hk===hk))detachStruct(item);
    }
    detachStruct(e.s);detachStruct(e.block);
    detach(e.m);detach(e.lamp);drop(PLAMPS,e.lamp);
    drop(PBOATS,e.boat);drop(e.p?.pp,e.prop);
    if(e.dock){
      drop(DOCKS,e.dock);
      for(const bucket of Object.values(DOCKG))drop(bucket,e.dock);
    }
    if(e.s && target?.s===e.s)target=null;
  }
  const deletedValue=v=>v?.deleted===true;
  const response=await fetch('assets/world-layout.json');
  if(!response.ok)throw Error('기본 배치를 불러올 수 없어요');
  const published=await response.json();
  if(published.version!==1 || !published.objects || Array.isArray(published.objects))
    throw Error('기본 배치 파일을 확인하세요');
  const defaults=published.seed==null||published.seed===S.seed?published.objects:{};
  try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
  const valid=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
  for(const e of entries){
    const v=saved[e.id]??defaults[e.id];
    if(deletedValue(v)){setDeleted(e,true);continue}
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
      if(!e.s?.own&&(valid(v)||deletedValue(v)))objects[e.id]=v;
    }
    const json=JSON.stringify({version:1,seed:S.seed,objects},null,2);
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='world-layout.json';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
  let gesture=null,frame=0;
  const rotation=angle.parentElement;
  const turnButtons=[];
  for(const [label,sign,fine] of [['↶ 왼쪽',-1,false],['오른쪽 ↷',1,false],['왼쪽 1°',-1,true],['오른쪽 1°',1,true]]){
    const b=document.createElement('button');b.textContent=label;
    rotation.after(b);turnButtons.push(b);
    b.onclick=()=>{angle.value=(+angle.value+sign*(fine?1:+turnStep.value)+360)%360;angle.oninput()};
  }
  const resetOne=document.createElement('button'),resetAll=document.createElement('button');
  resetOne.textContent='선택 원위치';resetAll.textContent='기본 맵 전체 원위치';
  panel.append(resetOne,resetAll);turnButtons.push(resetOne);
  const remove=document.createElement('button');remove.textContent='선택 삭제';
  panel.append(remove);turnButtons.push(remove);
  remove.onclick=()=>{
    if(!active||!DEV.on||gesture||!selected||selected.anchor)return;
    if(!window.confirm(selected.name+' 삭제할까요?'))return;
    resetModels();
    const e=selected;
    remember([{e,x:e.m.position.x,z:e.m.position.z,r:e.m.rotation.y,deleted:false,override:saved[e.id]}]);
    setDeleted(e,true);
    if(!e.s?.own)saved[e.id]={deleted:true};
    persist('삭제했어요 · 되돌리기로 복구할 수 있어요');
  };
  resetOne.onclick=()=>restoreOriginal(group.map(q=>q.e));
  resetAll.onclick=()=>{
    if(active&&DEV.on&&!gesture&&window.confirm('기본 맵 구조물 전체를 최초 위치와 방향으로 되돌릴까요?'))
      restoreOriginal(entries.filter(e=>!e.s?.own));
  };
  function restoreOriginal(targets){
    if(!active||!DEV.on||gesture)return;
    resetModels();
    const before=[];
    for(const e of targets){
      if(!e.reinstate&&e.s&&!structs.includes(e.s))continue;
      const p=e.m.position;
      if(!e.reinstate&&Math.abs(p.x-e.x)<1e-7&&Math.abs(p.z-e.z)<1e-7&&Math.abs(e.m.rotation.y-e.r)<1e-7)continue;
      before.push({e,x:p.x,z:p.z,r:e.m.rotation.y,deleted:!!e.reinstate,override:saved[e.id]});
      setDeleted(e,false);
      move(e,e.x,e.z,e.r);
      if(!e.s?.own){
        if(valid(defaults[e.id])||deletedValue(defaults[e.id]))saved[e.id]=[e.x,e.z,e.r];
        else delete saved[e.id];
      }
    }
    if(!before.length){clear();toast('이미 원래 자리예요');return}
    remember(before);persist('원래 위치와 방향으로 복원했어요');
  }
  function pivot(){return group.find(q=>q.e===selected)}
  function resetModels(){
    for(const q of group){q.e.m.position.x=q.x;q.e.m.position.z=q.z;q.e.m.rotation.y=q.r}
  }
  function showAngle(){rotation.querySelector('output').textContent=angle.value+'°'}
  angle.step=1;
  angle.oninput=()=>{
    if(!selected)return;
    showAngle();
    const p=pivot(),dr=(+angle.value)*Math.PI/180-p.r,c=Math.cos(dr),sn=Math.sin(dr);
    for(const q of group){
      const dx=q.x-p.x,dz=q.z-p.z;
      q.e.m.position.x=p.x+dx*c+dz*sn;q.e.m.position.z=p.z-dx*sn+dz*c;q.e.m.rotation.y=q.r+dr;
    }
  };
  function select(e,all=false){
    resetModels();selected=e;
    group=(all?entries.filter(q=>q.p===e.p&&!q.reinstate):[e]).map(q=>({e:q,x:q.m.position.x,z:q.m.position.z,r:q.m.rotation.y}));
    angle.value=Math.round((e.m.rotation.y*180/Math.PI%360+360)%360);
    showAngle();turnButtons.forEach(b=>b.hidden=false);rotation.hidden=apply.hidden=cancel.hidden=false;
    status.textContent=e.name+' 선택';whole.disabled=!e.p;remove.disabled=!!e.anchor;
  }
  let dest;
  function clear(){turnButtons.forEach(b=>b.hidden=true);rotation.hidden=apply.hidden=cancel.hidden=true;selected=null;group=[];dest=null;status.textContent='구조물 선택';whole.disabled=true}
  function close(){abortDrag();resetModels();clear();active=false;panel.hidden=true;button.textContent='구조물 배치'}
  button.onclick=()=>{if(active)return close();if(!DEV.on)return;structs.forEach(registerStruct);clear();active=true;panel.hidden=false;button.textContent='배치 종료'};
  cancel.onclick=()=>{resetModels();clear()};
  whole.onclick=()=>{if(selected?.p){dest=null;select(entries.find(q=>q.anchor===selected.p),true);status.textContent="항구 시설을 꾹 눌러 함께 이동"}};
  apply.onclick=()=>commit(+angle.value*Math.PI/180);
  function commit(radians){
    if(!active||!DEV.on||!selected||!Number.isFinite(radians))return;
    resetModels();
    const before=group.map(q=>({...q,override:saved[q.e.id]}));
    const pos=selected.m.position,[x,z]=dest||[pos.x,pos.z],rot=radians-selected.m.rotation.y;
    const ox=pos.x,oz=pos.z,c=Math.cos(rot),sn=Math.sin(rot);
    for(const q of group){
      const a=q.x-ox,b=q.z-oz,v=[x+a*c+b*sn,z-a*sn+b*c,q.r+rot];
      move(q.e,...v);if(!q.e.s?.own)saved[q.e.id]=v;
    }
    remember(before);persist();
  }
  function remember(before){
    history.push(before);if(history.length>100)history.shift();undo.disabled=false;
  }
  undo.onclick=()=>{
    if(!active||!DEV.on||gesture||!history.length)return;
    resetModels();clear();
    for(const q of history.pop()){
      if(!q.e.reinstate&&q.e.s&&!structs.includes(q.e.s))continue;
      setDeleted(q.e,false);
      move(q.e,q.x,q.z,q.r);
      if(q.deleted)setDeleted(q.e,true);
      if(q.override===undefined)delete saved[q.e.id];else saved[q.e.id]=q.override;
    }
    undo.disabled=!history.length;persist('이전 배치로 되돌렸어요');
  };
  function persist(message='배치를 저장했어요'){
    try{localStorage.setItem(key,JSON.stringify(saved));save();clear();toast(message)}catch{toast('이 기기에 배치를 저장하지 못했어요')}
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
    const step=+spacing.value,snap=v=>step?Math.round(v/step)*step:v;
    const dx=snap(g.baseX+at[0]-g.origin[0])-g.baseX,dz=snap(g.baseZ+at[1]-g.origin[1])-g.baseZ;
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
      resetModels();turnButtons.forEach(b=>b.hidden=true);
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
