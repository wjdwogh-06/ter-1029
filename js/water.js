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
function buildWaterGeo(){const T=-.62,rl=2.3;const A=(d,o=0)=>[0,Math.sin(-T)*d+o,Math.cos(-T)*d+.12],X=Math.PI/2+T;   /* modern carbon spinning rod: EVA grips, reel seat, fixed-spool reel */
 GEO.rod=mg([pt(cyl(.05,.054,.34,8),0x1f2226,[0,0,-.12],[X,0,0]),pt(cyl(.058,.058,.04,8),0x30343a,[0,Math.sin(-T)*-.3,Math.cos(-T)*-.3+.0],[X,0,0]),pt(cyl(.036,.036,.16,8),0xb8bec6,A(-.02),[X,0,0]),pt(cyl(.042,.046,.2,8),0x1f2226,A(.16),[X,0,0]),pt(cyl(.03,.034,.03,8),0xe8742a,A(.27),[X,0,0]),pt(cyl(.012,.03,rl,6),0x2b2f36,A(rl/2+.28),[X,0,0]),
  pt(cyl(.016,.016,.11,5),0x4a4f57,[0,-.06,.06]),pt(cyl(.058,.058,.12,10),0x3a3f46,[0,-.14,.1],[X,0,0]),pt(cyl(.068,.06,.08,10),0xd8dde2,[0,-.12,.2],[X,0,0]),pt(cyl(.07,.07,.015,10),0xe8742a,[0,-.11,.245],[X,0,0]),pt(box(.1,.012,.012),0x9aa3ad,[.06,-.15,.1]),pt(box(.012,.07,.012),0x9aa3ad,[.11,-.18,.1]),pt(box(.04,.025,.025),0x1f2226,[.11,-.22,.1]),
  ...[[.62,.035],[1.05,.026],[1.5,.02],[1.95,.016],[2.3,.014]].map(([d,r])=>pt(new THREE.TorusGeometry(r,.005,3,8),0xc9ced4,A(d+.28,-r-.012),[X,0,0]))]);
 GEO.rod.userData.tip=A(rl+.28);
 GEO.bobber=mg([pt(new THREE.SphereGeometry(.13,10,8,0,6.3,Math.PI/2,Math.PI/2),0xf4f1ea),pt(new THREE.SphereGeometry(.13,10,8,0,6.3,0,Math.PI/2),0xe0443a),pt(cyl(.012,.012,.16,5),0xf4f1ea,[0,.18,0])]);
 FISH.forEach(f=>{GEO[f.id]=fishGeo(f,0);GEO['c'+f.id]=fishGeo(f,1)})}
function initWater(){for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.42,.52,28),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;m.visible=false;scene.add(m);ripples.push({m,t:9,l:1})}
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
/* ---- fishing ---- */
function castPoint(){const fx=Math.sin(P.rot),fz=Math.cos(P.rot);for(let d=7;d>=2;d-=.25){const x=P.x+fx*d,z=P.z+fz*d;if(waterDepth(x,z)>.3)return[x,z]}return null}
function castAt(x,z){if(WTR.st==='swim'||P.dead)return;P.auto=null;P.rot=Math.atan2(x-P.x,z-P.z);fishing={st:'cast',t:0,T:.55,bx:x,bz:z,d:waterDepth(x,z),miss:0};P.a.play('Throw',{once:1,lock:.42,force:1,speed:1.5});sfx(520,.2,'sine',.04,.35)}
function tryCast(){const c=castPoint();if(c)castAt(c[0],c[1]);else toast('물가에서 물 쪽을 바라보고 던져요 (물을 톡 눌러도 돼요)')}
function endFish(msg){fishing=null;if(bobM)bobM.visible=lineM.visible=false;if(msg)toast(msg)}
function pickFish(depth){const night=dark()>.5,deep=depth>1.4;let tot=0;const w=FISH.map(f=>{let v=f.w[deep?1:0];if(night&&f.legend)v*=3;if(night&&f.id==='f_salmon')v*=1.5;tot+=v;return v});let r=Math.random()*tot;for(let i=0;i<FISH.length;i++){r-=w[i];if(r<=0)return FISH[i]}return FISH[0]}
function updFishing(dt,press){const f=fishing;if(!f){if(press&&!P.moving)tryCast();return}
 if(P.moving||P.auto||WTR.st==='swim'||dist(P.x,P.z,f.bx,f.bz)>9){endFish();return}f.t+=dt;
 if(f.st==='cast'){if(f.t>=f.T){f.st='wait';f.t=0;f.W=rand(2.4,6.5);splash(f.bx,f.bz,4);sfx(250,.14,'sine',.04,.6)}}
 else if(f.st==='wait'){if(press){endFish();return}if(Math.random()<dt*.5){f.nib=.22;sfx(700,.03,'sine',.015)}if(f.t>=f.W){f.st='bite';f.t=0;sfx(950,.12,'square',.05);buzz(140);ripple(f.bx,f.bz,1.3,.8)}}
 else if(f.st==='bite'){if(press){f.st='reel';f.t=0;f.fish=pickFish(f.d);f.prog=.2;f.ten=.12;f.thr=0;f.thrT=rand(1,2);f.sx=f.bx;f.sz=f.bz;sfx(620,.08);buzz(40);return}
  if(f.t>1.25){f.miss++;if(f.miss>=2){endFish('물고기가 미끼만 먹고 도망갔어요');return}f.st='wait';f.t=0;f.W=rand(2,4.5)}}
 else if(f.st==='reel'){const s=f.fish.str,hold=inp.fire;f.thrT-=dt;if(f.thr>0){f.thr-=dt;if(f.thr<=0)f.thrT=rand(1.4,3.2)-s*.22}else if(f.thrT<=0){f.thr=rand(.55,.9)+s*.07;buzz(70);sfx(200,.15,'sawtooth',.03,.7)}
  if(hold){f.ten+=dt*(f.thr>0?1.2+s*.14:.16+s*.05);if(f.thr<=0)f.prog+=dt*(.32-s*.035)}else{f.ten-=dt*.9;f.prog-=dt*(.025+s*.018)}f.ten=Math.max(0,f.ten);
  if(hold&&f.thr<=0){f.tick=(f.tick||0)-dt;if(f.tick<=0){f.tick=.09;sfx(1200,.015,'square',.012)}}
  if(f.ten>=1){endFish('줄이 끊어졌어요! 요동칠 땐 손을 떼세요');sfx(140,.3,'sawtooth',.06,.5);buzz(200);return}
  if(f.prog<=0){endFish('물고기가 도망갔어요…');return}if(f.prog>=1)catchFish(f.fish)}}
function catchFish(fi){const cm=Math.round(rand(fi.cm[0],fi.cm[1]));give(fi.id,1);S.st.fish++;const first=!S.caught[fi.id];S.caught[fi.id]=(S.caught[fi.id]||0)+1;S.best=S.best||{};if(cm>(S.best[fi.id]||0))S.best[fi.id]=cm;
 endFish();splash(P.x+Math.sin(P.rot)*1.5,P.z+Math.cos(P.rot)*1.5,8);toast(`${first?'✨ 새 물고기! ':''}${fi.n} ${cm}cm 낚았어요!`);jingle(fi.legend?[523,659,784,1047,1319]:[523,659,784]);buzz(60);
 P.a.play('Cheer',{once:1,lock:1.3,force:1});if(catchM)scene.remove(catchM);catchM=mesh(GEO[fi.id],MATT);catchM.scale.setScalar(clamp(cm/60,.7,1.6));scene.add(catchM);catchT=1.6;hudDirty=true}
const _tip=new THREE.Vector3();
function updFishFx(dt){if(catchM){catchT-=dt;catchM.position.set(P.x,groundY(P.x,P.z)+2.6+Math.sin(catchT*8)*.05,P.z);catchM.rotation.set(0,gt*2.5,Math.sin(gt*14)*.25);if(catchT<=0){scene.remove(catchM);catchM=null}}
 for(const r of ripples){if(r.t>=r.l){r.m.visible=false;continue}r.t+=dt;const u=r.t/r.l;r.m.position.set(r.x,.04,r.z);r.m.scale.setScalar(r.s*(.6+u*2.6));r.m.material.opacity=.55*(1-u)}
 const f=fishing;if(!f||!P.a.tip){if(bobM)bobM.visible=lineM.visible=false;return}P.a.root.updateMatrixWorld(true);P.a.tip.getWorldPosition(_tip);let bx=f.bx,bz=f.bz,by=.03;
 if(f.st==='cast'){const u=Math.min(1,f.t/f.T);bx=lerp(_tip.x,f.bx,u);bz=lerp(_tip.z,f.bz,u);by=lerp(_tip.y,.03,u)+Math.sin(u*Math.PI)*1.6}
 else if(f.st==='wait'){f.nib=Math.max(0,(f.nib||0)-dt);by=.03+Math.sin(gt*2.4)*.025-(f.nib>0?.07:0)}
 else if(f.st==='bite'){by=-.1+Math.sin(gt*32)*.035}
 else if(f.st==='reel'){const k=f.prog*.82,tx=P.x+Math.sin(P.rot)*1.6,tz=P.z+Math.cos(P.rot)*1.6;bx=lerp(f.sx,tx,k);bz=lerp(f.sz,tz,k);if(waterDepth(bx,bz)<.15){bx=lerp(f.sx,tx,k*.7);bz=lerp(f.sz,tz,k*.7)}if(f.thr>0){bx+=Math.sin(gt*23)*.18;bz+=Math.cos(gt*19)*.18;by=-.05}if(Math.random()<dt*(f.thr>0?14:4))puff(bx,.1,bz,0xe6f3ff,1,.5)}
 bobM.visible=lineM.visible=true;bobM.position.set(bx,by,bz);bobM.rotation.z=f.st==='bite'?Math.sin(gt*30)*.5:0;
 const sag=f.st==='reel'?lerp(.5,.02,clamp(f.ten*1.4,0,1)):f.st==='cast'?0:.6,arr=lineM.geometry.attributes.position.array;for(let i=0;i<16;i++){const u=i/15;arr[i*3]=lerp(_tip.x,bx,u);arr[i*3+1]=lerp(_tip.y,by+.16,u)-Math.sin(u*Math.PI)*sag;arr[i*3+2]=lerp(_tip.z,bz,u)}lineM.geometry.attributes.position.needsUpdate=true}
function drawFishUI(c,k){const f=fishing;if(!f)return;const y0=groundY(P.x,P.z),hp=scr(P.x,y0+2.9,P.z);
 if(f.st==='wait')uiPill(c,'입질을 기다려요…',hp[0],hp[1],12*k,UIC.pn,UIC.tx,UIC.pn3);
 if(f.st==='bite'){const s=1+Math.sin(gt*20)*.1;c.font=`900 ${40*k*s}px ${UIF}`;c.lineWidth=6;c.strokeStyle=UIC.brn;c.strokeText('!',hp[0],hp[1]);c.fillStyle='#FFB547';c.fillText('!',hp[0],hp[1]);uiPill(c,'지금 눌러요!',hp[0],hp[1]+24*k,13*k,UIC.red,'#fff')}
 if(f.st==='reel'){const w=250*k,h=16*k,x=innerWidth/2-w/2,y=innerHeight*.2,thr=f.thr>0;c.fillStyle=UIC.pn;rrect(c,x-14*k,y-34*k,w+28*k,92*k,16*k);c.fill();c.strokeStyle=thr?UIC.red:'#E2CDA8';c.lineWidth=2.5;c.stroke();
  c.font=`800 ${13*k}px ${UIF}`;c.fillStyle=thr&&Math.sin(gt*18)>0?UIC.red:UIC.tx;c.fillText(thr?'요동쳐요! 손을 떼세요':inp.fire?'좋아요, 계속 감아요':'꾹 눌러서 감아요',innerWidth/2,y-14*k);
  c.fillStyle='#E6D4B4';rrect(c,x,y,w,h,h/2);c.fill();c.fillStyle='#4A9BE0';rrect(c,x,y,w*clamp(f.prog,0,1),h,h/2);c.fill();c.font=`${16*k}px ${UIF}`;c.fillText('🐟',x+w*clamp(f.prog,0,1),y+h*.85);
  const ty=y+h+14*k,th=10*k;c.fillStyle='#E6D4B4';rrect(c,x,ty,w,th,th/2);c.fill();const t=clamp(f.ten,0,1);c.fillStyle=t<.55?'#45B864':t<.8?'#F0A23A':'#E5534B';rrect(c,x,ty,w*t,th,th/2);c.fill();
  c.font=`800 ${11*k}px ${UIF}`;c.textAlign='left';c.fillStyle='#A08368';c.fillText('줄 긴장',x,ty+th+12*k);c.textAlign='right';c.fillText('당기기',x+w,y-2*k+0);c.textAlign='center'}}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
