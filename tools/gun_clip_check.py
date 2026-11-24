# 79차: 총이 캐릭터 몸에 박혀 보이는지(겹침) 숫자로 재는 검사
#  - 세 캐릭터(탐험가·리트리버·오리너구리) × 총 7종 × 자세(바라보는 쪽 4가지 · 조준 2가지)마다
#    pose.js가 총을 손에 맞춘 바로 그 장면(updEnv 뒤)에서, 총 모양의 점들이 캐릭터의 실제 피부(뼈를 따라 움직인 꼭짓점) 안쪽에 있는지 봐요.
#  - 안쪽 판정: 가장 가까운 피부 꼭짓점의 바깥 방향(면 법선 평균)과 반대쪽이고 0.25m 안이면 '박힘'. 손(쥐는 손·받치는 손) 0.13m 안과
#    가장 가까운 꼭짓점이 손 뼈(hand)에 붙은 점은 빼요(총을 쥔 손이 손잡이를 감싸는 건 겹침이 아니에요). 팔뚝·몸통·머리·귀·주둥이·부리·다리는 셈해요.
#  - 결과: 자세마다 박힌 점 비율(%)과 가장 깊이 박힌 깊이(cm). OK = 모든 자세에서 깊이 2.5cm 아래, 그리고 박힌 점이 3% 넘으면 깊이 1cm 아래(살짝 스치는 것만).
#  CHARS=hero,dog,plat  GUNS=pistol,...  로 고를 수 있어요.
import json, os
GUNS=os.environ.get('GUNS','pistol,smg,ar,burst,rifle,sniper,shotgun').split(',')
CHARS=os.environ.get('CHARS','hero,dog,plat').split(',')
POSES=[('d',0.0,0),('r',1.57,0),('l',-1.57,0),('u',3.14,0),('ar',1.57,1),('al',-1.57,1),('ad',0.0,1)]
JS=r"""()=>{if(window.__clip)return 1;window.__clip={want:0,res:null};
 const inHolder=(a,o)=>{for(let p=o;p;p=p.parent)if(p===a.holder)return true;return false};
 const meas=()=>{const a=P.a;a.root.updateMatrixWorld(true);const v=new THREE.Vector3(),B=[],N=[],BN=[];
  a.root.traverse(o=>{if(!o.isMesh||!o.visible||inHolder(a,o))return;for(let p=o;p;p=p.parent)if(!p.visible)return;const m=o.material;if(m&&(m.transparent||m.opacity<1)&&!m.alphaTest)return;
   const g=o.geometry,pos=g.attributes.position,n=pos.count,W=new Float32Array(n*3);for(let i=0;i<n;i++){if(o.isSkinnedMesh)o.boneTransform(i,v);else v.fromBufferAttribute(pos,i);v.applyMatrix4(o.matrixWorld);W[i*3]=v.x;W[i*3+1]=v.y;W[i*3+2]=v.z}
   const NN=new Float32Array(n*3),ix=g.index?g.index.array:null,T=ix?ix.length/3:n/3,e1=new THREE.Vector3(),e2=new THREE.Vector3(),fn=new THREE.Vector3();
   for(let t=0;t<T;t++){const A=ix?ix[t*3]:t*3,Bv=ix?ix[t*3+1]:t*3+1,C=ix?ix[t*3+2]:t*3+2;e1.set(W[Bv*3]-W[A*3],W[Bv*3+1]-W[A*3+1],W[Bv*3+2]-W[A*3+2]);e2.set(W[C*3]-W[A*3],W[C*3+1]-W[A*3+1],W[C*3+2]-W[A*3+2]);fn.crossVectors(e1,e2);
    for(const q of[A,Bv,C]){NN[q*3]+=fn.x;NN[q*3+1]+=fn.y;NN[q*3+2]+=fn.z}}
   const bn=new Array(n);if(o.isSkinnedMesh){const si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bs=o.skeleton.bones;for(let i=0;i<n;i++){let bi=0,bw=-1;const W4=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],I4=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];for(let c=0;c<4;c++){if(W4[c]>bw){bw=W4[c];bi=I4[c]}}bn[i]=bs[bi]?bs[bi].name:'?'}}else{let p=o;while(p&&!p.isBone)p=p.parent;bn.fill(p?p.name:o.name)}B.push(W);N.push(NN);BN.push(bn)});
  const mdl=a.holder.children[0];if(!mdl)return{err:'no model'};mdl.updateMatrixWorld(true);const gp=mdl.geometry.attributes.position,step=Math.max(1,Math.floor(gp.count/260)),pts=[];
  for(let i=0;i<gp.count;i+=step){v.fromBufferAttribute(gp,i).applyMatrix4(mdl.matrixWorld);pts.push(v.clone())}
  const bones=a.dog?a.dog.B:boneMap(a),hands=['handslotr','handslotl'].map(k=>bones[k]&&bones[k].getWorldPosition(new THREE.Vector3())).filter(Boolean);
  let inside=0,tot=0,deep=0,where=null;const byb={};
  for(const p of pts){if(hands.some(h=>h.distanceTo(p)<.13))continue;tot++;let bd=1e9,bi=-1,bk=-1;
   for(let k=0;k<B.length;k++){const W=B[k];for(let i=0;i<W.length;i+=3){const dx=p.x-W[i],dy=p.y-W[i+1],dz=p.z-W[i+2],d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;bi=i;bk=k}}}
   if(bk<0)continue;const W=B[bk],NN=N[bk],nx=NN[bi],ny=NN[bi+1],nz=NN[bi+2],nl=Math.hypot(nx,ny,nz)||1,dot=((p.x-W[bi])*nx+(p.y-W[bi+1])*ny+(p.z-W[bi+2])*nz)/nl;
   const nm=BN[bk][bi/3];if(/hand/i.test(nm)){tot--;continue}if(dot<0&&bd<.0625){inside++;byb[nm]=(byb[nm]||0)+1;if(-dot>deep){deep=-dot;where=[+(p.x-P.x).toFixed(2),+(p.y-groundY(P.x,P.z)).toFixed(2),+(p.z-P.z).toFixed(2)]}}}
  return{pct:+(inside/Math.max(1,tot)*100).toFixed(1),deep:+(deep*100).toFixed(1),where,tot,byb}};
 const _u=updEnv;updEnv=function(){const r=_u.apply(this,arguments);if(window.__clip.want){window.__clip.want--;if(!window.__clip.want)window.__clip.res=meas()}return r};return 1}"""
async def steps(pg):
    ev=pg.evaluate;out={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};P.x=VIL.x+8;P.z=VIL.z+14;S.inv.ammoS=999}")
    await ev(JS)
    for ch in CHARS:
        await ev("(c)=>{DOG.sel=c}",ch);await pg.wait_for_timeout(1600)
        for g in GUNS:
            for st,rot,aim in POSES:
                await ev("([g,rot,a])=>{S.inv[g]=1;S.quick[S.sel]=g;P.rot=rot;P.a.root.rotation.y=rot;inp.aiming=!!a;RJ.aim=!!a;RJ.ax=Math.sin(rot);RJ.az=Math.cos(rot);window.__clip.res=null;window.__clip.want=6}",[g,rot,aim])
                r=None
                for _ in range(40):
                    await pg.wait_for_timeout(60)
                    r=await ev("()=>window.__clip.res")
                    if r: break
                out[f'{ch}/{g}/{st}']=r
        await ev("()=>{inp.aiming=false;RJ.aim=false}")
    bad=[]
    for k,r in out.items():
        if not r or r.get('err') or r['deep']>=2.5 or (r['pct']>=3 and r['deep']>=1.0): bad.append((k,r))
    for ch in CHARS:
        print(ch)
        for g in GUNS:
            print('  %-8s'%g,' '.join('%s:%4.1f%%/%4.1fcm'%(st,(out.get(f'{ch}/{g}/{st}') or {}).get('pct',-1),(out.get(f'{ch}/{g}/{st}') or {}).get('deep',-1)) for st,_,_ in POSES))
    print('BAD',len(bad),json.dumps(bad,ensure_ascii=False))
    print('ALL',len(bad)==0)
