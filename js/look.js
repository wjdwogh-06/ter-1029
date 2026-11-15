'use strict';
/* ===== look: 롱빈터풍 새 디자인 — 집, 아이템, 아이콘 =====
   다른 파일은 고치지 않고 위에 "덮어씌우는" 파일이에요. index.html에서 이 파일 한 줄만 빼면 예전 모습으로 돌아가요.
   로드 순서: interior.js 다음, ui.js 앞 (ui.js 끝의 boot()가 돌기 전에 감싸 두어야 해요).

   - 캐릭터는 바꾸지 않아요(기획자 결정: 원래 KayKit 캐릭터 유지). 이 파일에 캐릭터 코드는 없어요.
   - 집: home_A / home_B / 플레이어 오두막(home)을 주황 기와지붕 오두막 4색으로. 충돌 크기(bx,bz)는 예전 그대로예요.
   - 아이템: 텐트, 나무, 돌, 산딸기, 통조림, 손도끼 모델. 모든 아이콘은 베이지 원판 + 갈색 테두리 스티커로.
   새 전역 이름은 전부 LK / lk 로 시작해요. */

const LK_ICON_DISC=true;   /* false 로 바꾸면 아이콘 뒤 베이지 원판 없이 테두리만 */

/* ---------- 집: 주황 기와지붕 오두막 ---------- */
/* W,D = 벽 크기, H = 벽 높이, RH = 지붕 높이. 문은 +z(카메라 쪽) */
function lkCottage(W,D,H,RH,wall,door,acc){const T=0xf7efe2,BS=0x9c7b76,BS2=0x86655f,RF=[0xee7d34,0xe56f2c,0xf28a3e],RF2=0xcf5f26,GL=0x9fd6ea,p=[],B=.26,yT=B+H,yR=yT+RH,hw=W/2,hd=D/2;
 p.push(pt(box(W+.26,B,D+.26),BS,[0,B/2,0]),pt(box(W,H,D),wall,[0,B+H/2,0]));
 for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(box(.17,H,.17),T,[sx*hw,B+H/2,sz*hd]));
 for(const sz of[-1,1])p.push(pt(box(W+.12,.15,.15),T,[0,yT-.02,sz*hd]));
 for(const sx of[-1,1])p.push(pt(box(.15,.15,D+.12),T,[sx*hw,yT-.02,0]));
 for(const sz of[-1,1])p.push(pt(ex([[-hw,0],[hw,0],[0,RH]],.12,.005),wall,[0,yT,sz*(hd-.06)],[0,Math.PI/2,0]));
 p.push(pt(ex([[-.46,0],[.46,0],[0,.52]],.04,.005),T,[0,yT+.22,hd+.02],[0,Math.PI/2,0]),pt(ex([[-.3,0],[.3,0],[0,.34]],.04,.005),0xc49a72,[0,yT+.3,hd+.05],[0,Math.PI/2,0]));
 /* 지붕: 판 + 기와 줄(겹쳐 보이게 살짝 덜 기울임) + 흰 박공 테두리 + 용마루 */
 const a=Math.atan2(RH,hw),sl=Math.hypot(hw,RH),OV=.32,OF=.34,Ls=sl+OV,RD=D+OF*2,ca=Math.cos(a),sa=Math.sin(a);
 for(const s of[-1,1]){const at=(t,off)=>[s*(t*ca+off*sa),yR-t*sa+off*ca];
  {const[x,y]=at(Ls/2-.04,.08);p.push(pt(box(Ls,.16,RD),RF2,[x,y,0],[0,0,-s*a]))}
  const nR=5,nC=Math.max(6,Math.round(RD/.6));for(let i=0;i<nR;i++){const[x,y]=at((i+.6)*Ls/nR-.04,.2);for(let j=0;j<nC;j++)p.push(pt(box(Ls/nR+.07,.09,RD/nC-.035),RF[(i*3+j*5+(s>0?1:0))%3],[x,y,-RD/2+(j+.5)*RD/nC],[0,0,-s*(a-.07)]))}
  for(const sz of[-1,1]){const[x,y]=at(Ls/2-.04,.1);p.push(pt(box(Ls+.04,.22,.17),T,[x,y,sz*(RD/2+.02)],[0,0,-s*a]))}}
 p.push(pt(cyl(.14,.14,RD+.1,8),RF2,[0,yR+.22,0],[Math.PI/2,0,0]));
 {const cx=W*.24,cz=-hd*.35,yb=yR-cx*RH/hw;p.push(pt(box(.42,1.25,.42),0x8f8a86,[cx,yb+.4,cz]),pt(box(.52,.12,.52),0x77726e,[cx,yb+1.06,cz]),pt(box(.26,.02,.26),0x2a2a2a,[cx,yb+1.125,cz]))}
 /* 문: 흰 문틀, 색 문, 마름모 창, 손잡이 + 디딤돌, 우편함, 양옆 창문 */
 const zf=hd;p.push(pt(box(1.12,1.95,.12),T,[0,B+.975,zf+.03]),pt(box(.86,1.78,.1),door,[0,B+.89,zf+.07]),pt(box(.3,.3,.04),0x6b4a3a,[0,B+1.33,zf+.12],[0,0,Math.PI/4]),pt(box(.22,.22,.05),0xeadbb8,[0,B+1.33,zf+.13],[0,0,Math.PI/4]),
  pt(box(.13,.045,.06),0x3a2a22,[.25,B+.88,zf+.14]),pt(box(.04,.08,.05),0x3a2a22,[.2,B+.88,zf+.13]),pt(box(1.3,.15,.6),BS2,[0,.075,zf+.42]),pt(box(.2,.3,.14),acc,[-.82,B+1.15,zf+.08]),pt(box(.22,.05,.16),0x3a3f46,[-.82,B+1.32,zf+.08]));
 for(const sx of[-1,1])p.push(pt(box(.1,.82,.82),T,[sx*(hw+.03),B+1.2,-.05]),pt(box(.1,.64,.64),GL,[sx*(hw+.05),B+1.2,-.05]),pt(box(.11,.05,.64),T,[sx*(hw+.06),B+1.2,-.05]),pt(box(.11,.64,.05),T,[sx*(hw+.06),B+1.2,-.05]));
 return mg(p)}
const LK_COT=[[0xf2b6c4,0xe9c27c,0x4f7fd6],[0x9edcc2,0xe9c27c,0xc9543a],[0xf6c95c,0xf7efe2,0x5468c8],[0xdc4a40,0x3f8fd2,0xf2b33d]];   /* [벽, 문, 우편함] 분홍, 민트, 노랑, 빨강 */
const LK_HOUSE={home_A:'lk_cotA_',home_B:'lk_cotB_',home:'lk_cotA_'};
function lkHouseVar(s){const b=LK_HOUSE[s.t];if(!b||!s.m)return;const v=(hash(Math.round(s.x),Math.round(s.z),77)*LK_COT.length)|0,m=s.m.children[0];if(m&&GEO[b+v])m.geometry=GEO[b+v]}

/* ---------- 아이템 ---------- */
function lkTent(){const Y=0xf2b33a,Y2=0xe39a26,OR=0xc9702a,DK=0x4a2e1e,WD=0x9a6a42,p=[],hw=1.18,ht=1.62,L=2.5,yb=.04,sl=Math.hypot(hw,ht),a=Math.atan2(ht,hw);
 p.push(pt(box(2.7,.04,2.8),0x6f7a52,[0,.02,0]),pt(ex([[-hw,0],[hw,0],[0,ht]],L,.015),Y,[0,yb,0],[0,Math.PI/2,0]));
 for(const s of[-1,1]){const nx=s*ht/sl,ny=hw/sl;for(const z of[-.62,.62])p.push(pt(box(sl,.02,.06),Y2,[s*hw/2+nx*.02,yb+ht/2+ny*.02,z],[0,0,-s*a]))}
 for(const s of[-1,1])p.push(pt(box(.07,.12,L+.03),OR,[s*(hw-.02),yb+.05,0]));
 p.push(pt(box(.09,.06,L+.04),OR,[0,yb+ht,0]),pt(ex([[-.56,0],[.56,0],[0,1.08]],.02,.004),DK,[0,yb,L/2+.012],[0,Math.PI/2,0]));
 for(const s of[-1,1])p.push(pt(cyl(.065,.065,1.16,8),Y2,[s*.3,yb+.55,L/2+.05],[0,0,s*.482]),pt(box(.05,.05,.1),OR,[s*.3,yb+.55,L/2+.1],[0,0,s*.482]));
 p.push(pt(cyl(.045,.045,L+.5,6),WD,[0,yb+ht+.03,0],[Math.PI/2,0,0]),pt(ex([[0,0],[.34,.09],[0,.18]],.015,.003),0xd9483e,[0,yb+ht+.08,L/2+.2],[0,Math.PI/2,0]));
 for(const[x0,y0,z0,x1,z1]of[[0,yb+ht,L/2+.22,0,L/2+.55],[0,yb+ht,-L/2-.22,0,-L/2-.55],[hw*.55,yb+ht*.45,0,hw+.28,0],[-hw*.55,yb+ht*.45,0,-hw-.28,0]]){const dv=new THREE.Vector3(x1-x0,.05-y0,z1-z0),Lr=dv.length(),eu=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dv.normalize()));
  p.push(pt(cyl(.01,.01,Lr,3),0xe8dfc8,[(x0+x1)/2,(y0+.05)/2,(z0+z1)/2],[eu.x,eu.y,eu.z]),pt(box(.05,.14,.05),0x9aa3ad,[x1,.06,z1]))}
 return mg(p)}
function lkLogs(){const BK=0x8a5a32,BK2=0x744a28,END=0xeac58d,RING=0xc99a5e,p=[];
 for(const[x,y]of[[-.17,.16],[.17,.16],[0,.45]]){p.push(pt(cyl(.16,.16,.72,10),y>.3?BK2:BK,[x,y,0],[0,0,Math.PI/2]));for(const e of[-1,1])p.push(pt(cyl(.13,.13,.02,10),END,[x+e*.36,y,0],[0,0,Math.PI/2]),pt(new THREE.TorusGeometry(.065,.013,4,10),RING,[x+e*.371,y,0],[0,Math.PI/2,0]))}
 return mg(p)}
function lkStones(){return mg([pt(new THREE.DodecahedronGeometry(.3,1),0x9aa1a9,[-.15,.2,0],[.3,.5,0],[1.1,.75,1]),pt(new THREE.DodecahedronGeometry(.24,1),0x858b93,[.25,.16,.08],[1,.2,.4],[1,.7,1]),pt(new THREE.DodecahedronGeometry(.18,0),0xb3b8be,[.05,.42,-.02],[.5,1,0],[1,.8,1])])}
function lkBerry(){const p=[];[[0,.2,0,.15],[.2,.17,.06,.13],[-.19,.16,.05,.13],[.05,.17,.2,.12],[.02,.38,.04,.13]].forEach(([x,y,z,r],i)=>p.push(pt(new THREE.SphereGeometry(r,10,8),i%2?0xc8302c:0xe0403a,[x,y,z]),pt(ico(r*.18),0xffffff,[x-r*.35,y+r*.45,z+r*.55])));
 p.push(pt(new THREE.SphereGeometry(.2,8,6),0x4f9a3c,[.12,.52,-.08],[0,.4,.5],[1,.18,.55]),pt(new THREE.SphereGeometry(.18,8,6),0x5aa847,[-.1,.53,-.06],[0,-.5,-.6],[1,.18,.5]),pt(cyl(.02,.025,.14,5),0x6b4a2a,[.01,.52,0]));return mg(p)}
function lkCan(){const SV=0xd8dee5,SV2=0xaab3bd;return mg([pt(cyl(.17,.17,.32,14),SV),pt(cyl(.176,.176,.2,14),0xf08a3c,[0,-.01,0]),pt(cyl(.178,.178,.05,14),0xfff1d6,[0,-.01,0]),
 pt(new THREE.TorusGeometry(.165,.014,4,14),SV2,[0,.16,0],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.165,.014,4,14),SV2,[0,-.16,0],[Math.PI/2,0,0]),pt(box(.1,.012,.05),SV2,[.05,.167,0]),pt(new THREE.TorusGeometry(.03,.008,4,8),SV2,[.1,.168,0],[Math.PI/2,0,0]),
 pt(new THREE.SphereGeometry(.05,8,6),0x5a8fd6,[0,-.01,.17],0,[1.2,.6,.4]),pt(cone(.03,.05,3),0x5a8fd6,[-.075,-.01,.165],[0,0,Math.PI/2])])}
/* 손도끼: 예전 axe_m과 같은 배치(자루는 y축, 날은 -x 쪽)라 손에 쥐는 위치가 그대로예요 */
function lkAxe(){const WD=0xb88350,WD2=0x8d5f36,ST=0xc9d0d8,p=[pt(cyl(.045,.055,1.36,8),WD,[0,.36,0]),pt(cyl(.058,.058,.26,8),WD2,[0,-.18,0]),pt(cyl(.065,.065,.04,8),WD2,[0,-.31,0])];
 for(let i=0;i<4;i++)p.push(pt(new THREE.TorusGeometry(.057,.01,4,8),0x5e3e22,[0,-.27+i*.07,0],[Math.PI/2,0,0]));
 p.push(pt(ex([[-.06,.72],[-.28,.68],[-.44,.62],[-.48,.86],[-.44,1.08],[-.28,1.03],[-.06,.99]],.06,.01),ST,[0,0,0],[0,Math.PI/2,0]),pt(ex([[-.42,.63],[-.48,.62],[-.52,.86],[-.48,1.1],[-.42,1.08],[-.46,.86]],.04,.008),0xeef2f5,[0,0,0],[0,Math.PI/2,0]),
  pt(box(.16,.3,.1),0xd9483e,[.02,.86,0]),pt(box(.06,.14,.08),ST,[.12,.86,0]));return mg(p)}
function lkBuildGeo(){
 LK_COT.forEach((c,i)=>{GEO['lk_cotA_'+i]=lkCottage(2.9,3.0,2.15,1.3,c[0],c[1],c[2]);GEO['lk_cotB_'+i]=lkCottage(3.3,4.0,2.35,1.45,c[0],c[1],c[2])});
 Object.assign(DECO.home_A,{g:'lk_cotA_0',s:1});Object.assign(DECO.home_B,{g:'lk_cotB_1',s:1});Object.assign(BUILDS.home,{g:'lk_cotA_3',s:1});
 GEO.mtent=lkTent();GEO.lk_logs=lkLogs();GEO.lk_stones=lkStones();GEO.lk_berry=lkBerry();GEO.can=lkCan();GEO.axe_m=lkAxe();
 ITEMS.wood.ic='lk_logs';ITEMS.stone.ic='lk_stones';ITEMS.berry.ic='lk_berry';
 for(const k in GEO)if(!GEO[k].boundingSphere)GEO[k].computeBoundingSphere()}

/* ---------- 아이콘: 베이지 원판 + 갈색 테두리 스티커 ---------- */
function lkSticker(im){const N=128,c=document.createElement('canvas');c.width=c.height=N;const k=c.getContext('2d');
 if(LK_ICON_DISC){const g=k.createRadialGradient(N*.42,N*.36,4,N/2,N/2,N*.48);g.addColorStop(0,'#fbf2de');g.addColorStop(1,'#ead5ab');k.fillStyle=g;k.beginPath();k.arc(N/2,N/2,N*.46,0,Math.PI*2);k.fill();k.lineWidth=3;k.strokeStyle='#d6ba88';k.stroke()}
 const o=document.createElement('canvas');o.width=o.height=N;const q=o.getContext('2d');q.drawImage(im,0,0,N,N);q.globalCompositeOperation='source-in';q.fillStyle='#5b3a24';q.fillRect(0,0,N,N);
 const pd=N*.13,S2=N-pd*2;for(let a=0;a<16;a++)k.drawImage(o,pd+Math.cos(a*.3927)*3.2,pd+Math.sin(a*.3927)*3.2,S2,S2);k.drawImage(im,pd,pd,S2,S2);return c.toDataURL()}
function lkIcons(){const ids=Object.keys(ICON);let left=ids.length;const done=()=>{if(--left>0)return;try{if(S&&S.quick&&typeof drawQuick==='function')drawQuick();hudDirty=true}catch(e){}};
 ids.forEach(id=>{const im=new Image();im.onload=()=>{try{ICON[id]=lkSticker(im)}catch(e){}done()};im.onerror=done;im.src=ICON[id]})}

/* ---------- 연결: 기존 함수 감싸기 ---------- */
/* makeIcons는 ui.js(이 파일 뒤)에 있어서, boot()가 buildProc을 부를 때(ui.js가 다 읽힌 뒤) 감싸요 */
{const _bp=buildProc;buildProc=function(){_bp();try{lkBuildGeo()}catch(e){console.error('look: 모델 만들기 실패',e)}
 if(!buildProc.lkIc&&typeof makeIcons==='function'){buildProc.lkIc=1;const _mi=makeIcons;makeIcons=function(){_mi();try{lkIcons()}catch(e){console.error('look: 아이콘 실패',e)}}}}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{lkHouseVar(r)}catch(e){}return r}}
