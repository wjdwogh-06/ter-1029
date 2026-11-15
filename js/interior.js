'use strict';
/* ===== 텐트 내부 (롱빈터식) =====
   텐트에 들어가면 맵 구석 바다 위 높은 곳(INT.x, INT.y, INT.z)에 있는 방으로 옮겨져요. 방은 어둠 속에 떠 있는 디오라마:
   - 뒤쪽 박공벽(텐트 모양이 보이는 오각형 벽)과 양옆 벽은 세워 두고, 지붕과 앞벽은 잘라내서 카메라가 안을 들여다봐요.
   - 바닥은 나무 마루. 앞쪽 가운데가 문이에요. 문으로 걸어 나가면(또는 [나가기]) 밖으로 나가요.
   - 안은 비어 있어요(가구는 기획자가 정한 뒤에 들어갈 자리).
   바닥은 addDock 판(들어가 있을 때만 켜짐)이라 groundY가 그대로 동작하고, 벽 충돌은 intWalk가 맡아요. */
const INT={on:false,x:40,z:40,y:60,hw:3.2,hd:2.5,door:.78,H:1.55,peak:2.95,g:null,dock:null,s:null,ret:null,it:[],L:null};
function intBuild(){if(INT.g)return;const W=INT.hw,D=INT.hd,H=INT.H,PK=INT.peak,T=.1;
 const CAN=0xe6d7ae,SEAM=0xd3c296,TUB=0x8c7756,HEM=0xc8642e,POLE=0x41464d,p=[];
 const slab=(pts,depth,col,pos)=>{const s=new THREE.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.translate(0,0,-depth/2);return pt(g,col,pos)};
 const rod=(a,b,r,col)=>{const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length(),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));return pt(cyl(r,r,L,6),col,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[e.x,e.y,e.z])};
 const gTop=x=>H+(PK-H)*(1-Math.abs(x)/(W+T));   /* height of the back gable at x */
 /* ---- floor: a wooden deck floating in the dark (planks with staggered joints, thick front edge) ---- */
 p.push(pt(box(2*W+.5,.34,2*D+.55),0x5a3f28,[0,-.18,.08]),pt(box(2*W+.42,.06,.04),0x6f4e33,[0,-.05,D+.355]));
 const rows=12,pitch=2*D/rows,WOODS=[0xb98a5e,0xa97c52,0xc39467,0xb3845a,0xae7f54];
 for(let r=0;r<rows;r++){const z=-D+pitch*(r+.5);let x=-W-.02;const off=hash(r,3,77)*1.1;let first=true;
  while(x<W){let len=first?.6+off:1.3+hash(r,x*10|0,78)*1.1;first=false;if(x+len>W+.02)len=W+.02-x;if(len>.08)p.push(pt(box(len-.035,.07,pitch-.035),WOODS[(hash(r,x*7|0,79)*WOODS.length)|0],[x+len/2,-.035,z]));x+=len}}
 for(let i=0;i<14;i++){const x=-W+(i+.5)*(2*W/14);p.push(pt(box(2*W/14-.04,.22,.03),i%2?0x6a4a30:0x74523a,[x,-.2,D+.37]))}
 p.push(pt(box(2*INT.door-.1,.035,.34),0x7a5a3c,[0,.0,D-.16]),pt(box(2*INT.door-.3,.16,.42),0x8a6644,[0,-.12,D+.5]),pt(box(2*INT.door-.36,.035,.38),0x9b7650,[0,-.03,D+.5]));
 /* ---- back gable wall: one pentagon slab, so nothing overlaps; seams, bathtub band, mesh window ---- */
 p.push(slab([[-W-T,0],[W+T,0],[W+T,H],[0,PK],[-W-T,H]],T,CAN,[0,0,-D-T/2]));
 p.push(pt(box(2*W,.26,.02),TUB,[0,.13,-D+.011]));
 for(const x of[-1.75,1.75]){const top=gTop(x)-.07;p.push(pt(box(.045,top-.27,.02),SEAM,[x,.27+(top-.27)/2,-D+.012]))}
 {const y=1.45,w=1.24,h=.68;p.push(pt(box(w+.12,h+.12,.022),0xb9a77c,[0,y,-D+.013]),pt(box(w,h,.026),0x34464b,[0,y,-D+.015]));for(let i=1;i<6;i++)p.push(pt(box(.012,h,.03),0x4c6066,[-w/2+i*w/6,y,-D+.017]));for(let i=1;i<3;i++)p.push(pt(box(w,.012,.03),0x4c6066,[0,y-h/2+i*h/3,-D+.017]));
  p.push(pt(cyl(.075,.075,w+.1,8),SEAM,[0,y+h/2+.13,-D+.08],[0,0,Math.PI/2]),pt(box(.05,.3,.02),HEM,[-.38,y+h/2+.06,-D+.16]),pt(box(.05,.3,.02),HEM,[.38,y+h/2+.06,-D+.16]))}
 /* ---- side walls (vertical, cut at the eave) ---- */
 for(const sx of[-1,1]){const x=sx*(W+T/2);p.push(pt(box(T,H,2*D+.02),CAN,[x,H/2,.01]),pt(box(.02,.26,2*D),TUB,[sx*(W-.011),.13,0]));
  for(const z of[-.85,.85])p.push(pt(box(.02,H-.34,.045),SEAM,[sx*(W-.012),.27+(H-.34)/2,z]));
  p.push(pt(box(T+.03,.045,2*D+.1),HEM,[x,H+.022,.02]))}
 /* ---- front lip with the doorway; door posts with a zip strip ---- */
 for(const sx of[-1,1]){const a=INT.door,len=W+T-a,cx=sx*(a+len/2);p.push(pt(box(len,.34,T),CAN,[cx,.17,D+T/2]),pt(box(len+.02,.045,T+.03),HEM,[cx,.362,D+T/2]),pt(box(len,.12,.02),TUB,[cx,.06,D-.011]));
  p.push(pt(box(.13,.66,.14),HEM,[sx*(a+.04),.33,D+T/2]),pt(box(.03,.6,.02),0x2b2f36,[sx*(a-.03),.33,D-.03]),pt(cyl(.07,.07,.5,8),SEAM,[sx*(a+.2),.72,D+.12],[Math.PI/2,0,0]))}
 /* ---- frame: aluminium poles at the corners, along the eaves and up the gable; hems on every cut edge ---- */
 for(const sx of[-1,1]){p.push(rod([sx*(W-.04),0,-D+.05],[sx*(W-.04),H,-D+.05],.035,POLE),rod([sx*(W-.04),0,D-.05],[sx*(W-.04),H,D-.05],.035,POLE),rod([sx*(W-.04),H-.02,-D+.05],[sx*(W-.04),H-.02,D-.05],.03,POLE),rod([sx*(W-.04),H,-D+.05],[0,PK-.05,-D+.05],.035,POLE));
  const L=Math.hypot(W+T,PK-H),ang=Math.atan2(PK-H,W+T);p.push(pt(box(L+.04,.05,T+.03),HEM,[sx*(W+T)/2,(H+PK)/2+.024,-D-T/2],[0,0,-sx*ang]))}
 p.push(pt(cyl(.075,.075,.14,8),POLE,[0,PK-.02,-D-.01],[Math.PI/2,0,0]));
 const G=INT.g=new THREE.Group();G.position.set(INT.x,INT.y,INT.z);const room=mesh(mg(p),MATT);room.castShadow=true;room.receiveShadow=true;G.add(room);
 const bk=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshBasicMaterial({color:0x07090b,fog:false}));bk.rotation.x=-Math.PI/2;bk.position.y=-1.2;G.add(bk);
 const L=INT.L=new THREE.PointLight(0xffd6a0,.75,14,1.6);L.position.set(0,2.4,.8);G.add(L);G.visible=false;scene.add(G);
 INT.dock=addDock(INT.x,INT.z,0,INT.hw+2,INT.hd+2,INT.y);INT.full=INT.dock.hw;INT.dock.hw=0;
 Object.assign(DECO,{int_exit:{g:'nil',s:1,bx:.7,bz:.3,pass:1}})}
/* camera inside: fit the whole room (door included) on any screen shape, above the hotbar, barely following the player */
function intCam(ct){const t=Math.tan(cam.fov*Math.PI/360),dw=8.1/(2*t*cam.aspect),dh=9.4/(2*t),d=Math.max(dw,dh),a=.72,fx=INT.x+(ct.x-INT.x)*.12,fz=INT.z+(ct.z-INT.z)*.08;
 cam.position.set(fx,INT.y+.9+Math.sin(a)*d,fz+.75+Math.cos(a)*d);cam.lookAt(fx,INT.y+.9,fz+.75)}
/* walls: only the doorway in the middle of the front lets you through */
function intWalk(x,z,r){const lx=x-INT.x,lz=z-INT.z;if(lx<-INT.hw+r||lx>INT.hw-r||lz<-INT.hd+r)return true;if(lz>INT.hd-r&&(Math.abs(lx)>INT.door-r||lz>INT.hd+.75))return true;return null}
/* warm, steady light inside whatever the time outside (called at the end of updEnv) */
function intLight(dk){const k=lerp(1,.82,dk);scene.background.setRGB(.027,.035,.043);scene.fog.color.setRGB(.027,.035,.043);scene.fog.near=300;scene.fog.far=600;
 hemi.intensity=.66*k;hemi.color.setRGB(1,.94,.84);hemi.groundColor.setRGB(.42,.33,.25);sun.intensity=.62*k;sun.color.setRGB(1,.92,.8);sun.position.set(INT.x-7,INT.y+15,INT.z+9);sun.target.position.set(INT.x,INT.y,INT.z);pLights.forEach(L=>L.intensity=0)}
function intEnter(s){if(P.dead||busy)return;fadeDo('텐트 안으로…',()=>{intBuild();setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+sdef(s).bz+1.1};INT.s=s;S.home={x:INT.ret.x,z:INT.ret.z};INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.hd-.25,yo:INT.y-hAt(INT.x,INT.z+INT.hd-.25),hp:1e9})];
  P.x=INT.x;P.z=INT.z+1.35;P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6)})}
function intOut(){INT.it.forEach(removeStruct);INT.it=[];INT.on=false;INT.dock.hw=0;INT.g.visible=false;P.x=INT.ret.x;P.z=INT.ret.z;P.rot=0;P.auto=null}
function intLeave(){if(busy||!INT.on)return;fadeDo('밖으로…',()=>{intOut();sfx(220,.12,'sine',.05,.6)})}
/* walking out through the doorway takes you outside */
function intUpd(){if(INT.on&&!busy&&!P.dead&&P.z-INT.z>INT.hd+.3)intLeave()}
