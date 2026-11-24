'use strict';
/* ===== 74차(디자인, 기획자 11-23 22:16): 수상 텐트 · 채굴 텐트 → 채굴 기지 =====
   기획자: '수상 전용 텐트를 만들 거야. 수상 텐트는 깊은 바다에만 설치 가능하고 조금이라도 얕은 물이나 땅이랑 겹치면 설치가 안 돼.
           그리고 채굴 텐트를 칠 거고 업그레이드하면 채굴 기지가 돼. 채굴 기지는 광물을 캐 주는 건데 그거는 나중에.
           수상 전용 텐트도 업그레이드가 두 가지 있어 — 낚시가옥이랑 석유시추기지, 이거는 알고만 있어'.
   - 둘 다 보통 텐트(ptent)와 같은 '내 기지' 텐트: [들어가기] → 텐트 방, 내 구역 12.6m, 실제 시간 12시간 뒤 사라짐, 키트로 설치·철거하면 키트.
   - 수상 텐트 wtent: 물에 뜨는 판자 마루(파란 부표 넷) 위 청록 텐트. 마루 전체 + 0.5m가 모두 깊은 바다(seaDeep)이고 땅·얕은 물·부두와
     하나도 안 겹칠 때만 놓아요. 마루는 걸을 수 있고(물 높이 + 0.22라 헤엄치다 바로 올라와요), 문 앞(+z) 마루에서 나와요.
     업그레이드(낚시가옥·석유시추기지)는 기획자가 정할 때 — BUILDS.wtent.upg를 붙이면 작업대 창에 저절로 떠요.
   - 채굴 텐트 minetent: 땅에 치는 국방색 텐트 + 곡괭이·광석 상자·랜턴. 텐트 안 작업대에서 돌 80·나무 40(임시)을 넣고
     [업그레이드] → 채굴 기지 minebase(함석 창고 + 작은 권양탑 + 광석 통, 사라지지 않음, 안은 집 방). 광물 캐기는 나중에.
   - 키트 가격·재료는 임시. 키트는 랜덤 자판기에 저절로 나와요. 멀티 서버는 아직 새 텐트를 몰라요(서버 마무리 때). */
Object.assign(ITEMS,{
 kit_wtent:{n:'수상 텐트',ic:'t74_wtent',ty:'kit',b:'wtent',p:900,d:'깊은 바다에만 펼 수 있는 물 위 텐트. 내 기지가 되고 안에 들어갈 수 있어요'},
 kit_minetent:{n:'채굴 텐트',ic:'t74_minetent',ty:'kit',b:'minetent',p:800,d:'땅에 치는 채굴 텐트. 안의 작업대에서 채굴 기지로 업그레이드해요'}});
Object.assign(BUILDS,{
 wtent:{n:'수상 텐트',g:'t74_wtent',s:1,bx:1.75,bz:1.85,hp:240,c:{wood:14,plastic:6},kit:'kit_wtent',home:1,fixR:1,water:1,flat:1,deepOnly:1,deck:[2.8,2.6,4.2],
  d:'깊은 바다에만 펴요. 땅이나 얕은 물에 조금이라도 걸치면 안 돼요'},
 minetent:{n:'채굴 텐트',g:'t74_minetent',s:1,bx:1.8,bz:1.9,hp:240,c:{wood:10,stone:6},kit:'kit_minetent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,
  upg:{to:'minebase',c:{stone:80,wood:40}},d:'채굴 기지로 업그레이드할 수 있는 텐트예요'},
 minebase:{n:'채굴 기지',g:'t74_minebase',s:1,bx:1.85,bz:1.9,hp:700,c:{stone:80,wood:40},kit:'kit_minetent',home:1,fixR:1,foot:[2.05,2.1],tilt:.1,room:'house',hide:1,
  d:'채굴 텐트를 업그레이드한 기지예요. 광물 캐기는 준비 중이에요'}});
const T74_LIFE=['wtent','minetent'];

/* ---------- 모양 ---------- */
/* look.js의 텐트를 색만 바꿔 다시 만들어요(모양·크기는 땅 텐트와 같게) */
function t74tentGeo(rep){let s=lkTent.toString();for(const [a,b] of rep)s=s.split(a).join(b);return(0,eval)('('+s+')')()}
function t74models(){
 /* 75차(기획자: '원래 있던 거 바탕으로, 우리 스타일이랑 비슷해야 일관성이 있지'): 게임에 있던 모델을 바탕으로 —
    텐트 = 땅 텐트(노란 텐트 GEO.mtent) 그대로, 채굴 기지 = 집(GEO.phouse) 그대로 + 채굴 장비, 색은 게임 색(LKH 나무·크림·빨강·청록). */
 const W=[0xd18a50,0xc47d45,0xdb9659],WD=0x9a5a30,END=0xdcb98e,DK=0x3a3f4f,DK2=0x2c3346,CR=0xeee3cc,RED=0xdb5a4c,YEL=0xf2c94c,TEAL=0x3aa6b0,TEAL2=0x2f8f99,CONC=0xd6d0cc,ORE=[0xf2c230,0xd7743f,0x4fb39a,0xb6c2cf];
 const RB=(w,h,d,c,pos,rot)=>pt(lkRb(w,h,d,.05,.03),c,pos,rot);
 const G=(k,pos,rot,s)=>GEO[k]?pt(GEO[k],null,pos,rot||[0,0,0],[s,s,s]):null;
 const lampP=(x,z,H,ry)=>{const g=mg(lkLampParts(H));g.applyMatrix4(new THREE.Matrix4().makeRotationY(ry).setPosition(x,0,z));return g};
 const glass=(x,y,z)=>pt(new THREE.SphereGeometry(.15,14,8),0xffe2a0,[x,y,z],[0,0,0],[1,.55,1]);
 const pick=(x,y,z,ry,rz)=>G('lk_pick_adv',[x,y,z],[0,ry,rz],.9);
 const oreBox=(x,z,ry)=>{const p=[pt(lkRb(.72,.44,.56,.06,.03),W[0],[x,.22,z],[0,ry,0]),pt(lkRb(.75,.08,.59,.03,.02),WD,[x,.4,z],[0,ry,0])];for(let k=0;k<6;k++)p.push(pt(new THREE.IcosahedronGeometry(.12,0),ORE[k%4],[x-.2+(k%3)*.2,.5,z-.1+Math.floor(k/3)*.2],[k,k,0]));return p};
 /* 수상 텐트: 드럼통(게임 드럼통 4색)을 눕혀 엮은 뗏목 + 나무 판자 마루 + 노란 텐트 + 가로등·구명환 */
 {const p=[],gl=[],D=BUILDS.wtent.deck,hw=D[0],z0=-D[1],z1=D[2],zc=(z0+z1)/2,L=z1-z0,TOP=.26;
  for(const x of[-hw+.62,0,hw-.62])for(let i=0;i<6;i++){const z=z0+.6+i*(L-1.2)/5,g=G('lk_drum_'+((i+(x>0?1:x<0?2:0))%4),[x,-.25,z-.535],[Math.PI/2,0,0],1);if(g)p.push(g)}
  for(const x of[-hw+.62,0,hw-.62])p.push(RB(.22,.16,L-.2,WD,[x,.1,zc]));
  const nb=Math.round(L/.46);for(let i=0;i<nb;i++){const z=z0+(i+.5)*L/nb;p.push(pt(lkRb(2*hw-.06,.1,L/nb-.06,.03,.02),W[i%3],[0,TOP-.05,z]))}
  for(const sd of[-1,1])p.push(RB(.18,.12,L,WD,[sd*(hw-.09),TOP+.02,zc]));p.push(RB(2*hw,.12,.18,WD,[0,TOP+.02,z0+.09]),RB(2*hw,.12,.18,WD,[0,TOP+.02,z1-.09]));
  const tg=G('mtent',[0,TOP,0],[0,0,0],1.38);if(tg)p.push(tg);
  for(const [x,z] of[[-hw+.16,z0+.16],[hw-.16,z0+.16],[-hw+.16,z1-.16]])p.push(pt(cyl(.08,.09,.8,10),W[1],[x,TOP+.4,z]),pt(cyl(.1,.1,.05,10),END,[x,TOP+.82,z]));
  p.push(lkRod([-hw+.16,TOP+.66,z0+.16],[hw-.16,TOP+.66,z0+.16],.03,CR));
  /* 구명환(빨강·크림) 기둥 + 가로등(게임 등) + 밧줄 사리 + 상자 */
  {const x=-hw+.16,z=z1-.16;for(let k=0;k<8;k++)p.push(pt(new THREE.TorusGeometry(.32,.09,8,6,Math.PI/4),k%2?CR:RED,[x+.02,TOP+.95,z+.12],[0,0,k*Math.PI/4]))}
  {const g=lampP(hw-.3,z1-.3,1.75,Math.PI);g.translate(0,TOP,0);p.push(g);gl.push(glass(hw-.3,TOP+1.8,z1-.79))}
  {const coil=new THREE.TorusGeometry(.22,.05,6,14);for(let k=0;k<3;k++)p.push(pt(coil,CR,[1.0,TOP+.05+k*.05,z1-.5],[Math.PI/2,0,0],[1-k*.15,1-k*.15,1]));p.push(RB(.32,.14,.14,DK,[1.6,TOP+.07,z1-.2]))}
  p.push(RB(.56,.5,.5,W[2],[-1.2,TOP+.25,z1-.6]),RB(.58,.08,.52,WD,[-1.2,TOP+.46,z1-.6]));
  GEO.t74_wtent=mg(p);GEO.t74_wtent_glow=mg(gl)}
 /* 채굴 텐트: 땅 텐트 그대로(노란 텐트 1.45배) + 광석 상자·곡괭이·작은 등·곡괭이 그림 표지판 */
 {const p=[],gl=[];const tg=G('mtent',[0,0,0],[0,0,0],1.45);if(tg)p.push(tg);
  p.push(...oreBox(1.45,1.62,0));const pk=pick(-1.55,.4,1.55,.4,.3);if(pk)p.push(pk);
  {const g=lampP(-1.7,-1.6,1.2,Math.PI*.25);p.push(g);gl.push(glass(-1.7+Math.sin(Math.PI*.25)*.49,1.25,-1.6+Math.cos(Math.PI*.25)*.49))}
  if(typeof plBoardGeo==='function'){const b=pt(plBoardGeo(1.2,.5),null,[1.62,0,-1.5],[0,-.3,0],[.55,.55,.55]);p.push(b);for(const s of[-1,1])p.push(pt(lkRb(.05,.26,.03,.01,.005),DK,[1.62+s*.03,.73,-1.46],[0,-.3,s*.75]))}
  GEO.t74_minetent=mg(p);GEO.t74_minetent_glow=mg(gl)}
 /* 채굴 기지: 집(통나무 집) 그대로 0.78배 + 뒤 왼쪽 작은 권양탑(나무 기둥·빨간 도르래) + 앞 오른쪽 광차·광석 + 등 */
 {const p=[],gl=[],K=.78;const hg=G('phouse',[0,0,.05],[0,0,0],K);if(hg)p.push(hg);if(GEO.phouse_glow)gl.push(pt(GEO.phouse_glow,null,[0,0,.05],[0,0,0],[K,K,K]));
  {const cx=-1.55,cz=-1.45,b=.5,t=.2,Ht=5.4;for(const [a,c] of[[-1,-1],[1,-1],[-1,1],[1,1]])p.push(lkBeam([cx+a*b,0,cz+c*b],[cx+a*t,Ht,cz+c*t],.15,.15,a<0?W[1]:W[0]));
   for(const y of[1.6,3.1,4.4]){const k=y/Ht,q=b+(t-b)*k;for(const sd of[-1,1]){p.push(RB(2*q+.2,.12,.12,W[2],[cx,y,cz+sd*q]),RB(.12,.12,2*q+.2,W[2],[cx+sd*q,y,cz]))}}
   p.push(RB(.7,.14,.7,DK,[cx,Ht,cz]),pt(new THREE.TorusGeometry(.34,.07,8,16),RED,[cx,Ht+.36,cz],[0,Math.PI/2,0]),pt(cyl(.05,.05,.4,8),CR,[cx,Ht+.36,cz],[0,0,Math.PI/2]),pt(cyl(.015,.015,2.4,4),DK2,[cx,Ht-.9,cz+.34]))}
  {const x=1.45,z=1.85;p.push(pt(lkRb(.66,.36,.5,.08,.03),TEAL,[x,.44,z]),pt(lkRb(.72,.07,.56,.03,.02),CR,[x,.64,z]));for(const sd of[-1,1])for(const e of[-1,1])p.push(pt(cyl(.11,.11,.06,12),DK2,[x+e*.22,.24,z+sd*.28],[Math.PI/2,0,0]));
   for(let k=0;k<4;k++)p.push(pt(new THREE.IcosahedronGeometry(.1,0),ORE[k],[x-.18+k*.12,.7,z],[k,k,0]));for(const sd of[-1,1])p.push(RB(1.6,.05,.06,DK,[x,.03,z+sd*.22]))}
  for(let k=0;k<5;k++)p.push(pt(new THREE.IcosahedronGeometry(.15+(k%2)*.05,0),ORE[k%4],[1.7-(k%3)*.18,.12,.9-Math.floor(k/3)*.22],[k,k,0]));
  {const g=lampP(-1.75,1.75,1.9,0);p.push(g);gl.push(glass(-1.75,1.95,2.24))}
  GEO.t74_minebase=mg(p);GEO.t74_minebase_glow=mg(gl)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{t74models()}catch(e){console.error('tents74 모델',e)}try{lkAOnew(b0)}catch(e){}}}
/* 불빛 조각 + 밤 등불 */
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.m&&GEO[sdef(r).g+'_glow']&&/^(wtent|minetent|minebase)$/.test(r.t)){const k=sdef(r).s||1,g=GEO[sdef(r).g+'_glow'];r.m.children[0].add(mesh(g,HGLOW,false));
  const lp={wtent:[2.5,2.06,3.41],minetent:[-1.35,1.25,-1.25],minebase:[-1.75,1.95,2.24]}[r.t];if(lp&&typeof PLAMPS!=='undefined'){const l=glow(0xffc46a,2.2,.6);l.position.set(lp[0]*k,lp[1]*k,lp[2]*k);l.visible=false;r.m.add(l);PLAMPS.push(l)}}
  if(r&&r.own&&T74_LIFE.includes(r.t)&&!r.at)r.at=Date.now()}catch(e){console.error(e)}return r}}

/* ---------- 수상 텐트: 깊은 바다에만 ---------- */
/* 마루 + 0.5m 안 모든 점(0.5m 간격)이 깊은 바다이고, 땅·얕은 물·부두가 하나도 없어야 해요 */
function t74deepWhy(x,z,r,b){const D=b.deck,c=Math.cos(r||0),sn=Math.sin(r||0),m=.5;let land=0,shallow=0,dock=0;
 for(let lx=-D[0]-m;lx<=D[0]+m+1e-6;lx+=.5)for(let lz=-D[1]-m;lz<=D[2]+m+1e-6;lz+=.5){const wx=x+lx*c+lz*sn,wz=z-lx*sn+lz*c;
  if(hAt(wx,wz)>-.3){land++;break}if(onDock(wx,wz)){dock++;break}if(typeof seaDeep==='function'&&!seaDeep(wx,wz))shallow++}
 if(land)return'땅과 겹쳐요. 수상 텐트는 깊은 바다에만 펼 수 있어요';if(dock)return'부두 위에는 놓을 수 없어요';
 if(shallow)return'얕은 물과 겹쳐요. 더 먼 깊은 바다로 가요';return''}
const t74local=(dx,dz,r)=>{const c=Math.cos(r||0),sn=Math.sin(r||0);return[dx*c-dz*sn,dx*sn+dz*c]};
{const _w=waterSpotWhy;waterSpotWhy=function(x,z,r,b){if(b&&b.deepOnly)return t74deepWhy(x,z,r,b);return _w.apply(this,arguments)}}
/* 마루 위는 걸을 수 있어요(보이지 않는 부두, props.js PRF와 같은 방식) */
if(typeof PRF!=='undefined'){const D=BUILDS.wtent.deck;PRF.wtent={R:Math.hypot(D[0],Math.max(D[1],D[2]))+.5,f:(lx,lz)=>lx>-D[0]&&lx<D[0]&&lz>-D[1]&&lz<D[2]?.22:null}}

/* ---------- 12시간(실제 시간) — 보통 텐트와 같은 규칙 ---------- */
{const _h=hud;let t=0;hud=function(){_h();if(mode!=='play'||!S||busy||P.dead)return;const now=performance.now();if(now-t<1000)return;t=now;for(const s of structs.slice())if(T74_LIFE.includes(s.t)&&s.own&&s.at&&tentLeft(s)<=0)tentGone(s)}}
{const _d=drawFx;drawFx=function(dt){_d(dt);if(mode!=='play'||INT.on||!S)return;const c=fctx,k=Math.max(.8,UIS*1.25);
 for(const s of structs){if(!T74_LIFE.includes(s.t)||!s.own||!s.at||dist(P.x,P.z,s.x,s.z)>40)continue;const q=scr(s.x,(s.t==='wtent'?.22:groundY(s.x,s.z))+3.2,s.z);if(!q[2])continue;const ms=tentLeft(s);
  uiPill(c,'⏳ '+tentLeftTx(ms),q[0],q[1],10.5*k,ms<3600e3?'rgba(229,83,75,.92)':'rgba(91,61,43,.86)','#fff','rgba(255,255,255,.35)')}}}

/* ---------- 채굴 텐트 → 채굴 기지 업그레이드(작업대 창) ---------- */
let T74_MBIC;const t74mbIcon=()=>{if(T74_MBIC===undefined){try{T74_MBIC=lkIconFrom(GEO.t74_minebase,[.42,-.55,0],'build')}catch(e){T74_MBIC=null}}return T74_MBIC};
{const _uc=upCard;upCard=function(){let h=_uc();const I=upInfo();if(!I)return h;const mine=I.s.t==='minetent'||I.s.t==='minebase';if(!mine)return h;
 const hi=houseIcon(),mi=t74mbIcon();if(hi&&mi)h=h.split(hi).join(mi);if(ICON.kit_tent&&ICON.kit_minetent)h=h.split(ICON.kit_tent).join(ICON.kit_minetent);
 h=h.replace('나무를 다 넣으면 누를 수 있어요','재료를 다 넣으면 누를 수 있어요').replace('🏠 '+I.d.n,'⛏ '+I.d.n).replace('집으로 업그레이드했어요. 다음 업그레이드는 준비 중이에요','채굴 기지로 업그레이드했어요. 광물 캐기는 준비 중이에요').split('<span class="upe">🏠</span>').join('<span class="upe">⛏</span>');return h}}
{const _ug=upGo;upGo=function(){const I=upInfo();if(!I||!I.u||I.u.to!=='minebase')return _ug.apply(this,arguments);if(HUP.on)return;
 if(!I.ok){toast('재료를 다 넣어야 업그레이드할 수 있어요');return}if(window.MP){toast('멀티에서는 아직 업그레이드할 수 없어요');return}
 closePanel();joyEnd();P.auto=null;HUP.on=true;busy=true;const s=I.s,to='minebase',T=3600,f=$('respawn'),bar=$('rsBar'),st=$('rsSt');
 f.classList.add('house','on');f.querySelector('.rsT').textContent='⛏ 채굴 기지를 짓는 중…';f.querySelector('.rsH').textContent='넣어 둔 돌과 나무로 채굴 기지를 지어요';bar.style.width='0%';st.textContent='';
 const msgs=[[0,'텐트를 걷어요'],[.26,'바닥을 다지는 중…'],[.55,'함석 벽을 세워요'],[.8,'권양탑을 올려요']];sfx(180,.12,'square',.04);let t0=0,k0=-1;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='',mi=0;msgs.forEach(([a,q],i)=>{if(k>=a){m=q;mi=i}});if(mi!==k0){k0=mi;sfx(220+mi*60,.07,'square',.035)}if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  intOut();const ns=addStruct({t:to,x:s.x,z:s.z,r:s.r,own:1,kit:s.kit,hp:BUILDS[to].hp});removeStruct(s);
  S.home={x:ns.x,z:ns.z+BUILDS[to].bz+1.1};P.x=S.home.x;P.z=S.home.z;P.rot=0;P.auto=null;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent='다 지었어요!';save();
  setTimeout(()=>{f.classList.remove('on');busy=false;HUP.on=false;const y=groundY(ns.x,ns.z);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;puff(ns.x+Math.cos(a)*2.2,y+.5,ns.z+Math.sin(a)*2.1,0xb8b0a2,5,.8)}
   ftext(ns.x,y+5.2,ns.z,'⛏ 채굴 기지 완성!','#ffe08a');jingle([523,659,784,1047]);toast('⛏ 채굴 텐트가 채굴 기지가 됐어요! 광물 캐기는 준비 중이에요');hudDirty=true;setTimeout(()=>f.classList.remove('house'),700)},700)};
 requestAnimationFrame(step)}}
