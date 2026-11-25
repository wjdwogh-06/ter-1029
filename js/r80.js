/* ===== 80차(규칙, 기획자 11-25 18:01) =====
   ① 총 쥐는 손(앞발)을 자연스럽게: '얘네 캐릭터 손가락이 짧고 전체적으로 두꺼워서 좀 겹치는 느낌'.
      리트리버·오리너구리 앞발은 동그란 벙어리장갑 같아서(폭 약 0.3m) 손잡이 가운데를 쥐면 총 몸통(슬라이드·몸체·총열 덮개)이 앞발 속에 묻혀요.
      → 벙어리장갑 캐릭터처럼 '주먹 위에 총을 올려 든' 모양으로: 쥐는 손은 손잡이 아래쪽을 쥐고(총이 앞발 위로 올라앉음),
        받치는 손은 총열 덮개 아래를 받쳐요(앞발이 덮개를 삼키지 않음). 총이 얼굴 쪽으로 올라가지 않게 쥐는 손 자리를 그만큼 내려요(PAW80.k).
      값(PAW80.t)은 tools/paw_fit.py가 잰 것: [쥐는 손 올림, 받치는 손 내림](총 자기 단위, 크기 곱하기 전).
      새 캐릭터: carryFit에 넣은 뒤 `CHARS=새이름 python3 tools/gt.py tools/paw_fit.py`로 표를 뽑아 여기 한 줄 더하기. 없으면 앞발 크기로 어림(PAW80.auto).
*/
const PAW80={
 t:{
  dog: {pistol:[.16,0],smg:[.2,.22],ar:[.18,.14],burst:[.2,.22],rifle:[.06,.12],sniper:[.2,.18],shotgun:[.16,.14],crossbow:[.1,.1]},
  plat:{pistol:[.16,0],smg:[.2,.22],ar:[.16,.12],burst:[.2,.22],rifle:[.06,.12],sniper:[.2,.16],shotgun:[.16,.12],crossbow:[.1,.1]}
 },
 k:.65,cur:null};
function paw80(actor,id){const v=actor&&actor.dog&&actor.dog.v;if(!v)return null;const t=PAW80.t[v];return t?t[id]||null:null}
{const _ph=placeHeldWeapon;placeHeldWeapon=function(actor,dt){const id=actor&&actor.wid,P0=id&&weaponPose[id],d=P0&&paw80(actor,id);
  if(!d)return _ph.apply(this,arguments);
  const a0=P0[0],a1=P0[1];P0[0]=[a0[0],a0[1]-d[0],a0[2]];if(a1&&d[1])P0[1]=[a1[0],a1[1]-d[1],a1[2]];PAW80.cur={actor,dy:d[0]};
  try{return _ph.apply(this,arguments)}finally{P0[0]=a0;P0[1]=a1;PAW80.cur=null}}}
{const _ce=clearEquipment;clearEquipment=function(actor,bones,model,fit,profile,scale,orientation,target){const c=PAW80.cur;if(c&&c.actor===actor)target.y-=c.dy*scale*PAW80.k;return _ce.apply(this,arguments)}}

/* ② 렉 줄이기(기획자: '폰이 안 좋은 것도 있는데 렉이 걸려서, 최대한 그래픽을 안 건드리는 선에서 쾌적하게'). 보이는 모습은 그대로예요.
   ⓐ 총을 들었을 때 몸 겹침 계산(fit79.js)을 30배쯤 가볍게 했어요(그 파일 80차 주석).
   ⓑ 움직이지 않은 물건은 행렬을 다시 만들지 않아요: 장면의 물건 약 7천 개가 매 장면 위치·회전 행렬을 새로 만들고 부모와 곱했어요(three.js 기본).
      자리·회전·크기·부모가 그대로면 건너뛰어요(바뀌면 예전처럼 다시). */
{const O=THREE.Object3D.prototype;O.updateMatrix=function(){const p=this.position,q=this.quaternion,s=this.scale;let c=this._m80;
  if(c!==undefined){if(c[0]===p.x&&c[1]===p.y&&c[2]===p.z&&c[3]===q._x&&c[4]===q._y&&c[5]===q._z&&c[6]===q._w&&c[7]===s.x&&c[8]===s.y&&c[9]===s.z&&this._m80p===this.parent)return}
  else c=this._m80=new Float64Array(10);
  c[0]=p.x;c[1]=p.y;c[2]=p.z;c[3]=q._x;c[4]=q._y;c[5]=q._z;c[6]=q._w;c[7]=s.x;c[8]=s.y;c[9]=s.z;this._m80p=this.parent;
  this.matrix.compose(p,q,s);this.matrixWorldNeedsUpdate=true}}
/* ⓒ 멀리 있는 구조물은 그리는 동안만 숨겨요: 구조물 1,700여 개가 맵 어디에 있든 매 장면 그림자·화면 두 번씩 '보이나?' 검사를 받았어요.
      땅 조각을 그리는 범위(cullRegions: 가로 ±130·세로 ±140m)보다 넓은 ±143·±153m 밖은 어차피 화면에 안 나와요. 그림이 끝나면(drawFx 앞) 원래대로 돌려놔요. */
const CULL80={hid:[],on:true,x:0,z:0,n:0};
function cull80Undo(){const h=CULL80.hid;for(let i=0;i<h.length;i++)h[i].visible=true;h.length=0}
{const _cr=cullRegions;cullRegions=function(x,z){_cr.apply(this,arguments);cull80Undo();if(!CULL80.on||typeof structs==='undefined')return;const ax=REG*.5+118,az=REG*.5+128,h=CULL80.hid;CULL80.x=x;CULL80.z=z;
  for(let i=0;i<structs.length;i++){const s=structs[i],m=s.m;if(!m||!m.visible)continue;if(Math.abs(s.x-x)>ax||Math.abs(s.z-z)>az){m.visible=false;h.push(m)}}CULL80.n=h.length}}
{const _df=drawFx;drawFx=function(){cull80Undo();return _df.apply(this,arguments)}}
/* ⓓ 화면이 버거우면 3D 그림 해상도만 조금씩 낮춰요(글자·버튼은 그대로): 2초마다 장면 시간을 보고 평균 26ms(약 38fps)보다 느리면 한 단계 낮추고,
      14ms보다 빠른 게 6초 이어지면 한 단계 올려요. 화소 1:1(기기 화소 비율 1)보다는 안 낮춰요 → 컴퓨터·검사 화면은 그대로.
      그래도 느리면 마지막으로 그림자 지도만 2048 → 1024(그림자는 그대로 보여요). 설정의 '그래픽 품질'은 그대로 따라요. */
const AQ80={on:!(navigator&&navigator.webdriver),k:[1,.86,.74,.64,.56,.5],lv:0,sh:0,acc:0,sq:0,n:0,t:0,good:0,last:0};
function aq80Apply(){if(typeof R==='undefined'||!R)return;const base=typeof DPR==='number'?DPR:1,want=Math.max(Math.min(1,base),base*AQ80.k[AQ80.lv]);if(Math.abs(R.getPixelRatio()-want)>.001)R.setPixelRatio(want);
 if(opt.gfx===1&&typeof sun!=='undefined'){const S2=AQ80.sh?1024:2048;if(sun.shadow.mapSize.x!==S2){sun.shadow.mapSize.set(S2,S2);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}sun.shadow.needsUpdate=true}}}
{const _rs=resize;resize=function(){_rs.apply(this,arguments);aq80Apply()}}
{const _tk=tick;tick=function(dt){const now=performance.now(),d=now-(AQ80.last||now);AQ80.last=now;const r=_tk.apply(this,arguments);
  if(AQ80.on&&mode==='play'&&d>0&&d<250){AQ80.acc+=d;AQ80.sq+=d*d;AQ80.n++;AQ80.t+=d;
   if(AQ80.t>2000){const avg=AQ80.acc/AQ80.n,sd=Math.sqrt(Math.max(0,AQ80.sq/AQ80.n-avg*avg)),base=typeof DPR==='number'?DPR:1;AQ80.acc=AQ80.sq=AQ80.n=AQ80.t=0;
    /* 절전 모드처럼 30fps로 묶인 기기(장면 간격이 33ms로 고르게)는 느린 게 아니라서 그대로 둬요 */
    if(avg>26&&!(avg>31&&avg<36&&sd<2.5)){AQ80.good=0;if(AQ80.lv<AQ80.k.length-1&&base*AQ80.k[AQ80.lv]>1.001){AQ80.lv++;aq80Apply()}else if(!AQ80.sh&&opt.gfx===1){AQ80.sh=1;aq80Apply()}}
    else if(avg<14){if(++AQ80.good>=3){AQ80.good=0;if(AQ80.sh){AQ80.sh=0;aq80Apply()}else if(AQ80.lv>0){AQ80.lv--;aq80Apply()}}}else AQ80.good=0}}
  return r}}
