'use strict';
/* ===== water: wading, swimming, hot springs, fishing ===== */
const SHALLOW=.08,DEEP=.62;
const WTR={st:'land',depth:0,ph:0,mv:0,splT:0,ripT:0,edgeT:0,coldT:0,toldSwim:0,toldWade:0};
let fishing=null,bobM=null,lineM=null,catchM=null,catchT=0;const ripples=[];
const waterDepth=(x,z)=>onDock(x,z)?0:-hAt(x,z);
function inSpring(x,z){for(const s of warmsrc)if(s.t==='spring'&&dist(s.x,s.z,x,z)<3.7)return s;return null}
const surfY=(x,z)=>Math.max(groundY(x,z),.02);
/* ---- geometry: rod, bobber, fish ---- */
function fishGeo(f,cooked){const L=f.len,H=f.h,Wd=f.w2,back=cooked?new THREE.Color(f.back).lerp(new THREE.Color(0x9a5a2c),.7).getHex():f.back,belly=cooked?new THREE.Color(f.belly).lerp(new THREE.Color(0xd08a45),.75).getHex():f.belly,fin=cooked?0x6b3d1e:new THREE.Color(f.back).multiplyScalar(.75).getHex();
 const sph=()=>new THREE.SphereGeometry(.5,14,10),p=[pt(sph(),back,[0,0,0],0,[Wd,H,L]),pt(sph(),belly,[0,-H*.14,L*.03],0,[Wd*.93,H*.74,L*.88]),
  pt(cone(H*.62,L*.36,4),fin,[0,0,-L*.6],[Math.PI/2,0,0],[.16,1,1]),pt(cone(H*.36,H*.62,4),fin,[0,H*.5,-L*.04],[-.55,0,0],[.12,1,1.6]),pt(cone(H*.2,H*.4,4),fin,[0,-H*.42,-L*.18],[Math.PI+.6,0,0],[.12,1,1.4])];
 for(const s of[1,-1]){p.push(pt(ico(H*.13,1),0xf4f4f0,[s*Wd*.4,H*.1,L*.3]),pt(ico(H*.08,1),0x14161a,[s*Wd*.46,H*.11,L*.32]),pt(cone(H*.22,H*.36,3),fin,[s*Wd*.48,-H*.12,L*.12],[Math.PI/2+.4,0,s*.6],[.15,1,1]))}
 if(f.legend)p.push(pt(cone(H*.5,H*.8,4),fin,[0,H*.55,L*.08],[-.35,0,0],[.12,1,1.5]));
 if(f.id==='f_salmon'&&!cooked)for(let i=0;i<9;i++)p.push(pt(ico(H*.05),0x2c333a,[(i%2?1:-1)*Wd*.47,H*(.16+(i%3)*.08),L*(-.25+i*.06)]));
 if(cooked){p.push(pt(cyl(.025,.025,L*1.6,6),0xc9a06a,[0,0,L*.05],[Math.PI/2,0,0]));for(let i=-1;i<=1;i++)p.push(pt(box(Wd*1.02,H*.05,L*.06),0x3a2412,[0,H*.12,i*L*.18],[0,0,0]))}
 return mg(p)}
/* 새 물고기 생김새(f.k). 앞이 +z. fn(): d 방향으로 뻗은 납작한 지느러미 */
const _fU=new THREE.Vector3(0,1,0),_fD=new THREE.Vector3(),_fQ=new THREE.Quaternion(),_fE=new THREE.Euler();
function fishGeoK(f,cooked){const L=f.len,H=f.h,Wd=f.w2,K=f.k,ck=(c,t)=>cooked?new THREE.Color(c).lerp(new THREE.Color(t),.72).getHex():c,back=ck(f.back,0x9a5a2c),belly=ck(f.belly,0xd08a45),fin=cooked?0x6b3d1e:new THREE.Color(f.back).multiplyScalar(.75).getHex(),sph=(a=14,b=10)=>new THREE.SphereGeometry(.5,a,b),p=[];
 const fn=(len,r,root,d,col=fin,fl=.14,seg=4)=>{_fD.set(d[0],d[1],d[2]).normalize();_fQ.setFromUnitVectors(_fU,_fD);_fE.setFromQuaternion(_fQ);p.push(pt(cone(r,len,seg),col,[root[0]+_fD.x*len/2,root[1]+_fD.y*len/2,root[2]+_fD.z*len/2],[_fE.x,_fE.y,_fE.z],[fl,1,1]))};
 const eyes=(z,y,r,xo=.42)=>{for(const s of[1,-1])p.push(pt(ico(r,1),0xf4f4f0,[s*Wd*xo,y,z]),pt(ico(r*.6,1),0x14161a,[s*(Wd*xo+r*.45),y,z+r*.1]))};
 const dots=(n,col,r,y0,y1,z0,z1,sd)=>{if(cooked)return;for(let i=0;i<n;i++){const u=fhs(i,sd),v=fhs(i,sd+1),zz=lerp(z0,z1,u),yy=lerp(y0,y1,v),ex=Math.sqrt(Math.max(0,1-(2*yy/H)**2-(2*zz/L)**2))*Wd*.5;for(const sg of[1,-1])p.push(pt(ico(r),col,[sg*ex*.98,yy,zz]))}};
 const skewer=()=>{if(!cooked)return;p.push(pt(cyl(.025,.025,L*1.6,6),0xc9a06a,[0,0,L*.05],[Math.PI/2,0,0]));for(let i=-1;i<=1;i++)p.push(pt(box(Wd*1.02,H*.05,L*.06),0x3a2412,[0,H*.12,i*L*.18]))};
 if(K==='jelly'){
  if(cooked){p.push(pt(cyl(.42,.36,.05,18),0xf4f1ea,[0,0,0]),pt(cyl(.36,.36,.012,18),0xe2ddd2,[0,.027,0]));for(let i=0;i<11;i++)p.push(pt(box(.46,.022,.04),i%3?0xd9b27a:0xe6c591,[(fhs(i,1)-.5)*.16,.045+fhs(i,2)*.05,(fhs(i,3)-.5)*.3],[0,fhs(i,4)*3.1,(fhs(i,5)-.5)*.3]));for(let i=0;i<3;i++)p.push(pt(ico(.035),0x7cc35a,[(fhs(i,6)-.5)*.3,.1,(fhs(i,7)-.5)*.2]));return mg(p)}
  const R=Wd*.5,bh=H*.62;p.push(pt(new THREE.SphereGeometry(.5,16,10,0,Math.PI*2,0,Math.PI/2),back,[0,0,0],0,[R*2,bh*2,R*2]),pt(new THREE.TorusGeometry(R*.96,.028,5,18),belly,[0,.005,0],[Math.PI/2,0,0]),pt(cyl(R*.94,R*.7,.05,16),0xf7c3e6,[0,-.02,0]));
  for(let i=0;i<4;i++){const an=i/4*Math.PI*2+.4;p.push(pt(ico(R*.16,1),0xfff0f8,[Math.cos(an)*R*.45,bh*.78,Math.sin(an)*R*.45],0,[1,.35,1]))}
  for(let i=0;i<4;i++){const an=i/4*Math.PI*2+.8;let x=Math.cos(an)*R*.18,z=Math.sin(an)*R*.18;for(let j=0;j<3;j++){const l=.17,nx=x+Math.cos(an+j)*.04,nz=z+Math.sin(an+j)*.04;p.push(pt(cyl(.035-j*.008,.028-j*.008,l,6),0xf9d0ec,[(x+nx)/2,-.06-l*j-l/2,(z+nz)/2],[Math.sin(an+j)*.25,0,Math.cos(an+j)*.25]));x=nx;z=nz}}
  for(let i=0;i<8;i++){const an=i/8*Math.PI*2;p.push(pt(cyl(.008,.006,.5,4),0xf5b6e0,[Math.cos(an)*R*.86,-.27,Math.sin(an)*R*.86],[Math.sin(an)*.18,0,-Math.cos(an)*.18]))}
  return mg(p)}
 p.push(pt(sph(),back,[0,0,0],0,[Wd,H,L]),pt(sph(),belly,[0,-H*.14,L*.03],0,[Wd*.93,H*.74,L*.88]));
 if(K==='trout'||K==='rainbow'){p.push(pt(cone(H*.62,L*.34,4),fin,[0,0,-L*.6],[Math.PI/2,0,0],[.16,1,1]));fn(H*.5,L*.11,[0,H*.38,L*.02],[0,1,-.55]);fn(H*.18,L*.04,[0,H*.36,-L*.3],[0,1,-.6]);fn(H*.3,L*.06,[0,-H*.38,-L*.2],[0,-1,-.7]);for(const sg of[1,-1])fn(H*.4,L*.06,[sg*Wd*.4,-H*.2,L*.2],[sg,-.4,-.8]);
  if(K==='rainbow'&&!cooked)p.push(pt(sph(),0xf2557f,[0,H*.04,L*.02],0,[Wd*1.14,H*.34,L*.84]));dots(K==='rainbow'?16:20,K==='rainbow'?0x2c3a2c:0x2a2a22,H*.045,-H*.05,H*.38,-L*.35,L*.3,K==='rainbow'?31:41);eyes(L*.32,H*.08,H*.13)}
 else if(K==='anch'){fn(H*.9,H*.3,[0,0,-L*.42],[0,.7,-.8]);fn(H*.9,H*.3,[0,0,-L*.42],[0,-.7,-.8]);fn(H*.6,L*.1,[0,H*.38,-L*.02],[0,1,-.5]);if(!cooked)p.push(pt(sph(),0xd5dee8,[0,H*.04,0],0,[Wd*1.09,H*.24,L*.82]));eyes(L*.3,H*.06,H*.2)}
 else if(K==='flying'){fn(H*1.3,H*.26,[0,0,-L*.42],[0,.62,-.8]);fn(H*1.7,H*.28,[0,0,-L*.42],[0,-.7,-.75]);fn(H*.5,L*.08,[0,H*.4,-L*.15],[0,1,-.5]);
  for(const sg of[1,-1]){fn(L*.8,L*.17,[sg*Wd*.4,H*.1,L*.15],[sg,.12,-.5],cooked?fin:0x8fbde8,.1,5);fn(L*.38,L*.09,[sg*Wd*.35,-H*.25,-L*.12],[sg,-.1,-.8],cooked?fin:0x8fbde8,.1,4)}eyes(L*.3,H*.08,H*.2)}
 else if(K==='tuna'||K==='sword'){fn(H*1.15,H*.2,[0,0,-L*.45],[0,.78,-.62]);fn(H*1.15,H*.2,[0,0,-L*.45],[0,-.78,-.62]);p.push(pt(cyl(H*.12,H*.16,L*.14,6),back,[0,0,-L*.44],[Math.PI/2,0,0]));
  for(const sg of[1,-1])fn(K==='tuna'?L*.36:L*.24,H*.13,[sg*Wd*.44,-H*.05,L*.18],[sg,-.25,-.75]);
  if(K==='tuna'){fn(H*.55,L*.09,[0,H*.38,L*.08],[0,1,-.6]);fn(H*.5,L*.07,[0,H*.36,-L*.16],[0,1,-.8]);fn(H*.45,L*.07,[0,-H*.36,-L*.16],[0,-1,-.8]);for(let i=0;i<5;i++)for(const sg of[1,-1])p.push(pt(box(.02,H*.12,L*.035),cooked?fin:0xf2c230,[0,sg*H*(.3-i*.035),-L*(.24+i*.045)],[sg*.5,0,0]));if(!cooked)p.push(pt(sph(),0x9aa7c2,[0,0,0],0,[Wd*1.02,H*.12,L*.84]))}
  else{fn(L*.72,H*.09,[0,H*.04,L*.46],[0,.02,1],cooked?fin:0x30465f,1,6);fn(H*1.25,L*.15,[0,H*.38,L*.2],[0,1,-.28],fin,.1,4);fn(H*.35,L*.05,[0,-H*.36,-L*.2],[0,-1,-.7])}
  eyes(L*.32,H*.1,H*.12)}
 else if(K==='hammer'){p.push(pt(box(Wd*3.6,H*.2,L*.15),back,[0,H*.04,L*.47]),pt(box(Wd*3.4,H*.12,L*.1),belly,[0,-H*.04,L*.47]));for(const sg of[1,-1])p.push(pt(ico(H*.09,1),0xf4f4f0,[sg*Wd*1.8,H*.06,L*.47]),pt(ico(H*.055,1),0x14161a,[sg*Wd*1.84,H*.08,L*.48]));
  fn(H*1.3,L*.13,[0,H*.38,L*.04],[0,1,-.35],fin,.12);fn(H*.4,L*.05,[0,H*.3,-L*.3],[0,1,-.6]);fn(L*.42,H*.2,[0,H*.05,-L*.46],[0,.5,-.87]);fn(L*.2,H*.16,[0,-H*.05,-L*.46],[0,-.62,-.78]);
  for(const sg of[1,-1]){fn(L*.3,L*.08,[sg*Wd*.42,-H*.22,L*.18],[sg,-.35,-.45],fin,.12);for(let i=0;i<4;i++)if(!cooked)p.push(pt(box(.01,H*.3,.012),0x56636d,[sg*Wd*.47,H*.02,L*(.3-i*.03)]))}}
 skewer();return mg(p)}
function buildWaterGeo(){const T=-.62,rl=2.3;const A=(d,o=0)=>[0,Math.sin(-T)*d+o,Math.cos(-T)*d+.12],X=Math.PI/2+T;   /* modern carbon spinning rod: EVA grips, reel seat, fixed-spool reel */
 GEO.rod=mg([pt(cyl(.05,.054,.34,8),0x1f2226,[0,0,-.12],[X,0,0]),pt(cyl(.058,.058,.04,8),0x30343a,[0,Math.sin(-T)*-.3,Math.cos(-T)*-.3+.0],[X,0,0]),pt(cyl(.036,.036,.16,8),0xb8bec6,A(-.02),[X,0,0]),pt(cyl(.042,.046,.2,8),0x1f2226,A(.16),[X,0,0]),pt(cyl(.03,.034,.03,8),0xe8742a,A(.27),[X,0,0]),pt(cyl(.012,.03,rl,6),0x2b2f36,A(rl/2+.28),[X,0,0]),
  pt(cyl(.016,.016,.11,5),0x4a4f57,[0,-.06,.06]),pt(cyl(.058,.058,.12,10),0x3a3f46,[0,-.14,.1],[X,0,0]),pt(cyl(.068,.06,.08,10),0xd8dde2,[0,-.12,.2],[X,0,0]),pt(cyl(.07,.07,.015,10),0xe8742a,[0,-.11,.245],[X,0,0]),pt(box(.1,.012,.012),0x9aa3ad,[.06,-.15,.1]),pt(box(.012,.07,.012),0x9aa3ad,[.11,-.18,.1]),pt(box(.04,.025,.025),0x1f2226,[.11,-.22,.1]),
  ...[[.62,.035],[1.05,.026],[1.5,.02],[1.95,.016],[2.3,.014]].map(([d,r])=>pt(new THREE.TorusGeometry(r,.005,3,8),0xc9ced4,A(d+.28,-r-.012),[X,0,0]))]);
 GEO.rod.userData.tip=A(rl+.28);
 GEO.bobber=mg([pt(new THREE.SphereGeometry(.13,10,8,0,6.3,Math.PI/2,Math.PI/2),0xf4f1ea),pt(new THREE.SphereGeometry(.13,10,8,0,6.3,0,Math.PI/2),0xe0443a),pt(cyl(.012,.012,.16,5),0xf4f1ea,[0,.18,0])]);
 FISH.forEach(f=>{const G=f.k?fishGeoK:fishGeo;GEO[f.id]=G(f,0);GEO['c'+f.id]=G(f,1)})}
function initWater(){initSchools();for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.42,.52,28),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;m.visible=false;scene.add(m);ripples.push({m,t:9,l:1})}
 bobM=mesh(GEO.bobber,MATT);bobM.visible=false;scene.add(bobM);
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(16*3),3));lineM=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xf2f2f2,transparent:true,opacity:.9}));lineM.frustumCulled=false;lineM.visible=false;scene.add(lineM)}
function ripple(x,z,s=1,l=1.1){const r=ripples.find(r=>r.t>=r.l);if(!r)return;r.x=x;r.z=z;r.s=s;r.t=0;r.l=l;r.m.visible=true}
function splash(x,z,n){puff(x,.15,z,0xe6f3ff,n,.9);ripple(x,z,1.4,1)}
/* ---- state per frame ---- */
function updWaterState(dt){if(DEV.on){if(WTR.st!=='land'){WTR.st='land';hudDirty=true}WTR.depth=0;return'land'}const d=waterDepth(P.x,P.z),prev=WTR.st;WTR.depth=d;let st;if(d>(prev==='swim'?DEEP-.1:DEEP))st='swim';else if(d>SHALLOW)st='wade';else st=inSpring(P.x,P.z)?'spring':'land';
 if(st!==prev){if(st==='swim'){splash(P.x,P.z,10);sfx(170,.35,'sine',.07,.45);if(fishing)endFish();if(!WTR.toldSwim){WTR.toldWade=WTR.toldSwim=1;toast('🌊 깊은 물이에요! 헤엄쳐요. 오래 있으면 몸이 식어요')}}
  else if(st==='wade'&&prev!=='swim'){splash(P.x,P.z,4);sfx(320,.12,'sine',.04,.5);if(!WTR.toldWade){WTR.toldWade=1;toast('얕은 물이라 걸음이 느려져요')}}else if(prev==='swim')splash(P.x,P.z,5);
  if(st==='spring')toast('♨ 온천이에요. 가만히 있으면 몸을 담가요');hudDirty=true}
 WTR.st=st;if(st==='swim'){WTR.edgeT-=dt;if((P.x<7||P.z<7||P.x>WS-7||P.z>WS-7)&&WTR.edgeT<=0){WTR.edgeT=8;toast('물살이 거세서 더 나갈 수 없어요')}}
 if(st==='swim'||st==='wade'){WTR.coldT-=dt;if(S.warm<35&&WTR.coldT<=0){WTR.coldT=14;toast('🥶 몸이 너무 식었어요! 물에서 나와 불을 쬐세요')}}return st}
const speedMul=()=>WTR.st==='swim'?.56:WTR.st==='wade'?lerp(.8,.55,clamp((WTR.depth-SHALLOW)/(DEEP-SHALLOW),0,1)):WTR.st==='spring'?.6:1;
/* ---- procedural swim pose (no swim clip in the pack, so the bones are driven here) ---- */
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion(),_ax=new THREE.Vector3(),_rq=new THREE.Quaternion();
function unpose(a){if(a._mod){for(const m of a._mod)m[0].quaternion.copy(m[1]);a._mod=null}}
function boneMap(a){if(!a._b){a._b={};a.root.traverse(o=>{if(o.isBone)a._b[o.name]=o})}return a._b}
function rotB(b,x,y,z,ang){if(!b||Math.abs(ang)<1e-4)return;b.parent.getWorldQuaternion(_q1);_ax.set(x,y,z).applyQuaternion(_rq).normalize();_q2.setFromAxisAngle(_ax,ang);_q3.copy(_q1).invert().multiply(_q2).multiply(_q1);b.quaternion.premultiply(_q3);b.updateMatrixWorld(true)}
function waterPose(dt){const a=P.a,r=a.root;r.rotation.order='YXZ';const sw=WTR.st==='swim'&&!P.dead;a.holder.visible=!sw;
 if(WTR.st==='spring'&&!P.dead)r.position.y-=P.moving?.22:.42;
 if(!sw){r.rotation.x=0;WTR.mv=0;if(WTR.st==='wade'&&!P.dead){WTR.ripT-=dt;if(WTR.ripT<=0){WTR.ripT=P.moving?.28:.9;ripple(P.x,P.z,P.moving?1:.8);if(P.moving&&Math.random()<.5)puff(P.x+rand(-.3,.3),.1,P.z+rand(-.3,.3),0xe6f3ff,2,.5)}}return}
 const mv=WTR.mv=lerp(WTR.mv,P.moving?1:0,Math.min(1,dt*4.5));WTR.ph+=dt*lerp(3.4,6.6,mv);const ph=WTR.ph,pitch=lerp(.14,1.02,mv),fx=Math.sin(P.rot),fz=Math.cos(P.rot);
 const cy=lerp(-.02,-.1,mv)+Math.sin(ph*(mv>.5?2:1))*lerp(.05,.03,mv);r.rotation.x=pitch;r.position.set(P.x-fx*.74*Math.sin(pitch),cy-.74*Math.cos(pitch),P.z-fz*.74*Math.sin(pitch));
 const B=boneMap(a);a._mod=['spine','head','upperarml','lowerarml','upperarmr','lowerarmr','upperlegl','lowerlegl','upperlegr','lowerlegr'].map(n=>[B[n],B[n].quaternion.clone()]);r.updateMatrixWorld(true);r.getWorldQuaternion(_rq);
 rotB(B.spine,0,0,1,Math.sin(ph)*.16*mv);rotB(B.head,1,0,0,-pitch*.82);rotB(B.head,0,0,1,-Math.sin(ph)*.12*mv);
 for(const s of[1,-1]){const ua=B[s>0?'upperarml':'upperarmr'],la=B[s>0?'lowerarml':'lowerarmr'],o=s>0?0:Math.PI,phi=ph+o;
  rotB(ua,0,0,1,-s*lerp(.55,0,mv));rotB(ua,0,1,0,-s*lerp(.32+.34*Math.sin(ph+o*.5),Math.PI/2*.9,mv));rotB(ua,1,0,0,mv*phi);
  rotB(la,1,0,0,mv*.55*Math.max(0,Math.sin(phi))+(1-mv)*.35);
  const ul=B[s>0?'upperlegl':'upperlegr'],ll=B[s>0?'lowerlegl':'lowerlegr'],lp=ph*lerp(1,2,mv)+s*1.57;
  rotB(ul,1,0,0,lerp(-.42*(.5+.5*Math.sin(lp)),.28*Math.sin(lp),mv));rotB(ll,1,0,0,lerp(.75*(.5+.5*Math.sin(lp+.7)),.22+.2*Math.sin(lp+.6),mv))}
 WTR.ripT-=dt;if(WTR.ripT<=0){WTR.ripT=P.moving?.22:.75;ripple(P.x+fx*.3,P.z+fz*.3,P.moving?1.1:.9)}
 if(P.moving){WTR.splT-=dt;if(WTR.splT<=0){WTR.splT=.26;const side=Math.sin(ph)>0?1:-1,hx=P.x+fx*.7+fz*side*.32,hz=P.z+fz*.7-fx*side*.32;puff(hx,.12,hz,0xe6f3ff,3,.7);if(Math.random()<.4)sfx(380+Math.random()*120,.07,'sine',.02,.5)}}}
/* ---- fishing spots: 기획자가 찍은 포인트(core.js FISH_PTS_A/B)에서만 낚여요 ---- */
const ROD_R=8,FCATCH=1.2;let FSP=[],FCB=null,fishWarnT=0;
const fhs=(i,k)=>{const v=Math.sin(i*127.1+k*311.7)*43758.5453;return v-Math.floor(v)};
const FISHD={};FISH.forEach(f=>FISHD[f.id]=f);
/* 떼 자리 맞추기(부팅 때 한 번, 지형·부두·배만 보고 정해서 누구에게나 같아요):
   떼가 도는 원 + 물고기 반 길이까지 물 깊이 FS_MIN 이상(물가 거품·모래·땅에 안 걸치게), 부두·배 밑 아님, 다른 떼와 안 겹침, 물가 땅에서 던질 수 있음.
   어기는 점만 기획자 좌표에서 가장 조금 옮겨요(등대 한가운데처럼 땅 위 점 포함). 옮긴 점은 ox,oz에 원래 좌표 */
const FS_MIN=.22,FS_GAP=.6,FS_HALF=.45;
function fsWaterOK(x,z,R){const rr=R+FS_HALF;if(hAt(x,z)>-FS_MIN||onDock(x,z))return false;
 for(let a=0;a<20;a++){const an=a/20*Math.PI*2;for(const k of[1,.55]){const px=x+Math.cos(an)*rr*k,pz=z+Math.sin(an)*rr*k;if(hAt(px,pz)>-FS_MIN||onDock(px,pz))return false}}
 for(const b of PBOATS){const p=b.m.position,g=b.m.geometry,br=(g.boundingSphere?g.boundingSphere.radius:1.5)*b.m.scale.x*.8;if(dist(p.x,p.z,x,z)<rr+br)return false}return true}
function fsLandOK(x,z,R){const lim=ROD_R+R+FCATCH-1;for(let r=1;r<=lim;r+=.5){const n=Math.max(12,Math.round(r*5));for(let i=0;i<n;i++){const an=i/n*Math.PI*2,px=x+Math.cos(an)*r,pz=z+Math.sin(an)*r;if(hAt(px,pz)>=-SHALLOW||onDock(px,pz))return true}}return false}
function fishSpotsInit(){if(FSP.length)return;const all=[...FISH_PTS_A.map(q=>({x:q[0],z:q[1],zone:'A',lb:q[2]})),...FISH_PTS_B.map((q,i)=>({x:q[0],z:q[1],zone:'B',lb:'해안'+(i+1)}))];
 all.forEach(s=>s.R=FISH_ZONES[s.zone].R);const placed=[],sepOK=(x,z,R)=>placed.every(q=>dist(q.x,q.z,x,z)>=q.R+R+2*FS_HALF+FS_GAP);
 const rest=[];for(const s of all){if(fsWaterOK(s.x,s.z,s.R)&&sepOK(s.x,s.z,s.R))placed.push(s);else rest.push(s)}   /* 1) 이미 괜찮은 점은 그대로 */
 const ringMin=(x,z,R)=>{const rr=R+FS_HALF;let m=-hAt(x,z);for(let a=0;a<20;a++){const an=a/20*Math.PI*2;for(const k of[1,.55]){const px=x+Math.cos(an)*rr*k,pz=z+Math.sin(an)*rr*k;m=Math.min(m,onDock(px,pz)?-9:-hAt(px,pz))}}return m};
 for(const s of rest){let best=null,bs=-1e9,rmin=1e9;const lim=hAt(s.x,s.z)>-.05?18:6;   /* 2) 나머지는 가장 가까운 괜찮은 자리로 (같은 거리면 깊은 물·카메라 쪽). 땅 위 점(등대 한가운데)만 멀리까지 */
  for(let r=.25;r<=lim&&r<=rmin+1;r+=.25){const n=Math.max(16,Math.round(Math.PI*2*r/.4));for(let i=0;i<n;i++){const an=i/n*Math.PI*2,dx=Math.cos(an),dz=Math.sin(an),x=s.x+dx*r,z=s.z+dz*r;
   if(!fsWaterOK(x,z,s.R)||!sepOK(x,z,s.R)||!fsLandOK(x,z,s.R))continue;rmin=Math.min(rmin,r);const sc=-r+Math.min(-hAt(x,z),2)*.25+dz*.3;if(sc>bs){bs=sc;best=[x,z]}}}
  if(!best){bs=-1e9;for(let r=0;r<=lim;r+=.5){const n=r?Math.max(16,Math.round(Math.PI*2*r/.5)):1;for(let i=0;i<n;i++){const an=i/n*Math.PI*2,x=s.x+Math.cos(an)*r,z=s.z+Math.sin(an)*r;   /* 3) 넓은 얕은 여울: 거리 안에서 가장 깊은 쪽(겹침·던지기는 지킴) */
    if(!sepOK(x,z,s.R)||!fsLandOK(x,z,s.R))continue;let bad=0;for(const b of PBOATS)if(dist(b.m.position.x,b.m.position.z,x,z)<s.R+FS_HALF+1.5)bad=1;if(bad)continue;const sc=ringMin(x,z,s.R)-r*.02;if(sc>bs){bs=sc;best=[x,z]}}}s.adj='shallow'}
  if(best&&(best[0]!==s.x||best[1]!==s.z)){s.ox=s.x;s.oz=s.z;s.x=best[0];s.z=best[1]}placed.push(s)}
 all.forEach((s,i)=>{const A=s.zone==='A';s.dir=fhs(i,9)<.5?1:-1;s.gone=0;s.ripT=fhs(i,7)*2;s.jmpT=4+fhs(i,8)*8;s.fish=[];const n=A?4:5;
  for(let j=0;j<n;j++){const r=s.R*(.45+.55*fhs(i,j*3+1));s.fish.push({r,w:s.dir*(A?.7:.85)*(.8+.4*fhs(i,j*3+2))/r,ph:j/n*Math.PI*2+fhs(i,j*3+3)*.8,sc:A?.7+.15*fhs(i,j+20):.55+.15*fhs(i,j+20)})}});
 FSP=all}
const spotAt=(x,z)=>{let b=null,bd=1e9;for(const s of FSP){const d=dist(s.x,s.z,x,z);if(d<=s.R+FCATCH&&d<bd){bd=d;b=s}}return b};
function fishWarn(m){if(gt-fishWarnT<1.4)return;fishWarnT=gt;toast(m)}
/* 낚싯대를 든 채 [던지기]: 사거리 안의 물고기 떼 중 바라보는 쪽·가까운 쪽으로 자동 조준 */
function aimSpot(){let b=null,bs=1e9;const f=P.rot;for(const s of FSP){const D=dist(P.x,P.z,s.x,s.z);if(D-(s.R+FCATCH-.2)>ROD_R||D>ROD_R+6)continue;let da=Math.abs(Math.atan2(s.x-P.x,s.z-P.z)-f)%(Math.PI*2);if(da>Math.PI)da=Math.PI*2-da;const sc=D+da*3;if(sc<bs){bs=sc;b=s}}
 if(!b)return null;const D=dist(P.x,P.z,b.x,b.z)||1,ux=(b.x-P.x)/D,uz=(b.z-P.z)/D;let x,z;
 if(D<=ROD_R-.4){const j=Math.random()*Math.PI*2,r=Math.random()*.7;x=b.x+Math.cos(j)*r;z=b.z+Math.sin(j)*r}else{x=P.x+ux*(ROD_R-.25);z=P.z+uz*(ROD_R-.25)}
 if(dist(P.x,P.z,x,z)<1.6){x=P.x+ux*1.6;z=P.z+uz*1.6}
 for(let k=0;k<8&&waterDepth(x,z)<.05;k++){x+=(b.x-x)*.35;z+=(b.z-z)*.35}
 return dist(x,z,b.x,b.z)<=b.R+FCATCH&&dist(P.x,P.z,x,z)<=ROD_R+.05&&waterDepth(x,z)>=.05?{x,z,s:b}:null}
const inWater=()=>WTR.st==='wade'||WTR.st==='swim';
function castAt(x,z,sp){if(P.dead)return;if(inWater()){fishWarn('물 안에서는 낚시할 수 없어요. 물 밖으로 나가요');return}
 sp=sp||spotAt(x,z);if(!sp){fishWarn('물고기 떼가 도는 곳에 던져요');return}if(dist(P.x,P.z,x,z)>ROD_R+.05){fishWarn(`너무 멀어요! 낚싯대 사거리는 ${ROD_R}m예요`);return}
 P.auto=null;P.rot=Math.atan2(x-P.x,z-P.z);fishing={st:'cast',t:0,T:.55,bx:x,bz:z,vx:x,vz:z,d:waterDepth(x,z),miss:0,spot:sp};P.a.play('Throw',{once:1,lock:.42,force:1,speed:1.5});sfx(520,.2,'sine',.04,.35)}
function tryCast(){if(inWater()){fishWarn('물 안에서는 낚시할 수 없어요. 물 밖으로 나가요');return}const c=aimSpot();if(c){castAt(c.x,c.z,c.s);return}
 let nd=1e9;for(const s of FSP)nd=Math.min(nd,dist(P.x,P.z,s.x,s.z)-s.R);fishWarn(nd<ROD_R+14?`물고기 떼까지 너무 멀어요. ${Math.ceil(nd-ROD_R+1)}m 더 다가가요`:'여기엔 물고기가 없어요. 물속에 물고기 그림자가 도는 곳을 찾아요')}
function endFish(msg){fishing=null;if(bobM)bobM.visible=lineM.visible=false;if(msg)toast(msg)}
function pickFish(sp){const t=FISH_ZONES[sp.zone].t;let tot=0;for(const q of t)tot+=q[1];let r=Math.random()*tot;for(const q of t){r-=q[1];if(r<=0)return FISHD[q[0]]}return FISHD[t[0][0]]}
function updFishing(dt,press){const f=fishing;if(!f){if(press&&!P.moving)tryCast();return}
 if(P.moving||P.auto||inWater()||dist(P.x,P.z,f.bx,f.bz)>ROD_R+1.5){endFish();return}f.t+=dt;
 if(f.st==='cast'){if(f.t>=f.T){f.st='wait';f.t=0;f.W=rand(2.4,6.5);splash(f.bx,f.bz,4);sfx(250,.14,'sine',.04,.6)}}
 else if(f.st==='wait'){if(press){endFish();return}if(Math.random()<dt*.5){f.nib=.22;sfx(700,.03,'sine',.015)}if(f.t>=f.W){f.st='bite';f.t=0;sfx(950,.12,'square',.05);buzz(140);ripple(f.bx,f.bz,1.3,.8)}}
 else if(f.st==='bite'){if(press){f.st='reel';f.t=0;f.fish=pickFish(f.spot);f.prog=.2;f.ten=.12;f.thr=0;f.thrT=rand(1,2);f.sx=f.bx;f.sz=f.bz;sfx(620,.08);buzz(40);return}
  if(f.t>1.25){f.miss++;if(f.miss>=2){endFish('물고기가 미끼만 먹고 도망갔어요');return}f.st='wait';f.t=0;f.W=rand(2,4.5)}}
 else if(f.st==='reel'){const s=f.fish.str,hold=inp.fire;f.thrT-=dt;if(f.thr>0){f.thr-=dt;if(f.thr<=0)f.thrT=rand(1.4,3.2)-s*.22}else if(f.thrT<=0){f.thr=rand(.55,.9)+s*.07;buzz(70);sfx(200,.15,'sawtooth',.03,.7)}
  if(hold){f.ten+=dt*(f.thr>0?1.2+s*.14:.16+s*.05);if(f.thr<=0)f.prog+=dt*(.32-s*.035)}else{f.ten-=dt*.9;f.prog-=dt*(.025+s*.018)}f.ten=Math.max(0,f.ten);
  if(hold&&f.thr<=0){f.tick=(f.tick||0)-dt;if(f.tick<=0){f.tick=.09;sfx(1200,.015,'square',.012)}}
  if(f.ten>=1){endFish('줄이 끊어졌어요! 요동칠 땐 손을 떼세요');sfx(140,.3,'sawtooth',.06,.5);buzz(200);return}
  if(f.prog<=0){endFish('물고기가 도망갔어요…');return}if(f.prog>=1)catchFish(f.fish)}}
function catchFish(fi){const cm=Math.round(rand(fi.cm[0],fi.cm[1]));give(fi.id,1);S.st.fish++;const first=!S.caught[fi.id];S.caught[fi.id]=(S.caught[fi.id]||0)+1;S.best=S.best||{};const rec=!first&&cm>(S.best[fi.id]||0);if(cm>(S.best[fi.id]||0))S.best[fi.id]=cm;
 if(fishing&&fishing.spot)fishing.spot.gone=7;endFish();const g=fi.g||0,hx=P.x+Math.sin(P.rot)*1.5,hz=P.z+Math.cos(P.rot)*1.5;splash(hx,hz,8);if(g>=2)puff(P.x,groundY(P.x,P.z)+2.6,P.z,g>=3?0xffc24a:0xc59bff,g>=3?16:9,.8);
 FCB={f:fi,cm,first,rec,t:3.2};jingle([[523,659,784],[523,659,784,1047],[587,740,880,1175],[523,659,784,1047,1319,1568]][g]);buzz(g>=2?120:60);
 P.a.play('Cheer',{once:1,lock:1.3,force:1});if(catchM)scene.remove(catchM);catchM=mesh(GEO[fi.id],MATT);catchM.scale.setScalar(clamp(cm/60,.7,1.6));scene.add(catchM);catchT=1.6;hudDirty=true}
/* ---- 물고기 떼: 물속 그림자가 원을 그리며 돌아요(가까운 곳만, InstancedMesh 하나) ---- */
const SCH={m:null,max:64};const _sm=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_sv=new THREE.Vector3(),_ss=new THREE.Vector3(),_sy=new THREE.Vector3(0,1,0);
function initSchools(){fishSpotsInit();if(SCH.m)return;const sh=new THREE.Shape();sh.moveTo(0,.5);sh.quadraticCurveTo(.22,.32,.19,0);sh.quadraticCurveTo(.13,-.25,.04,-.33);sh.lineTo(.21,-.55);sh.lineTo(0,-.44);sh.lineTo(-.21,-.55);sh.lineTo(-.04,-.33);sh.quadraticCurveTo(-.13,-.25,-.19,0);sh.quadraticCurveTo(-.22,.32,0,.5);
 const g=new THREE.ShapeGeometry(sh,4);g.rotateX(Math.PI/2);const m=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:0x0a2140,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}),SCH.max);
 for(let i=0;i<SCH.max;i++)m.setColorAt(i,new THREE.Color(1,1,1));m.count=0;m.frustumCulled=false;m.renderOrder=3;scene.add(m);SCH.m=m}
function updSchools(dt){const m=SCH.m;if(!m)return;let k=0;const vis=[];for(const s of FSP){const d=(s.x-camT.x)**2+(s.z-camT.z)**2;if(d<48*48)vis.push([d,s])}vis.sort((a,b)=>a[0]-b[0]);
 const f=fishing,seen=!INT.on;
 for(let vi=0;vi<vis.length&&seen;vi++){const s=vis[vi][1];s.gone=Math.max(0,s.gone-dt);
  if(vi<3){s.ripT-=dt;if(s.ripT<=0){s.ripT=rand(.7,1.6);const q=s.fish[(Math.random()*s.fish.length)|0],a=q.ph+q.w*gt;ripple(s.x+Math.cos(a)*q.r,s.z+Math.sin(a)*q.r,.45,.9)}
   s.jmpT-=dt;if(s.jmpT<=0){s.jmpT=rand(6,12);const q=s.fish[1],a=q.ph+q.w*gt;splash(s.x+Math.cos(a)*q.r,s.z+Math.sin(a)*q.r,3)}}
  for(let j=0;j<s.fish.length&&k<SCH.max;j++){const q=s.fish[j];if(j===0&&s.gone>0&&!(f&&f.spot===s))continue;const a=q.ph+q.w*gt;let x=s.x+Math.cos(a)*q.r,z=s.z+Math.sin(a)*q.r,hx=-Math.sin(a)*Math.sign(q.w),hz=Math.cos(a)*Math.sign(q.w),wig=8;
   if(j===0&&f&&f.spot===s){let u=0;if(f.st==='wait'&&f.t>f.W-1)u=clamp(1-(f.W-f.t),0,1);else if(f.st==='bite')u=1;else if(f.st==='reel')u=1;
    if(u>0){u=u*u*(3-2*u);const tx=f.st==='reel'?f.vx:f.bx,tz=f.st==='reel'?f.vz:f.bz,ex=x,ez=z;x=lerp(x,tx-Math.sin(P.rot)*.25,u);z=lerp(z,tz-Math.cos(P.rot)*.25,u);if(f.st==='reel'||f.st==='bite'){hx=P.x-x;hz=P.z-z;if(f.st==='bite'){hx=-hx;hz=-hz}wig=f.thr>0?26:16}else{hx=tx-ex;hz=tz-ez}}}
   const ry=Math.atan2(hx,hz)+Math.sin(gt*wig+q.ph*3)*.16;_sq.setFromAxisAngle(_sy,ry);_sm.compose(_sv.set(x,.02,z),_sq,_ss.set(q.sc,1,q.sc));m.setMatrixAt(k++,_sm)}}
 m.count=k;m.instanceMatrix.needsUpdate=true}
const _tip=new THREE.Vector3();
function updFishFx(dt){updSchools(dt);if(FCB){FCB.t-=dt;if(FCB.t<=0)FCB=null}if(catchM){catchT-=dt;catchM.position.set(P.x,groundY(P.x,P.z)+2.6+Math.sin(catchT*8)*.05,P.z);catchM.rotation.set(0,gt*2.5,Math.sin(gt*14)*.25);if(catchT<=0){scene.remove(catchM);catchM=null}}
 for(const r of ripples){if(r.t>=r.l){r.m.visible=false;continue}r.t+=dt;const u=r.t/r.l;r.m.position.set(r.x,.04,r.z);r.m.scale.setScalar(r.s*(.6+u*2.6));r.m.material.opacity=.55*(1-u)}
 const f=fishing;if(!f||!P.a.tip){if(bobM)bobM.visible=lineM.visible=false;return}P.a.root.updateMatrixWorld(true);P.a.tip.getWorldPosition(_tip);let bx=f.bx,bz=f.bz,by=.03;
 if(f.st==='cast'){const u=Math.min(1,f.t/f.T);bx=lerp(_tip.x,f.bx,u);bz=lerp(_tip.z,f.bz,u);by=lerp(_tip.y,.03,u)+Math.sin(u*Math.PI)*1.6}
 else if(f.st==='wait'){f.nib=Math.max(0,(f.nib||0)-dt);by=.03+Math.sin(gt*2.4)*.025-(f.nib>0?.07:0)}
 else if(f.st==='bite'){by=-.1+Math.sin(gt*32)*.035}
 else if(f.st==='reel'){const k=f.prog*.82,tx=P.x+Math.sin(P.rot)*1.6,tz=P.z+Math.cos(P.rot)*1.6;bx=lerp(f.sx,tx,k);bz=lerp(f.sz,tz,k);if(waterDepth(bx,bz)<.15){bx=lerp(f.sx,tx,k*.7);bz=lerp(f.sz,tz,k*.7)}if(f.thr>0){bx+=Math.sin(gt*23)*.18;bz+=Math.cos(gt*19)*.18;by=-.05}if(Math.random()<dt*(f.thr>0?14:4))puff(bx,.1,bz,0xe6f3ff,1,.5)}
 f.vx=bx;f.vz=bz;bobM.visible=lineM.visible=true;bobM.position.set(bx,by,bz);bobM.rotation.z=f.st==='bite'?Math.sin(gt*30)*.5:0;
 const sag=f.st==='reel'?lerp(.5,.02,clamp(f.ten*1.4,0,1)):f.st==='cast'?0:.6,arr=lineM.geometry.attributes.position.array;for(let i=0;i<16;i++){const u=i/15;arr[i*3]=lerp(_tip.x,bx,u);arr[i*3+1]=lerp(_tip.y,by+.16,u)-Math.sin(u*Math.PI)*sag;arr[i*3+2]=lerp(_tip.z,bz,u)}lineM.geometry.attributes.position.needsUpdate=true}
function drawFishUI(c,k){if(FCB)drawCatch(c,k);const f=fishing;
 if(!f){if(curId()==='rod'&&!P.dead&&!INT.on&&!panel&&!inWater()){const a=aimSpot();if(a){const q=scr(a.s.x,.3,a.s.z);uiPill(c,'🎣 여기 던져요',q[0],q[1],11*k,UIC.pn,UIC.tx,UIC.pn3)}}return}
 const y0=groundY(P.x,P.z),hp=scr(P.x,y0+2.9,P.z);
 if(f.st==='wait')uiPill(c,'입질을 기다려요…',hp[0],hp[1],12*k,UIC.pn,UIC.tx,UIC.pn3);
 if(f.st==='bite'){const s=1+Math.sin(gt*20)*.1;c.font=`900 ${40*k*s}px ${UIF}`;c.lineWidth=6;c.strokeStyle=UIC.brn;c.strokeText('!',hp[0],hp[1]);c.fillStyle='#FFB547';c.fillText('!',hp[0],hp[1]);uiPill(c,'지금 눌러요!',hp[0],hp[1]+24*k,13*k,UIC.red,'#fff')}
 if(f.st==='reel'){const w=250*k,h=16*k,x=innerWidth/2-w/2,y=innerHeight*.2,thr=f.thr>0;c.fillStyle=UIC.pn;rrect(c,x-14*k,y-34*k,w+28*k,92*k,16*k);c.fill();c.strokeStyle=thr?UIC.red:'#E2CDA8';c.lineWidth=2.5;c.stroke();
  c.font=`800 ${13*k}px ${UIF}`;c.fillStyle=thr&&Math.sin(gt*18)>0?UIC.red:UIC.tx;c.fillText(thr?'요동쳐요! 손을 떼세요':inp.fire?'좋아요, 계속 감아요':'꾹 눌러서 감아요',innerWidth/2,y-14*k);
  c.fillStyle='#E6D4B4';rrect(c,x,y,w,h,h/2);c.fill();c.fillStyle='#4A9BE0';rrect(c,x,y,w*clamp(f.prog,0,1),h,h/2);c.fill();c.font=`${16*k}px ${UIF}`;c.fillText('🐟',x+w*clamp(f.prog,0,1),y+h*.85);
  const ty=y+h+14*k,th=10*k;c.fillStyle='#E6D4B4';rrect(c,x,ty,w,th,th/2);c.fill();const t=clamp(f.ten,0,1);c.fillStyle=t<.55?'#45B864':t<.8?'#F0A23A':'#E5534B';rrect(c,x,ty,w*t,th,th/2);c.fill();
  c.font=`800 ${11*k}px ${UIF}`;c.textAlign='left';c.fillStyle='#A08368';c.fillText('줄 긴장',x,ty+th+12*k);c.textAlign='right';c.fillText('당기기',x+w,y-2*k+0);c.textAlign='center'}}
function drawCatch(c,k){const B=FCB,f=B.f,g=f.g||0,G=FGRADE[g],a=clamp(B.t/.35,0,1)*clamp((3.2-B.t)/.2,0,1),pop=1+.12*Math.max(0,1-(3.2-B.t)/.25);c.save();c.globalAlpha=a;const cx=innerWidth/2,y=innerHeight*.2,fs=20*k*pop;
 c.font=`900 ${fs}px ${UIF}`;const t2=`${f.n} ${B.cm}cm`,w=Math.max(c.measureText(t2).width+44*k,190*k),h=74*k;c.fillStyle=UIC.pn;rrect(c,cx-w/2,y-h/2,w,h,18*k);c.fill();c.strokeStyle=G[1];c.lineWidth=3*k;c.stroke();
 const tags=[[G[0],G[1]]];if(B.first)tags.push(['새 물고기!','#F08A24']);else if(B.rec)tags.push(['최고 기록!','#45B864']);const tw=tags.map(q=>{c.font=`800 ${12*k}px ${UIF}`;return c.measureText(q[0]).width+12*k*1.3});let tx=cx-(tw.reduce((p,v)=>p+v,0)+(tags.length-1)*6*k)/2;
 tags.forEach((q,i)=>{uiPill(c,q[0],tx+tw[i]/2,y-h/2+2*k,12*k,q[1],'#fff','#fff');tx+=tw[i]+6*k});
 c.font=`900 ${fs}px ${UIF}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=UIC.tx;c.fillText(t2,cx,y+6*k);c.font=`700 ${11*k}px ${UIF}`;c.fillStyle=UIC.mut||'#A08368';c.fillText('낚았어요!',cx,y+26*k);c.restore()}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
