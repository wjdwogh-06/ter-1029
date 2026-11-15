'use strict';
/* ===== ports: piers, quays, boats, harbour props. Each port is laid out in its own frame:
   origin = shoreline point, +lz = out to sea, +lx = right when facing the sea ===== */
const PBOATS=[],PLAMPS=[],PGEO={};
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
 GEO.pboll=mg([pt(cyl(.15,.19,.5,7),WD2,[0,.25,0]),pt(cyl(.19,.19,.07,7),0x4b3520,[0,.5,0]),pt(new THREE.TorusGeometry(.24,.06,5,10),ROPE,[0,.14,0],[Math.PI/2,0,0])]);
 {const p=[pt(cyl(.07,.08,2.3,5),WD2,[-1.2,1.15,0]),pt(cyl(.07,.08,2.3,5),WD2,[1.2,1.15,0]),pt(cyl(.05,.05,2.6,5),WD,[0,2.2,0],[0,0,Math.PI/2])];for(let i=0;i<7;i++){p.push(pt(box(.02,2.6,.02),ROPE,[-1.05+i*.35,1.15,0],[0,0,.55]),pt(box(.02,2.6,.02),ROPE,[-1.05+i*.35,1.15,.01],[0,0,-.55]))}for(let i=0;i<5;i++)p.push(pt(ico(.08),i%2?0xe8622c:0xf2efe6,[-1+i*.5,2.2,0]));GEO.pnet=mg(p)}
 {const p=[pt(cyl(.06,.07,2.0,5),WD2,[-1,1,0]),pt(cyl(.06,.07,2.0,5),WD2,[1,1,0]),pt(cyl(.04,.04,2.3,5),WD,[0,1.9,0],[0,0,Math.PI/2]),pt(cyl(.04,.04,2.3,5),WD,[0,1.3,0],[0,0,Math.PI/2])];for(let i=0;i<5;i++)p.push(pt(GEO.f_cod,null,[-.8+i*.4,1.55,0],[Math.PI/2,0,Math.PI/2],[.5,.5,.5]),pt(GEO.f_herring,null,[-.8+i*.4,1.0,0],[Math.PI/2,0,Math.PI/2],[.5,.5,.5]));GEO.prack=mg(p)}
 GEO.pcrane=mg([pt(box(1,.3,1),WD2,[0,.15,0]),pt(cyl(.13,.17,3.6,7),WD,[0,2.1,0]),pt(box(.14,.16,3.2),WD,[0,3.6,1.2],[-.32,0,0]),pt(box(.1,.1,1.7),WD2,[0,2.9,.6],[.75,0,0]),pt(cyl(.016,.016,1.7,4),0x1c1c1c,[0,3.2,2.6]),pt(box(.62,.56,.62),0xa67848,[0,2.05,2.6]),pt(box(.66,.06,.66),WD2,[0,2.33,2.6]),pt(box(.66,.06,.66),WD2,[0,1.8,2.6]),pt(cyl(.2,.2,.3,8),IRON,[0,1.0,-.3],[0,0,Math.PI/2])]);
 GEO.pbuoy=mg([pt(new THREE.SphereGeometry(.34,10,8),0xd9382c,[0,.1,0]),pt(cyl(.35,.35,.12,10),0xf2efe6,[0,.1,0]),pt(cyl(.03,.03,.8,5),IRON,[0,.6,0]),pt(ico(.09),0xffe14a,[0,1.02,0])]);
 GEO.psign=mg([pt(cyl(.07,.08,2.5,5),WD2,[0,1.25,0]),pt(box(1.7,.55,.09),WD3,[0,2.2,0]),pt(box(1.8,.06,.12),WD2,[0,2.5,0]),pt(box(1.8,.06,.12),WD2,[0,1.9,0]),pt(new THREE.TorusGeometry(.11,.03,5,10),0x2f5d8a,[-.6,2.32,.06]),pt(box(.04,.3,.03),0x2f5d8a,[-.6,2.15,.06]),pt(box(.24,.04,.03),0x2f5d8a,[-.6,2.04,.06])]);
 GEO.praft=mg([...[0,1,2,3,4,5].map(i=>pt(cyl(.3,.3,3.8,7),i%2?WD:WD3,[-1.5+i*.6,.25,0],[Math.PI/2,0,0])),pt(box(3.9,.1,.3),WD2,[0,.52,1.3]),pt(box(3.9,.1,.3),WD2,[0,.52,-1.3]),pt(cyl(.3,.3,.5,8),0x2f5d8a,[1.2,.8,1.0]),pt(box(.5,.4,.5),0xa67848,[-1.1,.75,-.8])]);
 GEO.pstack=mg([pt(GEO.crate_A_big,null,[0,0,0],[0,.2,0],[4.6,4.6,4.6]),pt(GEO.crate_B_small,null,[1.15,0,.15],[0,.7,0],[4.6,4.6,4.6]),pt(GEO.crate_A_small,null,[.1,1.05,.05],[0,-.3,0],[4.6,4.6,4.6]),pt(GEO.barrel,null,[-1.05,0,.35],0,[4.6,4.6,4.6]),pt(GEO.sack,null,[.6,0,1.0],[0,1,0],[6,6,6])])}
/* eight small-port recipes: pier shape, building, boats, extras */
const PVAR=[{L:20,w:2.8,sh:'I',b:'home_A',boats:[['rowboat',2.75,8,.08]],ex:['net','stack']},
 {L:16,w:2.8,sh:'T',b:'tent',boats:[['rowboat',-2.75,6,3.2],['rowboat',2.8,9.5,-.06]],ex:['stack','rack']},
 {L:22,w:3.2,sh:'L',b:'lumbermill',boats:[['fboat',-4.4,13,0]],ex:['crane','stack']},
 {L:13,w:2.6,sh:'II',b:'towerB',boats:[['rowboat',3.5,6,0],['rowboat',3.5,10,3.14]],ex:['rack']},
 {L:18,w:3.6,sh:'I',b:'home_B',boats:[['fboat',4.9,10,3.14]],ex:['crane','stack','net']},
 {L:14,w:2.8,sh:'T',b:'home_A',boats:[['rowboat',2.75,5,0]],ex:['rack','net']},
 {L:17,w:2.8,sh:'U',b:'tent',boats:[['rowboat',3.5,7.5,1.57],['rowboat',3.5,11,-1.57]],ex:['stack']},
 {L:15,w:2.8,sh:'I',b:'home_B',boats:[['rowboat',-2.75,9,3.1]],ex:['raft','net','stack']}];
function buildPorts(){buildPortGeo();let sv=0;
 for(const p of PORTS){const G=p.g=new THREE.Group();scene.add(G);const sx=p.town?1:p.sx,W=(lx,lz)=>{lx*=sx;return[p.x+p.dz*lx+p.dx*lz,p.z-p.dx*lx+p.dz*lz]};
  const rect=(lx,lz,len,w,lr=0,quay=0)=>{const [x,z]=W(lx,lz),m=mesh(quay?quayGeo(len,w):pierGeo(len,w),MATT);m.position.set(x,0,z);m.rotation.y=p.r+lr;G.add(m);addDock(x,z,p.r+lr,w/2+.08,len/2+.08,quay?.8:.76)};
  const put=(g,lx,lz,rot=0,s=1,y=null)=>{const [x,z]=W(lx,lz),m=mesh(GEO[g],MATT);m.scale.setScalar(s);m.position.set(x,y===null?groundY(x,z)-.02:y,z);m.rotation.y=p.r+rot*sx;G.add(m);return m};
  const boat=(g,lx,lz,rot,y)=>{const m=put(g,lx,lz,rot,1,y);m.castShadow=false;PBOATS.push({m,y,ph:hash(lx*10|0,lz*10|0,p.i)*6,p})};
  const lamp=(lx,lz,rot=0)=>{const m=put('plamp',lx,lz,rot),s=glow(0xffc46a,3.4,.65),a=p.r+rot*sx;s.position.set(m.position.x+Math.sin(a)*.5,m.position.y+2.75,m.position.z+Math.cos(a)*.5);s.visible=false;G.add(s);PLAMPS.push(s)};
  const S_=(t,lx,lz,rot=0,o)=>{const [x,z]=W(lx,lz);return addStruct(Object.assign({t,x,z,r:rot},o))};   /* buildings always face the camera (+z): the view cannot be turned */
  const BY={rowboat:.3,fboat:.5,sailboat:.48};
  if(p.town){/* harbour town, kept tight: quay on the shore, three piers, two short rows of buildings right behind it */
   rect(0,.8,36,5.2,Math.PI/2,1);rect(0,13,20,3.6);rect(0,22,11,3.2,Math.PI/2);rect(-11.5,8.4,12,2.8);rect(11.5,9,13,2.8);rect(14.7,14.3,7,2.6,Math.PI/2);
   boat('sailboat',5,17.5,3.14,BY.sailboat);boat('fboat',-14.9,9,0,BY.fboat);boat('fboat',7.6,10,3.14,BY.fboat);boat('rowboat',-8.2,7,.1,BY.rowboat);boat('rowboat',-8.2,11.2,3.2,BY.rowboat);boat('rowboat',-3.4,7,3.14,BY.rowboat);boat('rowboat',15,11,1.57,BY.rowboat);
   boat('pbuoy',-20,19,0,.05);boat('pbuoy',21,21,0,.05);boat('pbuoy',0,31,0,.05);
   for(const lx of[-15.5,-6,6,15.5])lamp(lx,2.6,Math.PI);lamp(-1.3,20,Math.PI/2);lamp(1.3,8,-Math.PI/2);lamp(-6.5,-14,0);lamp(6.5,-14,0);
   put('pcrane',12.4,13,Math.PI/2);put('pstack',-16.4,.4,.3);put('pstack',16.6,.2,-2);put('pstack',1.2,12,1.2,.8);put('pnet',-7,-3.6,.1).rotation.y=.15;put('prack',7.4,-3.8,-.1).rotation.y=-.12;put('psign',3.2,-3,0).rotation.y=0;
   for(const [lx,lz] of[[-1.4,5],[1.4,5],[-1.4,17],[1.4,17],[-10.4,13],[-12.6,13],[10.4,14],[4.6,22.9],[-4.6,22.9]])put('pboll',lx,lz);
   S_('market',0,-9,0);   /* 센터: 건물은 가게 하나만 (기획자 요청으로 술집·집·창고·대장간·우물·깃발 제거). 철조망과 소품은 look.js lkCenter */
   S_('fire',-5.6,-14.2,0,{hp:1e9});S_('bench',5.2,-6.9,-.2,{hp:1e9});S_('stash',-6.2,-6.9,.2,{hp:1e9});S_('barrel',-8.2,-7);S_('crate',-9.4,-6.6,.4);S_('barrel',14,-6.8);
   {const [mx,mz]=W(0,-9);VIL.mx=mx+2.3;VIL.mz=mz+3.4}}
  else{const v=PVAR[p.vi%PVAR.length],L=p.L||v.L,w=v.w;sv++;p.v=v;rect(0,L/2-2.5,L,w);
   if(v.sh==='T')rect(0,L-3.9,9.5,2.8,Math.PI/2);if(v.sh==='L')rect(w/2+3.2,L-3.9,6.6,2.8,Math.PI/2);if(v.sh==='II'){rect(7,L/2-2.5,L,w);rect(3.5,-1.2,9.6,2.6,Math.PI/2)}if(v.sh==='U'){rect(7,L/2-2.5,L,w);rect(3.5,L-3.9,9.8,2.8,Math.PI/2)}
   v.boats.forEach(b=>boat(b[0],b[1],b[2],b[3],BY[b[0]]));boat('pbuoy',-6.5-(sv%3),L+3,0,.05);if(sv%2)boat('pbuoy',8+(sv%4),L+1,0,.05);
   lamp(-w/2-.7,-2.4,Math.PI/2);lamp(w/2-.35,L-4.6,-Math.PI/2);put('psign',w/2+1.6,-4.2,0).rotation.y=0;put('pboll',-(w/2-.3),4);put('pboll',w/2-.3,L*.55);put('pboll',-(w/2-.3),L-3.2);
   const far=v.b==='lumbermill'?-11:v.b==='towerB'?-8.5:-9;S_(v.b,-6.2,far,.15+(sv%3)*.12);S_('fire',3.6,-8.2,0,{hp:1e9});S_('barrel',-1.6,-5.2);
   for(const e of v.ex){if(e==='net')put('pnet',5.4,-5.6,.5).rotation.y=.2;else if(e==='rack')put('prack',7,-7.6,-.35).rotation.y=-.2;else if(e==='stack')put('pstack',-3.2,-3.6,.4,.85);else if(e==='crane')put('pcrane',w/2-.55,L-8,Math.PI/2);else if(e==='raft'){const [x,z]=W(-6,10);const m=put('praft',-6,10,.3,1,.0);PBOATS.push({m,y:0,ph:2,p});addDock(x,z,p.r+.3*sx,1.9,1.9,.56)}}
   if(v.sh==='II'||v.sh==='U'){lamp(7+w/2-.35,L-4.6,-Math.PI/2);put('pboll',7-(w/2-.3),5)}}}}
function updPorts(px,pz){const dk=dark()>.3;for(const p of PORTS)if(p.g)p.g.visible=Math.abs(p.x-px)<170&&Math.abs(p.z-pz)<170;
 for(const b of PBOATS){if(!b.p.g.visible)continue;b.m.position.y=b.y+Math.sin(gt*1.25+b.ph)*.05;b.m.rotation.z=Math.sin(gt*1.05+b.ph)*.045;b.m.rotation.x=Math.sin(gt*.8+b.ph*1.7)*.02}
 if(PLAMPS.length&&PLAMPS[0].visible!==dk)for(const s of PLAMPS)s.visible=dk}
function drawPortLabels(c,k){for(const p of PORTS){const d=dist(p.x,p.z,P.x,P.z);if(d>(p.town?60:34))continue;const s=scr(p.x-p.dx*3,groundY(p.x,p.z)+(p.town?6.5:4.2),p.z-p.dz*3);if(!s[2])continue;uiPill(c,'⚓ '+p.n,s[0],s[1],(p.town?14.5:12.5)*k,UIC.nav,'#fff','rgba(255,255,255,.18)')}}
