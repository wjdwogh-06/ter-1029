# 텐트 문·작업대 창·집 업그레이드 검사(15차)
# 기대: shop.has=true·bought=1 / 아래로 걸어도 안 나가짐(stay.on=true) / 문 앞에서만 [나가기] / 멀리서 문 누르면 그대로(farDoor.on=true·moved 0) / 문 앞에서 누르면 나감(tapExit.on=false)
#       키트로 작업대(밖에서는 안 됨) / 작업대 → bench 창, 넣기 10→50→120, 업그레이드 버튼은 120일 때만
#       업그레이드 뒤 phouse 1·ptent 0·같은 자리·작업대 그대로 / 집 안 = 넓은 방(house) / 집 철거 = 텐트 키트 + 나무 60
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    async def shot(n,w=500):
        await pg.wait_for_timeout(w);await pg.screenshot(path=O(n),type='jpeg',quality=85)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    # 1) 센터 가게에서 작업대 사기
    await ev("()=>{P.x=VIL.mx;P.z=VIL.mz+2;openPanel('shop')}")
    print('shop',await ev("()=>{const b=document.querySelector('[data-a=buy][data-k=kit_bench]');const r={has:SHOP.sell.includes('kit_bench'),btn:!!b};if(b)b.click();r.bought=invN('kit_bench');return JSON.stringify(r)}"))
    await shot('up_shop.jpg');await ev("()=>closePanel()")
    # 밖에서 작업대 키트 → 설치 모드가 되지 않음
    print('kitOut',await ev("()=>{primary('kit_bench');const r={bmode:bmode,toast:document.getElementById('toast').textContent};setBuild(null);return JSON.stringify(r)}"))
    # 2) 텐트 치고 들어가기
    print('tent',await ev("""()=>{S.inv.kit_tent=1;setBuild('ptent');let g=null;const clear=(x,z)=>{for(const o of objs.values())if(!(o.re>0)&&Math.abs(o.x-x)<7&&o.z-z<7.5&&o.z-z>-4)return false;return true};for(let k=0;k<1600&&!(g&&g.ok&&clear(g.x,g.z));k++){P.x=VIL.x-60+(k%40)*3.1;P.z=VIL.z+18+((k/40)|0)*3.3;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);const t=structs.find(s=>s.t==='ptent'&&s.own);window._T={x:t.x,z:t.z};return JSON.stringify({tent:!!t,x:+t.x.toFixed(1),z:+t.z.toFixed(1)})}"""))
    await ev("()=>{const t=structs.find(s=>s.t==='ptent'&&s.own);intEnter(t)}");await pg.wait_for_timeout(1700)
    print('enter',await ev("()=>{const ex=INT.it[0];return JSON.stringify({on:INT.on,kind:INT.kind,hw:INT.hw,lz:+(P.z-INT.z).toFixed(2),exLx:+(ex.x-INT.x).toFixed(2),exLz:+(ex.z-INT.z).toFixed(2),lab:(findTarget()||{}).lab||null})}"))
    await shot('up_tent_in.jpg',300)
    # 3) 아래(+z)로 2초 걸어도 안 나가짐
    await ev("()=>{for(let i=0;i<80;i++)moveEnt(P,0,.08)}");await pg.wait_for_timeout(800)
    print('stay',await ev("()=>JSON.stringify({on:INT.on,lz:+(P.z-INT.z).toFixed(2),hd:INT.hd,lab:(findTarget()||{}).lab||null})"))
    # 옆쪽 앞 가장자리(문에서 먼 곳)에서는 [나가기] 없음
    print('side',await ev("()=>{P.x=INT.x+2.4;P.z=INT.z+INT.hd-.5;P.rot=0;return JSON.stringify({lab:(findTarget()||{}).lab||null})}"))
    # 4) 34차: 멀리서 문을 누르면 걸어가지 않고 '더 가까이 가요'(그대로 안), 문 앞에서 누르면 나가요
    await ev("()=>{P.x=INT.x-1.5;P.z=INT.z-1.2;P.auto=null;window._p0=[P.x,P.z];worldTap(INT.x,INT.z+INT.hd-.25)}");await pg.wait_for_timeout(400)
    print('farDoor',await ev("()=>JSON.stringify({on:INT.on,moved:+Math.hypot(P.x-_p0[0],P.z-_p0[1]).toFixed(2),hint:floats.some(f=>f.s==='더 가까이 가요')})"))
    await ev("()=>{P.x=INT.x;P.z=INT.z+INT.hd-.5;P.rot=0;target=findTarget();worldTap(INT.x,INT.z+INT.hd-.25)}");await pg.wait_for_timeout(1800)
    print('tapExit',await ev("()=>JSON.stringify({on:INT.on,dx:+(P.x-_T.x).toFixed(1),dz:+(P.z-_T.z).toFixed(1)})"))
    # 5) 다시 들어가 키트로 작업대 놓기
    await ev("()=>{const t=structs.find(s=>s.t==='ptent'&&s.own);intEnter(t)}");await pg.wait_for_timeout(1700)
    print('bench',await ev("""()=>{P.x=INT.x+1.6;P.z=INT.z+1.0;P.rot=Math.PI;const k0=invN('kit_bench');primary('kit_bench');const r={bmode};const g=ghostPos();r.ok=g.ok;r.why=g.why;placeBuild();setBuild(null);const b=structs.find(s=>s.t==='bench'&&s.own);r.placed=!!b;r.in=b&&b.in;r.kit=b&&b.kit;r.kitLeft=invN('kit_bench');r.k0=k0;return JSON.stringify(r)}"""))
    # 6) 작업대 누르기 → 작업대 창
    print('open',await ev("""()=>{const b=structs.find(s=>s.t==='bench'&&s.own);P.x=b.x;P.z=b.z+1.5;P.rot=Math.PI;P.auto=null;target=findTarget();const lab=target&&target.lab;inp.actEdge=true;interact();inp.actEdge=false;return JSON.stringify({lab,panel,go:!!document.querySelector('[data-a=upgo]'),goDis:document.querySelector('[data-a=upgo]').disabled,craft:document.querySelectorAll('[data-a=cgfill]').length})}"""))
    await shot('up_panel0.jpg',300)
    print('put',await ev("""()=>{S.inv.wood=50;renderPanel();const q=s=>document.querySelector(s);q('[data-a=upput][data-n="10"]').click();const t=INT.s,a=t.upc.wood;q('[data-a=upput][data-n="9999"]').click();const b2=t.upc.wood,dis=q('[data-a=upgo]').disabled;
      S.inv.wood=150;renderPanel();q('[data-a=upput][data-n="9999"]').click();return JSON.stringify({a,b:b2,disMid:dis,c:t.upc.wood,inv:invN('wood'),goDis:q('[data-a=upgo]').disabled,putDis:q('[data-a=upput]').disabled})}"""))
    await shot('up_panel_full.jpg',300)
    print('save',await ev("()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));const t=d.S.built.find(q=>q.t==='ptent');return JSON.stringify(t.upc)}"))
    # 세로 화면에서도 창 모양
    await pg.set_viewport_size({'width':420,'height':860});await ev("()=>{resize();layoutPanel();renderPanel()}");await shot('up_panel_port.jpg',700)
    await pg.set_viewport_size({'width':1280,'height':720});await ev("()=>{resize();layoutPanel();renderPanel()}");await pg.wait_for_timeout(500)
    # 7) 업그레이드 → 로딩 → 같은 자리에 집
    await ev("()=>document.querySelector('[data-a=upgo]').click()");await pg.wait_for_timeout(1500);await shot('up_loading.jpg',0)
    await pg.wait_for_timeout(4200)
    print('upgraded',await ev("""()=>{const H=structs.filter(s=>s.t==='phouse'&&s.own),T=structs.filter(s=>s.t==='ptent'&&s.own),h=H[0];return JSON.stringify({house:H.length,tent:T.length,same:h&&Math.abs(h.x-_T.x)<.01&&Math.abs(h.z-_T.z)<.01,on:INT.on,busy,kit:h&&h.kit,upc:h&&h.upc||null,home:[+(S.home.x-h.x).toFixed(1),+(S.home.z-h.z).toFixed(1)],p:[+(P.x-h.x).toFixed(1),+(P.z-h.z).toFixed(1)],bench:structs.filter(s=>s.t==='bench'&&s.own).length,benchVis:structs.find(s=>s.t==='bench').m.visible,lab:(findTarget()||{}).lab||null})}"""))
    await shot('up_house_day.jpg',1200)
    # 캐릭터 옆에서 크기 비교(옆으로 비켜서서)
    await ev("()=>{const h=structs.find(s=>s.t==='phouse');P.x=h.x+3.2;P.z=h.z+1.2;P.rot=-.6;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('up_house_side.jpg',700)
    await ev("()=>{S.time=.93;const h=structs.find(s=>s.t==='phouse');P.x=h.x;P.z=h.z+3.2;P.rot=0;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('up_house_night.jpg',1500)
    await ev("()=>{S.time=.42}")
    # 8) 집 안 = 더 넓은 방, 작업대 그대로, 업그레이드 끝 표시
    await ev("()=>{const h=structs.find(s=>s.t==='phouse');P.x=h.x;P.z=h.z+sdef(h).bz+.7;P.rot=Math.PI;P.auto=null;target=findTarget();worldTap(h.x,h.z+.8)}");await pg.wait_for_timeout(3600)
    print('houseIn',await ev("()=>{const b=structs.find(s=>s.t==='bench');return JSON.stringify({on:INT.on,kind:INT.kind,hw:INT.hw,hd:INT.hd,benchVis:b.m.visible,exLz:+(INT.it[0].z-INT.z).toFixed(2)})}"))
    await shot('up_house_in.jpg',400)
    await ev("()=>{const b=structs.find(s=>s.t==='bench');P.x=b.x;P.z=b.z+1.5;P.rot=Math.PI;target=findTarget();inp.actEdge=true;interact();inp.actEdge=false}");await shot('up_house_panel.jpg',400)
    print('housePanel',await ev("()=>JSON.stringify({panel,go:!!document.querySelector('[data-a=upgo]'),txt:document.querySelector('.upc').textContent.slice(0,40)})"))
    await ev("()=>closePanel()")
    # 집 안에서도 아래로 걸으면 안 나가짐, 문 앞에서 [나가기]
    await ev("()=>{P.x=INT.x-.2;P.z=INT.z-.5;for(let i=0;i<90;i++)moveEnt(P,0,.08)}");await pg.wait_for_timeout(800)
    print('houseStay',await ev("()=>JSON.stringify({on:INT.on,lz:+(P.z-INT.z).toFixed(2),lab:(findTarget()||{}).lab||null})"))
    await ev("()=>{inp.actEdge=true;target=findTarget();interact();inp.actEdge=false}");await pg.wait_for_timeout(1700)
    print('houseExit',await ev("()=>JSON.stringify({on:INT.on})"))
    # 9) 집 철거 → 텐트 키트 + 나무 60
    print('demo',await ev("()=>{const h=structs.find(s=>s.t==='phouse');P.x=h.x;P.z=h.z+3;const k0=invN('kit_tent'),w0=invN('wood');setBuild('demo');placeBuild();setBuild(null);return JSON.stringify({house:structs.filter(s=>s.t==='phouse').length,kit:invN('kit_tent')-k0,wood:invN('wood')-w0})}"))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
