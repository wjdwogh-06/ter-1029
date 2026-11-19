'use strict';
/* ===== 특별한 곳 (기획자 요청 7·8차) =====
   1) 까마귀섬 낚시섬(FISHISLE 둘레, 메모1 x=137 z=135): 바닷가 낚시 캠프. 땅 모양 따라 굽은 흰 철조망(양 끝은 바닷물까지) + 앞쪽 철조망 문
      (누르면 열리고 4초 뒤 닫힘, 지금은 누구나) + 나무 데크·바다로 뻗은 잔교·묶인 배 + 판자 낚시 오두막 + 판매대 뒤 낚시섬 주인 + 덕장·그물·생선 상자
      + 모닥불과 통나무 의자 + 징검돌 길 + 줄 전구. 나중에 '낚시 도감을 다 채우면 들어오는 곳'이 될 자리
   2) 물개섬 특수 보급지(SPSUP, x=718 z=849): 층층이 쌓인 바위 절벽 언덕. 앞 흙 경사로로 올라가서, 안쪽 돌계단으로 파인 분지로 내려가면 특수 보급.
   땅(분지 파기·둘레 다지기)과 걷는 높이(spSurf)는 core.js, 여기서는 모양(메시)·벽·구조물·문·주인 */
const PLACES=[{k:'fish',n:'낚시섬',x:FISHISLE.x-3,z:FISHISLE.z-6,c:'#3fb6e0'},{k:'sp',n:'특수 보급지',x:SPSUP.x,z:SPSUP.z,c:'#ff7a3d'}];
let FNPC=null;   /* 낚시섬 주인 {a,x,z,rot,i} */
const FNPC_LINES=['어서 와요! 여긴 낚시꾼들의 섬이에요.','오늘은 물때가 좋네요. 등대 앞바다엔 큰 놈이 살아요.','도감은 잘 채우고 있어요? 다 채우면 꼭 보여 줘요.'];
DECO.cgate={g:'pl_cgate',s:1,bx:1.25,bz:.16,hp:1e9};   /* 철조망 문: 닫혀 있을 때만 막혀요(s.open, world.js inStruct) */
DECO.fstall={g:'nil',s:1,bx:1.3,bz:.42,hp:1e9};       /* 판매대 자리: [말 걸기] (모양은 데크 높이에 따로 그려요) */
DECO.iblk={g:'nil',s:1,bx:.95,bz:.4,hp:1e9};          /* 보이지 않는 벽(절벽·울타리) */
DECO.iblk2={g:'nil',s:1,bx:.42,bz:.42,hp:1e9};        /* 주인 자리 */
DECO.spsupply={g:'pl_spcrate',s:1,bx:.66,bz:.53,loot:4,og:'pl_spcrate_open',cd:5};   /* 특수 보급 상자: 열면 5일 뒤 다시 채워져요 */
DECO.spbeacon={g:'pl_beacon',s:1,bx:.22,bz:.22,hp:1e9};
const PLB=(bx,bz)=>{const k='pb_'+bx.toFixed(2)+'_'+bz.toFixed(2);if(!DECO[k])DECO[k]={g:'nil',s:1,bx,bz,hp:1e9};return k};   /* 크기별 보이지 않는 충돌 상자 */
let _plm2=null;const PLM2=()=>_plm2||(_plm2=Object.assign(MATT.clone(),{side:THREE.DoubleSide}));
const PLC=new THREE.Color();
const plCol=(hex,k=1)=>{PLC.setHex(hex).convertSRGBToLinear();return[PLC.r*k,PLC.g*k,PLC.b*k]};

/* ---------- 메시 조립 도구: 삼각형마다 원하는 방향(dir)을 보고 감는 순서를 맞춰요(뒤집힘 걱정 없음) ---------- */
function PLGeo(){this.p=[];this.c=[]}
PLGeo.prototype.tri=function(a,b,c,ca,cb,cc,dir){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
 if(dir&&nx*dir[0]+ny*dir[1]+nz*dir[2]<0){const t=b;b=c;c=t;const tc=cb;cb=cc;cc=tc}this.p.push(...a,...b,...c);this.c.push(...ca,...cb,...cc)};
PLGeo.prototype.quad=function(a,b,c,d,ca,cb,cc,cd,dir){this.tri(a,b,c,ca,cb,cc,dir);this.tri(a,c,d,ca,cc,cd,dir)};
PLGeo.prototype.build=function(smooth){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeVertexNormals();if(smooth&&typeof lkSmooth==='function')lkSmooth(g,smooth);g.computeBoundingSphere();return g};
const plWave=(t,sd,amp)=>amp*(.5*Math.sin(6.283*(3*t)+sd*1.7)+.3*Math.sin(6.283*(7*t)+sd*3.1)+.2*Math.sin(6.283*(13*t)+sd*5.3));   /* 둘레를 따라 부드럽게 울퉁불퉁 */
/* 바위 색: 층마다 조금씩, 점마다 살짝 */
const plRock=(band,i,k=1)=>{const H=[0x6d6a78,0x84818e,0x938f9c,0x9f9ca7][band],v=.9+hash(i,band*7+3,61)*.2;return plCol(H,v*k)};

/* ---------- 모델: 문·상자·신호등 ---------- */
function plGeoParts(){const R=(w,h,d,c,b)=>typeof lkRb==='function'?lkRb(w,h,d,c,b):box(w,h,d),LM=typeof lkModel==='function';
 const PO=0xe9ecef,WI=0xd3d9df,WD2=0xa5622f,CR=0xf0d9a8,NV=0x2e3754,GD=0xe9c046;
 {const base=[];for(const x of[-1.32,1.32])base.push(pt(R(.22,3.15,.22,.06,.04),WD2,[x,1.575,0]),pt(R(.3,.1,.3,.04,.03),0x8e5226,[x,3.18,0]));
  base.push(pt(R(3.2,.72,.14,.12,.05),0xd99a5c,[0,2.78,.02]),pt(R(2.96,.52,.04,.08,.02),CR,[0,2.78,.1]));
  const leaf=[pt(R(2.42,.09,.09,.035,.02),PO,[1.25,1.82,0]),pt(R(2.42,.09,.09,.035,.02),PO,[1.25,.16,0]),pt(R(.09,1.74,.09,.035,.02),PO,[.07,.99,0]),pt(R(.09,1.74,.09,.035,.02),PO,[2.43,.99,0]),
   ...(typeof lkLattice==='function'?lkLattice(2.3,1.6,.1,.18,0,.3,WI,.03):[]),pt(R(.08,.26,.08,.03,.02),GD,[2.25,1.0,.06])];
  if(LM)lkModel('pl_cgate',base,{leaf:{g:leaf,pv:[-1.25,0,0]}});else GEO.pl_cgate=mg(base.concat(leaf))}
 {/* 특수 보급 상자(디자인 7차): 나무 받침 위 남색 철제 수송 궤짝. 가로 주름 철판, 금색 모서리 보강·걸쇠, 주황 화물 끈, 뚜껑에 흰 스텐실. 앞 불빛 띠(조각 `glow`)는 그대로. 크기·충돌 그대로 */
  const NV2=0x24304a,OR=0xf08a3c,WH=0xe9e4d6,DK=0x1c2436,body=[pt(box(1.3,.08,.16),0xa9753f,[0,.04,-.34]),pt(box(1.3,.08,.16),0xa9753f,[0,.04,.34]),pt(box(1.22,.84,.98),NV,[0,.52,0])];
  for(let k=0;k<4;k++)body.push(pt(box(1.25,.035,1.0),NV2,[0,.26+k*.17,0]));
  for(const sx of[-1,1])for(const sz of[-1,1]){body.push(pt(box(.07,.86,.07),GD,[sx*.6,.52,sz*.48]));for(const y of[.14,.9])body.push(pt(box(.2,.07,.03),GD,[sx*.52,y,sz*.495]),pt(box(.03,.07,.2),GD,[sx*.615,y,sz*.4]))}
  for(const sx of[-1,1])body.push(pt(box(.03,.07,.3),DK,[sx*.635,.62,0]),pt(box(.05,.04,.04),DK,[sx*.63,.62,.15]),pt(box(.05,.04,.04),DK,[sx*.63,.62,-.15]),pt(box(.12,.16,.03),GD,[sx*.36,.84,.5]),pt(box(.06,.05,.02),DK,[sx*.36,.8,.52]));
  body.push(pt(box(.7,.18,.02),DK,[0,.5,.495]),pt(box(.2,.2,.012),WH,[-.42,.3,.497]),pt(box(.12,.03,.006),NV,[-.42,.33,.505]),pt(box(.08,.03,.006),NV,[-.44,.28,.505]));
  const strap=z=>[pt(box(.09,.02,1.02),OR,[.22,z?z:1.03,0]),pt(box(.09,.86,.02),OR,[.22,.52,.5]),pt(box(.09,.86,.02),OR,[.22,.52,-.5]),pt(box(.13,.09,.035),0x8f99a4,[.22,.7,.515])];
  const lid=[pt(box(1.28,.1,1.04),NV2,[0,.97,0]),pt(box(1.32,.04,1.08),GD,[0,.93,0]),pt(box(.3,.03,.3),WH,[-.3,1.025,.06],[0,.2,0]),pt(box(.15,.035,.15),NV2,[-.3,1.03,.06],[0,.2+Math.PI/4,0]),pt(box(.07,.04,.07),GD,[-.3,1.03,.06],[0,.2+Math.PI/4,0]),...strap().slice(0,1)],glow=[pt(box(.6,.1,.02),0xffb547,[0,.5,.51])];
  if(LM)lkModel('pl_spcrate',body.concat(strap().slice(1),lid),{glow:{g:glow,pv:[0,0,0],glow:true}});else GEO.pl_spcrate=mg(body.concat(strap().slice(1),lid,glow));
  /* 열린 모습: 뚜껑은 뒤로 젖히고, 안에 짚 + 탄통 + 천 꾸러미, 끈은 풀려 앞에 늘어짐 */
  const g=mg(body.concat([pt(box(1.28,.1,1.04),NV2,[0,1.2,-.78],[1.15,0,0]),pt(box(1.32,.04,1.08),GD,[0,1.18,-.74],[1.15,0,0]),pt(box(1.14,.04,.9),0xd9b860,[0,.9,0]),pt(box(.3,.16,.2),0x6f7a4a,[-.3,.98,.1],[0,.3,0]),pt(box(.3,.16,.2),0x6f7a4a,[.05,.98,-.15],[0,-.2,0]),pt(box(.34,.12,.3),0xc9b28a,[.34,.96,.16],[0,.4,0]),pt(box(.09,.02,.5),OR,[.22,.02,.78],[0,.3,0]),pt(box(.09,.5,.02),OR,[.22,.3,.52],[-.12,0,0])]));
  if(typeof lkSmooth==='function')lkSmooth(g,50);if(typeof lkAO==='function'&&LM)lkAO(g);GEO.pl_spcrate_open=g;if(LM&&typeof lkAO==='function')for(const k of['pl_spcrate','pl_spcrate_b'])if(GEO[k])lkAO(GEO[k])}
 {const base=[pt(R(.5,.16,.5,.05,.04),0x6a7078,[0,.08,0]),pt(R(.12,3.1,.12,.04,.03),0x3f4450,[0,1.6,0]),pt(R(.5,.32,.03,.03,.01),0xff7a3d,[.3,2.9,0])],gl=[pt(new THREE.SphereGeometry(.17,12,8),0xffa24a,[0,3.25,0])];
  if(LM)lkModel('pl_beacon',base,{glow:{g:gl,pv:[0,0,0],glow:true}});else GEO.pl_beacon=mg(base.concat(gl))}}
function plSignText(txt,w=2.7,h=.5,px=74){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;
 const draw=()=>{const x=cv.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle='#4a2f20';x.font=`900 ${px}px `+(typeof UIF!=='undefined'?UIF:'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,52);tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}
const plAdd=(g,x,y,z,ry=0,m)=>{const o=mesh(g,m||MATT);o.position.set(x,y,z);o.rotation.y=ry;scene.add(o);return o};
const plWallAlong=(pts,step,skip)=>{let acc=step;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let u=0;u<L;u+=.25){acc+=.25;if(acc>=step){acc=0;const x=a[0]+(b[0]-a[0])*u/L,z=a[1]+(b[1]-a[1])*u/L;if(!skip||!skip(x,z))addStruct({t:'iblk',x,z,r:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),hp:1e9})}}}};

/* ========== 2) 물개섬 특수 보급지: 바위 분지 (9차: 크게, 경사로·계단 옆모습) ========== */
/* 모서리 둥근 직사각형 둘레 N점(가운데 기준): {x,z,nx,nz,t} */
function plRRect2(ax,az,c,N){const sx=ax-c,sz=az-c,q=Math.PI*c/2,arc=(cx,cz,a0)=>u=>{const th=a0+u/c;return{x:cx+c*Math.cos(th),z:cz+c*Math.sin(th),nx:Math.cos(th),nz:Math.sin(th)}};
 const S=[[2*sz,u=>({x:ax,z:-sz+u,nx:1,nz:0})],[q,arc(sx,sz,0)],[2*sx,u=>({x:sx-u,z:az,nx:0,nz:1})],[q,arc(-sx,sz,Math.PI/2)],[2*sz,u=>({x:-ax,z:sz-u,nx:-1,nz:0})],[q,arc(-sx,-sz,Math.PI)],[2*sx,u=>({x:-sx+u,z:-az,nx:0,nz:-1})],[q,arc(sx,-sz,1.5*Math.PI)]],L=S.reduce((a,s)=>a+s[0],0),out=[];
 for(let i=0;i<N;i++){let u=i/N*L,p=null;for(const [l,f] of S){if(u<=l){p=f(u);break}u-=l}if(!p)p={x:ax,z:-sz,nx:1,nz:0};p.t=i/N;out.push(p)}return out}
/* 축에 맞춘 보이지 않는 벽 한 줄(1.8m 조각으로 나눠요: inStruct는 6m 안의 구조물만 봐요) */
function plWallSeg(ax,az,bx,bz,th=.4){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/1.8)),r=Math.atan2(-(bz-az),bx-ax),k=PLB(L/n/2+.05,th);for(let i=0;i<n;i++){const t=(i+.5)/n;addStruct({t:k,x:ax+(bx-ax)*t,z:az+(bz-az)*t,r,hp:1e9})}}
const plWood=0x8a5a36,plWoodD=0x6f4a2c,plRope=0xd9c49a;
/* 기울어진 막대(난간·줄): a→b */
function plBar(p,a,b,w,c){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),v=new THREE.Vector3(dx,dy,dz).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),v),e=new THREE.Euler().setFromQuaternion(q);
 p.push(pt(lkRb(L+.02,w,w,Math.min(.03,w/3),.02),c,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[e.x,e.y,e.z]))}
/* 처지는 밧줄 */
function plSag(p,a,b,sag=.12,c=plRope,w=.035){let prev=a;for(let k=1;k<=4;k++){const t=k/4,q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,a[2]+(b[2]-a[2])*t];plBar(p,prev,q,w,c);prev=q}}
/* 감시탑(나무 다리 넷 + X 버팀 + 마루 + 난간 + 초록 천 지붕 + 사다리) */
function plTowerGeo(){const p=[],W=plWood,D=plWoodD,s=.8,H=3.3;
 for(const x of[-s,s])for(const z of[-s,s])p.push(pt(lkRb(.17,5.0,.17,.05,.03),W,[x,2.5,z]));
 for(const [y0,y1] of [[.25,1.75],[1.75,3.2]]){plBar(p,[-s,y0,s+.03],[s,y1,s+.03],.07,D);plBar(p,[s,y0,s+.03],[-s,y1,s+.03],.07,D);plBar(p,[s+.03,y0,-s],[s+.03,y1,s],.07,D);plBar(p,[s+.03,y0,s],[s+.03,y1,-s],.07,D);plBar(p,[-s-.03,y0,-s],[-s-.03,y1,s],.07,D);plBar(p,[-s-.03,y0,s],[-s-.03,y1,-s],.07,D)}
 const tone=[0xb98556,0xa67848,0xc08d5c];for(let k=0;k<7;k++)p.push(pt(lkRb(.3,.12,2.1,.03,.02),tone[k%3],[-.9+k*.3,H,0]));
 for(const y of[H+.45,H+.9]){p.push(pt(lkRb(1.9,.08,.08,.03,.02),D,[0,y,-s]),pt(lkRb(.08,.08,1.9,.03,.02),D,[s,y,0]),pt(lkRb(.08,.08,1.9,.03,.02),D,[-s,y,0]),pt(lkRb(.6,.08,.08,.03,.02),D,[-.5,y,s]),pt(lkRb(.6,.08,.08,.03,.02),D,[.5,y,s]))}
 p.push(pt(cone(1.6,.85,4),0x5c7a3c,[0,5.4,0],[0,Math.PI/4,0]),pt(lkRb(2.05,.08,2.05,.03,.02),0x4f6a34,[0,5.0,0]),pt(new THREE.SphereGeometry(.08,8,6),0xd9c49a,[0,5.86,0]));
 for(const x of[-.27,.27])p.push(pt(lkRb(.07,H+.05,.07,.02,.02),D,[x,H/2,s+.28],[-.08,0,0]));for(let y=.35;y<H;y+=.36)p.push(pt(lkRb(.6,.05,.06,.02,.01),W,[0,y,s+.28-y*.08]));
 return mg(p)}
/* 위장망 그늘(기둥 넷 + 처진 망) */
function plShadeGeo(w,d,h){const p=[];for(const x of[-w/2,w/2])for(const z of[-d/2,d/2])p.push(pt(cyl(.05,.06,h,8),0x5a5f66,[x,h/2,z]));
 const g=new PLGeo(),nx=8,nz=6,C=[0x5f7a3a,0x7d8a4a,0x8a7a4f,0x4f6a34],P=(i,j)=>{const u=i/nx,v=j/nz;return[-w/2-.15+(w+.3)*u,h+.03-.28*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+(hash(i,j,41)-.5)*.05,-d/2-.15+(d+.3)*v]},cl=(i,j)=>plCol(C[Math.min(3,(hash(i>>1,j>>1,43)*4)|0)],.92+hash(i,j,44)*.16);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)g.quad(P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1),cl(i,j),cl(i+1,j),cl(i+1,j+1),cl(i,j+1),[0,1,0]);
 return{poles:mg(p),net:g.build(30)}}
/* 접이식 탁자 + 지도 + 무전기 + 의자 */
function plTableGeo(){const p=[pt(lkRb(1.6,.07,.8,.03,.02),0x7d6a4f,[0,.78,0]),pt(lkRb(.62,.012,.46,.01,.005),0xe8dcb8,[-.3,.82,.05]),pt(lkRb(.16,.014,.16,.01,.005),0xff7a3d,[-.24,.83,.08])];
 for(const x of[-.72,.72])for(const z of[-.32,.32])p.push(pt(lkRb(.06,.78,.06,.02,.01),0x4a4f57,[x,.39,z]));
 if(GEO.radio)p.push(pt(GEO.radio,null,[.42,.81,-.05],[0,-.3,0],[.85,.85,.85]));
 for(const [x,z] of[[-.35,.75],[.5,.7]])p.push(pt(cyl(.19,.17,.06,12),0x5a5f66,[x,.46,z]),pt(cyl(.03,.03,.44,6),0x4a4f57,[x,.22,z]));return mg(p)}
/* 모래주머니 줄(아래 n개 + 위 n-1개) */
function plSandbagGeo(n){const p=[],C=[0xb9a77c,0xae9c70,0xc2b088];for(let r=0;r<2;r++){const m=n-r;for(let k=0;k<m;k++)p.push(pt(lkRb(.6,.25,.38,.11,.07),C[(k+r*2)%3],[(k-(m-1)/2)*.58,.13+r*.23,(hash(k,r,51)-.5)*.05],[0,(hash(k,r,52)-.5)*.12,0]))}const g=mg(p);lkSmooth(g,50);return g}
/* 깃대 + 주황 깃발 */
function plFlagGeo(){const p=[pt(cyl(.05,.065,4.6,10),0xd8dde2,[0,2.3,0]),pt(new THREE.SphereGeometry(.09,10,7),0xe9c046,[0,4.65,0]),pt(lkRb(.36,.14,.36,.04,.03),0x6a7078,[0,.07,0])];
 const g=new PLGeo(),n=8,F=(i,j)=>[.06+1.35*i/n,4.45-.82*j/2,Math.sin(i/n*Math.PI*1.6)*.12*(i/n)],cl=(i,j)=>j===1&&false?0:plCol(0xff7a3d,.95);
 for(let i=0;i<n;i++)for(let j=0;j<2;j++){const c=j===0?plCol(0xff7a3d):plCol(0xff8f55);g.quad(F(i,j),F(i+1,j),F(i+1,j+1),F(i,j+1),c,c,c,c,[0,0,1])}
 return{pole:mg(p),cloth:g.build()}}
/* 길쭉한 주황 고깔 */
function plConeGeo(){return mg([pt(lkRb(.38,.05,.38,.04,.02),0xff7a3d,[0,.025,0]),pt(cyl(.035,.15,.5,10),0xff7a3d,[0,.3,0]),pt(cyl(.085,.11,.09,10),0xf4f4f4,[0,.27,0]),pt(cyl(.06,.075,.06,10),0xf4f4f4,[0,.44,0])])}
/* 노란 경고 간판(나무 기둥 둘) */
function plBoardGeo(w=2.5,h=.78){return mg([...[-w/2+.2,w/2-.2].map(x=>pt(lkRb(.13,1.55,.13,.04,.03),plWood,[x,.78,-.04])),pt(lkRb(w+.12,h+.12,.08,.06,.03),0x3a3f4a,[0,1.32,0]),pt(lkRb(w,h,.1,.05,.03),0xf2c94c,[0,1.32,.02]),
 ...[0,1,2,3,4,5,6,7].map(k=>pt(lkRb(.18,.1,.11,.02,.01),k%2?0x3a3f4a:0xf2c94c,[-w/2+.15+k*(w-.3)/7,.95,.03]))])}

function plCrater(){const S2=SPSUP,R=S2.rp,T=S2.st,X=S2.x,Z=S2.z,G=S2.h,Hr=G+S2.top,Hb=G-S2.dig,N=208,UP=[0,1,0];
 const O=plRRect2(S2.AX,S2.AZ,S2.ac,N),I=plRRect2(S2.BX,S2.BZ,S2.bc,N);
 const fo=p=>p.nz>.7&&p.x>R.x0-1.4&&p.x<R.x2+.9?.1:1,fi=p=>p.nz<-.7&&p.x>T.x0-.9&&p.x<T.x2+.9?.08:1;   /* 경사로·계단이 붙는 곳은 절벽을 곧게 */
 const ringO=(off,y,band,sd)=>O.map((p,i)=>{const k=fo(p),o=(off+plWave(p.t,sd,.18)+(hash(i,band,71)-.5)*.1)*k;return[X+p.x+p.nx*o,y+plWave(p.t,sd+9,.07)*k,Z+p.z+p.nz*o]});
 const ringI=(off,y,band,sd)=>I.map((p,i)=>{const k=fi(p),o=(off+plWave(p.t,sd,.13)+(hash(i,band,73)-.5)*.08)*k;return[X+p.x+p.nx*o,y+plWave(p.t,sd+9,.06)*k,Z+p.z+p.nz*o]});
 const g=new PLGeo();
 const band=(rings,cols,outward,isIn)=>{for(let r=0;r<rings.length-1;r++){const A=rings[r],B=rings[r+1];for(let i=0;i<N;i++){const j=(i+1)%N,P=isIn?I[i]:O[i],dir=outward?[P.nx,0,P.nz]:[-P.nx,0,-P.nz];
   const lip=Math.abs(A[i][1]-B[i][1])<.15;g.quad(A[i],A[j],B[j],B[i],cols(r,i),cols(r,j),cols(r+1,j),cols(r+1,i),lip?UP:dir)}}};
 /* 바깥 절벽: 아래가 넓고 위로 좁아지는 세 층 + 층마다 턱 */
 {const L=[[G-.35,.66,0],[G+.52,.54,0],[G+.52,.34,1],[G+1.24,.26,1],[G+1.24,.13,2],[Hr-.02,0,2]],rs=L.map(q=>ringO(q[1],q[0],q[2],q[2]*2+1)),bk=L.map(q=>q[2]);
  band(rs,(r,i)=>r===5?plCol(0x8c9a6a,.95+hash(i,9,5)*.1):r===2||r===4?plRock(bk[r],i,1.12):plRock(bk[r],i),true,false)}
 /* 안쪽 절벽(분지 쪽을 봄) */
 {const L=[[Hb-.3,-.5,0],[Hb+.74,-.4,0],[Hb+.74,-.26,1],[Hb+1.64,-.18,1],[Hb+1.64,-.08,2],[Hr-.02,0,2]],rs=L.map(q=>ringI(q[1],q[0],q[2],q[2]*2+5)),bk=L.map(q=>q[2]);
  band(rs,(r,i)=>r===5?plCol(0x8c9a6a,.95+hash(i,11,5)*.1):r===2||r===4?plRock(bk[r],i,1.1):plRock(bk[r],i,.95),false,true)}
 scene.add(mesh(g.build(48),PLM2()));
 /* 꼭대기 풀(TERR) + 가장자리 늘어뜨림 */
 {const t=new PLGeo(),Ot=O.map(p=>{const o=(.14+plWave(p.t,1,.16))*fo(p);return[X+p.x+p.nx*o,Hr,Z+p.z+p.nz*o]}),It=I.map(p=>{const o=(-.1+plWave(p.t,5,.12))*fi(p);return[X+p.x+p.nx*o,Hr,Z+p.z+p.nz*o]});
  const gc=i=>plCol(0x74b545,.92+hash(i,2,9)*.16);for(let i=0;i<N;i++){const j=(i+1)%N;t.quad(It[i],It[j],Ot[j],Ot[i],gc(i),gc(j),gc(j),gc(i),UP)}
  const cap=mesh(t.build(),TERR);cap.receiveShadow=true;scene.add(cap);
  const s=new PLGeo(),sc=i=>plCol(0x5f9a3c,.9+hash(i,4,9)*.12);for(let i=0;i<N;i++){const j=(i+1)%N;
   const o0=Ot[i],o1=Ot[j],d0=[o0[0],o0[1]-.24,o0[2]],d1=[o1[0],o1[1]-.24,o1[2]];s.quad(o0,o1,d1,d0,sc(i),sc(j),sc(j),sc(i),[O[i].nx,0,O[i].nz]);
   const a0=It[i],a1=It[j],b0=[a0[0],a0[1]-.2,a0[2]],b1=[a1[0],a1[1]-.2,a1[2]];s.quad(a0,a1,b1,b0,sc(i),sc(j),sc(j),sc(i),[-I[i].nx,0,-I[i].nz])}
  scene.add(mesh(s.build(40),PLM2()))}
 /* 앞 경사로: 절벽에 붙어 서쪽에서 동쪽으로 올라가요(카메라에서 옆모습). 흙길 + 돌 옹벽 + 나무 난간 */
 const rz0=S2.AZ+R.z0,rz1=rz0+R.w,hy=x=>x>=R.x1?Hr+.02:Math.max(G+.03,G+(Hr+.02-G)*clamp((x-R.x0)/(R.x1-R.x0),0,1));
 {const xs=[];for(let x=R.x0;x<R.x2-.05;x+=.95)xs.push(x);xs.push(R.x1);xs.push(R.x2);xs.sort((a,b)=>a-b);
  const t=new PLGeo(),zs=[rz0-.1,rz0+.6,(rz0+rz1)/2,rz1-.6,rz1],cc=(k,i)=>plCol(k===0||k===4?0x8f7a54:k===2?0xa38a60:0x9a8259,.94+hash(i,k,7)*.1);
  for(let i=0;i<xs.length-1;i++){const xa=xs[i],xb=xs[i+1];for(let k=0;k<4;k++)t.quad([X+xa,hy(xa),Z+zs[k]],[X+xb,hy(xb),Z+zs[k]],[X+xb,hy(xb),Z+zs[k+1]],[X+xa,hy(xa),Z+zs[k+1]],cc(k,i),cc(k,i+1),cc(k+1,i+1),cc(k+1,i),UP)}
  {const c=plCol(0x9a8259);t.quad([X+R.x1,Hr+.02,Z+S2.AZ-.7],[X+R.x2,Hr+.02,Z+S2.AZ-.7],[X+R.x2,Hr+.02,Z+rz0-.1],[X+R.x1,Hr+.02,Z+rz0-.1],c,c,c,c,UP)}
  const rm=mesh(t.build(),TERR);rm.receiveShadow=true;scene.add(rm);
  /* 옹벽: 아래·위 두 줄 돌 + 갓돌 */
  const w=new PLGeo(),yb=G-.35;for(let i=0;i<xs.length-1;i++){const xa=xs[i],xb=xs[i+1],ta=hy(xa)-.1,tb=hy(xb)-.1,ma=yb+(ta-yb)*.48,mb=yb+(tb-yb)*.48,c0=plRock(0,i,1.05),c1=plRock(1,i,1.08+hash(i,3,77)*.08);
   w.quad([X+xa,yb,Z+rz1],[X+xb,yb,Z+rz1],[X+xb,mb,Z+rz1],[X+xa,ma,Z+rz1],c0,c0,c0,c0,[0,0,1]);w.quad([X+xa,ma+.02,Z+rz1+.01],[X+xb,mb+.02,Z+rz1+.01],[X+xb,tb,Z+rz1+.01],[X+xa,ta,Z+rz1+.01],c1,c1,c1,c1,[0,0,1])}
  {const c=plRock(1,3,1.05);w.quad([X+R.x2,yb,Z+rz0-.1],[X+R.x2,yb,Z+rz1],[X+R.x2,Hr+.02,Z+rz1],[X+R.x2,Hr+.02,Z+rz0-.1],c,c,c,c,[1,0,0])}
  scene.add(mesh(w.build(),PLM2()));
  const p=[],sl=Math.atan((Hr-G)/(R.x1-R.x0));
  for(let x=R.x0+.5;x<R.x1-.2;x+=.9)p.push(pt(lkRb(.92,.12,.34,.04,.03),0xb6afa4,[x+.45,hy(x+.45)-.04,rz1-.05],[0,0,sl]));
  for(let x=R.x1;x<R.x2;x+=.95)p.push(pt(lkRb(.97,.12,.34,.04,.03),0xb6afa4,[x+.475,Hr-.02,rz1-.05]));
  const px=[];for(let x=R.x0+1.4;x<R.x2-.15;x+=1.6)px.push(x);px.push(R.x2-.2);
  px.forEach((x,i)=>{p.push(pt(lkRb(.13,1.0,.13,.04,.03),plWood,[x,hy(x)+.5,rz1-.2]));if(i)for(const y of[.5,.92])plBar(p,[px[i-1],hy(px[i-1])+y,rz1-.2],[x,hy(x)+y,rz1-.2],.075,plWoodD)});
  for(const z of[rz0+.5,(rz0+rz1)/2])p.push(pt(lkRb(.13,1.0,.13,.04,.03),plWood,[R.x2-.2,Hr+.5,z]));for(const y of[.5,.92])plBar(p,[R.x2-.2,Hr+y,rz0+.5],[R.x2-.2,Hr+y,rz1-.2],.075,plWoodD);
  const g2=mg(p);lkSmooth(g2,40);plAdd(g2,X,0,Z)}
 /* 뒤 돌계단: 분지 뒤 벽에 붙어 서쪽(꼭대기 마루)에서 동쪽으로 내려가요. 칸마다 밝은 디딤돌 + 나무 난간 */
 {const zb=-S2.BZ-.28,zf=-S2.BZ+T.w,n=10,yb=Hb-.3,p=[],d=(T.x2-T.x1)/n,sy=x=>x<=T.x1?Hr:Hb+(Hr-Hb)*(1-clamp((x-T.x1)/(T.x2-T.x1),0,1));
  p.push(pt(lkRb(T.x1-T.x0+.02,Hr+.02-yb,zf-zb,.08,.05),0x8b8579,[(T.x0+T.x1)/2,(yb+Hr+.02)/2,(zb+zf)/2]),pt(lkRb(T.x1-T.x0+.08,.09,zf-zb+.06,.03,.02),0xb3aa98,[(T.x0+T.x1)/2,Hr+.03,(zb+zf)/2]));
  for(let k=0;k<n;k++){const xc=T.x1+(k+.5)*d,ty=Hr-(Hr-Hb)*(k+.5)/n+.02,h=ty-yb;p.push(pt(lkRb(d+.03,h,zf-zb,.05,.04),k%2?0x8b8579:0x817b70,[xc,yb+h/2,(zb+zf)/2]),pt(lkRb(d+.05,.08,zf-zb+.05,.02,.02),k%2?0xb3aa98:0xa89f8d,[xc,ty+.01,(zb+zf)/2+.02]))}
  const px=[T.x0+.2];for(let x=T.x1;x<T.x2-.3;x+=1.45)px.push(x);px.push(T.x2-.35);
  px.forEach((x,i)=>{const y=sy(x);p.push(pt(lkRb(.12,.95,.12,.04,.03),plWood,[x,y+.47,zf-.15]));if(i)for(const yy of[.48,.88])plBar(p,[px[i-1],sy(px[i-1])+yy,zf-.15],[x,y+yy,zf-.15],.07,plWoodD)});
  p.push(pt(lkRb(.12,.95,.12,.04,.03),plWood,[T.x0+.2,Hr+.47,zb+.5]));for(const yy of[.48,.88])plBar(p,[T.x0+.2,Hr+yy,zb+.5],[T.x0+.2,Hr+yy,zf-.15],.07,plWoodD);
  const sg=mg(p);lkSmooth(sg,40);plAdd(sg,X,0,Z)}
 /* 바위 무더기(절벽 밑·꼭대기·분지 모서리) */
 {const rk=[],C=[0x8e8e96,0x83838c,0x9a9aa2,0x7f7c88];let i=0;const B=(r,x,y,z,sy=.85)=>rk.push(lkBoulder(r,C[i%4],i++*3+1,[x,y,z],sy));
  for(let k=0;k<N;k+=5){const p=O[k];if(p.nz>.5&&p.x>R.x0-2.2&&p.x<R.x2+1.4)continue;const h0=hash(k,1,33);if(h0<.3)continue;
   const o=.9+hash(k,2,33)*.8,r=.4+hash(k,3,33)*.6;B(r,p.x+p.nx*o,G-.18,p.z+p.nz*o,.8+hash(k,4,33)*.3);if(h0>.72)B(r*.55,p.x+p.nx*(o+r*.9)+p.nz*.4,G-.12,p.z+p.nz*(o+r*.9)-p.nx*.4,.7)}
  for(let k=2;k<N;k+=9){const p=O[k];if(p.nz>.5&&p.x>R.x1-1&&p.x<R.x2+1)continue;B(.2+hash(k,5,33)*.2,p.x-p.nx*.6,Hr-.04,p.z-p.nz*.6,.7)}
  for(const [x,z,r] of [[-9.8,6.6,.55],[-10.0,5.6,.32],[9.9,6.7,.5],[10.0,-3.4,.36],[-3.5,6.9,.3],[6.2,-6.9,.4]])B(r,x,Hb-.08,z,.8);
  for(let x=R.x0+1;x<R.x2;x+=1.3)if(hash(x*10|0,7,33)>.45)B(.2+hash(x*10|0,8,33)*.14,x,G-.04,rz1+.55+hash(x*10|0,9,33)*.4,.75);
  const rg=mg(rk);lkSmooth(rg,70);plAdd(rg,X,0,Z)}
 /* 테두리: 나무·덤불·깃발·감시탑·안쪽 밧줄 울타리 */
 {const v=[];const put=(k,x,y,z,s,ry)=>{if(GEO[k])v.push(pt(GEO[k],null,[x,y,z],[0,ry,0],[s,s,s]))};
  put('tree_single_A',-13.0,Hr-.05,9.4,2.8,.3);put('tree_single_B',S2.AX+2.4,G-.05,1.8,2.7,1.1);put('tree_single_A',4.6,G-.05,-S2.AZ-2.8,3.0,2);put('tree_single_B',-5.2,G-.05,-S2.AZ-3.2,2.8,.6);put('tree_single_A',-S2.AX-2.6,G-.05,-3.5,2.6,1.7);
  put('bush',12.2,Hr-.04,8.7,.62,.5);put('bush',-12.3,Hr-.04,-2.2,.55,1.4);put('bush',7.2,Hr-.04,-9.3,.48,2.2);put('bush',-8.6,Hr-.04,9.2,.5,.2);
  put('bush',-S2.AX-1.2,G-.05,2.2,.75,.2);put('bush',S2.AX+1.1,G-.05,-4.5,.68,1.3);put('bush',S2.AX+.9,G-.05,5.2,.6,2.1);put('bush',-S2.AX-.9,G-.05,-7.5,.7,.9);
  put('bush',-9.7,Hb-.04,6.6,.52,.9);put('bush',9.6,Hb-.04,6.4,.46,2.6);put('bush',9.8,Hb-.04,-6.6,.5,1.6);
  if(v.length)plAdd(mg(v),X,0,Z)}
 for(const [x,z] of [[-13.0,9.4],[SPSUP.AX+2.4,1.8],[4.6,-SPSUP.AZ-2.8],[-5.2,-SPSUP.AZ-3.2],[-SPSUP.AX-2.6,-3.5]])addStruct({t:PLB(.3,.3),x:X+x,z:Z+z,r:0,hp:1e9});
 {const tw=plAdd(plTowerGeo(),X+11.6,Hr-.02,Z-8.5,-.12);for(const [lx,lz] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const c=Math.cos(-.12),s=Math.sin(-.12);addStruct({t:PLB(.14,.14),x:X+11.6+lx*c+lz*s,z:Z-8.5-lx*s+lz*c,r:0,hp:1e9})}
  const l=glow(0xffc46a,2.6,.6);l.position.set(X+11.6,Hr+4.7,Z-8.5);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l);
  const lan=mesh(mg([pt(lkRb(.2,.26,.2,.05,.03),0xffd58a,[0,0,0])]),typeof LKGLOW!=='undefined'?LKGLOW:MATT);lan.position.set(X+11.6,Hr+4.75,Z-8.5);scene.add(lan)}
 {const f=plFlagGeo();plAdd(f.pole,X-12.9,Hr-.02,Z-9.6);plAdd(f.cloth,X-12.9,Hr-.02,Z-9.6,0,PLM2());addStruct({t:PLB(.18,.18),x:X-12.9,z:Z-9.6,r:0,hp:1e9})}
 {const p=[],ps=[];for(let k=0;k<N;k+=6){const q=I[k];if(q.nz<-.7&&q.x>T.x0-.4&&q.x<T.x1+.3)continue;ps.push([q.x+q.nx*.42,q.z+q.nz*.42,k])}
  ps.forEach((a,i)=>{p.push(pt(lkRb(.11,.75,.11,.04,.03),plWood,[a[0],Hr+.37,a[1]]));const b=ps[(i+1)%ps.length];if(Math.abs(b[2]-a[2])<=6||b[2]<a[2]&&N-a[2]+b[2]<=6)plSag(p,[a[0],Hr+.66,a[1]],[b[0],Hr+.66,b[1]],.1)});
  const rg=mg(p);lkSmooth(rg,40);plAdd(rg,X,0,Z)}
 /* 경사로 아래: 경고 간판 + 가로등 2 */
 {const b=plAdd(plBoardGeo(),X+R.x0-3.4,G-.02,Z+S2.AZ+5.0,.2),t=plSignText('⚠ 특수 보급지',2.3,.46,70);t.position.set(0,1.32,.08);b.add(t);addStruct({t:PLB(1.3,.14),x:X+R.x0-3.4,z:Z+S2.AZ+5.0,r:.2,hp:1e9})}
 const lamp=(x,z,y,ry)=>{if(!GEO.plamp)return;plAdd(GEO.plamp,X+x,y,Z+z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(X+x+Math.sin(ry)*.5,y+2.75,Z+z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s);addStruct({t:PLB(.14,.14),x:X+x,z:Z+z,r:0,hp:1e9})};
 lamp(R.x0-.9,rz1+.7,G-.02,Math.PI/2);lamp(R.x2-.55,rz0+.35,Hr,-Math.PI/2);
 /* 분지 바닥: 떨어진 보급(낙하산·주황 고깔), 위장망 그늘 + 무전 탁자, 천막, 발전기, 탄약 팔레트, 드럼통, 모래주머니, 신호등 */
 {const v=[],add=(k,x,z,ry=0,s=1,y=Hb)=>{if(GEO[k])v.push(pt(GEO[k],null,[x,y,z],[0,ry,0],[s,s,s]))};
  add('chute',-2.9,-1.4,.5,1.15);
  const cg=plConeGeo();for(let k=0;k<7;k++){const a=-.3+k*.95,x=.4+Math.cos(a)*3.6,z=1.1+Math.sin(a)*3.0;v.push(pt(cg,null,[x,Hb,z],[0,a,0]))}
  add('suptent',7.4,-5.0,0,1.05);add('lk_pallet',-8.7,-1.2,.1,1);add('ammostack',-8.7,-1.2,.2,1.1,Hb+.16);add('jerry',-7.3,-.4,.5);add('jerry',-6.9,-.1,1.2);add('tarppile',4.6,-3.9,.3,1.1);
  add('lk_pallet',-9.4,-6.1,1.57,1.05);add('ammostack',-9.4,-5.6,1.5,1,Hb+.16);add('ammostack',-9.5,-6.7,1.6,.95,Hb+.16);
  add('lk_drum_1',9.4,-.9,.2,.95);add('lk_drum_0',9.0,-.1,1.2,.95);add('lk_drum_2',9.8,.0,2.0,.95);add('lk_gen',8.7,1.2,-1.57,1);
  for(const [x,z] of [[3.2,3.8],[-3.1,4.6],[-6.2,-2.6]])v.push(pt(GEO.flarecan||cg,null,[x,Hb,z],[Math.PI/2,0,hash(x*9|0,1,3)*6],[1,1,1]));
  const g=mg(v);plAdd(g,X,0,Z)}
 {const sh=plShadeGeo(3.6,2.6,2.2);plAdd(sh.poles,X+5.9,Hb,Z+3.6);plAdd(sh.net,X+5.9,Hb,Z+3.6,0,PLM2()).castShadow=true;plAdd(plTableGeo(),X+5.9,Hb,Z+3.5,0);
  for(const [x,z] of[[-1.8,-1.3],[1.8,-1.3],[-1.8,1.3],[1.8,1.3]])addStruct({t:PLB(.08,.08),x:X+5.9+x,z:Z+3.6+z,r:0,hp:1e9});addStruct({t:PLB(.85,.45),x:X+5.9,z:Z+3.5,r:0,hp:1e9});
  /* 발전기 → 그늘 전선 */ const p=[];plBar(p,[8.2,Hb+.05,1.3],[6.9,Hb+.03,2.6],.035,0x2c3346);plBar(p,[6.9,Hb+.03,2.6],[6.5,Hb+.78,3.3],.03,0x2c3346);plAdd(mg(p),X,0,Z)}
 {const sb=plSandbagGeo(6);plAdd(sb,X-6.0,Hb,Z+4.4,.35);addStruct({t:PLB(1.75,.24),x:X-6.0,z:Z+4.4,r:.35,hp:1e9});plAdd(plSandbagGeo(5),X+2.6,Hb,Z+6.0,-.12);addStruct({t:PLB(1.45,.24),x:X+2.6,z:Z+6.0,r:-.12,hp:1e9})}
 for(const [x,z,bx,bz,r] of [[7.4,-5.0,1.75,.95,0],[-8.7,-1.2,.65,.55,.1],[-9.5,-6.0,1.0,1.45,0],[4.6,-3.9,.65,.5,.3],[9.4,-.4,.75,.75,0],[8.7,1.2,.45,.62,0],[-7.1,-.25,.35,.35,0]])addStruct({t:PLB(bx,bz),x:X+x,z:Z+z,r,hp:1e9});
 {const c0=addStruct({t:'spsupply',x:X-.9,z:Z+1.6,r:.15}),c1=addStruct({t:'spsupply',x:X+1.8,z:Z+.3,r:-.25});c0.li='sp0';c1.li='sp1'}
 {const b=addStruct({t:'spbeacon',x:X-9.2,z:Z+5.0,r:0,hp:1e9}),s=glow(0xff8a3d,3.6,.7);s.position.set(b.x,Hb+3.25,b.z);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 for(const [x,z,r] of [[-9.7,3.4,1.2],[4.9,-6.6,-.3]])addStruct({t:'suplamp',x:X+x,z:Z+z,r});
 /* 보이지 않는 벽: 바깥 절벽(경사로 꼭대기 마루 빼고), 안쪽 절벽(계단 자리 빼고), 경사로 바깥·끝, 계단 앞·꼭대기 끝·테두리 쪽 */
 const contour=(f,v)=>{const pts=[];for(let a=0;a<=360;a+=.4){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);let lo=0,hi=22;for(let k=0;k<24;k++){const m=(lo+hi)/2;f(X+dx*m,Z+dz*m)<v?lo=m:hi=m}pts.push([X+dx*lo,Z+dz*lo])}return pts};
 const runWalls=(pts,cut)=>{const keep=pts.map(([x,z])=>!cut(x-X,z-Z)),runs=[];let cur=[];
  pts.forEach((q,i)=>{if(keep[i])cur.push(q);else if(cur.length){runs.push(cur);cur=[]}});if(cur.length){if(runs.length&&keep[0])runs[0]=cur.concat(runs[0]);else runs.push(cur)}
  for(const Rn of runs){let L=0;const cum=[0];for(let i=1;i<Rn.length;i++){L+=Math.hypot(Rn[i][0]-Rn[i-1][0],Rn[i][1]-Rn[i-1][1]);cum.push(L)}
   const n=Math.max(1,Math.ceil(L/1.6));for(let k=0;k<=n;k++){const u=L*k/n;let i=1;while(i<Rn.length-1&&cum[i]<u)i++;const a=Rn[i-1],b=Rn[i],t=clamp((u-cum[i-1])/((cum[i]-cum[i-1])||1),0,1);
    addStruct({t:'iblk',x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,r:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),hp:1e9})}}};
 runWalls(contour(spOut,.28),(x,z)=>z>0&&x>R.x1-.95&&x<R.x2+.95);
 runWalls(contour(spIn,-.28),(x,z)=>z<0&&x>T.x0-1.35&&x<T.x2+.95);
 plWallSeg(X+R.x0+1.8,Z+rz1+.4,X+R.x2+.8,Z+rz1+.4);plWallSeg(X+R.x2+.4,Z+S2.AZ-.2,X+R.x2+.4,Z+rz1+.4);   /* 경사로 바깥 · 꼭대기 동쪽 끝 */
 plWallSeg(X+T.x1,Z-S2.BZ-.28,X+T.x2+1.2,Z-S2.BZ-.28);plWallSeg(X+T.x0-.4,Z-S2.BZ-.9,X+T.x0-.4,Z-S2.BZ+T.w+.8);plWallSeg(X+T.x0-.8,Z-S2.BZ+T.w+.4,X+T.x2-.45,Z-S2.BZ+T.w+.4);   /* 계단 테두리 쪽 · 꼭대기 서쪽 끝 · 계단 앞 */
 CLEARS.push([X,Z+2,22])}

/* ========== 1) 까마귀섬 낚시섬: 바닷가 낚시 캠프 ========== */
const FCAMP={deckY:1.46,deck:[-20.6,-11.2,-5.2,.6],porch:[-17.8,-12.4,.6,2.5],pier:[-30.5,-20.6,-2.0,.2],hut:[-15.2,-2.85,5.0,3.6],npc:[-15.1,1.0],stall:[-15.1,2.0],gate:[-1,12.4],
 fire:[-.5,1.0],pier2:[1.8,4.2,-33,-22.6],smoke:[13.0,-4.4],dex:[4.2,9.6]};   /* 9차: 문을 남쪽으로 옮기고 마당·훈제실·북쪽 잔교·도감 게시판 자리 */
const PLBOATS=[];
function plFenceGeo(pts,blk,skip){const PO=0xe9ecef,WI=0xd3d9df,parts=[],post=(x,z)=>{const y=hAt(x,z),b=Math.min(y,0)-.2,top=Math.max(y,.05)+1.95;parts.push(pt(lkRb(.13,top-b,.13,.05,.03),PO,[x,(top+b)/2,z]),pt(new THREE.SphereGeometry(.09,8,6),0xc3cad1,[x,top+.03,z]))};
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/2.4)),w=L/n,r=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
  for(let j=0;j<n;j++){const cx=a[0]+(b[0]-a[0])*(j+.5)/n,cz=a[1]+(b[1]-a[1])*(j+.5)/n,y=Math.max(hAt(cx,cz),.05)-.02;post(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n);
   const pan=mg([pt(lkRb(w,.08,.08,.035,.02),PO,[0,1.8,0]),pt(lkRb(w,.08,.08,.035,.02),PO,[0,.14,0]),...lkLattice(w-.12,1.6,-(w-.12)/2,.18,0,.3,WI,.03)]);parts.push(pt(pan,null,[cx,y,cz],[0,r,0]))}}
 const e=pts[pts.length-1];post(e[0],e[1]);if(blk)plWallAlong(pts,1.6,skip);return parts}
function plHutGeo(){const W=FCAMP.hut[2],D=FCAMP.hut[3],H=2.6,T1=0x5f8f97,T2=0x55838b,CR=0xefe6d2,DW=0x7a4b2e,RF=0xa8483a,RF2=0x8c3a2f,p=[],gl=[];
 const boards=(x0,x1,z,f,holes)=>{for(let x=x0+.15;x<x1;x+=.3){const hs=(holes||[]).find(h=>x>h[0]&&x<h[1]);const c=Math.round(x/.3)%2?T1:T2;
   if(!hs)p.push(pt(lkRb(.29,H,.08,.03,.015),c,f(x,H/2,z)));else{if(hs[2]>.02)p.push(pt(lkRb(.29,hs[2],.08,.03,.015),c,f(x,hs[2]/2,z)));if(hs[3]<H)p.push(pt(lkRb(.29,H-hs[3],.08,.03,.015),c,f(x,(H+hs[3])/2,z)))}}};
 p.push(pt(lkRb(W+.26,.16,D+.26,.05,.04),0x6b4a33,[0,.08,0]));
 boards(-W/2,W/2,D/2,(x,y,z)=>[x,y+.16,z],[[-1.55,-.55,0,2.05],[.45,1.55,1.0,1.85]]);boards(-W/2,W/2,-D/2,(x,y,z)=>[x,y+.16,z]);
 for(const sx of[-1,1]){for(let z=-D/2+.15;z<D/2;z+=.3)p.push(pt(lkRb(.08,H,.29,.015,.03),Math.round(z/.3)%2?T1:T2,[sx*W/2,H/2+.16,z]))}
 for(const [x,z] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])p.push(pt(lkRb(.18,H+.06,.18,.05,.03),CR,[x,H/2+.16,z]));
 p.push(pt(lkRb(W+.2,.12,.14,.04,.03),CR,[0,H+.16,D/2]),pt(lkRb(W+.2,.12,.14,.04,.03),CR,[0,H+.16,-D/2]));
 /* 문 + 창(빛남) + 꽃 상자 */
 p.push(pt(lkRb(.92,1.94,.07,.05,.02),DW,[-1.05,1.13,D/2+.03]),pt(lkRb(1.08,.1,.12,.03,.02),CR,[-1.05,2.16,D/2+.04]),pt(new THREE.SphereGeometry(.05,8,6),0xe9c046,[-.72,1.1,D/2+.09]));
 for(const [x,y,w,h] of [[1.0,1.0,1.18,.1],[1.0,1.85,1.18,.1],[.45,1.42,.1,.95],[1.55,1.42,.1,.95],[1.0,1.42,.06,.85]])p.push(pt(lkRb(w,h,.1,.03,.015),CR,[x,y+.16,D/2+.04]));
 gl.push(pt(lkRb(1.0,.76,.03,.02,.01),0xffd58a,[1.0,1.58,D/2+.01]));
 p.push(pt(lkRb(1.2,.22,.3,.04,.03),0x8a5a36,[1.0,1.05,D/2+.17]));for(let i=0;i<5;i++)p.push(pt(new THREE.SphereGeometry(.08,8,6),[0xff6b6b,0xffd35c,0xff9ac2,0xffd35c,0xff6b6b][i],[.6+i*.2,1.22,D/2+.2]));
 /* 박공 지붕 + 박공벽 + 굴뚝 */
 {const rise=1.05,run=D/2+.4,len=Math.hypot(rise,run),ang=Math.atan2(rise,run);for(const sz of[-1,1]){p.push(pt(lkRb(W+.8,.14,len,.04,.04),RF,[0,H+.16+rise/2+.02,sz*run/2],[sz*ang,0,0]));
   for(let k=1;k<4;k++)p.push(pt(lkRb(W+.82,.05,.05,.02,.01),RF2,[0,H+.16+rise*(1-k/4)+.1,sz*run*k/4],[sz*ang,0,0]))}
  p.push(pt(lkRb(W+.86,.16,.22,.06,.04),RF2,[0,H+.16+rise+.04,0]));
  const sh=new THREE.Shape();sh.moveTo(-D/2,0);sh.lineTo(D/2,0);sh.lineTo(0,rise-.04);sh.lineTo(-D/2,0);const gb=new THREE.ExtrudeGeometry(sh,{depth:.08,bevelEnabled:false});
  for(const sx of[-1,1])p.push(pt(gb,T2,[sx*W/2-.04,H+.16,0],[0,Math.PI/2,0]));
  p.push(pt(cyl(.1,.1,1.0,12),0x3f4450,[W/2-.8,H+1.4,-.6]),pt(cyl(.16,.16,.08,12),0x3f4450,[W/2-.8,H+1.92,-.6]))}
 /* 물고기 간판, 부표, 문 옆 등불 */
 {const fy=2.55,fx0=-1.05;p.push(pt(lkRb(.05,.36,.05,.02,.01),0x5b3d2b,[fx0,fy+.2,D/2+.12]),pt(new THREE.SphereGeometry(.34,14,10),0xe9c046,[fx0,fy,D/2+.16],0,[1.25,.7,.25]),pt(cone(.24,.36,3),0xe9c046,[fx0+.52,fy,D/2+.16],[0,0,-Math.PI/2],[1,1,.4]),pt(new THREE.SphereGeometry(.05,8,6),0x2c3346,[fx0-.22,fy+.06,D/2+.24]))}
 for(let i=0;i<3;i++){const z=-.8+i*.75,y=1.55-(i%2)*.25;p.push(pt(cyl(.012,.012,.5,4),0x5b3d2b,[W/2+.14,y+.42,z]),pt(new THREE.SphereGeometry(.17,12,8),i%2?0xf1ece2:0xff7a3d,[W/2+.18,y,z]),pt(cyl(.172,.172,.07,12),i%2?0xff7a3d:0xf1ece2,[W/2+.18,y,z]))}
 p.push(pt(lkRb(.05,.3,.05,.02,.01),0x3f4450,[-.35,2.0,D/2+.14]),pt(lkRb(.18,.24,.18,.04,.02),0x3f4450,[-.35,1.78,D/2+.2]));gl.push(pt(lkRb(.12,.16,.12,.03,.02),0xffd58a,[-.35,1.78,D/2+.2]));
 /* 왼쪽 벽 그물 */
 p.push(...lkLattice(2.2,1.3,-1.1,.55,0,.32,0x8a6a48,.025).map(q=>{q.rotateY(Math.PI/2);q.translate(-W/2-.07,.16,0);return q}));for(let i=0;i<4;i++)p.push(pt(new THREE.SphereGeometry(.08,8,6),0xff7a3d,[-W/2-.1,1.95,-.9+i*.6]));
 const g=mg(p);lkSmooth(g,45);g.computeBoundingSphere();return{g,gl:mg(gl)}}
function plStallGeo(){const WD=0xb9773f,WD2=0x8f5a30,CR=0xf0d9a8,p=[pt(lkRb(2.5,.9,.78,.08,.04),WD,[0,.45,0]),pt(lkRb(2.62,.08,.9,.04,.03),CR,[0,.94,0])];for(let i=0;i<5;i++)p.push(pt(lkRb(.06,.72,.03,.02,.01),WD2,[-1.0+i*.5,.45,.4]));
 p.push(pt(lkRb(1.3,.1,.6,.05,.03),0xbfe8f5,[-.5,1.03,0]));for(const [id,x,s,ry] of [['f_tuna',-.85,.38,.3],['f_salmon',-.45,.44,-.25],['f_herring',-.1,.5,.2]])if(GEO[id])p.push(pt(GEO[id],null,[x,1.11,.02],[0,ry,0],[s,s,s]));
 p.push(pt(cyl(.2,.17,.32,16),0x4a8fd6,[.8,1.14,0]),pt(cyl(.21,.21,.04,16),0xe9ecef,[.8,1.31,0]),pt(lkRb(.36,.06,.3,.03,.02),0xc9cdd2,[.35,1.02,.1]),pt(lkRb(.06,.2,.06,.02,.01),0xc9cdd2,[.35,1.15,.1]),pt(lkRb(.3,.03,.24,.02,.01),0xc9cdd2,[.35,1.27,.1]));
 const g=mg(p);lkSmooth(g,45);return g}
function plRackGeo(){const WD=0x9c6a3d,p=[];for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(cyl(.05,.06,2.1,8),WD,[sx*1.45,1.0,sz*.32],[sz*-.28,0,0]));
 for(const y of[1.78,1.2])p.push(pt(cyl(.04,.04,3.1,8),0x7d5232,[0,y,0],[0,0,Math.PI/2]));
 ['f_herring','f_anch','f_trout','f_herring','f_anch','f_salmon','f_herring'].forEach((id,i)=>{if(!GEO[id])return;const x=-1.2+i*.4,y=i%2?1.2:1.78;p.push(pt(cyl(.008,.008,.16,4),0xe9e2cf,[x,y-.08,0]),pt(GEO[id],null,[x,y-.42,0],[Math.PI/2,0,0],[.62,.62,.62]))});
 const g=mg(p);lkSmooth(g,45);return g}
function plCrateGeo(){const p=[pt(lkRb(1.0,.62,.72,.05,.03),0xb07a45,[0,.31,0]),pt(lkRb(1.02,.08,.74,.03,.02),0x8a5a36,[0,.12,0]),pt(lkRb(1.02,.08,.74,.03,.02),0x8a5a36,[0,.52,0]),pt(lkRb(.9,.06,.62,.03,.02),0xcdeef8,[0,.6,0])];
 for(const [id,x,z,ry] of [['f_herring',-.25,0,.4],['f_anch',.05,.1,-.3],['f_trout',.3,-.05,.2]])if(GEO[id])p.push(pt(GEO[id],null,[x,.68,z],[0,ry,0],[.5,.5,.5]));const g=mg(p);lkSmooth(g,45);return g}
/* 낚시 캠프 안 닳은 땅(흙): 모닥불 둘레·문에서 판매대까지 길·데크 앞. world.js 지형 색에서 불러요 (0~1) */
/* 낚시 캠프 안 닳은 땅(흙)과 징검돌 길: 문 → 마당 → 툇마루(PLWORN), 갈래 → 데크 동쪽 계단(PLWORN2), 마당 → 북쪽 잔교(PLWORN3), 마당 → 훈제실(PLWORN4) */
const PLWORN=[[-1,11.4],[-1.2,9.4],[-2.2,7.4],[-4.6,6.0],[-7.6,5.0],[-10.6,4.0],[-13.9,3.4]],PLWORN2=[[-7.6,5.0],[-9.4,2.6],[-10.5,.4],[-10.7,-2.6]],PLWORN3=[[.6,-2.0],[.2,-5.5],[.8,-9.5],[1.9,-14],[2.7,-18.5],[3,-21.6]],PLWORN4=[[1.8,2.0],[4.6,1.6],[7.6,.5],[10.2,-.9],[11.8,-2.6]];
function plSegD(px,pz,L){let m=9;for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],dx=bx-ax,dz=bz-az,t=clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1);m=Math.min(m,Math.hypot(px-ax-dx*t,pz-az-dz*t))}return m}
function plWorn(fx,fz){if(fx<-26||fx>20||fz<-26||fz>14)return 0;const n=noise(fx*.6+3,fz*.6+9,77),F=FCAMP;
 let w=(1-sm(2.2,4.4,Math.hypot(fx-F.fire[0],fz-F.fire[1])))*.95;w=Math.max(w,(1-sm(.5,2.1,Math.min(plSegD(fx,fz,PLWORN),plSegD(fx,fz,PLWORN2),plSegD(fx,fz,PLWORN3),plSegD(fx,fz,PLWORN4))))*.75);
 w=Math.max(w,(1-sm(0,2.6,Math.max(Math.abs(fx+14.6)-4.6,0)+Math.max(fz-2.5,0)+Math.max(1-fz,0)))*.55);
 w=Math.max(w,(1-sm(.3,2.4,Math.max(Math.abs(fx-F.smoke[0])-1.6,0)+Math.max(Math.abs(fz-F.smoke[1]-.4)-1.4,0)))*.7,(1-sm(.3,2.4,Math.max(Math.abs(fx+3.4)-2,0)+Math.max(Math.abs(fz+16.4)-1,0)))*.6);return clamp(w*(.75+n*.5),0,1)}
/* 특수 보급지 경사로 아래 흙길 */
function plWornSP(ex,ez){const S=SPSUP,R=S.rp;if(ex<R.x0-14||ex>R.x0+4||ez<S.AZ-1||ez>S.AZ+14)return 0;const d=plSegD(ex,ez,[[R.x0+1.2,S.AZ+2.0],[R.x0-2.2,S.AZ+3.2],[R.x0-5.6,S.AZ+5.6],[R.x0-9.5,S.AZ+9.5]]);return clamp((1-sm(.6,2.4,d))*.8*(.75+noise(ex*.6,ez*.6,79)*.5),0,1)}
function plWornAt(x,z){return Math.max(plWorn(x-FISHISLE.x,z-FISHISLE.z),plWornSP(x-SPSUP.x,z-SPSUP.z))}
/* ---- 9차 낚시 캠프 소품 모델 ---- */
/* 훈제실: 짙은 판자 벽 셋 + 앞은 트임, 한쪽으로 기운 함석지붕, 굴뚝, 안에 걸린 생선·난로(빛남), 간판 */
function plSmokeGeo(){const W=2.6,D=2.0,H=2.25,p=[],gl=[],B1=0x6f4a2c,B2=0x5e3f26,MT=0x8d969e,top=z=>H+.1+.45*(z+D/2)/D;
 p.push(pt(lkRb(W+.24,.14,D+.24,.04,.03),0x5b4636,[0,.07,0]));
 for(let x=-W/2+.15;x<W/2;x+=.3)p.push(pt(lkRb(.29,H+.1,.08,.03,.015),Math.round(x/.3)%2?B1:B2,[x,(H+.1)/2+.14,-D/2]));
 for(const sx of[-1,1])for(let z=-D/2+.15;z<D/2;z+=.3){const h=top(z);p.push(pt(lkRb(.08,h,.29,.015,.03),Math.round(z/.3)%2?B1:B2,[sx*W/2,h/2+.14,z]))}
 for(const sx of[-1,1])p.push(pt(lkRb(.16,top(D/2)+.02,.16,.04,.03),0x4a3322,[sx*W/2,(top(D/2)+.02)/2+.14,D/2]));p.push(pt(lkRb(W+.12,.16,.16,.04,.03),0x4a3322,[0,top(D/2)+.06,D/2]));
 {const ang=Math.atan2(.45,D),len=Math.hypot(.45,D)+.5;p.push(pt(lkRb(W+.5,.07,len,.03,.02),MT,[0,H+.47+.14,0],[-ang,0,0]));for(let k=0;k<8;k++)p.push(pt(lkRb(.05,.04,len,.02,.01),0x9fa8b0,[-W/2-.1+k*(W+.2)/7,H+.52+.14,0],[-ang,0,0]))}
 p.push(pt(cyl(.09,.09,1.3,10),0x3f4450,[W/2-.55,H+1.0,-D/2+.35]),pt(cyl(.15,.15,.07,10),0x3f4450,[W/2-.55,H+1.66,-D/2+.35]));
 p.push(pt(lkRb(.62,.62,.5,.06,.04),0x3a3f4a,[W/2-.55,.45,-D/2+.35]));gl.push(pt(lkRb(.34,.18,.03,.02,.01),0xff9a3d,[W/2-.55,.32,-D/2+.61]));
 for(const [y,z] of [[1.95,-.35],[1.5,.2]]){p.push(pt(cyl(.03,.03,W-.1,6),0x7d5232,[0,y+.14,z],[0,0,Math.PI/2]));['f_herring','f_salmon','f_trout','f_herring','f_anch'].forEach((id,i)=>{if(!GEO[id])return;const x=-W/2+.4+i*.45;p.push(pt(GEO[id],null,[x,y+.14-.36,z],[Math.PI/2,0,0],[.5,.5,.5]))})}
 const g=mg(p);lkSmooth(g,45);return{g,gl:mg(gl)}}
/* 낚시 도감 게시판(캔버스 그림): 도감의 물고기 10종 그림자 + 이름, 테두리 색 = 등급 */
function plDexTex(){const cv=document.createElement('canvas');cv.width=512;cv.height=300;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;
 const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
 const draw=()=>{const x=cv.getContext('2d'),F=typeof UIF!=='undefined'?UIF:'sans-serif';x.fillStyle='#f3e6c8';x.fillRect(0,0,512,300);x.fillStyle='#5b3d2b';x.font=`900 38px ${F}`;x.textAlign='center';x.textBaseline='middle';x.fillText('🎣 낚시 도감',256,32);
  (typeof FISH_LIST!=='undefined'?FISH_LIST:[]).slice(0,10).forEach((f,i)=>{const cx=56+(i%5)*100,cy=114+((i/5)|0)*110,gc=FGRADE[f.g][1];x.fillStyle='#fffaf0';x.strokeStyle=gc;x.lineWidth=6;rr(x,cx-44,cy-40,88,94,12);x.fill();x.stroke();
   x.fillStyle='#'+f.back.toString(16).padStart(6,'0');x.beginPath();x.ellipse(cx-5,cy-8,26,Math.max(8,Math.min(16,f.h*40)),0,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(cx+16,cy-8);x.lineTo(cx+36,cy-24);x.lineTo(cx+36,cy+8);x.closePath();x.fill();
   x.fillStyle='#fff';x.beginPath();x.arc(cx-21,cy-11,3.6,0,7);x.fill();x.fillStyle='#5b3d2b';x.font=`800 17px ${F}`;x.fillText(f.n,cx,cy+33)});tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return tx}
function plDexBoard(){const p=[...[-1.5,1.5].map(x=>pt(lkRb(.15,2.35,.15,.05,.03),0x7d5232,[x,1.17,0])),pt(lkRb(3.1,1.9,.1,.06,.03),0x8a5a36,[0,1.55,0]),pt(lkRb(3.4,.12,.5,.04,.03),0x6f4a2c,[0,2.55,.05],[.18,0,0]),pt(lkRb(3.4,.12,.5,.04,.03),0x6f4a2c,[0,2.55,-.05],[-.18,0,0])];
 const g=mg(p);lkSmooth(g,40);const m=mesh(g,MATT),pl=new THREE.Mesh(new THREE.PlaneGeometry(2.86,1.68),new THREE.MeshLambertMaterial({map:plDexTex()}));pl.position.set(0,1.55,.06);m.add(pl);return m}
/* 피크닉 탁자 + 파랑·흰 줄무늬 파라솔 */
function plPicnicGeo(){const p=[],W1=0xb98556,W2=0x9c6a3d;for(let k=0;k<4;k++)p.push(pt(lkRb(1.9,.07,.19,.03,.02),k%2?W1:0xc08d5c,[0,.76,-.3+k*.2]));
 for(const sz of[-1,1])for(let k=0;k<2;k++)p.push(pt(lkRb(1.9,.06,.17,.03,.02),W1,[0,.45,sz*(.62+k*.18-.09)]));
 for(const sx of[-.72,.72]){p.push(pt(lkRb(.08,.08,1.55,.02,.02),W2,[sx,.38,0]));for(const sz of[-1,1])p.push(pt(lkRb(.08,.86,.08,.02,.02),W2,[sx,.38,sz*.3],[sz*.5,0,0]))}
 p.push(pt(cyl(.035,.035,2.35,8),0xe9ecef,[0,1.17,0]));const u=new PLGeo(),n=8,R=1.4,T=[0,2.38,0];for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,c=plCol(i%2?0xf4f4f4:0x3d8be0);u.tri(T,[Math.cos(a0)*R,1.98,Math.sin(a0)*R],[Math.cos(a1)*R,1.98,Math.sin(a1)*R],c,c,c,[0,1,0])}
 const g=mg(p);lkSmooth(g,40);return{g,u:u.build()}}
/* 꽃 화분 상자 */
function plPlanterGeo(sd=0){const p=[pt(lkRb(1.2,.42,.42,.06,.04),0x9c6a3d,[0,.21,0]),pt(lkRb(1.24,.06,.46,.03,.02),0x7d5232,[0,.43,0]),pt(lkRb(1.08,.04,.32,.02,.01),0x5b4636,[0,.42,0])],C=[0xff6b6b,0xffd35c,0xff9ac2,0xf4f4f4,0xb38cff];
 for(let i=0;i<5;i++){const x=-.45+i*.22;p.push(pt(new THREE.SphereGeometry(.14,8,6),0x5f9a3c,[x,.53,(hash(i,sd,7)-.5)*.1]),pt(new THREE.SphereGeometry(.075,8,6),C[(i+sd)%5],[x+.03,.66,(hash(i,sd,8)-.5)*.12]))}const g=mg(p);lkSmooth(g,40);return g}
/* 배 고치는 곳: 나무 받침 둘 + 뒤집힌 작은 배 + 노·페인트 통·공구 상자 */
function plYardGeo(){const p=[],W1=0x9c6a3d;for(const sx of[-1,1]){p.push(pt(lkRb(.12,.1,1.15,.03,.02),W1,[sx*1.0,.8,0]));for(const sz of[-1,1])for(const lx of[-.18,.18])p.push(pt(lkRb(.07,.86,.07,.02,.02),0x7d5232,[sx*1.0+lx,.4,sz*.42],[0,0,lx>0?-.22:.22]))}
 if(GEO.rowboat){const b=GEO.rowboat;if(!b.boundingBox)b.computeBoundingBox();const bb=b.boundingBox;p.push(pt(b,null,[0,.84+bb.max.y,0],[Math.PI,Math.PI/2,0]))}
 p.push(pt(lkRb(.06,.06,2.0,.02,.02),0xc08d5c,[1.7,.55,.75],[0,.25,-.9]),pt(lkRb(.2,.03,.5,.02,.01),0xc08d5c,[2.1,.12,1.4],[0,.25,-.9]),pt(cyl(.12,.12,.2,12),0xd9463b,[-1.75,.1,.7]),pt(cyl(.125,.125,.03,12),0xc9cdd2,[-1.75,.21,.7]),pt(lkRb(.5,.22,.24,.04,.02),0xd9463b,[-1.6,.11,-.8]),pt(lkRb(.3,.05,.05,.02,.01),0x3a3f4a,[-1.6,.27,-.8]));
 const g=mg(p);lkSmooth(g,40);return g}
/* 통발 더미: 초록 그물 상자 셋 + 주황 부표 */
function plTrapGeo(){const p=[],one=(x,y,z,ry)=>{const q=[pt(lkRb(.86,.05,.62,.02,.01),0x2f5c44,[0,.025,0]),pt(lkRb(.86,.05,.62,.02,.01),0x2f5c44,[0,.42,0])];for(const sx of[-1,1])for(const sz of[-1,1])q.push(pt(lkRb(.05,.42,.05,.02,.01),0x2f5c44,[sx*.4,.21,sz*.28]));
  q.push(...lkLattice(.78,.36,-.39,.04,.31,.12,0x5fae7e,.018),...lkLattice(.78,.36,-.39,.04,-.31,.12,0x5fae7e,.018));const g=mg(q);p.push(pt(g,null,[x,y,z],[0,ry,0]))};
 one(-.45,0,0,.05);one(.48,0,.05,-.08);one(0,.45,0,.2);p.push(pt(new THREE.SphereGeometry(.16,10,7),0xff7a3d,[.15,1.05,.1]),pt(new THREE.SphereGeometry(.14,10,7),0xf1ece2,[.95,.6,.3]));return mg(p)}
/* 빨랫줄: 기둥 둘 + 줄 + 노란 비옷·수건 */
function plLaundryGeo(L=3.6){const p=[];for(const x of[0,L])p.push(pt(lkRb(.12,2.0,.12,.04,.03),0x7d5232,[x,1.0,0]),pt(lkRb(.5,.08,.08,.02,.02),0x7d5232,[x,1.9,0]));plSag(p,[0,1.85,0],[L,1.85,0],.16,0xe9e2cf,.02);
 const hang=(x,w,h,c,coat)=>{const y=1.85-Math.sin(x/L*Math.PI)*.16;if(coat){p.push(pt(lkRb(w,h,.08,.06,.03),c,[x,y-h/2-.02,0]),pt(lkRb(.16,h*.7,.08,.04,.02),c,[x-w/2-.06,y-h*.4,0],[0,0,-.25]),pt(lkRb(.16,h*.7,.08,.04,.02),c,[x+w/2+.06,y-h*.4,0],[0,0,.25]),pt(lkRb(.3,.12,.09,.04,.02),c,[x,y+.02,0]))}else p.push(pt(lkRb(w,h,.03,.02,.01),c,[x,y-h/2-.02,0]));p.push(pt(lkRb(.04,.08,.04,.01,.01),0xd9463b,[x,y,0]))};
 hang(.75,.42,.62,0xf2c94c,1);hang(1.55,.4,.5,0x3d8be0);hang(2.2,.36,.46,0xf4f4f4);hang(2.95,.42,.6,0xf2c94c,1);const g=mg(p);lkSmooth(g,40);return g}
/* 장작 더미 + 그루터기에 꽂힌 손도끼 */
function plWoodGeo(){const p=[];[[4,0],[3,1],[2,2]].forEach(([n,r])=>{for(let k=0;k<n;k++)p.push(pt(cyl(.13,.13,1.3,10),[0x9c6a3d,0x8a5a36,0xa8744a][(k+r)%3],[(k-(n-1)/2)*.27,.13+r*.23,0],[0,0,Math.PI/2]))});
 for(const x of[-.7,.7])p.push(pt(lkRb(.08,.8,.08,.02,.02),0x6f4a2c,[x,.4,0]));const g=mg(p);lkSmooth(g,40);return g}
function plStumpGeo(){const p=[pt(cyl(.32,.37,.46,14),0x8a5a36,[0,.23,0]),pt(cyl(.3,.3,.03,14),0xd9b98a,[0,.47,0]),pt(cyl(.11,.11,.5,8),0xa8744a,[.6,.11,.2],[0,.6,Math.PI/2]),pt(cyl(.1,.1,.42,8),0x9c6a3d,[.5,.1,-.35],[0,-.4,Math.PI/2])];
 if(GEO.axe_m)p.push(pt(GEO.axe_m,null,[.02,.48,0],[0,.4,-.5],[.9,.9,.9]));return mg(p)}
/* 줄 전구: [[a,b],…] 지역 좌표 → 줄 + 전구(빛남) + 밤 불빛 */
function plLights(OX,OZ,segs){const p=[],gl=[];for(const [a,b] of segs){const L=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(6,Math.round(L/.9));let prev=null;
  for(let k=0;k<=n;k++){const t=k/n,q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*.45,a[2]+(b[2]-a[2])*t];if(prev)plBar(p,prev,q,.025,0x2c3346);
   if(k>0&&k<n){gl.push(pt(new THREE.SphereGeometry(.09,8,6),[0xffd58a,0xffb36b,0xfff0b0][k%3],[q[0],q[1]-.1,q[2]]));if(k%3===1){const s=glow(0xffc46a,1.7,.6);s.position.set(OX+q[0],q[1]-.12,OZ+q[2]);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}}prev=q}}
 plAdd(mg(p),OX,0,OZ);plAdd(mg(gl),OX,0,OZ,0,typeof LKGLOW!=='undefined'?LKGLOW:MATT).castShadow=false}
const PLSMOKE=[];
function plFishCamp(){const F=FCAMP,OX=FISHISLE.x,OZ=FISHISLE.z,Y=F.deckY,W=(x,z)=>[OX+x,OZ+z],bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x:OX+x,z:OZ+z,r,hp:1e9}),gh=(x,z)=>hAt(OX+x,OZ+z);
 const [gx,gz]=F.gate;CLEARS.push([OX-3,OZ-7,27]);
 /* 철조망: 남서쪽 바다 ~ 문 왼쪽, 문 오른쪽 ~ 동쪽 ~ 북쪽 바다 (양 끝은 물속까지, 서쪽·북쪽 바닷가는 트임) */
 const A=[[-24.5,10.2],[-18,11.0],[-11,11.8],[-5,12.3],[gx-1.35,gz]].map(q=>W(q[0],q[1])),B=[[gx+1.35,gz],[5,12.2],[10.5,11.2],[15,8.4],[17.8,3.5],[18.6,-3.5],[17.8,-10.5],[15.4,-16.5],[12.2,-21.5],[11.4,-25.5],[11.6,-29.5]].map(q=>W(q[0],q[1]));
 const gskip=(x,z)=>Math.abs(x-OX-gx)<1.95&&Math.abs(z-OZ-gz)<.8;
 {const g=mg(plFenceGeo(A,1,gskip).concat(plFenceGeo(B,1,gskip)));lkSmooth(g,50);plAdd(g,0,0,0)}
 {const g=addStruct({t:'cgate',x:OX+gx,z:OZ+gz,r:0});g.open=false;g.ot=0;const t=plSignText('🎣 낚시섬');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 /* 데크(ㄱ자: 오두막 데크 + 앞 툇마루) + 잔교 */
 const tone=[0xb98556,0xa67848,0xc08d5c,0x9e7044],RW=0x7a5232,PST=0x6f4a2c;
 {const p=[],planks=(x0,x1,z0,z1,k0)=>{for(let z=z0+.15,k=k0;z<z1-.02;z+=.3,k++)p.push(pt(lkRb(x1-x0-.04,.1,.28,.03,.02),tone[k%4],[(x0+x1)/2,Y-.05,z]))},
   posts=(x0,x1,z0,z1)=>{for(let x=x0+.3;x<x1;x+=2.1)for(const z of[z0+.2,z1-.2]){const b=Math.min(gh(x,z),0)-.4;p.push(pt(cyl(.13,.15,Y-.1-b,8),PST,[x,(Y-.1+b)/2,z]))}},
   fascia=(x0,x1,z0,z1)=>{p.push(pt(lkRb(x1-x0+.1,.22,.14,.04,.02),RW,[(x0+x1)/2,Y-.16,z1+.02]),pt(lkRb(x1-x0+.1,.22,.14,.04,.02),RW,[(x0+x1)/2,Y-.16,z0-.02]),pt(lkRb(.14,.22,z1-z0,.04,.02),RW,[x1+.02,Y-.16,(z0+z1)/2]),pt(lkRb(.14,.22,z1-z0,.04,.02),RW,[x0-.02,Y-.16,(z0+z1)/2]))};
  const [x0,x1,z0,z1]=F.deck,[qx0,qx1,qz0,qz1]=F.porch;planks(x0,x1,z0,z1,0);planks(qx0,qx1,qz0,qz1,1);posts(x0,x1,z0,z1);posts(qx0,qx1,qz0,qz1);fascia(x0,x1,z0,z1);fascia(qx0,qx1,qz0,qz1);
  /* 물가 쪽 난간(북·서, 잔교 입구는 비움) */
  const rail=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),r=Math.atan2(-(bz-az),bx-ax),n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n;p.push(pt(lkRb(.12,.9,.12,.04,.02),RW,[x,Y+.45,z]))}
   p.push(pt(lkRb(L,.08,.09,.03,.02),0x9c6a3d,[(ax+bx)/2,Y+.86,(az+bz)/2],[0,r,0]),pt(lkRb(L,.06,.07,.03,.02),0x9c6a3d,[(ax+bx)/2,Y+.48,(az+bz)/2],[0,r,0]))};
  rail(x0+.06,z0+.06,x1-.06,z0+.06);rail(x0+.06,z0+.06,x0+.06,F.pier[2]-.05);rail(x0+.06,F.pier[3]+.05,x0+.06,z1-.06);
  for(let k=0;k<2;k++)p.push(pt(lkRb(.5,.12,2.2,.03,.02),0xa67848,[x1+.3+k*.42,Y-.2-k*.16,(z0+z1)/2-.6]));   /* 동쪽 계단 */
  for(let k=0;k<2;k++)p.push(pt(lkRb(2.4,.12,.5,.03,.02),0xa67848,[(qx0+qx1)/2+1.2,Y-.2-k*.16,qz1+.3+k*.42]));   /* 툇마루 앞 계단 */
  const [px0,px1,pz0,pz1]=F.pier;for(let x=px0+.15,k=0;x<px1;x+=.3,k++)p.push(pt(lkRb(.27,.1,pz1-pz0,.02,.02),tone[(k+1)%4],[x,Y-.05,(pz0+pz1)/2]));
  for(const z of[pz0,pz1])p.push(pt(lkRb(px1-px0,.16,.14,.03,.02),RW,[(px0+px1)/2,Y-.16,z]));for(let x=px0+.3;x<px1;x+=2)for(const z of[pz0+.05,pz1-.05]){const b=gh(x,z)-.4;p.push(pt(cyl(.13,.15,Y-.1-b,8),PST,[x,(Y-.1+b)/2,z]))}
  for(const [x,z] of [[px0+.4,pz0+.15],[px0+.4,pz1-.15],[px0+3.2,pz1-.15]])p.push(pt(cyl(.13,.16,.42,10),0x3f4450,[x,Y+.2,z]),pt(new THREE.SphereGeometry(.16,10,7),0x3f4450,[x,Y+.42,z],0,[1,.6,1]));
  p.push(pt(new THREE.TorusGeometry(.26,.06,6,14),0xd9c49a,[px0+1.4,Y+.06,pz1-.4],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.17,.05,6,12),0xd9c49a,[px0+1.4,Y+.13,pz1-.4],[Math.PI/2,0,0]));
  for(const [x,z,h] of [[px0-1.2,pz0-.8,.9],[px0-.6,pz1+1.3,.7],[px0+5,pz0-1.4,.6]]){const b=gh(x,z)-.3;p.push(pt(cyl(.12,.14,h-b,8),PST,[x,(h+b)/2,z]))}   /* 물속 말뚝 */
  const g=mg(p);lkSmooth(g,45);plAdd(g,OX,0,OZ);
  addDock(OX+(x0+x1)/2,OZ+(z0+z1)/2,0,(x1-x0)/2+.05,(z1-z0)/2+.05,Y);addDock(OX+(qx0+qx1)/2,OZ+(qz0+qz1)/2,0,(qx1-qx0)/2+.05,(qz1-qz0)/2+.05,Y);
  addDock(OX+(px0+px1)/2,OZ+(pz0+pz1)/2,0,(px1-px0)/2+.05,(pz1-pz0)/2+.05,Y);addDock(OX+x1+.55,OZ+(z0+z1)/2-.6,0,.5,1.1,Y-.18);addDock(OX+(qx0+qx1)/2+1.2,OZ+qz1+.55,0,1.2,.5,Y-.18);
  /* 난간 충돌(물가 쪽) */
  for(let x=x0+.8;x<x1-.3;x+=1.6)bl(x,z0+.06,.85,.12);for(let z=z0+.8;z<F.pier[2]-.3;z+=1.6)bl(x0+.06,z,.12,.85);for(let z=F.pier[3]+.6;z<z1;z+=1.6)bl(x0+.06,z,.12,.6)}
 /* 오두막 + 판매대 + 주인 */
 {const [hx,hz,hw,hd]=F.hut,H=plHutGeo(),m=plAdd(H.g,OX+hx,Y,OZ+hz);m.add(mesh(H.gl,typeof LKGLOW!=='undefined'?LKGLOW:MATT,false));bl(hx,hz,hw/2+.12,hd/2+.12);
  const s=glow(0xffc46a,3.2,.6);s.position.set(OX+hx+1.0,Y+1.7,OZ+hz+hd/2+.4);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 {const [sx,sz]=F.stall;plAdd(plStallGeo(),OX+sx,Y,OZ+sz);addStruct({t:'fstall',x:OX+sx,z:OZ+sz,r:0});const [nx,nz]=F.npc;addStruct({t:'iblk2',x:OX+nx,z:OZ+nz,r:0});FNPC={x:OX+nx,z:OZ+nz,rot:0,i:0}}
 /* 데크 위 소품: 드럼통·생선 상자, 낚싯대 걸이, 부표 더미, 의자, 등불 기둥 */
 {const v=[],cg=plCrateGeo(),dr=k=>GEO['lk_drum_'+k]||GEO.barrel,add=(g,x,y,z,ry=0,s=1)=>v.push(pt(g,null,[x,y,z],[0,ry,0],[s,s,s]));
  add(dr(1),-11.9,Y,-4.4,.3,.9);add(dr(0),-11.9,Y,-3.4,1.2,.9);bl(-11.9,-3.9,.45,.95);
  add(cg,-19.2,Y,-4.3,.2);add(cg,-19.15,Y+.6,-4.3,-.1);bl(-19.2,-4.3,.6,.45,.2);
  /* 낚싯대 걸이: 오두막 서쪽 벽 옆 */
  {const rk=[pt(lkRb(.1,1.6,.1,.03,.02),0x7d5232,[-18.25,Y+.8,-3.7]),pt(lkRb(.1,1.6,.1,.03,.02),0x7d5232,[-18.25,Y+.8,-1.9]),pt(lkRb(.08,.08,1.9,.03,.02),0x7d5232,[-18.25,Y+1.5,-2.8])];
   for(let i=0;i<3;i++)rk.push(pt(cyl(.018,.03,2.3,6),[0x2c3346,0x3d6fa0,0x2c3346][i],[-18.1,Y+1.15,-3.4+i*.55],[.38,0,0]),pt(cyl(.05,.05,.06,10),0xc9cdd2,[-18.06,Y+.55,-3.15+i*.55],[0,0,Math.PI/2]));v.push(...rk);bl(-18.25,-2.8,.18,1.0)}
  /* 부표 더미 + 밧줄 + 양동이: 잔교 입구 */
  for(const [x,z,c] of [[-19.6,1.0,0xff7a3d],[-19.2,1.25,0xf1ece2],[-19.45,.65,0xff7a3d],[-19.3,.95,0xf1ece2]])v.push(pt(new THREE.SphereGeometry(.2,12,8),c,[x,Y+.2+(c===0xf1ece2?.18:0),z]));
  v.push(pt(cyl(.22,.18,.36,14),0x4a8fd6,[-18.6,Y+.18,.9]),pt(cyl(.23,.23,.04,14),0xe9ecef,[-18.6,Y+.37,.9]));bl(-19.2,.95,.55,.45);
  /* 의자 두 개: 툇마루 */
  for(const [x,z,ry] of [[-12.9,1.4,-.4],[-17.2,1.5,.5]]){v.push(pt(lkRb(.55,.08,.5,.04,.02),0xb98556,[x,Y+.45,z],[0,ry,0]),pt(lkRb(.55,.5,.07,.04,.02),0xa67848,[x-Math.sin(ry)*.23,Y+.72,z-Math.cos(ry)*.23],[0,ry,0]));for(const [dx,dz] of [[-.22,-.2],[.22,-.2],[-.22,.2],[.22,.2]])v.push(pt(lkRb(.06,.45,.06,.02,.01),0x7d5232,[x+dx*Math.cos(ry)+dz*Math.sin(ry),Y+.22,z-dx*Math.sin(ry)+dz*Math.cos(ry)]));bl(x,z,.32,.3,ry)}
  const g=mg(v);lkSmooth(g,45);plAdd(g,OX,0,OZ)}
 /* 잔교에 묶인 작은 배(살짝 출렁여요) */
 if(GEO.rowboat){const b=plAdd(GEO.rowboat,OX+F.pier[0]+3.4,.3,OZ+F.pier[3]+1.25,Math.PI/2+.08);b.castShadow=false;PLBOATS.push({m:b,y:.3,ph:1.3})}
 /* ---- 땅 위(9차: 캠프를 넓혀 구역마다 채움) ---- */
 const lamp=(x,z,y,ry)=>{if(!GEO.plamp)return;plAdd(GEO.plamp,OX+x,y,OZ+z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(OX+x+Math.sin(ry)*.5,y+2.75,OZ+z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)};
 const at=(g,x,z,ry=0,m)=>plAdd(g,OX+x,gh(x,z)-.02,OZ+z,ry,m);
 /* 오두막 옆: 생선 상자·드럼통 */
 {const cg=plCrateGeo();at(cg,-9.4,-4.1,.25);plAdd(cg,OX-9.25,gh(-9.4,-4.1)+.6,OZ-4.05,-.15);bl(-9.4,-4.1,.62,.5,.25);addStruct({t:'barrel',x:OX-8.7,z:OZ-6.2,r:.3,hp:1e9})}
 /* 가운데 마당: 모닥불 + 통나무 의자 셋 */
 {const [fx,fz]=F.fire;addStruct({t:'fire',x:OX+fx,z:OZ+fz,r:0,hp:1e9});if(GEO.lk_logs)for(const [x,z,r] of [[fx-2.2,fz+1.0,.5],[fx+2.2,fz+1.1,-.55],[fx-1.6,fz-1.7,-.75]]){at(GEO.lk_logs,x,z,r).scale.set(2.2,1.6,2.2);bl(x,z,.6,.22,r)}}
 /* 문 안 오른쪽: 낚시 도감 게시판(앞을 봄) */
 {const [dx,dz]=F.dex,b=plDexBoard();b.position.set(OX+dx,gh(dx,dz)-.02,OZ+dz);scene.add(b);bl(dx,dz,1.62,.14)}
 /* 남동쪽: 피크닉 탁자 + 파라솔, 꽃 화분 */
 {const pc=plPicnicGeo();at(pc.g,10.2,5.2,.2);at(pc.u,10.2,5.2,.2,PLM2());bl(10.2,5.2,1.02,.95,.2);
  [[-7.2,10.6,0],[-13.4,10.0,.05],[7.6,10.4,-.12],[-16.2,4.8,1.57]].forEach(([x,z,r],i)=>{at(plPlanterGeo(i),x,z,r);bl(x,z,.62,.24,r)})}
 /* 동쪽: 훈제실(연기) + 장작 더미 + 그루터기 도끼 + 덕장 둘 */
 {const [sx,sz]=F.smoke,h=plSmokeGeo(),m=at(h.g,sx,sz,0);m.add(mesh(h.gl,typeof LKGLOW!=='undefined'?LKGLOW:MATT,false));bl(sx,sz-.05,1.42,1.12);
  const sign=plAdd(mg([pt(lkRb(1.4,.42,.07,.05,.02),0x8a5a36,[0,0,0])]),OX+sx,gh(sx,sz)+2.95,OZ+sz+1.12),t=plSignText('🐟 훈제실',1.3,.3,66);t.position.set(0,0,.05);sign.add(t);
  const sm=new THREE.MeshLambertMaterial({color:0xe6e2dc});for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),sm);scene.add(p);PLSMOKE.push({m:p,x:OX+sx+1.3-.55,z:OZ+sz-1+.35,y:gh(sx,sz)+3.95,ph:i/4})}
  const s=glow(0xff9a3d,2.2,.55);s.position.set(OX+sx+.75,gh(sx,sz)+.6,OZ+sz-.4);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 at(plWoodGeo(),15.9,-4.4,1.57);bl(15.9,-4.4,.5,.85);at(plStumpGeo(),10.4,-2.6,.3);bl(10.4,-2.6,.42,.42);
 at(plRackGeo(),7.6,-9.4,.1);bl(7.6,-9.4,1.55,.42,.1);at(plRackGeo(),11.6,-10.2,-.18);bl(11.6,-10.2,1.55,.42,-.18);
 /* 빨랫줄: 오두막 뒤 */
 at(plLaundryGeo(3.6),-9.6,-9.4,.08);bl(-9.6,-9.4,.12,.12);bl(-9.6+3.6*Math.cos(.08),-9.4-3.6*Math.sin(.08),.12,.12);
 /* 북쪽 바닷가: 배 고치는 곳, 그물 말리기, 통발 더미, 부표, 북쪽 잔교 + 작은 배 */
 at(plYardGeo(),-3.4,-16.4,.06);bl(-3.4,-16.4,1.62,.72,.06);
 if(GEO.pnet){at(GEO.pnet,-8.4,-13.6,.62);bl(-8.4,-13.6,1.35,.22,.62)}
 at(plTrapGeo(),7.4,-19.2,-.2);bl(7.4,-19.2,.95,.42,-.2);
 {const v=[];for(const [x,z,c] of [[5.1,-21.6,0xff7a3d],[5.5,-21.3,0xf1ece2],[5.3,-21.95,0xff7a3d],[4.9,-21.2,0xf1ece2]])v.push(pt(new THREE.SphereGeometry(.2,12,8),c,[x,gh(x,z)+.18+(c===0xf1ece2?.16:0),z]));plAdd(mg(v),OX,0,OZ);bl(5.2,-21.5,.5,.5)}
 {const [px0,px1,pz0,pz1]=F.pier2,p=[];for(let z=pz0+.15,k=0;z<pz1;z+=.3,k++)p.push(pt(lkRb(px1-px0-.04,.1,.27,.02,.02),tone[(k+2)%4],[(px0+px1)/2,Y-.05,z]));
  for(const x of[px0,px1])p.push(pt(lkRb(.14,.16,pz1-pz0,.03,.02),RW,[x,Y-.16,(pz0+pz1)/2]));for(let z=pz0+.3;z<pz1;z+=2)for(const x of[px0+.05,px1-.05]){const b=Math.min(gh(x,z),0)-.4;p.push(pt(cyl(.13,.15,Y-.1-b,8),PST,[x,(Y-.1+b)/2,z]))}
  for(let k=0;k<2;k++)p.push(pt(lkRb(px1-px0,.12,.45,.03,.02),0xa67848,[(px0+px1)/2,Y-.2-k*.16,pz1+.25+k*.4]));
  for(const [x,z] of [[px0+.15,pz0+.4],[px1-.15,pz0+.4],[px1-.15,pz0+3.4]])p.push(pt(cyl(.13,.16,.42,10),0x3f4450,[x,Y+.2,z]),pt(new THREE.SphereGeometry(.16,10,7),0x3f4450,[x,Y+.42,z],0,[1,.6,1]));
  p.push(pt(new THREE.TorusGeometry(.26,.06,6,14),0xd9c49a,[px1-.5,Y+.06,pz0+1.6],[Math.PI/2,0,0]));
  const g=mg(p);lkSmooth(g,45);plAdd(g,OX,0,OZ);addDock(OX+(px0+px1)/2,OZ+(pz0+pz1)/2,0,(px1-px0)/2+.05,(pz1-pz0)/2+.05,Y);addDock(OX+(px0+px1)/2,OZ+pz1+.45,0,(px1-px0)/2,.5,Y-.18);
  lamp(px0+.35,pz0+.6,Y,Math.PI/2);if(GEO.rowboat){const b=plAdd(GEO.rowboat,OX+px1+1.35,.3,OZ+pz0+4.2,.06);b.castShadow=false;PLBOATS.push({m:b,y:.3,ph:2.4})}}
 /* 나무(울타리 안 구석) */
 if(GEO.tree_single_A){const v=[];for(const [x,z,s,r,k] of [[15.4,-13.4,2.6,.4,'tree_single_A'],[-12.0,-12.6,2.3,1.2,'tree_single_B'],[13.8,7.2,2.2,2.1,'tree_single_A'],[-16.6,7.6,2.0,.7,'tree_single_B']]){if(GEO[k])v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,r,0],[s,s,s]));bl(x,z,.3,.3)}plAdd(mg(v),OX,0,OZ)}
 /* 가로등 */
 lamp(gx+2.3,gz-1.1,gh(gx+2.3,gz-1.1)-.02,Math.PI);lamp(F.pier[0]+.5,F.pier[2]+.35,Y,Math.PI/2);lamp(F.deck[1]-.3,F.deck[2]+.3,Y,-Math.PI/2);lamp(-1.2,-12.2,gh(-1.2,-12.2)-.02,0);lamp(10.8,-.9,gh(10.8,-.9)-.02,-Math.PI/2);
 for(const [x,z] of [[gx+2.3,gz-1.1],[-1.2,-12.2],[10.8,-.9]])bl(x,z,.14,.14);
 /* 징검돌 길: 문 → 마당 → 툇마루 / 마당 → 북쪽 잔교 / 마당 → 훈제실 / 갈래 → 데크 동쪽 계단 */
 {const rk=[];let i=0;for(const L of [PLWORN,PLWORN3,PLWORN4,PLWORN2])for(let k=0;k<L.length-1;k++){const [ax,az]=L[k],[bx,bz]=L[k+1],n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/1.25));for(let j=0;j<n;j++){const t=j/n,x=ax+(bx-ax)*t+(hash(i,7,91)-.5)*.3,z=az+(bz-az)*t+(hash(i,8,91)-.5)*.3;
   if(Math.hypot(x-F.fire[0],z-F.fire[1])<3.1){i++;continue}rk.push(lkBoulder(.32+hash(i,1,91)*.1,[0xc9c2b4,0xb8b1a3,0xd3ccbe][i%3],i*5+2,[x,gh(x,z)-.06,z],.2));i++}}
  for(let k=0;k<30;k++){const x=-14+hash(k,3,92)*31,z=-20+hash(k,4,92)*31;rk.push(lkBoulder(.1+hash(k,5,92)*.08,0xa9a296,k*3,[x,gh(x,z)-.03,z],.5))}
  const g=mg(rk);lkSmooth(g,70);plAdd(g,OX,0,OZ)}
 /* 줄 전구: 오두막 앞 모서리 → 마당 기둥 → 문 기둥, 마당 기둥 → 훈제실 */
 {const P=[1.8,-1.3],py=gh(P[0],P[1]),p=[pt(cyl(.04,.055,2.95,8),0x3a3f4a,[P[0],py+1.47,P[1]]),pt(cyl(.09,.11,.16,8),0x3a3f4a,[P[0],py+.08,P[1]])];plAdd(mg(p),OX,0,OZ);bl(P[0],P[1],.14,.14);
  const A0=[F.hut[0]+F.hut[2]/2,Y+2.6,F.hut[1]+F.hut[3]/2],A1=[P[0],py+2.9,P[1]],A2=[gx+1.32,gh(gx+1.32,gz)+3.1,gz],A3=[F.smoke[0]-1.3,gh(F.smoke[0],F.smoke[1])+2.5,F.smoke[1]+1.0];plLights(OX,OZ,[[A0,A1],[A1,A2],[A1,A3]])}
 /* 덤불·꽃 */
 if(GEO.bush){const v=[];for(const [x,z,s,r] of [[5.6,3.6,.55,.4],[-6.8,7.8,.5,2],[2.6,6.8,.42,.8],[16.0,-7.8,.5,1.6],[-12.6,8.6,.55,.2],[3.4,-6.2,.45,2.4],[14.6,1.2,.48,1.1],[8.8,-14.8,.52,.6],[-6.4,-20.6,.5,1.9],[12.8,-18.6,.46,2.8],[-16.0,1.5,.45,.3],[6.0,8.8,.4,1.4]])v.push(pt(GEO.bush,null,[x,gh(x,z)-.04,z],[0,r,0],[s,s,s]));plAdd(mg(v),OX,0,OZ)}}

/* ---------- 놓기 ---------- */
function buildPlaces(){plGeoParts();try{plFishCamp()}catch(e){console.error('낚시섬 만들기 실패',e)}try{plCrater()}catch(e){console.error('특수 보급지 만들기 실패',e)}}
{const _bp=buildPorts;buildPorts=function(){_bp();try{buildPlaces()}catch(e){console.error('특별한 곳 만들기 실패',e)}}}   /* 항구 소품 모델(그물·가로등·배)이 생긴 뒤에 */

/* ---------- 철조망 문: 누르면 열리고 4초 뒤(문 안에 아무도 없으면) 닫혀요 ---------- */
const GATE_OPEN_T=4;
function gateBusy(s){const who=[P,...enemies.filter(e=>!e.dead)];if(typeof NET!=='undefined'&&NET.on)NET.players.forEach(p=>{if(p.hp>0)who.push(p)});const o=s.open;s.open=false;const b=who.some(q=>inStruct(s,q.x,q.z,.55));s.open=o;return b}
function openGate(s){if(s.open)return;s.open=true;s.ot=performance.now()+GATE_OPEN_T*1000;sfx(330,.12,'square',.03);sfx(520,.08,'sine',.03);hudDirty=true}
let plChat=false;function plHookChat(){if(plChat||typeof CHAT==='undefined')return;plChat=true;const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){if(k==='fisher')return FNPC&&dist(FNPC.x,FNPC.z,P.x,P.z)<40?{x:FNPC.x,z:FNPC.z,y:3.05}:null;return _an(k)}}   /* chat.js는 이 파일보다 늦게 읽혀서, 처음 쓸 때 붙여요 */
function updPlaces(dt){const k=Math.min(1,dt*7);plHookChat();
 for(const s of structs){if(s.t!=='cgate')continue;if(s.open){if(performance.now()>=s.ot){if(gateBusy(s))s.ot=performance.now()+400;else{s.open=false;sfx(240,.12,'square',.03);hudDirty=true}}}
  const L=s.lk&&s.lk.parts.leaf;if(L){const t=s.open?1.62:0;if(Math.abs(t-L.rotation.y)>.002)L.rotation.y+=(t-L.rotation.y)*k}}
 for(const q of PLSMOKE){const t=(gt*.22+q.ph)%1;q.m.position.set(q.x+Math.sin(t*5+q.ph*9)*.12+t*.35,q.y+t*1.6,q.z);q.m.scale.setScalar((.35+t*1.1)*(1-t*t))}
 for(const b of PLBOATS){b.m.position.y=b.y+Math.sin(gt*1.25+b.ph)*.05;b.m.rotation.z=Math.sin(gt*1.05+b.ph)*.045}
 if(!FNPC)return;if(!FNPC.a&&CMAT.fisher){FNPC.a=new Actor('fisher');FNPC.a.play('Idle',{force:1});FNPC.a.set(FNPC.x,FNPC.z,0)}
 if(FNPC.a){const d=dist(P.x,P.z,FNPC.x,FNPC.z);FNPC.a.root.visible=d<90;if(d<60){const want=d<7?Math.atan2(P.x-FNPC.x,P.z-FNPC.z):0;let df=want-FNPC.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;FNPC.rot+=df*Math.min(1,dt*4);FNPC.a.root.rotation.y=FNPC.rot;FNPC.a.mixer.update(dt)}}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{updPlaces(dt)}catch(e){}}}
function fisherTalk(){if(!FNPC)return;plHookChat();const s=FNPC_LINES[FNPC.i%FNPC_LINES.length];FNPC.i++;if(typeof CHAT!=='undefined')CHAT.say('fisher',s);else toast(s);sfx(600,.05,'sine',.03);if(FNPC.a)FNPC.a.play('Interact',{once:1,lock:.6,force:1})}

/* ---------- 라벨·상호작용·특수 보급 ---------- */
{const _sl=sLabel;sLabel=function(s){if(s.t==='cgate')return s.open?null:'문 열기';if(s.t==='fstall')return'말 걸기';if(/^(iblk|pb_)/.test(s.t)||s.t==='spbeacon')return null;
  const d=sdef(s);if(d.loot===4)return S.looted[s.li]&&S.day-S.looted[s.li]<d.cd?null:'열기';return _sl(s)}}
const SPLOOT=()=>{const g={};const add=(k,n)=>g[k]=(g[k]||0)+n;add('coin',400+(Math.random()*600|0));add(pick(['rifle','shotgun','smg']),1);add('ammoS',40);add('grenade',1+(Math.random()<.4?1:0));add('powder',6);add('bandage',2);add('can',2);return g};
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'){const s=t.s,d=sdef(s);
  if(s.t==='cgate'){if(inp.actEdge)openGate(s);return}
  if(s.t==='fstall'){if(inp.actEdge)fisherTalk();return}
  if(d.loot===4){if(!inp.actEdge)return;if(S.looted[s.li]&&S.day-S.looted[s.li]<d.cd)return;S.looted[s.li]=S.day;P.a.play('PickUp',{once:1,lock:.5,force:1});const got=SPLOOT();let i=0;
   for(const k in got){if(ITEMS[k]&&ITEMS[k].one&&invN(k)){give('scrap',8);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,'+8 고철','#ffe08a');continue}give(k,got[k]);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,`+${got[k]} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffd27a')}
   if(s.m&&s.m.children[0])s.m.children[0].geometry=GEO[d.og];if(s.lk&&s.lk.parts.glow)s.lk.parts.glow.visible=false;jingle([659,880,1175]);toast('⭐ 특수 보급을 열었어요!');hudDirty=true;return}}
 return _ia()}}

/* ---------- 설치 금지 구역 ---------- */
if(typeof NOB_N!=='undefined')Object.assign(NOB_N,{fish:'낚시섬',sp:'특수 보급지'});
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();NOB.push({k:'fish',x:FISHISLE.x-3,z:FISHISLE.z-7,r:29.5});NOB.push({k:'sp',x:SPSUP.x-.5,z:SPSUP.z+1.5,r:22})}}

/* ========== 3) 바람섬 식물섬 (37차 디자인, 기획자가 크리에이티브 블록으로 그린 자리 x58~119 z644~686) ==========
   식물 도감 12종을 다 채우면 들어오는 곳. 바람섬 북쪽 끝.
   - 그린 선 = PIS_R(가운데 PIS.x·z에서 잰 반지름 72개, 매끈하게 다듬음). 절벽은 그 선보다 PIS.off(1m) 바깥에서 시작해요.
   - 절벽 두께는 땅 쪽 PIS.T0(3.4m), 바다가 가까운 쪽은 물속(깊이 0.3m 넘는 곳)까지 1.3m 더 뻗어서(최대 9.5m) 헤엄쳐 들어올 틈이 없어요.
     높이는 땅 쪽 2.8m, 바다 쪽 최대 4.5m. 모양은 특수 보급지 절벽처럼 층층이 쌓인 바위 + 꼭대기 풀.
   - 남쪽(+z, 땅 쪽) 가운데 PIS.gx에 나무 문(`pgate`): 바깥에서는 식물 도감 12/12일 때만 열려요(개발자 모드는 언제나). 안에서는 언제나 열려요.
     열리면 4초 뒤(문 안에 아무도 없으면) 닫혀요(낚시섬 문과 같은 규칙, `openGate`·`gateBusy`).
   - 안: 가운데 꽃 피는 큰 나무 + 둥근 의자 광장, 북쪽 유리 온실, 서쪽 식물 정원(12종 화단 + 이름표), 동쪽 돌 연못, 남동쪽 벌통,
     정원사 판매대 뒤 '식물섬 주인'(`GNPC`, [말 걸기]), 문 안 식물 도감 게시판, 장미 아치, 가로등·줄 전구·꽃 덤불.
   - 설치 금지 원(`NOB` k:'pis', 절벽 바깥 + 2.5m)과 같은 크기 + 2m 안의 나무·바위·덤불은 모두 비워요(CLEARS). 지도에 연두 점. */
const PIS={x:88.5,z:665.5,gx:85,off:1.0,T0:3.4,H0:3.6,n:'식물섬',c:'#7cc95a'};
const PIS_R=[30.7,30.3,28.6,27.0,25.9,24.6,22.9,21.3,19.7,18.3,17.8,17.7,17.5,17.5,17.3,16.8,16.6,16.8,17.0,17.2,17.4,17.8,18.6,19.8,21.4,24.3,28.1,31.1,32.9,33.0,32.4,31.5,30.9,30.8,30.6,30.1,29.4,28.6,27.8,27.0,25.9,24.3,23.0,22.3,21.8,21.7,21.6,21.1,21.2,21.6,21.5,21.3,21.3,21.1,20.8,20.6,19.7,18.6,17.9,18.1,18.6,19.0,19.2,19.9,21.2,22.5,23.6,24.5,25.5,26.8,28.5,30.1];
let GNPC=null;   /* 식물섬 주인 {a,x,z,rot,i} */
const GNPC_LINES=['어서 와요! 식물 도감을 다 채운 사람만 이 섬에 들어올 수 있어요.','정원에 섬의 식물 열두 가지가 다 자라고 있어요. 천천히 구경해요.','향로버섯은 나무가 가장 빽빽한 숲 그늘에서 자란대요.','온실 안은 늘 따뜻해요. 벌들도 거기서 쉬어 가요.','큰 나무 아래 의자에 앉으면 바람 소리가 들려요.'];
DECO.pgate={g:'pl_pgate',s:1,bx:1.5,bz:.18,hp:1e9};   /* 식물섬 문: 닫혀 있을 때만 막혀요(s.open) */
DECO.pstall={g:'nil',s:1,bx:1.25,bz:.45,hp:1e9};      /* 정원사 판매대: [말 걸기] */
PLACES.push({k:'pis',n:PIS.n,x:PIS.x,z:PIS.z,c:PIS.c});
if(typeof NOB_N!=='undefined')NOB_N.pis=PIS.n;
const piDexN=()=>typeof PLANTS==='undefined'?0:PLANTS.filter(q=>S.pdex&&S.pdex[q.id]).length;
const piDexAll=()=>typeof PLANTS!=='undefined'&&piDexN()>=PLANTS.length;
/* 그린 선의 반지름(가운데에서 각도 th 방향) — 72개 값 사이를 부드럽게(캣멀롬) */
function piR(th){const n=PIS_R.length,t=(((th/(Math.PI*2))%1)+1)%1*n,i=Math.floor(t),f=t-i,R=k=>PIS_R[((i+k)%n+n)%n],p0=R(-1),p1=R(0),p2=R(1),p3=R(2);
 return p1+.5*f*(p2-p0+f*(2*p0-5*p1+4*p2-p3+f*(3*(p1-p2)+p3-p0)))}
/* 절벽 안쪽인지(m: 벽에서 떨어질 여유, 대략) */
function piInside(x,z,m=0){const dx=x-PIS.x,dz=z-PIS.z;return Math.hypot(dx,dz)<piR(Math.atan2(dz,dx))+PIS.off-m}

/* ---------- 절벽 기둥(둘레 점) 만들기: 안쪽 면 점 i, 바깥 면 점 o, 두께 T, 바다 가까움 s ---------- */
function piCols(){const N=144,C=[],P=th=>{const r=piR(th);return[PIS.x+Math.cos(th)*r,PIS.z+Math.sin(th)*r]};
 for(let i=0;i<N;i++){const th=i/N*Math.PI*2,p=P(th),a=P(th-.012),b=P(th+.012),tx=b[0]-a[0],tz=b[1]-a[1],L=Math.hypot(tx,tz);let nx=tz/L,nz=-tx/L;if(nx*Math.cos(th)+nz*Math.sin(th)<0){nx=-nx;nz=-nz}
  const ix=p[0]+nx*PIS.off,iz=p[1]+nz*PIS.off;let sea=0;for(let d=.5;d<=9;d+=.5)if(hAt(ix+nx*d,iz+nz*d)<-.3){sea=d;break}
  C.push({th,ix,iz,nx,nz,T:sea?Math.min(9.5,Math.max(PIS.T0,sea+1.3)):PIS.T0,s:sea?clamp(1-(sea-1.5)/6,0,1):0})}
 /* 두께·바다 정도를 둘레를 따라 부드럽게(넓게 덮도록 이웃 최대값 → 평균) */
 const smooth=(k,w)=>{const mx=C.map((c,i)=>{let m=0;for(let d=-2;d<=2;d++)m=Math.max(m,C[(i+d+N)%N][k]);return m});C.forEach((c,i)=>{let v=0,ws=0;for(let d=-w;d<=w;d++){const q=Math.exp(-d*d/(w*.8));v+=mx[(i+d+N)%N]*q;ws+=q}c[k]=v/ws})};
 smooth('T',3);smooth('s',4);
 /* 문 자리: 남쪽 PIS.gx 둘레를 곧게(x축과 나란히) */
 const g=C.filter(c=>c.iz>PIS.z&&Math.abs(c.ix-PIS.gx)<4.6),gzi=g.reduce((a,c)=>a+c.iz,0)/g.length;PIS.gzi=gzi;PIS.gzo=gzi+PIS.T0;
 for(const c of C){if(c.iz<PIS.z)continue;const d=Math.abs(c.ix-PIS.gx);if(d>=8)continue;const w=1-sm(4.6,8,d);c.iz+=(gzi-c.iz)*w;c.nx*=1-w;c.nz+=(1-c.nz)*w;const l=Math.hypot(c.nx,c.nz);c.nx/=l;c.nz/=l;c.T+=(PIS.T0-c.T)*w;c.s*=1-w;c.gw=w}
 /* 문 통로(폭 3.1m)를 비우고, 서쪽 끝에서 시작해 한 바퀴 돌아 동쪽 끝에서 끝나는 띠로 */
 const keep=C.filter(c=>!(c.iz>PIS.z&&Math.abs(c.ix-PIS.gx)<1.55));let k=0;for(let i=0;i<keep.length;i++){const a=keep[i],b=keep[(i+1)%keep.length];if(a.iz>PIS.z&&b.iz>PIS.z&&a.ix>PIS.gx&&b.ix<PIS.gx){k=(i+1)%keep.length;break}}
 const R=keep.slice(k).concat(keep.slice(0,k)),end=x=>({th:0,ix:x,iz:gzi,nx:0,nz:1,T:PIS.T0,s:0,gw:1,cap:1});R.unshift(end(PIS.gx-1.55));R.push(end(PIS.gx+1.55));
 R.forEach((c,i)=>{c.ox=c.ix+c.nx*c.T;c.oz=c.iz+c.nz*c.T;c.i=i;const gi=hAt(c.ix,c.iz),gm=Math.max(gi,hAt((c.ix+c.ox)/2,(c.iz+c.oz)/2),.95);c.gi=gi;c.go=hAt(c.ox,c.oz);
  c.top=gm+PIS.H0+2.2*c.s+(c.cap?0:(plWave(i/R.length,3,.42)+(hash(i>>2,5,79)-.5)*.3)*(1-(c.gw||0)*.8))});return R}

/* ---------- 절벽 메시: 안쪽 면·바깥 면(층마다 턱) + 꼭대기 풀 + 늘어진 풀 + 문 옆 잘린 면 ---------- */
function piCliff(C){const g=new PLGeo(),UP=[0,1,0],n=C.length;
 /* 면 단면: [높이 비율(0=바닥,1=꼭대기), 바위 속으로 들어간 정도, 층] — 아래가 살짝 튀어나오고 위로 갈수록 뒤로 물러나요 */
 const PI_=[[-1,-.24,0],[.34,0,0],[.34,.15,1],[.68,.27,1],[.68,.39,2],[1,.5,2]],PO_=[[-1,-.26,0],[.3,0,0],[.3,.17,1],[.63,.3,1],[.63,.43,2],[1,.56,2]];
 const ring=(c,inner,q,ri)=>{const P=inner?PI_[ri]:PO_[ri],dir=inner?1:-1,j=c.cap?0:plWave(c.i/n,inner?ri*2+1:ri*2+7,.24)+(hash(c.i>>1,(ri>>1)+(inner?0:9),71)-.5)*.26+(hash(c.i,ri,72)-.5)*.06;
  const bx=inner?c.ix:c.ox,bz=inner?c.iz:c.oz,base=inner?c.gi-.3:(c.go>.3?c.go-.3:Math.min(c.go,0)-1.3),y=P[0]<0?base:base+(c.top-base)*P[0]+(P[0]<1&&!c.cap?(hash(c.i,ri,77)-.5)*.08:0),o=(P[1]+(P[0]<0?0:j))*dir;
  return[bx+c.nx*o,y,bz+c.nz*o]};
 const R_I=PI_.map((q,ri)=>C.map(c=>ring(c,1,q,ri))),R_O=PO_.map((q,ri)=>C.map(c=>ring(c,0,q,ri)));
 const col=(P,ri,i)=>{const b=P[ri][2],lip=ri>0&&P[ri][0]===P[ri-1][0];if(ri===P.length-1)return plCol(0x7a9a52,.95+hash(i,9,5)*.1);return plRock(b,i,(lip?1.12:1)*(.93+hash(i>>1,b,74)*.14))};
 const band=(RS,P,inner)=>{for(let r=0;r<RS.length-1;r++){const A=RS[r],B=RS[r+1];for(let i=0;i<n-1;i++){const c=C[i],dir=inner?[-c.nx,0,-c.nz]:[c.nx,0,c.nz],lip=Math.abs(A[i][1]-B[i][1])<.12;
   let ca=col(P,r,i),cb=col(P,r,i+1),cc=col(P,r+1,i+1),cd=col(P,r+1,i);if(lip&&hash(i,r,83)>.62){const m=plCol(0x6f9a4a,.9+hash(i,r,84)*.15);cc=cd=m}
   g.quad(A[i],A[i+1],B[i+1],B[i],ca,cb,cc,cd,lip?UP:dir)}}};
 band(R_I,PI_,true);band(R_O,PO_,false);
 /* 문 옆 잘린 면(통로 벽): 첫 기둥·마지막 기둥의 단면 */
 for(const [k,sx] of [[0,1],[n-1,-1]]){const pts=R_I.map(r=>r[k]).concat(R_O.map(r=>r[k]).reverse()),cx=pts.reduce((a,p)=>a+p[0],0)/pts.length,cy=pts.reduce((a,p)=>a+p[1],0)/pts.length,cz=pts.reduce((a,p)=>a+p[2],0)/pts.length;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],c=plRock(1,i,1.05);g.tri([cx,cy,cz],a,b,c,c,c,[sx,0,0])}}
 const m=mesh(g.build(48),PLM2());m.receiveShadow=true;scene.add(m);
 /* 꼭대기 풀(TERR): 안쪽 끝 → 바깥 끝 네 줄, 가운데는 살짝 볼록 */
 const t=new PLGeo(),top=C.map((c,i)=>{const a=R_I[R_I.length-1][i],b=R_O[R_O.length-1][i];return[0,.33,.67,1].map((u,k)=>[a[0]+(b[0]-a[0])*u,c.top+(k===1||k===2?.1+noise(a[0]*.3,a[2]*.3,13)*.22:0),a[2]+(b[2]-a[2])*u])});
 const gc=(i,k)=>plCol(k===0||k===3?0x6ea844:0x74b545,.92+hash(i,k+2,9)*.16);
 for(let i=0;i<n-1;i++)for(let k=0;k<3;k++)t.quad(top[i][k],top[i+1][k],top[i+1][k+1],top[i][k+1],gc(i,k),gc(i+1,k),gc(i+1,k+1),gc(i,k+1),UP);
 for(const [k,sx] of [[0,1],[n-1,-1]])for(let q=0;q<3;q++){const a=top[k][q],b=top[k][q+1],d=[a[0],a[1]-.2,a[2]],e=[b[0],b[1]-.2,b[2]],c=gc(k,q);t.quad(a,b,e,d,c,c,c,c,[sx,0,0])}
 const cap=mesh(t.build(),TERR);cap.receiveShadow=true;scene.add(cap);
 const s=new PLGeo(),sc=i=>plCol(0x5f9a3c,.9+hash(i,4,9)*.12);for(let i=0;i<n-1;i++){const c=C[i];for(const [k,dir] of [[0,[-c.nx,0,-c.nz]],[3,[c.nx,0,c.nz]]]){const a=top[i][k],b=top[i+1][k],d0=[a[0],a[1]-.26,a[2]],d1=[b[0],b[1]-.26,b[2]];s.quad(a,b,d1,d0,sc(i),sc(i+1),sc(i+1),sc(i),dir)}}
 scene.add(mesh(s.build(40),PLM2()));return top}

/* ---------- 절벽 충돌: 기둥 둘 사이마다 띠 두께만큼의 상자(바다 쪽은 물속까지) ---------- */
function piCliffWalls(C){const n=C.length;for(let i=0;i<n-1;i++){const a=C[i],b=C[i+1],ma=[(a.ix+a.ox)/2,(a.iz+a.oz)/2],mb=[(b.ix+b.ox)/2,(b.iz+b.oz)/2];let ux=mb[0]-ma[0],uz=mb[1]-ma[1];const L=Math.hypot(ux,uz);if(L<.05)continue;ux/=L;uz/=L;
  const e0=a.cap?0:.12,e1=b.cap?0:.12,A=[ma[0]-ux*e0,ma[1]-uz*e0],B=[mb[0]+ux*e1,mb[1]+uz*e1],hl=Math.ceil((L+e0+e1)/2*20)/20,ht=Math.ceil((Math.max(a.T,b.T)/2+.08)*20)/20;
  addStruct({t:PLB(hl,ht),x:(A[0]+B[0])/2,z:(A[1]+B[1])/2,r:Math.atan2(-(B[1]-A[1]),B[0]-A[0]),hp:1e9})}}

/* ---------- 모델: 식물섬 문(돌기둥 + 덩굴 지붕 + 나무 문짝 둘) ---------- */
function piGateModel(){const R=(w,h,d,c,b)=>lkRb(w,h,d,c===undefined?.05:c,b===undefined?.03:b),ST=[0xd8d1c3,0xcbc3b4,0xe2dccf],WD=[0xd6965a,0xc98a50,0xdba068],CR=0xf7f0e3,LF=[0x5f9a3c,0x6ea844,0x4f8a3c],FL=[0xf28bb0,0xffd35c,0xf7f0e3,0xe0533f],base=[];
 /* 돌기둥: 엇갈려 쌓은 다듬은 돌 + 갓돌 + 등불 */
 for(const sx of[-1,1]){const x=sx*1.9;for(let k=0;k<7;k++){const h=.5,y=-.3+k*h+h/2,o=k%2?.04:-.04;base.push(pt(R(.74+(k%2)*.06,h-.03,.86-(k%2)*.06,.06,.04),ST[(k+(sx>0?1:0))%3],[x+o*sx,y,.05]))}
  base.push(pt(R(.92,.16,1.0,.05,.04),0xb9b1a2,[x,3.26,.05]),pt(R(.7,.12,.78,.04,.03),ST[2],[x,3.4,.05]));
  base.push(pt(R(.06,.36,.06,.02,.01),0x3a3f4a,[x-sx*.42,2.35,.55]),pt(R(.24,.08,.24,.03,.02),0x3a3f4a,[x-sx*.42,2.15,.55]),pt(R(.2,.3,.2,.04,.02),0x3a3f4a,[x-sx*.42,1.95,.55]),pt(R(.28,.06,.28,.03,.02),0x3a3f4a,[x-sx*.42,1.78,.55]))}
 /* 나무 들보 + 이끼색 판 지붕 + 걸린 간판 */
 base.push(pt(R(4.7,.3,.4,.06,.04),0x9c6a3d,[0,3.62,.05]),pt(R(4.9,.12,.6,.04,.03),0x7d5232,[0,3.83,.05]));
 for(const sz of[-1,1])base.push(pt(R(5.2,.1,.62,.04,.03),0x5f8f5a,[0,4.02,.05+sz*.27],[sz*.42,0,0]));base.push(pt(R(5.3,.12,.16,.05,.03),0x4f7a4a,[0,4.16,.05]));
 base.push(pt(R(2.3,.62,.1,.08,.04),0x8a5a36,[0,3.08,.36]),pt(R(2.12,.48,.04,.06,.02),CR,[0,3.08,.42]));
 for(const sx of[-1,1])base.push(pt(R(.04,.32,.04,.01,.01),0x5b3d2b,[sx*.85,3.42,.36]));
 /* 덩굴: 기둥을 감고 들보를 따라 늘어진 잎 덩어리 + 꽃 */
 const leaf=(x,y,z,r,i)=>{base.push(pt(new THREE.IcosahedronGeometry(r,0),LF[i%3],[x,y,z],[i*.7,i*1.3,0]));if(i%3===0)base.push(pt(new THREE.SphereGeometry(r*.42,7,5),FL[(i/3|0)%4],[x+r*.5,y+r*.3,z+r*.55]))};
 let li=0;for(const sx of[-1,1])for(let k=0;k<11;k++){const a=k*1.25+(sx>0?1.7:0),y=.4+k*.29,x=sx*1.9+Math.cos(a)*.45,z=.05+Math.sin(a)*.5;leaf(x,y,z,.17+hash(k,sx+2,31)*.07,li++)}
 for(let k=0;k<17;k++){const x=-2.3+k*.29,y=3.5+Math.sin(k*1.7)*.08;leaf(x,y,.32+hash(k,3,32)*.12,.16+hash(k,4,32)*.06,li++);if(k%3===1){const dl=.25+hash(k,5,32)*.45;for(let q=0;q<3;q++)leaf(x+(hash(k,q,33)-.5)*.1,y-.18-q*dl/3,.38,.11,li++)}}
 /* 문짝: 세로 널 다섯 + 크림 가로대 둘 + 엇대 + 쇠고리 손잡이 (경첩이 기둥 쪽) */
 const door=sx=>{const q=[],W=1.48;for(let k=0;k<5;k++){const x=-sx*(k*.296+.148);q.push(pt(R(.285,2.32,.1,.04,.02),WD[k%3],[x,1.16,0]))}
  for(const y of[.42,1.9])q.push(pt(R(W-.06,.14,.05,.03,.02),CR,[-sx*W/2,y,.07]));const dx=W-.24,dy=1.34,ang=Math.atan2(dy,dx)*sx;q.push(pt(R(Math.hypot(dx,dy),.12,.04,.03,.02),CR,[-sx*W/2,1.16,.08],[0,0,ang]));
  q.push(pt(new THREE.TorusGeometry(.09,.022,6,12),0x3a3f4a,[-sx*(W-.2),1.1,.12]),pt(R(.08,.08,.05,.02,.01),0x3a3f4a,[-sx*(W-.2),1.2,.1]));
  for(const y of[.42,1.9])q.push(pt(R(.22,.1,.04,.02,.01),0x3a3f4a,[-sx*.1,y,.09]));q.push(pt(new THREE.SphereGeometry(.13,8,6),LF[0],[-sx*W/2,2.42,.06]),pt(new THREE.SphereGeometry(.07,7,5),FL[0],[-sx*W/2+.08,2.48,.14]));return q};
 lkModel('pl_pgate',base,{l:{g:door(-1),pv:[-1.5,0,0]},r:{g:door(1),pv:[1.5,0,0]}});for(const k of['pl_pgate','pl_pgate_b','pl_pgate_l','pl_pgate_r'])if(GEO[k]){lkSmooth(GEO[k],40);lkAO(GEO[k])}}

/* ---------- 모델: 유리 온실 ---------- */
let PIGLASS=null;const piGlassMat=()=>PIGLASS||(PIGLASS=new THREE.MeshLambertMaterial({color:0xd8f4f1,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}));
function piGlassGeo(){const W=7.2,D=4.4,H=2.35,RS=1.45,B=.42,FR=0xf4f2ec,p=[],gl=[],R=(w,h,d,c)=>lkRb(w,h,d,.025,.015);
 p.push(pt(lkRb(W+.34,B,D+.34,.06,.04),0xc77a52,[0,B/2,0]),pt(lkRb(W+.42,.07,D+.42,.03,.02),0xf1e8d6,[0,B+.03,0]));
 for(let k=0;k<4;k++)for(const sz of[-1,1])p.push(pt(lkRb(W+.36,.025,.02,.01,.01),0xa9603f,[0,.11+k*.1,sz*(D/2+.175)]));
 const y0=B+.06,yt=y0+H;
 for(let i=0;i<=6;i++){const x=-W/2+i*W/6;for(const sz of[-1,1])p.push(pt(R(.09,H,.09),FR,[x,y0+H/2,sz*D/2]))}
 for(let i=1;i<3;i++){const z=-D/2+i*D/3;for(const sx of[-1,1])p.push(pt(R(.09,H,.09),FR,[sx*W/2,y0+H/2,z]))}
 for(const sz of[-1,1])p.push(pt(R(W+.12,.1,.12),FR,[0,yt,sz*D/2]),pt(R(W+.1,.06,.06),FR,[0,y0+H*.45,sz*D/2]));for(const sx of[-1,1])p.push(pt(R(.12,.1,D+.12),FR,[sx*W/2,yt,0]),pt(R(.06,.06,D),FR,[sx*W/2,y0+H*.45,0]));
 /* 지붕: 용마루(x축) + 서까래 + 꼭대기 환기창 */
 const ang=Math.atan2(RS,D/2),len=Math.hypot(RS,D/2);for(let i=0;i<=6;i++){const x=-W/2+i*W/6;for(const sz of[-1,1])p.push(pt(R(.08,.08,len),FR,[x,yt+RS/2,sz*D/4],[sz*ang,0,0]))}
 p.push(pt(R(W+.3,.14,.16),FR,[0,yt+RS+.02,0]));for(const sz of[-1,1])p.push(pt(R(W+.2,.06,.07),FR,[0,yt+RS/2,sz*D/4],[sz*ang,0,0]));
 p.push(pt(R(1.8,.06,.7),FR,[1.4,yt+RS-.18,-.45],[-ang+.25,0,0]));
 /* 문(앞 가운데) + 위 간판 자리 */
 p.push(pt(R(.1,2.05,.1),FR,[-.68,y0+1.02,D/2+.04]),pt(R(.1,2.05,.1),FR,[.68,y0+1.02,D/2+.04]),pt(R(1.46,.1,.1),FR,[0,y0+2.05,D/2+.04]),pt(R(.06,2.0,.06),FR,[0,y0+1.0,D/2+.05]));
 p.push(pt(new THREE.SphereGeometry(.04,6,4),0xe9c046,[-.1,y0+1.0,D/2+.1]),pt(new THREE.SphereGeometry(.04,6,4),0xe9c046,[.1,y0+1.0,D/2+.1]));
 /* 유리: 벽 넷 + 지붕 둘 + 박공 */
 const gp=(w,h,pos,rot)=>gl.push(pt(new THREE.PlaneGeometry(w,h),0xffffff,pos,rot));
 for(const sz of[-1,1])for(let i=0;i<6;i++){const x=-W/2+(i+.5)*W/6;if(sz>0&&(i===2||i===3)){gp(W/6-.1,H-2.1,[x+(i===2?.0:0),yt-(H-2.1)/2,D/2]);continue}gp(W/6-.06,H-.08,[x,y0+H/2,sz*D/2])}
 for(const sx of[-1,1])gp(D-.08,H-.08,[sx*W/2,y0+H/2,0],[0,Math.PI/2,0]);
 for(const sz of[-1,1])gp(W,len,[0,yt+RS/2,sz*D/4],[-Math.PI/2+sz*(Math.PI/2-ang),0,0]);
 {const sh=new THREE.Shape();sh.moveTo(-D/2,0);sh.lineTo(D/2,0);sh.lineTo(0,RS);sh.lineTo(-D/2,0);const tg=new THREE.ShapeGeometry(sh);for(const sx of[-1,1])gl.push(pt(tg,0xffffff,[sx*W/2,yt,0],[0,Math.PI/2,0]))}
 gp(1.24,1.92,[0,y0+1.0,D/2+.04]);
 /* 안: 화분 선반 둘 + 작은 야자 + 걸린 화분 + 꽃 */
 for(const sz of[-1.5,1.2]){p.push(pt(lkRb(W-1.0,.08,.6,.03,.02),0xb98556,[0,y0+.72,sz]));for(const sx of[-2.8,-.2,2.6])p.push(pt(lkRb(.07,.72,.5,.02,.01),0x8a5a36,[sx,y0+.36,sz]));
  for(let k=0;k<7;k++){const x=-2.7+k*.9,c=[0xc77a52,0xd98c5f,0xb86a45][k%3];p.push(pt(cyl(.18,.13,.26,10),c,[x,y0+.89,sz]),pt(new THREE.IcosahedronGeometry(.24+hash(k,2,41)*.08,0),[0x5f9a3c,0x6ea844,0x4f8a3c][k%3],[x,y0+1.16,sz],[k,k*2,0]));
   if(k%2===0)p.push(pt(new THREE.SphereGeometry(.08,6,4),[0xf28bb0,0xffd35c,0xe0533f,0xb38cff][k/2|0],[x+.08,y0+1.32,sz+.08]))}}
 p.push(pt(cyl(.36,.28,.5,12),0xc77a52,[2.9,y0+.25,0]),pt(cyl(.07,.1,1.6,8),0x9c6a3d,[2.9,y0+1.3,0]));for(let k=0;k<7;k++){const a=k/7*Math.PI*2;p.push(pt(lkRb(.9,.04,.22,.02,.01),0x4f8a3c,[2.9+Math.cos(a)*.42,y0+2.08-.1,Math.sin(a)*.42],[0,-a,-.45]))}
 for(const x of[-2.4,-.8,.8]){p.push(pt(cyl(.006,.006,.5,4),0x5b3d2b,[x,yt-.25,0]),pt(cyl(.16,.12,.18,10),0xd98c5f,[x,yt-.58,0]),pt(new THREE.IcosahedronGeometry(.2,0),0x6ea844,[x,yt-.48,0]));for(let q=0;q<3;q++)p.push(pt(new THREE.IcosahedronGeometry(.08,0),0x5f9a3c,[x+(q-1)*.12,yt-.78-q*.08,.05]))}
 const g=mg(p);lkSmooth(g,40);lkAO(g);return{g,gl:mg(gl)}}

/* ---------- 모델: 꽃 피는 큰 나무 + 둥근 의자 ---------- */
function piBigTree(){const p=[],gl=[],TR=0x7a5236,TR2=0x6a4630;
 p.push(pt(cyl(.42,.62,3.4,12),TR,[0,1.7,0]),pt(cyl(.62,.78,.5,12),TR2,[0,.25,0]));
 for(let k=0;k<5;k++){const a=k/5*Math.PI*2+.4;p.push(pt(lkRb(.9,.36,.34,.12,.08),TR2,[Math.cos(a)*.62,.14,Math.sin(a)*.62],[0,-a,-.32]))}
 for(const [a,e,l,r] of [[.3,.85,2.2,.2],[2.4,.8,2.0,.18],[4.3,.9,2.1,.19],[1.4,1.15,1.6,.15],[3.4,1.2,1.5,.14]]){const s=[0,2.7+(a%1)*.6,0],t=[Math.cos(a)*Math.sin(e)*l,2.7+Math.cos(e)*l+.4,Math.sin(a)*Math.sin(e)*l];p.push(lkRod(s,t,r,TR,8))}
 const CN=[[0,5.4,0,2.1],[1.5,4.7,.4,1.5],[-1.4,4.8,.5,1.55],[.5,4.6,-1.4,1.45],[-.5,4.75,1.4,1.4],[1.2,5.8,-.7,1.2],[-1.0,5.9,-.4,1.25],[.2,6.5,.3,1.1]];
 CN.forEach(([x,y,z,r],i)=>p.push(pt(new THREE.IcosahedronGeometry(r,1),[0x4f8a3c,0x5f9a3c,0x6ea844,0x5a9440][i%4],[x,y,z],[i,i*.7,0],[1,.86,1])));
 /* 분홍 꽃송이: 잎 덩어리 겉에 */
 for(let k=0;k<46;k++){const c=CN[k%CN.length],a=hash(k,1,51)*Math.PI*2,e=hash(k,2,51)*1.3,x=c[0]+Math.cos(a)*Math.sin(e)*c[3]*.98,y=c[1]+Math.cos(e)*c[3]*.84,z=c[2]+Math.sin(a)*Math.sin(e)*c[3]*.98;
  if(z<-1.2&&y<5.2)continue;p.push(pt(new THREE.IcosahedronGeometry(.13+hash(k,3,51)*.06,0),[0xf7a8c4,0xf28bb0,0xfbd3e0][k%3],[x,y,z]))}
 /* 둥근 의자: 판자 12조각 + 다리 */
 const n=14;for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;p.push(pt(lkRb(.62,.08,.46,.03,.02),i%2?0xc08d5c:0xb98556,[Math.cos(a)*1.42,.47,Math.sin(a)*1.42],[0,-a+Math.PI/2,0]));if(i%2===0)p.push(pt(lkRb(.08,.43,.08,.02,.01),0x7d5232,[Math.cos(a)*1.42,.22,Math.sin(a)*1.42]))}
 for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;p.push(pt(lkRb(.66,.07,.07,.02,.01),0x9c6a3d,[Math.cos(a)*1.66,.44,Math.sin(a)*1.66],[0,-a+Math.PI/2,0]))}
 /* 낮은 가지에 걸린 등불 둘 */
 for(const [x,z] of [[1.5,.55],[-1.2,1.1]]){p.push(pt(cyl(.008,.008,.5,4),0x3a3f4a,[x,3.55,z]),pt(lkRb(.2,.06,.2,.02,.01),0x3a3f4a,[x,3.3,z]),pt(lkRb(.16,.05,.16,.02,.01),0x3a3f4a,[x,2.98,z]));gl.push(pt(lkRb(.14,.26,.14,.03,.02),0xffd58a,[x,3.14,z]))}
 const g=mg(p);lkSmooth(g,50);lkAO(g);return{g,gl:mg(gl)}}

/* ---------- 모델: 화단(나무 틀 + 흙 + 이름표 말뚝) ---------- */
function piBedGeo(mush){const p=[],W=2.3,D=1.36,H=.38;
 if(!mush){for(const sz of[-1,1])p.push(pt(lkRb(W,H,.12,.04,.02),0xb98556,[0,H/2,sz*(D/2-.06)]));for(const sx of[-1,1])p.push(pt(lkRb(.12,H,D-.2,.04,.02),0xa67848,[sx*(W/2-.06),H/2,0]));
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])p.push(pt(lkRb(.16,H+.06,.16,.04,.03),0x8a5a36,[sx*(W/2-.06),(H+.06)/2,sz*(D/2-.06)]));
  p.push(pt(lkRb(W-.2,.05,D-.2,.02,.01),0x5b4636,[0,H-.05,0]));for(let k=0;k<3;k++)p.push(pt(lkRb(W-.36,.035,.12,.02,.01),0x6b5240,[0,H-.02,-.38+k*.38]))}
 else{p.push(pt(lkRb(W,.1,D,.05,.03),0x6b5240,[0,.05,0]),pt(cyl(.26,.3,1.9,12),0x8a5a36,[0,.3,-.25],[0,0,Math.PI/2]),pt(cyl(.27,.27,.03,12),0xd9b98a,[.96,.3,-.25],[0,0,Math.PI/2]));
  for(let k=0;k<9;k++)p.push(pt(new THREE.IcosahedronGeometry(.14+hash(k,1,61)*.08,0),[0x6f9a4a,0x5f8f42,0x7aa652][k%3],[-.85+k*.21,.48+hash(k,2,61)*.06,-.28+(hash(k,3,61)-.5)*.24],[k,k,0],[1,.55,1]));
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;p.push(lkBoulder(.12+hash(k,4,61)*.05,0xa9a296,k*3,[Math.cos(a)*1.05,0,Math.sin(a)*.6+.1],.5))}}
 p.push(pt(lkRb(.05,.5,.05,.02,.01),0x7d5232,[-.25,.25,D/2+.2]),pt(lkRb(.05,.5,.05,.02,.01),0x7d5232,[.25,.25,D/2+.2]),pt(lkRb(.7,.27,.05,.04,.02),0x8a5a36,[0,.52,D/2+.21],[-.3,0,0]));
 const g=mg(p);lkSmooth(g,40);return g}
/* 이름표 글자: 12장을 한 장 그림(4×3)에 그려 한 메시로 */
function piNamePlates(list){const cv=document.createElement('canvas');cv.width=1024;cv.height=288;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;
 const draw=()=>{const x=cv.getContext('2d'),F=typeof UIF!=='undefined'?UIF:'sans-serif';x.clearRect(0,0,1024,288);list.forEach((q,i)=>{const cx=(i%4)*256,cy=((i/4)|0)*96;x.fillStyle='#f7f0e3';x.fillRect(cx+6,cy+6,244,84);x.fillStyle=PCAT[q.cat][1];x.fillRect(cx+6,cy+6,14,84);
  x.fillStyle='#4a2f20';x.font=`900 ${q.n.length>4?40:48}px ${F}`;x.textAlign='center';x.textBaseline='middle';x.fillText(q.n,cx+134,cy+50)});tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
 const pos=[],uv=[],idx=[];list.forEach((q,i)=>{const u0=(i%4)/4,u1=u0+.25,v1=1-((i/4)|0)/3,v0=v1-1/3,[x,y,z]=q.at,w=.32,h=.11,c=Math.cos(-.3),s=Math.sin(-.3),b=pos.length/3;
  for(const [dx,dy] of [[-w,-h],[w,-h],[w,h],[-w,h]])pos.push(x+dx,y+dy*c,z+dy*s);uv.push(u0,v0+.02,u1,v0+.02,u1,v1-.02,u0,v1-.02);idx.push(b,b+1,b+2,b,b+2,b+3)});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tx}));scene.add(m);return m}

/* ---------- 모델: 정원사 판매대(꽃 양동이·씨앗 봉투·줄무늬 차양) ---------- */
function piStallGeo(){const p=[],WD=0xb9773f,CR=0xf0d9a8;p.push(pt(lkRb(2.4,.88,.8,.08,.04),WD,[0,.44,0]),pt(lkRb(2.52,.08,.92,.04,.03),CR,[0,.92,0]));for(let i=0;i<5;i++)p.push(pt(lkRb(.06,.7,.03,.02,.01),0x8f5a30,[-.96+i*.48,.44,.41]));
 p.push(pt(lkRb(2.2,.3,.04,.04,.02),0x5f9a6a,[0,.66,.42]));
 for(const [x,c] of [[-.85,[0xf28bb0,0xe0533f,0xfbd3e0]],[-.35,[0xffd35c,0xf2a33c,0xfff0b0]],[.2,[0x6f8fe0,0xb38cff,0xf7f0e3]]]){p.push(pt(cyl(.17,.13,.3,12),0xa9b3bb,[x,1.11,0]),pt(cyl(.175,.175,.03,12),0xc9cdd2,[x,1.26,0]));
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2,r=k?.1:0;p.push(pt(cyl(.008,.008,.34,4),0x5f9a3c,[x+Math.cos(a)*r,1.4,Math.sin(a)*r]),pt(new THREE.IcosahedronGeometry(.07,0),c[k%3],[x+Math.cos(a)*r*1.3,1.58+hash(k,1,71)*.06,Math.sin(a)*r*1.3]))}}
 for(let k=0;k<4;k++)p.push(pt(lkRb(.16,.22,.03,.02,.01),[0xffd35c,0x6ea844,0xf28bb0,0x6f8fe0][k],[.62+k*.14,1.07,.18],[-.2,0,(k-1.5)*.08]));
 p.push(pt(cyl(.15,.11,.2,10),0xc77a52,[.95,1.06,-.15]),pt(new THREE.IcosahedronGeometry(.17,0),0x5f9a3c,[.95,1.24,-.15]));
 /* 주인 뒤 꽃 선반(차양 대신: 위에서 내려다보는 카메라에 주인이 가리지 않게) */
 const bz=-1.75;for(const sx of[-1,1])p.push(pt(lkRb(.1,2.1,.1,.03,.02),0x8a5a36,[sx*1.2,1.05,bz]));for(const y of[.55,1.15,1.75])p.push(pt(lkRb(2.5,.06,.36,.02,.01),0xb98556,[0,y,bz]));
 p.push(pt(lkRb(2.62,.12,.42,.04,.02),0x5fae7e,[0,2.12,bz]),pt(lkRb(2.62,.06,.44,.03,.02),0xf7f0e3,[0,2.03,bz]));
 for(const [y,o] of [[.55,0],[1.15,1],[1.75,2]])for(let k=0;k<5;k++){const x=-.96+k*.48,c=[0xc77a52,0xd98c5f,0xb86a45][(k+o)%3];p.push(pt(cyl(.12,.09,.17,10),c,[x,y+.11,bz]),pt(new THREE.IcosahedronGeometry(.15,0),[0x5f9a3c,0x6ea844,0x4f8a3c][(k+o)%3],[x,y+.27,bz],[k,k+o,0]));
  if((k+o)%2===0)p.push(pt(new THREE.IcosahedronGeometry(.065,0),[0xf28bb0,0xffd35c,0xe0533f,0xb38cff,0xf7f0e3][(k+o*2)%5],[x+.06,y+.37,bz+.06]))}
 const g=mg(p);lkSmooth(g,40);lkAO(g);return g}

/* ---------- 모델: 장미 아치 ---------- */
function piArchGeo(){const p=[],W=1.35,H=2.25,WH=0xf7f0e3,LF=[0x5f9a3c,0x6ea844,0x4f8a3c],RO=[0xe0533f,0xf28bb0,0xf7f0e3,0xf2a0b8];
 for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(lkRb(.09,H,.09,.03,.02),WH,[sx*W,H/2,sz*.2]));
 for(const sx of[-1,1])for(let k=0;k<5;k++)p.push(pt(lkRb(.05,.05,.44,.02,.01),WH,[sx*W,.35+k*.45,0]));
 const arc=t=>[Math.cos(t)*W,H+Math.sin(t)*W*.75];for(const sz of[-.2,.2])for(let k=0;k<10;k++){const a=arc(Math.PI*k/10),b=arc(Math.PI*(k+1)/10);p.push(lkBeam([a[0],a[1],sz],[b[0],b[1],sz],.08,.08,WH))}
 for(let k=0;k<=10;k++){const a=arc(Math.PI*k/10);p.push(pt(lkRb(.05,.05,.44,.02,.01),WH,[a[0],a[1],0]))}
 let i=0;const leaf=(x,y,z)=>{p.push(pt(new THREE.IcosahedronGeometry(.15+hash(i,1,81)*.06,0),LF[i%3],[x,y,z],[i,i*2,0]));if(i%2===0)p.push(pt(new THREE.IcosahedronGeometry(.085,0),RO[(i/2|0)%4],[x+.08,y+.06,z+.13]));i++};
 for(let k=0;k<=16;k++){const a=arc(Math.PI*k/16);leaf(a[0]+(hash(k,2,82)-.5)*.1,a[1]+.05,(hash(k,3,82)-.5)*.3)}
 for(const sx of[-1,1])for(let k=0;k<8;k++)leaf(sx*W+(hash(k,sx+4,82)-.5)*.16,.25+k*.27,(hash(k,sx+6,82)-.5)*.36);
 const g=mg(p);lkSmooth(g,40);return g}

/* ---------- 모델: 벌통·연못·정원 소품 ---------- */
function piHiveGeo(){const p=[];for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(lkRb(.07,.36,.07,.02,.01),0x7d5232,[sx*.24,.18,sz*.2]));p.push(pt(lkRb(.66,.06,.56,.02,.02),0x8a5a36,[0,.38,0]));
 [0xf6e7b8,0xf2c94c,0xf6e7b8].forEach((c,k)=>p.push(pt(lkRb(.56,.24,.46,.03,.02),c,[0,.53+k*.25,0])));p.push(pt(lkRb(.22,.04,.03,.01,.01),0x3a3f4a,[0,.44,.235]));
 for(const sz of[-1,1])p.push(pt(lkRb(.72,.05,.38,.02,.02),0x5fae7e,[0,1.01,sz*.15],[sz*.5,0,0]));p.push(pt(lkRb(.74,.05,.06,.02,.01),0x4f8a5a,[0,1.1,0]));
 const g=mg(p);lkSmooth(g,40);return g}
const piPondR=t=>3.3+.45*Math.sin(2*t+1)+.28*Math.sin(3*t+2.2);
function piPondGeo(){const p=[],w=new PLGeo(),N=40,UP=[0,1,0],cN=plCol(0x3f86b0),cE=plCol(0x6db6d4);
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,ra=piPondR(a),rb=piPondR(b);w.tri([0,0,0],[Math.cos(a)*ra,0,Math.sin(a)*ra],[Math.cos(b)*rb,0,Math.sin(b)*rb],cN,cE,cE,UP)}
 for(let i=0;i<34;i++){const a=i/34*Math.PI*2+hash(i,1,91)*.1,r=piPondR(a)+.12;p.push(lkBoulder(.3+hash(i,2,91)*.16,[0xc9c2b4,0xb8b1a3,0xa9a296][i%3],i*7+1,[Math.cos(a)*r,-.12,Math.sin(a)*r],.5))}
 for(const [x,z,r] of [[-.9,-.6,.42],[.6,.9,.36],[1.3,-.4,.32],[-1.6,.9,.38],[.1,-1.5,.3],[-.3,.3,.28]]){p.push(pt(new THREE.CylinderGeometry(r,r,.03,12,1,false,.3,Math.PI*1.82),0x5f9a3c,[x,.11,z]))}
 for(const [x,z] of [[-.9,-.6],[-1.6,.9]])for(let k=0;k<6;k++)p.push(pt(cone(.08,.16,4),k%2?0xf7c6d6:0xf28bb0,[x+Math.cos(k)*.06,.19,z+Math.sin(k)*.06],[Math.cos(k)*.5,0,Math.sin(k)*.5]));
 for(let k=0;k<9;k++){const x=2.2+hash(k,3,92)*.8,z=-1.6+hash(k,4,92)*1.2,h=.8+hash(k,5,92)*.5;p.push(pt(cyl(.015,.02,h,4),0x6f9a4a,[x,h/2,z]),pt(cyl(.045,.045,.22,6),0x7a5236,[x,h-.05,z]))}
 const g=mg(p);lkSmooth(g,50);return{g,w:w.build()}}
function piPropsGeo(){const p=[],add=(g,x,y,z,ry=0)=>p.push(pt(g,null,[x,y,z],[0,ry,0]));
 /* 외바퀴 수레(흙 + 모종삽) */
 {const q=[pt(lkRb(.9,.3,.6,.06,.03),0x4f8a5a,[0,.52,0]),pt(lkRb(.8,.05,.5,.03,.02),0x5b4636,[0,.66,0]),pt(new THREE.TorusGeometry(.2,.06,6,14),0x3a3f4a,[.55,.24,0],[0,Math.PI/2,0]),pt(cyl(.05,.05,.2,6),0x9fa8b0,[.55,.24,0],[Math.PI/2,0,0])];
  for(const sz of[-1,1])q.push(pt(lkRb(1.1,.05,.05,.02,.01),0x9c6a3d,[-.35,.55,sz*.24],[0,0,.12]),pt(lkRb(.05,.4,.05,.02,.01),0x7d5232,[-.25,.2,sz*.22]));q.push(pt(lkRb(.06,.3,.03,.02,.01),0x9fa8b0,[.1,.78,.05],[.3,0,.4]));add(mg(q),0,0,0)}
 return mg(p)}
function piCanGeo(c){const p=[pt(cyl(.15,.17,.3,12),c,[0,.15,0]),pt(cyl(.03,.035,.42,6),c,[.24,.28,0],[0,0,-.95]),pt(cyl(.06,.04,.05,8),c,[.42,.42,0],[0,0,-.95]),pt(new THREE.TorusGeometry(.13,.025,5,10,Math.PI),c,[-.02,.3,0],[0,0,0])];return mg(p)}
function piSackGeo(c){return mg([pt(lkRb(.42,.5,.3,.12,.08),c,[0,.25,0]),pt(cyl(.07,.1,.12,8),c,[0,.54,0]),pt(cyl(.075,.075,.03,8),0x8a5a36,[0,.5,0])])}
function piPotStack(){const p=[];for(let k=0;k<4;k++)p.push(pt(cyl(.19,.14,.24,10),[0xc77a52,0xd98c5f][k%2],[0,.12+k*.09,0]));for(const [x,z] of [[.42,.1],[.3,-.32]])p.push(pt(cyl(.16,.12,.22,10),0xc77a52,[x,.11,z]));return mg(p)}
function piCompostGeo(){const p=[];for(let k=0;k<4;k++)for(const sz of[-1,1])p.push(pt(lkRb(1.1,.14,.06,.02,.01),[0xa67848,0x9c6a3d][k%2],[0,.12+k*.17,sz*.42]));for(let k=0;k<4;k++)for(const sx of[-1,1])p.push(pt(lkRb(.06,.14,.84,.02,.01),[0x9c6a3d,0xa67848][k%2],[sx*.52,.12+k*.17,0]));
 for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])p.push(pt(lkRb(.09,.74,.09,.02,.01),0x7d5232,[sx*.52,.37,sz*.42]));p.push(pt(new THREE.SphereGeometry(.5,10,6),0x5b4636,[0,.5,0],0,[1,.42,.8]));for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.08,0),[0x6ea844,0xe0a050,0x5f9a3c][k%3],[(hash(k,1,95)-.5)*.6,.68,(hash(k,2,95)-.5)*.5]));return mg(p)}
function piToolsGeo(){const p=[];p.push(pt(cyl(.025,.025,1.5,6),0x9c6a3d,[0,.75,0],[0,0,.18]),pt(lkRb(.5,.05,.06,.02,.01),0x8d969e,[-.14,1.48,0],[0,0,.18]));for(let k=0;k<6;k++)p.push(pt(cyl(.01,.01,.12,4),0x8d969e,[-.36+k*.09,1.42,0],[0,0,.18]));
 p.push(pt(cyl(.025,.025,1.4,6),0x9c6a3d,[.32,.72,.05],[0,0,.12]),pt(lkRb(.24,.3,.03,.06,.01),0x8d969e,[.24,.12,.05],[0,0,.12]));return mg(p)}

/* ---------- 식물 도감 게시판 그림 ---------- */
function piDexTex(){const cv=document.createElement('canvas');cv.width=512;cv.height=300;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;
 const draw=()=>{const x=cv.getContext('2d'),F=typeof UIF!=='undefined'?UIF:'sans-serif';x.fillStyle='#f3e6c8';x.fillRect(0,0,512,300);x.fillStyle='#5b3d2b';x.font=`900 36px ${F}`;x.textAlign='center';x.textBaseline='middle';x.fillText('🌱 식물 도감',256,32);
  const cats=Object.keys(PCAT);cats.forEach((cat,ci)=>{const cx=88+ci*168,L=PLANTS.filter(q=>q.cat===cat);x.fillStyle=PCAT[cat][1];x.beginPath();x.roundRect?x.roundRect(cx-66,62,132,34,14):x.rect(cx-66,62,132,34);x.fill();x.fillStyle='#fff';x.font=`900 22px ${F}`;x.fillText(PCAT[cat][0],cx,80);
   L.forEach((q,i)=>{const y=118+i*36;x.fillStyle=PCAT[cat][2];x.fillRect(cx-74,y-15,148,30);x.fillStyle=PCAT[cat][1];x.beginPath();x.arc(cx-56,y,8,0,7);x.fill();x.fillStyle='#4a2f20';x.font=`800 19px ${F}`;x.textAlign='left';x.fillText(q.n,cx-42,y+1);x.textAlign='center'})});tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return tx}
function piDexBoard(){const p=[...[-1.5,1.5].map(x=>pt(lkRb(.15,2.35,.15,.05,.03),0x7d5232,[x,1.17,0])),pt(lkRb(3.1,1.9,.1,.06,.03),0x8a5a36,[0,1.55,0]),pt(lkRb(3.4,.12,.5,.04,.03),0x5f8f5a,[0,2.55,.05],[.18,0,0]),pt(lkRb(3.4,.12,.5,.04,.03),0x5f8f5a,[0,2.55,-.05],[-.18,0,0])];
 for(let k=0;k<12;k++){const x=-1.62+k*.3;p.push(pt(new THREE.IcosahedronGeometry(.12,0),[0x5f9a3c,0x6ea844][k%2],[x,2.62+Math.sin(k)*.03,.18]));if(k%3===1)p.push(pt(new THREE.IcosahedronGeometry(.06,0),[0xf28bb0,0xffd35c,0xf7f0e3][k%3],[x+.06,2.68,.28]))}
 const g=mg(p);lkSmooth(g,40);const m=mesh(g,MATT),pl=new THREE.Mesh(new THREE.PlaneGeometry(2.86,1.68),new THREE.MeshLambertMaterial({map:piDexTex()}));pl.position.set(0,1.55,.06);m.add(pl);return m}

/* ---------- 정원사 옷(노란 비옷 대신 초록 멜빵) + 밀짚모자 ---------- */
let PIGM=null;function piGardenerMat(){if(PIGM)return PIGM;const src=CMAT.merchant&&CMAT.merchant.map;if(!src||typeof recolor!=='function')return null;const t=recolor(src,hueTo(isBlue,92,156,72));PIGM={s:new THREE.MeshLambertMaterial({map:t,skinning:true}),n:new THREE.MeshLambertMaterial({map:t})};return PIGM}
function piHatGeo(){const p=[pt(cyl(.5,.52,.05,20),0xe9c97a,[0,0,0]),pt(cyl(.27,.3,.26,16),0xe9c97a,[0,.15,0]),pt(cyl(.305,.305,.07,16),0x5f9a3c,[0,.06,0]),pt(new THREE.SphereGeometry(.27,14,6,0,Math.PI*2,0,Math.PI/2),0xe9c97a,[0,.28,0],0,[1,.35,1]),pt(new THREE.IcosahedronGeometry(.07,0),0xf28bb0,[.25,.1,.12]),pt(new THREE.IcosahedronGeometry(.06,0),0xffd35c,[.27,.12,0])];const g=mg(p);lkSmooth(g,45);return g}

/* ---------- 놓기 ---------- */
function plPlantIsle(){if(typeof lkModel!=='function')return;const W=(x,z)=>[x,z],gh=(x,z)=>hAt(x,z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x,z,r,hp:1e9}),at=(g,x,z,ry=0,m,dy=0)=>plAdd(g,x,gh(x,z)-.02+dy,z,ry,m);
 const C=piCols(),top=piCliff(C);piCliffWalls(C);
 /* 나무·바위 비우기(설치 금지 원보다 2m 넓게) */
 let rMax=0;for(const c of C)rMax=Math.max(rMax,Math.hypot(c.ox-PIS.x,c.oz-PIS.z));PIS.nr=Math.ceil(rMax+2.5);CLEARS.push([PIS.x,PIS.z,PIS.nr+2]);
 /* 문 */
 piGateModel();{const gz=PIS.gzo-.45,g=addStruct({t:'pgate',x:PIS.gx,z:gz,r:0});g.open=false;g.ot=0;const t=plSignText('🌱 식물섬',2.0,.44,78);t.position.set(0,3.08,.45);if(g.m)g.m.add(t);
  for(const sx of[-1,1]){const s=glow(0xffc46a,2.2,.6);s.position.set(PIS.gx+sx*1.48,gh(PIS.gx,gz)+1.95,gz+.55);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}}
 const gx=PIS.gx,gzi=PIS.gzi;
 /* 절벽 위 덤불·작은 나무, 바닥 바위 */
 {const v=[],rk=[];C.forEach((c,i)=>{if(c.cap)return;const t=top[i],m=[(t[1][0]+t[2][0])/2,(t[1][1]+t[2][1])/2,(t[1][2]+t[2][2])/2];
   if(GEO.bush&&i%5===2)v.push(pt(GEO.bush,null,[m[0]+(hash(i,1,97)-.5)*.6,m[1]-.08,m[2]+(hash(i,2,97)-.5)*.6],[0,i,0],[.5+hash(i,3,97)*.3,.45+hash(i,4,97)*.25,.5+hash(i,3,97)*.3]));
   if(c.s>.45&&i%13===6&&GEO.tree_single_B)v.push(pt(GEO.tree_single_B,null,[m[0],m[1]-.1,m[2]],[0,i,0],[1.5,1.4+hash(i,5,97)*.4,1.5]));
   if(i%3===0){const b=c.go>.3?c.go-.12:-.35,r=.4+hash(i,6,97)*.45;rk.push(lkBoulder(r,[0x84818e,0x938f9c,0x6d6a78][i%3],i*5+3,[c.ox+c.nx*(.25+r*.5),b,c.oz+c.nz*(.25+r*.5)],.6))}});
  if(v.length)plAdd(mg(v),0,0,0);const g=mg(rk);lkSmooth(g,60);lkAO(g);plAdd(g,0,0,0)}
 /* --- 안 --- */
 const PZ=[84.6,667.2],GL=[88.6,652.6],ST=[93.8,670.4],PD=[106.6,664.2],BD=[79.4,679.4];PIS.plaza=PZ;PIS.stall=ST;
 /* 큰 나무 광장 */
 {const T=piBigTree(),m=at(T.g,PZ[0],PZ[1],.3);m.add(mesh(T.gl,LKGLOW,false));bl(PZ[0],PZ[1],1.72,1.72);
  for(const [x,z] of [[1.5,.55],[-1.2,1.1]]){const c=Math.cos(.3),s=Math.sin(.3),wx=PZ[0]+x*c+z*s,wz=PZ[1]-x*s+z*c,l=glow(0xffc46a,2.4,.6);l.position.set(wx,gh(PZ[0],PZ[1])+3.14,wz);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l)}}
 /* 온실 */
 {const G=piGlassGeo(),m=at(G.g,GL[0],GL[1],0);const gm=mesh(G.gl,piGlassMat(),false);gm.renderOrder=2;m.add(gm);bl(GL[0],GL[1],3.82,2.42);
  const sign=plAdd(mg([pt(lkRb(1.3,.36,.07,.05,.02),0x8a5a36,[0,0,0])]),GL[0],gh(GL[0],GL[1])+2.98,GL[1]+2.3),t=plSignText('🌿 온실',1.2,.28,66);t.position.set(0,0,.05);sign.add(t)}
 /* 정원사 판매대 + 주인 */
 {at(piStallGeo(),ST[0],ST[1],0);addStruct({t:'pstall',x:ST[0],z:ST[1],r:0});bl(ST[0],ST[1]-1.75,1.32,.24);const nz=ST[1]-.95;addStruct({t:'iblk2',x:ST[0],z:nz,r:0});GNPC={x:ST[0],z:nz,rot:0,i:0};
  at(piCanGeo(0x5fae7e),ST[0]+1.55,ST[1]+.35,.4);at(piCanGeo(0x3d8be0),ST[0]+1.7,ST[1]-.25,-.6);at(piSackGeo(0xcdb588),ST[0]-1.6,ST[1]-.1,.2);at(piSackGeo(0xd9c49a),ST[0]-1.55,ST[1]+.45,-.3);bl(ST[0]+1.62,ST[1],.3,.5);bl(ST[0]-1.58,ST[1]+.18,.3,.5)}
 /* 식물 도감 게시판 */
 {const b=piDexBoard();b.position.set(BD[0],gh(BD[0],BD[1])-.02,BD[1]);scene.add(b);bl(BD[0],BD[1],1.62,.14)}
 /* 장미 아치(문 안) */
 {const az=gzi-2.3;at(piArchGeo(),gx,az,0);for(const sx of[-1,1])bl(gx+sx*1.35,az,.14,.3)}
 /* 식물 정원: 화단 12(작물 5 · 꽃 4 · 버섯 3) + 이름표 */
 {const L=typeof PLANTS!=='undefined'?PLANTS.slice():[],ord=['potato','wheat','strawberry','grape','avocado','poppy','flower_blue','flower_yellow','flower_black','mush_poison','mush_censer','mush'],xs=[64.8,68.6,72.4,76.2],zs=[661.4,666.6,671.8];
  const v=[],plates=[],bedA=piBedGeo(0),bedM=piBedGeo(1);ord.forEach((id,k)=>{const q=L.find(o=>o.id===id);if(!q)return;const x=xs[k%4],z=zs[(k/4)|0],y=gh(x,z)-.02,mush=q.cat==='mush';v.push(pt(mush?bedM:bedA,null,[x,y,z]));bl(x,z,1.2,.72);
   const G=GEO['pw_'+id],py=y+(mush?.1:.36);if(G){const sp=id==='avocado'||id==='grape'?[[0,-.05]]:mush?[[-.6,.12],[.15,.25],[.75,.05]]:[[-.52,-.02],[.5,.05]];sp.forEach(([dx,dz],j)=>{const s=id==='avocado'?.85:mush?.9:1;v.push(pt(G,null,[x+dx,py,z+dz],[0,hash(k,j,99)*6.28,0],[s,s,s]))})}
   plates.push({n:q.n,cat:q.cat,at:[x,y+.52+.2955*.035,z+.89+.955*.035]})});if(v.length)plAdd(mg(v),0,0,0);if(plates.length)piNamePlates(plates)}
 /* 연못 + 벤치 */
 {const P=piPondGeo(),y=gh(PD[0],PD[1]);plAdd(P.g,PD[0],y-.02,PD[1]);const w=plAdd(P.w,PD[0],y+.06,PD[1]);w.receiveShadow=true;bl(PD[0],PD[1],3.0,2.6);bl(PD[0]+2.3,PD[1]-1.0,.7,.9);
  if(GEO.lk_seat_bench){at(GEO.lk_seat_bench,PD[0]-.4,PD[1]-4.9,0);bl(PD[0]-.4,PD[1]-4.9,.75,.32)}}
 /* 벌통 셋 */
 {const h=piHiveGeo();[[99.2,676.0,-.1],[101.3,675.5,.05],[103.4,674.8,.15]].forEach(([x,z,r])=>{at(h,x,z,r);bl(x,z,.36,.3,r)})}
 /* 온실 옆 소품: 수레·화분 더미·퇴비 상자·연장 */
 at(piPropsGeo(),83.0,655.2,.5);bl(83.0,655.2,.7,.45,.5);at(piPotStack(),84.6,656.0,0);bl(84.75,655.95,.42,.38);at(piCompostGeo(),94.6,653.8,0);bl(94.6,653.8,.6,.48);at(piToolsGeo(),92.75,654.4,0);
 at(piSackGeo(0xcdb588),95.9,655.3,.4);at(piCanGeo(0x5fae7e),93.6,655.4,-.4);bl(95.9,655.3,.3,.25);
 /* 가로등 */
 {const lamp=(x,z,ry)=>{if(!GEO.plamp)return;at(GEO.plamp,x,z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(x+Math.sin(ry)*.5,gh(x,z)+2.75,z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s);bl(x,z,.14,.14)};
  lamp(gx+2.1,gzi-4.4,-Math.PI/2);lamp(79.6,669.6,Math.PI/2);lamp(90.4,659.2,0);lamp(100.2,667.9,0);lamp(70.4,676.6,0)}
 /* 줄 전구: 온실 앞 → 큰 나무 → 판매대 */
 {const P=[89.6,661.6],py=gh(P[0],P[1]);plAdd(mg([pt(cyl(.04,.055,2.95,8),0x3a3f4a,[0,1.47,0]),pt(cyl(.09,.11,.16,8),0x3a3f4a,[0,.08,0])]),P[0],py,P[1]);bl(P[0],P[1],.14,.14);
  plLights(0,0,[[[GL[0]-2.6,gh(GL[0],GL[1])+2.75,GL[1]+2.25],[P[0],py+2.9,P[1]]],[[P[0],py+2.9,P[1]],[ST[0]-1.14,gh(ST[0],ST[1])+2.4,ST[1]-.36]]])}
 /* 장식 나무·덤불·꽃 덤불 */
 {const v=[];for(const [x,z,s,r,k] of [[72.0,655.4,2.4,.4,'tree_single_A'],[110.6,659.6,2.2,1.2,'tree_single_B'],[66.2,680.0,2.1,2.1,'tree_single_A'],[98.4,656.4,2.0,.7,'tree_single_B'],[113.2,668.8,1.9,2.6,'tree_single_A']]){if(!piInside(x,z,1.5))continue;if(GEO[k])v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,r,0],[s,s,s]));bl(x,z,.3,.3)}
  if(GEO.bush)for(const [x,z,s,r] of [[61.6,666.0,.5,.3],[62.6,676.4,.55,1.3],[70.8,650.8,.5,2],[78.0,652.0,.45,.8],[100.8,654.6,.5,1.6],[114.6,663.4,.45,1.1],[108.6,672.0,.5,2.4],[92.2,678.0,.45,.6],[76.4,682.0,.5,1.9],[88.2,681.0,.42,2.8],[97.2,661.2,.4,.5]])if(piInside(x,z,.8))v.push(pt(GEO.bush,null,[x,gh(x,z)-.04,z],[0,r,0],[s,s,s]));
  const C3=[0xf28bb0,0xffd35c,0xf7f0e3,0xe0533f,0xb38cff,0x6f8fe0];let k=0;for(let tr=0;tr<400&&k<70;tr++){const x=60+hash(tr,1,101)*56,z=646+hash(tr,2,101)*36;if(!piInside(x,z,1.2))continue;
   if(Math.hypot(x-PZ[0],z-PZ[1])<5.6||Math.hypot(x-GL[0],z-GL[1])<5||Math.hypot(x-PD[0],z-PD[1])<5||Math.hypot(x-ST[0],z-ST[1])<3.2||Math.abs(x-gx)<2.6&&z>670||x>62.5&&x<78.5&&z>659.4&&z<673.6||Math.hypot(x-BD[0],z-BD[1])<2.4||x>97.6&&x<105&&z>673&&z<677.6)continue;
   const y=gh(x,z);v.push(pt(new THREE.IcosahedronGeometry(.2+hash(tr,3,101)*.1,0),[0x5f9a3c,0x6ea844][k%2],[x,y+.12,z],[k,k,0],[1.3,.7,1.3]));for(let q=0;q<4;q++){const a=q*1.7+k;v.push(pt(new THREE.IcosahedronGeometry(.07,0),C3[(k+q%2)%6],[x+Math.cos(a)*.16,y+.26+hash(q,k,102)*.06,z+Math.sin(a)*.16]))}k++}
  if(v.length){const g=mg(v);plAdd(g,0,0,0)}}
}
/* 닳은 흙길(지형 색): 문 → 광장, 광장 둘레, 광장 → 온실·판매대·정원·연못, 문 바깥 */
const PIWORN=[[[85,690.5],[85,684.5],[85,680],[84.8,675.5],[84.6,671.4]],[[85.6,663.4],[87.2,659.6],[88.6,655.6]],[[88.6,667.6],[91.2,670.0],[93.8,671.4]],[[80.6,667.4],[76.8,669.2],[62.2,669.2]],[[70.5,659.0],[70.5,674.2]],[[88.8,666.4],[95.4,665.8],[102.2,665.2]],[[85,690.5],[85.6,696],[86.8,701]]];
function plWornPI(x,z){const fx=x-PIS.x,fz=z-PIS.z;if(fx<-32||fx>32||fz<-24||fz>38)return 0;const n=noise(x*.6+5,z*.6+1,79);let w=0;
 for(const L of PIWORN)w=Math.max(w,(1-sm(.6,2.0,plSegD(x,z,L)))*.72);w=Math.max(w,(1-sm(2.4,4.6,Math.hypot(x-84.6,z-667.2)))*.8);return clamp(w*(.75+n*.5),0,1)}
{const _pw=plWornAt;plWornAt=function(x,z){return Math.max(_pw(x,z),plWornPI(x,z))}}

/* ---------- 문·주인 움직임 ---------- */
let piHooked=false;function piHook(){if(piHooked)return;piHooked=true;
 if(typeof CHAT!=='undefined'){const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){if(k==='gardener')return GNPC&&dist(GNPC.x,GNPC.z,P.x,P.z)<40?{x:GNPC.x,z:GNPC.z,y:3.05}:null;return _an(k)}}
 if(typeof drawFx==='function'){const _df=drawFx;drawFx=function(dt){_df(dt);try{if(mode!=='play'||!GNPC||!GNPC.a||dist(GNPC.x,GNPC.z,P.x,P.z)>=14||(typeof CHAT!=='undefined'&&CHAT.b&&CHAT.b.has('gardener')))return;const k=Math.max(.8,UIS*1.25),p=scr(GNPC.x,groundY(GNPC.x,GNPC.z)+3.6,GNPC.z);uiPill(fctx,'식물섬 주인',p[0],p[1],12.5*k,UIC.grn||UIC.nav,'#fff')}catch(e){}}}}
function updPlantIsle(dt){const k=Math.min(1,dt*7);piHook();
 for(const s of structs){if(s.t!=='pgate')continue;if(s.open&&performance.now()>=s.ot){if(gateBusy(s))s.ot=performance.now()+400;else{s.open=false;sfx(240,.12,'square',.03);hudDirty=true}}
  if(s.lk){const t=s.open?1.5:0;for(const [n,sg] of [['l',1],['r',-1]]){const L=s.lk.parts[n];if(L&&Math.abs(t*sg-L.rotation.y)>.002)L.rotation.y+=(t*sg-L.rotation.y)*k}}}
 if(!GNPC)return;if(!GNPC.a&&CMAT.fisher&&piGardenerMat()){const a=GNPC.a=new Actor('fisher'),M=piGardenerMat();a.root.traverse(o=>{if(o.isMesh)o.material=o.isSkinnedMesh?M.s:M.n});
  if(a.head){const h=mesh(piHatGeo(),MATT);h.position.set(0,1.02,.02);h.rotation.x=-.1;h.scale.setScalar(1.3);a.head.add(h);GNPC.hat=h}a.play('Idle',{force:1});a.set(GNPC.x,GNPC.z,0)}
 if(GNPC.a){const d=dist(P.x,P.z,GNPC.x,GNPC.z);GNPC.a.root.visible=d<90;if(d<60){const want=d<7?Math.atan2(P.x-GNPC.x,P.z-GNPC.z):0;let df=want-GNPC.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;GNPC.rot+=df*Math.min(1,dt*4);GNPC.a.root.rotation.y=GNPC.rot;GNPC.a.mixer.update(dt)}}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{updPlantIsle(dt)}catch(e){}}}
function gardenerTalk(){if(!GNPC)return;piHook();const s=GNPC_LINES[GNPC.i%GNPC_LINES.length];GNPC.i++;if(typeof CHAT!=='undefined')CHAT.say('gardener',s);else toast(s);sfx(660,.05,'sine',.03);if(GNPC.a)GNPC.a.play('Interact',{once:1,lock:.6,force:1})}

/* ---------- 라벨·상호작용 ---------- */
const piInsideGate=s=>P.z<s.z-.1;
{const _sl=sLabel;sLabel=function(s){if(s.t==='pgate'){if(s.open)return null;return piInsideGate(s)||piDexAll()||(typeof DEV!=='undefined'&&DEV.on)?'문 열기':`🔒 식물 도감 ${piDexN()}/${typeof PLANTS!=='undefined'?PLANTS.length:12}`}if(s.t==='pstall')return'말 걸기';return _sl(s)}}
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'){const s=t.s;
  if(s.t==='pgate'){if(!inp.actEdge||s.open)return;if(piInsideGate(s)||piDexAll()||(typeof DEV!=='undefined'&&DEV.on)){openGate(s);return}toast(`🔒 식물 도감을 다 채우면 열려요 (${piDexN()}/${PLANTS.length})`);sfx(180,.12,'square',.03);return}
  if(s.t==='pstall'){if(inp.actEdge)gardenerTalk();return}}
 return _ia()}}
/* 설치 금지 구역: 절벽 바깥 + 2.5m 원 */
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();if(PIS.nr)NOB.push({k:'pis',x:PIS.x,z:PIS.z,r:PIS.nr})}}
{const _bpl=buildPlaces;buildPlaces=function(){_bpl();try{plPlantIsle()}catch(e){console.error('식물섬 만들기 실패',e)}}}
