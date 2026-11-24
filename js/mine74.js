'use strict';
/* ===== 74차(디자인, 기획자 11-23 22:16): 동굴 안 = 동북섬 크기 지하 광산 =====
   기획자: '맵 가운데 동굴 있잖아, 안에 들어가면 맵이 있는데 거기 맵 다시 설계할 거야. 안에 들어가면 대략 크기는 동북섬 정도의 크기에
           지하 광산 느낌으로 다시 꾸며 줘'.
   cave.js(53차 광산)의 들어가기·나가기·카메라·[지상으로] 버튼은 그대로 두고, 광산 모양(mineFloorAt·mineOpen·caveRoom)만 바꿔 끼워요.
   - 크기: 약 278 × 239m(동북섬 상자와 비슷), 걸을 수 있는 땅 약 2.5만㎡. 방 15개 + 갱도 17개, 입구는 남쪽 가운데(예전 자리 그대로).
   - 구역: 입구 갱도 → 광차 기지(사무실·하역장·광차 셋) / 화약 창고(남동) / 무너진 옛 갱도(남서) / 펌프실(물 고인 웅덩이) /
           중앙 수직갱 광장(권양탑·승강기·위에서 내려오는 빛 기둥·선별기) / 광부 야영지(천막·모닥불) / 지하 호수(북서) /
           수정 동굴(북) / 버섯 숲(북동) / 채굴장(동, 광맥·드릴·작업등, 막다른 갱도 둘).
   - 바위는 높이 지도 한 장: 화면 쪽(남)을 가리는 벽은 낮게, 화면을 보는 벽(북)은 높게(캐릭터가 벽 뒤에 숨지 않게). 바위 윗면은 어두운 암반.
   - 빛: 등·모닥불·수정·버섯·빛 기둥을 바닥·벽·소품 색에 구워 넣고(aEm), 캐릭터 둘레는 손전등 빛(INT.L)이 따라다녀요.
   - 걷기: 같은 칸 삼각형으로 바닥·벽·충돌을 맞추고, 소품은 원 충돌(8m 칸 해시). 호수·웅덩이·수직갱 구멍은 못 들어가요. */
const M74={c:1.5,I0:-104,I1:104,J0:-92,J1:94,HT:4.6,W:null,F:null,LK:null,HN:null,TH:null,nI:0,nJ:0,
 /* 방: [x, z, 반지름x, 반지름z, 돌림, 테마] — 테마: 0 광차 기지 1 화약 2 옛 갱도 3 펌프 4 중앙 5 야영지 6 호수 7 수정 8 버섯 9 채굴장 */
 halls:[[0,78,34,20,0,0],[-10,70,16,14,.3,0],[62,96,18,12,.2,1],[-62,94,20,13,-.1,2],[-102,62,14,11,.4,3],
  [2,8,48,34,0,4],[30,22,20,16,.5,4],[-24,-6,20,16,-.4,4],[-84,20,30,21,.15,5],[-92,-60,38,28,.25,6],
  [-14,-80,34,22,-.1,7],[10,-90,16,12,0,7],[64,-72,32,23,.3,8],[94,2,36,28,-.15,9],[112,-16,16,12,.5,9]],
 lakes:[[-96,-64,22,14,.2],[-104,64,6.5,4.6,.4]],
 tun:[{w:4.2,p:[[0,132],[0,96]],th:0},{w:3.6,p:[[24,86],[46,93]],th:1},{w:3.5,p:[[-24,86],[-44,91]],th:2},{w:3.4,p:[[-72,90],[-92,72]],th:3},
  {w:3.4,p:[[-100,52],[-92,40]],th:5},{w:4.6,p:[[0,60],[0,40]],th:4},{w:4,p:[[-42,14],[-56,18]],th:5},{w:4,p:[[-84,0],[-88,-14],[-90,-34]],th:6},
  {w:4,p:[[-58,-66],[-46,-74]],th:7},{w:4.2,p:[[-6,-22],[-8,-40],[-12,-58]],th:4},{w:3.8,p:[[18,-80],[34,-76]],th:8},{w:4,p:[[78,-52],[86,-26]],th:9},
  {w:4.6,p:[[46,8],[60,4]],th:9},{w:3.4,p:[[92,28],[86,56],[72,86]],th:9},{w:2.8,p:[[112,-26],[122,-44],[124,-56]],th:9},{w:2.8,p:[[126,6],[142,10]],th:9},
  {w:3,p:[[-78,96],[-100,100],[-112,98]],th:2}],
 /* 테마 색: 바닥, 바위 */
 /* 75차: 게임 색 — 바닥은 흙길(roads.js 0xbb9c6e) 계열, 바위는 바깥 바위(lkBoulder 0x8e8e96) 계열 */
 thF:[0xb3874f,0xb8834e,0xa58b6a,0x939886,0xb88c55,0xbe8a4c,0xc4a774,0x8a7fa8,0x6a9448,0xbb8649],
 thR:[0x8a8a94,0x8e878c,0x86868f,0x7f8a94,0x8c8c95,0x8f8a8a,0x7e8a99,0x7f7899,0x7e8c7e,0x908a84],
 solids:new Map(),lights:[],rails:[],shaft:null,anim:{fire:[],crys:[],dust:[],mush:[]},area:0,built:0};
M74.nI=M74.I1-M74.I0+1;M74.nJ=M74.J1-M74.J0+1;
for(const h of M74.halls){h.c=Math.cos(h[4]);h.s=Math.sin(h[4])}
for(const h of M74.lakes){h.c=Math.cos(h[4]);h.s=Math.sin(h[4])}
const m74smax=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.max(a,b)+h*h*k*.25};
function m74hall(x,z,h){const dx=x-h[0],dz=z-h[1],lx=dx*h.c+dz*h.s,lz=-dx*h.s+dz*h.c;return(1-Math.hypot(lx/h[2],lz/h[3]))*Math.min(h[2],h[3])}
function m74seg(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],u=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz)}
/* 걸을 수 있는 정도(+면 바닥) · 호수 · 방다움(0 갱도 ~ 1 방) · 테마 */
function m74field(x,z){let fh=-1e9,ft=-1e9,best=-1e9,th=4;
 for(const h of M74.halls){const v=m74hall(x,z,h);fh=m74smax(fh,v,6);if(v>best){best=v;th=h[5]}}
 let bt=-1e9,tth=4;for(const t of M74.tun)for(let i=1;i<t.p.length;i++){const v=t.w-m74seg(x,z,t.p[i-1],t.p[i]);ft=m74smax(ft,v,3);if(v>bt){bt=v;tth=t.th}}
 if(bt>best+1.5)th=tth;   /* 75차: 갱도는 자기 테마 색(먼 큰 방 색이 번지지 않게) */
 let f=m74smax(fh,ft,5);const hn=clamp((fh-ft+2)/4,0,1);
 f+=(1.3*Math.sin(x*.17+z*.11)+Math.cos(z*.23-x*.07)+.7*Math.sin(x*.41-z*.29))*(.45+.75*hn);
 let lk=-1e9;for(const h of M74.lakes)lk=Math.max(lk,m74hall(x,z,h));
 return{f,lk,hn,th}}
function m74idx(i,j){return(i-M74.I0)*M74.nJ+(j-M74.J0)}
function m74sample(){const N=M74.nI*M74.nJ,c=M74.c;M74.W=new Float32Array(N);M74.F=new Float32Array(N);M74.LK=new Float32Array(N);M74.HN=new Float32Array(N);M74.TH=new Uint8Array(N);
 for(let i=M74.I0;i<=M74.I1;i++)for(let j=M74.J0;j<=M74.J1;j++){const k=m74idx(i,j),o=m74field(i*c,j*c);M74.F[k]=o.f;M74.LK[k]=o.lk;M74.HN[k]=o.hn;M74.TH[k]=o.th;M74.W[k]=Math.min(o.f,-1-o.lk)}}
/* 바닥인가: 그물 칸을 같은 대각선으로 나눈 삼각형 보간(바닥 모양·벽·충돌·터치가 모두 같은 선) */
mineFloorAt=function(x,z){if(!M74.W)m74sample();const c=M74.c,u=x/c,v=z/c,i=Math.floor(u),j=Math.floor(v);
 if(i<M74.I0||i>=M74.I1||j<M74.J0||j>=M74.J1)return false;const W=M74.W,dx=u-i,dz=v-j,a=W[m74idx(i,j)],cc=W[m74idx(i+1,j+1)];
 return(dx<dz?a*(1-dz)+W[m74idx(i,j+1)]*(dz-dx)+cc*dx:a*(1-dx)+W[m74idx(i+1,j)]*(dx-dz)+cc*dz)>0};
function m74solid(x,z,r){const k=Math.floor(x/8)+','+Math.floor(z/8);if(!M74.solids.has(k))M74.solids.set(k,[]);M74.solids.get(k).push([x,z,r])}
function m74hitSolid(x,z,r){const i0=Math.floor((x-r-4)/8),i1=Math.floor((x+r+4)/8),j0=Math.floor((z-r-4)/8),j1=Math.floor((z+r+4)/8);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=M74.solids.get(i+','+j);if(L)for(const s of L)if((x-s[0])**2+(z-s[1])**2<(s[2]+r)**2)return true}return false}
mineOpen=function(x,z,r){for(const d of[[-r,-r],[r,-r],[-r,r],[r,r]])if(!mineFloorAt(x+d[0],z+d[1]))return false;return!m74hitSolid(x,z,r)};

/* ---------- 빛(구워 넣는 것) ---------- */
function m74light(x,z,y,r,col,k){const L={x,z,y,r,c:new THREE.Color(col).convertSRGBToLinear(),k};M74.lights.push(L);M74.LG=null}
/* 빛 칸(16m): 꼭짓점마다 가까운 빛만 봐요 */
function m74lgrid(){const G=new Map();for(const L of M74.lights){for(let i=Math.floor((L.x-L.r)/16);i<=Math.floor((L.x+L.r)/16);i++)for(let j=Math.floor((L.z-L.r)/16);j<=Math.floor((L.z+L.r)/16);j++){const k=i+','+j;if(!G.has(k))G.set(k,[]);G.get(k).push(L)}}M74.LG=G}
const M74_NOL=[];
function m74lightAt(x,y,z,nx,ny,nz,out){out[0]=out[1]=out[2]=0;if(!M74.LG)m74lgrid();const LL=M74.LG.get(Math.floor(x/16)+','+Math.floor(z/16))||M74_NOL;for(const L of LL){const dx=L.x-x,dz=L.z-z,dd=dx*dx+dz*dz;if(dd>L.r*L.r)continue;const dy=L.y-y,d=Math.sqrt(dd+dy*dy)||1,f=Math.max(0,1-d/L.r);
  let face=1;if(nx!==undefined){face=(dx*nx+dy*ny+dz*nz)/d;face=Math.max(.12,face*.85+.15)}const w=f*f*L.k*face;out[0]+=L.c.r*w;out[1]+=L.c.g*w;out[2]+=L.c.b*w}return out}
/* aEm(구운 빛)을 램버트 재질에 더하는 작은 고침 */
function m74mat(o){const m=new THREE.MeshLambertMaterial(Object.assign({vertexColors:true},o||{}));
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aEm;\nvarying vec3 vEm;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEm=aEm;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vEm;').replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = emissive + vEm;')};
 m.customProgramCacheKey=()=>'m74aEm';return m}
/* 합친 소품 덩어리에 빛을 구워요(색 × 빛, 면이 빛을 보는 만큼) */
function m74bake(g,amb){const P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,n=P.count,e=new Float32Array(n*3),o=[0,0,0];
 for(let i=0;i<n;i++){m74lightAt(P.getX(i),P.getY(i),P.getZ(i),N?N.getX(i):undefined,N?N.getY(i):0,N?N.getZ(i):0,o);const a=amb||0;
  e[i*3]=C.getX(i)*(o[0]*.55+a);e[i*3+1]=C.getY(i)*(o[1]*.55+a);e[i*3+2]=C.getZ(i)*(o[2]*.55+a)}g.setAttribute('aEm',new THREE.BufferAttribute(e,3));return g}

/* ---------- 바닥·바위 그림(작은 캔버스) ---------- */
function m74tex(kind){const N=kind?128:128,cv=document.createElement('canvas');cv.width=kind?64:N;cv.height=N;const x=cv.getContext('2d');
 if(!kind){x.fillStyle='#cfcac4';x.fillRect(0,0,N,N);for(let i=0;i<900;i++){const px=hash(i,1,7)*N,py=hash(i,2,7)*N,r=.6+hash(i,3,7)*2.2;x.fillStyle=i%3?'rgba(70,62,70,.22)':'rgba(255,250,238,.35)';x.beginPath();x.ellipse(px,py,r,r*.7,hash(i,4,7)*3,0,7);x.fill()}}
 else{const B=['#d8d2cc','#c2bcc0','#cfc6bb','#b6b0b8','#d4ccc2','#bdb5ba'];let y=0,i=0;while(y<N){const h=6+hash(i,5,9)*18;x.fillStyle=B[i%B.length];x.fillRect(0,y,64,h+1);y+=h;i++}
  for(let k=0;k<260;k++){const px=hash(k,1,3)*64,py=hash(k,2,3)*N;x.fillStyle=k%2?'rgba(60,52,64,.25)':'rgba(255,255,255,.25)';x.fillRect(px,py,2+hash(k,3,3)*8,1)}
  x.strokeStyle='rgba(50,44,56,.35)';x.lineWidth=1;for(let k=0;k<7;k++){x.beginPath();let px=hash(k,8,3)*64,py=hash(k,9,3)*N;x.moveTo(px,py);for(let s=0;s<4;s++){px+=(hash(k,s,4)-.5)*12;py+=6+hash(k,s,5)*10;x.lineTo(px,py)}x.stroke()}}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t}

/* ---------- 땅(바닥 + 바위 벽 + 암반 윗면): 32m 조각으로 나눠 화면 밖은 안 그려요 ---------- */
function m74terrain(C){const c=M74.c,W=M74.W,F=M74.F,LK=M74.LK,TH=M74.TH,HT=M74.HT,I0=M74.I0,J0=M74.J0,nI=M74.nI,nJ=M74.nJ;
 const Y=new Float32Array(nI*nJ),NX=new Float32Array(nI*nJ),NZ=new Float32Array(nI*nJ);
 const Wg=(i,j)=>W[m74idx(clamp(i,I0,M74.I1),clamp(j,J0,M74.J1))];
 for(let i=I0;i<=M74.I1;i++)for(let j=J0;j<=M74.J1;j++){const k=m74idx(i,j),w=W[k];let gx=(Wg(i+1,j)-Wg(i-1,j)),gz=(Wg(i,j+1)-Wg(i,j-1));const gl=Math.hypot(gx,gz)||1;gx/=gl;gz/=gl;NX[k]=gx;NZ[k]=gz;
  if(F[k]>0&&LK[k]>-1){Y[k]=LK[k]>0?-Math.min(1.1,LK[k]*.32):0;continue}   /* 호수 바닥 */
  if(w>0){Y[k]=0;continue}
  const s=-w,hc=HT*sm(0,1.35,s),hr=Math.min(HT,.85+1.12*s),q=sm(.05,.65,-gz);let h=lerp(hc,hr,q);
  h+=(hash(i,j,5)-.5)*.55*sm(1.4,3.2,s);Y[k]=h}
 M74.Y=Y;
 const tiles=new Map(),TS=32,tile=(x,z)=>{const key=Math.floor(x/TS)+','+Math.floor(z/TS);let t=tiles.get(key);if(!t){t={f:{p:[],c:[],e:[],u:[]},r:{p:[],c:[],e:[],u:[]}};tiles.set(key,t)}return t};
 const thF=M74.thF.map(h=>new THREE.Color(h).convertSRGBToLinear()),thR=M74.thR.map(h=>new THREE.Color(h).convertSRGBToLinear()),TOP=new THREE.Color(0x4a4853).convertSRGBToLinear(),RIM=new THREE.Color(0xb6b6be).convertSRGBToLinear();
 const tmp=[0,0,0],col=new THREE.Color();
 /* 꼭짓점 색(바닥/바위) */
 const vcol=(rock,x,z,y,k,isEdge)=>{const th=TH[k];if(!rock){col.copy(thF[th]);const n=.94+.09*Math.sin(x*.09+z*.07)*Math.cos(z*.11-x*.05)+.035*(hash(Math.floor(x*.7),Math.floor(z*.7),11)-.5);col.multiplyScalar(n);
   if(th===8){const m=sm(.35,.85,Math.sin(x*.17)*Math.cos(z*.15)*.5+.5);col.lerp(new THREE.Color(0xb59a6c).convertSRGBToLinear(),m*.4)}
   if(LK[k]>-3.5&&th===6)col.lerp(new THREE.Color(0xe0d0a4).convertSRGBToLinear(),.55*sm(-3.5,-1,LK[k]));
   if(isEdge||W[k]<1.2)col.multiplyScalar(.9);return col}
  col.copy(thR[th]);const s=-W[k];col.multiplyScalar(.95+.06*Math.sin(x*.21+z*.13)+.04*Math.sin(y*2.1+x*.07));if(y<.9)col.multiplyScalar(.8+.22*y);
  if(s>1.1&&y>HT*.82)col.lerp(RIM,.5*(1-sm(1.9,3.0,s)));col.lerp(TOP,sm(2.2,3.8,s));return col};
 const push=(T,x,y,z,cl,em,u,v)=>{T.p.push(x,y,z);T.c.push(cl.r,cl.g,cl.b);T.e.push(em[0],em[1],em[2]);T.u.push(u,v)};
 const V=(i,j)=>{const k=m74idx(i,j);return{x:i*c,z:j*c,w:W[k],y:Y[k],k,nx:NX[k],nz:NZ[k]}};
 const emit=(poly,floor)=>{if(poly.length<3)return;let cx=0,cz=0;for(const p of poly){cx+=p.x;cz+=p.z}const T=tile(cx/poly.length,cz/poly.length)[floor?'f':'r'];
  let fnx=0,fnz=0;if(!floor){/* 면 방향으로 u 고르기 */const a=poly[0],b=poly[1],d=poly[2],ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=d.x-a.x,vy=d.y-a.y,vz=d.z-a.z;fnx=uy*vz-uz*vy;fnz=ux*vy-uy*vx}
  const useX=Math.abs(fnz)>=Math.abs(fnx);
  for(let n=2;n<poly.length;n++)for(const p of[poly[0],poly[n-1],poly[n]]){const isR=!floor&&p.y>.05&&F[p.k]<=0,cl=vcol(isR,p.x,p.z,p.y,p.k,p.edge);
   const em=isR?m74lightAt(p.x,p.y,p.z,p.nx,.15,p.nz,tmp):m74lightAt(p.x,.2,p.z,undefined,0,0,tmp);const top=!floor&&(-p.w)>2?1-sm(2,3.4,-p.w):1;
   const e=[em[0]*cl.r*top*.5,em[1]*cl.g*top*.5,em[2]*cl.b*top*.5];push(T,p.x,p.y,p.z,cl,e,floor?p.x/5:(useX?p.x:p.z)/3.2,floor?p.z/5:p.y/2.3)}};
 const cut=tri=>{const fl=[],rk=[];for(let n=0;n<3;n++){const a=tri[n],b=tri[(n+1)%3];const af=a.w>0,bf=b.w>0;if(af)fl.push(a);else rk.push(a);
   if(af!==bf){const t=a.w/(a.w-b.w),p={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,w:0,y:0,k:t<.5?a.k:b.k,nx:a.nx,nz:a.nz,edge:1};fl.push(p);rk.push(p)}}
  emit(fl,true);if(rk.length>=3){/* 바위 쪽은 원래 꼭짓점 높이, 잘린 점은 바닥 높이 */emit(rk,false)}};
 for(let i=I0;i<M74.I1;i++)for(let j=J0;j<M74.J1;j++){const a=V(i,j),b=V(i,j+1),cc=V(i+1,j+1),d=V(i+1,j);
  if(a.w<-6&&b.w<-6&&cc.w<-6&&d.w<-6&&a.y===b.y&&false)continue;cut([a,b,cc]);cut([a,cc,d])}
 const mf=m74mat({}),mr=m74mat({});let tris=0;
 for(const t of tiles.values())for(const [k,m] of[['f',mf],['r',mr]]){const T=t[k];if(!T.p.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(T.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(T.c,3));g.setAttribute('aEm',new THREE.Float32BufferAttribute(T.e,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(T.u,2));
  if(k==='r'&&typeof lkSmooth==='function')lkSmooth(g,52);else g.computeVertexNormals();g.computeBoundingSphere();const o=new THREE.Mesh(g,m);o.receiveShadow=false;C.add(o);tris+=T.p.length/9}
 M74.tris=tris;
 /* 그물 밖은 끝없는 암반(바깥 바다가 비치지 않게) */
 {const x0=I0*c,x1=M74.I1*c,z0=J0*c,z1=M74.J1*c,E=260,m=new THREE.MeshLambertMaterial({color:new THREE.Color(0x4a4853).convertSRGBToLinear()});
  for(const [ax,bx,az,bz] of[[x0-E,x1+E,z0-E,z0],[x0-E,x1+E,z1,z1+E],[x0-E,x0,z0,z1],[x1,x1+E,z0,z1]]){const g=new THREE.PlaneGeometry(bx-ax,bz-az);g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,m);o.position.set((ax+bx)/2,HT,(az+bz)/2);C.add(o)}}
 /* 호수·웅덩이 물 */
 for(const h of M74.lakes){const g=new THREE.CircleGeometry(1,56);g.rotateX(-Math.PI/2);g.scale(h[2]+.3,1,h[3]+.3);g.rotateY(-h[4]);
  const w=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:new THREE.Color(0x1f5d7e).convertSRGBToLinear(),transparent:true,opacity:.92,depthWrite:false}));w.position.set(h[0],-.12,h[1]);C.add(w);
  const g2=new THREE.RingGeometry(.9,1,56);g2.rotateX(-Math.PI/2);g2.scale(h[2],1,h[3]);g2.rotateY(-h[4]);const r=new THREE.Mesh(g2,new THREE.MeshBasicMaterial({color:0x5fc4e6,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));r.position.set(h[0],-.1,h[1]);C.add(r);
  for(let n=0;n<Math.round(h[2]*h[3]/14);n++){const a=hash(n,1,h[0]|0)*6.28,q=Math.sqrt(hash(n,2,h[0]|0))*.85,lx=Math.cos(a)*h[2]*q,lz=Math.sin(a)*h[3]*q,sp=glow(0x9fe8ff,.5+hash(n,3,5)*.6,.35);sp.position.set(h[0]+lx*h.c-lz*h.s,-.05,h[1]+lx*h.s+lz*h.c);C.add(sp);M74.anim.mush.push(sp)}}}

/* ---------- 소품 (75차: 게임 스타일 — 둥근 판·나무색·크림·빨강·청록, 바깥 바위·텐트·등·드럼통 같은 게임 모델을 그대로 써요) ---------- */
function caveRoom74(){
 if(INT.gr.cave)return;const t0=performance.now();m74sample();M74.solids.clear();M74.lights.length=0;M74.LG=null;M74.rails.length=0;for(const k in M74.anim)M74.anim[k].length=0;
 const C=INT.gr.cave=new THREE.Group();C.position.set(MINE.ox,0,MINE.oz);C.visible=false;INT.g.add(C);
 const chunks=new Map(),glowCh=new Map(),add=(map,g,x,z)=>{const k=Math.floor(x/32)+','+Math.floor(z/32);if(!map.has(k))map.set(k,[]);map.get(k).push(g)};
 /* P: 소품 조각 · RB: 둥근 판(게임 기본 모양) · PG: 게임 모델 그대로 · G: 스스로 빛나는 조각 · halo: 빛 스프라이트 */
 const P=(geo,col,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>add(chunks,pt(geo,col,[x,y,z],[rx,ry,rz],[sx,sy,sz]),x,z);
 const RB=(w,h,d,col,x,y,z,rx=0,ry=0,rz=0,cr=.05,bv=.03)=>add(chunks,pt(lkRb(w,h,d,cr,bv),col,[x,y,z],[rx,ry,rz]),x,z);
 const PG=(k,x,y,z,ry=0,s=1)=>{if(GEO[k])add(chunks,pt(GEO[k],null,[x,y,z],[0,ry,0],[s,s,s]),x,z)};
 const G=(geo,col,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>add(glowCh,pt(geo,col,[x,y,z],[rx,ry,rz],[sx,sy,sz]),x,z);
 const halo=(col,s,op,x,y,z)=>{const h=glow(col,s,op);h.position.set(x,y,z);C.add(h);return h};
 const solid=m74solid,open=(x,z,r)=>mineOpen(x,z,r),railNear=(x,z,d)=>M74.rails.some(s=>m74seg(x,z,s[0],s[1])<d);
 const free=(x,z,r,rail=2.2)=>open(x,z,r)&&!railNear(x,z,rail+r);
 const wallDist=(x,z,dx,dz,max=20)=>{for(let d=0;d<max;d+=.4)if(!mineFloorAt(x+dx*d,z+dz*d))return d;return max};
 const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,s=10)=>new THREE.CylinderGeometry(a,b,h,s),unit=new THREE.BoxGeometry(1,1,1),lump=new THREE.IcosahedronGeometry(1,0);
 /* 게임 색: 나무(LKH.wood)·짙은 나무·통나무 끝·짙은 쇠·크림·빨강·노랑·청록·콘크리트·바위 회색 */
 const W0=0xd18a50,W1=0xc47d45,W2=0xdb9659,WD=0x9a5a30,WD2=0x7d4824,END=0xdcb98e,DK=0x3a3f4f,DK2=0x2c3346,CR=0xeee3cc,RED=0xdb5a4c,YEL=0xf2c94c,TEAL=0x3aa6b0,TEAL2=0x2f8f99,CONC=0xd6d0cc,ST=[0x8e8e96,0x83838c,0x9a9aa2,0x8a8a93];
 const ORE=[0xf2c230,0xd7743f,0x4fb39a,0xb6c2cf];
 const boulder=(r,x,z,s=0,sy=.72,c)=>add(chunks,lkBoulder(r,c===undefined?ST[Math.abs(s|0)%4]:c,s,[x,0,z],sy),x,z);
 const rockPile=(x,z,r,n,seedK,sy=.72)=>{for(let k=0;k<n;k++){const a=hash(k,seedK,3)*6.28,q=k?r*(.45+hash(k,seedK,5)*.5):0;boulder(r*(k?.38+hash(k,seedK,7)*.3:.62),x+Math.cos(a)*q,z+Math.sin(a)*q,k+seedK,sy)}};

 /* ===== 레일(자갈 + 나무 침목 + 짙은 레일) ===== */
 function railway(points){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));const len=curve.getLength(),cnt=Math.ceil(len/1.4);
  const cross=[[-1.3,.012],[-1.0,.07],[1.0,.07],[1.3,.012]],rail=[[-.09,.13],[-.09,.16],[-.035,.17],[-.035,.21],[-.065,.22],[-.065,.25],[.065,.25],[.065,.22],[.035,.21],[.035,.17],[.09,.16],[.09,.13]];
  const steel=[DK,DK,DK2,DK2,DK,0xc9c4bd,0xc9c4bd,DK,DK2,DK2,DK],bal=[0xa69a8a,0xb3a796,0xa69a8a];let prev;
  for(let k=0;k<=cnt;k++){const t=k/cnt,p=curve.getPointAt(t),v=curve.getTangentAt(t),off=(d,h)=>[p.x+d*v.z,h,p.z-d*v.x];
   const row=[cross.map(([d,h])=>off(d,h)),...[-.75,.75].map(sd=>rail.map(([d,h])=>off(sd+d,h)))];
   if(prev){const pos=[],cs=[];for(let s=0;s<row.length;s++)for(let n=1;n<row[s].length;n++){const cl=new THREE.Color(s?steel[n-1]:bal[n-1]).convertSRGBToLinear();
     for(const vx of[prev[s][n-1],row[s][n-1],row[s][n],prev[s][n-1],row[s][n],prev[s][n]]){pos.push(...vx);cs.push(cl.r,cl.g,cl.b)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));add(chunks,g,p.x,p.z)}
   prev=row;const yaw=Math.atan2(v.x,v.z)+(hash(k,4,9)-.5)*.04;P(unit,[W0,W1,W2][k%3],p.x,.1,p.z,0,yaw,0,1.95,.1,.26)}
  for(let i=1;i<points.length;i++)M74.rails.push([points[i-1],points[i]]);return curve}
 const mainLine=railway([[0,128],[0,110],[0,96],[0,84],[0,70],[0,56],[1,44],[4,32],[12,22],[26,13],[42,8],[58,5],[74,4],[88,2],[100,-4]]);
 const yardE=railway([[0,92],[3,87],[9,82],[17,78],[24,76]]);
 const yardW=railway([[0,90],[-3,85],[-9,80],[-17,76],[-25,74]]);
 railway([[12,22],[6,18],[0,15],[-6,12]]);
 const digSpur=railway([[88,2],[96,-8],[103,-15],[108,-19]]);
 const camp=railway([[-40,12],[-50,16],[-60,20]]);
 /* 광차: 둥근 청록 통 + 크림 테두리 + 짙은 바퀴(게임 보급 상자·통통배 색) */
 function cart(line,f,loaded,ore=ORE[3]){const p=line.getPointAt(f),tg=line.getTangentAt(f),yaw=Math.atan2(tg.x,tg.z),parts=[],wh=cyl(.3,.3,.16,14);
  for(const e of[-.7,.7])for(const sd of[-1,1])parts.push(pt(wh,DK2,[sd*.76,.45,e],[0,0,Math.PI/2]),pt(cyl(.13,.13,.18,10),CONC,[sd*.78,.45,e],[0,0,Math.PI/2]));
  parts.push(pt(lkRb(1.42,.2,2.2,.06,.03),DK,[0,.72,0]),pt(lkRb(1.62,.86,2.36,.14,.05),TEAL,[0,1.2,0]),pt(lkRb(1.74,.14,2.48,.06,.03),CR,[0,1.62,0]),pt(lkRb(1.36,.1,2.0,.04,.02),TEAL2,[0,1.66,0]));
  for(const sd of[-1,1])parts.push(pt(lkRb(.06,.56,1.9,.03,.01),CR,[sd*.82,1.18,0]));
  if(loaded)for(let n=0;n<9;n++)parts.push(pt(new THREE.IcosahedronGeometry(.26,0),n%3===0?ORE[0]:ore,[(n%3-1)*.42,1.72+hash(n,2,4)*.12,(Math.floor(n/3)-1)*.55],[.4,n,.3]));
  const g=mg(parts);g.applyMatrix4(new THREE.Matrix4().makeRotationY(yaw).setPosition(p.x,.07,p.z));add(chunks,g,p.x,p.z);solid(p.x+tg.x*.7,p.z+tg.z*.7,1);solid(p.x-tg.x*.7,p.z-tg.z*.7,1)}
 function bufferStop(line){const p=line.getPointAt(1),tg=line.getTangentAt(1),yaw=Math.atan2(tg.x,tg.z),x=p.x+tg.x*.6,z=p.z+tg.z*.6;
  RB(2.1,.42,.36,RED,x,.62,z,0,yaw,0);RB(2.12,.12,.38,CR,x,.62,z,0,yaw,0);for(const sd of[-1,1])RB(.22,.8,.26,DK,x+Math.cos(yaw)*sd*.8,.4,z-Math.sin(yaw)*sd*.8,0,yaw,0);solid(x,z,1.1)}
 bufferStop(yardE);bufferStop(yardW);bufferStop(digSpur);bufferStop(camp);

 /* ===== 등: 게임 가로등과 같은 등머리(짙은 갓 + 크림 고리 + 빛나는 유리) ===== */
 function lampHead(x,y,z,col=0xffe2a0,lr=10,lk=1){P(new THREE.SphereGeometry(.21,16,8,0,Math.PI*2,0,Math.PI/2),DK,x,y+.05,z,0,0,0,1,.72,1);P(new THREE.TorusGeometry(.205,.026,6,18),CR,x,y+.05,z,Math.PI/2);
  P(cyl(.025,.025,.5,6),DK,x,y+.45,z);G(new THREE.SphereGeometry(.15,14,8),col,x,y,z,0,0,0,1,.55,1);halo(col,2.2,.45,x,y-.05,z);m74light(x,z,y,lr,col,lk)}
 function lampPost(x,z,ry=0,H=2.4,col=0xffe2a0){const g=mg(lkLampParts(H));g.applyMatrix4(new THREE.Matrix4().makeRotationY(ry).setPosition(x,0,z));add(chunks,g,x,z);
  const bx=x+Math.sin(ry)*.49,bz=z+Math.cos(ry)*.49;G(new THREE.SphereGeometry(.15,14,8),col,bx,H+.05,bz,0,0,0,1,.55,1);halo(col,2.6,.5,bx,H,bz);m74light(bx,bz,H,11,col,1.05);solid(x,z,.26)}
 /* ===== 갱목 틀: 둥근 나무 기둥 둘 + 둥근 들보(통나무 끝 색) ===== */
 function frame(x,z,ang,hw,lamp){const parts=[],H=3.4,c=Math.cos(ang),s=Math.sin(ang);
  for(const sd of[-1,1]){const px=sd*hw;parts.push(pt(cyl(.22,.26,H,12),sd<0?W1:W0,[px,H/2,0]),pt(cyl(.3,.32,.22,12),CONC,[px,.11,0]),pt(cyl(.25,.25,.1,12),WD,[px,H-.05,0]));solid(x+c*px,z-s*px,.3)}
  parts.push(pt(lkRb(2*hw+.8,.44,.44,.14,.04),W2,[0,H+.18,0]));for(const sd of[-1,1])parts.push(pt(cyl(.2,.2,.04,12),END,[sd*(hw+.42),H+.18,0],[0,0,Math.PI/2]));
  for(const sd of[-1,1])parts.push(pt(lkRb(.16,.9,.16,.05,.02),WD,[sd*(hw-.38),H-.32,0],[0,0,-sd*.75]));
  const g=mg(parts);g.applyMatrix4(new THREE.Matrix4().makeRotationY(ang).setPosition(x,0,z));add(chunks,g,x,z);
  if(lamp){const lx=x+c*(hw-.7),lz=z-s*(hw-.7);lampHead(lx,H-.55,lz)}}
 function timberRun(a,b,step,lampEvery=2,max=4.4){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;let n=0;
  for(let u=step*.5;u<L;u+=step){const x=a[0]+dx*u,z=a[1]+dz*u,px=dz,pz=-dx;const l=wallDist(x,z,-px,-pz),r=wallDist(x,z,px,pz),hw=Math.min(l,r,max)-.55;if(hw<1.6)continue;
   const ox=Math.max(-1,Math.min(1,(r-l)/2));frame(x+px*ox,z+pz*ox,Math.atan2(dx,dz),hw,n++%lampEvery===0)}}
 timberRun([0,132],[0,97],6.5,2);timberRun([0,62],[0,41],7,1);timberRun([46,8],[60,4],7,1);timberRun([24,86],[46,93],7,2,3.6);timberRun([-24,86],[-44,91],7,2,3.6);
 timberRun([-72,90],[-92,72],8,2,3.4);timberRun([92,28],[86,56],8,2,3.4);timberRun([86,56],[72,86],8,2,3.4);timberRun([-42,14],[-56,18],8,1);
 timberRun([112,-26],[122,-44],6,2,2.8);timberRun([126,6],[142,10],6,2,2.8);timberRun([-6,-22],[-8,-40],8,2);

 /* ===== 입구: 판자 문턱 + 바위 + 바깥 빛 + 노란 표지판(게임 표지판) ===== */
 for(let i=0;i<5;i++)RB(3.6,.12,.34,[W0,W1,W2][i%3],0,.06,126.3+i*.38);
 rockPile(-3.6,129.6,1.6,4,11,.9);rockPile(3.6,129.8,1.6,4,17,.9);
 m74light(0,131,1.5,12,0xfff0d0,1.1);halo(0xfff6e0,9,.3,0,1.2,131.5);
 {const g=new THREE.PlaneGeometry(6,5);g.rotateX(-Math.PI/2);const cv=document.createElement('canvas');cv.width=8;cv.height=64;const k=cv.getContext('2d'),gr=k.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,246,224,0)');gr.addColorStop(1,'rgba(255,246,224,.9)');k.fillStyle=gr;k.fillRect(0,0,8,64);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(0,.03,129.5);C.add(m)}
 if(typeof plBoardGeo==='function'){const x=-3.1,z=118;add(chunks,pt(plBoardGeo(2.2,.62),null,[x,0,z],[0,.2,0],[.8,.8,.8]),x,z);if(typeof plSignText==='function'){const s=plSignText('⛏ 초승달 광산',1.7,.36,72);s.position.set(x+.03,1.06,z+.1);s.rotation.y=.2;C.add(s)}solid(x,z,.6)}

 /* ===== 광차 기지(남쪽 큰 방) ===== */
 cart(yardW,.86,false);cart(yardW,.56,true,ORE[1]);cart(mainLine,.155,false);cart(yardE,.7,true,ORE[3]);
 /* 광산 사무실 = 게임의 컨테이너 작업장 */
 {const x=-21,z=63;PG('lk_workshop',x,0,z,0,1);for(const [dx,dz] of[[-1.4,-1.2],[0,-1.2],[1.4,-1.2],[-1.4,.9],[0,.9],[1.4,.9]])solid(x+dx,z+dz,1.2);lampPost(x+3.2,z+2.6,-.6);
  RB(1.5,.1,.84,W2,x-4,.84,z+3.4);for(const a of[-1,1])for(const b of[-1,1])RB(.1,.8,.1,WD,x-4+a*.62,.4,z+3.4+b*.3);RB(.4,.32,.28,TEAL,x-3.8,1.05,z+3.35);solid(x-4,z+3.4,.9);
  P(cyl(.24,.22,.48,12),W0,x-4,.24,z+4.5);solid(x-4,z+4.5,.3);
  PG('lk_drum_1',x+3.4,0,z-.6,.3);PG('lk_drum_2',x+3.6,0,z+.4,1.1);solid(x+3.5,z,.9)}
 /* 하역장: 나무 판자 마루 + 게임 화물 팔레트·보급 상자·드럼통 + 노란 기중기 */
 {const x=30,z=68;for(let n=0;n<10;n++)RB(4,.24,.48,[W0,W1,W2][n%3],x,.14,z+n*.54);for(const sd of[-1,1])RB(.24,.18,5.4,WD,x+sd*1.8,.09,z+2.4);
  PG('lk_pallet',x-1,.26,z+.6,.1,1.1);PG('lk_pallet',x+.8,.26,z+1.2,-.2,1);PG('lk_pallet',x-.6,.26,z+4.2,.4,1.1);if(GEO.supcrate){PG('supcrate',x+1,.26,z+4.1,.3)}
  for(const [dx,dz] of[[-1,.8],[.8,1.2],[-.4,4.2],[1,4.1]])solid(x+dx,z+dz,.8);
  const cx=x-2.7,cz=z-1;RB(.7,.5,.7,YEL,cx,.25,cz);P(cyl(.16,.2,4,12),DK,cx,2.2,cz);RB(.26,.26,3.6,YEL,cx,4,cz+1.5,-.12);P(cyl(.03,.03,2,6),DK2,cx,2.9,cz+3);P(new THREE.TorusGeometry(.16,.045,6,12,Math.PI*1.4),DK,cx,1.85,cz+3);solid(cx,cz,.45)}
 for(let n=0;n<6;n++){const y=.26+Math.floor(n/3)*.44,zz=60.5+(n%3)*.48;P(cyl(.24,.24,3.4,12),[W0,W1,W2][n%3],16,y,zz,0,0,Math.PI/2);for(const sd of[-1,1])P(cyl(.2,.2,.03,12),END,16+sd*1.71,y,zz,0,0,Math.PI/2)}solid(16,61,1.9);
 PG('lk_drum_0',14,0,92,.2);PG('lk_drum_3',15.2,0,92.4,1);PG('lk_drum_1',14.5,0,93.5,2);solid(14.6,92.6,1.2);
 lampPost(-8,96,Math.PI*.6);lampPost(8,68,-.6);lampPost(-30,78,.6);lampPost(18,86,-.4);

 /* ===== 화약 창고(남동): 빨간 상자·다이너마이트 묶음·빨간 경고등·모래주머니 ===== */
 {const cx=62,cz=96;
  {const bx=49,bz=90.4;RB(.5,1,.5,DK,bx,.5,bz);solid(bx,bz,.4);for(let k=0;k<5;k++)RB(.16,.18,.9,k%2?CR:RED,bx-.15,1.05+k*.62,bz+.1+k*.42,-.9,0,0);G(new THREE.SphereGeometry(.1,8,6),0xff6a4a,bx,1.12,bz)}
  const tnt=(x,y,z,r)=>{RB(1,.62,.7,RED,x,y+.31,z,0,r,0);RB(1.03,.14,.73,CR,x,y+.36,z,0,r,0);RB(.96,.06,.66,0x8a2f28,x,y+.64,z,0,r,0)};
  for(const [dx,dz,r] of[[4,-5,0],[5.1,-5,0],[7,-3.4,.4],[8,-2,.3],[-2,-6,-.2],[-.9,-6.1,-.1]])tnt(cx+dx,0,cz+dz,r);tnt(cx+4.55,.62,cz-5,.05);tnt(cx+7.5,.62,cz-2.7,.35);
  for(const [dx,dz] of[[4.5,-5],[7.4,-2.7],[-1.5,-6]])solid(cx+dx,cz+dz,1.2);
  /* 다이너마이트 묶음(빨간 막대 셋 + 크림 띠 + 심지) */
  for(const [dx,dz] of[[1,-6],[2.6,-5.6]]){for(let k=0;k<3;k++)P(cyl(.1,.1,.62,10),RED,cx+dx+(k-1)*.2,.31,cz+dz);P(cyl(.33,.33,.08,12),CR,cx+dx,.38,cz+dz,0,0,0,1,1,.5);P(cyl(.015,.015,.4,4),DK2,cx+dx,.75,cz+dz,.4)}
  RB(.62,.46,.46,WD,cx-4,.23,cz+2);P(cyl(.04,.04,.6,6),DK,cx-4,.75,cz+2);RB(.5,.07,.07,RED,cx-4,1.05,cz+2);solid(cx-4,cz+2,.45);
  for(const [dx,dz] of[[-6,-4],[9,1]]){P(cyl(.06,.08,2.2,8),DK,cx+dx,1.1,cz+dz);P(new THREE.SphereGeometry(.21,16,8,0,Math.PI*2,0,Math.PI/2),DK,cx+dx,2.3,cz+dz,0,0,0,1,.72,1);G(new THREE.SphereGeometry(.15,12,8),0xff6a4a,cx+dx,2.25,cz+dz,0,0,0,1,.6,1);halo(0xff5a3a,2.4,.5,cx+dx,2.25,cz+dz);m74light(cx+dx,cz+dz,2.2,8,0xff6a4a,.9);solid(cx+dx,cz+dz,.2)}
  P(cyl(.04,.04,2.4,6),WD,cx+10,1.2,cz-3);RB(.04,.6,.9,RED,cx+10,2.1,cz-2.55);solid(cx+10,cz-3,.2);
  if(GEO.sandbag)for(const [dx,dz,r] of[[-7,3,1.2],[-8,0.5,1.5]]){P(GEO.sandbag,null,cx+dx,0,cz+dz,0,r,0);solid(cx+dx,cz+dz,1)}
  if(typeof plBoardGeo==='function'){add(chunks,pt(plBoardGeo(1.8,.56),null,[cx-5,0,cz+5.5],[0,0,0],[.8,.8,.8]),cx-5,cz+5.5);if(typeof plSignText==='function'){const s=plSignText('⚠ 화약',1.3,.32,70);s.position.set(cx-5,1.06,cz+5.6);C.add(s)}solid(cx-5,cz+5.5,.5)}}

 /* ===== 무너진 옛 갱도(남서): 쓰러진 갱목 + 바깥과 같은 회색 바위 더미 ===== */
 {const cx=-62,cz=94;
  P(cyl(.22,.26,3.4,12),W1,cx-6,1.5,cz-3,0,0,.35);P(cyl(.22,.26,3.4,12),W0,cx-6,1.4,cz+3.5,0,0,-.5);P(cyl(.24,.24,6.6,12),W2,cx-6.6,.3,cz+.4,.1,.3,Math.PI/2);
  solid(cx-6.3,cz-3,.4);solid(cx-6.3,cz+3.4,.4);solid(cx-6.6,cz+.4,.6);
  for(let n=0;n<16;n++){const a=hash(n,1,61)*6.28,r=hash(n,2,61)*3.4,x=-104+Math.cos(a)*r,z=99+Math.sin(a)*r*.8,s=.6+hash(n,3,61)*1.1;boulder(s,x,z,n,.8);if(s>.9)solid(x,z,s*.9)}
  for(let k=0;k<3;k++)RB(.16,.18,4.8,k%2?DK:YEL,-96+k*1.1,1+k*.25,98.6+k*.4,0,.4+k*.5,.6-k*.5);
  {const g=mg([pt(lkRb(1.5,.84,2.3,.14,.05),TEAL,[0,.55,0]),pt(lkRb(1.62,.14,2.42,.06,.03),CR,[0,1.0,0])]);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0,.6,1.35)).setPosition(cx+4,.75,cz-4));add(chunks,g,cx+4,cz-4);solid(cx+4,cz-4,1.3)}
  for(const sd of[-1,1])RB(.12,.12,5,DK,cx+sd*.75+2,.08,cz+3,0,.2,0);
  PG('lk_drum_3',cx-2,0,cz+5,0,1);solid(cx-2,cz+5,.5);lampPost(cx+1,cz-1.5,.4,2.1,0xffcf8a);}

 /* ===== 펌프실: 청록 펌프 + 크림 띠 관 + 웅덩이 둘레 바위 ===== */
 {const cx=-102,cz=62,px=cx+5.5,pz=cz-4.5;
  RB(2,1.3,1.4,TEAL,px,.7,pz,0,0,0,.2,.05);RB(2.1,.14,1.5,CR,px,1.36,pz);P(cyl(.5,.5,1.5,16),TEAL2,px-.2,1.25,pz,Math.PI/2,0,Math.PI/2);P(new THREE.TorusGeometry(.6,.09,8,18),RED,px+1.2,1.25,pz,0,Math.PI/2,0);
  P(cyl(.24,.24,6,12),TEAL,px-3.5,.9,pz+.8,0,.7,Math.PI/2);for(const k of[-2,0,2])P(cyl(.3,.3,.14,12),CR,px-3.5+k*.75,.9,pz+.8-k*.65,0,.7,Math.PI/2);
  P(cyl(.24,.24,3,12),TEAL,px+.5,2.1,pz-1);P(cyl(.24,.24,4,12),TEAL,px+.5,3.6,pz+1,Math.PI/2,0,0);
  solid(px,pz,1.3);solid(px-2.4,pz+1.7,.5);lampPost(px-1.4,pz+2.2,.8,2.1,0xcff0ff);
  for(let n=0;n<9;n++){const a=n/9*6.28+.3;boulder(.55+hash(n,1,4)*.3,cx-2+Math.cos(a)*7.6,cz+2+Math.sin(a)*5.4,n+30,.6)}}

 /* ===== 중앙 수직갱 광장 ===== */
 {const sx=-6,sz=8;
  /* 수직갱 구멍(못 들어감) + 콘크리트 테 + 노란 난간 */
  P(box(4.6,.1,4.6),0x1a1a20,sx,.02,sz);for(const [w,d,x,z] of[[5.6,.6,0,2.6],[5.6,.6,0,-2.6],[.6,4.6,2.6,0],[.6,4.6,-2.6,0]])RB(w,.3,d,CONC,sx+x,.15,sz+z);
  for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(cyl(.06,.06,1.1,8),YEL,sx+a*2.95,.55,sz+b*2.95);for(const sd of[-1,1]){RB(5.9,.09,.09,YEL,sx,1.05,sz+sd*2.95);RB(.09,.09,5.9,YEL,sx+sd*2.95,1.05,sz)}
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)solid(sx+i*1.6,sz+j*1.6,1.35);
  /* 권양탑: 둥근 나무 기둥 넷 + 크림 갓 + 빨간 도르래 */
  const H=8;for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]]){P(cyl(.22,.28,H,12),a<0?W1:W0,sx+a*2.75,H/2,sz+b*2.75);P(cyl(.3,.32,.24,12),CONC,sx+a*2.75,.12,sz+b*2.75);solid(sx+a*2.75,sz+b*2.75,.36)}
  for(const y of[2.7,5.3,7.7]){for(const sd of[-1,1]){RB(5.8,.3,.3,W2,sx,y,sz+sd*2.75);RB(.3,.3,5.8,W2,sx+sd*2.75,y,sz)}}
  RB(2,.34,2,DK,sx,H+.1,sz);P(new THREE.TorusGeometry(1.1,.14,8,22),RED,sx,H+.75,sz,0,Math.PI/2,0);P(cyl(.12,.12,.5,10),CR,sx,H+.75,sz,0,0,Math.PI/2);for(let k=0;k<4;k++)RB(.08,2.1,.08,0xb8443a,sx,H+.75,sz,k*Math.PI/4,0,0);
  P(cyl(.03,.03,5.4,5),DK2,sx,H-2.7,sz);
  {const cy=1.2;RB(2.2,.18,2.2,TEAL2,sx,cy,sz);RB(2.3,.16,2.3,CR,sx,cy+2.2,sz);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(cyl(.06,.06,2.2,8),TEAL,sx+a*1.02,cy+1.1,sz+b*1.02);for(let k=-2;k<=2;k++){P(cyl(.025,.025,2.1,6),CR,sx+k*.36,cy+1.1,sz-1.02);P(cyl(.025,.025,2.1,6),CR,sx-1.02,cy+1.1,sz+k*.36)}}
  /* 빛 기둥(위에서 내려오는 바깥 빛) + 떠다니는 먼지 */
  {const cv=document.createElement('canvas');cv.width=4;cv.height=128;const k=cv.getContext('2d'),gr=k.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,250,232,.0)');gr.addColorStop(.25,'rgba(255,250,232,.5)');gr.addColorStop(1,'rgba(255,250,232,.1)');k.fillStyle=gr;k.fillRect(0,0,4,128);
   const g=new THREE.CylinderGeometry(2.6,4.4,15,24,1,true),m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:.36,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
   m.position.set(sx+1.2,7.5,sz+1.5);m.rotation.set(.08,0,-.08);C.add(m);M74.shaft=m;m74light(sx+1.5,sz+1.8,6,16,0xfff4dc,1);halo(0xfff8e4,9,.28,sx+1.4,.6,sz+2);
   for(let i=0;i<14;i++){const d=glow(0xfff6e0,.24,.65);d.position.set(sx+1.2+(hash(i,1,3)-.5)*5,1+hash(i,2,3)*9,sz+1.5+(hash(i,3,3)-.5)*5);d.userData.b=d.position.clone();d.userData.k=hash(i,4,3)*6.28;C.add(d);M74.anim.dust.push(d)}}
  /* 권양기 집: 크림 벽 + 청록 지붕(보급 창고 색) + 빨간 드럼 */
  {const hx=sx+11,hz=sz-6;RB(4.2,.24,3.2,CONC,hx,.12,hz);RB(3.8,2.3,2.8,CR,hx,1.4,hz,0,0,0,.12,.05);RB(4.3,.18,3.3,TEAL,hx,2.75,hz,0,0,0,.08,.04);RB(4.5,.12,.24,TEAL2,hx,2.9,hz+1.55);
   RB(1.6,1.6,.1,DK,hx-.6,1.0,hz+1.42);P(cyl(.62,.62,1.2,16),RED,hx-.6,.9,hz+1.48,0,0,Math.PI/2);for(const sd of[-1,1])P(cyl(.66,.66,.08,16),CR,hx-.6+sd*.62,.9,hz+1.48,0,0,Math.PI/2);
   RB(.9,.6,.08,0xffe2a0,hx+1.1,1.6,hz+1.43);
   for(const [a,b] of[[-1.4,-.9],[0,-.9],[1.4,-.9],[-1.4,.9],[0,.9],[1.4,.9]])solid(hx+a,hz+b,.95);lampPost(hx-2.5,hz+2.2,-.3)}
  /* 선별기: 노란 깔때기 + 짙은 컨베이어 + 광석 더미 */
  {const hx=sx-16,hz=sz+16;P(cyl(1.5,.5,1.6,12),YEL,hx,2.6,hz);P(cyl(1.52,1.52,.14,12),CR,hx,3.42,hz);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(cyl(.1,.1,2.2,8),DK,hx+a*.95,1.1,hz+b*.95);
   RB(1.1,.2,7,DK,hx+4,1.6,hz,0,0,-.3);for(let k=0;k<11;k++)RB(.96,.07,.42,DK2,hx+4,1.73,hz-3+k*.6,0,0,-.3);for(const z of[-3,0,3])for(const sd of[-1,1])P(cyl(.07,.07,1.6,6),DK,hx+4+sd*.42,.8,hz+z);
   for(let n=0;n<7;n++)boulder(.32+hash(n,1,5)*.18,hx+(hash(n,2,5)-.5)*2,hz+2.4+hash(n,3,5),n+40,.7,ORE[n%4]);
   solid(hx,hz,1.6);for(const z of[-2.5,0,2.5])solid(hx+4,hz+z,.8);solid(hx,hz+2.6,1.1);lampPost(hx-2.4,hz+3.4,.3)}
  /* 자연 암주 셋(바깥 바위와 같은 둥근 회색) */
  for(const [x,z,r] of[[-36,-2,2.4],[24,-14,2.3],[-16,-24,2]]){for(let k=0;k<4;k++)add(chunks,lkBoulder(r*(1-k*.15),ST[k%4],k*3+x,[x+(hash(k,1,x)-.5)*.5,k*1.25,z+(hash(k,2,x)-.5)*.5],1.1),x,z);solid(x,z,r+.2)}
  lampPost(-8,32,.4);lampPost(16,-10,0);lampPost(-30,6,1.2);lampPost(28,30,-.6);lampPost(-36,-12,1)}

 /* ===== 광부 야영지: 게임 노란 텐트 둘 + 게임 모닥불 + 통나무 의자 ===== */
 {const cx=-84,cz=20,fx=cx+2,fz=cz+2;
  PG('lk_fire',fx,0,fz,.3,1);for(let k=0;k<3;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(.3-k*.07,.75+k*.2,8),new THREE.MeshBasicMaterial({color:[0xff8a3a,0xffb347,0xffe07a][k]}));f.position.set(fx,.5+k*.1,fz);C.add(f);M74.anim.fire.push(f)}
  const fh=halo(0xffa24a,5,.5,fx,1,fz);M74.anim.fire.push(fh);m74light(fx,fz,1.2,14,0xffb060,1.2);solid(fx,fz,1.2);
  for(const a of[.4,2.3,4.2]){const x=fx+Math.cos(a)*2.7,z=fz+Math.sin(a)*2.7,ry=-a+Math.PI/2;P(cyl(.27,.27,1.8,12),[W0,W1,W2][Math.round(a)%3],x,.27,z,0,ry,Math.PI/2);for(const sd of[-1,1])P(cyl(.22,.22,.03,12),END,x+Math.cos(ry)*sd*.91,.27,z-Math.sin(ry)*sd*.91,0,ry,Math.PI/2);solid(x,z,.75)}
  for(let k=0;k<3;k++){const a=k*2.09;P(cyl(.04,.04,1.8,6),WD,fx+Math.cos(a)*.45,.85,fz+Math.sin(a)*.45,Math.sin(a)*.25,0,-Math.cos(a)*.25)}P(new THREE.SphereGeometry(.3,12,8,0,6.28,Math.PI*.35,Math.PI*.65),DK,fx,1.05,fz);
  for(const [x,z,r] of[[cx-7,cz-6,.5],[cx-1,cz-9,-.2]]){PG('mtent',x,0,z,r,1.15);solid(x,z,1.4);solid(x+Math.sin(r)*1.2,z+Math.cos(r)*1.2,1.1);solid(x-Math.sin(r)*1.2,z-Math.cos(r)*1.2,1.1)}
  {const x=cx+9,z=cz-4;RB(1.8,.12,1,W2,x,.84,z);for(const a of[-1,1])for(const b of[-1,1])RB(.1,.8,.1,WD,x+a*.76,.4,z+b*.38);for(const a of[-1,1])RB(1.8,.1,.34,W0,x,.48,z+a*.8);
   RB(.3,.012,.2,CR,x-.3,.91,z+.1,0,.4,0);RB(.3,.012,.2,RED,x+.2,.91,z-.15,0,-.3,0);lampHead(x+.6,1.15,z,0xffe2a0,8,.8);solid(x,z,1.1);solid(x,z+.85,.5);solid(x,z-.85,.5)}
  {const a=[cx-12,cz+6],b=[cx-12,cz+11];for(const p of[a,b]){P(cyl(.1,.12,2.2,10),W1,p[0],1.1,p[1]);P(cyl(.13,.13,.06,10),END,p[0],2.22,p[1]);solid(p[0],p[1],.25)}
   const hm=new THREE.CatmullRomCurve3([new THREE.Vector3(a[0],1.6,a[1]),new THREE.Vector3(a[0],1.0,(a[1]+b[1])/2),new THREE.Vector3(b[0],1.6,b[1])]);P(new THREE.TubeGeometry(hm,12,.22,8,false),RED,0,0,0);P(new THREE.TubeGeometry(hm,12,.225,8,false),CR,0,.04,0,0,0,0,1,1,1)}
  {const a=[cx+5,cz+9],b=[cx+11,cz+8];for(const p of[a,b]){P(cyl(.06,.07,2,8),W1,p[0],1,p[1]);solid(p[0],p[1],.2)}P(cyl(.015,.015,6.1,4),CR,(a[0]+b[0])/2,1.85,(a[1]+b[1])/2,0,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),Math.PI/2);
   for(let k=0;k<4;k++){const t=.2+k*.2,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;RB(.5,.62,.03,[RED,TEAL,CR,YEL][k],x,1.5,z,0,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),0)}}
  PG('lk_drum_2',cx+12,0,cz+2,.4);solid(cx+12,cz+2,.5);PG('lk_pallet',cx-14,0,cz-2.4,.3,1.1);solid(cx-14,cz-2.4,.8);
  for(let n=0;n<8;n++){const y=.15+Math.floor(n/4)*.28,xx=cx+6+(n%4)*.3;P(cyl(.14,.14,1.2,10),[W0,W1,W2][n%3],xx,y,cz-11,0,0,Math.PI/2)}solid(cx+6.5,cz-11,.9);
  lampPost(cx+14,cz+8,-.6);lampPost(cx-16,cz+4,1.2)}

 /* ===== 지하 호수: 나무 선착장 + 게임 노 젓는 배 + 둥근 회색 석순 ===== */
 {const L=M74.lakes[0],dx=L[0]+16,dz=L[1]+12;
  for(let n=0;n<6;n++)RB(2,.14,.46,[W0,W1,W2][n%3],dx-n*.3,.12,dz-n*.42,0,.6,0);for(const sd of[-1,1])P(cyl(.12,.12,1.2,8),WD,dx+sd*.9-1,-.2,dz-2.2);
  PG('rowboat',dx-3.4,-.05,dz-4.4,.9,1);
  for(let n=0;n<30;n++){const a=n/30*6.28+hash(n,1,9)*.2,rr=1.08+hash(n,2,9)*.22,lx=Math.cos(a)*L[2]*rr,lz=Math.sin(a)*L[3]*rr,x=L[0]+lx*L.c-lz*L.s,z=L[1]+lx*L.s+lz*L.c;if(!free(x,z,.7,0))continue;
   const r=.45+hash(n,3,9)*.4;boulder(r,x,z,n+60,1.6+hash(n,4,9)*1.6);solid(x,z,r*1.1)}
  for(let n=0;n<6;n++){const a=n/6*6.28,x=L[0]+Math.cos(a)*L[2]*.6,z=L[1]+Math.sin(a)*L[3]*.6;m74light(x,z,-.2,9,0x7fd4f0,.45)}
  lampPost(L[0]+20,L[1]+16,-.8);lampPost(L[0]-14,L[1]+22,.4)}

 /* ===== 수정 동굴: 파스텔 수정(청록·연보라·분홍) + 회색 바위 받침 ===== */
 const CRY=[0x8fe8ee,0xc6adff,0xffadd6];
 function crystals(x,z,s,ci){const col=CRY[ci],n=4+((hash(x|0,z|0,3)*3)|0);for(let k=0;k<n;k++){const a=k/n*6.28+hash(k,x|0,5),r=k?.38*s:0,h=s*(1.5+hash(k,1,z|0)*1.4)*(k?.7:1.15),tilt=k?.45:.06,w=.24*s*(k?.8:1.15);
   const g=mg([pt(cyl(w,w,h*.78,6),col,[0,h*.39,0]),pt(new THREE.ConeGeometry(w,h*.3,6),col,[0,h*.78+h*.15,0])]);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.cos(a)*tilt,a,Math.sin(a)*tilt)).setPosition(x+Math.cos(a)*r,0,z+Math.sin(a)*r));add(glowCh,g,x,z)}
  boulder(.75*s,x,z,(x*3|0),.5);halo(col,3.2*s,.42,x,s*1.1,z);m74light(x,z,s*1.2,8*s,col,.8);solid(x,z,.75*s)}
 {const H=M74.halls[10];for(const [x,z,s,c] of[[-14,-82,2.4,1],[-24,-86,1.5,0],[-4,-74,1.3,2],[-30,-72,1.2,2],[6,-88,1.5,1],[12,-96,1.2,0],[-12,-94,1.1,2],[-38,-82,1.3,1],[2,-68,.9,0],[-24,-64,.8,2],[18,-86,1,2],[-2,-86,.9,0],[-28,-94,1,1],[-42,-74,.9,0],[8,-78,.8,1],[-20,-74,.7,0]])if(free(x,z,.9*s,0))crystals(x,z,s,c);
  for(let n=0;n<110;n++){const a=hash(n,1,17)*6.28,r=hash(n,2,17),x=H[0]+Math.cos(a)*H[2]*1.05*Math.sqrt(r+.5),z=H[1]+Math.sin(a)*H[3]*1.05*Math.sqrt(r+.5);const w=m74wAt(x,z);if(w>.4||w<-1.4)continue;
   const c=CRY[n%3],h=.8+hash(n,3,17)*1.8;G(cyl(.18,.2,h*.8,6),c,x,h*.4+.2,z,(hash(n,4,17)-.5)*.8,n,(hash(n,5,17)-.5)*.8);if(n%5===0)m74light(x,z,1,5,c,.6)}}

 /* ===== 버섯 숲: 게임 식물 버섯(18차 모양)을 크게 + 빛 + 이끼 둔덕 ===== */
 const MK=['pw_mush','pw_mush_poison','pw_mush_censer'],MC=[0xffd9a0,0xff8a7a,0xffc46a];
 function mushroom(x,z,s,ci){const k=MK[ci],sc=ci===2?s*2.1:s*(ci===1?3.2:4.4);PG(k,x,0,z,hash(x|0,z|0,2)*6,sc);const top=(ci===2?1.4:ci===1?.71:.45)*sc;
  const h=halo(MC[ci],3.2*s,.36,x,top*.8,z);M74.anim.mush.push(h);m74light(x,z,top,7*s,MC[ci],.75);solid(x,z,.22*sc*(ci===2?.8:1)+.1)}
 {const H=M74.halls[12];for(const [x,z,s,c] of[[54,-76,1.6,0],[66,-64,1.3,1],[74,-80,1.5,2],[60,-88,1.1,1],[82,-66,1.2,0],[48,-66,1,2],[70,-72,.8,0],[88,-80,.9,1],[56,-58,.9,0]])if(free(x,z,.6*s,0))mushroom(x,z,s,c);
  for(let n=0;n<40;n++){if(n%2)continue;const a=hash(n,1,23)*6.28,r=Math.sqrt(hash(n,2,23)),x=H[0]+Math.cos(a)*H[2]*.95*r,z=H[1]+Math.sin(a)*H[3]*.95*r;if(!free(x,z,.35,0))continue;PG(MK[n%2],x,0,z,n,1.2+hash(n,3,23)*.9)}
  for(let n=0;n<8;n++){const a=n*.79,x=H[0]+Math.cos(a)*14,z=H[1]+Math.sin(a)*9;m74light(x,z,.3,7,0xa8e88a,.35)}}

 /* ===== 채굴장: 벽 광맥(광석 4색) + 노란 드릴 + 청록 분쇄기 + 광석 더미 + 비계 ===== */
 {const H=M74.halls[13];
  for(let n=0;n<80;n++){const a=hash(n,1,29)*6.28,x=H[0]+Math.cos(a)*H[2]*1.02,z=H[1]+Math.sin(a)*H[3]*1.02;const w=m74wAt(x,z);if(w>.6||w<-1.6)continue;const s=.32+hash(n,3,29)*.45;
   P(lump,ORE[n%4],x,.5+hash(n,4,29)*1.6,z,n,n*.7,0,s,s*.85,s);if(n%4===0)G(new THREE.OctahedronGeometry(s*.35,0),n%8?0xfff0a8:0xd8fff4,x,.7+hash(n,5,29)*1.4,z,n,0,0)}
  for(const [x,z,dx,dz] of[[124,-56,0,-1],[142,10,1,0]]){for(let k=0;k<9;k++)P(lump,ORE[k%4],x+dx*1.6+(hash(k,1,x)-.5)*3,.5+hash(k,2,x)*1.8,z+dz*1.6+(hash(k,3,x)-.5)*3,k,k,0,.55,.48,.55);lampHead(x-dx*2+dz*1.6,2.3,z-dz*2+dx*1.6,0xfff0c0,8,.9)}
  {const x=106,z=-12,r=-.7,p=[];p.push(pt(lkRb(2.6,1.2,1.8,.22,.05),YEL,[0,1,0]),pt(lkRb(1.2,.9,1.3,.14,.04),DK,[-.6,1.9,0]),pt(lkRb(.9,.5,.08,.04,.02),0xbfe8f2,[-.6,2,.66]),pt(lkRb(2.7,.14,1.9,.06,.03),CR,[0,1.62,0]));
   for(const e of[-1,1])for(const sd of[-1,1])p.push(pt(cyl(.42,.42,.3,14),DK2,[e*.9,.42,sd*1],[Math.PI/2,0,0]),pt(cyl(.2,.2,.32,10),CONC,[e*.9,.42,sd*1],[Math.PI/2,0,0]));
   p.push(pt(lkRb(.32,.32,3,.08,.03),DK,[.9,1.6,1.2],[-.25,0,0]),pt(cyl(.17,.06,1.4,10),CONC,[.9,1.1,2.8],[Math.PI/2+.25,0,0]),pt(lkRb(.52,.52,.52,.08,.03),RED,[.9,1.25,2.2]));
   const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(r).setPosition(x,0,z));add(chunks,g,x,z);solid(x,z,1.7);solid(x+Math.sin(r)*1.8+Math.cos(r)*.9,z+Math.cos(r)*1.8-Math.sin(r)*.9,.7)}
  {const x=82,z=-8;RB(2.6,1.8,2.2,TEAL,x,.9,z,0,0,0,.2,.05);RB(2.7,.16,2.3,CR,x,1.82,z);P(cyl(1.3,.5,1.2,8),DK,x,2.5,z,0,Math.PI/8,0);P(cyl(.5,.5,2.4,14),DK2,x,.9,z+1.25,0,0,Math.PI/2);for(let k=0;k<6;k++)RB(.4,.08,.08,YEL,x-1+k*.4,1.6,z+1.12,0,0,k%2?.7:-.7);
   for(let k=0;k<6;k++)boulder(.28,x+(hash(k,1,8)-.5)*1.6,z+2.3+hash(k,2,8)*.7,k+70,.7,ORE[k%4]);solid(x,z,1.7);lampPost(x-2,z+2.2,.3)}
  for(const [x,z,o] of[[86,-10,0],[100,12,1],[80,16,2],[110,2,3]]){for(let k=0;k<8;k++)boulder(.36+hash(k,4,x)*.2,x+(hash(k,1,x)-.5)*2.2,z+(hash(k,3,x)-.5)*1.8,k+o*10,.75,ORE[o]);solid(x,z,1.4)}
  for(const [x,z] of[[102,14],[103,15.2],[101.6,15.6],[104.2,14.4]]){P(new THREE.IcosahedronGeometry(.5,1),0xe2cfa0,x,.42,z,0,x,0,1,.85,.9);P(cyl(.14,.2,.18,8),0xc9b07c,x,.86,z)}solid(103,15,1.4);
  {const x=92,z=14,p=[pt(lkRb(1,.5,1.4,.1,.04),RED,[0,.75,0],[.1,0,0]),pt(cyl(.3,.3,.14,14),DK2,[0,.32,.85],[0,0,Math.PI/2])];for(const sd of[-1,1])p.push(pt(lkRb(.07,.07,1.6,.02,.01),W1,[sd*.38,.7,-.6],[-.15,0,0]),pt(cyl(.03,.03,.5,6),DK,[sd*.38,.3,-.4]));const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(.6).setPosition(x,0,z));add(chunks,g,x,z);solid(x,z,.8)}
  for(const [x,z,r] of[[96,-14,.3],[84,8,-.5]])if(GEO.lk_pick_adv)add(chunks,pt(GEO.lk_pick_adv,null,[x,.36,z],[0,r,.35],[1.1,1.1,1.1]),x,z);
  for(const [x,z,a] of[[98,-20,.6],[78,-4,-.8],[112,10,2.4],[88,22,-2.2]])lampPost(x,z,a);
  {const x0=78,z0=-20;for(let k=0;k<4;k++){const x=x0+k*2.2;P(cyl(.06,.06,3,8),DK,x,1.5,z0);P(cyl(.06,.06,3,8),DK,x,1.5,z0-1.2);solid(x,z0,.2);solid(x,z0-1.2,.2)}for(const y of[1.4,2.8])for(let n=0;n<3;n++)RB(6.8,.1,.4,[W0,W1,W2][n],x0+3.3,y,z0-.2-n*.42);RB(6.8,.07,.07,YEL,x0+3.3,3.2,z0)}
  cart(digSpur,.55,true,ORE[1]);cart(mainLine,.93,true,ORE[3])}

 /* ===== 갈림길 표지판(나무 기둥 + 색 화살표: 노랑 = 입구 쪽) ===== */
 const signpost=(x,z,arms)=>{P(cyl(.08,.1,2.2,8),W1,x,1.1,z);P(cyl(.11,.11,.06,8),END,x,2.22,z);arms.forEach(([a,c],n)=>{const g=mg([pt(lkRb(1.1,.26,.08,.05,.02),c,[.45,0,0]),pt(new THREE.ConeGeometry(.18,.32,3),c,[1.06,0,0],[0,0,-Math.PI/2])]);g.applyMatrix4(new THREE.Matrix4().makeRotationY(a).setPosition(x,1.9-n*.34,z));add(chunks,g,x,z)});solid(x,z,.2)};
 signpost(-6,46,[[-Math.PI/2,YEL],[Math.PI*.62,TEAL],[Math.PI*.12,0x6aae4c]]);signpost(-38,8,[[0,YEL],[Math.PI,0xe0a050]]);signpost(52,12,[[Math.PI,YEL],[0,0x6aae4c]]);

 /* ===== 방마다 바닥 꾸밈(게임 모델): 회색 바위·드럼통·화물 팔레트·보급 상자·물웅덩이·이끼 둔덕·작은 수정 ===== */
 const puddle=(x,z,s)=>{P(new THREE.CircleGeometry(1,16),0x6cc2dc,x,.025,z,-Math.PI/2,0,0,s*1.4,s,1);P(new THREE.RingGeometry(.86,1,16),0xd6f2f8,x,.03,z,-Math.PI/2,0,0,s*1.4,s,1)};
 const moss=(x,z,s)=>{for(const [ox,oz,r] of[[0,0,1],[.5,-.3,.65],[-.45,.25,.55]])add(chunks,lkShade(pt(new THREE.SphereGeometry(1,10,6,0,6.28,0,Math.PI/2),[0x5f9f45,0x6bab4c,0x55933e][(r*10|0)%3],[x+ox*s,0,z+oz*s],[0,0,0],[s*r*.9,s*r*.42,s*r*.8]),.8,1.1),x,z)};
 M74.halls.forEach((h,hi)=>{const th=h[5],n=Math.round(h[2]*h[3]*Math.PI/280);let put=0;for(let q=0;q<n*4&&put<n;q++){const a=hash(hi,q,91)*6.28,r=Math.sqrt(hash(hi,q,93))*.88,lx=Math.cos(a)*h[2]*r,lz=Math.sin(a)*h[3]*r,x=h[0]+lx*h.c-lz*h.s,z=h[1]+lx*h.s+lz*h.c,k=hash(hi,q,97);
  if(!free(x,z,1.3,2.6))continue;put++;
  if(th===6){k<.4?puddle(x,z,.8+k):(rockPile(x,z,.9+k*.6,3,q+hi*7,1.2),solid(x,z,1))}
  else if(th===7){k<.25?(rockPile(x,z,.8+k,3,q+hi*7,1.4),solid(x,z,.9)):k<.75?crystals(x,z,.45+k*.4,q%3):(rockPile(x,z,.6+k*.4,3,q+hi*7),solid(x,z,.7))}
  else if(th===8){k<.5?moss(x,z,.8+k*1.2):k<.7?puddle(x,z,.7+k*.6):(rockPile(x,z,.6+k*.5,3,q+hi*7),solid(x,z,.7))}
  else{if(k<.16)puddle(x,z,.7+k*2);else if(k<.4){rockPile(x,z,.6+k,3,q+hi*7);solid(x,z,.75+k*.4)}else if(k<.56){PG('lk_drum_'+(q%4),x,0,z,k*9);solid(x,z,.5)}else if(k<.72){PG('lk_pallet',x,0,z,k*7,1.1);solid(x,z,.8)}else if(k<.84&&GEO.supcrate){PG('supcrate',x,0,z,k*5);solid(x,z,.6)}}}});
 /* ===== 벽가 바위(바깥과 같은 둥근 회색) ===== */
 for(const [hi,h] of M74.halls.entries()){for(let n=0;n<20;n++){const a=hash(hi,n,41)*6.28,r=.75+.3*hash(hi,n,43),x=h[0]+h[2]*r*Math.cos(a),z=h[1]+h[3]*r*Math.sin(a);const w=m74wAt(x,z);if(w<.2||w>2.2||railNear(x,z,2))continue;
   boulder(.3+.45*hash(hi,n,47),x,z,n+hi*3,.75)}}
 /* ===== 덩어리 합치기 + 빛 굽기(게임 재질과 같은 램버트) ===== */
 const mat=m74mat({}),gmat=new THREE.MeshBasicMaterial({vertexColors:true});
 for(const parts of chunks.values()){const g=mg(parts);m74bake(g,0);C.add(new THREE.Mesh(g,mat))}
 for(const parts of glowCh.values()){const g=mg(parts);C.add(new THREE.Mesh(g,gmat))}
 m74terrain(C);
 M74.built=performance.now()-t0;
}
/* 아무 점의 걷기 값(보간) — 소품 자리 고르기용 */
function m74wAt(x,z){if(!M74.W)m74sample();const c=M74.c,u=x/c,v=z/c,i=Math.floor(u),j=Math.floor(v);if(i<M74.I0||i>=M74.I1||j<M74.J0||j>=M74.J1)return-9;const W=M74.W,dx=u-i,dz=v-j,a=W[m74idx(i,j)],cc=W[m74idx(i+1,j+1)];
 return dx<dz?a*(1-dz)+W[m74idx(i,j+1)]*(dz-dx)+cc*dx:a*(1-dx)+W[m74idx(i+1,j)]*(dx-dz)+cc*dz}
caveRoom=caveRoom74;
/* 빛: 동굴 안은 어둡게, 캐릭터 둘레는 따뜻한 손전등 빛 */
{const _il=intLight;intLight=function(dk){_il(dk);if(INT.kind==='cave'&&INT.on){hemi.intensity=.42;hemi.color.setRGB(.88,.9,1);hemi.groundColor.setRGB(.46,.4,.36);sun.intensity=.48;sun.color.setRGB(1,.96,.9);
  INT.L.color.setHex(0xffe6c4);INT.L.distance=10;INT.L.intensity=.55;INT.L.position.set(P.x-INT.x,2.6,P.z-INT.z+.6);scene.background.setRGB(.1,.095,.115)}}}
/* 움직임: 모닥불 깜박임, 빛 기둥 먼지, 버섯 빛 숨쉬기 */
{const _iu=intUpd;intUpd=function(){_iu();if(!INT.on||INT.kind!=='cave')return;const t=performance.now()/1000;
 M74.anim.fire.forEach((f,i)=>{if(f.isSprite)f.material.opacity=.45+.12*Math.sin(t*9.3)+.06*Math.sin(t*23);else{f.scale.y=1+.18*Math.sin(t*(8+i*3)+i);f.scale.x=f.scale.z=1+.06*Math.sin(t*11+i)}});
 M74.anim.dust.forEach(d=>{const b=d.userData.b,k=d.userData.k;d.position.set(b.x+Math.sin(t*.3+k)*.6,b.y+((t*.25+k)%3)-1.5,b.z+Math.cos(t*.27+k)*.6)});
 M74.anim.mush.forEach((h,i)=>{h.material.opacity=.3+.12*Math.sin(t*1.3+i*1.7)});if(M74.shaft)M74.shaft.material.opacity=.38+.05*Math.sin(t*.7)}}
