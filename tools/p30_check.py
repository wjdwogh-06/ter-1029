# 30차 검사: 재화·탄알 표시, 두 손가락 확대·축소, 텐트 12시간·남은 시간, 집 크기, 탄알 통일·제작 없음, 가방 누르기·끌어 버리기
# 기대: errs=[], 아래 각 줄의 ok가 모두 true
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    # ① ② 재화·탄알 표시
    r=await ev("""()=>{const out={};give('ammoS',0);S.quick[S.sel]='pistol';hud();const pl=document.getElementById('pills');out.gun={html:pl.innerHTML.slice(0,160),imgs:pl.querySelectorAll('img').length,txt:pl.firstElementChild&&pl.firstElementChild.textContent,ammo:invN('ammoS')};
      give('axe',1);S.quick[S.sel]='axe';hud();out.axe={n:pl.children.length,imgs:pl.querySelectorAll('img').length};S.quick[S.sel]='pistol';hud();
      openPanel('bag');out.bagCoin=document.getElementById('pcoin').textContent.trim();closePanel();out.zoomBtn=getComputedStyle(document.getElementById('bZoom')).display;
      out.ok=out.gun.imgs===0&&out.gun.txt===String(out.gun.ammo)&&out.axe.n===0&&out.bagCoin===String(S.coins)&&out.zoomBtn==='none';return JSON.stringify(out)}""")
    print('hud',r)
    await pg.wait_for_timeout(300);await pg.screenshot(path=O('p30_hud.jpg'),type='jpeg',quality=85)
    # ③ 두 손가락
    r=await ev("""async()=>{const W=innerWidth,H=innerHeight,ev=(t,id,x,y)=>cv.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,pointerType:'touch',isPrimary:id===21}));const sl=ms=>new Promise(r=>setTimeout(r,ms));
      const z0=zoomK;ev('pointerdown',21,W*.3,H*.5);await sl(30);ev('pointerdown',22,W*.6,H*.5);await sl(30);
      for(let i=1;i<=10;i++){ev('pointermove',21,W*.3-i*12,H*.5);ev('pointermove',22,W*.6+i*12,H*.5);await sl(16)}await sl(500);const zin=zoomK,joyId=joy.id,mx=inp.mx,nt=Object.keys(taps).length;
      for(let i=1;i<=20;i++){ev('pointermove',21,W*.3-120+i*9,H*.5);ev('pointermove',22,W*.6+120-i*9,H*.5);await sl(16)}await sl(600);const zout=zoomK;
      ev('pointerup',22,W*.6,H*.5);await sl(30);ev('pointermove',21,W*.1,H*.5);await sl(50);const afterOne={joy:joy.id,mx:inp.mx,fire:inp.fire};ev('pointerup',21,W*.1,H*.5);await sl(30);
      const ok=zin<z0-.15&&zin>=.74-1e-6&&zout>zin+.3&&zout<=1.3+1e-6&&joyId===null&&mx===0&&nt===0&&afterOne.joy===null&&afterOne.mx===0&&!afterOne.fire&&!ZOOM.on;
      return JSON.stringify({z0,zin:+zin.toFixed(3),zout:+zout.toFixed(3),joyId,mx,nt,afterOne,ok})}""")
    print('pinch',r)
    await ev("()=>{ZOOM.t=.74}");await pg.wait_for_timeout(700);await pg.screenshot(path=O('p30_zoomin.jpg'),type='jpeg',quality=85)
    await ev("()=>{ZOOM.t=1.3}");await pg.wait_for_timeout(700);await pg.screenshot(path=O('p30_zoomout.jpg'),type='jpeg',quality=85)
    await ev("()=>{ZOOM.t=1}");await pg.wait_for_timeout(500)
    # ④ 집 크기 · 텐트 남은 시간 (빈 땅을 찾아 텐트와 집을 나란히)
    r=await ev("""()=>{let spot=null;for(let rr=8;rr<120&&!spot;rr+=3)for(let a=0;a<24&&!spot;a++){const x=VIL.x+Math.cos(a*.26)*rr,z=VIL.z+Math.sin(a*.26)*rr;let ok=true;for(const dx of[-5,0,5])for(const dz of[-3,0,3]){const xx=x+dx,zz=z+dz;if(hAt(xx,zz)<.95||walk(xx,zz,2.4,null)!==null||onDock(xx,zz)||nobAt(xx,zz,2.4))ok=false}if(ok)spot=[x,z]}
      if(!spot)return 'nospot';const t=addStruct({t:'ptent',x:spot[0]-2.6,z:spot[1],r:0,own:1}),h=addStruct({t:'phouse',x:spot[0]+2.6,z:spot[1],r:0,own:1});P.x=spot[0];P.z=spot[1]+5;P.yv=undefined;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);
      window._T=t;window._H=h;save();const sb=S.built.find(b=>b.t==='ptent'&&Math.abs(b.x-t.x)<.01);return JSON.stringify({spot,at:t.at,saved:sb&&sb.at===t.at,houseAt:h.at||null,left:tentLeftTx(tentLeft(t))})}""")
    print('tent',r)
    await pg.wait_for_timeout(900);await pg.screenshot(path=O('p30_tent_house.jpg'),type='jpeg',quality=85)
    await ev("()=>{_T.at=Date.now()-TENT_LIFE+40*60e3}");await pg.wait_for_timeout(400);await pg.screenshot(path=O('p30_tent_red.jpg'),type='jpeg',quality=85)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));_T.at=Date.now()-TENT_LIFE+1200;const home0=JSON.stringify(S.home);await sl(2600);const gone=!structs.includes(_T),house=structs.includes(_H);
      /* 안에 있을 때 사라지면 밖으로 */const t2=addStruct({t:'ptent',x:_T.x,z:_T.z,r:0,own:1});intEnter(t2);await sl(1400);const inn=INT.on;t2.at=Date.now()-TENT_LIFE+500;await sl(2200);
      return JSON.stringify({gone,house,inside:inn,outAfter:!INT.on,gone2:!structs.includes(t2),home:S.home,ok:gone&&house&&inn&&!INT.on&&!structs.includes(t2)})}""")
    print('expire',r)
    # ⑤ 탄알 통일 · 제작 없음 · 예전 저장 합치기
    r=await ev("""()=>{const guns=['pistol','rifle','shotgun','smg'].map(k=>WEAP[k].ammo),rec=RECIPES.map(r=>r.id),pat=Object.keys(CRAFT_PAT);
      const a0=invN('ammoS');openPanel('shop');const b=document.querySelector('[data-a=buy][data-k=ammoS]');if(b)b.click();const bought=invN('ammoS')-a0;closePanel();
      S.inv.ammoL=10;S.stash.ammoL=4;const a1=invN('ammoS'),rm=dropRemoved();const merged=invN('ammoS')-a1;
      give('rifle',1);S.quick[S.sel]='rifle';const a2=invN('ammoS');P.cd=0;try{attack&&attack()}catch(e){}const used=a2-invN('ammoS');
      const ok=guns.every(g=>g==='ammoS')&&!ITEMS.ammoL&&!rec.some(k=>['axe','rod','ammoS','ammoL'].includes(k))&&!pat.some(k=>['axe','rod','ammoS','ammoL'].includes(k))&&SHOP.sell.includes('ammoS')&&SHOP.sell.includes('axe')&&SHOP.sell.includes('rod')&&bought===12&&merged===10&&S.stash.ammoS>=4&&!('ammoL' in S.stash)&&!rm.length&&ITEMS.ammoS.n==='탄알';
      return JSON.stringify({guns,rec,bought,merged,stash:S.stash.ammoS,rm,used,name:ITEMS.ammoS.n,ok})}""")
    print('ammo',r)
    # ⑥ 가방 누르기 · 끌어서 버리기
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const out={};give('pistol',1);give('can',3);give('wood',5);S.quick[S.sel]=null;S.hp=50;openPanel('bag');await sl(50);
      const slot=k=>document.querySelector(`#pbody [data-a=sel][data-k="${k}"]`);slot('pistol').click();await sl(30);out.eq1=curId();renderPanel();slot('pistol').click();await sl(30);out.eq2=curId();
      renderPanel();const c0=invN('can');slot('can').click();await sl(30);out.ate=c0-invN('can');out.hp=S.hp;renderPanel();const w0=invN('wood');slot('wood').click();await sl(30);out.wood=invN('wood')===w0&&selItem==='wood';renderPanel();
      out.info=!document.getElementById('pbody').textContent.includes('끌어서 가방 밖에');   /* 38차: 아래 안내 글 없음 */out.btns=document.querySelectorAll('#pbody [data-a=use],#pbody [data-a=equip],#pbody [data-a=drop]').length;
      /* 끌어서 창 안에 놓기 → 안 버림 */const pe=(t,el,x,y)=>el.dispatchEvent(new PointerEvent(t,{pointerId:31,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}));
      let s=slot('wood'),r=s.getBoundingClientRect();pe('pointerdown',s,r.x+20,r.y+20);for(let i=1;i<=6;i++)pe('pointermove',s,r.x+20+i*8,r.y+20+i*4);out.ghost=!!document.getElementById('bagDrag');pe('pointerup',s,r.x+68,r.y+44);s.click();await sl(30);out.keepIn=invN('wood')===w0&&!document.getElementById('bagDrag');
      /* 끌어서 창 밖(왼쪽 화면)에 놓기 → 버림 */const nd=drops.length;s=slot('wood');r=s.getBoundingClientRect();pe('pointerdown',s,r.x+20,r.y+20);for(let i=1;i<=12;i++)pe('pointermove',s,r.x+20-i*(r.x/12),r.y+20);const outCls=document.getElementById('bagDrag').classList.contains('out');
      pe('pointerup',s,20,r.y+20);await sl(60);out.dropped=!invN('wood')&&drops.length===nd+1;out.outCls=outCls;closePanel();
      out.ok=out.eq1==='pistol'&&out.eq2==='fist'&&out.ate===1&&out.wood&&out.info&&out.btns===0&&out.ghost&&out.keepIn&&out.dropped&&outCls;return JSON.stringify(out)}""")
    print('bag',r)
    await ev("()=>{give('wood',5);openPanel('bag');selItem='pistol';renderPanel()}");await pg.wait_for_timeout(400);await pg.screenshot(path=O('p30_bag.jpg'),type='jpeg',quality=85)
    await ev("()=>closePanel()")
