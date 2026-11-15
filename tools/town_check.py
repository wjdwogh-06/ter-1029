# 마을·항구 새 모델 확인: 항구마을 전체/가까이, 작은 항구 2곳, 밤 가로등, 부두 위 걷기. 스크린샷: tools/out/town_*.jpg
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,'town_'+n+'.jpg')
    await ev("()=>{S.time=.42;WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy);DEV.on=true;document.getElementById('ui').style.display='none';const uc=updCamera;window._pc=null;updCamera=function(dt,px,py,pz,sn){const p=_pc;if(!p){uc(dt,px,py,pz,sn);return}camT.set(p.x,1,p.z);cam.position.set(p.x,p.H,p.z+p.D);cam.lookAt(p.x,p.ly||1,p.z)}}")
    await ev("()=>{const p=PORTS[0];P.x=VIL.x;P.z=VIL.z;_pc={x:VIL.px,z:VIL.pz-2,D:30,H:30}}");await pg.wait_for_timeout(2000);await pg.screenshot(path=O('wide'),type='jpeg',quality=90)
    await ev("()=>{const m=structs.find(s=>s.t==='market');_pc={x:m.x,z:m.z,D:11,H:9,ly:1.5}}");await pg.wait_for_timeout(1200);await pg.screenshot(path=O('shop'),type='jpeg',quality=90)
    await ev("()=>{const m=structs.find(s=>s.t==='tavern');_pc={x:m.x+3,z:m.z,D:13,H:11,ly:1.5}}");await pg.wait_for_timeout(1200);await pg.screenshot(path=O('bar'),type='jpeg',quality=90)
    await ev("()=>{const p=PORTS[0];_pc={x:p.x+p.dx*8,z:p.z+p.dz*8,D:22,H:22}}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('piers'),type='jpeg',quality=90)
    for i in [1,4]:
        await ev(f"()=>{{const p=PORTS[{i}];P.x=p.x-p.dx*6;P.z=p.z-p.dz*6;_pc={{x:p.x,z:p.z,D:18,H:18}}}}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('port%d'%i),type='jpeg',quality=90)
    await ev("()=>{const p=PORTS[0];P.x=VIL.x;P.z=VIL.z;S.time=.98;_pc={x:VIL.px,z:VIL.pz,D:24,H:24}}");await pg.wait_for_timeout(2000);await pg.screenshot(path=O('night'),type='jpeg',quality=90)
    # walk out onto the town pier and check the feet height vs the pier top
    print('pier',await ev("()=>{_pc=null;const d=DOCKS.find(d=>d.y>.7&&d.hl>4&&dist(d.x,d.z,PORTS[0].x,PORTS[0].z)<40);P.x=d.x;P.z=d.z;return JSON.stringify({dockY:d.y,ground:+groundY(P.x,P.z).toFixed(2),blocked:String(walk(P.x,P.z,.42,P))})}"))
