# 화면 맞추기 검사(10차): 크기가 바뀌면 0.4초 안에 다시 맞춤, 안전 여백(노치) 흉내, 전체 화면 버튼, 스크린샷
# 기대: after.match=true(그림판·UI 크기 = 새 화면), safe.ui 위치가 여백만큼 밀림, full 버튼 있음, errs=[]
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    st="()=>{const s=new THREE.Vector2();R.getSize(s);const u=document.getElementById('ui').getBoundingClientRect(),a=document.getElementById('bAtk').getBoundingClientRect();return JSON.stringify({win:[innerWidth,innerHeight],gl:[s.x,s.y],ui:[Math.round(u.left),Math.round(u.top),Math.round(u.width),Math.round(u.height)],atk:[Math.round(a.right),Math.round(a.bottom)],full:!!document.getElementById('bFull'),UIS:+UIS.toFixed(3)})}"
    print('start',await ev(st))
    await pg.set_viewport_size({'width':760,'height':360});await pg.wait_for_timeout(700)
    r=await ev(st);print('after',r)
    import json;j=json.loads(r);print('after.match',j['gl']==[760,360] and j['ui'][2]==760 and j['ui'][3]==360 and j['atk'][0]<=760 and j['atk'][1]<=360)
    await pg.screenshot(path=O('scr_small.jpg'),type='jpeg',quality=80)
    await ev("()=>{window.readSafe=()=>{SAFE.l=44;SAFE.r=34;SAFE.t=0;SAFE.b=21};resize()}");await pg.wait_for_timeout(300)
    print('safe',await ev(st));await pg.screenshot(path=O('scr_safe.jpg'),type='jpeg',quality=80)
    await ev("()=>{window.readSafe=()=>{SAFE.l=SAFE.r=SAFE.t=SAFE.b=0};resize()}")
    await pg.set_viewport_size({'width':390,'height':780});await pg.wait_for_timeout(700);print('port',await ev(st));await pg.screenshot(path=O('scr_port.jpg'),type='jpeg',quality=80)
    await pg.set_viewport_size({'width':880,'height':400});await pg.wait_for_timeout(700)
    await pg.click('#bFull');await pg.wait_for_timeout(900)
    print('fs',await ev("()=>JSON.stringify({fs:!!(document.fullscreenElement),enabled:document.fullscreenEnabled,toast:document.getElementById('toast').textContent.slice(0,30),icon:document.getElementById('bFull').textContent,win:[innerWidth,innerHeight]})"))
    await pg.screenshot(path=O('scr_full.jpg'),type='jpeg',quality=80)
    await pg.click('#bFull');await pg.wait_for_timeout(700)
    print('fs off',await ev("()=>JSON.stringify({fs:!!(document.fullscreenElement),icon:document.getElementById('bFull').textContent})"))
