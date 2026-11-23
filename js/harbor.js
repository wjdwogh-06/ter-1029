/* 71차(디자인, 기획자 11-23 16:33): 항구
   ① 생선 상인 → 생선 자판기: 판매대 + 뒤에 선 사람(fbuy + fbuy_npc) 대신 자판기 한 대(fbuy, 모양 hb_fvend).
      하는 일은 그대로(가방의 일반·희귀 날물고기를 원래 가격에 사요, ui.js 48차 창). 자리는 재활용 쓰레기통 바로 옆(없으면 자판기 옆 → 둘레).
      기획자가 나중에 관리자 [구조물 배치]로 다시 놓을 예정.
   ② 항구 지형지물(롱빈터처럼 몇몇 항구에 언덕·바위): 바위 언덕(hb_bluff, 막힘) · 풀 둔덕(hb_terrace, 앞 돌계단으로 올라감) ·
      풀 언덕(hb_knoll, 걸어 올라감) · 해안 바위(hb_shore, 막힘). 항구마다 1~2개를 부두 길·부활 자리·자판기 앞·길·배를 비켜 자동으로 놓아요.
      모두 월드 구조물이라 관리자 [구조물 배치]로 옮기거나 지울 수 있어요(올라서는 높이는 props.js PRF 방식 그대로).
      항구 설치 금지 원·안전 구역(PORT_SAFE) 크기에는 넣지 않아요. 동북섬(겨울) 항구는 눈 덮인 모양. */

const HBC={rk:0xb9b3a8,rk2:0xa39d92,rk3:0xcfc9bd,rk4:0x958f85,gr:0x7cbf5a,gr2:0x6aae4c,gr3:0x8fcc66,ms:0x7fa65a,dt:0xa77b52,
 tk:0x8a5a36,lf:0x5f9a45,lf2:0x6fae4d,lf3:0x82c25c,sn:0xf3f7fb,sn2:0xdfe8f1,sn3:0xc9d6e3,
 bl:0x2f6fae,bl2:0x27598c,cr:0xf7f0e3,or:0xf28c38,cn:0xc9c4b8,dk:0x26313c,gd:0xf2c230,rd:0xe0533f,ice:0xbfe3ea};
const hbH=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};

/* ---------------- ① 생선 자판기 ---------------- */
Object.assign(DECO.fbuy,{g:'hb_fvend',bx:.66,bz:.5,n:'생선 자판기'});
function hbFvendGeo(){const C=HBC,R=(w,h,d,c=.05,b=.025)=>lkRb(w,h,d,c,b),S=(r,a=10,b=7)=>new THREE.SphereGeometry(r,a,b),p=[];
 p.push(pt(R(1.32,.12,1.0,.04,.02),C.cn,[0,.06,0]));                                   // 받침
 p.push(pt(R(1.16,1.78,.8,.1,.045),C.bl,[0,1.01,-.02]));                               // 몸통
 p.push(pt(R(1.22,.07,.86,.04,.02),C.bl2,[0,1.92,-.02]),pt(R(1.18,.1,.82,.04,.02),C.cr,[0,.17,-.02]));   // 위 테·아래 띠
 // 왼쪽 큰 진열창: 크림 틀 + 얼음빛 유리 + 얼음 위 생선 두 줄
 p.push(pt(R(.78,1.06,.05,.05,.02),C.cr,[-.15,1.2,.39]),pt(R(.66,.94,.03,.04,.012),C.ice,[-.15,1.2,.415]));
 for(const y of [.86,1.3]){p.push(pt(R(.62,.04,.05,.015,.01),C.cr,[-.15,y,.44]));
  for(let i=0;i<6;i++)p.push(pt(S(.055,8,5),i%2?0xffffff:0xe8f4f8,[-.42+i*.11,y+.04,.45],0,[1,.55,.7]));
  for(let k=0;k<2;k++){const x=-.31+k*.3,c=(k+(y>1?1:0))%2?C.or:0xc9d3dc,b=pt(S(.1,10,7),c,[x,y+.13,.46],0,[1.25,.55,.32]),t=cone(.075,.12,4);t.rotateZ(Math.PI/2);
   p.push(b,pt(t,c,[x+.17,y+.13,.46],0,[1,1,.35]),pt(S(.018,6,4),C.dk,[x-.07,y+.15,.49]))}}
 // 오른쪽 조작판: 금액 화면·단추 셋·동전 넣는 곳
 p.push(pt(R(.3,1.0,.04,.04,.015),C.bl2,[.39,1.2,.395]),pt(R(.22,.13,.03,.02,.01),0x2f5a3a,[.39,1.55,.42]),pt(R(.16,.03,.01,.01,.004),0x8fe3a0,[.39,1.56,.437]));
 [[C.or,1.36],[C.cr,1.25],[C.rd,1.14]].forEach(([c,y])=>{const g=cyl(.04,.04,.035,10);g.rotateX(Math.PI/2);p.push(pt(g,c,[.39,y,.425]))});
 p.push(pt(R(.14,.1,.03,.02,.01),C.cr,[.39,.98,.42]),pt(box(.07,.012,.01),C.dk,[.39,.99,.437]));
 // 아래 꺼내는 곳(어두운 구멍 + 크림 턱)
 p.push(pt(R(.86,.26,.04,.04,.015),C.cr,[0,.44,.39]),pt(R(.74,.17,.03,.03,.01),C.dk,[0,.45,.41]));
 // 위 간판: 파란 테 + 크림 판 + 주황 물고기 + 금화
 p.push(pt(R(1.32,.54,.1,.1,.03),C.bl2,[0,2.17,.08]),pt(R(1.2,.44,.06,.08,.02),C.cr,[0,2.17,.14]));
 {const f=pt(S(.13,12,8),C.or,[-.16,2.17,.18],0,[1.9,1,.4]),t=cone(.11,.17,4);t.rotateZ(Math.PI/2);
  p.push(f,pt(t,C.or,[-.48,2.17,.18],0,[1,1,.4]),pt(S(.025,6,4),C.dk,[-.01,2.2,.22]),pt(cone(.04,.08,3),0xe07a2a,[-.18,2.29,.18],[0,0,-.3],[1,1,.4]));
  const coin=cyl(.11,.11,.035,16);coin.rotateX(Math.PI/2);const ci=cyl(.075,.075,.04,14);ci.rotateX(Math.PI/2);
  p.push(pt(coin,C.gd,[.34,2.17,.18]),pt(ci,0xe0ad24,[.34,2.17,.185]),pt(box(.03,.08,.01),0xfff1b0,[.34,2.17,.207]))}
 // 옆에 걸린 구명환(주황·흰)
 for(let k=0;k<4;k++){const g=new THREE.TorusGeometry(.19,.055,6,8,Math.PI/2);g.rotateZ(k*Math.PI/2);g.rotateY(Math.PI/2);p.push(pt(g,k%2?0xffffff:C.or,[.6,1.3,-.02]))}
 p.push(pt(box(.02,.06,.06),C.dk,[.6,1.51,-.02]));
 return mg(p)}

const hbFvFits=(x,z,p)=>{const bx=DECO.fbuy.bx,bz=DECO.fbuy.bz,x0=x-bx,x1=x+bx,z0=z-bz,z1=z+bz;let lo=1e9,hi=-1e9;
 for(let u=0;u<=4;u++)for(let v=0;v<=5;v++){const px=x0-.25+(x1-x0+.5)*u/4,pz=z0-.25+(z1-z0+1.9)*v/5,h=hAt(px,pz);if(h<1.0||onDock(px,pz))return false;if(pz<=z1+.3){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
 if(hi-lo>.2)return false;
 for(const q of structs){if(Math.abs(q.x-x)>14||Math.abs(q.z-z)>14)continue;const d=sdef(q);if(d.pass)continue;
  if(q.t==='vend'||q.t==='recycle'){if(q.x+d.bx>x0-.22&&q.x-d.bx<x1+.22&&q.z+d.bz>z0-.22&&q.z-d.bz<z1+.22)return false;continue}
  const e=Math.max(d.bx,d.bz),C=.9;if(q.x+e>x0-C&&q.x-e<x1+C&&q.z+e>z0-C&&q.z-e<z1+C+1.2)return false}
 for(const P2 of PORTS)for(const [qx,qz,qr] of P2.pp||[])if(qx+qr>x0-.9&&qx-qr<x1+.9&&qz+qr>z0-.9&&qz-qr<z1+2.1)return false;
 for(const b of PBOATS)if(Math.abs(b.m.position.x-x)<6.5&&Math.abs(b.m.position.z-z)<6.5)return false;
 if(p&&!p.town){const w=(p.v&&p.v.w)||2.8;for(const [cx,cz] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],[x,z]]){const ex=cx-p.x,ez=cz-p.z,lx=ex*p.dz-ez*p.dx,lz=ex*p.dx+ez*p.dz;if(Math.abs(lx)<w/2+1.4&&lz>-16)return false}}
 return true};
placeFishBuyer=function(p){const v=structs.find(q=>q.t==='vend'&&q.pi===p.i),rc=structs.find(q=>q.t==='recycle'&&q.pi===p.i),B=DECO.fbuy,C=[];
 if(rc)C.push([rc.x+DECO.recycle.bx+.32+B.bx,rc.z+DECO.recycle.bz-B.bz]);
 if(v)C.push([v.x-DECO.vend.bx-.32-B.bx,v.z+DECO.vend.bz-B.bz]);
 const o=rc||v||p;for(let r=2.5;r<=14;r+=.75)for(let k=0;k<20;k++){const a=k/20*Math.PI*2;C.push([o.x+Math.cos(a)*r,o.z+Math.sin(a)*r])}
 for(const [x,z] of C)if(hbFvFits(x,z,p)){addStruct({t:'fbuy',x,z,r:0,pi:p.i,hp:1e9});return true}
 console.warn('생선 자판기 자리를 못 찾음',p.n);return false};
/* 이름표·창 제목: '생선 자판기'(사람은 없어서 ui.js 48차의 상인 만들기·'생선 상인' 알약은 저절로 안 생겨요) */
{const _sl=sLabel;sLabel=function(s){if(s.t==='fbuy')return'생선 자판기';return _sl(s)}}
{const _ft=findTarget;findTarget=function(){const t=_ft();if(t&&t.k==='s'&&t.s&&t.s.t==='fbuy')t.lab='생선 자판기';return t}}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel==='fishbuy'){const t=$('ptabs').querySelector('.tab');if(t)t.textContent='🐟 생선 자판기'}}}

/* ---------------- ② 항구 지형지물 ---------------- */
const HB_PLAN={0:['hb_bluff','hb_knoll'],1:['hb_knoll','hb_shore'],2:['hb_bluff','hb_shore'],3:['hb_terrace','hb_shore'],4:['hb_knoll','hb_terrace'],5:['hb_bluff','hb_terrace'],6:['hb_terrace','hb_knoll'],7:['hb_bluff','hb_shore']};
const HB_T={
 hb_bluff:{n:'바위 언덕',fx:4.6,fz:2.3,blk:1},
 hb_terrace:{n:'풀 둔덕',fx:3.45,fz:2.95},
 hb_knoll:{n:'풀 언덕',fx:4.7,fz:3.7},
 hb_shore:{n:'해안 바위',fx:2.7,fz:1.5,blk:1}};
for(const [t,o] of Object.entries(HB_T))for(const w of ['','_w'])DECO[t+w]=Object.assign({g:t+w,s:1,n:o.n,cat:'🌿 '+o.n+(w?'(눈)':''),bx:o.fx,bz:o.fz,hp:1e9},o.blk?{}:{pass:1});
/* 울퉁불퉁한 둥근 테두리(초타원 + 물결), 둘레를 같은 간격으로 나눈 점(+바깥쪽 방향), 점이 안에 있나, 테두리 모양 판 */
const hbOutline=(hx,hz,n,amp,seed)=>{const P=[];for(let k=0;k<96;k++){const a=k/96*Math.PI*2,c=Math.cos(a),s=Math.sin(a),f=1+amp*(Math.sin(3*a+seed)*.6+Math.sin(5*a+seed*2.3)*.4);P.push([Math.sign(c)*Math.abs(c)**(2/n)*hx*f,Math.sign(s)*Math.abs(s)**(2/n)*hz*f])}return P};
const hbAlong=(P,sp)=>{const L=[0];for(let i=1;i<=P.length;i++){const a=P[i-1],b=P[i%P.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}const T=L[L.length-1],n=Math.max(6,Math.round(T/sp)),out=[];let j=0;
 for(let k=0;k<n;k++){const d=(k+.5)*T/n;while(L[j+1]<d)j++;const a=P[j],b=P[(j+1)%P.length],t=(d-L[j])/(L[j+1]-L[j]),tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1;out.push([a[0]+tx*t,a[1]+tz*t,tz/tl,-tx/tl])}return out};
const hbPip=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,zi]=P[i],[xj,zj]=P[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c}return c};
const hbSlab=(P,y0,y1,col)=>{const sh=new THREE.Shape();P.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.02,y1-y0),bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return pt(g,col,[0,0,0])};
/* 깎은 바위 덩어리: 각진 면(로우폴리), 바닥·윗면은 납작, 폭 w·높이 h·깊이 d(바닥 y=0) */
const hbChunk=(w,h,d,seed,c)=>{const g=new THREE.IcosahedronGeometry(1,1),P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),f=1+.14*Math.sin(x*3.3+seed)+.1*Math.sin(y*4.1+seed*1.7)+.1*Math.sin(z*3.9+seed*2.9),yy=Math.min(Math.max(y*f,-.8),.62);P.setXYZ(i,x*f*w/2,(yy+.8)/1.42*h,z*f*d/2)}g.computeVertexNormals();return pt(g,c,[0,0,0])};
const HB_BLUFF=hbOutline(4.4,2.15,3.2,.08,1.3),HB_TER_CZ=-.675,HB_TER=hbOutline(3.32,2.05,4.6,.035,2.1),HB_TERW=HB_TER.map(([x,z])=>[x*.93,z*.93+HB_TER_CZ]);
/* 올라서는 높이(props.js PRF): 풀 둔덕 = 윗면 1.0 + 앞 오른쪽 돌계단 네 칸, 풀 언덕 = 꼭대기 1.15(나무 기둥은 벽) */
const HB_TROCK=[[.72,2.8,.32],[2.6,2.85,.36],[.7,1.9,.28],[2.62,1.75,.26],[-3.5,1.4,.44],[3.6,.9,.38],[-3.6,-1.2,.34]],HB_KROCK=[[2.6,-1.2,.58],[3.3,-.3,.38],[2.1,-2.0,.32]];
const hbTerF=(x,z)=>{for(const [a,b,r] of HB_TROCK)if((x-a)**2+(z-b)**2<r*r)return PRW;if(x>=.95&&x<=2.35&&z>.9&&z<=2.95){if(z<=1.35&&hbPip(HB_TERW,x,z))return 1;return Math.min(1,prStair(z,2.95,1.35,4,1))}if(hbPip(HB_TERW,x,z)){if((x+2.25)**2+(z+1.75)**2<.14)return PRW;return 1}return null};
const hbKnH=(x,z)=>{const t=(x/4.5)**2+(z/3.5)**2;if(t>=1)return 0;const s=1-t;return 1.5*s*s*(3-2*s)};
const hbKnF=(x,z)=>{if((x/4.5)**2+(z/3.5)**2>=1)return null;if((x+1.1)**2+(z+.7)**2<.12)return PRW;for(const [a,b,r] of HB_KROCK)if((x-a)**2+(z-b)**2<r*r)return PRW;return hbKnH(x,z)};
for(const w of ['','_w']){PRF['hb_terrace'+w]={R:4.6,f:hbTerF};PRF['hb_knoll'+w]={R:4.8,f:hbKnF}}

function hbModels(){const C=HBC,R=(w,h,d,c=.12,b=.08)=>lkRb(w,h,d,c,b),S=(r,a=10,b=7)=>new THREE.SphereGeometry(r,a,b),IC=(r,d=0)=>new THREE.IcosahedronGeometry(r,d);
 for(const snow of [0,1]){const W=snow?'_w':'',G1=snow?C.sn:C.gr2,G2=snow?C.sn2:C.gr,G3=snow?C.sn3:C.gr3,MS=snow?C.sn2:C.ms,ROCK=[C.rk,C.rk2,C.rk3,C.rk4];
  const tree=(p,x,y,z,s)=>{p.push(pt(cyl(.09*s,.13*s,1.1*s,7),C.tk,[x,y+.55*s,z]));
    [[0,1.35,0,.62],[.28,1.1,.18,.42],[-.26,1.15,-.12,.44],[.05,1.75,.04,.4]].forEach(([a,b,c,r],i)=>{p.push(pt(IC(r*s,1),[C.lf,C.lf2,C.lf3,C.lf2][i],[x+a*s,y+b*s,z+c*s],0,[1,.85,1]));
     if(snow)p.push(pt(S(r*s*.82,9,5,),C.sn,[x+a*s,y+b*s+r*s*.38,z+c*s],0,[1.05,.42,1.05]))})};
  const tuft=(p,x,y,z,s=1)=>{for(let k=0;k<3;k++)p.push(pt(cone(.06*s,.36*s,4),[G1,G2,G3][k],[x+(k-1)*.07*s,y+.16*s,z+(k%2)*.05],[0,0,(k-1)*.3]))};
  const flowers=(p,x,y,z,n,seed)=>{if(snow)return;for(let i=0;i<n;i++){const a=hbH(seed,i)*6.28,r=.15+hbH(i,seed)*.5,fx=x+Math.cos(a)*r,fz=z+Math.sin(a)*r;
    p.push(pt(cyl(.012,.012,.2,4),C.lf,[fx,y+.1,fz]),pt(S(.055,7,5),[0xf28ab2,0xffffff,0xf7c948,0x9b7be0][i%4],[fx,y+.21,fz],0,[1,.6,1]))}};
  /* 바위 층: 울퉁불퉁한 둥근 테두리를 따라 깎은 바위 덩어리(앞·옆만, 뒤는 카메라에서 안 보여서 속 채움만) */
  const tier=(p,O,sc,y0,h,seed,skip)=>{const Q=O.map(([x,z])=>[x*sc,z*sc]);
    for(const [x,z,nx,nz] of hbAlong(Q,1.0)){if(nz<-.55||(skip&&skip(x,z,nx,nz)))continue;const i=Math.round((x+9)*7+(z+9)*13)+seed,r1=hbH(i,seed),r2=hbH(seed,i),w=1.15+r1*.45,d=1.0+r2*.4,hh=h*(.9+r2*.22);
     const g=hbChunk(w,hh,d,i*.7,ROCK[(i>>1)%4]);g.rotateY(Math.atan2(nx,nz));g.translate(x-nx*d*.28,y0-.02,z-nz*d*.28);p.push(g)}
    p.push(hbSlab(Q.map(([x,z])=>[x*.86,z*.86]),Math.max(y0,-.2),y0+h-.14,C.rk2))};
  const ledge=(p,O,sc,y,n,seed)=>{for(const [x,z,nx,nz] of hbAlong(O.map(([a,b])=>[a*sc,b*sc]),.8)){if(nz<.15)continue;const k=Math.round(x*5+z*3)+seed;if(hbH(k,seed)>.62)continue;
    p.push(pt(S(.17+hbH(seed,k)*.08,7,5),MS,[x-nx*.28,y,z-nz*.28],0,[1.6,.42,1.1]));if(hbH(k,3)>.7)tuft(p,x-nx*.3,y,z-nz*.3)}};
  const topGrass=(p,O,sc,y,seed)=>{const Q=O.map(([x,z])=>[x*sc,z*sc]);p.push(hbSlab(Q,y-.12,y+.04,G1));
    for(const [x,z,nx,nz] of hbAlong(Q,.55)){if(nz<-.4)continue;const k=hbH(x*3,z*3);p.push(pt(S(.15+k*.06,8,6),k>.5?G2:G1,[x+nx*.02,y-.05,z+nz*.02],0,[1.3,.62,1.1]))}
    for(let i=0;i<12;i++){const x=(hbH(i,seed)-.5)*1.7,z=(hbH(seed,i)-.5)*1.5,X=x*Math.abs(Q[0][0])*.9,Z=z*Math.abs(Q[24][1])*.9;if(!hbPip(Q,X,Z))continue;p.push(pt(S(.22,9,6),[G2,G3,G1][i%3],[X,y,Z],0,[1.3,.5,1.1]))}};
  /* 바위 언덕(막힘): 약 9×4.4, 세 층 + 풀 덮개 + 작은 나무 둘 */
  {const p=[],O=HB_BLUFF;tier(p,O,1,-.3,1.35,1);tier(p,O,.88,.95,.95,5);tier(p,O,.76,1.82,.62,9);
   ledge(p,O,.95,1.05,0,2);ledge(p,O,.83,1.86,0,6);const top=2.44;topGrass(p,O,.76,top,4);
   tree(p,-2.1,top,-.55,1.15);tree(p,2.35,top,-.4,.8);
   p.push(pt(IC(.38,1),snow?C.sn2:C.lf2,[.9,top+.25,.55],0,[1.3,.8,1.1]),pt(IC(.3,1),snow?C.sn:C.lf3,[-.6,top+.22,.75],0,[1.3,.75,1]));flowers(p,.3,top+.06,.2,6,3);
   for(const [x,z,w,h,d,s] of [[-3.7,2.0,1.0,.55,.8,1],[3.5,1.95,1.1,.6,.9,3],[4.3,1.1,.8,.45,.7,4],[1.1,2.1,.7,.38,.6,5],[-4.3,.8,.8,.48,.7,6]]){const g=hbChunk(w,h,d,s*1.9,ROCK[s%4]);g.translate(x,-.06,z);p.push(g)}
   for(const [x,z] of [[-3.0,2.45],[2.4,2.5],[4.5,2.0],[-1.4,2.4]])tuft(p,x,0,z);
   GEO['hb_bluff'+W]=mg(p)}
  /* 풀 둔덕(올라감): 윗면 약 6.6×4.1(높이 1.0, 걷는 곳 = 풀 덮개 모양) + 앞 오른쪽 돌계단 네 칸 */
  {const p=[],O=HB_TER,cz=HB_TER_CZ,q=[];tier(q,O,1,-.3,1.27,13,(x,z,nx,nz)=>nz>.35&&x>.6&&x<2.7);ledge(q,O,.97,1.0,0,7);topGrass(q,O,.95,1.0,9);
   q.forEach(g=>{g.translate(0,0,cz);p.push(g)});
   p.push(pt(R(1.42,1.3,.6,.06,.04),C.rk2,[1.65,.35,1.12]),pt(R(1.3,.06,.5,.04,.02),snow?C.sn2:0xdcd6ca,[1.65,1.0,1.12]));
   for(let k=1;k<=4;k++){const z=2.95-(k-.5)*.4,y=k*.25;p.push(pt(R(1.42,y+.3,.42,.06,.04),k%2?C.rk3:C.rk,[1.65,y/2-.15,z]),pt(R(1.3,.06,.36,.04,.02),snow?C.sn2:0xdcd6ca,[1.65,y,z]))}
   for(const [x,z,r] of HB_TROCK){const g=hbChunk(r*2.1,r*1.6,r*1.9,x*3+z,ROCK[Math.abs(Math.round(x*7))%4]);g.translate(x,-.06,z);p.push(g)}
   tree(p,-2.25,1.0,-1.75,1.0);
   p.push(pt(IC(.34,1),snow?C.sn2:C.lf2,[-1.0,1.2,-2.1],0,[1.3,.8,1.1]),pt(IC(.26,1),snow?C.sn:C.lf3,[2.4,1.16,-2.0],0,[1.3,.75,1]));
   flowers(p,-.4,1.02,-.6,7,8);flowers(p,1.6,1.02,-1.4,5,11);tuft(p,.3,1.0,.3);tuft(p,-1.6,1.0,.2);tuft(p,-3.6,0,1.7);tuft(p,3.6,0,1.6);
   GEO['hb_terrace'+W]=mg(p)}
  /* 풀 언덕(걸어 올라감): 9×7 둥근 언덕, 꼭대기 1.15 + 나무 한 그루 + 옆 바위 */
  {const p=[],NX=30,NZ=24,g=new THREE.PlaneGeometry(9.4,7.4,NX,NZ);g.rotateX(-Math.PI/2);const P=g.attributes.position,col=[];
   for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),t=(x/4.5)**2+(z/3.5)**2,h=t>=1?null:hbKnH(x,z);P.setY(i,h==null?-.12:h+.002);
    const n=hbH(Math.round(x*3),Math.round(z*3)),c=new THREE.Color(snow?(n>.7?C.sn3:h>.6?C.sn:C.sn2):(n>.72?0x6aae4c:h!=null&&h>.8?0x64a748:0x5c9c42)).convertSRGBToLinear();col.push(c.r,c.g,c.b)}
   g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();p.push(pt(g,null,[0,0,0]));
   tree(p,-1.1,hbKnH(-1.1,-.7)-.05,-.7,1.25);
   for(const [x,z,r,s] of [[2.6,-1.2,.62,1],[3.3,-.3,.42,2],[2.1,-2.0,.36,3],[3.6,1.2,.3,4],[-3.4,1.5,.34,5]]){const h=hbKnH(x,z);p.push(lkBoulder(r,ROCK[s%4],s*2.3,[x,h-.12,z],.75))}
   for(let i=0;i<9;i++){const a=i*2.3,r=.6+hbH(i,9)*2.2,x=Math.cos(a)*r*1.2,z=Math.sin(a)*r*.9,h=hbKnF(x,z);if(h==null||h>=PRW)continue;tuft(p,x,h-.03,z,.9)}
   flowers(p,.9,hbKnH(.9,.8)-.02,.8,6,4);flowers(p,-2.0,hbKnH(-2.0,1.2)-.02,1.2,5,6);
   GEO['hb_knoll'+W]=mg(p)}
  /* 해안 바위(막힘): 깎은 바위 덩어리 여섯 + 이끼 */
  {const p=[];for(const [x,z,w,h,d,s] of [[-1.2,0,1.9,1.3,1.7,1],[.55,-.2,2.2,1.6,2.0,2],[1.85,.5,1.2,.85,1.1,3],[-2.15,.65,.9,.62,.85,4],[.1,1.0,.85,.55,.8,5],[2.35,-.6,.75,.5,.7,6]]){const g=hbChunk(w,h,d,s*2.7,ROCK[s%4]);g.rotateY(s*.9);g.translate(x,-.12,z);p.push(g);
    p.push(pt(S(Math.min(w,d)*.3,9,6),MS,[x-.05,h*.92-.12,z-.05],0,[1.2,.3,1]))}
   for(const [x,z] of [[-2.0,1.2],[1.2,1.25],[2.6,.4]])tuft(p,x,0,z,.8);
   GEO['hb_shore'+W]=mg(p)}}
 GEO.hb_fvend=hbFvendGeo()}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{hbModels()}catch(e){console.error('harbor 모델',e)}try{lkAOnew(b0)}catch(e){}}}

/* 놓을 자리 고르기: 항구 둘레 34m 안, 땅 평평, 부두 길·부활 자리·배·소품·길·다른 구조물 비킴 */
const HB={list:[],miss:[]};
function hbFits(t,x,z,p){const T=HB_T[t],fx=T.fx,fz=T.fz,shore=t==='hb_shore';let lo=1e9,hi=-1e9,low=0;
 if(dist(x,z,p.x,p.z)>34)return false;
 const w=p.town?12:((p.v&&p.v.w)||2.8),cor=Math.max(w/2+4.5,7.2),fwMax=p.town?34:27,ix=-p.dx,iz=-p.dz;
 for(const [cx,cz] of [[x-fx,z-fz],[x+fx,z-fz],[x-fx,z+fz],[x+fx,z+fz],[x,z],[x-fx,z],[x+fx,z],[x,z-fz],[x,z+fz]]){const ex=cx-p.x,ez=cz-p.z,li=ex*ix+ez*iz,ls=-ex*iz+ez*ix;if(Math.abs(ls)<cor&&li>-34&&li<fwMax)return false}
 for(let u=0;u<=8;u++)for(let v=0;v<=6;v++){const px=x-fx-.6+(2*fx+1.2)*u/8,pz=z-fz-.6+(2*fz+1.2)*v/6,h=hAt(px,pz);if(onDock(px,pz))return false;
  if(h<(shore?.55:.98))return false;if(h<1)low++;const inF=Math.abs(px-x)<=fx&&Math.abs(pz-z)<=fz;if(inF){lo=Math.min(lo,h);hi=Math.max(hi,h)}
  if(typeof pathD==='function'&&pathD(px,pz)<2.6)return false}
 if(hi-lo>(shore?.62:.3))return false;if(shore&&low<6)return false;
 for(const q of structs){if(Math.abs(q.x-x)>32||Math.abs(q.z-z)>32)continue;const d=sdef(q);if(!d)continue;const e=Math.max(d.bx||0,d.bz||0),M=q.t==='ferry'?2.5:1.6;
  if(Math.abs(q.x-x)<fx+e+M&&Math.abs(q.z-z)<fz+e+M)return false}
 for(const P2 of PORTS)for(const [qx,qz,qr] of P2.pp||[])if(Math.abs(qx-x)<fx+qr+1.3&&Math.abs(qz-z)<fz+qr+1.3)return false;
 for(const b of PBOATS)if(dist(b.m.position.x,b.m.position.z,x,z)<Math.max(fx,fz)+6)return false;
 for(const D of DOCKS)if(dist(D.x,D.z,x,z)<Math.max(fx,fz)+Math.max(D.hw,D.hl)+1.5)return false;
 if(typeof PLANT_SITES!=='undefined')for(const q of PLANT_SITES)if(dist(q.x,q.z,x,z)<(q.r||22)+Math.max(fx,fz)+2)return false;
 if(typeof supD==='function'&&supD(x,z)<16)return false;if(typeof lhD==='function'&&lhD(x,z)<16)return false;
 return true}
function hbPlace(){HB.list.length=0;HB.miss.length=0;
 for(const p of PORTS){const plan=HB_PLAN[p.i]||[],ix=-p.dx,iz=-p.dz,lx=-iz,lz=ix,snow=p.i===2;
  for(const t of plan){const C=[];const want=t==='hb_shore'?[11,3]:t==='hb_bluff'?[15,16]:[13,10];
   for(let fw=-8;fw<=30;fw+=1)for(let sd=6;sd<=28;sd+=1)for(const sg of [1,-1]){const x=p.x+ix*fw+lx*sd*sg,z=p.z+iz*fw+lz*sd*sg;C.push([x,z,Math.abs(sd-want[0])+Math.abs(fw-want[1])*.7+(sg<0?.3:0)+hbH(p.i,sd*31+fw)*1.5])}
   C.sort((a,b)=>a[2]-b[2]);let ok=false;
   for(const [x,z] of C){if(!hbFits(t,x,z,p))continue;const r=t==='hb_shore'?(hbH(x,z)-.5)*1.2:0,s=addStruct({t:t+(snow?'_w':''),x,z,r,pi:p.i,hp:1e9,hb:1});HB.list.push(s);
    if(typeof CLEARS!=='undefined')CLEARS.push([x,z,Math.hypot(HB_T[t].fx,HB_T[t].fz)+.8]);ok=true;break}
   if(!ok)HB.miss.push(p.n+' '+HB_T[t].n)}}
 if(HB.miss.length)console.warn('항구 지형지물 자리를 못 찾음',HB.miss)}
{const _bp=buildPorts;buildPorts=function(){_bp();try{hbPlace()}catch(e){console.error('harbor 배치',e)}}}
/* 항구 설치 금지 원(= 안전 구역 표 PORT_SAFE)은 지형지물·수달섬 다리(nobx)를 셈에서 빼요 */
{const _nb=buildNoBuild;buildNoBuild=function(){const hide=structs.filter(s=>s.hb||s.nobx);for(const s of hide)structs.splice(structs.indexOf(s),1);try{_nb()}finally{structs.push(...hide)}}}
