'use strict';
/* ===== look: 롱빈터풍 새 디자인 — 집, 아이템, 설치형, 아이콘, 자연, 분위기 =====
   기획자가 준 파일(4차)에서 캐릭터 부분만 뺀 것. 다른 파일은 고치지 않고 위에 "덮어씌우는" 파일이에요.
   index.html에서 이 파일 한 줄만 빼면 예전 모습으로 돌아가요. 로드 순서: interior.js 다음, ui.js 앞.

   - 캐릭터는 바꾸지 않아요(기획자 결정: 원래 KayKit 캐릭터 유지). 이 파일에 캐릭터 코드는 없어요.
   - 집: home_A / home_B / 플레이어 오두막(home)을 주황 기와지붕 오두막 4색으로. 충돌 크기(bx,bz)는 예전 그대로예요.
   - 아이템: 텐트, 나무, 돌, 산딸기, 통조림, 손도끼 모델.
   - 설치형 외형(1단계): 울타리 4종 + 문 4종. 움직이는 부품과 효과 자리는 lkModel 설명 참고, 목록은 LKB.
   - 아이콘: 분류별 색 원판 + 크게 삐져나온 물건 + 굵은 외곽선 + 셀 음영 (LK_CAT).
   - 분위기(LK_MOOD): 매끈한 음영, 따뜻한 햇빛 + 보랏빛 그림자, 진한 잔디, 롱빈터풍 나무·바위·덤불, 파란 바다.
   - 마을·항구(LK_MOOD): 자판기 가게, 바, 창고, 컨테이너 작업장, 탱크, 철탑, 드럼통, 팔레트, 콘크리트·나무 부두, 통통배, 가로등.
   - 센터(4차): 건물은 가게 하나, 흰 철조망(cfence)과 소품으로 꾸밈(lkCenter). 보급지에도 철조망(lkSupplyFence).
   - 설치형 2·3단계 외형(4차): 작업대, 모닥불, 난로, 표지판, 텃밭, 발전기, 배터리, 스프링클러.
   - (게임 쪽 추가) 문짝은 사람이 가까이 오면 열려요: 맨 아래 lkGates.
   새 전역 이름은 전부 LK / lk 로 시작해요. */

const LK_ICON_DISC=true;   /* false 로 바꾸면 아이콘 뒤 색 원판 없이 테두리만 */
const LK_MOOD=true;        /* 롱빈터 분위기: 매끈한 음영, 따뜻한 햇빛 + 보랏빛 그림자, 진한 초록 잔디 + 흰 점. false 면 예전 화면 */

/* ---------- 집: 주황 기와지붕 오두막 ---------- */
/* W,D = 벽 크기, H = 벽 높이, RH = 지붕 높이. 문은 +z(카메라 쪽) */
function lkCottage(W,D,H,RH,wall,door,acc,o){o=o||{};const T=0xf7efe2,BS=0x9c7b76,BS2=0x86655f,RF=o.roof||[0xee7d34,0xe56f2c,0xf28a3e],RF2=o.roof2||0xcf5f26,GL=0x9fd6ea,p=[],B=.26,yT=B+H,yR=yT+RH,hw=W/2,hd=D/2;
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
  if(o.solar&&s>0)for(const z of[-.52,.5]){const[x,y]=at(Ls*.5,.29);p.push(pt(box(Ls*.46,.05,.84),0xe3e8ee,[x,y-.015,z],[0,0,-s*a]),pt(box(Ls*.46-.08,.05,.76),0x2a3d92,[x,y+.01,z],[0,0,-s*a]))}
  for(const sz of[-1,1]){const[x,y]=at(Ls/2-.04,.1);p.push(pt(box(Ls+.04,.22,.17),T,[x,y,sz*(RD/2+.02)],[0,0,-s*a]))}}
 p.push(pt(cyl(.14,.14,RD+.1,8),RF2,[0,yR+.22,0],[Math.PI/2,0,0]));
 {const cx=W*.24,cz=-hd*.35,yb=yR-cx*RH/hw;p.push(pt(box(.42,1.25,.42),0x8f8a86,[cx,yb+.4,cz]),pt(box(.52,.12,.52),0x77726e,[cx,yb+1.06,cz]),pt(box(.26,.02,.26),0x2a2a2a,[cx,yb+1.125,cz]))}
 /* 문: 흰 문틀, 색 문, 마름모 창, 손잡이 + 디딤돌, 우편함, 양옆 창문 */
 const zf=hd;p.push(pt(box(1.12,1.95,.12),T,[0,B+.975,zf+.03]),pt(box(.86,1.78,.1),door,[0,B+.89,zf+.07]),pt(box(.3,.3,.04),0x6b4a3a,[0,B+1.33,zf+.12],[0,0,Math.PI/4]),pt(box(.22,.22,.05),0xeadbb8,[0,B+1.33,zf+.13],[0,0,Math.PI/4]),
  pt(box(.13,.045,.06),0x3a2a22,[.25,B+.88,zf+.14]),pt(box(.04,.08,.05),0x3a2a22,[.2,B+.88,zf+.13]),pt(box(1.3,.15,.6),BS2,[0,.075,zf+.42]),pt(box(.2,.3,.14),acc,[-.82,B+1.15,zf+.08]),pt(box(.22,.05,.16),0x3a3f46,[-.82,B+1.32,zf+.08]));
 if(o.upper)for(const sx of[-1,1])p.push(pt(box(.82,.82,.1),T,[sx*W*.26,B+H-.72,hd+.03]),pt(box(.64,.64,.1),GL,[sx*W*.26,B+H-.72,hd+.05]),pt(box(.64,.05,.11),T,[sx*W*.26,B+H-.72,hd+.06]));
 for(const sx of[-1,1])p.push(pt(box(.1,.82,.82),T,[sx*(hw+.03),B+1.2,-.05]),pt(box(.1,.64,.64),GL,[sx*(hw+.05),B+1.2,-.05]),pt(box(.11,.05,.64),T,[sx*(hw+.06),B+1.2,-.05]),pt(box(.11,.64,.05),T,[sx*(hw+.06),B+1.2,-.05]));
 return mg(p)}
const LK_COT=[[0xf2b6c4,0xe9c27c,0x4f7fd6],[0x9edcc2,0xe9c27c,0xc9543a],[0xf6c95c,0xf7efe2,0x5468c8],[0xdc4a40,0x3f8fd2,0xf2b33d]];   /* [벽, 문, 우편함] 분홍, 민트, 노랑, 빨강 */
const LK_HOUSE={home_A:'lk_cotA_',home_B:'lk_cotB_',home:'lk_cotA_',barrel:'lk_drum_'};
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
/* ---------- 설치형 외형: 움직이는 부품 + 효과 자리 ----------
   lkModel(키, 고정 조각들, 부품, 효과자리)로 만들어요.
   - GEO[키]        : 전부 합친 모양 (건설 미리보기 고스트, 아이콘용)
   - GEO[키+'_b']   : 고정 부분만. 실제로 설치되면 이걸 쓰고, 부품은 따로 붙여요
   - 부품(parts)    : {이름:{g:[조각], pv:[회전 중심], glow:빛나는 재질?, par:부모 부품}} → 설치되면 s.lk.parts.이름 (Mesh, 회전 중심에 놓임)
   - 효과자리(anchors): {이름:[x,y,z]} → s.lk.anchors.이름 (빈 Object3D, 불꽃·연기·물보라 같은 효과를 붙일 자리)
   애니메이션은 예) s.lk.parts.door.rotation.y = -Math.PI/2 (문이 앞쪽 +z로 열림) 처럼 부품만 돌리면 돼요. */
const LKP={},LKGLOW=new THREE.MeshBasicMaterial({vertexColors:true});
function lkModel(key,base,parts,anchors){const full=base.slice(),R={parts:[],anchors:anchors||{}},wp={};
 for(const n in parts||{}){const P=parts[n],o=P.par?wp[P.par]:[0,0,0],w=[o[0]+P.pv[0],o[1]+P.pv[1],o[2]+P.pv[2]];wp[n]=w;GEO[key+'_'+n]=mg(P.g);R.parts.push({n,pv:P.pv,glow:!!P.glow,par:P.par||null});
  P.g.forEach(q=>{const c=q.clone();c.translate(w[0],w[1],w[2]);full.push(c)})}
 GEO[key+'_b']=mg(base);GEO[key]=mg(full);LKP[key]=R}
function lkAttach(s){const d=sdef(s);if(!d||!s.m)return;const R=LKP[d.g],m=s.m.children[0];if(!R||!m)return;m.geometry=GEO[d.g+'_b'];s.lk={parts:{},anchors:{}};
 for(const q of R.parts){const pm=mesh(GEO[d.g+'_'+q.n],q.glow?LKGLOW:MAT,!q.glow);pm.name=q.n;pm.position.fromArray(q.pv);(q.par?s.lk.parts[q.par]:m).add(pm);s.lk.parts[q.n]=pm}
 for(const n in R.anchors){const o=new THREE.Object3D();o.name='@'+n;o.position.fromArray(R.anchors[n]);m.add(o);s.lk.anchors[n]=o}}
/* 두 점을 잇는 각목(단면 w×d)과 둥근 막대(반지름 r). 손으로 짠 듯한 뼈대를 만들 때 써요 */
const _lkU=new THREE.Vector3(0,1,0),_lkV=new THREE.Vector3(),_lkQ=new THREE.Quaternion(),_lkE=new THREE.Euler();
function lkAim(a,b){_lkV.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_lkV.length();_lkE.setFromQuaternion(_lkQ.setFromUnitVectors(_lkU,_lkV.normalize()));return{L,pos:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:[_lkE.x,_lkE.y,_lkE.z]}}
const lkBeam=(a,b,w,d,c)=>{const q=lkAim(a,b);return pt(box(w,q.L,d),c,q.pos,q.rot)},lkRod=(a,b,r,c,n=6)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)},lkMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
/* 철망 무늬: 너비 W, 높이 H 사각형 안에 ±45° 철사 */
function lkLattice(W,H,x0,y0,z,step,col,th){const p=[],add=(u0,v0,u1,v1,sg)=>{const L=Math.hypot(u1-u0,v1-v0);if(L<.03)return;p.push(pt(box(L,th,th),col,[x0+(u0+u1)/2,y0+(v0+v1)/2,z],[0,0,sg*Math.PI/4]))};
 for(let k=-H;k<=W;k+=step){const u0=Math.max(0,k),u1=Math.min(W,H+k);if(u1>u0)add(u0,u0-k,u1,u1-k,1)}
 for(let k=step/2;k<=W+H;k+=step){const u0=Math.max(0,k-H),u1=Math.min(W,k);if(u1>u0)add(u0,k-u0,u1,k-u1,-1)}return p}

/* 설치형 카탈로그: 나중에 BUILDS나 ITEMS에 연결할 때 쓰는 정보. lkDefOf(id)는 BUILDS에 바로 넣을 수 있는 모양으로 돌려줘요
   예) BUILDS.fence_iron=Object.assign(lkDefOf('fence_iron'),{c:{scrap:4},d:'설명'})  ← 재료와 설명은 기획에 맞게 */
const LKB={
 fence_wood: {n:'나무 울타리',g:'lk_fence_wood',bx:1,bz:.25,hp:70,grid:1},
 fence_stone:{n:'돌 울타리',g:'lk_fence_stone',bx:1,bz:.4,hp:420,grid:1},
 fence_iron: {n:'철제 울타리',g:'lk_fence_iron',bx:1,bz:.25,hp:650,grid:1},
 fence_ti:   {n:'티타늄 울타리',g:'lk_fence_ti',bx:1,bz:.25,hp:1000,grid:1},
 gate_wood:  {n:'나무 울타리 문',g:'lk_gate_wood',bx:1,bz:.25,hp:60,grid:1,gate:1},
 gate_stone: {n:'돌 울타리 문',g:'lk_gate_stone',bx:1,bz:.4,hp:380,grid:1,gate:1},
 gate_iron:  {n:'철제 울타리 문',g:'lk_gate_iron',bx:1,bz:.25,hp:600,grid:1,gate:1},
 gate_ti:    {n:'티타늄 울타리 문',g:'lk_gate_ti',bx:1,bz:.25,hp:950,grid:1,gate:1},
 /* 2·3단계. indoor:1 = 텐트·집 안에서만, outdoor:1 = 밖에서만 (규칙 구현은 아직 — 표시만 해 둔 값) */
 stove:    {n:'난로',g:'lk_stove',bx:.5,bz:.45,hp:150,indoor:1},
 sign:     {n:'표지판',g:'lk_sign',bx:.3,bz:.15,hp:40},
 garden:   {n:'텃밭 (3×3)',g:'lk_garden',bx:1.5,bz:1.5,hp:120},
 battery:  {n:'배터리',g:'lk_battery',bx:.5,bz:.4,hp:120},
 sprinkler:{n:'스프링클러',g:'lk_sprinkler',bx:.3,bz:.3,hp:60}};
const lkDefOf=id=>{const b=LKB[id];const o={n:b.n,g:b.g,s:1,bx:b.bx,bz:b.bz,hp:b.hp,c:{}};['grid','gate','pass','indoor','outdoor'].forEach(k=>{if(b[k])o[k]=b[k]});return o};

/* 둥근 모서리 상자: w×h×d, cr = 앞에서 본 모서리 둥글기, bv = 테두리 깎기. 아기자기한 덩어리감의 기본 조각 */
function lkRb(w,h,d,cr,bv){bv=Math.min(bv===undefined?.03:bv,w/2-.002,h/2-.002,d/2-.002);const W=w/2-bv,H=h/2-bv,c=Math.max(.001,Math.min(cr===undefined?.04:cr,W-.001,H-.001)),s=new THREE.Shape();
 s.moveTo(-W+c,-H);s.lineTo(W-c,-H);s.quadraticCurveTo(W,-H,W,-H+c);s.lineTo(W,H-c);s.quadraticCurveTo(W,H,W-c,H);s.lineTo(-W+c,H);s.quadraticCurveTo(-W,H,-W,H-c);s.lineTo(-W,-H+c);s.quadraticCurveTo(-W,-H,-W+c,-H);
 const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.002,d-2*bv),bevelEnabled:true,bevelThickness:bv,bevelSize:bv,bevelSegments:2,steps:1,curveSegments:4});g.translate(0,0,-Math.max(.002,d-2*bv)/2);return g}
/* 울타리: 한 칸은 x축으로 2m(-1~1), 앞은 +z. 굵고 둥근 덩어리 몇 개로 단순하게 */
const LKW={post:0xa9652f,cap:0x8e5226,rail:0xb8703a,pl:[0xeda353,0xe0913f,0xf0ab5c,0xe69a48]},LKS={bl:[0xcdb6b5,0xbea7a7,0xd8c4c3],cap:0xa8918f,moss:0x7cbf5a},LKI={post:0x8f99a4,cap:0x6c7580,wire:0xbfc8d1},LKT={post:0xf3f6f8,cap:0x5d6974,pn:0xe2e9ef,in:0xcbd6df,g:0x67d6ff};
const lkPlank=(x,y,h,c,w=.36)=>pt(lkRb(w,h,.1,w*.46,.025),c,[x,y,0]);
/* 나무 울타리: 가는 말뚝 널(끝이 뾰족) 7장 + 뒤쪽 가로대 2개 + 네모 기둥(뾰족 모자). 널마다 색과 키가 조금씩 달라요 */
const LKPK=[0xd99a55,0xcc8b47,0xe0a662,0xd2924f,0xc98644];
const lkPicket=(x,w,h,c,z=0)=>pt(ex([[-w/2,0],[w/2,0],[w/2,h-w*.5],[0,h],[-w/2,h-w*.5]],.04,.006),c,[x,.06,z],[0,Math.PI/2,0]);
const lkWPost=(x,h)=>[pt(box(.13,h,.13),LKW.post,[x,h/2,0]),pt(cone(.115,.12,4),LKW.cap,[x,h+.06,0],[0,Math.PI/4,0]),pt(box(.16,.03,.16),LKW.cap,[x,h,0])];
function lkFenceWood(){const p=[...lkWPost(-.93,1.2),...lkWPost(.93,1.2)];for(const y of[.38,.86])p.push(pt(box(1.74,.09,.05),LKW.rail,[0,y,-.05]));
 for(let i=0;i<7;i++){const x=-.72+i*.24;p.push(lkPicket(x,.19,1.0+[.06,0,.04,.08,.02,.06,0][i],LKPK[i%5]));for(const y of[.38,.86])p.push(pt(new THREE.SphereGeometry(.014,5,4),0x5e3e22,[x,y,.03]))}return p}
/* 돌담: 반듯하게 다듬은 돌을 세 단으로 엇갈려 쌓고 덮개돌을 얹어요 (말랑한 덩어리 대신 또렷한 모서리) */
const LKSB=[0xb7a59c,0xa8958c,0xc4b3aa,0xae9c93,0xbcab9f];
function lkStoneCourse(p,x0,x1,y,h,d,ws,k0,z=0){const sc=(x1-x0)/ws.reduce((a,b)=>a+b,0);let x=x0;ws.forEach((w,i)=>{const W=w*sc;p.push(pt(lkRb(W-.03,h-.03,d-(i%2?.03:0),.03,.022),LKSB[(k0+i*2)%5],[x+W/2,y+h/2,z]));x+=W})}
function lkFenceStone(){const p=[];lkStoneCourse(p,-1,1,0,.3,.52,[.7,.55,.75],0);lkStoneCourse(p,-1,1,.3,.3,.5,[.4,.7,.5,.4],1);lkStoneCourse(p,-1,1,.6,.28,.5,[.6,.8,.6],3);
 lkStoneCourse(p,-1.02,1.02,.88,.1,.6,[1,1.1,.9],2);p.push(pt(new THREE.SphereGeometry(.1,7,4),LKS.moss,[-.5,.97,.14],0,[1.5,.45,1.1]),pt(new THREE.SphereGeometry(.07,7,4),LKS.moss,[.62,.97,-.12],0,[1.5,.45,1.1]));return p}
/* 철제 울타리: 가는 둥근 기둥과 틀에 촘촘한 철망 */
const lkIPost=(x,h,r=.045)=>[pt(cyl(r,r,h,8),LKI.post,[x,h/2,0]),pt(cyl(r+.02,r+.02,.04,8),LKI.cap,[x,h,0]),pt(cyl(r+.035,r+.045,.04,8),LKI.cap,[x,.02,0])];
function lkFenceIron(){const p=[...lkIPost(-.94,1.62),...lkIPost(.94,1.62)];for(const y of[1.5,.14])p.push(lkRod([-.94,y,0],[.94,y,0],.026,LKI.post,6));return p.concat(lkLattice(1.8,1.34,-.9,.15,0,.2,LKI.wire,.02))}
/* 티타늄 울타리: 골이 진 금속판 + 강철 틀 + 볼트. 밝은 은청색에 가는 하늘색 표시등 줄 */
const LKTI={post:0x8e9cab,cap:0x566270,sheet:0xc9d4de,rib:0xe0e8ef,rail:0x73808e,bolt:0x4a5560};
function lkTiPanel(x0,x1,y0,y1,z){const p=[],W=x1-x0,n=Math.max(4,Math.round(W/.2));p.push(pt(box(W,y1-y0,.03),LKTI.sheet,[(x0+x1)/2,(y0+y1)/2,z]));for(let i=0;i<n;i++)p.push(pt(box(W/n*.5,y1-y0,.06),LKTI.rib,[x0+(i+.5)*W/n,(y0+y1)/2,z]));
 for(const y of[y0,y1])p.push(pt(box(W+.04,.08,.1),LKTI.rail,[(x0+x1)/2,y,z]),...[x0+.08,(x0+x1)/2,x1-.08].map(x=>pt(new THREE.SphereGeometry(.028,6,5),LKTI.bolt,[x,y,z+.055])));return p}
function lkFenceTiBase(){const p=[];for(const x of[-.93,.93])p.push(pt(box(.13,1.66,.13),LKTI.post,[x,.83,0]),pt(box(.18,.05,.18),LKTI.cap,[x,1.68,0]),pt(box(.2,.04,.2),LKTI.cap,[x,.02,0]));return p.concat(lkTiPanel(-.86,.86,.16,1.5,0))}
const lkTiGlow=()=>[pt(box(1.5,.035,.11),LKT.g,[0,1.4,0]),...[-.93,.93].map(x=>pt(box(.06,.06,.15),LKT.g,[x,1.52,0]))];
/* 문: 경첩이 왼쪽. 문짝은 부품 'door' (경첩 기준 +x로 뻗음) */
function lkGateWood(){const base=[...lkWPost(-.95,1.36),...lkWPost(.95,1.36)],door=[];
 for(let i=0;i<6;i++){const u=.17+i*.27;door.push(lkPicket(u,.22,1.04+[.04,.08,.1,.1,.08,.04][i],LKPK[(i+2)%5]))}
 for(const y of[.34,.9])door.push(pt(box(1.62,.1,.05),LKW.rail,[.84,y,-.05]),pt(box(.16,.07,.06),0x3a3f46,[.02,y,-.02]));door.push(lkBeam([.1,.36,-.05],[1.58,.88,-.05],.09,.045,LKW.rail),pt(new THREE.TorusGeometry(.06,.016,5,10),0x3a3f46,[1.5,.66,.04]),pt(box(.05,.05,.03),0x3a3f46,[1.5,.74,.03]));
 lkModel('lk_gate_wood',base,{door:{g:door,pv:[-.86,0,0]}})}
function lkGateStone(){const base=[],door=[];for(const sx of[-1,1]){const x=sx*.8;for(let r=0;r<4;r++)lkStoneCourse(base,x-.2,x+.2,r*.32,.32,.5,r%2?[1]:[.55,.45],r+(sx>0?2:0));lkStoneCourse(base,x-.25,x+.25,1.28,.1,.58,[1],1)}
 [.17,.47,.77,1.07].forEach((u,i)=>door.push(pt(box(.28,1.12,.07),[0x9a6236,0x8c582f,0xa66b3d,0x93603a][i],[u,.62,0])));for(const y of[.3,.94])door.push(pt(box(1.2,.09,.1),0x4a4f57,[.62,y,0]),...[.1,.62,1.14].map(u=>pt(new THREE.SphereGeometry(.03,6,5),0x8a9099,[u,y,.055])));
 door.push(pt(new THREE.TorusGeometry(.075,.02,6,12),0x4a4f57,[1.02,.62,.07]));lkModel('lk_gate_stone',base,{door:{g:door,pv:[-.6,0,0]}})}
function lkGateIron(){const base=[...lkIPost(-.95,1.7,.055),...lkIPost(.95,1.7,.055)],door=[];
 for(const y of[1.5,.16])door.push(lkRod([.04,y,0],[1.72,y,0],.028,LKI.post,6));for(const u of[.04,1.72])door.push(lkRod([u,.16,0],[u,1.5,0],.028,LKI.post,6));
 door.push(lkRod([.04,.16,0],[1.72,1.5,0],.02,LKI.post,5),pt(box(.1,.18,.08),0x4a5058,[1.72,.84,.05]),...[.4,1.26].map(y=>pt(box(.1,.06,.09),LKI.cap,[.0,y,0])));
 lkModel('lk_gate_iron',base,{door:{g:door.concat(lkLattice(1.64,1.3,.06,.18,0,.2,LKI.wire,.02)),pv:[-.88,0,0]}})}
function lkGateTi(){const base=[],door=[];for(const x of[-.95,.95])base.push(pt(box(.14,1.76,.14),LKTI.post,[x,.88,0]),pt(box(.19,.05,.19),LKTI.cap,[x,1.78,0]),pt(box(.21,.04,.21),LKTI.cap,[x,.02,0]));
 door.push(...lkTiPanel(.04,1.7,.18,1.5,0),lkBeam([.06,.22,.05],[1.68,1.46,.05],.07,.03,LKTI.rail),pt(box(.14,.2,.08),0x2b3138,[1.56,.86,.07]),...[.4,1.3].map(y=>pt(box(.1,.07,.12),LKTI.cap,[.0,y,0])));
 lkModel('lk_gate_ti',base,{door:{g:door,pv:[-.87,0,0]},doorGlow:{g:[pt(box(1.5,.035,.11),LKT.g,[.87,1.4,0]),pt(box(.07,.04,.02),0x6bff9a,[1.56,.92,.115])],pv:[0,0,0],glow:true,par:'door'},postGlow:{g:[-.95,.95].map(x=>pt(box(.06,.06,.16),LKT.g,[x,1.6,0])),pv:[0,0,0],glow:true}})}
function lkBuildStage1(){
 lkModel('lk_fence_wood',lkFenceWood());lkModel('lk_fence_stone',lkFenceStone());lkModel('lk_fence_iron',lkFenceIron());lkModel('lk_fence_ti',lkFenceTiBase(),{glow:{g:lkTiGlow(),pv:[0,0,0],glow:true}});
 lkGateWood();lkGateStone();lkGateIron();lkGateTi();
 Object.assign(BUILDS.fence,{g:'lk_fence_wood',s:1});Object.assign(BUILDS.wall,{g:'lk_fence_stone',s:1});Object.assign(BUILDS.gate,{g:'lk_gate_stone',s:1})}

/* ---------- 마을·항구: 롱빈터풍 (LK_MOOD) ----------
   예전 중세풍 모델(KayKit)을 같은 자리·같은 충돌 크기로 바꿔요. 구조물 종류(t)와 기능은 그대로: market=자판기 가게(상인), tavern=바, lumbermill=창고, blacksmith/forge=컨테이너 작업장, well=탱크, towerB=철탑 */
const LKH={conc:0xd6d0cc,conc2:0xb0a8a6,red:0xdb5a4c,wood:[0xd18a50,0xc47d45,0xdb9659],dk:0x3a3f4f,cream:0xeee3cc};
function lkContainer(w,h,d,c,c2,pos){const [X,Y,Z]=pos||[0,0,0],y=Y+h/2+.08,p=[pt(box(w,h,d),c,[X,y,Z]),pt(box(w+.06,.12,d+.06),c2,[X,Y+.14,Z]),pt(box(w+.06,.12,d+.06),c2,[X,Y+h+.02,Z])];
 const nx=Math.round(w/.36),nz=Math.round(d/.36);for(let i=0;i<nx;i++){const x=X-w/2+(i+.5)*w/nx;for(const sz of[-1,1])p.push(pt(box(.15,h-.34,.06),c2,[x,y,Z+sz*d/2]))}
 for(let i=0;i<nz;i++){const z=Z-d/2+(i+.5)*d/nz;for(const sx of[-1,1])p.push(pt(box(.06,h-.34,.15),c2,[X+sx*w/2,y,z]))}return p}
function lkLatTower(h,w,pos){const [X,Y,Z]=pos||[0,0,0],n=Math.round(h/1.15),sh=h/n,p=[],an=Math.atan2(sh,w),L=Math.hypot(w,sh);
 for(let i=0;i<n;i++){const c=i%2?0xf3efe8:0xdb4a3e,y=Y+i*sh;for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(box(.1,sh,.1),c,[X+sx*w/2,y+sh/2,Z+sz*w/2]));
  for(const sg of[-1,1]){p.push(pt(box(w,.07,.07),c,[X,y+sh,Z+sg*w/2]),pt(box(.07,.07,w),c,[X+sg*w/2,y+sh,Z]),pt(box(L,.055,.055),c,[X,y+sh/2,Z+sg*w/2],[0,0,(i%2?1:-1)*sg*an]),pt(box(.055,.055,L),c,[X+sg*w/2,y+sh/2,Z],[(i%2?1:-1)*sg*an,0,0]))}}
 p.push(pt(cyl(.04,.04,1.3,5),0x3a3f4f,[X,Y+h+.65,Z]),pt(new THREE.SphereGeometry(.1,8,6),0xff5a4a,[X,Y+h+1.34,Z]),pt(cyl(.26,.26,.07,10),0xf3efe8,[X+w/2+.1,Y+h-.5,Z],[0,0,Math.PI/2]),pt(cyl(.2,.2,.07,10),0xf3efe8,[X,Y+h-1.3,Z+w/2+.1],[Math.PI/2,0,0]));return p}
function lkDrum(c,pos,s=1){const [X,Y,Z]=pos||[0,0,0];return[lkShade(pt(cyl(.38*s,.38*s,1.05*s,12),c,[X,Y+.525*s,Z]),.85,1.06),pt(cyl(.4*s,.4*s,.07*s,12),c,[X,Y+.36*s,Z]),pt(cyl(.4*s,.4*s,.07*s,12),c,[X,Y+.72*s,Z]),pt(cyl(.33*s,.33*s,.03*s,12),0x4a4f5c,[X,Y+1.055*s,Z])]}
function lkPallet(pos,ry=0,boxes=2){const [X,Y,Z]=pos||[0,0,0],W=0xdcae6e,W2=0xc9985a,BX=[0xdcb77c,0xd0a96e,0xe6c68e],p=[],c=Math.cos(ry),sn=Math.sin(ry),T=(x,y,z)=>[X+x*c+z*sn,Y+y,Z-x*sn+z*c];
 for(const x of[-.42,0,.42])p.push(pt(box(.12,.1,1.0),W2,T(x,.05,0),[0,ry,0]));for(let i=0;i<5;i++)p.push(pt(box(1.0,.05,.16),W,T(0,.125,-.42+i*.21),[0,ry,0]));
 [[-.2,.37,-.1,.5,.44,.6],[.26,.3,.16,.4,.3,.44],[-.16,.74,-.06,.36,.28,.4]].slice(0,boxes).forEach(([x,y,z,w,h,d],i)=>p.push(pt(lkRb(w,h,d,.03,.02),BX[i],T(x,y,z),[0,ry+i*.3,0]),pt(box(w+.01,.05,d*.3),0xf3e6c8,T(x,y+h/2-.02,z),[0,ry+i*.3,0])));return p}
/* 부두: 넓은 것은 콘크리트 + 빨간 테두리, 좁은 것은 통통한 나무 판자 (윗면 높이는 예전과 같아요) */
const LKPG={};
function lkPier(L,W){const k='p'+L.toFixed(1)+'_'+W.toFixed(1);if(LKPG[k])return LKPG[k];const p=[];
 if(W>=3){p.push(pt(box(W,.34,L),LKH.conc,[0,.59,0]),pt(box(W-.2,2.4,L-.2),LKH.conc2,[0,-.75,0]));for(const sx of[-1,1])p.push(pt(box(.24,.035,L),LKH.red,[sx*(W/2-.12),.765,0]));for(const sz of[-1,1])p.push(pt(box(W,.035,.24),LKH.red,[0,.765,sz*(L/2-.12)]));
  for(let z=-L/2+3;z<L/2-1;z+=3)p.push(pt(box(W-.5,.012,.05),0xbdb6b2,[0,.763,z]));for(const sx of[-1,1])for(let z=-L/2+1.5;z<L/2;z+=3)p.push(pt(lkRb(.2,.5,.6,.08,.04),0x3f4450,[sx*(W/2+.08),.42,z]))}
 else{const n=Math.max(2,Math.round(L/.8));const yo=((L*7.3+W*3.1)%1)*.018;for(let i=0;i<n;i++)p.push(pt(lkRb(W,.13,L/n-.07,.04,.03),LKH.wood[i%3],[0,.695-yo,-L/2+(i+.5)*L/n]));
  for(const sx of[-1,1]){p.push(pt(box(.18,.2,L),0x9a5a30,[sx*(W/2-.14),.56,0]));const m=Math.max(2,Math.round(L/3.6)+1);for(let i=0;i<m;i++){const z=-L/2+.3+i*(L-.6)/(m-1);p.push(pt(cyl(.17,.19,3.5,8),0xa5622f,[sx*(W/2+.02),-.6,z]),pt(cyl(.2,.2,.1,8),0x7d4824,[sx*(W/2+.02),1.18,z]))}}}
 const g=mg(p);lkSmooth(g,50);return LKPG[k]=g}
function lkQuay(L,W){const p=[pt(box(W+.24,.36,L),LKH.conc,[0,.62,0]),pt(box(W,2.3,L),LKH.conc2,[0,-.7,0]),pt(box(.26,.035,L),LKH.red,[-(W/2-.02),.805,0])];for(const sz of[-1,1])p.push(pt(box(W+.24,.035,.26),LKH.red,[0,.805,sz*(L/2-.13)]));
 const n=Math.round(L/3);for(let i=1;i<n;i++)p.push(pt(box(W,.012,.05),0xbdb6b2,[0,.803,-L/2+i*L/n]));
 for(let i=0;i<n;i++){const z=-L/2+(i+.5)*L/n;p.push(pt(lkRb(.22,.55,.7,.08,.04),0x3f4450,[-(W/2+.2),.3,z]));if(i%2)p.push(pt(cyl(.16,.2,.42,8),0x3f4450,[-(W/2-.5),1.0,z]),pt(new THREE.SphereGeometry(.24,8,5),0xe9c046,[-(W/2-.5),1.24,z],0,[1,.6,1]))}
 const g=mg(p);lkSmooth(g,50);return g}
/* 선체: 고물(t=0)→뱃머리(t=1)로 단면 15개를 이어 붙여요. 단면은 용골 → 둥근 배 밑 → 옆판 → 크림색 띠 */
/* 통통배(항구마다 한 척): 짧고 넓은 어선. 위로 벌어지는 빨간 선체 + 둥근 흰 난간 + 초록 갑판 + 팔각 조타실(앞 세 면이 빛나는 창) + 돛대.
   선체는 고물(t=0)→뱃머리(t=1)로 단면을 이어 붙인 곡면. 길이 6, 폭 3. 창은 따로 빛나는 조각(GEO.lk_fboat_glow)이라 밤에도 밝아요 */
function lkHullParts(){const W=1.5,Z0=-2.7,LEN=6.0,NS=18,NK=6,C={low:[],side:[],in:[],deck:[],rail:[]},st=[];
 for(let i=0;i<=NS;i++){const t=i/NS,u=Math.max(0,(t-.42)/.58),w=Math.max(.03,t<.42?W*(.8+.2*Math.sin(t/.42*Math.PI/2)):W*Math.pow(Math.max(0,Math.cos(u*Math.PI/2)),.6)),d=.75*(1-.45*u*u),h=.5+.42*u*u+.1*Math.pow(1-Math.min(1,t/.42),2),z=Z0+LEN*t,p=[];
  /* 단면: 용골(0,-d) → 둥근 배 밑 → 물 위에서 바깥으로 벌어지며 난간 높이 h까지 */
  for(let k=0;k<=NK;k++){const q=k/NK,x=w*(.62*Math.pow(Math.sin(q*Math.PI/2),.7)+.38*q*q),y=-d+(d+h)*Math.pow(q,1.7);p.push([x,y])}st.push({z,w,h,p})}
 const tri=(L,a,b,c,ox,oy,oz)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(nx*nx+ny*ny+nz*nz<1e-10)return;
  if(nx*ox+ny*oy+nz*oz<0)L.push(...a,...c,...b);else L.push(...a,...b,...c)},quad=(L,a,b,c,d,ox,oy,oz)=>{tri(L,a,b,c,ox,oy,oz);tri(L,a,c,d,ox,oy,oz)},Lk=k=>k<3?C.low:C.side,DY=.2,IN=.86;
 for(let i=0;i<NS;i++){const A=st[i],B=st[i+1];for(const sx of[-1,1]){for(let k=0;k<NK;k++)quad(Lk(k),[sx*A.p[k][0],A.p[k][1],A.z],[sx*A.p[k+1][0],A.p[k+1][1],A.z],[sx*B.p[k+1][0],B.p[k+1][1],B.z],[sx*B.p[k][0],B.p[k][1],B.z],sx,k<2?-1:.1,0);
   quad(C.in,[sx*A.w*.97,A.h,A.z],[sx*A.w*IN,DY,A.z],[sx*B.w*IN,DY,B.z],[sx*B.w*.97,B.h,B.z],-sx,.3,0)}
  quad(C.deck,[-A.w*IN,DY,A.z],[A.w*IN,DY,A.z],[B.w*IN,DY,B.z],[-B.w*IN,DY,B.z],0,1,0)}
 {const A=st[0];for(const sx of[-1,1])for(let k=0;k<NK;k++)quad(Lk(k),[0,A.p[k][1],A.z],[sx*A.p[k][0],A.p[k][1],A.z],[sx*A.p[k+1][0],A.p[k+1][1],A.z],[0,A.p[k+1][1],A.z],0,0,-1);
  quad(C.in,[-A.w*.97,A.h,A.z],[A.w*.97,A.h,A.z],[A.w*IN,DY,A.z+.14],[-A.w*IN,DY,A.z+.14],0,.3,1)}
 const G=(L,c)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(L,3));return pt(g,c)},parts=[G(C.low,0x8f2f2a),G(C.side,0xcf4a40),G(C.in,0xe9dcc0),G(C.deck,0xcfa56e)];
 /* 갑판 널 이음줄, 흰 난간(가는 관), 그 아래 짙은 붉은 띠와 물가의 흰 줄 */
 for(const x of[-1.05,-.7,-.35,0,.35,.7,1.05]){let z1=st[0].z;for(const q of st)if(q.w*IN>Math.abs(x)+.06)z1=q.z;if(z1-st[0].z>.4)parts.push(pt(box(.022,.012,z1-st[0].z-.16),0xa9824e,[x,DY+.007,(z1+st[0].z)/2+.06]))}
 const loop=(f,r,c)=>{const rim=[];for(const sx of[1,-1]){const L=st.map(q=>new THREE.Vector3(sx*f(q)[0],f(q)[1],q.z));rim.push(sx>0?L:L.reverse())}parts.push(pt(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...rim[0],...rim[1].slice(1),rim[0][0].clone()],false,'catmullrom',.25),96,r,6,false),c))};
 loop(q=>[q.w,q.h],.07,0xf3ead6);loop(q=>[q.p[5][0]*1.005,q.p[5][1]],.04,0x9a2f2a);loop(q=>[q.p[4][0]*1.005,q.p[4][1]],.03,0xf3ead6);
 return{parts,st,W,DY}}
function lkTug(){const H=lkHullParts(),CR=0xf0e6d0,CR2=0xd4c8ae,DKB=0x3a3f4f,TL=0x3f8f8a,WDd=0x9a5a36,OR=0xf08a3c,p=H.parts,dk=H.DY,cz=-.8,R=.9,HT=1.12,glow=[],oct=(r,h,n=8)=>{const g=new THREE.CylinderGeometry(r,r,h,n);g.rotateY(Math.PI/n);return g},
  face=(a,rr)=>[Math.sin(a)*rr,Math.cos(a)*rr],AP=R*.925;
 /* 조타실: 팔각 기둥(아래는 나무 띠) + 청록 지붕과 난간. 앞 세 면은 빛나는 창, 옆면은 둥근 창, 뒤는 문 */
 p.push(pt(oct(R,HT),CR,[0,dk+HT/2,cz]),pt(oct(R+.025,.22),WDd,[0,dk+.11,cz]),pt(oct(R+.025,.05),CR2,[0,dk+HT-.2,cz]),pt(oct(R+.2,.1),TL,[0,dk+HT+.05,cz]),pt(oct(R+.1,.07),0x357a76,[0,dk+HT+.13,cz]));
 for(const a of[-Math.PI/4,0,Math.PI/4]){const[sn,c]=face(a,AP);glow.push(pt(lkRb(.56,.5,.05,.06,.02),0xffe08a,[sn,dk+.72,cz+c+.012],[0,a,0]),pt(lkRb(.46,.22,.03,.04,.01),0xfff3c4,[sn*1.012,dk+.64,cz+c*1.012+.02],[0,a,0]));
  p.push(pt(lkRb(.66,.6,.04,.08,.015),DKB,[sn*.985,dk+.72,cz+c*.985],[0,a,0]),pt(box(.035,.5,.06),DKB,[sn*1.01,dk+.72,cz+c*1.01],[0,a,0]))}
 for(const a of[Math.PI/2,-Math.PI/2,Math.PI*.75,-Math.PI*.75]){const[sn,c]=face(a,AP);p.push(pt(cyl(.17,.17,.05,14),DKB,[sn,dk+.74,cz+c],[Math.PI/2,0,-a]));glow.push(pt(cyl(.125,.125,.06,14),0xffe08a,[sn*1.01,dk+.74,cz+c*1.01],[Math.PI/2,0,-a]))}
 {const[sn,c]=face(Math.PI,AP);p.push(pt(lkRb(.46,.84,.05,.06,.02),WDd,[sn,dk+.46,cz+c-.01]),pt(cyl(.1,.1,.06,12),DKB,[sn,dk+.66,cz+c-.02],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.04,8,6),0xe9c046,[.15,dk+.44,cz+c-.05]));glow.push(pt(cyl(.07,.07,.07,12),0xffe08a,[sn,dk+.66,cz+c-.025],[Math.PI/2,0,0]))}
 {const[sn,c]=face(Math.PI/2,AP);p.push(pt(new THREE.TorusGeometry(.17,.055,7,14),OR,[sn+.04,dk+.34,cz+c],[0,Math.PI/2,0]),...[0,1.57,3.14,4.71].map(q=>pt(box(.05,.06,.12),0xf3ead6,[sn+.045,dk+.34+Math.sin(q)*.17,cz+c+Math.cos(q)*.17],[q,0,0])))}
 /* 지붕 난간과 작은 조명, 돛대(가로대, 줄, 붉은 깃발) */
 const ry=dk+HT+.17,rr=R-.02;for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8,b=a+Math.PI/4;p.push(lkRod([Math.sin(a)*rr,ry,cz+Math.cos(a)*rr],[Math.sin(a)*rr,ry+.2,cz+Math.cos(a)*rr],.016,DKB,5));if(i!==7&&i!==0)p.push(lkRod([Math.sin(a)*rr,ry+.2,cz+Math.cos(a)*rr],[Math.sin(b)*rr,ry+.2,cz+Math.cos(b)*rr],.016,DKB,5))}
 p.push(pt(cyl(.1,.12,.14,10),DKB,[0,ry+.1,cz+.62],[.5,0,0]));glow.push(pt(cyl(.085,.085,.03,10),0xfff3c4,[0,ry+.135,cz+.69],[.5+Math.PI/2,0,0]));
 const mz=cz-.2,mt=ry+2.0;p.push(pt(cyl(.04,.055,2.0,8),DKB,[0,ry+1.0,mz]),lkRod([-.42,mt-.45,mz],[.42,mt-.45,mz],.024,DKB,6),lkRod([0,mt,mz],[0,H.st[H.st.length-1].h+.12,3.22],.012,DKB,4),lkRod([0,mt,mz],[0,H.st[0].h+.1,-2.66],.012,DKB,4),
  pt(box(.012,.2,.3),0xcf4a40,[0,mt-.12,mz-.17]),pt(new THREE.SphereGeometry(.03,6,5),DKB,[.42,mt-.45,mz]),pt(new THREE.SphereGeometry(.03,6,5),DKB,[-.42,mt-.45,mz]));glow.push(pt(new THREE.SphereGeometry(.075,10,8),0x7cf0a8,[0,mt+.05,mz]));
 /* 갑판 살림: 뱃머리 계선주·밧줄 타래·닻, 가운데 화물 뚜껑, 고물의 생선 상자·그물 더미·주황 부표 */
 p.push(pt(cyl(.07,.09,.3,10),DKB,[0,dk+.15,2.5]),pt(cyl(.12,.12,.05,10),DKB,[0,dk+.31,2.5]),pt(new THREE.TorusGeometry(.2,.05,6,14),0xe6d6b0,[.34,dk+.05,1.75],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.13,.045,6,12),0xe6d6b0,[.34,dk+.11,1.75],[Math.PI/2,0,0]),
  pt(lkRb(.9,.12,.8,.04,.03),0xb9834c,[0,dk+.06,.75]),pt(box(.92,.03,.06),WDd,[0,dk+.125,.5]),pt(box(.92,.03,.06),WDd,[0,dk+.125,1.0]),pt(new THREE.TorusGeometry(.05,.014,5,10),DKB,[0,dk+.14,.75],[Math.PI/2,0,0]),
  lkBeam([-.2,H.st[H.st.length-2].h+.02,2.95],[-.2,H.st[H.st.length-2].h-.5,2.95],.04,.04,DKB),lkBeam([-.36,H.st[H.st.length-2].h-.46,2.95],[-.04,H.st[H.st.length-2].h-.46,2.95],.04,.04,DKB));
 const sz=cz-1.42;[[-.5,0,0x4a8fd6],[-.5,.24,0x4a8fd6],[.02,0,0x3f7fc4]].forEach(([x,y,c],i)=>{p.push(pt(lkRb(.46,.22,.34,.03,.02),c,[x,dk+.11+y,sz],[0,i*.12,0]),pt(box(.4,.02,.28),0xdfe6ec,[x,dk+.215+y,sz],[0,i*.12,0]));
  if(i)for(let k=0;k<3;k++)p.push(pt(new THREE.SphereGeometry(.07,6,4),0xaeb9c4,[x-.1+k*.1,dk+.235+y,sz+(k%2?.05:-.04)],[0,k,0],[1.6,.35,.7]))});
 p.push(lkShade(pt(new THREE.SphereGeometry(.34,9,6),0x2f6f6a,[.62,dk+.1,sz+.05],0,[1.1,.5,.9]),.8,1.1),pt(new THREE.SphereGeometry(.2,8,5),0x357a76,[.5,dk+.26,sz+.02],0,[1,.6,1]),...[[.8,.2,.1],[.45,.36,-.05],[.66,.3,.22]].map(([x,y,z])=>pt(new THREE.SphereGeometry(.07,7,5),OR,[x,dk+y,sz+z])));
 for(const[sx,z]of[[1,.2],[-1,.2],[1,-1.6],[-1,-1.6]]){const q=H.st.reduce((a,b)=>Math.abs(b.z-z)<Math.abs(a.z-z)?b:a);p.push(pt(new THREE.SphereGeometry(.13,8,6),OR,[sx*(q.w+.12),q.h-.36,z],0,[1,1.25,1]),lkRod([sx*(q.w+.1),q.h-.2,z],[sx*q.w,q.h,z],.012,0xe6d6b0,4))}
 return{p,glow}}
function lkPortGeo(){const S=(k,p)=>{const g=mg(p);lkSmooth(g,50);g.computeBoundingSphere();GEO[k]=g},hull=(sx,sy,sz)=>{const g=new THREE.SphereGeometry(1,14,6,0,6.3,Math.PI/2,Math.PI/2);g.scale(sx,sy,sz);return g},rim=(sx,sz,t)=>{const g=new THREE.TorusGeometry(1,t,6,20);g.rotateX(Math.PI/2);g.scale(sx,1,sz);return g},disc=(sx,sz)=>{const g=cyl(1,1,.05,16);g.scale(sx,1,sz);return g};
 /* 통통배: 빨간 선체, 초록 갑판, 크림색 조타실에 노란 창 */
 /* 통통배(항구마다 한 척): 단면을 이어 붙여 만든 매끈한 선체(뱃머리가 솟고 고물은 둥글게), 둥근 조타실 */
 {const T=lkTug(),g=mg(T.p);lkSmooth(g,62);g.computeBoundingSphere();GEO.fboat=g;GEO.lk_fboat_glow=mg(T.glow)}
 {/* 생선 덕장: 양 끝 가위다리 + 장대 셋, 밧줄 매듭, 꼬리에 줄 묶어 넌 생선, 발치에 양동이 */
  const W1=0xa9753f,W2=0x8d5f36,RP=0xd9c9a0,p=[];for(const sx of[-1,1]){const x=sx*1.12;p.push(lkBeam([x,0,-.46],[x,2.02,.05],.075,.075,W2),lkBeam([x,0,.46],[x,2.02,-.05],.075,.075,W1),lkBeam([x,.5,-.36],[x,.5,.36],.05,.05,W1),pt(new THREE.TorusGeometry(.085,.022,4,8),RP,[x,1.86,0],[0,Math.PI/2,0]),pt(new THREE.TorusGeometry(.085,.022,4,8),RP,[x,1.78,0],[0,Math.PI/2,0]))}
  p.push(lkRod([-1.32,1.95,0],[1.32,1.95,0],.04,W1),lkRod([-1.26,1.36,.13],[1.26,1.36,.13],.032,W2),lkRod([-1.26,1.36,-.13],[1.26,1.36,-.13],.032,W2));
  if(GEO.f_cod&&GEO.f_herring)for(let i=0;i<6;i++){const x=-.85+i*.34,o=(hash(i,1,31)-.5)*.2;if(i!==2)p.push(pt(box(.012,.14,.012),RP,[x,1.87,0]),pt(GEO.f_cod,null,[x,1.6,0],[Math.PI/2,0,Math.PI/2+o],[.5,.5,.5]));if(i!==4)p.push(pt(box(.012,.12,.012),RP,[x+.1,1.3,.13]),pt(GEO.f_herring,null,[x+.1,1.08,.13],[Math.PI/2,0,Math.PI/2-o],[.5,.5,.5]))}
  p.push(pt(cyl(.17,.13,.26,10),0x8f99a4,[.72,.13,.5]),pt(cyl(.175,.175,.03,10),0x6f7884,[.72,.25,.5]),pt(new THREE.TorusGeometry(.15,.012,4,10,Math.PI),0x4a4f5a,[.72,.26,.5]));S('prack',p)}
 {/* 부표: 빨간 원뿔 몸통 + 흰 띠, 쇠막대 넷으로 세운 등 받침, 꼭대기 노란 등, 번호판 */
  const RD=0xcf4a40,p=[pt(cyl(.3,.2,.2,10),0x7a2f2a,[0,-.08,0]),pt(cyl(.36,.3,.26,10),RD,[0,.15,0]),pt(cyl(.365,.365,.07,10),0xf2efe6,[0,.2,0]),pt(cyl(.3,.36,.06,10),0xb53f36,[0,.31,0])];
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.78;p.push(lkRod([Math.cos(a)*.26,.33,Math.sin(a)*.26],[Math.cos(a)*.07,.98,Math.sin(a)*.07],.018,0x4a4f5a,5))}
  p.push(pt(new THREE.TorusGeometry(.17,.014,4,10),0x4a4f5a,[0,.66,0],[Math.PI/2,0,0]),pt(cyl(.1,.1,.03,8),0x4a4f5a,[0,.99,0]),pt(cyl(.055,.065,.11,8),0xffe14a,[0,1.06,0]),pt(cone(.075,.06,8),0x4a4f5a,[0,1.145,0]),pt(box(.2,.16,.015),0xf2efe6,[0,.6,.2],[-.26,0,0]),pt(box(.1,.03,.006),RD,[0,.61,.21],[-.26,0,0]));S('pbuoy',p)}
 S('rowboat',[pt(hull(.66,.46,1.55),0xc47d45),pt(rim(.66,1.55,.075),0xf0d9a8),pt(disc(.52,1.36),0x9a5a30,[0,-.2,0]),pt(lkRb(1.1,.07,.26,.03,.02),0xe0a565,[0,-.06,.5]),pt(lkRb(1.14,.07,.26,.03,.02),0xe0a565,[0,-.06,-.35]),pt(cyl(.03,.03,1.7,6),0xe9d3a6,[.5,.06,.1],[1.45,0,.25]),pt(cyl(.03,.03,1.7,6),0xe9d3a6,[-.5,.06,.1],[1.45,0,-.25])]);
 if(GEO.sailboat)lkSmooth(GEO.sailboat,50);
 S('plamp',lkLampParts(2.72));
 S('pboll',[pt(cyl(.15,.2,.5,8),0x3f4450,[0,.25,0]),pt(new THREE.SphereGeometry(.24,8,5),0xe9c046,[0,.52,0],0,[1,.6,1])]);
 S('pnet',[...[-1.25,1.25].flatMap(x=>[pt(lkRb(.14,2.0,.14,.06,.03),LKI.post,[x,1,0]),pt(new THREE.SphereGeometry(.1,8,6),LKI.cap,[x,2.04,0])]),pt(lkRb(2.4,.09,.09,.04,.025),LKI.post,[0,1.84,0]),pt(lkRb(2.4,.09,.09,.04,.025),LKI.post,[0,.14,0]),...lkLattice(2.36,1.62,-1.18,.18,0,.3,LKI.wire,.035)]);
 S('psign',[pt(lkRb(.16,2.3,.16,.06,.03),0xa5622f,[0,1.15,0]),pt(lkRb(1.6,.9,.12,.12,.04),0xd99a5c,[0,2.05,.05]),pt(lkRb(1.36,.66,.04,.08,.015),0xf0d9a8,[0,2.05,.12]),pt(lkRb(.1,.3,.03,.04,.01),0xdb5a4c,[-.42,2.1,.15]),pt(lkRb(.1,.1,.03,.04,.01),0xdb5a4c,[-.42,1.86,.15]),...[2.2,2.05,1.9].map((y,i)=>pt(box(i==2?.4:.62,.07,.03),0x8a5a36,[i==2?.09:.2,y,.15]))]);
 S('pstack',[...lkPallet([0,0,0],.2,3),...lkPallet([1.25,0,.3],.9,1),...lkDrum(0xe9c046,[-1.05,0,.35]),...lkDrum(0x4a8fd6,[-.75,0,-.55]),...lkPallet([.5,0,1.25],-.3,0)]);
 S('pcrane',lkLatTower(6.2,.85,[0,.1,0]).concat([pt(box(1.3,.2,1.3),LKH.conc2,[0,.1,0])]))}
/* ---------- 랜덤 자판기 + 재활용 쓰레기통 (기획자 요청 6차, 겉모습은 7차에 다시) ----------
   자판기: 장터 뽑기 궤짝. 청록 철판 몸통(리벳·옆 환기 틈) + 줄무늬 차양 + 유리창 안 캡슐(조각 `glow`, 밤에 빛남) + 동전 구멍·돌리는 손잡이·꺼내는 곳 + 위에 노란 '?' 간판과 전구.
   쓰레기통: 위가 넓은 바퀴 통 둘(초록·파랑, 하나는 뚜껑이 들려 빈 병·깡통이 보임) + 재활용 딱지 + 사이에 동전 그림 팻말(여기서 팔아요). 정면은 +z. 충돌 크기(ports.js DECO)는 그대로 */
function lkTaper(wt,dt,k,h){const g=cyl(.7071,.7071*k,h,4);g.rotateY(Math.PI/4);g.scale(wt,1,dt);return g}
function lkVendGeo(){const TL=0x2f8f9d,TL2=0x277b88,CR=0xf1ece2,YL=0xe9c046,DK=0x2c3346,ST=0x8f99a4,RD=0xcf4a40,FZ=.46;
 const base=[...[[-.52,-.34],[.52,-.34],[-.52,.34],[.52,.34]].map(q=>pt(box(.12,.14,.12),DK,[q[0],.07,q[1]])),pt(box(1.3,.16,.92),TL2,[0,.22,0]),pt(box(1.26,1.5,.88),TL,[0,1.05,0]),pt(box(1.34,.07,.96),CR,[0,1.835,0]),
  /* 앞: 유리창(안이 어두워 캡슐이 도드라짐) + 크림 창틀 */
  pt(box(.98,.66,.02),0x1f2a3a,[0,1.36,FZ-.01]),...[[0,.36,1.06,.06],[0,-.36,1.06,.06],[.52,0,.06,.78],[-.52,0,.06,.78]].map(q=>pt(box(q[2],q[3],.17),CR,[q[0],1.36+q[1],FZ+.07])),pt(box(.03,.66,.03),CR,[0,1.36,FZ+.14]),
  ...[[-.6,1.74],[.6,1.74],[-.6,.36],[.6,.36]].map(q=>pt(cyl(.022,.022,.02,6),ST,[q[0],q[1],FZ-.01],[Math.PI/2,0,0])),
  /* 동전 구멍 · 돌리는 손잡이 · 가격표 · 꺼내는 곳 */
  pt(box(.3,.34,.03),YL,[-.36,.74,FZ]),pt(box(.035,.15,.02),DK,[-.36,.79,FZ+.02]),pt(box(.16,.05,.02),CR,[-.36,.63,FZ+.02]),
  pt(cyl(.13,.13,.05,14),ST,[.3,.76,FZ+.01],[Math.PI/2,0,0]),pt(box(.06,.22,.04),CR,[.3,.76,FZ+.05],[0,0,.5]),pt(cyl(.035,.035,.08,8),RD,[.355,.855,FZ+.09],[Math.PI/2,0,0]),
  pt(box(.18,.13,.012),CR,[-.02,.86,FZ],[0,0,-.06]),pt(box(.11,.02,.006),DK,[-.02,.88,FZ+.01],[0,0,-.06]),pt(box(.07,.02,.006),RD,[-.035,.84,FZ+.01],[0,0,-.06]),
  pt(box(.5,.24,.03),DK,[0,.44,FZ-.01]),pt(box(.54,.04,.1),CR,[0,.31,FZ+.03]),pt(box(.46,.1,.02),ST,[0,.5,FZ+.02],[.35,0,0]),
  /* 줄무늬 차양 */
  ...[0,1,2,3,4,5,6].map(k=>pt(box(.2,.03,.4),k%2?CR:RD,[-.6+k*.2,1.86,FZ+.14],[.42,0,0])),...[0,1,2,3,4,5,6].map(k=>pt(box(.2,.09,.02),k%2?CR:RD,[-.6+k*.2,1.735,FZ+.325])),
  lkRod([-.66,1.5,FZ],[-.66,1.75,FZ+.3],.014,DK,5),lkRod([.66,1.5,FZ],[.66,1.75,FZ+.3],.014,DK,5),
  /* 위 간판: 노란 판에 '?' + 전구 넷 */
  pt(box(.05,.2,.05),DK,[-.34,1.96,-.1]),pt(box(.05,.2,.05),DK,[.34,1.96,-.1]),pt(box(.96,.44,.07),YL,[0,2.26,-.1]),pt(box(1.02,.05,.1),CR,[0,2.5,-.1]),pt(box(1.02,.05,.1),CR,[0,2.02,-.1]),
  pt(box(.16,.05,.02),DK,[0,2.4,-.055]),pt(box(.05,.1,.02),DK,[.07,2.34,-.055]),pt(box(.1,.05,.02),DK,[.03,2.28,-.055]),pt(box(.05,.07,.02),DK,[0,2.23,-.055]),pt(box(.05,.05,.02),DK,[0,2.13,-.055]),pt(box(.05,.07,.02),DK,[-.07,2.37,-.055]),
  /* 옆 환기 틈 · 뒤 전선 · 붙은 쪽지 */
  ...[-1,1].flatMap(sx=>[0,1,2,3].map(k=>pt(box(.012,.03,.5),TL2,[sx*.632,.6+k*.09,0]))),pt(box(.012,.22,.18),CR,[.632,1.4,.1],[.08,0,0]),pt(box(.012,.03,.1),RD,[.64,1.44,.1],[.08,0,0]),
  lkRod([.4,.5,-.44],[.56,.03,-.6],.02,DK,5),lkRod([.56,.03,-.6],[.9,.03,-.5],.02,DK,5)];
 const cap=[],CC=[0xff8a5c,0xffd35c,0x7fe08a,0x7cc7ff,0xff9ac2,0xb79cff];for(let i=0;i<16;i++){const x=-.4+(i%6)*.16+(hash(i,3,51)-.5)*.06,row=i/6|0,y=1.11+row*.15+(hash(i,5,51)-.5)*.03;if(row===2&&i%6>3)continue;cap.push(pt(new THREE.SphereGeometry(.07,8,6),CC[(i*5+row)%CC.length],[x+(row%2)*.07,y,FZ+.06+hash(i,7,51)*.03]))}
 lkModel('lk_vend',base,{glow:{g:cap,pv:[0,0,0],glow:true}});Object.assign(DECO.vend,{g:'lk_vend'});
 const bin=(cx,c,cd,open)=>{const p=[pt(lkTaper(.84,.78,.84,.92),c,[cx,.6,0]),pt(box(.88,.06,.82),cd,[cx,1.04,0]),
   ...[-.26,0,.26].map(u=>pt(box(.05,.62,.02),cd,[cx+u,.56,.365],[-.065,0,0])),...[-.3,.3].map(u=>pt(cyl(.11,.11,.07,10),0x2c3036,[cx+u,.11,-.36],[0,0,Math.PI/2])),pt(cyl(.02,.02,.7,5),0x2c3036,[cx,.11,-.36],[0,0,Math.PI/2]),
   pt(box(.6,.05,.05),cd,[cx,1.0,-.44]),pt(box(.05,.05,.1),cd,[cx-.27,1.0,-.4]),pt(box(.05,.05,.1),cd,[cx+.27,1.0,-.4]),
   /* 재활용 딱지: 크림 종이에 세모 화살 */
   pt(box(.34,.34,.012),0xf1ece2,[cx,.72,.385],[-.065,0,0]),pt(box(.2,.035,.008),cd,[cx,.645,.392],[-.065,0,0]),pt(box(.2,.035,.008),cd,[cx-.052,.735,.386],[-.065,0,Math.PI/3]),pt(box(.2,.035,.008),cd,[cx+.052,.735,.386],[-.065,0,-Math.PI/3])];
  if(open)p.push(pt(box(.92,.06,.88),cd,[cx,1.36,-.3],[-.95,0,0]),pt(box(.3,.04,.06),c,[cx,1.62,-.1],[-.95,0,0]),
   pt(cyl(.05,.05,.26,7),0x7fb86a,[cx-.2,1.12,.1],[.3,0,.2]),pt(cyl(.02,.03,.08,6),0x7fb86a,[cx-.225,1.28,.15],[.3,0,.2]),pt(cyl(.05,.05,.24,7),0x9fd0e6,[cx+.05,1.1,-.05],[-.3,0,-.3]),pt(cyl(.02,.03,.08,6),0x9fd0e6,[cx+.1,1.25,-.1],[-.3,0,-.3]),
   pt(cyl(.055,.055,.13,8),0xd9d4cc,[cx+.24,1.1,.16],[0,0,1.3]),pt(cyl(.055,.055,.13,8),RD,[cx-.02,1.1,.22],[1.2,0,.3]),pt(box(.3,.02,.24),0xe6dcc0,[cx+.18,1.08,-.2],[.2,.4,.1]));
  else p.push(pt(box(.92,.06,.88),cd,[cx,1.1,-.01],[-.03,0,0]),pt(box(.3,.04,.06),c,[cx,1.12,.43]));return p};
 {const WD=0xa9753f,g=mg([...bin(-.5,0x4c9a62,0x35784a,1),...bin(.5,0x4a86c4,0x35669c,0),
   /* 사이 팻말: 동전 그림 = 파는 곳 */
   pt(box(.06,1.5,.06),WD,[0,.75,-.42]),pt(box(.46,.36,.04),0xf1ece2,[0,1.62,-.4]),pt(box(.5,.04,.06),WD,[0,1.82,-.4]),pt(cyl(.1,.1,.03,12),0xe9c046,[-.06,1.62,-.37],[Math.PI/2,0,0]),pt(cyl(.06,.06,.035,10),0xf6dc7a,[-.06,1.62,-.365],[Math.PI/2,0,0]),
   pt(box(.1,.03,.01),0x4c9a62,[.13,1.62,-.375]),pt(box(.05,.03,.01),0x4c9a62,[.16,1.65,-.375],[0,0,-.8]),pt(box(.05,.03,.01),0x4c9a62,[.16,1.59,-.375],[0,0,.8]),
   pt(box(2.0,.05,1.0),0xb9b4ac,[0,.025,0]),pt(box(.3,.2,.3),0xc89258,[0,.15,.3]),pt(cyl(.04,.04,.2,6),0x7fb86a,[-.06,.33,.32]),pt(cyl(.04,.04,.2,6),0xc98a4a,[.06,.33,.26]),pt(cyl(.04,.04,.2,6),0x9fd0e6,[.05,.33,.37])]);
  g.computeBoundingSphere();GEO.lk_recycle=g;Object.assign(DECO.recycle,{g:'lk_recycle'})}}
function lkBuildTown(){
 /* 자판기 가게 (market): 파란 벽 + 주황 지붕 + 태양광판, 오른쪽 앞에 빛나는 자판기 */
 {const G=0xbff3ff,vx=2.35,vz=.7,base=[pt(lkCottage(4.3,3.3,2.3,1.35,0x4f74c8,0xf0d9a8,0xe9c046,{solar:1}),null,[-.75,0,-.45]),pt(lkRb(1.05,1.95,.8,.1,.05),0xd9483e,[vx,1.0,vz]),pt(lkRb(.5,.2,.04,.04,.015),0x2c3038,[vx,.34,vz+.41]),...lkDrum(0xe9c046,[-2.7,0,1.25],.9),...lkDrum(0x4a8fd6,[-2.05,0,1.5],.9),...lkPallet([2.5,0,-.9],.4,2)];
  const gl=[pt(lkRb(.84,1.12,.04,.06,.015),G,[vx,1.3,vz+.41])];[[0xff8a5c,0xffd35c,0x7fe08a],[0x7cc7ff,0xff8a5c,0xffd35c],[0x7fe08a,0x7cc7ff,0xff9ac2]].forEach((r,j)=>r.forEach((c,i)=>gl.push(pt(lkRb(.18,.22,.03,.04,.01),c,[vx-.26+i*.26,1.62-j*.32,vz+.44]))));
  lkModel('lk_shop',base,{glow:{g:gl,pv:[0,0,0],glow:true}});Object.assign(DECO.market,{g:'lk_shop',s:1})}
 /* 바 (tavern): 벽돌색 2층 + 짙은 지붕 + 빛나는 간판과 창 */
 {const base=[pt(lkCottage(3.7,4.3,3.3,1.5,0xcf6a50,0x3f4a66,0xe9c046,{upper:1,roof:[0x5f6480,0x565b75,0x696f8c],roof2:0x474c63}),null,[0,0,-.15]),...lkDrum(0x8a5a36,[-1.5,0,2.2],.8)],
   gl=[pt(lkRb(1.5,.5,.06,.1,.02),0xffd35c,[0,2.62,2.06]),pt(lkRb(1.2,.14,.03,.05,.01),0xff8a5c,[0,2.62,2.1]),...[-1,1].map(sx=>pt(box(.6,.6,.03),0xffe7a8,[sx*3.7*.26,.26+3.3-.72,2.07]))];
  lkModel('lk_bar',base,{glow:{g:gl,pv:[0,0,0],glow:true}});Object.assign(DECO.tavern,{g:'lk_bar',s:1})}
 /* 창고 (lumbermill): 초록 창고 + 흰 셔터문 */
 {const GR=0x4f9d6c,GR2=0x438a5d,W=4.5,D=3.5,H=2.5,zf=D/2,p=[pt(box(W+.2,.16,D+.2),0x9c9794,[0,.08,0]),pt(lkRb(W,H,D,.06,.04),GR,[0,.16+H/2,0]),pt(lkRb(W+.36,.2,D+.36,.08,.04),0xe3e6ea,[0,.16+H+.1,0]),pt(lkRb(W-.6,.16,D-.6,.06,.04),0xcfd4da,[0,.16+H+.28,0])];
  for(let i=0;i<12;i++)p.push(pt(box(.06,H-.2,D+.04),GR2,[-W/2+.2+i*(W-.4)/11,.16+H/2,0]));
  p.push(pt(lkRb(2.3,2.0,.1,.06,.03),0xf3efe8,[-.75,1.16,zf+.03]));for(let i=0;i<6;i++)p.push(pt(box(2.16,.035,.03),0xcfd4da,[-.75,.4+i*.32,zf+.09]));
  p.push(pt(lkRb(.82,1.7,.1,.05,.03),0xe9c046,[1.45,1.01,zf+.03]),pt(box(.1,.05,.06),0x3a3f4f,[1.7,1.0,zf+.1]),pt(lkRb(.3,.16,.2,.05,.02),0x3a3f4f,[-.75,2.36,zf+.1]));
  const g=mg(p);lkSmooth(g,50);GEO.lk_ware=g;Object.assign(DECO.lumbermill,{g:'lk_ware',s:1})}
 /* 컨테이너 작업장 (blacksmith, 플레이어 대장간): 파란 컨테이너 + 주황 차양 + 모루 */
 {const p=[...lkContainer(4.3,2.3,2.3,0x4672c4,0x3a60a8,[0,0,-.9]),pt(box(1.5,1.8,.1),0x232833,[-.5,1.0,.26]),pt(box(3.4,.1,1.7),0xf08a3c,[0,2.3,1.05],[.2,0,0]),pt(box(3.5,.05,.16),0xf3efe8,[0,2.15,1.86],[.2,0,0])];
  for(const x of[-1.6,1.6])p.push(pt(lkRb(.12,2.05,.12,.05,.025),0x3a3f4f,[x,1.02,1.75]));
  p.push(pt(lkRb(.5,.34,.4,.06,.03),0x8a5a36,[1.15,.17,1.1]),pt(lkRb(.66,.18,.28,.05,.03),0x3a3f4f,[1.15,.43,1.1]),pt(lkRb(.3,.14,.2,.05,.02),0x3a3f4f,[1.4,.56,1.1]),pt(cyl(.16,.16,1.3,8),0x8f99a4,[1.5,2.95,-1.3]),pt(cone(.3,.2,8),0x5d656e,[1.5,3.7,-1.3]),...lkDrum(0xdb5a4c,[-1.75,0,.9],.85));
  const g=mg(p);lkSmooth(g,50);GEO.lk_workshop=g;Object.assign(DECO.blacksmith,{g:'lk_workshop',s:1});if(DECO.forge)Object.assign(DECO.forge,{g:'lk_workshop',s:1})}
 /* 탱크 (well): 콘크리트 판 위 크림색 가로 탱크 둘. 받침대, 이음 띠, 위쪽 뚜껑과 빨간 밸브, 앞쪽 연결관과 계기 */
 {const CRM=LKH.cream,BD=0xd3c9b2,STL=0x6c7580,p=[pt(box(2.0,.12,2.2),0xa39d99,[0,.06,0]),pt(box(1.9,.012,.05),0x8f8986,[0,.122,0])];
  for(const x of[-.5,.5]){p.push(lkShade(pt(cyl(.42,.42,1.1,14),CRM,[x,.72,0],[Math.PI/2,0,0]),.88,1.04));for(const z of[-.55,.55])p.push(pt(new THREE.SphereGeometry(.42,14,8),CRM,[x,.72,z],0,[1,1,.6]));
   for(const z of[-.36,0,.36])p.push(pt(cyl(.43,.43,.045,14),BD,[x,.72,z],[Math.PI/2,0,0]));for(const z of[-.4,.4])p.push(pt(box(.62,.34,.1),STL,[x,.29,z]),pt(box(.7,.05,.16),STL,[x,.145,z]));
   p.push(pt(cyl(.1,.1,.08,10),BD,[x,1.16,-.1]),pt(cyl(.03,.03,.14,6),STL,[x,1.22,.22]),pt(new THREE.TorusGeometry(.07,.016,5,10),0xcf4a40,[x,1.3,.22],[Math.PI/2,0,0]),lkRod([x,.72,.8],[x,.3,.92],.035,STL,6))}
  p.push(lkRod([-.5,.3,.92],[.5,.3,.92],.035,STL,6),pt(cyl(.05,.05,.1,8),0xcf4a40,[0,.3,.92],[0,0,Math.PI/2]),pt(cyl(.07,.07,.03,10),0xf3ead6,[0,.42,.92],[Math.PI/2,0,0]),pt(cyl(.02,.02,.1,5),STL,[0,.36,.92]));
  const g=mg(p);lkSmooth(g,50);GEO.lk_tank=g;Object.assign(DECO.well,{g:'lk_tank',s:1})}
 /* 철탑 (towerB) */
 {const g=mg(lkLatTower(8.6,1.25,[0,.2,0]).concat([pt(box(2.9,.2,3.2),0x9c9794,[0,.1,0]),...lkContainer(1.3,1.2,1.0,0xe9c046,0xd0a630,[.6,.2,1.0])]));lkSmooth(g,50);GEO.lk_tower=g;Object.assign(DECO.towerB,{g:'lk_tower',s:1})}
 [0xe9c046,0x4a8fd6,0xdb5a4c,0x5fae7a].forEach((c,i)=>{const g=mg(lkDrum(c));lkSmooth(g,50);GEO['lk_drum_'+i]=g});Object.assign(DECO.barrel,{g:'lk_drum_0',s:1});
 {const g=mg(lkPallet([0,0,0],0,2));lkSmooth(g,50);GEO.lk_pallet=g;Object.assign(DECO.crate,{g:'lk_pallet',s:1})}
 Object.assign(DECO.lumber,{g:'lk_logs',s:3.4});Object.assign(DECO.tent,{g:'mtent',s:1.15});
 /* 모닥불 받침: 둥근 흰 돌 + 엇갈린 장작 (불꽃은 예전 그대로 위에 붙어요) */
 {const g=mg(lkFireParts());lkSmooth(g,60);GEO.firepit=g}}

/* ---------- 센터·항구·보급지의 흰 철조망 (LK_MOOD) ----------
   기획자 요청: 마을 대신 '센터'. 건물은 가게 하나, 나머지는 철조망과 소품으로만 꾸며요. 철조망(cfence)은 지나갈 수 없는 구조물이고, 땅이 물가이거나 다른 구조물과 겹치는 자리는 자동으로 건너뛰어요 */
function lkFenceGeo(){const PO=0xe9ecef,WI=0xd3d9df,p=[];for(const x of[-1.25,1.25])p.push(pt(lkRb(.13,1.95,.13,.05,.03),PO,[x,.975,0]),pt(new THREE.SphereGeometry(.09,8,6),0xc3cad1,[x,1.98,0]));
 p.push(pt(lkRb(2.5,.08,.08,.035,.02),PO,[0,1.8,0]),pt(lkRb(2.5,.08,.08,.035,.02),PO,[0,.14,0]),...lkLattice(2.38,1.6,-1.19,.18,0,.3,WI,.03));const g=mg(p);lkSmooth(g,50);GEO.lk_cfence=g;DECO.cfence={g:'lk_cfence',s:1,bx:1.25,bz:.14}}
function lkFence(x,z,r){const c=Math.cos(r),sn=Math.sin(r);for(const u of[-1.25,0,1.25]){const X=x+c*u,Z=z-sn*u;if(hAt(X,Z)<.95||onDock(X,Z))return null;for(const q of structs)if(q.t!=='cfence'&&inStruct(q,X,Z,.3))return null}
 const hs=[];for(const u of[-1.25,0,1.25])for(const v of[-.3,.3])hs.push(hAt(x+c*u+sn*v,z-sn*u+c*v));for(const q of[[-1.25,-.14],[1.25,-.14],[-1.25,.14],[1.25,.14]])hs.push(hAt(x+q[0],z+q[1]));if(Math.max(...hs)-Math.min(...hs)>.25)return null;return addStruct({t:'cfence',x,z,r})}   /* 기울기: 실제 발자국 + 축 정렬 모서리(check_world 기준) */
function lkCenter(){for(const p of PORTS){const sx=p.town?1:p.sx,W=(lx,lz)=>{lx*=sx;return[p.x+p.dz*lx+p.dx*lz,p.z-p.dx*lx+p.dz*lz]},F=(lx,lz,q)=>{const[x,z]=W(lx,lz);lkFence(x,z,p.r+(q?Math.PI/2:0))},D=(t,lx,lz,r=0)=>{const[x,z]=W(lx,lz);for(const q of structs)if(inStruct(q,x,z,sdef({t}).bx+.2))return;if(hAt(x,z)<.95)return;addStruct({t,x,z,r})};
  if(p.town){for(let lx=-13.75;lx<14;lx+=2.5)if(Math.abs(lx)>4)F(lx,-21);for(const s of[-1,1])for(const lz of[-19.75,-17.25,-14.75,-9.75,-7.25,-4.75])F(s*15.25,lz,1);
   D('well',-10.5,-17.5,.2);D('towerB',10.2,-16.6);D('barrel',-12.7,-5.5);D('barrel',-11.0,-7.3);D('barrel',11.6,-5.0);D('barrel',5.8,-18.6);D('crate',11.2,-10.6,.3);D('crate',-12.6,-12.2,-.2);D('crate',-6.6,-18.6,.5)}
  else if(p.i%2===0){for(const lx of[1.25,3.75,6.25,8.75])F(lx,-12.5);for(const lz of[-11.25,-8.75])F(10,lz,1);D('barrel',8.0,-10.2);D('crate',5.6,-9.9)}}}
function lkSupplyFence(){SUPS.forEach(s=>{const m=s.i%2?-1:1;for(const dx of[-2.5,0,2.5])lkFence(s.x+dx,s.z-5.4,0);lkFence(s.x-3.9*m,s.z-4.0,Math.PI/2);lkFence(s.x-3.9*m,s.z-1.5,Math.PI/2)})}

/* ---------- 설치형 2·3단계: 작업대, 모닥불, 난로, 표지판, 텃밭, 발전기, 배터리, 스프링클러 (외형만) ----------
   부품(s.lk.parts)과 효과 자리(s.lk.anchors): 모닥불 flame/smoke, 난로 fire(빛)·smoke, 표지판 text, 텃밭 p0~p8(심는 자리), 발전기 led(빛)·exhaust, 배터리 charge(빛), 스프링클러 head(돌리는 부품)·spray */
function lkBuildStage2(){const WD=0xd18a50,WD2=0xa9652f,DKM=0x3f4450,ST=0x8f99a4;
 {const p=[];
  p.push(pt(lkRb(2.5,1.25,.16,.1,.04),0xdb9659,[0,.93,0],[Math.PI/2,0,0]),pt(lkRb(2.3,1.05,.08,.08,.03),WD2,[0,.3,0],[Math.PI/2,0,0]));for(const x of[-1.1,1.1])for(const z of[-.48,.48])p.push(pt(lkRb(.16,.9,.16,.05,.03),WD2,[x,.45,z]));
  p.push(pt(lkRb(2.5,.95,.1,.08,.03),0xc47d45,[0,1.52,-.56]),pt(lkRb(.14,1.1,.12,.04,.02),WD2,[-1.14,1.45,-.56]),pt(lkRb(.14,1.1,.12,.04,.02),WD2,[1.14,1.45,-.56]),
   pt(lkRb(.12,.5,.05,.04,.015),0xdb5a4c,[-.7,1.56,-.49],[0,0,.3]),pt(lkRb(.22,.12,.05,.04,.015),ST,[-.63,1.8,-.49],[0,0,.3]),pt(lkRb(.5,.2,.04,.05,.012),ST,[0,1.62,-.49],[0,0,-.12]),pt(lkRb(.14,.2,.05,.04,.015),WD2,[.3,1.6,-.49],[0,0,-.12]),pt(lkRb(.1,.44,.05,.04,.015),WD2,[.75,1.56,-.49]),pt(lkRb(.26,.14,.07,.04,.02),DKM,[.75,1.8,-.49]),
   pt(lkRb(.34,.3,.3,.06,.03),0xdb5a4c,[-.85,1.16,.2]),pt(lkRb(.14,.2,.34,.04,.02),ST,[-.85,1.3,.36]),pt(cyl(.03,.03,.4,6),DKM,[-.85,1.12,.5],[0,0,Math.PI/2]),
   pt(lkRb(.6,.3,.34,.06,.03),0x4a8fd6,[.75,1.16,.1]),pt(lkRb(.3,.06,.06,.025,.015),DKM,[.75,1.36,.1]),pt(lkRb(.7,.26,.06,.05,.02),0xc47d45,[.2,.66,.6]),pt(lkRb(.16,.06,.04,.02,.01),DKM,[.2,.66,.64]));
  lkModel('lk_bench',p,{}, {work:[0,1.05,.2]});Object.assign(BUILDS.bench,{g:'lk_bench',s:1})}
 {const p=lkFireParts();
  lkModel('lk_fire',p,{}, {flame:[0,.2,0],smoke:[0,1.5,0]});Object.assign(BUILDS.fire,{g:'lk_fire',s:1,outdoor:1})}
 {const p=[pt(lkRb(.84,.66,.62,.12,.05),DKM,[0,.55,0]),pt(lkRb(.94,.08,.72,.035,.03),0x2c3038,[0,.9,0]),pt(lkRb(.94,.08,.72,.035,.03),0x2c3038,[0,.2,0]),pt(lkRb(.5,.42,.05,.08,.02),0x2c3038,[0,.55,.31]),pt(lkRb(.08,.06,.06,.02,.015),ST,[.2,.55,.36]),
   pt(cyl(.1,.1,1.5,8),0x565c68,[.22,1.65,-.12]),pt(cyl(.13,.13,.08,8),0x2c3038,[.22,.96,-.12]),pt(cone(.2,.14,8),0x2c3038,[.22,2.46,-.12])];for(const x of[-.34,.34])for(const z of[-.24,.24])p.push(pt(lkRb(.09,.2,.09,.03,.02),0x2c3038,[x,.09,z]));
  lkModel('lk_stove',p,{fire:{g:[pt(lkRb(.36,.28,.03,.06,.01),0xffa24a,[0,.55,.345]),pt(lkRb(.2,.14,.02,.04,.008),0xffe08a,[0,.52,.36])],pv:[0,0,0],glow:true}},{smoke:[.22,2.6,-.12],heat:[0,.6,.5]})}
 /* 표지판: 각목 기둥에 널 세 장을 못으로 박고 종이를 압정으로 붙였어요 */
 lkModel('lk_sign',[pt(box(.1,1.62,.1),WD2,[0,.81,0]),pt(cone(.09,.09,4),0x8a4e28,[0,1.66,0],[0,Math.PI/4,0]),...[0,1,2].map(i=>pt(box(1.2+[0,.06,-.04][i],.23,.05),[0xd99a55,0xcc8b47,0xe0a662][i],[[0,.02,-.02][i],1.24+i*.245,.075],[0,0,[.012,-.015,.01][i]])),
  ...[-.52,.52].flatMap(x=>[1.24,1.485,1.73].map(y=>pt(new THREE.SphereGeometry(.018,5,4),0x5e3e22,[x,y,.105]))),pt(box(.86,.5,.012),0xf6efdc,[0,1.48,.108],[0,0,-.02]),pt(new THREE.SphereGeometry(.03,6,5),0xcf4a40,[0,1.7,.12])],{},{text:[0,1.48,.12]});
 {/* 텃밭: 널 두 장씩 쌓은 테두리 + 모서리 말뚝, 이랑 세 줄에 심는 구멍 아홉, 이름표 말뚝 */
  const SO=0x6b4636,SO2=0x7d5542,SO3=0x5a3a2c,BD=[0xc89258,0xb9824a,0xd4a066,0xbf8a50],p=[pt(box(2.78,.16,2.78),SO,[0,.14,0])],an={};
  for(let k=0;k<4;k++){const r=k*Math.PI/2;for(let u=0;u<2;u++){const g=box(2.96,.15,.07);const c=BD[(k+u*2)%4];p.push(pt(g,c,[Math.sin(r)*1.42,.085+u*.165,Math.cos(r)*1.42],[0,r,0]))}
   for(const e of[-1,0,1])p.push(pt(cyl(.016,.016,.02,5),0x4a4038,[Math.sin(r)*1.46+Math.cos(r)*e*1.2,.25,Math.cos(r)*1.46-Math.sin(r)*e*1.2],[Math.PI/2,r,0]))}
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(box(.13,.46,.13),0x9a6a3c,[sx*1.44,.23,sz*1.44]),pt(cone(.095,.07,4),0x8a5c32,[sx*1.44,.495,sz*1.44],[0,Math.PI/4,0]));
  for(let j=0;j<3;j++){const z=(j-1)*.86,g=cyl(.3,.3,2.62,8,1);g.rotateZ(Math.PI/2);g.scale(1,.42,1);p.push(pt(g,j%2?SO2:0x744d3b,[0,.2,z]))}
  for(let i=0;i<9;i++){const x=(i%3-1)*.86,z=((i/3|0)-1)*.86;p.push(pt(cyl(.1,.07,.03,8),SO3,[x,.325,z]));an['p'+i]=[x,.3,z]}
  for(let i=0;i<7;i++)p.push(pt(ico(.035+hash(i,3,9)*.03),0x9a938a,[(hash(i,1,9)-.5)*2.5,.24,(i%2?-.43:.43)+(hash(i,2,9)-.5)*.1]));
  p.push(pt(box(.035,.4,.035),0xa9753f,[1.2,.42,1.2]),pt(box(.24,.15,.02),0xefe4c8,[1.2,.56,1.22]),pt(box(.15,.02,.006),0x6f9a4a,[1.2,.58,1.232]),pt(box(.1,.02,.006),0x8a7a66,[1.18,.54,1.232]));
  lkModel('lk_garden',p,{},an)}
 /* 휴대용 발전기: 검은 관 틀 안에 엔진(냉각 핀) + 은색 발전부, 위에 빨간 연료통, 앞에 크림색 조작판, 뒤에 소음기와 배기관 */
 {const FR=0x2a2e35,EN=0x4a505a,FN=0x6a717c,SV=0xb9c1c9,RD=0xcf4a3c,CRM=0xe9e2d0,p=[],X=.62,Z=.36,T=.84;
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(lkRod([sx*X,.08,sz*Z],[sx*X,T,sz*Z],.03,FR,8),pt(new THREE.SphereGeometry(.03,8,6),FR,[sx*X,T,sz*Z]));
  for(const sz of[-1,1])p.push(lkRod([-X,T,sz*Z],[X,T,sz*Z],.03,FR,8),pt(box(1.36,.06,.09),FR,[0,.05,sz*Z]),lkRod([-X,.2,sz*Z],[X,.2,sz*Z],.022,FR,6));for(const sx of[-1,1])p.push(lkRod([sx*X,T,-Z],[sx*X,T,Z],.03,FR,8),lkRod([sx*X,.2,-Z],[sx*X,.2,Z],.022,FR,6));
  p.push(pt(box(.42,.42,.5),EN,[.3,.36,0]));for(let i=0;i<5;i++)p.push(pt(box(.46,.022,.54),FN,[.3,.2+i*.075,0]));
  p.push(pt(cyl(.17,.17,.06,14),FR,[.54,.36,0],[0,0,Math.PI/2]),pt(cyl(.07,.07,.07,10),FN,[.56,.36,0],[0,0,Math.PI/2]),pt(lkRb(.05,.05,.14,.02,.012),RD,[.59,.5,.08]),
   pt(cyl(.2,.2,.44,14),SV,[-.28,.34,0],[0,0,Math.PI/2]),pt(cyl(.215,.215,.05,14),FN,[-.5,.34,0],[0,0,Math.PI/2]),pt(cyl(.215,.215,.05,14),FN,[-.07,.34,0],[0,0,Math.PI/2]),pt(box(.5,.05,.4),EN,[-.28,.11,0]),
   pt(lkRb(1.04,.26,.6,.1,.06),RD,[0,.69,0]),pt(box(1.045,.045,.605),0xf3ead6,[0,.64,0]),pt(cyl(.075,.075,.05,10),FR,[.26,.845,0]),pt(cyl(.06,.06,.02,10),0xf3ead6,[-.22,.83,.1]),pt(box(.045,.006,.01),RD,[-.22,.842,.1],[0,.6,0]),
   pt(box(.4,.3,.04),CRM,[-.3,.38,.34]),pt(lkRb(.1,.1,.02,.03,.008),FR,[-.4,.33,.365]),pt(lkRb(.1,.1,.02,.03,.008),FR,[-.27,.33,.365]),pt(box(.05,.08,.03),RD,[-.15,.42,.365]),pt(box(.3,.02,.01),FN,[-.3,.5,.362]),
   pt(lkRb(.34,.15,.14,.05,.03),0x8f99a4,[.24,.3,-.38]),...[0,1,2,3].map(i=>pt(box(.02,.09,.01),FR,[.13+i*.07,.3,-.455])),lkRod([.38,.3,-.4],[.42,.62,-.44],.03,0x8f99a4,8),pt(cyl(.04,.04,.05,8),FR,[.424,.64,-.442]));
  lkModel('lk_gen',p,{led:{g:[pt(cyl(.03,.03,.02,8),0x7cf08a,[-.42,.45,.365],[Math.PI/2,0,0]),pt(cyl(.03,.03,.02,8),0xffd35c,[-.34,.45,.365],[Math.PI/2,0,0])],pv:[0,0,0],glow:true}},{exhaust:[.43,.72,-.45]});Object.assign(BUILDS.gen,{g:'lk_gen',s:1})}
 /* 배터리: 짙은 남회색 통, 밝은 뚜껑에 노란 마개 여섯 개, 빨강·검정 단자와 집게 전선, 앞에 번개 딱지와 충전 칸, 들 손잡이 */
 {const CS=0x3a4656,TP=0x56667c,p=[pt(lkRb(.88,.46,.56,.04,.03),CS,[0,.25,0]),pt(lkRb(.9,.08,.58,.03,.02),TP,[0,.52,0]),pt(box(.89,.02,.57),0x2c3644,[0,.4,0]),...[0,1,2,3,4,5].map(i=>pt(cyl(.035,.035,.03,8),0xe9c046,[-.2+i*.08,.575,-.1])),
   pt(cyl(.04,.045,.08,8),0xb9c1c9,[-.32,.6,.12]),pt(cyl(.04,.045,.08,8),0xb9c1c9,[.32,.6,.12]),pt(lkRb(.11,.06,.11,.03,.015),0xcf4a40,[-.32,.63,.12]),pt(lkRb(.11,.06,.11,.03,.015),0x23272e,[.32,.63,.12]),
   lkRod([-.37,.63,.12],[-.5,.4,.2],.018,0xcf4a40,5),lkRod([-.5,.4,.2],[-.52,.03,.3],.018,0xcf4a40,5),lkRod([.37,.63,.12],[.5,.4,.2],.018,0x23272e,5),lkRod([.5,.4,.2],[.52,.03,.3],.018,0x23272e,5),
   pt(box(.5,.24,.01),0xf3ead6,[.1,.24,.283]),pt(ex([[.0,.09],[-.05,-.01],[-.005,-.01],[-.03,-.09],[.05,.02],[.005,.02]],.012,.002),0xe9a820,[.26,.24,.29],[0,Math.PI/2,0]),pt(box(.3,.15,.012),0x1f2a36,[.0,.24,.287]),
   pt(box(.04,.14,.04),0x23272e,[-.2,.62,-.2]),pt(box(.04,.14,.04),0x23272e,[.2,.62,-.2]),pt(box(.46,.04,.05),0x23272e,[0,.7,-.2])];
  lkModel('lk_battery',p,{charge:{g:[0,1,2,3].map(i=>pt(box(.055,.11,.012),i<3?0x7cf08a:0x3f6f6a,[-.105+i*.07,.24,.292])),pv:[0,0,0],glow:true}},{spark:[0,.72,.12]})}
 /* 스프링클러: 낮은 세 발 받침 + 놋쇠 물기둥, 머리(도는 부품)는 몸통·분사 팔·노즐·추, 땅에는 초록 호스 타래 */
 {const BRS=0xc9a24a,BRS2=0xa9842f,HS=0x4f9a4a,p=[...[0,2.09,4.19].map(a=>lkRod([Math.sin(a)*.3,.02,Math.cos(a)*.3],[0,.3,0],.022,ST,5)),...[0,2.09,4.19].map(a=>pt(cyl(.04,.05,.03,6),DKM,[Math.sin(a)*.3,.015,Math.cos(a)*.3])),pt(cyl(.03,.035,.5,8),BRS,[0,.5,0]),pt(cyl(.05,.05,.06,8),BRS2,[0,.3,0]),pt(cyl(.045,.045,.05,8),BRS2,[0,.74,0]),
   pt(new THREE.TorusGeometry(.26,.035,6,16),HS,[.42,.035,.1],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.19,.035,6,14),HS,[.42,.09,.1],[Math.PI/2,0,0]),lkRod([.2,.04,.02],[.02,.3,0],.03,HS,6)];
  lkModel('lk_sprinkler',p,{head:{g:[pt(cyl(.04,.04,.12,8),BRS,[0,.06,0]),lkRod([0,.08,0],[.26,.17,0],.022,BRS,6),pt(cyl(.03,.02,.07,6),BRS2,[.28,.178,0],[0,0,-1.2]),lkRod([0,.08,0],[-.2,.1,.05],.018,ST,5),pt(box(.07,.05,.05),ST,[-.22,.1,.05]),pt(new THREE.SphereGeometry(.035,6,5),BRS2,[0,.13,0])],pv:[0,.76,0]}},{spray:[.3,.96,0]})}}

/* ---------- 남은 설치물·보급 상자 (외형만, 붙는 자리와 크기는 예전과 같아요) ----------
   보관 상자 mstash, 보급 상자 supcrate(+열린 것), 보급지 등 suplamp, 횃불 torch, 모래주머니 sandbag, 가시 함정 spike, 지뢰 mine,
   탐조등 slbase/slhead(머리 중심 y 2.3, 렌즈 +z), 포탑 tbase/thead/tbrl(머리 중심 y 1.17, 총열 +z), 등대는 매끈하게만 */
function lkSupplyGeo(){const DKM=0x3a3f4f,YL=0xe9c046,S=(k,p,d=50)=>{const g=mg(p);lkSmooth(g,d);g.computeBoundingSphere();GEO[k]=g};
 /* 보급 상자: 각목 뼈대에 널을 댄 나무 궤짝. 가운데 널은 청록 페인트 + 흰 표식, 밧줄 손잡이, 받침목. 열면 뚜껑이 뒤로 젖혀지고 짚과 통조림이 보여요 */
 {const W=[0xd6a868,0xc99a5a,0xdfb478],FRM=0xa87a42,TEAL=0x2f9a93,RP=0xe8dab4,body=()=>{const p=[pt(box(.84,.56,.84),0x4a3a2a,[0,.38,0])];for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(box(.09,.64,.09),FRM,[sx*.44,.4,sz*.44]));for(const z of[-.3,.3])p.push(pt(box(.94,.07,.12),FRM,[0,.045,z]));
   for(let r=0;r<3;r++){const y=.2+r*.2,c=r===1?TEAL:W[r];for(const sz of[-1,1])p.push(pt(box(.84,.17,.035),c,[0,y,sz*.455]));for(const sx of[-1,1])p.push(pt(box(.035,.17,.84),c,[sx*.455,y,0]))}
   p.push(pt(box(.2,.11,.01),0xf3ead6,[-.16,.4,.476]),pt(box(.07,.07,.012),0xf3ead6,[.12,.4,.476]),pt(box(.07,.07,.012),0xf3ead6,[.24,.4,.476]),...[-1,1].map(sx=>pt(new THREE.TorusGeometry(.1,.022,5,10,Math.PI),RP,[sx*.48,.42,0],[0,Math.PI/2,Math.PI])));return p},
   lid=mg([...[-.3,0,.3].map((x,i)=>pt(box(.29,.05,.98),W[i],[x,0,0])),pt(box(.98,.045,.1),FRM,[0,.045,-.3]),pt(box(.98,.045,.1),FRM,[0,.045,.3])]);
  S('supcrate',[...body(),pt(lid,null,[0,.72,0])],30);S('supcrate_open',[...body(),lkShade(pt(new THREE.SphereGeometry(.36,8,5),0xe6cf8a,[0,.6,0],0,[1.1,.3,1.1]),.8,1.1),pt(cyl(.09,.09,.16,10),0xd8dee5,[.15,.7,.1],[.4,0,.3]),pt(cyl(.09,.09,.16,10),0xcf4a40,[-.16,.7,-.08],[.2,0,-.5]),pt(lid,null,[0,.62,-.66],[-1.25,0,0])],30)}
 S('suplamp',lkLampParts(2.12));
}
function lkBuildStage3(){const DKM=0x3a3f4f,ST=0x8f99a4,YL=0xe9c046,WD=0xd18a50,WD2=0xa9652f,S=(k,p,d=50)=>{const g=mg(p);lkSmooth(g,d);g.computeBoundingSphere();GEO[k]=g};
 /* 보관 상자: 쇠띠를 두른 나무 궤. 널 이음줄, 모서리 쇠붙이, 놋쇠 걸쇠와 자물쇠, 옆에 밧줄 손잡이 */
 {const W1=0xc98a4c,W2=0xb9783e,IR=0x4a4f57,BR=0xd6a84a,p=[pt(box(1.36,.56,.9),W1,[0,.34,0]),pt(box(1.42,.16,.96),W2,[0,.7,0]),pt(box(1.42,.02,.96),0x8a5a2c,[0,.615,0])];
  for(const y of[.25,.43])p.push(pt(box(1.365,.012,.905),0x8a5a2c,[0,y,0]));for(const z of[-.24,.0,.24])p.push(pt(box(1.425,.012,.012),0x8a5a2c,[0,.781,z]));for(const z of[-.36,.36])for(const x of[-.5,.5])p.push(pt(box(.12,.07,.12),W2,[x,.035,z]));
  for(const x of[-.42,.42])p.push(pt(box(.1,.6,.925),IR,[x,.34,0]),pt(box(.1,.18,.985),IR,[x,.7,0]),...[-1,1].flatMap(sz=>[.14,.52,.7].map(y=>pt(new THREE.SphereGeometry(.02,5,4),0x9aa3ad,[x,y,sz*(y>.6?.495:.465)]))));
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(box(.07,.12,.07),IR,[sx*.66,.12,sz*.43]));
  p.push(pt(box(.16,.2,.03),BR,[0,.6,.47]),pt(box(.12,.12,.05),BR,[0,.46,.48]),pt(new THREE.TorusGeometry(.045,.014,5,10,Math.PI),IR,[0,.52,.49]),...[-1,1].map(sx=>pt(new THREE.TorusGeometry(.11,.024,5,10,Math.PI),0xe8dab4,[sx*.69,.4,0],[0,Math.PI/2,Math.PI])));S('mstash',p,30)}
 /* 횃불: 대나무 느낌 막대 + 감은 천 + 물방울 모양 불꽃 */
 Object.assign(BUILDS.torch,{g:'lk_torch',s:1});S('lk_torch',[pt(cyl(.055,.07,1.5,8),WD2,[0,.75,0]),pt(cyl(.075,.075,.05,8),0x8a5a36,[0,.5,0]),pt(cyl(.075,.075,.05,8),0x8a5a36,[0,1.0,0]),pt(cyl(.13,.09,.3,10),0x4a4038,[0,1.56,0]),pt(cyl(.14,.14,.05,10),DKM,[0,1.7,0]),
  lkShade(pt(new THREE.SphereGeometry(.17,10,8),0xff8a2c,[0,1.86,0],0,[1,1.25,1]),1,1.1),pt(cone(.12,.34,10),0xff8a2c,[0,2.14,0]),pt(new THREE.SphereGeometry(.09,8,6),0xffe07a,[0,1.86,.04],0,[1,1.3,1]),pt(cone(.06,.2,8),0xffe07a,[0,2.02,.04])]);
 {const C=[0xdcc89a,0xcfb987,0xe6d4aa],p=[];for(let r=0;r<4;r++){const n=r%2?3:4;for(let i=0;i<n;i++)p.push(pt(lkRb(.56,.3,.44,.13,.07),C[(i+r)%3],[-1+(i+.5)*(2/n),.16+r*.28,(r%2?.03:-.03)],[0,((i*7+r*3)%5)*.08-.16,0]))}S('sandbag',p)}
 {/* 가시 함정: 받침 각목 둘 + 널 셋에 깎은 말뚝을 밧줄로 묶어 세움(끝은 불에 그을림) */
  const PL=[0xc89258,0xb9824a,0xd4a066],RP=0xd9c9a0,p=[pt(box(.12,.09,1.74),0x8d5f36,[-.62,.045,0]),pt(box(.12,.09,1.74),0x8d5f36,[.62,.045,0])];
  for(let j=0;j<3;j++){const z=-.56+j*.56;p.push(pt(box(1.7,.06,.3),PL[j],[0,.12,z],[0,(hash(j,2,7)-.5)*.05,0]));for(const sx of[-1,1])p.push(pt(cyl(.018,.018,.012,5),0x4a4038,[sx*.62,.153,z+.07]),pt(cyl(.018,.018,.012,5),0x4a4038,[sx*.62,.153,z-.07]))}
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=-.5+i*.5+(hash(i,j,5)-.5)*.08,z=-.56+j*.56+(hash(j,i,6)-.5)*.06,tx=(hash(i,j,3)-.5)*.5,tz=(hash(j,i,4)-.5)*.5,h=.4+hash(i,j,8)*.14,a=[x,.14,z],b=[x+tx*h,.14+h,z+tz*h],c=[x+tx*(h+.2),.14+h+.2,z+tz*(h+.2)],q=lkAim(b,c);
   p.push(lkRod(a,b,.055,(i+j)%2?0xb88350:0xa87442,6),pt(cone(.055,q.L,6),0xe6d2a4,q.pos,q.rot),pt(cone(.03,q.L*.5,6),0x3a322c,lkMix(b,c,.76),q.rot),pt(new THREE.TorusGeometry(.062,.016,4,8),RP,lkMix(a,b,.18),[q.rot[0]+Math.PI/2,q.rot[1],q.rot[2]]))}
  S('spike',p)}
 /* 지뢰: 둥근 판 + 누름쇠 4개 + 빨간 경고등 + 노란 경고 띠 */
 S('mine',[pt(cyl(.38,.42,.12,16),0x4f5d3a,[0,.06,0]),pt(cyl(.4,.4,.04,16),YL,[0,.05,0]),pt(cyl(.3,.32,.07,16),0x5f6f46,[0,.15,0]),...[0,1.57,3.14,4.71].map(a=>pt(cyl(.035,.035,.1,6),ST,[Math.cos(a)*.2,.2,Math.sin(a)*.2])),pt(new THREE.SphereGeometry(.09,10,8),0xff4a3e,[0,.2,0])]);
 /* 손으로 짠 나무 삼발이: 각목 다리 3개(뒤 하나, 앞 둘) + 가로대 + 꼭대기 밧줄 매듭. 탐조등과 포탑이 같이 써요 */
 const WDa=0xb9783e,WDb=0x9c6230,WDc=0xc98a4c,RP=0xe8dab4,MT=0x3b4048,MT2=0x2a2e35,OLV=0x66803f,YB=0xe2ad36,
  tripod=(H,R,w,brs)=>{const p=[],F=[],T=[];[Math.PI,Math.PI/3,-Math.PI/3].forEach((a,i)=>{F[i]=[Math.sin(a)*R,0,Math.cos(a)*R];T[i]=[Math.sin(a)*.06,H,Math.cos(a)*.06];p.push(lkBeam(F[i],T[i],w,w,[WDa,WDb,WDc][i]),pt(box(w*1.7,.05,w*1.7),MT,[F[i][0],.025,F[i][2]]))});
   for(const t of brs)for(let i=0;i<3;i++)p.push(lkBeam(lkMix(F[i],T[i],t),lkMix(F[(i+1)%3],T[(i+1)%3],t),w*.7,w*.4,WDb));
   for(const y of[H-.1,H-.04])p.push(pt(new THREE.TorusGeometry(.085,.028,5,12),RP,[0,y,0],[Math.PI/2,0,0]));p.push(pt(cyl(.15,.15,.05,10),WDb,[0,H+.03,0]),pt(cyl(.05,.05,.07,8),MT,[0,H+.07,0]));return{p,F,T}};
 /* 탐조등: 높은 삼발이 + 발치의 축전지 상자와 전선, 머리는 노란 작업등(검은 테, 보호 살, 뒤쪽 냉각 핀, 손잡이, U자 받침) */
 {const t=tripod(2.16,.62,.08,[.28,.6]),p=t.p,bx=t.F[1][0]+.08,bz=t.F[1][2]+.22;
  p.push(pt(lkRb(.4,.28,.28,.04,.025),MT,[bx,.14,bz]),pt(box(.41,.05,.285),YB,[bx,.2,bz]),pt(cyl(.03,.03,.05,6),0xcf4a3c,[bx-.1,.3,bz]),pt(cyl(.03,.03,.05,6),MT2,[bx+.1,.3,bz]),
   lkRod([bx-.1,.32,bz],lkMix(t.F[1],t.T[1],.3),.016,MT2,5),lkRod(lkMix(t.F[1],t.T[1],.3),[.04,2.2,.06],.016,MT2,5));S('slbase',p)}
 {const YL=0xdfae3a,YL2=0xc4942c,y=.26;S('slhead',[pt(box(.9,.05,.12),MT,[0,-.12,0]),pt(box(.05,.44,.1),MT,[.43,.08,0]),pt(box(.05,.44,.1),MT,[-.43,.08,0]),pt(cyl(.06,.06,.07,8),MT2,[.47,y,0],[0,0,Math.PI/2]),pt(cyl(.06,.06,.07,8),MT2,[-.47,y,0],[0,0,Math.PI/2]),
   lkShade(pt(cyl(.34,.31,.5,16),YL,[0,y,.05],[Math.PI/2,0,0]),.9,1.05),pt(cyl(.38,.38,.08,16),MT2,[0,y,.32],[Math.PI/2,0,0]),pt(cyl(.32,.32,.03,16),0xfff2b0,[0,y,.36],[Math.PI/2,0,0]),pt(box(.66,.022,.022),MT2,[0,y,.385]),pt(box(.022,.66,.022),MT2,[0,y,.385]),
   pt(cyl(.2,.31,.14,14),YL2,[0,y,-.27],[Math.PI/2,0,0]),...[-.37,-.42,-.47].map(z=>pt(cyl(.2,.2,.025,12),MT,[0,y,z],[Math.PI/2,0,0])),pt(box(.035,.035,.3),MT2,[0,y+.42,.02]),pt(box(.035,.1,.035),MT2,[0,y+.37,.16]),pt(box(.035,.1,.035),MT2,[0,y+.37,-.12])])}
 /* 포탑 '보초 허수아비': 나무 삼발이 위에 나무 상자 머리(청록 외눈) + 어깨 가로대(탄통, 붉은 천) + 상자 밑에 매단 소총. 고철과 나무로 손수 만든 느낌.
    머리 중심은 받침 위 y 1.17, 총은 머리 기준 (0,.24,.4), 상태등은 머리 기준 (.14,.66,.02) — 게임 쪽 값 그대로라 상자 뚜껑 위에 불이 얹혀요 */
 {const t=tripod(1.08,.5,.075,[.4]),p=t.p,B=lkMix(t.F[2],t.T[2],.52),bg=[B[0]-.1,B[1],B[2]+.07];
  p.push(pt(lkRb(.24,.28,.13,.05,.03),YB,bg,[0,-.5,0]),pt(lkRb(.25,.11,.14,.04,.02),0xc9952a,[bg[0],bg[1]+.1,bg[2]],[0,-.5,0]),pt(box(.05,.05,.02),MT,[bg[0]-.06,bg[1]+.05,bg[2]+.045],[0,-.5,0]),lkBeam([bg[0]+.02,bg[1]+.14,bg[2]-.02],t.T[2],.03,.012,0x7d5a2c));S('tbase',p)}
 {const p=[pt(box(.08,.36,.08),WDb,[0,.17,-.06]),lkBeam([-.54,.19,-.07],[.54,.24,-.07],.065,.065,WDa),pt(new THREE.TorusGeometry(.07,.024,5,10),RP,[0,.215,-.07],[0,Math.PI/2,0]),
   pt(box(.42,.29,.38),WDc,[0,.485,0]),pt(box(.46,.03,.42),WDb,[0,.645,0]),pt(box(.425,.012,.385),0x8a5a2c,[0,.44,0]),pt(box(.425,.012,.385),0x8a5a2c,[0,.54,0]),...[-1,1].flatMap(sx=>[-1,1].map(sz=>pt(box(.045,.3,.045),WDb,[sx*.2,.485,sz*.18]))),
   pt(box(.3,.22,.02),0x263038,[0,.49,.195]),pt(cyl(.1,.1,.03,14),0x4a525c,[0,.49,.205],[Math.PI/2,0,0]),...[-1,1].flatMap(sx=>[-1,1].map(sy=>pt(new THREE.SphereGeometry(.016,5,4),0x9aa3ad,[sx*.125,.49+sy*.085,.207]))),
   lkRod([-.15,.66,-.12],[-.2,1.14,-.17],.012,MT2,5),pt(new THREE.SphereGeometry(.035,7,5),0xe0483c,[-.2,1.16,-.17]),pt(box(.14,.05,.22),MT,[0,.315,.12]),
   pt(lkRb(.2,.2,.3,.03,.02),OLV,[-.42,.04,-.07]),pt(box(.205,.04,.305),0x55702f,[-.42,.15,-.07]),pt(box(.205,.05,.12),YB,[-.42,.03,-.07]),lkBeam([-.42,.14,-.07],[-.42,.22,-.07],.03,.03,RP),
   ...[0,1,2,3].map(i=>pt(box(.035,.05,.03),0xd6a84a,[-.3+i*.075,.19+Math.sin(i*.9)*.035,.02+i*.06],[0,.6,0])),
   pt(box(.2,.26,.012),0xc8483c,[.45,.07,-.07],[0,0,.1]),pt(box(.2,.05,.014),0xe9ded0,[.447,.02,-.07],[0,0,.1]),pt(new THREE.SphereGeometry(.035,6,5),0xc8483c,[.44,.21,-.07])];S('thead',p)}
 GEO.lk_teye=mg([pt(cyl(.075,.075,.03,14),0x7cf0d8,[0,.49,.218],[Math.PI/2,0,0])]);
 S('tbrl',[pt(box(.1,.13,.36),MT,[0,0,-.12]),pt(box(.085,.09,.26),WDb,[0,-.005,.18]),pt(cyl(.028,.028,.5,8),MT2,[0,.01,.48],[Math.PI/2,0,0]),pt(cyl(.045,.045,.1,8),MT2,[0,.01,.7],[Math.PI/2,0,0]),pt(box(.02,.05,.03),MT2,[0,.06,.6]),
  pt(box(.06,.2,.1),MT,[0,-.14,-.08],[.2,0,0]),pt(box(.07,.1,.22),WDb,[0,-.02,-.4])]);
 /* 수류탄: 둥근 파인애플 수류탄 (던지는 모델과 아이콘 공용) / 고철: 톱니바퀴 + 굽은 철판 + 볼트 */
 S('grenade',[lkShade(pt(new THREE.SphereGeometry(.15,10,8),0x4f6a3a,[0,.02,0],0,[1,1.2,1]),.8,1.1),...[-.06,.06].map(y=>pt(new THREE.TorusGeometry(.148,.014,4,12),0x3d5530,[0,.02+y,0],[Math.PI/2,0,0])),pt(cyl(.06,.07,.08,8),ST,[0,.22,0]),pt(lkRb(.05,.22,.03,.02,.01),ST,[.09,.16,0],[0,0,-.35]),pt(new THREE.TorusGeometry(.055,.012,5,10),YL,[-.1,.26,0])]);
 {const p=[pt(cyl(.26,.26,.09,12),0x8f99a4,[0,.12,0],[.35,0,.1]),pt(cyl(.1,.1,.1,10),0x3a3f4f,[0,.12,0],[.35,0,.1])];for(let a=0;a<8;a++)p.push(pt(box(.1,.09,.1),0x8f99a4,[Math.cos(a*.785)*.29,.12-Math.sin(a*.785)*.1,Math.sin(a*.785)*.27],[.35,-a*.785,.1]));
  p.push(pt(lkRb(.5,.06,.34,.03,.02),0xb5653c,[.2,.06,-.22],[0,.5,.12]),pt(cyl(.045,.045,.42,6),0x6c7580,[-.28,.08,.2],[1.3,.6,0]),pt(cyl(.08,.08,.05,6),0x6c7580,[-.36,.1,.36],[1.3,.6,0]));S('scrap',p)}
 if(GEO.lighthouse)lkSmooth(GEO.lighthouse,40)}

function lkBuildGeo(){const _before=Object.assign({},GEO);
 LK_COT.forEach((c,i)=>{GEO['lk_cotA_'+i]=lkCottage(2.9,3.0,2.15,1.3,c[0],c[1],c[2]);GEO['lk_cotB_'+i]=lkCottage(3.3,4.0,2.35,1.45,c[0],c[1],c[2])});
 Object.assign(DECO.home_A,{g:'lk_cotA_0',s:1});Object.assign(DECO.home_B,{g:'lk_cotB_1',s:1});Object.assign(BUILDS.home,{g:'lk_cotA_3',s:1});
 GEO.mtent=lkTent();GEO.lk_logs=lkLogs();GEO.lk_stones=lkStones();GEO.lk_berry=lkBerry();GEO.can=lkCan();GEO.axe_m=lkAxe();
 ITEMS.wood.ic='lk_logs';ITEMS.stone.ic='lk_stones';ITEMS.berry.ic='lk_berry';
 lkBuildStage1();if(LK_MOOD){lkBuildTown();lkFenceGeo()}lkBuildStage2();if(ITEMS.kit_bench&&GEO.lk_bench)ITEMS.kit_bench.ic='lk_bench';if(LK_MOOD)try{lkBuildStage3()}catch(e){console.error('look: 3단계 모델 실패',e)}try{lkVendGeo()}catch(e){console.error('look: 자판기 모델 실패',e)}
 if(LK_MOOD)for(const k in GEO)if(/^lk_/.test(k)||k==='mtent'||k==='can'||k==='axe_m')lkSmooth(GEO[k],50);
 lkAOnew(_before);
 for(const k in GEO)if(!GEO[k].boundingSphere)GEO[k].computeBoundingSphere()}

/* ---------- 아이콘: 분류별 색 원판 + 크게 삐져나온 물건 + 굵은 외곽선 + 3단 셀 음영 ----------
   분류: build 설치형(산호) / tool 도구(하늘) / food 음식·회복(연두) / gun 무기·탄약(회청) / res 재료(베이지) / rare 고급(보라)
   ICON[아이템 id] 에 들어가요. 설치형 카탈로그(LKB)도 ICON['fence_iron'] 처럼 같은 id로 미리 만들어 둬요. */
const LK_CAT={build:['#f9a08a','#ec735a'],tool:['#b6dbef','#86b9d8'],food:['#b7e6c4','#82cc9c'],gun:['#d3d8e0','#a9b3c0'],res:['#f8ebcd','#e6cf9f'],rare:['#cdb4f0','#a386dc']};
const lkCatOf=id=>{const it=ITEMS[id];if(!it)return'build';const t=it.ty;return t==='kit'?'build':(t==='tool')?'tool':(t==='food'||t==='heal'||t==='fish')?'food':(t==='gun'||t==='throw'||t==='ammo')?'gun':'res'};
const lkRotOf=id=>{const it=ITEMS[id];return it.ty==='gun'?[.3,-1.0,.25]:/^c?f_hammer/.test(id)?[.85,-Math.PI/2+.5,0]:/^c?f_/.test(id)?[.32,-Math.PI/2+.32,0]:id==='rod'?[0,-1.57,-.25]:(it.ty==='tool'||id==='grenade')?[.2,.3,-.6]:[.5,-.7,0]};
let LKR=null;
function lkIconKit(){if(LKR)return LKR;const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(1);r.setSize(128,128);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0xb4bccb,1.0));const d=new THREE.DirectionalLight(0xfff6e6,1.0);d.position.set(2,4,3);sc.add(d);
 const gm=new THREE.DataTexture(new Uint8Array([150,215,255]),3,1,THREE.LuminanceFormat);gm.minFilter=gm.magFilter=THREE.NearestFilter;gm.generateMipmaps=false;gm.needsUpdate=true;
 const m=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshToonMaterial({vertexColors:true,gradientMap:gm,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1})),
  e=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x3b2a1f,transparent:true,opacity:.45})),piv=new THREE.Group();piv.add(m,e);sc.add(piv);
 const cv=document.createElement('canvas');cv.width=cv.height=128;return LKR={r,sc,m,e,piv,cv,cx:cv.getContext('2d'),c:new THREE.OrthographicCamera(-1,1,1,-1,.1,60)}}
/* 1) 한 번 그려서 실루엣 크기를 재고 2) 원판 안에 꼭 들어가게 카메라를 맞춰 다시 그려요 */
function lkIconFrom(g,rot,cat){const L=lkIconKit(),N=128,DR=N*.44,v=new THREE.Vector3(),bx=new THREE.Box3();L.m.geometry=g;g.computeBoundingBox();g.boundingBox.getCenter(v);L.m.position.copy(v).multiplyScalar(-1);L.e.position.copy(L.m.position);
 L.piv.rotation.set(rot[0],rot[1],rot[2]);L.piv.updateMatrixWorld(true);bx.setFromObject(L.m);bx.getSize(v);let rr=Math.max(v.x,v.y)*.5;bx.getCenter(v);let px=v.x,py=v.y;
 const shot=()=>{Object.assign(L.c,{left:-rr,right:rr,top:rr,bottom:-rr});L.c.position.set(px,py,20);L.c.updateProjectionMatrix();L.r.render(L.sc,L.c)};
 L.e.visible=false;shot();L.cx.clearRect(0,0,N,N);L.cx.drawImage(L.r.domElement,0,0);const a=L.cx.getImageData(0,0,N,N).data;let x0=N,x1=0,y0=N,y1=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(a[(y*N+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1>=x0){const mx=(x0+x1)/2,my=(y0+y1)/2;let mr=1;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(a[(y*N+x)*4+3]>24){const d=Math.hypot(x-mx,y-my);if(d>mr)mr=d}
  const wp=2*rr/N;px+=(mx-N/2)*wp;py-=(my-N/2)*wp;rr*=mr/(DR-6)}
 const eg=new THREE.EdgesGeometry(g,40);L.e.geometry=eg;L.e.visible=true;shot();eg.dispose();
 const c=document.createElement('canvas');c.width=c.height=N;const k=c.getContext('2d');
 if(LK_ICON_DISC){const cc=LK_CAT[cat]||LK_CAT.res,gr=k.createRadialGradient(N*.42,N*.38,4,N/2,N/2,DR);gr.addColorStop(0,cc[0]);gr.addColorStop(1,cc[1]);k.fillStyle=gr;k.beginPath();k.arc(N/2,N/2,DR,0,Math.PI*2);k.fill()}
 const sl=document.createElement('canvas');sl.width=sl.height=N;const sq=sl.getContext('2d');sq.drawImage(L.r.domElement,0,0);sq.globalCompositeOperation='source-in';sq.fillStyle='#3b2a1f';sq.fillRect(0,0,N,N);
 for(let i=0;i<16;i++)k.drawImage(sl,Math.cos(i*.3927)*3,Math.sin(i*.3927)*3);k.drawImage(L.r.domElement,0,0);return c.toDataURL()}
function lkIcons(){try{for(const id in ITEMS){const g=GEO[ITEMS[id].ic];if(g)try{ICON[id]=lkIconFrom(g,lkRotOf(id),lkCatOf(id))}catch(e){}}
  if(GEO.coin_stack_small)ICON.coin=lkIconFrom(GEO.coin_stack_small,[.6,-.6,0],'res');
  for(const id in LKB){const b=LKB[id];if(GEO[b.g])ICON[id]=lkIconFrom(GEO[b.g],b.ir||[.42,-.62,0],b.cat||'build')}
  if(GEO.tbase&&GEO.thead&&GEO.tbrl){/* 아이콘은 다리를 줄이고 머리를 키워 한눈에 알아보게 */const K=1.45,g=mg([pt(GEO.tbase,null,0,0,[1.05,.5,1.05]),pt(GEO.thead,null,[0,.585,0],[0,.5,0],[K,K,K]),pt(GEO.tbrl,null,[.19*K,.585+.24*K,.35*K],[0,.5,0],[K,K,K])]);ICON.turret=lkIconFrom(g,[.3,-.5,0],'build');g.dispose()}
  if(GEO.slbase&&GEO.slhead){const K=1.5,g=mg([pt(GEO.slbase,null,0,0,[1.1,.42,1.1]),pt(GEO.slhead,null,[0,2.3*.42,0],[-.2,.6,0],[K,K,K])]);ICON.slight=lkIconFrom(g,[.3,-.5,0],'build');g.dispose()}
  for(const id in BUILDS)if(!ICON[id]&&GEO[BUILDS[id].g])ICON[id]=lkIconFrom(GEO[BUILDS[id].g],[.42,-.62,0],'build')}
 finally{if(LKR){LKR.r.dispose();LKR.r.forceContextLoss();LKR=null}}
 try{if(S&&S.quick&&typeof drawQuick==='function')drawQuick();hudDirty=true}catch(e){}}

/* ---------- 괴물 겉모습 (바위 골렘·악령) ----------
   actors.js 의 buildCreatures 가 만든 CRG.rg / CRG.wr 의 조각만 바꿔 낀다. 조각 이름(body·head·arm·leg)과 회전축 자리, 눈 자리는 그대로라
   움직임 코드는 손댈 것이 없다. 바위 골렘 = 일어선 옛 돌담(돌울타리와 같은 돌 + 이끼 + 박힌 창), 악령 = 해진 망토에 뼈 가면, 끊어진 쇠고랑. */
function lkLoft(rings){const v=[],n=rings[0].length;for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const k=(j+1)%n,a=rings[i][j],b=rings[i+1][j],c=rings[i][k],d=rings[i+1][k];v.push(...a,...b,...c,...c,...b,...d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(v),3));return g}
const lkRing=(n,y,rx,rz,f)=>{const r=[];for(let j=0;j<n;j++){const a=j/n*Math.PI*2,o=f?f(j,a):[0,0];r.push([Math.cos(a)*(rx+o[0]),y+o[1],Math.sin(a)*(rz+o[0])])}return r};
function lkCreatures(){if(typeof CRG==='undefined'||!CRG.rg||!CRG.wr)return;const fin=(p,d,ao,ng)=>{const g=mg(p);lkSmooth(g,d);if(ao)lkAO(g,ao,ng);g.computeBoundingSphere();return g};
 {const SB=LKSB,DK=0x6f625c,MO=[0x6f9a52,0x5f8a4a,0x7fae5c],CRY=0x8fe9ff,IR=0x4a4f5a,
   st=(w,h,d,x,y,z,k,rx=0,ry=0,rz=0)=>pt(lkRb(w,h,d,.05,.035),SB[k%5],[x,y,z],[rx,ry,rz]),moss=(x,y,z,r,sx,sz,k)=>pt(ico(r,1),MO[k%3],[x,y,z],[0,k,0],[sx,.32,sz]),
   crack=(x,y,z,w,h,rz)=>pt(box(w,h,.012),DK,[x,y,z],[0,0,rz]);
  const b=[st(1.25,.46,.98,0,1.13,0,3,0,.06),st(.82,.5,1.16,-.45,1.6,.02,0,0,.05,.03),st(.86,.5,1.2,.44,1.6,0,2,0,-.04,-.02),
   st(.74,.56,1.3,-.72,2.13,0,4,0,.04),st(.7,.56,1.34,0,2.13,-.03,1,0,-.03),st(.74,.56,1.3,.72,2.13,0,3,0,.05,.02),
   st(1.0,.44,1.22,-.62,2.63,-.02,2,0,-.05,.04),st(1.14,.44,1.24,.5,2.63,0,0,0,.04,-.03),
   st(.74,.5,.86,-1.12,2.62,.02,1,.08,.2,.16),st(.7,.46,.84,1.12,2.64,0,4,-.06,-.15,-.14),
   /* 가슴 쐐기돌: 쇠테 두른 구멍 안에 수정 눈 */
   st(.62,.72,.34,0,1.95,.79,2),pt(box(.3,.4,.03),0x2c2a30,[0,1.95,.955]),...[[0,.24,.36,.05],[0,-.24,.36,.05],[.19,0,.05,.5],[-.19,0,.05,.5]].map(q=>pt(box(q[2],q[3],.045),IR,[q[0],1.95+q[1],.955])),...[[.19,.24],[-.19,.24],[.19,-.24],[-.19,-.24]].map(q=>pt(cyl(.025,.025,.03,6),0x8f99a4,[q[0],1.95+q[1],.98],[Math.PI/2,0,0])),
   crack(-.5,1.62,.6,.02,.3,.4),crack(-.44,1.44,.6,.02,.16,-.5),crack(.62,2.2,.66,.02,.34,-.3),crack(.7,2.0,.66,.02,.14,.6),crack(-.2,2.66,.615,.02,.26,.2),
   moss(-.62,2.87,-.05,.42,1.25,1.2,0),moss(.52,2.87,.1,.36,1.4,1.1,1),moss(-1.14,2.9,0,.34,1.1,1.1,2),moss(1.1,2.89,-.1,.3,1.1,1.2,0),moss(-.5,1.86,.6,.2,1.3,.5,1),moss(.4,1.36,.52,.2,1.2,.5,2),moss(0,1.36,-.5,.3,1.5,.5,0),
   /* 풀 포기·어린 나무·작은 꽃 */
   ...[[-.8,2.98,.3],[-.4,2.98,-.3],[.7,2.97,.25]].flatMap((q,i)=>[0,1,2].map(k=>pt(cone(.035,.24,4),MO[(i+k)%3],[q[0]+(k-1)*.07,q[1]+.1,q[2]+(k%2)*.06],[(k-1)*.3,0,(1-k)*.35]))),
   pt(cyl(.025,.04,.5,5),0x8d5f36,[-1.2,3.2,-.15],[0,0,.12]),pt(ico(.2,1),0x5f9a52,[-1.23,3.5,-.15],0,[1,.9,1]),pt(ico(.14,1),0x7fae5c,[-1.1,3.42,-.05]),
   pt(ico(.045),0xf4f1e6,[.3,3.0,.35]),pt(ico(.045),0xf2d35a,[.42,3.0,.2]),pt(ico(.045),0xf4f1e6,[.2,3.0,.15]),
   /* 등에 박힌 옛 창과 감긴 밧줄 */
   lkRod([.32,2.5,-.5],[.86,3.72,-1.02],.035,0xa9753f,6),pt(cone(.07,.26,4),0x8f99a4,lkMix([.32,2.5,-.5],[.86,3.72,-1.02],1.08),lkAim([.32,2.5,-.5],[.86,3.72,-1.02]).rot),pt(box(.2,.16,.012),0xb5483c,[.8,3.42,-.96],[0,.5,.3]),
   pt(new THREE.TorusGeometry(.66,.035,5,14),0xd9c9a0,[0,1.38,0],[Math.PI/2,0,0],[1.02,.92,1]),
   pt(cone(.15,.62,5),CRY,[1.22,3.1,-.1],[0,0,-.35]),pt(cone(.1,.42,5),CRY,[.98,3.04,.2],[.3,0,-.1]),pt(cone(.08,.3,5),CRY,[1.4,2.95,.15],[.2,0,-.7])];
  const h=[st(.92,.52,.84,0,.26,.06,2,0,.03),st(1.0,.17,.5,0,.5,.3,1,.16,0,0),st(.6,.2,.34,0,.02,.3,4),pt(box(.62,.2,.03),0x2c2a30,[0,.27,.485]),crack(.3,.2,.485,.02,.2,.5),moss(-.1,.62,-.1,.34,1.3,1.1,1),moss(.3,.6,.1,.2,1.2,1,0),...[0,1,2].map(k=>pt(cone(.03,.2,4),MO[k],[-.25+k*.06,.74,-.05],[(k-1)*.3,0,(1-k)*.3]))];
  const a=[st(.56,.6,.58,0,-.36,0,3,0,.1,.05),st(.42,.36,.44,0,-.82,.02,1,0,-.2),st(.6,.52,.62,0,-1.22,.05,4,0,.1,-.04),st(.82,.7,.9,0,-1.78,.1,0,0,.05,.03),
   ...[-1,0,1].map(k=>st(.24,.2,.24,k*.27,-2.02,.5,2+k,0,0,0)),pt(lkRb(.66,.1,.68,.05,.03),IR,[0,-1.0,.04]),pt(cyl(.03,.03,.04,6),0x8f99a4,[.2,-1.0,.385],[Math.PI/2,0,0]),pt(cyl(.03,.03,.04,6),0x8f99a4,[-.2,-1.0,.385],[Math.PI/2,0,0]),moss(.1,-.05,0,.3,1.1,1.1,0),moss(-.1,-1.44,.05,.3,1.2,1.3,2),crack(.12,-1.8,.555,.02,.3,.3)];
  const l=[st(.6,.5,.62,0,-.24,0,1,0,.08),st(.5,.2,.5,0,-.52,.02,3),st(.76,.34,1.04,0,-.75,.12,0,0,-.04),st(.3,.16,.26,-.2,-.84,.66,2),st(.3,.16,.26,.2,-.84,.66,4),moss(.1,-.56,.3,.22,1.2,1.2,1)];
  CRG.rg={body:fin(b,40,.6),head:fin(h,40,.55,1),arm:fin(a,40,.55,1),leg:fin(l,40,.5,1)}}
 {if(typeof GHOST!=='undefined'){GHOST.emissive.set(0x0b1232);GHOST.opacity=.93}/* 푸른 빛이 너무 세면 망토 주름·가면이 다 묻힌다 */const CL=0x4b4a8e,CL2=0x2e2a58,CL3=0x6a68b0,PALE=0xdde6ee,BONE=0xc9d3dc,IR=0x5a6070,N=14,
   zig=(amp,r)=>(j)=>[j%2?r:-r*.4,(j%2?0:amp)+hash(j,3,41)*amp*.5];
  const cloak=pt(lkLoft([lkRing(N,.1,.8,.74,zig(.34,.07)),lkRing(N,.72,.66,.6),lkRing(N,1.3,.5,.44),lkRing(N,1.72,.52,.4),lkRing(N,2.02,.3,.27),lkRing(N,2.2,.16,.16)]),CL);lkShade(cloak,.62,1.08);
  const cape=pt(lkLoft([lkRing(N,1.5,.72,.56,zig(.2,.05)),lkRing(N,1.86,.6,.46),lkRing(N,2.08,.36,.31),lkRing(N,2.22,.2,.2)]),CL2);
  const b=[cloak,cape,pt(new THREE.TorusGeometry(.5,.03,5,14),0xb9aa84,[0,1.3,0],[Math.PI/2,0,0],[1,.9,1]),pt(box(.03,.4,.03),0xb9aa84,[.2,1.1,.45],[.12,0,.1]),pt(ico(.045),0xb9aa84,[.21,.9,.47]),
   /* 허리에 찬 녹슨 열쇠 꾸러미와 찢어진 띠 */
   pt(new THREE.TorusGeometry(.07,.012,4,8),IR,[-.24,1.16,.44],[0,.5,0]),pt(box(.02,.16,.012),IR,[-.26,1.03,.45],[0,0,.2]),pt(box(.02,.13,.012),IR,[-.21,1.04,.46],[0,0,-.25]),
   ...[0,1,2,3,4].map(k=>{const a=k*1.3+.4;return pt(box(.1,.5+hash(k,1,42)*.3,.012),k%2?CL3:CL2,[Math.cos(a)*.7,.34,Math.sin(a)*.66],[Math.sin(a)*.2,-a+Math.PI/2,(hash(k,2,42)-.5)*.4])}),
   pt(box(.16,.2,.012),CL3,[-.3,1.62,.3],[.3,-.3,.2]),pt(box(.012,.02,.2),PALE,[-.3,1.62,.3],[.3,-.3,.2],[1,1,.1])];
  const fo=k=>(j,a)=>[Math.sin(a)>.3?-k*Math.sin(a):0,0],hood=pt(lkLoft([lkRing(12,-.36,.3,.28,fo(.05)),lkRing(12,-.12,.47,.44,fo(.15)),lkRing(12,.2,.45,.46,fo(.15)),lkRing(12,.44,.26,.3),lkRing(12,.56,.04,.06)]),CL2,[0,0,-.04]);
  const h=[hood,pt(new THREE.TorusGeometry(.3,.075,6,14),CL,[0,-.02,.22],0,[1,1.18,1]),pt(cone(.16,.5,5),CL2,[0,.5,-.3],[-1.0,0,0]),
   pt(ico(.27,1),PALE,[0,-.05,.2],0,[.92,1.14,.62]),pt(cyl(.085,.085,.03,8),0x16122a,[.1,-.02,.375],[Math.PI/2,0,0]),pt(cyl(.085,.085,.03,8),0x16122a,[-.1,-.02,.375],[Math.PI/2,0,0]),pt(box(.02,.07,.02),0x16122a,[0,-.13,.37]),
   ...[-2,-1,0,1,2].map(k=>pt(box(.012,.07,.012),0x16122a,[k*.04,-.24,.335])),pt(box(.2,.012,.012),0x16122a,[0,-.21,.34]),pt(box(.012,.14,.012),0x8a94a0,[.13,.14,.35],[0,0,.5]),pt(box(.012,.08,.012),0x8a94a0,[.17,.08,.34],[0,0,-.4])];
  const sl=pt(lkLoft([lkRing(8,-.86,.24,.22,zig(.18,.03)),lkRing(8,-.5,.2,.19),lkRing(8,0,.16,.16),lkRing(8,.1,.05,.05)]),CL);
  const a=[sl,pt(box(.1,.14,.05),BONE,[0,-.93,0]),...[-1,0,1].map(k=>pt(cone(.018,.2,4),BONE,[k*.035,-1.08,.01],[Math.PI,0,-k*.2])),pt(cone(.018,.14,4),BONE,[.07,-.96,.03],[Math.PI,0,-.9]),
   pt(new THREE.TorusGeometry(.07,.022,5,10),IR,[0,-.86,0],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.04,.012,4,8),IR,[.08,-.93,0],[0,0,.3]),pt(new THREE.TorusGeometry(.04,.012,4,8),IR,[.1,-1.0,0],[0,Math.PI/2,.2]),pt(new THREE.TorusGeometry(.04,.012,4,8),IR,[.1,-1.07,0],[0,0,-.2])];
  CRG.wr={body:fin(b,58),head:fin(h,58),arm:fin(a,58)}}}
if(LK_MOOD&&typeof buildCreatures==='function'){const _bc=buildCreatures;buildCreatures=function(){_bc();try{lkCreatures()}catch(e){console.error('look: 괴물 모델 실패',e)}}}

/* ---------- 분위기 (LK_MOOD) ---------- */
/* 매끈한 음영: 같은 자리의 꼭짓점끼리 노멀을 평균 (각도 deg 이상 꺾인 모서리는 그대로 또렷하게) */
function lkSmooth(g,deg){const P=g.attributes.position,n=P.count;if(!n||n%3)return;const fn=new Float32Array(n*3),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<n;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1).sub(a);c.fromBufferAttribute(P,i+2).sub(a);b.cross(c);b.divideScalar(b.length()||1);for(let k=0;k<3;k++){fn[(i+k)*3]=b.x;fn[(i+k)*3+1]=b.y;fn[(i+k)*3+2]=b.z}}
 const map=new Map(),Q=1e4;for(let i=0;i<n;i++){const k=Math.round(P.getX(i)*Q)+','+Math.round(P.getY(i)*Q)+','+Math.round(P.getZ(i)*Q);let L=map.get(k);if(!L)map.set(k,L=[]);L.push(i)}
 const cs=Math.cos(deg*Math.PI/180),out=new Float32Array(n*3);
 map.forEach(L=>{for(const i of L){let x=0,y=0,z=0;for(const j of L)if(fn[i*3]*fn[j*3]+fn[i*3+1]*fn[j*3+1]+fn[i*3+2]*fn[j*3+2]>=cs){x+=fn[j*3];y+=fn[j*3+1];z+=fn[j*3+2]}const l=Math.hypot(x,y,z)||1;out[i*3]=x/l;out[i*3+1]=y/l;out[i*3+2]=z/l}});
 g.setAttribute('normal',new THREE.BufferAttribute(out,3))}
/* 구운 음영(AO): 모델을 격자로 나눠 '면이 있는 칸'을 표시하고, 꼭짓점마다 바깥쪽 반구의 칸이 얼마나 막혔는지 세어 색을 어둡게 해요.
   틈·맞닿은 곳·땅에 닿는 밑동이 자연스럽게 어두워져서 덩어리가 '도형'이 아니라 물건처럼 보여요. 로딩 때 한 번만 계산 */
const LK_AOD=[[0,1,0],[.89,.45,0],[.28,.45,.85],[-.72,.45,.53],[-.72,.45,-.53],[.28,.45,-.85],[.53,.85,0],[-.53,.85,0],[.6,0,.8],[-.6,0,.8],[.6,0,-.8],[-.6,0,-.8],[1,0,0],[-1,0,0]];
function lkAO(g,str,ng){const P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color;if(!P||!N||!C||g.lkAO||g.index)return;g.lkAO=1;str=str||.62;g.computeBoundingBox();
 const b=g.boundingBox,cell=Math.max(.03,Math.max(b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z)/34),ox=b.min.x-cell*2,oy=b.min.y-cell*2,oz=b.min.z-cell*2,nx=Math.ceil((b.max.x-ox)/cell)+3,ny=Math.ceil((b.max.y-oy)/cell)+3,nz=Math.ceil((b.max.z-oz)/cell)+3;
 if(nx*ny*nz>4e6)return;const occ=new Uint8Array(nx*ny*nz),n=P.count,p=P.array,mark=(x,y,z)=>{occ[((x-ox)/cell|0)+nx*(((y-oy)/cell|0)+ny*((z-oz)/cell|0))]=1};
 for(let i=0;i<n;i+=3){const a=i*3,ax=p[a],ay=p[a+1],az=p[a+2],ux=p[a+3]-ax,uy=p[a+4]-ay,uz=p[a+5]-az,vx=p[a+6]-ax,vy=p[a+7]-ay,vz=p[a+8]-az,m=Math.min(40,Math.ceil(Math.max(Math.hypot(ux,uy,uz),Math.hypot(vx,vy,vz))/cell*1.5)+1);
  for(let u=0;u<=m;u++)for(let v=0;v<=m-u;v++)mark(ax+(ux*u+vx*v)/m,ay+(uy*u+vy*v)/m,az+(uz*u+vz*v)/m)}
 const nr=N.array,c=C.array,grd=!ng&&b.min.y<.2;
 for(let i=0;i<n;i++){const X=p[i*3],Y=p[i*3+1],Z=p[i*3+2],nX=nr[i*3],nY=nr[i*3+1],nZ=nr[i*3+2],bx=X+nX*cell*1.6,by=Y+nY*cell*1.6,bz=Z+nZ*cell*1.6;let hit=0,tot=0;
  for(const d of LK_AOD){let dx=d[0],dy=d[1],dz=d[2];const dn=dx*nX+dy*nY+dz*nZ;if(dn<.2){if(dn>-.2)continue;dx=-dx;dy=-dy;dz=-dz}
   for(const r of[1.5,4,8]){const x=bx+dx*cell*r,y=by+dy*cell*r,z=bz+dz*cell*r,w=r<2?1:r<5?.8:.6;tot+=w;if(grd&&y<0){hit+=w*.9;continue}
    const ix=(x-ox)/cell|0,iy=(y-oy)/cell|0,iz=(z-oz)/cell|0;if(ix>=0&&iy>=0&&iz>=0&&ix<nx&&iy<ny&&iz<nz&&occ[ix+nx*(iy+ny*iz)])hit+=w}}
  const k=1-str*Math.min(1,tot?hit/tot*2.2:0);c[i*3]*=k;c[i*3+1]*=k*(1-.04*(1-k));c[i*3+2]*=k+(1-k)*.12}
 C.needsUpdate=true}
const LK_NOAO=/glow|teye|_fire$|_led$|_charge$|_flame/;
function lkAOnew(before){if(!LK_MOOD)return;for(const k in GEO)if(GEO[k]!==before[k]&&!LK_NOAO.test(k))try{lkAO(GEO[k])}catch(e){}}
/* 땅: 진하고 선명한 잔디 + 짧은 연두색 붓자국, 얼룩무늬는 약하게, 모래·흙은 따뜻한 노란빛 */
if(LK_MOOD){const _ob=TERR.onBeforeCompile;TERR.onBeforeCompile=sh=>{_ob(sh);sh.fragmentShader=sh.fragmentShader.replace('diffuseColor.rgb*=.83+.3*pa;','diffuseColor.rgb*=.94+.09*pa;').replace('1.-.085*smoothstep(.66,.72,n3)+.06*smoothstep(.3,.24,n3)','1.-.03*smoothstep(.66,.72,n3)+.02*smoothstep(.3,.24,n3)').replace('#include <alphamap_fragment>',`{vec3 c=diffuseColor.rgb;float land=smoothstep(.15,.6,vWP.y),gr=smoothstep(-.01,.13,c.g-max(c.r,c.b))*land;
 c=mix(c,c*vec3(.38,.74,.92),gr);c=mix(c,c*vec3(1.14,1.03,.66),(1.-gr)*smoothstep(.03,.2,c.r-c.b)*smoothstep(-.4,.2,vWP.y)*.85);
 vec2 q=vWP.xz*1.7,ci=floor(q),f=fract(q),o=vec2(th(ci+3.7),th(ci+11.1))*.5+.25;float an=-.5+(th(ci+5.3)-.5)*.5;vec2 p=f-o;p=vec2(p.x*cos(an)-p.y*sin(an),p.x*sin(an)+p.y*cos(an));
 float ds=(1.-smoothstep(.1,.15,abs(p.x)))*(1.-smoothstep(.022,.045,abs(p.y)))*step(.42,th(ci+23.9));c=mix(c,vec3(.6,.8,.36),ds*gr*.62);diffuseColor.rgb=c;}
 #include <alphamap_fragment>`)}}
/* ---------- 자연: 롱빈터풍 나무·바위·덤불 (LK_MOOD) ----------
   기존 GEO 키를 그대로 덮어써서 배치·충돌·채집은 하나도 안 바뀌어요. 크기도 예전 모델과 비슷하게 맞췄어요(높이 약 1.1, 월드에서 ×3.4~5.2). */
function lkShade(g,lo,hi){g.computeBoundingBox();const b=g.boundingBox,P=g.attributes.position,c=g.attributes.color.array,h=(b.max.y-b.min.y)||1;for(let i=0;i<P.count;i++){const k=lo+(hi-lo)*(P.getY(i)-b.min.y)/h;c[i*3]*=k;c[i*3+1]*=k;c[i*3+2]*=k}return g}
/* 우산처럼 처진 침엽수 층: 꼭대기 → 볼록한 중간 고리 → 들쭉날쭉한 치맛단 */
function lkTier(r,h,n){const v=[],A=[0,h,0],m=[],e=[];for(let i=0;i<n;i++){const a=i/n*6.283;m.push([Math.cos(a)*r*.6,h*.5,Math.sin(a)*r*.6])}
 for(let j=0;j<2*n;j++){const a=j/(2*n)*6.283,rr=j%2?r:r*.8;e.push([Math.cos(a)*rr,j%2?0:h*.1,Math.sin(a)*rr])}
 const tri=(p,q,s)=>{const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],wx=s[0]-p[0],wy=s[1]-p[1],wz=s[2]-p[2],nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,cx=(p[0]+q[0]+s[0])/3,cy=(p[1]+q[1]+s[1])/3+h,cz=(p[2]+q[2]+s[2])/3;if(nx*cx+ny*cy+nz*cz<0)v.push(...p,...s,...q);else v.push(...p,...q,...s)};
 for(let i=0;i<n;i++){const i1=(i+1)%n;tri(A,m[i],m[i1]);tri(m[i],e[2*i],e[2*i+1]);tri(m[i],e[2*i+1],m[i1]);tri(m[i1],e[2*i+1],e[(2*i+2)%(2*n)])}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));return g}
function lkPatch(r,c,n=9,sd=1){r*=.62;n=13;const g=new THREE.CircleGeometry(r,n);g.rotateX(-Math.PI/2);const P=g.attributes.position;for(let i=1;i<P.count;i++){const k=.88+.24*hash(i,sd,61);P.setX(i,P.getX(i)*k);P.setZ(i,P.getZ(i)*k)}return pt(g,c,[0,.028,0])}
function lkBoulder(r,c,s,pos,sy=.72){const g=new THREE.IcosahedronGeometry(r,r<.13?0:1),P=g.attributes.position;for(let i=0;i<P.count;i++){let x=P.getX(i)/r,y=P.getY(i)/r,z=P.getZ(i)/r;const f=1+.17*Math.sin(x*3.1+s)+.13*Math.sin(y*4.3+s*2.1)+.12*Math.sin(z*3.7+s*3.3);y=Math.max(y*f*sy,-.3);P.setXYZ(i,x*f*r,(y+.3)*r,z*f*r)}
 return lkShade(pt(g,c,pos,[0,s,0]),.8,1.08)}
function lkCypress(h,r,c,pos){const pts=[],n=7;for(let i=0;i<=n;i++){const t=i/n,env=Math.pow(Math.sin(Math.PI*Math.pow(t,.62)),.8)*r;pts.push(new THREE.Vector2(Math.max(.004,env*(i%2?1:.74)),.04+t*h))}
 return lkShade(pt(new THREE.LatheGeometry(pts,6),c,pos),.78,1.1)}
const lkBlob=(r,c,pos,sy=.82)=>lkShade(pt(new THREE.SphereGeometry(r,7,4),c,pos,[0,pos[0]*9,0],[1,sy,1]),.76,1.1);
function lkPine(o){const TR=0xa85c34,p=[lkPatch(o.pr,0x7d5140,9,o.sd),lkShade(pt(cyl(o.tr*.6,o.tr,o.th,6),TR,[.012,o.th/2-.08,0],[0,0,-.04]),.8,1.05)];
 o.tiers.forEach(([y,r,h],i)=>p.push(lkShade(pt(lkTier(r,h,o.n||6),i%2?0x2f8a5a:0x35945f,[.02+(i%2?.012:-.008),y,0],[0,i*.7,0]),.7,1.12)));return p}
function lkLeafTree(TR,PC,cols,band){const h=.56,p=[lkPatch(.34,PC,9,7),lkShade(pt(cyl(.04,.062,h+.14,6),TR,[.01,h/2-.07,0],[0,0,-.05]),.85,1.05)];
 if(band)for(const y of[.14,.3,.46])p.push(pt(new THREE.CylinderGeometry(.056,.06,.022,5,1,true),0x3a3a36,[.01,y,0],[0,y*9,0],[1,1,.7]));
 [[0,h+.36,0,.3],[.22,h+.2,.08,.23],[-.2,h+.24,-.1,.22],[.02,h+.14,.2,.19]].forEach((b,i)=>p.push(lkBlob(b[3],cols[i%cols.length],[b[0],b[1],b[2]])));return p}
function lkDT(k,g){lkSmooth(g,60);DT[k]={p:g.attributes.position.array,c:g.attributes.color.array,n:g.attributes.normal.array,cnt:g.attributes.position.count}}
function lkNature(){const S=(k,p,deg=55)=>{const g=mg(p);lkSmooth(g,deg);g.computeBoundingSphere();GEO[k]=g};
 S('tree_single_A',lkPine({sd:1,pr:.3,tr:.05,th:.62,tiers:[[.34,.3,.3],[.56,.24,.28],[.78,.17,.3]]}));
 S('tree_single_B',lkPine({sd:2,pr:.36,tr:.06,th:.7,n:7,tiers:[[.3,.36,.3],[.5,.3,.28],[.7,.23,.26],[.88,.15,.24]]}));
 {const G=[0x5f9f45,0x55933e,0x6bab4c],p=[lkPatch(.9,0x7d5140,11,3)];[[-.3,-.12,.98,.2],[.22,-.26,.8,.17],[.08,.3,.66,.15],[-.38,.34,.5,.12]].forEach(([x,z,h,r],i)=>p.push(lkCypress(h,r,G[i%3],[x,0,z])));
  p.push(lkBlob(.15,0x3f9a55,[.46,.1,.14]),lkBlob(.11,0x4aa85e,[-.02,.07,-.46]),lkBoulder(.1,0x8f8f97,2,[.36,0,.42]));S('trees_A_small',p)}
 /* 잎나무는 회색 잎 + 인스턴스 색(참나무·단풍·황금)이라, 줄기와 흙은 그 색으로 미리 나눠 둔 값을 써요 */
 for(const[k,tc]of[['t_leaf',[2.4,.25,.7]],['t_fall',[.25,.2,.9]]]){const g=mg(lkLeafTree(0xff00ff,0x00ffff,[0xffffff,0xe2e2e2,0xcccccc,0xf0f0f0])),c=g.attributes.color.array;
  for(let i=0;i<c.length;i+=3){const mk=c[i+2]>.6&&Math.abs(c[i]-c[i+1])>.5*c[i+2];if(mk&&c[i]>c[i+1]){const q=c[i+2];c[i]=tc[0]*q;c[i+1]=tc[1]*q;c[i+2]=tc[2]*q}else if(mk){const q=c[i+2]*.7;c[i]=tc[0]*q;c[i+1]=tc[1]*q;c[i+2]=tc[2]*q}}lkSmooth(g,55);GEO[k]=g}
 S('t_birch',lkLeafTree(0xf0ece0,0x7d5140,[0xb9d43a,0xa6c730,0xc6dd4a,0xafce36],1));if(GEO.t_dead)lkSmooth(GEO.t_dead,60);
 S('rock_single_E',[lkBoulder(.17,0x8e8e96,1,[-.03,0,0],.62),lkBoulder(.085,0x9a9aa2,4,[.19,0,.07])],70);
 S('rockB',[lkBoulder(.2,0x8e8e96,2,[0,0,0],.9),lkBoulder(.14,0x83838c,5,[.26,0,.14]),lkBoulder(.09,0x9a9aa2,8,[-.2,0,.2])],70);
 S('bush',[lkBlob(.62,0x3a9552,[-.32,.42,0]),lkBlob(.6,0x44a25c,[.34,.42,.1]),lkBlob(.66,0x3f9a55,[0,.66,-.1])]);
 lkDT('shrub',mg([lkBlob(.34,0x3f9a55,[0,.22,0],.78),lkBlob(.25,0x4aa85e,[.3,.17,.1],.78),lkBlob(.2,0x55b266,[-.2,.26,-.08],.8)]));
 for(let i=0;i<4;i++)lkDT('rk'+i,mg([lkBoulder(.5+i*.1,[0x8e8e96,0x83838c,0x9a9aa2,0x8a8a93][i],i*2+1,[0,0,0],.6+i*.08),lkBoulder(.24,0x9a9aa2,i+11,[.55+i*.08,0,.2])]));
 lkDT('rockS',mg([lkBoulder(.26,0x8e8e96,3,[0,0,0]),lkBoulder(.16,0x83838c,6,[.32,0,.12]),lkBoulder(.11,0x9a9aa2,9,[-.2,0,.26])]))}

/* 빛: 낮에는 햇빛을 따뜻한 크림색, 그늘(하늘빛)을 보랏빛 남색으로. 밤과 텐트 안은 그대로 */
const LKC1=new THREE.Color(),LKC2=new THREE.Color();
function lkMood(){if(!LK_MOOD||(typeof INT!=='undefined'&&INT.on))return;const nt=dark(),day=1-nt;
 if(day>0){hemi.color.lerp(LKC1.setRGB(.6,.62,1.0),.8*day);hemi.groundColor.lerp(LKC2.setRGB(.52,.42,.76),.8*day);sun.color.lerp(LKC1.setRGB(1.0,.87,.68),.7*day);sun.intensity*=1+.14*day;scene.fog.near*=1+.35*day;scene.fog.far*=1+.3*day}
 /* 밤: 깜깜한 대신 보랏빛 남색으로 은은하게 보이게 */
 if(nt>0){hemi.color.lerp(LKC1.setRGB(.6,.52,1.0),.75*nt);hemi.groundColor.lerp(LKC2.setRGB(.36,.28,.66),.75*nt);hemi.intensity*=1+.7*nt;sun.color.lerp(LKC1.setRGB(.66,.62,1.0),.6*nt);
  if(!WX.b){scene.background.lerp(LKC1.setRGB(.035,.03,.12),.6*nt);scene.fog.color.copy(scene.background)}}}

/* ---------- 다듬기(기획자 요청: 도형 티 나는 것들) ----------
   모닥불: 둥근 돌 고리 + 숯 바닥 + 기대 세운 장작(티피) / 불꽃: 물방울 모양 혀 여러 개가 따로 일렁이고, 앞쪽에 밝은 속불, 위로 불티
   가로등(항구 plamp, 보급지 suplamp): 콘크리트 받침 + 가늘어지는 기둥 + 팔 + 둥근 갓과 따뜻한 유리. 불빛 자리(H)는 예전과 같아요 */
function lkFireParts(){const p=[],up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3();
 for(let a=0;a<10;a++){const an=a/10*Math.PI*2+.15;p.push(lkBoulder(a%3?.19:.22,a%2?0xdedbd6:0xcbc6bf,a,[Math.cos(an)*.72,-.02,Math.sin(an)*.72]))}
 p.push(pt(cyl(.5,.55,.06,16),0x3a2a22,[0,.03,0]));
 for(let i=0;i<5;i++){const an=i/5*Math.PI*2+.4,bx=Math.cos(an)*.38,bz=Math.sin(an)*.38;v.set(-bx*.85,.74,-bz*.85);const len=v.length();q.setFromUnitVectors(up,v.normalize());e.setFromQuaternion(q);
  p.push(pt(cyl(.06,.078,len,7),i%2?0x9a5a30:0x86502a,[bx+v.x*len/2,.05+v.y*len/2,bz+v.z*len/2],[e.x,e.y,e.z]),pt(cyl(.07,.07,.025,7),0xd9a86a,[bx-v.x*.01,.05-v.y*.01,bz-v.z*.01],[e.x,e.y,e.z]))}
 return p}
const LK_TONGUE=new THREE.LatheGeometry([[0,0],[.42,.06],[.55,.22],[.5,.42],[.36,.62],[.2,.8],[.08,.94],[0,1.02]].map(a=>new THREE.Vector2(a[0],a[1])),10);
function lkFlames(g,y,s){s*=1.15;const G=new THREE.Group();G.position.y=y;g.add(G);const T=[];
 const bed=new THREE.Mesh(new THREE.CircleGeometry(.4*s,16),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.42,.08)}));bed.rotation.x=-Math.PI/2;bed.position.y=.075;G.add(bed);
 const add=(m,sc,h,x,z,lx,lz,ph)=>{const pv=new THREE.Group();pv.position.set(x,.08,z);const me=new THREE.Mesh(LK_TONGUE,flameMat[m]);pv.add(me);pv.rotation.set(lx,0,lz);G.add(pv);T.push({pv,me,sc,h,lx,lz,ph})};
 add(0,.34*s,.95*s,0,0,0,0,0);add(0,.22*s,.62*s,.19*s,.05*s,.1,-.34,1.7);add(0,.21*s,.56*s,-.18*s,.06*s,.12,.36,3.1);add(0,.19*s,.5*s,.02*s,-.17*s,-.32,0,4.4);
 add(1,.24*s,.7*s,0,.07*s,.06,0,2.2);add(2,.13*s,.42*s,0,.15*s,.12,0,5.3);
 const sm=new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.1,.6)}),sg=new THREE.SphereGeometry(.032*s,6,4),SP=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(sg,sm);G.add(m);SP.push({m,o:i/4,a:i*2.1})}
 const gl=glow(0xff7a2a,6*s,.4);gl.position.y=y+.9*s;g.add(gl);
 T[0].me.onBeforeRender=()=>{const t=gt;for(const q of T){const f=1+Math.sin(t*(8+q.ph)+q.ph*3)*.12+Math.sin(t*(13.7+q.ph*.7)+q.ph)*.06,w=q.sc*(1.05-.05*f);q.me.scale.set(w,q.h*f,w);q.pv.rotation.x=q.lx+Math.sin(t*3.1+q.ph)*.07;q.pv.rotation.z=q.lz+Math.sin(t*2.6+q.ph*1.3)*.08}
  for(const p of SP){const u=(t*.7+p.o)%1;p.m.position.set(Math.sin(p.a+t*1.3)*.2*s*u,.45*s+u*1.7*s,Math.cos(p.a+t)*.14*s*u);p.m.scale.setScalar(Math.max(.01,1-u))}};
 return []}   /* 예전 일렁임 루프(s.fl)는 쓰지 않고 스스로 움직여요 */
if(LK_MOOD)flames=lkFlames;
function lkLampParts(H){const DK=0x39425a,DK2=0x2c3346,CR=0xf1ece2,GLs=0xffe2a0,top=H+.32,z=.49,p=[pt(cyl(.2,.25,.16,12),0xc9c4bd,[0,.08,0]),pt(cyl(.13,.16,.1,12),DK2,[0,.21,0]),pt(cyl(.045,.07,top-.2,10),DK,[0,.2+(top-.2)/2,0]),pt(new THREE.SphereGeometry(.07,10,8),DK,[0,top,0])];
 p.push(pt(cyl(.034,.034,.5,8),DK,[0,top+.03,z/2],[Math.PI/2-.12,0,0]),pt(cyl(.022,.022,.12,6),DK,[0,top-.02,z]));
 p.push(pt(new THREE.SphereGeometry(.21,16,8,0,Math.PI*2,0,Math.PI/2),DK,[0,H+.1,z],0,[1,.72,1]),pt(new THREE.TorusGeometry(.205,.026,6,18),CR,[0,H+.1,z],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.15,14,8),GLs,[0,H+.05,z],0,[1,.55,1]));
 return p}
/* ---------- 연결: 기존 함수 감싸기 ---------- */
/* makeIcons는 ui.js(이 파일 뒤)에 있어서, boot()가 buildProc을 부를 때(ui.js가 다 읽힌 뒤) 감싸요 */
{const _bp=buildProc;buildProc=function(){_bp();try{lkBuildGeo()}catch(e){console.error('look: 모델 만들기 실패',e)}
 if(!buildProc.lkIc&&typeof makeIcons==='function'){buildProc.lkIc=1;const _mi=makeIcons;makeIcons=function(){_mi();try{lkIcons()}catch(e){console.error('look: 아이콘 실패',e)}}}}}
{const _ue=updEnv;updEnv=function(dt,px,pz){_ue(dt,px,pz);try{lkMood()}catch(e){}}}
if(LK_MOOD){const _bpo=buildPorts;buildPorts=function(){_bpo();try{for(const b of PBOATS)if(b.m.geometry===GEO.fboat)b.m.add(mesh(GEO.lk_fboat_glow,LKGLOW,false));lkSupplyFence();lkCenter()}catch(e){console.error('look: 철조망 실패',e)}}}
if(LK_MOOD){pierGeo=lkPier;quayGeo=lkQuay;const _pg=buildPortGeo;buildPortGeo=function(){_pg();try{const b0=Object.assign({},GEO);lkPortGeo();lkAOnew(b0)}catch(e){console.error('look: 항구 모델 실패',e)}}}
{const _bd=buildDressGeo;buildDressGeo=function(){_bd();if(LK_MOOD)try{const b0=Object.assign({},GEO);lkNature();lkSupplyGeo();lkAOnew(b0)}catch(e){console.error('look: 자연 모델 실패',e)}}}
{const _bt=buildTerrain;buildTerrain=function(){_bt();if(LK_MOOD)try{water.material.uniforms.cS.value.setHex(0x4a84ec).convertSRGBToLinear();water.material.uniforms.cD.value.setHex(0x2346b4).convertSRGBToLinear()}catch(e){}}}
{const _ir=initRenderer;initRenderer=function(){_ir();if(LK_MOOD)R.toneMappingExposure=1.06}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{lkHouseVar(r);lkAttach(r);if(r&&r.head&&sdef(r).tur&&GEO.lk_teye)r.head.add(mesh(GEO.lk_teye,LKGLOW,false))}catch(e){console.error('look: 구조물 부품 실패',e)}return r}}
/* 문 부품 움직이기: 나(또는 멀티의 다른 플레이어)가 문 1.9m 안에 오면 앞쪽(+z)으로 열리고, 멀어지면 닫혀요.
   문은 원래 플레이어가 지나갈 수 있어서(blocked) 모양만 맞춰 줘요. 적은 문을 못 지나가니 열리지 않아요 */
function lkGates(dt){const ps=[P];if(typeof NET!=='undefined'&&NET.on)NET.players.forEach(p=>{if(p.hp>0)ps.push(p)});const k=Math.min(1,dt*8);
 for(const s of structs){const d=s.lk&&s.lk.parts.door;if(!d||Math.abs(s.x-P.x)>45||Math.abs(s.z-P.z)>45)continue;const t=ps.some(p=>Math.abs(p.x-s.x)<1.9&&Math.abs(p.z-s.z)<1.9)?-1.5:0;if(Math.abs(t-d.rotation.y)>.002)d.rotation.y+=(t-d.rotation.y)*k}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{lkGates(dt)}catch(e){}}}

/* ---------- 식물 12종: 도감 그림 + 땅에 자라는 모습 (18차 디자인, 기획자 요청) ----------
   기획자가 보여준 참고(롱빈터 꽃·덤불): 말랑한 점토 같은 둥근 잎, 또렷한 꽃잎, 2~3가지 색. 단순하게, 하지만 대충 말고.
   만드는 GEO (id = potato grape strawberry avocado wheat poppy flower_blue flower_yellow flower_black mush_poison mush_censer mush):
   - GEO['pi_'+id]  도감·가방 그림용 모델(부팅 때 ITEMS[id].ic 가 비어 있으면 넣어요 → 아이콘이 알아서 그려져요)
   - GEO['pw_'+id]  땅에 자라는 모습(따기 전). 바닥 y=0, 정면 +z, 크기 1배
   - GEO['pw_'+id+'_e']  딴 뒤 모습(감자·포도·딸기·아보카도만: 열매 없이 잎만)
   규칙 담당이 다른 id를 쓰면 이름(n)에 든 말('감자'·'파란 … 꽃' 등)로 찾아서 그 id 이름으로도 같은 GEO를 걸어 둬요(lkFloraIc). */
const LK_FLORA=[['potato',n=>n==='감자'||/^감자/.test(n)],['grape',n=>/포도/.test(n)],['strawberry',n=>/딸기/.test(n)&&!/산딸기/.test(n)],['avocado',n=>/아보카도/.test(n)],
 ['wheat',n=>n==='밀'||/^밀( |$|이삭|단)/.test(n)],['poppy',n=>/양귀비/.test(n)],['flower_blue',n=>/꽃/.test(n)&&/(파란|파랑|푸른)/.test(n)],['flower_yellow',n=>/꽃/.test(n)&&/(노란|노랑)/.test(n)],
 ['flower_black',n=>/꽃/.test(n)&&/(검은|검정|까만)/.test(n)],['mush_poison',n=>/독버섯/.test(n)],['mush_censer',n=>/향로/.test(n)],['mush',n=>/버섯/.test(n)&&!/(독|향로)/.test(n)]];
function lkFloraGeo(){
 const S_=(r,c,p,s,rot,w=7,h=5)=>pt(new THREE.SphereGeometry(r,w,h),c,p,rot,s),
  G1=0x3f9a4f,G2=0x4fae5a,G3=0x358a46,G4=0x2f7a3e,SOIL=0x7a5236,SOIL2=0x5e3d27,
  fin=(p,deg=62)=>{const g=mg(p);lkSmooth(g,deg);g.computeBoundingSphere();return g},
  /* 잎: 밑동 b 에서 방향(yaw: y축, pitch: 위로 드는 각)으로 뻗는 둥근 타원. cup>0 이면 끝이 살짝 들려요 */
  leaf=(b,len,wid,c,yaw,pitch,th=.035)=>{const g=new THREE.SphereGeometry(1,7,4);g.scale(wid/2,th,len/2);g.translate(0,0,len/2);g.rotateX(-pitch);g.rotateY(yaw);return pt(g,c,b)},
  rod=(a,b,r,c,n=5)=>lkRod(a,b,r,c,n),
  lathe=(prof,c,pos,rot,scl,seg=12,ps=0,pl=Math.PI*2)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg,ps,pl),c,pos,rot,scl),
  ring=(n,f)=>{const o=[];for(let i=0;i<n;i++)o.push(...[].concat(f(i,i/n*Math.PI*2)));return o},
  H=(i,k)=>hash(i,k,77);
 /* 작은 꽃(감자·딸기 꽃): 흰 꽃잎 5 + 노란 가운데 */
 const tiny=(p,r,cp,cc,tilt=0)=>[...ring(5,(i,a)=>S_(r*.55,cp,[p[0]+Math.cos(a)*r*.6,p[1],p[2]+Math.sin(a)*r*.6],[1,.32,.75],[0,-a,0],6,4)),S_(r*.32,cc,[p[0],p[1]+r*.12,p[2]],[1,.7,1],0,6,4)];
 /* ① 감자: 흙 둔덕 + 덩굴 잎 + 흰 꽃, 둔덕 가장자리로 감자 둘이 빼꼼 */
 {const mound=()=>[S_(.46,SOIL,[0,-.02,0],[1,.3,1],0,12,6),S_(.3,SOIL2,[.12,-.03,-.08],[1,.22,1],0,9,5)],
   bush=()=>{const p=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2+H(i,1)*.4;p.push(rod([0,.08,0],[Math.cos(a)*.16,.2+H(i,2)*.08,Math.sin(a)*.16],.016,G4));
      for(let k=0;k<3;k++){const aa=a+(k-1)*.45,b=[Math.cos(a)*(.12+k*.02),.17+H(i,3)*.08,Math.sin(a)*(.12+k*.02)];p.push(leaf(b,.2+H(i,k)*.06,.13,[G1,G2,G3][(i+k)%3],-aa+Math.PI/2,.35+k*.1))}}
     for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;p.push(leaf([Math.cos(a)*.05,.24,Math.sin(a)*.05],.22,.14,i%2?G2:G1,-a+Math.PI/2,.95))}return p};
  const fl=[[.04,.5,.02],[-.12,.44,.08],[.14,.42,-.06]],flw=[];for(const q of fl){flw.push(rod([q[0]*.4,.26,q[2]*.4],q,.012,G3),...tiny(q,.06,0xf3eefa,0xf2c94c))}
  const tub=(x,z,s,r)=>[S_(.11*s,0xc4935a,[x,.03,z],[1.25,.85,.95],[0,r,.2],10,7),S_(.012,0x8a6038,[x+.07*s,.08*s,z+.06*s]),S_(.012,0x8a6038,[x-.05*s,.09*s,z+.07*s])];
  GEO.pw_potato=fin([...mound(),...bush(),...flw,...tub(.32,.26,1,.6),...tub(-.3,.3,.85,-.4)]);
  GEO.pw_potato_e=fin([...mound(),S_(.14,SOIL2,[.22,.02,.24],[1,.25,1]),...[0,1,2].map(i=>leaf([0,.05,0],.16,.1,G2,i*2.1,.7)),rod([0,0,0],[0,.08,0],.012,G3)]);
  const pot=(x,y,z,s,r)=>{const g=new THREE.IcosahedronGeometry(.13*s,2),P=g.attributes.position;for(let i=0;i<P.count;i++){const n=1+(hash(Math.round(P.getX(i)*90),Math.round(P.getY(i)*90),Math.round(P.getZ(i)*90))-.5)*.12;P.setXYZ(i,P.getX(i)*n,P.getY(i)*n,P.getZ(i)*n)}
    return [pt(g,0xc99a5e,[x,y,z],[0,r,.15],[1.3,.88,1]),...[[.09,.04,.07],[-.06,.07,.08],[.02,-.03,.11],[-.1,0,.04]].map(q=>S_(.013*s,0x8a6038,[x+q[0]*s,y+q[1]*s,z+q[2]*s])),...[[.04,.05,.09],[-.03,-.04,.1]].map(q=>S_(.008*s,0xe3c08a,[x+q[0]*s,y+q[1]*s,z+q[2]*s]))]};
  GEO.pi_potato=fin([...pot(-.07,0,.03,1,.3),...pot(.12,-.02,-.08,.85,-.5),leaf([.0,.06,-.1],.18,.1,G2,.6,.9),leaf([.0,.06,-.1],.15,.09,G1,-.4,.8)],50)}
 /* ② 포도: 나무 말뚝 + 가로대, 감긴 덩굴, 세 갈래 큰 잎, 늘어진 보라 송이 */
 {const WD=0xa9753f,VN=0x6b4a33,PU=[0x6b3fa0,0x7d4bb5,0x5a3388],
   lf3=(b,s,c,yaw,pitch)=>[leaf(b,.24*s,.2*s,c,yaw,pitch),leaf(b,.2*s,.15*s,c,yaw+.6,pitch-.1),leaf(b,.2*s,.15*s,c,yaw-.6,pitch-.1)],
   bunch=(x,y,z,s)=>{const p=[rod([x,y+.04*s,z],[x,y-.02,z],.01,VN)];const rows=[4,4,3,3,2,1];let yy=y-.04*s;rows.forEach((n,ri)=>{const rr=.045*s*(n-1)*.55;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+ri*.7;p.push(S_(.042*s,PU[(i+ri)%3],[x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr*.8],0,0,6,4))}yy-=.06*s});return p};
  const frame=[pt(box(.07,1.32,.07),WD,[0,.66,0]),pt(cone(.05,.06,4),0x8d5f36,[0,1.35,0],[0,Math.PI/4,0]),pt(box(.86,.06,.06),WD,[0,1.18,0]),pt(box(.035,.035,.035),0x4a4038,[.0,1.18,.035]),
    lkBeam([-.36,1.18,0],[0,.86,0],.04,.04,0x8d5f36),pt(cyl(.05,.07,.05,6),0x8d5f36,[0,.02,0])],
   vine=[rod([0,.05,.05],[.06,.4,.06],.022,VN),rod([.06,.4,.06],[-.05,.75,.05],.02,VN),rod([-.05,.75,.05],[.05,1.08,.05],.018,VN),rod([.05,1.08,.05],[.38,1.2,.05],.016,VN),rod([.05,1.08,.05],[-.38,1.21,.05],.016,VN),
    rod([.38,1.2,.05],[.42,1.1,.1],.008,VN),rod([-.38,1.21,.05],[-.43,1.12,.1],.008,VN)],
   leaves=[...lf3([.3,1.22,.08],1,G1,.3,.25),...lf3([-.28,1.24,.06],1.05,G2,-.4,.3),...lf3([0,1.26,.1],.9,G3,0,.5),...lf3([.12,.8,.08],.85,G2,.8,.2),...lf3([-.1,.55,.08],.8,G1,-.7,.15),...lf3([.48,1.2,0],.8,G3,1.4,.1),...lf3([-.48,1.2,0],.8,G1,-1.4,.1)],
   fruit=[...bunch(.22,1.08,.1,1),...bunch(-.2,1.08,.1,.9),...bunch(.02,.98,.14,.8)];
  GEO.pw_grape=fin([...frame,...vine,...leaves,...fruit]);GEO.pw_grape_e=fin([...frame,...vine,...leaves]);
  GEO.pi_grape=fin([...bunch(0,.36,0,1.7),rod([0,.42,0],[.04,.5,0],.014,VN),rod([.04,.5,0],[.12,.53,0],.012,VN),...lf3([.06,.5,-.04],1,G2,1.1,.55),rod([-.02,.45,.04],[-.1,.5,.06],.006,VN),rod([-.1,.5,.06],[-.12,.45,.05],.006,VN)],55)}
 /* ③ 딸기: 짚 깔개 위 낮은 포기, 세 장 잎, 흰 꽃, 바닥 쪽으로 늘어진 빨간 딸기(하나는 덜 익음) */
 {const RD=0xe0453a,RD2=0xc93a32,SD=0xf7e27a,
   berry=(p,s,c,yaw=0,tilt=0,ns=0)=>{const BP=[[0,-.12],[.018,-.112],[.038,-.088],[.056,-.052],[.07,-.012],[.078,.028],[.074,.054],[.054,.072],[.024,.08],[0,.08]],pr=y=>{for(let i=1;i<BP.length;i++)if(y<=BP[i][1]){const a=BP[i-1],b=BP[i],t=(y-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*t}return 0},g=new THREE.LatheGeometry(BP.map(q=>new THREE.Vector2(q[0],q[1])),12);g.scale(s,s,s);g.rotateZ(tilt);g.rotateY(yaw);
    const o=[pt(g,c,p)];for(let k=0;k<ns;k++){const a=k*2.39996,yy=-.095+(k+.5)/ns*.16,r=pr(yy)*.995;const v=new THREE.Vector3(Math.cos(a)*r,yy,Math.sin(a)*r).multiplyScalar(s).applyAxisAngle(new THREE.Vector3(0,0,1),tilt).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);o.push(S_((ns>8?.011:.009)*s,SD,[p[0]+v.x,p[1]+v.y,p[2]+v.z],[1,1.3,1],0,5,3))}
    const top=new THREE.Vector3(0,.075*s,0).applyAxisAngle(new THREE.Vector3(0,0,1),tilt).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);for(let k=0;k<5;k++)o.push(leaf([p[0]+top.x,p[1]+top.y,p[2]+top.z],.06*s,.03*s,G3,k*1.26,-.25,.012));return o},
   tri=(b,yaw,pitch,s)=>[0,1,2].map(k=>leaf(b,.15*s,.11*s,[G1,G2,G1][k],yaw+(k-1)*.75,pitch+(k===1?.15:0)));
  const base=[S_(.36,SOIL,[0,-.02,0],[1,.2,1],0,10,5),...ring(9,(i,a)=>pt(box(.16,.012,.018),0xd9bd6a,[Math.cos(a)*(.26+H(i,3)*.08),.035,Math.sin(a)*(.26+H(i,3)*.08)],[0,a+H(i,4),.1]))],
   plant=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.2,e=[Math.cos(a)*.17,.14+H(i,5)*.05,Math.sin(a)*.17];plant.push(rod([0,.02,0],e,.012,G3),...tri(e,-a+Math.PI/2,.25,1))}
  const fl=[...tiny([.06,.2,.12],.055,0xf6f3ee,0xf2c94c),...tiny([-.14,.19,-.02],.05,0xf6f3ee,0xf2c94c),rod([0,.03,0],[.06,.19,.12],.008,G3),rod([0,.03,0],[-.14,.18,-.02],.008,G3)],
   fr=[...berry([.22,.07,.2],.9,RD,.4,.3),...berry([-.2,.07,.2],.8,RD2,-.3,-.25),...berry([.05,.06,.3],.75,RD,0,.1),...berry([-.26,.06,-.12],.7,0xe9e6b4,1,-.2),
    rod([.12,.12,.12],[.22,.15,.2],.006,G3),rod([-.1,.12,.12],[-.2,.14,.2],.006,G3),rod([0,.12,.16],[.05,.13,.3],.006,G3)];
  GEO.pw_strawberry=fin([...base,...plant,...fl,...fr]);GEO.pw_strawberry_e=fin([...base,...plant]);
  GEO.pi_strawberry=fin([...berry([0,.0,0],2.2,RD,.2,.12,16),rod([0,.17,0],[.02,.24,-.01],.01,G3),leaf([.02,.2,0],.13,.08,G2,2.2,.5)],55)}
 /* ④ 아보카도: 작은 나무(살짝 휜 줄기, 짙은 잎 덩이 + 삐죽 나온 긴 잎), 가지 밑에 매달린 배 모양 열매 */
 {const TR=0x8d5f36,TR2=0x7a5030,AV=0x3e5f25,AV2=0x4f7a2e,DG=[0x2f7a3e,0x3b8a4a,0x357f42],
   pear=[[0,-.1],[.05,-.09],[.075,-.05],[.07,0],[.05,.04],[.035,.08],[.02,.1],[0,.105]],
   fruitW=(x,y,z,s)=>[rod([x,y+.12*s,z],[x,y+.22*s,z],.008,TR2),lathe(pear,AV,[x,y,z],[0,0,0],[s,s,s],10)],
   trunk=[rod([0,0,0],[.05,.6,0],.07,TR,7),rod([.05,.6,0],[-.02,1.15,0],.055,TR,7),rod([-.02,1.05,0],[-.36,1.4,.05],.035,TR2),rod([.0,.95,0],[.34,1.32,-.04],.035,TR2),rod([-.02,1.15,0],[0,1.6,0],.04,TR2),
    pt(cyl(.1,.14,.08,7),TR2,[0,.04,0]),S_(.3,SOIL,[0,-.03,0],[1,.18,1],0,10,5)],
   crown=[S_(.42,DG[0],[0,1.66,0],[1.15,.75,1.05],0,12,8),S_(.34,DG[1],[-.38,1.48,.04],[1,.72,.95],0,12,8),S_(.34,DG[2],[.36,1.44,-.02],[1,.72,.95],0,12,8),S_(.26,DG[1],[.05,1.9,.04],[1,.7,1],0,10,7),S_(.24,DG[2],[-.12,1.42,.3],[1.1,.6,.8],0,10,7)];
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,y=1.4+H(i,6)*.5,r=.5+H(i,7)*.12;crown.push(leaf([Math.cos(a)*r*.75,y,Math.sin(a)*r*.65],.26,.09,DG[i%3],-a+Math.PI/2,-.15+H(i,8)*.4,.03))}
  const fr=[...fruitW(-.3,1.12,.18,1),...fruitW(.28,1.08,.12,.95),...fruitW(.02,1.16,.3,.9),...fruitW(-.06,1.1,-.24,1)];
  GEO.pw_avocado=fin([...trunk,...crown,...fr],55);GEO.pw_avocado_e=fin([...trunk,...crown],55);
  const half=[lathe(pear,AV2,[0,0,0],[0,0,0],[1.6,1.6,1.6],12,Math.PI/2,Math.PI)],out=[],inn=[];pear.forEach(q=>{out.push([q[0],q[1]])});
  const sh=(k)=>{const s=new THREE.Shape();s.moveTo(0,pear[0][1]*1.6*k);for(const q of pear)s.lineTo(q[0]*1.6*k,q[1]*1.6*k);for(const q of pear.slice().reverse())s.lineTo(-q[0]*1.6*k,q[1]*1.6*k);return new THREE.ShapeGeometry(s)};
  const face=[pt(sh(1),0x9cc25a,[0,0,.001]),pt(sh(.86),0xd9e38c,[0,-.006,.003]),pt(sh(.62),0xe8e9a6,[0,-.016,.005]),S_(.055,0x8a5a33,[0,-.045,.01],[1,1.05,.75],0,12,8)];
  GEO.pi_avocado=fin([...half,...face,lathe(pear,AV,[.13,.02,-.12],[0,0,-.25],[1.5,1.5,1.5],10),rod([.13+.035,.18,-.12],[.17,.23,-.12],.01,TR2)],55)}
 /* ⑤ 밀: 금빛 줄기 아홉 + 낟알 이삭 + 까끄라기, 아래쪽 가는 잎 */
 {const ST=0xd9b860,EA=0xe8c46a,EA2=0xd6ad52,
   ear=(b,dir,len,th=1)=>{const o=[],up=new THREE.Vector3(...dir).normalize();for(let k=0;k<6;k++){const t=k/5,c=new THREE.Vector3(...b).addScaledVector(up,t*len);for(const s of[-1,1]){const side=new THREE.Vector3(up.y,-up.x,0).normalize().multiplyScalar(.018*s*(1-t*.4));const g=new THREE.IcosahedronGeometry(.024*th*(1-t*.35),0);g.scale(.9,1.5,.9);o.push(pt(g,k%2?EA:EA2,[c.x+side.x,c.y+side.y,c.z+(s*.008)],[0,0,Math.atan2(-up.x,up.y)+s*.35]))}}
     const tip=new THREE.Vector3(...b).addScaledVector(up,len);for(let k=0;k<3;k++)o.push(rod([tip.x,tip.y,tip.z],[tip.x+up.x*.14+(k-1)*.04,tip.y+up.y*.14,tip.z+(k-1)*.02],.003,0xe9d08a,3));return o},
   stalk=(x,z,h,lean,yaw)=>{const top=[x+Math.cos(yaw)*lean,h,z+Math.sin(yaw)*lean],mid=[x+Math.cos(yaw)*lean*.4,h*.55,z+Math.sin(yaw)*lean*.4];
     return [rod([x,0,z],mid,.011,ST,4),rod(mid,top,.009,ST,4),...ear(top,[Math.cos(yaw)*lean*.6,1,Math.sin(yaw)*lean*.6],.2),leaf([x,.18,z],.3,.045,0xb9b55a,-yaw+Math.PI/2,.6,.012)]};
  const p=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2+H(i,9),r=i?.09+H(i,10)*.08:0;p.push(...stalk(Math.cos(a)*r,Math.sin(a)*r,.72+H(i,11)*.22,.06+r*.5,a))}
  p.push(S_(.2,0x8a7a3a,[0,0,0],[1,.08,1],0,10,4));GEO.pw_wheat=fin(p,55);
  const b=[];for(let i=0;i<5;i++){const a=(i-2)*.2,top=[Math.sin(a)*.42,.62,Math.cos(a)*.03+(i%2)*.03];b.push(rod([-Math.sin(a)*.1,0,0],top,.02,ST,5),...ear(top,[Math.sin(a)*1.4,1,0],.26,1.6))}
  b.push(pt(new THREE.TorusGeometry(.05,.016,6,12),0xb5483c,[0,.2,0],[Math.PI/2,0,0],[1,1,.8]),pt(box(.03,.08,.012),0xb5483c,[.03,.15,.05],[0,0,.4]),pt(box(.03,.07,.012),0xb5483c,[-.02,.15,.05],[0,0,-.3]));GEO.pi_wheat=fin(b,55)}
 /* 꽃 머리들 */
 const poppyHead=(p,s,yaw,tilt)=>{const o=[],q=new THREE.Euler(tilt,yaw,0,'YXZ');for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const g=new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI*.55);g.scale(.085*s,.06*s,.07*s);g.rotateX(-1.15);g.translate(0,.01*s,.06*s);g.rotateY(a);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(q));o.push(pt(g,k%2?0xe2402f:0xd5372a,p))}
   const c=new THREE.Vector3(0,.035*s,0).applyEuler(q);o.push(S_(.032*s,0x2a2a33,[p[0]+c.x,p[1]+c.y,p[2]+c.z],[1,.8,1]),S_(.018*s,0x5a6a3a,[p[0]+c.x*1.25,p[1]+c.y*1.25,p[2]+c.z*1.25],[1,.6,1]));
   for(let k=0;k<6;k++){const a=k*1.047,v=new THREE.Vector3(Math.cos(a)*.04*s,.03*s,Math.sin(a)*.04*s).applyEuler(q);o.push(S_(.009*s,0x1f1f26,[p[0]+v.x,p[1]+v.y,p[2]+v.z],0,0,4,3))}return o},
  cornHead=(p,s,yaw,tilt)=>{const o=[],q=new THREE.Euler(tilt,yaw,0,'YXZ');for(let k=0;k<9;k++){const a=k/9*Math.PI*2;const g=new THREE.ConeGeometry(.034*s,.1*s,6,1,false);g.rotateX(Math.PI);g.translate(0,.05*s,0);g.rotateZ(-1.25);g.rotateY(a);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(q));o.push(pt(g,k%2?0x3f6fe0:0x5a86f0,p))}
   for(let k=0;k<9;k++){const a=k/9*Math.PI*2+.35;const g=new THREE.ConeGeometry(.024*s,.07*s,5,1,false);g.rotateX(Math.PI);g.translate(0,.035*s,0);g.rotateZ(-.8);g.rotateY(a);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(q));o.push(pt(g,0x2f58c8,p))}
   const c=new THREE.Vector3(0,.02*s,0).applyEuler(q);o.push(S_(.034*s,0x35307a,[p[0]+c.x,p[1]+c.y,p[2]+c.z],[1,.6,1],0,8,5),S_(.034*s,0x5a8a4a,[p[0]-c.x*2,p[1]-c.y*2,p[2]-c.z*2],[1,1.2,1],0,7,5));
   for(let k=0;k<5;k++){const a=k*1.257,v=new THREE.Vector3(Math.cos(a)*.016*s,.04*s,Math.sin(a)*.016*s).applyEuler(q);o.push(S_(.008*s,0xb7c8ff,[p[0]+v.x,p[1]+v.y,p[2]+v.z],0,0,4,3))}return o},
  yelHead=(p,s,yaw,tilt)=>{const o=[],q=new THREE.Euler(tilt,yaw,0,'YXZ');for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const g=new THREE.SphereGeometry(1,8,6);g.scale(.045*s,.014*s,.085*s);g.translate(0,0,.07*s);g.rotateX(-.25);g.rotateY(a);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(q));o.push(pt(g,k%2?0xf5c63a:0xf7d14e,p))}
   const cup=new THREE.LatheGeometry([[0,0],[.035,0],[.04,.03],[.05,.065],[.046,.07],[.032,.04],[0,.035]].map(v=>new THREE.Vector2(v[0]*s,v[1]*s)),12);cup.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(q));o.push(pt(cup,0xf29a24,p));return o},
  tulHead=(p,s,yaw)=>{const pr=[[0,0],[.028,.004],[.055,.026],[.071,.062],[.074,.104],[.066,.142],[.058,.16]].map(v=>new THREE.Vector2(v[0]*s,v[1]*s)),cup=new THREE.LatheGeometry(pr,12);
   const o=[pt(cup,0x2c2138,p),S_(.05*s,0x1c1424,[p[0],p[1]+.13*s,p[2]],[1,.25,1],0,8,4)];
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2+yaw,r=(k%2?.05:.062)*s,h=(k%2?.15:.165)*s;const g=new THREE.SphereGeometry(1,6,5);g.scale(.032*s,.05*s,.014*s);g.rotateX(k%2?.12:.22);g.rotateY(-a+Math.PI/2);o.push(pt(g,k%2?0x3a2b4c:0x46345c,[p[0]+Math.cos(a)*r,p[1]+h,p[2]+Math.sin(a)*r]))}
   return o};
 const stemTo=(a,b,c=0x5a9a4a,r=.009)=>{const m=[a[0]*.6+b[0]*.4+(b[0]-a[0])*.1,(a[1]+b[1])*.55,a[2]*.6+b[2]*.4];return [rod(a,m,r,c,4),rod(m,b,r*.9,c,4)]};
 /* ⑥ 양귀비 */
 {const LV=0x7aa86a,p=[],F=[[[.02,.58,.04],1,0,.35],[[-.14,.48,-.04],.9,1.5,.5],[[.15,.45,-.08],.85,-1.2,.45]];
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;p.push(leaf([0,.02,0],.24,.07,i%2?LV:0x6a9a5a,-a,.35,.02))}
  for(const f of F){p.push(...stemTo([0,.02,0],f[0]),...poppyHead(f[0],f[1]*1.25,f[2],f[3]))}
  p.push(...stemTo([0,.02,0],[.08,.36,.12]),S_(.03,0x7a9a5a,[.1,.33,.15],[1,1.4,1],[0,0,.9]));GEO.pw_poppy=fin(p,55);
  GEO.pi_poppy=fin([...poppyHead([0,.3,0],2.2,0,.75),...stemTo([0,-.2,-.06],[0,.25,-.03],0x5a9a4a,.014),leaf([0,-.06,-.05],.2,.06,LV,.8,.7,.02)],55)}
 /* ⑦ 파란 꽃(수레국화) */
 {const LV=0x6f9a6a,p=[],F=[[[.0,.52,.03],1,0,.3],[[-.13,.44,-.06],.9,1.2,.4],[[.13,.4,.06],.85,-1.1,.5],[[.04,.34,-.14],.8,2.6,.45]];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.2;p.push(leaf([0,.02,0],.22,.045,i%2?LV:0x7fa878,-a,.5,.015))}
  for(const f of F)p.push(...stemTo([0,.02,0],f[0],0x6f9a5a,.008),...cornHead(f[0],f[1]*1.25,f[2],f[3]));GEO.pw_flower_blue=fin(p,55);
  GEO.pi_flower_blue=fin([...cornHead([0,.3,0],2.3,0,.8),...stemTo([0,-.22,-.05],[0,.26,-.04],0x6f9a5a,.014),leaf([0,-.04,-.05],.2,.05,LV,.9,.7,.02)],55)}
 /* ⑧ 노란 꽃(참고 그림처럼: 둥근 잎 로제트 + 별 꽃잎 + 주황 나팔) */
 {const LV=[0x2f8a55,0x37975e],p=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.1;p.push(leaf([0,.03,0],.22,.18,LV[i%2],-a,.12,.05))}
  const F=[[[.03,.3,.04],1.2,0,.25],[[-.12,.24,-.06],1.05,1.4,.35]];for(const f of F)p.push(...stemTo([0,.03,0],f[0],0x3f8a4a,.012),...yelHead(f[0],f[1]*1.2,f[2],f[3]));GEO.pw_flower_yellow=fin(p,55);
  GEO.pi_flower_yellow=fin([...yelHead([0,.24,0],2.4,0,.85),...stemTo([0,-.16,-.06],[0,.2,-.04],0x3f8a4a,.016),leaf([0,-.1,-.04],.2,.16,LV[0],.6,.4,.04),leaf([0,-.1,-.04],.18,.14,LV[1],-.7,.35,.04)],55)}
 /* ⑨ 검은 꽃(검은 튤립) */
 {const LV=[0x4a9a5a,0x55a865],p=[],F=[[[0,.5,.02],1.1,0],[[-.12,.42,-.05],1,.8],[[.12,.38,.05],.95,-.6]];
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.4;p.push(leaf([0,.02,0],.3,.09,LV[i%2],-a,.9-H(i,12)*.3,.02))}
  for(const f of F)p.push(rod([f[0][0]*.3,.02,f[0][2]*.3],f[0],.011,0x4a8a4a,5),...tulHead(f[0],f[1]*1.15,f[2]));GEO.pw_flower_black=fin(p,55);
  GEO.pi_flower_black=fin([...tulHead([0,.12,0],2.3,0),rod([0,-.3,0],[0,.12,0],.016,0x4a8a4a),leaf([0,-.22,0],.3,.1,LV[0],.5,1.0,.03),leaf([0,-.2,0],.26,.09,LV[1],-2.2,.95,.03)],55)}
 /* 버섯 */
 const cap=(p,r,h,c,c2,spots)=>{const g=new THREE.SphereGeometry(r,12,7,0,Math.PI*2,0,Math.PI/2);g.scale(1,h/r,1);const o=[pt(g,c,p),pt(new THREE.CircleGeometry(r*.98,12),c2,[p[0],p[1]+.002,p[2]],[Math.PI/2,0,0])];
   if(spots)for(let k=0;k<spots;k++){const a=k*2.39,t=.25+((k*.61)%1)*.55,v=new THREE.Vector3(Math.cos(a)*Math.sin(t*1.5)*r,Math.cos(t*1.5)*h,Math.sin(a)*Math.sin(t*1.5)*r);o.push(S_(r*.13*(k%3?1:1.3),0xf7f2e8,[p[0]+v.x*1.01,p[1]+v.y*1.01,p[2]+v.z*1.01],[1,.45,1],[Math.atan2(v.z,v.y)*0,0,0],7,4))}return o},
  stalk=(p,h,r,c)=>lathe([[0,0],[r*1.35,0],[r*1.4,h*.12],[r,h*.3],[r*.9,h*.8],[r*.95,h],[0,h]],c,p,0,0,10);
 /* ⑩ 독버섯(빨간 갓 흰 점) */
 {const one=(x,z,s,tilt)=>{const o=[stalk([x,0,z],.26*s,.04*s,0xf2ece0),pt(new THREE.CylinderGeometry(.075*s,.055*s,.04*s,10,1,true),0xf4eee2,[x,.19*s,z]),...cap([x,.25*s,z],.15*s,.11*s,0xd8352a,0xf0e2c8,11)];if(tilt){const m=new THREE.Matrix4().makeTranslation(-x,0,-z).premultiply(new THREE.Matrix4().makeRotationZ(tilt)).premultiply(new THREE.Matrix4().makeTranslation(x,0,z));o.forEach(g=>g.applyMatrix4(m))}return o};
  GEO.pw_mush_poison=fin([...one(0,0,1.3,0),...one(.17,.1,.8,-.25),...one(-.14,.12,.55,.3),...[0,1,2,3].map(i=>leaf([0,.0,0],.14,.04,G2,i*1.6+.3,.7,.015))],55);GEO.pi_mush_poison=fin(one(0,0,1.6,0),55)}
 /* ⑪ 향로버섯: 받침 줄기 + 위로 벌어진 그릇 갓(청동빛, 가장자리 물결, 둘레에 구멍 줄), 그릇 안은 연한 빛 포자 + 위로 피어오르는 포자 연기 */
 {const BR=0xc98a3a,BR2=0xa86e2c,PAT=0x5fae9e,IN=0xffe6a0,PU=0xf6efe2,
   one=(x,z,s)=>{const bowl=lathe([[0,.0],[.03,.0],[.065,.03],[.105,.08],[.135,.13],[.15,.16],[.155,.175],[.14,.168],[.115,.14],[.07,.1],[0,.09]].map(q=>[q[0]*s,q[1]*s]),BR,[x,.3*s,z],0,0,14),
     o=[lathe([[0,0],[.075,0],[.08,.02],[.05,.04],[.034,.07],[.03,.22],[.04,.3],[0,.3]].map(q=>[q[0]*s,q[1]*s]),0xe6dcef,[x,0,z],0,0,10),pt(new THREE.TorusGeometry(.062*s,.012*s,5,12),BR2,[x,.022*s,z],[Math.PI/2,0,0]),bowl,
       S_(.118*s,0x5a4d48,[x,.42*s,z],[1,.1,1],0,12,4)];
     for(let k=0;k<5;k++){const a=k*1.4+.3,r=(.03+((k*.37)%1)*.06)*s;o.push(S_(.016*s,0xff8a3a,[x+Math.cos(a)*r,.43*s,z+Math.sin(a)*r],[1,.6,1],0,5,3))}
     for(let k=0;k<10;k++){const a=k/10*Math.PI*2;o.push(S_(.026*s,BR2,[x+Math.cos(a)*.152*s,.477*s,z+Math.sin(a)*.152*s],[1,.6,1],0,6,3));o.push(S_(.013*s,0x2e2218,[x+Math.cos(a+.26)*.122*s,.4*s,z+Math.sin(a+.26)*.122*s],[1,1.2,1],0,5,3))}
     for(let k=0;k<5;k++){const a=k*1.7+.5;o.push(S_(.024*s,PAT,[x+Math.cos(a)*.11*s,.38*s,z+Math.sin(a)*.11*s],[1,.55,1],0,6,3))}
     [[0,.52,0,.045],[.035,.6,.01,.038],[-.01,.68,.02,.03],[.025,.75,-.01,.022]].forEach(q=>o.push(S_(q[3]*s,0xe9e4ee,[x+q[0]*s,q[1]*s,z+q[2]*s],0,0,7,5)));return o};
  GEO.pw_mush_censer=fin([...one(0,0,1.25),...one(.2,.1,.75),...[0,1,2].map(i=>leaf([0,0,0],.12,.05,0x6a8a5a,i*2.1,.6,.015))],55);GEO.pi_mush_censer=fin(one(0,0,1.6),55)}
 /* ⑫ 버섯(갈색 갓 셋, 떨어진 잔가지) */
 {const one=(x,z,s,t)=>{const o=[stalk([x,0,z],.15*s,.035*s,0xefe2c8),...cap([x,.14*s,z],.11*s,.075*s,0x9a6a44,0xe9d6b4,0),S_(.112*s,0xc49a6c,[x,.143*s,z],[1,.12,1],0,12,4)];if(t){const m=new THREE.Matrix4().makeTranslation(-x,0,-z).premultiply(new THREE.Matrix4().makeRotationX(t)).premultiply(new THREE.Matrix4().makeTranslation(x,0,z));o.forEach(g=>g.applyMatrix4(m))}return o};
  GEO.pw_mush=fin([...one(0,0,1.4,0),...one(.15,.08,1,.25),...one(-.1,.14,.8,-.3),...one(.05,-.14,.7,.1),rod([-.25,.01,-.05],[.0,.02,-.22],.012,0x7a5030),rod([-.12,.015,-.13],[-.16,.06,-.2],.006,0x7a5030)],55);
  GEO.pi_mush=fin([...one(-.04,0,1.8,0),...one(.14,.06,1.2,.3)],55)}
 /* 캐릭터 옆에 두고 본 크기 맞춤(꽃·버섯은 무릎 높이쯤까지 키워 멀리서도 보이게) */
 for(const [id,k] of [['potato',1.25],['grape',1.1],['strawberry',1.35],['wheat',1.2],['poppy',1.35],['flower_blue',1.5],['flower_yellow',1.35],['flower_black',1.4],['mush_poison',1.5],['mush_censer',1.45],['mush',1.5]])
  for(const sf of['','_e'])if(GEO['pw_'+id+sf]){GEO['pw_'+id+sf].scale(k,k,k);GEO['pw_'+id+sf].computeBoundingSphere()}
}
/* 규칙 담당의 아이템과 이어 붙이기: 같은 id면 그대로, 다르면 이름으로 찾아 그 id로도 GEO를 걸고, ic 가 비어 있으면 넣어요 */
function lkFloraIc(){if(typeof ITEMS==='undefined')return;for(const [id,mt] of LK_FLORA){if(!GEO['pi_'+id])continue;const ks=ITEMS[id]?[id]:Object.keys(ITEMS).filter(k=>ITEMS[k]&&typeof ITEMS[k].n==='string'&&mt(ITEMS[k].n));
  for(const k of ks){const it=ITEMS[k];if(k!==id){GEO['pi_'+k]=GEO['pi_'+id];GEO['pw_'+k]=GEO['pw_'+id];if(GEO['pw_'+id+'_e'])GEO['pw_'+k+'_e']=GEO['pw_'+id+'_e']}if(!it.ic||!GEO[it.ic])it.ic='pi_'+id}}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{lkFloraGeo()}catch(e){console.error('look: 식물 모델 실패',e)}try{lkAOnew(b0)}catch(e){}try{lkFloraIc()}catch(e){}}}
{const _li=lkIcons;lkIcons=function(){try{lkFloraIc()}catch(e){}_li()}}

/* ---------- 새 아이템 15종 모양 (20차 디자인, 기획자 요청 11-18) ----------
   기획자 피드백 세 번째 버전: 롱빈터 사진처럼 매끈하고 둥글둥글한 장난감 디오라마(첫 소파 기준). 색은 2~3가지 + 크림, 밝고 따뜻하게.
   GEO 이름 = 'lk_'+id. 아이템: chainsaw crossbow arrow fuel / 설치형: sign(이미 있는 lk_sign) fireplace lamp(이미 있는 항구 가로등 모양) fence_garden
   seat_bench chair oven_garden table_round vase sofa boat2. 설치형은 바닥 y=0·정면 +z(벽에 붙는 것은 뒤가 −z). 캐릭터 키 약 2.3 기준.
   움직이는 조각·효과 자리(lkModel): fireplace·oven_garden 조각 fire(빛) + 기준점 smoke / chainsaw 조각 chain(체인 돌리기) / crossbow 기준점 bolt(화살 나가는 곳)
   boat2 조각 motor(모터 흔들기, 회전축 = 뒤판) + 기준점 seat1·seat2(앉는 자리)·wake(물보라) — 보트는 물 높이 y=0, 바닥 y=−0.22. */
const LK_PROPS=[['chainsaw',n=>/전기\s*톱|체인\s*톱/.test(n),'ITEMS'],['crossbow',n=>/석궁/.test(n),'ITEMS'],['arrow',n=>/화살/.test(n),'ITEMS'],['fuel',n=>/연료|기름통/.test(n),'ITEMS'],
 ['sign',n=>/표지판|팻말/.test(n),'BUILDS'],['fireplace',n=>/벽난로/.test(n),'BUILDS'],['lamp',n=>/가로등/.test(n),'BUILDS'],['fence_garden',n=>/정원\s*울타리/.test(n),'BUILDS'],
 ['seat_bench',n=>/벤치/.test(n),'BUILDS'],['chair',n=>/의자/.test(n)&&!/벤치/.test(n),'BUILDS'],['oven_garden',n=>/화덕/.test(n),'BUILDS'],['table_round',n=>/테이블|탁자/.test(n),'BUILDS'],
 ['vase',n=>/꽃병/.test(n),'BUILDS'],['sofa',n=>/소파/.test(n),'BUILDS'],['boat2',n=>/보트|2인승/.test(n),'BUILDS']];
function lkProps20(){
 /* 기획자 피드백 순서: ① 첫 버전 '너무 현실적'(가는 막대·못·박음질) → ② 두 번째 '단순한데 너무 투박'(각진 두꺼운 판).
    지금(③) = 롱빈터 사진처럼 '매끈하고 둥글둥글한 장난감 디오라마': 기획자가 낫다고 한 첫 소파처럼 모서리를 부드럽게 굴린 상자(lkRb)와
    매끈한 원기둥·돌림체, 적당히 가는 비율, 읽히는 만큼의 작은 디테일(널 사이 틈, 둥근 기둥 머리, 꽃), 밝고 따뜻한 색. */
 const R_=(w,h,d,c,p,r,cr=.035,bv=.02)=>pt(lkRb(w,h,d,cr,bv),c,p,r),C=(a,b,h,c,p,r,n=12)=>pt(cyl(a,b,h,n),c,p,r),S_=(r,c,p,s,rot,w=12,h=8)=>pt(new THREE.SphereGeometry(r,w,h),c,p,rot,s),
  beam=(a,b,w,d,c)=>{const q=lkAim(a,b);return pt(lkRb(w,q.L,d,Math.min(w,d)*.4,Math.min(w,d)*.22),c,q.pos,q.rot)},rod=(a,b,r,c,n=8)=>lkRod(a,b,r,c,n),
  lathe=(prof,c,p,seg=14)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg),c,p),
  fin=(p,deg=60)=>{const g=mg(p);lkSmooth(g,deg);g.computeBoundingSphere();return g},
  WD=0xd6965a,WD2=0xb57a45,WD3=0x8f5d36,WDL=0xe8b47a,IR=0x3d4456,ST=0xd0d6dd,CR=0xf7f0e3,RD=0xe0533f,TL=0x3aa6b0;
 /* ① 전기톱: 둥근 주황 몸통 + 검은 손잡이 + 끝이 둥근 은빛 날(짙은 체인 테두리 = 조각 chain) */
 {const OR=0xf08236,BL=0x2f343c,body=[R_(.2,.22,.36,OR,[0,.12,-.06],0,.07,.045),R_(.21,.07,.3,BL,[0,.02,-.06],0,.03,.025),beam([0,.24,-.22],[0,.34,-.06],.06,.055,BL),beam([0,.34,-.06],[0,.27,.1],.06,.055,BL),
    C(.04,.04,.06,0xf6d24a,[.0,.26,-.2],0,10)],bar=[R_(.035,.11,.6,ST,[0,0,.3],0,.05,.012),C(.055,.055,.035,ST,[0,0,.6],[0,0,Math.PI/2],14)];
  lkModel('lk_chainsaw',body.concat(bar.map(g=>{g.translate(0,.12,.12);return g})),{chain:{g:[R_(.025,.14,.64,BL,[0,0,.31],0,.065,.008),C(.07,.07,.025,BL,[0,0,.61],[0,0,Math.PI/2],14)],pv:[0,.12,.12]}},{tip:[0,.12,.8]})}
 /* ② 석궁: 매끈한 나무 몸통 + 검은 활대 + 크림 시위 + 화살 */
 {const p=[R_(.08,.09,.7,WD2,[0,0,0],0,.035,.025),R_(.09,.17,.2,WD,[0,-.06,-.36],[.22,0,0],.05,.03),beam([0,.03,.3],[-.42,.02,.18],.05,.045,IR),beam([0,.03,.3],[.42,.02,.18],.05,.045,IR),
   rod([-.42,.04,.18],[0,.07,-.1],.01,CR,5),rod([.42,.04,.18],[0,.07,-.1],.01,CR,5),rod([0,.075,-.08],[0,.075,.34],.012,0xc0925a,6),pt(cone(.026,.06,8),ST,[0,.075,.38],[Math.PI/2,0,0]),R_(.01,.045,.07,RD,[0,.095,-.05],0,.006,.004)];
  lkModel('lk_crossbow',p,{},{bolt:[0,.075,.4]});
  {const ri=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.3,-1.0,.25)),rd=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(1.05,-.55,0));GEO.lk_crossbow_i=GEO.lk_crossbow.clone().applyMatrix4(ri.clone().invert().multiply(rd));GEO.lk_crossbow_i.computeBoundingSphere()}}
 /* ③ 화살: 화살 세 발 + 빨강·크림 깃 + 가죽 띠 */
 {const p=[];for(let i=0;i<3;i++){const x=(i-1)*.055,y=(i===1?.035:0);p.push(rod([x,y,-.22],[x,y,.22],.013,0xc0925a,6),pt(cone(.028,.07,8),ST,[x,y,.255],[Math.PI/2,0,0]),R_(.01,.06,.09,i===1?CR:RD,[x,y+.028,-.18],0,.02,.004))}
  p.push(R_(.2,.07,.06,0x8a5a3c,[0,.017,.02],0,.03,.02));GEO.lk_arrow=fin(p)}
 /* ④ 연료: 둥근 빨간 기름통 + 손잡이 + 노란 뚜껑 + 옆 X */
 {const RD2=0xc23c30,p=[R_(.36,.44,.18,RD,[0,.22,0],0,.07,.04),R_(.22,.06,.06,RD2,[-.04,.49,0],0,.03,.02),C(.045,.05,.06,0xf6d24a,[.12,.47,0],0,12),
   beam([-.1,.12,.09],[.1,.32,.09],.04,.016,RD2),beam([.1,.12,.09],[-.1,.32,.09],.04,.016,RD2)];GEO.lk_fuel=fin(p)}
 /* ⑤ 벽난로: 둥근 돌 몸체 + 둥근 아치 불구멍(가장자리 돌) + 나무 선반 + 굴뚝, 불(조각 fire) */
 {const SG=0xa59a93,SG2=0x938880,SGL=0xbcb1aa,p=[R_(1.5,1.08,.58,SG,[0,.54,0],0,.1,.06),R_(.8,.54,.2,0x2c2522,[0,.31,.24],0,.2,.03)];
  for(let i=0;i<7;i++){const a=Math.PI*(i/6);p.push(S_(.11,i%2?SGL:SG2,[Math.cos(a)*-.46,.32+Math.sin(a)*.32,.3],[1,.8,.55],0,10,7))}
  p.push(S_(.12,SGL,[-.56,.12,.3],[1,.75,.55],0,10,7),S_(.12,SG2,[.56,.12,.3],[1,.75,.55],0,10,7),
   R_(1.64,.09,.38,WD2,[0,1.12,.08],0,.04,.035),R_(.74,1.04,.44,SG,[0,1.66,-.04],0,.08,.05),R_(.84,.1,.5,SG2,[0,2.2,-.04],0,.05,.035),
   rod([-.24,.12,.26],[.22,.16,.28],.055,0x7a5030,8),rod([-.2,.17,.32],[.24,.12,.22],.05,WD2,8),C(.035,.035,.13,CR,[-.5,1.23,.12],0,10),C(.012,.012,.03,0xffd35c,[-.5,1.31,.12],0,6),
   lathe([[0,0],[.05,0],[.06,.04],[.045,.1],[.05,.13],[0,.13]],TL,[.46,1.165,.12],12));
  lkModel('lk_fireplace',p,{fire:{g:[S_(.13,0xff8a3a,[0,.1,0],[1.3,1,.8]),pt(cone(.11,.32,10),0xffb347,[-.05,.22,.02]),pt(cone(.075,.25,10),0xffe07a,[.08,.2,0])],pv:[0,.16,.28],glow:true}},{smoke:[0,2.28,-.04]})}
 /* ⑥ 가로등: 항구에 이미 있는 가로등 모양 그대로 */
 if(typeof lkLampParts==='function')GEO.lk_lamp=fin(lkLampParts(2.72),50);
 /* ⑦ 정원 울타리(참고 그림 같은 크림색 울타리): 둥근 머리 기둥 둘 + 사이 뜬 널 여섯 + 가로대 둘 (길이 2, 높이 0.9) */
 {const PC=0xf6efe2,PC2=0xe9e0cf,p=[...[-.94,.94].flatMap(x=>[R_(.14,.86,.14,PC,[x,.43,0],0,.04,.03),S_(.085,PC,[x,.9,0],[1,.8,1],0,10,6)]),R_(1.82,.07,.05,PC2,[0,.56,-.045],0,.03,.02),R_(1.82,.07,.05,PC2,[0,.22,-.045],0,.03,.02)];
  for(let i=0;i<6;i++){const x=-.7+i*.28;p.push(R_(.18,.66,.045,i%2?PC2:PC,[x,.38,0],0,.06,.018),S_(.09,i%2?PC2:PC,[x,.71,0],[1,.55,.25],0,10,4))}GEO.lk_fence_garden=fin(p)}
 /* ⑧ 벤치의자: 사이가 뜬 널 셋(앉는 판) + 등받이 널 둘 + 둥근 짙은 다리·팔걸이 */
 {const FG=0x3b5a48,p=[];for(let i=0;i<3;i++)p.push(R_(1.46,.05,.12,i%2?WD:WDL,[0,.46,.15-i*.14],0,.025,.018));for(let i=0;i<2;i++)p.push(R_(1.46,.1,.04,i%2?WD:WDL,[0,.66+i*.15,-.22-i*.03],[-.18,0,0],.035,.016));
  for(const x of[-.64,.64])p.push(rod([x,0,.16],[x,.44,.13],.032,FG),rod([x,0,-.16],[x,.44,-.12],.032,FG),rod([x,.44,-.15],[x,.9,-.3],.03,FG),rod([x,.62,.2],[x,.62,-.18],.03,FG),rod([x,.44,.15],[x,.62,.18],.026,FG),S_(.04,FG,[x,.62,.2],0,0,8,5));
  GEO.lk_seat_bench=fin(p)}
 /* ⑨ 일반의자: 살짝 가늘어지는 다리 + 둥근 앉는 판 + 폭신한 방석 + 등판 둘 */
 {const p=[R_(.5,.06,.48,WD,[0,.45,0],0,.06,.025),R_(.44,.08,.4,RD,[0,.51,.03],0,.1,.04)];
  for(const x of[-.2,.2])for(const z of[-.18,.18])p.push(C(.035,.028,.44,WD2,[x,.22,z],0,8));
  for(const x of[-.2,.2])p.push(beam([x,.46,-.2],[x,1.0,-.25],.06,.05,WD2));p.push(R_(.48,.14,.05,WDL,[0,.92,-.245],[-.06,0,0],.05,.02),R_(.44,.1,.04,WDL,[0,.72,-.23],[-.06,0,0],.04,.016));GEO.lk_chair=fin(p)}
 /* ⑩ 정원화덕: 벽돌색 받침 + 매끈한 흙 돔(둥근 돌 아치 입구, 불 = 조각 fire) + 굴뚝, 밑에 장작 */
 {const BR=0xc4664a,BR2=0xad583f,CL=0xe2ad84,p=[R_(1.28,.6,.98,BR,[0,.3,0],0,.06,.04),R_(.78,.34,.2,0x2c2522,[0,.24,.41],0,.12,.03),R_(1.36,.08,1.06,0xd3c8ba,[0,.64,0],0,.04,.03),
   pt(new THREE.SphereGeometry(.55,16,10,0,Math.PI*2,0,Math.PI/2),CL,[0,.68,-.04],0,[1,.95,1.02]),R_(.34,.24,.06,0x241e1b,[0,.82,.53],0,.12,.02),
   C(.065,.065,.42,IR,[.2,1.3,-.2],0,10),C(.09,.075,.06,IR,[.2,1.52,-.2],0,10),...[0,1].map(i=>rod([-.26,.14+i*.1,.38-i*.04],[.26,.14+i*.1,.38-i*.04],.048,i?WD2:0x7a5030,10))];
  for(let i=0;i<7;i++){const a=Math.PI*(i/6);p.push(S_(.075,i%2?BR:BR2,[Math.cos(a)*-.22,.72+Math.sin(a)*.2,.5],[1,.8,.7],0,10,7))}
  lkModel('lk_oven_garden',p,{fire:{g:[S_(.1,0xff8a3a,[0,.04,0],[1.3,.8,1]),pt(cone(.08,.2,10),0xffb347,[-.04,.12,0]),pt(cone(.06,.16,10),0xffe07a,[.06,.1,0])],pv:[0,.74,.4],glow:true}},{smoke:[.2,1.6,-.2]})}
 /* ⑪ 원형 테이블: 가장자리가 둥근 판 + 잘록한 기둥 + 둥근 발 셋 */
 {const p=[lathe([[0,.72],[.5,.72],[.52,.735],[.52,.775],[.5,.79],[0,.79]],WDL,[0,0,0],24),lathe([[0,.08],[.1,.1],[.07,.2],[.065,.55],[.09,.66],[.14,.7],[0,.72]],WD2,[0,0,0],12)];
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;p.push(beam([0,.1,0],[Math.cos(a)*.38,.04,Math.sin(a)*.38],.08,.06,WD2),S_(.05,WD3,[Math.cos(a)*.38,.03,Math.sin(a)*.38],[1,.6,1],0,10,6))}GEO.lk_table_round=fin(p)}
 /* ⑫ 꽃병: 매끈한 청록 도자기(크림 띠) + 꽃잎 달린 꽃 셋 + 잎 */
 {const p=[lathe([[0,0],[.09,0],[.12,.04],[.135,.13],[.12,.24],[.075,.32],[.06,.35],[.08,.39],[.07,.395],[0,.395]],TL,[0,0,0],18),C(.137,.137,.035,CR,[0,.15,0],0,18)],fl=[[.06,.62,.02,0xf5c63a],[-.08,.58,.04,0x5a86f0],[0,.66,-.05,RD]];
  for(const f of fl){p.push(rod([0,.36,0],[f[0],f[1],f[2]],.009,0x4a9a4a,5));for(let k=0;k<5;k++){const a=k*1.257;p.push(S_(.03,f[3],[f[0]+Math.cos(a)*.032,f[1],f[2]+Math.sin(a)*.032],[1,.5,1],0,8,5))}p.push(S_(.02,0xfff1b0,[f[0],f[1]+.012,f[2]],0,0,8,5))}
  for(const s of[-1,1]){const g=new THREE.SphereGeometry(1,8,5);g.scale(.045,.01,.12);g.translate(0,0,.1);g.rotateX(-.5);g.rotateY(s*1.2);p.push(pt(g,0x4f9a55,[0,.38,0]))}GEO.lk_vase=fin(p,55)}
 /* ⑬ 소파: 기획자가 낫다고 한 첫 소파 그대로(박음질 줄만 뺌) */
 {const FB=0xc76a4d,FB2=0xb05a40,p=[...[-.85,.85].flatMap(x=>[-.3,.3].map(z=>C(.03,.022,.1,WD3,[x,.05,z],0,8))),R_(1.86,.2,.78,FB2,[0,.2,0],0,.04,.03)];
  for(const x of[-.43,.43])p.push(R_(.84,.16,.66,FB,[x,.38,.05],0,.06,.04),R_(.82,.44,.18,FB,[x,.68,-.28],[-.12,0,0],.07,.05));
  for(const x of[-.9,.9])p.push(R_(.18,.5,.78,FB2,[x,.42,0],0,.08,.06));
  p.push(R_(1.84,.22,.12,FB2,[0,.84,-.36],[-.12,0,0],.05,.04),R_(.32,.3,.1,CR,[.55,.62,-.12],[-.3,-.25,.15],.08,.06));GEO.lk_sofa=fin(p,50)}
 /* ⑭ 보트 2인승: 매끈한 크림 선체 + 청록 뱃전 관 + 나무 안쪽·앉는 판 둘 + 노 + 둥근 모터(조각 motor) */
 {const HC=0xf6f0e4,IN=0xddaa6c,L=1.45,W=.62,D=.42,mk=(sx,sy,sz,c,flip)=>{const g=new THREE.SphereGeometry(1,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),P=g.attributes.position;
    for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const t=(z+1)/2;x*=1-Math.pow(Math.max(0,t-.45)/.55,1.6)*.92;if(z<-.82)z=-.82;P.setXYZ(i,x*sx,y*sy,z*sz)}
    g.computeVertexNormals();const q=pt(g,c,[0,D,0]);if(flip){const a=q.attributes.position.array,b=q.attributes.color.array;for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){const t=a[i+3+k];a[i+3+k]=a[i+6+k];a[i+6+k]=t;const u=b[i+3+k];b[i+3+k]=b[i+6+k];b[i+6+k]=u}}return q};
  const p=[mk(W,D,L,HC),mk(W*.92,D*.9,L*.95,IN,true)],rim=[];for(let i=0;i<=12;i++){const z=-L*.82+i/12*L*1.8,t=(z/L+1)/2;rim.push([W*(1-Math.pow(Math.max(0,t-.45)/.55,1.6)*.92),D,z])}
  for(let i=0;i<rim.length-1;i++)for(const s of[-1,1])p.push(rod([s*rim[i][0],D+.02,rim[i][2]],[s*rim[i+1][0],D+.02,rim[i+1][2]],.04,TL,8));
  p.push(rod([-W,D+.02,-L*.82],[W,D+.02,-L*.82],.04,TL,8),R_(W*1.86,.24,.04,HC,[0,D-.1,-L*.815],0,.05,.02));
  for(const z of[-.55,.35])p.push(R_(W*1.66*(z>0?.92:1),.05,.22,IN,[0,D-.08,z],0,.04,.02));
  for(const s of[-1,1])p.push(rod([s*W*.82,D+.1,-.3],[s*W*.72,D+.06,.85],.024,WD,8),R_(.11,.025,.22,WD,[s*W*.7,D+.05,.98],[0,s*.1,0],.04,.01));
  const mot=[R_(.2,.26,.24,0x4a5060,[0,.2,-.1],0,.08,.05),R_(.21,.07,.25,0xf08236,[0,.35,-.1],0,.05,.03),R_(.07,.4,.09,IR,[0,-.06,-.12],0,.03,.02),R_(.035,.12,.05,0x9aa3ad,[0,-.26,-.2],0,.02,.01)];
  lkModel('lk_boat2',p,{motor:{g:mot,pv:[0,D+.02,-L*.84]}},{seat1:[0,D-.04,-.55],seat2:[0,D-.04,.35],wake:[0,0,-L*.9]});
  for(const k of['lk_boat2','lk_boat2_b']){GEO[k].translate(0,-.22,0);GEO[k].computeBoundingSphere()}GEO.lk_boat2_motor.computeBoundingSphere()}
 for(const k of['lk_chainsaw','lk_crossbow','lk_fireplace','lk_oven_garden','lk_boat2'])for(const s of['','_b'])if(GEO[k+s])lkSmooth(GEO[k+s],55);
}
/* 규칙 담당의 아이템·설치형과 이어 붙이기: 같은 id면 그대로, 다르면 이름(n)으로 찾아 모델이 비어 있을 때만 넣어요 */
function lkPropsIc(){for(const [id,mt,where] of LK_PROPS){const key='lk_'+id;if(!GEO[key])continue;const T=where==='ITEMS'?(typeof ITEMS!=='undefined'&&ITEMS):(typeof BUILDS!=='undefined'&&BUILDS);if(!T)continue;
  const ks=T[id]?[id]:Object.keys(T).filter(k=>T[k]&&typeof T[k].n==='string'&&mt(T[k].n));for(const k of ks){const d=T[k];if(where==='ITEMS'){if(!d.ic||!GEO[d.ic]||(d.ic===key&&GEO[key+'_i']))d.ic=GEO[key+'_i']?key+'_i':key}else if(!d.g||!GEO[d.g])d.g=key}}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{lkProps20()}catch(e){console.error('look: 20차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}try{lkPropsIc()}catch(e){}}}
{const _li=lkIcons;lkIcons=function(){try{lkPropsIc()}catch(e){}_li()}}
