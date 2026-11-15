# UI 점검: HUD(가로/세로), 창 탭마다, 상점, 메뉴, 도움말, 전체 지도, 타이틀, 채팅, 알림. 스크린샷: tools/out/ui_*.jpg
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,'ui_'+n+'.jpg')
    await ev("()=>{S.time=.42;WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy);give('wood',20);give('stone',12);give('berry',4);give('axe',1);give('rod',1);give('kit_tent',1);toast('텐트를 쳤어요. 여기가 내 기지예요')}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('hud'),type='jpeg',quality=90)
    for p in ['bag','craft','build','map','menu','help']:
        await ev(f"()=>openPanel('{p}')");await pg.wait_for_timeout(600);await pg.screenshot(path=O(p),type='jpeg',quality=88)
    await ev("()=>{closePanel();const m=structs.find(s=>s.t==='market');P.x=m.x;P.z=m.z+3.2;openPanel('shop')}");await pg.wait_for_timeout(700);await pg.screenshot(path=O('shop'),type='jpeg',quality=88)
    await ev("()=>{closePanel()}");await pg.wait_for_timeout(500);await pg.screenshot(path=O('town'),type='jpeg',quality=88)
    await pg.click('#bChat');await pg.keyboard.type('안녕하세요 반가워요');await pg.screenshot(path=O('chat_typing'),type='jpeg',quality=88);await pg.keyboard.press('Enter');await pg.wait_for_timeout(400);await pg.screenshot(path=O('chat'),type='jpeg',quality=88)
    await ev("()=>openFmap()");await pg.wait_for_timeout(700);await pg.screenshot(path=O('fmap'),type='jpeg',quality=85);await ev("()=>closePanel()")
    await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(900);await pg.screenshot(path=O('hud_port'),type='jpeg',quality=88)
    await ev("()=>openPanel('bag')");await pg.wait_for_timeout(600);await pg.screenshot(path=O('bag_port'),type='jpeg',quality=88);await ev("()=>closePanel()")
    await pg.set_viewport_size({'width':880,'height':400});await ev("()=>toTitle()");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('title'),type='jpeg',quality=88)
