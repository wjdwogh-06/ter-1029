/* 56차(디자인) — 에너지 드링크 2종·보드카(마시는 효과) + 모자 4종(쓰는 효과)
   기획자(11-22 17:15): 아이템(이미지만) + 효과
   - 에너지 드링크 순한맛: 300초 동안 5% 빨라짐
   - 에너지 드링크 강한맛: 30초 동안 20% 빨라지고, 끝나면 30초 동안 10% 느려짐(그동안 또 마시면 +20 −10 = 10%만 빨라짐)
   - 보드카: 999초 동안 추위를 안 타고, 5초마다 에너지 0.5칸 회복, 10% 빨라짐 → 끝나면 999초 동안 90% 느려지고 5초마다 1칸씩 닳음
   - 강탈 모자: 사람을 쓰러뜨리면 그 사람 돈 10%를 빼앗음(멀티 서버 판정 필요 → 규칙 담당), 총·근접 공격 5% 치명타
   - 나무꾼 모자: 나무를 베면 나무 두 배 / 전투 모자: 받는 피해 −10%, 총알이 안 퍼짐 / 호박 모자: 30% 빨라짐, 받는 피해 +10%, 사람과 안 부딪힘
   계산 규칙(BUFDEF): 효과마다 따로 시간이 흐르고, 빠르기는 모두 더해요(1 + 합, 가장 느려도 10%). 같은 효과를 또 마시면 겹치지 않고 시간만 처음으로 되돌려요.
   강한맛의 '기운 빠짐'·보드카의 '숙취'는 그 효과가 끝나는 순간 시작해요(이미 기운 빠짐 중이면 그대로 이어지고, 새 강한맛 +20%와 더해져 +10%).
   쓰러지면 모든 효과가 사라져요. 남은 시간은 저장돼요(S.buffs). 시간은 게임이 도는 동안만 흘러요(창을 열어 멈추면 같이 멈춤). */
Object.assign(ITEMS,{
 drink_mild:{n:'에너지 드링크 순한맛',ty:'food',food:0,p:150,ic:'lk_drink_mild',buff:'mild',d:'마시면 300초 동안 5% 빨라져요'},
 drink_strong:{n:'에너지 드링크 강한맛',ty:'food',food:0,p:320,ic:'lk_drink_strong',buff:'str',d:'마시면 30초 동안 20% 빨라져요. 끝나면 30초 동안 10% 느려져요'},
 vodka:{n:'보드카',ty:'food',food:0,p:600,ic:'lk_vodka',buff:'vod',d:'999초 동안 추위를 안 타고, 5초마다 에너지 0.5칸이 차고, 10% 빨라져요. 끝나면 999초 동안 90% 느려지고 5초마다 1칸씩 닳아요'},
 hat_plunder:{n:'강탈 모자',ty:'res',eq:'hat',one:1,p:2400,ic:'lk_hat_plunder',d:'사람을 쓰러뜨리면 그 사람 돈의 10%를 빼앗아요. 총·근접 무기 공격이 5% 확률로 치명타(피해 2배)'},
 hat_lumber:{n:'나무꾼 모자',ty:'res',eq:'hat',one:1,p:1500,ic:'lk_hat_lumber',d:'나무를 베면 나무가 두 배로 나와요'},
 hat_combat:{n:'전투 모자',ty:'res',eq:'hat',one:1,p:2000,ic:'lk_hat_combat',d:'받는 피해가 10% 줄고, 총알이 퍼지지 않아요'},
 hat_pumpkin:{n:'호박 모자',ty:'res',eq:'hat',one:1,p:1800,ic:'lk_hat_pumpkin',d:'30% 빨라지지만 받는 피해가 10% 늘어요. 다른 사람과 부딪히지 않고 지나가요'}});
const BUFDEF={
 mild:{n:'에너지 드링크 순한맛',ic:'🥤',sp:.05,T:300,c:'#2f9e7c'},
 str:{n:'에너지 드링크 강한맛',ic:'⚡',sp:.20,T:30,after:'strC',c:'#e0533f'},
 strC:{n:'기운 빠짐',ic:'🐢',sp:-.10,T:30,c:'#8a7d70'},
 vod:{n:'보드카',ic:'🍸',sp:.10,T:999,hp:5,noCold:1,after:'vodH',c:'#3f7fd0'},
 vodH:{n:'숙취',ic:'🤢',sp:-.90,T:999,hp:-10,c:'#7a5aa8'}};
const HATFX={hat_plunder:{crit:.05,steal:.1},hat_lumber:{wood:2},hat_combat:{dmg:-.1,noSpread:1},hat_pumpkin:{sp:.3,dmg:.1,ghost:1}};
const BUF={hpT:0,critNow:false,lumber:false,ui:0};
const hatOn=()=>typeof eqGet==='function'&&S&&S.eq?(eqGet('hat')&&invN(eqGet('hat'))>0?eqGet('hat'):null):null;
const hatFx=()=>HATFX[hatOn()]||{};
function bufList(){if(!S.buffs)S.buffs=[];return S.buffs}
function bufHas(k){return bufList().some(b=>b.k===k)}
function bufAdd(k){const d=BUFDEF[k],L=bufList(),o=L.find(b=>b.k===k);if(o)o.t=Math.max(o.t,d.T);else L.push({k,t:d.T});hudDirty=true}
/* 지금 빠르기 배수: 1 + (효과 합) + 모자 */
function bufSpeed(){let s=1;for(const b of bufList())s+=BUFDEF[b.k].sp||0;s+=hatFx().sp||0;return Math.max(.1,s)}
const bufNoCold=()=>bufList().some(b=>BUFDEF[b.k].noCold);   /* 추위 피해는 아직 게임에 없어요 — 생기면 이걸 보면 돼요 */
function bufTick(dt){const L=bufList();if(!L.length){BUF.hpT=0;return}
 for(let i=L.length-1;i>=0;i--){const b=L[i];b.t-=dt;if(b.t<=0){L.splice(i,1);const d=BUFDEF[b.k];if(d.after){bufAdd(d.after);const a=BUFDEF[d.after];toast(`${a.ic} ${d.n} 효과가 끝났어요 — ${a.n} ${Math.round(a.T)}초`)}else toast(`${d.ic} ${d.n} 효과가 끝났어요`);hudDirty=true}}
 // 5초마다 에너지(보드카 +0.5칸, 숙취 −1칸)
 let hp=0;for(const b of L)hp+=BUFDEF[b.k].hp||0;if(!hp){BUF.hpT=0;return}
 BUF.hpT+=dt;while(BUF.hpT>=5){BUF.hpT-=5;if(P.dead||DEV.on)break;const y=groundY(P.x,P.z)+3;
  if(hp>0){if(S.hp<100){S.hp=Math.min(100,S.hp+hp);ftext(P.x,y,P.z,'+'+(hp/10)+'칸','#9fe6b0')}}
  else{S.hp+=hp;P.lastHurt=0;ftext(P.x,y,P.z,(hp/10)+'칸','#c9a0ff');if(S.hp<=0){die();break}}hudDirty=true}}
function bufDrink(id){const it=ITEMS[id];if(!take(id,1))return;bufAdd(it.buff);const d=BUFDEF[it.buff];
 if(!P.moving)P.a.play('Use_Item',{once:1,lock:.45,force:1,speed:1.7});sfx(it.buff==='vod'?380:700,.12,'sine',.05,.6);
 const sp=Math.round(bufSpeed()*100-100);toast(`${d.ic} ${it.n} — ${Math.round(d.T)}초 · 지금 빠르기 ${sp>=0?'+':''}${sp}%`);hudDirty=true}
/* ---------- 끼워 넣기 ---------- */
{const _u=useItem;useItem=function(id){const it=ITEMS[id];if(it&&it.buff){bufDrink(id);return}return _u.apply(this,arguments)}}
{const _b=bagTap;bagTap=function(k){const it=ITEMS[k];if(it&&it.buff&&invN(k)){selItem=null;bufDrink(k);if(panel==='bag')renderPanel();return}return _b.apply(this,arguments)}}
/* 빠르기: 플레이어 움직임만 배수(헤엄·얕은 물 느려짐과 곱해져요) */
{const _m=moveEnt;moveEnt=function(e,dx,dz,r){if(e===P&&mode==='play'){const k=bufSpeed();if(k!==1){dx*=k;dz*=k}}return _m.call(this,e,dx,dz,r)}}
/* 받는 피해: 전투 모자 −10%, 호박 모자 +10% */
{const _h=hurtPlayer;hurtPlayer=function(d){const k=1+(hatFx().dmg||0);return _h.call(this,d*k)}}
/* 공격: 치명타(강탈 모자 5%, 피해 2배) · 총알 안 퍼짐(전투 모자) */
{const _a=attack;attack=function(){const id=curId(),w=WEAP[id],F=hatFx();if(!w||P.cd>0)return _a.apply(this,arguments);
  const crit=F.crit&&Math.random()<F.crit,sp0=w.spread,dm0=w.dmg;if(F.noSpread&&w.spread)w.spread=0;
  if(crit&&!w.melee){w.dmg=dm0*2;BUF.critNow=true}
  try{_a.apply(this,arguments)}finally{w.spread=sp0;w.dmg=dm0;BUF.critNow=false}
  if(crit&&w.melee&&P.hitW===w)P.hitW=Object.assign({},w,{dmg:w.dmg*2,crit:1})}}
{const _up=updPlayer;updPlayer=function(dt){BUF.critNow=!!(P.hitT>0&&P.hitT-dt<=0&&P.hitW&&P.hitW.crit);try{return _up.apply(this,arguments)}finally{BUF.critNow=false}}}
{const _he=hurtEnemy;hurtEnemy=function(e,d){if(BUF.critNow&&e&&!e.dead){ftext(e.x,groundY(e.x,e.z)+3.5,e.z,'치명타!','#ffd34a');sfx(980,.06,'square',.04)}return _he.apply(this,arguments)}}
/* 나무꾼 모자: 나무가 다 베어질 때 나오는 나무 두 배 */
{const _i=interact;interact=function(){const t=target;BUF.lumber=!!(hatFx().wood&&t&&t.k==='o'&&t.o&&isTree(OBJT[t.o.t]));try{return _i.apply(this,arguments)}finally{BUF.lumber=false}}}
{const _g=give;give=function(id,n){if(BUF.lumber&&id==='wood'&&n>0){n*=hatFx().wood||1;if(P)ftext(P.x,groundY(P.x,P.z)+3.4,P.z,'🪓 나무꾼 모자 ×2','#ffe08a')}return _g.call(this,id,n)}}
/* 시간: 게임이 도는 동안(updStats) · 쓰러지면 효과 없어짐 */
{const _us=updStats;updStats=function(dt){const r=_us.apply(this,arguments);if(mode==='play'&&!P.dead)bufTick(dt);bufUi(dt);hatSync();return r}}
{const _d=die;die=function(){const was=P.dead;const r=_d.apply(this,arguments);if(!was&&P.dead&&S.buffs&&S.buffs.length){S.buffs.length=0;BUF.hpT=0;hudDirty=true}return r}}
/* ---------- 화면: 에너지 칸 아래 효과 알약(남은 시간) ---------- */
{const css=document.createElement('style');css.textContent='#bufP{position:absolute;left:14px;top:66px;display:flex;flex-wrap:wrap;gap:4px;max-width:46vw;pointer-events:none;z-index:3}'+
 '#bufP b{display:inline-flex;align-items:center;gap:3px;padding:2px 9px 2px 6px;border-radius:12px;color:#fff;font:900 12px var(--f,sans-serif);box-shadow:0 2px 0 rgba(0,0,0,.18);white-space:nowrap}'+
 '#bufP b.low{animation:bufBlink .8s infinite}@keyframes bufBlink{50%{opacity:.45}}';document.head.appendChild(css)}
function bufUi(dt){BUF.ui-=dt;if(BUF.ui>0)return;BUF.ui=.25;let e=document.getElementById('bufP');if(!e){const ui=document.getElementById('ui');if(!ui)return;e=document.createElement('div');e.id='bufP';ui.appendChild(e)}
 const on=mode==='play'&&!P.dead;if(!on){if(e.innerHTML)e.innerHTML='';return}
 const sp=document.getElementById('safeP');e.style.top=sp&&sp.classList.contains('on')?'92px':'66px';
 const ts=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
 const h=bufList().map(b=>{const d=BUFDEF[b.k],p=Math.round((d.sp||0)*100);return`<b style="background:${d.c}" class="${b.t<10?'low':''}">${d.ic} ${p>0?'+':''}${p?p+'% ':''}${ts(b.t)}</b>`});
 const ho=hatOn();if(ho&&HATFX[ho].sp)h.push(`<b style="background:#e07a2c">🎃 +${Math.round(HATFX[ho].sp*100)}%</b>`);
 const html=h.join('');if(e.innerHTML!==html)e.innerHTML=html}
/* ---------- 모자 쓰기(머리에 보이게): 고른 캐릭터마다 머리 가운데·크기를 맞춰요 ---------- */
const HAT_FIT={dog:{y:.38,z:-.03,s:1},plat:{y:.40,z:-.05,s:1.02},hero:{y:.56,z:.04,s:.9}};   /* 58차: 고양이·긴 다리 리트리버 빼고 오리너구리 */
function hatSync(){const a=P&&P.a;if(!a)return;const id=hatOn(),v=a.dog&&a.dog.v||'hero',key=id?id+'|'+v:'';if(a._hatK===key&&a._hatDog===a.dog&&(!id||a._hat&&a._hat.parent))return;
 if(a._hat){a._hat.parent&&a._hat.parent.remove(a._hat);a._hat=null}a._hatK=key;a._hatDog=a.dog;
 if(!a.dog&&a.head)for(const m of a.head.children)if(m.geometry===GEO.helmet)m.visible=!id;   /* 탐험가는 원래 쓰던 철모를 벗고 모자를 써요 */
 if(!id||!GEO['lk_'+id])return;const head=a.dog?a.root.getObjectByName('dg_head'):a.head;if(!head)return;const F=HAT_FIT[v]||HAT_FIT.dog;
 const m=mesh(GEO['lk_'+id],a.xr&&typeof xrMat==='function'?xrMat(MATT):MATT);if(a.xr)m.renderOrder=5;m.castShadow=true;   /* 캐릭터 실루엣(xray)과 같은 스텐실 → 모자 밑 머리가 비쳐 보이지 않게 */
 m.position.set(0,F.y,F.z);m.scale.setScalar(F.s);m.userData.hat=1;
 if(typeof PV_L!=='undefined')m.layers.enable(PV_L);head.add(m);a._hat=m}
/* ---------- 모델(아이콘 그림 + 머리에 쓰는 모자) ---------- */
function bfTwoSide(g){g=g.index?g.toNonIndexed():g.clone();const P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color;const f=g.clone(),fp=f.attributes.position,fn=f.attributes.normal,fc=f.attributes.color;
 for(let i=0;i<P.count;i+=3)for(const [a,b] of [[i+1,i+2],[i+2,i+1]]){fp.setXYZ(a,P.getX(b),P.getY(b),P.getZ(b));if(N)fn.setXYZ(a,-N.getX(b),-N.getY(b),-N.getZ(b));if(C)fc.setXYZ(a,C.getX(b),C.getY(b),C.getZ(b))}
 for(let i=0;i<P.count;i+=3)if(N)fn.setXYZ(i,-N.getX(i),-N.getY(i),-N.getZ(i));return[g,f]}
function bfVC(g,fn){g=g.index?g.toNonIndexed():g;const P=g.attributes.position,c=new Float32Array(P.count*3),C=new THREE.Color();for(let i=0;i<P.count;i++){fn(C,P.getX(i),P.getY(i),P.getZ(i));C.convertSRGBToLinear();c[i*3]=C.r;c[i*3+1]=C.g;c[i*3+2]=C.b}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g}
function bfBolt(col,s,pos,rz=0){const sh=new THREE.Shape();sh.moveTo(.02,.5);sh.lineTo(-.24,-.02);sh.lineTo(-.02,-.02);sh.lineTo(-.12,-.5);sh.lineTo(.24,.08);sh.lineTo(.02,.08);sh.lineTo(.12,.5);sh.lineTo(.02,.5);
 const g=new THREE.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:false});g.translate(0,0,-.01);return pt(g,col,pos,[0,0,rz],[s,s,1])}
function bfModels(){const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);GEO[k]=g;return g};
 /* 캔(가는 음료 캔 0.62m): 몸통 색 + 띠 + 번개 + 뚜껑 */
 const can=(body,band,bolt,extra)=>{const p=[pt(cyl(.2,.2,.5,24),body,[0,.31,0]),pt(cyl(.2,.18,.05,24),0xc9d0d8,[0,.585,0]),pt(cyl(.18,.2,.05,24),0xc9d0d8,[0,.035,0]),pt(cyl(.165,.165,.012,24),0xb3bcc6,[0,.612,0]),
  pt(cyl(.205,.205,.15,24),band,[0,.3,0]),pt(lkRb(.09,.02,.05,.01,.004),0xdfe5ea,[.03,.622,.05]),pt(cyl(.025,.025,.02,10),0x9aa3ad,[-.03,.624,-.02])];
  p.push(bfBolt(bolt,.36,[0,.31,.21]),bfBolt(bolt,.36,[0,.31,-.21],Math.PI));if(extra)extra(p);return p};
 put('lk_drink_mild',can(0x5cc9a7,0xf4f1ea,0x2f9e7c,p=>{for(const a of[.6,2.2,3.8,5.4])p.push(pt(new THREE.SphereGeometry(.03,8,6),0xf4f1ea,[Math.sin(a)*.2,.47,Math.cos(a)*.2],0,[1,1,.4]))}));
 put('lk_drink_strong',can(0x2b2b30,0xe0533f,0xffd34a,p=>{for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.push(pt(cone(.05,.14,4),i%2?0xf28c38:0xffd34a,[Math.sin(a)*.2,.44,Math.cos(a)*.2],[0,a,0]))}}));
 /* 보드카: 얼음빛 유리병 + 흰 라벨(파란 띠·눈송이) + 빨간 뚜껑 */
 {const p=[pt(cyl(.2,.2,.5,24),0xdcecf3,[0,.27,0]),pt(cyl(.13,.2,.16,24),0xdcecf3,[0,.6,0]),pt(cyl(.07,.1,.2,18),0xdcecf3,[0,.77,0]),pt(cyl(.075,.075,.1,18),0xd8443a,[0,.92,0]),pt(cyl(.08,.08,.02,18),0xb93a32,[0,.87,0]),
   pt(cyl(.203,.203,.24,24),0xf7f3ea,[0,.3,0]),pt(cyl(.205,.205,.04,24),0x3f7fd0,[0,.43,0]),pt(cyl(.205,.205,.03,24),0x3f7fd0,[0,.19,0]),pt(cyl(.19,.19,.02,24),0xb9d6e4,[0,.03,0])];
  for(let i=0;i<3;i++)p.push(pt(lkRb(.15,.022,.012,.008,.004),0x3f7fd0,[0,.31,.205],[0,0,i*Math.PI/3]));p.push(pt(new THREE.SphereGeometry(.022,8,6),0x3f7fd0,[0,.31,.215]));
  for(const a of[1.2,3.4,5])p.push(pt(new THREE.SphereGeometry(.04,8,6),0xffffff,[Math.sin(a)*.19,.6+Math.cos(a)*.03,Math.cos(a)*.19],0,[1,.6,.5]));put('lk_vodka',p)}
 /* --- 모자(머리 가운데 기준, 머리 반지름 약 0.45, 정면 +z) --- */
 /* 강탈 모자: 검은 삼각 해적 모자 + 금 테 + 금화 */
 {const p=[],B=0x2b2b33,G=0xe2b13c;p.push(pt(cyl(.32,.36,.3,20),B,[0,.4,0]),pt(new THREE.SphereGeometry(.32,20,8,0,Math.PI*2,0,Math.PI/2),B,[0,.55,0],0,[1,.42,1]),pt(cyl(.365,.365,.07,20),0x9b2c2c,[0,.29,0]));
  const ring=new THREE.RingGeometry(.3,.7,60,4);ring.rotateX(-Math.PI/2);const RP=ring.attributes.position,edge=[];
  for(let i=0;i<RP.count;i++){const x=RP.getX(i),z=RP.getZ(i),r=Math.hypot(x,z),th=Math.atan2(x,z),lift=.5-.5*Math.cos(3*th),R=.62+.08*(.5+.5*Math.cos(3*th)),t=clamp((r-.3)/.4,0,1),rr=.3+t*(R-.3);
   RP.setXYZ(i,Math.sin(th)*rr,.26+Math.pow(t,1.4)*.27*lift-(1-lift)*t*.04,Math.cos(th)*rr)}
  ring.computeVertexNormals();p.push(...bfTwoSide(pt(ring,B)));
  const N=90;for(let i=0;i<N;i++){const th=i/N*Math.PI*2,lift=.5-.5*Math.cos(3*th),R=.62+.08*(.5+.5*Math.cos(3*th));edge.push(new THREE.Vector3(Math.sin(th)*R,.26+.27*lift-(1-lift)*.04,Math.cos(th)*R))}
  p.push(pt(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge,true),120,.022,5,true),G));
  p.push(pt(cyl(.075,.075,.025,20),G,[0,.33,.66],[Math.PI/2-.3,0,0]),pt(cyl(.05,.05,.03,16),0xf3cd5a,[0,.335,.665],[Math.PI/2-.3,0,0]));
  for(const [x,y,z] of [[-.12,.62,-.05],[-.2,.72,-.12],[-.26,.83,-.2]])p.push(pt(new THREE.SphereGeometry(.07,10,8),0xd8443a,[x,y,z],0,[.6,1.3,.6]));
  put('lk_hat_plunder',p,50)}
 /* 나무꾼 모자: 빨강·검정 체크 털모자 + 크림 털 테 + 귀덮개 */
 {const PL=(C,x,y,z)=>{const a=Math.atan2(x,z),u=Math.floor((a+Math.PI)/(Math.PI*2)*10),v=Math.floor((y+.2)/.11);C.setHex((u+v)%2?0xc8402f:(u%2?0x3a2626:0xa8342a))};
  const dome=bfVC(pt(new THREE.SphereGeometry(.47,22,10,0,Math.PI*2,0,Math.PI/2),0xffffff,[0,.12,0],0,[1,.78,1.02]),PL),p=[dome];
  const fur=0xf1e3c8;p.push(pt(new THREE.TorusGeometry(.47,.07,8,28),fur,[0,.12,0],[Math.PI/2,0,0],[1,1.02,1]));
  for(const s of[-1,1]){p.push(bfVC(pt(lkRb(.08,.36,.36,.05,.03),0xffffff,[s*.47,-.03,-.02],[0,0,s*.1]),PL),pt(lkRb(.1,.07,.38,.03,.02),fur,[s*.49,-.2,-.02],[0,0,s*.1]))}
  p.push(pt(lkRb(.56,.14,.08,.05,.03),fur,[0,.24,.43],[-.5,0,0]),pt(new THREE.SphereGeometry(.07,12,8),0x3a2626,[0,.5,0]));
  put('lk_hat_lumber',p,45)}
 /* 전투 모자: 국방색 철모(얼룩) + 고글 + 턱끈 */
 {const shell=bfVC(pt(new THREE.SphereGeometry(.52,22,11,0,Math.PI*2,0,Math.PI*.52),0xffffff,[0,.1,0],0,[1,.8,1.05]),(C,x,y,z)=>{const n=Math.sin(x*9+z*4)+Math.sin(z*8-y*7)+Math.sin(y*10+x*5);C.setHex(n>1.1?0x46512c:n<-1.2?0x7d8456:0x5f6d3d)});
  const p=[shell,pt(cyl(.545,.56,.05,26),0x4f5a33,[0,.09,0],0,[1,1,1.05])];
  p.push(pt(new THREE.TorusGeometry(.5,.025,6,28),0x2f3326,[0,.26,0],[Math.PI/2,0,0],[1,1.06,1]));
  for(const s of[-1,1])p.push(pt(cyl(.1,.1,.06,18),0x2f3326,[s*.13,.33,.47],[Math.PI/2-.35,0,0]),pt(cyl(.075,.075,.065,18),0xf2b84a,[s*.13,.335,.475],[Math.PI/2-.35,0,0]));
  p.push(pt(lkRb(.08,.05,.05,.02,.01),0x2f3326,[0,.33,.5],[-.35,0,0]));
  for(const s of[-1,1])p.push(pt(lkRb(.035,.36,.04,.015,.008),0x5a4a30,[s*.46,-.08,.05],[0,0,s*.08]));
  put('lk_hat_combat',p,40)}
 /* 호박 모자: 골이 진 주황 호박 + 웃는 얼굴(노란 불빛) + 꼭지·덩굴·잎 */
 {const body=new THREE.SphereGeometry(.34,28,16),BP=body.attributes.position;for(let i=0;i<BP.count;i++){const x=BP.getX(i),y=BP.getY(i),z=BP.getZ(i),a=Math.atan2(x,z),k=1-.08*Math.pow(Math.abs(Math.sin(a*4)),.6);BP.setXYZ(i,x*k,y*.8,z*k)}body.computeVertexNormals();
  const bd=bfVC(pt(body,0xffffff,[0,.62,0]),(C,x,y,z)=>{const a=Math.atan2(x,z-0),g=Math.pow(Math.abs(Math.sin(a*4)),.6);C.setHex(0xf28c38).lerp(new THREE.Color(0xd2601f),1-g)});const p=[bd];
  const Y=0xffc94a,face=(s,pos,rz,sx=1,sy=1)=>{const g=new THREE.CircleGeometry(s,3);p.push(pt(g,Y,pos,[-.18,0,rz],[sx,sy,1]))};
  face(.07,[-.12,.68,.318],Math.PI/2+.0,1,1);face(.07,[.12,.68,.318],Math.PI/2,1,1);face(.035,[0,.6,.33],-Math.PI/2,1,1);
  {const sh=new THREE.Shape();sh.moveTo(-.19,.02);for(let i=0;i<=6;i++){const x=-.19+i*.0633;sh.lineTo(x,i%2?-.035:.0)}sh.lineTo(.19,.02);sh.quadraticCurveTo(0,-.16,-.19,.02);p.push(pt(new THREE.ShapeGeometry(sh),Y,[0,.53,.322],[-.3,0,0]))}
  p.push(pt(cyl(.035,.055,.16,8),0x5b6b2e,[.01,.94,0],[.15,0,.1]),pt(new THREE.TorusGeometry(.07,.012,5,14,Math.PI*1.4),0x6f8a36,[.09,.9,.02],[0,.4,0]));
  {const lf=new THREE.Shape();lf.moveTo(0,0);lf.quadraticCurveTo(.09,.06,0,.17);lf.quadraticCurveTo(-.09,.06,0,0);p.push(...bfTwoSide(pt(new THREE.ShapeGeometry(lf),0x7cae4a,[-.05,.9,.02],[-1.1,.6,.3])))}
  put('lk_hat_pumpkin',p,40)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{bfModels()}catch(e){console.error('buffs: 56차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
