# 24차: 없앤 아이템·설치물(북극곤들매기·무지개송어·모래주머니·가시 함정·탐조등) 검사
# 기대: gone 전부 false / zoneB 합 100·희귀 = 날치 18 / quests 14 / buildTab·menu에 이름 없음 / vend 0
#       예전 저장 흉내 → dropRemoved: 가방·상자·가방 더미·손 비움, 도감 기록 지움, 설치물 재료 돌려받음, 목표 번호 맞춤 / errs []
async def steps(pg):
    ev=pg.evaluate
    H="window.addEventListener('error',e=>{(window._E=window._E||[]).push(String(e.error&&e.error.stack||e.message).slice(0,500)+' @'+(e.target&&e.target.src||''))},true)"
    await pg.add_init_script(H);await ev("()=>{"+H+"}")
    print('gone',await ev("""()=>JSON.stringify({items:['f_char','cf_char','f_rainbow','cf_rainbow'].filter(k=>ITEMS[k]),builds:['sandbag','spike','slight'].filter(k=>BUILDS[k]),
      fish:FISH.filter(f=>['f_char','f_rainbow'].includes(f.id)).length,list:FISH_LIST.map(f=>f.n).join(','),vend:vendPool().filter(k=>/rainbow|char/.test(k)).length})"""))
    print('zoneB',await ev("()=>{const t=FISH_ZONES.B.t;return JSON.stringify({sum:t.reduce((a,q)=>a+q[1],0),rare:t.filter(q=>FISH.find(f=>f.id===q[0]).g===1),sumA:FISH_ZONES.A.t.reduce((a,q)=>a+q[1],0)})}"))
    print('roll',await ev("()=>{const n={};for(let i=0;i<40000;i++){const k=rollFish?rollFish('B'):null;if(k)n[k]=(n[k]||0)+1}return JSON.stringify(n)}") if await ev("()=>typeof rollFish==='function'") else 'roll skip')
    print('quests',await ev("()=>JSON.stringify({n:QUESTS.length,txt:QUESTS.filter(q=>/모래주머니|탐조등/.test(q.t)).length,qv:S.qv})"))
    await ev("()=>{openPanel('bag');const b=[...document.querySelectorAll('[data-tab],.tab')].find(e=>/건설/.test(e.textContent));if(b)b.click()}");await pg.wait_for_timeout(300)
    print('buildTab',await ev("()=>{const t=document.getElementById('pbody').textContent;return JSON.stringify({has:/모닥불/.test(t),bad:['모래주머니','가시 함정','탐조등'].filter(n=>t.includes(n)),gen:t.includes('발전기')})}"))
    await ev("()=>closePanel()")
    await ev("()=>{openPanel('menu')}");await pg.wait_for_timeout(300)
    print('menu',await ev("()=>{const t=document.getElementById('pbody').textContent;return JSON.stringify({fishDex:(t.match(/물고기 도감 \\d+ \\/ \\d+/)||[''])[0],bad:['무지개송어','곤들매기'].filter(n=>t.includes(n))})}"))
    await ev("()=>closePanel()")
    # 예전 저장 흉내: 없앤 것들을 여기저기 넣어 두고 dropRemoved
    print('migrate',await ev("""()=>{S.inv.f_rainbow=3;S.inv.cf_char=1;S.stash.f_char=2;S.bag={x:P.x+3,z:P.z,inv:{cf_rainbow:1}};S.quick[4]='cf_rainbow';S.caught.f_rainbow=2;S.best.f_rainbow=50;
      S.built.push({t:'spike',x:1,z:1,r:0},{t:'slight',x:2,z:2,r:0},{t:'sandbag',x:3,z:3,r:0},{t:'fire',x:4,z:4,r:0});const w0=invN('wood'),s0=invN('scrap'),c0=invN('cloth'),st0=invN('stone');
      S.qv=0;S.q=12;const got=dropRemoved();const q12=S.q;
      const q0=[];for(const q of [3,9,10,14,15,16]){S.qv=0;S.q=q;dropRemoved();q0.push(S.q)}S.q=q12;
      return JSON.stringify({got,inv:['f_rainbow','cf_char'].filter(k=>k in S.inv),stash:'f_char' in S.stash,bag:S.bag,quick:S.quick.includes('cf_rainbow'),caught:'f_rainbow' in S.caught,best:'f_rainbow' in S.best,
        built:S.built.map(b=>b.t),refund:{wood:invN('wood')-w0,scrap:invN('scrap')-s0,cloth:invN('cloth')-c0,stone:invN('stone')-st0},qmap:'3,9,10,14,15,16 → '+q0.join(','),q12,qNow:QUESTS[S.q]&&QUESTS[S.q].t,again:dropRemoved().length})}"""))
    # 새로 불러오기: 저장에 넣어 두고 다시 켜서 알림이 뜨는지
    print('E1',await ev("()=>JSON.stringify(window._E||[])"))
    await ev("()=>{S.inv.f_rainbow=2;save();const d=JSON.parse(localStorage.getItem(SAVE));d.S.built.push({t:'spike',x:P.x+30,z:P.z,r:0});d.S.q=12;delete d.S.qv;localStorage.setItem(SAVE,JSON.stringify(d));mode='title'}   /* 다시 켤 때 자동 저장이 덮어쓰지 않게 */")
    await pg.reload()
    for _ in range(60):
        await pg.wait_for_timeout(500)
        if await ev("()=>{try{return mode==='title'&&!!MAPC&&!document.getElementById('title').classList.contains('hide')}catch(e){return false}}"): break
    await ev("()=>document.getElementById('tCont').click()")
    for _ in range(30):
        await pg.wait_for_timeout(500)
        t=await ev("()=>document.getElementById('toast')?document.getElementById('toast').textContent:''")
        if '정리된 것' in t: break
    print('reload',await ev("()=>JSON.stringify({toast:document.getElementById('toast').textContent,inv:'f_rainbow' in S.inv,spike:structs.some(s=>s.t==='spike'),mode,q:S.q,qv:S.qv,E:window._E||[]})"))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
