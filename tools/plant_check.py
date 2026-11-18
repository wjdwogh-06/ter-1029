# 식물 도감·채집 검사(17차). 좌표는 시험용 임시 자리(기획자 좌표가 오면 PLANT_SITES에 들어감)
# 기대: items 12·icons 12·inVend 0 / placed>0·bad 0 / 라벨 '○○ 캐기·따기·꺾기' / 따면 가방+도감·다시 안 보임·다시 자람
#       낚싯대 들면 대상 아님 / 땅 눌러 걸어가서 따기 / 식물 위 설치 막힘 / 도감 창 / 저장에 pdex·pgone / errs []
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('items',await ev("()=>{const ids=PLANTS.map(q=>q.id);return JSON.stringify({items:ids.filter(k=>ITEMS[k]&&ITEMS[k].ty==='plant').length,icons:ids.filter(k=>/^data:image/.test(ICON[k]||'')).length,inVend:vendPool().filter(k=>ids.includes(k)).length,sites:PLANT_SITES.length,list:PL.list.length})}"))
    # 시험용 자리: 스폰 근처 들판 두 곳 + 다른 섬 한 곳
    print('place',await ev("""()=>{GEO.pw_potato=GEO.pw_potato||GEO.bush;GEO.pw_potato_e=GEO.pw_potato_e||GEO.bush;PL.list.length=0;PL.list.ready=0;PL.where={};PLANT_SITES.length=0;
      const near=(x,z)=>{for(let r=0;r<60;r+=3)for(let a=0;a<12;a++){const X=x+Math.cos(a)*r,Z=z+Math.sin(a)*r;if(hAt(X,Z)>1)return[X,Z]}return[x,z]};
      const a=near(VIL.x+26,VIL.z+30),b=near(VIL.x-34,VIL.z+40),c=near(PORTS[2].x+30,PORTS[2].z+25);
      PLANT_SITES.push({p:['potato','strawberry','flower_blue','mush'],x:a[0],z:a[1],r:10,c:16},{p:PLANTS.map(q=>q.id),x:b[0],z:b[1],r:12,c:24},{p:'mush_censer',x:c[0],z:c[1],r:8,c:6});plantsInit();
      let bad=[];for(const p of PL.list){if(hAt(p.x,p.z)<.95)bad.push('water');if(onDock(p.x,p.z))bad.push('dock');for(const s of structs)if(!sdef(s).pass&&!(/^pb_/.test(s.t)&&s.x===p.x&&s.z===p.z)&&inStruct(s,p.x,p.z,.4))bad.push('struct:'+s.t);for(const q of PL.list)if(q!==p&&dist(p.x,p.z,q.x,q.z)<1.55)bad.push('close')}
      return JSON.stringify({placed:PL.list.length,kinds:[...new Set(PL.list.map(p=>p.id))].length,bad:bad.slice(0,6),where:PL.where.potato,whereH:PL.where.mush_censer})}"""))
    # 가까이 서면 라벨
    print('solid',await ev("()=>{const a=PL.list.find(p=>p.id==='avocado'),m=PL.list.find(p=>p.id==='mush');return JSON.stringify({avocado:walk(a.x+.3,a.z,.42,P)!==null,mush:walk(m.x,m.z,.42,P)!==null})}"))
    print('label',await ev("""()=>{const p=PL.list.find(q=>q.id==='potato');window.TQp=p;P.x=p.x;P.z=p.z+1.3;P.rot=Math.PI;P.auto=null;S.quick[S.sel]=null;target=findTarget();return JSON.stringify({k:target&&target.k,lab:target&&target.lab})}"""))
    await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(700);await pg.screenshot(path=O('plant_field.jpg'),type='jpeg',quality=85)
    print('pick',await ev("""()=>{const w0=invN('potato');P.cd=0;inp.actEdge=true;target=findTarget();interact();inp.actEdge=false;const p=TQp;
      return JSON.stringify({got:invN('potato')-w0,dex:S.pdex.potato,gone:S.pgone[p.i],toast:document.getElementById('toast').textContent,again:(()=>{P.cd=0;const t=findNear(P.x,P.z,P.x,P.z+-.8,2.5);return t&&t.k==='pl'&&t.pl===p})()})}"""))
    await pg.wait_for_timeout(400)
    print('model',await ev("()=>{const M=PL.im.potato,n=M.L.filter(p=>Math.abs(p.x-P.x)<=PL.VD&&Math.abs(p.z-P.z)<=PL.VD).length;return JSON.stringify({has:!!M,grown:M.a.count,empty:M.e?M.e.count:null,near:n,total:M.L.length,labelOff:!!PL.im.potato})}"))
    print('far',await ev("()=>{const x=P.x,z=P.z;P.x=x+300;plUpdate();let n=0;for(const id in PL.im)n+=PL.im[id].a.count;P.x=x;plUpdate();return JSON.stringify({drawnFar:n})}"))
    await ev("()=>{S.pgone[TQp.i]=.05}");await pg.wait_for_timeout(600)
    print('regrow',await ev("()=>JSON.stringify({gone:!!S.pgone[TQp.i],back:!plGone(TQp)})"))
    # 낚싯대를 들면 대상이 아님
    print('rod',await ev("()=>{give('rod',1);S.quick[S.sel]='rod';P.auto=null;target=findTarget();const r={k:target&&target.k||null};S.quick[S.sel]=null;return JSON.stringify(r)}"))
    # 땅(식물)을 누르면 걸어가서 따기
    await ev("()=>{const p=PL.list.find(q=>q.id==='strawberry'&&!plGone(q));window.TQpl=p;window.TQs0=invN('strawberry');P.x=p.x+4.5;P.z=p.z+2;P.cd=0;P.auto=null;worldTap(p.x,p.z)}")
    for _ in range(16):
        await pg.wait_for_timeout(500)
        if await ev("()=>!P.auto"): break
    print('tap',await ev("()=>JSON.stringify({got:invN('strawberry')-TQs0,gone:plGone(TQpl),q:TQpl.i,P:[+(P.x-TQpl.x).toFixed(2),+(P.z-TQpl.z).toFixed(2)],auto:P.auto&&P.auto.k,goneList:PL.list.filter(p=>plGone(p)).map(p=>[p.i,p.id,+dist(p.x,p.z,TQpl.x,TQpl.z).toFixed(1)]),pg:S.pgone})"))
    # 식물 위에는 설치 못 함
    print('build',await ev("""()=>{S.inv.wood=50;S.inv.stone=50;setBuild('fire');const why={};let hit=null;for(const p of PL.list){if(plGone(p))continue;P.x=p.x;P.z=p.z-2.4;P.rot=0;const g=ghostPos();why[g.why||'ok']=(why[g.why||'ok']||0)+1;if(g.why==='식물과 겹쳐요'&&!hit)hit={dx:+(g.x-p.x).toFixed(2),dz:+(g.z-p.z).toFixed(2)}}setBuild(null);return JSON.stringify({why,hit})}"""))
    # 도감
    await ev("()=>{openPanel('menu')}");await pg.wait_for_timeout(300)
    await ev("()=>{const b=document.getElementById('pbody');b.scrollTop=b.scrollHeight}");await pg.wait_for_timeout(300)
    print('dex',await ev("()=>{const t=document.getElementById('pbody').textContent;const i=t.indexOf('식물 도감');return JSON.stringify({has:i>=0,head:t.slice(i,i+12),where:t.includes('자라는 곳: '),rows:document.querySelectorAll('#pbody .row img').length})}"))
    await pg.screenshot(path=O('plant_dex.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()")
    await ev("()=>{openPanel('bag');selItem='potato';renderPanel()}");await pg.wait_for_timeout(300);await pg.screenshot(path=O('plant_bag.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()")
    print('save',await ev("()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));return JSON.stringify({pdex:d.S.pdex,pgone:Object.keys(d.S.pgone||{}).length})}"))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
