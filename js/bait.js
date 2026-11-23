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
