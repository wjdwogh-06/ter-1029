/* ===== 81차(규칙, 기획자 11-25 20:13): 식물섬 = 농장 =====
   기획자: '식물 도감 상인 있는 곳 바깥 벽 지형지물이 좀 투박한데 좀 더 자연스럽게', '문은 심플하게', '내부 꾸미는 것도 그냥 가볍게만',
          '식물 도감 쪽은 농장 느낌이랑 밭 몇 개 적당히, 흰 울타리나 조그마한 것 여러 개보다는 적당한 건물 몇 개'.
   places.js(37차)의 식물섬 함수 셋을 바꿔 끼워요(그 파일 줄은 안 고침): piGateModel(문 모양) · plPlantIsle(벽 모양·안 꾸밈) · 땅 길(PIWORN).
   - 벽: 층층이 쌓은 띠 절벽 → 둘레를 따라 높이가 오르내리는 둥근 바위 언덕(위는 풀, 옆은 바위, 바다 쪽은 더 높고 바위가 많음),
         문 쪽으로 낮아지며 끝나요. 바위가 군데군데 튀어나오고 위에 덤불·나무. 부딪힘·문·설치 금지는 예전 그대로(piCols·piCliffWalls).
   - 문: 나무 기둥 둘 + 가로대 + 작은 간판 + 널 문짝 둘(여닫는 건 그대로).
   - 안: 농장 — 빨간 헛간 · 농가(통나무 오두막) · 풍차 · 유리 온실(그대로) + 밭 다섯(밀·옥수수·토마토·감자·해바라기, 가볍게 만든 작물),
         건초 더미·허수아비, 가로등 셋, 나무 몇 그루, 식물 도감 게시판, 정원사 판매대·주인(그대로), 자판기 묶음(r81.js). 건물은 52차 배치용 구조물이라 관리자 배치로 옮길 수 있어요. */
const PIS81={};
if(typeof GNPC_LINES!=='undefined'){GNPC_LINES.length=0;GNPC_LINES.push('어서 와요! 식물 도감을 다 채운 사람만 들어오는 농장이에요.','밀·옥수수·토마토·감자·해바라기 밭은 제가 돌봐요.','씨앗은 작업대에서 같은 작물 네 개로 만들어요.','풍차는 밀을 빻고, 헛간엔 겨울 건초를 쌓아 둬요.','문 옆 게시판에서 섬의 식물을 다시 볼 수 있어요.')}
/* 닳은 흙길: 문 → 마당, 마당 → 온실·헛간·농가·판매대, 문 바깥 */
if(typeof PIWORN!=='undefined'){PIWORN.length=0;PIWORN.push([[85,690.5],[85,684.5],[85,679],[84.9,673.5],[84.6,670.2]],[[85.6,664],[87.2,659.6],[88.6,656.2]],[[81.6,665.6],[77.4,663.4],[72.6,662.6]],[[88.4,666.6],[95.2,664.4],[103.4,661.2]],[[87.6,668.6],[91.4,671.6],[94.2,672.2]],[[85,690.5],[85.6,696],[86.8,701]])}

/* ---------- 문: 나무 기둥 둘 + 가로대 + 작은 간판 + 널 문짝 둘 ---------- */
piGateModel=function(){const R=(w,h,d,c,b)=>lkRb(w,h,d,c===undefined?.05:c,b===undefined?.03:b),WD=[0xb9773f,0xc98a50,0xa8693a],DK=0x6e4a2e,base=[];
 for(const sx of[-1,1])base.push(pt(R(.34,3.05,.34,.06,.04),DK,[sx*1.74,1.22,.05]),pt(R(.44,.12,.44,.04,.03),0x5b3d26,[sx*1.74,2.78,.05]));
 base.push(pt(R(4.2,.24,.3,.05,.03),DK,[0,2.58,.05]),pt(R(1.84,.52,.08,.06,.03),0x8a5a36,[0,2.1,.24]),pt(R(1.68,.4,.03,.05,.02),0xf0d9a8,[0,2.1,.29]));
 for(const sx of[-1,1])base.push(pt(R(.03,.16,.03,.01,.01),0x3a3f4a,[sx*.68,2.4,.24]));
 const door=sx=>{const q=[],W=1.48;for(let k=0;k<5;k++)q.push(pt(R(.285,1.72,.09,.04,.02),WD[k%3],[-sx*(k*.296+.148),.96,0]));
  for(const y of[.42,1.5])q.push(pt(R(W-.08,.13,.05,.03,.02),DK,[-sx*W/2,y,.07]));const dx=W-.26,dy=1.08,ang=Math.atan2(dy,dx)*sx;q.push(pt(R(Math.hypot(dx,dy),.11,.04,.03,.02),DK,[-sx*W/2,.96,.08],[0,0,ang]));
  q.push(pt(R(.07,.2,.06,.02,.01),0x3a3f4a,[-sx*(W-.18),1.02,.11]));return q};
 lkModel('pl_pgate',base,{l:{g:door(-1),pv:[-1.5,0,0]},r:{g:door(1),pv:[1.5,0,0]}});for(const k of['pl_pgate','pl_pgate_b','pl_pgate_l','pl_pgate_r'])if(GEO[k]){lkSmooth(GEO[k],40);lkAO(GEO[k])}};

/* ---------- 벽: 둥근 바위 언덕 띠 ---------- */
const PIS81C={rock:[0x84818e,0x938f9c,0x9f9ca7,0x8c8996],rockD:0x6d6a78,wet:0x6f6c64};
function pis81Pal(){const aut=typeof AUTC!=='undefined'&&typeof autIsls==='function'&&autIsls().includes(islAt(PIS.x,PIS.z));
 return aut?{aut:1,t1:0xa99a46,t2:0xc4893a,moss:0x86864a}:{aut:0,t1:0x5f9a3c,t2:0x6ea844,moss:0x4f8a3c}}
function pis81Ridge(C){const n=C.length,K=10,UPK=4,pal=pis81Pal(),col=new THREE.Color(),c2=new THREE.Color(),c3=new THREE.Color();
 /* 높이: 둘레를 따라 2.0~4.4m로 오르내리고(바다 쪽은 더 높게), 문 쪽 끝 7칸은 1.5m까지 낮아져요 */
 const H=C.map((c,i)=>{const t=i/(n-1);let h=2.6+plWave(t,11,.95)+(noise(c.ix*.16,c.iz*.16,411)-.5)*.7+1.05*c.s;const e=Math.min(i,n-1-i);return clamp(lerp(1.45,h,sm(0,7,e)),1.4,4.6)});
 const pos=new Float32Array(n*(K+1)*3),U=new Float32Array(n*(K+1)),G0=new Float32Array(n*(K+1));let q=0;
 for(let i=0;i<n;i++){const c=C[i],gi=Math.max(c.gi,.9),ob=c.go>.3?c.go-.25:Math.min(c.go,0)-1.25,Yt=gi+H[i];
  for(let k=0;k<=K;k++){const u=k/K,up=UPK/K,w=u<up?u/up*.5:.5+(u-up)/(1-up)*.5,pr=Math.pow(Math.sin(Math.PI*w),.6),yb=lerp(gi-.28,ob,Math.pow(u,1.25));
   let x=c.ix+(c.ox-c.ix)*u,z=c.iz+(c.oz-c.iz)*u;const j=(noise(x*.28,z*.28,412)-.5)*.75*Math.sin(Math.PI*u)*(c.cap?0:1);x+=c.nx*j;z+=c.nz*j;
   const y=yb+(Yt-yb)*pr+(noise(x*.42,z*.42,413)-.5)*.34*pr;U[q/3]=u;G0[q/3]=gi;pos[q++]=x;pos[q++]=y;pos[q++]=z}}
 const idx=[];for(let i=0;i<n-1;i++)for(let k=0;k<K;k++){const a=i*(K+1)+k,b=a+1,d=a+K+1,e=d+1;idx.push(a,d,b,b,d,e)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 {const N=g.attributes.normal,mid=((n>>1)*(K+1)+UPK);if(N.getY(mid)<0){for(let t=0;t<idx.length;t+=3){const s=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=s}g.setIndex(idx);g.computeVertexNormals()}}
 /* 색: 위를 보는 면 = 풀(안쪽은 더 넓게), 가파른 면 = 바위, 아래·물속은 어둡게 */
 const N=g.attributes.normal,cl=new Float32Array(pos.length);
 for(let v=0;v<pos.length/3;v++){const x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2],ny=N.getY(v),u=U[v],inner=u<UPK/K+.05,nz=noise(x*.35,z*.35,414),nz2=noise(x*.9,z*.9,415);
  col.setHex(PIS81C.rock[(nz2*4)|0]).lerp(c2.setHex(PIS81C.rockD),clamp(.35-(y-.9)*.18,0,.5));if(y<.15)col.lerp(c2.setHex(PIS81C.wet),.6);
  const sv=C[(v/(K+1))|0].s,gT=inner?.6:lerp(.62,.78,sv),gk=sm(gT,gT+.12,ny+(nz-.5)*.14);if(gk>0){c2.setHex(pal.t1).lerp(c3.setHex(pal.t2),sm(.3,.8,nz)*.55);col.lerp(c2,gk)}
  if(gk>.05&&gk<.85&&nz2>.5)col.lerp(c2.setHex(pal.moss),.45);col.convertSRGBToLinear();
  /* 구운 음영: 발치는 어둡게(높이 차가 보이게) + 해 쪽 면은 밝게 */
  const hk=clamp((y-G0[v])/2.6,0,1),lt=clamp(N.getX(v)*.33+ny*.72+N.getZ(v)*.6,0,1),s=(y>.15?lerp(.66,1,Math.pow(hk,.8)):.8)*(.8+lt*.28)*(.95+hash(v,3,416)*.08);cl[v*3]=col.r*s;cl[v*3+1]=col.g*s;cl[v*3+2]=col.b*s}
 g.setAttribute('color',new THREE.BufferAttribute(cl,3));g.computeBoundingSphere();const m=mesh(g,PLM2());m.receiveShadow=true;m.castShadow=true;m.userData.layoutName='식물섬 바위 언덕';scene.add(m);
 /* 문 쪽 두 끝의 잘린 면 막기 */
 {const e=new PLGeo();for(const [i,sx] of [[0,1],[n-1,-1]]){const P=[];for(let k=0;k<=K;k++){const o=(i*(K+1)+k)*3;P.push([pos[o],pos[o+1],pos[o+2]])}const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cy=P.reduce((a,p)=>a+p[1],0)/P.length-.2,cz=P.reduce((a,p)=>a+p[2],0)/P.length;
   for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length],c=plCol(PIS81C.rock[k%4],.95);e.tri([cx+sx*.15,cy,cz],a,b,c,c,c,[sx,0,0])}}scene.add(mesh(e.build(),PLM2()))}
 const at=(i,k)=>{const o=(i*(K+1)+k)*3;return[pos[o],pos[o+1],pos[o+2]]};PIS81.at=at;PIS81.n=n;PIS81.K=K;PIS81.H=H;return {at,n,K,H}}
/* 단풍 나무 모양(가을 섬이면 79차 autGeoLeaf로 색만 바꾼 복제) */
function pis81Trees(){if(PIS81.T)return PIS81.T;const A=GEO.tree_single_A,B=GEO.t_birch||GEO.tree_single_B||A,aut=pis81Pal().aut&&typeof autGeoLeaf==='function';
 PIS81.T=[aut&&A?autGeoLeaf(A,[0xe07a30,0xd9572e,0xf0a23a]):A,aut&&B?autGeoLeaf(B,[0xe9c63c,0xf0cf4a,0xd9b02e]):B];return PIS81.T}
/* 벽 위·옆 꾸밈: 위 덤불·나무, 옆에 튀어나온 바위, 바깥 발치 바위 */
function pis81RidgeDeco(C,R){const v=[],rk=[],n=C.length,[TA,TB]=pis81Trees(),BU=GEO.bush&&pis81Pal().aut&&typeof autGeoLeaf==='function'?autGeoLeaf(GEO.bush,[0xc9842e,0xb8692c,0xd9a23a]):GEO.bush;
 for(let i=0;i<n;i++){const c=C[i];if(c.cap)continue;const e=Math.min(i,n-1-i),t=R.at(i,4);
  if(BU&&i%4===1&&e>3)v.push(pt(BU,null,[t[0]+(hash(i,1,421)-.5)*.5,t[1]-.12,t[2]+(hash(i,2,421)-.5)*.5],[0,i,0],[.55+hash(i,3,421)*.35,.5+hash(i,4,421)*.3,.55+hash(i,3,421)*.35]));
  if(i%19===9&&R.H[i]>2.6&&e>8){const T=hash(i,5,421)>.5?TA:TB;if(T)v.push(pt(T,null,[t[0],t[1]-.15,t[2]],[0,i*1.3,0],[1.2+hash(i,6,421)*.4,1.15+hash(i,7,421)*.45,1.2+hash(i,6,421)*.4]))}
  if(i%9===4&&e>5){const p=R.at(i,7),r=.75+hash(i,8,421)*.55;rk.push(lkBoulder(r,PIS81C.rock[i%4],i*7+1,[p[0]+c.nx*.15,p[1]-r*.35,p[2]+c.nz*.15],.72))}
  if(i%6===3&&e>3){const p=R.at(i,1),r=.32+hash(i,9,421)*.3;rk.push(lkBoulder(r,PIS81C.rock[(i+1)%4],i*7+2,[p[0]+c.nx*.35,p[1]-r*.55,p[2]+c.nz*.35],.7))}
  if(i%3===0){const b=c.go>.3?c.go-.12:-.35,r=.4+hash(i,6,97)*.45;rk.push(lkBoulder(r,PIS81C.rock[i%4],i*5+3,[c.ox+c.nx*(.25+r*.5),b,c.oz+c.nz*(.25+r*.5)],.6))}}
 if(v.length)plAdd(mg(v),0,0,0);if(rk.length){const g=mg(rk);lkSmooth(g,60);lkAO(g);plAdd(g,0,0,0)}}

/* ---------- 농장: 밭(가볍게 만든 작물) ---------- */
function pis81Crop(k,s){const p=[],G=0x6ea844,G2=0x5f9a3c;
 if(k==='wheat'){for(let q=0;q<5;q++){const a=q*1.26+s,r=.06+hash(q,s,431)*.08,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.62+hash(q,s,432)*.18;p.push(pt(cyl(.012,.016,h,4),0xc9a24a,[x,h/2,z],[(hash(q,1,s)-.5)*.2,0,(hash(q,2,s)-.5)*.2]),pt(new THREE.ConeGeometry(.04,.2,5),0xe0b85a,[x,h+.06,z],[Math.PI,0,0]))}}
 else if(k==='corn'){p.push(pt(cyl(.035,.045,1.5,6),0x7fae4a,[0,.75,0]));for(let q=0;q<3;q++)p.push(pt(box(.5,.03,.11),q%2?G:G2,[Math.cos(q*2.1+s)*.22,.45+q*.33,Math.sin(q*2.1+s)*.22],[0,-(q*2.1+s),-.5]));p.push(pt(cyl(.055,.045,.28,7),0xf2c94c,[.08,1.02,0],[0,0,-.25]),pt(new THREE.ConeGeometry(.05,.2,5),0xc9d68a,[.0,1.62,0]))}
 else if(k==='tomato'){p.push(pt(new THREE.IcosahedronGeometry(.32,0),G2,[0,.36,0],[s,s,0],[1,.9,1]),pt(cyl(.012,.012,.7,4),0x9c7a4a,[.05,.35,.05]));for(let q=0;q<5;q++){const a=q*1.3+s;p.push(pt(new THREE.IcosahedronGeometry(.075,0),q%3?0xe0533f:0xf28c38,[Math.cos(a)*.27,.3+hash(q,s,433)*.2,Math.sin(a)*.27]))}}
 else if(k==='potato'){for(let q=0;q<3;q++){const a=q*2.1+s;p.push(pt(new THREE.IcosahedronGeometry(.2,0),q%2?G:G2,[Math.cos(a)*.13,.16,Math.sin(a)*.13],[q,s,0],[1,.75,1]))}p.push(pt(new THREE.IcosahedronGeometry(.05,0),0xf7f0e3,[0,.32,0]))}
 else if(k==='sunflower'){p.push(pt(cyl(.03,.04,1.3,5),0x7fae4a,[0,.65,0]),pt(box(.34,.03,.12),G,[.12,.6,0],[0,0,-.4]),pt(cyl(.2,.2,.05,10),0xf7c948,[0,1.32,.04],[Math.PI/2-.3,0,0]),pt(cyl(.1,.1,.07,8),0x7a5236,[0,1.33,.07],[Math.PI/2-.3,0,0]))}
 return p}
function pis81Field(w,d,crop,seed){const p=[],SOIL=[0x7a5236,0x6e4a30,0x845a3a],rows=Math.max(2,Math.round(d/.85)),dz=d/rows,cols=Math.max(2,Math.round(w/.9));
 p.push(pt(lkRb(w+.36,.12,d+.36,.08,.05),0x8f6c45,[0,.02,0]));for(let r=0;r<rows;r++)p.push(pt(lkRb(w,.16,dz*.6,.06,.05),SOIL[r%3],[0,.1,-d/2+dz*(r+.5)]));
 const M=new THREE.Matrix4(),V=new THREE.Vector3(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Z=new THREE.Vector3();
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=-w/2+(c+.5)*w/cols+(hash(c,r,seed)-.5)*.14,z=-d/2+dz*(r+.5),s=.85+hash(c,r,seed+1)*.25,g=mg(pis81Crop(crop,(c*7+r*3+seed)%11*.57));
  M.compose(V.set(x,.17,z),Q.setFromEuler(E.set(0,hash(c,r,seed+2)*6.28,0)),Z.set(s,s,s));g.applyMatrix4(M);p.push(g)}
 return mg(p)}
/* 건초 더미 · 허수아비 */
function pis81Hay(){const p=[];p.push(pt(cyl(.52,.52,1.1,12),0xd9b45a,[0,.52,0],[0,0,Math.PI/2]));for(const x of[-.3,.3])p.push(pt(cyl(.535,.535,.06,12),0xb8923f,[x,.52,0],[0,0,Math.PI/2]));for(const sx of[-1,1])p.push(pt(cyl(.45,.45,.02,12),0xe6c879,[sx*.555,.52,0],[0,0,Math.PI/2]));return mg(p)}
function pis81Crow(){const p=[],R=(w,h,d,c)=>lkRb(w,h,d,c||.03,.02);p.push(pt(R(.09,2.0,.09),0x8a6a44,[0,1.0,0]),pt(R(1.3,.08,.08),0x8a6a44,[0,1.45,0]),pt(R(.7,.62,.3,.08),0xc84a3a,[0,1.32,0]),pt(R(.72,.08,.32),0x2f3a4a,[0,1.06,0]));
 for(const sx of[-1,1])p.push(pt(R(.3,.24,.26,.06),0xc84a3a,[sx*.48,1.44,0]),pt(new THREE.ConeGeometry(.08,.2,5),0xe0c070,[sx*.68,1.44,0],[0,0,-sx*Math.PI/2]));
 p.push(pt(new THREE.IcosahedronGeometry(.22,1),0xe7d3a8,[0,1.86,0]),pt(cyl(.36,.36,.03,12),0xd9b45a,[0,2.02,0]),pt(new THREE.ConeGeometry(.2,.22,10),0xd9b45a,[0,2.13,0]),pt(cyl(.205,.205,.05,12),0xc84a3a,[0,2.05,0]));
 return mg(p)}

/* ---------- 식물섬 다시 만들기 ---------- */
plPlantIsle=function(){if(typeof lkModel!=='function')return;const gh=(x,z)=>hAt(x,z),bl=(x,z,bx,bz,r=0)=>addStruct({t:PLB(bx,bz),x,z,r,hp:1e9}),at=(g,x,z,ry=0,m,dy=0)=>plAdd(g,x,gh(x,z)-.02+dy,z,ry,m);
 const C=piCols(),R=pis81Ridge(C);piCliffWalls(C);pis81RidgeDeco(C,R);
 let rMax=0;for(const c of C)rMax=Math.max(rMax,Math.hypot(c.ox-PIS.x,c.oz-PIS.z));PIS.nr=Math.ceil(rMax+2.5);CLEARS.push([PIS.x,PIS.z,PIS.nr+2]);
 /* 문 */
 piGateModel();{const gz=PIS.gzo-.45,g=addStruct({t:'pgate',x:PIS.gx,z:gz,r:0});g.open=false;g.ot=0;const t=plSignText('🌱 식물섬 농장',1.6,.34,70);t.position.set(0,2.1,.31);if(g.m)g.m.add(t)}
 const PZ=[84.6,667.2],GL=[88.6,652.6],ST=[93.8,670.4];PIS.plaza=PZ;PIS.stall=ST;const L=PIS81.list=[];const note=(k,x,z,bx,bz)=>L.push({k,x,z,bx,bz});
 /* 건물: 빨간 헛간 · 농가 · 풍차 (52차 배치용 구조물) */
 for(const [t,x,z] of [['pr_barn',70.5,659.2],['pr_cabin',104.6,657.2],['pr_windmill',63.6,669.0]])if(DECO[t]){const s=addStruct({t,x,z,r:0,hp:1e9});s&&(s.pis81=1);note(t,x,z+(t==='pr_cabin'?.45:0),DECO[t].bx,DECO[t].bz+(t==='pr_cabin'?.45:0))}
 /* 유리 온실(그대로) */
 {const G=piGlassGeo(),m=at(G.g,GL[0],GL[1],0);const gm=mesh(G.gl,piGlassMat(),false);gm.renderOrder=2;m.add(gm);bl(GL[0],GL[1],3.82,2.42);note('glass',GL[0],GL[1],3.82,2.42);
  const sign=plAdd(mg([pt(lkRb(1.3,.36,.07,.05,.02),0x8a5a36,[0,0,0])]),GL[0],gh(GL[0],GL[1])+2.98,GL[1]+2.3),t=plSignText('🌿 온실',1.2,.28,66);t.position.set(0,0,.05);sign.add(t)}
 /* 정원사 판매대 + 주인(그대로) */
 {at(piStallGeo(),ST[0],ST[1],0);addStruct({t:'pstall',x:ST[0],z:ST[1],r:0});bl(ST[0],ST[1]-1.75,1.32,.24);const nz=ST[1]-.95;addStruct({t:'iblk2',x:ST[0],z:nz,r:0});GNPC={x:ST[0],z:nz,rot:0,i:0};note('stall',ST[0],ST[1]-.7,1.35,1.3);
  at(piSackGeo(0xcdb588),ST[0]-1.6,ST[1]-.1,.2);at(piSackGeo(0xd9c49a),ST[0]-1.55,ST[1]+.45,-.3);bl(ST[0]-1.58,ST[1]+.18,.3,.5)}
 /* 밭 다섯: 밀·옥수수·토마토·감자·해바라기 */
 for(const [crop,x,z,w,d,sd] of [['wheat',74.2,669.6,6.4,3.4,11],['corn',74.2,675.6,6.4,3.4,23],['tomato',106.4,666.2,6.0,3.4,37],['potato',78.6,657.4,5.6,3.2,41],['sunflower',97.4,658.2,4.4,2.6,53]]){
  at(pis81Field(w,d,crop,sd),x,z,0);bl(x,z,w/2+.18,d/2+.18);note('field_'+crop,x,z,w/2+.18,d/2+.18)}
 /* 허수아비(밀밭 가운데) · 건초 더미 */
 at(pis81Crow(),74.2,669.6,.3,undefined,.15);
 {const H=pis81Hay();for(const [x,z,r] of [[75.6,663.3,.2],[77.4,663.7,-.15],[66.4,663.8,1.4]]){at(H,x,z,r);bl(x,z,.62,.62,r);note('hay',x,z,.62,.62)}}
 /* 식물 도감 게시판(문 안 왼쪽) */
 {const b=piDexBoard();b.position.set(79.2,gh(79.2,679.6)-.02,679.6);scene.add(b);bl(79.2,679.6,1.62,.14);note('board',79.2,679.6,1.62,.3)}
 /* 가로등 셋 */
 {const lamp=(x,z,ry)=>{if(!GEO.plamp)return;at(GEO.plamp,x,z,ry);const s=glow(0xffc46a,3.4,.65);s.position.set(x+Math.sin(ry)*.5,gh(x,z)+2.75,z+Math.cos(ry)*.5);s.visible=false;scene.add(s);if(typeof PLAMPS!=='undefined')PLAMPS.push(s);bl(x,z,.14,.14);note('lamp',x,z,.2,.2)};
  lamp(87.6,678.6,-Math.PI/2);lamp(81.4,663.6,0);lamp(100.6,663.0,0)}
 /* 나무 몇 그루 */
 {const v=[],[TA,TB]=pis81Trees();for(const [x,z,s,r,k] of [[62.4,660.6,2.2,.4,0],[65.6,677.4,2.0,2.1,1],[111.4,661.2,2.1,1.2,0],[110.2,671.0,1.9,2.6,1]]){if(!piInside(x,z,1.6))continue;const T=k?TB:TA;if(T)v.push(pt(T,null,[x,gh(x,z)-.05,z],[0,r,0],[s,s,s]));bl(x,z,.3,.3);note('tree',x,z,.5,.5)}
  if(v.length)plAdd(mg(v),0,0,0)}
 /* 자판기 묶음(81차 r81.js): 판매대 오른쪽, 앞줄 맞춤 */
 try{if(typeof vs81Fits==='function'){const zf=ST[1]+1.05;if(vs81Fits(98.9,zf,(x,z)=>piInside(x,z,1.2)))vs81Put('plant',98.9,zf);else vs81Find('plant',ST[0]+5,ST[1]+1,0,14,(x,z)=>piInside(x,z,1.2))}}catch(e){console.error('81차 식물섬 자판기',e)}
};
/* 길을 조금 넓게(땅 칸이 2m라 좁으면 안 보여요) + 마당 흙 */
if(typeof plWornPI==='function')plWornPI=function(x,z){const fx=x-PIS.x,fz=z-PIS.z;if(fx<-32||fx>32||fz<-24||fz>38)return 0;const n=noise(x*.6+5,z*.6+1,79);let w=0;
 for(const L of PIWORN)w=Math.max(w,(1-sm(.9,2.6,plSegD(x,z,L)))*.8);w=Math.max(w,(1-sm(3.0,5.4,Math.hypot(x-84.6,z-667.2)))*.85);return clamp(w*(.75+n*.5),0,1)};
/* 79차 가을 땅 위에 농장 흙길·마당을 옅은 흙색으로 */
if(typeof autGround==='function'){const _ag=autGround;autGround=function(C,x,z,h){const w=_ag.apply(this,arguments);if(w>0&&typeof plWornAt==='function'&&Math.abs(x-PIS.x)<40&&Math.abs(z-PIS.z)<45){const wn=plWornAt(x,z);if(wn>0)C.lerp(PIS81.dirt||(PIS81.dirt=new THREE.Color(0xd4ab78).convertSRGBToLinear()),Math.min(1,wn*1.3)*.92)}return w}}   /* 흙길은 땅과 밝기가 비슷한 옅은 흙색(80차: 어두운 얼룩은 높낮이처럼 보여요) */
