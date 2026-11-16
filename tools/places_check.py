# 7차 특별한 곳 검사: 까마귀섬 낚시섬(철조망·문·주인)과 물개섬 특수 보급지(네모 언덕·경사로·특수 보급)
# 기대: gate 닫힘=막힘, 열림=지나감, 4초 뒤 닫힘, 문 안에 서 있으면 안 닫힘 / 주인 [말 걸기] → 말풍선
#       언덕: 위 높이 ≈ 둘레+1.9, 경사로 길은 전부 걸을 수 있음, 경사로 입구 말고 둘레 어디로 가도 막힘(cliffOpen=[]) / 특수 보급 열기
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true}")
    print('built',await ev("""()=>{const F=FISHISLE,S2=SPSUP,c=t=>structs.filter(s=>s.t===t&&(dist(s.x,s.z,F.x,F.z)<14||dist(s.x,s.z,S2.x,S2.z)<20)).length;
      return JSON.stringify({cfence:c('cfence'),cgate:c('cgate'),fstall:c('fstall'),iblk:c('iblk'),sp:c('spsupply'),beacon:c('spbeacon'),fire:c('fire'),
       h:{fish:+hAt(F.x,F.z).toFixed(2),fishEdge:+hAt(F.x+9,F.z).toFixed(2),top:+hAt(S2.x,S2.z).toFixed(2),out:+hAt(S2.x-11,S2.z).toFixed(2),ramp:[0,3,6,9,12,14].map(z=>+hAt(S2.x+S2.rx,S2.z+S2.hw+z-.7).toFixed(2))}})}"""))
    # 문
    print('gate',await ev("""()=>{const g=structs.find(s=>s.t==='cgate'),E={x:0,z:0,pl:1},r={};r.closedBlocks=walk(g.x,g.z,.42,E)!==null;
      P.x=g.x;P.z=g.z+1.6;P.rot=Math.PI;P.auto=null;let t=findTarget();r.label=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.open=g.open;r.openPass=walk(g.x,g.z,.42,E)===null;return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(900);await ev("()=>{updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(300)
    await pg.screenshot(path=O('pl_gate_open.jpg'),type='jpeg',quality=85)
    await pg.wait_for_timeout(4200)
    print('gate later',await ev("()=>{const g=structs.find(s=>s.t==='cgate');return JSON.stringify({open:g.open,leaf:g.lk&&+g.lk.parts.leaf.rotation.y.toFixed(2)})}"))
    print('gate stand',await ev("""()=>new Promise(res=>{const g=structs.find(s=>s.t==='cgate');openGate(g);P.x=g.x;P.z=g.z;setTimeout(()=>{const a=g.open;P.x=g.x;P.z=g.z-1.8;setTimeout(()=>res(JSON.stringify({stillOpenWhileStanding:a,closedAfterLeave:!g.open})),1500)},5000)})"""))
    # 주인
    await ev("()=>{P.x=FISHISLE.x+.3;P.z=FISHISLE.z-1.9;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(800)
    print('npc',await ev("()=>{const t=findTarget();const r={label:t&&t.lab,actor:!!(FNPC&&FNPC.a)};target=t;inp.actEdge=true;interact();inp.actEdge=false;r.bubble=CHAT.b.has('fisher');return JSON.stringify(r)}"))
    await pg.wait_for_timeout(700);await pg.screenshot(path=O('pl_fish_npc.jpg'),type='jpeg',quality=85)
    await ev("()=>{P.x=FISHISLE.x;P.z=FISHISLE.z+11;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(900)
    await pg.screenshot(path=O('pl_fish_wide.jpg'),type='jpeg',quality=85)
    # 언덕: 경사로 길, 둘레 막힘
    print('mesa',await ev("""()=>{const S2=SPSUP,E={x:0,z:0,pl:1},bad=[],open=[];for(let z=S2.hw+S2.rl+.8;z>-4;z-=.25){const x=S2.x+S2.rx,zz=S2.z+z;if(walk(x,zz,.42,E)!==null)bad.push(+z.toFixed(2))}
      for(let a=0;a<360;a+=3){const an=a*Math.PI/180,dx=Math.cos(an),dz=Math.sin(an);let blockedHit=false;for(let m=2;m<13;m+=.2){const x=S2.x+dx*m,z=S2.z+dz*m;if(walk(x,z,.42,E)!==null){blockedHit=true;break}}
       const ex=S2.x+dx*11,ez=S2.z+dz*11;const inMouth=dz*11>0&&Math.abs(dx*11-S2.rx)<S2.rw/2+.1;if(!blockedHit&&!inMouth)open.push(a)}
      return JSON.stringify({rampBlocked:bad.slice(0,12),nRampBlocked:bad.length,cliffOpen:open})}"""))
    await ev("()=>{const S2=SPSUP;P.x=S2.x+S2.rx;P.z=S2.z+S2.hw+S2.rl+3;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1000)
    await pg.screenshot(path=O('pl_mesa_front.jpg'),type='jpeg',quality=85)
    await ev("()=>{const S2=SPSUP;P.x=S2.x+S2.rx;P.z=S2.z+S2.hw+3;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(900)
    await pg.screenshot(path=O('pl_mesa_ramp.jpg'),type='jpeg',quality=85)
    # 특수 보급 열기
    await ev("()=>{const s=structs.find(q=>q.t==='spsupply');P.x=s.x;P.z=s.z+1.5;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(700)
    print('loot',await ev("""()=>{const t=findTarget();const r={label:t&&t.lab,py:+P.a.root.position.y.toFixed(2)};const c0=S.coins,i0=Object.keys(S.inv).length;target=t;inp.actEdge=true;interact();inp.actEdge=false;
      r.coins=S.coins-c0;r.newKinds=Object.keys(S.inv).length-i0;const t2=findTarget();r.after=t2&&t2.s===t.s?t2.lab:'다른 대상/없음';return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(600);await pg.screenshot(path=O('pl_mesa_top.jpg'),type='jpeg',quality=85)
    await ev("()=>{S.time=.95}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('pl_mesa_night.jpg'),type='jpeg',quality=85)
    await ev("()=>{S.time=.95;P.x=FISHISLE.x;P.z=FISHISLE.z+6;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('pl_fish_night.jpg'),type='jpeg',quality=85)
    print('clips',await ev("()=>Object.keys(CLIPS).filter(k=>/Inter|Wave|Cheer|Talk|Use/.test(k)).join(',')"))
