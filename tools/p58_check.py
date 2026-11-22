# 58차(디자인): 캐릭터 정리(탐험가·골든 리트리버만 남기고 긴 다리 리트리버·고양이 빼기) + 오리너구리
# 기대: 고르기 카드 = hero·dog·plat, DGV = dog·plat, 오리너구리 몸 만들기·입히기·걷기 오류 없음, 부리·꼬리 붙음,
#       예전에 'dog2'를 골랐으면 'dog', 'cat'이면 'hero' / errs []
# 사진: tools/out/p58_plat_views.jpg(앞·3/4·옆·뒤), p58_cards.png(시작 화면 카드), p58_game.jpg(게임 안), p58_hats.jpg
import base64
async def steps(pg):
    ev=pg.evaluate
    O=lambda n:'tools/out/'+n
    print('defs',await ev("""()=>JSON.stringify({cards:DGCH.map(c=>c.id),dgv:Object.keys(DGV),plat:(()=>{const G=dgBuild('plat');return {tris:G.tris,ms:G.ms,parts:G.parts.map(p=>p.k)}})(),dog:dgBuild('dog').tris})"""))
    # 크게 여러 방향에서 그리기
    urls=await ev("""()=>{const out=[];const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(1);r.setSize(420,460);
      const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff2e0,0x7d6c5c,1.0));const dl=new THREE.DirectionalLight(0xfff4e4,.95);dl.position.set(2.5,4,6);sc.add(dl);
      const a=new Actor('hero');scene.remove(a.root);sc.add(a.root);a.play('Idle',{force:1});a.mixer.update(.4);dogApply(a,'plat');
      for(const ry of [0,.7,1.57,3.14]){a.root.rotation.y=ry;const pc=new THREE.PerspectiveCamera(22,420/460,.1,50);pc.position.set(0,1.55,7.2);pc.lookAt(0,1.0,0);r.render(sc,pc);out.push(r.domElement.toDataURL())}
      dogApply(a,'dog');a.root.rotation.y=.5;{const pc=new THREE.PerspectiveCamera(22,420/460,.1,50);pc.position.set(0,1.55,7.2);pc.lookAt(0,1.0,0);r.render(sc,pc);out.push(r.domElement.toDataURL())}
      dogApply(a,null);sc.remove(a.root);r.dispose();return out}""")
    from PIL import Image
    import io
    ims=[Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA') for u in urls]
    W=sum(i.width for i in ims);H=ims[0].height;sheet=Image.new('RGB',(W,H),(236,226,206))
    x=0
    for i in ims: sheet.paste(i,(x,0),i);x+=i.width
    sheet.save(O('p58_plat_views.jpg'),quality=90)
    # 게임 안: 오리너구리로 바꾸고 걷기
    print('apply',await ev("""()=>{DOG.sel='plat';return 1}"""));await pg.wait_for_timeout(1200)
    print('worn',await ev("""()=>JSON.stringify({v:P.a.dog&&P.a.dog.v,bill:!!P.a.dog&&P.a.dog.add.length>0,holder:P.a.holder.parent&&P.a.holder.parent.name,tail:!!(P.a.dog&&P.a.dog.piv.tail)})"""))
    await ev("()=>{S.time=.42;P.x=VIL.x;P.z=VIL.z+1;P.rot=0.5;try{ZOOM.t=.74}catch(e){};zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p58_game.jpg'),type='jpeg',quality=88)
    # 걷기·손에 든 것
    await ev("()=>{S.inv.axe=1;bagTap('axe')}");await pg.wait_for_timeout(300)
    await ev("()=>{inp.mx=.8;inp.mz=.3}");await pg.wait_for_timeout(1600);await ev("()=>{inp.mx=0;inp.mz=0}")
    await pg.wait_for_timeout(300);await pg.screenshot(path=O('p58_walk.jpg'),type='jpeg',quality=88,clip={'x':300,'y':90,'width':280,'height':240})
    # 모자
    for i,h in enumerate(['hat_plunder','hat_lumber','hat_combat','hat_pumpkin']):
        await ev(f"()=>{{S.inv['{h}']=1;bagTap('{h}');P.a._hatK=null;P.x=VIL.x;P.z=VIL.z+1;P.rot=.45}}");await pg.wait_for_timeout(700)
        await pg.screenshot(path=O(f'p58_hat_{i}.jpg'),type='jpeg',quality=85,clip={'x':330,'y':110,'width':220,'height':200})
    hs=[Image.open(O(f'p58_hat_{i}.jpg')) for i in range(4)];hh=Image.new('RGB',(880,200));[hh.paste(h,(i*220,0)) for i,h in enumerate(hs)];hh.save(O('p58_hats.jpg'),quality=88)
    # 예전 선택 옮기기: 다시 켜서 확인
    res={}
    for old,want in [('dog2','dog'),('cat','hero'),('plat','plat')]:
        await ev(f"()=>{{localStorage.setItem('frontisle_char','{old}')}}");await pg.reload();await pg.wait_for_timeout(2500)
        res[old]=await ev("()=>DOG.sel")
    print('migrate',res,'ok' if res=={'dog2':'dog','cat':'hero','plat':'plat'} else 'BAD')
    await pg.wait_for_timeout(2500)
    try:
        el=await pg.query_selector('#chSel')
        if el: await el.screenshot(path=O('p58_cards.png'))
    except Exception as e: print('cards',e)
    await ev("()=>{localStorage.removeItem('frontisle_char')}")
