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
function lkFenceWood(){const p=[];for(const x of[-.92,.92])p.push(pt(lkRb(.22,1.25,.22,.05,.04),LKW.post,[x,.625,0]),pt(lkRb(.27,.09,.27,.04,.025),LKW.cap,[x,1.29,0]));
 p.push(pt(lkRb(1.7,.15,.08,.05,.025),LKW.rail,[0,.78,-.09]),pt(lkRb(1.7,.15,.08,.05,.025),LKW.rail,[0,.34,-.09]));[-.6,-.2,.2,.6].forEach((x,i)=>p.push(lkPlank(x,.6,i%2?1.04:1.1,LKW.pl[i])));return p}
function lkFenceStone(){const p=[];let k=0;for(const[y,xs,ws]of[[.23,[-.66,0,.66],[.62,.62,.62]],[.69,[-.79,-.26,.27,.79],[.38,.6,.42,.38]]])xs.forEach((x,i)=>p.push(pt(lkRb(ws[i]+.02,.44,.6,.12,.06),LKS.bl[(k++)%3],[x,y,0])));
 p.push(pt(lkRb(2.04,.13,.68,.05,.04),LKS.cap,[0,.97,0]));for(const[x,z,r]of[[-.55,.12,.13],[.62,-.1,.1]])p.push(pt(new THREE.SphereGeometry(r,8,5),LKS.moss,[x,1.04,z],0,[1.4,.6,1.1]));return p}
function lkFenceIron(){const p=[];for(const x of[-.93,.93])p.push(pt(lkRb(.17,1.6,.17,.07,.04),LKI.post,[x,.8,0]),pt(new THREE.SphereGeometry(.11,10,7),LKI.cap,[x,1.64,0]));
 for(const y of[1.44,.16])p.push(pt(lkRb(1.72,.1,.1,.045,.03),LKI.post,[0,y,0]));return p.concat(lkLattice(1.7,1.22,-.85,.19,0,.34,LKI.wire,.045))}
function lkFenceTiBase(){const p=[];for(const x of[-.92,.92])p.push(pt(lkRb(.22,1.6,.22,.09,.05),LKT.post,[x,.8,0]),pt(lkRb(.27,.1,.27,.05,.03),LKT.cap,[x,1.64,0]));
 p.push(pt(lkRb(1.64,1.2,.12,.2,.05),LKT.pn,[0,.8,0]),pt(lkRb(1.38,.92,.04,.16,.02),LKT.in,[0,.8,.06]));return p}
const lkTiGlow=()=>[pt(lkRb(1.38,.09,.06,.045,.02),LKT.g,[0,.8,.085]),...[-.92,.92].map(x=>pt(lkRb(.07,.3,.05,.03,.015),LKT.g,[x,1.2,.11]))];
/* 문: 경첩이 왼쪽. 문짝은 부품 'door' (경첩 기준 +x로 뻗음) */
function lkGateWood(){const base=[],door=[];for(const x of[-.94,.94])base.push(pt(lkRb(.22,1.42,.22,.05,.04),LKW.post,[x,.71,0]),pt(lkRb(.27,.09,.27,.04,.025),LKW.cap,[x,1.46,0]));
 [.22,.62,1.02,1.42].forEach((u,i)=>door.push(lkPlank(u,.64,i%2?1.06:1.12,LKW.pl[i],.38)));
 for(const y of[.36,.9])door.push(pt(lkRb(1.6,.15,.08,.05,.025),LKW.rail,[.82,y,-.09]));door.push(pt(lkRb(1.5,.15,.08,.05,.025),LKW.rail,[.82,.63,-.09],[0,0,.36]),pt(new THREE.SphereGeometry(.07,10,7),0x3b2f28,[1.5,.68,.08]));
 lkModel('lk_gate_wood',base,{door:{g:door,pv:[-.84,0,0]}})}
function lkGateStone(){const base=[],door=[];for(const x of[-.8,.8]){[0,1].forEach(r=>base.push(pt(lkRb(.42,.62,.52,.1,.05),LKS.bl[(r+(x>0?1:0))%3],[x,.32+r*.64,0])));base.push(pt(lkRb(.5,.12,.6,.05,.035),LKS.cap,[x,1.34,0]),pt(new THREE.SphereGeometry(.1,8,5),LKS.moss,[x+.06,1.41,.1],0,[1.4,.6,1.1]))}
 [.2,.6,.98].forEach((u,i)=>door.push(lkPlank(u,.62,1.08,[0x9a6236,0x8c582f,0xa66b3d][i],.38)));for(const y of[.34,.9])door.push(pt(lkRb(1.18,.1,.13,.04,.025),0x4a4f57,[.59,y,0]));door.push(pt(new THREE.TorusGeometry(.08,.025,6,12),0x4a4f57,[1.0,.62,.08]));
 lkModel('lk_gate_stone',base,{door:{g:door,pv:[-.58,0,0]}})}
function lkGateIron(){const base=[],door=[];for(const x of[-.94,.94])base.push(pt(lkRb(.18,1.66,.18,.07,.04),LKI.post,[x,.83,0]),pt(new THREE.SphereGeometry(.12,10,7),LKI.cap,[x,1.7,0]));
 door.push(pt(lkRb(1.74,.1,.1,.045,.03),LKI.post,[.87,1.46,0]),pt(lkRb(1.74,.1,.1,.045,.03),LKI.post,[.87,.16,0]),pt(lkRb(.1,1.38,.1,.045,.03),LKI.post,[.05,.81,0]),pt(lkRb(.1,1.38,.1,.045,.03),LKI.post,[1.69,.81,0]),pt(lkRb(.1,.2,.12,.04,.02),0x4a5058,[1.69,.84,.07]));
 lkModel('lk_gate_iron',base,{door:{g:door.concat(lkLattice(1.54,1.2,.1,.21,0,.34,LKI.wire,.045)),pv:[-.88,0,0]}})}
function lkGateTi(){const base=[],door=[];for(const x of[-.94,.94])base.push(pt(lkRb(.22,1.68,.22,.09,.05),LKT.post,[x,.84,0]),pt(lkRb(.27,.1,.27,.05,.03),LKT.cap,[x,1.72,0]));
 door.push(pt(lkRb(1.64,1.24,.12,.2,.05),LKT.pn,[.84,.82,0]),pt(lkRb(1.38,.94,.04,.16,.02),LKT.in,[.84,.82,.06]),pt(lkRb(.2,.28,.05,.05,.02),0x3a434c,[1.42,.96,.1]));
 lkModel('lk_gate_ti',base,{door:{g:door,pv:[-.83,0,0]},doorGlow:{g:[pt(lkRb(1.38,.09,.06,.045,.02),LKT.g,[.84,.82,.085]),pt(lkRb(.1,.06,.03,.02,.01),0x6bff9a,[1.42,1.03,.13])],pv:[0,0,0],glow:true,par:'door'},postGlow:{g:[-.94,.94].map(x=>pt(lkRb(.07,.3,.05,.03,.015),LKT.g,[x,1.28,.11])),pv:[0,0,0],glow:true}})}
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
 else{const n=Math.max(2,Math.round(L/.8));for(let i=0;i<n;i++)p.push(pt(lkRb(W,.13,L/n-.07,.04,.03),LKH.wood[i%3],[0,.695,-L/2+(i+.5)*L/n]));
  for(const sx of[-1,1]){p.push(pt(box(.18,.2,L),0x9a5a30,[sx*(W/2-.14),.56,0]));const m=Math.max(2,Math.round(L/3.6)+1);for(let i=0;i<m;i++){const z=-L/2+.3+i*(L-.6)/(m-1);p.push(pt(cyl(.17,.19,3.5,8),0xa5622f,[sx*(W/2+.02),-.6,z]),pt(cyl(.2,.2,.1,8),0x7d4824,[sx*(W/2+.02),1.18,z]))}}}
 const g=mg(p);lkSmooth(g,50);return LKPG[k]=g}
function lkQuay(L,W){const p=[pt(box(W+.24,.36,L),LKH.conc,[0,.62,0]),pt(box(W,2.3,L),LKH.conc2,[0,-.7,0]),pt(box(.26,.035,L),LKH.red,[-(W/2-.02),.805,0])];for(const sz of[-1,1])p.push(pt(box(W+.24,.035,.26),LKH.red,[0,.805,sz*(L/2-.13)]));
 const n=Math.round(L/3);for(let i=1;i<n;i++)p.push(pt(box(W,.012,.05),0xbdb6b2,[0,.803,-L/2+i*L/n]));
 for(let i=0;i<n;i++){const z=-L/2+(i+.5)*L/n;p.push(pt(lkRb(.22,.55,.7,.08,.04),0x3f4450,[-(W/2+.2),.3,z]));if(i%2)p.push(pt(cyl(.16,.2,.42,8),0x3f4450,[-(W/2-.5),1.0,z]),pt(new THREE.SphereGeometry(.24,8,5),0xe9c046,[-(W/2-.5),1.24,z],0,[1,.6,1]))}
 const g=mg(p);lkSmooth(g,50);return g}
function lkPortGeo(){const S=(k,p)=>{const g=mg(p);lkSmooth(g,50);g.computeBoundingSphere();GEO[k]=g},hull=(sx,sy,sz)=>{const g=new THREE.SphereGeometry(1,14,6,0,6.3,Math.PI/2,Math.PI/2);g.scale(sx,sy,sz);return g},rim=(sx,sz,t)=>{const g=new THREE.TorusGeometry(1,t,6,20);g.rotateX(Math.PI/2);g.scale(sx,1,sz);return g},disc=(sx,sz)=>{const g=cyl(1,1,.05,16);g.scale(sx,1,sz);return g};
 /* 통통배: 빨간 선체, 초록 갑판, 크림색 조타실에 노란 창 */
 S('fboat',[pt(hull(1.15,.8,3.1),0xd9483e),pt(rim(1.15,3.1,.17),0xd9483e,[0,-.02,0]),pt(rim(1.1,3.02,.07),0xf3efe8,[0,.1,0]),pt(disc(1.03,2.92),0x2f8a62,[0,-.1,0]),pt(lkRb(1.34,1.15,1.5,.18,.06),LKH.cream,[0,.5,-.6]),pt(lkRb(1.56,.14,1.74,.06,.04),0xd9cdb4,[0,1.12,-.6]),pt(cyl(.3,.34,.2,10),0xd9cdb4,[0,1.28,-.6]),
  ...[-.4,0,.4].map(x=>pt(lkRb(.3,.44,.05,.06,.015),0xffd978,[x,.62,.16])),...[-1,1].flatMap(sx=>[-.95,-.3].map(z=>pt(box(.05,.4,.42),0xffd978,[sx*.675,.62,z]))),
  pt(cyl(.045,.055,2.5,6),0x3f4450,[0,1.3,.75]),pt(new THREE.SphereGeometry(.09,8,6),0x7cf0a8,[0,2.6,.75]),pt(lkRb(.7,.3,.6,.05,.03),0xf3efe8,[0,.06,1.6]),pt(new THREE.TorusGeometry(.2,.075,6,12),0x2c3038,[1.19,0,.3],[0,Math.PI/2,0]),pt(new THREE.TorusGeometry(.2,.075,6,12),0x2c3038,[-1.19,0,-.9],[0,Math.PI/2,0])]);
 S('rowboat',[pt(hull(.66,.46,1.55),0xc47d45),pt(rim(.66,1.55,.075),0xf0d9a8),pt(disc(.52,1.36),0x9a5a30,[0,-.2,0]),pt(lkRb(1.1,.07,.26,.03,.02),0xe0a565,[0,-.06,.5]),pt(lkRb(1.14,.07,.26,.03,.02),0xe0a565,[0,-.06,-.35]),pt(cyl(.03,.03,1.7,6),0xe9d3a6,[.5,.06,.1],[1.45,0,.25]),pt(cyl(.03,.03,1.7,6),0xe9d3a6,[-.5,.06,.1],[1.45,0,-.25])]);
 if(GEO.sailboat)lkSmooth(GEO.sailboat,50);if(GEO.pbuoy)lkSmooth(GEO.pbuoy,60);
 S('plamp',[pt(lkRb(.15,2.95,.15,.06,.03),LKH.dk,[0,1.475,0]),pt(lkRb(.3,.14,.3,.05,.03),LKH.dk,[0,.07,0]),pt(box(.1,.1,.62),LKH.dk,[0,2.98,.25]),pt(lkRb(.32,.36,.32,.07,.03),0xffe7a8,[0,2.72,.5]),pt(cone(.3,.24,4),0x4353a8,[0,3.02,.5],[0,Math.PI/4,0]),pt(box(.36,.05,.36),LKH.dk,[0,2.53,.5])]);
 S('pboll',[pt(cyl(.15,.2,.5,8),0x3f4450,[0,.25,0]),pt(new THREE.SphereGeometry(.24,8,5),0xe9c046,[0,.52,0],0,[1,.6,1])]);
 S('pnet',[...[-1.25,1.25].flatMap(x=>[pt(lkRb(.14,2.0,.14,.06,.03),LKI.post,[x,1,0]),pt(new THREE.SphereGeometry(.1,8,6),LKI.cap,[x,2.04,0])]),pt(lkRb(2.4,.09,.09,.04,.025),LKI.post,[0,1.84,0]),pt(lkRb(2.4,.09,.09,.04,.025),LKI.post,[0,.14,0]),...lkLattice(2.36,1.62,-1.18,.18,0,.3,LKI.wire,.035)]);
 S('psign',[pt(lkRb(.16,2.3,.16,.06,.03),0xa5622f,[0,1.15,0]),pt(lkRb(1.6,.9,.12,.12,.04),0xd99a5c,[0,2.05,.05]),pt(lkRb(1.36,.66,.04,.08,.015),0xf0d9a8,[0,2.05,.12]),pt(lkRb(.1,.3,.03,.04,.01),0xdb5a4c,[-.42,2.1,.15]),pt(lkRb(.1,.1,.03,.04,.01),0xdb5a4c,[-.42,1.86,.15]),...[2.2,2.05,1.9].map((y,i)=>pt(box(i==2?.4:.62,.07,.03),0x8a5a36,[i==2?.09:.2,y,.15]))]);
 S('pstack',[...lkPallet([0,0,0],.2,3),...lkPallet([1.25,0,.3],.9,1),...lkDrum(0xe9c046,[-1.05,0,.35]),...lkDrum(0x4a8fd6,[-.75,0,-.55]),...lkPallet([.5,0,1.25],-.3,0)]);
 S('pcrane',lkLatTower(6.2,.85,[0,.1,0]).concat([pt(box(1.3,.2,1.3),LKH.conc2,[0,.1,0])]))}
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
  const g=mg(p);lkSmooth(g,50);GEO.lk_workshop=g;Object.assign(DECO.blacksmith,{g:'lk_workshop',s:1});Object.assign(BUILDS.forge,{g:'lk_workshop',s:1})}
 /* 탱크 (well) */
 {const p=[pt(box(2.0,.14,2.2),0x9c9794,[0,.07,0])];for(const x of[-.5,.5]){const b=new THREE.CylinderGeometry(.44,.44,1.1,12);p.push(lkShade(pt(b,LKH.cream,[x,.72,0],[Math.PI/2,0,0]),.85,1.05));for(const z of[-.55,.55])p.push(pt(new THREE.SphereGeometry(.44,12,8),LKH.cream,[x,.72,z],0,[1,1,.75]));p.push(pt(cyl(.07,.07,.2,6),0x8f99a4,[x,1.22,0]),pt(cyl(.13,.13,.05,8),0xdb5a4c,[x,1.34,0]));for(const z of[-.4,.4])p.push(pt(box(.7,.26,.12),0x8f99a4,[x,.24,z]))}
  const g=mg(p);lkSmooth(g,50);GEO.lk_tank=g;Object.assign(DECO.well,{g:'lk_tank',s:1})}
 /* 철탑 (towerB) */
 {const g=mg(lkLatTower(8.6,1.25,[0,.2,0]).concat([pt(box(2.9,.2,3.2),0x9c9794,[0,.1,0]),...lkContainer(1.3,1.2,1.0,0xe9c046,0xd0a630,[.6,.2,1.0])]));lkSmooth(g,50);GEO.lk_tower=g;Object.assign(DECO.towerB,{g:'lk_tower',s:1})}
 [0xe9c046,0x4a8fd6,0xdb5a4c,0x5fae7a].forEach((c,i)=>{const g=mg(lkDrum(c));lkSmooth(g,50);GEO['lk_drum_'+i]=g});Object.assign(DECO.barrel,{g:'lk_drum_0',s:1});
 {const g=mg(lkPallet([0,0,0],0,2));lkSmooth(g,50);GEO.lk_pallet=g;Object.assign(DECO.crate,{g:'lk_pallet',s:1})}
 Object.assign(DECO.lumber,{g:'lk_logs',s:3.4});Object.assign(DECO.tent,{g:'mtent',s:1.15});
 /* 모닥불 받침: 둥근 흰 돌 + 엇갈린 장작 (불꽃은 예전 그대로 위에 붙어요) */
 {const p=[];for(let a=0;a<9;a++)p.push(lkBoulder(.2,a%2?0xdedbd6:0xcdc9c4,a,[Math.cos(a*.698)*.74,-.02,Math.sin(a*.698)*.74]));for(let a=0;a<3;a++)p.push(pt(cyl(.1,.11,1.15,7),a%2?0x9a5a30:0x8a4e28,[0,.14,0],[Math.PI/2,0,a*1.05+.3]));const g=mg(p);lkSmooth(g,60);GEO.firepit=g}}

/* ---------- 센터·항구·보급지의 흰 철조망 (LK_MOOD) ----------
   기획자 요청: 마을 대신 '센터'. 건물은 가게 하나, 나머지는 철조망과 소품으로만 꾸며요. 철조망(cfence)은 지나갈 수 없는 구조물이고, 땅이 물가이거나 다른 구조물과 겹치는 자리는 자동으로 건너뛰어요 */
function lkFenceGeo(){const PO=0xe9ecef,WI=0xd3d9df,p=[];for(const x of[-1.25,1.25])p.push(pt(lkRb(.13,1.95,.13,.05,.03),PO,[x,.975,0]),pt(new THREE.SphereGeometry(.09,8,6),0xc3cad1,[x,1.98,0]));
 p.push(pt(lkRb(2.5,.08,.08,.035,.02),PO,[0,1.8,0]),pt(lkRb(2.5,.08,.08,.035,.02),PO,[0,.14,0]),...lkLattice(2.38,1.6,-1.19,.18,0,.3,WI,.03));const g=mg(p);lkSmooth(g,50);GEO.lk_cfence=g;DECO.cfence={g:'lk_cfence',s:1,bx:1.25,bz:.14}}
function lkFence(x,z,r){const c=Math.cos(r),sn=Math.sin(r);for(const u of[-1.25,0,1.25]){const X=x+c*u,Z=z-sn*u;if(hAt(X,Z)<.95||onDock(X,Z))return null;for(const q of structs)if(q.t!=='cfence'&&inStruct(q,X,Z,.3))return null}
 const hs=[];for(const u of[-1.25,0,1.25])for(const v of[-.3,.3])hs.push(hAt(x+c*u+sn*v,z-sn*u+c*v));for(const q of[[-1.25,-.14],[1.25,-.14],[-1.25,.14],[1.25,.14]])hs.push(hAt(x+q[0],z+q[1]));if(Math.max(...hs)-Math.min(...hs)>.25)return null;return addStruct({t:'cfence',x,z,r})}   /* 기울기: 실제 발자국 + 축 정렬 모서리(check_world 기준) */
function lkCenter(){for(const p of PORTS){const sx=p.town?1:p.sx,W=(lx,lz)=>{lx*=sx;return[p.x+p.dz*lx+p.dx*lz,p.z-p.dx*lx+p.dz*lz]},F=(lx,lz,q)=>{const[x,z]=W(lx,lz);lkFence(x,z,p.r+(q?Math.PI/2:0))},D=(t,lx,lz,r=0)=>{const[x,z]=W(lx,lz);for(const q of structs)if(inStruct(q,x,z,sdef({t}).bx+.2))return;if(hAt(x,z)<.95)return;addStruct({t,x,z,r})};
  if(p.town){for(let lx=-13.75;lx<14;lx+=2.5)if(Math.abs(lx)>4)F(lx,-21);for(const s of[-1,1])for(const lz of[-19.75,-17.25,-14.75,-9.75,-7.25,-4.75])F(s*15.25,lz,1);
   D('well',-10.5,-17.5,.2);D('towerB',10.2,-16.6);D('barrel',-12.2,-6);D('barrel',-11.3,-6.9);D('barrel',12.4,-6.2);D('barrel',7.4,-18.8);D('barrel',8.3,-19.4);D('crate',11.2,-10.6,.3);D('crate',-12.6,-12.2,-.2);D('crate',-6.6,-18.6,.5)}
  else if(p.i%2===0){for(const lx of[1.25,3.75,6.25,8.75])F(lx,-12.5);for(const lz of[-11.25,-8.75])F(10,lz,1);D('barrel',8.6,-11.2);D('crate',6.9,-11)}}}
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
 {const p=[];for(let a=0;a<9;a++)p.push(lkBoulder(.2,a%2?0xdedbd6:0xcdc9c4,a,[Math.cos(a*.698)*.74,-.02,Math.sin(a*.698)*.74]));for(let a=0;a<3;a++)p.push(pt(cyl(.1,.11,1.15,7),a%2?0x9a5a30:0x8a4e28,[0,.14,0],[Math.PI/2,0,a*1.05+.3]));
  lkModel('lk_fire',p,{}, {flame:[0,.2,0],smoke:[0,1.5,0]});Object.assign(BUILDS.fire,{g:'lk_fire',s:1,outdoor:1})}
 {const p=[pt(lkRb(.84,.66,.62,.12,.05),DKM,[0,.55,0]),pt(lkRb(.94,.08,.72,.035,.03),0x2c3038,[0,.9,0]),pt(lkRb(.94,.08,.72,.035,.03),0x2c3038,[0,.2,0]),pt(lkRb(.5,.42,.05,.08,.02),0x2c3038,[0,.55,.31]),pt(lkRb(.08,.06,.06,.02,.015),ST,[.2,.55,.36]),
   pt(cyl(.1,.1,1.5,8),0x565c68,[.22,1.65,-.12]),pt(cyl(.13,.13,.08,8),0x2c3038,[.22,.96,-.12]),pt(cone(.2,.14,8),0x2c3038,[.22,2.46,-.12])];for(const x of[-.34,.34])for(const z of[-.24,.24])p.push(pt(lkRb(.09,.2,.09,.03,.02),0x2c3038,[x,.09,z]));
  lkModel('lk_stove',p,{fire:{g:[pt(lkRb(.36,.28,.03,.06,.01),0xffa24a,[0,.55,.345]),pt(lkRb(.2,.14,.02,.04,.008),0xffe08a,[0,.52,.36])],pv:[0,0,0],glow:true}},{smoke:[.22,2.6,-.12],heat:[0,.6,.5]})}
 lkModel('lk_sign',[pt(lkRb(.15,1.5,.15,.05,.03),WD2,[0,.75,0]),pt(lkRb(1.3,.8,.12,.1,.04),0xdb9659,[0,1.5,.06]),pt(lkRb(1.08,.58,.04,.07,.015),0xf3e3bd,[0,1.5,.125])],{},{text:[0,1.5,.16]});
 {const SO=0x6b4636,SO2=0x7a5240,p=[pt(box(2.76,.2,2.76),SO,[0,.16,0])],an={};for(const sz of[-1,1])p.push(pt(lkRb(3.0,.34,.2,.06,.04),WD,[0,.17,sz*1.4]));for(const sx of[-1,1])p.push(pt(lkRb(.2,.34,3.0,.06,.04),0xc47d45,[sx*1.4,.17,0]));
  for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(lkRb(.26,.42,.26,.06,.04),WD2,[sx*1.4,.21,sz*1.4]));
  for(let i=0;i<9;i++){const x=(i%3-1)*.86,z=((i/3|0)-1)*.86;p.push(pt(new THREE.SphereGeometry(.24,8,5),SO2,[x,.25,z],0,[1,.3,1]));an['p'+i]=[x,.3,z]}lkModel('lk_garden',p,{},an)}
 {const RD=0xdb4a3e,p=[pt(lkRb(1.1,.6,.7,.12,.05),RD,[0,.5,0]),pt(lkRb(1.2,.1,.8,.04,.03),0x2c3038,[0,.14,0]),pt(cyl(.26,.26,.74,10),0xc23c32,[.18,.5,0],[Math.PI/2,0,0]),pt(cyl(.09,.09,.06,8),0xe9c046,[-.3,.83,.1]),pt(lkRb(.34,.24,.04,.04,.015),0x2c3038,[-.3,.52,.36]),
   pt(cyl(.06,.06,.5,6),ST,[-.45,1.0,-.2]),pt(cyl(.09,.07,.14,6),0x2c3038,[-.45,1.3,-.2])];for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(cyl(.04,.04,.95,6),0x2c3038,[sx*.66,.5,sz*.42]));for(const sz of[-1,1])p.push(pt(cyl(.04,.04,1.36,6),0x2c3038,[0,.97,sz*.42],[0,0,Math.PI/2]));
  for(const sx of[-1,1])p.push(pt(cyl(.04,.04,.88,6),0x2c3038,[sx*.66,.97,0],[Math.PI/2,0,0]));
  lkModel('lk_gen',p,{led:{g:[pt(cyl(.035,.035,.03,8),0x7cf08a,[-.38,.56,.385],[Math.PI/2,0,0]),pt(lkRb(.14,.05,.02,.02,.006),0xffd35c,[-.26,.48,.385])],pv:[0,0,0],glow:true}},{exhaust:[-.45,1.45,-.2]});Object.assign(BUILDS.gen,{g:'lk_gen',s:1})}
 {const TL=0x2fa7a0,p=[pt(lkRb(.92,.66,.62,.1,.05),TL,[0,.4,0]),pt(lkRb(.98,.12,.68,.05,.03),0x268a85,[0,.74,0]),pt(cyl(.07,.07,.12,8),0xdb4a3e,[-.26,.85,0]),pt(cyl(.07,.07,.12,8),0x2c3038,[.26,.85,0]),pt(lkRb(.5,.06,.08,.03,.02),0x2c3038,[0,.98,0]),pt(lkRb(.05,.2,.08,.02,.015),0x2c3038,[-.24,.9,0]),pt(lkRb(.05,.2,.08,.02,.015),0x2c3038,[.24,.9,0]),pt(lkRb(.6,.26,.03,.04,.012),0x1f4f4c,[0,.4,.315])];
  lkModel('lk_battery',p,{charge:{g:[0,1,2,3].map(i=>pt(lkRb(.1,.17,.02,.025,.006),i<3?0x7cf08a:0x3f6f6a,[-.2+i*.133,.4,.33])),pv:[0,0,0],glow:true}},{spark:[0,.95,0]})}
 lkModel('lk_sprinkler',[pt(cyl(.26,.3,.1,10),0x4a8fd6,[0,.05,0]),pt(cyl(.07,.08,.62,8),ST,[0,.4,0]),pt(cyl(.1,.1,.08,8),0x4a8fd6,[0,.72,0])],
  {head:{g:[pt(cyl(.045,.045,.6,6),ST,[0,.06,0],[0,0,Math.PI/2]),pt(new THREE.SphereGeometry(.09,8,6),0x4a8fd6,[0,.06,0]),pt(cone(.06,.14,6),0xdb5a4c,[.3,.1,0],[0,0,-.6]),pt(cone(.06,.14,6),0xdb5a4c,[-.3,.1,0],[0,0,.6])],pv:[0,.76,0]}},{spray:[0,.9,0]})}

function lkBuildGeo(){
 LK_COT.forEach((c,i)=>{GEO['lk_cotA_'+i]=lkCottage(2.9,3.0,2.15,1.3,c[0],c[1],c[2]);GEO['lk_cotB_'+i]=lkCottage(3.3,4.0,2.35,1.45,c[0],c[1],c[2])});
 Object.assign(DECO.home_A,{g:'lk_cotA_0',s:1});Object.assign(DECO.home_B,{g:'lk_cotB_1',s:1});Object.assign(BUILDS.home,{g:'lk_cotA_3',s:1});
 GEO.mtent=lkTent();GEO.lk_logs=lkLogs();GEO.lk_stones=lkStones();GEO.lk_berry=lkBerry();GEO.can=lkCan();GEO.axe_m=lkAxe();
 ITEMS.wood.ic='lk_logs';ITEMS.stone.ic='lk_stones';ITEMS.berry.ic='lk_berry';
 lkBuildStage1();if(LK_MOOD){lkBuildTown();lkFenceGeo()}lkBuildStage2();
 if(LK_MOOD)for(const k in GEO)if(/^lk_/.test(k)||k==='mtent'||k==='can'||k==='axe_m')lkSmooth(GEO[k],50);
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
  for(const id in BUILDS)if(!ICON[id]&&GEO[BUILDS[id].g])ICON[id]=lkIconFrom(GEO[BUILDS[id].g],[.42,-.62,0],'build')}
 finally{if(LKR){LKR.r.dispose();LKR.r.forceContextLoss();LKR=null}}
 try{if(S&&S.quick&&typeof drawQuick==='function')drawQuick();hudDirty=true}catch(e){}}

/* ---------- 분위기 (LK_MOOD) ---------- */
/* 매끈한 음영: 같은 자리의 꼭짓점끼리 노멀을 평균 (각도 deg 이상 꺾인 모서리는 그대로 또렷하게) */
function lkSmooth(g,deg){const P=g.attributes.position,n=P.count;if(!n||n%3)return;const fn=new Float32Array(n*3),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<n;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1).sub(a);c.fromBufferAttribute(P,i+2).sub(a);b.cross(c);b.divideScalar(b.length()||1);for(let k=0;k<3;k++){fn[(i+k)*3]=b.x;fn[(i+k)*3+1]=b.y;fn[(i+k)*3+2]=b.z}}
 const map=new Map(),Q=1e4;for(let i=0;i<n;i++){const k=Math.round(P.getX(i)*Q)+','+Math.round(P.getY(i)*Q)+','+Math.round(P.getZ(i)*Q);let L=map.get(k);if(!L)map.set(k,L=[]);L.push(i)}
 const cs=Math.cos(deg*Math.PI/180),out=new Float32Array(n*3);
 map.forEach(L=>{for(const i of L){let x=0,y=0,z=0;for(const j of L)if(fn[i*3]*fn[j*3]+fn[i*3+1]*fn[j*3+1]+fn[i*3+2]*fn[j*3+2]>=cs){x+=fn[j*3];y+=fn[j*3+1];z+=fn[j*3+2]}const l=Math.hypot(x,y,z)||1;out[i*3]=x/l;out[i*3+1]=y/l;out[i*3+2]=z/l}});
 g.setAttribute('normal',new THREE.BufferAttribute(out,3))}
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

/* ---------- 연결: 기존 함수 감싸기 ---------- */
/* makeIcons는 ui.js(이 파일 뒤)에 있어서, boot()가 buildProc을 부를 때(ui.js가 다 읽힌 뒤) 감싸요 */
{const _bp=buildProc;buildProc=function(){_bp();try{lkBuildGeo()}catch(e){console.error('look: 모델 만들기 실패',e)}
 if(!buildProc.lkIc&&typeof makeIcons==='function'){buildProc.lkIc=1;const _mi=makeIcons;makeIcons=function(){_mi();try{lkIcons()}catch(e){console.error('look: 아이콘 실패',e)}}}}}
{const _ue=updEnv;updEnv=function(dt,px,pz){_ue(dt,px,pz);try{lkMood()}catch(e){}}}
if(LK_MOOD){const _bpo=buildPorts;buildPorts=function(){_bpo();try{lkSupplyFence();lkCenter()}catch(e){console.error('look: 철조망 실패',e)}}}
if(LK_MOOD){pierGeo=lkPier;quayGeo=lkQuay;const _pg=buildPortGeo;buildPortGeo=function(){_pg();try{lkPortGeo()}catch(e){console.error('look: 항구 모델 실패',e)}}}
{const _bd=buildDressGeo;buildDressGeo=function(){_bd();if(LK_MOOD)try{lkNature()}catch(e){console.error('look: 자연 모델 실패',e)}}}
{const _bt=buildTerrain;buildTerrain=function(){_bt();if(LK_MOOD)try{water.material.uniforms.cS.value.setHex(0x4a84ec).convertSRGBToLinear();water.material.uniforms.cD.value.setHex(0x2346b4).convertSRGBToLinear()}catch(e){}}}
{const _ir=initRenderer;initRenderer=function(){_ir();if(LK_MOOD)R.toneMappingExposure=1.06}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{lkHouseVar(r);lkAttach(r)}catch(e){console.error('look: 구조물 부품 실패',e)}return r}}
/* 문 부품 움직이기: 나(또는 멀티의 다른 플레이어)가 문 1.9m 안에 오면 앞쪽(+z)으로 열리고, 멀어지면 닫혀요.
   문은 원래 플레이어가 지나갈 수 있어서(blocked) 모양만 맞춰 줘요. 적은 문을 못 지나가니 열리지 않아요 */
function lkGates(dt){const ps=[P];if(typeof NET!=='undefined'&&NET.on)NET.players.forEach(p=>{if(p.hp>0)ps.push(p)});const k=Math.min(1,dt*8);
 for(const s of structs){const d=s.lk&&s.lk.parts.door;if(!d||Math.abs(s.x-P.x)>45||Math.abs(s.z-P.z)>45)continue;const t=ps.some(p=>Math.abs(p.x-s.x)<1.9&&Math.abs(p.z-s.z)<1.9)?-1.5:0;if(Math.abs(t-d.rotation.y)>.002)d.rotation.y+=(t-d.rotation.y)*k}}
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{lkGates(dt)}catch(e){}}}
