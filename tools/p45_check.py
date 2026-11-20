# 45차 검사: 가방 창 원래 크기·자리 · 조이스틱은 제자리·보이지만 모든 창 뒤 · 관리자 모드 창 스크롤(가방 → 관리자 창으로 바로 가도)
# 진짜 터치(CDP). 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};P.x=VIL.x+18;P.z=VIL.z+14;unstuck();P.yv=undefined;S.quick[S.sel]=null}")
    await pg.wait_for_timeout(500)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    async def rect(sel): return await ev("s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height,r.x,r.y]}",sel)
    async def tap(c,i=4): await T('touchStart',[(i,c[0],c[1])]);await pg.wait_for_timeout(60);await T('touchEnd',[(i,c[0],c[1])]);await pg.wait_for_timeout(350)
    async def swipe(c,dy,i=5):   # 손가락으로 위로 밀기(스크롤)
        await T('touchStart',[(i,c[0],c[1])]);await pg.wait_for_timeout(30)
        for k in range(1,11): await T('touchMove',[(i,c[0],c[1]-dy*k/10)]);await pg.wait_for_timeout(16)
        await T('touchEnd',[(i,c[0],c[1]-dy)]);await pg.wait_for_timeout(500)
    ov=lambda a,b: not (a[4]+a[2]<=b[4]+1 or b[4]+b[2]<=a[4]+1 or a[5]+a[3]<=b[5]+1 or b[5]+b[3]<=a[5]+1)
    BEHIND="()=>{const r=document.getElementById('rjoy'),j=document.getElementById('joy'),p=document.getElementById('panel'),sh=document.getElementById('shade');const bef=(a,b)=>!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);return JSON.stringify({r:bef(r,sh)&&bef(r,p),j:bef(j,sh)&&bef(j,p),z:[getComputedStyle(r).zIndex,getComputedStyle(j).zIndex,getComputedStyle(p).zIndex]})}"
    res={}
    # 1. 가방: 원래 크기·자리(가로 = 오른쪽에 붙은 넓은 창, 세로 = 아래 절반), 칸이 큼, 조이스틱은 제자리·보이고 창 뒤, 가려진 오른쪽 조이스틱 자리를 눌러도 조준 안 됨, ✕로 닫기
    for nm,(w,h) in [('land',(844,390)),('port',(390,844))]:
        await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(800)
        r0=await rect('#rjoy');j0=await rect('#joy')
        await tap(await rect('#bBag'));pn=await rect('#panel');r=await rect('#rjoy');j=await rect('#joy')
        want=await ev("()=>{const k=innerWidth/VW,port=VW<=VH;let q;if(port){const h=Math.round(clamp(VH*.5,300,560));q=[10,VH-h-10,VW-20,h]}else{const w=Math.round(clamp(VW*.48,360,540));q=[VW-w-12,12,w,VH-24]}return q.map(v=>Math.round(v*k))}")   # 원래(43차 전) 식, 화면 px로
        vis=await ev("()=>getComputedStyle(document.getElementById('rjoy')).visibility+'/'+getComputedStyle(document.getElementById('joy')).display")
        cells=await ev("()=>[...document.querySelectorAll('#pbody .grid>*')].map(e=>Math.round(e.getBoundingClientRect().width))")
        beh=json.loads(await ev(BEHIND))
        await pg.screenshot(path=O(f'p45_bag_{nm}.jpg'),type='jpeg',quality=85)
        covered=ov(r,pn);hit=None
        if covered:   # 가방이 덮은 오른쪽 조이스틱 자리를 눌러도 조이스틱은 안 잡혀요(가방이 받아요)
            await T('touchStart',[(6,r[0],r[1])]);await pg.wait_for_timeout(60)
            for k in range(1,6): await T('touchMove',[(6,r[0]+k*10,r[1]-k*4)]);await pg.wait_for_timeout(20)
            hit=await ev("()=>JSON.stringify({id:RJ.id,aim:RJ.aim,panel})");await T('touchEnd',[(6,r[0]+50,r[1]-20)]);await pg.wait_for_timeout(300);hit=json.loads(hit)
        await tap(await rect('#pclose'));after=await ev("()=>panel");await pg.wait_for_timeout(900);r2=await rect('#rjoy');j2=await rect('#joy')   # 왼쪽 조이스틱이 내려오는 움직임(.18s)이 헤드리스에선 느려요
        same=lambda a,b: abs(a[4]-b[4])<1 and abs(a[5]-b[5])<1
        R={'panel':[round(v) for v in pn[4:6]+pn[2:4]],'want':want,'cell':min(cells) if cells else 0,'vis':vis,'behind':beh,'rSame':same(r,r0) and same(r2,r0),'covered':covered,'hit':hit,'closed':after,'jBack':same(j2,j0),'j':[round(v) for v in j0[4:6]+j2[4:6]]}
        R['geo']=all(abs(a-b)<=1 for a,b in zip(R['panel'],want))
        if nm=='port': R['jAbove']=j[5]+j[3]<=pn[5]+1   # 세로 화면: 왼쪽 조이스틱은 원래처럼 가방 위로
        else: R['jFree']=not ov(j,pn)
        R['ok']=R['geo'] and R['cell']>=56 and vis=='visible/block' and beh['r'] and beh['j'] and R['rSame'] and after is None and R['jBack'] and (not covered or (hit['id'] is None and not hit['aim'] and hit['panel']=='bag')) and R.get('jAbove',True) and R.get('jFree',True)
        res['bag_'+nm]=R
    # 2. 상자 창: 오른쪽 조이스틱이 [모두 가져가기]보다 뒤(창이 위에 그려짐) — 가로·세로
    for nm,(w,h) in [('land',(844,390)),('port',(390,844))]:
        await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(800)
        await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const s=structs.filter(q=>q.t==='supply').sort((a,b)=>dist(a.x,a.z,VIL.x,VIL.z)-dist(b.x,b.z,VIL.x,VIL.z))[0];
          P.x=s.x;P.z=s.z+sdef(s).bz+.7;P.rot=Math.PI;P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(300)}""")
        await tap(await rect('#rjoy'));await pg.wait_for_timeout(300)
        pnl=await ev("()=>panel");btn=await rect('[data-a=boxall]');r=await rect('#rjoy');beh=json.loads(await ev(BEHIND))
        top=await ev("([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.closest('[data-a=boxall]')?'button':e.id||e.className):null}",[btn[0],btn[1]])
        await pg.screenshot(path=O(f'p45_box_{nm}.jpg'),type='jpeg',quality=85)
        await ev("()=>closePanel()");await pg.wait_for_timeout(300)
        R={'panel':pnl,'overlap':bool(btn and ov(btn,r)),'behind':beh,'top':top};R['ok']=pnl=='box' and beh['r'] and top=='button';res['box_'+nm]=R
    await pg.set_viewport_size({'width':844,'height':390});await pg.wait_for_timeout(800)
    # 3. 관리자 모드 창 스크롤: 아이템 창(바로 / 가방을 연 채 관리자 버튼으로), 표시한 곳 목록
    await ev("()=>{DEV.on=true;DEV.marks=[];for(let i=0;i<24;i++)DEV.marks.push({x:400+i,z:500,t:0,n:i+1,isl:'초승달 본섬',memo:''});devHud()}");await pg.wait_for_timeout(300)
    async def devScroll(d,fromBag):
        if fromBag: await tap(await rect('#bBag'))
        if fromBag=='x': await tap(await rect('#pclose'))   # 가방을 ✕로 닫고 나서
        b=await rect(f'[data-d={d}]');await tap(b)
        pnl=await ev("()=>panel");pb=await rect('#pbody')
        st=await ev("()=>{const B=document.getElementById('pbody');B.scrollTop=0;return JSON.stringify({ov:getComputedStyle(B).overflowY,sh:B.scrollHeight,ch:B.clientHeight})}")
        await swipe([pb[0],pb[5]+pb[3]*.8],pb[3]*.5)
        top=await ev("()=>document.getElementById('pbody').scrollTop")
        await ev("()=>closePanel()");await pg.wait_for_timeout(250)
        Q=json.loads(st);Q.update({'panel':pnl,'scrollTop':round(top)});Q['ok']=Q['ov']=='auto' and Q['sh']>Q['ch']+40 and top>30;return Q
    want={'item':'devitem','list':'dev'}
    for d in ['item','list']:
        for fb in [False,True,'x']:
            Q=await devScroll(d,fb);Q['ok']=Q['ok'] and Q['panel']==want[d];res[f'dev_{d}'+{False:'',True:'_fromBag','x':'_afterBagX'}[fb]]=Q
    # 4. 가방 도감은 스크롤, 인벤토리는 스크롤 없음(38차 그대로) — 관리자 창 갔다 와도
    await tap(await rect('#bBag'));ovInv=await ev("()=>getComputedStyle(document.getElementById('pbody')).overflowY")
    await ev("()=>{BAGT.t='dex';renderPanel()}");ovDex=await ev("()=>getComputedStyle(document.getElementById('pbody')).overflowY")
    await ev("()=>{BAGT.t='inv';closePanel();DEV.on=false;DEV.marks=[];devHud()}")
    res['bagScroll']={'inv':ovInv,'dex':ovDex,'ok':ovInv=='hidden' and ovDex=='auto'}
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
