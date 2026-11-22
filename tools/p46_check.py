# 46차 검사: 시작 낚싯대·100원 · 등대 2곳 없앰·가운데 바위섬 동굴(텐트처럼 이동) · 달섬 약탈자 무리 3(옛 스폰·습격 없음)
#            · 나무·바위 더 단단하게(손도끼 7·8번, 바위 9번, 전기톱 더 빨리) · 뭉친 나무 없음 · 낚싯대 3단계 입질(8~15 / 6~12 / 4~8초)
# 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;DEV.god=true}")
    await pg.wait_for_timeout(600)
    # 1. 시작 소지품
    r=json.loads(await ev("()=>{const f=freshState(1);return JSON.stringify({coins:f.coins,rod:f.inv.rod,now:[S.coins,S.inv.rod]})}"))
    r['ok']=r['coins']==100 and r['rod']==1 and r['now']==[100,1];res['start']=r;print('start',json.dumps(r,ensure_ascii=False)[:500])
    # 2. 등대 6곳 · 동굴 · 설치 금지 이름 · 빠른 이동 목록
    r=json.loads(await ev("""()=>{const lh=structs.filter(s=>s.t==='lighthouse').map(s=>s.li).sort();S.lh=[1,1,1,1,1,1,1,1];openPanel('lh');const rows=document.querySelectorAll('#pbody [data-a=lhgo]').length;closePanel();
      const L=LHS[LH_CAVE],c=CAVE.s;const nk=LHS.map(q=>{const n=NOB.find(n=>Math.abs(n.x-q.x)<.01&&Math.abs(n.z-q.z)<.01);return n&&n.k});
      return JSON.stringify({lh,rows,cave:c&&[c.x,c.z],at:[L.x,L.z],nk,gone:LH_GONE,isle0:hAt(LHS[0].x,LHS[0].z)>0,isle4:hAt(L.x,L.z)>0})}"""))
    r['ok']=r['lh']==[1,2,3,5,6,7] and r['rows']==6 and r['cave']==r['at'] and r['nk'][0]=='isle' and r['nk'][4]=='cave' and r['nk'].count('lh')==6 and r['isle0'] and r['isle4'];res['lighthouses']=r;print('lighthouses',json.dumps(r,ensure_ascii=False)[:500])
    # 3. 동굴: 앞에 서서 [동굴 들어가기] → 동굴 방(내 기지 그대로·설치 안 됨·에너지는 밖과 같은 속도) → [나가기] → 입구 앞
    await ev("()=>{const c=CAVE.s,d=sdef(c);P.x=c.x;P.z=c.z+d.bz+.7;P.rot=Math.PI;P.yv=undefined;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(700)
    await pg.screenshot(path=O('p46_cave_out.jpg'),type='jpeg',quality=85)
    lab=await ev("()=>{target=findTarget();return target&&target.lab}")
    home0=await ev("()=>JSON.stringify(S.home)")
    await ev("()=>{target=findTarget();inp.actEdge=true;interact();inp.actEdge=false}")
    for i in range(40):
        if await ev("()=>INT.on&&!busy"): break
        await pg.wait_for_timeout(200)
    await pg.wait_for_timeout(800)
    await pg.screenshot(path=O('p46_cave_in.jpg'),type='jpeg',quality=85)
    r=json.loads(await ev("""()=>{const o={on:INT.on,kind:INT.kind,home:JSON.stringify(S.home)};give('kit_bench',1);setBuild('bench');const g=ghostPos();o.build=[g.ok,g.why];setBuild(null);
      o.vis=INT.gr.cave&&INT.gr.cave.visible;o.tent=INT.gr.tent.visible;S.hp=50;P.lastHurt=9;const h0=S.hp;updStats(1);o.regen=+(S.hp-h0).toFixed(2);P.z=INT.it[0].z-.85;P.x=INT.it[0].x;target=findTarget();o.exitLab=target&&target.lab;return JSON.stringify(o)}"""))
    r['lab']=lab;r['home0']=home0
    start_z, camera_z = await ev("()=>[P.z,cam.position.z]")
    await pg.keyboard.down('ArrowUp')
    try:
        await pg.wait_for_function("z=>P.z<z-5", arg=start_z)
    finally:
        await pg.keyboard.up('ArrowUp')
    assert await ev(f"()=>cam.position.z<{camera_z}-4")
    await pg.keyboard.down('ArrowDown')
    try:
        await pg.get_by_role('button', name='지상으로').wait_for(state='visible')
    finally:
        await pg.keyboard.up('ArrowDown')
    await pg.get_by_role('button', name='지상으로').click()
    for i in range(40):
        if await ev("()=>!INT.on&&!busy"): break
        await pg.wait_for_timeout(200)
    r['back']=json.loads(await ev("()=>{const c=CAVE.s;return JSON.stringify({on:INT.on,d:+dist(P.x,P.z,c.x,c.z+sdef(c).bz+1.1).toFixed(2)})}"))
    r['ok']=r['lab']=='동굴 들어가기' and r['on'] and r['kind']=='cave' and r['home']==home0 and r['build'][0] is False and '동굴' in r['build'][1] and r['vis'] and not r['tent'] and abs(r['regen']-.25)<.01 and r['exitLab']=='나가기' and r['back']['on'] is False and r['back']['d']<.5
    res['cave']=r;print('cave',json.dumps(r,ensure_ascii=False)[:500])
    # 4. 약탈자 무리: 구역 3개(겹치지 않고 경계를 비움, 본섬 땅만, 항구·마을 둘레 없음) · 무리 3개 5~10명 · 옛 스폰·습격 없음
    r=json.loads(await ev("""()=>{const o={};o.zones=HZ.Z.map(z=>z.cells.length);let bad=0,gapBad=0;for(const Z of HZ.Z)for(const c of Z.cells){if(islAt(c.x,c.z)!==ISL[0]||hAt(c.x,c.z)<1||PORT_SAFE.some(q=>dist(c.x,c.z,q[0],q[1])<q[2]+HZ.safe)||dist(c.x,c.z,VIL.px,VIL.pz)<70)bad++;if(hzZone(c.x,c.z)!==Z.k||HZ.cut.some(t=>Math.abs(HZ.tOf(c.x,c.z)-t)<HZ.gap))gapBad++}
      let md=1e9;for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)for(const p of HZ.Z[a].cells)for(const q of HZ.Z[b].cells)md=Math.min(md,dist(p.x,p.z,q.x,q.z));
      o.bad=bad;o.gapBad=gapBad;o.minGap=Math.round(md);o.groups=HZ.G.map(g=>({n:g.n,comp:g.comp.join(','),zone:hzZone(g.a.x,g.a.z)}));return JSON.stringify(o)}"""))
    r['ok']=all(n>200 for n in r['zones']) and r['bad']==0 and r['gapBad']==0 and r['minGap']>=24 and len(r['groups'])==3 and all(5<=g['n']<=10 and g['zone']==i for i,g in enumerate(r['groups']));res['zones']=r;print('zones',json.dumps(r,ensure_ascii=False)[:500])
    r=json.loads(await ev("""()=>{P.x=VIL.x;P.z=VIL.z;S.time=.85;S.raidDone=0;raid.on=false;const n0=enemies.length;for(let i=0;i<40;i++){updRaid(.5);updSpawns(.5)}
      const o={raid:raid.on,nonGrp:enemies.filter(e=>!e.grp).length,en:enemies.length,n0};S.time=.42;return JSON.stringify(o)}"""))
    r['ok']=r['raid'] is False and r['nonGrp']==0;res['oldOff']=r;print('oldOff',json.dumps(r,ensure_ascii=False)[:500])
    # 4-1. 멀리서도 앵커가 돌아다니고 자기 구역을 안 벗어남(오래 흉내: 30분), 무리끼리 가까워진 최소 거리
    r=json.loads(await ev("""()=>{P.x=VIL.x;P.z=VIL.z;const st=HZ.G.map(g=>[g.a.x,g.a.z]);let out=0,md=1e9,moved=HZ.G.map(()=>0),last=HZ.G.map(g=>[g.a.x,g.a.z]);
      for(let i=0;i<3600;i++){for(const g of HZ.G){hzTick(g,.5);if(g.on)hzOff(g)}HZ.G.forEach((g,k)=>{if(hzZone(g.a.x,g.a.z)!==k)out++;moved[k]+=dist(g.a.x,g.a.z,last[k][0],last[k][1]);last[k]=[g.a.x,g.a.z]});
       for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)md=Math.min(md,dist(HZ.G[a].a.x,HZ.G[a].a.z,HZ.G[b].a.x,HZ.G[b].a.z))}
      let water=0;for(const g of HZ.G)if(hAt(g.a.x,g.a.z)<.98)water++;
      return JSON.stringify({out,minD:Math.round(md),moved:moved.map(Math.round),water})}"""))
    r['ok']=r['out']==0 and r['minD']>=40 and all(m>300 for m in r['moved']) and r['water']==0;res['roam']=r;print('roam',json.dumps(r,ensure_ascii=False)[:500])
    # 4-2. 가까이 가면 멤버가 생기고 앵커를 따라 걸어요
    r=json.loads(await ev("""()=>{const g=HZ.G[0];for(const q of HZ.G)if(q.on)hzOff(q);let c=null;for(const q of HZ.Z[0].cells){if(dist(q.x,q.z,g.a.x,g.a.z)>40&&dist(q.x,q.z,g.a.x,g.a.z)<70&&hzFree(q.x,q.z)){c=q;break}}
      P.x=c.x;P.z=c.z;unstuck();g.w=null;g.rest=0;hzTick(g,.1);const live=g.mem.filter(e=>e&&!e.dead);return JSON.stringify({on:g.on,n:live.length,alive:g.alive,grp:live.every(e=>e.grp===g)})}"""))
    async def run_frames(sec):
        for i in range(int(sec*4)):
            await ev("()=>{for(let k=0;k<5;k++){for(const e of enemies.slice())updEnemy(e,.05);updSpawns(.05)}}")
    a0=json.loads(await ev("()=>JSON.stringify(HZ.G[0].a)"))
    await run_frames(20)
    r2=json.loads(await ev("""()=>{const g=HZ.G[0],L=g.mem.filter(e=>e&&!e.dead);const d=L.map(e=>{const s=g.slots[e.gi];return dist(e.x,e.z,g.a.x+s[0],g.a.z+s[1])});return JSON.stringify({a:g.a,maxSlot:+Math.max(...d).toFixed(1),avgSlot:+(d.reduce((p,q)=>p+q,0)/d.length).toFixed(1),agg:L.filter(e=>e.agg).length,anims:[...new Set(L.map(e=>e.a.cur))]})}"""))
    r.update(r2);r['moved']=round(((r2['a']['x']-a0['x'])**2+(r2['a']['z']-a0['z'])**2)**.5,1)
    await ev("()=>{const g=HZ.G[0];updCamera(0,g.a.x,groundY(g.a.x,g.a.z),g.a.z,true)}")
    await pg.wait_for_timeout(500);await pg.screenshot(path=O('p46_horde.jpg'),type='jpeg',quality=85)
    r['ok']=r['on'] and r['n']==r['alive'] and r['grp'] and r['moved']>5 and r['avgSlot']<4.5 and r['agg']==0;res['follow']=r;print('follow',json.dumps(r,ensure_ascii=False)[:500])
    # 4-3. 한 명이 보면 다 같이 · 안전 구역 안이면 안 쫓음 · 다 쓰러뜨리면 다시 생김
    r=json.loads(await ev("""()=>{const g=HZ.G[0],L=g.mem.filter(e=>e&&!e.dead),e0=L[0];DEV.on=false;P.dead=false;P.x=e0.x+6;P.z=e0.z;for(let k=0;k<3;k++){for(const e of enemies.slice())updEnemy(e,.05);updSpawns(.05)}
      const o={agg:L.filter(e=>e.agg).length,n:L.length,near:L.filter(e=>dist(e.x,e.z,P.x,P.z)<32).length};
      const q=PORT_SAFE[1];P.x=q[0];P.z=q[1];for(const e of L){e.agg=1;e.x=P.x+3;e.z=P.z+2}for(let k=0;k<3;k++){for(const e of enemies.slice())updEnemy(e,.05);updSpawns(.05)}o.safeAgg=L.filter(e=>e.agg).length;
      for(const e of L){e.x=e.ax;e.z=e.az}P.x=g.a.x+60;P.z=g.a.z;return JSON.stringify(o)}"""))
    r2=json.loads(await ev("""()=>{const g=HZ.G[0],L=g.mem.filter(e=>e&&!e.dead),z0=[g.a.x,g.a.z];for(const e of L){e.hp=0;killEnemy(e)}const o={alive:g.alive,re:+g.re.toFixed(1)};
      P.x=VIL.x;P.z=VIL.z;g.re=.1;hzTick(g,.2);o.n=g.n;o.alive2=g.alive;o.zone=hzZone(g.a.x,g.a.z);o.farFromPlayer=Math.round(dist(g.a.x,g.a.z,P.x,P.z));return JSON.stringify(o)}"""))
    r.update(r2);r['ok']=r['agg']>=min(r['near'],r['n']) and r['agg']>=2 and r['safeAgg']==0 and r['alive']==0 and 45<=r['re']<=90 and 5<=r['n']<=10 and r['alive2']==r['n'] and r['zone']==0 and r['farFromPlayer']>=70;res['fight']=r;print('fight',json.dumps(r,ensure_ascii=False)[:500])
    await ev("()=>{for(const g of HZ.G)if(g.on)hzOff(g);P.x=VIL.x;P.z=VIL.z;unstuck();DEV.god=true}")
    # 5. 나무·바위: 손도끼 7·8번, 바위 9번(맨손), 전기톱 4번·0.3초 / 뭉친 나무 없음 / 한 그루만 사라짐
    r=json.loads(await ev("""()=>{const o={cl:[...objs.values()].filter(q=>q.t===2).length,split:genObjects.split};
      const find=t=>{let best=null,bd=1e9;objs.forEach((q,k)=>{if(q.t===t&&q.re<=0){const d=dist(q.x,q.z,VIL.x+80,VIL.z);if(d<bd){bd=d;best=[q,k]}}});return best};
      const hits=(t,id)=>{const [q,k]=find(t);give(id==='fist'?'bandage':id,1);S.quick[S.sel]=id==='fist'?null:id;P.x=q.x;P.z=q.z+1.2;const before=[];objs.forEach((p,kk)=>{if(kk!==k&&p.re<=0&&dist(p.x,p.z,q.x,q.z)<6)before.push(kk)});
        let n=0,cd=0;target={k:'o',o:q,key:k,x:q.x,z:q.z};while(q.re<=0&&n<30){P.cd=0;interact();cd=P.cd;n++}const lost=before.filter(kk=>objs.get(kk).re>0).length;q.re=0;q.hp=OBJT[q.t].hp;refreshObj(q);return {n,cd:+cd.toFixed(2),lost}};
      o.axeA=hits(0,'axe');o.axeB=hits(1,'axe');o.sawA=hits(0,'chainsaw');o.sawB=hits(1,'chainsaw');o.rockHand=hits(3,'fist');o.rockSaw=hits(3,'chainsaw');S.quick[S.sel]=null;return JSON.stringify(o)}"""))
    r['ok']=r['cl']==0 and r['split']['clusters']>0 and r['axeA']['n']==7 and r['axeB']['n']==8 and r['axeA']['cd']==.42 and r['sawA']['n']==4 and r['sawB']['n']==4 and r['sawA']['cd']==.3 and r['rockHand']['n']==9 and r['rockSaw']['n']==5 and all(r[k]['lost']==0 for k in ['axeA','axeB','sawA','sawB','rockHand','rockSaw'])
    res['chop']=r;print('chop',json.dumps(r,ensure_ascii=False)[:500])
    # 6. 낚싯대 3단계: 입질 시간 범위, 중급·고급으로 실제로 던져짐, 손에 든 줄 끝
    r=json.loads(await ev("""()=>{const o={};for(const id of['rod','rod2','rod3']){give(id,1);S.quick[S.sel]=id;P.a.weapon(id);let lo=99,hi=0;for(let i=0;i<400;i++){const w=rodBite();lo=Math.min(lo,w);hi=Math.max(hi,w)}o[id]={lo:+lo.toFixed(2),hi:+hi.toFixed(2),tip:!!P.a.tip,isRod:isRod(id)}}
      const stand=(x,z)=>waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null;const s=FSP.find(q=>q.zone==='B');let best=null,bd=1e9;for(let dx=-12;dx<=12;dx+=.5)for(let dz=-12;dz<=12;dz+=.5){const d=Math.hypot(dx,dz);if(d<bd&&stand(s.x+dx,s.z+dz)){bd=d;best=[s.x+dx,s.z+dz]}}
      P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);P.moving=false;updWaterState(0);o.cast={};
      for(const id of['rod','rod2','rod3']){S.quick[S.sel]=id;P.a.weapon(id);endFish();tryCast();o.cast[id]=!!fishing;if(fishing){fishing.t=fishing.T+1;updFishing(.05,false);o.cast[id]=[fishing.st,+fishing.W.toFixed(1)]}endFish()}
      S.quick[S.sel]=null;P.a.weapon(null);return JSON.stringify(o)}"""))
    W={'rod':(8,15),'rod2':(6,12),'rod3':(4,8)}
    r['ok']=all(r[k]['lo']>=W[k][0] and r[k]['hi']<=W[k][1] and r[k]['hi']-r[k]['lo']>W[k][1]-W[k][0]-1 and r[k]['tip'] and r[k]['isRod'] for k in W) and all(isinstance(r['cast'][k],list) and r['cast'][k][0]=='wait' and W[k][0]<=r['cast'][k][1]<=W[k][1] for k in W)
    res['rods']=r;print('rods',json.dumps(r,ensure_ascii=False)[:500])
    print('ALL',all(v['ok'] for v in res.values()))
