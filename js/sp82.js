/* ===== 82차(규칙, 기획자 11-25 22:07): 물개섬 특수 보급지 다시 — 더 크게 · 자연스러운 바위 절벽 =====
   기획자: '가운데쯤 아래 특수 보급지(벽으로 둘러싸여 있고 안에 보급) 크기 좀 더 키워 주고, 벽 퀄리티가 별로야 —
           동북섬 대각선 산장은 엄청 잘 만들었던데, 지형지물도 좀만 더 신경 써 봐, 일관성을 항상 유지해 주고'.
   - 크기: core.js SPSUP — 바깥 28×22m → 35×26m, 분지 21×15m → 28×19m, 테두리 높이 1.9 → 2.1m(서버도 같은 땅).
   - places.js의 plCrater·plWornSP를 바꿔 끼워요(그 파일 줄은 안 고침). 걷는 높이(spSurf)·경사로·계단·보이지 않는 벽 방식은 9차 그대로.
   - 벽: 층층이 똑같이 쌓인 띠 → 바위 덩어리 기둥(칸마다 튀어나오고 들어감) + 불규칙한 턱(이끼) + 발치가 넓은 절벽,
         위는 풀 덮개가 둥글게 늘어지고 덩굴이 군데군데. 색은 81차 식물섬 바위 언덕·게임 바위와 같은 바위색.
   - 지형지물: 발치 바위 무리, 테두리 위 바위 봉우리 둘(못 올라감), 테두리 풀·꽃, 바깥 나무 무리, 동쪽 바다 바위.
   - 경사로·계단: 산장 기단처럼 쌓은 돌 옹벽·돌 디딤판 + 둥근 통나무 난간.
   - 분지: 넓어진 만큼 특수 보급 상자 3개(sp0~sp2), 군용 소품은 예전 것 그대로 넓게 놓아요. */
const SP82={};
const SP82C={rock:[0x84818e,0x938f9c,0x9f9ca7,0x8c8996],rockD:0x5d5a68,moss:[0x6f9a48,0x5f8f3e,0x7aa64e],lip:[0x5f9a3c,0x568f36,0x4f8a3c],
 stn:[0x9aa1a8,0x7f868d,0xa9aeb3,0x8a9097],stnL:[0xb3aea3,0xa8a397,0xbdb8ad],mortar:0x5e5a54,log:[0xa8683a,0x9a5e33,0xb47340],logD:0x7a4b2e};
const sp82Arc=L=>{const N=L.length,c=[0];for(let i=1;i<=N;i++){const a=L[i-1],b=L[i%N];c.push(c[i-1]+Math.hypot(b.x-a.x,b.z-a.z))}return c};
const sp82M=(a,n)=>((a%n)+n)%n;
const sp82Shd=(h,v)=>{PLC.setHex(h);PLC.r=Math.min(1,PLC.r*v);PLC.g=Math.min(1,PLC.g*v);PLC.b=Math.min(1,PLC.b*v);return PLC.getHex()};
/* 두 점을 잇는 둥근 통나무(난간) */
function sp82Log(p,a,b,r,c){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L)),e=new THREE.Euler().setFromQuaternion(q);
 p.push(pt(cyl(r,r,L,8),c,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[e.x,e.y,e.z]))}

/* ---------- 바위 절벽 한 면 ----------
   L = plRRect2 둘레, out = 1이면 바깥(+n)을 보는 면, -1이면 분지 쪽(-n)을 보는 면. y0 발치, y1 꼭대기(풀 덮개 바로 밑),
   kf(i) = 1 보통, 0 = 경사로·계단이 붙는 곳(곧게), lipO = 꼭대기 풀 덮개가 튀어나온 만큼. 칸(약 1.75m)마다 튀어나옴·턱 높이·물러남이 달라요. */
function sp82Face(g,L,X,Z,out,y0,y1,sd,kf,lipO){
 const N=L.length,cum=sp82Arc(L),CW=1.75,H=y1-y0,col=new THREE.Color(),c2=new THREE.Color();
 const cellOf=s=>s/CW+noise(s*.29,sd*1.7,sd+801)*.9;
 const prm=c=>[(hash(c,sd,811)-.5)*.36,.3+hash(c,sd,812)*.38,hash(c,sd,813)<.3?.02:.1+hash(c,sd,813)*.2,hash(c,sd,814),.85+hash(c,sd,815)*.4];
 const G=[],T=[];
 for(let i=0;i<=N;i++){const ii=i%N,p=L[ii],s=cum[i],f=cellOf(s),c=Math.floor(f),w=sm(.8,1,f-c),A=prm(c),B=prm(c+1),q=A.map((v,j)=>v+(B[j]-v)*w),[off,uL,rec,tone,bulge]=q,k=kf(ii),dx=p.nx*out,dz=p.nz*out;
  const rows=[[-.18,.34],[0,.3],[uL*.45,.14*bulge],[uL-.03,.05],[uL+.04,-rec],[uL+(1-uL)*.5,-rec*.55+.05*bulge],[.93,-.04],[1,lipO-.1]],row=[];
  for(let r=0;r<rows.length;r++){const [u,o]=rows[r],inner=r>0&&r<7,nz=inner?(noise(s*.6,u*2.4+sd,sd+816)-.5)*.2:0,d=r===7?o:k*(o+off*(1-.45*u)+nz)+(1-k)*(r===0?.12:.02);
   const y=r===7?y1:y0+H*u+(inner?(noise(s*.8+3,u*3,sd+817)-.5)*.1*k:0);row.push([X+p.x+dx*d,y,Z+p.z+dz*d])}
  G.push(row);T.push([tone,c,k,dx,dz])}
 const R=G[0].length;
 for(let i=0;i<N;i++){const [tone,c,k,dx,dz]=T[i];for(let r=0;r<R-1;r++){const a=G[i][r],b=G[i+1][r],cc=G[i+1][r+1],d=G[i][r+1],um=((a[1]+d[1])/2-y0)/H;
   const ledge=r===3,top=r===6,mo=hash(c,sd,820)>.45,crev=T[i+1]&&T[i+1][1]!==c;col.setHex(SP82C.rock[(tone*4)|0]);
   if(r<=1)col.lerp(c2.setHex(SP82C.rockD),.35);
   if(ledge&&k>.5&&mo)col.lerp(c2.setHex(SP82C.moss[c%3]),.8);else if(ledge)col.lerp(c2.setHex(SP82C.rock[2]),.4);else if(top&&mo&&hash(c,i,818)>.4)col.lerp(c2.setHex(SP82C.moss[(c+1)%3]),.4);
   col.convertSRGBToLinear();const v=lerp(.62,1.06,clamp(um,0,1))*(.84+tone*.26)*(.95+hash(i,r,819)*.08)*(crev&&!ledge?.78:1),cl=[col.r*v,col.g*v,col.b*v];
   g.quad(a,b,cc,d,cl,cl,cl,cl,ledge?[dx*.4,1,dz*.4]:top?[dx,.7,dz]:[dx,.05,dz])}}
 return G}

/* ---------- 테두리 위 풀 덮개 + 둥글게 늘어진 가장자리 ---------- */
function sp82Cap(O,I,X,Z,Hr,fo,fi){const N=O.length,M=I.length,t=new PLGeo(),s=new PLGeo(),UP=[0,1,0];
 const oE=O.map((p,i)=>{const o=.16+plWave(p.t,1,.16)+(noise(p.x*.5,p.z*.5,826)-.5)*.14;return[X+p.x+p.nx*o*fo(i)+(1-fo(i))*p.nx*.04,Hr,Z+p.z+p.nz*o*fo(i)+(1-fo(i))*p.nz*.04]});
 const iE=I.map((p,i)=>{const o=(-.14+plWave(p.t,5,.08))*fi(i);return[X+p.x+p.nx*o,Hr,Z+p.z+p.nz*o]});
 /* 윗면: 바깥 둘레 점마다 가장 가까운 안쪽 점으로 이어 띠를 만들어요(둘레 점 수가 달라도) */
 const gcv=q=>{const n=noise(q[0]*.32,q[2]*.32,821),n2=noise(q[0]*1.1,q[2]*1.1,822);PLC.setHex(0x74b545).lerp(SP82.c1||(SP82.c1=new THREE.Color(0x6ea844)),sm(.35,.7,n)).lerp(SP82.c2||(SP82.c2=new THREE.Color(0x86c454)),sm(.6,.85,n2)*.5).convertSRGBToLinear();const v=.95+n2*.08;return[PLC.r*v,PLC.g*v,PLC.b*v]},near=q=>{let b=0,bd=1e9;for(let j=0;j<M;j++){const d=(iE[j][0]-q[0])**2+(iE[j][2]-q[2])**2;if(d<bd){bd=d;b=j}}return b};
 const map=oE.map(near),gO=oE.map(gcv),gI=iE.map(gcv);
 for(let i=0;i<N;i++){const j=(i+1)%N,a=map[i],b=map[j];t.quad(iE[a],iE[b],oE[j],oE[i],gI[a],gI[b],gO[j],gO[i],UP);
  if(a!==b){let k=a;const end=b;let guard=0;while(k!==end&&guard++<M){const k2=(k+1)%M;t.tri(iE[k],iE[k2],oE[i],gI[k],gI[k2],gO[i],UP);k=k2}}}
 const cap=mesh(t.build(),TERR);cap.receiveShadow=true;scene.add(cap);
 /* 늘어진 풀: 아래 끝이 들쭉날쭉(풀 다발) */
 const drape=(E,L,sg,fk,sd)=>{const n=E.length;for(let i=0;i<n;i++){const j=(i+1)%n,p=L[i],q=L[j],k0=fk(i),k1=fk(j),d0=(.2+hash(i,sd,822)*.26)*(.35+.65*k0),d1=(.2+hash(j,sd,822)*.26)*(.35+.65*k1),
   a=E[i],b=E[j],a2=[a[0]+p.nx*sg*.05,a[1]-d0,a[2]+p.nz*sg*.05],b2=[b[0]+q.nx*sg*.05,b[1]-d1,b[2]+q.nz*sg*.05],m=[(a[0]+b[0])/2+(p.nx+q.nx)*sg*.04,Hr-.05,(a[2]+b[2])/2+(p.nz+q.nz)*sg*.04],
   c0=plCol(SP82C.lip[i%3],.95+hash(i,sd,823)*.1),c1=plCol(SP82C.lip[2],.8),dir=[p.nx*sg,.1,p.nz*sg];s.tri(a,b,m,c0,c0,c0,[p.nx*sg,1,p.nz*sg]);s.quad(a,b,b2,a2,c0,c0,c1,c1,dir)}};
 drape(oE,O,1,fo,1);drape(iE,I,-1,fi,2);
 const dm=mesh(s.build(40),PLM2());dm.castShadow=true;scene.add(dm);return{oE,iE}}

/* ---------- 쌓은 돌 옹벽(산장 기단처럼): x0~x1, 아래 yb, 위 top(x), 앞면 z(앞쪽 +z를 봄) ---------- */
function sp82Stones(p,x0,x1,yb,top,z,sd,ch=.27){let j=0;for(let y=yb;;y+=ch,j++){let any=false,x=x0+(j%2?-.28:0);
  while(x<x1){const L=.46+hash(j,(x*10)|0,sd)*.38,xa=Math.max(x,x0),xb=Math.min(x+L,x1),xc=(xa+xb)/2;x+=L;if(xb-xa<.2)continue;if(y+ch*.9>top(xc)-.05)continue;any=true;
   const c=sp82Shd(SP82C.stn[sp82M(j*3+((xc*7)|0),4)],.93+hash(j,(xc*9)|0,sd+1)*.13);p.push(pt(lkRb(xb-xa-.06,ch-.055,.16,.045,.03),c,[xc,y+ch/2,z+.06]))}
  if(!any&&y>yb+ch)break;if(y>20)break}}

/* ---------- 작은 풀 다발·꽃(테두리·분지 장식) ---------- */
function sp82Tuft(p,x,y,z,s,sd){const G=[0x6ea844,0x7fbf4e,0x5f9a3c];for(let k=0;k<5;k++){const a=k*1.26+sd,r=.05*s,h=(.28+hash(k,sd,824)*.22)*s;p.push(pt(new THREE.ConeGeometry(.045*s,h,4),G[(k+sd)%3],[x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r],[(hash(k,sd,825)-.5)*.5,a,(hash(k,sd,826)-.5)*.5]))}}
function sp82Flower(p,x,y,z,c,sd){const h=.26+hash(sd,1,827)*.14;p.push(pt(cyl(.012,.014,h,4),0x5f9a3c,[x,y+h/2,z]),pt(new THREE.IcosahedronGeometry(.06,0),c,[x,y+h+.02,z]),pt(new THREE.IcosahedronGeometry(.025,0),0xffe27a,[x,y+h+.06,z]))}

/* ========== 특수 보급지 짓기 (places.js plCrater 바꿔 끼우기) ========== */
plCrater=function(){const S2=SPSUP,R=S2.rp,T=S2.st,X=S2.x,Z=S2.z,G=S2.h,Hr=G+S2.top,Hb=G-S2.dig,NO=300,NI=240;
 const O=plRRect2(S2.AX,S2.AZ,S2.ac,NO),I=plRRect2(S2.BX,S2.BZ,S2.bc,NI),rz0=S2.AZ+R.z0,rz1=rz0+R.w;
 const fo=i=>{const p=O[i];return p.nz>.7&&p.x>R.x0-1.6&&p.x<R.x2+1.0?0:p.nz>.7&&p.x>R.x0-3.2&&p.x<R.x2+2.4?.5:1};   /* 경사로가 붙는 앞면은 곧게 */
 const fi=i=>{const p=I[i];return p.nz<-.7&&p.x>T.x0-1.0&&p.x<T.x2+.9?0:p.nz<-.7&&p.x>T.x0-2.4&&p.x<T.x2+2.2?.5:1};   /* 계단이 붙는 뒤 벽은 곧게 */
 /* 1) 절벽 두 면 */
 {const g=new PLGeo();sp82Face(g,O,X,Z,1,G-.3,Hr-.04,3,fo,.18);sp82Face(g,I,X,Z,-1,Hb-.28,Hr-.04,7,fi,.14);const m=mesh(g.build(34),PLM2());m.castShadow=true;m.receiveShadow=true;m.userData.layoutName='특수 보급지 절벽';scene.add(m)}
 /* 2) 풀 덮개 */
 sp82Cap(O,I,X,Z,Hr,fo,fi);
 /* 3) 앞 경사로: 서쪽(땅)에서 동쪽(꼭대기)으로. 흙길 + 쌓은 돌 옹벽 + 통나무 난간 */
 const hy=x=>x>=R.x1?Hr+.02:Math.max(G+.03,G+(Hr+.02-G)*clamp((x-R.x0)/(R.x1-R.x0),0,1));
 {const xs=[];for(let x=R.x0;x<R.x2-.05;x+=.8)xs.push(x);xs.push(R.x1,R.x2);xs.sort((a,b)=>a-b);
  const t=new PLGeo(),zs=[rz0-.15,rz0+.5,rz0+1.2,(rz0+rz1)/2,rz1-1.2,rz1-.5,rz1],cc=(k,i)=>plCol(k===0||k===6?0x8f7a54:k===2||k===4?0x9e865c:0xa98f63,.95+hash(i,k,831)*.08);
  for(let i=0;i<xs.length-1;i++){const xa=xs[i],xb=xs[i+1];for(let k=0;k<zs.length-1;k++)t.quad([X+xa,hy(xa),Z+zs[k]],[X+xb,hy(xb),Z+zs[k]],[X+xb,hy(xb),Z+zs[k+1]],[X+xa,hy(xa),Z+zs[k+1]],cc(k,i),cc(k,i+1),cc(k+1,i+1),cc(k+1,i),[0,1,0])}
  {const c=plCol(0xa98f63);t.quad([X+R.x1,Hr+.02,Z+S2.AZ-.8],[X+R.x2,Hr+.02,Z+S2.AZ-.8],[X+R.x2,Hr+.02,Z+rz0-.15],[X+R.x1,Hr+.02,Z+rz0-.15],c,c,c,c,[0,1,0])}
  const rm=mesh(t.build(),TERR);rm.receiveShadow=true;scene.add(rm);
  /* 옹벽 뒤판(줄눈 색) + 돌 + 경사를 따라 놓인 갓돌 */
  const w=new PLGeo(),yb=G-.35,mc=plCol(SP82C.mortar);for(let i=0;i<xs.length-1;i++){const xa=xs[i],xb=xs[i+1];w.quad([X+xa,yb,Z+rz1],[X+xb,yb,Z+rz1],[X+xb,hy(xb)-.06,Z+rz1],[X+xa,hy(xa)-.06,Z+rz1],mc,mc,mc,mc,[0,0,1])}
  w.quad([X+R.x2,yb,Z+rz0-.15],[X+R.x2,yb,Z+rz1],[X+R.x2,Hr,Z+rz1],[X+R.x2,Hr,Z+rz0-.15],mc,mc,mc,mc,[1,0,0]);scene.add(mesh(w.build(),PLM2()));
  const p=[];sp82Stones(p,R.x0+.15,R.x2-.05,yb,x=>hy(x),rz1,841);
  {const zz=[rz0-.1,rz1];for(let z=zz[0]+.05;z<zz[1]-.1;z+=.62){const L=Math.min(.58,zz[1]-z-.04);for(let y=yb,j=0;y<Hr-.2;y+=.27,j++)p.push(pt(lkRb(.16,.215,L-.06,.045,.03),SP82C.stn[sp82M(j+((z*5)|0),4)],[R.x2+.06,y+.135,z+L/2]))}}
  const sl=Math.atan((Hr-G)/(R.x1-R.x0));for(let x=R.x0+.35;x<R.x1-.3;x+=.82)p.push(pt(lkRb(.86,.13,.42,.05,.03),SP82C.stnL[sp82M((x*3)|0,3)],[x+.41,hy(x+.41)-.03,rz1-.06],[0,0,sl]));
  for(let x=R.x1;x<R.x2-.1;x+=.88)p.push(pt(lkRb(.9,.13,.42,.05,.03),SP82C.stnL[sp82M((x*3)|0,3)],[x+.44,Hr-.02,rz1-.06]));
  /* 통나무 난간: 둥근 기둥(갓) + 두 줄 */
  const px=[];for(let x=R.x0+1.3;x<R.x2-.2;x+=1.7)px.push(x);px.push(R.x2-.22);
  px.forEach((x,i)=>{const y=hy(x);p.push(pt(cyl(.075,.085,1.05,8),SP82C.log[i%3],[x,y+.5,rz1-.24]),pt(cyl(.095,.095,.06,8),SP82C.logD,[x,y+1.04,rz1-.24]));if(i){const x0=px[i-1],y0=hy(x0);sp82Log(p,[x0,y0+.95,rz1-.24],[x,y+.95,rz1-.24],.055,SP82C.log[0]);sp82Log(p,[x0,y0+.52,rz1-.24],[x,y+.52,rz1-.24],.045,SP82C.log[1])}});
  for(const z of[rz0+.6,(rz0+rz1)/2+.2])p.push(pt(cyl(.075,.085,1.05,8),SP82C.log[2],[R.x2-.22,Hr+.5,z]),pt(cyl(.095,.095,.06,8),SP82C.logD,[R.x2-.22,Hr+1.04,z]));
  for(const y of[.52,.95])sp82Log(p,[R.x2-.22,Hr+y,rz0+.6],[R.x2-.22,Hr+y,rz1-.24],.05,SP82C.log[0]);
  const g2=mg(p);lkSmooth(g2,40);plAdd(g2,X,0,Z)}
 /* 4) 뒤 돌계단: 분지 뒤 벽에 붙어 서쪽 꼭대기 마루에서 동쪽으로 내려가요. 돌 디딤판 + 앞면 쌓은 돌 + 통나무 난간 */
 {const zb=-S2.BZ-.3,zf=-S2.BZ+T.w,n=12,yb=Hb-.3,p=[],d=(T.x2-T.x1)/n,sy=x=>x<=T.x1?Hr:Hb+(Hr-Hb)*(1-clamp((x-T.x1)/(T.x2-T.x1),0,1)),stepTop=k=>Hr-(Hr-Hb)*(k+.5)/n+.02;
  /* 몸통(줄눈 색 뒤판) */
  p.push(pt(lkRb(T.x1-T.x0+.02,Hr-yb,zf-zb,.06,.04),SP82C.mortar,[(T.x0+T.x1)/2,(yb+Hr)/2,(zb+zf)/2]));
  for(let k=0;k<n;k++){const xc=T.x1+(k+.5)*d,ty=stepTop(k);p.push(pt(lkRb(d+.02,ty-yb-.04,zf-zb-.04,.04,.03),SP82C.mortar,[xc,yb+(ty-yb-.04)/2,(zb+zf)/2]))}
  /* 디딤판(밝은 돌, 살짝씩 다른 크기) + 꼭대기 마루 판석 */
  for(let k=0;k<n;k++){const xc=T.x1+(k+.5)*d,ty=stepTop(k);p.push(pt(lkRb(d+.06,.11,zf-zb+.04,.04,.03),SP82C.stnL[k%3],[xc+(hash(k,1,842)-.5)*.04,ty-.02,(zb+zf)/2+.03],[0,(hash(k,2,842)-.5)*.04,0]))}
  for(let x=T.x0+.02;x<T.x1-.1;x+=.95)for(let z=zb+.05;z<zf-.1;z+=1.05)p.push(pt(lkRb(Math.min(.92,T.x1-x-.04),.1,Math.min(1.0,zf-z-.03),.04,.03),SP82C.stnL[sp82M((x+z)*3|0,3)],[x+Math.min(.92,T.x1-x-.04)/2,Hr-.01,z+Math.min(1.0,zf-z-.03)/2]));
  /* 앞면(분지 쪽, 카메라에 보이는 옆모습)과 서쪽 끝: 쌓은 돌 */
  sp82Stones(p,T.x0+.05,T.x2-.05,yb,x=>x<=T.x1?Hr-.06:stepTop(Math.min(n-1,Math.floor((x-T.x1)/d)))-.12,zf-.02,843);
  {for(let z=zb+.3;z<zf-.1;z+=.62){const L=Math.min(.58,zf-z-.03);for(let y=yb,j=0;y<Hr-.25;y+=.27,j++)p.push(pt(lkRb(.16,.215,L-.06,.045,.03),SP82C.stn[sp82M(j+((z*5)|0),4)],[T.x0-.06,y+.135,z+L/2]))}}
  /* 통나무 난간: 분지 쪽 가장자리 + 마루 서쪽 끝 */
  const px=[T.x0+.25];for(let x=T.x1;x<T.x2-.4;x+=1.6)px.push(x);px.push(T.x2-.42);
  px.forEach((x,i)=>{const y=sy(x);p.push(pt(cyl(.07,.08,1.0,8),SP82C.log[i%3],[x,y+.48,zf-.18]),pt(cyl(.09,.09,.06,8),SP82C.logD,[x,y+.99,zf-.18]));if(i){const x0=px[i-1],y0=sy(x0);sp82Log(p,[x0,y0+.92,zf-.18],[x,y+.92,zf-.18],.052,SP82C.log[0]);sp82Log(p,[x0,y0+.5,zf-.18],[x,y+.5,zf-.18],.042,SP82C.log[1])}});
  p.push(pt(cyl(.07,.08,1.0,8),SP82C.log[1],[T.x0+.25,Hr+.48,zb+.55]),pt(cyl(.09,.09,.06,8),SP82C.logD,[T.x0+.25,Hr+.99,zb+.55]));for(const y of[.5,.92])sp82Log(p,[T.x0+.25,Hr+y,zb+.55],[T.x0+.25,Hr+y,zf-.18],.048,SP82C.log[0]);
  const sg=mg(p);lkSmooth(sg,40);plAdd(sg,X,0,Z)}
 /* 5) 바위: 바깥 발치 무리(부딪힘), 분지 안 벽 밑, 테두리 위 봉우리 둘(못 올라감), 동쪽 바다 바위 */
 const RK=SP82C.rock,rk=[],cols=[];let ri=0;const B=(r,x,y,z,sy=.8,c)=>rk.push(lkBoulder(r,c===undefined?RK[ri%4]:c,ri++*3+1,[x,y,z],sy));
 {const cum=sp82Arc(O);let next=0;for(let i=0;i<NO;i++){const p=O[i];if(fo(i)<1)continue;if(p.nz>.5&&p.x>R.x0-3.4&&p.x<R.x2+2.6)continue;if(cum[i]<next)continue;
   const h0=hash(i,1,851);next=cum[i]+2.2+h0*2.6;const o=.95+hash(i,2,851)*.55,r=.42+hash(i,3,851)*.42,x=p.x+p.nx*o,z=p.z+p.nz*o,gy=hAt(X+x,Z+z);
   if(gy<.2)continue;B(r,x,gy-.2,z,.78+hash(i,4,851)*.25);if(r>.55)cols.push([x,z,r*.62]);
   if(h0>.55){const a=hash(i,5,851)>.5?1:-1;B(r*.55,x+p.nz*a*r*1.1+p.nx*.3,hAt(X+x,Z+z)-.12,z-p.nx*a*r*1.1+p.nz*.3,.7)}
   if(h0>.8)B(r*.38,x+p.nx*(r+.2),hAt(X+x,Z+z)-.08,z+p.nz*(r+.2),.6)}}
 for(const [x,z,r] of [[-12.9,7.9,.62],[-13.2,6.6,.38],[12.6,7.6,.55],[13.1,-4.2,.42],[-4.6,8.7,.34],[7.6,-8.5,.4],[12.7,6.4,.3],[-12.8,-3.0,.36]]){B(r,x,Hb-.08,z,.8);if(r>.5)cols.push([x,z,r*.6])}
 /* 테두리 위 바위 봉우리: 앞 동쪽 모서리 · 동쪽 가운데 */
 const crag=(cx,cz,sz,sd)=>{const n=5;for(let k=0;k<n;k++){const a=k*1.3+sd,r=(k?.72:1.25)*sz*(.85+hash(k,sd,852)*.3),o=k?.75*sz:0;B(r,cx+Math.cos(a)*o,Hr-.12+(k?0:.1),cz+Math.sin(a)*o*.8,k?.95:1.25,RK[(k+sd)%4])}B(.62*sz,cx+.2,Hr+.95*sz,cz-.1,1.0,RK[2]);cols.push([cx,cz,1.25*sz])};
 crag(S2.AX-1.75,S2.AZ-1.9,1,1);crag(S2.AX-1.7,-1.2,.9,2);
 /* 절벽 면에 반쯤 박힌 바위 덩어리(면이 밋밋하지 않게) */
 const lumps=(L,sg,fk,yb,sd)=>{const cum=sp82Arc(L);let next=0;for(let i=0;i<L.length;i++){if(fk(i)<1||cum[i]<next)continue;const h=hash(i,sd,871);next=cum[i]+2.0+h*2.2;if(h<.2)continue;
   const p=L[i],r=.4+hash(i,sd,872)*.34,u=.28+hash(i,sd,873)*.38,y=yb+(Hr-yb)*u-r*.62,o=.04+r*.1;B(r,p.x+p.nx*sg*o,y,p.z+p.nz*sg*o,1.05,RK[(i+sd)%4]);
   if(h>.75)B(r*.55,p.x+p.nx*sg*(o+.05)+p.nz*r*.9,y+r*.8,p.z+p.nz*sg*(o+.05)-p.nx*r*.9,.95,RK[(i+sd+1)%4])}};
 lumps(O,1,fo,G-.3,11);lumps(I,-1,fi,Hb-.28,13);
 /* 동쪽 바다 바위(물에 있을 때만) */
 for(const [x,z,r] of [[S2.AX+6.5,-6,1.0],[S2.AX+8.2,1.4,.75],[S2.AX+6.2,8.4,.85],[S2.AX+4.4,15.4,.7],[S2.AX+9.4,-1.2,.45]]){const gy=hAt(X+x,Z+z);if(gy>-.15)continue;B(r,x,gy-.1,z,.95);B(r*.5,x+r*.8,gy-.1,z+r*.3,.8)}
 {const g=mg(rk);lkSmooth(g,60);plAdd(g,X,0,Z)}
 for(const [x,z,r] of cols)addStruct({t:PLB(r,r),x:X+x,z:Z+z,r:0,hp:1e9});
 /* 6) 덩굴(바깥 앞면·분지 뒤 벽) */
 {const v=new PLGeo(),hang=(L,i,sg,len,sd)=>{const p=L[i],q=L[(i+2)%L.length],x0=X+p.x+p.nx*sg*.2,z0=Z+p.z+p.nz*sg*.2,x1=X+q.x+q.nx*sg*.2,z1=Z+q.z+q.nz*sg*.2,n=4;let prev=null;
   for(let k=0;k<=n;k++){const t=k/n,y=Hr-.1-len*t,w=.5*(1-t*.6),mx=(x0+x1)/2,mz=(z0+z1)/2,ox=(x1-x0)*w/2,oz=(z1-z0)*w/2,wob=Math.sin(t*5+sd)*.08,cur=[[mx-ox+p.nx*sg*(.06+wob),y,mz-oz+p.nz*sg*(.06+wob)],[mx+ox+p.nx*sg*(.06+wob),y,mz+oz+p.nz*sg*(.06+wob)]];
    if(prev){const c=plCol(SP82C.lip[(k+sd)%3],.9+hash(k,sd,853)*.15);v.quad(prev[0],prev[1],cur[1],cur[0],c,c,c,c,[p.nx*sg,0,p.nz*sg])}prev=cur}};
  for(let i=0;i<NO;i+=7)if(fo(i)===1&&O[i].nz>-.3&&hash(i,1,854)>.62)hang(O,i,1,.7+hash(i,2,854)*1.1,i);
  for(let i=0;i<NI;i+=6)if(fi(i)===1&&I[i].nz<-.3&&hash(i,3,854)>.55)hang(I,i,-1,.6+hash(i,4,854)*1.0,i);
  scene.add(mesh(v.build(),PLM2()))}
 /* 7) 테두리 풀·꽃, 분지 가장자리 풀, 바깥 나무·덤불 */
 {const p=[],FL=[0xff6b6b,0xffd35c,0xf7f0e3,0xb38cff,0xff9ac2],cr=[[S2.AX-1.75,S2.AZ-1.9,1.9],[S2.AX-1.7,-1.2,1.7]];
  for(let i=0;i<NO;i+=3){const p0=O[i],a=hash(i,1,855),o=-.35-a*1.5,x=p0.x+p0.nx*o,z=p0.z+p0.nz*o;if(spOut(X+x,Z+z)>-.2||spIn(X+x,Z+z)<.25)continue;if(cr.some(([cx,cz,rr])=>Math.hypot(x-cx,z-cz)<rr))continue;
   if(a<.62)sp82Tuft(p,x,Hr,z,.8+hash(i,2,855)*.6,i);else sp82Flower(p,x,Hr,z,FL[i%5],i)}
  for(let i=0;i<NI;i+=4){const q=I[i];if(fi(i)<1)continue;const o=-.5-hash(i,5,855)*.4,x=q.x+q.nx*o,z=q.z+q.nz*o;if(hash(i,6,855)<.5)sp82Tuft(p,x,Hb,z,.9,i+3)}
  const g=mg(p);plAdd(g,X,0,Z)}
 {const v=[],put=(k,x,z,s,ry,y)=>{if(!GEO[k])return;v.push(pt(GEO[k],null,[x,y===undefined?hAt(X+x,Z+z)-.05:y,z],[0,ry,0],[s,s,s]))};
  const TR=[['tree_single_A',-S2.AX-4.2,-4.5,3.0],['tree_single_B',-S2.AX-3.6,1.8,2.7],['tree_single_A',-S2.AX-5.6,-.8,2.4],['tree_single_B',-6.4,-S2.AZ-4.2,2.9],['tree_single_A',-1.6,-S2.AZ-5.0,3.2],['tree_single_A',5.6,-S2.AZ-4.0,2.6],['tree_single_B',10.4,-S2.AZ-3.8,2.5],
   ['tree_single_A',-S2.AX-1.6,-S2.AZ-1.8,2.6],['tree_single_B',S2.AX-2.2,-S2.AZ+1.9,2.4,Hr-.06],['tree_single_A',9.2,S2.AZ-1.75,2.2,Hr-.06]];
  for(const [k,x,z,s,y] of TR){if(y===undefined&&hAt(X+x,Z+z)<.9)continue;put(k,x,z,s,hash(x*7|0,z*7|0,856)*6,y);addStruct({t:PLB(.32,.32),x:X+x,z:Z+z,r:0,hp:1e9})}
  for(const [x,z,s,y] of [[-S2.AX-1.4,4.6,.7],[-S2.AX-1.2,-8.6,.66],[S2.AX+1.2,-6.6,.6],[-9.2,-S2.AZ-1.4,.62],[8.4,-S2.AZ-1.3,.58],[-S2.AX-2.2,9.2,.7],[-12.6,S2.AZ-1.4,.5,Hr-.04],[6.8,-S2.AZ+1.7,.5,Hr-.04],[-4.4,-S2.AZ+1.6,.46,Hr-.04],
   [-12.2,7.4,.5,Hb-.04],[12.4,-3.0,.44,Hb-.04],[-12.6,-5.2,.42,Hb-.04]])if(y!==undefined||hAt(X+x,Z+z)>.9)put('bush',x,z,s,hash(x*9|0,z*9|0,857)*6,y);
  if(v.length)plAdd(mg(v),X,0,Z)}
 /* 8) 테두리: 감시탑(뒤 동쪽 모서리) · 깃발(뒤 서쪽) · 가장자리 바위 */
 {const tx=S2.AX-2.2,tz=-S2.AZ+2.1,tw=plAdd(plTowerGeo(),X+tx,Hr-.02,Z+tz,-.12);for(const [lx,lz] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const c=Math.cos(-.12),s=Math.sin(-.12);addStruct({t:PLB(.14,.14),x:X+tx+lx*c+lz*s,z:Z+tz-lx*s+lz*c,r:0,hp:1e9})}
  const l=glow(0xffc46a,2.6,.6);l.position.set(X+tx,Hr+4.7,Z+tz);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l);
  const lan=mesh(mg([pt(lkRb(.2,.26,.2,.05,.03),0xffd58a,[0,0,0])]),typeof LKGLOW!=='undefined'?LKGLOW:MATT);lan.position.set(X+tx,Hr+4.75,Z+tz);scene.add(lan)}
 {const fx=7.5,fz=-S2.AZ+1.75,f=plFlagGeo();plAdd(f.pole,X+fx,Hr-.02,Z+fz);plAdd(f.cloth,X+fx,Hr-.02,Z+fz,0,PLM2());addStruct({t:PLB(.18,.18),x:X+fx,z:Z+fz,r:0,hp:1e9})}
 /* 테두리 안쪽 가장자리·윗면: 반쯤 묻힌 바위(밧줄 울타리 대신 자연스럽게) */
 {const q=[],cum=sp82Arc(I);let next=0;for(let k=0;k<NI;k++){if(fi(k)<1||cum[k]<next)continue;const h0=hash(k,1,861);next=cum[k]+2.4+h0*3.2;const a=I[k],o=.32+hash(k,2,861)*.3,r=.22+hash(k,3,861)*.24;
   q.push(lkBoulder(r,RK[k%4],k*3+5,[a.x+a.nx*o,Hr-r*.32,a.z+a.nz*o],.75));if(h0>.6)q.push(lkBoulder(r*.6,RK[(k+1)%4],k*3+6,[a.x+a.nx*(o+r*.9),Hr-r*.25,a.z+a.nz*(o+r*.9)],.6))}
  for(let k=0;k<26;k++){const t=hash(k,4,861),p0=O[(t*NO)|0],w=.45+hash(k,5,861)*.4,x=p0.x-p0.nx*(.9+w*(S2.AX-S2.BX-1.6)),z=p0.z-p0.nz*(.9+w*(S2.AX-S2.BX-1.6));if(spOut(X+x,Z+z)>-.5||spIn(X+x,Z+z)<.5)continue;
   const r=.45+hash(k,6,861)*.45;q.push(lkBoulder(r,RK[k%4],k*7+9,[x,Hr-r*.22,z],.32))}
  const g=mg(q);lkSmooth(g,60);plAdd(g,X,0,Z)}
 /* 9) 경사로 아래: 경고 간판 + 가로등 둘 */
 {const sx=R.x0-3.0,sz=rz1+1.6,b=plAdd(plBoardGeo(),X+sx,hAt(X+sx,Z+sz)-.02,Z+sz,.2),t=plSignText('⚠ 특수 보급지',2.3,.46,70);t.position.set(0,1.32,.08);b.add(t);addStruct({t:PLB(1.3,.14),x:X+sx,z:Z+sz,r:.2,hp:1e9})}
 const lamp=(x,z,y,ry)=>{if(!GEO.plamp)return;plAdd(GEO.plamp,X+x,y,Z+z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(X+x+Math.sin(ry)*.5,y+2.75,Z+z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s);addStruct({t:PLB(.14,.14),x:X+x,z:Z+z,r:0,hp:1e9})};
 lamp(R.x0-.9,rz1+.75,G-.02,Math.PI/2);lamp(R.x2-.6,rz0+.38,Hr,-Math.PI/2);
 /* 10) 분지 바닥: 떨어진 보급(낙하산·주황 고깔), 위장망 그늘 + 무전 탁자, 천막, 발전기, 탄약 팔레트, 드럼통, 모래주머니, 신호등 */
 {const v=[],add=(k,x,z,ry=0,s=1,y=Hb)=>{if(GEO[k])v.push(pt(GEO[k],null,[x,y,z],[0,ry,0],[s,s,s]))};
  add('chute',-4.2,-1.6,.5,1.3);
  const cg=plConeGeo();for(let k=0;k<9;k++){const a=-.35+k*.74,x=.3+Math.cos(a)*4.9,z=.4+Math.sin(a)*3.8;v.push(pt(cg,null,[x,Hb,z],[0,a,0]))}
  add('suptent',9.8,-6.6,0,1.1);add('lk_pallet',-11.2,-1.4,.1,1);add('ammostack',-11.2,-1.4,.2,1.1,Hb+.16);add('jerry',-9.7,-.5,.5);add('jerry',-9.3,-.1,1.2);add('tarppile',5.4,-4.6,.3,1.15);
  add('ammostack',-10.0,-2.2,1.5,.9,Hb);
  add('lk_drum_1',11.9,-1.4,.2,.95);add('lk_drum_0',11.5,-.6,1.2,.95);add('lk_drum_2',12.3,-.5,2.0,.95);add('lk_gen',10.9,1.5,-1.57,1);
  for(const [x,z] of [[3.6,4.6],[-3.6,5.4],[-7.4,-2.8],[6.4,-1.2]])v.push(pt(GEO.flarecan||cg,null,[x,Hb,z],[Math.PI/2,0,hash(x*9|0,1,3)*6],[1,1,1]));
  const g=mg(v);plAdd(g,X,0,Z)}
 {const sx=7.6,sz=5.0,sh=plShadeGeo(3.8,2.8,2.25);plAdd(sh.poles,X+sx,Hb,Z+sz);plAdd(sh.net,X+sx,Hb,Z+sz,0,PLM2()).castShadow=true;plAdd(plTableGeo(),X+sx,Hb,Z+sz-.1,0);
  for(const [x,z] of[[-1.9,-1.4],[1.9,-1.4],[-1.9,1.4],[1.9,1.4]])addStruct({t:PLB(.08,.08),x:X+sx+x,z:Z+sz+z,r:0,hp:1e9});addStruct({t:PLB(.85,.45),x:X+sx,z:Z+sz-.1,r:0,hp:1e9});
  const p=[];plBar(p,[10.4,Hb+.05,1.6],[9.0,Hb+.03,3.4],.035,0x2c3346);plBar(p,[9.0,Hb+.03,3.4],[8.5,Hb+.78,4.6],.03,0x2c3346);plAdd(mg(p),X,0,Z)}
 {plAdd(plSandbagGeo(6),X-7.8,Hb,Z+5.9,.35);addStruct({t:PLB(1.75,.24),x:X-7.8,z:Z+5.9,r:.35,hp:1e9});plAdd(plSandbagGeo(5),X+3.0,Hb,Z+7.4,-.12);addStruct({t:PLB(1.45,.24),x:X+3.0,z:Z+7.4,r:-.12,hp:1e9})}
 for(const [x,z,bx,bz,r] of [[9.8,-6.6,1.85,1.0,0],[-11.2,-1.4,.65,.55,.1],[5.4,-4.6,.68,.52,.3],[11.9,-.9,.75,.75,0],[10.9,1.5,.45,.62,0],[-9.5,-.3,.35,.35,0]])addStruct({t:PLB(bx,bz),x:X+x,z:Z+z,r,hp:1e9});
 {const C=[[-1.4,2.1,.15],[2.5,.7,-.25],[-.3,-2.5,.55]];C.forEach(([x,z,r],i)=>{const c=addStruct({t:'spsupply',x:X+x,z:Z+z,r});c.li='sp'+i})}
 {const b=addStruct({t:'spbeacon',x:X-12.1,z:Z+6.6,r:0,hp:1e9}),s=glow(0xff8a3d,3.6,.7);s.position.set(b.x,Hb+3.25,b.z);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s)}
 for(const [x,z,r] of [[-12.4,3.0,1.2],[6.4,-8.0,-.3],[12.9,4.2,-1.4]])addStruct({t:'suplamp',x:X+x,z:Z+z,r});
 /* 11) 보이지 않는 벽: 바깥 절벽(경사로 꼭대기 마루 빼고), 안쪽 절벽(계단 자리 빼고), 경사로 바깥·끝, 계단 앞·꼭대기 끝·테두리 쪽 */
 const contour=(f,v)=>{const pts=[];for(let a=0;a<=360;a+=.35){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);let lo=0,hi=30;for(let k=0;k<26;k++){const m=(lo+hi)/2;f(X+dx*m,Z+dz*m)<v?lo=m:hi=m}pts.push([X+dx*lo,Z+dz*lo])}return pts};
 const runWalls=(pts,cut)=>{const keep=pts.map(([x,z])=>!cut(x-X,z-Z)),runs=[];let cur=[];
  pts.forEach((q,i)=>{if(keep[i])cur.push(q);else if(cur.length){runs.push(cur);cur=[]}});if(cur.length){if(runs.length&&keep[0])runs[0]=cur.concat(runs[0]);else runs.push(cur)}
  for(const Rn of runs){let L=0;const cum=[0];for(let i=1;i<Rn.length;i++){L+=Math.hypot(Rn[i][0]-Rn[i-1][0],Rn[i][1]-Rn[i-1][1]);cum.push(L)}
   const n=Math.max(1,Math.ceil(L/1.6));for(let k=0;k<=n;k++){const u=L*k/n;let i=1;while(i<Rn.length-1&&cum[i]<u)i++;const a=Rn[i-1],b=Rn[i],t=clamp((u-cum[i-1])/((cum[i]-cum[i-1])||1),0,1);
    addStruct({t:'iblk',x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,r:Math.atan2(-(b[1]-a[1]),b[0]-a[0]),hp:1e9})}}};
 runWalls(contour(spOut,.28),(x,z)=>z>0&&x>R.x1-.95&&x<R.x2+.95);
 runWalls(contour(spIn,-.28),(x,z)=>z<0&&x>T.x0-1.35&&x<T.x2+.95);
 plWallSeg(X+R.x0+1.8,Z+rz1+.4,X+R.x2+.8,Z+rz1+.4);plWallSeg(X+R.x2+.4,Z+S2.AZ-.2,X+R.x2+.4,Z+rz1+.4);   /* 경사로 바깥 · 꼭대기 동쪽 끝 */
 plWallSeg(X+T.x1,Z-S2.BZ-.28,X+T.x2+1.2,Z-S2.BZ-.28);plWallSeg(X+T.x0-.4,Z-S2.BZ-.9,X+T.x0-.4,Z-S2.BZ+T.w+.8);plWallSeg(X+T.x0-.8,Z-S2.BZ+T.w+.4,X+T.x2-.45,Z-S2.BZ+T.w+.4);   /* 계단 테두리 쪽 · 꼭대기 서쪽 끝 · 계단 앞 */
 CLEARS.push([X,Z+2,27]);SP82.ok=1};

/* 경사로 아래에서 서쪽으로 나가는 닳은 흙길 */
plWornSP=function(ex,ez){const S=SPSUP,R=S.rp;if(ex<R.x0-16||ex>R.x0+5||ez<S.AZ-2||ez>S.AZ+12)return 0;const z1=S.AZ+R.z0+R.w;
 const d=plSegD(ex,ez,[[R.x0+1.6,S.AZ+2.0],[R.x0-1.4,z1+.8],[R.x0-5.0,z1+1.6],[R.x0-9.0,z1+1.2],[R.x0-13.5,z1-.4]]);return clamp((1-sm(.6,2.3,d))*.8*(.75+noise(ex*.6,ez*.6,79)*.5),0,1)};
/* 설치 금지 원: 넓어진 만큼 */
{const _bn=buildNoBuild;buildNoBuild=function(){_bn();const n=NOB.find(q=>q.k==='sp');if(n){n.x=SPSUP.x;n.z=SPSUP.z+1.8;n.r=Math.hypot(SPSUP.AX,SPSUP.AZ+SPSUP.rp.z0+SPSUP.rp.w)+3.2}}}
