# 32차 검사: 큰 버튼 없음 · 조이스틱 고정 · 조이스틱 말고 화면을 누르면 상호작용·쓰기 · 수류탄은 들기만 하고 누를 때 던지기
# 진짜 터치(CDP). touchEnd에 적은 손가락이 떼져요. 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.yv=undefined;S.quick[S.sel]='pistol';give('ammoS',40)}")
    await pg.wait_for_timeout(500)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    res={}
    # 1. 큰 버튼 없음, 조이스틱 늘 보임·고정
    j0=await ev("()=>{const r=document.getElementById('joy').getBoundingClientRect();return [r.x,r.y,r.width,getComputedStyle(document.getElementById('joy')).display,getComputedStyle(document.getElementById('bAtk')).display]}")
    jc=[j0[0]+j0[2]/2,j0[1]+j0[2]/2]
    # 41차: 쓰기는 오른쪽 조이스틱으로(끌어서 조준 → 떼면 한 발, 가운데 톡 = 상호작용)
    rc=await ev("()=>{const r=document.getElementById('rjoy').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    # 2. 조이스틱으로 걷기 + 다른 손가락으로 오른쪽 조이스틱을 오른쪽 위로 끌었다 떼면 그쪽으로 쏨
    await T('touchStart',[(1,jc[0],jc[1])]);await T('touchMove',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(300)
    a0=await ev("()=>invN('ammoS')");p0=await ev("()=>[P.x,P.z]")
    await T('touchStart',[(1,jc[0],jc[1]-40),(2,rc[0],rc[1])])
    for k in range(1,7): await T('touchMove',[(1,jc[0],jc[1]-40),(2,rc[0]+50*k/6,rc[1]-20*k/6)]);await pg.wait_for_timeout(20)
    await pg.wait_for_timeout(400);hold=await ev("()=>RJ.aim===1");await T('touchEnd',[(2,rc[0]+50,rc[1]-20)]);await pg.wait_for_timeout(500)
    r=await ev(f"()=>JSON.stringify({{shot:{a0}-invN('ammoS'),moving:P.moving,joy:joy.id!==null,moved:+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(1),adx:+P.adx.toFixed(2),adz:+P.adz.toFixed(2)}})")
    await T('touchEnd',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(200)
    j1=await ev("()=>{const r=document.getElementById('joy').getBoundingClientRect();return [r.x,r.y]}")
    R=json.loads(r);res['move+shoot']=R;R['hold']=hold;R['ok']=R['shot']==1 and hold and R['moving'] and R['joy'] and R['moved']>1 and R['adx']>0
    res['fixed']={'joy':j0,'after':j1,'ok':j0[3]!='none' and j0[4]=='none' and abs(j0[0]-j1[0])<1 and abs(j0[1]-j1[1])<1}
    # 3. 가까이 자판기가 있으면 오른쪽 조이스틱 가운데 톡 = 자판기(41차)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const v=structs.find(s=>s.t==='vend'&&dist(s.x,s.z,VIL.x,VIL.z)<60);P.x=v.x;P.z=v.z+sdef(v).bz+.75;P.rot=Math.PI;P.yv=undefined;S.quick[S.sel]=null;await sl(400);return JSON.stringify({lab:target&&target.lab})}""")
    await pg.touchscreen.tap(rc[0],rc[1]);await pg.wait_for_timeout(400)
    r2=await ev("()=>{const p=panel;closePanel();return p}");res['tapAct']={'lab':json.loads(r)['lab'],'panel':r2,'ok':r2=='vend'}
    # 4. 두 손가락(조이스틱 아님) 확대: 쏘지 않음 / 조이스틱 누른 채 확대해도 걷기 그대로
    await ev("()=>{P.x=VIL.x+18;P.z=VIL.z+14;unstuck();S.quick[S.sel]='pistol';ZOOM.t=1}");await pg.wait_for_timeout(400)
    a1=await ev("()=>invN('ammoS')");z0=await ev("()=>zoomK")
    await T('touchStart',[(1,jc[0],jc[1])]);await T('touchMove',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(150)
    await T('touchStart',[(1,jc[0],jc[1]-40),(2,500,200),(3,620,200)])   # 두 손가락이 거의 같이 닿음
    for k in range(1,9):
        await T('touchMove',[(1,jc[0],jc[1]-40),(2,500-k*12,200),(3,620+k*12,200)]);await pg.wait_for_timeout(25)
    await pg.wait_for_timeout(500)
    r=await ev(f"()=>JSON.stringify({{shot:{a1}-invN('ammoS'),z:+zoomK.toFixed(2),z0:{z0},joy:joy.id!==null,moving:P.moving}})")
    await T('touchEnd',[(2,404,200)]);await T('touchEnd',[(3,716,200)]);await pg.wait_for_timeout(100);await T('touchEnd',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(200)
    R=json.loads(r);R['ok']=R['shot']==0 and R['z']<R['z0']-.1 and R['joy'] and R['moving'];res['pinch']=R
    await ev("()=>{ZOOM.t=1}")
    # 5. 수류탄: 가방에서 누르면 들기만, 오른쪽 조이스틱을 끌었다 떼면 그쪽으로 하나(41차)
    await ev("()=>{give('grenade',3);openPanel('bag')}");await pg.wait_for_timeout(300)
    s=await ev("()=>{const r=document.querySelector('#pbody [data-a=sel][data-k=grenade]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    await pg.touchscreen.tap(s[0],s[1]);await pg.wait_for_timeout(500)
    r=await ev("()=>{const out={held:curId(),n:invN('grenade'),nades:nades.length};closePanel();return JSON.stringify(out)}")
    R=json.loads(r);R['ok']=R['held']=='grenade' and R['n']==3 and R['nades']==0;res['nadeEquip']=R
    await pg.wait_for_timeout(300)
    tgt=await ev("()=>[0,0,P.x+6,P.z-4]")
    await T('touchStart',[(5,rc[0],rc[1])])
    for k in range(1,7): await T('touchMove',[(5,rc[0]+30*k/6,rc[1]-20*k/6)]);await pg.wait_for_timeout(20)
    await pg.wait_for_timeout(300);await T('touchEnd',[(5,rc[0]+30,rc[1]-20)]);await pg.wait_for_timeout(500)
    r=await ev(f"()=>{{const n=nades[nades.length-1];return JSON.stringify({{n:invN('grenade'),thrown:nades.length,d:n?+n.d.toFixed(1):null,dir:n?[+n.dx.toFixed(2),+n.dz.toFixed(2)]:null,want:+Math.hypot({tgt[2]}-P.x,{tgt[3]}-P.z).toFixed(1)}})}}")
    await pg.wait_for_timeout(300)
    R=json.loads(r);R['ok']=R['n']==2 and R['thrown']==1 and R['dir'] and R['dir'][0]>0 and R['dir'][1]<0;res['nadeThrow']=R
    # 6. 손도끼를 들고 멀리 있는 나무를 톡 → 34차부터 안 걸어감(41차: 화면을 누르면 아무 일도 없어요)
    r=await ev("""()=>{give('axe',1);S.quick[S.sel]='axe';let best=null;for(const o of objs.values()){if(o.t>2||o.re>0)continue;const d=dist(P.x,P.z,o.x,o.z);if(d>7&&d<14&&(!best||d<best.d))best={o,d}}if(!best)return 'no tree';const q=scr(best.o.x,groundY(best.o.x,best.o.z)+1,best.o.z);window._TT=best.o;return JSON.stringify([q[0],q[1],+best.d.toFixed(1)])}""")
    if r!='no tree':
        q=json.loads(r);await pg.touchscreen.tap(q[0],q[1]);await pg.wait_for_timeout(200)
        r2=await ev("()=>JSON.stringify({auto:P.auto&&P.auto.k,toTree:!!(P.auto&&P.auto.o===_TT)})");R=json.loads(r2);R['ok']=not R['auto'];res['noGoTree']=R
    # 7. 설치 모드에서 화면 톡 = 설치
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));P.auto=null;give('kit_stash',1);setBuild('stash');for(let k=0;k<60;k++){P.x=VIL.x+20+(k%8)*7;P.z=VIL.z+30+((k/8)|0)*7;P.rot=0;unstuck();await sl(60);if(ghostPos().ok)break}updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(300);const g=ghostPos(),q=scr(g.x,groundY(g.x,g.z),g.z);window._Q=q;return JSON.stringify({ok:g.ok,n:structs.filter(s=>s.t==='stash'&&s.own).length})}""")
    q=await ev("()=>_Q")   # 33차: 설치는 누른 곳에 → 앞쪽 미리보기 자리를 눌러요
    await pg.touchscreen.tap(q[0],q[1]);await pg.wait_for_timeout(400)
    r2=await ev("()=>JSON.stringify({n:structs.filter(s=>s.t==='stash'&&s.own).length,bmode,toast:document.getElementById('toast').textContent,kit:invN('kit_stash')})");R={'before':json.loads(r),'after':json.loads(r2)};R['ok']=R['before']['ok'] and R['after']['n']==R['before']['n']+1;res['build']=R
    await ev("()=>setBuild(null)")
    for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
    await pg.screenshot(path=O('p32_hud.jpg'),type='jpeg',quality=85)
    await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(800);await ev("()=>openPanel('bag')");await pg.wait_for_timeout(500)
    port=await ev("()=>{const j=document.getElementById('joy').getBoundingClientRect(),p=document.getElementById('panel').getBoundingClientRect();return JSON.stringify({over:!(j.bottom<p.top||j.top>p.bottom||j.right<p.left||j.left>p.right),jy:[j.top,j.bottom],pt:p.top})}")
    await pg.screenshot(path=O('p32_port_bag.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()");await pg.wait_for_timeout(300);await pg.screenshot(path=O('p32_port.jpg'),type='jpeg',quality=85)
    print('portBag',port)
    print('ALL',all(v.get('ok') for v in res.values()) and not json.loads(port)['over'])
