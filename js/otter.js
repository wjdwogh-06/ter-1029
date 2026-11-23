'use strict';
/* ===== 69차(디자인): 수달섬 = 요리 상인 · 사냥꾼 상인 섬 — 기획자 11-23 14:54 =====
   '항구1: x=278, z=786 (수달섬) 여기 내가 표시한 곳이 섬이거든. 요리 상인이랑 사냥꾼 상인이 있는 섬으로 꾸며줘. 둘이 붙이지는 않고, 섬이 아예 작은 것도 아니라서
    좀 반대편으로 설계하고 반반 나눠서 테마를 꾸며줘. 섬 바깥쪽은 전부 철조망으로 둘러주고, 섬 중앙 기준 원형 구역으로 섬보다 약간 크게 아무것도 설치 못 하고 안전 구역으로.
    메인 가장 큰 섬이랑 다리를 연결해 줘. 들어갈 땐 문으로. 다리는 나무 느낌으로 좀 괜찮게.'
   · 섬 땅은 59차 그대로(core.js NEWISLES '수달섬'). 여기서는 구조물·모양·사람만.
   · 섬의 긴 축(남서 ↔ 북동)을 따라 반으로: 북서쪽 절반 = 요리(빨강·크림 차양 가판대, 화덕, 바비큐 그릴, 솥, 피크닉 탁자, 채소 상자, 허브 화단, 손질 탁자),
     남동쪽 절반 = 사냥(통나무 가판대 + 녹색 천막·뿔 장식·가죽, 캔버스 텐트, 고기 건조대, 가죽 틀, 과녁·건초, 꼬치구이 모닥불, 장작더미).
     두 상인은 섬 양쪽 끝에 떨어져 있고, 북동쪽 끝 문 → 갈림길 표지판 → 양쪽으로 닳은 흙길.
   · 둘레: 해안선 1.6m 안쪽을 따라 흰 철조망(낚시섬과 같은 모양·같은 문 cgate), 문은 북동쪽 끝(다리 쪽) 하나.
   · 안전 구역 = 설치 금지 = 섬 가운데 원(반지름 OTR.R). 안전 구역은 core.js PORT_SAFE 맨 끝 한 줄(서버도 같은 판정), 설치 금지는 buildNoBuild 감싸기.
   · 다리: 수달섬 북동쪽 끝 ↔ 초승달 본섬(가장 가까운 해안, 약 50m). 나무 판자 + 통나무 기둥 + 난간 + 등불, 가운데가 살짝 올라간 아치.
     걷는 바닥은 보이지 않는 부두(addDock) 조각들, 양옆은 보이지 않는 벽. 본섬 쪽 끝에 통나무 문 기둥과 '수달섬' 간판.
   · 상인 둘은 [말 걸기]만(무엇을 사고파는지는 기획자가 정할 때). */
const OTR={x:262.4,z:782.4,R:46,n:'수달섬',c:'#f2a33a',b0:[293.5,754.5],b1:[329.5,719]};
const otW=(s,v)=>[OTR.x+(s+v)*.70711,OTR.z+(v-s)*.70711];   /* s = 북동(다리) 쪽, v = 남동(사냥) 쪽 */
PLACES.push({k:'otter',n:OTR.n,x:OTR.x,z:OTR.z,c:OTR.c});
if(typeof NOB_N!=='undefined')NOB_N.otter=OTR.n;
DECO.ot_cook={g:'nil',s:1,bx:1.45,bz:.5,hp:1e9};   /* 요리 상인 가판대 자리: [말 걸기] */
DECO.ot_hunt={g:'nil',s:1,bx:1.45,bz:.5,hp:1e9};   /* 사냥꾼 상인 가판대 자리 */
const OTN={cook:{s:6,v:-17,i:0,key:'ot_cook',name:'요리 상인',hat:'ot_chefhat',col:[246,244,236],pill:'#e0533f'},
 hunt:{s:-14,v:13,i:0,key:'ot_hunt',name:'사냥꾼 상인',hat:'ot_hunthat',col:[122,104,62],pill:'#5f7a3a'}};
const OT_LINES={cook:['어서 와요! 수달섬 요리 상인이에요.','오늘은 큰 솥에 스튜를 끓였어요. 냄새 좋죠?','모닥불에 재료를 넣으면 요리가 돼요. 소금 한 꼬집이 비결이에요.','향로버섯이 들어간 요리는 신비한 맛이 난대요.'],
 hunt:['어서 오시오. 사냥꾼 상인이오.','본섬 숲에는 약탈자 무리가 돌아다니니 조심하시오.','화살은 나무 하나, 돌 하나면 다섯 개를 만들 수 있소.','바다 멀리 고래가 숨 쉬러 올라오곤 하지. 언젠가 보고 싶군.']};
/* 꾸밈 배치(지역 좌표 s,v, 모양, 충돌 반폭) — 정면은 모두 +z(카메라 쪽) */
const OT_PROPS=[
 /* 요리(북서): 상인 둘레 = 야외 부엌 */
 ['ot_oven',-4,-12,1.0,.9],['ot_grill',15,-11,.6,.45],['ot_pot',2,-11,.85,.85],['ot_vegcrates',11,-17,.95,.45],['ot_preptable',12,-14,.8,.42],['ot_planter',-12,-15,1.05,.35],
 ['ot_picnic',-6,-1.5,1.25,1.0],['ot_picnic',3,-1.5,1.25,1.0],
 /* 사냥(남동): 상인 둘레 = 사냥 캠프 */
 ['ot_tent',-3,18,1.45,1.45],['ot_meatrack',2,9,1.15,.3],['ot_spit',-5,8,.8,.8],['ot_woodpile',16,12,1.05,.6],['ot_hideframe',-24,10,.85,.25],
 ['ot_target',-33,1,.7,.5],['ot_target',-30,4,.7,.5],
 /* 갈림길 */
 ['ot_sign',22,0,.2,.2]];
/* 큰 것(월드 구조물 DECO, 52차 배치용 모양 그대로 — 관리자 배치 도구로 옮길 수 있음): [종류, s, v, 둘레 반지름] */
const OT_BIG=[['pr_windmill',-29,-4,2.4],['pr_greenhouse',5,-22,2.7],['pr_flowers',-1,-17,1.8],['pr_flowers',18,-6,1.8],['pr_stall',-18,-9,1.6],
 ['pr_cabin',9,16,3.4],['pr_bigtree',25,7,1.2],['pr_log',-21,4,1.7],['pr_stumps',21,14,1.2],['pr_mossrock',29,11,1.1],['pr_boulders',-38,-1,1.9],['pr_reeds',2,21.5,1.3]];
/* 작은 장식(모양만 + 충돌 반지름, 0 = 지나감): [모양, s, v, 크기, 돌림, 충돌] */
const OT_FIELD={s0:-11.5,s1:-1,v0:-24.2,v1:-17.8};   /* 밭(흙) 네모, 지역 좌표 */
const OT_DECO=[
 /* 밭(온실 옆): 옥수수·토마토·감자 세 줄 */
 ...[-10,-7.5,-5,-2.5].flatMap((s,i)=>[[-23,'pc_corn_2'],[-21,'pc_tomato_2'],[-19,'pc_potato_2']].map(([v,g])=>[g,s,v,1,i*.7+v,0])),
 /* 풍차 옆 밀가루 자루·통 */
 ['sack',-33,-1,1.1,.3,.45],['sack',-32,0,1,1.2,.45],['barrel',-26,-2,1,0,.42],['barrel',10,-20,1,0,.42],
 /* 사냥 쪽 */
 ['haybale',-28,6,1,.4,.7],['haybale',-26,8,1,1.3,.7],['barrel',-9,15,1,0,.42],['haybale',-18,15,1,.2,.7]];
const OT_TREES=[[-28,8],[33,-2],[-14,-20],[-36,-4],[12,21],[31,6],[25,15],[-16,17],[17,17],[-22,12],[4,23],[-8,20],[20,-8]];
const OT_LAMPS=[[33,-3],[33,3],[17,0],[-1,-8],[5,15],[-16,6],[-20,-3]];
const OT_PATHS=[[[42,0],[26,0]],[[26,0],[14,-7],[8,-13]],[[26,0],[14,7],[2,12],[-8,16],[-12.5,17]],[[14,-7],[4,-5],[-10,-6],[-22,-6]],[[2,12],[-10,9],[-22,7],[-27,4]]];
const otLoc=(x,z)=>{const dx=x-OTR.x,dz=z-OTR.z;return[(dx-dz)*.70711,(dx+dz)*.70711]};
/* 닳은 흙길: 지형 색(world.js plWornAt) */
const OT_PW=OT_PATHS.map(l=>l.map(([s,v])=>otW(s,v)));
function otWorn(x,z){if(Math.abs(x-OTR.x)>48||Math.abs(z-OTR.z)>48)return 0;let d=9;for(const l of OT_PW)for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t))}
 const [ls,lv]=otLoc(x,z),F=OT_FIELD,fd=Math.max(Math.abs(ls-(F.s0+F.s1)/2)-(F.s1-F.s0)/2,Math.abs(lv-(F.v0+F.v1)/2)-(F.v1-F.v0)/2),fw=fd<0?.85:fd<1.2?.85*(1-fd/1.2):0;   /* 밭 흙 */
 return clamp(Math.max((1-sm(.5,1.8,d))*.5,fw)*(.75+noise(x*.6+2,z*.6+7,81)*.5),0,1)}
{const _pw=plWornAt;plWornAt=function(x,z){return Math.max(_pw(x,z),otWorn(x,z))}}
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();NOB.push({k:'otter',x:OTR.x,z:OTR.z,r:OTR.R})}}

/* ---------- 모델 ---------- */
function otModels(){
 const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const R=(w,h,d,c,p,r,cr=.03,bv=.015)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const CY=(rt,rb,h,c,p,r,n=14)=>pt(cyl(rt,rb,h,n),c,p,r);
 const SP=(rad,c,p,sc,r,a=12,b=9)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,r||0,sc);
 const RD=(a,b,r,c,n=8)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),g=cyl(r,r,L,n);g.translate(0,L/2,0);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate(a[0],a[1],a[2]);return pt(g,c)};
 const PI=Math.PI,H=(i,j)=>hash(i,j,69);
 const WD=0xd6965a,WD2=0x9e6a3e,WD3=0x7a4b2e,CRM=0xf7f0e3,RED=0xe0533f,OLV=0x6f7f45,OLV2=0x5b6a38,ST=0x9a948c,IRN=0x3b3f46,EMB=0xff8a3a;
 const fire=(p,x,z,s=1)=>{if(GEO.lk_fire)p.push(pt(GEO.lk_fire,null,[x,0,z],0,[s,s,s]));else p.push(CY(.5*s,.55*s,.12,ST,[x,.06,z]),SP(.22*s,EMB,[x,.2,z]))};
 /* 요리 가판대: 크림 몸통 + 빨간 띠 + 나무 상판, 빨강·흰 줄무늬 차양, 솥·빵·토마토·소스 병, 고추·마늘 줄, 옆 칠판 */
 {const p=[R(2.8,.92,.82,CRM,[0,.46,0]),R(2.84,.2,.05,RED,[0,.72,.42]),R(2.96,.08,.96,WD,[0,.96,0])];
  for(const x of[-1.36,1.36])for(const z of[-.38,.38])p.push(CY(.045,.05,z>0?2.05:2.45,WD3,[x,z>0?1.02:1.22,z]));
  for(let i=0;i<8;i++)p.push(R(.37,.05,1.3,i%2?CRM:RED,[-1.295+i*.37,2.2,.08],[-.3,0,0],.02,.01));
  for(let i=0;i<16;i++)p.push(pt(new THREE.CylinderGeometry(.09,.09,.04,12,1,false,0,PI),i%2?CRM:RED,[-1.4+i*.187,1.97,.72],[PI/2,0,0]));
  p.push(CY(.2,.18,.24,IRN,[-.85,1.12,0]),CY(.21,.21,.03,0x55595f,[-.85,1.25,0]),SP(.04,0x8a8e94,[-.85,1.3,0]));
  p.push(SP(.2,0xc98a4a,[-.15,1.08,.1],[1.6,.7,.9]),SP(.16,0xb87a3e,[.22,1.07,.18],[1.4,.65,.85]));
  p.push(CY(.22,.16,.1,0xf3e9d2,[.85,1.05,.05]));for(let i=0;i<5;i++)p.push(SP(.07,0xe03a2f,[.85+Math.cos(i*1.3)*.1,1.13,.05+Math.sin(i*1.3)*.1]));
  p.push(CY(.05,.05,.24,RED,[1.18,1.12,.25]),CY(.05,.05,.22,0xf2c230,[1.3,1.11,.18]),CY(.03,.03,.05,CRM,[1.18,1.26,.25]));
  for(const [x,c] of[[-1.05,0xd8352a],[1.05,0xf3ead6]])for(let i=0;i<5;i++)p.push(c===0xd8352a?pt(cone(.05,.16,6),c,[x+(i%2)*.04,1.8-i*.15,.72],[PI,0,0]):SP(.06,c,[x+(i%2)*.04,1.82-i*.15,.72]));
  p.push(R(.62,.78,.05,0x2f4a3a,[1.85,.95,.45],[-.12,-.35,0]),R(.7,.86,.03,WD,[1.85,.95,.43],[-.12,-.35,0]));
  for(let i=0;i<3;i++)p.push(R(.36-i*.06,.03,.01,0xf4f1ea,[1.85+.02,1.18-i*.16,.48],[-.12,-.35,0]));
  p.push(RD([1.7,0,.25],[1.78,1.2,.47],.025,WD3),RD([2.0,0,.25],[1.92,1.2,.47],.025,WD3),RD([1.85,0,.85],[1.85,1.1,.5],.025,WD3));
  put('ot_cookstall',p)}
 /* 사냥 가판대: 통나무 몸통 + 판자 상판, 녹색 천막, 뿔 장식 간판, 걸린 가죽, 화살 바구니·밧줄 */
 {const p=[];for(let i=0;i<3;i++){p.push(CY(.16,.16,2.8,i%2?0x8a5a32:0x9a6a3e,[0,.16+i*.3,0],[0,0,PI/2],12));for(const x of[-1.4,1.4])p.push(CY(.15,.15,.02,0xd9b07a,[x+(x>0?.01:-.01),.16+i*.3,0],[0,0,PI/2],12))}
  p.push(R(2.95,.08,.9,0xb98a55,[0,.96,0]));for(const x of[-1.38,1.38])for(const z of[-.36,.36])p.push(CY(.075,.085,z>0?2.0:2.4,WD3,[x,z>0?1.0:1.2,z],0,10));
  p.push(R(3.15,.06,1.4,OLV,[0,2.2,.06],[-.3,0,0],.03,.015),R(3.15,.24,.04,OLV2,[0,1.95,.72],[0,0,0],.02,.01));
  p.push(R(1.3,.34,.07,WD2,[0,2.55,-.3]),R(1.18,.24,.02,0xe8d4a8,[0,2.55,-.26]));
  for(const sx of[-1,1]){const b=[sx*.12,2.62,-.25];p.push(RD(b,[sx*.42,2.95,-.25],.035,0xeee2c6),RD([sx*.25,2.76,-.25],[sx*.2,3.0,-.25],.025,0xeee2c6),RD([sx*.36,2.88,-.25],[sx*.48,3.08,-.25],.022,0xeee2c6),RD([sx*.42,2.95,-.25],[sx*.6,3.0,-.25],.022,0xeee2c6))}
  p.push(SP(.12,0x6b4a30,[0,2.62,-.24],[1,.8,.6]));
  for(const [x,c] of[[-.95,0x8b5a2b],[.95,0x9a9590]]){p.push(R(.55,.72,.03,c,[x,1.5,.74],0,.12,.01),R(.18,.16,.03,c,[x-.28,1.78,.74],[0,0,.5],.06,.01),R(.18,.16,.03,c,[x+.28,1.78,.74],[0,0,-.5],.06,.01),RD([x,1.86,.74],[x,1.95,.74],.01,0x5a3b26))}
  p.push(CY(.2,.16,.3,0xc9a36a,[-.8,1.15,.05]));for(let i=0;i<7;i++){const a=i*.9,x=-.8+Math.cos(a)*.08,z=.05+Math.sin(a)*.08;p.push(RD([x,1.1,z],[x+Math.cos(a)*.06,1.62,z+Math.sin(a)*.06],.012,0xd6b37a),pt(cone(.03,.08,4),i%2?RED:CRM,[x+Math.cos(a)*.06,1.6,z+Math.sin(a)*.06]))}
  p.push(pt(new THREE.TorusGeometry(.16,.04,6,16),0xc8a674,[.3,1.05,.1],[PI/2,0,0]),R(.42,.16,.26,0xd98f7a,[.95,1.08,0],0,.05,.02),R(.44,.02,.03,0xf3e9d2,[.95,1.165,0]));
  p.push(CY(.26,.24,.62,WD2,[-1.85,.31,.35]));for(let i=0;i<9;i++){const a=i*.7,x=-1.85+Math.cos(a)*.14,z=.35+Math.sin(a)*.14;p.push(RD([x,.5,z],[x,1.05,z],.012,0xd6b37a),pt(cone(.03,.08,4),i%3?0x5b7f3a:RED,[x,1.05,z]))}
  put('ot_huntstall',p)}
 /* 돌 화덕: 돌 받침 + 둥근 흙 화덕 + 불 + 굴뚝 + 장작 */
 {const p=[R(1.8,.7,1.5,ST,[0,.35,0],0,.08,.04)];for(let i=0;i<10;i++)p.push(R(.32,.18,.04,i%2?0x8a847c:0xa9a39a,[-.75+(i%5)*.37,.18+(i>4?.3:0),.76]));
  p.push(SP(.78,0xc8744a,[0,.7,-.05],[1,.85,1],0,18,12),pt(new THREE.CylinderGeometry(.34,.34,.06,16,1,false,-PI/2,PI),0x2a1d18,[0,.86,.66],[PI/2,0,0]),SP(.16,EMB,[0,.78,.55],[1.4,.6,.8]));
  p.push(CY(.16,.18,.9,0x9c5a3a,[0,1.6,-.45]),CY(.2,.2,.08,0x7a4530,[0,2.06,-.45]));for(let i=0;i<6;i++)p.push(CY(.08,.08,.8,i%2?WD2:0x8a5a32,[1.15,.1+(i>2?.15:0),-.3+(i%3)*.2],[PI/2,0,0],8));
  put('ot_oven',p)}
 /* 바비큐 그릴: 검은 반 통 + 다리 + 꼬치 + 옆 선반 */
 {const p=[pt(new THREE.CylinderGeometry(.34,.34,.95,16,1,false,0,PI),0x2b2b30,[0,.95,0],[0,0,PI/2]),R(1.0,.04,.66,0x55595f,[0,.95,0])];
  for(const x of[-.4,.4])for(const z of[-.25,.25])p.push(CY(.03,.03,.85,IRN,[x,.43,z],0,6));
  for(let i=0;i<4;i++){const z=-.2+i*.13;p.push(RD([-.45,1.0,z],[.45,1.0,z],.01,0xc9cfd6,4));for(let j=0;j<4;j++)p.push(R(.1,.08,.08,[0x9a4a2a,0xe0533f,0xf2c230,0x6ea844][(i+j)%4],[-.27+j*.18,1.02,z],0,.03,.01))}
  p.push(R(.5,.04,.4,WD,[.78,.85,0]),CY(.02,.02,.82,IRN,[.98,.43,.15],0,6),CY(.02,.02,.82,IRN,[.98,.43,-.15],0,6));
  put('ot_grill',p)}
 /* 솥: 모닥불 + 삼발이 + 검은 솥(주황 스튜) + 국자 */
 {const p=[];fire(p,0,0,1);for(let i=0;i<3;i++){const a=i/3*PI*2;p.push(RD([Math.cos(a)*.75,0,Math.sin(a)*.75],[0,1.75,0],.035,WD3,6))}
  p.push(pt(new THREE.LatheGeometry([[0,0],[.32,.04],[.42,.2],[.44,.38],[.4,.48]].map(q=>new THREE.Vector2(q[0],q[1])),18),0x26282c,[0,.55,0]),CY(.39,.39,.02,0xe07a3a,[0,1.0,0]),RD([0,1.7,0],[0,1.05,0],.01,0x55595f,4));
  p.push(RD([.2,.98,.1],[.5,1.3,.25],.015,WD2,6),SP(.05,0xe07a3a,[.15,1.02,.12],[1.3,.5,1]));put('ot_pot',p)}
 /* 피크닉 탁자 + 빨강 파라솔 */
 {const p=[R(1.7,.07,.85,WD,[0,.76,0]),R(1.7,.06,.3,WD2,[0,.44,.62]),R(1.7,.06,.3,WD2,[0,.44,-.62])];for(const x of[-.7,.7]){p.push(RD([x,0,-.75],[x,.76,.05],.04,WD3,6),RD([x,0,.75],[x,.76,-.05],.04,WD3,6))}
  p.push(CY(.03,.03,2.3,CRM,[0,1.15,0],0,8),pt(cone(1.25,.45,12),RED,[0,2.25,0]),pt(cone(.5,.2,12),CRM,[0,2.42,0]),SP(.05,CRM,[0,2.55,0]));
  p.push(CY(.12,.1,.08,0xf3e9d2,[-.4,.84,.1]),CY(.05,.05,.14,0xc94f3d,[.35,.87,-.1]));put('ot_picnic',p)}
 /* 채소 상자 셋 */
 {const p=[];const crate=(x,z,ry,c)=>{p.push(R(.62,.4,.46,WD,[x,.2,z],[0,ry,0]),R(.64,.04,.48,WD2,[x,.38,z],[0,ry,0]));for(let i=0;i<7;i++)p.push(SP(.08,c[i%c.length],[x+(H(i,x*9)-.5)*.42,.43,z+(H(i,z*7)-.5)*.3],[1,.85,1],0,8,6))};
  crate(-.65,0,.1,[0xe03a2f,0xd02a22]);crate(.05,.08,-.08,[0xf2c230,0xe6b020]);crate(.72,-.02,.12,[0x9a6a3e,0x8a5a32]);p.push(R(.62,.4,.46,WD,[0,.6,-.05],[0,.2,0]));for(let i=0;i<5;i++)p.push(SP(.08,0x7a4a8a,[(H(i,3)-.5)*.4,.83,(H(i,4)-.5)*.3-.05]));
  put('ot_vegcrates',p)}
 /* 허브 화단 */
 {const p=[R(2.1,.42,.55,WD2,[0,.21,0]),R(2.0,.05,.46,0x5a3b26,[0,.4,0])];for(let i=0;i<9;i++)p.push(pt(new THREE.IcosahedronGeometry(.14+H(i,1)*.06,0),[0x5f9a3c,0x6ea844,0x4f8a34][i%3],[-.85+i*.21,.52,(H(i,2)-.5)*.2]));
  for(let i=0;i<4;i++)p.push(SP(.05,[0xf7f0e3,0xf28bb0,0x8f6ad8,0xffd35c][i],[-.6+i*.4,.66,.1]));put('ot_planter',p)}
 /* 손질 탁자: 도마·당근·양배추 */
 {const p=[R(1.5,.07,.75,WD,[0,.82,0])];for(const x of[-.65,.65])for(const z of[-.3,.3])p.push(CY(.04,.04,.8,WD3,[x,.4,z],0,6));
  p.push(R(.5,.04,.32,0xe0b27a,[-.2,.88,0]),R(.22,.01,.04,0xc9cfd6,[-.15,.91,.04],[0,.4,0]),R(.08,.02,.04,0x2b2b30,[-.31,.91,.0],[0,.4,0]));
  for(let i=0;i<3;i++)p.push(pt(cone(.035,.22,6),0xf08a2a,[.25+i*.07,.9,-.12],[0,0,PI/2]));p.push(SP(.14,0x8cc35a,[.45,.98,.12]));put('ot_preptable',p)}
 /* 캔버스 텐트(사냥 캠프): 용마루가 앞뒤(z)로 → 카메라에서 세모 앞면 + 걷어 올린 문 */
 {const p=[],HW=1.35,HH=1.75,L=2.6,sl=Math.hypot(HW,HH),an=Math.atan2(HH,HW),CV=0xb7b48a,CV2=0xa3a074,DK=0x2e2a22;
  const tri=(w,h)=>{const sh=new THREE.Shape();sh.moveTo(-w,0);sh.lineTo(0,h);sh.lineTo(w,0);sh.lineTo(-w,0);return new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:false})};
  for(const sx of[-1,1])p.push(pt(lkRb(sl+.12,.05,L+.16,.02,.01),sx<0?CV:CV2,[sx*HW/2,HH/2,0],[0,0,sx*-an]));
  for(const sx of[-1,1])for(let k=0;k<3;k++){const z=-L/2+.3+k*1.0;p.push(pt(lkRb(sl+.14,.06,.07,.02,.01),0x8f8c62,[sx*HW/2,HH/2+.012,z],[0,0,sx*-an]))}   /* 솔기 띠 */
  p.push(pt(tri(HW,HH),CV2,[0,0,-L/2-.015]),pt(tri(HW*.98,HH*.98),CV,[0,0,L/2-.03]));
  p.push(pt(tri(HW*.6,HH*.72),DK,[0,0,L/2+.005]));   /* 열린 문 안 어둠 */
  for(const sx of[-1,1]){const fl=new THREE.Shape();fl.moveTo(0,0);fl.lineTo(sx*HW*.62,0);fl.lineTo(0,HH*.74);fl.lineTo(0,0);const g=new THREE.ExtrudeGeometry(fl,{depth:.025,bevelEnabled:false});p.push(pt(g,0xc9c69c,[sx*HW*.6,0,L/2+.04],[0,sx*-.9,0]))}   /* 걷은 문자락 */
  p.push(pt(cyl(.035,.035,HH+.12,6),WD3,[0,(HH+.12)/2,L/2+.06]),pt(cyl(.035,.035,HH+.12,6),WD3,[0,(HH+.12)/2,-L/2-.06]),RD([0,HH+.03,-L/2-.1],[0,HH+.03,L/2+.1],.03,WD3,6));
  for(const sz of[-1,1]){p.push(RD([0,HH+.08,sz*(L/2+.06)],[0,0,sz*(L/2+.9)],.008,0xd9c9a0,4),pt(cyl(.03,.02,.16,5),WD2,[0,.06,sz*(L/2+.9)]))}
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(cyl(.025,.018,.14,5),WD2,[sx*(HW+.12),.05,sz*(L/2-.15)]));
  p.push(R(1.2,.04,.75,0x8b5a2b,[0,.03,L/2+.62],0,.04,.02),R(.9,.05,.5,0xa3463a,[0,.05,L/2+.62],0,.03,.02));
  put('ot_tent',p)}
 /* 고기 건조대 */
 {const p=[];for(const x of[-1.05,1.05]){p.push(RD([x-.25,0,0],[x,1.6,0],.04,WD3,6),RD([x+.25,0,0],[x,1.6,0],.04,WD3,6))}p.push(RD([-1.15,1.55,0],[1.15,1.55,0],.04,WD2,6));
  for(let i=0;i<7;i++){const x=-.85+i*.28;p.push(R(.13,.48+H(i,1)*.12,.04,i%2?0x8e3b2f:0xa34a36,[x,1.22-H(i,1)*.06,0],[0,0,(H(i,2)-.5)*.15],.03,.01),RD([x,1.55,0],[x,1.45,0],.006,0xd9c9a0,4))}
  put('ot_meatrack',p)}
 /* 가죽 틀 */
 {const p=[pt(new THREE.TorusGeometry(.72,.05,6,24),WD2,[0,1.05,0]),CY(.66,.66,.02,0xc9a170,[0,1.05,0],[PI/2,0,0],20),SP(.12,0xb08a5a,[0,1.25,.02],[1.4,1,.2])];
  for(let i=0;i<12;i++){const a=i/12*PI*2;p.push(RD([Math.cos(a)*.64,1.05+Math.sin(a)*.64,0],[Math.cos(a)*.72,1.05+Math.sin(a)*.72,0],.008,0xe8dcc0,4))}
  p.push(RD([-.55,0,.2],[-.45,1.1,0],.04,WD3,6),RD([.55,0,.2],[.45,1.1,0],.04,WD3,6));put('ot_hideframe',p)}
 /* 과녁 + 건초 */
 {const p=[R(1.05,.6,.6,0xe2c46a,[0,.3,0],0,.08,.04),R(1.07,.03,.62,0xc9a84a,[0,.42,0])];const rings=[[.5,CRM],[.4,RED],[.3,CRM],[.2,RED],[.1,0xf2c230]];
  rings.forEach(([r,c],i)=>p.push(CY(r,r,.05+i*.012,c,[0,1.15,.0],[PI/2,0,0],20)));p.push(RD([-.35,.55,-.2],[-.15,1.5,-.12],.03,WD3,6),RD([.35,.55,-.2],[.15,1.5,-.12],.03,WD3,6));
  for(const [x,y] of[[.08,1.2],[-.18,1.05],[.22,1.0]]){p.push(RD([x,y,.05],[x+.02,y+.02,.42],.01,0xd6b37a,4),pt(cone(.03,.07,4),RED,[x+.02,y+.02,.42],[PI/2,0,0]))}
  put('ot_target',p)}
 /* 꼬치구이 모닥불 */
 {const p=[];fire(p,0,0,1);for(const x of[-.7,.7])p.push(RD([x,0,0],[x,1.0,0],.04,WD3,6),RD([x,.85,0],[x-.12,1.08,0],.03,WD3,6),RD([x,.85,0],[x+.12,1.08,0],.03,WD3,6));
  p.push(RD([-.85,.95,0],[.85,.95,0],.02,0x8e959c,6),SP(.22,0x8a4a2a,[0,.95,0],[1.6,.85,.85],0,12,9),SP(.12,0xa35a34,[.25,.93,.05]));put('ot_spit',p)}
 /* 장작더미 + 도끼 꽂힌 그루터기 */
 {const p=[];for(let r=0;r<3;r++)for(let i=0;i<4-r;i++)p.push(CY(.13,.13,1.1,(i+r)%2?0x8a5a32:0x9a6a3e,[-.55+i*.27+r*.135,.13+r*.23,0],[PI/2,0,0],10),CY(.12,.12,.01,0xd9b07a,[-.55+i*.27+r*.135,.13+r*.23,.55],[PI/2,0,0],10));
  p.push(CY(.3,.33,.5,0x8a5a32,[.95,.25,.1]),CY(.29,.29,.01,0xd9b07a,[.95,.505,.1]));if(GEO.axe_m)p.push(pt(GEO.axe_m,null,[.95,.5,.1],[0,.6,-.35],[.9,.9,.9]));put('ot_woodpile',p)}
 /* 갈림길 표지판 */
 {const p=[CY(.07,.08,2.3,WD3,[0,1.15,0],0,8)];const arrow=(y,dir,c)=>{const s=new THREE.Shape();s.moveTo(0,-.17);s.lineTo(.95,-.17);s.lineTo(1.2,0);s.lineTo(.95,.17);s.lineTo(0,.17);s.lineTo(0,-.17);const g=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:true,bevelThickness:.01,bevelSize:.01,bevelSegments:1});if(dir<0){g.scale(-1,1,1)}g.translate(0,0,.05);p.push(pt(g,c,[0,y,0]))};
  arrow(1.95,-1,RED);arrow(1.5,1,OLV);p[p.length-1].rotateY(-1.05);put('ot_sign',p)}   /* 요리 = 서쪽(왼쪽), 사냥 = 남쪽(앞) */
 /* 본섬 쪽 다리 입구 기둥 */
 {const p=[];for(const x of[-1.6,1.6])p.push(CY(.2,.23,3.5,WD2,[x,1.75,0],0,12),CY(.24,.24,.06,WD3,[x,3.52,0],0,12));p.push(CY(.18,.18,3.8,0x8a5a32,[0,3.25,0],[0,0,PI/2],12));
  p.push(R(2.3,.56,.08,WD3,[0,2.62,.05]),R(2.18,.44,.02,0xf0d9a8,[0,2.62,.1]));for(const x of[-1.0,1.0])p.push(RD([x,3.1,.05],[x,2.92,.05],.012,0x5a3b26,4));
  for(const x of[-1.6,1.6])p.push(R(.16,.22,.16,IRN,[x,2.95,.28]),R(.11,.15,.11,0xffd36a,[x,2.95,.28]));put('ot_arch',p)}
 /* 요리사 모자·사냥 모자 */
 {const p=[CY(.24,.26,.3,0xfbfaf6,[0,.15,0],0,16),SP(.3,0xffffff,[0,.38,0],[1,.55,1],0,14,8),CY(.265,.265,.05,0xe9e5dc,[0,.04,0],0,16)];put('ot_chefhat',p)}
 {const p=[CY(.5,.52,.04,0x6b4a30,[0,0,0],0,20),CY(.26,.3,.26,0x7a5638,[0,.15,0],0,16),CY(.305,.305,.07,0x3b2a1e,[0,.06,0],0,16),SP(.26,0x7a5638,[0,.28,0],[1,.35,1],0,14,6),pt(cone(.03,.32,5),0xc9443a,[.28,.2,.05],[0,0,-.6]),pt(cone(.025,.26,5),0x5b7f3a,[.3,.18,.0],[0,0,-.8])];put('ot_hunthat',p)}
}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{otModels()}catch(e){console.error('otter: 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}

/* ---------- 다리 ---------- */
let OTB=null;   /* {G:문 자리, d:방향, S0,S1:다리 끝, y(t)} */
function otBridgeLine(){const [ax,az]=OTR.b0,[bx,bz]=OTR.b1;let dx=bx-ax,dz=bz-az;const L=Math.hypot(dx,dz);dx/=L;dz/=L;const mx=(ax+bx)/2,mz=(az+bz)/2;
 const walk=sg=>{for(let t=0;t<60;t+=.1){const x=mx+sg*dx*t,z=mz+sg*dz*t;if(hAt(x,z)>=.98)return[x,z]}return[mx+sg*dx*25,mz+sg*dz*25]};
 const A=walk(-1),B=walk(1),S0=[A[0]-dx*1.2,A[1]-dz*1.2],S1=[B[0]+dx*1.4,B[1]+dz*1.4],G=[A[0]-dx*2.4,A[1]-dz*2.4];
 const y0=Math.max(hAt(S0[0],S0[1]),.98)+.04,y1=Math.max(hAt(S1[0],S1[1]),.98)+.04,len=Math.hypot(S1[0]-S0[0],S1[1]-S0[1]);
 const yAt=t=>y0+(y1-y0)*t+.55*Math.sin(Math.PI*clamp(t,0,1));
 return{A,B,S0,S1,G,dx,dz,px:-dz,pz:dx,len,yAt}}
function otBridgeGeo(b){const p=[],{S0,dx,dz,px,pz,len,yAt}=b,r=Math.atan2(dx,dz),W=1.22;
 const at=(t,o)=>[S0[0]+dx*len*t+px*o,S0[1]+dz*len*t+pz*o];
 const BX=(w,h,dd,c,pos,rx=0)=>pt(box(w,h,dd),c,pos,[rx,r,0]);
 const slope=t=>{const e=.002;return Math.atan2((yAt(t+e)-yAt(t-e)),2*e*len)};
 const WC=[0xc98a52,0xbf7f48,0xd39a5e,0xb87644];
 /* 판자 */
 const np=Math.floor(len/.34);for(let i=0;i<=np;i++){const t=i/np,[x,z]=at(t,0),y=yAt(t);p.push(BX(2.5,.08,.29,WC[(i*7)%4],[x,y-.04,z],-slope(t)))}
 /* 아래 받침 보 두 줄 */
 const ns=Math.ceil(len/1.6);for(let i=0;i<ns;i++){const t=(i+.5)/ns;for(const o of[-.85,.85]){const [x,z]=at(t,o);p.push(BX(.16,.18,len/ns+.04,0x8a5a32,[x,yAt(t)-.17,z],-slope(t)))}}
 /* 통나무 기둥 + 가로 버팀(물속 바닥까지) */
 const nk=Math.max(2,Math.round(len/4.6));for(let i=0;i<=nk;i++){const t=i/nk,y=yAt(t);for(const o of[-1.05,1.05]){const [x,z]=at(t,o),f=Math.min(hAt(x,z),0)-.4;if(hAt(x,z)>y-.3)continue;const h=y-.12-f;p.push(pt(cyl(.15,.17,h,10),0x7a4b2e,[x,f+h/2,z]),pt(cyl(.16,.16,.04,10),0x5f3a22,[x,.02,z]))}
  const [cx,cz]=at(t,0);if(hAt(cx,cz)<y-.6)p.push(BX(2.3,.12,.12,0x8a5a32,[cx,Math.max(.25,y-.55),cz]))}
 /* 난간: 기둥 + 두 줄 손잡이 */
 const nr=Math.ceil(len/2.1);for(const o of[-W,W]){for(let i=0;i<=nr;i++){const t=i/nr,[x,z]=at(t,o),y=yAt(t);p.push(pt(lkRb(.12,1.08,.12,.03,.02),0x8a5a32,[x,y+.5,z]),pt(lkRb(.16,.06,.16,.02,.01),0x6b4228,[x,y+1.06,z]))
   if(i<nr){const t2=(i+1)/nr,[x2,z2]=at(t2,o),y2=yAt(t2),mx=(x+x2)/2,mz=(z+z2)/2,L=Math.hypot(x2-x,z2-z),sl=-Math.atan2(y2-y,L);p.push(BX(.09,.08,L+.06,0xc98a52,[mx,(y+y2)/2+.98,mz],sl),BX(.06,.06,L+.04,0xb87644,[mx,(y+y2)/2+.55,mz],sl))}}}
 /* 등불(기둥 넷마다) */
 const lg=[];for(let i=2;i<nr;i+=4)for(const o of[-W,W]){const t=i/nr,[x,z]=at(t,o),y=yAt(t);p.push(pt(box(.2,.05,.2),0x2f3338,[x,y+1.38,z],[0,r,0]),pt(box(.2,.05,.2),0x2f3338,[x,y+1.12,z],[0,r,0]),pt(cyl(.012,.012,.2,4),0x2f3338,[x,y+1.24,z]));lg.push(pt(box(.14,.2,.14),0xffd36a,[x,y+1.25,z],[0,r,0]))}
 return{wood:mg(p),glow:lg.length?mg(lg):null}}

/* ---------- 철조망 둘레 ---------- */
function otFenceLoop(){const N=144,rs=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2,c=Math.cos(a),s=Math.sin(a);let r=0;for(let q=2;q<70;q+=.2){if(hAt(OTR.x+c*q,OTR.z+s*q)<.97){r=q;break}}rs.push(r)}
 const sm2=rs.map((r,i)=>Math.min(r,(rs[(i+N-1)%N]+r+rs[(i+1)%N])/3));const pts=[];
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2,c=Math.cos(a),s=Math.sin(a);let r=sm2[i]-1.6;while(r>3&&hAt(OTR.x+c*r,OTR.z+s*r)<.98)r-=.2;pts.push([OTR.x+c*r,OTR.z+s*r])}
 const out=[pts[0]];for(let i=1;i<N;i++){const q=out[out.length-1];if(Math.hypot(pts[i][0]-q[0],pts[i][1]-q[1])>1.2)out.push(pts[i])}return out}

/* ---------- 짓기 ---------- */
function otBuild(){if(typeof lkModel!=='function'||!GEO.ot_cookstall)return;const gh=(x,z)=>hAt(x,z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x,z,r,hp:1e9}),at=(g,x,z,ry=0,m,dy=0)=>plAdd(g,x,gh(x,z)-.02+dy,z,ry,m);
 CLEARS.push([OTR.x,OTR.z,OTR.R]);
 const b=OTB=otBridgeLine();CLEARS.push([b.S1[0]+b.dx*3.5,b.S1[1]+b.dz*3.5,7.5]);   /* 본섬 쪽 다리 입구 앞 나무·바위 비우기 */
 /* 다리 */
 {const g=otBridgeGeo(b);plAdd(g.wood,0,0,0);if(g.glow){const m=new THREE.MeshBasicMaterial({color:0xffd36a});plAdd(g.glow,0,0,0,0,m)}
  const n=Math.ceil(b.len/1.5),r=Math.atan2(b.dx,b.dz);for(let i=0;i<n;i++){const t=(i+.5)/n,x=b.S0[0]+b.dx*b.len*t,z=b.S0[1]+b.dz*b.len*t;addDock(x,z,r,1.16,b.len/n/2+.06,b.yAt(t))}
  for(const o of[-1.3,1.3]){const ax=b.G[0]+b.px*o,az=b.G[1]+b.pz*o,ex=b.S1[0]+b.px*o,ez=b.S1[1]+b.pz*o;plWallSeg(ax,az,ex,ez,.14)}
  /* 본섬 쪽 입구 기둥 + 간판 */
  const ex=b.S1[0]-b.dx*.4,ez=b.S1[1]-b.dz*.4,ry=Math.atan2(-b.dx,-b.dz),arch=at(GEO.ot_arch,ex,ez,ry);const t=plSignText('🍳 수달섬 🏹',2.1,.42);t.position.set(0,2.62,.115);arch.add(t);
  for(const o of[-1.6,1.6])bl(ex+b.px*o,ez+b.pz*o,.26,.26)}
 /* 철조망 + 문 */
 {const loop=otFenceLoop(),G=b.G;let i0=0,bd=1e9;loop.forEach((q,i)=>{const d=Math.hypot(q[0]-G[0],q[1]-G[1]);if(d<bd){bd=d;i0=i}});
  const N=loop.length,arc=[];for(let k=1;k<N;k++){const q=loop[(i0+k)%N];if(Math.hypot(q[0]-G[0],q[1]-G[1])>2.6)arc.push(q)}
  const e1=[G[0]+b.px*1.32,G[1]+b.pz*1.32],e2=[G[0]-b.px*1.32,G[1]-b.pz*1.32],d1=Math.hypot(arc[0][0]-e1[0],arc[0][1]-e1[1]),d2=Math.hypot(arc[0][0]-e2[0],arc[0][1]-e2[1]);
  const pts=d1<d2?[e1,...arc,e2]:[e2,...arc,e1];OTB.fence=pts;
  plAdd(mg(plFenceGeo(pts,true,(x,z)=>Math.hypot(x-G[0],z-G[1])<2.5)),0,0,0);   /* 문 자리 2.5m 안은 막지 않고, 문 기둥 → 첫 철조망 점까지는 따로 벽 */
  plWallSeg(pts[0][0],pts[0][1],pts[1][0],pts[1][1],.3);plWallSeg(pts[pts.length-1][0],pts[pts.length-1][1],pts[pts.length-2][0],pts[pts.length-2][1],.3);
  const rg=Math.atan2(-b.dx,-b.dz),g=addStruct({t:'cgate',x:G[0],z:G[1],r:rg});g.open=false;g.ot=0;const t=plSignText('🍳 수달섬 🏹');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 /* 상인 가판대 + 사람 자리 */
 for(const k in OTN){const q=OTN[k],[x,z]=otW(q.s,q.v);at(GEO[k==='cook'?'ot_cookstall':'ot_huntstall'],x,z,0);addStruct({t:q.key,x,z,r:0});q.x=x;q.z=z-.98;q.rot=0;addStruct({t:'iblk2',x:q.x,z:q.z,r:0});
  const sg=plSignText(k==='cook'?'🍳 요리 상인':'🏹 사냥꾼 상인',2.2,.42);sg.position.set(x,gh(x,z)+2.98,z+.62);sg.rotation.x=-.12;scene.add(sg)}
 /* 꾸밈: 철조망 안쪽 + 철조망에서 m 넘게 떨어진 땅에만(아니면 OTR.miss에 이름) */
 const F=OTB.fence,otIn=(x,z,m)=>{if(gh(x,z)<.97)return false;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;
   const dx=q[0]-a[0],dz=q[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t))}return c&&d>m};
 OTR.miss=[];for(const [g,s,v,bx,bz] of OT_PROPS){const [x,z]=otW(s,v);if(!otIn(x,z,Math.hypot(bx,bz)+.8)){OTR.miss.push(g);continue}at(GEO[g],x,z,0);bl(x,z,bx,bz)}
 for(const [t,s,v,R] of OT_BIG){const [x,z]=otW(s,v);if(!DECO[t]||!otIn(x,z,R+.6)){OTR.miss.push(t);continue}addStruct({t,x,z,r:0})}
 for(const [g,s,v,sc,ry,cr] of OT_DECO){const [x,z]=otW(s,v);if(!GEO[g]||!otIn(x,z,1)){OTR.miss.push(g);continue}const o=at(GEO[g],x,z,ry);if(sc!==1)o.scale.setScalar(sc);if(cr)bl(x,z,cr,cr)}
 for(const [s,v] of OT_TREES){const [x,z]=otW(s,v);if(!otIn(x,z,1.6)){OTR.miss.push('tree');continue}const k=hash(s,v,69)>.5?'tree_single_A':'tree_single_B',sc=3.6+hash(v,s,70)*.7;if(GEO[k]){at(GEO[k],x,z,hash(s,v,71)*6).scale.setScalar(sc);bl(x,z,.42,.42)}}
 for(const [s,v] of OT_LAMPS){const [x,z]=otW(s,v);if(otIn(x,z,.8))addStruct({t:'suplamp',x,z,r:0});else OTR.miss.push('lamp')}
}
{const _bpl=buildPlaces;buildPlaces=function(){_bpl();try{otBuild()}catch(e){console.error('수달섬 만들기 실패',e)}}}

/* ---------- 상인 사람 ---------- */
const OTM={};function otMat(k){if(OTM[k])return OTM[k];const src=CMAT.merchant&&CMAT.merchant.map;if(!src||typeof recolor!=='function')return null;const [r,g,b]=OTN[k].col,t=recolor(src,hueTo(isBlue,r,g,b));return OTM[k]={s:new THREE.MeshLambertMaterial({map:t,skinning:true}),n:new THREE.MeshLambertMaterial({map:t})}}
function otTalk(k){const q=OTN[k];if(!q)return;const L=OT_LINES[k],s=L[q.i%L.length];q.i++;if(typeof CHAT!=='undefined')CHAT.say(q.key,s);else toast(s);sfx(k==='cook'?640:520,.05,'sine',.03);if(q.a)q.a.play('Interact',{once:1,lock:.6,force:1})}
if(typeof CHAT!=='undefined'){const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){for(const n in OTN){const q=OTN[n];if(k===q.key)return q.x!==undefined&&dist(q.x,q.z,P.x,P.z)<40?{x:q.x,z:q.z,y:3.05}:null}return _an(k)}}
function otUpd(dt){for(const k in OTN){const q=OTN[k];if(q.x===undefined)continue;
  if(!q.a&&CMAT.fisher&&otMat(k)){const a=q.a=new Actor('fisher'),M=otMat(k);a.root.traverse(o=>{if(o.isMesh)o.material=o.isSkinnedMesh?M.s:M.n});if(a.head&&GEO[q.hat]){const h=mesh(GEO[q.hat],MATT);h.position.set(0,1.02,.02);h.rotation.x=-.08;h.scale.setScalar(k==='cook'?1.25:1.3);a.head.add(h)}a.play('Idle',{force:1});a.set(q.x,q.z,0)}
  if(q.a){const d=dist(P.x,P.z,q.x,q.z);q.a.root.visible=d<90;if(d<60){const want=d<7?Math.atan2(P.x-q.x,P.z-q.z):0;let df=want-q.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;q.rot+=df*Math.min(1,dt*4);q.a.root.rotation.y=q.rot;q.a.mixer.update(dt)}}}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{otUpd(dt)}catch(e){}}}
{const _sl=sLabel;sLabel=function(s){if(s.t==='ot_cook'||s.t==='ot_hunt')return'말 걸기';return _sl(s)}}
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'&&(t.s.t==='ot_cook'||t.s.t==='ot_hunt')){if(inp.actEdge)otTalk(t.s.t==='ot_cook'?'cook':'hunt');return}return _ia()}}
if(typeof drawFx==='function'){const _df=drawFx;drawFx=function(dt){_df(dt);try{if(mode!=='play')return;for(const k in OTN){const q=OTN[k];if(!q.a||dist(q.x,q.z,P.x,P.z)>=14||(typeof CHAT!=='undefined'&&CHAT.b&&CHAT.b.has(q.key)))continue;
  const s=Math.max(.8,UIS*1.25),p=scr(q.x,groundY(q.x,q.z)+3.6,q.z);uiPill(fctx,q.name,p[0],p[1],12.5*s,q.pill,'#fff')}}catch(e){}}}
