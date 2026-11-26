# 34차 검사: 가방 버튼 자리 · 조이스틱 말고 눌러도 안 걸어감 · 상호작용은 바짝 붙어야
# 진짜 터치(CDP)와 pg.touchscreen.tap. 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.quick[S.sel]=null}")
    await pg.wait_for_timeout(400)
    res={}
    # 화면 좌표 구하기 + 그 자리 톡 + 1.2초 뒤 움직였나
    PROJ="(x,y,z)=>{_v.set(x,y,z).project(cam);return [(_v.x*.5+.5)*innerWidth,(-_v.y*.5+.5)*innerHeight]}"
    async def put(js):
        await ev("()=>{"+js+";P.yv=undefined;P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(450)
    async def tapAt(wx,wy,wz,wait=1200):
        xy=await ev(f"()=>{{const f={PROJ};return f({wx},{wy},{wz})}}")
        p0=await ev("()=>[P.x,P.z]")
        await pg.touchscreen.tap(xy[0],xy[1]);await pg.wait_for_timeout(wait)
        r=await ev(f"()=>({{moved:+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(3),auto:!!P.auto,panel:panel,hint:floats.some(f=>f.s==='더 가까이 가요'&&f.t<3)}})")
        r['xy']=[round(xy[0]),round(xy[1])];return r
        # 41차: 오른쪽 조이스틱 가운데 톡 = 상호작용(화면의 다른 곳은 아무 일 없음)
    async def rtap():
        c=await ev("()=>{const r=document.getElementById('rjoy').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");await pg.touchscreen.tap(c[0],c[1])
    # 1. 가방 버튼: 41차부터 오른쪽 조이스틱 바로 위(가로·세로), 조이스틱·지도와 안 겹침
    async def bagPos():
        return await ev("""()=>{const R=i=>document.getElementById(i).getBoundingClientRect(),b=R('bBag'),j=R('joy'),m=R('mmw'),q=R('rjoy');const ov=(a,c)=>!(a.right<=c.left||c.right<=a.left||a.bottom<=c.top||c.bottom<=a.top);
          return {r:Math.round(innerWidth-b.right),b:Math.round(innerHeight-b.bottom),w:Math.round(b.width),ovJ:ov(b,j)||ov(b,q),ovM:ov(b,m),above:b.bottom<=q.top,cx:Math.round(Math.abs((b.left+b.right)/2-(q.left+q.right)/2)),qb:Math.round(innerHeight-q.bottom),jb:Math.round(innerHeight-j.bottom)}}""")
    L=await bagPos();await pg.screenshot(path=O('p34_hud.jpg'),type='jpeg',quality=85)
    await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(1200)
    Pt=await bagPos();await pg.screenshot(path=O('p34_port.jpg'),type='jpeg',quality=85)
    await pg.set_viewport_size({'width':880,'height':400});await pg.wait_for_timeout(1200)
    res['bagBtn']={'land':L,'port':Pt,'ok':all(q['above'] and q['cx']<=3 and not q['ovJ'] and not q['ovM'] and abs(q['qb']-q['jb'])<=3 for q in (L,Pt))}
    # 2. 자판기: 멀면 글자 없음, 바짝 붙으면 '자판기'
    await put("const v=structs.find(s=>s.t==='vend'&&dist(s.x,s.z,VIL.x,VIL.z)<60);window._v0=v;P.x=v.x;P.z=v.z+sdef(v).bz+1.6;P.rot=Math.PI")
    far=await ev("()=>({lab:target&&target.lab,gap:+sGap(P.x,P.z,_v0).toFixed(2)})")
    await put("P.x=_v0.x;P.z=_v0.z+sdef(_v0).bz+.75;P.rot=Math.PI")
    near=await ev("()=>({lab:target&&target.lab,gap:+sGap(P.x,P.z,_v0).toFixed(2)})")
    await rtap();await pg.wait_for_timeout(500);pn=await ev("()=>{const p=panel;closePanel();return p}")
    res['vendReach']={'far':far,'near':near,'panel':pn,'ok':far['lab'] is None and near['lab']=='자판기' and pn=='vend'}
    # 3. 멀리 있는 자판기를 눌러도 따라가지 않음(41차: 화면을 누르면 아무 일도 없어요 — 안내도 없음)
    await put("P.x=_v0.x+1;P.z=_v0.z+5;P.rot=Math.PI")
    r=await ev("()=>[_v0.x,groundY(_v0.x,_v0.z)+.9,_v0.z]");R=await tapAt(*r)
    R['ok']=R['moved']<.05 and not R['auto'] and R['panel'] is None and not R['hint'];res['farVend']=R
    # 4. 아무것도 없는 땅을 눌러도(맨손·손도끼) 안 걸어감
    await put("P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.rot=0")
    R1=await tapAt(*(await ev("()=>[P.x+4,groundY(P.x+4,P.z-5),P.z-5]")))
    await ev("()=>{give('axe',1);S.quick[S.sel]='axe'}")
    R2=await tapAt(*(await ev("()=>[P.x-3,groundY(P.x-3,P.z+3),P.z+3]")))
    await ev("()=>{S.quick[S.sel]=null}")
    res['groundTap']={'fist':R1,'axe':R2,'ok':R1['moved']<.05 and R2['moved']<.05 and not R1['auto'] and not R2['auto']}
    # 5. 멀리 있는 나무: 안 걸어감 / 바짝 붙으면 '베기'(손도끼)
    t=await ev("""()=>{let b=null,bd=1e9;for(const o of objs.values()){if(o.re>0||!isTree(OBJT[o.t]))continue;const d=dist(o.x,o.z,VIL.x+30,VIL.z+30);if(d<bd){let ok=true;for(let a=0;a<8;a++){const x=o.x+Math.sin(a)*1.0,z=o.z+4;}if(walk(o.x,o.z+4,.42,P)===null&&walk(o.x,o.z+OBJT[o.t].r+.75,.42,P)===null){bd=d;b=o}}}window._t0=b;return b?[b.x,b.z,OBJT[b.t].r]:null}""")
    if t:
        await put("P.x=_t0.x;P.z=_t0.z+4;P.rot=Math.PI;give('axe',1);S.quick[S.sel]='axe'")
        Rf=await tapAt(t[0],await ev("()=>groundY(_t0.x,_t0.z)+.5"),t[1])
        await put("P.x=_t0.x;P.z=_t0.z+OBJT[_t0.t].r+.75;P.rot=Math.PI")
        nl=await ev("()=>target&&target.lab")
        await put("P.x=_t0.x;P.z=_t0.z+OBJT[_t0.t].r+1.6;P.rot=Math.PI")
        fl=await ev("()=>target&&target.lab")
        await ev("()=>{S.quick[S.sel]=null}")
        res['tree']={'farTap':Rf,'near':nl,'far':fl,'ok':Rf['moved']<.05 and not Rf['auto'] and nl=='베기' and fl is None}
    else: res['tree']={'ok':False,'why':'no tree'}
    # 6. 식물: 멀리서 누르면 안 걸어가고 안 따짐 / 바짝 붙어서 아무 데나 누르면 따짐
    p=await ev("""()=>{const p=PL.list.find(q=>!plGone(q)&&!PLD[q.id].cr&&walk(q.x,q.z+4,.42,P)===null&&walk(q.x,q.z+.9,.42,P)===null&&dist(q.x,q.z,VIL.x,VIL.z)>40);window._p0=p;return p?[p.x,p.z,p.id]:null}""")
    if p:
        await put("P.x=_p0.x;P.z=_p0.z+4;P.rot=Math.PI")
        n0=await ev(f"()=>invN(PLD['{p[2]}'].id)")
        Rf=await tapAt(p[0],await ev("()=>groundY(_p0.x,_p0.z)+.2"),p[1])
        g1=await ev("()=>plGone(_p0)")
        await put("P.x=_p0.x;P.z=_p0.z+.9;P.rot=Math.PI")
        lab=await ev("()=>target&&target.lab")
        await rtap();await pg.wait_for_timeout(600)
        g2=await ev("()=>plGone(_p0)")
        res['plant']={'farTap':Rf,'goneFar':g1,'nearLab':lab,'picked':g2,'ok':Rf['moved']<.05 and not g1 and bool(lab) and g2}
    else: res['plant']={'ok':False,'why':'no plant'}
    # 7. 낚싯대: 사거리 밖 물고기 떼를 눌러도 안 걸어감
    f=await ev("""()=>{give('rod',1);S.quick[S.sel]='rod';for(const s of FSP){for(let a=0;a<24;a++){const an=a/24*Math.PI*2,d=ROD_R+4,x=s.x+Math.sin(an)*d,z=s.z+Math.cos(an)*d;if(hAt(x,z)>.95&&walk(x,z,.42,P)===null&&!onDock(x,z)&&z>s.z){window._f0=s;return [s.x,s.z,x,z]}}}return null}""")
    if f:
        await put(f"P.x={f[2]};P.z={f[3]};P.rot=Math.atan2(_f0.x-P.x,_f0.z-P.z)")
        R=await tapAt(f[0],0,f[1]);fs=await ev("()=>!!fishing")
        R['fishing']=fs;R['ok']=R['moved']<.05 and not R['auto'];res['rodFar']=R
        await ev("()=>{if(fishing)endFish();S.quick[S.sel]=null}")
    else: res['rodFar']={'ok':False,'why':'no spot'}
    # 8. 배: 8곳 모두 부두에서 가장 가까운 자리에 서면 [배 타기](낚싯대·맨손), 거기서 1.2m 물러나면 없음
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
      for(const s of structs.filter(q=>q.t==='ferry')){let mg=9,mx=0,mz=0;for(let x=s.x-6;x<=s.x+6;x+=.12)for(let z=s.z-6;z<=s.z+6;z+=.12){const dk=onDock(x,z);if(!dk&&waterDepth(x,z)>DEEP-.05)continue;if(walk(x,z,.42,P)!==null)continue;const g=sGap(x,z,s);if(g<mg){mg=g;mx=x;mz=z}}
       const q={pi:s.pi,gap:+mg.toFixed(2)};for(const it of [null,'rod']){S.quick[S.sel]=it;P.x=mx;P.z=mz;P.rot=Math.atan2(s.x-mx,s.z-mz);P.yv=undefined;await sl(120);q[it||'hand']=target&&target.lab}
       const ax=mx+(mx-s.x)/Math.hypot(mx-s.x,mz-s.z)*1.2,az=mz+(mz-s.z)/Math.hypot(mx-s.x,mz-s.z)*1.2;S.quick[S.sel]=null;P.x=ax;P.z=az;await sl(120);q.back=(target&&target.s===s)?target.lab:null;out.push(q)}S.quick[S.sel]=null;return JSON.stringify(out)}""")
    R=json.loads(r);res['ferry']={'list':R,'ok':len(R)==8 and all(q['hand']=='배 타기' and q['rod']=='배 타기' and q['back'] is None for q in R)}
    # 9. 이름표가 뜨는 모든 것(가게·자판기·쓰레기통·보급 상자·등대·낚시섬 문·판매대·특수 보급·모닥불·보관 상자): 닿을 만큼 가면 그 대상이 잡혀요
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const T=['market','vend','recycle','lighthouse','supply','spsupply','cgate','sh84_door','fire','stash','chest'];const bad=[],cnt={};
      for(const s of structs){if(!T.includes(s.t)||!sLabel(s))continue;const d=sdef(s),Rr=Math.max(d.bx,d.bz)+3;let mg=9,mx=0,mz=0;for(let x=s.x-Rr;x<=s.x+Rr;x+=.15)for(let z=s.z-Rr;z<=s.z+Rr;z+=.15){const dk=onDock(x,z);if(!dk&&waterDepth(x,z)>DEEP-.05)continue;if(walk(x,z,.42,P)!==null)continue;const g=sGap(x,z,s);if(g<mg){mg=g;mx=x;mz=z}}
       P.x=mx;P.z=mz;P.rot=Math.atan2(s.x-mx,s.z-mz);const t=findTarget();cnt[s.t]=(cnt[s.t]||0)+1;if(!t||t.s!==s)bad.push([s.t,+mg.toFixed(2),t&&t.lab])}return JSON.stringify({cnt,bad})}""")
    R=json.loads(r);R['ok']=not R['bad'];res['allReach']=R
    # 10. 조이스틱은 그대로 걸어요
    await put("P.x=VIL.x+18;P.z=VIL.z+14;unstuck()")
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    j0=await ev("()=>{const r=document.getElementById('joy').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");p0=await ev("()=>[P.x,P.z]")
    await T('touchStart',[(1,j0[0],j0[1])]);await T('touchMove',[(1,j0[0],j0[1]-40)]);await pg.wait_for_timeout(700)
    mv=await ev(f"()=>+Math.hypot(P.x-{p0[0]},P.z-{p0[1]}).toFixed(2)");await T('touchEnd',[(1,j0[0],j0[1]-40)]);await pg.wait_for_timeout(200)
    res['joy']={'moved':mv,'ok':mv>.5}
    # 11. 코드에 P.auto를 만드는 곳이 없음(걸어가기 없음)
    na=await ev("()=>{const src=[worldTap,findTarget,actApply].map(String).join('');return /P\\.auto\\s*=\\s*[^n]/.test(src)}")
    res['noAuto']={'found':na,'ok':not na}
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
