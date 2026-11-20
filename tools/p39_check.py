# 39·40차 검사: 텐트 내 구역 — 40차부터 12.6m 정사각형(텐트의 약 9배, 앞이 더 김) · 네 모서리 말뚝 · 설치 모드 테두리 · 구역끼리 겹침 금지 · 남의 집 구역 설치·철거 금지 · 남의 텐트 구역은 설치·철거 가능 · 집으로 올려도 그대로
# 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.quick[S.sel]=null}")
    res={}
    # 1. 텐트 치기 → 구역 말뚝 4개, 안내
    r=await ev("""()=>{S.inv.kit_tent=2;setBuild('ptent');let g=null;const clear=(x,z)=>{for(const o of objs.values())if(!(o.re>0)&&Math.abs(o.x-x)<9&&o.z-z<12&&o.z-z>-6)return false;return true};
      for(let k=0;k<2400&&!(g&&g.ok&&clear(g.x,g.z));k++){P.x=VIL.x-70+(k%40)*3.1;P.z=VIL.z+20+((k/40)|0)*3.3;P.rot=0;g=ghostPos()}placeBuild();const toast=document.getElementById('toast').textContent;setBuild(null);
      const t=structs.find(s=>s.t==='ptent'&&s.own);window._zt=t;const q=zoneRect(t.x,t.z,t.r),cs=zoneCorners(q),pegs=t.zg?t.zg.children.map(m=>[+(m.position.x-t.x).toFixed(2),+(m.position.z-t.z).toFixed(2)]):[];
      return JSON.stringify({tent:!!t,toast,pegs,w:+(cs[1][0]-cs[0][0]).toFixed(2),back:+(t.z-cs[0][1]).toFixed(2),front:+(cs[2][1]-t.z).toFixed(2),inScene:!!(t.zg&&t.zg.parent)})}""")
    Q=json.loads(r);Q['ok']=Q['tent'] and len(Q['pegs'])==4 and Q['w']==12.6 and Q['back']==4.2 and Q['front']==8.4 and Q['w']==round(Q['back']+Q['front'],2) and Q['front']>Q['back'] and Q['inScene'] and '구역' in Q['toast'];res['place']=Q
    await ev("()=>{P.x=_zt.x+3;P.z=_zt.z+14;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(900);await pg.screenshot(path=O('p39_pegs.jpg'),type='jpeg',quality=88)
    # 2. 구역끼리 겹침: 내 구역 / 옆으로 15.5m·앞으로 16.5m면 됨
    r=await ev("""()=>{const t=_zt,R0=Math.max(BUILDS.ptent.bx,BUILDS.ptent.bz),w=(dx,dz)=>zoneWhy('ptent',t.x+dx,t.z+dz,0,R0);
      const W=ZONE.hw*2,D=ZONE.back+ZONE.front;return JSON.stringify({sideIn:w(W-.5,0),sideOut:w(W+.3,0),frontIn:w(0,D-.5),frontOut:w(0,D+.3),backIn:w(0,-(D-.5)),backOut:w(0,-(D+.3)),fenceIn:zoneWhy('fence',t.x+2,t.z+4,0,1)})}""")
    Q=json.loads(r);Q['ok']=Q['sideIn'].startswith('내 구역과') and Q['sideOut']=='' and Q['frontIn'].startswith('내 구역과') and Q['frontOut']=='' and Q['backIn'].startswith('내 구역과') and Q['backOut']=='' and Q['fenceIn']=='';res['overlap']=Q
    # 3. 남의 텐트·집(멀티 흉내: own 0, by 이름): 텐트 구역엔 설치 가능·텐트 겹침 금지, 집 구역엔 설치 금지 / 철거 규칙
    r=await ev("""()=>{const t=_zt,A=addStruct({t:'ptent',x:t.x+40,z:t.z,r:0,own:0,by:'남A'}),H=addStruct({t:'phouse',x:t.x+80,z:t.z,r:0,own:0,by:'남B'});
      const fA=addStruct({t:'fence',x:A.x+3,z:A.z+6,r:0,own:0,by:'남A'}),fH=addStruct({t:'fence',x:H.x+3,z:H.z+6,r:0,own:0,by:'남B'}),fO=addStruct({t:'fence',x:t.x+60,z:t.z+30,r:0,own:0,by:'남C'}),mine=addStruct({t:'fence',x:H.x-3,z:H.z+6,r:0,own:1});
      const R0=Math.max(BUILDS.ptent.bx,BUILDS.ptent.bz),o={
       inOtherTent:zoneWhy('fence',A.x+2,A.z+4,0,1),tentOverOther:zoneWhy('ptent',A.x+10,A.z,0,R0),inOtherHouse:zoneWhy('fence',H.x+2,H.z+4,0,1),nearHouseEdge:zoneWhy('fence',H.x+ZONE.hw+.5,H.z,0,1),outside:zoneWhy('fence',H.x+ZONE.hw+3,H.z,0,1),
       demoInTent:canDemo(fA),demoInHouse:canDemo(fH),demoOutside:canDemo(fO),demoTent:canDemo(A),demoHouse:canDemo(H),demoMine:canDemo(mine),cols:[zoneCol(t),zoneCol(A),zoneCol(H)].map(c=>c.toString(16)),pegs:[!!A.zg,!!H.zg]};
      window._zA=A;window._zH=H;window._zf=[fA,fH,fO,mine];return JSON.stringify(o)}""")
    Q=json.loads(r);Q['ok']=Q['inOtherTent']=='' and Q['tentOverOther'].startswith('다른 사람 구역') and Q['inOtherHouse'].startswith('다른 사람 집 구역') and Q['nearHouseEdge'].startswith('다른 사람 집') and Q['outside']=='' and Q['demoInTent'] and not Q['demoInHouse'] and not Q['demoOutside'] and not Q['demoTent'] and not Q['demoHouse'] and Q['demoMine'] and all(Q['pegs']);res['others']=Q
    # 4. 철거 모드로 남의 텐트 구역 안 울타리 철거(재료 절반) / 남의 집 구역 안은 못 함
    r=await ev("""()=>{const[fA,fH]=_zf;const w0=invN('wood');setBuild('demo');let px=P.x,pz=P.z;P.x=fA.x;P.z=fA.z+1;placeBuild();const goneA=!structs.includes(fA),w1=invN('wood');P.x=fH.x;P.z=fH.z+1;placeBuild();const goneH=!structs.includes(fH);setBuild(null);P.x=px;P.z=pz;
      return JSON.stringify({goneA,goneH,wood:w1-w0,toast:document.getElementById('toast').textContent})}""")
    Q=json.loads(r);Q['ok']=Q['goneA'] and not Q['goneH'] and Q['wood']>0;res['demo']=Q
    # 5. 설치 모드 테두리: 텐트 들면 놓을 자리 구역(초록/빨강) + 둘레 구역들, 끄면 숨김
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const t=_zt;P.x=t.x+3;P.z=t.z+9;P.rot=0;setBuild('ptent');await sl(400);const pre=ZMK.pre,g1=ghost.userData.g;
      const o={pre:!!(pre&&pre.visible),preCol:pre&&pre.userData.col.toString(16),ok1:g1.ok,why1:g1.why,edges:ZMK.edges.filter(e=>e.visible).length};
      setBuild('fence');await sl(300);o.fencePre=!!(ZMK.pre&&ZMK.pre.visible);o.fenceEdges=ZMK.edges.filter(e=>e.visible).length;setBuild(null);await sl(300);o.offPre=!!(ZMK.pre&&ZMK.pre.visible);o.offEdges=ZMK.edges.filter(e=>e.visible).length;return JSON.stringify(o)}""")
    Q=json.loads(r);Q['ok']=Q['pre'] and Q['preCol']=='d23a28' and not Q['ok1'] and bool(Q['why1']) and Q['edges']>=1 and not Q['fencePre'] and Q['fenceEdges']>=1 and not Q['offPre'] and Q['offEdges']==0;res['buildView']=Q
    await ev("()=>{const t=_zt;P.x=t.x+3;P.z=t.z+9;P.rot=0;setBuild('ptent');updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(900);await pg.screenshot(path=O('p39_build_red.jpg'),type='jpeg',quality=88)
    await ev("()=>{const t=_zt;P.x=t.x;P.z=t.z+24;P.rot=0;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(900)
    r=await ev("()=>{const g=ghost.userData.g;return JSON.stringify({ok:g.ok,why:g.why,col:ZMK.pre.userData.col.toString(16)})}")
    await pg.screenshot(path=O('p39_build_ok.jpg'),type='jpeg',quality=88);await ev("()=>setBuild(null)")
    Q=json.loads(r);Q['ok']=(Q['ok'] and Q['col']=='1f9a3a') or (not Q['ok'] and Q['col']=='d23a28');res['buildPreview']=Q
    # 6. 집으로 올려도 구역 그대로(말뚝 자리 같음), 텐트 말뚝은 사라짐
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const t=_zt,c0=t.zg.children.map(m=>[m.position.x.toFixed(2),m.position.z.toFixed(2)].join(',')).join(';');const tg=t.zg;
      removeStruct(t);const h=addStruct({t:'phouse',x:t.x,z:t.z,r:t.r,own:1});const c1=h.zg?h.zg.children.map(m=>[m.position.x.toFixed(2),m.position.z.toFixed(2)].join(',')).join(';'):'';
      return JSON.stringify({same:c0===c1,oldGone:!tg.parent,house:!!h.zg})}""")
    Q=json.loads(r);Q['ok']=Q['same'] and Q['oldGone'] and Q['house'];res['upgrade']=Q
    # 7. 텐트가 12시간 지나 사라지면 말뚝도 사라짐
    r=await ev("""()=>{removeStruct(_zA);removeStruct(_zH);for(const f of _zf)if(structs.includes(f))removeStruct(f);S.inv.kit_tent=1;setBuild('ptent');let g=null;for(let k=0;k<2400&&!(g&&g.ok);k++){P.x=VIL.x+60+(k%40)*3.1;P.z=VIL.z+40+((k/40)|0)*3.3;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);
      const t=structs.filter(s=>s.t==='ptent'&&s.own).pop();const zg=t.zg;t.at=Date.now()-TENT_LIFE-1000;tentGone(t);return JSON.stringify({gone:!structs.includes(t),pegGone:!!zg&&!zg.parent})}""")
    Q=json.loads(r);Q['ok']=Q['gone'] and Q['pegGone'];res['expire']=Q
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
