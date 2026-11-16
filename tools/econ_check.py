# 6차 게임 규칙 검사: 항구마다 랜덤 자판기·재활용 쓰레기통, 1시간마다 바뀌는 5개, 사기·팔기(20%), 쓰러지면 로딩 뒤 항구 부활, 큰 텐트
# 기대: per=8개 항구 모두 vend 1·recycle 1, bad=[], 자판기 5개가 서로 다름, 다음 시간엔 바뀜, 팔기 = 원래 가격의 20%, 부활 로딩 중엔 아직 죽은 상태, errs=[]
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy)}")
    print('place',await ev("""()=>{const V=structs.filter(s=>s.t==='vend'),R=structs.filter(s=>s.t==='recycle'),bad=[];
      for(const s of V.concat(R)){const d=sdef(s);for(const [u,v] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const x=s.x+u*d.bx,z=s.z+v*d.bz;if(hAt(x,z)<1.02)bad.push([s.t,s.pi,'물']);if(onDock(x,z))bad.push([s.t,s.pi,'부두'])}
       for(const o of structs)if(o!==s&&!sdef(o).pass&&Math.abs(o.x-s.x)<6&&Math.abs(o.z-s.z)<6&&inStruct(o,s.x,s.z,Math.max(d.bx,d.bz)*.9))bad.push([s.t,s.pi,'겹침',o.t])}
      const per=PORTS.map(p=>[p.n,V.filter(s=>s.pi===p.i).length,R.filter(s=>s.pi===p.i).length,Math.round(Math.min(...V.filter(s=>s.pi===p.i).map(s=>dist(s.x,s.z,p.x,p.z))))]);
      return JSON.stringify({nV:V.length,nR:R.length,per,bad})}"""))
    print('rotate',await ev("""()=>{const now=Date.now(),a=vendItems(0,now),b=vendItems(0,now+VEND.per),c=vendItems(3,now);
      return JSON.stringify({a,b,c,uniq:new Set(a).size,changed:a.join()!==b.join(),diffPort:a.join()!==c.join(),pool:vendPool().length,leftMin:Math.ceil(vendLeft(now)/60000)})}"""))
    # 나무는 손도끼를 들었을 때만, 낚싯대를 들면 상호작용 없음
    print('axe/rod',await ev("""()=>{let t=null;objs.forEach(o=>{if(!t&&o.re<=0&&OBJT[o.t].drop[0]==='wood'&&dist(o.x,o.z,330,420)<60)t=o});P.x=t.x;P.z=t.z+OBJT[t.t].r+.9;P.rot=Math.PI;P.auto=null;P.cd=0;
      const r={};S.quick[S.sel]=null;let g=findTarget();r.fist=g&&g.lab;const h0=t.hp;target=g;interact();r.fistHit=h0-t.hp;
      give('axe',1);S.quick[S.sel]='axe';P.cd=0;g=findTarget();r.axe=g&&g.lab;const h1=g.o.hp;target=g;interact();r.axeHit=h1-g.o.hp;
      give('rod',1);S.quick[S.sel]='rod';g=findTarget();r.rod=g?g.lab:null;const v=structs.find(q=>q.t==='vend');P.x=v.x;P.z=v.z+1.6;r.rodVend=findTarget()?'보임':null;S.quick[S.sel]='pistol';P.x=v.x;P.z=v.z+1.6;r.pistolVend=(findTarget()||{}).lab;return JSON.stringify(r)}"""))
    # 센터 자판기 앞으로 가서 [자판기] → 사기
    await ev("()=>{const s=structs.find(q=>q.t==='vend'&&q.pi===0);P.x=s.x+.2;P.z=s.z+2.1;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(900)
    print('label',await ev("()=>{const t=findTarget();return t&&t.lab}"))
    await pg.screenshot(path=O('econ_vend_world.jpg'),type='jpeg',quality=85)
    print('buy',await ev("""()=>{const t=findTarget();target=t;inp.actEdge=true;interact();inp.actEdge=false;const L=vendItems(VENDAT),k=L.find(q=>!(ITEMS[q].one&&invN(q)))||L[0],n=VEND.pack[k]||1,pr=ITEMS[k].p*n;
      S.coins=pr+50;const c0=S.coins,i0=invN(k);document.querySelector('[data-a="vbuy"][data-k="'+k+'"]').click();return JSON.stringify({panel,k,pr,spent:c0-S.coins,got:invN(k)-i0,n})}"""))
    await pg.wait_for_timeout(300);await pg.screenshot(path=O('econ_vend_panel.jpg'),type='jpeg',quality=85)
    print('poor',await ev("()=>{S.coins=0;renderPanel();return document.querySelectorAll('[data-a=\"vbuy\"]:disabled').length}"))
    await ev("()=>closePanel()")
    # 쓰레기통: 팔기 20%
    await ev("()=>{const s=structs.find(q=>q.t==='recycle'&&q.pi===0);P.x=s.x;P.z=s.z+2.0;P.rot=Math.PI;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(700)
    print('label2',await ev("()=>{const t=findTarget();return t&&t.lab}"))
    print('sell',await ev("""()=>{give('wood',10);give('f_tuna',2);give('rifle',1);S.coins=0;const t=findTarget();target=t;inp.actEdge=true;interact();inp.actEdge=false;
      const q=(k,n)=>document.querySelector('[data-a="rsell"][data-k="'+k+'"][data-n="'+n+'"]');const r={panel};
      q('wood',invN('wood')).click();r.wood=[S.coins,ITEMS.wood.p*10*.2];const c=S.coins;q('rifle',1).click();r.rifle=[S.coins-c,ITEMS.rifle.p*.2,invN('rifle')];return JSON.stringify(r)}"""))
    await ev("()=>renderPanel()");await pg.wait_for_timeout(200);await pg.screenshot(path=O('econ_recycle_panel.jpg'),type='jpeg',quality=85)
    await ev("()=>closePanel()")
    # 쓰러지기 → 로딩 → 무작위 항구
    await ev("()=>{DEV.god=false;S.hp=1;hurtPlayer(50)}")
    await pg.wait_for_timeout(4300)
    print('loading',await ev("()=>JSON.stringify({dead:P.dead,on:$('respawn').classList.contains('on'),bar:$('rsBar').style.width,msg:$('rsSt').textContent})"))
    await pg.screenshot(path=O('econ_respawn_loading.jpg'),type='jpeg',quality=85)
    await pg.wait_for_timeout(4200)
    print('after',await ev("()=>{let b=null,bd=1e9;for(const p of PORTS){const d=dist(p.x,p.z,P.x,P.z);if(d<bd){bd=d;b=p}}return JSON.stringify({dead:P.dead,on:$('respawn').classList.contains('on'),port:b.n,d:Math.round(bd),hp:S.hp})}"))
    await pg.wait_for_timeout(900);await pg.screenshot(path=O('econ_respawn_after.jpg'),type='jpeg',quality=85)
    # 큰 텐트 + 캐릭터 크기 비교, 항구마다 자판기 사진
    await ev("()=>{enemies.slice().forEach(dropEnemy);give('kit_tent',1);setBuild('ptent');let g=null;for(let k=0;k<400;k++){P.x=330+k*2.5;P.z=420;P.rot=0;g=ghostPos();if(g&&!g.why)break}setBuild(null);addStruct({t:'ptent',x:g.x,z:g.z,r:0,own:1});P.x=g.x+3.4;P.z=g.z+2.4;P.rot=0;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('econ_tent.jpg'),type='jpeg',quality=85)
    for i in range(8):
        await ev(f"()=>{{const s=structs.find(q=>q.t==='vend'&&q.pi==={i});P.x=s.x+1.1;P.z=s.z+3.2;P.rot=Math.PI;enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}")
        await pg.wait_for_timeout(900);await pg.screenshot(path=O(f'econ_port{i}.jpg'),type='jpeg',quality=80)
    await ev("()=>{S.time=.95}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('econ_port7_night.jpg'),type='jpeg',quality=80)
