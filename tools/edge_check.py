# 부두·콘크리트 가장자리 ↔ 땅 넘나들기 검사(30차, 기획자: '항구와 일반 땅 사이를 캐릭터가 못 지나가고 걸린다')
# 모든 부두 가장자리 바깥이 마른 땅인 곳마다, 안 → 밖, 밖 → 안으로 걸어 봐요.
# 기대: fail=0 (구조물에 막힌 곳 'struct'는 따로 셈 — 철조망·자판기 같은 진짜 벽), errs=[]
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    r=await ev("""()=>{const res={edges:0,fail:0,struct:0,why:{},bad:[],byT:{}};const st=.075;
      const tryWalk=(x,z,ux,uz,n)=>{P.x=x;P.z=z;P.yv=undefined;let last='';for(let k=0;k<n;k++){const nx=P.x+ux*st,nz=P.z+uz*st;if(!moveEnt(P,ux*st,uz*st)){const w=walk(nx,nz,.42,P);last=w===null?'step':(w===true?'edge':'struct:'+(w.t||'?'));break}}return last};
      for(const d of DOCKS){if(d.y>5)continue;
       for(let side=0;side<4;side++){const L=side<2?d.hl:d.hw;for(let u=-L+.5;u<=L-.5;u+=.6){
        let lx,lz,nx,nz;if(side<2){const s=side?1:-1;lx=s*d.hw;lz=u;nx=s;nz=0}else{const s=side===2?1:-1;lz=s*d.hl;lx=u;nx=0;nz=s}
        const W=(a,b)=>[d.x+a*d.c+b*d.s,d.z-a*d.s+b*d.c],[ex,ez]=W(lx,lz),[ix,iz]=W(lx-nx*.8,lz-nz*.8),[ox,oz]=W(lx+nx*1.3,lz+nz*1.3),ux=nx*d.c+nz*d.s,uz=-nx*d.s+nz*d.c;
        if(onDock(ox,oz)||hAt(ox,oz)<.3||!onDock(ix,iz))continue;
        if(walk(ix,iz,.42,P)!==null||walk(ox,oz,.42,P)!==null)continue;   /* 시작 자리 자체가 막힘(구조물 안) */
        res.edges++;
        for(const [sx,sz,dx,dz,dir] of [[ix,iz,ux,uz,'out'],[ox,oz,-ux,-uz,'in']]){const w=tryWalk(sx,sz,dx,dz,32);
         const done=dir==='out'?!onDock(P.x,P.z)&&Math.hypot(P.x-ex,P.z-ez)>.6:!!onDock(P.x,P.z)&&Math.hypot(P.x-ex,P.z-ez)>.4;
         if(done)continue;if(w.startsWith('struct')){res.struct++;res.byT[w]=(res.byT[w]||0)+1;continue}
         res.fail++;res.why[w||'none']=(res.why[w||'none']||0)+1;
         if(res.bad.length<40)res.bad.push({x:+ex.toFixed(1),z:+ez.toFixed(1),dir,w,dy:+d.y,hIn:+stepY(ix,iz).toFixed(2),hEdgeOut:+hAt(ex+ux*.1,ez+uz*.1).toFixed(2),hOut:+hAt(ox,oz).toFixed(2),at:[+P.x.toFixed(1),+P.z.toFixed(1)],py:+stepY(P.x,P.z).toFixed(2)})}}}}
      return JSON.stringify(res)}""")
    R=json.loads(r);print('edges',{k:R[k] for k in ['edges','fail','struct','why','byT']})
    for b in R['bad']:print(' ',b)
    if R['bad']:
        b=R['bad'][0];await ev(f"()=>{{P.x={b['at'][0]};P.z={b['at'][1]};P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(500)
        await pg.screenshot(path=O('edge_bad.jpg'),type='jpeg',quality=85)
