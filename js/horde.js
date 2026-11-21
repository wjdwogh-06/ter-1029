'use strict';
/* ===== 46차(규칙, 기획자 11-21 13:14): 달섬(초승달 본섬) 약탈자 무리 =====
   기획자: '맵에서 가장 큰 달이랑 비슷한 형태의 섬에서는 약탈자 무리들이 계속해서 낮이고 밤이고 돌아다녀. 원래 있던 시스템은 삭제하고 이걸로 바꿔.
           한 무리당 5~10명이고 다 죽이면 랜덤하게 생겨나. 달섬 안에는 크게 3개 정도 무리, 웬만하면 안 만나게 각자 구역을 정해'.
   - 예전 것은 꺼요: 플레이어 둘레에 무작위로 생기던 골렘·덩굴·악령과 경비병(updSpawns), 밤마다 텐트로 몰려오던 습격(updRaid).
   - 구역 3개(HZ.Z): 본섬 땅을 섬의 등뼈(ISL[0].sp — 북쪽 → 서쪽 → 남쪽 → 동쪽으로 휜 초승달 줄)를 따라 땅 넓이가 같게 셋으로 나누고,
     경계 양쪽 HZ.gap(28m)은 비워 둬요 → 무리끼리 잘 안 만나요(못 만나는 건 아님: 싸우다 쫓아가면 넘어갈 수 있어요).
     무리가 안 가는 곳: 항구 안전 구역 + HZ.safe(22m), 처음 마을 둘레 70m, 보급지 둘레 16m, 설치 금지 구역(등대·동굴 바위섬 등), 물·강.
   - 무리 = 약탈자(칼) 대부분 + 소총수 약 30% + 7명 이상이면 두목 1명(ENEMY bandit·gunner·brute 그대로, 쓰러뜨리면 원래 전리품).
     무리 가운데(앵커)가 같은 구역 안 다음 지점(18~70m, 가는 줄이 모두 땅)으로 천천히(HZ.sp m/초) 걷고, 멤버는 앵커 둘레 자기 자리로 따라 걸어요.
     도착하면 3~10초 쉬었다 다음 지점. 멤버가 뒤처지면 앵커가 기다려요.
   - 한 명이 플레이어를 보면(15m, actors.js 그대로) 플레이어 32m 안의 같은 무리가 다 같이 덤벼요. 앵커에서 55m 넘게 멀어지면 돌아가요(actors.js).
     플레이어가 항구 안전 구역 안이나 텐트·동굴 안이면 쫓지 않아요.
   - 플레이어가 앵커 HZ.near(82m) 안이면 멤버를 만들고, HZ.far(100m) 밖이면 지워요(살아 있는 수는 기억). 멀리서는 앵커만 움직여요.
   - 다 쓰러뜨리면 HZ.re(45~90)초 뒤 같은 구역 안 무작위 자리(되도록 플레이어에서 110m 넘게)에 5~10명 새 무리.
   - 저장은 안 해요(다시 켜면 새로 생겨요). 멀티는 지금 각자 화면에서 따로예요(서버 마무리 때). */
const HZ={n:3,min:5,max:10,sp:1.05,near:82,far:100,gap:28,safe:22,re:[45,90],cell:7,G:[],Z:[],ready:false};
function hzOk(x,z){if(hAt(x,z)<1)return false;for(const q of PORT_SAFE)if(dist(x,z,q[0],q[1])<q[2]+HZ.safe)return false;if(dist(x,z,VIL.px,VIL.pz)<70)return false;
 for(const s of SUPS)if(dist(x,z,s.x,s.z)<16)return false;for(const n of NOB)if(n.k!=='port'&&dist(x,z,n.x,n.z)<n.r+2)return false;return true}
function hzBuild(){const I=ISL[0],sp=I.sp,seg=[];let L=0;for(let i=0;i<sp.length-1;i++){const a=sp[i],b=sp[i+1],l=dist(a[0],a[1],b[0],b[1]);seg.push([a[0],a[1],b[0],b[1],L,l]);L+=l}
 const tOf=(x,z)=>{let bd=1e9,bt=0;for(const[ax,az,bx,bz,l0,l]of seg){const dx=bx-ax,dz=bz-az,u=clamp(((x-ax)*dx+(z-az)*dz)/(l*l),0,1),d=dist(x,z,ax+dx*u,az+dz*u);if(d<bd){bd=d;bt=l0+u*l}}return bt};
 const cells=[],C=HZ.cell;for(let z=C/2;z<WS;z+=C)for(let x=C/2;x<WS;x+=C){if(hAt(x,z)<1||islAt(x,z)!==I)continue;cells.push({x,z,t:tOf(x,z)})}
 cells.sort((a,b)=>a.t-b.t);const cut=[];for(let k=1;k<HZ.n;k++)cut.push(cells[Math.floor(cells.length*k/HZ.n)].t);
 HZ.Z=[];for(let k=0;k<HZ.n;k++)HZ.Z.push({k,cells:[]});HZ.cut=cut;HZ.tOf=tOf;HZ.len=L;
 const grid=new Map(),key=(x,z)=>Math.round(x/C)+','+Math.round(z/C);for(const c of cells){let k=0;while(k<cut.length&&c.t>=cut[k])k++;c.k=k;grid.set(key(c.x,c.z),c)}
 const GD=HZ.gap*.65,R=Math.ceil(GD/C);   /* 다른 구역 땅에서 GD(18m) 안의 칸은 비워요 → 두 구역의 무리 칸은 땅에서 약 gap(28m) 넘게 떨어져요 */
 for(const c of cells){if(cut.some(t=>Math.abs(c.t-t)<HZ.gap)||!hzOk(c.x,c.z))continue;let near=false;
  for(let j=-R;j<=R&&!near;j++)for(let i=-R;i<=R;i++){const o=grid.get(key(c.x+i*C,c.z+j*C));if(o&&o.k!==c.k&&dist(o.x,o.z,c.x,c.z)<GD){near=true;break}}
  if(!near)HZ.Z[c.k].cells.push(c)}}
const hzZone=(x,z)=>{if(!HZ.tOf)return -1;const t=HZ.tOf(x,z);let k=0;while(k<HZ.cut.length&&t>=HZ.cut[k])k++;return k};
function hzLine(x0,z0,x1,z1){const n=Math.ceil(dist(x0,z0,x1,z1)/2.5);for(let i=1;i<=n;i++){const u=i/n,x=lerp(x0,x1,u),z=lerp(z0,z1,u);if(hAt(x,z)<.98||!hzOk(x,z))return false}return true}
const hzFree=(x,z)=>hAt(x,z)>.95&&walk(x,z,.45)===null;
function hzNew(g,far){const Z=HZ.Z[g.k].cells;if(!Z.length)return false;let c=null;for(let i=0;i<60&&!c;i++){const q=Z[(Math.random()*Z.length)|0];if(far&&!INT.on&&dist(q.x,q.z,P.x,P.z)<(i<40?110:70))continue;c=q}if(!c)return false;
 const n=HZ.min+((Math.random()*(HZ.max-HZ.min+1))|0),comp=[];if(n>=7)comp.push('brute');for(let i=Math.round(n*.3);i>0;i--)comp.push('gunner');while(comp.length<n)comp.push('bandit');
 Object.assign(g,{n,alive:n,comp,dead:new Array(n).fill(false),mem:new Array(n).fill(null),a:{x:c.x,z:c.z},w:null,rest:rand(1,4),on:false,re:0,wait:0,dx:0,dz:1,slots:[]});
 for(let i=0;i<n;i++){const an=i*2.39996,r=i?1.5+.85*Math.sqrt(i):0;g.slots.push([Math.cos(an)*r,Math.sin(an)*r])}return true}
function hzNext(g){const Z=HZ.Z[g.k].cells,c=[];for(const q of Z){const d=dist(q.x,q.z,g.a.x,g.a.z);if(d>=18&&d<=70)c.push(q)}
 for(let i=0;i<14&&c.length;i++){const j=(Math.random()*c.length)|0,q=c[j];c.splice(j,1);if(hzLine(g.a.x,g.a.z,q.x,q.z)){const x=q.x+rand(-2,2),z=q.z+rand(-2,2);return hzOk(x,z)&&hzLine(g.a.x,g.a.z,x,z)?{x,z}:{x:q.x,z:q.z}}}
 for(const q of Z)if(dist(q.x,q.z,g.a.x,g.a.z)<16&&hzLine(g.a.x,g.a.z,q.x,q.z))return{x:q.x,z:q.z};return null}
function hzSpot(x,z){if(hzFree(x,z))return[x,z];for(let k=0;k<16;k++){const an=rand(0,6.28),r=rand(.5,4.5),xx=x+Math.cos(an)*r,zz=z+Math.sin(an)*r;if(hzFree(xx,zz))return[xx,zz]}return null}
function hzOn(g){g.on=true;for(let i=0;i<g.n;i++){if(g.dead[i]||g.mem[i])continue;const p=hzSpot(g.a.x+g.slots[i][0],g.a.z+g.slots[i][1])||hzSpot(g.a.x,g.a.z);if(!p)continue;g.mem[i]=spawnEnemy(g.comp[i],p[0],p[1],{grp:g,gi:i,ax:p[0],az:p[1]})}}
function hzOff(g){g.on=false;for(let i=0;i<g.n;i++){const e=g.mem[i];if(e&&!e.dead)dropEnemy(e);g.mem[i]=null}}
function hzTick(g,dt){if(g.alive<=0){g.re-=dt;if(g.re<=0&&!hzNew(g,true))g.re=5;return}
 const out=INT.on,pd=out?1e9:dist(P.x,P.z,g.a.x,g.a.z),live=()=>g.mem.filter(e=>e&&!e.dead);
 if(!g.on&&pd<HZ.near)hzOn(g);else if(g.on&&pd>HZ.far&&!live().some(e=>e.agg))hzOff(g);
 const L=g.on?live():[],safe=out||!!inSafe(P.x,P.z),fight=!safe&&L.some(e=>e.agg);
 if(fight&&!P.dead&&!DEV.on)for(const e of L)if(!e.agg&&dist(e.x,e.z,P.x,P.z)<32)e.agg=1;   /* 한 명이 보면 같은 무리가 다 같이 */
 let lag=0;for(const e of L){if(e.agg)continue;const s=g.slots[e.gi];lag=Math.max(lag,dist(e.x,e.z,g.a.x+s[0],g.a.z+s[1]))}
 let mv=false;
 if(fight)g.wait=0;else if(g.rest>0)g.rest-=dt;else{if(!g.w){g.w=hzNext(g);if(!g.w)g.rest=4}
  if(g.w){if(g.on&&lag>6.5){g.wait+=dt;if(g.wait>10){g.wait=0;hzUnstick(g);g.w=hzNext(g)}}
   else{g.wait=0;const d=dist(g.a.x,g.a.z,g.w.x,g.w.z);if(d<.8){g.w=null;g.rest=rand(3,10)}else{const st=Math.min(d,HZ.sp*dt);g.dx=(g.w.x-g.a.x)/d;g.dz=(g.w.z-g.a.z)/d;g.a.x+=g.dx*st;g.a.z+=g.dz*st;mv=true}}}}
 for(const e of L){const s=g.slots[e.gi];let tx=g.a.x+s[0],tz=g.a.z+s[1];e.ax=tx;e.az=tz;if(mv){tx+=g.dx*1.6;tz+=g.dz*1.6}
  if(!e.agg){e.wx=tx;e.wz=tz;e.wt=9}
  if(!e.agg&&dist(e.x,e.z,P.x,P.z)>84&&hzFree(e.ax,e.az)){e.x=e.ax;e.z=e.az}}}   /* 멀어서 안 보이고 actors.js가 멈춰 둔 멤버는 자리로 옮겨 둬요 */
function hzUnstick(g){for(const e of g.mem){if(!e||e.dead||e.agg)continue;const s=g.slots[e.gi],x=g.a.x+s[0],z=g.a.z+s[1];if(dist(e.x,e.z,x,z)>6&&dist(e.x,e.z,P.x,P.z)>40&&dist(x,z,P.x,P.z)>40){const p=hzSpot(x,z);if(p){e.x=p[0];e.z=p[1]}}}}
function hzInit(){hzBuild();HZ.G=[];for(let k=0;k<HZ.n;k++){const g={k};if(!hzNew(g,true))hzNew(g,false);HZ.G.push(g)}HZ.ready=true}
/* 예전 스폰·습격 대신 */
updSpawns=function(dt){if(!HZ.ready)hzInit();for(const g of HZ.G)if(g.a||g.alive<=0)hzTick(g,dt)};
updRaid=function(){};
{const _ke=killEnemy;killEnemy=function(e){_ke(e);const g=e.grp;if(!g||g.dead[e.gi])return;g.dead[e.gi]=true;g.mem[e.gi]=null;g.alive--;
 if(g.alive<=0){g.on=false;g.re=rand(HZ.re[0],HZ.re[1]);toast('⚔ 약탈자 무리를 모두 쓰러뜨렸어요! 얼마 뒤 다른 곳에 새 무리가 나타나요');jingle([523,659,784])}}}
/* 안전 구역·텐트·동굴 안의 플레이어는 쫓지 않아요(actors.js의 '15m 안이면 덤빔'을 그 동안만 막아요) */
{const _ue=updEnemy;updEnemy=function(e,dt){if(e.grp&&!e.dead&&(INT.on||inSafe(P.x,P.z))){e.agg=0;const d=DEV.on;DEV.on=true;try{_ue(e,dt)}finally{DEV.on=d}return}_ue(e,dt)}}
/* 새 게임·불러오기 때 다시 만들어요 */
{const _hb=buildNoBuild;buildNoBuild=function(){_hb();for(const g of HZ.G)if(g.on)hzOff(g);HZ.ready=false}}
