# 82차 사진: SHOTS=ot,fish,cr,gem (쉼표) — 검사 없음
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);which=os.environ.get('SHOTS','ot,fish,cr').split(',')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    L=[]
    if 'ot' in which:L+=[('p82_ot_top','OTR.x','OTR.z+4',2.0,.42),('p82_ot_bridge','(OTR.b0[0]+OTR.b1[0])/2','(OTR.b0[1]+OTR.b1[1])/2+3',1.5,.42),('p82_ot_bridge2','OTB.S1[0]-6','OTB.S1[1]+5',1.0,.42),('p82_ot_cook','otW(OTN.cook.s,OTN.cook.v)[0]','otW(OTN.cook.s,OTN.cook.v)[1]+3',1.15,.42),('p82_ot_hunt','otW(OTN.hunt.s,OTN.hunt.v)[0]','otW(OTN.hunt.s,OTN.hunt.v)[1]+3',1.15,.42),('p82_ot_gate','OTB.G[0]-3','OTB.G[1]+4',1.1,.42),('p82_ot_night','OTR.x+4','OTR.z',1.8,.95)]
    if 'fish' in which:L+=[('p82_fish_over','FISHISLE.x-2','FISHISLE.z-3',1.95,.42),('p82_fish_gate','FISHISLE.x-1','FISHISLE.z+9',1.1,.42),('p82_fish_hut','FISHISLE.x-14','FISHISLE.z+2.6',.95,.42),('p82_fish_east','FISHISLE.x+10','FISHISLE.z-1',1.0,.42),('p82_fish_north','FISHISLE.x+1','FISHISLE.z-15',1.05,.42),('p82_fish_far','FISHISLE.x-2','FISHISLE.z+14',1.95,.42),('p82_fish_night','FISHISLE.x-3','FISHISLE.z+1',1.5,.95)]
    if 'cr' in which:L+=[('p82_cr_far','SPSUP.x-2','SPSUP.z+SPSUP.AZ+4',1.95,.42),('p82_cr_front','SPSUP.x-3','SPSUP.z+SPSUP.AZ+8',1.25,.42),('p82_cr_in','SPSUP.x+1','SPSUP.z+.5',1.2,.42),('p82_cr_rim','SPSUP.x-SPSUP.AX+1.5','SPSUP.z+1',.95,.42),('p82_cr_back','SPSUP.x+2','SPSUP.z-SPSUP.BZ+2',1.0,.42),('p82_cr_east','SPSUP.x+SPSUP.AX+5','SPSUP.z+2',1.2,.42),('p82_cr_night','SPSUP.x-2','SPSUP.z+SPSUP.AZ+5',1.6,.95)]
    for n,x,z,zk,t in L:
        await ev(f"()=>{{S.time={t};P.x={x};P.z={z};P.rot=Math.PI;P.auto=null;zoomK={zk};enemies.slice().forEach(dropEnemy);updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1300)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=86)
    print('ok',len(L))
