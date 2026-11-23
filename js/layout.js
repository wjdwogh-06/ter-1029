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
  panel.className='layout-controls';
  const style=document.createElement('style');
  style.textContent=`
    #devbar{box-sizing:border-box;max-height:calc(100% - 194px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y}
    @media(max-height:540px){#devbar{top:8px!important;max-height:calc(100% - 16px)}}
    #devbar.layout-open{top:8px!important;left:8px!important;width:min(295px,53%);max-height:calc(100% - 16px)}
    #devbar.layout-open>div:not(.layout-controls){display:none!important}
    #devbar .layout-controls:not([hidden]){display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding:6px 0}
    .layout-controls [hidden],.layout-controls br{display:none!important}
    .layout-controls button,.layout-controls select{min-height:34px;max-width:100%;font:inherit}
    .layout-controls label,.layout-controls small,.layout-controls output{max-width:100%}
    .layout-controls>div,.layout-controls>small{width:100%}
    .layout-controls .layout-delete{color:#8c2720;font-weight:800}
  `;
  document.head.append(style);
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
    if(s.in||s.t==='ferry'||s.li?.startsWith?.('add:')||owners.has(s.m)||sdef(s)?.g==='nil')return;
    const p=PORTS.find(p=>s.pi===p.i || dist(p.x,p.z,s.x,s.z)<(p.town?32:21));
    record(s.m,sdef(s).n||s.t,{s,p});
  }
  structs.forEach(registerStruct);
  for(const m of scene.children)if(m.userData.layoutName){
    const {x,z}=m.position;
    const block=m.userData.layoutBlock||structs.find(s=>dist(x,z,s.x,s.z)<.02 && sdef(s).g==='nil');
    record(m,m.userData.layoutName,{blocks:m.userData.layoutBlocks||(block?[block]:[]),dock:DOCKS.find(d=>dist(d.x,d.z,x,z)<.01)});
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
    for(const b of e.blocks||[]){
      const a=b.x-ox,h=b.z-oz;
      b.x=x+a*Math.cos(dr)+h*Math.sin(dr);b.z=z-a*Math.sin(dr)+h*Math.cos(dr);b.r=(b.r||0)+dr;
      b.m.position.set(b.x,hAt(b.x,b.z),b.z);b.m.rotation.y=b.r;
    }
    if(e.prop){e.prop[0]=x;e.prop[1]=z}
    if(!e.dock&&!e.boat&&!e.anchor)m.position.y=e.y+hAt(x,z)-hAt(e.x,e.z);
    m.position.x=x;m.position.z=z;m.rotation.y=r;
    try{dressDirty(ox,oz,7);dressDirty(x,z,7)}catch{}   // 71차: 풀·꽃 장식도 바로 다시(옮긴 자리·원래 자리)
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
    detachStruct(e.s);for(const b of e.blocks||[])detachStruct(b);
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
  const templates=new Map();
  const modelLabels={rowboat:'노 젓는 배',fboat:'항구 연락선',sailboat:'돛단배',praft:'뗏목',plamp:'항구 가로등',pcrane:'항구 기중기',pnet:'어망',prack:'항구 건조대',pstack:'항구 적재물',
    ammostack:'탄약 더미',chute:'낙하산',jerry:'연료통',lk_gen:'발전기',lk_pallet:'목재 팔레트',pallet:'팔레트',radio:'무전기',sbagArc:'모래주머니 방벽',
    supsign:'보급지 표지판',suptent:'보급 천막',tarppile:'방수포 더미',flarecan:'신호탄',lk_drum_0:'드럼통 A',lk_drum_1:'드럼통 B',lk_drum_2:'드럼통 C',flag_blue:'파란 깃발'};
  for(const e of entries){
    if(!e.m.isMesh||(!e.m.userData.layoutName&&!e.p))continue;
    const known=Object.keys(GEO).find(k=>GEO[k]===e.m.geometry)||Object.keys(PGEO).find(k=>PGEO[k]===e.m.geometry);
    const name=modelLabels[known]||(e.dock?'부두 '+(e.dock.hw*2).toFixed(1)+' × '+(e.dock.hl*2).toFixed(1)+'m':e.name);
    const type='model:'+ (known||e.id);
    if(templates.has(type))continue;
    templates.set(type,{name,geometry:e.m.geometry,material:e.m.material,scale:e.m.scale.clone(),
      height:e.y-(e.boat||e.dock?0:hAt(e.x,e.z)),angle:e.r,boat:e.boat,dock:e.dock,
      radius:e.prop?.[2],ferry:e.s?.t==='ferry',blocks:(e.blocks||[]).map(b=>({t:b.t,x:b.x-e.x,z:b.z-e.z,r:b.r||0}))});
  }
  for(const e of entries){
    const v=saved[e.id]??defaults[e.id];
    if(deletedValue(v)){setDeleted(e,true);continue}
    if(valid(v))move(e,...v);
  }
  const propNames={cfence:'철조망',vend:'자판기',recycle:'재활용함',market:'상점',fbuy:'생선 판매대',supply:'보급 상자',chest:'보물 상자',barrel:'통',crate:'나무 상자',well:'우물',towerB:'파란 감시탑',towerR:'빨간 감시탑',home_A:'오두막 A',home_B:'오두막 B',rack:'건조대',flagR:'빨간 깃발',flagB:'파란 깃발',suplamp:'보급지 조명'};
  const catalog=new Map();
  for(const [t,label] of Object.entries(propNames)){
    if(DECO[t]&&GEO[DECO[t].g])catalog.set(t,label);
  }
  for(const [t,b] of Object.entries(BUILDS)){
    if(!b.indoor&&b.n&&GEO[b.g])catalog.set(t,b.n);
  }
  const labels={blacksmith:'대장간',forge:'대장간 (구형)',windmill:'풍차',tavern:'여관',lumbermill:'제재소',loot:'전리품 상자',target:'과녁',ruin:'폐건물',lighthouse:'등대',bunker:'벙커',lumber:'목재 더미',sackD:'자루',wheel:'손수레',dock:'부두',tent:'천막',sp_cont2:'청록 컨테이너'};
  for(const [t,d] of Object.entries(DECO)){
    if(!GEO[d.g]||d.g==='nil'||t==='spring'||catalog.has(t))continue;
    catalog.set(t,labels[t]||d.cat||d.n||t);
  }
  for(const [type,v] of templates)catalog.set(type,v.name);
  function spawn(id,t,origin){
    const [x,z,r]=origin;
    const port=PORTS.reduce((best,p)=>!best||dist(x,z,p.x,p.z)<dist(x,z,best.x,best.z)?p:best,null);
    const v=templates.get(t);
    if(v){
      const m=mesh(v.geometry,v.material),dr=r-v.angle,c=Math.cos(dr),sn=Math.sin(dr);
      m.scale.copy(v.scale);m.position.set(x,(v.boat||v.dock?0:hAt(x,z))+v.height,z);m.rotation.y=r;scene.add(m);
      const blocks=v.blocks.map(b=>addStruct({t:b.t,x:x+c*b.x+sn*b.z,z:z-sn*b.x+c*b.z,r:b.r+dr}));
      const boat=v.boat&&{m,y:v.height,ph:0,p:port};if(boat)PBOATS.push(boat);
      const dock=v.dock&&addDock(x,z,r,v.dock.hw,v.dock.hl,v.dock.y);
      const s=v.ferry&&addStruct({t:'ferry',x,z,r,pi:port.i,hp:1e9});
      const prop=port&&v.radius?[x,z,v.radius]:null;if(prop)(port.pp||=[]).push(prop);
      return record(m,v.name,{id,added:t,blocks,boat,dock,s,prop,p:port});
    }
    const s=addStruct({t,x,z,r,li:id,pi:port?.i??0});
    const e=record(s.m,catalog.get(t),{id,s,added:t,p:port&&dist(x,z,port.x,port.z)<(port.town?32:21)?port:null});
    return e;
  }
  for(const [id,v] of Object.entries({...defaults,...saved})){
    if(!id.startsWith('add:')||!catalog.has(v?.type)||!valid(v.origin)||!valid(v.pose))continue;
    const e=spawn(id,v.type,v.origin);move(e,...v.pose);
  }
  const picker=document.createElement('select'),add=document.createElement('button');
  picker.setAttribute('aria-label','추가할 구조물');
  const variants=new Map();
  for(const [type,name] of catalog){
    const number=(variants.get(name)||0)+1;variants.set(name,number);
    picker.add(new Option(number===1?name:name+' '+number,type));
  }
  let pending=null;
  function adding(type){
    pending=type;add.textContent=type?'추가 취소':'구조물 추가';
    if(type)status.textContent=catalog.get(type)+' 놓을 곳을 탭하세요';
  }
  adding(null);panel.append(picker,add);
  add.onclick=()=>{
    if(!active||!DEV.on||gesture)return;
    resetModels();clear();adding(pending?null:picker.value);
  };
  picker.onchange=()=>{if(pending)adding(picker.value)};
  const output=document.createElement('button');
  output.textContent='배치 내보내기';
  const upload=document.createElement('a');
  upload.textContent='GitHub에 배치 올리기';
  upload.href='https://github.com/wjdwogh-06/ter-1029/upload/main/assets';
  upload.target='_blank';upload.rel='noopener';
  const copyBtn=document.createElement('button');copyBtn.textContent='📋 배치 복사';
  panel.append(output,document.createTextNode(' '),copyBtn,document.createTextNode(' '),upload);
  /* 71차: 배치 글 만들기(내보내기·복사가 같이 씀). 📋 배치 복사 → Claude에게 붙여 넣으면 assets/world-layout.json에 넣어 정식 게임에 올려요 */
  const layoutJson=(pretty=true)=>{const objects={};
    for(const e of entries){const v=saved[e.id]??defaults[e.id];if(e.added){if(!e.reinstate&&v?.type)objects[e.id]=v}else if(!e.s?.own&&(valid(v)||deletedValue(v)))objects[e.id]=v}
    return JSON.stringify({version:1,seed:S.seed,objects},null,pretty?2:0)};
  copyBtn.onclick=async()=>{
    if(!active||!DEV.on)return;
    if(gesture){toast('선택한 구조물을 먼저 적용하거나 취소하세요');return}
    const n=Object.keys(JSON.parse(layoutJson(false)).objects).length,t='LAYOUT1:'+layoutJson(false);
    try{await navigator.clipboard.writeText(t);toast('배치 '+n+'개를 복사했어요 — Claude에게 붙여 넣어 보내면 정식 게임에 넣어 드려요')}
    catch{if(typeof creCopyBox==='function')creCopyBox(t);else prompt('이 글을 길게 눌러 복사하세요',t)}
  };
  output.onclick=()=>{
    if(!active||!DEV.on)return;
    if(gesture){toast('선택한 구조물을 먼저 적용하거나 취소하세요');return}
    const objects={};
    for(const e of entries){
      const v=saved[e.id]??defaults[e.id];
      if(e.added){
        if(!e.reinstate&&v?.type)objects[e.id]=v;
      }else if(!e.s?.own&&(valid(v)||deletedValue(v)))objects[e.id]=v;
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
  remove.className='layout-delete';remove.disabled=true;panel.prepend(remove,undo);
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
      restoreOriginal(entries.filter(e=>!e.s?.own),true);
  };
  function restoreOriginal(targets,all=false){
    if(!active||!DEV.on||gesture)return;
    resetModels();
    const before=[];
    for(const e of targets){
      if(!e.reinstate&&e.s&&!structs.includes(e.s))continue;
      const p=e.m.position;
      if(all&&e.added){
        if(!e.reinstate){
          before.push({e,x:p.x,z:p.z,r:e.m.rotation.y,override:saved[e.id]});
          setDeleted(e,true);saved[e.id]={deleted:true};
        }
        continue;
      }
      if(!e.reinstate&&Math.abs(p.x-e.x)<1e-7&&Math.abs(p.z-e.z)<1e-7&&Math.abs(e.m.rotation.y-e.r)<1e-7)continue;
      before.push({e,x:p.x,z:p.z,r:e.m.rotation.y,deleted:!!e.reinstate,override:saved[e.id]});
      setDeleted(e,false);
      move(e,e.x,e.z,e.r);
      if(!e.s?.own){
        if(e.added||valid(defaults[e.id])||deletedValue(defaults[e.id]))saved[e.id]=[e.x,e.z,e.r];
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
  /* 71차(디자인, 기획자 요청): 구조물 하나씩 알아보기 — 이름 '지역 · 종류 번호'(원래 자리로 정해서 옮겨도 그대로, 위 상태 줄),
     배치 중 가까운 구조물 위에 '종류 번호' 이름표, 고른 것은 주황 이름표(지역까지) + 바닥 주황 고리, [🏷 이름표] 켜기·끄기 */
  const kindOf=e=>modelLabels[e.name]||DECO[e.s?.t]?.n||propNames[e.s?.t]||catalog.get(e.added)||e.name;
  const PLACES71=[['수달섬',typeof OTR!=='undefined'?OTR.x:0,typeof OTR!=='undefined'?OTR.z:0,50],['낚시 캠프',137,135,34],['식물섬',88.5,665.5,48],['특수 보급지',718,845,30]];
  const areaOf=(x,z)=>{let b=null,bd=1e9;for(const p of PORTS){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p}}if(b&&bd<48)return b.n;
    for(const [n,px,pz,r] of PLACES71)if(Math.hypot(px-x,pz-z)<r)return n;
    if(typeof SUPS!=='undefined')for(const q of SUPS)if(q&&Math.hypot(q.x-x,q.z-z)<26)return '보급지 S'+q.i;
    return Math.round(x)+'·'+Math.round(z)};
  let tagN=-1;
  function retag(){tagN=entries.length;const g=new Map();
    for(const e of entries){const a=areaOf(e.x,e.z),k=kindOf(e),key=a+'|'+k;e._a=a;e._k=k;if(!g.has(key))g.set(key,[]);g.get(key).push(e)}
    for(const L of g.values()){L.sort((p,q)=>p.z-q.z||p.x-q.x);L.forEach((e,i)=>{e.tagS=e._k+(L.length>1?' '+(i+1):'');e.tag=e._a+' · '+e.tagS})}}
  const tagOf=e=>{if(tagN!==entries.length)retag();return e.tag||kindOf(e)};
  let tagsOn=true;try{tagsOn=localStorage.getItem('layout-tags')!=='0'}catch{}
  const tagBtn=document.createElement('button');const tagTx=()=>tagBtn.textContent=tagsOn?'🏷 이름표 끄기':'🏷 이름표 켜기';tagTx();
  tagBtn.onclick=()=>{tagsOn=!tagsOn;tagTx();try{localStorage.setItem('layout-tags',tagsOn?'1':'0')}catch{}};
  panel.insertBefore(tagBtn,status);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,40),new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:.9,depthTest:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.renderOrder=9;ring.visible=false;scene.add(ring);
  const sizeOf=e=>{if(e._r)return e._r;let r=.8,h=1.4;const sd=e.s&&sdef(e.s);if(sd&&sd.bx)r=Math.max(sd.bx,sd.bz);
    const g=e.m.geometry;if(g){if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,sc=e.m.scale.x||1;if(!sd||!sd.bx)r=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2*sc;h=b.max.y*sc}
    e._r=Math.max(.45,Math.min(r,9));e._h=Math.max(.6,Math.min(h,8));return e._r};
  {const _df=drawFx;drawFx=function(dt){_df(dt);try{
    const on=active&&DEV.on&&mode==='play';ring.visible=!!(on&&selected&&selected.m.parent);
    if(ring.visible){const m=selected.m,r=sizeOf(selected)+.35;ring.position.set(m.position.x,groundY(m.position.x,m.position.z)+.06,m.position.z);ring.scale.setScalar(r)}
    if(!on||!tagsOn)return;const c=fctx,k=Math.max(.8,UIS*1.1),near=[];
    for(const e of entries){const m=e.m;if(!m.parent||!m.visible)continue;const d=Math.hypot(m.position.x-P.x,m.position.z-P.z);if(d<26||e===selected)near.push([d,e])}
    near.sort((a,b)=>a[0]-b[0]);const used=[];let n=0;
    for(const [d,e] of near){if(n>=34&&e!==selected)continue;const m=e.m;sizeOf(e);const p=scr(m.position.x,m.position.y+e._h+.35,m.position.z);if(!p[2]||p[0]<-40||p[0]>innerWidth+40||p[1]<-20||p[1]>innerHeight+20)continue;
      const sel=e===selected;if(!sel&&used.some(q=>Math.abs(q[0]-p[0])<70*k&&Math.abs(q[1]-p[1])<17*k))continue;used.push(p);n++;
      tagOf(e);uiPill(c,sel?e.tag:e.tagS,p[0],p[1],(sel?12.5:10)*k,sel?'#e8742c':'rgba(91,61,43,.82)',sel?'#fff':'#fbf4e6')}
  }catch(e){}}}
  function select(e,all=false){
    resetModels();selected=e;
    group=(all?entries.filter(q=>q.p===e.p&&!q.reinstate):[e]).map(q=>({e:q,x:q.m.position.x,z:q.m.position.z,r:q.m.rotation.y}));
    angle.value=Math.round((e.m.rotation.y*180/Math.PI%360+360)%360);
    showAngle();turnButtons.forEach(b=>b.hidden=false);rotation.hidden=apply.hidden=cancel.hidden=false;
    status.textContent=tagOf(e)+' 선택 · '+Math.round(e.m.position.x)+', '+Math.round(e.m.position.z);whole.disabled=!e.p;remove.disabled=!!e.anchor;
  }
  let dest;
  function clear(){remove.disabled=true;turnButtons.forEach(b=>b.hidden=true);rotation.hidden=apply.hidden=cancel.hidden=true;selected=null;group=[];dest=null;status.textContent='구조물 선택';whole.disabled=true}
  function close(){adding(null);abortDrag();resetModels();clear();active=false;devBar.classList.remove('layout-open');panel.hidden=true;button.textContent='구조물 배치'}
  button.onclick=()=>{if(active)return close();if(!DEV.on)return;structs.forEach(registerStruct);clear();active=true;devBar.classList.add('layout-open');devBar.scrollTop=0;panel.hidden=false;button.textContent='배치 종료'};
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
    for(const e of entries){
      if(!e.added)continue;
      if(e.reinstate){
        if(defaults[e.id])saved[e.id]={deleted:true};else delete saved[e.id];
      }else{
        const m=e.m;saved[e.id]={type:e.added,origin:[e.x,e.z,e.r],pose:[m.position.x,m.position.z,m.rotation.y]};
      }
    }
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
    structs.forEach(registerStruct);
    if([joyC(),rjC()].some(([x,y,r])=>Math.hypot(ev.clientX-x,ev.clientY-y)<r*1.5))return;
    if(pending){
      stop(ev);
      const at=groundAt(ev.clientX,ev.clientY);if(!at)return;
      const step=+spacing.value;
      const [x,z]=at.map(v=>step?Math.round(v/step)*step:v);
      const id='add:'+Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');
      const e=spawn(id,pending,[x,z,0]);adding(null);
      remember([{e,x,z,r:0,deleted:true}]);persist('구조물을 추가했어요');select(e);return;
    }
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
      status.textContent=tagOf(selected)+' 이동 중';
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
