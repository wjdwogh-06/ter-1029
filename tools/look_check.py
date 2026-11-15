# look.js(새 집·아이템·아이콘) 확인: 항구마을 집, 텐트, 가방 아이콘, 손에 든 도끼. 스크린샷: tools/out/look_*.jpg
async def steps(pg):
    ev=pg.evaluate
    await ev("()=>{S.time=.42;WX.t=1e9;WX.on=false;WX.b=0;enemies.slice().forEach(dropEnemy)}")
    print('houses',await ev("()=>JSON.stringify(structs.filter(s=>/home/.test(s.t)).map(s=>[s.t,s.m.children[0].geometry===GEO[s.t]?'old':Object.keys(GEO).find(k=>GEO[k]===s.m.children[0].geometry)]))"))
    print('sticker',await ev("()=>{const v=Object.values(ICON);return v.length+' icons, '+v.filter(u=>u.length>0).length}"))
    await ev("()=>{document.getElementById('ui').style.display='none';const uc=updCamera;window._pc=null;updCamera=function(dt,px,py,pz,sn){const p=_pc;if(!p){uc(dt,px,py,pz,sn);return}camT.set(p.x,1,p.z);cam.position.set(p.x,p.H,p.z+p.D);cam.lookAt(p.x,p.ly||1,p.z)}}")
    await ev("()=>{const p=PORTS[0];_pc={x:VIL.px,z:VIL.pz-6,D:22,H:20};P.x=VIL.x;P.z=VIL.z}");await pg.wait_for_timeout(1800);await pg.screenshot(path=os.path.join(OUT,'look_town.jpg'),type='jpeg',quality=90)
    if await ev("()=>!!structs.find(s=>s.t==='home_A')"):
        await ev("()=>{const h=structs.find(s=>s.t==='home_A');_pc={x:h.x,z:h.z,D:9,H:7,ly:1.6}}");await pg.wait_for_timeout(1200);await pg.screenshot(path=os.path.join(OUT,'look_house.jpg'),type='jpeg',quality=90)
    else: print('no houses (5차: 작은 항구 건물 없음)')
    await ev("()=>{_pc=null;document.getElementById('ui').style.display='';give('kit_tent',1);primary('kit_tent');for(let k=0;k<400;k++){P.x=VIL.px-40-k*1.3;P.z=VIL.pz+10+(k%7)*3;P.rot=0;if(ghostPos().ok)break}}");await pg.wait_for_timeout(300);await ev("()=>{placeBuild();setBuild(null)}")
    await ev("()=>{const t=structs.find(s=>s.t==='ptent');document.getElementById('ui').style.display='none';_pc={x:t.x,z:t.z,D:7,H:5.5,ly:.8};P.x=t.x+2.6;P.z=t.z+2.6}");await pg.wait_for_timeout(1200);await pg.screenshot(path=os.path.join(OUT,'look_tent.jpg'),type='jpeg',quality=90)
    await ev("()=>{_pc=null;document.getElementById('ui').style.display='';give('wood',12);give('stone',8);give('berry',5);give('axe',1);give('rod',1);give('kit_stash',1);S.quick[1]='axe';S.sel=1;P.a.weapon('axe');openPanel('bag')}");await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'look_bag.jpg'),type='jpeg',quality=90)
    await ev("()=>{closePanel();const t=structs.find(s=>s.t==='ptent');P.x=t.x+4;P.z=t.z+4}");await pg.wait_for_timeout(1200);await pg.screenshot(path=os.path.join(OUT,'look_play.jpg'),type='jpeg',quality=90)
