# 61차(디자인): 총 7종(쏘는 방식·느려짐·저격 시야) · 키트 7종 · 신발 4종(효과·발에 신기)
# 진짜 터치(CDP)로 오른쪽 조이스틱을 끌어요. 기대: 각 줄 ok true, ALL True, errs []
# 사진: tools/out/p61_icons.png(총·키트), p61_guns3d.png, p61_shoe_icons.png, p61_shoes3d.png(p61_view·p61_view2), p61_sniper.jpg, p61_worn.jpg
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};if(typeof HZ!=='undefined')HZ.off=1;P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.yv=undefined}")
    await pg.set_viewport_size({'width':844,'height':390});await pg.wait_for_timeout(900)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    async def rect(sel): return await ev("s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height]}",sel)
    res={}
    G=['pistol','rifle','ar','burst','smg','sniper','shotgun'];SH=['shoes_boot','shoes_mil','shoes_light','shoes_rainbow']
    # 1. 정의: 이름·쏘는 방식·키트·아이콘·자판기
    d=json.loads(await ev("""(a)=>{const [G,SH]=a;const pool=vendPool(),K=G.map(k=>'gkit_'+k);return JSON.stringify({names:G.map(k=>ITEMS[k].n),fm:G.map(k=>WEAP[k].fm),
      slow:G.map(k=>WEAP[k].slow||1),use:WEAP.smg.use,kitNames:K.every((k,i)=>ITEMS[k]&&ITEMS[k].n===ITEMS[G[i]].n+' 키트'),
      noIcon:[...G,...K,...SH].filter(k=>!/^data:image/.test(ICON[k]||'')),notVend:[...G,...K,...SH].filter(k=>!pool.includes(k)&&!(typeof restrictedSupplyItem==='function'&&restrictedSupplyItem(k))),
      kitGeo:K.filter(k=>!GEO['lk_'+k]),gunGeo:G.filter(k=>!GEO[ITEMS[k].hg]),shoeEq:SH.every(k=>ITEMS[k].eq==='shoes'),shoeGeo:SH.filter(k=>!GEO['lk_'+k+'_1']),
      oldNames:Object.values(ITEMS).filter(it=>/볼트액션|^산탄총$|^권총$/.test(it.n)).map(it=>it.n),sploot:/sniper/.test(SPLOOT.toString())})}""",[G,SH]))
    d['ok']=d['names']==['반자동 권총','반자동 소총','현대 소총','점사 소총','기관단총','저격총','소드오프 샷건'] and d['fm']==['semi','semi','auto','burst','auto','semi','semi'] \
        and d['slow']==[1,.5,.5,.5,.5,.5,.5] and d['use']==2 and d['kitNames'] and not d['noIcon'] and not d['notVend'] and not d['kitGeo'] and not d['gunGeo'] and d['shoeEq'] and not d['shoeGeo'] and not d['oldNames'] and d['sploot']
    res['defs']=d
    # 쏘기 기록: 총알 수를 50ms마다 읽어요(쏠 때마다 줄어요)
    async def hold(id,dx=60,dy=0,ms=1200,after=700,ammo=200,back=False):
        await ev(f"()=>{{S.inv.ammoS={ammo};S.inv['{id}']=1;S.quick[S.sel]='{id}';P.cd=0;GUN.bl=0;closePanel&&panel&&closePanel()}}");await pg.wait_for_timeout(250)
        await ev("()=>{window.__am=[];window.__t0=performance.now();window.__iv=setInterval(()=>__am.push([Math.round(performance.now()-__t0),invN('ammoS')]),40)}")
        c=await rect('#rjoy');await T('touchStart',[(9,c[0],c[1])]);await pg.wait_for_timeout(40)
        for k in range(1,7): await T('touchMove',[(9,c[0]+dx*k/6,c[1]+dy*k/6)]);await pg.wait_for_timeout(20)
        await pg.wait_for_timeout(ms)
        mid=await ev("()=>JSON.stringify({am:invN('ammoS'),aim:RJ.aim,md:RJ.md,gcx:+Math.hypot(GUN.cx,GUN.cz).toFixed(2),rjc:+Math.hypot(RJCAM.x,RJCAM.z).toFixed(2),zk:+GUN.zk.toFixed(3),slowK:+gunMoveK().toFixed(3)})")
        ex,ey=(c[0],c[1]) if back else (c[0]+dx,c[1]+dy)
        if back: await T('touchMove',[(9,ex,ey)]);await pg.wait_for_timeout(60)
        await T('touchEnd',[(9,ex,ey)]);await pg.wait_for_timeout(after)
        tl=await ev("()=>{clearInterval(__iv);return __am}")
        m=json.loads(mid);m['end']=tl[-1][1];m['used']=ammo-tl[-1][1];m['usedHold']=ammo-m['am'];m['tl']=tl
        return m
    # 프레임을 직접 돌려요(헤드리스는 화면이 느려서 실제 시간으로 재면 빠르기가 흔들려요): 오른쪽 조이스틱을 조준한 채로 RJ 상태를 두고 updPlayer(0.02)를 N번
    SIM="""(o)=>{const id=o.id;S.inv.ammoS=o.ammo==null?200:o.ammo;S.inv[id]=1;S.quick[S.sel]=id;P.cd=0;GUN.bl=0;S.eq.shoes=o.shoe||null;if(o.shoe)S.inv[o.shoe]=1;
      P.x=VIL.x+18;P.z=VIL.z+14;P.yv=undefined;unstuck();inp.mx=o.mx||0;inp.mz=0;const x0=P.x;let n=invN('ammoS');const shots=[];
      RJ.id=o.aimF?77:null;RJ.md='aim';RJ.aim=!!o.aimF;RJ.ax=0;RJ.az=1;RJ.k=1;
      for(let f=0;f<(o.total||60);f++){if(f===o.aimF){RJ.id=null;RJ.aim=false}updPlayer(.02);const m=invN('ammoS');for(let k=0;k<n-m;k++)shots.push(f*20);n=m}
      RJ.id=null;RJ.aim=false;inp.mx=0;const dx=+(P.x-x0).toFixed(3);S.eq.shoes=null;return JSON.stringify({shots,used:shots.length,dx})}"""
    sim=lambda **o: ev(SIM,o)
    # 2. 현대 소총: 조준하는 동안 0.12초마다 계속 → 손을 떼면 멈춤
    a=json.loads(await sim(id='ar',aimF=60,total=90));R={'used':a['used'],'last':a['shots'][-1]};R['ok']=a['used']==10 and a['shots'][-1]<1200;res['ar_auto']=R
    # 진짜 터치로도: 끄는 동안 여러 발, 떼면 바로 멈춤(떼서 한 발 더 없음)
    await ev("()=>{S.inv.ammoS=200;S.inv.ar=1;S.quick[S.sel]='ar';P.cd=0;GUN.bl=0}");await pg.wait_for_timeout(250)
    c=await rect('#rjoy');await T('touchStart',[(9,c[0],c[1])]);await pg.wait_for_timeout(40)
    for k in range(1,7): await T('touchMove',[(9,c[0]+60*k/6,c[1])]);await pg.wait_for_timeout(20)
    await pg.wait_for_timeout(1500);await T('touchEnd',[(9,c[0]+60,c[1])]);a0=await ev("()=>invN('ammoS')");await pg.wait_for_timeout(900);a1=await ev("()=>invN('ammoS')")
    R={'whileHeld':200-a0,'afterRelease':a0-a1};R['ok']=R['whileHeld']>=2 and R['afterRelease']==0;res['ar_touch']=R
    # 3. 점사: 3발씩(0.1초 간격) → 0.55초 쉬기 → 3발 …, 손을 떼도 시작한 3발은 끝까지
    a=json.loads(await sim(id='burst',aimF=60,total=90));sh=a['shots'];gaps=[sh[i+1]-sh[i] for i in range(len(sh)-1)]
    b=json.loads(await sim(id='burst',aimF=3,total=40))
    R={'used':a['used'],'gaps':gaps,'releaseMid':b['used']};R['ok']=a['used']==6 and gaps==[100,100,560,100,100] and b['used']==3;res['burst']=R
    # 4. 반자동(반자동 소총·권총·저격총·샷건): 조준하는 동안은 안 쏨 → 떼면 한 발 / 가운데로 돌아와서 떼면 취소
    R={}
    for id in ['rifle','pistol','sniper','shotgun']:
        a=await hold(id,ms=700);R[id]=[a['usedHold'],a['used']]
    a=await hold('rifle',ms=500,back=True);R['cancel']=a['used']
    R['ok']=all(R[k]==[0,1] for k in ['rifle','pistol','sniper','shotgun']) and R['cancel']==0;res['semi']=R
    # 5. 기관단총: 연사 · 한 번에 탄알 2발 · 1발만 있으면 못 쏨
    a=json.loads(await sim(id='smg',aimF=60,total=80));b=json.loads(await sim(id='smg',aimF=30,total=40,ammo=1))
    R={'used':a['used'],'leftWith1':b['used']};R['ok']=a['used']==20 and b['used']==0;res['smg']=R
    # 6. 샷건 알 7개 · 저격총 피해 95(hitscan 몰래 보기)
    R=json.loads(await ev("""()=>{const hs=hitscan,c=[];hitscan=function(x,z,dx,dz,rg,dm){c.push([+rg.toFixed(1),+dm.toFixed(1)]);return 3};S.inv.ammoS=50;
      const sh=id=>{S.inv[id]=1;S.quick[S.sel]=id;c.length=0;P.cd=0;GUN.bl=0;P.adx=0;P.adz=1;attack();return c.slice()};const r={shotgun:sh('shotgun').length,sniper:sh('sniper')[0],pistol:sh('pistol')[0],smg:sh('smg')[0]};hitscan=hs;return JSON.stringify(r)}"""))
    R['ok']=R['shotgun']==7 and R['sniper']==[44,95] and R['pistol'][1]==16 and R['smg'][1]==22;res['dmg']=R
    # 7. 저격총: 조준하면 화면이 훨씬 멀리 밀리고(소총보다) 조금 멀어짐, 캐릭터는 화면 안
    a=await hold('rifle',dx=60,ms=1400,after=900);b=await hold('sniper',dx=60,ms=1400,after=50)
    vis=await ev("()=>{const v=new THREE.Vector3(P.x,groundY(P.x,P.z)+1,P.z).project(cam);return [+v.x.toFixed(2),+v.y.toFixed(2)]}")
    await pg.wait_for_timeout(20)
    R={'rifle':[a['rjc'],a['gcx'],a['zk']],'sniper':[b['rjc'],b['gcx'],b['zk']],'playerOnScreen':vis}
    R['ok']=b['gcx']>3 and a['gcx']<1 and b['zk']>1.15 and abs(vis[0])<.95 and abs(vis[1])<.95;res['sniperCam']=R
    # 사진: 저격총 조준한 채
    await ev("()=>{S.inv.ammoS=50;S.quick[S.sel]='sniper';P.cd=9}")
    c=await rect('#rjoy');await T('touchStart',[(9,c[0],c[1])]);await pg.wait_for_timeout(40)
    for k in range(1,7): await T('touchMove',[(9,c[0]+60*k/6,c[1]-10*k/6)]);await pg.wait_for_timeout(20)
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p61_sniper.jpg'),type='jpeg',quality=85)
    await T('touchMove',[(9,c[0],c[1])]);await pg.wait_for_timeout(60);await T('touchEnd',[(9,c[0],c[1])]);await pg.wait_for_timeout(900);await ev("()=>{P.cd=0}")
    # 8. 걷기 + 조준: 권총은 그대로, 다른 총은 50%, 경량화 신발이면 그대로, 부츠는 +5% (1초 동안 오른쪽으로 걷기)
    async def walk(id,shoe=None,aim=True): return json.loads(await sim(id=id,aimF=50 if aim else 0,total=50,mx=1,shoe=shoe,ammo=0))['dx']
    R={'none':await walk('rifle',aim=False),'pistol':await walk('pistol'),'rifle':await walk('rifle'),'sniper':await walk('sniper'),'burst':await walk('burst'),'rifleLight':await walk('rifle','shoes_light'),'rifleBoot':await walk('rifle','shoes_boot'),'noAimBoot':await walk('rifle','shoes_boot',False),'noAimMil':await walk('rifle','shoes_mil',False)}
    n=R['none'];R['k']={k:round(v/n,3) for k,v in R.items() if k!='none'}
    K=R['k'];R['ok']=abs(K['pistol']-1)<.02 and abs(K['rifle']-.5)<.02 and abs(K['sniper']-.5)<.02 and abs(K['burst']-.5)<.02 and abs(K['rifleLight']-1)<.02 and abs(K['rifleBoot']-.525)<.02 and abs(K['noAimBoot']-1.05)<.02 and abs(K['noAimMil']-.95)<.02;res['moveSlow']=R
    # 9. 신발 효과
    R=json.loads(await ev("""()=>{const r={};S.buffs=[];P.dead=false;const eq=k=>{S.inv[k]=1;bagTap(k);return eqGet('shoes')};const sp=()=>+bufSpeed().toFixed(3);
      const dm=()=>{busy=false;P.inv=0;S.hp=100;const h=S.hp;hurtPlayer(10);return +(h-S.hp).toFixed(2)};
      r.none=[sp(),dm()];r.eqBoot=eq('shoes_boot');r.boot=[sp(),dm()];eq('shoes_mil');r.mil=[sp(),dm()];eq('shoes_light');r.light=[sp(),dm()];eq('shoes_rainbow');r.rainbow=[sp(),dm()];
      const st0=WTR.st;WTR.st='swim';r.swim=sp();WTR.st=st0;
      S.inv.hat_combat=1;bagTap('hat_combat');eq('shoes_mil');r.milHat=dm();S.eq.hat=null;eq('shoes_rainbow');
      S.hp=50;SHOE.rT=0;for(let i=0;i<90;i++)updStats(.1);r.regen9s=S.hp;
      const hs=hitscan,c=[];hitscan=function(x,z,dx,dz,rg,d){c.push(+d.toFixed(2));return 3};S.inv.ammoS=50;S.inv.pistol=1;S.quick[S.sel]='pistol';const R0=Math.random;
      Math.random=()=>.9;P.cd=0;attack();Math.random=()=>.01;P.cd=0;attack();Math.random=R0;hitscan=hs;r.pistolDmg=c;
      S.inv.axe=1;S.quick[S.sel]='axe';Math.random=()=>.9;P.cd=0;attack();Math.random=R0;r.axe=[WEAP.axe.dmg,P.hitW&&+P.hitW.dmg.toFixed(2)];P.hitT=0;P.hitW=null;
      S.eq.shoes=null;return JSON.stringify(r)}"""))
    R['ok']=R['none']==[1,10] and R['eqBoot']=='shoes_boot' and R['boot']==[1.05,10] and R['mil']==[.95,8] and R['light']==[1,10] and R['rainbow']==[1.05,9.5] and R['swim']==1.15 \
        and R['milHat']==7.2 and R['regen9s']==53 and R['pistolDmg']==[16.8,33.6] and abs(R['axe'][1]-R['axe'][0]*1.05)<.01;res['shoes']=R
    # 10. 발에 신기: 캐릭터 셋 × 두 발, 벗으면 없어짐
    R={}
    for v in ['hero','dog','plat']:
        await ev(f"()=>{{DOG.sel='{v}';return 1}}");await pg.wait_for_timeout(1400)
        R[v]=await ev("""()=>{S.inv.shoes_rainbow=1;bagTap('shoes_rainbow');shoeSync();const n=(P.a._shoes||[]).length,par=(P.a._shoes||[]).map(m=>m.parent&&m.parent.name);eqOff('shoes');shoeSync();return [n,par.join(','),(P.a._shoes||[]).length]}""")
    R['ok']=R['hero']==[2,'footl,footr',0] and R['dog']==[2,'dg_footl,dg_footr',0] and R['plat']==[2,'dg_footl,dg_footr',0];res['worn']=R
    await ev("()=>{DOG.sel='hero';return 1}");await pg.wait_for_timeout(800)
    # 11. 저장 → 다시 켜기: 신발 칸 그대로
    await ev("()=>{S.inv.shoes_mil=1;bagTap('shoes_mil');save()}");await pg.reload();await pg.wait_for_selector('#title:not(.hide)',timeout=120000);await pg.wait_for_timeout(1500)
    await pg.click('#tCont');await pg.wait_for_timeout(2500)
    r=await ev("()=>JSON.stringify({shoes:S.eq&&S.eq.shoes,sp:+bufSpeed().toFixed(3),n:(P.a._shoes||[]).length})");R=json.loads(r);R['ok']=R['shoes']=='shoes_mil' and R['sp']==.95 and R['n']==2;res['save']=R
    for k,v in res.items():
        vv={a:b for a,b in v.items() if a!='tl'} if isinstance(v,dict) else v
        print(k,json.dumps(vv,ensure_ascii=False)[:400])
    print('ALL',all(v.get('ok') for v in res.values()))
