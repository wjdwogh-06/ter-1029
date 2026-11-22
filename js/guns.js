/* 61차(디자인) — 총 7종 + 키트 7종 (기획자 11-22 22:09)
   '원래 있던 총 종류 없애 버리고 7종류 추가, 키트들도 다 이걸로 바꿔야 해: 현대소총 점사소총 반자동소총 기관단총 저격총 쏘오프샷건 반자동권총'
   - 현대 소총(ar)·기관단총(smg) = 연사: 오른쪽 조이스틱으로 조준하는 동안 그쪽으로 계속 쏴요(손을 떼면 멈춤). 떼서 쏘는 한 발은 없어요.
   - 점사 소총(burst) = 조준하는 동안 3발씩 끊어서(탕탕탕… 탕탕탕). 한 번 시작한 3발은 손을 떼도 끝까지 나가요.
   - 반자동 소총(rifle)·저격총(sniper)·소드오프 샷건(shotgun)·반자동 권총(pistol) = 반자동: 조준하고 떼면 한 발(41차 그대로).
   - 기관단총은 한 번에 탄알 2발을 쓰고 피해가 세고 많이 퍼져요. 저격총은 조준하면 화면이 훨씬 멀리 밀리고 조금 멀어져서(넓게) 보여요.
   - 권총을 뺀 모든 총은 조준하거나 쏘는 동안(쏘고 0.4초까지) 이동 속도 50%. 권총은 쏘면서도 안 느려져요. 경량화 신발을 신으면 어떤 무기든 안 느려져요(buffs.js).
   데이터(이름·피해·쏘는 방식 fm·slow·cam…)는 core.js 맨 끝 61차 덩어리(서버도 같은 표). 여기는 움직임·모양만. index.html에서 이 줄을 빼면 쏘는 방식만 예전(모두 떼서 한 발)으로 돌아가요. */
const GUN={bl:0,bx:0,bz:1,shotT:-1e9,cx:0,cz:0,zk:1,hold:0,wid:null};
const gunAuto=w=>!!w&&(w.fm==='auto'||w.fm==='burst');
const gunGear=k=>typeof gearFx==='function'?gearFx(k):0;   /* 신발·모자 효과(buffs.js) */

/* ---------- 쏘기: 연사·점사는 조준하는 동안 계속 ---------- */
{const _u=updPlayer;updPlayer=function(dt){const id=curId(),w=WEAP[id]||{};
 if(GUN.wid!==id){GUN.wid=id;GUN.bl=0}
 if(RJ.q&&!RJ.q.hit&&!RJ.q.nade&&gunAuto(w))RJ.q=null;   /* 연사·점사는 떼서 쏘는 한 발이 없어요(이미 조준하는 동안 쐈으니까) */
 const swim=typeof WTR!=='undefined'&&WTR.st==='swim';
 const hold=RJ.id!==null&&RJ.md==='aim'&&RJ.aim&&gunAuto(w)&&!bmode&&!P.dead&&!busy&&!swim&&mode==='play';
 let forced=0;
 if(hold){inp.fire=true;inp.aiming=true;inp.ax=RJ.ax;inp.az=RJ.az;GUN.bx=RJ.ax;GUN.bz=RJ.az;forced=1}
 else if(GUN.bl>0&&w.fm==='burst'&&!P.dead&&!swim){inp.fire=true;inp.aiming=true;inp.ax=GUN.bx;inp.az=GUN.bz;forced=1}   /* 시작한 3발은 끝까지 */
 GUN.hold=hold;
 try{return _u.apply(this,arguments)}finally{if(forced){inp.fire=false;inp.aiming=false}
  try{rjEl().classList.toggle('full',!!(hold||RJ.full))}catch(e){}}}}
/* 한 번 쏠 때: 기관단총은 탄알 2발 · 점사는 3발마다 쉬기 · 총마다 화면 흔들림 */
{const _a=attack;attack=function(){const id=curId(),w=WEAP[id];
 if(!w||w.melee||w.nade||w.rod||!w.ammo||P.cd>0)return _a.apply(this,arguments);
 const use=w.use||1,n0=invN(w.ammo);
 if(use>1&&n0>0&&n0<use){P.cd=.4;sfx(900,.03,'square',.03);toast(`탄알이 ${use}발 있어야 쏴요`);return}
 const sh0=shake;const r=_a.apply(this,arguments);const fired=invN(w.ammo)<n0;
 if(fired){GUN.shotT=performance.now();if(use>1)take(w.ammo,Math.min(use-1,invN(w.ammo)));if(w.shk!=null)shake=Math.min(.5,sh0+w.shk);
  if(w.fm==='burst'){if(GUN.bl<=0)GUN.bl=w.bn||3;GUN.bl--;if(GUN.bl>0&&invN(w.ammo)>0)P.cd=w.cd;else{GUN.bl=0;P.cd=w.bp||.5}}
  if(id==='sniper')sfx(70,.28,'sine',.07,.4)}   /* 저격총은 묵직한 울림 하나 더 */
 else if(w.fm==='burst')GUN.bl=0;
 return r}}
/* 소리: 새 총도 옛 소리 틀을 빌려요(현대 소총·점사·기관단총 = 가벼운 연사음, 저격총·반자동 소총 = 낮은 소리, 샷건 = 둔한 소리) */
const GUN_SND={ar:'smg',burst:'smg',smg:'smg',sniper:'rifle',rifle:'rifle',shotgun:'shotgun',pistol:'pistol'};
{const _s=shotSfx;shotSfx=function(k){return _s.call(this,GUN_SND[k]||k)}}
/* 안내 글: 연사·점사는 '조준하면 계속 쏴요' */
{const _h=rjHint;rjHint=function(t){const w=WEAP[curId()]||{};if(gunAuto(w)&&/떼면 쏴요/.test(t))t=w.fm==='burst'?'끌어서 조준하면 3발씩 끊어서 쏴요':'끌어서 조준하면 그쪽으로 계속 쏴요';return _h.call(this,t)}}

/* ---------- 이동 속도: 권총 빼고 조준·쏘는 동안 50% (경량화 신발이면 안 느려짐) ----------
   actors.js는 쏘는 장면마다 0.62를 곱해 두니, 원하는 배율 ÷ 이미 곱한 배율만큼 고쳐요 */
function gunMoveK(){if(INT.on||bmode||mode!=='play')return 1;const w=WEAP[curId()]||{},swim=typeof WTR!=='undefined'&&WTR.st==='swim';
 const applied=(inp.fire||P.tapT>0)&&!swim&&!w.rod&&!w.melee?.62:1;let want=applied;
 if(w.ammo&&!w.nade){const aiming=(RJ.id!==null&&RJ.md==='aim'&&RJ.aim)||performance.now()-GUN.shotT<400||GUN.bl>0;want=aiming&&w.slow?w.slow:1}
 if(gunGear('noAimSlow'))want=1;
 return want/applied}
{const _m=moveEnt;moveEnt=function(e,dx,dz,r){if(e===P){const k=gunMoveK();if(k!==1){dx*=k;dz*=k}}return _m.call(this,e,dx,dz,r)}}

/* ---------- 저격총: 조준하면 화면이 훨씬 멀리 밀리고 조금 멀어져서 넓게 보여요(cam 값) ---------- */
{const _uc=updCamera;updCamera=function(dt,px,py,pz,snap){const w=WEAP[curId()]||{};let tx=0,tz=0,tk=1;
 if(w.cam&&RJ.id!==null&&RJ.aim&&RJ.md==='aim'&&!INT.on&&!bmode&&mode==='play'&&!P.dead){const k=clamp((RJ.k-RJ_DZ)/(1-RJ_DZ),0,1),L=4.5*(w.cam-1)*(.45+.55*k);tx=RJ.ax*L;tz=RJ.az*L;tk=1+(w.cam-1)*.2*(.5+.5*k)}
 if(snap||INT.on){GUN.cx=GUN.cz=0;GUN.zk=1}else{const a=1-Math.exp(-(dt||0)*(tx||tz?3:2.2));GUN.cx+=(tx-GUN.cx)*a;GUN.cz+=(tz-GUN.cz)*a;GUN.zk+=(tk-GUN.zk)*a;if(Math.abs(GUN.zk-1)<.001)GUN.zk=1}
 const zk=GUN.zk,t0=typeof ZOOM!=='undefined'?ZOOM.t:null;if(zk!==1){zoomK*=zk;if(t0!=null)ZOOM.t=t0*zk}
 try{return _uc.call(this,dt,px+GUN.cx,py,pz+GUN.cz,snap)}finally{if(zk!==1){zoomK/=zk;if(t0!=null)ZOOM.t=t0}}}}

/* ---------- 모양: 총 7종(총구 +z, 손잡이가 0 근처, 옛 총과 같은 크기) ---------- */
function gnModels(){
 const R=(w,h,d,c,p,r,cr=.025,bv=.014)=>pt(lkRb(w,h,d,cr,bv),c,p,r),C=(r1,r2,len,c,p,n=14)=>pt(cyl(r1,r2,len,n),c,p,[Math.PI/2,0,0]),
  RX=(r1,r2,len,c,p,n=10)=>pt(cyl(r1,r2,len,n),c,p,[0,0,Math.PI/2]),T=(Rr,r,c,p)=>pt(new THREE.TorusGeometry(Rr,r,6,16),c,p,[0,Math.PI/2,0]),
  S=(r,c,p,s)=>pt(new THREE.SphereGeometry(r,12,8),c,p,0,s),D=(r,c,p,n=16)=>pt(cyl(r,r,.012,n),c,p,[Math.PI/2,0,0]);
 const put=(k,p,sm=38)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g};
 const BLK=0x2c2f35,MET=0x4a5059,MET2=0x6b737e,LENS=0x67c7ec,RED=0xff6a4d;
 /* 반자동 권총: 밝은 회색 슬라이드 + 짙은 몸체 + 호두나무 손잡이 판 */
 {const SL=0x8c949e,GRP=0x8b5a39,p=[R(.105,.115,.6,SL,[0,.065,.19],0,.03,.016),R(.09,.06,.5,BLK,[0,-.005,.15]),R(.09,.3,.155,BLK,[0,-.19,-.07],[.22,0,0],.035,.02),
  R(.096,.24,.115,GRP,[0,-.2,-.075],[.22,0,0],.03,.018),T(.06,.012,BLK,[0,-.085,.11]),R(.02,.06,.025,MET,[0,-.075,.085],[-.2,0,0]),
  C(.026,.026,.05,BLK,[0,.065,.5]),R(.022,.03,.03,BLK,[0,.135,.45]),R(.07,.03,.03,BLK,[0,.135,-.07])];
  for(const z of[-.06,-.025,.01])p.push(R(.108,.08,.012,BLK,[0,.06,z],0,.004,.003));put('gn_pistol',p)}
 /* 현대 소총: 짙은 몸체 + 모래색(코요테) 손잡이·탄창·개머리판 + 빨간 점 조준기 */
 {const TAN=0xc6a26a,p=[R(.115,.14,.64,BLK,[0,.085,.16]),R(.1,.1,.42,BLK,[0,-.03,.06]),R(.135,.135,.52,TAN,[0,.075,.72],0,.04,.02),
  ...[.55,.66,.77,.88].map(z=>R(.14,.03,.06,BLK,[0,.075,z],0,.012,.006)),C(.026,.026,.34,MET,[0,.08,1.1]),C(.042,.042,.11,BLK,[0,.08,1.3]),
  R(.06,.026,.78,BLK,[0,.168,.38],0,.01,.006),R(.08,.09,.13,BLK,[0,.23,.12]),D(.032,RED,[0,.235,.054]),D(.032,0x9fe0ff,[0,.235,.186]),
  R(.08,.22,.13,TAN,[0,-.16,.27],[-.08,0,0],.03,.016),R(.078,.18,.128,TAN,[0,-.31,.29],[-.2,0,0],.03,.016),R(.076,.13,.126,TAN,[0,-.43,.325],[-.32,0,0],.03,.016),R(.084,.03,.135,BLK,[0,-.5,.35],[-.32,0,0],.012,.008),R(.082,.24,.1,BLK,[0,-.17,-.13],[.3,0,0],.03,.018),T(.065,.012,BLK,[0,-.08,.06]),
  C(.042,.042,.36,BLK,[0,.06,-.3]),R(.105,.2,.32,TAN,[0,.0,-.62],0,.04,.02),R(.112,.22,.045,BLK,[0,.0,-.79]),R(.03,.03,.08,MET2,[.065,.13,-.05])];put('gn_ar',p)}
 /* 점사 소총: 국방색 둥근 몸통(탄창이 손잡이 뒤) + 위 손잡이 + 옆에 주황 점 셋(3발) */
 {const OL=0x6e7c4c,OLD=0x56623a,ORG=0xf2a03a,p=[R(.145,.26,1.05,OL,[0,0,.05],0,.08,.04),R(.15,.05,.5,OLD,[0,-.02,.33],0,.02,.012),
  R(.052,.06,.52,BLK,[0,.215,.08],0,.025,.015),R(.05,.085,.06,BLK,[0,.155,-.13]),R(.05,.085,.06,BLK,[0,.155,.29]),D(.024,LENS,[0,.215,-.18]),
  C(.03,.03,.45,BLK,[0,.03,.8]),C(.046,.04,.1,BLK,[0,.03,1.06]),R(.082,.24,.1,OLD,[0,-.22,.24],[.25,0,0],.03,.018),T(.065,.012,BLK,[0,-.15,.32]),
  R(.08,.22,.12,BLK,[0,-.2,-.12],[.1,0,0]),R(.155,.27,.045,BLK,[0,0,-.49])];
  for(const z of[.0,.06,.12])p.push(S(.018,ORG,[.074,.06,z],[.5,1,1]),S(.018,ORG,[-.074,.06,z],[.5,1,1]));put('gn_burst',p)}
 /* 반자동 소총: 따뜻한 나무 개머리판·덮개 + 쇠 몸체·총열 + 쇠 띠 둘 */
 {const WD=0xc98a50,WDD=0xa96c3c,p=[R(.105,.21,.46,WD,[0,-.035,-.56],[-.08,0,0],.045,.022),R(.09,.13,.26,WD,[0,.0,-.23],[-.15,0,0],.04,.02),
  R(.105,.105,.76,WD,[0,.04,.46],0,.04,.02),R(.105,.105,.36,MET,[0,.09,.02]),C(.028,.028,.76,MET,[0,.1,.92]),R(.075,.05,.42,WDD,[0,.112,.46],0,.02,.012),
  R(.022,.05,.03,BLK,[0,.15,1.24]),R(.07,.12,.14,MET,[0,-.06,.12]),T(.062,.012,BLK,[0,-.06,-.04]),R(.11,.22,.035,WDD,[0,-.05,-.78]),
  R(.114,.114,.035,MET2,[0,.05,.32],0,.02,.01),R(.114,.114,.035,MET2,[0,.05,.74],0,.02,.01),S(.025,MET2,[.065,.1,-.04])];put('gn_rifle',p)}
 /* 기관단총: 짙은 회색 몸체 + 주황 손잡이·앞손잡이·줄 + 긴 곧은 탄창 + 접는 철사 개머리 */
 {const GR=0x41464e,GRD=0x2d3036,ORG=0xe57d2e,p=[R(.12,.16,.62,GR,[0,.06,.15],0,.05,.025),R(.123,.026,.42,ORG,[0,.1,.16],0,.01,.006),
  C(.052,.052,.26,GRD,[0,.07,.58]),...[.5,.58,.66].map(z=>R(.106,.03,.03,0x1d1f23,[0,.07,z],0,.01,.006)),C(.025,.025,.16,BLK,[0,.07,.77]),
  R(.07,.38,.1,GRD,[0,-.24,.24],[.05,0,0],.025,.015),R(.082,.22,.1,ORG,[0,-.16,-.09],[.25,0,0],.03,.018),T(.06,.012,BLK,[0,-.07,.04]),
  R(.06,.16,.07,ORG,[0,-.11,.47],0,.025,.015),C(.012,.012,.42,MET,[0,.1,-.36],8),C(.012,.012,.42,MET,[0,-.01,-.36],8),R(.04,.16,.045,GRD,[0,.045,-.58]),
  R(.04,.04,.24,BLK,[0,.155,.15],0,.012,.008)];put('gn_smg',p)}
 /* 저격총: 짙은 초록 개머리·덮개 + 긴 총열 + 큰 조준경(파란 렌즈) + 접은 양각대 */
 {const GN=0x4b5a4d,p=[R(.105,.25,.5,GN,[0,-.04,-.63],0,.045,.022),R(.085,.065,.26,GN,[0,.105,-.56],0,.03,.016),R(.112,.27,.045,BLK,[0,-.04,-.9]),R(.09,.15,.3,GN,[0,.02,-.3],[-.12,0,0],.035,.018),
  R(.082,.21,.095,GN,[0,-.15,-.22],[.2,0,0],.03,.018),T(.062,.012,BLK,[0,-.07,-.06]),R(.1,.11,.52,MET,[0,.07,.05]),R(.11,.1,.62,GN,[0,.03,.56],0,.035,.018),
  C(.03,.026,1.08,BLK,[0,.08,1.12]),R(.075,.065,.13,BLK,[0,.08,1.68],0,.02,.012),
  C(.046,.046,.62,BLK,[0,.25,.1]),C(.078,.05,.14,BLK,[0,.25,.47]),C(.05,.066,.1,BLK,[0,.25,-.26]),D(.066,LENS,[0,.25,.545]),D(.05,LENS,[0,.25,-.315]),
  pt(cyl(.03,.03,.06,10),BLK,[0,.31,.1]),RX(.028,.028,.06,BLK,[.06,.25,.1]),R(.04,.09,.05,BLK,[0,.165,-.05]),R(.04,.09,.05,BLK,[0,.165,.27]),
  C(.012,.012,.36,MET2,[.032,-.035,.62],8),C(.012,.012,.36,MET2,[-.032,-.035,.62],8),S(.03,MET2,[.075,.08,-.06])];put('gn_sniper',p)}
 /* 소드오프 샷건: 짧게 자른 붉은 나무 손잡이 + 나란한 짧은 총열 둘 + 놋쇠 경첩·가늠쇠 */
 {const WR=0x9a5534,WRD=0x7c4026,BR=0xd2a24a,p=[R(.1,.25,.2,WR,[0,-.14,-.24],[.38,0,0],.045,.022),S(.06,WRD,[0,-.27,-.32],[.85,.7,1.1]),R(.11,.13,.24,MET,[0,.02,.0],0,.035,.018),
  RX(.022,.022,.118,BR,[0,-.025,.11]),C(.043,.043,.62,MET,[.043,.06,.42]),C(.043,.043,.62,MET,[-.043,.06,.42]),D(.03,0x1b1d21,[.043,.06,.735]),D(.03,0x1b1d21,[-.043,.06,.735]),
  R(.03,.02,.6,MET2,[0,.104,.42],0,.008,.005),S(.012,BR,[0,.12,.71]),R(.1,.07,.3,WR,[0,-.01,.3],0,.03,.016),T(.06,.012,BLK,[0,-.08,-.03]),
  R(.02,.05,.022,MET2,[.02,-.07,-.01],[-.2,0,0]),R(.02,.05,.022,MET2,[-.02,-.07,-.05],[-.2,0,0]),R(.025,.05,.04,MET2,[.03,.105,-.09],[.5,0,0]),R(.025,.05,.04,MET2,[-.03,.105,-.09],[.5,0,0])];put('gn_shotgun',p)}
 /* ---------- 키트 7종: 35차와 같은 크라프트 상자 + 총마다 색 테이프 + 앞 라벨에 그 총의 실루엣(새 3D 모양을 납작하게) ---------- */
 const KR=0xcf9a5c,KRD=0xb47f45,LB=0xf7f0e3,SIL=0x3a2c26,TAPE={pistol:0x3f8fd6,rifle:0x4fa150,ar:0xf28c38,burst:0x2fb3a8,smg:0x8b5cc9,sniper:0x3b4f86,shotgun:0xe0533f};
 const RB=(w,h,d,c,p,cr=.04,bv=.022)=>pt(lkRb(w,h,d,cr,bv),c,p);
 for(const k in TAPE){const W=.9,H=.62,D2=.62,tc=TAPE[k],p=[];
  p.push(RB(W,H,D2,KR,[0,H/2,0],.06,.035),RB(W-.04,.022,.012,KRD,[0,H-.004,0],.006,.004));
  p.push(RB(.16,.012,D2+.012,tc,[0,H+.002,0],.005,.004),RB(.16,.16,.012,tc,[0,H-.07,D2/2+.004],.005,.004),RB(.16,.12,.012,tc,[0,H-.05,-D2/2-.004],.005,.004));
  for(const s of[1,-1])p.push(RB(.014,.07,.2,KRD,[s*(W/2+.002),H*.68,0],.03,.006));
  p.push(RB(.74,.36,.016,LB,[0,H*.43,D2/2+.006],.04,.006),pt(new THREE.CylinderGeometry(.04,.04,.014,16),tc,[.3,H*.43+.12,D2/2+.016],[Math.PI/2,0,0]));
  {let s=GEO['gn_'+k].clone();s.rotateY(Math.PI/2);s.computeBoundingBox();const b=s.boundingBox,w=b.max.x-b.min.x,h=b.max.y-b.min.y,dz=b.max.z-b.min.z,sc=Math.min(.6/w,.27/h);
   s.translate(-(b.min.x+b.max.x)/2,-(b.min.y+b.max.y)/2,-(b.min.z+b.max.z)/2);p.push(pt(s,SIL,[-.03,H*.43-.012,D2/2+.016],0,[sc,sc,.014/dz]))}
  p.push(RB(W+.004,.03,D2+.004,KRD,[0,.015,0],.012,.008));GEO['lk_gkit_'+k]=mg(p)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{gnModels()}catch(e){console.error('guns: 61차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
