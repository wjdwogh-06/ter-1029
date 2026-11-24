/* 78차(규칙, 기획자 11-24 21:23) — 수상 텐트 업그레이드 둘(고르기) · 채굴 기지 재료 · 넓은 구역 표시 · 깊은 바다 헤엄
   기획자: '수상 텐트가 낚시집으로 바뀌려면 플라스틱 20·금속부품 15·고급 낚싯대 1·나무판 50. 업그레이드되면 집 넓이가 2배 정도, 바깥 외형도 살짝 커지고,
           집 바깥 구역 넓이도 1.3배 — 구역 잘 표시해 주고, 바깥은 나무 느낌으로 낚시 상점 느낌',
           '석유 시추 기지 업그레이드는 플라스틱 10·철 주괴 20·티타늄 주괴 20·나무판 10, 둘 다 수상 텐트에서 고를 수 있는 거야',
           '채굴 텐트 → 채굴 기지는 철 주괴 20·티타늄 주괴 20·전기 곡괭이 1, 외형 같은 것도 잘 짜 주고', '깊은 바다에서는 수영할 때 에너지가 두 배 더 빨리 닳아'.
   ① 수상 텐트 업그레이드 = 둘 중 하나(텐트 안 작업대 창 위 [🎣 낚시집 | 🛢 석유 시추 기지] 고르기, s.upTo). 고른 쪽 재료를 넣고 [⬆ 업그레이드].
      다른 쪽으로 바꾸면 새 쪽에 안 쓰는 재료는 가방으로 돌려줘요. 다 되면 같은 자리에 낚시집 fhouse / 석유 시추 기지 oilbase(사라지지 않음).
      - 안 = 텐트 방의 2배(9.6×7.5m, INT_ROOM.fhouse / .oilbase, 앞 통로·문), 바깥 마루 6.6×7.8m(수상 텐트 5.6×6.8m보다 살짝 크게, 설치 때 잰 깊은 바다 여유 안).
      - 내 구역 = 넓이 1.3배(core.js ZONE_K, 한 변 √1.3배 ≈ 14.4m). 넓어진 구역이 옆 구역과 겹치면 업그레이드가 막혀요.
      - 집 구역 규칙(남이 설치·철거 못 함)은 집·채굴 기지·낚시집·석유 시추 기지 모두(core.js isHouseT).
   ② 채굴 텐트 → 채굴 기지 재료 = 철 주괴 20·티타늄 주괴 20·전기 곡괭이 1. 채굴 기지 바깥을 철골 권양탑·광석 호퍼·컨베이어로 다시.
   ③ 물 위 집(수상 텐트·낚시집·석유 시추 기지)의 구역 모서리 표시는 물 위에 떠요(+ 모서리 부표). 예전엔 물속에 잠겨 안 보였어요.
   ④ 깊은 바다 헤엄 에너지 2배는 actors.js updStats(NRG.deep). */

/* ---------- 정의 ---------- */
const U78_UP={fhouse:{plastic:20,mparts:15,rod3:1,plank:50},oilbase:{plastic:10,bar_iron:20,bar_ti:20,plank:10},minebase:{bar_iron:20,bar_ti:20,pick_elec:1}};
const U78_DECK=[3.3,3.1,4.7],U78_TOP=.34;   /* 마루 반폭·뒤·앞, 마루 윗면(모델 안 높이; 발 높이는 .30) */
Object.assign(BUILDS,{
 fhouse:{n:'낚시집',g:'u78_fhouse',s:1,bx:2.3,bz:1.95,hp:900,c:U78_UP.fhouse,kit:'kit_wtent',home:1,fixR:1,water:1,flat:1,deepOnly:1,deck:U78_DECK,room:'fhouse',hide:1,
  d:'수상 텐트를 업그레이드한 나무 낚시집이에요. 안이 텐트의 2배, 내 구역이 1.3배 넓어요'},
 oilbase:{n:'석유 시추 기지',g:'u78_oilbase',s:1,bx:2.3,bz:1.95,hp:1100,c:U78_UP.oilbase,kit:'kit_wtent',home:1,fixR:1,water:1,flat:1,deepOnly:1,deck:U78_DECK,room:'oilbase',hide:1,
  d:'수상 텐트를 업그레이드한 석유 시추 기지예요. 안이 텐트의 2배, 내 구역이 1.3배 넓어요. 석유 뽑기는 준비 중이에요'}});
BUILDS.wtent.upgs=[{to:'fhouse',c:U78_UP.fhouse,ic:'🎣'},{to:'oilbase',c:U78_UP.oilbase,ic:'🛢'}];BUILDS.wtent.upg=BUILDS.wtent.upgs[0];
BUILDS.wtent.d='깊은 바다에만 펴요. 안의 작업대에서 낚시집이나 석유 시추 기지로 업그레이드해요';
BUILDS.minetent.upg={to:'minebase',c:U78_UP.minebase};BUILDS.minebase.c=U78_UP.minebase;
Object.assign(INT_ROOM,{fhouse:{hw:4.8,hd:3.75,lc:0xffe0b8,ld:12,li:1.45,cor:[1.05,1.6]},oilbase:{hw:4.8,hd:3.75,lc:0xe8f1ff,ld:12,li:1.5,cor:[1.05,1.6]}});   /* 텐트 방 6.4×5.6m의 2배 넓이 */
/* 마루 위 걷기(보이지 않는 부두, props.js PRF) — 오두막·작업동·큰 소품 자리는 벽(PRW)이라 못 들어가요.
   부두 위에서는 walk()가 구조물 충돌을 안 봐서(onDock이면 통과), 벽은 높이로 막아요. 74차 수상 텐트도 텐트 자리를 벽으로(전엔 텐트를 걸어서 지나갔어요). */
const U78_SOLID={fhouse:[[-2.3,2.3,-1.95,1.95],[1.68,2.88,3.36,4.4],[-3.15,-2.55,1.0,1.6]],oilbase:[[-2.3,2.3,-1.95,1.95],[-2.55,-1.35,2.0,4.3],[1.5,2.9,2.7,4.45]],wtent:[[-1.75,1.75,-1.85,1.85]]};
if(typeof PRF!=='undefined'){const mk=(t,D,top)=>({R:Math.hypot(D[0],Math.max(D[1],D[2]))+.5,f:(lx,lz)=>{if(!(lx>-D[0]&&lx<D[0]&&lz>-D[1]&&lz<D[2]))return null;for(const b of U78_SOLID[t])if(lx>b[0]&&lx<b[1]&&lz>b[2]&&lz<b[3])return PRW;return top}});
 PRF.fhouse=mk('fhouse',U78_DECK,U78_TOP-.04);PRF.oilbase=mk('oilbase',U78_DECK,U78_TOP-.04);PRF.wtent=mk('wtent',BUILDS.wtent.deck,.22)}

/* ---------- 모양 ---------- */
function u78Models(){
 const W=[0xc98a52,0xbd7f4a,0xd49862],WD=0x8a5632,WDK=0x6e4426,CR=0xeee3cc,RED=0xd2553f,RED2=0xb94532,TEAL=0x3aa6b0,DK=0x3a3f4f,DK2=0x2c3346,YEL=0xf2c94c,GL=0xffe2a0,STEEL=0xa9b2ba,STEEL2=0x7e8892,OR=0xe8742c;
 const RB=(w,h,d,c,pos,rot)=>pt(lkRb(w,h,d,.04,.02),c,pos,rot);
 const G=(k,pos,rot,s)=>GEO[k]?pt(GEO[k],null,pos,rot||[0,0,0],[s,s,s]):null;
 const lampP=(x,z,H,ry,y0)=>{const g=mg(lkLampParts(H));g.applyMatrix4(new THREE.Matrix4().makeRotationY(ry).setPosition(x,y0||0,z));return g};
 const D=U78_DECK,hw=D[0],z0=-D[1],z1=D[2],zc=(z0+z1)/2,L=z1-z0,T=U78_TOP,BX=2.3,BZ=1.95;
 const fish=(p,x,y,z,ry,c,s=1)=>{p.push(pt(new THREE.SphereGeometry(.14*s,10,8),c,[x,y,z],[0,ry,0],[1,.55,.42]),pt(cone(.08*s,.14*s,6),c,[x+Math.cos(ry)*.18*s,y,z-Math.sin(ry)*.18*s],[0,ry,Math.PI/2]))};
 /* ===== 낚시집: 통나무 뗏목 + 판자 마루 + 나무 오두막(빨간 지붕·앞 박공) + 앞 생선 판매대(줄무늬 차양) + 생선 덕장·통발·낚싯대·구명환·등 ===== */
 {const p=[],gl=[];
  for(const x of[-2.5,-.85,.85,2.5]){p.push(pt(cyl(.36,.36,L+.2,14),W[(x>0?1:0)],[x,-.02,zc],[Math.PI/2,0,0]));for(const e of[-1,1])p.push(pt(cyl(.3,.3,.03,14),0xdcb98e,[x,-.02,zc+e*(L/2+.1)],[Math.PI/2,0,0]))}   /* 통나무 뜸(끝 나이테) */
  for(const x of[-hw+.15,0,hw-.15])p.push(RB(.2,.16,L,WDK,[x,T-.17,zc]));
  const nb=Math.round(L/.4);for(let i=0;i<nb;i++){const z=z0+(i+.5)*L/nb;p.push(pt(lkRb(2*hw,.1,L/nb-.05,.03,.02),W[(i*7)%3],[0,T-.05,z]))}
  for(const sd of[-1,1])p.push(RB(.16,.12,L,WD,[sd*(hw-.08),T+.01,zc]));p.push(RB(2*hw,.12,.16,WD,[0,T+.01,z0+.08]),RB(2*hw,.12,.16,WD,[0,T+.01,z1-.08]));
  /* 마루 둘레 말뚝 + 밧줄 난간(앞은 비움) */
  const posts=[[-hw+.1,z0+.1],[hw-.1,z0+.1],[-hw+.1,zc-.4],[hw-.1,zc-.4],[-hw+.1,z1-.1],[hw-.1,z1-.1]];
  for(const [x,z] of posts)p.push(pt(cyl(.08,.09,.95,10),W[1],[x,T+.47,z]),pt(cyl(.1,.1,.05,10),0xdcb98e,[x,T+.96,z]));
  for(const sd of[-1,1]){p.push(lkRod([sd*(hw-.1),T+.78,z0+.1],[sd*(hw-.1),T+.78,zc-.4],.025,CR),lkRod([sd*(hw-.1),T+.78,zc-.4],[sd*(hw-.1),T+.78,z1-.1],.025,CR))}
  p.push(lkRod([-hw+.1,T+.78,z0+.1],[hw-.1,T+.78,z0+.1],.025,CR));
  /* 오두막: 세로 판자 벽 + 짙은 모서리 기둥 + 앞 박공 빨간 지붕 */
  const H=2.35,y0=T;for(const sd of[-1,1]){for(let z=-BZ+.12;z<BZ-.05;z+=.26)p.push(pt(lkRb(.1,H,.25,.02,.01),W[(Math.round(z*4)+(sd>0?1:0)+9)%3],[sd*(BX-.05),y0+H/2,z]));p.push(RB(.22,H+.05,.22,WDK,[sd*BX,y0+H/2,-BZ]),RB(.22,H+.05,.22,WDK,[sd*BX,y0+H/2,BZ]))}
  for(let x=-BX+.12;x<BX-.05;x+=.26)p.push(pt(lkRb(.25,H,.1,.02,.01),W[(Math.round(x*4)+9)%3],[x,y0+H/2,-BZ+.05]));
  /* 앞벽: 문(가운데) 양옆 판자 + 오른쪽 판매 창(위로 열린 덧문) + 왼쪽 둥근 창 */
  const DW=.62,DH=1.95;for(let x=-BX+.12;x<BX-.05;x+=.26){if(Math.abs(x)<DW+.08)continue;const win=x>.9&&x<2.0;
   if(win){p.push(pt(lkRb(.25,.85,.1,.02,.01),W[(Math.round(x*4)+9)%3],[x,y0+.42,BZ-.05]),pt(lkRb(.25,.45,.1,.02,.01),W[(Math.round(x*4)+9)%3],[x,y0+H-.22,BZ-.05]))}
   else p.push(pt(lkRb(.25,H,.1,.02,.01),W[(Math.round(x*4)+9)%3],[x,y0+H/2,BZ-.05]))}
  p.push(pt(lkRb(2*DW+.1,H-DH,.12,.02,.01),W[0],[0,y0+DH+(H-DH)/2,BZ-.05]));
  p.push(RB(.12,DH+.1,.16,WDK,[-DW-.04,y0+DH/2,BZ+.02]),RB(.12,DH+.1,.16,WDK,[DW+.04,y0+DH/2,BZ+.02]),RB(2*DW+.3,.14,.18,WDK,[0,y0+DH+.06,BZ+.02]));
  p.push(RB(2*DW-.06,DH-.04,.06,0x7a4a2a,[0,y0+(DH-.04)/2,BZ-.02]));for(const y of[.5,1.45])p.push(RB(2*DW-.2,.06,.03,0x5e3820,[0,y0+y,BZ+.02]));
  p.push(pt(new THREE.TorusGeometry(.17,.035,8,18),0xc9a24a,[0,y0+1.45,BZ+.04]));gl.push(pt(new THREE.CircleGeometry(.15,16),GL,[0,y0+1.45,BZ+.035]));
  p.push(pt(cyl(.035,.035,.04,8),0xc9a24a,[DW-.18,y0+1.0,BZ+.02],[Math.PI/2,0,0]));
  /* 판매 창: 창틀 + 안쪽 빛 + 위로 받친 덧문 + 앞 판매대(얼음 위 생선) + 줄무늬 차양 */
  {const cx=1.45,cw=1.1,wy0=y0+.85,wy1=y0+H-.45;p.push(RB(cw+.12,.1,.14,WDK,[cx,wy0,BZ+.02]),RB(cw+.12,.1,.14,WDK,[cx,wy1,BZ+.02]),RB(.1,wy1-wy0,.14,WDK,[cx-cw/2-.02,(wy0+wy1)/2,BZ+.02]),RB(.1,wy1-wy0,.14,WDK,[cx+cw/2+.02,(wy0+wy1)/2,BZ+.02]));
   gl.push(pt(box(cw-.04,wy1-wy0-.08,.02),0xffd590,[cx,(wy0+wy1)/2,BZ-.06]));
   p.push(pt(lkRb(cw+.3,.08,.62,.03,.02),W[2],[cx,wy0+.02,BZ+.3]),pt(lkRb(cw+.1,.06,.5,.03,.02),0xdff3f7,[cx,wy0+.08,BZ+.3]));for(const sd of[-1,1])p.push(RB(.08,wy0-y0,.08,WDK,[cx+sd*(cw/2+.05),y0+(wy0-y0)/2,BZ+.55]));
   for(let k=0;k<4;k++)fish(p,cx-.42+k*.28,wy0+.15,BZ+.3+(k%2?.08:-.08),.25+k*.4,[0x8fb8d8,0xe0533f,0xf2a03a,0x6aa8c8][k],1);
   for(let k=0;k<6;k++){const g=new THREE.CylinderGeometry(.01,.01,1,4);const x0=cx-cw/2-.15+k*(cw+.3)/6;p.push(pt(box((cw+.3)/6,.03,.95),k%2?CR:RED,[x0+(cw+.3)/12,wy1+.33,BZ+.42],[-.42,0,0]))}
   p.push(RB(cw+.4,.06,.06,WDK,[cx,wy1+.52,BZ+.05]))}
  /* 둥근 창(앞 왼쪽) */
  {const x=-1.45,y=y0+1.45;p.push(pt(new THREE.TorusGeometry(.26,.06,8,20),WDK,[x,y,BZ+.03]));gl.push(pt(new THREE.CircleGeometry(.24,18),0xffd590,[x,y,BZ+.01]));p.push(pt(box(.5,.03,.02),WDK,[x,y,BZ+.04]),pt(box(.03,.5,.02),WDK,[x,y,BZ+.04]))}
  /* 지붕: 앞뒤로 긴 용마루(앞 박공이 카메라 쪽) + 처마 + 크림 테두리 + 박공 판자 + 지붕 위 물고기 바람개비 */
  {const RH=1.25,ov=.35,a=Math.atan2(RH,BX+ov),Ls=Math.hypot(BX+ov,RH)+.05,ry=y0+H;
   for(const sd of[-1,1]){const g=mg([pt(box(Ls,.12,2*BZ+.7),RED,[0,0,0]),...[...Array(7)].map((_,k)=>pt(box(Ls,.04,.08),RED2,[0,.07,-BZ-.2+k*(2*BZ+.4)/6]))]);g.rotateZ(-sd*a);g.translate(sd*(BX+ov)/2,ry+RH/2+.04,0);p.push(g)}
   p.push(RB(.2,.16,2*BZ+.8,CR,[0,ry+RH+.08,0]));
   for(const sz of[-1,1]){const sh=new THREE.Shape([new THREE.Vector2(-BX,0),new THREE.Vector2(BX,0),new THREE.Vector2(0,RH)]);const g=new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false});g.translate(0,ry,sz>0?BZ-.1:-BZ);p.push(pt(g,W[2],[0,0,0]));
    for(const sd of[-1,1]){const q=lkBeam([0,ry+RH+.05,sz*(BZ+.36)],[sd*(BX+ov),ry-.05,sz*(BZ+.36)],.1,.08,CR);p.push(q)}}
   p.push(pt(lkRb(1.35,.34,.06,.04,.02),0x2f6f8f,[0,ry+.42,BZ+.4]));   /* 박공 간판 판(글자는 addStruct가 붙여요) */
   {const fx=0,fy=ry+RH+.2;p.push(pt(cyl(.025,.025,.55,6),DK,[fx,fy+.27,BZ-.3]));fish(p,fx,fy+.62,BZ-.3,0,0x3aa6b0,1.6)}}
  /* 굴뚝 */
  p.push(RB(.34,.9,.34,0x9a9aa0,[-1.3,y0+H+1.0,-.9]),RB(.42,.1,.42,DK,[-1.3,y0+H+1.48,-.9]));
  /* 앞 왼쪽: 생선 덕장(나무 틀 + 걸린 생선) */
  {const x=-2.25,z=3.3;for(const sd of[-1,1])p.push(RB(.1,1.55,.1,WD,[x+sd*.55,T+.77,z]));p.push(RB(1.3,.08,.08,WD,[x,T+1.5,z]));
   for(let k=0;k<4;k++){const fx=x-.4+k*.27;p.push(lkRod([fx,T+1.49,z],[fx,T+1.32,z],.008,DK));fish(p,fx,T+1.15,z,Math.PI/2,[0xc9a06a,0xb88b58,0xd4b07a,0xc09060][k],1.1)}}
  /* 앞 오른쪽: 생선 상자(얼음) 둘 + 기댄 낚싯대 셋 + 통 */
  for(const [x,z,k] of[[2.55,3.6,0],[2.0,4.15,1]]){p.push(pt(lkRb(.62,.32,.44,.04,.02),k?0x3f7fd0:0xe0533f,[x,T+.16,z]),pt(lkRb(.56,.04,.38,.02,.01),0xe8f6fa,[x,T+.32,z]));for(let j=0;j<3;j++)fish(p,x-.16+j*.16,T+.38,z,.3+j*.7,[0x8fb8d8,0xf2a03a,0x6aa8c8][j],.85)}
  for(let k=0;k<3;k++){const x=BX+.12+k*.16,b=[x,T+.05,BZ+.35+k*.1],t=[x-.05,T+2.6,BZ+.08];p.push(lkRod(b,t,.022,k===1?0x2f6f8f:0x3a3a3a));p.push(pt(cyl(.07,.07,.06,10),YEL,[x,T+.55,BZ+.31+k*.1],[0,0,Math.PI/2]))}
  p.push(pt(cyl(.27,.24,.62,14),W[1],[-hw+.45,T+.31,1.3]),pt(cyl(.28,.28,.05,14),DK,[-hw+.45,T+.18,1.3]),pt(cyl(.28,.28,.05,14),DK,[-hw+.45,T+.48,1.3]));
  /* 통발 더미(뒤 오른쪽) + 밧줄 사리 + 그물 걸이(오른쪽 벽) */
  for(let k=0;k<3;k++)p.push(pt(cyl(.3,.34,.42,10,1,true),0x6f8f6a,[2.75,T+.21+k*.42*(k>1?1:0),-2.5+(k===1?.62:0)],[0,0,0]));
  {const coil=new THREE.TorusGeometry(.22,.05,6,14);for(let k=0;k<3;k++)p.push(pt(coil,CR,[-2.6,T+.05+k*.05,-2.5],[Math.PI/2,0,0],[1-k*.15,1-k*.15,1]))}
  for(let i=0;i<5;i++)for(let j=0;j<4;j++){if(j<3)p.push(lkRod([BX+.06,T+.7+j*.35,-1.4+i*.6],[BX+.06,T+1.05+j*.35,-1.4+i*.6],.008,0x6b5a40));if(i<4)p.push(lkRod([BX+.06,T+.7+j*.35,-1.4+i*.6],[BX+.06,T+.7+j*.35,-.8+i*.6],.008,0x6b5a40))}
  for(let k=0;k<3;k++)p.push(pt(new THREE.SphereGeometry(.1,10,8),k%2?CR:0xf28c38,[BX+.1,T+1.75,-1.1+k*.7]));
  /* 구명환(왼쪽 벽) */
  for(let k=0;k<8;k++)p.push(pt(new THREE.TorusGeometry(.32,.09,8,6,Math.PI/4),k%2?CR:RED,[-BX-.08,T+1.35,-.4],[0,Math.PI/2,k*Math.PI/4]));
  /* 앞 등(오른쪽 앞 모서리) */
  p.push(lampP(hw-.35,z1-.35,1.9,Math.PI,T));gl.push(pt(new THREE.SphereGeometry(.15,14,8),GL,[hw-.35,T+1.95,z1-.84],[0,0,0],[1,.55,1]));
  GEO.u78_fhouse=mg(p);GEO.u78_fhouse_glow=mg(gl)}
 /* ===== 석유 시추 기지: 쇠 뜸 + 철판 마루(노란 가장자리) + 회색 작업동 + 지붕 위 주황 데릭 + 연료 탱크·드럼통·밸브·불꽃 기둥 ===== */
 {const p=[],gl=[];
  for(const x of[-2.45,0,2.45]){p.push(pt(cyl(.42,.42,L+.1,16),x===0?0xd8b43a:0xe0c04a,[x,-.04,zc],[Math.PI/2,0,0]));for(const e of[-1,1])p.push(pt(new THREE.SphereGeometry(.42,14,8),0xd8b43a,[x,-.04,zc+e*(L/2+.05)],[0,0,0],[1,1,.45]));
   for(let k=0;k<4;k++)p.push(pt(cyl(.43,.43,.08,16),DK2,[x,-.04,z0+.9+k*(L-1.8)/3],[Math.PI/2,0,0]))}
  for(const x of[-hw+.15,0,hw-.15])p.push(RB(.22,.18,L,DK,[x,T-.18,zc]));
  p.push(pt(lkRb(2*hw,.1,L,.03,.02),0x6e757d,[0,T-.05,zc]));for(let i=0;i<Math.round(L/.5);i++)p.push(pt(box(2*hw-.1,.012,.03),0x5a6067,[0,T+.002,z0+.25+i*.5]));
  for(const sd of[-1,1])for(let k=0;k<Math.round(L/.5);k++)p.push(pt(box(.18,.014,.25),k%2?DK2:YEL,[sd*(hw-.12),T+.004,z0+.25+k*.5]));
  /* 노란 파이프 난간(뒤·옆, 앞은 트임) */
  const rail=(a,b)=>{p.push(lkRod([a[0],T+.95,a[1]],[b[0],T+.95,b[1]],.035,YEL),lkRod([a[0],T+.5,a[1]],[b[0],T+.5,b[1]],.03,YEL))};
  for(const [x,z] of[[-hw+.1,z0+.1],[hw-.1,z0+.1],[-hw+.1,0],[hw-.1,0],[-hw+.1,z1-1.2],[hw-.1,z1-1.2]])p.push(pt(cyl(.04,.04,.95,8),YEL,[x,T+.47,z]));
  rail([-hw+.1,z0+.1],[hw-.1,z0+.1]);for(const sd of[-1,1]){rail([sd*(hw-.1),z0+.1],[sd*(hw-.1),0]);rail([sd*(hw-.1),0],[sd*(hw-.1),z1-1.2])}
  /* 작업동: 철판 벽(청록 띠) + 평평한 지붕 + 문 + 창 */
  const H=2.5,y0=T;p.push(pt(lkRb(2*BX,H,2*BZ,.06,.03),0xc9ced3,[0,y0+H/2,0]));
  for(const sd of[-1,1]){for(let z=-BZ+.3;z<BZ;z+=.45)p.push(pt(box(.03,H-.1,.06),0xb3b9bf,[sd*(BX+.01),y0+H/2,z]))}for(let x=-BX+.3;x<BX;x+=.45)p.push(pt(box(.06,H-.1,.03),0xb3b9bf,[x,y0+H/2,-BZ-.01]));
  p.push(pt(box(2*BX+.04,.3,2*BZ+.04),TEAL,[0,y0+1.55,0]),pt(box(2*BX+.06,.16,2*BZ+.06),DK,[0,y0+.08,0]),pt(lkRb(2*BX+.2,.14,2*BZ+.2,.04,.02),STEEL2,[0,y0+H+.07,0]));
  for(const [x,z] of[[-BX,-BZ],[BX,-BZ],[-BX,BZ],[BX,BZ]])p.push(RB(.16,H+.1,.16,DK,[x,y0+H/2,z]));
  {const DW=.55,DH=2.0;p.push(RB(2*DW+.22,DH+.12,.1,YEL,[0,y0+DH/2,BZ+.02]),RB(2*DW,DH,.06,0x5d6670,[0,y0+DH/2,BZ+.05]),pt(new THREE.TorusGeometry(.16,.03,8,16),DK,[0,y0+1.45,BZ+.09]));gl.push(pt(new THREE.CircleGeometry(.14,16),0xcfe6ff,[0,y0+1.45,BZ+.085]));
   for(let k=0;k<6;k++)p.push(pt(box(.26,.06,.02),k%2?DK2:YEL,[-DW-.25+(k%2)*.0,y0+.3+k*.28,BZ+.04],[0,0,.6]))}
  for(const x of[-1.5,1.5]){p.push(RB(1.0,.7,.08,DK,[x,y0+1.75,BZ+.02]));gl.push(pt(box(.88,.58,.02),0xd6ecff,[x,y0+1.75,BZ+.06]))}
  for(const sd of[-1,1]){p.push(RB(.08,.6,1.0,DK,[sd*(BX+.02),y0+1.75,-.6]));gl.push(pt(box(.02,.5,.88),0xd6ecff,[sd*(BX+.06),y0+1.75,-.6]))}
  /* 지붕: 난간 + 에어컨 상자 + 데릭(지붕 뒤쪽 절반 위 주황 철탑) */
  const ry=y0+H+.14;for(const [a,b] of[[[-BX,-BZ],[BX,-BZ]],[[-BX,BZ],[BX,BZ]],[[-BX,-BZ],[-BX,BZ]],[[BX,-BZ],[BX,BZ]]])p.push(lkRod([a[0],ry+.5,a[1]],[b[0],ry+.5,b[1]],.025,YEL));
  for(const [x,z] of[[-BX,-BZ],[BX,-BZ],[-BX,BZ],[BX,BZ]])p.push(pt(cyl(.03,.03,.5,6),YEL,[x,ry+.25,z]));
  p.push(RB(.9,.5,.7,0xdfe3e6,[1.4,ry+.25,1.1]),pt(cyl(.22,.22,.04,14),DK,[1.4,ry+.51,1.1]));
  {const cz=-.75,cx=0,b=.95,t=.26,Hd=4.3;const leg=(sx,sz,y)=>{const k=y/Hd,q=b+(t-b)*k;return[cx+sx*q,ry+y,cz+sz*q]};
   for(const sx of[-1,1])for(const sz of[-1,1])p.push(lkBeam(leg(sx,sz,0),leg(sx,sz,Hd),.12,.12,OR));
   for(let y=.75;y<Hd-.3;y+=.9){for(const [a,b2,c,d] of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]]){p.push(lkRod(leg(a,b2,y),leg(c,d,y),.03,OR));p.push(lkRod(leg(a,b2,y),leg(c,d,Math.min(Hd,y+.9)),.018,0xd8662a))}}
   p.push(RB(.8,.22,.8,DK,[cx,ry+Hd+.1,cz]),pt(new THREE.TorusGeometry(.26,.06,8,16),RED,[cx,ry+Hd+.42,cz],[0,Math.PI/2,0]),lkRod([cx,ry+Hd,cz+.1],[cx,ry+.3,cz+.1],.012,DK2),pt(cyl(.08,.08,1.6,10),0x5a6067,[cx,ry+.8,cz]));
   p.push(pt(new THREE.SphereGeometry(.09,8,6),0xff5a3c,[cx,ry+Hd+.7,cz]))}
  /* 불꽃 기둥(뒤 오른쪽, 바다 쪽으로 비스듬히) */
  {const a=[hw-.25,T+.1,z0+.35],b=[hw+.75,T+2.9,z0-.35];p.push(lkBeam(a,b,.14,.14,STEEL2),lkRod([hw-.6,T+.1,z0+.35],[hw+.25,T+1.6,z0],.035,STEEL2),pt(cyl(.13,.1,.22,10),DK2,[b[0],b[1]-.02,b[2]]));
   gl.push(pt(cone(.32,.9,10),0xffa43a,[b[0],b[1]+.45,b[2]]),pt(cone(.18,.6,10),0xfff1a0,[b[0],b[1]+.35,b[2]]))}
  /* 앞 왼쪽: 누운 연료 탱크(받침) + 파이프 → 작업동, 앞 오른쪽: 드럼통 + 밸브 + 구명환 기둥 */
  {const x=-1.95,z=3.1;p.push(pt(cyl(.55,.55,1.8,16),YEL,[x,T+.78,z],[Math.PI/2,0,0]));for(const e of[-1,1])p.push(pt(new THREE.SphereGeometry(.55,14,8),YEL,[x,T+.78,z+e*.9],[0,0,0],[1,1,.35]));
   for(const e of[-.6,.6])p.push(RB(1.1,.26,.18,DK,[x,T+.13,z+e]));for(const e of[-.5,0,.5])p.push(pt(cyl(.56,.56,.07,16),DK2,[x,T+.78,z+e],[Math.PI/2,0,0]));
   p.push(lkRod([x+.4,T+1.25,z-.6],[x+.4,T+1.25,BZ+.3],.05,0x5a6067),lkRod([x+.4,T+1.25,BZ+.3],[x+.4,T+.6,BZ+.1],.05,0x5a6067))}
  for(const [x,z,k] of[[1.8,3.0,0],[2.4,3.4,1],[1.85,3.75,2],[2.55,4.15,3]]){const g=G('lk_drum_'+k,[x,T,z],[0,k,0],1);if(g)p.push(g)}
  {const x=.9,z=3.9;p.push(pt(cyl(.06,.06,.7,8),0x5a6067,[x,T+.35,z]),pt(new THREE.TorusGeometry(.18,.035,6,14),RED,[x,T+.75,z],[Math.PI/2,0,0]));for(let k=0;k<4;k++)p.push(pt(box(.36,.03,.03),RED,[x,T+.75,z],[0,k*Math.PI/4,0]))}
  for(let k=0;k<8;k++)p.push(pt(new THREE.TorusGeometry(.32,.09,8,6,Math.PI/4),k%2?CR:0xf28c38,[-hw+.12,T+.95,1.2],[0,Math.PI/2,k*Math.PI/4]));
  p.push(lampP(hw-.35,z1-.35,1.9,Math.PI,T));gl.push(pt(new THREE.SphereGeometry(.15,14,8),GL,[hw-.35,T+1.95,z1-.84],[0,0,0],[1,.55,1]));
  GEO.u78_oilbase=mg(p);GEO.u78_oilbase_glow=mg(gl)}
 /* ===== 채굴 기지(다시): 집 그대로(0.78배) + 철골 권양탑(청록·빨간 바퀴) + 광석 호퍼·컨베이어 + 레일 위 광차 + 광석 더미 + 등 =====
    재료가 철 주괴·티타늄 주괴·전기 곡괭이라 나무 권양탑을 철골로 바꿨어요. 집 몸채·크기·충돌·등 자리는 75차 그대로. */
 {const p=[],gl=[],K=.78,ORE=[0xf2c230,0xd7743f,0x4fb39a,0xb6c2cf],ST=0x3a8f98,ST2=0x2f7880;const hg=G('phouse',[0,0,.05],[0,0,0],K);if(hg)p.push(hg);if(GEO.phouse_glow)gl.push(pt(GEO.phouse_glow,null,[0,0,.05],[0,0,0],[K,K,K]));
  {const cx=-1.7,cz=-1.55,b=.6,t=.24,Ht=4.9;const leg=(sx,sz,y)=>{const k=y/Ht,q=b+(t-b)*k;return[cx+sx*q,y,cz+sz*q]};
   p.push(RB(1.6,.22,1.6,0xb9b5ab,[cx,.11,cz]));for(const sx of[-1,1])for(const sz of[-1,1])p.push(lkBeam(leg(sx,sz,.2),leg(sx,sz,Ht),.13,.13,ST));
   for(let y=.9;y<Ht-.3;y+=1.0)for(const [a,b2,c,d] of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]]){p.push(lkRod(leg(a,b2,y),leg(c,d,y),.035,ST2),lkRod(leg(a,b2,y),leg(c,d,Math.min(Ht,y+1.0)),.02,ST2))}
   p.push(RB(.7,.16,.7,DK2,[cx,Ht+.08,cz]));for(const e of[-.15,.15])p.push(pt(new THREE.TorusGeometry(.42,.07,8,20),RED,[cx+e,Ht+.55,cz],[0,Math.PI/2,0]));p.push(pt(cyl(.06,.06,.5,8),CR,[cx,Ht+.55,cz],[0,0,Math.PI/2]));
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2;p.push(lkRod([cx,Ht+.55,cz],[cx,Ht+.55+Math.sin(a)*.4,cz+Math.cos(a)*.4],.018,RED2))}
   p.push(lkRod([cx,Ht+.55,cz+.42],[cx,.6,cz+.42],.012,DK),RB(.5,.4,.5,0x5a6067,[cx,.42,cz+.42]))}
  /* 광석 호퍼(뒤 오른쪽, 다리 위 깔때기) + 컨베이어(권양탑 → 호퍼) + 아래 광석 수레 */
  {const hx=1.55,hz=-1.55,top=2.6;for(const sx of[-1,1])for(const sz of[-1,1])p.push(RB(.12,top-.4,.12,ST2,[hx+sx*.5,(top-.4)/2,hz+sz*.5]));
   const g=new THREE.CylinderGeometry(.82,.28,1.0,4,1,true);g.rotateY(Math.PI/4);p.push(pt(g,0xd7a43a,[hx,top-.1,hz]),pt(new THREE.TorusGeometry(.58,.05,4,4),DK2,[hx,top+.4,hz],[Math.PI/2,0,Math.PI/4],[1.41,1.41,1]));
   for(let k=0;k<6;k++)p.push(pt(new THREE.IcosahedronGeometry(.13,0),ORE[k%4],[hx-.25+(k%3)*.25,top+.34,hz-.15+Math.floor(k/3)*.3],[k,k,0]));
   p.push(pt(cone(.18,.4,4),0x8a8f96,[hx,top-.82,hz],[Math.PI,Math.PI/4,0]));
   const A=[-1.2,3.0,-1.55],B2=[hx-.55,top+.45,hz];p.push(lkBeam(A,B2,.42,.12,DK2),lkBeam([A[0],A[1]+.09,A[2]],[B2[0],B2[1]+.09,B2[2]],.36,.06,0x4a4f56));
   for(let k=1;k<4;k++){const t=k/4,x=A[0]+(B2[0]-A[0])*t,y=A[1]+(B2[1]-A[1])*t;p.push(RB(.08,y,.08,ST2,[x,y/2,A[2]]));if(k%2)p.push(pt(new THREE.IcosahedronGeometry(.11,0),ORE[k],[x,y+.22,A[2]],[k,k,0]))}}
  /* 앞 오른쪽: 레일 + 광차(75차 그대로 자리) */
  {const x=1.45,z=1.85;for(const sd of[-1,1])p.push(RB(2.6,.06,.07,DK,[x-.3,.03,z+sd*.25]));for(let k=0;k<6;k++)p.push(RB(.12,.05,.72,W[k%3],[x-1.4+k*.45,.015,z]));
   p.push(pt(lkRb(.7,.38,.52,.08,.03),TEAL,[x,.46,z]),pt(lkRb(.76,.07,.58,.03,.02),CR,[x,.68,z]));for(const sd of[-1,1])for(const e of[-1,1])p.push(pt(cyl(.11,.11,.06,12),DK2,[x+e*.22,.24,z+sd*.28],[Math.PI/2,0,0]));
   for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.1,0),ORE[k%4],[x-.2+k*.1,.74,z+(k%2?.08:-.08)],[k,k,0]))}
  for(let k=0;k<6;k++)p.push(pt(new THREE.IcosahedronGeometry(.15+(k%2)*.05,0),ORE[k%4],[2.0-(k%3)*.2,.12,.6-Math.floor(k/3)*.24],[k,k,0]));
  {const pk=G('lk_pick_elec',[-.6,.42,2.35],[0,.4,.35],.95);if(pk)p.push(pk)}
  {const g=lampP(-1.75,1.75,1.9,0);p.push(g);gl.push(pt(new THREE.SphereGeometry(.15,14,8),GL,[-1.75,1.95,2.24],[0,0,0],[1,.55,1]))}
  GEO.t74_minebase=mg(p);GEO.t74_minebase_glow=mg(gl)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{u78Models()}catch(e){console.error('upg78 모델',e)}try{lkAOnew(b0)}catch(e){}}}
/* 불빛·등불·간판 글자 */
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.m&&(r.t==='fhouse'||r.t==='oilbase')){const g=GEO[sdef(r).g+'_glow'];if(g)r.m.children[0].add(mesh(g,HGLOW,false));
  if(typeof PLAMPS!=='undefined'){const l=glow(0xffc46a,2.4,.6);l.position.set(U78_DECK[0]-.35,U78_TOP+1.95,U78_DECK[2]-.84);l.visible=false;r.m.add(l);PLAMPS.push(l)}
  if(r.t==='fhouse'){try{const t=plSignText('🎣 낚시집',1.3,.3,64);t.position.set(0,U78_TOP+2.35+.42,BUILDS.fhouse.bz+.44);r.m.add(t)}catch(e){}}}}catch(e){console.error(e)}return r}}

/* ---------- 안: 낚시집(나무) · 석유 시추 기지(철판) 방 ---------- */
function u78RoomGeo(kind){const R=INT_ROOM[kind],W=R.hw,D=R.hd,CW=R.cor[0],CL=R.cor[1],fh=kind==='fhouse',p=[],WH=2.5,T=.14;
 const FL=fh?[0xb9824e,0xc48b55,0xae7746,0xbf8a58]:[0x7d848c,0x747b83,0x838a92,0x787f87],WL=fh?[0xd9a46c,0xcf9a62,0xe0ad76]:[0xb9c1c8,0xb1b9c0,0xc0c7cd];
 /* 바닥: 판자(나무) / 철판(줄무늬 홈) + 통로 */
 const nb=Math.round(2*D/.32);for(let i=0;i<nb;i++){const z=-D+(i+.5)*2*D/nb;p.push(pt(box(2*W,.06,2*D/nb-.02),FL[i%4],[0,-.03,z]));if(!fh&&i%2)for(let x=-W+.3;x<W;x+=.6)p.push(pt(box(.18,.012,.05),0x666d75,[x+(i%4?.15:0),.004,z],[0,.7,0]))}
 p.push(pt(box(2*W,.05,2*D),fh?0x6e4426:0x3a3f45,[0,-.09,0]));
 for(let i=0;i<Math.ceil(CL/.32);i++)p.push(pt(box(2*CW,.06,.3),FL[(i+1)%4],[0,-.03,D+.16+i*.32]));
 /* 벽: 뒤 + 양옆(나무 세로 판자 / 철판 + 리벳 줄), 위 갓, 아래 걸레받이 */
 if(fh){for(let x=-W+.13;x<W;x+=.26)p.push(pt(box(.24,WH,T),WL[Math.round(x*4+40)%3],[x,WH/2,-D-T/2]));for(const sd of[-1,1])for(let z=-D+.13;z<D;z+=.26)p.push(pt(box(T,WH,.24),WL[Math.round(z*4+40)%3],[sd*(W+T/2),WH/2,z]))}
 else{p.push(pt(box(2*W+2*T,WH,T),WL[0],[0,WH/2,-D-T/2]));for(const sd of[-1,1])p.push(pt(box(T,WH,2*D+T),WL[1],[sd*(W+T/2),WH/2,-T/2]));
  for(let x=-W+.6;x<W;x+=1.2)p.push(pt(box(.04,WH-.1,.03),0x9aa3ab,[x,WH/2,-D+.01]));for(const sd of[-1,1])for(let z=-D+.6;z<D;z+=1.2)p.push(pt(box(.03,WH-.1,.04),0x9aa3ab,[sd*(W-.01),WH/2,z]));
  for(let x=-W+.3;x<W;x+=.6)p.push(pt(box(.06,.06,.02),0x5a6067,[x,WH-.25,-D+.02]),pt(box(.06,.06,.02),0x5a6067,[x,.5,-D+.02]))}
 const cap=fh?0x8a5632:0x5a6067,skirt=fh?0x5e3820:0x2c3036;p.push(pt(box(2*W+2*T,.08,T+.04),cap,[0,WH+.04,-D-T/2]),pt(box(2*W,.12,.03),skirt,[0,.06,-D+.015]));
 for(const sd of[-1,1])p.push(pt(box(T+.04,.08,2*D+T),cap,[sd*(W+T/2),WH+.04,-T/2]),pt(box(.03,.12,2*D),skirt,[sd*(W-.015),.06,0]));
 if(!fh){for(const sd of[-1,1])for(let k=0;k<Math.round(CL/.3);k++)p.push(pt(box(.1,.012,.3),k%2?0x2c3036:0xf2c94c,[sd*(CW-.06),.005,D+.15+k*.3]))}   /* 통로 가장자리 노랑·검정 줄 */
 for(const sd of[-1,1])p.push(pt(box(.06,.05,CL),skirt,[sd*(CW+.03),.025,D+CL/2]));
 /* 뒤 벽 둥근 창 둘(바다 빛) + 벽 꾸밈 하나씩(그물 / 파이프·밸브) */
 const gl=[];for(const x of[-W*.45,W*.45]){p.push(pt(new THREE.TorusGeometry(.36,.07,8,22),fh?0x8a5632:0x5a6067,[x,1.55,-D+.05]));gl.push(pt(new THREE.CircleGeometry(.33,20),0x9fd4f0,[x,1.55,-D+.02]))}
 if(fh){for(let i=0;i<6;i++)for(let j=0;j<5;j++){if(j<4)p.push(pt(box(.012,.3,.012),0x7a6648,[-W+.02,.95+j*.3+.15,-1.2+i*.4]));if(i<5)p.push(pt(box(.012,.012,.4),0x7a6648,[-W+.02,.95+j*.3,-1.0+i*.4]))}
  for(let k=0;k<8;k++)p.push(pt(new THREE.TorusGeometry(.3,.08,8,6,Math.PI/4),k%2?0xeee3cc:0xd2553f,[W-.05,1.5,-.6],[0,Math.PI/2,k*Math.PI/4]))}
 else{p.push(pt(cyl(.09,.09,2*W-.4,10),0x8a9199,[0,2.15,-D+.18],[0,0,Math.PI/2]),pt(cyl(.07,.07,2*W-.4,10),0xc9a23a,[0,1.95,-D+.16],[0,0,Math.PI/2]));
  for(const x of[-1.6,1.6]){p.push(pt(new THREE.TorusGeometry(.16,.03,6,14),0xd2553f,[x,2.15,-D+.3]));for(let k=0;k<2;k++)p.push(pt(box(.32,.025,.025),0xd2553f,[x,2.15,-D+.3],[0,0,k*Math.PI/2]))}}
 const H=new THREE.Group(),m=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true}));m.receiveShadow=true;H.add(m);H.add(new THREE.Mesh(mg(gl),new THREE.MeshBasicMaterial({vertexColors:true})));
 intDoor(H,D+CL);return H}
{const _ib=intBuild;intBuild=function(){const was=!!INT.g;_ib();if(was||!INT.g)return;try{for(const k of['fhouse','oilbase']){const H=u78RoomGeo(k);H.visible=false;INT.g.add(H);INT.gr[k]=H}
  const need=Math.max(...['fhouse','oilbase'].map(k=>INT_ROOM[k].hd+INT_ROOM[k].cor[1]))+.8;INT.dock.hl=Math.max(INT.dock.hl,need);INT.full=Math.max(INT.full,Math.max(...['fhouse','oilbase'].map(k=>INT_ROOM[k].hw))+1.2)}catch(e){console.error('upg78 방',e)}}}
/* 들어갈 때 글자 */
let U78_ENT=null;{const _fd=fadeDo;fadeDo=function(msg,cb){if(U78_ENT&&msg==='텐트 안으로…'){msg=U78_ENT;U78_ENT=null}return _fd(msg,cb)}}
{const _ie=intEnter;intEnter=function(s){const r=sdef(s).room;U78_ENT=r==='fhouse'?'낚시집 안으로…':r==='oilbase'?'석유 시추 기지 안으로…':null;try{return _ie.apply(this,arguments)}finally{U78_ENT=null}}}

/* ---------- ① 업그레이드 고르기·넣기·짓기(작업대 창) ---------- */
{const _ui=upInfo;upInfo=function(){const I=_ui();if(!I)return I;const L=I.d.upgs;if(!L)return I;const u=L.find(q=>q.to===I.s.upTo)||L[0];
  return Object.assign(I,{u,to:BUILDS[u.to],ok:Object.keys(u.c).every(k=>(I.have[k]||0)>=u.c[k]),opts:L})}}
function u78Sel(to){const I=upInfo();if(!I||!I.opts||!BUILDS[to]||(I.u&&I.u.to===to))return;const u=I.opts.find(q=>q.to===to);if(!u)return;I.s.upTo=to;
 const back=[];const have=Object.assign({},I.s.upc||{});for(const k in have){const extra=have[k]-(u.c[k]||0);if(extra>0){give(k,extra);have[k]-=extra;if(!have[k])delete have[k];back.push(ITEMS[k].n+' ×'+extra)}}
 I.s.upc=have;sfx(420,.06,'sine',.03);toast(`${u.ic||'⬆'} ${ro(BUILDS[to].n)} 바꿨어요`+(back.length?' · 안 쓰는 재료는 가방으로: '+back.join(', '):''));save();hudDirty=true}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="u78sel"]');if(!b||b.disabled)return;u78Sel(b.dataset.k);renderPanel()});
const U78_IC={};const u78Icon=k=>{if(k==='wtent_k')return ICON.kit_wtent||null;if(U78_IC[k]===undefined){try{U78_IC[k]=GEO[BUILDS[k].g]?lkIconFrom(GEO[BUILDS[k].g],[.42,-.55,0],'build'):null}catch(e){U78_IC[k]=null}}return U78_IC[k]};
{const _uc=upCard;upCard=function(){const I=upInfo();if(!I||!(I.s.t==='wtent'||I.s.t==='fhouse'||I.s.t==='oilbase'))return _uc();
 const hd='<div class="sec" style="margin-top:0">⬆ 업그레이드</div>',img=k=>{const ic=u78Icon(k);return ic?`<img src="${ic}">`:`<span class="upe">${k==='fhouse'?'🎣':k==='oilbase'?'🛢':'⛺'}</span>`};
 if(!I.u)return hd+`<div class="upc"><div class="uphd">${img(I.s.t)}</div><div class="upn">${I.s.t==='fhouse'?'🎣':'🛢'} ${I.d.n}</div><small>${ro(I.d.n)} 업그레이드했어요. 다음 업그레이드는 준비 중이에요</small></div>`;
 const tabs=`<div class="u78tabs">${I.opts.map(o=>`<button class="btn ${o.to===I.u.to?'':'g'}" data-a="u78sel" data-k="${o.to}">${o.ic} ${BUILDS[o.to].n}</button>`).join('')}</div>`;
 const rows=Object.keys(I.u.c).map(k=>{const need=I.u.c[k],have=Math.min(need,I.have[k]||0),inv=invN(k),can=have<need&&inv>0;
  return`<div class="upr">${invIcon(k)}<div class="grow"><div class="upl"><b>${ITEMS[k].n}</b><span>${have} / ${need}</span></div><div class="upbar"><i style="width:${(have/need*100).toFixed(1)}%"></i></div><small>가방에 ${inv}개${have>=need?' · 다 넣었어요 ✔':''}</small></div></div>
   <div class="upbtns"><button class="btn g" data-a="upput" data-k="${k}" data-n="10" ${can?'':'disabled'}>10개 넣기</button><button class="btn g" data-a="upput" data-k="${k}" data-n="9999" ${can?'':'disabled'}>전부 넣기</button></div>`}).join('');
 return hd+`<div class="upc"><small style="display:block;margin-bottom:6px">둘 중 하나를 골라요 — 바꾸면 안 쓰는 재료는 가방으로 돌아와요</small>${tabs}<div class="uphd">${img('wtent_k')}<span class="uparr">➜</span>${img(I.u.to)}</div><div class="upn">${I.d.n} → ${I.to.n}</div><small>${I.to.d}</small>${rows}
  <button class="btn" data-a="upgo" ${I.ok?'':'disabled'} style="width:100%;margin-top:10px">⬆ 업그레이드</button>${I.ok?'':'<small style="text-align:center;display:block;margin-top:6px">재료를 다 넣으면 누를 수 있어요</small>'}</div>`}}
{const st=document.createElement('style');st.textContent='#pbody .u78tabs{display:flex;gap:6px;margin:0 0 8px}#pbody .u78tabs .btn{flex:1;padding:8px 4px;font-size:13px;white-space:nowrap}';document.head.appendChild(st)}
/* 짓기: 낚시집·석유 시추 기지·채굴 기지(나머지는 원래 것) */
const U78_TX={fhouse:{t:'🎣 낚시집을 짓는 중…',h:'넣어 둔 나무판·플라스틱·금속부품으로 낚시집을 지어요',m:[[0,'텐트를 걷어요'],[.25,'뗏목을 넓혀요'],[.5,'판자 벽을 세워요'],[.78,'판매대와 간판을 달아요']],done:'🎣 낚시집 완성!',toast:'🎣 수상 텐트가 낚시집이 됐어요! 안이 두 배, 내 구역이 1.3배 넓어졌어요',fx:'#ffe08a',c:0xd8c6a2},
 oilbase:{t:'🛢 석유 시추 기지를 짓는 중…',h:'넣어 둔 철 주괴·티타늄 주괴로 시추 기지를 세워요',m:[[0,'텐트를 걷어요'],[.25,'쇠 뜸을 띄워요'],[.5,'작업동을 조립해요'],[.78,'데릭을 올려요']],done:'🛢 석유 시추 기지 완성!',toast:'🛢 수상 텐트가 석유 시추 기지가 됐어요! 안이 두 배, 내 구역이 1.3배 넓어졌어요 (석유 뽑기는 준비 중)',fx:'#ffd28a',c:0xb8bcc2},
 minebase:{t:'⛏ 채굴 기지를 짓는 중…',h:'넣어 둔 철 주괴·티타늄 주괴로 채굴 기지를 지어요',m:[[0,'텐트를 걷어요'],[.26,'바닥을 다지는 중…'],[.55,'철골 권양탑을 세워요'],[.8,'호퍼와 컨베이어를 달아요']],done:'⛏ 채굴 기지 완성!',toast:'⛏ 채굴 텐트가 채굴 기지가 됐어요! 광물 캐기는 준비 중이에요',fx:'#ffe08a',c:0xb8b0a2}};
function u78ZoneHit(s,to){const q=zoneRect(s.x,s.z,s.r,to);return structs.find(o=>o!==s&&isZoneT(o.t)&&!o.in&&zoneOverlap(q,zoneRect(o.x,o.z,o.r,o.t)))||null}
{const _ug=upGo;upGo=function(){const I=upInfo();if(!I||!I.u||!U78_TX[I.u.to])return _ug.apply(this,arguments);if(HUP.on)return;
 if(!I.ok){toast('재료를 다 넣어야 업그레이드할 수 있어요');return}if(window.MP){toast('멀티에서는 아직 업그레이드할 수 없어요');return}
 const to=I.u.to,X=U78_TX[to],s=I.s;if(u78ZoneHit(s,to)){toast('업그레이드하면 구역이 1.3배 넓어지는데 옆 구역과 겹쳐요. 옆 텐트를 옮기거나 떨어진 곳에서 업그레이드해요');return}
 closePanel();joyEnd();P.auto=null;HUP.on=true;busy=true;const T=3600,f=$('respawn'),bar=$('rsBar'),st=$('rsSt');
 f.classList.add('house','on');f.querySelector('.rsT').textContent=X.t;f.querySelector('.rsH').textContent=X.h;bar.style.width='0%';st.textContent='';sfx(180,.12,'square',.04);let t0=0,k0=-1;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='',mi=0;X.m.forEach(([a,q],i)=>{if(k>=a){m=q;mi=i}});if(mi!==k0){k0=mi;sfx(220+mi*60,.07,'square',.035)}if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  intOut();const ns=addStruct({t:to,x:s.x,z:s.z,r:s.r,own:1,kit:s.kit,hp:BUILDS[to].hp});removeStruct(s);
  const bz=BUILDS[to].bz+1.1;S.home={x:ns.x+Math.sin(ns.r||0)*bz,z:ns.z+Math.cos(ns.r||0)*bz};P.x=S.home.x;P.z=S.home.z;P.rot=0;P.yv=0;P.auto=null;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent='다 지었어요!';save();
  setTimeout(()=>{f.classList.remove('on');busy=false;HUP.on=false;const y=groundY(ns.x,ns.z)+(BUILDS[to].water?.3:0);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;puff(ns.x+Math.cos(a)*2.6,y+.5,ns.z+Math.sin(a)*2.5,X.c,5,.8)}
   ftext(ns.x,y+5.2,ns.z,X.done,X.fx);jingle([523,659,784,1047]);toast(ZONE_K[to]?X.toast.replace('1.3배','1.3배('+u78ZoneTx(to)+')'):X.toast);hudDirty=true;setTimeout(()=>f.classList.remove('house'),700)},700)};
 requestAnimationFrame(step)}}

/* ---------- ③ 물 위 집의 구역 표시: 물 위에 떠요 + 모서리 부표 ---------- */
let U78_BUOY=null;const u78Buoy=()=>U78_BUOY||(U78_BUOY=(()=>{const p=[pt(cyl(.16,.2,.34,12),0xf28c38,[0,.1,0]),pt(cyl(.205,.205,.09,12),0xf4f1ea,[0,.12,0]),pt(new THREE.SphereGeometry(.16,12,8),0xf28c38,[0,.27,0],[0,0,0],[1,.5,1]),pt(cyl(.025,.025,.34,6),0x3a3f4f,[0,.48,0]),pt(new THREE.SphereGeometry(.05,8,6),0xfff1b0,[0,.66,0])];return mg(p)})());
const u78Water=t=>!!(BUILDS[t]&&BUILDS[t].water);
{const _zm=zoneMark;zoneMark=function(s){_zm(s);try{if(!s.zg||!u78Water(s.t))return;const big=s.t==='fhouse'||s.t==='oilbase',mats={};
  s.zg.children.forEach(m=>{m.position.y=.07});const q=zoneRect(s.x,s.z,s.r,s.t);zoneCorners(q).forEach(([x,z])=>{const b=new THREE.Mesh(u78Buoy(),MATT);b.position.set(x,-.06,z);b.userData.u78b=1;b.userData.ph=x*.7+z*.3;s.zg.add(b)});
  s.zg.userData.u78=1;if(big){const mt=zmMat(ZCOL_SOFT[zoneCol(s)]||0xffffff,.85);s.zg.children.forEach(m=>{if(!m.userData.u78b){m.material=mt;m.scale.set(1.35,1,1.35)}})}}catch(e){console.error(e)}}}
{const _ze=zoneEdgesUpd;zoneEdgesUpd=function(){_ze();try{if(ZMK.pre&&ZMK.pre.visible&&u78Water(bmode))ZMK.pre.children.forEach(m=>{m.position.y=.08})}catch(e){}}}
/* 부표는 물결 따라 살짝 출렁 */
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);const t=performance.now()/1000;for(const s of structs){if(!s.zg||!s.zg.userData.u78||Math.abs(s.x-px)>60||Math.abs(s.z-pz)>60)continue;for(const m of s.zg.children)if(m.userData.u78b){m.position.y=-.06+Math.sin(t*1.6+m.userData.ph)*.05;m.rotation.z=Math.sin(t*1.3+m.userData.ph)*.08}}}}
/* 텐트를 치거나 업그레이드한 뒤 구역 안내(크기는 종류마다) */
const u78ZoneTx=t=>{const q=zoneRect(0,0,0,t);return `${+(q.hw*2).toFixed(1)}×${+(q.b+q.f).toFixed(1)}m`};
