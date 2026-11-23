# 65차(디자인): 미끼 2종(지렁이·새우) + 행운의 낚싯대 — 아이템·그림·아이콘·자판기·낚싯대로 들고 던지기
# 기대: ok true, errs []  · 그림: tools/out/p65_icons.png
import json,os,base64
async def steps(pg):
    ev=pg.evaluate
    r=json.loads(await ev("""()=>{const L=['bait_worm','bait_shrimp','rod_lucky'],pool=vendPool();const o={noItem:L.filter(k=>!ITEMS[k]),noGeo:L.filter(k=>!GEO[ITEMS[k].ic]),noIcon:L.filter(k=>!/^data:image/.test(ICON[k]||'')),notVend:L.filter(k=>!pool.includes(k)),
      cat:L.map(k=>lkCatOf(k)),rod:[!!WEAP.rod_lucky.rod,isRod('rod_lucky'),JSON.stringify(WEAP.rod_lucky.bite),!!(GEO.bt_rod_lucky.userData.tip)],tris:L.map(k=>Math.round(GEO[ITEMS[k].ic].attributes.position.count/3))};
      S.inv.rod_lucky=1;eqSet('gear','rod_lucky');o.held=curId();return JSON.stringify(o)}"""))
    await pg.wait_for_timeout(600)
    r['cast']=json.loads(await ev("""()=>{let best=null;for(const f of FSP){const d=Math.hypot(f.x-P.x,f.z-P.z);if(!best||d<best.d)best={f,d}}return JSON.stringify({n:FSP.length})}"""))
    r['ok']=not r['noItem'] and not r['noGeo'] and not r['noIcon'] and not r['notVend'] and r['cat']==['res','res','rare'] and r['rod'][0] and r['rod'][1] and r['rod'][3] and r['held']=='rod_lucky'
    u=await ev("""async()=>{const A=['bait_worm','bait_shrimp','rod_lucky','rod','rod3'],N=150,c=document.createElement('canvas');c.width=A.length*(N+30);c.height=N+30;const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();k.drawImage(im,i*(N+30)+15,2,N,N);k.fillStyle='#5b3d2b';k.font='bold 13px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,i*(N+30)+15+N/2,N+20)}return c.toDataURL()}""")
    open(os.path.join(OUT,'p65_icons.png'),'wb').write(base64.b64decode(u.split(',')[1]))
    await ev("()=>{S.time=.42;try{ZOOM.t=.74}catch(e){};zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p65_hold.jpg'),type='jpeg',quality=86)
    print('bait',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
