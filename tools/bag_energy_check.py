# 27차: 에너지 10칸 · 가방 20칸 · 발전기 연료 · 집 안 양옆 벽 검사
# 기대: hud cells 10·옛 줄 숨김·73 → 7칸+30% / 배고픔·체온 100 그대로 / 헤엄 5초 ≈ -10 / 밖 쉬기 40초 ≈ +10, 집 안 4초 ≈ +10 / 통조림 +38
#       가방 창: 탭 없음·칸 20·제목 'N/20' / 21번째 종류 → 발밑 자루(life 300)·가방엔 없음 / 꽉 차면 상점·식물 막힘 / 버리기 → 자루(hold)·멀어졌다 오면 주움
#       발전기: 연료 없으면 '연료 필요', 있으면 '연료 넣기' → 연료 1 → 5분 / 설명 글에 '배고픔' 없음 / errs []
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    async def shot(n,w=600):
        await pg.wait_for_timeout(w);await pg.screenshot(path=O(n),type='jpeg',quality=85)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{}}")
    print('hud',await ev("""()=>{S.hp=73;hud();const c=[...document.querySelectorAll('#nrg .nc b')].map(b=>b.style.width);const hid=['bHp','bHu','bWa'].map(i=>document.getElementById(i).closest('.br').style.display);
      return JSON.stringify({cells:c.length,w:c.join(','),hidden:hid,low:document.getElementById('nrg').classList.contains('low')})}"""))
    await shot('be_hud.jpg',400)
    print('lowHud',await ev("()=>{S.hp=15;hud();return document.getElementById('nrg').classList.contains('low')}"))
    print('noHunger',await ev("()=>{S.hp=80;P.lastHurt=0;for(let i=0;i<100;i++)updStats(.05);return JSON.stringify({hunger:S.hunger,warm:S.warm,hp:+S.hp.toFixed(1)})}"))
    # 헤엄: 깊은 물 찾아서 5초
    print('swim',await ev("""()=>{let w=null;for(let r=30;r<400&&!w;r+=4)for(let k=0;k<48;k++){const a=k/48*Math.PI*2,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(hAt(x,z)<-1.2&&!onDock(x,z)){w={x,z};break}}
      P.x=w.x;P.z=w.z;unstuck();P.x=w.x;P.z=w.z;for(let i=0;i<5;i++)updWaterState(.02);S.hp=80;P.lastHurt=9;const st=WTR.st;for(let i=0;i<100;i++){updWaterState(.05);updStats(.05)}return JSON.stringify({st,drop:+(80-S.hp).toFixed(1)})}"""))
    await ev("()=>{P.x=VIL.x;P.z=VIL.z;unstuck();for(let i=0;i<5;i++)updWaterState(.02)}")
    print('regen',await ev("()=>{S.hp=50;P.lastHurt=9;for(let i=0;i<800;i++)updStats(.05);const out=+(S.hp-50).toFixed(1);return JSON.stringify({outside40s:out})}"))
    print('food',await ev("()=>{S.hp=50;give('can',1);useItem('can');const a=S.hp;useItem('can');return JSON.stringify({after:a,desc:ITEMS.can.d,bandage:ITEMS.bandage.d,fish:ITEMS.f_tuna.d,anyHunger:Object.keys(ITEMS).filter(k=>/배고픔|체온/.test(ITEMS[k].d||'')).length})}"))
    # 가방 창
    await ev("()=>{openPanel('bag')}");await pg.wait_for_timeout(300)
    print('bag',await ev("()=>JSON.stringify({title:document.getElementById('ptabs').textContent,tabs:document.querySelectorAll('[data-tab]').length,cells:document.querySelectorAll('#pbody .grid .slot').length,eq:!!document.querySelector('#pbody .eq')})"))
    await shot('be_bag.jpg',300)
    # 20칸 채우기 → 21번째
    print('fill',await ev("""()=>{const pool=Object.keys(ITEMS).filter(k=>!ITEMS[k].one&&!(S.inv[k]>0)&&ITEMS[k].ty!=='kit');let i=0;while(bagList().length<BAG_N)give(pool[i++],1);
      const nd=drops.length,nk=pool[i];give(nk,3);const d=drops[drops.length-1];window.TQnk=nk;renderPanel();
      return JSON.stringify({kinds:bagList().length,inBag:!!S.inv[nk],newDrop:drops.length-nd,life:d&&d.life,items:d&&d.items,toast:document.getElementById('toast').textContent,cells:document.querySelectorAll('#pbody .grid .slot').length,title:document.getElementById('ptabs').textContent})}"""))
    await shot('be_bag_full.jpg',300)
    await ev("()=>closePanel()")
    # 꽉 찬 채로 상점에서 받기 → 막힘
    await ev("()=>{P.x=VIL.mx;P.z=VIL.mz+2;delete S.inv.fuel;while(bagList().length<BAG_N)give(Object.keys(ITEMS).find(k=>!ITEMS[k].one&&!(S.inv[k]>0)&&k!=='fuel'&&k!==TQnk),1);openPanel('shop')}");await pg.wait_for_timeout(300)
    print('shopFull',await ev("()=>{const b=document.querySelector('[data-a=buy][data-k=fuel]');b.click();const r={got:invN('fuel'),toast:document.getElementById('toast').textContent};closePanel();return JSON.stringify(r)}"))
    # 꽉 찬 채로 식물 따기 → 막힘
    print('plantFull',await ev("()=>{const p=PL.list.find(q=>!plGone(q)&&!(S.inv[q.id]>0));P.x=p.x;P.z=p.z+1.1;P.cd=0;plantPick({pl:p});return JSON.stringify({gone:plGone(p),got:invN(p.id)})}"))
    # 버리기 → 발 앞 자루(hold) → 그 자리에선 안 주움 → 멀어졌다 오면 주움. 그동안 칸이 비어서 21번째 자루도 주움
    await ev("()=>{P.x=VIL.x+20;P.z=VIL.z+20;unstuck();openPanel('bag')}");await pg.wait_for_timeout(300)
    print('drop',await ev("""()=>{const k=bagList().find(q=>ITEMS[q].ty==='res'||ITEMS[q].ty==='food')||bagList()[0];window.TQdk=k;selItem=k;renderPanel();const b=document.querySelector('[data-a=drop]');const n0=drops.length;b.click();
      const d=drops[drops.length-1];return JSON.stringify({k,btn:!!b,inBag:!!S.inv[k],sack:drops.length-n0,hold:d&&d.hold,kinds:bagList().length})}"""))
    await ev("()=>closePanel()");await pg.wait_for_timeout(1500)
    print('dropStay',await ev("()=>JSON.stringify({back:!!S.inv[TQdk],kinds:bagList().length})"))
    await ev("()=>{P.x+=8}");await pg.wait_for_timeout(600);await ev("()=>{P.x-=8}");await pg.wait_for_timeout(1800)
    print('dropBack',await ev("()=>JSON.stringify({back:!!S.inv[TQdk],kinds:bagList().length})"))
    # 발전기
    print('gen',await ev("""()=>{S.inv.scrap=50;S.inv.wood=50;delete S.inv.fuel;setBuild('gen');let g=null;for(let i=0;i<300&&!(g&&g.ok);i++){P.x=VIL.x-70+(i%20)*2.5;P.z=VIL.z+40+((i/20)|0)*2.5;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);
      const s=structs.find(q=>q.own&&q.t==='gen');const l0=sLabel(s);while(bagList().length>=BAG_N)delete S.inv[bagList()[0]];give('fuel',2);const l1=sLabel(s);P.x=s.x;P.z=s.z+1.6;P.rot=Math.PI;P.auto=null;S.quick[S.sel]=null;target=findTarget();const tl=target&&target.lab;P.cd=0;inp.actEdge=true;interact();inp.actEdge=false;
      return JSON.stringify({noFuel:l0,withFuel:l1,tl,fuel:s.fuel,left:invN('fuel'),desc:BUILDS.gen.d})}"""))
    # 집 안 양옆 벽
    await ev("""()=>{const t=addStruct({t:'phouse',x:VIL.x-80,z:VIL.z+60,r:0,own:1,hp:600});intEnter(t)}""");await pg.wait_for_timeout(1800)
    print('house',await ev("()=>JSON.stringify({on:INT.on,kind:INT.kind})"))
    await shot('be_house.jpg',500)
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
