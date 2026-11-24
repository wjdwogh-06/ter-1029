'use strict';
/* ===== 44차: 동북섬 = 겨울 섬 (기획자 11-20 22:25: '동북섬 테마를 겨울로 바꿔 줘. 해안가도 조금 얼어붙은 느낌, 나무들도 눈이나 얼어붙게, 항구도 살짝만') =====
   기획자가 규칙 담당 대화에서 맡긴 일이라 새 파일로 따로 만들었어요(디자인 담당이 다듬어도 돼요 — 다른 파일은 안 건드려요).
   보이는 것만 바꿔요: 배치·충돌·베기·채집·낚시 규칙은 그대로. index.html에서 이 파일 한 줄을 빼면 예전 동북섬.
   ① 땅: 눈(파르스름한 흰색 + 얼룩 그늘), 모래 해변은 얼어붙은 회백색, 얕은 물가 바닥은 얼음빛. 비탈은 바위가 조금 비쳐요.
   ② 나무·바위: 위를 보는 면에 눈이 쌓이고, 잎은 서리 낀 빛(GEO를 복제한 '_w' 키 — buildRegions 감싸기).
   ③ 풀·꽃 장식(dress.js): 서리 낀 빛.
   ④ 해안 얼음: 바닷가 얕은 물에 들쭉날쭉한 얼음판(항구·부두·배·낚시 떼 둘레는 비워요, 보기만 하는 장식).
   ⑤ 눈 내림: 화면이 동북섬 위에 있을 때만 눈송이가 천천히 내려요.
   ⑥ 항구는 살짝만: 동북섬 항구 안전 구역(core.js PORT_SAFE[2]) 안은 눈이 옅게, 얼음판 없음.
   ⑦ 지도도 동북섬을 하얗게. */
const WNT={I:null,ice:null,snow:null,map:0,iceT:0,k:0};
function wntIsl(){return WNT.I||(WNT.I=ISL.find(i=>i.n==='동북섬')||null)}
/* 73차(디자인, 기획자 11-23 21:07: '동북섬 대각선 위로 가는 섬들은 전부 겨울 테마로'): 동북섬 + 띠섬 + 해달섬. 항구 둘레 살짝(wntPortK)은 동북섬 항구만 */
const WNT_NAMES=['동북섬','띠섬','해달섬','동북섬 동쪽'];   /* 76차: 동북섬 동쪽에 덧붙인 땅도 겨울 */
function wntIsls(){return WNT.L||(WNT.L=WNT_NAMES.map(n=>ISL.find(i=>i.n===n)).filter(Boolean))}
const wntC=(hex)=>new THREE.Color(hex).convertSRGBToLinear();
const WNTC={snow:wntC(0xf3f7fb),shade:wntC(0xcfdcea),blue:wntC(0xbcd0e6),sand:wntC(0xdde3e4),sand2:wntC(0xc6d1d6),shal:wntC(0xa8c9d6),rock:wntC(0x8d96a0),frost:wntC(0xc3d6dc),ice:wntC(0xe4f3f8),ice2:wntC(0xb7dbe8)};
/* 항구 둘레는 살짝만: 안전 구역 반지름의 55% 안은 0.4, 가장자리 + 10m 밖은 1 */
function wntPortK(x,z){const q=typeof PORT_SAFE!=='undefined'?PORT_SAFE[2]:null;if(!q)return 1;const d=Math.hypot(x-q[0],z-q[1]),e=sm(q[2]*.55,q[2]+10,d);if(e>=1)return 1;   /* 항구 안은 군데군데 눈이 남은 땅 */
 const patch=sm(.42,.66,noise(x*.13+11,z*.13+5,64));return lerp(lerp(.12,.8,patch),1,e)}
/* ① 땅 */
function wntGround(C,x,z,h){const n=fbm(x*.045+31,z*.045+17,61),n2=noise(x*.3,z*.3,62);
 if(h>=.95){C.copy(WNTC.snow).lerp(WNTC.shade,sm(.35,.8,n)*.75).lerp(WNTC.blue,sm(.62,.9,noise(x*.02+5,z*.02+9,63))*.35);const v=.97+n2*.05;C.multiplyScalar(v);return 1}
 if(h>=.25){C.copy(WNTC.sand).lerp(WNTC.sand2,n*.8);return sm(.25,.5,h)*.55+.4}
 C.copy(WNTC.shal).lerp(WNTC.sand2,.25);return .55*sm(-1.9,.25,h)}
function wntTerrain(){WNT.nv=0;for(const I of wntIsls())wntTerrain1(I)}
function wntTerrain1(I){const C=new THREE.Color();let nv=0;
 for(const t of tchunks){if(Math.abs(t.cx-I.x)>I.br+REG||Math.abs(t.cz-I.z)>I.br+REG)continue;const g=t.m.geometry,P=g.attributes.position.array,L=g.attributes.color.array;let ch=0;
  for(let k=0;k<P.length;k+=3){const x=P[k],h=P[k+1],z=P[k+2];if(h<-2.2||islAt(x,z)!==I)continue;let w=wntGround(C,x,z,h);if(w<=0)continue;
   if(h>.6){const sl=Math.abs(hAt(x+1.5,z)-hAt(x-1.5,z))+Math.abs(hAt(x,z+1.5)-hAt(x,z-1.5));if(sl>1){C.lerp(WNTC.rock,sm(1,2.6,sl)*.55)}}
   w*=wntPortK(x,z);if(typeof supD==='function'){const sd=supD(x,z);if(sd<8.5)w*=lerp(.55,1,sm(3,8.5,sd))}   /* 보급지 바닥은 밟힌 눈 */
   L[k]=lerp(L[k],C.r,w);L[k+1]=lerp(L[k+1],C.g,w);L[k+2]=lerp(L[k+2],C.b,w);ch=1;nv++}
  if(ch)g.attributes.color.needsUpdate=true}
 WNT.nv+=nv}
{const _bt=buildTerrain;buildTerrain=function(){_bt.apply(this,arguments);try{wntTerrain()}catch(e){console.warn('winter terrain',e)}}}
/* ② 나무·바위: 눈 쌓인 복제 모양 */
function wntGeo(src){const g=src.clone(),c=g.attributes.color;if(!g.attributes.normal)g.computeVertexNormals();const n=g.attributes.normal.array;if(!c)return g;const a=c.array;
 for(let i=0;i<a.length;i+=3){const up=n[i+1],r=a[i],gg=a[i+1],b=a[i+2],leaf=gg>r*1.12&&gg>b*1.05;let f=leaf?.42:.14;
  let s=sm(.3,.72,up)*.94;if(!leaf&&up<.3)s=0;
  let R=lerp(r,WNTC.frost.r*(.55+gg),f),G=lerp(gg,WNTC.frost.g*(.55+gg),f),B=lerp(b,WNTC.frost.b*(.6+gg),f);
  a[i]=lerp(R,WNTC.snow.r*.92,s);a[i+1]=lerp(G,WNTC.snow.g*.92,s);a[i+2]=lerp(B,WNTC.snow.b*.95,s)}
 c.needsUpdate=true;return g}
function wntObjs(){const L=wntIsls();if(!L.length||!objs)return;let n=0;
 objs.forEach(o=>{if(!o.gk||o.gk.endsWith('_w'))return;const T=OBJT[o.t];if(!T||T.berry||!L.includes(islAt(o.x,o.z)))return;const k=o.gk+'_w';if(!GEO[k]){if(!GEO[o.gk])return;GEO[k]=wntGeo(GEO[o.gk])}o.gk=k;delete o.sp;n++});WNT.objs=(WNT.objs||0)+n}
{const _br=buildRegions;buildRegions=function(){try{wntObjs()}catch(e){console.warn('winter objs',e)}return _br.apply(this,arguments)}}
/* ③ 풀·꽃 장식 */
function wntDress(r){const WL=wntIsls();if(!r.d||!WL.some(I=>Math.abs(r.cx-I.x)<=I.br+REG&&Math.abs(r.cz-I.z)<=I.br+REG))return;const g=r.d.geometry,P=g.attributes.position.array,L=g.attributes.color.array,N=g.attributes.normal.array;let ch=0;
 for(let k=0;k<P.length;k+=3){const x=r.cx+P[k],z=r.cz+P[k+2];if(!WL.includes(islAt(x,z)))continue;const w=wntPortK(x,z),s=sm(.2,.8,N[k+1])*.55;
  const R=lerp(L[k],WNTC.frost.r,.62),G=lerp(L[k+1],WNTC.frost.g,.62),B=lerp(L[k+2],WNTC.frost.b,.62);
  L[k]=lerp(L[k],lerp(R,WNTC.snow.r,s),w);L[k+1]=lerp(L[k+1],lerp(G,WNTC.snow.g,s),w);L[k+2]=lerp(L[k+2],lerp(B,WNTC.snow.b,s),w);ch=1}
 if(ch)g.attributes.color.needsUpdate=true}
{const _db=dressBuild;dressBuild=function(r,ri){_db.apply(this,arguments);try{wntDress(r)}catch(e){}}}
/* ④ 해안 얼음 — 처음 놀기 시작할 때 한 번(항구·부두·낚시 떼가 다 놓인 뒤) */
function wntIce(){const A={pos:[],col:[],cells:0,floes:0};for(const I of wntIsls())wntIce1(I,A);return wntIceMesh(A)}
function wntIce1(I,A){const s=1.1,x0=Math.max(4,I.x-I.br),z0=Math.max(4,I.z-I.br),x1=Math.min(WS-4,I.x+I.br),z1=Math.min(WS-4,I.z+I.br),ni=Math.ceil((x1-x0)/s),nj=Math.ceil((z1-z0)/s);
 const q=typeof PORT_SAFE!=='undefined'?PORT_SAFE[2]:null,boats=structs.filter(t=>!t.in&&Math.abs(t.x-I.x)<I.br+10&&Math.abs(t.z-I.z)<I.br+10&&hAt(t.x,t.z)<.3),fs=typeof FSP!=='undefined'?FSP.filter(f=>Math.abs(f.x-I.x)<I.br+10&&Math.abs(f.z-I.z)<I.br+10):[];
 const free=(x,z,pad)=>{if(q&&Math.hypot(x-q[0],z-q[1])<q[2]+8)return false;if(typeof onDock==='function'&&onDock(x,z))return false;for(const b of boats)if(Math.hypot(b.x-x,b.z-z)<7+pad)return false;for(const f of fs)if(Math.hypot(f.x-x,f.z-z)<(f.R||1)+3.2+pad)return false;return true};
 const vx=(i,j)=>x0+i*s+(hash(i,j,71)-.5)*s*.9,vz=(i,j)=>z0+j*s+(hash(i,j,72)-.5)*s*.9;
 const pos=A.pos,col=A.col,C=new THREE.Color();let cells=0,floes=0;
 /* 바닷가에 붙은 얼음판: 얕을수록 빽빽, 바깥 가장자리는 잘게 부서진 모양 */
 for(let j=0;j<nj;j++)for(let i=0;i<ni;i++){const cx=x0+(i+.5)*s,cz=z0+(j+.5)*s,h=hAt(cx,cz);if(h>.04||h<-1.6)continue;if(islAt(cx,cz)!==I)continue;
  const shore=sm(-1.6,-.1,h),nn=noise(cx*.07+3,cz*.07+8,77)*.6+noise(cx*.3,cz*.3,78)*.4;if(shore*.8+nn*.5<.86||hash(i,j,73)<.04)continue;if(!free(cx,cz,0))continue;
  C.copy(WNTC.ice).lerp(WNTC.ice2,sm(.3,.9,noise(cx*.16,cz*.16,79))*.75+(1-shore)*.3);const v=.95+hash(i,j,74)*.08;cells++;
  for(const[a,b]of[[i,j],[i,j+1],[i+1,j+1],[i,j],[i+1,j+1],[i+1,j]]){pos.push(vx(a,b),.045+hash(a,b,75)*.012,vz(a,b));col.push(C.r*v,C.g*v,C.b*v)}}   /* 위에서 보이게(시계 반대) */
 /* 조금 떨어진 물 위에 떠다니는 얼음 조각 */
 const fsz=5;for(let gz=z0;gz<z1;gz+=fsz)for(let gx=x0;gx<x1;gx+=fsz){const hx=hash(gx|0,gz|0,81),x=gx+hash(gx|0,gz|0,82)*fsz,z=gz+hash(gx|0,gz|0,83)*fsz,h=hAt(x,z);if(h>-1.2||h<-3.4||hx<.55)continue;if(islAt(x,z)!==I||!free(x,z,1))continue;
  const r=.55+hash(gx|0,gz|0,84)*1.1,n=6+((hash(gx|0,gz|0,85)*3)|0),a0=hash(gx|0,gz|0,86)*6.28,y=.05;C.copy(WNTC.ice).lerp(WNTC.ice2,hash(gx|0,gz|0,87)*.5);floes++;
  const rv=[];for(let k=0;k<n;k++)rv.push(r*(.7+hash(gx|0,k,88)*.45));for(let k=0;k<n;k++){const a=a0+k/n*6.283,b=a0+(k+1)/n*6.283,ra=rv[k],rb=rv[(k+1)%n];
   pos.push(x,y,z, x+Math.sin(a)*ra,y,z+Math.cos(a)*ra, x+Math.sin(b)*rb,y,z+Math.cos(b)*rb);for(let t=0;t<3;t++)col.push(C.r,C.g,C.b)}}
 A.cells+=cells;A.floes+=floes}
function wntIceMesh(A){const pos=A.pos,col=A.col,cells=A.cells,floes=A.floes;if(!pos.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const nrm=new Float32Array(pos.length);for(let k=1;k<nrm.length;k+=3)nrm[k]=1;g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));g.computeBoundingSphere();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.9}));m.renderOrder=2;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);m.userData.cells=cells;m.userData.floes=floes;return m}
/* ⑤ 눈 내림 */
function wntSnowInit(){const N=700,g=new THREE.BufferGeometry(),a=new Float32Array(N*3);for(let i=0;i<N;i++){a[i*3]=rand(-24,24);a[i*3+1]=rand(0,20);a[i*3+2]=rand(-24,24)}g.setAttribute('position',new THREE.BufferAttribute(a,3));
 const mat=new THREE.PointsMaterial({map:typeof glowTex!=='undefined'?glowTex:null,color:0xffffff,size:.22,transparent:true,opacity:0,depthWrite:false});const p=new THREE.Points(g,mat);p.frustumCulled=false;p.renderOrder=5;scene.add(p);return p}
function wntTick(dt){if(mode!=='play')return;const I=wntIsl();if(!I)return;
 if(!WNT.ice&&!WNT.iceT){WNT.iceT=1;try{WNT.ice=wntIce()}catch(e){console.warn('winter ice',e)}}
 if(!WNT.map&&typeof MAPC!=='undefined'&&MAPC){WNT.map=1;try{wntMap()}catch(e){console.warn('winter map',e)}}
 if(!WNT.snow)WNT.snow=wntSnowInit();const sp=WNT.snow,tx=camT.x,tz=camT.z,inI=!INT.on&&wntIsls().some(J=>islAt(tx,tz)===J||Math.hypot(tx-J.x,tz-J.z)<J.br*.55);
 WNT.k=clamp(WNT.k+(inI?dt:-dt)*.8,0,1);sp.visible=WNT.k>.01;if(!sp.visible)return;sp.material.opacity=.85*WNT.k;
 const arr=sp.geometry.attributes.position.array,gt2=performance.now()/1000;for(let i=0;i<arr.length;i+=3){arr[i+1]-=dt*(.9+(i%7)*.12);arr[i]+=dt*(.35*Math.sin(gt2*.7+i)+.25);arr[i+2]+=dt*.15*Math.cos(gt2*.5+i*.3);
  if(arr[i+1]<-1){arr[i+1]=20;arr[i]=rand(-24,24);arr[i+2]=rand(-24,24)}if(arr[i]>24)arr[i]-=48;if(arr[i+2]>24)arr[i+2]-=48;if(arr[i+2]<-24)arr[i+2]+=48}
 sp.geometry.attributes.position.needsUpdate=true;sp.position.set(tx,(camT.y||1)-.5,tz-2)}
{const _u=updEnv;updEnv=function(dt,x,z){_u.apply(this,arguments);try{wntTick(dt)}catch(e){}}}
/* ⑦ 지도 */
function wntMap(){if(!MAPC)return;for(const I of wntIsls())wntMap1(I)}
function wntMap1(I){const x0=Math.max(0,Math.floor(I.x-I.br)),z0=Math.max(0,Math.floor(I.z-I.br)),w=Math.min(WS,Math.ceil(I.x+I.br))-x0,h=Math.min(WS,Math.ceil(I.z+I.br))-z0;
 const c=MAPC.getContext('2d'),im=c.getImageData(x0,z0,w,h),d=im.data;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=x0+i+.5,z=z0+j+.5,hh=hAt(x,z);if(hh<.25||islAt(x,z)!==I)continue;const k=(j*w+i)*4,t=(hh>=.95?.8:.55)*wntPortK(x,z);
  d[k]=lerp(d[k],236,t);d[k+1]=lerp(d[k+1],242,t);d[k+2]=lerp(d[k+2],248,t)}c.putImageData(im,x0,z0)}
