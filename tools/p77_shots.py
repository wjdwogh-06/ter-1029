# 77차 사진: 보급 창고(밖·안), 특수 보급지 17·18, 새 보급지 14·15·16, 새 길, 지도. SHOTS=wh,sp,new,road,map (기본 전부)
import json, base64
async def steps(pg):
    ev = pg.evaluate
    sel = (os.environ.get('SHOTS') or 'wh,sp,new,road,map').split(',')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);if(typeof HZ!=='undefined')HZ.on=false}")
    info = await ev("()=>SPF.map(f=>({i:f.i,t:f.theme,th:+f.th.toFixed(2),hx:+f.hx.toFixed(1),hz:+f.hz.toFixed(1),cols:f.cols,cr:(SUPS.find(s=>s.i===f.i)||{cr:[]}).cr.length}))")
    print(json.dumps(info, ensure_ascii=False))
    async def shot(name, x, z, zoom=1.3, wait=1500):
        await ev(f"()=>{{zoomK={zoom};if(typeof ZOOM!=='undefined')ZOOM.t={zoom};P.x={x};P.z={z};enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}")
        await pg.wait_for_timeout(wait)
        await pg.screenshot(path=os.path.join(OUT, f'p77_{name}.jpg'), type='jpeg', quality=84)
    if 'wh' in sel:
        for i in (13, 10, 5):
            s = json.loads(await ev(f"()=>{{const s=SUPS.find(q=>q.i==={i}),w=SPWH.find(w=>w.s.i==={i});const th=w.b.rotation.y;return JSON.stringify([s.x,s.z,th,w.hz])}}"))
            x, z, th, hz = s
            import math
            fx, fz = x + math.sin(th) * (hz + 4), z + math.cos(th) * (hz + 4)
            await shot(f'wh{i}_out', fx, fz)
            await shot(f'wh{i}_in', x + .5, z + .5, 1.15, 2000)
    if 'sp' in sel:
        for i in (17, 18):
            s = json.loads(await ev(f"()=>{{const s=SUPS.find(q=>q.i==={i});return JSON.stringify([s.x,s.z])}}"))
            await shot(f'sp{i}', s[0], s[1] + 3, 1.3, 1800)
            await shot(f'sp{i}_near', s[0] + 4, s[1] - 2, .95, 1500)
            await shot(f'sp{i}_gate', s[0], s[1] + 12.5, 1.3)
    if 'new' in sel:
        for i in (14, 15, 16):
            s = json.loads(await ev(f"()=>{{const s=SUPS.find(q=>q.i==={i});return JSON.stringify([s.x,s.z])}}"))
            await shot(f'new{i}', s[0], s[1] + 3, 1.3)
    if 'road' in sel:
        for i in (14, 15):
            j = json.loads(await ev(f"()=>{{const r=ROADS.find(o=>o.b==='S{i}');const p=r.p[Math.floor(r.p.length/2)];return JSON.stringify(p)}}"))
            await shot(f'road{i}', j[0], j[1], 1.3, 1800)
    if 'map' in sel:
        img = await ev("""()=>{const c=document.createElement('canvas');c.width=c.height=1000;const x=c.getContext('2d');x.drawImage(MAPC,0,0,1000,1000);x.font='bold 15px sans-serif';x.textAlign='center';
          for(const s of SUPS){const sp=!!SUP_SPECIAL[s.i];x.fillStyle=sp?'#ff3d00':s.theme==='보급 창고'?'#7a3cff':'#e07a2c';x.beginPath();x.arc(s.x,s.z,sp?8:6,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#000';x.fillText('S'+s.i,s.x,s.z-10)}
          for(const p of PLANT_SITES){x.strokeStyle='#0a0';x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.z,p.r,0,7);x.stroke()}
          return c.toDataURL('image/png')}""")
        open(os.path.join(OUT, 'p77_map.png'), 'wb').write(base64.b64decode(img.split(',')[1]))
