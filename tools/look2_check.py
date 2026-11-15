# look.js 2차(look_1.js) 확인: 오류, 울타리·문 부품, 자연 모델, 아이콘, 낮/밤 분위기, 텐트 안. 스크린샷: tools/out/lk2_*.jpg
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,'lk2_'+n+'.jpg')
    print('geo',await ev("""()=>JSON.stringify({gates:['lk_gate_wood','lk_gate_stone','lk_gate_iron','lk_gate_ti'].map(k=>!!GEO[k]&&!!GEO[k+'_b']&&!!GEO[k+'_door']),fences:['lk_fence_wood','lk_fence_stone','lk_fence_iron','lk_fence_ti'].map(k=>!!GEO[k]),
      builds:{fence:BUILDS.fence.g,wall:BUILDS.wall.g,gate:BUILDS.gate.g},nature:['tree_single_A','tree_single_B','trees_A_small','t_leaf','t_fall','t_birch','rock_single_E','rockB','bush'].map(k=>[k,GEO[k]?GEO[k].attributes.position.count/3|0:0]),
      icons:Object.keys(ICON).length,iconFence:!!ICON.fence_iron,exposure:R.toneMappingExposure})"""))
    await ev("()=>{S.time=.42;WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy);DEV.on=true}")
    # build a fence line with a gate, wall and turret near town edge
    await ev("""()=>{const x0=Math.round(VIL.px-40),z0=Math.round(VIL.pz+12);P.x=x0;P.z=z0+5;window._fx=x0;window._fz=z0;
      const put=(t,x,z,r=0)=>addStruct({t,x,z,r,own:1});put('fence',x0-4,z0);put('fence',x0-2,z0);put('gate',x0,z0);put('fence',x0+2,z0);put('wall',x0+4,z0);put('wall',x0+6,z0)}""")
    await pg.wait_for_timeout(500)
    print('gate parts',await ev("()=>{const g=structs.find(s=>s.t==='gate'&&s.own);return JSON.stringify({lk:!!g.lk,parts:g.lk?Object.keys(g.lk.parts):null})}"))
    await ev("()=>{document.getElementById('ui').style.display='none';const uc=updCamera;window._pc=null;updCamera=function(dt,px,py,pz,sn){const p=_pc;if(!p){uc(dt,px,py,pz,sn);return}camT.set(p.x,1,p.z);cam.position.set(p.x,p.H,p.z+p.D);cam.lookAt(p.x,p.ly||1,p.z)}}")
    await ev("()=>{_pc={x:_fx+1,z:_fz,D:9,H:7,ly:.9}}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('fences'),type='jpeg',quality=90)
    await ev("()=>{const g=structs.find(s=>s.t==='gate'&&s.own);if(g.lk&&g.lk.parts.door)g.lk.parts.door.rotation.y=-Math.PI/2}");await pg.wait_for_timeout(400);await pg.screenshot(path=O('gate_open'),type='jpeg',quality=90)
    for n,(x,z) in [('forest',(330,420)),('birch',(560,330)),('coast',(300,560))]:
        await ev(f"()=>{{_pc=null;let x={x},z={z};for(let k=0;k<400&&hAt(x,z)<1.05;k++)x+=3;P.x=x;P.z=z;enemies.slice().forEach(dropEnemy)}}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O(n),type='jpeg',quality=88)
    await ev("()=>{S.time=.95}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('night'),type='jpeg',quality=88)
    await ev("()=>{S.time=.42;P.x=VIL.x;P.z=VIL.z}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('town'),type='jpeg',quality=88)
    await ev("()=>{document.getElementById('ui').style.display='';openPanel('build')}");await pg.wait_for_timeout(800);await pg.screenshot(path=O('buildpanel'),type='jpeg',quality=88)
    await ev("()=>{closePanel();give('wood',20);give('stone',9);give('berry',3);give('axe',1);give('rod',1);give('kit_tent',1);give('kit_stash',1);openPanel('bag')}");await pg.wait_for_timeout(800);await pg.screenshot(path=O('bag'),type='jpeg',quality=88)
    print('tris',await ev("()=>{closePanel();P.x=330;P.z=420;let x=330;while(hAt(x,420)<1.05)x+=3;P.x=x;return 0}"))
    await pg.wait_for_timeout(1500);print('render',await ev("()=>JSON.stringify(R.info.render)"))
