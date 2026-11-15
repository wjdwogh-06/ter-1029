# 설치 금지 구역: 등대·보급지·항구 둘레 원. 크기, 안/밖 판정, 실제 설치 시도, 물 위 금지, 설치 모드에서만 보이는지, 스크린샷
async def steps(pg):
    ev=pg.evaluate
    print('zones',await ev("""()=>{const o={};for(const n of NOB){(o[n.k]=o[n.k]||[]).push(+n.r.toFixed(1))}return JSON.stringify({n:NOB.length,lh:o.lh,sup:o.sup,port:o.port})}"""))
    # 그 자리의 실제 구조물이 원 안에 다 들어가는지(항구·보급지), 등대섬 땅이 다 들어가는지
    print('cover',await ev("""()=>{const out=[];const supT={supply:1,chest:1,blk:1,suplamp:1};
      for(const q of structs){if(q.own)continue;const n=NOB.filter(z=>dist(z.x,z.z,q.x,q.z)<z.r+20);if(!n.length)continue;if(!nobAt(q.x,q.z,0))out.push(q.t+'@'+(q.x|0)+','+(q.z|0))}
      return JSON.stringify({outsideButNear:out.slice(0,20),count:out.length})}"""))
    # 설치 시도: 각 구역 안쪽/바깥쪽에 텐트 놓기
    print('place',await ev("""()=>{give('kit_tent',3);setBuild('ptent');const b=BUILDS.ptent,d=Math.max(b.bx,b.bz)+1.6;const res={inBlocked:0,inN:0,outZoneMsg:0,outN:0,water:''};
      const at=(x,z,rot)=>{P.rot=rot;P.x=x-Math.sin(rot)*d;P.z=z-Math.cos(rot)*d;return ghostPos()};
      for(const n of NOB){for(let a=0;a<8;a++){const an=a/8*6.283;const xi=n.x+Math.cos(an)*(n.r*.6),zi=n.z+Math.sin(an)*(n.r*.6);if(hAt(xi,zi)>.5){const g=at(xi,zi,an);res.inN++;if(!g.ok&&/금지/.test(g.why))res.inBlocked++}
        const xo=n.x+Math.cos(an)*(n.r+3.5),zo=n.z+Math.sin(an)*(n.r+3.5);if(hAt(xo,zo)>.5&&!NOB.some(m=>m!==n&&dist(m.x,m.z,xo,zo)<m.r+3)){const g=at(xo,zo,an);res.outN++;if(/금지/.test(g.why))res.outZoneMsg++}}}
      let w=null;for(let x=100;x<900&&!w;x+=7)for(let z=100;z<900;z+=7)if(hAt(x,z)<-1.2&&!nobAt(x,z,3)){w=[x,z];break}const g=at(w[0],w[1],0);res.water=g.why;setBuild(null);return JSON.stringify(res)}"""))
    # 화면: 설치 모드가 아닐 때 안 보이고, 설치 모드일 때 보임
    await ev("()=>{const n=NOB.find(z=>z.k==='lh');P.x=n.x;P.z=n.z+n.r+3;P.rot=Math.PI}");await pg.wait_for_timeout(1200)
    print('hidden when not building',await ev("()=>!nobG||!nobG.visible"))
    await pg.screenshot(path=os.path.join(OUT,'nob_lh_off.jpg'),type='jpeg',quality=85)
    await ev("()=>{give('kit_tent',1);setBuild('ptent')}");await pg.wait_for_timeout(1200)
    print('visible when building',await ev("()=>!!nobG&&nobG.visible"))
    await pg.screenshot(path=os.path.join(OUT,'nob_lh.jpg'),type='jpeg',quality=85)
    await ev("()=>{const n=NOB.find(z=>z.k==='sup');P.x=n.x+2;P.z=n.z+n.r+2.5;P.rot=Math.PI}");await pg.wait_for_timeout(1300);await pg.screenshot(path=os.path.join(OUT,'nob_sup.jpg'),type='jpeg',quality=85)
    await ev("()=>{const n=NOB.find(z=>z.k==='sup');P.x=n.x+2;P.z=n.z+n.r+6;P.rot=0}");await pg.wait_for_timeout(1000);print('outside ghost',await ev("()=>JSON.stringify(ghostPos())"));await pg.screenshot(path=os.path.join(OUT,'nob_sup_ok.jpg'),type='jpeg',quality=85)
    await ev("()=>{const n=NOB.filter(z=>z.k==='port')[2];P.x=n.x;P.z=n.z+n.r+2;P.rot=Math.PI;zoomK=1.5}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'nob_port.jpg'),type='jpeg',quality=85)
    await ev("()=>{const n=NOB.find(z=>z.k==='port');P.x=n.x;P.z=n.z+8;zoomK=1.9}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'nob_town.jpg'),type='jpeg',quality=85)
    await ev("()=>{setBuild(null);zoomK=1}");await pg.wait_for_timeout(500);print('hidden after',await ev("()=>!nobG.visible"))
