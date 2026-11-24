/* ===== 79차(규칙, 기획자 11-24 22:08) =====
   ① 작살·설치형 미끼 아예 없앰 — 아이템·키트·제작법을 지우고, 예전 저장은 dropRemoved가 가방·보관 상자에서 치우고 띄워 둔 미끼 부표는 재료로 돌려줘요.
   ② 겨울 땅 추위 — 겨울 섬(winter.js WNT_NAMES: 동북섬·동북섬 동쪽·띠섬·해달섬) 밖에 있으면 10초마다 에너지 0.1칸씩 줄고, 쉬어도 안 차요.
      괜찮은 곳: 텐트·집·산장 안, 모닥불·횃불 옆(nearWarm), 보드카(추위 안 탐, buffs.js bufNoCold). 음식·드링크·무지개 신발 회복은 그대로 돼요.
   ③ 나무·바위 줄이기 — 맵 전체 나무 약 62%·바위 약 66%만 남겨요. 겨울 섬은 나무를 22%만 남기고, 광물 바위를 더 놓아요.
      겨울 섬 바위 = 바위 25 · 석탄 25 · 철 20 · 구리 10 · 티타늄 10 · 은 7 · 금 3 (%), 기획자 11-24. 캐면 그 광석이 나와요(곡괭이도 그대로 3·5배).
   ④ 항구마다 일반 자판기(pvend) — 모양만 먼저(기획자: '그냥 모양만이고 내가 나중에 지정할게, 물건을 살 수 있게').
      파는 물건은 PV79.items에 넣으면 창에 저절로 나와요: [아이템 id, 묶음 개수(없으면 1), 가격(없으면 원래 가격 p × 묶음)]. 지금은 비어 있어요. */

/* ---------- ① 작살·설치형 미끼 없앰 ---------- */
{const G={harpoon:'작살',kit_baitbuoy:'설치형 미끼'};for(const k in G)delete ITEMS[k];Object.assign(REMOVED.n,G);delete WEAP.harpoon;
 if(BUILDS.baitbuoy){BUILDS.baitbuoy.hide=1;REMOVED.n.baitbuoy='설치형 미끼';REMOVED.c.baitbuoy=Object.assign({},BUILDS.baitbuoy.c);delete BUILDS.baitbuoy.kit}   /* 정의는 멀티·옛 저장 읽기용으로만(지뢰와 같음) */
 for(let i=RECIPES.length-1;i>=0;i--){const r=RECIPES[i];if(!ITEMS[r.id]||Object.keys(r.c||{}).some(k=>!ITEMS[k]))RECIPES.splice(i,1)}}

/* ---------- ② 겨울 추위 ---------- */
const COLD={rate:.1,on:false,was:false,msgT:-1e9};   /* rate = 에너지(S.hp) 1초에 줄어드는 양: 0.1칸(=1)/10초 */
function coldNow(){if(mode!=='play'||!P||P.dead||INT.on||(typeof DEV!=='undefined'&&DEV.on)||typeof wntIsls!=='function')return false;
 const I=islAt(P.x,P.z);if(!I||!wntIsls().includes(I))return false;
 if(hAt(P.x,P.z)<-.5&&typeof seaShore==='function'&&seaShore(P.x,P.z)>14)return false;   /* 섬에서 먼 바다는 겨울 땅이 아니에요 */
 if(nearWarm())return false;if(typeof bufNoCold==='function'&&bufNoCold())return false;return true}
{const _us=updStats;updStats=function(dt){COLD.on=coldNow();_us.apply(this,arguments);
  if(COLD.on&&!P.dead&&!(typeof DEV!=='undefined'&&DEV.on)){hurtSoft(dt*COLD.rate);const t=performance.now()/1000;if(!COLD.was&&t-COLD.msgT>90){COLD.msgT=t;toast('❄ 겨울 땅이에요 — 추워서 10초마다 에너지가 0.1칸씩 줄어요. 모닥불 옆·텐트 안은 따뜻해요')}}
  COLD.was=COLD.on}}
{const css=document.createElement('style');css.textContent='#coldP{position:absolute;left:14px;top:40px;padding:3px 11px;border-radius:13px;background:#4f8fd0;color:#fff;font-size:13px;font-weight:900;pointer-events:none;opacity:0;transition:opacity .35s;box-shadow:0 2px 0 rgba(0,0,0,.18);white-space:nowrap}#coldP.on{opacity:.95}';document.head.appendChild(css)}
{const e=document.createElement('div');e.id='coldP';e.textContent='❄ 추워요 · 에너지가 조금씩 줄어요';$('ui').appendChild(e)}
{const _u=updPlayer;updPlayer=function(dt){_u(dt);const e=$('coldP');if(!e)return;const on=mode==='play'&&COLD.on;if(e.classList.contains('on')!==on)e.classList.toggle('on',on);
  const sp=$('safeP'),so=sp&&sp.classList.contains('on');e.style.top=so?'66px':'40px';if(on){const b=document.getElementById('bufP');if(b)b.style.top=so?'118px':'92px'}}}

/* ---------- ③ 나무·바위 줄이기 · 겨울 광물 ---------- */
const THIN79={tree:.62,rock:.66,wTree:.22,wAdd:.032,gap:3.4};
const ORE79={rock:{w:25},coal:{w:25,n:'석탄',it:'coal',d:2,c:[0x26282d,0x383b42,0x4b4f57],k:'chunk'},iron:{w:20,n:'철',it:'ore_iron',d:2,c:[0x9c4a32,0x7a3626,0xc06a42],k:'chunk'},
 copper:{w:10,n:'구리',it:'copper',d:2,c:[0xd07a3c,0xe39552,0x6fa58a],k:'nug'},ti:{w:10,n:'티타늄',it:'ore_ti',d:1,c:[0x46a6c9,0x86d2e6,0x2f7896],k:'xtal'},
 silver:{w:7,n:'은',it:'ore_silver',d:1,c:[0xc9d1db,0x8d98a6,0xeef2f6],k:'nug'},gold:{w:3,n:'금',it:'ore_gold',d:1,c:[0xf2c230,0xffdc5e,0xd9a420],k:'nug'}};
const ORE79_K=Object.keys(ORE79);
function ore79Pick(r){let a=0;for(const k of ORE79_K){a+=ORE79[k].w;if(r*100<a)return k}return'rock'}
function thin79(sd){const WL=typeof wntIsls==='function'?wntIsls():[],st={tree:[0,0],rock:[0,0],add:0,ore:{}},del=[];
 objs.forEach((o,k)=>{if(o.t>3)return;const w=WL.includes(islAt(o.x,o.z)),r=hash(o.x*7.3|0,o.z*9.1|0,sd+791);
  if(o.t<3){st.tree[0]++;if(r>(w?THIN79.wTree:THIN79.tree))del.push(k)}else{st.rock[0]++;if(!w&&r>THIN79.rock)del.push(k)}});
 for(const k of del)objs.delete(k);
 /* 겨울 섬: 빈 칸에 광물 바위 더(둘레 3.4m 안에 다른 나무·바위가 없을 때만 → 사이로 지나갈 수 있어요) */
 const far=(x,z)=>{const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const o=objs.get((cz+j)*CN+cx+i);if(o&&dist(o.x,o.z,x,z)<THIN79.gap)return false}return true};
 for(const I of WL){const c0=Math.max(1,((I.x-I.br)/CELL)|0),c1=Math.min(CN-2,((I.x+I.br)/CELL)|0),r0=Math.max(1,((I.z-I.br)/CELL)|0),r1=Math.min(CN-2,((I.z+I.br)/CELL)|0);
  for(let cz=r0;cz<=r1;cz++)for(let cx=c0;cx<=c1;cx++){const key=cz*CN+cx;if(objs.has(key)||hash(cx,cz,sd+793)>=THIN79.wAdd)continue;
   const x=(cx+.5)*CELL+(hash(cx,cz,sd+1)-.5)*1.8,z=(cz+.5)*CELL+(hash(cx,cz,sd+2)-.5)*1.8;if(islAt(x,z)!==I||hAt(x,z)<.95||!objSpotOk(x,z,sd)||!far(x,z))continue;
   objs.set(key,objSingle(3,x,z,cx,cz,sd));st.add++}}
 /* 겨울 섬 바위마다 종류 정하기 */
 objs.forEach((o,k)=>{if(o.t!==3||!WL.includes(islAt(o.x,o.z)))return;const t=ore79Pick(hash(o.x*11.7|0,o.z*5.3|0,sd+797));st.ore[t]=(st.ore[t]||0)+1;if(t==='rock')return;
  o.ore=t;o.gk='ore79_'+t+'_'+(o.gk.indexOf('rockB')===0?'b':'e')+'_w'});
 objs.forEach(o=>{if(o.t<3)st.tree[1]++;else if(o.t===3)st.rock[1]++});THIN79.st=st;return st}
{const _go=genObjects;genObjects=function(sd){const r=_go.apply(this,arguments);try{thin79(sd)}catch(e){console.error('79차 나무·바위',e)}return r}}
/* 광물 바위 모양: 눈 쌓인 바위(winter.js wntGeo) + 그 광석 덩이(낮은 다각형, 인스턴스라 가볍게) */
function geo79Join(parts){let n=0;for(const g of parts)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
 for(let g of parts){if(g.index)g=g.toNonIndexed();if(!g.attributes.normal)g.computeVertexNormals();P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count}
 const B=new THREE.BufferGeometry();B.setAttribute('position',new THREE.BufferAttribute(P,3));B.setAttribute('normal',new THREE.BufferAttribute(N,3));B.setAttribute('color',new THREE.BufferAttribute(C,3));B.computeBoundingSphere();return B}
function ore79Geo(t,base,plain){const D=ORE79[t],src=GEO[base];if(!src)return null;const rk=!plain&&typeof wntGeo==='function'?wntGeo(src):src.clone();src.computeBoundingBox();const bb=src.boundingBox,sz=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);
 const g0=rk.index?rk.toNonIndexed():rk,P=g0.attributes.position,Nn=g0.attributes.normal,cand=[];for(let i=0;i<P.count;i++){const y=P.getY(i),ny=Nn.getY(i);if(y>bb.max.y*.28&&ny>-.15)cand.push(i)}
 let sd=0;for(const ch of t+base)sd=(sd*31+ch.charCodeAt(0))>>>0;const R=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
 const parts=[g0],K=D.k==='xtal'?4:D.k==='nug'?7:6,s0=sz*(D.k==='xtal'?.085:.1),taken=[];
 for(let q=0;q<K&&cand.length;q++){let i=-1;for(let tr=0;tr<12;tr++){const c=cand[(R()*cand.length)|0],x=P.getX(c),z=P.getZ(c);if(taken.every(([a,b])=>Math.hypot(a-x,b-z)>sz*.16)){i=c;break}}if(i<0)continue;
  const x=P.getX(i),y=P.getY(i),z=P.getZ(i),nx=Nn.getX(i),ny=Nn.getY(i),nz=Nn.getZ(i);taken.push([x,z]);const s=s0*(.75+R()*.55),col=D.c[q%3===2?2:(R()*2)|0];
  if(D.k==='xtal'){for(let k=0;k<4;k++){const h=s*(1.4+R()*.9)*(k===1?1.3:1),g=cyl(s*.34,s*.5,h,6),tl=.35+R()*.4,ay=R()*6.28;g.translate(0,h/2,0);g.rotateZ(tl*(k-1.5)*.8);g.rotateY(ay);
    parts.push(pt(g,k?D.c[0]:D.c[1],[x-nx*s*.25,y-s*.2,z-nz*s*.25]))}continue}
  const g=new THREE.IcosahedronGeometry(1,D.k==='nug'?1:0);parts.push(pt(g,col,[x-nx*s*.3,y+ny*s*.1-s*.15,z-nz*s*.3],[R()*3,R()*3,R()*3],[s*(D.k==='chunk'?1.15:.85),s*(D.k==='chunk'?.8:.72),s*(D.k==='chunk'?1:.85)]));
  if(t==='copper'&&q%3===0)parts.push(pt(new THREE.IcosahedronGeometry(1,0),D.c[2],[x+s*.3,y+s*.3,z+s*.15],[R()*3,R()*3,0],[s*.24,s*.2,s*.24]))}   /* 구리: 초록 녹 */
 return geo79Join(parts)}
{const _br=buildRegions;buildRegions=function(){try{objs.forEach(o=>{if(!o.ore||GEO[o.gk])return;const b=o.gk.split('_')[2]==='b'?'rockB':'rock_single_E',g=ore79Geo(o.ore,b);if(g)GEO[o.gk]=g;else{delete o.ore;o.gk=b}})}catch(e){console.error('79차 광물 모양',e)}return _br.apply(this,arguments)}}
/* 캐면 그 광석(곡괭이 배율은 farm.js PICKM과 같게, 여기서 먼저) · 이름표 '석탄 캐기' */
{const _ia=interact;interact=function(){const t=target;if(!(t&&t.k==='o'&&t.o.ore))return _ia.apply(this,arguments);const D=ORE79[t.o.ore],T=OBJT[t.o.t],d0=T.drop;
  if(P.cd<=0&&typeof PICKM!=='undefined'){const m=PICKM[curId()];if(m)t.o.hp-=(m-1)*(typeof CHOP!=='undefined'?CHOP.hit:1)}
  T.drop=[D.it,D.d];try{return _ia.apply(this,arguments)}finally{T.drop=d0}}}
{const _ft=findTarget;findTarget=function(){const t=_ft.apply(this,arguments);if(t&&t.k==='o'&&t.o.ore&&t.lab===OBJT[t.o.t].lab)t.lab=ORE79[t.o.ore].n+' 캐기';return t}}

/* ---------- ④ 항구마다 일반 자판기 ---------- */
const PV79={items:[],free:0,pi:0};   /* items: [[아이템 id, 묶음 개수, 가격], …] — 기획자가 정해 주면 채우기 */
DECO.pvend={g:'pv79',s:1,bx:.5,bz:.4,hp:1e9,n:'일반 자판기'};
function pv79Geo(){const p=[],gl=[],R=(w,h,d,c=.04,b=.02)=>lkRb(w,h,d,c,b),W=.98,D=.76,F=D/2;
 const BODY=0xf2eee4,SIDE=0xe3ddd0,TRIM=0x4b525b,RED=0xd9493a,DK=0x2c3036;
 p.push(pt(R(W,.09,D,.02,.015),TRIM,[0,.045,0]),pt(R(W-.02,1.86,D-.02,.05,.025),BODY,[0,.09+.93,0]),pt(R(W+.02,.32,D+.02,.06,.03),RED,[0,1.95+.16-.02,0]));
 for(const sx of[-1,1])p.push(pt(box(.012,1.7,D-.1),SIDE,[sx*(W/2-.004),1.02,0]),pt(box(.014,.09,D-.08),RED,[sx*(W/2-.003),1.3,0]));   /* 옆 판 + 빨간 띠 */
 p.push(pt(box(W-.06,.05,.02),0xffffff,[0,2.07,F+.012]),pt(box(W*.62,.03,.02),0xffffff,[-.06,1.99,F+.012]));   /* 위 간판 흰 줄 */
 /* 앞 왼쪽 진열창: 오목하게 → 뒤판(빛) + 칸 4줄 + 깡통·병 */
 const wx=-.12,ww=.6,wy0=.62,wh=1.12;p.push(pt(box(ww+.06,.04,.08),TRIM,[wx,wy0-.02,F-.02]),pt(box(ww+.06,.04,.08),TRIM,[wx,wy0+wh+.02,F-.02]));
 for(const sx of[-1,1])p.push(pt(box(.04,wh+.08,.08),TRIM,[wx+sx*(ww/2+.03),wy0+wh/2,F-.02]));
 gl.push(pt(box(ww,wh,.01),0xdff1f6,[wx,wy0+wh/2,F-.2]));
 const CAN=[0xe0533f,0x3f7fd0,0x5bae5f,0xf7c948,0xf28c38,0x8b5cc9,0xffffff,0x33363b];
 for(let r=0;r<4;r++){const y=wy0+.06+r*.27;p.push(pt(box(ww,.025,.2),0xcfd4d9,[wx,y,F-.1]));for(let c=0;c<4;c++){const x=wx-ww/2+.09+c*.14,col=CAN[(r*3+c*5)%CAN.length];
  if((r+c)%3===1){p.push(pt(cyl(.04,.045,.15,10),col,[x,y+.09,F-.09]),pt(cyl(.018,.03,.05,8),col,[x,y+.19,F-.09]),pt(cyl(.019,.019,.02,8),0xf4f1ea,[x,y+.225,F-.09]))}
  else p.push(pt(cyl(.05,.05,.16,12),col,[x,y+.093,F-.09]),pt(cyl(.051,.051,.035,12),0xf4f1ea,[x,y+.11,F-.09]),pt(cyl(.04,.05,.012,12),0xb9c0c9,[x,y+.178,F-.09]));
  p.push(pt(box(.06,.03,.008),r%2?0xf7c948:0xffffff,[x,y-.002,F-.004]))}}   /* 값표 */
 /* 앞 오른쪽: 버튼 판·돈 넣는 곳·작은 화면 */
 const bx=.33;p.push(pt(R(.22,1.02,.03,.02,.01),TRIM,[bx,1.2,F+.006]));gl.push(pt(box(.15,.08,.01),0x8fe3b0,[bx,1.6,F+.024]));
 for(let r=0;r<5;r++)for(let c=0;c<2;c++)p.push(pt(cyl(.022,.022,.02,10),r===4?0xe0533f:0xf4f1ea,[bx-.045+c*.09,1.45-r*.1,F+.026],[Math.PI/2,0,0]));
 p.push(pt(box(.07,.12,.02),0x1f2226,[bx,.9,F+.024]),pt(box(.012,.07,.01),0x9aa3ab,[bx,.9,F+.036]),pt(box(.1,.05,.02),0x1f2226,[bx,.76,F+.024]));
 /* 아래 꺼내는 곳 */
 p.push(pt(R(.66,.24,.05,.02,.01),TRIM,[-.06,.3,F+.006]),pt(box(.58,.16,.02),DK,[-.06,.3,F+.03]),pt(box(.56,.03,.02),0x5a616a,[-.06,.37,F+.042]));
 p.push(pt(box(.3,.02,.01),RED,[.2,.15,F+.01]));
 const g=mg(p);GEO.pv79=g;GEO.pv79_glow=mg(gl);return g}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();try{pv79Geo();if(typeof lkAOnew==='function'){const b0=Object.assign({},GEO);delete b0.pv79;lkAOnew(b0)}}catch(e){console.error('79차 자판기 모양',e)}}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.t==='pvend'&&r.m&&GEO.pv79_glow&&typeof HGLOW!=='undefined'){const host=r.m.children[0]||r.m;host.add(mesh(GEO.pv79_glow,HGLOW,false));
   if(typeof PLAMPS!=='undefined'){const l=glow(0xd8f0ff,2.1,.42);l.position.set(-.12,1.25,.6);l.visible=false;r.m.add(l);PLAMPS.push(l)}}}catch(e){}return r}}
const pv79Fits=(x,z,p)=>{const B=DECO.pvend,x0=x-B.bx,x1=x+B.bx,z0=z-B.bz,z1=z+B.bz;let lo=1e9,hi=-1e9;
 for(let u=0;u<=4;u++)for(let v=0;v<=5;v++){const px=x0-.25+(x1-x0+.5)*u/4,pz=z0-.25+(z1-z0+1.9)*v/5,h=hAt(px,pz);if(h<1.0||onDock(px,pz))return false;if(pz<=z1+.3){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
 if(hi-lo>.2)return false;
 for(const q of structs){if(Math.abs(q.x-x)>14||Math.abs(q.z-z)>14)continue;const d=sdef(q);if(!d||d.pass)continue;
  if(q.t==='vend'||q.t==='recycle'||q.t==='fbuy'){if(q.x+d.bx>x0-.22&&q.x-d.bx<x1+.22&&q.z+d.bz>z0-.22&&q.z-d.bz<z1+.22)return false;continue}
  const e=Math.max(d.bx,d.bz),C=.9;if(q.x+e>x0-C&&q.x-e<x1+C&&q.z+e>z0-C&&q.z-e<z1+C+1.2)return false}
 for(const P2 of PORTS)for(const [qx,qz,qr] of P2.pp||[])if(qx+qr>x0-.9&&qx-qr<x1+.9&&qz+qr>z0-.9&&qz-qr<z1+2.1)return false;
 for(const b of PBOATS)if(Math.abs(b.m.position.x-x)<6.5&&Math.abs(b.m.position.z-z)<6.5)return false;
 if(p&&!p.town){const w=(p.v&&p.v.w)||2.8;for(const [cx,cz] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],[x,z]]){const ex=cx-p.x,ez=cz-p.z,lx=ex*p.dz-ez*p.dx,lz=ex*p.dx+ez*p.dz;if(Math.abs(lx)<w/2+1.4&&lz>-16)return false}}
 return true};
function placePv79(p){const B=DECO.pvend,row=['fbuy','recycle','vend'].map(t=>structs.find(q=>q.t===t&&q.pi===p.i)).filter(Boolean),C=[];
 for(const q of row){const d=sdef(q);C.push([q.x+d.bx+.3+B.bx,q.z+d.bz-B.bz],[q.x-d.bx-.3-B.bx,q.z+d.bz-B.bz])}   /* 같은 줄 옆(앞을 맞춰요) */
 const o=row[0]||p;for(let r=2.5;r<=14;r+=.75)for(let k=0;k<20;k++){const a=k/20*Math.PI*2;C.push([o.x+Math.cos(a)*r,o.z+Math.sin(a)*r])}
 for(const [x,z] of C)if(pv79Fits(x,z,p)){addStruct({t:'pvend',x,z,r:0,pi:p.i,hp:1e9});return true}
 console.warn('일반 자판기 자리를 못 찾음',p.n);return false}
{const _pf=placeFishBuyer;placeFishBuyer=function(p){const r=_pf.apply(this,arguments);try{placePv79(p)}catch(e){console.error('79차 일반 자판기',e)}return r}}
{const _sl=sLabel;sLabel=function(s){if(s.t==='pvend')return'일반 자판기';return _sl(s)}}
{const _it=interact;interact=function(){const t=target;if(t&&t.k==='s'&&t.s.t==='pvend'){if(inp.actEdge){PV79.pi=t.s.pi|0;openPanel('pvend')}return}return _it.apply(this,arguments)}}
const pv79List=()=>PV79.items.filter(q=>q&&ITEMS[q[0]]).map(q=>{const it=ITEMS[q[0]],n=q[1]||1;return{k:q[0],n,pr:PV79.free?0:(q[2]!=null?q[2]:(it.p||0)*n)}});
function pv79Html(){const L=pv79List();if(!L.length)return'<div class="row"><div class="tx">아직 파는 물건이 없어요<small>곧 물건이 채워질 예정이에요 (준비 중)</small></div></div>';
 return L.map(q=>{const it=ITEMS[q.k],has=it.one&&invN(q.k),ok=!has&&S.coins>=q.pr;
  return`<div class="row">${invIcon(q.k)}<div class="tx">${it.n}${q.n>1?' ×'+q.n:''}<small>${it.d||''}</small></div><button class="btn" data-a="pv79buy" data-k="${q.k}" ${ok?'':'disabled'}>${has?'보유 중':q.pr?q.pr+' 동전':'무료로 받기'}</button></div>`}).join('')}
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);if(panel!=='pvend')return;$('ptabs').innerHTML='<div class="tab on">🥤 일반 자판기</div>';$('pbody').innerHTML=pv79Html()}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="pv79buy"]');if(!b||b.disabled||panel!=='pvend')return;const q=pv79List().find(v=>v.k===b.dataset.k);if(!q)return;const it=ITEMS[q.k];
 if(!bagHas(q.k)){bagFullMsg();return}if(it.one&&invN(q.k)){toast('이미 갖고 있어요')}else if(S.coins<q.pr){toast('동전이 모자라요')}else{S.coins-=q.pr;give(q.k,q.n);sfx(880,.07);sfx(1320,.05,'sine',.03);toast(`${it.n}${q.n>1?' ×'+q.n:''} 샀어요`);hudDirty=true}renderPanel()});
