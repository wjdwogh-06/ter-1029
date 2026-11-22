# 54차(디자인): 보급지 테마·울타리와 본섬 길 사진. SITES=0,7,8 처럼 보급지 번호를 고를 수 있어요(기본: 전부).
# 결과: tools/out/p54_sup<번호>.jpg (평소 카메라, 가장 멀리 본 확대), p54_road_<이름>.jpg, p54_map.png(지도에 길·보급지 테마). MAPONLY=1이면 지도만.
import json
async def steps(pg):
    ev = pg.evaluate
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.40;enemies.slice().forEach(dropEnemy);if(typeof HZ!=='undefined'&&HZ.on!==undefined)HZ.on=false}")
    info = await ev("()=>SPF.map(f=>({i:f.i,t:f.theme,th:+f.th.toFixed(2),hx:+f.hx.toFixed(1),hz:+f.hz.toFixed(1),posts:f.posts.length,cols:f.cols,nob:+(NOB.find(n=>n.k==='sup'&&Math.abs(n.x-f.x)<.5&&Math.abs(n.z-f.z)<.5)||{r:0}).r.toFixed(1)}))")
    print(json.dumps(info, ensure_ascii=False))
    sel = os.environ.get('SITES')
    ids = [int(v) for v in sel.split(',')] if sel else [f['i'] for f in info]
    if os.environ.get('MAPONLY'): ids = []
    for i in ids:
        await ev(f"""()=>{{const f=SPF.find(q=>q.i==={i});zoomK=1.3;if(typeof ZOOM!=='undefined')ZOOM.t=1.3;
          let x=f.x,z=f.z+3;P.x=x;P.z=z;enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}""")
        await pg.wait_for_timeout(1700)
        await pg.screenshot(path=os.path.join(OUT, f'p54_sup{i}.jpg'), type='jpeg', quality=84)
    # 길: 갈림길 두 곳 + 숲속 길 + 지도
    for n, x, z in ([] if os.environ.get('MAPONLY') else [['j0', 410, 562], ['hc', 466, 724], ['forest', 352, 470]]):
        await ev(f"()=>{{zoomK=1.15;if(typeof ZOOM!=='undefined')ZOOM.t=1.15;P.x={x};P.z={z};updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}")
        await pg.wait_for_timeout(1700)
        await pg.screenshot(path=os.path.join(OUT, f'p54_road_{n}.jpg'), type='jpeg', quality=84)
    import base64
    img = await ev("""()=>{const c=document.createElement('canvas');c.width=760;c.height=660;const x=c.getContext('2d');x.drawImage(MAPC,90,160,760,660,0,0,760,660);
      x.font='bold 15px sans-serif';x.textAlign='center';
      const OFF={8:[-34,-6],6:[44,6],7:[0,30]};for(const f of SPF){const X=f.x-90,Z=f.z-160,o=OFF[f.i]||[0,0];if(X<0||Z<0||X>760||Z>660)continue;x.fillStyle='#e07a2c';x.beginPath();x.arc(X,Z,6,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#3b2412';x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=4;x.strokeText(f.theme,X+o[0],Z-11+o[1]);x.fillText(f.theme,X+o[0],Z-11+o[1])}
      for(const p of PORTS){const X=p.x-90,Z=p.z-160;if(X<0||Z<0||X>760||Z>660)continue;x.fillStyle='#2f4f86';x.fillRect(X-6,Z-6,12,12);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(X-6,Z-6,12,12)}
      return c.toDataURL('image/png')}""")
    open(os.path.join(OUT, 'p54_map.png'), 'wb').write(base64.b64decode(img.split(',')[1]))
