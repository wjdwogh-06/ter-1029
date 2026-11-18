# 작업대 실내 전용 검사(14차): 맵에 작업대·대장간 없음, 밖에서는 못 놓음, 텐트 안에서만 놓음, 텐트 안에서 다른 건 못 놓음, 저장·불러오기 뒤에도 텐트 안, 밖 작업대 저장은 재료로 돌려줌
# 기대: world.bench=0·forge=0, outside.ok=false, inside.ok=true·placed in=1, craft near=true(안), 밖 near=false, others.ok=false, reload.in=1·visible=false, refund wood+10
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('world',await ev("()=>JSON.stringify({bench:structs.filter(s=>s.t==='bench').length,forge:structs.filter(s=>s.t==='forge'||s.t==='blacksmith').length})"))
    print('outside',await ev("()=>{S.inv.wood=50;S.inv.stone=20;P.x=VIL.x+6;P.z=VIL.z+8;P.auto=null;setBuild('bench');const g=ghostPos();setBuild(null);return JSON.stringify({ok:g.ok,why:g.why})}"))
    # 텐트 치고 들어가기
    print('tent',await ev("""()=>{S.inv.kit_tent=1;setBuild('ptent');let g=null;for(let k=0;k<40&&!(g&&g.ok);k++){P.x=VIL.x+20+k*1.7;P.z=VIL.z+18;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);const t=structs.find(s=>s.t==='ptent'&&s.own);return JSON.stringify({tent:!!t})}"""))
    await ev("()=>{const t=structs.find(s=>s.t==='ptent'&&s.own);intEnter(t)}");await pg.wait_for_timeout(1700)
    print('inside',await ev("""()=>{P.x=INT.x+1.8;P.z=INT.z+1.2;P.rot=Math.PI;setBuild('bench');const g=ghostPos();const r={on:INT.on,ok:g.ok,why:g.why,lz:+(g.z-INT.z).toFixed(2)};placeBuild();setBuild(null);const b=structs.find(s=>s.t==='bench'&&s.own);r.placed=!!b;r.in=b&&b.in;r.y=b&&+b.m.position.y.toFixed(2);r.near=nearBench();
      setBuild('turret');const g2=ghostPos();r.others=g2.ok;r.othersWhy=g2.why;setBuild(null);setBuild('bench');const g3=ghostPos();r.second=g3.ok;r.secondWhy=g3.why;setBuild(null);return JSON.stringify(r)}"""))
    await ev("()=>{P.x=INT.x-1.2;P.z=INT.z+1.6;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(600);await pg.screenshot(path=O('bench_inside.jpg'),type='jpeg',quality=85)
    await ev("()=>{target=findTarget();openPanel('build')}");await pg.wait_for_timeout(300);await pg.screenshot(path=O('bench_buildtab_in.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()")
    await ev("()=>intLeave()");await pg.wait_for_timeout(1500)
    print('after leave',await ev("()=>{const b=structs.find(s=>s.t==='bench'&&s.own);return JSON.stringify({on:INT.on,visible:b.m.visible,near:nearBench()})}"))
    await ev("()=>openPanel('build')");await pg.wait_for_timeout(300);await pg.screenshot(path=O('bench_buildtab_out.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()")
    # 저장 → 불러오기 흉내: 저장된 목록에 in·yo가 있는지 + 예전 밖 작업대는 재료로
    print('save',await ev("()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));const b=d.S.built.find(q=>q.t==='bench');return JSON.stringify({in:b.in,yo:+(b.yo||0).toFixed(1)})}"))
    print('migrate',await ev("""()=>{mode='x';const d=JSON.parse(localStorage.getItem(SAVE));d.S.built.push({t:'bench',x:VIL.x+8,z:VIL.z+10,r:0,hp:120});localStorage.setItem(SAVE,JSON.stringify(d));return 'ok'}"""))
    await pg.reload();await pg.wait_for_timeout(9000)
    await pg.evaluate("()=>{const b=document.getElementById('tCont');if(b)b.click()}");await pg.wait_for_timeout(7000)
    print('reload',await ev("()=>{const B=structs.filter(s=>s.t==='bench');return JSON.stringify({n:B.length,in:B.map(s=>s.in),visible:B.map(s=>s.m.visible),wood:S.inv.wood,toast:document.getElementById('toast').textContent})}"))
