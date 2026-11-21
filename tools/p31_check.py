# 31차 검사: 하면서 다른 것도 — 진짜 손가락(CDP 터치)으로 조이스틱을 누른 채 가방 열기·먹기·닫기, 톡 한 번 = 한 번만, 가방 연 채 쏘기·상호작용, 걸으면서 톡 상호작용
# 기대: 각 줄 ok true, errs []
import os, json
async def steps(pg):
    await pg.evaluate("()=>{for(const [k,n] of [['pistol',1],['ammoS',36],['can',2],['bandage',1]])give(k,n);S.quick[S.sel]='pistol'}")   # 48차: 시작이 100원+낚싯대만이 돼서 예전 시작 소지품을 직접 넣어요
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};give('can',6);S.hp=40;P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.yv=undefined}")
    await pg.wait_for_timeout(500)
    cdp=await pg.context.new_cdp_session(pg)
    async def touch(t,pts):
        await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    rect=lambda sel:ev(f"()=>{{const e=document.querySelector({json.dumps(sel)});if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height]}}")
    # 1. 손가락 하나로 톡: 가방이 한 번 열리고 다른 칸은 안 눌림
    b=await rect('#bBag');c0=await ev("()=>invN('can')")
    await pg.touchscreen.tap(b[0],b[1]);await pg.wait_for_timeout(400)
    r1=await ev(f"()=>JSON.stringify({{panel,can:invN('can'),c0:{c0}}})");print('tap bag',r1)
    s=await rect('#pbody [data-a=sel][data-k=can]');await pg.touchscreen.tap(s[0],s[1]);await pg.wait_for_timeout(400)
    r2=await ev(f"()=>JSON.stringify({{ate:{c0}-invN('can'),panel}})");print('tap can once',r2)
    # (CDP 터치: touchEnd에 적은 손가락이 떼져요)
    # 2. 조이스틱을 누른 채(손가락 1) 다른 손가락으로 칸 누르기 → 먹고 계속 걸음
    W,H=880,400
    jr=await ev("()=>{const r=document.getElementById('joy').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")   # 32차: 조이스틱은 고정 → 그 가운데를 눌러요
    JX,JY=jr
    await touch('touchStart',[(1,JX,JY)]);await pg.wait_for_timeout(60)
    for k in range(1,6):
        await touch('touchMove',[(1,JX,JY-k*8)]);await pg.wait_for_timeout(30)
    await pg.wait_for_timeout(300);p0=await ev("()=>[P.x,P.z,P.moving,joy.id!==null]")
    s=await rect('#pbody [data-a=sel][data-k=can]');c1=await ev("()=>invN('can')")
    await touch('touchStart',[(1,JX,JY-40),(2,s[0],s[1])]);await pg.wait_for_timeout(80)
    await touch('touchEnd',[(2,s[0],s[1])]);await pg.wait_for_timeout(400)
    r3=await ev(f"()=>JSON.stringify({{ate:{c1}-invN('can'),moving:P.moving,joy:joy.id!==null,moved:+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(2),panel}})");print('eat while moving',r3,'before',p0)
    # 가방 연 채 큰 버튼이 가방에 안 가려짐
    r4=await ev("()=>{const a=document.getElementById('bAtk').getBoundingClientRect(),p=document.getElementById('panel').getBoundingClientRect();const over=!(a.right<p.left||a.left>p.right||a.bottom<p.top||a.top>p.bottom);return JSON.stringify({over,dodge:document.getElementById('bAtk').classList.contains('dodge')})}")
    print('atk beside bag',r4)
    await pg.screenshot(path=O('p31_bag_move.jpg'),type='jpeg',quality=85)
    # 3. 걸으면서 ✕로 닫고, 다시 🎒로 열기
    x=await rect('#pclose');await touch('touchStart',[(1,JX,JY-40),(2,x[0],x[1])]);await pg.wait_for_timeout(60);await touch('touchEnd',[(2,x[0],x[1])]);await pg.wait_for_timeout(300)
    r5a=await ev("()=>panel");b=await rect('#bBag')
    await touch('touchStart',[(1,JX,JY-40),(2,b[0],b[1])]);await pg.wait_for_timeout(60);await touch('touchEnd',[(2,b[0],b[1])]);await pg.wait_for_timeout(300)
    r5b=await ev("()=>JSON.stringify({panel,moving:P.moving})");print('close/open while moving',r5a,r5b)
    await touch('touchEnd',[(1,JX,JY-40)]);await pg.wait_for_timeout(300)
    # 4. 가방 연 채 쏘기: 탄알이 줄어요 / 쏘는 중에 가방을 열어도 계속 쏨
    r6=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));S.quick[S.sel]='pistol';give('ammoS',30);openPanel('bag');await sl(100);const a0=invN('ammoS'),b=document.getElementById('bAtk'),r=b.getBoundingClientRect();
      b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:41,bubbles:true,pointerType:'touch',clientX:r.x+20,clientY:r.y+20}));await sl(900);const used=a0-invN('ammoS');b.dispatchEvent(new PointerEvent('pointerup',{pointerId:41,bubbles:true,pointerType:'touch'}));closePanel();
      await sl(100);b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:42,bubbles:true,pointerType:'touch',clientX:r.x+20,clientY:r.y+20}));await sl(200);openPanel('bag');await sl(400);const still=inp.fire;b.dispatchEvent(new PointerEvent('pointerup',{pointerId:42,bubbles:true,pointerType:'touch'}));closePanel();
      return JSON.stringify({used,still,ok:used>0&&still})}""")
    print('fire with bag',r6)
    # 5. 걸으면서 자판기 톡(34차: 바짝 붙어서) → 멈추지 않고 바로 / 가방 연 채 큰 버튼으로 상호작용
    r7=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const v=structs.find(s=>s.t==='vend'&&dist(s.x,s.z,VIL.x,VIL.z)<60);S.quick[S.sel]=null;P.x=v.x;P.z=v.z+sdef(v).bz+.75;P.rot=Math.PI;P.yv=undefined;await sl(200);P.moving=true;worldTap(v.x,v.z);const p1=panel;closePanel();await sl(100);
      openPanel('bag');P.x=v.x;P.z=v.z+sdef(v).bz+.75;P.rot=Math.PI;await sl(300);const lab=target&&target.lab,md=actMode(),b=document.getElementById('bAtk'),r=b.getBoundingClientRect();b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:43,bubbles:true,pointerType:'touch',clientX:r.x+20,clientY:r.y+20}));await sl(150);const p2=panel;b.dispatchEvent(new PointerEvent('pointerup',{pointerId:43,bubbles:true,pointerType:'touch'}));closePanel();
      return JSON.stringify({tapMoving:p1,bagLab:lab,md,bagAct:p2,ok:p1==='vend'&&p2==='vend'})}""")
    print('interact',r7)
    ok=json.loads(r1)['panel']=='bag' and json.loads(r1)['can']==c0 and json.loads(r2)['ate']==1 and json.loads(r3)['ate']==1 and json.loads(r3)['moved']>.5 and not json.loads(r4)['over'] and r5a is None and json.loads(r5b)['panel']=='bag'
    print('ALL', ok and json.loads(r6)['ok'] and json.loads(r7)['ok'])
