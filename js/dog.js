/* =====================================================================
   26차(디자인): 골든 리트리버 캐릭터 + 시작 화면에서 캐릭터 고르기
   기획자: '파티 애니멀즈 스타일, 골든 리트리버 모티브, 엄청 고퀄로. 등신을 나누기보다 몸통과 머리로만 나눈 느낌,
            움직일 때 파티 애니멀즈처럼 늘어지는 느낌' (롱빈터 느낌은 꼭 넣지 않아도 됨)
   - 모양: 머리와 몸통이 목 없이 이어진 큰 콩 모양 + 짧고 통통한 팔다리를 거리 함수(SDF) 하나로 만들고 Surface Nets로 메시로.
     이음매 없는 봉제 인형 곡면 + 털 결 색(노이즈) + 틈 음영(SDF AO) + 가장자리가 보송하게 밝아지는 털 셰이더(림 라이트).
   - 움직임: 한 장의 피부(SkinnedMesh)가 강아지 뼈대를 따라 부드럽게 휘어요. 강아지 뼈대는 원래 캐릭터(KayKit) 뼈의
     애니메이션 회전을 스프링으로 늦게 따라가요 → 몸통이 늦게 따라오며 출렁, 머리 흔들, 팔 덜렁, 뒤뚱 걷기, 멈출 때 출렁.
     다리는 그대로 따라가서 발이 미끄러지지 않아요. 손에 든 도구(holder)는 강아지 앞발로 옮겨 붙여요.
     원래 몸은 숨기고 원래 뼈대는 보이지 않게 애니메이션만 받아요 → actors.js·ui.js는 안 고쳐요.
   - 덧붙인 움직임: 꼬리 흔들기, 귀 출렁임, 눈 깜박임, 혀, 숨쉬기, 찌그러졌다 펴지는 몸.
   - 몸 두 가지(기획자가 준 파티 애니멀즈 참고 화면): 'dog' = 큰 머리 + 서양배 몸 + 아주 짧은 다리, 'dog2' = 같은데 다리가 더 긴 것.
     털은 겉털 껍질(shell) 몇 겹으로 가장자리를 보송보송하게. 눈은 적당히 단순하게(작은 검은 눈 + 반짝 점 하나).
   - 고르기: 타이틀 화면의 캐릭터 카드 → localStorage 'frontisle_char' ('hero' | 'dog' | 'dog2'). 게임 저장 형식은 그대로예요.
   - 멀티: 지금은 내 캐릭터만 바뀌어요(다른 사람에게는 원래 캐릭터로 보여요. 서버에 고른 캐릭터를 보내는 건 규칙 담당).
   ===================================================================== */
const DOG={sel:'hero',GS:{},RIGS:{},R:null,list:[],t:0,FL:.03,NS:2};
try{const v=localStorage.getItem('frontisle_char');DOG.sel=['dog','dog2','cat'].includes(v)?v:'hero'}catch(e){}

/* ---------- 작은 수학 도구 ---------- */
function dgH(i,j,k){let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(k,1440662683))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function dgN(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz),L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(dgH(i,j,k),dgH(i+1,j,k),u),L(dgH(i,j+1,k),dgH(i+1,j+1,k),u),v),L(L(dgH(i,j,k+1),dgH(i+1,j,k+1),u),L(dgH(i,j+1,k+1),dgH(i+1,j+1,k+1),u),v),w)}
const dgSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const dgC=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return [c.r,c.g,c.b]},dgMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
/* 부드러운 합치기(smooth min)·빼기(smooth max) */
const dgS=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25},dgX=(a,b,k)=>-dgS(-a,-b,k);
/* 타원체(근사 거리) */
function dgE(x,y,z,cx,cy,cz,rx,ry,rz){const px=(x-cx)/rx,py=(y-cy)/ry,pz=(z-cz)/rz,k0=Math.sqrt(px*px+py*py+pz*pz),qx=px/rx,qy=py/ry,qz=pz/rz,k1=Math.sqrt(qx*qx+qy*qy+qz*qz);return k1<1e-9?-Math.min(rx,ry,rz):k0*(k0-1)/k1}
/* 두 점을 잇는 둥근 원뿔(양 끝 반지름 r1·r2) — iq sdRoundCone */
function dgRC(x,y,z,ax,ay,az,bx,by,bz,r1,r2){const bax=bx-ax,bay=by-ay,baz=bz-az,l2=bax*bax+bay*bay+baz*baz,rr=r1-r2,a2=l2-rr*rr,il2=1/l2,pax=x-ax,pay=y-ay,paz=z-az,yv=pax*bax+pay*bay+paz*baz,zv=yv-l2,
 qx=pax*l2-bax*yv,qy=pay*l2-bay*yv,qz=paz*l2-baz*yv,x2=qx*qx+qy*qy+qz*qz,y2=yv*yv*l2,z2=zv*zv*l2,k=Math.sign(rr)*rr*rr*x2;
 if(Math.sign(zv)*a2*z2>k)return Math.sqrt(x2+z2)*il2-r2;if(Math.sign(yv)*a2*y2<k)return Math.sqrt(x2+y2)*il2-r1;return (Math.sqrt(x2*a2*il2)+yv*rr)*il2-r1}
/* 선분까지 거리 */
function dgSeg(x,y,z,ax,ay,az,bx,by,bz){const bax=bx-ax,bay=by-ay,baz=bz-az,pax=x-ax,pay=y-ay,paz=z-az,h=Math.max(0,Math.min(1,(pax*bax+pay*bay+paz*baz)/(bax*bax+bay*bay+baz*baz)));return Math.hypot(pax-bax*h,pay-bay*h,paz-baz*h)}
function dgPoly(x,y,z,P){let d=1e9;for(let i=0;i<P.length-1;i++)d=Math.min(d,dgSeg(x,y,z,P[i][0],P[i][1],P[i][2],P[i+1][0],P[i+1][1],P[i+1][2]));return d}
function dgGrad(F,x,y,z,e){const gx=F(x+e,y,z)-F(x-e,y,z),gy=F(x,y+e,z)-F(x,y-e,z),gz=F(x,y,z+e)-F(x,y,z-e),l=Math.hypot(gx,gy,gz)||1;return [gx/l,gy/l,gz/l]}
/* 광선을 따라가다 곡면에 닿는 점 */
function dgRay(F,o,d){let t=0;for(let i=0;i<200;i++){const x=o[0]+d[0]*t,y=o[1]+d[1]*t,z=o[2]+d[2]*t,f=F(x,y,z);if(f<.0005)return [x,y,z];t+=Math.max(f*.8,.002)}return o}
/* 점을 곡면 위로 끌어당기기(뉴턴 몇 번) */
function dgProj(F,p,it=8){let [x,y,z]=p;for(let i=0;i<it;i++){const f=F(x,y,z),g=dgGrad(F,x,y,z,.002);x-=g[0]*f;y-=g[1]*f;z-=g[2]*f}return [x,y,z]}

/* ---------- Surface Nets: 거리 함수 → 매끈한 메시 ---------- */
function dgNets(F,C,b0,b1,cell,AO){
 const nx=Math.ceil((b1[0]-b0[0])/cell)+3,ny=Math.ceil((b1[1]-b0[1])/cell)+3,nz=Math.ceil((b1[2]-b0[2])/cell)+3,ox=b0[0]-cell,oy=b0[1]-cell,oz=b0[2]-cell,V=new Float32Array(nx*ny*nz);
 let q=0;for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)V[q++]=F(ox+i*cell,oy+j*cell,oz+k*cell);
 const id=(i,j,k)=>i+nx*(j+ny*k),cx=nx-1,cy=ny-1,cz=nz-1,cid=new Int32Array(cx*cy*cz).fill(-1),P=[],cv=new Float32Array(8),
  E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
 for(let k=0;k<cz;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++){let m=0;for(let c=0;c<8;c++){const v=V[id(i+(c&1),j+((c>>1)&1),k+((c>>2)&1))];cv[c]=v;if(v<0)m|=1<<c}if(m===0||m===255)continue;
  let sx=0,sy=0,sz=0,n=0;for(const[a,b]of E){const va=cv[a],vb=cv[b];if((va<0)!==(vb<0)){const t=va/(va-vb);sx+=(a&1)+(((b&1)-(a&1))*t);sy+=((a>>1)&1)+((((b>>1)&1)-((a>>1)&1))*t);sz+=((a>>2)&1)+((((b>>2)&1)-((a>>2)&1))*t);n++}}
  cid[i+cx*(j+cy*k)]=P.length/3;P.push(ox+(i+sx/n)*cell,oy+(j+sy/n)*cell,oz+(k+sz/n)*cell)}
 const nv=P.length/3,pos=new Float32Array(P.length),nor=new Float32Array(P.length),col=new Float32Array(P.length),e=cell*.3;
 for(let v=0;v<nv;v++){let x=P[v*3],y=P[v*3+1],z=P[v*3+2];const x0=x,y0=y,z0=z;for(let it=0;it<2;it++){const f=F(x,y,z),g=dgGrad(F,x,y,z,e);x-=g[0]*f;y-=g[1]*f;z-=g[2]*f}
  if(Math.hypot(x-x0,y-y0,z-z0)>cell){x=x0;y=y0;z=z0}const g=dgGrad(F,x,y,z,e);pos[v*3]=x;pos[v*3+1]=y;pos[v*3+2]=z;nor[v*3]=g[0];nor[v*3+1]=g[1];nor[v*3+2]=g[2];
  let c=C(x,y,z,g[0],g[1],g[2]);const ao=AO?dgAO(AO,x,y,z,g):1;col[v*3]=c[0]*ao;col[v*3+1]=c[1]*ao;col[v*3+2]=c[2]*ao}
 const I=[],ci=(i,j,k)=>cid[i+cx*(j+cy*k)],quad=(a,b,c,d,keep)=>{if(a<0||b<0||c<0||d<0)return;if(keep)I.push(a,b,c,a,c,d);else I.push(a,c,b,a,d,c)};
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const in0=V[id(i,j,k)]<0;
  if(i<nx-1&&j>0&&k>0&&j<ny-1&&k<nz-1&&in0!==(V[id(i+1,j,k)]<0))quad(ci(i,j-1,k-1),ci(i,j,k-1),ci(i,j,k),ci(i,j-1,k),in0);
  if(j<ny-1&&i>0&&k>0&&i<nx-1&&k<nz-1&&in0!==(V[id(i,j+1,k)]<0))quad(ci(i-1,j,k-1),ci(i-1,j,k),ci(i,j,k),ci(i,j,k-1),in0);
  if(k<nz-1&&i>0&&j>0&&i<nx-1&&j<ny-1&&in0!==(V[id(i,j,k+1)]<0))quad(ci(i-1,j-1,k),ci(i,j-1,k),ci(i,j,k),ci(i-1,j,k),in0)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(I);return g}
/* 틈 음영: 몸 전체 거리 함수로 법선 방향을 몇 번 찍어 봐요 */
function dgAO(F,x,y,z,n){let o=0,w=1;for(let i=1;i<=5;i++){const d=.03*i,f=F(x+n[0]*d,y+n[1]*d,z+n[2]*d);o+=Math.max(0,d-f)*w;w*=.62}return Math.max(.52,Math.min(1,1-o*2.6))}

/* ---------- 색 ---------- */
const DGC={gold:dgC(0xd4913c),goldD:dgC(0xb87228),goldDD:dgC(0x9c5d22),goldL:dgC(0xe6b56c),cream:dgC(0xf1d39c),nose:dgC(0x231a17),mouth:dgC(0x5a2a22),
 pad:dgC(0x4b302a),red:dgC(0xd6372b),redD:dgC(0xa52a22),white:dgC(0xfff2e2)};
function dgFur(c,x,y,z,s=1){const n=1+s*(.07*(dgN(x*14+3,y*14,z*14)-.5)*2+.05*(dgN(x*48,y*10+7,z*48)-.5)*2);return [c[0]*n,c[1]*n,c[2]*n]}
const dgNz=(x,y,z,f,a)=>a*(dgN(x*f,y*f,z*f)-.5);

/* ---------- 두 가지 몸(기획자 11-18: 파티 애니멀즈 느낌 그대로 + 다리가 좀 더 긴 것) ----------
   hip: 엉덩이 뼈 높이, legTop/knee/ankle: 다리 관절, sh: 어깨 높이, hy: 머리 가운데 높이, T: 몸통 타원 둘(아래 배, 위 가슴) */
const DGV={
 dog:{n:'골든 리트리버',hip:.34,legTop:.36,knee:.22,ankle:.1,sh:1.13,hy:1.66,T:[[0,.62,0,.47,.48,.41],[0,1.08,0,.385,.32,.345]],tk:.26,legR:[.155,.15]},
 cat:{n:'치즈 고양이',sp:'cat',eye:[.063,.074,.036],hip:.32,legTop:.34,knee:.21,ankle:.1,sh:1.1,hy:1.62,ax:.05,lx:.17,T:[[0,.6,0,.535,.5,.46],[0,1.05,0,.43,.33,.38]],tk:.28,legR:[.178,.166],earK:.3,wag:[1.7,2.4,.3],twitch:1},
 dog2:{n:'리트리버 · 긴 다리',hip:.62,legTop:.64,knee:.38,ankle:.14,sh:1.2,hy:1.74,T:[[0,.91,0,.42,.37,.375],[0,1.16,0,.365,.29,.33]],tk:.22,legR:[.152,.138]}};
function dgBones(V){const c=V.sh-.17,h=V.hy-.38,b=[['root',null,0,0,0],['hips','root',0,V.hip,0],['spine','hips',0,(V.hip+c)/2,0],['chest','spine',0,c,0],['head','chest',0,h,0]];
 const A=V.ax||0,X=V.lx||.15;
 for(const[s,L]of[[1,'l'],[-1,'r']])b.push(['upperarm'+L,'chest',s*(.29+A),V.sh,0],['lowerarm'+L,'upperarm'+L,s*(.5+A),V.sh-.005,-.005],['wrist'+L,'lowerarm'+L,s*(.7+A),V.sh-.005,0],['hand'+L,'wrist'+L,s*(.75+A),V.sh-.005,0],['handslot'+L,'hand'+L,s*(.815+A),V.sh-.05,0]);
 for(const[s,L]of[[1,'l'],[-1,'r']])b.push(['upperleg'+L,'hips',s*X,V.legTop,0],['lowerleg'+L,'upperleg'+L,s*X,V.knee,.005],['foot'+L,'lowerleg'+L,s*X,V.ankle,-.015],['toes'+L,'foot'+L,s*X,.025,.07]);return b}
/* 스프링(늘어지고 출렁이는 움직임): [고유 진동수 ω, 감쇠 ζ, 애니메이션에서 벗어날 수 있는 최대 각도]. 다리는 그대로(발 미끄러짐 방지) */
const DGSP={spine:[12,.42,.3],chest:[10.5,.38,.3],head:[8,.3,.42],upperarml:[11,.4,.6],lowerarml:[12.5,.42,.5],wristl:[13,.45,.4],handl:[14,.5,.4],upperarmr:[11,.4,.6],lowerarmr:[12.5,.42,.5],wristr:[13,.45,.4],handr:[14,.5,.4]};

/* ---------- 모양(모델 공간: T 자세, 정면 +z, 발바닥 y=0) ----------
   큰 머리가 목 없이 서양배 모양 몸통 위에 얹힌 봉제 인형 + 몸통 옆으로 늘어진 굵은 팔 + 짧은 다리 */
function dgShapes(V){
 const S={},Q=DOG.q||1,HY=V.hy;
 const headM=(x,y,z)=>{const Y=y-HY;let h=dgE(x,Y,z,0,0,-.03,.47,.43,.44);h=dgS(h,dgE(x,Y,z,0,.11,.05,.39,.29,.34),.08);
  h=dgS(h,Math.min(dgE(x,Y,z,.21,-.17,.15,.19,.16,.2),dgE(x,Y,z,-.21,-.17,.15,.19,.16,.2)),.1);
  h=dgS(h,dgE(x,Y,z,0,-.17,.37,.18,.135,.235),.065);h=dgS(h,dgE(x,Y,z,0,-.1,.32,.12,.07,.17),.06);
  h=dgS(h,Math.min(dgE(x,Y,z,.085,-.255,.385,.09,.07,.11),dgE(x,Y,z,-.085,-.255,.385,.09,.07,.11)),.04);h=dgS(h,dgE(x,Y,z,0,-.29,.3,.12,.065,.13),.06);
  h=dgS(h,Math.min(dgE(x,Y,z,.15,.035,.335,.085,.045,.07),dgE(x,Y,z,-.15,.035,.335,.085,.045,.07)),.05);
  h=dgS(h,dgE(x,Y,z,0,.42,-.07,.12,.065,.1),.06);h=dgS(h,dgE(x,Y,z,.095,.4,0,.085,.05,.075),.05);h=dgS(h,dgE(x,Y,z,-.085,.405,.03,.08,.05,.07),.05);
  h=dgS(h,Math.min(dgE(x,Y,z,.37,-.25,-.12,.12,.14,.15),dgE(x,Y,z,-.37,-.25,-.12,.12,.14,.15)),.08);return h};
 const T0=V.T[0],T1=V.T[1],torsoB=(x,y,z)=>dgS(dgE(x,y,z,...T0),dgE(x,y,z,...T1),V.tk),core=(x,y,z)=>dgS(torsoB(x,y,z),headM(x,y,z),.18);
 const cz=dgRay(torsoB,[0,T1[1]-.06,1.5],[0,0,-1])[2];
 const torso=(x,y,z)=>{let d=torsoB(x,y,z);for(const[px,py,pz,rx,ry,rz]of[[0,.12,-.05,.17,.13,.1],[.11,.01,-.03,.115,.12,.09],[-.11,.01,-.03,.115,.12,.09],[0,-.08,-.02,.12,.1,.08]])d=dgS(d,dgE(x,y,z,px,T1[1]-.06+py,cz+pz,rx,ry,rz),.05);return d};
 const limbs=(x,y,z)=>{const ax=Math.abs(x),sh=V.sh;let a=dgRC(ax,y,z,.24,sh,0,.7,sh-.008,0,.152,.132);let p=dgE(ax,y,z,.775,sh-.01,.005,.152,.142,.152);
  for(const[zz,yy]of[[-.07,.015],[0,.025],[.07,.015]])p=dgS(p,dgE(ax,y,z,.885,sh-.01+yy,zz,.056,.056,.053),.03);a=dgS(a,p,.06);
  let l=dgRC(ax,y,z,.15,V.legTop+.05,0,.15,V.ankle+.03,0,V.legR[0],V.legR[1]);let f=dgE(ax,y,z,.15,.078,.05,.155,.088,.19);
  for(const[xx,zz]of[[.084,.2],[.15,.218],[.216,.2]])f=dgS(f,dgE(ax,y,z,xx,.072,zz,.054,.056,.058),.03);l=dgS(l,f,.05);return dgS(a,l,.001)};
 const body0=(x,y,z)=>dgS(dgS(torso(x,y,z),headM(x,y,z),.18),limbs(x,y,z),.07);
 /* 얼굴: 코·입(다문 입 + 살짝 웃는 입꼬리)·눈 자리(곡면 위) */
 const R0=(x,y)=>dgRay(headM,[x,y,1.5],[0,0,-1]),nTip=R0(0,HY-.11),lipY=HY-.255;
 const MP=[R0(0,nTip[1]-.058),R0(0,lipY+.01)],MC=[R0(.045,lipY+.002),R0(.085,lipY+.008),R0(.115,lipY+.022)],MCr=MC.map(p=>[-p[0],p[1],p[2]]);
 const mouthD=(x,y,z)=>Math.min(dgPoly(x,y,z,MP),dgPoly(x,y,z,[MP[1],...MC]),dgPoly(x,y,z,[MP[1],...MCr]));
 const body=(x,y,z)=>{let d=body0(x,y,z);if(y>HY-.4&&z>.2)d=dgX(d,.008-mouthD(x,y,z),.01);return d+dgNz(x,y,z,28,.004)};
 const neckY=(()=>{let best=HY-.4,br=9;for(let y=T1[1];y<HY;y+=.01){const r=dgRay(core,[1,y,0],[-1,0,0])[0];if(r<br){br=r;best=y}}return best})();
 S.body={F:body,F0:body0,b0:[-.97,-.04,-.6],b1:[.97,HY+.52,.7],cell:.034/Q,skin:1,shell:1,
  C:(x,y,z,nx,ny,nz)=>{const ax=Math.abs(x);let c;
   if(y>neckY){c=dgMix(DGC.gold,DGC.goldD,Math.min(1,dgSm(HY+.12,HY+.42,y)*.55+dgSm(-.05,-.4,z)*.3));const m=dgE(x,y-HY,z,0,-.175,.39,.21,.165,.26);c=dgMix(c,DGC.goldL,(1-dgSm(-.03,.06,m))*.8);
    c=dgMix(c,DGC.goldL,dgSm(-.25,-.75,ny)*dgSm(0,.25,z)*.6*dgSm(HY-.1,HY-.3,y))}
   else{c=dgMix(DGC.gold,DGC.goldD,dgSm(-.05,-.32,z)*.35);c=dgMix(c,DGC.goldL,dgSm(.1,.3,z)*dgSm(T0[1]-.3,T0[1],y)*.55)}
   c=dgFur(c,x,y,z);if(ny<-.55&&ax>.68&&Math.abs(y-V.sh)<.17)c=dgMix(c,DGC.pad,dgSm(-.55,-.8,ny));if(y<.06&&ny<-.7)c=DGC.pad;
   if(y>HY-.4&&z>.2)c=dgMix(c,DGC.mouth,(1-dgSm(.006,.016,mouthD(x,y,z)))*.9);return c}};
 const NY=nTip[1]+.004,NZ=nTip[2]+.008;
 S.nose={F:(x,y,z)=>{let d=dgE(x,y,z,0,NY,NZ,.088,.062,.06);d=dgS(d,dgE(x,y,z,0,NY-.045,NZ-.006,.042,.032,.044),.026);return dgX(d,.012-Math.min(Math.hypot(x-.037,y-NY+.012,z-NZ-.055),Math.hypot(x+.037,y-NY+.012,z-NZ-.055)),.008)},
  b0:[-.11,NY-.11,NZ-.09],b1:[.11,NY+.08,NZ+.1],cell:.013/Q,bone:'head',gloss:1,C:(x,y,z,nx,ny)=>dgMix(DGC.nose,[.3,.26,.24],dgSm(.55,.95,ny)*.4)};
 S.eyes=[1,-1].map(s=>{const p=dgRay(headM,[s*.175,HY-.025,1.5],[0,0,-1]),n=dgGrad(headM,p[0],p[1],p[2],.003);return {p,n}});
 /* 귀: 크고 보송한 늘어진 귀(아래 가장자리 깃털) */
 const ear=s=>(x,y,z)=>{x*=s;const Y=y-HY;let d=dgE(x,Y,z,.405,.14,-.05,.075,.1,.14);d=dgS(d,dgE(x,Y,z,.48,-.09,-.025,.082,.21,.18),.1);d=dgS(d,dgE(x,Y,z,.505,-.31,-.005,.078,.125,.158),.1);
  for(const[zz,yy]of[[-.095,-.39],[-.005,-.415],[.085,-.395]])d=dgS(d,dgE(x,Y,z,.51,yy,zz,.058,.07,.06),.04);return d+dgNz(x,y,z,34,.003)};
 const earC=s=>(x,y,z,nx)=>{let c=dgMix(DGC.goldD,DGC.goldDD,dgSm(HY-.14,HY-.42,y)*.6);c=dgMix(c,DGC.gold,dgSm(.2,-.6,nx*s)*.35);return dgFur(c,x,y,z,1.2)};
 for(const s of[1,-1])S['ear'+(s>0?'L':'R')]={F:ear(s),C:earC(s),b0:s>0?[.31,HY-.52,-.26]:[-.63,HY-.52,-.26],b1:s>0?[.63,HY+.27,.19]:[-.31,HY+.27,.19],cell:.026/Q,bone:'head',piv:[s*.39,HY+.17,-.05],shell:1};
 /* 꼬리: 엉덩이 뒤에서 위로 말려 올라간 깃털 꼬리 */
 const ty=V.hip+.2,tb=dgRay(torsoB,[0,ty,-1.5],[0,0,1]),T=[0,ty-.02,tb[2]+.06],TP=[[0,0,0],[0,.06,-.13],[0,.18,-.26],[0,.35,-.32],[0,.51,-.3]].map(p=>[p[0],p[1]+T[1],p[2]+T[2]]),TR=[.074,.092,.105,.093,.058];
 const tailCore=(x,y,z)=>{let d=1e9;for(let i=0;i<TP.length-1;i++)d=dgS(d,dgRC(x,y,z,...TP[i],...TP[i+1],TR[i],TR[i+1]),.04);return d};
 S.tail={F:(x,y,z)=>{let d=tailCore(x,y,z);for(const[py,pz,r]of[[.06,-.22,.062],[.17,-.35,.074],[.32,-.41,.07],[.46,-.39,.056]])d=dgS(d,dgE(x,y,z,0,T[1]+py,T[2]+pz,r*.9,r*1.3,r),.05);return d+dgNz(x,y,z,28,.004)},
  b0:[-.18,T[1]-.14,T[2]-.56],b1:[.18,T[1]+.64,T[2]+.12],cell:.024/Q,bone:'hips',piv:T,shell:1,
  C:(x,y,z,nx,ny,nz)=>{const t=dgSm(-.01,.05,tailCore(x,y,z)+.02);let c=dgMix(DGC.goldD,DGC.gold,dgSm(T[1],T[1]+.3,y));c=dgMix(c,DGC.goldL,t*.6);return dgFur(c,x,y,z,1.2)}};
 /* 빨간 반다나: 머리와 몸이 만나는 곳(가장 가는 높이)을 두르는 띠 + 앞 삼각 + 뒤 매듭 */
 const core2=(x,y,z)=>dgS(torso(x,y,z),headM(x,y,z),.18),BY=neckY,bx=dgRay(core2,[1,BY,0],[-1,0,0])[0],bzf=dgRay(core2,[0,BY,1.5],[0,0,-1])[2],bzb=dgRay(core2,[0,BY,-1.5],[0,0,1])[2],bcz=(bzf+bzb)/2,brz=(bzf-bzb)/2;
 const fy0=BY-.13,fz0=dgRay(core2,[0,fy0,1.5],[0,0,-1])[2];
 const band=(x,y,z)=>{const a=.12,c=Math.cos(a),s=Math.sin(a),py=y-BY,pz=z-bcz,ly=py*c-pz*s,lz=py*s+pz*c,R=(bx+brz)/2+.02;let d=Math.hypot(Math.hypot(x/(bx+.02),lz/(brz+.02))*R-R,ly/1.3)-.03;
  const fa=.38,fy=y-(fy0+.02),fz=z-(fz0+.028),uy=fy*Math.cos(fa)-fz*Math.sin(fa),uz=fy*Math.sin(fa)+fz*Math.cos(fa);
  const tri=Math.max(Math.abs(x)-.62*(uy+.15),-uy-.15,uy-.1);d=dgS(d,Math.max(tri,Math.abs(uz)-.016)-.014,.03);
  const kz=bzb-.01;d=dgS(d,dgE(x,y,z,0,BY+.02,kz,.06,.048,.045),.02);d=dgS(d,dgRC(x,y,z,.02,BY,kz-.01,.065,BY-.1,kz-.03,.026,.016),.015);d=dgS(d,dgRC(x,y,z,-.02,BY,kz-.01,-.055,BY-.09,kz-.025,.026,.016),.015);return d};
 S.band={F:band,b0:[-.46,BY-.32,bzb-.18],b1:[.46,BY+.14,bzf+.18],cell:.02/Q,skin:1,bodyOnly:1,noao:1,
  C:(x,y,z,nx,ny)=>{const u=Math.atan2(x,z-bcz)*3.4,v=y*15+(z>bcz?0:.5),du=u-Math.floor(u)-.5,dv=v-Math.floor(v)-.5;let c=dgMix(DGC.red,DGC.redD,dgSm(.3,-.6,ny)*.55);if(du*du+dv*dv<.04)c=DGC.white;return c}};
 S.all=(x,y,z)=>Math.min(body0(x,y,z),S.earL.F(x,y,z),S.earR.F(x,y,z),S.tail.F(x,y,z));
 S.neckY=neckY;return S}

/* ---------- 29차: 푸짐한 치즈 고양이(기획자: '캐릭터 하나 더, 좀 더 푸짐하게, 이번엔 고양이') ----------
   리트리버와 같은 방식(SDF → 메시, 같은 뼈대·스프링). 동그란 머리 + 통통한 볼, 납작한 얼굴(짧은 주둥이·볼록한 수염 자리),
   분홍 코·ω 입, 똑바로 선 세모 귀(안쪽 분홍), 흰 수염, 치즈 줄무늬(이마·볼·등·팔·꼬리), 흰 가슴·배·앞발·뒷발, 분홍 젤리 발바닥,
   더 넓고 통통한 서양배 몸, 굵은 팔다리, 길고 굵은 S자 꼬리, 청록 줄무늬 반다나. */
const DGK={or:dgC(0xeb9a48),orD:dgC(0xc4652a),orL:dgC(0xf5bb7a),wh:dgC(0xfbf3e8),whS:dgC(0xeee2d2),nose:dgC(0xee8d97),mouth:dgC(0x6b3a33),bean:dgC(0xea93a0),
 earIn:dgC(0xf4adb5),tl:dgC(0x2e9ea6),tlD:dgC(0x20777e),eyeR:dgC(0x2a1d18)};
function dgPolyT(x,y,z,P){let best=1e9,bs=0,acc=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],L=Math.hypot(bx,by,bz),h=Math.max(0,Math.min(1,((x-a[0])*bx+(y-a[1])*by+(z-a[2])*bz)/(L*L))),d=Math.hypot(x-a[0]-bx*h,y-a[1]-by*h,z-a[2]-bz*h);if(d<best){best=d;bs=acc+L*h}acc+=L}return [best,bs,acc]}
function dgShapesCat(V){
 const S={},Q=DOG.q||1,HY=V.hy,A=V.ax,X=V.lx;
 const headM=(x,y,z)=>{const Y=y-HY;let h=dgE(x,Y,z,0,.02,-.04,.5,.43,.44);h=dgS(h,dgE(x,Y,z,0,.13,.07,.37,.27,.32),.08);
  h=dgS(h,Math.min(dgE(x,Y,z,.24,-.13,.08,.25,.2,.25),dgE(x,Y,z,-.24,-.13,.08,.25,.2,.25)),.12);
  h=dgS(h,Math.min(dgE(x,Y,z,.45,-.16,-.01,.11,.085,.11),dgE(x,Y,z,-.45,-.16,-.01,.11,.085,.11)),.08);
  h=dgS(h,Math.min(dgE(x,Y,z,.068,-.165,.35,.088,.07,.088),dgE(x,Y,z,-.068,-.165,.35,.088,.07,.088)),.05);
  h=dgS(h,dgE(x,Y,z,0,-.06,.35,.075,.065,.1),.06);h=dgS(h,dgE(x,Y,z,0,-.245,.3,.08,.05,.085),.05);return h};
 const T0=V.T[0],T1=V.T[1],torsoB=(x,y,z)=>dgS(dgE(x,y,z,...T0),dgE(x,y,z,...T1),V.tk),cz=dgRay(torsoB,[0,T1[1]-.06,1.5],[0,0,-1])[2];
 const torso=(x,y,z)=>{let d=torsoB(x,y,z);for(const[px,py,pz,rx,ry,rz]of[[0,.13,-.05,.19,.13,.1],[.13,.02,-.03,.125,.12,.09],[-.13,.02,-.03,.125,.12,.09],[0,-.08,-.02,.13,.1,.08]])d=dgS(d,dgE(x,y,z,px,T1[1]-.06+py,cz+pz,rx,ry,rz),.05);return d};
 const limbs=(x,y,z)=>{const ax=Math.abs(x),sh=V.sh;let a=dgRC(ax,y,z,.24+A,sh,0,.74+A,sh-.008,0,.168,.148);let p=dgE(ax,y,z,.815+A,sh-.01,.005,.162,.15,.162);
  for(const[zz,yy]of[[-.075,.015],[0,.026],[.075,.015]])p=dgS(p,dgE(ax,y,z,.93+A,sh-.01+yy,zz,.058,.058,.055),.03);a=dgS(a,p,.06);
  let l=dgRC(ax,y,z,X,V.legTop+.05,0,X,V.ankle+.03,0,V.legR[0],V.legR[1]);let f=dgE(ax,y,z,X,.08,.05,.168,.09,.2);
  for(const[xx,zz]of[[-.07,.21],[0,.228],[.07,.21]])f=dgS(f,dgE(ax,y,z,X+xx,.072,zz,.056,.058,.06),.03);l=dgS(l,f,.05);return dgS(a,l,.001)};
 const body0=(x,y,z)=>dgS(dgS(torso(x,y,z),headM(x,y,z),.2),limbs(x,y,z),.07);
 /* 얼굴: 분홍 코 · ω 입 */
 const R0=(x,y)=>dgRay(headM,[x,y,1.5],[0,0,-1]),nTip=R0(0,HY-.085),lipY=HY-.2;
 const MP=[R0(0,nTip[1]-.04),R0(0,lipY)],MC=[R0(.025,lipY-.014),R0(.05,lipY-.012),R0(.07,lipY+.002)],MCr=MC.map(p=>[-p[0],p[1],p[2]]);
 const mouthD=(x,y,z)=>Math.min(dgPoly(x,y,z,MP),dgPoly(x,y,z,[MP[1],...MC]),dgPoly(x,y,z,[MP[1],...MCr]));
 const body=(x,y,z)=>{let d=body0(x,y,z);if(y>HY-.35&&z>.2)d=dgX(d,.007-mouthD(x,y,z),.01);return d+dgNz(x,y,z,28,.004)};
 const neckY=(()=>{const core=(x,y,z)=>dgS(torsoB(x,y,z),headM(x,y,z),.2);let best=HY-.4,br=9;for(let y=T1[1];y<HY;y+=.01){const r=dgRay(core,[1,y,0],[-1,0,0])[0];if(r<br){br=r;best=y}}return best})();
 const pads=(x,y,z)=>Math.min(dgE(x,y-HY,z,.068,-.165,.36,.11,.09,.1),dgE(x,y-HY,z,-.068,-.165,.36,.11,.09,.1),dgE(x,y-HY,z,0,-.24,.31,.1,.07,.1));
 const stripe=(v,w)=>{const f=v-Math.floor(v);return dgSm(w,w-.12,Math.abs(f-.5)*2)};
 S.body={F:body,F0:body0,b0:[-1.03,-.04,-.62],b1:[1.03,HY+.48,.6],cell:.034/Q,skin:1,shell:1,
  C:(x,y,z,nx,ny,nz)=>{const ax=Math.abs(x);let c=DGK.or,wh=0;
   if(y>neckY){const Y=y-HY;c=dgMix(DGK.or,DGK.orL,dgSm(-.05,-.2,Y)*.3);
    /* 이마 줄무늬 셋(위로 갈수록 굵게) + 볼 줄무늬 둘 */
    if(Y>.08&&z>-.25){for(const k of[-.12,0,.12]){const w=.02+.02*dgSm(.1,.4,Y);c=dgMix(c,DGK.orD,(1-dgSm(w*.7,w,Math.abs(x-k*(1+Y))))*dgSm(.08,.16,Y)*.9)}}
    if(ax>.3&&z>-.2)for(const yy of[-.06,-.15])c=dgMix(c,DGK.orD,(1-dgSm(.012,.022,Math.abs(Y-yy-(ax-.3)*.25)))*dgSm(.3,.36,ax)*.85);
    wh=Math.max(1-dgSm(-.02,.05,pads(x,y,z)),dgSm(-.3,-.75,ny)*dgSm(-.05,.2,z)*dgSm(HY-.12,HY-.25,y))}
   else{const s=stripe(y*5.5+dgN(x*3,y*3,z*3)*.6+ax*1.2,.4);c=dgMix(DGK.or,DGK.orD,s*dgSm(.1,-.15,z)*.85);
    wh=Math.max(dgSm(.12,.3,z)*dgSm(T0[1]-.42,T0[1]-.2,y),dgSm(.2,.34,z)*dgSm(T1[1]+.2,T1[1]+.1,y)*dgSm(.35,.6,y),dgSm(-.4,-.8,ny)*dgSm(.05,.2,z))}
   const arm=dgSm(.33+A,.43+A,ax)*dgSm(.84,.9,y)*dgSm(1.36,1.3,y);if(arm>0){c=dgMix(c,dgMix(DGK.or,DGK.orD,stripe(ax*6.5,.38)*dgSm(.2,-.3,nz)*.8),arm);wh=Math.max(wh*(1-arm),dgSm(.62+A,.7+A,ax)*arm)}
   const leg=dgSm(.42,.32,y)*dgSm(.05,.1,ax);if(leg>0){wh=Math.max(wh*(1-leg),dgSm(.2,.13,y)*leg)}
   c=dgFur(dgMix(c,DGK.wh,Math.min(1,wh)),x,y,z,.8);
   if(ny<-.5&&ax>.72+A&&Math.abs(y-V.sh)<.18)c=dgMix(c,DGK.bean,dgSm(-.5,-.8,ny));if(y<.07&&ny<-.65)c=DGK.bean;
   if(y>HY-.35&&z>.2)c=dgMix(c,DGK.mouth,(1-dgSm(.005,.013,mouthD(x,y,z)))*.9);return c}};
 const NY=nTip[1]+.006,NZ=nTip[2]+.006;
 S.nose={F:(x,y,z)=>{let d=dgE(x,y,z,0,NY,NZ,.05,.032,.032);d=dgS(d,dgE(x,y,z,0,NY-.024,NZ-.004,.022,.02,.024),.018);return d},
  b0:[-.07,NY-.07,NZ-.06],b1:[.07,NY+.05,NZ+.07],cell:.008/Q,bone:'head',gloss:1,C:(x,y,z,nx,ny)=>dgMix(DGK.nose,[.98,.75,.78],dgSm(.5,.95,ny)*.35)};
 S.eyes=[1,-1].map(s=>{const p=dgRay(headM,[s*.19,HY+.0,1.5],[0,0,-1]),n=dgGrad(headM,p[0],p[1],p[2],.003);return {p,n}});
 /* 귀: 똑바로 선 세모 귀(앞이 오목, 안쪽 분홍) — 가끔 쫑긋 */
 const earF=s=>{const b=[s*.27,HY+.31,-.03],t=[s*.37,HY+.6,-.05];const fl=(x,y,z,zc,k)=>[x,y,(z-zc)*k+zc];
  return (x,y,z)=>{let[a,bb,c]=fl(x,y,z,-.03,2.3);let d=dgRC(a,bb,c,...b,...t,.15,.03)/1.6;[a,bb,c]=fl(x,y,z,.01,2.3);const inn=dgRC(a,bb,c,b[0]*1.02,b[1]+.03,.02,t[0]*.98,t[1]-.04,.0,.1,.015)/1.6;d=dgX(d,-inn,.012);return d+dgNz(x,y,z,34,.002)}};
 const earC=s=>(x,y,z,nx,ny,nz)=>{const Y=y-HY;let c=dgMix(DGK.or,DGK.orD,dgSm(.4,.58,Y)*.7);const inn=dgSm(.15,.45,nz)*(1-dgSm(.07,.11,Math.abs(x-s*(.27+(Y-.31)*.34))))*dgSm(.33,.4,Y)*dgSm(.58,.5,Y);c=dgMix(c,DGK.earIn,inn);return dgFur(c,x,y,z,.7)};
 for(const s of[1,-1])S['ear'+(s>0?'L':'R')]={F:earF(s),C:earC(s),b0:s>0?[.08,HY+.18,-.2]:[-.55,HY+.18,-.2],b1:s>0?[.55,HY+.66,.12]:[-.08,HY+.66,.12],cell:.016/Q,bone:'head',piv:[s*.28,HY+.32,-.03],shell:1};
 /* 꼬리: 길고 굵은 S자, 고리 줄무늬 */
 const ty=V.hip+.16,tb=dgRay(torsoB,[0,ty,-1.5],[0,0,1]),T=[0,ty-.02,tb[2]+.06],TP=[[0,0,0],[0,.03,-.2],[0,.15,-.38],[0,.36,-.47],[0,.58,-.44],[0,.74,-.32]].map(p=>[p[0],p[1]+T[1],p[2]+T[2]]),TR=[.085,.098,.1,.095,.088,.072];
 const tailCore=(x,y,z)=>{let d=1e9;for(let i=0;i<TP.length-1;i++)d=dgS(d,dgRC(x,y,z,...TP[i],...TP[i+1],TR[i],TR[i+1]),.04);return d};
 S.tail={F:(x,y,z)=>tailCore(x,y,z)+dgNz(x,y,z,28,.004),b0:[-.16,T[1]-.14,T[2]-.62],b1:[.16,T[1]+.9,T[2]+.12],cell:.022/Q,bone:'hips',piv:T,shell:1,
  C:(x,y,z)=>{const[d,sv,L]=dgPolyT(x,y,z,TP),k=sv/L;let c=dgMix(DGK.or,DGK.orD,stripe(sv*7.5+.3,.42)*dgSm(.08,.2,k)*.9);return dgFur(c,x,y,z,1)}};
 /* 수염: 볼록한 수염 자리에서 양옆으로 셋씩 */
 {const parts=[];for(const s of[1,-1])for(const[dy,dz,ey]of[[.02,.0,.05],[-.005,-.01,0],[-.03,-.02,-.05]]){const a=dgRay(headM,[s*.11,HY-.155+dy,1.5],[0,0,-1]);const p0=new THREE.Vector3(a[0]+s*.01,a[1],a[2]-.01),p2=new THREE.Vector3(s*.47,HY-.14+dy+ey,a[2]-.12+dz),p1=p0.clone().lerp(p2,.5);p1.y+=.03;p1.z+=.02;
   const cv=new THREE.QuadraticBezierCurve3(p0,p1,p2);parts.push(new THREE.TubeGeometry(cv,8,.0055,4,false))}
  let pos=[],idx=[],off=0;for(const g of parts){const P=g.attributes.position.array;pos.push(...P);const I=g.index.array;for(const i of I)idx.push(i+off);off+=P.length/3}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();S.whisk={geo:g,bone:'head',mat:'hi'}}
 /* 청록 반다나(흰 줄무늬) */
 const core2=(x,y,z)=>dgS(torso(x,y,z),headM(x,y,z),.2),BY=neckY-.07,bx=dgRay(core2,[1.2,BY,0],[-1,0,0])[0],bzf=dgRay(core2,[0,BY,1.5],[0,0,-1])[2],bzb=dgRay(core2,[0,BY,-1.5],[0,0,1])[2],bcz=(bzf+bzb)/2,brz=(bzf-bzb)/2;
 const fy0=BY-.13,fz0=dgRay(core2,[0,fy0,1.5],[0,0,-1])[2];
 const band=(x,y,z)=>{const a=.12,c=Math.cos(a),s=Math.sin(a),py=y-BY,pz=z-bcz,ly=py*c-pz*s,lz=py*s+pz*c,R=(bx+brz)/2+.02;let d=Math.hypot(Math.hypot(x/(bx+.02),lz/(brz+.02))*R-R,ly/1.3)-.03;
  const fa=.38,fy=y-(fy0+.02),fz=z-(fz0+.028),uy=fy*Math.cos(fa)-fz*Math.sin(fa),uz=fy*Math.sin(fa)+fz*Math.cos(fa);
  const tri=Math.max(Math.abs(x)-.62*(uy+.15),-uy-.15,uy-.1);d=dgS(d,Math.max(tri,Math.abs(uz)-.016)-.014,.03);
  const kz=bzb-.01;d=dgS(d,dgE(x,y,z,0,BY+.02,kz,.06,.048,.045),.02);d=dgS(d,dgRC(x,y,z,.02,BY,kz-.01,.065,BY-.1,kz-.03,.026,.016),.015);d=dgS(d,dgRC(x,y,z,-.02,BY,kz-.01,-.055,BY-.09,kz-.025,.026,.016),.015);return d};
 S.band={F:band,b0:[-.56,BY-.32,bzb-.18],b1:[.56,BY+.14,bzf+.18],cell:.02/Q,skin:1,bodyOnly:1,noao:1,
  C:(x,y,z,nx,ny)=>{const v=y*20,dv=v-Math.floor(v);let c=dgMix(DGK.tl,DGK.tlD,dgSm(.3,-.6,ny)*.55);if(y<BY-.06&&z>bcz&&dv>.62&&dv<.86)c=DGK.wh;return c}};
 S.all=(x,y,z)=>Math.min(body0(x,y,z),S.earL.F(x,y,z),S.earR.F(x,y,z),S.tail.F(x,y,z));
 S.neckY=neckY;return S}

/* ---------- 피부 무게: 머리·몸통은 높이로, 팔·다리는 관 안쪽만 부드럽게 ---------- */
function dgWeights(V,I,x,y,z,bodyOnly){const W=new Float32Array(Object.keys(I).length),ax=Math.abs(x),L=x>0?'l':'r',c=V.sh-.17,h=V.hy-.38;
 const band=(v,pts,mul)=>{if(v<=pts[0][0]){W[I[pts[0][1]]]+=mul;return}for(let i=0;i<pts.length-1;i++){const[p0,b0]=pts[i],[p1,b1]=pts[i+1];if(v<=p1){const t=dgSm(p0,p1,v);W[I[b0]]+=mul*(1-t);W[I[b1]]+=mul*t;return}}W[I[pts[pts.length-1][1]]]+=mul};
 const A=V.ax||0,X=V.lx||.15,armT=bodyOnly?0:dgSm(.22+A,.34+A,ax)*(1-dgSm(.2,.29,dgSeg(ax,y,z,.24+A,V.sh,0,.92+A,V.sh,0))),legT=bodyOnly?0:dgSm(V.hip+.12,V.hip-.02,y)*(1-dgSm(.2,.29,dgSeg(ax,y,z,X,V.legTop+.06,0,X,.03,.06))),bodyT=Math.max(0,1-armT-legT);
 if(bodyT>0)band(y,[[V.hip+.06,'hips'],[(V.hip+c)/2+.06,'spine'],[c+.1,'chest'],[h+.16,'head']],bodyT);
 if(armT>0)band(ax,[[.32+A,'upperarm'+L],[.52+A,'lowerarm'+L],[.72+A,'hand'+L]],armT);
 if(legT>0)band(-y,[[-V.legTop,'upperleg'+L],[-V.knee,'lowerleg'+L],[-V.ankle-.02,'foot'+L]],legT);
 return W}
function dgSkin(g,V,I,bo){const P=g.attributes.position,n=P.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
 for(let v=0;v<n;v++){const W=dgWeights(V,I,P.getX(v),P.getY(v),P.getZ(v),bo),idx=[...W.keys()].sort((a,b)=>W[b]-W[a]).slice(0,4);let s=0;for(const i of idx)s+=W[i];for(let j=0;j<4;j++){si[v*4+j]=idx[j];sw[v*4+j]=s>0?W[idx[j]]/s:j===0?1:0}}
 g.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4))}

/* ---------- 재질: 털(림 라이트), 털 껍질(보송보송한 겉털), 반짝이(코·눈) ---------- */
function dgMat(kind,xr,skin){const m=kind==='gloss'?new THREE.MeshPhongMaterial({vertexColors:true,shininess:60,specular:0x4a4a4a}):kind==='eye'?new THREE.MeshPhongMaterial({color:0x120c0a,shininess:110,specular:0x9a9a9a}):kind==='hi'?new THREE.MeshBasicMaterial({color:0xffffff}):
  new THREE.MeshPhongMaterial({vertexColors:true,shininess:2,specular:0x000000});
 if(kind==='fur'){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
  { vec3 dn=normalize(vNormal),dv=normalize(vViewPosition);float rim=1.0-clamp(dot(dn,dv),0.0,1.0);outgoingLight*=0.94;outgoingLight+=diffuseColor.rgb*(pow(rim,2.4)*0.28);}`)};m.customProgramCacheKey=()=>'dogfur'+(skin?'s':'')}
 if(skin)m.skinning=true;if(xr){m.stencilWrite=true;m.stencilRef=1;m.stencilFunc=THREE.AlwaysStencilFunc;m.stencilZPass=THREE.ReplaceStencilOp}return m}
/* 털 껍질: 같은 몸(낮은 해상도)을 법선 방향으로 조금씩 부풀린 겹 2장. 윤곽 쪽에서만 털 노이즈만큼 남겨서
   가장자리만 보송보송하게(정면에서는 거의 다 버려서 얼굴·무늬를 가리지 않아요) */
function dgShellMat(i,N,skin){const k=(i+1)/N,len=(DOG.FL*k).toFixed(4),cut=(.4+.25*k).toFixed(3),m=new THREE.MeshPhongMaterial({vertexColors:true,shininess:2,specular:0x000000});if(skin)m.skinning=true;
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFP=position*150.0;transformed+=objectNormal*'+len+';');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vFP;float dgh(vec3 p){p=fract(p*.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float dgn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(dgh(i),dgh(i+vec3(1,0,0)),f.x),mix(dgh(i+vec3(0,1,0)),dgh(i+vec3(1,1,0)),f.x),f.y),mix(mix(dgh(i+vec3(0,0,1)),dgh(i+vec3(1,0,1)),f.x),mix(dgh(i+vec3(0,1,1)),dgh(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
   .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n{float ndv=abs(dot(normalize(vNormal),normalize(vViewPosition)));float fz=dgn(vFP)*.6+dgn(vFP*2.7)*.4;if(fz<'+cut+'+smoothstep(.25,.6,ndv)*.7)discard;}')
   .replace('#include <envmap_fragment>',`#include <envmap_fragment>
  { vec3 dn=normalize(vNormal),dv=normalize(vViewPosition);float rim=1.0-clamp(dot(dn,dv),0.0,1.0);outgoingLight*=0.88;outgoingLight+=diffuseColor.rgb*(pow(rim,2.0)*0.08);}`)};
 m.customProgramCacheKey=()=>'dgshell'+i+(skin?'s':'');return m}

/* ---------- 만들기(처음 한 번, 몸마다) ---------- */
function dgRest(){if(DOG.R)return DOG.R;const r=THREE.SkeletonUtils.clone(CH.hero);r.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(r.matrixWorld).invert(),M={},SL={};
 r.traverse(o=>{if(o.isBone){M[o.name]=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);SL[o.name]={p:o.position.clone(),q:o.quaternion.clone()}}});DOG.SL=SL;return DOG.R=M}
function dgRig(v){if(DOG.RIGS[v])return DOG.RIGS[v];const R=dgRest(),V=DGV[v],DB=dgBones(V),W={},L={},inv={},I={},p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 DB.forEach((b,i)=>I[b[0]]=i);
 for(const[n,par,x,y,z]of DB){R[n].decompose(p,q,s);W[n]=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q.clone(),new THREE.Vector3(1,1,1));
  L[n]=par?new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().copy(W[par]).invert(),W[n]):W[n].clone();inv[n]=new THREE.Matrix4().copy(W[n]).invert()}
 return DOG.RIGS[v]={DB,W,L,inv,I,V}}
function dgBuild(v){if(DOG.GS[v])return DOG.GS[v];const t0=performance.now(),RIG=dgRig(v),S=(RIG.V.sp==='cat'?dgShapesCat:dgShapes)(RIG.V),parts=[];let tris=0;
 for(const k in S){const P=S[k];if(!P||!P.geo)continue;const g=P.geo.clone();g.applyMatrix4(RIG.inv[P.bone]);g.computeBoundingSphere();tris+=g.index?g.index.count/3:g.attributes.position.count/3;parts.push({k,bone:P.bone,g,pv:null,skin:false,shell:false,mat:P.mat})}
 for(const k in S){const P=S[k];if(!P||!P.F||!P.C)continue;const g=dgNets(P.F,P.C,P.b0,P.b1,P.cell,P.gloss||P.noao?null:S.all);tris+=g.index.count/3;let pv=null;
  if(P.skin)dgSkin(g,RIG.V,RIG.I,P.bodyOnly);else if(P.piv){g.translate(-P.piv[0],-P.piv[1],-P.piv[2]);pv=new THREE.Matrix4().multiplyMatrices(RIG.inv[P.bone],new THREE.Matrix4().makeTranslation(...P.piv))}else g.applyMatrix4(RIG.inv[P.bone]);
  let sg=null;if(P.shell){sg=dgNets(P.F0||P.F,P.C,P.b0,P.b1,Math.max(P.cell,.05),S.all);if(P.skin)dgSkin(sg,RIG.V,RIG.I,P.bodyOnly);else if(P.piv)sg.translate(-P.piv[0],-P.piv[1],-P.piv[2]);sg.computeBoundingSphere();tris+=sg.index.count/3*DOG.NS}
  g.computeBoundingSphere();parts.push({k,bone:P.bone,g,sg,pv,skin:!!P.skin,shell:!!P.shell,mat:P.gloss?'gloss':'fur'})}
 const eyeG=new THREE.SphereGeometry(1,18,12),hiG=new THREE.SphereGeometry(1,8,6),eyes=[];
 for(const e of S.eyes){const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...e.n)),at=new THREE.Vector3(...e.p).addScaledVector(new THREE.Vector3(...e.n),-.012);
  eyes.push(new THREE.Matrix4().multiplyMatrices(RIG.inv.head,new THREE.Matrix4().compose(at,q,new THREE.Vector3(1,1,1))))}
 return DOG.GS[v]={parts,eyes,eyeG,hiG,tris:Math.round(tris+eyes.length*(eyeG.index.count/3+hiG.index.count/3)),ms:Math.round(performance.now()-t0)}}

/* ---------- 캐릭터에 입히기 / 벗기기 ----------
   원래 뼈대는 보이지 않게 애니메이션만 받고, 강아지 뼈대가 그 회전을 스프링으로 늦게 따라가요 */
function dogApply(a,v){if(!a||!a.root)return;
 if(a.dog){if(a.dog.v===v)return;const d=a.dog;if(d.holderPar)d.holderPar.add(a.holder);for(const m of d.add)m.parent&&m.parent.remove(m);for(const m of d.hid)m.visible=true;DOG.list=DOG.list.filter(x=>x!==a);a.dog=null}
 if(!v||!DGV[v])return;const G=dgBuild(v),RIG=dgRig(v),SRC={},hid=[],add=[];a.root.traverse(o=>{if(o.isBone&&!/^dg_/.test(o.name))SRC[o.name]=o});
 const inHolder=o=>{for(let p=o;p;p=p.parent)if(p===a.holder)return true;return false};a.root.traverse(o=>{if(o.isMesh&&o.visible&&!inHolder(o)){o.visible=false;hid.push(o)}});
 const B={},bones=[];for(const[n,par]of RIG.DB){const b=new THREE.Bone();b.name='dg_'+n;RIG.L[n].decompose(b.position,b.quaternion,b.scale);(par?B[par]:a.root).add(b);B[n]=b;bones.push(b)}add.push(B.root);
 const skel=new THREE.Skeleton(bones,RIG.DB.map(([n])=>RIG.inv[n].clone())),I=new THREE.Matrix4();if(!DOG.XR&&typeof XRAY!=='undefined'){DOG.XR=XRAY.clone();DOG.XR.skinning=false}
 if(!DOG.SM)DOG.SM={s:[...Array(DOG.NS)].map((_,i)=>dgShellMat(i,DOG.NS,1)),r:[...Array(DOG.NS)].map((_,i)=>dgShellMat(i,DOG.NS,0))};
 const M={fur:dgMat('fur',a.xr),gloss:dgMat('gloss',a.xr),eye:dgMat('eye',a.xr),hi:dgMat('hi',a.xr),furS:dgMat('fur',a.xr,1)};
 const tag=(m,sh=true)=>{m.castShadow=sh;m.frustumCulled=false;m.userData.dog=1;return m};
 for(const p of G.parts){if(p.skin){const m=tag(new THREE.SkinnedMesh(p.g,M.furS));m.bind(skel,I);a.root.add(m);add.push(m);
   if(p.sg&&!DOG.noShell)for(const sm of DOG.SM.s){const x=tag(new THREE.SkinnedMesh(p.sg,sm),false);x.bind(skel,I);a.root.add(x);add.push(x)}
   if(a.xr){m.renderOrder=5;const x=new THREE.SkinnedMesh(p.g,XRAY);x.bind(skel,I);x.renderOrder=30;x.frustumCulled=false;a.root.add(x);add.push(x)}continue}
  let par=B[p.bone];if(p.pv){const o=new THREE.Object3D();p.pv.decompose(o.position,o.quaternion,o.scale);o.userData.q0=o.quaternion.clone();par.add(o);par=o;a['_dg_'+p.k]=o}
  const m=tag(new THREE.Mesh(p.g,M[p.mat]));if(a.xr){m.renderOrder=5;if(DOG.XR){const x=new THREE.Mesh(p.g,DOG.XR);x.renderOrder=30;x.frustumCulled=false;m.add(x)}}par.add(m);
  if(p.sg&&!DOG.noShell)for(const sm of DOG.SM.r)par.add(tag(new THREE.Mesh(p.sg,sm),false))}
 const piv={};for(const p of G.parts)if(p.pv)piv[p.k]=a['_dg_'+p.k];
 const eyes=G.eyes.map((E,i)=>{const o=new THREE.Object3D();E.decompose(o.position,o.quaternion,o.scale);B.head.add(o);const e=tag(new THREE.Mesh(G.eyeG,M.eye));e.scale.set(...(RIG.V.eye||[.055,.066,.034]));o.add(e);
  const h1=new THREE.Mesh(G.hiG,M.hi);h1.scale.setScalar(.014);h1.position.set(i?-.016:.016,.022,.026);o.add(h1);return o});
 const d={v,a,B,SRC,add,hid,piv,eyes,sp:{},holderPar:a.holder.parent,tw:Math.random()*6,blink:2+Math.random()*2,bt:0,ear:{L:[0,0,0,0],R:[0,0,0,0]},br:Math.random()*6,sq:[0,0],acc:new THREE.Vector3(),spd:0,RIG};
 for(const n in DGSP)d.sp[n]={w:new THREE.Vector3()};B.handslotr.add(a.holder);a.dog=d;DOG.list.push(a);dgPose(a,0,1)}

/* ---------- 매 프레임: 원래 뼈 → 강아지 뼈(스프링) + 덧붙인 움직임 ---------- */
const _dq=new THREE.Quaternion(),_dq2=new THREE.Quaternion(),_dq3=new THREE.Quaternion(),_dqa=new THREE.Quaternion(),_dq4=new THREE.Quaternion(),_dq5=new THREE.Quaternion(),_dv=new THREE.Vector3(),_dv2=new THREE.Vector3(),_dv3=new THREE.Vector3(),_dE=new THREE.Euler();
function dgSpring(b,st,tq,om,ze,dt,ext){const n=Math.max(1,Math.ceil(dt/.008)),h=dt/n,k=om*om,c=2*ze*om;
 for(let i=0;i<n;i++){_dq.copy(tq).multiply(_dq2.copy(b.quaternion).invert());if(_dq.w<0){_dq.x=-_dq.x;_dq.y=-_dq.y;_dq.z=-_dq.z;_dq.w=-_dq.w}
  const sw=Math.min(1,_dq.w),ang=2*Math.acos(sw),sn=Math.sqrt(Math.max(0,1-sw*sw)),f=sn>1e-6?ang/sn:2;
  st.w.x+=(k*_dq.x*f-c*st.w.x+(ext?ext.x:0))*h;st.w.y+=(k*_dq.y*f-c*st.w.y+(ext?ext.y:0))*h;st.w.z+=(k*_dq.z*f-c*st.w.z+(ext?ext.z:0))*h;
  const wl=st.w.length();if(wl>1e-7){_dq3.setFromAxisAngle(_dv.copy(st.w).divideScalar(wl),wl*h);b.quaternion.premultiply(_dq3)}}b.quaternion.normalize()}
/* 캐릭터 기준 축(앞 +z) 벡터를 뼈의 부모 좌표로 */
function dgToParent(a,b,v){b.parent.getWorldQuaternion(_dq4);a.root.getWorldQuaternion(_dq5);_dq4.premultiply(_dq5.invert());return v.applyQuaternion(_dq4.invert())}
function dgPose(a,dt,snap){const d=a.dog,B=d.B,S=d.SRC,SL=DOG.SL,RIG=d.RIG;
 if(dt>0){a.root.getWorldPosition(_dv3);if(d.prev){const vx=(_dv3.x-d.prev.x)/dt,vz=(_dv3.z-d.prev.z)/dt,ry=a.root.rotation.y,c=Math.cos(ry),s=Math.sin(ry),vf=vx*s+vz*c,vs=vx*c-vz*s;
   if(d.pv){const k=Math.min(1,dt*8);d.acc.x+=(((vs-d.pv[0])/dt)-d.acc.x)*k;d.acc.z+=(((vf-d.pv[1])/dt)-d.acc.z)*k}d.pv=[vs,vf];d.spd+=(Math.min(12,Math.hypot(vx,vz))-d.spd)*Math.min(1,dt*6)}d.prev=(d.prev||new THREE.Vector3()).copy(_dv3)}
 const run=Math.min(1,d.spd/5),dead=a.cur&&/Death|Lie/.test(a.cur);
 let step=0;if(S.footl&&S.footr){S.footl.getWorldPosition(_dv);S.footr.getWorldPosition(_dv2);const ry=a.root.rotation.y;step=((_dv.x-_dv2.x)*Math.sin(ry)+(_dv.z-_dv2.z)*Math.cos(ry))}
 for(const[n]of RIG.DB){const b=B[n],sb=S[n];if(!sb)continue;
  if(n==='hips'){RIG.L.hips.decompose(_dv,_dq,_dv2);b.position.copy(_dv).addScaledVector(_dv2.copy(sb.position).sub(SL.hips.p),.8)}
  const sp=DGSP[n];if(!sp||snap||!dt||DOG.ns){b.quaternion.copy(sb.quaternion);if(sp)d.sp[n].w.set(0,0,0);continue}
  _dqa.copy(sb.quaternion);let ext=null;
  if(n==='spine'||n==='head'||n==='chest'){const g=Math.min(1,d.spd/1.2),roll=n==='spine'?Math.max(-.2,Math.min(.2,step*.55))*g:n==='head'?-Math.max(-.12,Math.min(.12,step*.3))*g:0;
   if(roll){dgToParent(a,b,_dv3.set(0,0,1));_dq3.setFromAxisAngle(_dv3,roll);_dqa.premultiply(_dq3)}
   const kk=n==='head'?1.1:n==='chest'?.7:.5,ac=Math.min(1,14/(Math.hypot(d.acc.x,d.acc.z)+1e-6));_dv2.set(-d.acc.z*ac*kk*.9,0,d.acc.x*ac*kk*.9);if(n==='head'){_dv2.x+=Math.sin(DOG.t*1.3+d.br)*.6;_dv2.z+=Math.sin(DOG.t*.9+d.br*2)*.5}ext=dgToParent(a,b,_dv2)}
  if(dead&&n!=='head'){b.quaternion.copy(_dqa);continue}
  const[om,ze,mx]=sp;dgSpring(b,d.sp[n],_dqa,om*(dead?1.6:1),ze,Math.min(dt,.05),ext);const dev=b.quaternion.angleTo(_dqa);if(dev>mx){b.quaternion.slerp(_dqa,1-mx/dev);d.sp[n].w.multiplyScalar(.5)}}
 /* 찌그러졌다 펴지는 몸(걸음 박자 + 멈출 때 출렁) */
 if(dt>0){const tgt=-(run>.05?Math.abs(step)*.18:0)+Math.sin(d.br)*.012;d.sq[1]+=((tgt-d.sq[0])*190-d.sq[1]*9)*dt-d.acc.z*.24*dt;d.sq[0]+=d.sq[1]*dt;d.sq[0]=Math.max(-.12,Math.min(.12,d.sq[0]))}
 const e=d.sq[0];B.spine.scale.set(1-e*.5,1+e,1-e*.5);
 const VV=RIG.V,WG=VV.wag||[6.5,7,.38],EK=VV.earK||1,T=d.piv.tail;if(T){d.tw+=dt*(dead?0:WG[0]+run*WG[1]);const amp=dead?0:WG[2]+run*.22*(WG[2]/.38);_dE.set(-.12+Math.sin(d.tw*2)*.05*run,Math.sin(d.tw)*amp,Math.sin(d.tw)*.12);T.quaternion.copy(T.userData.q0).multiply(_dq.setFromEuler(_dE))}
 if(dt>0){B.head.getWorldPosition(_dv);if(d.hp){const vx=(_dv.x-d.hp.x)/dt,vy=(_dv.y-d.hp.y)/dt,vz=(_dv.z-d.hp.z)/dt;if(d.hv){const k=Math.min(1,dt*10);d.ha=d.ha||new THREE.Vector3();d.ha.x+=(((vx-d.hv.x)/dt)-d.ha.x)*k;d.ha.y+=(((vy-d.hv.y)/dt)-d.ha.y)*k;d.ha.z+=(((vz-d.hv.z)/dt)-d.ha.z)*k}d.hv=(d.hv||new THREE.Vector3()).set(vx,vy,vz)}d.hp=(d.hp||new THREE.Vector3()).copy(_dv);
  const ha=d.ha||_dv2.set(0,0,0),ry=a.root.rotation.y,c=Math.cos(ry),s=Math.sin(ry),af=ha.x*s+ha.z*c,as=ha.x*c-ha.z*s,au=ha.y;
  for(const side of['L','R']){const E=d.ear[side],sg=side==='L'?1:-1,tx=EK*(Math.max(-.6,Math.min(.6,af*.022))+Math.sin(DOG.t*1.7+sg)*.03),tz=EK*Math.max(-.15,Math.min(.75,-au*.02-as*sg*.02+.04+run*.12));if(VV.twitch&&Math.random()<dt*.18)E[3]+=(Math.random()<.5?-1:1)*5;
   E[1]+=((tx-E[0])*55-E[1]*5.5)*dt;E[0]+=E[1]*dt;E[3]+=((tz-E[2])*48-E[3]*5)*dt;E[2]+=E[3]*dt;E[0]=Math.max(-.9,Math.min(.9,E[0]));E[2]=Math.max(-.3,Math.min(1,E[2]));
   const o=d.piv['ear'+side];if(o){_dE.set(E[0],0,E[2]*sg);o.quaternion.copy(o.userData.q0).multiply(_dq.setFromEuler(_dE))}}}
 d.blink-=dt;if(d.blink<0){d.bt=.16;d.blink=2.2+Math.random()*3.2}const bs=d.bt>0?Math.max(.08,Math.abs(d.bt-.08)/.08):1;d.bt=Math.max(0,d.bt-dt);for(const o of d.eyes)o.scale.y=dead?.1:bs;
 d.br+=dt*2.2}
function dogTick(dt){if(!dt)return;DOG.t+=dt;if(typeof P!=='undefined'&&P.a){const want=DGV[DOG.sel]?DOG.sel:null;if((P.a.dog?P.a.dog.v:null)!==want)dogApply(P.a,want)}
 for(const a of DOG.list){if(!a.dog||!a.root.parent)continue;dgPose(a,dt,0)}}
{const _ue=updEnv;updEnv=function(dt,px,pz){_ue(dt,px,pz);try{dogTick(dt)}catch(e){if(!DOG.err){DOG.err=1;console.error(e)}}}}

/* ---------- 시작 화면: 캐릭터 고르기 ----------
   타이틀 화면의 [이어하기]·[새로 시작] 위에 카드 셋(가로 화면에서는 오른쪽 세로 줄). 누르면 바로 바뀌고 저장돼요(localStorage).
   그림은 각 캐릭터를 따로 그려서 만들어요. 가방의 '장비' 캐릭터 그림(#ava)도 고른 캐릭터로 바뀌어요. */
const DGCH=[{id:'hero',n:'탐험가'},{id:'dog',n:'골든 리트리버'},{id:'dog2',n:'긴 다리 리트리버'},{id:'cat',n:'치즈 고양이'}];
function dgPortrait(v){const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(1);r.setSize(220,220);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff2e0,0x7d6c5c,1.0));const dl=new THREE.DirectionalLight(0xfff4e4,.95);dl.position.set(2.5,4,6);sc.add(dl);
 const a=new Actor('hero');scene.remove(a.root);sc.add(a.root);a.root.rotation.y=.38;a.play('Idle',{force:1});a.mixer.update(.4);if(DGV[v])dogApply(a,v);else a.helmet();
 const pc=new THREE.PerspectiveCamera(22,1,.1,50);pc.position.set(.35,1.5,6.6);pc.lookAt(0,1.06,0);r.render(sc,pc);const url=r.domElement.toDataURL();
 if(a.dog)dogApply(a,null);sc.remove(a.root);r.dispose();if(r.forceContextLoss)r.forceContextLoss();return url}
function dgMark(){document.querySelectorAll('#chSel .chC').forEach(b=>b.classList.toggle('on',b.dataset.c===DOG.sel))}
function dgAva(){const im=$('ava')&&$('ava').querySelector('img');if(!im)return;if(!DOG.heroImg)DOG.heroImg=im.src;const u=DOG.sel==='hero'?DOG.heroImg:DOG.img&&DOG.img[DOG.sel];if(u)im.src=u}
function dgSet(v){if(DOG.sel===v)return;DOG.sel=v;try{localStorage.setItem('frontisle_char',v)}catch(e){}dgMark();dgAva();try{sfx(660,.08,'triangle',.05);sfx(880,.1,'triangle',.04)}catch(e){}}
function dgUI(){if(DOG.ui)return;const t=$('title');if(!t||t.classList.contains('hide')||typeof CH==='undefined'||!CH.hero)return;DOG.ui=1;
 const im=$('ava')&&$('ava').querySelector('img');if(im&&!DOG.heroImg)DOG.heroImg=im.src;
 const box=document.createElement('div');box.id='chSel';box.innerHTML='<div class="chT">캐릭터 고르기</div><div class="chRow">'+DGCH.map(c=>`<button class="chC" data-c="${c.id}"><span class="chI"></span><b>${c.n}</b></button>`).join('')+'</div>';
 t.insertBefore(box,$('tCont'));box.addEventListener('click',e=>{const b=e.target.closest('.chC');if(b){e.stopPropagation();dgSet(b.dataset.c)}});dgMark();
 DOG.img={hero:DOG.heroImg};const hi=box.querySelector('[data-c="hero"] .chI');if(DOG.heroImg)hi.style.backgroundImage=`url(${DOG.heroImg})`;
 const order=['dog','dog2','cat'].sort((x,y)=>(y===DOG.sel)-(x===DOG.sel));let k=0;
 const next=()=>{const v=order[k++];if(!v){dgAva();return}try{const u=dgPortrait(v);DOG.img[v]=u;const el=box.querySelector(`[data-c="${v}"] .chI`);el.style.backgroundImage=`url(${u})`;el.classList.add('ok')}catch(err){console.warn(err)}dgAva();setTimeout(next,30)};setTimeout(next,80)}
setInterval(dgUI,350);
