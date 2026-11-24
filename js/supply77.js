/* 77차(규칙, 기획자 11-24 20:09) — 보급 창고 키우기 · 새 보급지 5곳(특수 보급지 2곳은 크게) · 새 보급지 길
   기획자: '창고형 건물 안에 보급이 있는 곳, 그 근처 철조망 — 창고형 보급지는 그 바깥쪽 철조망을 없애 주고 크기를 그 철조망만큼 키워 줘',
           '내가 지정해 준 좌표 중에 가깝게 두 개 같이 찍힌 곳들은 특수 보급지이고 규모도 좀 크게', '메인 섬에 보급지 추가한 곳 중 길로 연결 안 된 곳은 자연스럽게 연결'.
   ① 보급 창고(supply.js 테마 7, S5·S10·S13): 둘레 철조망 없음 → 창고가 예전 울타리 크기(반폭 약 7.7~8.6 × 7.2~8.0m) 그대로.
      벽·지붕을 새로 그려요(sx77WhGeo). 안: 뒤 선반 줄·옆 선반·가운데 화물 팔레트·지게차·드럼통·노란 통로 줄, 상자는 4곳 중 2~4곳.
      들어가면 지붕이 사라지고 카메라 쪽을 보는 벽(문 쪽이든 옆이든)은 반투명(16%). 문은 예전처럼 길 쪽.
   ② 새 보급지(core.js SUPPLY_SITES 14~18): 14·15·16은 보통 보급지(테마: 컨테이너 야적장·낙하 지점·버려진 트럭),
      17·18은 특수 보급지(core.js SUP_SPECIAL: 30 × 22m 쇠 울타리, 정면 +z 문 하나 + 초소·차단기, 특수 보급 상자 6개씩 = places.js 물개섬과 같은 SPLOOT·5일).
      17 = 헬기 착륙장(가운데 착륙장·낙하산·바람자루·연료 탱크), 18 = 무기고(컨테이너 셋·모래주머니 진지·트럭·무전 천막·안테나).
   ③ 길: 14·15를 본섬 길에 이어요(SX77_ROADS, tools/road_route77.py로 찾은 것). 보급 창고 문 안으로 들어가던 길 끝은 문 앞에서 끝나요.
   ④ 15번 자리가 칠리 들판(62차) 안이라 칠리 들판을 가까운 빈 땅으로 옮겨요(SX77_CHILI). */

/* ---------- ② 새 보급지 테마(14~16) ---------- */
SP_THEME[14]=3;SP_THEME[15]=0;SP_THEME[16]=6;   /* 컨테이너 야적장(71차부터 안 쓰이던 테마) · 낙하 지점 · 버려진 트럭 */
for(const i in SUP_SPECIAL){const q=SUPPLY_SITES[i];if(q&&typeof PLACES!=='undefined')PLACES.push({k:'sx'+i,n:'특수 보급지',x:q[0],z:q[1],c:'#ff7a3d'})}
if(typeof NOB_N!=='undefined')NOB_N.sx77='특수 보급지';

/* ---------- ① 보급 창고 ---------- */
const sx77WhDims=i=>({hx:7.7+hash(i,3,71)*.9,hz:7.2+hash(i,5,72)*.8});   /* supply.js spFence가 정하던 울타리 크기 그대로 */
Object.assign(SPT[7],{cr:[[-3.3,-2.4,.1],[3.4,-2.2,-.15],[-3.5,1.9,.3],[3.6,2.3,-.25]],de:[],lamp:[3.7,9.8],smoke:[-3.9,9.6],sign:[5.6,10.6,-.15]});
{const _sf=spFence;spFence=function(s,T,th,m,o){if(!T||!T.wh)return _sf.apply(this,arguments);
  const D=sx77WhDims(s.i),c=Math.cos(th),sn=Math.sin(th),W=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c];
  const posts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const [x,z]=W(a*D.hx,b*D.hz);return{x,z}});return{hx:D.hx,hz:D.hz,posts,mesh:null,cols:[],W}}}   /* 창고는 철조망 없음(설치 금지 원은 창고 네 모서리 + 3m) */
const SX77_DW=2.3;   /* 창고 문 반폭 */
const sx77Nb=HX=>Math.max(2,Math.floor((2*HX-3.8)/2.05));   /* 뒤 선반 수(양 끝 구석은 넓게 비움) */
function sx77WhGeo(HX,HZ){const C=SPWH_C,EV=3.6,RG=EV+Math.min(2.2,HZ*.28),DW=SX77_DW,DH=3.05,B=box,GL=0x34506a,G={base:[],back:[],left:[],right:[],front:[],roof:[]};
 const hb=(a,b)=>hash(a*7+3,b*13+1,77);
 /* 바닥: 두꺼운 콘크리트 판(가장자리 땅 높이 차를 가림) + 노란 통로 줄(문 → 뒤) */
 G.base.push(pt(lkRb(2*HX+.24,.8,2*HZ+.24,.05,.03),C.conc,[0,-.35,0]));
 for(const sx of[-1,1])G.base.push(pt(B(.1,.014,2*HZ-2.5),C.yel,[sx*2.55,.058,.95]));G.base.push(pt(B(5.2,.014,.1),C.yel,[0,.058,-HZ+2.2]));
 /* 벽 하나: 판 + 안팎 골 줄 + 아래 남색 띠 + 위 띠 (축 a = 'x'면 x 방향으로 긴 벽) */
 const wall=(arr,a,cx,cz,len,nIn)=>{const along=a==='x';arr.push(pt(along?B(len,EV,.14):B(.14,EV,len),C.wall,[cx,EV/2,cz]));
  for(let t=-len/2+.25;t<=len/2-.2;t+=.42)for(const o of[-.09,.09]){const x=along?cx+t:cx+o,z=along?cz+o:cz+t;arr.push(pt(along?B(.08,EV-.06,.05):B(.05,EV-.06,.08),C.rib,[x,EV/2,z]))}
  const out=-nIn*.06;arr.push(pt(along?B(len+.02,.42,.05):B(.05,.42,len+.02),C.nav,along?[cx,.21,cz+out]:[cx+out,.21,cz]),pt(along?B(len+.04,.16,.2):B(.2,.16,len+.04),C.nav,[cx,EV-.08,cz]))};
 wall(G.back,'x',0,-HZ+.07,2*HX,1);
 for(const sx of[-1,1]){const arr=sx<0?G.left:G.right;wall(arr,'z',sx*(HX-.07),0,2*HZ,-sx);
  for(const sz of[-1,1])arr.push(pt(B(.28,EV+.12,.28),C.nav,[sx*HX,(EV+.12)/2,sz*HZ]));
  for(const z of[-HZ*.55,0,HZ*.55])for(const o of[.02,-.16])arr.push(pt(B(.04,.62,1.62),0xf0ebe0,[sx*(HX+o),2.62,z]),pt(B(.05,.5,1.48),GL,[sx*(HX+o+(o>0?.03:-.03)),2.62,z]))}   /* 높은 창(안팎) */
 /* 앞벽: 문 양옆 판 + 문 위 인방 + 노랑·검정 문틀 + 말아 올린 셔터 + 문 위 등 */
 for(const sx of[-1,1]){const L=HX-DW;wall(G.front,'x',sx*(DW+L/2),HZ-.07,L,-1);for(let k=0;k<7;k++)G.front.push(pt(B(.17,.44,.18),k%2?C.dk:C.yel,[sx*(DW+.07),.22+k*.43,HZ-.02]))}
 G.front.push(pt(B(2*DW+.3,EV-DH,.14),C.wall,[0,(EV+DH)/2,HZ-.07]),pt(B(2*DW+.34,.16,.2),C.nav,[0,EV-.08,HZ-.07]),pt(B(2*DW+.3,.1,.2),C.dk,[0,DH+.02,HZ-.05]));
 {const d=cyl(.2,.2,2*DW,12);d.rotateZ(Math.PI/2);G.front.push(pt(d,0x9aa3ad,[0,DH-.2,HZ-.3]),pt(B(2*DW,.1,.05),0x7f8892,[0,DH-.42,HZ-.26]))}
 G.front.push(pt(B(.56,.13,.32),C.dk,[0,EV+.04,HZ+.12]),pt(new THREE.SphereGeometry(.1,8,6),0xfff1b0,[0,EV-.06,HZ+.22]));
 /* 안: 뒤 선반 줄 */
 const shelf=(arr,cx,cz,rot,seed)=>{const p=[];for(const a of[-.86,.86])for(const b of[-.27,.27])p.push(pt(B(.07,2.42,.07),C.or,[a,1.21,b]));
  for(const y of[.3,1.05,1.8,2.42])p.push(pt(B(1.84,.05,.64),C.shelf,[0,y,0]));
  for(const [y,k] of [[.33,0],[1.08,1],[1.83,2]])for(let j=0;j<3;j++){const w=.42+hb(seed+j,k)*.14,h=.28+hb(j,k+seed)*.2,cc=[C.box,C.bl,0x9fa86a,0xd6965a][(j+k+seed)%4];p.push(pt(lkRb(w,h,.48,.03,.015),cc,[-.56+j*.56,y+h/2,0]))}
  const g=mg(p);g.rotateY(rot);g.translate(cx,0,cz);arr.push(g)};
 const nB=sx77Nb(HX),bz=-HZ+.55;for(let k=0;k<nB;k++)shelf(G.base,(k-(nB-1)/2)*2.05,bz,0,k);
 for(const sx of[-1,1])for(const z of[-HZ+3.9,-HZ+6.0])shelf(G.base,sx*(HX-.55),z,Math.PI/2,sx>0?7:11);
 /* 가운데 뒤 화물 팔레트(상자 더미 + 비닐) */
 {const cx=0,cz=-HZ+2.8,p=[pt(B(1.4,.14,1.2),0xc8925a,[0,.07,0])];for(let k=0;k<2;k++)for(const [x,z] of [[-.34,-.28],[.34,-.28],[-.34,.28],[.34,.28]])p.push(pt(lkRb(.6,.42,.5,.03,.015),k?0xc89a5a:0xb98a4e,[x,.36+k*.44,z]));
  p.push(pt(lkRb(1.36,.9,1.12,.06,.02),0xdfe8ee,[0,.58,0],0,[1,1,1]));const g=mg(p);g.translate(cx,0,cz);G.base.push(g)}
 /* 지게차(앞 왼쪽 구석) */
 {const p=[],Y=0xf2b33a,K=0x2b2f36;p.push(pt(lkRb(1.0,.62,1.5,.06,.03),Y,[0,.55,0]),pt(lkRb(.98,.42,.5,.05,.03),0x6b6f76,[0,.5,-.6]),pt(lkRb(.5,.1,.5,.03,.02),K,[0,.92,.12]),pt(lkRb(.42,.5,.08,.03,.02),K,[0,1.18,-.12]));
  for(const x of[-.44,.44])for(const z of[-.45,.45])p.push(pt(cyl(.22,.22,.18,12),K,[x*1.08,.22,z],[0,0,Math.PI/2]));
  for(const x of[-.42,.42])p.push(pt(B(.06,1.95,.06),K,[x,1.05,-.52-0]),pt(B(.06,1.95,.06),K,[x,1.05,.55]));p.push(pt(B(.96,.06,1.2),K,[0,2.05,0]));
  for(const x of[-.42,.42])p.push(pt(B(.08,2.1,.08),0x4a4f56,[x,1.05,.82]));for(const x of[-.26,.26])p.push(pt(B(.1,.05,1.0),0x8b9097,[x,.1,1.35]));
  const g=mg(p);g.translate(-(HX-2.6),0,HZ-3.0);G.base.push(g)}
 /* 드럼통(앞 오른쪽 구석) */
 for(const [x,z,cc] of [[HX-1.0,HZ-1.2,0x3f7fd0],[HX-1.7,HZ-1.05,0xe0533f],[HX-1.25,HZ-1.85,0x3f7fd0]]){G.base.push(pt(cyl(.3,.3,.9,14),cc,[x,.45,z]),pt(cyl(.31,.31,.05,14),0x2b2f36,[x,.3,z]),pt(cyl(.31,.31,.05,14),0x2b2f36,[x,.66,z]))}
 /* 지붕(사라짐): 두 비탈 + 골 줄 + 용마루 + 환기통 + 양옆 박공 */
 {const a=Math.atan2(RG-EV+.13,HZ+.4),L=Math.hypot(HZ+.4,RG-EV+.13);
  for(const sz of[-1,1]){const parts=[pt(B(2*HX+.6,.14,L),C.roof,[0,0,0])];for(let x=-HX-.1;x<=HX+.11;x+=.5)parts.push(pt(B(.07,.06,L),C.roof2,[x,.09,0]));const s1=mg(parts);s1.rotateX(sz*a);s1.translate(0,(EV+RG)/2+.07,sz*(HZ/2+.2));G.roof.push(s1)}
  G.roof.push(pt(B(2*HX+.7,.18,.42),C.roof2,[0,RG+.09,0]));for(const x of[-HX/2,HX/2])G.roof.push(pt(cyl(.32,.36,.42,12),0xc9ced3,[x,RG+.36,0]),pt(cone(.42,.26,12),0xa9b0b7,[x,RG+.7,0]));
  for(const sx of[-1,1]){const sh=new THREE.Shape([new THREE.Vector2(-HZ,EV),new THREE.Vector2(HZ,EV),new THREE.Vector2(0,RG)]);const g=new THREE.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(sx*HX-.07,0,0);G.roof.push(pt(g,C.wall,[0,0,0]))}}
 const out={};for(const k in G)out[k]=mg(G[k]);return out}
/* 벽·안 물건 충돌(보이지 않는 막이, 1.8m 조각) */
function sx77Seg(L,ax,az,bx,bz,th){const len=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(len/1.8)),r=Math.atan2(-(bz-az),bx-ax),k=PLB(len/n/2+.05,th);for(let i=0;i<n;i++){const t=(i+.5)/n;L.push(addStruct({t:k,x:ax+(bx-ax)*t,z:az+(bz-az)*t,r,hp:1e9}))}}
spWarehouse=function(s,W0,th){const D=sx77WhDims(s.i),HX=D.hx,HZ=D.hz,key='spwh77_'+s.i,DW=SX77_DW;
 if(!GEO[key+'_base']){const g=sx77WhGeo(HX,HZ);for(const k in g){GEO[key+'_'+k]=g[k];if(k!=='roof')try{lkAO(g[k],.5,1)}catch(e){}}}
 const c=Math.cos(th),sn=Math.sin(th),W=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c],y=hAt(s.x,s.z)-.03,b=mesh(GEO[key+'_base'],MATT);b.position.set(s.x,y,s.z);b.rotation.y=th;b.userData.layoutName='보급 창고';scene.add(b);
 const mk=k=>{const mt=MATT.clone();const m=mesh(GEO[key+'_'+k],mt);b.add(m);m.userData.mt=mt;return m},parts={};for(const k of['roof','front','back','left','right'])parts[k]=mk(k);
 let sign=null;try{sign=plSignText('📦 보급 창고',2.2,.42);sign.position.set(-(DW+HX)/2,2.3,HZ+.1);b.add(sign);sign.material.transparent=true}catch(e){}
 const bl=[],seg=(a,bb,t)=>{const A=W(a[0],a[1]),Bp=W(bb[0],bb[1]);sx77Seg(bl,A[0],A[1],Bp[0],Bp[1],t)},box2=(lx,lz,hx,hz,r=0)=>{const [x,z]=W(lx,lz);bl.push(addStruct({t:PLB(hx,hz),x,z,r:r+th,hp:1e9}))};
 seg([-HX,-HZ+.07],[HX,-HZ+.07],.16);for(const sx of[-1,1]){seg([sx*(HX-.07),-HZ],[sx*(HX-.07),HZ],.16);seg([sx*DW,HZ-.07],[sx*HX,HZ-.07],.16)}   /* 벽(문 자리만 비움) */
 {const w=sx77Nb(HX)*2.05/2;seg([-w,-HZ+.5],[w,-HZ+.5],.42)}                                                                                       /* 뒤 선반 줄(벽에 붙여서 뒤에 틈 없음) */
 for(const sx of[-1,1])seg([sx*(HX-.55),-HZ+2.9],[sx*(HX-.55),-HZ+7.0],.42);                                                                       /* 옆 선반 */
 box2(0,-HZ+2.8,.72,.62);box2(-(HX-2.6),HZ-3.0,.62,1.15);box2(HX-1.05,HZ-1.17,.95,1.02);                                                          /* 팔레트·지게차·드럼통(구석에 붙여서 틈 없음) */
 CLEARS.push([s.x,s.z,Math.hypot(HX,HZ)+1.5]);   /* 창고 속·둘레 나무·바위·풀 비우기 */
 b.userData.layoutBlocks=bl;SPWH.push({s,b,roof:parts.roof,front:parts.front,parts,sign,op:1,hx:HX,hz:HZ,v:77})};
/* 들어가면: 지붕 사라짐 + 카메라(+z) 쪽을 보는 벽은 반투명(문 쪽이든 옆이든) */
spWhUpd=function(dt){if(!SPWH.length||typeof P==='undefined'||!P)return;const ins=typeof INT!=='undefined'&&INT.on;
 for(const w of SPWH){const b=w.b;if(!b.parent||!w.parts)continue;const HX=w.hx,HZ=w.hz,dx=P.x-b.position.x,dz=P.z-b.position.z;if(dx*dx+dz*dz>(HX+HZ+8)**2&&w.op===1)continue;
  const r=b.rotation.y,c=Math.cos(r),sn=Math.sin(r),lx=dx*c-dz*sn,lz=dx*sn+dz*c,inside=!ins&&Math.abs(lx)<HX+.2&&lz>-HZ-.2&&lz<HZ+.8,tgt=inside?0:1;
  w.op+=(tgt-w.op)*Math.min(1,dt*7);if(Math.abs(w.op-tgt)<.01)w.op=tgt;
  const set=(m,o)=>{const mt=m.userData.mt;mt.opacity=o;mt.transparent=o<.995;mt.depthWrite=o>.6;m.visible=o>.02;m.castShadow=o>.6},fz={front:c,back:-c,left:sn,right:-sn},fo=k=>1-(1-(.16+.84*w.op))*clamp((fz[k]-.12)/.45,0,1);
  set(w.parts.roof,w.op);for(const k in fz)set(w.parts[k],fo(k));
  if(w.sign){const o=fo('front');w.sign.material.opacity=o;w.sign.visible=o>.02}}};

/* ---------- ② 특수 보급지(17·18) ---------- */
function sx77HeliGeo(R){const p=[],Y=0xf2c230;p.push(pt(cyl(R+.15,R+.25,.1,28),0x8f8a80,[0,.04,0]),pt(cyl(R,R,.06,28),0xbdb8ad,[0,.1,0]));
 {const g=new THREE.RingGeometry(R-.75,R-.45,40);g.rotateX(-Math.PI/2);p.push(pt(g,Y,[0,.135,0]))}
 for(const x of[-.78,.78])p.push(pt(box(.36,.02,2.1),0xf4f1ea,[x,.14,0]));p.push(pt(box(1.2,.02,.34),0xf4f1ea,[0,.14,0]));
 for(let k=0;k<10;k++){const a=k/10*Math.PI*2;p.push(pt(new THREE.SphereGeometry(.1,8,6),k%2?0x6ddc7a:0xf6f2e4,[Math.cos(a)*(R-.2),.16,Math.sin(a)*(R-.2)]))}
 return mg(p)}
const SX77_LAY={
 /* 17 헬기 착륙장: 가운데 왼쪽 착륙장, 오른쪽 상자 6, 뒤 감시탑·연료 탱크, 왼쪽 무전 천막 */
 heli:{pad:[-2.2,-1.2,4.8],cr:[[5.4,-4.0,.2],[8.1,-3.7,-.3],[5.3,-.9,.5],[8.0,-.6,-.2],[5.7,2.2,.1],[8.4,2.5,-.4]],chute:[[11.2,-1.4,.4],[10.6,2.0,-.7],[-2.6,-7.6,1.1]],
  st:[['sp_sock',12.6,-8.6,0],['sp_booth',4.4,8.4,0],['well',-12.0,-2.2,Math.PI/2],['sp_drums',-9.6,-5.0,0]],tw:[[-12.3,-8.2],[12.4,6.8]],tent:[-11.0,4.4,.15],table:[-7.6,4.4],gen:[-8.4,6.9],
  sb:[[-4.6,8.4,0]],flag:[-7.4,9.0],beacon:[-9.6,9.2],lamps:[[-5.6,-9.6],[6.0,-9.6],[-13.6,-.4],[13.6,.6],[2.9,9.8]],col:[[-4.4,6.0,.65,.55,.2]],smoke:[[2.4,-5.4],[-6.9,2.9]],
  deco:[['jerry',-10.4,-2.9,.4],['jerry',-10.0,-1.5,1.3],['lk_drum_0',-10.0,-5.5,0],['lk_drum_2',-9.2,-4.4,.8],['ammostack',10.9,-6.4,.3],['tarppile',1.4,6.4,.5],['lk_pallet',-4.4,6.0,.2,1],['ammostack',-4.4,6.0,.4,1.05,.16]]},
 /* 18 무기고: 뒤 컨테이너 셋, 가운데 모래주머니 진지 안 상자 6, 오른쪽 트럭, 왼쪽 무전 그늘·안테나 */
 depot:{cr:[[-3.0,-3.3,.15],[-.2,-3.7,-.2],[2.6,-3.3,.35],[-3.2,-.3,-.25],[0,.1,.1],[2.8,-.3,-.4]],
  st:[['sp_cont',-9.6,-8.2,0],['sp_cont2',-3.9,-8.2,Math.PI],['sp_cont',6.1,-8.2,0],['sp_truck',10.8,-.8,.22],['sp_booth',4.4,8.4,0],['sp_mast',-12.7,-3.2,0],['sp_drums',10.6,6.2,0]],
  tw:[[-12.5,6.6],[12.7,-8.5]],shade:[-8.9,3.4],gen:[-12.4,1.0],tent:[-7.6,8.2,0],sbw:[[-6.2,-1.6,Math.PI/2,5],[5.7,-1.6,Math.PI/2,5],[-.2,-5.6,0,4]],flag:[-2.8,9.6],beacon:[-4.8,9.7],
  lamps:[[-5.6,-5.2],[8.6,-5.4],[-13.6,-.2],[13.6,2.4],[2.6,6.6]],smoke:[[-1.6,3.2]],col:[[6.6,4.4,.65,.55,.1],[8.4,3.2,.65,.55,-.2]],
  deco:[['lk_pallet',6.6,4.4,.1,1],['ammostack',6.6,4.4,.2,1.1,.16],['lk_pallet',8.4,3.2,-.2,1],['ammostack',8.4,3.2,-.1,1.05,.16],['jerry',12.0,5.0,.6],['lk_drum_1',11.6,7.0,.3],['tarppile',-9.8,-5.4,1.2],['chute',3.2,4.6,.7]]}};
const SX77_KIND={17:'heli',18:'depot'};
function sx77Special(s){if(!GEO.pl_spcrate&&typeof plGeoParts==='function')plGeoParts();   /* 특수 보급 상자·신호등 모델은 places.js가 나중에 만들어서 먼저 불러요 */
 const Q=SUP_SPECIAL[s.i],i=s.i,HX=Q.hx,HZ=Q.hz,L=SX77_LAY[SX77_KIND[i]||'depot'],T={n:'특수 보급지',f:'steel',warn:1,boom:1};s.cr=[];s.theme=T.n;s.special=1;
 CLEARS.push([s.x,s.z,Math.hypot(HX,HZ)+2.5]);
 const W=(lx,lz)=>[s.x+lx,s.z+lz],gh=(x,z)=>hAt(x,z),V=[],add=(k,lx,lz,ry=0,sc=1,dy=0)=>{const [x,z]=W(lx,lz);if(GEO[k])V.push(pt(GEO[k],null,[lx,gh(x,z)-.03+dy,lz],[0,ry,0],[sc,sc,sc]))};
 const bl=(lx,lz,bx,bz,r=0)=>{const [x,z]=W(lx,lz);return addStruct({t:PLB(bx,bz),x,z,r,hp:1e9})},st=(t,lx,lz,r=0)=>{const [x,z]=W(lx,lz);return addStruct({t,x,z,r})};
 const lampAt=(x,y,z,c=0xffc46a,r=2.8)=>{const l=glow(c,r,.62);l.position.set(x,y,z);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l)};
 /* 특수 보급 상자 6 */
 L.cr.forEach(([lx,lz,r])=>{const [x,z]=W(lx,lz),o=addStruct({t:'spsupply',x,z,r});o.li='sx'+i+'_'+s.cr.length;s.cr.push(o)});
 if(L.pad){const [px,pz,R]=L.pad,[x,z]=W(px,pz);V.push(pt(sx77HeliGeo(R),null,[px,gh(x,z)-.06,pz]));for(const a of[.6,2.2,3.8,5.4]){const [gx,gz]=W(px+Math.cos(a)*(R-.2),pz+Math.sin(a)*(R-.2));lampAt(gx,gh(gx,gz)+.3,gz,0x7dff9a,1.4)}}
 for(const [lx,lz,r] of L.chute||[])add('chute',lx,lz,r,1.1);
 for(const [t,lx,lz,r] of L.st)st(t,lx,lz,r);
 for(const [tx,tz] of L.tw){const [x,z]=W(tx,tz),tm=plAdd(plTowerGeo(),x,gh(x,z)-.03,z,0);tm.userData.layoutName='감시탑';const lb=[];for(const a of[-.8,.8])for(const b2 of[-.8,.8])lb.push(addStruct({t:'swpost',x:x+a,z:z+b2,r:0}));tm.userData.layoutBlocks=lb;lampAt(x,gh(x,z)+4.7,z)}
 if(L.tent){const [lx,lz,r]=L.tent;add('suptent',lx,lz,r,1.05);bl(lx,lz,1.75,.95,r)}
 if(L.table){const [lx,lz]=L.table,[x,z]=W(lx,lz);plAdd(plTableGeo(),x,gh(x,z)-.03,z,0);add('radio',lx+.3,lz-.1,.1,1,.8);bl(lx,lz,.85,.45)}
 for(const [lx,lz,bx,bz,r] of L.col||[])bl(lx,lz,bx,bz,r);
 if(L.shade){const [lx,lz]=L.shade,[x,z]=W(lx,lz),sh=plShadeGeo(3.4,2.4,2.2),y=gh(x,z)-.03;plAdd(sh.poles,x,y,z);plAdd(sh.net,x,y,z,0,PLM2()).castShadow=true;plAdd(plTableGeo(),x,y,z,0);add('radio',lx+.3,lz-.1,.1,1,.8);
  for(const [a,b2] of [[-1.7,-1.2],[1.7,-1.2],[-1.7,1.2],[1.7,1.2]])bl(lx+a,lz+b2,.08,.08);bl(lx,lz,.85,.45)}
 if(L.gen){const [lx,lz]=L.gen;add('lk_gen',lx,lz,-1.57);bl(lx,lz,.5,.65);const to=L.shade||L.table;if(to){const [a,b2]=[W(lx,lz),W(to[0],to[1])];V.push(lkRod([a[0]-s.x,gh(a[0],a[1])+.04,a[1]-s.z],[b2[0]-s.x,gh(b2[0],b2[1])+.04,b2[1]-s.z],.025,0x2b2b2b,5))}}
 for(const [lx,lz,r] of L.sb||[]){add('sbagArc',lx,lz,r);bl(lx+Math.sin(r)*.27,lz+Math.cos(r)*.27,1.4,.42,r)}
 for(const [lx,lz,r,n] of L.sbw||[]){const [x,z]=W(lx,lz);V.push(pt(plSandbagGeo(n),null,[lx,gh(x,z)-.02,lz],[0,r,0]));bl(lx,lz,n*.29+.05,.24,r)}
 if(L.flag){const [x,z]=W(L.flag[0],L.flag[1]),f=plFlagGeo();plAdd(f.pole,x,gh(x,z)-.02,z);plAdd(f.cloth,x,gh(x,z)-.02,z,0,PLM2());bl(L.flag[0],L.flag[1],.18,.18)}
 if(L.beacon){const b2=st('spbeacon',L.beacon[0],L.beacon[1],0);lampAt(b2.x,gh(b2.x,b2.z)+3.25,b2.z,0xff8a3d,3.6)}
 for(const [lx,lz] of L.lamps)st('suplamp',lx,lz,.4);
 for(const d of L.deco)add(...d);
 for(const [lx,lz] of L.smoke){const [fx,fz]=W(lx,lz),flare=mesh(GEO.flarecan,MATT);flare.userData.layoutName='신호탄';flare.position.set(fx,gh(fx,fz)-.03,fz);scene.add(flare);
  const G=new THREE.Group();G.position.set(fx,gh(fx,fz),fz);const sp=[];for(let q=0;q<9;q++){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex(),color:q%3?0xf26a1e:0xffa24a,transparent:true,opacity:.5,depthWrite:false}));g.userData.p=q/9;G.add(g);sp.push(g)}scene.add(G);flare.attach(G);SMOKES.push({s,G,sp,t:0})}
 /* 경고판(문 밖 왼쪽, 카메라 쪽을 봐요) */
 {const [x,z]=W(-5.2,HZ+2.9);try{const b2=plAdd(plBoardGeo(),x,gh(x,z)-.02,z,0),t=plSignText('⚠ 특수 보급지',2.3,.46,70);t.position.set(0,1.32,.08);b2.add(t);bl(-5.2,HZ+2.9,1.3,.14)}catch(e){}}
 if(V.length){const m=plAdd(mg(V),s.x,0,s.z);m.userData.layoutName='특수 보급지 꾸밈'}
 const F=spFence(s,T,0,1,{hx:HX,hz:HZ,rc:3.0});{const [bx,bz]=W(2.6,F.hz+1.65);addStruct({t:'sp_boom',x:bx,z:bz,r:0})}
 SPF.push({i,x:s.x,z:s.z,th:0,m:1,theme:T.n,hx:F.hx,hz:F.hz,posts:F.posts.map(p=>[p.x,p.z]),mesh:F.mesh,cols:F.cols.length,special:1})}
{const _sb=spBuild;spBuild=function(s){if(SUP_SPECIAL[s.i])return sx77Special(s);if(s.i>=14)CLEARS.push([s.x,s.z,10.5]);return _sb.apply(this,arguments)}}   /* 새 보통 보급지(14~16)는 울타리 안 바위·나무 비우기 */
/* 특수 보급지 설치 금지 이름 */
{const _bn=buildNoBuild;buildNoBuild=function(){_bn.apply(this,arguments);for(const n of NOB)if(n.k==='sup'&&SUPS.some(s=>SUP_SPECIAL[s.i]&&Math.abs(s.x-n.x)<.5&&Math.abs(s.z-n.z)<.5))n.k='sx77'}}

/* ---------- ③ 길 ---------- */
const SX77_ROADS=[   /* tools/road_route77.py 결과(갈림길 J<번호> = 이미 있던 P3-S13 길 위 점 → 보급지 문) */
 ['J14-S14','621.5,618.7 621.4,620.7 621.3,622.7 621.2,624.7 621.1,626.7 621.1,628.7 621.1,630.7 621.1,632.7 621,634.7 620.9,636.7 620.9,638.7 620.7,640.7 620.5,642.7 620.3,644.7 620.1,646.7 620,648.7 619.9,650.7 619.8,652.7 619.7,654.7 619.6,656.7 619.5,658.6 619.4,660.6 619.3,662.5'],
 ['J15-S15','719.6,553.5 719.6,551.5 719.6,549.5 719.7,547.5 719.7,545.5 719.8,543.5 719.9,541.5 720.1,539.5 720.2,537.5 720.4,535.5 720.6,533.5 720.5,531.5 720.4,529.5 720.2,527.5 720.1,525.5 720,523.5 719.9,521.5 719.9,519.5 719.9,517.5 719.9,515.5 720,514.5']];
const SX77_GATE={"14": 3.091, "15": -0.009},SX77_NODES={"J14": [621.5, 618.7], "J15": [719.6, 553.5]};
{for(const k in SX77_GATE)ROAD_GATE[k]=SX77_GATE[k];Object.assign(ROAD_NODES,SX77_NODES);
 for(const [k,s] of SX77_ROADS)ROADS.push({k,a:k.split('-')[0],b:k.split('-')[1],p:s.split(' ').map(t=>t.split(',').map(Number))});
 /* 보급 창고 문 안으로 들어가던 길 끝은 문 앞에서 끝나요(창고 바닥 위에 길이 깔리지 않게) */
 for(const i in SP_THEME){if(SP_THEME[i]!==7||ROAD_GATE[i]===undefined||!SUPPLY_SITES[i])continue;const D=sx77WhDims(+i),th=ROAD_GATE[i],c=Math.cos(th),sn=Math.sin(th),[sx,sz]=SUPPLY_SITES[i];
  for(const r of ROADS){const keep=r.p.filter(([x,z])=>{const dx=x-sx,dz=z-sz,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return!(Math.abs(lx)<D.hx+.6&&Math.abs(lz)<D.hz+.6)});if(keep.length!==r.p.length&&keep.length>1)r.p=keep}}}

/* ---------- ④ 칠리 들판 옮기기 ---------- */
const SX77_CHILI=[687,534];   /* tools/road_route77.py가 고른 자리(예전 710,500에서 41 m) */
{const c=PLANT_SITES.find(p=>p.p==='chili');if(c&&SX77_CHILI&&Math.hypot(c.x-720,c.z-509)<45){c.x=SX77_CHILI[0];c.z=SX77_CHILI[1]}}
