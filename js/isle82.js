/* ===== 82차(규칙, 기획자 11-25 22:07): 수달섬 다리·지형 다듬기 · 낚시섬(낚시 캠프)이 한눈에 낚시하는 곳으로 보이게 =====
   기획자: '요리·사냥 상인 있는 곳 다리도 좀 퀄리티가 떨어져', '거기 지형들 좀 더 퀄리티 있게, 뭘 덕지덕지 붙이는 게 아닌 그냥 적당히, 대신 어색하지 않고 딱 봐도 조화롭게',
          '낚시 상인 있는 곳 퀄리티도 좀 더 — 그곳이 그곳인지 알아보도록'.
   ① 수달섬 다리(otter.js otBridgeGeo 바꿔 끼우기): 통나무 말뚝 두 개씩 + 받침 보 + X 버팀 + 밧줄 감기 + 물 자국, 양옆 굵은 옆보, 틈 있는 판자(색·길이 조금씩),
      둥근 기둥 + 통나무 손잡이 + 굵은 밧줄 난간, 높은 기둥에 매단 등불, 양 끝 쌓은 돌 받침. 걷는 판·옆 벽은 예전 그대로.
   ② 수달섬 안(otter.js 목록을 고쳐 써요): 흩어진 소품을 줄이고(꽃밭·장터 가판대·통나무·그루터기·이끼 바위·갈대·가죽 틀·가로등 넷 등) 묶어서 —
      요리 쪽 = 상인 둘레 나무 마루 부엌 + 텃밭·온실 + 풍차, 사냥 쪽 = 나무 무리 숲 가장자리 + 모닥불 둘레 돌 + 텐트·오두막·활터,
      둘레엔 이끼 낀 바위 무더기·덤불·들꽃이 자연스럽게. 길은 문 → 가운데 마당 → 두 상인으로 하나씩.
   ③ 낚시섬: 문 위 큰 나무 아치(커다란 물고기 조각 · 노 두 개 · 부표), 오두막 지붕 위 물고기 간판, 마당의 '오늘의 대어' 걸이(청새치·저울·칠판),
      울타리에 매단 부표 줄·구명환, 바닷가에 엎어 둔 배·닻. 자판기 묶음은 마당 가운데에서 문 옆 울타리 쪽으로. */
const IS82={};
if(typeof TUNDRA_OFF!=='undefined'&&typeof OTR!=='undefined')TUNDRA_OFF.push([OTR.x,OTR.z,52]);   /* 수달섬: 섬을 가로지르던 누런 마른 풀 띠(길처럼 보임) 없이 고르게 */

/* ---------- ① 수달섬 다리 ---------- */
otBridgeGeo=function(b){const p=[],lg=[],{S0,dx,dz,px,pz,len,yAt}=b,r=Math.atan2(dx,dz),W=1.2;
 const at=(t,o)=>[S0[0]+dx*len*t+px*o,S0[1]+dz*len*t+pz*o],slope=t=>{const e=.002;return Math.atan2(yAt(Math.min(1,t+e))-yAt(Math.max(0,t-e)),2*e*len)};
 const BX=(w,h,d,c,pos,rx=0)=>pt(lkRb(w,h,d,.025,.015),c,pos,[rx,r,0]),LOG=(a,b2,rr,c)=>{const ddx=b2[0]-a[0],ddy=b2[1]-a[1],ddz=b2[2]-a[2],L=Math.hypot(ddx,ddy,ddz),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(ddx/L,ddy/L,ddz/L)),e=new THREE.Euler().setFromQuaternion(q);p.push(pt(cyl(rr,rr*1.04,L,9),c,[(a[0]+b2[0])/2,(a[1]+b2[1])/2,(a[2]+b2[2])/2],[e.x,e.y,e.z]))};
 const WC=[0xc98a52,0xbf7f48,0xd39a5e,0xb87644,0xc48650],DK=0x6b4228,PL=0x7a4b2e,RP=0xd9c49a,WET=0x4e3a2a;
 /* 판자: 0.3m, 틈 3.5cm, 색·길이·살짝 비뚤게 */
 const np=Math.floor(len/.335);for(let i=0;i<=np;i++){const t=i/np,[x,z]=at(t,(hash(i,1,881)-.5)*.08),y=yAt(t),L=2.34+(hash(i,2,881)-.5)*.16;p.push(pt(lkRb(L,.07,.3,.02,.012),WC[(i*7)%5],[x,y-.035,z],[-slope(t),r+(hash(i,3,881)-.5)*.03,0]))}
 /* 옆보(판자 끝 밑) */
 const ns=Math.ceil(len/1.5);for(let i=0;i<ns;i++){const t=(i+.5)/ns;for(const o of[-1.16,1.16]){const [x,z]=at(t,o);p.push(BX(.2,.26,len/ns+.04,DK,[x,yAt(t)-.18,z],-slope(t)))}}
 /* 말뚝 묶음: 둘씩 + 머리 보 + X 버팀 + 밧줄 감기 + 물 자국 */
 const nk=Math.max(3,Math.round(len/4.4)),bent=[];for(let i=0;i<=nk;i++){const t=i/nk,y=yAt(t);const [cx,cz]=at(t,0),deep=hAt(cx,cz)<y-.7;if(!deep&&i>0&&i<nk)continue;bent.push([t,y,deep]);
  for(const o of[-1.32,1.32]){const [x,z]=at(t,o),f=Math.min(hAt(x,z),0)-.5;if(hAt(x,z)>y-.3)continue;LOG([x,f,z],[x,y-.2,z],.16,PL);p.push(pt(cyl(.172,.172,.4,10),WET,[x,.05,z]),pt(new THREE.TorusGeometry(.17,.032,6,12),RP,[x,.62,z],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.17,.032,6,12),RP,[x,.7,z],[Math.PI/2,0,0]),pt(cyl(.18,.17,.06,10),0x5f3a22,[x,y-.18,z]))}
  if(deep){const [ax,az]=at(t,-1.32),[bx2,bz2]=at(t,1.32);p.push(BX(3.0,.2,.26,DK,[cx,y-.36,cz]));LOG([ax,y-.42,az],[bx2,.35,bz2],.065,DK);LOG([bx2,y-.42,bz2],[ax,.35,az],.065,DK)}}
 /* 난간: 둥근 기둥(갓) + 통나무 손잡이 + 굵은 밧줄 */
 const nr=Math.ceil(len/2.2),post=[];for(let i=0;i<=nr;i++)post.push(i/nr);
 for(const o of[-W,W])post.forEach((t,i)=>{const [x,z]=at(t,o),y=yAt(t),tall=i%4===2;p.push(pt(cyl(.075,.085,tall?1.75:1.05,9),PL,[x,y+(tall?.84:.5),z]),pt(cyl(.1,.1,.06,9),DK,[x,y+(tall?1.72:1.03),z]),pt(new THREE.SphereGeometry(.07,9,6),DK,[x,y+(tall?1.78:1.08),z]));
  if(i<post.length-1){const t2=post[i+1],[x2,z2]=at(t2,o),y2=yAt(t2);LOG([x,y+.95,z],[x2,y2+.95,z2],.055,0xc98a52);plSag(p,[x,y+.55,z],[x2,y2+.55,z2],.12,RP,.04)}
  if(tall&&o===(i%8===2?W:-W)){/* 등불: 팔 + 매단 등 */const ax=x-px*Math.sign(o)*.42,az=z-pz*Math.sign(o)*.42;p.push(BX(.06,.06,.5,0x2f3338,[(x+ax)/2,y+1.62,(z+az)/2]));p.push(pt(cyl(.012,.012,.18,4),0x2f3338,[ax,y+1.5,az]),BX(.2,.05,.2,0x2f3338,[ax,y+1.4,az]),BX(.22,.05,.22,0x2f3338,[ax,y+1.12,az]));lg.push(pt(lkRb(.15,.22,.15,.03,.02),0xffd36a,[ax,y+1.26,az],[0,r,0]))}});
 /* 양 끝: 쌓은 돌 받침 */
 for(const [t,sg] of[[0,1],[1,-1]]){const y=yAt(t);for(let k=0;k<3;k++)for(let j=0;j<5;j++){const o=-1.3+j*.65+(k%2?.32:0),[x,z]=at(t+sg*(.006+k*.004),o),hy=hAt(x,z),yy=Math.min(y-.25,hy+.15)-k*.28;if(yy<hy-.6)continue;
   p.push(pt(lkRb(.6,.26,.5,.06,.04),[0x9aa1a8,0x7f868d,0xa9aeb3,0x8a9097][(k+j)%4],[x,yy,z],[0,r+(hash(k,j,882)-.5)*.2,0]))}
  for(const o of[-1.75,1.75]){const [x,z]=at(t,o);p.push(lkBoulder(.42+hash(t*9|0,o*3|0,883)*.2,[0x8e8e96,0x83838c][(t+o>0)|0],t*7+o*3|0,[x,Math.max(hAt(x,z),-.2)-.15,z],.8))}}
 const g=mg(p);lkSmooth(g,40);return{wood:g,glow:lg.length?mg(lg):null}};

/* ---------- ② 수달섬 안: 목록 고쳐 쓰기(otter.js가 짓기 전에) ---------- */
{const keepP=['ot_oven','ot_grill','ot_pot','ot_vegcrates','ot_preptable','ot_picnic','ot_tent','ot_meatrack','ot_spit','ot_woodpile','ot_target','ot_sign'];
 const P=OT_PROPS.filter(q=>keepP.includes(q[0]));OT_PROPS.length=0;OT_PROPS.push(...P);
 for(let i=OT_PROPS.length-1;i>=0;i--)if(OT_PROPS[i][0]==='ot_grill'||OT_PROPS[i][0]==='ot_picnic')OT_PROPS.splice(i,1);
 /* 요리: 가판대 둘레를 세상 방향(정면 +z)으로 맞춰 — 나무 마루 위 부엌(화덕·솥·손질 탁자·채소 상자), 마루 앞 피크닉 탁자 둘 */
 {const [x0,z0]=otW(OTN.cook.s,OTN.cook.v),L=(dx,dz)=>otLoc(x0+dx,z0+dz),set=(k,dx,dz)=>{const q=OT_PROPS.find(o=>o[0]===k);if(q){const [a,b]=L(dx,dz);q[1]=a;q[2]=b}};
  set('ot_oven',-3.1,-.5);set('ot_pot',-2.9,1.9);set('ot_preptable',3.0,-.6);set('ot_vegcrates',3.1,1.7);
  for(const [dx,dz] of[[-2.2,5.4],[2.8,5.4]]){const [a,b]=L(dx,dz);OT_PROPS.push(['ot_picnic',a,b,1.25,1.0])}IS82.cook=[x0,z0]}
 for(const q of OT_PROPS)if(q[0]==='ot_sign'){q[1]=21;q[2]=-2.6}
 /* 사냥: 가판대 둘레도 세상 방향으로 — 왼쪽 고기 건조대, 오른쪽 뒤 장작더미, 앞 오른쪽 꼬치구이 모닥불(둘레 돌·앉는 통나무는 아래 is82Otter) */
 {const [x0,z0]=otW(OTN.hunt.s,OTN.hunt.v),set=(k,dx,dz)=>{const q=OT_PROPS.find(o=>o[0]===k);if(q){const [a,b]=otLoc(x0+dx,z0+dz);q[1]=a;q[2]=b}};set('ot_meatrack',-3.7,.3);set('ot_woodpile',-3.4,-2.6);set('ot_spit',5.4,-1.8);IS82.hunt=[x0,z0]}
 const B=OT_BIG.filter(q=>['pr_windmill','pr_greenhouse','pr_cabin','pr_bigtree'].includes(q[0]));OT_BIG.length=0;OT_BIG.push(...B);
 const D=OT_DECO.filter(q=>/^pc_/.test(q[0])||(q[0]==='sack')||(q[0]==='haybale'&&q[1]<-20)||(q[0]==='barrel'&&q[1]===-26));OT_DECO.length=0;OT_DECO.push(...D);
 OT_TREES.length=0;OT_TREES.push(/* 사냥 쪽 숲 가장자리 */[-22,12],[-21,7],[-8,19],[-4,21],[2,20],[6,18.5],[12,13],[15,11],[24,12],[27,9],
  /* 요리 쪽: 텃밭 뒤·풍차 옆에 몇 그루 */[-12,-23],[-36,-5],[-37,0],[29,-5]);
 OT_LAMPS.length=0;OT_LAMPS.push([31,-3.5],[4,-2.5],[-12,10.5]);
 const [hx0,hz0]=otW(OTN.hunt.s,OTN.hunt.v),HP=[otLoc(hx0+2.9,hz0-12.5),otLoc(hx0+2.4,hz0-2),otLoc(hx0+2.2,hz0+1.4),otLoc(hx0,hz0+2.3)];
 const PT=[[[42,0],[30,.5],[20,0],[9,-1]],[[9,-1],[7,-7],[6,-13.4]],[[9,-1],...HP],[HP[0],[-6,7],[-16,6],[-26,4]],[[9,-1],[-4,-5],[-16,-6],[-25,-5]]];
 OT_PATHS.length=0;OT_PATHS.push(...PT);OT_PW.length=0;OT_PW.push(...OT_PATHS.map(l=>l.map(([s,v])=>otW(s,v))))}
/* 이끼 바위 무더기·덤불·들꽃(섬 가장자리 쪽에 몇 군데) + 요리 마루 + 사냥 모닥불 둘레 돌 */
IS82.ROCKS=[[-25,-6,1.0],[20,-8,.9],[-29,1,.95],[19,14,1.0],[30,2,.85]];
IS82.FLOWERS=[[-8,-9,2.2],[20,-7,1.8],[-24,-12,1.6],[16,6,1.6],[-28,10,1.5]];
function is82Otter(){if(typeof OTB==='undefined'||!OTB||!OTB.fence)return;const F=OTB.fence,gh=(x,z)=>hAt(x,z);
 const inF=(x,z,m)=>{if(gh(x,z)<.97)return false;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;const ddx=q[0]-a[0],ddz=q[1]-a[1],t=clamp(((x-a[0])*ddx+(z-a[1])*ddz)/(ddx*ddx+ddz*ddz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-ddx*t,z-a[1]-ddz*t))}return c&&d>m};
 const free=(x,z,r)=>!structs.some(s=>s.t!=='iblk'&&Math.hypot(s.x-x,s.z-z)<r+Math.max(sdef(s).bx||0,sdef(s).bz||0));
 /* 요리 상인 둘레 나무 마루(바닥에 깐 판자 — 걷기 높이 그대로) */
 {const [cx,cz]=IS82.cook||otW(OTN.cook.s,OTN.cook.v),p=[],C=[0xc98a52,0xbf7f48,0xd39a5e,0xb87644];let k=0;for(let z=cz-1.5;z<=cz+3.1;z+=.31,k++){const off=(k%2)*.9;for(let x=cx-4.4+off-(k%2?1.8:0);x<cx+4.4;){const L=Math.min(1.8+hash(k,(x*3)|0,884)*.3,cx+4.4-x);if(L>.25)p.push(pt(lkRb(L-.03,.06,.29,.02,.012),C[(k+((x*7)|0))%4],[x+L/2,gh(x+L/2,z)+.035,z]));x+=L}}
  for(const z of[cz-1.62,cz+3.22])p.push(pt(lkRb(8.9,.1,.1,.02,.01),0x8a5a36,[cx,gh(cx,z)+.05,z]));for(const x of[cx-4.47,cx+4.47])p.push(pt(lkRb(.1,.1,4.85,.02,.01),0x8a5a36,[x,gh(x,cz+.8)+.05,cz+.8]));
  const g=mg(p);lkSmooth(g,40);plAdd(g,0,0,0)}
 /* 사냥 모닥불 둘레 돌 + 앉는 통나무 둘 */
 {const [hx,hz]=IS82.hunt||otW(OTN.hunt.s,OTN.hunt.v),[x0,z0]=[hx+5.4,hz-1.8],p=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2;p.push(lkBoulder(.16+hash(i,1,885)*.06,[0x9a948c,0x86827a][i%2],i*3+1,[x0+Math.cos(a)*.95,gh(x0,z0)-.04,z0+Math.sin(a)*.95],.7))}
  for(const [dx,dz,ry] of[[1.7,-1.2,.8],[.4,-2.2,0]]){const x=x0+dx,z=z0+dz;p.push(pt(cyl(.2,.2,1.5,10),0x8a5a36,[x,gh(x,z)+.2,z],[0,ry+.785,Math.PI/2]),pt(cyl(.19,.19,.02,10),0xd9b98a,[x+Math.cos(ry+.785)*.75,gh(x,z)+.2,z-Math.sin(ry+.785)*.75],[0,ry+.785,Math.PI/2]));addStruct({t:PLB(.75,.22),x,z,r:ry+.785,hp:1e9})}
  const g=mg(p);lkSmooth(g,60);plAdd(g,0,0,0)}
 /* 이끼 바위 무더기(부딪힘) */
 {const p=[];IS82.ROCKS.forEach(([s,v,k],i)=>{const [x,z]=otW(s,v);if(!inF(x,z,1.6+k)||!free(x,z,1.4*k))return;const y=gh(x,z);
   p.push(lkBoulder(.9*k,0x8e8e96,i*5+1,[x,y-.2,z],.85),lkBoulder(.55*k,0x83838c,i*5+2,[x+.8*k,y-.15,z+.35*k],.8),lkBoulder(.4*k,0x9a9aa2,i*5+3,[x-.6*k,y-.1,z+.5*k],.7));
   if(GEO.bush)p.push(pt(GEO.bush,null,[x-.2,y+.55*k,z-.1],[0,i,0],[.42*k,.36*k,.42*k]),pt(GEO.bush,null,[x+1.2*k,y-.02,z-.5*k],[0,i*2,0],[.55,.5,.55]));
   addStruct({t:PLB(1.05*k,1.05*k),x,z,r:0,hp:1e9})});const g=mg(p);lkSmooth(g,60);plAdd(g,0,0,0)}
 /* 들꽃 무리(지나갈 수 있음) */
 {const p=[],C=[0xff6b6b,0xffd35c,0xf7f0e3,0xb38cff,0xff9ac2];IS82.FLOWERS.forEach(([s,v,rr],i)=>{for(let k=0;k<16;k++){const a=hash(i,k,886)*6.28,d=Math.sqrt(hash(k,i,887))*rr,[x,z]=otW(s+Math.cos(a)*d,v+Math.sin(a)*d);if(!inF(x,z,.6))continue;
   const y=gh(x,z),h=.22+hash(k,i,888)*.14;p.push(pt(cyl(.012,.014,h,4),0x5f9a3c,[x,y+h/2,z]),pt(new THREE.IcosahedronGeometry(.07,0),C[(i+k)%5],[x,y+h+.02,z]),pt(new THREE.ConeGeometry(.04,.22,4),0x6ea844,[x+.06,y+.1,z+.03],[.3,k,.2]))}});plAdd(mg(p),0,0,0)}}
{const _bpl=buildPlaces;buildPlaces=function(){_bpl.apply(this,arguments);try{is82Otter()}catch(e){console.error('82차 수달섬',e)}try{is82Fish()}catch(e){console.error('82차 낚시섬',e)}}}

/* ---------- ③ 낚시섬 ---------- */
/* 큰 물고기 조각(나무에 칠한 청새치 모양) — 옆모습, 머리 +x */
function is82FishGeo(L,body,belly,fin){const p=[],S=(r,c,pos,sc,rot)=>pt(new THREE.SphereGeometry(r,16,10),c,pos,rot||0,sc);
 p.push(S(.5,body,[0,0,0],[L*.95,.56*L/2.4,.2*L/2.4]),S(.48,belly,[.06*L,-.11*L/2.4,.02],[L*.8,.32*L/2.4,.17*L/2.4]));
 p.push(pt(new THREE.ConeGeometry(.06*L/2.4,.55*L/2.4,8),0xe9e2cf,[.62*L,.02,0],[0,0,-Math.PI/2]));   /* 주둥이 창 */
 const tail=ex([[0,0],[-.36,.32],[-.26,0],[-.36,-.32]],.05,.01);tail.scale(L/2.4,L/2.4,1);tail.translate(-.48*L,0,-.025);p.push(pt(tail,fin));
 const dor=ex([[-.4,0],[.15,0],[-.05,.3],[-.25,.18]],.04,.01);dor.scale(L/2.4,L/2.4,1);dor.translate(.02*L,.14*L/2.4,-.02);p.push(pt(dor,fin));
 p.push(S(.055*L/2.4,0xf7f0e3,[.38*L,.04*L/2.4,.085*L/2.4]),S(.03*L/2.4,0x1e1e22,[.39*L,.04*L/2.4,.1*L/2.4]));
 for(let k=0;k<3;k++)p.push(pt(lkRb(.012,.18*L/2.4,.02,.005,.003),fin,[(.1-k*.12)*L,.0,.06*L/2.4]));return mg(p)}
function is82Fish(){if(typeof FCAMP==='undefined')return;const F=FCAMP,OX=FISHISLE.x,OZ=FISHISLE.z,Y=F.deckY,gh=(x,z)=>hAt(OX+x,OZ+z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x:OX+x,z:OZ+z,r,hp:1e9});
 const WD=0x8a5a36,WD2=0x6f4a2c,RP=0xd9c49a,OR=0xff7a3d,WH=0xf1ece2;
 /* 문 위 큰 아치: 통나무 기둥 둘 + 두 줄 보 + 물고기 조각 + 엇갈린 노 + 부표 */
 {const [gx,gz]=F.gate,y=gh(gx,gz),p=[],x0=-2.05,x1=2.05,H=3.55,z=.45;
  for(const x of[x0,x1]){p.push(pt(cyl(.17,.2,H,10),WD,[x,H/2,z]),pt(cyl(.22,.22,.08,10),WD2,[x,H+.04,z]),pt(new THREE.TorusGeometry(.19,.035,6,12),RP,[x,1.2,z],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.19,.035,6,12),RP,[x,1.3,z],[Math.PI/2,0,0]))}
  p.push(pt(lkRb(4.7,.26,.3,.06,.04),WD2,[0,H-.18,z]),pt(lkRb(4.3,.18,.24,.05,.03),WD,[0,H-.62,z]));for(const x of[-1.1,1.1])p.push(pt(lkRb(.08,.42,.08,.02,.01),WD2,[x,H-.4,z]));
  const fsh=is82FishGeo(3.4,0x3a8fb7,0xe9f2f4,0x2c6a8c);p.push(pt(fsh,null,[0,H+.78,z+.02],[-.6,0,0]),pt(cyl(.05,.05,.5,8),0x5f3f27,[-.7,H+.25,z]),pt(cyl(.05,.05,.5,8),0x5f3f27,[.7,H+.25,z]));
  for(const s of[-1,1]){const q=[pt(cyl(.035,.035,1.7,8),0xc98a52,[0,0,0]),pt(lkRb(.2,.5,.04,.05,.02),0xc98a52,[0,-.95,0])];const g=mg(q);g.rotateZ(s*.62);g.translate(s*.72,H+.1,z+.16);p.push(pt(g,null))}
  for(const [x,c] of[[-1.55,OR],[-1.2,WH],[1.2,OR],[1.55,WH]]){p.push(pt(cyl(.006,.006,.5,4),RP,[x,H-.55,z+.12]),pt(new THREE.SphereGeometry(.13,10,8),c,[x,H-.88,z+.12]))}
  const g=mg(p);lkSmooth(g,40);plAdd(g,OX+gx,y-.02,OZ+gz);bl(gx+x0,gz+z,.24,.24);bl(gx+x1,gz+z,.24,.24)}
 /* 오두막 지붕 위 물고기 간판 + '생선 가게' 판 */
 {const [hx,hz,hw,hd]=F.hut,p=[pt(is82FishGeo(3.5,0xff8a3d,0xfff1d6,0xd9572e),null,[0,.12,0],[-.55,0,0]),pt(cyl(.05,.05,.8,8),0x5f3f27,[-.55,-.62,-.02]),pt(cyl(.05,.05,.8,8),0x5f3f27,[.55,-.62,-.02])];
  const g=mg(p);lkSmooth(g,40);plAdd(g,OX+hx,Y+2.6+.16+1.05+.62,OZ+hz);
  const b=plAdd(mg([pt(lkRb(2.2,.5,.08,.06,.03),0x2c6a8c,[0,0,0]),pt(lkRb(2.32,.08,.1,.03,.02),0xf3e9d2,[0,.29,0]),pt(lkRb(2.32,.08,.1,.03,.02),0xf3e9d2,[0,-.29,0])]),OX+hx,Y+2.15,OZ+hz+hd/2+.1);const t=plSignText('🐟 생선 가게',2.0,.4,70);t.position.set(0,0,.05);b.add(t)}
 /* 마당: '오늘의 대어' 걸이(청새치 + 저울 + 칠판) */
 {const x=IS82.fx=3.4,z=IS82.fz=5.0,y=gh(x,z),p=[];for(const s of[-1,1])p.push(pt(lkRb(.18,3.7,.18,.04,.03),WD,[s*1.35,1.85,0]));p.push(pt(lkRb(3.1,.2,.22,.04,.03),WD2,[0,3.66,0]));
  for(const s of[-1,1]){const q=[pt(lkRb(.1,.7,.08,.02,.01),WD2,[0,0,0])];const g=mg(q);g.rotateZ(s*.7);g.translate(s*1.1,3.4,0);p.push(pt(g,null))}
  p.push(pt(cyl(.01,.01,.36,4),0x3a3f4a,[0,3.4,0]),pt(cyl(.12,.12,.06,14),0xc9cdd2,[0,3.18,0],[Math.PI/2,0,0]),pt(cyl(.14,.14,.03,14),0xe8eef2,[0,3.18,.04],[Math.PI/2,0,0]),pt(cyl(.006,.006,.24,4),0x3a3f4a,[0,2.94,0]),pt(lkRb(.12,.05,.05,.01,.005),0x3a3f4a,[0,2.82,0]));
  const mar=is82FishGeo(3.1,0x2f5f8a,0xd8e6ee,0x234d72);mar.rotateZ(Math.PI/2);mar.rotateX(-.35);p.push(pt(mar,null,[0,1.2,.04]));
  p.push(pt(lkRb(.9,.66,.06,.04,.02),0x2f3b33,[1.95,.95,.1],[0,-.2,0]),pt(lkRb(.98,.74,.05,.04,.02),WD,[1.95,.95,.07],[0,-.2,0]),pt(lkRb(.06,1.2,.06,.02,.01),WD2,[1.95,.6,-.2],[.35,-.2,0]));
  const g=mg(p);lkSmooth(g,40);plAdd(g,OX+x,y-.02,OZ+z);const t=plSignText('오늘의 대어 · 3.2m',.84,.3,56);t.position.set(OX+x+1.95,y+1.02,OZ+z+.15);t.rotation.y=-.2;scene.add(t);
  bl(x-1.35,z,.15,.15);bl(x+1.35,z,.15,.15);bl(x,z,.3,.25);bl(x+1.95,z+.05,.5,.18,-.2)}
 /* 울타리 부표 줄(문 양옆) + 구명환 */
 {const [gx,gz]=F.gate,p=[],line=(a,b2,n)=>{const ya=gh(a[0],a[1])+1.55,yb=gh(b2[0],b2[1])+1.55;plSag(p,[a[0],ya,a[1]+.08],[b2[0],yb,b2[1]+.08],.25,RP,.022);for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b2[0]-a[0])*t,z=a[1]+(b2[1]-a[1])*t,yy=ya+(yb-ya)*t-Math.sin(t*Math.PI)*.25;p.push(pt(new THREE.SphereGeometry(.12,10,8),[OR,WH,0xf2c94c][k%3],[x,yy-.14,z+.1]),pt(cyl(.01,.01,.1,4),RP,[x,yy-.03,z+.1]))}};
  line([gx-8.6,gz-.15],[gx-2.2,gz],7);line([gx+2.2,gz],[gx+7.4,gz-.15],6);
  for(const x of[gx-5.4,gx+4.8]){const z=gz+.1,y=gh(x,z)+1.05;p.push(pt(new THREE.TorusGeometry(.3,.085,8,18),OR,[x,y,z]),pt(new THREE.TorusGeometry(.3,.088,8,18,Math.PI/4),WH,[x,y,z],[0,0,0]),pt(new THREE.TorusGeometry(.3,.088,8,18,Math.PI/4),WH,[x,y,z],[0,0,Math.PI]))}
  const g=mg(p);lkSmooth(g,40);plAdd(g,OX,0,OZ)}
 /* 바닷가: 엎어 둔 배 + 노 + 닻 (문 밖 남서쪽 모래) */
 {const spots=[[-9,15.6],[-12,15.2],[-6,16.4],[8,15.4]];let put=0;for(const [x,z] of spots){if(put>=1)break;if(gh(x,z)<.95||gh(x+1.6,z)<.95||gh(x-1.6,z)<.95)continue;put++;
   const y=gh(x,z),p=[];const hull=new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2);hull.scale(1.6,.5,.62);const P_=hull.attributes.position;for(let i=0;i<P_.count;i++){const hx=P_.getX(i);if(hx>0)P_.setZ(i,P_.getZ(i)*(1-hx/1.6*.55))}p.push(pt(hull,0xc8553d,[0,0,0]),pt(new THREE.TorusGeometry(1,.045,6,24),WH,[0,.03,0],[Math.PI/2,0,0],[1.6,.62,1]));
   p.push(pt(lkRb(2.9,.07,.09,.02,.01),0x6f4a2c,[.05,.5,0]));for(const k of[-.7,0,.7])p.push(pt(lkRb(.05,.02,1.0-Math.abs(k)*.3,.01,.005),0x9e3f2c,[k,.47,0]));p.push(pt(cyl(.025,.025,1.8,6),0xc98a52,[.2,.06,.95],[0,0,Math.PI/2+.08]),pt(lkRb(.38,.03,.14,.03,.01),0xc98a52,[1.05,.08,.96]));
   const g=mg(p);lkSmooth(g,40);plAdd(g,OX+x,y-.06,OZ+z,.15);bl(x,z,1.6,.7,.15)}
  const [gx,gz]=F.gate,ax=gx+3.2,az=gz+1.3,ay=gh(ax,az),p=[pt(cyl(.07,.07,1.5,8),0x3a3f4a,[0,.75,0],[0,0,.22]),pt(new THREE.TorusGeometry(.42,.07,8,18,Math.PI),0x3a3f4a,[.0,.28,0],[0,0,Math.PI+.22]),pt(new THREE.TorusGeometry(.12,.035,6,12),0x3a3f4a,[-.17,1.53,0]),pt(cyl(.04,.04,.7,6),0x3a3f4a,[-.14,1.22,0],[0,0,Math.PI/2+.22])];
  for(const s of[-1,1])p.push(pt(new THREE.ConeGeometry(.1,.22,6),0x3a3f4a,[s*.42*Math.cos(.22)+.0,.28-s*.42*Math.sin(.22)+.06,0],[0,0,s*.9]));plAdd(mg(p),OX+ax,ay-.02,OZ+az,.3);bl(ax,az,.35,.3)}}

/* 자판기 묶음 자리: 낚시섬 = 문 안 서쪽 울타리 앞(마당 가운데 대신), 수달섬 = 가운데 마당 */
vs81Place=function(){
 try{if(typeof FISHISLE!=='undefined'&&typeof FCAMP!=='undefined'){const F=FISHISLE,cx=F.x+F.cx,cz=F.z+F.cz,[gx,gz]=FCAMP.gate,inC=(x,z)=>Math.abs(x-cx)<F.rx-2&&Math.abs(z-cz)<F.rz-2;
   let ok=false;for(const [dx,dz] of[[-10.2,8.6],[-9.2,8.2],[-11,8.0],[-8.4,7.6],[-12,7.4]]){const x=F.x+dx,zf=F.z+dz;if(inC(x,zf)&&vs81Fits(x,zf)){vs81Put('fish',x,zf);ok=true;break}}
   if(!ok)vs81Find('fish',F.x+gx-8,F.z+gz-4,1,14,inC)}}catch(e){console.error('82차 낚시섬 자판기',e)}
 try{if(typeof OTR!=='undefined'){const [x,z]=otW(9,-1);vs81Find('otter',x+5.2,z+3.2,0,12,(xx,zz)=>Math.hypot(xx-OTR.x,zz-OTR.z)<30)}}catch(e){console.error('82차 수달섬 자판기',e)}};
/* 수달섬 흙길: 좁고 옅게(문 → 마당 → 두 상인), 가운데 마당은 동그랗게 */
otWorn=function(x,z){if(Math.abs(x-OTR.x)>48||Math.abs(z-OTR.z)>48)return 0;let d=9;for(const l of OT_PW)for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t))}
 const [ls,lv]=otLoc(x,z),F=OT_FIELD,fd=Math.max(Math.abs(ls-(F.s0+F.s1)/2)-(F.s1-F.s0)/2,Math.abs(lv-(F.v0+F.v1)/2)-(F.v1-F.v0)/2),fw=fd<0?.85:fd<1.2?.85*(1-fd/1.2):0,[px,pz]=otW(9,-1),pl=(1-sm(2.2,3.6,Math.hypot(x-px,z-pz)))*.34;
 return clamp(Math.max((1-sm(.3,1.05,d+(noise(x*.4,z*.4,82)-.5)*.5))*.4,fw,pl)*(.8+noise(x*.6+2,z*.6+7,81)*.4),0,1)};
