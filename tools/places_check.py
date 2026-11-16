# 7·8차 특별한 곳 검사: 까마귀섬 낚시 캠프(철조망·문·데크·잔교·주인)와 물개섬 바위 분지(경사로로 올라가 계단으로 내려가는 특수 보급)
# 기대: 문 닫힘=막힘, 열림=지나감, 4초 뒤 닫힘, 문 안에 서 있으면 안 닫힘 / 주인 [말 걸기] → 말풍선 / 데크·잔교 위 높이 = deckY
#       분지: 테두리 ≈ 둘레+1.9, 바닥 ≈ 둘레-0.6, 경사로→테두리→계단→바닥 길이 전부 걸을 수 있음(path=[]), 바깥에서 절벽으로 못 들어옴(cliffOpen=[]),
#       분지 안에서 계단 말고는 못 나감(innerOpen=[]) / 특수 보급 열기
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true}")
    print('built',await ev("""()=>{const F=FISHISLE,S2=SPSUP,c=(t,x,z,r)=>structs.filter(s=>(typeof t==='string'?s.t===t:t.test(s.t))&&dist(s.x,s.z,x,z)<r).length;
      return JSON.stringify({gate:c('cgate',F.x,F.z,20),fstall:c('fstall',F.x,F.z,25),walls:c(/^iblk$/,F.x-6,F.z,30),sp:c('spsupply',S2.x,S2.z,12),fire:c('fire',F.x,F.z,20),
       h:{deck:+groundY(F.x+FCAMP.deck[0]+2,F.z-1).toFixed(2),pier:+groundY(F.x+FCAMP.pier[0]+1,F.z-1).toFixed(2),rim:+groundY(S2.x-S2.A+1.2,S2.z).toFixed(2),floor:+groundY(S2.x,S2.z).toFixed(2),out:+groundY(S2.x-S2.A-3,S2.z).toFixed(2),
        ramp:[0,2,4,6].map(z=>+groundY(S2.x+S2.rx,S2.z+S2.A+z).toFixed(2)),stairs:[0,1.5,3,4.2].map(z=>+groundY(S2.x+S2.rx,S2.z+S2.B-z).toFixed(2))}})}"""))
    print('gate',await ev("""()=>{const g=structs.find(s=>s.t==='cgate'),E={x:0,z:0,pl:1},r={};r.closedBlocks=walk(g.x,g.z,.42,E)!==null;
      P.x=g.x;P.z=g.z+1.6;P.rot=Math.PI;P.auto=null;let t=findTarget();r.label=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.open=g.open;r.openPass=walk(g.x,g.z,.42,E)===null;return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(900);await ev("()=>{updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(300)
    await pg.screenshot(path=O('pl_gate_open.jpg'),type='jpeg',quality=85)
    await pg.wait_for_timeout(4200)
    print('gate later',await ev("()=>{const g=structs.find(s=>s.t==='cgate');return JSON.stringify({open:g.open,leaf:g.lk&&+g.lk.parts.leaf.rotation.y.toFixed(2)})}"))
    print('gate stand',await ev("""()=>new Promise(res=>{const g=structs.find(s=>s.t==='cgate');openGate(g);P.x=g.x;P.z=g.z;setTimeout(()=>{const a=g.open;P.x=g.x;P.z=g.z-1.8;setTimeout(()=>res(JSON.stringify({stillOpenWhileStanding:a,closedAfterLeave:!g.open})),1500)},5000)})"""))
    # 주인
    await ev("()=>{P.x=FNPC.x+.4;P.z=FNPC.z+2.4;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(900)
    print('npc',await ev("()=>{const t=findTarget();const r={label:t&&t.lab,actor:!!(FNPC&&FNPC.a),py:+P.a.root.position.y.toFixed(2)};target=t;inp.actEdge=true;interact();inp.actEdge=false;r.bubble=CHAT.b.has('fisher');return JSON.stringify(r)}"))
    await pg.wait_for_timeout(700);await pg.screenshot(path=O('pl_fish_npc.jpg'),type='jpeg',quality=85)
    for n,x,z,zk in [('pl_fish_wide','FISHISLE.x-8','FISHISLE.z+10',1.05),('pl_fish_deck','FISHISLE.x-15','FISHISLE.z+4.5',.8),('pl_fish_gate','FISHISLE.x-2','FISHISLE.z+11',.85),('pl_fish_far','FISHISLE.x-8','FISHISLE.z+12',1.35)]:
        await ev(f"()=>{{P.x={x};P.z={z};P.rot=Math.PI;zoomK={zk};updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1000)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=85)
    await ev("()=>{zoomK=1}")
    # 분지: 길·벽
    print('crater',await ev("""()=>{const S2=SPSUP,X=S2.x,Z=S2.z,E={x:0,z:0,pl:1},path=[],out=[],inn=[];
      for(let z=S2.A+S2.rl+1;z>-3.5;z-=.2){const x=X+S2.rx;if(walk(x,Z+z,.42,E)!==null)path.push(+z.toFixed(1))}
      for(let a=0;a<360;a+=3){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);const mouth=dz>0&&Math.abs(dx*S2.A-S2.rx)<S2.rw/2+.3;
       let hit=false;for(let m=S2.A+3;m>S2.B;m-=.2)if(walk(X+dx*m,Z+dz*m,.42,E)!==null){hit=true;break}if(!hit&&!mouth)out.push(a);
       const smouth=dz>0&&Math.abs(dx*S2.B-S2.rx)<S2.sw/2+.3;let hit2=false;for(let m=1;m<S2.A;m+=.2)if(walk(X+dx*m,Z+dz*m,.42,E)!==null){hit2=true;break}if(!hit2&&!smouth)inn.push(a)}
      return JSON.stringify({pathBlocked:path.slice(0,10),n:path.length,cliffOpen:out,innerOpen:inn})}"""))
    for n,dx,dz,zk in [('pl_crater_front',0,'S2.A+S2.rl+4',1.15),('pl_crater_ramp','S2.rx','S2.A+2.5',.85),('pl_crater_rim','S2.rx','S2.A-.9',.85),('pl_crater_far',-6,'S2.A+12',1.5)]:
        await ev(f"()=>{{const S2=SPSUP;P.x=S2.x+{dx};P.z=S2.z+{dz};P.rot=Math.PI;zoomK={zk};enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1000)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=85)
    await ev("()=>{zoomK=1}")
    # 특수 보급 열기 (분지 바닥)
    await ev("()=>{const s=structs.find(q=>q.t==='spsupply');P.x=s.x;P.z=s.z+1.5;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(700)
    print('loot',await ev("""()=>{const t=findTarget();const r={label:t&&t.lab,py:+P.a.root.position.y.toFixed(2)};const c0=S.coins;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.coins=S.coins-c0;const t2=findTarget();r.after=t2&&t2.s===t.s?t2.lab:'다른 대상/없음';return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(600);await pg.screenshot(path=O('pl_crater_floor.jpg'),type='jpeg',quality=85)
    await ev("()=>{S.time=.95;const S2=SPSUP;P.x=S2.x;P.z=S2.z+S2.A+5;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('pl_crater_night.jpg'),type='jpeg',quality=85)
    await ev("()=>{S.time=.95;P.x=FISHISLE.x-6;P.z=FISHISLE.z+8;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('pl_fish_night.jpg'),type='jpeg',quality=85)
    print('tri',await ev("()=>R.info.render.triangles+'/'+R.info.render.calls"))
