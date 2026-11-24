# 78차(규칙) 검사: 수상 텐트 → 낚시집 / 석유 시추 기지(고르기) · 채굴 기지 새 재료 · 넓은 구역 · 물 위 구역 표시 · 깊은 바다 헤엄 에너지 2배
# 실행: python3 tools/gt.py tools/p78_check.py
# 사진: tools/out/p78_fhouse.jpg, p78_oilbase.jpg, p78_minebase.jpg, p78_fhouse_in.jpg, p78_oilbase_in.jpg, p78_bench.jpg
import json,os
async def steps(pg):
    res={}
    async def ev(js):
        try:return await pg.evaluate(js.strip())
        except Exception as e:print('FAIL',js.strip()[:120],str(e)[:300]);raise
    async def shot(name,wait=1300):
        await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    # 0. 정의
    r=await ev("""()=>{const W=BUILDS.wtent,R=INT_ROOM,a=k=>4*R[k].hw*R[k].hd,z=t=>{const q=zoneRect(0,0,0,t);return 2*q.hw*(q.b+q.f)};
      return JSON.stringify({upgs:W.upgs.map(u=>[u.to,u.c]),mine:BUILDS.minetent.upg.c,geo:['u78_fhouse','u78_oilbase','t74_minebase'].map(k=>!!GEO[k]&&GEO[k].attributes.position.count/3|0),
        room:[+(a('fhouse')/a('tent')).toFixed(2),+(a('oilbase')/a('tent')).toFixed(2)],zone:[+(z('fhouse')/z('wtent')).toFixed(3),+(z('oilbase')/z('wtent')).toFixed(3),+(z('minebase')/z('wtent')).toFixed(3)],
        house:['phouse','minebase','fhouse','oilbase','wtent','ptent'].map(isHouseT),zt:['fhouse','oilbase'].map(isZoneT),deckOut:[BUILDS.fhouse.deck,BUILDS.wtent.deck]})}""")
    R=json.loads(r)
    R['ok']=(R['upgs']==[['fhouse',{'plastic':20,'mparts':15,'rod3':1,'plank':50}],['oilbase',{'plastic':10,'bar_iron':20,'bar_ti':20,'plank':10}]]
        and R['mine']=={'bar_iron':20,'bar_ti':20,'pick_elec':1} and all(R['geo']) and all(1.9<=x<=2.1 for x in R['room'])
        and abs(R['zone'][0]-1.3)<.01 and abs(R['zone'][1]-1.3)<.01 and R['zone'][2]==1 and R['house']==[True,True,True,True,False,False] and all(R['zt']))
    res['defs']=R
    # 1. 깊은 바다 자리 셋: A(낚시집), B(석유 시추 기지), C+D(나란히 — 넓어진 구역이 겹쳐서 막혀야)
    r=await ev("""()=>{const ok=(x,z)=>!t74deepWhy(x,z,0,BUILDS.fhouse)&&!t74deepWhy(x,z,0,BUILDS.wtent);const out=[];
      for(let x=60;x<WS-60&&out.length<3;x+=37)for(let z=60;z<WS-60&&out.length<3;z+=41){if(!seaDeep(x,z)||seaShore(x,z)<45||seaShore(x,z)>90)continue;
        if(!ok(x,z)||!ok(x+13.1,z))continue;if(out.some(p=>Math.hypot(p[0]-x,p[1]-z)<60))continue;if(nobAt&&nobAt(x,z,8))continue;out.push([x,z])}
      window.U78P=out;return JSON.stringify(out)}""")
    res['spots']={'n':len(json.loads(r)),'ok':len(json.loads(r))==3}
    PLACE="""(x,z)=>{S.inv.kit_wtent=(S.inv.kit_wtent||0)+1;P.x=x;P.z=z+7;P.rot=Math.PI;setBuild('wtent');BPIN.on=true;BPIN.x=x;BPIN.z=z;const g=ghostPos();let s=null;if(g.ok){placeBuild();s=structs.filter(q=>q.own&&q.t==='wtent').pop()}BPIN.on=false;setBuild(null);return s}"""
    await ev(f"()=>{{window.u78Place={PLACE};return 1}}")
    # 2. 수상 텐트 A → 안에서 고르기·넣기·바꾸면 돌려받기
    r=await ev("""()=>{const [x,z]=U78P[0];const s=u78Place(x,z);window.U78A=s;return JSON.stringify({placed:!!s})}""")
    res['placeA']=json.loads(r)
    await ev("()=>{intEnter(U78A)}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{const o={in:INT.on,kind:INT.kind};S.inv.plastic=40;S.inv.mparts=30;S.inv.rod3=1;S.inv.plank=80;S.inv.bar_iron=50;S.inv.bar_ti=50;
      const I0=upInfo();o.def=I0&&I0.u&&I0.u.to;const h0=upCard();o.tabs=(h0.match(/data-a="u78sel"/g)||[]).length;o.tabTx=/낚시집/.test(h0)&&/석유 시추 기지/.test(h0);
      upPut('plastic',999);upPut('mparts',999);upPut('rod3',9);upPut('plank',999);upPut('bar_iron',5);o.after=Object.assign({},U78A.upc);o.inv=[S.inv.plastic,S.inv.mparts,S.inv.rod3||0,S.inv.plank,S.inv.bar_iron];
      o.okF=upInfo().ok;u78Sel('oilbase');o.sel=U78A.upTo;o.upc2=Object.assign({},U78A.upc);o.inv2=[S.inv.plastic,S.inv.mparts,S.inv.rod3||0,S.inv.plank];
      const I2=upInfo();o.to2=I2.u.to;o.ok2=I2.ok;u78Sel('fhouse');o.sel3=U78A.upTo;upPut('plastic',999);upPut('mparts',999);upPut('rod3',9);upPut('plank',999);o.ok3=upInfo().ok;
      const h=upCard();o.btn=/data-a="upgo"(?![^>]*disabled)/.test(h);openPanel('bench');return JSON.stringify(o)}""")
    R=json.loads(r)
    R['ok']=(R['in'] and R['kind']=='tent' and R['def']=='fhouse' and R['tabs']==2 and R['tabTx'] and R['after']=={'plastic':20,'mparts':15,'rod3':1,'plank':50}
        and R['inv']==[20,15,0,30,50] and R['okF'] and R['sel']=='oilbase' and R['upc2']=={'plastic':10,'plank':10} and R['inv2']==[30,30,1,70]
        and R['to2']=='oilbase' and not R['ok2'] and R['sel3']=='fhouse' and R['ok3'] and R['btn'])
    res['choose']=R
    await shot('p78_bench.jpg',900)
    await ev("()=>{closePanel();upGo()}");await pg.wait_for_timeout(5600)
    r=await ev("""()=>{const b=structs.find(q=>q.own&&q.t==='fhouse');window.U78F=b;const o={house:!!b,tentGone:!structs.includes(U78A),busy,at:!!(b&&b.at)};if(!b)return JSON.stringify(o);
      o.home=+dist(S.home.x,S.home.z,b.x,b.z+BUILDS.fhouse.bz+1.1).toFixed(2);const d=onDock(b.x,b.z+3.6);o.deckY=d?+d.y.toFixed(2):null;o.porch=+groundY(b.x+2.6,b.z+4.4).toFixed(2);
      const q=zoneRect(b.x,b.z,b.r,b.t),cs=zoneCorners(q);o.zoneW=+(2*q.hw).toFixed(2);o.marks=b.zg?b.zg.children.length:0;o.buoys=b.zg?b.zg.children.filter(m=>m.userData.u78b).length:0;
      o.markY=b.zg?b.zg.children.filter(m=>!m.userData.u78b).map(m=>+m.position.y.toFixed(2)):[];o.markAt=b.zg?b.zg.children.filter(m=>!m.userData.u78b).map((m,i)=>+Math.hypot(m.position.x-cs[i][0],m.position.z-cs[i][1]).toFixed(2)):[];
      P.x=b.x;P.z=b.z+3.05;o.blocked=!canStep(P,b.x,b.z+1.6,0,-1)&&!canStep(P,b.x+1.5,b.z,0,0);o.front=canStep(P,b.x,b.z+4.0,0,1);return JSON.stringify(o)}""")
    R=json.loads(r)
    R['ok']=(R['house'] and R['tentGone'] and not R['busy'] and not R['at'] and R.get('home',9)<.05 and R.get('deckY')==0.3 and R.get('porch')==0.3
        and abs(R.get('zoneW',0)-14.37)<.05 and R.get('buoys')==4 and R.get('marks')==8 and all(y==0.07 for y in R.get('markY',[0])) and max(R.get('markAt',[9]))<.01 and R['blocked'] and R['front'])
    res['fhouse']=R
    await ev("()=>{const s=U78F;P.x=s.x+1.2;P.z=s.z+4.0;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await shot('p78_fhouse.jpg',1500)
    # 3. 낚시집 안: 2배 방, 앞 통로·문, 저장 → 다시 불러도 낚시집
    await ev("()=>{const s=U78F;P.x=s.x;P.z=s.z+BUILDS.fhouse.bz+.7;P.rot=Math.PI;intEnter(s)}");await pg.wait_for_timeout(450)
    fade=await ev("()=>document.getElementById('fade').textContent")
    await pg.wait_for_timeout(1400)
    r=await ev("""()=>{const o={in:INT.on,kind:INT.kind,hw:INT.hw,hd:INT.hd,cl:INT.cl,vis:!!INT.gr.fhouse&&INT.gr.fhouse.visible};
      o.wallX=intWalk(INT.x+INT.hw-.2,INT.z,.42);o.mid=intWalk(INT.x+INT.hw-.6,INT.z,.42);o.corr=intWalk(INT.x,INT.z+INT.hd+1,.42);o.floor=+groundY(INT.x+4.2,INT.z-3.2).toFixed(2);o.y=INT.y;
      o.exit=!!INT.it[0]&&+(INT.it[0].z-INT.z).toFixed(2);return JSON.stringify(o)}""")
    R=json.loads(r);R['fade']=fade
    R['ok']=(R['in'] and R['kind']=='fhouse' and R['hw']==4.8 and R['hd']==3.75 and R['vis'] and R['wallX'] and R['mid'] is None and R['corr'] is None
        and R['floor']==R['y'] and '낚시집' in fade)
    res['fhouseIn']=R
    await shot('p78_fhouse_in.jpg',600)
    await ev("()=>{intOut();save()}")
    r=await ev("""()=>{const b=S.built.find(q=>q.t==='fhouse');return JSON.stringify({saved:!!b,upTo:b&&b.upTo||null})}""")
    res['save']=json.loads(r);res['save']['ok']=res['save']['saved']
    # 4. 집 구역 규칙: 남의 낚시집이면 그 구역 안에 못 놓음, 넓어진 가장자리까지(13.6m 밖은 됨)
    r=await ev("""()=>{const b=U78F;b.own=0;const q=zoneRect(b.x,b.z,b.r,b.t);const o={inside:zoneWhy('fence',b.x+q.hw-.6,b.z,0,.5),edge:zoneWhy('fence',b.x+6.9,b.z,0,.3),out:zoneWhy('fence',b.x+q.hw+1.2,b.z,0,.3),demoOther:null};
      const f=addStruct({t:'fence',x:b.x+5,z:b.z+2,r:0,own:0,by:'x'});o.demoOther=canDemo(f);removeStruct(f);b.own=1;o.mine=zoneWhy('fence',b.x+5,b.z,0,.5);return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']='집 구역' in (R['inside'] or '') and '집 구역' in (R['edge'] or '') and R['out']=='' and R['demoOther'] is False and R['mine']==''
    res['houseRule']=R
    # 5. 수상 텐트 B → 석유 시추 기지
    r=await ev("""()=>{const [x,z]=U78P[1];const s=u78Place(x,z);window.U78B=s;return JSON.stringify({placed:!!s})}""")
    res['placeB']=json.loads(r)
    await ev("()=>{intEnter(U78B)}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{S.inv.plastic=10;S.inv.bar_iron=20;S.inv.bar_ti=20;S.inv.plank=10;u78Sel('oilbase');for(const k of['plastic','bar_iron','bar_ti','plank'])upPut(k,999);const I=upInfo();return JSON.stringify({sel:U78B.upTo,ok:I.ok,rest:[S.inv.plastic||0,S.inv.bar_iron||0,S.inv.bar_ti||0,S.inv.plank||0]})}""")
    res['oilPut']=json.loads(r);res['oilPut']['ok']=res['oilPut']['ok'] and res['oilPut']['rest']==[0,0,0,0]
    await ev("()=>upGo()");await pg.wait_for_timeout(5600)
    r=await ev("""()=>{const b=structs.find(q=>q.own&&q.t==='oilbase');window.U78O=b;const o={base:!!b,tentGone:!structs.includes(U78B)};if(b){const d=onDock(b.x,b.z+3.6);o.deckY=d?+d.y.toFixed(2):null;o.buoys=b.zg?b.zg.children.filter(m=>m.userData.u78b).length:0}return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R['base'] and R['tentGone'] and R.get('deckY')==0.3 and R.get('buoys')==4;res['oilbase']=R
    await ev("()=>{const s=U78O;P.x=s.x+1.2;P.z=s.z+4.0;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await shot('p78_oilbase.jpg',1500)
    await ev("()=>{const s=U78O;P.x=s.x;P.z=s.z+BUILDS.oilbase.bz+.7;intEnter(s)}");await pg.wait_for_timeout(1800)
    r=await ev("()=>JSON.stringify({in:INT.on,kind:INT.kind,vis:!!INT.gr.oilbase&&INT.gr.oilbase.visible})")
    R=json.loads(r);R['ok']=R['in'] and R['kind']=='oilbase' and R['vis'];res['oilIn']=R
    await shot('p78_oilbase_in.jpg',600)
    await ev("()=>intOut()")
    # 6. 넓어진 구역이 옆 구역과 겹치면 업그레이드 막힘(C·D를 13.1m 떨어뜨려 놓음 — 수상 텐트끼리는 괜찮음)
    r=await ev("""()=>{const [x,z]=U78P[2];const c=u78Place(x,z),d=u78Place(x+13.1,z);window.U78C=c;return JSON.stringify({c:!!c,d:!!d})}""")
    res['pair']=json.loads(r)
    await ev("()=>{intEnter(U78C)}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{S.inv.plastic=20;S.inv.mparts=15;S.inv.rod3=1;S.inv.plank=50;for(const k of['plastic','mparts','rod3','plank'])upPut(k,999);const ok=upInfo().ok;let t='';const _t=toast;toast=m=>{t=m;_t(m)};upGo();toast=_t;
      return JSON.stringify({ok,toast:t,still:structs.includes(U78C),busy})}""")
    R=json.loads(r);R['ok']=R['ok'] and '겹쳐요' in R['toast'] and R['still'] and not R['busy'];res['pairBlock']=R
    await ev("()=>intOut()")
    # 7. 채굴 텐트 → 채굴 기지: 새 재료(철 주괴 20·티타늄 주괴 20·전기 곡괭이 1), 돌·나무는 안 받음
    r=await ev("""()=>{S.inv.kit_minetent=1;setBuild('minetent');let ok=null;for(let rr=30;rr<200&&!ok;rr+=4)for(let k=0;k<40;k++){const a=k/40*6.283,x=VIL.x+Math.cos(a)*rr,z=VIL.z+Math.sin(a)*rr;P.x=x;P.z=z+6;P.rot=Math.PI;BPIN.on=true;BPIN.x=x;BPIN.z=z;if(ghostPos().ok){ok=[x,z];break}}
      if(ok)placeBuild();BPIN.on=false;setBuild(null);window.U78M=structs.filter(q=>q.own&&q.t==='minetent').pop();return JSON.stringify({placed:!!U78M})}""")
    res['mtent']=json.loads(r)
    await ev("()=>{intEnter(U78M)}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{S.inv.stone=200;S.inv.wood=200;S.inv.bar_iron=20;S.inv.bar_ti=20;S.inv.pick_elec=1;S.quick[S.sel]='pick_elec';upPut('stone',99);upPut('wood',99);const o={stone:S.inv.stone,wood:S.inv.wood};
      for(const k of['bar_iron','bar_ti','pick_elec'])upPut(k,999);const I=upInfo(),h=upCard();o.ok=I.ok;o.upc=Object.assign({},U78M.upc);o.hand=S.quick[S.sel]||null;o.card=/채굴 기지/.test(h)&&/철 주괴/.test(h)&&/전기 곡괭이/.test(h);return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=R['stone']==200 and R['wood']==200 and R['ok'] and R['upc']=={'bar_iron':20,'bar_ti':20,'pick_elec':1} and R['hand'] is None and R['card'];res['minePut']=R
    await ev("()=>upGo()");await pg.wait_for_timeout(5600)
    r=await ev("""()=>{const b=structs.find(q=>q.own&&q.t==='minebase');window.U78MB=b;return JSON.stringify({base:!!b,tentGone:!structs.includes(U78M),busy})}""")
    R=json.loads(r);R['ok']=R['base'] and R['tentGone'] and not R['busy'];res['minebase']=R
    await ev("()=>{const s=U78MB;P.x=s.x+.6;P.z=s.z+4.6;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await shot('p78_minebase.jpg',1500)
    # 8. 철거: 낚시집 → 수상 텐트 키트 + 재료 절반
    r=await ev("""()=>{const b=U78F,k0=S.inv.kit_wtent||0,p0=S.inv.plank||0;P.x=b.x;P.z=b.z+3.4;setBuild('demo');placeBuild();setBuild(null);return JSON.stringify({gone:!structs.includes(b),kit:(S.inv.kit_wtent||0)-k0,plank:(S.inv.plank||0)-p0})}""")
    R=json.loads(r);R['ok']=R['gone'] and R['kit']==1 and R['plank']==25;res['demo']=R
    # 9. 깊은 바다 헤엄 = 에너지 2배(같은 1초, 얕은 바다와 비교)
    r=await ev("""()=>{let sh=null;for(let x=40;x<WS-40&&!sh;x+=5)for(let z=40;z<WS-40;z+=5){if(hAt(x,z)<-1.2&&!seaDeep(x,z)&&seaShore(x,z)>8&&!onDock(x,z)){sh=[x,z];break}}
      const dp=U78P[0],D0=DEV.on;DEV.on=false;const st=WTR.st;const run=([x,z])=>{P.x=x;P.z=z;WTR.st='swim';S.hp=100;P.hitT=0;updStats(1);return +(100-S.hp).toFixed(2)};
      const a=run(dp),b=run(sh);WTR.st=st;DEV.on=D0;S.hp=100;return JSON.stringify({deep:a,shallow:b,ratio:+(a/b).toFixed(2),deepFlag:seaDeep(dp[0],dp[1]),shFlag:seaDeep(sh[0],sh[1])})}""")
    R=json.loads(r);R['ok']=R['deepFlag'] and not R['shFlag'] and abs(R['ratio']-2)<.05 and R['shallow']>0;res['swim']=R
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values() if isinstance(v,dict) and 'ok' in v))
