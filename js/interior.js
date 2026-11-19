'use strict';
/* ===== 텐트 내부 (롱빈터식, 단순하게) =====
   텐트에 들어가면 맵 구석 바다 위 높은 곳(INT.x, INT.y, INT.z)에 있는 방으로 옮겨져요. 기획자가 준 롱빈터 참고 화면처럼:
   - 까만 어둠 속에 파란 바닥 한 장(가운데가 조명으로 밝음), 뒤쪽에 둥근 연보라 벽 하나(반구의 뒷쪽 절반). 옆벽·지붕·장식 없음.
   - 작업대는 텐트 안에만 놓을 수 있어요(14차, BUILDS.bench.indoor). 다른 가구는 기획자가 정한 뒤에.
   - 나가기는 들어온 문(앞쪽 가운데, 발판과 바깥 빛)에서 [나가기]로만 해요(15차, 기획자: '아래로 걸어가면 그냥 나가져요'). 앞쪽 가장자리는 막혀 있어요.
   - 집(15차, 텐트에서 업그레이드)은 같은 자리의 더 넓은 방(INT_ROOM.house). 28차(기획자가 준 참고 화면 '저렇게 심플하게'): 어두운 타일 바닥 + 뒤·양옆 흰 벽 + 앞 가운데 짧은 통로(끝에 문 발판). 지붕·장식 없음.
   바닥은 addDock 판(들어가 있을 때만 켜짐)이라 groundY가 그대로 동작하고, 가장자리 충돌은 intWalk가 맡아요. */
const INT={on:false,x:40,z:40,y:60,hw:3.2,hd:2.8,g:null,gr:{},kind:'tent',dock:null,s:null,ret:null,it:[],L:null};
const INT_ROOM={tent:{hw:3.2,hd:2.8,lc:0xe8efff,ld:7.6,li:1.7},house:{hw:4.1,hd:3.3,lc:0xfff0dc,ld:10.5,li:1.35,cor:[1.05,1.7]}};   /* cor: 집 앞 통로(반폭, 길이) — 문은 통로 끝 */   /* 방 크기(반폭·반깊이)와 조명 */
function intBuild(){if(INT.g)return;const G=INT.g=new THREE.Group();G.position.set(INT.x,INT.y,INT.z);const T=INT.gr.tent=new THREE.Group(),W=INT_ROOM.tent.hw,D=INT_ROOM.tent.hd;G.add(T);
 /* floor: one smooth blue sheet (many vertices so the light pools softly in the middle), thin edge */
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(2*W,2*D,24,24),new THREE.MeshLambertMaterial({color:0x2d58a6}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;T.add(fl);
 const ed=new THREE.Mesh(new THREE.BoxGeometry(2*W,.08,2*D),new THREE.MeshLambertMaterial({color:0x1d3a70}));ed.position.y=-.041;T.add(ed);
 /* back wall: the back half of a dome standing on the back edge, pale lavender, soft glow, a stitched seam just inside the rim */
 const dm=new THREE.Mesh(new THREE.SphereGeometry(W,40,18,Math.PI,Math.PI,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xcfbcf6,emissive:0x3a2a6a,side:THREE.DoubleSide}));dm.position.z=-D;dm.receiveShadow=true;T.add(dm);
 const db=new THREE.Mesh(new THREE.CircleGeometry(W,40,0,Math.PI),new THREE.MeshLambertMaterial({color:0xcfbcf6,emissive:0x3a2a6a}));db.rotation.x=-Math.PI/2;db.position.set(0,.003,-D);T.add(db);   /* the dome's own floor, so the arch reads as one solid wall */
 const seam=new THREE.Mesh(new THREE.TorusGeometry(W-.13,.014,4,64,Math.PI),new THREE.MeshBasicMaterial({color:0xa995dc}));seam.position.set(0,0,-D+.03);T.add(seam);
 const rim=new THREE.Mesh(new THREE.BoxGeometry(2*W,.03,.05),new THREE.MeshBasicMaterial({color:0xcbb8f0}));rim.position.set(0,.015,-D+.02);T.add(rim);
 /* pegs: tan at the back corners, dark stakes at the front corners */
 const pm=new THREE.MeshLambertMaterial({color:0xb08a5a}),sm=new THREE.MeshLambertMaterial({color:0x1d2330});for(const sx of[-1,1]){const pg=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.14),pm);pg.position.set(sx*(W-.06),.05,-D+.06);T.add(pg);const st=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.05,10),sm);st.position.set(sx*(W-.08),.025,D-.08);T.add(st)}
 const bk=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshBasicMaterial({color:0x040506,fog:false}));bk.rotation.x=-Math.PI/2;bk.position.y=-1.2;G.add(bk);
 intDoor(T,D);intHouseRoom(G);
 const L=INT.L=new THREE.PointLight(0xe8efff,1.7,7.6,2);L.position.set(0,2.5,.5);G.add(L);G.visible=false;scene.add(G);
 INT.dock=addDock(INT.x,INT.z,0,INT_ROOM.house.hw+2,INT_ROOM.house.hd+2,INT.y);INT.full=INT.dock.hw;INT.dock.hw=0;
 Object.assign(DECO,{int_exit:{g:'nil',s:1,bx:.7,bz:.3,pass:1}})}
/* the door you came in by: a doormat at the front middle and soft daylight spilling in over it (no walls or flaps) */
function intDoor(G,D){const mat=new THREE.Mesh(new THREE.BoxGeometry(1.25,.03,.62),new THREE.MeshLambertMaterial({color:0x7a5236}));mat.position.set(0,.016,D-.42);G.add(mat);
 for(const z of[-.2,0,.2]){const st=new THREE.Mesh(new THREE.BoxGeometry(1.05,.034,.06),new THREE.MeshLambertMaterial({color:0xa9774c}));st.position.set(0,.018,D-.42+z);G.add(st)}
 const c=document.createElement('canvas');c.width=8;c.height=64;const k=c.getContext('2d'),g=k.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,1)');k.fillStyle=g;k.fillRect(0,0,8,64);
 const tx=new THREE.CanvasTexture(c),sp=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.9),new THREE.MeshBasicMaterial({map:tx,color:0xffe6b0,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false}));sp.rotation.x=-Math.PI/2;sp.position.set(0,.02,D-.95);G.add(sp);
 const ln=new THREE.Mesh(new THREE.BoxGeometry(1.4,.012,.05),new THREE.MeshBasicMaterial({color:0xffe9b8}));ln.position.set(0,.006,D-.02);G.add(ln)}
/* the house room (28차): dark tiled floor, plain white walls at the back and both sides, and a short passage out of the front middle with the doormat at its end */
function intTileTex(){const c=document.createElement('canvas');c.width=c.height=256;const k=c.getContext('2d'),S=128;
 for(let j=0;j<2;j++)for(let i=0;i<2;i++){const v=[0x3b3634,0x37322f,0x3f3936,0x34302e][j*2+i];k.fillStyle='#'+v.toString(16).padStart(6,'0');k.fillRect(i*S,j*S,S,S);
  const g=k.createLinearGradient(i*S,j*S,i*S+S,j*S+S);g.addColorStop(0,'rgba(255,255,255,.035)');g.addColorStop(1,'rgba(0,0,0,.05)');k.fillStyle=g;k.fillRect(i*S,j*S,S,S)}
 k.fillStyle='#24201f';for(let i=0;i<=2;i++){k.fillRect(i*S-2,0,4,256);k.fillRect(0,i*S-2,256,4)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function intHouseRoom(G){const H=INT.gr.house=new THREE.Group(),R=INT_ROOM.house,W=R.hw,D=R.hd,CW=R.cor[0],CL=R.cor[1];G.add(H);H.visible=false;
 const tx=intTileTex(),TS=1.6,floor=(w,d,cx,cz)=>{const t=tx.clone();t.needsUpdate=true;t.repeat.set(w/TS,d/TS);t.offset.set((cx-w/2)/TS,(cz-d/2)/TS);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d,Math.ceil(w*3),Math.ceil(d*3)),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);m.receiveShadow=true;H.add(m);
  const e=new THREE.Mesh(new THREE.BoxGeometry(w,.1,d),new THREE.MeshLambertMaterial({color:0x221e1d}));e.position.set(cx,-.051,cz);H.add(e)};
 floor(2*W,2*D,0,0);floor(2*CW,CL+.02,0,D+CL/2-.01);
 /* walls: one merged white mesh — back + both sides at full height, a light grey cap on top, a thin dark skirting at the floor line */
 const WH=2.5,T=.14,WC=0xf3f0ea,WS=0xe2ddd4,p=[pt(box(2*W+2*T,WH,T),WC,[0,WH/2,-D-T/2]),pt(box(2*W+2*T,.03,T+.02),WS,[0,WH+.015,-D-T/2])];
 for(const sx of[-1,1])p.push(pt(box(T,WH,2*D+T),WC,[sx*(W+T/2),WH/2,-T/2]),pt(box(T+.02,.03,2*D+T),WS,[sx*(W+T/2),WH+.015,-T/2]),pt(box(.02,.09,2*D),0x2a2523,[sx*(W-.01),.045,0]));
 p.push(pt(box(2*W,.09,.02),0x2a2523,[0,.045,-D+.01]));
 /* the passage: thin dark kerbs on both sides so it reads as a way out */
 for(const sx of[-1,1])p.push(pt(box(.06,.05,CL),0x2a2523,[sx*(CW+.03),.025,D+CL/2]));
 const wm=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true}));wm.receiveShadow=true;H.add(wm);
 intDoor(H,D+CL)}
/* camera inside: fit the whole room (front edge included) on any screen shape, above the hotbar, barely following the player */
function intCam(ct){const cl=INT.cl||0,t=Math.tan(cam.fov*Math.PI/360),dw=(2*INT.hw+1.7)/(2*t*cam.aspect),dh=(2*INT.hd+cl+3.8)/(2*t),d=Math.max(dw,dh),a=.72,fx=INT.x+(ct.x-INT.x)*.12,fz=INT.z+cl/2+(ct.z-INT.z-cl/2)*.08;   /* 28차: 집 앞 통로(INT.cl)까지 화면에 */
 cam.position.set(fx,INT.y+.9+Math.sin(a)*d,fz+.75+Math.cos(a)*d);cam.lookAt(fx,INT.y+.9,fz+.75)}
/* edges: all four edges stop you; the way out is [나가기] at the door (front middle) */
function intWalk(x,z,r){const lx=x-INT.x,lz=z-INT.z;if(INT.cl&&lz>INT.hd-r-.3&&Math.abs(lx)<INT.cw-r)return lz>INT.hd+INT.cl-r?true:null;   /* 28차: 집 앞 통로 */
 if(lx<-INT.hw+r||lx>INT.hw-r||lz<-INT.hd+r||lz>INT.hd-r)return true;return null}
/* soft, cool light inside whatever the time outside (called at the end of updEnv) */
function intLight(dk){const k=lerp(1,.85,dk);scene.background.setRGB(.016,.02,.024);scene.fog.color.setRGB(.016,.02,.024);scene.fog.near=300;scene.fog.far=600;
 hemi.intensity=.2*k;hemi.color.setRGB(.82,.86,1);hemi.groundColor.setRGB(.25,.28,.4);sun.intensity=.17*k;sun.color.setRGB(.9,.92,1);sun.position.set(INT.x-5,INT.y+15,INT.z+8);sun.target.position.set(INT.x,INT.y,INT.z);pLights.forEach(L=>L.intensity=0)}
/* pick the room for this home (tent / house) */
function intRoom(kind){intBuild();const R=INT_ROOM[kind]||INT_ROOM.tent;INT.kind=INT_ROOM[kind]?kind:'tent';INT.hw=R.hw;INT.hd=R.hd;INT.cw=R.cor?R.cor[0]:0;INT.cl=R.cor?R.cor[1]:0;INT.door=R.hd+INT.cl;for(const k in INT.gr)INT.gr[k].visible=k===INT.kind;INT.L.color.setHex(R.lc);INT.L.distance=R.ld;INT.L.intensity=R.li}
function intEnter(s){if(P.dead||busy)return;const df=sdef(s);fadeDo(df.room==='house'?'집 안으로…':'텐트 안으로…',()=>{intRoom(df.room);setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+df.bz+1.1};INT.s=s;S.home={x:INT.ret.x,z:INT.ret.z};INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.door-.2,yo:INT.y-hAt(INT.x,INT.z+INT.door-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+INT.door-1.75;P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6)})}
/* 텐트 안에 놓은 것(s.in: 작업대)은 들어가 있을 때만 보여요 */
function intShow(on){for(const s of structs)if(s.in&&s.m)s.m.visible=on}
function intOut(){INT.it.forEach(removeStruct);INT.it=[];INT.on=false;INT.dock.hw=0;INT.g.visible=false;intShow(false);P.x=INT.ret.x;P.z=INT.ret.z;P.rot=0;P.auto=null}
function intLeave(){if(busy||!INT.on)return;fadeDo('밖으로…',()=>{intOut();sfx(220,.12,'sine',.05,.6)})}
/* the door stays put at the front middle; going out is only by [나가기] there (15차) */
function intUpd(){}
const intDoorAt=(x,z)=>INT.on&&INT.it[0]&&dist(x,z,INT.it[0].x,INT.it[0].z)<1.7?INT.it[0]:null;   /* 문 근처를 눌렀나 */
