'use strict';
/* ===== 48차(규칙, 기획자 11-21 14:18): 고래 =====
   기획자: '고래를 만들 거야. 전설 등급이고 항상 바다를 계속 돌아다녀. 등대들 주변으로 계속 돌게, 천천히. 계속 돌다가 2분 숨어 있다가(바다에) 30초 보이게, 계속 이 패턴.
           고래를 잡으려면 그물망이라는 장비가 필요한데 그냥 아이템만 만들어 둬'.
   - 길(WH.path): 남은 등대 6곳을 지도 둘레 순서(북 → 동 → 남동 → 남서 → 땅끝 → 서)로 돌아요. 등대마다 바위섬 둘레를 한 바퀴(물 깊이·땅에서 거리를 보고 반지름을 정함),
     등대 사이는 깊은 바다로만 가는 길(A*, 8m 칸, 얕은 물·땅에서 한 칸 넘게)로 이어요. 새 게임마다 같은 길(지형만 봐요).
   - 움직임·숨기는 **실제 시각**으로 정해요(WH.sp m/초, 150초마다 120초 숨고 30초 보임) → 누구 화면에서나 같은 자리·같은 때, 껐다 켜도 이어져요.
     떠오를 때 3초 동안 올라오며 물을 뿜고, 들어갈 때 4초 동안 꼬리를 들며 잠겨요. 숨어 있을 땐 안 보여요. 가까이(70m) 떠오르면 알림.
   - 잡기는 아직 없어요(그물망 = 디자인 47차 '고기잡이 그물' kit_fnet·BUILDS.fnet). 부딪히지 않고 보기만 해요. 지도에도 안 나와요. */
const WH={sp:2.6,cyc:150,hide:120,rise:3,dive:4,path:null,len:0,m:null,tail:null,was:false,note:0,depth:-2.2};
function whGrid(minD=8){const C=8,N=Math.ceil(WS/C),ok=new Uint8Array(N*N),land=new Float32Array(N*N).fill(1e9);const q=[];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i+.5)*C,z=(j+.5)*C;if(hAt(x,z)>WH.depth||PORT_SAFE.some(p=>dist(x,z,p[0],p[1])<p[2]+12)){land[j*N+i]=0;q.push(j*N+i)}}   /* 항구(부두·배) 둘레도 피해요 */
 for(let h=0;h<q.length;h++){const c=q[h],i=c%N,j=(c/N)|0,d=land[c]+C;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const k=b*N+a;if(land[k]>d){land[k]=d;q.push(k)}}}   /* 땅에서 거리(대충) */
 for(let k=0;k<N*N;k++)ok[k]=land[k]>=minD?1:0;return{C,N,ok,land}}   /* 얕은 물·땅 칸에서 한 칸(8m) 넘게 */
function whAstar(G,x0,z0,x1,z1){const{C,N,ok}=G,id=(x,z)=>clamp((z/C)|0,0,N-1)*N+clamp((x/C)|0,0,N-1),s=id(x0,z0),t=id(x1,z1),g=new Float32Array(N*N).fill(1e9),from=new Int32Array(N*N).fill(-1),open=[[0,s]];g[s]=0;
 const tx=t%N,tz=(t/N)|0;while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const[,c]=open.splice(bi,1)[0];if(c===t)break;const ci=c%N,cj=(c/N)|0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=ci+di,b=cj+dj;if(a<0||b<0||a>=N||b>=N)continue;const k=b*N+a;if(!ok[k]&&k!==t)continue;const ng=g[c]+(di&&dj?1.414:1);if(ng<g[k]){g[k]=ng;from[k]=c;open.push([ng+Math.hypot(a-tx,b-tz),k])}}}
 const out=[];for(let c=t;c>=0&&c!==s;c=from[c])out.push([(c%N+.5)*C,((c/N|0)+.5)*C]);out.reverse();return from[t]<0&&t!==s?null:out}
function whClear(G,x0,z0,x1,z1){const n=Math.ceil(dist(x0,z0,x1,z1)/4);for(let i=0;i<=n;i++){const u=i/n,x=lerp(x0,x1,u),z=lerp(z0,z1,u),{C,N}=G,k=clamp((z/C)|0,0,N-1)*N+clamp((x/C)|0,0,N-1);if(!G.ok[k])return false}return true}
function whBuild(){const G8=whGrid(8),G16=whGrid(16),L=LHS.filter((l,i)=>!LH_GONE.includes(i)).map(l=>({x:l.x,z:l.z,a:Math.atan2(l.z-500,l.x-500)})).sort((a,b)=>a.a-b.a),pts=[];
 const ring=l=>{let R=26;for(;R<60;R+=2){let good=true;for(let k=0;k<24&&good;k++){const a=k/24*Math.PI*2,x=l.x+Math.cos(a)*R,z=l.z+Math.sin(a)*R;if(hAt(x,z)>WH.depth-.6)good=false}if(good)break}return R};
 const E=L.map((l,i)=>{const pv=L[(i-1+L.length)%L.length],nx=L[(i+1)%L.length];return{R:ring(l),ain:Math.atan2(pv.z-l.z,pv.x-l.x),aout:Math.atan2(nx.z-l.z,nx.x-l.x)}}),T=Math.PI*2;
 for(let i=0;i<L.length;i++){const l=L[i],e=E[i],sp=T+((e.aout-e.ain)%T+T)%T,ns=Math.ceil(sp/(T/28));
  for(let k=0;k<=ns;k++){const a=e.ain+sp*k/ns;pts.push([l.x+Math.cos(a)*e.R,l.z+Math.sin(a)*e.R])}   /* 들어온 쪽에서 바위섬을 한 바퀴 돌고 다음 등대 쪽으로 나가요 */
  const n=L[(i+1)%L.length],en=E[(i+1)%L.length],ex=[n.x+Math.cos(en.ain)*en.R,n.z+Math.sin(en.ain)*en.R],st=pts[pts.length-1];let G=G16,mid=whAstar(G,st[0],st[1],ex[0],ex[1]);if(!mid){G=G8;mid=whAstar(G,st[0],st[1],ex[0],ex[1])}
  if(mid){const raw=[st,...mid,ex],sm=[raw[0]];let k=0;while(k<raw.length-1){let j=raw.length-1;while(j>k+1&&!whClear(G,raw[k][0],raw[k][1],raw[j][0],raw[j][1]))j--;sm.push(raw[j]);k=j}pts.push(...sm.slice(1,-1))}}
 /* 4m마다 고르게 + 모서리 둥글게 */
 const P0=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],n=Math.max(1,Math.ceil(dist(a[0],a[1],b[0],b[1])/4));for(let k=0;k<n;k++)P0.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)])}
 let P1=P0;for(let it=0;it<3;it++)P1=P1.map((p,i)=>{const a=P1[(i-1+P1.length)%P1.length],b=P1[(i+1)%P1.length];return[(a[0]+2*p[0]+b[0])/4,(a[1]+2*p[1]+b[1])/4]});
 const cum=[0];for(let i=1;i<=P1.length;i++){const a=P1[i-1],b=P1[i%P1.length];cum.push(cum[i-1]+dist(a[0],a[1],b[0],b[1]))}WH.path=P1;WH.cum=cum;WH.len=cum[cum.length-1];WH.lh=L}
function whAt(s){const P1=WH.path,cum=WH.cum;s=((s%WH.len)+WH.len)%WH.len;let lo=0,hi=P1.length;while(hi-lo>1){const m=(lo+hi)>>1;if(cum[m]<=s)lo=m;else hi=m}const a=P1[lo],b=P1[(lo+1)%P1.length],u=(s-cum[lo])/Math.max(1e-6,cum[lo+1]-cum[lo]);return{x:lerp(a[0],b[0],u),z:lerp(a[1],b[1],u),h:Math.atan2(b[0]-a[0],b[1]-a[1])}}
/* 모양: 길이 약 12m. 밝은 회청색 등, 밝은 배(주름 줄), 작은 등지느러미, 가슴지느러미, 꼬리(따로 움직임). 앞이 +z */
function whGeo(){const BK=0x7d8ea0,BL=0xe4e9ee,p=[];   /* 깊은 파란 바다 위에서 잘 보이게 밝은 회청색 등 */
 const prof=[[0,-6],[.55,-5.6],[1.15,-4.6],[1.55,-3],[1.7,-1],[1.62,1.2],[1.35,3],[.85,4.6],[.4,5.6],[.12,6.1]].map(([r,y])=>new THREE.Vector2(r,y));
 const body=new THREE.LatheGeometry(prof,18);body.rotateX(-Math.PI/2);body.scale(1,.72,1);const pa=body.attributes.position,col=[],c1=new THREE.Color(BK).convertSRGBToLinear(),c2=new THREE.Color(BL).convertSRGBToLinear(),cc=new THREE.Color();
 for(let i=0;i<pa.count;i++){const y=pa.getY(i),x=pa.getX(i),k=clamp((-y-.15)/.6,0,1),gr=k>.3&&Math.sin(x*9)>.55?.12:0;cc.copy(c1).lerp(c2,k).multiplyScalar(1-gr);col.push(cc.r,cc.g,cc.b)}body.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const B=body.toNonIndexed();B.deleteAttribute('uv');p.push(B);
 p.push(pt(cone(.35,.9,6),BK,[0,1.15,-1.6],[-.5,0,0],[.5,1,1.4]));   /* 등지느러미 */
 for(const sx of[-1,1])p.push(pt(box(2.1,.12,.75),BK,[sx*1.7,-.45,2.1],[0,sx*.5,sx*-.45]));   /* 가슴지느러미 */
 p.push(pt(new THREE.SphereGeometry(.13,8,6),0x10161c,[.95,.12,3.7]),pt(new THREE.SphereGeometry(.13,8,6),0x10161c,[-.95,.12,3.7]));   /* 눈 */
 const g=mg(p);g.computeBoundingSphere();
 const tp=[pt(box(1.1,.18,.9),BK,[0,0,-.3]),pt(box(1.6,.1,1.0),BK,[1.05,0,-.75],[0,.55,0]),pt(box(1.6,.1,1.0),BK,[-1.05,0,-.75],[0,-.55,0])];const tg=mg(tp);tg.computeBoundingSphere();return{g,tg}}
function whInit(){if(WH.m||!WH.path)return;const{g,tg}=whGeo(),m=WH.m=new THREE.Group(),b=mesh(g,MATT),t=WH.tail=mesh(tg,MATT);b.castShadow=false;t.castShadow=false;t.position.set(0,0,-6);m.add(b);m.add(t);m.visible=false;scene.add(m)}
/* 실제 시각 → 자리·보임. 0~120초 숨음, 120~150초 보임(앞 3초 떠오름, 뒤 4초 잠김) */
function whState(t){const ph=((t%WH.cyc)+WH.cyc)%WH.cyc,vis=ph>=WH.hide,u=ph-WH.hide;let k=0;if(vis)k=u<WH.rise?u/WH.rise:u>WH.cyc-WH.hide-WH.dive?(WH.cyc-WH.hide-u)/WH.dive:1;return{vis,k:clamp(k,0,1),ph,u}}
function whTick(dt){if(!WH.path){if(mode!=='play')return;whBuild();whInit()}if(!WH.m)return;const t=Date.now()/1000,st=whState(t),p=whAt(t*WH.sp),m=WH.m;
 const show=st.vis&&!INT.on&&mode==='play';m.visible=show&&st.k>.02;
 if(show){const sink=1-st.k,diving=st.u>WH.cyc-WH.hide-WH.dive,bob=Math.sin(t*.9)*.12;m.position.set(p.x,.18-sink*3.6+bob,p.z);m.rotation.set(diving?-.18*sink:.04*Math.sin(t*.7),p.h,0);
  WH.tail.rotation.x=Math.sin(t*1.6)*.28+(diving?-.5*sink:0);
  if(!WH.was&&st.u<WH.rise){WH.was=true;if(typeof puff==='function')for(let i=0;i<3;i++)setTimeout(()=>{if(WH.m.visible)puff(WH.m.position.x+Math.sin(p.h)*3.4,1.2+i*.6,WH.m.position.z+Math.cos(p.h)*3.4,0xeaf6ff,10)},i*260);
   if(typeof ripple==='function')ripple(p.x,p.z,4,1.6);const d=dist(P.x,P.z,p.x,p.z);if(d<70&&performance.now()-WH.note>20000){WH.note=performance.now();toast('🐋 가까운 바다에 고래가 떠올랐어요!')}}
  if(st.u>WH.rise+1&&Math.random()<dt*.15&&typeof ripple==='function')ripple(p.x-Math.sin(p.h)*5.5,p.z-Math.cos(p.h)*5.5,2.2,1.1)}
 else WH.was=false}
{const _ue=updEnv;updEnv=function(dt,x,z){_ue(dt,x,z);try{whTick(dt)}catch(e){if(!WH.err){WH.err=1;console.error(e)}}}}
