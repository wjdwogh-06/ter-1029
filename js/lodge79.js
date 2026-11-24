/* ===== 79차(규칙, 기획자 11-24 22:08): 해달섬 끝 산장 =====
   기획자: '오른쪽 맨 위 조그마한 섬(해달섬) 끝에는 산장을 만들어 줘, 오두막 형태로. 안에 들어가면 랜덤 상자를 파는 산장 주인, 내부도 아기자기하게'.
   - 자리: 해달섬 땅 중 돌다리(띠섬 쪽) 끝에서 가장 먼 곳(동쪽 끝)에 산장이 통째로 들어가고 앞이 트인 평평한 땅(lg79Spot, 새 게임마다 같은 자리). 정면 +z.
   - 바깥: 돌 기단 + 통나무 벽(모서리 통나무 끝) + 눈 쌓인 가파른 박공지붕(고드름) + 돌 굴뚝(연기) + 앞 차양 현관·계단·등 둘 + 초록 덧창 창 둘(밤에 빛) + 박공 둥근 창·산 그림 간판,
     옆에 장작 더미·스키·썰매. [산장 들어가기] → 텐트처럼 안으로(내 기지 S.home은 안 바뀜, cave.js caveEnter와 같은 방식).
   - 안(INT_ROOM.lodge 8.8×6.8m + 앞 통로·문): 나무 마루·통나무 벽, 왼쪽 돌 벽난로(불꽃)·소파·둥근 탁자·흔들의자·러그·잠자는 고양이, 가운데 눈 덮인 창·커튼,
     오른쪽 가게(선반에 랜덤 상자들, 계산대·금전 등록기·종), 앞 왼쪽 작은 크리스마스 트리·선물, 오른쪽 벽 목도리·모자 걸이·장화, 벽 위 색 전구 줄.
   - 산장 주인(빨간 스웨터 + 털모자, Actor('fisher')): 계산대 뒤. 계산대 앞에서 오른쪽 조이스틱 톡 = [랜덤 상자 사기] 창(1개·5개, 값은 ITEMS.rbox.p 임시).
   - 둘레 설치 금지 원(산장 + 4m), 지도 점 '해달섬 산장'. 산장 안에는 아무것도 못 놓아요. 안은 따뜻해서 추위(79차 r79.js)가 없어요.
   - 멀티 서버는 산장을 몰라요(각자 화면, 서버 마무리 때). */
const LG79={x:0,z:0,s:null,R:0,hk:'lodge79',price:()=>(ITEMS.rbox&&ITEMS.rbox.p)||500,i:0,owner:null,smoke:[],fire:[]};
DECO.lodge79={g:'lg79',s:1,bx:3.9,bz:2.45,hp:1e9};
DECO.lg79_counter={g:'nil',s:1,bx:1.45,bz:1.05,pass:1,hp:1e9};
Object.assign(INT_ROOM,{lodge:{hw:4.4,hd:3.4,lc:0xffd6a2,ld:13,li:1.55,cor:[1.05,1.6]}});
if(typeof NOB_N!=='undefined')NOB_N.lodge79='산장';
const LG79_LINES=['어서 와요! 눈길 헤치고 오느라 고생했죠','랜덤 상자 하나 어때요? 뭐가 나올지는 저도 몰라요','난로 옆에서 몸 좀 녹이고 가요','밖은 추워요. 에너지가 조금씩 줄어드니 조심해요','고양이는 건드리지 마세요, 자는 중이에요','좋은 게 나오면 저한테도 자랑해 줘요'];

/* ---------- 자리 ---------- */
function lg79Spot(){const I=ISL.find(i=>i.n==='해달섬');if(!I)return null;const B=[845.5,64.5];let best=null,bd=-1;
 for(let z=Math.floor(I.z-I.br);z<=I.z+I.br;z++)for(let x=Math.floor(I.x-I.br);x<=I.x+I.br;x++){if(islAt(x,z)!==I||hAt(x,z)<1.0)continue;const d=dist(x,z,B[0],B[1]);if(d<=bd)continue;
  let ok=true,lo=1e9,hi=-1e9;for(let u=-5;u<=5&&ok;u+=1.25)for(let v=-3.6;v<=7;v+=1){const h=hAt(x+u,z+v);if(h<1.0||islAt(x+u,z+v)!==I){ok=false;break}if(Math.abs(u)<=4&&v<=3.8){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
  if(!ok||hi-lo>.22)continue;bd=d;best=[x,z]}
 return best}

/* ---------- 바깥 모양 ---------- */
function lg79Geo(){const p=[],gl=[],R=(w,h,d,c=.04,b=.02)=>lkRb(w,h,d,c,b),W=3.0,D=2.3,Y0=.45,NL=9,LR=.15,LS=.285;
 const LOG=[0xa8683a,0x9a5e33,0xb47340],END=0xe0b07a,RING=0xc18b55,STN=[0x9aa1a8,0x7f868d,0xa9aeb3,0x8a9097],SNOW=0xf3f7fb,SNOW2=0xdfe8f1,DK=0x4a2e1c,CRM=0xf4ead6;
 /* 돌 기단 */
 p.push(pt(box(2*W+.3,Y0,2*D+.3),STN[1],[0,Y0/2,0]));
 for(let i=0;i<9;i++)for(let j=0;j<2;j++){const x=-W+.35+i*.7+(j?.35:0);if(x>W)continue;p.push(pt(R(.62,.19,.08,.04,.03),STN[(i+j*2)%4],[x,.13+j*.21,D+.17]))}
 for(const sx of[-1,1])for(let i=0;i<7;i++)for(let j=0;j<2;j++)p.push(pt(R(.08,.19,.6,.04,.03),STN[(i+j+1)%4],[sx*(W+.17),.13+j*.21,-D+.35+i*.68+(j?.3:0)]));
 /* 통나무 벽: 앞·뒤는 x 방향, 옆은 z 방향(반 칸 엇갈림), 모서리에 통나무 끝 */
 for(let i=0;i<NL;i++){const y=Y0+LR+i*LS;for(const sz of[-1,1]){p.push(pt(cyl(LR,LR,2*W+.5,10),LOG[i%3],[0,y,sz*D],[0,0,Math.PI/2]));for(const sx of[-1,1])p.push(pt(cyl(LR*.92,LR*.92,.02,10),END,[sx*(W+.26),y,sz*D],[0,0,Math.PI/2]),pt(cyl(LR*.5,LR*.5,.022,8),RING,[sx*(W+.262),y,sz*D],[0,0,Math.PI/2]))}
  if(i<NL-1)for(const sx of[-1,1]){const y2=y+LS/2;p.push(pt(cyl(LR,LR,2*D+.5,10),LOG[(i+1)%3],[sx*W,y2,0],[Math.PI/2,0,0]));for(const sz of[-1,1])p.push(pt(cyl(LR*.92,LR*.92,.02,10),END,[sx*W,y2,sz*(D+.26)],[Math.PI/2,0,0]),pt(cyl(LR*.5,LR*.5,.022,8),RING,[sx*W,y2,sz*(D+.262)],[Math.PI/2,0,0]))}}
 const WT=Y0+NL*LS+.02,ZF=D+LR+.01;   /* 벽 꼭대기 높이, 앞면 */
 /* 문 */
 p.push(pt(R(1.18,2.12,.1,.03,.02),DK,[0,Y0+1.06,ZF]));for(let k=0;k<4;k++)p.push(pt(R(.22,1.92,.06,.02,.01),[0xa0612f,0x96592a,0xa86834,0x9c5d2c][k],[-.36+k*.24,Y0+1.02,ZF+.05]));
 p.push(pt(box(.94,.08,.04),0x7c4a26,[0,Y0+.55,ZF+.09]),pt(box(.94,.08,.04),0x7c4a26,[0,Y0+1.55,ZF+.09]),pt(new THREE.SphereGeometry(.045,8,6),0xd9a441,[.32,Y0+1.0,ZF+.12]));
 p.push(pt(new THREE.TorusGeometry(.2,.06,6,14),0x3f6b4a,[0,Y0+1.62,ZF+.13]));for(let k=0;k<3;k++)p.push(pt(new THREE.SphereGeometry(.035,6,5),0xd8402e,[-.1+k*.1,Y0+1.45+(k%2)*.04,ZF+.16]));   /* 문 화환 */
 /* 창 둘: 크림 테·십자 창살·초록 덧창·화분 상자 */
 for(const sx of[-1,1]){const x=sx*1.85,y=Y0+1.35;p.push(pt(R(1.06,.96,.1,.03,.02),CRM,[x,y,ZF]));gl.push(pt(box(.86,.76,.02),0xffd98a,[x,y,ZF+.04]));
  p.push(pt(box(.05,.76,.03),CRM,[x,y,ZF+.07]),pt(box(.86,.05,.03),CRM,[x,y,ZF+.07]));
  for(const s2 of[-1,1]){p.push(pt(R(.32,.98,.05,.02,.01),0x3f6b4a,[x+s2*.72,y,ZF+.02]));for(let k=0;k<3;k++)p.push(pt(box(.24,.02,.02),0x2f5238,[x+s2*.72,y-.3+k*.3,ZF+.055]))}
  p.push(pt(R(.98,.2,.26,.03,.02),0x8a5632,[x,y-.6,ZF+.12]),pt(box(.9,.06,.2),SNOW,[x,y-.47,ZF+.12]));for(let k=0;k<4;k++)p.push(pt(cone(.09,.24,6),0x2f6b44,[x-.33+k*.22,y-.38,ZF+.12]),pt(new THREE.SphereGeometry(.03,6,4),0xd8402e,[x-.25+k*.22,y-.44,ZF+.22]))}
 /* 박공지붕: 마룻대는 z 방향, 앞으로 0.9m 내밈. 지붕널(짙은 빨강) + 위에 눈 + 고드름 */
 const EX=W+.55,RY=WT+2.45,ang=Math.atan2(RY-WT,EX),L=Math.hypot(EX,RY-WT)+.1,Z0=-D-.55,Z1=D+.95,ZL=Z1-Z0,ZC=(Z0+Z1)/2;
 for(const sx of[-1,1]){const cx=sx*EX/2,cy=(WT+RY)/2,n=[sx*Math.sin(ang),Math.cos(ang)];p.push(pt(box(L,.16,ZL),0x7a3b2e,[cx,cy,ZC],[0,0,-sx*ang]));
  p.push(pt(R(L-.06,.16,ZL-.04,.08,.06),SNOW,[cx+n[0]*.14,cy+n[1]*.14,ZC],[0,0,-sx*ang]));
  for(let k=0;k<3;k++)p.push(pt(box(L-.1,.05,.03),0x5e2c22,[cx-n[0]*.02,cy-n[1]*.02-.06,Z1-.02-k*.002],[0,0,-sx*ang]));
  for(let k=0;k<11;k++){const z=Z0+.3+k*(ZL-.6)/10,h=.16+((k*7)%5)*.05;p.push(pt(cone(.045,h,5),0xdff3fb,[sx*(EX+.02),WT-.06-h/2,z],[Math.PI,0,0]))}}   /* 옆 처마 고드름 */
 p.push(pt(R(.3,.22,ZL,.08,.06),SNOW,[0,RY+.1,ZC]));
 for(const sx of[-1,1]){const a=[sx*(EX+.06),WT-.04,Z1+.02],b=[0,RY+.06,Z1+.02];p.push(lkBeam(a,b,.2,.07,CRM));for(let k=1;k<6;k++){const t=k/6,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,h=.12+((k*3)%4)*.05;p.push(pt(cone(.035,h,5),0xdff3fb,[x,y-.14-h/2,Z1+.02],[Math.PI,0,0]))}}
 /* 앞 박공 판자 + 둥근 창 + 산 그림 간판 */
 {const s=new THREE.Shape();s.moveTo(-W-.1,0);s.lineTo(W+.1,0);s.lineTo(0,RY-WT-.08);s.lineTo(-W-.1,0);const g=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:false});g.translate(0,WT,D+.05);p.push(pt(g,0xb97a45));
  for(let k=-5;k<=5;k++){const x=k*.52,h=(RY-WT-.1)*(1-Math.abs(x)/(W+.1));if(h>.15)p.push(pt(box(.025,h,.02),0x8f5a30,[x,WT+h/2,D+.14]))}
  p.push(pt(new THREE.TorusGeometry(.36,.07,8,22),CRM,[0,WT+1.25,D+.16]));gl.push(pt(new THREE.CircleGeometry(.32,20),0xffd98a,[0,WT+1.25,D+.15]));p.push(pt(box(.04,.62,.03),CRM,[0,WT+1.25,D+.18]),pt(box(.62,.04,.03),CRM,[0,WT+1.25,D+.18]));
  p.push(pt(R(1.7,.5,.08,.04,.02),0x7c4a26,[0,WT+.42,D+.17]),pt(R(1.56,.38,.04,.03,.01),0x5d8fc4,[0,WT+.42,D+.22]));
  for(const [x,h,w] of[[-.35,.24,.34],[.05,.3,.4],[.42,.2,.3]]){const t=new THREE.Shape();t.moveTo(-w/2,0);t.lineTo(w/2,0);t.lineTo(0,h);t.lineTo(-w/2,0);const g2=new THREE.ShapeGeometry(t);g2.translate(x,WT+.25,D+.245);p.push(pt(g2,0xf4f1ea))}}
 /* 돌 굴뚝 */
 {const cx=1.6,cz=-1.1,top=RY+.9;for(let y=WT-.4,k=0;y<top;y+=.3,k++)p.push(pt(R(.78,.3,.78,.04,.03),STN[k%4],[cx,y+.15,cz]));p.push(pt(R(.92,.14,.92,.04,.03),0x6f757c,[cx,top+.07,cz]),pt(R(.86,.12,.86,.06,.05),SNOW,[cx,top+.2,cz]));LG79.chim=[cx,top+.35,cz]}
 /* 앞 차양 현관: 데크 + 계단 + 기둥 둘 + 작은 지붕(눈) + 난간 + 등 둘 */
 {const PW=1.55,PZ0=ZF,PZ1=D+1.35;p.push(pt(box(2*PW,.16,PZ1-PZ0+.1),0x9a6a42,[0,.2,(PZ0+PZ1)/2]));for(let k=0;k<5;k++)p.push(pt(box(2*PW,.012,.012),0x6e4426,[0,.285,PZ0+.2+k*.22]));
  p.push(pt(box(1.5,.1,.32),0x8f6038,[0,.06,PZ1+.18]));
  for(const sx of[-1,1]){for(const z of[PZ0+.15,PZ1-.12])p.push(pt(cyl(.06,.07,.75,8),0x8a5632,[sx*(PW-.08),.62,z]),pt(new THREE.SphereGeometry(.08,8,6),SNOW,[sx*(PW-.08),1.0,z]));p.push(pt(box(.07,.07,PZ1-PZ0),0x7a4a28,[sx*(PW-.08),.92,(PZ0+PZ1)/2]),pt(box(.05,.05,PZ1-PZ0),0x7a4a28,[sx*(PW-.08),.6,(PZ0+PZ1)/2]),pt(box(.1,.05,PZ1-PZ0),SNOW,[sx*(PW-.08),.98,(PZ0+PZ1)/2]))}   /* 현관 난간(지붕 처마가 현관을 덮어요) */
  for(const sx of[-1,1]){p.push(pt(box(.06,.06,.22),0x2c2f33,[sx*.85,Y0+1.62,ZF+.1]),pt(R(.18,.26,.18,.03,.02),0x2c2f33,[sx*.85,Y0+1.5,ZF+.24]));gl.push(pt(box(.13,.18,.13),0xffc46a,[sx*.85,Y0+1.5,ZF+.24]))}}
 /* 옆 장작 더미(왼쪽) · 스키·썰매(오른쪽) · 눈 둔덕 */
 for(let r=0;r<4;r++)for(let c=0;c<5-(r>2?1:0);c++){const x=-W-.62+c*.0,z=-.2+c*.36+(r%2)*.18,y=.17+r*.3;p.push(pt(cyl(.15,.15,.9,8),LOG[(r+c)%3],[-W-.7,y,z+.3],[0,0,Math.PI/2]),pt(cyl(.14,.14,.02,8),END,[-W-.25,y,z+.3],[0,0,Math.PI/2]))}
 p.push(pt(R(1.0,.12,2.0,.05,.04),SNOW,[-W-.7,1.33,.95]),pt(box(1.0,.06,2.0),0x7a4a28,[-W-.7,1.22,.95]));
 for(const k of[0,1]){p.push(pt(R(.09,1.7,.03,.02,.01),k?0xe0533f:0x3f7fd0,[2.62+k*.16,1.08,ZF+.25],[-.18,0,.05]));p.push(pt(cyl(.012,.012,1.3,5),0x9aa3ab,[2.95+k*.08,.8,ZF+.3],[-.2,0,-.08]))}
 p.push(pt(R(.55,.08,1.25,.03,.02),0xd2553f,[W+.55,.32,.9]),pt(box(.05,.16,1.3),0x6e4426,[W+.32,.2,.9]),pt(box(.05,.16,1.3),0x6e4426,[W+.78,.2,.9]),pt(R(.5,.1,1.15,.05,.04),SNOW,[W+.55,.42,.85]));
 for(const [x,z,s] of[[-W-.3,D+.3,.6],[W+.25,D+.35,.5],[-W-1.2,-.9,.7],[W+.9,-.6,.6]])p.push(pt(new THREE.SphereGeometry(s,10,6),SNOW2,[x,0,z],[0,0,0],[1,.32,1]));
 GEO.lg79=mg(p);GEO.lg79_glow=mg(gl)}

/* ---------- 안 모양 ---------- */
function lg79RoomGeo(){const R0=INT_ROOM.lodge,W=R0.hw,D=R0.hd,CW=R0.cor[0],CL=R0.cor[1],p=[],gl=[],R=(w,h,d,c=.04,b=.02)=>lkRb(w,h,d,c,b),WH=2.6;
 const FL=[0xb57a48,0xa86e3f,0xc0844f,0xb07443],LOG=[0xb47844,0xa96d3b,0xbd8250],CRM=0xf4ead6;
 /* 마루 + 통로 */
 const nb=Math.round(2*D/.3);for(let i=0;i<nb;i++){const z=-D+(i+.5)*2*D/nb;p.push(pt(box(2*W,.06,2*D/nb-.02),FL[i%4],[0,-.03,z]))}p.push(pt(box(2*W,.05,2*D),0x6e4426,[0,-.09,0]));
 for(let i=0;i<Math.ceil(CL/.3);i++)p.push(pt(box(2*CW,.06,.28),FL[(i+1)%4],[0,-.03,D+.15+i*.3]));for(const sd of[-1,1])p.push(pt(box(.06,.05,CL),0x5e3820,[sd*(CW+.03),.025,D+CL/2]));
 /* 통나무 벽(뒤·양옆) + 뒤 모서리 통나무 끝 + 위 갓 */
 for(let y=.14,i=0;y<WH;y+=.27,i++){p.push(pt(cyl(.14,.14,2*W+.3,10),LOG[i%3],[0,y,-D-.13],[0,0,Math.PI/2]));for(const sx of[-1,1]){p.push(pt(cyl(.14,.14,2*D+.3,10),LOG[(i+1)%3],[sx*(W+.13),y,-.0],[Math.PI/2,0,0]));p.push(pt(cyl(.13,.13,.02,10),0xe0b07a,[sx*(W+.13),y,-D-.29],[Math.PI/2,0,0]))}}
 p.push(pt(box(2*W+.4,.08,.34),0x7c4a26,[0,WH+.02,-D-.13]));for(const sx of[-1,1])p.push(pt(box(.34,.08,2*D+.3),0x7c4a26,[sx*(W+.13),WH+.02,0]));
 /* 뒤 가운데 창: 눈 덮인 산 풍경(빛) + 테·창살 + 빨간 체크 커튼 + 창턱 화분·초 */
 {const x=.2,y=1.45,w=1.5,h=1.05;gl.push(pt(box(w,h,.01),0xbfdff2,[x,y+.12,-D+.02]),pt(box(w,h*.42,.012),0xf6fafc,[x,y-h*.3,-D+.025]));
  for(const [ox,hh,ww] of[[-.35,.45,.7],[.25,.6,.8]]){const s=new THREE.Shape();s.moveTo(-ww/2,0);s.lineTo(ww/2,0);s.lineTo(0,hh);s.lineTo(-ww/2,0);const g=new THREE.ShapeGeometry(s);g.translate(x+ox,y-h*.15,-D+.03);gl.push(pt(g,0x9bc2dc))}
  p.push(pt(R(w+.16,h+.16,.08,.03,.02),CRM,[x,y,-D+.0]),pt(box(.05,h,.04),CRM,[x,y,-D+.05]),pt(box(w,.05,.04),CRM,[x,y,-D+.05]),pt(R(w+.3,.08,.22,.03,.02),0x8a5632,[x,y-h/2-.08,-D+.1]));
  for(const sx of[-1,1])for(let k=0;k<6;k++)p.push(pt(box(.13,h+.35,.04),k%2?0xd2553f:0xf4ead6,[x+sx*(w/2+.12+(k%3)*.13),y+.05,-D+.1+(k>2?.01:0)]));
  p.push(pt(cyl(.07,.06,.14,10),0xc96b3c,[x-.4,y-h/2+.03,-D+.12]),pt(new THREE.SphereGeometry(.1,8,6),0x4f9a4a,[x-.4,y-h/2+.17,-D+.12]),pt(cyl(.03,.03,.14,8),0xf4f1ea,[x+.45,y-h/2+.03,-D+.12]));gl.push(pt(new THREE.SphereGeometry(.03,6,4),0xffc46a,[x+.45,y-h/2+.13,-D+.12]))}
 /* 벽 위 색 전구 줄 */
 for(let k=0;k<26;k++){const x=-W+.2+k*(2*W-.4)/25,y=WH-.2-Math.abs(Math.sin(k*.62))*.12;gl.push(pt(new THREE.SphereGeometry(.045,6,4),[0xff6b5e,0xffd34d,0x6bd38a,0x6bb7ff,0xd98bff][k%5],[x,y,-D+.03]))}
 /* 오른쪽 가게: 뒤 선반 + 랜덤 상자들, 계산대 */
 {const x0=1.5,x1=W-.15,cx=(x0+x1)/2,sw=x1-x0;for(const x of[x0,x1])p.push(pt(box(.06,2.1,.42),0x7c4a26,[x,1.05,-D+.23]));
  for(const y of[.45,1.05,1.65,2.1])p.push(pt(box(sw,.05,.42),0x9a6a42,[cx,y,-D+.23]));
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=x0+.36+c*(sw-.72)/3,y=[.47,1.07,1.67][r]+.03;if((r+c)%3===2){p.push(pt(cyl(.09,.09,.22,10),[0xd96b4a,0x6bb7d6,0xe8c35a][c%3],[x,y+.11,-D+.25]),pt(cyl(.095,.095,.04,10),0xf4ead6,[x,y+.24,-D+.25]))}else LG79.boxes=(LG79.boxes||[]).concat([[x,y,-D+.25]])}
  p.push(pt(R(sw+.1,.95,.62,.03,.02),0x9a5e33,[cx,.475,-1.6]),pt(R(sw+.22,.07,.72,.03,.02),0x6e4426,[cx,.985,-1.6]));
  for(let k=0;k<5;k++)p.push(pt(box(.02,.8,.02),0x7c4a26,[x0+.3+k*(sw-.6)/4,.45,-1.6+.32]));
  p.push(pt(R(.42,.26,.34,.03,.02),0x5a616a,[x1-.45,1.15,-1.62]),pt(box(.36,.06,.2),0x3d4249,[x1-.45,1.3,-1.68],[-.35,0,0]));gl.push(pt(box(.2,.07,.01),0x8fe3b0,[x1-.45,1.3,-1.45]));
  p.push(pt(cyl(.07,.09,.05,12),0xd9a441,[x0+.35,1.04,-1.55]),pt(new THREE.SphereGeometry(.06,10,6,0,Math.PI*2,0,Math.PI/2),0xd9a441,[x0+.35,1.06,-1.55]));
  p.push(pt(cyl(.1,.1,.22,12),0xdff1f6,[x0+.75,1.13,-1.6]));for(let k=0;k<7;k++)p.push(pt(new THREE.SphereGeometry(.03,6,4),[0xff6b5e,0xffd34d,0x6bd38a,0xd98bff][k%4],[x0+.7+(k%3)*.04,1.06+((k/3)|0)*.05,-1.6+(k%2)*.04]))}
 /* 왼쪽 거실: 러그(빨강·크림 무늬) + 장작 바구니 + 잠자는 고양이 + 벽 사슴뿔 판 */
 {const x=-2.4,z=-.55,w=2.6,d=1.9;p.push(pt(R(w,.025,d,.3,.012),0xb8423a,[x,.012,z]),pt(R(w-.28,.03,d-.28,.25,.012),0xf1e2c4,[x,.015,z]),pt(R(w-.6,.035,d-.6,.2,.012),0xb8423a,[x,.018,z]));
  for(let k=-2;k<=2;k++)p.push(pt(box(.16,.04,.16),k%2?0x3f6b4a:0xf1e2c4,[x+k*.36,.02,z],[0,Math.PI/4,0]))}
 for(let k=0;k<5;k++)p.push(pt(cyl(.07,.07,.5,8),[0xa8683a,0x9a5e33,0xb47340][k%3],[-.85+(k%3)*.12,.12+((k/3)|0)*.12,-2.85+(k%2)*.1],[0,0,Math.PI/2]));p.push(pt(cyl(.32,.26,.26,12),0x8a6a3e,[-.75,.13,-2.85]));
 {const C=0xe8964a,C2=0xf6d9b0,x=-1.55,z=-1.75;p.push(pt(new THREE.SphereGeometry(.2,12,8),C,[x,.12,z],[0,0,0],[1.25,.55,1]),pt(new THREE.SphereGeometry(.12,10,8),C,[x+.25,.13,z+.05]),pt(new THREE.SphereGeometry(.09,8,6),C2,[x+.05,.08,z+.15],[0,0,0],[1.3,.5,1]));
  for(const s of[-1,1])p.push(pt(cone(.045,.09,4),C,[x+.27+s*.06,.24,z+.04]));p.push(pt(cyl(.035,.03,.36,6),C,[x-.18,.06,z+.16],[Math.PI/2,0,.9]));for(let k=0;k<3;k++)p.push(pt(box(.06,.012,.1),0xc8783a,[x-.05+k*.1,.2,z],[0,.3,0]))}
 p.push(pt(R(.7,.5,.06,.05,.02),0x7c4a26,[-W+.04,1.9,1.3],[0,Math.PI/2,0]));for(const s of[-1,1]){p.push(lkRod([-W+.12,1.95,1.3],[-W+.3,2.25,1.3+s*.25],.035,0xefe3c8));p.push(lkRod([-W+.3,2.25,1.3+s*.25],[-W+.34,2.45,1.3+s*.42],.03,0xefe3c8));p.push(lkRod([-W+.25,2.15,1.3+s*.2],[-W+.36,2.3,1.3+s*.08],.025,0xefe3c8))}
 /* 오른쪽 벽: 옷걸이(목도리·모자) + 장화, 앞 문간 깔개 */
 {const x=W-.05;p.push(pt(box(.06,.12,1.6),0x7c4a26,[x,1.7,1.4]));for(let k=0;k<4;k++){const z=.8+k*.4;p.push(pt(cyl(.02,.02,.14,6),0x5a616a,[x-.08,1.72,z],[0,0,Math.PI/2]));
  if(k%2===0){for(let j=0;j<5;j++)p.push(pt(box(.05,.7,.2),j%2?0xf4ead6:[0xd2553f,0x3f7fd0][k/2],[x-.15,1.32,z],[0,0,0]))}else{p.push(pt(new THREE.SphereGeometry(.15,10,6,0,Math.PI*2,0,Math.PI/2),[0x5bae5f,0xf7c948][(k-1)/2],[x-.2,1.6,z]),pt(new THREE.SphereGeometry(.06,8,6),0xffffff,[x-.2,1.78,z]))}}
  for(let k=0;k<2;k++)p.push(pt(R(.16,.3,.28,.05,.03),0x3d2a1c,[x-.2,.15,1.0+k*.24]),pt(R(.18,.08,.34,.04,.02),0x2a1c12,[x-.2,.04,1.04+k*.24]))}
 p.push(pt(R(1.1,.02,.6,.08,.01),0x8a6a3e,[0,.012,D-.5]));for(let k=0;k<5;k++)p.push(pt(box(.95,.004,.03),0x6e4426,[0,.024,D-.72+k*.11]));
 const H=new THREE.Group(),M=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true}));M.receiveShadow=true;H.add(M);
 H.add(new THREE.Mesh(mg(gl),new THREE.MeshBasicMaterial({vertexColors:true})));
 /* 게임에 있던 가구 모양을 그대로: 돌 벽난로(+불꽃), 소파, 둥근 탁자, 흔들의자, 랜덤 상자, 크리스마스 트리 */
 const put=(k,x,y,z,ry=0,s=1)=>{if(!GEO[k])return null;const m=mesh(GEO[k],MATT);m.position.set(x,y,z);m.rotation.y=ry;m.scale.setScalar(s);H.add(m);return m};
 put('lk_fireplace',-2.4,0,-D+.34);put('lk_sofa',-W+.48,0,-.5,Math.PI/2,.95);put('lk_table_round',-2.35,0,-.45,0,.62);put('lk_chair',-1.2,0,-.85,-Math.PI/2+.35,.95);
 put('dc_xmas_tree',-W+.75,0,D-.85,0,.75);put('dc_rbox',2.35,1.0,-1.55,-.25,.6);for(const b of LG79.boxes||[])put('dc_rbox',b[0],b[1],b[2],((b[0]*7)%1)-.5,.42);LG79.boxes=[];
 for(const [x,z,c] of[[-W+1.25,D-.55,0xd2553f],[-W+.35,D-.4,0x3f7fd0],[-W+1.0,D-.25,0xf7c948]]){const g=mg([pt(R(.3,.24,.3,.03,.02),c,[0,.12,0]),pt(box(.32,.04,.06),0xf4ead6,[0,.2,0]),pt(box(.06,.04,.32),0xf4ead6,[0,.2,0])]);const m=new THREE.Mesh(g,MATT);m.position.set(x,0,z);m.rotation.y=x;H.add(m)}
 for(const sx of[-1,1]){const m=new THREE.Mesh(mg([pt(cyl(.05,.05,.12,8),0x2c2f33,[0,0,0])]),MATT);m.position.set(-2.4+sx*1.15,1.95,-D+.06);H.add(m);const g2=new THREE.Mesh(mg([pt(new THREE.SphereGeometry(.07,8,6),0xffc46a,[0,.1,0])]),new THREE.MeshBasicMaterial({vertexColors:true}));g2.position.copy(m.position);H.add(g2)}
 /* 불꽃: 움직이는 조각(lg79Tick) */
 const FM=new THREE.MeshBasicMaterial({vertexColors:true});LG79.fire=[];for(let k=0;k<4;k++){const f=new THREE.Mesh(mg([pt(cone(.12-k*.02,.42-k*.05,7),[0xff7a2e,0xffa23c,0xffd34d,0xff5a2a][k],[0,.2,0])]),FM);f.position.set(-2.4-.2+k*.13,.12,-D+.42);H.add(f);LG79.fire.push(f)}
 intDoor(H,D+CL);return H}
{const _ib=intBuild;intBuild=function(){const was=!!INT.g;_ib.apply(this,arguments);if(was||!INT.g)return;try{const H=lg79RoomGeo();H.visible=false;INT.g.add(H);INT.gr.lodge=H;
  const R0=INT_ROOM.lodge;INT.dock.hl=Math.max(INT.dock.hl,R0.hd+R0.cor[1]+.8);INT.full=Math.max(INT.full,R0.hw+1.2)}catch(e){console.error('79차 산장 방',e)}}}

/* ---------- 놓기(항구 다음) · 안의 부딪힘 · 설치 금지 · 지도 ---------- */
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();try{lg79Geo();if(typeof lkAOnew==='function'){const b0=Object.assign({},GEO);delete b0.lg79;lkAOnew(b0)}}catch(e){console.error('79차 산장 모양',e)}}}
{const _bp=buildPorts;buildPorts=function(){_bp.apply(this,arguments);try{lg79Place()}catch(e){console.error('79차 산장',e)}}}
function lg79Place(){const q=lg79Spot();if(!q){console.warn('산장 자리를 못 찾음');return}const [x,z]=q;LG79.x=x;LG79.z=z;CLEARS.push([x,z+.5,8.5]);
 LG79.s=addStruct({t:'lodge79',x,z,r:0,hp:1e9,hk:LG79.hk});LG79.R=Math.hypot(DECO.lodge79.bx,DECO.lodge79.bz+1.3)+4;
 const I=(t,lx,lz)=>addStruct({t,x:INT.x+lx,z:INT.z+lz,r:0,in:1,hk:LG79.hk,hp:1e9});const D=INT_ROOM.lodge.hd,W=INT_ROOM.lodge.hw;
 LG79.ctr=I('lg79_counter',2.95,-2.35);   /* 계산대(+ 뒤 주인 자리) = 상호작용 자리. 부딪힘은 lg79Walk(방 안은 intWalk만 봐요) */
 if(typeof PLACES!=='undefined')PLACES.push({k:'lodge',n:'해달섬 산장',x,z,c:'#c8643c'})}
{const _bn=buildNoBuild;buildNoBuild=function(){_bn.apply(this,arguments);if(LG79.s)NOB.push({k:'lodge79',x:LG79.x,z:LG79.z+.6,r:LG79.R})}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{if(r&&r.t==='lodge79'&&r.m&&GEO.lg79_glow&&typeof HGLOW!=='undefined'){(r.m.children[0]||r.m).add(mesh(GEO.lg79_glow,HGLOW,false));
   if(typeof PLAMPS!=='undefined')for(const [x,y,z,c,sz] of[[-.85,2.0,2.75,0xffc46a,2.2],[.85,2.0,2.75,0xffc46a,2.2],[-1.85,1.8,2.6,0xffd98a,2.6],[1.85,1.8,2.6,0xffd98a,2.6]]){const l=glow(c,sz,.55);l.position.set(x,y,z);l.visible=false;r.m.add(l);PLAMPS.push(l)}
   const SM=new THREE.SpriteMaterial({map:typeof glowTex!=='undefined'?glowTex:null,color:0xd8dde3,transparent:true,opacity:.5,depthWrite:false});LG79.smoke=[];for(let k=0;k<7;k++){const sp=new THREE.Sprite(SM.clone());sp.userData.t=k/7;r.m.add(sp);LG79.smoke.push(sp)}}}catch(e){console.error(e)}return r}}

/* ---------- 들어가기·나가기 ---------- */
function lg79Enter(s){if(P.dead||busy||INT.on)return;const df=sdef(s);
 fadeDo('산장 안으로…',()=>{intRoom('lodge');setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+df.bz+1.1};INT.s=s;INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.door-.2,yo:INT.y-hAt(INT.x,INT.z+INT.door-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+INT.door-1.75;camT.set(P.x,INT.y,P.z);P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6);sfx(520,.08,'sine',.03,.4);
  setTimeout(()=>lg79Say(LG79.i===0?0:null),700)})}
{const _sl=sLabel;sLabel=function(s){if(s.t==='lodge79')return INT.on?null:'산장 들어가기';if(s.t==='lg79_counter')return lg79In()?'랜덤 상자 사기':null;return _sl(s)}}
{const _it=interact;interact=function(){const t=target;if(t&&t.k==='s'){if(t.s.t==='lodge79'){if(inp.actEdge)lg79Enter(t.s);return}if(t.s.t==='lg79_counter'&&lg79In()){if(inp.actEdge){openPanel('lodge79');lg79Say()}return}}return _it.apply(this,arguments)}}
{const _gp=ghostPos;ghostPos=function(){const pr=_gp.apply(this,arguments);if(INT.on&&INT.kind==='lodge'){pr.ok=false;pr.why='산장 안에는 아무것도 놓을 수 없어요'}return pr}}
const lg79In=()=>INT.on&&INT.kind==='lodge';
/* 방 안 가구 부딪힘(방 가운데 기준 [x, z, 반폭x, 반폭z]): 계산대+주인 자리, 벽난로, 소파, 탁자, 흔들의자, 트리, 선물, 장작 바구니, 옷걸이·장화 */
const LG79_BLK=[[2.95,-2.35,1.45,1.05],[-2.4,-3.05,1.12,.42],[-3.92,-.5,.46,1.0],[-2.35,-.45,.36,.36],[-1.2,-.85,.3,.3],[-3.65,2.55,.55,.55],[-3.55,3.0,.65,.3],[-.75,-2.85,.4,.3],[4.15,1.4,.22,.9]];
{const _iw=intWalk;intWalk=function(x,z,r){const v=_iw.apply(this,arguments);if(v!==null||INT.kind!=='lodge')return v;const lx=x-INT.x,lz=z-INT.z,rr=r||.42;
  for(const b of LG79_BLK)if(Math.abs(lx-b[0])<b[2]+rr&&Math.abs(lz-b[1])<b[3]+rr)return true;return null}}

/* ---------- 산장 주인 ---------- */
function lg79Say(i){const L=LG79_LINES,s=L[(i!=null?i:LG79.i)%L.length];LG79.i++;if(typeof CHAT!=='undefined')CHAT.say('lg79_owner',s);else toast(s);if(LG79.owner)LG79.owner.play('Interact',{once:1,lock:.6,force:1})}
if(typeof CHAT!=='undefined'){const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){if(k==='lg79_owner'){const o=LG79.owner;return o&&lg79In()?{x:o.root.position.x,z:o.root.position.z,y:3.0}:null}return _an(k)}}
let LG79M=null;function lg79Mat(){if(LG79M)return LG79M;const src=CMAT.merchant&&CMAT.merchant.map;if(!src||typeof recolor!=='function')return null;const t=recolor(src,hueTo(isBlue,196,62,52));return LG79M={s:new THREE.MeshLambertMaterial({map:t,skinning:true}),n:new THREE.MeshLambertMaterial({map:t})}}
function lg79Hat(){if(GEO.lg79_hat)return GEO.lg79_hat;const p=[pt(new THREE.SphereGeometry(.3,14,8,0,Math.PI*2,0,Math.PI/2),0x3f7fd0,[0,0,0],[0,0,0],[1,1.15,1]),pt(cyl(.31,.31,.12,16),0xf4ead6,[0,.03,0]),pt(new THREE.SphereGeometry(.11,10,8),0xffffff,[0,.38,0])];
 for(let k=0;k<6;k++)p.push(pt(box(.05,.22,.02),0xffffff,[Math.sin(k*1.05)*.29,.18,Math.cos(k*1.05)*.29],[0,k*1.05,0]));return GEO.lg79_hat=mg(p)}
function lg79Tick(dt){const ins=lg79In();
 if(ins&&!LG79.owner&&CMAT.fisher&&lg79Mat()){const a=LG79.owner=new Actor('fisher'),M=lg79Mat();a.root.traverse(o=>{if(o.isMesh)o.material=o.isSkinnedMesh?M.s:M.n});if(a.head){const h=mesh(lg79Hat(),MATT);h.position.set(0,.98,.02);h.rotation.x=-.1;h.scale.setScalar(1.05);a.head.add(h)}a.play('Idle',{force:1});LG79.rot=0}
 const o=LG79.owner;if(o){o.root.visible=ins;if(ins){const x=INT.x+2.95,z=INT.z-2.55;o.root.position.set(x,INT.y,z);const want=dist(P.x,P.z,x,z)<6?Math.atan2(P.x-x,P.z-z):0;let df=want-LG79.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;LG79.rot+=df*Math.min(1,dt*4);o.root.rotation.y=LG79.rot;o.mixer.update(dt)}}
 if(ins){const t=performance.now()/1000;LG79.fire.forEach((f,k)=>{f.scale.set(1,.8+.25*Math.sin(t*9+k*1.7)+.1*Math.sin(t*23+k),1);f.rotation.y=t*.7+k})}
 if(LG79.s&&LG79.smoke.length&&!INT.on&&dist(P.x,P.z,LG79.x,LG79.z)<110){const c=LG79.chim;for(const sp of LG79.smoke){sp.userData.t=(sp.userData.t+dt*.16)%1;const u=sp.userData.t;sp.position.set(c[0]+Math.sin(u*5+sp.id)*.3+u*.9,c[1]+u*3.2,c[2]-u*.4);const s=.6+u*1.8;sp.scale.set(s,s,1);sp.material.opacity=.5*(1-u)*Math.min(1,u*6)}}}
{const _u=updEnv;updEnv=function(dt,x,z){_u.apply(this,arguments);try{lg79Tick(dt)}catch(e){}}}
if(typeof drawFx==='function'){const _df=drawFx;drawFx=function(dt){_df(dt);try{const o=LG79.owner;if(mode!=='play'||!o||!lg79In()||(typeof CHAT!=='undefined'&&CHAT.b&&CHAT.b.has('lg79_owner')))return;
  const s=Math.max(.8,UIS*1.25),p=scr(o.root.position.x,INT.y+3.5,o.root.position.z);if(p[2])uiPill(fctx,'산장 주인',p[0],p[1],12.5*s,'#c8643c','#fff')}catch(e){}}}

/* ---------- 랜덤 상자 사기 창 ---------- */
function lg79Html(){const pr=LG79.price(),n=invN('rbox');
 return`<div class="sec" style="margin-top:0">산장 주인이 랜덤 상자를 팔아요 · 가방에서 눌러 열면 이 게임의 모든 아이템 중 하나가 똑같은 확률로 나와요</div>`+
  `<div class="row">${invIcon('rbox')}<div class="tx">랜덤 상자<small>하나에 ${pr} 동전${n?` · 가방에 ${n}개`:''}</small></div>`+
  `<button class="btn" data-a="lg79buy" data-n="1" ${S.coins>=pr?'':'disabled'}>1개 · ${pr}</button><button class="btn" data-a="lg79buy" data-n="5" ${S.coins>=pr*5?'':'disabled'}>5개 · ${pr*5}</button></div>`}
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);if(panel!=='lodge79')return;$('ptabs').innerHTML='<div class="tab on">🏔 산장</div>';$('pbody').innerHTML=lg79Html()}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="lg79buy"]');if(!b||b.disabled||panel!=='lodge79')return;const n=+b.dataset.n||1,pr=LG79.price()*n;
 if(!bagHas('rbox')){bagFullMsg();return}if(S.coins<pr){toast('동전이 모자라요');return}S.coins-=pr;give('rbox',n);sfx(880,.07);sfx(1320,.05,'sine',.03);toast(`🎁 랜덤 상자 ×${n} 샀어요 · 가방에서 눌러 열어요`);hudDirty=true;renderPanel()});
