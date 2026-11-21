'use strict';
/* ===== 48차(규칙, 기획자 11-21 14:18): 가방 [🧍 장비] 탭 — 캐릭터 360° 보기 + 장비 칸 다섯 =====
   기획자: '가방 열고 아이템 도감 옆에 하나 더 — 현재 캐릭터 360도 돌아가게 볼 수 있게, 그리고 장비 착용 여부·제거를 거기에 표시.
           다섯 칸: 머리 쪽에 모자 칸, 가운데 가방 칸, 그 아래 장비 칸·탄약 칸, 그 아래 신발 칸. 무기를 장착했으면 내 인벤이 아니라 거기 가 있어야 해.
           뺄 때도 거기서 누르면 내 인벤으로 돌아오고, 가득 차면 안 되게. 인벤에서 누르면 그 칸으로 가고, 이미 껴 있어도 바뀌는 거지'.
   - 칸: hat 모자 · bag 가방 · gear 장비(손에 드는 총·도구·낚싯대·수류탄 = S.quick[S.sel]) · ammo 탄약(탄알·화살 한 묶음) · shoes 신발.
     모자·가방·신발 아이템은 아직 없어요(ITEMS[id].eq='hat'|'bag'|'shoes'를 붙이면 그 칸에 들어가요).
   - 낀 것은 개수는 S.inv에 그대로 두고(총알 쓰기·하나만 갖기 검사가 그대로 돌게) 가방 칸 목록(bagList, ui.js)에서만 빼요 → 20칸을 안 차지해요.
     재활용 쓰레기통·보관 상자 넣기 목록에서도 빠져요(빼서 가방에 넣어야 팔거나 맡길 수 있어요).
   - 가방 칸을 누르면: 총·도구·낚싯대·수류탄 → 장비 칸, 탄알·화살 → 탄약 칸(이미 낀 게 있으면 서로 바뀌어요 — 가방이 꽉 차 있어도 됨).
     장비 탭에서 낀 칸을 누르면 가방으로 빼요(가방이 꽉 차면 안 돼요).
   - 캐릭터 보기: 내 캐릭터(강아지·고양이·든 무기 그대로)를 따로 비추는 카메라로 그려요(레이어 PV_L, 큰 화면 그리기 바로 앞에 한 번 그려서 옮겨 그림).
     손가락으로 좌우로 끌면 360° 돌아가요. */
const EQ_SLOTS=[['hat','🧢','모자'],['bag','🎒','가방'],['gear','🗡','장비'],['ammo','🔸','탄약'],['shoes','👟','신발']];
function eqInit(){if(!S.eq)S.eq={hat:null,bag:null,ammo:null,shoes:null};for(const k of['hat','bag','ammo','shoes'])if(S.eq[k]===undefined)S.eq[k]=null}
const eqGet=k=>{if(k==='gear'){const q=S.quick[S.sel];return q&&WEAP[q]&&invN(q)>0?q:null}eqInit();const id=S.eq[k];return id&&invN(id)>0?id:null};
function eqHas(id){if(!S||!id)return false;if(eqGet('gear')===id)return true;if(!S.eq)return false;for(const k of['hat','bag','ammo','shoes'])if(S.eq[k]===id&&invN(id)>0)return true;return false}
/* 어느 칸에 들어가는 아이템인가 */
function eqSlotOf(id){const it=ITEMS[id];if(!it)return null;if(it.eq)return it.eq;if(it.ty==='ammo')return'ammo';if(WEAP[id]&&id!=='fist'&&it.ty!=='kit')return'gear';return null}
function eqSet(slot,id){eqInit();const old=eqGet(slot);if(old===id)return;
 if(slot==='gear'){for(let i=0;i<S.quick.length;i++)if(i!==S.sel&&S.quick[i]===id)S.quick[i]=null;S.quick[S.sel]=id}else S.eq[slot]=id;
 const it=ITEMS[id];sfx(620,.05);toast(`${slot==='ammo'?'🔸':'🗡'} ${it.n}${old?` ↔ ${ITEMS[old].n}`:''} — ${EQ_SLOTS.find(q=>q[0]===slot)[2]} 칸에 꼈어요`+(slot==='gear'&&WEAP[id].nade?' · 오른쪽 조이스틱을 끌었다 떼면 던져요':''));hudDirty=true;if(panel==='bag')renderPanel()}
function eqOff(slot){const id=eqGet(slot);if(!id)return;if(bagList().length>=BAG_N){bagFullMsg();return}if(slot==='gear')S.quick[S.sel]=null;else S.eq[slot]=null;sfx(480,.05);toast(`${jo(ITEMS[id].n,'을','를')} 가방에 넣었어요`);hudDirty=true;if(panel==='bag')renderPanel()}
/* 가방 칸 누르기: 장비·탄약은 칸으로(바뀌기 포함), 나머지는 예전 그대로 */
{const _bt=bagTap;bagTap=function(k){const it=ITEMS[k];if(it&&invN(k)){const sl=eqSlotOf(k);if(sl){selItem=null;eqSet(sl,k);return}}_bt(k)}}
/* 예전 저장: 손 칸 말고 남은 퀵 칸은 비워요(장비 칸은 S.quick[S.sel] 하나) */
{const _up=updPlayer;let mig=null;updPlayer=function(dt){if(mig!==S&&mode==='play'){mig=S;eqInit();for(let i=0;i<S.quick.length;i++)if(i!==S.sel)S.quick[i]=null}_up(dt)}}
/* ---- 장비 탭 ---- */
const PV={yaw:0,on:false,cv:null,cx:null,cam:null,L:[],drag:null,auto:1};const PV_L=7;
function eqHtml(){const cell=([k,ic,nm])=>{const id=eqGet(k),it=id&&ITEMS[id],n=id&&!it.one?invN(id):0;
  return`<div class="eqc" data-a="eqoff" data-k="${k}"><div class="slot eqs ${id?'on':''}">${id?invIcon(id):`<span class="eqi">${ic}</span>`}${n>1?`<b>${n}</b>`:''}</div><div class="eqn">${id?it.n:nm}</div></div>`};
 return`<div class="eqw"><div class="eqv"><canvas id="eqPv"></canvas><div class="eqh">↔ 끌어서 돌려 보기</div></div><div class="eqg">
  <div class="eqr">${cell(EQ_SLOTS[0])}</div><div class="eqr">${cell(EQ_SLOTS[1])}</div><div class="eqr">${cell(EQ_SLOTS[2])}${cell(EQ_SLOTS[3])}</div><div class="eqr">${cell(EQ_SLOTS[4])}</div>
  <div class="eqt">가방 칸을 누르면 끼고, 여기 칸을 누르면 빼요</div></div></div>`}
{const css=document.createElement('style');css.textContent=`
#pbody .eqw{display:flex;gap:10px;align-items:stretch;height:100%;min-height:0}
#pbody .eqv{flex:1 1 46%;position:relative;border-radius:14px;background:var(--pn2);border:2px solid var(--pn3);overflow:hidden;min-width:120px}
#pbody .eqv canvas{width:100%;height:100%;display:block;touch-action:none}
#pbody .eqh{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:11px;font-weight:800;color:var(--mut);pointer-events:none}
#pbody .eqg{flex:1 1 54%;display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0}
#pbody .eqr{display:flex;justify-content:center;gap:10px}
#pbody .eqc{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;min-width:0}
#pbody .eqs{width:var(--eqz,58px);height:var(--eqz,58px);position:relative}
#pbody .eqs.on{border-color:var(--grn)}
#pbody .eqi{font-size:24px;opacity:.38;filter:grayscale(1)}
#pbody .eqn{font-size:11px;font-weight:800;color:var(--tx);max-width:84px;text-align:center;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pbody .eqt{text-align:center;font-size:11px;font-weight:700;color:var(--mut);margin-top:2px}`;document.head.appendChild(css)}
function eqFit(){const B=$('pbody'),w=B.querySelector('.eqw');if(!w)return;const cs=getComputedStyle(B),h=B.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);w.style.height=h+'px';
 const g=w.querySelector('.eqg'),gw=g.clientWidth,z=Math.max(40,Math.min(70,Math.floor((h-4*30-26)/4),Math.floor((gw-20)/2.3)));B.style.setProperty('--eqz',z+'px');
 const cv=$('eqPv');if(cv){const r=cv.getBoundingClientRect(),k=Math.min(2,devicePixelRatio||1);cv.width=Math.max(2,Math.round(r.width*k));cv.height=Math.max(2,Math.round(r.height*k))}}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel!=='bag'){PV.on=false;return}
 $('ptabs').innerHTML=`<div class="tab ${BAGT.t==='inv'?'on':''}" data-a="btab" data-k="inv">🎒 인벤토리 ${bagList().length}/${BAG_N}</div><div class="tab ${BAGT.t==='dex'?'on':''}" data-a="btab" data-k="dex">📖 도감</div><div class="tab ${BAGT.t==='eq'?'on':''}" data-a="btab" data-k="eq">🧍 장비</div>`;
 if(BAGT.t!=='eq'){PV.on=false;return}const B=$('pbody');B.innerHTML=eqHtml();B.style.overflowY='hidden';PV.on=true;eqFit();pvBind()}}
{const _cp=closePanel;closePanel=function(){_cp();PV.on=false}}
{const _rs=resize;resize=function(){_rs();if(panel==='bag'&&BAGT.t==='eq')setTimeout(eqFit,0)}}
$('pbody').addEventListener('click',e=>{const t=e.target.closest('[data-a="eqoff"]');if(!t||panel!=='bag')return;const k=t.dataset.k;if(eqGet(k))eqOff(k);else toast(`${EQ_SLOTS.find(q=>q[0]===k)[2]} 칸이 비어 있어요${k==='hat'||k==='bag'||k==='shoes'?' (아직 이 칸에 끼는 아이템이 없어요)':' — 가방 칸을 누르면 껴요'}`)});
function pvBind(){const cv=$('eqPv');if(!cv||cv._b)return;cv._b=1;PV.cv=cv;PV.cx=cv.getContext('2d');
 cv.addEventListener('pointerdown',e=>{PV.drag={id:e.pointerId,x:e.clientX};PV.auto=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}e.stopPropagation()});
 cv.addEventListener('pointermove',e=>{if(!PV.drag||PV.drag.id!==e.pointerId)return;PV.yaw-=(e.clientX-PV.drag.x)*.014;PV.drag.x=e.clientX;e.stopPropagation()});
 const up=e=>{if(PV.drag&&PV.drag.id===e.pointerId)PV.drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
/* 캐릭터 보기 그리기: 레이어 PV_L만 보는 카메라 + 전용 빛 → 큰 화면 구석에 먼저 그리고 장비 탭 그림판으로 옮긴 뒤, 큰 화면을 덮어 그려요 */
function pvSetup(){if(PV.cam)return;PV.cam=new THREE.PerspectiveCamera(30,1,.1,60);PV.cam.layers.set(PV_L);
 const a=new THREE.AmbientLight(0xffffff,.62),d=new THREE.DirectionalLight(0xfff4e0,.95),d2=new THREE.DirectionalLight(0xc9d8ff,.35);for(const L of[a,d,d2]){L.layers.set(PV_L);scene.add(L);PV.L.push(L)}PV.d=d;PV.d2=d2;scene.add(d.target);scene.add(d2.target)}
function pvRender(draw){const cv=PV.cv;if(!PV.on||!cv||!cv.isConnected||!P||!P.a||panel!=='bag'||BAGT.t!=='eq')return;pvSetup();
 const w=cv.width,h=cv.height,el=R.domElement,pr=R.getPixelRatio();if(w<4||h<4||w>el.width||h>el.height)return;
 P.a.root.traverse(o=>o.layers.enable(PV_L));
 if(PV.auto)PV.yaw+=.004;const y0=(P.a.root.position.y||groundY(P.x,P.z)),fy=P.a.root.rotation.y,a=fy+PV.yaw,th=.98,t=Math.tan(15*Math.PI/180),asp=w/h,D=Math.max(1.3/t,.85/(t*asp));   /* 키 2.2m·폭 1.6m(든 것 포함)가 어떤 칸 모양에도 다 들어가게 */
 PV.cam.aspect=asp;PV.cam.fov=30;PV.cam.updateProjectionMatrix();PV.cam.position.set(P.x+Math.sin(a)*D,y0+th+.55,P.z+Math.cos(a)*D);PV.cam.lookAt(P.x,y0+th,P.z);
 PV.d.position.set(PV.cam.position.x+Math.sin(a+.9)*3,y0+5,PV.cam.position.z+Math.cos(a+.9)*3);PV.d.target.position.set(P.x,y0+1,P.z);PV.d2.position.set(P.x-Math.sin(a+.6)*4,y0+3,P.z-Math.cos(a+.6)*4);PV.d2.target.position.set(P.x,y0+1,P.z);
 const bg=scene.background,fg=scene.fog,au=R.shadowMap.autoUpdate,cc=R.getClearColor(new THREE.Color()),ca=R.getClearAlpha(),vw=w/pr,vh=h/pr,full=R.getSize(new THREE.Vector2());
 scene.background=null;scene.fog=null;R.shadowMap.autoUpdate=false;R.setClearColor(0xF3E9D6,1);R.setScissorTest(true);R.setViewport(0,0,vw,vh);R.setScissor(0,0,vw,vh);
 try{R.clear();draw(scene,PV.cam);PV.cx.clearRect(0,0,w,h);PV.cx.drawImage(el,0,el.height-h,w,h,0,0,w,h)}finally{R.setScissorTest(false);R.setViewport(0,0,full.x,full.y);R.setClearColor(cc,ca);scene.background=bg;scene.fog=fg;R.shadowMap.autoUpdate=au}}
function pvHook(){if(!R||R._pv)return;R._pv=1;const _r=R.render.bind(R);R.render=function(sc,ca){if(sc===scene&&ca===cam&&PV.on)pvRender(_r);_r(sc,ca)}}
if(typeof R!=='undefined'&&R)pvHook();else{const _ir=initRenderer;initRenderer=function(){_ir();pvHook()}}   /* boot()이 ui.js 끝에서 바로 initRenderer를 불러서, 이 파일이 읽힐 땐 R이 이미 있어요 */
