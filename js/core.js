'use strict';
/* ===== core: constants, math, data tables, state ===== */
const $=id=>document.getElementById(id);
const WS=1000,DAYLEN=600,SAVE='frontisle_v4',CELL=2.5,CN=WS/CELL,REG=50,RN=WS/REG,WORLD_SEED=20261114;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const pick=a=>a[(Math.random()*a.length)|0],dist=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function noise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y,s)=>.5*noise(x,y,s)+.3*noise(x*2.1,y*2.1,s+1)+.2*noise(x*4.3,y*4.3,s+2);
/* ===== world layout: 2 main islands, 5 mid islands, 18 islets, river channels. Same seed = same world for every client ===== */
const VIL={x:0,z:0},OUT={x:0,z:0},ISL=[],RIV=[],RCELL=32,RGN=Math.ceil(WS/RCELL),IGS=4,IGN=WS/IGS+1;
let HG=null,IG=null,SEED=1,RG=null,_bi=-1;
function mkRiver(ax,az,bx,bz,amp,s,sd,w0=1,w1=5.5){const L=dist(ax,az,bx,bz),n=Math.ceil(L/2.5),px=-(bz-az)/L,pz=(bx-ax)/L,out=[];
 for(let i=0;i<=n;i++){const t=i/n,e=Math.sin(Math.min(1,t*1.15)*Math.PI),o=(noise(t*3.2+s,s*.7,sd+20)-.5)*2*amp*e+(noise(t*9+s,s,sd+21)-.5)*amp*.5*e+(noise(t*22+s,s,sd+24)-.5)*amp*.16;
  const wn=noise(t*7,s,sd+22),pool=sm(.62,.9,noise(t*10+s,3,sd+23)),w=lerp(w0,w1,Math.pow(t,.8))*(.7+wn*.7)+pool*2.2*t;
  const p={x:lerp(ax,bx,t)+px*o,z:lerp(az,bz,t)+pz*o,w,b:-(.12+.3*t+pool*(.4+t))};out.push(p);RIV.push(p)}return out}
function layout(sd){ISL.length=0;RIV.length=0;
 const add=(n,ty,sp,o)=>{let cx=0,cz=0;sp.forEach(p=>{cx+=p[0]/sp.length;cz+=p[1]/sp.length});let br=0;sp.forEach(p=>br=Math.max(br,dist(cx,cz,p[0],p[1])+p[2]*1.4));ISL.push(Object.assign({n,x:cx,z:cz,r:60,br,sp,ax:1,az:1,ty,fo:1,ro:0,mx:0,mz:0,mr:30,mh:3,tint:0},o))};
 /* main crescent island, open to the east */
 add('초승달 본섬',0,[[485,262,92],[340,315,138],[255,450,172],[330,590,166],[470,690,124],[612,648,72],[728,548,100]],{mr:115,mh:11});ISL[0].mx=250-ISL[0].x;ISL[0].mz=440-ISL[0].z;
 add('동북섬',3,[[690,160,92],[760,212,112],[822,272,88]],{fo:.6,ro:.05,mr:55,mh:8,tint:1});
 add('까마귀섬',4,[[150,140,46],[185,160,40]],{fo:1.1});add('조약돌섬',4,[[325,138,24],[345,145,22]],{fo:.4,ro:.08});add('갈매기섬',4,[[462,120,26],[488,128,28]],{fo:.7});
 add('안개섬',4,[[852,405,28],[872,420,26]],{fo:.5,ro:.06});add('이끼섬',4,[[885,690,48],[864,752,54]],{fo:1});add('물개섬',4,[[680,830,40],[712,838,42]],{fo:.4,ro:.07,tint:1});add('바람섬',4,[[92,675,44],[116,770,52]],{fo:.8});
 /* rivers: born inland, widen toward the sea, never cut the island in two */
 const r1=mkRiver(262,418,300,775,34,1.3,sd,.9,7),j=r1[(r1.length*.5)|0];mkRiver(165,545,j.x,j.z,16,4.1,sd,.8,3.2);
 mkRiver(292,400,452,470,22,6.6,sd,.9,5.5);mkRiver(372,335,352,170,18,2.7,sd,.8,4.6);const r4=mkRiver(205,395,95,470,14,9.2,sd,.8,4);
 mkRiver(418,655,462,560,12,5.2,sd,.8,4.2);mkRiver(700,572,742,668,10,8.4,sd,.8,4);
 RG=[];for(let i=0;i<RGN*RGN;i++)RG.push(null);RIV.forEach(p=>{const k=((p.z/RCELL)|0)*RGN+((p.x/RCELL)|0);if(k>=0&&k<RG.length)(RG[k]=RG[k]||[]).push(p)})}
/* ports: [x,z,town?,name] — rough spots; each one snaps to the nearest shoreline and faces the sea */
const PORT_SITES=[[438,526,1,'초승달 항구마을'],[144,779,0,'바람섬 항구',1],[699,281,0,'동북섬 항구',2],[588,600,0,'안쪽만 항구',3],[293,696,0,'강어귀 항구',0,13],[308,229,0,'북쪽 항구',4,25],[833,733,0,'이끼섬 항구',5],[212,168,0,'까마귀섬 항구',7]];
const PORTS=[];
/* supply spots (marked by hand in admin mode): cleared ground with a few supply crates */
const SUPPLY_SITES=[[103,754],[158,162],[822,266],[684,174],[687,843],[905,682],[486,708],[448,726],[451,703],[236,619],[216,401],[463,263],[402,608],[741,547]],SUPS=[];
function findSupply(sd){SUPS.length=0;SUPPLY_SITES.forEach((q,i)=>{let x=q[0],z=q[1];if(rawH(x,z,sd,1)<1){let ok=false;for(let r=2;r<40&&!ok;r+=2)for(let a=0;a<24;a++){const X=q[0]+Math.cos(a*.262)*r,Z=q[1]+Math.sin(a*.262)*r;if(rawH(X,Z,sd,1)>1.2){x=X;z=Z;ok=true;break}}if(!ok)return}
  let h=0;for(const[ox,oz]of[[0,0],[3,0],[-3,0],[0,3],[0,-3]])h+=rawH(x+ox,z+oz,sd,1)/5;SUPS.push({i,x,z,h:Math.max(1.05,h)})})}
const supD=(x,z)=>{let b=1e9;for(const s of SUPS){const ex=x-s.x,ez=z-s.z;if(ex>30||ex<-30||ez>30||ez<-30)continue;const d=Math.hypot(ex,ez);if(d<b)b=d}return b};
function findPorts(sd){PORTS.length=0;PORT_SITES.forEach((q,i)=>{const mx=q[0],mz=q[1],land=rawH(mx,mz,sd,1)>.25;let bx=0,bz=0,br=0;
  for(let r=2;r<110&&!br;r+=2)for(let a=0;a<40;a++){const x=mx+Math.cos(a*.157)*r,z=mz+Math.sin(a*.157)*r,h=rawH(x,z,sd,1);if(land?h<-1:h>.9){bx=x;bz=z;br=r;break}}
  if(!br)return;let dx=(bx-mx)/br,dz=(bz-mz)/br;if(!land){dx=-dx;dz=-dz}let x=land?mx:bx,z=land?mz:bz,k=0;while(k++<220&&rawH(x,z,sd,1)>.3){x+=dx;z+=dz}
  let gx=0,gz=0;for(const R of[5,9,14]){gx+=rawH(x+R,z,sd,1)-rawH(x-R,z,sd,1);gz+=rawH(x,z+R,sd,1)-rawH(x,z-R,sd,1)}const gl=Math.hypot(gx,gz);if(gl>.2&&-(gx*dx+gz*dz)/gl>.2){dx=-gx/gl;dz=-gz/gl}
  let wl=0,wr=0;for(let a=1;a<=40;a++){if(rawH(x-dx*8+dz*a,z-dz*8-dx*a,sd,1)<.4)break;wr=a}for(let a=1;a<=40;a++){if(rawH(x-dx*8-dz*a,z-dz*8+dx*a,sd,1)<.4)break;wl=a}
  PORTS.push({i,n:q[3],town:q[2],vi:q[4]||0,L:q[5]||0,wl,wr,sx:wl>=wr?1:-1,x,z,dx,dz,r:Math.atan2(dx,dz),R:q[2]?36:16})})}
let PG=null;const PATHS=[];
function mkPaths(sd){PG=[];for(let i=0;i<RGN*RGN;i++)PG.push(null);PATHS.length=0;const run=(pts,s)=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],L=dist(a[0],a[1],b[0],b[1]),n=Math.ceil(L/2),px=-(b[1]-a[1])/L,pz=(b[0]-a[0])/L;for(let i=0;i<=n;i++){const t=i/n,o=(noise(t*3+k*7+s,s,sd+40)-.5)*16*Math.sin(t*Math.PI),p={x:lerp(a[0],b[0],t)+px*o,z:lerp(a[1],b[1],t)+pz*o};PATHS.push(p);const c=((p.z/RCELL)|0)*RGN+((p.x/RCELL)|0);(PG[c]=PG[c]||[]).push(p)}}};
 /* no roads for now: run([[x,z],[x,z],...],seed) lays one */}
function pathD(x,z){const cx=(x/RCELL)|0,cz=(z/RCELL)|0;let bd=1e9;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const X=cx+i,Z=cz+j;if(X<0||Z<0||X>=RGN||Z>=RGN)continue;const L=PG[Z*RGN+X];if(!L)continue;for(const p of L){const d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd)bd=d}}return Math.sqrt(bd)}
let _rp=null;function riverD(x,z){const cx=(x/RCELL)|0,cz=(z/RCELL)|0;let bd=1e9;_rp=null;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const X=cx+i,Z=cz+j;if(X<0||Z<0||X>=RGN||Z>=RGN)continue;const L=RG[Z*RGN+X];if(!L)continue;for(const p of L){const d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd){bd=d;_rp=p}}}return Math.sqrt(bd)}
function spineD(I,x,z){let b=1e9;const s=I.sp;for(let i=0;i<s.length-1;i++){const ax=s[i][0],az=s[i][1],ex=s[i+1][0]-ax,ez=s[i+1][1]-az,t=clamp(((x-ax)*ex+(z-az)*ez)/(ex*ex+ez*ez),0,1),d=Math.hypot(x-ax-ex*t,z-az-ez*t)/(s[i][2]+(s[i+1][2]-s[i][2])*t);if(d<b)b=d}return b}
function islK(I,x,z,sd){if(I.sp){const d=spineD(I,x,z);if(d>1.32)return 0;const f=I.ty===4?.045:.017;return sm(1,.6,d+(fbm(x*f+3+I.x,z*f+7,sd)-.5)*.46+(fbm(x*.05,z*.05+I.z,sd+7)-.5)*.16)}
 const dx=(x-I.x)/(I.r*I.ax),dz=(z-I.z)/(I.r*I.az),t=I.ty;let d0=Math.hypot(dx,dz);if(d0>(t===0?1.5:1.36))return 0;
 if(t<2){const an=Math.atan2(dz,dx);d0*=1+.11*Math.sin(an*3+I.x)+.07*Math.sin(an*5+I.z*.7)+.04*Math.sin(an*9+I.r);if(d0>1.3)return 0}
 const w=fbm(x*(t===2?.09:t===1?.022:.0085)+3+I.x,z*(t===2?.09:t===1?.022:.0085)+7,sd)+(t===0?(fbm(x*.028,z*.028+I.z,sd+7)-.5)*.34:0);
 return sm(1,.6,d0+(w-.5)*(t===2?.22:t===1?.4:.44))}
/* land above the beach is squeezed into a narrow band (there is no jump): UH() gives back the "natural" height for colouring and plant choice */
const FLAT=.9,UH=h=>{if(h<=1)return h;const u=(h-1)/FLAT;return u>=.998?20:1-3*Math.log(1-u)};
/* sea lighthouses stand on rock islets raised from the seabed at the user's memo marks */
const LH_SITES=[[491,898,'남쪽 바다 등대'],[250,892,'남서 등대'],[86,274,'서쪽 바다 등대'],[80,909,'땅끝 등대'],[563,453,'안쪽만 등대'],[563,68,'북쪽 바다 등대'],[928,527,'동쪽 바다 등대'],[836,889,'남동 등대']],LHS=LH_SITES.map(q=>({x:q[0],z:q[1],n:q[2]})),LH_TOP=1.5;
const lhD=(x,z)=>{let b=1e9;for(const q of LH_SITES){const ex=x-q[0],ez=z-q[1];if(ex>20||ex<-20||ez>20||ez<-20)continue;const d=Math.hypot(ex,ez);if(d<b)b=d}return b};
function lhRock(x,z,h,sd){for(let i=0;i<LH_SITES.length;i++){const q=LH_SITES[i],ex=x-q[0],ez=z-q[1];if(ex>18||ex<-18||ez>18||ez<-18)continue;const d=Math.hypot(ex,ez),an=Math.atan2(ez,ex),w=1+.12*Math.sin(an*3+i*1.7)+.07*Math.sin(an*5+i)+(noise(x*.3+i*9,z*.3,sd+70)-.5)*.2,e=d/w;
  if(e>15)continue;const t=sm(6.6,14,e),pr=LH_TOP-5*Math.pow(t,.85)+(e>6.6?(noise(x*.6,z*.6+i*5,sd+71)-.5)*.5*(1-t):0);if(pr>h)h=pr}return h}
function rawH(x,z,sd,noVil){let land=0,bi=-1;for(let i=0;i<ISL.length;i++){const I=ISL[i],m=I.br||I.r*1.45;if(x-I.x>m||I.x-x>m||z-I.z>m||I.z-z>m)continue;const k=islK(I,x,z,sd);if(k>land){land=k;bi=i}}
 _bi=bi;if(bi<0)return lhRock(x,z,-3.5,sd);const I=ISL[bi];let h=-3.5+land*4.6;
 if(h>0){const inl=sm(.78,1,land);
  if(I.ty===2)h+=inl*(.25+fbm(x*.16,z*.16,sd+3)*1.3);
  else{h=h*.9+inl*(1+(fbm(x*.03,z*.03,sd+3)-.35)*3.2);const w=fbm(x*.012+3,z*.012+7,sd),m=sm(1,.25,dist(x,z,I.x+I.mx,I.z+I.mz)/I.mr+(w-.5)*.5);h+=m*inl*(1.5+fbm(x*.02+9,z*.02,sd+5)*I.mh)}}
 if(h>1)h=1+FLAT*(1-Math.exp(-(h-1)/3));
 if(I.ty===0&&h>-1.6){const rd=riverD(x,z);if(_rp&&rd<_rp.w*3+22){const p=_rp,v=p.w*3+10;if(h>1.2)h=lerp(h,1.2+(h-1.2)*.14,1-sm(p.w+4,p.w+v+8,rd));if(h>p.b)h=lerp(h,p.b,1-sm(p.w*.8,p.w+3.5,rd))}}
 if(!noVil){
  for(const p of PORTS){const ex=x-p.x,ez=z-p.z;if(ex>70||ex<-70||ez>70||ez<-70)continue;const al=ex*p.dx+ez*p.dz,la=Math.abs(ex*p.dz-ez*p.dx),dd=Math.hypot(ex,ez);
   if(al<0&&dd<p.R)h=lerp(h,1.15,(1-sm(p.R*.6,p.R,dd))*sm(-3,-6.5,al));const Lb=p.town?27:(p.L||22)+3,Wb=p.town?22:11;
   if(al>-6&&al<Lb+8&&la<Wb+6){const cap=al<-3?lerp(1.15,.5,(al+6)/3):al<1?lerp(.5,-.15,(al+3)/4):al<5?lerp(-.15,-1.6,(al-1)/4):-1.6;if(h>cap)h=lerp(h,cap,(1-sm(Wb,Wb+6,la))*(1-sm(Lb,Lb+8,al)))}}
  for(const s of SUPS){const ex=x-s.x,ez=z-s.z;if(ex>10||ex<-10||ez>10||ez<-10)continue;h=lerp(h,s.h,1-sm(4.5,9.5,Math.hypot(ex,ez)))}}
 return lhRock(x,z,h,sd)}
function buildHeights(sd){SEED=sd;layout(sd);const A=ISL[0],B=ISL[1];
 findPorts(sd);{const p=PORTS[0];VIL.x=p.x-p.dz*1.6-p.dx*14.4;VIL.z=p.z+p.dx*1.6-p.dz*14.4;VIL.px=p.x-p.dx*13;VIL.pz=p.z-p.dz*13}OUT.x=OUT.z=-9999;   /* the hub (spawn, safe zone, merchant) is the harbour town */
 findSupply(sd);mkPaths(sd);
 const N=WS+1;HG=new Float32Array(N*N);IG=new Uint8Array(IGN*IGN);for(let z=0;z<=WS;z++)for(let x=0;x<=WS;x++){HG[z*N+x]=rawH(x,z,sd);if(x%IGS===0&&z%IGS===0)IG[(z/IGS)*IGN+x/IGS]=_bi+1}}
function hAt(x,z){x=clamp(x,0,WS-.001);z=clamp(z,0,WS-.001);const xi=x|0,zi=z|0,fx=x-xi,fz=z-zi,i=zi*(WS+1)+xi;return (HG[i]*(1-fx)+HG[i+1]*fx)*(1-fz)+(HG[i+WS+1]*(1-fx)+HG[i+WS+2]*fx)*fz}
const islAt=(x,z)=>{const v=IG[clamp(Math.round(z/IGS),0,IGN-1)*IGN+clamp(Math.round(x/IGS),0,IGN-1)];return v?ISL[v-1]:null};
const tundraAt=(x,z,h)=>sm(.5,.68,noise(x*.03+3,z*.03+9,2))*sm(5,2.5,h)*sm(.9,1.4,h);
/* ===== data ===== */
const ITEMS={
 wood:{n:'나무',ic:'resource_lumber',ty:'res',p:2,d:'건설과 제작의 기본 재료'},stone:{n:'돌',ic:'resource_stone',ty:'res',p:2,d:'바위에서 캐는 재료'},
 scrap:{n:'고철',ic:'scrap',ty:'res',p:6,d:'잔해와 상자에서 얻어요. 총과 탄약의 재료'},powder:{n:'화약',ic:'keg',ty:'res',p:9,d:'탄약과 수류탄에 들어가요'},
 cloth:{n:'천',ic:'cloth',ty:'res',p:5,d:'붕대, 모래주머니에 써요'},
 berry:{n:'산딸기',ic:'berries',ty:'food',food:9,p:3,d:'덤불에서 따요. 배고픔 +9'},can:{n:'통조림',ic:'can',ty:'food',food:38,p:14,d:'든든한 전투식량. 배고픔 +38'},
 bandage:{n:'붕대',ic:'bandage',ty:'heal',heal:40,p:16,d:'체력 +40'},
 ammoS:{n:'권총탄',ic:'ammoS',ty:'ammo',p:1.5,d:'권총과 기관단총용'},ammoL:{n:'소총탄',ic:'ammoL',ty:'ammo',p:2.5,d:'소총, 산탄총, 기관총 진지용'},
 grenade:{n:'수류탄',ic:'grenade',ty:'throw',p:28,d:'던지면 주변에 큰 피해'},
 axe:{n:'손도끼',ic:'axe_m',ty:'tool',p:20,d:'나무와 바위를 빨리 캐요. 근접 14',one:1},
 kit_tent:{n:'텐트',ic:'mtent',ty:'kit',b:'ptent',p:60,d:'어디든 펴면 내 기지(부활 지점)가 돼요. 안에 들어갈 수 있어요'},kit_stash:{n:'보관 상자',ic:'mstash',ty:'kit',b:'stash',p:40,d:'튼튼한 보관함. 모든 상자가 이어져 있어요'},
 pistol:{n:'권총',ic:'pistol',ty:'gun',p:90,d:'가볍고 빠른 기본 총. 피해 16',one:1},rifle:{n:'볼트액션 소총',ic:'rifle',ty:'gun',p:260,d:'멀리서 한 발씩 강하게. 피해 48',one:1},
 smg:{n:'기관단총',ic:'smg',ty:'gun',p:420,d:'빠르게 쏟아붓는 연사. 피해 10',one:1},shotgun:{n:'산탄총',ic:'shotgun',ty:'gun',p:340,d:'가까울수록 강해요. 피해 9×6',one:1}};
const FISH=[{id:'f_herring',n:'청어',w:[50,20],str:1,p:5,food:18,cm:[22,36],back:0x5f7f9f,belly:0xdfe7ef,len:.8,h:.26,w2:.17},
 {id:'f_char',n:'북극곤들매기',w:[16,6],str:2,p:10,food:24,cm:[30,58],back:0x55684f,belly:0xe0743a,len:.9,h:.3,w2:.19},
 {id:'f_cod',n:'대구',w:[18,40],str:2,p:12,food:28,cm:[45,95],back:0x8a7d55,belly:0xe8e0c8,len:1,h:.34,w2:.25},
 {id:'f_lump',n:'도치',w:[12,6],str:2,p:14,food:26,cm:[25,48],back:0x4f7a74,belly:0xa9c59a,len:.68,h:.52,w2:.38},
 {id:'f_salmon',n:'대서양연어',w:[4,16],str:3,p:22,food:34,cm:[55,100],back:0x7d8ea0,belly:0xf1e9e2,len:1.05,h:.32,w2:.21},
 {id:'f_halibut',n:'넙치',w:[0,10],str:4,p:34,food:42,cm:[60,150],back:0x6b5a43,belly:0xece4d8,len:.95,h:.64,w2:.13},
 {id:'f_shark',n:'그린란드상어',w:[0,1.4],str:5,p:140,food:60,cm:[180,420],back:0x55606b,belly:0x9aa3ab,len:1.35,h:.36,w2:.3,legend:1}];
FISH.forEach(f=>{ITEMS[f.id]={n:f.n,ic:f.id,ty:'fish',food:6,p:f.p,d:`${f.legend?'전설의 물고기! ':''}날로 먹으면 배고픔 +6. 모닥불에 구우면 +${f.food}`};ITEMS['c'+f.id]={n:'구운 '+f.n,ic:'c'+f.id,ty:'food',food:f.food,p:Math.round(f.p*1.5),d:`잘 구운 ${f.n}. 배고픔 +${f.food}`}});
ITEMS.rod={n:'낚싯대',ic:'rod',ty:'tool',p:30,d:'물가에서 물을 바라보고 던져요. 깊은 곳일수록 큰 물고기가 물어요',one:1};
const WEAP={rod:{rod:1,dmg:0,cd:1,range:0,h1:1},fist:{melee:1,dmg:6,cd:.5,range:2},axe:{melee:1,dmg:14,cd:.5,range:2.3},
 pistol:{dmg:16,cd:.32,range:16,ammo:'ammoS',spread:.03,h1:1},rifle:{dmg:48,cd:1.0,range:27,ammo:'ammoL',spread:.008},
 smg:{dmg:10,cd:.095,range:15,ammo:'ammoS',spread:.07},shotgun:{dmg:9,pel:6,cd:.9,range:11,ammo:'ammoL',spread:.17}};
const RECIPES=[{id:'axe',n:1,c:{wood:3,stone:2}},{id:'rod',n:1,c:{wood:4,cloth:1}},{id:'bandage',n:1,c:{cloth:2}},
 {id:'ammoS',n:12,c:{scrap:1,powder:1},bench:1},{id:'ammoL',n:8,c:{scrap:2,powder:1},bench:1},{id:'grenade',n:1,c:{scrap:3,powder:3},forge:1},
 {id:'pistol',n:1,c:{scrap:8,wood:2},bench:1},{id:'rifle',n:1,c:{scrap:14,wood:6},forge:1},{id:'shotgun',n:1,c:{scrap:16,wood:5},forge:1},{id:'smg',n:1,c:{scrap:24,wood:3},forge:1}];
/* builds: g=geometry, s=scale, bx/bz=half extents, hp */
const BUILDS={fire:{n:'모닥불',g:'firepit',s:1,bx:.8,bz:.8,hp:60,c:{wood:5,stone:3},d:'몸을 녹이고 밤을 밝혀요'},
 bench:{n:'작업대',g:'bench',s:1,bx:1.3,bz:.8,hp:120,c:{wood:10,stone:4},d:'총과 탄약을 만들어요'},

 torch:{n:'횃불',g:'torch_lit',s:1.7,bx:.3,bz:.3,hp:30,c:{wood:2},d:'밤에 주변을 밝혀요'},
 fence:{n:'나무 울타리',g:'fence',s:1,bx:1,bz:.25,hp:70,c:{wood:2},d:'값싼 방어선',grid:1},
 sandbag:{n:'모래주머니',g:'sandbag',s:1,bx:1,bz:.45,hp:220,c:{cloth:1,stone:3},d:'튼튼한 엄폐물',grid:1},
 wall:{n:'석벽',g:'wall_straight',s:1,bx:1,bz:.4,hp:420,c:{stone:10,wood:2},d:'가장 단단한 벽',grid:1},
 gate:{n:'성문',g:'gateB',s:1,bx:1,bz:.4,hp:380,c:{stone:8,wood:6},d:'나는 지나가고 적은 막아요',grid:1,gate:1},
 spike:{n:'가시 함정',g:'spike',s:1,bx:.9,bz:.9,hp:90,c:{wood:6,scrap:2},d:'밟은 적이 다쳐요. 쓸수록 닳아요',pass:1,trap:1},
 mine:{n:'지뢰',g:'mine',s:1,bx:.4,bz:.4,hp:20,c:{scrap:4,powder:4},d:'적이 밟으면 크게 터져요. 한 번 쓰면 사라져요',pass:1,trap:2},
 gen:{n:'발전기',g:'gen',s:1,bx:.8,bz:.6,hp:160,c:{scrap:15,wood:5},d:'나무를 연료로 주변 16칸의 탐조등에 전기를 보내요'},
 slight:{n:'탐조등',g:'slbase',s:1,bx:.5,bz:.5,hp:120,c:{scrap:10,wood:4},d:'밤에 적을 비춰요. 비친 적은 피해를 30% 더 받고, 악령은 빛에 타요. 발전기가 필요해요'},
 forge:{n:'대장간',g:'blacksmith',s:3.8,bx:2.3,bz:2.2,hp:500,c:{wood:30,stone:30,scrap:10},d:'소총, 산탄총, 기관단총, 수류탄을 만드는 곳'},
 turret:{n:'자동 포탑',g:'tbase',s:1,bx:.6,bz:.6,hp:240,c:{scrap:24,wood:5},d:'사거리 안의 적을 스스로 찾아 쏴요. 권총탄을 넣어요',tur:{head:'thead',brl:'tbrl',range:14,cd:.2,dmg:10,ammo:'ammoS',cap:240,load:60,snd:'smg',bz:.4,fl:.92}},
 ptent:{n:'텐트',g:'mtent',s:1,bx:1.25,bz:1.3,hp:220,c:{cloth:10,wood:6},kit:'kit_tent',home:1,fixR:1,d:'내 기지(부활 지점)가 돼요. 안에 들어갈 수 있어요'},
 stash:{n:'보관 상자',g:'mstash',s:1,kit:'kit_stash',fixR:1,bx:.75,bz:.6,hp:160,c:{wood:8,scrap:2},d:'물건을 맡겨요. 쓰러져도 안전하고, 모든 상자가 이어져 있어요'},
 home:{n:'오두막',g:'home_A',s:4.1,bx:1.5,bz:1.6,hp:600,c:{wood:40,stone:20},d:'기지의 중심. 근처에 있으면 따뜻하고 체력이 빨리 회복돼요'}};
const ENEMY={bandit:{n:'약탈자',hp:42,sp:3.7,dmg:9,reach:1.9,w:'dagger',col:[.62,.2,.18],loot:[['cloth',1,.6],['berry',2,.3],['coin',6,1]]},
 gunner:{n:'소총수',hp:36,sp:3.2,dmg:10,range:14,w:'rifle',col:[.3,.34,.42],helmet:1,loot:[['ammoL',5,.7],['scrap',2,.6],['coin',9,1]]},
 rgolem:{n:'바위 골렘',hp:240,sp:2.1,dmg:26,reach:3.0,proc:'rg',big:1,blood:0x9aa1a8,loot:[['stone',8,1],['scrap',4,.7],['coin',30,1]]},
 wgolem:{n:'나무 골렘',hp:105,sp:3.0,dmg:14,reach:2.3,proc:'wg',blood:0x8a5a32,loot:[['wood',8,1],['berry',3,.6],['coin',14,1]]},
 wraith:{n:'악령',hp:52,sp:3.3,dmg:12,range:12,proc:'wr',blood:0x9fe8ff,loot:[['powder',3,.8],['cloth',2,.7],['coin',18,1]]},
 plant:{n:'식인 덩굴',hp:85,sp:0,dmg:19,reach:3.4,proc:'pl',root:1,blood:0x5fae4a,loot:[['berry',5,1],['cloth',2,.6],['coin',10,1]]},
 brute:{n:'두목',hp:190,sp:2.9,dmg:22,reach:2.4,w:'axe_2handed',big:1,col:[.5,.16,.14],loot:[['scrap',8,1],['powder',4,1],['can',2,1],['coin',40,1]]}};
const SHOP={sell:['kit_tent','axe','rod','kit_stash'],mult:1,free:1};   /* 초승달 항구마을 상인 품목. free:1 = 아직 재화 없이 무료 */
const QUESTS=[{t:'나무 3개와 돌 2개 모으기',c:s=>s.st.wood>=3&&s.st.stone>=2,r:10},{t:'가방 › 제작에서 손도끼 만들기',c:s=>(s.inv.axe||0)>0,r:10},
 {t:'건설에서 모닥불 피워 몸 녹이기',c:s=>s.st.b_fire>0,r:15},{t:'텐트를 쳐서 내 기지 정하기 (상인에게 받아요)',c:s=>s.st.b_ptent>0,r:20},{t:'낚싯대를 만들어 물고기 낚기',c:s=>s.st.fish>0,r:20},{t:'모닥불에서 생선 굽기',c:s=>s.st.cook>0,r:15},{t:'고철 모으기 (잔해, 상자, 약탈자)',c:s=>s.st.scrap>=6,r:20},
 {t:'작업대를 짓고 탄약 만들기',c:s=>s.st.c_ammoS+s.st.c_ammoL>0,r:25},{t:'약탈자 5명 물리치기',c:s=>s.st.kills>=5,r:40},{t:'모래주머니 4개로 방어선 만들기',c:s=>s.st.b_sandbag>=4,r:30},
 {t:'첫 밤 습격 막아내기',c:s=>s.st.raids>=1,r:60},{t:'볼트액션 소총 구하기',c:s=>(s.inv.rifle||0)>0,r:50},
 {t:'자동 터렛을 세우고 탄약 넣기',c:s=>s.st.b_tur>0,r:80},{t:'바다 위 등대에 불 켜기 (헤엄쳐서 가요)',c:s=>Object.keys(s.lh||{}).length>=1,r:60},{t:'발전기와 탐조등 세우기',c:s=>s.st.b_slight>0,r:80},{t:'바다 등대 8곳 모두 밝히기',c:s=>Object.keys(s.lh||{}).length>=8,r:300}];
/* ===== dev mode: god/no-clip/fast travel + map markers (kept apart from the save) ===== */
const MTYPE=[['⚓','항구','#4fc3ff'],['🏠','마을','#ffb547'],['👹','몬스터','#ff6b5e'],['⛏','자원','#7bd88f'],['📝','메모','#d0b4ff']];
const DEV={on:false,sp:3,type:0,marks:[],mapMark:false,qty:1,q:''};
function devLoad(){try{const d=JSON.parse(localStorage.getItem('frontisle_dev'));if(d){DEV.on=!!d.on;DEV.marks=d.marks||[];DEV.sp=d.sp||3}}catch(e){}}
function devSave(){try{localStorage.setItem('frontisle_dev',JSON.stringify({on:DEV.on,marks:DEV.marks,sp:DEV.sp}))}catch(e){}}
/* ===== state ===== */
let S=null,opt={snd:true,gfx:1};
function freshState(seed){return{seed,px:null,pz:null,hp:100,hunger:100,warm:100,time:.3,day:1,coins:30,inv:{pistol:1,ammoS:36,can:2,bandage:1},quick:['pistol',null,'can','bandage',null,null],sel:0,
 home:null,q:0,st:{wood:0,stone:0,scrap:0,kills:0,raids:0,camps:0,boss:0,c_ammoS:0,c_ammoL:0,b_fire:0,b_ptent:0,b_sandbag:0,b_mg:0,b_tur:0,b_slight:0,bunk:0,fish:0,cook:0},caught:{},best:{},
 built:[],dep:{},looted:{},lh:{},campDay:{},bag:null,raidDone:0,stash:{}}}
const invN=id=>S.inv[id]||0;
function give(id,n){if(id==='coin'){S.coins+=n;return}S.inv[id]=(S.inv[id]||0)+n;if(S.st[id]!==undefined)S.st[id]+=n;if(ITEMS[id].ty!=='res'&&ITEMS[id].ty!=='ammo'&&ITEMS[id].ty!=='fish'&&!S.quick.includes(id)){const i=S.quick.indexOf(null);if(i>=0)S.quick[i]=id}}
function take(id,n){if(invN(id)<n)return false;S.inv[id]-=n;if(S.inv[id]<=0){delete S.inv[id];const i=S.quick.indexOf(id);if(i>=0)S.quick[i]=null}return true}
const canPay=c=>DEV.on||Object.keys(c).every(k=>invN(k)>=c[k]);
const pay=c=>{if(!DEV.on)Object.keys(c).forEach(k=>take(k,c[k]))};
/* 상점에서 산 설치 키트가 있으면 재료 대신 키트를 써요 */
const hasKit=k=>!!(BUILDS[k]&&BUILDS[k].kit&&invN(BUILDS[k].kit)>0),canBuild=k=>hasKit(k)||canPay(BUILDS[k].c),payBuild=k=>{if(hasKit(k)){if(!DEV.on)take(BUILDS[k].kit,1);return 1}pay(BUILDS[k].c);return 0};
const dark=()=>S?clamp((Math.cos(S.time*Math.PI*2)-.12)/.55,0,1):0;
let AC=null;function sfx(f,d=.09,ty='triangle',v=.06,slide=0){if(!opt.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),AC.currentTime+d);g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function shotSfx(k){if(!opt.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*.12,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=k==='rifle'?900:k==='shotgun'?650:1600;const g=AC.createGain();g.gain.value=k==='smg'?.16:.28;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
let windG=null;function windInit(){if(windG)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*3,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<n;i++){v=v*.985+(Math.random()*2-1)*.015;d[i]=v*7*Math.min(1,i/2000,(n-i)/2000)}const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=380;f.Q.value=.5;windG=AC.createGain();windG.gain.value=0;s.connect(f);f.connect(windG);windG.connect(AC.destination);s.start()}catch(e){}}
function windVol(v){if(windG)windG.gain.value=opt.snd?v:0}
const WX={b:0,on:false,t:200+Math.random()*200};
const jingle=a=>a.forEach((f,i)=>setTimeout(()=>sfx(f,.14),i*90));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
