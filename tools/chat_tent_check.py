# 채팅 말풍선 + 텐트 내부(빈 방, 문으로 걸어 나가기) 확인. 스크린샷: tools/out/chat*.jpg, room*.jpg
async def steps(pg):
    ev=pg.evaluate
    await ev("()=>{S.time=.42;WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy)}")
    await pg.click('#bChat');await pg.wait_for_timeout(400)
    print('open',await ev("()=>JSON.stringify([CHAT.open,document.activeElement.id])"));await pg.screenshot(path=os.path.join(OUT,'chat_typing.jpg'),type='jpeg',quality=90)
    await pg.keyboard.type('안녕하세요! 항구 앞에서 만나요');await pg.keyboard.press('Enter');await pg.wait_for_timeout(450)
    print('sent',await ev("()=>JSON.stringify([CHAT.open,[...CHAT.b.keys()],S.inv.length])"));await pg.screenshot(path=os.path.join(OUT,'chat_bubble.jpg'),type='jpeg',quality=90)
    await ev("()=>CHAT.say('me','이건 아주 긴 문장으로 줄바꿈이 어떻게 되는지 보려고 쓰는 테스트 메시지예요 끝까지 잘 보이나요')");await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'chat_long.jpg'),type='jpeg',quality=90)
    # keys typed in chat must not move the player
    x0=await ev("()=>P.x");await pg.keyboard.press('Enter');await pg.wait_for_timeout(200);await pg.keyboard.type('wwwwdddd');await pg.wait_for_timeout(300);await pg.keyboard.press('Escape')
    print('moved while typing',await ev(f"()=>Math.abs(P.x-{x0})>.3"))
    # tent
    await ev("()=>{give('kit_tent',1);P.x=VIL.px-40;P.z=VIL.pz+10;P.rot=0;primary('kit_tent')}");await pg.wait_for_timeout(300);await ev("()=>{placeBuild();setBuild(null);const t=structs.find(s=>s.t==='ptent');P.x=t.x;P.z=t.z+2.3;P.rot=Math.PI}")
    await pg.wait_for_timeout(600);await ev("()=>{inp.actEdge=true;interact();inp.actEdge=false}");await pg.wait_for_timeout(2600)
    print('in',await ev("()=>JSON.stringify({on:INT.on,structsInside:structs.filter(s=>Math.abs(s.x-INT.x)<5&&Math.abs(s.z-INT.z)<5).map(s=>s.t)})"))
    await pg.wait_for_timeout(800);await pg.screenshot(path=os.path.join(OUT,'room_day.jpg'),type='jpeg',quality=92)
    await ev("()=>CHAT.say('me','텐트 안은 아늑하네요')");await ev("()=>{P.x=INT.x-2.4;P.z=INT.z-1.8}");await pg.wait_for_timeout(700);await pg.screenshot(path=os.path.join(OUT,'room_corner.jpg'),type='jpeg',quality=92)
    await ev("()=>{S.time=.95;P.x=INT.x+.5;P.z=INT.z}");await pg.wait_for_timeout(900);await pg.screenshot(path=os.path.join(OUT,'room_night.jpg'),type='jpeg',quality=92)
    # walls hold
    print('escape',await ev("()=>{let esc=0;for(let k=0;k<4000;k++){if(!INT.on)break;const a=Math.random()*6.28;moveEnt(P,Math.cos(a)*.35,Math.sin(a)*.35);const lx=P.x-INT.x,lz=P.z-INT.z;if(Math.abs(lx)>INT.hw||lz<-INT.hd||(lz>INT.hd&&Math.abs(lx)>INT.door))esc++}return esc}"))
    # walk out the door
    await ev("()=>{S.time=.42;CHAT.b.clear();P.x=INT.x+1.6;P.z=INT.z-.6;P.rot=Math.PI}");await pg.wait_for_timeout(700);print('far label',await ev("()=>target&&target.lab"));await pg.screenshot(path=os.path.join(OUT,'room_clean.jpg'),type='jpeg',quality=92)
    await ev("()=>{P.x=INT.x-.5;P.z=INT.z+1.3;P.rot=0}");await pg.wait_for_timeout(700);print('door label',await ev("()=>target&&target.lab"));await pg.screenshot(path=os.path.join(OUT,'room_door.jpg'),type='jpeg',quality=92)
    await ev("()=>{P.x=INT.x;P.z=INT.z+1.2;keys.KeyS=1}");await pg.wait_for_timeout(3200);await ev("()=>{keys.KeyS=0}")
    print('out',await ev("()=>JSON.stringify({on:INT.on,p:[P.x|0,P.z|0],blocked:String(walk(P.x,P.z,.42,P))})"))
    await pg.set_viewport_size({'width':400,'height':860});await ev("()=>{const t=structs.find(s=>s.t==='ptent');P.x=t.x;P.z=t.z+2.3;P.rot=Math.PI}");await pg.wait_for_timeout(500);await ev("()=>{inp.actEdge=true;interact();inp.actEdge=false}");await pg.wait_for_timeout(2800);await pg.screenshot(path=os.path.join(OUT,'room_portrait.jpg'),type='jpeg',quality=90)
    await ev("()=>{inp.actEdge=false}");await pg.click('#bChat');await pg.wait_for_timeout(400);await pg.keyboard.type('세로 화면 채팅');await pg.screenshot(path=os.path.join(OUT,'chat_portrait_typing.jpg'),type='jpeg',quality=90);await pg.keyboard.press('Enter');await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'chat_portrait.jpg'),type='jpeg',quality=90)
