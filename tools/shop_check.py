# 상점/키트/현대식 아이템 확인: 마을 상인 → 무료 구매 → 텐트·상자 설치 → 걷기, 뒤지기(고철 더미) 0개
async def steps(pg):
    ev=pg.evaluate
    print(await ev("""()=>{let scrap=0;objs.forEach(o=>{if(o.t===5)scrap++});return JSON.stringify({scrap,markets:structs.filter(s=>s.t==='market').length,shop:SHOP.sell,coins:S.coins})}"""))
    await ev("()=>{const m=structs.find(s=>s.t==='market');P.x=m.x;P.z=m.z+3.2;openPanel('shop')}");await pg.wait_for_timeout(800);await pg.screenshot(path=os.path.join(OUT,'shop.jpg'),type='jpeg',quality=88)
    for k in ['kit_tent','axe','rod','kit_stash']:
        await pg.click(f'[data-a="buy"][data-k="{k}"]');await pg.wait_for_timeout(200)
    print(await ev("()=>JSON.stringify(S.inv)"))
    await ev("()=>openPanel('bag')");await pg.wait_for_timeout(500)
    await ev("()=>{selItem='kit_tent';openPanel('bag')}");await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'bag.jpg'),type='jpeg',quality=88)
    await ev("()=>{closePanel();P.x=VIL.px-40;P.z=VIL.pz+10;P.rot=0;primary('kit_tent')}");await pg.wait_for_timeout(600)
    print('ghost',await ev("()=>JSON.stringify(ghostPos())"))
    await ev("()=>placeBuild()");await pg.wait_for_timeout(300)
    await ev("()=>{P.rot=Math.PI/2;primary('kit_stash')}");await pg.wait_for_timeout(400);await ev("()=>placeBuild()");await pg.wait_for_timeout(300)
    print(await ev("()=>JSON.stringify({inv:S.inv,own:structs.filter(s=>s.own).map(s=>[s.t,s.kit]),home:[S.home.x|0,S.home.z|0]})"))
    await ev("()=>{setBuild(null);S.quick[0]='axe';S.sel=0;P.a.weapon('axe')}")
    await ev("()=>{DEV.on=true;S.time=.42;WX.t=1e9;document.getElementById('ui').style.display='none';const t=structs.find(s=>s.t==='ptent');const uc=updCamera;updCamera=function(dt,px,py,pz,sn){camT.set(t.x,1,t.z);cam.position.set(t.x+1.2,5.2,t.z+7.5);cam.lookAt(t.x+.8,.8,t.z)}}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'tent.jpg'),type='jpeg',quality=90)
    # icons sheet
    await ev("""()=>{const d=document.createElement('div');d.id='icsheet';d.style.cssText='position:fixed;inset:0;background:#2a3340;z-index:999;display:flex;gap:18px;padding:30px;flex-wrap:wrap';['kit_tent','axe','rod','kit_stash'].forEach(k=>{const i=new Image();i.src=ICON[k];i.style.cssText='width:150px;height:150px;background:#3b4656;border-radius:16px';d.appendChild(i)});document.body.appendChild(d)}""");await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'icons.jpg'),type='jpeg',quality=90)
    await ev("()=>document.getElementById('icsheet').remove()")
    # demolish tent → kit back
    await ev("()=>{const t=structs.find(s=>s.t==='ptent');P.x=t.x;P.z=t.z+2.4;DEV.on=false;setBuild('demo');placeBuild();setBuild(null)}")
    print(await ev("()=>JSON.stringify({inv:S.inv,tents:structs.filter(s=>s.t==='ptent').length})"))
