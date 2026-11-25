# 79차 검사: 작살·설치형 미끼 삭제 · 겨울 추위 · 나무·바위 줄이기·겨울 광물 · 항구 일반 자판기 · 해달섬 산장 · 바람섬 가을
import json, os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};S.quick[S.sel]=null;DEV.on=false}")
    await pg.wait_for_timeout(300)
    # 1. 삭제
    r=await ev("""()=>{const o={};o.items=['harpoon','kit_baitbuoy'].filter(k=>ITEMS[k]);o.weap=!!WEAP.harpoon;o.bhide=!!(BUILDS.baitbuoy&&BUILDS.baitbuoy.hide);
      o.rec=RECIPES.filter(r=>/harpoon|baitbuoy/.test(r.id+JSON.stringify(r.c))).length;o.vend=vendPool().filter(k=>/harpoon|baitbuoy/.test(k)).length;o.rbox=rboxPool().filter(k=>/harpoon|baitbuoy/.test(k)).length;
      S.inv.harpoon=1;S.inv.kit_baitbuoy=2;S.built=(S.built||[]).concat([{t:'baitbuoy',x:1,z:1,r:0}]);const w0=invN('wood'),b0=invN('bait_shrimp');const rm=dropRemoved();
      o.after=[S.inv.harpoon,S.inv.kit_baitbuoy,S.built.filter(b=>b.t==='baitbuoy').length];o.refund=[invN('wood')-w0,invN('bait_shrimp')-b0];o.msg=rm.join('·');return JSON.stringify(o)}""")
    d=json.loads(r);res['delete']={'d':d,'ok':not d['items'] and not d['weap'] and d['bhide'] and d['rec']==0 and d['vend']==0 and d['rbox']==0 and d['after']==[None,None,0] and d['refund']==[2,2]}
    # 2. 겨울 추위
    r=await ev("""()=>{const o={};const tick=(n)=>{for(let i=0;i<n;i++)updStats(1)};const spot=(I)=>{for(let k=0;k<4000;k++){const x=I.x+(Math.random()-.5)*I.br,z=I.z+(Math.random()-.5)*I.br;if(islAt(x,z)===I&&hAt(x,z)>1&&walk(x,z,.42)===null&&!lightsrc.some(f=>dist(f.x,f.z,x,z)<8)&&!warmsrc.some(f=>dist(f.x,f.z,x,z)<8))return [x,z]}return null};
      const W=ISL.find(i=>i.n==='동북섬'),M=ISL[0];let q=spot(W);P.x=q[0];P.z=q[1];WTR.st='walk';
      const go=(f)=>{S.hp=50;P.lastHurt=99;f&&f();tick(10);return +(S.hp-50).toFixed(2)};
      o.winter=go();o.coldOn=COLD.on;o.pill=$('coldP').classList.contains('on')||(updPlayer(0.016),$('coldP').classList.contains('on'));
      for(const n of['동북섬 동쪽','띠섬','해달섬']){const I=ISL.find(i=>i.n===n),p=spot(I);P.x=p[0];P.z=p[1];o['w_'+n]=go()}
      P.x=q[0];P.z=q[1];
      const f=addStruct({t:'fire',x:P.x+1.5,z:P.z,r:0,own:1,hp:100});o.fire=go();removeStruct(f);
      S.hp=50;P.lastHurt=99;S.inv.dish_jam=1;const fd=ITEMS.dish_jam.food;useItem('dish_jam');o.food=[+(S.hp-50).toFixed(2),fd];
      S.inv.vodka=1;useItem('vodka');o.vodkaNoCold=bufNoCold();o.vodka=go();S.buffs=[];if(typeof BUF!=='undefined'&&BUF.L)BUF.L.length=0;
      o.afterVodka=go();
      S.inv.shoes_rainbow=1;S.eq.shoes='shoes_rainbow';o.shoe=go();S.eq.shoes=null;
      const m=spot(M);P.x=m[0];P.z=m[1];o.main=go();o.mainCold=COLD.on;
      DEV.on=true;P.x=q[0];P.z=q[1];o.dev=go();DEV.on=false;
      return JSON.stringify(o)}""")
    d=json.loads(r)
    res['cold']={'d':d,'ok':abs(d['winter']+1)<.05 and d['coldOn'] and all(abs(d['w_'+n]+1)<.05 for n in['동북섬 동쪽','띠섬','해달섬']) and d['fire']>5 and d['food'][0]==d['food'][1] and d['vodkaNoCold'] and d['vodka']>0 and abs(d['afterVodka']+1)<.05 and d['shoe']>1 and d['main']>2 and not d['mainCold']}
    # 텐트 안 = 안 추움
    r=await ev("""()=>{const W=ISL.find(i=>i.n==='동북섬');let p=null;for(let k=0;k<5000&&!p;k++){const x=W.x+(Math.random()-.5)*W.br,z=W.z+(Math.random()-.5)*W.br;if(islAt(x,z)!==W)continue;P.x=x;P.z=z+3;S.inv.kit_tent=1;setBuild('ptent');const g=ghostPos();if(g.ok){placeBuild();p=1}setBuild(null)}
      const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();if(!t)return JSON.stringify({err:'no tent'});intEnter(t);return JSON.stringify({ok:1})}""")
    await pg.wait_for_timeout(1300)
    r=await ev("()=>{S.hp=50;P.lastHurt=99;for(let i=0;i<10;i++)updStats(1);const o={in:INT.on,cold:COLD.on,d:+(S.hp-50).toFixed(2)};intOut();return JSON.stringify(o)}")
    d=json.loads(r);res['coldTent']={'d':d,'ok':d['in'] and not d['cold'] and d['d']>5}
    # 헤엄: 겨울 섬 앞 물은 추움, 먼 깊은 바다는 아님
    r=await ev("""()=>{const W=ISL.find(i=>i.n==='동북섬');let near=null,far=null;for(let k=0;k<20000&&(!near||!far);k++){const x=W.x+(Math.random()-.5)*W.br*2.4,z=W.z+(Math.random()-.5)*W.br*2.4;if(x<5||z<5||x>995||z>995||hAt(x,z)>-.8||islAt(x,z)!==W)continue;const s=seaShore(x,z);if(!near&&s>3&&s<9)near=[x,z];if(!far&&s>20)far=[x,z]}
      const o={};P.x=near[0];P.z=near[1];o.near=coldNow();P.x=far[0];P.z=far[1];o.far=coldNow();return JSON.stringify(o)}""")
    d=json.loads(r);res['coldSea']={'d':d,'ok':d['near'] and not d['far']}
    # 3. 나무·바위 · 광물
    r=await ev("""()=>{const WL=wntIsls(),o={st:THIN79.st,ore:{},outOre:0,geo:0,winT:0,winR:0,othT:0,othR:0,wa:0,oa:0};
      objs.forEach(q=>{const w=WL.includes(islAt(q.x,q.z));if(q.t<3){if(w)o.winT++;else o.othT++}else if(q.t===3){if(w)o.winR++;else o.othR++;if(q.ore){if(!w)o.outOre++;o.ore[q.ore]=(o.ore[q.ore]||0)+1;if(GEO[q.gk])o.geo++}}});
      for(let z=2;z<WS;z+=4)for(let x=2;x<WS;x+=4){if(hAt(x,z)<.95)continue;if(WL.includes(islAt(x,z)))o.wa+=16;else o.oa+=16}
      o.wTd=+(o.winT/o.wa*1e4).toFixed(1);o.oTd=+(o.othT/o.oa*1e4).toFixed(1);o.wRd=+(o.winR/o.wa*1e4).toFixed(1);o.oRd=+(o.othR/o.oa*1e4).toFixed(1);return JSON.stringify(o)}""")
    d=json.loads(r);n=sum(d['ore'].values());tot=n+d['st']['ore'].get('rock',0)
    res['objs']={'d':d,'ok':d['st']['tree'][1]<d['st']['tree'][0]*.7 and d['st']['rock'][1]<d['st']['rock'][0]*.85 and d['outOre']==0 and d['geo']==n and d['wTd']<d['oTd']*.6 and d['winR']<220 and set(d['ore'])=={'coal','iron','copper','ti','silver','gold'}}
    # 광물 캐기: 종류마다 하나씩
    r=await ev("""()=>{const o={};for(const t of ORE79_K){if(t==='rock')continue;let b=null;objs.forEach(q=>{if(!b&&q.ore===t&&q.re<=0)b=q});if(!b){o[t]='none';continue}
       const it=ORE79[t].it,n0=invN(it);P.x=b.x;P.z=b.z+OBJT[b.t].r+.5;P.rot=Math.PI;S.quick[S.sel]=null;const tg=findTarget();if(!tg||tg.k!=='o'||tg.o!==b){o[t]='notarget:'+(tg&&tg.lab);continue}target=tg;o[t+'_lab']=tg.lab;
       for(let i=0;i<20&&b.re<=0;i++){P.cd=0;inp.actEdge=true;interact()}o[t]=[invN(it)-n0,b.re>0]}
      let b=null;objs.forEach(q=>{if(!b&&q.ore==='coal'&&q.re<=0)b=q});S.inv.pick_adv=1;S.quick[S.sel]='pick_adv';P.x=b.x;P.z=b.z+OBJT[b.t].r+.5;target=findTarget();const h0=b.hp;P.cd=0;interact();o.pick=h0-b.hp;S.quick[S.sel]=null;
      let rk=null;objs.forEach(q=>{if(!rk&&q.t===3&&!q.ore&&q.re<=0)rk=q});const s0=invN('stone');P.x=rk.x;P.z=rk.z+OBJT[3].r+.5;target=findTarget();for(let i=0;i<20&&rk.re<=0;i++){P.cd=0;interact()}o.rock=invN('stone')-s0;o.dropBack=OBJT[3].drop[0];return JSON.stringify(o)}""")
    d=json.loads(r);ok=all(isinstance(d[t],list) and d[t][0]>=1 and d[t][1] for t in['coal','iron','copper','ti','silver','gold'])
    res['mine']={'d':d,'ok':ok and d['pick']>=3*1-0.01 and d['rock']>=3 and d['dropBack']=='stone' and d.get('coal_lab')=='석탄 캐기' and d.get('gold_lab')=='금 캐기'}
    # 4. 일반 자판기
    r=await ev("""()=>{const o={n:0,lab:[],ovl:0,panel:'',buy:null};const L=structs.filter(s=>s.t==='pvend'&&s.pi<8);o.n=L.length;   /* 81차: 낚시섬·식물섬·수달섬 묶음(pi 8~10)은 빼고 셈 */o.pi=[...new Set(L.map(s=>s.pi))].length;
      for(const s of L){for(const q of structs){if(q===s||Math.abs(q.x-s.x)>4||Math.abs(q.z-s.z)>4)continue;const d=sdef(q);if(!d||d.pass)continue;if(Math.abs(q.x-s.x)<d.bx+.5-.01&&Math.abs(q.z-s.z)<d.bz+.4-.01)o.ovl++}
        P.x=s.x;P.z=s.z+.4+.42+.4;P.rot=Math.PI;const t=findTarget();o.lab.push(t&&t.lab)}
      const s=L[0];P.x=s.x;P.z=s.z+1.25;target=findTarget();inp.actEdge=true;interact();o.panel=panel+'|'+$('pbody').innerText.replace(/\\n/g,' ');
      PV79.items=[['axe',1],['ammoS',12,50]];renderPanel();o.rows=document.querySelectorAll('[data-a=pv79buy]').length;S.coins=1000;delete S.inv.axe;const c0=S.coins,a0=invN('ammoS');
      document.querySelector('[data-a=pv79buy][data-k=ammoS]').click();o.buy=[c0-S.coins,invN('ammoS')-a0];PV79.items=[];closePanel();return JSON.stringify(o)}""")
    d=json.loads(r);res['pvend']={'d':d,'ok':d['n']==8 and d['pi']==8 and d['ovl']==0 and all(l=='일반 자판기' for l in d['lab']) and d['panel'].startswith('pvend|아직 파는 물건이 없어요') and d['rows']==2 and d['buy']==[50,12]}
    r=await ev("()=>{const P2=NOB.filter(n=>n.k==='port');return JSON.stringify(P2.map((n,i)=>{const q=PORT_SAFE[i];return +(Math.abs(n.x-q[0])+Math.abs(n.z-q[1])+Math.abs(n.r-q[2])).toFixed(2)}))}")
    d=json.loads(r);res['safeTable']={'d':d,'ok':max(d)<.3}
    # 5. 산장
    r=await ev("""()=>{const o={};const s=structs.find(q=>q.t==='lodge79');o.at=[s.x,s.z,islAt(s.x,s.z).n];o.nob=NOB.some(n=>n.k==='lodge79');o.map=PLACES.some(p=>p.k==='lodge');
      P.x=s.x;P.z=s.z+DECO.lodge79.bz+.6;P.rot=Math.PI;const t=findTarget();o.lab=t&&t.lab;o.home0=JSON.stringify(S.home);S.inv.kit_tent=1;P.x=s.x+3;P.z=s.z+4;setBuild('ptent');o.nobWhy=ghostPos().why;setBuild(null);
      P.x=s.x;P.z=s.z+DECO.lodge79.bz+.6;lg79Enter(s);return JSON.stringify(o)}""")
    o1=json.loads(r);await pg.wait_for_timeout(1400)
    await pg.screenshot(path=O('p79_lodge_in.jpg'))
    r=await ev("""()=>{const o={in:INT.on,kind:INT.kind};o.homeSame=JSON.stringify(S.home);P.x=INT.x+2.95;P.z=INT.z-.75;P.rot=Math.PI;const t=findTarget();o.lab=t&&t.lab;
      o.owner=!!(LG79.owner&&LG79.owner.root.visible);S.inv.kit_stash=1;setBuild('stash');o.why=ghostPos().why;setBuild(null);
      for(const [x,z] of[[INT.x+2.95,INT.z-2.35],[INT.x-2.4,INT.z-3.0],[INT.x-4.0,INT.z-.5]]){o['blk_'+Math.round(x)+'_'+Math.round(z)]=!!walk(x,z,.42,P)}
      target=t;inp.actEdge=true;S.coins=600;const r0=invN('rbox');interact();inp.actEdge=false;o.panel=panel;const b5=document.querySelector('[data-a=lg79buy][data-n=\"5\"]');o.b5dis=b5.disabled;document.querySelector('[data-a=lg79buy][data-n=\"1\"]').click();o.got=[invN('rbox')-r0,S.coins];closePanel();
      o.cold=COLD.on;return JSON.stringify(o)}""")
    o2=json.loads(r)
    await ev("()=>{P.x=INT.x;P.z=INT.z+INT.door-.6}");await pg.wait_for_timeout(400)
    r=await ev("()=>{const t=findTarget();const l=t&&t.lab;intLeave();return l}")
    for _ in range(40):
        await pg.wait_for_timeout(150)
        if await ev("()=>!INT.on&&!busy"): break
    r2=await ev("()=>{const s=LG79.s;return JSON.stringify({on:INT.on,front:P.z>s.z+DECO.lodge79.bz,dx:Math.abs(P.x-s.x),ownerHidden:!LG79.owner.root.visible})}")
    o3=json.loads(r2);o3['exitLab']=r
    # 다른 텐트 안에서는 계산대가 안 잡혀요
    r=await ev("""()=>{const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();intEnter(t);return 1}""")
    for _ in range(40):
        await pg.wait_for_timeout(150)
        if await ev("()=>INT.on&&INT.kind==='tent'&&!busy"): break
    r=await ev("()=>{P.x=INT.x+2.95;P.z=INT.z-.75;const t=findTarget();const o={kind:INT.kind,lab:t&&t.lab,blk:!!walk(INT.x+2.0,INT.z-1.8,.42,P)};intOut();return JSON.stringify(o)}")
    o4=json.loads(r)
    res['lodge']={'d':[o1,o2,o3,o4],'ok':o1['at'][2]=='해달섬' and o1['nob'] and o1['map'] and o1['lab']=='산장 들어가기' and '산장' in (o1['nobWhy'] or '') and o2['in'] and o2['kind']=='lodge' and o2['homeSame']==o1['home0'] and o2['lab']=='랜덤 상자 사기' and o2['owner'] and '산장 안에는' in (o2['why'] or '') and all(v for k,v in o2.items() if k.startswith('blk_')) and o2['panel']=='lodge79' and o2['b5dis'] and o2['got']==[1,100] and not o2['cold'] and o3['exitLab']=='나가기' and not o3['on'] and o3['front'] and o3['dx']<1 and o3['ownerHidden'] and o4['kind']=='tent' and o4['lab']!='랜덤 상자 사기' and not o4['blk']}
    # 6. 가을
    r=await ev("""()=>{const L=autIsls(),o={n:L.map(i=>i.n),objs:AUT.objs,nv:AUT.nv,bad:0,trees:0,kinds:{}};objs.forEach(q=>{if(q.t>2||!L.includes(islAt(q.x,q.z)))return;o.trees++;o.kinds[q.gk]=(o.kinds[q.gk]||0)+1;if(!(q.gk==='t_fall'||q.gk.endsWith('_a')||q.gk==='t_dead'))o.bad++});
      const I=L[0];let px=null;for(let k=0;k<4000&&!px;k++){const x=I.x+(Math.random()-.5)*I.br,z=I.z+(Math.random()-.5)*I.br;if(islAt(x,z)===I&&hAt(x,z)>1)px=[x|0,z|0]}const c=MAPC.getContext('2d').getImageData(px[0],px[1],1,1).data;o.map=[c[0],c[1],c[2]];
      P.x=px[0];P.z=px[1];return JSON.stringify(o)}""")
    d=json.loads(r)
    for _ in range(40):
        await pg.wait_for_timeout(150)
        if await ev("()=>!!(AUT.leaf&&AUT.leaf.visible&&AUT.k>.5)"): break
    d['leaf']=await ev("()=>!!(AUT.leaf&&AUT.leaf.visible&&AUT.k>.5)");d['leafDbg']=await ev("()=>JSON.stringify({k:AUT.k,on:INT.on,busy,cam:[camT.x|0,camT.z|0],P:[P.x|0,P.z|0],isl:(islAt(camT.x,camT.z)||{}).n})")
    res['autumn']={'d':d,'ok':d['n']==['바람섬','바람섬 남쪽'] and d['objs']>100 and d['nv']>1000 and d['bad']==0 and d['map'][0]>d['map'][2]+40 and d['leaf']}
    await pg.screenshot(path=O('p79_autumn.jpg'))
    # 7. 동굴: 광물·보물 상자
    await ev("()=>{const s=CAVE.s;P.x=s.x;P.z=s.z+3;caveEnter(s)}")
    await pg.wait_for_timeout(2600)
    r=await ev("""()=>{const o={in:INT.kind,n:MO79.list.length,types:{},ch:MO79.chests.length,rooms:MO79.chests.map(c=>c.room)};for(const q of MO79.list){const t=q.ore||'rock';o.types[t]=(o.types[t]||0)+1}
      const fl=()=>{const x0=-156,z0=-138,NX=313,NZ=280,G=new Uint8Array(NX*NZ),q=[];const id=(i,j)=>j*NX+i;const si=0-x0,sj=120-z0;G[id(si,sj)]=1;q.push(id(si,sj));let n=1;
        while(q.length){const k=q.pop(),i=k%NX,j=(k/NX)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=i+a,v=j+b;if(u<0||v<0||u>=NX||v>=NZ)continue;const m=id(u,v);if(G[m])continue;if(!mineOpen(x0+u,z0+v,.42)){G[m]=2;continue}G[m]=1;n++;q.push(m)}}return{G,n,x0,z0,NX}};
      const A=fl();o.reach=A.n;for(const q of MO79.list)q.sol[0]=1e9;const B=fl();o.reachNoOre=B.n;for(const q of MO79.list)q.sol[0]=q.lx;
      o.chReach=MO79.chests.map(c=>{for(let a=0;a<6.28;a+=.39){const i=Math.round(c.lx+Math.sin(a)*1.6-A.x0),j=Math.round(c.lz+Math.cos(a)*1.45-A.z0);if(A.G[j*A.NX+i]===1)return true}return false});
      o.oreReach=MO79.list.filter(q=>{for(const[a,b]of[[0,2],[2,0],[-2,0],[0,-2],[1.6,1.6],[-1.6,1.6]]){const i=Math.round(q.lx+a-A.x0),j=Math.round(q.lz+b-A.z0);if(A.G[j*A.NX+i]===1)return true}return false}).length;
      return JSON.stringify(o)}""")
    d=json.loads(r)
    r=await ev("""()=>{const o={};S.inv={};S.quick=S.quick.map(()=>null);const c=MO79.chests[1],[x,z]=mo79W(c.lx,c.lz);P.x=x;P.z=z+DECO.mc79.bz+.6;P.rot=Math.PI;const t=findTarget();o.lab=t&&t.lab;target=t;S.coins=500;inp.actEdge=true;interact();o.p1=panel;o.dis=document.querySelector('[data-a=mc79pay]').disabled;closePanel();
      S.coins=10500;interact();document.querySelector('[data-a=mc79pay]').click();o.p2=panel;o.coins=S.coins;o.left=boxLeft(boxGet(c.s));closePanel();o.lab2=sLabel(c.s);
      interact();o.p3=panel;document.querySelector('[data-a=boxall]').click();o.p4=panel;o.lab3=sLabel(c.s);o.open=c.s.m.children[0].geometry===GEO.mc79_open;
      S.day+=4;o.lab4=sLabel(c.s);o.closed=c.s.m.children[0].geometry===GEO.mc79;S.day-=4;
      const g=MO79.list.find(q=>q.ore==='gold'&&q.re<=0);P.x=g.x;P.z=g.z+OBJT[3].r+.5;const tg=findTarget();o.glab=tg&&tg.lab;target=tg;const n0=invN('ore_gold');for(let i=0;i<20&&g.re<=0;i++){P.cd=0;interact()}o.gold=invN('ore_gold')-n0;o.pass=walk(g.x,g.z,.42,P)===null;
      return JSON.stringify(o)}""")
    e=json.loads(r)
    await pg.screenshot(path=O('p79_cave.jpg'))
    r=await ev("()=>{intOut();return INT.on}")
    t=d['types'];n=d['n']
    res['cave']={'d':[d,e],'ok':d['in']=='cave' and 80<=n<=130 and set(t)=={'rock','coal','iron','copper','ti','silver','gold'} and d['ch']==9 and 0 not in d['rooms'] and 1 not in d['rooms'] and all(d['chReach']) and d['reach']>d['reachNoOre']*.97 and d['oreReach']==n
      and e['lab']=='💰 9999 · 보물 상자' and e['p1']=='mc79' and e['dis'] and e['p2']=='box' and e['coins']==501 and e['left']>0 and e['lab2']=='보물 상자 열기' and e['p3']=='box' and e['p4'] is None and e['lab3'] is None and e['open'] and e['lab4']=='💰 9999 · 보물 상자' and e['closed'] and e['glab']=='금 캐기' and e['gold']>=1 and e['pass']}
    # 사진
    await ev("()=>{const s=LG79.s;P.x=s.x;P.z=s.z+3.4;P.rot=Math.PI}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('p79_lodge_out.jpg'))
    await ev("()=>{const s=structs.find(q=>q.t==='pvend'&&q.pi===2);P.x=s.x;P.z=s.z+2.4;P.rot=Math.PI}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('p79_pvend.jpg'))
    await ev("()=>{P.x=757;P.z=226;P.rot=Math.PI}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('p79_winter.jpg'))
    await ev("()=>{const I=ISL.find(i=>i.n==='바람섬 남쪽');P.x=I.x;P.z=I.z;}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('p79_autumn2.jpg'))
    for k,v in res.items(): print(k, v['ok'], json.dumps(v.get('d'),ensure_ascii=False)[:700])
    print('ALL', all(v['ok'] for v in res.values()))
