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
/* 몸 점 고르기(캐릭터가 바뀌면 다시): 보이는 몸 메시의 꼭짓점 중 팔·손 뼈가 아닌 것을 6cm 칸마다 하나 */
function fit79Pick(actor){const key=actor.dog?actor.dog.v:'hero';let c=FIT79.cache.get(actor);if(c&&c.key===key)return c;
 c={key,list:[],n:0};const seen=new Set();
 actor.root.traverse(o=>{if(!o.isMesh||fit79InHolder(actor,o))return;for(let p=o;p&&p!==actor.root;p=p.parent)if(!p.visible)return;if(!o.visible)return;
  const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&m.transparent&&!m.alphaTest)return;const g=o.geometry,P=g.attributes.position;if(!P)return;
  let bname=null;if(!o.isSkinnedMesh){let p=o.parent;while(p&&!p.isBone)p=p.parent;bname=p?p.name:''}
  if(bname!==null&&FIT79.armRe.test(bname))return;
  const si=o.isSkinnedMesh?g.attributes.skinIndex:null,sw=o.isSkinnedMesh?g.attributes.skinWeight:null,bs=o.isSkinnedMesh?o.skeleton.bones:null,idx=[];
  for(let i=0;i<P.count;i++){if(si){const W=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],I=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];let b=0;for(let k=1;k<4;k++)if(W[k]>W[b])b=k;const bn=bs[I[b]];if(bn&&FIT79.armRe.test(bn.name))continue}
   const k=o.uuid+':'+Math.floor(P.getX(i)/FIT79.cell)+','+Math.floor(P.getY(i)/FIT79.cell)+','+Math.floor(P.getZ(i)/FIT79.cell);if(seen.has(k))continue;seen.add(k);idx.push(i)}
  if(idx.length){c.list.push({o,idx});c.n+=idx.length}});
 FIT79.cache.set(actor,c);return c}
/* 지금 장면의 몸 점(캐릭터 발밑 기준 좌표) */
function fit79Points(actor){const c=fit79Pick(actor);if(!FIT79.pts||FIT79.pts.length<c.n*3)FIT79.pts=new Float32Array(c.n*3+30);const out=FIT79.pts,v=FIT79.v;
 actor.root.updateMatrixWorld(true);FIT79.inv.copy(actor.root.matrixWorld).invert();let j=0;
 for(const {o,idx} of c.list){const P=o.geometry.attributes.position;for(const i of idx){if(o.isSkinnedMesh)o.boneTransform(i,v);else v.fromBufferAttribute(P,i);v.applyMatrix4(o.matrixWorld).applyMatrix4(FIT79.inv);out[j++]=v.x;out[j++]=v.y;out[j++]=v.z}}
 FIT79.np=j;return out}
/* pose.js clearEquipment 바꿔 끼우기: 총 조각(14cm 칸 공)과 몸 점(4.5cm 공)이 겹치면 오른쪽(−x) 또는 앞(+z) 중 덜 움직이는 쪽으로 비켜요 */
if(typeof clearEquipment==='function'){const _ce=clearEquipment;clearEquipment=function(actor,bones,model,fit,profile,scale,orientation,target){
 let pts;try{pts=fit79Points(actor)}catch(e){return _ce.apply(this,arguments)}const n=FIT79.np,cells=equipmentBounds(model.geometry);if(!n||!cells.length)return _ce.apply(this,arguments);
 actor.root.getWorldQuaternion(inverseRoot).invert();localRotation.copy(inverseRoot).multiply(orientation);
 const C=cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale).applyQuaternion(localRotation);return[p.x,p.y,p.z,b.radius*scale+FIT79.r+.012]});
 for(let pass=0;pass<3;pass++){let off=0,fwd=0;
  for(const [cx,cy,cz,R] of C){const px=cx+target.x,py=cy+target.y,pz=cz+target.z,RR=R*R;
   for(let i=0;i<n;i+=3){const dx=px-pts[i],dy=py-pts[i+1],dz=pz-pts[i+2];if(dx*dx+dy*dy+dz*dz>=RR)continue;
    const s=RR-dy*dy-dz*dz;if(s>0)off=Math.max(off,dx+Math.sqrt(s));const f=RR-dx*dx-dy*dy;if(f>0)fwd=Math.max(fwd,Math.sqrt(f)-dz)}}
  if(off<=.002&&fwd<=.002)break;if(fwd>0&&(fwd<off||off<=0))target.z+=fwd+.002;else target.x-=off+.002}}}
/* 총을 쥔 팔(오른팔): 개머리판·총몸이 팔뚝을 뚫고 지나가지 않게 팔꿈치 방향을 몇 가지로 해 보고 가장 덜 겹치는 쪽으로(reachGrip 바꿔 끼움).
   손이 총을 쥐는 자리는 그대로(손 둘레 0.16m 안 총 조각은 쥐는 손이라 안 셈). 팔 점은 오른팔 뼈(위팔·아래팔) 꼭짓점을 5cm 칸마다 하나. */
const FIT79_POLES=[[-.65,-.95,0],[-.25,-1,0],[-.3,-1,-.45],[-.9,-.45,0],[-.5,-1,.35],[-.2,-1,-.8],[-1,-.15,-.25],[-.6,-.6,-.6]];
const FIT79_ARM=/lowerarmr$|upperarmr$/i;
/* 총 방향 바꿔 보기 [총구 위아래(+ = 아래), 좌우(+ = 왼쪽, 몸 안쪽), 바꾸는 값(작을수록 먼저)] */
const FIT79_DQ=[[0,0,0],[.22,0,.006],[0,-.25,.006],[0,.25,.01],[.22,-.25,.009],[.4,0,.012],[-.2,0,.012],[0,-.45,.012],[.4,-.4,.016],[.55,-.15,.02],[.3,-.15,.012],[.15,.2,.012],[.3,.25,.016]];
FIT79.eu=new THREE.Euler();FIT79.q2=new THREE.Quaternion();
function fit79ArmPick(actor){const key=(actor.dog?actor.dog.v:'hero')+':arm';let c=FIT79.cache.get(actor.root);if(c&&c.key===key)return c;c={key,list:[],n:0};const seen=new Set();
 actor.root.traverse(o=>{if(!o.isSkinnedMesh||!o.visible||fit79InHolder(actor,o))return;for(let p=o;p&&p!==actor.root;p=p.parent)if(!p.visible)return;const g=o.geometry,P=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bs=o.skeleton.bones,idx=[];
  for(let i=0;i<P.count;i++){const W=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],I=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];let b=0;for(let k=1;k<4;k++)if(W[k]>W[b])b=k;const bn=bs[I[b]];if(!bn||!FIT79_ARM.test(bn.name))continue;
   const k=o.uuid+':'+Math.floor(P.getX(i)/.05)+','+Math.floor(P.getY(i)/.05)+','+Math.floor(P.getZ(i)/.05);if(seen.has(k))continue;seen.add(k);idx.push(i)}
  if(idx.length){c.list.push({o,idx});c.n+=idx.length}});FIT79.cache.set(actor.root,c);return c}
{const _ce=clearEquipment;clearEquipment=function(actor,bones,model,fit,profile,scale,orientation,target){const r=_ce.apply(this,arguments);
  try{const cells=equipmentBounds(model.geometry);actor.root.getWorldQuaternion(inverseRoot).invert();localRotation.copy(inverseRoot).multiply(orientation);
   FIT79.cur={actor,t:performance.now(),tl:target.clone(),orient:orientation,L:cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale);return[p,b.radius*scale]}),C:cells.map(b=>{const p=b.center.clone();p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];p.multiplyScalar(scale).applyQuaternion(localRotation);return[p.x,p.y,p.z,b.radius*scale+.04]})}}catch(e){FIT79.cur=null}return r}}
function fit79ArmScore(actor,cur,arm){const v=FIT79.v,inv=FIT79.inv;inv.copy(actor.root.matrixWorld).invert();let s=0;const T=cur.tl;
 for(const {o,idx} of arm.list)for(const i of idx){o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
  for(const [cx,cy,cz,R] of cur.C){if(cx*cx+cy*cy+cz*cz<.0256)continue;const dx=T.x+cx-v.x,dy=T.y+cy-v.y,dz=T.z+cz-v.z,d2=dx*dx+dy*dy+dz*dz;if(d2<R*R)s+=R-Math.sqrt(d2)}}return s}
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
  const bodyS=()=>{const pts=FIT79.pts,n=FIT79.np,T=cur.tl;let sc=0;if(!pts)return 0;for(const [cx,cy,cz,R0] of cur.C){const R=R0-.04+FIT79.r+.012,px=T.x+cx,py=T.y+cy,pz=T.z+cz;for(let i=0;i<n;i+=3){const dx=px-pts[i],dy=py-pts[i+1],dz=pz-pts[i+2],d2=dx*dx+dy*dy+dz*dz;if(d2<R*R)sc+=R-Math.sqrt(d2)}}return sc};
  let bo=0,bp=0;
  if(mem&&mem.key===key&&now-mem.t<150){bo=mem.o;bp=mem.p}
  else{let last=-1;bs=1e9;
   for(let j=0;j<FIT79_DQ.length;j++){setO(j);const bsc=j?bodyS()*2:0;if(bsc>=bs)continue;
    for(let k=0;k<FIT79_POLES.length;k++){run(FIT79_POLES[k]);const sc=bsc+fit79ArmScore(actor,cur,arm)+k*.004+FIT79_DQ[j][2];if(sc<bs){bs=sc;bo=j;bp=k}if(sc-bsc<.004)break}
    if(bs<.02)break}
   actor.fit79m={key,t:now,o:bo,p:bp};FIT79.score=bs}
  setO(bo);if(bo){qc.setFromEuler(FIT79.eu.set(FIT79_DQ[bo][0],FIT79_DQ[bo][1],0,'YXZ'));ok.multiply(qc)}run(FIT79_POLES[bp]);FIT79.pole=bp;FIT79.dq=bo}}
