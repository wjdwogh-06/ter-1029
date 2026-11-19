# 새 UI: 얼굴·목표·시계·구르기·아래 칸 숨김, 가방은 옆에 붙고 게임은 계속(움직이기만), 가방 열면 낚시·채집 안 됨, 장비 장착/내려놓기, 화면 밀기, 세로 화면
async def steps(pg):
    ev=pg.evaluate
    print('hidden',await ev("()=>JSON.stringify(['ava','quest','clock','bRoll','quick'].map(i=>[i,getComputedStyle(document.getElementById(i)).display]))"))
    await pg.screenshot(path=os.path.join(OUT,'bag_hud.jpg'),type='jpeg',quality=85)
    # 장비: 손도끼 장착 → 가방 열기
    await ev("()=>{give('axe',1);give('rod',1);S.quick[S.sel]=null;openPanel('bag')}");await pg.wait_for_timeout(400)
    print('side',await ev("()=>{const el=document.getElementById('panel'),r=el.getBoundingClientRect();return JSON.stringify({side:el.classList.contains('side'),left:Math.round(r.left),right:Math.round(r.right),w:innerWidth,shade:!document.getElementById('shade').classList.contains('hide')})}"))
    await ev("()=>{const b=document.querySelector('#pbody [data-a=sel][data-k=axe]');b.click()}");await pg.wait_for_timeout(150)
    await ev("()=>{bagTap('axe')}");await pg.wait_for_timeout(200)
    print('equipped',await ev("()=>curId()"))
    await pg.wait_for_timeout(600);await pg.screenshot(path=os.path.join(OUT,'bag_open.jpg'),type='jpeg',quality=85)
    print('view(38차: 카메라 안 옮김 → on false)',await ev("()=>{const r=document.getElementById('panel').getBoundingClientRect(),p=scr(P.x,groundY(P.x,P.z)+1,P.z);return JSON.stringify({on:!!(cam.view&&cam.view.enabled),charX:Math.round(p[0]),freeMid:Math.round(r.left/2)})}"))
    # 가방 열린 채 움직이기
    x0=await ev("()=>[P.x,P.z]");await ev("()=>{keys.KeyS=1}");await pg.wait_for_timeout(900);await ev("()=>{keys.KeyS=0}")
    x1=await ev("()=>[P.x,P.z]");print('moved with bag open',round(((x1[0]-x0[0])**2+(x1[1]-x0[1])**2)**.5,2))
    # 나무 앞에서 베기 시도 → 안 됨
    print('chop blocked',await ev("""()=>{let best=null,bd=1e9;objs.forEach(o=>{if(o.t<3&&o.re<=0){const d=dist(o.x,o.z,VIL.x,VIL.z);if(d<bd&&d>20){bd=d;best=o}}});P.x=best.x;P.z=best.z+1.6;P.rot=Math.PI;const w0=S.st.wood;inp.act=true;inp.actEdge=true;return JSON.stringify({w0,t:best.t})}"""))
    await pg.wait_for_timeout(1500);print('wood after',await ev("()=>{inp.act=false;return JSON.stringify({wood:S.st.wood,target:!!target})}"))
    # 낚시 시도 → 안 됨
    print('fish blocked',await ev("""()=>{S.quick[S.sel]='rod';const s=FSP.find(q=>q.lb==='해안23');let best=null,bd=1e9;for(let dx=-9;dx<=9;dx+=.5)for(let dz=-9;dz<=9;dz+=.5){const x=s.x+dx,z=s.z+dz,d=Math.hypot(dx,dz);if(d<bd&&waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null){bd=d;best=[x,z]}}P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);inp.fire=true;return 'ok'}"""))
    await pg.wait_for_timeout(800);print('fishing while bag',await ev("()=>{inp.fire=false;return !!fishing}"))
    # 내려놓기
    await ev("()=>{renderPanel();if(curId()!=='fist')bagTap(curId())}");await pg.wait_for_timeout(200);print('after unequip',await ev("()=>curId()"))
    await pg.screenshot(path=os.path.join(OUT,'bag_open2.jpg'),type='jpeg',quality=85)
    await ev("()=>closePanel()");await pg.wait_for_timeout(3000)
    print('view after close',await ev("()=>JSON.stringify({on:!!(cam.view&&cam.view.enabled)})"))
    # 가방 닫으면 낚시 돼요
    await ev("()=>{S.quick[S.sel]='rod';tryCast()}");await pg.wait_for_timeout(300);print('fishing after close',await ev("()=>!!fishing"))
    await ev("()=>endFish()")
    # 새 빨간 원
    await ev("()=>{const n=NOB.find(z=>z.k==='sup');P.x=n.x+2;P.z=n.z+n.r+3;P.rot=Math.PI;give('kit_tent',1);setBuild('ptent')}");await pg.wait_for_timeout(1300);await pg.screenshot(path=os.path.join(OUT,'nob_new.jpg'),type='jpeg',quality=88)
    await ev("()=>{const n=NOB.find(z=>z.k==='lh');P.x=n.x;P.z=n.z+3}");await pg.wait_for_timeout(1300);await pg.screenshot(path=os.path.join(OUT,'nob_new_lh.jpg'),type='jpeg',quality=88)
    await ev("()=>setBuild(null)")
    # 세로 화면
    await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(800)
    await pg.screenshot(path=os.path.join(OUT,'bag_hud_port.jpg'),type='jpeg',quality=85)
    await ev("()=>{P.x=VIL.x;P.z=VIL.z;openPanel('bag')}");await pg.wait_for_timeout(900)
    await pg.wait_for_timeout(1500);print('port panel',await ev("()=>{const r=document.getElementById('panel').getBoundingClientRect(),p=scr(P.x,groundY(P.x,P.z)+1,P.z);return JSON.stringify({top:Math.round(r.top),h:innerHeight,charY:Math.round(p[1]),freeMid:Math.round(r.top/2)})}"))
    await pg.screenshot(path=os.path.join(OUT,'bag_port.jpg'),type='jpeg',quality=85)
    await ev("()=>closePanel()")
