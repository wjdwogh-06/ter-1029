'use strict';
/* ===== 텐트 내부 (롱빈터식, 단순하게) =====
   텐트에 들어가면 맵 구석 바다 위 높은 곳(INT.x, INT.y, INT.z)에 있는 방으로 옮겨져요. 기획자가 준 롱빈터 참고 화면처럼:
   - 까만 어둠 속에 파란 바닥 한 장(가운데가 조명으로 밝음), 뒤쪽에 둥근 연보라 벽 하나(반구의 뒷쪽 절반). 옆벽·지붕·장식 없음.
   - 안은 비어 있어요(가구는 기획자가 정한 뒤에).
   - 앞쪽 가장자리로 걸어 나가면(또는 [나가기]) 밖으로 나가요.
   바닥은 addDock 판(들어가 있을 때만 켜짐)이라 groundY가 그대로 동작하고, 가장자리 충돌은 intWalk가 맡아요. */
const INT={on:false,x:40,z:40,y:60,hw:3.2,hd:2.8,g:null,dock:null,s:null,ret:null,it:[],L:null};
function intBuild(){if(INT.g)return;const W=INT.hw,D=INT.hd,G=INT.g=new THREE.Group();G.position.set(INT.x,INT.y,INT.z);
 /* floor: one smooth blue sheet (many vertices so the light pools softly in the middle), thin edge */
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(2*W,2*D,24,24),new THREE.MeshLambertMaterial({color:0x2d58a6}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;G.add(fl);
 const ed=new THREE.Mesh(new THREE.BoxGeometry(2*W,.08,2*D),new THREE.MeshLambertMaterial({color:0x1d3a70}));ed.position.y=-.041;G.add(ed);
 /* back wall: the back half of a dome standing on the back edge, pale lavender, soft glow, a stitched seam just inside the rim */
 const dm=new THREE.Mesh(new THREE.SphereGeometry(W,40,18,Math.PI,Math.PI,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xcfbcf6,emissive:0x3a2a6a,side:THREE.DoubleSide}));dm.position.z=-D;dm.receiveShadow=true;G.add(dm);
 const db=new THREE.Mesh(new THREE.CircleGeometry(W,40,0,Math.PI),new THREE.MeshLambertMaterial({color:0xcfbcf6,emissive:0x3a2a6a}));db.rotation.x=-Math.PI/2;db.position.set(0,.003,-D);G.add(db);   /* the dome's own floor, so the arch reads as one solid wall */
 const seam=new THREE.Mesh(new THREE.TorusGeometry(W-.13,.014,4,64,Math.PI),new THREE.MeshBasicMaterial({color:0xa995dc}));seam.position.set(0,0,-D+.03);G.add(seam);
 const rim=new THREE.Mesh(new THREE.BoxGeometry(2*W,.03,.05),new THREE.MeshBasicMaterial({color:0xcbb8f0}));rim.position.set(0,.015,-D+.02);G.add(rim);
 /* pegs: tan at the back corners, dark stakes at the front corners */
 const pm=new THREE.MeshLambertMaterial({color:0xb08a5a}),sm=new THREE.MeshLambertMaterial({color:0x1d2330});for(const sx of[-1,1]){const pg=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.14),pm);pg.position.set(sx*(W-.06),.05,-D+.06);G.add(pg);const st=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.05,10),sm);st.position.set(sx*(W-.08),.025,D-.08);G.add(st)}
 const bk=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshBasicMaterial({color:0x040506,fog:false}));bk.rotation.x=-Math.PI/2;bk.position.y=-1.2;G.add(bk);
 const L=INT.L=new THREE.PointLight(0xe8efff,1.7,7.6,2);L.position.set(0,2.5,.5);G.add(L);G.visible=false;scene.add(G);
 INT.dock=addDock(INT.x,INT.z,0,INT.hw+2,INT.hd+2,INT.y);INT.full=INT.dock.hw;INT.dock.hw=0;
 Object.assign(DECO,{int_exit:{g:'nil',s:1,bx:.7,bz:.3,pass:1}})}
/* camera inside: fit the whole room (front edge included) on any screen shape, above the hotbar, barely following the player */
function intCam(ct){const t=Math.tan(cam.fov*Math.PI/360),dw=8.1/(2*t*cam.aspect),dh=9.4/(2*t),d=Math.max(dw,dh),a=.72,fx=INT.x+(ct.x-INT.x)*.12,fz=INT.z+(ct.z-INT.z)*.08;
 cam.position.set(fx,INT.y+.9+Math.sin(a)*d,fz+.75+Math.cos(a)*d);cam.lookAt(fx,INT.y+.9,fz+.75)}
/* edges: left, right and back stop you; the whole front edge is the way out */
function intWalk(x,z,r){const lx=x-INT.x,lz=z-INT.z;if(lx<-INT.hw+r||lx>INT.hw-r||lz<-INT.hd+r||lz>INT.hd+.75)return true;return null}
/* soft, cool light inside whatever the time outside (called at the end of updEnv) */
function intLight(dk){const k=lerp(1,.85,dk);scene.background.setRGB(.016,.02,.024);scene.fog.color.setRGB(.016,.02,.024);scene.fog.near=300;scene.fog.far=600;
 hemi.intensity=.2*k;hemi.color.setRGB(.82,.86,1);hemi.groundColor.setRGB(.25,.28,.4);sun.intensity=.17*k;sun.color.setRGB(.9,.92,1);sun.position.set(INT.x-5,INT.y+15,INT.z+8);sun.target.position.set(INT.x,INT.y,INT.z);pLights.forEach(L=>L.intensity=0)}
function intEnter(s){if(P.dead||busy)return;fadeDo('텐트 안으로…',()=>{intBuild();setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+sdef(s).bz+1.1};INT.s=s;S.home={x:INT.ret.x,z:INT.ret.z};INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.hd-.2,yo:INT.y-hAt(INT.x,INT.z+INT.hd-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+1.6;P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6)})}
function intOut(){INT.it.forEach(removeStruct);INT.it=[];INT.on=false;INT.dock.hw=0;INT.g.visible=false;P.x=INT.ret.x;P.z=INT.ret.z;P.rot=0;P.auto=null}
function intLeave(){if(busy||!INT.on)return;fadeDo('밖으로…',()=>{intOut();sfx(220,.12,'sine',.05,.6)})}
/* walking off the front edge takes you outside */
function intUpd(){if(!INT.on)return;const ex=INT.it[0];if(ex)ex.x=clamp(P.x,INT.x-INT.hw+.5,INT.x+INT.hw-.5);   /* [나가기] follows you along the front edge */
 if(!busy&&!P.dead&&P.z-INT.z>INT.hd+.3)intLeave()}
