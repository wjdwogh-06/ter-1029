# 62차(디자인): 가구 묶음 · 딱 붙여 놓기(겹치면 안 됨) · 계단 나무상자 · 랜덤 상자 · 여행용 가방 30칸 · 새 식물 5종(야생·씨앗·도감) · 설탕
# 기대: 각 줄 ok true, ALL True, errs []
# 사진: tools/out/p62_icons.png·p62_furn3d.png·p62_frames3d.png·p62_plants3d.png(p62_view.py), p62_room.jpg(밖에 붙여 놓은 가구), p62_stair.jpg, p62_tent.jpg(텐트 안), p62_bag30.jpg
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};if(typeof HZ!=='undefined')HZ.off=1}")
    res={}
    F=["deco_bush","rug_rect","rug_round","rug_oval","stool_wood","table_wround","table_wsq","chair_garden","snowman","xmas_tree","crate_sq","crate_rect","crate_stair","frame_map","frame_dog","frame_plat","frame_lh","frame_whale","frame_camp","frame_boat","frame_shark"]
    NP=['tomato','onion','corn','cacao','chili']
    d=json.loads(await ev("""(a)=>{const [F,NP]=a;const K=F.map(k=>'kit_'+k),I=['rbox','sugar','bag_travel',...NP,...NP.map(k=>'seed_'+k)],pool=vendPool();
      return JSON.stringify({noB:F.filter(k=>!BUILDS[k]||!GEO[BUILDS[k].g]||BUILDS[k].kit!=='kit_'+k||!BUILDS[k].inok),noIcon:[...K,...I].filter(k=>!ITEMS[k]||!/^data:image/.test(ICON[k]||'')),
       notVend:[...K,'sugar','bag_travel'].filter(k=>!pool.includes(k)),rboxVend:pool.includes('rbox'),plants:PLANTS.length,sites:PLANT_SITES.length,newSites:NP.map(k=>PLANT_SITES.filter(q=>q.p===k).length),
       farm:FARM.ids.length,crops:NP.filter(k=>!BUILDS['crop_'+k]||!GEO['pc_'+k+'_0']||!GEO['pc_'+k+'_1']||!GEO['pc_'+k+'_2']||!GEO['pw_'+k]||!GEO['pi_'+k]),bagEq:ITEMS.bag_travel.eq,BAGN:BAG_N})}""",[F,NP]))
    d['ok']=not d['noB'] and not d['noIcon'] and not d['notVend'] and not d['rboxVend'] and d['plants']==17 and d['sites']==17 and d['newSites']==[1]*5 and d['farm']==14 and not d['crops'] and d['bagEq']=='bag' and d['BAGN']==20
    res['defs']=d
    # 놓을 자리 찾기 + 놓기 도우미
    await ev("""()=>{window.USED=[];window.FS=(rad)=>{const ok=(x,z)=>{for(const o of objs.values())if(o.re<=0&&Math.abs(o.x-x)<rad+1.5&&Math.abs(o.z-z)<rad+1.5)return false;if(structs.some(s=>dist(s.x,s.z,x,z)<rad+5))return false;if(USED.some(u=>dist(u.x,u.z,x,z)<rad+u.r+4))return false;
        if(typeof pathD==='function'&&pathD(x,z)<rad+4.5)return false;if(nobAt(x,z,rad+1))return false;if(typeof PL!=='undefined'&&PL.list.some(p=>dist(p.x,p.z,x,z)<rad+2))return false;
        for(let i=-rad;i<=rad;i+=1)for(let j=-rad;j<=rad;j+=1){const h=hAt(x+i,z+j);if(h<.9||Math.abs(h-hAt(x,z))>.1)return false}return true};
       for(let i=0;i<9000;i++){const x=VIL.x-200+(i%90)*3.1,z=VIL.z-160+((i/90)|0)*3.3;if(ok(x,z)){USED.push({x,z,r:rad});return {x,z}}}return null};
      window.SP=FS(4);
      window.TRY=(k,x,z,place)=>{S.inv['kit_'+k]=(S.inv['kit_'+k]||0)+1;setBuild(k);brot=0;BPIN.on=true;BPIN.x=x;BPIN.z=z;P.x=x;P.z=z+4;P.rot=Math.PI;const g=ghostPos();let s=null;if(g.ok&&place){const n0=structs.length;placeBuild();s=structs[structs.length-1]}BPIN.on=false;setBuild(null);return {ok:g.ok,why:g.why,x:+g.x.toFixed(3),z:+g.z.toFixed(3),snap:!!g.snap,s}};return JSON.stringify(SP)}""")
    # 1. 딱 붙이기: 상자 옆에 0.6m(맞닿음) = 됨, 0.55m(겹침 5cm) = 안 됨 → 자석이 밀어서 0.6m로, 0.75m(틈 15cm) = 자석이 붙여 줌, 1.2m = 그대로
    R=json.loads(await ev("""()=>{const {x,z}=SP;const a=TRY('crate_sq',x,z,1),r={first:a.ok};window.TQa=a.s;
      const raw=(k,xx,zz)=>{const sv=DC.snap;DC.snap=0;const g=TRY(k,xx,zz,0);DC.snap=sv;return g};
      r.touchRaw=raw('crate_sq',x+.6,z).ok;r.overRaw=raw('crate_sq',x+.55,z).why;
      const s1=TRY('crate_sq',x+.55,z,0);r.overSnap=[s1.ok,+(s1.x-x).toFixed(3),s1.snap];const s2=TRY('crate_sq',x+.75,z+.1,0);r.gapSnap=[s2.ok,+(s2.x-x).toFixed(3),+(s2.z-z).toFixed(3),s2.snap];
      const s3=TRY('crate_sq',x+1.2,z,0);r.far=[s3.ok,+(s3.x-x).toFixed(2),s3.snap];
      const b=TRY('crate_rect',x+.75,z+.15,1);r.rect=[b.ok,+(b.x-x).toFixed(3),+(b.z-z).toFixed(3)];
      const c=TRY('crate_sq',x,z-.62,1);r.back=[c.ok,+(c.z-z).toFixed(3)];
      return JSON.stringify(r)}"""))
    R['ok']=R['first'] and R['touchRaw'] and R['overRaw']=='다른 구조물과 겹쳐요' and R['overSnap'][0] and abs(R['overSnap'][1]-.6)<.002 and R['gapSnap'][0] and abs(R['gapSnap'][1]-.6)<.002 and abs(R['gapSnap'][2])<.002 \
        and R['far'][0] and R['far'][1]==1.2 and not R['far'][2] and R['rect'][0] and abs(R['rect'][1]-.85)<.002 and R['rect'][0] and R['back'][0] and abs(R['back'][1]+.6)<.002
    res['flush']=R
    # 2. 카페트: 가구는 위에 놓고, 카페트끼리는 겹치면 안 됨(맞닿는 건 됨)
    R=json.loads(await ev("""()=>{const Q=FS(4),x=Q.x,z=Q.z;const r={};const a=TRY('rug_rect',x,z,1);r.rug=a.ok;r.table=TRY('table_wsq',x,z,1).ok;r.stools=[TRY('stool_wood',x+.84,z,1).ok,TRY('stool_wood',x-.84,z,1).ok];
      const sv=DC.snap;DC.snap=0;r.rug2over=TRY('rug_round',x+1.9,z,0).why;r.rug2touch=TRY('rug_round',x+2.2,z,1).ok;DC.snap=sv;r.tableOnStool=TRY('table_wround',x+.84,z,0).why;return JSON.stringify(r)}"""))
    R['ok']=R['rug'] and R['table'] and R['stools']==[True,True] and R['rug2over']=='다른 구조물과 겹쳐요' and R['rug2touch'] and R['tableOnStool']=='다른 구조물과 겹쳐요';res['rug']=R
    # 나머지 가구도 한 줄로 붙여 놓기(사진)
    R=json.loads(await ev("""(F)=>{const out={};const row=(L)=>{const Q=FS(4);if(!Q){out.noSpot=1;return}window.ROW=window.ROW||Q;let x=Q.x-3.8,z=Q.z;for(const k of L){const b=BUILDS[k];const g=TRY(k,x+b.bx,z,1);out[k+(out[k]?'2':'')]=g.ok||g.why;x=g.ok?g.x+b.bx:x+2*b.bx+.3}};
      row(['deco_bush','deco_bush','chair_garden','snowman','xmas_tree']);window.ROW2=null;row(['rug_oval','frame_map','frame_dog','frame_lh','frame_camp']);return JSON.stringify(out)}""",F))
    R['ok']=all(v is True for v in R.values());res['row']=R
    await ev("()=>{P.x=ROW.x;P.z=ROW.z+5;P.rot=Math.PI;S.time=.42;try{ZOOM.t=.74}catch(e){};zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1800)
    await pg.screenshot(path=O('p62_room.jpg'),type='jpeg',quality=86)
    # 3. 계단 나무상자: 앞에서 걸어 올라가 맨 위(1.35m)까지, 옆에서 높은 칸으로는 못 올라감, 위에는 아무것도 못 놓음
    R=json.loads(await ev("""()=>{const Q=FS(3);window.STQ=Q;const x=Q.x,z=Q.z;const g=TRY('crate_stair',x,z,1);const r={placed:g.ok};const s=g.s;const gy=hAt(x,z);
      const walk=(x0,z0,dx,dz,n)=>{P.x=x0;P.z=z0;P.yv=undefined;let top=-9;for(let i=0;i<n;i++){moveEnt(P,dx,dz);top=Math.max(top,groundY(P.x,P.z)-gy)}return {top:+top.toFixed(2),x:+(P.x-x).toFixed(2),z:+(P.z-z).toFixed(2)}};
      r.up=walk(x,z+1.6,0,-.05,40);r.side=walk(x+1.2,z-.5,-.05,0,30);r.onTop=ghostOnTop=(()=>{const q=TRY('stool_wood',x,z-.5,0);return q.why})();
      r.ys=[[0,.5],[0,0],[0,-.5]].map(([a,b])=>+(groundY(x+a,z+b)-gy).toFixed(2));return JSON.stringify(r)}"""))
    R['ok']=R['placed'] and R['up']['top']>=1.3 and R['up']['z']<-.3 and R['side']['top']<.1 and R['side']['x']>.6 and R['onTop']=='부두 위에는 놓을 수 없어요' and abs(R['ys'][1]-R['ys'][0]-.45)<.01 and abs(R['ys'][2]-R['ys'][1]-.45)<.01 and R['ys'][0]>.38;res['stair']=R
    await ev("()=>{const x=STQ.x,z=STQ.z;P.x=x;P.z=z-.5;P.yv=undefined;P.rot=0.6;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O('p62_stair.jpg'),type='jpeg',quality=86)
    # 4. 랜덤 상자: 모든 아이템이 똑같은 확률(뽑기 = pool[floor(r·N)]), 동전·자신·옛 물고기 빼고, 이미 가진 총은 다시 뽑기
    R=json.loads(await ev("""()=>{const r={};const L=rboxPool();r.n=L.length;r.noCoin=!L.includes('coin')&&!L.includes('rbox')&&!L.some(k=>ITEMS[k].old);r.all=Object.keys(ITEMS).filter(k=>k!=='coin'&&k!=='rbox'&&!ITEMS[k].old).length;
      const R0=Math.random,seq=[];const pick=v=>{S.inv.rbox=1;const before=Object.assign({},S.inv);Math.random=()=>v;rboxOpen();Math.random=R0;const got=Object.keys(S.inv).filter(k=>k!=='rbox'&&(S.inv[k]||0)>(before[k]||0));return got.join(',')};
      r.first=[pick(0),L[0]];r.mid=[pick(.5),L[Math.floor(.5*L.length)]];r.last=[pick(.9999),L[L.length-1]];
      const g=L.findIndex(k=>ITEMS[k].one);S.inv[L[g]]=1;let i=0;const vals=[(g+.5)/L.length,(g===0?1.5:.5)/L.length];Math.random=()=>vals[Math.min(i++,1)];S.inv.rbox=1;const b2=Object.assign({},S.inv);rboxOpen();Math.random=R0;r.reroll=[L[g],Object.keys(S.inv).filter(k=>k!=='rbox'&&(S.inv[k]||0)>(b2[k]||0)).join(',')];
      r.left=invN('rbox');return JSON.stringify(r)}"""))
    R['ok']=R['noCoin'] and R['n']==R['all'] and R['n']>150 and R['first'][0]==R['first'][1] and R['mid'][0]==R['mid'][1] and R['last'][0]==R['last'][1] and R['reroll'][1]!=R['reroll'][0] and R['left']==0;res['rbox']=R
    # 5. 여행용 가방: 끼면 30칸, 30칸 꽉 차면 못 뺌, 20칸 안이면 빼짐
    R=json.loads(await ev("""()=>{const r={};const keep=['rod','bag_travel'];for(const k in S.inv)if(!keep.includes(k)&&k!=='coin')S.inv[k]=0;S.inv.bag_travel=1;bagTap('bag_travel');r.eq=eqGet('bag');r.n=BAG_N;
      const L=Object.keys(ITEMS).filter(k=>ITEMS[k].ty==='res'&&!ITEMS[k].eq&&k!=='coin').slice(0,26);L.forEach(k=>S.inv[k]=1);r.kinds=bagList().length;r.fits=bagHas('sugar_x')||bagList().length<BAG_N;
      openPanel('bag');renderPanel();r.cells=document.querySelectorAll('#pbody .slot').length;
      eqOff('bag');r.blocked=eqGet('bag')==='bag_travel';L.slice(0,10).forEach(k=>S.inv[k]=0);eqOff('bag');r.off=[eqGet('bag'),BAG_N,bagList().length];return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(300)
    R['ok']=R['eq']=='bag_travel' and R['n']==30 and R['kinds']==27 and R['cells']>=30 and R['blocked'] and R['off'][0] is None and R['off'][1]==20 and R['off'][2]<=20;res['bag']=R
    await ev("()=>{S.inv.bag_travel=1;bagTap('bag_travel');openPanel('bag');renderPanel()}");await pg.wait_for_timeout(600)
    await pg.screenshot(path=O('p62_bag30.jpg'),type='jpeg',quality=86);await ev("()=>{closePanel()}")
    # 6. 새 식물: 야생 구역에 11포기씩, 따면 도감, 씨앗 심기 → 3단계 → 거두기
    R=json.loads(await ev("""(NP)=>{const r={};for(const k in S.inv)if(k!=='coin'&&k!=='rod'&&ITEMS[k]&&ITEMS[k].ty==='res'&&!ITEMS[k].eq)S.inv[k]=0;r.wild=NP.map(k=>PL.list.filter(p=>p.p===k||p.id===k||(p.q&&p.q.id===k)).length);
      const p=PL.list.find(q=>(q.p||q.id||(q.q&&q.q.id))==='tomato');r.dex0=(S.pdex&&S.pdex.tomato)||0;
      if(p){P.x=p.x;P.z=p.z+1;P.rot=Math.PI;S.quick[S.sel]=null;const t=findTarget();r.lab=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false}r.dex1=(S.pdex&&S.pdex.tomato)||0;r.got=invN('tomato');
      return JSON.stringify(r)}""",NP))
    R2=json.loads(await ev("""(NP)=>{const r={};const Q=FS(4),x=Q.x,z=Q.z;r.crops=NP.map((k,i)=>{S.inv['seed_'+k]=1;setBuild('crop_'+k);BPIN.on=true;BPIN.x=x+(i%3)*1.2;BPIN.z=z+((i/3)|0)*1.2;P.x=x;P.z=z+5;const g=ghostPos();let ok=g.ok||g.why;if(g.ok)placeBuild();BPIN.on=false;setBuild(null);return ok});
      const cs=structs.filter(s=>s.own&&/^crop_(tomato|onion|corn|cacao|chili)$/.test(s.t));r.n=cs.length;cs.forEach(s=>s.at=Date.now()-11*60e3);window.CS=cs;return JSON.stringify(r)}""",NP))
    await pg.wait_for_timeout(1200)
    R2.update(json.loads(await ev("""()=>{const r={};const cs=CS;
      const s=cs.find(q=>q.t==='crop_corn');if(!s)return JSON.stringify(r);P.cd=0;r.geo=s&&s.m.children[0].geometry===GEO.pc_corn_2;P.x=s.x;P.z=s.z+1.2;P.rot=Math.PI;const t=findTarget();r.lab=t&&t.lab;const c0=invN('corn');target=t;inp.actEdge=true;interact();inp.actEdge=false;r.harvest=invN('corn')-c0;r.gone=!structs.includes(s);return JSON.stringify(r)}""")))
    R['farm']=R2;R['ok']=('gone' in R2) and R['wild']==[11]*5 and R['dex1']>R['dex0'] and R['got']>=1 and R2['crops']==[True]*5 and R2['n']==5 and R2['geo'] and R2['harvest']==2 and R2['gone'];res['plants']=R
    # 7. 텐트 안: 가구 딱 붙이기 + 액자는 뒤 벽에 딱(63차부터 둥근 벽 면에 붙어서 바닥 벽선보다 조금 앞)
    print('tentA',await ev("""()=>{S.inv.kit_tent=(S.inv.kit_tent||0)+1;setBuild('ptent');let g=null;for(let i=0;i<1600&&!g;i++){P.x=SP.x-60+(i%40)*2.3;P.z=SP.z+40+((i/40)|0)*2.4;P.rot=0;const q=ghostPos();if(q.ok)g=q}if(!g)return 'no spot';placeBuild();setBuild(null);const tn=structs.find(q=>q.own&&q.t==='ptent');intEnter(tn);return 'in'}"""))
    await pg.wait_for_timeout(2500)
    R=json.loads(await ev("""()=>{const r={inside:INT.on};const T=(k,x,z,pl)=>{S.inv['kit_'+k]=(S.inv['kit_'+k]||0)+1;setBuild(k);brot=0;BPIN.on=true;BPIN.x=x;BPIN.z=z;P.x=INT.x+2.4;P.z=INT.z+1.6;const g=ghostPos();if(g.ok&&pl)placeBuild();BPIN.on=false;setBuild(null);return g};
      const a=T('table_wsq',INT.x,INT.z,1);r.t=a.ok;const b=T('stool_wood',INT.x+.85,INT.z,1);r.s=[b.ok,+(b.x-INT.x).toFixed(3)];const sv=DC.snap;DC.snap=0;r.over=T('stool_wood',INT.x+.8,INT.z,0).why;DC.snap=sv;
      const f=T('frame_dog',INT.x-1.5,INT.z-INT.hd+.4,1);r.frame=[f.ok,+(f.z-(INT.z-INT.hd)).toFixed(3)];const f2=T('frame_lh',INT.x+1.6,INT.z-INT.hd-.6,1);r.frame2=[f2.ok,+(f2.z-(INT.z-INT.hd)).toFixed(3)];const rug=T('rug_round',INT.x-1.6,INT.z+.4,1);r.rug=rug.ok;return JSON.stringify(r)}"""))
    R['ok']=R['inside'] and R['t'] and R['s'][0] and abs(R['s'][1]-.84)<.002 and R['over']=='다른 물건과 겹쳐요' and R['frame'][0] and R['frame'][1]>=.049 and R['frame2'][0] and R['frame2'][1]>=.049 and R['rug'];res['tent']=R
    await pg.wait_for_timeout(800);await pg.screenshot(path=O('p62_tent.jpg'),type='jpeg',quality=86)
    await ev("()=>{intOut()}");await pg.wait_for_timeout(800)
    # 8. 저장 → 이어하기: 놓은 가구·계단·여행용 가방 그대로
    n0=await ev("()=>{save();return JSON.stringify({n:structs.filter(s=>s.own&&BUILDS[s.t]&&/^(crate|rug|stool|table_w|frame|deco|snow|xmas|chair_g)/.test(s.t)).length,bag:eqGet('bag')})}")
    await pg.reload();await pg.wait_for_selector('#title:not(.hide)',timeout=120000);await pg.wait_for_timeout(1500);await pg.click('#tCont');await pg.wait_for_timeout(2500)
    n1=await ev("()=>JSON.stringify({n:structs.filter(s=>s.own&&BUILDS[s.t]&&/^(crate|rug|stool|table_w|frame|deco|snow|xmas|chair_g)/.test(s.t)).length,bag:eqGet('bag'),N:BAG_N,walk:DC.walk.length})")
    R={'before':json.loads(n0),'after':json.loads(n1)};R['ok']=R['before']['n']==R['after']['n'] and R['after']['bag']=='bag_travel' and R['after']['N']==30 and R['after']['walk']>=1;res['save']=R
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False)[:420])
    print('ALL',all(v.get('ok') for v in res.values()))
