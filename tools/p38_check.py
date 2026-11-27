# 38차 검사: 가방 — 열어도 카메라 그대로 · 인벤토리는 칸만(아래 글·스크롤 없음) · 위 탭 [인벤토리|도감] · 도감 안 물고기·요리·식물·사냥·설계도 · 요리·사냥 기록
# 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};P.x=VIL.x+18;P.z=VIL.z+14;unstuck();give('wood',8);give('stone',3)}")
    await pg.wait_for_timeout(500)
    res={}
    async def tapSel(sel):
        r=await ev("(q)=>{const e=document.querySelector(q);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}",sel)
        if r: await pg.touchscreen.tap(r[0],r[1]);await pg.wait_for_timeout(350)
        return r
    PROJ="()=>{_v.set(P.x,groundY(P.x,P.z)+1,P.z).project(cam);return [Math.round((_v.x*.5+.5)*innerWidth),Math.round((-_v.y*.5+.5)*innerHeight)]}"
    for vw,vh,nm in [(880,400,'land'),(400,860,'port')]:
        await pg.set_viewport_size({'width':vw,'height':vh});await pg.wait_for_timeout(1000)
        await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(1500)
        p0=await ev(PROJ);await tapSel('#bBag');await pg.wait_for_timeout(900)
        r=await ev("""()=>{const B=document.getElementById('pbody'),g=B.querySelector('.grid');const tabs=[...document.querySelectorAll('#ptabs [data-a=btab]')].map(t=>t.textContent);
          return JSON.stringify({panel,tabs,cells:g?g.children.length:0,kids:B.children.length,scroll:B.scrollHeight-B.clientHeight,ov:getComputedStyle(B).overflowY,view:!!(cam.view&&cam.view.enabled),txt:[...B.children].filter(x=>x!==g).map(x=>x.textContent).join('|')})}""")
        R=json.loads(r);p1=await ev(PROJ);R['moved']=[p1[0]-p0[0],p1[1]-p0[1]]
        await pg.screenshot(path=O(f'p38_inv_{nm}.jpg'),type='jpeg',quality=86)
        R['ok']=R['panel']=='bag' and len(R['tabs'])==3 and '인벤토리' in R['tabs'][0] and '도감' in R['tabs'][1] and '장비' in R['tabs'][2] and R['cells']==20 and R['kids']==1 and R['scroll']<=1 and not R['view'] and abs(R['moved'][0])<3 and abs(R['moved'][1])<3
        res['inv_'+nm]=R
        # 재료를 누르면 이름 알림, 아래 글은 그대로 없음
        await tapSel("#pbody [data-a=sel][data-k=wood]")
        r=await ev("()=>JSON.stringify({toast:document.getElementById('toast').textContent,kids:document.getElementById('pbody').children.length})")
        Q=json.loads(r);Q['ok']=Q['toast'].startswith('나무') and Q['kids']==1;res['tapRes_'+nm]=Q
        # 도감 탭 → 하위 탭 5개, 하나씩 눌러 보기
        await tapSel("#ptabs [data-a=btab][data-k=dex]")
        out={}
        for k in ['fish','cook','plant','hunt','bp']:
            await tapSel(f"#pbody [data-a=dext][data-k={k}]")
            out[k]=await ev("()=>{const B=document.getElementById('pbody');const s=B.querySelector('.sec');return (s?s.textContent:'')+' #'+B.querySelectorAll('.slot,.row').length}")
            if nm=='land' or k=='fish': await pg.screenshot(path=O(f'p38_dex_{k}_{nm}.jpg'),type='jpeg',quality=86)
        subs=await ev("()=>[...document.querySelectorAll('#pbody [data-a=dext]')].map(b=>b.textContent)")
        res['dex_'+nm]={'subs':subs,'out':out,'ok':len(subs)==5 and out['fish'].startswith('물고기 도감') and out['cook'].startswith('요리 도감') and out['plant'].startswith('식물 도감') and out['hunt'].startswith('사냥 도감') and '설계도' in out['bp']}
        await tapSel("#ptabs [data-a=btab][data-k=inv]")
        back=await ev("()=>document.querySelector('#pbody .grid')?document.querySelector('#pbody .grid').children.length:0")
        res['back_'+nm]={'cells':back,'ok':back==20}
        await ev("()=>closePanel()");await pg.wait_for_timeout(300)
        # 다시 열면 인벤토리부터
        await tapSel('#bBag');t=await ev("()=>BAGT.t");await ev("()=>closePanel()");res['reopen_'+nm]={'t':t,'ok':t=='inv'}
    await pg.set_viewport_size({'width':880,'height':400});await pg.wait_for_timeout(800)
    # 요리 도감: 모닥불에서 굽기 → 기록 / 사냥 도감: 적을 쓰러뜨리면 기록
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));give('f_trout',3);openPanel('cook');await sl(100);document.querySelector('[data-a=cook][data-k=f_trout][data-n="1"]').click();await sl(50);const t1=document.getElementById('toast').textContent;
      document.querySelector('[data-a=cook][data-k=f_trout][data-n="99"]').click();closePanel();const c=S.cdex&&S.cdex.cf_trout;
      const e=enemies.find(q=>!q.dead)||null;let k0=null,hk=0;if(typeof spawnEnemy==='function'){spawnEnemy('m86_toad',P.x+6,P.z)}const b=enemies.find(q=>!q.dead);if(b){k0=b.kind;killEnemy(b);hk=S.hdex[b.kind]}
      BAGT.t='dex';BAGT.d='cook';openPanel('bag');BAGT.t='dex';renderPanel();await sl(100);const cookSec=document.querySelector('#pbody .sec').textContent;BAGT.d='hunt';renderPanel();const huntSec=document.querySelector('#pbody .sec').textContent;closePanel();
      return JSON.stringify({c,t1,k0,hk,cookSec,huntSec})}""")
    Q=json.loads(r);Q['ok']=Q['c']==3 and '새 요리' in Q['t1'] and Q['cookSec'].startswith('요리 도감 1') and (Q['k0'] is None or (Q['hk']==1 and Q['huntSec'].startswith('사냥 도감 1')));res['records']=Q
    # 저장에 남음
    r=await ev("()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));return JSON.stringify({cdex:d.S.cdex,hdex:d.S.hdex})}")
    Q=json.loads(r);Q['ok']=bool(Q['cdex']) and Q['cdex'].get('cf_trout')==3;res['save']=Q
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
