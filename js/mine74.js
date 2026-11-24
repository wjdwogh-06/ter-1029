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
 tun:[{w:4.2,p:[[0,132],[0,96]]},{w:3.6,p:[[24,86],[46,93]]},{w:3.5,p:[[-24,86],[-44,91]]},{w:3.4,p:[[-72,90],[-92,72]]},
  {w:3.4,p:[[-100,52],[-92,40]]},{w:4.6,p:[[0,60],[0,40]]},{w:4,p:[[-42,14],[-56,18]]},{w:4,p:[[-84,0],[-88,-14],[-90,-34]]},
  {w:4,p:[[-58,-66],[-46,-74]]},{w:4.2,p:[[-6,-22],[-8,-40],[-12,-58]]},{w:3.8,p:[[18,-80],[34,-76]]},{w:4,p:[[78,-52],[86,-26]]},
  {w:4.6,p:[[46,8],[60,4]]},{w:3.4,p:[[92,28],[86,56],[72,86]]},{w:2.8,p:[[112,-26],[122,-44],[124,-56]]},{w:2.8,p:[[126,6],[142,10]]},
  {w:3,p:[[-78,96],[-100,100],[-112,98]]}],
 /* 테마 색: 바닥, 바위 */
 thF:[0x7a6450,0x765a4a,0x67605a,0x56676c,0x7a6a58,0x7c6249,0x5a6c78,0x665c80,0x557056,0x846a4e],
 thR:[0x66606c,0x6a5862,0x5e5a64,0x52606c,0x66616e,0x6a5c62,0x4c6078,0x58507c,0x4c6458,0x6e5e52],
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
 for(const t of M74.tun)for(let i=1;i<t.p.length;i++)ft=m74smax(ft,t.w-m74seg(x,z,t.p[i-1],t.p[i]),3);
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
  e[i*3]=C.getX(i)*(o[0]+a);e[i*3+1]=C.getY(i)*(o[1]+a);e[i*3+2]=C.getZ(i)*(o[2]+a)}g.setAttribute('aEm',new THREE.BufferAttribute(e,3));return g}

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
 const thF=M74.thF.map(h=>new THREE.Color(h).convertSRGBToLinear()),thR=M74.thR.map(h=>new THREE.Color(h).convertSRGBToLinear()),TOP=new THREE.Color(0x24212c).convertSRGBToLinear(),RIM=new THREE.Color(0x6e6878).convertSRGBToLinear();
 const tmp=[0,0,0],col=new THREE.Color();
 /* 꼭짓점 색(바닥/바위) */
 const vcol=(rock,x,z,y,k,isEdge)=>{const th=TH[k];if(!rock){col.copy(thF[th]);const n=.86+.22*(Math.sin(x*.31+z*.17)*.5+.5)*(.6+.4*hash(Math.floor(x),Math.floor(z),11));col.multiplyScalar(n);
   if(th===8){const m=sm(.3,.9,Math.sin(x*.21)*Math.cos(z*.19)*.5+.5);col.lerp(new THREE.Color(0x3f7a44).convertSRGBToLinear(),m*.45)}
   if(LK[k]>-3&&th===6)col.lerp(new THREE.Color(0x8a8270).convertSRGBToLinear(),.35*sm(-3,-1,LK[k]));
   if(isEdge||W[k]<1.4)col.multiplyScalar(.82);return col}
  col.copy(thR[th]);const s=-W[k];col.multiplyScalar(.85+.3*hash(Math.floor(x*.5),Math.floor(z*.5),13));if(y<.7)col.multiplyScalar(.72+.4*y);
  if(s>1.25&&y>HT*.78)col.lerp(RIM,.35*(1-sm(2.2,3.4,s)));col.lerp(TOP,sm(1.8,3.6,s));return col};
 const push=(T,x,y,z,cl,em,u,v)=>{T.p.push(x,y,z);T.c.push(cl.r,cl.g,cl.b);T.e.push(em[0],em[1],em[2]);T.u.push(u,v)};
 const V=(i,j)=>{const k=m74idx(i,j);return{x:i*c,z:j*c,w:W[k],y:Y[k],k,nx:NX[k],nz:NZ[k]}};
 const emit=(poly,floor)=>{if(poly.length<3)return;let cx=0,cz=0;for(const p of poly){cx+=p.x;cz+=p.z}const T=tile(cx/poly.length,cz/poly.length)[floor?'f':'r'];
  let fnx=0,fnz=0;if(!floor){/* 면 방향으로 u 고르기 */const a=poly[0],b=poly[1],d=poly[2],ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=d.x-a.x,vy=d.y-a.y,vz=d.z-a.z;fnx=uy*vz-uz*vy;fnz=ux*vy-uy*vx}
  const useX=Math.abs(fnz)>=Math.abs(fnx);
  for(let n=2;n<poly.length;n++)for(const p of[poly[0],poly[n-1],poly[n]]){const isR=!floor&&p.y>.05&&F[p.k]<=0,cl=vcol(isR,p.x,p.z,p.y,p.k,p.edge);
   const em=isR?m74lightAt(p.x,p.y,p.z,p.nx,.15,p.nz,tmp):m74lightAt(p.x,.2,p.z,undefined,0,0,tmp);const top=!floor&&(-p.w)>2?1-sm(2,3.4,-p.w):1;
   const e=[em[0]*cl.r*top,em[1]*cl.g*top,em[2]*cl.b*top];push(T,p.x,p.y,p.z,cl,e,floor?p.x/5:(useX?p.x:p.z)/3.2,floor?p.z/5:p.y/2.3)}};
 const cut=tri=>{const fl=[],rk=[];for(let n=0;n<3;n++){const a=tri[n],b=tri[(n+1)%3];const af=a.w>0,bf=b.w>0;if(af)fl.push(a);else rk.push(a);
   if(af!==bf){const t=a.w/(a.w-b.w),p={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,w:0,y:0,k:t<.5?a.k:b.k,nx:a.nx,nz:a.nz,edge:1};fl.push(p);rk.push(p)}}
  emit(fl,true);if(rk.length>=3){/* 바위 쪽은 원래 꼭짓점 높이, 잘린 점은 바닥 높이 */emit(rk,false)}};
 for(let i=I0;i<M74.I1;i++)for(let j=J0;j<M74.J1;j++){const a=V(i,j),b=V(i,j+1),cc=V(i+1,j+1),d=V(i+1,j);
  if(a.w<-6&&b.w<-6&&cc.w<-6&&d.w<-6&&a.y===b.y&&false)continue;cut([a,b,cc]);cut([a,cc,d])}
 const mf=m74mat({map:m74tex(0)}),mr=m74mat({map:m74tex(1)});let tris=0;
 for(const t of tiles.values())for(const [k,m] of[['f',mf],['r',mr]]){const T=t[k];if(!T.p.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(T.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(T.c,3));g.setAttribute('aEm',new THREE.Float32BufferAttribute(T.e,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(T.u,2));
  g.computeVertexNormals();g.computeBoundingSphere();const o=new THREE.Mesh(g,m);o.receiveShadow=false;C.add(o);tris+=T.p.length/9}
 M74.tris=tris;
 /* 그물 밖은 끝없는 암반(바깥 바다가 비치지 않게) */
 {const x0=I0*c,x1=M74.I1*c,z0=J0*c,z1=M74.J1*c,E=260,m=new THREE.MeshBasicMaterial({color:new THREE.Color(0x24212c).convertSRGBToLinear()});
  for(const [ax,bx,az,bz] of[[x0-E,x1+E,z0-E,z0],[x0-E,x1+E,z1,z1+E],[x0-E,x0,z0,z1],[x1,x1+E,z0,z1]]){const g=new THREE.PlaneGeometry(bx-ax,bz-az);g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,m);o.position.set((ax+bx)/2,HT,(az+bz)/2);C.add(o)}}
 /* 호수·웅덩이 물 */
 for(const h of M74.lakes){const g=new THREE.CircleGeometry(1,56);g.rotateX(-Math.PI/2);g.scale(h[2]+.3,1,h[3]+.3);g.rotateY(-h[4]);
  const w=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:new THREE.Color(0x1f5d7e).convertSRGBToLinear(),transparent:true,opacity:.92,depthWrite:false}));w.position.set(h[0],-.12,h[1]);C.add(w);
  const g2=new THREE.RingGeometry(.9,1,56);g2.rotateX(-Math.PI/2);g2.scale(h[2],1,h[3]);g2.rotateY(-h[4]);const r=new THREE.Mesh(g2,new THREE.MeshBasicMaterial({color:0x5fc4e6,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));r.position.set(h[0],-.1,h[1]);C.add(r);
  for(let n=0;n<Math.round(h[2]*h[3]/14);n++){const a=hash(n,1,h[0]|0)*6.28,q=Math.sqrt(hash(n,2,h[0]|0))*.85,lx=Math.cos(a)*h[2]*q,lz=Math.sin(a)*h[3]*q,sp=glow(0x9fe8ff,.5+hash(n,3,5)*.6,.35);sp.position.set(h[0]+lx*h.c-lz*h.s,-.05,h[1]+lx*h.s+lz*h.c);C.add(sp);M74.anim.mush.push(sp)}}}

/* ---------- 소품 ---------- */
function caveRoom74(){
 if(INT.gr.cave)return;const t0=performance.now();m74sample();M74.solids.clear();M74.lights.length=0;M74.rails.length=0;for(const k in M74.anim)M74.anim[k].length=0;
 const C=INT.gr.cave=new THREE.Group();C.position.set(MINE.ox,0,MINE.oz);C.visible=false;INT.g.add(C);
 const chunks=new Map(),glowCh=new Map(),add=(map,g,x,z)=>{const k=Math.floor(x/32)+','+Math.floor(z/32);if(!map.has(k))map.set(k,[]);map.get(k).push(g)};
 /* P: 소품 조각(색 굽기) · G: 스스로 빛나는 조각 · halo: 빛 스프라이트 */
 const P=(geo,col,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>add(chunks,pt(geo,col,[x,y,z],[rx,ry,rz],[sx,sy,sz]),x,z);
 const G=(geo,col,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>add(glowCh,pt(geo,col,[x,y,z],[rx,ry,rz],[sx,sy,sz]),x,z);
 const halo=(col,s,op,x,y,z)=>{const h=glow(col,s,op);h.position.set(x,y,z);C.add(h);return h};
 const solid=m74solid,open=(x,z,r)=>mineOpen(x,z,r),railNear=(x,z,d)=>M74.rails.some(s=>m74seg(x,z,s[0],s[1])<d);
 const R=(a,b)=>a+(b-a)*Math.random();let seed=1;const rnd=()=>hash(seed++,7,74);
 /* 놓아도 되나: 바닥·다른 소품·레일 */
 const free=(x,z,r,rail=2.2)=>open(x,z,r)&&!railNear(x,z,rail+r);
 /* 오른쪽(+x) 기준 각도 → 그 쪽 벽까지 거리 */
 const wallDist=(x,z,dx,dz,max=20)=>{for(let d=0;d<max;d+=.4)if(!mineFloorAt(x+dx*d,z+dz*d))return d;return max};
 const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,s=8)=>new THREE.CylinderGeometry(a,b,h,s),unit=new THREE.BoxGeometry(1,1,1),stone=new THREE.IcosahedronGeometry(1,0),stone1=new THREE.IcosahedronGeometry(1,1);
 const WD=0x9c6a3e,WD2=0xb07a4a,WD3=0x7a5236,IRON=0x4c5862,IRON2=0x3a434b,RED=0xd8503f,YEL=0xf2c230,CRM=0xf2e8d6,LAMP=0xffc46a;

 /* ===== 레일(자갈 + 침목 + 레일 두 줄) ===== */
 function railway(points){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));const len=curve.getLength(),cnt=Math.ceil(len/1.4);
  const cross=[[-1.32,.012],[-1.02,.07],[1.02,.07],[1.32,.012]],rail=[[-.09,.13],[-.09,.155],[-.032,.165],[-.032,.215],[-.06,.225],[-.06,.25],[.06,.25],[.06,.225],[.032,.215],[.032,.165],[.09,.155],[.09,.13]];
  const steel=[0x5a4a42,0x66554a,0x5e4f46,0x625246,0x6e6052,0xb8b0a2,0x766858,0x584a42,0x56443c,0x66544a,0x56463e],bal=[0x433c3c,0x544a46,0x463e3e];let prev;
  for(let k=0;k<=cnt;k++){const t=k/cnt,p=curve.getPointAt(t),v=curve.getTangentAt(t),off=(d,h)=>[p.x+d*v.z,h,p.z-d*v.x];
   const row=[cross.map(([d,h])=>off(d,h)),...[-.75,.75].map(sd=>rail.map(([d,h])=>off(sd+d,h)))];
   if(prev){const pos=[],cs=[];for(let s=0;s<row.length;s++)for(let n=1;n<row[s].length;n++){const cl=new THREE.Color(s?steel[n-1]:bal[n-1]).convertSRGBToLinear();
     for(const vx of[prev[s][n-1],row[s][n-1],row[s][n],prev[s][n-1],row[s][n],prev[s][n]]){pos.push(...vx);cs.push(cl.r,cl.g,cl.b)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));add(chunks,g,p.x,p.z)}
   prev=row;const yaw=Math.atan2(v.x,v.z)+(hash(k,4,9)-.5)*.05;P(unit,k%3?0x755a49:0x95745a,p.x,.095,p.z,0,yaw,0,1.95+.15*hash(k,6,2),.09,.24+.05*hash(k,8,2))}
  for(let i=1;i<points.length;i++)M74.rails.push([points[i-1],points[i]]);return curve}
 const mainLine=railway([[0,128],[0,110],[0,96],[0,84],[0,70],[0,56],[1,44],[4,32],[12,22],[26,13],[42,8],[58,5],[74,4],[88,2],[100,-4]]);
 const yardE=railway([[0,92],[3,87],[9,82],[17,78],[24,76]]);
 const yardW=railway([[0,90],[-3,85],[-9,80],[-17,76],[-25,74]]);
 const shaftSpur=railway([[12,22],[6,18],[0,15],[-6,12]]);
 const digSpur=railway([[88,2],[96,-8],[103,-15],[108,-19]]);
 const camp=railway([[-40,12],[-50,16],[-60,20]]);
 function cart(line,f,loaded,ore=0x676571){const p=line.getPointAt(f),tg=line.getTangentAt(f),yaw=Math.atan2(tg.x,tg.z),parts=[],wh=cyl(.3,.3,.15,12);
  for(const e of[-.72,.72])for(const sd of[-1,1]){parts.push(pt(wh,IRON2,[sd*.78,.47,e],[0,0,Math.PI/2]),pt(cyl(.12,.12,.06,8),0xb39570,[sd*.88,.47,e],[0,0,Math.PI/2]))}
  parts.push(pt(lkRb(1.5,.22,2.35,.06,.035),IRON2,[0,.7,0]));
  for(let r=0;r<3;r++){const hf=.7+r*.09,y=.9+r*.23;for(const sd of[-1,1]){parts.push(pt(box(.11,.24,2.3),r===2?0x6a9a92:0x4a7a74,[sd*hf,y,0],[0,0,-sd*.28]),pt(box(2*hf,.23,.11),0x4a7a74,[0,y,sd*1.1]))}}
  for(const sd of[-1,1]){parts.push(pt(box(.15,.1,2.45),0xc7b38a,[sd*.95,1.56,0]));for(const e of[-.8,.8])parts.push(pt(box(.06,.8,.12),IRON2,[sd*.84,1.15,e],[0,0,-sd*.28]))}
  if(loaded)for(let n=0;n<11;n++)parts.push(pt(stone,n%4===0?0xf2c230:n%3?ore:0x8a8494,[(n%3-1)*.44,1.32+hash(n,2,4)*.24,(Math.floor(n/3)-1.4)*.45],[.4,n,.3],[.42,.33,.47]));
  add(chunks,(()=>{const g=mg(parts);g.applyMatrix4(new THREE.Matrix4().makeRotationY(yaw).setPosition(p.x,.075,p.z));return g})(),p.x,p.z);solid(p.x+tg.x*.7,p.z+tg.z*.7,1);solid(p.x-tg.x*.7,p.z-tg.z*.7,1)}
 function bufferStop(line){const p=line.getPointAt(1),tg=line.getTangentAt(1),yaw=Math.atan2(tg.x,tg.z),x=p.x+tg.x*.6,z=p.z+tg.z*.6;
  P(unit,0x9e7754,x,.62,z,0,yaw,0,2.2,.3,.32);for(const sd of[-1,1])P(unit,IRON,x+Math.cos(yaw)*sd*.8,.38,z-Math.sin(yaw)*sd*.8,0,yaw,0,.2,.76,.24);
  P(unit,RED,x,.84,z,0,yaw,0,.5,.14,.34);solid(x,z,1.1)}
 bufferStop(yardE);bufferStop(yardW);bufferStop(digSpur);bufferStop(camp);

 /* ===== 등 ===== */
 const lanternParts=(()=>{const tn=pts=>new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),10);
  return{body:mg([pt(tn([[.01,0],[.25,0],[.29,.045],[.27,.11],[.2,.16],[.15,.22]]),0x59696a),pt(tn([[.15,.58],[.26,.61],[.28,.65],[.2,.69],[.13,.76],[.12,.82],[.01,.84]]),0x4c6569),pt(new THREE.TorusGeometry(.23,.024,4,12,Math.PI),0xa68a61,[0,.82,0])]),
   glass:mg([pt(tn([[.15,.18],[.19,.23],[.22,.39],[.2,.51],[.14,.62]]),0xffd27a)])}})();
 function lantern(x,y,z,ry=0,col=LAMP,lr=11,lk=1.15){const b=lanternParts.body.clone(),g=lanternParts.glass.clone(),m=new THREE.Matrix4().makeRotationY(ry).setPosition(x,y,z);b.applyMatrix4(m);g.applyMatrix4(m);add(chunks,b,x,z);add(glowCh,g,x,z);
  halo(col,2.3,.42,x,y+.42,z);m74light(x,z,y+.4,lr,col,lk)}
 function lampPost(x,z,ry=0){P(cyl(.08,.11,2.9,8),0x755a43,x,1.45,z);P(unit,0x565c5b,x+Math.sin(ry)*.25,2.92,z+Math.cos(ry)*.25,0,ry,0,.08,.08,.6);lantern(x+Math.sin(ry)*.5,2.05,z+Math.cos(ry)*.5,ry);solid(x,z,.22)}
 /* ===== 갱목 틀(기둥 둘 + 위 들보 + 버팀) — 갱도를 가로질러 ===== */
 function frame(x,z,ang,hw){const c=Math.cos(ang),s=Math.sin(ang),parts=[],H=3.5;for(const sd of[-1,1]){const px=sd*hw;parts.push(pt(cyl(.24,.3,H,9),sd<0?0x916748:0xa57a53,[px,H/2,0],[0,0,-sd*.05]),pt(cyl(.32,.33,.18,10),0x57575a,[px,.34,0]),pt(cyl(.22,.22,1.2,8),0x896344,[px-sd*.42,H-.5,0],[0,0,-sd*.8]));
   solid(x+c*px,z-s*px,.32)}
  parts.push(pt(cyl(.3,.33,2*hw+.7,10),0x96704c,[0,H+.1,0],[0,0,Math.PI/2]));for(const sd of[-1,1])parts.push(pt(cyl(.27,.27,.05,10),0xc69564,[sd*(hw+.36),H+.1,0],[0,0,Math.PI/2]));
  for(const o of[-.5,0,.5])parts.push(pt(box(.18,.1,1.4),0x7a5838,[o*hw,H+.42,0]));
  const g=mg(parts);g.applyMatrix4(new THREE.Matrix4().makeRotationY(ang).setPosition(x,0,z));add(chunks,g,x,z);return{x,z,c,s,hw}}
 /* 갱도를 따라 틀을 세우고 몇 개에는 등을 매달아요 */
 function timberRun(a,b,step,lampEvery=2,max=4.4){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;let n=0;
  for(let u=step*.5;u<L;u+=step){const x=a[0]+dx*u,z=a[1]+dz*u,px=dz,pz=-dx;const l=wallDist(x,z,-px,-pz),r=wallDist(x,z,px,pz),hw=Math.min(l,r,max)-.55;if(hw<1.6)continue;
   const ox=(r-l)/2;const cx=x+px*Math.max(-1,Math.min(1,ox)),cz=z+pz*Math.max(-1,Math.min(1,ox));const F=frame(cx,cz,Math.atan2(dx,dz),hw);
   if(n++%lampEvery===0)lantern(cx+px*(hw-.6),2.35,cz+pz*(hw-.6),0)}}
 timberRun([0,132],[0,97],6.5,2);timberRun([0,62],[0,41],7,1);timberRun([46,8],[60,4],7,1);timberRun([24,86],[46,93],7,2,3.6);timberRun([-24,86],[-44,91],7,2,3.6);
 timberRun([-72,90],[-92,72],8,2,3.4);timberRun([92,28],[86,56],8,2,3.4);timberRun([86,56],[72,86],8,2,3.4);timberRun([-42,14],[-56,18],8,1);
 timberRun([112,-26],[122,-44],6,2,2.8);timberRun([126,6],[142,10],6,2,2.8);timberRun([-6,-22],[-8,-40],8,2);

 /* ===== 입구: 바깥 빛이 들어오는 문 + 표지판 ===== */
 for(let i=0;i<5;i++)P(unit,i%2?0x91775f:0xa08a6e,0,.05,126.3+i*.38,0,0,0,3.6,.1,.33);
 for(const sd of[-1,1]){P(stone,0x6d6570,sd*3.4,.7,129.6,0,sd,0,1.4,1.2,1.3);P(stone,0x5f5866,sd*3.6,1.9,130.4,0,sd*2,0,1.1,1,1.1)}
 m74light(0,131,1.5,12,0xffe6b8,1.3);halo(0xfff0d0,9,.32,0,1.2,131.5);
 {const g=new THREE.PlaneGeometry(6,5);g.rotateX(-Math.PI/2);const cv=document.createElement('canvas');cv.width=8;cv.height=64;const k=cv.getContext('2d'),gr=k.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,240,210,0)');gr.addColorStop(1,'rgba(255,240,210,.9)');k.fillStyle=gr;k.fillRect(0,0,8,64);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(0,.03,129.5);C.add(m)}
 {const x=-3.0,z=118;P(lkRb(.12,1.6,.12,.03,.02),WD3,x,.8,z);P(lkRb(1.7,.62,.08,.05,.02),0x3a3f4a,x,1.55,z+.02);P(lkRb(1.58,.5,.09,.04,.02),YEL,x,1.55,z+.05);
  if(typeof plSignText==='function'){const s=plSignText('⛏ 초승달 광산',1.5,.32,72);s.position.set(MINE.ox*0+x,1.55,z+.11);C.add(s)}solid(x,z,.3)}

 /* ===== 광차 기지(남쪽 큰 방) ===== */
 cart(yardW,.86,false);cart(yardW,.56,true,0x8f6a4a);cart(mainLine,.155,false);cart(yardE,.7,true,0x6f7a86);
 /* 광산 사무실: 판자 벽 + 함석지붕 + 불 켜진 창 + 문(+z) */
 {const x=-20,z=64,p=[],gl=[];p.push(pt(lkRb(5.2,.3,3.8,.05,.03),0x6c625a,[0,.15,0]));
  for(let i=0;i<13;i++){const xx=-2.4+i*.4;p.push(pt(box(.38,2.5,.1),i%2?0xb07a4a:0xa06c40,[xx,1.55,1.75]),pt(box(.38,2.5,.1),i%2?0xa87246:0x9a663c,[xx,1.55,-1.75]))}
  for(let i=0;i<9;i++){const zz=-1.6+i*.4;p.push(pt(box(.1,2.5,.38),i%2?0xa87246:0x9a663c,[-2.55,1.55,zz]),pt(box(.1,2.5,.38),i%2?0xb07a4a:0xa06c40,[2.55,1.55,zz]))}
  for(const sd of[-1,1])p.push(pt(box(5.6,.08,2.2),sd<0?0x5a7d82:0x4f7176,[0,3.05+.45,sd*1.02],[sd*.42,0,0]));p.push(pt(box(5.7,.12,.14),0x8fa4a6,[0,3.94,0]));
  p.push(pt(box(1.1,1.9,.08),0x6a4630,[1.2,1.25,1.82]),pt(box(.08,.08,.06),0xd9b45a,[1.6,1.25,1.88]),pt(box(1.4,.12,.4),0x6c625a,[1.2,.25,2.1]));
  gl.push(pt(box(1.1,.75,.06),0xffd889,[-1.1,1.75,1.82]));p.push(pt(box(1.26,.1,.1),CRM,[-1.1,2.17,1.84]),pt(box(1.26,.1,.1),CRM,[-1.1,1.33,1.84]),pt(box(.08,.84,.08),CRM,[-1.1,1.75,1.85]));
  p.push(pt(box(.5,.6,.5),0x5c6b6e,[2.1,3.9,-.8]),pt(cyl(.12,.12,.9,8),0x3b3f44,[2.1,4.5,-.8]));
  const g=mg(p);g.translate(x,0,z);add(chunks,g,x,z);const g2=mg(gl);g2.translate(x,0,z);add(glowCh,g2,x,z);
  for(const [dx,dz] of[[-2,-1.2],[0,-1.2],[2,-1.2],[-2,1.2],[0,1.2],[2,1.2]])solid(x+dx,z+dz,1.25);m74light(x-1.1,z+3,1.4,7,0xffd27a,1.0);halo(0xffd889,3,.35,x-1.1,1.75,z+2);
  lantern(x+2.4,2.4,z+2.1,0);
  /* 사무실 앞 탁자·의자·연장 걸이 */
  P(lkRb(1.4,.08,.8,.03,.02),WD2,x-3.8,.86,z+3.6);for(const a of[-1,1])for(const b of[-1,1])P(box(.07,.82,.07),WD3,x-3.8+a*.6,.41,z+3.6+b*.32);P(box(.36,.3,.25),0x3d6a7a,x-3.6,1.05,z+3.55);solid(x-3.8,z+3.6,.85);
  P(lkRb(.5,.05,.5,.02,.01),WD,x-3.8,.5,z+4.6);for(const a of[-1,1])for(const b of[-1,1])P(box(.05,.48,.05),WD3,x-3.8+a*.2,.24,z+4.6+b*.2);
  for(let i=0;i<5;i++){const xx=x+3.6+i*.32;P(box(.06,1.3,.06),WD3,xx,.9,z-1.2,.1*(i-2));P(box(.28,.14,.06),i%2?0x7f8a92:0x9aa3aa,xx,1.5,z-1.2)}P(box(1.8,.1,.1),WD3,x+4.25,1.62,z-1.25);solid(x+4.2,z-1.2,.9)}
 /* 하역장: 판자 마루 + 상자·자루 + 손 기중기 */
 {const x=30,z=68;for(let n=0;n<10;n++)P(unit,n%3===0?0xa57850:0x926a49,x,.24,z+n*.54,0,0,0,4,.3,.5);for(const sd of[-1,1])P(unit,0x55483d,x+sd*1.8,.08,z+2.4,0,0,0,.25,.16,5.4);
  for(const [dx,dz,s] of[[-1,.5,1],[.6,.4,.8],[1.2,1.6,.9],[-.8,4.2,1],[.9,4.6,.75]])P(lkRb(.9*s,.85*s,.9*s,.06,.03),dz>3?0x8a6a44:0xb08048,x+dx,.39+.425*s,z+dz,0,dx,0);
  for(const [dx,dz] of[[-1.3,2.4],[-.6,2.6],[-1,3]])P(stone1,0xd2c39c,x+dx,.55,z+dz,0,dx,0,.38,.24,.28);
  for(const [dx,dz] of[[-1,1],[1,1],[0,4.5],[1,3]])solid(x+dx,z+dz,1.05);
  /* 기중기: 기둥 + 팔 + 도르래 + 갈고리 */
  const cx=x-2.6,cz=z-1;P(cyl(.18,.22,4.2,8),IRON,cx,2.1,cz);P(box(.2,.2,3.6),IRON,cx,4,cz+1.5,-.12);P(lkRb(.5,.5,.5,.05,.03),YEL,cx,.25,cz);P(cyl(.04,.04,2,6),0x2d2d2d,cx,2.9,cz+3);P(new THREE.TorusGeometry(.16,.04,6,10,Math.PI*1.4),IRON2,cx,1.85,cz+3);solid(cx,cz,.4)}
 /* 쌓인 갱목·드럼통·자루 */
 for(let n=0;n<6;n++)P(cyl(.22,.22,3.4,8),n%2?0xa57a53:0x936a46,16,.25+Math.floor(n/3)*.4,60.5+(n%3)*.46,Math.PI/2,0,0);solid(16,61,1.9);
 for(const [x,z,c] of[[14,92,RED],[15.2,92.3,0x3f6f8a],[14.5,93.4,0x5a8a4a]]){P(cyl(.42,.42,1.2,12),c,x,.6,z);P(cyl(.44,.44,.06,12),0x2f3338,x,1.2,z);solid(x,z,.5)}
 lampPost(-8,96,Math.PI);lampPost(8,68,0);lampPost(-30,78,.6);lampPost(18,86,-.4);

 /* ===== 화약 창고(남동) ===== */
 {const cx=62,cz=96;
  /* 입구 차단기(들어 올린 줄무늬 막대) */
  {const bx=49,bz=90.4;P(lkRb(.5,1,.5,.05,.03),0x3a3f4a,bx,.5,bz);solid(bx,bz,.4);for(let k=0;k<5;k++)P(box(.14,.16,.9),k%2?CRM:RED,bx-.15,1.05+k*.62,bz+.1+k*.42,-.9,0,0);G(new THREE.SphereGeometry(.1,8,6),0xff5a3a,bx,1.12,bz)}
  /* 화약 상자 더미 */
  const tnt=(x,y,z,r)=>{P(lkRb(1,.6,.7,.05,.03),0xc0392b,x,y+.3,z,0,r,0);P(box(1.02,.12,.72),0x3a2a22,x,y+.3,z,0,r,0);P(box(.36,.36,.02),CRM,x+Math.sin(r)*.36,y+.32,z+Math.cos(r)*.36,0,r,0)};
  for(const [dx,dz,r] of[[4,-5,0],[5.1,-5,0],[4.5,-5,0,1],[7,-3.4,.4],[8,-2,.3],[-2,-6,-.2],[-.9,-6.1,-.1]])tnt(cx+dx,0,cz+dz,r);tnt(cx+4.55,.6,cz-5,.05);tnt(cx+7.5,.6,cz-2.7,.35);
  for(const [dx,dz] of[[4.5,-5],[7.4,-2.7],[-1.5,-6]])solid(cx+dx,cz+dz,1.2);
  /* 기폭 장치 + 감긴 도화선 */
  P(lkRb(.6,.45,.45,.04,.02),0x5a3a2a,cx-4,.23,cz+2);P(cyl(.04,.04,.6,6),IRON,cx-4,.75,cz+2);P(box(.5,.06,.06),IRON2,cx-4,1.05,cz+2);solid(cx-4,cz+2,.45);
  const coil=new THREE.CatmullRomCurve3(Array.from({length:40},(_,i)=>{const a=i*Math.PI/6,r=.32+.004*i;return new THREE.Vector3(r*Math.cos(a),.05+.025*(i/12),r*Math.sin(a))}));P(new THREE.TubeGeometry(coil,40,.035,5,false),RED,cx-3,0,cz+3.1);
  /* 빨간 경고등 + 깃발 + 모래주머니 */
  for(const [dx,dz] of[[-6,-4],[9,1]]){P(cyl(.06,.08,2.2,8),0x3a3f4a,cx+dx,1.1,cz+dz);G(new THREE.SphereGeometry(.16,10,8),0xff5a3a,cx+dx,2.28,cz+dz);halo(0xff4a2a,2.4,.5,cx+dx,2.3,cz+dz);m74light(cx+dx,cz+dz,2.2,8,0xff5a3a,1.1);solid(cx+dx,cz+dz,.2)}
  P(cyl(.04,.04,2.4,6),0x6a5038,cx+10,1.2,cz-3);P(box(.02,.6,.9),RED,cx+10,2.1,cz-2.55);solid(cx+10,cz-3,.2);
  if(GEO.sandbag)for(const [dx,dz,r] of[[-7,3,1.2],[-8,0.5,1.5]]){P(GEO.sandbag,null,cx+dx,0,cz+dz,0,r,0,1.1,1.1,1.1);solid(cx+dx,cz+dz,1)}
  if(typeof plSignText==='function'){P(lkRb(.12,1.5,.12,.03,.02),WD3,cx-5,.75,cz+5.5);P(lkRb(1.5,.5,.08,.05,.02),RED,cx-5,1.45,cz+5.52);const s=plSignText('⚠ 화약',1.3,.34,70);s.material=s.material.clone();s.position.set(cx-5,1.45,cz+5.6);C.add(s);solid(cx-5,cz+5.5,.3)}}

 /* ===== 무너진 옛 갱도(남서) ===== */
 {const cx=-62,cz=94;
  /* 기운 기둥·떨어진 들보 */
  P(cyl(.25,.3,3.4,9),0x8a6444,cx-6,1.5,cz-3,0,0,.35);P(cyl(.25,.3,3.4,9),0x9a7050,cx-6,1.4,cz+3.5,0,0,-.5);P(cyl(.28,.3,6.6,10),0x8a6444,cx-6.6,.35,cz+.4,.1,.3,Math.PI/2);
  solid(cx-6.3,cz-3,.4);solid(cx-6.3,cz+3.4,.4);solid(cx-6.6,cz+.4,.6);
  /* 무너진 돌 더미: 서쪽 막다른 갱도를 막아요 */
  for(let n=0;n<26;n++){const a=hash(n,1,61)*6.28,r=hash(n,2,61)*3.6,x=-104+Math.cos(a)*r,z=99+Math.sin(a)*r*.8,s=.5+hash(n,3,61)*1.2;P(stone,n%3?0x5f5866:0x77707a,x,s*.5,z,a,n,0,s*1.2,s*.9,s);if(s>.9)solid(x,z,s*.85)}
  for(let k=0;k<3;k++){const x=-96+k*1.1,z=98.6+k*.4;P(box(.16,.18,4.8),k%2?CRM:YEL,x,1+k*.25,z,0,.4+k*.5,.6-k*.5)}
  /* 오래된 광차(옆으로 쓰러짐) + 녹슨 레일 토막 */
  {const parts=[];parts.push(pt(lkRb(1.4,1.1,2.2,.06,.03),0x7a5a4a,[0,.55,0]),pt(box(1.5,.12,2.3),0x5a4a40,[0,1.12,0]));const g=mg(parts);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0,.6,1.35)).setPosition(cx+4,.7,cz-4));add(chunks,g,cx+4,cz-4);solid(cx+4,cz-4,1.3)}
  for(const sd of[-1,1])P(box(.12,.12,5),0x6a5040,cx+sd*.75+2,.08,cz+3,0,.2,0);
  /* 흩어진 버려진 연장·통 */
  P(cyl(.4,.4,1.1,12),0x6a7a5a,cx-2,.3,cz+5,Math.PI/2,0,.3);solid(cx-2,cz+5,.6);lantern(cx+1,.6,cz-1,0,0xffb060,7,.8);}

 /* ===== 펌프실(물 고인 웅덩이 + 펌프 + 관) ===== */
 {const cx=-102,cz=62;const px=cx+5.5,pz=cz-4.5;
  P(lkRb(2,1.3,1.4,.12,.05),0x527775,px,.7,pz);P(cyl(.5,.5,1.5,14),0x3f5f5e,px-.2,1.2,pz,Math.PI/2,0,Math.PI/2);P(new THREE.TorusGeometry(.6,.08,6,16),IRON2,px+1.2,1.2,pz,0,Math.PI/2,0);
  P(cyl(.24,.24,6,10),0x628181,px-3.5,.9,pz+.8,0,.7,Math.PI/2);for(const k of[-2,0,2])P(cyl(.33,.33,.12,10),0xba9c78,px-3.5+k*.75,.9,pz+.8-k*.65,0,.7,Math.PI/2);
  P(cyl(.24,.24,3,10),0x628181,px+.5,2.1,pz-1,0,0,0);P(cyl(.24,.24,4,10),0x628181,px+.5,3.6,pz+1,Math.PI/2,0,0);
  solid(px,pz,1.3);solid(px-2.4,pz+1.7,.5);lantern(px-1.6,2.4,pz+1.6,0,0xbfe8ff,8,.9);
  for(let n=0;n<10;n++){const a=n/10*6.28;P(stone,0x53646a,cx-2+Math.cos(a)*7.4,.25,cz+2+Math.sin(a)*5.2,a,n,0,1.1,.5,.8)}}

 /* ===== 중앙 수직갱 광장 ===== */
 {const sx=-6,sz=8;
  /* 수직갱 구멍(못 들어감) + 난간 */
  {const g=new THREE.BoxGeometry(4.6,.1,4.6);P(g,0x0a0a0e,sx,.02,sz);P(lkRb(5.4,.3,.5,.05,.02),0x7a7480,sx,.15,sz+2.55);P(lkRb(5.4,.3,.5,.05,.02),0x7a7480,sx,.15,sz-2.55);P(lkRb(.5,.3,4.6,.05,.02),0x7a7480,sx+2.55,.15,sz);P(lkRb(.5,.3,4.6,.05,.02),0x7a7480,sx-2.55,.15,sz);
   for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(box(.1,1.1,.1),YEL,sx+a*2.9,.55,sz+b*2.9);for(const sd of[-1,1]){P(box(5.8,.08,.08),YEL,sx,1.05,sz+sd*2.9);P(box(.08,.08,5.8),YEL,sx+sd*2.9,1.05,sz)}
   for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)solid(sx+i*1.6,sz+j*1.6,1.35)}
  /* 권양탑: 네 다리 + 버팀 + 위 도르래 바퀴 + 승강기 칸 */
  const H=8.2;for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]]){P(box(.38,H,.38),0x8a6444,sx+a*2.75,H/2,sz+b*2.75,b*.06,0,-a*.06);solid(sx+a*2.75,sz+b*2.75,.36)}
  for(const y of[2.6,5.2,7.6]){for(const sd of[-1,1]){P(box(5.6,.24,.24),0x9a7050,sx,y,sz+sd*2.7);P(box(.24,.24,5.6),0x9a7050,sx+sd*2.7,y,sz)}}
  for(const sd of[-1,1]){P(box(.18,3.6,.18),0x7a5838,sx+sd*1.4,1.6+.4,sz+2.75,0,0,sd*.75);P(box(.18,3.6,.18),0x7a5838,sx+sd*1.4,4.2,sz+2.75,0,0,-sd*.75)}
  P(new THREE.TorusGeometry(1.15,.12,6,18),0xb08a5c,sx,H+.6,sz,0,Math.PI/2,0);P(cyl(.08,.08,1,6),IRON,sx,H+.6,sz,0,0,Math.PI/2);for(let k=0;k<6;k++)P(box(.06,2.2,.06),0x8a7050,sx,H+.6,sz,k*Math.PI/6,0,0);
  P(box(1.8,.3,1.8),IRON,sx,H+.05,sz);P(cyl(.03,.03,5.4,5),0x2a2a2a,sx,H-2.7,sz);
  /* 승강기 칸(조금 내려간 채) */
  {const cy=1.2;P(lkRb(2.2,.16,2.2,.04,.02),IRON2,sx,cy,sz);P(lkRb(2.2,.16,2.2,.04,.02),IRON2,sx,cy+2.2,sz);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(box(.1,2.2,.1),0x6b7a82,sx+a*1.02,cy+1.1,sz+b*1.02);for(let k=-3;k<=3;k++){P(box(.04,2.1,.04),0x8a9aa0,sx+k*.28,cy+1.1,sz-1.02);P(box(.04,2.1,.04),0x8a9aa0,sx-1.02,cy+1.1,sz+k*.28)}}
  /* 빛 기둥(위에서 내려오는 바깥 빛) + 떠다니는 먼지 */
  {const cv=document.createElement('canvas');cv.width=4;cv.height=128;const k=cv.getContext('2d'),gr=k.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,248,220,.0)');gr.addColorStop(.25,'rgba(255,248,220,.55)');gr.addColorStop(1,'rgba(255,248,220,.12)');k.fillStyle=gr;k.fillRect(0,0,4,128);
   const tex=new THREE.CanvasTexture(cv),g=new THREE.CylinderGeometry(2.6,4.4,15,24,1,true),m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
   m.position.set(sx+1.2,7.5,sz+1.5);m.rotation.set(.08,0,-.08);C.add(m);M74.shaft=m;m74light(sx+1.5,sz+1.8,6,17,0xfff2d0,1.35);halo(0xfff6dc,10,.35,sx+1.4,.6,sz+2);
   for(let i=0;i<16;i++){const d=glow(0xfff4d8,.26,.7);d.position.set(sx+1.2+(hash(i,1,3)-.5)*5,1+hash(i,2,3)*9,sz+1.5+(hash(i,3,3)-.5)*5);d.userData.b=d.position.clone();d.userData.k=hash(i,4,3)*6.28;C.add(d);M74.anim.dust.push(d)}}
  /* 권양기 집: 지붕 덮인 드럼 + 연결 줄 */
  {const hx=sx+11,hz=sz-6;P(lkRb(4,.3,3,.05,.03),0x6c625a,hx,.15,hz);P(cyl(.8,.8,2.2,14),0x52656a,hx,1.2,hz,0,0,Math.PI/2);P(cyl(.86,.86,.14,14),0xb59c78,hx-1.1,1.2,hz,0,0,Math.PI/2);P(cyl(.86,.86,.14,14),0xb59c78,hx+1.1,1.2,hz,0,0,Math.PI/2);
   for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(box(.18,2.8,.18),WD3,hx+a*1.8,1.4,hz+b*1.3);for(const sd of[-1,1])P(box(4.1,.08,1.8),0x5a7d82,hx,2.95+.32,hz+sd*.8,sd*.38,0,0);
   P(lkRb(1.2,1,1,.08,.04),YEL,hx+1.6,.6,hz+1.8);
   for(const [a,b] of[[-1.6,-1],[0,-1],[1.6,-1],[-1.6,1],[0,1],[1.6,1]])solid(hx+a,hz+b,.95);lantern(hx-2.2,2.5,hz+1.6,0)}
  /* 선별기: 깔때기(호퍼) + 경사 컨베이어 + 광석 무더기 */
  {const hx=sx-16,hz=sz+16;P(cyl(1.6,.5,1.8,8),0x7a6a56,hx,2.5,hz);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])P(box(.2,2.2,.2),IRON,hx+a*1,1.1,hz+b*1);
   P(box(1,.18,7),0x3a3f44,hx+4,1.6,hz,.0,0,-.3);for(let k=0;k<12;k++)P(box(.92,.06,.4),0x2a2d30,hx+4-.0,1.72,hz-3.2+k*.58,0,0,-.3);for(const z of[-3,0,3])for(const sd of[-1,1])P(box(.12,1.6,.12),IRON,hx+4+sd*.4,.8,hz+z);
   for(let n=0;n<9;n++)P(stone,n%3===0?0xc58a4a:0x6e6778,hx+(hash(n,1,5)-.5)*2.2,.3+hash(n,2,5)*.3,hz+2.2+hash(n,3,5),n,n,0,.5,.35,.45);
   solid(hx,hz,1.6);for(const z of[-2.5,0,2.5])solid(hx+4,hz+z,.8);solid(hx,hz+2.6,1.1);lampPost(hx-2.4,hz+3.2,0)}
  /* 기둥 바위(자연 암주) 셋: 넓은 광장을 나눠요 */
  for(const [x,z,r] of[[-36,-2,2.4],[24,-14,2.3],[-16,-24,2]]){for(let k=0;k<4;k++)P(stone1,[0x5c5666,0x6a6474,0x5a5462,0x726a78][k],x+(hash(k,1,x)-.5)*.6,.9+k*1.15,z+(hash(k,2,x)-.5)*.6,k,k*.7,0,r*(1-k*.12),1.25,r*(1-k*.12));solid(x,z,r+.2)}
  lampPost(-8,32,.4);lampPost(16,-10,0);lampPost(-30,6,1.2);lampPost(28,30,-.6);lampPost(-36,-12,1)}

 /* ===== 광부 야영지(서쪽) ===== */
 {const cx=-84,cz=20;
  /* 모닥불: 돌 고리 + 장작 + 불꽃 */
  const fx=cx+2,fz=cz+2;for(let n=0;n<9;n++){const a=n/9*6.28;P(stone,0x6d6672,fx+Math.cos(a)*.95,.18,fz+Math.sin(a)*.95,a,n,0,.32,.24,.28)}
  for(let k=0;k<4;k++)P(cyl(.1,.12,1.3,6),0x6a4630,fx,.25,fz,0,k*.8,1.25);for(let k=0;k<3;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(.32-k*.08,.8+k*.2,7),new THREE.MeshBasicMaterial({color:[0xff7a2a,0xffa53a,0xffd36a][k]}));f.position.set(fx,.55+k*.12,fz);C.add(f);M74.anim.fire.push(f)}
  const fh=halo(0xff9a40,5,.55,fx,1,fz);M74.anim.fire.push(fh);m74light(fx,fz,1.2,15,0xffa050,1.55);solid(fx,fz,1.25);
  /* 통나무 의자 셋 */
  for(const a of[.4,2.3,4.2]){const x=fx+Math.cos(a)*2.6,z=fz+Math.sin(a)*2.6;P(cyl(.26,.26,1.8,8),0x8a6444,x,.26,z,0,-a+Math.PI/2,Math.PI/2);solid(x,z,.75)}
  /* 솥 걸이(삼발이) */
  for(let k=0;k<3;k++){const a=k*2.09;P(cyl(.04,.04,1.8,5),0x5a4030,fx+Math.cos(a)*.45,.85,fz+Math.sin(a)*.45,Math.sin(a)*.25,0,-Math.cos(a)*.25)}P(new THREE.SphereGeometry(.3,10,8,0,6.28,Math.PI*.35,Math.PI*.65),0x2f3338,fx,1.05,fz);
  /* 천막 둘(캔버스 A자) */
  const tent=(x,z,r,c)=>{const p=[];p.push(pt(cyl(1.25,1.25,3,3),c,[0,.62,0],[-Math.PI/2,0,0],[.95,1,1.15]),pt(cyl(.8,.8,.06,3),0x2a2620,[0,.42,1.52],[-Math.PI/2,0,0],[.95,1,1.15]),
   pt(cyl(.05,.05,3.4,6),WD3,[0,1.85,0],[Math.PI/2,0,0]),pt(box(2.4,.04,3.3),0x5a5a4a,[0,.03,0]));for(const e of[-1.62,1.62])p.push(pt(cyl(.04,.04,1.9,5),WD3,[0,.95,e]));
   for(const sd of[-1,1])p.push(pt(cyl(.012,.012,1.5,3),0xd8d0c0,[sd*1.5,.62,1.9],[0,0,sd*.9]));
   const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(r).setPosition(x,0,z));add(chunks,g,x,z);solid(x,z,1.3);solid(x+Math.sin(r)*1.1,z+Math.cos(r)*1.1,1.1);solid(x-Math.sin(r)*1.1,z-Math.cos(r)*1.1,1.1)};
  tent(cx-7,cz-6,.5,0xc9b48a);tent(cx-1,cz-9,-.2,0x8aa07a);
  /* 탁자 + 등 + 카드 */
  {const x=cx+9,z=cz-4;P(lkRb(1.8,.1,1,.03,.02),WD2,x,.84,z);for(const a of[-1,1])for(const b of[-1,1])P(box(.08,.8,.08),WD3,x+a*.78,.4,z+b*.4);for(const a of[-1,1])P(lkRb(1.8,.08,.32,.02,.01),WD,x,.48,z+a*.8);
   P(box(.3,.01,.2),CRM,x-.3,.9,z+.1,0,.4,0);P(box(.3,.01,.2),0xd8503f,x+.2,.9,z-.15,0,-.3,0);lantern(x+.6,.9,z,0,LAMP,8,.9);solid(x,z,1.1);solid(x,z+.85,.5);solid(x,z-.85,.5)}
  /* 해먹(기둥 둘 사이) + 빨랫줄 */
  {const a=[cx-12,cz+6],b=[cx-12,cz+11];for(const p of[a,b]){P(cyl(.1,.12,2.2,8),WD3,p[0],1.1,p[1]);solid(p[0],p[1],.25)}const hm=new THREE.CatmullRomCurve3([new THREE.Vector3(a[0],1.6,a[1]),new THREE.Vector3(a[0],1.0,(a[1]+b[1])/2),new THREE.Vector3(b[0],1.6,b[1])]);P(new THREE.TubeGeometry(hm,10,.2,6,false),0xd8b46a,0,0,0);}
  {const a=[cx+5,cz+9],b=[cx+11,cz+8];for(const p of[a,b]){P(cyl(.06,.07,2,6),WD3,p[0],1,p[1]);solid(p[0],p[1],.2)}P(cyl(.015,.015,6.1,4),0xddd6c8,(a[0]+b[0])/2,1.85,(a[1]+b[1])/2,0,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),Math.PI/2);
   for(let k=0;k<4;k++){const t=.2+k*.2,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;P(box(.5,.62,.03),[0xd8503f,0x3aa6b0,CRM,0xf2c230][k],x,1.5,z,0,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),0)}}
  /* 물통·상자·장작더미 */
  P(cyl(.45,.42,1,12),0x7a5a3a,cx+12,.5,cz+2);P(cyl(.47,.47,.06,12),IRON2,cx+12,.75,cz+2);solid(cx+12,cz+2,.55);
  for(const [dx,dz] of[[-14,-2],[-13,-3.2]])P(lkRb(.9,.8,.9,.06,.03),0xa87846,cx+dx,.4,cz+dz,0,dx,0);solid(cx-13.5,cz-2.6,1);
  for(let n=0;n<8;n++)P(cyl(.14,.14,1.2,6),n%2?0x8a6444:0x9a7454,cx+6+(n%4)*.3,.15+Math.floor(n/4)*.27,cz-11,0,0,Math.PI/2);solid(cx+6.5,cz-11,.9);
  lampPost(cx+14,cz+8,-.6);lampPost(cx-16,cz+4,1.2)}

 /* ===== 지하 호수(북서) ===== */
 {const L=M74.lakes[0];
  /* 작은 나무 선착장 + 노 젓는 배 */
  const dx=L[0]+16,dz=L[1]+12;for(let n=0;n<6;n++)P(unit,n%2?0x9a7050:0x8a6444,dx-n*.55*0,.12,dz-n*.5,0,.6,0,2,.12,.46);for(const sd of[-1,1])P(cyl(.1,.1,1.2,6),WD3,dx+sd*.9,-.2,dz-2.6);
  {const p=[],tn=new THREE.LatheGeometry([[.0,0],[.5,.06],[.62,.24],[.64,.42]].map(([r,h])=>new THREE.Vector2(r,h)),12);p.push(pt(tn,0x8a5a3a,[0,0,0],[0,0,0],[1,1,2.4]),pt(box(1.1,.06,.3),0xa07050,[0,.3,.3]),pt(cyl(.03,.03,2.2,5),WD3,[.5,.45,0],[0,0,1.2]));
   const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(.9).setPosition(dx-3,-.12,dz-4));add(chunks,g,dx-3,dz-4)}
  /* 물가 석순 + 빛나는 물가 */
  for(let n=0;n<34;n++){const a=n/34*6.28+hash(n,1,9)*.2,rr=1.05+hash(n,2,9)*.22,lx=Math.cos(a)*L[2]*rr,lz=Math.sin(a)*L[3]*rr,x=L[0]+lx*L.c-lz*L.s,z=L[1]+lx*L.s+lz*L.c;if(!free(x,z,.6,0))continue;
   const h=.8+hash(n,3,9)*2.2;P(new THREE.ConeGeometry(.45+h*.12,h,6),n%3?0x6f7f8e:0x8a96a2,x,h/2,z,0,n,0);solid(x,z,.45+h*.1)}
  for(let n=0;n<8;n++){const a=n/8*6.28,x=L[0]+Math.cos(a)*L[2]*.6,z=L[1]+Math.sin(a)*L[3]*.6;m74light(x,z,-.2,9,0x4ab8e8,.7)}
  /* 물가 둘레 버섯 몇 개 + 등 */
  lampPost(L[0]+20,L[1]+16,-.8);lampPost(L[0]-14,L[1]+22,.4)}

 /* ===== 수정 동굴(북) ===== */
 const crystalMat=[0x6fe3e0,0xb48cff,0xff8fc8];
 function crystals(x,z,s,ci){const col=crystalMat[ci],n=4+((hash(x|0,z|0,3)*3)|0);for(let k=0;k<n;k++){const a=k/n*6.28+hash(k,x|0,5),r=k?.35*s:0,h=s*(1.6+hash(k,1,z|0)*1.6)*(k?.7:1.2),tilt=k?.45:.08;
   const g=new THREE.CylinderGeometry(.0,.22*s*(k?.8:1.2),h,6);G(g,col,x+Math.cos(a)*r,h/2*.9,z+Math.sin(a)*r,Math.cos(a)*tilt,a,Math.sin(a)*tilt)}
  P(stone,0x4a4460,x,.2,z,0,x,0,.8*s,.35*s,.8*s);halo(col,3.4*s,.5,x,s*1.1,z);m74light(x,z,s*1.2,9*s,col,1.2);solid(x,z,.75*s)}
 {const H=M74.halls[10];const spots=[[-14,-82,2.4,1],[-24,-86,1.5,0],[-4,-74,1.3,2],[-30,-72,1.2,2],[6,-88,1.5,1],[12,-96,1.2,0],[-12,-94,1.1,2],[-38,-82,1.3,1],[2,-68,.9,0],[-24,-64,.8,2],[18,-86,1,2],[-2,-86,.9,0],[-28,-94,1,1],[-42,-74,.9,0],[8,-78,.8,1],[-20,-74,.7,0]];
  for(const [x,z,s,c] of spots)if(free(x,z,.9*s,0))crystals(x,z,s,c);
  /* 벽에 박힌 작은 수정 */
  for(let n=0;n<130;n++){const a=hash(n,1,17)*6.28,r=hash(n,2,17),x=H[0]+Math.cos(a)*H[2]*1.05*Math.sqrt(r+.5),z=H[1]+Math.sin(a)*H[3]*1.05*Math.sqrt(r+.5);const w=m74wAt(x,z);if(w>.4||w<-1.4)continue;
   const c=crystalMat[n%3],h=.8+hash(n,3,17)*2;G(new THREE.CylinderGeometry(0,.2,h,5),c,x,h*.4+.3,z,(hash(n,4,17)-.5)*.8,n,(hash(n,5,17)-.5)*.8);if(n%4===0)m74light(x,z,1,5,c,.8)}}

 /* ===== 버섯 숲(북동) ===== */
 const mushCol=[[0x5fd0ff,0xbfefff],[0x8dff9a,0xe6ffe0],[0xc49bff,0xf1e6ff]];
 function mushroom(x,z,s,ci){const [cc,sp]=mushCol[ci],H=s*(1.6+hash(x|0,z|0,7)*1.2),bend=(hash(z|0,x|0,8)-.5)*.3;
  P(cyl(.14*s,.22*s,H,8),0xe8e0d0,x,H/2,z,bend,0,bend*.6);const cap=new THREE.SphereGeometry(.9*s,14,8,0,6.28,0,Math.PI*.5);G(cap,cc,x+bend*H*.5,H,z,0,0,0,1,.55,1);
  P(new THREE.CylinderGeometry(.86*s,.6*s,.12*s,14),0x2f4a5a,x+bend*H*.5,H-.02,z);for(let k=0;k<5;k++){const a=k*1.3;G(new THREE.SphereGeometry(.1*s,6,4),sp,x+bend*H*.5+Math.cos(a)*.5*s,H+.32*s,z+Math.sin(a)*.5*s)}
  const h=halo(cc,3.6*s,.38,x,H+.2,z);M74.anim.mush.push(h);m74light(x,z,H,8*s,cc,1);solid(x,z,.32*s+.15)}
 {const H=M74.halls[12];const spots=[[54,-76,1.6,0],[66,-64,1.3,1],[74,-80,1.5,2],[60,-88,1.1,1],[82,-66,1.2,0],[48,-66,1,2],[70,-72,.8,0],[88,-80,.9,1],[56,-58,.9,0]];
  for(const [x,z,s,c] of spots)if(free(x,z,.5*s,0))mushroom(x,z,s,c);
  for(let n=0;n<70;n++){const a=hash(n,1,23)*6.28,r=Math.sqrt(hash(n,2,23)),x=H[0]+Math.cos(a)*H[2]*.95*r,z=H[1]+Math.sin(a)*H[3]*.95*r;if(!free(x,z,.25,0))continue;const ci=n%3,s=.22+hash(n,3,23)*.3,[cc]=mushCol[ci];
   P(cyl(.04,.06,s*1.4,5),0xe8e0d0,x,s*.7,z);G(new THREE.SphereGeometry(s*.6,8,5,0,6.28,0,Math.PI*.5),cc,x,s*1.4,z,0,0,0,1,.6,1)}
  for(let n=0;n<10;n++){const a=n*.63,x=H[0]+Math.cos(a)*14,z=H[1]+Math.sin(a)*9;m74light(x,z,.3,7,0x6fdf9a,.45)}}

 /* ===== 채굴장(동) ===== */
 {const H=M74.halls[13];const ore=[[0xf2c230,0xd9a520],[0xc0643a,0x9a4a2a],[0x4fb39a,0x3a8a74],[0x9aa8b8,0x7a8898]];
  /* 벽 광맥: 벽 가까운 곳마다 색 광석 덩어리 */
  for(let n=0;n<90;n++){const a=hash(n,1,29)*6.28,x=H[0]+Math.cos(a)*H[2]*1.02,z=H[1]+Math.sin(a)*H[3]*1.02;const w=m74wAt(x,z);if(w>.6||w<-1.6)continue;const o=ore[n%4],s=.35+hash(n,3,29)*.5;
   P(stone,o[n%2],x,.4+hash(n,4,29)*1.6,z,n,n*.7,0,s,s*.8,s);if(n%4===0)G(new THREE.OctahedronGeometry(s*.35,0),n%8?0xffe08a:0xbff6e6,x,.6+hash(n,5,29)*1.4,z,n,0,0)}
  for(const [x,z,dx,dz] of[[124,-56,0,-1],[142,10,1,0]]){for(let k=0;k<10;k++)P(stone,ore[k%4][0],x+dx*1.6+(hash(k,1,x)-.5)*3,.5+hash(k,2,x)*1.8,z+dz*1.6+(hash(k,3,x)-.5)*3,k,k,0,.6,.5,.6);lantern(x-dx*2+dz*1.8,2.2,z-dz*2+dx*1.8,0,0xffe0a0,8,1)}
  /* 드릴 장비: 바퀴 달린 몸통 + 긴 팔 + 드릴 */
  {const x=106,z=-12,r=-.7,p=[];p.push(pt(lkRb(2.6,1.2,1.8,.1,.05),YEL,[0,1,0]),pt(lkRb(1.2,.9,1.3,.08,.04),0x3a3f44,[-.6,1.9,0]),pt(box(.9,.5,.08),0x9fd3e6,[-.6,2,.66]));
   for(const e of[-1,1])for(const sd of[-1,1])p.push(pt(cyl(.42,.42,.3,12),0x2a2d30,[e*.9,.42,sd*1],[Math.PI/2,0,0]));
   p.push(pt(box(.3,.3,3),0x5a646c,[.9,1.6,1.2],[-.25,0,0]),pt(cyl(.16,.06,1.4,8),0xc8c8c8,[.9,1.1,2.8],[Math.PI/2+.25,0,0]),pt(lkRb(.5,.5,.5,.05,.03),0x3a3f44,[.9,1.25,2.2]));
   const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(r).setPosition(x,0,z));add(chunks,g,x,z);solid(x,z,1.7);solid(x+Math.sin(r)*1.8+Math.cos(r)*.9,z+Math.cos(r)*1.8-Math.sin(r)*.9,.7)}
  /* 광석 무더기·외바퀴 수레·곡괭이 */
  for(const [x,z,o] of[[86,-10,0],[100,12,1],[80,16,2],[110,2,3]]){for(let k=0;k<12;k++)P(stone,ore[o][k%2],x+(hash(k,1,x)-.5)*2.4,.25+hash(k,2,x)*.5,z+(hash(k,3,x)-.5)*2,k,k,0,.42,.32,.4);solid(x,z,1.4)}
  {const x=92,z=14,p=[];p.push(pt(lkRb(1,.5,1.4,.08,.04),0x3f6f8a,[0,.75,0],[.1,0,0]),pt(cyl(.3,.3,.12,12),0x2a2d30,[0,.32,.85],[0,0,Math.PI/2]));for(const sd of[-1,1])p.push(pt(box(.06,.06,1.6),WD3,[sd*.38,.7,-.6],[-.15,0,0]),pt(box(.05,.5,.05),IRON2,[sd*.38,.3,-.4]));const g=mg(p);g.applyMatrix4(new THREE.Matrix4().makeRotationY(.6).setPosition(x,0,z));add(chunks,g,x,z);solid(x,z,.8)}
  for(const [x,z,r] of[[96,-14,.3],[84,8,-.5]]){P(cyl(.04,.05,1.3,6),WD3,x,.65,z,0,r,.35);P(box(.9,.1,.12),0x8a9aa6,x+.25,1.25,z,0,r,.35)}
  /* 작업등(삼발이 + 밝은 등) */
  for(const [x,z,a] of[[98,-20,.6],[78,-4,-.8],[112,10,2.4],[88,22,-2.2]]){for(let k=0;k<3;k++){const b=k*2.09;P(cyl(.04,.04,2.6,5),IRON,x+Math.cos(b)*.45,1.2,z+Math.sin(b)*.45,Math.sin(b)*.2,0,-Math.cos(b)*.2)}
   P(lkRb(.6,.45,.35,.05,.03),YEL,x,2.6,z,0,a,0);G(box(.48,.32,.04),0xfff6d8,x+Math.sin(a)*.19,2.6,z+Math.cos(a)*.19,0,a,0);halo(0xfff6d8,3,.55,x+Math.sin(a)*.3,2.6,z+Math.cos(a)*.3);m74light(x+Math.sin(a)*4,z+Math.cos(a)*4,2.2,13,0xfff2d8,1.25);solid(x,z,.5)}
  /* 비계(벽 쪽 발판) */
  {const x0=78,z0=-20;for(let k=0;k<4;k++){const x=x0+k*2.2;P(box(.1,3,.1),IRON,x,1.5,z0);P(box(.1,3,.1),IRON,x,1.5,z0-1.2);solid(x,z0,.2);solid(x,z0-1.2,.2)}for(const y of[1.4,2.8])P(box(6.8,.1,1.3),WD2,x0+3.3,y,z0-.6);P(box(6.8,.06,.06),YEL,x0+3.3,3.2,z0)}}

 /* ===== 갈림길 표지판(화살표: 노랑 = 입구, 파랑 = 호수·수정, 초록 = 버섯·채굴장) ===== */
 const signpost=(x,z,arms)=>{P(cyl(.07,.09,2.2,6),WD3,x,1.1,z);arms.forEach(([a,c],n)=>{const g=mg([pt(lkRb(1.1,.24,.06,.03,.02),c,[.45,0,0]),pt(new THREE.ConeGeometry(.17,.3,3),c,[1.05,0,0],[0,0,-Math.PI/2])]);g.applyMatrix4(new THREE.Matrix4().makeRotationY(a).setPosition(x,1.9-n*.34,z));add(chunks,g,x,z)});solid(x,z,.2)};
 /* 각도: 0 = 동(+x), π/2 = 북(−z), −π/2 = 남(+z), π = 서 */
 signpost(-6,46,[[-Math.PI/2,YEL],[Math.PI*.62,0x3aa6b0],[Math.PI*.12,0x6aae4c]]);signpost(-38,8,[[0,YEL],[Math.PI,0xe0a050]]);signpost(52,12,[[Math.PI,YEL],[0,0x6aae4c]]);

 /* ===== 채굴장 더: 분쇄기·광석 자루·짐 실은 광차 ===== */
 cart(digSpur,.55,true,0xc0643a);cart(mainLine,.93,true,0x9aa8b8);
 {const x=82,z=-8;P(lkRb(2.6,1.8,2.2,.1,.05),0x3f6f8a,x,.9,z);P(cyl(1.3,.5,1.2,4),0x5a646c,x,2.4,z,0,Math.PI/4,0);P(cyl(.5,.5,2.4,10),0x2f3338,x,.9,z+1.25,0,0,Math.PI/2);for(let k=0;k<6;k++)P(box(.4,.08,.08),YEL,x-1+k*.4,1.85,z+1.12,0,0,(k%2?.7:-.7));
  for(let k=0;k<8;k++)P(stone,0x7a6a5a,x+(hash(k,1,8)-.5)*1.6,.2,z+2.2+hash(k,2,8)*.8,k,k,0,.3,.22,.3);solid(x,z,1.7);lantern(x-1.6,2.2,z+1.4,0,0xffe0a0,9,1)}
 for(const [x,z] of[[102,14],[103,15.2],[101.6,15.6],[104.2,14.4]]){P(new THREE.IcosahedronGeometry(.5,1),0xc8b48a,x,.42,z,0,x,0,1,.85,.9);P(cyl(.14,.2,.18,7),0xb09a70,x,.86,z)}solid(103,15,1.4);
 /* ===== 방마다 바닥 꾸밈(테마에 맞게): 웅덩이·돌무더기·상자·통·판자·석순·이끼 ===== */
 const puddle=(x,z,sz)=>{P(new THREE.CircleGeometry(1,14),0x232c36,x,.025,z,-Math.PI/2,0,0,sz*1.4,sz,1);G(new THREE.CircleGeometry(1,10),0x34495a,x+.25*sz,.03,z-.18*sz,-Math.PI/2,0,0,sz*.55,sz*.22,1)};
 const crate=(x,z,r,s=1)=>{P(lkRb(.9*s,.8*s,.9*s,.06,.03),[0xa87846,0x946a40,0xb88a52][Math.abs(x*7|0)%3],x,.4*s,z,0,r,0);P(box(.92*s,.08,.92*s),0x6a4a30,x,.6*s,z,0,r,0);solid(x,z,.62*s)};
 const barrel=(x,z,c)=>{P(cyl(.4,.38,1.05,12),c,x,.53,z);for(const y of[.22,.84])P(cyl(.41,.41,.07,12),0x3a3a3e,x,y,z);solid(x,z,.45)};
 const planks=(x,z,r)=>{for(let k=0;k<5;k++)P(box(.34,.07,2.6),k%2?0xa57a53:0x936a46,x+Math.cos(r)*(k-2)*.36,.04+(k%2)*.07,z-Math.sin(r)*(k-2)*.36,0,r,0);solid(x,z,1.1)};
 const pebbles=(x,z,s)=>{for(let k=0;k<5;k++)P(stone,k%2?0x5e5866:0x6e6876,x+(hash(k,x|0,2)-.5)*s*1.6,s*.25,z+(hash(k,z|0,2)-.5)*s*1.6,k,k,0,s*.5,s*.4,s*.45);solid(x,z,s*.75)};
 const stalag=(x,z,h,c)=>{P(new THREE.ConeGeometry(.3+h*.14,h,6),c,x,h/2,z,0,x,0);P(new THREE.ConeGeometry(.18+h*.08,h*.55,6),c,x+.5,h*.27,z+.2,0,z,0);solid(x,z,.35+h*.12)};
 const moss=(x,z,s)=>{P(new THREE.SphereGeometry(1,10,6,0,6.28,0,Math.PI/2),0x3f7a44,x,0,z,0,0,0,s*1.2,s*.35,s);P(new THREE.SphereGeometry(1,8,5,0,6.28,0,Math.PI/2),0x5a9a52,x+.3*s,0,z-.2*s,0,0,0,s*.6,s*.3,s*.5)};
 M74.halls.forEach((h,hi)=>{const th=h[5],n=Math.round(h[2]*h[3]*Math.PI/190);let put=0;for(let q=0;q<n*4&&put<n;q++){const a=hash(hi,q,91)*6.28,r=Math.sqrt(hash(hi,q,93))*.88,lx=Math.cos(a)*h[2]*r,lz=Math.sin(a)*h[3]*r,x=h[0]+lx*h.c-lz*h.s,z=h[1]+lx*h.s+lz*h.c,k=hash(hi,q,97);
  if(!free(x,z,1.3,2.6))continue;put++;
  if(th===6){k<.45?puddle(x,z,.8+k):stalag(x,z,1+k*3,k<.7?0x6f7f8e:0x8a96a2)}
  else if(th===7){k<.3?stalag(x,z,1+k*3.5,0x7a6e96):k<.75?crystals(x,z,.45+k*.4,(q%3)):pebbles(x,z,.7+k*.4)}
  else if(th===8){k<.5?moss(x,z,.8+k*1.2):k<.7?puddle(x,z,.7+k*.6):pebbles(x,z,.6+k*.5)}
  else{k<.18?puddle(x,z,.7+k*2):k<.36?pebbles(x,z,.6+k):k<.52?crate(x,z,k*9,.8+k*.4):k<.62?barrel(x,z,[0x6a7a5a,0x8a4a3a,0x4a6a7a][q%3]):k<.72?planks(x,z,k*7):k<.8&&th!==3?(crate(x,z,k*5),crate(x+.7,z+.4,k*3,.7)):0}}});
 /* ===== 벽가 부스러기 돌(방마다) ===== */
 for(const [hi,h] of M74.halls.entries()){for(let n=0;n<22;n++){const a=hash(hi,n,41)*6.28,r=.75+.3*hash(hi,n,43),x=h[0]+h[2]*r*Math.cos(a),z=h[1]+h[3]*r*Math.sin(a);const w=m74wAt(x,z);if(w<.2||w>2.4||railNear(x,z,2))continue;
   const s=.18+.5*hash(hi,n,47);for(let k=0;k<3;k++)P(stone,k?0x4e4a58:0x68626e,x+hash(n,k,31)*1.2,.08,z+hash(n,k,13),0,a+k,0,s,.16+k*.08,s*.8)}}
 /* 바닥 자갈 무늬(어두운 얼룩) — 레일이 없는 방 가운데 */
 /* ===== 덩어리 합치기 + 빛 굽기 ===== */
 const mat=m74mat({emissive:0x0e0c12}),gmat=new THREE.MeshBasicMaterial({vertexColors:true});
 for(const parts of chunks.values()){const g=mg(parts);m74bake(g,.06);C.add(new THREE.Mesh(g,mat))}
 for(const parts of glowCh.values()){const g=mg(parts);C.add(new THREE.Mesh(g,gmat))}
 m74terrain(C);
 M74.built=performance.now()-t0;
}
/* 아무 점의 걷기 값(보간) — 소품 자리 고르기용 */
function m74wAt(x,z){if(!M74.W)m74sample();const c=M74.c,u=x/c,v=z/c,i=Math.floor(u),j=Math.floor(v);if(i<M74.I0||i>=M74.I1||j<M74.J0||j>=M74.J1)return-9;const W=M74.W,dx=u-i,dz=v-j,a=W[m74idx(i,j)],cc=W[m74idx(i+1,j+1)];
 return dx<dz?a*(1-dz)+W[m74idx(i,j+1)]*(dz-dx)+cc*dx:a*(1-dx)+W[m74idx(i+1,j)]*(dx-dz)+cc*dz}
caveRoom=caveRoom74;
/* 빛: 동굴 안은 어둡게, 캐릭터 둘레는 따뜻한 손전등 빛 */
{const _il=intLight;intLight=function(dk){_il(dk);if(INT.kind==='cave'&&INT.on){hemi.intensity=.42;hemi.color.setRGB(.7,.74,1);hemi.groundColor.setRGB(.22,.2,.3);sun.intensity=.32;sun.color.setRGB(.95,.92,1);
  INT.L.color.setHex(0xffd9a8);INT.L.distance=12;INT.L.intensity=1.25;INT.L.position.set(P.x-INT.x,2.6,P.z-INT.z+.6);scene.background.setRGB(.035,.032,.045)}}}
/* 움직임: 모닥불 깜박임, 빛 기둥 먼지, 버섯 빛 숨쉬기 */
{const _iu=intUpd;intUpd=function(){_iu();if(!INT.on||INT.kind!=='cave')return;const t=performance.now()/1000;
 M74.anim.fire.forEach((f,i)=>{if(f.isSprite)f.material.opacity=.45+.12*Math.sin(t*9.3)+.06*Math.sin(t*23);else{f.scale.y=1+.18*Math.sin(t*(8+i*3)+i);f.scale.x=f.scale.z=1+.06*Math.sin(t*11+i)}});
 M74.anim.dust.forEach(d=>{const b=d.userData.b,k=d.userData.k;d.position.set(b.x+Math.sin(t*.3+k)*.6,b.y+((t*.25+k)%3)-1.5,b.z+Math.cos(t*.27+k)*.6)});
 M74.anim.mush.forEach((h,i)=>{h.material.opacity=.3+.12*Math.sin(t*1.3+i*1.7)});if(M74.shaft)M74.shaft.material.opacity=.38+.05*Math.sin(t*.7)}}
