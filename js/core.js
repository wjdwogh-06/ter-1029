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
/* 55차(규칙, 기획자 11-22): 크리에이티브 블록으로 그린 자리(맨 아래 가운데, 옛 '남쪽 바다 등대' 바위섬 둘레)에 새 섬. pg = 그린 선(블록 바깥 테두리를 매끈하게), k = 그 선보다 조금 크게.
   땅 모양은 그 선까지의 거리(pgSD)로 정해요 → 북쪽의 작은 만 두 곳도 그대로. 이름은 임시 */
const NEWISLE={n:'거북섬',x:487.8,z:894.2,k:1.16,fo:1,ro:0,pg:[[484,933.5],[478,933.5],[471,930.5],[463,924.5],[448.5,909],[446.5,905],[446.5,895],[453.5,874],[457,869.5],[470,865.5],[479,855.5],[485,854.5],[488.5,856],[484.5,870],[481.5,874],[481.5,877],[485,880.5],[490.5,874],[494.5,863],[501,857.5],[506.5,858],[506.5,874],[512,877.5],[518.5,873],[516.5,859],[518,857.5],[524,858.5],[529.5,865],[531.5,874],[529.5,876],[530.5,881],[528.5,883],[528.5,893],[526.5,895],[527.5,896],[523.5,905],[510,920.5]]};
/* 59차(규칙, 기획자 11-22 20:58): 블록으로 그린 섬 27개 더 — 수달섬(남서 바다), 반달섬 + 반달 바위섬 5(안쪽 바다), 해달섬·띠섬(북동 끝), 징검 바위섬 18(본섬 남동 바닷가 앞). 이름은 임시.
   pg = 그린 선(블록 바깥 테두리를 매끈하게), 가운데·k(1.16배 키움)는 mkPgIsle가 정해요. 작은 섬일수록 바닷가 경사·들쭉날쭉을 좁혀요(안쪽 반지름 rin에 맞춤). */
const NEWISLES=[
{n:'수달섬',pg:[[244.0,811.5],[237.0,811.5],[230.5,806.0],[230.5,799.0],[235.5,795.0],[239.5,788.0],[238.5,782.0],[235.5,778.0],[235.5,771.0],[237.5,767.0],[245.0,760.5],[252.0,757.5],[260.0,760.5],[262.0,759.5],[264.0,761.5],[282.0,756.5],[288.0,757.5],[293.5,767.0],[293.5,772.0],[290.5,781.0],[287.5,784.0],[287.5,787.0],[279.5,802.0],[267.0,803.5],[264.0,806.5],[258.0,806.5]]},
{n:'반달섬',pg:[[660.0,424.5],[653.0,424.5],[647.5,421.0],[647.5,417.0],[651.0,413.5],[656.0,412.5],[662.5,404.0],[662.5,396.0],[655.0,393.5],[649.5,388.0],[650.5,383.0],[656.0,379.5],[665.0,380.5],[671.5,386.0],[674.5,396.0],[673.5,400.0],[675.5,403.0],[675.5,407.0],[670.5,411.0],[668.5,416.0]]},
{n:'반달 바위섬',pg:[[598.0,408.5],[595.0,408.5],[593.5,406.0],[594.5,402.0],[597.0,399.5],[599.5,402.0],[599.5,407.0]]},
{n:'반달 바위섬',pg:[[605.0,481.5],[602.5,481.0],[602.5,477.0],[605.0,473.5],[607.0,473.5],[608.5,475.0],[608.5,477.0]]},
{n:'반달 바위섬',pg:[[608.0,419.5],[606.5,418.0],[606.5,413.0],[610.0,410.5],[612.5,413.0],[612.5,416.0]]},
{n:'반달 바위섬',pg:[[610.0,444.5],[605.5,444.0],[605.5,441.0],[608.0,438.5],[612.5,439.0],[612.5,442.0]]},
{n:'반달 바위섬',pg:[[647.0,410.5],[644.0,410.5],[642.5,409.0],[642.5,403.0],[647.0,398.5],[650.0,397.5],[652.5,399.0],[653.5,401.0],[650.5,407.0]]},
{n:'해달섬',pg:[[880.0,78.5],[873.0,78.5],[870.0,74.5],[865.0,73.5],[860.0,67.5],[854.0,64.5],[850.0,65.5],[845.5,60.0],[843.5,56.0],[843.5,48.0],[849.5,33.0],[853.0,29.5],[864.0,27.5],[872.0,30.5],[879.0,30.5],[886.0,34.5],[906.5,53.0],[907.5,64.0],[901.0,73.5],[892.0,77.5],[887.0,76.5],[885.0,74.5]]},
{n:'띠섬',pg:[[864.0,103.5],[849.0,101.5],[830.0,93.5],[823.5,85.0],[823.5,78.0],[826.5,72.0],[830.0,69.5],[832.0,71.5],[836.0,71.5],[848.0,76.5],[856.5,85.0],[858.0,88.5],[866.0,90.5],[872.0,89.5],[870.5,97.0]]},
{n:'징검 바위섬',pg:[[699.0,676.5],[696.5,675.0],[696.5,672.0],[704.0,663.5],[705.5,665.0],[705.5,670.0],[703.5,674.0]]},
{n:'징검 바위섬',pg:[[703.0,691.5],[702.0,690.5],[700.0,690.5],[698.5,688.0],[698.5,684.0],[701.0,680.5],[704.0,680.5],[707.5,685.0],[705.5,689.0]]},
{n:'징검 바위섬',pg:[[716.0,671.5],[712.5,669.0],[711.5,664.0],[710.5,663.0],[710.5,661.0],[711.5,660.0],[710.5,659.0],[710.5,657.0],[712.0,655.5],[716.0,655.5],[718.5,657.0],[718.5,664.0],[720.5,667.0]]},
{n:'징검 바위섬',pg:[[716.0,687.5],[712.0,686.5],[709.5,684.0],[709.5,680.0],[711.5,677.0],[714.0,675.5],[716.5,676.0],[716.5,678.0],[719.5,683.0],[719.5,684.0]]},
{n:'징검 바위섬',pg:[[725.0,654.5],[720.5,654.0],[720.5,651.0],[724.0,644.5],[726.0,644.5],[729.5,647.0],[729.5,650.0],[727.5,653.0]]},
{n:'징검 바위섬',pg:[[727.0,694.5],[723.0,694.5],[721.5,693.0],[721.5,689.0],[726.0,685.5],[729.0,685.5],[730.5,688.0],[728.5,693.0]]},
{n:'징검 바위섬',pg:[[730.0,681.5],[725.0,680.5],[723.5,678.0],[723.5,672.0],[726.0,668.5],[730.0,668.5],[734.5,672.0],[733.5,674.0],[734.5,675.0],[734.5,678.0]]},
{n:'징검 바위섬',pg:[[731.0,664.5],[728.0,664.5],[726.5,663.0],[726.5,659.0],[732.0,652.5],[733.0,653.5],[735.0,653.5],[739.5,658.0],[735.0,662.5]]},
{n:'징검 바위섬',pg:[[738.0,692.5],[736.0,692.5],[732.5,688.0],[732.5,686.0],[735.0,682.5],[736.5,683.0],[738.5,687.0]]},
{n:'징검 바위섬',pg:[[739.0,648.5],[736.0,648.5],[734.5,645.0],[736.5,641.0],[740.0,639.5],[742.5,642.0],[742.5,645.0],[741.5,647.0]]},
{n:'징검 바위섬',pg:[[739.0,674.5],[737.5,667.0],[744.5,658.0],[743.5,654.0],[747.0,650.5],[750.0,650.5],[751.5,652.0],[751.5,654.0],[750.5,655.0],[749.5,662.0],[745.5,667.0],[744.5,671.0]]},
{n:'징검 바위섬',pg:[[746.0,684.5],[741.0,683.5],[740.5,681.0],[744.0,677.5],[748.0,676.5],[748.5,681.0]]},
{n:'징검 바위섬',pg:[[751.0,644.5],[748.0,644.5],[745.5,641.0],[745.5,639.0],[750.0,631.5],[752.0,631.5],[753.0,632.5],[756.0,631.5],[756.5,633.0],[754.5,636.0],[754.5,640.0]]},
{n:'징검 바위섬',pg:[[755.0,672.5],[751.0,672.5],[750.5,670.0],[753.5,662.0],[756.0,660.5],[760.5,664.0],[760.5,666.0]]},
{n:'징검 바위섬',pg:[[757.0,656.5],[754.5,656.0],[754.5,651.0],[758.5,642.0],[762.0,640.5],[763.5,642.0],[763.5,649.0]]},
{n:'징검 바위섬',pg:[[766.0,637.5],[763.0,637.5],[761.5,636.0],[761.5,629.0],[763.0,626.5],[766.0,624.5],[769.0,624.5],[771.5,628.0],[771.5,630.0]]},
{n:'징검 바위섬',pg:[[768.0,661.5],[764.0,660.5],[762.5,658.0],[765.5,652.0],[767.5,644.0],[769.5,642.0],[770.5,639.0],[772.0,637.5],[774.0,637.5],[777.5,641.0],[777.5,642.0],[773.5,652.0],[772.5,658.0]]},
{n:'징검 바위섬',pg:[[779.0,634.5],[776.0,634.5],[773.5,632.0],[773.5,630.0],[774.5,629.0],[774.5,627.0],[777.0,624.5],[780.0,623.5],[782.5,627.0],[782.5,631.0]]}];
const ISLE_OFF=['징검 바위섬'];   /* 60차(기획자 11-22 21:28: '오른쪽 아래 섬 많은 것들은 그냥 지우자'): 본섬 남동 바닷가 앞 징검 바위섬 18개는 섬으로 안 만들어요(그린 선은 블록 지우기에만 써요) */
function mkPgIsle(N){let cx=N.x,cz=N.z;const q=N.pg;if(cx==null){let A=0,sx=0,sz=0;for(let i=0,j=q.length-1;i<q.length;j=i++){const c=q[j][0]*q[i][1]-q[i][0]*q[j][1];A+=c;sx+=(q[j][0]+q[i][0])*c;sz+=(q[j][1]+q[i][1])*c}cx=sx/(3*A);cz=sz/(3*A)}
 const k=N.k||1.16,pg=q.map(p=>[cx+(p[0]-cx)*k,cz+(p[1]-cz)*k]);let mr=0,x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;pg.forEach(p=>{mr=Math.max(mr,dist(cx,cz,p[0],p[1]));x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])});
 let rin=0;for(let z=z0;z<=z1;z+=.5)for(let x=x0;x<=x1;x+=.5){const v=-pgSD(pg,x,z);if(v>rin)rin=v}
 const wi=clamp(rin*.55,1.4,5),wo=wi*1.8,na=clamp(rin*.45,.5,7),nb=clamp(rin*.16,.2,2.5),cut=wo+(na+nb)*.5+1;
 return{n:N.n,x:cx,z:cz,r:60,br:mr+cut+2,pg,wi,wo,na,nb,cut,rin,ax:1,az:1,ty:4,fo:N.fo!=null?N.fo:1,ro:N.ro!=null?N.ro:(rin<6?.12:0),mx:0,mz:0,mr:Math.min(30,mr),mh:rin<8?1:3,tint:0}}
function layout(sd){ISL.length=0;RIV.length=0;
 const add=(n,ty,sp,o)=>{let cx=0,cz=0;sp.forEach(p=>{cx+=p[0]/sp.length;cz+=p[1]/sp.length});let br=0;sp.forEach(p=>br=Math.max(br,dist(cx,cz,p[0],p[1])+p[2]*1.4));ISL.push(Object.assign({n,x:cx,z:cz,r:60,br,sp,ax:1,az:1,ty,fo:1,ro:0,mx:0,mz:0,mr:30,mh:3,tint:0},o))};
 /* main crescent island, open to the east */
 add('초승달 본섬',0,[[485,262,92],[340,315,138],[255,450,172],[330,590,166],[470,690,124],[612,648,72],[728,548,100]],{mr:115,mh:11});ISL[0].mx=250-ISL[0].x;ISL[0].mz=440-ISL[0].z;
 add('동북섬',3,[[690,160,92],[760,212,112],[822,272,88]],{fo:.6,ro:.05,mr:55,mh:8,tint:1});
 add('까마귀섬',4,[[150,140,46],[185,160,40]],{fo:1.1});add('조약돌섬',4,[[325,138,24],[345,145,22]],{fo:.4,ro:.08});add('갈매기섬',4,[[462,120,26],[488,128,28]],{fo:.7});
 add('안개섬',4,[[852,405,28],[872,420,26]],{fo:.5,ro:.06});add('이끼섬',4,[[885,690,48],[864,752,54]],{fo:1});add('물개섬',4,[[680,830,40],[712,838,42]],{fo:.4,ro:.07,tint:1});add('바람섬',4,[[92,675,44],[116,770,52]],{fo:.8});
 [NEWISLE,...NEWISLES.filter(N=>!ISLE_OFF.includes(N.n))].forEach(N=>ISL.push(mkPgIsle(N)));   /* 55차 거북섬 + 59차 새 섬들 — 그린 선을 키운 다각형 섬 */
 /* rivers: born inland, widen toward the sea, never cut the island in two */
 const r1=mkRiver(262,418,300,775,34,1.3,sd,.9,7),j=r1[(r1.length*.5)|0];mkRiver(165,545,j.x,j.z,16,4.1,sd,.8,3.2);
 mkRiver(292,400,452,470,22,6.6,sd,.9,5.5);mkRiver(372,335,352,170,18,2.7,sd,.8,4.6);const r4=mkRiver(205,395,95,470,14,9.2,sd,.8,4);
 mkRiver(418,655,462,560,12,5.2,sd,.8,4.2);mkRiver(700,572,742,668,10,8.4,sd,.8,4);
 RG=[];for(let i=0;i<RGN*RGN;i++)RG.push(null);RIV.forEach(p=>{const k=((p.z/RCELL)|0)*RGN+((p.x/RCELL)|0);if(k>=0&&k<RG.length)(RG[k]=RG[k]||[]).push(p)})}
/* ports: [x,z,town?,name] — rough spots; each one snaps to the nearest shoreline and faces the sea */
const PORT_SITES=[[438,526,1,'초승달 항구마을'],[144,779,0,'바람섬 항구',1],[699,281,0,'동북섬 항구',2],[588,600,0,'안쪽만 항구',3],[293,696,0,'강어귀 항구',0,13],[308,229,0,'북쪽 항구',4,25],[833,733,0,'이끼섬 항구',5],[212,168,0,'까마귀섬 항구',7]];
const PORTS=[];
/* supply spots (marked by hand in admin mode): cleared ground with a few supply crates */
/* 기획자 요청(7차): 까마귀섬 낚시섬(메모1, 철조망 울타리 + 문 + 낚시섬 주인)과 물개섬 특수 보급지(항구1 메모, 네모난 바위 언덕 + 경사로).
   땅 모양만 여기서(서버도 같은 땅), 구조물과 모델은 js/places.js. h=둘레 땅 높이(buildHeights에서 정함) */
const FISHISLE={x:137,z:135,h:1.12,hw:8.75,hd:7.5,cx:-3,cz:-6.5,rx:23,rz:20.5};   /* cx·cz·rx·rz: 캠프 땅 다지기 직사각형(캠프 중심 기준, 9차에 넓힘) */
/* 물개섬 특수 보급지(9차, 기획자: '올라가고 네모 안은 파여 있게' + '더 크게, 계단은 앞에서 봐도 옆모습이 보이게'): 모서리 둥근 직사각형 바위 언덕.
   테두리 높이 h+top, 안쪽 분지 h-dig. 경사로는 앞(+z) 절벽에 붙어 x 방향으로 올라가고(서쪽 바닥 rp.x0 → rp.x1에서 테두리 높이, rp.x1~x2 꼭대기 마루),
   계단은 분지 뒤(−z) 벽에 붙어 x 방향으로 내려가요(st.x0~x1 꼭대기 마루 → st.x2에서 바닥). 둘 다 카메라에서 옆모습이 보여요.
   땅은 둘레를 평평하게 + 분지 안만 파고, 테두리·경사로·계단의 걷는 높이는 spSurf(모양은 places.js 메시).
   AX/AZ/ac=바깥 반폭(x·z)·모서리, BX/BZ/bc=안쪽 반폭·모서리, rp.z0·w=경사로 띠(AZ+z0 ~ AZ+z0+w), st.w=계단 띠(−BZ ~ −BZ+w) */
const SPSUP={x:718,z:845,h:1.12,top:1.9,dig:.6,AX:14,AZ:11,ac:3,BX:10.5,BZ:7.5,bc:2,rp:{x0:-12.6,x1:-1.2,x2:2.6,z0:.15,w:3.6},st:{x0:-8.4,x1:-5.8,x2:1.4,w:3}};
function rbox2(ex,ez,ax,az,c){const qx=Math.abs(ex)-(ax-c),qz=Math.abs(ez)-(az-c);return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-c}   /* 모서리 둥근 직사각형까지 거리(안쪽 음수) */
const spOut=(x,z)=>rbox2(x-SPSUP.x,z-SPSUP.z,SPSUP.AX,SPSUP.AZ,SPSUP.ac),spIn=(x,z)=>rbox2(x-SPSUP.x,z-SPSUP.z,SPSUP.BX,SPSUP.BZ,SPSUP.bc);
function spSurf(x,z){const S=SPSUP,R=S.rp,T=S.st,ex=x-S.x,ez=z-S.z;if(ex>S.AX+1||ex<-S.AX-1||ez<-S.AZ-1||ez>S.AZ+R.z0+R.w+1)return null;
 const Hr=S.h+S.top,Hb=S.h-S.dig;
 if(ex>R.x0-.05&&ex<R.x2+.05&&ez<S.AZ+R.z0+R.w+.05){if(ex>=R.x1&&ez>S.AZ-.6)return Hr;if(ez>S.AZ+R.z0-.05)return S.h+(Hr-S.h)*clamp((ex-R.x0)/(R.x1-R.x0),0,1)}   /* 앞 경사로 + 꼭대기 마루 */
 if(ex>T.x0-.05&&ex<T.x2+.05&&ez>-S.BZ-.6&&ez<-S.BZ+T.w+.05){if(ex<=T.x1)return Hr;if(ez>-S.BZ-.05)return Hb+(Hr-Hb)*(1-clamp((ex-T.x1)/(T.x2-T.x1),0,1))}   /* 뒤 계단 + 꼭대기 마루 */
 return spOut(x,z)<0&&spIn(x,z)>0?Hr:null}   /* 테두리 위 */
const SUPPLY_SITES=[[103,754],[158,162],[822,266],[684,174],[687,843],[905,682],[486,708],[448,726],[451,703],[236,619],[216,401],[463,263],[402,608],[741,547]],SUPS=[];
/* 70차(디자인, 기획자 11-23 15:54): 남쪽 가까운 보급지 셋(6·7·8)을 큰 보급지 하나로 — 6번을 셋 가운데로 옮기고 7·8번은 비워요(번호·다른 보급지는 그대로, forEach가 빈 칸을 건너뜀). 모양은 js/supply.js */
const SUP_BIG={i:6,x:464,z:710,hx:16,hz:10.5,gone:[7,8]};SUPPLY_SITES[6]=[SUP_BIG.x,SUP_BIG.z];for(const k of SUP_BIG.gone)delete SUPPLY_SITES[k];
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
/* 55차: 다각형 섬 — 선까지 거리(밖 +, 안 −) */
function pgSD(pg,x,z){let d=1e9,inn=false;for(let i=0,j=pg.length-1;i<pg.length;j=i++){const a=pg[j],b=pg[i],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1),dd=Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t);if(dd<d)d=dd;if((a[1]>z)!==(b[1]>z)&&x<a[0]+(z-a[1])*ex/ez)inn=!inn}return inn?-d:d}
function pgK(I,x,z,sd){const s=pgSD(I.pg,x,z);if(s>I.cut)return 0;return sm(I.wo,-I.wi,s+(fbm(x*.045+3+I.x,z*.045+7,sd)-.5)*I.na+(fbm(x*.12,z*.12+I.z,sd+7)-.5)*I.nb)}
function islK(I,x,z,sd){if(I.pg)return pgK(I,x,z,sd);if(I.sp){const d=spineD(I,x,z);if(d>1.32)return 0;const f=I.ty===4?.045:.017;return sm(1,.6,d+(fbm(x*f+3+I.x,z*f+7,sd)-.5)*.46+(fbm(x*.05,z*.05+I.z,sd+7)-.5)*.16)}
 const dx=(x-I.x)/(I.r*I.ax),dz=(z-I.z)/(I.r*I.az),t=I.ty;let d0=Math.hypot(dx,dz);if(d0>(t===0?1.5:1.36))return 0;
 if(t<2){const an=Math.atan2(dz,dx);d0*=1+.11*Math.sin(an*3+I.x)+.07*Math.sin(an*5+I.z*.7)+.04*Math.sin(an*9+I.r);if(d0>1.3)return 0}
 const w=fbm(x*(t===2?.09:t===1?.022:.0085)+3+I.x,z*(t===2?.09:t===1?.022:.0085)+7,sd)+(t===0?(fbm(x*.028,z*.028+I.z,sd+7)-.5)*.34:0);
 return sm(1,.6,d0+(w-.5)*(t===2?.22:t===1?.4:.44))}
/* land above the beach is squeezed into a narrow band (there is no jump): UH() gives back the "natural" height for colouring and plant choice */
const FLAT=.25,UH=h=>{if(h<=1)return h;const u=(h-1)/FLAT;return u>=.998?20:1-3*Math.log(1-u)};
/* sea lighthouses stand on rock islets raised from the seabed at the user's memo marks */
const LH_SITES=[[491,898,'남쪽 바다 등대'],[250,892,'남서 등대'],[86,274,'서쪽 바다 등대'],[80,909,'땅끝 등대'],[563,453,'안쪽만 등대'],[563,68,'북쪽 바다 등대'],[928,527,'동쪽 바다 등대'],[836,889,'남동 등대']],LHS=LH_SITES.map(q=>({x:q[0],z:q[1],n:q[2]})),LH_TOP=1.5;
const LH_ISLE=[0];   /* 55차: 바위섬 대신 새 섬(NEWISLE)이 된 등대 자리 — 바위섬 땅·바위·설치 금지 원·'등대 둘레' 규칙을 빼요 */
const lhD=(x,z)=>{let b=1e9;for(const q of LH_SITES){if(LH_ISLE.some(i=>LH_SITES[i]===q))continue;const ex=x-q[0],ez=z-q[1];if(ex>20||ex<-20||ez>20||ez<-20)continue;const d=Math.hypot(ex,ez);if(d<b)b=d}return b};
/* 기획자가 찍은 낚시 포인트. A=등대 앞바다(좋은 물고기), B=해안. 등대 한가운데(땅 위)에 찍힌 점은 water.js가 그 등대섬 바로 앞 물로 옮겨요 */
const FISH_PTS_A=[[250,892,'메모2'],[80,909,'메모4'],[928,527,'메모7'],[836,889,'메모8'],[239,892,'메모17'],[255,904,'메모19'],
 [85,922,'항구2'],[91,910,'항구3'],[841,899,'항구5'],[914,524,'항구7'],[937,538,'항구9'],[76,281,'항구12'],[84,288,'항구13'],[575,74,'항구14'],[554,77,'항구15'],
 ];
const FISH_PTS_B=[[677,672],[681,669],[685,666],[727,641],[729,622],[760,622],[790,597],[804,572],[804,567],[785,508],[765,496],[719,475],[695,477],[639,536],[621,558],[599,591],
 [580,590],[586,587],[513,581],[465,557],[457,574],[445,615],[457,522],[427,478],[418,455],[404,450],[402,447],[421,438],[442,375],[534,324],[537,322],[540,319],
 [545,242],[509,197],[505,195],[456,189],[451,191],[363,218],[345,231],[345,236],[313,227],[318,227],[244,293],[217,302],[160,376],[157,379],[115,457],[127,493],
 [182,582],[181,578],[207,656],[212,660],[219,664],[279,688],[273,690],[307,707],[359,753],[393,753],[431,775],[478,785],[516,766],[514,761],[597,728],[650,695]];
function lhRock(x,z,h,sd){for(let i=0;i<LH_SITES.length;i++){if(LH_ISLE.includes(i))continue;const q=LH_SITES[i],ex=x-q[0],ez=z-q[1];if(ex>18||ex<-18||ez>18||ez<-18)continue;const d=Math.hypot(ex,ez),an=Math.atan2(ez,ex),w=1+.12*Math.sin(an*3+i*1.7)+.07*Math.sin(an*5+i)+(noise(x*.3+i*9,z*.3,sd+70)-.5)*.2,e=d/w;
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
  for(const s of SUPS){const ex=x-s.x,ez=z-s.z;if(ex>10||ex<-10||ez>10||ez<-10)continue;h=lerp(h,s.h,1-sm(4.5,9.5,Math.hypot(ex,ez)))}
  {const F=FISHISLE,ex=x-F.x-F.cx,ez=z-F.z-F.cz;if(ex<F.rx+5&&ex>-F.rx-5&&ez<F.rz+5&&ez>-F.rz-5){const d=rbox2(ex,ez,F.rx,F.rz,4);if(d<4)h=lerp(h,F.h,(1-sm(0,4,d))*sm(.3,.95,h))}}   /* 땅만 다져요(바닷가 선은 그대로) */
  {const S=SPSUP,ex=x-S.x,ez=z-S.z;if(ex<S.AX+14&&ex>-S.AX-14&&ez<S.AZ+14&&ez>-S.AZ-14){h=lerp(h,S.h,1-sm(6,11,rbox2(ex,ez,S.AX,S.AZ,S.ac)));h=lerp(h,S.h-S.dig,1-sm(.6,1.4,rbox2(ex,ez,S.BX,S.BZ,S.bc)))}}}
 return lhRock(x,z,h,sd)}
function buildHeights(sd){SEED=sd;layout(sd);const A=ISL[0],B=ISL[1];
 findPorts(sd);{const p=PORTS[0];VIL.x=p.x-p.dz*1.6-p.dx*14.4;VIL.z=p.z+p.dx*1.6-p.dz*14.4;VIL.px=p.x-p.dx*13;VIL.pz=p.z-p.dz*13}OUT.x=OUT.z=-9999;   /* the hub (spawn, safe zone, merchant) is the harbour town */
 findSupply(sd);FISHISLE.h=Math.max(1.05,rawH(FISHISLE.x,FISHISLE.z,sd,1));SPSUP.h=Math.max(1.05,rawH(SPSUP.x,SPSUP.z,sd,1));mkPaths(sd);
 const N=WS+1;HG=new Float32Array(N*N);IG=new Uint8Array(IGN*IGN);for(let z=0;z<=WS;z++)for(let x=0;x<=WS;x++){HG[z*N+x]=rawH(x,z,sd);if(x%IGS===0&&z%IGS===0)IG[(z/IGS)*IGN+x/IGS]=_bi+1}}
function hAt(x,z){x=clamp(x,0,WS-.001);z=clamp(z,0,WS-.001);const xi=x|0,zi=z|0,fx=x-xi,fz=z-zi,i=zi*(WS+1)+xi;return (HG[i]*(1-fx)+HG[i+1]*fx)*(1-fz)+(HG[i+WS+1]*(1-fx)+HG[i+WS+2]*fx)*fz}
const islAt=(x,z)=>{const v=IG[clamp(Math.round(z/IGS),0,IGN-1)*IGN+clamp(Math.round(x/IGS),0,IGN-1)];return v?ISL[v-1]:null};
const tundraAt=(x,z,h)=>sm(.5,.68,noise(x*.03+3,z*.03+9,2))*sm(5,2.5,h)*sm(.9,1.4,h);
/* ===== data ===== */
const ITEMS={
 wood:{n:'나무',ic:'resource_lumber',ty:'res',p:20,d:'건설과 제작의 기본 재료'},stone:{n:'돌',ic:'resource_stone',ty:'res',p:20,d:'바위에서 캐는 재료'},
 scrap:{n:'고철',ic:'scrap',ty:'res',p:60,d:'잔해와 상자에서 얻어요. 총과 탄약의 재료'},powder:{n:'화약',ic:'keg',ty:'res',p:90,d:'탄약과 수류탄에 들어가요'},
 cloth:{n:'천',ic:'cloth',ty:'res',p:50,d:'붕대에 써요'},
 berry:{n:'산딸기',ic:'berries',ty:'food',food:9,p:30,d:'덤불에서 따요. 배고픔 +9'},can:{n:'통조림',ic:'can',ty:'food',food:38,p:140,d:'든든한 전투식량. 배고픔 +38'},
 bandage:{n:'붕대',ic:'bandage',ty:'heal',heal:40,p:160,d:'체력 +40'},
 ammoS:{n:'탄알',ic:'ammoS',ty:'ammo',p:15,d:'모든 총·포탑·기관총 진지에 써요. 보급상에서 12발씩 사요'},
 grenade:{n:'수류탄',ic:'grenade',ty:'throw',p:280,d:'던지면 주변에 큰 피해'},
 axe:{n:'손도끼',ic:'axe_m',ty:'tool',p:200,d:'나무와 바위를 빨리 캐요. 근접 14',one:1},
 kit_tent:{n:'텐트',ic:'mtent',ty:'kit',b:'ptent',p:600,d:'어디든 펴면 내 기지가 돼요. 안에 들어갈 수 있어요'},kit_stash:{n:'보관 상자',ic:'mstash',ty:'kit',b:'stash',p:400,d:'튼튼한 보관함. 모든 상자가 이어져 있어요'},kit_bench:{n:'작업대',ic:'bench',ty:'kit',b:'bench',p:500,d:'텐트 안에 놓아요. 무기·탄약을 만들고, 텐트를 집으로 업그레이드해요'},
 pistol:{n:'권총',ic:'pistol',ty:'gun',p:900,d:'가볍고 빠른 기본 총. 피해 16',one:1},rifle:{n:'볼트액션 소총',ic:'rifle',ty:'gun',p:2600,d:'멀리서 한 발씩 강하게. 피해 48',one:1},
 smg:{n:'기관단총',ic:'smg',ty:'gun',p:4200,d:'빠르게 쏟아붓는 연사. 피해 10',one:1},shotgun:{n:'산탄총',ic:'shotgun',ty:'gun',p:3400,d:'가까울수록 강해요. 피해 9×6',one:1}};
/* 물고기. g=등급(FGRADE), k=생김새(water.js fishGeoK). old:1은 예전 물고기: 더 이상 낚이지 않고 저장 호환용으로 아이템만 남김 */
const FGRADE=[['일반','#8C9AA6'],['희귀','#3D8BE0'],['영웅','#9B5BD6'],['전설','#F08A24']];
const FISH=[{id:'f_herring',n:'청어',g:0,str:1,p:50,food:18,cm:[22,36],back:0x5f7f9f,belly:0xdfe7ef,len:.8,h:.26,w2:.17},
 {id:'f_cod',n:'대구',old:1,str:2,p:120,food:28,cm:[45,95],back:0x8a7d55,belly:0xe8e0c8,len:1,h:.34,w2:.25},
 {id:'f_lump',n:'도치',old:1,str:2,p:140,food:26,cm:[25,48],back:0x4f7a74,belly:0xa9c59a,len:.68,h:.52,w2:.38},
 {id:'f_salmon',n:'연어',g:0,str:2,p:120,food:30,cm:[55,100],back:0x7d8ea0,belly:0xf1e9e2,len:1.05,h:.32,w2:.21},
 {id:'f_halibut',n:'넙치',old:1,str:4,p:340,food:42,cm:[60,150],back:0x6b5a43,belly:0xece4d8,len:.95,h:.64,w2:.13},
 {id:'f_shark',n:'그린란드상어',old:1,str:5,p:1400,food:60,cm:[180,420],back:0x55606b,belly:0x9aa3ab,len:1.35,h:.36,w2:.3,legend:1},
 {id:'f_anch',n:'멸치',g:0,k:'anch',str:1,p:30,food:10,cm:[8,16],back:0x4d7aa8,belly:0xe6eef4,len:.5,h:.13,w2:.09},
 {id:'f_trout',n:'송어',g:0,k:'trout',str:2,p:80,food:22,cm:[28,60],back:0x6f7a4a,belly:0xeadfc0,len:.85,h:.26,w2:.17},
 {id:'f_flying',n:'날치',g:1,k:'flying',str:3,p:200,food:26,cm:[20,40],back:0x2f62b8,belly:0xe8f0f8,len:.78,h:.19,w2:.15},
 {id:'f_tuna',n:'참치',g:0,k:'tuna',str:2,p:160,food:36,cm:[80,200],back:0x24406e,belly:0xdde6ee,len:1.25,h:.36,w2:.27},
 {id:'f_jelly',n:'해파리',g:1,k:'jelly',str:3,p:240,food:20,cm:[25,70],back:0xf2a7dc,belly:0xffe1f3,len:.7,h:.5,w2:.7,cn:'데친 해파리'},
 {id:'f_sword',n:'황새치',g:2,k:'sword',str:4,p:700,food:48,cm:[150,320],back:0x3c5878,belly:0xdfe6ec,len:1.35,h:.3,w2:.2},
 {id:'f_hammer',n:'망치상어',g:3,k:'hammer',str:5,p:1600,food:64,cm:[220,480],back:0x7a8994,belly:0xe7ebee,len:1.5,h:.34,w2:.3}];
FISH.forEach(f=>{const gtag=f.old?'':`[${FGRADE[f.g][0]}] `;ITEMS[f.id]={n:f.n,ic:f.id,ty:'fish',food:6,p:f.p,d:`${gtag}${f.legend?'전설의 물고기! ':''}날로 먹으면 배고픔 +6. 모닥불에 구우면 +${f.food}`};ITEMS['c'+f.id]={n:f.cn||'구운 '+f.n,ic:'c'+f.id,ty:'food',food:f.food,p:Math.round(f.p*1.5),d:`잘 익힌 ${f.n}. 배고픔 +${f.food}`}});
/* 낚시 구역: 포인트마다 나오는 물고기와 확률(%). 같은 등급 안에서는 똑같이 나눔. R=물고기 떼가 도는 반지름 */
const FISH_ZONES={A:{n:'등대 앞바다',R:1.05,t:[['f_tuna',71],['f_jelly',18],['f_sword',8],['f_hammer',3]]},
 B:{n:'해안',R:.85,t:[['f_trout',20.5],['f_salmon',20.5],['f_anch',20.5],['f_herring',20.5],['f_flying',18]]}};   /* 24차: 무지개송어를 빼서 희귀는 날치 혼자 18% */
const FISH_LIST=FISH.filter(f=>!f.old).sort((a,b)=>(FISH_ZONES.A.t.some(q=>q[0]===a.id)-FISH_ZONES.A.t.some(q=>q[0]===b.id))||a.g-b.g);
/* ===== 식물 도감 (17차, 기획자) =====
   작물·꽃·버섯 12종. 모양은 아직 없고 글자로만 보여요(아이콘·땅 위 이름표 = 글자, 모양은 디자인 담당이 나중에).
   자라는 곳은 PLANT_SITES(기획자가 찍어 준 좌표) 둘레에 넓게 흩어 심어요(js/plants.js). 가방 아이템은 ty:'plant'(먹거나 쓰는 기능 없음, 팔기만).
   n1: 한 번에 얻는 수, re: 다시 자라는 시간(초, 19차 기획자: 15분=900), p: 원래 가격(임시값, 팔면 20%), cr: 부딪히는 반지름(아보카도 나무·포도 말뚝, 없으면 지나감), nov: 랜덤 자판기에 안 나옴 */
const PCAT={crop:['작물','#5E9E3A','#E4F1D6'],flower:['꽃','#C9558A','#F8E2EC'],mush:['버섯','#9A6438','#F2E4D4']};
const PLANTS=[
 {id:'potato',n:'감자',cat:'crop',v:'캐기',n1:2,re:900,p:20},{id:'grape',n:'포도',cat:'crop',v:'따기',n1:2,re:900,p:30,cr:.3},
 {id:'strawberry',n:'딸기',cat:'crop',v:'따기',n1:2,re:900,p:30},{id:'avocado',n:'아보카도',cat:'crop',v:'따기',n1:1,re:900,p:60,cr:.45},
 {id:'wheat',n:'밀',cat:'crop',v:'베기',n1:2,re:900,p:15},{id:'poppy',n:'양귀비',cat:'flower',v:'꺾기',n1:1,re:900,p:80},
 {id:'flower_blue',n:'수레국화',cat:'flower',v:'꺾기',n1:1,re:900,p:40,col:'파란 꽃'},{id:'flower_yellow',n:'해바라기',cat:'flower',v:'꺾기',n1:1,re:900,p:40,col:'노란 꽃'},
 {id:'flower_black',n:'검은 튤립',cat:'flower',v:'꺾기',n1:1,re:900,p:120,col:'검은 꽃'},{id:'mush_poison',n:'독버섯',cat:'mush',v:'따기',n1:1,re:900,p:50},
 {id:'mush_censer',n:'향로버섯',cat:'mush',v:'따기',n1:1,re:900,p:150},{id:'mush',n:'버섯',cat:'mush',v:'따기',n1:1,re:900,p:25}];
for(const q of PLANTS)ITEMS[q.id]={n:q.n,ic:null,txt:1,ty:'plant',p:q.p,nov:1,d:`${PCAT[q.cat][0]}${q.col?' · '+q.col:''}. 섬에서 자라요 (식물 도감)`};
/* 자라는 곳(19차, 기획자: '맵에서 가장 작은 섬(조약돌섬, 땅 약 1,570㎡ = 반지름 22m 원) 크기 하나에 한 종류, 초승달 본섬에만 12곳,
   마을·보급 구조물과 겹치지 않게, 한 곳에 11포기쯤 골고루'). {p:식물 id, x, z, r:구역 반지름(m), c:포기 수}.
   자리는 tools/plant_zones.py로 골랐어요: 본섬 땅이 97% 넘는 곳, 항구·보급지·등대의 설치 금지 원과 5m 넘게 떨어짐, 스폰 마을 광장에서 67m 넘게,
   구역끼리 56m 넘게(섬 전체에 고르게). 스폰에 가까운 곳일수록 값싼 작물, 버섯 셋은 나무가 가장 빽빽한 세 곳(그늘). */
const PLANT_SITES=[
 {p:'wheat',x:364,z:556,r:22,c:11},{p:'potato',x:300,z:452,r:22,c:11},{p:'grape',x:388,z:372,r:22,c:11},{p:'strawberry',x:260,z:652,r:22,c:11},
 {p:'flower_blue',x:564,z:700,r:22,c:11},{p:'flower_yellow',x:196,z:532,r:22,c:11},{p:'avocado',x:204,z:364,r:22,c:11},{p:'poppy',x:300,z:276,r:22,c:11},
 {p:'flower_black',x:772,z:572,r:22,c:11},{p:'mush',x:364,z:724,r:22,c:11},{p:'mush_poison',x:636,z:588,r:22,c:11},{p:'mush_censer',x:484,z:212,r:22,c:11}];
ITEMS.rod={n:'낚싯대',ic:'rod',ty:'tool',p:300,d:'물고기 떼(물속 그림자)가 도는 곳에 던져요. 사거리 8m, 물 밖에서만',one:1};
const WEAP={rod:{rod:1,dmg:0,cd:1,range:0,h1:1},fist:{melee:1,dmg:6,cd:.5,range:2},axe:{melee:1,dmg:14,cd:.5,range:2.3},
 pistol:{dmg:16,cd:.32,range:16,ammo:'ammoS',spread:.03,h1:1},rifle:{dmg:48,cd:1.0,range:27,ammo:'ammoS',spread:.008},
 smg:{dmg:10,cd:.095,range:15,ammo:'ammoS',spread:.07},shotgun:{dmg:9,pel:6,cd:.9,range:11,ammo:'ammoS',spread:.17}};
const RECIPES=[{id:'bandage',n:1,c:{cloth:2}},   /* 30차(기획자): 탄알·낚싯대·손도끼는 만들 수 없어요 → 보급상에서 사요 */
 {id:'grenade',n:1,c:{scrap:3,powder:3},bench:1},
 {id:'pistol',n:1,c:{scrap:8,wood:2},bench:1},{id:'rifle',n:1,c:{scrap:14,wood:6},bench:1},{id:'shotgun',n:1,c:{scrap:16,wood:5},bench:1},{id:'smg',n:1,c:{scrap:24,wood:3},bench:1}];
/* 28차(기획자: '제작칸 총 6칸, 마크 제작법처럼 3×2'): 작업대의 제작 칸 3칸×2줄에 재료를 모양대로 놓으면 만들어져요(칸마다 1개씩 써요, 좌우를 뒤집어 놓아도 돼요, 빈 줄·칸은 어디로 밀어도 됨).
   글자: W 나무 · S 돌 · X 고철 · C 천 · P 화약 · '.' 빈칸. 모양과 재료는 임시 — 기획자가 정하면 CRAFT_PAT만 고치면 돼요. 재료 수(r.c)는 모양에서 세어요 */
const CRAFT_KEY={W:'wood',S:'stone',X:'scrap',C:'cloth',P:'powder'};
const CRAFT_PAT={bandage:['CC'],grenade:['XPX','PXP'],pistol:['XXX','W..'],rifle:['XXX','WWW'],shotgun:['XXX','XWW'],smg:['XXX','XXW']};
for(const r of RECIPES){const p=CRAFT_PAT[r.id];if(!p)continue;r.pat=p;const c={};for(const row of p)for(const ch of row)if(CRAFT_KEY[ch])c[CRAFT_KEY[ch]]=(c[CRAFT_KEY[ch]]||0)+1;r.c=c}
/* builds: g=geometry, s=scale, bx/bz=half extents, hp */
const BUILDS={fire:{n:'모닥불',g:'firepit',s:1,bx:.8,bz:.8,hp:60,c:{wood:5,stone:3},d:'밤을 밝히고 생선을 구워요. 옆에 있으면 에너지가 조금 빨리 차요'},
 bench:{n:'작업대',g:'bench',s:1,bx:1.3,bz:.8,hp:120,c:{wood:10,stone:4},kit:'kit_bench',d:'총·수류탄·붕대를 만들고, 텐트를 집으로 업그레이드해요',indoor:1,fixR:1},   /* indoor: 텐트 안(나중에 집 안)에만 놓아요(14차, 기획자) */

 torch:{n:'횃불',g:'torch_lit',s:1.7,bx:.3,bz:.3,hp:30,c:{wood:2},d:'밤에 주변을 밝혀요'},
 fence:{n:'나무 울타리',g:'fence',s:1,bx:1,bz:.25,hp:70,c:{wood:2},d:'값싼 방어선',grid:1},
 wall:{n:'석벽',g:'wall_straight',s:1,bx:1,bz:.4,hp:420,c:{stone:10,wood:2},d:'가장 단단한 벽',grid:1},
 gate:{n:'성문',g:'gateB',s:1,bx:1,bz:.4,hp:380,c:{stone:8,wood:6},d:'나는 지나가고 적은 막아요',grid:1,gate:1},
 mine:{n:'지뢰',g:'mine',s:1,bx:.4,bz:.4,hp:20,c:{scrap:4,powder:4},d:'적이 밟으면 크게 터져요. 한 번 쓰면 사라져요',pass:1,trap:2},
 gen:{n:'발전기',g:'gen',s:1,bx:.8,bz:.6,hp:160,c:{scrap:15,wood:5},d:'연료(기름통)를 넣으면 전기를 만들어요. 1통에 5분, 3통까지'},
 turret:{n:'자동 포탑',g:'tbase',s:1,bx:.6,bz:.6,hp:240,c:{scrap:24,wood:5},d:'사거리 안의 적을 스스로 찾아 쏴요. 탄알을 넣어요',tur:{head:'thead',brl:'tbrl',range:14,cd:.2,dmg:10,ammo:'ammoS',cap:240,load:60,snd:'smg',bz:.4,fl:.92}},
 ptent:{n:'텐트',g:'mtent',s:1.45,bx:1.8,bz:1.9,hp:220,c:{cloth:10,wood:6},kit:'kit_tent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,upg:{to:'phouse',c:{wood:120}},d:'내 기지가 돼요. 안에 들어갈 수 있어요'},
 phouse:{n:'집',g:'phouse',s:.85,bx:1.85,bz:1.9,hp:600,c:{wood:120},kit:'kit_tent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,room:'house',hide:1,d:'텐트를 업그레이드한 통나무 집. 안이 더 넓어요'},   /* 30차(기획자: '집 크기는 텐트와 같게'): s 1 → .85(폭 4.0m, 텐트 4.3m) */   /* 15차: 작업대에서 나무 120개를 넣고 [업그레이드]로만 생겨요(hide: 건설 목록에 없음). room: 안쪽 방 모양 */
 stash:{n:'보관 상자',g:'mstash',s:1,kit:'kit_stash',fixR:1,bx:.75,bz:.6,hp:160,c:{wood:8,scrap:2},d:'물건을 맡겨요. 쓰러져도 안전하고, 모든 상자가 이어져 있어요'},
 home:{n:'오두막',g:'home_A',s:4.1,bx:1.5,bz:1.6,hp:600,c:{wood:40,stone:20},d:'기지의 중심. 근처에 있으면 따뜻하고 체력이 빨리 회복돼요'}};
/* ===== 25차(기획자: '넣어봐라'): 새 아이템 15종. 모양·아이콘은 디자인 20·21·23차(look.js 'lk_'+id).
   기능·재료·가격·놓는 곳은 기획자가 아직 안 정해서 **임시값**이에요(이름 뒤 설명에 '임시'). 정해지면 여기 숫자만 고치면 돼요.
   - 손에 드는 것: 전기톱(손도끼처럼 나무를 베고 더 빨리), 석궁(화살을 쏨), 화살(석궁 탄약, 상점에서 10발 묶음), 연료(쓰는 곳 없음)
   - 설치형(건설 탭): inok:1 = 텐트·집 안에도 놓을 수 있는 가구(소파·의자·원형 테이블·꽃병·벽난로). water:1 = 물 위에만(보트 2인승, 타기는 아직 없음).
     가로등은 밤에 켜져요(lamp). 나머지는 놓아 두기만 해요. ===== */
Object.assign(ITEMS,{
 chainsaw:{n:'전기톱',ic:'lk_chainsaw',hg:'lk_chainsaw',gh:1,hs:1.2,ty:'tool',p:1500,d:'나무를 손도끼보다 빨리 베요. 근접 18 (임시)',one:1},
 crossbow:{n:'석궁',ic:'lk_crossbow_i',hg:'lk_crossbow',hs:1.35,ty:'gun',p:1800,d:'화살을 쏴요. 피해 30, 사거리 22 (임시)',one:1},
 arrow:{n:'화살',ic:'lk_arrow',ty:'ammo',p:30,d:'석궁에 넣어 쏴요'},
 fuel:{n:'연료',ic:'lk_fuel',ty:'res',p:120,d:'발전기에 넣는 기름통. 1통에 5분 (임시)'}});
Object.assign(BUILDS,{
 sign:{n:'표지판',g:'lk_sign',s:1,bx:.3,bz:.15,hp:40,c:{wood:3},d:'세워 두는 나무 표지판 (임시)'},
 lamp:{n:'가로등',g:'lk_lamp',s:1,bx:.25,bz:.25,hp:120,c:{scrap:6,wood:2},lamp:2.72,d:'밤이 되면 저절로 켜져요 (임시)'},
 fence_garden:{n:'정원 울타리',g:'lk_fence_garden',s:1,bx:1,bz:.2,hp:60,c:{wood:3},d:'크림색 낮은 울타리 (임시)',grid:1},
 seat_bench:{n:'벤치의자',g:'lk_seat_bench',s:1,bx:.75,bz:.3,hp:80,c:{wood:6},d:'바깥에 두는 긴 의자 (임시)'},
 oven_garden:{n:'정원화덕',g:'lk_oven_garden',s:1,bx:.69,bz:.54,hp:260,c:{stone:10,wood:3},d:'벽돌 화덕 (임시)'},
 fireplace:{n:'벽난로',g:'lk_fireplace',s:1,bx:.83,bz:.32,hp:300,c:{stone:12,wood:4},inok:1,d:'벽돌 벽난로. 텐트·집 안에도 놓아요 (임시)'},
 sofa:{n:'소파',g:'lk_sofa',s:1,bx:.95,bz:.4,hp:120,c:{wood:6,cloth:4},inok:1,d:'푹신한 소파. 텐트·집 안에도 놓아요 (임시)'},
 chair:{n:'일반의자',g:'lk_chair',s:1,bx:.27,bz:.27,hp:50,c:{wood:3},inok:1,d:'나무 의자. 텐트·집 안에도 놓아요 (임시)'},
 table_round:{n:'원형 테이블',g:'lk_table_round',s:1,bx:.52,bz:.52,hp:80,c:{wood:5},inok:1,d:'둥근 탁자. 텐트·집 안에도 놓아요 (임시)'},
 vase:{n:'꽃병',g:'lk_vase',s:1,bx:.15,bz:.15,hp:20,c:{stone:1},inok:1,d:'꽃을 꽂은 병. 텐트·집 안에도 놓아요 (임시)'},
 boat2:{n:'보트 2인승',g:'lk_boat2',s:1,bx:.68,bz:1.45,hp:200,c:{wood:14,scrap:4},water:1,flat:1,d:'바닷가 물 위에 띄워 둬요. 타기는 아직 없어요 (임시)'}});
/* 27차: 배고픔·체온 대신 에너지 10칸 → 설명 글의 '배고픔 +N'·'체력 +N'·'구우면 +N'을 '에너지 +N칸'(10 = 1칸, 반 칸 단위)으로 */
/* 39차(기획자 11-19 22:57: '텐트 설치할 때 텐트 중앙 기준으로 텐트보다 더 넓게 내 구역, 텐트보다 한 12배 크게, 텐트 뒤보다 앞쪽 땅이 더 길게,
   설치할 때 내 구역이 표시되게, 내 구역에는 다른 텐트가 설치되면 안 되고, 직사각형 모서리 끝에 못으로 꼭짓점 박은 것처럼 표시,
   집으로 업그레이드해도 구역 크기는 그대로. 텐트일 때는 남도 내 구역에 물건을 설치하거나 없앨 수 있고, 집이면 남이 설치·철거 못 해')
   구역 = 텐트·집(ptent·phouse) 가운데 기준 직사각형. 텐트를 돌리면 같이 돌아요(지금 텐트는 fixR이라 늘 정면 +z). 숫자만 고치면 크기가 바뀌어요(임시). */
const ZONE={hw:6.3,back:4.2,front:8.4};   /* 40차(기획자 11-20: '텐트보다 아홉 배 큰 정도, 딱 정사각형'): 12.6×12.6m 정사각형 = 텐트 한 변(4.2m)의 3배 → 깔개(4.1×4.2m)의 약 9배. 텐트는 뒤에서 4.2m, 앞은 8.4m(앞이 더 길게). 39차엔 15×16m */
const isZoneT=t=>t==='ptent'||t==='phouse';
/* 44차(기획자 11-20 22:25: '항구마다 표시해 둔 동그란 빨간 지역은 안전 구역. 안에 들어가면 서로 때려도 데미지를 안 입고, 거기서 누가 총을 쏘거나 근접 무기로 사람을 때리면
   투명 포탑이 데미지를 입혀. 퍼뎀 — 실수로 한 번이면 20% 한 번, 계속 때리면 계속 쌓이게'): 항구 8곳의 설치 금지 원(actors.js NOB의 항구 원과 같은 자리·반지름, 새 게임 때 계산되는 값을 적어 둠 —
   항구 소품을 옮겨 원이 바뀌면 tools/p44_check.py가 알려 줘요)이 곧 안전 구역. 서버(server.js)도 이 표로 판정해요. [x, z, 반지름] */
const PORT_SAFE=[[438.57,524.62,33.34],[144.78,781.13,22.4],[694.99,278.36,26.31],[590.29,596.79,21.39],[296.52,696.6,22.75],[306.9,226.01,29.81],[833.88,734.44,23.56],[214.56,172.28,23.58]];   /* 48차: 생선 상인이 들어가서 항구 원을 다시 잼 */
PORT_SAFE.push([262.4,782.4,46]);   /* 69차(디자인, 기획자 11-23): 수달섬(요리·사냥 상인 섬) 안전 구역 — 섬 가운데 원, 섬보다 조금 크게. 설치 금지 원은 js/otter.js가 같은 크기로 */
const SAFE_PCT=.2;   /* 안전 구역에서 사람을 공격하면 공격한 사람이 최대 에너지의 20%씩(한 번마다, 쌓임) */
function inSafe(x,z){for(const q of PORT_SAFE)if((x-q[0])*(x-q[0])+(z-q[1])*(z-q[1])<q[2]*q[2])return q;return null}

const zoneRect=(x,z,r)=>({x,z,r:r||0,hw:ZONE.hw,b:ZONE.back,f:ZONE.front});
function zoneIn(q,x,z,m){m=m||0;const dx=x-q.x,dz=z-q.z,c=Math.cos(q.r),sn=Math.sin(q.r),lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<=q.hw+m&&lz>=-q.b-m&&lz<=q.f+m}
function zoneCorners(q){const c=Math.cos(q.r),sn=Math.sin(q.r);return [[-q.hw,-q.b],[q.hw,-q.b],[q.hw,q.f],[-q.hw,q.f]].map(([lx,lz])=>[q.x+lx*c+lz*sn,q.z-lx*sn+lz*c])}
function zoneOverlap(a,b){const A=zoneCorners(a),B=zoneCorners(b);for(const P of[A,B])for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4],nx=q[1]-p[1],nz=p[0]-q[0];let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
  for(const v of A){const d=v[0]*nx+v[1]*nz;if(d<a0)a0=d;if(d>a1)a1=d}for(const v of B){const d=v[0]*nx+v[1]*nz;if(d<b0)b0=d;if(d>b1)b1=d}if(a1<=b0||b1<=a0)return false}return true}   /* 두 직사각형이 겹치나(분리축) */
const nrgTx=v=>'에너지 +'+(Math.round(v/5)/2)+'칸';
for(const T of [ITEMS,BUILDS])for(const k in T){const it=T[k];if(it.d)it.d=it.d.replace(/배고픔 \+(\d+)/g,(m,v)=>nrgTx(+v)).replace(/구우면 \+(\d+)/g,(m,v)=>'구우면 '+nrgTx(+v)).replace(/체력 \+(\d+)/g,(m,v)=>nrgTx(+v)).replace(/체력/g,'에너지')}
const GEN_PER=300,GEN_CAP=900;   /* 27차(기획자: '연료는 발전기 연료 넣을 때'): 연료 1통 = 5분, 최대 3통(임시) */
Object.assign(WEAP,{chainsaw:{melee:1,dmg:18,cd:.4,range:2.4},crossbow:{dmg:30,cd:1.1,range:22,ammo:'arrow',spread:.01}});
WEAP.grenade={nade:1,dmg:90,cd:.9,range:14,h1:1};ITEMS.grenade.d='손에 들고 오른쪽 조이스틱을 끌었다 떼면 그쪽으로 던져요(끈 만큼 멀리). 주변에 큰 피해';   /* 32차(기획자: '수류탄은 왜 장착하자마자 발사되냐'): 수류탄도 손에 드는 것 → 누를 때마다 하나씩 던져요(ui.js throwNadeAt) */
const ENEMY={bandit:{n:'약탈자',hp:42,sp:3.7,dmg:9,reach:1.9,w:'dagger',col:[.62,.2,.18],loot:[['cloth',1,.6],['berry',2,.3],['coin',60,1]]},
 gunner:{n:'소총수',hp:36,sp:3.2,dmg:10,range:14,w:'rifle',col:[.3,.34,.42],helmet:1,loot:[['ammoS',5,.7],['scrap',2,.6],['coin',90,1]]},
 rgolem:{n:'바위 골렘',hp:240,sp:2.1,dmg:26,reach:3.0,proc:'rg',big:1,blood:0x9aa1a8,loot:[['stone',8,1],['scrap',4,.7],['coin',300,1]]},
 wgolem:{n:'나무 골렘',hp:105,sp:3.0,dmg:14,reach:2.3,proc:'wg',blood:0x8a5a32,loot:[['wood',8,1],['berry',3,.6],['coin',140,1]]},
 wraith:{n:'악령',hp:52,sp:3.3,dmg:12,range:12,proc:'wr',blood:0x9fe8ff,loot:[['powder',3,.8],['cloth',2,.7],['coin',180,1]]},
 plant:{n:'식인 덩굴',hp:85,sp:0,dmg:19,reach:3.4,proc:'pl',root:1,blood:0x5fae4a,loot:[['berry',5,1],['cloth',2,.6],['coin',100,1]]},
 brute:{n:'두목',hp:190,sp:2.9,dmg:22,reach:2.4,w:'axe_2handed',big:1,col:[.5,.16,.14],loot:[['scrap',8,1],['powder',4,1],['can',2,1],['coin',400,1]]}};
/* 경제(기획자 요청 6차): 아이템마다 p = 원래 가격(동전). 지금 값은 바로 쓸 수 있게 넣어 둔 임시값이라 기획자가 고치면 돼요.
   재활용 쓰레기통에서 팔면 원래 가격의 20%(ECON.sell). 랜덤 자판기는 원래 가격 그대로(VEND.free=1이면 무료). 동전은 10배 단위로 바꿨어요(cx:1). */
const ECON={sell:.2};
function sellPrice(id){return Math.max(1,Math.floor(ITEMS[id].p*ECON.sell))}
/* 랜덤 자판기: 항구마다 하나. 실제 시간으로 1시간마다(정각 기준) 모든 아이템 중 무작위 5개로 바뀌어요. 시간·항구 번호로만 정해서 누구에게나 같아요 */
const VEND={n:5,per:3600e3,free:0,pack:{ammoS:12}};
// 본섬 보급과 무작위 자판기가 공유하는 제한. 총기 제작용 부품 키트·석궁·광석은 별개다.
const restrictedSupplyIds=new Set(['rod2','rod3','att_laser','att_supp','pick_adv','pick_elec',
  'kit_bench2','charm','pcb2','kit_turret','vodka']);
function restrictedSupplyItem(id){
  const item=ITEMS[id];
  return restrictedSupplyIds.has(id)||item?.eq==='hat'||id.startsWith('bar_')||
    /^plastic(?:_|$)/.test(id)||/^(?:kit_)?boat(?:_|[0-9]|$)/.test(item?.b||id)||
    (item?.ty==='gun'&&id!=='pistol'&&id!=='crossbow');
}
function mainlandSupply(s){
  return (sdef(s).loot===1||sdef(s).loot===2||sdef(s).loot===4)&&islAt(s.x,s.z)===ISL[0];
}
const vendPool=()=>Object.keys(ITEMS).filter(k=>{const it=ITEMS[k];if(!it.p||it.nov||restrictedSupplyItem(k))return false;if(/^c?f_/.test(k)){const f=FISH.find(q=>q.id===k.replace(/^c/,''));return f&&!f.old}return true});
function vendItems(pi,now){const hr=Math.floor((now||Date.now())/VEND.per),pool=vendPool(),out=[];let k=0;
 while(out.length<Math.min(VEND.n,pool.length)){const id=pool[Math.floor(hash(hr,pi*131+k++,77)*pool.length)];if(!out.includes(id))out.push(id)}return out}
const vendLeft=now=>VEND.per-((now||Date.now())%VEND.per);
const SHOP={sell:['kit_tent','kit_bench','axe','rod','kit_stash'],mult:1,free:1};   /* 초승달 항구마을 상인 품목. free:1 = 아직 재화 없이 무료 */
SHOP.sell.push('chainsaw','crossbow','arrow','fuel');VEND.pack.arrow=10;
SHOP.sell.splice(SHOP.sell.indexOf('rod')+1,0,'ammoS');   /* 30차(기획자: '권총탄·소총탄 없애고 탄알 한 가지로, 탄알은 못 만들고 전부 살 수 있게'): 탄알 12발 묶음(VEND.pack) */   /* 25차: 새 아이템(임시). 상점은 지금 무료(SHOP.free), 화살은 10발 묶음 */
const QUESTS=[{t:'나무 3개와 돌 2개 모으기',c:s=>s.st.wood>=3&&s.st.stone>=2,r:100},{t:'보급상에서 손도끼 사기',c:s=>(s.inv.axe||0)>0,r:100},
 {t:'건설에서 모닥불 피워 몸 녹이기',c:s=>s.st.b_fire>0,r:150},{t:'텐트를 쳐서 내 기지 정하기 (상인에게 받아요)',c:s=>s.st.b_ptent>0,r:200},{t:'낚싯대로 물고기 낚기',c:s=>s.st.fish>0,r:200},{t:'모닥불에서 생선 굽기',c:s=>s.st.cook>0,r:150},{t:'고철 모으기 (잔해, 상자, 약탈자)',c:s=>s.st.scrap>=6,r:200},
 {t:'보급상에서 탄알 사 두기',c:s=>s.st.c_ammoS+s.st.c_ammoL>0||(s.inv.ammoS||0)>36,r:250},{t:'약탈자 5명 물리치기',c:s=>s.st.kills>=5,r:400},
 {t:'첫 밤 습격 막아내기',c:s=>s.st.raids>=1,r:600},{t:'볼트액션 소총 구하기',c:s=>(s.inv.rifle||0)>0,r:500},
 {t:'자동 터렛을 세우고 탄약 넣기',c:s=>s.st.b_tur>0,r:800},{t:'바다 위 등대에 불 켜기 (헤엄쳐서 가요)',c:s=>Object.keys(s.lh||{}).length>=1,r:600},{t:'바다 등대 8곳 모두 밝히기',c:s=>Object.keys(s.lh||{}).length>=8,r:3000}];
/* ===== 24차(기획자 결정): 없앤 아이템·설치물 = 물고기 북극곤들매기·무지개송어(+구운 것), 설치형 모래주머니·가시 함정·탐조등.
   예전 저장을 불러올 때 dropRemoved()가 가방·보관 상자·떨어뜨린 가방·손에서 치우고, 지어 둔 설치물은 재료를 돌려줘요(ui.js boot).
   목표 목록에서 '모래주머니'·'탐조등' 목표 둘도 뺐어요 → 예전 저장의 목표 번호를 한 번 맞춰요(S.qv). 보급지 장식 모래주머니(모델)는 그대로 ===== */
const REMOVED={n:{f_char:'북극곤들매기',cf_char:'구운 북극곤들매기',f_rainbow:'무지개송어',cf_rainbow:'구운 무지개송어',sandbag:'모래주머니',spike:'가시 함정',slight:'탐조등'},
 c:{sandbag:{cloth:1,stone:3},spike:{wood:6,scrap:2},slight:{scrap:10,wood:4}}};
const MERGED={ammoL:'ammoS'};   /* 30차: 없앤 아이템 → 합쳐 들어갈 아이템 */
function dropRemoved(){const got=[],add=k=>{const n=REMOVED.n[k];if(n&&!got.includes(n))got.push(n)};
 const purge=o=>{if(!o)return;for(const k in o)if(!ITEMS[k]){if(o[k]>0)add(k);delete o[k]}};
 const merge=o=>{if(!o)return;for(const a in MERGED){if(o[a]>0)o[MERGED[a]]=(o[MERGED[a]]||0)+o[a];delete o[a]}};merge(S.inv);merge(S.stash);if(S.bag)merge(S.bag.inv);   /* 30차: 합친 아이템(소총탄 → 탄알)은 개수 그대로 옮겨요 */
 purge(S.inv);purge(S.stash);if(S.bag){purge(S.bag.inv);if(!Object.keys(S.bag.inv).some(k=>S.bag.inv[k]>0))S.bag=null}
 S.quick=(S.quick||[]).map(k=>k&&!ITEMS[k]?null:k);
 for(const k of['f_char','f_rainbow']){if(S.caught)delete S.caught[k];if(S.best)delete S.best[k]}
 S.built=(S.built||[]).filter(b=>{const c=REMOVED.c[b.t];if(!c)return true;add(b.t);got.refund=1;for(const k in c)give(k,c[k]);return false});
 if(S.qv!==1){if(S.q>14)S.q--;if(S.q>9)S.q--;S.qv=1}
 return got}
/* ===== dev mode: god/no-clip/fast travel + map markers (kept apart from the save) ===== */
const MTYPE=[['⚓','항구','#4fc3ff'],['🏠','마을','#ffb547'],['👹','몬스터','#ff6b5e'],['⛏','자원','#7bd88f'],['📝','메모','#d0b4ff'],['🌱','식물','#9be37a']];
const DEV={on:false,sp:3,type:0,marks:[],mapMark:false,qty:1,q:''};
function devLoad(){try{const d=JSON.parse(localStorage.getItem('frontisle_dev'));if(d){DEV.on=!!d.on;DEV.marks=d.marks||[];DEV.sp=d.sp||3}}catch(e){}}
function devSave(){try{localStorage.setItem('frontisle_dev',JSON.stringify({on:DEV.on,marks:DEV.marks,sp:DEV.sp}))}catch(e){}}
/* ===== state ===== */
let S=null,opt={snd:true,gfx:1,leftHand:false,volume:100};
const PREF_KEY='frontisle-preferences-v1';
function readPreferences(){
 let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREF_KEY))||{}}catch{}
 const v={...opt,...prefs};
 opt={...opt,snd:v.snd!==false,gfx:[0,1,2].includes(v.gfx)?v.gfx:1,leftHand:v.leftHand===true,
  volume:Number.isFinite(v.volume)?clamp(v.volume,0,100):100};
}
function storePreferences(){try{localStorage.setItem(PREF_KEY,JSON.stringify(opt))}catch{}}

function freshState(seed){return{seed,px:null,pz:null,hp:100,hunger:100,warm:100,time:.3,day:1,coins:100,cx:1,inv:{rod:1},quick:[null,null,null,null,null,null],sel:0,
 home:null,q:0,qv:1,st:{wood:0,stone:0,scrap:0,kills:0,raids:0,camps:0,boss:0,c_ammoS:0,c_ammoL:0,b_fire:0,b_ptent:0,b_sandbag:0,b_mg:0,b_tur:0,b_slight:0,bunk:0,fish:0,cook:0},caught:{},best:{},
 built:[],dep:{},looted:{},lh:{},campDay:{},bag:null,raidDone:0,stash:{}}}
const invN=id=>S.inv[id]||0;
function give(id,n){if(id==='coin'){S.coins+=n;return}S.inv[id]=(S.inv[id]||0)+n;if(S.st[id]!==undefined)S.st[id]+=n;if(ITEMS[id].ty!=='res'&&ITEMS[id].ty!=='ammo'&&ITEMS[id].ty!=='fish'&&!S.quick.includes(id)){const i=S.quick.indexOf(null);if(i>=0)S.quick[i]=id}}
function take(id,n){if(invN(id)<n)return false;S.inv[id]-=n;if(S.inv[id]<=0){delete S.inv[id];const i=S.quick.indexOf(id);if(i>=0)S.quick[i]=null}return true}
const canPay=c=>DEV.on||Object.keys(c).every(k=>invN(k)>=c[k]);
const pay=c=>{if(!DEV.on)Object.keys(c).forEach(k=>take(k,c[k]))};
/* 상점에서 산 설치 키트가 있으면 재료 대신 키트를 써요 */
const hasKit=k=>!!(BUILDS[k]&&BUILDS[k].kit&&invN(BUILDS[k].kit)>0),canBuild=k=>hasKit(k)||canPay(BUILDS[k].c),payBuild=k=>{if(hasKit(k)){if(!DEV.on)take(BUILDS[k].kit,1);return 1}pay(BUILDS[k].c);return 0};
const dark=()=>S?clamp((Math.cos(S.time*Math.PI*2)-.12)/.55,0,1):0;
let AC=null,masterGain=null;
function syncVolume(){if(masterGain)masterGain.gain.value=opt.snd?opt.volume/100:0}
function audioOutput(){
 if(!masterGain){masterGain=AC.createGain();masterGain.connect(AC.destination);syncVolume()}
 return masterGain;
}
function sfx(f,d=.09,ty='triangle',v=.06,slide=0){if(!opt.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),AC.currentTime+d);g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(audioOutput());o.start();o.stop(AC.currentTime+d)}catch(e){}}
function shotSfx(k){if(!opt.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*.12,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=k==='rifle'?900:k==='shotgun'?650:1600;const g=AC.createGain();g.gain.value=k==='smg'?.16:.28;s.connect(f);f.connect(g);g.connect(audioOutput());s.start()}catch(e){}}
let windG=null;function windInit(){if(windG)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*3,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<n;i++){v=v*.985+(Math.random()*2-1)*.015;d[i]=v*7*Math.min(1,i/2000,(n-i)/2000)}const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=380;f.Q.value=.5;windG=AC.createGain();windG.gain.value=0;s.connect(f);f.connect(windG);windG.connect(audioOutput());s.start()}catch(e){}}
function windVol(v){if(windG)windG.gain.value=opt.snd?v:0}
const WX={b:0,on:false,t:200+Math.random()*200};
const jingle=a=>a.forEach((f,i)=>setTimeout(()=>sfx(f,.14),i*90));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
/* ===== 35차(디자인 담당이 새 줄만 덧붙임 — 기획자: '총은 전부 키트로, 상자 안에 총 그림, 이름은 총 이름 뒤에 키트. 중급·고급 낚싯대. 자판기 랜덤 목록에 다 있어야 해')
   그림·모양은 look.js 35차(lk_gkit_*, lk_rod2·lk_rod3). p가 있어서 랜덤 자판기 목록(vendPool)에 저절로 들어가요. 가격·설명은 임시.
   37차 기획자 결정: 키트는 열어서 총이 나오는 게 아니라 나중에 제작해서 합칠 때 쓰는 재료(석궁 키트는 없음).
   아직 없는 것(규칙 담당·기획자): 키트를 재료로 쓰는 제작법, 중급·고급 낚싯대로 실제 낚시(지금 낚시 코드는 'rod'만 봐요)·성능 차이. ===== */
Object.assign(ITEMS,{gkit_pistol:{n:ITEMS.pistol.n+' 키트',ic:'lk_gkit_pistol',ty:'res',p:900,d:ITEMS.pistol.n+' 부품이 든 상자. 열지 않고, 나중에 제작할 때 재료로 써요 (임시)'},
 gkit_rifle:{n:ITEMS.rifle.n+' 키트',ic:'lk_gkit_rifle',ty:'res',p:2600,d:ITEMS.rifle.n+' 부품이 든 상자. 열지 않고, 나중에 제작할 때 재료로 써요 (임시)'},
 gkit_shotgun:{n:ITEMS.shotgun.n+' 키트',ic:'lk_gkit_shotgun',ty:'res',p:3400,d:ITEMS.shotgun.n+' 부품이 든 상자. 열지 않고, 나중에 제작할 때 재료로 써요 (임시)'},
 gkit_smg:{n:ITEMS.smg.n+' 키트',ic:'lk_gkit_smg',ty:'res',p:4200,d:ITEMS.smg.n+' 부품이 든 상자. 열지 않고, 나중에 제작할 때 재료로 써요 (임시)'},
 rod2:{n:'중급 낚싯대',ic:'lk_rod2_i',hg:'lk_rod2',ty:'tool',p:900,d:'튼튼한 철제 낚싯대. 입질이 6~12초로 빨라요 (사거리 8m)',one:1},
 rod3:{n:'고급 낚싯대',ic:'lk_rod3_i',hg:'lk_rod3',ty:'tool',p:2400,d:'밝게 빛나는 고급 철제 낚싯대. 입질이 4~8초로 가장 빨라요 (사거리 8m)',one:1}});
/* ===== 37차(디자인 담당이 새 줄만 덧붙임 — 기획자 11-19 22:54: '아이템 중에서 금속부품, 구리 추가') ===== 
   모양·아이콘은 look.js 37차(lk_mparts, lk_copper). p가 있어서 랜덤 자판기 목록에 저절로 들어가요. 가격·설명·쓰는 곳은 임시(기획자가 정하면 숫자만). */
Object.assign(ITEMS,{mparts:{n:'금속부품',ic:'lk_mparts',ty:'res',p:120,d:'톱니바퀴·볼트·스프링 같은 쇠 부품. 제작 재료 (임시)'},
 copper:{n:'구리',ic:'lk_copper',ty:'res',p:90,d:'붉게 빛나는 구리 덩어리. 제작 재료 (임시)'}});
/* ===== 46차(규칙, 기획자 11-21 13:14) =====
   ① 낚싯대 3단계 — 입질까지 기다리는 시간(초): 기본 8~15, 중급 6~12, 고급 4~8(WEAP[id].bite, water.js가 씀). 나머지(사거리 8m·감기)는 같아요.
   ② 등대 2곳 없앰: 맨 아래 가운데 '남쪽 바다 등대'(LH_SITES[0])와 맵 가운데 '안쪽만 등대'(LH_SITES[4]). 바위섬 땅은 그대로(서버도 같은 땅, 둘레 낚시 포인트도 그대로).
      가운데 바위섬에는 동굴 입구(LH_CAVE, js/cave.js). LH_SITES 번호는 그대로라 예전 저장의 S.lh[i]도 그대로 맞아요. */
ITEMS.rod.d='물고기 떼(물속 그림자)가 도는 곳에 던져요. 사거리 8m, 물 밖에서만. 입질 8~15초';
WEAP.rod.bite=[8,15];Object.assign(WEAP,{rod2:{rod:1,dmg:0,cd:1,range:0,h1:1,bite:[6,12]},rod3:{rod:1,dmg:0,cd:1,range:0,h1:1,bite:[4,8]}});
const isRod=id=>!!(WEAP[id]&&WEAP[id].rod);
const LH_GONE=[0,4],LH_CAVE=4;
/* ===== 47차(디자인 담당이 새 줄만 덧붙임 — 기획자 11-21 13:50: '전구·나무판·물병·빈병·건전지·철판·회로기판·레이저 부착물·손잡이 부착물·소음기는 이미지만,
   버섯 뺀 모든 작물 씨앗 + 자라는 모양 3단계(씨앗·중간·다 자람), 자라는 데 전부 10분 고정, 인게임: 고급 곡괭이·전기 곡괭이·가로등(새로 하나 더)·고급 작업대·
   그물망(물에 놓는 고기잡이 그물)·흰 울타리·철거 망치') =====
   모양·아이콘은 look.js 47차, 움직임(심기·자라기·수확, 곡괭이, 철거 망치, 고급 작업대 창)은 새 파일 js/farm.js. 가격·피해·재료·설명은 모두 임시(기획자가 정하면 숫자만).
   p가 있어서 모두 랜덤 자판기 목록에 저절로 들어가요. 설치물은 키트(가방에서 눌러 설치)로 놓아요. */
Object.assign(ITEMS,{bulb:{n:'전구',ic:'lk_bulb',ty:'res',p:60,d:'불을 밝히는 전구. 제작 재료 (임시)'},plank:{n:'나무판',ic:'lk_plank',ty:'res',p:40,d:'반듯하게 다듬은 나무판. 제작 재료 (임시)'},
 wbottle:{n:'물병',ic:'lk_wbottle',ty:'res',p:50,d:'깨끗한 물이 든 병. 마시기는 아직 (임시)'},ebottle:{n:'빈병',ic:'lk_ebottle',ty:'res',p:10,d:'비어 있는 유리병. 제작 재료 (임시)'},
 aabatt:{n:'건전지',ic:'lk_aabatt',ty:'res',p:80,d:'작은 전기를 담은 건전지. 제작 재료 (임시)'},splate:{n:'철판',ic:'lk_splate',ty:'res',p:150,d:'두꺼운 쇠판. 제작 재료 (임시)'},
 pcb:{n:'회로기판',ic:'lk_pcb',ty:'res',p:300,d:'칩이 붙은 초록 기판. 제작 재료 (임시)'},att_laser:{n:'레이저 부착물',ic:'lk_att_laser',ty:'res',p:800,d:'총에 다는 레이저. 다는 기능은 아직 (임시)'},
 att_grip:{n:'손잡이 부착물',ic:'lk_att_grip',ty:'res',p:600,d:'총 아래에 다는 손잡이(그립). 다는 기능은 아직 (임시)'},att_supp:{n:'소음기',ic:'lk_att_supp',ty:'res',p:1000,d:'총소리를 줄여 줘요. 다는 기능은 아직 (임시)'},
 pick_adv:{n:'고급 곡괭이',ic:'lk_pick_adv',hg:'lk_pick_adv',ty:'tool',p:1200,d:'바위를 맨손보다 3배 빨리 캐요. 근접 16 (임시)',one:1},
 pick_elec:{n:'전기 곡괭이',ic:'lk_pick_elec',hg:'lk_pick_elec',ty:'tool',p:3000,d:'바위를 맨손보다 5배 빨리 캐요. 근접 20 (임시)',one:1},
 dhammer:{n:'철거 망치',ic:'lk_dhammer',hg:'lk_dhammer',ty:'tool',p:500,d:'손에 들고 내 설치물에 바짝 붙어 누르면 철거해요(키트로 놓은 건 키트로, 아니면 재료 절반). 근접 12',one:1},
 kit_lamp2:{n:'랜턴 가로등',ic:'lk_lamp2',ty:'kit',b:'lamp2',p:400,d:'걸이 화분이 달린 랜턴 가로등. 밤이 되면 저절로 켜져요'},
 kit_bench2:{n:'고급 작업대',ic:'lk_bench2',ty:'kit',b:'bench2',p:2000,d:'텐트·집 안에 놓아요. 작업대처럼 제작·업그레이드를 해요(고급 제작법은 아직, 임시)'},
 kit_fnet:{n:'고기잡이 그물',ic:'lk_fnet',ty:'kit',b:'fnet',p:700,d:'바닷가·강가 물 위에 쳐 둬요. 물고기 잡기는 아직 (임시)'},
 kit_fwhite:{n:'흰 울타리',ic:'lk_fence_white',ty:'kit',b:'fence_white',p:60,d:'끝이 뾰족한 흰 말뚝 울타리(한 칸 2m)'}});
Object.assign(WEAP,{pick_adv:{melee:1,dmg:16,cd:.55,range:2.3},pick_elec:{melee:1,dmg:20,cd:.42,range:2.4},dhammer:{melee:1,dmg:12,cd:.6,range:2.2}});
Object.assign(BUILDS,{lamp2:{n:'랜턴 가로등',g:'lk_lamp2',s:1,bx:.3,bz:.3,hp:120,c:{scrap:6,wood:2},kit:'kit_lamp2',lamp:2.42,d:'밤이 되면 저절로 켜져요 (임시)'},
 bench2:{n:'고급 작업대',g:'lk_bench2',s:1,bx:1.42,bz:.68,hp:200,c:{scrap:10,wood:12},kit:'kit_bench2',indoor:1,fixR:1,d:'작업대처럼 제작·업그레이드 (고급 제작법은 아직, 임시)'},
 fnet:{n:'고기잡이 그물',g:'lk_fnet',s:1,bx:1.3,bz:.9,hp:80,c:{cloth:4,wood:4},kit:'kit_fnet',water:1,flat:1,d:'물 위에 쳐 두는 그물. 잡기는 아직 (임시)'},
 fence_white:{n:'흰 울타리',g:'lk_fence_white',s:1,bx:1,bz:.2,hp:60,c:{wood:3},kit:'kit_fwhite',grid:1,d:'끝이 뾰족한 흰 말뚝 울타리 (임시)'}});
const FARM={T:600,bat:w=>{const c=w.charCodeAt(w.length-1)-0xac00;return c>=0&&c<11172&&c%28>0},ids:['potato','wheat','strawberry','grape','avocado','poppy','flower_blue','flower_yellow','flower_black']};   /* 씨앗 → 다 자람 10분(실제 시간). 5분까지 씨앗, 그다음 중간, 10분에 다 자람 */
for(const id of FARM.ids){const q=PLANTS.find(o=>o.id===id);if(!q)continue;
 ITEMS['seed_'+id]={n:q.n+' 씨앗',ic:'lk_seed_'+id,ty:'kit',b:'crop_'+id,p:Math.max(10,Math.round(q.p*.5)),d:`땅에 심으면 ${FARM.T/60}분 뒤 ${q.n}${q.cat==='flower'?(FARM.bat(q.n)?'이':'가')+' 피어요':(FARM.bat(q.n)?'을':'를')+' 거둬요'}. 가방에서 눌러 심어요 (임시)`};
 BUILDS['crop_'+id]={n:q.n+' 밭',g:'pc_'+id+'_0',s:1,bx:.45,bz:.45,pass:1,hp:30,c:{['seed_'+id]:1},kit:'seed_'+id,crop:id,d:`${q.n} 씨앗을 심어요. ${FARM.T/60}분 뒤 거둬요 (임시)`}}
/* ===== 49차(디자인 담당이 새 줄만 덧붙임 — 기획자 11-21 22:18: '소금 후추 나무개머리판 강철개머리판 장총포신 산탄총포신 뷰적(→ 부적으로 읽음) 금 금주괴 포탑키트 방수포 못
   고급 회로기판 플라스틱 조준경스코프 시멘트 콘크리트 울타리 콘크리트 울타리문 화약 구리주괴 철 철주괴 은 은두괴(→ 은 주괴) 석탄 석탄주괴 티타늄 티타늄주괴 이렇게 추가해버려') =====
   모양·아이콘은 look.js 49차(lkItems49). 쓰는 곳(제작법)·얻는 곳·가격·재료는 모두 임시(기획자가 정하면 숫자만). p가 있어서 모두 랜덤 자판기 목록에 저절로 들어가요.
   화약(powder)은 이미 있어서 새로 만들지 않고 그림만 바꿔요(look.js). 구리(copper, 37차)는 '광석'으로 그림을 바꾸고 구리 주괴를 새로 넣어요.
   포탑 키트 = 기존 자동 포탑(BUILDS.turret)을 재료 대신 키트 1개로 놓는 것(철거하면 키트가 돌아와요). 콘크리트 울타리·문 = 2m 칸 울타리(문은 사람이 가까이 오면 열려요, look.js lkGates). */
Object.assign(ITEMS,{salt:{n:'소금',ic:'lk_salt',ty:'res',p:20,d:'하얀 소금. 요리에 쓸 예정 (임시)'},pepper:{n:'후추',ic:'lk_pepper',ty:'res',p:30,d:'통후추와 후추 갈이. 요리에 쓸 예정 (임시)'},
 gp_wstock:{n:'나무 개머리판',ic:'lk_gp_wstock',ty:'res',p:300,d:'나무로 깎은 총 개머리판. 총 제작 재료 (임시)'},gp_sstock:{n:'강철 개머리판',ic:'lk_gp_sstock',ty:'res',p:700,d:'가볍고 튼튼한 강철 개머리판. 총 제작 재료 (임시)'},
 gp_rbarrel:{n:'장총 포신',ic:'lk_gp_rbarrel',ty:'res',p:800,d:'길고 가는 소총 총열. 총 제작 재료 (임시)'},gp_sbarrel:{n:'산탄총 포신',ic:'lk_gp_sbarrel',ty:'res',p:700,d:'굵은 산탄총 총열. 총 제작 재료 (임시)'},
 charm:{n:'부적',ic:'lk_charm',ty:'res',p:500,d:'붉은 글씨가 적힌 노란 부적. 쓰는 곳은 아직 (임시)'},
 ore_gold:{n:'금',ic:'lk_ore_gold',ty:'res',p:400,d:'금 알갱이가 박힌 광석. 녹이면 금 주괴 (임시)'},bar_gold:{n:'금 주괴',ic:'lk_bar_gold',ty:'res',p:1200,d:'번쩍이는 금 덩어리 (임시)'},
 ore_silver:{n:'은',ic:'lk_ore_silver',ty:'res',p:200,d:'은 결정이 박힌 광석. 녹이면 은 주괴 (임시)'},bar_silver:{n:'은 주괴',ic:'lk_bar_silver',ty:'res',p:600,d:'하얗게 빛나는 은 덩어리 (임시)'},
 ore_iron:{n:'철',ic:'lk_ore_iron',ty:'res',p:60,d:'붉은 녹빛 철광석. 녹이면 철 주괴 (임시)'},bar_iron:{n:'철 주괴',ic:'lk_bar_iron',ty:'res',p:180,d:'단단한 쇠 덩어리 (임시)'},
 bar_copper:{n:'구리 주괴',ic:'lk_bar_copper',ty:'res',p:250,d:'붉은빛 구리 덩어리 (임시)'},
 coal:{n:'석탄',ic:'lk_coal',ty:'res',p:30,d:'까만 석탄 덩이. 연료·제련에 쓸 예정 (임시)'},bar_coal:{n:'석탄 주괴',ic:'lk_bar_coal',ty:'res',p:90,d:'석탄을 눌러 굳힌 덩어리 (임시)'},
 ore_ti:{n:'티타늄',ic:'lk_ore_ti',ty:'res',p:500,d:'푸른 결정이 박힌 티타늄 광석. 녹이면 티타늄 주괴 (임시)'},bar_ti:{n:'티타늄 주괴',ic:'lk_bar_ti',ty:'res',p:1500,d:'가볍고 아주 단단한 푸른 은빛 덩어리 (임시)'},
 tarp:{n:'방수포',ic:'lk_tarp',ty:'res',p:150,d:'접어 둔 파란 방수포. 제작 재료 (임시)'},nails:{n:'못',ic:'lk_nails',ty:'res',p:20,d:'쇠못 한 상자. 제작 재료 (임시)'},
 pcb2:{n:'고급 회로기판',ic:'lk_pcb2',ty:'res',p:900,d:'냉각 팬과 큰 칩이 붙은 남색 기판. 제작 재료 (임시)'},plastic:{n:'플라스틱',ic:'lk_plastic',ty:'res',p:60,d:'알록달록한 플라스틱 판. 제작 재료 (임시)'},
 att_scope:{n:'조준경 스코프',ic:'lk_att_scope',ty:'res',p:1200,d:'멀리 보이게 하는 총 조준경. 다는 기능은 아직 (임시)'},cement:{n:'시멘트',ic:'lk_cement',ty:'res',p:80,d:'회색 가루가 든 시멘트 포대. 콘크리트를 만들 예정 (임시)'},
 kit_turret:{n:'포탑 키트',ic:'lk_kit_turret',ty:'kit',b:'turret',p:2400,d:'자동 포탑 부품이 든 상자. 가방에서 눌러 바로 설치해요'},
 kit_fconc:{n:'콘크리트 울타리',ic:'lk_fence_conc',ty:'kit',b:'fence_conc',p:200,d:'단단한 콘크리트 판 울타리(한 칸 2m)'},
 kit_gconc:{n:'콘크리트 울타리 문',ic:'lk_gate_conc',ty:'kit',b:'gate_conc',p:300,d:'콘크리트 울타리에 다는 철문. 나는 지나가고 적은 막아요'}});
BUILDS.turret.kit='kit_turret';
Object.assign(BUILDS,{fence_conc:{n:'콘크리트 울타리',g:'lk_fence_conc',s:1,bx:1,bz:.25,hp:800,c:{cement:2,stone:3},kit:'kit_fconc',grid:1,d:'단단한 콘크리트 판 울타리 (임시)'},
 gate_conc:{n:'콘크리트 울타리 문',g:'lk_gate_conc',s:1,bx:1,bz:.25,hp:700,c:{cement:2,stone:2,scrap:3},kit:'kit_gconc',grid:1,gate:1,d:'나는 지나가고 적은 막아요 (임시)'}});
ITEMS.copper.d='구리 알갱이가 박힌 초록빛 광석. 녹이면 구리 주괴 (임시)';
/* ===== 51차(디자인 담당이 새 줄만 덧붙임 — 기획자 11-21 22:52: '페인트 아이템도 만들어 줬으면, 도색 작업대도 하나, 페인트 종류는 8종류 정도, 대중적인 색들 색감 괜찮게') =====
   페인트 8색(ty res, 그림만 — 칠하기 기능은 기획자가 정할 때) + 도색 작업대(키트로 설치, 밖에도·텐트/집 안에도(inok), 누르면 '준비 중' 안내 — js/farm.js). 가격·재료 임시, 자판기에 저절로. */
const PAINTS=[['red','빨간',0xe0533f],['orange','주황',0xf28c38],['yellow','노란',0xf7c948],['green','초록',0x5bae5f],['blue','파란',0x3f7fd0],['purple','보라',0x8b5cc9],['white','흰',0xf4f1ea],['black','검은',0x33363b]];
for(const [k,n] of PAINTS)ITEMS['paint_'+k]={n:n+' 페인트',ic:'lk_paint_'+k,ty:'res',p:80,d:`${n} 페인트 한 통. 칠하기는 아직 (임시)`};
Object.assign(ITEMS,{kit_paintbench:{n:'도색 작업대',ic:'lk_paintbench',ty:'kit',b:'paintbench',p:900,d:'페인트를 섞고 칠하는 작업대. 밖에도, 텐트·집 안에도 놓아요 (도색 기능은 아직, 임시)'}});
Object.assign(BUILDS,{paintbench:{n:'도색 작업대',g:'lk_paintbench',s:1,bx:.92,bz:.45,hp:150,c:{wood:8,scrap:4},kit:'kit_paintbench',inok:1,fixR:1,d:'페인트를 섞고 칠하는 작업대 (도색 기능은 아직, 임시)'}});
/* ===== 61차(디자인 담당이 새 줄만 덧붙임 — 기획자 11-22 22:09: '원래 있던 총 종류 없애 버리고 7종류 추가, 키트들도 다 이걸로 바꿔야 해.
   현대소총·점사소총·반자동소총·기관단총·저격총·쏘오프샷건·반자동권총. 권총을 제외한 모든 총은 쏘거나 조준하면서 이동속도가 50% 느려져야 해') =====
   옛 권총·볼트액션 소총·산탄총·기관단총은 없어지고 그 id 넷(pistol·rifle·shotgun·smg)을 새 총이 이어받아요 → 예전 저장·보급 상자·적·제작법·서버가 그대로 이어져요.
   새 id 셋: ar(현대 소총)·burst(점사 소총)·sniper(저격총). 모양·아이콘 GEO 'gn_<id>'(js/guns.js), 쏘는 방식은 js/guns.js가 오른쪽 조이스틱에 붙여요.
   WEAP 새 칸: fm 쏘는 방식('auto' 조준하는 동안 계속 · 'burst' 조준하는 동안 3발씩 끊어서 · 'semi' 조준하고 떼면 한 발), slow 조준·쏘는 동안 이동 속도 배율(권총 없음),
   bn·bp 점사 발 수·쉬는 시간, use 한 번에 쓰는 탄알, cam 조준할 때 화면이 밀리는 정도(저격총 크게), shk 화면 흔들림. 숫자·가격은 임시(기획자가 정하면 여기만). 서버도 이 표를 읽어요. */
Object.assign(ITEMS,{
 pistol:{n:'반자동 권총',ic:'gn_pistol',hg:'gn_pistol',ty:'gun',p:900,d:'조준하고 떼면 한 발. 들고 쏴도 느려지지 않아요. 피해 16',one:1},
 rifle:{n:'반자동 소총',ic:'gn_rifle',hg:'gn_rifle',ty:'gun',p:2600,d:'조준하고 떼면 한 발씩 묵직하게. 피해 36 · 조준·쏘는 동안 50% 느려져요',one:1},
 ar:{n:'현대 소총',ic:'gn_ar',hg:'gn_ar',ty:'gun',p:4200,d:'조준하는 동안 그쪽으로 계속 쏴요(떼면 멈춤). 피해 14 · 조준·쏘는 동안 50% 느려져요',one:1},
 burst:{n:'점사 소총',ic:'gn_burst',hg:'gn_burst',ty:'gun',p:3800,d:'조준하는 동안 3발씩 끊어서 쏴요(탕탕탕… 탕탕탕). 피해 18×3 · 조준·쏘는 동안 50% 느려져요',one:1},
 smg:{n:'기관단총',ic:'gn_smg',hg:'gn_smg',ty:'gun',p:4000,d:'조준하는 동안 계속 쏴요. 한 번에 탄알 2발, 피해 22로 세지만 많이 퍼져요 · 조준·쏘는 동안 50% 느려져요',one:1},
 sniper:{n:'저격총',ic:'gn_sniper',hg:'gn_sniper',ty:'gun',p:5200,d:'조준하고 떼면 한 발. 아주 멀리·아주 세게(피해 95), 조준하면 화면이 멀리까지 넓어져요 · 조준·쏘는 동안 50% 느려져요',one:1},
 shotgun:{n:'소드오프 샷건',ic:'gn_shotgun',hg:'gn_shotgun',ty:'gun',p:3000,d:'조준하고 떼면 한 발. 가까이에서 산탄 7알(피해 11×7) · 조준·쏘는 동안 50% 느려져요',one:1}});
Object.assign(WEAP,{
 pistol:{dmg:16,cd:.3,range:16,ammo:'ammoS',spread:.03,h1:1,fm:'semi',shk:.12},
 rifle:{dmg:36,cd:.42,range:26,ammo:'ammoS',spread:.012,fm:'semi',slow:.5,cam:1.15,shk:.22},
 ar:{dmg:14,cd:.12,range:22,ammo:'ammoS',spread:.05,fm:'auto',slow:.5,shk:.07},
 burst:{dmg:18,cd:.085,bn:3,bp:.55,range:24,ammo:'ammoS',spread:.025,fm:'burst',slow:.5,shk:.08},
 smg:{dmg:22,cd:.11,range:14,ammo:'ammoS',spread:.11,fm:'auto',use:2,slow:.5,shk:.08},
 sniper:{dmg:95,cd:1.25,range:44,ammo:'ammoS',spread:.002,fm:'semi',slow:.5,cam:2.2,shk:.42},
 shotgun:{dmg:11,pel:7,cd:.8,range:8,ammo:'ammoS',spread:.24,fm:'semi',slow:.5,shk:.34}});
/* 총 키트 7종(35차 키트를 새 총으로): 이름 = 총 이름 + ' 키트', 가격 = 총 값(임시), 열지 않는 제작 재료 */
for(const k of['pistol','rifle','ar','burst','smg','sniper','shotgun'])ITEMS['gkit_'+k]={n:ITEMS[k].n+' 키트',ic:'lk_gkit_'+k,ty:'res',p:ITEMS[k].p,d:ITEMS[k].n+' 부품이 든 상자. 열지 않고, 나중에 제작할 때 재료로 써요 (임시)'};
for(const q of QUESTS)if(q.t==='볼트액션 소총 구하기')q.t='반자동 소총 구하기';
