/* ================= 52차 (디자인, 기획자 11-22 11:22: '관리자 모드에서 모든 구조물을 움직이거나 없앨 수 있게 만들어 놨거든, 여기에 구조물들을 좀 더 많이 추가해 줘.
   계단이나 자연 지형지물, 그리고 롱빈터스러운 건축물들 여러 개 다양하게') =================
   - 관리자 '구조물 배치'(js/layout.js) 목록에만 들어가요. 맵에 저절로 놓이지 않아요(§0 1번) — 기획자가 골라 놓고 '배치 내보내기'로 저장.
   - DECO에 새 종류(키 pr_*, 이름표 cat = 목록 글자, 앞 그림으로 묶음: 🪜 계단·높이 / 🌿 자연 / 🏠 건축물).
   - 올라설 수 있는 것(계단·데크·전망대·경사로·언덕·바위 둔덕·다리·정자·오두막 툇마루): PRF[종류].f(로컬 x,z) = 그 자리 발 높이(구조물 바닥 기준),
     PRW(9) = 벽(난간·기둥·물). onDock을 감싸서 '보이지 않는 부두'처럼 돌려줘요 → groundY·canStep(0.55 넘게 못 올라감)·물 깊이가 그대로 써요.
     그래서 계단은 한 칸씩 올라가고, 데크 옆면·난간은 막히고, 가장자리에서는 떨어져 내려와요. 옮기거나(layout move) 지우면(부모에서 떼어짐) 바로 따라가요.
     관리자 모드(벽 통과)에서는 벽을 무시해요(벽 위로 들려 올라가지 않게).
   - 모양은 look.js 도우미(lkRb·lkBeam·lkRod·lkBoulder·lkSmooth·lkModel·lkAOnew)로, 지금 모양 기준(§6-3-1 ③ 매끈하고 둥근 장난감 디오라마). 정면은 +z. */
const PRW=9,PR={list:[],spin:[],flat:[]};
const prStair=(z,zb,zt,n,H)=>{const t=(zb-z)/(zb-zt);return Math.max(1,Math.ceil(t*n-1e-6))*H/n};
const prBridgeH=z=>.3+1.0*Math.cos(Math.PI*z/7.2);
const PRF={
 /* 🪜 나무 계단: 폭 1.6, 앞(z 1.2)에서 뒤로 다섯 칸(0.2씩) → 뒤 참(높이 1.0, z −0.6~−1.2). 양옆 난간은 벽 */
 pr_stair_wood:{R:1.6,f:(x,z)=>{const a=Math.abs(x);if(a>.92||z<-1.2||z>1.2)return null;if(a>.78)return PRW;return z<-.6?1:prStair(z,1.2,-.6,5,1)}},
 /* 🪜 돌계단: 폭 2.4, 네 칸(0.2씩) → 뒤 참 0.8. 옆 바위는 벽 */
 pr_stair_stone:{R:2,f:(x,z)=>{const a=Math.abs(x);if(a>1.6||z<-1.05||z>1.05)return null;if(a>1.2)return a<1.55?PRW:null;return z<-.6?.8:prStair(z,1.05,-.6,4,.8)}},
 /* 🪜 나무 데크: 4×4 마루 높이 1.0 + 앞 가운데 계단(다섯 칸) + 세 면 난간·앞 양쪽 난간 */
 pr_deck:{R:4.2,f:(x,z)=>{const a=Math.abs(x);
   if(a<=2.02&&z>=-2.02&&z<=2.02){if(a>1.88||z<-1.88||(z>1.88&&a>.72))return PRW;return 1}
   if(z>2.02&&z<=3.55&&a<=.86){if(a>.72)return PRW;return prStair(z,3.55,2.02,5,1)}return null}},
 /* 🪜 전망대: 3×3 마루 높이 2.0(지붕 있음) + 앞 계단 열 칸 */
 pr_lookout:{R:4.9,f:(x,z)=>{const a=Math.abs(x);
   if(a<=1.52&&z>=-1.52&&z<=1.52){if(a>1.38||z<-1.38||(z>1.38&&a>.62))return PRW;return 2}
   if(z>1.52&&z<=4.55&&a<=.76){if(a>.62)return PRW;return prStair(z,4.55,1.52,10,2)}return null}},
 /* 🪜 돌 경사로: 폭 2.0, 앞(z 1.6) 0 → 뒤(z −1.6) 1.0, 양옆 낮은 돌턱은 벽 */
 pr_ramp:{R:2.1,f:(x,z)=>{const a=Math.abs(x);if(a>1.22||z<-1.62||z>1.62)return null;if(a>1)return PRW;return clamp((1.6-z)/3.2,0,1)}},
 /* 🌿 풀 언덕: 6.4×5.2 둥근 언덕, 꼭대기 1.2(부드러워서 걸어 올라가요) */
 pr_mound:{R:3.3,f:(x,z)=>{const t=(x/3.2)**2+(z/2.6)**2;if(t>=1)return null;const s=1-t;return 1.2*s*s*(3-2*s)}},
 /* 🌿 바위 둔덕: 4.4×2.8 평평한 꼭대기 1.0 + 앞 돌계단 네 칸 */
 pr_plateau:{R:3.4,f:(x,z)=>{const a=Math.abs(x);if(a<=2.2&&z>=-1.8&&z<=1.0)return 1;if(z>1&&z<=2.6&&a<=.8)return prStair(z,2.6,1.0,4,1);return null}},
 /* 🪜 나무 다리: 길이 7.2(z), 폭 1.7, 가운데가 둥글게 솟음(끝 0.3 → 가운데 1.3, 물 높이 기준 — 얕은 물에서도 끝으로 올라서요), 양옆 난간 */
 pr_bridge:{R:3.8,f:(x,z)=>{const a=Math.abs(x);if(a>1||Math.abs(z)>3.6)return null;if(a>.85)return PRW;return prBridgeH(z)}},
 /* 🏠 정자: 육각 마루 높이 0.25 + 앞 디딤돌, 기둥 여섯·뒤 다섯 면 난간은 벽 */
 pr_gazebo:{R:2.7,f:(x,z)=>{const r=Math.hypot(x,z);if(r>2.32){return(Math.abs(x)<.9&&z>2.2&&z<2.62)?.12:null}
   for(let k=0;k<6;k++){const p=(30+60*k)*Math.PI/180;if(Math.hypot(x-Math.sin(p)*2.12,z-Math.cos(p)*2.12)<.2)return PRW}
   if(r>2.02&&Math.abs(Math.atan2(x,z))>Math.PI/6)return PRW;return .25}},
 /* 🌿 작은 연못: 물은 들어갈 수 없어요(벽) */
 pr_pond:{R:2,f:(x,z)=>((x/1.8)**2+(z/1.3)**2<1)?PRW:null},
 /* 🏠 통나무 오두막: 몸채는 벽, 앞 툇마루(높이 0.3)는 올라설 수 있어요 */
 pr_cabin:{R:3.3,f:(x,z)=>{const a=Math.abs(x);if(a<=2.12&&z>=-1.72&&z<=1.62)return PRW;if(a<=2.25&&z>1.62&&z<=2.62){if(z>2.45&&(Math.abs(a-2.1)<.14))return PRW;return .3}return null}},
 /* 🏠 버스 정류장: 뒤판·옆판만 벽(안 의자 앞은 지나다녀요) */
 pr_busstop:{R:1.8,f:(x,z)=>{const a=Math.abs(x);if(a>1.62||z<-.66||z>.62)return null;if(z<-.42)return PRW;if(a>1.42&&z<.2)return PRW;return null}},
};
const PRL=[
 ['pr_stair_wood','🪜 나무 계단',{bx:.9,bz:1.2}],['pr_stair_stone','🪜 돌계단',{bx:1.4,bz:1}],['pr_deck','🪜 나무 데크(높은 마루)',{bx:2,bz:2.8}],
 ['pr_lookout','🪜 전망대',{bx:1.5,bz:3}],['pr_ramp','🪜 돌 경사로',{bx:1.2,bz:1.6}],['pr_bridge','🪜 나무 다리',{bx:1,bz:3.6,flat:1}],
 ['pr_mound','🌿 풀 언덕',{bx:3,bz:2.5}],['pr_plateau','🌿 바위 둔덕',{bx:2.2,bz:2.2}],['pr_boulders','🌿 큰 바위 무더기',{bx:1.55,bz:1.15,blk:1}],
 ['pr_cliff','🌿 바위 절벽',{bx:2.55,bz:.75,blk:1}],['pr_log','🌿 쓰러진 통나무',{bx:1.6,bz:.38,blk:1}],['pr_stumps','🌿 그루터기 무리',{bx:.95,bz:.7,blk:1}],
 ['pr_pond','🌿 작은 연못',{bx:1.9,bz:1.4}],['pr_hedge','🌿 덤불 울타리',{bx:1.55,bz:.42,blk:1}],['pr_flowers','🌿 꽃밭',{bx:1.4,bz:1}],
 ['pr_bigtree','🌿 큰 고목',{bx:.75,bz:.75,blk:1}],['pr_reeds','🌿 갈대숲',{bx:1,bz:.8}],['pr_cairn','🌿 돌탑',{bx:.5,bz:.5,blk:1}],
 ['pr_mossrock','🌿 이끼 바위',{bx:.9,bz:.75,blk:1}],
 ['pr_cabin','🏠 통나무 오두막',{bx:2.1,bz:1.7}],['pr_shack','🏠 어부 오두막',{bx:1.65,bz:1.45,blk:1}],['pr_barn','🏠 빨간 헛간',{bx:2.35,bz:2.65,blk:1}],
 ['pr_gazebo','🏠 정자',{bx:2.3,bz:2.3}],['pr_windmill','🏠 풍차',{bx:1.45,bz:1.45,blk:1}],['pr_watertower','🏠 물탱크 탑',{bx:1.15,bz:1.15,blk:1}],
 ['pr_greenhouse','🏠 온실',{bx:1.55,bz:2.05,blk:1}],['pr_busstop','🏠 버스 정류장',{bx:1.6,bz:.6}],['pr_camper','🏠 캠핑 트레일러',{bx:1.95,bz:1.05,blk:1}],
 ['pr_stall','🏠 장터 가판대',{bx:1.3,bz:.7,blk:1}],['pr_signpost','🏠 이정표·우편함',{bx:.35,bz:.3,blk:1}],
];
for(const [t,cat,o] of PRL)DECO[t]=Object.assign({g:t,s:1,n:cat.replace(/^\S+\s/,''),cat},o.blk?{bx:o.bx,bz:o.bz}:{bx:o.bx,bz:o.bz,pass:1},o.flat?{flat:1}:{});

/* 보이지 않는 부두: 올라설 수 있는 구조물 위 발 높이 / 벽 */
function prAt(x,z){let best=null;
 for(const s of PR.list){const D=PRF[s.t],dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz>D.R*D.R||!s.m||!s.m.parent)continue;
  const c=Math.cos(s.r||0),sn=Math.sin(s.r||0),h=D.f(dx*c-dz*sn,dx*sn+dz*c);if(h==null)continue;if(h>=PRW&&typeof DEV!=='undefined'&&DEV.on)continue;
  const y=s.m.position.y+.04+h;if(!best||y>best.y){best=s._pd||(s._pd={x:0,z:0,c:1,s:0,hw:0,hl:0,y:0,pr:1});best.x=s.x;best.z=s.z;best.y=y}}
 return best}
{const _od=onDock;onDock=function(x,z){const d=_od(x,z);if(d||!PR.list.length)return d;return prAt(x,z)}}
{const _as=addStruct;addStruct=function(s){const r=_as(s);const o=r||s;if(o&&PRF[o.t])PR.list.push(o);if(o&&o.t==='pr_windmill')PR.spin.push(o);if(o&&DECO[o.t]&&DECO[o.t].flat&&/^pr_/.test(o.t))PR.flat.push(o);return r}}
if(typeof removeStruct==='function'){const _rs=removeStruct;removeStruct=function(s){for(const L of [PR.list,PR.spin,PR.flat]){const i=L.indexOf(s);if(i>=0)L.splice(i,1)}return _rs(s)}}
/* 풍차 날개 돌리기 · 물 위에 띄우는 것(다리)은 물 높이에 고정(배치 도구가 땅 높이 차만큼 올리고 내려도) */
{const _ud=updDress;updDress=function(dt,px,pz){_ud(dt,px,pz);try{for(const s of PR.spin){const b=s.lk&&s.lk.parts.blades;if(b)b.rotation.z+=dt*.55}for(const s of PR.flat)if(s.m)s.m.position.y=-.04}catch(e){}}}

/* ---------------- 모양 ---------------- */
const PRC={W:0xd6965a,W2:0xc08550,W3:0x9c6a3e,WD:0x7a5236,CR:0xf7f0e3,TL:0x3aa6b0,RD:0xe0533f,NV:0x3b4a6b,ST:0xb9b3a8,ST2:0xa39d92,ST3:0xcfc9bd,
 GR:0x7cbf5a,GR2:0x6aae4c,GR3:0x8fcc66,MS:0x7fa65a,DT:0xa77b52,WT:0x5fb6d6,RF:0x5f8f5a,RF2:0x527f4f,GL:0xbfe3ea,MT:0x8e99a6,DK:0x3b424b,YL:0xf2c230,LV:0x6fae4d,LV2:0x5f9a45,LV3:0x82c25c};
function prModels(){const C=PRC,R=(w,h,d,c=.03,b=.015)=>lkRb(w,h,d,c,b),S=(r,a=12,b=8)=>new THREE.SphereGeometry(r,a,b),IC=(r,d=1)=>new THREE.IcosahedronGeometry(r,d),
  put=(k,p,sm=38)=>{const g=mg(p);lkSmooth(g,sm);GEO[k]=g;return g},hs=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
 /* 판자 여러 장(길이 방향 ax: 'x'|'z'), 사이 틈 + 두 가지 색 */
 const planks=(p,x0,x1,z0,z1,y,th,ax,c1,c2,bw=.24,gap=.035)=>{if(ax==='x'){for(let z=z0,i=0;z<z1-.01;z+=bw,i++){const w=Math.min(bw,z1-z);p.push(pt(R(x1-x0,th,w-gap,.012,.008),i%2?c2:c1,[(x0+x1)/2,y-th/2,z+w/2]))}}
   else{for(let x=x0,i=0;x<x1-.01;x+=bw,i++){const w=Math.min(bw,x1-x);p.push(pt(R(w-gap,th,z1-z0,.012,.008),i%2?c2:c1,[x+w/2,y-th/2,(z0+z1)/2]))}}};
 /* 난간: 점 a→b(바닥 높이 ya→yb) 기둥 간격 sp, 높이 h */
 const rail=(p,a,b,ya,yb,h,col,sp=1.1,post=.09)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/sp));for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=ya+(yb-ya)*t;p.push(pt(box(post,h,post),col,[x,y+h/2,z]),pt(S(post*.75,6,4),col,[x,y+h+.02,z]))}
   p.push(lkBeam([a[0],ya+h-.04,a[1]],[b[0],yb+h-.04,b[1]],.075,.06,col),lkBeam([a[0],ya+h*.5,a[1]],[b[0],yb+h*.5,b[1]],.05,.04,col))};
 /* 박공지붕(용마루는 x방향): 폭 W(x), 깊이 D(z), 처마 높이 y0, 솟음 hr, 처마 내밈 ov, 줄 수 k */
 const gable=(p,W,D,y0,hr,ov,c1,c2,k=5,th=.07)=>{const half=D/2+ov,ang=Math.atan2(hr,D/2),drop=ov*Math.tan(ang);
   for(const sg of [1,-1])for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,za=sg*half*(1-t0),zb=sg*half*(1-t1)-sg*.04,ya=y0-drop+(hr+drop)*t0,yb=y0-drop+(hr+drop)*t1+.04*Math.tan(ang);p.push(lkBeam([0,ya+th*(i%2?.4:.0),za],[0,yb,zb],W,th,i%2?c2:c1))}
   p.push(pt(R(W+.06,.12,.16,.04,.03),c2,[0,y0+hr+.05,0]))};
 const tri=(W,hr,t,col)=>{const s=new THREE.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(0,hr);s.lineTo(-W/2,0);const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false});g.translate(0,0,-t/2);return pt(g,col,[0,0,0])};
 const win=(p,x,y,z,w,h,ry=0,fr=C.CR)=>{const g=[pt(R(w+.12,h+.12,.07,.02,.012),fr,[0,0,0]),pt(R(w,h,.05,.01,.008),C.GL,[0,0,.012]),pt(box(.04,h,.03),fr,[0,0,.04]),pt(box(w,.04,.03),fr,[0,0,.04]),pt(R(w+.2,.06,.14,.02,.012),fr,[0,-h/2-.08,.05])];
   const m=mg(g);m.rotateY(ry);m.translate(x,y,z);p.push(pt(m,null,[0,0,0]))};
 const door=(p,x,y,z,w,h,col,ry=0,fr=C.CR)=>{const g=[pt(R(w+.14,h+.08,.07,.02,.012),fr,[0,h/2,0])];const n=4;for(let i=0;i<n;i++)g.push(pt(R(w/n-.02,h,.06,.01,.008),i%2?col:new THREE.Color(col).multiplyScalar(.9).getHex(),[-w/2+w/n*(i+.5),h/2,.02]));g.push(pt(S(.04,8,6),0xe0b84a,[w/2-.12,h*.48,.07]));
   const m=mg(g);m.rotateY(ry);m.translate(x,y,z);p.push(pt(m,null,[0,0,0]))};
 const logs=(p,len,h,ax,x,z,y0,c1,c2,r=.12)=>{const n=Math.round(h/(r*1.85));for(let i=0;i<n;i++){const g=cyl(r,r,len,9);if(ax==='x')g.rotateZ(Math.PI/2);else g.rotateX(Math.PI/2);p.push(pt(g,i%2?c2:c1,[x,y0+r+i*r*1.85,z]))}};
 const flower=(p,x,z,col,h=.25,s=1)=>{p.push(pt(cyl(.012,.012,h,4),0x5f9a45,[x,h/2,z]),pt(S(.075*s,8,4),col,[x,h,z],0,[1,.42,1]),pt(S(.026*s,6,3),0xf7d44a,[x,h+.025*s,z]))};

 /* ================= 🪜 계단·높이 ================= */
 /* 나무 계단 */
 {const p=[],L=.36;for(const sx of[-1,1]){p.push(lkBeam([sx*.72,0,1.25],[sx*.72,1.02,-.62],.08,.22,C.W3),pt(R(.1,1.02,.1,.02,.012),C.W3,[sx*.72,.51,-1.15]),pt(R(.1,1.02,.1,.02,.012),C.W3,[sx*.72,.51,-.65]))}
  for(let i=1;i<=5;i++){const zc=1.2-(i-.5)*L,y=i*.2;p.push(pt(R(1.5,.07,L+.04,.02,.012),i%2?C.W:C.W2,[0,y-.035,zc]),pt(R(1.42,.2,.04,.01,.008),C.W3,[0,y-.13,zc+L/2-.02]))}
  planks(p,-.75,.75,-1.2,-.6,1.0,.07,'x',C.W,C.W2,.2);p.push(pt(R(1.5,.12,.6,.02,.012),C.W3,[0,.88,-.9]));
  for(const sx of[-1,1]){rail(p,[sx*.82,1.2],[sx*.82,-.6],0,1,.85,C.W2,.9);rail(p,[sx*.82,-.6],[sx*.82,-1.2],1,1,.85,C.W2,.6)}
  put('pr_stair_wood',p,34)}
 /* 돌계단 */
 {const p=[],L=.4125;for(let i=1;i<=4;i++){const zc=1.05-(i-.5)*L,y=i*.2;for(let j=0;j<3;j++){const w=.78,xc=-.8+j*.8;p.push(pt(R(w-.03,y,L-.02,.05,.04),i%2?[C.ST3,0xd8d2c6,C.ST3][j]:[C.ST2,C.ST,C.ST2][j],[xc+(hs(i,j)-.5)*.03,y/2,zc]))}p.push(pt(box(2.36,.03,.03),0x7d776d,[0,y+.005,zc+L/2-.02]))}
  p.push(pt(R(2.38,.8,.45,.06,.05),C.ST2,[0,.4,-.83]));for(const [x,z] of [[-.6,-.8],[.4,-.85],[.75,.15],[-.9,.55]])p.push(pt(S(.12,8,5),C.MS,[x,(z<-.6?.8:.2*Math.ceil((1.05-z)/L))+.01,z],0,[1.4,.25,1]));
  for(const sx of[-1,1]){p.push(lkBoulder(.42,C.ST2,sx*2.3,[sx*1.38,0,-.55],.95),lkBoulder(.34,C.ST,sx*3.1,[sx*1.36,0,.35],.9),lkBoulder(.22,C.ST3,sx*1.7,[sx*1.42,0,.85],.8));p.push(pt(S(.18,8,5),C.MS,[sx*1.36,.68,-.5],0,[1.3,.3,1.1]))}
  put('pr_stair_stone',p,30)}
 /* 나무 데크 */
 {const p=[];for(const [x,z] of [[-1.85,-1.85],[1.85,-1.85],[-1.85,1.85],[1.85,1.85],[0,-1.85],[0,1.85],[-1.85,0],[1.85,0]])p.push(pt(R(.16,.95,.16,.03,.02),C.W3,[x,.47,z]));
  for(const z of[-1.85,0,1.85])p.push(pt(R(3.9,.14,.12,.02,.012),C.WD,[0,.86,z]));planks(p,-2,2,-2,2,1.0,.07,'x',C.W,C.W2,.25);
  p.push(pt(R(4.06,.08,.08,.02,.012),C.W3,[0,.95,2.0]),pt(R(4.06,.08,.08,.02,.012),C.W3,[0,.95,-2.0]),pt(R(.08,.08,4.06,.02,.012),C.W3,[2.0,.95,0]),pt(R(.08,.08,4.06,.02,.012),C.W3,[-2.0,.95,0]));
  rail(p,[-1.95,-1.95],[1.95,-1.95],1,1,.85,C.CR,1);rail(p,[-1.95,-1.95],[-1.95,1.95],1,1,.85,C.CR,1);rail(p,[1.95,-1.95],[1.95,1.95],1,1,.85,C.CR,1);rail(p,[-1.95,1.95],[-.78,1.95],1,1,.85,C.CR,1.2);rail(p,[.78,1.95],[1.95,1.95],1,1,.85,C.CR,1.2);
  const L=.306;for(const sx of[-1,1]){p.push(lkBeam([sx*.66,0,3.6],[sx*.66,1.0,2.0],.07,.2,C.W3));rail(p,[sx*.78,3.55],[sx*.78,2.0],0,1,.85,C.CR,.8)}
  for(let i=1;i<=5;i++){const zc=3.55-(i-.5)*L,y=i*.2;p.push(pt(R(1.3,.07,L+.03,.02,.012),i%2?C.W:C.W2,[0,y-.035,zc]))}
  p.push(pt(cyl(.2,.16,.34,10),0xc96f4a,[1.45,1.17,-1.45]),pt(S(.26,10,8),C.LV,[1.45,1.5,-1.45],0,[1,.85,1]),pt(R(1.4,.08,.4,.03,.02),C.W2,[-.9,1.42,-1.62]));
  for(const x of[-1.45,-.35])p.push(pt(R(.08,.42,.3,.02,.012),C.W3,[x,1.21,-1.62]));p.push(...lkLampParts(1.2).map(g=>{const c=g.clone();c.scale(.7,.7,.7);c.translate(-1.75,1,1.6);return c}));
  put('pr_deck',p,34)}
 /* 전망대 */
 {const p=[];for(const [x,z] of [[-1.35,-1.35],[1.35,-1.35],[-1.35,1.35],[1.35,1.35]]){p.push(pt(cyl(.14,.16,4.3,10),C.W3,[x,2.15,z]))}
  for(const s of[-1,1]){p.push(lkBeam([s*1.35,.3,-1.35],[s*1.35,1.8,1.35],.07,.07,C.WD),lkBeam([s*1.35,.3,1.35],[s*1.35,1.8,-1.35],.07,.07,C.WD),lkBeam([-1.35,.3,s*1.35],[1.35,1.8,s*1.35],.07,.07,C.WD),lkBeam([1.35,.3,s*1.35],[-1.35,1.8,s*1.35],.07,.07,C.WD))}
  p.push(pt(R(3.1,.14,3.1,.03,.02),C.WD,[0,1.88,0]));planks(p,-1.5,1.5,-1.5,1.5,2.0,.07,'x',C.W,C.W2,.25);
  rail(p,[-1.42,-1.42],[1.42,-1.42],2,2,.9,C.W2,1);rail(p,[-1.42,-1.42],[-1.42,1.42],2,2,.9,C.W2,1);rail(p,[1.42,-1.42],[1.42,1.42],2,2,.9,C.W2,1);rail(p,[-1.42,1.42],[-.68,1.42],2,2,.9,C.W2,1);rail(p,[.68,1.42],[1.42,1.42],2,2,.9,C.W2,1);
  const cn=cyl(0,2.45,1.15,4);cn.rotateY(Math.PI/4);p.push(pt(cn,C.TL,[0,4.82,0]),pt(R(3.5,.1,3.5,.03,.02),C.CR,[0,4.27,0]),pt(S(.13,10,8),C.CR,[0,5.45,0]),pt(cyl(.02,.02,.5,5),C.DK,[0,5.7,0]));
  p.push(pt(R(.5,.32,.02,.02,.01),C.RD,[.27,5.9,0]));
  const L=.303;for(const sx of[-1,1]){p.push(lkBeam([sx*.56,0,4.6],[sx*.56,2.0,1.5],.07,.22,C.W3));rail(p,[sx*.68,4.55],[sx*.68,1.52],0,2,.85,C.W2,.8)}
  for(let i=1;i<=10;i++){const zc=4.55-(i-.5)*L,y=i*.2;p.push(pt(R(1.1,.07,L+.03,.02,.012),i%2?C.W:C.W2,[0,y-.035,zc]))}
  put('pr_lookout',p,34)}
 /* 돌 경사로 */
 {const p=[],sh=new THREE.Shape();sh.moveTo(-1.6,0);sh.lineTo(1.6,0);sh.lineTo(1.6,1.0);sh.lineTo(-1.6,0);const g=new THREE.ExtrudeGeometry(sh,{depth:2.0,bevelEnabled:false});g.translate(0,0,-1);g.rotateY(Math.PI/2);p.push(pt(g,0xbdb5a6,[0,0,0]));
  for(let i=0;i<8;i++){const z=1.6-(i+.5)*.4,y=(1.6-z)/3.2+.005;p.push(pt(box(1.96,.025,.06),0x857e72,[0,y+.004,z+.2],[-Math.atan(1/3.2),0,0]),pt(box(.05,.02,.36),0x938c80,[(i%2?-.33:.33),y+.004,z],[-Math.atan(1/3.2),0,0]))}
  for(const sx of[-1,1])for(let i=0;i<4;i++){const z0=1.6-i*.8,z1=z0-.8,y0=(1.6-z0)/3.2,y1=(1.6-z1)/3.2;p.push(lkBeam([sx*1.11,y0+.12,z0-.02],[sx*1.11,y1+.12,z1+.02],.22,.24,i%2?C.ST:C.ST2),pt(R(.22,(y0+y1)/2+.05,.78,.03,.02),C.ST2,[sx*1.11,((y0+y1)/2+.05)/2,(z0+z1)/2]))}
  p.push(pt(R(2.42,1.02,.18,.04,.03),C.ST2,[0,.51,-1.7]));for(const [x,z] of [[-.5,.6],[.6,-.4],[-.3,-1.2]])p.push(pt(S(.14,8,5),C.MS,[x,(1.6-z)/3.2+.01,z],0,[1.5,.2,1]));
  put('pr_ramp',p,30)}
 /* 나무 다리(물 높이 기준) */
 {const p=[],N=18,H=prBridgeH;for(let i=0;i<N;i++){const z0=-3.6+7.2*i/N,z1=-3.6+7.2*(i+1)/N;for(const sx of[-1,1])p.push(lkBeam([sx*.8,H(z0)-.12,z0],[sx*.8,H(z1)-.12,z1],.12,.2,C.W3))}
  for(let z=-3.5;z<=3.51;z+=.24){const y=H(z),a=Math.atan(-1.0*Math.PI/7.2*Math.sin(Math.PI*z/7.2));p.push(pt(box(1.78,.06,.2),hs(z,1)>.5?C.W:C.W2,[0,y-.03,z],[-a,0,0]))}
  for(const sx of[-1,1]){const pz=[-3.55,-2.4,-1.2,0,1.2,2.4,3.55];for(let i=0;i<pz.length;i++){const z=pz[i];p.push(pt(R(.1,.95,.1,.02,.012),C.W3,[sx*.92,H(z)+.42,z]),pt(S(.075,8,6),C.W3,[sx*.92,H(z)+.92,z]));if(i<pz.length-1)p.push(lkBeam([sx*.92,H(z)+.86,z],[sx*.92,H(pz[i+1])+.86,pz[i+1]],.075,.06,C.W2),lkBeam([sx*.92,H(z)+.45,z],[sx*.92,H(pz[i+1])+.45,pz[i+1]],.05,.04,C.W2))}}
  for(const z of[-2.1,2.1]){for(const sx of[-1,1])p.push(pt(cyl(.13,.15,2.4,9),C.WD,[sx*.8,H(z)-1.3,z]));p.push(pt(R(1.9,.14,.16,.03,.02),C.WD,[0,H(z)-.22,z]))}
  for(const sx of[-1,1])for(const z of[-3.55,3.55])p.push(pt(cyl(.04,.04,.06,8),C.YL,[sx*.92,H(z)+1.0,z]));
  put('pr_bridge',p,34)}
 /* 풀 언덕 */
 {const p=[],RX=3.2,RZ=2.6,NX=26,NZ=22,g=new THREE.PlaneGeometry(RX*2+.4,RZ*2+.4,NX,NZ);g.rotateX(-Math.PI/2);const P=g.attributes.position,col=[];
  for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),h=PRF.pr_mound.f(x,z);const y=h==null?-.12:h+.002;P.setY(i,y);const t=h==null?0:h/1.2,n=hs(Math.round(x*3),Math.round(z*3));
   const c=new THREE.Color(h==null||h<.05?C.DT:n>.7?C.GR3:t>.5?C.GR:C.GR2).convertSRGBToLinear();col.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();p.push(pt(g,null,[0,0,0]));
  for(let i=0;i<5;i++){const z=2.25-i*.42,x=-.5+i*.06,h=PRF.pr_mound.f(x,z)||0;const lg=cyl(.07,.07,.8,8);lg.rotateZ(Math.PI/2);p.push(pt(lg,C.W3,[x,h+.05,z]))}
  for(const [x,z,r,s] of [[-2.6,.9,.32,1.1],[2.4,-1.0,.4,2.2],[2.7,.8,.24,3.3],[-1.9,-1.6,.28,4.4]])p.push(lkBoulder(r,C.ST,s,[x,-.05,z],.75));
  for(let i=0;i<14;i++){const a=i*2.4,rr=.3+((i*37)%10)/10*1.4,x=Math.cos(a)*rr*1.3,z=Math.sin(a)*rr;const h=PRF.pr_mound.f(x,z);if(h==null)continue;const cs=[0xf28ab2,0xffffff,0xf7c948,0x9b7be0];p.push(...(()=>{const q=[];flower(q,x,z,cs[i%4],.18);return q.map(g=>{g.translate(0,h,0);return g})})())}
  p.push(pt(cyl(.06,.08,.9,7),C.W3,[.4,1.2+.4,-.3]),pt(S(.35,10,8),C.LV,[.4,2.15,-.3],0,[1,.9,1]),pt(S(.22,8,6),C.LV3,[.62,2.3,-.15]));
  put('pr_mound',p,40)}
 /* 바위 둔덕 */
 {const p=[];p.push(pt(R(4.5,.16,2.9,.08,.06),C.GR2,[0,.94,-.4]),pt(R(4.3,.88,2.7,.12,.1),C.ST2,[0,.44,-.4]));
  const edge=[];for(let i=0;i<=8;i++)edge.push([-2.25+4.5*i/8,1.05]);for(let i=0;i<=8;i++)edge.push([-2.25+4.5*i/8,-1.85]);for(let i=1;i<6;i++){edge.push([-2.25,1.05-2.9*i/6]);edge.push([2.25,1.05-2.9*i/6])}
  edge.forEach(([x,z],i)=>{if(z>1&&Math.abs(x)<.9)return;p.push(lkBoulder(.38+hs(i,2)*.18,[C.ST,C.ST2,C.ST3][i%3],i*1.7,[x,-.05,z],1.2+hs(i,5)*.4))});
  for(let i=0;i<9;i++){const x=-1.8+hs(i,9)*3.6,z=-1.6+hs(i,3)*2.4;p.push(pt(S(.16,8,5),i%3?C.GR3:C.MS,[x,1.03,z],0,[1.5,.4,1.2]))}
  const L=.4;for(let i=1;i<=4;i++){const zc=2.6-(i-.5)*L,y=i*.25;p.push(pt(R(1.5,y,L-.03,.05,.04),i%2?C.ST:C.ST3,[0,y/2,zc]))}
  {const q=[];flower(q,-1.2,-.9,0xf28ab2,.2);flower(q,1.3,-.3,0xf7c948,.2);flower(q,.4,-1.4,0xffffff,.2);q.forEach(g=>{g.translate(0,1.0,0);p.push(g)})}
  put('pr_plateau',p,30)}

 /* ================= 🌿 자연 ================= */
 /* 큰 바위 무더기 */
 {const p=[lkBoulder(1.0,C.ST2,1.3,[-.35,-.08,-.15],.85),lkBoulder(.75,C.ST,2.6,[.75,-.08,.2],.8),lkBoulder(.5,C.ST3,3.9,[.1,-.06,.75],.75),lkBoulder(.32,C.ST,5.2,[-1.25,-.05,.6],.7),lkBoulder(.22,C.ST2,6.1,[1.45,-.04,-.55],.7)];
  for(const [x,y,z,r] of [[-.4,.92,-.2,.42],[.7,.62,.2,.3],[-.75,.6,.35,.22]])p.push(pt(S(r,10,6),C.MS,[x,y,z],0,[1.3,.32,1.1]));
  for(const [x,z] of [[1.2,.75],[-1.4,-.3],[.4,-.95]])p.push(pt(cone(.09,.5,5),C.GR2,[x,.22,z],[0,0,.15]),pt(cone(.08,.42,5),C.GR,[x+.1,.2,z+.06],[0,0,-.25]));
  p.forEach(g=>g.scale(1.45,1.45,1.45));put('pr_boulders',p,30)}
 /* 바위 절벽(긴 바위 벽, 위에 풀) */
 {const p=[];for(let i=0;i<7;i++){const x=-2.4+i*.8,h=1.7+hs(i,1)*.7;for(let k=0;k<3;k++){const y=k*h/3;p.push(pt(R(.86,h/3+.08,1.2-k*.12,.12,.09),[C.ST,C.ST2,C.ST3][(i+k)%3],[x+(hs(i,k)-.5)*.12,y+h/6,(hs(k,i)-.5)*.14]))}
   p.push(pt(R(.84,.12,1.0,.06,.05),C.GR2,[x,h+.02,0]),pt(S(.2,8,5),C.GR3,[x+.12,h+.1,.2],0,[1.4,.5,1.1]))}
  for(const [x,z,r] of [[-2.2,.75,.3],[1.0,.8,.36],[2.5,.7,.24],[-.6,.85,.2]])p.push(lkBoulder(r,C.ST2,x*3,[x,-.05,z],.8));
  for(const x of[-1.6,.4,2.0])p.push(pt(S(.16,8,5),C.MS,[x,1.0+hs(x,1)*.4,.62],0,[1.2,1,.4]));
  put('pr_cliff',p,30)}
 /* 쓰러진 통나무 */
 {const p=[],lg=cyl(.34,.36,3.0,14);lg.rotateZ(Math.PI/2);p.push(pt(lg,C.WD,[0,.34,0]));
  for(const sx of[-1,1]){const c=cyl(.33,.33,.03,14);c.rotateZ(Math.PI/2);p.push(pt(c,0xd9b07a,[sx*1.5,.34,0]));const r2=cyl(.2,.2,.035,12);r2.rotateZ(Math.PI/2);p.push(pt(r2,sx<0?0x3a2a1e:0xc49866,[sx*1.51,.34,0]))}
  for(let i=0;i<9;i++){const a=i*.7,x=-1.3+i*.32;p.push(pt(box(.22,.04,.05),0x5f4029,[x,.34+Math.cos(a)*.35,Math.sin(a)*.35],[a,0,0]))}
  for(const [x,s] of [[-.8,1.2],[.3,.9],[1.0,1.1]])p.push(pt(S(.22*s,10,6),C.MS,[x,.66,0],0,[1.6,.35,1.1]));
  for(const [x,z,c] of [[-.4,.33,0xe0533f],[-.2,.36,0xf3e6cf],[.7,-.34,0xe0533f]]){p.push(pt(cyl(.025,.03,.12,6),0xf3e6cf,[x,.2,z]),pt(S(.07,8,5),c,[x,.28,z],0,[1,.6,1]))}
  const br=cyl(.06,.09,.6,7);br.rotateZ(-.9);p.push(pt(br,C.WD,[.5,.75,-.05]));
  put('pr_log',p,34)}
 /* 그루터기 무리 */
 {const p=[];for(const [x,z,r,h] of [[-.45,-.1,.32,.42],[.42,.2,.26,.32],[.05,-.45,.2,.24]]){p.push(pt(cyl(r,r*1.12,h,12),C.WD,[x,h/2,z]),pt(cyl(r*.96,r*.96,.03,12),0xd9b07a,[x,h+.005,z]),pt(cyl(r*.55,r*.55,.034,10),0xc49866,[x,h+.01,z]));
   for(let k=0;k<4;k++){const a=k*1.57+x;p.push(pt(R(.12,.14,r*.9,.03,.02),C.WD,[x+Math.cos(a)*r*.95,.06,z+Math.sin(a)*r*.95],[0,-a+Math.PI/2,0]))}}
  p.push(pt(S(.12,8,5),C.MS,[-.45,.45,-.1],0,[1.5,.3,1.2]));for(const [x,z] of [[.6,-.15],[.7,-.05]])p.push(pt(cyl(.02,.025,.1,6),0xf3e6cf,[x,.05,z]),pt(S(.06,8,5),0xc98a52,[x,.12,z],0,[1,.6,1]));
  const ch=[pt(cyl(.04,.04,.03,8),0xd9b07a,[-.05,.03,.45])];p.push(...ch);put('pr_stumps',p,34)}
 /* 작은 연못 */
 {const p=[],w=cyl(1,1,.04,28);w.scale(1.78,1,1.28);p.push(pt(w,C.WT,[0,.05,0]));const w2=cyl(1,1,.045,24);w2.scale(1.2,1,.8);p.push(pt(w2,0x4a9fc4,[.1,.052,-.05]));
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;p.push(lkBoulder(.18+hs(i,3)*.12,[C.ST,C.ST2,C.ST3][i%3],i*1.3,[Math.cos(a)*1.92,-.06,Math.sin(a)*1.4],.7))}
  for(const [x,z,r] of [[-.6,.3,.22],[.5,-.4,.18],[.9,.35,.15]]){const lp=cyl(r,r,.02,12,1);p.push(pt(lp,0x5f9a45,[x,.08,z]));p.push(pt(S(.06,8,5),0xf7a8c8,[x+.05,.11,z],0,[1,.7,1]))}
  for(const [x,z] of [[-1.55,-.6],[-1.4,-.8],[1.5,.6]])for(let k=0;k<4;k++)p.push(pt(cone(.025,.8+k*.08,4),C.GR2,[x+k*.05,.4+k*.04,z+(k%2)*.06],[0,0,(k-1.5)*.1]));
  for(const [x,z] of [[-1.5,-.62],[1.52,.62]])p.push(pt(cyl(.04,.04,.18,6),0x7a5236,[x,.95,z]));
  for(const [x,z] of [[-.3,-.6],[.4,.5],[-1.0,.2]])p.push(pt(S(.05,6,4),0xffffff,[x,.075,z],0,[2,.2,1]));
  put('pr_pond',p,30)}
 /* 덤불 울타리: 나무 화단 틀 위 다듬은 산울타리(둥근 윗면·잎 뭉치) + 작은 꽃 */
 {const p=[];p.push(pt(R(3.1,.32,.82,.05,.04),C.W2,[0,.16,0]),pt(R(3.16,.06,.88,.03,.02),C.W3,[0,.33,0]));for(let i=0;i<8;i++)p.push(pt(box(.02,.28,.02),C.W3,[-1.4+i*.4,.16,.415]));
  p.push(pt(R(2.95,.95,.72,.32,.28),C.LV2,[0,.8,0]));for(let i=0;i<11;i++){const x=-1.3+i*.26,y=.5+hs(i,7)*.65,z=(i%2?.33:-.33);p.push(pt(IC(.17,0),i%3?C.LV:C.LV3,[x,y,z],[i,i*.5,0],[1,.8,.7]))}
  for(let i=0;i<7;i++)p.push(pt(IC(.2,0),i%2?C.LV:C.LV3,[-1.25+i*.42,1.22,(hs(i,2)-.5)*.3],[i,0,i],[1,.55,1]));
  for(let i=0;i<12;i++){const x=-1.35+i*.245,y=.55+hs(i,4)*.6,z=(i%2?.37:-.37);p.push(pt(S(.05,6,4),i%3?0xf28ab2:0xffffff,[x,y,z]))}
  put('pr_hedge',p,40)}
 /* 꽃밭 */
 {const p=[];const bed=cyl(1,1,.08,20);bed.scale(1.35,1,.95);p.push(pt(bed,0x8a5a36,[0,.04,0]));
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;p.push(pt(R(.32,.12,.14,.04,.03),i%2?C.ST:C.ST3,[Math.cos(a)*1.38,.06,Math.sin(a)*.98],[0,-a+Math.PI/2,0]))}
  const cs=[0xf28ab2,0xffffff,0xf7c948,0x9b7be0,0xe0533f,0xf29a50];const lv=cyl(1,1,.16,18);lv.scale(1.2,1,.84);p.push(pt(lv,C.GR2,[0,.12,0]));for(let i=0;i<14;i++){const a=i*2.39996,rr=Math.sqrt(i/14)*1.0;p.push(pt(IC(.16,0),i%2?C.LV:C.GR,[Math.cos(a)*rr*1.1,.22,Math.sin(a)*rr*.75],[i,i,0],[1.3,.55,1.1]))}for(let i=0;i<46;i++){const a=i*2.39996,rr=Math.sqrt(i/46)*1.12;const x=Math.cos(a)*rr*1.12,z=Math.sin(a)*rr*.8;flower(p,x,z,cs[i%6],.3+hs(i,2)*.16,1.55)}
  put('pr_flowers',p,40)}
 /* 큰 고목 */
 {const p=[];p.push(pt(cyl(.42,.62,3.2,12),C.WD,[0,1.6,0]));for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3;p.push(lkBeam([Math.cos(a)*.35,.55,Math.sin(a)*.35],[Math.cos(a)*1.0,-.05,Math.sin(a)*1.0],.26,.2,C.WD))}
  for(const [a,l] of [[.6,1.4],[2.4,1.2],[4.2,1.3]]){p.push(lkBeam([0,2.7,0],[Math.cos(a)*l,3.6,Math.sin(a)*l],.24,.24,C.WD))}
  const bl=[[0,4.6,0,1.6],[-1.2,4.0,.3,1.2],[1.2,4.1,-.2,1.25],[.2,4.2,1.1,1.1],[-.3,4.3,-1.1,1.15],[.9,5.2,.5,.95],[-.8,5.1,-.4,1.0],[0,5.7,0,.9]];
  bl.forEach(([x,y,z,r],i)=>p.push(pt(IC(r,1),[C.LV,C.LV2,C.LV3][i%3],[x,y,z],[i,i*.7,0],[1,.85,1])));
  for(let i=0;i<6;i++){const a=i*1.05;p.push(pt(S(.09,6,4),0xe0533f,[Math.cos(a)*1.5,3.8+hs(i,1)*.8,Math.sin(a)*1.4]))}
  p.push(pt(S(.25,8,5),C.MS,[.3,.4,.45],0,[1.3,.5,1]),pt(cyl(.15,.15,.02,10),0x3a2a1e,[0,1.6,.6],[Math.PI/2,0,0],[1,1,1.4]));
  put('pr_bigtree',p,40)}
 /* 갈대숲 */
 {const p=[];for(let i=0;i<26;i++){const a=i*2.39996,rr=Math.sqrt(i/26)*.85,x=Math.cos(a)*rr*1.2,z=Math.sin(a)*rr*.9,h=1.0+hs(i,1)*.8;p.push(pt(cone(.05,h,4),i%2?C.GR2:0x8fae5a,[x,h/2,z],[(hs(i,2)-.5)*.25,0,(hs(i,3)-.5)*.25]));if(i%3===0)p.push(pt(cyl(.055,.055,.26,6),0x7a5236,[x,h*.88,z]))}
  for(let i=0;i<8;i++){const a=i*.8;p.push(pt(cone(.05,.4,4),C.GR,[Math.cos(a)*.9,.2,Math.sin(a)*.6],[0,0,Math.cos(a)*.5]))}put('pr_reeds',p,30)}
 /* 돌탑 */
 {const p=[];let y=0;[[.48,.2,C.ST2],[.4,.18,C.ST],[.33,.17,C.ST3],[.27,.15,C.ST2],[.2,.13,C.ST],[.14,.12,C.ST3]].forEach(([r,h,c],i)=>{const g=IC(r,1);g.scale(1,h/r*.62,1);p.push(pt(g,c,[(hs(i,1)-.5)*.06,y+h*.45,(hs(i,2)-.5)*.06],[0,i,0]));y+=h*.86});
  for(const [x,z,r] of [[.55,.2,.14],[-.5,.3,.11],[.2,-.5,.12],[-.3,-.45,.09]])p.push(lkBoulder(r,C.ST,x*7,[x,-.03,z],.7));p.push(pt(S(.12,8,5),C.MS,[0,.12,.38],0,[1.4,.3,1]));put('pr_cairn',p,30)}
 /* 이끼 바위 */
 {const p=[lkBoulder(.8,C.ST2,7.7,[0,-.08,0],.9),lkBoulder(.35,C.ST,4.4,[.75,-.05,.35],.8)];p.push(pt(S(.62,12,8),C.MS,[0,.86,0],0,[1.15,.35,1.05]),pt(S(.3,10,6),0x8fbf63,[-.2,.98,.1],0,[1.2,.4,1]));
  for(const [x,z,c,s] of [[-.55,.55,0xe0533f,1],[-.42,.68,0xe0533f,.8],[.35,.62,0xf3e6cf,.9]]){p.push(pt(cyl(.03*s,.035*s,.14*s,6),0xf3e6cf,[x,.07*s,z]),pt(S(.09*s,8,5),c,[x,.15*s,z],0,[1,.6,1]))}
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;p.push(lkBeam([-.7,.05,-.4],[-.7+Math.cos(a)*.35,.38,-.4+Math.sin(a)*.35],.12,.02,C.GR2))}put('pr_mossrock',p,30)}

 /* ================= 🏠 건축물 ================= */
 /* 통나무 오두막: 몸채 4.0×3.2, 통나무 벽 2.2, 초록 너와 지붕, 앞 툇마루(높이 0.3)·기둥·처마, 굴뚝, 장작더미, 화분 상자 */
 {const p=[],W=4.0,D=3.2,zc=-.05;p.push(pt(R(W+.2,.3,D+.2,.05,.04),C.ST2,[0,.15,zc]));
  logs(p,W+.3,2.1,'x',0,zc+D/2,.28,0xb07a4a,0x9c6a3e);logs(p,W+.3,2.1,'x',0,zc-D/2,.28,0xb07a4a,0x9c6a3e);logs(p,D+.3,2.1,'z',W/2,zc,.37,0x9c6a3e,0xb07a4a);logs(p,D+.3,2.1,'z',-W/2,zc,.37,0x9c6a3e,0xb07a4a);
  {const r=[];gable(r,W+.7,D+.1,2.42,1.35,.45,C.RF,C.RF2,6);r.forEach(g=>{g.translate(0,0,zc);p.push(g)})}
  for(const sx of[-1,1]){const t=tri(D+.05,1.35,.12,0xb07a4a);t.rotateY(Math.PI/2);t.translate(sx*W/2,2.42,zc);p.push(t)}
  win(p,0,3.0,zc,.4,.4,Math.PI/2,C.CR);door(p,0,.3,zc+D/2+.1,.95,1.75,0x4b8f8c);win(p,-1.3,1.35,zc+D/2+.13,.6,.55);win(p,1.3,1.35,zc+D/2+.13,.6,.55);win(p,W/2+.13,1.35,zc,.55,.5,Math.PI/2);win(p,-W/2-.13,1.35,zc,.55,.5,-Math.PI/2);
  p.push(pt(R(.72,.2,.26,.04,.03),C.W2,[-1.3,.95,zc+D/2+.28]));
  {const q=[];for(let i=0;i<4;i++)flower(q,-1.55+i*.17,0,[0xf28ab2,0xffffff,0xe0533f,0xf7c948][i],.16);q.forEach(g=>{g.translate(0,1.05,zc+D/2+.28);p.push(g)})}
  planks(p,-2.25,2.25,zc+D/2+.05,2.6,.3,.08,'x',C.W,C.W2,.24);for(const sx of[-1,1]){p.push(pt(R(.14,1.95,.14,.03,.02),C.W3,[sx*2.1,1.27,2.5]));}
  p.push(lkBeam([-2.3,2.5,zc+D/2],[-2.3,2.15,2.75],.12,.1,C.W3),lkBeam([2.3,2.5,zc+D/2],[2.3,2.15,2.75],.12,.1,C.W3));{const sl=[];for(let i=0;i<4;i++){const za=zc+D/2+i*(2.75-zc-D/2)/4,zb=za+(2.75-zc-D/2)/4+.03;sl.push(lkBeam([0,2.5-(za-zc-D/2)*.33+.06,za],[0,2.5-(zb-zc-D/2)*.33+.06,zb],4.8,.06,i%2?C.RF2:C.RF))}p.push(...sl)}
  p.push(pt(R(.6,1.2,.6,.06,.05),C.ST,[1.2,3.6,zc-.7]),pt(R(.7,.12,.7,.04,.03),C.ST2,[1.2,4.2,zc-.7]),pt(cyl(.1,.1,.2,8),C.DK,[1.2,4.32,zc-.7]));
  for(let k=0;k<3;k++)for(let j=0;j<4-k;j++){const lg=cyl(.1,.1,.62,8);lg.rotateX(Math.PI/2);p.push(pt(lg,k%2?0xc49866:0xa8774a,[W/2+.42+(j-(3-k)/2)*.21,.12+k*.18,zc+.4]))}
  p.push(pt(cyl(.12,.12,.3,8),C.DK,[.75,2.0,zc+D/2+.2]),pt(S(.08,8,6),0xffd88a,[.75,1.9,zc+D/2+.2]));
  put('pr_cabin',p,34)}
 /* 어부 오두막: 짧은 기둥 위 회청색 판잣집 + 골함석 지붕 + 그물·부표·상자·노 */
 {const p=[],W=3.0,D=2.4,y0=.45;for(const [x,z] of [[-1.4,-1.1],[1.4,-1.1],[-1.4,1.1],[1.4,1.1],[0,1.1],[0,-1.1]])p.push(pt(cyl(.1,.12,y0,8),C.WD,[x,y0/2,z]));
  p.push(pt(R(W+.2,.12,D+.2,.03,.02),C.W3,[0,y0+.06,0]));const PL=0x8fa3ad,PL2=0x7b909b;
  for(const [w,d,x,z] of [[W,.08,0,D/2],[W,.08,0,-D/2],[.08,D,W/2,0],[.08,D,-W/2,0]]){const n=Math.round((w>d?w:d)/.3);for(let i=0;i<n;i++){const t=(i+.5)/n-.5;p.push(pt(box(w>d?w/n-.025:.08,2.0,w>d?.08:d/n-.025),i%2?PL:PL2,[x+(w>d?t*w:0),y0+1.1,z+(w>d?0:t*d)]))}}
  {const r=[];gable(r,W+.6,D+.1,y0+2.1,.8,.3,0xb8c0c4,0x9ea7ad,7,.05);r.forEach(g=>p.push(g))}for(const sx of[-1,1]){const t=tri(D+.05,.8,.1,PL);t.rotateY(Math.PI/2);t.translate(sx*W/2,y0+2.1,0);p.push(t)}
  door(p,-.6,y0+.12,D/2+.06,.85,1.65,0xe0533f);win(p,.75,y0+1.25,D/2+.08,.55,.45);p.push(pt(R(.08,.6,.62,.02,.012),0xe0533f,[.41,y0+1.25,D/2+.1]),pt(R(.08,.6,.62,.02,.012),0xe0533f,[1.09,y0+1.25,D/2+.1]));
  for(let i=0;i<6;i++)p.push(pt(box(.02,1.2,.02),0xd8c39a,[W/2+.07,y0+1.0,-.9+i*.3]));for(let j=0;j<5;j++)p.push(pt(box(.02,.02,1.5),0xd8c39a,[W/2+.07,y0+.45+j*.28,-.15]));
  for(const [x,y,z,c] of [[W/2+.14,y0+1.5,-.9,0xf29a50],[W/2+.14,y0+1.1,.45,0xffffff],[-W/2-.12,y0+1.4,.2,0xf29a50]])p.push(pt(S(.14,10,8),c,[x,y,z],0,[1,1.2,1]),pt(cyl(.02,.02,.12,5),C.DK,[x,y+.2,z]));
  for(const [x,z] of [[1.0,1.7],[1.45,1.6]])p.push(pt(R(.5,.36,.4,.04,.03),C.W2,[x,.18,z]));p.push(pt(R(.46,.34,.36,.04,.03),C.TL,[1.2,.53,1.65]));
  p.push(lkBeam([-1.65,0,1.4],[-1.4,1.9,1.35],.06,.05,C.W2),pt(R(.18,.5,.04,.05,.02),C.W2,[-1.62,.2,1.41]));
  put('pr_shack',p,34)}
 /* 빨간 헛간: 박공이 앞(+z), 세로 판 벽 + 흰 테두리 X자 큰 문 + 건초 창 + 짙은 지붕 + 건초 더미 */
 {const p=[],W=4.4,D=5.0,H=2.6,RD2=0xc6463a,RD=0xd65244,WH=0xf4efe6;p.push(pt(R(W+.1,.2,D+.1,.04,.03),C.ST2,[0,.1,0]));
  for(const [x,z,w,d] of [[0,D/2,W,.1],[0,-D/2,W,.1],[W/2,0,.1,D],[-W/2,0,.1,D]])p.push(pt(R(w,H,d,.02,.015),RD,[x,.2+H/2,z]));
  for(const z of[D/2+.03,-D/2-.03])for(let i=0;i<14;i++){const x=-W/2+.16+i*(W-.32)/13;p.push(pt(box(.025,H-.1,.02),RD2,[x,.2+H/2,z]))}
  for(const x of[W/2+.03,-W/2-.03])for(let i=0;i<16;i++){const z=-D/2+.16+i*(D-.32)/15;p.push(pt(box(.02,H-.1,.025),RD2,[x,.2+H/2,z]))}
  for(const [x,z] of [[W/2,D/2],[-W/2,D/2],[W/2,-D/2],[-W/2,-D/2]])p.push(pt(R(.16,H+.05,.16,.02,.012),WH,[x,.2+H/2,z]));
  {const r=[];gable(r,D+.6,W+.1,.2+H,1.7,.35,0x5a5f66,0x4d5258,7);r.forEach(g=>{g.rotateY(Math.PI/2);p.push(g)})}
  for(const sz of[-1,1]){const t=tri(W+.05,1.7,.1,RD);t.translate(0,.2+H,sz*D/2);p.push(t)}
  {const dw=2.2,dh=2.0,z=D/2+.07;p.push(pt(R(dw,dh,.06,.02,.012),RD2,[0,.2+dh/2,z]));for(const sx of[-1,1]){const cx=sx*dw/4;p.push(pt(R(dw/2+.06,.1,.04,.02,.01),WH,[cx,.2+dh,z+.03]),pt(R(dw/2+.06,.1,.04,.02,.01),WH,[cx,.25,z+.03]),pt(R(.1,dh,.04,.02,.01),WH,[sx*dw/2,.2+dh/2,z+.03]),pt(R(.1,dh,.04,.02,.01),WH,[sx*.05,.2+dh/2,z+.03]),lkBeam([cx-dw/4+.06,.3,z+.04],[cx+dw/4-.06,.15+dh,z+.04],.09,.03,WH),lkBeam([cx+dw/4-.06,.3,z+.04],[cx-dw/4+.06,.15+dh,z+.04],.09,.03,WH))}
   p.push(pt(R(.9,.8,.06,.02,.012),RD2,[0,3.35,z]),pt(R(1.0,.08,.05,.01,.008),WH,[0,3.78,z+.02]),pt(R(1.0,.08,.05,.01,.008),WH,[0,2.93,z+.02]),pt(R(.08,.9,.05,.01,.008),WH,[.48,3.35,z+.02]),pt(R(.08,.9,.05,.01,.008),WH,[-.48,3.35,z+.02]),pt(R(.7,.18,.06,.02,.01),0xf2d27a,[0,3.0,z+.04]))}
  for(const [x,z] of [[-2.9,1.6],[-2.75,.6]]){const hb=cyl(.42,.42,.62,14);hb.rotateZ(Math.PI/2);p.push(pt(hb,0xe8c45e,[x,.42,z]));for(const sx of[-1,1]){const c=cyl(.3,.3,.02,12);c.rotateZ(Math.PI/2);p.push(pt(c,0xd9b04a,[x+sx*.31,.42,z]))}}
  p.push(pt(R(.56,.36,.4,.04,.03),0xe8c45e,[-2.85,.18,2.4]),pt(cyl(.32,.32,.05,14),C.W3,[2.8,.32,2.0],[0,0,Math.PI/2]));
  put('pr_barn',p,34)}
 /* 정자: 육각 마루(0.25) + 기둥 여섯 + 청록 육각 지붕 + 뒤 다섯 면 난간 + 안쪽 의자 */
 {const p=[],fl=cyl(2.32,2.38,.25,6);fl.rotateY(Math.PI/6);p.push(pt(fl,C.W2,[0,.125,0]));const tp=cyl(2.22,2.22,.03,6);tp.rotateY(Math.PI/6);p.push(pt(tp,C.W,[0,.255,0]));
  for(let i=-4;i<=4;i++)p.push(pt(box(.02,.01,3.8*Math.sqrt(1-(i/4.6)**2)),C.W2,[i*.46,.272,0]));
  const cp=k=>{const a=(30+60*k)*Math.PI/180;return[Math.sin(a)*2.12,Math.cos(a)*2.12]};
  for(let k=0;k<6;k++){const [x,z]=cp(k);p.push(pt(R(.17,2.5,.17,.03,.02),C.CR,[x,.25+1.25,z]),pt(R(.26,.12,.26,.03,.02),C.CR,[x,.31,z]))}
  for(let k=0;k<6;k++){const [x0,z0]=cp(k),[x1,z1]=cp((k+1)%6);p.push(lkBeam([x0,2.68,z0],[x1,2.68,z1],.14,.16,C.CR));const mz=(z0+z1)/2;if(Math.abs(Math.atan2((x0+x1)/2,mz))<Math.PI/6)continue;rail(p,[x0,z0],[x1,z1],.25,.25,.75,C.W2,3,.07);p.push(lkBeam([x0*.92,.62,z0*.92],[x1*.92,.62,z1*.92],.34,.06,C.W))}
  const rf=cyl(0,2.95,1.35,6);rf.rotateY(Math.PI/6);p.push(pt(rf,C.TL,[0,3.43,0]));const rr=cyl(2.95,2.95,.14,6);rr.rotateY(Math.PI/6);p.push(pt(rr,C.CR,[0,2.82,0]),pt(S(.16,10,8),C.CR,[0,4.15,0]),pt(cone(.06,.4,6),C.YL,[0,4.45,0]));
  p.push(pt(R(1.8,.09,.36,.03,.02),C.W2,[0,.12,2.42]),pt(cyl(.03,.03,.5,5),C.DK,[0,2.45,0]),pt(S(.13,10,8),0xffd88a,[0,2.15,0]));
  put('pr_gazebo',p,34)}
 /* 풍차: 둥근 돌탑 + 빨간 고깔 지붕 + 앞 날개 넷(부품 blades, 천천히 돌아요) */
 {const base=[],tw=cyl(1.05,1.45,4.2,10);base.push(pt(tw,0xe6dfd2,[0,2.1,0]));for(const y of[.3,1.6,3.0])base.push(pt(cyl(1.47-y*.095,1.48-y*.095,.12,10),C.ST2,[0,y,0]));
  base.push(pt(cone(1.4,1.5,10),0xb24a3c,[0,4.95,0]),pt(cyl(1.32,1.32,.14,10),C.CR,[0,4.25,0]),pt(S(.12,8,6),C.CR,[0,5.75,0]));door(base,0,0,1.42,.8,1.6,0x8a5a36);win(base,0,2.7,1.24,.35,.45,0,C.CR);win(base,1.12,1.9,.5,.3,.4,1.2,C.CR);
  base.push(pt(cyl(.14,.14,.6,10),C.WD,[0,4.3,1.25],[Math.PI/2,0,0]),pt(R(.9,.9,.5,.04,.03),C.W2,[0,4.3,1.2]));
  const bl=[pt(cyl(.2,.2,.24,12),C.DK,[0,0,0],[Math.PI/2,0,0])];for(let k=0;k<4;k++){const a=k*Math.PI/2+.4,c=Math.cos(a),s=Math.sin(a),g=[pt(box(.1,3.1,.08),C.WD,[0,1.65,0]),pt(box(.62,2.3,.03),0xf2ede2,[.33,2.0,.02])];for(let j=0;j<6;j++)g.push(pt(box(.66,.04,.05),C.W3,[.33,.9+j*.44,.04]));g.push(pt(box(.04,2.3,.05),C.W3,[.64,2.0,.04]));const m=mg(g);m.rotateZ(a);bl.push(pt(m,null,[0,0,0]))}
  lkModel('pr_windmill',base,{blades:{g:bl,pv:[0,4.3,1.55]}})}
 /* 물탱크 탑: 다리 넷 + X자 버팀 + 나무 통(쇠띠) + 고깔 지붕 + 사다리 */
 {const p=[],L=3.2;for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])p.push(lkBeam([x*1.05,0,z*1.05],[x*.9,L,z*.9],.16,.16,C.W3));
  for(const s of[-1,1]){for(const [y0,y1] of [[.3,1.6],[1.6,3.0]]){p.push(lkBeam([s*1.03,y0,-1.0],[s*.95,y1,.95],.07,.07,C.WD),lkBeam([s*1.03,y0,1.0],[s*.95,y1,-.95],.07,.07,C.WD),lkBeam([-1.0,y0,s*1.03],[.95,y1,s*.95],.07,.07,C.WD),lkBeam([1.0,y0,s*1.03],[-.95,y1,s*.95],.07,.07,C.WD))}}
  p.push(pt(R(2.3,.14,2.3,.03,.02),C.WD,[0,L,0]),pt(cyl(1.2,1.25,1.8,16),C.W,[0,L+.95,0]));for(let k=0;k<16;k++){const a=k/16*Math.PI*2;p.push(pt(box(.02,1.78,.02),C.W3,[Math.sin(a)*1.235,L+.95,Math.cos(a)*1.235]))}
  for(const y of[L+.35,L+.95,L+1.55])p.push(pt(cyl(1.27,1.27,.07,16),C.DK,[0,y,0]));p.push(pt(cone(1.4,.75,16),C.TL,[0,L+2.22,0]),pt(S(.1,8,6),C.CR,[0,L+2.62,0]));
  for(const sx of[-1,1])p.push(pt(box(.05,L+.2,.05),C.MT,[sx*.24,(L+.2)/2,1.12]));for(let i=0;i<10;i++)p.push(pt(box(.5,.04,.04),C.MT,[0,.3+i*.32,1.12]));
  p.push(pt(cyl(.07,.07,L,8),C.MT,[-.6,L/2,-.6]),pt(cyl(.09,.09,.2,8),C.MT,[-.6,.1,-.6]));put('pr_watertower',p,34)}
 /* 온실: 낮은 돌 기단 + 흰 틀 + 하늘빛 유리 + 박공 유리 지붕 + 문 옆 화분 */
 {const p=[],W=3.0,D=4.0,H=1.8;p.push(pt(R(W+.1,.4,D+.1,.04,.03),C.ST3,[0,.2,0]));
  for(const [x,z,w,d] of [[0,D/2,W,.05],[0,-D/2,W,.05],[W/2,0,.05,D],[-W/2,0,.05,D]])p.push(pt(R(w,H,d,.01,.008),0x8ec9da,[x,.4+H/2,z]));
  for(let i=0;i<=5;i++){const z=-D/2+i*D/5;for(const sx of[-1,1])p.push(pt(box(.07,H,.07),0xffffff,[sx*W/2,.4+H/2,z]))}
  for(let i=0;i<=3;i++){const x=-W/2+i*W/3;for(const sz of[-1,1])p.push(pt(box(.07,H,.07),0xffffff,[x,.4+H/2,sz*D/2]))}
  for(const y of[.4+H*.5,.4+H])for(const sx of[-1,1])p.push(pt(box(.06,.06,D),0xffffff,[sx*W/2,y,0]));
  {const r=[];gable(r,D+.1,W,.4+H,1.0,.06,0x9fd2e0,0x8ec9da,4,.04);r.forEach(g=>{g.rotateY(Math.PI/2);p.push(g)})}
  for(let i=0;i<=5;i++){const z=-D/2+i*D/5;for(const sx of[-1,1])p.push(lkBeam([sx*W/2,.4+H,z],[0,.4+H+1.0,z],.06,.06,0xffffff))}p.push(pt(box(.08,.08,D+.1),0xffffff,[0,.4+H+1.02,0]));
  for(const sz of[-1,1]){const t=tri(W,1.0,.04,0x8ec9da);t.translate(0,.4+H,sz*D/2);p.push(t)}
  p.push(pt(R(.8,1.6,.06,.01,.008),0xffffff,[0,.4+.8,D/2+.03]),pt(R(.66,1.46,.04,.01,.008),0xd3edf2,[0,.4+.8,D/2+.05]));
  for(let i=0;i<4;i++){const x=-1.0+i*.65;p.push(pt(R(.5,.32,.6,.04,.03),0xb5653e,[x,.56,-1.2]),pt(S(.22,8,6),[C.LV,C.LV3,C.LV2][i%3],[x,.86,-1.2],0,[1,.8,1]))}
  for(const [x,c] of [[-1.1,0xe0533f],[1.1,0xf7c948]]){p.push(pt(cyl(.16,.12,.28,10),0xc96f4a,[x,.14,D/2+.35]),pt(S(.2,8,6),C.LV,[x,.38,D/2+.35],0,[1,.8,1]),pt(S(.06,6,4),c,[x+.08,.48,D/2+.4]))}
  put('pr_greenhouse',p,30)}
 /* 버스 정류장: 콘크리트 바닥 + 청록 틀·밝은 유리 뒤판 + 비스듬한 지붕 + 나무 의자 + 둥근 정류장 표지 + 시간표판 + 쓰레기통 */
 {const p=[];p.push(pt(R(3.4,.1,1.5,.03,.02),0xc4c2bb,[0,.05,0]));for(const sx of[-1,1])for(const z of[-.55,.55]){if(z>0)continue;p.push(pt(R(.08,2.3,.08,.02,.012),C.TL,[sx*1.5,.1+1.15,z]))}
  p.push(pt(R(2.96,1.6,.04,.01,.008),C.GL,[0,1.1,-.52]),pt(R(3.06,.08,.08,.02,.012),C.TL,[0,1.92,-.52]),pt(R(3.06,.08,.08,.02,.012),C.TL,[0,.3,-.52]));
  for(const sx of[-1,1])p.push(pt(R(.04,1.6,.72,.01,.008),C.GL,[sx*1.5,1.1,-.18]),pt(R(.08,.08,.8,.02,.012),C.TL,[sx*1.5,1.92,-.16]));
  p.push(lkBeam([0,2.4,-.68],[0,2.2,.62],3.3,.08,C.CR),pt(R(3.4,.12,.06,.02,.012),C.TL,[0,2.18,.62]));
  for(let i=0;i<3;i++)p.push(pt(R(2.2,.05,.12,.02,.012),C.W,[0,.56,-.33+i*.14]));for(const x of[-.9,.9])p.push(pt(R(.06,.46,.36,.02,.012),C.DK,[x,.33,-.2]));p.push(pt(R(2.2,.38,.04,.02,.012),C.W,[0,.82,-.47]));
  p.push(pt(cyl(.05,.05,2.5,8),C.MT,[1.85,1.25,.5]),pt(cyl(.32,.32,.05,18),C.YL,[1.85,2.4,.5],[Math.PI/2,0,0]),pt(cyl(.26,.26,.055,18),0xffffff,[1.85,2.4,.5],[Math.PI/2,0,0]),pt(R(.24,.14,.06,.03,.01),C.NV,[1.85,2.42,.53]),pt(cyl(.03,.03,.07,8),C.DK,[1.78,2.34,.53],[Math.PI/2,0,0]),pt(cyl(.03,.03,.07,8),C.DK,[1.92,2.34,.53],[Math.PI/2,0,0]));
  p.push(pt(R(.6,.8,.04,.02,.01),0xffffff,[-.9,1.35,-.49]));for(let i=0;i<5;i++)p.push(pt(box(.44,.03,.01),0xb5b0a6,[-.9,1.6-i*.12,-.47]));
  p.push(pt(cyl(.2,.17,.6,12),0x5f9a6a,[-1.95,.4,.35]),pt(cyl(.21,.21,.05,12),C.DK,[-1.95,.72,.35]));
  put('pr_busstop',p,30)}
 /* 캠핑 트레일러: 둥근 크림 몸통 + 청록 띠 + 창·문·바퀴·연결고리 + 줄무늬 차양 + 접이 의자 둘·작은 탁자 */
 {const p=[],CRM=0xf3ead7;p.push(pt(R(3.8,1.85,1.95,.55,.4),CRM,[0,1.4,0]),pt(R(3.82,.32,1.97,.12,.1),C.TL,[0,1.15,0]),pt(R(3.84,.06,1.99,.02,.02),0xffffff,[0,1.34,0]));
  for(const x of[-1.15,1.15])win(p,x,1.75,.99,.6,.42);win(p,-1.92,1.75,0,.5,.4,-Math.PI/2);door(p,.1,.55,1.0,.7,1.55,C.TL);p.push(pt(R(.7,.08,.32,.03,.02),C.MT,[.1,.42,1.15]));
  for(const sz of[-1,1]){const wh=cyl(.36,.36,.22,14);wh.rotateX(Math.PI/2);p.push(pt(wh,0x2b2f36,[-.3,.36,sz*.92]),pt(cyl(.16,.16,.24,10),C.MT,[-.3,.36,sz*.93],[Math.PI/2,0,0]),pt(R(1.1,.1,.12,.04,.02),C.TL,[-.3,.78,sz*.96]))}
  p.push(lkBeam([1.9,.55,-.5],[2.6,.45,0],.08,.08,C.DK),lkBeam([1.9,.55,.5],[2.6,.45,0],.08,.08,C.DK),pt(cyl(.04,.04,.45,6),C.DK,[2.6,.22,0]),pt(cyl(.12,.12,.04,10),C.DK,[2.6,.02,0]));
  for(let i=0;i<7;i++)p.push(lkBeam([-1.6+i*.46,2.12,.98],[-1.6+i*.46,1.85,2.25],.46,.03,i%2?CRM:C.TL));for(const x of[-1.55,1.15])p.push(pt(cyl(.025,.025,1.85,6),C.MT,[x,.92,2.22]));
  for(const [x,c] of [[-1.05,0xe0533f],[1.45,0xf2c230]]){p.push(lkBeam([x-.22,0,2.0],[x+.22,.5,2.3],.04,.04,C.MT),lkBeam([x+.22,0,2.0],[x-.22,.5,2.3],.04,.04,C.MT),pt(R(.46,.04,.4,.04,.02),c,[x,.48,2.15]),pt(R(.46,.45,.04,.04,.02),c,[x,.72,2.36],[-.15,0,0]))}
  p.push(pt(cyl(.32,.32,.04,14),C.W,[.2,.62,2.45]),pt(cyl(.03,.03,.6,6),C.MT,[.2,.31,2.45]),pt(cyl(.07,.07,.16,8),C.DK,[.2,.72,2.45]),pt(S(.05,6,4),0xffd88a,[.2,.74,2.45]));
  put('pr_camper',p,30)}
 /* 장터 가판대: 나무 틀 + 빨강·크림 줄무늬 차양 + 판매대 위 과일 상자 + 칠판 */
 {const p=[];for(const [x,z] of [[-1.2,-.6],[1.2,-.6],[-1.2,.6],[1.2,.6]])p.push(pt(R(.1,z<0?2.3:2.0,.1,.02,.012),C.W3,[x,z<0?1.15:1.0,z]));
  p.push(pt(R(2.5,.9,.7,.04,.03),C.W2,[0,.45,.25]));planks(p,-1.25,1.25,-.1,.6,.93,.05,'x',C.W,C.W2,.24);
  for(let i=0;i<8;i++)p.push(lkBeam([-1.25+i*.3125+.156,2.32,-.68],[-1.25+i*.3125+.156,1.92,.95],.31,.03,i%2?C.CR:C.RD));
  for(let i=0;i<8;i++)p.push(pt(S(.08,8,5),i%2?C.CR:C.RD,[-1.1+i*.3125,1.88,.97],0,[1.8,.7,.6]));
  for(const [x,c] of [[-.8,0xe0533f],[0,0xf29a50],[.8,0x8bc34a]]){p.push(pt(R(.6,.2,.4,.03,.02),C.W3,[x,1.0,.2]));for(let k=0;k<7;k++)p.push(pt(S(.07,8,6),c,[x-.18+(k%4)*.12,1.13+(k>3?.06:0),.12+(k>3?.1:0)]))}
  p.push(pt(R(2.4,.06,.32,.02,.012),C.W2,[0,1.4,-.5]));for(let i=0;i<5;i++)p.push(pt(cyl(.07,.06,.18,8),[0xf7c948,C.CR,0xe0533f,C.TL,0x9b7be0][i],[-.9+i*.45,1.52,-.5]));
  p.push(lkBeam([1.6,0,.9],[1.75,1.0,.65],.05,.05,C.W3),lkBeam([2.0,0,.75],[1.8,1.0,.62],.05,.05,C.W3),pt(R(.52,.68,.04,.03,.02),0x2f3a33,[1.78,.62,.74],[-.22,.35,0]),pt(R(.42,.04,.02,.01,.005),0xffffff,[1.78,.72,.76],[-.22,.35,0]));
  put('pr_stall',p,30)}
 /* 이정표·우편함: 나무 기둥 + 색 화살표 판 셋(글자 없음) + 빨간 우편함 + 꽃 */
 {const p=[];p.push(pt(R(.14,2.3,.14,.03,.02),C.W3,[0,1.15,0]),pt(cone(.12,.18,4),C.W3,[0,2.39,0],[0,Math.PI/4,0]));
  for(const [y,a,c] of [[2.0,.3,C.TL],[1.7,2.6,0xf2c230],[1.4,-.9,C.RD]]){const g=[pt(R(.8,.2,.05,.03,.02),c,[.45,0,0]),pt(cone(.14,.2,3),c,[.92,0,0],[0,0,-Math.PI/2],[1,1,.25]),pt(R(.5,.04,.055,.01,.008),C.CR,[.4,0,0])];const m=mg(g);m.rotateY(a);m.translate(0,y,0);p.push(pt(m,null,[0,0,0]))}
  p.push(pt(R(.08,1.0,.08,.02,.012),C.W3,[.55,.5,.25]),pt(R(.32,.3,.5,.12,.04),C.RD,[.55,1.12,.25]),pt(R(.04,.24,.04,.01,.008),C.YL,[.73,1.3,.2]),pt(R(.04,.08,.14,.01,.008),C.YL,[.73,1.42,.26]));
  {const q=[];[[-.25,.2,0xf28ab2],[-.15,-.25,0xffffff],[.25,-.2,0xf7c948],[.0,.3,0x9b7be0]].forEach(([x,z,c])=>flower(q,x,z,c,.2));p.push(...q)}
  put('pr_signpost',p,34)}
}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{prModels()}catch(e){console.error('props: 52차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
