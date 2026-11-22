# 56차(디자인): 에너지 드링크·보드카(효과 시간 계산) · 모자 4종(효과·머리에 쓰기) · 길 설치 금지 구역 · 길 가장자리 검사
# 기대: defs 빠진 것 0 / 순한맛 1.05·300초 / 강한맛 1.2 → 30초 뒤 0.9 → 기운 빠짐 중 또 마시면 1.1 → … / 보드카 1.1·5초에 +5 → 999초 뒤 0.1·5초에 −10 → 쓰러지면 효과 없음
#       모자: 호박 1.3·피해 ×1.1, 전투 ×0.9·총알 안 퍼짐, 강탈 치명타 피해 2배(총·근접), 나무꾼 나무 2배 / 길 위 설치 막힘·5m 밖은 됨 / errs []
# 사진: tools/out/p56_icons.png, p56_hats_<캐릭터>.jpg, p56_road_build.jpg, p56_road.jpg
import os,json,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};if(typeof HZ!=='undefined')HZ.off=1}")
    A=['drink_mild','drink_strong','vodka','hat_plunder','hat_lumber','hat_combat','hat_pumpkin']
    print('defs',await ev("""(A)=>{const pool=vendPool();return JSON.stringify({noItem:A.filter(k=>!ITEMS[k]),noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),noGeo:A.filter(k=>!GEO[ITEMS[k].ic]),notVend:A.filter(k=>!pool.includes(k)),
      tris:Object.fromEntries(A.map(k=>[k,Math.round(GEO[ITEMS[k].ic].attributes.position.count/3)]))})}""",A))
    url=await ev("""async(A)=>{const N=128,C=4,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+40);c.height=rows*(N+34);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+40)+20,y=((i/C)|0)*(N+34)+4;k.drawImage(im,x,y);k.fillStyle='#5b3d2b';k.font='bold 14px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+20)}
      return c.toDataURL()}""",A)
    open(O('p56_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    # --- 마시는 효과: 시간 계산(bufTick으로 시간을 흘려요) ---
    print('drinks',await ev("""()=>{const r={};const sp=()=>+bufSpeed().toFixed(3),T=s=>{for(let i=0;i<s*10;i++)bufTick(.1)},L=()=>S.buffs.map(b=>b.k+':'+Math.round(b.t)).join(',');S.buffs=[];
      S.inv.drink_mild=2;S.inv.drink_strong=6;S.inv.vodka=2;
      bagTap('drink_mild');r.mild=[sp(),L()];T(299);r.mild299=sp();T(2);r.mild301=[sp(),L()];
      bagTap('drink_strong');r.s0=sp();T(29.5);r.s29=sp();T(1);r.s31=[sp(),L()];T(9);bagTap('drink_strong');r.s40again=[sp(),L()];T(21);r.s61=[sp(),L()];T(10);r.s71=[sp(),L()];T(30);r.s101=[sp(),L()];
      bagTap('drink_strong');T(5);bagTap('drink_strong');r.refresh=[L()];S.buffs=[];
      S.hp=50;bagTap('vodka');r.v0=sp();T(5.05);r.vHp5=S.hp;T(5);r.vHp10=S.hp;T(990);r.v1000=[sp(),L(),S.hp];const h0=S.hp;T(10.01);r.hang10=[h0,S.hp];
      S.hp=30;T(30);r.dead=[P.dead,S.hp,L()];return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(7500)
    print('afterDeath',await ev("()=>JSON.stringify({dead:P.dead,buffs:(S.buffs||[]).length,hp:S.hp})"))
    # 실제로 빨라지는지(moveEnt 거리)
    print('move',await ev("""()=>{S.buffs=[];P.dead=false;const x0=VIL.x,z0=VIL.z;const m=k=>{P.x=x0;P.z=z0;moveEnt(P,.2,0);return +(P.x-x0).toFixed(3)};const a=m();S.buffs=[{k:'str',t:30}];const b=m();S.buffs=[{k:'vodH',t:900}];const c=m();S.buffs=[];return JSON.stringify({plain:a,str:b,hangover:c})}"""))
    # --- 모자 ---
    print('hats',await ev("""()=>{const r={};S.buffs=[];P.dead=false;S.hp=100;P.inv=0;const eq=k=>{S.inv[k]=1;bagTap(k);return eqGet('hat')};
      r.eqPumpkin=eq('hat_pumpkin');r.spPumpkin=+bufSpeed().toFixed(2);busy=false;P.inv=0;let h=S.hp;hurtPlayer(10);r.dmgPumpkin=+(h-S.hp).toFixed(2);P.inv=0;
      r.eqCombat=eq('hat_combat');P.inv=0;busy=false;h=S.hp;hurtPlayer(10);r.dmgCombat=+(h-S.hp).toFixed(2);r.spCombat=bufSpeed();
      // 총알 퍼짐: 산탄총 쏠 때 각도들
      S.inv.shotgun=1;S.inv.ammoS=20;S.quick[S.sel]='shotgun';const hs=hitscan,ang=[];hitscan=function(x,z,dx,dz,rg,dm){ang.push(+Math.atan2(dx,dz).toFixed(4));return 3};P.cd=0;P.adx=0;P.adz=1;attack();hitscan=hs;r.spreadCombat=[...new Set(ang)].length;
      eq('hat_lumber');const ang2=[];hitscan=function(x,z,dx,dz){ang2.push(+Math.atan2(dx,dz).toFixed(4));return 3};P.cd=0;attack();hitscan=hs;r.spreadNoHat=[...new Set(ang2)].length;
      // 치명타(강탈 모자): Math.random을 잠깐 0.01로
      eq('hat_plunder');S.inv.pistol=1;S.quick[S.sel]='pistol';const dm=[];hitscan=function(x,z,dx,dz,rg,d){dm.push(d);return 3};const R0=Math.random;Math.random=()=>.01;P.cd=0;attack();Math.random=()=>.9;P.cd=0;attack();Math.random=R0;hitscan=hs;r.critPistol=dm;
      S.inv.axe=1;S.quick[S.sel]='axe';Math.random=()=>.01;P.cd=0;attack();Math.random=R0;r.critAxe=[WEAP.axe.dmg,P.hitW&&P.hitW.dmg,!!(P.hitW&&P.hitW.crit)];P.hitT=0;P.hitW=null;
      // 나무꾼: 나무 하나를 끝까지 베기(+1 확률은 0으로)
      const chop=()=>{let best=null,bd=1e9;objs.forEach(o=>{if(o.re>0||OBJT[o.t].drop[0]!=='wood')return;const d=dist(o.x,o.z,VIL.x,VIL.z);if(d<bd&&d>30){bd=d;best=o}});const key=[...objs.entries()].find(e=>e[1]===best)[0];const w0=invN('wood');Math.random=()=>.9;
        for(let i=0;i<20&&best.re<=0;i++){target={k:'o',o:best,key,x:best.x,z:best.z};P.cd=0;inp.actEdge=true;interact();inp.actEdge=false}Math.random=R0;return invN('wood')-w0};
      r.woodPlunder=chop();eq('hat_lumber');r.woodLumber=chop();
      return JSON.stringify(r)}"""))
    # 모자 쓴 모습(캐릭터마다)
    for ch in ['dog','cat','hero']:
        await ev(f"""()=>{{DOG.sel='{ch}';S.time=.42;P.x=VIL.x;P.z=VIL.z;P.rot=0.45;try{{ZOOM.t=.74}}catch(e){{}};zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}""");await pg.wait_for_timeout(1500)
        for i,h in enumerate(['hat_plunder','hat_lumber','hat_combat','hat_pumpkin']):
            await ev(f"()=>{{S.inv['{h}']=1;bagTap('{h}');P.a._hatK=null}}");await pg.wait_for_timeout(700)
            await pg.screenshot(path=O(f'p56_hat_{ch}_{i}.jpg'),type='jpeg',quality=85,clip={'x':330,'y':110,'width':220,'height':200})
    print('hatOn',await ev("()=>JSON.stringify({hat:eqGet('hat'),mesh:!!(P.a._hat&&P.a._hat.parent),layer:P.a._hat?P.a._hat.layers.mask:0})"))
    # --- 길 설치 금지 ---
    print('road',await ev("""()=>{const r={};const p=PATHS[200];S.inv.kit_tent=3;setBuild('stash');S.inv.kit_stash=3;BPIN.on=true;
      BPIN.x=p.x;BPIN.z=p.z;P.x=p.x+6;P.z=p.z+6;let g=ghostPos();r.onRoad=g.why;
      // 길에서 5~9m 떨어진 빈 땅 찾기
      let ok=null;for(let i=0;i<400&&!ok;i++){const a=i*.7,d=4.2+(i%5);const x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;BPIN.x=x;BPIN.z=z;P.x=x+3;P.z=z+3;const q=ghostPos();if(q.ok)ok=[+pathD(x,z).toFixed(2)]}
      r.offRoadOk=ok;BPIN.on=false;updNoBuild();r.zoneVisible=!!(roadNbG&&roadNbG.visible);setBuild(null);updNoBuild();r.zoneHidden=!(roadNbG&&roadNbG.visible);return JSON.stringify(r)}"""))
    await ev("()=>{const p=PATHS[60];P.x=p.x+4;P.z=p.z+6;S.time=.42;try{ZOOM.t=1.15}catch(e){};zoomK=1.15;setBuild('stash');S.inv.kit_stash=3;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p56_road_build.jpg'),type='jpeg',quality=84)
    await ev("()=>{setBuild(null);const p=PATHS[60];P.x=p.x+3;P.z=p.z+4;try{ZOOM.t=.9}catch(e){};zoomK=.9;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p56_road.jpg'),type='jpeg',quality=84)
    # 효과 알약
    await ev("()=>{S.buffs=[{k:'mild',t:250},{k:'str',t:12},{k:'vod',t:800}];S.inv.hat_pumpkin=1;bagTap('hat_pumpkin');BUF.ui=0}");await pg.wait_for_timeout(800)
    await pg.screenshot(path=O('p56_hud.jpg'),type='jpeg',quality=84,clip={'x':0,'y':0,'width':440,'height':160})
