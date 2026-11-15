# 부활 규칙: 쓰러질 때마다 무작위 항구 앞, 겹치지 않는 빈 땅. 40번 뽑아 모두 검사 + 실제 사망 1번
async def steps(pg):
    ev=pg.evaluate
    print('picks',await ev("""()=>{const used={},bad=[];for(let i=0;i<40;i++){const s=portSpawn();used[s.p.n]=(used[s.p.n]||0)+1;const why=[];if(hAt(s.x,s.z)<1)why.push('water');if(walk(s.x,s.z,.42,P)!==null)why.push('blocked');if(structs.some(q=>inStruct(q,s.x,s.z,.5)))why.push('struct');const d=dist(s.x,s.z,s.p.x,s.p.z);if(d>30)why.push('far '+d.toFixed(0));if(why.length)bad.push(s.p.n+':'+why.join(','))}return JSON.stringify({used,bad})}"""))
    await ev("()=>{S.hp=1;hurtPlayer(50)}");await pg.wait_for_timeout(5200)
    print('after death',await ev("()=>JSON.stringify({dead:P.dead,p:[P.x|0,P.z|0],near:PORTS.map(p=>[p.n,Math.round(dist(p.x,p.z,P.x,P.z))]).sort((a,b)=>a[1]-b[1])[0],hp:S.hp})"))
    await pg.screenshot(path=os.path.join(OUT,'respawn.jpg'),type='jpeg',quality=85)
