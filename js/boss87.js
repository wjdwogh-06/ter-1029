/* 87차(디자인, 기획자 11-27 19:42): '동굴 안에 보스몹을 추가했는데 구조물에 계속 껴서 잘 안 움직이고 공격도 안 해' — 거대 동굴게(86차 mobs86.js) 고치기.
   mobs86.js 다음에 읽어요(index.html). 이 파일을 빼면 86차 그대로예요.
   까닭 셋:
   ① 돌아다닐 방 자리(N.pts)가 격자 칸 가운데가 아니라 그냥 좌표라 소품(권양탑 기둥 등) 안에 박힌 자리가 있었어요 → 거기서 생기거나 거기로 가면
      한 걸음도 못 떼요(지금 자리가 막혀 있으면 어느 쪽 걸음도 '막힘'). 중앙 광장 자리 [1,7]이 그랬어요.
   ② 길 찾기 격자(1.5m 칸)는 칸 가운데만 0.8m로 재고, 걸음은 아무 데서나 같은 0.8m로 재서 칸과 칸 사이에서 막혀 제자리걸음(뒤로 126°까지 꺾어 가며 떨림).
      몸은 폭 약 6m인데 부딪힘은 0.8m라 소품·벽에 몸이 파묻혀 보였어요.
   ③ 관리자(개발자) 모드에서는 보스가 아예 덤비지 않았어요(때려도 그대로) — 기획자는 관리자 모드로 시험해요.
   고친 것:
   - 몸 크기에 맞는 부딪힘: 벽은 반지름 1.25m(둘레 8점이 모두 바닥), 소품은 반지름 1.35m로 '밀어내기'(부딪히면 멈추지 않고 옆으로 미끄러져 돌아가요). 뒤로는 안 걸어요.
   - 길 찾기 격자는 그보다 넉넉하게(벽 2.05m·소품 1.8m) 재서 칸 사이에서도 막히지 않고, 방 자리는 그 격자의 칸 가운데로.
   - 그래도 2초 넘게 거의 못 움직이면 가장 가까운 넓은 칸으로 빠져나와 길을 다시 찾아요(생겼을 때 박혀 있어도 같아요).
   - 관리자 모드에서도 보이면·맞으면 덤비고 집게질·바위 던지기를 해요. 무적이라 피해는 안 받고 '-46 무적' 숫자만 떠요.
   - 쫓다가 포기: 42m 넘게 8초 → 맞은 지 8초 안이거나 60m 안이면 계속 쫓아요(멀리서 쏴도 따라와요). */
const B87={rw:1.3,rs:1.5,navW:1.8,navS:.35,stuckT:2,stuckD:.6};
function b87Floor(x,z,r){if(!mineFloorAt(x,z))return false;for(let k=0;k<8;k++){const a=k*Math.PI/4;if(!mineFloorAt(x+Math.cos(a)*r,z+Math.sin(a)*r))return false}return true}
/* 소품(원)에서 밀어내기: 겹치면 바깥으로 */
function b87Push(x,z,r){for(let it=0;it<3;it++){let moved=false;const i0=Math.floor((x-r-4)/8),i1=Math.floor((x+r+4)/8),j0=Math.floor((z-r-4)/8),j1=Math.floor((z+r+4)/8);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=M74.solids.get(i+','+j);if(!L)continue;for(const s of L){const dx=x-s[0],dz=z-s[1],R=s[2]+r,d2=dx*dx+dz*dz;if(d2>=R*R)continue;
    const d=Math.sqrt(d2)||1e-3,k=(R-d+.01)/d;x+=dx*k;z+=dz*k;moved=true}}if(!moved)break}return[x,z]}
const b87Clear=(lx,lz)=>b87Floor(lx,lz,B87.rw)&&!m74hitSolid(lx,lz,B87.rs-.05)&&!m86Forb(lx,lz);
/* 길 찾기 격자: 넓은 칸(2) = 벽 B87.navW·소품 B87.rs+B87.navS 넉넉히, 좁은 칸(1) = 몸이 겨우 지나가는 곳(좁은 갱도) — 길은 넓은 칸으로 다니고 좁은 칸은 꼭 필요할 때만(비용 4배) */
m86Nav=function(){const c=M74.c,I0=M74.I0,J0=M74.J0,nI=M74.nI,nJ=M74.nJ,W=new Uint8Array(nI*nJ);let n=0;
 for(let i=0;i<nI;i++)for(let j=0;j<nJ;j++){const x=(i+I0)*c,z=(j+J0)*c;if(m86Forb(x,z)||!b87Floor(x,z,B87.rw+.05)||m74hitSolid(x,z,B87.rs+.05))continue;
  W[i*nJ+j]=b87Floor(x,z,B87.navW)&&!m74hitSolid(x,z,B87.rs+B87.navS)?2:1}
 const comp=new Int32Array(W.length).fill(-1);let bestC=-1,bestN=0;for(let q=0,nc=0;q<W.length;q++){if(!W[q]||comp[q]>=0)continue;const st=[q];comp[q]=nc;let sz=0;
  while(st.length){const u=st.pop();sz++;const ui=(u/nJ)|0,uj=u%nJ;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=ui+di,b=uj+dj;if(a<0||b<0||a>=nI||b>=nJ)continue;const v=a*nJ+b;if(W[v]&&comp[v]<0){comp[v]=nc;st.push(v)}}}
  if(sz>bestN){bestN=sz;bestC=nc}nc++}
 for(let q=0;q<W.length;q++)if(W[q]&&comp[q]!==bestC)W[q]=0;else if(W[q])n++;
 const N={c,I0,J0,nI,nJ,W,n,pts:[]};
 /* 방 자리 = 그 방 안 넓은 칸 중 방 가운데에 가장 가까운 '칸 가운데' */
 M74.halls.forEach((h,k)=>{if(k<2)return;let best=null,bd=1e9;const R=Math.max(h[2],h[3]);
  for(let i=Math.floor((h[0]-R)/c)-I0;i<=Math.ceil((h[0]+R)/c)-I0;i++)for(let j=Math.floor((h[1]-R)/c)-J0;j<=Math.ceil((h[1]+R)/c)-J0;j++){if(i<0||j<0||i>=nI||j>=nJ||W[i*nJ+j]!==2)continue;
   const x=(i+I0)*c,z=(j+J0)*c,dx=x-h[0],dz=z-h[1],ux=dx*h.c+dz*h.s,uz=-dx*h.s+dz*h.c;if(Math.hypot(ux/h[2],uz/h[3])>.8)continue;const d=Math.hypot(dx,dz);if(d<bd){bd=d;best=[x,z,k]}}
  if(best)N.pts.push(best)});
 return N};
/* A*: 86차와 같고, 좁은 칸은 4배 비용 */
m86Path=function(N,ax,az,bx,bz){const s=m86NearCell(N,ax,az,4),g=m86NearCell(N,bx,bz,8);if(s<0||g<0)return null;if(s===g)return[[bx,bz]];
 const nJ=N.nJ,W=N.W,G=new Float32Array(W.length).fill(1e9),F=new Int32Array(W.length).fill(-1),cl=new Uint8Array(W.length),H=[],gi=(g/nJ)|0,gj=g%nJ;
 const hf=q=>{const di=Math.abs(((q/nJ)|0)-gi),dj=Math.abs(q%nJ-gj);return Math.max(di,dj)+.414*Math.min(di,dj)};
 const push=(f,q)=>{H.push([f,q]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}};
 const pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b<H.length&&H[b][0]<H[m][0])m=b;if(m===i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
 G[s]=0;push(hf(s),s);let it=0;
 while(H.length&&it++<500000){const[,q]=pop();if(cl[q])continue;cl[q]=1;if(q===g)break;const qi=(q/nJ)|0,qj=q%nJ;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const ni=qi+di,nj=qj+dj;if(ni<0||nj<0||ni>=N.nI||nj>=nJ)continue;const r=ni*nJ+nj;if(!W[r]||cl[r])continue;
   if(di&&dj&&(!W[qi*nJ+nj]||!W[ni*nJ+qj]))continue;const ng=G[q]+(di&&dj?1.414:1)*(W[r]===2?1:4);if(ng<G[r]){G[r]=ng;F[r]=q;push(ng+hf(r),r)}}}
 if(F[g]<0)return null;const out=[];for(let q=g;q!==s&&q>=0;q=F[q])out.push([(((q/nJ)|0)+N.I0)*N.c,(q%nJ+N.J0)*N.c]);out.reverse();out.push([bx,bz]);return out};
/* 곧게 가도 되는지(86차 m86Clear): 넓은 칸만 지나야 곧게 가요 — 좁은 칸·벽 옆은 길을 따라요 */
m86Clear=function(N,ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.7);for(let k=1;k<=n;k++){const u=k/n,q=m86Cell(N,lerp(ax,bx,u),lerp(az,bz,u));if(q<0||N.W[q]!==2&&!(k===n&&N.W[q]))return false}return true};
/* 걸음(보스만): 앞·조금 옆으로만(뒤로 안 감), 벽은 막힘, 소품은 밀어내며 미끄러짐 */
{const _st=m86Step;m86Step=function(e,ang,sp,dt){if(!(e.cave&&e.boss))return _st.apply(this,arguments);const step=sp*dt;if(step<=0)return false;const ox=INT.x+MINE.ox,oz=INT.z+MINE.oz,fx=Math.sin(ang),fz=Math.cos(ang);
  for(const off of[0,.35,-.35,.7,-.7,1.1,-1.1]){const a=ang+off*e.side;let lx=e.x-ox+Math.sin(a)*step,lz=e.z-oz+Math.cos(a)*step;
   if(!b87Floor(lx,lz,B87.rw)||m86Forb(lx,lz))continue;[lx,lz]=b87Push(lx,lz,B87.rs);if(!b87Floor(lx,lz,B87.rw)||m86Forb(lx,lz))continue;
   const mx=lx+ox-e.x,mz=lz+oz-e.z;if(mx*fx+mz*fz<step*.12)continue;if(Math.hypot(mx,mz)>step*1.6)continue;
   e.x=lx+ox;e.z=lz+oz;e.mvA=Math.atan2(mx,mz);return true}
  e.side=-e.side;return false}}
/* 빠져나오기: 가장 가까운 열린 칸 가운데(12m 안) */
function b87FreeSpot(e){const N=M86.cave.nav;if(!N)return null;const lx=e.x-INT.x-MINE.ox,lz=e.z-INT.z-MINE.oz,ci=Math.round(lx/N.c)-N.I0,cj=Math.round(lz/N.c)-N.J0,k=Math.ceil(12/N.c);let best=-1,bd=1e9;
 for(let i=ci-k;i<=ci+k;i++)for(let j=cj-k;j<=cj+k;j++){if(i<0||j<0||i>=N.nI||j>=N.nJ)continue;const w=N.W[i*N.nJ+j];if(!w)continue;const d=(i-ci)**2+(j-cj)**2+(w===2?0:9);if(d<bd){bd=d;best=i*N.nJ+j}}
 if(best<0)return null;return[(((best/N.nJ)|0)+N.I0)*N.c,(best%N.nJ+N.J0)*N.c]}
/* 맞으면 기억(관리자 모드에서도 덤비게) */
{const _he=hurtEnemy;hurtEnemy=function(e,d,dx,dz){if(e&&e.boss&&e.cave&&!e.dead){e.b87hit=8;if(!e.agg&&INT.on&&INT.kind==='cave'&&!P.dead){e.agg=1;e.path=null;e.lost=0}}return _he.apply(this,arguments)}}
/* 보스 생각 감싸기 */
{const _ai=m86BossAI;m86BossAI=function(e,dt,dp,T){
  if(e.b87hit>0)e.b87hit-=dt;
  /* 빠져나오는 중이면 그것만(부딪힘 없이 천천히) */
  if(e.b87out){const ox=INT.x+MINE.ox,oz=INT.z+MINE.oz,tx=e.b87out[0]+ox,tz=e.b87out[1]+oz,d=dist(e.x,e.z,tx,tz),st=Math.min(d,3.2*dt);
   if(d<.15||(e.b87outT-=dt)<0){e.b87out=null;e.path=null}else{e.x+=(tx-e.x)/d*st;e.z+=(tz-e.z)/d*st;m86Face(e,Math.atan2(tx-e.x,tz-e.z)+Math.PI/2,2,dt);e.a.spd=1.6;return}}
  /* 지금 자리가 막혀 있으면(생길 때·밀려서) 바로 빠져나와요 */
  const lx0=e.x-INT.x-MINE.ox,lz0=e.z-INT.z-MINE.oz;if(!b87Floor(lx0,lz0,B87.rw-.2)||m74hitSolid(lx0,lz0,B87.rs-.45)){const q=b87FreeSpot(e);if(q){e.b87out=q;e.b87outT=4;return}}
  /* 쫓다가 너무 일찍 포기하지 않게 */
  if(e.agg&&(e.b87hit>0||dp<60))e.lost=0;
  /* 보스가 못 가는 곳(좁은 옆굴 등)에 있으면 입구 둘레처럼: 앞에서 지켜보다 돌아가요(집게가 닿으면 그대로 때려요) */
  const N=M86.cave.nav,plx=P.x-INT.x-MINE.ox,plz=P.z-INT.z-MINE.oz,unreach=e.agg&&N&&dp>5&&m86NearCell(N,plx,plz,4)<0;
  /* 관리자 모드: 덤비되 피해는 숫자만 */
  const dev=DEV.on,fb=m86Forb,hp=hurtPlayer;let r;
  if(unreach)m86Forb=(x,z)=>(x===plx&&z===plz)||fb(x,z);
  if(dev){DEV.on=false;hurtPlayer=function(d){if(!P.dead)ftext(P.x,groundY(P.x,P.z)+3,P.z,'-'+d+' 무적','#ffd27a')}}
  try{r=_ai.apply(this,arguments)}finally{DEV.on=dev;hurtPlayer=hp;m86Forb=fb}
  /* 못 움직이는지 보기: 움직이려는데 2초 동안 0.6m도 못 갔으면 빠져나와요 */
  const want=e.mv==='go_rock'||(!!e.path&&!e.mv&&!(e.a.atkT>0))||(e.agg&&dp>4.6&&!e.mv&&!(e.a.atkT>0)&&!unreach&&!m86Forb(plx,plz));
  if(!want){e.b87w=0;e.b87p=[e.x,e.z]}else{if(!e.b87p)e.b87p=[e.x,e.z];e.b87w=(e.b87w||0)+dt;
   if(e.b87w>B87.stuckT){const m=dist(e.x,e.z,e.b87p[0],e.b87p[1]);e.b87w=0;e.b87p=[e.x,e.z];if(m<B87.stuckD){const q=b87FreeSpot(e);if(q&&Math.hypot(q[0]-(e.x-INT.x-MINE.ox),q[1]-(e.z-INT.z-MINE.oz))>.3){e.b87out=q;e.b87outT=4}else{e.path=null;e.side=-e.side}}}}
  return r}}
