# 44차 검사: 텐트마다 안이 따로(새 텐트에 작업대 없음) · 항구 안전 구역 표 · 안전 구역 표시 · 동북섬 겨울
# 멀티 서버 판정은 node tools/safe_check.js. 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.quick[S.sel]=null}")
    await pg.wait_for_timeout(400)
    res={}
    # 1. 안전 구역 표 = 항구 설치 금지 원
    r=await ev("()=>{const P2=NOB.filter(n=>n.k==='port');return JSON.stringify(P2.map((n,i)=>{const q=PORT_SAFE[i];return q?+(Math.abs(n.x-q[0])+Math.abs(n.z-q[1])+Math.abs(n.r-q[2])).toFixed(2):99}))}")
    d=json.loads(r);res['safeTable']={'diff':d,'ok':len(d)==8 and max(d)<.3}
    # 2. 안전 구역 알약: 항구 안이면 켜지고 밖이면 꺼짐
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const q=PORT_SAFE[0];P.x=q[0];P.z=q[1]+6;unstuck();P.yv=undefined;await sl(700);const a=document.getElementById('safeP').classList.contains('on');
      P.x=380;P.z=450;unstuck();P.yv=undefined;await sl(700);const b=document.getElementById('safeP').classList.contains('on');return JSON.stringify({inside:a,outside:b,inSafe:!!inSafe(q[0],q[1]),far:!!inSafe(380,450)})}""")
    R=json.loads(r);R['ok']=R['inside'] and not R['outside'] and R['inSafe'] and not R['far'];res['safePill']=R
    # 3. 텐트마다 안이 따로: 텐트 A 안에 작업대 → 텐트 B 안에는 없음(안 보임·안 부딪힘·라벨 없음·제작 안 켜짐) → A에는 그대로
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const spots=[];for(let k=0;k<400&&spots.length<2;k++){const x=VIL.x-60+(k%20)*14,z=VIL.z+40+((k/20)|0)*14;if(hAt(x,z)>1&&walk(x,z,.42,P)===null&&!inSafe(x,z)&&(!spots.length||Math.hypot(x-spots[0][0],z-spots[0][1])>20))spots.push([x,z])}
      if(spots.length<2)return JSON.stringify({err:'no spot'});const A=addStruct({t:'ptent',x:spots[0][0],z:spots[0][1],r:0,own:1}),B=addStruct({t:'ptent',x:spots[1][0],z:spots[1][1],r:0,own:1});window._tA=A;window._tB=B;
      const idle=async()=>{for(let t=0;t<60&&busy;t++)await sl(100)},enter=async s=>{await idle();intEnter(s);for(let t=0;t<60&&!(INT.on&&!busy);t++)await sl(100)},leave=async()=>{await idle();intLeave();for(let t=0;t<60&&(INT.on||busy);t++)await sl(100)};window._enter=enter;window._leave=leave;
      await enter(A);const emptyA=structs.filter(q=>q.in&&q.hk===homeKey(A)).length;give('kit_bench',1);setBuild('bench');await sl(300);P.x=INT.x;P.z=INT.z+.4;P.rot=Math.PI;await sl(300);const g=ghostPos();placeBuild();setBuild(null);await sl(200);
      const bench=structs.find(q=>q.in&&q.t==='bench');window._bn=bench;const inA={hk:bench&&bench.hk===homeKey(A),vis:bench&&bench.m.visible,near:nearBench(),ok:g.ok};await leave();
      await enter(B);P.x=bench.x;P.z=bench.z+bench.r*0+1.2;await sl(300);const inB={vis:bench.m.visible,near:nearBench(),lab:sLabel(bench),blk:inStruct(bench,bench.x,bench.z,.4),demo:canDemo(bench),others:structs.filter(q=>q.in&&q.hk===homeKey(B)).length};await leave();
      await enter(A);const againA={vis:bench.m.visible,near:nearBench(),blk:inStruct(bench,bench.x,bench.z,.4)};await leave();
      return JSON.stringify({emptyA,inA,inB,againA})}""")
    R=json.loads(r)
    R['ok']=('err' not in R) and R['emptyA']==0 and R['inA']['hk'] and R['inA']['vis'] and R['inA']['near'] and not R['inB']['vis'] and not R['inB']['near'] and R['inB']['lab'] is None and not R['inB']['blk'] and not R['inB']['demo'] and R['inB']['others']==0 and R['againA']['vis'] and R['againA']['near'] and R['againA']['blk']
    res['perTent']=R
    # 4. 저장 → 다시 불러와도 그대로(작업대의 hk 저장)
    r=await ev("""()=>{save();const raw=JSON.parse(localStorage.getItem(SAVE)).S;const b=raw.built.find(q=>q.t==='bench'&&q.in);return JSON.stringify({hk:b&&b.hk,want:homeKey(_tA)})}""")
    R=json.loads(r);R['ok']=R['hk']==R['want'];res['save']=R
    # 5. 텐트 A를 걷으면 안의 작업대는 가방으로(키트)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const k0=invN('kit_bench');removeStruct(_tA);await sl(1600);return JSON.stringify({kit:invN('kit_bench')-k0,left:structs.filter(q=>q.in&&q.t==='bench').length,toast:document.getElementById('toast').textContent})}""")
    R=json.loads(r);R['ok']=R['kit']==1 and R['left']==0;res['refund']=R
    # 6. 예전 저장의 주인 없는 방 안 작업대 → 켤 때 한 번 가방으로
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const k0=invN('kit_bench');const o=addStruct({t:'bench',x:INT.x+1,z:INT.z,r:0,own:1,in:1,yo:3,kit:1});delete o.hk;HKM.s=null;await sl(600);return JSON.stringify({kit:invN('kit_bench')-k0,gone:!structs.includes(o)})}""")
    R=json.loads(r);R['ok']=R['kit']==1 and R['gone'];res['migrate']=R
    # 7. 텐트 → 집으로 올려도 안의 것 그대로(같은 자리 열쇠)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const B=_tB;const L=[busy,INT.on];await _enter(B);L.push(INT.on,busy);give('kit_bench',1);setBuild('bench');P.x=INT.x;P.z=INT.z+.4;await sl(300);placeBuild();setBuild(null);await _leave();
      const bn=structs.find(q=>q.in&&q.t==='bench'&&q.hk===homeKey(B));HUP.on=true;const h=addStruct({t:'phouse',x:B.x,z:B.z,r:B.r,own:1});removeStruct(B);HUP.on=false;const same=homeKey(h)===bn.hk,still=structs.includes(bn);
      await _enter(h);const vis=bn.m.visible,dbg={on:INT.on,isH:INT.s===h,k:curHK(),bk:bn.hk,busy,L};await _leave();return JSON.stringify({same,still,vis,dbg})}""")
    R=json.loads(r);R['ok']=R['same'] and R['still'] and R['vis'];res['upgrade']=R
    # 8. 동북섬 겨울: 나무·바위 모두 '_w', 다른 섬은 그대로, 땅이 하얗고, 얼음판·조각, 항구 안 얼음 없음, 눈은 동북섬 위에서만
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const I=ISL.find(i=>i.n==='동북섬');let on=0,onW=0,offW=0;objs.forEach(o=>{const T=OBJT[o.t];if(T.berry)return;const isl=islAt(o.x,o.z)===I,ow=typeof wntIsls==='function'&&wntIsls().includes(islAt(o.x,o.z));if(ow&&!isl)return;if(isl){on++;if(o.gk.endsWith('_w'))onW++}else if(o.gk.endsWith('_w'))offW++});
      const col=(x,z)=>{for(const t of tchunks){const g=t.m.geometry,P2=g.attributes.position.array,L=g.attributes.color.array;for(let k=0;k<P2.length;k+=3)if(Math.abs(P2[k]-x)<1.01&&Math.abs(P2[k+2]-z)<1.01)return (L[k]+L[k+1]+L[k+2])/3}return -1};
      const a=WNT.ice.geometry.attributes.position.array,q=PORT_SAFE[2];let inPort=0;for(let k=0;k<a.length;k+=3)if(Math.hypot(a[k]-q[0],a[k+2]-q[1])<q[2])inPort++;
      P.x=760;P.z=212;unstuck();P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);for(let t=0;t<40&&!(WNT.snow.visible&&WNT.k>.3);t++)await sl(200);const snowOn=WNT.snow.visible&&WNT.k>.3;
      P.x=380;P.z=450;unstuck();P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);for(let t=0;t<50&&WNT.snow.visible;t++)await sl(200);const snowOff=!WNT.snow.visible;
      return JSON.stringify({on,onW,offW,snowGround:+col(760,212).toFixed(3),mainGround:+col(380,450).toFixed(3),cells:WNT.ice.userData.cells,floes:WNT.ice.userData.floes,inPort,snowOn,snowOff,map:WNT.map})}""")
    R=json.loads(r);R['ok']=R['on']>500 and R['onW']==R['on'] and R['offW']==0 and R['snowGround']>.6 and R['mainGround']<.35 and R['cells']>800 and R['floes']>50 and R['inPort']==0 and R['snowOn'] and R['snowOff'] and R['map']==1;res['winter']=R
    await ev("()=>{P.x=760;P.z=212;unstuck();P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p44_winter.jpg'),type='jpeg',quality=85)
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v['ok'] for v in res.values()))
