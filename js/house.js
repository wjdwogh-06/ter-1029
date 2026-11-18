'use strict';
/* ===== 집 업그레이드 (15차, 기획자) =====
   텐트 안 작업대를 누르면 왼쪽은 제작, 오른쪽은 업그레이드. 지금은 '텐트 → 집' 하나뿐.
   - 필요한 것: BUILDS.ptent.upg = {to:'phouse', c:{wood:120}} (core.js). 나무는 작업대에서 [넣기]로 조금씩 넣어 두고(텐트에 s.upc로 저장),
     다 넣으면 [업그레이드] → 로딩 화면('집을 짓는 중…') → 같은 자리에 통통한 통나무 집(BUILDS.phouse)이 서고, 그 앞에서 깨어나요.
   - 집 안은 더 넓은 방(interior.js INT_ROOM.house). 작업대 등 안에 놓은 것은 그대로.
   - 집을 철거하면 텐트 키트 + 나무 절반, 업그레이드 전에 텐트를 철거하면 넣어 둔 나무를 모두 돌려받아요(actors.js placeBuild).
   - 멀티 서버는 아직 받지 않아요(서버 마무리 때 같이).
   집 모양: 우리 숲 컨셉의 통나무 집. 둥근 통나무 벽 + 돌 기단 + 짙은 청록 지붕(크림색 테두리) + 앞쪽 박공(삼각형) 아래 문, 양옆 덧창 달린 창, 돌 굴뚝.
   문·정면은 +z(카메라 쪽). 롱빈터의 주황 기와 오두막·마름모 창 문과 다르게 만들었어요. */
const HUP={on:false};let HOUSE_IC;
function houseGeo(){const LOG=0x9c6b43,LOG2=0x8a5b37,END=0xdcb98e,RF=0x3e5c66,RF2=0x2d454d,CR=0xf2e8d2,ST=0x9b9a90,ST2=0x7d7f78,DR=0x5f3f27,GB=0xc8996a,GL=0xffdc8c,
  p=[],gl=[],W=1.72,D=1.62,r=.16,y0=.26,dy=2*r*.94,N=7,yT=y0+N*dy,Hr=1.35,E=W+.25;
 p.push(pt(box(2*W+.62,y0,2*D+.62),ST,[0,y0/2,0]),pt(box(1.1,.13,.42),ST2,[0,.065,D+.52]));
 /* log walls: back and sides whole, front split around the door and the two windows */
 const DOOR=[-.46,.46,y0,2.02],WIN=[[-1.46,-.86,1.0,1.62],[.86,1.46,1.0,1.62]];
 for(let i=0;i<N;i++){const y=y0+r+i*dy,c1=i%2?LOG:LOG2,c2=i%2?LOG2:LOG;
  p.push(pt(cyl(r,r,2*E,10),c2,[0,y,-D],[0,0,Math.PI/2]));
  for(const sx of[-1,1])p.push(pt(cyl(r,r,2*D+.5,10),c1,[sx*W,y,0],[Math.PI/2,0,0]),pt(cyl(r*.84,r*.84,.02,10),END,[sx*W,y,D+.26],[Math.PI/2,0,0]),pt(cyl(r*.84,r*.84,.02,10),END,[sx*E+sx*.01,y,D],[0,0,Math.PI/2]));
  const cut=[DOOR,...WIN].filter(o=>y+r*.5>o[2]&&y-r*.5<o[3]).sort((a,b)=>a[0]-b[0]);let x=-E;
  for(const o of cut){if(o[0]-x>.05)p.push(pt(cyl(r,r,o[0]-x,10),c2,[(x+o[0])/2,y,D],[0,0,Math.PI/2]));x=o[1]}if(E-x>.05)p.push(pt(cyl(r,r,E-x,10),c2,[(x+E)/2,y,D],[0,0,Math.PI/2]))}
 /* door: plank panel in a cream frame, brass knob, a lantern beside it */
 p.push(pt(box(.86,1.74,.07),DR,[0,y0+.87,D+.02]));for(const x of[-.22,.22])p.push(pt(box(.025,1.62,.02),0x4a2f1c,[x,y0+.87,D+.06]));
 p.push(pt(box(.1,1.8,.22),CR,[-.51,y0+.9,D+.08]),pt(box(.1,1.8,.22),CR,[.51,y0+.9,D+.08]),pt(box(1.16,.12,.26),CR,[0,2.08,D+.08]),pt(new THREE.SphereGeometry(.045,8,6),0xd9b25a,[.28,1.14,D+.08]));
 p.push(pt(box(.05,.05,.2),0x39425a,[.78,2.02,D+.24]),pt(box(.17,.05,.17),0x39425a,[.78,2.12,D+.34]),pt(box(.15,.04,.15),0x39425a,[.78,1.88,D+.34]));gl.push(pt(box(.11,.2,.11),GL,[.78,2.0,D+.34]));
 /* windows: glowing glass, cream frame and cross, roof-coloured shutters */
 for(const sx of[-1,1]){const cx=sx*1.16;gl.push(pt(box(.6,.84,.04),GL,[cx,1.32,D+.02]));
  p.push(pt(box(.74,.08,.2),CR,[cx,1.76,D+.1]),pt(box(.82,.09,.26),CR,[cx,.9,D+.12]),pt(box(.07,.86,.2),CR,[cx-.335,1.33,D+.1]),pt(box(.07,.86,.2),CR,[cx+.335,1.33,D+.1]),pt(box(.045,.8,.06),CR,[cx,1.33,D+.07]),pt(box(.6,.045,.06),CR,[cx,1.33,D+.07]));
  for(const s2 of[-1,1])p.push(pt(box(.2,.86,.05),RF,[cx+s2*.46,1.33,D+.2]))}
 /* gables (front with a round vent, back plain): upright boards */
 const a=Math.atan2(Hr,W+.1),GW=W+.1;for(const z of[D+.04,-D-.04]){p.push(pt(ex([[-GW,0],[GW,0],[0,Hr]],.1,.01),GB,[0,yT,z],[0,Math.PI/2,0]));
  for(const x of[-1.15,-.58,0,.58,1.15]){const h=Hr*(1-Math.abs(x)/GW)-.08;if(h>.1)p.push(pt(box(.025,h,.02),0xa77a4f,[x,yT+h/2,z+Math.sign(z)*.06]))}}
 p.push(pt(cyl(.2,.2,.05,14),CR,[0,yT+.6,D+.12],[Math.PI/2,0,0]),pt(cyl(.13,.13,.06,14),0x4a3524,[0,yT+.6,D+.13],[Math.PI/2,0,0]));
 /* roof: two slabs on the gable lines, overhanging; shingle lines, ridge cap, cream barge boards */
 const ov=.42,L=(GW+ov)/Math.cos(a)+.06,th=.16,ZL=2*D+.86;
 for(const s of[-1,1]){const nx=s*Math.sin(a),ny=Math.cos(a),cx=s*Math.cos(a)*(L/2-.03),cy=yT+Hr-Math.sin(a)*(L/2-.03),rot=[0,0,-s*a];
  p.push(pt(box(L,th,ZL),RF,[cx+nx*th/2,cy+ny*th/2,0],rot));
  for(const f of[.3,.55,.8]){const dx=s*Math.cos(a)*L*f,dyy=-Math.sin(a)*L*f;p.push(pt(box(.07,.03,ZL-.02),RF2,[dx+nx*(th+.012),yT+Hr+dyy+ny*(th+.012),0],rot))}
  for(const z of[ZL/2+.03,-ZL/2-.03])p.push(pt(box(L+.02,.2,.07),CR,[cx+nx*th*.4,cy+ny*th*.4,z],rot))}
 p.push(pt(cyl(.11,.11,ZL+.04,8),RF2,[0,yT+Hr+th*.95,0],[Math.PI/2,0,0]));
 /* stone chimney on the back left slope */
 p.push(pt(box(.52,1.5,.52),ST,[-.95,3.35,-.62]),pt(box(.53,.06,.53),ST2,[-.95,3.5,-.62]),pt(box(.53,.06,.53),ST2,[-.95,3.85,-.62]),pt(box(.64,.12,.64),ST2,[-.95,4.14,-.62]),pt(box(.32,.02,.32),0x2a2622,[-.95,4.21,-.62]));
 const g=mg(p);if(typeof lkSmooth==='function'&&typeof LK_MOOD!=='undefined'&&LK_MOOD)lkSmooth(g,50);g.computeBoundingSphere();GEO.phouse=g;GEO.phouse_glow=mg(gl)}
{const _bp=buildProc;buildProc=function(){_bp();try{houseGeo()}catch(e){console.error('집 모델 실패',e);GEO.phouse=GEO.mtent}}}
/* the windows and the door lantern glow (always a little, like the boat's windows); the lantern lights up at night */
const HGLOW=new THREE.MeshBasicMaterial({vertexColors:true});
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.t==='phouse'&&r.m&&GEO.phouse_glow){r.m.children[0].add(mesh(GEO.phouse_glow,HGLOW,false));const l=glow(0xffc46a,2.4,.6);l.position.set(.78,2.0,1.62+.34);l.visible=false;r.m.add(l);PLAMPS.push(l)}}catch(e){console.error(e)}return r}}
{const _u=updPlayer;updPlayer=function(dt){if(HUP.on)return;_u(dt)}}   /* 집 짓는 동안은 움직이지 않아요 */

/* ---- upgrade state: the home you entered (INT.s) ---- */
const homeIn=()=>INT.on&&INT.s&&structs.includes(INT.s)?INT.s:null;
function upInfo(){const s=homeIn();if(!s)return null;const d=sdef(s),u=d.upg||null,have=s.upc||{};return{s,d,u,to:u&&BUILDS[u.to],have,ok:!!u&&Object.keys(u.c).every(k=>(have[k]||0)>=u.c[k])}}
function upPut(k,n){const I=upInfo();if(!I||!I.u||!I.u.c[k])return;const need=I.u.c[k]-(I.have[k]||0),m=Math.min(n,need,invN(k));
 if(m<=0){toast(need<=0?'이미 다 넣었어요':jo(ITEMS[k].n,'이','가')+' 없어요');return}
 take(k,m);I.s.upc=Object.assign({},I.s.upc);I.s.upc[k]=(I.s.upc[k]||0)+m;const now=I.s.upc[k];sfx(300,.08,'square',.04);sfx(460,.06,'sine',.03);
 toast(`${ITEMS[k].n} ×${m} 넣었어요 · ${now}/${I.u.c[k]}`+(now>=I.u.c[k]?' — 이제 [업그레이드]를 눌러요':''));if(now>=I.u.c[k])jingle([523,659,784]);save();hudDirty=true}
function upGo(){const I=upInfo();if(!I||!I.u||HUP.on)return;if(!I.ok){toast('나무를 다 넣어야 업그레이드할 수 있어요');return}if(window.MP){toast('멀티에서는 아직 업그레이드할 수 없어요');return}
 closePanel();joyEnd();P.auto=null;HUP.on=true;busy=true;const s=I.s,to=I.u.to,T=3600,f=$('respawn'),bar=$('rsBar'),st=$('rsSt');
 f.classList.add('house','on');f.querySelector('.rsT').textContent='🏠 집을 짓는 중…';f.querySelector('.rsH').textContent='넣어 둔 나무로 통나무 집을 지어요';bar.style.width='0%';st.textContent='';
 const msgs=[[0,'텐트를 걷어요'],[.28,'통나무를 쌓는 중…'],[.62,'지붕을 올려요'],[.88,'문을 달아요']];sfx(180,.12,'square',.04);let t0=0,k0=-1;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='',mi=0;msgs.forEach(([a,q],i)=>{if(k>=a){m=q;mi=i}});if(mi!==k0){k0=mi;sfx(220+mi*60,.07,'square',.035)}if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  intOut();const ns=addStruct({t:to,x:s.x,z:s.z,r:s.r,own:1,kit:s.kit,hp:BUILDS[to].hp});removeStruct(s);
  S.home={x:ns.x,z:ns.z+BUILDS[to].bz+1.1};P.x=S.home.x;P.z=S.home.z;P.rot=0;P.auto=null;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent='다 지었어요!';save();
  setTimeout(()=>{f.classList.remove('on');busy=false;HUP.on=false;const y=groundY(ns.x,ns.z);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;puff(ns.x+Math.cos(a)*2.2,y+.5,ns.z+Math.sin(a)*2.1,0xd8c6a2,5,.8)}
   ftext(ns.x,y+4.8,ns.z,'🏠 집 완성!','#ffe08a');jingle([523,659,784,1047]);toast('🏠 텐트가 집이 됐어요! 들어가 보면 안이 더 넓어요');hudDirty=true;setTimeout(()=>f.classList.remove('house'),700)},700)};
 requestAnimationFrame(step)}
function houseIcon(){if(HOUSE_IC===undefined){try{HOUSE_IC=typeof lkIconFrom==='function'&&GEO.phouse?lkIconFrom(GEO.phouse,[.42,-.55,0],'build'):null}catch(e){HOUSE_IC=null}}return HOUSE_IC}
/* the upgrade column of the workbench window (ui.js renderPanel 'bench') */
function upCard(){const I=upInfo(),hd='<div class="sec" style="margin-top:0">⬆ 업그레이드</div>',hi=houseIcon(),him=hi?`<img src="${hi}">`:'<span class="upe">🏠</span>';
 if(!I)return hd+'<div class="upc"><small>텐트나 집 안의 작업대에서 업그레이드해요</small></div>';
 if(!I.u)return hd+`<div class="upc"><div class="uphd">${him}</div><div class="upn">🏠 ${I.d.n}</div><small>집으로 업그레이드했어요. 다음 업그레이드는 준비 중이에요</small></div>`;
 const tim=ICON.kit_tent?`<img src="${ICON.kit_tent}">`:'<span class="upe">⛺</span>';
 const rows=Object.keys(I.u.c).map(k=>{const need=I.u.c[k],have=Math.min(need,I.have[k]||0),inv=invN(k),can=have<need&&inv>0;
  return`<div class="upr">${invIcon(k)}<div class="grow"><div class="upl"><b>${ITEMS[k].n}</b><span>${have} / ${need}</span></div><div class="upbar"><i style="width:${(have/need*100).toFixed(1)}%"></i></div><small>가방에 ${inv}개${have>=need?' · 다 넣었어요 ✔':''}</small></div></div>
   <div class="upbtns"><button class="btn g" data-a="upput" data-k="${k}" data-n="10" ${can?'':'disabled'}>10개 넣기</button><button class="btn g" data-a="upput" data-k="${k}" data-n="9999" ${can?'':'disabled'}>전부 넣기</button></div>`}).join('');
 return hd+`<div class="upc"><div class="uphd">${tim}<span class="uparr">➜</span>${him}</div><div class="upn">${I.d.n} → ${I.to.n}</div><small>${I.to.d}</small>${rows}
  <button class="btn" data-a="upgo" ${I.ok?'':'disabled'} style="width:100%;margin-top:10px">⬆ 업그레이드</button>${I.ok?'':'<small style="text-align:center;display:block;margin-top:6px">나무를 다 넣으면 누를 수 있어요</small>'}</div>`}
