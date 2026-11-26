/* ===== 82차(규칙, 기획자 11-25 22:07·22:31) =====
   ① 보석 5종(루비·사파이어·에메랄드·자수정·다이아몬드): 바위 말고 광물(겨울 섬·동굴)을 다 캐서 부술 때마다 1% 확률로 아무거나 1개.
   ② 1차 재료 삭제(기획자: '광석류나 나무·돌 빼고 화약·고철·회로기판·철판·전구·나무판·건전지·방수포·금속부품 등 과감히'):
      + 플라스틱·시멘트·물병·빈병. 들어가던 설치 재료·제작법은 나무·돌·광석(석탄·철·구리)으로 바꿔요. 예전 저장은 dropRemoved가 치워요.
   ③ 버린 아이템 = 보따리 모양, 자석처럼 따라오지 않고 바짝 붙어 [줍기]를 눌러야 주워요(적이 떨어뜨린 것도 같아요).
   ④ 집 업그레이드 키트 셋 — 2층 증축 키트(집 → 2층 집: 바깥 2층·안 더 넓게·구역 넓이 1.5배) · 전기 배선 키트(구역 안 발전기 전기를 받음) ·
      전력 증설 키트(배선 뒤, 집에 기름을 넣어 두면 최대 전력 30 → 100). 작업대 창 오른쪽에서 키트를 넣고 업그레이드, 증설 뒤에는 기름 칸.
   ⑤ 전기: 발전기(밖에만)에 기름 1통 = 실제 4시간(6통까지). 기름이 든 발전기 하나 = 전력 30, 내 집 구역 안에 있어야 그 집에 들어와요.
      전기가 필요한 것(가로등 4·랜턴 가로등 3·82차 전기 장식): 구역 안(또는 그 집 안)에서 전력이 남는 만큼 놓은 순서대로 켜져요.
   숫자는 임시(PW82·GEM82). 멀티 서버는 전기·업그레이드 키트를 아직 몰라요(서버 마무리 때). */

/* ---------- ① 보석 ---------- */
const GEM82={p:.01,ids:['gem_ruby','gem_sapphire','gem_emerald','gem_amethyst','gem_diamond']};
Object.assign(ITEMS,{
 gem_ruby:{n:'루비',ic:'gm82_ruby',ty:'res',p:3000,rare:1,nov:1,d:'붉게 빛나는 보석. 광물을 캘 때 아주 드물게(1%) 나와요 (가격 임시)'},
 gem_sapphire:{n:'사파이어',ic:'gm82_sapphire',ty:'res',p:3000,rare:1,nov:1,d:'바다처럼 파란 보석. 광물을 캘 때 아주 드물게(1%) 나와요 (가격 임시)'},
 gem_emerald:{n:'에메랄드',ic:'gm82_emerald',ty:'res',p:3000,rare:1,nov:1,d:'숲처럼 초록빛 보석. 광물을 캘 때 아주 드물게(1%) 나와요 (가격 임시)'},
 gem_amethyst:{n:'자수정',ic:'gm82_amethyst',ty:'res',p:2000,rare:1,nov:1,d:'보랏빛 수정 덩어리. 광물을 캘 때 아주 드물게(1%) 나와요 (가격 임시)'},
 gem_diamond:{n:'다이아몬드',ic:'gm82_diamond',ty:'res',p:6000,rare:1,nov:1,d:'가장 단단하고 반짝이는 보석. 광물을 캘 때 아주 드물게(1%) 나와요 (가격 임시)'}});
function gem82Drop(o){const id=GEM82.ids[(Math.random()*GEM82.ids.length)|0],it=ITEMS[id];give(id,1);GEM82.last=id;
 const y=(o.cave?(o.y||INT.y):groundY(o.x,o.z))+2.4;ftext(o.x,y,o.z,'💎 '+it.n+'!','#ff9ee6');toast(`💎 ${jo(it.n,'을','를')} 찾았어요! (광물 1% 행운)`);jingle([784,988,1319,1568]);if(typeof buzz==='function')buzz(40);hudDirty=true}
{const _ia=interact;interact=function(){const t=target,o=t&&t.k==='o'?t.o:null,was=o?o.re:0,r=_ia.apply(this,arguments);try{if(o&&o.ore&&o.re>0&&!(was>0)&&Math.random()<GEM82.p)gem82Drop(o)}catch(e){console.error(e)}return r}}

/* ---------- ② 1차 재료 삭제 ---------- */
const GONE82={powder:'화약',scrap:'고철',pcb:'회로기판',splate:'철판',bulb:'전구',plank:'나무판',aabatt:'건전지',tarp:'방수포',mparts:'금속부품',plastic:'플라스틱',cement:'시멘트',wbottle:'물병',ebottle:'빈병'};
const SUB82={scrap:['stone',1],powder:['coal',1],pcb:['copper',1],splate:['ore_iron',2],bulb:['copper',1],plank:['wood',1],aabatt:['copper',1],tarp:['wood',2],mparts:['ore_iron',1],plastic:['stone',1],cement:['stone',2],wbottle:null,ebottle:null};
function sub82(c){if(!c)return c;const o={};for(const k in c){const s=SUB82[k];if(s===undefined){o[k]=(o[k]||0)+c[k];continue}if(s)o[s[0]]=(o[s[0]]||0)+c[k]*s[1]}if(!Object.keys(o).length)o.wood=2;return o}
for(const k in GONE82)delete ITEMS[k];Object.assign(REMOVED.n,GONE82);
for(const t in BUILDS){const b=BUILDS[t];if(b.c&&Object.keys(b.c).some(k=>k in GONE82))b.c=sub82(b.c);if(b.upg&&b.upg.c&&Object.keys(b.upg.c).some(k=>k in GONE82))b.upg.c=sub82(b.upg.c)}
for(const t in REMOVED.c){if(Object.keys(REMOVED.c[t]).some(k=>k in GONE82))REMOVED.c[t]=sub82(REMOVED.c[t])}
for(const k in ENEMY){const L=ENEMY[k].loot;if(!L)continue;ENEMY[k].loot=L.map(([id,n,p])=>{if(!(id in GONE82))return ITEMS[id]||id==='coin'?[id,n,p]:null;const s=SUB82[id];return s?[s[0],Math.max(1,Math.round(n*s[1]*.6)),p*.8]:null}).filter(Boolean)}
if(typeof SHOP!=='undefined'&&SHOP.sell)SHOP.sell=SHOP.sell.filter(k=>ITEMS[k]);
{const L=LOOT.map(([id,a,b])=>{if(ITEMS[id])return[id,a,b];const q=SUB82[id];return q&&ITEMS[q[0]]?[q[0],a,b]:null}).filter(Boolean);LOOT.length=0;LOOT.push(...L)}   /* 보급 상자 무작위 표: 화약 → 석탄 */
/* 제작법: 사라진 재료는 바꾸고, 사라진 것을 만드는 제작법은 빼요. 총 = 개머리판 · 총 키트 · 포신(금속부품 줄 없음) */
{const FIX={kit_fgarden:{wood:2,stone:1},kit_fwhite:{wood:1,stone:2},kit_fconc:{stone:6},kit_gconc:{stone:8},grenade:{stone:2,coal:2},turret_auto:{kit_turret:1,copper:1,rifle:1,ore_iron:1,ore_ti:1}};
 const L=RECIPES.slice();RECIPES.length=0;
 for(const r of L){if(!ITEMS[r.id])continue;if(r.pat){r.pat=r.pat.filter(row=>!row.every(k=>!k||k in GONE82)).map(row=>row.map(k=>k in GONE82?null:k));const c={};for(const row of r.pat)for(const k of row)if(k)c[k]=(c[k]||0)+1;r.c=c}
  else r.c=FIX[r.id]||sub82(r.c);if(Object.keys(r.c).some(k=>!ITEMS[k]))continue;RECIPES.push(r)}
 const seen={};for(const r of RECIPES){if(r.pat)continue;const k=crKey(r.c);if(seen[k])console.error('82차 제작법 재료가 같아요:',seen[k],r.id);seen[k]=r.id}}
/* 보급 상자: 사라진 고철·화약 대신 광석이 조금 */
{const _lg=lootGen;lootGen=function(s){const g=_lg.apply(this,arguments),d=sdef(s);if(d&&d.loot>=1&&d.loot<=4){const add=(k,n)=>{if(ITEMS[k])g[k]=(g[k]||0)+n};
  if(Math.random()<.55)add('coal',2+(Math.random()*3|0));if(Math.random()<.45)add('ore_iron',1+(Math.random()*3|0));if(Math.random()<.3)add('copper',1+(Math.random()*2|0))}return g}}

/* ---------- ③ 보따리 · 직접 줍기 ---------- */
const BND82={reach:1.25};
function bnd82Near(){let best=null,bd=BND82.reach;for(const d of drops){const g=dist(d.x,d.z,P.x,P.z);if(g<bd){bd=g;best=d}}return best}
{const _ft=findTarget;findTarget=function(){const t=_ft.apply(this,arguments);if(bmode||P.dead||INT.on||(typeof RIDE!=='undefined'&&RIDE&&RIDE.on))return t;const d=bnd82Near();if(!d)return t;
  const dg=dist(d.x,d.z,P.x,P.z);if(t&&t.k!=='drop'&&typeof t.gap==='number'&&t.gap<dg-.5)return t;const n=Object.keys(d.items).length;return{k:'drop',d,key:'drop',x:d.x,z:d.z,lab:n>1?`보따리 줍기 (${n}가지)`:'보따리 줍기',rr:1.0,gap:dg}}}
{const _ia=interact;interact=function(){const t=target;if(!(t&&t.k==='drop'))return _ia.apply(this,arguments);const d=t.d;if(!drops.includes(d))return;if(!inp.actEdge&&!inp.act)return;
  if(typeof bagFits==='function'&&!bagFits(d.items)){bagFullMsg();return}let j=0;for(const k in d.items){if(k!=='coin'&&!ITEMS[k])continue;give(k,d.items[k]);ftext(d.x,groundY(d.x,d.z)+2+j++*.55,d.z,`+${d.items[k]} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffe08a')}
  sfx(880,.06);sfx(660,.05,'sine',.03);if(P.a)P.a.play('PickUp',{once:1,lock:.45,force:1});scene.remove(d.m);drops.splice(drops.indexOf(d),1);target=null;hudDirty=true}}
if(typeof sLabel!=='undefined'){}   /* 보따리는 구조물이 아니라 findTarget에서 이름표를 만들어요 */

/* ---------- ④⑤ 기름 · 발전기 · 전기 ---------- */
const PW82={per:4*3600e3,genCap:6,houseCap:12,gen:30,wire:30,max:100,t:0};
if(ITEMS.fuel){ITEMS.fuel.n='기름';ITEMS.fuel.d='기름통. 발전기나 전력 증설한 집(작업대 기름 칸)에 넣어요. 1통 = 4시간'}
if(BUILDS.gen)Object.assign(BUILDS.gen,{d:'기름을 넣으면 4시간 동안 전력 30을 만들어요(6통까지). 내 집 구역 안에 두면 전기 배선한 집에 전기가 들어가요. 밖에만 놓아요'});
if(BUILDS.lamp)BUILDS.lamp.elec=4;if(BUILDS.lamp2)BUILDS.lamp2.elec=3;
for(const t of['lamp','lamp2'])if(BUILDS[t])BUILDS[t].d='밤에 켜져요. 전기 4 필요(전기 배선한 집 구역 안 + 기름 든 발전기)'.replace('4',BUILDS[t].elec);
const pwLeft=ms=>{const m=Math.max(0,Math.round(ms/60000));return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`};
/* 발전기: 실제 시간으로 */
{const _sl=sLabel;sLabel=function(s){if(s.t==='gen'){const l=(s.fe||0)-Date.now(),n=Math.ceil(Math.max(0,l)/PW82.per);if(n>=PW82.genCap)return`⚡ ${pwLeft(l)} 남음`;return invN('fuel')>0?(l>0?`기름 넣기 · ${pwLeft(l)} 남음`:'기름 넣기'):(l>0?`⚡ ${pwLeft(l)} 남음`:'기름 필요')}
  const d=sdef(s);if(d&&d.elec&&!d.loot){const v=_sl(s);if(v)return v;if(s.in&&s.hk!==curHK())return null;return s.pw?null:'⚡ 전기 필요'}return _sl(s)}}
{const _ia=interact;interact=function(){const t=target;if(!(t&&t.k==='s'&&t.s&&t.s.t==='gen'))return _ia.apply(this,arguments);if(!inp.actEdge)return;const s=t.s,now=Date.now(),l=Math.max(0,(s.fe||0)-now),room=PW82.genCap-Math.ceil(l/PW82.per);
  if(!invN('fuel')){toast('발전기에는 기름을 넣어요. 자판기에서 살 수 있어요');sfx(240,.06,'square',.03);return}if(room<=0){toast('기름이 가득 찼어요');return}
  take('fuel',1);s.fe=Math.max(now,s.fe||0)+PW82.per;s.fuel=(s.fe-now)/1000;sfx(300,.1,'square',.04);ftext(s.x,groundY(s.x,s.z)+2.2,s.z,`⛽ ${pwLeft(s.fe-now)}`,'#ffe08a');pw82Solve();save();hudDirty=true}}
function pw82Homes(){return structs.filter(s=>(s.t==='phouse'||s.t==='phouse2')&&!s.in&&s.own)}
function pw82Solve(){const now=Date.now();for(const s of structs){const d=sdef(s);if(d&&d.elec)s.pw=0;if(s.t==='gen'){if((s.fe||0)<=now&&s.fuel>0&&!s.fe)s.fe=now+s.fuel*1000;s.fuel=Math.max(0,((s.fe||0)-now)/1000)}}
 for(const h of pw82Homes()){if(!(h.el>0)){h.pwS=null;continue}const z=zoneRect(h.x,h.z,h.r,h.t),hk=homeKey(h);
  const gens=structs.filter(g=>g.t==='gen'&&!g.in&&(g.fe||0)>now&&zoneIn(z,g.x,g.z,0)),cap=h.el>=2&&(h.oil||0)>now?PW82.max:PW82.wire,sup=Math.min(cap,gens.length*PW82.gen);
  const users=structs.filter(s=>{const d=sdef(s);return d&&d.elec&&s!==h&&(s.in?s.hk===hk:zoneIn(z,s.x,s.z,0))});let use=0;
  for(const s of users){const e=sdef(s).elec;if(use+e<=sup){use+=e;s.pw=1}}
  h.pwS={cap,sup,use,gens:gens.length,need:users.reduce((a,s)=>a+sdef(s).elec,0),n:users.length,on:users.filter(s=>s.pw).length}}}
/* 켜짐: 가로등 불빛(밤 + 전기), 82차 전기 장식 빛나는 조각 */
{const _as=addStruct;addStruct=function(s){const r=_as.apply(this,arguments);try{const d=r&&sdef(r);if(d&&d.elec&&r.m){const gl=r.m.children.find(c=>PLAMPS.includes(c));if(gl){PLAMPS.splice(PLAMPS.indexOf(gl),1);r.pwGl=gl;gl.visible=false}}}catch(e){console.error(e)}return r}}
function pw82Apply(){const dk=dark()>.3;for(const s of structs){const d=sdef(s);if(!d||!d.elec)continue;const on=!!s.pw;
  if(s.pwGl)s.pwGl.visible=on&&dk&&(!s.in||s.m.visible);if(d.lamp){const i=lightsrc.indexOf(s);if(on&&i<0)lightsrc.push(s);else if(!on&&i>=0)lightsrc.splice(i,1)}
  if(s.lk&&s.lk.parts&&s.lk.parts.gl)s.lk.parts.gl.visible=on}}
{const _ue=updEnv;updEnv=function(dt){_ue.apply(this,arguments);if(mode!=='play')return;PW82.t-=dt;if(PW82.t<=0){PW82.t=.5;try{pw82Solve()}catch(e){console.error(e)}}try{pw82Apply()}catch(e){}}}

/* ---------- ④ 업그레이드 키트 ---------- */
Object.assign(ITEMS,{
 kit_floor2:{n:'2층 증축 키트',ic:'h82_kit_floor2',ty:'res',p:8000,d:'집 안 작업대에 넣고 업그레이드하면 2층 집이 돼요. 안이 더 넓어지고 바깥 구역도 넓어져요 (가격 임시)'},
 kit_wiring:{n:'전기 배선 키트',ic:'h82_kit_wiring',ty:'res',p:4000,d:'집 안 작업대에 넣고 업그레이드하면 집 구역 안 발전기의 전기를 받아 가로등·전기 장식을 켤 수 있어요 (가격 임시)'},
 kit_power:{n:'전력 증설 키트',ic:'h82_kit_power',ty:'res',p:6000,d:'전기 배선한 집에 넣으면 받을 수 있는 전력이 30 → 최대 100. 작업대 기름 칸에 기름을 넣어 둬야 해요(1통 = 4시간) (가격 임시)'}});
BUILDS.phouse2={n:'2층 집',g:'phouse2',s:1,bx:3.0,bz:3.2,hp:900,c:{wood:120},kit:'kit_tent',home:1,fixR:1,foot:[2.9,2.6],tilt:.1,room:'house2',hide:1,d:'2층으로 증축한 통나무 집. 안이 더 넓고 바깥 구역도 넓어요'};   /* 83차(기획자: '외부는 집이 엄청 이상해'): 집보다 넓은 약 6×6.4m 2층 통나무 집(앞 발코니·현관), 모델은 미터 그대로(s 1) */
/* 83차 2층 집 모양 치수: 몸채 반폭 W·반깊이 D·가운데 z ZC, 기단 Y0, 통나무 반지름 LR·간격 LS, 1층 N1·2층 N2 줄, 층 사이 띠 BAND, 앞 현관 끝 PZ */
const H83={W:2.7,D:2.05,ZC:-.45,Y0:.42,LR:.15,LS:.285,N1:8,N2:6,BAND:.16,PZ:2.95,BD:.95};   /* BD: 발코니 깊이(얕게 해서 1층 문이 보이게) */
ZONE_K.phouse2=Math.sqrt(1.5);
INT_ROOM.house2={hw:5.2,hd:4.0,lc:0xfff0dc,ld:13,li:1.4,cor:[1.05,1.7]};
const H82={stair:[-2.95,-3.52,2.3,.5]};   /* 2층 집 안 계단(지역 x, z 가운데, 반폭, 반깊이) — 83차: 뒤 벽을 따라 오른쪽에서 왼쪽 구석으로 올라가요(앞에서 옆모습이 보이게), 걸어서 못 지나가요 */
const H82UP=[{k:'floor2',kit:'kit_floor2',ic:'🏠',n:'2층 증축',d:'집이 2층이 되고 안이 더 넓어져요. 바깥 구역도 넓이 1.5배'},
 {k:'wiring',kit:'kit_wiring',ic:'⚡',n:'전기 배선',d:'구역 안 발전기의 전기를 받아요(최대 전력 30)'},
 {k:'power',kit:'kit_power',ic:'🔋',n:'전력 증설',d:'받을 수 있는 전력 최대 100 — 기름 칸에 기름을 넣어 둬요'}];
const h82Done=(s,k)=>k==='floor2'?s.t==='phouse2':k==='wiring'?(s.el||0)>=1:(s.el||0)>=2;
const h82Home=()=>{const s=typeof homeIn==='function'?homeIn():null;return s&&(s.t==='phouse'||s.t==='phouse2')?s:null};
const h82Hit=(s,to)=>{const q=zoneRect(s.x,s.z,s.r,to);return structs.find(o=>o!==s&&isZoneT(o.t)&&!o.in&&zoneOverlap(q,zoneRect(o.x,o.z,o.r,o.t)))||null};
{const _uc=upCard;upCard=function(){const s=h82Home();if(!s)return _uc.apply(this,arguments);const hd='<div class="sec" style="margin-top:0">⬆ 업그레이드</div>',now=Date.now();
  const rows=H82UP.map(u=>{const done=h82Done(s,u.k),need=u.k==='power'&&!(s.el>=1),have=invN(u.kit)>0,ic=ICON[u.kit]?`<img src="${ICON[u.kit]}" style="width:40px;height:40px">`:`<span class="upe">${u.ic}</span>`;
   return`<div class="upr">${ic}<div class="grow"><div class="upl"><b>${u.ic} ${u.n}</b><span>${done?'✔ 했어요':need?'배선 먼저':have?'키트 있음':'키트 없음'}</span></div><small>${u.d}${done?'':' · '+ITEMS[u.kit].n+' 1개'}</small></div></div>`+
    (done?'':`<div class="upbtns"><button class="btn" data-a="h82up" data-k="${u.k}" ${have&&!need?'':'disabled'}>⬆ 키트 넣고 업그레이드</button></div>`)}).join('');
  let pw='';if(s.el>=1){const S2=s.pwS||{cap:PW82.wire,sup:0,use:0,gens:0,need:0,n:0,on:0};pw=`<div class="upr"><span class="upe">⚡</span><div class="grow"><div class="upl"><b>전력</b><span>${S2.use} / ${S2.sup} (최대 ${S2.cap})</span></div><div class="upbar"><i style="width:${S2.sup?(S2.use/S2.sup*100).toFixed(0):0}%"></i></div><small>구역 안 기름 든 발전기 ${S2.gens}대 · 전기 쓰는 것 ${S2.on}/${S2.n}개 켜짐${S2.need>S2.sup?' · 전력이 모자라요':''}</small></div></div>`}
  let oil='';if(s.el>=2){const l=Math.max(0,(s.oil||0)-now),n=Math.ceil(l/PW82.per),inv=invN('fuel'),can=inv>0&&n<PW82.houseCap;
   oil=`<div class="upr">${ICON.fuel?`<img src="${ICON.fuel}" style="width:40px;height:40px">`:'<span class="upe">🛢</span>'}<div class="grow"><div class="upl"><b>🛢 기름 칸</b><span>${l>0?pwLeft(l)+' 남음':'비었어요'}</span></div><div class="upbar"><i style="width:${(Math.min(1,l/(PW82.houseCap*PW82.per))*100).toFixed(1)}%"></i></div><small>기름 1통 = 4시간 · ${PW82.houseCap}통까지 · 가방에 ${inv}통${l>0?' · 지금 최대 전력 100':' · 비면 최대 전력 30'}</small></div></div>
    <div class="upbtns"><button class="btn g" data-a="h82oil" data-n="1" ${can?'':'disabled'}>1통 넣기</button><button class="btn g" data-a="h82oil" data-n="99" ${can?'':'disabled'}>전부 넣기</button></div>`}
  return hd+`<div class="upc"><div class="upn">🏠 ${sdef(s).n}</div>${rows}${pw}${oil}</div>`}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="h82up"],[data-a="h82oil"]');if(!b||b.disabled||panel!=='bench')return;const s=h82Home();if(!s)return;
 if(b.dataset.a==='h82oil'){const now=Date.now();let n=+b.dataset.n,k=0;while(k<n&&invN('fuel')>0&&Math.ceil(Math.max(0,(s.oil||0)-now)/PW82.per)<PW82.houseCap){take('fuel',1);s.oil=Math.max(now,s.oil||0)+PW82.per;k++}
  if(k){sfx(300,.08,'square',.04);toast(`🛢 기름 ${k}통을 넣었어요 · ${pwLeft(s.oil-now)} 남음`);pw82Solve();save()}hudDirty=true;return}
 const u=H82UP.find(q=>q.k===b.dataset.k);if(!u||h82Done(s,u.k))return;if(window.MP){toast('멀티에서는 아직 업그레이드할 수 없어요');return}if(!invN(u.kit)){toast(jo(ITEMS[u.kit].n,'이','가')+' 없어요');return}
 if(u.k==='power'&&!(s.el>=1)){toast('전기 배선을 먼저 해요');return}
 if(u.k==='floor2'){const hit=h82Hit(s,'phouse2');if(hit){toast('넓어진 구역이 옆 구역과 겹쳐요. 2층으로 올릴 수 없어요');return}const why=h83Why(s);if(why){toast(why);return}take(u.kit,1);h82Floor2(s);return}
 take(u.kit,1);s.el=u.k==='wiring'?1:2;sfx(520,.08);jingle([523,659,784,1047]);toast(u.k==='wiring'?'⚡ 전기 배선 완료! 구역 안에 발전기를 놓고 기름을 넣으면 전기가 들어와요':'🔋 전력 증설 완료! 기름 칸에 기름을 넣어 두면 최대 전력 100');pw82Solve();save();hudDirty=true});
/* 83차: 2층 집은 집보다 넓어서(약 6×6.4m) 넓어질 자리를 먼저 봐요 — 물가·고르지 않은 땅·설치 금지 원·길·다른 구조물이면 못 올려요. 나무·바위·식물은 지을 때 치워요(h83Clear) */
function h83Box(s){const d=BUILDS.phouse2;return{x:s.x,z:s.z,r:s.r||0,hw:d.bx,b:d.bz,f:d.bz}}
function h83Why(s){const q=h83Box(s),c=Math.cos(q.r),sn=Math.sin(q.r);let lo=9,hi=-9;
 for(let u=-q.hw;u<=q.hw+.01;u+=.5)for(let v=-q.b;v<=q.f+.01;v+=.5){const X=q.x+u*c+v*sn,Z=q.z-u*sn+v*c,h=gridH(X,Z);if(h<lo)lo=h;if(h>hi)hi=h;
  if((Math.abs(u)>q.hw-.6||Math.abs(v)>q.b-.6)&&nobAt(X,Z)){const n=nobAt(X,Z);return`2층 집이 넓어질 자리가 ${NOB_N[n.k]||'설치 금지 구역'}에 걸려요`}
  if(PATHS.length&&pathD(X,Z)<1.7)return'2층 집이 넓어질 자리가 길에 걸려요';if(onDock(X,Z))return'2층 집이 넓어질 자리가 부두에 걸려요'}
 if(lo<.35)return'2층 집이 넓어질 자리에 물가가 걸려요';if(hi-lo>.55)return'2층 집이 넓어질 자리의 땅이 고르지 않아요';
 for(const o of structs){if(o===s||o.in||o.t==='int_exit'||/^pb_/.test(o.t)||isZoneT(o.t))continue;const d=sdef(o);if(!d)continue;
  if(zoneOverlap(q,{x:o.x,z:o.z,r:o.r||0,hw:Math.max(.05,(d.bx||.1)-.02),b:Math.max(.05,(d.bz||.1)-.02),f:Math.max(.05,(d.bz||.1)-.02)}))return`2층 집이 넓어질 자리에 ${jo(d.n||'다른 구조물','이','가')} 있어요. 먼저 치워요`}
 return null}
function h83Clear(s){const q=h83Box(s),c=Math.cos(q.r),sn=Math.sin(q.r),inB=(X,Z,m)=>{const dx=X-q.x,dz=Z-q.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<q.hw+m&&lz>-q.b-m&&lz<q.f+m};let n=0;
 const N=Math.ceil(5/CELL)+1,cx=(q.x/CELL)|0,cz=(q.z/CELL)|0;for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const k=(cz+j)*CN+cx+i,o=objs.get(k);if(!o||o.re>=1e8)continue;if(!inB(o.x,o.z,(OBJT[o.t].r||.5)*.6)){continue}o.re=1e9;o.hp=0;depSet.add(k);try{refreshObj(o)}catch(e){}n++}
 if(typeof PL!=='undefined'&&PL.list)for(const p of PL.list){if(plGone(p)||!inB(p.x,p.z,.3))continue;S.pgone=S.pgone||{};S.pgone[p.i]=PL.RE;plnCol(p);PL.tU=0;n++}return n}
/* 예전(82차) 2층 집도 넓어진 자리의 나무·바위가 안 보이게 */
{const _as=addStruct;addStruct=function(s){const r=_as.apply(this,arguments);try{if(r&&r.t==='phouse2'&&r.own)h83Clear(r)}catch(e){console.error('83차 2층 집 자리',e)}return r}}
function h82Floor2(s){closePanel();joyEnd();P.auto=null;HUP.on=true;busy=true;const T=3800,f=$('respawn'),bar=$('rsBar'),st=$('rsSt');
 f.classList.add('house','on');f.querySelector('.rsT').textContent='🏠 2층을 올리는 중…';f.querySelector('.rsH').textContent='2층 증축 키트로 집을 넓혀요';bar.style.width='0%';st.textContent='';
 const msgs=[[0,'지붕을 걷어요'],[.3,'2층 통나무를 쌓는 중…'],[.62,'새 지붕을 올려요'],[.86,'발코니를 달아요']];sfx(180,.12,'square',.04);let t0=0,k0=-1;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='',mi=0;msgs.forEach(([a,q],i)=>{if(k>=a){m=q;mi=i}});if(mi!==k0){k0=mi;sfx(220+mi*60,.07,'square',.035)}if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  const inn=INT.on&&INT.s===s;if(!inn)intOut();const ns=addStruct({t:'phouse2',x:s.x,z:s.z,r:s.r,own:1,kit:s.kit,hp:BUILDS.phouse2.hp,el:s.el,oil:s.oil});ns.hk=homeKey(s);removeStruct(s);   /* 83차: 안에서 올리면 그 자리에 그대로(house.js upStay) */
  if(!inn||!upStay(s,ns)){S.home={x:ns.x,z:ns.z+BUILDS.phouse2.bz+1.1};P.x=S.home.x;P.z=S.home.z;P.rot=0;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}st.textContent='다 지었어요!';pw82Solve();save();
  setTimeout(()=>{f.classList.remove('on');busy=false;HUP.on=false;const ix=inn&&INT.on,cx=ix?P.x:ns.x,cz=ix?P.z:ns.z,y=groundY(cx,cz),rr=ix?1.2:2.6;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;puff(cx+Math.cos(a)*rr,y+.5,cz+Math.sin(a)*rr,0xd8c6a2,5,.8)}
   ftext(cx,y+(ix?2.6:7.2),cz,'🏠 2층 집 완성!','#ffe08a');jingle([523,659,784,1047,1319]);toast(ix?'🏠 2층 집이 됐어요! 방이 더 넓어졌고, 바깥 구역도 넓어졌어요':'🏠 2층 집이 됐어요! 안이 더 넓고 바깥 구역도 넓어졌어요');hudDirty=true;setTimeout(()=>f.classList.remove('house'),700)},700)};
 requestAnimationFrame(step)}
/* 2층 집: 문 옆 등불(밤), 창 불빛 */
{const _as=addStruct;addStruct=function(s){const r=_as.apply(this,arguments);try{if(r&&r.t==='phouse2'&&r.m&&GEO.phouse2_glow){r.m.children[0].add(mesh(GEO.phouse2_glow,HGLOW,false));const l=glow(0xffc46a,2.4,.6);l.position.set(.88,H83.Y0+1.54,(H83.ZF||1.76)+.3);l.visible=false;r.m.add(l);PLAMPS.push(l)}}catch(e){console.error(e)}return r}}
/* 2층 집 안: 집 방(28차)을 더 넓게 + 왼쪽 벽 계단(위층으로) */
{const _ib=intBuild;intBuild=function(){const was=!!INT.g;_ib();if(was||!INT.g)return;try{const o=INT.gr.house,R0=INT_ROOM.house;INT_ROOM.house=INT_ROOM.house2;intHouseRoom(INT.g);INT.gr.house2=INT.gr.house;INT.gr.house=o;INT_ROOM.house=R0;
  const H=INT.gr.house2;H.visible=false;H.add(mesh(h82StairGeo()));const R=INT_ROOM.house2;INT.dock.hl=Math.max(INT.dock.hl,R.hd+R.cor[1]+.8);INT.full=Math.max(INT.full,R.hw+1.2)}catch(e){console.error('82차 2층 집 방',e)}}}
{const _iw=intWalk;intWalk=function(x,z,r){const v=_iw.apply(this,arguments);if(v!==null||INT.kind!=='house2')return v;const [sx,sz,hw,hd]=H82.stair,rr=r||.42;return Math.abs(x-INT.x-sx)<hw+rr&&Math.abs(z-INT.z-sz)<hd+rr?true:null}}
/* 83차: 2층 집 안 계단 자리에는 물건을 못 놓아요 */
{const _gp=ghostPos;ghostPos=function(){const pr=_gp.apply(this,arguments);if(!pr||!pr.ok||!pr.in||INT.kind!=='house2')return pr;const b=BUILDS[bmode];if(!b)return pr;const [sx,sz,hw,hd]=H82.stair;
 if(zoneOverlap({x:pr.x,z:pr.z,r:pr.r||0,hw:b.bx,b:b.bz,f:b.bz},{x:INT.x+sx,z:INT.z+sz,r:0,hw:hw+.05,b:hd+.05,f:hd+.05})){pr.ok=false;pr.why='계단과 겹쳐요'}return pr}}
{let ent=0;const _fd=fadeDo;fadeDo=function(msg,cb){if(ent&&msg==='텐트 안으로…'){msg='2층 집 안으로…';ent=0}return _fd(msg,cb)};const _ie=intEnter;intEnter=function(s){ent=sdef(s).room==='house2'?1:0;try{return _ie.apply(this,arguments)}finally{ent=0}}}
/* 83차(기획자: '내부는 계단이 이상하고'): 뒤 벽에 붙은 계단 — 오른쪽(아래)에서 왼쪽 구석(위)으로 12칸. 앞(카메라)에서 톱니 옆모습·흰 계단 벽·작은 수납 문·흰 난간이 보여요 */
function h82StairGeo(){const [sx,sz,hw,hd]=H82.stair,p=[],n=12,H=2.45,x1=sx+hw,x0=-INT_ROOM.house2.hw,t=(x1-x0)/n,rs=H/n,z0=-INT_ROOM.house2.hd,z1=sz+hd,dz=z1-z0,zf=z1;
 const WD=[0xd6a26a,0xc9955e],WD2=0x6e4426,WH=0xa8723f,WH2=0x8f5a33,CR=0xf7f1e6,KN=0xd9b25a;   /* 흰 벽 앞에서 잘 보이게: 계단 몸통은 나무색, 디딤판은 밝은 나무, 난간은 짙은 나무 */
 /* 계단 몸통(흰 벽): 톱니 윗면을 그대로 밀어 낸 덩어리 */
 {const sh=new THREE.Shape();sh.moveTo(x1,0);for(let k=0;k<n;k++){const xa=x1-k*t,y=(k+1)*rs;sh.lineTo(xa,y);sh.lineTo(xa-t,y)}sh.lineTo(x0,0);sh.lineTo(x1,0);
  const g=new THREE.ExtrudeGeometry(sh,{depth:dz-.02,bevelEnabled:false});g.translate(0,0,z0+.01);p.push(pt(g,WH))}
 /* 디딤판(나무, 앞·오른쪽으로 살짝 튀어나옴) + 챌판 밑 그늘 줄 */
 for(let k=0;k<n;k++){const xa=x1-k*t,y=(k+1)*rs;p.push(pt(lkRb(t+.05,.055,dz+.04,.02,.012),WD[k%2],[xa-t/2+.02,y-.02,(z0+z1)/2+.02]));p.push(pt(box(.02,rs-.06,dz-.04),WH2,[xa+.012,y-rs/2-.03,(z0+z1)/2]))}
 /* 앞 옆판(나무 띠, 톱니를 따라 비스듬히) + 바닥 걸레받이 */
 {const a=[x1+.02,.08,zf+.035],b=[x0+.02,H-.1,zf+.035];p.push(lkBeam(a,b,.16,.05,WD2));p.push(pt(box(x1-x0,.09,.03),0x2a2523,[(x1+x0)/2,.045,zf+.02]))}
 /* 계단 밑 수납 문(높은 쪽, 크림 문) */
 {const cx=x0+1.05,hh=1.25;p.push(pt(lkRb(.72,hh+.1,.05,.02,.01),WD2,[cx,hh/2+.05,zf+.03]),pt(lkRb(.6,hh,.05,.02,.01),0xf2e8d2,[cx,hh/2+.05,zf+.05]));for(const y of[.35,.95])p.push(pt(box(.46,.025,.02),0xc9b89a,[cx,y,zf+.08]));p.push(pt(new THREE.SphereGeometry(.035,8,6),KN,[cx+.2,.7,zf+.09]))}
 /* 흰 난간: 칸마다 살 하나, 비스듬한 나무 손잡이, 아래 기둥 */
 const zr=zf-.07,rh=.86;for(let k=0;k<n;k++){const x=x1-k*t-t/2,y=(k+1)*rs;p.push(pt(cyl(.026,.026,rh,6),WD2,[x,y+rh/2,zr]))}
 p.push(lkBeam([x1-t*.5+.12,rs+rh-.02+(rs/t)*.12,zr],[x0+.08,H+rh-.02,zr],.075,.075,WD2));
 p.push(pt(lkRb(.13,1.08,.13,.03,.02),WD2,[x1+.04,.54,zr]),pt(lkRb(.17,.06,.17,.03,.02),CR,[x1+.04,1.1,zr]),pt(new THREE.SphereGeometry(.07,10,8),WD2,[x1+.04,1.19,zr]));
 /* 위 끝: 2층으로 이어지는 짧은 마루 끝 + 기둥(왼쪽 벽에 붙음) */
 p.push(pt(lkRb(.5,.12,dz+.06,.02,.01),WD2,[x0+.25,H+.02,(z0+z1)/2+.02]),pt(lkRb(.11,.95,.11,.03,.02),WD2,[x0+.12,H+.5,zr]));
 return mg(p)}

/* ---------- 모양: 보석 · 보따리 · 키트 · 2층 집 ---------- */
function gm82Lathe(R,seg,cl,sx){const P=[],C=[],v=(i,k)=>{const [r,y]=R[k],a=(i+(k%2)*.5)/seg*Math.PI*2;return[Math.cos(a)*r*(sx||1),y,Math.sin(a)*r]},col=new THREE.Color();
 const tri=(a,b,c,h)=>{P.push(...a,...b,...c);col.setHex(h).convertSRGBToLinear();for(let q=0;q<3;q++)C.push(col.r,col.g,col.b)};
 for(let k=0;k<R.length-1;k++)for(let i=0;i<seg;i++){const a=v(i,k),b=v(i+1,k),c=v(i,k+1),d=v(i+1,k+1),f=cl(k,i);tri(a,b,d,f[0]);tri(a,d,c,f[1])}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g}
function gm82Gem(seg,R,c,sx){const n=R.length;return gm82Lathe(R,seg,(k,i)=>{const t=k/(n-2),gl=(i*7+k*3)%11===0;if(k===n-2)return[c[3],c[3]];const base=t<.45?c[2]:t<.6?c[1]:c[0];return gl?[0xffffff,base]:[base,(i+k)%2?c[1]:base]},sx)}
function gm82Models(){const put=(k,g)=>{g.computeBoundingSphere();GEO[k]=g},tilt=g=>{g.rotateX(-.95);g.scale(1.15,1.15,1.15);g.translate(0,.32,0);return g};
 const BR=[[0,-.36],[.34,-.04],[.4,0],[.4,.04],[.3,.15],[.2,.18],[0,.18]];   /* 둥근 브릴리언트: 아래 뾰족 → 거들 → 윗면 */
 put('gm82_ruby',tilt(gm82Gem(8,BR,[0xff6f86,0xe0334f,0x8f1022,0xff9fb0])));
 put('gm82_sapphire',tilt(gm82Gem(8,[[0,-.32],[.32,-.04],[.38,0],[.38,.05],[.28,.14],[.18,.17],[0,.17]],[0x8fb6ff,0x3366dd,0x182f80,0xb8d0ff],1.25)));
 {const g=gm82Gem(4,[[0,-.26],[.2,-.18],[.38,-.03],[.42,0],[.42,.05],[.36,.12],[.28,.16],[0,.16]],[0x8ff0c0,0x1fb36e,0x0a6a3e,0xb5ffd9],1.3);g.rotateY(Math.PI/4);put('gm82_emerald',tilt(g))}
 put('gm82_diamond',tilt(gm82Gem(12,[[0,-.4],[.38,-.05],[.44,0],[.44,.04],[.33,.15],[.24,.19],[0,.19]],[0xffffff,0xd6eeff,0x8fb8d8,0xffffff])));
 {const p=[pt(lkBoulder(.32,0x8a8796,7,[0,0,0],.5),null)],X=[[0,.0,0,.62,0],[.15,.0,.08,.48,.35],[-.16,0,.06,.44,-.4],[.05,0,-.15,.4,.2],[-.06,0,.16,.32,-.15]];
  for(const [x,y,z,h,a] of X){const r=.075+h*.08,b=[pt(cyl(r,r,h,6),0x9b5de5,[0,h/2,0]),pt(new THREE.ConeGeometry(r,r*2.2,6),0xc39bff,[0,h+r*1.1,0])];const g=mg(b);g.rotateZ(a);g.rotateX(a*.6);g.translate(x,.12+y,z);p.push(g)}
  const g=mg(p);put('gm82_amethyst',g)}
 /* 보따리: 둥근 천 꾸러미 + 위 매듭(귀 둘) + 물방울 무늬, 색 셋 */
 [[0xd9534f,0xb03a37],[0x3f7fd0,0x2c5fa8],[0x5bae5f,0x3f8c45]].forEach(([c,c2],i)=>{const p=[pt(new THREE.SphereGeometry(.3,14,10),c,[0,.22,0],0,[1,.72,1]),pt(cyl(.09,.13,.12,10),c2,[0,.42,0]),pt(new THREE.SphereGeometry(.08,10,8),c2,[0,.5,0])];
  for(const s of[-1,1])p.push(pt(new THREE.ConeGeometry(.08,.26,8),c,[s*.1,.58,0],[0,0,-s*.75],[1,1,.55]));
  for(let k=0;k<9;k++){const a=k*2.4,h=.12+((k*37)%5)*.04,r=Math.sqrt(Math.max(.01,.3*.3-((h-.22)/.72)**2))*1.0;p.push(pt(new THREE.SphereGeometry(.03,6,4),0xf7f0e3,[Math.cos(a)*r,h,Math.sin(a)*r],0,[1,1,.4]))}
  const g=mg(p);lkSmooth(g,50);put('r82_bundle_'+i,g)});
 /* 업그레이드 키트 셋: 크라프트 상자 + 색 테이프 + 앞면 그림 */
 const kit=(tape,pic)=>{const p=[pt(lkRb(.9,.56,.62,.06,.04),0xc89a63,[0,.28,0]),pt(lkRb(.92,.1,.64,.03,.02),tape,[0,.5,0]),pt(lkRb(.14,.58,.64,.03,.02),tape,[0,.29,0]),pt(lkRb(.56,.36,.02,.04,.02),0xf3e9d2,[0,.28,.315]),...pic];const g=mg(p);lkSmooth(g,40);return g};
 put('h82_kit_floor2',kit(0x3f7fd0,[pt(box(.2,.09,.01),0x9c6b43,[0,.2,.33]),pt(box(.2,.09,.01),0xc98a50,[0,.3,.33]),pt(ex([[-.14,0],[.14,0],[0,.1]],.01,.002),0x3e5c66,[0,.35,.33]),pt(box(.05,.07,.012),0x5f3f27,[0,.19,.335])]));
 put('h82_kit_wiring',kit(0xf2c94c,[pt(ex([[.02,.16],[-.07,.0],[0,.0],[-.03,-.14],[.08,.03],[.01,.03]],.012,.002),0xf2b134,[0,.28,.33])]));
 put('h82_kit_power',kit(0xe0533f,[pt(lkRb(.16,.24,.02,.03,.01),0x5bae5f,[0,.27,.33]),pt(box(.06,.03,.02),0x5bae5f,[0,.41,.33]),pt(box(.1,.05,.012),0xf7f0e3,[0,.3,.342]),pt(box(.03,.1,.012),0xf7f0e3,[0,.3,.342])]));
 try{h82HouseGeo()}catch(e){console.error('2층 집 모양',e);GEO.phouse2=GEO.phouse;GEO.phouse2_glow=GEO.phouse_glow}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg.apply(this,arguments);try{gm82Models()}catch(e){console.error('82차 모양',e)}}}
/* 보따리로 떨어뜨리기 */
{const _ad=addDrop;addDrop=function(x,z,items){const n=drops.length;_ad.apply(this,arguments);const d=drops[drops.length-1];if(drops.length>n&&d&&GEO.r82_bundle_0){const k=(Math.abs(Math.round(x*3+z*7)))%3;d.m.geometry=GEO['r82_bundle_'+k];d.m.scale.setScalar(1);d.m.rotation.y=(x*13+z*7)%6.28;d.m.castShadow=true;d.bnd=1}}}

/* 83차 2층 통나무 집(기획자: '외부는 집이 엄청 이상해' → 산장처럼): 돌 기단 테라스 + 1·2층 모두 통나무(층 사이 나무 띠) + 앞 2층 발코니(기둥·꽃 상자, 밑은 현관) + 앞 박공(판자·둥근 창) + 청록 지붕(집과 같은 색, 크림 박공널·받침대) + 돌 굴뚝. 정면 +z, 미터 그대로(s 1) */
function h82HouseGeo(){const {W,D,ZC,Y0,LR,LS,N1,N2,BAND,PZ}=H83,p=[],gl=[],R=(w,h,d,c=.04,b=.02)=>lkRb(w,h,d,c,b);
 const LOG=[0xa06a3e,0x93603a,0xab7444],END=0xdcb98e,RING=0xc18b55,RF=0x3e5c66,RF2=0x2d454d,CR=0xf2e8d2,STN=[0x9b9a90,0x868780,0xa9a89f,0x8f918a],ST2=0x7d7f78,DK=0x4a2e1c,TB=0x6b4429,GB=0xc8996a,GL=0xffdc8c,SH=0x3f6b74,WD=0x8f5a33,DECK=0x9a6a42;
 const zf=ZC+D,zb=ZC-D,ZF=zf+LR+.01,y1=Y0+N1*LS,yB=y1+BAND,y2=yB+2*LR+(N2-1)*LS;H83.zf=zf;H83.ZF=ZF;H83.yB=yB;H83.y2=y2;
 /* 돌 기단(앞은 현관 테라스까지) + 앞면 돌 줄 + 계단 둘 */
 p.push(pt(box(2*W+.6,Y0+.7,PZ-zb+.3),STN[1],[0,(Y0-.7)/2,(PZ+zb-.3)/2]));
 for(let j=0;j<2;j++)for(let i=0;i<10;i++){const x=-W-.05+i*.62+(j?.31:0);if(x>W+.1)continue;p.push(pt(R(.56,.18,.08,.04,.03),STN[(i+j*2)%4],[x,.12+j*.2,PZ+.04]))}
 for(const sx of[-1,1])for(let i=0;i<8;i++)p.push(pt(R(.08,.18,.62,.04,.03),STN[(i+(sx>0?1:2))%4],[sx*(W+.34),.22,zb-.05+i*.68]));
 p.push(pt(R(1.6,.14,.32,.03,.02),STN[2],[0,.21,PZ+.16]),pt(R(1.8,.14,.32,.03,.02),STN[0],[0,.07,PZ+.46]));
 /* 통나무 벽: 1층 N1줄 · 나무 띠 · 2층 N2줄, 모서리 통나무 끝 */
 const logs=(yb,N,o)=>{for(let i=0;i<N;i++){const y=yb+LR+i*LS;for(const sz of[-1,1]){p.push(pt(cyl(LR,LR,2*W+.5,10),LOG[(i+o)%3],[0,y,ZC+sz*D],[0,0,Math.PI/2]));for(const sx of[-1,1])p.push(pt(cyl(LR*.92,LR*.92,.02,10),END,[sx*(W+.26),y,ZC+sz*D],[0,0,Math.PI/2]),pt(cyl(LR*.5,LR*.5,.022,8),RING,[sx*(W+.262),y,ZC+sz*D],[0,0,Math.PI/2]))}
  if(i<N-1)for(const sx of[-1,1]){const y3=y+LS/2;p.push(pt(cyl(LR,LR,2*D+.5,10),LOG[(i+o+1)%3],[sx*W,y3,ZC],[Math.PI/2,0,0]));for(const sz of[-1,1])p.push(pt(cyl(LR*.92,LR*.92,.02,10),END,[sx*W,y3,ZC+sz*(D+.26)],[Math.PI/2,0,0]),pt(cyl(LR*.5,LR*.5,.022,8),RING,[sx*W,y3,ZC+sz*(D+.262)],[Math.PI/2,0,0]))}}};
 logs(Y0,N1,0);logs(yB,N2,1);
 p.push(pt(R(2*W+.66,BAND,.4,.03,.02),TB,[0,y1+BAND/2,zf]),pt(R(2*W+.66,BAND,.4,.03,.02),TB,[0,y1+BAND/2,zb]));for(const sx of[-1,1])p.push(pt(R(.4,BAND,2*D+.66,.03,.02),TB,[sx*W,y1+BAND/2,ZC]));
 /* 창: 크림 테·십자 창살·청록 덧창(fb = 화분 상자) */
 const win=(x,y,w,h,fb)=>{p.push(pt(R(w+.2,h+.2,.1,.03,.02),CR,[x,y,ZF]));gl.push(pt(box(w,h,.02),GL,[x,y,ZF+.04]));p.push(pt(box(.05,h,.03),CR,[x,y,ZF+.07]),pt(box(w,.05,.03),CR,[x,y,ZF+.07]));
  for(const s2 of[-1,1]){p.push(pt(R(.3,h+.22,.05,.02,.01),SH,[x+s2*(w/2+.27),y,ZF+.02]));for(let k=0;k<3;k++)p.push(pt(box(.22,.02,.02),0x2f5560,[x+s2*(w/2+.27),y-h*.32+k*h*.32,ZF+.055]))}
  if(fb){p.push(pt(R(w+.14,.2,.26,.03,.02),0x8a5632,[x,y-h/2-.2,ZF+.13]));for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.07,0),[0x4f8a4a,0x3f7a42][k%2],[x-w/2+.08+k*(w-.16)/4,y-h/2-.08,ZF+.15]),pt(new THREE.IcosahedronGeometry(.055,0),[0xe0533f,0xf28bb0,0xffffff][k%3],[x-w/2+.12+k*(w-.2)/4,y-h/2-.02,ZF+.2]))}};
 const sidew=(sx,y,w,h)=>{const x=sx*(W+LR+.02);p.push(pt(R(.1,h+.18,w+.18,.03,.02),CR,[x,y,ZC]));gl.push(pt(box(.02,h,w),GL,[x+sx*.04,y,ZC]));p.push(pt(box(.03,h,.05),CR,[x+sx*.07,y,ZC]),pt(box(.03,.05,w),CR,[x+sx*.07,y,ZC]))};
 /* 1층 앞: 문 + 창 둘(화분) + 등 둘 */
 p.push(pt(R(1.26,2.2,.1,.03,.02),CR,[0,Y0+1.1,ZF]));for(let k=0;k<4;k++)p.push(pt(R(.25,1.98,.06,.02,.01),[0xa0612f,0x96592a,0xa86834,0x9c5d2c][k],[-.375+k*.25,Y0+1.03,ZF+.05]));
 p.push(pt(box(.98,.08,.04),0x7c4a26,[0,Y0+.55,ZF+.09]),pt(box(.98,.08,.04),0x7c4a26,[0,Y0+1.55,ZF+.09]),pt(new THREE.SphereGeometry(.045,8,6),0xd9a441,[.33,Y0+1.0,ZF+.12]));
 win(-1.75,Y0+1.32,.82,.74,1);win(1.75,Y0+1.32,.82,.74,1);
 for(const sx of[-1,1]){p.push(pt(box(.06,.06,.22),0x2c2f33,[sx*.88,Y0+1.66,ZF+.1]),pt(R(.18,.26,.18,.03,.02),0x2c2f33,[sx*.88,Y0+1.54,ZF+.24]));gl.push(pt(box(.13,.18,.13),0xffc46a,[sx*.88,Y0+1.54,ZF+.24]))}
 for(const sx of[-1,1]){sidew(sx,Y0+1.3,.8,.7);sidew(sx,yB+1.0,.8,.7)}
 /* 현관 데크(발코니 밑) + 벤치 + 통·화분 */
 p.push(pt(box(4.1,.06,PZ-ZF),DECK,[0,Y0+.03,(ZF+PZ)/2]));for(let k=1;k<6;k++)p.push(pt(box(4.1,.012,.012),0x6e4426,[0,Y0+.065,ZF+k*(PZ-ZF)/6]));
 p.push(pt(R(.95,.07,.34,.02,.01),0xb57a47,[-1.3,Y0+.44,ZF+.32]),pt(R(.95,.3,.06,.02,.01),0xb57a47,[-1.3,Y0+.66,ZF+.16]));for(const dx of[-.4,.4])p.push(pt(box(.06,.4,.3),WD,[-1.3+dx,Y0+.22,ZF+.32]));
 p.push(pt(cyl(.3,.27,.72,12),0x7a5a3c,[2.55,Y0+.36,PZ-.45]),pt(cyl(.31,.31,.04,12),0x4a3a2c,[2.55,Y0+.5,PZ-.45]),pt(cyl(.31,.31,.04,12),0x4a3a2c,[2.55,Y0+.18,PZ-.45]),pt(cyl(.26,.26,.02,12),0x5d8fc4,[2.55,Y0+.73,PZ-.45]));
 p.push(pt(cyl(.22,.17,.32,10),0xc66a45,[-2.55,Y0+.16,PZ-.35]));for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.13,0),[0x4f8a4a,0x5c9a52][k%2],[-2.55+Math.cos(k*1.3)*.1,Y0+.42+(k%2)*.1,PZ-.35+Math.sin(k*1.3)*.1]));
 /* 2층 발코니: 바닥(크림 테) + 기둥 둘·받침 + 판자 난간 + 꽃 상자 둘 */
 {const bw=2.05,z0=ZF-.12,z1=ZF+H83.BD,yb=yB,rh=.86,zr=z1-.06;p.push(pt(R(2*bw,.14,z1-z0,.03,.02),DECK,[0,yb-.07,(z0+z1)/2]),pt(R(2*bw+.06,.16,.06,.02,.01),CR,[0,yb-.07,z1+.02]));
  for(const sx of[-1,1]){const x=sx*(bw-.17),zp=z1-.17;p.push(pt(cyl(.11,.12,yb-.14-Y0-.06,10),LOG[0],[x,(yb-.14+Y0+.06)/2,zp]),pt(R(.3,.1,.3,.03,.02),STN[2],[x,Y0+.1,zp]));
   p.push(lkBeam([x,yb-.8,zp],[x-sx*.6,yb-.16,zp],.1,.1,WD),lkBeam([x,yb-.8,zp],[x,yb-.16,zp-.6],.1,.1,WD))}
  p.push(pt(R(2*bw,.08,.1,.03,.02),WD,[0,yb+rh,zr]),pt(box(2*bw,.06,.06),WD,[0,yb+.12,zr]));for(const sx of[-1,1])p.push(pt(R(.1,.08,z1-z0-.1,.03,.02),WD,[sx*(bw-.05),yb+rh,(z0+z1)/2]),pt(box(.06,.06,z1-z0-.1),WD,[sx*(bw-.05),yb+.12,(z0+z1)/2]),pt(R(.12,rh+.08,.12,.03,.02),WD,[sx*(bw-.05),yb+rh/2,zr]));
  for(let k=0;k<15;k++){const x=-bw+.2+k*(2*bw-.4)/14;p.push(pt(box(.12,rh-.14,.035),CR,[x,yb+rh/2+.03,zr]))}
  for(const sx of[-1,1])for(let k=0;k<4;k++)p.push(pt(box(.035,rh-.14,.12),CR,[sx*(bw-.05),yb+rh/2+.03,z0+.25+k*(z1-z0-.4)/3]));
  for(const sx of[-1,1]){const x=sx*1.05;p.push(pt(R(1.1,.22,.24,.03,.02),0x8a5632,[x,yb+rh-.14,zr+.16]));
   for(let k=0;k<6;k++){p.push(pt(new THREE.IcosahedronGeometry(.08,0),[0x4f8a4a,0x3f7a42][k%2],[x-.45+k*.18,yb+rh-.02,zr+.18]),pt(new THREE.IcosahedronGeometry(.065,0),[0xe0533f,0xf28bb0,0xffffff,0xe0533f][k%4],[x-.42+k*.17,yb+rh+.06,zr+.2]));if(k%2)p.push(pt(new THREE.IcosahedronGeometry(.06,0),0x4f8a4a,[x-.45+k*.18,yb+rh-.26,zr+.3]))}}}
 /* 2층 앞: 발코니 유리문 + 창 둘 */
 p.push(pt(R(1.1,1.86,.1,.03,.02),CR,[0,yB+.93,ZF]));gl.push(pt(box(.86,1.62,.02),GL,[0,yB+.93,ZF+.04]));p.push(pt(box(.05,1.62,.03),CR,[0,yB+.93,ZF+.07]));for(const y of[.55,1.1])p.push(pt(box(.86,.05,.03),CR,[0,yB+y,ZF+.07]));
 win(-1.75,yB+1.05,.78,.74,0);win(1.75,yB+1.05,.78,.74,0);
 /* 지붕: 박공(앞뒤 판자 세모 + 둥근 창) · 청록 지붕널 · 크림 박공널 · 앞 처마 받침대 · 용마루 */
 const EX=W+.6,ang=Math.PI/6,RY=y2+EX*Math.tan(ang),L=Math.hypot(EX,RY-y2)+.12,Z0=zb-.55,Z1=ZF+H83.BD+.35,ZL=Z1-Z0,ZM=(Z0+Z1)/2,GW=W+.16;H83.RY=RY;
 for(const [z,f] of[[zf+.06,1],[zb-.14,0]]){const sh=new THREE.Shape();sh.moveTo(-GW,0);sh.lineTo(GW,0);sh.lineTo(0,GW*Math.tan(ang));sh.lineTo(-GW,0);const g=new THREE.ExtrudeGeometry(sh,{depth:.08,bevelEnabled:false});g.translate(0,y2,z);p.push(pt(g,GB));
  for(let k=-6;k<=6;k++){const x=k*.42,h=(GW-Math.abs(x))*Math.tan(ang)-.08;if(h>.12)p.push(pt(box(.03,h,.02),0xa77a4f,[x,y2+h/2,z+(f?.1:-.02)]))}
  if(f){p.push(pt(new THREE.TorusGeometry(.32,.07,8,22),CR,[0,y2+.72,z+.12]));gl.push(pt(new THREE.CircleGeometry(.28,20),GL,[0,y2+.72,z+.11]));p.push(pt(box(.04,.56,.03),CR,[0,y2+.72,z+.14]),pt(box(.56,.04,.03),CR,[0,y2+.72,z+.14]))}}
 for(const s2 of[-1,1]){const nx=s2*Math.sin(ang),ny=Math.cos(ang),cx=s2*Math.cos(ang)*(L/2-.06),cy=RY-Math.sin(ang)*(L/2-.06),rot=[0,0,-s2*ang];p.push(pt(box(L,.16,ZL),RF,[cx+nx*.08,cy+ny*.08,ZM],rot));
  for(const f of[.18,.36,.54,.72,.9]){const dx=s2*Math.cos(ang)*L*f,dy=-Math.sin(ang)*L*f;p.push(pt(box(.07,.035,ZL-.02),RF2,[dx+nx*.175,RY+dy+ny*.175,ZM],rot))}
  for(const z of[Z1+.03,Z0-.03]){const a=[s2*(EX+.06),y2-.06,z],b=[0,RY+.1,z];p.push(lkBeam(a,b,.22,.07,CR))}
  p.push(lkBeam([s2*1.55,y2-.55,ZF],[s2*1.55,y2+(EX-1.55)*Math.tan(ang)-.12,Z1-.35],.11,.11,WD))}
 p.push(pt(R(.3,.2,ZL+.08,.06,.04),RF2,[0,RY+.12,ZM]));
 /* 돌 굴뚝(오른쪽 뒤) */
 {const cx=1.75,cz=zb+.95,top=RY+.45;for(let y=y2-.3,k=0;y<top;y+=.3,k++)p.push(pt(R(.76,.3,.76,.04,.03),STN[k%4],[cx,y+.15,cz]));p.push(pt(R(.9,.14,.9,.04,.03),ST2,[cx,top+.07,cz]),pt(box(.4,.02,.4),0x2a2622,[cx,top+.15,cz]))}
 const g=mg(p);if(typeof lkSmooth==='function')lkSmooth(g,50);g.computeBoundingSphere();GEO.phouse2=g;GEO.phouse2_glow=mg(gl)}
