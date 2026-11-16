# 색감 비교용: 같은 자리·같은 시간에서 스크린샷을 찍어요. COL=이름 으로 접두어를 정해요(예: COL=before).
# 찍는 곳: 센터(낮), 숲, 바닷가, 보급지, 등대, 해 질 녘, 밤. 결과: tools/out/col_<이름>_<장소>.jpg
async def steps(pg):
    ev=pg.evaluate;pre=os.environ.get('COL','now');O=lambda n:os.path.join(OUT,'col_'+pre+'_'+n+'.jpg')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy)}")
    views=[('center','VIL.x','VIL.z',.42),('forest','330','420',.42),('coast','300','560',.42),
           ('supply','SUPPLY_SITES[2][0]','SUPPLY_SITES[2][1]+6',.42),('lh','LH_SITES[1][0]','LH_SITES[1][1]+7',.42),
           ('dusk','VIL.x','VIL.z',.81),('night','330','420',.95)]
    for n,x,z,t in views:
        await ev(f"""()=>{{S.time={t};let x={x},z={z};for(let k=0;k<200&&(hAt(x,z)<1.02||blocked(x,z,.5));k++)x+=1.5;P.x=x;P.z=z;
          enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}""")
        await pg.wait_for_timeout(1800);await pg.screenshot(path=O(n),type='jpeg',quality=88)
    print('views',[v[0] for v in views],'exposure',await ev("()=>R.toneMappingExposure"))
