# 36차 검사: 보급 상자 창 — 열어도 바로 안 먹음 · 상자 20칸 + 내 가방 20칸 · 누르면 내 가방으로 · 가방 → 상자 안 됨 · 꽉 차면 안 가져옴 · 모두 가져가기 · 남은 건 그대로 · 며칠 뒤 다시 채움
# 진짜 터치(pg.touchscreen.tap으로 칸 누르기). 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.quick[S.sel]=null}")
    await pg.wait_for_timeout(300)
    res={}
    async def tapSel(sel):
        r=await ev("(q)=>{const e=document.querySelector(q);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}",sel)
        if r: await pg.touchscreen.tap(r[0],r[1]);await pg.wait_for_timeout(250)
        return r
    INV="()=>JSON.stringify({inv:Object.assign({},S.inv),coins:S.coins})"
    # 1. 보급 상자 앞에 바짝 서서 [열기] → 창만 열리고 가방은 그대로
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const s=structs.filter(q=>q.t==='supply').sort((a,b)=>dist(a.x,a.z,VIL.x,VIL.z)-dist(b.x,b.z,VIL.x,VIL.z))[0];window._bx36=s;
      P.x=s.x;P.z=s.z+sdef(s).bz+.7;P.rot=Math.PI;P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);await sl(300);const lab=target&&target.lab,i0=JSON.stringify(S.inv),c0=S.coins;
      await sl(50);return JSON.stringify({lab,i0,c0})}""")
    R=json.loads(r)
    await tapSel('#rjoy');await pg.wait_for_timeout(600)
    r=await ev("""()=>{const b=S.box[_bx36.li],g=document.querySelectorAll('#pbody .bxg');return JSON.stringify({panel,inv:JSON.stringify(S.inv),coins:S.coins,n:b?b.c.length:0,items:b?b.c.filter(Boolean):[],boxCells:g[0]?g[0].children.length:0,bagCells:g[1]?g[1].children.length:0,all:!!document.querySelector('[data-a=boxall]'),title:document.getElementById('ptabs').textContent})}""")
    Q=json.loads(r);res['open']={'lab':R['lab'],'panel':Q['panel'],'same':Q['inv']==R['i0'] and Q['coins']==R['c0'],'n':Q['n'],'items':Q['items'],'cells':[Q['boxCells'],Q['bagCells']],'all':Q['all'],'title':Q['title'],
      'ok':R['lab']=='열기' and Q['panel']=='box' and Q['inv']==R['i0'] and Q['n']==20 and 1<=len(Q['items'])<=6 and Q['boxCells']==20 and Q['bagCells']==20 and Q['all']}
    print('open',json.dumps(res['open'],ensure_ascii=False))
    await pg.screenshot(path=O('p36_box.jpg'),type='jpeg',quality=88)
    # 2. 상자 칸 누르기 → 그 묶음이 가방으로, 칸이 비어요
    first=await ev("()=>{const b=S.box[_bx36.li];const i=b.c.findIndex(Boolean);return [i,b.c[i][0],b.c[i][1]]}")
    k0=await ev(f"()=>'{first[1]}'==='coin'?S.coins:invN('{first[1]}')")
    await tapSel(f"#pbody [data-a=boxget][data-i='{first[0]}']")
    r=await ev(f"()=>JSON.stringify({{got:('{first[1]}'==='coin'?S.coins:invN('{first[1]}'))-{k0},slot:S.box[_bx36.li]&&S.box[_bx36.li].c[{first[0]}],panel}})")
    Q=json.loads(r);Q['want']=first[2];Q['ok']=Q['got']==first[2] and Q['slot'] is None;res['take']=Q
    # 3. 내 가방 칸을 눌러도 상자로 안 감
    await ev("()=>{give('wood',5);renderPanel()}");await pg.wait_for_timeout(200)
    await ev("()=>{window._b0=JSON.stringify(S.box[_bx36.li].c)}");w0=await ev("()=>invN('wood')")
    await tapSel("#pbody .bxg.mine [data-a=boxmine][data-k=wood]")
    r=await ev(f"()=>JSON.stringify({{same:JSON.stringify(S.box[_bx36.li].c)===_b0,wood:invN('wood'),msg:document.querySelector('#pbody .bxm').textContent,panel}})")
    Q=json.loads(r);Q['ok']=Q['same'] and Q['wood']==w0 and '옮길 수 없어요' in Q['msg'];res['noPutBack']=Q
    # 4. 가방이 꽉 차면: 새 종류는 안 가져와짐 / 이미 있는 종류는 가져와짐
    r=await ev("""()=>{const b=S.box[_bx36.li];closePanel();
      b.c=Array(20).fill(null);b.c[3]=['ore_iron',4];b.c[11]=['coal',5];b.c[17]=['coin',50];   /* 시험용으로 상자 내용을 정해요 */
      for(const k of Object.keys(S.inv))if(S.inv[k]>0&&k!=='coal')delete S.inv[k];S.inv.coal=1;const pool=Object.keys(ITEMS).filter(k=>!['ore_iron','coal','coin'].includes(k)&&ITEMS[k].ty!=='kit');
      for(const k of pool){if(bagList().length>=BAG_N)break;S.inv[k]=1}target=findTarget();inp.actEdge=true;interact();inp.actEdge=false;return JSON.stringify({kinds:bagList().length,panel})}""")
    F=json.loads(r)
    await tapSel("#pbody [data-a=boxget][data-i='3']")
    r1=await ev("()=>JSON.stringify({ore_iron:invN('ore_iron'),slot:!!S.box[_bx36.li].c[3],msg:document.querySelector('#pbody .bxm').textContent})")
    c0=await ev("()=>S.coins");await tapSel("#pbody [data-a=boxget][data-i='11']");await tapSel("#pbody [data-a=boxget][data-i='17']")
    r2=await ev(f"()=>JSON.stringify({{coal:invN('coal'),coins:S.coins-{c0},left:S.box[_bx36.li].c.filter(Boolean).map(e=>e[0]),panel}})")
    A=json.loads(r1);B=json.loads(r2)
    res['full']={'kinds':F['kinds'],'newKind':A,'same+coin':B,'ok':F['kinds']==20 and A['ore_iron']==0 and A['slot'] and '꽉 찼어요' in A['msg'] and B['coal']==6 and B['coins']==50 and B['left']==['ore_iron'] and B['panel']=='box'}
    await pg.screenshot(path=O('p36_full.jpg'),type='jpeg',quality=88)
    # 5. 모두 가져가기(꽉 찬 채) → 남은 것 그대로 + 안내 / 닫고 다시 열면 그대로 / 라벨은 [열기]
    await tapSel("#pbody [data-a=boxall]")
    r=await ev("()=>JSON.stringify({left:S.box[_bx36.li].c.filter(Boolean).map(e=>e[0]),msg:document.querySelector('#pbody .bxm').textContent,panel})")
    A=json.loads(r)
    await ev("()=>closePanel()");await pg.wait_for_timeout(300)
    lab=await ev("()=>{target=findTarget();return target&&target.lab}")
    await tapSel('#rjoy');await pg.wait_for_timeout(500)
    re=await ev("()=>JSON.stringify({panel,left:S.box[_bx36.li].c.filter(Boolean).map(e=>e[0])})")
    B=json.loads(re)
    res['allFull']={'after':A,'lab':lab,'reopen':B,'ok':A['left']==['ore_iron'] and '남았어요' in A['msg'] and lab=='열기' and B['panel']=='box' and B['left']==['ore_iron']}
    # 6. 칸을 비우고 모두 가져가기 → 다 가져오고 창이 닫힘, 라벨 없음, 열린 상자 모양
    await ev("()=>{delete S.inv[bagList().find(k=>k!=='coal'&&k!=='wood')];renderPanel()}");await pg.wait_for_timeout(200)
    await tapSel("#pbody [data-a=boxall]");await pg.wait_for_timeout(300)
    r=await ev("()=>{target=findTarget();return JSON.stringify({panel,ore_iron:invN('ore_iron'),left:S.box[_bx36.li]?S.box[_bx36.li].c.filter(Boolean).length:-1,lab:target&&target.s===_bx36?target.lab:null,openGeo:_bx36.m.children[0].geometry===GEO[sdef(_bx36).og||'crate_open'],toast:document.getElementById('toast').textContent})}")
    Q=json.loads(r);Q['ok']=Q['panel'] is None and Q['ore_iron']==4 and Q['left']==0 and Q['lab'] is None and Q['openGeo'];res['takeAll']=Q
    # 7. 저장에 남은 상자 / 3일 뒤 다시 채워짐(새 내용)
    r=await ev("""()=>{S.box[_bx36.li].c[5]=['wood',2];save();const d=JSON.parse(localStorage.getItem(SAVE));const kept=!!(d.S.box&&d.S.box[_bx36.li]&&d.S.box[_bx36.li].c[5]);
      S.box[_bx36.li].c[5]=null;S.day+=3;target=findTarget();const lab=target&&target.s===_bx36?target.lab:null;inp.actEdge=true;interact();inp.actEdge=false;const b=S.box[_bx36.li];return JSON.stringify({kept,lab,panel,fresh:b&&b.d===S.day&&b.c.filter(Boolean).length>0})}""")
    Q=json.loads(r);Q['ok']=Q['kept'] and Q['lab']=='열기' and Q['panel']=='box' and Q['fresh'];res['refill']=Q
    await ev("()=>closePanel()")
    # 8. 특수 보급 상자·보물 상자도 같은 창(바로 안 먹음)
    out={}
    for t in ['spsupply','chest']:
        r=await ev(f"""async()=>{{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(const k of Object.keys(S.inv))if(!['wood','coal'].includes(k))delete S.inv[k];const s=structs.find(q=>q.t==='{t}');if(!s)return null;
          let mg=9,mx=0,mz=0;for(let x=s.x-3;x<=s.x+3;x+=.15)for(let z=s.z-3;z<=s.z+3;z+=.15){{if(walk(x,z,.42,P)!==null||waterDepth(x,z)>DEEP-.05)continue;const g=sGap(x,z,s);if(g<mg){{mg=g;mx=x;mz=z}}}}
          P.x=mx;P.z=mz;P.rot=Math.atan2(s.x-mx,s.z-mz);P.yv=undefined;await sl(200);target=findTarget();const lab=target&&target.lab,c0=S.coins,i0=JSON.stringify(S.inv);inp.actEdge=true;interact();inp.actEdge=false;
          const b=S.box[s.li];const r={{lab,panel,same:c0===S.coins&&i0===JSON.stringify(S.inv),kinds:b?b.c.filter(Boolean).length:0,title:document.getElementById('ptabs').textContent}};document.querySelector('#pbody [data-a=boxall]').click();await sl(200);r.after=panel;r.coins=S.coins-c0;r.got=bagList().length;return JSON.stringify(r)}}""")
        out[t]=json.loads(r) if r else None
    sp=out['spsupply'];ch=out['chest']
    res['others']={'spsupply':sp,'chest':ch,'ok':bool(sp) and sp['lab']=='열기' and sp['panel']=='box' and sp['same'] and sp['kinds']>=4 and sp['after'] is None and sp['coins']>=400 and (ch is None or (ch['panel']=='box' and ch['same'] and ch['after'] is None))}
    # 9. 세로 화면 사진
    await ev("()=>{const s=_bx36;S.box[s.li]={d:S.day,c:Array(20).fill(null)};S.box[s.li].c[2]=['ammoS',12];S.box[s.li].c[9]=['ore_iron',1];S.box[s.li].c[14]=['coal',4];P.x=s.x;P.z=s.z+sdef(s).bz+.7;P.rot=Math.PI}")
    await pg.set_viewport_size({'width':400,'height':860});await pg.wait_for_timeout(1000)
    await ev("()=>{target=findTarget();inp.actEdge=true;interact();inp.actEdge=false}");await pg.wait_for_timeout(500)
    r=await ev("()=>{const p=document.getElementById('panel').getBoundingClientRect(),g=[...document.querySelectorAll('#pbody .bxg')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}),bt=document.querySelector('[data-a=boxall]').getBoundingClientRect();return JSON.stringify({panel,g,btnVisible:bt.bottom<=innerHeight&&bt.top>=0,stack:g.length==2&&g[1][1]>g[0][1]+g[0][3]-4})}")
    Q=json.loads(r);Q['ok']=Q['panel']=='box' and Q['stack'] and Q['btnVisible'];res['portrait']=Q
    await pg.screenshot(path=O('p36_port.jpg'),type='jpeg',quality=88)
    await pg.set_viewport_size({'width':880,'height':400});await pg.wait_for_timeout(800)
    r=await ev("()=>{const bt=document.querySelector('[data-a=boxall]');if(!bt)return null;const r=bt.getBoundingClientRect(),g=[...document.querySelectorAll('#pbody .bxg')].map(e=>{const q=e.getBoundingClientRect();return [Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)]});return JSON.stringify({btnVisible:r.bottom<=innerHeight&&r.top>=0,g,side:g.length==2&&Math.abs(g[0][1]-g[1][1])<4})}")
    Q=json.loads(r) if r else {'btnVisible':False};Q['ok']=Q.get('btnVisible') and Q.get('side');res['landscape']=Q
    await pg.screenshot(path=O('p36_land.jpg'),type='jpeg',quality=88)
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
