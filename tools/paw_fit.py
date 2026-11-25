# 80차: 앞발(쥐는 손·받치는 손)이 총 몸통을 얼마나 삼키는지 재는 도구 + js/r80.js PAW80 표 뽑기
#  - 리트리버·오리너구리 앞발은 동그란 벙어리장갑이라, 손잡이 가운데를 쥐면 총 몸통이 앞발 속에 묻혀 보여요(기획자 11-25: '손가락이 짧고 두꺼워서 겹치는 느낌').
#  - 쥐는 손: 손잡이 기둥(손잡이 점 아래·앞뒤 0.11) 말고 앞발 속에 들어간 총 점 수 = bad. 받치는 손: 앞발 속 총 점 전부 = bad.
#  - 기본: PAW80 끔/켬을 비교해요(켬이 끔보다 줄어야 해요). SCAN=1 이면 올림·내림 값마다 bad를 찍어요(새 캐릭터 표 만들기).
#  CHARS=dog,plat  GUNS=pistol,...
import json,os
CH=os.environ.get('CHARS','dog,plat').split(',');GN=os.environ.get('GUNS','pistol,smg,ar,burst,rifle,sniper,shotgun').split(',');SCAN=os.environ.get('SCAN')=='1'
DY=[0,.04,.08,.12,.16,.2,.24]
JS=r"""(side)=>{const a=P.a;a.root.updateMatrixWorld(true);const mdl=a.holder.children[0];mdl.updateMatrixWorld(true);const inv=mdl.matrixWorld.clone().invert();
 const v=new THREE.Vector3(),pw=[],pn=[];const re=new RegExp('hand'+side+'$');
 a.root.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;const g=o.geometry,pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bs=o.skeleton.bones,n=pos.count;
   const W=new Float32Array(n*3),sel=new Uint8Array(n);for(let i=0;i<n;i++){let bi=0,bw=-1;const w4=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],i4=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];for(let c=0;c<4;c++){if(w4[c]>bw){bw=w4[c];bi=i4[c]}}const nm=bs[bi]?bs[bi].name:'';if(!re.test(nm))continue;sel[i]=1;o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);W[i*3]=v.x;W[i*3+1]=v.y;W[i*3+2]=v.z}
   const ix=g.index?g.index.array:null,T=ix?ix.length/3:n/3,NN=new Float32Array(n*3),e1=new THREE.Vector3(),e2=new THREE.Vector3(),fn=new THREE.Vector3();
   for(let t=0;t<T;t++){const A=ix?ix[t*3]:t*3,B=ix?ix[t*3+1]:t*3+1,C=ix?ix[t*3+2]:t*3+2;if(!sel[A]||!sel[B]||!sel[C])continue;e1.set(W[B*3]-W[A*3],W[B*3+1]-W[A*3+1],W[B*3+2]-W[A*3+2]);e2.set(W[C*3]-W[A*3],W[C*3+1]-W[A*3+1],W[C*3+2]-W[A*3+2]);fn.crossVectors(e1,e2);for(const q of[A,B,C]){NN[q*3]+=fn.x;NN[q*3+1]+=fn.y;NN[q*3+2]+=fn.z}}
   for(let i=0;i<n;i++)if(sel[i]){pw.push(new THREE.Vector3(W[i*3],W[i*3+1],W[i*3+2]).applyMatrix4(inv));pn.push(new THREE.Vector3(NN[i*3],NN[i*3+1],NN[i*3+2]).normalize().transformDirection(inv))}});
 const W0=window.__WP0[a.wid],an=W0[side==='r'?0:1];
 const gp=mdl.geometry.attributes.position,step=Math.max(1,Math.floor(gp.count/1500));let bad=0,grip=0,deep=0;
 for(let i=0;i<gp.count;i+=step){v.fromBufferAttribute(gp,i);let bd=1e9,bi=-1;for(let k=0;k<pw.length;k++){const d=pw[k].distanceToSquared(v);if(d<bd){bd=d;bi=k}}if(bi<0)continue;const d=v.clone().sub(pw[bi]).dot(pn[bi]);
   if(d<0&&bd<.09){const isGrip=side==='r'&&v.y<an[1]+.09&&Math.abs(v.z-an[2])<.11;if(isGrip)grip++;else{bad++;deep=Math.max(deep,-d)}}}
 return {bad,grip,deep}}"""
async def steps(pg):
    ev=pg.evaluate
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};P.x=VIL.x+8;P.z=VIL.z+14}")
    await ev("""()=>{window.__pm={want:0,res:null,side:'r'};window.__ov={};const WP0={};for(const k in weaponPose)WP0[k]=weaponPose[k].map(a=>Array.isArray(a)?a.slice():a);window.__WP0=WP0;window.__T0=PAW80.t;
      const _ph=placeHeldWeapon;placeHeldWeapon=function(actor,dt){const id=actor.wid,o=window.__ov;if(WP0[id]&&o.on){const p=weaponPose[id];p[0]=[WP0[id][0][0],WP0[id][0][1]-o.r,WP0[id][0][2]];if(WP0[id][1])p[1]=[WP0[id][1][0],WP0[id][1][1]+o.l,WP0[id][1][2]]}
        const r=_ph.apply(this,arguments);if(WP0[id]&&o.on){weaponPose[id][0]=WP0[id][0].slice();if(WP0[id][1])weaponPose[id][1]=WP0[id][1].slice()}return r};
      const _u=updEnv;updEnv=function(){const r=_u.apply(this,arguments);if(window.__pm.want){window.__pm.want--;if(!window.__pm.want)window.__pm.res=window.__pmf(window.__pm.side)}return r}}""")
    await ev("(s)=>{window.__pmf=eval(s)}",JS)
    async def meas(g,side,ov,paw):
        await ev("([g,s,ov,paw])=>{PAW80.t=paw?window.__T0:{};S.inv[g]=1;S.quick[S.sel]=g;P.rot=0;P.a.root.rotation.y=0;window.__ov=ov;window.__pm.side=s;window.__pm.res=null;window.__pm.want=5}",[g,side,ov,paw])
        for _ in range(40):
            await pg.wait_for_timeout(50);r=await ev("()=>window.__pm.res")
            if r:return r
    worse=[]
    for ch in CH:
        await ev("(c)=>{DOG.sel=c}",ch);await pg.wait_for_timeout(1500)
        for g in GN:
            for side in ['r','l']:
                if SCAN:
                    row=[]
                    for dy in DY:
                        r=await meas(g,side,{'on':1,'r':dy if side=='r' else 0,'l':-dy if side=='l' else 0},0);row.append(r)
                    print(ch,g,side,' '.join('%.2f:%d'%(dy,x['bad']) for dy,x in zip(DY,row)))
                else:
                    a=await meas(g,side,{},0);b=await meas(g,side,{},1)
                    print('%-5s %-8s %s  끔 %4d(깊이 %.2f) → 켬 %4d(깊이 %.2f)'%(ch,g,side,a['bad'],a['deep'],b['bad'],b['deep']))
                    if b['bad']>a['bad']+5:worse.append((ch,g,side))
    await ev("()=>{PAW80.t=window.__T0}")
    if not SCAN:print('WORSE',worse);print('ALL',not worse)
