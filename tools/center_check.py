# 4차 디자인(센터 철조망·보급지 철조망·설치형 2단계) 확인. 지도에는 낚시 포인트를 표시하지 않음(기획자 요청)
async def steps(pg):
    ev=pg.evaluate
    print('center',await ev("""()=>{const T=PORTS[0],near=structs.filter(s=>dist(s.x,s.z,T.x,T.z)<45),cnt={};near.forEach(s=>cnt[s.t]=(cnt[s.t]||0)+1);
      const all={};structs.forEach(s=>{if(s.t==='cfence')all[s.t]=(all[s.t]||0)+1});return JSON.stringify({town:cnt,cfence:all.cfence,builds:{bench:BUILDS.bench.g,fire:BUILDS.fire.g,gen:BUILDS.gen.g},lkb:Object.keys(LKB).length,icons:['bench','fire','gen','stove','garden','sprinkler'].map(k=>!!ICON[k])})}"""))
    await ev("()=>{P.x=VIL.px;P.z=VIL.pz+10;zoomK=1.6}");await pg.wait_for_timeout(1800);await pg.screenshot(path=os.path.join(OUT,'center.jpg'),type='jpeg',quality=85)
    await ev("()=>{P.x=VIL.px;P.z=VIL.pz-6}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'center_back.jpg'),type='jpeg',quality=85)
    await ev("()=>{zoomK=1;const s=SUPS[2];P.x=s.x+3;P.z=s.z+5}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'supply_fence.jpg'),type='jpeg',quality=85)
    # 설치형 2단계 외형 줄 세우기
    await ev("""()=>{P.x=VIL.px-4;P.z=VIL.pz+40;let t=0;while(hAt(P.x,P.z)<1.05&&t++<60)P.z-=1;let i=0;for(const g of['lk_bench','lk_fire','lk_stove','lk_sign','lk_garden','lk_gen','lk_battery','lk_sprinkler']){const m=mesh(GEO[g],MATT),x=P.x-9+i*2.6,z=P.z-3;m.position.set(x,groundY(x,z),z);scene.add(m);i++}}""")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'stage2.jpg'),type='jpeg',quality=85)
    # 미니맵: 해안 낚시터 근처
    await ev("()=>{const s=FSP.find(q=>q.lb==='해안23');P.x=s.x+2;P.z=s.z+6}");await pg.wait_for_timeout(1200);await pg.screenshot(path=os.path.join(OUT,'minimap.jpg'),type='jpeg',quality=85,clip={'x':760,'y':4,'width':116,'height':116})
    await ev("()=>{const s=FSP.find(q=>q.lb==='메모5');P.x=s.x;P.z=s.z-7}");await pg.wait_for_timeout(1200);await pg.screenshot(path=os.path.join(OUT,'minimapA.jpg'),type='jpeg',quality=85,clip={'x':760,'y':4,'width':116,'height':116})
    await ev("()=>openFmap()");await pg.wait_for_timeout(600);await pg.screenshot(path=os.path.join(OUT,'fmap.jpg'),type='jpeg',quality=85)
    await ev("()=>closePanel()");await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(600);await ev("()=>openFmap()");await pg.wait_for_timeout(600);await pg.screenshot(path=os.path.join(OUT,'fmap_port.jpg'),type='jpeg',quality=85)
