'use strict';
/* ===== 74차(디자인, 기획자 11-23 22:16): 수상 텐트 · 채굴 텐트 → 채굴 기지 =====
   기획자: '수상 전용 텐트를 만들 거야. 수상 텐트는 깊은 바다에만 설치 가능하고 조금이라도 얕은 물이나 땅이랑 겹치면 설치가 안 돼.
           그리고 채굴 텐트를 칠 거고 업그레이드하면 채굴 기지가 돼. 채굴 기지는 광물을 캐 주는 건데 그거는 나중에.
           수상 전용 텐트도 업그레이드가 두 가지 있어 — 낚시가옥이랑 석유시추기지, 이거는 알고만 있어'.
   - 둘 다 보통 텐트(ptent)와 같은 '내 기지' 텐트: [들어가기] → 텐트 방, 내 구역 12.6m, 실제 시간 12시간 뒤 사라짐, 키트로 설치·철거하면 키트.
   - 수상 텐트 wtent: 물에 뜨는 판자 마루(파란 부표 넷) 위 청록 텐트. 마루 전체 + 0.5m가 모두 깊은 바다(seaDeep)이고 땅·얕은 물·부두와
     하나도 안 겹칠 때만 놓아요. 마루는 걸을 수 있고(물 높이 + 0.22라 헤엄치다 바로 올라와요), 문 앞(+z) 마루에서 나와요.
     업그레이드(낚시가옥·석유시추기지)는 기획자가 정할 때 — BUILDS.wtent.upg를 붙이면 작업대 창에 저절로 떠요.
   - 채굴 텐트 minetent: 땅에 치는 국방색 텐트 + 곡괭이·광석 상자·랜턴. 텐트 안 작업대에서 돌 80·나무 40(임시)을 넣고
     [업그레이드] → 채굴 기지 minebase(함석 창고 + 작은 권양탑 + 광석 통, 사라지지 않음, 안은 집 방). 광물 캐기는 나중에.
   - 키트 가격·재료는 임시. 키트는 랜덤 자판기에 저절로 나와요. 멀티 서버는 아직 새 텐트를 몰라요(서버 마무리 때). */
Object.assign(ITEMS,{
 kit_wtent:{n:'수상 텐트',ic:'t74_wtent',ty:'kit',b:'wtent',p:900,d:'깊은 바다에만 펼 수 있는 물 위 텐트. 내 기지가 되고 안에 들어갈 수 있어요'},
 kit_minetent:{n:'채굴 텐트',ic:'t74_minetent',ty:'kit',b:'minetent',p:800,d:'땅에 치는 채굴 텐트. 안의 작업대에서 채굴 기지로 업그레이드해요'}});
Object.assign(BUILDS,{
 wtent:{n:'수상 텐트',g:'t74_wtent',s:1,bx:1.75,bz:1.85,hp:240,c:{wood:14,plastic:6},kit:'kit_wtent',home:1,fixR:1,water:1,flat:1,deepOnly:1,deck:[2.8,2.6,4.2],
  d:'깊은 바다에만 펴요. 땅이나 얕은 물에 조금이라도 걸치면 안 돼요'},
 minetent:{n:'채굴 텐트',g:'t74_minetent',s:1,bx:1.8,bz:1.9,hp:240,c:{wood:10,stone:6},kit:'kit_minetent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,
  upg:{to:'minebase',c:{stone:80,wood:40}},d:'채굴 기지로 업그레이드할 수 있는 텐트예요'},
 minebase:{n:'채굴 기지',g:'t74_minebase',s:1,bx:1.85,bz:1.9,hp:700,c:{stone:80,wood:40},kit:'kit_minetent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,room:'house',hide:1,
  d:'채굴 텐트를 업그레이드한 기지예요. 광물 캐기는 준비 중이에요'}});
const T74_LIFE=['wtent','minetent'];

/* ---------- 모양 ---------- */
/* look.js의 텐트를 색만 바꿔 다시 만들어요(모양·크기는 땅 텐트와 같게) */
function t74tentGeo(rep){let s=lkTent.toString();for(const [a,b] of rep)s=s.split(a).join(b);return(0,eval)('('+s+')')()}
function t74models(){
 const W1=0xc8925a,W2=0xb98250,W3=0x7d5634,BL=0x2f7fc0,BL2=0x245f96,CR=0xf2ede0,YEL=0xf2c230,IRON=0x4c5862,RED=0xd8503f;
 /* 수상 텐트: 부표 넷 + 판자 마루 + 청록 텐트 + 구명환·랜턴·밧줄 */
 {const p=[],gl=[],D=BUILDS.wtent.deck,hw=D[0],z0=-D[1],z1=D[2],zc=(z0+z1)/2,L=z1-z0,TOP=.26;
  for(const x of[-hw+.62,-.8,.8,hw-.62]){p.push(pt(cyl(.42,.42,L-.5,14),BL,[x,-.08,zc],[Math.PI/2,0,0]));for(const e of[-1,1]){p.push(pt(new THREE.SphereGeometry(.42,14,8,0,6.28,0,Math.PI/2),BL,[x,-.08,zc+e*(L-.5)/2],[e*Math.PI/2,0,0]));p.push(pt(cyl(.44,.44,.16,14),CR,[x,-.08,zc+e*(L/2-1.2)],[Math.PI/2,0,0]))}}
  for(const x of[-hw+.62,hw-.62])p.push(pt(box(.18,.16,L-.2),W3,[x,.1,zc]));p.push(pt(box(.16,.14,L-.3),W3,[0,.1,zc]));
  const nb=Math.round(L/.44);for(let i=0;i<nb;i++){const z=z0+(i+.5)*L/nb;p.push(pt(lkRb(2*hw-.04,.08,L/nb-.05,.02,.01),i%3===1?W2:i%3===2?0xd09a62:W1,[0,TOP-.04,z]))}
  for(const sd of[-1,1])p.push(pt(lkRb(.16,.1,L,.02,.01),W3,[sd*(hw-.08),TOP+.01,zc]));p.push(pt(lkRb(2*hw,.1,.16,.02,.01),W3,[0,TOP+.01,z0+.08]),pt(lkRb(2*hw,.1,.16,.02,.01),W3,[0,TOP+.01,z1-.08]));
  /* 텐트: 청록 + 흰 띠, 바닥 깔개는 남색 */
  const tg=t74tentGeo([['0xf2b33a','0x3fb6c6'],['0xe39a26','0x2f97a8'],['0xc9702a','0xf2ede0'],['0x6f7a52','0x2f4f6a']]);tg.applyMatrix4(new THREE.Matrix4().makeScale(1.38,1.38,1.38).setPosition(0,TOP,0));p.push(tg);
  /* 뒤·옆 짧은 기둥 + 밧줄 난간(뒤쪽만) */
  for(const [x,z] of[[-hw+.15,z0+.15],[hw-.15,z0+.15],[-hw+.15,z1-.15],[hw-.15,z1-.15]])p.push(pt(cyl(.07,.08,.75,8),W3,[x,TOP+.36,z]),pt(cyl(.1,.1,.06,8),CR,[x,TOP+.75,z]));
  p.push(lkRod([-hw+.15,TOP+.62,z0+.15],[hw-.15,TOP+.62,z0+.15],.03,0xd8c8a0));
  /* 구명환 기둥(앞 왼쪽) + 랜턴 기둥(앞 오른쪽) + 밧줄 사리·말뚝 + 양동이·낚싯대 */
  {const x=-hw+.4,z=z1-.45;p.push(pt(cyl(.06,.07,1.4,8),W3,[x,TOP+.7,z]),pt(new THREE.TorusGeometry(.32,.09,8,16),RED,[x,TOP+.92,z+.12]));for(let k=0;k<4;k++)p.push(pt(new THREE.TorusGeometry(.32,.092,8,4,Math.PI/2*.42),CR,[x,TOP+.92,z+.12],[0,0,k*Math.PI/2+.2]))}
  {const x=hw-.4,z=z1-.45;p.push(pt(cyl(.06,.07,1.7,8),W3,[x,TOP+.85,z]),pt(box(.08,.08,.42),0x3a3f44,[x,TOP+1.68,z-.18]),pt(lkRb(.22,.06,.22,.02,.01),0x3a3f44,[x,TOP+1.52,z-.36]),pt(lkRb(.22,.06,.22,.02,.01),0x3a3f44,[x,TOP+1.2,z-.36]));
   gl.push(pt(cyl(.09,.09,.26,8),0xffd27a,[x,TOP+1.36,z-.36]))}
  {const coil=new THREE.TorusGeometry(.22,.05,6,14);for(let k=0;k<3;k++)p.push(pt(coil,0xd8c8a0,[1.1,TOP+.05+k*.05,z1-.5],[Math.PI/2,0,0],[1-k*.15,1-k*.15,1]));p.push(pt(lkRb(.3,.14,.12,.03,.02),IRON,[1.6,TOP+.07,z1-.18]))}
  p.push(pt(cyl(.2,.16,.34,10),BL2,[-1.3,TOP+.17,z1-.7]),pt(lkRod([-1.7,TOP,z1-.35],[-1.2,TOP+2,z1-1.4],.025,0x8a6a44)));
  const g=mg(p);GEO.t74_wtent=g;GEO.t74_wtent_glow=mg(gl)}
 /* 채굴 텐트: 국방색 텐트 + 곡괭이 + 광석 상자 + 안전모 + 랜턴 말뚝 */
 {const p=[],gl=[];const tg=t74tentGeo([['0xf2b33a','0xb6a46a'],['0xe39a26','0x958549'],['0xc9702a','0x6a5a3a'],['0x6f7a52','0x5f5a50']]);tg.applyMatrix4(new THREE.Matrix4().makeScale(1.45,1.45,1.45));p.push(tg);
  /* 광석 상자(앞 오른쪽) */
  {const x=1.45,z=1.55;p.push(pt(lkRb(.7,.42,.55,.04,.02),W2,[x,.21,z]),pt(box(.72,.06,.57),W3,[x,.36,z]));const C=[0xf2c230,0xc0643a,0x4fb39a,0x9aa8b8];for(let k=0;k<6;k++)p.push(pt(new THREE.IcosahedronGeometry(.11,0),C[k%4],[x-.2+(k%3)*.2,.44,z-.1+Math.floor(k/3)*.2],[k,k,0]));
   p.push(pt(new THREE.SphereGeometry(.2,12,8,0,6.28,0,Math.PI/2),YEL,[x+.05,.7,z+.0],[0,0,0],[1,.9,1.1]),pt(box(.46,.04,.5),YEL,[x+.05,.7,z]),pt(cyl(.05,.05,.06,8),0x3a3f44,[x+.05,.82,z+.2],[Math.PI/2,0,0]));gl.push(pt(cyl(.04,.04,.03,8),0xfff2c0,[x+.05,.82,z+.24],[Math.PI/2,0,0]))}
  /* 곡괭이(앞 왼쪽에 기대 놓음) */
  {const x=-1.55,z=1.5;p.push(lkRod([x,0,z],[x+.15,1.1,z-.3],.035,0x8a6a44),pt(new THREE.TorusGeometry(.32,.045,5,10,Math.PI*.8),0x8a9aa6,[x+.15,1.12,z-.3],[0,.3,Math.PI*.1]))}
  /* 랜턴 말뚝(뒤 왼쪽) */
  {const x=-1.75,z=-1.55;p.push(pt(cyl(.04,.05,1.3,6),W3,[x,.65,z]),pt(box(.3,.04,.04),W3,[x+.12,1.28,z]),pt(lkRb(.16,.05,.16,.02,.01),0x3a3f44,[x+.25,1.16,z]),pt(lkRb(.16,.05,.16,.02,.01),0x3a3f44,[x+.25,.92,z]));gl.push(pt(cyl(.065,.065,.2,8),0xffd27a,[x+.25,1.04,z]))}
  GEO.t74_minetent=mg(p);GEO.t74_minetent_glow=mg(gl)}
 /* 채굴 기지: 함석 창고 + 작은 권양탑 + 광석 통·미끄럼틀 + 문 위 등 */
 {const p=[],gl=[],RU=0xd0743c,RU2=0xb9622f,TL=0x2f6f78;
  p.push(pt(lkRb(4,.18,4.1,.04,.02),0x8e8a84,[0,.09,0]));
  const X0=-1.7,X1=1.7,Z0=-1.75,Z1=1.25,H=2.5;
  for(let i=0;i<=17;i++){const x=X0+i*(X1-X0)/17;p.push(pt(box(.1,H,.06),i%2?RU:RU2,[x,.18+H/2,Z1]),pt(box(.1,H,.06),i%2?RU2:RU,[x,.18+H/2,Z0]))}
  for(let i=0;i<=15;i++){const z=Z0+i*(Z1-Z0)/15;p.push(pt(box(.06,H,.1),i%2?RU:RU2,[X0,.18+H/2,z]),pt(box(.06,H,.1),i%2?RU2:RU,[X1,.18+H/2,z]))}
  p.push(pt(box(X1-X0+.04,H-.04,Z1-Z0-.04),0x8a4a2a,[0,.18+H/2,(Z0+Z1)/2]));
  for(const [x,z] of[[X0,Z0],[X1,Z0],[X0,Z1],[X1,Z1]])p.push(pt(box(.16,H+.06,.16),CR,[x,.18+H/2,z]));
  /* 지붕: 앞이 높은 외쪽 함석 */
  p.push(pt(box(X1-X0+.5,.1,Z1-Z0+.7),TL,[0,.18+H+.25,(Z0+Z1)/2],[-.14,0,0]));for(let i=0;i<9;i++)p.push(pt(box(.05,.05,Z1-Z0+.7),0x3f8a94,[X0-.2+i*(X1-X0+.4)/8,.18+H+.31,(Z0+Z1)/2],[-.14,0,0]));
  /* 문(+z): 철문 + 노랑·검정 문틀 + 손잡이, 문 위 등 */
  p.push(pt(box(1.05,1.95,.06),0x5a646c,[-.35,.18+.98,Z1+.04]),pt(box(.06,.06,.05),YEL,[.05,.18+1,Z1+.09]));for(let k=0;k<6;k++)p.push(pt(box(.12,.3,.07),k%2?0x2a2a2a:YEL,[-.95,.18+.18+k*.33,Z1+.04]),pt(box(.12,.3,.07),k%2?YEL:0x2a2a2a,[.25,.18+.18+k*.33,Z1+.04]));
  p.push(pt(box(1.4,.12,.07),YEL,[-.35,.18+2.05,Z1+.04]),pt(lkRb(.3,.12,.22,.03,.02),0x3a3f44,[-.35,.18+2.32,Z1+.14]));gl.push(pt(box(.22,.06,.14),0xffe0a0,[-.35,.18+2.24,Z1+.16]));
  /* 창(오른쪽, 불 켜짐) + 곡괭이 간판 */
  gl.push(pt(box(.7,.5,.04),0xffd889,[1.0,.18+1.55,Z1+.04]));p.push(pt(box(.82,.08,.06),CR,[1.0,.18+1.84,Z1+.06]),pt(box(.82,.08,.06),CR,[1.0,.18+1.26,Z1+.06]));
  p.push(pt(lkRb(.9,.5,.06,.04,.02),0x3a3f4a,[1.0,.18+2.32,Z1+.08]),pt(lkRb(.8,.4,.07,.04,.02),YEL,[1.0,.18+2.32,Z1+.1]),lkRod([.78,.18+2.18,Z1+.15],[1.18,.18+2.46,Z1+.15],.025,0x6a4a30),pt(new THREE.TorusGeometry(.16,.025,4,8,Math.PI*.8),0x3a3f44,[1.18,.18+2.46,Z1+.16],[0,0,-.9]));
  /* 권양탑(뒤 왼쪽): 나무 다리 넷 + 가로대 + 빨간 바퀴 + 줄 */
  {const cx=-.9,cz=-.9,b=.62,t=.26,Ht=4.9;for(const [a,c] of[[-1,-1],[1,-1],[-1,1],[1,1]])p.push(lkBeam([cx+a*b,H+.2,cz+c*b],[cx+a*t,Ht,cz+c*t],.13,.13,0x9a7050));
   for(const y of[3.3,4.2]){const k=(y-H-.2)/(Ht-H-.2),q=b+(t-b)*k;for(const sd of[-1,1]){p.push(pt(box(2*q,.08,.08),0x8a6444,[cx,y,cz+sd*q]),pt(box(.08,.08,2*q),0x8a6444,[cx+sd*q,y,cz]))}}
   p.push(pt(box(.7,.1,.7),IRON,[cx,Ht,cz]),pt(new THREE.TorusGeometry(.36,.06,6,14),RED,[cx,Ht+.36,cz],[0,Math.PI/2,0]),pt(cyl(.04,.04,.4,6),IRON,[cx,Ht+.36,cz],[0,0,Math.PI/2]),pt(cyl(.015,.015,1.9,4),0x2a2a2a,[cx,Ht-.5,cz+.36]))}
  /* 광석 통(오른쪽 옆) + 미끄럼틀 */
  {const x=X1+.08,z=-.6;p.push(pt(cyl(.42,.28,.6,4),0x6a7378,[x+.1,.48,z],[0,Math.PI/4,0]),lkBeam([x-.4,1.9,z],[x+.05,.82,z],.32,.08,0x8a9aa6));const C=[0xf2c230,0xc0643a,0x4fb39a,0x9aa8b8];for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.11,0),C[k%4],[x+.05+(k%2)*.14,.8,z-.1+(k%3)*.1],[k,k,0]))}
  /* 앞마당: 광차 한 대(작게) */
  {const x=1.25,z=1.75;p.push(pt(lkRb(.7,.32,.5,.04,.02),0x4a7a74,[x,.42,z]),pt(box(.74,.05,.06),0xc7b38a,[x,.6,z+.26]),pt(box(.74,.05,.06),0xc7b38a,[x,.6,z-.26]));for(const sd of[-1,1])p.push(pt(cyl(.12,.12,.06,10),0x2a2d30,[x+sd*.24,.28,z+.27],[Math.PI/2,0,0]),pt(cyl(.12,.12,.06,10),0x2a2d30,[x+sd*.24,.28,z-.27],[Math.PI/2,0,0]));
   for(let k=0;k<4;k++)p.push(pt(new THREE.IcosahedronGeometry(.1,0),[0xf2c230,0x9aa8b8,0xc0643a,0x4fb39a][k],[x-.18+k*.12,.62,z],[k,k,0]))}
  GEO.t74_minebase=mg(p);GEO.t74_minebase_glow=mg(gl)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{t74models()}catch(e){console.error('tents74 모델',e)}try{lkAOnew(b0)}catch(e){}}}
/* 불빛 조각 + 밤 등불 */
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.m&&GEO[sdef(r).g+'_glow']&&/^(wtent|minetent|minebase)$/.test(r.t)){const k=sdef(r).s||1,g=GEO[sdef(r).g+'_glow'];r.m.children[0].add(mesh(g,HGLOW,false));
  const lp={wtent:[2.4,1.62,3.39],minetent:[-1.5,1.04,-1.55],minebase:[-.35,2.42,1.45]}[r.t];if(lp&&typeof PLAMPS!=='undefined'){const l=glow(0xffc46a,2.2,.6);l.position.set(lp[0]*k,lp[1]*k,lp[2]*k);l.visible=false;r.m.add(l);PLAMPS.push(l)}}
  if(r&&r.own&&T74_LIFE.includes(r.t)&&!r.at)r.at=Date.now()}catch(e){console.error(e)}return r}}

/* ---------- 수상 텐트: 깊은 바다에만 ---------- */
/* 마루 + 0.5m 안 모든 점(0.5m 간격)이 깊은 바다이고, 땅·얕은 물·부두가 하나도 없어야 해요 */
function t74deepWhy(x,z,r,b){const D=b.deck,c=Math.cos(r||0),sn=Math.sin(r||0),m=.5;let land=0,shallow=0,dock=0;
 for(let lx=-D[0]-m;lx<=D[0]+m+1e-6;lx+=.5)for(let lz=-D[1]-m;lz<=D[2]+m+1e-6;lz+=.5){const wx=x+lx*c+lz*sn,wz=z-lx*sn+lz*c;
  if(hAt(wx,wz)>-.3){land++;break}if(onDock(wx,wz)){dock++;break}if(typeof seaDeep==='function'&&!seaDeep(wx,wz))shallow++}
 if(land)return'땅과 겹쳐요. 수상 텐트는 깊은 바다에만 펼 수 있어요';if(dock)return'부두 위에는 놓을 수 없어요';
 if(shallow)return'얕은 물과 겹쳐요. 더 먼 깊은 바다로 가요';return''}
const t74local=(dx,dz,r)=>{const c=Math.cos(r||0),sn=Math.sin(r||0);return[dx*c-dz*sn,dx*sn+dz*c]};
{const _w=waterSpotWhy;waterSpotWhy=function(x,z,r,b){if(b&&b.deepOnly)return t74deepWhy(x,z,r,b);return _w.apply(this,arguments)}}
/* 마루 위는 걸을 수 있어요(보이지 않는 부두, props.js PRF와 같은 방식) */
if(typeof PRF!=='undefined'){const D=BUILDS.wtent.deck;PRF.wtent={R:Math.hypot(D[0],Math.max(D[1],D[2]))+.5,f:(lx,lz)=>lx>-D[0]&&lx<D[0]&&lz>-D[1]&&lz<D[2]?.22:null}}

/* ---------- 12시간(실제 시간) — 보통 텐트와 같은 규칙 ---------- */
{const _h=hud;let t=0;hud=function(){_h();if(mode!=='play'||!S||busy||P.dead)return;const now=performance.now();if(now-t<1000)return;t=now;for(const s of structs.slice())if(T74_LIFE.includes(s.t)&&s.own&&s.at&&tentLeft(s)<=0)tentGone(s)}}
{const _d=drawFx;drawFx=function(dt){_d(dt);if(mode!=='play'||INT.on||!S)return;const c=fctx,k=Math.max(.8,UIS*1.25);
 for(const s of structs){if(!T74_LIFE.includes(s.t)||!s.own||!s.at||dist(P.x,P.z,s.x,s.z)>40)continue;const q=scr(s.x,(s.t==='wtent'?.22:groundY(s.x,s.z))+3.2,s.z);if(!q[2])continue;const ms=tentLeft(s);
  uiPill(c,'⏳ '+tentLeftTx(ms),q[0],q[1],10.5*k,ms<3600e3?'rgba(229,83,75,.92)':'rgba(91,61,43,.86)','#fff','rgba(255,255,255,.35)')}}}

/* ---------- 채굴 텐트 → 채굴 기지 업그레이드(작업대 창) ---------- */
let T74_MBIC;const t74mbIcon=()=>{if(T74_MBIC===undefined){try{T74_MBIC=lkIconFrom(GEO.t74_minebase,[.42,-.55,0],'build')}catch(e){T74_MBIC=null}}return T74_MBIC};
{const _uc=upCard;upCard=function(){let h=_uc();const I=upInfo();if(!I)return h;const mine=I.s.t==='minetent'||I.s.t==='minebase';if(!mine)return h;
 const hi=houseIcon(),mi=t74mbIcon();if(hi&&mi)h=h.split(hi).join(mi);if(ICON.kit_tent&&ICON.kit_minetent)h=h.split(ICON.kit_tent).join(ICON.kit_minetent);
 h=h.replace('나무를 다 넣으면 누를 수 있어요','재료를 다 넣으면 누를 수 있어요').replace('🏠 '+I.d.n,'⛏ '+I.d.n).replace('집으로 업그레이드했어요. 다음 업그레이드는 준비 중이에요','채굴 기지로 업그레이드했어요. 광물 캐기는 준비 중이에요').split('<span class="upe">🏠</span>').join('<span class="upe">⛏</span>');return h}}
{const _ug=upGo;upGo=function(){const I=upInfo();if(!I||!I.u||I.u.to!=='minebase')return _ug.apply(this,arguments);if(HUP.on)return;
 if(!I.ok){toast('재료를 다 넣어야 업그레이드할 수 있어요');return}if(window.MP){toast('멀티에서는 아직 업그레이드할 수 없어요');return}
 closePanel();joyEnd();P.auto=null;HUP.on=true;busy=true;const s=I.s,to='minebase',T=3600,f=$('respawn'),bar=$('rsBar'),st=$('rsSt');
 f.classList.add('house','on');f.querySelector('.rsT').textContent='⛏ 채굴 기지를 짓는 중…';f.querySelector('.rsH').textContent='넣어 둔 돌과 나무로 채굴 기지를 지어요';bar.style.width='0%';st.textContent='';
 const msgs=[[0,'텐트를 걷어요'],[.26,'바닥을 다지는 중…'],[.55,'함석 벽을 세워요'],[.8,'권양탑을 올려요']];sfx(180,.12,'square',.04);let t0=0,k0=-1;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='',mi=0;msgs.forEach(([a,q],i)=>{if(k>=a){m=q;mi=i}});if(mi!==k0){k0=mi;sfx(220+mi*60,.07,'square',.035)}if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  intOut();const ns=addStruct({t:to,x:s.x,z:s.z,r:s.r,own:1,kit:s.kit,hp:BUILDS[to].hp});removeStruct(s);
  S.home={x:ns.x,z:ns.z+BUILDS[to].bz+1.1};P.x=S.home.x;P.z=S.home.z;P.rot=0;P.auto=null;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent='다 지었어요!';save();
  setTimeout(()=>{f.classList.remove('on');busy=false;HUP.on=false;const y=groundY(ns.x,ns.z);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;puff(ns.x+Math.cos(a)*2.2,y+.5,ns.z+Math.sin(a)*2.1,0xb8b0a2,5,.8)}
   ftext(ns.x,y+5.2,ns.z,'⛏ 채굴 기지 완성!','#ffe08a');jingle([523,659,784,1047]);toast('⛏ 채굴 텐트가 채굴 기지가 됐어요! 광물 캐기는 준비 중이에요');hudDirty=true;setTimeout(()=>f.classList.remove('house'),700)},700)};
 requestAnimationFrame(step)}}
