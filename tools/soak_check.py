# 막 놀아 보기: 걷기·큰 버튼·가방·설치·밤 습격·낚시·여러 곳 순간이동을 섞어서 80초. 오류, 위치 NaN, 구조물 속에 끼임을 세어요
import random
async def steps(pg):
    ev=pg.evaluate;random.seed(7)
    await ev("()=>{give('axe',1);give('rod',1);give('pistol',1);give('ammoS',200);give('kit_tent',2);give('wood',40);give('stone',30);give('can',5);window._bad=[];window._chk=()=>{const w=walk(P.x,P.z,.3,P);if(!isFinite(P.x)||!isFinite(P.z))_bad.push('nan');else if(w!==null&&!INT.on&&WTR.st==='land'&&!DEV.on)_bad.push('in@'+(P.x|0)+','+(P.z|0))}}")
    places=["P.x=VIL.x;P.z=VIL.z","const p=PORTS[(Math.random()*8)|0];P.x=p.x-p.dx*6;P.z=p.z-p.dz*6","const s=SUPS[(Math.random()*SUPS.length)|0];P.x=s.x+3;P.z=s.z+6","const L=LHS[(Math.random()*8)|0];P.x=L.x;P.z=L.z+5","const s=FSP[(Math.random()*FSP.length)|0];P.x=s.x;P.z=s.z+4"]
    keys=['KeyW','KeyA','KeyS','KeyD']
    for step in range(160):
        r=random.random()
        if r<.08: await ev("()=>{"+random.choice(places)+";P.auto=null;for(let k=0;k<200&&walk(P.x,P.z,.42,P)!==null;k++){P.x+=Math.cos(k)*k*.05;P.z+=Math.sin(k)*k*.05}}")
        elif r<.45:
            k=random.choice(keys);await ev(f"()=>{{keys.{k}=1}}");await pg.wait_for_timeout(random.randint(150,600));await ev(f"()=>{{keys.{k}=0}}")
        elif r<.62: await pg.dispatch_event('#bAtk','pointerdown',{'pointerId':5,'clientX':800,'clientY':330});await pg.wait_for_timeout(random.randint(80,500));await pg.dispatch_event('#bAtk','pointerup',{'pointerId':5,'clientX':800,'clientY':330})
        elif r<.70: await ev("()=>{panel==='bag'?closePanel():openPanel('bag')}")
        elif r<.74: await ev("()=>{if(panel)closePanel();bmode?setBuild(null):setBuild(Math.random()<.5?'fence':'ptent')}")
        elif r<.78: await ev("()=>{S.quick[S.sel]=['axe','rod','pistol',null][(Math.random()*4)|0]}")
        elif r<.81: await ev("()=>{S.time=Math.random()<.5?.92:.4}")
        elif r<.83: await ev("()=>{if(panel)closePanel();tryCast()}")
        else: await pg.wait_for_timeout(150)
        await ev("()=>_chk()")
    await ev("()=>{if(panel)closePanel();setBuild(null)}")
    print('soak',await ev("()=>JSON.stringify({bad:_bad.slice(0,12),nBad:_bad.length,hp:Math.round(S.hp),pos:[P.x|0,P.z|0],dead:P.dead,enemies:enemies.length})"))
    await pg.screenshot(path=os.path.join(OUT,'soak_end.jpg'),type='jpeg',quality=85)
