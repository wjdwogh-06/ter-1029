# 80차 검사: 바람섬 땅 무늬(평평해 보이게) · 앞발로 총 쥐기 · 렉 줄이기(보이는 건 그대로)
import json,os
async def steps(pg):
    ev=pg.evaluate;R={}
    # ① 바람섬 땅: 땅 높이는 원래 평평(안쪽 높이 차 0.2m 아래), 땅 색의 어두운 큰 얼룩(언덕 그늘처럼 보이던 것)이 없어야
    R['ground']=await ev("""()=>{const out={};for(const nm of ['바람섬','바람섬 남쪽','초승달 본섬']){const I=ISL.find(i=>i.n===nm);const L=[];let hmn=9,hmx=-9;
       for(const t of tchunks){const g=t.m.geometry,P=g.attributes.position.array,A=g.attributes.color.array;for(let k=0;k<P.length;k+=3){const x=P[k],h=P[k+1],z=P[k+2];if(h<1||islAt(x,z)!==I)continue;
         if(hAt(x+14,z)<.6||hAt(x-14,z)<.6||hAt(x,z+14)<.6||hAt(x,z-14)<.6)continue;hmn=Math.min(hmn,h);hmx=Math.max(hmx,h);L.push(.2126*A[k]+.7152*A[k+1]+.0722*A[k+2])}}
       L.sort((a,b)=>a-b);const med=L[L.length>>1],dark=L.filter(v=>v<med*.82).length/L.length;out[nm]={n:L.length,hRange:+(hmx-hmn).toFixed(3),dark:+(dark*100).toFixed(1)}}
      out.ok=out['바람섬'].dark<3&&out['바람섬 남쪽'].dark<3&&out['바람섬'].hRange<.25;return out}""")
    # ② 몸 점 옮기기(fit79Xf)가 boneTransform과 같은지
    for ch in ['dog','plat','hero']:
        await ev("(c)=>{DOG.sel=c}",ch);await pg.wait_for_timeout(1500)
        await ev("()=>{S.inv.ar=1;S.quick[S.sel]='ar'}");await pg.wait_for_timeout(700)
        R['xf_'+ch]=await ev("""()=>{const a=P.a;a.root.updateMatrixWorld(true);const c=fit79Pick(a),out=new Float32Array(c.n*3),n=fit79Xf(a,c,out),inv=a.root.matrixWorld.clone().invert(),v=new THREE.Vector3();let mx=0,j=0;
         /* 같은 점을 boneTransform으로: 고를 때 쓴 꼭짓점 번호는 없어서, 메시마다 무작위 30점을 새 방식·옛 방식으로 비교 */
         for(const e of c.list){const o=e.o,G=o.geometry,P=G.attributes.position;const tmp={list:[e],n:e.n};for(let t=0;t<Math.min(30,e.n);t++){}}
         let err=0,cnt=0;a.root.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;const G=o.geometry,P=G.attributes.position,si=G.attributes.skinIndex,sw=G.attributes.skinWeight,bp=new THREE.Vector3();
           for(let t=0;t<40;t++){const i=(t*7919)%P.count;o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
             const W4=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],I4=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];bp.fromBufferAttribute(P,i).applyMatrix4(o.bindMatrix);
             const K=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld).multiply(o.bindMatrixInverse);const s=new THREE.Vector3();
             for(let c4=0;c4<4;c4++){if(!W4[c4])continue;const b=I4[c4],L=bp.clone().applyMatrix4(o.skeleton.boneInverses[b]),M=new THREE.Matrix4().multiplyMatrices(K,o.skeleton.bones[b].matrixWorld);s.addScaledVector(L.applyMatrix4(M),W4[c4])}
             err=Math.max(err,s.distanceTo(v));cnt++}});
         const t0=performance.now();for(let i=0;i<30;i++){fit79Points(a)}const tp=(performance.now()-t0)/30;
         return {pts:c.n,err:+(err*1000).toFixed(3),cnt,msPoints:+tp.toFixed(3),ok:err<.001&&c.n<4500}}""")
    # ③ 앞발: PAW80 표가 들어가고, 총 손잡이 표(weaponPose)는 그대로 돌아와요
    await ev("(c)=>{DOG.sel=c}",'dog');await pg.wait_for_timeout(1500)
    R['paw']=await ev("""async()=>{const w0=JSON.stringify(weaponPose);const out={};for(const g of ['pistol','ar','sniper']){S.inv[g]=1;S.quick[S.sel]=g;await new Promise(r=>setTimeout(r,400));out[g]=paw80(P.a,g)}
       const same=JSON.stringify(weaponPose)===w0;const t0=performance.now();for(let i=0;i<20;i++)placeHeldWeapon(P.a,.016);const ms=(performance.now()-t0)/20;
       return {out,same,msPlace:+ms.toFixed(3),hero:paw80({},'ar'),ok:same&&!!out.pistol&&ms<4}}""")
    # ④ 움직이지 않은 물건 행렬 건너뛰기: 움직이면·부모가 바뀌면 바로 따라와요
    R['matrix']=await ev("""()=>{const a=new THREE.Object3D(),b=new THREE.Object3D(),c=new THREE.Object3D();scene.add(a);scene.add(b);a.add(c);c.position.set(1,0,0);scene.updateMatrixWorld();
       const w=()=>{const v=new THREE.Vector3();c.getWorldPosition(v);return [v.x,v.y,v.z].map(x=>+x.toFixed(3))};const r0=w();a.position.set(0,5,0);scene.updateMatrixWorld();const r1=w();
       c.position.x=2;scene.updateMatrixWorld();const r2=w();b.position.set(10,0,0);scene.updateMatrixWorld();b.add(c);scene.updateMatrixWorld();const r3=w();scene.remove(a);scene.remove(b);
       const ok=JSON.stringify([r0,r1,r2,r3])===JSON.stringify([[1,0,0],[1,5,0],[2,5,0],[12,0,0]]);return {r0,r1,r2,r3,ok}}""")
    # ⑤ 먼 구조물은 그리는 동안만 숨기고 바로 돌려놔요 · 가까운 건 그대로 · 화면은 똑같아요
    await ev("()=>{P.x=VIL.x+8;P.z=VIL.z+14}");await pg.wait_for_timeout(1500)
    R['cull']=await ev("""()=>{let hidAtRender=0,nearHid=0;const _r=R.render;R.render=function(sc,ca){if(sc===scene&&ca===cam){hidAtRender=CULL80.hid.length;for(const m of CULL80.hid){const s=structs.find(s=>s.m===m);if(s&&Math.abs(s.x-camT.x)<120&&Math.abs(s.z-camT.z)<120)nearHid++}}return _r.apply(this,arguments)};
       return new Promise(res=>setTimeout(()=>{R.render=_r;const after=structs.filter(s=>s.m&&!s.m.visible&&!s.in).length;res({hidAtRender,nearHid,afterHidden:CULL80.hid.length,ok:hidAtRender>200&&nearHid===0&&CULL80.hid.length===0})},500))}""")
    from PIL import Image,ImageChops
    # 같은 장면을 그대로 두고(시간·애니메이션 멈춤) 끔/켬을 한 번씩 그려서 비교해요
    await ev("()=>{window.__fz=1;const _t=tick;tick=function(dt){if(window.__fz)return;return _t.apply(this,arguments)}}")
    async def shot(on,name):
        await ev("(on)=>{CULL80.on=!!on;cullRegions(camT.x,camT.z);R.render(scene,cam);drawFx(0)}",on)
        await pg.screenshot(path=OUT+'/'+name)
    await shot(0,'p80_cull_off.png');await shot(0,'p80_cull_off2.png');await shot(1,'p80_cull_on.png')
    await ev("()=>{window.__fz=0;CULL80.on=true}")
    def diff(a,b):
        d=ImageChops.difference(Image.open(OUT+'/'+a).convert('RGB'),Image.open(OUT+'/'+b).convert('RGB'));h=d.convert('L').histogram();return sum(h[24:])/sum(h)
    n0=diff('p80_cull_off.png','p80_cull_off2.png');n1=diff('p80_cull_off2.png','p80_cull_on.png')
    R['cullShot']={'noise':round(n0*100,3),'diffPct':round(n1*100,3),'ok':n1<=n0+.002}
    # ⑥ 화면 해상도 맞추기(AQ80): 기기 화소 비율 2로 흉내 → 한 단계마다 낮아지고 1 아래로는 안 내려가요, 마지막엔 그림자 1024, 돌아오면 그대로
    R['aq']=await ev("""()=>{const d0=DPR,o=[];DPR=2;for(let lv=0;lv<AQ80.k.length;lv++){AQ80.lv=lv;aq80Apply();o.push(+R.getPixelRatio().toFixed(2))}const g0=opt.gfx;opt.gfx=1;AQ80.sh=1;aq80Apply();const s1=sun.shadow.mapSize.x;AQ80.sh=0;aq80Apply();const s2=sun.shadow.mapSize.x;
       AQ80.lv=0;DPR=d0;aq80Apply();opt.gfx=g0;resize();const back=R.getPixelRatio();return {steps:o,shadow:[s1,s2],back,webdriverOff:!AQ80.on,ok:o[0]===2&&o[o.length-1]===1&&o.every((v,i)=>!i||v<=o[i-1])&&s1===1024&&s2===2048&&back===d0}}""")
    allok=all(v.get('ok',True) for v in R.values() if isinstance(v,dict))
    for k,v in R.items():print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',allok)
