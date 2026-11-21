# 49차(디자인): 새 아이템 30종 그림 · 포탑 키트 · 콘크리트 울타리·문 검사
# 기대: defs 모두 있고 아이콘·모델 빠진 것 0·자판기 목록에 모두·화약/구리 그림 바뀜
#       포탑 키트: 가방에서 눌러 설치 모드 → 키트 1개 씀(재료는 안 씀) → 포탑 섬·철거하면 키트 돌아옴
#       콘크리트 울타리 두 칸 붙여 놓기 · 문은 사람이 가까이 오면 열리고(door 회전) 멀면 닫힘 · 플레이어는 문을 지나감 · errs []
# 사진: tools/out/p49_icons.png(아이콘 판), p49_build.jpg(울타리·문·포탑)
import os,json,base64
NEW=['salt','pepper','gp_wstock','gp_sstock','gp_rbarrel','gp_sbarrel','charm','ore_gold','bar_gold','ore_silver','bar_silver','ore_iron','bar_iron','copper','bar_copper',
     'coal','bar_coal','ore_ti','bar_ti','tarp','nails','pcb2','plastic','att_scope','cement','powder','kit_turret','kit_fconc','kit_gconc']
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('defs',await ev("""(A)=>{const pool=vendPool();return JSON.stringify({n:A.length,noItem:A.filter(k=>!ITEMS[k]),noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),noGeo:A.filter(k=>!GEO[ITEMS[k].ic]),
      notVend:A.filter(k=>!pool.includes(k)),powderIc:ITEMS.powder.ic,copperIc:ITEMS.copper.ic,turretKit:BUILDS.turret.kit,builds:['fence_conc','gate_conc'].filter(k=>BUILDS[k]&&GEO[BUILDS[k].g]).length,
      gateDoor:!!GEO.lk_gate_conc_door,tris:Object.fromEntries(A.map(k=>[k,Math.round(GEO[ITEMS[k].ic].attributes.position.count/3)]))})}""",NEW))
    # 아이콘 판(이름 붙여서)
    url=await ev("""async(A)=>{const N=128,C=6,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+16);c.height=rows*(N+34);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+16)+8,y=((i/C)|0)*(N+34)+4;k.drawImage(im,x,y);k.fillStyle='#5b3d2b';k.font='bold 15px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+20)}
      return c.toDataURL()}""",NEW)
    open(O('p49_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    await ev("""()=>{window.findSpot=(k,x0,z0)=>{setBuild(k);for(let i=0;i<1600;i++){P.x=x0+(i%40)*2.3;P.z=z0+((i/40)|0)*2.4;P.rot=0;const g=ghostPos();if(g.ok)return g}return null}}""")
    # 포탑 키트
    print('turret',await ev("""()=>{for(const k in BUILDS.turret.c)S.inv[k]=0;S.inv.kit_turret=1;const g=findSpot('turret',VIL.x-60,VIL.z+70);if(!g)return 'no spot';setBuild(null);
      primary('kit_turret');const r={mode:bmode||null,canBuild:canBuild('turret')};const g2=ghostPos();r.ok=g2.ok||g2.why;placeBuild();setBuild(null);
      const s=structs.find(q=>q.own&&q.t==='turret');r.placed=!!s;r.kitLeft=invN('kit_turret');r.sKit=s&&s.kit;r.scrapUsed=invN('scrap');window.TQt=s;
      bmode='demo';P.x=s.x;P.z=s.z+1.2;BPIN.on=true;BPIN.x=s.x;BPIN.z=s.z;try{placeBuild()}catch(e){r.err=String(e)}BPIN.on=false;setBuild(null);bmode=null;
      r.gone=!structs.includes(s);r.kitBack=invN('kit_turret');return JSON.stringify(r)}"""))
    # 콘크리트 울타리 두 칸 + 문 + 포탑(사진용)
    print('fence',await ev("""()=>{S.inv.kit_fconc=3;S.inv.kit_gconc=1;S.inv.kit_turret=1;const r={};const g=findSpot("fence_conc",VIL.x-90,VIL.z+30);if(!g)return 'no spot';placeBuild();
      BPIN.on=true;BPIN.x=g.x+2;BPIN.z=g.z;let g2=ghostPos();r.f2=g2.ok||g2.why;if(g2.ok)placeBuild();BPIN.on=false;setBuild(null);
      setBuild('gate_conc');BPIN.on=true;BPIN.x=g.x+4;BPIN.z=g.z;let g3=ghostPos();r.gate=g3.ok||g3.why;if(g3.ok)placeBuild();
      setBuild('fence_conc');BPIN.x=g.x+6;BPIN.z=g.z;let g4=ghostPos();r.f3=g4.ok||g4.why;if(g4.ok)placeBuild();
      setBuild('turret');for(const [dx,dz] of [[2,3],[-2,3],[4,3.5],[0,-3],[3,-3],[-3,-3]]){BPIN.x=g.x+dx;BPIN.z=g.z+dz;const g5=ghostPos();r.tur=g5.ok||g5.why;if(g5.ok){placeBuild();break}}BPIN.on=false;setBuild(null);
      r.fences=structs.filter(q=>q.own&&q.t==='fence_conc').length;const gt=structs.find(q=>q.own&&q.t==='gate_conc');window.TQg=gt;r.door=!!(gt&&gt.lk&&gt.lk.parts.door);r.kitsLeft=[invN('kit_fconc'),invN('kit_gconc')];
      r.blocksPlayer=!!blocked(gt.x,gt.z,.42,0,1);r.blocksEnemy=!!blocked(gt.x,gt.z,.42,0,0);r.fenceBlocks=!!blocked(g.x,g.z,.42,0,1);
      P.x=gt.x;P.z=gt.z+6;window.TQf=g;return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(700)
    shut=await ev("()=>TQg.lk.parts.door.rotation.y.toFixed(2)")
    await ev("()=>{P.x=TQg.x;P.z=TQg.z+1.2}");await pg.wait_for_timeout(900)
    opened=await ev("()=>TQg.lk.parts.door.rotation.y.toFixed(2)")
    print('gate',json.dumps({'farDoor':shut,'nearDoor':opened}))
    await ev("()=>{P.x=TQg.x-1.6;P.z=TQg.z+3.2;P.rot=Math.PI;S.time=.42;try{ZOOM.t=.74}catch(e){};zoomK=.74}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O('p49_build.jpg'),type='jpeg',quality=85)
    await ev("()=>{P.x=TQg.x+.2;P.z=TQg.z+1.3}");await pg.wait_for_timeout(1200)
    await pg.screenshot(path=O('p49_gate_open.jpg'),type='jpeg',quality=85)
