/* ===== 84차(규칙, 기획자 11-26 19:50): 상인 넷(낚시·식물·사냥·요리)을 큰 건물 안으로 =====
   기획자: '동북섬에서 대각선으로 가면 나오는 산장 꽤나 괜찮거든, 사냥·요리·식물·낚시 전부 내부에 들어가면 상인이 있게', '산장 내부 크기보다 훨씬 크게, 외부도 좀 크게(4배 5배 이상)',
          '낚시집은 바다 근처에 짓고 나무판, 간판이 엄청 큰 물고기', '식물은 두 번째 그림(온실 가게), 사냥꾼 상점, 요리 — 완전히 똑같이 따라 하지 말고, 크면 2층·3층처럼',
          '주변에 있던 장식물들은 과감히 없애고 그냥 각자 길 정도만 연결해 줘 구조물 있는 곳까지',
          '상점 안에 재활용 쓰레기통·랜덤 자판기·일반 자판기는 무조건, 일반 자판기는 색깔별로 3개, 벽 앞에 나란히 자연스럽게(물건은 아직 없음)'.
   - 바깥 건물 넷(정면 +z, 약 13~15 × 9~10m, 2층 + 지붕·간판): 낚시 가게(까마귀섬 서쪽 바닷가 · 바다로 뻗은 나무 잔교 · 지붕 위 커다란 물고기 간판),
     식물 가게(바람섬 식물섬 · 유리 온실 가게 · 초록 줄무늬 차양), 요리 가게(수달섬 북서 · 기와지붕·빨간 줄무늬 차양·지붕 위 커다란 프라이팬),
     사냥꾼 상점(수달섬 남동 · 짙은 통나무 2층·초록 지붕·앞 현관·큰 뿔 장식).
   - 문 앞에서 오른쪽 조이스틱 톡 = [○○ 들어가기] → 텐트처럼 안으로(내 기지 S.home은 안 바뀜, 산장과 같은 방식). 안 = 15 × 10.4m(산장 방의 약 2.6배) + 앞 통로·문.
   - 안: 왼쪽 뒤 계산대 + 상인(말 걸기), 뒤 벽 오른쪽에 자판기 줄 — 랜덤 자판기 · 재활용 쓰레기통 · 일반 자판기 셋(빨강·파랑·초록, 파는 물건은 PV84.items에 넣으면 창에 나와요, 지금은 비어 있음).
     낚시·식물 가게 안에는 예전 바깥에 있던 도감 게시판을 벽에 걸었어요. 그 밖은 테마 꾸밈(벽 쪽으로 모아서).
   - 바깥 꾸밈(낚시 캠프 오두막·훈제실·잔교·배·덕장, 식물섬 헛간·농가·풍차·온실·밭, 수달섬 부엌·텐트·오두막·활터·풍차·바위·꽃, 바깥 자판기 묶음)은 없앴어요.
     철조망·문·벽·다리는 그대로, 문에서 건물 앞까지 흙길만.
   - 멀티 서버는 건물을 몰라요(각자 화면, 서버 마무리 때). 안전 구역·설치 금지 원은 예전 그대로. */
const SH84={
 fish:{n:'낚시 가게',npc:'낚시 상인',pill:'#3f8fb7',ic:'🎣',pi:8,sc:1.15,bx:6.2,bz:4.2,dp:[0,4],ret:1.4},
 plant:{n:'식물 가게',npc:'식물섬 주인',pill:'#4f9a52',ic:'🌱',pi:9,sc:1.25,bx:7.6,bz:5.1,dp:[0,5],ret:1.3},
 cook:{n:'요리 가게',npc:'요리 상인',pill:'#e0533f',ic:'🍳',pi:10,sc:1.15,bx:6.6,bz:4.6,dp:[4.3,4.5],ret:1.4},
 hunt:{n:'사냥꾼 상점',npc:'사냥꾼 상인',pill:'#5f7a3a',ic:'🏹',pi:11,sc:1.15,bx:6.6,bz:4.6,dp:[0,4.5],ret:1.4}};
const SH84T={n:0};const SH84K={sh84_fish:'fish',sh84_plant:'plant',sh84_cook:'cook',sh84_hunt:'hunt'};   /* 방 종류 → 가게 */
const SH84R={hw:7.5,hd:5.2,lc:0xffe2b8,ld:20,li:1.5,cor:[1.15,1.7]};
for(const k in SH84){INT_ROOM['sh84_'+k]=Object.assign({},SH84R);const q=SH84[k];q.k=k;q.hk='sh84_'+k;q.room='sh84_'+k;q.i=0;
 DECO['sh84_'+k]={g:'sh84_'+k,s:q.sc,bx:q.bx*q.sc,bz:q.bz*q.sc,pass:1,hp:1e9};}   /* 모델은 미터로 만들고 sc배로 키워요(부딪힘·문·등 자리도 같이) */   /* 건물 부딪힘은 sh84Solid 조각(inStruct가 6m 안만 봐서) */
DECO.sh84_door={g:'nil',s:1,bx:1.05,bz:.32,pass:1,hp:1e9};DECO.sh84_ctr={g:'nil',s:1,bx:1.9,bz:.5,pass:1,hp:1e9};
if(typeof NOB_N!=='undefined')Object.assign(NOB_N,{});
/* 일반 자판기 셋(색깔별) — 파는 물건: [아이템 id, 묶음 개수, 가격] (가격 없으면 원래 가격 × 묶음). 기획자가 정해 주면 채우기 */
const PV84={items:{r:[],b:[],g:[]},free:0,col:'r',nm:{r:'빨간',b:'파란',g:'초록'},
 pal:{r:{B:0xe0533f,S:0xc8463a,T:0xf7f0e3,L:0xe0533f},b:{B:0x3f7fd0,S:0x356fb8,T:0xf7f0e3,L:0xf7c948},g:{B:0x5bae5f,S:0x4c9a52,T:0xf7f0e3,L:0xffffff}}};
for(const c of['r','b','g'])DECO['pv84'+c]={g:'pv84_'+c,s:1,bx:.5,bz:.4,hp:1e9,n:PV84.nm[c]+' 일반 자판기'};

/* ---------- 도우미 ---------- */
const s4B=(p,w,h,d,c,pos,rot)=>p.push(pt(box(w,h,d),c,pos,rot));
const s4R=(p,w,h,d,c,pos,rot,cr=.04,bv=.02)=>p.push(pt(lkRb(w,h,d,cr,bv),c,pos,rot));
function s4Prism(w,h,d){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.lineTo(-w/2,0);const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return g}
function s4Shape(pts,d){const s=new THREE.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return g}
/* 박공지붕: 마룻대가 z 방향(앞 박공) — 경사면 둘 + 지붕널 줄 + 마룻대 */
function s4RoofZ(p,W,D,y0,rise,c,c2,ovx=.5,ovz=.6,zc=0){const EX=W+ovx,ang=Math.atan2(rise,EX),L=Math.hypot(EX,rise)+.08,ZL=2*D+2*ovz;
 for(const sx of[-1,1]){const cx=sx*EX/2,cy=y0+rise/2,n=[sx*Math.sin(ang),Math.cos(ang)];p.push(pt(box(L,.2,ZL),c,[cx,cy,zc],[0,0,-sx*ang]));
  for(let k=1;k<Math.floor(L/.5);k++){const t=k*.5,x=sx*(EX-Math.cos(ang)*t),y=y0+Math.sin(ang)*t;p.push(pt(box(.06,.05,ZL),c2,[x+n[0]*.12,y+n[1]*.12,zc],[0,0,-sx*ang]))}}
 p.push(pt(cyl(.16,.16,ZL+.04,8),c2,[0,y0+rise+.06,zc],[Math.PI/2,0,0]));return {EX,ang}}
/* 박공지붕: 마룻대가 x 방향(앞 경사가 카메라를 봄) */
function s4RoofX(p,W,D,y0,rise,c,c2,ovx=.6,ovz=.6,tile){const EZ=D+ovz,ang=Math.atan2(rise,EZ),L=Math.hypot(EZ,rise)+.08,XL=2*W+2*ovx;
 for(const sz of[-1,1]){const cz=sz*EZ/2,cy=y0+rise/2,n=[sz*Math.sin(ang),Math.cos(ang)];p.push(pt(box(XL,.2,L),c,[0,cy,cz],[sz*ang,0,0]));
  if(tile&&sz>0){/* 기와(앞 경사만 — 뒤는 안 보여요): 경사를 따라 내려가는 반원 기와 줄 + 겹침 줄 */const nx=Math.floor(XL/.34);for(let i=0;i<nx;i++){const x=-XL/2+.17+i*.34,g=new THREE.CylinderGeometry(.15,.15,L-.06,7,1,true,Math.PI/2,Math.PI);
    p.push(pt(g,i%2?c:tile,[x,cy+n[1]*.1,cz+n[0]*.1],[Math.PI/2+ang,0,0]))}
   for(let k=1;k<Math.floor(L/.42);k++){const t=k*.42,z=EZ-Math.cos(ang)*t,y=y0+Math.sin(ang)*t;p.push(pt(box(XL,.05,.07),c2,[0,y+n[1]*.24,z+n[0]*.24],[ang,0,0]))}}
  else if(!tile)for(let k=1;k<Math.floor(XL/.62);k++)p.push(pt(box(.06,.06,L),c2,[-XL/2+k*.62,cy+n[1]*.12,cz+n[0]*.12],[sz*ang,0,0]))}
 p.push(pt(cyl(.17,.17,XL+.04,8),c2,[0,y0+rise+.06,0],[0,0,Math.PI/2]));return {EZ,ang}}
/* 창(앞을 봄 +z): 테 + 빛나는 유리 + 창살, 덧창 */
function s4Win(p,gl,x,y,z,w,h,fr,glc,sh,shc){s4R(p,w+.2,h+.2,.12,fr,[x,y,z]);gl.push(pt(box(w,h,.02),glc,[x,y,z+.04]));s4B(p,.05,h,.03,fr,[x,y,z+.07]);s4B(p,w,.05,.03,fr,[x,y+h*.08,z+.07]);
 s4R(p,w+.3,.1,.22,fr,[x,y-h/2-.12,z+.1]);if(sh)for(const s2 of[-1,1]){s4R(p,w*.45,h+.12,.05,shc,[x+s2*(w/2+w*.25+.12),y,z+.01]);for(let k=0;k<3;k++)s4B(p,w*.34,.02,.02,0x2a2f33,[x+s2*(w/2+w*.25+.12),y-h*.3+k*h*.3,z+.045])}}
/* 옆벽 창(±x를 봄) */
function s4WinX(p,gl,sx,x,y,z,w,h,fr,glc){s4R(p,.12,h+.2,w+.2,fr,[x,y,z]);gl.push(pt(box(.02,h,w),glc,[x+sx*.04,y,z]));s4B(p,.03,h,.05,fr,[x+sx*.07,y,z]);s4B(p,.03,.05,w,fr,[x+sx*.07,y,z])}
/* 줄무늬 차양: 벽(z0, y0)에서 앞으로 dz만큼 내려오며 튀어나옴 + 물결 끝단 + 쇠 받침 */
function s4Awning(p,x0,x1,y0,z0,dz,drop,cA,cB,sw=.6){const L=Math.hypot(dz,drop),ang=Math.atan2(drop,dz),n=Math.max(2,Math.round((x1-x0)/sw)),w=(x1-x0)/n;
 for(let i=0;i<n;i++){const x=x0+w*(i+.5),c=i%2?cB:cA;p.push(pt(box(w+.005,.05,L),c,[x,y0-drop/2,z0+dz/2],[ang,0,0]));
  p.push(pt(box(w,.3,.04),c,[x,y0-drop-.13,z0+dz+.02]));p.push(pt(new THREE.CylinderGeometry(w/2,w/2,.04,10,1,false,Math.PI/2,Math.PI),c,[x,y0-drop-.28,z0+dz+.02],[Math.PI/2,0,0]))}
 for(let x=x0+.3;x<=x1-.2;x+=Math.max(2.2,(x1-x0)/4))p.push(lkRod([x,y0-drop*.25-.7,z0+.02],[x,y0-drop+.02,z0+dz-.08],.025,0x3a3f4a));}
const s4Fish=(p,x,y,z,s,c,ry=0)=>{p.push(pt(new THREE.SphereGeometry(.16,10,6),c,[x,y,z],[0,ry,0],[s*1.6,s*.55,s*.42]));p.push(pt(cone(.09*s,.2*s,4),c,[x-Math.cos(ry)*.28*s,y,z+Math.sin(ry)*.28*s],[0,ry,Math.PI/2]))};
function s4Lantern(p,gl,x,y,z,arm){if(arm)s4B(p,.06,.06,arm,0x2c2f33,[x,y+.32,z-arm/2+.05]);s4R(p,.26,.06,.26,0x2c2f33,[x,y+.22,z]);s4R(p,.22,.05,.22,0x2c2f33,[x,y-.2,z]);for(const a of[-1,1])for(const b of[-1,1])s4B(p,.03,.4,.03,0x2c2f33,[x+a*.1,y,z+b*.1]);gl.push(pt(box(.17,.34,.17),0xffc46a,[x,y,z]))}
/* 건물 부딪힘: 큰 상자를 4m 안쪽 조각으로 나눠요 */
function sh84Solid(x,z,hw,hd){const nx=Math.ceil(hw/2.1),nz=Math.ceil(hd/2.1),bx=hw/nx,bz=hd/nz;for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)addStruct({t:PLB(bx,bz),x:x-hw+bx*(2*i+1),z:z-hd+bz*(2*j+1),r:0,hp:1e9})}

/* ---------- 일반 자판기 색깔별 모양(79차 pv79와 같은 배치, 색만) ---------- */
function pv84Geo(c){const P=PV84.pal[c],p=[],R=(w,h,d,cc=.04,b=.02)=>lkRb(w,h,d,cc,b),W=.98,D=.76,F=D/2,TRIM=0x4b525b,DK=0x2c3036;
 p.push(pt(R(W,.09,D,.02,.015),TRIM,[0,.045,0]),pt(R(W-.02,1.86,D-.02,.05,.025),P.B,[0,.09+.93,0]),pt(R(W+.02,.32,D+.02,.06,.03),P.T,[0,1.95+.16-.02,0]));
 for(const sx of[-1,1])p.push(pt(box(.012,1.7,D-.1),P.S,[sx*(W/2-.004),1.02,0]),pt(box(.014,.09,D-.08),P.L,[sx*(W/2-.003),1.3,0]));
 p.push(pt(box(W-.06,.05,.02),P.B,[0,2.07,F+.012]),pt(box(W*.62,.03,.02),P.B,[-.06,1.99,F+.012]));
 const wx=-.12,ww=.6,wy0=.62,wh=1.12;p.push(pt(box(ww+.06,.04,.08),TRIM,[wx,wy0-.02,F-.02]),pt(box(ww+.06,.04,.08),TRIM,[wx,wy0+wh+.02,F-.02]));
 for(const sx of[-1,1])p.push(pt(box(.04,wh+.08,.08),TRIM,[wx+sx*(ww/2+.03),wy0+wh/2,F-.02]));
 const CAN=[0xe0533f,0x3f7fd0,0x5bae5f,0xf7c948,0xf28c38,0x8b5cc9,0xffffff,0x33363b];
 for(let r=0;r<4;r++){const y=wy0+.06+r*.27;p.push(pt(box(ww,.025,.2),0xcfd4d9,[wx,y,F-.1]));for(let k=0;k<4;k++){const x=wx-ww/2+.09+k*.14,col=CAN[(r*3+k*5+(c==='b'?2:c==='g'?5:0))%CAN.length];
  if((r+k)%3===1)p.push(pt(cyl(.04,.045,.15,10),col,[x,y+.09,F-.09]),pt(cyl(.018,.03,.05,8),col,[x,y+.19,F-.09]));else p.push(pt(cyl(.05,.05,.16,12),col,[x,y+.093,F-.09]),pt(cyl(.051,.051,.035,12),0xf4f1ea,[x,y+.11,F-.09]));
  p.push(pt(box(.06,.03,.008),r%2?0xf7c948:0xffffff,[x,y-.002,F-.004]))}}
 const bx=.33;p.push(pt(R(.22,1.02,.03,.02,.01),TRIM,[bx,1.2,F+.006]));for(let r=0;r<5;r++)for(let k=0;k<2;k++)p.push(pt(cyl(.022,.022,.02,10),r===4?P.L:0xf4f1ea,[bx-.045+k*.09,1.45-r*.1,F+.026],[Math.PI/2,0,0]));
 p.push(pt(box(.07,.12,.02),0x1f2226,[bx,.9,F+.024]),pt(box(.1,.05,.02),0x1f2226,[bx,.76,F+.024]),pt(R(.66,.24,.05,.02,.01),TRIM,[-.06,.3,F+.006]),pt(box(.58,.16,.02),DK,[-.06,.3,F+.03]));
 GEO['pv84_'+c]=mg(p)}

/* ========== 바깥 1: 낚시 가게 — 청록 판자 2층 + 붉은 박공지붕 + 파랑·흰 줄무늬 차양 + 지붕 위 커다란 물고기 간판 + 서쪽 바다로 뻗은 나무 잔교 ========== */
function sh84FishGeo(){const p=[],gl=[],W=6,D=4,Y0=.3,F1=3.4,F2=3.0,WT=Y0+F1+F2,TE=[0x4f93b5,0x478aac],TED=0x3a7697,CR=0xf4efe4,RF=0xb8483a,RF2=0x8f3a30,WD=[0xb98556,0xa67848,0xc08d5c,0x9e7044],WDD=0x6f4a2c,GLW=0xffd98a,OR=0xff7a3d,ROPE=0xd9c49a;
 s4B(p,2*W+.3,Y0,2*D+.3,0x7f868d,[0,Y0/2,0]);s4B(p,2*W,WT-Y0,2*D,TED,[0,(Y0+WT)/2,0]);
 for(let y=Y0+.15,i=0;y<WT-.05;y+=.3,i++){s4B(p,2*W+.02,.25,.04,TE[i%2],[0,y,D+.02]);for(const sx of[-1,1])s4B(p,.04,.25,2*D+.02,TE[(i+1)%2],[sx*(W+.02),y,0])}
 for(const sx of[-1,1])for(const sz of[-1,1])s4B(p,.26,WT-Y0,.26,CR,[sx*W,(Y0+WT)/2,sz*D]);s4B(p,2*W+.34,.22,2*D+.34,CR,[0,Y0+F1,0]);s4B(p,2*W+.38,.2,2*D+.38,CR,[0,WT,0]);
 /* 1층: 가운데 큰 문(유리 위칸) + 양옆 가게 창 + 창 밑 얼음 위 생선 상자 */
 s4R(p,2.6,3.0,.14,CR,[0,Y0+1.5,D+.07]);for(const s of[-1,1]){s4R(p,1.12,2.68,.08,0x7a4b2e,[s*.58,Y0+1.36,D+.13]);gl.push(pt(box(.78,.86,.02),GLW,[s*.58,Y0+2.05,D+.18]));s4B(p,.86,.05,.03,CR,[s*.58,Y0+1.58,D+.18]);p.push(pt(new THREE.SphereGeometry(.05,8,6),0xd9a441,[s*.14,Y0+1.3,D+.2]))}
 gl.push(pt(box(2.2,.24,.02),GLW,[0,Y0+2.84,D+.16]));
 for(const sx of[-1,1]){const x=sx*3.75;s4Win(p,gl,x,Y0+1.78,D+.06,2.5,1.6,CR,GLW,false);s4R(p,2.5,.56,.64,WD[0],[x,.36,D+.42]);s4B(p,2.3,.06,.52,0xdff3fb,[x,.67,D+.42]);
  [0xc9d6de,OR,0x6aa6c8,0xc9d6de,OR].forEach((c,k)=>s4Fish(p,x-.9+k*.45,.74,D+.42+(k%2?.1:-.1),1,c,(k%2?.2:-.2)))}
 /* 차양 + 문 옆 등 */
 s4Awning(p,-W+.1,W-.1,Y0+F1-.12,D+.05,1.7,.75,0x3a8fc4,0xf7f4ec);for(const s of[-1,1])s4Lantern(p,gl,s*1.75,Y0+2.35,D+.3,.25);
 /* 2층: 창 셋(붉은 덧창) + 구명환 둘 */
 for(const x of[-3.75,0,3.75])s4Win(p,gl,x,Y0+F1+1.55,D+.06,1.4,1.3,CR,0xffe3a0,true,RF);
 for(const s of[-1,1]){const x=s*1.88,y=Y0+F1+1.6;p.push(pt(new THREE.TorusGeometry(.34,.1,8,20),OR,[x,y,D+.12]));for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5])p.push(pt(new THREE.TorusGeometry(.34,.104,8,4,Math.PI/5),0xf7f4ec,[x,y,D+.12],[0,0,a-Math.PI/10]))}
 /* 옆 창 */
 for(const sx of[-1,1]){const x=sx*(W+.06);for(const z of[-1.8,1.8])s4WinX(p,gl,sx,x,Y0+1.8,z,1.3,1.3,CR,GLW);s4WinX(p,gl,sx,x,Y0+F1+1.5,0,1.3,1.2,CR,0xffe3a0)}
 /* 지붕(앞 박공) + 박공 판자·둥근 창 + 끝 물고기 바람개비 */
 const RS=3.3;s4RoofZ(p,W,D,WT,RS,RF,RF2,.5,.6);p.push(pt(s4Prism(2*W+.24,RS,.16),CR,[0,WT,D+.06]));
 for(let k=-5;k<=5;k++){const x=k*1.0,h=RS*(1-Math.abs(x)/(W+.12));if(h>.2)s4B(p,.04,h,.03,0xd9d2c4,[x,WT+h/2,D+.15])}
 for(const sx of[-1,1])p.push(lkBeam([sx*(W+.52),WT-.06,D+.62],[0,WT+RS+.08,D+.62],.26,.12,CR));
 p.push(lkRod([0,WT+RS+.1,D+.55],[0,WT+RS+.9,D+.55],.03,WDD));s4Fish(p,0,WT+RS+.95,D+.55,1.7,0xf2c94c);
 s4B(p,.42,2.0,.42,0x6f757c,[3.7,WT+1.5,-2.4]);s4R(p,.56,.16,.56,0x4a4f55,[3.7,WT+2.55,-2.4]);
 /* 커다란 물고기 간판: 앞 박공 앞에 기둥 둘 + 큰 나무 판(글자) + 그 위 아주 큰 주황 물고기(카메라 쪽으로 살짝 눕힘) */
 const SY=WT+1.75,SZ=D+.78;for(const sx of[-1,1]){p.push(pt(cyl(.13,.15,3.9,10),WDD,[sx*2.62,WT+1.65,SZ-.06]));s4B(p,.16,.16,SZ-D,WDD,[sx*2.62,WT-.12,(D+SZ)/2]);p.push(lkBeam([sx*2.62,WT+.5,SZ-.1],[sx*2.62,WT-.1,D+.2],.1,.1,WDD))}
 s4R(p,8.0,1.5,.16,CR,[0,SY,SZ]);s4R(p,7.7,1.24,.22,0x2c6a8c,[0,SY,SZ+.06]);
 p.push(pt(is82FishGeo(9.2,0xff8a3d,0xfff1d6,0xd9572e),null,[0,SY+2.05,SZ+.15],[-.3,0,0]));for(const sx of[-1,1])p.push(lkRod([sx*1.5,SY+.7,SZ],[sx*1.5,SY+1.45,SZ+.1],.05,WDD));
 /* 앞 마루(땅 위 판자) */
 for(let z=D+.18,k=0;z<D+2.7;z+=.3,k++)s4B(p,2*W+1.4,.08,.27,WD[k%4],[0,.09,z]);s4B(p,2*W+1.4,.12,.12,WDD,[0,.08,D+2.72]);
 /* 서쪽 잔교: 판자 + 옆 보 + 물속 말뚝 + 밧줄 난간 + 끝 등 + 매어 둔 배 */
 const PX0=-W,PX1=-W-11.2,PZ=2.6,PY=.12;for(let x=PX0-.15,k=0;x>PX1;x-=.3,k++)s4B(p,.27,.1,2*PZ,WD[(k+1)%4],[x,PY,0]);
 for(const sz of[-1,1])s4B(p,PX0-PX1,.18,.14,WDD,[(PX0+PX1)/2,PY-.12,sz*PZ]);
 for(let x=PX0-1.2;x>PX1-.1;x-=2.2)for(const sz of[-1,1]){p.push(pt(cyl(.14,.16,2.6,8),WDD,[x,PY-1.25,sz*(PZ-.05)]));p.push(pt(cyl(.08,.08,.95,8),0x8a5a36,[x,PY+.5,sz*(PZ-.05)]))}
 for(let x=PX0-1.2;x>PX1+2.1;x-=2.2)for(const sz of[-1,1])plSag(p,[x,PY+.9,sz*(PZ-.05)],[x-2.2,PY+.9,sz*(PZ-.05)],.16,ROPE,.03);
 for(const sz of[-1,1])p.push(pt(cyl(.15,.18,.45,10),0x3f4450,[PX1+.4,PY+.25,sz*(PZ-.4)]));p.push(pt(cyl(.07,.08,2.6,8),0x2c2f33,[PX1+.35,PY+1.3,0]));s4Lantern(p,gl,PX1+.35,PY+2.45,.25,.3);
 s4R(p,.95,.62,.7,WD[0],[PX0-1.2,PY+.31,-PZ+.7]);s4R(p,.9,.55,.65,WD[2],[PX0-1.2,PY+.88,-PZ+.72]);p.push(pt(cyl(.32,.3,.85,12),0x3f7fd0,[PX0-2.4,PY+.43,-PZ+.6]));
 p.push(pt(new THREE.TorusGeometry(.3,.07,6,14),ROPE,[PX0-2.2,PY+.08,PZ-.7],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.2,.06,6,12),ROPE,[PX0-2.2,PY+.17,PZ-.7],[Math.PI/2,0,0]));
 if(GEO.rowboat)p.push(pt(GEO.rowboat,null,[PX0-6.5,-.82,PZ+1.35],[0,Math.PI/2+.06,0]));
 /* 문 옆 상자·통·기댄 낚싯대 */
 s4R(p,.9,.6,.7,WD[1],[-W+.3,.3,D+1.55]);s4R(p,.85,.55,.65,WD[3],[-W+.32,.87,D+1.52]);p.push(pt(cyl(.36,.33,.95,12),0x8a5a36,[W-.5,.48,D+1.6]),pt(cyl(.37,.37,.05,12),WDD,[W-.5,.75,D+1.6]));
 for(let i=0;i<3;i++)p.push(lkRod([-2.0+i*.16,.1,D+.55],[-2.2+i*.2,2.3,D+.22],.02,[0x2c3346,0x3d6fa0,0x2c3346][i]));
 const g=mg(p);lkSmooth(g,40);GEO.sh84_fish=g;GEO.sh84_fish_glow=mg(gl);SH84.fish.sign={t:'🐟 낚시 가게',w:7.3,h:1.15,pos:[0,SY,SZ+.18],px:78};
 SH84.fish.lamps=[[-1.75,Y0+2.35,D+.5],[1.75,Y0+2.35,D+.5],[-3.75,Y0+1.8,D+.6],[3.75,Y0+1.8,D+.6],[PX1+.35,PY+2.45,.5]];SH84.fish.pier={x0:PX1,x1:PX0-.55,hz:PZ-.05,y:PY+.06}}

/* ========== 바깥 2: 식물 가게 — 흰 틀 유리 온실(가운데 2층 + 양 날개) + 돌 받침벽 + 초록 줄무늬 차양 + 꽃 상자 ========== */
function sh84PlantGeo(){const p=[],gl=[],gs=[],W=7.5,D=5,PW=3.4,PH=.9,T=.35,ST=0xe9e0cc,STC=0xd8cdb6,FR=0xf7f4ec,GR=0x3f8a54,TOP=6.6,WTOP=3.9,PR=2.4;
 const fr=(w,h,d,pos,rot)=>p.push(pt(box(w,h,d),FR,pos,rot)),gls=(w,h,d,pos,rot)=>gs.push(pt(box(w,h,d),0xd8f4f1,pos,rot));
 s4B(p,2*W+.3,.16,2*D+.3,STC,[0,.08,0]);
 /* 돌 받침벽(앞은 문 자리 비움) + 갓돌 */
 for(const [x0,x1] of[[-W,-1.3],[1.3,W]]){s4B(p,x1-x0,PH,T,ST,[(x0+x1)/2,PH/2,D-T/2]);s4B(p,x1-x0+.1,.1,T+.12,STC,[(x0+x1)/2,PH+.05,D-T/2])}
 s4B(p,2*W,PH,T,ST,[0,PH/2,-D+T/2]);for(const sx of[-1,1]){s4B(p,T,PH,2*D,ST,[sx*(W-T/2),PH/2,0]);s4B(p,T+.12,.1,2*D+.1,STC,[sx*(W-T/2),PH+.05,0])}
 for(let x=-W+.5;x<W;x+=1.1)if(Math.abs(x)>1.5)s4B(p,.9,.02,.02,0xcfc4ad,[x,.45,D+.005]);
 /* 날개(양옆 1층 유리): 앞·옆 유리 + 흰 틀 */
 for(const sx of[-1,1]){const xa=sx*PW,xb=sx*W,xm=(xa+xb)/2,ww=Math.abs(xb-xa);
  gls(ww,WTOP-PH,.03,[xm,(PH+WTOP)/2,D-T/2]);gls(.03,WTOP-PH,2*D,[xb-sx*T/2,(PH+WTOP)/2,0]);
  for(let i=0;i<=3;i++){const x=xa+(xb-xa)*i/3;fr(.1,WTOP-PH,.1,[x,(PH+WTOP)/2,D-T/2+.04])}for(const y of[PH+.06,2.4,WTOP])fr(ww,.1,.1,[xm,y,D-T/2+.04]);
  for(let i=0;i<=6;i++){const z=-D+2*D*i/6;fr(.1,WTOP-PH,.1,[xb-sx*T/2-sx*.04,(PH+WTOP)/2,z])}for(const y of[2.4,WTOP])fr(.1,.1,2*D,[xb-sx*T/2-sx*.04,y,0]);
  /* 날개 지붕: 가운데 벽(4.9)에서 바깥(3.9)으로 기울어진 유리 + 서까래 + 앞 삼각 유리 */
  const ang=Math.atan2(1.0,ww),L=Math.hypot(ww,1.0)+.06;gls(L,.03,2*D+.1,[xm,(WTOP+4.9)/2,0],[0,0,-sx*ang]);
  for(let i=0;i<=8;i++){const z=-D+2*D*i/8;p.push(lkBeam([xa,4.92,z],[xb,WTOP+.02,z],.09,.09,FR))}p.push(lkBeam([xb,WTOP+.02,-D],[xb,WTOP+.02,D],.12,.12,FR));
  {const g=s4Shape([[0,0],[ww,0],[0,1.0]],.03);if(sx<0)g.scale(-1,1,1);g.translate(xa,WTOP,D-T/2);gs.push(pt(g,0xd8f4f1))}
  /* 앞 줄무늬 차양(초록·흰) + 받침벽 위 꽃 상자 둘 */
  s4Awning(p,Math.min(xa,xb)+.25,Math.max(xa,xb)-.15,3.3,D+.02,1.25,.5,GR,0xf7f4ec,.55);
  for(const k of[0,1]){const x=xa+(xb-xa)*(.27+k*.46);s4R(p,1.6,.34,.42,0x9c6a3d,[x,PH+.27,D-.02]);for(let j=0;j<9;j++){const fx=x-.7+j*.175,c=[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff,0xffffff][(j+k*2+(sx>0?1:0))%5];
    p.push(pt(new THREE.IcosahedronGeometry(.1,0),0x5f9a3c,[fx,PH+.5,D-.02]),pt(new THREE.IcosahedronGeometry(.085,0),c,[fx+.03,PH+.62+(j%2)*.06,D+.03]))}}}
 /* 가운데 2층 유리: 앞(문 위·양옆) + 날개 위 옆벽 + 틀 */
 for(const sx of[-1,1]){gls(PW-1.3,TOP-PH,.03,[sx*(PW+1.3)/2,(PH+TOP)/2,D-T/2]);gls(.03,TOP-4.9,2*D,[sx*PW,(4.9+TOP)/2,0])}gls(2.6,TOP-3.1,.03,[0,(3.1+TOP)/2,D-T/2]);
 for(const x of[-PW,-2.35,-1.3,1.3,2.35,PW])fr(.12,TOP-PH,.12,[x,(PH+TOP)/2,D-T/2+.05]);fr(.12,TOP-3.1,.12,[0,(3.1+TOP)/2,D-T/2+.05]);
 for(const y of[2.4,3.1,4.9,TOP])fr(2*PW,.12,.12,[0,y,D-T/2+.05]);for(const sx of[-1,1])for(let i=0;i<=6;i++)fr(.1,TOP-4.9,.1,[sx*PW,(4.9+TOP)/2,-D+2*D*i/6]);
 /* 가운데 지붕(유리 박공) + 서까래 + 마룻대 장식 + 작은 탑 */
 {const ang=Math.atan2(PR,PW),L=Math.hypot(PW,PR)+.06;for(const sx of[-1,1]){gls(L,.03,2*D+.2,[sx*PW/2,TOP+PR/2,0],[0,0,-sx*ang]);for(let i=0;i<=8;i++){const z=-D+2*D*i/8;p.push(lkBeam([sx*PW,TOP,z],[0,TOP+PR,z],.1,.1,FR))}}
  p.push(lkBeam([0,TOP+PR,-D-.1],[0,TOP+PR,D+.1],.16,.16,FR));for(let i=0;i<=10;i++)p.push(pt(new THREE.SphereGeometry(.07,8,6),0x5fae8f,[0,TOP+PR+.14,-D+2*D*i/10]));
  {const g=s4Prism(2*PW,PR,.03);g.translate(0,TOP,D-T/2);gs.push(pt(g,0xd8f4f1))}for(const sx of[-1,1])p.push(lkBeam([sx*PW,TOP,D-T/2+.06],[0,TOP+PR,D-T/2+.06],.14,.14,FR));
  p.push(lkBeam([0,TOP,D-T/2+.06],[0,TOP+PR,D-T/2+.06],.08,.08,FR));p.push(pt(new THREE.TorusGeometry(.5,.07,8,22),FR,[0,TOP+.95,D-T/2+.07]));
  const CY=TOP+PR;gls(1.5,1.1,1.5,[0,CY+.55,0]);for(const a of[-1,1])for(const b of[-1,1])fr(.1,1.1,.1,[a*.75,CY+.55,b*.75]);fr(1.7,.1,1.7,[0,CY+1.12,0]);
  p.push(pt(cone(1.15,1.0,4),0x5fae8f,[0,CY+1.66,0],[0,Math.PI/4,0]),pt(new THREE.SphereGeometry(.14,10,8),0xe9c046,[0,CY+2.25,0]),pt(cyl(.03,.03,.6,6),0xe9c046,[0,CY+2.5,0]))}
 /* 문: 초록 틀 유리문 둘 + 위 간판 + 양옆 큰 화분 + 등 */
 for(const s of[-1,1]){s4R(p,1.18,2.9,.1,GR,[s*.62,1.46,D-.1]);gs.push(pt(box(.9,2.5,.02),0xd8f4f1,[s*.62,1.5,D-.03]));s4B(p,.9,.08,.04,GR,[s*.62,1.3,D-.03]);p.push(pt(new THREE.SphereGeometry(.05,8,6),0xd9a441,[s*.18,1.35,D]))}
 s4R(p,2.75,.16,.2,GR,[0,2.98,D-.08]);s4R(p,5.0,1.05,.16,FR,[0,3.62,D+.02]);s4R(p,4.78,.85,.2,GR,[0,3.62,D+.05]);
 for(const s of[-1,1]){const x=s*1.95,z=D+.75;p.push(pt(cyl(.44,.34,.72,14),0xc77a52,[x,.36,z]),pt(cyl(.46,.46,.08,14),0xb06a45,[x,.72,z]),pt(new THREE.IcosahedronGeometry(.62,1),0x4f8a3c,[x,1.3,z]),pt(new THREE.IcosahedronGeometry(.4,1),0x5f9a3c,[x,1.95,z]));s4Lantern(p,gl,s*1.45,2.45,D+.15,.22)}
 /* 안이 비쳐 보이게: 가운데 야자수 · 매단 화분 · 날개 선반 위 화분 · 덤불 */
 {const tx=-.4,tz=-1.5;for(let k=0;k<9;k++){const y=.15+k*.58;p.push(pt(cyl(.2-k*.012,.23-k*.012,.62,9),k%2?0x8a6a44:0x7a5a3a,[tx+Math.sin(k*.35)*.3,y+.3,tz]))}
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2,q=[pt(box(2.2,.04,.42),k%2?0x4f9a3c:0x5fae4a,[1.1,0,0])],g=mg(q);g.rotateZ(-.45-(k%3)*.12);g.rotateY(a);g.translate(tx+Math.sin(8*.35)*.3,5.4,tz);p.push(pt(g,null))}}
 for(const [x,z] of[[-1.8,1.6],[1.9,1.4],[2.2,-2.4],[-2.2,-2.8]]){p.push(pt(cyl(.012,.012,1.0,4),0x3a3f4a,[x,TOP-.5,z]),pt(cyl(.32,.2,.3,10),0x9c6a3d,[x,TOP-1.1,z]),pt(new THREE.IcosahedronGeometry(.38,1),0x5f9a3c,[x,TOP-.92,z]));for(let j=0;j<4;j++)p.push(pt(new THREE.IcosahedronGeometry(.08,0),[0xff6b6b,0xf28bb0,0xffd35c][j%3],[x+Math.cos(j*1.6)*.3,TOP-.85,z+Math.sin(j*1.6)*.3]))}
  for(const sx of[-1,1]){for(const z0 of[D-1.0,-D+1.0]){const x0=sx*PW,x1=sx*(W-.5);s4R(p,Math.abs(x1-x0),.12,.9,0x9c6a3d,[(x0+x1)/2,1.0,z0]);for(let i=0;i<5;i++){const x=x0+(x1-x0)*(i+.5)/5;
   p.push(pt(cyl(.22,.17,.32,10),0xc77a52,[x,1.22,z0]),pt(new THREE.IcosahedronGeometry(.3,0),[0x5f9a3c,0x6ea844][i%2],[x,1.58,z0]));for(let j=0;j<4;j++)p.push(pt(new THREE.IcosahedronGeometry(.08,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff,0xffffff][(i+j+(z0>0?2:0))%5],[x+Math.cos(j*1.7+i)*.2,1.72+(j%2)*.07,z0+Math.sin(j*1.7+i)*.2]))}}
  if(GEO.bush)for(let i=0;i<3;i++)p.push(pt(GEO.bush,null,[sx*(PW+.9+i*1.2),.15,-.2+(i%2)*.8],[0,i,0],[.6,.55,.6]))}
 /* 유리 안을 채우는 큰 잎 덩어리(밖에서 초록이 비쳐 보이게) */
 for(let i=0;i<26;i++){const sx=i%2?1:-1,x=sx*(1.2+hash(i,1,841)*(W-1.8)),z=-D+.9+hash(i,2,841)*(2*D-1.8),y=1.0+hash(i,3,841)*(Math.abs(x)<PW?3.6:1.8),r=.55+hash(i,4,841)*.5;p.push(pt(new THREE.IcosahedronGeometry(r,0),[0x4f8a3c,0x5f9a3c,0x6ea844,0x3f7a34][i%4],[x,y,z]));if(i%3===0)p.push(pt(new THREE.IcosahedronGeometry(.14,0),[0xff6b6b,0xffd35c,0xf28bb0][i%3],[x+r*.5,y+r*.6,z+r*.3]))}
 for(let i=0;i<14;i++){const x=-PW+.4+i*(2*PW-.8)/13;gl.push(pt(new THREE.SphereGeometry(.05,6,4),[0xffd36a,0xffc46a][i%2],[x,TOP-.25-Math.sin(i/13*Math.PI)*.35,D-.5]))}
 const g=mg(p);lkSmooth(g,40);GEO.sh84_plant=g;GEO.sh84_plant_glow=mg(gl);GEO.sh84_plant_glass=mg(gs);SH84.plant.sign={t:'🌱 식물 가게',w:4.5,h:.78,pos:[0,3.62,D+.16],px:78};
 SH84.plant.lamps=[[-1.45,2.45,D+.4],[1.45,2.45,D+.4],[0,TOP-.4,D-.6]]}

/* ========== 바깥 3: 요리 가게 — 크림 회벽 1층 + 나무 뼈대 2층 + 주황 기와(앞 경사) + 빨강·흰 줄무늬 차양 + 내다 파는 창 + 지붕 위 커다란 프라이팬 ========== */
function sh84CookGeo(){const p=[],gl=[],W=6.5,D=4.5,Y0=.35,F1=3.3,F2=2.9,WT=Y0+F1+F2,CR1=0xf2e3c2,CR2=0xf6ead0,BM=0x6b4426,BM2=0x7d5232,TL=0xd9744a,TL2=0xc8643c,TLD=0x9e4a2c,SH=0x3f8a8f,GLW=0xffcf8a,WD=[0xb98556,0xa67848,0xc08d5c];
 s4B(p,2*W+.3,Y0,2*D+.3,0x9aa1a8,[0,Y0/2,0]);for(let i=0;i<14;i++)s4R(p,.86,.15,.06,[0x9aa1a8,0x8a9097,0xa9aeb3][i%3],[-W+.45+i*.93,.1+(i%2)*.14,D+.16],0,.03,.02);
 s4B(p,2*W,F1,2*D,CR1,[0,Y0+F1/2,0]);s4B(p,2*W,F2,2*D,CR2,[0,Y0+F1+F2/2,0]);
 for(const sx of[-1,1])for(const sz of[-1,1])s4B(p,.24,WT-Y0,.24,BM,[sx*W,(Y0+WT)/2,sz*D]);
 s4B(p,2*W+.3,.24,2*D+.3,BM,[0,Y0+F1,0]);s4B(p,2*W+.34,.2,2*D+.34,BM,[0,WT,0]);
 /* 2층 나무 뼈대: 기둥 + 몇 칸 엇갈린 버팀 */
 for(let i=1;i<8;i++){const x=-W+i*2*W/8;s4B(p,.16,F2,.08,BM2,[x,Y0+F1+F2/2,D+.04]);if(i%2&&Math.abs(x)>1.2){p.push(lkBeam([x-2*W/8+.08,Y0+F1+.15,D+.05],[x-.08,WT-.15,D+.05],.12,.06,BM2))}}
 for(const sx of[-1,1])for(let i=1;i<5;i++)s4B(p,.08,F2,.16,BM2,[sx*(W+.04),Y0+F1+F2/2,-D+i*2*D/5]);
 /* 1층: 내다 파는 큰 창(안이 따뜻하게 빛남) + 나무 판대 + 문(오른쪽) */
 const HX=-1.5,HW=5.2,HY0=Y0+.85,HY1=Y0+2.55;s4R(p,HW+.3,HY1-HY0+.3,.14,BM,[HX,(HY0+HY1)/2,D+.06]);gl.push(pt(box(HW,HY1-HY0,.02),GLW,[HX,(HY0+HY1)/2,D-.05]));
 s4B(p,HW+.2,.12,.12,BM,[HX,HY1+.02,D+.12]);for(let k=0;k<6;k++){const x=HX-HW/2+.5+k*.84;p.push(pt(cyl(.012,.012,.36,4),0x3a3f4a,[x,HY1-.2,D+.0]),pt(cyl(.2-(k%3)*.03,.2-(k%3)*.03,.03,14),0x2c2f33,[x,HY1-.5,D+.0],[Math.PI/2,0,0]))}
 s4R(p,HW+.6,.12,.66,WD[0],[HX,HY0-.02,D+.32]);for(const s of[-1,1])p.push(lkBeam([HX+s*(HW/2-.2),HY0-.55,D+.05],[HX+s*(HW/2-.2),HY0-.08,D+.58],.1,.08,BM));
 if(GEO.ds_dish_steak)for(const [k,x] of[['ds_dish_steak',-3.3],['ds_dish_chowder',-1.5],['ds_dish_shortcake',.3]])if(GEO[k])p.push(pt(GEO[k],null,[HX+x+1.5,HY0+.05,D+.36],[0,0,0],[.85,.85,.85]));
 const DX=4.35;s4R(p,1.5,2.75,.14,BM,[DX,Y0+1.38,D+.07]);s4R(p,1.24,2.5,.08,SH,[DX,Y0+1.27,D+.12]);gl.push(pt(box(.7,.8,.02),GLW,[DX,Y0+1.9,D+.17]));p.push(pt(new THREE.SphereGeometry(.05,8,6),0xd9a441,[DX-.42,Y0+1.25,D+.18]));
 s4Awning(p,-W+.1,W-.1,Y0+F1-.16,D+.05,1.65,.72,0xe0533f,0xf7f0e3);s4Lantern(p,gl,DX+.98,Y0+2.3,D+.28,.24);
 /* 문 앞 칠판 메뉴판 · 채소 상자 셋(토마토·양배추·당근) */
 for(const s of[-1,1])p.push(pt(box(.7,1.0,.05),BM2,[2.55,.5,D+1.25+s*.22],[s*.22,0,0]),pt(box(.58,.82,.06),0x2f3b33,[2.55,.52,D+1.25+s*.25],[s*.22,0,0]));
 {const cx=-5.4,cz=D+.75;s4R(p,1.5,.7,1.1,BM2,[cx,.35,cz]);for(const [j,c,kind] of[[0,0xe0533f,'s'],[1,0x7fbf5a,'b'],[2,0xf28c38,'c']]){const z=cz-.4+j*.4,y=.78+j*.08;s4R(p,1.3,.22,.36,WD[j],[cx,y,z],[-.35,0,0]);
   for(let i=0;i<6;i++){const x=cx-.5+i*.2;if(kind==='c')p.push(pt(cone(.05,.3,6),c,[x,y+.16,z],[Math.PI/2-.3,0,.2*i]));else p.push(pt(new THREE.IcosahedronGeometry(kind==='b'?.11:.085,1),c,[x,y+.18,z+(i%2)*.06]))}}}
 /* 2층: 창 셋(청록 덧창) + 꽃 상자 */
 for(const x of[-3.9,0,3.9]){s4Win(p,gl,x,Y0+F1+1.5,D+.06,1.3,1.2,BM2,0xffe3a0,true,SH);s4R(p,1.5,.26,.3,0x9c6a3d,[x,Y0+F1+.72,D+.2]);for(let j=0;j<7;j++)p.push(pt(new THREE.IcosahedronGeometry(.09,0),[0xff6b6b,0xf28bb0,0xffd35c][(j+((x*3)|0))%3],[x-.6+j*.2,Y0+F1+.92+(j%2)*.05,D+.22]),pt(new THREE.IcosahedronGeometry(.08,0),0x5f9a3c,[x-.5+j*.18,Y0+F1+.86,D+.16]))}
 for(const sx of[-1,1]){const x=sx*(W+.06);s4WinX(p,gl,sx,x,Y0+1.7,-1.4,1.2,1.2,BM2,GLW);s4WinX(p,gl,sx,x,Y0+F1+1.5,1.2,1.1,1.1,BM2,0xffe3a0)}
 /* 지붕: 옆 박공(앞 경사가 카메라 쪽) + 기와 + 양옆 박공벽 + 벽돌 굴뚝 */
 const RS=3.0;s4RoofX(p,W,D,WT,RS,TL2,TLD,.6,.7,TL);for(const sx of[-1,1]){const g=s4Prism(2*D+.2,RS,.18);g.rotateY(Math.PI/2);g.translate(sx*W,WT,0);p.push(pt(g,CR2));p.push(lkBeam([sx*(W+.62),WT-.04,-(D+.72)],[sx*(W+.62),WT+RS+.06,0],.22,.12,BM),lkBeam([sx*(W+.62),WT-.04,D+.72],[sx*(W+.62),WT+RS+.06,0],.22,.12,BM))}
 {const cx=-4.1,cz=-1.6;for(let y=WT+.4,k=0;y<WT+RS+1.6;y+=.3,k++)s4B(p,.9,.3,.9,k%2?0xa8553f:0x9a4b37,[cx,y+.15,cz]);s4R(p,1.06,.16,1.06,0x6f757c,[cx,WT+RS+1.72,cz]);SH84.cook.chim=[cx,WT+RS+2.0,cz]}
 /* 지붕 위 커다란 프라이팬(달걀 프라이) + 간판 */
 const SY=WT+RS*.62;for(const sx of[-1,1])p.push(pt(cyl(.12,.14,1.6,10),BM,[sx*2.5,SY-.1,2.3]),pt(cyl(.12,.14,3.6,10),BM,[sx*1.0,SY+1.1,.55]));
 s4R(p,6.9,1.4,.16,0xf7f0e3,[0,SY+.55,2.3]);s4R(p,6.6,1.14,.22,0xe0533f,[0,SY+.55,2.36]);
 {const px=-.3,py=SY+3.35,pz=.6,tl=-.32,q=[pt(cyl(1.55,1.42,.2,28),0x2c2f33,[0,0,0]),pt(cyl(1.38,1.38,.05,28),0x4a4f55,[0,.11,0]),pt(new THREE.SphereGeometry(.95,20,10),0xfdfbf4,[-.1,.12,.05],[0,0,0],[1.08,.16,.92]),
   pt(new THREE.SphereGeometry(.42,16,10),0xf7c23a,[.05,.22,-.05],[0,0,0],[1,.55,1]),pt(new THREE.SphereGeometry(.14,10,8),0xfff6c8,[.18,.36,-.18]),pt(box(2.4,.18,.3),0x5f3a22,[2.6,.02,0]),pt(cyl(.16,.16,.2,10),0x3a3f4a,[1.55,.02,0],[0,0,Math.PI/2])],g=mg(q);
  g.rotateX(Math.PI/2+tl);g.rotateZ(.18);g.translate(px,py,pz);p.push(pt(g,null));}
 const g=mg(p);lkSmooth(g,40);GEO.sh84_cook=g;GEO.sh84_cook_glow=mg(gl);SH84.cook.sign={t:'🍳 요리 가게',w:6.2,h:1.0,pos:[0,SY+.55,2.49],px:80};
 SH84.cook.lamps=[[DX+.98,Y0+2.3,D+.5],[HX,Y0+1.7,D+.4],[-3.9,Y0+F1+1.5,D+.4],[3.9,Y0+F1+1.5,D+.4]]}

/* ========== 바깥 4: 사냥꾼 상점 — 짙은 통나무 2층 + 돌 기단 + 짙은 초록 지붕·앞 지붕창 + 넓은 현관(통나무 기둥·난간) + 큰 사슴뿔 + 돌 굴뚝 ========== */
function sh84HuntGeo(){const p=[],gl=[],W=6.5,D=4.5,Y0=.5,F1=3.2,F2=2.9,WT=Y0+F1+F2,LR=.17,LS=.33,LOG=[0x7a4a2a,0x6b4024,0x845232],END=0xc29a6a,RING=0x9c7044,GRN=0x3f6b4a,GRN2=0x2f5238,DK=0x4a2e1c,CRM=0xefe3c8,STN=[0x8f969c,0x7f868d,0x9aa1a8,0x878d93],GLW=0xffc97a;
 s4B(p,2*W+.4,Y0,2*D+.4,STN[1],[0,Y0/2,0]);for(let i=0;i<13;i++)for(let j=0;j<2;j++){const x=-W+.45+i*1.0+(j?.5:0);if(x<W)s4R(p,.88,.22,.08,STN[(i+j*2)%4],[x,.14+j*.24,D+.22],0,.04,.03)}
 s4B(p,2*W-.1,WT-Y0,2*D-.1,LOG[1],[0,(Y0+WT)/2,0]);
 const n=Math.floor((WT-Y0)/LS);for(let i=0;i<n;i++){const y=Y0+LR+i*LS;for(const sz of[-1,1]){p.push(pt(cyl(LR,LR,2*W+.5,9),LOG[i%3],[0,y,sz*D],[0,0,Math.PI/2]));for(const sx of[-1,1])p.push(pt(cyl(LR*.9,LR*.9,.02,9),END,[sx*(W+.26),y,sz*D],[0,0,Math.PI/2]),pt(cyl(LR*.45,LR*.45,.022,7),RING,[sx*(W+.262),y,sz*D],[0,0,Math.PI/2]))}
  if(i<n-1)for(const sx of[-1,1]){const y2=y+LS/2;p.push(pt(cyl(LR,LR,2*D+.5,9),LOG[(i+1)%3],[sx*W,y2,0],[Math.PI/2,0,0]));for(const sz of[-1,1])p.push(pt(cyl(LR*.9,LR*.9,.02,9),END,[sx*W,y2,sz*(D+.26)],[Math.PI/2,0,0]))}}
 s4B(p,2*W+.6,.26,.36,DK,[0,Y0+F1,D+.12]);
 /* 1층: 쇠 띠 두 짝 문 + 창(초록 덧창) + 가죽 둘 + 엇갈린 화살 */
 s4R(p,2.4,2.85,.14,DK,[0,Y0+1.42,D+.12]);for(const s of[-1,1]){for(let k=0;k<3;k++)s4R(p,.34,2.6,.07,[0x5b3a22,0x664128,0x553620][k],[s*(.2+k*.34),Y0+1.3,D+.2],0,.02,.01);for(const y of[.6,1.95])s4B(p,1.0,.08,.03,0x2c2f33,[s*.53,Y0+y,D+.25]);p.push(pt(new THREE.TorusGeometry(.09,.02,6,12),0x9aa3ab,[s*.18,Y0+1.35,D+.27]))}
 for(const sx of[-1,1]){s4Win(p,gl,sx*3.55,Y0+1.7,D+.14,1.5,1.3,DK,GLW,true,GRN);
  const pel=s4Shape([[-.45,-.6],[-.2,-.45],[0,-.65],[.2,-.45],[.45,-.6],[.4,-.1],[.55,.25],[.32,.45],[.15,.7],[-.15,.7],[-.32,.45],[-.55,.25],[-.4,-.1]],.04);p.push(pt(pel,sx<0?0x8a5a36:0xb98556,[sx*5.7,Y0+1.85,D+.2]));
  for(const a of[-1,1])p.push(lkRod([sx*5.7+a*.5,Y0+1.2,D+.22],[sx*5.7-a*.05,Y0+2.6,D+.22],.025,0x8a6a44))}
 for(const sx of[-1,1]){const x=sx*1.85,y=Y0+2.1;p.push(pt(cyl(.32,.32,.06,16),0x8a5a36,[x,y,D+.2],[Math.PI/2,0,0]));for(const a of[-.7,.7]){p.push(lkRod([x-Math.sin(a)*.5,y-Math.cos(a)*.5,D+.25],[x+Math.sin(a)*.5,y+Math.cos(a)*.5,D+.25],.018,0x6b4426));p.push(pt(cone(.05,.14,4),0x9aa3ab,[x+Math.sin(a)*.55,y+Math.cos(a)*.55,D+.25],[0,0,-a]))}}
 /* 2층 창 둘 */
 for(const sx of[-1,1])s4Win(p,gl,sx*3.55,Y0+F1+1.45,D+.14,1.3,1.15,DK,0xffd98a,true,GRN);
 for(const sx of[-1,1]){const x=sx*(W+.1);s4WinX(p,gl,sx,x,Y0+1.7,-1.2,1.3,1.2,DK,GLW);s4WinX(p,gl,sx,x,Y0+F1+1.45,1.2,1.1,1.0,DK,0xffd98a)}
 /* 지붕(옆 박공, 짙은 초록 철판) + 양옆 박공 판자 + 앞 지붕창(간판·사슴뿔) */
 const RS=3.0;s4RoofX(p,W,D,WT,RS,GRN,GRN2,.7,.7);for(const sx of[-1,1]){const g=s4Prism(2*D+.2,RS,.18);g.rotateY(Math.PI/2);g.translate(sx*W,WT,0);p.push(pt(g,0x7a5232))}
 {const dw=2.4,dz0=D-1.7,dz1=D+.05,y0=WT-.2,y1=WT+2.1;s4B(p,2*dw,y1-y0,dz1-dz0,0x8a5a36,[0,(y0+y1)/2,(dz0+dz1)/2]);for(let k=-5;k<=5;k++)s4B(p,.03,y1-y0,.03,0x6b4426,[k*.42,(y0+y1)/2,dz1+.01]);
  s4RoofZ(p,dw,(dz1-dz0)/2,y1,1.35,GRN,GRN2,.3,.25,(dz0+dz1)/2);{const g=s4Prism(2*dw+.1,1.35,.12);g.translate(0,y1,dz1);p.push(pt(g,0x7a5232))}
  s4R(p,4.1,.92,.16,0x5b3a22,[0,y0+.75,dz1+.1]);s4R(p,3.86,.72,.2,0xd8b878,[0,y0+.75,dz1+.12]);
  const ay=y1+.55,az=dz1+.2;p.push(pt(cyl(.42,.42,.1,18),0x6b4426,[0,ay,az],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.24,12,8),0x8a5a36,[0,ay-.05,az+.12],[0,0,0],[1,1.2,.8]));
  for(const s of[-1,1]){const b0=[s*.18,ay+.12,az+.15],b1=[s*.75,ay+.55,az+.15],b2=[s*1.05,ay+1.25,az+.1],b3=[s*.95,ay+1.85,az+.05];p.push(lkRod(b0,b1,.07,CRM),lkRod(b1,b2,.06,CRM),lkRod(b2,b3,.05,CRM),
    lkRod(b1,[s*.55,ay+1.05,az+.2],.045,CRM),lkRod(b2,[s*.65,ay+1.65,az+.15],.04,CRM),lkRod(b2,[s*1.5,ay+1.55,az+.1],.04,CRM),lkRod(b3,[s*1.25,ay+2.25,az],.035,CRM))}
  SH84.hunt.sy=y0+.75;SH84.hunt.sz=dz1+.23}
 {const cx=W+.55,cz=-1.4;for(let y=0,k=0;y<WT+RS+1.0;y+=.34,k++)s4R(p,1.0-(y>WT?.12:0),.34,1.0-(y>WT?.12:0),STN[k%4],[cx,y+.17,cz],0,.05,.04);s4R(p,1.0,.16,1.0,0x5a616a,[cx,WT+RS+1.1,cz]);SH84.hunt.chim=[cx,WT+RS+1.35,cz]}
 /* 현관: 땅 위 판자 + 통나무 기둥 넷 + 지붕(초록) + 통나무 난간(가운데 비움) + 기둥 등 */
 const PZ=D+1.95;for(let z=D+.28,k=0;z<PZ;z+=.3,k++)s4B(p,2*W+.8,.08,.27,[0x8a5a36,0x7d5232,0x96633d][k%3],[0,.09,z]);s4B(p,2*W+.8,.14,.14,DK,[0,.08,PZ+.04]);
 for(const x of[-6.2,-2.1,2.1,6.2])p.push(pt(cyl(.2,.22,3.35,10),LOG[0],[x,1.68,PZ-.25]),pt(cyl(.24,.24,.06,10),DK,[x,3.38,PZ-.25]));
 p.push(pt(cyl(.2,.2,2*W+.9,10),LOG[2],[0,3.32,PZ-.25],[0,0,Math.PI/2]));{const L=Math.hypot(PZ-D+.3,.55),a=Math.atan2(.55,PZ-D+.3);p.push(pt(box(2*W+1.0,.16,L),GRN,[0,3.55+.275,(D+PZ+.3)/2],[a,0,0]));for(let k=1;k<22;k++)p.push(pt(box(.05,.06,L),GRN2,[-W-.5+k*.62,3.65+.275,(D+PZ+.3)/2],[a,0,0]))}
 for(const [x0,x1] of[[-6.2,-2.1],[2.1,6.2]])for(const y of[.55,.98])p.push(pt(cyl(.09,.09,x1-x0,8),LOG[1],[(x0+x1)/2,y,PZ-.25],[0,0,Math.PI/2]));
 for(const s of[-1,1])s4Lantern(p,gl,s*2.1,2.55,PZ+.02,.25);
 /* 옆(왼쪽): 장작 더미 + 도끼 꽂힌 그루터기 · 오른쪽 통 */
 for(let r=0;r<4;r++)for(let c=0;c<5-(r>2?1:0);c++)p.push(pt(cyl(.16,.16,1.0,8),LOG[(r+c)%3],[-W-1.0,.17+r*.31,-1.6+c*.36+(r%2)*.18],[0,0,Math.PI/2]),pt(cyl(.15,.15,.02,8),END,[-W-.49,.17+r*.31,-1.6+c*.36+(r%2)*.18],[0,0,Math.PI/2]));
 p.push(pt(cyl(.35,.4,.5,12),0x8a5a36,[-W-.95,.25,1.6]),pt(cyl(.33,.33,.03,12),END,[-W-.95,.51,1.6]),lkRod([-W-.9,.5,1.6],[-W-.7,1.15,1.7],.03,0x9c6a3d),pt(box(.28,.18,.05),0x9aa3ab,[-W-.9,.55,1.6],[0,.3,.3]));
 const g=mg(p);lkSmooth(g,40);GEO.sh84_hunt=g;GEO.sh84_hunt_glow=mg(gl);SH84.hunt.sign={t:'🏹 사냥꾼 상점',w:3.7,h:.66,pos:[0,SH84.hunt.sy,SH84.hunt.sz],px:72};
 SH84.hunt.lamps=[[-2.1,2.55,PZ+.3],[2.1,2.55,PZ+.3],[-3.55,Y0+1.7,D+.5],[3.55,Y0+1.7,D+.5]];SH84.hunt.porch=PZ}

/* ========== 안: 15 × 10.4m 방 + 앞 통로 · 테마 바닥·벽 · 왼쪽 뒤 계산대(상인) · 뒤 벽 오른쪽 자판기 줄(진짜 구조물, sh84Inside) ========== */
const SH84TH={
 fish:{fl:[0xc79a66,0xbd9060,0xd0a470,0xb88a5a],fk:'plank',wall:[0x5a9cbc,0x5294b4],low:0x3a7697,trim:0xf4efe4,wk:'board'},
 plant:{fl:[0xd9875a,0xc9774f],fk:'tile',ts:.75,wall:[0xf4efe4,0xefe8da],low:0x5f9a5a,trim:0xf7f4ec,wk:'plain'},
 cook:{fl:[0xf1e6d0,0xc8643c],fk:'tile',ts:.6,wall:[0xf3e4c4,0xefdfbc],low:0xa8553f,trim:0x6b4426,wk:'brick'},
 hunt:{fl:[0x7d5232,0x6f4a2c,0x8a5a36,0x74492c],fk:'plank',wall:[0x7a4a2a,0x6b4024,0x845232],low:0x5b3a22,trim:0x4a2e1c,wk:'log'}};
const SH84CTR=[-4.2,-2.5],SH84NPC=[-4.2,-3.6];
function sh84Room(k){const R=SH84R,W=R.hw,D=R.hd,CW=R.cor[0],CL=R.cor[1],WH=3.4,T=.16,th=SH84TH[k],p=[],gl=[],H=new THREE.Group(),blk=[];
 const B=(w,h,d,c,pos,rot)=>s4B(p,w,h,d,c,pos,rot),Rb=(w,h,d,c,pos,rot,cr,bv)=>s4R(p,w,h,d,c,pos,rot,cr,bv),put=(key,x,y,z,ry=0,s=1)=>{if(GEO[key])p.push(pt(GEO[key],null,[x,y,z],[0,ry,0],[s,s,s]))};
 /* 바닥 + 통로 */
 if(th.fk==='plank'){for(let z=-D+.15,i=0;z<D;z+=.3,i++)B(2*W,.06,.28,th.fl[i%th.fl.length],[0,-.03,z]);for(let z=D+.15,i=0;z<D+CL;z+=.3,i++)B(2*CW,.06,.28,th.fl[(i+1)%th.fl.length],[0,-.03,z])}
 else{const s=th.ts;for(let x=-W+s/2,i=0;x<W;x+=s,i++)for(let z=-D+s/2,j=0;z<D;z+=s,j++)B(s-.012,.06,s-.012,th.fl[(i+j)%2],[x,-.03,z]);for(let x=-CW+s/2,i=0;x<CW;x+=s,i++)for(let z=D+s/2,j=0;z<D+CL;z+=s,j++)B(s-.012,.06,s-.012,th.fl[(i+j)%2],[x,-.03,z])}
 B(2*W,.06,2*D,0x3a2a20,[0,-.09,0]);for(const sd of[-1,1])B(.06,.05,CL,th.trim,[sd*(CW+.03),.025,D+CL/2]);
 /* 벽: 뒤 + 양옆 */
 const wall=(w,cx,cz,rotY)=>{const q=[];const add=(g,c,pos)=>q.push(pt(g,c,pos));
  if(th.wk==='log'){for(let y=.15,i=0;y<WH;y+=.3,i++)add(cyl(.15,.15,w+.3,9).rotateZ(Math.PI/2),th.wall[i%3],[0,y,-T/2])}
  else{add(box(w,WH,T),th.wall[0],[0,WH/2,-T/2]);add(box(w,1.05,T+.03),th.low,[0,.525,-T/2]);add(box(w+.02,.08,T+.07),th.trim,[0,1.08,-T/2]);
   if(th.wk==='board')for(let x=-w/2+.2,i=0;x<w/2;x+=.4,i++)add(box(.36,WH-1.12,.03),th.wall[i%2],[x,1.12+(WH-1.12)/2,.0]);
   if(th.wk==='brick')for(let y=.12,r=0;y<1.0;y+=.18,r++)for(let x=-w/2+(r%2?.2:0)+.2;x<w/2-.1;x+=.4)add(box(.36,.15,.03),[0xa8553f,0x9a4b37,0xb25e45][(r+((x*5)|0))%3],[x,y,.0]);
   if(th.wk==='brick')for(let x=-w/2+.1;x<=w/2;x+=2.5)add(box(.18,WH-1.12,.05),th.trim,[x,1.12+(WH-1.12)/2,.01])}
  add(box(w+.1,.14,T+.1),th.trim,[0,WH+.02,-T/2]);const g=mg(q);g.rotateY(rotY);g.translate(cx,0,cz);p.push(g)};
 wall(2*W,0,-D,0);wall(2*D,-W,0,Math.PI/2);wall(2*D,W,0,-Math.PI/2);
 /* 천장 등(빛) */
 for(const [x,z] of[[-3.8,-1.0],[3.8,-1.0],[0,1.8]]){B(.03,.7,.03,0x2c2f33,[x,WH-.35,z]);Rb(.5,.22,.5,0x2c2f33,[x,WH-.78,z],0,.08,.05);gl.push(pt(new THREE.SphereGeometry(.17,10,8),0xffd98a,[x,WH-.92,z]))}
 /* 계산대(왼쪽 뒤) */
 const [cx,cz]=SH84CTR;
 if(k==='fish'){Rb(3.8,.95,.78,0x9c6a3d,[cx,.48,cz]);Rb(3.95,.08,.86,0x6f4a2c,[cx,.98,cz]);gl.push(pt(box(2.2,.36,.6),0xcfeef8,[cx-.5,1.2,cz]));B(2.24,.04,.64,0xf4efe4,[cx-.5,1.4,cz]);[0xc9d6de,0xff7a3d,0x6aa6c8,0xc9d6de].forEach((c,i)=>s4Fish(p,cx-1.3+i*.5,1.08,cz+(i%2?.1:-.1),1.1,c,.1));
  Rb(.42,.28,.34,0x5a616a,[cx+1.35,1.16,cz-.05]);p.push(pt(cyl(.16,.18,.05,14),0xc9cdd2,[cx+.85,1.04,cz]),pt(cyl(.012,.012,.3,4),0x3a3f4a,[cx+.85,1.2,cz]))}
 if(k==='plant'){Rb(3.8,.95,.78,0xb98556,[cx,.48,cz]);Rb(3.95,.08,.86,0x8a5a36,[cx,.98,cz]);for(let i=0;i<5;i++){const x=cx-1.5+i*.75;p.push(pt(cyl(.16,.13,.3,12),[0x8fb6c9,0xd9d2c4,0x8fb6c9][i%3],[x,1.17,cz]));for(let j=0;j<5;j++)p.push(pt(new THREE.IcosahedronGeometry(.07,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff,0xffffff][(i+j)%5],[x+Math.cos(j*1.3)*.1,1.42+(j%2)*.08,cz+Math.sin(j*1.3)*.1]))}}
 if(k==='cook'){Rb(3.8,.95,.78,0xf4efe4,[cx,.48,cz]);Rb(3.95,.08,.86,0x6b4426,[cx,.98,cz]);for(const [g,x] of[['ds_dish_steak',-1.3],['ds_dish_shortcake',-.4],['ds_dish_chowder',.5]])put(g,cx+x,1.02,cz,0,.8);p.push(pt(cyl(.2,.24,.18,14),0xc8643c,[cx+1.35,1.11,cz]),pt(new THREE.SphereGeometry(.18,10,6,0,Math.PI*2,0,Math.PI/2),0xd9a441,[cx+1.35,1.2,cz]))}
 if(k==='hunt'){for(let i=0;i<3;i++)p.push(pt(cyl(.16,.16,3.9,9),[0x7a4a2a,0x845232,0x6b4024][i],[cx,.18+i*.3,cz+.18],[0,0,Math.PI/2]),pt(cyl(.16,.16,3.9,9),[0x6b4024,0x7a4a2a,0x845232][i],[cx,.18+i*.3,cz-.18],[0,0,Math.PI/2]));Rb(3.95,.1,.82,0x5b3a22,[cx,.98,cz]);
  const pel=s4Shape([[-.45,-.35],[0,-.45],[.45,-.35],[.55,.1],[.3,.4],[-.3,.4],[-.55,.1]],.03);p.push(pt(pel,0xb98556,[cx-.8,1.05,cz],[-Math.PI/2,0,.2]));Rb(.5,.08,.35,0x9aa3ab,[cx+.9,1.07,cz]);for(let i=0;i<5;i++)B(.06,.1,.06,0x9aa3ab,[cx+.7+i*.1,1.14,cz+.12])}
 blk.push([cx,(cz+SH84NPC[1])/2-.15,2.05,(Math.abs(SH84NPC[1]-cz))/2+.62]);
 /* 뒤 벽 왼쪽: 도감 게시판(낚시·식물) 또는 선반(요리·사냥) */
 if(k==='fish'||k==='plant'){try{const b=k==='fish'?plDexBoard():piDexBoard();b.position.set(cx,0,-D+.25);H.add(b)}catch(e){console.warn(e)}
  for(const x of[-6.75,-1.65]){Rb(.95,2.3,.5,0x8a5a36,[x,1.15,-D+.27]);for(const y of[.55,1.15,1.75])B(.88,.05,.46,0x6f4a2c,[x,y,-D+.29]);
   for(const y of[.58,1.18,1.78])for(let i=0;i<3;i++){const xx=x-.28+i*.28;if(k==='fish')Rb(.22,.16,.24,[0x3f7fd0,0xe0533f,0xf7c948,0x5bae5f][(i+((y*3)|0))%4],[xx,y+.1,-D+.3]);else{p.push(pt(cyl(.1,.08,.16,10),0xc77a52,[xx,y+.1,-D+.3]),pt(new THREE.IcosahedronGeometry(.12,0),[0x5f9a3c,0x6ea844][i%2],[xx,y+.26,-D+.3]))}}}}
 if(k==='cook'){Rb(5.4,.92,.7,0xf4efe4,[cx,.46,-D+.4]);Rb(5.5,.08,.76,0x8a8f96,[cx,.95,-D+.4]);Rb(1.4,.9,.7,0x3a3f4a,[cx,.45,-D+.4]);for(const a of[-.3,.3])for(const b of[-.15,.15])p.push(pt(cyl(.14,.14,.03,14),0x1f2226,[cx+a,1.0,-D+.4+b]));
  gl.push(pt(box(1.0,.3,.02),0xff8a3d,[cx,.5,-D+.76]));Rb(1.8,.6,.9,0xb9c0c9,[cx,2.55,-D+.5]);B(.4,.8,.4,0xb9c0c9,[cx,3.1,-D+.3]);for(const x of[cx-1.8,cx+1.8])for(const y of[1.7,2.3]){B(1.3,.05,.32,0x8a5a36,[x,y,-D+.2]);for(let i=0;i<4;i++)p.push(pt(cyl(.08,.08,.22,10),[0xe8c35a,0xc8643c,0x7fbf5a,0xf4efe4][(i+((y*2)|0))%4],[x-.45+i*.3,y+.14,-D+.2]))}
  if(GEO.pc_corn_2)p.push(pt(GEO.pc_corn_2,null,[cx-2.6,.95,-D+.4],[0,0,0],[.6,.6,.6]));blk.push([cx,-D+.4,2.75,.4])}
 if(k==='hunt'){for(let y of[.4,1.2,2.0])B(5.4,.08,.36,0x5b3a22,[cx,y,-D+.22]);for(const x of[cx-2.7,cx+2.7])B(.12,2.2,.36,0x4a2e1c,[x,1.1,-D+.22]);
  for(let i=0;i<6;i++){const x=cx-2.2+i*.88;p.push(lkRod([x,.5,-D+.2],[x+.1,1.9,-D+.2],.02,0x6b4426));p.push(new THREE.TorusGeometry(.55,.03,5,14,Math.PI*.9).rotateZ(Math.PI*.05+Math.PI/2).translate(x+.25,1.2,-D+.24).toNonIndexed());p[p.length-1]=pt(p[p.length-1],0x8a5a36)}
  for(let i=0;i<4;i++)Rb(.4,.2,.25,0x6f757c,[cx-1.8+i*1.2,.55,-D+.25]);
  const ay=2.75,az=-D+.2;p.push(pt(cyl(.42,.42,.08,18),0x6b4426,[cx,ay,az],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.25,12,8),0x8a5a36,[cx,ay-.1,az+.2],[0,0,0],[1,1.2,1]),pt(cone(.12,.4,8),0x8a5a36,[cx,ay-.32,az+.4],[Math.PI/2+.4,0,0]));
  for(const s of[-1,1]){const b0=[cx+s*.15,ay+.05,az+.25],b1=[cx+s*.6,ay+.35,az+.25],b2=[cx+s*.85,ay+.62,az+.2];p.push(lkRod(b0,b1,.05,0xefe3c8),lkRod(b1,b2,.04,0xefe3c8),lkRod(b1,[cx+s*.5,ay+.7,az+.3],.03,0xefe3c8),lkRod(b2,[cx+s*1.15,ay+.75,az+.2],.03,0xefe3c8))}}
 /* 계산대와 자판기 줄 사이: 큰 화분(식물·낚시) / 통(요리·사냥) */
 {const x=-.85,z=-D+.55;if(k==='fish'||k==='plant'){p.push(pt(cyl(.36,.28,.6,14),0xc77a52,[x,.3,z]),pt(new THREE.IcosahedronGeometry(.55,1),0x4f8a3c,[x,1.05,z]),pt(new THREE.IcosahedronGeometry(.4,1),0x5f9a3c,[x+.1,1.55,z+.05]))}else{p.push(pt(cyl(.36,.33,.95,12),0x8a5a36,[x,.48,z]),pt(cyl(.37,.37,.05,12),0x4a2e1c,[x,.75,z]),pt(cyl(.37,.37,.05,12),0x4a2e1c,[x,.25,z]))}blk.push([x,z,.45,.45])}
 /* 왼쪽 벽 가운데 */
 {const x=-W+.3;if(k==='fish'){const g=is82FishGeo(3.2,0x2f5f8a,0xd8e6ee,0x234d72);g.rotateY(Math.PI/2);p.push(pt(g,null,[x-.12,2.35,0]));Rb(.1,.7,2.4,0x8a5a36,[x-.2,2.35,0]);
   for(let i=0;i<5;i++)p.push(lkRod([x+.05,.2,-1.0+i*.5],[x-.05,2.1,-.9+i*.5],.022,[0x2c3346,0x3d6fa0,0x2c3346,0xe0533f,0x2c3346][i]));B(.12,.08,2.6,0x6f4a2c,[x-.1,1.3,0]);p.push(pt(new THREE.TorusGeometry(.32,.09,8,18),0xff7a3d,[x-.12,1.55,1.7],[0,Math.PI/2,0]));blk.push([x+.05,0,.45,1.5])}
  if(k==='plant'){for(let r=0;r<3;r++){Rb(.8-r*.18,.08,3.0,0x9c6a3d,[x+.2-r*.09,.45+r*.55,0]);for(let i=0;i<5;i++){const z=-1.2+i*.6;p.push(pt(cyl(.15,.12,.24,10),0xc77a52,[x+.25-r*.09,.61+r*.55,z]));const fk=['pw_flower_yellow','pw_poppy','pw_flower_blue','pw_mush','pw_strawberry'][(i+r)%5];if(GEO[fk])p.push(pt(GEO[fk],null,[x+.25-r*.09,.72+r*.55,z],[0,i,0],[.8,.8,.8]));else p.push(pt(new THREE.IcosahedronGeometry(.2,0),0x5f9a3c,[x+.25-r*.09,.9+r*.55,z]))}}
   for(let i=0;i<4;i++)B(.06,1.6,.06,0x6f4a2c,[x+.55,.8,-1.5+i]);blk.push([x+.2,0,.65,1.6])}
  if(k==='cook'){B(.7,2.6,2.6,0x8a5a36,[x+.1,1.3,0]);for(const y of[.6,1.3,2.0])B(.66,.05,2.5,0x6f4a2c,[x+.12,y,0]);for(const y of[.62,1.32,2.02])for(let i=0;i<5;i++){const z=-1.0+i*.5;if((i+((y*3)|0))%2)p.push(pt(cyl(.13,.13,.3,10),[0xe8c35a,0xf4efe4,0x7fbf5a][i%3],[x+.15,y+.16,z]));else Rb(.38,.45,.35,0xd9c49a,[x+.15,y+.23,z],0,.12,.08)}blk.push([x+.1,0,.5,1.4])}
  if(k==='hunt'){put('lk_fireplace',x+.2,0,-.2,Math.PI/2,1.35);gl.push(pt(box(.02,.5,.9),0xff8a3d,[x+.75,.45,-.2]));blk.push([x+.35,-.2,.7,1.3]);p.push(pt(new THREE.TorusGeometry(.3,.05,6,14),0x6b4426,[x-.05,2.1,1.9],[0,Math.PI/2,0]))}}
 /* 앞 왼쪽 가운데 꾸밈 */
 {const x=-4.6,z=2.4;if(k==='fish'){Rb(2.9,.6,1.3,0x6f4a2c,[x,.3,z]);gl.push(pt(box(2.7,.95,1.1),0x7fc8e8,[x,1.12,z]));for(const sz of[-1,1])B(2.8,.06,.06,0x2c2f33,[x,1.62,z+sz*.58]);for(const sx of[-1,1])B(.06,.06,1.2,0x2c2f33,[x+sx*1.38,1.62,z]);for(const sx of[-1,1])for(const sz of[-1,1])B(.06,1.0,.06,0x2c2f33,[x+sx*1.38,1.12,z+sz*.58]);
   [0xff7a3d,0xf2c94c,0x3f7fd0,0xff7a3d,0xe0533f].forEach((c,i)=>s4Fish(p,x-1.0+i*.5,.9+(i%3)*.22,z+(i%2?.25:-.2),.9,c,i*.7));for(let i=0;i<6;i++)p.push(pt(cone(.06,.35+(i%3)*.15,5),0x4f9a3c,[x-1.15+i*.45,.78,z-.35]));blk.push([x,z,1.5,.72])}
  if(k==='plant'){p.push(pt(cyl(1.3,1.4,.55,20),0xd8cdb6,[x,.28,z]),pt(cyl(1.18,1.18,.06,20),0x6e4a30,[x,.55,z]));for(let i=0;i<6;i++)p.push(pt(cyl(.07,.1,1.5,8),0x7a5a3a,[x,1.2,z]));p.push(pt(new THREE.IcosahedronGeometry(1.0,1),0x5f9a3c,[x,2.25,z]),pt(new THREE.IcosahedronGeometry(.7,1),0x6ea844,[x+.5,2.5,z+.2]),pt(new THREE.IcosahedronGeometry(.6,1),0x4f8a3c,[x-.5,2.55,z-.2]));
   for(let i=0;i<10;i++){const a=i/10*6.28;p.push(pt(new THREE.IcosahedronGeometry(.1,0),[0xff6b6b,0xffd35c,0xf28bb0,0xffffff][i%4],[x+Math.cos(a)*.9,.68,z+Math.sin(a)*.9]))}blk.push([x,z,1.4,1.4])}
  if(k==='cook'){for(const [dx,dz] of[[-1.1,-.1],[1.3,.6]]){put('lk_table_round',x+dx,0,z+dz,0,.8);for(const a of[0,2.1,4.2])put('lk_chair',x+dx+Math.sin(a)*.85,0,z+dz+Math.cos(a)*.85,a+Math.PI,.85);put('ds_dish_salad',x+dx,.66,z+dz,0,.6);blk.push([x+dx,z+dz,1.0,1.0])}}
  if(k==='hunt'){const rug=s4Shape([[-1.4,-.9],[-.6,-1.1],[0,-.85],[.6,-1.1],[1.4,-.9],[1.6,0],[1.4,.9],[.6,1.1],[0,.85],[-.6,1.1],[-1.4,.9],[-1.6,0]],.03);rug.rotateX(-Math.PI/2);p.push(pt(rug,0x5b3a22,[x,.02,z]));
   for(let i=0;i<3;i++)p.push(pt(cyl(.2,.2,1.8,9),[0x7a4a2a,0x845232,0x6b4024][i],[x,.2,z-.4+i*.4],[0,0,Math.PI/2]));Rb(2.0,.1,1.3,0x5b3a22,[x,.42,z]);put('lk_logs',x,.48,z,0,.8);for(const s of[-1,1])p.push(pt(cyl(.28,.3,.45,12),0x845232,[x+s*1.45,.22,z+.9]));blk.push([x,z,1.1,.8]);blk.push([x-1.45,z+.9,.32,.32]);blk.push([x+1.45,z+.9,.32,.32])}}
 /* 앞 오른쪽 구석 */
 {const x=6.3,z=3.6;if(k==='fish'){for(const [dx,dz] of[[0,0],[-.85,.25]])p.push(pt(cyl(.36,.33,.9,12),0x8a5a36,[x+dx,.45,z+dz]),pt(cyl(.37,.37,.05,12),0x4a2e1c,[x+dx,.7,z+dz]));Rb(.9,.6,.7,0xb98556,[x+.1,.3,z-1.1]);if(GEO.pnet)p.push(pt(GEO.pnet,null,[W-.35,0,z-2.3],[0,-Math.PI/2,0]));blk.push([x-.3,z-.4,1.0,1.1])}
  if(k==='plant'){for(const [dx,dz,c] of[[0,0,0xcdb588],[-.6,.2,0xd9c49a],[.1,-.7,0xcdb588]])Rb(.5,.65,.38,c,[x+dx,.33,z+dz],0,.14,.08);for(const [dx,dz] of[[-1.2,-.4],[-1.0,.6]]){p.push(pt(cyl(.2,.24,.34,12),0x6aa6c8,[x+dx,.17,z+dz]),pt(cyl(.03,.04,.4,6),0x6aa6c8,[x+dx+.26,.32,z+dz],[0,0,-.9]))}blk.push([x-.4,z-.1,1.0,.8])}
  if(k==='cook'){for(let i=0;i<3;i++){Rb(.8,.4,.55,0xa67848,[x-i*.2,.2+i*.4,z-i*.15]);for(let j=0;j<4;j++)p.push(pt(new THREE.IcosahedronGeometry(.1,1),[0xe0533f,0x7fbf5a,0xf28c38][i],[x-i*.2-.27+j*.18,.45+i*.4,z-i*.15]))}for(const dz of[-1.0,-1.5])Rb(.55,.7,.4,0xf4efe4,[x+.4,.35,z+dz],0,.14,.08);blk.push([x,z-.6,.75,1.1])}
  if(k==='hunt'){for(let r=0;r<4;r++)for(let c=0;c<4-(r>2?1:0);c++)p.push(pt(cyl(.15,.15,1.0,8),[0x7a4a2a,0x6b4024,0x845232][(r+c)%3],[x,.16+r*.29,z-.6+c*.32+(r%2)*.16],[0,0,Math.PI/2]));p.push(pt(cyl(.36,.33,.9,12),0x6b4024,[x-.2,.45,z-1.7]));blk.push([x,z-.8,.6,1.25])}}
 /* 오른쪽 벽 가운데(자판기 줄 앞쪽) */
 {const x=W-.25;if(k==='fish'){p.push(pt(new THREE.TorusGeometry(.32,.09,8,18),0xff7a3d,[x,2.2,-1.0],[0,Math.PI/2,0]),pt(new THREE.TorusGeometry(.32,.09,8,18),0xff7a3d,[x,2.2,.2],[0,Math.PI/2,0]));for(const [z,c] of[[-1.6,0x3a8fc4],[.8,0xf2c94c]])Rb(.08,1.2,.5,c,[x,1.8,z])}
  if(k==='plant'){B(.3,.06,2.6,0x8a5a36,[x-.1,1.7,-.4]);for(let i=0;i<5;i++){const z=-1.5+i*.55;p.push(pt(cyl(.14,.11,.22,10),0xc77a52,[x-.12,1.84,z]),pt(new THREE.IcosahedronGeometry(.18,0),0x5f9a3c,[x-.12,2.0,z]));for(let j=0;j<3;j++)p.push(pt(cone(.03,.5,4),0x4f8a3c,[x-.12+(j-1)*.08,1.6,z],[Math.PI,0,0]))}}
  if(k==='cook'){B(.08,.06,2.8,0x3a3f4a,[x,2.3,-.4]);for(let i=0;i<6;i++){const z=-1.6+i*.48;p.push(pt(cyl(.01,.01,.25,4),0x3a3f4a,[x-.05,2.15,z]));if(i%2)p.push(pt(cyl(.2,.2,.04,14),0x2c2f33,[x-.07,1.85,z],[0,0,Math.PI/2]));else p.push(pt(box(.04,.5,.08),0x9aa3ab,[x-.07,1.8,z]))}}
  if(k==='hunt'){for(const [z,c] of[[-1.4,0x8a5a36],[.4,0xb98556]]){const pel=s4Shape([[-.4,-.6],[0,-.7],[.4,-.6],[.5,.2],[.3,.6],[-.3,.6],[-.5,.2]],.03);pel.rotateY(-Math.PI/2);p.push(pt(pel,c,[x,1.8,z]))}}}
 /* 벽 위 빛 줄(낚시·식물) */
 if(k==='fish'||k==='plant')for(let i=0;i<28;i++){const x=-W+.3+i*(2*W-.6)/27;gl.push(pt(new THREE.SphereGeometry(.045,6,4),[0xff6b5e,0xffd34d,0x6bd38a,0x6bb7ff][i%4],[x,WH-.25-Math.abs(Math.sin(i*.6))*.12,-D+.05]))}
 const M=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true}));M.receiveShadow=true;H.add(M);if(gl.length)H.add(new THREE.Mesh(mg(gl),new THREE.MeshBasicMaterial({vertexColors:true})));
 intDoor(H,D+CL);SH84[k].blk=blk.concat([[3.45,-D+.62,3.7,.66]]);return H}

/* ========== 모양 만들기 · 놓기 ========== */
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();try{for(const c of['r','b','g'])pv84Geo(c);sh84FishGeo();sh84PlantGeo();sh84CookGeo();sh84HuntGeo();
  if(typeof lkAOnew==='function'){const b0=Object.assign({},GEO);for(const k in SH84)delete b0['sh84_'+k];for(const c of['r','b','g'])delete b0['pv84_'+c];lkAOnew(b0)}}catch(e){console.error('84차 가게 모양',e)}}}
/* 간판 글자(색을 고를 수 있게) */
function sh84Text(txt,w,h,px,col){const cv=document.createElement('canvas');cv.width=768;cv.height=128;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;
 const draw=()=>{const x=cv.getContext('2d');x.clearRect(0,0,768,128);x.font=`900 ${px}px `+(typeof UIF!=='undefined'?UIF:'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.28)';x.fillText(txt,386,70);x.fillStyle=col;x.fillText(txt,384,66);tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}
let SH84GM=null;const SH84TC={fish:'#fff6e0',plant:'#ffffff',cook:'#ffffff',hunt:'#4a2e1c'};
/* 건물 밖 부딪힘(지역 좌표 [x,z,반폭x,반폭z]) */
const SH84SOL={fish:[6.15,4.15],plant:[7.55,5.05],cook:[6.6,4.6],hunt:[6.68,4.68]};
const SH84PROP={fish:[[-5.7,5.55,.5,.42],[5.5,5.6,.42,.42],[-3.75,4.42,1.28,.36],[3.75,4.42,1.28,.36],[-2.1,4.45,.25,.2]],
 plant:[[-1.95,5.75,.46,.46],[1.95,5.75,.46,.46]],
 cook:[[-1.5,4.85,2.9,.36],[-5.4,5.25,.78,.58],[2.55,5.75,.38,.42],[5.45,4.78,.18,.18]],
 hunt:[[-6.2,6.2,.24,.24],[-2.1,6.2,.24,.24],[2.1,6.2,.24,.24],[6.2,6.2,.24,.24],[-7.5,-1.0,.55,1.0],[-7.45,1.6,.42,.42],[7.05,-1.4,.52,.52]]};
function sh84Put(k,x,z){const q=SH84[k],c=q.sc;q.x=x;q.z=z;const sw=SH84SOL[k][0]*c,sd=SH84SOL[k][1]*c;CLEARS.push([x,z+.8,Math.hypot(sw,sd)+2.6]);
 q.s=addStruct({t:'sh84_'+k,x,z,r:0,hp:1e9,sk:k});sh84Solid(x,z,sw,sd);for(const [lx,lz,bx,bz] of SH84PROP[k])addStruct({t:PLB(bx*c,bz*c),x:x+lx*c,z:z+lz*c,r:0,hp:1e9});
 if(k==='hunt'){const PZ=(SH84.hunt.porch-.25)*c;for(const [a,b] of[[-6.2,-2.1],[2.1,6.2]])plWallSeg(x+a*c,z+PZ,x+b*c,z+PZ,.12)}
 if(k==='fish'&&q.pier){const P=q.pier,y=hAt(x,z)-.04+P.y*c,x0=x+P.x0*c,x1=x+P.x1*c;addDock((x0+x1)/2,z,0,(x1-x0)/2,P.hz*c,y);q.dock={x0,x1,z0:z-P.hz*c,z1:z+P.hz*c,y}}
 q.door=addStruct({t:'sh84_door',x:x+q.dp[0]*c,z:z+q.dp[1]*c+.32,r:0,hp:1e9,sk:k,hk:q.hk});
 sh84Inside(k);return q.s}
/* 안의 구조물: 계산대(말 걸기) · 랜덤 자판기 · 재활용 쓰레기통 · 일반 자판기 셋 — 뒤 벽 앞에 나란히 */
function sh84Inside(k){const q=SH84[k],D=SH84R.hd;
 const I=(t,lx,lz,ex)=>{const x=INT.x+lx,z=INT.z+lz,s=addStruct(Object.assign({t,x,z,r:0,in:1,hk:q.hk,hp:1e9,yo:INT.y-hAt(x,z)+.04},ex||{}));if(s&&s.m)s.m.visible=false;return s};
 q.ctr=I('sh84_ctr',SH84CTR[0],SH84CTR[1],{sk:k});q.vs=[I('vend',.6,-D+.12+DECO.vend.bz,{pi:q.pi}),I('recycle',2.48,-D+.12+DECO.recycle.bz,{pi:q.pi})];
 ['r','b','g'].forEach((c,i)=>q.vs.push(I('pv84'+c,4.25+i*1.14,-D+.12+DECO['pv84'+c].bz,{pi:q.pi,col:c})))}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{const k=r&&SH84K[r.t];if(k&&r.m){const q=SH84[k],host=r.m.children[0]||r.m;
   if(GEO['sh84_'+k+'_glow']&&typeof HGLOW!=='undefined')host.add(mesh(GEO['sh84_'+k+'_glow'],HGLOW,false));
   if(k==='plant'&&GEO.sh84_plant_glass){const gm=mesh(GEO.sh84_plant_glass,SH84GM||(SH84GM=new THREE.MeshLambertMaterial({color:0xa9e0d2,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide})),false);gm.renderOrder=2;host.add(gm)}
   if(q.sign){const t=sh84Text(q.sign.t,q.sign.w,q.sign.h,q.sign.px,SH84TC[k]);t.position.set(...q.sign.pos);host.add(t)}
   if(typeof PLAMPS!=='undefined')for(const [x,y,z] of q.lamps||[]){const l=glow(0xffc46a,2.6*q.sc,.55);l.position.set(x*q.sc,y*q.sc,z*q.sc);l.visible=false;r.m.add(l);PLAMPS.push(l)}
   if(q.chim&&typeof glowTex!=='undefined'){const SM=new THREE.SpriteMaterial({map:glowTex,color:0xd8dde3,transparent:true,opacity:.5,depthWrite:false});q.smoke=[];for(let i=0;i<7;i++){const sp=new THREE.Sprite(SM.clone());sp.userData.t=i/7;r.m.add(sp);q.smoke.push(sp)}}}
  if(r&&/^pv84/.test(r.t)&&r.m&&GEO.pv79_glow&&typeof HGLOW!=='undefined')(r.m.children[0]||r.m).add(mesh(GEO.pv79_glow,HGLOW,false))}catch(e){console.error(e)}return r}}

/* ========== 예전 꾸밈 없애고 가게 놓기 ========== */
/* 낚시섬: 철조망·문은 그대로, 캠프 오두막·데크·훈제실·잔교·배·소품 없음 → 서쪽 바닷가에 낚시 가게 */
plFishCamp=function(){const F=FCAMP,OX=FISHISLE.x,OZ=FISHISLE.z,W=(x,z)=>[OX+x,OZ+z],bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x:OX+x,z:OZ+z,r,hp:1e9}),gh=(x,z)=>hAt(OX+x,OZ+z);
 const [gx,gz]=F.gate;CLEARS.push([OX-3,OZ-7,27]);
 const A=[[-24.5,10.2],[-18,11.0],[-11,11.8],[-5,12.3],[gx-1.35,gz]].map(q=>W(q[0],q[1])),B=[[gx+1.35,gz],[5,12.2],[10.5,11.2],[15,8.4],[17.8,3.5],[18.6,-3.5],[17.8,-10.5],[15.4,-16.5],[12.2,-21.5],[11.4,-25.5],[11.6,-29.5]].map(q=>W(q[0],q[1]));
 const gskip=(x,z)=>Math.abs(x-OX-gx)<1.95&&Math.abs(z-OZ-gz)<.8;
 {const g=mg(plFenceGeo(A,1,gskip).concat(plFenceGeo(B,1,gskip)));lkSmooth(g,50);plAdd(g,0,0,0)}
 {const g=addStruct({t:'cgate',x:OX+gx,z:OZ+gz,r:0});g.open=false;g.ot=0;const t=plSignText('🎣 낚시섬');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 sh84Put('fish',OX+SH84P.fish[0],OZ+SH84P.fish[1]);
 if(GEO.tree_single_A){const v=[];for(const [x,z,s,r,k] of [[15.4,-13.4,2.6,.4,'tree_single_A'],[13.8,7.2,2.2,2.1,'tree_single_A'],[-16.6,7.6,2.0,.7,'tree_single_B']]){if(GEO[k])v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,r,0],[s,s,s]));bl(x,z,.3,.3)}plAdd(mg(v),OX,0,OZ)}};
/* 식물섬: 바위 언덕 벽·문은 그대로(81차), 헛간·농가·풍차·온실·밭·소품·바깥 판매대 없음 → 식물 가게 */
plPlantIsle=function(){if(typeof lkModel!=='function')return;const C=piCols(),R=pis81Ridge(C);piCliffWalls(C);pis81RidgeDeco(C,R);
 let rMax=0;for(const c of C)rMax=Math.max(rMax,Math.hypot(c.ox-PIS.x,c.oz-PIS.z));PIS.nr=Math.ceil(rMax+2.5);CLEARS.push([PIS.x,PIS.z,PIS.nr+2]);
 piGateModel();{const gz=PIS.gzo-.45,g=addStruct({t:'pgate',x:PIS.gx,z:gz,r:0});g.open=false;g.ot=0;const t=plSignText('🌱 식물섬',1.6,.34,70);t.position.set(0,2.1,.31);if(g.m)g.m.add(t)}
 PIS.plaza=[SH84P.plant[0],SH84P.plant[1]+8];PIS.stall=null;PIS81.list=[{k:'shop',x:SH84P.plant[0],z:SH84P.plant[1]+.4,bx:SH84SOL.plant[0],bz:SH84SOL.plant[1]+.8}];
 sh84Put('plant',SH84P.plant[0],SH84P.plant[1])};
/* 수달섬: 다리·철조망·문은 그대로, 가판대·부엌·텐트·오두막·활터·풍차·밭·나무·등·바위·꽃 없음 → 요리 가게 · 사냥꾼 상점 */
otBuild=function(){if(typeof lkModel!=='function')return;const gh=(x,z)=>hAt(x,z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x,z,r,hp:1e9}),at=(g,x,z,ry=0,m,dy=0)=>plAdd(g,x,gh(x,z)-.02+dy,z,ry,m);
 CLEARS.push([OTR.x,OTR.z,OTR.R]);const b=OTB=otBridgeLine();CLEARS.push([b.S1[0]+b.dx*3.5,b.S1[1]+b.dz*3.5,7.5]);
 {const n0=structs.length,g=otBridgeGeo(b);plAdd(g.wood,0,0,0);if(g.glow){const m=new THREE.MeshBasicMaterial({color:0xffd36a});plAdd(g.glow,0,0,0,0,m)}
  const n=Math.ceil(b.len/1.5),r=Math.atan2(b.dx,b.dz);for(let i=0;i<n;i++){const t=(i+.5)/n,x=b.S0[0]+b.dx*b.len*t,z=b.S0[1]+b.dz*b.len*t;addDock(x,z,r,1.16,b.len/n/2+.06,b.yAt(t))}
  for(const o of[-1.3,1.3]){const ax=b.G[0]+b.px*o,az=b.G[1]+b.pz*o,ex=b.S1[0]+b.px*o,ez=b.S1[1]+b.pz*o;plWallSeg(ax,az,ex,ez,.14)}
  const ex=b.S1[0]-b.dx*.4,ez=b.S1[1]-b.dz*.4,ry=Math.atan2(-b.dx,-b.dz),arch=at(GEO.ot_arch,ex,ez,ry);const t=plSignText('🍳 수달섬 🏹',2.1,.42);t.position.set(0,2.62,.115);arch.add(t);
  for(const o of[-1.6,1.6])bl(ex+b.px*o,ez+b.pz*o,.26,.26);for(let k=n0;k<structs.length;k++)structs[k].nobx=1}
 {const loop=otFenceLoop(),G=b.G;let i0=0,bd=1e9;loop.forEach((q,i)=>{const d=Math.hypot(q[0]-G[0],q[1]-G[1]);if(d<bd){bd=d;i0=i}});
  const N=loop.length,arc=[];for(let k=1;k<N;k++){const q=loop[(i0+k)%N];if(Math.hypot(q[0]-G[0],q[1]-G[1])>2.6)arc.push(q)}
  const e1=[G[0]+b.px*1.32,G[1]+b.pz*1.32],e2=[G[0]-b.px*1.32,G[1]-b.pz*1.32],d1=Math.hypot(arc[0][0]-e1[0],arc[0][1]-e1[1]),d2=Math.hypot(arc[0][0]-e2[0],arc[0][1]-e2[1]);
  const pts=d1<d2?[e1,...arc,e2]:[e2,...arc,e1];OTB.fence=pts;
  plAdd(mg(plFenceGeo(pts,true,(x,z)=>Math.hypot(x-G[0],z-G[1])<2.5)),0,0,0);
  plWallSeg(pts[0][0],pts[0][1],pts[1][0],pts[1][1],.3);plWallSeg(pts[pts.length-1][0],pts[pts.length-1][1],pts[pts.length-2][0],pts[pts.length-2][1],.3);
  const rg=Math.atan2(-b.dx,-b.dz),g=addStruct({t:'cgate',x:G[0],z:G[1],r:rg});g.open=false;g.ot=0;const t=plSignText('🍳 수달섬 🏹');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 sh84Put('cook',SH84P.cook[0],SH84P.cook[1]);sh84Put('hunt',SH84P.hunt[0],SH84P.hunt[1]);
 /* 섬 가장자리 나무 몇 그루(길·건물에서 떨어진 곳) */
 const F=OTB.fence,inF=(x,z,m)=>{if(gh(x,z)<.97)return false;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;const ddx=q[0]-a[0],ddz=q[1]-a[1],t=clamp(((x-a[0])*ddx+(z-a[1])*ddz)/(ddx*ddx+ddz*ddz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-ddx*t,z-a[1]-ddz*t))}return c&&d>m};
 const v=[];SH84T.n=0;for(const [x,z] of SH84P.trees){const k=hash(x|0,z|0,84)>.5?'tree_single_A':'tree_single_B';if(!GEO[k]||!inF(x,z,2.4)||otWorn(x,z)>.05||structs.some(s=>Math.abs(s.x-x)<9&&Math.abs(s.z-z)<9&&inStruct(s,x,z,2.2)))continue;SH84T.n++;const sc=3.4+hash(z|0,x|0,85)*.6;v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,hash(x|0,z|0,86)*6,0],[sc,sc,sc]));bl(x,z,.42,.42)}if(v.length)plAdd(mg(v),0,0,0)};
is82Otter=function(){};is82Fish=function(){};vs81Place=function(){};   /* 82차 바깥 꾸밈·81차 바깥 자판기 묶음은 없앰(자판기는 가게 안으로) */
/* 자리(세상 좌표; 낚시는 캠프 기준 지역 좌표) · 흙길 */
const SH84P={fish:[-6.6,-8.6],plant:[89.2,656.4],cook:[248,772.6],hunt:[269.4,789],trees:[[237,786],[243,797],[289,772],[283,803],[231,779],[259,809],[256,764],[290,786]]};
const SH84W={fish:[[-1,12.4],[-1.6,8.6],[-3.6,4.8],[-5.8,1.4],[-6.6,-1.2]],
 plant:[[[85,701],[85.6,696],[85,690.5],[85,684],[86.8,676],[88.8,668.5],[89.2,664.8]]],
 otter:[[[291.6,756.4],[286,761.2],[279,767],[271.5,772.8]],[[271.5,772.8],[262,778.4],[256,779.6],[252.95,779.4]],[[271.5,772.8],[279.5,779],[281.2,787],[280.6,794.5],[276,798],[269.4,797.8]]]};
plWorn=function(fx,fz){if(fx<-26||fx>20||fz<-26||fz>14)return 0;const d=plSegD(fx,fz,SH84W.fish),n=noise(fx*.6+3,fz*.6+9,77);return clamp((1-sm(1.0,2.3,d+(n-.5)*.45))*.85*(.85+n*.3),0,1)};
if(typeof plWornPI==='function')plWornPI=function(x,z){if(Math.abs(x-PIS.x)>34||Math.abs(z-PIS.z)>40)return 0;const n=noise(x*.6+5,z*.6+1,79);let d=9;for(const L of SH84W.plant)d=Math.min(d,plSegD(x,z,L));
 const w=Math.max((1-sm(1.0,2.3,d+(n-.5)*.45))*.85,(1-sm(2.2,3.6,Math.hypot(x-SH84P.plant[0],z-(SH84P.plant[1]+9.6))))*.7);return clamp(w*(.8+n*.35),0,1)};
otWorn=function(x,z){if(Math.abs(x-OTR.x)>48||Math.abs(z-OTR.z)>48)return 0;const n=noise(x*.5,z*.5,82);let d=9;for(const L of SH84W.otter)d=Math.min(d,plSegD(x,z,L));return clamp((1-sm(1.0,2.3,d+(n-.5)*.5))*.85*(.85+n*.3),0,1)};

/* ========== 들어가기 · 나가기 · 안 ========== */
const sh84In=()=>INT.on&&SH84K[INT.kind];
function sh84Enter(k){const q=SH84[k],s=q.door;if(!s||P.dead||busy||INT.on)return;
 fadeDo(q.n+' 안으로…',()=>{intBuild();if(!INT.gr[q.room]){try{const H=sh84Room(k);H.visible=false;INT.g.add(H);INT.gr[q.room]=H}catch(e){console.error('84차 가게 방',e)}INT.dock.hl=Math.max(INT.dock.hl,SH84R.hd+SH84R.cor[1]+.8);INT.full=Math.max(INT.full,SH84R.hw+1.2)}
  intRoom(q.room);setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+q.ret};INT.s=s;INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.door-.2,yo:INT.y-hAt(INT.x,INT.z+INT.door-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+INT.door-1.75;camT.set(P.x,INT.y,P.z);P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6);sfx(520,.08,'sine',.03,.4);
  setTimeout(()=>{if(sh84In()===k)sh84Say(k,q.i===0?0:null)},700)})}
{const _sl=sLabel;sLabel=function(s){const k=SH84K[s.t];if(k)return null;if(s.t==='sh84_door')return INT.on?null:SH84[s.sk].n+' 들어가기';if(s.t==='sh84_ctr')return sh84In()===s.sk?'말 걸기':null;
  if(/^pv84/.test(s.t))return s.in&&s.hk!==curHK()?null:'일반 자판기';return _sl(s)}}
{const _it=interact;interact=function(){const t=target;if(t&&t.k==='s'){const s=t.s;if(s.t==='sh84_door'){if(inp.actEdge)sh84Enter(s.sk);return}
   if(s.t==='sh84_ctr'&&sh84In()===s.sk){if(inp.actEdge)sh84Say(s.sk);return}if(/^pv84/.test(s.t)){if(inp.actEdge){PV84.col=s.col||s.t.slice(4);PV84.pi=s.pi|0;openPanel('pvend84')}return}}return _it.apply(this,arguments)}}
/* 낚싯대를 들고 있어도 가게 문은 들어가요(배 타기처럼) */
{const _ft=findTarget;findTarget=function(){if(isRod(curId())&&!INT.on&&!bmode&&!P.dead&&!fishing&&WTR.st!=='swim'){for(const k in SH84){const s=SH84[k].door;if(s&&dist(P.x,P.z,s.x,s.z)<5&&sGap(P.x,P.z,s)<=TREACH)return{k:'s',s,x:s.x,z:s.z,lab:SH84[k].n+' 들어가기',rr:1.2}}}return _ft()}}
{const _gp=ghostPos;ghostPos=function(){const pr=_gp.apply(this,arguments);if(sh84In()){pr.ok=false;pr.why='가게 안에는 아무것도 놓을 수 없어요'}return pr}}
/* 방 안 부딪힘(방 가운데 기준 [x, z, 반폭x, 반폭z]) */
{const _iw=intWalk;intWalk=function(x,z,r){const v=_iw.apply(this,arguments),k=sh84In();if(v!==null||!k)return v;const lx=x-INT.x,lz=z-INT.z,rr=r||.42;
  for(const b of SH84[k].blk||[])if(Math.abs(lx-b[0])<b[2]+rr&&Math.abs(lz-b[1])<b[3]+rr)return true;return null}}
/* 카메라: 방이 넓어서 다 담으려 하지 않고(캐릭터가 너무 작아져요) 산장 방쯤의 거리에서 캐릭터를 따라가요 */
{const _ic=intCam;intCam=function(ct){if(!sh84In())return _ic(ct);const cl=INT.cl||0,t=Math.tan(cam.fov*Math.PI/360),as=cam.aspect,a=.72;
  const fit=Math.max((2*INT.hw+1.7)/(2*t*as),(2*INT.hd+cl+3.8)/(2*t)),ref=Math.max((2*5.4+1.7)/(2*t*as),(2*4.2+cl+3.8)/(2*t)),d=Math.min(fit,ref);
  const hx=d*t*as,hz=d*t/Math.sin(a+.25),rx=Math.max(0,INT.hw+.9-hx),zc=INT.z+cl/2,rz=Math.max(0,INT.hd+cl/2+1.2-hz);
  const fx=INT.x+clamp(ct.x-INT.x,-rx,rx),fz=zc+clamp(ct.z-zc,-rz,rz);cam.position.set(fx,INT.y+.9+Math.sin(a)*d,fz+.75+Math.cos(a)*d);cam.lookAt(fx,INT.y+.9,fz+.75)}}
/* 빛: 따뜻하고 밝게 */
{const _il=intLight;intLight=function(dk){_il(dk);if(sh84In()){hemi.intensity=.46;hemi.color.setRGB(1,.96,.9);hemi.groundColor.setRGB(.42,.36,.3);sun.intensity=.4;sun.color.setRGB(1,.94,.84);INT.L.position.set(0,2.9,.4);scene.background.setRGB(.05,.045,.04)}}}

/* ========== 상인(산장 주인과 같은 방식) ========== */
const SH84L={fish:['어서 와요! 여긴 낚시꾼들의 가게예요.','벽에 걸린 게 낚시 도감이에요. 다 채우면 꼭 보여 줘요.','오늘은 물때가 좋네요. 등대 앞바다엔 큰 놈이 살아요.','자판기 물건은 한 시간마다 바뀌어요. 자주 들러요.'],
 plant:['어서 와요! 식물 가게예요.','식물 도감을 다 채운 사람만 이 섬에 들어올 수 있어요.','씨앗은 작업대에서 같은 작물 네 개로 만들어요.','벽의 게시판에서 섬의 식물을 다시 볼 수 있어요.'],
 cook:()=>OT_LINES.cook,hunt:()=>OT_LINES.hunt};
function sh84Lines(k){const L=SH84L[k];return typeof L==='function'?L():L}
function sh84Say(k,i){const q=SH84[k],L=sh84Lines(k),s=L[(i!=null?i:q.i)%L.length];q.i++;if(typeof CHAT!=='undefined')CHAT.say('sh84_'+k,s);else toast(s);sfx(k==='hunt'?520:640,.05,'sine',.03);if(q.a)q.a.play('Interact',{once:1,lock:.6,force:1})}
if(typeof CHAT!=='undefined'){const _an=CHAT.anchor.bind(CHAT);CHAT.anchor=function(k){if(/^sh84_/.test(k)){const q=SH84[k.slice(5)];return q&&q.a&&sh84In()===q.k?{x:q.a.root.position.x,z:q.a.root.position.z,y:3.0}:null}return _an(k)}}
function sh84Npc(k){const q=SH84[k];if(q.a||!CMAT.fisher)return q.a;let M=null,hat=null,hs=1.25;
 if(k==='plant'){M=typeof piGardenerMat==='function'?piGardenerMat():null;hat=typeof piHatGeo==='function'?piHatGeo():null;hs=1.3}
 if(k==='cook'||k==='hunt'){M=typeof otMat==='function'?otMat(k):null;hat=GEO[k==='cook'?'ot_chefhat':'ot_hunthat'];hs=k==='cook'?1.25:1.3}
 if((k!=='fish')&&!M)return null;const a=q.a=new Actor('fisher');if(M)a.root.traverse(o=>{if(o.isMesh)o.material=o.isSkinnedMesh?M.s:M.n});
 if(a.head&&hat){const h=mesh(hat,MATT);h.position.set(0,1.02,.02);h.rotation.x=-.08;h.scale.setScalar(hs);a.head.add(h)}a.play('Idle',{force:1});q.rot=0;a.root.visible=false;return a}
function sh84Tick(dt){const ins=sh84In();for(const k in SH84){const q=SH84[k];if(ins===k&&!q.a)sh84Npc(k);const o=q.a;if(!o)continue;o.root.visible=ins===k;if(ins!==k)continue;
  const x=INT.x+SH84NPC[0],z=INT.z+SH84NPC[1];o.root.position.set(x,INT.y,z);const want=dist(P.x,P.z,x,z)<7?Math.atan2(P.x-x,P.z-z):0;let df=want-q.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;q.rot+=df*Math.min(1,dt*4);o.root.rotation.y=q.rot;o.mixer.update(dt)}
 if(!INT.on)for(const k of['cook','hunt']){const q=SH84[k];if(!q.smoke||!q.chim||dist(P.x,P.z,q.x,q.z)>110)continue;const c=q.chim.map(v=>v*q.sc);for(const sp of q.smoke){sp.userData.t=(sp.userData.t+dt*.16)%1;const u=sp.userData.t;sp.position.set(c[0]+Math.sin(u*5+sp.id)*.3+u*.9,c[1]+u*3.2,c[2]-u*.4);const s=(.7+u*2)*q.sc;sp.scale.set(s,s,1);sp.material.opacity=.5*(1-u)*Math.min(1,u*6)}}}
{const _u=updEnv;updEnv=function(dt,x,z){_u.apply(this,arguments);try{sh84Tick(dt)}catch(e){}}}
if(typeof drawFx==='function'){const _df=drawFx;drawFx=function(dt){_df(dt);try{const k=sh84In(),q=k&&SH84[k],o=q&&q.a;if(mode!=='play'||!o||(typeof CHAT!=='undefined'&&CHAT.b&&CHAT.b.has('sh84_'+k)))return;
  const s=Math.max(.8,UIS*1.25),p=scr(o.root.position.x,INT.y+3.5,o.root.position.z);if(p[2])uiPill(fctx,q.npc,p[0],p[1],12.5*s,q.pill,'#fff')}catch(e){}}}

/* ========== 일반 자판기(색깔별) 창 ========== */
const pv84List=c=>(PV84.items[c]||[]).filter(q=>q&&ITEMS[q[0]]).map(q=>{const it=ITEMS[q[0]],n=q[1]||1;return{k:q[0],n,pr:PV84.free?0:(q[2]!=null?q[2]:(it.p||0)*n)}});
function pv84Html(){const c=PV84.col,L=pv84List(c);if(!L.length)return'<div class="row"><div class="tx">아직 파는 물건이 없어요<small>곧 물건이 채워질 예정이에요 (준비 중)</small></div></div>';
 return L.map(q=>{const it=ITEMS[q.k],has=it.one&&invN(q.k),ok=!has&&S.coins>=q.pr;
  return`<div class="row">${invIcon(q.k)}<div class="tx">${it.n}${q.n>1?' ×'+q.n:''}<small>${it.d||''}</small></div><button class="btn" data-a="pv84buy" data-k="${q.k}" ${ok?'':'disabled'}>${has?'보유 중':q.pr?q.pr+' 동전':'무료로 받기'}</button></div>`}).join('')}
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);if(panel!=='pvend84')return;$('ptabs').innerHTML=`<div class="tab on">🥤 ${PV84.nm[PV84.col]||''} 일반 자판기</div>`;$('pbody').innerHTML=pv84Html()}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="pv84buy"]');if(!b||b.disabled||panel!=='pvend84')return;const q=pv84List(PV84.col).find(v=>v.k===b.dataset.k);if(!q)return;const it=ITEMS[q.k];
 if(!bagHas(q.k)){bagFullMsg();return}if(it.one&&invN(q.k)){toast('이미 갖고 있어요')}else if(S.coins<q.pr){toast('동전이 모자라요')}else{S.coins-=q.pr;give(q.k,q.n);sfx(880,.07);sfx(1320,.05,'sine',.03);toast(`${it.n}${q.n>1?' ×'+q.n:''} 샀어요`);hudDirty=true}renderPanel()});
