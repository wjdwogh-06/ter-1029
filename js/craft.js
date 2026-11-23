/* 67차: 제작법 전부 — 기획자 11-23 14:30~14:42
   · 일반·고급 작업대 모두 3×2 = 6칸, 한 칸에 물건 하나씩만(쌓기 없음) → 제작법 하나에 재료는 6개까지.
   · 총 = 키트 + 개머리판 + 포신 + 금속부품, 모양을 맞춰요(왼쪽부터 개머리판 → 키트 → 포신, 아래 가운데 금속부품; 좌우 뒤집어도 됨).
     현대식(현대 소총·점사 소총·저격총)·권총 = 강철 개머리판, 소드오프·기관단총·반자동 소총 = 나무 개머리판.
     긴 총(반자동 소총·현대 소총·점사 소총·저격총) = 장총 포신, 짧은 총(권총·기관단총·소드오프) = 산탄총 포신. 총은 아무 작업대에서나.
   · 부착물(조준경·레이저·손잡이·소음기)은 고급 작업대에서만. 총에 붙이는 기능은 다음에(효과는 기획자가 정할 때).
   · 그 밖에는 모양 상관없이 재료만 맞으면 돼요.
   · 울타리 = 같은 재료 3개, 울타리 문 = 같은 재료 4개.
   · 만들 수 없는 것: 가구·작업대(일반·고급·도색), 손도끼·탄알·일반 낚싯대, 모자·신발·가방(자판기·보급에서만), 광석 녹이기(기획자가 나중에 정함).
   · 설치물은 작업대에서 '키트'로 만들어 가방에서 눌러 설치해요(철거하면 키트가 돌아와요).
   · 자동 포탑 = 포탑 키트 + 회로기판 + 반자동 소총 + 금속부품 + 티타늄 → '자동 포탑'(포탑 키트는 이제 재료).
   · 고급 회로기판은 없앴어요(예전 저장은 dropRemoved가 정리).
   ui.js 28차 제작 칸 함수(cgMatch·cgPut·cgMake·cgFill·cgHtml)를 덮어써요. ui.js·core.js 줄은 안 고쳐요. */

/* ---- 고급 회로기판 없애기 ---- */
delete ITEMS.pcb2;REMOVED.n.pcb2='고급 회로기판';

/* ---- 설치물 키트(작업대에서 만들어 가방에서 설치) ---- */
BUILDS.gate_wood=Object.assign(lkDefOf('gate_wood'),{c:{wood:4},kit:'kit_gwood'});
Object.assign(BUILDS.wall,{n:'돌 울타리',c:{stone:3}});Object.assign(BUILDS.gate,{n:'돌 울타리 문',c:{stone:4}});
Object.assign(BUILDS.fence,{c:{wood:3}});Object.assign(BUILDS.fence_garden,{c:{plank:3}});Object.assign(BUILDS.fence_white,{c:{plastic:3}});
Object.assign(BUILDS.fence_conc,{c:{cement:3}});Object.assign(BUILDS.gate_conc,{c:{cement:4}});
const CR_KITS={kit_fence:['fence','나무 울타리'],kit_gwood:['gate_wood','나무 울타리 문'],kit_wall:['wall','돌 울타리'],kit_gate:['gate','돌 울타리 문'],kit_fgarden:['fence_garden','정원 울타리'],
 kit_fire:['fire','모닥불'],kit_torch:['torch','횃불'],kit_sign:['sign','표지판'],kit_lamp:['lamp','가로등'],kit_gen:['gen','발전기'],kit_boat2:['boat2','보트 2인승'],kit_mine:['mine','지뢰'],
 turret_auto:['turret','자동 포탑']};
for(const k in CR_KITS){const [b,n]=CR_KITS[k];ITEMS[k]={n,ic:'',ty:'kit',b,d:`${n}. 가방에서 눌러 설치해요`};BUILDS[b].kit=k}
ITEMS.kit_turret.ty='res';delete ITEMS.kit_turret.b;ITEMS.kit_turret.d='자동 포탑 부품이 든 상자. 작업대에서 회로기판·반자동 소총·금속부품·티타늄과 합쳐 자동 포탑을 만들어요';
ITEMS.turret_auto.d='작업대에서 조립한 자동 포탑. 가방에서 눌러 설치해요';
/* 키트 아이콘 = 그 설치물 그림(look.js가 바꾼 모양으로) */
{const _mi=makeIcons;makeIcons=function(){for(const k in CR_KITS){const b=BUILDS[CR_KITS[k][0]];ITEMS[k].ic=b.ic||b.g}return _mi.apply(this,arguments)}}

/* ---- 제작법 ---- */
const CR_GUN=[['pistol','gp_sstock','gp_sbarrel'],['smg','gp_wstock','gp_sbarrel'],['shotgun','gp_wstock','gp_sbarrel'],['rifle','gp_wstock','gp_rbarrel'],
 ['ar','gp_sstock','gp_rbarrel'],['burst','gp_sstock','gp_rbarrel'],['sniper','gp_sstock','gp_rbarrel']];
const CR_LIST=[
 /* g = 목록 묶음, adv = 고급 작업대에서만, n = 나오는 개수 */
 ...CR_GUN.map(([id,st,br])=>({g:'총',id,n:1,pat:[[st,'gkit_'+id,br],[null,'mparts',null]]})),
 {g:'총',id:'crossbow',c:{wood:3,cloth:1,mparts:1}},{g:'총',id:'arrow',n:5,c:{wood:1,stone:1}},
 {g:'부착물',id:'att_scope',adv:1,c:{ebottle:1,bar_iron:1,mparts:1}},{g:'부착물',id:'att_laser',adv:1,c:{aabatt:1,pcb:1,mparts:1}},
 {g:'부착물',id:'att_grip',adv:1,c:{plastic:2,mparts:1}},{g:'부착물',id:'att_supp',adv:1,c:{bar_iron:1,mparts:2}},
 {g:'무기·회복',id:'grenade',c:{scrap:2,powder:2}},{g:'무기·회복',id:'bandage',c:{cloth:2}},
 {g:'총 부품',id:'gp_wstock',c:{wood:2,mparts:1}},{g:'총 부품',id:'gp_sstock',c:{bar_iron:2,mparts:1}},{g:'총 부품',id:'gp_rbarrel',c:{bar_iron:3}},{g:'총 부품',id:'gp_sbarrel',c:{bar_iron:2}},
 {g:'총 부품',id:'mparts',c:{scrap:2}},
 {g:'재료',id:'plank',n:2,c:{wood:2}},{g:'재료',id:'nails',n:5,c:{scrap:1}},{g:'재료',id:'splate',c:{scrap:3}},{g:'재료',id:'cement',c:{stone:2,wbottle:1}},
 {g:'재료',id:'tarp',c:{cloth:3}},{g:'재료',id:'pcb',c:{bar_copper:1,plastic:1}},
 {g:'울타리',id:'kit_fence',c:{wood:3}},{g:'울타리',id:'kit_gwood',c:{wood:4}},{g:'울타리',id:'kit_wall',c:{stone:3}},{g:'울타리',id:'kit_gate',c:{stone:4}},
 {g:'울타리',id:'kit_fgarden',c:{plank:3}},{g:'울타리',id:'kit_fwhite',c:{plastic:3}},{g:'울타리',id:'kit_fconc',c:{cement:3}},{g:'울타리',id:'kit_gconc',c:{cement:4}},
 {g:'설치물',id:'turret_auto',c:{kit_turret:1,pcb:1,rifle:1,mparts:1,ore_ti:1}},
 {g:'도구',id:'pick_adv',c:{wood:2,bar_iron:2}},{g:'도구',id:'pick_elec',c:{pick_adv:1,aabatt:2,pcb:1}},{g:'도구',id:'dhammer',c:{wood:1,bar_iron:2}},
 {g:'도구',id:'chainsaw',c:{splate:1,mparts:2,aabatt:1}},{g:'도구',id:'harpoon',c:{wood:2,bar_iron:1}},
 {g:'도구',id:'rod2',c:{rod:1,bar_iron:2}},{g:'도구',id:'rod3',c:{rod2:1,bar_gold:1,bar_silver:1}},{g:'도구',id:'rod_lucky',c:{rod3:1,charm:1}}];
RECIPES.length=0;
for(const r of CR_LIST){if(!ITEMS[r.id])continue;r.n=r.n||1;r.bench=1;if(r.pat){const c={};for(const row of r.pat)for(const k of row)if(k)c[k]=(c[k]||0)+1;r.c=c}
 if(Object.keys(r.c).some(k=>!ITEMS[k]))continue;RECIPES.push(r)}
const crKey=c=>Object.keys(c).sort().map(k=>k+':'+c[k]).join(',');
{const seen={};for(const r of RECIPES){if(r.pat)continue;const k=crKey(r.c);if(seen[k])console.error('제작법 재료가 같아요:',seen[k],r.id);seen[k]=r.id}}

/* ---- 지금 연 작업대가 고급인지 ---- */
const crNearBench=()=>{let best=null,bd=9;for(const s of structs){if(s.t!=='bench'&&s.t!=='bench2')continue;if(s.in&&s.hk!==curHK())continue;const d=dist(s.x,s.z,P.x,P.z);if(d<bd){bd=d;best=s}}return best};
CG.adv=0;
{const _o=openPanel;openPanel=function(k){if(k==='bench'){const b=crNearBench();CG.adv=b&&b.t==='bench2'?1:0}return _o.apply(this,arguments)}}

/* ---- 칸 맞추기: 총은 모양, 나머지는 재료만 ---- */
cgMatch=function(){const g=cgGrid(),ids=g.map(s=>s&&s.id);const n=cgNorm(ids);if(!n)return null;
 for(const r of RECIPES){if(!r.pat)continue;const q=r.pat;if(q.length!==n.length||q[0].length!==n[0].length)continue;
  const eq=m=>q.every((row,i)=>row.every((v,j)=>v===n[i][m?row.length-1-j:j]));if(eq(0)||eq(1))return r}
 const c={};for(const k of ids)if(k)c[k]=(c[k]||0)+1;const key=crKey(c);for(const r of RECIPES)if(!r.pat&&crKey(r.c)===key)return r;return null};
/* 한 칸에 하나씩만 */
cgPut=function(i){const g=cgGrid(),c=g[i],k=CG.sel;
 if(c){S.inv[c.id]=(S.inv[c.id]||0)+c.n;g[i]=null;if(!k||k===c.id){sfx(480,.04);hudDirty=true;return}}
 if(k&&invN(k)>0){take(k,1);g[i]={id:k,n:1};if(!invN(k))CG.sel=null;sfx(620,.04)}hudDirty=true};
const crLayout=()=>cgGrid().map(s=>s&&s.id);
function crRefill(lay){const need={};for(const k of lay)if(k)need[k]=(need[k]||0)+1;if(!canPay(need))return false;const g=cgGrid();lay.forEach((k,i)=>{if(k){take(k,1);g[i]={id:k,n:1}}});return true}
const crLock=r=>r&&r.adv&&!CG.adv;
cgMake=function(times){let r=cgMatch();if(!r)return;const it=ITEMS[r.id];if(!cgBenchOK()){toast('작업대에서 만들 수 있어요');return}if(crLock(r)){toast('고급 작업대에서만 만들 수 있어요');return}
 {const g=cgGrid();for(let i=0;i<6;i++)if(g[i]&&g[i].n>1){S.inv[g[i].id]=(S.inv[g[i].id]||0)+g[i].n-1;g[i].n=1}}const lay=crLayout();let k=0;
 while(k<times){if(k>0&&!crRefill(lay))break;if(cgMatch()!==r)break;
  if(it.one&&invN(r.id)){if(!k)toast(`${jo(it.n,'은','는')} 이미 가지고 있어요`);break}if(!bagHas(r.id)){bagFullMsg();break}
  const g=cgGrid();for(let i=0;i<6;i++)if(g[i])g[i]=null;give(r.id,r.n);const sk='c_'+r.id;if(S.st[sk]!==undefined)S.st[sk]++;k++}
 if(k){jingle([523,784]);toast(`${it.n}${r.n*k>1?' ×'+r.n*k:''} 완성!`)}hudDirty=true};
cgFill=function(ri){const r=RECIPES[ri];if(!r)return;cgReturn();if(!canPay(r.c)){toast('재료가 모자라요');return}const g=cgGrid();
 if(r.pat)r.pat.forEach((row,rr)=>row.forEach((id,cc)=>{if(id){take(id,1);g[rr*3+cc]={id,n:1}}}));
 else{let i=0;for(const k of Object.keys(r.c))for(let q=0;q<r.c[k];q++){take(k,1);g[i++]={id:k,n:1}}}CG.sel=null;sfx(660,.05)};
/* 몇 번 만들 수 있나(칸 + 가방) */
function crMax(r){const lay=crLayout(),need={};for(const k of lay)if(k)need[k]=(need[k]||0)+1;let m=1;const inv=Object.assign({},S.inv);
 while(m<99&&Object.keys(need).every(k=>(inv[k]||0)>=need[k])){for(const k in need)inv[k]-=need[k];m++}return m}

cgHtml=function(benchOK){const g=cgGrid(),r=cgMatch(),it=r&&ITEMS[r.id],lock=!!(r&&(!benchOK||crLock(r))),own=!!(r&&it.one&&invN(r.id)),can=!!r&&!lock&&!own,
  max=can?(it.one?1:crMax(r)):0,bs='min-height:36px;padding:6px 12px;font-size:13px',bn=CG.adv?'고급 작업대':'작업대';
 const cell=(c,i)=>`<div class="slot" data-a="cgs" data-i="${i}" style="width:58px;height:58px;${CG.sel&&!c?'border-color:var(--grn);':''}">${c?invIcon(c.id):''}</div>`;
 let h=`<div class="sec" style="margin-top:0">🔨 ${bn} 제작 칸 3×2 — 한 칸에 하나씩 놓아요</div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
  <div class="grid" style="grid-template-columns:repeat(3,58px);gap:6px">${g.map(cell).join('')}</div><div style="font-size:24px;color:var(--mut);font-weight:900">➜</div>
  <div class="slot" style="width:66px;height:66px;${can?'border-color:var(--grn);background:#F2FFE9':''}">${r?invIcon(r.id)+(r.n>1?`<b>${r.n}</b>`:''):''}</div>
  <div style="display:flex;flex-direction:column;gap:5px;min-width:150px;flex:1"><div style="font-weight:900;font-size:14px">${r?it.n+(r.n>1?' ×'+r.n:''):'재료가 맞으면 여기에 떠요'}</div>${r?`<small style="color:var(--mut);font-weight:700;font-size:12px">${lock?(crLock(r)?'고급 작업대에서만 만들 수 있어요':'작업대에서 만들 수 있어요'):own?'이미 가지고 있어요':`${max}번 만들 수 있어요`}</small>`:''}
  <div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn" data-a="cgmake" data-n="1" ${can?'':'disabled'} style="${bs}">만들기</button><button class="btn g" data-a="cgmake" data-n="999" ${can&&max>1?'':'disabled'} style="${bs}">전부</button><button class="btn g" data-a="cgclr" ${g.some(Boolean)?'':'disabled'} style="${bs}">비우기</button></div></div></div>`;
 const ks=bagList();h+=`<div class="sec">가방 — ${CG.sel?`${ITEMS[CG.sel].n} 골랐어요 · 칸을 누르면 하나씩 놓여요`:'재료를 눌러 골라요'}</div><div class="grid" style="grid-template-columns:repeat(auto-fill,50px);gap:5px">${ks.map(k=>`<div class="slot ${CG.sel===k?'sel':''}" data-a="cgpick" data-k="${k}" style="width:50px;height:50px">${invIcon(k)}<b style="font-size:11px">${S.inv[k]}</b></div>`).join('')}</div>`;
 h+=`<div class="sec">제작법 — [놓기]를 누르면 가방 재료로 칸을 채워요 · 총은 모양대로, 나머지는 아무 칸이나</div>`;let gl='';
 RECIPES.forEach((rc,i)=>{const ri=ITEMS[rc.id],lk=crLock(rc),ok=!lk&&canPay(rc.c)&&!(ri.one&&invN(rc.id));
  if(rc.g!==gl){gl=rc.g;h+=`<div style="font-weight:900;font-size:13px;color:var(--brn);margin:8px 0 2px">${gl}</div>`}
  const cells=rc.pat?[0,1].map(a=>[0,1,2].map(b=>rc.pat[a]&&rc.pat[a][b])).flat():(()=>{const o=[];for(const k in rc.c)for(let q=0;q<rc.c[k];q++)o.push(k);while(o.length<6)o.push(null);return o})();
  const mini=`<div style="display:grid;grid-template-columns:repeat(3,24px);gap:2px;flex:none">${cells.map(m=>`<div style="width:24px;height:24px;border-radius:6px;background:var(--pn2);border:1.5px solid var(--pn3);display:flex;align-items:center;justify-content:center">${m?`<img src="${ICON[m]}" style="width:21px;height:21px">`:''}</div>`).join('')}</div>`;
  h+=`<div class="row" style="gap:8px">${mini}<div style="font-size:16px;color:var(--mut);flex:none">➜</div>${invIcon(rc.id)}<div class="tx">${ri.n}${rc.n>1?' ×'+rc.n:''}${rc.adv?' <span style="font-size:12px;color:var(--blu)">고급 작업대</span>':''}<small>${costHtml(rc.c)}</small></div><button class="btn g" data-a="cgfill" data-i="${i}" ${ok?'':'disabled'} style="min-height:34px;padding:6px 10px;font-size:13px;flex:none">놓기</button></div>`});
 return h};
