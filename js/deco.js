/* 62차(디자인) — 가구 묶음 · 새 식물 5종 · 설탕 · 여행용 가방 (기획자 11-22 23:29)
   '가구 종류: 정사각형에 모서리 둥근 초록 덤불 장식(연두도 조금, 작지만 너무 작지 않게) · 카페트(캐릭터보다 좀 크게, 바닥에 까는 것 — 직사각형·원형·타원형)
    · 원형 나무의자 · 둥근 테이블 · 사각 테이블(둘 다 나무) · 눈사람 · 크리스마스 트리 · 나무상자 정사각형·직사각형 · 계단식 나무상자(계단처럼 이용)
    · 벽에 붙이는 액자(집 꾸밀 때나 구조물 옆, 우리 게임 관련 그림, 캐릭터 절반 크기 직사각형, 8가지) · 랜덤상자(모든 아이템이 균등한 확률) · 정원의자
    · 모든 가구·설치형 구조물은 겹치면 안 되고 딱 붙이는 건 돼야 · 토마토·양파·옥수수·카카오·칠리(야생 + 씨앗 + 식물 도감) · 설탕 · 여행용 가방(끼면 인벤 +10칸)'
   - 설치물은 모두 키트(kit_<id>)로 가방에서 눌러 놓고, 철거하면 키트가 돌아와요. 밖에도, 텐트·집 안에도(inok). 가격·재료는 임시.
   - 겹침 규칙은 actors.js bldHit(규칙 파일 한 줄씩), 여기서는 '딱 붙이기'를 쉽게 해 주는 자석 맞춤(dcSnap)만.
   - 계단 나무상자는 올라설 수 있어요(onDock 감싸기, 한 칸 0.45m). 카페트는 바닥층이라 가구를 위에 놓을 수 있어요.
   index.html에서 이 줄을 빼면 62차 것만 꺼져요(ui.js BAG_N이 let이 된 것·actors.js 겹침 규칙은 남아요). */

/* ---------------- 정의 ---------------- */
const DC={snap:.32,walk:[]};
const DCB=[   /* [id, 이름, bx, bz, 키트 가격, 재료, 덧붙일 값] */
 ['deco_bush','덤불 장식',.42,.42,60,{wood:2},{d:'모서리가 둥근 네모 덤불. 꾸밈용'}],
 ['rug_rect','네모 카페트',1.2,.8,300,{cloth:6},{pass:1,floor:1,d:'바닥에 까는 카페트. 위에 가구를 놓을 수 있어요'}],
 ['rug_round','원형 카페트',1,1,300,{cloth:6},{pass:1,floor:1,d:'바닥에 까는 둥근 카페트. 위에 가구를 놓을 수 있어요'}],
 ['rug_oval','타원형 카페트',1.3,.85,300,{cloth:6},{pass:1,floor:1,d:'바닥에 까는 타원 카페트. 위에 가구를 놓을 수 있어요'}],
 ['stool_wood','둥근 나무 의자',.24,.24,120,{wood:3},{d:'둥근 나무 의자'}],
 ['table_wround','둥근 나무 테이블',.56,.56,300,{wood:6},{d:'둥근 나무 테이블'}],
 ['table_wsq','네모 나무 테이블',.6,.4,300,{wood:6},{d:'네모 나무 테이블'}],
 ['chair_garden','정원 의자',.38,.46,250,{wood:5},{d:'등받이가 비스듬한 정원 의자'}],
 ['snowman','눈사람',.45,.45,150,{stone:2},{d:'털모자·목도리를 한 눈사람'}],
 ['xmas_tree','크리스마스 트리',.62,.62,600,{wood:6},{d:'장식·별·선물 상자가 있는 트리'}],
 ['crate_sq','나무 상자',.3,.3,80,{wood:3},{d:'네모난 나무 상자'}],
 ['crate_rect','긴 나무 상자',.55,.3,120,{wood:4},{d:'긴 나무 상자'}],
 ['crate_stair','계단 나무 상자',.45,.75,200,{wood:8},{pass:1,walk:1,d:'세 칸으로 쌓은 상자. 계단처럼 올라가요(앞이 낮은 쪽)'}]];
/* 액자 8종: [id, 이름, 폭, 높이, 틀 색] — 모두 '벽에 붙이는' 얇은 것(wall:1, 집 안에서는 뒤 벽에 딱 붙어요) */
const DCF=[['frame_map','초승달섬 지도 액자',.92,.7,0x7a5236],['frame_dog','리트리버 초상 액자',.66,.82,0xf3ece0],['frame_plat','오리너구리 초상 액자',.66,.82,0x3aa6b0],
 ['frame_lh','등대의 밤 액자',.92,.7,0x3b4a6b],['frame_whale','고래 액자',.92,.7,0xd6965a],['frame_camp','캠프의 밤 액자',.92,.7,0x5f8f5a],
 ['frame_boat','통통배 항구 액자',.92,.7,0xe0533f],['frame_shark','망치상어 액자',.92,.7,0xd9a94e]];
for(const [id,n,w,h] of DCF)DCB.push([id,n,w/2,.05,400,{wood:3,cloth:1},{wall:1,d:'벽이나 구조물 옆에 붙이는 액자'}]);
for(const [id,n,bx,bz,p,c,o] of DCB){const d=o.d;
 BUILDS[id]=Object.assign({n,g:'dc_'+id,s:1,bx,bz,hp:60,c,kit:'kit_'+id,inok:1},o,{d:d+' (임시)'});
 ITEMS['kit_'+id]={n,ic:'dc_'+id,ty:'kit',b:id,p,d:d+'. 가방에서 눌러 놓아요 (임시)'}}
Object.assign(ITEMS,{
 rbox:{n:'랜덤 상자',ic:'dc_rbox',ty:'res',p:500,rbox:1,d:'열면 이 게임의 모든 아이템 중 하나가 똑같은 확률로 나와요. 가방에서 눌러 열어요 (임시)'},
 sugar:{n:'설탕',ic:'dc_sugar',ty:'res',p:40,d:'하얀 설탕 한 봉지 (임시)'},
 bag_travel:{n:'여행용 가방',ic:'dc_bag_travel',ty:'res',eq:'bag',one:1,p:2500,d:'가방 칸에 끼면 인벤토리가 10칸 늘어나요(20 → 30칸) (임시)'}});
/* 랜덤 상자는 무엇이든 나와서(권총 말고 총·모자 같은 고급 품목도) 기획자님 11-22 22:37 '고급 품목' 규칙처럼 랜덤 자판기·본섬 보급에서는 빼 둬요 */
if(typeof restrictedSupplyIds!=='undefined')restrictedSupplyIds.add('rbox');

/* ---------------- 새 식물 5종(야생 + 씨앗 + 도감) ---------------- */
const DCP=[{id:'tomato',n:'토마토',cat:'crop',v:'따기',n1:2,re:900,p:25},{id:'onion',n:'양파',cat:'crop',v:'캐기',n1:2,re:900,p:20},
 {id:'corn',n:'옥수수',cat:'crop',v:'따기',n1:2,re:900,p:30,cr:.22},{id:'cacao',n:'카카오',cat:'crop',v:'따기',n1:1,re:900,p:80,cr:.38},
 {id:'chili',n:'칠리',cat:'crop',v:'따기',n1:2,re:900,p:35}];
for(const q of DCP){if(PLANTS.some(o=>o.id===q.id))continue;PLANTS.push(q);
 ITEMS[q.id]={n:q.n,ic:'pi_'+q.id,ty:'plant',p:q.p,nov:1,d:`${PCAT[q.cat][0]}. 섬에서 자라요 (식물 도감)`}}
if(typeof PLD!=='undefined')for(const q of DCP)PLD[q.id]=PLANTS.find(o=>o.id===q.id);   /* plants.js가 먼저 만든 표에도 */
/* 자라는 곳: tools/plant_zones62.py — 19차 12곳은 그대로, 같은 조건(본섬 땅 97%·설치 금지 원 5m·스폰 67m) + 길·구조물에서 떨어진 곳, 다른 구역과 가장 멀게.
   스폰에 가까울수록 값싼 것(양파 → 토마토 → 옥수수 → 칠리), 카카오는 나무가 빽빽한 곳(그늘) */
PLANT_SITES.push({p:'onion',x:458,z:644,r:22,c:11},{p:'tomato',x:482,z:752,r:22,c:11},{p:'cacao',x:494,z:308,r:22,c:11},{p:'corn',x:404,z:272,r:22,c:11},{p:'chili',x:710,z:500,r:22,c:11});
for(const q of DCP){const id=q.id;if(!FARM.ids.includes(id))FARM.ids.push(id);
 ITEMS['seed_'+id]={n:q.n+' 씨앗',ic:'lk_seed_'+id,ty:'kit',b:'crop_'+id,p:Math.max(10,Math.round(q.p*.5)),d:`땅에 심으면 ${FARM.T/60}분 뒤 ${q.n}${FARM.bat(q.n)?'을':'를'} 거둬요. 가방에서 눌러 심어요 (임시)`};
 BUILDS['crop_'+id]={n:q.n+' 밭',g:'pc_'+id+'_0',s:1,bx:.45,bz:.45,pass:1,hp:30,c:{['seed_'+id]:1},kit:'seed_'+id,crop:id,d:`${q.n} 씨앗을 심어요. ${FARM.T/60}분 뒤 거둬요 (임시)`}}

/* ---------------- 딱 붙이기(자석 맞춤) ----------------
   놓으려는 것과 이미 놓인 것(내가 지은 것, 같은 방향)이 0.32m 안으로 가깝거나 조금 겹치면, 모서리가 맞닿게 밀어 줘요. 옆으로 가운데·끝도 0.2m 안이면 맞춰요.
   맞춘 자리가 안 되면(다른 것과 겹침 등) 원래 자리 그대로. */
function dcSnap(b,pr){let best=null,bd=1e9;const rin=!!pr.in;
 for(const s of structs){const q=BUILDS[s.t];if(!q||q.grid||isZoneT(s.t)||!!s.in!==rin)continue;if(rin&&s.hk!==curHK())continue;if(!!q.floor!==!!b.floor)continue;
  if(Math.abs(((s.r||0)-(pr.r||0)+Math.PI*3)%(Math.PI*2)-Math.PI)>.01)continue;
  const c=Math.cos(s.r||0),sn=Math.sin(s.r||0),dx=pr.x-s.x,dz=pr.z-s.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c,ex=b.bx+q.bx,ez=b.bz+q.bz;if(Math.abs(lx)>ex+DC.snap||Math.abs(lz)>ez+DC.snap)continue;
  const al=(v,e1,e2)=>{if(Math.abs(v)<.2)return 0;for(const t of[e1-e2,e2-e1])if(Math.abs(v-t)<.2)return t;return v};   /* 가운데 맞춤 → 끝 맞춤 */
  const cand=[];if(Math.abs(lz)<ez-.02&&Math.abs(Math.abs(lx)-ex)<DC.snap)cand.push([Math.sign(lx||1)*ex,al(lz,b.bz,q.bz)]);
  if(Math.abs(lx)<ex-.02&&Math.abs(Math.abs(lz)-ez)<DC.snap)cand.push([al(lx,b.bx,q.bx),Math.sign(lz||1)*ez]);
  for(const [nx,nz] of cand){const m=Math.hypot(nx-lx,nz-lz);if(m<bd&&m>1e-4){bd=m;best={x:s.x+nx*c+nz*sn,z:s.z-nx*sn+nz*c}}}}
 return best}
{const _g=ghostPos;ghostPos=function(){const pr=_g.apply(this,arguments);const b=BUILDS[bmode];if(!b||b.grid||b.water||isZoneT(bmode)||bmode==='demo')return pr;
 let sn=dcSnap(b,pr);
 /* 액자는 텐트·집 안에서 뒤 벽 1m 안이면 벽에 딱 붙여요 */
 if(b.wall&&pr.in&&INT.on){const E=rotExt(b.bx,b.bz,pr.r||0),wz=INT.z-INT.hd+E[1];if(pr.z-wz<1&&pr.z-wz>.002)sn={x:sn?sn.x:pr.x,z:wz}}if(!sn)return pr;const sv=[BPIN.on,BPIN.x,BPIN.z];BPIN.on=true;BPIN.x=sn.x;BPIN.z=sn.z;
 try{const p2=_g.apply(this,arguments);return p2.ok||!pr.ok?Object.assign(p2,{snap:1}):pr}finally{BPIN.on=sv[0];BPIN.x=sv[1];BPIN.z=sv[2]}}}

/* ---------------- 계단 나무상자: 올라서기 ----------------
   앞(+z) 칸 0.45m → 가운데 0.9m → 뒤 1.35m. 한 걸음 0.55m까지 올라가니(13차 STEP_UP) 앞에서부터 한 칸씩, 옆에서 높은 칸은 벽처럼 막혀요. */
const DCW={crate_stair:(x,z)=>{if(Math.abs(x)>.45||Math.abs(z)>.75)return null;return z>=.25?.45:z>=-.25?.9:1.35}};
function dcWalkAt(x,z){let best=null;for(const s of DC.walk){if(!s.m||!s.m.parent)continue;if(s.in&&(!INT.on||s.hk!==curHK()))continue;const dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz>1.2)continue;
  const c=Math.cos(s.r||0),sn=Math.sin(s.r||0),h=DCW[s.t](dx*c-dz*sn,dx*sn+dz*c);if(h==null)continue;const y=s.m.position.y+.02+h;
  if(!best||y>best.y){best=s._pd||(s._pd={x:0,z:0,c:1,s:0,hw:0,hl:0,y:0,pr:1});best.x=s.x;best.z=s.z;best.y=y}}return best}
{const _od=onDock;onDock=function(x,z){const d=_od(x,z);if(!DC.walk.length)return d;const w=dcWalkAt(x,z);return w&&(!d||w.y>d.y)?w:d}}
{const _as=addStruct;addStruct=function(s){const r=_as.apply(this,arguments);const o=r||s;if(o&&DCW[o.t])DC.walk.push(o);return r}}
{const _rs=removeStruct;removeStruct=function(s){const i=DC.walk.indexOf(s);if(i>=0)DC.walk.splice(i,1);return _rs.apply(this,arguments)}}

/* ---------------- 랜덤 상자: 모든 아이템 중 하나(똑같은 확률) ----------------
   동전·랜덤 상자 자신·옛 물고기(old)는 빼요. 하나만 갖는 것(총 등)을 이미 가졌으면 다시 뽑아요. 탄알·화살은 자판기처럼 한 묶음. */
const rboxPool=()=>Object.keys(ITEMS).filter(k=>k!=='coin'&&k!=='rbox'&&!ITEMS[k].old&&ITEMS[k].n);
function rboxOpen(){if(!take('rbox',1))return;const L=rboxPool();let id=null;for(let i=0;i<40;i++){const k=L[Math.floor(Math.random()*L.length)];if(ITEMS[k].one&&invN(k)>0)continue;id=k;break}
 if(!id)id='coin';const n=id==='coin'?100:(VEND.pack&&VEND.pack[id])||1;give(id,n);
 const it=ITEMS[id];if(!P.moving)P.a.play('PickUp',{once:1,lock:.4,force:1});jingle([523,659,784,1047]);ftext(P.x,groundY(P.x,P.z)+3.2,P.z,`🎁 ${it.n}${n>1?' ×'+n:''}`,'#ffe08a');
 toast(`🎁 랜덤 상자를 열었어요 → ${it.n}${n>1?' ×'+n:''}`);hudDirty=true;if(panel==='bag')renderPanel()}
{const _b=bagTap;bagTap=function(k){const it=ITEMS[k];if(it&&it.rbox&&invN(k)){selItem=null;rboxOpen();return}return _b.apply(this,arguments)}}
{const _u=useItem;useItem=function(id){const it=ITEMS[id];if(it&&it.rbox){rboxOpen();return}return _u.apply(this,arguments)}}

/* ---------------- 여행용 가방: 가방 칸에 끼면 인벤 20 → 30칸 ---------------- */
const DC_BAG={base:20,add:{bag_travel:10}};
function dcBagSync(){const k=typeof eqGet==='function'&&S&&S.eq?eqGet('bag'):null,n=DC_BAG.base+((k&&DC_BAG.add[k])||0);if(BAG_N!==n){BAG_N=n;hudDirty=true;if(panel==='bag'||panel==='box')try{renderPanel()}catch(e){}}}
{const _s=eqSet;eqSet=function(slot,id){const r=_s.apply(this,arguments);dcBagSync();return r}}
{const _o=eqOff;eqOff=function(slot){if(slot==='bag'){const k=eqGet('bag');if(k&&DC_BAG.add[k]&&bagList().length+1>DC_BAG.base){toast(`🎒 가방을 빼면 ${DC_BAG.base}칸이 돼요 — 먼저 ${bagList().length+1-DC_BAG.base}칸을 비워요`);sfx(240,.06,'square',.03);return}}const r=_o.apply(this,arguments);dcBagSync();return r}}
{const _us=updStats;updStats=function(dt){const r=_us.apply(this,arguments);dcBagSync();return r}}

/* ---------------- 모양 ---------------- */
function dcModels(){
 const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const R=(w,h,d,c,p,r,cr=.03,bv=.016)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const RF=(w,d,h,c,p,ry=0,cr=.05)=>pt(lkRb(w,d,h,cr,Math.min(.006,h/2-.001)),c,p,[-Math.PI/2,0,ry]);   /* 바닥에 눕힌 둥근 네모(카페트 층) */
 const CY=(rt,rb,h,c,p,r,sc,n=18)=>pt(cyl(rt,rb,h,n),c,p,r,sc);
 const SP=(rad,c,p,sc,a=16,b=12)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,0,sc);
 const IC=(rad,c,p,r,sc,d=1)=>pt(new THREE.IcosahedronGeometry(rad,d),c,p,r,sc);
 const CN=(rad,h,c,p,r,n=16)=>pt(cone(rad,h,n),c,p,r);
 const TO=(Rr,t,c,p,r,sc,arc=Math.PI*2,n=28)=>pt(new THREE.TorusGeometry(Rr,t,8,n,arc),c,p,r,sc);
 const ROD=(a,b,r,c,n=8)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)};
 const LA=(prof,c,p,seg=18,sc)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg),c,p,0,sc);
 const H=(i,j,k=62)=>hash(i,j,k);
 const W1=0xd6965a,W2=0xc08550,W3=0x9c6a3e,WD=0x7a5236,CRm=0xf7f0e3;
 /* ===== 덤불 장식: 모서리 둥근 네모 덤불 + 잎 뭉치(초록·연두) ===== */
 {const G=[0x5f9a3c,0x6aae4c,0x7cbf5a,0x9ccf5a,0xb2d96a],p=[R(.8,.66,.8,0x4f8a38,[0,.36,0],0,.17,.13)];let n=0;
  const leaf=(x,y,z,nx,ny,nz)=>{const s=.07+H(n,1)*.05,c=G[(H(n,2)*G.length)|0];p.push(IC(s,c,[x+nx*.02,y+ny*.02,z+nz*.02],[n,n*1.7,0],[1,.8,1],0));n++};
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=-.3+i*.15+(H(i,j)-.5)*.05,z=-.3+j*.15+(H(j,i)-.5)*.05;leaf(x,.68-(Math.abs(x)>.25||Math.abs(z)>.25?.04:0),z,0,1,0)}
  for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])for(let i=0;i<4;i++)for(let j=0;j<3;j++){const t=-.27+i*.18+(H(i,j,7)-.5)*.05,y=.18+j*.17+(H(j,i,8)-.5)*.04;leaf(ax?ax*.39:t,y,az?az*.39:t,ax,0,az)}
  for(let k=0;k<6;k++){const a=k*1.05,r=.12+H(k,9)*.16;p.push(IC(.035,0xc6e07a,[Math.cos(a)*r,.74,Math.sin(a)*r],[k,0,0],[1,1.4,1],0))}
  put('dc_deco_bush',p,55)}
 /* ===== 카페트 3종(바닥에서 0.03m) ===== */
 {const p=[RF(2.4,1.6,.022,0xf1e2c4,[0,.011,0],0,.06),RF(2.3,1.5,.004,0xc9503f,[0,.024,0],0,.05),RF(2.12,1.32,.004,0xf6ecd6,[0,.027,0],0,.04),RF(1.96,1.16,.004,0x3a8f9a,[0,.03,0],0,.03),RF(1.86,1.06,.004,0xf6ecd6,[0,.033,0],0,.02)];
  const dia=(x,z,s,c,y)=>p.push(RF(s,s,.004,c,[x,y,z],Math.PI/4,.01));dia(0,0,.62,0xc9503f,.036);dia(0,0,.42,0xf2c230,.039);dia(0,0,.2,0x3a8f9a,.042);
  for(const [x,z] of [[-.62,0],[.62,0]]){dia(x,z,.28,0xe98a3a,.036);dia(x,z,.12,0xf6ecd6,.039)}for(const [x,z] of [[0,.36],[0,-.36],[-.36,.3],[.36,.3],[-.36,-.3],[.36,-.3]])dia(x,z,.08,0xc9503f,.036);
  for(const s of[1,-1])for(let i=0;i<9;i++)p.push(CY(.012,.012,.12,0xeadcb8,[s*1.25,.012,-.64+i*.16],[0,0,Math.PI/2],undefined,6));
  put('dc_rug_rect',p,30)}
 {const p=[],L=[[1,0x3a8f9a],[.92,0xf6ecd6],[.85,0xe98a3a],[.78,0xf6ecd6],[.6,0x3a8f9a],[.52,0xf6ecd6]];L.forEach(([r,c],i)=>p.push(CY(r,r,.02+i*.004,c,[0,.011+i*.002,0],0,undefined,56)));
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;p.push(pt(new THREE.SphereGeometry(.1,14,8),0xc9503f,[Math.cos(a)*.3,.031,Math.sin(a)*.3],[0,-a,0],[1.5,.05,.65]))}
  p.push(CY(.14,.14,.036,0xf2c230,[0,.02,0],0,undefined,24),CY(.06,.06,.04,0xe98a3a,[0,.022,0],0,undefined,16));
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;p.push(SP(.03,0xf6ecd6,[Math.cos(a)*.96,.024,Math.sin(a)*.96],[1,.35,1],8,6))}
  put('dc_rug_round',p,30)}
 {const p=[],C=[0xb5543a,0xd9a441,0xf3e6c8,0x8fae7a,0xb5543a,0xe9c27a,0x7a5a40,0xf3e6c8];
  C.forEach((c,i)=>{const r=1-i*.11;if(r<.15)return;p.push(CY(1,1,.02+i*.003,c,[0,.011+i*.0015,0],0,[1.3*r,1,.85*r+(1-r)*.25],56));
   if(i%2===0)for(let k=0;k<22;k++){const a=k/22*Math.PI*2;p.push(SP(.03,c,[Math.cos(a)*1.3*r,.02+i*.0015,Math.sin(a)*(.85*r+(1-r)*.25)],[1.4,.35,1],6,4))}});
  put('dc_rug_oval',p,30)}
 /* ===== 나무 가구 ===== */
 {const p=[LA([[0,0],[.22,0],[.235,.02],[.235,.045],[.22,.06],[0,.064]],W1,[0,.42,0],24),TO(.2,.012,W2,[0,.443,0],[Math.PI/2,0,0])];
  for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.5;p.push(ROD([Math.cos(a)*.13,.43,Math.sin(a)*.13],[Math.cos(a)*.2,0,Math.sin(a)*.2],.024,W2,10))}
  p.push(TO(.165,.013,W3,[0,.17,0],[Math.PI/2,0,0]));put('dc_stool_wood',p)}
 {const p=[LA([[0,0],[.55,0],[.56,.02],[.56,.04],[.55,.055],[0,.058]],W1,[0,.72,0],32),CY(.48,.48,.06,W2,[0,.69,0],0,undefined,28),
   CY(.06,.07,.62,W2,[0,.38,0],0,undefined,14),CY(.1,.08,.06,W3,[0,.66,0],0,undefined,14),CY(.12,.14,.06,W3,[0,.06,0],0,undefined,14)];
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4;p.push(ROD([Math.cos(a)*.08,.07,Math.sin(a)*.08],[Math.cos(a)*.36,.03,Math.sin(a)*.36],.035,W3,8),SP(.04,W3,[Math.cos(a)*.37,.03,Math.sin(a)*.37],[1,.7,1]))}
  for(let k=0;k<3;k++)p.push(CY(.42-k*.12,.42-k*.12,.003,W2,[0,.779+k*.0002,0],0,undefined,32));
  put('dc_table_wround',p)}
 {const p=[];for(let i=0;i<4;i++)p.push(R(.3-.008,.05,.8,i%2?W1:0xdca066,[-.45+i*.3,.755,0],0,.012,.008));
  p.push(R(1.08,.08,.68,W2,[0,.69,0],0,.02,.01));for(const [x,z] of [[-.5,-.32],[.5,-.32],[-.5,.32],[.5,.32]])p.push(R(.07,.68,.07,W3,[x,.34,z],0,.02,.01),R(.085,.03,.085,WD,[x,.015,z],0,.012,.008));
  p.push(R(.94,.035,.035,W3,[0,.16,-.32],0,.01,.006),R(.94,.035,.035,W3,[0,.16,.32],0,.01,.006));put('dc_table_wsq',p)}
 /* 정원 의자: 민트색 널 의자(비스듬한 높은 등받이 + 넓은 팔걸이) */
 {const M=0x7cc4b0,MD=0x5aa898,p=[];
  for(let i=0;i<5;i++)p.push(R(.62,.03,.09,M,[0,.4-i*.016,.2-i*.1],[-.16,0,0],.012,.008));
  for(let i=0;i<5;i++){const x=-.24+i*.12,h=.62+(2-Math.abs(i-2))*.05;p.push(R(.1,h,.03,M,[x,.42+h/2-.1,-.28],[-.38,0,0],.03,.01))}
  p.push(R(.66,.05,.03,MD,[0,.6,-.33],[-.38,0,0],.012,.008),R(.66,.05,.03,MD,[0,.88,-.43],[-.38,0,0],.012,.008));
  for(const s of[1,-1]){p.push(R(.13,.03,.74,M,[s*.36,.62,-.02],0,.03,.01),R(.05,.62,.05,MD,[s*.33,.31,.24],0,.015,.008),R(.05,.5,.05,MD,[s*.33,.25,-.24],[.25,0,0],.015,.008),
   R(.04,.1,.6,MD,[s*.33,.34,0],[-.16,0,0],.01,.006))}
  put('dc_chair_garden',p)}
 /* ===== 눈사람: 눈덩이 셋 + 숯 눈·단추 + 당근 코 + 나뭇가지 팔 + 빨간 목도리 + 청록 털모자 ===== */
 {const SN=0xf6f8fb,SN2=0xe3ebf3,CO=0x2b2f36,p=[CY(.5,.52,.03,SN2,[0,.015,0],0,undefined,24),SP(.42,SN,[0,.4,0],[1,.92,1],22,16),SP(.31,SN,[0,.95,0],[1,.95,1],20,14),SP(.22,SN,[0,1.38,0],0,18,14)];
  for(let k=0;k<3;k++)p.push(SP(.032,CO,[0,1.07-k*.13,.27+k*.012-(k===0?.02:0)],[1,1,.6],10,8));
  for(const s of[1,-1])p.push(SP(.03,CO,[s*.075,1.43,.19],[1,1,.6],10,8));for(let k=0;k<5;k++){const a=(k-2)*.28;p.push(SP(.016,CO,[Math.sin(a)*.1,1.31+Math.cos(a)*.0-Math.abs(k-2)*-.012,.2-.01*Math.abs(k-2)],0,8,6))}
  p.push(CN(.04,.2,0xf28c38,[0,1.38,.3],[Math.PI/2,0,0],12));
  for(const s of[1,-1]){p.push(ROD([s*.26,1.02,0],[s*.62,1.28,.02],.02,0x6b4a35,6),ROD([s*.5,1.19,.01],[s*.6,1.38,.03],.013,0x6b4a35,5),ROD([s*.55,1.23,.01],[s*.7,1.24,.0],.012,0x6b4a35,5))}
  p.push(TO(.19,.055,0xe0533f,[0,1.18,0],[Math.PI/2,0,0],[1,1,.8]),R(.1,.3,.04,0xe0533f,[.1,1.02,.2],[.15,0,-.12],.03,.015));for(let k=0;k<3;k++)p.push(R(.104,.025,.045,0xf7f0e3,[.1+k*.004,.93+k*.07,.2],[.15,0,-.12],.008,.005));
  p.push(SP(.2,0x3aa6b0,[0,1.5,0],[1.05,.75,1.05],16,10),TO(.2,.04,0x2f8f99,[0,1.47,0],[Math.PI/2,0,0]),SP(.07,0xf7f0e3,[0,1.68,0],0,10,8));
  put('dc_snowman',p)}
 /* ===== 크리스마스 트리: 나무 받침 + 층층 초록 + 장식 공 + 금빛 줄 + 별 + 선물 상자 ===== */
 {const GA=0x2f7a4a,GB=0x3a8f56,GC=0x45a060,p=[R(.5,.3,.5,0xc9503f,[0,.15,0],0,.04,.02),R(.52,.05,.52,0xf2c230,[0,.29,0],0,.02,.01),CY(.08,.1,.3,WD,[0,.42,0],0,undefined,10)];
  const T=[[.68,.62,.55],[.56,.56,.98],[.43,.5,1.36],[.3,.44,1.7]];T.forEach(([r,h,y],i)=>{p.push(CN(r,h,[GA,GB,GC,GB][i],[0,y,0],0,20));for(let k=0;k<10;k++){const a=k/10*Math.PI*2+i*.3;p.push(CN(.07,.12,[GA,GC][k%2],[Math.cos(a)*r*.92,y-h/2+.03,Math.sin(a)*r*.92],[Math.cos(a)*.0,0,0],5))}});
  const BALL=[0xe0533f,0xf2c230,0x3f7fd0,0xf7f0e3,0x8b5cc9];let n=0;T.forEach(([r,h,y],i)=>{for(let k=0;k<(7-i);k++){const a=k/(7-i)*Math.PI*2+i*.7,t=.25+H(k,i)*.3,rr=r*(1-t)*.95+.03;p.push(SP(.045,BALL[n++%5],[Math.cos(a)*rr,y-h/2+h*t,Math.sin(a)*rr],0,10,8))}});
  {const pts=[],rAt=y=>{let r=.05;for(const [tr,th,ty] of T){const y0=ty-th/2,y1=ty+th/2;if(y>=y0&&y<=y1)r=Math.max(r,tr*(1-(y-y0)/th))}return r};for(let i=0;i<=120;i++){const t=i/120,y=.42+t*1.42,r=rAt(y)*.93+.012;pts.push(new THREE.Vector3(Math.cos(t*Math.PI*7)*r,y,Math.sin(t*Math.PI*7)*r))}p.push(pt(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),200,.014,5,false),0xf2d36a))}
  {const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.07:.16,a=i/10*Math.PI*2;st[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r)}const g=new THREE.ExtrudeGeometry(st,{depth:.05,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2});g.translate(0,0,-.025);p.push(pt(g,0xf7d94a,[0,2.0,0]))}
  for(const [x,z,w,h,c,rc] of [[.42,.32,.24,.2,0x3f7fd0,0xf7f0e3],[-.4,.36,.2,.16,0xf7f0e3,0xe0533f],[.1,.5,.18,.14,0x5bae5f,0xf2c230]]){p.push(R(w,h,w,c,[x,h/2,z],[0,x,0],.02,.012),R(w+.01,h+.01,.04,rc,[x,h/2,z],[0,x,0],.006,.004),R(.04,h+.01,w+.01,rc,[x,h/2,z],[0,x,0],.006,.004));for(const s of[1,-1])p.push(TO(.035,.012,rc,[x+s*.03,h+.02,z],[0,x+s*.6,0],[1,1,.6]))}
  put('dc_xmas_tree',p,38)}
 /* ===== 나무 상자(네모·긴 것·계단) ===== */
 const crate=(p,w,h,d,x,y,z,lite)=>{const LT=0xd9a468,DK=0xa8743f,e=.055,RB=(a,b,c,col,q)=>pt(box(a,b,c),col,q),R=lite?((a,b,c,col,q,r)=>pt(box(a,b,c),col,q,r)):(a,b,c,col,q,r,cr,bv)=>pt(lkRb(a,b,c,cr==null?.03:cr,bv==null?.016:bv),col,q,r);p.push(R(w-.02,h-.02,d-.02,LT,[x,y+h/2,z],0,.01,.006));
  for(const sy of[0,1])for(const sz of[-1,1])p.push(R(w,e,e,DK,[x,y+(sy?h-e/2:e/2),z+sz*(d/2-e/2)],0,.012,.008));for(const sy of[0,1])for(const sx of[-1,1])p.push(R(e,e,d,DK,[x+sx*(w/2-e/2),y+(sy?h-e/2:e/2),z],0,.012,.008));
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(R(e,h,e,DK,[x+sx*(w/2-e/2),y+h/2,z+sz*(d/2-e/2)],0,.012,.008));
  const nl=Math.max(2,Math.round(h/.15));for(let i=1;i<nl;i++){const yy=y+h*i/nl;p.push(pt(box(w-.08,.008,.004),0x8a5a36,[x,yy,z+d/2-.008]),pt(box(w-.08,.008,.004),0x8a5a36,[x,yy,z-d/2+.008]),pt(box(.004,.008,d-.08),0x8a5a36,[x+w/2-.008,yy,z]),pt(box(.004,.008,d-.08),0x8a5a36,[x-w/2+.008,yy,z]))}
  const dg=(ax,az,L1,L2,face)=>{const a=Math.atan2(h-2*e,L1-2*e),L=Math.hypot(L1-2*e,h-2*e);p.push(face==='z'?R(L,.05,.02,DK,[x,y+h/2,z+az*(d/2+.006)],[0,0,az>0?a:-a],.01,.006):R(.02,.05,L,DK,[x+ax*(w/2+.006),y+h/2,z],[ax>0?-a:a,0,0],.01,.006))};
  dg(0,1,w,0,'z');dg(0,-1,w,0,'z');p.push(R(.02,Math.hypot(d-2*e,h-2*e),.05,DK,[x+w/2+.006,y+h/2,z],[Math.atan2(d-2*e,h-2*e),0,0],.01,.006),R(.02,Math.hypot(d-2*e,h-2*e),.05,DK,[x-w/2-.006,y+h/2,z],[-Math.atan2(d-2*e,h-2*e),0,0],.01,.006));
  for(let i=0;i<4;i++)p.push(pt(box(w-.1,.006,.012),0x8a5a36,[x,y+h+.001,z-d/2+.08+i*(d-.16)/3]))};
 {const p=[];crate(p,.6,.6,.6,0,0,0);put('dc_crate_sq',p)}
 {const p=[];crate(p,1.1,.55,.6,0,0,0);put('dc_crate_rect',p)}
 {const p=[];for(let i=0;i<3;i++)for(let j=0;j<=i;j++)crate(p,.9,.45,.5,0,j*.45,.5-i*.5,1);put('dc_crate_stair',p)}
 /* ===== 액자 8종: 뒤판(z −0.05~0) + 틀 + 납작한 그림(우리 게임 장면) ===== */
 for(const [id,n,FW,FH,FC] of DCF){const Yc=1.22,p=[],t=.055,w=FW-2*t,h=FH-2*t;let L=0;
  p.push(R(FW-.02,FH-.02,.03,0x5b4636,[0,Yc,-.035],0,.01,.006));
  p.push(R(FW,t,.05,FC,[0,Yc+FH/2-t/2,-.01],0,.014,.01),R(FW,t,.05,FC,[0,Yc-FH/2+t/2,-.01],0,.014,.01),R(t,FH-2*t,.05,FC,[FW/2-t/2,Yc,-.01],0,.014,.01),R(t,FH-2*t,.05,FC,[-FW/2+t/2,Yc,-.01],0,.014,.01));
  const Z=()=>-.016+(L++)*.0009,flat=(g,c)=>{p.push(pt(g,c,[0,Yc,Z()]))};
  const rect=(x0,y0,x1,y1,c)=>{const g=new THREE.PlaneGeometry(Math.abs(x1-x0)*w,Math.abs(y1-y0)*h);g.translate((x0+x1)/2*w,(y0+y1)/2*h,0);flat(g,c)};
  const poly=(pts,c)=>{const s=new THREE.Shape();pts.forEach((q,i)=>s[i?'lineTo':'moveTo'](q[0]*w,q[1]*h));flat(new THREE.ShapeGeometry(s),c)};
  const ell=(cx,cy,rx,ry,c,a0=0,a1=Math.PI*2,seg=28)=>{const s=new THREE.Shape();s.moveTo(cx*w,cy*h);for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;s.lineTo((cx+Math.cos(a)*rx)*w,(cy+Math.sin(a)*ry)*h)}flat(new THREE.ShapeGeometry(s),c)};
  const circ=(cx,cy,r,c,a0,a1)=>ell(cx,cy,r*h/w,r,c,a0,a1);   /* r는 높이 기준(찌그러지지 않게) */
  const bands=(cs)=>cs.forEach((c,i)=>rect(-.5,.5-(i+1)/cs.length,.5,.5-i/cs.length,c));
  const stars=(k,y0)=>{for(let i=0;i<k;i++)circ(-.46+H(i,3)*.92,y0+H(i,4)*(.5-y0-.03),.006+H(i,5)*.006,0xfff6d0)};
  if(id==='frame_map'){rect(-.5,-.5,.5,.5,0xead7ae);rect(-.46,-.44,.46,.44,0x5fb6d6);circ(0,-.02,.33,0x8fd3e3);circ(0,-.02,.29,0xe8d39a);circ(0,-.02,.27,0x7cbf5a);circ(.13,.08,.25,0x5fb6d6);
   circ(.08,.05,.205,0x8fd3e3,-1.2,2.4);circ(.13,.08,.215,0x5fb6d6);for(const [x,y,r] of [[.3,-.28,.05],[-.36,.3,.04],[.36,.3,.06],[-.38,-.3,.035],[.3,.34,.025]]){circ(x,y,r+.015,0xe8d39a);circ(x,y,r,0x7cbf5a)}
   for(const [x,y] of [[-.24,-.12],[-.08,-.27],[-.25,.12],[.02,-.3],[-.16,.22]])circ(x,y,.022,0xe0533f);
   {const cx=.36,cy=-.3,r=.08;poly([[cx,cy+r*1.2],[cx+.015,cy],[cx,cy-r*1.2],[cx-.015,cy]],0xf7f0e3);poly([[cx-r*.9,cy],[cx,cy+.02],[cx+r*.9,cy],[cx,cy-.02]],0xf7f0e3);circ(cx,cy+r*1.2+.03,.012,0xe0533f)}}
  if(id==='frame_dog'){bands([0xf8d98a,0xf6cf76,0xf4c562]);for(let k=0;k<12;k++){const a=k/12*Math.PI*2,cl=b=>{const dx=Math.cos(b),dy=Math.sin(b),t=Math.min(.5/Math.max(1e-3,Math.abs(dx)),(dy>0?.45:.55)/Math.max(1e-3,Math.abs(dy)));return[dx*t,.05+dy*t]};poly([[0,.05],cl(a),cl(a+.18)],0xfbe3a2)}
   ell(-.26,.06,.11,.2,0xc9853a);ell(.26,.06,.11,.2,0xc9853a);circ(0,.08,.27,0xe2a34f);ell(0,-.04,.17,.12,0xf3cf92);ell(0,.0,.06,.045,0x2b2f36);circ(-.11,.15,.035,0x2b2f36);circ(.11,.15,.035,0x2b2f36);circ(-.1,.165,.011,0xffffff);circ(.12,.165,.011,0xffffff);
   ell(0,-.1,.05,.025,0x8a3a2f,Math.PI,Math.PI*2);poly([[-.24,-.2],[.24,-.2],[0,-.44]],0xe0533f);for(const [x,y] of [[-.1,-.25],[.08,-.24],[0,-.33],[-.03,-.27]])circ(x,y,.012,0xf7f0e3)}
  if(id==='frame_plat'){bands([0xb8e6d6,0xa6dccb,0x96d2c0]);for(let k=0;k<6;k++)ell(-.35+k*.14,-.42,.08,.05,0x7fc4ae);circ(0,.07,.26,0x8a5a36);ell(0,-.02,.17,.13,0xb07a52);ell(0,-.18,.26,.09,0x4a5560);ell(0,-.15,.22,.05,0x5a6672);
   circ(-.025,-.13,.012,0x2b2f36);circ(.025,-.13,.012,0x2b2f36);circ(-.1,.15,.03,0x2b2f36);circ(.1,.15,.03,0x2b2f36);circ(-.09,.162,.009,0xffffff);circ(.11,.162,.009,0xffffff);ell(-.17,.06,.04,.025,0xd99a7a);ell(.17,.06,.04,.025,0xd99a7a)}
  if(id==='frame_lh'){bands([0x1f2a55,0x26326a,0x2e3b7a,0x36458a]);stars(26,-.02);circ(.3,.3,.08,0xf6ecc6);circ(.33,.32,.07,0x26326a);rect(-.5,-.5,.5,-.12,0x23466e);for(let k=0;k<6;k++)rect(-.2+k*.06-.1,-.2-k*.04,-.05+k*.05,-.19-k*.04,0x6d8fb8);
   poly([[-.42,-.5],[-.38,-.2],[-.25,-.12],[-.08,-.18],[.05,-.5]],0x5a6170);poly([[-.12,.32],[.48,.44],[.48,.2]],0x5a6aa6);poly([[-.2,-.14],[-.08,-.14],[-.1,.22],[-.18,.22]],0xf7f0e3);
   for(const y of [-.04,.1])poly([[-.195,y],[-.085,y],[-.087,y+.05],[-.193,y+.05]],0xe0533f);rect(-.21,.22,-.07,.26,0x2b2f36);rect(-.19,.26,-.09,.33,0xf7d94a);poly([[-.2,.33],[-.08,.33],[-.14,.39]],0xe0533f)}
  if(id==='frame_whale'){bands([0xf6b26b,0xf39b72,0xe8857e,0xc77dab]);circ(0,-.08,.18,0xfbd77a,0,Math.PI);rect(-.5,-.5,.5,-.08,0x3f7fb8);for(let k=0;k<5;k++)rect(-.15+k*.03-.1,-.12-k*.05,.15-k*.03,-.11-k*.05,0xf3c37a);
   ell(-.12,-.1,.26,.11,0x34507a,0,Math.PI);ell(-.12,-.1,.2,.05,0x4a6a96,0,Math.PI);circ(-.28,-.04,.012,0xf7f0e3);poly([[.25,-.1],[.31,.06],[.42,.14],[.36,.04],[.44,.02],[.33,-.02],[.3,-.1]],0x34507a);
   for(const [x,y,r] of [[-.2,.07,.02],[-.23,.13,.018],[-.17,.14,.016],[-.2,.19,.014],[-.26,.18,.012],[-.14,.19,.012]])circ(x,y,r,0xf7f9ff)}
  if(id==='frame_camp'){bands([0x1d3a4a,0x24475a,0x2b566a]);stars(22,.05);circ(-.3,.32,.05,0xf6ecc6);rect(-.5,-.5,.5,-.18,0x2f5a3a);for(const [x,s] of [[-.4,1],[-.28,.8],[.32,1.1],[.43,.85]]){poly([[x-.08*s,-.18],[x+.08*s,-.18],[x,.25*s]],0x1f3d2c);poly([[x-.05*s,.0],[x+.05*s,.0],[x,.3*s]],0x24482f)}
   poly([[-.2,-.28],[.12,-.28],[-.04,.1]],0xf2c230);poly([[-.06,-.28],[-.02,-.28],[-.04,-.05]],0x8a6a1f);poly([[-.12,-.28],[-.04,.1],[-.07,-.28]],0xd9a521);rect(-.5,-.5,.5,-.28,0x3a6a44);
   for(const s of[1,-1])poly([[.22,-.36],[.34,-.36+s*.0],[.28,-.33]],0x6b4a35);poly([[.22,-.35],[.34,-.35],[.28,-.15]],0xf28c38);poly([[.25,-.35],[.31,-.35],[.28,-.22]],0xf7d94a)}
  if(id==='frame_boat'){bands([0xbfe4f2,0xa9daf0,0x93cfec]);circ(.33,.3,.07,0xf7d94a);for(const [x,y] of [[-.3,.28],[-.18,.3],[-.24,.33]])circ(x,y,.05,0xf7f9ff);rect(-.5,-.5,.5,-.12,0x3f8fc8);for(let k=0;k<6;k++)rect(-.45+k*.16,-.3-H(k,1)*.12,-.37+k*.16,-.29-H(k,1)*.12,0x8fd3e3);
   rect(.18,-.2,.5,-.14,0xb07a4a);for(let k=0;k<4;k++)rect(.22+k*.08,-.4,.24+k*.08,-.15,0x7a5236);
   poly([[-.36,-.12],[.1,-.12],[.05,-.26],[-.3,-.26]],0xe0533f);rect(-.36,-.14,.1,-.11,0xf7f0e3);poly([[-.22,-.11],[-.02,-.11],[-.02,.06],[-.22,.06]],0xf7f0e3);rect(-.24,.06,0,.09,0x3aa6b0);
   circ(-.17,-.02,.025,0x8fd3e3);circ(-.08,-.02,.025,0x8fd3e3);rect(.0,.02,.03,.16,0x2b2f36);for(const [x,y,r] of [[.03,.21,.03],[.07,.27,.04],[.12,.33,.045]])circ(x,y,r,0xe6e9ee)}
  if(id==='frame_shark'){bands([0x3a8fb0,0x2f7aa0,0x256890,0x1d5880]);for(let k=0;k<4;k++)poly([[-.3+k*.2,.5],[-.24+k*.2,.5],[-.4+k*.24,-.5],[-.46+k*.24,-.5]],0x4aa0bf);
   poly([[-.32,.02],[-.05,.1],[.2,.06],[.33,.0],[.2,-.06],[-.05,-.08]],0x7d95a8);poly([[-.32,.02],[-.45,.13],[-.4,.02],[-.46,-.1]],0x7d95a8);poly([[.02,.08],[.1,.22],[.14,.07]],0x6a8296);poly([[0,-.06],[.08,-.16],[.12,-.05]],0x6a8296);
   poly([[.31,-.03],[.34,.0],[.31,.03]],0x7d95a8);rect(.3,-.012,.36,.012,0x7d95a8);poly([[.33,-.1],[.37,-.1],[.37,.1],[.33,.1]],0x7d95a8);circ(.355,.085,.01,0x1b2430);circ(.355,-.085,.01,0x1b2430);poly([[-.2,-.05],[.25,-.03],[.2,-.06],[-.05,-.075]],0xdbe4ea);
   for(const [x,y] of [[-.38,-.3],[-.22,-.36],[.3,-.33],[.2,.32]]){poly([[x,y],[x+.06,y+.02],[x+.06,y-.02]],0xf2c230);poly([[x-.025,y],[x,y+.015],[x,y-.015]],0xf2c230)}for(let k=0;k<6;k++)circ(.38+H(k,7)*.08,-.1+k*.08,.008+H(k,8)*.008,0xbfe6f2)}
  put('dc_'+id,p,30)}
 /* ===== 랜덤 상자: 보라 상자 + 금빛 모서리 + 노란 물음표 + 청록 리본 ===== */
 {const PU=0x8b5cc9,GO=0xf2c230,YE=0xf7d94a,TE=0x2fb3a8,p=[R(.5,.44,.5,PU,[0,.22,0],0,.04,.025),R(.53,.07,.53,0x7349b0,[0,.46,0],0,.03,.02),R(.07,.52,.52,TE,[0,.24,0],0,.012,.008),R(.52,.52,.07,TE,[0,.24,0],0,.012,.008)];
  p.push(R(.53,.08,.07,TE,[0,.47,0],0,.012,.008),R(.07,.08,.53,TE,[0,.47,0],0,.012,.008));for(const s of[1,-1])p.push(TO(.07,.022,TE,[s*.06,.53,0],[0,0,s*.5],[1,1,.6]));p.push(SP(.04,0x239a90,[0,.52,0]));
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(SP(.03,GO,[sx*.25,.03,sz*.25]),SP(.03,GO,[sx*.25,.47,sz*.25]));
  const q=(x,z,ry)=>{const g=[pt(new THREE.TorusGeometry(.07,.024,8,20,Math.PI*1.35),YE,[0,.3,0],[0,0,-Math.PI*.42]),pt(lkRb(.05,.07,.04,.02,.01),YE,[0,.2,0]),pt(new THREE.SphereGeometry(.03,10,8),YE,[0,.12,0])];
   const m=mg(g);m.rotateY(ry);m.translate(x,0,z);p.push(m)};q(-.07,.255,0);q(.255,-.07,Math.PI/2);q(.07,-.255,Math.PI);q(-.255,.07,-Math.PI/2);
  for(const [x,y,z] of [[.32,.55,.2],[-.3,.45,.3],[.25,.15,.35]])p.push(SP(.025,0xfff3b0,[x,y,z],[1,1,1],8,6));put('dc_rbox',p)}
 /* ===== 설탕: 흰 종이 봉지(파란 띠·각설탕 그림) + 각설탕 + 쏟아진 설탕 ===== */
 {const WH=0xf6f3ec,p=[R(.34,.46,.2,WH,[0,.23,0],0,.04,.03),R(.35,.07,.205,0x3f7fd0,[0,.32,0],0,.01,.008),R(.3,.04,.18,0xe8e2d6,[0,.48,0],[0,0,.08],.015,.01)];
  for(const [x,y] of [[-.04,.17],[.05,.17],[0,.25]])p.push(R(.06,.06,.012,0xffffff,[x,y,.104],0,.008,.004));
  for(const [x,z,r] of [[.27,.12,.3],[.36,-.02,.7],[.28,-.14,1.2]])p.push(R(.08,.08,.08,0xffffff,[x,.04,z],[0,r,0],.012,.008));p.push(SP(.12,0xfdfcf8,[-.24,0,.12],[1.3,.3,1],12,8));put('dc_sugar',p)}
 /* ===== 여행용 가방: 초록 배낭 + 앞주머니 + 덮개 + 위에 둘둘 만 침낭 + 가죽 끈·버클 ===== */
 {const GR=0x5f8f5a,GD=0x4c7a48,TN=0xd9b47a,TD=0xb8925a,p=[R(.48,.6,.3,GR,[0,.32,0],0,.1,.06),R(.36,.26,.08,GD,[0,.22,.17],0,.06,.03),R(.5,.18,.33,GD,[0,.58,.01],[-.08,0,0],.07,.04)];
  for(const s of[1,-1])p.push(R(.06,.42,.03,TN,[s*.11,.42,.17],[.05,0,0],.01,.006),R(.06,.04,.035,0xc9a86a,[s*.11,.36,.19],0,.008,.005),R(.1,.2,.1,GD,[s*.27,.2,0],0,.04,.02),R(.04,.5,.03,TD,[s*.13,.35,-.17],0,.01,.006));
  p.push(CY(.1,.1,.5,0xe0533f,[0,.75,-.02],[0,0,Math.PI/2],undefined,18),CY(.102,.102,.06,0xf7f0e3,[-.12,.75,-.02],[0,0,Math.PI/2],undefined,18),CY(.102,.102,.06,0xf7f0e3,[.12,.75,-.02],[0,0,Math.PI/2],undefined,18));
  for(const s of[1,-1])p.push(TO(.105,.012,TD,[s*.2,.75,-.02],[0,Math.PI/2,0]));p.push(TO(.06,.014,TD,[0,.64,-.12],[0,0,0],[1,.7,1]));put('dc_bag_travel',p)}
 dcPlants()}

/* ---------------- 새 식물 모양: 도감 그림 pi_ · 야생 pw_ · 씨앗 봉투 lk_seed_ · 밭 3단계 pc_ ---------------- */
function dcPlants(){
 const put=(k,p,sm=42)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const R=(w,h,d,c,p,r,cr=.03,bv=.016)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const CY=(rt,rb,h,c,p,r,sc,n=12)=>pt(cyl(rt,rb,h,n),c,p,r,sc);
 const SP=(rad,c,p,sc,r,a=14,b=10)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,r||0,sc);
 const IC=(rad,c,p,r,sc,d=1)=>pt(new THREE.IcosahedronGeometry(rad,d),c,p,r,sc);
 const CN=(rad,h,c,p,r,n=8)=>pt(cone(rad,h,n),c,p,r);
 const ROD=(a,b,r,c,n=6)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)};
 const CNA=(a,b,r,c,n=6)=>{const q=lkAim(a,b);return pt(cone(r,q.L,n),c,q.pos,q.rot)};   /* a → b로 뾰족해지는 잎 */
 const LA=(prof,c,p,seg=16,sc)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg),c,p,0,sc);
 const H=(i,j,k=63)=>hash(i,j,k),LF=[0x5f9a3c,0x6ea844,0x4f8a3c];
 const leaf=(p,x,y,z,s,ry,rz,c,sh=[1.4,.18,.6])=>p.push(IC(s,c,[x,y,z],[0,ry,rz],sh));
 const PC={tomato:0xe0533f,onion:0xc98a4a,corn:0xf2c84a,cacao:0x9a5a36,chili:0xd8402f};
 /* 열매·알 */
 const tomato=(p,x,y,z,s=1,c=0xe0533f)=>{p.push(SP(.09*s,c,[x,y,z],[1,.85,1]),SP(.06*s,0xf07a62,[x-.03*s,y+.03*s,z+.04*s],[1,.7,1],0,10,8));for(let k=0;k<5;k++){const a=k/5*Math.PI*2;p.push(CNA([x,y+.075*s,z],[x+Math.cos(a)*.06*s,y+.07*s,z+Math.sin(a)*.06*s],.018*s,0x4f8a3c,4))}p.push(CY(.008*s,.01*s,.04*s,0x5f9a3c,[x,y+.095*s,z]))};
 const onion=(p,x,y,z,s=1)=>{p.push(LA([[0,0],[.06,.01],[.1,.06],[.095,.12],[.05,.17],[.015,.21],[0,.22]],0xd9a35a,[x,y,z],16,[s,s,s]));for(let k=0;k<4;k++){const a=k*1.6;p.push(LA([[0,0],[.062,.02],[.098,.07],[.07,.14],[0,.17]],0xe8b86e,[x,y+.002*k,z],8,[s*(.6+k*.1)*Math.abs(Math.cos(a))+.01,s,s*.15]))}
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;p.push(ROD([x,y+.005*s,z],[x+Math.cos(a)*.05*s,y-.04*s,z+Math.sin(a)*.05*s],.004*s,0xf3e6c8,4))}};
 const corn=(p,x,y,z,s=1,ry=0,rz=0)=>{const g=[LA([[0,0],[.045,.02],[.055,.1],[.05,.2],[.035,.27],[0,.29]],0xf2c84a,[0,0,0],14)];for(let i=0;i<7;i++)for(let k=0;k<8;k++){const a=k/8*Math.PI*2+(i%2)*.4,yy=.04+i*.034,r=yy<.2?.05:.05-(yy-.2)*.18;g.push(pt(new THREE.SphereGeometry(.014,6,4),0xf7d75a,[Math.cos(a)*r,yy,Math.sin(a)*r]))}
  for(let k=0;k<3;k++){const a=k/3*Math.PI*2;g.push(pt(new THREE.IcosahedronGeometry(.1,1),[0x8fbf5a,0x7aae4a,0xa6c96a][k],[Math.cos(a)*.035,.11,Math.sin(a)*.035],[0,-a,.12],[.35,1.4,.12]))}
  for(let k=0;k<5;k++)g.push(pt(cone(.006,.08,4),0xd9a85a,[(H(k,1)-.5)*.03,.32,(H(k,2)-.5)*.03],[(H(k,3)-.5)*.6,0,(H(k,4)-.5)*.6]));const m=mg(g);m.scale(s,s,s);m.rotateZ(rz);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 const pod=(p,x,y,z,s=1,c=0xe08a3a,rz=0,ry=0)=>{const g=[pt(new THREE.LatheGeometry([[0,-.11],[.035,-.09],[.055,-.03],[.058,.03],[.04,.09],[0,.12]].map(q=>new THREE.Vector2(q[0],q[1])),10),c,[0,0,0])];
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;g.push(pt(new THREE.SphereGeometry(.012,6,6),c,[Math.cos(a)*.055,0,Math.sin(a)*.055],[0,0,0],[1,6,1]))}g.push(pt(cyl(.008,.008,.04,5),0x6b4a35,[0,.13,0]));
  const m=mg(g);m.scale(s,s,s);m.rotateZ(rz);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 const chili=(p,x,y,z,s=1,c=0xd8402f,ry=0,droop=1)=>{const g=[];for(let i=0;i<7;i++){const t=i/6,r=.028*(1-t*.75)+.004;g.push(pt(new THREE.SphereGeometry(r,10,8),c,[Math.sin(t*1.3)*.05,-t*.17*droop,0]))}
  g.push(pt(cyl(.03,.024,.025,8),0x4f8a3c,[0,.01,0]),pt(cyl(.006,.006,.05,5),0x5f9a3c,[0,.04,0],[0,0,.3]));const m=mg(g);m.scale(s,s,s);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 /* 도감 그림 */
 {const p=[];tomato(p,0,.1,0,1.4);put('pi_tomato',p)}
 {const p=[];onion(p,0,.03,0,1.3);for(let k=0;k<3;k++)p.push(CNA([0,.3,0],[(k-1)*.04,.48,(k-1)*.01],.016,0x6ea844,6));put('pi_onion',p)}
 {const p=[];corn(p,0,0,0,1.25,0,-.5);put('pi_corn',p)}
 {const p=[];pod(p,0,.12,0,1.4,0xe08a3a,-.9);for(const [x,z,r] of [[.13,.08,.3],[.18,-.04,1.1]])p.push(SP(.03,0x6b3e24,[x,.025,z],[1.3,.7,1],[0,r,0],10,8));put('pi_cacao',p)}
 {const p=[];chili(p,-.08,.26,0,1.45,0xd8402f,.3,1);chili(p,.13,.22,-.04,1.15,0x6ea844,2.6,.9);put('pi_chili',p)}
 /* 야생에서 자라는 모습(바닥 y=0, 정면 +z) */
 {const p=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3,b=[Math.cos(a)*.05,0,Math.sin(a)*.05],t=[Math.cos(a)*.24,.5+H(k,1)*.12,Math.sin(a)*.24];p.push(ROD(b,t,.014,0x5f8a3c));
   for(let q=0;q<3;q++)leaf(p,t[0]*(.6+q*.2),.25+q*.14+H(k,q)*.05,t[2]*(.6+q*.2),.08,-a+q,.2,LF[(k+q)%3])}
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2+.2,r=.09+H(k,6)*.08,y=.22+(k%3)*.13+H(k,7)*.05;p.push(IC(.13+H(k,8)*.04,LF[k%3],[Math.cos(a)*r,y,Math.sin(a)*r],[k,k*1.3,0],[1.15,.75,1.15],1))}p.push(IC(.12,0x6ea844,[0,.6,0],0,[1.1,.8,1.1],1));
  for(const [x,y,z,c] of [[.22,.3,.12,0xe0533f],[-.14,.42,.2,0xe0533f],[.06,.26,-.25,0xf07a3a],[-.25,.26,-.06,0xe0533f],[.22,.48,-.12,0x8fbf5a],[.02,.52,.2,0xe0533f],[-.08,.2,.25,0xe86a4a]])tomato(p,x,y,z,.85,c);
  put('pw_tomato',p)}
 {const p=[SP(.24,0x6b4a35,[0,0,0],[1,.18,1])];for(const [x,z,s] of [[0,0,1.15],[.13,.08,.85],[-.12,.1,.8]]){onion(p,x,-.04,z,s);for(let k=0;k<5;k++){const a=k*1.3+x*9,t=[x+Math.cos(a)*.1,.38+H(k,x*10|0)*.2,z+Math.sin(a)*.1];p.push(CNA([x,.18*s,z],t,.016,LF[k%3]))}}put('pw_onion',p)}
 {const p=[SP(.2,0x6b4a35,[0,0,0],[1,.15,1])];for(const [x,z,hh] of [[0,0,1.45],[.16,.1,1.2],[-.14,.12,1.3]]){p.push(CY(.025,.035,hh,0x7aae4a,[x,hh/2,z]));for(let k=0;k<5;k++){const a=k*2.4+x*7,y=.25+k*hh*.15,L=.32+H(k,2)*.12;
   p.push(pt(new THREE.IcosahedronGeometry(.1,1),LF[k%3],[x+Math.cos(a)*L*.5,y+.06,z+Math.sin(a)*L*.5],[0,-a,.55],[L*4,.16,.5]))}
   for(let k=0;k<5;k++)p.push(CNA([x,hh,z],[x+(H(k,3)-.5)*.2,hh+.16+H(k,4)*.06,z+(H(k,5)-.5)*.2],.008,0xd9b45a,4));corn(p,x+.04,hh*.48,z+.03,.9,x*5,.55)}
  put('pw_corn',p)}
 {const p=[SP(.22,0x6b4a35,[0,0,0],[1,.15,1]),CY(.05,.08,.9,0x7a5236,[0,.45,0])];for(const [a,y] of [[0,.7],[2.1,.78],[4.2,.74]])p.push(ROD([0,y,0],[Math.cos(a)*.3,y+.32,Math.sin(a)*.3],.03,0x7a5236));
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2,r=.28+H(k,1)*.18,y=1.0+H(k,2)*.3;p.push(IC(.2,LF[k%3],[Math.cos(a)*r,y,Math.sin(a)*r],[0,-a,.5],[1.5,.22,.7]))}p.push(IC(.22,0x4f8a3c,[0,1.28,0],0,[1.3,.6,1.3]));
  for(const [a,y,c] of [[.3,.42,0xe08a3a],[1.9,.55,0xf2b84a],[3.5,.36,0xd8572f],[5,.6,0xe08a3a],[2.6,.75,0x9fbf5a]])pod(p,Math.cos(a)*.085,y,Math.sin(a)*.085,1,c,0,a);
  put('pw_cacao',p)}
 {const p=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2+.5,t=[Math.cos(a)*.18,.34+H(k,1)*.08,Math.sin(a)*.18];p.push(ROD([0,0,0],t,.012,0x5f8a3c));for(let q=0;q<3;q++)leaf(p,t[0]*(.5+q*.25),.18+q*.09,t[2]*(.5+q*.25),.06,-a+q*1.2,.15,LF[(k+q)%3])}
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2+.4,r=.07+H(k,9)*.07,y=.16+(k%2)*.12+H(k,10)*.04;p.push(IC(.1+H(k,11)*.03,LF[k%3],[Math.cos(a)*r,y,Math.sin(a)*r],[k,k,0],[1.2,.75,1.2],1))}p.push(IC(.09,0x6ea844,[0,.38,0],0,[1.1,.8,1.1],1));
  for(const [x,y,z,c,r] of [[.17,.3,.12,0xd8402f,0],[-.14,.34,.15,0xd8402f,1],[.07,.28,-.2,0x5f9a3c,2],[-.2,.27,-.06,0xe8602f,3],[.2,.36,-.08,0xd8402f,4],[0,.24,.21,0xd8402f,5]])chili(p,x,y,z,1,c,r,.9);
  put('pw_chili',p)}
 /* 씨앗 봉투(47차와 같은 크라프트 봉투 + 초록 띠 + 앞면 동그라미에 그 식물 그림) */
 for(const id in PC){const col=PC[id],p=[R(.46,.6,.05,0xead9b8,[0,.3,0],0,.04,.02),R(.46,.12,.055,0x6ea844,[0,.53,0],0,.03,.015),R(.4,.012,.058,0xf7f0e3,[0,.465,0],0,.004,.003)];
  for(let k=0;k<8;k++)p.push(R(.03,.03,.056,0xd9c49a,[-.2+k*.057,.6,0],[0,0,Math.PI/4],.006,.004));
  p.push(CY(.175,.175,.012,0xf7f0e3,[0,.27,.028],[Math.PI/2,0,0],undefined,24),CY(.19,.19,.008,col,[0,.27,.026],[Math.PI/2,0,0],undefined,24));
  const pi=GEO['pi_'+id];if(pi){pi.computeBoundingBox();const b=pi.boundingBox,sz=Math.max(b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z),k=.3/sz;p.push(pt(pi,null,[-(b.min.x+b.max.x)/2*k,.27-(b.min.y+b.max.y)/2*k,.06-(b.min.z)*k*.2],[0,0,0],[k,k,k*.5]))}
  const sc={tomato:[0xe8d48a,0xd9c27a],onion:[0xc98a4a,0xb8793a],corn:[0xf2c84a,0xe8b83a],cacao:[0x6b3e24,0x7d4a2c],chili:[0xf0d070,0xe8c060]}[id];
  for(let k=0;k<5;k++){const a=k*1.3;p.push(SP(id==='cacao'||id==='onion'?.035:.022,sc[k%2],[Math.cos(a)*.14+.05,.02,.12+Math.sin(a)*.05],[1.4,.7,.9],[0,a,0],8,6))}
  put('lk_seed_'+id,p)}
 /* 밭 3단계: 흙 둔덕(47차와 비슷하게) + 씨앗 → 새싹 → 다 자람(야생 모양을 둔덕 위에) */
 const mound=id=>{const col=PC[id],p=[pt(new THREE.SphereGeometry(.44,18,8,0,Math.PI*2,0,Math.PI/2),0x5f4230,[0,-.03,0],[0,0,0],[1,.38,1])];
  for(let k=0;k<11;k++){const a=k/11*Math.PI*2+H(k,3)*.3,r=.4+H(k,4)*.06;p.push(IC(.07+H(k,5)*.04,[0x6b4a35,0x5b4636,0x7a5a40][k%3],[Math.cos(a)*r,-.01,Math.sin(a)*r],[k,k*2,0],[1.3,.55,1],0))}
  for(let k=0;k<3;k++)p.push(R(.5,.012,.03,0x4e3626,[0,.125+(k===1?.015:0),(k-1)*.13],[0,0,0],.008,.005));
  p.push(R(.025,.42,.025,0xc08d5c,[.3,.18,.26],[0,0,-.06],.006,.004),R(.16,.09,.02,0xf7f0e3,[.31,.38,.27],[0,-.3,-.06],.02,.008),CY(.03,.03,.022,col,[.31,.38,.284],[Math.PI/2,-.3,0]));return p};
 const S0={tomato:p=>{for(let k=0;k<9;k++)p.push(SP(.014,0xe8d48a,[(H(k,1,71)-.5)*.3,.14,(H(k,2,71)-.5)*.26],[1.4,.5,1],[0,k,0],6,4))},
  onion:p=>{for(const [x,z] of [[-.1,-.06],[.08,.05],[0,.14],[.12,-.1]]){onion(p,x,.1,z,.45)}},
  corn:p=>{for(let k=0;k<9;k++)p.push(SP(.02,0xf2c84a,[(k-4)*.055,.145,(H(k,3,72)-.5)*.05],[1,.7,.9],[0,k,0],8,6))},
  cacao:p=>{for(const [x,z,r] of [[-.08,0,.3],[.06,.06,1.2],[.02,-.09,2]])p.push(SP(.04,0x6b3e24,[x,.15,z],[1.3,.7,1],[0,r,0],10,8))},
  chili:p=>{for(let k=0;k<10;k++)p.push(SP(.012,0xf0d070,[(H(k,1,73)-.5)*.28,.14,(H(k,2,73)-.5)*.24],[1.3,.4,1],[0,k,0],6,4))}};
 const S1={tomato:p=>{p.push(ROD([0,.1,0],[0,.36,0],.012,0x6f9a4a));for(let k=0;k<6;k++){const a=k*2.2,y=.18+k*.03;leaf(p,Math.cos(a)*.07,y,Math.sin(a)*.07,.055,-a,.25,LF[k%3])}tomato(p,.03,.3,.05,.45,0x8fbf5a)},
  onion:p=>{for(let k=0;k<7;k++){const a=k*.9,t=[Math.cos(a)*.08,.32+H(k,4,74)*.12,Math.sin(a)*.08];p.push(CNA([Math.cos(a)*.03,.1,Math.sin(a)*.03],t,.012,LF[k%3]))}},
  corn:p=>{for(let k=0;k<3;k++){const a=k*2.1;p.push(CY(.012,.016,.24,0x7aae4a,[Math.cos(a)*.05,.22,Math.sin(a)*.05]));for(let q=0;q<2;q++){const b=a+q*1.6;p.push(pt(new THREE.IcosahedronGeometry(.08,1),LF[q],[Math.cos(a)*.05+Math.cos(b)*.08,.26+q*.06,Math.sin(a)*.05+Math.sin(b)*.08],[0,-b,.6],[2.2,.14,.4]))}}},
  cacao:p=>{p.push(CY(.014,.02,.34,0x7a5236,[0,.27,0]));for(let k=0;k<5;k++){const a=k/5*Math.PI*2;leaf(p,Math.cos(a)*.1,.42+H(k,1,75)*.05,Math.sin(a)*.1,.08,-a,.5,LF[k%3],[1.5,.18,.6])}},
  chili:p=>{p.push(ROD([0,.1,0],[0,.3,0],.01,0x6f9a4a));for(let k=0;k<6;k++){const a=k*2.3;leaf(p,Math.cos(a)*.06,.17+k*.025,Math.sin(a)*.06,.045,-a,.2,LF[k%3])}p.push(SP(.015,0xf7f0e3,[.03,.3,.03],0,0,8,6))}};
 for(const id in PC){const a=mound(id),b=mound(id),c=mound(id);S0[id](a);S1[id](b);const pw=GEO['pw_'+id];if(pw){const s=id==='corn'?.72:id==='cacao'?.75:1;c.push(pt(pw,null,[0,.08,0],[0,.5,0],[s,s,s]))}
  put('pc_'+id+'_0',a);put('pc_'+id+'_1',b);put('pc_'+id+'_2',c)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{dcModels()}catch(e){console.error('deco: 62차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
