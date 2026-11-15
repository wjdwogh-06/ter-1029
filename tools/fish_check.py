# 낚시 포인트 검사: 확률(20만 번 뽑기), 88곳 모두 땅에서 8m 안에 던질 수 있는지, 물 안·먼 곳·빈 물은 안 되는지, 실제로 낚기, 스크린샷
import json
async def steps(pg):
    ev=pg.evaluate
    print('spots',await ev("()=>JSON.stringify({n:FSP.length,A:FSP.filter(s=>s.zone==='A').length,B:FSP.filter(s=>s.zone==='B').length,moved:FSP.filter(s=>s.ox!==undefined).map(s=>[s.lb,[s.ox,s.oz],[+s.x.toFixed(1),+s.z.toFixed(1)],+waterDepth(s.x,s.z).toFixed(2)])})"))
    print('odds',await ev("""()=>{const out={};for(const zk of['A','B']){const sp=FSP.find(s=>s.zone===zk),c={},g=[0,0,0,0],N=200000;for(let i=0;i<N;i++){const f=pickFish(sp);c[f.n]=(c[f.n]||0)+1;g[f.g]++}
      for(const k in c)c[k]=+(c[k]/N*100).toFixed(1);out[zk]={fish:c,grade:Object.fromEntries(g.map((v,i)=>[FGRADE[i][0],+(v/N*100).toFixed(1)]))}}return JSON.stringify(out)}"""))
    # 88곳 모두: 가장 가까운 설 수 있는 땅으로 옮겨 [던지기] → 그 떼(또는 같은 구역 이웃 떼)에 던져지는지
    r=await ev("""()=>{give('rod',1);S.sel=S.quick.indexOf('rod');const stand=(x,z)=>waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null;const bad=[],far=[];let ok=0,same=0,maxD=0;
      for(const s of FSP){let best=null,bd=1e9;for(let dx=-12;dx<=12;dx+=.5)for(let dz=-12;dz<=12;dz+=.5){const d=Math.hypot(dx,dz);if(d<bd&&stand(s.x+dx,s.z+dz)){bd=d;best=[s.x+dx,s.z+dz]}}
       if(!best){bad.push(s.lb+':땅없음');continue}P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);P.moving=false;P.auto=null;updWaterState(0);endFish();tryCast();
       const f=fishing;if(!f){bad.push(s.lb+':안던져짐 '+bd.toFixed(1)+'m');continue}const cd=dist(P.x,P.z,f.bx,f.bz);maxD=Math.max(maxD,cd);if(cd>ROD_R+.06)far.push(s.lb);if(f.spot.zone!==s.zone)bad.push(s.lb+':다른구역');else{ok++;if(f.spot===s)same++}
       if(dist(f.bx,f.bz,f.spot.x,f.spot.z)>f.spot.R+FCATCH+.01)bad.push(s.lb+':떼밖');if(waterDepth(f.bx,f.bz)<.05)bad.push(s.lb+':땅에던짐');endFish()}
      return JSON.stringify({ok,same,maxCast:+maxD.toFixed(2),bad,far})}""")
    print('cast all',r)
    # 규칙: 물 안에서는 안 됨, 먼 곳·물고기 없는 물은 안 됨
    print('rules',await ev("""()=>{const s=FSP.find(q=>q.lb==='해안23'),o={};endFish();
      let w=null;for(const q of FSP){if(w)break;for(let r=0;r<8&&!w;r+=.25)for(let a=0;a<64;a++){const x=q.x+Math.cos(a/64*6.28)*r,z=q.z+Math.sin(a/64*6.28)*r;const d=waterDepth(x,z);if(d>SHALLOW+.05&&d<DEEP-.05&&dist(x,z,q.x,q.z)<ROD_R-1){w=[x,z,q];break}}}const s2=w[2];
      P.x=w[0];P.z=w[1];updWaterState(0);o.wadeSt=WTR.st;tryCast();o.wade=!!fishing;castAt(s2.x,s2.z,s2);o.wadeTap=!!fishing;endFish();
      P.x=VIL.x;P.z=VIL.z;updWaterState(0);tryCast();o.townNoSpot=!!fishing;o.near=Math.round(Math.min(...FSP.map(q=>dist(q.x,q.z,P.x,P.z))));
      let e=null;const st0=(x,z)=>waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null;for(let a=0;a<360&&!e;a+=3)for(let r=2;r<60;r+=.5){const x=VIL.x+Math.cos(a*Math.PI/180)*r,z=VIL.z+Math.sin(a*Math.PI/180)*r;if(st0(x,z)){const x2=x+Math.cos(a*Math.PI/180)*4,z2=z+Math.sin(a*Math.PI/180)*4;if(waterDepth(x2,z2)>.4&&!spotAt(x2,z2)){e=[x,z,x2,z2];break}}}
      if(e){P.x=e[0];P.z=e[1];updWaterState(0);castAt(e[2],e[3]);o.emptyWater=!!fishing;tryCast();o.emptyWaterBtn=!!fishing}else o.emptyWater='no water near town';endFish();
      const st=(x,z)=>waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null;let fp=null;for(let r=ROD_R+s.R+2;r<ROD_R+s.R+8&&!fp;r+=.5)for(let a=0;a<72;a++){const x=s.x+Math.cos(a/72*6.28)*r,z=s.z+Math.sin(a/72*6.28)*r;if(st(x,z)&&!FSP.some(q=>dist(q.x,q.z,x,z)<ROD_R+q.R+1.2)){fp=[x,z];break}}
      if(fp){P.x=fp[0];P.z=fp[1];updWaterState(0);tryCast();o.tooFar=!!fishing;castAt(s.x,s.z,s);o.tooFarTap=!!fishing;endFish()}return JSON.stringify(o)}"""))
    # 실제로 한 마리: 해안23 앞에서 던지고 → 입질 → 챔질 → 감기 완료
    await ev("""()=>{const s=FSP.find(q=>q.lb==='해안23');let best=null,bd=1e9;for(let dx=-10;dx<=10;dx+=.5)for(let dz=-10;dz<=10;dz+=.5){const x=s.x+dx,z=s.z+dz,d=Math.hypot(dx,dz);if(d<bd&&waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null&&dz>0){bd=d;best=[x,z]}}P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);updWaterState(0);endFish();tryCast()}""")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'fish_wait.jpg'),type='jpeg',quality=85)
    await ev("()=>{fishing.W=fishing.t+.9}");await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'fish_approach.jpg'),type='jpeg',quality=85)
    for i in range(40):
        st=await ev("()=>fishing&&fishing.st")
        if st=='bite': break
        await pg.wait_for_timeout(150)
    print('state',st)
    await ev("()=>{inp.fire=true}")
    for i in range(30):
        st=await ev("()=>fishing&&fishing.st")
        if st=='reel': break
        await pg.wait_for_timeout(60)
    print('after strike',await ev("()=>fishing&&[fishing.st,fishing.fish&&fishing.fish.n]"))
    await pg.wait_for_timeout(700);await pg.screenshot(path=os.path.join(OUT,'fish_reel.jpg'),type='jpeg',quality=85)
    await ev("()=>{if(fishing){fishing.prog=.99;fishing.ten=0;fishing.thr=0;fishing.thrT=9}}")
    for i in range(40):
        if await ev("()=>!fishing"): break
        await pg.wait_for_timeout(100)
    await ev("()=>{inp.fire=false}");await pg.wait_for_timeout(300)
    print('caught',await ev("()=>JSON.stringify({fcb:FCB&&[FCB.f.n,FCB.cm,FGRADE[FCB.f.g][0]],inv:Object.keys(S.inv).filter(k=>/^f_/.test(k)&&S.inv[k]>0),fish:S.st.fish,caught:S.caught})"))
    await pg.screenshot(path=os.path.join(OUT,'fish_caught.jpg'),type='jpeg',quality=85)
    # 전설 배너 모양
    await ev("()=>{FCB={f:FISHD.f_hammer,cm:388,first:1,t:2.5}}");await pg.wait_for_timeout(150);await pg.screenshot(path=os.path.join(OUT,'fish_legend.jpg'),type='jpeg',quality=85)
    # 등대 앞바다: 안쪽만 등대 떼들
    await ev("""()=>{FCB=null;const s=FSP.find(q=>q.lb==='메모5');let best=null,bd=1e9;for(let dx=-12;dx<=12;dx+=.5)for(let dz=-12;dz<=12;dz+=.5){const x=s.x+dx,z=s.z+dz,d=Math.hypot(dx,dz);if(d<bd&&waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null){bd=d;best=[x,z]}}P.x=best[0];P.z=best[1];P.rot=Math.atan2(s.x-P.x,s.z-P.z);updWaterState(0);endFish()}""")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'fish_lighthouse.jpg'),type='jpeg',quality=85)
    print('schools drawn',await ev("()=>SCH.m.count"))
    # 아이콘 판: 새 물고기 10종 + 익힌 것
    await ev("""()=>{const d=document.createElement('div');d.id='fishsheet';d.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;background:#FBF4E6;z-index:9999;display:flex;flex-wrap:wrap;gap:6px;padding:8px;align-content:flex-start;font:800 11px var(--f);color:#5B3D2B';
      FISH_LIST.forEach(f=>{for(const id of[f.id,'c'+f.id])d.insertAdjacentHTML('beforeend',`<div style="width:78px;text-align:center"><img src="${ICON[id]}" style="width:70px;height:70px;background:#fff;border-radius:12px;border:2px solid ${FGRADE[f.g][1]}"><br>${ITEMS[id].n}</div>`)});document.body.appendChild(d)}""")
    await pg.wait_for_timeout(300);await pg.screenshot(path=os.path.join(OUT,'fish_icons.jpg'),type='jpeg',quality=90)
    await ev("()=>document.getElementById('fishsheet').remove()")
    # 도감
    await ev("()=>{S.caught.f_tuna=1;S.best.f_tuna=150;S.caught.f_hammer=1;S.best.f_hammer=388;S.caught.f_rainbow=2;S.best.f_rainbow=60;openPanel('menu')}");await pg.wait_for_timeout(300)
    await ev("()=>{const b=document.querySelector('#pbody')||document.querySelector('.pbody');if(b)b.scrollTop=9999}");await pg.wait_for_timeout(200)
    await pg.screenshot(path=os.path.join(OUT,'fish_book.jpg'),type='jpeg',quality=85)
