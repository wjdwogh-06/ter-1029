'''86차 몹 사진만: 몹을 플레이어 바로 앞(북쪽 4~6m)에 두고 AI를 멈춘 채 찍어요 → tools/out/p86_s_<이름>.jpg (SHOTS=ptar,caper,peac,toad,guard,cave)'''
import os
OUTD='tools/out'
async def steps(pg):
    await pg.wait_for_timeout(2000)
    await pg.evaluate("""()=>{window.SIM=(n,dt=.05)=>{busy=false;for(let i=0;i<n;i++){for(const e of enemies.slice())updEnemy(e,dt);updSpawns(dt)}};window.KIND=k=>enemies.filter(e=>e.kind===k&&!e.dead)}""")
    want=os.environ.get('SHOTS','ptar,caper,peac,toad,guard,cave').split(',')
    plan={'ptar':('m86_ptar',3.2,.74),'caper':('m86_caper',4.2,.74),'peac':('m86_peac',5,.8),'toad':('m86_toad',5,.78),'guard':('m86_guard',6.5,.9)}
    for nm in want:
        if nm=='cave': continue
        k,d,zk=plan[nm]
        await pg.evaluate("""([k,d,zk,nm])=>{DEV.on=true;busy=false;const e=KIND(k)[0];let best=null;
          for(let a=0;a<24&&!best;a++){const an=a*.26;const x=e.x+Math.sin(an)*0,z=e.z+d;}
          if(e.slot&&e.slot.cells){for(let t=0;t<3000;t++){const c=e.slot.cells[(Math.random()*e.slot.cells.length)|0];let okk=hAt(c[0],c[1])>.95&&!inSafe(c[0],c[1]);for(let a=0;a<12&&okk;a++)for(const rr of[0,2.5,5,7.5]){const x=c[0]+Math.cos(a*.52)*rr,z=c[1]+Math.sin(a*.52)*rr+d*.5;if(blocked(x,z,1.2,0)!==null||hAt(x,z)<.9){okk=false;break}}if(okk){e.x=c[0];e.z=c[1];break}}}
          P.x=e.x+1.2;P.z=e.z+d;P.dead=false;S.hp=100;S.time=.42;zoomK=zk;e.rot=0.35;e.ft=0;e.agg=0;e.a.spd=0;e.a.air=0;e.air=0;
          for(const o of enemies)if(o.m86&&o!==e){o.ft=0}
          busy=false;for(let i=0;i<3;i++){updEnemy(e,.016)}e.rot=.35;e.a.set(e.x,e.z,e.rot);
          if(nm==='peac'){e.a.dispT=9;e.a.disp=1;e.a.pose(0)}if(nm==='caper'){e.a.dispT=9;e.a.disp=1;e.a.pose(0)}
          if(nm==='toad'){e.a.chg=.7;e.a.pose(0)}if(nm==='guard'){e.a.atk='slam';e.a.at=.6;e.a.pose(0)}
          camT.set(P.x,groundY(P.x,P.z),P.z);busy=true}""",[k,d,zk,nm])
        await pg.wait_for_timeout(1200);await pg.screenshot(path=f'{OUTD}/p86_s_{nm}.jpg',type='jpeg',quality=85)
    if 'cave' in want:
        await pg.evaluate("()=>{busy=false;DEV.on=true;const s=structs.find(q=>q.t==='cave');P.x=s.x;P.z=s.z+3;caveEnter(s)}")
        await pg.wait_for_timeout(3600)
        await pg.evaluate("""()=>{SIM(10,.05);const b=KIND('m86_crab')[0],W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz];zoomK=.8;const PT=M86.cave.nav.pts;
          for(let k=0;k<3000;k++){const q=PT[k%PT.length],ax=q[0]+rand(-12,12),az=q[1]+rand(-10,10);if(mineOpen(ax,az,1.6)&&mineOpen(ax,az+6.5,.6)&&mineOpen(ax+3,az+4,.4)&&mineOpen(ax-3,az+4,.4)){[b.x,b.z]=W(ax,az);[P.x,P.z]=W(ax,az+6.5);break}}
          b.rot=.25;b.agg=1;b.hp=b.max*.6;const mm=KIND('m86_minic');mm.slice(0,2).forEach((m,i)=>{m.x=P.x+(i?2.6:-2.8);m.z=P.z-2.2;m.ft=0;m.rot=i?2:-1.2;m.a.set(m.x,m.z,m.rot)});
          busy=false;b.a.set(b.x,b.z,b.rot);b.a.setRage(.4);b.a.atkT=.38;b.a.atkSide=1;b.a.spd=0;b.a.mixer.update(.01);camT.set(P.x,INT.y,P.z);busy=true}""")
        await pg.wait_for_timeout(1200);await pg.screenshot(path=f'{OUTD}/p86_s_cave.jpg',type='jpeg',quality=85)
    print('shots done')
