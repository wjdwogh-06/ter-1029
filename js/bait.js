/* 65차(디자인): 미끼 2종 + 행운의 낚싯대 — 기획자 11-23 10:36: '미끼 만들 건데 일단은 지렁이 미끼랑 새우 미끼, 그리고 행운의 낚싯대까지'
   · 지렁이 미끼 bait_worm · 새우 미끼 bait_shrimp: 지금은 그림·아이템만(ty:'res'). 미끼를 끼우는 방법·효과는 기획자가 정할 때.
   · 행운의 낚싯대 rod_lucky: 진짜로 낚이는 낚싯대(WEAP rod:1). 입질은 고급 낚싯대와 같은 4~8초(임시) — '행운' 효과(희귀 물고기 확률 등)는 기획자가 정할 때.
     손에 든 모양은 기본·중급·고급 낚싯대와 같은 배치·길이·줄 끝(userData.tip)이라 낚시 동작은 그대로. 아이콘 원판은 보라(rare).
   가격은 모두 임시, p가 있어서 랜덤 자판기에 저절로 나와요. */
Object.assign(ITEMS,{
 bait_worm:{n:'지렁이 미끼',ic:'bt_worm',ty:'res',p:30,d:'꿈틀거리는 지렁이. 낚시 미끼로 써요 (임시: 쓰는 법은 준비 중)'},
 bait_shrimp:{n:'새우 미끼',ic:'bt_shrimp',ty:'res',p:60,d:'통통한 새우. 낚시 미끼로 써요 (임시: 쓰는 법은 준비 중)'},
 rod_lucky:{n:'행운의 낚싯대',ic:'bt_rod_lucky_i',hg:'bt_rod_lucky',ty:'tool',p:3000,one:1,rare:1,d:'네잎클로버 부적이 달린 행운의 낚싯대. 입질이 4~8초로 빨라요 (임시: 행운 효과는 준비 중)'}});
WEAP.rod_lucky={rod:1,dmg:0,cd:1,range:0,h1:1,bite:[4,8]};

function btModels(){
 const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const CY=(rt,rb,h,c,p,r,sc,n=20)=>pt(cyl(rt,rb,h,n),c,p,r,sc);
 const SP=(rad,c,p,sc,r,a=14,b=10)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,r||0,sc);
 const LA=(prof,c,p,seg=32)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg),c,p);
 const R=(w,h,d,c,p,r,cr=.03,bv=.016)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const PI=Math.PI,H=(i,j)=>hash(i,j,65);
 /* 굽은 관(지렁이·새우 몸) — 점 목록을 따라 굵기를 바꾸며 */
 const tube=(pts,r0,r1,c,seg=24)=>{const cv=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(...q))),g=new THREE.TubeGeometry(cv,seg,1,10,false),po=g.attributes.position,n=seg+1,v=new THREE.Vector3(),P=new THREE.Vector3();
  for(let i=0;i<n;i++){const t=i/seg,r=r0+(r1-r0)*t;cv.getPointAt(t,P);for(let j=0;j<=10;j++){const k=i*11+j;v.fromBufferAttribute(po,k).sub(P).multiplyScalar(r).add(P);po.setXYZ(k,v.x,v.y,v.z)}}g.computeVertexNormals();return pt(g,c)};
 /* ===== 지렁이 미끼: 뚜껑 열린 양철통 + 흙 + 분홍 지렁이 셋(통 밖으로 하나 기어 나옴) ===== */
 {const p=[LA([[0,0],[.3,0],[.31,.02],[.31,.34],[.33,.35],[.33,.37],[.3,.37],[.29,.35],[.29,.04],[0,.04]],0xb9c2cc,[0,0,0],32)];
  for(const y of[.1,.2,.28])p.push(pt(new THREE.TorusGeometry(.312,.008,6,40),0x98a2ad,[0,y,0],[PI/2,0,0]));
  p.push(CY(.31,.31,.1,0xe7d9a8,[0,.18,.0],0,undefined,32),CY(.18,.18,.012,0x5aa04a,[0,.19,.305],[PI/2,0,0],undefined,24));   /* 크림 라벨 + 초록 동그라미 */
  p.push(CY(.285,.285,.02,0x5a3a22,[0,.33,0],0,undefined,28));for(let i=0;i<14;i++)p.push(SP(.03+H(i,1)*.02,i%2?0x4a2e1a:0x6a4a2e,[-.2+H(i,2)*.4,.345,-.2+H(i,3)*.4],[1,.5,1],0,8,6));
  const PK=0xe58a8a,PK2=0xd36f78;
  p.push(tube([[-.12,.34,-.05],[-.06,.42,0],[.02,.38,.06],[.08,.44,.1]],.032,.022,PK));
  p.push(tube([[.1,.34,-.12],[.06,.46,-.08],[-.04,.5,-.12],[-.1,.44,-.16]],.03,.02,PK2));
  p.push(tube([[.2,.35,.1],[.3,.4,.18],[.36,.3,.26],[.42,.12,.3],[.52,.04,.34],[.66,.03,.3]],.034,.024,PK,32));
  for(const [x,y,z] of [[.33,.37,.21],[.39,.24,.28]])p.push(pt(new THREE.TorusGeometry(.036,.008,6,14),0xc75c66,[x,y,z],[0,.6,0]));   /* 지렁이 마디 띠 */
  p.push(pt(new THREE.CylinderGeometry(.34,.34,.02,32),0xc9d0d8,[-.32,.18,-.25],[.2,0,1.25]));   /* 열린 뚜껑(통에 기대어) */
  for(let i=0;i<6;i++)p.push(SP(.025,0x5a3a22,[.3+H(i,4)*.3,.015,.2+H(i,5)*.2],[1,.4,1],0,6,4));
  put('bt_worm',p)}
 /* ===== 새우 미끼: 얼음 깐 작은 파란 통 + 통통한 분홍 새우 셋(꼬리 부채·더듬이) ===== */
 {const p=[R(.72,.2,.5,0x3f8fc8,[0,.1,0],0,.06,.03),R(.66,.04,.44,0xd8eef8,[0,.18,0],0,.05,.02)];
  for(let i=0;i<10;i++)p.push(R(.08,.05,.08,0xeaf6fc,[-.27+H(i,1)*.54,.21,-.17+H(i,2)*.34],[H(i,3),H(i,4),0],.015,.01));
  const shrimp=(x,z,ry,s=1)=>{const q=[],OR=0xf28a6a,OR2=0xe8704f;const C=[];for(let i=0;i<=8;i++){const a=-.3+i/8*PI*1.15,r=.16-i*.009;C.push([Math.cos(a)*r,.0+i*.004,Math.sin(a)*r])}
   q.push(tube(C,.075,.03,OR,28));for(let i=1;i<7;i++){const a=-.3+i/7*PI*1.15,r=.16-i*.009*8/7;q.push(pt(new THREE.TorusGeometry(.07-i*.006,.008,6,16,PI),OR2,[Math.cos(a)*r,.02+i*.004,Math.sin(a)*r],[0,-a+PI/2,0]))}
   const ta=-.3+PI*1.15,tx=Math.cos(ta)*.088,tz=Math.sin(ta)*.088;for(const s2 of[-1,0,1])q.push(SP(.04,0xf6a080,[tx+Math.cos(ta+PI/2+s2*.5)*.04,.04,tz+Math.sin(ta+PI/2+s2*.5)*.04],[1.4,.3,.7],[0,-(ta+s2*.5),0],8,6));
   const hx=Math.cos(-.3)*.16,hz=Math.sin(-.3)*.16;q.push(SP(.07,OR,[hx+.02,.0,hz-.03],[1.2,1,1],0,12,10),SP(.014,0x1c1c1c,[hx+.06,.04,hz-.06],0,0,6,5),SP(.014,0x1c1c1c,[hx+.08,.04,hz],0,0,6,5));
   for(const s2 of[1,-1]){const c=new THREE.CatmullRomCurve3([new THREE.Vector3(hx+.07,.02,hz-.04+s2*.02),new THREE.Vector3(hx+.22,.08,hz-.1+s2*.06),new THREE.Vector3(hx+.34,.04,hz-.06+s2*.14)]);q.push(pt(new THREE.TubeGeometry(c,10,.006,4,false),0xd8604a))}
   for(let i=0;i<5;i++){const a=-.1+i*.25,r=.12;q.push(pt(cyl(.006,.006,.08,4),0xe8704f,[Math.cos(a)*r,-.05,Math.sin(a)*r],[0,0,.4]))}
   const m=mg(q);m.scale(s,s,s);m.rotateY(ry);m.translate(x,.27,z);p.push(m)};
  shrimp(-.14,.02,.4,1);shrimp(.16,-.06,2.4,.95);shrimp(.06,.14,-1.2,.9);
  p.push(SP(.06,0x6ab45a,[.3,.24,.17],[1.6,.25,.8],[0,.5,0],8,6));   /* 초록 잎 장식 */
  put('bt_shrimp',p)}
 /* ===== 행운의 낚싯대: 기본·고급 낚싯대와 같은 배치(T=-.62, 길이 2.3, 줄 끝 userData.tip) — 에메랄드 대 + 금 띠·금 릴 + 네잎클로버 부적 ===== */
 {const rodG=(rl=2.3,K=1)=>{const T=-.62,A=(d,o=0)=>[0,Math.sin(-T)*d+o,Math.cos(-T)*d+.12],X=PI/2+T,c=(a,b,h,n)=>cyl(a*K,b*K,h,n);
   const P={grip:0x2f7a4a,cap:0xe6b84a,seat:0xf3e9d2,acc:0xe6b84a,blank:0x3fae6a,stem:0xe6b84a,body:0xf3e9d2,spool:0xe9bd52,hand:0xe6b84a,knob:0x2f7a4a,guide:0xf6e3a0,band:0xe6b84a};
   const p=[pt(c(.05,.054,.34,12),P.grip,[0,0,-.12],[X,0,0]),pt(c(.058,.058,.04,12),P.cap,[0,Math.sin(-T)*-.3,Math.cos(-T)*-.3],[X,0,0]),pt(c(.036,.036,.16,12),P.seat,A(-.02),[X,0,0]),
    pt(c(.042,.046,.2,12),P.grip,A(.16),[X,0,0]),pt(c(.03,.034,.03,12),P.acc,A(.27),[X,0,0]),pt(c(.012,.03,rl,8),P.blank,A(rl/2+.28),[X,0,0]),
    pt(c(.016,.016,.11,6),P.stem,[0,-.06,.06]),pt(c(.058,.058,.12,14),P.body,[0,-.14,.1],[X,0,0]),pt(c(.068,.06,.08,14),P.spool,[0,-.12,.2],[X,0,0]),pt(c(.07,.07,.015,14),P.acc,[0,-.11,.245],[X,0,0]),
    pt(box(.1,.012,.012),P.hand,[.06,-.15,.1]),pt(box(.012,.07,.012),P.hand,[.11,-.18,.1]),pt(box(.04,.025,.025),P.knob,[.11,-.22,.1]),
    ...[[.62,.035],[1.05,.026],[1.5,.02],[1.95,.016],[2.3,.014]].filter(q=>q[0]<=rl).map(([d,r])=>pt(new THREE.TorusGeometry(r*K,.006*K,4,10),P.guide,A(d+.28,-r*K-.012*K),[X,0,0]))];
   for(const d of[.04,.1,.62,1.12,1.62])if(d<rl)p.push(pt(c(.033-d*.006,.034-d*.006,.03,10),P.band,A(.3+d),[X,0,0]));
   for(const d of[.35,.85,1.35,1.85])if(d<rl)p.push(pt(c(.026-d*.006,.027-d*.006,.06,8),0x8fe0a8,A(.3+d),[X,0,0]));   /* 밝은 연두 마디 */
   /* 네잎클로버 부적: 손잡이 앞 금 고리에 짧은 줄로 매달림 */
   const hp=A(.34,-.06*K);p.push(pt(c(.004,.004,.1,4),0xb8923a,[hp[0],hp[1]-.05*K,hp[2]]));const cy=hp[1]-.13*K,cz=hp[2];
   for(let i=0;i<4;i++){const a=i/4*PI*2+PI/4;p.push(pt(new THREE.SphereGeometry(.034*K,10,8),0x4fbf5a,[Math.cos(a)*.03*K,cy+Math.sin(a)*.03*K,cz],0,[1,1,.35]))}
   p.push(pt(new THREE.SphereGeometry(.016*K,8,6),0xf2c230,[0,cy,cz+.006*K],0,[1,1,.6]),pt(c(.005,.005,.05,4),0x3f8f4a,[0,cy-.045*K,cz],[0,0,.3]));
   const g=mg(p);g.userData.tip=A(rl+.28);return g};
  const g=rodG();lkSmooth(g,40);g.computeBoundingSphere();GEO.bt_rod_lucky=g;const gi=rodG(1.2,1.75);lkSmooth(gi,40);gi.computeBoundingSphere();GEO.bt_rod_lucky_i=gi}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{btModels()}catch(e){console.error('bait: 65차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}

/* 66차(디자인): 설치형 미끼 + 작살 — 기획자 11-23 14:13: '설치형 미끼랑 작살도 추가, 설치형 미끼는 바다에만 설치 가능하고 얇은 물에는 설치 안 돼'
   · 설치형 미끼 baitbuoy(키트 kit_baitbuoy): 물 위에 띄우는 주황·흰 부표 + 물속에 매단 미끼 철망. 바다의 깊은 물(9점 모두 깊이 BAITBUOY.deep 넘게)에만,
     강·얕은 물·부두는 안 돼요(waterSpotWhy 감싸기). 바닷가 가까이 7m 규칙은 안 씀(깊은 바다라 멀어도 돼요). 물결 따라 살짝 출렁여요.
     물고기를 모으는 기능은 아직 — 기획자가 정할 때.
   · 작살 harpoon: 손에 드는 근접 도구(손도끼와 같은 배치, 자루 y축). 근접 22·사거리 2.8(임시). 고래 잡기 등 쓰는 곳은 기획자가 정할 때.
   가격·재료 모두 임시, p가 있어서 랜덤 자판기에 저절로 나와요. */
const BAITBUOY={deep:1.0};
Object.assign(ITEMS,{
 kit_baitbuoy:{n:'설치형 미끼',ic:'bt_baitbuoy',ty:'kit',b:'baitbuoy',p:400,d:'바다의 깊은 물에 띄우는 미끼 부표. 얕은 물·강에는 못 놓아요 (임시: 물고기 모으기는 준비 중)'},
 harpoon:{n:'작살',ic:'bt_harpoon_i',hg:'bt_harpoon',ty:'tool',p:1500,one:1,d:'갈고리 날이 달린 작살. 근접 22 (임시: 쓰는 곳은 준비 중)'}});
Object.assign(BUILDS,{
 baitbuoy:{n:'설치형 미끼',g:'bt_baitbuoy',s:1,bx:.5,bz:.5,hp:40,c:{bait_shrimp:2,wood:2},kit:'kit_baitbuoy',water:1,flat:1,seaBait:1,d:'바다의 깊은 물에만 띄워요 (임시)'}});
WEAP.harpoon={melee:1,dmg:22,cd:.7,range:2.8};
/* 바다·깊은 물 검사: 9점 모두 부두 아님·강이 아님·깊이 deep 넘게 */
function baitSeaWhy(x,z,r,b){const c=Math.cos(r),sn=Math.sin(r);for(let ax=-1;ax<=1;ax++)for(let az=-1;az<=1;az++){const lx=ax*(b.bx+.25),lz=az*(b.bz+.25),px=x+lx*c+lz*sn,pz=z-lx*sn+lz*c;
  if(onDock(px,pz))return'부두와 겹쳐요';const rd=riverD(px,pz);if(_rp&&rd<_rp.w+8)return'설치형 미끼는 바다에만 놓을 수 있어요';
  const h=hAt(px,pz);if(h>-.05)return'설치형 미끼는 물 위에만 놓을 수 있어요';if(h>-BAITBUOY.deep)return'물이 얕아요. 더 깊은 바다에 놓아요'}return''}
{const _ws=waterSpotWhy;waterSpotWhy=function(x,z,r,b){if(b&&b.seaBait)return baitSeaWhy(x,z,r,b);return _ws.apply(this,arguments)}}
/* 물결 따라 살짝 출렁 */
{const _ue=updEnv;updEnv=function(dt,x,z){_ue(dt,x,z);try{const t=performance.now()/1000;for(const s of structs){if(s.t!=='baitbuoy'||!s.m)continue;if(s._by===undefined)s._by=s.m.position.y;
  const k=s.x*.37+s.z*.21;s.m.position.y=s._by+Math.sin(t*1.7+k)*.035;s.m.rotation.x=Math.sin(t*1.3+k)*.05;s.m.rotation.z=Math.cos(t*1.1+k)*.05}}catch(e){}}}

function btModels66(){
 const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const CY=(rt,rb,h,c,p,r,sc,n=18)=>pt(cyl(rt,rb,h,n),c,p,r,sc);
 const SP=(rad,c,p,sc,r,a=14,b=10)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,r||0,sc);
 const TO=(R,t,c,p,r,a=8,b=28)=>pt(new THREE.TorusGeometry(R,t,a,b),c,p,r);
 const PI=Math.PI,H=(i,j)=>hash(i,j,66);
 const OR=0xf28c38,WH=0xf7f0e3,RD=0xe0533f,ST=0xc9d2da,ST2=0x8e99a4,RO=0xf0e2c0,WD=0xd6965a,WD2=0xb07848;
 /* ===== 설치형 미끼: 물 높이 y=0. 주황·흰 부표 + 깃대(빨간 깃발·노란 등) + 물속 철망 미끼 바구니(새우·생선 조각) + 물 위 떠 있는 미끼 조각 ===== */
 {const p=[];
  /* 통통한 부표: 주황 몸 + 흰 띠 둘 + 위 검은 받침 */
  p.push(SP(.36,OR,[0,.06,0],[1,.78,1],0,26,18),TO(.355,.05,WH,[0,.04,0],[PI/2,0,0],10,44),TO(.24,.035,WH,[0,.24,0],[PI/2,0,0],8,34),SP(.2,OR,[0,.27,0],[1,.45,1],0,18,10));
  p.push(CY(.1,.13,.08,0x3b4148,[0,.33,0]),CY(.026,.026,.56,0x3b4148,[0,.64,0],0,undefined,10),CY(.055,.055,.03,0x3b4148,[0,.93,0]));
  p.push(SP(.07,0xf7d14a,[0,1.0,0],undefined,0,14,10),CY(.075,.075,.025,0x3b4148,[0,1.06,0]));
  {const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.3,-.08);s.lineTo(0,-.18);s.lineTo(0,0);const g=new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1});p.push(pt(g,RD,[.026,.9,-.008]))}
  /* 물속: 짧은 밧줄 + 초록 그물 미끼 바구니(위아래 쇠고리) */
  const NT=0x3aa6b0,cy=-.5;p.push(CY(.014,.014,.2,RO,[0,-.2,0],0,undefined,8));
  for(const [y,r] of[[.16,.09],[.08,.16],[0,.19],[-.08,.16],[-.16,.09]])p.push(TO(r,.013,NT,[0,cy+y,0],[PI/2,0,0],6,26));
  for(let i=0;i<8;i++){const a=i/8*PI*2,pts=[[0,.2],[.09,.16],[.16,.08],[.19,0],[.16,-.08],[.09,-.16],[0,-.2]];for(let j=0;j<6;j++){const A=pts[j],B=pts[j+1];p.push(lkBeam([Math.cos(a)*A[0],cy+A[1],Math.sin(a)*A[0]],[Math.cos(a)*B[0],cy+B[1],Math.sin(a)*B[0]],.02,.02,NT))}}
  p.push(CY(.06,.06,.035,ST2,[0,cy+.2,0]),CY(.05,.05,.035,ST2,[0,cy-.2,0]));
  for(let i=0;i<9;i++){const a=i*2.4,rr=.04+H(i,1)*.07,y=cy-.1+H(i,2)*.2;p.push(SP(.05+H(i,3)*.025,[0xe58a8a,0xf0a070,0xd36f78,0xf3c9a8][i%4],[Math.cos(a)*rr,y,Math.sin(a)*rr],[1.3,.8,1],[0,a,H(i,4)],10,8))}
  /* 물 위 떠 있는 미끼 조각 셋 */
  for(const [x,z,c] of[[.5,.18,0xe58a8a],[-.44,.32,0xf0a070],[.14,-.52,0xd36f78]])p.push(SP(.05,c,[x,.0,z],[1.4,.5,1],[0,x*3,0],10,6));
  put('bt_baitbuoy',p)}
 /* ===== 작살: 자루 y축(손 = 원점), 위에 쇠 날 + 갈고리 둘, 놋쇠 고리, 빨간 띠, 뒤에 감긴 밧줄 ===== */
 {const harp=(L=1.9,K=1)=>{const y0=-.42*K,y1=y0+L,p=[];const c=(a,b,h,n=12)=>cyl(a*K,b*K,h,n);
   p.push(pt(c(.034,.04,L-.02),WD,[0,(y0+y1)/2-.01,0]),pt(c(.05,.05,.05),0x3b2a1e,[0,y0,0]));
   for(let k=0;k<6;k++)p.push(pt(new THREE.TorusGeometry(.043*K,.01*K,5,12),0x6b4a30,[0,-.22*K+k*.06*K,0],[PI/2,0,0]));   /* 가죽 감은 손잡이 */
   p.push(pt(c(.046,.046,.07),RD,[0,y1-.42*K,0]),pt(c(.046,.046,.025),WH,[0,y1-.375*K,0]),pt(c(.046,.046,.025),WH,[0,y1-.465*K,0]));
   p.push(pt(c(.05,.042,.12),0xd9a440,[0,y1-.02*K,0]),pt(c(.03,.05,.05),0xd9a440,[0,y1+.06*K,0]));   /* 놋쇠 고리 */
   p.push(pt(c(.026,.03,.2),ST,[0,y1+.18*K,0]));
   const tip=new THREE.Shape();tip.moveTo(-.07,0);tip.lineTo(0,.3);tip.lineTo(.07,0);tip.lineTo(.03,-.02);tip.lineTo(0,.02);tip.lineTo(-.03,-.02);tip.lineTo(-.07,0);
   const tg=new THREE.ExtrudeGeometry(tip,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2});tg.translate(0,0,-.015);
   p.push(pt(tg,0xe6ebf0,[0,y1+.28*K,0],0,[K,K,K]));
   for(const sx of[-1,1]){const b=new THREE.Shape();b.moveTo(0,0);b.lineTo(sx*.1,-.14);b.lineTo(sx*.03,-.06);b.lineTo(0,-.08);b.lineTo(0,0);const bg=new THREE.ExtrudeGeometry(b,{depth:.022,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:1});bg.translate(0,0,-.011);p.push(pt(bg,ST,[sx*.02*K,y1+.26*K,0],0,[K,K,K]))}
   /* 뒤쪽 밧줄 타래 + 묶은 매듭 */
   for(let k=0;k<4;k++)p.push(pt(new THREE.TorusGeometry(.11*K,.016*K,6,20),RO,[.07*K,.12*K-k*.022*K,.0],[PI/2+.15,0,.3]));
   p.push(pt(c(.05,.05,.04),RO,[0,.2*K,0]));
   return p};
  put('bt_harpoon',harp());put('bt_harpoon_i',harp(1.25,1.45))}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{btModels66()}catch(e){console.error('bait: 66차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
