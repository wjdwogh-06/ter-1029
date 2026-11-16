'use strict';
/* ===== 특별한 곳 (기획자 요청 7차) =====
   1) 까마귀섬 낚시섬(FISHISLE, 메모1 x=137 z=135): 흰 철조망 울타리 + 앞쪽 철조망 문(누르면 열리고 몇 초 뒤 닫힘, 지금은 누구나)
      + 낚시섬 주인(노란 비옷, 생선 매대 뒤에서 [말 걸기]) + 그물·드럼통·팔레트·모닥불·가로등. 나중에 '낚시 도감을 다 채우면 들어오는 곳'이 될 자리
   2) 물개섬 특수 보급지(SPSUP, x=718 z=849): 네모난 바위 언덕(높이 약 1.9m, 절벽은 보이지 않는 벽으로 막힘), 앞쪽 경사로로만 오르내림, 위에 특수 보급 상자 2개
   땅 모양은 core.js(rawH: FISHISLE·SPSUP·spBox·spRamp), 여기서는 구조물·모델·문·주인만 */
const PLACES=[{k:'fish',n:'낚시섬',x:FISHISLE.x,z:FISHISLE.z,c:'#3fb6e0'},{k:'sp',n:'특수 보급지',x:SPSUP.x,z:SPSUP.z,c:'#ff7a3d'}];
let FNPC=null;   /* 낚시섬 주인 {a,x,z,rot,i} */
const FNPC_LINES=['어서 와요! 여긴 낚시꾼들의 섬이에요.','오늘은 물때가 좋네요. 등대 앞바다엔 큰 놈이 살아요.','도감은 잘 채우고 있어요? 다 채우면 꼭 보여 줘요.'];
DECO.cgate={g:'pl_cgate',s:1,bx:1.25,bz:.16,hp:1e9};          /* 철조망 문: 닫혀 있을 때만 막혀요(s.open, world.js inStruct) */
DECO.fstall={g:'pl_stall',s:1,bx:1.72,bz:.55,hp:1e9};         /* 생선 매대: [말 걸기] */
DECO.iblk={g:'nil',s:1,bx:.95,bz:.4,hp:1e9};                  /* 보이지 않는 벽(언덕 절벽·경사로 옆) */
DECO.iblk2={g:'nil',s:1,bx:.42,bz:.42,hp:1e9};                /* 주인 자리 */
DECO.iblk3={g:'nil',s:1,bx:1.3,bz:.2,hp:1e9};                 /* 그물 */
DECO.spsupply={g:'pl_spcrate',s:1,bx:.66,bz:.53,loot:4,og:'pl_spcrate_open',cd:5};   /* 특수 보급 상자: 열면 5일 뒤 다시 채워져요 */
DECO.spbeacon={g:'pl_beacon',s:1,bx:.22,bz:.22,hp:1e9};

/* ---------- 모델 ---------- */
function plGeo(){const R=(w,h,d,c,b)=>typeof lkRb==='function'?lkRb(w,h,d,c,b):box(w,h,d),LM=typeof lkModel==='function',SMO=(g,d)=>{if(typeof lkSmooth==='function')lkSmooth(g,d);g.computeBoundingSphere();return g};
 const PO=0xe9ecef,WI=0xd3d9df,WD=0xc47d45,WD2=0xa5622f,CR=0xf0d9a8,NV=0x2e3754,GD=0xe9c046;
 /* 철조망 문: 나무 기둥 두 개 위에 '낚시섬' 간판(글자는 따로 붙여요), 문짝은 왼쪽 기둥에 달려 안쪽으로 열려요 */
 {const base=[];for(const x of[-1.32,1.32])base.push(pt(R(.22,3.15,.22,.06,.04),WD2,[x,1.575,0]),pt(R(.3,.1,.3,.04,.03),0x8e5226,[x,3.18,0]));
  base.push(pt(R(3.2,.72,.14,.12,.05),0xd99a5c,[0,2.78,.02]),pt(R(2.96,.52,.04,.08,.02),CR,[0,2.78,.1]));
  const leaf=[pt(R(2.42,.09,.09,.035,.02),PO,[1.25,1.82,0]),pt(R(2.42,.09,.09,.035,.02),PO,[1.25,.16,0]),pt(R(.09,1.74,.09,.035,.02),PO,[.07,.99,0]),pt(R(.09,1.74,.09,.035,.02),PO,[2.43,.99,0]),
   ...(typeof lkLattice==='function'?lkLattice(2.3,1.6,.1,.18,0,.3,WI,.03):[]),pt(R(.08,.26,.08,.03,.02),GD,[2.25,1.0,.06])];
  if(LM)lkModel('pl_cgate',base,{leaf:{g:leaf,pv:[-1.25,0,0]}});else GEO.pl_cgate=mg(base.concat(leaf.map(g=>g.translate(-1.25,0,0))))}
 /* 생선 매대: 나무 카운터 + 크림 상판 + 파랑·흰 줄무늬 차양, 얼음 판 위 생선 두 마리, 파란 양동이 */
 {const p=[pt(R(3.2,.98,.9,.1,.04),WD,[0,.49,0]),pt(R(3.36,.08,1.02,.05,.03),CR,[0,1.02,0])];for(let i=0;i<5;i++)p.push(pt(R(.08,.8,.03,.02,.01),WD2,[-1.2+i*.6,.5,.46]));
  for(const x of[-1.55,1.55])p.push(pt(R(.13,2.7,.13,.05,.03),WD2,[x,1.35,-.38]));
  for(let i=0;i<6;i++)p.push(pt(R(.57,.06,1.36,.03,.02),i%2?0xf1ece2:0x4a8fd6,[-1.43+i*.572,2.6,.02],[-.22,0,0]));
  p.push(pt(R(1.25,.1,.62,.05,.03),0xbfe8f5,[-.62,1.11,.04]),pt(cyl(.2,.17,.32,16),0x4a8fd6,[1.02,1.22,.02]),pt(cyl(.21,.21,.04,16),0xe9ecef,[1.02,1.39,.02]));
  for(const [id,x,s,ry] of [['f_tuna',-.85,.42,.3],['f_salmon',-.4,.46,-.25]])if(GEO[id])p.push(pt(GEO[id],null,[x,1.2,.06],[0,ry,0],[s,s,s]));
  GEO.pl_stall=SMO(mg(p),50)}
 /* 특수 보급 상자: 남색 몸통 + 금색 띠·모서리 + 앞에 주황빛 띠(밤에 빛나요). 연 것은 뚜껑이 뒤로 기대 있어요 */
 {const body=[pt(R(1.26,.92,1.0,.1,.05),NV,[0,.5,0]),pt(R(1.3,.12,1.04,.04,.03),GD,[0,.18,0]),pt(R(1.3,.12,1.04,.04,.03),GD,[0,.82,0])];for(const x of[-.6,.6])body.push(pt(R(.1,.94,1.05,.03,.02),GD,[x,.5,0]));
  const lid=[pt(R(1.32,.16,1.06,.05,.04),0x24304a,[0,1.04,0]),pt(R(.34,.08,.34,.03,.02),GD,[0,1.14,0])],glow=[pt(R(.62,.12,.03,.04,.012),0xffb547,[0,.5,.515])];
  if(LM)lkModel('pl_spcrate',body.concat(lid),{glow:{g:glow,pv:[0,0,0],glow:true}});else GEO.pl_spcrate=mg(body.concat(lid,glow));
  GEO.pl_spcrate_open=SMO(mg(body.concat([pt(R(1.32,.16,1.06,.05,.04),0x24304a,[0,.86,-.7],[1.05,0,0])])),50)}
 /* 등대처럼 깜박이는 신호기: 가는 기둥 + 주황 등 + 작은 깃발 */
 {const base=[pt(R(.5,.16,.5,.05,.04),0x6a7078,[0,.08,0]),pt(R(.12,3.1,.12,.04,.03),0x3f4450,[0,1.6,0]),pt(R(.5,.32,.03,.03,.01),0xff7a3d,[.3,2.9,0])],gl=[pt(new THREE.SphereGeometry(.17,12,8),0xffa24a,[0,3.25,0])];
  if(LM)lkModel('pl_beacon',base,{glow:{g:gl,pv:[0,0,0],glow:true}});else GEO.pl_beacon=mg(base.concat(gl))}}

/* 글자 간판(캔버스) */
function plSignText(txt){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const draw=()=>{const x=cv.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle='#4a2f20';x.font='900 74px '+(typeof UIF!=='undefined'?UIF:'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,52);tx.needsUpdate=true};
 const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
 return new THREE.Mesh(new THREE.PlaneGeometry(2.7,.5),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}

/* ---------- 놓기 ---------- */
function buildPlaces(){plGeo();const F=FISHISLE,A=(t,x,z,r=0,o)=>addStruct(Object.assign({t,x,z,r,hp:1e9},o));
 /* 1) 낚시섬 */
 CLEARS.push([F.x,F.z,14]);
 const fence=(x,z,r)=>{if(typeof lkFence==='function')lkFence(F.x+x,F.z+z,r);else A('cfence',F.x+x,F.z+z,r)};
 for(let x=-7.5;x<=7.6;x+=2.5)fence(x,-F.hd,0);
 for(const sx of[-1,1]){for(let z=-6.25;z<=6.3;z+=2.5)fence(sx*8.8,z,Math.PI/2);for(const x of[2.55,5.05,7.55])fence(sx*x,F.hd,0)}
 {const g=A('cgate',F.x,F.z+F.hd,0);g.open=false;g.ot=0;const t=plSignText('🎣 낚시섬');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 const st=A('fstall',F.x,F.z-3.6,0);A('iblk2',F.x,F.z-4.75,0);FNPC={x:F.x,z:F.z-4.75,rot:0,i:0,st};
 {const m=mesh(GEO.pnet||GEO.pboll,MATT);m.position.set(F.x-5.6,hAt(F.x-5.6,F.z-5.6)-.02,F.z-5.6);scene.add(m);A('iblk3',F.x-5.6,F.z-5.6,0)}
 A('barrel',F.x+5.4,F.z-5.6,0);A('barrel',F.x+6.7,F.z-3.8,.6);A('crate',F.x-6.3,F.z-1.4,.3);A('fire',F.x+5.2,F.z+2.0,0);
 if(GEO.lk_logs){const m=mesh(GEO.lk_logs,MATT);m.scale.setScalar(2.6);m.position.set(F.x+6.9,hAt(F.x+6.9,F.z+3.4)-.02,F.z+3.4);m.rotation.y=.5;scene.add(m)}   /* 모닥불 옆 장작 */
 {const lx=F.x-2.5,lz=F.z+5.9,m=mesh(GEO.plamp,MATT);m.position.set(lx,hAt(lx,lz)-.02,lz);m.rotation.y=Math.PI;scene.add(m);const s=glow(0xffc46a,3.4,.65);s.position.set(lx,m.position.y+2.75,lz-.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 /* 2) 특수 보급지: 절벽 둘레를 따라 바위 + 보이지 않는 벽, 경사로 입구만 비움 */
 const S2=SPSUP;CLEARS.push([S2.x,S2.z+3,18]);
 const ring=[];{let prev=null;for(let a=0;a<=360;a+=.5){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);let lo=0,hi=14;for(let k=0;k<22;k++){const m=(lo+hi)/2;spBox(S2.x+dx*m,S2.z+dz*m)<.45?lo=m:hi=m}const p=[dx*lo,dz*lo];if(!prev||Math.hypot(p[0]-prev[0],p[1]-prev[1])>.05){ring.push(p);prev=p}}}
 const mouth=(x,z,pad)=>z>0&&Math.abs(x-S2.rx)<S2.rw/2+pad;
 const along=(step,fn)=>{let acc=step;for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=L;if(acc>=step){acc=0;fn(b[0],b[1],Math.atan2(b[0]-a[0],b[1]-a[1]))}}};
 along(1.7,(x,z,ang)=>{if(!mouth(x,z,.2))A('iblk',S2.x+x,S2.z+z,ang+Math.PI/2)});
 for(const sd of[-1,1])for(let z=S2.hw-.4;z<S2.hw+S2.rl-.4;z+=1.6)A('iblk',S2.x+S2.rx+sd*(S2.rw/2+.42),S2.z+z,Math.PI/2);
 {const rk=[],C=[0x8e8e96,0x83838c,0x9a9aa2,0x8a8a93],B=S2.h-.28;let i=0;
  if(typeof lkBoulder==='function'){along(1.45,(x,z)=>{if(mouth(x,z,.55))return;const n=Math.hypot(x,z)||1,r=1.08+hash(i,7,41)*.3;rk.push(lkBoulder(r,C[i%4],i*3+1,[x+x/n*.1,B,z+z/n*.1],1.3+hash(i,9,41)*.12));i++});
   for(const sd of[-1,1])for(let z=S2.hw+.5,k=0;z<S2.hw+S2.rl-.8;z+=1.35,k++){const r=Math.max(.5,1.05-k*.12);rk.push(lkBoulder(r,C[(i++)%4],i*5+2,[S2.rx+sd*(S2.rw/2+.8),B,z],.9))}
   for(const [x,z,r] of [[-4.6,-4.4,.5],[4.5,-4.8,.42],[-4.9,3.6,.38],[4.8,1.4,.34]])rk.push(lkBoulder(r,C[(i++)%4],i*7,[x,S2.h+S2.top-.06,z],.8));}
  if(rk.length){const g=mg(rk);if(typeof lkSmooth==='function')lkSmooth(g,70);const m=mesh(g,MATT);m.position.set(S2.x,0,S2.z);scene.add(m)}}
 {const c0=A('spsupply',S2.x-1.6,S2.z-1.4,.15),c1=A('spsupply',S2.x+1.9,S2.z-2.3,-.2);c0.li='sp0';c1.li='sp1'}
 {const b=A('spbeacon',S2.x-3.9,S2.z-3.9,0),s=glow(0xff8a3d,3.6,.7);s.position.set(b.x,hAt(b.x,b.z)+3.25,b.z);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}}
{const _bp=buildPorts;buildPorts=function(){_bp();try{buildPlaces()}catch(e){console.error('특별한 곳 만들기 실패',e)}}}   /* 항구 소품 모델(그물·가로등)이 생긴 뒤에 */

/* ---------- 철조망 문: 누르면 열리고 4초 뒤(문 안에 아무도 없으면) 닫혀요 ---------- */
const GATE_OPEN_T=4;
function gateBusy(s){const who=[P,...enemies.filter(e=>!e.dead)];if(typeof NET!=='undefined'&&NET.on)NET.players.forEach(p=>{if(p.hp>0)who.push(p)});const o=s.open;s.open=false;const b=who.some(q=>inStruct(s,q.x,q.z,.55));s.open=o;return b}
function openGate(s){if(s.open)return;s.open=true;s.ot=performance.now()+GATE_OPEN_T*1000;   /* 실제 시간 기준 */sfx(330,.12,'square',.03);sfx(520,.08,'sine',.03);hudDirty=true}
function updPlaces(dt){const k=Math.min(1,dt*7);plHookChat();
 for(const s of structs){if(s.t!=='cgate')continue;if(s.open){if(performance.now()>=s.ot){if(gateBusy(s))s.ot=performance.now()+400;else{s.open=false;sfx(240,.12,'square',.03);hudDirty=true}}}
  const L=s.lk&&s.lk.parts.leaf;if(L){const t=s.open?1.62:0;if(Math.abs(t-L.rotation.y)>.002)L.rotation.y+=(t-L.rotation.y)*k}}
 if(!FNPC)return;if(!FNPC.a&&CMAT.fisher){FNPC.a=new Actor('fisher');FNPC.a.play('Idle',{force:1});FNPC.a.set(FNPC.x,FNPC.z,0)}
 if(FNPC.a){const d=dist(P.x,P.z,FNPC.x,FNPC.z);FNPC.a.root.visible=d<90;if(d<60){const want=d<7?Math.atan2(P.x-FNPC.x,P.z-FNPC.z):0;let df=want-FNPC.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;FNPC.rot+=df*Math.min(1,dt*4);FNPC.a.root.rotation.y=FNPC.rot;FNPC.a.mixer.update(dt)}}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{updPlaces(dt)}catch(e){}}}
function fisherTalk(){if(!FNPC)return;plHookChat();const s=FNPC_LINES[FNPC.i%FNPC_LINES.length];FNPC.i++;if(typeof CHAT!=='undefined')CHAT.say('fisher',s);else toast(s);sfx(600,.05,'sine',.03);if(FNPC.a)FNPC.a.play('Interact',{once:1,lock:.6,force:1})}
let plChat=false;function plHookChat(){if(plChat||typeof CHAT==='undefined')return;plChat=true;const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){if(k==='fisher')return FNPC&&dist(FNPC.x,FNPC.z,P.x,P.z)<40?{x:FNPC.x,z:FNPC.z,y:3.05}:null;return _an(k)}}   /* chat.js는 이 파일보다 늦게 읽혀서, 처음 쓸 때 붙여요 */

/* ---------- 라벨·상호작용·특수 보급 ---------- */
{const _sl=sLabel;sLabel=function(s){if(s.t==='cgate')return s.open?null:'문 열기';if(s.t==='fstall')return'말 걸기';if(s.t==='iblk'||s.t==='iblk2'||s.t==='iblk3'||s.t==='spbeacon')return null;
  const d=sdef(s);if(d.loot===4)return S.looted[s.li]&&S.day-S.looted[s.li]<d.cd?null:'열기';return _sl(s)}}
const SPLOOT=()=>{const g={};const add=(k,n)=>g[k]=(g[k]||0)+n;add('coin',400+(Math.random()*600|0));add(pick(['rifle','shotgun','smg']),1);add('ammoL',16);add('ammoS',24);add('grenade',1+(Math.random()<.4?1:0));add('powder',6);add('bandage',2);add('can',2);return g};
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'){const s=t.s,d=sdef(s);
  if(s.t==='cgate'){if(inp.actEdge)openGate(s);return}
  if(s.t==='fstall'){if(inp.actEdge)fisherTalk();return}
  if(d.loot===4){if(!inp.actEdge)return;if(S.looted[s.li]&&S.day-S.looted[s.li]<d.cd)return;S.looted[s.li]=S.day;P.a.play('PickUp',{once:1,lock:.5,force:1});const got=SPLOOT();let i=0;
   for(const k in got){if(ITEMS[k]&&ITEMS[k].one&&invN(k)){give('scrap',8);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,'+8 고철','#ffe08a');continue}give(k,got[k]);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,`+${got[k]} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffd27a')}
   if(s.m&&s.m.children[0])s.m.children[0].geometry=GEO[d.og];if(s.lk&&s.lk.parts.glow)s.lk.parts.glow.visible=false;jingle([659,880,1175]);toast('⭐ 특수 보급을 열었어요!');hudDirty=true;return}}
 return _ia()}}

/* ---------- 설치 금지 구역 ---------- */
if(typeof NOB_N!=='undefined')Object.assign(NOB_N,{fish:'낚시섬',sp:'특수 보급지'});
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();NOB.push({k:'fish',x:FISHISLE.x,z:FISHISLE.z,r:Math.hypot(8.8,FISHISLE.hd)+3.5});NOB.push({k:'sp',x:SPSUP.x+SPSUP.rx*.3,z:SPSUP.z+2.6,r:15.5})}}
