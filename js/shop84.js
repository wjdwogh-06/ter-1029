/* ===== 84·85차(규칙): 상인 넷(낚시·식물·사냥·요리)은 가게 건물 안에 =====
   84차(기획자 11-26 19:50): '사냥·요리·식물·낚시 전부 내부에 들어가면 상인이 있게(산장처럼)', '낚시집은 바다 근처·나무판·엄청 큰 물고기 간판',
          '주변 장식물은 과감히 없애고 길 정도만', '상점 안에 재활용 쓰레기통·랜덤 자판기·일반 자판기 색깔별로 3개, 벽 앞에 나란히(물건은 아직 없음)'.
   85차(기획자 11-26 22:03): '건물 자체가 너무 커서 최대로 줌아웃해도 한 번에 안 보여 — 건물 하나 자체는 좀 줄여 줘(판자 같은 바닥·면적은 유지해도 돼)',
          '외형이 너무 단순해', '내부 크기는 좀 더 키워 주고 방도 몇 개, 전부 다르게', '건물 밖 구조물은 유지하거나 넓히거나 꾸미고',
          '사냥·요리 상점은 마주 보게(대신 너무 옆으로 보이게나 붙이지 말고)'.
   - 바깥: 건물은 약 10~11 × 6~6.6m, 2층, 꼭대기 약 7.5~8.6m(카메라를 가장 멀리 하면 문 앞에서 한 화면에 다 보여요 — p85_check fit).
     둘레 바닥(예전 건물 넓이쯤, 약 16.6 × 12.6m)은 그대로 두고 꾸밈을 올렸어요: 낚시 = 판자 데크 + 바다로 뻗은 잔교, 식물 = 돌 마당·화단·분수·장미 아치,
     요리 = 자갈 마당·파라솔 식탁·화덕, 사냥 = 흙 마당·통나무 울타리·가죽 틀·과녁·모닥불. 바닥 높이·벽은 props.js PRF 방식(올라서는 바닥 + 막힌 칸).
   - 요리·사냥 가게는 수달섬 가운데 광장을 사이에 두고 서로 26°씩 안쪽으로 돌아 마주 봐요(정면이 카메라 쪽에서 크게 벗어나지 않게).
   - 안: 22~24 × 14~15m, 가운데 큰 방(계산대·상인·자판기 줄) + 옆방 둘~셋(가게마다 다름, 벽에 문·방 이름표).
     가운데 큰 방 뒤 벽 앞에 랜덤 자판기 · 재활용 쓰레기통 · 일반 자판기 셋(빨강·파랑·초록, PV84.items) — 84차 그대로.
   - 문 앞에서 오른쪽 조이스틱 톡 = [○○ 들어가기] → 안으로(내 기지 S.home은 안 바뀜, 산장과 같은 방식).
   - 멀티 서버는 가게를 몰라요(각자 화면, 서버 마무리 때). 안전 구역·설치 금지 원은 예전 그대로. */
const SH84={
 fish:{n:'낚시 가게',npc:'낚시 상인',pill:'#3f8fb7',ic:'🎣',pi:8,sc:1,r:0,B:[4.8,3.0],LY:.36,dp:[0,3.0],ret:1.5,
  lots:[[-8.4,8.2,-3.9,8.7],[-20.6,-8.3,1.2,4.4]]},
 plant:{n:'식물 가게',npc:'식물섬 주인',pill:'#4f9a52',ic:'🌱',pi:9,sc:1,r:0,B:[5.4,3.0],LY:.24,dp:[0,3.9],ret:1.3,
  lots:[[-8.6,8.6,-4.2,9.2]]},
 cook:{n:'요리 가게',npc:'요리 상인',pill:'#e0533f',ic:'🍳',pi:10,sc:1,r:.46,B:[5.0,2.8],LY:.2,dp:[2.45,2.8],ret:1.4,
  lots:[[-8.2,8.2,-4.0,8.6]]},
 hunt:{n:'사냥꾼 상점',npc:'사냥꾼 상인',pill:'#5f7a3a',ic:'🏹',pi:11,sc:1,r:-.46,B:[5.0,2.8],LY:.14,dp:[0,2.8],ret:2.0,
  lots:[[-8.2,8.2,-4.0,8.6],[-4.7,4.7,2.8,4.65,.44]]}};
/* 안: 방 크기 · 계산대 · 상인 · 자판기 줄(랜덤·쓰레기통·빨강·파랑·초록의 x) · 바닥 · 칸막이 벽(축, 자리, 시작, 끝, 문[[가운데, 폭]], 낮은 벽?) · 방 이름표 */
const SH85IN={
 fish:{hw:11,hd:7,ctr:[-3.8,-4.3],npc:[-3.8,-5.4],row:[-.6,1.28,3.05,4.19,5.33],
  rooms:[[-6,6,-7,7,'plank',[0xc79a66,0xbd9060,0xd0a470,0xb88a5a]],[-11,-6,0,7,'tile',[0x6a9bb8,0x5f8fac],.6],[-11,-6,-7,0,'tile',[0xe8eef2,0xd3dbe1],.5],[6,11,-7,7,'plank',[0x8a5a36,0x7d5232,0x96633d]]],
  part:[['z',-6,-7,7,[[3.4,1.7]]],['z',6,-7,7,[[2.6,1.7]]],['x',0,-11,-6,[[-8.6,1.6]],1]],
  signs:[['🐠 수조실',-6,3.4,'z'],['❄ 냉동 창고',-8.6,0,'x'],['🪝 낚시 도구 공방',6,2.6,'z']]},
 plant:{hw:12,hd:7.5,ctr:[3.85,-4.8],npc:[3.85,-5.9],row:[-5.15,-3.27,-1.5,-.36,.78],
  rooms:[[-6,6,-7.5,7.5,'tile',[0xd9875a,0xc9774f],.75],[-12,-6,-7.5,7.5,'stone',[0x8a9a7a,0x7d8f6e,0x95a585,0x6f8a63],.7],[6,12,-.5,7.5,'plank',[0xb98556,0xa67848,0xc08d5c]],[6,12,-7.5,-.5,'tile',[0xf1e6d0,0xd8c3a0],.55]],
  part:[['z',-6,-7.5,7.5,[[2.4,1.8]]],['z',6,-7.5,7.5,[[3.6,1.7]]],['x',-.5,6,12,[[9,1.6]],1]],
  signs:[['🌴 열대 온실',-6,2.4,'z'],['🪴 분갈이실',6,3.6,'z'],['🌰 씨앗 창고',9,-.5,'x']]},
 cook:{hw:11.5,hd:7,ctr:[-3.8,-4.3],npc:[-3.8,-5.4],row:[-.6,1.28,3.05,4.19,5.33],
  rooms:[[-6,6,-7,7,'tile',[0xf1e6d0,0xc8643c],.6],[-11.5,-6,-7,7,'tile',[0xf4f4f0,0xd9dde0],.42],[6,11.5,0,7,'tile',[0xf7d6dc,0xfdf3f0],.5],[6,11.5,-7,0,'plank',[0xa67848,0x9e7044,0xb98556]]],
  part:[['z',-6,-7,7,[[2.2,1.8]]],['z',6,-7,7,[[3.4,1.7]]],['x',0,6,11.5,[[8.75,1.6]],1]],
  signs:[['🔥 주방',-6,2.2,'z'],['🍰 디저트 코너',6,3.4,'z'],['🧺 식료품 창고',8.75,0,'x']]},
 hunt:{hw:11.5,hd:7,ctr:[3.85,-4.3],npc:[3.85,-5.4],row:[-5.15,-3.27,-1.5,-.36,.78],
  rooms:[[-6,6,-7,7,'plank',[0x7d5232,0x6f4a2c,0x8a5a36,0x74492c]],[-11.5,-6,0,7,'plank',[0xa67848,0x9e7044,0xb98556]],[-11.5,-6,-7,0,'stone',[0x8f969c,0x7f868d,0x9aa1a8],.7],[6,11.5,-7,7,'stone',[0x5f656b,0x6a7076,0x585e63],.8]],
  part:[['z',-6,-7,7,[[3.4,1.7]]],['z',6,-7,7,[[2.6,1.7]]],['x',0,-11.5,-6,[[-8.75,1.6]],1]],
  signs:[['🔥 벽난로 쉼터',-6,3.4,'z'],['🔪 가죽 작업실',-8.75,0,'x'],['🏹 무기고',6,2.6,'z']]}};
const SH84T={n:0};const SH84K={sh84_fish:'fish',sh84_plant:'plant',sh84_cook:'cook',sh84_hunt:'hunt'};   /* 방 종류 → 가게 */
const SH84R={lc:0xffe2b8,ld:26,li:1.5,cor:[1.15,1.7]};
for(const k in SH84){const q=SH84[k],C=SH85IN[k];INT_ROOM['sh84_'+k]=Object.assign({hw:C.hw,hd:C.hd},SH84R);q.k=k;q.hk='sh84_'+k;q.room='sh84_'+k;q.i=0;q.walls=[];
 DECO['sh84_'+k]={g:'sh84_'+k,s:1,bx:q.B[0],bz:q.B[1],pass:1,hp:1e9};
 /* 바닥·벽(props.js PRF): 마당 위는 그 높이로 걷고, 건물·소품 자리는 막혀요 */
 let R=0;for(const L of q.lots)for(const x of[L[0],L[1]])for(const z of[L[2],L[3]])R=Math.max(R,Math.hypot(x,z));
 PRF['sh84_'+k]={R:R+1,f:(x,z)=>sh85At(k,x,z)}}
function sh85At(k,x,z){const q=SH84[k];let h=null;for(const L of q.lots)if(x>=L[0]&&x<=L[1]&&z>=L[2]&&z<=L[3]){const y=L[4]!=null?L[4]:q.LY;if(h==null||y>h)h=y}
 if(h==null)return null;for(const w of q.walls)if(Math.abs(x-w[0])<w[2]+.18&&Math.abs(z-w[1])<w[3]+.18)return PRW;return h}   /* 벽은 0.18m 넉넉히(몸이 소품에 덜 박히게) */
DECO.sh84_door={g:'nil',s:1,bx:1.05,bz:.32,pass:1,hp:1e9};DECO.sh84_ctr={g:'nil',s:1,bx:1.9,bz:.5,pass:1,hp:1e9};
/* 일반 자판기 셋(색깔별) — 파는 물건: [아이템 id, 묶음 개수, 가격] (가격 없으면 원래 가격 × 묶음). 기획자가 정해 주면 채우기 */
ITEMS.kit_gwhite={n:'흰 울타리 문',ic:'lk_gate_white',ty:'kit',b:'gate_white',p:80,d:'흰 울타리에 이어 놓아요. 가까이 가면 문이 열려요.'};
BUILDS.gate_white={...BUILDS.gate_wood,n:'흰 울타리 문',g:'lk_gate_white',kit:'kit_gwhite',c:{kit_gwhite:1}};
const basicVendStock=[['axe'],['kit_stash'],['kit_bench'],['kit_gen',1,800],['kit_fwhite'],['kit_gwhite']];
PV79.items=basicVendStock;
const PV84={items:{r:basicVendStock,b:[],g:[]},free:0,col:'r',nm:{r:'빨간',b:'파란',g:'초록'},
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
  for(let k=1;k<Math.floor(L/.42);k++){const t=k*.42,x=sx*(EX-Math.cos(ang)*t),y=y0+Math.sin(ang)*t;p.push(pt(box(.06,.05,ZL),c2,[x+n[0]*.12,y+n[1]*.12,zc],[0,0,-sx*ang]))}}
 p.push(pt(cyl(.14,.14,ZL+.04,8),c2,[0,y0+rise+.06,zc],[Math.PI/2,0,0]));return {EX,ang}}
/* 박공지붕: 마룻대가 x 방향(앞 경사가 카메라를 봄) */
function s4RoofX(p,W,D,y0,rise,c,c2,ovx=.6,ovz=.6,tile){const EZ=D+ovz,ang=Math.atan2(rise,EZ),L=Math.hypot(EZ,rise)+.08,XL=2*W+2*ovx;
 for(const sz of[-1,1]){const cz=sz*EZ/2,cy=y0+rise/2,n=[sz*Math.sin(ang),Math.cos(ang)];p.push(pt(box(XL,.2,L),c,[0,cy,cz],[sz*ang,0,0]));
  if(tile&&sz>0){const nx=Math.floor(XL/.3);for(let i=0;i<nx;i++){const x=-XL/2+.15+i*.3,g=new THREE.CylinderGeometry(.13,.13,L-.06,7,1,true,Math.PI/2,Math.PI);
    p.push(pt(g,i%2?c:tile,[x,cy+n[1]*.1,cz+n[0]*.1],[Math.PI/2+ang,0,0]))}
   for(let k=1;k<Math.floor(L/.38);k++){const t=k*.38,z=EZ-Math.cos(ang)*t,y=y0+Math.sin(ang)*t;p.push(pt(box(XL,.05,.07),c2,[0,y+n[1]*.22,z+n[0]*.22],[ang,0,0]))}}
  else if(!tile)for(let k=1;k<Math.floor(L/.36);k++){const t=k*.36,z=sz*(EZ-Math.cos(ang)*t),y=y0+Math.sin(ang)*t;p.push(pt(box(XL,.045,.06),c2,[0,y+n[1]*.12,z+n[0]*.12],[sz*ang,0,0]))}}
 p.push(pt(cyl(.15,.15,XL+.04,8),c2,[0,y0+rise+.06,0],[0,0,Math.PI/2]));return {EZ,ang}}
/* 창(앞을 봄 +z): 테 + 빛나는 유리 + 창살, 덧창 */
function s4Win(p,gl,x,y,z,w,h,fr,glc,sh,shc){s4R(p,w+.2,h+.2,.12,fr,[x,y,z]);gl.push(pt(box(w,h,.02),glc,[x,y,z+.04]));s4B(p,.05,h,.03,fr,[x,y,z+.07]);s4B(p,w,.05,.03,fr,[x,y+h*.08,z+.07]);
 s4R(p,w+.3,.1,.22,fr,[x,y-h/2-.12,z+.1]);if(sh)for(const s2 of[-1,1]){s4R(p,w*.45,h+.12,.05,shc,[x+s2*(w/2+w*.25+.12),y,z+.01]);for(let k=0;k<3;k++)s4B(p,w*.34,.02,.02,0x2a2f33,[x+s2*(w/2+w*.25+.12),y-h*.3+k*h*.3,z+.045])}}
/* 옆벽 창(±x를 봄) */
function s4WinX(p,gl,sx,x,y,z,w,h,fr,glc){s4R(p,.12,h+.2,w+.2,fr,[x,y,z]);gl.push(pt(box(.02,h,w),glc,[x+sx*.04,y,z]));s4B(p,.03,h,.05,fr,[x+sx*.07,y,z]);s4B(p,.03,.05,w,fr,[x+sx*.07,y,z])}
/* 줄무늬 차양: 벽(z0, y0)에서 앞으로 dz만큼 내려오며 튀어나옴 + 물결 끝단 + 쇠 받침 */
function s4Awning(p,x0,x1,y0,z0,dz,drop,cA,cB,sw=.6){const L=Math.hypot(dz,drop),ang=Math.atan2(drop,dz),n=Math.max(2,Math.round((x1-x0)/sw)),w=(x1-x0)/n;
 for(let i=0;i<n;i++){const x=x0+w*(i+.5),c=i%2?cB:cA;p.push(pt(box(w+.005,.05,L),c,[x,y0-drop/2,z0+dz/2],[ang,0,0]));
  p.push(pt(box(w,.24,.04),c,[x,y0-drop-.1,z0+dz+.02]));p.push(pt(new THREE.CylinderGeometry(w/2,w/2,.04,10,1,false,Math.PI/2,Math.PI),c,[x,y0-drop-.22,z0+dz+.02],[Math.PI/2,0,0]))}
 for(let x=x0+.3;x<=x1-.2;x+=Math.max(1.6,(x1-x0)/3))p.push(lkRod([x,y0-drop*.25-.5,z0+.02],[x,y0-drop+.02,z0+dz-.08],.022,0x3a3f4a));}
const s4Fish=(p,x,y,z,s,c,ry=0)=>{p.push(pt(new THREE.SphereGeometry(.16,10,6),c,[x,y,z],[0,ry,0],[s*1.6,s*.55,s*.42]));p.push(pt(cone(.09*s,.2*s,4),c,[x-Math.cos(ry)*.28*s,y,z+Math.sin(ry)*.28*s],[0,ry,Math.PI/2]))};
function s4Lantern(p,gl,x,y,z,arm){if(arm)s4B(p,.05,.05,arm,0x2c2f33,[x,y+.28,z-arm/2+.05]);s4R(p,.22,.05,.22,0x2c2f33,[x,y+.19,z]);s4R(p,.19,.04,.19,0x2c2f33,[x,y-.17,z]);for(const a of[-1,1])for(const b of[-1,1])s4B(p,.025,.34,.025,0x2c2f33,[x+a*.085,y,z+b*.085]);gl.push(pt(box(.14,.29,.14),0xffc46a,[x,y,z]))}
/* 등 기둥(마당) */
function s5Post(p,gl,x,z,y,h=2.4,c=0x2c2f33){p.push(pt(cyl(.07,.09,h,8),c,[x,y+h/2,z]),pt(cyl(.16,.18,.14,10),c,[x,y+.07,z]));s4Lantern(p,gl,x,y+h+.15,z,0);return [x,y+h+.15,z]}
/* 판자 데크(판자 줄은 x 방향, 이음매 엇갈림) + 가장자리 판 + 말뚝 */
function s5Deck(p,x0,x1,z0,z1,y,C,dk,o={}){const n=Math.max(1,Math.round((z1-z0)/.3)),pw=(z1-z0)/n;
 for(let i=0;i<n;i++){const z=z0+pw*(i+.5),cut=x0+(x1-x0)*(.22+hash(i,Math.round(x0*7),851)*.56);
  s4B(p,cut-x0-.03,.08,pw-.03,C[i%C.length],[(x0+cut)/2,y-.04,z]);s4B(p,x1-cut-.03,.08,pw-.03,C[(i+2)%C.length],[(cut+x1)/2,y-.04,z])}
 s4B(p,x1-x0-.02,.05,z1-z0-.02,dk,[(x0+x1)/2,y-.1,(z0+z1)/2]);
 const fd=o.fd||.8,skip=(sd,a)=>(o.open||[]).some(e=>e[0]===sd&&a>e[1]-.01&&a<e[2]+.01);
 for(const sd of['s','n','e','w']){if(sd==='s'||sd==='n'){const z=sd==='s'?z1:z0;for(let x=x0;x<x1-.01;x+=.5){const b=Math.min(x1,x+.5);if(!skip(sd,(x+b)/2))s4B(p,b-x,fd,.08,dk,[(x+b)/2,y-fd/2-.02,z])}}
  else{const x=sd==='e'?x1:x0;for(let z=z0;z<z1-.01;z+=.5){const b=Math.min(z1,z+.5);if(!skip(sd,(z+b)/2))s4B(p,.08,fd,b-z,dk,[x,y-fd/2-.02,(z+b)/2])}}}
 const ps=o.posts||2.6,PD=o.deep||1.4;for(let x=x0+.2;x<=x1-.1;x+=ps)for(const z of[z0+.15,z1-.15])p.push(pt(cyl(.13,.15,PD,8),dk,[x,y-PD/2-.05,z]))}
/* 돌·자갈 마당(엇갈린 돌판) + 줄눈 + 가장자리 돌 */
function s5Pave(p,x0,x1,z0,z1,y,C,s=.62,curb=0xb7ab95,grout=0x8a8274){const nz=Math.max(1,Math.round((z1-z0)/s)),sz=(z1-z0)/nz;
 for(let j=0;j<nz;j++){const z=z0+sz*(j+.5),off=j%2?s/2:0;for(let x=x0-off,i=0;x<x1-.01;x+=s,i++){const a=Math.max(x0,x),b=Math.min(x1,x+s);if(b-a<.1)continue;
   s4B(p,b-a-.05,.07,sz-.05,C[(i*3+j*5+((hash(i,j,852)*3)|0))%C.length],[(a+b)/2,y-.035,z])}}
 s4B(p,x1-x0,.08,z1-z0,grout,[(x0+x1)/2,y-.08,(z0+z1)/2]);
 for(const [a,b,c2,d] of[[x0,x1,z1,z1],[x0,x1,z0,z0],[x0,x0,z0,z1],[x1,x1,z0,z1]]){const L=Math.hypot(b-a,d-c2);s4R(p,a===b?.24:L+.24,.14,a===b?L+.24:.24,curb,[(a+b)/2,y-.02,(c2+d)/2],0,.05,.03);s4B(p,a===b?.2:L,.7,a===b?L:.2,grout,[(a+b)/2,y-.4,(c2+d)/2])}}
/* 흙 마당: 바닥 + 얼룩 + 자갈 + 가장자리 풀 */
function s5Dirt(p,x0,x1,z0,z1,y,C){s4B(p,x1-x0,.1,z1-z0,C[0],[(x0+x1)/2,y-.05,(z0+z1)/2]);s4B(p,x1-x0,.7,z1-z0,0x6b5038,[(x0+x1)/2,y-.45,(z0+z1)/2]);
 for(let i=0;i<46;i++){const x=x0+.7+hash(i,1,871)*(x1-x0-1.4),z=z0+.7+hash(i,2,871)*(z1-z0-1.4),r=.3+hash(i,3,871)*.8;p.push(pt(cyl(r,r,.02,8),C[1+(i%(C.length-1))],[x,y+.004+i*.0002,z],[0,hash(i,4,871)*3,0],[1,1,.45+hash(i,5,871)*.7]))}
 for(let i=0;i<40;i++){const x=x0+.3+hash(i,6,871)*(x1-x0-.6),z=z0+.3+hash(i,7,871)*(z1-z0-.6);p.push(pt(new THREE.IcosahedronGeometry(.05+hash(i,8,871)*.07,0),[0x9aa1a8,0x8a8f96,0xb3a58c][i%3],[x,y+.02,z]))}
 for(let i=0;i<34;i++){const t=hash(i,9,871),sd=i%4,x=sd<2?x0+t*(x1-x0):sd===2?x0+.15:x1-.15,z=sd<2?(sd?z0+.15:z1-.15):z0+t*(z1-z0);for(let j=0;j<3;j++)p.push(pt(cone(.05,.3+j*.06,4),[0x6e9a4a,0x7fae55][j%2],[x+(j-1)*.08,y+.13,z+(j%2)*.06],[(j-1)*.25,0,(j-1)*.2]))}}
/* 건물 부딪힘(총알·적용): 큰 상자를 4m 안쪽 조각으로 나눠요(inStruct가 6m 안만 봐서) */
function sh84Solid(L,r,lx,lz,hw,hd,k){const nx=Math.ceil(hw/2.1),nz=Math.ceil(hd/2.1),bx=hw/nx,bz=hd/nz;for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const [x,z]=L(lx-hw+bx*(2*i+1),lz-hd+bz*(2*j+1));addStruct({t:PLB(bx,bz),x,z,r,hp:1e9,sk85:k})}}

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

/* ========== 바깥 1: 낚시 가게 — 바닷가 판자 데크 위 청록 비늘판 1층 + 크림 판자 2층 · 앞 2층 발코니 · 앞 박공 위 커다란 물고기 · 옆 훈제실 · 서쪽 잔교 ========== */
function sh84FishGeo(){const q=SH84.fish,p=[],gl=[],W=q.B[0],D=q.B[1],Y0=q.LY,F1=2.8,F2=2.35,WT=Y0+F1+F2,RS=1.85,
 TE=[0x4f93b5,0x478aac],TED=0x3a7697,CR=0xf4efe4,SHG=[0xf1e9d8,0xe2d6bf],RF=0xb8483a,RF2=0x8f3a30,WD=[0xb98556,0xa67848,0xc08d5c,0x9e7044],WDD=0x6f4a2c,GLW=0xffd98a,OR=0xff7a3d,ROPE=0xd9c49a;
 const wl=(x,z,hx,hz)=>q.walls.push([x,z,hx,hz]);q.walls.length=0;wl(0,0,W+.12,D+.12);q.lamps=[];
 /* 데크 + 잔교(물 위로 6m 넘게) */
 s5Deck(p,-8.4,8.2,-3.9,8.7,Y0,WD,WDD,{open:[['w',1.2,4.4]],deep:1.6});s5Deck(p,-20.6,-8.35,1.2,4.4,Y0,WD,WDD,{open:[['e',1.2,4.4]],posts:2.0,deep:2.6});
 /* 1층 벽(청록 비늘판) · 2층 벽(크림 판자 + 세로 덧대) · 모서리 판 · 층 띠 */
 s4B(p,2*W,F1,2*D,TED,[0,Y0+F1/2,0]);for(let y=Y0+.14,i=0;y<Y0+F1-.05;y+=.27,i++){s4B(p,2*W+.02,.23,.04,TE[i%2],[0,y,D+.02]);for(const sx of[-1,1])s4B(p,.04,.23,2*D+.02,TE[(i+1)%2],[sx*(W+.02),y,0])}
 s4B(p,2*W,F2,2*D,SHG[0],[0,Y0+F1+F2/2,0]);for(let x=-W+.3;x<W;x+=.6)s4B(p,.08,F2-.1,.04,SHG[1],[x,Y0+F1+F2/2,D+.02]);for(const sx of[-1,1])for(let z=-D+.3;z<D;z+=.6)s4B(p,.04,F2-.1,.08,SHG[1],[sx*(W+.02),Y0+F1+F2/2,z]);
 for(const sx of[-1,1])for(const sz of[-1,1])s4B(p,.22,F1+F2,.22,CR,[sx*W,Y0+(F1+F2)/2,sz*D]);s4B(p,2*W+.32,.2,2*D+.32,CR,[0,Y0+F1,0]);s4B(p,2*W+.36,.18,2*D+.36,CR,[0,WT,0]);s4B(p,2*W+.3,.16,2*D+.3,0x5f646b,[0,Y0+.08,0]);
 /* 1층 앞: 가운데 두 짝 유리문 + 위 채광창 · 왼쪽 가게 창(차양, 창 밑 얼음 위 생선 판) · 오른쪽 내민 창 · 문 옆 등 */
 s4R(p,2.1,2.6,.14,CR,[0,Y0+1.3,D+.07]);for(const s of[-1,1]){s4R(p,.86,2.2,.08,0x7a4b2e,[s*.46,Y0+1.1,D+.13]);gl.push(pt(box(.6,.85,.02),GLW,[s*.46,Y0+1.62,D+.18]));s4B(p,.66,.05,.03,CR,[s*.46,Y0+1.16,D+.18]);p.push(pt(new THREE.SphereGeometry(.045,8,6),0xd9a441,[s*.1,Y0+1.05,D+.2]))}
 gl.push(pt(box(1.7,.24,.02),GLW,[0,Y0+2.38,D+.16]));s4B(p,.05,.24,.03,CR,[0,Y0+2.38,D+.18]);
 s4Win(p,gl,-3.05,Y0+1.6,D+.06,2.2,1.35,CR,GLW,false);s4Awning(p,-4.4,-1.65,Y0+2.62,D+.05,1.0,.42,0x3a8fc4,0xf7f4ec,.46);
 s4R(p,2.3,.62,.78,WD[0],[-3.05,Y0+.31,D+.85]);s4B(p,2.16,.07,.64,0xdff3fb,[-3.05,Y0+.64,D+.85]);[0xc9d6de,OR,0x6aa6c8,0xc9d6de,OR].forEach((c,k)=>s4Fish(p,-3.85+k*.4,Y0+.72,D+.85+(k%2?.12:-.1),.95,c,(k%2?.2:-.2)));
 for(const s of[-1,1])p.push(pt(cyl(.04,.04,.6,6),WDD,[-3.05+s*1.0,Y0+.3,D+1.15]));wl(-3.05,D+.85,1.2,.45);
 {const bx=3.05;s4R(p,2.5,1.8,.62,TED,[bx,Y0+1.55,D+.31]);for(let y=Y0+.75,i=0;y<Y0+2.4;y+=.27,i++)s4B(p,2.52,.22,.03,TE[i%2],[bx,y,D+.63]);s4Win(p,gl,bx,Y0+1.72,D+.64,2.0,1.05,CR,GLW,false);
  for(const s of[-1,1])gl.push(pt(box(.02,.9,.4),GLW,[bx+s*1.26,Y0+1.72,D+.32]));s4R(p,2.7,.12,.8,CR,[bx,Y0+.64,D+.35]);p.push(pt(box(2.75,.1,.95),RF,[bx,Y0+2.62,D+.4],[.38,0,0]));
  for(let j=0;j<7;j++)p.push(pt(new THREE.IcosahedronGeometry(.09,0),[0xff6b6b,0xffd35c,0xf28bb0][j%3],[bx-.9+j*.3,Y0+.78,D+.72]),pt(new THREE.IcosahedronGeometry(.08,0),0x5f9a3c,[bx-.8+j*.27,Y0+.72,D+.68]));wl(bx,D+.35,1.3,.4)}
 for(const s of[-1,1])s4Lantern(p,gl,s*1.28,Y0+1.95,D+.26,.22);q.lamps.push([-1.28,Y0+1.95,D+.5],[1.28,Y0+1.95,D+.5],[-3.05,Y0+1.6,D+.5],[3.05,Y0+1.7,D+1.0]);
 /* 2층 앞 발코니(기둥 둘이 받침 — 문 위 처마) + 흰 난간 · 구명환 · 그물 · 발코니 판(간판) */
 {const by=Y0+F1+.02,bz=D+.55;s4B(p,4.4,.16,1.1,WD[1],[0,by,bz]);s4R(p,4.5,.36,.1,CR,[0,by-.06,D+1.1]);
  for(const s of[-1,1]){p.push(pt(cyl(.1,.11,F1,10),CR,[s*2.05,Y0+F1/2,D+.98]),pt(cyl(.14,.14,.1,10),CR,[s*2.05,Y0+.05,D+.98]));wl(s*2.05,D+.98,.16,.16);
   p.push(lkBeam([s*2.05,Y0+F1-.35,D+.98],[s*1.6,Y0+F1-.05,D+.98],.08,.08,CR))}
  for(let x=-2.1;x<=2.11;x+=.21)s4B(p,.05,.72,.05,0xf7f4ec,[x,by+.44,D+1.08]);s4B(p,4.34,.08,.12,CR,[0,by+.82,D+1.08]);for(const s of[-1,1]){for(let z=D+.12;z<D+1.05;z+=.21)s4B(p,.05,.72,.05,0xf7f4ec,[s*2.15,by+.44,z]);s4B(p,.12,.08,1.0,CR,[s*2.15,by+.82,D+.6])}
  p.push(pt(new THREE.TorusGeometry(.3,.085,8,20),OR,[1.25,by+.5,D+1.16]));for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5])p.push(pt(new THREE.TorusGeometry(.3,.09,8,4,Math.PI/5),0xf7f4ec,[1.25,by+.5,D+1.16],[0,0,a-Math.PI/10]));
  for(let i=0;i<5;i++){const x=-1.85+i*.32;plSag(p,[x,by+.8,D+1.14],[x+.32,by+.8,D+1.14],.32,0x6f6a5a,.012);p.push(pt(new THREE.SphereGeometry(.07,8,6),i%2?OR:0xf7f4ec,[x+.16,by+.44,D+1.15]))}
  s4R(p,3.7,.6,.1,0x2c6a8c,[0,by-.36,D+1.12]);s4R(p,3.82,.7,.06,CR,[0,by-.36,D+1.07]);q.sign={t:'🐟 낚시 가게',w:3.5,h:.58,pos:[0,by-.36,D+1.18],px:84}}
 /* 2층: 가운데 발코니 문 · 양옆 창(붉은 덧창 + 꽃 상자) */
 {const y=Y0+F1+1.15;s4R(p,1.4,1.95,.12,CR,[0,Y0+F1+1.0,D+.06]);for(const s of[-1,1]){gl.push(pt(box(.5,1.55,.02),0xffe3a0,[s*.3,Y0+F1+1.0,D+.12]));s4B(p,.04,1.55,.03,CR,[s*.3,Y0+F1+1.0,D+.14])}
  for(const s of[-1,1]){s4Win(p,gl,s*3.35,y,D+.06,1.1,1.0,CR,0xffe3a0,true,RF);s4R(p,1.3,.24,.28,0x9c6a3d,[s*3.35,y-.72,D+.2]);for(let j=0;j<6;j++)p.push(pt(new THREE.IcosahedronGeometry(.085,0),[0xff6b6b,0xf7f4ec,0xffd35c][(j+(s>0?1:0))%3],[s*3.35-.5+j*.2,y-.55+(j%2)*.04,D+.22]))}
  q.lamps.push([-3.35,y,D+.4],[3.35,y,D+.4])}
 /* 옆 창 */
 for(const sx of[-1,1]){const x=sx*(W+.06);for(const z of[-1.4,1.4])s4WinX(p,gl,sx,x,Y0+1.65,z,1.0,1.05,CR,GLW);s4WinX(p,gl,sx,x,Y0+F1+1.15,0,1.1,.95,CR,0xffe3a0)}
 /* 지붕: 옆 박공(앞 경사가 카메라 쪽) + 양끝 박공판 · 앞 가운데 작은 박공(둥근 창) · 굴뚝 · 바람개비 */
 s4RoofX(p,W,D,WT,RS,RF,RF2,.45,.5);for(const sx of[-1,1]){const g=s4Prism(2*D+.1,RS,.16);g.rotateY(Math.PI/2);g.translate(sx*W,WT,0);p.push(pt(g,SHG[0]));p.push(lkBeam([sx*(W+.46),WT-.04,-(D+.52)],[sx*(W+.46),WT+RS+.05,0],.2,.1,CR),lkBeam([sx*(W+.46),WT-.04,D+.52],[sx*(W+.46),WT+RS+.05,0],.2,.1,CR))}
 {const GW=2.2,GR=2.15;s4RoofZ(p,GW,(D+.8)/2,WT,GR,RF,RF2,.28,0,(D+.2)/2);p.push(pt(s4Prism(2*GW+.06,GR,.16),SHG[0],[0,WT,D+.05]));
  for(let k=-4;k<=4;k++){const x=k*.48,h=GR*(1-Math.abs(x)/(GW+.03));if(h>.15)s4B(p,.04,h,.03,SHG[1],[x,WT+h/2,D+.14])}
  for(const sx of[-1,1])p.push(lkBeam([sx*(GW+.3),WT-.04,D+.24],[0,WT+GR+.04,D+.24],.2,.1,CR));p.push(pt(new THREE.TorusGeometry(.34,.07,8,20),CR,[0,WT+.9,D+.17]));gl.push(pt(cyl(.3,.3,.02,18),0xffe3a0,[0,WT+.9,D+.16],[Math.PI/2,0,0]));
  /* 커다란 물고기 간판: 앞 박공 위에 받침 둘 + 주황 물고기(카메라 쪽으로 살짝 눕힘) */
  for(const sx of[-1,1])p.push(lkRod([sx*1.35,WT+GR*.42,D+.3],[sx*1.35,WT+GR+.55,D+.45],.05,WDD));
  p.push(pt(is82FishGeo(5.6,0xff8a3d,0xfff1d6,0xd9572e),null,[0,WT+GR+.7,D+.5],[-.28,0,0]));q.lamps.push([0,WT+.9,D+.4])}
 for(const x of[-3.4,3.4])s4R(p,.45,.36,.45,0x5f646b,[x,WT+RS*.55,-1.1],[0,0,0]);p.push(lkRod([-3.9,WT+RS*.3,0],[-3.9,WT+RS+.95,0],.03,0x2c2f33));s4Fish(p,-3.9,WT+RS+1.0,0,1.5,0xf2c94c);
 /* 옆(동쪽) 훈제실: 판자 헛간 + 함석 외지붕 + 쇠 굴뚝(연기) + 장작 */
 {const x0=W+.18,x1=7.5,z0=-2.8,z1=.6,cx=(x0+x1)/2,cz=(z0+z1)/2,H0=2.75,H1=2.15;s4B(p,x1-x0,H1,z1-z0,0x5b3a22,[cx,Y0+H1/2,cz]);for(let z=z0+.2,i=0;z<z1;z+=.36,i++)s4B(p,.04,H1-.1,.3,[0x6b4426,0x5b3a22][i%2],[x1+.02,Y0+H1/2,z]);
  for(let x=x0+.2,i=0;x<x1;x+=.36,i++)s4B(p,.3,H1-.1,.04,[0x6b4426,0x5b3a22][i%2],[x,Y0+H1/2,z1+.02]);s4R(p,.9,1.6,.08,0x3f2a1a,[cx+.3,Y0+.85,z1+.06]);gl.push(pt(box(.5,.06,.02),0xffb36a,[cx+.3,Y0+1.7,z1+.08]));
  const ang=Math.atan2(H0-H1,x1-x0+.3),L=Math.hypot(x1-x0+.5,H0-H1);p.push(pt(box(L,.08,z1-z0+.5),0x9aa3ab,[cx+.1,Y0+(H0+H1)/2+.06,cz],[0,0,-ang]));for(let z=z0-.15;z<=z1+.2;z+=.28)p.push(pt(box(L,.05,.05),0x7f878f,[cx+.1,Y0+(H0+H1)/2+.12,z],[0,0,-ang]));
  p.push(pt(cyl(.13,.13,1.5,10),0x4a4f55,[x1-.6,Y0+H1+.55,z0+.7]),pt(cone(.22,.22,10),0x4a4f55,[x1-.6,Y0+H1+1.4,z0+.7]));q.chim=[x1-.6,Y0+H1+1.6,z0+.7];wl(cx,cz,(x1-x0)/2+.1,(z1-z0)/2+.1);
  for(let r=0;r<3;r++)for(let c=0;c<4-r;c++)p.push(pt(cyl(.13,.13,.9,8),[0x7a4a2a,0x845232,0x6b4024][(r+c)%3],[x1+.45,Y0+.14+r*.25,z0+.4+c*.28+r*.14],[Math.PI/2,0,0]));wl(x1+.45,z0+.85,.25,.7)}
 /* 서쪽: 생선 덕장 · 기댄 낚싯대 · 잔교 기중기(매단 상자) · 난간(밧줄) · 구명환 */
 {const cx=-6.7,cz=-1.6;for(const z of[cz-1.25,cz+1.25])for(const s of[-1,1])p.push(lkRod([cx+s*.62,Y0,z],[cx,Y0+1.95,z],.05,0xb98556));
  for(const s of[-1,1]){p.push(pt(cyl(.035,.035,2.7,6),0xc08d5c,[cx+s*.27,Y0+1.6,cz],[Math.PI/2,0,0]));for(let i=0;i<7;i++){const z=cz-1.0+i*.33,c=[0xc9d6de,0xff8a5a,0x9fb7c8][(i+(s>0?1:0))%3];p.push(lkRod([cx+s*.27,Y0+1.6,z],[cx+s*.27,Y0+1.48,z],.008,0x6f6a5a),pt(new THREE.SphereGeometry(.11,8,6),c,[cx+s*.27,Y0+1.2,z],[0,0,0],[.32,1.5,.62]),pt(cone(.07,.14,4),c,[cx+s*.27,Y0+.82,z],[Math.PI,0,0]))}}
  wl(cx,cz,.66,1.32)}
 for(let i=0;i<4;i++)p.push(lkRod([-W-.25,Y0+.05,1.9+i*.22],[-W-.08,Y0+2.4,1.75+i*.26],.02,[0x2c3346,0x3d6fa0,0xe0533f,0x2c3346][i]));
 {const cx=-7.9,cz=.75;p.push(pt(cyl(.14,.17,3.4,10),WDD,[cx,Y0+1.7,cz]),lkBeam([cx,Y0+3.25,cz],[-10.6,Y0+3.05,2.8],.14,.12,WDD),lkBeam([cx,Y0+2.3,cz],[-9.0,Y0+3.1,1.6],.08,.08,WDD));
  p.push(lkRod([-10.5,Y0+3.0,2.8],[-10.5,Y0+2.35,2.8],.015,ROPE));s4R(p,.7,.5,.6,WD[2],[-10.5,Y0+2.1,2.8]);for(let i=0;i<3;i++)s4Fish(p,-10.7+i*.2,Y0+2.42,2.8,.7,[OR,0xc9d6de,0x6aa6c8][i]);wl(cx,cz,.22,.22)}
 {const rp=(x0,z0,x1,z1)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/1.6));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;p.push(pt(cyl(.06,.07,.95,8),WDD,[x,Y0+.47,z]));if(i<n)plSag(p,[x,Y0+.88,z],[x0+(x1-x0)*(i+1)/n,Y0+.88,z0+(z1-z0)*(i+1)/n],.12,ROPE,.025)}
   wl((x0+x1)/2,(z0+z1)/2,Math.max(.08,Math.abs(x1-x0)/2),Math.max(.08,Math.abs(z1-z0)/2))};
  rp(-8.32,-3.8,-8.32,1.2);rp(-8.32,4.4,-8.32,8.6);rp(-20.5,1.28,-8.5,1.28);rp(-20.5,4.32,-8.5,4.32);rp(-20.52,1.28,-20.52,4.32);
  p.push(pt(new THREE.TorusGeometry(.3,.08,8,18),OR,[-8.38,Y0+.95,-1.0],[0,Math.PI/2,0]));for(let i=0;i<4;i++)p.push(pt(new THREE.SphereGeometry(.13,8,6),[OR,0xf7f4ec,0x3a8fc4,OR][i],[-8.4,Y0+.6,5.0+i*.8]))}
 /* 잔교 끝: 등 · 말뚝 머리 · 매어 둔 배 */
 {const ex=-20.1;p.push(pt(cyl(.06,.08,2.4,8),0x2c2f33,[ex,Y0+1.2,2.8]));s4Lantern(p,gl,ex,Y0+2.55,2.8,0);q.lamps.push([ex,Y0+2.55,2.8]);for(const z of[1.5,4.1])p.push(pt(cyl(.15,.18,.4,10),0x3f4450,[ex+.4,Y0+.2,z]));
p.push(pt(new THREE.TorusGeometry(.26,.06,6,14),ROPE,[-12.0,Y0+.06,3.7],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.17,.05,6,12),ROPE,[-12.0,Y0+.14,3.7],[Math.PI/2,0,0]))}
 /* 앞 데크: 모퉁이 등 · 통·상자 · 벤치 · 칠판 · 밧줄 · 부표 더미 */
 for(const [x,z] of[[-8.0,8.35],[7.8,8.35]]){q.lamps.push(s5Post(p,gl,x,z,Y0,2.3));wl(x,z,.2,.2)}
 for(const [x,z] of[[6.9,3.7],[6.15,4.2]])p.push(pt(cyl(.36,.33,.92,12),0x8a5a36,[x,Y0+.46,z]),pt(cyl(.37,.37,.05,12),WDD,[x,Y0+.72,z]),pt(cyl(.37,.37,.05,12),WDD,[x,Y0+.22,z]));
 s4R(p,.9,.6,.7,WD[1],[7.2,Y0+.3,5.1]);s4R(p,.85,.55,.65,WD[3],[7.15,Y0+.86,5.12]);wl(6.8,4.4,1.1,1.1);
 if(GEO.lk_seat_bench){p.push(pt(GEO.lk_seat_bench,null,[3.0,Y0,8.15]));wl(3.0,8.15,.78,.32)}
 for(const s of[-1,1])p.push(pt(box(.66,.95,.05),WDD,[1.9,Y0+.47,6.4+s*.2],[s*.22,0,0]),pt(box(.54,.76,.06),0x2f3b33,[1.9,Y0+.5,6.4+s*.23],[s*.22,0,0]));for(let i=0;i<3;i++)s4B(p,.3,.03,.01,0xf4efe4,[1.9,Y0+.7-i*.15,6.65]);wl(1.9,6.4,.38,.3);
 for(let i=0;i<5;i++)p.push(pt(new THREE.SphereGeometry(.2,10,8),[OR,0xf7f4ec,0x3a8fc4][i%3],[-7.6+(i%3)*.38,Y0+.2+(i>2?.32:0),4.1+(i%2)*.3]));wl(-7.25,4.25,.6,.45);
 /* 앞 데크 왼쪽: 지붕 덮인 생선 판매대(줄무늬 천막·얼음·생선·저울·가격표) */
 {const cx=-5.1,cz=6.6,w=2.9,d=1.2;for(const sx of[-1,1])for(const sz of[-1,1])p.push(pt(cyl(.06,.06,2.35,8),CR,[cx+sx*(w/2-.08),Y0+1.17,cz+sz*(d/2-.06)]));
  s4R(p,w,.72,d-.1,WD[1],[cx,Y0+.36,cz]);s4B(p,w-.12,.06,d-.24,0xdff3fb,[cx,Y0+.75,cz]);[OR,0xc9d6de,0x6aa6c8,OR,0xc9d6de,0x6aa6c8].forEach((c,i)=>s4Fish(p,cx-1.05+i*.42,Y0+.84,cz+(i%2?.2:-.15),1.0,c,(i%2?.25:-.25)));
  for(let i=0;i<7;i++){const x=cx-w/2+w/7*(i+.5),c=i%2?0xf7f4ec:0x3a8fc4;p.push(pt(box(w/7+.005,.05,d+.36),c,[x,Y0+2.42,cz],[.14,0,0]),pt(box(w/7,.22,.04),c,[x,Y0+2.24,cz+d/2+.18]))}
  p.push(pt(cyl(.012,.012,.42,4),0x3a3f4a,[cx+.95,Y0+2.1,cz+.25]),pt(cyl(.17,.15,.05,12),0xc9cdd2,[cx+.95,Y0+1.86,cz+.25]),pt(cyl(.1,.1,.05,12),0xf4efe4,[cx+.95,Y0+1.98,cz+.33],[Math.PI/2,0,0]));
  s4R(p,.9,.42,.05,0x2f3b33,[cx-.6,Y0+.42,cz+d/2+.0]);for(let i=0;i<3;i++)s4B(p,.6,.025,.01,[0xf4efe4,0xffd35c][i%2],[cx-.6,Y0+.52-i*.1,cz+d/2+.03]);wl(cx,cz,w/2+.06,d/2+.06)}
 /* 앞 데크 오른쪽: '오늘의 대어' 걸이(큰 물고기 매달기 + 저울 + 작은 칠판) · 통발 더미 */
 {const cx=5.2,cz=6.9;for(const s of[-1,1])p.push(pt(cyl(.09,.1,2.9,8),WDD,[cx+s*1.05,Y0+1.45,cz]));p.push(pt(box(2.4,.14,.16),WDD,[cx,Y0+2.86,cz]));for(const s of[-1,1])p.push(lkBeam([cx+s*1.05,Y0+2.3,cz],[cx+s*.6,Y0+2.82,cz],.08,.08,WDD));
  const fg=is82FishGeo(1.85,0x3f6f9a,0xe8eef2,0x2c557a);fg.rotateZ(-Math.PI/2);p.push(pt(fg,null,[cx-.35,Y0+1.72,cz+.06]));p.push(lkRod([cx-.35,Y0+2.8,cz],[cx-.35,Y0+2.62,cz],.015,ROPE));
  p.push(pt(cyl(.012,.012,.5,4),0x3a3f4a,[cx+.55,Y0+2.55,cz]),pt(cyl(.2,.2,.06,16),0xf4efe4,[cx+.55,Y0+2.15,cz+.04],[Math.PI/2,0,0]),pt(cyl(.22,.22,.04,16),0x3a3f4a,[cx+.55,Y0+2.15,cz+.01],[Math.PI/2,0,0]),pt(box(.02,.14,.01),0xe0533f,[cx+.55,Y0+2.18,cz+.08],[0,0,.6]));
  s4R(p,.8,.5,.05,0x2f3b33,[cx+.55,Y0+1.25,cz+.04]);for(let i=0;i<3;i++)s4B(p,.55,.025,.01,[0xf4efe4,0xffd35c][i%2],[cx+.55,Y0+1.37-i*.11,cz+.075]);wl(cx,cz,1.15,.22)}
 for(const [x,y] of[[6.75,0],[7.65,0],[7.2,.5]]){s4R(p,.85,.5,.62,0x6f7f5a,[x,Y0+.25+y,7.65]);for(let k=0;k<4;k++)s4B(p,.86,.02,.02,0x3a3f4a,[x,Y0+.06+y+k*.12,7.97])}wl(7.2,7.65,.9,.35);
 p.push(pt(new THREE.TorusGeometry(.32,.07,6,14),ROPE,[-7.5,Y0+.07,7.9],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.22,.06,6,12),ROPE,[-7.5,Y0+.15,7.9],[Math.PI/2,0,0]));
 const g=mg(p);lkSmooth(g,40);GEO.sh84_fish=g;GEO.sh84_fish_glow=mg(gl)}

/* ========== 바깥 2: 식물 가게 — 돌 마당 위 흰 틀 유리 온실(가운데 2층 + 작은 탑, 양 날개) · 앞 유리 현관 · 화단 둘·분수·장미 아치·옆 분갈이 헛간 ========== */
function sh84PlantGeo(){const q=SH84.plant,p=[],gl=[],gs=[],W=q.B[0],D=q.B[1],Y0=q.LY,PW=2.4,BH=Y0+.75,WG=Y0+3.0,CT=Y0+4.6,CR=Y0+5.55,ST=0xb2654a,STC=0xd8cdb6,FR=0xf7f4ec,GR=0x3f8a54,MT=0x5fae8f,GLC=0xd8f4f1;
 const wl=(x,z,hx,hz)=>q.walls.push([x,z,hx,hz]);q.walls.length=0;wl(0,0,W+.12,D+.12);wl(0,D+.45,1.37,.5);q.lamps=[];
 const fr=(w,h,d,pos,rot)=>p.push(pt(box(w,h,d),FR,pos,rot)),gls=(w,h,d,pos,rot)=>gs.push(pt(box(w,h,d),GLC,pos,rot));
 s5Pave(p,-8.6,8.6,-4.2,9.2,Y0,[0xd8cfbf,0xcfc5b3,0xe2d9c9,0xc7bca8],.62,0xb7ab95,0x8f8778);
 /* 돌 받침벽(앞은 현관 자리 비움) + 덩굴 */
 for(const [x0,x1] of[[-W,-1.25],[1.25,W]]){s4B(p,x1-x0,BH-Y0,.3,ST,[(x0+x1)/2,(Y0+BH)/2,D-.15]);s4B(p,x1-x0+.08,.08,.4,STC,[(x0+x1)/2,BH+.04,D-.15])}
 s4B(p,2*W,BH-Y0,.3,ST,[0,(Y0+BH)/2,-D+.15]);for(const sx of[-1,1]){s4B(p,.3,BH-Y0,2*D,ST,[sx*(W-.15),(Y0+BH)/2,0]);s4B(p,.4,.08,2*D+.08,STC,[sx*(W-.15),BH+.04,0])}
 for(const y of[.26,.51])for(const [x0,x1] of[[-W,-1.25],[1.25,W]])s4B(p,x1-x0,.025,.02,0x8e4c37,[(x0+x1)/2,Y0+y,D+.005]);for(let r=0;r<3;r++)for(let x=-W+.2+(r%2)*.22;x<W;x+=.44)if(Math.abs(x)>1.3)s4B(p,.02,.22,.02,0x8e4c37,[x,Y0+.13+r*.25,D+.006]);
 for(let i=0;i<30;i++){const s=i%2?1:-1,x=s*(1.6+hash(i,1,861)*(W-1.9)),y=Y0+.2+hash(i,2,861)*.9;p.push(pt(new THREE.IcosahedronGeometry(.09+hash(i,3,861)*.06,0),[0x4f8a3c,0x5f9a3c,0x6ea844][i%3],[x,y,D+.04]));if(i%4===0)p.push(pt(new THREE.IcosahedronGeometry(.06,0),[0xff6b6b,0xffd35c,0xf28bb0][i%3],[x+.08,y+.08,D+.08]))}
 /* 날개(양옆 1층 유리, 지붕 = 앞뒤로 기운 유리 + 흰 서까래) */
 for(const sx of[-1,1]){const xa=sx*PW,xb=sx*W,xm=(xa+xb)/2,ww=Math.abs(xb-xa);
  gls(ww,WG-BH,.03,[xm,(BH+WG)/2,D-.15]);gls(.03,WG-BH,2*D,[xb-sx*.15,(BH+WG)/2,0]);
  for(let i=0;i<=4;i++){const x=xa+(xb-xa)*i/4;fr(.09,WG-BH,.09,[x,(BH+WG)/2,D-.11])}for(const y of[BH+.05,Y0+2.0,WG])fr(ww,.09,.09,[xm,y,D-.11]);
  for(let i=0;i<=7;i++){const z=-D+2*D*i/7;fr(.09,WG-BH,.09,[xb-sx*.19,(BH+WG)/2,z])}for(const y of[Y0+2.0,WG])fr(.09,.09,2*D,[xb-sx*.19,y,0]);
  const RZ=.9,ang=Math.atan2(RZ,D+.1),L=Math.hypot(D+.1,RZ)+.04;for(const sz of[-1,1]){gls(ww+.1,.03,L,[xm,WG+RZ/2,sz*(D+.1)/2],[sz*ang,0,0]);for(let i=0;i<=5;i++){const x=xa+(xb-xa)*i/5;p.push(lkBeam([x,WG+.02,sz*(D+.08)],[x,WG+RZ+.02,0],.08,.08,FR))}}
  p.push(lkBeam([xa,WG+RZ+.03,0],[xb,WG+RZ+.03,0],.1,.1,FR));{const g=s4Prism(2*D+.2,RZ,.03);g.rotateY(Math.PI/2);g.translate(xb-sx*.15,WG,0);gs.push(pt(g,GLC))}
  for(let i=0;i<4;i++)p.push(pt(new THREE.SphereGeometry(.07,8,6),MT,[xa+(xb-xa)*(i+.5)/4,WG+RZ+.14,0]));
  /* 앞 화분 선반(받침벽 위) */
  for(let j=0;j<5;j++){const x=xa+(xb-xa)*(j+.5)/5;p.push(pt(cyl(.15,.11,.2,10),0xc77a52,[x,BH+.18,D-.12]),pt(new THREE.IcosahedronGeometry(.16,0),[0x5f9a3c,0x6ea844][j%2],[x,BH+.38,D-.12]),pt(new THREE.IcosahedronGeometry(.07,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff][j%4],[x+.06,BH+.5,D-.06]))}}
 /* 가운데 2층 유리 + 띠 + 지붕(앞뒤 유리 경사) + 작은 탑 */
 for(const sx of[-1,1]){gls(PW-1.25,CT-BH,.03,[sx*(PW+1.25)/2,(BH+CT)/2,D-.15]);gls(.03,CT-WG,2*D,[sx*PW,(WG+CT)/2,0])}gls(2.5,CT-Y0-2.95,.03,[0,(Y0+2.95+CT)/2,D-.15]);
 for(const x of[-PW,-1.25,1.25,PW])p.push(pt(box(.13,CT-BH,.13),MT,[x,(BH+CT)/2,D-.09]));for(const x of[-.62,0,.62])fr(.08,CT-Y0-2.95,.08,[x,(Y0+2.95+CT)/2,D-.1]);
 for(const y of[Y0+2.95,CT])fr(2*PW,.11,.11,[0,y,D-.1]);fr(2*PW,.14,.16,[0,Y0+3.15,D-.08]);for(const sx of[-1,1])for(let i=0;i<=5;i++)fr(.09,CT-WG,.09,[sx*PW,(WG+CT)/2,-D+2*D*i/5]);
 {const RZ=CR-CT,ang=Math.atan2(RZ,D+.12),L=Math.hypot(D+.12,RZ)+.04;for(const sz of[-1,1]){gls(2*PW+.15,.03,L,[0,CT+RZ/2,sz*(D+.12)/2],[sz*ang,0,0]);for(let i=0;i<=6;i++){const x=-PW+2*PW*i/6;p.push(lkBeam([x,CT+.02,sz*(D+.1)],[x,CR+.02,0],.09,.09,FR))}}
  p.push(lkBeam([-PW-.1,CR+.04,0],[PW+.1,CR+.04,0],.14,.14,FR));for(const sx of[-1,1]){const g=s4Prism(2*D+.2,RZ,.03);g.rotateY(Math.PI/2);g.translate(sx*PW,CT,0);gs.push(pt(g,GLC))}
  for(let i=0;i<=8;i++)p.push(pt(new THREE.SphereGeometry(.07,8,6),MT,[-PW+2*PW*i/8,CR+.16,0]));
  const TY=CR+.05;gls(1.0,.75,1.0,[0,TY+.37,0]);for(const a of[-1,1])for(const b of[-1,1])fr(.08,.75,.08,[a*.5,TY+.37,b*.5]);fr(1.16,.08,1.16,[0,TY+.76,0]);
  p.push(pt(cone(.82,.62,4),MT,[0,TY+1.1,0],[0,Math.PI/4,0]),pt(new THREE.SphereGeometry(.1,10,8),0xe9c046,[0,TY+1.46,0]),pt(cyl(.025,.025,.35,6),0xe9c046,[0,TY+1.62,0]))}
 /* 앞 유리 현관(박공) + 초록 유리문 둘 + 간판 + 걸이 화분 · 등 */
 {const VZ=D+.9,VH=Y0+2.75,VR=.75;for(const sx of[-1,1]){gls(.03,VH-BH,.9,[sx*1.25,(BH+VH)/2,D+.45]);s4B(p,.06,BH-Y0,.9,ST,[sx*1.25,(Y0+BH)/2,D+.45]);fr(.1,VH-Y0,.1,[sx*1.25,(Y0+VH)/2,VZ]);fr(.1,VH-BH,.1,[sx*1.25,(BH+VH)/2,D])}
  for(const s of[-1,1]){s4R(p,1.06,2.35,.08,GR,[s*.56,Y0+1.19,VZ]);gs.push(pt(box(.8,1.95,.02),GLC,[s*.56,Y0+1.25,VZ+.03]));s4B(p,.8,.06,.03,GR,[s*.56,Y0+1.05,VZ+.05]);p.push(pt(new THREE.SphereGeometry(.04,8,6),0xd9a441,[s*.14,Y0+1.15,VZ+.07]))}
  fr(2.6,.12,.12,[0,VH,VZ]);gls(2.5,.3,.03,[0,VH-.2,VZ]);{const g=s4Prism(2.6,VR,.03);g.translate(0,VH,VZ);gs.push(pt(g,GLC));for(const sx of[-1,1])p.push(lkBeam([sx*1.32,VH,VZ+.04],[0,VH+VR+.03,VZ+.04],.1,.1,FR));p.push(lkBeam([0,VH+VR,VZ+.05],[0,VH+VR,D],.1,.1,FR))}
  for(const sx of[-1,1]){const ang=Math.atan2(VR,1.3);gls(1.38,.03,.95,[sx*.65,VH+VR/2,D+.45],[0,0,-sx*ang])}
  s4R(p,3.4,.62,.12,FR,[0,Y0+3.82,D+.05]);s4R(p,3.24,.5,.16,GR,[0,Y0+3.82,D+.08]);q.sign={t:'🌱 식물 가게',w:3.0,h:.5,pos:[0,Y0+3.82,D+.17],px:84};
  for(const s of[-1,1]){p.push(pt(cyl(.012,.012,.5,4),0x3a3f4a,[s*1.25,VH-.3,VZ+.12]),pt(cyl(.22,.14,.2,10),0x9c6a3d,[s*1.25,VH-.62,VZ+.12]),pt(new THREE.IcosahedronGeometry(.26,0),0x5f9a3c,[s*1.25,VH-.5,VZ+.12]));
   for(let j=0;j<4;j++)p.push(pt(new THREE.IcosahedronGeometry(.07,0),[0xff6b6b,0xf28bb0,0xffd35c][j%3],[s*1.25+Math.cos(j*1.6)*.2,VH-.45,VZ+.12+Math.sin(j*1.6)*.2]));s4Lantern(p,gl,s*1.55,Y0+1.95,VZ-.05,.2)}
  q.lamps.push([-1.55,Y0+1.95,VZ+.3],[1.55,Y0+1.95,VZ+.3],[0,Y0+3.6,0])}
 /* 유리 안: 가운데 야자수 · 매단 화분 · 날개 안 잎 덩어리 */
 {const tx=-.3,tz=-.9;for(let k=0;k<7;k++)p.push(pt(cyl(.17-k*.01,.2-k*.01,.58,9),k%2?0x8a6a44:0x7a5a3a,[tx+Math.sin(k*.35)*.22,Y0+.3+k*.55,tz]));
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2,g=mg([pt(box(1.6,.04,.36),k%2?0x4f9a3c:0x5fae4a,[.8,0,0])]);g.rotateZ(-.4-(k%3)*.12);g.rotateY(a);g.translate(tx+.3,Y0+4.05,tz);p.push(pt(g,null))}}
 for(const [x,z] of[[-1.5,1.4],[1.6,1.2],[1.8,-1.8]]){p.push(pt(cyl(.01,.01,.8,4),0x3a3f4a,[x,CT-.4,z]),pt(cyl(.26,.17,.26,10),0x9c6a3d,[x,CT-.92,z]),pt(new THREE.IcosahedronGeometry(.32,1),0x5f9a3c,[x,CT-.76,z]))}
 for(let i=0;i<30;i++){const sx=i%2?1:-1,x=sx*(PW+.5+hash(i,1,841)*(W-PW-1.0)),z=-D+.7+hash(i,2,841)*(2*D-1.4),r=.35+hash(i,4,841)*.35;p.push(pt(new THREE.IcosahedronGeometry(r,0),[0x4f8a3c,0x5f9a3c,0x6ea844,0x3f7a34][i%4],[x,BH+.3+hash(i,3,841)*1.2,z]));if(i%2===0)p.push(pt(new THREE.IcosahedronGeometry(.13,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff][i%4],[x+r*.5,BH+.95,z+r*.3]))}
 for(let i=0;i<12;i++){const x=-PW+.3+i*(2*PW-.6)/11;gl.push(pt(new THREE.SphereGeometry(.045,6,4),[0xffd36a,0xffc46a][i%2],[x,CT-.22-Math.sin(i/11*Math.PI)*.28,D-.45]))}
 /* 마당: 화단 둘 · 분수 · 장미 아치 · 벤치 · 둥근 나무 화분 · 꽃 수레 · 외바퀴 수레 · 빗물 통 · 줄 전구 */
 for(const sx of[-1,1]){const x0=sx*2.9,x1=sx*7.8,xa=Math.min(x0,x1),xb=Math.max(x0,x1),z0=5.1,z1=7.9;s4R(p,xb-xa,.32,z1-z0,0x8a5a36,[(xa+xb)/2,Y0+.16,(z0+z1)/2],0,.04,.03);s4B(p,xb-xa-.2,.06,z1-z0-.2,0x6e4a30,[(xa+xb)/2,Y0+.32,(z0+z1)/2]);
  const FL=['pw_flower_yellow','pw_poppy','pw_flower_blue','pw_flower_black','pw_tomato'];let n=0;for(let r=0;r<2;r++)for(let i=0;i<5;i++){const x=xa+.55+i*(xb-xa-1.1)/4,z=z0+.7+r*1.4,key=FL[(r*2+i+(sx>0?2:0))%4];
   if(GEO[key])p.push(pt(GEO[key],null,[x,Y0+.34,z],[0,hash(i,r,881)*6,0],[.75,.75,.75]));else p.push(pt(new THREE.IcosahedronGeometry(.25,0),0x5f9a3c,[x,Y0+.55,z]));n++}wl((xa+xb)/2,(z0+z1)/2,(xb-xa)/2+.05,(z1-z0)/2+.05)}
 if(GEO.d82_fountain){p.push(pt(GEO.d82_fountain,null,[0,Y0,7.35]));wl(0,7.35,.96,.96)}if(GEO.d82_fountain_water)gl.push(pt(GEO.d82_fountain_water,0x9fdcf0,[0,Y0,7.35]));
 {const az=8.95;for(const sx of[-1,1]){p.push(pt(box(.14,2.4,.14),FR,[sx*1.45,Y0+1.2,az]));wl(sx*1.45,az,.14,.14)}const ag=new THREE.TorusGeometry(1.45,.07,6,20,Math.PI);p.push(pt(ag,FR,[0,Y0+2.4,az]));
  for(let i=0;i<22;i++){const a=i/21*Math.PI,x=Math.cos(a)*1.45,y=Y0+2.4+Math.sin(a)*1.45;p.push(pt(new THREE.IcosahedronGeometry(.14,0),[0x4f8a3c,0x5f9a3c][i%2],[x,y,az+.05]));if(i%2)p.push(pt(new THREE.IcosahedronGeometry(.08,0),[0xe0533f,0xf28bb0,0xffffff][i%3],[x+.05,y+.06,az+.13]))}
  for(const sx of[-1,1])for(let i=0;i<6;i++)p.push(pt(new THREE.IcosahedronGeometry(.11,0),[0x4f8a3c,0x6ea844][i%2],[sx*1.45+(i%2?.06:-.06),Y0+.3+i*.36,az+.08]))}
 if(GEO.lk_seat_bench)for(const sx of[-1,1]){p.push(pt(GEO.lk_seat_bench,null,[sx*8.15,Y0,4.3],[0,-sx*Math.PI/2,0]));wl(sx*8.15,4.3,.32,.78)}
 for(const [x,z,s] of[[-7.9,-3.6,1],[-4.0,3.75,.7],[4.0,3.75,.7]]){p.push(pt(cyl(.34*s,.27*s,.5*s,12),0xc77a52,[x,Y0+.25*s,z]),pt(cyl(.36*s,.36*s,.06,12),0xb06a45,[x,Y0+.5*s,z]),pt(cyl(.04,.05,.5*s,6),0x7a5a3a,[x,Y0+.75*s,z]),pt(new THREE.SphereGeometry(.46*s,12,10),0x4f8a3c,[x,Y0+1.25*s,z]));wl(x,z,.4*s,.4*s)}
 {const cx=-7.0,cz=2.0;s4R(p,1.5,.5,.9,0x8a5a36,[cx,Y0+.55,cz]);for(const s of[-1,1]){p.push(pt(cyl(.3,.3,.06,14),0x5b3a22,[cx+s*.5,Y0+.32,cz+.5],[Math.PI/2,0,0]))}p.push(lkBeam([cx+.75,Y0+.6,cz],[cx+1.4,Y0+.9,cz],.06,.06,0x5b3a22));
  for(let i=0;i<4;i++){const x=cx-.5+i*.33;p.push(pt(cyl(.13,.11,.32,10),[0x8fb6c9,0xd9d2c4][i%2],[x,Y0+.96,cz]));for(let j=0;j<4;j++)p.push(pt(new THREE.IcosahedronGeometry(.07,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff,0xffffff][(i+j)%5],[x+Math.cos(j*1.6)*.08,Y0+1.17+(j%2)*.06,cz+Math.sin(j*1.6)*.08]))}wl(cx,cz,.95,.55)}
 {const cx=7.0,cz=2.4;s4R(p,.8,.4,1.2,0x3f7fd0,[cx,Y0+.5,cz]);s4B(p,.66,.08,1.05,0x6e4a30,[cx,Y0+.72,cz]);p.push(pt(cyl(.22,.22,.08,14),0x2c2f33,[cx,Y0+.24,cz+.75],[0,0,Math.PI/2]),lkRod([cx-.25,Y0+.5,cz-.5],[cx-.3,Y0+.7,cz-1.2],.03,0x8a6a44),lkRod([cx+.25,Y0+.5,cz-.5],[cx+.3,Y0+.7,cz-1.2],.03,0x8a6a44));wl(cx,cz,.5,.8)}
 p.push(pt(cyl(.4,.36,.9,14),0x7a5a3a,[-6.4,Y0+.45,-2.8]),pt(cyl(.41,.41,.05,14),0x4a2e1c,[-6.4,Y0+.7,-2.8]),pt(cyl(.36,.36,.02,14),0x6ab0d0,[-6.4,Y0+.9,-2.8]));wl(-6.4,-2.8,.45,.45);
 for(let i=0;i<3;i++)for(let j=0;j<3-i;j++)p.push(pt(cyl(.2,.15,.24,10),0xc77a52,[-7.4+j*.42+i*.21,Y0+.12+i*.22,-.6]));wl(-7.0,-.6,.65,.25);
 /* 옆(동쪽) 분갈이 헛간: 판자 + 외지붕 + 열린 앞 선반(화분) + 연장 */
 {const x0=W+.2,x1=8.1,z0=-3.4,z1=.2,cx=(x0+x1)/2,cz=(z0+z1)/2;s4B(p,x1-x0,2.2,.12,0x9c6a3d,[cx,Y0+1.1,z0]);s4B(p,.12,2.2,z1-z0,0x9c6a3d,[x1,Y0+1.1,cz]);
  for(let z=z0+.2,i=0;z<z1;z+=.34,i++)s4B(p,.03,2.1,.3,[0xb98556,0xa67848][i%2],[x1+.07,Y0+1.08,z]);p.push(pt(box(x1-x0+.4,.08,z1-z0+.5),0x5fae8f,[cx,Y0+2.42,cz],[0,0,-.18]));
  for(const y of[.55,1.2,1.85]){s4B(p,x1-x0-.1,.05,.9,0x8a5a36,[cx,Y0+y,z0+.55]);for(let i=0;i<4;i++){const x=x0+.35+i*.62;p.push(pt(cyl(.12,.09,.18,10),0xc77a52,[x,Y0+y+.11,z0+.55]),pt(new THREE.IcosahedronGeometry(.13,0),[0x5f9a3c,0x6ea844][i%2],[x,Y0+y+.27,z0+.55]))}}
  for(let i=0;i<3;i++)p.push(lkRod([x0+.5+i*.5,Y0+.05,z1-.3],[x0+.3+i*.55,Y0+1.6,z1-.55],.025,0x8a6a44));p.push(pt(cyl(.16,.2,.32,12),0x5bae5f,[x1-.5,Y0+.16,z1-.4]),lkRod([x1-.35,Y0+.22,z1-.4],[x1-.1,Y0+.4,z1-.4],.03,0x5bae5f));wl((W+x1)/2,cz+.2,(x1-W)/2+.1,(z1-z0)/2+.3)}
 /* 줄 전구(건물 처마 → 앞 기둥) */
 for(const sx of[-1,1]){const a=[sx*8.3,Y0,9.0];q.lamps.push(s5Post(p,gl,a[0],a[2],Y0,2.5,FR));wl(a[0],a[2],.2,.2);const b=[sx*(W-.2),WG+.1,D+.05],c=[sx*8.3,Y0+2.6,9.0];
  for(let i=0;i<=8;i++){const t=i/8,x=b[0]+(c[0]-b[0])*t,y=b[1]+(c[1]-b[1])*t-Math.sin(t*Math.PI)*.5,z=b[2]+(c[2]-b[2])*t;gl.push(pt(new THREE.SphereGeometry(.06,6,4),[0xffd36a,0xff9a7a,0x9ad8ff][i%3],[x,y,z]))}plSag(p,b,c,.5,0x3a3f4a,.012)}
 const g=mg(p);lkSmooth(g,40);GEO.sh84_plant=g;GEO.sh84_plant_glow=mg(gl);GEO.sh84_plant_glass=mg(gs)}

/* ========== 바깥 3: 요리 가게 — 자갈 마당 · 크림 회벽 1층(돌 모서리) + 나무 뼈대 2층(앞으로 내밈) · 주황 기와·지붕창 둘 · 내다 파는 창(들창) · 지붕 위 프라이팬 · 옆 화덕 · 파라솔 식탁 ========== */
function sh84CookGeo(){const q=SH84.cook,p=[],gl=[],W=q.B[0],D=q.B[1],Y0=q.LY,F1=2.75,F2=2.2,J=.22,WT=Y0+F1+F2,RS=1.75,CR1=0xf2e3c2,CR2=0xf6ead0,BM=0x6b4426,BM2=0x7d5232,TL=0xd9744a,TL2=0xc8643c,TLD=0x9e4a2c,SH=0x3f8a8f,GLW=0xffcf8a,WD=[0xb98556,0xa67848,0xc08d5c],QN=[0xb9b2a5,0xa8a092];
 const wl=(x,z,hx,hz)=>q.walls.push([x,z,hx,hz]);q.walls.length=0;wl(0,0,W+.12,D+J+.12);q.lamps=[];
 s5Pave(p,-8.2,8.2,-4.0,8.6,Y0,[0xc9a27e,0xbf9670,0xd4ad88,0xb58b66,0xc79c74],.5,0xa8553f,0x7d6a58);
 /* 1층 회벽 + 돌 모서리 + 기단 · 2층 나무 뼈대(앞으로 J만큼 내밈, 까치발) */
 s4B(p,2*W+.3,.28,2*D+.3,QN[1],[0,Y0+.14,0]);s4B(p,2*W,F1,2*D,CR1,[0,Y0+F1/2,0]);
 for(const sx of[-1,1])for(const sz of[-1,1])for(let k=0;k<6;k++){const y=Y0+.3+k*.44,lng=k%2;s4R(p,lng?.62:.36,.38,lng?.36:.62,QN[k%2],[sx*(W-(lng?.26:.13)),y+.2,sz*(D-(lng?.13:.26))],0,.04,.03)}
 s4B(p,2*W+.1,F2,2*D+J,CR2,[0,Y0+F1+F2/2,J/2]);for(let i=0;i<=8;i++){const x=-W-.05+i*(2*W+.1)/8;s4B(p,.15,F2,.08,BM2,[x,Y0+F1+F2/2,D+J+.04]);if(i<8&&i%2===0&&Math.abs(x)>.6)p.push(lkBeam([x+.12,Y0+F1+.15,D+J+.05],[x+(2*W+.1)/8-.12,WT-.15,D+J+.05],.1,.05,BM2))}
 for(const sx of[-1,1])for(let i=1;i<5;i++)s4B(p,.08,F2,.15,BM2,[sx*(W+.09),Y0+F1+F2/2,-D+i*(2*D+J)/5]);s4B(p,2*W+.4,.24,.3,BM,[0,Y0+F1+.02,D+J]);s4B(p,2*W+.34,.2,2*D+J+.34,BM,[0,WT,J/2]);
 for(let i=0;i<6;i++){const x=-W+.5+i*(2*W-1)/5;p.push(lkBeam([x,Y0+F1-.5,D+.03],[x,Y0+F1-.08,D+J-.02],.12,.1,BM))}
 /* 1층 앞: 내다 파는 큰 창(들창 받침) + 판대 위 요리 · 오른쪽 청록 문(채광창) + 좁은 창 · 줄무늬 차양 · 메뉴 칠판 */
 const HX=-2.1,HW=3.0,HY0=Y0+.95,HY1=Y0+2.2;s4R(p,HW+.3,HY1-HY0+.3,.14,BM,[HX,(HY0+HY1)/2,D+.06]);gl.push(pt(box(HW,HY1-HY0,.02),GLW,[HX,(HY0+HY1)/2,D-.05]));
 {const a=.35,L=1.3;p.push(pt(box(HW+.15,.07,L),WD[1],[HX,HY1+.12+L/2*Math.sin(a),D+.08+L/2*Math.cos(a)],[-a,0,0]));for(let i=0;i<5;i++)p.push(pt(box(.05,.075,L-.06),0x8a5a36,[HX-HW/2+.2+i*(HW-.4)/4,HY1+.13+L/2*Math.sin(a),D+.08+L/2*Math.cos(a)],[-a,0,0]))}
 for(const s of[-1,1])p.push(lkRod([HX+s*(HW/2-.15),HY0+.05,D+.5],[HX+s*(HW/2-.15),HY1+.52,D+1.25],.025,BM));wl(HX,D+.4,(HW+.5)/2,.36);
 s4R(p,HW+.5,.1,.62,WD[0],[HX,HY0-.02,D+.32]);for(const s of[-1,1])p.push(lkBeam([HX+s*(HW/2),HY0-.5,D+.05],[HX+s*(HW/2),HY0-.07,D+.55],.08,.07,BM));
 for(const [k,x] of[['ds_dish_steak',-1.0],['ds_dish_chowder',0],['ds_dish_shortcake',1.0]])if(GEO[k])p.push(pt(GEO[k],null,[HX+x,HY0+.04,D+.34],[0,0,0],[.72,.72,.72]));
 const DX=2.45;s4R(p,1.4,2.55,.14,BM,[DX,Y0+1.28,D+.07]);s4R(p,1.14,2.2,.08,SH,[DX,Y0+1.1,D+.12]);gl.push(pt(box(1.0,.24,.02),GLW,[DX,Y0+2.38,D+.16]));for(let k=0;k<3;k++)s4B(p,.9,.03,.02,0x2f7a7f,[DX,Y0+.45+k*.55,D+.17]);p.push(pt(new THREE.SphereGeometry(.05,8,6),0xd9a441,[DX-.42,Y0+1.1,D+.18]));
 s4Win(p,gl,4.15,Y0+1.6,D+.06,.7,1.1,BM2,GLW,false);s4Awning(p,1.5,4.75,Y0+2.78,D+.05,.95,.42,0xe0533f,0xf7f0e3,.46);s4Lantern(p,gl,DX-.95,Y0+2.05,D+.24,.22);
 q.lamps.push([DX-.95,Y0+2.05,D+.5],[HX,Y0+1.6,D+.45],[4.15,Y0+1.6,D+.4]);
 for(const s of[-1,1])p.push(pt(box(.62,.9,.05),BM2,[-4.35,Y0+.45,D+.75+s*.2],[s*.22,0,0]),pt(box(.5,.72,.06),0x2f3b33,[-4.35,Y0+.48,D+.75+s*.23],[s*.22,0,0]));for(let i=0;i<4;i++)s4B(p,.32,.025,.01,[0xf4efe4,0xffd35c][i%2],[-4.35,Y0+.7-i*.13,D+.99]);wl(-4.35,D+.75,.35,.3);
 /* 마늘·고추 줄(문 옆) */
 for(const s of[-1,1])for(let i=0;i<6;i++)p.push(pt(new THREE.SphereGeometry(.07,8,6),s<0?0xf4efe4:0xe0533f,[DX+s*.88,Y0+2.35-i*.18,D+.18],[0,0,0],s<0?[1,1,1]:[.7,1.4,.7]));
 /* 2층 앞: 창 셋(청록 덧창 + 꽃 상자) + 간판(1·2층 사이) */
 for(const x of[-3.2,0,3.2]){const y=Y0+F1+1.2;s4Win(p,gl,x,y,D+J+.06,1.05,1.0,BM2,0xffe3a0,true,SH);s4R(p,1.25,.24,.28,0x9c6a3d,[x,y-.7,D+J+.2]);for(let j=0;j<6;j++)p.push(pt(new THREE.IcosahedronGeometry(.085,0),[0xff6b6b,0xf28bb0,0xffd35c][(j+((x*3)|0))%3],[x-.5+j*.2,y-.53+(j%2)*.04,D+J+.22]),pt(new THREE.IcosahedronGeometry(.07,0),0x5f9a3c,[x-.42+j*.17,y-.58,D+J+.17]));q.lamps.push([x,y,D+J+.4])}
 s4R(p,3.9,.66,.1,0xf7f0e3,[-1.7,Y0+F1-.3,D+J+.12]);s4R(p,3.75,.52,.14,0xe0533f,[-1.7,Y0+F1-.3,D+J+.15]);q.sign={t:'🍳 요리 가게',w:3.4,h:.56,pos:[-1.7,Y0+F1-.3,D+J+.24],px:84};
 /* 옆 창 */
 for(const sx of[-1,1]){const x=sx*(W+.06);s4WinX(p,gl,sx,x,Y0+1.6,-1.2,1.0,1.0,BM2,GLW);s4WinX(p,gl,sx,x+sx*.05,Y0+F1+1.2,.9,.95,.9,BM2,0xffe3a0)}
 /* 지붕: 옆 박공 기와 + 박공벽 · 앞 지붕창 둘 · 굴뚝(연기) */
 s4RoofX(p,W+.05,D+J/2,WT,RS,TL2,TLD,.42,.42,TL);for(const sx of[-1,1]){const g=s4Prism(2*D+J+.2,RS,.18);g.rotateY(Math.PI/2);g.translate(sx*(W+.05),WT,J/2);p.push(pt(g,CR2));p.push(lkBeam([sx*(W+.47),WT-.04,-(D+.42)+J/2],[sx*(W+.47),WT+RS+.05,J/2],.2,.1,BM),lkBeam([sx*(W+.47),WT-.04,D+J/2+.42],[sx*(W+.47),WT+RS+.05,J/2],.2,.1,BM))}
 for(const x of[-3.0,3.0]){const dz=D-.35,dy=WT+.62;s4B(p,1.3,1.05,1.1,CR2,[x,dy,dz-.2]);s4Win(p,gl,x,dy+.05,dz+.36,.62,.6,BM2,0xffe3a0,false);s4RoofZ(p,.65,.65,dy+.52,.62,TL2,TLD,.12,.12,dz-.2);p.push(pt(s4Prism(1.32,.62,.1),CR2,[x,dy+.52,dz+.38]))}
 {const cx=-3.7,cz=-.9;for(let y=WT,k=0;y<WT+RS+.25;y+=.3,k++)s4B(p,.82,.3,.82,k%2?0xa8553f:0x9a4b37,[cx,y+.15,cz]);s4R(p,.98,.14,.98,0x6f757c,[cx,WT+RS+.42,cz]);q.chim=[cx,WT+RS+.6,cz]}
 /* 지붕 위 커다란 프라이팬(달걀 프라이) */
 {const px=.9,py=WT+RS*.55,pz=D-.9,q2=[pt(cyl(1.15,1.05,.16,28),0x2c2f33,[0,0,0]),pt(cyl(1.02,1.02,.04,28),0x4a4f55,[0,.09,0]),pt(new THREE.SphereGeometry(.7,20,10),0xfdfbf4,[-.08,.1,.04],[0,0,0],[1.08,.16,.92]),
   pt(new THREE.SphereGeometry(.31,16,10),0xf7c23a,[.04,.18,-.04],[0,0,0],[1,.55,1]),pt(new THREE.SphereGeometry(.1,10,8),0xfff6c8,[.14,.28,-.13]),pt(box(1.8,.14,.24),0x5f3a22,[1.95,.02,0]),pt(cyl(.12,.12,.16,10),0x3a3f4a,[1.15,.02,0],[0,0,Math.PI/2])],gg=mg(q2);
  gg.rotateX(Math.PI/2-.55);gg.rotateZ(.2);gg.translate(px,py+1.05,pz+.2);p.push(pt(gg,null));for(const s of[-1,1])p.push(lkRod([px+s*.55,py-.2,pz-.3],[px+s*.5,py+.6,pz+.12],.05,BM))}
 /* 옆(서쪽) 화덕 정자: 기둥 넷 + 기와 외지붕 + 화덕 + 장작 */
 {const x0=-7.7,x1=-5.35,z0=-2.6,z1=.8,cx=(x0+x1)/2,cz=(z0+z1)/2;if(GEO.ot_oven)p.push(pt(GEO.ot_oven,null,[cx,Y0,cz-.4],[0,0,0],[.95,.95,.95]));
  for(const x of[x0+.15,x1-.15])for(const z of[z0+.15,z1-.15])p.push(pt(cyl(.08,.09,2.6,8),BM,[x,Y0+1.3,z]));p.push(pt(box(x1-x0+.5,.1,z1-z0+.5),TL2,[cx,Y0+2.7,cz],[0,0,.12]));for(let z=z0-.2;z<=z1+.2;z+=.3)p.push(pt(cyl(.1,.1,x1-x0+.5,6,1,true),TL,[cx,Y0+2.78,z],[0,0,Math.PI/2+.12]));
  for(let r=0;r<3;r++)for(let c=0;c<4-r;c++)p.push(pt(cyl(.12,.12,.8,8),[0x7a4a2a,0x845232,0x6b4024][(r+c)%3],[cx-.4+c*.26+r*.13,Y0+.13+r*.23,z1-.25],[0,0,Math.PI/2]));wl(cx,cz,(x1-x0)/2+.1,(z1-z0)/2+.1)}
 /* 마당: 파라솔 식탁 셋 · 화로(그릴) · 채소 상자 · 허브 화분 · 레몬 나무 · 줄 전구 */
 const umb=(x,z,ca,cb)=>{if(GEO.dc_table_wround)p.push(pt(GEO.dc_table_wround,null,[x,Y0,z],[0,0,0],[1.15,1.15,1.15]));for(const a of[.3,2.4,4.5])if(GEO.lk_chair)p.push(pt(GEO.lk_chair,null,[x+Math.sin(a)*.95,Y0,z+Math.cos(a)*.95],[0,a+Math.PI,0]));
  p.push(pt(cyl(.03,.03,2.4,6),0xf4efe4,[x,Y0+1.2,z]));for(let i=0;i<8;i++){const a=i/8*Math.PI*2,g=new THREE.CylinderGeometry(.02,1.3,.42,3,1,true,a,Math.PI/4);p.push(pt(g,i%2?cb:ca,[x,Y0+2.35,z]))}p.push(pt(new THREE.SphereGeometry(.06,8,6),0xf4efe4,[x,Y0+2.6,z]));
  if(GEO.ds_dish_salad)p.push(pt(GEO.ds_dish_salad,null,[x,Y0+.82,z],[0,0,0],[.55,.55,.55]));wl(x,z,1.15,1.15)};
 umb(-5.2,5.9,0xe0533f,0xf7f0e3);umb(-1.9,7.2,0x3f8a8f,0xf7f0e3);umb(-6.4,2.5,0xf7c948,0xf7f0e3);
 if(GEO.ot_grill){p.push(pt(GEO.ot_grill,null,[6.3,Y0,6.3]));wl(6.3,6.3,.8,.42)}if(GEO.ot_vegcrates){p.push(pt(GEO.ot_vegcrates,null,[6.4,Y0,3.6],[0,-Math.PI/2,0]));wl(6.4,3.6,.42,1.1)}
 if(GEO.ot_planter)for(const [x,z] of[[4.2,8.15],[6.6,8.15]]){p.push(pt(GEO.ot_planter,null,[x,Y0,z],[0,0,0],[.9,.9,.9]));wl(x,z,.98,.3)}
 for(const [x,z] of[[7.5,-3.2],[-7.6,8.0]]){p.push(pt(cyl(.32,.28,.55,12),0x8a5a36,[x,Y0+.28,z]),pt(cyl(.04,.05,.6,6),0x7a5a3a,[x,Y0+.85,z]),pt(new THREE.SphereGeometry(.5,12,10),0x4f8a3c,[x,Y0+1.35,z]));for(let j=0;j<6;j++)p.push(pt(new THREE.SphereGeometry(.07,8,6),0xf7d43a,[x+Math.cos(j)*.4,Y0+1.35+Math.sin(j*2)*.3,z+Math.sin(j)*.4]));wl(x,z,.36,.36)}
 for(const sx of[-1,1]){const a=[sx*7.9,Y0,8.3];q.lamps.push(s5Post(p,gl,a[0],a[2],Y0,2.5));wl(a[0],a[2],.2,.2)}
 for(const [b,c] of[[[-W,Y0+F1-.05,D+J],[-7.9,Y0+2.6,8.3]],[[W,Y0+F1-.05,D+J],[7.9,Y0+2.6,8.3]],[[-7.9,Y0+2.6,8.3],[7.9,Y0+2.6,8.3]]]){for(let i=1;i<10;i++){const t=i/10,x=b[0]+(c[0]-b[0])*t,y=b[1]+(c[1]-b[1])*t-Math.sin(t*Math.PI)*.45,z=b[2]+(c[2]-b[2])*t;gl.push(pt(new THREE.SphereGeometry(.06,6,4),[0xffd36a,0xff9a7a,0xa8f08a][i%3],[x,y,z]))}plSag(p,b,c,.45,0x3a3f4a,.012)}
 const g=mg(p);lkSmooth(g,40);GEO.sh84_cook=g;GEO.sh84_cook_glow=mg(gl)}

/* ========== 바깥 4: 사냥꾼 상점 — 흙 마당·통나무 울타리 · 돌 기단 위 짙은 통나무 2층 · 앞 지붕창(간판·사슴뿔) · 지붕 덮인 현관 · 돌 굴뚝 · 장작 헛간 · 가죽 틀·과녁·모닥불·수레 ========== */
function sh84HuntGeo(){const q=SH84.hunt,p=[],gl=[],W=q.B[0],D=q.B[1],Y0=q.LY,PL=.36,F1=2.5,F2=2.05,WT=Y0+PL+F1+F2,RS=1.6,LR=.16,LS=.31,LOG=[0x7a4a2a,0x6b4024,0x845232],END=0xc29a6a,RING=0x9c7044,GRN=0x3f6b4a,GRN2=0x2f5238,DK=0x4a2e1c,CRM=0xefe3c8,STN=[0x8f969c,0x7f868d,0x9aa1a8,0x878d93],GLW=0xffc97a,PY=q.lots[1][4];
 const wl=(x,z,hx,hz)=>q.walls.push([x,z,hx,hz]);q.walls.length=0;wl(0,0,W+.12,D+.12);q.lamps=[];
 s5Dirt(p,-8.2,8.2,-4.0,8.6,Y0,[0x9c7a52,0x8a6a44,0xa8865c,0x7d6040]);
 /* 돌 기단 + 통나무 벽(끝 나이테) */
 s4B(p,2*W+.4,PL,2*D+.4,STN[1],[0,Y0+PL/2,0]);for(let i=0;i<12;i++)for(let j=0;j<2;j++){const x=-W+.45+i*.9+(j?.45:0);if(x<W)s4R(p,.8,.2,.08,STN[(i+j*2)%4],[x,Y0+.12+j*.22,D+.22],0,.04,.03)}
 const Y1=Y0+PL;s4B(p,2*W-.1,WT-Y1,2*D-.1,LOG[1],[0,(Y1+WT)/2,0]);const n=Math.floor((WT-Y1)/LS);
 for(let i=0;i<n;i++){const y=Y1+LR+i*LS;for(const sz of[-1,1]){p.push(pt(cyl(LR,LR,2*W+.5,9),LOG[i%3],[0,y,sz*D],[0,0,Math.PI/2]));for(const sx of[-1,1])p.push(pt(cyl(LR*.9,LR*.9,.02,9),END,[sx*(W+.26),y,sz*D],[0,0,Math.PI/2]),pt(cyl(LR*.45,LR*.45,.022,7),RING,[sx*(W+.262),y,sz*D],[0,0,Math.PI/2]))}
  if(i<n-1)for(const sx of[-1,1]){const y2=y+LS/2;p.push(pt(cyl(LR,LR,2*D+.5,9),LOG[(i+1)%3],[sx*W,y2,0],[Math.PI/2,0,0]));for(const sz of[-1,1])p.push(pt(cyl(LR*.9,LR*.9,.02,9),END,[sx*W,y2,sz*(D+.26)],[Math.PI/2,0,0]))}}
 s4B(p,2*W+.6,.24,.34,DK,[0,Y1+F1,D+.12]);
 /* 1층 앞: 쇠 띠 두 짝 문 · 창(초록 덧창) · 가죽 · 엇갈린 화살 */
 s4R(p,2.1,2.55,.14,DK,[0,Y1+1.27,D+.12]);for(const s of[-1,1]){for(let k=0;k<3;k++)s4R(p,.3,2.32,.07,[0x5b3a22,0x664128,0x553620][k],[s*(.17+k*.3),Y1+1.16,D+.2],0,.02,.01);for(const y of[.55,1.75])s4B(p,.88,.07,.03,0x2c2f33,[s*.47,Y1+y,D+.25]);p.push(pt(new THREE.TorusGeometry(.08,.02,6,12),0x9aa3ab,[s*.16,Y1+1.2,D+.27]))}
 for(const sx of[-1,1]){s4Win(p,gl,sx*3.15,Y1+1.55,D+.14,1.3,1.15,DK,GLW,true,GRN);const pel=s4Shape([[-.36,-.5],[-.16,-.38],[0,-.54],[.16,-.38],[.36,-.5],[.32,-.08],[.44,.2],[.26,.36],[.12,.56],[-.12,.56],[-.26,.36],[-.44,.2],[-.32,-.08]],.04);p.push(pt(pel,sx<0?0x8a5a36:0xb98556,[sx*1.65,Y1+1.65,D+.22]))}
 q.lamps.push([-3.15,Y1+1.55,D+.5],[3.15,Y1+1.55,D+.5]);
 /* 2층 창 둘 · 옆 창 */
 for(const sx of[-1,1]){s4Win(p,gl,sx*3.2,Y1+F1+1.2,D+.14,1.1,1.0,DK,0xffd98a,true,GRN);q.lamps.push([sx*3.2,Y1+F1+1.2,D+.4])}
 for(const sx of[-1,1]){const x=sx*(W+.1);s4WinX(p,gl,sx,x,Y1+1.55,-1.1,1.1,1.05,DK,GLW);s4WinX(p,gl,sx,x,Y1+F1+1.2,1.0,1.0,.9,DK,0xffd98a)}
 /* 지붕(옆 박공, 짙은 초록 철판) + 박공 판자 · 앞 지붕창(간판 + 사슴뿔) */
 s4RoofX(p,W,D,WT,RS,GRN,GRN2,.45,.45);for(const sx of[-1,1]){const g=s4Prism(2*D+.2,RS,.18);g.rotateY(Math.PI/2);g.translate(sx*W,WT,0);p.push(pt(g,0x7a5232));for(let z=-D+.3;z<D;z+=.42){const h=RS*(1-Math.abs(z)/(D+.1));if(h>.15)s4B(p,.03,h,.03,0x6b4426,[sx*(W+.1),WT+h/2,z])}}
 {const dw=1.75,dz0=D-1.4,dz1=D+.04,y0=WT-.25,y1=WT+1.25;s4B(p,2*dw,y1-y0,dz1-dz0,0x8a5a36,[0,(y0+y1)/2,(dz0+dz1)/2]);for(let k=-4;k<=4;k++)s4B(p,.03,y1-y0,.03,0x6b4426,[k*.4,(y0+y1)/2,dz1+.01]);
  s4RoofZ(p,dw,(dz1-dz0)/2,y1,1.0,GRN,GRN2,.28,.22,(dz0+dz1)/2);{const g=s4Prism(2*dw+.1,1.0,.12);g.translate(0,y1,dz1);p.push(pt(g,0x7a5232))}
  s4R(p,3.15,.66,.14,0x5b3a22,[0,y0+.72,dz1+.1]);s4R(p,2.95,.5,.18,0xd8b878,[0,y0+.72,dz1+.12]);q.sign={t:'🏹 사냥꾼 상점',w:2.85,h:.48,pos:[0,y0+.72,dz1+.22],px:82};
  const ay=y1+.42,az=dz1+.16;p.push(pt(cyl(.34,.34,.08,18),0x6b4426,[0,ay,az],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.2,12,8),0x8a5a36,[0,ay-.04,az+.1],[0,0,0],[1,1.2,.8]));
  for(const s of[-1,1]){const b0=[s*.15,ay+.1,az+.12],b1=[s*.6,ay+.44,az+.12],b2=[s*.84,ay+1.0,az+.08],b3=[s*.76,ay+1.48,az+.04];p.push(lkRod(b0,b1,.06,CRM),lkRod(b1,b2,.05,CRM),lkRod(b2,b3,.04,CRM),lkRod(b1,[s*.44,ay+.84,az+.16],.036,CRM),lkRod(b2,[s*.52,ay+1.32,az+.12],.032,CRM),lkRod(b2,[s*1.2,ay+1.24,az+.08],.032,CRM),lkRod(b3,[s*1.0,ay+1.8,az],.028,CRM))}
  q.lamps.push([0,y0+.72,dz1+.5])}
 {const cx=W+.42,cz=.5;for(let y=Y0,k=0;y<WT+RS*.75;y+=.32,k++)s4R(p,.85-(y>WT?.1:0),.32,.85-(y>WT?.1:0),STN[k%4],[cx,y+.16,cz],0,.05,.04);s4R(p,.86,.14,.86,0x5a616a,[cx,WT+RS*.75+.12,cz]);q.chim=[cx,WT+RS*.75+.3,cz];wl(cx,cz,.5,.5)}
 /* 현관: 판자 마루(한 칸 위) + 통나무 기둥 넷 + 외지붕 + 난간(가운데 계단) + 등 */
 {const PZ=D+1.85;for(let z=D+.25,k=0;z<PZ;z+=.3,k++)s4B(p,2*4.7,.08,.27,[0x8a5a36,0x7d5232,0x96633d][k%3],[0,PY-.04,z]);s4B(p,9.4,PY-Y0,.12,DK,[0,(Y0+PY)/2,PZ]);s4R(p,2.4,.12,.4,0x7d5232,[0,(Y0+PY)/2,PZ+.18]);
  for(const x of[-4.5,-1.3,1.3,4.5]){p.push(pt(cyl(.17,.19,2.75,10),LOG[0],[x,PY+1.37,PZ-.2]),pt(cyl(.21,.21,.06,10),DK,[x,PY+2.75,PZ-.2]));wl(x,PZ-.2,.22,.22)}
  p.push(pt(cyl(.17,.17,9.6,10),LOG[2],[0,PY+2.7,PZ-.2],[0,0,Math.PI/2]));{const L=Math.hypot(PZ-D+.3,.45),a=Math.atan2(.45,PZ-D+.3);p.push(pt(box(10.0,.14,L),GRN,[0,PY+2.95+.22,(D+PZ+.3)/2],[a,0,0]));for(let k=1;k<26;k++)p.push(pt(box(.05,.05,L),GRN2,[-5+k*.38,PY+3.04+.22,(D+PZ+.3)/2],[a,0,0]))}
  for(const [x0,x1] of[[-4.5,-1.3],[1.3,4.5]]){for(const y of[.45,.85])p.push(pt(cyl(.075,.075,x1-x0,8),LOG[1],[(x0+x1)/2,PY+y,PZ-.2],[0,0,Math.PI/2]));wl((x0+x1)/2,PZ-.2,(x1-x0)/2,.12)}
  for(const s of[-1,1]){s4Lantern(p,gl,s*1.3,PY+2.2,PZ-.02,.22);q.lamps.push([s*1.3,PY+2.2,PZ+.25])}
  for(const s of[-1,1]){p.push(pt(cyl(.3,.3,.06,14),0x8a5a36,[s*2.8,Y1+2.15,D+.22],[Math.PI/2,0,0]));for(const a of[-.7,.7]){p.push(lkRod([s*2.8-Math.sin(a)*.45,Y1+2.15-Math.cos(a)*.45,D+.27],[s*2.8+Math.sin(a)*.45,Y1+2.15+Math.cos(a)*.45,D+.27],.016,0x6b4426));p.push(pt(cone(.045,.13,4),0x9aa3ab,[s*2.8+Math.sin(a)*.5,Y1+2.15+Math.cos(a)*.5,D+.27],[0,0,-a]))}}
  q.porch=PZ}
 /* 옆(서쪽) 장작 헛간 */
 {const x0=-7.6,x1=-W-.15,z0=-2.8,z1=.5,cx=(x0+x1)/2,cz=(z0+z1)/2;for(const x of[x0+.12])for(const z of[z0+.12,z1-.12])p.push(pt(cyl(.09,.1,2.2,8),LOG[0],[x,Y0+1.1,z]));p.push(pt(box(x1-x0+.4,.1,z1-z0+.4),GRN,[cx,Y0+2.42,cz],[0,0,.22]));
  for(let r=0;r<6;r++)for(let c=0;c<9;c++)p.push(pt(cyl(.13,.13,.95,8),LOG[(r+c)%3],[cx+(r%2?.1:-.1),Y0+.14+r*.25,z0+.3+c*.29],[0,0,Math.PI/2]),pt(cyl(.12,.12,.02,8),END,[cx+(r%2?.1:-.1)+.48,Y0+.14+r*.25,z0+.3+c*.29],[0,0,Math.PI/2]));wl(cx,cz,(x1-x0)/2+.1,(z1-z0)/2+.1)}
 /* 통나무 울타리(양옆) + 앞 모퉁이 등 기둥 */
 for(const sx of[-1,1]){const x=sx*8.05;for(let z=-3.8;z<=7.21;z+=2.2){p.push(pt(cyl(.1,.12,1.15,8),LOG[1],[x,Y0+.57,z]));if(z+2.2<=7.25)for(const y of[.45,.88])p.push(pt(cyl(.07,.07,2.25,7),LOG[(Math.round(z)+(y>.6?1:0))%3&1?0:2],[x,Y0+y,z+1.1],[Math.PI/2,0,0]))}wl(x,1.7,.12,5.6);q.lamps.push(s5Post(p,gl,x,8.25,Y0,2.3));wl(x,8.25,.2,.2)}
 /* 마당: 가죽 틀 둘 · 고기 건조대 · 모닥불(꼬치) + 앉는 통나무 · 과녁 + 건초 · 도끼 꽂힌 그루터기 · 수레(상자) · 통 · 뿔 표지판 */
 if(GEO.ot_hideframe)for(const [x,z,r] of[[-6.6,3.3,.25],[-6.8,5.5,.1]]){p.push(pt(GEO.ot_hideframe,null,[x,Y0,z],[0,r,0]));wl(x,z,.8,.3)}
 if(GEO.ot_meatrack){p.push(pt(GEO.ot_meatrack,null,[5.6,Y0,6.9]));wl(5.6,6.9,1.4,.2)}
 if(GEO.ot_spit){p.push(pt(GEO.ot_spit,null,[-2.9,Y0,6.6],[0,0,0],[.9,.9,.9]));wl(-2.9,6.6,.95,.6)}for(const [x,z] of[[-4.5,6.2],[-1.3,6.3]]){p.push(pt(cyl(.2,.2,1.0,9),LOG[(x|0)&1],[x,Y0+.2,z],[Math.PI/2,0,.2]));wl(x,z,.25,.55)}
 if(GEO.ot_target){p.push(pt(GEO.ot_target,null,[6.7,Y0,2.4],[0,-Math.PI/2+.3,0]));wl(6.7,2.4,.5,.6)}s4R(p,1.0,.55,.6,0xd9c26a,[6.6,Y0+.27,4.0],[0,.2,0],.15,.1);for(let i=0;i<5;i++)s4B(p,.02,.5,.62,0xc2aa55,[6.2+i*.2,Y0+.28,4.0]);wl(6.6,4.0,.55,.38);
 p.push(pt(cyl(.34,.4,.5,12),0x8a5a36,[3.5,Y0+.25,7.4]),pt(cyl(.32,.32,.03,12),END,[3.5,Y0+.51,7.4]),lkRod([3.55,Y0+.5,7.4],[3.75,Y0+1.1,7.5],.03,0x9c6a3d),pt(box(.26,.17,.05),0x9aa3ab,[3.55,Y0+.55,7.4],[0,.3,.3]));wl(3.5,7.4,.4,.4);
 {const cx=6.6,cz=-1.9;s4R(p,1.4,.12,2.5,0x8a5a36,[cx,Y0+.75,cz]);for(const s of[-1,1])s4B(p,.08,.4,2.5,0x6b4426,[cx+s*.68,Y0+.98,cz]);for(const s of[-1,1])for(const t of[-.7,.75]){p.push(pt(cyl(.42,.42,.08,16),0x5b3a22,[cx+s*.78,Y0+.42,cz+t],[0,0,Math.PI/2]));p.push(pt(cyl(.08,.08,.1,8),0x2c2f33,[cx+s*.82,Y0+.42,cz+t],[0,0,Math.PI/2]))}
  p.push(lkBeam([cx,Y0+.7,cz+1.25],[cx,Y0+.45,cz+2.3],.08,.08,0x6b4426));for(const [dx,dz,c] of[[-.3,-.6,0xb98556],[.3,-.5,0xa67848],[0,.4,0xc08d5c]])s4R(p,.55,.45,.55,c,[cx+dx,Y0+1.04,cz+dz]);wl(cx,cz+.25,.85,1.6)}
 for(const [x,z] of[[5.6,4.6],[-5.4,-3.4]])p.push(pt(cyl(.33,.3,.85,12),0x6b4024,[x,Y0+.43,z]),pt(cyl(.34,.34,.05,12),DK,[x,Y0+.65,z]),pt(cyl(.34,.34,.05,12),DK,[x,Y0+.2,z])),wl(x,z,.38,.38);
 {const x=-1.9,z=8.2;p.push(pt(cyl(.1,.12,2.4,8),LOG[0],[x,Y0+1.2,z]));s4R(p,1.0,.3,.08,0x6b4426,[x+.42,Y0+1.7,z+.06],[0,0,-.06]);p.push(pt(cone(.18,.25,3),0x6b4426,[x+.98,Y0+1.66,z+.06],[0,0,-Math.PI/2]));
  for(const s of[-1,1])p.push(lkRod([x,Y0+2.4,z],[x+s*.35,Y0+2.8,z],.04,CRM),lkRod([x+s*.35,Y0+2.8,z],[x+s*.55,Y0+3.15,z],.03,CRM),lkRod([x+s*.35,Y0+2.8,z],[x+s*.62,Y0+2.85,z],.025,CRM));wl(x,z,.16,.16)}
 const g=mg(p);lkSmooth(g,40);GEO.sh84_hunt=g;GEO.sh84_hunt_glow=mg(gl)}

/* ========== 안: 가운데 큰 방(계산대·상인·자판기 줄) + 옆방들 · 칸막이 벽(문·방 이름표) · 방마다 다른 바닥·꾸밈 ========== */
const SH84TH={
 fish:{wall:[0x5a9cbc,0x5294b4],low:0x3a7697,trim:0xf4efe4,wk:'board'},
 plant:{wall:[0xf4efe4,0xefe8da],low:0x5f9a5a,trim:0xf7f4ec,wk:'plain'},
 cook:{wall:[0xf3e4c4,0xefdfbc],low:0xa8553f,trim:0x6b4426,wk:'brick'},
 hunt:{wall:[0x7a4a2a,0x6b4024,0x845232],low:0x5b3a22,trim:0x4a2e1c,wk:'log'}};
function sh84Room(k){const C=SH85IN[k],W=C.hw,D=C.hd,CW=SH84R.cor[0],CL=SH84R.cor[1],WH=3.4,PH=2.4,LH=1.1,T=.16,th=SH84TH[k],p=[],gl=[],gw=[],H=new THREE.Group(),blk=[],q=SH84[k];
 const B=(w,h,d,c,pos,rot)=>s4B(p,w,h,d,c,pos,rot),Rb=(w,h,d,c,pos,rot,cr,bv)=>s4R(p,w,h,d,c,pos,rot,cr,bv),bk=(x,z,hx,hz)=>blk.push([x,z,hx,hz]),
  put=(key,x,y,z,ry=0,s=1)=>{if(GEO[key])p.push(pt(GEO[key],null,[x,y,z],[0,ry,0],[s,s,s]));return !!GEO[key]};
 /* 바닥: 방마다 */
 for(const [x0,x1,z0,z1,f,cs,s0] of C.rooms){if(f==='plank'){for(let z=z0+.15,i=0;z<z1-.01;z+=.3,i++)B(x1-x0,.06,Math.min(.28,(z1-z+.15)-.02),cs[i%cs.length],[(x0+x1)/2,-.03,z])}
  else{const s=s0||.6,nx=Math.max(1,Math.round((x1-x0)/s)),nz=Math.max(1,Math.round((z1-z0)/s)),sx=(x1-x0)/nx,sz=(z1-z0)/nz;for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)B(sx-.014,.06,sz-.014,cs[f==='stone'?(i*7+j*3+((hash(i,j,861)*4)|0))%cs.length:(i+j)%cs.length],[x0+sx*(i+.5),-.03,z0+sz*(j+.5)])}}
 for(let z=D+.15,i=0;z<D+CL;z+=.3,i++)B(2*CW,.06,.28,[0x9c7a52,0x8a6a44][i%2],[0,-.03,z]);B(2*W,.06,2*D,0x3a2a20,[0,-.09,0]);for(const sd of[-1,1])B(.06,.05,CL,th.trim,[sd*(CW+.03),.025,D+CL/2]);
 /* 벽 조각(축에 맞춤): 바깥 벽은 높이 WH, 칸막이 PH, 낮은 벽 LH */
 const wseg=(x0,z0,x1,z1,h)=>{const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),len=ax?Math.abs(x1-x0):Math.abs(z1-z0);if(len<.05)return;const cx=(x0+x1)/2,cz=(z0+z1)/2,w=[],add=(g,c,pos)=>w.push(pt(g,c,pos));
  if(th.wk==='log'){for(let y=.15,i=0;y<h-.05;y+=.3,i++)add(cyl(.15,.15,len+.04,9).rotateZ(Math.PI/2),th.wall[i%3],[0,y,0])}
  else{add(box(len,h,T),th.wall[0],[0,h/2,0]);const lw=Math.min(1.05,h*.45);add(box(len,lw,T+.03),th.low,[0,lw/2,0]);add(box(len+.02,.08,T+.07),th.trim,[0,lw+.03,0]);
   if(th.wk==='board'&&h>1.5)for(let x=-len/2+.2,i=0;x<len/2;x+=.4,i++)for(const s of[-1,1])add(box(.36,h-lw-.12,.03),th.wall[i%2],[x,lw+.06+(h-lw-.12)/2,s*(T/2+.01)]);
   if(th.wk==='brick')for(const s of[-1,1])for(let y=.12,r=0;y<lw-.05;y+=.18,r++)for(let x=-len/2+(r%2?.2:0)+.2;x<len/2-.1;x+=.4)add(box(.36,.15,.03),[0xa8553f,0x9a4b37,0xb25e45][(r+Math.abs(Math.round(x*5)))%3],[x,y,s*(T/2+.01)])}
  add(box(len+.1,.12,T+.12),th.trim,[0,h+.02,0]);const g=mg(w);if(!ax)g.rotateY(Math.PI/2);g.translate(cx,0,cz);p.push(g);bk(cx,cz,ax?len/2:.12,ax?.12:len/2)};
 const dframe=(x,z,ax,w,h)=>{const ph=2.25,f=[];for(const s of[-1,1])f.push(pt(box(.16,ph,.26),th.trim,[s*(w/2+.02),ph/2,0]));f.push(pt(box(w+.36,.16,.26),th.trim,[0,ph+.08,0]));if(h>ph+.25)f.push(pt(box(w,h-ph-.16,T),th.wall[0],[0,(ph+.16+h)/2,0]));
  const g=mg(f);if(!ax)g.rotateY(Math.PI/2);g.translate(x,0,z);p.push(g)};
 const wall=(axis,c,a0,a1,h,doors=[])=>{let a=a0;for(const [m,w] of doors.slice().sort((u,v)=>u[0]-v[0])){if(axis==='x')wseg(a,c,m-w/2,c,h);else wseg(c,a,c,m-w/2,h);a=m+w/2;if(axis==='x')dframe(m,c,1,w,h);else dframe(c,m,0,w,h)}if(axis==='x')wseg(a,c,a1,c,h);else wseg(c,a,c,a1,h)};
 wall('x',-D,-W,W,WH);wall('z',-W,-D,D,WH);wall('z',W,-D,D,WH);wall('x',D,-W,-CW,.5);wall('x',D,CW,W,.5);
 for(const [ax,c,a0,a1,doors,low] of C.part)wall(ax,c,a0,a1,low?LH:PH,doors);
 /* 방 이름표(문 위) */
 const signs=[];for(const [t,a,b,ax] of C.signs){const x=ax==='z'?a:a,z=ax==='z'?b:b,y=ax==='z'?2.86:2.62;Rb(1.95,.46,.07,0xf7f0e3,[x,y,z+.02]);Rb(2.05,.54,.05,th.trim===0xf4efe4||th.trim===0xf7f4ec?0x8a5a36:th.trim,[x,y,z-.01]);if(ax==='z')for(const s of[-1,1])B(.02,.3,.02,0x3a3f4a,[x+s*.75,y+.4,z]);signs.push([t,x,y,z+.065])}
 /* 천장 등(큰 방) */
 for(const [x,z] of C.lamps||[[-3.2,-.6],[3.2,-.6],[0,3.6]]){B(.03,.7,.03,0x2c2f33,[x,WH-.35,z]);Rb(.5,.22,.5,0x2c2f33,[x,WH-.78,z],0,.08,.05);gl.push(pt(new THREE.SphereGeometry(.17,10,8),0xffd98a,[x,WH-.92,z]))}
 /* 계산대 + 상인 자리 · 자판기 줄 막힘 */
 const [cx,cz]=C.ctr,nz=C.npc[1];
 if(k==='fish'){Rb(3.8,.95,.78,0x9c6a3d,[cx,.48,cz]);Rb(3.95,.08,.86,0x6f4a2c,[cx,.98,cz]);gl.push(pt(box(2.2,.36,.6),0xcfeef8,[cx-.5,1.2,cz]));B(2.24,.04,.64,0xf4efe4,[cx-.5,1.4,cz]);[0xc9d6de,0xff7a3d,0x6aa6c8,0xc9d6de].forEach((c,i)=>s4Fish(p,cx-1.3+i*.5,1.08,cz+(i%2?.1:-.1),1.1,c,.1));
  Rb(.42,.28,.34,0x5a616a,[cx+1.35,1.16,cz-.05]);p.push(pt(cyl(.16,.18,.05,14),0xc9cdd2,[cx+.85,1.04,cz]),pt(cyl(.012,.012,.3,4),0x3a3f4a,[cx+.85,1.2,cz]))}
 if(k==='plant'){Rb(3.8,.95,.78,0xb98556,[cx,.48,cz]);Rb(3.95,.08,.86,0x8a5a36,[cx,.98,cz]);for(let i=0;i<5;i++){const x=cx-1.5+i*.75;p.push(pt(cyl(.16,.13,.3,12),[0x8fb6c9,0xd9d2c4,0x8fb6c9][i%3],[x,1.17,cz]));for(let j=0;j<5;j++)p.push(pt(new THREE.IcosahedronGeometry(.07,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff,0xffffff][(i+j)%5],[x+Math.cos(j*1.3)*.1,1.42+(j%2)*.08,cz+Math.sin(j*1.3)*.1]))}}
 if(k==='cook'){Rb(3.8,.95,.78,0xf4efe4,[cx,.48,cz]);Rb(3.95,.08,.86,0x6b4426,[cx,.98,cz]);for(const [g2,x] of[['ds_dish_steak',-1.3],['ds_dish_shortcake',-.4],['ds_dish_chowder',.5]])put(g2,cx+x,1.02,cz,0,.8);p.push(pt(cyl(.2,.24,.18,14),0xc8643c,[cx+1.35,1.11,cz]),pt(new THREE.SphereGeometry(.18,10,6,0,Math.PI*2,0,Math.PI/2),0xd9a441,[cx+1.35,1.2,cz]));
  for(const y of[1.75,2.45]){B(3.6,.05,.3,0x8a5a36,[cx,y,-D+.2]);for(let i=0;i<7;i++)p.push(pt(cyl(.08,.08,.22,10),[0xe8c35a,0xc8643c,0x7fbf5a,0xf4efe4][(i+((y*2)|0))%4],[cx-1.5+i*.5,y+.14,-D+.2]))}}
 if(k==='hunt'){for(let i=0;i<3;i++)p.push(pt(cyl(.16,.16,3.9,9),[0x7a4a2a,0x845232,0x6b4024][i],[cx,.18+i*.3,cz+.18],[0,0,Math.PI/2]),pt(cyl(.16,.16,3.9,9),[0x6b4024,0x7a4a2a,0x845232][i],[cx,.18+i*.3,cz-.18],[0,0,Math.PI/2]));Rb(3.95,.1,.82,0x5b3a22,[cx,.98,cz]);
  const pel=s4Shape([[-.45,-.35],[0,-.45],[.45,-.35],[.55,.1],[.3,.4],[-.3,.4],[-.55,.1]],.03);p.push(pt(pel,0xb98556,[cx-.8,1.05,cz],[-Math.PI/2,0,.2]));Rb(.5,.08,.35,0x9aa3ab,[cx+.9,1.07,cz]);for(let i=0;i<5;i++)B(.06,.1,.06,0x9aa3ab,[cx+.7+i*.1,1.14,cz+.12]);
  const ay=2.75,az=-D+.2;p.push(pt(cyl(.42,.42,.08,18),0x6b4426,[cx,ay,az],[Math.PI/2,0,0]),pt(new THREE.SphereGeometry(.25,12,8),0x8a5a36,[cx,ay-.1,az+.2],[0,0,0],[1,1.2,1]),pt(cone(.12,.4,8),0x8a5a36,[cx,ay-.32,az+.4],[Math.PI/2+.4,0,0]));
  for(const s of[-1,1]){const b0=[cx+s*.15,ay+.05,az+.25],b1=[cx+s*.6,ay+.35,az+.25],b2=[cx+s*.85,ay+.62,az+.2];p.push(lkRod(b0,b1,.05,0xefe3c8),lkRod(b1,b2,.04,0xefe3c8),lkRod(b1,[cx+s*.5,ay+.7,az+.3],.03,0xefe3c8),lkRod(b2,[cx+s*1.15,ay+.75,az+.2],.03,0xefe3c8))}}
 bk(cx,(cz+nz)/2-.15,2.05,Math.abs(nz-cz)/2+.62);{const l=C.row[0]-.72,r=C.row[4]+.52;bk((l+r)/2,-D+.6,(r-l)/2,.56)}
 if(k==='fish'||k==='plant'){try{const b=k==='fish'?plDexBoard():piDexBoard();b.position.set(cx,0,-D+.25);H.add(b)}catch(e){console.warn(e)}}
 /* ---- 가게마다 방 꾸밈 ---- */
 const barrel=(x,z,c=0x8a5a36)=>{p.push(pt(cyl(.36,.33,.92,12),c,[x,.46,z]),pt(cyl(.37,.37,.05,12),0x4a2e1c,[x,.72,z]),pt(cyl(.37,.37,.05,12),0x4a2e1c,[x,.22,z]));bk(x,z,.4,.4)};
 const crate=(x,z,s=1,c=0xb98556)=>{Rb(.7*s,.6*s,.7*s,c,[x,.3*s,z]);for(const sx of[-1,1])B(.05,.6*s,.72*s,0x8a5a36,[x+sx*.33*s,.3*s,z]);bk(x,z,.38*s,.38*s)};
 const shelf=(x,z,w,h,n,col,item,dz=.4)=>{Rb(w,h,dz,col,[x,h/2,z]);for(let i=1;i<=n;i++){const y=h*i/(n+1);B(w-.08,.05,dz-.02,0x5b3a22,[x,y,z+.02]);for(let j=0;j<Math.floor(w/.32);j++)item(x-w/2+.2+j*.32,y+.03,z+.04,i,j)}bk(x,z,w/2+.04,dz/2+.04)};
 const rug=(x,z,w,d,c,b)=>{B(w,.02,d,b,[x,.012,z]);B(w-.24,.025,d-.24,c,[x,.016,z]);for(let i=0;i<Math.floor(w/.4);i++)B(.06,.026,d-.5,b,[x-w/2+.3+i*.4,.02,z])};
 const lamp=(x,z,y=WH)=>{B(.03,y-2.2,.03,0x2c2f33,[x,(y+2.2)/2,z]);Rb(.4,.18,.4,0x2c2f33,[x,2.15,z],0,.06,.04);gl.push(pt(new THREE.SphereGeometry(.13,10,8),0xffd98a,[x,2.02,z]))};
 const wlamp=(x,y,z,ry=0)=>{const g=[pt(box(.12,.3,.08),0x2c2f33,[0,0,0]),pt(box(.05,.05,.22),0x2c2f33,[0,.1,.12])];const gg=mg(g);gg.rotateY(ry);gg.translate(x,y,z);p.push(gg);gl.push(pt(new THREE.SphereGeometry(.11,8,6),0xffd98a,[x+Math.sin(ry)*.24,y+.02,z+Math.cos(ry)*.24]))};
 const pot=(x,z,s=1)=>{p.push(pt(cyl(.3*s,.23*s,.5*s,12),0xc77a52,[x,.25*s,z]),pt(new THREE.IcosahedronGeometry(.45*s,1),0x4f8a3c,[x,.82*s,z]),pt(new THREE.IcosahedronGeometry(.32*s,1),0x5f9a3c,[x+.1*s,1.2*s,z]));bk(x,z,.34*s,.34*s)};
 if(k==='fish'){
  /* 큰 방: 천장 큰 물고기 · 미끼·릴 진열대 둘 · 배 바퀴·노 · 화분 */
  {const g=is82FishGeo(3.6,0x2f5f8a,0xd8e6ee,0x234d72);p.push(pt(g,null,[0,2.7,1.2],[0,0,0]));for(const s of[-1,1])B(.02,.6,.02,0x3a3f4a,[s*1.1,3.1,1.2])}
  for(const sx of[-1,1]){const x=sx*3.4,z=2.6;Rb(2.0,.85,1.0,0x9c6a3d,[x,.43,z]);Rb(2.1,.06,1.1,0x6f4a2c,[x,.88,z]);for(let i=0;i<8;i++)p.push(pt(new THREE.SphereGeometry(.07,8,6),[0xff7a3d,0xf7c948,0x3f7fd0,0xe0533f,0x5bae5f][i%5],[x-.8+i*.23,.97,z+(i%2?.2:-.2)],[0,0,0],[1.6,.7,.7]));
   for(let i=0;i<3;i++)p.push(pt(cyl(.12,.12,.1,12),0x4a4f55,[x-.6+i*.6,.98,z+.35]));bk(x,z,1.08,.58)}
  p.push(pt(new THREE.TorusGeometry(.45,.06,6,18),0x8a5a36,[2.0,2.8,-D+.12]));for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.push(lkRod([2.0,2.8,-D+.12],[2.0+Math.cos(a)*.6,2.8+Math.sin(a)*.6,-D+.12],.03,0x8a5a36))}
  for(const s of[-1,1])p.push(lkRod([4.6-s*.6,2.25,-D+.12],[4.6+s*.6,3.15,-D+.12],.04,0x9c6a3d));pot(-5.2,6.2,.9);pot(5.2,6.2,.9);rug(0,5.6,2.2,1.4,0x3a8fc4,0xf4efe4);
  /* 수조실: 벽 수조 · 둥근 수조 · 산호 · 의자 */
  {const x=-10.55;Rb(.9,.6,5.0,0x2c6a8c,[x,.3,3.6]);gw.push(pt(box(.7,1.5,4.8),0x5fc4e0,[x,1.38,3.6]));gl.push(pt(box(.66,.02,4.76),0xbff0fa,[x,2.07,3.6]),pt(box(.66,.04,4.76),0x3f7a9a,[x,.64,3.6]));for(const s of[-1,1]){B(.9,.08,.08,0x2c6a8c,[x,2.16,3.6+s*2.46]);B(.08,.08,5.0,0x2c6a8c,[x+s*.42,2.16,3.6])}for(const z of[1.2,2.4,3.6,4.8,6.0])B(.06,1.5,.06,0x2c6a8c,[x+.4,1.38,z]);for(let i=0;i<9;i++)s4Fish(p,x+.05,.9+(i%3)*.42,1.6+i*.48,1.0,[0xff7a3d,0xf2c94c,0xe0533f,0xffffff][i%4],Math.PI/2*(i%2?1:-1));
   for(let i=0;i<6;i++)p.push(pt(cone(.06,.5+(i%3)*.2,5),[0x4f9a3c,0xe0533f,0xf28bb0][i%3],[x+.1,.8,1.6+i*.8]));bk(x,3.6,.45,2.55)}
  {const x=-8.4,z=4.0;p.push(pt(cyl(.9,.95,.45,20),0x2c6a8c,[x,.22,z]),pt(new THREE.TorusGeometry(.84,.06,6,24),0x2c6a8c,[x,1.98,z],[Math.PI/2,0,0]));gw.push(pt(cyl(.8,.8,1.5,20),0x5fc4e0,[x,1.2,z]));gl.push(pt(cyl(.78,.78,.02,20),0xbff0fa,[x,1.97,z]));for(let i=0;i<6;i++)s4Fish(p,x+Math.cos(i)*.45,.8+(i%3)*.35,z+Math.sin(i)*.45,1.1,[0xff7a3d,0xf7c948,0x3f7fd0][i%3],i);bk(x,z,.95,.95)}
  if(GEO.lk_seat_bench){p.push(pt(GEO.lk_seat_bench,null,[-8.4,0,6.4]));bk(-8.4,6.4,.78,.3)}wlamp(-6.2,2.0,5.6,Math.PI/2);
  /* 냉동 창고: 냉동고 · 얼음 덩어리 · 매단 생선 · 생선 상자 */
  for(const x of[-10.0,-8.1]){Rb(1.6,.9,.85,0xeef3f6,[x,.45,-6.4]);B(1.62,.08,.87,0xcfd8de,[x,.92,-6.4]);B(.5,.06,.05,0x9aa3ab,[x,.7,-5.96]);bk(x,-6.4,.82,.45)}
  for(const [x,z,y] of[[-10.4,-3.6,0],[-10.4,-2.6,0],[-10.4,-3.1,.6],[-9.6,-3.4,0]]){Rb(.75,.6,.75,0xc9eef7,[x,y+.3,z],0,.05,.03)}bk(-10.1,-3.15,.75,.85);
  B(3.8,.08,.08,0x6f757c,[-8.6,2.35,-4.5]);for(let i=0;i<7;i++){const x=-10.3+i*.55;p.push(lkRod([x,2.35,-4.5],[x,1.95,-4.5],.01,0x9aa3ab),pt(new THREE.SphereGeometry(.16,10,6),[0x9fb7c8,0xff8a5a,0x6aa6c8][i%3],[x,1.55,-4.5],[0,0,0],[.5,1.7,.45]),pt(cone(.12,.25,4),[0x9fb7c8,0xff8a5a,0x6aa6c8][i%3],[x,1.12,-4.5],[Math.PI,0,0]))}
  for(const x of[-7.2,-6.6])crate(x,-1.4,.9,0xb98556);for(let i=0;i<14;i++)B(.4+hash(i,1,881)*.6,.01,.3+hash(i,2,881)*.4,0xf7fbfd,[-10.6+hash(i,3,881)*4.2,.005,-6.6+hash(i,4,881)*6.2]);
  /* 도구 공방: 작업대 · 낚싯대 벽걸이 · 그물 · 뒤집은 배 · 모터 · 부표·밧줄 */
  if(put('lk_bench',8.6,0,-6.35))bk(8.6,-6.35,1.3,.62);
  {const x=10.7;Rb(.2,2.2,4.8,0x8a5a36,[x+.1,1.1,-1.6]);for(let i=0;i<10;i++)p.push(lkRod([x-.05,.12,-3.7+i*.46],[x-.12,2.1,-3.75+i*.46],.022,[0x2c3346,0x3d6fa0,0xe0533f,0x5bae5f,0x2c3346][i%5]));bk(x,-1.6,.3,2.45)}
  if(GEO.pnet){p.push(pt(GEO.pnet,null,[7.6,0,-3.6],[0,Math.PI/2,0]));bk(7.6,-3.6,.2,1.4)}
  if(GEO.rowboat){for(const z of[1.0,2.8])B(1.4,.7,.12,0x6b4426,[8.6,.35,z]);p.push(pt(GEO.rowboat,null,[8.6,1.3,1.9],[Math.PI,0,0]));bk(8.6,1.9,.85,1.75)}
  if(GEO.lk_boat2_motor){B(.5,.6,.5,0x5a616a,[10.3,.3,5.4]);put('lk_boat2_motor',10.3,.6,5.4,0,1.6);bk(10.3,5.4,.3,.3)}
  for(let i=0;i<5;i++)p.push(pt(new THREE.SphereGeometry(.22,10,8),[0xff7a3d,0xf7f4ec,0x3a8fc4][i%3],[7.0+(i%3)*.45,.22+(i>2?.36:0),5.9+(i%2)*.3]));bk(7.4,6.0,.75,.5);
  p.push(pt(new THREE.TorusGeometry(.4,.09,6,16),0xd9c49a,[9.0,.09,5.6],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(.28,.08,6,14),0xd9c49a,[9.0,.2,5.6],[Math.PI/2,0,0]));wlamp(6.25,2.0,-1.6,Math.PI/2)}
 if(k==='plant'){
  /* 큰 방: 가운데 둥근 화단 나무 · 계단식 꽃 진열대 둘 · 걸이 화분 */
  {const x=0,z=.3;p.push(pt(cyl(1.3,1.4,.55,20),0xd8cdb6,[x,.28,z]),pt(cyl(1.18,1.18,.06,20),0x6e4a30,[x,.55,z]));for(let i=0;i<5;i++)p.push(pt(cyl(.07,.1,1.5,8),0x7a5a3a,[x,1.2,z]));p.push(pt(new THREE.IcosahedronGeometry(1.0,1),0x5f9a3c,[x,2.25,z]),pt(new THREE.IcosahedronGeometry(.7,1),0x6ea844,[x+.5,2.5,z+.2]),pt(new THREE.IcosahedronGeometry(.6,1),0x4f8a3c,[x-.5,2.55,z-.2]));
   for(let i=0;i<10;i++){const a=i/10*6.28;p.push(pt(new THREE.IcosahedronGeometry(.1,0),[0xff6b6b,0xffd35c,0xf28bb0,0xffffff][i%4],[x+Math.cos(a)*.9,.68,z+Math.sin(a)*.9]))}bk(x,z,1.4,1.4)}
  for(const sx of[-1,1]){const x=sx*4.1,z=5.5;for(let r=0;r<3;r++){Rb(1.9-r*.4,.08,1.0-r*.25,0x9c6a3d,[x,.35+r*.45,z-r*.12]);for(let i=0;i<4-r;i++){const xx=x-.6+r*.2+i*.42;p.push(pt(cyl(.13,.1,.2,10),0xc77a52,[xx,.49+r*.45,z-r*.12]));const fk=['pw_flower_yellow','pw_poppy','pw_flower_blue','pw_flower_black'][(i+r+(sx>0?1:0))%4];if(!put(fk,xx,.58+r*.45,z-r*.12,i,.55))p.push(pt(new THREE.IcosahedronGeometry(.16,0),0x5f9a3c,[xx,.7+r*.45,z-r*.12]))}}
   for(const a of[-1,1])B(.06,1.3,.06,0x6f4a2c,[x+a*.9,.65,z+.4]);bk(x,z,1.0,.55)}
  for(const [x,z] of[[-3.2,-1.6],[3.0,1.6],[-2.6,5.4]]){B(.012,1.0,.012,0x3a3f4a,[x,WH-.5,z]);p.push(pt(cyl(.26,.17,.26,10),0x9c6a3d,[x,WH-1.12,z]),pt(new THREE.IcosahedronGeometry(.32,1),0x5f9a3c,[x,WH-.95,z]));for(let j=0;j<4;j++)p.push(pt(cone(.03,.5,4),0x4f8a3c,[x+Math.cos(j*1.6)*.2,WH-1.4,z+Math.sin(j*1.6)*.2],[Math.PI,0,0]))}
  /* 열대 온실: 야자수 둘 · 연못(연잎) · 바나나 잎 · 디딤돌 · 벤치 */
  const palm=(x,z,h)=>{for(let k=0;k<Math.round(h/.55);k++)p.push(pt(cyl(.17-k*.01,.2-k*.01,.58,9),k%2?0x8a6a44:0x7a5a3a,[x+Math.sin(k*.35)*.2,.3+k*.55,z]));for(let k=0;k<8;k++){const a=k/8*Math.PI*2,g=mg([pt(box(1.7,.04,.36),k%2?0x4f9a3c:0x5fae4a,[.85,0,0])]);g.rotateZ(-.42-(k%3)*.12);g.rotateY(a);g.translate(x+.25,h+.2,z);p.push(pt(g,null))}bk(x,z,.3,.3)};
  palm(-10.6,-6.2,3.6);palm(-7.4,5.8,3.2);palm(-11.0,4.4,2.6);
  {const x=-9.2,z=-1.2;p.push(pt(cyl(1.9,1.9,.04,24),0x4a9ec4,[x,.03,z],[0,0,0],[1,1,.82]));for(let i=0;i<16;i++){const a=i/16*Math.PI*2;p.push(pt(new THREE.IcosahedronGeometry(.28+hash(i,1,883)*.12,0),[0x9aa1a8,0x8a8f96,0xb3a58c][i%3],[x+Math.cos(a)*2.0,.12,z+Math.sin(a)*1.64]))}
   for(let i=0;i<6;i++){const a=i*1.1;p.push(pt(cyl(.26,.26,.02,10,1,false,0,5.5),0x5f9a3c,[x+Math.cos(a)*1.0,.06,z+Math.sin(a)*.7]));if(i%2)p.push(pt(new THREE.IcosahedronGeometry(.08,0),0xf7b6c8,[x+Math.cos(a)*1.0,.12,z+Math.sin(a)*.7]))}bk(x,z,2.1,1.75)}
  for(const [x,z] of[[-7.0,-5.4],[-11.2,1.4],[-6.8,1.8]]){for(let k=0;k<5;k++){const a=k*1.25,g=mg([pt(box(1.1,.03,.42),[0x5fae4a,0x6ea844][k%2],[.55,0,0])]);g.rotateZ(-.7-(k%2)*.2);g.rotateY(a);g.translate(x,1.0,z);p.push(pt(g,null))}p.push(pt(cyl(.07,.1,1.0,8),0x6e9a4a,[x,.5,z]));bk(x,z,.3,.3)}
  for(let i=0;i<7;i++)p.push(pt(cyl(.32,.34,.05,9),0xb7ab95,[-6.9-i*.62,.03,3.0+Math.sin(i)*.4]));if(GEO.lk_seat_bench){p.push(pt(GEO.lk_seat_bench,null,[-9.2,0,1.6]));bk(-9.2,1.6,.78,.3)}
  for(let i=0;i<14;i++)p.push(pt(new THREE.IcosahedronGeometry(.12,0),[0xff6b6b,0xffd35c,0xf28bb0,0xb38cff][i%4],[-11.5+hash(i,5,883)*5.2,.12,-7+hash(i,6,883)*14]));wlamp(-6.2,2.0,-3.6,Math.PI/2);
  /* 분갈이실: 분갈이 탁자 · 모종 탁자 · 흙 포대 · 물뿌리개 · 외바퀴 수레 */
  {const x=11.4,z=3.6;Rb(.9,.9,3.2,0x8a5a36,[x,.45,z]);B(.8,.08,3.1,0x6e4a30,[x,.92,z]);for(let i=0;i<5;i++){const zz=z-1.3+i*.65;p.push(pt(cyl(.14,.1,.22,10),0xc77a52,[x-.1,1.06,zz]),pt(new THREE.IcosahedronGeometry(.14,0),[0x5f9a3c,0x6ea844][i%2],[x-.1,1.24,zz]))}p.push(lkRod([x-.2,.98,z+1.5],[x-.4,1.06,z+1.2],.02,0x9aa3ab));bk(x,z,.5,1.65)}
  {const x=8.6,z=4.2;Rb(2.6,.8,1.1,0x9c6a3d,[x,.4,z]);for(let i=0;i<6;i++)for(let j=0;j<2;j++){const xx=x-1.05+i*.42,zz=z-.25+j*.5;p.push(pt(box(.36,.1,.4),0x6e4a30,[xx,.86,zz]),pt(cone(.08,.22,5),0x6ea844,[xx,1.02,zz]))}bk(x,z,1.35,.6)}
  for(const [x,z] of[[7.0,6.6],[7.6,6.7],[7.3,6.2]])Rb(.5,.62,.36,0xcdb588,[x,.31,z],[0,x,0],.14,.08);bk(7.3,6.5,.55,.45);for(const [x,z] of[[10.6,6.6],[11.1,6.2]])p.push(pt(cyl(.18,.22,.3,12),0x6aa6c8,[x,.15,z]),pt(cyl(.025,.035,.4,6),0x6aa6c8,[x+.24,.3,z],[0,0,-.9]));
  {const x=10.7,z=.95;Rb(.8,.36,1.1,0x3f7fd0,[x,.5,z]);B(.66,.06,1.0,0x6e4a30,[x,.68,z]);p.push(pt(cyl(.2,.2,.08,14),0x2c2f33,[x,.22,z+.7],[0,0,Math.PI/2]));bk(x,z,.45,.8)}wlamp(11.75,2.0,1.6,-Math.PI/2);
  /* 씨앗 창고: 씨앗 서랍장 · 포대 · 씨앗 봉투 진열대 · 상자 */
  {const x=9.0,z=-7.1;Rb(4.4,2.2,.6,0x8a5a36,[x,1.1,z]);for(let i=0;i<8;i++)for(let j=0;j<5;j++){const xx=x-1.9+i*.54,yy=.3+j*.42;Rb(.48,.36,.04,0xb98556,[xx,yy,z+.31],0,.02,.01);B(.2,.06,.02,[0xe0533f,0xf7c948,0x5bae5f,0x3f7fd0,0x8b5cc9][(i+j)%5],[xx,yy+.06,z+.335]);B(.12,.03,.03,0x3a3f4a,[xx,yy-.08,z+.34])}bk(x,z,2.25,.35)}
  for(const [x,z,y] of[[11.3,-4.4,0],[11.3,-3.6,0],[11.3,-4.0,.5],[10.6,-4.3,0]])Rb(.6,.55,.5,0xd9c49a,[x,y+.28,z],[0,.3,0],.14,.08);bk(11.0,-4.0,.65,.65);
  {const x=7.3,z=-3.6;Rb(.9,1.6,.4,0x6f4a2c,[x,.8,z]);let i=0;for(const sk of['lk_seed_potato','lk_seed_wheat','lk_seed_grape','lk_seed_strawberry','lk_seed_flower_blue','lk_seed_poppy']){put(sk,x-.25+(i%2)*.5,.35+Math.floor(i/2)*.48,z+.22,0,.8);i++}bk(x,z,.5,.25)}
  crate(8.3,-2.0,.9);crate(7.6,-1.6,.7,0xa67848);wlamp(6.25,2.0,-4.0,Math.PI/2)}
 if(k==='cook'){
  /* 식당(큰 방): 둥근 식탁 넷(의자·요리) · 식탁 위 등 · 메뉴 칠판 · 화분 */
  for(const [x,z] of[[-3.6,1.2],[3.6,1.2],[-3.6,4.4],[3.6,4.4]]){put('dc_table_wround',x,0,z,0,1.05);for(const a of[.4,2.5,4.6])put('lk_chair',x+Math.sin(a)*.95,0,z+Math.cos(a)*.95,a+Math.PI);put(['ds_dish_salad','ds_dish_steak','ds_dish_taco','ds_dish_shortcake'][(x>0?1:0)+(z>2?2:0)],x,.8,z,0,.5);bk(x,z,1.15,1.15);lamp(x,z)}
  B(1.6,1.0,.06,0x6b4426,[-.3,2.75,-D+.12]);B(1.44,.84,.07,0x2f3b33,[-.3,2.75,-D+.13]);for(let i=0;i<4;i++)B(.9-(i%2)*.3,.03,.01,[0xf4efe4,0xffd35c][i%2],[-.3,3.0-i*.16,-D+.17]);
  pot(-5.3,6.3,.85);pot(5.3,6.3,.85);rug(0,5.9,2.0,1.2,0xe0533f,0xf7f0e3);
  /* 주방: 화덕·오븐 줄 + 후드 · 큰 솥 · 가운데 손질대(채소) · 냉장고 · 개수대 · 냄비 걸이 */
  {const x=-9.1,z=-6.45;Rb(4.2,.92,.9,0x9aa1a8,[x,.46,z]);B(4.25,.06,.95,0x6f757c,[x,.95,z]);for(let i=0;i<3;i++){const xx=x-1.4+i*1.4;for(const a of[-.25,.25])p.push(pt(cyl(.14,.14,.03,14),0x1f2226,[xx+a,1.0,z]));Rb(1.1,.5,.04,0x2c2f33,[xx,.45,z+.46]);gl.push(pt(box(.8,.18,.02),0xff8a3d,[xx,.45,z+.49]))}
   p.push(pt(cyl(.2,.22,.3,14),0xb9c0c9,[x-1.4,1.17,z]),pt(cyl(.25,.25,.18,14),0x4a4f55,[x,1.1,z]));Rb(4.0,.5,.9,0xb9c0c9,[x,2.6,z+.05]);B(.5,.9,.5,0xb9c0c9,[x,3.1,z-.15]);bk(x,z,2.15,.5)}
  if(put('ot_pot',-10.3,0,-2.6,0,.85))bk(-10.3,-2.6,.85,.85);
  {const x=-8.6,z=1.4;Rb(2.6,.92,1.1,0xf4efe4,[x,.46,z]);B(2.7,.07,1.2,0x8a5a36,[x,.95,z]);for(let i=0;i<9;i++){const c=[0xe0533f,0x7fbf5a,0xf28c38,0xf7d43a][i%4];p.push(pt(new THREE.IcosahedronGeometry(.1,1),c,[x-1.0+i*.25,1.05,z+(i%2?.25:-.2)]))}Rb(.8,.06,.5,0xc79a66,[x+.8,1.02,z]);
   B(2.8,.06,.06,0x3a3f4a,[x,2.5,z]);for(let i=0;i<5;i++){p.push(pt(cyl(.01,.01,.25,4),0x3a3f4a,[x-1.0+i*.5,2.35,z]));if(i%2)p.push(pt(cyl(.2,.2,.04,14),0x2c2f33,[x-1.0+i*.5,2.05,z],[Math.PI/2,0,0]));else B(.06,.45,.08,0x9aa3ab,[x-1.0+i*.5,2.0,z])}bk(x,z,1.38,.62)}
  if(put('d82_fridge',-11.0,0,4.4,Math.PI/2,1.25))bk(-11.0,4.4,.5,.5);
  {const x=-11.05,z=2.0;Rb(.8,.92,2.0,0xf4efe4,[x,.46,z]);B(.6,.08,.8,0x9aa3ab,[x,.93,z+.3]);p.push(lkRod([x-.2,.95,z+.3],[x+.1,1.3,z+.3],.025,0x9aa3ab));bk(x,z,.45,1.05)}
  for(const y of[1.7,2.4]){B(.3,.05,3.0,0x8a5a36,[-11.3,y,-1.0]);for(let i=0;i<8;i++)p.push(pt(cyl(.07,.07,.2,10),[0xe8c35a,0xc8643c,0x7fbf5a,0xf4efe4][(i+((y*2)|0))%4],[-11.3,y+.13,-2.3+i*.37]))}wlamp(-6.25,2.0,-3.6,Math.PI/2);
  /* 디저트 코너: 케이크 진열장 · 커피 머신 · 작은 식탁 둘 */
  {const x=10.95,z=3.6;Rb(.9,.95,3.0,0xf7d6dc,[x,.48,z]);gw.push(pt(box(.8,.5,2.9),0xeefaff,[x,1.2,z]));B(.92,.05,3.02,0xe8b4c0,[x,1.47,z]);let i=0;for(const d of['ds_dish_shortcake','ds_dish_brownie','ds_dish_grapetart','ds_dish_festcake','ds_dish_avomousse']){put(d,x,1.0,z-1.2+i*.6,0,.55);i++}bk(x,z,.5,1.55)}
  if(put('d82_coffee',10.9,0,6.2,-Math.PI/2))bk(10.9,6.2,.4,.4);
  for(const [x,z] of[[7.8,4.6],[8.6,6.3]]){put('dc_table_wround',x,0,z,0,.9);for(const a of[1.2,4.2])put('dc_stool_wood',x+Math.sin(a)*.75,0,z+Math.cos(a)*.75);put('ds_dish_hotchoc',x,.72,z,0,.45);bk(x,z,.95,.95)}
  for(let i=0;i<10;i++)gl.push(pt(new THREE.SphereGeometry(.05,6,4),[0xffd36a,0xf28bb0,0x9ad8ff][i%3],[6.2+i*.53,2.35-Math.sin(i/9*Math.PI)*.25,6.9]));
  /* 식료품 창고: 병 선반 · 밀가루 포대 · 통 · 채소 상자 · 매단 소시지·마늘 */
  shelf(8.75,-6.7,4.6,2.2,3,0x8a5a36,(x,y,z,i,j)=>p.push(pt(cyl(.09,.09,.24,10),[0xe8c35a,0xc8643c,0x7fbf5a,0xf4efe4,0x8b5cc9][(i+j)%5],[x,y+.12,z]),pt(cyl(.07,.07,.04,10),0x9aa3ab,[x,y+.26,z])),.5);
  for(const [x,z,y] of[[10.9,-3.4,0],[10.9,-2.6,0],[10.9,-3.0,.5],[10.2,-3.2,0]])Rb(.62,.58,.5,0xefe6d2,[x,y+.29,z],[0,.2,0],.15,.08);bk(10.6,-3.0,.7,.7);
  barrel(6.9,-3.8);barrel(6.9,-2.9,0x7d5232);if(put('ot_vegcrates',8.0,0,-4.4,0,.9))bk(8.0,-4.4,.95,.4);
  B(3.6,.06,.06,0x6f4a2c,[8.75,2.3,-1.4]);for(let i=0;i<8;i++)for(let j=0;j<3;j++)p.push(pt(new THREE.SphereGeometry(.07,8,6),i%2?0xa8553f:0xf4efe4,[7.2+i*.44,2.15-j*.15,-1.4],[0,0,0],i%2?[.8,1.5,.8]:[1,1,1]));wlamp(6.25,2.0,-3.6,Math.PI/2)}
 if(k==='hunt'){
  /* 큰 방: 곰 가죽 깔개 · 뿔 샹들리에 · 덫·칼 진열대 · 화살 통 */
  {const g=s4Shape([[-1.1,-.8],[-.5,-1.2],[0,-.95],[.5,-1.2],[1.1,-.8],[1.3,-.1],[1.8,.2],[1.2,.5],[.6,1.1],[0,.9],[-.6,1.1],[-1.2,.5],[-1.8,.2],[-1.3,-.1]],.03);g.rotateX(-Math.PI/2);p.push(pt(g,0x5b3a22,[0,.03,1.6]));p.push(pt(new THREE.SphereGeometry(.32,10,8),0x5b3a22,[0,.12,2.8],[0,0,0],[1,.5,1.2]))}
  {const y=2.6;p.push(pt(new THREE.TorusGeometry(.9,.08,6,20),0x6b4426,[0,y,-.8],[Math.PI/2,0,0]));B(.03,WH-y,.03,0x2c2f33,[0,(WH+y)/2,-.8]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*.9,z=-.8+Math.sin(a)*.9;p.push(lkRod([x,y,z],[x*1.25,y+.45,-.8+(z+.8)*1.25],.035,0xefe3c8),pt(cyl(.04,.04,.14,6),0xf4efe4,[x,y+.1,z]));gl.push(pt(new THREE.SphereGeometry(.05,6,4),0xffc46a,[x,y+.22,z]))}}
  {const x=-3.4,z=2.4;Rb(2.0,.85,1.0,0x6b4426,[x,.43,z]);Rb(2.1,.06,1.1,0x4a2e1c,[x,.88,z]);for(let i=0;i<3;i++){p.push(pt(new THREE.TorusGeometry(.18,.03,6,12),0x9aa3ab,[x-.6+i*.6,.93,z-.15],[Math.PI/2,0,0]));B(.4,.03,.06,0x9aa3ab,[x-.6+i*.6,.93,z+.25])}bk(x,z,1.08,.58)}
  for(const x of[3.2,4.0]){barrel(x,2.6,0x6b4024);for(let i=0;i<5;i++)p.push(lkRod([x-.12+i*.06,.6,2.6],[x-.15+i*.07,1.5,2.6+(i%2?.06:-.06)],.015,0x8a6a44))}
  /* 벽난로 쉼터: 벽난로(불) · 소파 · 안락의자 · 낮은 탁자 · 책장 · 사슴 머리 */
  {const x=-11.15,z=3.4;if(put('lk_fireplace',x+.25,0,z,Math.PI/2,1.35)){gl.push(pt(box(.02,.5,.9),0xff8a3d,[x+.8,.45,z]));bk(x+.35,z,.6,1.35)}}
  if(put('lk_sofa',-8.2,0,3.4,-Math.PI/2,1.1))bk(-8.2,3.4,.5,1.15);if(put('d82_armchair',-9.6,0,5.9,Math.PI*.85))bk(-9.6,5.9,.5,.5);
  rug(-9.6,3.4,2.0,2.6,0x8a3a30,0xe8c35a);{Rb(.9,.4,1.2,0x6b4426,[-9.5,.2,3.4]);bk(-9.5,3.4,.5,.65)}if(put('d82_bookshelf',-10.5,0,.45))bk(-10.5,.45,.7,.25);
  {const x=-11.35,y=2.6,z=5.6;p.push(pt(cyl(.3,.3,.06,14),0x6b4426,[x,y,z],[0,0,Math.PI/2]),pt(new THREE.SphereGeometry(.2,10,8),0x8a5a36,[x+.15,y-.05,z],[0,0,0],[.8,1.1,1]));for(const s of[-1,1])p.push(lkRod([x+.1,y+.1,z+s*.1],[x+.15,y+.55,z+s*.45],.03,0xefe3c8))}wlamp(-6.25,2.0,5.6,Math.PI/2);
  /* 가죽 작업실: 가죽 틀 둘 · 손질대 · 고기 건조대 · 무두질 통 · 연장 */
  for(const x of[-10.2,-8.2])if(put('ot_hideframe',x,0,-6.6))bk(x,-6.6,.78,.25);
  {const x=-8.8,z=-3.6;Rb(2.2,.85,1.0,0x8a5a36,[x,.43,z]);B(2.3,.07,1.1,0x6b4426,[x,.88,z]);const pel=s4Shape([[-.5,-.4],[0,-.5],[.5,-.4],[.6,.1],[.35,.45],[-.35,.45],[-.6,.1]],.03);p.push(pt(pel,0xb98556,[x-.2,.93,z],[-Math.PI/2,0,.3]));B(.4,.03,.08,0x9aa3ab,[x+.7,.93,z+.2]);bk(x,z,1.18,.58)}
  if(put('ot_meatrack',-11.2,0,-3.0,Math.PI/2))bk(-11.2,-3.0,.2,1.4);barrel(-6.9,-5.6,0x6b4024);p.push(pt(cyl(.34,.34,.02,12),0x8a6a44,[-6.9,.95,-5.6]));wlamp(-6.25,2.0,-3.6,Math.PI/2);
  /* 무기고: 총 걸이(뒤 벽·오른쪽 벽) · 키트 진열대 · 탄약 상자 · 과녁 · 석궁 */
  {const x=8.75,z=-6.75;Rb(4.6,2.3,.36,0x5b3a22,[x,1.15,z]);for(const y of[.5,1.25,2.0])B(4.5,.06,.3,0x4a2e1c,[x,y,z+.1]);let i=0;for(const gk of['gn_ar','gn_burst','gn_rifle','gn_sniper','gn_shotgun','gn_smg']){if(GEO[gk])p.push(pt(GEO[gk],null,[x-1.9+i*.76,1.15,z+.25],[-Math.PI/2,0,0],[1,1,1]));i++}bk(x,z,2.35,.3)}
  {const x=11.2,z=-1.0;Rb(.36,2.0,4.0,0x5b3a22,[x,1.0,z]);for(let i=0;i<6;i++)p.push(lkRod([x-.2,.3,z-1.7+i*.68],[x-.25,1.9,z-1.6+i*.68],.03,[0x6b4426,0x2c2f33][i%2]),pt(new THREE.TorusGeometry(.5,.025,5,14,Math.PI*.9),0x8a5a36,[x-.25,1.1,z-1.5+i*.68],[0,Math.PI/2,Math.PI*.05+Math.PI/2]));bk(x,z,.3,2.05)}
  {const x=8.6,z=-.4;Rb(2.4,.85,1.1,0x6b4426,[x,.43,z]);B(2.5,.06,1.2,0x4a2e1c,[x,.88,z]);let i=0;for(const gk of['lk_gkit_pistol','lk_gkit_rifle','lk_gkit_shotgun']){put(gk,x-.8+i*.8,.91,z,0,.8);i++}bk(x,z,1.28,.62)}
  for(const [x,z,y] of[[7.0,4.6,0],[7.0,5.5,0],[7.0,5.05,.8]])put('supcrate',x,y,z,0,.85);bk(7.0,5.05,.5,.95);
  if(put('ot_target',10.6,0,5.4,-Math.PI/2))bk(10.6,5.4,.5,.5);put('lk_crossbow',11.3,1.6,2.6,Math.PI/2);wlamp(6.25,2.0,-1.6,Math.PI/2)}
 const M=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true}));M.receiveShadow=true;H.add(M);if(gl.length)H.add(new THREE.Mesh(mg(gl),new THREE.MeshBasicMaterial({vertexColors:true})));
 if(gw.length){const m=new THREE.Mesh(mg(gw),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.45,depthWrite:false}));m.renderOrder=2;H.add(m)}
 for(const [t,x,y,z] of signs){const m=sh84Text(t,1.8,.3,Math.min(92,Math.floor(700/(t.length*.95))),'#5b3d2b');m.position.set(x,y,z);H.add(m)}
 intDoor(H,D+CL);SH84[k].blk=blk;return H}

/* ========== 모양 만들기 · 놓기 ========== */
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();try{for(const c of['r','b','g'])pv84Geo(c);
  if(typeof lkAOnew==='function'){const b0=Object.assign({},GEO);for(const c of['r','b','g'])delete b0['pv84_'+c];lkAOnew(b0)}
  sh84FishGeo();sh84PlantGeo();sh84CookGeo();sh84HuntGeo()}catch(e){console.error('84·85차 가게 모양',e)}}}   /* 85차: 가게는 넓은 묶음이라 lkAO(구운 그늘)를 안 써요 */
/* 간판 글자(색을 고를 수 있게) */
function sh84Text(txt,w,h,px,col){const cv=document.createElement('canvas');cv.width=768;cv.height=128;const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;
 const draw=()=>{const x=cv.getContext('2d');x.clearRect(0,0,768,128);x.font=`900 ${px}px `+(typeof UIF!=='undefined'?UIF:'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.28)';x.fillText(txt,386,70);x.fillStyle=col;x.fillText(txt,384,66);tx.needsUpdate=true};
 draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}
let SH84GM=null;const SH84TC={fish:'#fff6e0',plant:'#ffffff',cook:'#ffffff',hunt:'#4a2e1c'};
/* 놓기: 마당이 땅 위에 오게 살짝 올리고(yo), 건물·소품 자리는 총알·적용 막이도 둬요 */
function sh84Put(k,x,z){const q=SH84[k],r=q.r||0,c=Math.cos(r),sn=Math.sin(r),L=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];q.x=x;q.z=z;q.L=L;
 let mx=-9;const L0=q.lots[0];for(let a=L0[0];a<=L0[1]+1e-6;a+=.8)for(let b=L0[2];b<=L0[3]+1e-6;b+=.8){const [wx,wz]=L(a,b);mx=Math.max(mx,hAt(wx,wz))}
 const g0=hAt(x,z);q.yo=Math.max(0,mx-g0-q.LY+.04);
 for(const Lr of q.lots){const [cx,cz]=L((Lr[0]+Lr[1])/2,(Lr[2]+Lr[3])/2);CLEARS.push([cx,cz,Math.hypot(Lr[1]-Lr[0],Lr[3]-Lr[2])/2+1.6])}
 q.s=addStruct({t:'sh84_'+k,x,z,r,yo:q.yo,hp:1e9,sk:k});
 for(const w of q.walls)if(w[2]*w[3]>.2)sh84Solid(L,r,w[0],w[1],w[2],w[3],k);
 const [dx,dz]=L(q.dp[0],q.dp[1]+.32);q.door=addStruct({t:'sh84_door',x:dx,z:dz,r,hp:1e9,sk:k,hk:q.hk});
 sh84Inside(k);return q.s}
/* 안의 구조물: 계산대(말 걸기) · 랜덤 자판기 · 재활용 쓰레기통 · 일반 자판기 셋 — 가운데 방 뒤 벽 앞에 나란히 */
function sh84Inside(k){const q=SH84[k],C=SH85IN[k],D=C.hd,R=C.row;
 const I=(t,lx,lz,ex)=>{const x=INT.x+lx,z=INT.z+lz,s=addStruct(Object.assign({t,x,z,r:0,in:1,hk:q.hk,hp:1e9,yo:INT.y-hAt(x,z)+.04},ex||{}));if(s&&s.m)s.m.visible=false;return s};
 q.ctr=I('sh84_ctr',C.ctr[0],C.ctr[1],{sk:k});q.vs=[I('vend',R[0],-D+.12+DECO.vend.bz,{pi:q.pi}),I('recycle',R[1],-D+.12+DECO.recycle.bz,{pi:q.pi})];
 ['r','b','g'].forEach((c,i)=>q.vs.push(I('pv84'+c,R[2+i],-D+.12+DECO['pv84'+c].bz,{pi:q.pi,col:c})))}
{const _as=addStruct;addStruct=function(s){const r=_as(s);try{const k=r&&SH84K[r.t];if(k&&r.m){const q=SH84[k],host=r.m.children[0]||r.m;
   if(GEO['sh84_'+k+'_glow']&&typeof HGLOW!=='undefined')host.add(mesh(GEO['sh84_'+k+'_glow'],HGLOW,false));
   if(k==='plant'&&GEO.sh84_plant_glass){const gm=mesh(GEO.sh84_plant_glass,SH84GM||(SH84GM=new THREE.MeshLambertMaterial({color:0xa9e0d2,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide})),false);gm.renderOrder=2;host.add(gm)}
   if(q.sign){const t=sh84Text(q.sign.t,q.sign.w,q.sign.h,q.sign.px,SH84TC[k]);t.position.set(...q.sign.pos);host.add(t)}
   if(typeof PLAMPS!=='undefined')for(const [x,y,z] of q.lamps||[]){const l=glow(0xffc46a,2.4,.5);l.position.set(x,y,z);l.visible=false;r.m.add(l);PLAMPS.push(l)}
   if(q.chim&&typeof glowTex!=='undefined'){const SM=new THREE.SpriteMaterial({map:glowTex,color:0xd8dde3,transparent:true,opacity:.5,depthWrite:false});q.smoke=[];for(let i=0;i<7;i++){const sp=new THREE.Sprite(SM.clone());sp.userData.t=i/7;r.m.add(sp);q.smoke.push(sp)}}}
  if(r&&/^pv84/.test(r.t)&&r.m&&GEO.pv79_glow&&typeof HGLOW!=='undefined')(r.m.children[0]||r.m).add(mesh(GEO.pv79_glow,HGLOW,false))}catch(e){console.error(e)}return r}}

/* ========== 예전 꾸밈 없애고 가게 놓기 ========== */
/* 낚시섬: 철조망·문은 그대로 → 서쪽 바닷가에 낚시 가게(데크·잔교) */
plFishCamp=function(){const F=FCAMP,OX=FISHISLE.x,OZ=FISHISLE.z,W=(x,z)=>[OX+x,OZ+z],bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x:OX+x,z:OZ+z,r,hp:1e9}),gh=(x,z)=>hAt(OX+x,OZ+z);
 const [gx,gz]=F.gate;CLEARS.push([OX-3,OZ-7,27]);
 const A=[[-24.5,10.2],[-18,11.0],[-11,11.8],[-5,12.3],[gx-1.35,gz]].map(q=>W(q[0],q[1])),B=[[gx+1.35,gz],[5,12.2],[10.5,11.2],[15,8.4],[17.8,3.5],[18.6,-3.5],[17.8,-10.5],[15.4,-16.5],[12.2,-21.5],[11.4,-25.5],[11.6,-29.5]].map(q=>W(q[0],q[1]));
 const gskip=(x,z)=>Math.abs(x-OX-gx)<1.95&&Math.abs(z-OZ-gz)<.8;
 {const g=mg(plFenceGeo(A,1,gskip).concat(plFenceGeo(B,1,gskip)));lkSmooth(g,50);plAdd(g,0,0,0)}
 {const g=addStruct({t:'cgate',x:OX+gx,z:OZ+gz,r:0});g.open=false;g.ot=0;const t=plSignText('🎣 낚시섬');t.position.set(0,2.78,.13);if(g.m)g.m.add(t)}
 sh84Put('fish',OX+SH84P.fish[0],OZ+SH84P.fish[1]);if(GEO.rowboat){const w=SH84.fish.L(-18.2,6.0);plAdd(GEO.rowboat,w[0],-.28,w[1],Math.PI/2+.06)}   /* 잔교 옆 물에 매어 둔 배 */
 if(GEO.tree_single_A){const v=[];for(const [x,z,s,r,k] of [[15.4,-13.4,2.6,.4,'tree_single_A'],[13.8,7.2,2.2,2.1,'tree_single_A'],[9.6,-4.0,2.4,1.3,'tree_single_B']]){if(GEO[k])v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,r,0],[s,s,s]));bl(x,z,.3,.3)}plAdd(mg(v),OX,0,OZ)}};
/* 식물섬: 바위 언덕 벽·문은 그대로(81차) → 식물 가게(돌 마당) */
plPlantIsle=function(){if(typeof lkModel!=='function')return;const C=piCols(),R=pis81Ridge(C);piCliffWalls(C);pis81RidgeDeco(C,R);
 let rMax=0;for(const c of C)rMax=Math.max(rMax,Math.hypot(c.ox-PIS.x,c.oz-PIS.z));PIS.nr=Math.ceil(rMax+2.5);CLEARS.push([PIS.x,PIS.z,PIS.nr+2]);
 piGateModel();{const gz=PIS.gzo-.45,g=addStruct({t:'pgate',x:PIS.gx,z:gz,r:0});g.open=false;g.ot=0;const t=plSignText('🌱 식물섬',1.6,.34,70);t.position.set(0,2.1,.31);if(g.m)g.m.add(t)}
 PIS.plaza=[SH84P.plant[0],SH84P.plant[1]+11];PIS.stall=null;PIS81.list=[{k:'shop',x:SH84P.plant[0],z:SH84P.plant[1]+2.5,bx:8.7,bz:6.8}];
 sh84Put('plant',SH84P.plant[0],SH84P.plant[1])};
/* 수달섬: 다리·철조망·문은 그대로 → 광장을 사이에 두고 마주 보는 요리 가게 · 사냥꾼 상점 */
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
 /* 섬 가장자리 나무 몇 그루(길·가게 마당에서 떨어진 곳) */
 const F=OTB.fence,inF=(x,z,m)=>{if(gh(x,z)<.97)return false;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;const ddx=q[0]-a[0],ddz=q[1]-a[1],t=clamp(((x-a[0])*ddx+(z-a[1])*ddz)/(ddx*ddx+ddz*ddz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-ddx*t,z-a[1]-ddz*t))}return c&&d>m};
 const v=[];SH84T.n=0;for(const [x,z] of SH84P.trees){const k=hash(x|0,z|0,84)>.5?'tree_single_A':'tree_single_B';if(!GEO[k]||!inF(x,z,2.4)||otWorn(x,z)>.05||sh85Near(x,z,2.6)||structs.some(s=>Math.abs(s.x-x)<9&&Math.abs(s.z-z)<9&&inStruct(s,x,z,2.2)))continue;SH84T.n++;const sc=3.4+hash(z|0,x|0,85)*.6;v.push(pt(GEO[k],null,[x,gh(x,z)-.05,z],[0,hash(x|0,z|0,86)*6,0],[sc,sc,sc]));bl(x,z,.42,.42)}if(v.length)plAdd(mg(v),0,0,0)};
is82Otter=function(){};is82Fish=function(){};vs81Place=function(){};   /* 82차 바깥 꾸밈·81차 바깥 자판기 묶음은 없앰(자판기는 가게 안으로) */
/* 가게 마당(돌린 사각형) 안이나 m 안쪽인가 */
function sh85Near(x,z,m=0){for(const k in SH84){const q=SH84[k];if(q.x==null)continue;const r=q.r||0,dx=x-q.x,dz=z-q.z,c=Math.cos(r),sn=Math.sin(r),lx=dx*c-dz*sn,lz=dx*sn+dz*c;for(const L of q.lots)if(lx>L[0]-m&&lx<L[1]+m&&lz>L[2]-m&&lz<L[3]+m)return k}return null}
/* 자리(세상 좌표; 낚시는 캠프 기준 지역 좌표) · 흙길 */
const SH84P={fish:[-6.6,-8.6],plant:[89.2,657.6],cook:[249.2,777],hunt:[278.6,777],trees:[[241,765],[247,761],[253,759],[237,786],[241,796],[247,804],[256,806],[264,804],[271,799],[286,786],[289,768],[262,766]]};
const SH84W={fish:[[-1,12.4],[-2.4,8.6],[-4.6,4.4],[-6.2,1.6],[-6.6,.3]],
 plant:[[[85,701],[85.6,696],[85,690.5],[85,684],[86.6,677],[88.6,671.5],[89.2,667.4]]],
 otter:[[[291.6,756.4],[285.4,761.6],[277.6,766.6],[270.6,771.6],[265.6,777.6],[264.2,783.6]],[[264.2,783.6],[260.2,785.6],[255.6,785.2]],[[264.2,783.6],[268.6,786.2],[274.4,786.2]]]};
plWorn=function(fx,fz){if(fx<-26||fx>20||fz<-26||fz>14)return 0;const d=plSegD(fx,fz,SH84W.fish),n=noise(fx*.6+3,fz*.6+9,77);return clamp((1-sm(1.0,2.3,d+(n-.5)*.45))*.85*(.85+n*.3),0,1)};
if(typeof plWornPI==='function')plWornPI=function(x,z){if(Math.abs(x-PIS.x)>34||Math.abs(z-PIS.z)>40)return 0;const n=noise(x*.6+5,z*.6+1,79);let d=9;for(const L of SH84W.plant)d=Math.min(d,plSegD(x,z,L));
 return clamp((1-sm(1.0,2.3,d+(n-.5)*.45))*.85*(.8+n*.35),0,1)};
otWorn=function(x,z){if(Math.abs(x-OTR.x)>48||Math.abs(z-OTR.z)>48)return 0;const n=noise(x*.5,z*.5,82);let d=9;for(const L of SH84W.otter)d=Math.min(d,plSegD(x,z,L));
 const pz=Math.hypot(x-264.2,(z-784.6)*1.15);return clamp(Math.max((1-sm(1.0,2.3,d+(n-.5)*.5))*.85,(1-sm(3.2,5.0,pz+(n-.5)*.8))*.8)*(.85+n*.3),0,1)};

/* ========== 들어가기 · 나가기 · 안 ========== */
const sh84In=()=>INT.on&&SH84K[INT.kind];
function sh84Enter(k){const q=SH84[k],s=q.door,C=SH85IN[k];if(!s||P.dead||busy||INT.on)return;
 fadeDo(q.n+' 안으로…',()=>{intBuild();if(!INT.gr[q.room]){try{const H=sh84Room(k);H.visible=false;INT.g.add(H);INT.gr[q.room]=H}catch(e){console.error('85차 가게 방',e)}}
  INT.dock.hl=Math.max(INT.dock.hl,C.hd+SH84R.cor[1]+.8);INT.full=Math.max(INT.full,C.hw+1.2);
  intRoom(q.room);setBuild(null);if(fishing)endFish();const r=q.r||0;INT.ret={x:s.x+Math.sin(r)*q.ret,z:s.z+Math.cos(r)*q.ret};INT.s=s;INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.door-.2,yo:INT.y-hAt(INT.x,INT.z+INT.door-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+INT.door-1.75;camT.set(P.x,INT.y,P.z);P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(260,.12,'sine',.05,.6);sfx(520,.08,'sine',.03,.4);
  setTimeout(()=>{if(sh84In()===k)sh84Say(k,q.i===0?0:null)},700)})}
{const _io=intOut;intOut=function(){const k=sh84In(),r=_io.apply(this,arguments);if(k)P.rot=SH84[k].r||0;return r}}
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
  const fit=Math.max((2*INT.hw+1.7)/(2*t*as),(2*INT.hd+cl+3.8)/(2*t)),ref=Math.max((2*5.6+1.7)/(2*t*as),(2*4.4+cl+3.8)/(2*t)),d=Math.min(fit,ref);
  const hx=d*t*as,hz=d*t/Math.sin(a+.25),rx=Math.max(0,INT.hw+.9-hx),zc=INT.z+cl/2,rz=Math.max(0,INT.hd+cl/2+1.2-hz);
  const fx=INT.x+clamp(ct.x-INT.x,-rx,rx),fz=zc+clamp(ct.z-zc,-rz,rz);cam.position.set(fx,INT.y+.9+Math.sin(a)*d,fz+.75+Math.cos(a)*d);cam.lookAt(fx,INT.y+.9,fz+.75)}}
/* 빛: 따뜻하고 밝게 */
{const _il=intLight;intLight=function(dk){_il(dk);if(sh84In()){hemi.intensity=.5;hemi.color.setRGB(1,.96,.9);hemi.groundColor.setRGB(.42,.36,.3);sun.intensity=.42;sun.color.setRGB(1,.94,.84);INT.L.position.set(0,2.9,.4);scene.background.setRGB(.05,.045,.04)}}}

/* ========== 상인(산장 주인과 같은 방식) ========== */
const SH84L={fish:['어서 와요! 여긴 낚시꾼들의 가게예요.','벽에 걸린 게 낚시 도감이에요. 다 채우면 꼭 보여 줘요.','옆방엔 수조랑 냉동 창고, 낚시 도구 공방이 있어요. 구경해 봐요.','자판기 물건은 한 시간마다 바뀌어요. 자주 들러요.'],
 plant:['어서 와요! 식물 가게예요.','식물 도감을 다 채운 사람만 이 섬에 들어올 수 있어요.','왼쪽 열대 온실엔 야자수랑 연못이 있어요. 쉬었다 가요.','씨앗은 작업대에서 같은 작물 네 개로 만들어요.'],
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
  const N=SH85IN[k].npc,x=INT.x+N[0],z=INT.z+N[1];o.root.position.set(x,INT.y,z);const want=dist(P.x,P.z,x,z)<7?Math.atan2(P.x-x,P.z-z):0;let df=want-q.rot;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;q.rot+=df*Math.min(1,dt*4);o.root.rotation.y=q.rot;o.mixer.update(dt)}
 if(!INT.on)for(const k in SH84){const q=SH84[k];if(!q.smoke||!q.chim||q.x==null||dist(P.x,P.z,q.x,q.z)>110)continue;const c=q.chim;for(const sp of q.smoke){sp.userData.t=(sp.userData.t+dt*.16)%1;const u=sp.userData.t;sp.position.set(c[0]+Math.sin(u*5+sp.id)*.25+u*.7,c[1]+u*2.6,c[2]-u*.3);const s=.55+u*1.7;sp.scale.set(s,s,1);sp.material.opacity=.5*(1-u)*Math.min(1,u*6)}}}
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
