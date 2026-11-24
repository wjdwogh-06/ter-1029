/* ===== 79차(규칙, 기획자 11-24 22:08): 바람섬 = 가을 섬 =====
   기획자: '맵 왼쪽 아래 세 번째로 큰, 식물 엔피시가 있는 그 섬은 테마를 가을 테마로 바꿔 줘. 나무들이나 바닥 배경도'.
   바람섬 + 76차에 덧붙인 바람섬 남쪽(AUT_NAMES). 보이는 것만 바꿔요(배치·충돌·베기·채집 그대로). winter.js와 같은 방식이에요.
   ① 땅: 노릇한 마른 풀 + 주황·적갈색 낙엽 무늬, 모래는 따뜻한 베이지 ② 나무: 잎 나무는 주황·노랑·빨강 단풍, 소나무 절반은 단풍나무로, 자작나무는 노란 잎
   ③ 풀·꽃 장식도 가을빛 ④ 화면이 바람섬 위면 낙엽이 천천히 떨어져요 ⑤ 지도도 가을빛. 이 파일을 빼면 예전 모습이에요. */
const AUT={L:null,map:0,leaf:null,k:0};
const AUT_NAMES=['바람섬','바람섬 남쪽'];
function autIsls(){return AUT.L||(AUT.L=AUT_NAMES.map(n=>ISL.find(i=>i.n===n)).filter(Boolean))}
const autC=h=>new THREE.Color(h).convertSRGBToLinear();
const AUTC={g1:autC(0xc9b45a),g2:autC(0xd8a447),g3:autC(0xb39548),lf1:autC(0xd2763a),lf2:autC(0xb8532e),lf3:autC(0xe2a443),sand:autC(0xe6cfa3),sand2:autC(0xd6b98a),moss:autC(0x9c9a4a)};
LEAFC[3]=[0xc8452e,0xd2553a,0xb93c2a];   /* 빨간 단풍(world.js 잎 색 표에 하나 더) */
/* ① 땅 */
function autGround(C,x,z,h){const n=fbm(x*.04+71,z*.04+23,81),lf=sm(.52,.74,noise(x*.11+9,z*.11+31,82)),n2=noise(x*.35,z*.35,83);
 if(h>=.95){C.copy(AUTC.g1).lerp(AUTC.g2,sm(.3,.75,n)).lerp(AUTC.g3,sm(.6,.9,noise(x*.025+3,z*.025+7,84))*.5);
  const L=n2<.33?AUTC.lf1:n2<.66?AUTC.lf2:AUTC.lf3;C.lerp(L,lf*.75);C.multiplyScalar(.96+n2*.06);return .88}
 if(h>=.25){C.copy(AUTC.sand).lerp(AUTC.sand2,n*.8);return sm(.25,.5,h)*.5+.35}
 return 0}
function autTerrain(){let nv=0;const C=new THREE.Color(),L=autIsls();for(const I of L){for(const t of tchunks){if(Math.abs(t.cx-I.x)>I.br+REG||Math.abs(t.cz-I.z)>I.br+REG)continue;const g=t.m.geometry,P=g.attributes.position.array,A=g.attributes.color.array;let ch=0;
  for(let k=0;k<P.length;k+=3){const x=P[k],h=P[k+1],z=P[k+2];if(h<-2.2||islAt(x,z)!==I)continue;let w=autGround(C,x,z,h);if(w<=0)continue;
   if(typeof supD==='function'){const sd=supD(x,z);if(sd<8.5)w*=lerp(.5,1,sm(3,8.5,sd))}
   A[k]=lerp(A[k],C.r,w);A[k+1]=lerp(A[k+1],C.g,w);A[k+2]=lerp(A[k+2],C.b,w);ch=1;nv++}
  if(ch)g.attributes.color.needsUpdate=true}}AUT.nv=nv}
{const _bt=buildTerrain;buildTerrain=function(){_bt.apply(this,arguments);try{autTerrain()}catch(e){console.warn('autumn terrain',e)}}}
/* ② 나무: 단풍(잎 나무 색은 인스턴스 색 LEAFC로), 자작나무는 노란 잎 복제 모양 */
function autGeoLeaf(src,cols){const g=src.clone(),c=g.attributes.color;if(!c)return g;const a=c.array,L=cols.map(autC);
 for(let i=0;i<a.length;i+=3){const r=a[i],gg=a[i+1],b=a[i+2];if(!(gg>r*1.1&&gg>b*1.05))continue;const v=(r+gg+b)/3/.45,q=L[((i/3)*7919%L.length+L.length)%L.length];a[i]=q.r*Math.min(1.25,.75+v*.35);a[i+1]=q.g*Math.min(1.25,.75+v*.35);a[i+2]=q.b*Math.min(1.25,.75+v*.35)}
 c.needsUpdate=true;return g}
function autObjs(){const L=autIsls();if(!L.length||!objs)return;let n=0;
 objs.forEach(o=>{if(o.t>2||!o.gk||!L.includes(islAt(o.x,o.z)))return;const r=hash(o.x*5.1|0,o.z*3.7|0,881);
  if(o.sp!==undefined||((o.gk==='tree_single_A'||o.gk==='tree_single_B')&&r<.6)){o.gk='t_fall';o.sp=r<.42?1:r<.74?2:3;n++;return}
  if(o.gk==='t_birch'||o.gk==='tree_single_A'||o.gk==='tree_single_B'){const k=o.gk+'_a';if(!GEO[k]&&GEO[o.gk])GEO[k]=autGeoLeaf(GEO[o.gk],o.gk==='t_birch'?[0xe9c63c,0xf0cf4a,0xd9b02e]:[0x7f8a3a,0x8e8a3c,0x6f7a34]);if(GEO[k]){o.gk=k;n++}}});AUT.objs=n}
{const _br=buildRegions;buildRegions=function(){try{autObjs()}catch(e){console.warn('autumn objs',e)}return _br.apply(this,arguments)}}
/* ③ 풀·꽃 장식 */
function autDress(r){const L=autIsls();if(!r.d||!L.some(I=>Math.abs(r.cx-I.x)<=I.br+REG&&Math.abs(r.cz-I.z)<=I.br+REG))return;const g=r.d.geometry,P=g.attributes.position.array,A=g.attributes.color.array;let ch=0;
 for(let k=0;k<P.length;k+=3){const x=r.cx+P[k],z=r.cz+P[k+2];if(!L.includes(islAt(x,z)))continue;const R=A[k],G=A[k+1],B=A[k+2];if(!(G>R*1.08&&G>B*1.05))continue;const v=(R+G+B)/3,h=hash(x*3|0,z*3|0,883),q=h<.45?AUTC.g2:h<.75?AUTC.lf3:h<.9?AUTC.lf1:AUTC.g3,s=Math.min(1.3,v/.32);
  A[k]=lerp(R,q.r*s,.82);A[k+1]=lerp(G,q.g*s,.82);A[k+2]=lerp(B,q.b*s,.82);ch=1}
 if(ch)g.attributes.color.needsUpdate=true}
{const _db=dressBuild;dressBuild=function(r,ri){_db.apply(this,arguments);try{autDress(r)}catch(e){}}}
/* ④ 떨어지는 낙엽 */
function autLeafInit(){const N=260,g=new THREE.BufferGeometry(),a=new Float32Array(N*3),c=new Float32Array(N*3),L=[0xd2763a,0xb8532e,0xe2a443,0xc8452e,0xe9c63c].map(h=>new THREE.Color(h));
 for(let i=0;i<N;i++){a[i*3]=rand(-24,24);a[i*3+1]=rand(0,16);a[i*3+2]=rand(-24,24);const q=L[i%L.length];c[i*3]=q.r;c[i*3+1]=q.g;c[i*3+2]=q.b}
 g.setAttribute('position',new THREE.BufferAttribute(a,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
 const mat=new THREE.PointsMaterial({map:typeof glowTex!=='undefined'?glowTex:null,vertexColors:true,size:.34,transparent:true,opacity:0,depthWrite:false});const p=new THREE.Points(g,mat);p.frustumCulled=false;p.renderOrder=5;scene.add(p);return p}
function autTick(dt){if(mode!=='play')return;
 if(!AUT.map&&typeof MAPC!=='undefined'&&MAPC){AUT.map=1;try{autMap()}catch(e){console.warn('autumn map',e)}}
 if(!AUT.leaf)AUT.leaf=autLeafInit();const sp=AUT.leaf,tx=camT.x,tz=camT.z,inI=!INT.on&&autIsls().some(J=>islAt(tx,tz)===J&&hAt(tx,tz)>-1);
 AUT.k=clamp(AUT.k+(inI?dt:-dt)*.8,0,1);sp.visible=AUT.k>.01;if(!sp.visible)return;sp.material.opacity=.9*AUT.k;
 const arr=sp.geometry.attributes.position.array,t=performance.now()/1000;for(let i=0;i<arr.length;i+=3){const j=i/3;arr[i+1]-=dt*(.55+(j%5)*.09);arr[i]+=dt*(.9*Math.sin(t*1.3+j*.7)+.35);arr[i+2]+=dt*.5*Math.cos(t*1.1+j*.4);
  if(arr[i+1]<-.6){arr[i+1]=16;arr[i]=rand(-24,24);arr[i+2]=rand(-24,24)}if(arr[i]>24)arr[i]-=48;if(arr[i+2]>24)arr[i+2]-=48;if(arr[i+2]<-24)arr[i+2]+=48}
 sp.geometry.attributes.position.needsUpdate=true;sp.position.set(tx,(camT.y||1)-.3,tz-2)}
{const _u=updEnv;updEnv=function(dt,x,z){_u.apply(this,arguments);try{autTick(dt)}catch(e){}}}
/* ⑤ 지도 */
function autMap(){if(!MAPC)return;const c=MAPC.getContext('2d');for(const I of autIsls()){const x0=Math.max(0,Math.floor(I.x-I.br)),z0=Math.max(0,Math.floor(I.z-I.br)),w=Math.min(WS,Math.ceil(I.x+I.br))-x0,h=Math.min(WS,Math.ceil(I.z+I.br))-z0;
 const im=c.getImageData(x0,z0,w,h),d=im.data;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=x0+i+.5,z=z0+j+.5,hh=hAt(x,z);if(hh<.25||islAt(x,z)!==I)continue;const k=(j*w+i)*4,t=hh>=.95?.72:.4,q=noise(x*.08,z*.08,85)>.55;
  d[k]=lerp(d[k],q?214:222,t);d[k+1]=lerp(d[k+1],q?128:178,t);d[k+2]=lerp(d[k+2],q?62:84,t)}c.putImageData(im,x0,z0)}}
