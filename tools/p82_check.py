# 82차(규칙) 검사: 보석 1% · 1차 재료 삭제 · 보따리 직접 줍기 · 집 업그레이드 키트 셋(2층·배선·증설) · 기름·발전기·전기 · 장식 20종 · 특수 보급지 크기
# 실행: python3 tools/gt.py tools/p82_check.py
# 사진: tools/out/p82_house2.jpg, p82_house2_in.jpg, p82_bench.jpg, p82_power_night.jpg, p82_deco.jpg, p82_bundle.jpg
import json,os
async def steps(pg):
    res={}
    async def ev(js):
        try:return await pg.evaluate(js.strip())
        except Exception as e:print('FAIL',js.strip()[:120],str(e)[:300]);raise
    async def shot(name,wait=1300):
        await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};DEV.god=true;return 1}")
    # 0. 정의: 1차 재료 없음 · 제작법/설치 재료에 없는 아이템 없음 · 보석·키트·장식 아이콘
    r=await ev("""()=>{const G=Object.keys(GONE82),o={};o.items=G.filter(k=>ITEMS[k]);o.recBad=RECIPES.filter(r=>Object.keys(r.c).some(k=>!ITEMS[k])).map(r=>r.id);
      o.bldBad=Object.keys(BUILDS).filter(t=>[BUILDS[t].c,BUILDS[t].upg&&BUILDS[t].upg.c].some(c=>c&&Object.keys(c).some(k=>!ITEMS[k])));
      o.enemyBad=Object.keys(ENEMY).filter(k=>(ENEMY[k].loot||[]).some(([id])=>id!=='coin'&&!ITEMS[id]));o.gun=RECIPES.filter(r=>r.pat).every(r=>r.pat.length===1&&r.pat[0].length===3);o.nGun=RECIPES.filter(r=>r.pat).length;
      const A=[...GEM82.ids,'kit_floor2','kit_wiring','kit_power',...D82.map(d=>'kit_'+d[0])];o.icons=A.filter(k=>!/^data:image/.test(ICON[k]||''));o.vend=vendPool().filter(k=>k.startsWith('gem_')).length;
      o.d82=D82.length;o.elec=D82.filter(d=>d[6]).length;o.fuel=ITEMS.fuel.n;o.genD=BUILDS.gen.d.includes('4시간');
      let lb=0;for(let i=0;i<300;i++){const g=lootGen({t:'supply',li:'x'});for(const k in g)if(k!=='coin'&&!ITEMS[k])lb++}o.lootBad=lb;return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=not R.get('items') and not R.get('recBad') and not R.get('bldBad') and not R.get('enemyBad') and R.get('gun') and R.get('nGun')==7 and not R.get('icons') and R.get('vend')==0 and R.get('d82')==20 and R.get('elec')==8 and R.get('fuel')=='기름' and R.get('genD') and R.get('lootBad')==0
    res['defs']=R
    # 1. 예전 저장 정리
    r=await ev("""()=>{S.inv.scrap=7;S.inv.plank=3;S.inv.powder=2;const g=dropRemoved();return JSON.stringify({left:['scrap','plank','powder'].filter(k=>S.inv[k]),got:g})}""")
    R=json.loads(r);R['ok']=not R.get('left');res['oldSave']=R
    # 2. 보석: 광물 부수면 1%(검사는 100%로) — 겨울 광물 하나
    r=await ev("""()=>{let o=null,ok_='';objs.forEach((q,k)=>{if(!o&&q.ore&&!q.cave&&q.re<=0){o=q;ok_=k}});if(!o)return JSON.stringify({no:1});GEM82.p=1;const before=GEM82.ids.reduce((a,k)=>a+(S.inv[k]||0),0);
      P.x=o.x;P.z=o.z+1.2;P.cd=0;o.hp=1;target={k:'o',o,key:ok_,x:o.x,z:o.z,lab:'x'};inp.actEdge=true;interact();inp.actEdge=false;const after=GEM82.ids.reduce((a,k)=>a+(S.inv[k]||0),0);
      const rock=[];objs.forEach((q,k)=>{if(!rock.length&&q.t===3&&!q.ore&&!q.cave&&q.re<=0)rock.push(q,k)});let rk=0;if(rock[0]){const q=rock[0];P.x=q.x;P.z=q.z+1.2;P.cd=0;q.hp=1;target={k:'o',o:q,key:rock[1],x:q.x,z:q.z,lab:'y'};inp.actEdge=true;interact();inp.actEdge=false;rk=GEM82.ids.reduce((a,k)=>a+(S.inv[k]||0),0)-after}
      GEM82.p=.01;let n=0;for(let i=0;i<20000;i++)if(Math.random()<GEM82.p)n++;return JSON.stringify({broke:o.re>0,gem:after-before,last:GEM82.last,rock:rk,rate:n/20000})}""")
    R=json.loads(r);R['ok']=R.get('broke') and R.get('gem')==1 and R.get('rock')==0 and .006<R.get('rate',0)<.014;res['gem']=R
    # 3. 보따리: 버리면 보따리 모양, 가까이 있어도 저절로 안 주워짐 → [줍기]로 주움
    r=await ev("""()=>{P.x=VIL.x+3;P.z=VIL.z+3;P.rot=0;S.inv.wood=(S.inv.wood||0)+5;const w0=S.inv.wood;delete S.inv.wood;bagSack({wood:w0},1,1);const d=drops[drops.length-1];window.B82=d;return JSON.stringify({bnd:!!d.bnd,geo:d.m.geometry===GEO.r82_bundle_0||d.m.geometry===GEO.r82_bundle_1||d.m.geometry===GEO.r82_bundle_2,w0})}""")
    R=json.loads(r)
    await ev("()=>{P.x=B82.x;P.z=B82.z+.7;P.rot=Math.PI;return 1}");await shot('p82_bundle.jpg',2200)
    r=await ev("""()=>{const still=drops.includes(B82)&&!S.inv.wood;const t=findTarget();const lab=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;return JSON.stringify({still,lab,gone:!drops.includes(B82),wood:S.inv.wood||0})}""")
    R.update(json.loads(r));R['ok']=R.get('bnd') and R.get('geo') and R.get('still') and R.get('lab') and '줍기' in R.get('lab') and R.get('gone') and R.get('wood')==R.get('w0');res['bundle']=R
    # 4. 집 자리 찾기 → 텐트 → 집
    r=await ev("""()=>{const cands=[];for(let r=40;r<180&&cands.length<1;r+=6)for(let a=0;a<6.28&&cands.length<1;a+=.21){const x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;S.inv.kit_tent=(S.inv.kit_tent||0)+1;P.x=x;P.z=z+6;setBuild('ptent');BPIN.on=true;BPIN.x=x;BPIN.z=z;const g=ghostPos();
        if(g.ok){const big=zoneRect(x,z,0,'phouse2');let clear=true;for(let u=-big.hw;u<=big.hw&&clear;u+=1.5)for(let v=-big.b;v<=big.f;v+=1.5){const X=x+u,Z=z+v;if(hAt(X,Z)<.9||blocked(X,Z,.3)&&Math.hypot(u,v)>3){clear=false;break}}if(clear){placeBuild();cands.push([x,z])}}BPIN.on=false;setBuild(null)}
      const t=structs.filter(s=>s.own&&s.t==='ptent').pop();if(!t)return JSON.stringify({no:1});const h=addStruct({t:'phouse',x:t.x,z:t.z,r:t.r,own:1,kit:'kit_tent',hp:600});removeStruct(t);window.HS82=h;S.home={x:h.x,z:h.z+3};return JSON.stringify({x:h.x,z:h.z})}""")
    res['site']=json.loads(r)
    await ev("()=>{intEnter(HS82);return 1}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{S.inv.kit_bench=(S.inv.kit_bench||0)+1;openPanel('bench');const h=$('pbody').innerHTML;const o={in:INT.on,kind:INT.kind,rows:(h.match(/data-a="h82up"/g)||[]).length,dis:(h.match(/data-a="h82up"[^>]*disabled/g)||[]).length};
      S.inv.kit_floor2=1;S.inv.kit_wiring=1;S.inv.kit_power=1;S.inv.fuel=20;renderPanel();const q=k=>document.querySelector(`[data-a="h82up"][data-k="${k}"]`);o.pw0=q('power')&&q('power').disabled;o.wire0=q('wiring')&&!q('wiring').disabled;
      q('wiring').click();o.el1=HS82.el;renderPanel();o.pwBtn=q('power')&&!q('power').disabled;o.statusRow=/전력/.test($('pbody').innerHTML);return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R.get('in') and R.get('kind')=='house' and R.get('rows')==3 and R.get('pw0') and R.get('wire0') and R.get('el1')==1 and R.get('pwBtn') and R.get('statusRow');res['wire']=R
    await shot('p82_bench.jpg',600)
    # 5. 2층 증축
    await ev("()=>{renderPanel();document.querySelector('[data-a=\"h82up\"][data-k=\"floor2\"]').click();return 1}");await pg.wait_for_timeout(5600)
    r=await ev("""()=>{const h=structs.find(s=>s.own&&s.t==='phouse2');const z1=zoneRect(0,0,0,'phouse'),z2=zoneRect(0,0,0,'phouse2'),A=q=>2*q.hw*(q.b+q.f);window.HS82=h;
      return JSON.stringify({h2:!!h,old:structs.filter(s=>s.own&&s.t==='phouse').length,el:h&&h.el,busy,zone:+(A(z2)/A(z1)).toFixed(3),isH:isHouseT('phouse2'),geo:!!GEO.phouse2&&GEO.phouse2.attributes.position.count/3|0,home:S.home&&Math.hypot(S.home.x-h.x,S.home.z-h.z)<5,inside:INT.on&&INT.kind==='house2'&&INT.s===h,kit:S.inv.kit_floor2||0})}""")
    R=json.loads(r);R['ok']=R.get('h2') and R.get('old')==0 and R.get('el')==1 and not R.get('busy') and abs(R.get('zone')-1.5)<.01 and R.get('isH') and R.get('home') and R.get('inside') and R.get('kit')==0;res['floor2']=R
    await ev("()=>{intOut();P.x=HS82.x+.6;P.z=HS82.z+5.4;P.rot=Math.PI;zoomK=1.05;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await shot('p82_house2.jpg',1500)   # 83차: 2층으로 올려도 안에 그대로 있어서 먼저 나와요
    await ev("()=>{intEnter(HS82);return 1}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{const o={kind:INT.kind,hw:INT.hw,hd:INT.hd};const [sx,sz]=H82.stair;o.stairBlock=intWalk(INT.x+sx,INT.z+sz,.42)===true;o.free=intWalk(INT.x+1,INT.z,.42)===null;o.room=+(4*INT_ROOM.house2.hw*INT_ROOM.house2.hd/(4*INT_ROOM.house.hw*INT_ROOM.house.hd)).toFixed(2);
      openPanel('bench');const q=k=>document.querySelector(`[data-a="h82up"][data-k="${k}"]`);q('power').click();o.el2=HS82.el;renderPanel();o.oilRow=!!document.querySelector('[data-a="h82oil"]');document.querySelector('[data-a="h82oil"][data-n="1"]').click();
      o.oilH=+((HS82.oil-Date.now())/3.6e6).toFixed(2);document.querySelector('[data-a="h82oil"][data-n="99"]').click();o.oilH2=+((HS82.oil-Date.now())/3.6e6).toFixed(2);o.fuelLeft=S.inv.fuel;closePanel();return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R.get('kind')=='house2' and R.get('stairBlock') and R.get('free') and R.get('room')>1.4 and R.get('el2')==2 and R.get('oilRow') and abs(R.get('oilH')-4)<.05 and abs(R.get('oilH2')-48)<.1 and R.get('fuelLeft')==20-12;res['power']=R
    await ev("()=>{P.x=INT.x;P.z=INT.z+1.6;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await shot('p82_house2_in.jpg',900)
    await ev("()=>{intOut();return 1}");await pg.wait_for_timeout(900)
    # 6. 전기: 발전기·가로등·전기 장식(밖), 순서대로 켜짐, 용량
    r=await ev("""()=>{const h=HS82,o={},put=(t,dx,dz)=>{const s=addStruct({t,x:h.x+dx,z:h.z+dz,r:0,own:1,hp:100});return s};
      const g1=put('gen',-4.4,5.2);P.x=g1.x;P.z=g1.z+1.2;S.inv.fuel=(S.inv.fuel||0)+10;target={k:'s',s:g1,x:g1.x,z:g1.z,lab:sLabel(g1)};o.lab0=target.lab;inp.actEdge=true;interact();inp.actEdge=false;o.g1h=+((g1.fe-Date.now())/3.6e6).toFixed(2);
      for(let i=0;i<7;i++){inp.actEdge=true;interact();inp.actEdge=false}o.g1max=+((g1.fe-Date.now())/3.6e6).toFixed(1);
      const L=[put('lamp',3.6,5.6),put('jukebox',-2.2,6.6),put('tv_crt',0,7.2),put('arcade',2.2,6.6),put('fridge',4.4,7.2)];h.oil=0;pw82Solve();o.cap1=h.pwS.cap;o.sup1=h.pwS.sup;o.on1=L.map(s=>s.pw);o.use1=h.pwS.use;
      h.oil=Date.now()+3.6e6;pw82Solve();o.cap2=h.pwS.cap;o.on2=L.map(s=>s.pw);const g2=put('gen',-4.4,-3.2);g2.fe=Date.now()+3.6e6;pw82Solve();o.sup3=h.pwS.sup;o.on3=L.map(s=>s.pw);
      const far=addStruct({t:'lamp',x:h.x+40,z:h.z+40,r:0,own:1,hp:100});pw82Solve();o.far=far.pw;g1.fe=Date.now()-1;g2.fe=Date.now()-1;pw82Solve();o.off=L.map(s=>s.pw);o.labOff=sLabel(L[1]);
      g1.fe=Date.now()+3.6e6;g2.fe=Date.now()+3.6e6;pw82Solve();window.L82=L;removeStruct(far);return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=('기름' in (R.get('lab0') or '')) and abs(R.get('g1h')-4)<.05 and R.get('g1max')==24.0 and R.get('cap1')==30 and R.get('sup1')==30 and R.get('on1')==[1,1,1,1,0] and R.get('cap2')==100 and R.get('on2')==[1,1,1,1,0] and R.get('sup3')==60 and R.get('on3')==[1,1,1,1,1] and R.get('far')==0 and R.get('off')==[0,0,0,0,0] and '전기' in (R.get('labOff') or '')
    res['elec']=R
    await ev("()=>{S.time=.95;P.x=HS82.x+.5;P.z=HS82.z+10.5;P.rot=Math.PI;zoomK=1.2;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await shot('p82_power_night.jpg',1800)
    r=await ev("""()=>{const L=L82;return JSON.stringify({dbg:[!!L[0].pwGl,L[0].pw,+dark().toFixed(2),L[0].pwGl&&L[0].pwGl.parent===L[0].m],glow:!!(L[0].pwGl&&L[0].pwGl.visible),gl:L.slice(1).map(s=>!!(s.lk&&s.lk.parts.gl&&s.lk.parts.gl.visible))})}""")
    R=json.loads(r);R['ok']=R.get('glow') and all(R.get('gl'));res['lit']=R
    # 7. 장식 20종: 키트로 밖에 줄지어 놓기 + 철거하면 키트
    r=await ev("""()=>{S.time=.42;const h=HS82,o={placed:0,fail:[]};let i=0;for(const d of D82){const id=d[0];S.inv['kit_'+id]=(S.inv['kit_'+id]||0)+1;let done=0,why='';for(let t=0;t<40&&!done;t++){const x=h.x-5.2+((i+t)%6)*2.6,z=h.z+11+(((i+t)/6)|0)*2.6;
        P.x=x;P.z=z+3;setBuild(id);BPIN.on=true;BPIN.x=x;BPIN.z=z;const g=ghostPos();if(g.ok){placeBuild();o.placed++;done=1}else why=g.why;BPIN.on=false;setBuild(null)}i++;if(!done)o.fail.push(id+':'+why)}
      const s=structs.filter(q=>q.own&&q.t==='piano').pop();const k0=S.inv.kit_piano||0;if(s){P.x=s.x;P.z=s.z+2;setBuild('demo');demoAt(s.x,s.z);setBuild(null)}o.kitBack=(S.inv.kit_piano||0)-k0;
      P.x=h.x-1.8;P.z=h.z+19.5;P.rot=Math.PI;zoomK=1.25;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R.get('placed')==20 and R.get('kitBack')==1;res['deco']=R
    await shot('p82_deco.jpg',1500)
    # 8. 저장 → 불러오기에 el·oil·fe가 남음
    print('saveDbg',await ev("""()=>{try{const B=structs.filter(s=>s.own).map(s=>({t:s.t,x:s.x,z:s.z,r:s.r,hk:s.in?s.hk:undefined,upc:s.upc||undefined,at:s.at||undefined,hp:Math.round(s.hp),fe:s.fe||undefined,el:s.el||undefined,oil:s.oil||undefined}));JSON.stringify(B);JSON.stringify(S);localStorage.setItem('t82',JSON.stringify({S,opt}));return 'ok '+mode}catch(e){return 'ERR '+e.message}}"""))
    r=await ev("""()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));const b=d.S.built.find(q=>q.t==='phouse2'),g=d.S.built.find(q=>q.t==='gen');return JSON.stringify({el:b&&b.el,oil:!!(b&&b.oil),fe:!!(g&&g.fe)})}""")
    R=json.loads(r);R['ok']=R.get('el')==2 and R.get('oil') and R.get('fe');res['save']=R
    # 9. 특수 보급지: 크기·상자 3·설치 금지 원
    r=await ev("""()=>{const n=NOB.find(q=>q.k==='sp');return JSON.stringify({AX:SPSUP.AX,AZ:SPSUP.AZ,BX:SPSUP.BX,BZ:SPSUP.BZ,box:structs.filter(s=>s.t==='spsupply'&&/^sp\d/.test(s.li)).map(s=>s.li),nobR:n&&+n.r.toFixed(1),ok82:SP82.ok})}""")
    R=json.loads(r);R['ok']=R.get('box')==['sp0','sp1','sp2'] and R.get('nobR')>24 and R.get('ok82')==1;res['crater']=R
    print(json.dumps(res,ensure_ascii=False,indent=1))
    print('ALL',all(v.get('ok') for v in res.values() if isinstance(v,dict) and 'ok' in v))
