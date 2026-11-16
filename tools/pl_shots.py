# 낚시 캠프·분지 사진만 찍기 (검사 없음). SHOTS 환경변수로 고르기: fish, crater, all
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);which=os.environ.get('SHOTS','all')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    L=[]
    if which in('fish','all'):L+=[('ps_fish_over','FISHISLE.x-9','FISHISLE.z+1',1.6,.42),('ps_fish_hut','FISHISLE.x-14','FISHISLE.z+2.6',.75,.42),('ps_fish_fire','FISHISLE.x-3','FISHISLE.z+3.5',.8,.42),('ps_fish_pier','FISHISLE.x-24','FISHISLE.z+2',.85,.42),('ps_fish_out','FISHISLE.x-6','FISHISLE.z+13',1.25,.42),('ps_fish_night','FISHISLE.x-9','FISHISLE.z+2',1.2,.95)]
    if which in('crater','all'):L+=[('ps_cr_front','SPSUP.x','SPSUP.z+SPSUP.A+9',1.2,.42),('ps_cr_in','SPSUP.x+1','SPSUP.z+1',.95,.42),('ps_cr_far','SPSUP.x-3','SPSUP.z+SPSUP.A+4',1.75,.42),('ps_cr_rim','SPSUP.x-6.8','SPSUP.z+2',.9,.42),('ps_cr_night','SPSUP.x','SPSUP.z+SPSUP.A+6',1.3,.95)]
    for n,x,z,zk,t in L:
        await ev(f"()=>{{S.time={t};P.x={x};P.z={z};P.rot=Math.PI;P.auto=null;zoomK={zk};enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1300)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=88)
    print('ok',len(L))
