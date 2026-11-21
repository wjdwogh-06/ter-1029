/* ===== 47차(디자인 담당, 기획자 11-21 13:50): 씨앗 심기·자라기·거두기 · 곡괭이 · 철거 망치 · 고급 작업대 =====
   데이터는 core.js 47차 덩어리(ITEMS·WEAP·BUILDS·FARM), 모양은 look.js 47차. 이 파일은 index.html 맨 끝(dog.js 다음)에서 읽어요 → 빼면 47차 동작만 꺼져요.
   ① 씨앗(seed_<id>, 버섯 빼고 9종): 가방에서 누르면 심기 모드(키트처럼) → 땅에 놓으면 crop_<id>(지나갈 수 있음, s.at = 심은 시각, 저장됨).
      실제 시간으로 0~5분 씨앗(pc_<id>_0) → 5~10분 중간(_1) → 10분(FARM.T) 다 자람(_2). 모양이 바뀔 때 통통 튀며 흙먼지.
      다 자라면 [감자 캐기·포도 따기·양귀비 꺾기…] → 들에서 딸 때와 같은 개수(PLANTS n1) + 식물 도감 기록, 밭은 사라져요(씨앗은 안 돌려줘요).
      덜 자랐으면 누르면 남은 시간 안내. 가까이(5.5m, 가까운 4개) 가면 밭 위에 남은 시간·'다 자랐어요' 알약. 철거(망치·철거 모드)하면 씨앗이 돌아와요.
   ② 곡괭이(pick_adv·pick_elec): 손에 들고 바위를 캐면 한 번에 맨손(CHOP.hit)의 3·5배. 오른쪽 조이스틱 끝까지 당기면 계속 캐요(41차 근접 무기와 같음).
   ③ 철거 망치(dhammer): 손에 들면 내 설치물(철거할 수 있는 것)의 이름표가 '🔨 철거' → 바짝 붙어 오른쪽 조이스틱 가운데 톡 = 철거(철거 모드 placeBuild 그대로라 멀티도 같아요).
   ④ 고급 작업대(bench2): 텐트·집 안에만, 누르면 작업대 창(제작 칸 + 업그레이드) 그대로. 고급 제작법은 기획자가 정할 때.
   랜턴 가로등(lamp2)·흰 울타리(fence_white)·고기잡이 그물(fnet, 물 위)은 BUILDS 정의만으로 움직여요(밤 불빛 = d.lamp, 그물 = water·flat). */
const FARMV={tick:0,pops:[]};
const cropQ=s=>{const d=BUILDS[s.t];return d&&d.crop?PLD[d.crop]:null};
const cropAge=s=>Math.max(0,(Date.now()-(s.at||Date.now()))/1000);
const cropStage=s=>{const a=cropAge(s);return a>=FARM.T?2:a>=FARM.T/2?1:0};
const cropLeft=s=>Math.max(0,FARM.T-cropAge(s));
const cropMS=t=>{t=Math.ceil(t);const m=(t/60)|0,ss=t%60;return m?`${m}분 ${ss}초`:`${ss}초`};
function cropSet(s,pop){const q=cropQ(s);if(!q||!s.m)return;const k=cropStage(s);if(s.stg===k)return;const g=GEO['pc_'+q.id+'_'+k];const m=s.m.children[0];if(g&&m&&m.isMesh)m.geometry=g;
 const first=s.stg===undefined;s.stg=k;if(!first&&pop){s.pop=0;FARMV.pops.push(s);const y=groundY(s.x,s.z);puff(s.x,y+.3,s.z,0x8a6a4a,5,.5);if(k===2&&dist(s.x,s.z,P.x,P.z)<30)sfx(700,.06,'sine',.035)}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);if(r&&BUILDS[r.t]&&BUILDS[r.t].crop){if(!r.at)r.at=Date.now();cropSet(r,false)}return r}}
const farmPopK=t=>{t=Math.min(1,Math.max(0,t));const c=1.9,u=t-1;return 1+(c+1)*u*u*u+c*u*u};
function farmUpd(dt){const now=performance.now();if(now>=FARMV.tick){FARMV.tick=now+500;for(const s of structs)if(BUILDS[s.t]&&BUILDS[s.t].crop)cropSet(s,true)}
 for(let i=FARMV.pops.length-1;i>=0;i--){const s=FARMV.pops[i];s.pop+=dt/.45;const k=s.pop>=1?1:.2+.8*farmPopK(s.pop);if(s.m)s.m.scale.set(k,k,k);if(s.pop>=1)FARMV.pops.splice(i,1)}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{farmUpd(dt)}catch(e){}}}
function cropHarvest(s){const q=cropQ(s);if(!q||P.cd>0)return;if(cropStage(s)<2){toast(`🌱 ${q.n} 자라는 중이에요 — ${cropMS(cropLeft(s))} 남았어요`);sfx(300,.05,'sine',.03);return}
 if(typeof bagHas==='function'&&!bagHas(q.id)){if(typeof bagFullMsg==='function')bagFullMsg();else toast('가방이 꽉 찼어요');return}
 P.cd=.45;P.rot=Math.atan2(s.x-P.x,s.z-P.z);P.a.play('PickUp',{once:1,lock:.4,force:1,speed:1.6});const first=!(S.pdex&&S.pdex[q.id]);give(q.id,q.n1);S.pdex=S.pdex||{};S.pdex[q.id]=(S.pdex[q.id]||0)+q.n1;
 const y=groundY(s.x,s.z);puff(s.x,y+.4,s.z,q.cat==='flower'?0xe9a3c4:0x8fc46a,6,.5);ftext(s.x,y+1.6,s.z,`+${q.n1} ${q.n}`,'#b8f0c0');sfx(620,.06,'sine',.04);removeStruct(s);if(typeof dressDirty==='function')try{dressDirty(s.x,s.z)}catch(e){}
 if(first){toast(`🌱 새 식물: ${q.n}! 가방의 식물 도감에 올렸어요`);jingle([523,659,784])}target=null;hudDirty=true}
/* 철거 망치로 철거할 수 있는 것 */
const hamOK=s=>!!(s&&BUILDS[s.t]&&!s.npc&&(typeof canDemo==='function'?canDemo(s):s.own)&&!!s.in===!!INT.on);
function hamDemo(s){if(!hamOK(s))return;const bm=bmode,px=P.x,pz=P.z;bmode='demo';P.x=s.x;P.z=s.z;try{placeBuild()}finally{bmode=bm;P.x=px;P.z=pz}P.a.play('1H_Melee_Attack_Chop',{once:1,lock:.34,force:1,speed:1.4});P.cd=.5;target=null}
{const _sl=sLabel;sLabel=function(s){if(curId()==='dhammer'&&hamOK(s))return'🔨 철거';const q=cropQ(s);if(q){if(!s.own)return null;return cropStage(s)>=2?`${q.n} ${q.v}`:`🌱 ${q.n} · ${cropMS(cropLeft(s))}`}if(s.t==='bench2')return'고급 작업대';return _sl(s)}}
const PICKM={pick_adv:3,pick_elec:5};
{const _ia=interact;interact=function(){const t=target;
 if(t&&t.k==='s'){const s=t.s;if(curId()==='dhammer'&&hamOK(s)){if(inp.actEdge&&P.cd<=0)hamDemo(s);return}
  if(cropQ(s)){if(inp.actEdge)cropHarvest(s);return}if(s.t==='bench2'){if(inp.actEdge)openPanel('bench');return}}
 if(t&&t.k==='o'&&P.cd<=0){const T=OBJT[t.o.t],m=PICKM[curId()];if(m&&T.drop&&T.drop[0]==='stone')t.o.hp-=(m-1)*(typeof CHOP!=='undefined'?CHOP.hit:1)}   /* 곡괭이: 한 번 캘 때 맨손(46차 CHOP.hit)의 3·5배 */
 return _ia()}}
/* 밭 위 남은 시간 알약(5.5m 안 가까운 4개, 내 밭만) */
let farmHooked=false;function farmHook(){if(farmHooked||typeof drawFx!=='function')return;farmHooked=true;const _df=drawFx;drawFx=function(dt){_df(dt);try{if(mode!=='play'||INT.on)return;const k=Math.max(.75,UIS*1.1);
  const L=[];for(const s of structs){if(!s.own||!cropQ(s))continue;const d=dist(s.x,s.z,P.x,P.z);if(d>5.5||target&&target.s===s)continue;L.push([d,s])}L.sort((a,b)=>a[0]-b[0]);for(const [d,s] of L.slice(0,4)){const st=cropStage(s),p=scr(s.x,groundY(s.x,s.z)+(st===2?1.25:.75),s.z);
   uiPill(fctx,st===2?'✓ 다 자랐어요':'⏳ '+cropMS(cropLeft(s)),p[0],p[1],10.5*k,st===2?(UIC.grn||'#5fae7e'):'rgba(251,244,230,.92)',st===2?'#fff':'#5B3D2B')}}catch(e){}}}
{const _ud2=updDress;updDress=function(dt,px,pz){farmHook();_ud2(dt,px,pz)}}
/* 51차(디자인): 도색 작업대 — 바짝 붙어 누르면 '준비 중' 안내(도색 기능은 기획자가 정할 때). 텐트·집 안에 놓았으면 그 집에 들어가 있을 때만 이름표 */
{const _sl=sLabel;sLabel=function(s){if(s.t==='paintbench'&&!(curId()==='dhammer'&&hamOK(s))){if(s.in&&typeof curHK==='function'&&s.hk!=null&&s.hk!==curHK())return null;return'🎨 도색 작업대'}return _sl(s)}}
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'&&t.s.t==='paintbench'&&!(curId()==='dhammer'&&hamOK(t.s))){if(inp.actEdge)toast('🎨 도색 작업대예요. 칠하기 기능은 준비 중이에요');return}return _ia()}}
