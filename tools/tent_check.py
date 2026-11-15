# 텐트: 가방에서 한 번 눌러 설치 → 나무/바위/경사 겹치면 거부 → 들어가기(빈 내부 방) → 나가기
async def steps(pg):
    ev=pg.evaluate
    await ev("()=>{S.time=.42;WX.t=1e9;give('kit_tent',1);give('kit_stash',1)}")
    # refuse on a tree / rock
    print('refuse',await ev("""()=>{const out={};for(const t of [0,3]){let o=null;objs.forEach(q=>{if(!o&&q.t===t&&dist(q.x,q.z,VIL.px,VIL.pz)<160&&walk(q.x,q.z+4,.42,P)===null)o=q});P.x=o.x;P.z=o.z+4.2;P.rot=Math.PI;setBuild('ptent');const g=ghostPos();out[t]=g.why}setBuild(null);return JSON.stringify(out)}"""))
    # random placement audit: every accepted spot must be clear of objects and flat
    print('audit',await ev("""()=>{let ok=0,bad=0,n=0;setBuild('ptent');for(let k=0;k<4000;k++){const x=150+Math.random()*700,z=150+Math.random()*700;if(hAt(x,z)<1)continue;P.x=x;P.z=z;P.rot=Math.random()*6.28;const g=ghostPos();n++;if(!g.ok)continue;ok++;let hit=0;objs.forEach(o=>{if(o.re<=0&&dist(o.x,o.z,g.x,g.z)<1.3+(o.t<3?1:o.t===3?1:.4))hit=1});const hs=[[-1.25,-1.3],[1.25,-1.3],[-1.25,1.3],[1.25,1.3],[0,0]].map(q=>hAt(g.x+q[0],g.z+q[1]));if(hit||Math.max(...hs)-Math.min(...hs)>.3)bad++}setBuild(null);return JSON.stringify({tried:n,accepted:ok,bad})}"""))
    await ev("()=>{P.x=VIL.px-40;P.z=VIL.pz+10;P.rot=0;openPanel('bag')}");await pg.wait_for_timeout(500)
    await pg.click('[data-a="sel"][data-k="kit_tent"]');await pg.wait_for_timeout(500)
    print('mode',await ev("()=>JSON.stringify([bmode,panel,ghostPos().why])"));await pg.screenshot(path=os.path.join(OUT,'tent_ghost.jpg'),type='jpeg',quality=88)
    await ev("()=>placeBuild()");await pg.wait_for_timeout(400)
    await ev("()=>{setBuild(null);const t=structs.find(s=>s.t==='ptent');P.x=t.x;P.z=t.z+2.3;P.rot=Math.PI}");await pg.wait_for_timeout(900);await pg.screenshot(path=os.path.join(OUT,'tent_out.jpg'),type='jpeg',quality=88)
    print('label',await ev("()=>target&&target.lab"))
    await ev("()=>{inp.actEdge=true;interact();inp.actEdge=false}");await pg.wait_for_timeout(2600);await pg.screenshot(path=os.path.join(OUT,'tent_in.jpg'),type='jpeg',quality=90)
    print('inside',await ev("()=>JSON.stringify({on:INT.on,p:[P.x|0,P.z|0,+groundY(P.x,P.z).toFixed(1)],st:WTR.st,it:INT.it.map(s=>s.t)})"))
    print('walls',await ev("()=>{let e=P,esc=0;for(let k=0;k<3000;k++){const a=Math.random()*6.28;moveEnt(e,Math.cos(a)*.4,Math.sin(a)*.4);const lx=P.x-INT.x,lz=P.z-INT.z;if(Math.abs(lx)>INT.hw||lz<-INT.hd||(lz>INT.hd&&Math.abs(lx)>INT.door))esc++}return esc}"))
    await ev("()=>{const b=INT.it[0];P.x=b.x;P.z=b.z-.6;P.rot=0}");await pg.wait_for_timeout(700);print('exit',await ev("()=>target&&target.lab"));await ev("()=>{inp.actEdge=true;interact();inp.actEdge=false}");await pg.wait_for_timeout(2600)
    print('outside',await ev("()=>JSON.stringify({on:INT.on,p:[P.x|0,P.z|0],blocked:String(walk(P.x,P.z,.42,P)),structsAtCorner:structs.filter(s=>s.x<80&&s.z<80).length})"))
