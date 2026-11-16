# 낚시 캠프·분지 사진만 찍기 (검사 없음). SHOTS 환경변수로 고르기: fish, crater, all
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);which=os.environ.get('SHOTS','all')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    L=[]
    if which in('fish','all'):L+=[('ps_fish_over','FISHISLE.x-2','FISHISLE.z-3',1.95,.42),('ps_fish_gate','FISHISLE.x-1','FISHISLE.z+9',1.1,.42),('ps_fish_hut','FISHISLE.x-14','FISHISLE.z+2.6',.85,.42),('ps_fish_east','FISHISLE.x+10','FISHISLE.z-1',1.0,.42),('ps_fish_north','FISHISLE.x+1','FISHISLE.z-15',1.05,.42),('ps_fish_night','FISHISLE.x-3','FISHISLE.z+1',1.5,.95)]
    if which in('crater','all'):L+=[('ps_cr_front','SPSUP.x-3','SPSUP.z+SPSUP.AZ+8',1.25,.42),('ps_cr_in','SPSUP.x+1','SPSUP.z+.5',1.0,.42),('ps_cr_far','SPSUP.x-2','SPSUP.z+SPSUP.AZ+3',1.95,.42),('ps_cr_rim','SPSUP.x-12.2','SPSUP.z+1',.95,.42),('ps_cr_stairs','SPSUP.x-2','SPSUP.z-1',.9,.42),('ps_cr_night','SPSUP.x-2','SPSUP.z+SPSUP.AZ+5',1.5,.95)]
    for n,x,z,zk,t in L:
        await ev(f"()=>{{S.time={t};P.x={x};P.z={z};P.rot=Math.PI;P.auto=null;zoomK={zk};enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1300)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=88)
    print('ok',len(L))
