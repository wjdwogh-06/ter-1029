# 배치 점검: 보급지·항구·센터에서 구조물끼리 붙어 있거나(틈 0.35m 미만), 사람이 겨우 지나가는 좁은 틈(0.35~1.15m)을 찾아요.
# 같은 종류가 이어지는 것(모래주머니끼리, 철조망끼리)은 원래 붙어 있는 거라 빼요. 위에서 내려다본 사진(빨간 선 = 충돌 상자)도 찍어요.
# 결과: tools/out/aud_sup*.jpg, aud_port*.jpg / 출력 tight(붙음), narrow(좁은 틈)
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy)}")
    rep=await ev("""()=>{
      const box=s=>{const d=sdef(s),c=Math.cos(s.r||0),n=Math.sin(s.r||0),P=[];const bx=d.bx*(d.s&&s.t==='ptent'?1:1),bz=d.bz;
        for(let i=0;i<=8;i++)for(const [u,v] of [[-1+i/4,-1],[-1+i/4,1],[-1,-1+i/4],[1,-1+i/4]]){const lx=u*bx,lz=v*bz;P.push([s.x+lx*c+lz*n,s.z-lx*n+lz*c])}return P};
      const inside=(s,x,z)=>{const d=sdef(s),c=Math.cos(s.r||0),n=Math.sin(s.r||0),ex=x-s.x,ez=z-s.z,lx=ex*c-ez*n,lz=ex*n+ez*c;return Math.abs(lx)<=d.bx&&Math.abs(lz)<=d.bz};
      const gap=(a,b)=>{let m=1e9;for(const [x,z] of box(a)){if(inside(b,x,z))return -1;for(const [x2,z2] of box(b))m=Math.min(m,Math.hypot(x-x2,z-z2))}for(const [x,z] of box(b))if(inside(a,x,z))return -1;return m};
      const same=(a,b)=>a.t===b.t&&['blk','cfence','sandbag','iblk'].includes(a.t)||['iblk','iblk2','iblk3'].includes(a.t)||['iblk','iblk2','iblk3'].includes(b.t)||[a.t,b.t].includes('cgate')&&[a.t,b.t].includes('cfence')||[a.t,b.t].sort().join()==='recycle,vend'||(['vend','recycle'].includes(a.t)||['vend','recycle'].includes(b.t))&&(a.t==='market'||b.t==='market');   /* 자판기+쓰레기통은 한 덩어리, 가게 옆에 붙인 건 일부러 */
      const zones=[{k:'fish',x:FISHISLE.x,z:FISHISLE.z,r:12},{k:'sp',x:SPSUP.x,z:SPSUP.z+3,r:16},...SUPS.map(s=>({k:'sup'+s.i,x:s.x,z:s.z,r:9})),...PORTS.map(p=>({k:'port'+p.i,x:p.x-p.dx*10,z:p.z-p.dz*10,r:22}))];
      const tight=[],narrow=[];
      for(const Z of zones){const L=structs.filter(s=>!sdef(s).pass&&dist(s.x,s.z,Z.x,Z.z)<Z.r&&s.t!=='int_exit');
        for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(same(a,b))continue;if(Math.abs(a.x-b.x)>6||Math.abs(a.z-b.z)>6)continue;const g=gap(a,b);
          if(g<.35)tight.push([Z.k,a.t,b.t,+g.toFixed(2),Math.round(a.x),Math.round(a.z)]);else if(g<1.15)narrow.push([Z.k,a.t,b.t,+g.toFixed(2),Math.round(a.x),Math.round(a.z)])}}
      return JSON.stringify({tight,narrow,nT:tight.length,nN:narrow.length})}""")
    print('audit',rep)
    # 위에서 내려다보기: 충돌 상자를 빨간 선으로
    await ev("""()=>{const g=new THREE.Group();g.name='audbox';for(const s of structs){const d=sdef(s);if(!d||s.t==='int_exit')continue;const c=Math.cos(s.r||0),n=Math.sin(s.r||0),y=groundY(s.x,s.z)+.08,P=[];
       for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]){const lx=u*d.bx,lz=v*d.bz;P.push(new THREE.Vector3(s.x+lx*c+lz*n,y,s.z-lx*n+lz*c))}
       g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(P),new THREE.LineBasicMaterial({color:d.pass?0xffd000:0xff2020,depthTest:false})))}scene.add(g);window.__updC=updCamera;updCamera=function(){}}""")
    async def top(name,x,z,h):
        await ev(f"()=>{{P.x={x};P.z={z}+3;cam.position.set({x},{h},{z}+.01);cam.up.set(0,0,-1);cam.lookAt({x},0,{z});if(cam.clearViewOffset)cam.clearViewOffset();cam.updateProjectionMatrix()}}")
        await pg.wait_for_timeout(900);await pg.screenshot(path=O(name),type='jpeg',quality=80)
    for i in range(8):
        x,z=await ev(f"()=>[SUPS[{i}].x,SUPS[{i}].z]")
        await top(f'aud_sup{i}.jpg',x,z,34)
    for i in range(8):
        x,z=await ev(f"()=>{{const p=PORTS[{i}];return[p.x-p.dx*9,p.z-p.dz*9]}}")
        await top(f'aud_port{i}.jpg',x,z,70 if i==0 else 52)
