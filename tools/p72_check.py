# 72차(디자인) 검사: 등대 둘레 설치 금지 원 30m · 길 끝 자연스럽게 사라짐 · 항구 지형지물 자동 배치 없음 · 배치 도구 이동(바로 끌기·화살표)·삭제(두 번 누르기)
# python3 tools/gt.py tools/p72_check.py   → 마지막 줄 ALL True
# 사진: tools/out/p72_road_end.jpg(북쪽 항구 길 끝), p72_lh_nob.jpg(등대 원, 설치 모드)
import json,os
async def steps(pg):
    ev=pg.evaluate;res={}
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    # 1. 등대 원: 등대 6곳 모두 가운데 = 등대, 반지름 30 이상, 25m 떨어진 땅·물에 설치하면 막힘, 35m는 등대 원 아님
    r=await ev("""()=>{const L=structs.filter(s=>s.t==='lighthouse'),o={n:L.length,c:[]};
      for(const s of L){const n=NOB.find(q=>q.k==='lh'&&Math.hypot(q.x-s.x,q.z-s.z)<.5);o.c.push(n?+n.r.toFixed(1):null)}
      const s=L[0];o.at25=nobAt(s.x+25,s.z,1)?.k||null;o.at35=nobAt(s.x+35,s.z,1)?.k||null;o.cave=NOB.filter(q=>q.k==='cave').map(q=>+q.r.toFixed(1));return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R['n']==5 and all(c and c>=30 for c in R['c']) and R['at25']=='lh' and R['at35']!='lh';res['lighthouse']=R
    # 2. 길 끝: 다른 길과 안 만나는 끝은 맨 끝 줄이 완전히 투명(알파 0)·폭이 좁음, 만나는 끝은 그대로
    r=await ev("""()=>{const g=roadMeshObj.geometry,C=g.attributes.color,Pp=g.attributes.position,W=13;let base=0;const out=[];
      const others=(ri,x,z)=>ROADS.some((r,q)=>q!==ri&&r.p.some(p=>(p[0]-x)**2+(p[1]-z)**2<16));
      ROADS.forEach((r,ri)=>{const n=r.p.length;for(const [end,row] of [[0,0],[1,n-1]]){const p=end?r.p[n-1]:r.p[0],j=others(ri,p[0],p[1]);let amax=0;for(let k=0;k<W;k++)amax=Math.max(amax,C.getW(base+row*W+k));
        const w=Math.hypot(Pp.getX(base+row*W)-Pp.getX(base+row*W+W-1),Pp.getZ(base+row*W)-Pp.getZ(base+row*W+W-1));out.push({id:r.id||ri,end,joined:j,amax:+amax.toFixed(2),w:+w.toFixed(2)})}base+=n*W});
      return JSON.stringify(out)}""")
    R=json.loads(r);free=[q for q in R if not q['joined']];jn=[q for q in R if q['joined']]
    res['roadEnds']={'free':len(free),'joined':len(jn),'freeBad':[q for q in free if q['amax']>.01],'joinedBad':[q for q in jn if q['amax']<.8],'ok':len(free)>0 and not [q for q in free if q['amax']>.01] and not [q for q in jn if q['amax']<.8]}
    # 3. 항구 지형지물 자동 배치 없음
    res['harbor']={'n':await ev("()=>structs.filter(s=>/^hb_(bluff|terrace|knoll|shore)/.test(s.t)).length")};res['harbor']['ok']=res['harbor']['n']==0
    # 4. 배치 도구: 누르자마자 끌기 = 옮겨짐, 화살표 = 한 칸, 삭제 = 두 번 누르기(confirm 창 없이), 전체 원위치도 두 번
    await ev("()=>{DEV.on=true;devHud&&devHud();const s=structs.find(q=>q.t==='recycle'&&q.pi===3);P.x=s.x-1;P.z=s.z+3.5;window.__s=s;window.confirm=()=>{window.__conf=1;return false}}")
    await pg.wait_for_timeout(3000)
    await ev("()=>{[...document.querySelectorAll('button')].find(b=>b.textContent==='구조물 배치').click()}");await pg.wait_for_timeout(700)
    pos=lambda: ev("()=>{const s=window.__s;return JSON.stringify([+s.x.toFixed(2),+s.z.toFixed(2),!!s.m.parent,structs.includes(s)])}")
    stat="()=>{const sp=[...document.querySelectorAll('.layout-controls *')].filter(e=>e.children.length===0&&/선택|이동|옮|저장|삭제했/.test(e.textContent));return sp.map(e=>e.textContent).slice(-2)}"
    await pg.wait_for_timeout(2500)
    AIM="()=>{const s=window.__s,m=s.m,r=new THREE.Raycaster();m.updateMatrixWorld(true);for(const [ox,oy] of [[0,.6],[.45,.6],[-.45,.6],[.45,1],[-.45,1],[.3,.3],[-.3,.3]]){const p=scr(m.position.x+ox,m.position.y+oy,m.position.z);r.setFromCamera({x:p[0]/innerWidth*2-1,y:1-p[1]/innerHeight*2},cam);const h=r.intersectObjects(structs.filter(q=>q.m&&q.m.parent).map(q=>q.m),true)[0];let o=h&&h.object;while(o&&o!==m)o=o.parent;if(o===m)return JSON.stringify(p)}return JSON.stringify(scr(m.position.x,m.position.y+.6,m.position.z))}"
    p0=json.loads(await pos())
    sc=json.loads(await ev("()=>{const s=window.__s,m=s.m,r=new THREE.Raycaster();m.updateMatrixWorld(true);for(const [ox,oy] of [[0,.6],[.45,.6],[-.45,.6],[.45,1],[-.45,1],[.3,.3],[-.3,.3]]){const p=scr(m.position.x+ox,m.position.y+oy,m.position.z);r.setFromCamera({x:p[0]/innerWidth*2-1,y:1-p[1]/innerHeight*2},cam);const h=r.intersectObjects(structs.filter(q=>q.m&&q.m.parent).map(q=>q.m),true)[0];let o=h&&h.object;while(o&&o!==m)o=o.parent;if(o===m)return JSON.stringify(p)}return JSON.stringify(scr(m.position.x,m.position.y+.6,m.position.z))}"));x,y=sc[0],sc[1]
    for _try in range(3):   # 헤드리스 화면이 느려 카메라가 아직 움직이는 중이면 한 번 더
        await pg.mouse.move(x,y);await pg.mouse.down()
        for k in range(1,9):await pg.mouse.move(x+9*k,y+2*k);await pg.wait_for_timeout(25)
        await pg.wait_for_timeout(150);await pg.mouse.up();await pg.wait_for_timeout(500)
        p1=json.loads(await pos())
        if abs(p1[0]-p0[0])>.8:break
        await pg.wait_for_timeout(1500);sc=json.loads(await ev(AIM));x,y=sc[0],sc[1]
    st1=await ev(stat);selAfter=await ev("()=>!document.querySelector('.layout-delete').disabled")
    # 다시 눌러 고르고 화살표 ▶ 두 번(간격 0.5m → 1m)
    sc=json.loads(await ev("()=>{const s=window.__s,m=s.m,r=new THREE.Raycaster();m.updateMatrixWorld(true);for(const [ox,oy] of [[0,.6],[.45,.6],[-.45,.6],[.45,1],[-.45,1],[.3,.3],[-.3,.3]]){const p=scr(m.position.x+ox,m.position.y+oy,m.position.z);r.setFromCamera({x:p[0]/innerWidth*2-1,y:1-p[1]/innerHeight*2},cam);const h=r.intersectObjects(structs.filter(q=>q.m&&q.m.parent).map(q=>q.m),true)[0];let o=h&&h.object;while(o&&o!==m)o=o.parent;if(o===m)return JSON.stringify(p)}return JSON.stringify(scr(m.position.x,m.position.y+.6,m.position.z))}"));x,y=sc[0],sc[1]
    await pg.wait_for_timeout(800)
    sc=json.loads(await ev("()=>{const s=window.__s,m=s.m,r=new THREE.Raycaster();m.updateMatrixWorld(true);for(const [ox,oy] of [[0,.6],[.45,.6],[-.45,.6],[.45,1],[-.45,1],[.3,.3],[-.3,.3]]){const p=scr(m.position.x+ox,m.position.y+oy,m.position.z);r.setFromCamera({x:p[0]/innerWidth*2-1,y:1-p[1]/innerHeight*2},cam);const h=r.intersectObjects(structs.filter(q=>q.m&&q.m.parent).map(q=>q.m),true)[0];let o=h&&h.object;while(o&&o!==m)o=o.parent;if(o===m)return JSON.stringify(p)}return JSON.stringify(scr(m.position.x,m.position.y+.6,m.position.z))}"));x,y=sc[0],sc[1]
    el=await ev(f"()=>{{const e=document.elementFromPoint({x},{y});return e.tagName+'#'+e.id}}")
    await pg.mouse.move(x,y);await pg.mouse.down();await pg.wait_for_timeout(60);await pg.mouse.up();await pg.wait_for_timeout(300)
    # 고른 채로 빈 땅 톡 = 그 자리로(3m 남쪽)
    g=json.loads(await ev("()=>{const s=window.__s;return JSON.stringify(scr(s.m.position.x,s.m.position.y,s.m.position.z+3))}"))
    await pg.mouse.move(g[0],g[1]);await pg.mouse.down();await pg.wait_for_timeout(60);await pg.mouse.up();await pg.wait_for_timeout(400)
    pg3=json.loads(await pos())
    await ev("()=>{const sel=[...document.querySelectorAll('.layout-controls select')].find(s=>[...s.options].some(o=>o.textContent==='0.5m'));if(sel){sel.value=[...sel.options].find(o=>o.textContent==='0.5m').value;sel.dispatchEvent(new Event('change'))}}")
    vis=await ev("()=>{const r=document.querySelector('.layout-nudge');return r&&!r.hidden}")
    xb=json.loads(await pos())[0]
    for _ in range(2):
        await ev("()=>{[...document.querySelectorAll('.layout-nudge button')].find(b=>b.textContent==='▶').click()}");await pg.wait_for_timeout(250)
    p2=json.loads(await pos());st2=await ev(stat)
    # 삭제: 한 번 = 안 지워짐(버튼 글자 바뀜), 두 번 = 지워짐, confirm 창 안 씀
    b=lambda: ev("()=>{const b=document.querySelector('.layout-delete');return [b.textContent,b.disabled]}")
    bd0=await b()
    await ev("()=>document.querySelector('.layout-delete').click()");await pg.wait_for_timeout(200)
    p3=json.loads(await pos());bd1=await b()
    await ev("()=>document.querySelector('.layout-delete').click()");await pg.wait_for_timeout(400)
    p4=json.loads(await pos());bd2=await b()
    conf=await ev("()=>!!window.__conf")
    res['layout']={'start':p0,'drag':p1,'el':el,'selAfterDrag':selAfter,'tapGround':pg3,'st1':st1,'nudgeVisible':vis,'nudge':[xb,p2[0]],'st2':st2,'delBtn':[bd0,bd1,bd2],'afterOne':p3[2:],'afterTwo':p4[2:],'confirmUsed':conf,
      'ok':abs(p1[0]-p0[0])>.8 and selAfter and abs(pg3[1]-p1[1]-3)<.6 and vis and abs(p2[0]-xb-1.0)<.06 and p3[2] and not p4[2] and not p4[3] and not conf and bd1[0].startswith('한 번 더')}
    await pg.screenshot(path=os.path.join(OUT,'p72_layout.jpg'),type='jpeg',quality=80)
    await ev("()=>{[...document.querySelectorAll('button')].find(b=>b.textContent==='배치 종료').click();DEV.on=false;devHud&&devHud()}")
    # 사진: 북쪽 항구 길 끝, 등대 원(설치 모드)
    await ev("""()=>{const _uc=updCamera;updCamera=function(){if(window.__cam){const t=window.__cam;cam.position.set(t[0],t[1],t[2]);cam.lookAt(t[3],t[4],t[5]);cam.updateProjectionMatrix();return}return _uc.apply(this,arguments)};S.time=.42}""")
    e=json.loads(await ev("""()=>{let best=null;ROADS.forEach((r,ri)=>{for(const p of [r.p[0],r.p[r.p.length-1]]){const d=Math.hypot(p[0]-PORTS[5].x,p[1]-PORTS[5].z);if(!best||d<best[2])best=[p[0],p[1],d]}});return JSON.stringify(best)}"""))
    await ev(f"()=>{{P.x={e[0]-3};P.z={e[1]+2};window.__cam=[{e[0]},26,{e[1]+20},{e[0]},0,{e[1]}]}}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p72_road_end.jpg'),type='jpeg',quality=80)
    l=json.loads(await ev("()=>{const s=structs.find(q=>q.t==='lighthouse');return JSON.stringify([s.x,s.z])}"))
    await ev(f"()=>{{DEV.on=true;P.x={l[0]+20};P.z={l[1]+20};S.inv.kit_baitbuoy=2;setBuild('baitbuoy');window.__cam=[{l[0]},70,{l[1]+60},{l[0]},0,{l[1]}]}}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p72_lh_nob.jpg'),type='jpeg',quality=80)
    res['errs']={'list':errs[:5],'ok':not errs}
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values()))
