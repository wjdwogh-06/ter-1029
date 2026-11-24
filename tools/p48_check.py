# 48차 검사: 시작 100원+낚싯대만 · 없앤 등대 둘레 낚시 포인트 없음 · 설치 돌리기 3방향 · 항구마다 생선 상인(일반·희귀 제값)·가운데 보급상 없음
#            · 고래(바다 길·150초 중 120초 숨고 30초 보임) · 가방 [🧍 장비] 탭(캐릭터 보기·칸 다섯·끼기/빼기/바꾸기·꽉 차면 못 뺌)
# 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    def put(k,r):
        res[k]=r;print(k,json.dumps(r,ensure_ascii=False)[:600])
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;DEV.god=true;window.updSpawns=()=>{};enemies.slice().forEach(dropEnemy)}")
    await pg.wait_for_timeout(600)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    async def rect(sel): return await ev("s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,r.width,r.height,r.x,r.y]}",sel)
    async def tap(c,i=4): await T('touchStart',[(i,c[0],c[1])]);await pg.wait_for_timeout(60);await T('touchEnd',[(i,c[0],c[1])]);await pg.wait_for_timeout(350)
    # 1. 시작 소지품
    r=json.loads(await ev("()=>{const f=freshState(1);return JSON.stringify({inv:f.inv,coins:f.coins,quick:f.quick.filter(Boolean)})}"))
    r['ok']=r['inv']=={'rod':1} and r['coins']==100 and r['quick']==[];put('start',r)
    # 2. 없앤 등대 둘레 낚시 포인트 없음
    r=json.loads(await ev("()=>{const near=i=>FSP.filter(s=>dist(s.x,s.z,LHS[i].x,LHS[i].z)<45).length;return JSON.stringify({n:FSP.length,a:FISH_PTS_A.length,n0:near(0),n4:near(4),n1:near(1)})}"))
    r['ok']=r['n']==76 and r['a']==12 and r['n0']==0 and r['n4']==0 and r['n1']>0;put('fishpts',r)
    # 3. 돌리기 3방향(텐트 포함) · 텐트 안 작업대도
    r=json.loads(await ev("""()=>{give('kit_tent',2);P.x=VIL.x+40;P.z=VIL.z+30;unstuck();let spot=null;for(let a=0;a<60&&!spot;a++){const x=P.x+Math.cos(a)*(8+a*.4),z=P.z+Math.sin(a)*(8+a*.4);P.x=x;P.z=z;if(walk(x,z,.42,P)!==null)continue;setBuild('ptent');const g=ghostPos();if(g.ok)spot=[x,z];setBuild(null)}
      setBuild('ptent');const rs=[],lab=[];for(let i=0;i<4;i++){rs.push(+ghostPos().r.toFixed(3));lab.push(document.querySelector('#bbar [data-b=rot]').textContent);rotNext()}
      setBuild(null);setBuild('ptent');const r0=ghostPos().r;rotNext();const g=ghostPos();placeBuild();const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();setBuild(null);
      return JSON.stringify({rs,lab,reset:r0,placed:!!t,tr:t&&+t.r.toFixed(3),ok:g.ok,why:g.why,zr:t&&+zoneRect(t.x,t.z,t.r).r?.toFixed?.(3)})}"""))
    A=round(3.14159265/6,3)
    r['ok']=r['rs']==[0,-A,A,0] and r['lab'][0].endswith('정면') and r['lab'][1].endswith('왼쪽 사선') and r['lab'][2].endswith('오른쪽 사선') and r['reset']==0 and r['placed'] and r['tr']==-A
    put('rotate',r)
    await ev("()=>{const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();const c=t,d=sdef(c);P.x=c.x+Math.sin(c.r)*(d.bz+.7);P.z=c.z+Math.cos(c.r)*(d.bz+.7);P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(700);await pg.screenshot(path=O('p48_tent_rot.jpg'),type='jpeg',quality=85)
    await ev("()=>{const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();target={k:'s',s:t,x:t.x,z:t.z,lab:'들어가기'};inp.actEdge=true;interact();inp.actEdge=false}")
    for i in range(40):
        if await ev("()=>INT.on&&!busy"): break
        await pg.wait_for_timeout(200)
    r=json.loads(await ev("""()=>{give('kit_bench',1);setBuild('bench');rotNext();const g=ghostPos();const o={on:INT.on,r:+g.r.toFixed(3),ok:g.ok,why:g.why,in:g.in};if(g.ok)placeBuild();const b=structs.find(s=>s.t==='bench'&&s.in);o.placed=!!b;o.br=b&&+(b.r||0).toFixed(3);setBuild(null);
      const t=INT.s;intOut();o.ret=+dist(P.x,P.z,t.x+Math.sin(t.r)*(sdef(t).bz+1.1),t.z+Math.cos(t.r)*(sdef(t).bz+1.1)).toFixed(2);return JSON.stringify(o)}"""))
    r['ok']=r['on'] and r['r']==-A and r['placed'] and r['br']==-A and r['ret']<.05;put('rotateIn',r)
    # 4. 생선 상인: 항구 8곳 · 자판기 옆 · 겹침 없음 · 앞에서 닿음(낚싯대 들어도) · 가운데 보급상 없음 · 일반·희귀만 제값
    r=json.loads(await ev("""()=>{const o={n:0,far:[],ov:[],reach:[]};const fb=structs.filter(s=>s.t==='fbuy');o.n=fb.length;o.ports=[...new Set(fb.map(s=>s.pi))].length;
      for(const s of fb){const v=structs.find(q=>q.t==='vend'&&q.pi===s.pi);if(!v||dist(v.x,v.z,s.x,s.z)>15)o.far.push(s.pi);
       for(const q of structs){if(q===s||q.t==='fbuy_npc'||sdef(q).pass||dist(q.x,q.z,s.x,s.z)>8)continue;const a=sdef(s),b=sdef(q);if(Math.abs(q.x-s.x)<a.bx+b.bx&&Math.abs(q.z-s.z)<a.bz+b.bz)o.ov.push([s.pi,q.t])}
       P.x=s.x;P.z=s.z+sdef(s).bz+.7;P.rot=Math.PI;const w=walk(P.x,P.z,.42,P);S.quick[S.sel]=null;target=findTarget();const l1=target&&target.lab;give('rod',1);S.quick[S.sel]='rod';target=findTarget();const l2=target&&target.lab;S.quick[S.sel]=null;o.reach.push([s.pi,w===null,l1,l2])}
      const m=structs.find(q=>q.t==='market');o.market=m?sLabel(m):'none';o.merch=[merchant.x,merchant.a.root.visible];return JSON.stringify(o)}"""))
    r['ok']=r['n']==8 and r['ports']==8 and not r['far'] and not r['ov'] and all(q[1] and q[2]=='생선 팔기' and q[3]=='생선 팔기' for q in r['reach']) and r['market'] is None and r['merch'][1] is False
    put('merchants',r)
    await ev("()=>{const s=structs.find(q=>q.t==='fbuy'&&q.pi===0);P.x=s.x+.3;P.z=s.z+sdef(s).bz+2.2;P.rot=Math.PI;P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    for i in range(6): await ev("()=>{updPlayer(.05)}")
    await pg.wait_for_timeout(800);await pg.screenshot(path=O('p48_merchant.jpg'),type='jpeg',quality=85)
    r=json.loads(await ev("""()=>{for(const k of['f_herring','f_jelly','f_sword','f_hammer','cf_herring'])if(ITEMS[k])give(k,2);const c0=S.coins;const s=structs.find(q=>q.t==='fbuy'&&q.pi===0);P.x=s.x;P.z=s.z+sdef(s).bz+.7;S.quick[S.sel]=null;target=findTarget();inp.actEdge=true;interact();inp.actEdge=false;
      const o={panel:panel,rows:[...document.querySelectorAll('#pbody [data-a=fsell][data-n]')].map(b=>b.dataset.k).filter((v,i,a)=>a.indexOf(v)===i)};document.querySelector('#pbody [data-a=fsell][data-k="*"]').click();
      o.got=S.coins-c0;o.want=2*ITEMS.f_herring.p+2*ITEMS.f_jelly.p;o.left=['f_herring','f_jelly','f_sword','f_hammer'].map(k=>invN(k));o.empty=document.querySelector('#pbody').textContent.includes('팔 물고기가 없어요');closePanel();return JSON.stringify(o)}"""))
    r['ok']=r['panel']=='fishbuy' and sorted(r['rows'])==['f_herring','f_jelly'] and r['got']==r['want'] and r['left']==[0,0,2,2] and r['empty'];put('fishSell',r)
    # 5. 고래: 길은 모두 깊은 바다·등대 6곳 둘레 · 150초 중 30초 보임 · 보일 때 물 위, 숨을 땐 안 보임
    r=json.loads(await ev("""()=>{const o={};o.n=WH.path.length;o.len=Math.round(WH.len);o.maxH=+Math.max(...WH.path.map(p=>hAt(p[0],p[1]))).toFixed(2);
      o.nearLH=WH.lh.map(l=>Math.round(Math.min(...WH.path.map(p=>dist(p[0],p[1],l.x,l.z)))));o.gone=LH_GONE.map(i=>Math.round(Math.min(...WH.path.map(p=>dist(p[0],p[1],LHS[i].x,LHS[i].z)))));
      let vis=0;for(let t=0;t<1500;t++)if(whState(t).vis)vis++;o.visFrac=vis/1500;o.st=[whState(10).vis,whState(119.9).vis,whState(121).vis,whState(149.9).vis];o.lap=Math.round(WH.len/WH.sp/60);return JSON.stringify(o)}"""))
    r['ok']=r['maxH']<-1 and all(20<=d<=70 for d in r['nearLH']) and abs(r['visFrac']-.2)<.01 and r['st']==[False,False,True,True];put('whale',r)
    await ev("()=>{const T0=Math.ceil(Date.now()/1000/150)*150+132;window._dn=Date.now;Date.now=()=>T0*1000;const p=whAt(T0*WH.sp);let best=null;for(let a=0;a<64;a++)for(let rr=8;rr<40;rr+=2){const x=p.x+Math.cos(a/64*6.28)*rr,z=p.z+Math.sin(a/64*6.28)*rr;if(hAt(x,z)>.4&&(!best||rr<best[2]))best=[x,z,rr]}if(best){P.x=best[0];P.z=best[1]}else{P.x=p.x;P.z=p.z+10}P.yv=undefined;updCamera(0,(P.x+p.x)/2,0,(P.z+p.z)/2,true)}")
    for i in range(10): await ev("()=>updEnv(.05,P.x,P.z)")
    await pg.wait_for_timeout(900)
    r=json.loads(await ev("()=>{const o={vis:WH.m.visible,y:+WH.m.position.y.toFixed(2),d:Math.round(dist(P.x,P.z,WH.m.position.x,WH.m.position.z))};return JSON.stringify(o)}"))
    await pg.screenshot(path=O('p48_whale.jpg'),type='jpeg',quality=85)
    r2=json.loads(await ev("()=>{const T1=(Math.ceil(_dn()/1000/150)*150+40)*1000;Date.now=()=>T1;updEnv(.05,P.x,P.z);const o={hid:!WH.m.visible};Date.now=_dn;return JSON.stringify(o)}"))
    r.update(r2);r['ok']=r['vis'] and -.5<r['y']<.6 and r['hid'];put('whaleShow',r)
    await ev("()=>{P.x=VIL.x+6;P.z=VIL.z+8;unstuck();P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    # 6. 가방 장비 칸: 끼기·바꾸기·빼기, 가방 20칸에서 빠짐, 꽉 차면 못 뺌(바꾸기는 됨), 장비 탭 칸 다섯·캐릭터 보기
    for nm,(w,h) in [('land',(844,390)),('port',(390,844))]:
        await pg.set_viewport_size({'width':w,'height':h});await pg.wait_for_timeout(800)
        r=json.loads(await ev("""()=>{for(const k of Object.keys(S.inv))delete S.inv[k];S.quick=[null,null,null,null,null,null];S.eq={hat:null,bag:null,ammo:null,shoes:null};give('rod',1);give('pistol',1);give('ammoS',24);give('arrow',5);openPanel('bag');BAGT.t='inv';renderPanel();
      const o={};const cnt=()=>bagList().length;o.c0=cnt();bagTap('rod');o.gear1=curId();o.c1=cnt();o.inBag1=bagList().includes('rod');bagTap('pistol');o.gear2=curId();o.rodBack=bagList().includes('rod');o.c2=cnt();
      bagTap('ammoS');o.ammo=S.eq.ammo;o.c3=cnt();bagTap('arrow');o.ammo2=S.eq.ammo;o.ammoSBack=bagList().includes('ammoS');
      const fill=['wood','stone','scrap','plank','bulb','salt','pepper','powder','fuel','copper','mparts','f_herring','f_salmon','f_trout','f_anch','f_flying','f_tuna','f_jelly','f_sword','f_hammer'];for(const k of fill){if(ITEMS[k]&&bagList().length<BAG_N)give(k,1)}o.full=cnt();
      eqOff('gear');o.offFull=curId();give('axe',1);o.axeIn=bagList().includes('axe');return JSON.stringify(o)}"""))
        r2=json.loads(await ev("""()=>{const o={};const c=bagList().length;o.c=c;o.hasAxe=bagList().includes('axe');if(o.hasAxe){bagTap('axe');o.swap=curId();o.c2=bagList().length;o.pistolBack=bagList().includes('pistol')}
      for(const k of bagList().slice()){if(['wood','stone','scrap'].includes(k))delete S.inv[k]}renderPanel();BAGT.t='eq';renderPanel();
      o.slots=[...document.querySelectorAll('#pbody [data-a=eqoff]')].map(e=>e.dataset.k);o.tab=!!document.querySelector('#ptabs [data-k=eq].on');o.gearName=document.querySelector('#pbody [data-k=gear] .eqn').textContent;return JSON.stringify(o)}"""))
        r.update(r2)
        await pg.wait_for_timeout(700)
        pv=json.loads(await ev("""()=>{const cv=document.getElementById('eqPv');if(!cv)return JSON.stringify({cv:false});const x=cv.getContext('2d'),d=x.getImageData(0,0,cv.width,cv.height).data;let n=0,bg=0;for(let i=0;i<d.length;i+=16){const dr=Math.abs(d[i]-243)+Math.abs(d[i+1]-233)+Math.abs(d[i+2]-214);if(dr>40)n++;else bg++}
          return JSON.stringify({cv:true,w:cv.width,h:cv.height,fg:+(n/(n+bg)).toFixed(3)})}"""))
        r['pv']=pv
        await pg.screenshot(path=O(f'p48_equip_{nm}.jpg'),type='jpeg',quality=85)
        c=await rect('#eqPv');y0=await ev("()=>PV.yaw")
        if c:
            await T('touchStart',[(5,c[0]-30,c[1])])
            for k in range(1,8): await T('touchMove',[(5,c[0]-30+k*12,c[1])]);await pg.wait_for_timeout(20)
            await T('touchEnd',[(5,c[0]+54,c[1])]);await pg.wait_for_timeout(300)
        r['yaw']=round((await ev("()=>PV.yaw"))-y0,2)
        g=await rect('#pbody [data-a=eqoff][data-k=gear]')
        await tap(g);r['afterOff']=await ev("()=>JSON.stringify({gear:curId(),inBag:bagList().includes('axe')})")
        await ev("()=>closePanel()")
        r['ok']=r['c0']==3 and r['gear1']=='rod' and r['c1']==3 and not r['inBag1'] and r['gear2']=='pistol' and r['rodBack'] and r['c2']==3 and r['ammo']=='ammoS' and r['c3']==2 and r['ammo2']=='arrow' and r['ammoSBack'] and r['full']==20 and r['offFull']=='pistol' and r['hasAxe'] is False and r['c']==20
        # axe could not enter a full bag (dropped as a sack) → swap test uses a free cell instead
        r['ok']=r['ok'] and r['slots']==['hat','bag','gear','ammo','shoes'] and r['tab'] and r['gearName']=='권총' and r['pv']['cv'] and r['pv']['fg']>.03 and abs(r['yaw'])>.3 and '"gear":"fist"' in r['afterOff'].replace(' ','')
        put('equip_'+nm,r)
    # 6-1. 꽉 찬 가방에서 바꾸기(새 총이 가방에서 나가고 옛 총이 들어옴)
    r=json.loads(await ev("""()=>{for(const k of Object.keys(S.inv))delete S.inv[k];S.quick=[null,null,null,null,null,null];give('pistol',1);bagTap('pistol');const fill=['wood','stone','scrap','plank','bulb','salt','pepper','powder','fuel','copper','mparts','f_herring','f_salmon','f_trout','f_anch','f_flying','f_tuna','f_jelly','f_sword'];for(const k of fill)if(ITEMS[k])give(k,1);
      give('axe',1);const o={c:bagList().length,axe:bagList().includes('axe')};if(o.axe){bagTap('axe');o.gear=curId();o.c2=bagList().length;o.pistol=bagList().includes('pistol')}openPanel('recycle');o.recyAxe=!!document.querySelector('#pbody [data-k=axe]');closePanel();eqOff('gear');o.offFull=curId();return JSON.stringify(o)}"""))
    r['ok']=r['c']==20 and r['axe'] and r['gear']=='axe' and r['c2']==20 and r['pistol'] and r['offFull']=='axe' and not r['recyAxe'];put('swapFull',r)
    print('ALL',all(v['ok'] for v in res.values()))
