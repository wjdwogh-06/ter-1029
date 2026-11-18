# 배편 검사(11차): 항구마다 통통배 [배 타기] 1곳, 누르면 항구 고르기 창(지금 항구는 막힘), 고르면 로딩 → 그 항구 앞에 내림
# 기대: n=8, label='배 타기', panel='ferry', rows=8, hereDisabled=true, 로딩 중 on·ferry·움직이지 않음, 도착 boat<5.2(배 바로 앞)·busy false, 부활 화면 글자 그대로
# 12차: 낚싯대·총·수류탄을 들어도 배 앞에서 [배 타기](rod/gun/grenade 모두 '배 타기'), 낚싯대 들고 배를 눌러도(worldTap) 배 타기, 8곳 모두 도착 자리 있음
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true}")
    print('ferries',await ev("()=>{const F=structs.filter(s=>s.t==='ferry');return JSON.stringify({n:F.length,ports:F.map(s=>s.pi).sort(),nearBoat:F.every(s=>PBOATS.some(b=>dist(b.m.position.x,b.m.position.z,s.x,s.z)<.1))})}"))
    # 항구마다 배 옆 부두/땅에 서서 라벨 확인
    print('labels',await ev("""()=>{const out=[];for(const s of structs.filter(q=>q.t==='ferry')){let ok=null;for(let r=1.6;r<4.5&&!ok;r+=.3)for(let a=0;a<24&&!ok;a++){const an=a/24*6.283,x=s.x+Math.cos(an)*r,z=s.z+Math.sin(an)*r;if((onDock(x,z)||hAt(x,z)>.9)&&walk(x,z,.42,P)===null){P.x=x;P.z=z;P.rot=Math.atan2(s.x-x,s.z-z);P.auto=null;const t=findTarget();ok={pi:s.pi,lab:t&&t.lab,d:+r.toFixed(1)}}}out.push(ok||{pi:s.pi,lab:'자리 없음'})}return JSON.stringify(out)}"""))
    # 12차: 무엇을 들어도 배 타기 + 8곳 내릴 자리
    print('held',await ev("""()=>{const s=structs.find(q=>q.t==='ferry'&&q.pi===2);const sp=ferrySpot(2);P.x=sp.x;P.z=sp.z;P.rot=Math.atan2(s.x-sp.x,s.z-sp.z);P.auto=null;const out={};
      for(const id of ['rod','pistol','grenade','fist']){S.inv[id]=Math.max(1,S.inv[id]||0);S.quick[S.sel]=id==='fist'?null:id;target=findTarget();out[id]=target&&target.lab}
      S.quick[S.sel]='rod';P.auto=null;worldTap(s.x,s.z);out.tapRod=P.auto&&P.auto.lab;P.auto=null;S.quick[S.sel]=null;return JSON.stringify(out)}"""))
    print('spots',await ev("()=>JSON.stringify(PORTS.map((p,i)=>{const s=structs.find(q=>q.t==='ferry'&&q.pi===i),sp=ferrySpot(i);return sp?{i,boat:+dist(sp.x,sp.z,s.x,s.z).toFixed(1),dock:onDock(sp.x,sp.z)}:{i,none:1}}))"))
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
    print('arrive',await ev("()=>{const p=PORTS[6],f=document.getElementById('respawn'),b=structs.find(q=>q.t==='ferry'&&q.pi===6);return JSON.stringify({boat:+dist(P.x,P.z,b.x,b.z).toFixed(1),near:+dist(P.x,P.z,p.x,p.z).toFixed(1),busy,fon:FERRY.on,on:f.classList.contains('on'),ferry:f.classList.contains('ferry'),ground:hAt(P.x,P.z)>.9||onDock(P.x,P.z),toast:document.getElementById('toast').textContent})}"))
    await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(500);await pg.screenshot(path=O('ferry_arrive.jpg'),type='jpeg',quality=85)
    print('respawn text',await ev("()=>{respawnLoad(()=>'테스트');const f=document.getElementById('respawn');const r=JSON.stringify({t:f.querySelector('.rsT').textContent,ferry:f.classList.contains('ferry')});return r}"))
