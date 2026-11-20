# 41차 검사: 쌍 조이스틱(왼쪽 걷기 · 오른쪽 조준·쓰기 · 가운데 톡 = 상호작용) · 조이스틱 말고 누르면 아무 일 없음 · 구역은 모서리 표시만
# 진짜 터치(CDP). touchEnd에 적은 손가락이 떼져요. 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.yv=undefined;S.quick[S.sel]=null}")
    await pg.wait_for_timeout(500)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    async def rect(sel): return await ev("s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height,r.x,r.y]}",sel)
    async def rtap(i=9):   # 오른쪽 조이스틱 가운데 톡
        c=await rect('#rjoy');await T('touchStart',[(i,c[0],c[1])]);await pg.wait_for_timeout(60);await T('touchEnd',[(i,c[0],c[1])]);await pg.wait_for_timeout(250)
    async def rdrag(dx,dy,hold=500,i=9,steps=6,back=False):   # 오른쪽 조이스틱을 끌었다가(hold ms) 떼요. back이면 가운데로 돌아와서 떼요
        c=await rect('#rjoy');await T('touchStart',[(i,c[0],c[1])]);await pg.wait_for_timeout(40)
        for k in range(1,steps+1): await T('touchMove',[(i,c[0]+dx*k/steps,c[1]+dy*k/steps)]);await pg.wait_for_timeout(20)
        await pg.wait_for_timeout(hold)
        mid=await ev("()=>JSON.stringify({aim:RJ.aim,full:RJ.full,k:+RJ.k.toFixed(2),vis:!!(RJV.m&&RJV.m.visible),ring:!!(RJV.ring&&RJV.ring.visible),fire:inp.fire,md:RJ.md,knob:document.querySelector('#rjoy i').style.transform})")
        ex,ey=(c[0],c[1]) if back else (c[0]+dx,c[1]+dy)
        if back: await T('touchMove',[(i,ex,ey)]);await pg.wait_for_timeout(60)
        await T('touchEnd',[(i,ex,ey)]);await pg.wait_for_timeout(450)
        return json.loads(mid)
    res={}
    # 1. 자리: 오른쪽 조이스틱이 왼쪽과 마주 보게(같은 크기·같은 높이), 가방 버튼은 그 위, 큰 버튼 없음
    for nm,(w,h) in [('land',(844,390)),('port',(390,844))]:
        await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(900)
        j=await rect('#joy');r=await rect('#rjoy');b=await rect('#bBag')
        R={'joy':[round(v) for v in j[:4]],'rjoy':[round(v) for v in r[:4]],'bag':[round(v) for v in b[:4]]}
        R['ok']=abs(j[2]-r[2])<1 and abs(j[1]-r[1])<2 and abs(j[4]-(w-r[4]-r[2]))<2 and b[5]+b[3]<=r[5]-4 and abs(b[0]-r[0])<3 and b[5]>0
        await pg.screenshot(path=O(f'p41_{nm}.jpg'),type='jpeg',quality=85);res['layout_'+nm]=R
    await pg.set_viewport_size({'width':844,'height':390});await pg.wait_for_timeout(900)
    jc=(await rect('#joy'))[:2]
    # 2. 자판기 앞: 화면 다른 곳(자판기 자체 포함)을 눌러도 아무 일 없음 → 오른쪽 가운데 톡 = 자판기 창
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const v=structs.find(s=>s.t==='vend'&&dist(s.x,s.z,VIL.x,VIL.z)<60);P.x=v.x;P.z=v.z+sdef(v).bz+.75;P.rot=Math.PI;P.yv=undefined;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(400);const q=scr(v.x,groundY(v.x,v.z)+1,v.z);return JSON.stringify({lab:target&&target.lab,q})}""")
    Q=json.loads(r);p0=await ev("()=>[P.x,P.z]")
    for (x,y) in [(Q['q'][0],Q['q'][1]),(420,200),(600,120),(300,300)]:
        await T('touchStart',[(3,x,y)]);await pg.wait_for_timeout(60);await T('touchEnd',[(3,x,y)]);await pg.wait_for_timeout(250)
    r1=await ev(f"()=>JSON.stringify({{panel,act:inp.act,fire:inp.fire,moved:+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(2)}})")
    await rtap();r2=await ev("()=>{const p=panel;closePanel();return p}")
    R={'lab':Q['lab'],'elsewhere':json.loads(r1),'rtap':r2};R['ok']=R['lab']=='자판기' and R['elsewhere']['panel'] is None and R['elsewhere']['moved']<.05 and r2=='vend';res['tapOnlyStick']=R
    # 3. 맨손: 끌어도 조준 없음(손잡이 안 움직임), 대상 없으면 톡해도 아무 일 없음
    await ev("()=>{P.x=VIL.x+18;P.z=VIL.z+14;unstuck();S.quick[S.sel]=null}");await pg.wait_for_timeout(400)
    m=await rdrag(60,-20,300)
    r=await ev("()=>JSON.stringify({panel,cur:curId(),tgt:target&&target.lab})");R={'mid':m,'after':json.loads(r)}
    R['ok']=m['md']=='tap' and not m['aim'] and not m['vis'] and m['knob']=='' and R['after']['panel'] is None and R['after']['cur']=='fist';res['bareNoAim']=R
    # 4. 권총: 톡 = 안 쏨 · 끌고 있는 동안 조준 표시만(안 쏨) · 떼면 한 발 그쪽으로 · 가운데로 돌아와 떼면 취소
    await ev("()=>{S.quick[S.sel]='pistol';give('ammoS',40)}");await pg.wait_for_timeout(300)
    a0=await ev("()=>invN('ammoS')");await rtap();a1=await ev("()=>invN('ammoS')")
    c=await rect('#rjoy');await T('touchStart',[(9,c[0],c[1])]);await pg.wait_for_timeout(40)
    for k in range(1,7): await T('touchMove',[(9,c[0]+60*k/6,c[1]-10*k/6)]);await pg.wait_for_timeout(20)
    await pg.wait_for_timeout(700);mid=await ev("()=>JSON.stringify({aim:RJ.aim,vis:!!(RJV.m&&RJV.m.visible),n:invN('ammoS'),fire:inp.fire})")
    await pg.screenshot(path=O('p41_aim.jpg'),type='jpeg',quality=85)
    await T('touchEnd',[(9,c[0]+60,c[1]-10)]);await pg.wait_for_timeout(500)
    r=await ev("()=>JSON.stringify({n:invN('ammoS'),adx:+P.adx.toFixed(2),adz:+P.adz.toFixed(2),vis:!!(RJV.m&&RJV.m.visible),fire:inp.fire})")
    a2=json.loads(r)['n'];m2=await rdrag(60,-10,300,back=True);a3=await ev("()=>invN('ammoS')")
    R={'tapShot':a0-a1,'mid':json.loads(mid),'release':json.loads(r),'shot':a1-a2,'cancelMid':m2,'cancelShot':a2-a3}
    R['ok']=R['tapShot']==0 and R['mid']['aim'] and R['mid']['vis'] and R['mid']['n']==a1 and R['shot']==1 and R['release']['adx']>.95 and R['release']['adz']<-.1 and not R['release']['vis'] and not R['release']['fire'] and m2['aim'] and R['cancelShot']==0;res['pistol']=R
    # 5. 왼쪽으로 걸으면서 오른쪽으로 조준해 쏘기(두 손가락 같이) + 두 조이스틱을 같이 눌러도 확대 안 됨
    await ev("()=>{ZOOM.t=1;zoomK=1}");z0=await ev("()=>zoomK");p0=await ev("()=>[P.x,P.z]");a0=await ev("()=>invN('ammoS')")
    await T('touchStart',[(1,jc[0],jc[1])]);await T('touchMove',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(250)
    await T('touchStart',[(1,jc[0],jc[1]-40),(9,c[0],c[1])]);await pg.wait_for_timeout(40)
    for k in range(1,7): await T('touchMove',[(1,jc[0],jc[1]-40),(9,c[0]-50*k/6,c[1]+30*k/6)]);await pg.wait_for_timeout(25)
    await pg.wait_for_timeout(400);mv=await ev("()=>JSON.stringify({moving:P.moving,aim:RJ.aim})")
    await T('touchEnd',[(9,c[0]-50,c[1]+30)]);await pg.wait_for_timeout(400)
    r=await ev(f"()=>JSON.stringify({{shot:{a0}-invN('ammoS'),moving:P.moving,adx:+P.adx.toFixed(2),adz:+P.adz.toFixed(2),moved:+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(1),z:+zoomK.toFixed(2)}})")
    await T('touchEnd',[(1,jc[0],jc[1]-40)]);await pg.wait_for_timeout(200)
    R=json.loads(r);R['mid']=json.loads(mv);R['ok']=R['shot']==1 and R['moving'] and R['mid']['aim'] and R['adx']<0 and R['adz']>0 and R['moved']>1 and abs(R['z']-z0)<.02;res['moveAndShoot']=R
    # 6. 수류탄: 짧게 끌면 가까이, 길게 끌면 멀리(떨어질 자리 원), 떼야 던짐
    await ev("()=>{P.x=VIL.x+18;P.z=VIL.z+14;unstuck();give('grenade',4);S.quick[S.sel]='grenade';P.cd=0}");await pg.wait_for_timeout(500)
    n0=await ev("()=>nades.length")
    m1=await rdrag(13,0,300);d1=await ev("()=>{const n=nades[nades.length-1];return n?[+n.d.toFixed(1),+n.dx.toFixed(2)]:null}")
    await pg.wait_for_timeout(900);await ev("()=>{P.cd=0}")
    m2=await rdrag(0,-80,300);d2=await ev("()=>{const n=nades[nades.length-1];return n?[+n.d.toFixed(1),+n.dz.toFixed(2)]:null}")
    n1=await ev("()=>nades.length")
    R={'short':m1,'d1':d1,'long':m2,'d2':d2,'left':await ev("()=>invN('grenade')")}
    R['ok']=m1['ring'] and m2['ring'] and d1 and d2 and d1[0]<6 and d1[1]>.9 and d2[0]>12 and d2[1]<-.9 and R['left']==2;res['grenade']=R
    await pg.wait_for_timeout(1200)
    # 7. 손도끼: 끝까지 당기고 있으면 앞의 나무를 계속 벰, 반만 끌면 안 휘두름, 떼면 멈춤
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));give('axe',1);S.quick[S.sel]='axe';let best=null;for(const o of objs.values()){if(o.re>0||!isTree(OBJT[o.t]))continue;const d=dist(VIL.x,VIL.z,o.x,o.z);if(d>40&&d<160&&(!best||d<best.d))best={o,d}}const o=best.o,T=OBJT[o.t];
      P.x=o.x-(T.r+.75);P.z=o.z;P.rot=Math.PI/2;P.yv=undefined;P.cd=0;window._TR=o;await sl(300);return JSON.stringify({hp:o.hp,wood:invN('wood'),blocked:walk(P.x,P.z,.42,P)!==null})}""")
    T0=json.loads(r)
    half=await rdrag(25,0,700);h1=await ev("()=>_TR.hp")
    full=await rdrag(80,0,1600);h2=await ev("()=>JSON.stringify({hp:_TR.hp,re:_TR.re,wood:invN('wood')})")
    await pg.wait_for_timeout(900);h3=await ev("()=>JSON.stringify({hp:_TR.hp,fire:inp.fire,mf:RJ.mf})")
    R={'start':T0,'half':half,'afterHalf':h1,'full':full,'afterFull':json.loads(h2),'later':json.loads(h3)}
    hits=(T0['hp']-R['afterFull']['hp']) if R['afterFull']['re']<=0 else 99
    R['hits']=hits;R['ok']=not half['full'] and h1==T0['hp'] and full['full'] and full['vis'] and hits>=4 and not R['later']['fire'] and not R['later']['mf'] and (R['later']['hp']==R['afterFull']['hp'] or R['afterFull']['re']>0);res['axeHold']=R
    # 8. 낚싯대: 톡 = 던지기(조준 없음), 누르고 있으면 inp.fire
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));give('rod',1);S.quick[S.sel]='rod';const s=FSP.find(q=>q.lb==='해안23');let best=null,bd=1e9;for(let dx=-10;dx<=10;dx+=.5)for(let dz=-10;dz<=10;dz+=.5){const x=s.x+dx,z=s.z+dz,d=Math.hypot(dx,dz);if(d<bd&&waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null&&dz>0){bd=d;best=[x,z]}}
      P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);P.yv=undefined;updWaterState(0);endFish();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(500);return JSON.stringify({tgt:target&&target.lab,fishing:!!fishing})}""")
    F0=json.loads(r);m=await rdrag(50,0,200)
    r=await ev("()=>JSON.stringify({fishing:!!fishing,st:fishing&&fishing.st,fire:inp.fire})");F1=json.loads(r)
    await ev("()=>endFish()");await pg.wait_for_timeout(300);await rtap();r=await ev("()=>JSON.stringify({fishing:!!fishing,st:fishing&&fishing.st})");F2=json.loads(r)
    R={'start':F0,'drag':m,'afterDrag':F1,'tap':F2};R['ok']=not F0['fishing'] and m['md']=='rod' and m['fire'] and not m['aim'] and m['knob']=='' and F1['fishing'] and not F1['fire'] and F2['fishing'];res['rod']=R
    await ev("()=>{endFish();S.quick[S.sel]=null}")
    # 9. 설치 모드: 오른쪽 톡 = 앞의 미리보기 자리에 설치
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));give('kit_stash',1);setBuild('stash');for(let k=0;k<60;k++){P.x=VIL.x+20+(k%8)*7;P.z=VIL.z+30+((k/8)|0)*7;P.rot=0;unstuck();await sl(60);if(ghostPos().ok)break}return JSON.stringify({ok:ghostPos().ok,n:structs.filter(s=>s.t==='stash'&&s.own).length})}""")
    B0=json.loads(r);await rtap();r=await ev("()=>JSON.stringify({n:structs.filter(s=>s.t==='stash'&&s.own).length,bmode})");B1=json.loads(r)
    R={'before':B0,'after':B1};R['ok']=B0['ok'] and B1['n']==B0['n']+1;res['build']=R;await ev("()=>setBuild(null)")
    # 10. 두 손가락(조이스틱 아님) 확대는 그대로, 쏘지 않음
    await ev("()=>{P.x=VIL.x+18;P.z=VIL.z+14;unstuck();S.quick[S.sel]='pistol';ZOOM.t=1;zoomK=1}");await pg.wait_for_timeout(300);a0=await ev("()=>invN('ammoS')")
    await T('touchStart',[(2,380,200),(3,500,200)])
    for k in range(1,9): await T('touchMove',[(2,380-k*12,200),(3,500+k*12,200)]);await pg.wait_for_timeout(25)
    await pg.wait_for_timeout(400);r=await ev(f"()=>JSON.stringify({{shot:{a0}-invN('ammoS'),z:+zoomK.toFixed(2)}})")
    await T('touchEnd',[(2,284,200)]);await T('touchEnd',[(3,596,200)]);await pg.wait_for_timeout(200);await ev("()=>{ZOOM.t=1}")
    R=json.loads(r);R['ok']=R['shot']==0 and R['z']<.95;res['pinch']=R
    # 11. 구역: 모서리 표시만(얇고 반투명, 선 없음)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));S.quick[S.sel]=null;let t=null;for(let k=0;k<80&&!t;k++){const x=VIL.x+30+(k%10)*16,z=VIL.z+50+((k/10)|0)*16;const s=addStruct({t:'ptent',x,z,r:0,own:1});if(s){t=s}}
      const g=t.zg,bb=new THREE.Box3().setFromObject(g.children[0]),sz=new THREE.Vector3();bb.getSize(sz);const m=g.children[0].material;window._Z=t;
      P.x=t.x+1;P.z=t.z+11;P.rot=Math.PI;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(800);
      return JSON.stringify({n:g.children.length,h:+sz.y.toFixed(3),len:+Math.max(sz.x,sz.z).toFixed(2),op:m.opacity,transparent:m.transparent,edges:typeof ZMK.edges,zg:typeof zoneEdgeGroup})}""")
    await pg.screenshot(path=O('p41_zone.jpg'),type='jpeg',quality=88)
    R=json.loads(r);R['ok']=R['n']==4 and R['h']<.05 and R['len']<1 and R['op']<=.7 and R['transparent'] and R['edges']=='undefined' and R['zg']=='undefined';res['zoneCorners']=R
    await ev("()=>{removeStruct(_Z)}")
    # 12. 세로 화면 + 가방 열면 오른쪽 조이스틱이 가방 위로, 가로는 가방 옆으로(가려지지 않음)
    out={}
    for nm,(w,h) in [('land',(844,390)),('port',(390,844))]:
        await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(700);await ev("()=>openPanel('bag')");await pg.wait_for_timeout(500)
        r=await rect('#rjoy');pn=await rect('#panel')
        ov=not (r[4]+r[2]<=pn[4]+1 or r[5]+r[3]<=pn[5]+1 or r[4]>=pn[4]+pn[2]-1 or r[5]>=pn[5]+pn[3]-1)
        await pg.screenshot(path=O(f'p41_bag_{nm}.jpg'),type='jpeg',quality=85)
        await ev("()=>closePanel()");await pg.wait_for_timeout(400);r2=await rect('#rjoy')
        out[nm]={'overlap':ov,'inScreen':r[4]>=0 and r[5]>=0,'back':abs(r2[4]+r2[2]-(w-(22 if nm=='port' else 34)*(r2[2]/150)))<3}
    R=out;R['ok']=all(not v['overlap'] and v['inScreen'] and v['back'] for v in out.values());res['bagDodge']=R
    await pg.set_viewport_size({'width':844,'height':390})
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
