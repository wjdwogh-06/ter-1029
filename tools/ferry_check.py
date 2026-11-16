# 배편 검사(11차): 항구마다 통통배 [배 타기] 1곳, 누르면 항구 고르기 창(지금 항구는 막힘), 고르면 로딩 → 그 항구 앞에 내림
# 기대: n=8, label='배 타기', panel='ferry', rows=8, hereDisabled=true, 로딩 중 on·ferry·움직이지 않음, 도착 near<30·busy false, 부활 화면 글자 그대로
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true}")
    print('ferries',await ev("()=>{const F=structs.filter(s=>s.t==='ferry');return JSON.stringify({n:F.length,ports:F.map(s=>s.pi).sort(),nearBoat:F.every(s=>PBOATS.some(b=>dist(b.m.position.x,b.m.position.z,s.x,s.z)<.1))})}"))
    # 항구마다 배 옆 부두/땅에 서서 라벨 확인
    print('labels',await ev("""()=>{const out=[];for(const s of structs.filter(q=>q.t==='ferry')){let ok=null;for(let r=1.6;r<4.5&&!ok;r+=.3)for(let a=0;a<24&&!ok;a++){const an=a/24*6.283,x=s.x+Math.cos(an)*r,z=s.z+Math.sin(an)*r;if((onDock(x,z)||hAt(x,z)>.9)&&walk(x,z,.42,P)===null){P.x=x;P.z=z;P.rot=Math.atan2(s.x-x,s.z-z);P.auto=null;const t=findTarget();ok={pi:s.pi,lab:t&&t.lab,d:+r.toFixed(1)}}}out.push(ok||{pi:s.pi,lab:'자리 없음'})}return JSON.stringify(out)}"""))
    # 센터(0번) 배에서 타기
    print('open',await ev("""()=>{const s=structs.find(q=>q.t==='ferry'&&q.pi===0);let done=false;for(let r=1.6;r<4.5&&!done;r+=.3)for(let a=0;a<24&&!done;a++){const an=a/24*6.283,x=s.x+Math.cos(an)*r,z=s.z+Math.sin(an)*r;if((onDock(x,z)||hAt(x,z)>.9)&&walk(x,z,.42,P)===null){P.x=x;P.z=z;P.rot=Math.atan2(s.x-x,s.z-z);done=true}}
      P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);const t=findTarget();target=t;inp.actEdge=true;interact();inp.actEdge=false;const rows=[...document.querySelectorAll('#pbody [data-a=ferry]')];
      return JSON.stringify({lab:t&&t.lab,panel,rows:rows.length,hereDisabled:rows[0]&&rows[0].disabled,txt:document.getElementById('pbody').innerText.slice(0,120)})}"""))
    await pg.wait_for_timeout(400);await pg.screenshot(path=O('ferry_panel.jpg'),type='jpeg',quality=85)
    await pg.click('#pbody [data-a=ferry][data-i="6"]');await pg.wait_for_timeout(1200)
    print('loading',await ev("()=>{const f=document.getElementById('respawn');return JSON.stringify({on:f.classList.contains('on'),ferry:f.classList.contains('ferry'),t:f.querySelector('.rsT').textContent,st:document.getElementById('rsSt').textContent,bar:document.getElementById('rsBar').style.width,busy,fon:FERRY.on,panel})}"))
    await pg.screenshot(path=O('ferry_loading.jpg'),type='jpeg',quality=85)
    x0=await ev("()=>{inp.mx=1;return P.x}");await pg.wait_for_timeout(600);print('frozen',await ev(f"()=>Math.abs(P.x-({x0}))<.01"));await ev("()=>{inp.mx=0}")
    await pg.wait_for_timeout(6500)
    print('arrive',await ev("()=>{const p=PORTS[6],f=document.getElementById('respawn');return JSON.stringify({near:+dist(P.x,P.z,p.x,p.z).toFixed(1),busy,fon:FERRY.on,on:f.classList.contains('on'),ferry:f.classList.contains('ferry'),ground:hAt(P.x,P.z)>.9||onDock(P.x,P.z),toast:document.getElementById('toast').textContent})}"))
    await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(500);await pg.screenshot(path=O('ferry_arrive.jpg'),type='jpeg',quality=85)
    print('respawn text',await ev("()=>{respawnLoad(()=>'테스트');const f=document.getElementById('respawn');const r=JSON.stringify({t:f.querySelector('.rsT').textContent,ferry:f.classList.contains('ferry')});return r}"))
