/* ===== 79차(규칙, 기획자 11-24 22:38): 총이 캐릭터 몸에 박혀 보이지 않게 =====
   기획자: '낚싯대는 모션이 자연스럽고 겹치는 게 안 보이는데 총들은 캐릭터랑 껴 있어, 방법을 잘 찾아봐. 해결했다면 앞으로 캐릭터를 만들 때 바로 겹치거나 이상하게 보이지 않는 식으로'.
   - 까닭: pose.js(68차)는 몸을 손으로 잰 타원 몇 개(carryFit.body)로 보고 총을 비켜 들었어요. 리트리버·오리너구리는 머리·귀·주둥이·부리·볼이 그 타원보다 커서
     긴 총(현대 소총·점사 소총·저격총)의 개머리판·총열이 머리·볼·가슴에 4~10cm 박혀 있었어요(tools/gun_clip_check.py로 잼).
   - 고친 법: 타원 대신 **그 캐릭터의 실제 피부**(뼈를 따라 움직인 꼭짓점을 6cm 칸으로 골라 낸 점 수백 개)를 매 장면 보고, 총 조각과 겹치면
     오른쪽(바깥)이나 앞으로 겹치지 않을 만큼만 비켜요(pose.js clearEquipment를 바꿔 끼움, 두 번 되풀이). 팔·손(총을 쥐는 쪽)은 빼고 봐요.
   - 그래서 **새 캐릭터도 따로 숫자를 재지 않아도 저절로** 몸에 안 박혀요(carryFit은 쥐는 자리·크기만 쓰고 body 타원은 이제 안 써요).
     새 캐릭터를 만들면 tools/gun_clip_check.py(CHARS=새 캐릭터)로 확인하세요 — 모든 총·자세에서 박힌 점 3% 아래·깊이 2.5cm 아래. */
const FIT79={cell:.06,r:.045,armRe:/arm|hand/i,cache:new WeakMap(),pts:null,inv:new THREE.Matrix4(),v:new THREE.Vector3()};
function fit79InHolder(a,o){for(let p=o;p;p=p.parent)if(p===a.holder)return true;return false}
/* 80차(성능, 기획자 11-25 '폰이 렉'): 예전엔 메시 좌표로 6cm 칸을 골라 리트리버가 몸 점 7천여 개, 매 장면 boneTransform으로 옮겼어요(총 들면 한 장면 6~9ms).
   → 캐릭터 발밑 좌표 6cm 칸으로 한 번 골라(약 3천 개) 뼈마다 행렬 하나만 계산해 옮기고(fit79Xf), 겹침은 25cm 격자로 가까운 점만 봐요(fit79Grid). 계산 방식(점 공 4.5cm)은 그대로예요. */
function fit79Grab(actor,keep,cell){actor.root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(actor.root.matrixWorld).invert(),v=new THREE.Vector3(),bp=new THREE.Vector3(),seen=new Set(),list=[];let n=0;
 actor.root.traverse(o=>{if(!o.isMesh||fit79InHolder(actor,o))return;for(let p=o;p&&p!==actor.root;p=p.parent)if(!p.visible)return;if(!o.visible)return;
  const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&m.transparent&&!m.alphaTest)return;const g=o.geometry,P=g.attributes.position;if(!P)return;
  const sk=!!o.isSkinnedMesh;let bname=null;if(!sk){let p=o.parent;while(p&&!p.isBone)p=p.parent;bname=p?p.name:''}
  const si=sk?g.attributes.skinIndex:null,sw=sk?g.attributes.skinWeight:null,bs=sk?o.skeleton.bones:null,B=[],W=[],Lc=[];let cnt=0;
  for(let i=0;i<P.count;i++){let W4=null,I4=null,dn=bname;if(sk){W4=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)];I4=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];let b=0;for(let k=1;k<4;k++)if(W4[k]>W4[b])b=k;dn=bs[I4[b]]?bs[I4[b]].name:''}
   if(!keep(dn,sk))continue;
   if(sk)o.boneTransform(i,v);else v.fromBufferAttribute(P,i);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
   const k=Math.floor(v.x/cell)+','+Math.floor(v.y/cell)+','+Math.floor(v.z/cell);if(seen.has(k))continue;seen.add(k);
   if(sk){bp.fromBufferAttribute(P,i).applyMatrix4(o.bindMatrix);for(let c=0;c<4;c++){const b=I4[c],w=W4[c];B.push(b);W.push(w);const q=v.copy(bp).applyMatrix4(o.skeleton.boneInverses[b]||new THREE.Matrix4());Lc.push(q.x,q.y,q.z)}}
   else{v.fromBufferAttribute(P,i);Lc.push(v.x,v.y,v.z)}cnt++}
  if(cnt){list.push({o,sk,n:cnt,B:sk?Int16Array.from(B):null,W:sk?Float32Array.from(W):null,L:Float32Array.from(Lc),G:sk?bs.map(()=>new THREE.Matrix4()):null,gf:sk?new Int32Array(bs.length):null});n+=cnt}});
 return {list,n}}
function fit79Pick(actor){const key=actor.dog?actor.dog.v:'hero';let c=FIT79.cache.get(actor);if(c&&c.key===key)return c;
 c=fit79Grab(actor,(dn,sk)=>!(dn&&FIT79.armRe.test(dn)),FIT79.cell);c.key=key;FIT79.cache.set(actor,c);return c}
/* 고른 점을 지금 장면으로(캐릭터 발밑 좌표). boneTransform과 같은 식: 뼈 행렬 × 뼈 역행렬 × bindMatrix × 점, 뼈 행렬은 장면마다 뼈 하나에 한 번 */
FIT79.fr=0;FIT79.K=new THREE.Matrix4();
function fit79Xf(actor,c,out){const inv=FIT79.inv.copy(actor.root.matrixWorld).invert(),K=FIT79.K,fr=++FIT79.fr;let j=0;
 for(const e of c.list){const o=e.o,L=e.L;
  if(e.sk){K.multiplyMatrices(inv,o.matrixWorld).multiply(o.bindMatrixInverse);const bones=o.skeleton.bones,G=e.G,gf=e.gf,B=e.B,W=e.W;
   for(let p=0;p<e.n;p++){let x=0,y=0,z=0;for(let c4=0;c4<4;c4++){const q=p*4+c4,w=W[q];if(!w)continue;const b=B[q];if(gf[b]!==fr){G[b].multiplyMatrices(K,bones[b].matrixWorld);gf[b]=fr}
     const m=G[b].elements,l=q*3,lx=L[l],ly=L[l+1],lz=L[l+2];x+=w*(m[0]*lx+m[4]*ly+m[8]*lz+m[12]);y+=w*(m[1]*lx+m[5]*ly+m[9]*lz+m[13]);z+=w*(m[2]*lx+m[6]*ly+m[10]*lz+m[14])}
    out[j++]=x;out[j++]=y;out[j++]=z}}
  else{K.multiplyMatrices(inv,o.matrixWorld);const m=K.elements;for(let p=0;p<e.n;p++){const l=p*3,lx=L[l],ly=L[l+1],lz=L[l+2];out[j++]=m[0]*lx+m[4]*ly+m[8]*lz+m[12];out[j++]=m[1]*lx+m[5]*ly+m[9]*lz+m[13];out[j++]=m[2]*lx+m[6]*ly+m[10]*lz+m[14]}}}
 return j}
/* 몸 점 25cm 격자(발밑 기준 x·z −2~2m, y −1~3m). 격자 밖 점은 가장자리 칸에 넣어요(거리는 실제로 재요) */
const FGR={s:.25,ox:-2,oy:-1,oz:-2,nx:16,ny:16,nz:16,st:null,cc:null,ix:null,ci:null};
function fgI(v,o,n){const i=Math.floor((v-o)/FGR.s);return i<0?0:i>=n?n-1:i}
function fit79Grid(pts,np){const G=FGR,n=np/3,N=G.nx*G.ny*G.nz;if(!G.st){G.st=new Int32Array(N+1);G.cc=new Int32Array(N)}if(!G.ix||G.ix.length<n){G.ix=new Int32Array(n+64);G.ci=new Int32Array(n+64)}
 G.cc.fill(0);for(let p=0;p<n;p++){const c=(fgI(pts[p*3],G.ox,G.nx)*G.ny+fgI(pts[p*3+1],G.oy,G.ny))*G.nz+fgI(pts[p*3+2],G.oz,G.nz);G.ci[p]=c;G.cc[c]++}
 let s=0;for(let c=0;c<N;c++){G.st[c]=s;s+=G.cc[c]}G.st[N]=s;G.cc.fill(0);for(let p=0;p<n;p++){const c=G.ci[p];G.ix[G.st[c]+G.cc[c]++]=p}}
/* 공 (px,py,pz,R) 안에 들 수 있는 점마다 f(점 번호×3) */
function fit79Near(px,py,pz,R,f){const G=FGR,x0=fgI(px-R,G.ox,G.nx),x1=fgI(px+R,G.ox,G.nx),y0=fgI(py-R,G.oy,G.ny),y1=fgI(py+R,G.oy,G.ny),z0=fgI(pz-R,G.oz,G.nz),z1=fgI(pz+R,G.oz,G.nz);
 for(let a=x0;a<=x1;a++)for(let b=y0;b<=y1;b++){const r=(a*G.ny+b)*G.nz;for(let c=z0;c<=z1;c++){const k=r+c,e=G.st[k+1];for(let q=G.st[k];q<e;q++)f(G.ix[q]*3)}}}
/* 지금 장면의 몸 점(캐릭터 발밑 기준 좌표) + 격자 */
function fit79Points(actor){const c=fit79Pick(actor);if(!FIT79.pts||FIT79.pts.length<c.n*3)FIT79.pts=new Float32Array(c.n*3+30);
 actor.root.updateMatrixWorld(true);FIT79.np=fit79Xf(actor,c,FIT79.pts);fit79Grid(FIT79.pts,FIT79.np);return FIT79.pts}
/* pose.js clearEquipment 바꿔 끼우기: 총 조각(14cm 칸 공)과 몸 점(4.5cm 공)이 겹치면 오른쪽(−x) 또는 앞(+z) 중 덜 움직이는 쪽으로 비켜요 */
if(typeof clearEquipment==='function'){const _ce=clearEquipment;clearEquipment=function(actor,bones,model,fit,profile,scale,orientation,target){
 let pts;try{pts=fit79Points(actor)}catch(e){return _ce.apply(this,arguments)}const n=FIT79.np,cells=equipmentBounds(model.geometry);if(!n||!cells.length)return _ce.apply(this,arguments);
 actor.root.getWorldQuaternion(inverseRoot).invert();localRotation.copy(inverseRoot).multiply(orientation);
 const C=cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale).applyQuaternion(localRotation);return[p.x,p.y,p.z,b.radius*scale+FIT79.r+.012]});
 let off=0,fwd=0,px=0,py=0,pz=0,RR=0;const hit=i=>{const dx=px-pts[i],dy=py-pts[i+1],dz=pz-pts[i+2];if(dx*dx+dy*dy+dz*dz>=RR)return;
   const s=RR-dy*dy-dz*dz;if(s>0)off=Math.max(off,dx+Math.sqrt(s));const f=RR-dx*dx-dy*dy;if(f>0)fwd=Math.max(fwd,Math.sqrt(f)-dz)};
 for(let pass=0;pass<3;pass++){off=0;fwd=0;
  for(const [cx,cy,cz,R] of C){px=cx+target.x;py=cy+target.y;pz=cz+target.z;RR=R*R;fit79Near(px,py,pz,R,hit)}
  if(off<=.002&&fwd<=.002)break;if(fwd>0&&(fwd<off||off<=0))target.z+=fwd+.002;else target.x-=off+.002}}}
/* 총을 쥔 팔(오른팔): 개머리판·총몸이 팔뚝을 뚫고 지나가지 않게 팔꿈치 방향을 몇 가지로 해 보고 가장 덜 겹치는 쪽으로(reachGrip 바꿔 끼움).
   손이 총을 쥐는 자리는 그대로(손 둘레 0.16m 안 총 조각은 쥐는 손이라 안 셈). 팔 점은 오른팔 뼈(위팔·아래팔) 꼭짓점을 5cm 칸마다 하나. */
const FIT79_POLES=[[-.65,-.95,0],[-.25,-1,0],[-.3,-1,-.45],[-.9,-.45,0],[-.5,-1,.35],[-.2,-1,-.8],[-1,-.15,-.25],[-.6,-.6,-.6]];
const FIT79_ARM=/lowerarmr$|upperarmr$/i;
/* 총 방향 바꿔 보기 [총구 위아래(+ = 아래), 좌우(+ = 왼쪽, 몸 안쪽), 바꾸는 값(작을수록 먼저)] */
const FIT79_DQ=[[0,0,0],[.22,0,.006],[0,-.25,.006],[0,.25,.01],[.22,-.25,.009],[.4,0,.012],[-.2,0,.012],[0,-.45,.012],[.4,-.4,.016],[.55,-.15,.02],[.3,-.15,.012],[.15,.2,.012],[.3,.25,.016]];
FIT79.eu=new THREE.Euler();FIT79.q2=new THREE.Quaternion();
function fit79ArmPick(actor){const key=(actor.dog?actor.dog.v:'hero')+':arm';let c=FIT79.cache.get(actor.root);if(c&&c.key===key)return c;
 c=fit79Grab(actor,(dn,sk)=>sk&&!!dn&&FIT79_ARM.test(dn),.05);c.key=key;FIT79.cache.set(actor.root,c);return c}
{const _ce=clearEquipment;clearEquipment=function(actor,bones,model,fit,profile,scale,orientation,target){const r=_ce.apply(this,arguments);
  try{const cells=equipmentBounds(model.geometry);actor.root.getWorldQuaternion(inverseRoot).invert();localRotation.copy(inverseRoot).multiply(orientation);
   FIT79.cur={actor,t:performance.now(),tl:target.clone(),orient:orientation,L:cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale);return[p,b.radius*scale]}),C:cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale).applyQuaternion(localRotation);return[p.x,p.y,p.z,b.radius*scale+.04]})}}catch(e){FIT79.cur=null}return r}}
function fit79ArmScore(actor,cur,arm){if(!FIT79.apts||FIT79.apts.length<arm.n*3)FIT79.apts=new Float32Array(arm.n*3+30);const A=FIT79.apts,na=fit79Xf(actor,arm,A),T=cur.tl;let s=0;
 let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=0;i<na;i+=3){const x=A[i],y=A[i+1],z=A[i+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}
 for(const [cx,cy,cz,R] of cur.C){if(cx*cx+cy*cy+cz*cz<.0256)continue;const px=T.x+cx,py=T.y+cy,pz=T.z+cz;if(px+R<x0||px-R>x1||py+R<y0||py-R>y1||pz+R<z0||pz-R>z1)continue;const RR=R*R;
  for(let i=0;i<na;i+=3){const dx=px-A[i],dy=py-A[i+1],dz=pz-A[i+2],d2=dx*dx+dy*dy+dz*dz;if(d2<RR)s+=R-Math.sqrt(d2)}}return s}
if(typeof reachGrip==='function'){const _rg=reachGrip;reachGrip=function(bones,side,target,yaw){const cur=FIT79.cur,actor=cur&&cur.actor;
  if(side!=='r'||!cur||performance.now()-cur.t>50||!actor||!weaponPose[actor.wid]||actor.wid==='chainsaw')return _rg.apply(this,arguments);
  let arm;try{arm=fit79ArmPick(actor)}catch(e){return _rg.apply(this,arguments)}if(!arm.n)return _rg.apply(this,arguments);
  const up=bones.upperarmr,lo=bones.lowerarmr,q0=up.quaternion.clone(),q1=lo.quaternion.clone(),m=poseMath,c=Math.cos(yaw),s=Math.sin(yaw);let best=-1,bs=1e9;
  const run=(P)=>{up.quaternion.copy(q0);lo.quaternion.copy(q1);up.updateMatrixWorld(true);
   up.getWorldPosition(m.shoulder);lo.getWorldPosition(m.elbow);bones.handslotr.getWorldPosition(m.hand);const a=m.shoulder.distanceTo(m.elbow),b=m.elbow.distanceTo(m.hand);
   m.axis.subVectors(target,m.shoulder);const dist=Math.max(Math.abs(a-b)+.0001,Math.min(a+b-.0001,m.axis.length()));m.axis.normalize();const along=(a*a-b*b+dist*dist)/(2*dist);
   m.pole.set(P[0]*c+P[2]*s,P[1],-P[0]*s+P[2]*c);m.pole.addScaledVector(m.axis,-m.pole.dot(m.axis));if(m.pole.lengthSq()<1e-6)m.pole.set(0,-1,0);m.pole.normalize();
   m.bend.copy(m.shoulder).addScaledVector(m.axis,along).addScaledVector(m.pole,Math.sqrt(Math.max(0,a*a-along*along)));turnArm(up,lo,m.bend);m.goal.copy(m.shoulder).addScaledVector(m.axis,dist);turnArm(lo,bones.handslotr,m.goal);up.updateMatrixWorld(true)};
  /* 총 방향도 조금씩(쥔 손 둘레로 돌려서: 총구 위·아래·안·밖) 해 보고, 팔·몸과 가장 덜 겹치는 방향 + 팔꿈치를 골라요. 0.15초 동안은 고른 것을 그대로 써요 */
  const ok=cur.orient,qi=FIT79.qi||(FIT79.qi=new THREE.Quaternion()),qc=FIT79.qc||(FIT79.qc=new THREE.Quaternion()),key=actor.wid+':'+(actor.weaponLift>.5?1:0),now=performance.now(),mem=actor.fit79m;
  actor.root.getWorldQuaternion(qi).invert();
  const setO=(j)=>{const d=FIT79_DQ[j];qc.setFromEuler(FIT79.eu.set(d[0],d[1],0,'YXZ'));const Q=FIT79.q2.copy(qi).multiply(ok).multiply(qc);cur.C=cur.L.map(([p,r])=>{const v=p.clone().applyQuaternion(Q);return[v.x,v.y,v.z,r+.04]})};
  const bodyS=()=>{const pts=FIT79.pts,T=cur.tl;let sc=0,R=0,px=0,py=0,pz=0;if(!pts||!FIT79.np)return 0;const f=i=>{const dx=px-pts[i],dy=py-pts[i+1],dz=pz-pts[i+2],d2=dx*dx+dy*dy+dz*dz;if(d2<R*R)sc+=R-Math.sqrt(d2)};for(const [cx,cy,cz,R0] of cur.C){R=R0-.04+FIT79.r+.012;px=T.x+cx;py=T.y+cy;pz=T.z+cz;fit79Near(px,py,pz,R,f)}return sc};
  let bo=0,bp=0;
  if(mem&&mem.key===key&&now-mem.t<150){bo=mem.o;bp=mem.p}
  else{let last=-1;bs=1e9;
   for(let j=0;j<FIT79_DQ.length;j++){setO(j);const bsc=j?bodyS()*2:0;if(bsc>=bs)continue;
    for(let k=0;k<FIT79_POLES.length;k++){run(FIT79_POLES[k]);const sc=bsc+fit79ArmScore(actor,cur,arm)+k*.004+FIT79_DQ[j][2];if(sc<bs){bs=sc;bo=j;bp=k}if(sc-bsc<.004)break}
    if(bs<.02)break}
   actor.fit79m={key,t:now,o:bo,p:bp};FIT79.score=bs}
  setO(bo);if(bo){qc.setFromEuler(FIT79.eu.set(FIT79_DQ[bo][0],FIT79_DQ[bo][1],0,'YXZ'));ok.multiply(qc)}run(FIT79_POLES[bp]);FIT79.pole=bp;FIT79.dq=bo}}
