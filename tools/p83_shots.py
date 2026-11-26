# 83차 사진: 집·2층 집·산장 비교 (SHOTS=cmp,lodge,in)
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);which=os.environ.get('SHOTS','cmp,lodge,in').split(',')
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    r=await ev("""()=>{let best=null;for(let a=0;a<400&&!best;a++){const x=VIL.x-60+((a*37)%120),z=VIL.z-60+((a*53)%120);let ok=true;for(let u=-12;u<=12&&ok;u+=1.5)for(let v=-8;v<=10;v+=1.5){const h=hAt(x+u,z+v);if(h<.95||nobAt&&nobAt(x+u,z+v)){ok=false;break}}if(ok)best=[x,z]}
      if(!best)return 'none';const [x,z]=best;for(const [k,o] of objs)if(Math.abs(o.x-x)<16&&Math.abs(o.z-z)<12){o.re=1e9;refreshObj(o)}
      window.S83={x,z};const a=addStruct({t:'phouse',x:x-6,z,r:0,own:1,hp:600});const b=addStruct({t:'phouse2',x:x+3,z,r:0,own:1,hp:900});window.S83.a=a;window.S83.b=b;return JSON.stringify(best)}""")
    print('spot',r)
    if 'cmp' in which:
        for n,dx,dz,zk in [('p83_cmp',-1.5,6,1.0),('p83_h2_near',3,4.5,.78),('p83_h2_far',3,8,1.25),('p83_h2_top',3,-1,1.15)]:
            await ev(f"()=>{{P.x=S83.x+{dx};P.z=S83.z+{dz};P.rot=Math.PI;zoomK={zk};updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1400)
            await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=86)
    if 'lodge' in which:
        await ev("()=>{const s=structs.find(q=>q.t==='lodge79');P.x=s.x;P.z=s.z+5;P.rot=Math.PI;zoomK=.85;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
        await pg.screenshot(path=O('p83_lodge.jpg'),type='jpeg',quality=86)
    if 'in' in which:
        await ev("()=>{intEnter(S83.b);return 1}");await pg.wait_for_timeout(2500)
        await ev("()=>{P.x=INT.x;P.z=INT.z+1.6;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(900)
        await pg.screenshot(path=O('p83_in.jpg'),type='jpeg',quality=86)
    print('ok')
