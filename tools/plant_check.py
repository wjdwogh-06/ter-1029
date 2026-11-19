# 식물 도감·배치·채집 검사(17·19차)
# 기대: items 12·icons 12·inVend 0 / sites 12·본섬만·종류 12개 한 번씩·구역마다 11포기·설치 금지 원과 안 겹침·구조물 안 0·bad 0·다시 자라기 900초
#       라벨 '○○ 캐기·따기·꺾기' / 따면 가방+도감·다시 안 보임·다시 자람 / 모양: 가까운 것만 그림 / 낚싯대 들면 대상 아님 / 멀리서 누르면 그대로(tapFar got 0·moved 0), 붙어서 누르면 따기
#       식물 위 설치 막힘 / 도감 창에 자라는 곳(본섬 ○쪽) / 저장에 pdex·pgone / errs []
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('items',await ev("()=>{const ids=PLANTS.map(q=>q.id);return JSON.stringify({items:ids.filter(k=>ITEMS[k]&&ITEMS[k].ty==='plant').length,icons:ids.filter(k=>/^data:image/.test(ICON[k]||'')).length,inVend:vendPool().filter(k=>ids.includes(k)).length,re:[...new Set(PLANTS.map(q=>q.re))]})}"))
    print('sites',await ev("""()=>{const r={sites:PLANT_SITES.length,kinds:new Set(PLANT_SITES.map(s=>s.p)).size,off:[],nob:[],per:[],bad:[],gap:[],spread:[]};
      PLANT_SITES.forEach((st,si)=>{const I=islAt(st.x,st.z);if(!I||I.n!=='초승달 본섬')r.off.push(st.p);for(const o of NOB)if(dist(st.x,st.z,o.x,o.z)<st.r+o.r)r.nob.push(st.p+'~'+o.k);
        const L=PL.list.filter(p=>p.si===si);r.per.push(L.length);
        let mn=1e9;for(const p of L)for(const q of L)if(p!==q)mn=Math.min(mn,dist(p.x,p.z,q.x,q.z));r.gap.push(+mn.toFixed(1));
        const far=Math.max(...L.map(p=>dist(p.x,p.z,st.x,st.z)));r.spread.push(+far.toFixed(1));
        for(const p of L){if(p.id!==st.p)r.bad.push('kind');if(hAt(p.x,p.z)<.95)r.bad.push('water');if(onDock(p.x,p.z))r.bad.push('dock');for(const s of structs)if(!sdef(s).pass&&!(/^pb_/.test(s.t)&&s.x===p.x&&s.z===p.z)&&inStruct(s,p.x,p.z,.4))r.bad.push('struct:'+s.t)}});
      r.total=PL.list.length;r.where=PLANTS.map(q=>q.n+': '+(PL.where[q.id]||[]).join(', '));return JSON.stringify(r)}"""))
    print('solid',await ev("()=>{const a=PL.list.find(p=>p.id==='avocado'),m=PL.list.find(p=>p.id==='mush');return JSON.stringify({avocado:walk(a.x+.3,a.z,.42,P)!==null,mush:walk(m.x,m.z,.42,P)!==null})}"))
    # 밀 구역(스폰에서 가장 가까움) 가까이 서면 라벨
    print('label',await ev("""()=>{const p=PL.list.find(q=>q.id==='wheat');window.TQp=p;P.x=p.x;P.z=p.z+1.0;P.rot=Math.PI;P.auto=null;S.quick[S.sel]=null;target=findTarget();return JSON.stringify({k:target&&target.k,lab:target&&target.lab})}"""))
    await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(900);await pg.screenshot(path=O('plant_field.jpg'),type='jpeg',quality=85)
    print('pick',await ev("""()=>{const w0=invN('wheat');P.cd=0;inp.actEdge=true;target=findTarget();interact();inp.actEdge=false;const p=TQp;
      return JSON.stringify({got:invN('wheat')-w0,dex:S.pdex.wheat,gone:S.pgone[p.i],toast:document.getElementById('toast').textContent})}"""))
    await pg.wait_for_timeout(400)
    print('model',await ev("()=>{const M=PL.im.wheat;let n=0;for(const id in PL.im)n+=PL.im[id].a.count;return JSON.stringify({has:!!M,grown:M.a.count,drawnNear:n,total:PL.list.length})}"))
    await ev("()=>{S.pgone[TQp.i]=.05}");await pg.wait_for_timeout(600)
    print('regrow',await ev("()=>JSON.stringify({gone:!!S.pgone[TQp.i],back:!plGone(TQp),popping:TQp.pop!=null})"))
    # 22차: 따면 완전히 사라짐(그림·충돌 없음) → 그 자리에 설치 가능 → 덮여 있으면 안 자람 → 치우면 '뿅'
    # 기대: before 1·after 0 / colBefore true·colAfter false / walkAfter true / ghost ok / covered true / back true·col true
    await ev("()=>{const p=PL.list.find(q=>q.id==='avocado');window.TQa=p;P.x=p.x;P.z=p.z+3.2;P.rot=Math.PI;unstuck();P.auto=null;S.quick[S.sel]='axe';updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(900);await pg.screenshot(path=O('plant_gone_before.jpg'),type='jpeg',quality=85)
    print('gone',await ev("""()=>{const p=TQa,M=PL.im.avocado,cnt=()=>{plUpdate();let n=0;for(let i=0;i<M.a.count;i++){const m=new THREE.Matrix4();M.a.getMatrixAt(i,m);const v=new THREE.Vector3().setFromMatrixPosition(m);if(Math.abs(v.x-p.x)<.01&&Math.abs(v.z-p.z)<.01)n++}return n};
      const r={before:cnt(),colBefore:structs.includes(p.sb),walkBefore:walk(p.x,p.z,.42,P)!==null};P.x=p.x;P.z=p.z+1.1;P.rot=Math.PI;P.cd=0;target=plTarget(p);interact();
      r.picked=plGone(p);r.after=cnt();r.colAfter=structs.includes(p.sb);r.walkAfter=walk(p.x,p.z,.42,P)!==null;r.eMesh=Object.values(PL.im).some(m=>m.e);
      S.inv.wood=50;S.inv.stone=50;setBuild('fire');const b=BUILDS.fire,d=Math.max(b.bx,b.bz)+1.6;P.x=p.x;P.z=p.z-d;P.rot=0;const g=ghostPos();r.ghost={ok:g.ok,why:g.why||'',dx:+(g.x-p.x).toFixed(2),dz:+(g.z-p.z).toFixed(2)};setBuild(null);
      P.x=p.x;P.z=p.z+3.2;P.rot=Math.PI;return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(500);await pg.screenshot(path=O('plant_gone_after.jpg'),type='jpeg',quality=85)
    print('cover',await ev("""()=>{const p=TQa;window.TQf=addStruct({t:'fire',x:p.x,z:p.z,r:0,own:1,hp:BUILDS.fire.hp});S.pgone[p.i]=.05;return JSON.stringify({cover:!!plnCover(p)})}"""))
    await pg.wait_for_timeout(700);await pg.screenshot(path=O('plant_gone_built.jpg'),type='jpeg',quality=85)
    print('covered',await ev("()=>JSON.stringify({stillGone:plGone(TQa),t:+(S.pgone[TQa.i]||0).toFixed(1),col:structs.includes(TQa.sb)})"))
    await ev("()=>{removeStruct(TQf);P.x=TQa.x+.2;P.z=TQa.z+.1}")   # 치웠지만 사람이 그 위에 서 있음 → 기다림
    await pg.wait_for_timeout(3600)
    print('standing',await ev("()=>JSON.stringify({stillGone:plGone(TQa)})"))
    await ev("()=>{P.x=TQa.x;P.z=TQa.z+3.2;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    for _ in range(14):
        await pg.wait_for_timeout(300)
        if await ev("()=>!plGone(TQa)"): break
    print('popback',await ev("()=>JSON.stringify({back:!plGone(TQa),popping:TQa.pop!=null,k:TQa.pop!=null?+plnPopK(TQa.pop/PL.POP).toFixed(2):1,col:structs.includes(TQa.sb)})"))
    await pg.wait_for_timeout(150);await pg.screenshot(path=O('plant_gone_pop.jpg'),type='jpeg',quality=85)
    await pg.wait_for_timeout(700)
    print('popdone',await ev("()=>JSON.stringify({pop:TQa.pop,pops:PL.pops.length})"))
    await ev("()=>{S.quick[S.sel]=null}")
    print('rod',await ev("()=>{give('rod',1);S.quick[S.sel]='rod';P.auto=null;target=findTarget();const r={k:target&&target.k||null};S.quick[S.sel]=null;return JSON.stringify(r)}"))
    # 딸기 구역(34차): 멀리서 누르면 걸어가지 않고 안 따짐, 바짝 붙어서 누르면 따짐
    await ev("()=>{const p=PL.list.find(q=>q.id==='strawberry'&&!plGone(q));window.TQpl=p;window.TQs0=invN('strawberry');P.x=p.x+4.5;P.z=p.z+2;unstuck();P.cd=0;P.auto=null;window.TQp0=[P.x,P.z];worldTap(p.x,p.z)}")
    await pg.wait_for_timeout(1000)
    print('tapFar',await ev("()=>JSON.stringify({got:invN('strawberry')-TQs0,gone:plGone(TQpl),moved:+Math.hypot(P.x-TQp0[0],P.z-TQp0[1]).toFixed(2),auto:!!P.auto})"))
    await ev("()=>{const p=TQpl;P.x=p.x;P.z=p.z+1.0;P.rot=Math.PI;P.cd=0;target=findTarget();worldTap(p.x,p.z)}");await pg.wait_for_timeout(500)
    print('tap',await ev("()=>JSON.stringify({got:invN('strawberry')-TQs0,gone:plGone(TQpl)})"))
    await ev("()=>updCamera(0,P.x,groundY(P.x,P.z),P.z,true)");await pg.wait_for_timeout(700);await pg.screenshot(path=O('plant_field2.jpg'),type='jpeg',quality=85)
    print('build',await ev("""()=>{S.inv.wood=50;S.inv.stone=50;setBuild('fire');const why={};for(const p of PL.list){if(plGone(p))continue;P.x=p.x;P.z=p.z-2.4;P.rot=0;const g=ghostPos();why[g.why||'ok']=(why[g.why||'ok']||0)+1}setBuild(null);return JSON.stringify(why)}"""))
    # 22차: 모두 딴 뒤 같은 자리에 다시 놓아 보기 → '식물과 겹쳐요'·식물 충돌 상자 때문에 막힘이 0이어야 해요(남은 이유는 바위·나무 등 원래 땅)
    print('buildGone',await ev("""()=>{const keep=Object.assign({},S.pgone);for(const p of PL.list)S.pgone[p.i]=900;for(const p of PL.list)plnCol(p);setBuild('fire');const why={};let ok=0;
      for(const p of PL.list){P.x=p.x;P.z=p.z-2.4;P.rot=0;const g=ghostPos();if(g.ok)ok++;else why[g.why]=(why[g.why]||0)+1}setBuild(null);
      const cols=PL.list.filter(p=>p.sb&&structs.includes(p.sb)).length;S.pgone=keep;for(const p of PL.list)plnCol(p);return JSON.stringify({ok,why,colsWhileGone:cols,colsBack:PL.list.filter(p=>p.sb&&structs.includes(p.sb)).length})}"""))
    # 구역마다 사진 몇 장(가운데에 서서)
    for k in ['potato','flower_yellow','avocado','mush_censer']:
        await ev("(k)=>{const st=PLANT_SITES.find(s=>s.p===k);P.x=st.x;P.z=st.z+6;unstuck();P.auto=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}",k)
        await pg.wait_for_timeout(900);await pg.screenshot(path=O('plant_zone_'+k+'.jpg'),type='jpeg',quality=85)
    # 지도에 구역 원 그려 보기(검사용 그림, 게임에는 안 그려요)
    await ev("""()=>{openPanel('map');const c=document.getElementById('bigmap'),x=c.getContext('2d'),k=c.width/WS;x.lineWidth=3;x.font='bold 15px sans-serif';x.textAlign='center';
      for(const o of NOB){x.strokeStyle='rgba(230,60,50,.75)';x.beginPath();x.arc(o.x*k,o.z*k,o.r*k,0,7);x.stroke()}
      for(const st of PLANT_SITES){x.strokeStyle='#1f7a2f';x.fillStyle='rgba(120,220,120,.35)';x.beginPath();x.arc(st.x*k,st.z*k,st.r*k,0,7);x.fill();x.stroke();x.fillStyle='#10351a';x.fillText(ITEMS[st.p].n,st.x*k,st.z*k-st.r*k-4)}
      for(const p of PL.list){x.fillStyle='#0b4d1c';x.fillRect(p.x*k-1.5,p.z*k-1.5,3,3)}}""")
    await pg.wait_for_timeout(300);await pg.screenshot(path=O('plant_map.jpg'),type='jpeg',quality=90);await ev("()=>closePanel()")
    await ev("()=>{openPanel('menu')}");await pg.wait_for_timeout(300)
    await ev("()=>{const b=document.getElementById('pbody');b.scrollTop=b.scrollHeight}");await pg.wait_for_timeout(300)
    print('dex',await ev("()=>{const t=document.getElementById('pbody').textContent;const i=t.indexOf('식물 도감');return JSON.stringify({has:i>=0,head:t.slice(i,i+12),where:t.includes('자라는 곳: 초승달 본섬'),undecided:t.includes('아직 정해지지')})}"))
    await pg.screenshot(path=O('plant_dex.jpg'),type='jpeg',quality=85);await ev("()=>closePanel()")
    print('save',await ev("()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));return JSON.stringify({pdex:d.S.pdex,pgone:Object.keys(d.S.pgone||{}).length})}"))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
