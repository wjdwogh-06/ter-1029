/* ===== 79차(규칙, 기획자 11-24 22:38): 동굴(지하 광산) 안 광물 · 방마다 보물 상자 =====
   기획자: '동굴 안에도 광물을 배치하는데 금이랑 은이 두 배 더 잘 나오게, 석탄·바위에서 확률을 내리고',
           '처음 동굴에 도착하는 곳을 빼고 모든 방 가운데쯤 보물 상자 하나. 열려면 9999 골드를 내야 하고, 내면 일반 보급 상자처럼 아이템을 줘'.
   ① 광물(MO79): 광산(mine74.js) 방·갱도 바닥에 약 110개. 바위 20 · 석탄 20 · 철 20 · 구리 10 · 티타늄 10 · 은 14 · 금 6 (%) — 겨울 섬의 은·금 2배.
      바깥 바위와 같은 방식(objs에 'm79:번호' 열쇠로 넣음)이라 캐기·곡괭이·다시 생기기(7분)가 그대로 돼요. 모양은 79차 겨울 광물에서 눈만 뺀 것.
      자리: 걸을 수 있는 바닥, 레일·입구·상자·다른 소품·다른 광물에서 떨어진 곳(hash로 정해서 누구에게나 같음). 부딪힘은 광산 원 충돌(m74solid).
   ② 보물 상자(mc79): 도착하는 방(광차 기지)을 뺀 방 9곳(화약 창고·옛 갱도·펌프실·중앙 수직갱 광장·야영지·지하 호수·수정 동굴·버섯 숲·채굴장)
      가운데에서 가장 가까운 트인 자리. [💰 9999 · 보물 상자] → 창에서 9999 동전을 내면 열리고, 안은 일반 보급 상자와 같아요(lootGen loot 1, 상자 창 20칸).
      다 비우면 3일 뒤 다시 채워지고, 그때 또 9999 동전을 내야 열려요. 남은 게 있으면 그냥 열려요.
   광산은 처음 들어갈 때 만들어지므로(mine74 caveRoom74) 그 뒤에 붙여요(caveRoom 감싸기). 멀티 서버는 몰라요(각자 화면). */
const MO79={W:{rock:20,coal:20,iron:20,copper:10,ti:10,silver:14,gold:6},list:[],im:{},chests:[],price:9999,built:0,m:new THREE.Object3D()};
const MO79_ROOMS=[[2],[3],[4],[5,6,7],[8],[9],[10,11],[12],[13,14]];   /* M74.halls 번호 묶음 = 방. 0·1(광차 기지, 들어오는 곳)은 빼요 */
DECO.mc79={g:'mc79',s:1,bx:.72,bz:.52,loot:1,og:'mc79_open',cd:3,hp:1e9};
function mo79Pick(r){let a=0;for(const k of ORE79_K){a+=MO79.W[k]||0;if(r*100<a)return k}return'rock'}
const mo79L=(x,z)=>[x-INT.x-MINE.ox,z-INT.z-MINE.oz];   /* 세상 좌표 → 광산 좌표 */
const mo79W=(x,z)=>[x+INT.x+MINE.ox,z+INT.z+MINE.oz];
/* 보물 상자 모양: 닫힘·열림(안에 금화) */
function mc79Geo(){const R=(w,h,d,c=.04,b=.02)=>lkRb(w,h,d,c,b),WD=[0x8a5632,0x7d4c2b,0x95603a],GD=0xd9a441,GD2=0xf2c94c,W=1.3,D=.86,H=.56;
 const body=()=>{const p=[pt(R(W,H,D,.05,.03),WD[0],[0,H/2,0])];for(let k=0;k<4;k++)p.push(pt(box(W+.01,.012,.01),WD[1],[0,.12+k*.12,D/2+.003]));
  for(const x of[-W/2+.12,W/2-.12])p.push(pt(R(.1,H+.02,D+.03,.02,.01),GD,[x,H/2,0]));p.push(pt(R(W+.03,.07,D+.03,.02,.01),GD,[0,.035,0]));
  p.push(pt(R(.26,.3,.06,.04,.02),GD2,[0,H-.06,D/2+.02]),pt(cyl(.035,.035,.02,10),0x2c2f33,[0,H-.04,D/2+.055],[Math.PI/2,0,0]),pt(box(.02,.06,.02),0x2c2f33,[0,H-.1,D/2+.055]));
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(new THREE.SphereGeometry(.035,8,6),GD2,[sx*(W/2-.12),H-.04,sz*(D/2+.01)]));return p};
 const lid=(open)=>{const g=[],c=new THREE.CylinderGeometry(D/2,D/2,W,16,1,false,0,Math.PI);c.rotateZ(Math.PI/2);c.rotateX(-Math.PI/2);g.push(pt(c,WD[2],[0,0,0]));
  for(const x of[-W/2+.12,W/2-.12]){const t=new THREE.CylinderGeometry(D/2+.015,D/2+.015,.1,16,1,false,0,Math.PI);t.rotateZ(Math.PI/2);t.rotateX(-Math.PI/2);g.push(pt(t,GD,[x,0,0]))}
  g.push(pt(new THREE.SphereGeometry(.06,10,8),0xd8402e,[0,D/2*.72,D/2*.7]));const m=mg(g);
  if(open){m.translate(0,0,D/2);m.rotateX(-1.95);m.translate(0,H,-D/2)}else m.translate(0,H,0);return m};
 const closed=body();closed.push(pt(lid(false),null));GEO.mc79=mg(closed);
 const op=body();op.push(pt(lid(true),null),pt(box(W-.14,.04,D-.14),0x3a2416,[0,H-.06,0]));
 for(let i=0;i<26;i++){const a=i*2.4,r=.08+(i%7)*.065;op.push(pt(cyl(.07,.07,.022,12),i%5?GD2:GD,[Math.cos(a)*r*1.4,H-.02+(i%3)*.03,Math.sin(a)*r*.85],[(i%4)*.3,0,(i%3)*.3]))}
 op.push(pt(new THREE.OctahedronGeometry(.07,0),0x6bd38a,[.2,H+.07,.05]),pt(new THREE.OctahedronGeometry(.06,0),0x6bb7ff,[-.25,H+.06,-.08]));GEO.mc79_open=mg(op)}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();try{mc79Geo();if(typeof lkAOnew==='function'){const b0=Object.assign({},GEO);delete b0.mc79;delete b0.mc79_open;lkAOnew(b0)}}catch(e){console.error('79차 동굴 상자 모양',e)}}}
/* 광산 안 자리 */
const mo79Rail=(x,z,d)=>M74.rails.some(s=>m74seg(x,z,s[0],s[1])<d);
function mo79Spot(x0,z0,r,rail,taken,gap,max){for(let rr=0;rr<=max;rr+=.6)for(let k=0;k<(rr?Math.max(8,Math.round(rr*5)):1);k++){const a=k/Math.max(8,Math.round(rr*5))*Math.PI*2+rr,x=x0+Math.cos(a)*rr,z=z0+Math.sin(a)*rr;
  if(!mineOpen(x,z,r)||mo79Rail(x,z,rail)||taken.some(q=>Math.hypot(q[0]-x,q[1]-z)<gap))continue;return[x,z]}return null}
function mo79Build(){const C=INT.gr.cave;if(!C||!M74.W)return;const taken=[];MO79.list.length=0;MO79.chests.length=0;
 /* ② 보물 상자: 방 가운데(묶음의 첫 방 가운데)에서 가장 가까운 트인 자리 */
 MO79_ROOMS.forEach((g,k)=>{const h=M74.halls[g[0]],q=mo79Spot(h[0],h[1],1.9,3.2,taken,6,Math.min(h[2],h[3])*.8);if(!q){console.warn('동굴 보물 상자 자리 없음',k);return}taken.push(q);MO79.chests.push({k,lx:q[0],lz:q[1],room:g[0]})});
 /* ① 광물 */
 const ent=[0,124],c=3;let n=0;
 for(let x=-150;x<=150&&n<130;x+=c)for(let z=-136;z<=138&&n<130;z+=c){const h=hash((x+200)|0,(z+200)|0,7901);if(h>.075)continue;const px=x+(hash(x|0,z|0,7903)-.5)*2,pz=z+(hash(x|0,z|0,7905)-.5)*2;
  if(Math.hypot(px-ent[0],pz-ent[1])<16||!mineOpen(px,pz,1.6)||mo79Rail(px,pz,2.8)||taken.some(q=>Math.hypot(q[0]-px,q[1]-pz)<4.6))continue;
  taken.push([px,pz]);const t=mo79Pick(hash(px*3|0,pz*3|0,7907)),b=hash(px*5|0,pz*7|0,7909)<.3?'b':'e',base=b==='b'?'rockB':'rock_single_E',gk=t==='rock'?base:'mo79_'+t+'_'+b;
  if(!GEO[gk]){const g=ore79Geo(t,base,1);if(!g)continue;GEO[gk]=g}
  const T=OBJT[3],o={t:3,x:0,z:0,y:INT.y,hp:T.hp,re:0,sc:lerp(T.s[0],T.s[1],hash(px*9|0,pz*9|0,7911))*.92,rot:hash(px|0,pz*2|0,7913)*6.28,sh:0,gk,cave:1,lx:px,lz:pz,key:'m79:'+n};if(t!=='rock')o.ore=t;
  [o.x,o.z]=mo79W(px,pz);o.sol=[px,pz,1.0];o.sol0=1.0;m74solid(px,pz,0);{const L=M74.solids.get(Math.floor(px/8)+','+Math.floor(pz/8));L[L.length-1]=o.sol}
  MO79.list.push(o);n++}
 const cnt={};for(const o of MO79.list){o.ii=cnt[o.gk]=cnt[o.gk]||0;cnt[o.gk]++}
 for(const k in cnt){const im=new THREE.InstancedMesh(GEO[k],MAT,cnt[k]);im.castShadow=im.receiveShadow=true;im.frustumCulled=false;for(let i=0;i<cnt[k];i++){C1.setRGB(1,1,1);im.setColorAt(i,C1)}C.add(im);MO79.im[k]=im}
 for(const o of MO79.list){const k=hash(o.lx*7|0,o.lz*7|0,3),b=.86+k*.24;C1.setRGB(b,b,b*.98);MO79.im[o.gk].setColorAt(o.ii,C1);refreshObj(o)}for(const k in MO79.im)MO79.im[k].instanceColor.needsUpdate=true;
 MO79.built=1;mo79Ensure()}
/* 새 게임 등으로 objs·structs가 새로 만들어졌으면 다시 넣어요 */
function mo79Ensure(){if(!MO79.built)return;for(const o of MO79.list)if(objs.get(o.key)!==o){o.re=0;o.hp=OBJT[3].hp;o.sh=0;objs.set(o.key,o);refreshObj(o)}
 const hk=typeof CAVE!=='undefined'&&CAVE.s?homeKey(CAVE.s):null;for(const c of MO79.chests){if(c.s&&structs.includes(c.s))continue;const [x,z]=mo79W(c.lx,c.lz);
  c.s=addStruct({t:'mc79',x,z,r:0,in:1,hk,li:'mc79_'+c.k,yo:INT.y-hAt(x,z),hp:1e9});if(c.s.m)c.s.m.visible=INT.on&&INT.kind==='cave';mc79Look(c.s);
  if(!c.sol){c.sol=1;m74solid(c.lx,c.lz,.95)}
  if(c.s.m&&!c.s.glw){const l=glow(0xffd36a,2.6,.35);l.position.set(0,1.0,0);c.s.m.add(l);c.s.glw=l}}}
{const _cr=caveRoom;caveRoom=function(){const was=!!INT.gr.cave;const r=_cr.apply(this,arguments);try{if(!was&&INT.gr.cave)mo79Build();else mo79Ensure()}catch(e){console.error('79차 동굴 광물·상자',e)}return r}}
/* 광물 그리기(광산 그룹 안 좌표) */
{const _ro=refreshObj;refreshObj=function(o){if(!o||!o.cave)return _ro.apply(this,arguments);const im=MO79.im[o.gk];if(!im)return;const m=MO79.m,hide=o.re>0;
  m.position.set(o.lx,-.05,o.lz);m.rotation.set(0,o.rot,o.sh>0?Math.sin(o.sh*40)*o.sh*.5:0);m.scale.setScalar(hide?1e-4:o.sc);m.updateMatrix();im.setMatrixAt(o.ii,m.matrix);im.instanceMatrix.needsUpdate=true;if(o.sol)o.sol[0]=hide?1e9:o.lx}}   /* 캐서 사라지면 부딪힘도 치워요 */
/* 광산 안에서 가까운 광물 잡기(바깥 objs 칸 찾기는 세상 좌표 칸이라 광산 광물을 못 봐요) */
function mo79Near(fx,fz,ax,az){if(!(INT.on&&INT.kind==='cave')||!MO79.built)return null;let best=null,bd=1e9;
 for(const o of MO79.list){if(o.re>0||Math.abs(o.x-P.x)>5||Math.abs(o.z-P.z)>5)continue;const T=OBJT[3],dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz),gap=d-T.r;
  if(ax!==undefined){if(gap>TREACH+.5||(dx*ax+dz*az)/(d||1)<.35)continue}else if(gap>TREACH)continue;
  if(gap<bd){bd=gap;best={k:'o',o,key:o.key,x:o.x,z:o.z,lab:o.ore?ORE79[o.ore].n+' 캐기':T.lab,rr:T.r+.7,gap}}}return best}
{const _ft=findTarget;findTarget=function(){const t=_ft.apply(this,arguments);if(t&&!(t.k==='s'&&t.s&&t.s.t==='int_exit'))return t;const o=mo79Near();if(o&&(!t||o.gap<.5))return o;return t}}
{const _rj=rjObj;rjObj=function(ax,az){return _rj.apply(this,arguments)||mo79Near(0,0,ax,az)}}
/* 보물 상자: 남은 게 있으면 열기, 비었으면 며칠 뒤, 새로 열려면 9999 동전 */
const mc79Box=s=>{const b=boxGet(s);return b&&boxLeft(b)?b:null};
const mc79Cool=s=>!mc79Box(s)&&S.looted[s.li]&&S.day-S.looted[s.li]<boxCd(s);
function mc79Look(s){if(!s||!s.m||!s.m.children[0])return;const open=!!mc79Box(s)||mc79Cool(s);s.m.children[0].geometry=GEO[open?'mc79_open':'mc79'];if(s.glw)s.glw.visible=!open}
{const _sl=sLabel;sLabel=function(s){if(s.t!=='mc79')return _sl(s);if(s.in&&s.hk!==curHK())return null;mc79Look(s);return mc79Box(s)?'보물 상자 열기':mc79Cool(s)?null:`💰 ${MO79.price} · 보물 상자`}}
const MC79={s:null};
{const _it=interact;interact=function(){const t=target;if(!(t&&t.k==='s'&&t.s.t==='mc79'))return _it.apply(this,arguments);if(!inp.actEdge)return;const s=t.s;
  if(mc79Box(s)){boxOpen(s);return}if(mc79Cool(s)){toast('비어 있어요. 며칠 뒤 다시 채워져요');return}MC79.s=s;openPanel('mc79')}}
function mc79Html(){const p=MO79.price,ok=S.coins>=p;
 return`<div class="row" style="align-items:center">${invIcon('coin')}<div class="tx">잠긴 보물 상자<small>${p} 동전을 내면 열려요 · 안에는 보급 상자처럼 아이템이 들어 있어요 · 다 비우면 3일 뒤 다시 채워져요</small></div></div>`+
  `<div class="bxf"><span class="bxm">${ok?'':`동전이 ${p-S.coins} 모자라요`}</span><button class="btn" data-a="mc79pay" ${ok?'':'disabled'}>💰 ${p} 동전 내고 열기</button></div>`}
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);if(panel==='mc79'){$('ptabs').innerHTML='<div class="tab on">💰 동굴 보물 상자</div>';$('pbody').innerHTML=mc79Html();return}
  if(panel==='box'&&BOX.s&&BOX.s.t==='mc79'){$('ptabs').innerHTML='<div class="tab on">💰 동굴 보물 상자</div>';const e=$('pbody').querySelector('.sec');if(e)e.textContent='💰 동굴 보물 상자 · 누르면 내 가방으로'}}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="mc79pay"]');if(!b||b.disabled||panel!=='mc79')return;const s=MC79.s;if(!s)return;if(S.coins<MO79.price){toast('동전이 모자라요');return}
 S.coins-=MO79.price;sfx(660,.08);sfx(990,.06,'sine',.03);toast(`💰 ${MO79.price} 동전을 냈어요 — 보물 상자가 열려요`);hudDirty=true;closePanel();boxOpen(s);mc79Look(s)});
{const _ba=boxAfter;boxAfter=function(){const s=BOX.s;const r=_ba.apply(this,arguments);if(s&&s.t==='mc79')mc79Look(s);return r}}
