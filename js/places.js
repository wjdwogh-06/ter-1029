'use strict';
/* ===== 특별한 곳 (기획자 요청 7·8차) =====
   1) 까마귀섬 낚시섬(FISHISLE 둘레, 메모1 x=137 z=135): 바닷가 낚시 캠프. 땅 모양 따라 굽은 흰 철조망(양 끝은 바닷물까지) + 앞쪽 철조망 문
      (누르면 열리고 4초 뒤 닫힘, 지금은 누구나) + 나무 데크·바다로 뻗은 잔교·묶인 배 + 판자 낚시 오두막 + 판매대 뒤 낚시섬 주인 + 덕장·그물·생선 상자
      + 모닥불과 통나무 의자 + 징검돌 길 + 줄 전구. 나중에 '낚시 도감을 다 채우면 들어오는 곳'이 될 자리
   2) 물개섬 특수 보급지(SPSUP, x=718 z=849): 층층이 쌓인 바위 절벽 언덕. 앞 흙 경사로로 올라가서, 안쪽 돌계단으로 파인 분지로 내려가면 특수 보급.
   땅(분지 파기·둘레 다지기)과 걷는 높이(spSurf)는 core.js, 여기서는 모양(메시)·벽·구조물·문·주인 */
const PLACES=[{k:'fish',n:'낚시섬',x:FISHISLE.x-8,z:FISHISLE.z-1,c:'#3fb6e0'},{k:'sp',n:'특수 보급지',x:SPSUP.x,z:SPSUP.z,c:'#ff7a3d'}];
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
/* 모서리 둥근 네모 둘레 N점(가운데 기준): {x,z,nx,nz,t} */
function plRRect(a,c,N){const s=a-c,L=8*s+Math.PI*2*c,S=[[a,-s,0,1,1,0],[s,a,-1,0,0,1],[-a,s,0,-1,-1,0],[-s,-a,1,0,0,-1]],Cn=[[s,s],[-s,s],[-s,-s],[s,-s]],out=[];
 for(let i=0;i<N;i++){let u=i/N*L,p=null;for(let k=0;k<4&&!p;k++){if(u<2*s){const q=S[k];p={x:q[0]+q[2]*u,z:q[1]+q[3]*u,nx:q[4],nz:q[5]};break}u-=2*s;if(u<Math.PI*c/2){const th=k*Math.PI/2+u/c;p={x:Cn[k][0]+c*Math.cos(th),z:Cn[k][1]+c*Math.sin(th),nx:Math.cos(th),nz:Math.sin(th)};break}u-=Math.PI*c/2}
  if(!p)p={x:a,z:-s,nx:1,nz:0};p.t=i/N;out.push(p)}return out}
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
 {const body=[pt(R(1.26,.92,1.0,.1,.05),NV,[0,.5,0]),pt(R(1.3,.12,1.04,.04,.03),GD,[0,.18,0]),pt(R(1.3,.12,1.04,.04,.03),GD,[0,.82,0])];for(const x of[-.6,.6])body.push(pt(R(.1,.94,1.05,.03,.02),GD,[x,.5,0]));
  const lid=[pt(R(1.32,.16,1.06,.05,.04),0x24304a,[0,1.04,0]),pt(R(.34,.08,.34,.03,.02),GD,[0,1.14,0])],glow=[pt(R(.62,.12,.03,.04,.012),0xffb547,[0,.5,.515])];
  if(LM)lkModel('pl_spcrate',body.concat(lid),{glow:{g:glow,pv:[0,0,0],glow:true}});else GEO.pl_spcrate=mg(body.concat(lid,glow));
  const g=mg(body.concat([pt(R(1.32,.16,1.06,.05,.04),0x24304a,[0,.86,-.7],[1.05,0,0])]));if(typeof lkSmooth==='function')lkSmooth(g,50);GEO.pl_spcrate_open=g}
 {const base=[pt(R(.5,.16,.5,.05,.04),0x6a7078,[0,.08,0]),pt(R(.12,3.1,.12,.04,.03),0x3f4450,[0,1.6,0]),pt(R(.5,.32,.03,.03,.01),0xff7a3d,[.3,2.9,0])],gl=[pt(new THREE.SphereGeometry(.17,12,8),0xffa24a,[0,3.25,0])];
  if(LM)lkModel('pl_beacon',base,{glow:{g:gl,pv:[0,0,0],glow:true}});else GEO.pl_beacon=mg(base.concat(gl))}}
function plSignText(txt,w=2.7,h=.5,px=74){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;
 const draw=()=>{const x=cv.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle='#4a2f20';x.font=`900 ${px}px `+(typeof UIF!=='undefined'?UIF:'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,52);tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}
const plAdd=(g,x,y,z,ry=0,m)=>{const o=mesh(g,m||MATT);o.position.set(x,y,z);o.rotation.y=ry;scene.add(o);return o};
const plWallAlong=(pts,step,skip)=>{let acc=step;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let u=0;u<L;u+=.25){acc+=.25;if(acc>=step){acc=0;const x=a[0]+(b[0]-a[0])*u/L,z=a[1]+(b[1]-a[1])*u/L;if(!skip||!skip(x,z))addStruct({t:'iblk',x,z,r:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),hp:1e9})}}}};

/* ========== 2) 물개섬 특수 보급지: 바위 분지 ========== */
function plCrater(){const S2=SPSUP,X=S2.x,Z=S2.z,G=S2.h,Hr=G+S2.top,Hb=G-S2.dig,N=144,UP=[0,1,0];
 const O=plRRect(S2.A,S2.ac,N),I=plRRect(S2.B,S2.bc,N);
 const ringO=(off,y,band,sd)=>O.map((p,i)=>{const o=off+plWave(p.t,sd,.16)+(hash(i,band,71)-.5)*.1;return[X+p.x+p.nx*o,y+plWave(p.t,sd+9,.07),Z+p.z+p.nz*o]});
 const ringI=(off,y,band,sd)=>I.map((p,i)=>{const o=off+plWave(p.t,sd,.12)+(hash(i,band,73)-.5)*.08;return[X+p.x+p.nx*o,y+plWave(p.t,sd+9,.06),Z+p.z+p.nz*o]});
 const g=new PLGeo();
 const band=(rings,cols,outward,isIn)=>{for(let r=0;r<rings.length-1;r++){const A=rings[r],B=rings[r+1];for(let i=0;i<N;i++){const j=(i+1)%N,P=isIn?I[i]:O[i],dir=outward?[P.nx,0,P.nz]:[-P.nx,0,-P.nz];
   const lip=Math.abs(A[i][1]-B[i][1])<.15;g.quad(A[i],A[j],B[j],B[i],cols(r,i),cols(r,j),cols(r+1,j),cols(r+1,i),lip?UP:dir)}}};
 /* 바깥 절벽: 아래가 넓고 위로 좁아지는 세 층 + 층마다 턱 */
 {const L=[[G-.35,.62,0],[G+.5,.5,0],[G+.5,.32,1],[G+1.22,.24,1],[G+1.22,.12,2],[Hr-.02,0,2]],rs=L.map(q=>ringO(q[1],q[0],q[2],q[2]*2+1)),bk=L.map(q=>q[2]);
  band(rs,(r,i)=>r===5?plCol(0x8c9a6a,.95+hash(i,9,5)*.1):r===2||r===4?plRock(bk[r],i,1.12):plRock(bk[r],i),true,false)}
 /* 안쪽 절벽(분지 쪽을 봄) */
 {const L=[[Hb-.3,-.5,0],[Hb+.72,-.4,0],[Hb+.72,-.26,1],[Hb+1.62,-.18,1],[Hb+1.62,-.08,2],[Hr-.02,0,2]],rs=L.map(q=>ringI(q[1],q[0],q[2],q[2]*2+5)),bk=L.map(q=>q[2]);
  band(rs,(r,i)=>r===5?plCol(0x8c9a6a,.95+hash(i,11,5)*.1):r===2||r===4?plRock(bk[r],i,1.1):plRock(bk[r],i,.95),false,true)}
 scene.add(mesh(g.build(48),PLM2()));
 /* 꼭대기 풀: 땅과 같은 잔디(TERR)로, 가장자리는 살짝 밖으로 덮고 늘어뜨려요 */
 {const t=new PLGeo(),Ot=O.map(p=>{const o=.14+plWave(p.t,1,.16);return[X+p.x+p.nx*o,Hr,Z+p.z+p.nz*o]}),It=I.map(p=>{const o=-.1+plWave(p.t,5,.12);return[X+p.x+p.nx*o,Hr,Z+p.z+p.nz*o]});
  const gc=i=>plCol(0x74b545,.92+hash(i,2,9)*.16);for(let i=0;i<N;i++){const j=(i+1)%N;t.quad(It[i],It[j],Ot[j],Ot[i],gc(i),gc(j),gc(j),gc(i),UP)}
  const cap=mesh(t.build(),TERR);cap.receiveShadow=true;scene.add(cap);
  const s=new PLGeo(),sc=i=>plCol(0x5f9a3c,.9+hash(i,4,9)*.12);for(let i=0;i<N;i++){const j=(i+1)%N;
   const o0=Ot[i],o1=Ot[j],d0=[o0[0],o0[1]-.24,o0[2]],d1=[o1[0],o1[1]-.24,o1[2]];s.quad(o0,o1,d1,d0,sc(i),sc(j),sc(j),sc(i),[O[i].nx,0,O[i].nz]);
   const a0=It[i],a1=It[j],b0=[a0[0],a0[1]-.2,a0[2]],b1=[a1[0],a1[1]-.2,a1[2]];s.quad(a0,a1,b1,b0,sc(i),sc(j),sc(j),sc(i),[-I[i].nx,0,-I[i].nz])}
  scene.add(mesh(s.build(40),PLM2()))}
 /* 바깥 경사로: 흙길 + 양옆 바위 벽 + 가장자리 돌 */
 {const t=new PLGeo(),w=S2.rw/2+.28,z0=S2.A-.4,z1=S2.A+S2.rl+.25,n=12,hy=z=>Math.max(G-.03,Hr-(Hr-G)*clamp((z-(S2.A-.6))/(S2.rl+.6),0,1));
  const xs=[-w,-w*.55,0,w*.55,w],cc=(k,i)=>k===0||k===4?plCol(0x6f9e48,.95):plCol(k===2?0xa38a60:0x9a8259,.94+hash(i,k,7)*.1);
  for(let i=0;i<n;i++){const za=z0+(z1-z0)*i/n,zb=z0+(z1-z0)*(i+1)/n;for(let k=0;k<4;k++){const xa=X+S2.rx+xs[k],xb=X+S2.rx+xs[k+1];
    t.quad([xa,hy(za)+.02,za+Z],[xb,hy(za)+.02,za+Z],[xb,hy(zb)+.02,zb+Z],[xa,hy(zb)+.02,zb+Z],cc(k,i),cc(k+1,i),cc(k+1,i+1),cc(k,i+1),UP)}}
  const rm=mesh(t.build(),TERR);rm.receiveShadow=true;scene.add(rm);
  const s=new PLGeo();for(const sd of[-1,1])for(let i=0;i<n;i++){const za=z0+(z1-z0)*i/n,zb=z0+(z1-z0)*(i+1)/n,x=X+S2.rx+sd*w,yb=G-.3;
   s.quad([x,hy(za)+.02,za+Z],[x,hy(zb)+.02,zb+Z],[x,yb,zb+Z],[x,yb,za+Z],plRock(1,i),plRock(1,i+1),plRock(0,i+1),plRock(0,i),[sd,0,0])}
  scene.add(mesh(s.build(40),PLM2()))}
 /* 안쪽 돌계단: 6칸 + 양옆 돌 난간 */
 {const n=6,top=S2.B+.4,bot=S2.B-S2.sl,d=(top-bot)/n,p=[];for(let k=0;k<n;k++){const zc=top-(k+.5)*d,ty=Hb+(Hr-Hb)*((zc-bot)/(top-bot)),h=ty-(Hb-.3);
   p.push(pt(lkRb(S2.sw+.1,h,d+.04,.06,.04),k%2?0xb6afa4:0xaba497,[S2.rx,(Hb-.3)+h/2,zc]));
   for(const sd of[-1,1])p.push(pt(lkRb(.42,h+.34,d+.06,.1,.06),k%2?0x8f8c98:0x86838f,[S2.rx+sd*(S2.sw/2+.26),(Hb-.3)+(h+.34)/2,zc]))}
  const sg=mg(p);if(typeof lkSmooth==='function')lkSmooth(sg,40);plAdd(sg,X,0,Z)}
 /* 바위 무더기(절벽 밑·꼭대기·분지 모서리) */
 {const rk=[],C=[0x8e8e96,0x83838c,0x9a9aa2,0x7f7c88];let i=0;const B=(r,x,y,z,sy=.85)=>rk.push(lkBoulder(r,C[i%4],i++*3+1,[x,y,z],sy));
  for(let k=0;k<N;k+=5){const p=O[k];if(p.nz>.3&&Math.abs(p.x-S2.rx)<S2.rw/2+1.4)continue;const h0=hash(k,1,33);if(h0<.35)continue;
   const o=.85+hash(k,2,33)*.7,r=.38+hash(k,3,33)*.55;B(r,p.x+p.nx*o,G-.18,p.z+p.nz*o,.8+hash(k,4,33)*.3);if(h0>.75)B(r*.55,p.x+p.nx*(o+r*.9)+p.nz*.4,G-.12,p.z+p.nz*(o+r*.9)-p.nx*.4,.7)}
  for(let k=2;k<N;k+=11){const p=O[k];if(p.nz>.3&&Math.abs(p.x-S2.rx)<S2.rw/2+1)continue;B(.22+hash(k,5,33)*.18,p.x-p.nx*.55,Hr-.04,p.z-p.nz*.55,.7)}
  for(const [x,z,r] of [[-4.4,-4.3,.55],[-4.7,-3.4,.32],[4.5,-4.5,.42],[-4.6,3.9,.36],[4.7,-3.7,.26]])B(r,x,Hb-.08,z,.8);
  for(const sd of[-1,1])for(let z=S2.A+.6;z<S2.A+S2.rl-.4;z+=.95)B(.2+hash(z*10|0,sd+5,33)*.12,S2.rx+sd*(S2.rw/2+.42),Math.max(G-.05,Hr-(Hr-G)*clamp((z-(S2.A-.6))/(S2.rl+.6),0,1))-.08,z,.75);
  const rg=mg(rk);if(typeof lkSmooth==='function')lkSmooth(rg,70);plAdd(rg,X,0,Z)}
 /* 나무·덤불: 테두리 모서리, 절벽 밑, 분지 안 */
 {const v=[];const put=(k,x,y,z,s,ry)=>{if(GEO[k])v.push(pt(GEO[k],null,[x,y,z],[0,ry,0],[s,s,s]))};
  put('tree_single_A',-S2.A+1.0,Hr-.05,-S2.A+1.1,3.0,.3);put('tree_single_B',S2.A-1.2,Hr-.05,-S2.A+1.0,2.6,1.1);put('tree_single_A',-S2.A+1.1,Hr-.05,S2.A-1.6,2.4,2);
  put('bush',S2.A-1.1,Hr-.04,S2.A-1.2,.62,.5);put('bush',-S2.A+2.6,Hr-.04,-S2.A+.9,.5,1.4);put('bush',-1.5,Hr-.04,-S2.A+.95,.45,2.2);
  put('bush',-S2.A-.9,G-.05,2.2,.7,.2);put('bush',S2.A+1.0,G-.05,-3.5,.62,1.3);put('bush',-S2.B+.8,Hb-.04,.8,.5,.9);put('bush',S2.B-.9,Hb-.04,2.4,.45,2.6);
  if(v.length)plAdd(mg(v),X,0,Z)}
 /* 분지 바닥: 떨어진 낙하산 + 특수 보급 + 신호등 */
 if(GEO.chute)plAdd(GEO.chute,X-2.4,Hb+.01,Z-2.9,.6);
 {const c0=addStruct({t:'spsupply',x:X-1.2,z:Z-.6,r:.15}),c1=addStruct({t:'spsupply',x:X+1.4,z:Z-2.4,r:-.2});c0.li='sp0';c1.li='sp1'}
 {const b=addStruct({t:'spbeacon',x:X-4.1,z:Z+3.4,r:0,hp:1e9}),s=glow(0xff8a3d,3.6,.7);s.position.set(b.x,Hb+3.25,b.z);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 /* 보이지 않는 벽: 바깥 절벽(경사로 입구 빼고), 안쪽 절벽(계단 입구 빼고), 경사로·계단 옆 */
 const contour=(f,v)=>{const pts=[];for(let a=0;a<=360;a+=.5){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);let lo=0,hi=16;for(let k=0;k<22;k++){const m=(lo+hi)/2;f(X+dx*m,Z+dz*m)<v?lo=m:hi=m}pts.push([X+dx*lo,Z+dz*lo])}return pts};
 /* 입구 자리는 잘라내고, 남은 조각마다 벽을 처음·끝에 딱 맞춰 놓아요(벽 끝 = 경사로·계단 옆벽 안쪽 면, 틈 없음) */
 const runWalls=(pts,half)=>{const keep=pts.map(([x,z])=>!(z>Z&&Math.abs(x-X-S2.rx)<half+.95)),runs=[];let cur=[];
  pts.forEach((q,i)=>{if(keep[i])cur.push(q);else if(cur.length){runs.push(cur);cur=[]}});if(cur.length){if(runs.length&&keep[0])runs[0]=cur.concat(runs[0]);else runs.push(cur)}
  for(const R of runs){let L=0;const cum=[0];for(let i=1;i<R.length;i++){L+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);cum.push(L)}
   const n=Math.max(1,Math.ceil(L/1.6));for(let k=0;k<=n;k++){const u=L*k/n;let i=1;while(i<R.length-1&&cum[i]<u)i++;const a=R[i-1],b=R[i],t=clamp((u-cum[i-1])/((cum[i]-cum[i-1])||1),0,1);
    addStruct({t:'iblk',x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,r:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),hp:1e9})}}};
 runWalls(contour(spOut,.28),S2.rw/2-.02);runWalls(contour(spIn,-.28),S2.sw/2-.02);
 /* 경사로·계단 옆벽은 절벽 선(바깥 .28 / 안쪽 −.28)에서 끝나요 → 꼭대기에서 테두리 위로 걸어 나가 한 바퀴 돌 수 있어요 */
 const side=(z0,z1,off)=>{const n=Math.max(1,Math.ceil((z1-z0)/1.5));for(const sd of[-1,1])for(let k=0;k<=n;k++)addStruct({t:'iblk',x:X+S2.rx+sd*off,z:Z+z0+(z1-z0)*k/n,r:Math.PI/2,hp:1e9})};
 side(S2.A+.28+.95,S2.A+S2.rl-.2,S2.rw/2+.38);side(S2.B-S2.sl+.2,S2.B-.28-.95,S2.sw/2+.38);
 /* 테두리 모서리 나무 밑동 */
 for(const [x,z] of [[-S2.A+1.0,-S2.A+1.1],[S2.A-1.2,-S2.A+1.0],[-S2.A+1.1,S2.A-1.6]])addStruct({t:PLB(.3,.3),x:X+x,z:Z+z,r:0,hp:1e9});
 CLEARS.push([X,Z+3,19])}

/* ========== 1) 까마귀섬 낚시섬: 바닷가 낚시 캠프 ========== */
const FCAMP={deckY:1.46,deck:[-20.6,-11.2,-5.2,.6],porch:[-17.8,-12.4,.6,2.5],pier:[-30.5,-20.6,-2.0,.2],hut:[-15.2,-2.85,5.0,3.6],npc:[-15.1,1.0],stall:[-15.1,2.0],gate:[-2,7.4]};
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
const PLWORN=[[-2,8.6],[-2,6.4],[-2.7,5.4],[-3.7,4.6],[-4.9,4.0],[-6.2,3.6],[-7.5,3.4],[-8.8,3.3],[-10.1,3.3],[-11.4,3.4],[-12.7,3.5],[-13.9,3.4]],PLWORN2=[[-9.6,2.2],[-10.2,1.1],[-10.6,0],[-10.8,-1.1],[-10.7,-2.6]];
function plSegD(px,pz,L){let m=9;for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],dx=bx-ax,dz=bz-az,t=clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1);m=Math.min(m,Math.hypot(px-ax-dx*t,pz-az-dz*t))}return m}
function plWorn(fx,fz){if(fx<-26||fx>12||fz<-14||fz>12)return 0;const n=noise(fx*.6+3,fz*.6+9,77);
 let w=(1-sm(1.6,3.9,Math.hypot(fx-.3,fz-.6)))*.95;w=Math.max(w,(1-sm(.5,2.1,Math.min(plSegD(fx,fz,PLWORN),plSegD(fx,fz,PLWORN2))))*.75);
 w=Math.max(w,(1-sm(0,2.6,Math.max(Math.abs(fx+14.6)-4.6,0)+Math.max(fz-2.5,0)+Math.max(1-fz,0)))*.55);return clamp(w*(.75+n*.5),0,1)}
function plFishCamp(){const F=FCAMP,OX=FISHISLE.x,OZ=FISHISLE.z,Y=F.deckY,W=(x,z)=>[OX+x,OZ+z],bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x:OX+x,z:OZ+z,r,hp:1e9}),gh=(x,z)=>hAt(OX+x,OZ+z);
 const [gx,gz]=F.gate;CLEARS.push([OX-8,OZ-1,17]);
 /* 철조망: 바다 ~ 문 왼쪽, 문 오른쪽 ~ 동쪽 ~ 북쪽 ~ 바다 (양 끝은 물속까지) */
 const A=[[-23.6,5.6],[-17,6.4],[-11,7.2],[-5.4,7.4],[gx-1.35,gz]].map(q=>W(q[0],q[1])),B=[[gx+1.35,gz],[2.5,7.0],[5.5,4.5],[6.5,0],[5.5,-5],[1,-8.6],[-6,-9.6],[-13,-9.4],[-23.6,-8.8]].map(q=>W(q[0],q[1]));
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
 /* 땅 위: 덕장, 그물, 생선 상자·드럼통, 모닥불·통나무 */
 plAdd(plRackGeo(),OX-4.8,gh(-4.8,-6.9)-.02,OZ-6.9,.08);bl(-4.8,-6.9,1.55,.42,.08);
 if(GEO.pnet){const a=Math.atan2(-(-9.6+8.6),-6-1);plAdd(GEO.pnet,OX+.6,gh(.6,-8.0)-.02,OZ-8.0,a);bl(.6,-8.0,1.35,.22,a)}
 {const cg=plCrateGeo();plAdd(cg,OX-8.6,gh(-8.6,-4.6)-.02,OZ-4.6,.25);plAdd(cg,OX-8.45,gh(-8.6,-4.6)+.6,OZ-4.55,-.15);bl(-8.6,-4.6,.62,.5,.25);
  addStruct({t:'barrel',x:OX-7.3,z:OZ-6.1,r:.3,hp:1e9});addStruct({t:'barrel',x:OX-9.9,z:OZ-6.2,r:1.1,hp:1e9})}
 addStruct({t:'fire',x:OX+.3,z:OZ+.6,r:0,hp:1e9});
 if(GEO.lk_logs)for(const [x,z,r] of [[-1.8,1.7,.5],[2.3,1.8,-.55],[.6,-1.35,.08]]){plAdd(GEO.lk_logs,OX+x,gh(x,z)-.02,OZ+z,r).scale.set(2.2,1.6,2.2);bl(x,z,.6,.22,r)}
 const lamp=(x,z,y,ry)=>{plAdd(GEO.plamp,OX+x,y,OZ+z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(OX+x+Math.sin(ry)*.5,y+2.75,OZ+z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)};
 if(GEO.plamp){lamp(gx+2.3,gz-1.1,gh(gx+2.3,gz-1.1)-.02,Math.PI);lamp(F.pier[0]+.5,F.pier[2]+.35,Y,Math.PI/2);lamp(F.deck[1]-.3,F.deck[2]+.3,Y,-Math.PI/2)}
 /* 징검돌 길: 문 → 판매대 앞, 갈래 → 데크 동쪽 계단 */
 {const rk=[],P1=[[gx,6.4],[gx-.7,5.4],[gx-1.7,4.6],[gx-2.9,4.0],[gx-4.2,3.6],[gx-5.5,3.4],[gx-6.8,3.3],[gx-8.1,3.3],[gx-9.4,3.4],[gx-10.7,3.5],[gx-11.9,3.4]],P2=[[gx-7.6,2.2],[gx-8.2,1.1],[gx-8.6,0],[gx-8.8,-1.1],[gx-8.7,-2.2]];
  P1.concat(P2).forEach(([x,z],i)=>rk.push(lkBoulder(.34+hash(i,1,91)*.1,[0xc9c2b4,0xb8b1a3,0xd3ccbe][i%3],i*5+2,[x,gh(x,z)-.06,z],.2)));
  for(let i=0;i<14;i++){const a=hash(i,3,91)*6.28,r=1.5+hash(i,4,91)*5,x=Math.cos(a)*r-4,z=Math.sin(a)*r+1;rk.push(lkBoulder(.1+hash(i,5,91)*.08,0xa9a296,i*3,[x,gh(x,z)-.03,z],.5))}
  const g=mg(rk);lkSmooth(g,70);plAdd(g,OX,0,OZ)}
 /* 줄 전구: 오두막 앞 모서리 → 모닥불 옆 기둥 → 문 기둥 */
 {const poleX=2.4,poleZ=-1.3,py=gh(poleX,poleZ),p=[pt(cyl(.04,.055,2.95,8),0x3a3f4a,[poleX,py+1.47,poleZ]),pt(cyl(.09,.11,.16,8),0x3a3f4a,[poleX,py+.08,poleZ])],gl=[];bl(poleX,poleZ,.14,.14);
  const A0=[F.hut[0]+F.hut[2]/2,Y+2.6,F.hut[1]+F.hut[3]/2],A1=[poleX,py+2.9,poleZ],A2=[gx+1.32,gh(gx+1.32,gz)+3.1,gz],up=new THREE.Vector3(0,1,0),v=new THREE.Vector3(),qq=new THREE.Quaternion(),e=new THREE.Euler();
  for(const [a,b] of [[A0,A1],[A1,A2]]){const L=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(6,Math.round(L/.9));let prev=null;
   for(let k=0;k<=n;k++){const t=k/n,q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*.45,a[2]+(b[2]-a[2])*t];
    if(prev){const d=[q[0]-prev[0],q[1]-prev[1],q[2]-prev[2]],len=Math.hypot(...d);v.set(d[0],d[1],d[2]).normalize();qq.setFromUnitVectors(up,v);e.setFromQuaternion(qq);p.push(pt(cyl(.014,.014,len,4),0x2c3346,[(q[0]+prev[0])/2,(q[1]+prev[1])/2,(q[2]+prev[2])/2],[e.x,e.y,e.z]))}
    if(k>0&&k<n){gl.push(pt(new THREE.SphereGeometry(.09,8,6),[0xffd58a,0xffb36b,0xfff0b0][k%3],[q[0],q[1]-.1,q[2]]));if(k%3===1){const s=glow(0xffc46a,1.7,.6);s.position.set(OX+q[0],q[1]-.12,OZ+q[2]);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}}
    prev=q}}
  plAdd(mg(p),OX,0,OZ);plAdd(mg(gl),OX,0,OZ,0,typeof LKGLOW!=='undefined'?LKGLOW:MATT).castShadow=false}
 /* 울타리 안 덤불·꽃 */
 if(GEO.bush){const v=[];for(const [x,z,s,r] of [[4.6,3.2,.55,.4],[5.2,-2.4,.48,1.2],[-7.6,6.1,.5,2],[1.6,5.6,.42,.8],[-2.6,-8.6,.5,1.6],[-12.4,-8.2,.55,.2],[3.2,-6.0,.45,2.4],[-14.6,5.4,.48,1.1]])v.push(pt(GEO.bush,null,[x,gh(x,z)-.04,z],[0,r,0],[s,s,s]));plAdd(mg(v),OX,0,OZ)}}
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
 for(const b of PLBOATS){b.m.position.y=b.y+Math.sin(gt*1.25+b.ph)*.05;b.m.rotation.z=Math.sin(gt*1.05+b.ph)*.045}
 if(!FNPC)return;if(!FNPC.a&&CMAT.fisher){FNPC.a=new Actor('fisher');FNPC.a.play('Idle',{force:1});FNPC.a.set(FNPC.x,FNPC.z,0)}
 if(FNPC.a){const d=dist(P.x,P.z,FNPC.x,FNPC.z);FNPC.a.root.visible=d<90;if(d<60){const want=d<7?Math.atan2(P.x-FNPC.x,P.z-FNPC.z):0;let df=want-FNPC.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;FNPC.rot+=df*Math.min(1,dt*4);FNPC.a.root.rotation.y=FNPC.rot;FNPC.a.mixer.update(dt)}}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{updPlaces(dt)}catch(e){}}}
function fisherTalk(){if(!FNPC)return;plHookChat();const s=FNPC_LINES[FNPC.i%FNPC_LINES.length];FNPC.i++;if(typeof CHAT!=='undefined')CHAT.say('fisher',s);else toast(s);sfx(600,.05,'sine',.03);if(FNPC.a)FNPC.a.play('Interact',{once:1,lock:.6,force:1})}

/* ---------- 라벨·상호작용·특수 보급 ---------- */
{const _sl=sLabel;sLabel=function(s){if(s.t==='cgate')return s.open?null:'문 열기';if(s.t==='fstall')return'말 걸기';if(/^(iblk|pb_)/.test(s.t)||s.t==='spbeacon')return null;
  const d=sdef(s);if(d.loot===4)return S.looted[s.li]&&S.day-S.looted[s.li]<d.cd?null:'열기';return _sl(s)}}
const SPLOOT=()=>{const g={};const add=(k,n)=>g[k]=(g[k]||0)+n;add('coin',400+(Math.random()*600|0));add(pick(['rifle','shotgun','smg']),1);add('ammoL',16);add('ammoS',24);add('grenade',1+(Math.random()<.4?1:0));add('powder',6);add('bandage',2);add('can',2);return g};
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'){const s=t.s,d=sdef(s);
  if(s.t==='cgate'){if(inp.actEdge)openGate(s);return}
  if(s.t==='fstall'){if(inp.actEdge)fisherTalk();return}
  if(d.loot===4){if(!inp.actEdge)return;if(S.looted[s.li]&&S.day-S.looted[s.li]<d.cd)return;S.looted[s.li]=S.day;P.a.play('PickUp',{once:1,lock:.5,force:1});const got=SPLOOT();let i=0;
   for(const k in got){if(ITEMS[k]&&ITEMS[k].one&&invN(k)){give('scrap',8);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,'+8 고철','#ffe08a');continue}give(k,got[k]);ftext(s.x,groundY(s.x,s.z)+2.4+i++*.6,s.z,`+${got[k]} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffd27a')}
   if(s.m&&s.m.children[0])s.m.children[0].geometry=GEO[d.og];if(s.lk&&s.lk.parts.glow)s.lk.parts.glow.visible=false;jingle([659,880,1175]);toast('⭐ 특수 보급을 열었어요!');hudDirty=true;return}}
 return _ia()}}

/* ---------- 설치 금지 구역 ---------- */
if(typeof NOB_N!=='undefined')Object.assign(NOB_N,{fish:'낚시섬',sp:'특수 보급지'});
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();NOB.push({k:'fish',x:FISHISLE.x-8.5,z:FISHISLE.z-1,r:20});NOB.push({k:'sp',x:SPSUP.x+.6,z:SPSUP.z+3,r:17.5})}}
