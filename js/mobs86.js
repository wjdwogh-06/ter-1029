'use strict';
/* ===== 86차(규칙, 기획자 11-27 17:04): 몹 다시 — 옛 몹은 모두 없애고(설원 사냥꾼만 남김) 새 몹 7종 =====
   기획자: '기존 몹 전부 완전 삭제(사냥꾼 제외), 새로 추가'
   - 흰뇌조(겨울 흰 뇌조) 8마리 — 동북섬. 가장 작고 빨라요. 사람이 다가오면 파닥이며 도망쳐요.
   - 큰뇌조 5마리 — 식물 상점이 있는 가을 섬(바람섬). 놀라면 꼬리를 부채처럼 펴 보이고 도망쳐요.
   - 공작새 — 지도 가운데 기준 맨 아래 섬(거북섬) 3마리, 맨 위 섬(갈매기섬) 2마리. 가끔 꼬리 깃을 활짝 펴요.
   - 독두꺼비 3마리 · 파수꾼 2마리 — 초승달 본섬(설치 금지 구역·항구 둘레·처음 마을 둘레는 빼고 무작위).
       독두꺼비: 체력 많은 편, 생각보다 빨라요(뛰어오르며 따라옴), 혀로 원거리 공격(맞으면 느려지고 4초 동안 1초에 5% 독),
                 쓰러지면 부풀어 오르다가 자폭해서 둘레에 피해.
       파수꾼: 바위 + 나무 덩굴로 된 숲의 수호자. 체력 아주 많고 느려요. 내려찍기 · 땅 구르기 · 땅에서 덩굴 솟기.
   - 거대 동굴게(보스) — 동굴 안에서만. 체력 아주 많고 집게 피해가 아주 커요(혼자서는 거의 못 잡게).
       평소엔 방과 갱도를 천천히 돌아다니고, 플레이어를 보거나 맞으면 빠르게 다가와 집게질.
       처음 들어온 입구 둘레(광차 기지 방 둘 + 입구 갱도)에는 오지 않아요. 방 사이 갱도는 다녀요(격자 길 찾기).
       5초마다 체력 2% 회복, 체력이 줄수록 분노 게이지가 차서 빨라져요, 둘레에 광물·바위가 있으면 집게로 들어 던져요.
       쓰러지면 실제 시간 30분 뒤 다시 나타나요(S.m86.crab, 저장됨).
   - 미니 동굴게 9마리 — 동굴 안을 돌아다니고 때리지 않아요. 가까이 가면 옆걸음으로 빠르게 도망쳐요.
   숫자(체력·피해·빠르기·다시 생기는 시간)와 전리품은 모두 임시 — 아래 ENEMY 정의와 M86 숫자만 고치면 돼요.
   몹은 각자 화면에서 따로 움직여요(멀티 서버는 몹을 몰라요, 서버 마무리 때). */

/* ---------- ① 옛 몹 없애기 ---------- */
const M86_GONE=['bandit','gunner','rgolem','wgolem','wraith','plant','brute','sentry','polarBear','ptarmigan'];
for(const k of M86_GONE)delete ENEMY[k];
if(typeof snowSlots!=='undefined')snowSlots.splice(0,snowSlots.length,...snowSlots.filter(s=>s.kind==='snowHunter'));   /* 동북섬 설원 사냥꾼만 남겨요 */
updRaid=function(){};   /* 밤 습격 없음 */
if(typeof si73Tick==='function')si73Tick=function(){};   /* 특수 보급섬 경계병 없음 */

/* ---------- ② 숫자(임시) ---------- */
const M86={world:null,slots:[],pj:[],fx:[],t:0,spawnT:0,
 /* 바깥 무리: 섬 이름, 수, 다시 생기기(초, 놀이 시간) */
 out:[{k:'m86_ptar',isl:['동북섬','동북섬 동쪽'],n:8,re:[90,150]},{k:'m86_caper',isl:['바람섬','바람섬 남쪽'],n:5,re:[110,170]},
  {k:'m86_peac',isl:['거북섬'],n:3,re:[120,180]},{k:'m86_peac',isl:['갈매기섬'],n:2,re:[120,180]},
  {k:'m86_toad',isl:['초승달 본섬'],n:3,re:[240,360],main:1},{k:'m86_guard',isl:['초승달 본섬'],n:2,re:[360,480],main:1}],
 poison:{dps:5,T:4,slow:.35},             /* 독두꺼비 혀: 1초에 에너지 5(=5%) × 4초, 그동안 느려짐 35% */
 crab:{re:30*60*1000,heal:.02,healT:5,mini:9,r:.8},
 cave:{on:false,nav:null,boss:null,bossHp:null,mini:[]},
 ic:{}};
/* 몹 정의. m86 = 움직이는 방식, by = 머리 위 체력 줄 높이, hw = 총알 맞는 폭(반), hr = 근접 무기 추가 사거리, r = 몸 반지름 */
Object.assign(ENEMY,{
 m86_ptar:{n:'흰뇌조',hp:14,sp:7.6,dmg:0,root:1,m86:'bird',sp2:'ptar',r:.34,by:1.25,hw:.7,fr:7.5,loot:[['meat',1,1],['coin',30,1]],actor:()=>new M86Bird('ptar')},
 m86_caper:{n:'큰뇌조',hp:34,sp:6.5,dmg:0,root:1,m86:'bird',sp2:'caper',r:.46,by:1.75,hw:.8,fr:9.5,loot:[['meat',2,1],['coin',60,1]],actor:()=>new M86Bird('caper')},
 m86_peac:{n:'공작새',hp:36,sp:6.0,dmg:0,root:1,m86:'bird',sp2:'peac',r:.48,by:2.1,hw:.82,fr:8.5,loot:[['meat',2,1],['coin',80,1]],actor:()=>new M86Bird('peac')},
 m86_toad:{n:'독두꺼비',hp:320,sp:4.8,dmg:0,root:1,m86:'toad',r:.75,by:1.75,hw:1.05,hr:.6,boom:{r:4.6,dmg:30},loot:[['meat',2,.7],['coin',220,1]],actor:()=>new M86Toad()},
 m86_guard:{n:'파수꾼',hp:1100,sp:2.1,dmg:32,root:1,big:1,m86:'guard',r:1.25,by:4.9,hw:1.5,hr:1.15,loot:[['wood',12,1],['stone',12,1],['coin',600,1]],actor:()=>new M86Guard()},
 m86_minic:{n:'미니 동굴게',hp:12,sp:6.8,dmg:0,root:1,m86:'mini',r:.34,by:.9,hw:.66,fr:7,cave:1,loot:[['meat',1,1],['coin',25,1]],actor:()=>new M86Crab(1)},
 m86_crab:{n:'거대 동굴게',hp:8000,sp:1.7,dmg:46,root:1,big:1,m86:'boss',r:.8,by:3.8,hw:2.0,hr:2.0,cave:1,nobar:1,
  loot:[['coin',3000,1],['ore_gold',4,1],['ore_silver',5,1],['ore_ti',3,1],['gem_sapphire',1,.5],['gem_ruby',1,.5],['gem_diamond',1,.2]],actor:()=>new M86Crab(0)}});
{const H=ENEMY.snowHunter;if(H){delete ENEMY.snowHunter;ENEMY.snowHunter=H}}   /* 사냥 도감 순서: 새 몹 다음에 설원 사냥꾼 */
const M86_HAB={m86_ptar:'동북섬',m86_caper:'바람섬',m86_peac:'거북섬 · 갈매기섬',m86_toad:'초승달 본섬',m86_guard:'초승달 본섬 숲',m86_minic:'동굴',m86_crab:'동굴 깊은 곳',snowHunter:'동북섬'};
if(typeof HUNT_IC!=='undefined')Object.assign(HUNT_IC,{m86_ptar:'🐦',m86_caper:'🐦',m86_peac:'🦚',m86_toad:'🐸',m86_guard:'🗿',m86_minic:'🦀',m86_crab:'🦀',snowHunter:'🎯'});
/* 독: 버프 목록(buffs.js)에 넣어서 알약·느려짐·쓰러지면 사라지기가 그대로 돼요 */
if(typeof BUFDEF!=='undefined'){BUFDEF.poi86={n:'독',ic:'☠',sp:-M86.poison.slow,T:M86.poison.T,c:'#5f9e2f'};BUFDEF.root86={n:'덩굴 묶임',ic:'🌿',sp:-.45,T:1.4,c:'#6e8f3a'}}

/* ---------- ③ 모양 도우미 ---------- */
const M86G={},M86SC={ptar:1.85,caper:1.45,peac:1.35,toad:1.6,guard:1.25,crab:1.3,mini:1.4};   /* 크기 배율: 게임 카메라에서 잘 보이게 */
const m86E=(c,p,s,r,d=2)=>pt(ico(1,d),c,p,r||[0,0,0],s);                                     /* 타원체 */
const m86R=(c,p,s,r)=>pt(ico(1,1),c,p,r||[0,0,0],s);                                          /* 각진 바위 */
function m86T(a,b,r1,r2,c,n=8){const q=lkAim(a,b);return pt(cyl(r2,r1,q.L,n),c,q.pos,q.rot)}    /* a→b 가는 관(굵기 r1→r2) */
function m86K(p,dir,r,h,c,n=6){const e=[p[0]+dir[0]*h,p[1]+dir[1]*h,p[2]+dir[2]*h],q=lkAim(p,e);return pt(cone(r,h,n),c,q.pos,q.rot)}   /* p에서 dir 쪽으로 뾰족 */
function m86Fin(parts,sm=60,ao=.4){const g=mg(parts);if(sm)lkSmooth(g,sm);if(ao&&typeof lkAO==='function')try{lkAO(g,ao,1)}catch(e){}return g}
const m86GlowMat=c=>new THREE.MeshBasicMaterial({color:c,vertexColors:true});
const M86C0=new THREE.Color(0x6fe9ff),M86C1=new THREE.Color(0xff5a2e);
const m86V=new THREE.Vector3(),m86V2=new THREE.Vector3(),m86Q=new THREE.Quaternion(),m86Z=new THREE.Vector3(0,0,-1);

/* 뼈대 없는 '마디' 인형: 마디마다 메시 하나(모양은 종류마다 한 번 만들어 같이 써요) */
class M86Rig{
 constructor(type){this.type=type;this.root=new THREE.Group();scene.add(this.root);this.cur='Idle';this.age=0;this.lock=0;this.ph=Math.random()*6;this.g=Math.random()*6;
  this.spd=0;this.air=0;this.hitK=0;this.dk=0;this.dead=0;this.mixer={update:dt=>this.tick(dt)}}
 part(par,key,pos,build,mat){const k=this.type+':'+key;if(!M86G[k])M86G[k]=build();const m=mesh(M86G[k],mat||MATT);m.position.set(pos[0],pos[1],pos[2]);par.add(m);return m}
 grp(par,pos){const g=new THREE.Group();g.position.set(pos[0],pos[1],pos[2]);par.add(g);return g}
 weapon(){}helmet(){}
 play(n,o={}){if(n==='Hit_A'){this.hitK=1;return}if(n==='Death_A'){this.dead=1;return}if(this.lock>0&&!o.force)return;if(this.cur!==n||o.force)this.age=0;this.cur=n;this.lock=o.lock||0}
 set(x,z,r){this.root.position.set(x,groundY(x,z)+this.air,z);this.root.rotation.y=r}
 tick(dt){this.age+=dt;this.lock=Math.max(0,this.lock-dt);this.ph+=dt;this.hitK=Math.max(0,this.hitK-dt*5);if(this.dead)this.dk=Math.min(1,this.dk+dt*2.2);this.pose(dt)}
 pose(){}
 dispose(){scene.remove(this.root)}
}

/* ---------- ④ 새 셋(흰뇌조 · 큰뇌조 · 공작새) ---------- */
class M86Bird extends M86Rig{
 constructor(sp){super('b_'+sp);this.sp=sp;this.flap=0;this.disp=0;this.dispT=0;this.peck=0;this.peckT=rand(1,3);this.look=0;
  const E=m86E,T=m86T,K=m86K,R=this.root;
  if(sp==='ptar'){   /* 흰뇌조: 길이 약 0.42m. 하얀 겨울깃, 까만 꼬리·눈선, 빨간 눈썹, 털 덮인 발 */
   const W=0xf7f6f0,W2=0xe4e6e8,BK=0x26272b,RD=0xe0402f;this.K=10;this.bob=.018;this.by=.16;
   this.body=this.grp(R,[0,.16,0]);
   this.part(this.body,'body',[0,0,0],()=>m86Fin([E(W,[0,0,0],[.13,.118,.175]),E(W,[0,.002,.085],[.112,.105,.1]),E(W,[0,.03,-.08],[.115,.092,.11]),E(W2,[0,-.07,.01],[.1,.05,.12])]));
   this.head=this.grp(this.body,[0,.085,.11]);
   this.part(this.head,'head',[0,0,0],()=>m86Fin([E(W,[0,.035,.02],[.074,.072,.08]),E(W,[0,-.005,.0],[.06,.05,.06]),K([0,.026,.085],[0,-.15,1],.019,.045,BK),
    ...[-1,1].flatMap(s=>[E(BK,[s*.052,.046,.05],[.014,.014,.014]),E(BK,[s*.04,.04,.075],[.007,.008,.028],[0,-s*.3,0]),E(RD,[s*.042,.068,.046],[.019,.007,.022],[0,0,s*.3])])]));
   this.tail=this.grp(this.body,[0,.035,-.16]);
   this.part(this.tail,'tail',[0,0,0],()=>m86Fin([E(W,[0,.018,-.02],[.075,.035,.07]),...[-2,-1,0,1,2].map(i=>E(i*i===4?W2:BK,[i*.026,-.004,-.06],[.026,.011,.075],[0,i*.18,0]))]));
   this.wings=[-1,1].map(s=>{const g=this.grp(this.body,[s*.105,.035,.03]);this.part(g,'w'+s,[0,0,0],()=>m86Fin([E(W,[s*.022,-.02,-.045],[.032,.072,.13],[.1,0,0]),E(W2,[s*.025,-.045,-.13],[.026,.032,.06])]));return g});
   this.legs=[-1,1].map(s=>{const g=this.grp(R,[s*.045,.1,.01]);this.part(g,'l'+s,[0,0,0],()=>m86Fin([E(W,[0,-.045,0],[.034,.058,.038]),E(W2,[0,-.088,.022],[.04,.016,.05]),...[-1,0,1].map(i=>E(0x8a8580,[i*.016,-.098,.066],[.006,.005,.014]))]));return g});
  }else if(sp==='caper'){   /* 큰뇌조(수컷): 길이 약 0.9m. 짙은 잿빛 몸, 청록 가슴, 밤색 날개, 빨간 눈썹, 상아색 부리, 흰 점 꼬리 */
   const G=0x353940,G2=0x2a2d33,GR=0x1d5c54,BR=0x6e4d33,BR2=0x4a3626,IV=0xece0b8,RD=0xe0372b,WH=0xf2efe6;this.K=5.2;this.bob=.03;this.by=.34;
   this.body=this.grp(R,[0,.34,0]);
   this.part(this.body,'body',[0,0,0],()=>m86Fin([E(G,[0,.03,0],[.22,.205,.32]),E(GR,[0,.03,.2],[.17,.165,.13]),E(G2,[0,-.08,.03],[.18,.12,.25]),E(G,[0,.06,-.19],[.17,.15,.17]),
    ...[-1,1].flatMap(s=>[E(WH,[s*.195,.08,.12],[.035,.03,.035]),...[0,1,2].map(i=>E(WH,[s*(.1+i*.03),-.15,-.04-i*.07],[.02,.012,.025]))])]));
   this.head=this.grp(this.body,[0,.15,.22]);
   this.part(this.head,'head',[0,0,0],()=>m86Fin([T([0,0,0],[0,.2,.07],.09,.07,G2,10),E(G2,[0,.24,.1],[.088,.082,.1]),K([0,.225,.18],[0,-.28,1],.028,.08,IV),
    ...[-1,1].flatMap(s=>[E(RD,[s*.056,.272,.11],[.03,.02,.042]),E(0x111111,[s*.064,.25,.13],[.015,.015,.015])]),...[-1,0,1].map(i=>K([i*.02,.19,.14],[i*.15,-1,.35],.012,.07,0x1a1b1e,5))]));
   this.tail=this.grp(this.body,[0,.08,-.29]);
   this.part(this.tail,'tail',[0,0,0],()=>{const p=[];for(let i=0;i<11;i++){const a=(i/10-.5)*1.9,dx=Math.sin(a),dz=-Math.cos(a);p.push(E(0x25282e,[dx*.2,0,dz*.2],[.048,.012,.22],[0,a,0]),E(WH,[dx*.33,.01,dz*.33],[.022,.008,.028],[0,a,0]))}p.push(E(G,[0,.01,-.04],[.12,.05,.09]));return m86Fin(p)});
   this.wings=[-1,1].map(s=>{const g=this.grp(this.body,[s*.2,.07,.03]);this.part(g,'w'+s,[0,0,0],()=>m86Fin([E(BR,[s*.03,-.02,-.05],[.05,.13,.24],[.08,0,0]),E(BR2,[s*.035,-.06,-.25],[.04,.06,.1]),...[0,1,2].map(i=>E(0x8a6646,[s*.06,-.01-i*.04,-.02-i*.05],[.012,.014,.06]))]));return g});
   this.legs=[-1,1].map(s=>{const g=this.grp(R,[s*.09,.3,0]);this.part(g,'l'+s,[0,0,0],()=>m86Fin([E(G2,[0,-.06,0],[.062,.09,.07]),E(0x8f8a80,[0,-.19,.005],[.036,.09,.04]),...[-1,0,1].map(i=>T([0,-.285,0],[i*.05,-.295,.085],.012,.008,0x77706a,5)),T([0,-.285,0],[0,-.295,-.05],.01,.007,0x77706a,5)]));return g});
  }else{   /* 공작새: 몸 약 1m + 끌리는 꼬리 깃 1.3m. 파란 목·몸, 초록 등, 눈무늬 깃(펼치면 부채) */
   const BL=0x1d5fd0,BL2=0x1a4fae,GN=0x2f7f62,CR=0xcaa46f,RU=0xb2652c,GY=0x9b9183,WH=0xf4f4ee;this.K=4.2;this.bob=.03;this.by=.5;
   this.body=this.grp(R,[0,.5,0]);
   this.part(this.body,'body',[0,0,0],()=>m86Fin([E(BL,[0,.02,.07],[.165,.19,.25]),E(GN,[0,.07,-.1],[.165,.155,.24]),E(BL2,[0,-.08,.02],[.14,.12,.2]),
    ...[0,1,2,3,4].map(i=>E(0x3f9a6e,[(i%2?.06:-.06),.15,-.04-i*.05],[.05,.02,.05]))]));
   this.head=this.grp(this.body,[0,.14,.2]);
   this.part(this.head,'head',[0,0,0],()=>{const p=[T([0,0,0],[0,.32,.08],.07,.045,BL,10),E(BL,[0,.36,.11],[.056,.056,.07]),K([0,.35,.17],[0,-.2,1],.016,.055,GY),
     ...[-1,1].flatMap(s=>[E(WH,[s*.047,.372,.12],[.012,.012,.034]),E(WH,[s*.046,.345,.12],[.01,.01,.03]),E(0x111111,[s*.052,.36,.13],[.012,.012,.012])])];
     for(let i=0;i<7;i++){const a=(i/6-.5)*.9,b=[Math.sin(a)*.1,.53,.02-Math.cos(a)*.02];p.push(m86T([0,.4,.1],b,.006,.004,0x3d7f6a,4),E(0x2f9e86,b,[.018,.022,.012]))}return m86Fin(p)});
   this.wings=[-1,1].map(s=>{const g=this.grp(this.body,[s*.15,.06,.02]);this.part(g,'w'+s,[0,0,0],()=>m86Fin([E(CR,[s*.025,-.03,-.05],[.05,.13,.22],[.08,0,0]),E(RU,[s*.03,-.07,-.24],[.04,.06,.1]),...[0,1,2,3].map(i=>E(0x7a5634,[s*.06,-.0-i*.03,-.0-i*.05],[.008,.012,.05]))]));return g});
   this.legs=[-1,1].map(s=>{const g=this.grp(R,[s*.08,.46,0]);this.part(g,'l'+s,[0,0,0],()=>m86Fin([E(0x2f6f5a,[0,-.04,0],[.055,.08,.06]),T([0,-.09,0],[0,-.43,.01],.02,.016,GY,6),...[-1,0,1].map(i=>T([0,-.44,.01],[i*.045,-.455,.09],.011,.007,0x8a8072,5)),T([0,-.44,.01],[0,-.455,-.05],.009,.006,0x8a8072,5)]));return g});
   /* 꼬리 깃: 바큇살 17개. 쉴 땐 뒤로 끌리고, 펼치면 반원 부채 */
   this.tail=this.grp(this.body,[0,.05,-.27]);this.spokes=[];
   const N=17,feather=L=>()=>{const p=[m86T([0,0,0],[0,0,-L],.008,.004,0x6b6a4a,4)];for(let k=0;k<5;k++){const z=-L*(.18+k*.17);p.push(E(0x3f7d3a,[0,0,z],[.045+k*.008,.006,.09]))}
     for(const f of[.55,1]){const z=-L*f;p.push(E(0xd2a63a,[0,.004,z],[.075,.007,.09]),E(0x2e8a4a,[0,.008,z+.004],[.058,.007,.07]),E(0x1d4fb5,[0,.012,z+.008],[.036,.007,.046]),E(0x0e1a4a,[0,.016,z+.01],[.018,.007,.024]))}return m86Fin(p,70,0)};
   for(let i=0;i<N;i++){const u=i/(N-1)*2-1,L=1.32-.35*u*u,qr=new THREE.Quaternion().setFromUnitVectors(m86Z,m86V.set(u*.24,-.4,-1).normalize()),th=u*1.38,
     qf=new THREE.Quaternion().setFromUnitVectors(m86Z,m86V.set(Math.sin(th),Math.cos(th),-.62).normalize());   /* 위에서 내려다보는 카메라라 부채를 조금 뒤로 눕혀요 */
    const m=this.part(this.tail,'sp'+Math.round(L*20),[0,0,0],feather(Math.round(L*20)/20));m.quaternion.copy(qr);this.spokes.push({m,qr,qf,u})}
  }
  this.root.scale.setScalar(M86SC[sp]);
 }
 pose(dt){const s=this.spd,wk=clamp(s/1.1,0,1),run=clamp((s-1.5)/3,0,1),hit=this.hitK,dk=this.dk,ph=this.ph;
  this.g+=dt*(s*this.K+(s>.05?0:0));const w=Math.sin(this.g);
  /* 발: 걸음 · 날 때는 접어요 */
  const fold=clamp(this.air*4,0,1);this.legs.forEach((L,i)=>{L.rotation.x=Math.sin(this.g+(i?Math.PI:0))*.8*wk*(1-fold)+fold*.9});
  /* 몸: 걸을 때 위아래, 뛸 때 앞으로 숙임, 숨쉬기 */
  this.body.position.y=this.by+Math.abs(Math.cos(this.g))*this.bob*wk+.004*Math.sin(ph*2.2);this.body.rotation.set(.18*run+.15*hit-.12*this.disp,0,.05*w*wk+.25*hit);
  /* 머리: 걸을 때 비둘기처럼 앞뒤, 쉴 땐 가끔 쪼기, 두리번 */
  if(s<.15&&!this.disp){this.peckT-=dt;if(this.peckT<=0){this.peck=1;this.peckT=rand(1.6,4.5);this.look=rand(-.6,.6)}}this.peck=Math.max(0,this.peck-dt*1.8);
  const pk=Math.sin(Math.PI*this.peck)*(this.peck>0?1:0);
  this.head.rotation.set((this.sp==='peac'?.55:.9)*pk+Math.sin(this.g*2)*.12*wk-.35*this.disp*(this.sp==='caper'?1:.3),this.look*(1-wk)*(1-pk)*.8+.2*Math.sin(ph*.7)*(1-wk),0);
  /* 날개: 파닥임(flap 0~1) */
  const fl=this.flap;this.wings.forEach((g,i)=>{const sd=i?1:-1;g.rotation.set(0,0,sd*(fl*(.6+.85*Math.sin(ph*38))+.12*run+(this.sp==='caper'?.35*this.disp:0)))});
  /* 꼬리 */
  this.disp+=((this.dispT>0?1:0)-this.disp)*Math.min(1,dt*(this.sp==='peac'?2.4:5));this.dispT=Math.max(0,this.dispT-dt);
  if(this.sp==='peac'){this.tail.rotation.x=.12*this.disp;const qv=this.disp,qu=.03*qv*Math.sin(ph*31);for(const o of this.spokes){o.m.quaternion.copy(o.qr).slerp(o.qf,qv);if(qv>.9)o.m.rotateZ(qu*(o.u+.3))}}
  else this.tail.rotation.set(this.sp==='caper'?-.22+1.5*this.disp:-.12-.2*run,0,0);
  /* 쓰러짐: 옆으로 눕기 */
  if(dk){this.root.rotation.z=1.45*dk;this.body.position.y=this.by*(1-.3*dk)}
 }
}

/* ---------- ⑤ 독두꺼비 ---------- */
class M86Toad extends M86Rig{
 constructor(){super('toad');const E=m86E,R=this.root;this.hop=0;this.hopT=0;this.chg=0;this.tng=0;this.swell=0;
  const GN=0x3d6a2c,GN2=0x355f27,BE=0xd9cf86,OR=0xf08a28,YE=0xf5c843,DK=0x24401c,GD=0xf2c22f;
  this.gm=new THREE.MeshBasicMaterial({color:0x9cf04a});
  this.body=this.grp(R,[0,.34,0]);
  this.part(this.body,'body',[0,0,0],()=>{const p=[E(GN,[0,0,-.12],[.5,.3,.46]),E(GN,[0,.05,.27],[.42,.22,.31]),E(GN2,[0,.15,-.14],[.36,.17,.33]),E(BE,[0,-.13,.08],[.44,.16,.48]),
    E(0x26401c,[0,-.005,.4],[.405,.026,.22]),E(0x2f5523,[0,.02,.4],[.36,.02,.18])];
   for(let i=0;i<36;i++){const a=hash(i,3,861)*6.28,b=.12+hash(i,5,861)*1.0,x=Math.cos(a)*Math.sin(b)*.45,y=Math.cos(b)*.27+.03,z=Math.sin(a)*Math.sin(b)*.42-.13,r=.025+hash(i,7,861)*.03;
    p.push(E(i%3===0?OR:i%3===1?YE:0x86b24a,[x,y,z],[r,r*.75,r]))}
   for(let i=0;i<7;i++){const a=i*.9+.3;p.push(E(DK,[Math.cos(a)*.3,.17,Math.sin(a)*.3-.14],[.08,.03,.07],[0,a,0]))}return m86Fin(p,55,.35)});
  this.head=this.grp(this.body,[0,.06,.16]);
  this.part(this.head,'eyes',[0,0,0],()=>m86Fin([...[-1,1].flatMap(s=>[E(GN,[s*.2,.12,.14],[.13,.11,.13]),E(GD,[s*.215,.17,.19],[.094,.094,.094]),E(0x101010,[s*.225,.19,.278],[.058,.02,.016]),E(GN2,[s*.21,.235,.15],[.11,.04,.1]),E(0xfff6c8,[s*.19,.215,.265],[.016,.013,.008])])],55,0));
  this.glands=this.part(this.head,'gl',[0,0,0],()=>mg([...[-1,1].map(s=>E(0xffffff,[s*.26,.14,-.06],[.095,.07,.15],[0,s*.25,0])),...[-1,1].flatMap(s=>[0,1,2].map(i=>E(0xd8ff9a,[s*(.2+i*.045),.12+i*.03,-.22-i*.06],[.04,.03,.04])))]),this.gm);
  this.jaw=this.grp(this.body,[0,-.04,.28]);this.part(this.jaw,'jaw',[0,0,0],()=>m86Fin([E(BE,[0,-.03,.12],[.33,.05,.15]),E(0x6a2a35,[0,.0,.13],[.27,.02,.11])],55,0));
  this.sac=this.part(this.body,'sac',[0,-.12,.42],()=>m86Fin([E(0xe8dc95,[0,0,0],[.19,.13,.15])],60,0));
  this.legs=[];
  for(const s of[-1,1]){const f=this.grp(this.body,[s*.3,-.06,.32]);this.part(f,'fl'+s,[0,0,0],()=>m86Fin([E(GN,[s*.04,-.11,.03],[.075,.15,.075]),E(GN,[s*.07,-.26,.08],[.085,.03,.095]),...[-1,0,1].map(i=>E(0x4d7d36,[s*.07+i*.045,-.27,.16],[.025,.018,.035]))]));
   const h=this.grp(this.body,[s*.36,-.06,-.2]);this.part(h,'hl'+s,[0,0,0],()=>m86Fin([E(0x3a6629,[s*.06,-.02,-.02],[.17,.15,.25]),E(OR,[s*.13,.08,-.06],[.03,.022,.03]),E(YE,[s*.1,.1,.06],[.025,.018,.025]),E(GN,[s*.16,-.15,.1],[.075,.07,.2]),E(0x89a85a,[s*.18,-.29,.22],[.11,.022,.19]),...[-1,0,1].map(i=>E(0x6f9448,[s*.18+i*.05,-.295,.39],[.025,.015,.04]))]));
   this.legs.push({f,h,s})}
  /* 혀: 줄(길이 1을 늘려 써요) + 끝 덩어리 */
  this.tq=this.part(R,'tq',[0,.34,.62],()=>{const g=cyl(.045,.05,1,8);g.rotateX(Math.PI/2);g.translate(0,0,.5);return pt(g,0xe05d7d)});this.tq.visible=false;
  this.tt=this.part(R,'tt',[0,.34,.62],()=>m86Fin([E(0xf07a95,[0,0,0],[.1,.08,.11])],60,0));this.tt.visible=false;
  this.root.scale.setScalar(M86SC.toad);
 }
 pose(dt){const ph=this.ph,hp=this.hop,hk=this.hitK,dk=this.dk;
  /* 뛰기: hop 0~1 (몸이 앞으로 휘며 뒷다리가 쭉 펴짐) */
  const arc=Math.sin(Math.PI*hp);this.body.rotation.set(-.14-.3*arc+.12*hk,0,.1*hk);
  this.body.position.y=.34+.015*Math.sin(ph*2.6)*(1-arc);
  for(const L of this.legs){L.h.rotation.set(1.05*arc-.1,0,0);L.f.rotation.set(-.8*arc,0,0)}
  /* 목 주머니: 숨쉬기 + 혀 쏘기 전 부풀기 */
  const sw=1+.12*Math.max(0,Math.sin(ph*2.6))+.9*this.chg;this.sac.scale.set(sw,sw*.9,sw);
  this.jaw.rotation.x=.55*Math.min(1,this.tng*3)+.12*this.chg;this.head.rotation.x=-.25*Math.min(1,this.tng*3)-.1*this.chg;
  this.gm.color.setRGB(.45+.55*this.chg+.25*Math.sin(ph*3),.85+.15*this.chg,.25);
  /* 죽음: 부풀었다가(swell) 자폭 */
  if(this.dead){const s=1+.4*this.swell;this.body.scale.set(s,s*1.05,s);const fl=Math.sin(ph*40)>0&&this.swell>.3;this.gm.color.setRGB(fl?1:.6,1,fl?.8:.3)}
 }
}

/* ---------- ⑥ 파수꾼(바위 + 나무 덩굴, 숲의 수호자) ---------- */
class M86Guard extends M86Rig{
 constructor(){super('guard');const E=m86E,Rk=m86R,T=m86T,R=this.root;this.at=0;this.atk=null;this.stp=0;
  const RK=0x868a80,RK2=0x767a72,RK3=0x8f9387,MS=0x5c8c36,MS2=0x6fa043,WD=0x6e4b2c,WD2=0x7d5733,VN=0x4b8a34,LF=0x5aa83c;
  this.gm=new THREE.MeshBasicMaterial({color:0xa6ff5c});
  const vine=(a,b,n=3,c=VN)=>{const p=[];for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,o=(i%2?.05:-.05);p.push(T([lerp(a[0],b[0],t0)+o,lerp(a[1],b[1],t0),lerp(a[2],b[2],t0)+o],[lerp(a[0],b[0],t1)-o,lerp(a[1],b[1],t1),lerp(a[2],b[2],t1)-o],.04,.035,c,5))}return p};
  const leaf=(p,s=1,c=LF)=>E(c,p,[.07*s,.02*s,.05*s],[hash(p[0]*9|0,p[2]*9|0,3)*3,hash(p[0]*7|0,p[1]*7|0,4)*3,0],1);
  this.hips=this.grp(R,[0,1.02,0]);
  this.part(this.hips,'hip',[0,0,0],()=>m86Fin([Rk(RK2,[0,0,0],[.55,.38,.42],[0,.3,0]),...vine([-.5,.1,.3],[.5,.05,.32],4),...vine([-.45,-.05,-.3],[.45,.0,-.32],4)],0,.35));
  this.torso=this.grp(this.hips,[0,.28,0]);
  this.part(this.torso,'tor',[0,0,0],()=>{const p=[Rk(RK,[0,.62,0],[.88,.72,.62],[.1,.2,0]),Rk(RK2,[.38,.95,-.1],[.45,.38,.4],[.3,.5,.2]),Rk(RK3,[-.42,.85,.15],[.4,.36,.36],[.2,.9,.1]),Rk(RK2,[0,.25,.05],[.6,.35,.45],[0,.6,0]),
    E(MS,[0,1.18,-.05],[.72,.18,.5]),E(MS2,[.45,1.22,-.1],[.32,.12,.28]),E(MS,[-.5,1.08,.1],[.3,.12,.26]),E(MS2,[0,.4,.42],[.3,.1,.15]),
    ...vine([-.85,1.1,.2],[.2,.3,.6],5),...vine([.85,1.0,.1],[-.1,.15,.6],5),...vine([.6,1.2,-.4],[.7,.2,-.55],4),
    /* 등에서 자라는 어린 나무 */
    T([-.25,1.1,-.25],[-.38,1.95,-.42],.1,.055,WD,7),T([-.32,1.6,-.35],[-.6,1.85,-.3],.04,.025,WD,5),E(0x4f9a3a,[-.4,2.05,-.44],[.38,.3,.36],0,1),E(LF,[-.18,1.9,-.36],[.26,.21,.25],0,1),E(0x3f8a30,[-.62,1.9,-.32],[.22,.18,.22],0,1)];
   for(let i=0;i<14;i++)p.push(leaf([lerp(-.8,.8,hash(i,1,77)),.3+hash(i,2,77)*.9,.45+hash(i,3,77)*.12]));
   for(let i=0;i<7;i++)p.push(E(i%2?0xf4a6c8:0xfff2d8,[lerp(-.6,.6,hash(i,4,78)),1.24,lerp(-.3,.3,hash(i,5,78))],[.035,.03,.035]));return m86Fin(p,0,.4)});
  this.core=this.part(this.torso,'core',[0,.7,.56],()=>mg([E(0xffffff,[0,0,0],[.11,.2,.05]),E(0xffffff,[.06,-.18,-.01],[.04,.1,.03],[0,0,.5]),E(0xffffff,[-.05,.17,-.01],[.04,.09,.03],[0,0,-.4])]),this.gm);
  this.head=this.grp(this.torso,[0,1.36,.3]);
  this.part(this.head,'head',[0,0,0],()=>m86Fin([Rk(0x8c9086,[0,.18,0],[.37,.32,.34]),Rk(0x7a7e75,[0,.32,.19],[.36,.1,.14]),Rk(0x80847a,[0,.02,.14],[.27,.12,.2]),E(0x2a2d2a,[-.13,.2,.27],[.1,.075,.06]),E(0x2a2d2a,[.13,.2,.27],[.1,.075,.06]),
    T([.18,.42,-.05],[.42,.75,-.15],.05,.03,WD,6),T([.33,.62,-.11],[.5,.68,.02],.025,.015,WD,5),T([-.18,.42,-.05],[-.4,.72,-.2],.05,.03,WD,6),T([-.3,.6,-.15],[-.48,.62,-.02],.025,.015,WD,5),
    leaf([.45,.76,-.15],1.2),leaf([-.42,.74,-.2],1.2),leaf([.52,.69,.02]),...vine([-.2,-.02,.22],[-.22,-.42,.26],3,0x4f8f36),...vine([.18,-.02,.22],[.2,-.38,.24],3,0x4f8f36),...vine([0,-.04,.25],[0,-.5,.28],3,0x568f3a),E(MS,[0,.4,-.02],[.24,.07,.2])],0,.4));
  for(const s of[-1,1]){const m=new THREE.Mesh(CRG.eye||new THREE.SphereGeometry(1,8,6),this.gm);m.scale.setScalar(.068);m.position.set(s*.13,.2,.315);this.head.add(m)}
  this.arms=[-1,1].map(s=>{const sh=this.grp(this.torso,[s*.95,.85,0]);
   this.part(sh,'ua'+s,[0,0,0],()=>m86Fin([Rk(0x7f837a,[s*.1,.08,0],[.42,.38,.4],[.2,s,.1]),E(MS,[s*.1,.33,-.02],[.32,.1,.28]),T([0,0,0],[s*.15,-.75,.12],.16,.13,WD,7),T([s*.06,0,.05],[s*.2,-.72,.06],.09,.07,WD2,6),T([-s*.05,0,-.04],[s*.1,-.74,.18],.08,.06,WD,6),...vine([s*.15,-.05,.15],[s*.12,-.7,.0],4),leaf([s*.2,-.35,.18])],0,.35));
   const fa=this.grp(sh,[s*.15,-.75,.12]);
   this.part(fa,'fa'+s,[0,0,0],()=>m86Fin([T([0,0,0],[s*.05,-.5,.08],.14,.15,WD,7),T([s*.05,0,-.04],[s*.1,-.5,.02],.08,.08,WD2,6),Rk(0x80847b,[s*.08,-.72,.12],[.38,.34,.38],[.3,s*.5,.2]),Rk(0x6f7369,[s*.14,-.62,.3],[.16,.13,.15]),
    ...vine([s*-.25,-.55,.1],[s*.3,-.8,.25],4),...vine([s*.3,-.5,-.1],[s*-.2,-.85,.05],4)],0,.35));
   return{sh,fa,s}});
  this.root.scale.setScalar(M86SC.guard);
  this.legs=[-1,1].map(s=>{const g=this.grp(R,[s*.42,1.0,0]);this.part(g,'lg'+s,[0,0,0],()=>{const p=[T([0,0,0],[0,-.55,0],.26,.3,0x6a4a2e,8),Rk(0x80847b,[0,-.5,.14],[.25,.22,.2]),T([0,-.55,0],[0,-.92,.02],.3,.36,0x5e4229,8),E(MS,[0,-.12,.18],[.14,.08,.08])];
    for(let i=0;i<5;i++){const a=(i/4-.5)*2.4+(s>0?0:0),dx=Math.sin(a)*.6,dz=Math.cos(a)*.6;p.push(T([dx*.3,-.82,dz*.3],[dx,-1.0,dz],.09,.03,0x5a3d24,5))}return m86Fin(p,0,.35)});return g});
 }
 pose(dt){const s=this.spd,wk=clamp(s/1.2,0,1),ph=this.ph,hk=this.hitK,dk=this.dk;this.g+=dt*s*1.9;const w=Math.sin(this.g);
  /* 걷기: 무겁게 흔들리며, 발 디딜 때 쿵 */
  this.legs.forEach((L,i)=>{L.rotation.x=Math.sin(this.g+(i?Math.PI:0))*.38*wk});
  this.hips.position.y=1.02-.06*Math.abs(Math.cos(this.g))*wk-.25*dk;this.hips.rotation.set(0,.1*w*wk,.06*w*wk);
  this.torso.rotation.set(.05+.08*wk+.1*hk,-.12*w*wk,-.04*w*wk);this.torso.scale.y=1+.015*Math.sin(ph*1.6);
  this.head.rotation.set(.1*Math.sin(ph*.6),.3*Math.sin(ph*.37)*(1-wk),0);
  /* 팔: 걸을 때 반대로 흔들기 · 공격(atk) */
  const a=this.atk,t=this.at;let L0=-.25*w*wk,R0=.25*w*wk,lz=0,tq=0;
  if(a==='slam'){const up=t<.85?sm(0,.85,t):1-sm(.85,1.0,t);R0=-2.7*up+.4*(t>.85?1:0);tq=-.25*up+.35*(t>.85&&t<1.4?1:0);lz=0}
  else if(a==='stomp'){const up=t<1.1?sm(0,1.1,t):1-sm(1.1,1.25,t);L0=R0=-2.5*up+.3*(t>1.1?1:0);tq=-.35*up+.4*(t>1.1&&t<1.6?1:0)}
  else if(a==='vine'){const up=sm(0,.5,t)*(1-sm(1.1,1.5,t));R0=-1.0*up;lz=0;tq=.15*up}
  this.arms[0].sh.rotation.set(L0,0,-.12+lz);this.arms[1].sh.rotation.set(R0,0,.12);this.arms.forEach(A=>A.fa.rotation.set(-.25-.1*wk,0,0));this.torso.rotation.x+=tq;
  const glow=a?.7+.3*Math.sin(ph*14):.45+.12*Math.sin(ph*2.2);this.gm.color.setRGB(.55*glow+.25,glow,.3*glow);
  if(dk){this.torso.rotation.x=.25+.7*dk;this.root.rotation.z=.25*dk}
 }
}

/* ---------- ⑦ 동굴게(거대 동굴게 · 미니 동굴게) ---------- */
class M86Crab extends M86Rig{
 constructor(mini){super(mini?'mcrab':'crab');this.mini=mini;this.side=0;this.snap=[0,0];this.lift=0;this.atkT=0;this.atkSide=1;this.rage=0;
  const E=m86E,Rk=m86R,T=m86T,K=m86K,R=this.root;
  if(mini){   /* 미니 동굴게: 폭 약 0.5m, 산호빛 껍데기 */
   const SH=0xe7743a,SH2=0xc9592a,UN=0xf4d7b4;this.by=.15;
   this.body=this.grp(R,[0,.15,0]);
   this.part(this.body,'b',[0,0,0],()=>m86Fin([E(SH,[0,.02,0],[.22,.085,.17]),E(SH2,[0,.06,-.02],[.16,.05,.12]),E(UN,[0,-.035,.01],[.19,.04,.14]),...[-1,1].flatMap(s=>[T([s*.06,.05,.14],[s*.08,.13,.16],.012,.01,SH,5),E(0x151515,[s*.08,.14,.165],[.022,.022,.022]),K([s*.2,.03,.04],[s,.1,.2],.025,.06,SH2,5)])]));
   this.claws=[-1,1].map(s=>{const g=this.grp(this.body,[s*.15,0,.13]);this.part(g,'c'+s,[0,0,0],()=>m86Fin([E(SH,[s*.04,0,.05],[.04,.035,.07]),E(0xf08a4a,[s*.06,.0,.13],[.05,.04,.06]),K([s*.06,.01,.18],[0,.1,1],.02,.06,0xf6b08a,5),K([s*.06,-.015,.17],[0,-.2,1],.018,.05,0xf6b08a,5)]));return g});
   this.legs=[];for(const s of[-1,1])for(let i=0;i<3;i++){const g=this.grp(this.body,[s*.17,-.01,.06-i*.08]);this.part(g,'l'+s+i,[0,0,0],()=>m86Fin([T([0,0,0],[s*.13,.06,0],.022,.018,SH,5),T([s*.13,.06,0],[s*.21,-.15,0],.018,.008,SH2,5)]));g.rotation.y=-s*(.35-i*.35);this.legs.push({g,s,i,y0:g.rotation.y})}
   this.root.scale.setScalar(M86SC.mini);
  }else{   /* 거대 동굴게: 다리까지 폭 약 4.7m. 짙은 보랏빛 푸른 껍데기, 따개비·바위, 등에 빛나는 수정, 큰 집게 둘(오른쪽이 더 큼) */
   const SH=0x434a78,SH2=0x384068,SH3=0x5b6496,UN=0xc9b49a,OR=0xd9643a,TE=0xf1e9d6;this.by=.86;
   this.cm=new THREE.MeshBasicMaterial({color:0x6fe9ff,vertexColors:true});this.em=new THREE.MeshBasicMaterial({color:0xffb22e});
   this.body=this.grp(R,[0,.86,0]);
   this.part(this.body,'b',[0,0,0],()=>{const p=[E(SH,[0,.12,0],[1.3,.5,1.05]),E(SH2,[0,.32,-.05],[1.05,.3,.85]),E(UN,[0,-.13,.05],[1.15,.28,.9]),E(0x2c3155,[0,-.02,1.0],[.38,.2,.12]),
     ...[-1,1].map(s=>E(SH3,[s*.55,.2,.6],[.45,.18,.3],[0,s*.3,0]))];
    for(let i=0;i<7;i++){const a=(i/6-.5)*1.6;p.push(K([Math.sin(a)*1.15,.18,Math.cos(a)*.88],[Math.sin(a),.25,Math.cos(a)],.09,.28,i%2?SH3:0x6c78a8,5))}
    for(const s of[-1,1])for(let i=0;i<3;i++){const z=.25-i*.4;p.push(K([s*1.25,.12,z],[s,.15,0],.1,.32,SH3,5))}
    for(let i=0;i<11;i++){const x=lerp(-.85,.85,hash(i,1,861)),z=lerp(-.75,.45,hash(i,2,861)),y=.35+.22*(1-(x*x+z*z)*.6);p.push(T([x,y,z],[x,y+.12,z],.08,.06,TE,7),E(0x3a3a40,[x,y+.12,z],[.04,.015,.04]))}
    for(let i=0;i<5;i++){const x=lerp(-.9,.9,hash(i,3,862)),z=lerp(-.8,.3,hash(i,4,862));p.push(Rk(0x7a7c84,[x,.45,z],[.2,.15,.18],[i,i*2,0]))}
    return m86Fin(p,58,.35)});
   this.crys=this.part(this.body,'cr',[0,0,0],()=>{const p=[];[[-.4,.55,-.25],[.35,.6,-.4],[.05,.62,.05],[.6,.48,.15],[-.65,.45,.1]].forEach(([x,y,z],k)=>{for(let i=0;i<4;i++){const a=hash(k,i,7)*6.28,tl=.12+hash(k,i,8)*.3,h=.3+hash(k,i,9)*.45;
      const c=new THREE.Color(k%2?0xc9e6ff:0xeadcff);p.push(pt(cyl(.035,.075,h,6),c.getHex(),[x+Math.cos(a)*.06,y+h/2,z+Math.sin(a)*.06],[Math.cos(a)*tl,0,Math.sin(a)*tl]))}});return mg(p)},this.cm);
   this.eyes=[-1,1].map(s=>{const g=this.grp(this.body,[s*.28,.32,.85]);this.part(g,'st'+s,[0,0,0],()=>m86Fin([T([0,0,0],[s*.08,.45,.1],.075,.05,SH,8),E(SH2,[s*.08,.45,.1],[.075,.06,.075])]));
    const m=new THREE.Mesh(new THREE.SphereGeometry(.1,12,10),this.em);m.position.set(s*.085,.52,.13);g.add(m);return g});
   this.claws=[-1,1].map(s=>{const big=s>0?1.35:1.08,sh=this.grp(this.body,[s*.9,-.02,.78]);
    this.part(sh,'arm'+s,[0,0,0],()=>m86Fin([m86T([0,0,0],[s*.3,.2,.4],.21,.18,SH,9),E(0x4a5180,[s*.32,.2,.44],[.2,.19,.2]),K([s*.16,.16,.2],[0,1,.1],.05,.18,SH3,5),K([s*.3,.36,.42],[s*.3,1,.2],.045,.14,SH3,5)]));
    const hd=this.grp(sh,[s*.34,.2,.46]);
    this.part(hd,'hand'+s,[0,0,0],()=>{const b=big,p=[E(0x4c5384,[0,.02*b,.3*b],[.25*b,.33*b,.42*b]),E(0x5a62a0,[s*.1*b,.08*b,.3*b],[.16*b,.22*b,.34*b]),E(SH2,[0,.24*b,.28*b],[.15*b,.1*b,.3*b]),
      m86T([0,-.12*b,.6*b],[0,-.16*b,.86*b],.14*b,.1*b,SH,9),m86T([0,-.16*b,.86*b],[0,-.18*b,1.04*b],.1*b,.025*b,OR,7),E(OR,[0,-.16*b,.86*b],[.105*b,.1*b,.105*b])];
     for(let i=0;i<4;i++)p.push(K([0,-.06*b,(.62+i*.1)*b],[0,1,.2],.028*b,.07*b,TE,5));for(let i=0;i<5;i++)p.push(E(0x6c78a8,[s*.2*b,(-.12+i*.07)*b,(.12+i*.07)*b],[.035*b,.03*b,.035*b]));return m86Fin(p,58,.3)});
    const fg=this.grp(hd,[0,.15*big,.58*big]);
    this.part(fg,'fing'+s,[0,0,0],()=>{const b=big,p=[m86T([0,0,0],[0,-.1*b,.26*b],.13*b,.09*b,SH,9),m86T([0,-.1*b,.26*b],[0,-.32*b,.46*b],.09*b,.022*b,OR,7),E(OR,[0,-.1*b,.26*b],[.095*b,.09*b,.095*b])];
     for(let i=0;i<3;i++)p.push(K([0,(-.08-i*.06)*b,(.1+i*.11)*b],[0,-1,.15],.026*b,.065*b,TE,5));return m86Fin(p,58,.3)});
    return{sh,hd,fg,s,big}});
   this.legs=[];const ZB=[.48,.14,-.2,-.52],FW=[.66,.22,-.22,-.66];
   for(const s of[-1,1])ZB.forEach((zb,i)=>{const g=this.grp(this.body,[s*(1.0-.1*Math.abs(zb)),-.1,zb]);g.rotation.order='YZX';
    this.part(g,'u'+s,[0,0,0],()=>m86Fin([m86T([0,0,0],[s*.7,.42,0],.18,.15,SH,9),E(SH2,[s*.7,.42,0],[.16,.15,.16]),K([s*.36,.3,0],[0,1,0],.05,.15,SH3,5),E(SH3,[s*.3,.28,0],[.13,.06,.13])]));
    const kn=this.grp(g,[s*.7,.42,0]);this.part(kn,'d'+s,[0,0,0],()=>m86Fin([m86T([0,0,0],[s*.48,-.6,0],.15,.12,SH,9),E(OR,[s*.48,-.6,0],[.12,.1,.12]),m86T([s*.48,-.6,0],[s*.74,-1.1,0],.11,.028,0x2a2f4e,7),K([s*.24,-.28,0],[s*.6,.8,0],.035,.1,SH3,5)]));
    this.legs.push({g,kn,s,i,y0:-s*FW[i]})});
   this.root.scale.setScalar(M86SC.crab);
   /* 들어 던지는 바위 */
   this.rock=this.part(this.claws[1].hd,'rk',[0,.42,.62],()=>m86Fin([m86R(0x8a8c94,[0,0,0],[.42,.36,.4]),m86R(0x6f727a,[.18,.12,.1],[.2,.16,.18])],0,.3));this.rock.visible=false;
  }
 }
 setRage(r){if(this.mini||Math.abs(r-this.rage)<.004&&this.rs0)return;this.rs0=1;this.rage=r;this.cm.color.copy(M86C0).lerp(M86C1,r);this.em.color.setRGB(1,.7-.5*r,.18-.1*r)}
 pose(dt){const s=this.spd,wk=clamp(s/(this.mini?1:1.2),0,1),ph=this.ph,hk=this.hitK,dk=this.dk;this.g+=dt*s*(this.mini?13:2.6);
  if(this.mini){for(const L of this.legs){const p=this.g+(L.i%2?Math.PI:0)+(L.s>0?Math.PI:0);L.g.rotation.set(0,L.y0-L.s*Math.cos(p)*.35*wk,L.s*Math.max(0,Math.sin(p))*.4*wk)}
   this.body.position.y=.15+.012*Math.abs(Math.sin(this.g))*wk;this.body.rotation.set(.1*hk,0,.04*Math.sin(this.g)*wk);
   this.claws.forEach((c,i)=>c.rotation.set(-.35*Math.max(0,Math.sin(ph*1.3+i))*(1-wk)-.4*this.lift,0,0));if(dk){this.body.rotation.z=Math.PI*dk;this.body.position.y=.15+.08*dk}return}
  /* 다리: 네 쌍이 번갈아(엇갈린 세 다리 걸음) */
  for(const L of this.legs){const p=this.g+((L.i+(L.s>0?1:0))%2?Math.PI:0),up=Math.max(0,Math.sin(p))*wk,sw=-L.s*Math.cos(p)*.22*wk;
   L.g.rotation.set(0,L.y0+sw,L.s*(.05+.32*up)-L.s*.12*dk);L.kn.rotation.set(0,0,-L.s*(.18*up-.35*dk))}
  const bob=.05*Math.abs(Math.sin(this.g))*wk;this.body.position.y=.86+bob-.4*dk+.03*Math.sin(ph*1.8);
  this.body.rotation.set(.05*hk-.06*this.lift,0,.05*Math.sin(this.g)*wk+.06*hk);
  this.eyes.forEach((g,i)=>g.rotation.set(-.25+.15*Math.sin(ph*.9+i*1.7),.2*Math.sin(ph*.6+i),0));
  /* 집게: 쉴 땐 천천히 오므렸다 폈다, 공격(atkT 0→1: 0~.45 벌리고 들기 · .45 탁 · 그 뒤 돌아옴), 바위 들기(lift) */
  this.claws.forEach((c,i)=>{const me=(c.s>0?1:-1)===this.atkSide,t=me?this.atkT:0,op=t<.45?sm(0,.45,t):1-sm(.45,.55,t),thr=t>.45?Math.exp(-(t-.45)*9):0;
   let rx=-.15-.55*op+.65*thr+.1*Math.sin(ph*.8+i),ry=c.s*(.15*op-.35*thr),fo=-.08-.75*op+.1*Math.sin(ph*1.1+i*2)*(1-op);
   if(c.s>0&&this.lift>0){rx=-1.7*this.lift+(this.lift>1?2.2*(this.lift-1):0);fo=-.05}
   c.sh.rotation.set(rx,ry,0);c.hd.rotation.set(.2*op,-c.s*(.75-.55*op-.6*thr-(c.s>0?.55*Math.min(1,this.lift):0)),0);c.fg.rotation.set(fo,0,0)});
 }
}

/* ---------- ⑧ 놓기·움직이기 도우미 ---------- */
const m86Isl=names=>ISL.filter(I=>names.includes(I.n));
function m86Land(e,x,z){if(hAt(x,z)<.72||onDock(x,z))return false;const I=islAt(x,z);if(!I||!e.isl.includes(I))return false;if(inSafe(x,z))return false;
 if(e.main)for(const q of PORT_SAFE)if(dist(x,z,q[0],q[1])<q[2]+6)return false;return true}
function m86SpawnOk(isls,main,x,z,r){if(hAt(x,z)<.95||onDock(x,z)||inSafe(x,z))return false;const I=islAt(x,z);if(!I||!isls.includes(I))return false;
 for(const n of NOB)if(dist(x,z,n.x,n.z)<n.r+3)return false;
 if(main){for(const q of PORT_SAFE)if(dist(x,z,q[0],q[1])<q[2]+26)return false;if(dist(x,z,VIL.px,VIL.pz)<70)return false;for(const s of SUPS)if(dist(x,z,s.x,s.z)<18)return false}
 if(blocked(x,z,r+.35,0)!==null)return false;for(const e of enemies)if(!e.dead&&dist(x,z,e.x,e.z)<(main?40:9))return false;return true}
/* 무작위 자리: 섬 땅 칸 목록에서 뽑고, 막혔으면 다른 곳(최대 400번). 숲 수호자는 나무가 많은 곳, 두꺼비는 물가·강가를 조금 더 좋아해요 */
function m86Spot(sl){const T=ENEMY[sl.k],cells=sl.cells;if(!cells||!cells.length)return null;let best=null,bs=-1e9;
 for(let k=0,got=0;k<400&&got<(sl.main?14:1);k++){const c=cells[(Math.random()*cells.length)|0],x=c[0]+rand(-2,2),z=c[1]+rand(-2,2);if(!m86SpawnOk(sl.isls,sl.main,x,z,T.r))continue;
  const far=dist(x,z,P.x,P.z);if(mode==='play'&&far<(sl.first?14:32)&&k<300)continue;got++;let sc=Math.random()*2;
  if(sl.k==='m86_guard'){let n=0;for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const o=objs.get((((z/CELL)|0)+j)*CN+((x/CELL)|0)+i);if(o&&o.t<3&&o.re<=0)n++}sc+=n*.35}
  if(sl.k==='m86_toad')sc+=(typeof riverD==='function'?clamp(1-riverD(x,z)/40,0,1)*3:0);
  if(sc>bs){bs=sc;best=[x,z]}}return best}
function m86Step(e,ang,sp,dt){const step=sp*dt;if(step<=0)return false;
 for(const off of[0,.45,-.45,.95,-.95,1.5,-1.5,2.2,-2.2]){const a=ang+off*e.side,dx=Math.sin(a),dz=Math.cos(a),x=e.x+dx*step,z=e.z+dz*step;
  if(e.cave){const lx=x-INT.x-MINE.ox,lz=z-INT.z-MINE.oz;if(!mineOpen(lx,lz,e.r)||(e.boss&&m86Forb(lx,lz)))continue}
  else if(!m86Land(e,x,z)||blocked(x,z,Math.min(e.r,.8),0)!==null||!canStep(e,x,z,dx,dz))continue;   /* 큰 몹도 나무 사이는 0.8m 몸으로 지나가요(숲에 갇히지 않게) */
  e.x=x;e.z=z;e.mvA=a;return true}e.side=-e.side;return false}
function m86Sep(e){for(const o of enemies){if(o===e||o.dead||!o.m86)continue;const d=dist(e.x,e.z,o.x,o.z),R=(e.r||.4)+(o.r||.4);if(d>0&&d<R){const k=(R-d)*.5,px=(e.x-o.x)/d*k,pz=(e.z-o.z)/d*k,x=e.x+px,z=e.z+pz;
  if(e.cave?mineOpen(x-INT.x-MINE.ox,z-INT.z-MINE.oz,e.r):m86Land(e,x,z)&&blocked(x,z,e.r,0)===null){e.x=x;e.z=z}}}}
const m86Face=(e,ang,k,dt)=>{e.rot=turn(e.rot,ang,dt*k)};
const m86Near=dp=>dp<38;   /* 소리는 가까울 때만 */
/* 바깥 사나운 몹(독두꺼비·파수꾼): R0 안에서 알아채고, R1 안이면 계속 쫓고, 맞았으면 8초 동안은 멀어도 쫓아요. 안전 구역·건물 안·쓰러짐이면 그만. 집(처음 자리)에서 L 넘게 멀어지면 돌아가요 */
function m86Agg(e,dt,dp,R0,R1,L){e.hurtT=(e.hurtT||0)-dt;const can=!P.dead&&!INT.on&&!inSafe(P.x,P.z)&&dist(e.x,e.z,e.ax,e.az)<L;
 e.agg=can&&((dp<R0&&!DEV.on)||(e.agg&&(dp<R1||e.hurtT>0)))?1:0}

/* 독(두꺼비 혀) */
function m86Poison(){if(P.dead||DEV.on)return;const was=bufHas('poi86');bufAdd('poi86');if(!was){P.poi86=0;toast('☠ 독두꺼비 혀에 맞았어요 — 4초 동안 독, 느려져요')}
 ftext(P.x,groundY(P.x,P.z)+2.6,P.z,'☠ 독','#a6ff5c');sfx(320,.18,'sawtooth',.05,.4);buzz(40)}
function m86PoisonTick(dt){if(typeof bufHas!=='function'||!bufHas('poi86')||P.dead){P.poi86=0;return}P.poi86=(P.poi86||0)+dt;
 if(Math.random()<dt*7)puff(P.x+rand(-.3,.3),groundY(P.x,P.z)+rand(.6,1.6),P.z+rand(-.3,.3),0x8fe04a,1,.35);
 while(P.poi86>=1){P.poi86-=1;if(DEV.on)break;S.hp-=M86.poison.dps;P.lastHurt=0;hudDirty=true;ftext(P.x,groundY(P.x,P.z)+2.9,P.z,'-'+M86.poison.dps,'#9be35a');if(typeof hurtFx==='function')hurtFx();if(S.hp<=0){die();break}}}

/* 땅 위 표시(경고 고리·덩굴 솟기·폭발) */
const M86FXG={};
function m86Ring(x,z,r,col,life,y){const g=M86FXG.ring||(M86FXG.ring=new THREE.RingGeometry(.86,1,40));const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.0,depthWrite:false,side:THREE.DoubleSide}));
 m.rotation.x=-Math.PI/2;m.position.set(x,(y!=null?y:groundY(x,z))+.06,z);m.scale.setScalar(r);m.renderOrder=3;scene.add(m);
 const d=new THREE.Mesh(M86FXG.disc||(M86FXG.disc=new THREE.CircleGeometry(1,40)),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false}));d.rotation.x=-Math.PI/2;d.position.copy(m.position);d.position.y-=.01;d.scale.setScalar(.01);scene.add(d);
 const f={m,d,t:0,life,r,upd(f,dt){const k=f.t/f.life;f.m.material.opacity=.35+.45*Math.abs(Math.sin(f.t*9));f.d.scale.setScalar(Math.max(.01,f.r*k));f.d.material.opacity=.22+.2*k},
  end(f){scene.remove(f.m);scene.remove(f.d);f.m.material.dispose();f.d.material.dispose()}};M86.fx.push(f);return f}
function m86Burst(x,y,z,r,col){const m=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,depthWrite:false}));m.position.set(x,y,z);scene.add(m);
 M86.fx.push({m,t:0,life:.6,r,upd(f,dt){const k=f.t/f.life;f.m.scale.setScalar(f.r*(.25+.85*Math.sqrt(k)));f.m.material.opacity=.75*(1-k)},end(f){scene.remove(f.m);f.m.geometry.dispose();f.m.material.dispose()}})}
function m86Vines(x,z,y){const g=M86FXG.vine||(M86FXG.vine=m86Fin([...[0,1,2,3,4,5].map(i=>{const a=i*1.05,r=.35+.25*(i%2);return m86T([Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(a)*r*.3,1.5+.3*(i%3),Math.sin(a)*r*.3],.11,.02,0x4b8a34,6)}),
   ...[0,1,2,3,4,5].map(i=>m86E(0x6fae44,[Math.cos(i)*.3,.8+.1*i,Math.sin(i)*.3],[.12,.04,.08],[i,i,0]))],60,0));
 const m=mesh(g,MATT);m.position.set(x,y,z);m.scale.set(1,.01,1);scene.add(m);M86.fx.push({m,t:0,life:.9,upd(f,dt){const k=f.t/f.life;f.m.scale.y=k<.25?k/.25:1-sm(.55,1,k);f.m.rotation.y+=dt*2},end(f){scene.remove(f.m)}})}
function m86FxTick(dt){for(let i=M86.fx.length-1;i>=0;i--){const f=M86.fx[i];f.t+=dt;if(f.t>=f.life){f.end(f);M86.fx.splice(i,1)}else f.upd(f,dt)}}

/* ---------- ⑨ 새: 쉬엄쉬엄 걷다가 놀라면 도망 ---------- */
function m86BirdAI(e,dt,dp,T){const a=e.a;let sp=0;
 const scare=!P.dead&&!INT.on&&dp<T.fr*(P.moving?1:.7);
 if(e.agg){e.agg=0;e.ft=rand(3.2,4.8);e.disp=0;a.dispT=0}
 else if(scare&&e.ft<=0){if(e.kind==='m86_caper'&&!e.shown){e.shown=1;e.disp=.75;a.dispT=.8;sfx(260,.3,'sawtooth',.03,1.6)}else e.ft=rand(2.4,3.8)}
 if(e.disp>0){e.disp-=dt;m86Face(e,Math.atan2(P.x-e.x,P.z-e.z),6,dt);if(e.disp<=0)e.ft=rand(2.6,4)}
 else if(e.ft>0){e.ft-=dt;e.shown=0;const away=Math.atan2(e.x-P.x,e.z-P.z)+.55*Math.sin(e.ph*5+e.side);sp=T.sp*(dp<T.fr*1.4?1:.75);
  if(m86Step(e,away,sp,dt))m86Face(e,e.mvA,14,dt);else sp=0;
  /* 파닥 뛰기 */
  e.hopT-=dt;if(e.hopT<=0&&e.air<=0){e.hopT=rand(.7,1.5);e.airV=e.kind==='m86_ptar'?2.6:2.2;if(m86Near(dp))sfx(1500,.05,'triangle',.02,1.6)}
  if(e.ft<=0){a.flap=0}}
 else{/* 쉬엄쉬엄 */e.wt-=dt;if(e.wt<=0){e.wt=rand(2.5,7);const an=rand(0,6.28),r=rand(0,9);e.wx=e.ax+Math.cos(an)*r;e.wz=e.az+Math.sin(an)*r;e.walk=Math.random()<.65}
  if(e.walk&&dist(e.x,e.z,e.wx,e.wz)>.6){sp=e.kind==='m86_ptar'?1.0:.95;if(m86Step(e,Math.atan2(e.wx-e.x,e.wz-e.z),sp,dt))m86Face(e,e.mvA,7,dt);else{sp=0;e.walk=false}}
  /* 공작새: 가끔(그리고 사람이 좀 떨어져서 볼 때) 꼬리 깃을 활짝 */
  if(e.kind==='m86_peac'){if(e.dsT==null)e.dsT=rand(6,14);e.dsT-=dt;if(e.dsT<=0&&sp===0){e.dsT=rand(10,20);a.dispT=rand(3,5);if(m86Near(dp)){sfx(760,.32,'sawtooth',.035,.55);setTimeout(()=>sfx(820,.28,'sawtooth',.03,.5),340)}}
   if(dp<16&&dp>T.fr&&!e.seen){e.seen=1;a.dispT=4}if(dp>22)e.seen=0}}
 /* 공중 */
 if(e.airV!==undefined&&(e.air>0||e.airV>0)){e.airV-=dt*12;e.air=Math.max(0,e.air+e.airV*dt);if(e.air<=0)e.airV=0}
 a.air=e.air||0;a.flap+=((e.air>0||e.ft>0&&sp>0?(e.air>0?1:.25):0)-a.flap)*Math.min(1,dt*10);a.spd=sp}

/* ---------- ⑩ 독두꺼비: 거리를 두며 혀 쏘기, 뛰어오르며 따라옴 ---------- */
function m86ToadAI(e,dt,dp,T){const a=e.a;let sp=0;m86Agg(e,dt,dp,14,34,60);
 const toP=Math.atan2(P.x-e.x,P.z-e.z);
 /* 혀: 부풀기(.55초) → 쏘기(.14초 늘어남, .1초 버팀) → 감기 */
 if(e.tg){const g=e.tg;g.t+=dt;a.chg=g.t<.55?sm(0,.55,g.t):Math.max(0,1-(g.t-.55)*4);
  if(g.t<.55)m86Face(e,toP,9,dt);
  else{if(!g.aim){g.aim=1;const L=clamp(dp,1.5,10.5);g.L=L;g.ax=e.x+Math.sin(e.rot)*L;g.az=e.z+Math.cos(e.rot)*L;if(m86Near(dp))sfx(980,.07,'square',.035,.35)}
   const u=g.t-.55,ext=u<.14?u/.14:u<.24?1:Math.max(0,1-(u-.24)/.22);a.tng=ext;
   const K=M86SC.toad,mx=e.x+Math.sin(e.rot)*.62*K,mz=e.z+Math.cos(e.rot)*.62*K,len=Math.max(.05,(g.L-.62*K)*ext);
   a.tq.visible=a.tt.visible=ext>.01;a.tq.scale.set(1,1,len/K);a.tt.position.set(0,.34,.62+len/K);
   if(!g.hit&&u>=.13&&u<.26){/* 혀 끝 + 혀 줄에 닿았나 */const ex=mx+Math.sin(e.rot)*len,ez=mz+Math.cos(e.rot)*len,vx=ex-mx,vz=ez-mz,w=clamp(((P.x-mx)*vx+(P.z-mz)*vz)/(vx*vx+vz*vz||1),0,1),d=Math.hypot(P.x-mx-vx*w,P.z-mz-vz*w);
    if(d<.9&&!P.dead){g.hit=1;m86Poison()}}
   if(u>.5){e.tg=null;a.tq.visible=a.tt.visible=false;a.tng=0;a.chg=0;e.cd=rand(2.1,2.8)}}}
 /* 뛰기(hop): 공중에서만 움직여요 */
 if(!e.tg){if(e.hopping){e.hopping-=dt;const k=1-e.hopping/e.hopDur;a.hop=k;sp=e.hopSp;if(!m86Step(e,e.hopA,sp,dt)){sp=0}if(e.hopping<=0){e.hopping=0;a.hop=0;e.rest=e.agg?rand(.18,.3):rand(1.4,3.6);if(m86Near(dp)&&e.agg)sfx(150,.06,'triangle',.03,.5)}}
  else{e.rest-=dt;if(e.agg)m86Face(e,toP,6,dt);
   if(e.agg&&e.cd<=0&&dp<=10.2&&dp>=1.6&&e.rest<.15){e.tg={t:0};if(m86Near(dp))sfx(120,.4,'sawtooth',.05,.7)}
   else if(e.rest<=0){let ang=null,dd=2.6;
    if(e.agg){if(dp>8.5)ang=toP+rand(-.35,.35);else if(dp<3.4){ang=toP+Math.PI+rand(-.6,.6);dd=2.2}else ang=toP+(Math.random()<.5?1.4:-1.4)+rand(-.3,.3)}   /* 너무 멀면 다가가고, 가까우면 물러나고, 사이면 옆으로 */
    else{const back=dist(e.x,e.z,e.ax,e.az)>12;ang=back?Math.atan2(e.ax-e.x,e.az-e.z):rand(0,6.28);dd=rand(1.2,2)}
    if(ang!==null){e.hopA=ang;e.hopDur=e.agg?.42:.5;e.hopping=e.hopDur;e.hopSp=dd/e.hopDur*(e.agg?1.25:1);e.rot=turn(e.rot,ang,1)}}}}
 e.air=(e.hopping?Math.sin(Math.PI*(1-e.hopping/e.hopDur))*(e.agg?.55:.35):0);a.air=e.air;a.spd=sp}

/* ---------- ⑪ 파수꾼: 느리고 단단, 내려찍기 · 땅 구르기 · 덩굴 솟기 ---------- */
function m86GuardAI(e,dt,dp,T){const a=e.a;let sp=0;m86Agg(e,dt,dp,12,30,45);if(!e.agg&&dist(e.x,e.z,e.ax,e.az)>14){e.wx=e.ax;e.wz=e.az;e.walk=true}
 const toP=Math.atan2(P.x-e.x,P.z-e.z);e.stc=(e.stc||0)-dt;if(e.vnc==null)e.vnc=rand(3,6);e.vnc-=dt;
 if(a.atk){a.at+=dt;const t=a.at,fx=Math.sin(e.rot),fz=Math.cos(e.rot);
  if(a.atk==='slam'){if(t<.7)m86Face(e,toP,2.4,dt);if(!e.hitDone&&t>=.85){e.hitDone=1;const hx=e.x+fx*2.75,hz=e.z+fz*2.75;shake=Math.max(shake,dp<12?.55:.2);m86Burst(hx,groundY(hx,hz)+.2,hz,1.6,0xc9b48a);puff(hx,groundY(hx,hz)+.3,hz,0xb5a07a,12,1.6);if(m86Near(dp))sfx(60,.5,'sawtooth',.12,.4);
    const dx=P.x-e.x,dz=P.z-e.z;if(dp<4.7&&(dx*fx+dz*fz)/(dp||1)>.15)hurtPlayer(T.dmg)}if(t>1.5){a.atk=null;e.cd=rand(1.8,2.4)}}
  else if(a.atk==='stomp'){if(!e.hitDone&&t>=1.1){e.hitDone=1;shake=Math.max(shake,dp<14?.8:.25);m86Burst(e.x,groundY(e.x,e.z)+.2,e.z,5.6,0x8fd060);puff(e.x,groundY(e.x,e.z)+.3,e.z,0x6e9a44,18,2.4);if(m86Near(dp))sfx(48,.7,'sawtooth',.14,.35);
    if(dp<5.6)hurtPlayer(22)}if(t>1.75){a.atk=null;e.cd=rand(1.4,2);e.stc=rand(6,8)}}
  else if(a.atk==='vine'){if(t<.5)m86Face(e,toP,3,dt);if(!e.vr&&t>.1){e.vx=P.x;e.vz=P.z;e.vr=m86Ring(e.vx,e.vz,1.7,0x7ccf3f,1.0)}
   if(!e.hitDone&&t>=1.1){e.hitDone=1;m86Vines(e.vx,e.vz,groundY(e.vx,e.vz));puff(e.vx,groundY(e.vx,e.vz)+.3,e.vz,0x6e5a3a,10,1.4);if(m86Near(dp))sfx(140,.3,'sawtooth',.06,.5);
    if(dist(P.x,P.z,e.vx,e.vz)<1.8&&!P.dead){hurtPlayer(18);if(typeof bufAdd==='function')bufAdd('root86')}}   /* 덩굴에 걸리면 잠깐 느려져요 */
   if(t>1.6){a.atk=null;e.vr=null;e.cd=rand(1.2,1.8);e.vnc=rand(6,9)}}}
 else if(e.agg){if(dp<4.1&&e.cd<=0){a.atk=dp<3.2&&e.stc<=0?'stomp':'slam';a.at=0;e.hitDone=0;if(a.atk==='stomp')m86Ring(e.x,e.z,5.6,0x9ad25a,1.1);if(m86Near(dp))sfx(90,.4,'sawtooth',.06,.6)}
  else if(dp>6&&dp<15&&e.cd<=0&&e.vnc<=0){a.atk='vine';a.at=0;e.hitDone=0;e.vr=null}
  else if(dp>3.2){sp=T.sp;if(m86Step(e,toP,sp,dt))m86Face(e,e.mvA,3,dt);else sp=0}else m86Face(e,toP,3,dt)}
 else{e.wt-=dt;if(e.wt<=0){e.wt=rand(5,11);const an=rand(0,6.28),r=rand(0,10);e.wx=e.ax+Math.cos(an)*r;e.wz=e.az+Math.sin(an)*r;e.walk=Math.random()<.5}
  if(e.walk&&dist(e.x,e.z,e.wx,e.wz)>1){sp=.75;if(m86Step(e,Math.atan2(e.wx-e.x,e.wz-e.z),sp,dt))m86Face(e,e.mvA,2,dt);else{sp=0;e.walk=false}}}
 /* 발소리 */
 if(sp>0){e.stepT=(e.stepT||0)+dt*sp*1.9/Math.PI;if(e.stepT>=1){e.stepT-=1;if(dp<26){puff(e.x,groundY(e.x,e.z)+.1,e.z,0xb5a07a,2,.6);if(dp<16)sfx(70,.12,'sine',.05,.6);if(dp<9)shake=Math.max(shake,.12)}}}
 a.spd=sp}

/* ---------- ⑫ 동굴: 길 찾기 격자 · 입구 둘레(보스 금지) ---------- */
/* 입구 둘레 = 광차 기지 방 둘(M74.halls 0·1) + 6m, 입구 갱도 */
function m86Forb(lx,lz){for(const i of[0,1]){const h=M74.halls[i],dx=lx-h[0],dz=lz-h[1],ux=dx*h.c+dz*h.s,uz=-dx*h.s+dz*h.c;if(Math.hypot(ux/(h[2]+6),uz/(h[3]+6))<1)return true}return Math.abs(lx)<12&&lz>88}
function m86Nav(){const c=M74.c,I0=M74.I0,J0=M74.J0,nI=M74.nI,nJ=M74.nJ,W=new Uint8Array(nI*nJ);let n=0;
 for(let i=0;i<nI;i++)for(let j=0;j<nJ;j++){const x=(i+I0)*c,z=(j+J0)*c;if(mineOpen(x,z,M86.crab.r)&&!m86Forb(x,z))W[i*nJ+j]=1}
 /* 가장 큰 이어진 곳만 남겨요(소품 사이 작은 틈에 보스가 갇히지 않게) */
 const comp=new Int32Array(W.length).fill(-1);let bestC=-1,bestN=0;for(let q=0,nc=0;q<W.length;q++){if(!W[q]||comp[q]>=0)continue;const st=[q];comp[q]=nc;let sz=0;
  while(st.length){const u=st.pop();sz++;const ui=(u/nJ)|0,uj=u%nJ;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=ui+di,b=uj+dj;if(a<0||b<0||a>=nI||b>=nJ)continue;const v=a*nJ+b;if(W[v]&&comp[v]<0){comp[v]=nc;st.push(v)}}}
  if(sz>bestN){bestN=sz;bestC=nc}nc++}
 for(let q=0;q<W.length;q++)if(W[q]&&comp[q]!==bestC)W[q]=0;else if(W[q])n++;
 const N={c,I0,J0,nI,nJ,W,n,pts:[]};
 /* 돌아다닐 방 자리: 방(2~14) 가운데에서 가장 가까운 걸을 수 있는 칸 */
 M74.halls.forEach((h,k)=>{if(k<2)return;let best=null,bd=1e9;for(let r=0;r<Math.min(h[2],h[3])*.8;r+=c)for(let a=0;a<16;a++){const x=h[0]+Math.cos(a*.39)*r,z=h[1]+Math.sin(a*.39)*r,q=m86Cell(N,x,z);if(q>=0&&N.W[q]){const d=Math.hypot(x-h[0],z-h[1]);if(d<bd){bd=d;best=[x,z,k]}}}if(best)N.pts.push(best)});
 return N}
function m86Cell(N,x,z){const i=Math.round(x/N.c)-N.I0,j=Math.round(z/N.c)-N.J0;if(i<0||j<0||i>=N.nI||j>=N.nJ)return -1;return i*N.nJ+j}
function m86NearCell(N,x,z,R=6){let q=m86Cell(N,x,z);if(q>=0&&N.W[q])return q;let best=-1,bd=1e9;const ci=Math.round(x/N.c)-N.I0,cj=Math.round(z/N.c)-N.J0,k=Math.ceil(R/N.c);
 for(let i=ci-k;i<=ci+k;i++)for(let j=cj-k;j<=cj+k;j++){if(i<0||j<0||i>=N.nI||j>=N.nJ||!N.W[i*N.nJ+j])continue;const d=(i-ci)**2+(j-cj)**2;if(d<bd){bd=d;best=i*N.nJ+j}}return best}
/* A* (8방향, 대각선은 양옆 칸이 모두 열려 있을 때만) */
function m86Path(N,ax,az,bx,bz){const s=m86NearCell(N,ax,az,4),g=m86NearCell(N,bx,bz,8);if(s<0||g<0)return null;if(s===g)return[[bx,bz]];
 const nJ=N.nJ,G=new Float32Array(N.W.length).fill(1e9),F=new Int32Array(N.W.length).fill(-1),cl=new Uint8Array(N.W.length),H=[],gi=(g/nJ)|0,gj=g%nJ;
 const hf=q=>{const di=Math.abs(((q/nJ)|0)-gi),dj=Math.abs(q%nJ-gj);return Math.max(di,dj)+.414*Math.min(di,dj)};
 const push=(f,q)=>{H.push([f,q]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}};
 const pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b<H.length&&H[b][0]<H[m][0])m=b;if(m===i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
 G[s]=0;push(hf(s),s);let it=0;
 while(H.length&&it++<500000){const[,q]=pop();if(cl[q])continue;cl[q]=1;if(q===g)break;const qi=(q/nJ)|0,qj=q%nJ;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const ni=qi+di,nj=qj+dj;if(ni<0||nj<0||ni>=N.nI||nj>=nJ)continue;const r=ni*nJ+nj;if(!N.W[r]||cl[r])continue;
   if(di&&dj&&(!N.W[qi*nJ+nj]||!N.W[ni*nJ+qj]))continue;const ng=G[q]+(di&&dj?1.414:1);if(ng<G[r]){G[r]=ng;F[r]=q;push(ng+hf(r),r)}}}
 if(F[g]<0)return null;const out=[];for(let q=g;q!==s&&q>=0;q=F[q])out.push([(((q/nJ)|0)+N.I0)*N.c,(q%nJ+N.J0)*N.c]);out.reverse();out.push([bx,bz]);return out}
function m86LOS(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.8);for(let k=1;k<n;k++){const u=k/n;if(!mineFloorAt(lerp(ax,bx,u),lerp(az,bz,u)))return false}return true}
function m86Clear(N,ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.7);for(let k=1;k<=n;k++){const u=k/n,q=m86Cell(N,lerp(ax,bx,u),lerp(az,bz,u));if(q<0||!N.W[q])return false}return true}
/* 길 따라가기(앞 칸이 곧게 보이면 건너뛰어요) */
function m86Follow(e,sp,dt){const N=M86.cave.nav,lx=e.x-INT.x-MINE.ox,lz=e.z-INT.z-MINE.oz,p=e.path;if(!p||!p.length)return false;
 while(e.pk<p.length-1&&m86Clear(N,lx,lz,p[e.pk+1][0],p[e.pk+1][1]))e.pk++;
 const t=p[Math.min(e.pk,p.length-1)];if(Math.hypot(t[0]-lx,t[1]-lz)<1.1){if(e.pk>=p.length-1){e.path=null;return false}e.pk++}
 const q=p[Math.min(e.pk,p.length-1)],ok=m86Step(e,Math.atan2(q[0]-lx,q[1]-lz),sp,dt);if(!ok){e.stuck=(e.stuck||0)+dt;if(e.stuck>1.2){e.stuck=0;e.path=null}}else e.stuck=0;return ok}

/* ---------- ⑬ 거대 동굴게 ---------- */
function m86RockNear(e,R){if(!MO79||!MO79.built)return null;const lx=e.x-INT.x-MINE.ox,lz=e.z-INT.z-MINE.oz;let b=null,bd=R;for(const o of MO79.list){if(o.re>0)continue;const d=Math.hypot(o.lx-lx,o.lz-lz);if(d<bd){bd=d;b=o}}return b}
function m86Throw(e,fromV,tx,tz,T){const y0=fromV.y,y1=groundY(tx,tz)+.2,dd=dist(fromV.x,fromV.z,tx,tz),tf=clamp(.55+dd*.045,.7,1.35),g=14;
 const m=mesh(M86G['crab:rk'],MATT);m.position.copy(fromV);scene.add(m);const ring=m86Ring(tx,tz,2.3,0xff5a3a,tf);
 M86.pj.push({k:'rock',m,x:fromV.x,y:y0,z:fromV.z,vx:(tx-fromV.x)/tf,vz:(tz-fromV.z)/tf,vy:(y1-y0)/tf+.5*g*tf,g,t:0,tf,tx,tz,ring,cave:1,dmg:Math.round(30*(1+.3*e.a.rage))})}
function m86PjTick(dt){for(let i=M86.pj.length-1;i>=0;i--){const p=M86.pj[i];p.t+=dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.vy-=p.g*dt;p.y+=p.vy*dt;p.m.position.set(p.x,p.y,p.z);p.m.rotation.x+=dt*6;p.m.rotation.z+=dt*4;
  if(p.t>=p.tf){scene.remove(p.m);M86.pj.splice(i,1);const dp=dist(p.tx,p.tz,P.x,P.z);m86Burst(p.tx,groundY(p.tx,p.tz)+.3,p.tz,2.4,0xb8a890);puff(p.tx,groundY(p.tx,p.tz)+.4,p.tz,0x8a8c94,14,2);shake=Math.max(shake,dp<10?.6:.2);
   sfx(80,.4,'sawtooth',.12,.3);if(dp<2.3&&!P.dead&&(INT.on&&INT.kind==='cave'))hurtPlayer(p.dmg)}}}
function m86BossAI(e,dt,dp,T){const a=e.a,N=M86.cave.nav,lx=e.x-INT.x-MINE.ox,lz=e.z-INT.z-MINE.oz,plx=P.x-INT.x-MINE.ox,plz=P.z-INT.z-MINE.oz,rage=clamp(1-e.hp/e.max,0,1),spK=1+.7*rage;
 a.setRage(rage);let sp=0;const toP=Math.atan2(P.x-e.x,P.z-e.z),pin=INT.on&&INT.kind==='cave'&&!P.dead&&!DEV.on,pForb=m86Forb(plx,plz);
 /* 분노 단계 알림 */
 const st=rage>.8?2:rage>.5?1:0;if(st>(e.rs||0)){e.rs=st;sfx(70,.9,'sawtooth',.08,.6);toast(st===2?'🦀 거대 동굴게가 미쳐 날뛰어요! (분노 가득)':'🦀 거대 동굴게가 화가 났어요! 더 빨라져요');for(let k=0;k<12;k++)puff(e.x+rand(-1,1),groundY(e.x,e.z)+1.6,e.z+rand(-1,1),0xff7a4a,1,1.2)}
 /* 알아채기: 보이거나(18m, 막힘 없이) 가까우면(7m) */
 e.seeT=(e.seeT||0)-dt;if(!e.agg&&pin&&!pForb&&e.seeT<=0){e.seeT=.3;if(dp<7||(dp<18&&m86LOS(lx,lz,plx,plz))){e.agg=1;sfx(90,.6,'sawtooth',.07,.5)}}
 if(e.agg){if(!pin){e.agg=0;e.path=null}else if(pForb){e.waitF=(e.waitF||0)+dt;if(e.waitF>4){e.agg=0;e.waitF=0;e.path=null}}else{e.waitF=0;if(dp>42){e.lost=(e.lost||0)+dt;if(e.lost>8){e.agg=0;e.path=null}}else e.lost=0}}
 if(e.thc==null)e.thc=rand(3,5);e.thc-=dt;
 /* 동작 */
 if(e.mv==='lift'){/* 바위 들기 → 던지기 */e.mt+=dt;m86Face(e,toP,4,dt);const t=e.mt;a.lift=t<.7?t/.7:t<1.05?1:1+Math.min(1,(t-1.05)/.25);
  if(t>.25&&!a.rock.visible&&e.rk){a.rock.visible=true;const o=e.rk;o.re=OBJT[3].re||420;o.hp=0;depSet.add(o.key);refreshObj(o);puff(o.x,groundY(o.x,o.z)+.6,o.z,0x8a8c94,10,1.4);sfx(110,.25,'sawtooth',.07,.4)}
  if(t>=1.15&&a.rock.visible){a.rock.visible=false;a.root.updateMatrixWorld(true);a.rock.getWorldPosition(m86V);const lead=.35,tx=P.x+(P.m86vx||0)*lead,tz=P.z+(P.m86vz||0)*lead;m86Throw(e,m86V.clone(),tx,tz,T);sfx(160,.2,'sawtooth',.06,.6)}
  if(t>1.55){e.mv=null;a.lift=0;e.thc=rand(7,9)*(1-.45*rage)}}
 else if(e.mv==='go_rock'){e.mt+=dt;const o=e.rk;if(!o||o.re>0||e.mt>3.5){e.mv=null}else{const d=Math.hypot(o.lx-lx,o.lz-lz);if(d<3.3){e.mv='lift';e.mt=0}else{sp=T.sp*2.4*spK;if(m86Step(e,Math.atan2(o.lx-lx,o.lz-lz),sp,dt))m86Face(e,e.mvA,5,dt);else sp=0}}}
 else if(a.atkT>0){/* 집게질 */a.atkT+=dt/(.72*(1-.3*rage));if(a.atkT<.45)m86Face(e,toP,5,dt);
  if(!e.hitDone&&a.atkT>=.45){e.hitDone=1;const fx=Math.sin(e.rot),fz=Math.cos(e.rot),dx=P.x-e.x,dz=P.z-e.z;if(m86Near(dp))sfx(220,.09,'square',.08,.35);puff(e.x+fx*3.5,groundY(e.x,e.z)+.6,e.z+fz*3.5,0xcfc6b0,6,1);
   if(dp<5.0&&(dx*fx+dz*fz)/(dp||1)>.25&&pin)hurtPlayer(Math.round(T.dmg*(1+.25*rage)))}
  if(a.atkT>=1){a.atkT=0;e.cd=rand(1.1,1.5)*(1-.35*rage)}}
 else if(e.agg&&!pForb){
  if(dp<4.4&&e.cd<=0){a.atkT=.001;a.atkSide=-a.atkSide;e.hitDone=0}
  else if(dp>6&&dp<24&&e.thc<=0){const o=m86RockNear(e,9);if(o){e.rk=o;e.mv='go_rock';e.mt=0}else e.thc=1.5}
  else if(dp>3.6){sp=4.6*spK;e.rp=(e.rp||0)-dt;if(!e.path||e.rp<=0){e.rp=.6;e.path=m86Path(N,lx,lz,plx,plz);e.pk=0}
   const direct=dp<9&&m86Clear(N,lx,lz,plx,plz)||!e.path;if(direct){if(m86Step(e,toP,sp,dt))m86Face(e,toP,4,dt);else sp=0}else if(!m86Follow(e,sp,dt))sp=0;else m86Face(e,e.mvA,4,dt)}
  else m86Face(e,toP,4,dt)}
 else if(e.agg&&pForb){/* 입구 둘레로는 못 들어가요: 앞에서 서성이다 돌아가요 */m86Face(e,toP,3,dt)}
 else{/* 돌아다니기: 방에서 방으로, 갱도를 따라 천천히 옆걸음 */
  if(!e.path){e.wt-=dt;if(e.wt<=0&&N.pts.length){const q=pick(N.pts);e.path=m86Path(N,lx,lz,q[0],q[1]);e.pk=0;e.wt=rand(4,9)}}
  else{sp=T.sp*spK;if(m86Follow(e,sp,dt))m86Face(e,e.mvA+Math.PI/2*(e.sideW||1),1.6,dt);else sp=0;if(!e.path)e.sideW=Math.random()<.5?1:-1}}
 /* 자힐: 5초마다 2% */
 e.healT=(e.healT||0)+dt;if(e.healT>=M86.crab.healT){e.healT-=M86.crab.healT;if(e.hp<e.max){const h=Math.round(e.max*M86.crab.heal);e.hp=Math.min(e.max,e.hp+h);ftext(e.x,groundY(e.x,e.z)+3.4,e.z,'+'+h,'#8ff0a8');for(let k=0;k<4;k++)puff(e.x+rand(-1,1),groundY(e.x,e.z)+1.8,e.z+rand(-1,1),0x8ff0d0,1,.5)}}
 if(rage>.5&&Math.random()<dt*3)puff(e.x+rand(-.8,.8),groundY(e.x,e.z)+1.7,e.z+rand(-.8,.8),0xffa07a,1,.6);
 M86.cave.bossHp=e.hp;a.spd=sp}
/* 미니 동굴게: 때리지 않고 도망만 */
function m86MiniAI(e,dt,dp,T){const a=e.a;let sp=0;const near=INT.on&&INT.kind==='cave'&&!P.dead&&dp<T.fr;
 if(e.agg){e.agg=0;e.ft=rand(2.2,3.2)}else if(near&&e.ft<=0)e.ft=rand(1.8,2.8);
 if(e.ft>0){e.ft-=dt;const away=Math.atan2(e.x-P.x,e.z-P.z)+.4*Math.sin(e.ph*6);sp=T.sp;if(m86Step(e,away,sp,dt))m86Face(e,away+Math.PI/2*(e.sideW||1),12,dt);else sp=0;if(e.ft<=0)a.lift=0;else a.lift=1}
 else{e.wt-=dt;if(e.wt<=0){e.wt=rand(1.5,5);const an=rand(0,6.28),r=rand(0,6);e.wx=e.x+Math.cos(an)*r;e.wz=e.z+Math.sin(an)*r;e.walk=Math.random()<.6;e.sideW=Math.random()<.5?1:-1}
  if(e.walk&&dist(e.x,e.z,e.wx,e.wz)>.4){sp=1.4;const an=Math.atan2(e.wx-e.x,e.wz-e.z);if(m86Step(e,an,sp,dt))m86Face(e,e.mvA+Math.PI/2*e.sideW,8,dt);else{sp=0;e.walk=false}}}
 a.spd=sp}

/* ---------- ⑭ 끼워 넣기: 생기기 · 움직이기 · 쓰러지기 ---------- */
{const _se=spawnEnemy;spawnEnemy=function(kind,x,z,o){const e=_se.apply(this,arguments),T=ENEMY[kind];if(T&&T.m86){e.m86=T.m86;e.r=T.r;e.by=T.by;e.hw=T.hw;e.hr=T.hr||0;e.nobar=T.nobar;e.cave=!!T.cave;e.boss=T.m86==='boss';
  e.ft=0;e.hopT=0;e.air=0;e.rest=rand(.5,2);e.wt=rand(.5,3);e.ph=Math.random()*6;e.isl=e.isl||(T.cave?[]:[islAt(x,z)].filter(Boolean));if(e.a&&e.a.set)e.a.set(x,z,e.rot)}return e}}
{const _ue=updEnemy;updEnemy=function(e,dt){if(!e.m86)return _ue.apply(this,arguments);const a=e.a,T=ENEMY[e.kind];if(!T){dropEnemy(e);return}
 if(e.dead){e.deadT-=dt;if(e.m86==='toad'&&!e.boomed){a.swell=Math.min(1,(a.swell||0)+dt/.85);if(a.swell>=1){e.boomed=1;const B=T.boom,y=groundY(e.x,e.z);m86Burst(e.x,y+.6,e.z,B.r,0x8fe04a);puff(e.x,y+.6,e.z,0x6fbf2f,22,2.4);puff(e.x,y+.6,e.z,0xd8ff9a,10,1.6);
    shake=Math.max(shake,.5);sfx(85,.5,'sawtooth',.14,.3);sfx(300,.3,'square',.04,.2);a.root.visible=false;const d=dist(e.x,e.z,P.x,P.z);if(d<B.r&&!P.dead){hurtPlayer(Math.round(B.dmg*(1-d/B.r*.5)));m86Poison()}}}
  a.mixer.update(dt);if(e.deadT<0){a.dispose();const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}return}
 const inCave=INT.on&&INT.kind==='cave',vis=e.cave?inCave:!INT.on,dp=dist(e.x,e.z,P.x,P.z);
 if(!vis||dp>(e.boss?140:95)){a.root.visible=false;if(e.boss&&vis){/* 멀어도 자힐은 해요 */}return}
 a.root.visible=true;e.cd-=dt;e.hpT-=dt;e.ph+=dt;if(e.litT>0)e.litT-=dt;
 try{if(e.m86==='bird')m86BirdAI(e,dt,dp,T);else if(e.m86==='toad')m86ToadAI(e,dt,dp,T);else if(e.m86==='guard')m86GuardAI(e,dt,dp,T);else if(e.m86==='boss')m86BossAI(e,dt,dp,T);else if(e.m86==='mini')m86MiniAI(e,dt,dp,T)}catch(err){console.error('86차 몹',e.kind,err)}
 m86Sep(e);a.set(e.x,e.z,e.rot);a.mixer.update(dt)}}
{const _ke=killEnemy;killEnemy=function(e){_ke.apply(this,arguments);if(!e.m86)return;e.deadT=e.m86==='toad'?2.2:e.boss?6:3;
  if(e.m86==='toad'){e.a.tq.visible=e.a.tt.visible=false;toast('🐸 독두꺼비가 부풀어 올라요 — 떨어져요!')}
  if(e.boss){if(!S.m86)S.m86={};S.m86.crab=Date.now()+M86.crab.re;M86.cave.bossHp=null;M86.cave.boss=null;jingle([392,523,659,784,1047]);toast('🦀 거대 동굴게를 쓰러뜨렸어요! 30분 뒤에 다시 나타나요');shake=Math.max(shake,.7)}
  if(e.slot){e.slot.e=null;e.slot.wait=rand(e.slot.re[0],e.slot.re[1])}}}
/* 맞으면: 큰 몹은 튕기지 않고, 새·꼬마게는 바로 도망 */
{const _he=hurtEnemy;hurtEnemy=function(e,d,dx,dz){if(e&&e.m86&&!e.dead){e.hurtT=8;if(e.boss)e.seeT=0}return _he.apply(this,arguments)}}
/* 총알 폭·근접 사거리: 몸 크기만큼(파수꾼·동굴게는 크고, 새는 작아도 맞히기 쉽게) */
hitscan=function(ox,oz,dx,dz,range,dmg){let best=null,bt=range;for(const e of enemies){if(e.dead)continue;const rx=e.x-ox,rz=e.z-oz,t=rx*dx+rz*dz;if(t<0||t>bt)continue;if(Math.abs(rx*dz-rz*dx)<(e.hw||(e.big?1.05:.78))){bt=t;best=e}}
 if(best)hurtEnemy(best,dmg,dx,dz);return bt};

/* 바깥 무리 자리: 섬마다 땅 칸 목록(4m) */
function m86Init(){for(const e of enemies.slice())if(e.m86)dropEnemy(e);M86.slots=[];M86.pj.forEach(p=>{scene.remove(p.m)});M86.pj=[];M86.cave.on=false;M86.cave.boss=null;M86.cave.mini=[];
 if(!S.m86)S.m86={};
 for(const g of M86.out){const isls=m86Isl(g.isl);if(!isls.length){console.warn('86차: 섬 없음',g.isl);continue}const cells=[];
  for(const I of isls){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let x=0;x<WS;x+=8)for(let z=0;z<WS;z+=8)if(islAt(x,z)===I&&hAt(x,z)>.3){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
   for(let x=x0-8;x<=x1+8;x+=4)for(let z=z0-8;z<=z1+8;z+=4)if(islAt(x,z)===I&&hAt(x,z)>.95)cells.push([x,z])}
  for(let i=0;i<g.n;i++)M86.slots.push({k:g.k,isls,main:g.main,cells,re:g.re,e:null,wait:0,first:1})}
 M86.world=S}
function m86SlotTick(){for(const sl of M86.slots){if(sl.e){if(enemies.includes(sl.e))continue;if(!sl.e.dead){sl.e=null;sl.wait=rand(sl.re[0],sl.re[1])}continue}
  if(sl.wait>0)continue;const p=m86Spot(sl);if(!p){sl.wait=5;continue}const e=spawnEnemy(sl.k,p[0],p[1],{isl:sl.isls,main:sl.main,slot:sl});sl.e=e;sl.first=0;e.rot=rand(0,6.28);e.a.set(e.x,e.z,e.rot)}}
/* 동굴 몹: 들어갈 때 만들고, 나오면 치워요(보스 체력·30분은 기억) */
function m86CaveIn(){const C=M86.cave;if(!C.nav){const t0=performance.now();C.nav=m86Nav();C.navMs=Math.round(performance.now()-t0)}C.on=true;const N=C.nav,W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz];
 /* 미니 동굴게: 방 여기저기 */
 const pts=N.pts.slice().sort(()=>Math.random()-.5);C.mini=[];
 for(let i=0;i<M86.crab.mini;i++){const q=pts[i%pts.length]||[0,0];for(let k=0;k<40;k++){const lx=q[0]+rand(-9,9),lz=q[1]+rand(-9,9);if(!mineOpen(lx,lz,.45))continue;const[x,z]=W(lx,lz);const e=spawnEnemy('m86_minic',x,z,{});e.rot=rand(0,6.28);C.mini.push(e);break}}
 m86BossTry()}
function m86BossTry(){const C=M86.cave;if(!C.on||C.boss&&enemies.includes(C.boss)&&!C.boss.dead)return;if(S.m86&&S.m86.crab&&Date.now()<S.m86.crab)return;const N=C.nav;if(!N||!N.pts.length)return;
 const plx=P.x-INT.x-MINE.ox,plz=P.z-INT.z-MINE.oz,L=N.pts.filter(q=>Math.hypot(q[0]-plx,q[1]-plz)>45),q=pick(L.length?L:N.pts);
 const e=spawnEnemy('m86_crab',q[0]+INT.x+MINE.ox,q[1]+INT.z+MINE.oz,{});if(C.bossHp)e.hp=Math.min(e.max,C.bossHp);e.rot=rand(0,6.28);e.sideW=1;C.boss=e;if(S.m86)S.m86.crab=0}
function m86CaveOut(){const C=M86.cave;C.on=false;for(const e of enemies.slice())if(e.m86&&e.cave)dropEnemy(e);C.boss=null;C.mini=[];for(let i=M86.pj.length-1;i>=0;i--){const p=M86.pj[i];if(p.cave){scene.remove(p.m);M86.pj.splice(i,1)}}}

/* updSpawns 바꿔 끼우기(옛 무작위 스폰·약탈자 무리·경계병 없음) */
updSpawns=function(dt){if(mode!=='play')return;if(M86.world!==S)m86Init();M86.t+=dt;
 for(const sl of M86.slots)if(!sl.e&&sl.wait>0)sl.wait-=dt;
 M86.spawnT-=dt;if(M86.spawnT<=0){M86.spawnT=1;m86SlotTick();if(M86.cave.on)m86BossTry()}
 const inCave=INT.on&&INT.kind==='cave'&&typeof M74!=='undefined'&&M74.W&&INT.gr&&INT.gr.cave;if(inCave&&!M86.cave.on)m86CaveIn();else if(!inCave&&M86.cave.on)m86CaveOut();
 m86PjTick(dt);m86FxTick(dt);m86PoisonTick(dt);m86BossBar()};
/* 플레이어 속도(바위 던질 때 앞질러 겨누기) */
{const _up=updPlayer;updPlayer=function(dt){const x=P.x,z=P.z;_up.apply(this,arguments);if(dt>0&&dt<.2){P.m86vx=lerp(P.m86vx||0,(P.x-x)/dt,Math.min(1,dt*6));P.m86vz=lerp(P.m86vz||0,(P.z-z)/dt,Math.min(1,dt*6))}}}

/* ---------- ⑮ 보스 체력 줄(화면 위) ---------- */
{const css=document.createElement('style');css.textContent=
 '#m86boss{position:absolute;left:50%;top:12px;transform:translateX(-50%);width:min(440px,62vw);padding:7px 12px 8px;border-radius:14px;background:var(--pn,#FBF4E6);border:2px solid var(--pn3,#e6d6b8);box-shadow:0 3px 0 rgba(0,0,0,.18);font:900 13px var(--f,sans-serif);color:var(--tx,#5B3D2B);pointer-events:none;z-index:4;opacity:0;transition:opacity .3s}'+
 '#m86boss.on{opacity:.97}#m86boss .n{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}#m86boss .n small{font-weight:800;color:var(--mut,#9a8470);font-size:11px}'+
 '#m86boss .hb{height:11px;border-radius:6px;background:rgba(59,42,32,.18);overflow:hidden}#m86boss .hb i{display:block;height:100%;background:linear-gradient(#ff8a78,#e0533f);border-radius:6px;transition:width .2s}'+
 '#m86boss .rg{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:11px}#m86boss .rb{flex:1;height:6px;border-radius:4px;background:rgba(59,42,32,.15);overflow:hidden}#m86boss .rb i{display:block;height:100%;background:linear-gradient(90deg,#f6b13c,#e0533f);transition:width .3s}'+
 '#m86boss.rage .rb i{animation:m86rg .5s infinite}@keyframes m86rg{50%{filter:brightness(1.5)}}';document.head.appendChild(css)}
function m86BossBar(){let el=document.getElementById('m86boss');const b=M86.cave.boss,show=b&&!b.dead&&INT.on&&INT.kind==='cave'&&(b.agg||dist(b.x,b.z,P.x,P.z)<26);
 if(!el){if(!show)return;const ui=document.getElementById('ui');if(!ui)return;el=document.createElement('div');el.id='m86boss';el.innerHTML='<div class="n"><span>🦀 거대 동굴게</span><small></small></div><div class="hb"><i></i></div><div class="rg">분노<div class="rb"><i></i></div></div>';ui.appendChild(el)}
 el.classList.toggle('on',!!show);if(!show)return;const f=b.hp/b.max,r=clamp(1-f,0,1);el.querySelector('.hb i').style.width=(f*100).toFixed(1)+'%';el.querySelector('.rb i').style.width=(r*100).toFixed(0)+'%';el.querySelector('small').textContent=Math.ceil(b.hp)+' / '+b.max;el.classList.toggle('rage',r>.5)}

/* ---------- ⑯ 사냥 도감: 몹 그림 + 사는 곳 ---------- */
function m86Portraits(){if(M86.icDone)return;M86.icDone=1;try{const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setSize(128,128);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x8892a0,1.1));const d=new THREE.DirectionalLight(0xfff4e0,1.2);d.position.set(2,4,3);sc.add(d);const cam=new THREE.PerspectiveCamera(22,1,.05,80),bx=new THREE.Box3(),v=new THREE.Vector3();
 for(const k in ENEMY){const T=ENEMY[k];if(!T.actor)continue;let a;try{a=T.actor()}catch(e){continue}scene.remove(a.root);sc.add(a.root);a.root.position.set(0,0,0);a.root.rotation.y=.62;if(k==='m86_peac'){a.dispT=9;a.disp=1}if(a.mixer)a.mixer.update(.016);if(k==='m86_peac'&&a.pose){a.disp=1;a.pose(0)}
  a.root.updateMatrixWorld(true);bx.setFromObject(a.root);bx.getSize(v);const s=Math.max(v.x,v.y*1.05,v.z*.7);bx.getCenter(v);const D=s/(2*Math.tan(11*Math.PI/180))*1.08;cam.position.set(v.x+D*.12,v.y+D*.38,v.z+D*.92);cam.lookAt(v);
  r.render(sc,cam);M86.ic[k]=r.domElement.toDataURL();sc.remove(a.root)}r.dispose()}catch(e){console.warn('86차 도감 그림',e)}}
huntDexHtml=function(){if(!S.hdex)S.hdex={};m86Portraits();const L=Object.keys(ENEMY),n=L.filter(k=>S.hdex[k]).length;
 return `<div class="sec">사냥 도감 ${n} / ${L.length}</div>`+dexGrid(L.map(k=>{const c=S.hdex[k],im=M86.ic[k];
  const pic=im?`<img src="${im}" style="width:54px;height:54px;object-fit:contain;${c?'':'filter:brightness(0) opacity(.35)'}">`:`<span style="font-size:30px;line-height:58px;${c?'':'filter:grayscale(1) brightness(.4);opacity:.5'}">${HUNT_IC[k]||'❔'}</span>`;
  return dexCard(pic,c,ENEMY[k].n,c?`쓰러뜨림 ${c}`:(M86_HAB[k]||''))}).join(''))};
