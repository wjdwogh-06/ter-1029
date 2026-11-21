'use strict';
/* ===== ports: piers, quays, boats, harbour props. Each port is laid out in its own frame:
   origin = shoreline point, +lz = out to sea, +lx = right when facing the sea ===== */
const PBOATS=[],PLAMPS=[],PGEO={};
DECO.ferry={g:'nil',s:1,bx:1.4,bz:1.4,pass:1,hp:1e9};   /* 통통배 자리: 가까이 가서 [배 타기] → 가고 싶은 항구로(ui.js ferryGo). 지나갈 수 있어요 */
/* 항구마다 랜덤 자판기 + 재활용 쓰레기통(기획자 요청 6차). 정면은 늘 카메라(+z). 모델은 look.js가 lk_vend·lk_recycle로 바꿔 끼워요 */
DECO.vend={g:'vendbox',s:1,bx:.7,bz:.55,hp:1e9};DECO.recycle={g:'recyclebox',s:1,bx:.98,bz:.5,hp:1e9};
function pierGeo(L,W){const key='p'+L.toFixed(1)+'_'+W.toFixed(1);if(PGEO[key])return PGEO[key];const p=[],n=Math.max(2,Math.round(L/.56));
 for(let i=0;i<n;i++)p.push(pt(box(W+(hash(i,3,9)-.5)*.14,.12,L/n-.05),i%3?0xb98556:i%2?0x8d5f3b:0xa67848,[(hash(i,1,9)-.5)*.08,.7,-L/2+(i+.5)*L/n],[0,(hash(i,2,9)-.5)*.04,0]));
 for(const sx of[-1,1]){p.push(pt(box(.16,.18,L),0x6f4a2c,[sx*(W/2-.12),.58,0]));const m=Math.max(2,Math.round(L/3.6)+1);
  for(let i=0;i<m;i++){const z=-L/2+.25+i*(L-.5)/(m-1);p.push(pt(cyl(.14,.16,3.4,7),0x7a5232,[sx*(W/2+.03),-.55,z]),pt(cyl(.17,.17,.08,7),0x4b3520,[sx*(W/2+.03),1.17,z]))}}
 return PGEO[key]=mg(p)}
function quayGeo(L,W){const p=[pt(box(W,2.2,L),0x8f8f88,[0,-.44,0])],n=Math.round(L/1.5);
 for(let i=0;i<n;i++){p.push(pt(box(W+.24,.14,L/n-.06),[0xa9a9a1,0x9c9c94,0xb4b3aa][i%3],[0,.73,-L/2+(i+.5)*L/n]));if(i%3===1)p.push(pt(cyl(.17,.22,.5,8),0x3a3f46,[-(W/2-.35),1.02,-L/2+(i+.5)*L/n]),pt(cyl(.25,.25,.1,8),0x2c3036,[-(W/2-.35),1.3,-L/2+(i+.5)*L/n]))}
 for(let i=0;i<n;i+=2)p.push(pt(box(.3,.5,.5),0x4b3520,[-(W/2+.14),.2,-L/2+(i+.5)*L/n]));return mg(p)}
function buildPortGeo(){const WD=0x8d5f3b,WD2=0x6f4a2c,WD3=0xb98556,IRON=0x3a3f46,ROPE=0xc9b68a,hull=(sx,sy,sz)=>{const g=new THREE.SphereGeometry(1,12,6,0,6.3,Math.PI/2,Math.PI/2);g.scale(sx,sy,sz);return g},
  rim=(sx,sz,t=.07)=>{const g=new THREE.TorusGeometry(1,t,5,18);g.rotateX(Math.PI/2);g.scale(sx,1,sz);return g},disc=(sx,sz)=>{const g=cyl(1,1,.04,14);g.scale(sx,1,sz);return g};
 GEO.rowboat=mg([pt(hull(.66,.46,1.55),WD),pt(rim(.66,1.55),WD3),pt(disc(.52,1.36),WD2,[0,-.2,0]),pt(box(1.1,.05,.24),WD3,[0,-.06,.5]),pt(box(1.16,.05,.24),WD3,[0,-.06,-.35]),pt(box(.5,.05,.2),WD3,[0,-.06,1.2]),
  pt(cyl(.025,.025,1.7,5),0xd2b48c,[.5,.06,.1],[1.45,0,.25]),pt(box(.14,.03,.4),0xd2b48c,[.72,.14,.95],[1.45,0,.25]),pt(cyl(.025,.025,1.7,5),0xd2b48c,[-.5,.06,.1],[1.45,0,-.25]),pt(box(.14,.03,.4),0xd2b48c,[-.72,.14,.95],[1.45,0,-.25]),pt(new THREE.TorusGeometry(.14,.04,5,10),ROPE,[0,-.12,-.9],[Math.PI/2,0,0])]);
 GEO.fboat=mg([pt(hull(1.15,.8,3.1),0x2f5d8a),pt(rim(1.15,3.1,.09),0xf2efe6),pt(disc(1.02,2.9),0xb98556,[0,-.12,0]),pt(box(1.3,1.15,1.5),0xf2efe6,[0,.48,-.7]),pt(box(1.5,.12,1.75),0xc9443a,[0,1.1,-.7]),pt(box(1.0,.36,.05),0x2f3a48,[0,.66,.07]),pt(box(.05,.36,.8),0x2f3a48,[.66,.66,-.7]),pt(box(.05,.36,.8),0x2f3a48,[-.66,.66,-.7]),
  pt(cyl(.06,.07,2.6,6),WD2,[0,1.3,.75]),pt(cyl(.04,.04,1.7,5),WD2,[0,1.9,1.5],[1.2,0,0]),pt(cyl(.012,.012,1.5,4),0x1c1c1c,[0,1.5,2.05]),pt(ico(.34,1),ROPE,[.45,.08,1.6],0,[1,.5,1.2]),pt(ico(.3,1),0xa89a70,[-.4,.06,2.0],0,[1,.45,1]),
  pt(new THREE.TorusGeometry(.2,.07,5,10),0xe8622c,[1.18,.0,.3],[0,Math.PI/2,0]),pt(new THREE.TorusGeometry(.2,.07,5,10),0xe8622c,[-1.18,.0,-.9],[0,Math.PI/2,0]),pt(box(.4,.3,.4),0x8d5f3b,[-.3,.06,.9]),pt(cyl(.08,.08,.5,6),0x23272e,[.35,1.42,-1.1])]);
 GEO.sailboat=mg([pt(hull(1.0,.75,3.4),0xf2efe6),pt(rim(1.0,3.4,.09),0x23405e),pt(disc(.88,3.2),0xc9a06a,[0,-.12,0]),pt(box(.9,.5,1.5),0x23405e,[0,.18,-.9]),pt(box(1.0,.07,1.6),0xf2efe6,[0,.46,-.9]),pt(cyl(.06,.08,5.6,6),WD2,[0,2.7,.3]),pt(cyl(.04,.04,2.6,5),WD2,[0,.95,-1.0],[Math.PI/2,0,0]),
  pt(cone(1.45,4.4,4),0xf4f1e6,[0,3.2,-.95],[0,Math.PI/4,0],[.03,1,1.25]),pt(cone(1.0,3.4,4),0xe9e2cf,[0,2.6,1.25],[0,Math.PI/4,0],[.03,1,1.1]),pt(box(.02,.3,.5),0xc9443a,[0,5.55,.05]),pt(box(.08,.3,.5),WD2,[0,-.2,-3.3])]);
 GEO.plamp=mg([pt(cyl(.07,.1,3.1,6),IRON,[0,1.55,0]),pt(box(.07,.07,.6),IRON,[0,3.05,.26]),pt(box(.26,.32,.26),0xffe9a0,[0,2.78,.5]),pt(cone(.24,.16,4),IRON,[0,3.0,.5],[0,Math.PI/4,0]),pt(box(.3,.04,.3),IRON,[0,2.6,.5]),pt(cyl(.16,.2,.14,6),IRON,[0,.07,0])]);

 GEO.vendbox=mg([pt(box(1.3,1.3,.95),0x2f8f9d,[0,.65,0]),pt(new THREE.SphereGeometry(.56,12,8),0xbff3ff,[0,1.86,0])]);GEO.recyclebox=mg([pt(box(.82,1.1,.84),0x4caf6a,[-.48,.55,0]),pt(box(.82,1.1,.84),0x4a8fd6,[.48,.55,0])]);
 GEO.pboll=mg([pt(cyl(.15,.19,.5,7),WD2,[0,.25,0]),pt(cyl(.19,.19,.07,7),0x4b3520,[0,.5,0]),pt(new THREE.TorusGeometry(.24,.06,5,10),ROPE,[0,.14,0],[Math.PI/2,0,0])]);
 {const p=[pt(cyl(.07,.08,2.3,5),WD2,[-1.2,1.15,0]),pt(cyl(.07,.08,2.3,5),WD2,[1.2,1.15,0]),pt(cyl(.05,.05,2.6,5),WD,[0,2.2,0],[0,0,Math.PI/2])];for(let i=0;i<7;i++){p.push(pt(box(.02,2.6,.02),ROPE,[-1.05+i*.35,1.15,0],[0,0,.55]),pt(box(.02,2.6,.02),ROPE,[-1.05+i*.35,1.15,.01],[0,0,-.55]))}for(let i=0;i<5;i++)p.push(pt(ico(.08),i%2?0xe8622c:0xf2efe6,[-1+i*.5,2.2,0]));GEO.pnet=mg(p)}
 {const p=[pt(cyl(.06,.07,2.0,5),WD2,[-1,1,0]),pt(cyl(.06,.07,2.0,5),WD2,[1,1,0]),pt(cyl(.04,.04,2.3,5),WD,[0,1.9,0],[0,0,Math.PI/2]),pt(cyl(.04,.04,2.3,5),WD,[0,1.3,0],[0,0,Math.PI/2])];for(let i=0;i<5;i++)p.push(pt(GEO.f_cod,null,[-.8+i*.4,1.55,0],[Math.PI/2,0,Math.PI/2],[.5,.5,.5]),pt(GEO.f_herring,null,[-.8+i*.4,1.0,0],[Math.PI/2,0,Math.PI/2],[.5,.5,.5]));GEO.prack=mg(p)}
 GEO.pcrane=mg([pt(box(1,.3,1),WD2,[0,.15,0]),pt(cyl(.13,.17,3.6,7),WD,[0,2.1,0]),pt(box(.14,.16,3.2),WD,[0,3.6,1.2],[-.32,0,0]),pt(box(.1,.1,1.7),WD2,[0,2.9,.6],[.75,0,0]),pt(cyl(.016,.016,1.7,4),0x1c1c1c,[0,3.2,2.6]),pt(box(.62,.56,.62),0xa67848,[0,2.05,2.6]),pt(box(.66,.06,.66),WD2,[0,2.33,2.6]),pt(box(.66,.06,.66),WD2,[0,1.8,2.6]),pt(cyl(.2,.2,.3,8),IRON,[0,1.0,-.3],[0,0,Math.PI/2])]);
 GEO.pbuoy=mg([pt(new THREE.SphereGeometry(.34,10,8),0xd9382c,[0,.1,0]),pt(cyl(.35,.35,.12,10),0xf2efe6,[0,.1,0]),pt(cyl(.03,.03,.8,5),IRON,[0,.6,0]),pt(ico(.09),0xffe14a,[0,1.02,0])]);
 GEO.psign=mg([pt(cyl(.07,.08,2.5,5),WD2,[0,1.25,0]),pt(box(1.7,.55,.09),WD3,[0,2.2,0]),pt(box(1.8,.06,.12),WD2,[0,2.5,0]),pt(box(1.8,.06,.12),WD2,[0,1.9,0]),pt(new THREE.TorusGeometry(.11,.03,5,10),0x2f5d8a,[-.6,2.32,.06]),pt(box(.04,.3,.03),0x2f5d8a,[-.6,2.15,.06]),pt(box(.24,.04,.03),0x2f5d8a,[-.6,2.04,.06])]);
 GEO.praft=mg([...[0,1,2,3,4,5].map(i=>pt(cyl(.3,.3,3.8,7),i%2?WD:WD3,[-1.5+i*.6,.25,0],[Math.PI/2,0,0])),pt(box(3.9,.1,.3),WD2,[0,.52,1.3]),pt(box(3.9,.1,.3),WD2,[0,.52,-1.3]),pt(cyl(.3,.3,.5,8),0x2f5d8a,[1.2,.8,1.0]),pt(box(.5,.4,.5),0xa67848,[-1.1,.75,-.8])]);
 GEO.pstack=mg([pt(GEO.crate_A_big,null,[0,0,0],[0,.2,0],[4.6,4.6,4.6]),pt(GEO.crate_B_small,null,[1.15,0,.15],[0,.7,0],[4.6,4.6,4.6]),pt(GEO.crate_A_small,null,[.1,1.05,.05],[0,-.3,0],[4.6,4.6,4.6]),pt(GEO.barrel,null,[-1.05,0,.35],0,[4.6,4.6,4.6]),pt(GEO.sack,null,[.6,0,1.0],[0,1,0],[6,6,6])])}
/* eight small-port recipes: pier shape, building, boats, extras */
const PVAR=[{L:20,w:2.8,sh:'I',b:'home_A',boats:[['fboat',3.3,8,0]],ex:['net','stack']},
 {L:16,w:2.8,sh:'T',b:'tent',boats:[['fboat',3.3,5.6,0]],ex:['stack','rack']},
 {L:22,w:3.2,sh:'L',b:'lumbermill',boats:[['fboat',-4.4,13,0]],ex:['crane','stack']},
 {L:13,w:2.6,sh:'II',b:'towerB',boats:[['fboat',3.5,7.5,0]],ex:['rack']},
 {L:18,w:3.6,sh:'I',b:'home_B',boats:[['fboat',4.9,10,3.14]],ex:['crane','stack','net']},
 {L:14,w:2.8,sh:'T',b:'home_A',boats:[['fboat',3.3,4.4,0]],ex:['rack','net']},
 {L:17,w:2.8,sh:'U',b:'tent',boats:[['fboat',3.5,6.5,0]],ex:['stack']},
 {L:15,w:2.8,sh:'I',b:'home_B',boats:[['fboat',-3.3,9,3.14]],ex:['net','stack']}];
/* 자판기(왼쪽) + 쓰레기통(오른쪽에 붙여서 한 덩어리). 기획자 요청: 건물 옆에 붙이거나 잘 보이는 곳, 다니는 길은 막지 않게.
   센터는 가게 옆(앞줄을 맞춰서), 작은 항구는 부두 입구 옆. 둘레 1m 안에 다른 구조물·소품이 없고, 앞이 트이고, 평평한 땅인 첫 자리 */
const VEND_GAP=1.88;
function vendFits(x,z,p,skip){const ux0=x-DECO.vend.bx,ux1=x+VEND_GAP+DECO.recycle.bx,uz0=z-.55,uz1=z+.55,C=1.0;let lo=1e9,hi=-1e9;
 for(let u=0;u<=6;u++)for(let v=0;v<=3;v++){const px=ux0-.3+(ux1-ux0+.6)*u/6,pz=uz0-.3+(uz1-uz0+1.9)*v/3,h=hAt(px,pz);if(h<1.03||onDock(px,pz))return false;if(pz<=uz1+.3){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
 if(hi-lo>.18)return false;
 for(const q of structs){if(q===skip||Math.abs(q.x-x)>14||Math.abs(q.z-z)>14)continue;const d=sdef(q);if(d.pass)continue;const e=Math.max(d.bx,d.bz);if(q.x+e>ux0-C&&q.x-e<ux1+C&&q.z+e>uz0-C&&q.z-e<uz1+C+.6)return false}
 for(const P2 of PORTS)for(const [qx,qz,qr] of P2.pp||[])if(qx+qr>ux0-C&&qx-qr<ux1+C&&qz+qr>uz0-C&&qz-qr<uz1+C+.8)return false;
 for(const b of PBOATS)if(Math.abs(b.m.position.x-(ux0+ux1)/2)<6&&Math.abs(b.m.position.z-z)<6)return false;
 if(p&&!p.town){const w=(p.v&&p.v.w)||2.8;for(const [cx,cz] of [[ux0,uz0],[ux1,uz0],[ux0,uz1],[ux1,uz1],[(ux0+ux1)/2,z]]){const ex=cx-p.x,ez=cz-p.z,lx=ex*p.dz-ez*p.dx,lz=ex*p.dx+ez*p.dz;if(Math.abs(lx)<w/2+1.4&&lz>-16)return false}}   /* 부두에서 안쪽으로 가는 길 */
 return true}
function placeVend(p,W){const put2=(x,z)=>{addStruct({t:'vend',x,z,r:0,pi:p.i,hp:1e9});addStruct({t:'recycle',x:x+VEND_GAP,z,r:0,pi:p.i,hp:1e9});return true};
 if(p.town){const m=structs.find(q=>q.t==='market'&&dist(q.x,q.z,p.x,p.z)<30);if(m){const d=sdef(m),zf=m.z+d.bz-.55;
   for(const x of [m.x-d.bx-.35-VEND_GAP-DECO.recycle.bx,m.x+d.bx+.35+DECO.vend.bx])if(vendFits(x,zf,p,m))return put2(x,zf)}}
 else{const w=(p.v&&p.v.w)||2.8,C=[];for(const sd of [1,-1])for(let lz=-3;lz>=-12;lz-=1)for(let k=0;k<5;k++){const lx=sd*(w/2+3.3+k*.9);C.push([lx,lz,Math.abs(lz)*1.0+k*.9+(sd<0?.5:0)])}
  C.sort((a,b)=>a[2]-b[2]);for(const [lx,lz] of C){const [cx,cz]=W(lx,lz),x=cx-(VEND_GAP+DECO.recycle.bx-DECO.vend.bx)/2;if(vendFits(x,cz,p))return put2(x,cz)}}
 const ix=-p.dx,iz=-p.dz,sx=-iz,sz=ix;for(let fw=6;fw<28;fw+=1.5)for(let k=0;k<15;k++){const side=(k%2?1:-1)*Math.ceil(k/2)*1.6,x=p.x+ix*fw+sx*side-1.08,z=p.z+iz*fw+sz*side;if(vendFits(x,z,p))return put2(x,z)}
 console.warn('자판기 자리를 못 찾음',p.n);return false}
function buildPorts(){buildPortGeo();let sv=0;
 for(const p of PORTS){const G=p.g=new THREE.Group();scene.add(G);const sx=p.town?1:p.sx,W=(lx,lz)=>{lx*=sx;return[p.x+p.dz*lx+p.dx*lz,p.z-p.dx*lx+p.dz*lz]};
  const rect=(lx,lz,len,w,lr=0,quay=0)=>{const [x,z]=W(lx,lz),m=mesh(quay?quayGeo(len,w):pierGeo(len,w),MATT);m.position.set(x,0,z);m.rotation.y=p.r+lr;G.add(m);addDock(x,z,p.r+lr,w/2+.08,len/2+.08,quay?.8:.76)};
  const put=(g,lx,lz,rot=0,s=1,y=null)=>{const [x,z]=W(lx,lz),m=mesh(GEO[g],MATT);{const q=GEO[g];if(!q.boundingBox)q.computeBoundingBox();const b=q.boundingBox;(p.pp=p.pp||[]).push([x,z,Math.max(-b.min.x,b.max.x,-b.min.z,b.max.z)*s])}m.scale.setScalar(s);m.position.set(x,y===null?groundY(x,z)-.02:y,z);m.rotation.y=p.r+rot*sx;G.add(m);return m};
  const boat=(g,lx,lz,rot,y)=>{const m=put(g,lx,lz,rot,1,y);m.castShadow=false;PBOATS.push({m,y,ph:hash(lx*10|0,lz*10|0,p.i)*6,p});if(g==='fboat'){const [x,z]=W(lx,lz);addStruct({t:'ferry',x,z,r:0,pi:p.i,hp:1e9})}};   /* 통통배 = 항구 사이 배편(11차) */
  const lamp=(lx,lz,rot=0)=>{const m=put('plamp',lx,lz,rot),s=glow(0xffc46a,3.4,.65),a=p.r+rot*sx;s.position.set(m.position.x+Math.sin(a)*.5,m.position.y+2.75,m.position.z+Math.cos(a)*.5);s.visible=false;G.add(s);PLAMPS.push(s)};
  const S_=(t,lx,lz,rot=0,o)=>{const [x,z]=W(lx,lz);return addStruct(Object.assign({t,x,z,r:rot},o))};   /* buildings always face the camera (+z): the view cannot be turned */
  const BY={rowboat:.3,fboat:.5,sailboat:.48};
  if(p.town){/* harbour town, kept tight: quay on the shore, three piers, two short rows of buildings right behind it */
   rect(0,.8,36,5.2,Math.PI/2,1);rect(0,13,20,3.6);rect(0,22,11,3.2,Math.PI/2);rect(-11.5,8.4,12,2.8);rect(11.5,9,13,2.8);rect(14.7,14.3,7,2.6,Math.PI/2);
   boat('fboat',7.6,10,3.14,BY.fboat);   /* 배는 항구마다 딱 한 척(기획자 요청) */
   boat('pbuoy',-20,19,0,.05);boat('pbuoy',21,21,0,.05);boat('pbuoy',0,31,0,.05);
   for(const lx of[-15.5,-6,6,15.5])lamp(lx,2.6,Math.PI);lamp(-1.3,20,Math.PI/2);lamp(1.3,8,-Math.PI/2);lamp(-6.5,-14,0);lamp(6.5,-14,0);
   put('pcrane',12.4,13,Math.PI/2);put('pstack',-16.4,.4,.3);put('pstack',16.6,.2,-2);put('pstack',1.2,12,1.2,.8);put('pnet',-7,-3.6,.1).rotation.y=.15;put('prack',7.4,-3.8,-.1).rotation.y=-.12;put('psign',3.2,-3,0).rotation.y=0;
   for(const [lx,lz] of[[-1.4,5],[1.4,5],[-1.4,17],[1.4,17],[-10.4,13],[-12.6,13],[10.4,14],[4.6,22.9],[-4.6,22.9]])put('pboll',lx,lz);
   S_('market',0,-9,0);   /* 센터: 건물은 가게 하나만 (기획자 요청으로 술집·집·창고·대장간·우물·깃발 제거). 철조망과 소품은 look.js lkCenter */
   S_('fire',-3.4,-16.4,0,{hp:1e9});S_('stash',-6.2,-6.9,.2,{hp:1e9});   /* 센터 작업대는 뺐어요(14차: 작업대는 텐트 안에만) */S_('barrel',-8.4,-8.0);S_('crate',-10.4,-6.4,.4);S_('barrel',13.2,-8.2);
   {const [mx,mz]=W(0,-9);VIL.mx=mx+2.3;VIL.mz=mz+3.4}}
  else{const v=PVAR[p.vi%PVAR.length],L=p.L||v.L,w=v.w;sv++;p.v=v;rect(0,L/2-2.5,L,w);
   if(v.sh==='T')rect(0,L-3.9,9.5,2.8,Math.PI/2);if(v.sh==='L')rect(w/2+3.2,L-3.9,6.6,2.8,Math.PI/2);if(v.sh==='II'){rect(7,L/2-2.5,L,w);rect(3.5,-1.2,9.6,2.6,Math.PI/2)}if(v.sh==='U'){rect(7,L/2-2.5,L,w);rect(3.5,L-3.9,9.8,2.8,Math.PI/2)}
   v.boats.forEach(b=>boat(b[0],b[1],b[2],b[3],BY[b[0]]));boat('pbuoy',-6.5-(sv%3),L+3,0,.05);if(sv%2)boat('pbuoy',8+(sv%4),L+1,0,.05);
   lamp(-w/2-.7,-2.4,Math.PI/2);lamp(w/2-.35,L-4.6,-Math.PI/2);put('psign',w/2+1.6,-4.2,0).rotation.y=0;put('pboll',-(w/2-.3),4);put('pboll',w/2-.3,L*.55);put('pboll',-(w/2-.3),L-3.2);
   S_('fire',3.6,-8.2,0,{hp:1e9});   /* 항구 건물은 없앴어요(기획자 요청: 건물 대신 철조망과 소품) */S_('barrel',-1.6,-5.2);
   for(const e of v.ex){if(e==='net')put('pnet',5.4,-5.6,.5).rotation.y=.2;else if(e==='rack')put('prack',7,-7.6,-.35).rotation.y=-.2;else if(e==='stack')put('pstack',-4.6,-4.9,.4,.85);else if(e==='crane')put('pcrane',w/2-.55,L-8,Math.PI/2);else if(e==='raft'){const [x,z]=W(-6,10);const m=put('praft',-6,10,.3,1,.0);PBOATS.push({m,y:0,ph:2,p});addDock(x,z,p.r+.3*sx,1.9,1.9,.56)}}
   if(v.sh==='II'||v.sh==='U'){lamp(7+w/2-.35,L-4.6,-Math.PI/2);put('pboll',7-(w/2-.3),5)}}
  placeVend(p,W);placeFishBuyer(p)}}
function updPorts(px,pz){const dk=dark()>.3;for(const p of PORTS)if(p.g)p.g.visible=Math.abs(p.x-px)<170&&Math.abs(p.z-pz)<170;
 for(const b of PBOATS){if(!b.p.g.visible)continue;b.m.position.y=b.y+Math.sin(gt*1.25+b.ph)*.05;b.m.rotation.z=Math.sin(gt*1.05+b.ph)*.045;b.m.rotation.x=Math.sin(gt*.8+b.ph*1.7)*.02}
 if(PLAMPS.length&&PLAMPS[0].visible!==dk)for(const s of PLAMPS)s.visible=dk}
function drawPortLabels(c,k){for(const p of PORTS){const d=dist(p.x,p.z,P.x,P.z);if(d>(p.town?60:34))continue;const s=scr(p.x-p.dx*3,groundY(p.x,p.z)+(p.town?6.5:4.2),p.z-p.dz*3);if(!s[2])continue;uiPill(c,'⚓ '+p.n,s[0],s[1],(p.town?14.5:12.5)*k,UIC.nav,'#fff','rgba(255,255,255,.18)')}}
/* ===== 48차(규칙, 기획자 11-21 14:18): 항구마다 생선 상인 =====
   기획자: '항구마다 랜덤 자판기와 쓰레기통 옆에 정식으로 파는 상인을 하나씩. 모든 항구에서 일반·희귀 물고기를 제값에 팔아 주는 상인'.
   판매대(DECO.fbuy, 모양은 낚시섬 판매대 plStallGeo) + 그 뒤에 선 사람(DECO.fbuy_npc 보이지 않는 막이, 사람 모양은 ui.js 48차).
   자리: 쓰레기통 오른쪽 → 자판기 왼쪽(앞줄을 맞춤, 사이 1.25m) → 그 둘레에서 평평하고 비어 있는 곳. 정면은 +z. */
Object.assign(DECO,{fbuy:{g:'fbuy_stall',s:1,bx:1.31,bz:.45,hp:1e9},fbuy_npc:{g:'nil',s:1,bx:.36,bz:.36,hp:1e9}});
function fbFits(x,z,p){const x0=x-1.31,x1=x+1.31,z0=z-1.65,z1=z+.45,C=.9;let lo=1e9,hi=-1e9;
 for(let u=0;u<=6;u++)for(let v=0;v<=4;v++){const px=x0-.3+(x1-x0+.6)*u/6,pz=z0-.3+(z1-z0+2.2)*v/4,h=hAt(px,pz);if(h<1.03||onDock(px,pz))return false;if(pz<=z1+.3){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
 if(hi-lo>.18)return false;
 for(const q of structs){if(Math.abs(q.x-x)>14||Math.abs(q.z-z)>14)continue;const d=sdef(q);if(d.pass)continue;const e=Math.max(d.bx,d.bz);if(q.x+e>x0-C&&q.x-e<x1+C&&q.z+e>z0-C&&q.z-e<z1+C+1.2)return false}
 for(const P2 of PORTS)for(const [qx,qz,qr] of P2.pp||[])if(qx+qr>x0-C&&qx-qr<x1+C&&qz+qr>z0-C&&qz-qr<z1+C+1.2)return false;
 for(const b of PBOATS)if(Math.abs(b.m.position.x-x)<6.5&&Math.abs(b.m.position.z-z)<6.5)return false;
 if(p&&!p.town){const w=(p.v&&p.v.w)||2.8;for(const [cx,cz] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],[x,z]]){const ex=cx-p.x,ez=cz-p.z,lx=ex*p.dz-ez*p.dx,lz=ex*p.dx+ez*p.dz;if(Math.abs(lx)<w/2+1.4&&lz>-16)return false}}
 return true}
function placeFishBuyer(p){if(!GEO.fbuy_stall)GEO.fbuy_stall=typeof plStallGeo==='function'?plStallGeo():mg([pt(box(2.5,.9,.78),0xb9773f,[0,.45,0]),pt(box(2.62,.08,.9),0xf0d9a8,[0,.94,0])]);
 const v=structs.find(q=>q.t==='vend'&&q.pi===p.i),rc=structs.find(q=>q.t==='recycle'&&q.pi===p.i),C=[];
 if(rc)C.push([rc.x+DECO.recycle.bx+1.25+1.31,rc.z+DECO.recycle.bz-.45]);if(v)C.push([v.x-DECO.vend.bx-1.25-1.31,v.z+DECO.vend.bz-.45]);
 const o=v||p;for(let r=3;r<=14;r+=1)for(let k=0;k<16;k++){const a=k/16*Math.PI*2;C.push([o.x+Math.cos(a)*r,o.z+Math.sin(a)*r])}
 for(const [x,z] of C)if(fbFits(x,z,p)){addStruct({t:'fbuy',x,z,r:0,pi:p.i,hp:1e9});addStruct({t:'fbuy_npc',x,z:z-1.25,r:0,pi:p.i,hp:1e9});return true}
 console.warn('생선 상인 자리를 못 찾음',p.n);return false}
