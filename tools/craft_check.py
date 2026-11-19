# 28차: 작업대 제작 칸 3×2(마크식 제작법) 검사
# 기대(30차: 탄알·낚싯대·손도끼 제작법 없음): pats 6·재료 수는 모양에서(grenade 고철3 화약3) / 손으로 놓기 → 기관단총 맞음, 좌우 뒤집기·옆으로 밀기(붕대)도 맞음, 엉뚱한 모양·예전 탄 모양은 null
#       만들기 → 붕대 1·칸 비움 / [놓기] 붕대 → 칸 2개 더 쌓고 [전부] → 붕대 3개 / 이미 가진 권총은 [놓기] 막힘
#       창 닫으면 칸 재료가 가방으로 / 꽉 찬 가방이면 막힘 / 다시 켤 때(S.cg 남음) 돌려줌 / 창: 칸 6·결과·제작법 10줄 / errs []
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};Object.assign(S.inv,{wood:20,stone:20,scrap:30,powder:12,cloth:20})}")
    print('pats',await ev("()=>JSON.stringify({n:RECIPES.filter(r=>r.pat).length,grenade:RECIPES.find(r=>r.id==='grenade').c,smg:RECIPES.find(r=>r.id==='smg').c})"))
    await ev("()=>{openPanel('bench')}");await pg.wait_for_timeout(300)
    print('ui',await ev("()=>JSON.stringify({slots:document.querySelectorAll('[data-a=cgs]').length,recipes:document.querySelectorAll('[data-a=cgfill]').length,pick:document.querySelectorAll('[data-a=cgpick]').length,up:!!document.querySelector('.upw')})"))
    print('match',await ev("""()=>{const put=(k,i)=>{CG.sel=k;cgPut(i)};const r={};
      for(const i of[0,1,2,3,4])put('scrap',i);put('wood',5);r.a=(cgMatch()||{}).id||null;cgReturn();
      for(const i of[0,1,2,4,5])put('scrap',i);put('wood',3);r.mirror=(cgMatch()||{}).id||null;cgReturn();
      put('cloth',4);put('cloth',5);r.shift=(cgMatch()||{}).id||null;cgReturn();
      put('stone',0);put('wood',1);r.wrong=(cgMatch()||{}).id||null;cgReturn();
      put('scrap',3);put('powder',4);r.ammoBottom=(cgMatch()||{}).id||null;cgReturn();return JSON.stringify(r)}"""))
    print('make',await ev("""()=>{const put=(k,i)=>{CG.sel=k;cgPut(i)};const c0=invN('cloth');put('cloth',0);put('cloth',1);renderPanel();const res=document.querySelector('[data-a=cgmake][data-n="1"]');const dis=res.disabled;res.click();
      return JSON.stringify({btnDis:dis,bandage:invN('bandage'),empty:cgGrid().every(c=>!c),used:{cloth:c0-invN('cloth')}})}"""))
    print('fillAll',await ev("""()=>{const i=RECIPES.findIndex(r=>r.id==='bandage');document.querySelector(`[data-a=cgfill][data-i="${i}"]`).click();const g=cgGrid().map(c=>c&&c.id+':'+c.n);
      CG.sel='cloth';for(const c of cgGrid().map((c,j)=>c&&c.id==='cloth'?j:-1).filter(j=>j>=0)){cgPut(c);cgPut(c)}
      const a0=invN('bandage');renderPanel();document.querySelector('[data-a=cgmake][data-n="999"]').click();return JSON.stringify({g,made:invN('bandage')-a0,empty:cgGrid().every(c=>!c)})}"""))
    print('own',await ev("()=>{const i=RECIPES.findIndex(r=>r.id==='pistol');renderPanel();return JSON.stringify({have:invN('pistol'),fillDis:document.querySelector(`[data-a=cgfill][data-i=\"${i}\"]`).disabled})}"))
    await ev("()=>{const i=RECIPES.findIndex(r=>r.id==='grenade');cgFill(i);renderPanel()}");await pg.wait_for_timeout(300)
    await pg.screenshot(path=O('craft_bench.jpg'),type='jpeg',quality=88)
    print('close',await ev("()=>{const sc=invN('scrap'),pw=invN('powder');closePanel();return JSON.stringify({scrapBack:invN('scrap')-sc,powderBack:invN('powder')-pw,grid:cgGrid().some(Boolean)})}"))
    # 꽉 찬 가방: 만들기 막힘
    print('full',await ev("""()=>{openPanel('bench');const pool=Object.keys(ITEMS).filter(k=>!ITEMS[k].one&&!(S.inv[k]>0)&&ITEMS[k].ty!=='kit'&&k!=='bandage');let i=0;delete S.inv.bandage;while(bagList().length<BAG_N)give(pool[i++],1);
      const ri=RECIPES.findIndex(r=>r.id==='bandage');S.inv.cloth=(S.inv.cloth||0)+2;cgFill(ri);const before=invN('bandage');cgMake(1);const r={made:invN('bandage')-before,toast:document.getElementById('toast').textContent};closePanel();return JSON.stringify(r)}"""))
    # 저장된 채 꺼졌을 때: 다시 켜면 돌려줌
    print('boot',await ev("()=>{const w=invN('wood');S.cg=[{id:'wood',n:3},null,null,null,null,null];CG.boot=0;hud();return JSON.stringify({back:invN('wood')-w,grid:S.cg.some(Boolean)})}"))
    # 세로 화면 사진
    await pg.set_viewport_size({'width':420,'height':860});await pg.wait_for_timeout(600)
    await ev("()=>{openPanel('bench');const i=RECIPES.findIndex(r=>r.id==='grenade');cgFill(i);renderPanel()}");await pg.wait_for_timeout(500)
    await pg.screenshot(path=O('craft_bench_port.jpg'),type='jpeg',quality=88)
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
