# 81차 검사: 수상·채굴 텐트 없앰 · 겨울 광물 줄임 · 상인 있는 곳 자판기 묶음 · 식물섬 농장(벽·문·안) · 카약·모터보트
import json, os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};S.quick[S.sel]=null;DEV.on=false}")
    await pg.wait_for_timeout(300)
    # 1. 텐트 없앰 + 예전 저장 정리
    r=await ev("""()=>{const o={};o.items=['kit_wtent','kit_minetent','kit_boat2'].filter(k=>ITEMS[k]);o.hide=['wtent','minetent','minebase','fhouse','oilbase','boat2'].map(t=>!!(BUILDS[t]&&BUILDS[t].hide));
      o.vend=vendPool().filter(k=>/wtent|minetent|boat2/.test(k)).length;o.rec=RECIPES.filter(r=>/wtent|minetent|boat2/.test(r.id)).length;
      const hx=VIL.x+40,hz=VIL.z+40;S.home={x:hx,z:hz+3};S.built=(S.built||[]).concat([{t:'wtent',x:hx,z:hz,r:0,upc:{plastic:5}},{t:'minebase',x:hx+30,z:hz,r:0},{t:'boat2',x:hx+60,z:hz,r:0}]);
      const pl=invN('plastic'),w=invN('wood'),st=invN('stone'),sc=invN('scrap');const rm=dropRemoved();
      o.left=S.built.filter(b=>/wtent|minebase|boat2/.test(b.t)).length;o.got=[invN('plastic')-pl,invN('wood')-w,invN('stone')-st,invN('scrap')-sc];o.home=[S.home.x===VIL.x,S.home.z===VIL.z];o.msg=rm.join('·');return JSON.stringify(o)}""")
    d=json.loads(r);res['tents']={'d':d,'ok':not d['items'] and all(d['hide']) and d['vend']==0 and d['rec']==0 and d['left']==0 and d['got'][0]>=5+6 and d['got'][1]>=14 and all(d['home'])}
    # 2. 겨울 광물
    r=await ev("""()=>{const W=typeof wntIsls==='function'?wntIsls():[];let n=0,ore=0,ty={};objs.forEach(q=>{if(q.t!==3||!W.includes(islAt(q.x,q.z)))return;n++;if(q.ore){ore++;ty[q.ore]=1}});return JSON.stringify({n,ore,ty:Object.keys(ty).length,wRock:THIN79.wRock})}""")
    d=json.loads(r);res['ore']={'d':d,'ok':d['n']<260 and d['ore']>40 and d['ty']>=5}
    # 3. 자판기 묶음 셋(낚시섬·식물섬·수달섬): 세 기계, 앞에 서면 이름표
    r=await ev("""()=>{const o={};for(const k of['fish','plant','otter']){const a=VS81.at[k];if(!a){o[k]=null;continue}const L=structs.filter(s=>s.pi===a.pi&&(s.t==='vend'||s.t==='recycle'||s.t==='pvend'));
       const lab=L.map(s=>{const d=sdef(s);P.x=s.x;P.z=s.z+d.bz+.62;P.rot=Math.PI;const t=findTarget();return t&&t.s===s?t.lab:null});o[k]={n:L.length,lab,front:L.map(s=>walk(s.x,s.z+sdef(s).bz+.62,.42,P)===null)}}return JSON.stringify(o)}""")
    d=json.loads(r);res['vend']={'d':d,'ok':all(d[k] and d[k]['n']==3 and all(d[k]['lab']) and all(d[k]['front']) for k in['fish','plant','otter'])}
    r=await ev("""()=>{const o={};for(const k of['fish','plant','otter']){const a=VS81.at[k];const s=structs.find(q=>q.pi===a.pi&&q.t==='vend');P.x=s.x;P.z=s.z+sdef(s).bz+.62;P.rot=Math.PI;target=findTarget();const ok=target&&target.s===s;if(ok){inp.actEdge=true;interact();inp.actEdge=false}o[k]=[panel,ok,typeof VENDAT!=='undefined'?VENDAT:null];closePanel()}return JSON.stringify(o)}""")
    d=json.loads(r);res['vendOpen']={'d':d,'ok':all(d[k][0]=='vend' for k in d)}
    # 4. 식물섬 농장
    r=await ev("""()=>{const o={},L=PIS81.list;o.n=L.length;o.out=L.filter(q=>!piInside(q.x,q.z,Math.max(q.bx,q.bz)*.5)).map(q=>q.k);
      const ov=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.x-b.x)<a.bx+b.bx-.05&&Math.abs(a.z-b.z)<a.bz+b.bz-.05)ov.push(a.k+'/'+b.k)}o.ov=ov;
      o.bld=structs.filter(s=>s.pis81).map(s=>s.t);o.gate=structs.filter(s=>s.t==='pgate').length;o.npc=!!GNPC;o.lines=GNPC_LINES.length;o.nr=PIS.nr;
      /* 문을 열고 안에서 0.5m 칸 채우기: 판매대 앞·자판기 앞·게시판 앞·건물 앞에 닿는지 */
      const g=structs.find(s=>s.t==='pgate');g.open=true;const seen=new Set(),Q=[[PIS.gx,PIS.gzi-1.2]],key=(x,z)=>Math.round(x*2)+','+Math.round(z*2);seen.add(key(...Q[0]));let n=0;
      while(Q.length&&n<40000){const [x,z]=Q.pop();n++;for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k))continue;seen.add(k);if(!piInside(nx,nz,-.2))continue;if(walk(nx,nz,.42,P)===null)Q.push([nx,nz])}}
      const can=(x,z)=>{for(let dx=-1;dx<=1;dx+=.5)for(let dz=-1;dz<=1;dz+=.5){const k=key(x+dx,z+dz);if(seen.has(k)&&walk(x+dx,z+dz,.42,P)===null)return true}return false};
      const ST=PIS.stall,va=VS81.at.plant;o.reach={stall:can(ST[0],ST[1]+1.1),vend:va?can(va.x+1.9,va.zf+.8):false,board:can(79.2,680.6),barn:can(70.5,659.2+4.5),cabin:can(104.6,657.2+3.5),mill:can(63.6,669+3)};o.cells=n;g.open=false;
      /* 문이 닫히면 바깥 → 안 못 들어감 */
      P.x=PIS.gx;P.z=PIS.gzo+1.2;o.shut=walk(PIS.gx,PIS.gzi-.5,.42,P)!==null||!!inStruct(g,PIS.gx,PIS.gzo-.45,.42);return JSON.stringify(o)}""")
    d=json.loads(r);res['farm']={'d':d,'ok':d['n']>=15 and not d['out'] and not d['ov'] and len(d['bld'])==3 and d['gate']==1 and d['npc'] and all(d['reach'].values()) and d['shut']}
    # 5. 배: 정의·아이콘·자판기
    r=await ev("""()=>JSON.stringify({kits:['kit_kayak','kit_mboat'].map(k=>!!ITEMS[k]&&!!ICON[k]),vend:['kit_kayak','kit_mboat'].map(k=>vendPool().includes(k)),geo:['b81_kayak','b81_mboat','b81_mboat_motor','b81_mboat_prop','b81_paddle'].map(k=>!!GEO[k]),
      tris:['b81_kayak','b81_mboat'].map(k=>GEO[k].attributes.position.count/3|0),b:['kayak','mboat'].map(t=>BUILDS[t].kit)})""")
    d=json.loads(r);res['boatDef']={'d':d,'ok':all(d['kits']) and all(d['vend']) and all(d['geo']) and max(d['tris'])<16000}
    # 6. 키트로 바닷가에 띄우기
    r=await ev("""()=>{const o={};for(const t of['kayak','mboat']){S.inv['kit_'+t]=1;setBuild(t);let ok=null;
       outer:for(let r=30;r<340&&!ok;r+=5)for(let k=0;k<72;k++){const a=k/72*Math.PI*2,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(hAt(x,z)<-.3||hAt(x,z)>1.4||nobAt(x,z,2))continue;
        for(let q=0;q<8;q++){P.x=x;P.z=z;P.rot=q/8*Math.PI*2;const g=ghostPos();if(g.ok){ok=1;break outer}}}
       if(ok)placeBuild();setBuild(null);const s=structs.filter(q=>q.own&&q.t===t).pop();o[t]=s?{kit:S.inv['kit_'+t]||0,bad:b81Bad(s,s.x,s.z,s.r||0),x:s.x,z:s.z}:null;window['K_'+t]=s}
      setBuild('kayak');P.x=VIL.x;P.z=VIL.z;S.inv.kit_kayak=1;o.land=ghostPos().why;setBuild(null);S.inv.kit_kayak=0;return JSON.stringify(o)}""")
    d=json.loads(r);res['place']={'d':d,'ok':d['kayak'] and d['mboat'] and d['kayak']['kit']==0 and d['mboat']['kit']==0 and bool(d['land'])}
    # 7. 넓은 바다에서 타기 · 속도 · 뜨기(갑판·바닥이 물 위) · 노·모터 손
    r=await ev("""()=>{let sp=null;for(let r=60;r<520&&!sp;r+=4)for(let k=0;k<48;k++){const a=k/48*6.283,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(x<60||z<60||x>940||z>840)continue;let ok=true;for(let d=-10;d<=110&&ok;d+=4)for(const dx of[-14,0,14])if(seaShore(x+dx,z+d)<14)ok=false;if(ok){sp=[x,z];break}}
      const o={sp};const step=(n,dt=.02)=>{for(let i=0;i<n;i++){updPlayer(dt);b81Tick(dt);b81Arms(dt)}};const V=new THREE.Vector3();
      for(const t of['kayak','mboat']){const s=addStruct({t,x:sp[0],z:sp[1],r:0,own:1,hp:300,kit:'kit_'+t});const D=BOAT81[t];P.x=s.x+D.W/2+.9;P.z=s.z;WTR.st='swim';S.hp=60;
       target=findTarget();const lab=target&&target.lab;inp.act=true;inp.actEdge=true;step(1);inp.act=false;inp.actEdge=false;const on=RIDE.on&&RIDE.s===s;step(40);
       /* 쉬는 동안: 갑판(카약)·바닥(모터보트) 가장 낮은 곳이 물 위, 배 바닥은 물 아래 */
       let lo=9,hi=-9;s.m.updateMatrixWorld(true);const pos=GEO[sdef(s).g+(t==='mboat'?'_b':'')].attributes.position;let deck=9;for(let i=0;i<pos.count;i++){V.fromBufferAttribute(pos,i);const ly=V.y,lz=V.z;s.m.localToWorld(V);lo=Math.min(lo,V.y);hi=Math.max(hi,V.y);
        if(t==='kayak'&&ly>.19&&Math.abs(lz)<1.4)deck=Math.min(deck,V.y);if(t==='mboat'&&Math.abs(ly-.2)<.01&&Math.abs(lz)<2)deck=Math.min(deck,V.y)}
       const seatY=P.yv;joy.id=-7;inp.mx=0;inp.mz=1;const x0=s.z;let minDeck=9,blade=9,maxBad=0,hand=0;
       for(let i=0;i<300;i++){step(1);if(i%10===0){s.m.updateMatrixWorld(true);let d2=9;for(let k=0;k<pos.count;k+=7){V.fromBufferAttribute(pos,k);const ly=V.y,lz=V.z;if(t==='kayak'?ly>.19&&Math.abs(lz)<1.4:Math.abs(ly-.2)<.01&&Math.abs(lz)<2){s.m.localToWorld(V);d2=Math.min(d2,V.y)}}minDeck=Math.min(minDeck,d2);
         maxBad=Math.max(maxBad,b81Bad(s,s.x,s.z,s.bt.h));if(t==='kayak'&&s.pad){for(const sx of[1,-1]){V.set(sx*(GEO.b81_paddle.userData.half-.1),0,0);s.pad.localToWorld(V);blade=Math.min(blade,V.y)}}
         const bn=P.a.dog?P.a.dog.B:boneMap(P.a);if(i>50&&bn.handslotr){bn.handslotr.getWorldPosition(V);let g;if(t==='kayak'){g=new THREE.Vector3(-.27,0,0);s.pad.localToWorld(g)}else{g=new THREE.Vector3().fromArray(D.tiller);s.lk.parts.motor.localToWorld(g)}hand=Math.max(hand,V.distanceTo(g))}}}
       const dz=s.z-x0,v=s.bt.v;joy.id=null;inp.mx=inp.mz=0;
       /* 왼쪽으로 꺾기 → 배가 돌고 모터는 반대로 */
       joy.id=-7;inp.mx=1;inp.mz=0;step(60);const h=s.bt.h,mo=t==='mboat'?s.lk.parts.motor.rotation.y:0,roll=s.bt.roll;joy.id=null;inp.mx=0;step(80);
       const hpRide=S.hp;inp.act=true;inp.actEdge=true;step(1);inp.act=false;inp.actEdge=false;const off=!RIDE.on;step(10);const ws=WTR.st;
       o[t]={lab,on,lo:+lo.toFixed(3),deck:+deck.toFixed(3),minDeck:+minDeck.toFixed(3),seatY:+seatY.toFixed(2),dz:+dz.toFixed(1),v:+v.toFixed(2),blade:+blade.toFixed(2),maxBad,hand:+hand.toFixed(3),h:+h.toFixed(2),mo:+mo.toFixed(2),roll:+roll.toFixed(3),hp:[60,hpRide],off,ws};removeStruct(s)}
      return JSON.stringify(o)}""")
    d=json.loads(r);k,m=d['kayak'],d['mboat']
    res['ride']={'d':d,'ok':k['on'] and m['on'] and k['lab'] and k['lo']<0 and k['deck']>.02 and k['minDeck']>.0 and m['deck']>.02 and m['minDeck']>.0 and m['lo']<-.15
      and k['blade']<0 and k['maxBad']==0 and m['maxBad']==0 and k['hand']<.1 and m['hand']<.1 and m['v']>k['v']*2 and 4.5<k['v']<=5.5 and 11<m['v']<=13.6
      and k['h']>.3 and m['h']>.15 and m['mo']<0 and k['hp'][1]>=60 and m['hp'][1]>=60 and k['off'] and m['off'] and k['ws']=='swim'}
    # 8. 바닷가로 몰고 가서 땅에 내리기 · 얕은 곳에 못 들어감 · 저장
    r=await ev("""()=>{const s=window.K_kayak;const step=(n,dt=.02)=>{for(let i=0;i<n;i++){updPlayer(dt);b81Tick(dt);b81Arms(dt)}};b81Board(s);step(30);
      let best=null;for(let k=0;k<36;k++){const a=k/36*6.283;for(let r=1;r<30;r+=.5){if(hAt(s.x+Math.sin(a)*r,s.z+Math.cos(a)*r)>.12){if(!best||r<best[1])best=[a,r];break}}}
      joy.id=-7;inp.mx=Math.sin(best[0]);inp.mz=Math.cos(best[0]);let bad=0;for(let i=0;i<400;i++){step(1);bad=Math.max(bad,b81Bad(s,s.x,s.z,s.bt.h))}joy.id=null;inp.mx=inp.mz=0;step(60);
      inp.act=true;inp.actEdge=true;step(1);inp.act=false;inp.actEdge=false;step(20);const o={best,bad,off:!RIDE.on,land:hAt(P.x,P.z)>.12||!!onDock(P.x,P.z),ws:WTR.st,free:walk(P.x,P.z,.42,P)===null};
      save();const B=JSON.parse(localStorage.getItem(SAVE)).S.built.find(b=>b.t==='kayak');o.saved=B&&Math.abs(B.x-s.x)<.01&&Math.abs(B.r-s.r)<.01;return JSON.stringify(o)}""")
    d=json.loads(r);res['shore']={'d':d,'ok':d['bad']==0 and d['off'] and d['land'] and d['free'] and d['saved']}
    # 사진
    await ev("""()=>{let sp=null;for(let r=60;r<420&&!sp;r+=4)for(let k=0;k<48;k++){const a=k/48*6.283,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(x<60||z<60||x>940||z>940)continue;if(seaShore(x,z)>40){sp=[x,z];break}}
      window.PK=addStruct({t:'kayak',x:sp[0]-5,z:sp[1],r:.5,own:1,hp:300});window.PM=addStruct({t:'mboat',x:sp[0]+5,z:sp[1]+2,r:-.4,own:1,hp:300});P.x=PK.x+1.5;P.z=PK.z;b81Board(PK);zoomK=.74}""")
    await ev("()=>{joy.id=-7;inp.mx=.4;inp.mz=1}");await pg.wait_for_timeout(2600);await pg.screenshot(path=O('p81_kayak.jpg'),type='jpeg',quality=85)
    await ev("()=>{joy.id=null;inp.mx=inp.mz=0;b81Off(true);P.x=PM.x;P.z=PM.z+3.2;b81Board(PM)}");await pg.wait_for_timeout(1000)
    await ev("()=>{joy.id=-7;inp.mx=-.3;inp.mz=1}");await pg.wait_for_timeout(3000);await pg.screenshot(path=O('p81_mboat.jpg'),type='jpeg',quality=85)
    await ev("()=>{joy.id=null;inp.mx=inp.mz=0;b81Off(true);zoomK=1}")
    for nm,x,z in [('p81_farm_gate',85,692),('p81_farm_w',72,667),('p81_farm_e',100,667),('p81_farm_n',86,657)]:
        await ev(f"()=>{{P.x={x};P.z={z};P.rot=Math.PI;DEV.on=true}}");await pg.wait_for_timeout(1700);await pg.screenshot(path=O(nm+'.jpg'),type='jpeg',quality=82)
    for k in ['fish','otter']:
        await ev(f"()=>{{const a=VS81.at['{k}'];P.x=a.x+1.9;P.z=a.zf+2.4}}");await pg.wait_for_timeout(1700);await pg.screenshot(path=O('p81_vs_'+k+'.jpg'),type='jpeg',quality=82)
    await ev("()=>{DEV.on=false}")
    for k,v in res.items():print(k,'OK' if v['ok'] else 'FAIL',json.dumps(v['d'],ensure_ascii=False)[:900])
    print('ALL',all(v['ok'] for v in res.values()))
