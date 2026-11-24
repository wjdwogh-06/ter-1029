'use strict';
/* ===== 73차(디자인, 기획자 11-23 21:07) =====
   ① 조약돌섬(333,141)·안개섬(865,417): 섬 전체가 특수 보급지. 섬을 다 덮는 빨간 설치 금지 원, 특수 보급 상자 6개,
      경계병(새 적 '경계병' sentry, 소총·철모)이 모래주머니 초소 네 곳에서 지켜요. 감시탑·깃발·신호등·천막·무전 책상·낙하산·드럼통·경고판.
      경계병: 플레이어가 섬 둘레 100m 안이면 나타나고 130m 밖이면 사라져요(살아 있는 수는 기억). 섬 위(또는 바로 앞 물)에서 18m 안이면
      같은 섬 경계병이 다 같이 덤비고, 섬을 떠나면 초소로 돌아가요. 쓰러뜨리면 실제 시간 20분 뒤 다시 서 있어요(임시).
   ② 깊은 바다(기획자: '해안가에서 대략 10m, 10캐릭터 정도. 가다가 다른 섬과 애매하게 만나면 깊은 바다는 만들되 얕은 바다 판정을 후하게'):
      땅(높이 0 위)에서 10m 넘게 떨어진 바다 = 깊은 바다. 좁은 물길에서 생기는 폭 12m 아래 깊은 띠는 얕은 바다로 쳐요(열림 연산, 반지름 6m)
      → 섬 사이 물길이 약 32m보다 좁으면 다 얕은 바다. 강·작은 만은 저절로 얕은 바다.
      74차(기획자 11-23 22:16: '등대 주변 제외하고 나머지 모든 섬들 해안가 기준으로 깊은 바다를 10m에서 30m로'): 섬 해안에서 30m,
      등대가 서 있는 바위섬(등대 6곳) 둘레만 10m. 섬 사이 물길이 약 72m보다 좁으면 다 얕은 바다.
      기획자 결정(물어봄): **색으로만 구분** — 얕은 바다는 밝게, 깊은 바다는 진한 파랑 + 경계에 옅은 테두리. 규칙(헤엄·에너지 등)은 그대로.
      규칙 담당이 쓸 수 있게: seaDeep(x,z) = 깊은 바다면 true, seaShore(x,z) = 가장 가까운 땅까지 m(255까지).
   ③ 겨울: winter.js가 동북섬 + 띠섬 + 해달섬(WNT_NAMES)을 겨울로 칠해요.
   ④ 돌다리: 동북섬 ↔ 띠섬(긴 다리) + 띠섬 ↔ 해달섬(짧은 다리). 띠섬이 가운데라 두 다리로 이어져요. 돌 아치·난간·등불·눈.
      걷는 바닥은 보이지 않는 부두(addDock), 양옆은 보이지 않는 벽(떨어지지 않음) — 69차 수달섬 나무 다리와 같은 방식. */

/* ---------- ② 깊은 바다 ---------- */
const SEA73={N:1000,R:30,RL:10,LHR:26,open:6,m:null,d:null,tex:null,nd:0,n0:0,map:0};   /* 74차(기획자 11-23 22:16): 해안 30m(R), 등대 바위섬 둘레만 10m(RL) — 등대 가운데 LHR 안 땅 = 등대 바위섬 */
function sea73EDT1(f,n,d,v,zz){let k=0;v[0]=0;zz[0]=-1e30;zz[1]=1e30;
 for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=zz[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])}k++;v[k]=q;zz[k]=s;zz[k+1]=1e30}
 k=0;for(let q=0;q<n;q++){while(zz[k+1]<q)k++;const dq=q-v[k];d[q]=dq*dq+f[v[k]]}}
function sea73EDT(g,N){const f=new Float64Array(N),d=new Float64Array(N),v=new Int32Array(N),zz=new Float64Array(N+1);   /* 정확한 거리 변환(Felzenszwalb), 칸 단위 제곱 거리 */
 for(let x=0;x<N;x++){for(let y=0;y<N;y++)f[y]=g[y*N+x];sea73EDT1(f,N,d,v,zz);for(let y=0;y<N;y++)g[y*N+x]=d[y]}
 for(let y=0;y<N;y++){const o=y*N;for(let x=0;x<N;x++)f[x]=g[o+x];sea73EDT1(f,N,d,v,zz);for(let x=0;x<N;x++)g[o+x]=d[x]}}
function sea73Build(){const N=SEA73.N,c=WS/N,INF=1e20,NN=N*N,g=new Float64Array(NN),land=new Uint8Array(NN);
 /* 등대가 서 있는 바위섬(등대 가운데 LHR 안의 땅)은 따로: 둘레 10m만, 나머지 섬 해안은 30m */
 const LH=LH_SITES.map((L,i)=>i).filter(i=>!LH_GONE.includes(i)&&!LH_ISLE.includes(i)).map(i=>LH_SITES[i]),lhr2=SEA73.LHR**2,lhl=new Uint8Array(NN);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=(i+.5)*c,z=(j+.5)*c;land[k]=hAt(x,z)>0?1:0;if(land[k])for(const L of LH)if((x-L[0])**2+(z-L[1])**2<lhr2){lhl[k]=1;break}}
 const gl=new Float64Array(NN);for(let k=0;k<NN;k++){g[k]=land[k]?0:INF;gl[k]=lhl[k]?0:INF}sea73EDT(g,N);sea73EDT(gl,N);
 const gm=new Float64Array(NN);for(let k=0;k<NN;k++)gm[k]=land[k]&&!lhl[k]?0:INF;sea73EDT(gm,N);
 const d=new Uint8Array(NN),deep0=new Uint8Array(NN),R2=(SEA73.R/c)**2,RL2=(SEA73.RL/c)**2;let n0=0;
 for(let k=0;k<NN;k++){const v=Math.sqrt(g[k]);d[k]=Math.min(255,Math.round(v*c));if(!land[k]&&gm[k]>R2&&gl[k]>RL2){deep0[k]=1;n0++}}
 /* 얕은 바다 후하게: 깊은 띠 중 폭이 좁은 것(반지름 open 원이 안 들어가는 곳)은 얕은 바다로 */
 const r2=(SEA73.open/c)**2;for(let k=0;k<NN;k++)g[k]=deep0[k]?INF:0;sea73EDT(g,N);
 for(let k=0;k<NN;k++)g[k]=g[k]>r2?0:INF;sea73EDT(g,N);
 const m=new Uint8Array(NN);let nd=0;for(let k=0;k<NN;k++)if(deep0[k]&&g[k]<=r2+1e-6){m[k]=1;nd++}
 SEA73.m=m;SEA73.d=d;SEA73.nd=nd;SEA73.n0=n0;
 /* 물 셰이더용 그림(경계를 2m쯤 부드럽게) */
 let a=new Float32Array(NN),b=new Float32Array(NN);for(let k=0;k<NN;k++)a[k]=m[k];
 for(let pass=0;pass<2;pass++){for(let j=0;j<N;j++){let s=0;const o=j*N;for(let i=-2;i<=2;i++)s+=a[o+Math.min(N-1,Math.max(0,i))];for(let i=0;i<N;i++){b[o+i]=s/5;s+=a[o+Math.min(N-1,i+3)]-a[o+Math.max(0,i-2)]}}
  for(let i=0;i<N;i++){let s=0;for(let j=-2;j<=2;j++)s+=b[Math.min(N-1,Math.max(0,j))*N+i];for(let j=0;j<N;j++){a[j*N+i]=s/5;s+=b[Math.min(N-1,j+3)*N+i]-b[Math.max(0,j-2)*N+i]}}}
 const px=new Uint8Array(NN);for(let k=0;k<NN;k++)px[k]=Math.round(a[k]*255);
 if(SEA73.tex)SEA73.tex.dispose();const t=new THREE.DataTexture(px,N,N,THREE.LuminanceFormat);t.magFilter=t.minFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;SEA73.tex=t}
function sea73K(x,z){const N=SEA73.N,i=Math.floor(x/WS*N),j=Math.floor(z/WS*N);return(i<0||j<0||i>=N||j>=N)?-1:j*N+i}
function seaDeep(x,z){if(!SEA73.m)return false;const k=sea73K(x,z);return k<0?true:SEA73.m[k]===1}
function seaShore(x,z){if(!SEA73.d)return 255;const k=sea73K(x,z);return k<0?255:SEA73.d[k]}
function sea73Water(){if(!water||!SEA73.tex)return;const M=water.material;let f=M.fragmentShader;
 const A='float t=smoothstep(0.,3.,d+n*.4);vec3 c=mix(cS,cD,t);';if(f.indexOf(A)<0||f.indexOf('tDp')>=0)return;
 f=f.replace('uniform sampler2D tH;','uniform sampler2D tH,tDp;').replace(A,
  /* 얕은 바다: 원래 색의 얕은 쪽만(최대 34%), 깊은 바다: 진한 파랑. 경계는 물결 잡음으로 살짝 들쭉날쭉 + 옅은 테두리 */
  'float dp=(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)?1.:texture2D(tDp,uv).r;float de=smoothstep(.34,.66,dp+(vn(vP.xz*.09+3.)-.5)*.34);'+
  'float t=mix(smoothstep(0.,3.,d+n*.4)*.34,.82+.18*smoothstep(4.,10.,d),de);vec3 c=mix(cS,cD,t);'+
  'float rim=max(0.,1.-abs(de-.42)*3.2);c=mix(c,mix(cS,vec3(.82,.94,1.),.3),rim*.2);');
 M.uniforms.tDp={value:SEA73.tex};M.fragmentShader=f;M.needsUpdate=true}
{const _bt=buildTerrain;buildTerrain=function(){_bt.apply(this,arguments);try{sea73Build();sea73Water()}catch(e){console.error('깊은 바다',e)}}}
/* 지도에도: 깊은 바다는 조금 더 진하게 */
function sea73Map(){if(!SEA73.m||!MAPC)return;const c=MAPC.getContext('2d'),im=c.getImageData(0,0,WS,WS),D=im.data;
 for(let j=0;j<WS;j++)for(let i=0;i<WS;i++){if(hAt(i+.5,j+.5)>=0)continue;const k=(j*WS+i)*4;if(seaDeep(i+.5,j+.5)){D[k]*=.8;D[k+1]*=.84;D[k+2]*=.9}else{D[k]=D[k]+(150-D[k])*.18;D[k+1]=D[k+1]+(214-D[k+1])*.18;D[k+2]=D[k+2]+(226-D[k+2])*.18}}
 c.putImageData(im,0,0);SEA73.map=1}

/* ---------- ① 특수 보급섬 ---------- */
const SI73=[{isl:'조약돌섬',x:333,z:141,k:'si3'},{isl:'안개섬',x:865,z:417,k:'si5'}];
const SI73_RE=20*60*1000;   /* 쓰러진 경계병이 다시 서기까지(실제 시간, 임시) */
ENEMY.sentry={n:'경계병',hp:70,sp:3.3,dmg:11,range:16,w:'rifle',helmet:1,col:[.32,.4,.3],actor:()=>new Actor('gunner'),loot:[['ammoS',8,.8],['scrap',2,.6],['coin',150,1]]};
if(typeof HUNT_IC!=='undefined')HUNT_IC.sentry='🪖';
for(const Q of SI73){if(typeof PLACES!=='undefined')PLACES.push({k:Q.k,n:Q.isl+' 특수 보급',x:Q.x,z:Q.z,c:'#ff7a3d'});if(typeof NOB_N!=='undefined')NOB_N[Q.k]=Q.isl}
function si73Geo(Q){if(Q.cx!=null)return Q;const I=Q.I=ISL.find(i=>i.n===Q.isl);let n=0,sx=0,sz=0;const L=[];
 for(let x=Q.x-62;x<=Q.x+62;x++)for(let z=Q.z-62;z<=Q.z+62;z++){const h=hAt(x,z);if(h>0&&islAt(x,z)===I){L.push([x,z]);if(h>.97){n++;sx+=x;sz+=z}}}
 Q.cx=n?sx/n:Q.x;Q.cz=n?sz/n:Q.z;let R=0;for(const[x,z]of L)R=Math.max(R,Math.hypot(x-Q.cx,z-Q.cz));Q.R=R;Q.nr=Math.ceil(R+3);return Q}
function si73In(Q,dx,dz){for(let r=0;r<60;r+=.25)if(hAt(Q.cx+dx*r,Q.cz+dz*r)<.97)return r;return 60}   /* 가운데에서 그 쪽으로 땅 끝까지 */
function si73Fit(Q,x,z,bx,bz,r,pad){const c=Math.cos(r),s=Math.sin(r);let lo=9,hi=-9;
 for(const u of[-1,0,1])for(const v of[-1,0,1]){const lx=u*(bx+.3),lz=v*(bz+.3),px=x+lx*c+lz*s,pz=z-lx*s+lz*c,h=hAt(px,pz);if(h<.97||islAt(px,pz)!==Q.I)return false;lo=Math.min(lo,h);hi=Math.max(hi,h)}
 if(hi-lo>.24)return false;const rr=Math.hypot(bx,bz);
 for(let a=0;a<8;a++){const dx=Math.cos(a*.7854),dz=Math.sin(a*.7854);if(hAt(x+dx*(rr+1.6),z+dz*(rr+1.6))<.9)return false}   /* 바닷가에 바짝 붙지 않게(뒤로 지나갈 틈) */
 for(const o of Q.used)if(Math.hypot(o[0]-x,o[1]-z)<rr+o[2]+pad)return false;return true}
function si73Spot(Q,lx,lz,bx,bz,r,pad=1.1,nm=''){const x0=Q.cx+lx,z0=Q.cz+lz;for(let k=0;k<200;k++){const a=k*2.39996,d=Math.sqrt(k)*.45,x=x0+Math.cos(a)*d,z=z0+Math.sin(a)*d;
  if(si73Fit(Q,x,z,bx,bz,r,pad)){Q.used.push([x,z,Math.hypot(bx,bz)]);return[x,z]}}Q.miss.push(nm||(lx+','+lz));return null}
function si73Build(Q){si73Geo(Q);Q.used=[];Q.miss=[];Q.g=[];Q.cr=0;const gh=(x,z)=>hAt(x,z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x,z,r,hp:1e9});
 CLEARS.push([Q.cx,Q.cz,Math.min(Q.R*.72,19)]);
 const V=[],add=(k,x,z,ry=0,s=1,dy=0)=>{if(GEO[k])V.push(pt(GEO[k],null,[x,gh(x,z)-.02+dy,z],[0,ry,0],[s,s,s]))};
 const lampAt=(x,y,z,c=0xffc46a,r=2.8)=>{const l=glow(c,r,.62);l.position.set(x,y,z);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l)};
 /* 상자 6개: 가운데 낙하 지점 (서로 1m 넘게 띄워 사이로 지나가요) */
 [[-2.8,-1.4,.2],[0,-2.9,-.3],[2.9,-1.2,.5],[2.6,2.0,-.2],[-.2,2.8,.1],[-3.0,1.9,-.6]].forEach(([lx,lz,r],i)=>{const p=si73Spot(Q,lx,lz,.66,.53,r,1.05,'상자'+i);if(!p)return;const c=addStruct({t:'spsupply',x:p[0],z:p[1],r});c.li=Q.k+'_'+i;c.si=Q.k;Q.cr++});
 {const p=si73Spot(Q,-5.2,.2,.9,.9,.4,.6,'낙하산');if(p)add('chute',p[0],p[1],.4,1.1)}
 /* 모래주머니 초소 넷(북·동·남·서) + 경계병 자리 */
 for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]){const rin=si73In(Q,dx,dz),rp=clamp(rin-3.4,6,10.5),ry=Math.atan2(dx,dz);
  const p=si73Spot(Q,dx*rp,dz*rp,1.2,.36,ry,.8,'초소');if(!p)continue;V.push(pt(plSandbagGeo(4),null,[p[0],gh(p[0],p[1])-.02,p[1]],[0,ry,0]));bl(p[0],p[1],1.18,.24,ry);
  Q.g.push({x:p[0]-dx*1.35,z:p[1]-dz*1.35,face:ry,tx:dz,tz:-dx,e:null,dt:0});Q.used.push([p[0]-dx*1.35,p[1]-dz*1.35,.6])}
 /* 감시탑(다리 넷만 부딪힘, 밑으로 지나가요) */
 {const r=-.15,p=si73Spot(Q,-7.4,-6.4,1.05,1.05,r,1.2,'감시탑');if(p){const tw=plAdd(plTowerGeo(),p[0],gh(p[0],p[1])-.02,p[1],r);tw.userData.layoutName='감시탑';const c=Math.cos(r),s=Math.sin(r);
   for(const[lx,lz]of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])bl(p[0]+lx*c+lz*s,p[1]-lx*s+lz*c,.14,.14);lampAt(p[0],gh(p[0],p[1])+4.7,p[1])}}
 /* 깃발 */
 {const p=si73Spot(Q,6.6,-6.2,.25,.25,0,1.4,'깃발');if(p){const f=plFlagGeo();plAdd(f.pole,p[0],gh(p[0],p[1])-.02,p[1]);plAdd(f.cloth,p[0],gh(p[0],p[1])-.02,p[1],0,PLM2());bl(p[0],p[1],.18,.18)}}
 /* 주황 신호등 */
 {const p=si73Spot(Q,4.8,-4.2,.3,.3,0,1.2,'신호등');if(p){const b=addStruct({t:'spbeacon',x:p[0],z:p[1],r:0,hp:1e9});lampAt(b.x,gh(b.x,b.z)+3.25,b.z,0xff8a3d,3.6)}}
 /* 천막 + 탄약 팔레트·기름통 */
 {const p=si73Spot(Q,-7.2,4.6,1.75,.95,.2,1.1,'천막');if(p){add('suptent',p[0],p[1],.2,1.05);bl(p[0],p[1],1.75,.95,.2)}}
 {const p=si73Spot(Q,-4.4,6.4,.65,.55,.1,.9,'팔레트');if(p){add('lk_pallet',p[0],p[1],.1);add('ammostack',p[0],p[1],.2,1.1,.16);bl(p[0],p[1],.65,.55,.1)}}
 {const p=si73Spot(Q,4.6,6.2,.4,.4,0,.9,'기름통');if(p){add('jerry',p[0]-.2,p[1],.5);add('jerry',p[0]+.25,p[1]+.2,1.2);bl(p[0],p[1],.4,.35)}}
 /* 무전 책상: 위장망 그늘 + 탁자 + 발전기·드럼통 */
 {const p=si73Spot(Q,7.0,2.2,1.9,1.4,0,1.0,'무전 책상');if(p){const sh=plShadeGeo(3.4,2.4,2.2);plAdd(sh.poles,p[0],gh(p[0],p[1])-.02,p[1]);plAdd(sh.net,p[0],gh(p[0],p[1])-.02,p[1],0,PLM2()).castShadow=true;plAdd(plTableGeo(),p[0],gh(p[0],p[1])-.02,p[1],0);
   for(const[x,z]of[[-1.7,-1.2],[1.7,-1.2],[-1.7,1.2],[1.7,1.2]])bl(p[0]+x,p[1]+z,.08,.08);bl(p[0],p[1],.85,.45)}}
 {const p=si73Spot(Q,8.4,-1.4,.85,.75,0,.9,'드럼통');if(p){add('lk_drum_1',p[0]-.3,p[1]-.2,.2,.95);add('lk_drum_0',p[0]+.3,p[1]+.1,1.2,.95);add('lk_gen',p[0],p[1]+.9,-1.57);bl(p[0],p[1]+.3,.75,.85)}}
 /* 등 둘 */
 for(const [lx,lz,nm] of [[-5.6,-3.6,'등1'],[5.2,4.4,'등2']]){const p=si73Spot(Q,lx,lz,.25,.25,0,1.0,nm);if(p)addStruct({t:'suplamp',x:p[0],z:p[1],r:0})}
 /* 경고판(앞쪽 바닷가 가까이, 카메라 쪽을 봐요) */
 {const rin=si73In(Q,0,1),p=si73Spot(Q,2.4,Math.max(5,rin-2.6),1.3,.16,0,.8,'경고판');if(p){const b=plAdd(plBoardGeo(),p[0],gh(p[0],p[1])-.02,p[1],0),t=plSignText('⚠ 특수 보급섬',2.3,.46,70);t.position.set(0,1.32,.08);b.add(t);bl(p[0],p[1],1.3,.14)}}
 if(V.length)plAdd(mg(V),0,0,0);
 if(Q.miss.length)console.warn(Q.isl+' 특수 보급섬: 자리 못 찾음',Q.miss)}
{const _nb=buildNoBuild;buildNoBuild=function(){_nb();for(const Q of SI73){si73Geo(Q);NOB.push({k:Q.k,x:Q.cx,z:Q.cz,r:Q.nr})}}}

/* 경계병: 가까이 가면 나타나고, 초소를 지켜요 */
function si73Tick(){if(mode!=='play')return;const now=Date.now();
 for(const Q of SI73){if(!Q.g)continue;const pd=INT.on?1e9:dist(P.x,P.z,Q.cx,Q.cz);
  for(const g of Q.g){if(g.e&&g.e.dead){g.dt=now;g.e=null;continue}
   if(!g.e){if(pd<100&&now-g.dt>=SI73_RE&&dist(P.x,P.z,g.x,g.z)>16)g.e=spawnEnemy('sentry',g.x,g.z,{si:Q,sg:g,ax:g.x,az:g.z,rot:g.face})}
   else if(pd>130&&!g.e.agg){dropEnemy(g.e);g.e=null}}}}
{const _us=updSpawns;updSpawns=function(dt){_us.apply(this,arguments);try{si73Tick()}catch(e){console.warn('경계병',e)}}}
{const _ue=updEnemy;updEnemy=function(e,dt){const Q=e.si;if(Q&&!e.dead){const onI=!P.dead&&!DEV.on&&!INT.on&&dist(P.x,P.z,Q.cx,Q.cz)<Q.R+4;
   if(onI&&!e.agg&&dist(e.x,e.z,P.x,P.z)<18){for(const g of Q.g)if(g.e&&!g.e.dead)g.e.agg=1}   /* 한 명이 보면 섬 경계병이 다 같이 */
   if(e.agg&&!onI)e.agg=0;
   if(!e.agg){const g=e.sg;e.pt=(e.pt||0)+dt;const side=Math.floor(e.pt/7)%2?1:-1,tx=g.x+g.tx*side*1.1,tz=g.z+g.tz*side*1.1;e.wx=tx;e.wz=tz;e.wt=9;   /* 초소 앞을 천천히 오가요 */
    if(dist(e.x,e.z,tx,tz)<1.3)e.rot=turn(e.rot,g.face,dt*3)}}
  return _ue.apply(this,arguments)}}

/* ---------- ④ 돌다리 ---------- */
const SB73=[{a:[800,125],b:[831.5,92.5],rise:.75,sign:'❄ 띠섬 · 해달섬'},{a:[843.5,72.5],b:[845.9,64.7],rise:.25}];
const SB73C={st:[0x9aa0a6,0x8d939a,0xa8adb2,0x858a90,0x969ca3],cap:0xb9bdc1,dark:0x6c7177,snow:0xf2f6fa,iron:0x2f3338};
const _e73=new THREE.Euler(0,0,0,'YXZ'),_q73=new THREE.Quaternion(),_m73=new THREE.Matrix4(),_v73=new THREE.Vector3(),_s73=new THREE.Vector3(1,1,1);
function pt73(geo,c,pos,rx,ry){const g=pt(geo,c);_m73.compose(_v73.set(pos[0],pos[1],pos[2]),_q73.setFromEuler(_e73.set(rx,ry,0,'YXZ')),_s73);g.applyMatrix4(_m73);return g}   /* 기울기(로컬 x) 먼저, 다음에 방향(y) */
function sb73Line(D){const [ax,az]=D.a,[bx,bz]=D.b;let dx=bx-ax,dz=bz-az;const L0=Math.hypot(dx,dz);dx/=L0;dz/=L0;const mx=(ax+bx)/2,mz=(az+bz)/2;
 const walk=sg=>{for(let t=0;t<70;t+=.1){const x=mx+sg*dx*t,z=mz+sg*dz*t;if(hAt(x,z)>=.98)return[x,z]}return[mx+sg*dx*25,mz+sg*dz*25]};
 const A=walk(-1),B=walk(1),S0=[A[0]-dx*1.3,A[1]-dz*1.3],S1=[B[0]+dx*1.3,B[1]+dz*1.3],G0=[A[0]-dx*2.6,A[1]-dz*2.6],G1=[B[0]+dx*2.6,B[1]+dz*2.6];
 const y0=Math.max(hAt(S0[0],S0[1]),.98)+.05,y1=Math.max(hAt(S1[0],S1[1]),.98)+.05,len=Math.hypot(S1[0]-S0[0],S1[1]-S0[1]),rise=D.rise;
 const yAt=t=>y0+(y1-y0)*t+rise*Math.sin(Math.PI*clamp(t,0,1));
 const tA=1.3/len,tB=1-1.3/len;return{A,B,S0,S1,G0,G1,dx,dz,px:-dz,pz:dx,len,yAt,tA,tB,r:Math.atan2(dx,dz),D}}
function sb73Geo(b){const p=[],gl=[],{S0,dx,dz,px,pz,len,yAt,r}=b,C=SB73C,ST=C.st,HW=1.25;
 const at=(t,o)=>[S0[0]+dx*len*t+px*o,S0[1]+dz*len*t+pz*o];
 const slope=t=>{const e=.002;return Math.atan2(yAt(t+e)-yAt(t-e),2*e*len)};
 const B=(w,h,d,c,pos,rx=0)=>p.push(pt73(box(w,h,d),c,pos,rx,r));
 const sc=(i,j)=>ST[Math.floor(hash(i,j,173)*ST.length)];
 /* 바닥 돌판: 0.52m 줄마다 엇갈려 */
 const nr=Math.ceil(len/.52);for(let i=0;i<nr;i++){const t=(i+.5)/nr,y=yAt(t),sl=-slope(t),Lr=len/nr-.03;const W=i%2?[.62,.62,.62,.62]:[.31,.62,.62,.62,.31];let o=-HW;
  W.forEach((w,j)=>{const cx=o+w/2;o+=w;const [x,z]=at(t,cx);B(w-.03,.2,Lr,sc(i,j),[x,y-.1+(hash(i,j,174)-.5)*.012,z],sl)})}
 /* 난간: 두 줄 돌 + 갓돌 + 눈 */
 for(const sg of[-1,1]){const o=sg*1.36;let u=0,k=0;while(u<len-.05){const w=Math.min(.6+hash(k,sg+5,175)*.35,len-u),t=(u+w/2)/len,[x,z]=at(t,o),y=yAt(t),sl=-slope(t);
   B(.3,.34,w-.03,sc(k,sg),[x,y+.17,z],sl);u+=w;k++}
  u=.3;k=0;while(u<len-.05){const w=Math.min(.55+hash(k,sg+9,176)*.4,len-u),t=(u+w/2)/len,[x,z]=at(t,o),y=yAt(t),sl=-slope(t);B(.3,.32,w-.03,sc(k+40,sg),[x,y+.5,z],sl);u+=w;k++}
  const nc=Math.ceil(len/1.05);for(let i=0;i<nc;i++){const t=(i+.5)/nc,[x,z]=at(t,o),y=yAt(t),sl=-slope(t),L=len/nc-.04;B(.4,.13,L,C.cap,[x,y+.725,z],sl);
   const sw=L*(.55+hash(i,sg,177)*.4);B(.3,.05,sw,C.snow,[x,y+.81,z],sl)}
  /* 바닥 가장자리 눈 */
  const ns=Math.ceil(len/1.4);for(let i=0;i<ns;i++){if(hash(i,sg,178)<.25)continue;const t=(i+.5)/ns,[x,z]=at(t,sg*1.08),y=yAt(t),sl=-slope(t);B(.22,.035,len/ns*(.5+hash(i,sg,179)*.45),C.snow,[x,y+.015,z],sl)}}
 /* 다리 몸: 받침(양 끝 땅 위) + 물속 기둥 + 아치 + 아치 위 채움 */
 const wl=b.tB-b.tA,nsp=Math.max(1,Math.round(wl*len/6.4)),piers=[];for(let k=0;k<=nsp;k++)piers.push(b.tA+wl*k/nsp);
 const pw=.95/len;
 piers.forEach((t,k)=>{const [x,z]=at(t,0),y=yAt(t),top=y-.2,bot=Math.min(hAt(x,z),0)-.6,end=k===0||k===nsp;if(top-bot<.3)return;
  const nC=Math.max(1,Math.round((top-bot)/.42));for(let c=0;c<nC;c++){const h=(top-bot)/nC,yy=bot+h*(c+.5);p.push(pt73(box(end?1.6:1.0,h-.02,2.8),c%2?ST[1]:ST[3],[x,yy,z],0,r))}
  if(!end)for(const sg of[-1,1]){const [cx,cz]=at(t,sg*1.42),h=Math.max(.3,.55-bot);p.push(pt73(box(.66,h,.66),ST[3],[cx,bot+h/2,cz],0,r+Math.PI/4))}   /* 물 가르는 뾰족한 끝 */
 });
 /* 양 끝 받침: 땅에서 바닥까지 */
 for(const [t0,t1] of [[0,b.tA],[b.tB,1]]){const n=Math.max(1,Math.ceil((t1-t0)*len/.8));for(let i=0;i<n;i++){const t=t0+(t1-t0)*(i+.5)/n,[x,z]=at(t,0),y=yAt(t),gy=hAt(x,z)-.1;if(y-.2-gy<.08)continue;const h=y-.2-gy;p.push(pt73(box(2.8,h,(t1-t0)*len/n+.02),ST[i%2?0:2],[x,gy+h/2,z],0,r))}}
 for(let k=0;k<nsp;k++){const t0=piers[k]+pw/2,t1=piers[k+1]-pw/2,sl=(t1-t0)*len;if(sl<1.2)continue;
  const yd=t=>yAt(t)-.2,[x0,z0]=at(t0,0),[x1,z1]=at(t1,0),ys=Math.max(.32,hAt(x0,z0)+.1,hAt(x1,z1)+.1),ym=yd((t0+t1)/2)-.34,hg=ym-ys;
  if(hg<.25){/* 아치를 둘 높이가 없으면 바닥 밑을 막아요 */const n=Math.ceil(sl/.6);for(let i=0;i<n;i++){const t=t0+(t1-t0)*(i+.5)/n,[x,z]=at(t,0),gy=Math.min(hAt(x,z),0)-.4,h=yd(t)-gy;p.push(pt73(box(2.8,h,sl/n+.02),ST[i%2],[x,gy+h/2,z],0,r))}continue}
  const R=(sl*sl/4+hg*hg)/(2*hg),f0=Math.asin(Math.min(1,sl/2/R)),nv=Math.max(5,Math.round(sl/.62));
  const arcY=u=>{const w=u-sl/2;return ys+hg-R+Math.sqrt(Math.max(0,R*R-w*w))};
  for(let i=0;i<nv;i++){const fa=-f0+2*f0*(i+.5)/nv,u=sl/2+R*Math.sin(fa),yy=ys+hg-R+R*Math.cos(fa)+.16,t=t0+u/len,[x,z]=at(t,0),Lv=2*R*f0/nv-.035;
   p.push(pt73(box(2.86,.32,Lv),i%2?C.dark:ST[4],[x,yy,z],fa,r))}
  const nf=Math.ceil(sl/.5);for(let i=0;i<nf;i++){const u=sl*(i+.5)/nf,t=t0+u/len,top=yd(t),a0=arcY(Math.max(0,u-sl/nf/2)),a1=arcY(Math.min(sl,u+sl/nf/2)),ab=Math.max(a0,a1)+.3;if(top-ab<.04)continue;
   const [x,z]=at(t,0);p.push(pt73(box(2.8,top-ab,sl/nf+.02),sc(i,k+60),[x,(top+ab)/2,z],0,r))}}
 /* 양 끝 돌기둥 + 등불, 가운데 기둥 위 등불 */
 const lamps=[];
 for(const [t,dir] of [[0,-1],[1,1]])for(const sg of[-1,1]){const [x,z]=at(t,sg*1.66),gy=hAt(x,z)-.05;p.push(pt73(box(.7,1.9,.7),ST[2],[x,gy+.95,z],0,r),pt73(box(.86,.16,.86),C.cap,[x,gy+1.98,z],0,r),pt73(box(.72,.06,.72),C.snow,[x,gy+2.09,z],0,r));lamps.push([x,gy+2.12,z,t,sg])}
 for(let k=1;k<nsp;k+=2)for(const sg of[-1,1]){const [x,z]=at(piers[k],sg*1.36),y=yAt(piers[k]);p.push(pt73(box(.46,.3,.46),ST[2],[x,y+.95,z],0,r));lamps.push([x,y+1.1,z,piers[k],sg])}
 for(const [x,y,z] of lamps){p.push(pt73(cyl(.035,.045,.62,6),C.iron,[x,y+.31,z],0,0),pt73(box(.24,.05,.24),C.iron,[x,y+.92,z],0,r),pt73(box(.2,.04,.2),C.iron,[x,y+.64,z],0,r),pt73(cone(.18,.16,4),C.iron,[x,y+1.02,z],0,r+Math.PI/4),pt73(box(.2,.04,.2),C.snow,[x,y+1.11,z],0,r));
  gl.push(pt73(box(.15,.24,.15),0xffd36a,[x,y+.78,z],0,r))}
 return{stone:mg(p),glow:gl.length?mg(gl):null,lamps}}
function sb73Build(){SB73.built=[];for(const D of SB73){const b=sb73Line(D),g=sb73Geo(b),n0=structs.length;
  plAdd(g.stone,0,0,0).castShadow=true;if(g.glow){const m=new THREE.MeshBasicMaterial({color:0xffd36a});plAdd(g.glow,0,0,0,0,m)}
  for(const [x,y,z] of g.lamps){const l=glow(0xffc46a,2.8,.6);l.position.set(x,y+.8,z);l.visible=false;scene.add(l);if(typeof PLAMPS!=='undefined')PLAMPS.push(l)}
  const n=Math.ceil(b.len/1.4);for(let i=0;i<n;i++){const t=(i+.5)/n,x=b.S0[0]+b.dx*b.len*t,z=b.S0[1]+b.dz*b.len*t;addDock(x,z,b.r,1.16,b.len/n/2+.06,b.yAt(t))}
  for(const o of[-1.3,1.3])plWallSeg(b.G0[0]+b.px*o,b.G0[1]+b.pz*o,b.G1[0]+b.px*o,b.G1[1]+b.pz*o,.14);
  for(const [t,sg] of [[0,-1],[0,1],[1,-1],[1,1]]){const x=b.S0[0]+b.dx*b.len*t+b.px*sg*1.66,z=b.S0[1]+b.dz*b.len*t+b.pz*sg*1.66;addStruct({t:PLB(.36,.36),x,z,r:b.r,hp:1e9})}
  if(D.sign&&typeof plSignText==='function'){const x=b.S0[0]-b.dx*.6+b.px*2.6,z=b.S0[1]-b.dz*.6+b.pz*2.6,bd=plAdd(plBoardGeo(),x,hAt(x,z)-.02,z,0),t=plSignText(D.sign,2.3,.46,64);t.position.set(0,1.32,.08);bd.add(t);addStruct({t:PLB(1.3,.14),x,z,r:0,hp:1e9})}
  CLEARS.push([b.S0[0]-b.dx*2,b.S0[1]-b.dz*2,4.5],[b.S1[0]+b.dx*2,b.S1[1]+b.dz*2,4.5]);
  for(let k=n0;k<structs.length;k++)structs[k].nobx=1;SB73.built.push(b)}}

{const _bpl=buildPlaces;buildPlaces=function(){_bpl();for(const Q of SI73)try{si73Build(Q)}catch(e){console.error(Q.isl+' 특수 보급섬 만들기 실패',e)}try{sb73Build()}catch(e){console.error('돌다리 만들기 실패',e)}}}
{const _u=updEnv;updEnv=function(dt,x,z){_u.apply(this,arguments);if(!SEA73.map&&typeof MAPC!=='undefined'&&MAPC&&mode==='play')try{sea73Map()}catch(e){SEA73.map=1}}}
