/* 61차(디자인) — 신발 4종 (기획자 11-22 22:09)
   '신발 시리즈: 일반 부츠(가죽, 이동 속도 +5%) · 군화(이동 속도 −5%, 받는 피해 −20%) · 경량화 신발(조준할 때 느려지는 것 없음, 근접이든 원거리든)
    · 무지개 신발(공격력 +5%, 받는 피해 −5%, 3초마다 0.1칸 회복, 이동 속도 +5%, 치명타 5%, 바다 헤엄 +10%)'
   - 가방 [🧍 장비] 탭의 신발 칸(eq:'shoes', 48차 gear.js)에 끼면 효과가 켜지고, 캐릭터 두 발에 신겨요(탐험가·리트리버·오리너구리).
   - 효과 숫자는 SHOEFX 한 곳. 가격은 임시(p가 있어서 랜덤 자판기에 저절로 나와요).
   - 모자(buffs.js)와 같이 쓰면 효과가 더해져요(빠르기·치명타 확률은 더하기, 받는 피해·공격력은 곱하기).
   - 멀티 서버는 아직 신발 효과를 몰라요(빠르기 검사·PvP 피해·치명타, 서버 마무리 때).
   index.html에서 이 줄을 빼면 신발 아이템·효과가 모두 꺼져요. */
Object.assign(ITEMS,{
 shoes_boot:{n:'가죽 부츠',ty:'res',eq:'shoes',one:1,p:1200,ic:'lk_shoes_boot',d:'튼튼한 가죽 부츠. 이동 속도 +5%'},
 shoes_mil:{n:'군화',ty:'res',eq:'shoes',one:1,p:2200,ic:'lk_shoes_mil',d:'받는 피해 −20%. 무거워서 이동 속도 −5%'},
 shoes_light:{n:'경량화 신발',ty:'res',eq:'shoes',one:1,p:2000,ic:'lk_shoes_light',d:'조준하거나 쏘거나 휘두르는 동안에도 느려지지 않아요(근접·원거리 모두)'},
 shoes_rainbow:{n:'무지개 신발',ty:'res',eq:'shoes',one:1,p:6000,ic:'lk_shoes_rainbow',d:'공격력 +5% · 받는 피해 −5% · 3초마다 에너지 +0.1칸 · 이동 속도 +5% · 치명타 5% · 헤엄 +10%'}});
const SHOEFX={shoes_boot:{sp:.05},shoes_mil:{sp:-.05,dmg:-.2},shoes_light:{noAimSlow:1},
 shoes_rainbow:{atk:.05,dmg:-.05,regen:1,every:3,sp:.05,crit:.05,swim:.1}};
const SHOE={rT:0};
const shoeOn=()=>{if(typeof eqGet!=='function'||!S||!S.eq)return null;const k=eqGet('shoes');return k&&SHOEFX[k]&&invN(k)>0?k:null};
const shoeFx=()=>SHOEFX[shoeOn()]||{};
/* 모자 + 신발 효과 하나로(guns.js가 경량화 신발 noAimSlow를 이걸로 봐요) */
function gearFx(k){const h=typeof hatFx==='function'?hatFx():{},s=shoeFx();return (h[k]||0)+(s[k]||0)}

/* ---------- 효과 ---------- */
/* 빠르기: 부츠 +5% · 군화 −5% · 무지개 +5%(헤엄칠 땐 +10% 더) — buffs.js의 빠르기 배수에 더해요 */
{const _bs=bufSpeed;bufSpeed=function(){let s=_bs.apply(this,arguments);const F=shoeFx();s+=F.sp||0;if(F.swim&&typeof WTR!=='undefined'&&WTR.st==='swim')s+=F.swim;return Math.max(.1,s)}}
/* 받는 피해: 군화 −20% · 무지개 −5% */
{const _h=hurtPlayer;hurtPlayer=function(d){const k=1+(shoeFx().dmg||0);if(k===1)return _h.apply(this,arguments);const a=[...arguments];a[0]=d*k;return _h.apply(this,a)}}
/* 공격: 무지개 신발 공격력 +5% · 치명타 5%(피해 2배, 강탈 모자와 따로 굴려요) */
{const _a=attack;attack=function(){const id=curId(),w=WEAP[id],F=shoeFx();if(!w||P.cd>0||w.nade||w.rod||!(F.atk||F.crit))return _a.apply(this,arguments);
 const crit=!!F.crit&&Math.random()<F.crit,mul=(1+(F.atk||0))*(crit?2:1),dm0=w.dmg;
 if(!w.melee){w.dmg=dm0*mul;if(crit&&typeof BUF!=='undefined')BUF.critNow=true}
 try{_a.apply(this,arguments)}finally{w.dmg=dm0;if(!w.melee&&crit&&typeof BUF!=='undefined')BUF.critNow=false}
 if(w.melee&&P.cd>0&&P.hitW&&!P.hitW._shoe)P.hitW=Object.assign({},P.hitW,{dmg:P.hitW.dmg*mul,crit:P.hitW.crit||(crit?1:0),_shoe:1})}}
/* 회복: 무지개 신발 3초마다 에너지 +0.1칸(S.hp +1) · 신발 신기(발에 보이게) */
{const _us=updStats;updStats=function(dt){const r=_us.apply(this,arguments);const F=shoeFx();
 if(F.regen&&mode==='play'&&!P.dead&&!busy){SHOE.rT+=dt;while(SHOE.rT>=F.every){SHOE.rT-=F.every;if(S.hp<100&&!DEV.on){S.hp=Math.min(100,S.hp+F.regen);hudDirty=true}}}else SHOE.rT=0;
 shoeSync();return r}}

/* ---------- 발에 신기: 발뼈(탐험가 footl/footr, 리트리버·오리너구리 dg_footl/dg_footr)에 붙여요 ----------
   발뼈는 비스듬히 누워 있어서, '서 있을 때(Idle) 신발 바닥이 땅에 평평하고 앞코가 발끝 쪽'이 되도록 잰 값(SHOE_FIT)을 써요.
   p = 발뼈 기준 신발 자리, q = 발뼈 기준 회전(사원수), s = 크기. 값은 tools/p61_check.py가 다시 잴 수 있어요(FIT=1). */
const SHOE_FIT={   /* s = [폭, 높이, 길이] 배율 — 리트리버 발은 둥글고 넓고, 오리너구리 발은 물갈퀴라 더 넓고 길어요 */
 hero:{s:[1.15,1.25,1.05],L:{p:[.0035,.1724,.0491],q:[.9275,0,0,-.3738]},R:{p:[-.0036,.1711,.0499],q:[.9275,0,0,-.3738]}},
 dog:{s:[1.45,1.45,1.1],L:{p:[-.0052,.1547,.0406],q:[.9275,0,0,-.3738]},R:{p:[.0036,.1541,.0413],q:[.9275,0,0,-.3738]}},
 plat:{s:[1.62,1.5,1.28],L:{p:[-.0214,.1915,.0121],q:[.9275,0,0,-.3738]},R:{p:[-.0048,.1919,.0111],q:[.9275,0,0,-.3738]}}};
function shoeSync(){shoeWear(P&&P.a,shoeOn())}
function shoeWear(a,id){if(!a)return;const v=a.dog&&a.dog.v||'hero',key=id?id+'|'+v:'';
 if(a._shoeK===key&&a._shoeDog===a.dog&&(!id||a._shoes&&a._shoes.length&&a._shoes[0].parent))return;
 if(a._shoes)for(const m of a._shoes)m.parent&&m.parent.remove(m);a._shoes=null;a._shoeK=key;a._shoeDog=a.dog;
 if(!id||!GEO['lk_'+id+'_1'])return;const F=SHOE_FIT[v]||SHOE_FIT.dog,nm=a.dog?['dg_footl','dg_footr']:['footl','footr'],out=[];
 for(let i=0;i<2;i++){const b=a.root.getObjectByName(nm[i]);if(!b)continue;const f=i?F.R:F.L;
  const m=mesh(GEO['lk_'+id+'_1'],a.xr&&typeof xrMat==='function'?xrMat(MATT):MATT);if(a.xr)m.renderOrder=5;m.castShadow=true;m.userData.shoe=1;
  m.position.set(f.p[0],f.p[1],f.p[2]);m.quaternion.set(f.q[0],f.q[1],f.q[2],f.q[3]);m.scale.set(F.s[0],F.s[1],F.s[2]);
  if(typeof PV_L!=='undefined')m.layers.enable(PV_L);b.add(m);out.push(m)}
 a._shoes=out;if(!out.length)a._shoeK=null}   /* 발뼈를 아직 못 찾았으면 다음에 다시 */

/* ---------- 모양: 신발 하나(_1, 발에 신김: 바닥 가운데가 원점, 앞코 +z, 길이 약 0.46) + 아이콘용 한 켤레 ----------
   윗부분 = 옆모습 윤곽(z·y)을 폭만큼 밀어 낸 뒤 둥글게 깎고(bevel), 발 모양처럼 뒤꿈치·앞코를 좁혀요(shTaper).
   옆에 붙는 무늬(무지개·날개·별)도 같은 방식으로 좁혀서 겉면에 딱 붙어요. */
function shModels(){
 const put=(k,p,sm=42)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const L=.46,W=.29,hl=L/2;
 const R=(w,h,d,c,p,r,cr=.03,bv=.016)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const E=(rx,ry,rz,c,p,r)=>pt(new THREE.SphereGeometry(1,16,10),c,p,r,[rx,ry,rz]);
 const CY=(r1,r2,h,c,p,r,sc,n=18)=>pt(cyl(r1,r2,h,n),c,p,r,sc);
 const TO=(Rr,t,c,p,r,sc,arc=Math.PI*2)=>pt(new THREE.TorusGeometry(Rr,t,8,28,arc),c,p,r,sc);
 /* 발 폭(앞뒤 위치 z → 0~1): 뒤꿈치 조금 좁고, 발볼에서 가장 넓고, 앞코로 둥글게 */
 const fW=z=>{const t=(z+hl)/L;const f=t<.6?.84+.16*Math.sin(Math.max(0,t)/.6*Math.PI/2):Math.sqrt(Math.max(0,1-Math.pow((t-.6)/.42,2)));return Math.max(.22,f)};
 const taper=g=>{const P=g.attributes.position;for(let i=0;i<P.count;i++)P.setX(i,P.getX(i)*fW(P.getZ(i)));P.needsUpdate=true;return g};
 /* 옆모습 윤곽 → 폭 w로 밀어 내기(둥근 모서리 bv). pts: [z,y] 또는 [cz,cy,z,y](둥근 꺾임) */
 const shp=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const q=pts[i];q.length===2?s.lineTo(q[0],q[1]):s.quadraticCurveTo(q[0],q[1],q[2],q[3])}return s};
 const prof=(pts,w,c,bv=.035)=>{const g=new THREE.ExtrudeGeometry(shp(pts),{depth:Math.max(.004,w-2*bv),bevelEnabled:true,bevelThickness:bv,bevelSize:bv*.9,bevelSegments:4,curveSegments:10});
  g.rotateY(-Math.PI/2);g.translate((w-2*bv)/2,0,0);return pt(g,c,[0,0,0])};
 /* 윤곽을 직선(a·z + b·y ≤ c)들로 잘라 조각(패널)마다 다른 색으로 — 조각 사이는 둥근 홈(박음질 자리)처럼 보여요 */
 const poly=pts=>{const v=shp(pts).getPoints(12).map(q=>[q.x,q.y]);const f=v[0],l=v[v.length-1];if(Math.hypot(f[0]-l[0],f[1]-l[1])<1e-6)v.pop();return v};
 const clip=(P,a,b,c)=>{const o=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length],da=a*A[0]+b*A[1]-c,db=a*B[0]+b*B[1]-c;if(da<=0)o.push(A);if((da<0&&db>0)||(da>0&&db<0)){const t=da/(da-db);o.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t])}}return o};
 const panel=(base,hs,w,c,bv=.03)=>{let P=base;for(const h of hs){P=clip(P,h[0],h[1],h[2]);if(P.length<3)return[]}const s=new THREE.Shape();s.moveTo(P[0][0],P[0][1]);for(const q of P.slice(1))s.lineTo(q[0],q[1]);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.004,w-2*bv),bevelEnabled:true,bevelThickness:bv,bevelSize:bv*.9,bevelSegments:4,curveSegments:10});g.rotateY(-Math.PI/2);g.translate((w-2*bv)/2,0,0);return[pt(g,c,[0,0,0])]};
 /* 비스듬한 선(z0,y0)-(z1,y1)의 앞(+)/뒤(−) 쪽 */
 const seam=(z0,y0,z1,y1,front)=>{const a=y1-y0,b=-(z1-z0),c=a*z0+b*y0;return front?[-a,-b,-c]:[a,b,c]};
 /* 옆면 무늬: 납작한 모양을 양옆(x = ±x0)에 */
 const side=(s,c,x0,d=.007)=>{const out=[];for(const k of[1,-1]){const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:14});g.rotateY(-Math.PI/2);
   if(k>0)g.translate(x0+d*.4,0,0);else{g.translate(d*.6,0,0);g.scale(-1,1,1);g.translate(-x0+0,0,0);const ix=g.index;if(!ix){const P=g.attributes.position;for(let i=0;i<P.count;i+=3){const a=[P.getX(i+1),P.getY(i+1),P.getZ(i+1)];P.setXYZ(i+1,P.getX(i+2),P.getY(i+2),P.getZ(i+2));P.setXYZ(i+2,a[0],a[1],a[2])}}}
   out.push(pt(g,c,[0,0,0]))}return out};
 const arcS=(cz,cy,ri,ro,a0=0,a1=Math.PI)=>{const s=new THREE.Shape();s.absarc(cz,cy,ro,a0,a1,false);s.absarc(cz,cy,ri,a1,a0,true);return s};
 /* 발바닥(밑창): 뒤꿈치 좁고 앞이 둥근 모양 — 길이 L, 폭 W, 두께 th, 바닥 높이 y0 */
 const sole=(Ls,Ws,th,c,y0=0)=>{const s=new THREE.Shape(),h=Ls/2,hw=Ws/2;
  s.moveTo(0,-h);s.bezierCurveTo(hw*.95,-h,hw*.9,-h*.55,hw*.86,-h*.2);s.bezierCurveTo(hw*.84,h*.12,hw*1.04,h*.42,hw*.96,h*.72);
  s.bezierCurveTo(hw*.86,h*1.02,-hw*.86,h*1.02,-hw*.96,h*.72);s.bezierCurveTo(-hw*1.04,h*.42,-hw*.84,h*.12,-hw*.86,-h*.2);s.bezierCurveTo(-hw*.9,-h*.55,-hw*.95,-h,0,-h);
  const b=Math.min(.012,th*.3),g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.002,th-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:10});
  g.rotateX(Math.PI/2);g.translate(0,th-b+y0,0);return pt(g,c,[0,0,0])};
 /* 끈: 아래(y0,z0) → 위(y1,z1)로 엇갈린 X + 끈 구멍 */
 const laces=(p,c,eye,y0,y1,z0,z1,n,w=.16)=>{const th=Math.atan2(z1-z0,y1-y0);for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t,z=z0+(z1-z0)*t;
   for(const s of[1,-1])p.push(R(w*.66,.016,.014,c,[0,y,z],[th,0,s*.36],.006,.004));
   if(eye)for(const s of[1,-1])p.push(CY(.012,.012,.012,eye,[s*w*.36,y,z],[Math.PI/2+th,0,0],undefined,10))}};
 /* 발목 입구(어두운 안감 + 도톰한 테) */
 const mouth=(p,y,cz,rz,rx,col,lin)=>{p.push(CY(rx*.92,rx*.92,.012,lin,[0,y+.004,cz],0,[1,1,rz/rx]),TO(rx,.022,col,[0,y,cz],[Math.PI/2,0,0],[1,rz/rx,1]))};
 const sets={};
 /* 1) 가죽 부츠: 캐러멜 가죽 발목 부츠 · 짙은 가죽 앞코·뒤꿈치 덧댐 · 두툼한 고무 밑창 + 크림 박음질 띠 · 놋쇠 끈 구멍 · 뒤 고리 */
 {const LE=0xc17c45,LE2=0xb06d3b,LD=0x87502b,SO=0x4a3226,WE=0xead2a6,LA=0xf3e4c6,BR=0xd9a94e,p=[],u=[],w=W*.86;
  p.push(sole(L,W,.046,SO,0),sole(L*.985,W*.985,.016,WE,.044));
  const B=poly([[-.168,.05],[-.172,.25],[-.02,.25],[-.014,.19],[.0,.118,.1,.1],[.17,.084],[.205,.078,.2,.05]]);
  const toe=seam(.07,.05,.115,.11,1),bk=seam(.07,.05,.115,.11,0),hc=seam(-.11,.05,-.075,.15,0),hcF=seam(-.11,.05,-.075,.15,1);
  u.push(...panel(B,[toe],w,LD),...panel(B,[bk,hcF,[0,1,.165]],w,LE),...panel(B,[bk,[0,-1,-.165]],w,LE),...panel(B,[hc,[0,1,.165]],w,LE2));
  u.push(...panel(poly([[-.022,.15],[-.02,.268],[.028,.268],[.034,.15]]),[],.13,LD,.02));
  mouth(u,.278,-.092,.098,.09,LD,0x3a2618);
  u.push(R(.05,.07,.02,LD,[0,.305,-.207],[.12,0,0],.014,.008));
  laces(u,LA,BR,.125,.245,.112,.05,5,.17);
  sets.boot=[...p,taper(mg(u))]}
 /* 2) 군화: 높은 목(국방색 천) + 아래·앞코는 검은 가죽 · 아주 두꺼운 홈 밑창 · 버클 띠 · 쇠 고리 · 국방색 끈 */
 {const BK=0x34373c,BK2=0x2a2c30,OL=0x687649,OLD=0x515c3a,SO=0x1d1f22,ME=0xa3aab2,LA=0x7a8659,p=[],u=[],w=W*.86;
  p.push(sole(L*1.02,W*1.03,.064,SO,0),sole(L*.98,W*.99,.012,0x40444a,.062));
  for(let i=0;i<5;i++)for(const s of[1,-1])p.push(R(.05,.03,.045,SO,[s*W*.37,.012,-.17+i*.085],0,.008,.006));
  const B=poly([[-.168,.06],[-.172,.36],[-.02,.36],[-.014,.25],[.0,.135,.1,.112],[.17,.094],[.205,.088,.2,.06]]);
  const toe=seam(.06,.06,.1,.12,1),bk=seam(.06,.06,.1,.12,0);
  u.push(...panel(B,[toe],w,BK2),...panel(B,[bk,[0,1,.175]],w,BK),...panel(B,[[0,-1,-.175]],w,OL));
  u.push(...panel(B,[[0,-1,-.285],[0,1,.32]],w+.014,OLD,.014));
  u.push(...panel(poly([[-.022,.2],[-.02,.38],[.028,.38],[.034,.2]]),[],.13,OLD,.02));
  mouth(u,.388,-.092,.1,.09,BK,0x1c1e21);
  u.push(R(.05,.045,.03,ME,[.118,.302,-.02],[0,.5,0],.008,.006),R(.05,.045,.03,ME,[-.118,.302,-.02],[0,-.5,0],.008,.006));
  laces(u,LA,ME,.15,.36,.112,.05,6,.18);
  sets.mil=[...p,taper(mg(u))]}
 /* 3) 경량화 신발: 낮은 하늘색 그물 운동화 · 두꺼운 흰 쿠션 밑창 + 남색 바닥 · 옆에 흰 날개 · 노란 뒤꿈치 고리 */
 {const SK=0x78c6f0,SKD=0x4f9fd6,SKL=0xcfeafb,WH=0xf6f3ec,NV=0x2f5d99,YE=0xf7c948,p=[],u=[],w=W*.84;
  p.push(sole(L*.99,W*.99,.02,NV,0),sole(L,W*1.03,.05,WH,.018));
  for(let i=0;i<4;i++)for(const s of[1,-1])p.push(R(.01,.018,.06,SKD,[s*W*.49,.044,-.13+i*.075],0,.004,.003));
  const B=poly([[-.168,.07],[-.172,.155],[-.12,.168,-.06,.145],[.0,.13],[.06,.12,.11,.104],[.17,.09],[.205,.086,.2,.07]]);
  const toe=seam(.1,.07,.13,.12,1),bk=seam(.1,.07,.13,.12,0),hl2=seam(-.1,.07,-.08,.17,0),hlF=seam(-.1,.07,-.08,.17,1);
  u.push(...panel(B,[toe],w,SKL,.028),...panel(B,[bk,hlF],w,SK,.028),...panel(B,[hl2],w,SKD,.028));
  u.push(...panel(poly([[-.05,.12],[-.04,.185],[.0,.185],[.02,.12]]),[],.1,SK,.018));
  mouth(u,.168,-.1,.075,.075,SKD,0x2b4f78);
  u.push(R(.03,.07,.02,YE,[0,.195,-.205],[.12,0,0],.01,.006));
  laces(u,WH,0,.108,.162,.12,.025,4,.14);
  {const wg=new THREE.Shape();wg.moveTo(-.12,.11);wg.quadraticCurveTo(-.06,.16,.05,.15);wg.quadraticCurveTo(-.0,.13,.02,.125);wg.quadraticCurveTo(-.03,.115,-.0,.105);wg.quadraticCurveTo(-.05,.098,-.12,.11);u.push(...side(wg,WH,w/2))}
  sets.light=[...p,taper(mg(u))]}
 /* 4) 무지개 신발: 흰 하이탑 · 옆에 무지개 아치 · 구름처럼 볼록한 흰 밑창 · 연보라 앞코 · 노란 별 · 분홍 끈 */
 {const WH=0xfaf7f0,CR=0xece6dc,LV=0xc7b3ee,RB=[0xe0533f,0xf28c38,0xf7c948,0x5bae5f,0x3f7fd0,0x8b5cc9],p=[],u=[],w=W*.86;
  p.push(sole(L,W*1.02,.05,WH,0),sole(L*.97,W*.97,.01,0xd9d2ff,.049));
  for(let i=0;i<10;i++){const t=i/10*Math.PI*2,x=Math.sin(t)*W*.43*(Math.cos(t)<0?.88:1),z=Math.cos(t)*L*.43;p.push(E(.038,.028,.048,WH,[x,.028,z]))}
  const B=poly([[-.168,.055],[-.172,.25],[-.02,.25],[-.014,.19],[.0,.118,.1,.1],[.17,.084],[.205,.078,.2,.055]]);
  const toe=seam(.08,.055,.12,.11,1),bk=seam(.08,.055,.12,.11,0);
  u.push(...panel(B,[toe],w,LV),...panel(B,[bk,[0,-1,-.21]],w,CR),...panel(B,[bk,[0,1,.21]],w,WH));
  u.push(...panel(poly([[-.022,.15],[-.02,.268],[.028,.268],[.034,.15]]),[],.13,CR,.02));
  mouth(u,.278,-.092,.098,.09,CR,0xb9a8e8);
  RB.forEach((c,i)=>u.push(...side(arcS(-.075,.07,.083-i*.0115,.093-i*.0115),c,w/2)));
  {const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.014:.032,a=i/10*Math.PI*2;st[i?'lineTo':'moveTo'](-.1+Math.sin(a)*r,.235+Math.cos(a)*r)}u.push(...side(st,0xf7c948,w/2))}
  laces(u,0xf2a7c3,0xb9a8e8,.125,.245,.112,.05,5,.17);
  sets.rainbow=[...p,taper(mg(u))]}
 for(const k in sets){const g1=put('lk_shoes_'+k+'_1',sets[k]);
  const pl=(x,z,ry)=>{const c=g1.clone();c.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,0,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(1,1,1)));return c};
  const g=mg([pl(-.17,-.05,.18),pl(.17,.05,.06)]);g.rotateY(-.42);g.computeBoundingSphere();GEO['lk_shoes_'+k]=g}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{shModels()}catch(e){console.error('shoes: 61차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
