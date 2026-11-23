# 63차(디자인): 이단 눈사람 · 카페트 무늬(텍스처) · 액자 8종(진짜 게임 장면 그림 + 벽·구조물 면에 붙이기 + 밖에서는 이젤)
# 기대: 각 줄 ok true, ALL True, errs []
# 사진: tools/out/p63_pics.png·p63_rugtex.png·p63_frames3d.png·p63_furn3d.png·p63_icons.png(p63_view.py), p63_out.jpg(집 앞·이젤·카페트), p63_tent.jpg, p63_house.jpg
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};if(typeof HZ!=='undefined')HZ.off=1}")
    await pg.wait_for_timeout(2500)   # 액자 그림이 하나씩 그려질 시간
    res={}
    FR=['frame_map','frame_dog','frame_plat','frame_lh','frame_whale','frame_camp','frame_boat','frame_shark'];RG=['rug_rect','rug_round','rug_oval']
    d=json.loads(await ev("""(a)=>{const [FR,RG]=a;const L=[...FR,...RG];return JSON.stringify({queue:FRM.q.length,noTex:L.filter(t=>!FRM.tex[t]||!FRM.tex[t].image||FRM.tex[t].image.width<256||FRM.tex[t]._ftmp),
      noIcon:L.filter(t=>!/^data:image/.test(ICON['kit_'+t]||'')),snowTri:Math.round(GEO.dc_snowman.attributes.position.count/3),
      snowBalls:[GEO.dc_snowman.boundingBox||GEO.dc_snowman.computeBoundingBox()||GEO.dc_snowman.boundingBox].map(b=>+b.max.y.toFixed(2))[0],
      mapPix:(()=>{const c=FRM.pic.frame_map.src,k=c.getContext('2d'),p=k.getImageData(c.width>>1,c.height>>1,1,1).data;return [p[0],p[1],p[2]]})(),
      dogPix:(()=>{const c=FRM.pic.frame_dog.src,k=c.getContext('2d'),p=k.getImageData(c.width>>1,c.height*.35|0,1,1).data;return [p[0],p[1],p[2]]})(),
      wall:FR.every(t=>BUILDS[t].wall&&BUILDS[t].bz===.05),easel:!!frEaselGeo(true)&&!!frEaselGeo(false)})}""",[FR,RG]))
    d['ok']=d['queue']==0 and not d['noTex'] and not d['noIcon'] and d['wall'] and d['easel'] and 1.4<d['snowBalls']<1.7 and d['mapPix']!=[232,212,166]
    res['defs']=d
    await ev("""()=>{window.USED=[];window.FS=(rad)=>{const ok=(x,z)=>{for(const o of objs.values())if(o.re<=0&&Math.abs(o.x-x)<rad+1.5&&Math.abs(o.z-z)<rad+1.5)return false;if(structs.some(s=>dist(s.x,s.z,x,z)<rad+5))return false;if(USED.some(u=>dist(u.x,u.z,x,z)<rad+u.r+4))return false;
        if(typeof pathD==='function'&&pathD(x,z)<rad+4.5)return false;if(nobAt(x,z,rad+1))return false;if(typeof PL!=='undefined'&&PL.list.some(p=>dist(p.x,p.z,x,z)<rad+2))return false;
        for(let i=-rad;i<=rad;i+=1)for(let j=-rad;j<=rad;j+=1){const h=hAt(x+i,z+j);if(h<.9||Math.abs(h-hAt(x,z))>.08)return false}return true};
       for(let i=0;i<9000;i++){const x=VIL.x-200+(i%90)*3.1,z=VIL.z-160+((i/90)|0)*3.3;if(ok(x,z)){USED.push({x,z,r:rad});return {x,z}}}return null};
      window.TRY=(k,x,z,place)=>{S.inv['kit_'+k]=(S.inv['kit_'+k]||0)+1;setBuild(k);brot=0;BPIN.on=true;BPIN.x=x;BPIN.z=z;P.x=x+.3;P.z=z+4;P.rot=Math.PI;const g=ghostPos();let s=null;if(g.ok&&place){placeBuild();s=structs[structs.length-1]}BPIN.on=false;setBuild(null);return {ok:g.ok,why:g.why,x:+g.x.toFixed(3),z:+g.z.toFixed(3),snap:!!g.snap,easel:!!g.easel,yo:g.yo,s}};
      window.XT=s=>s.m.children.filter(c=>c.userData.frX).map(c=>c.geometry===GEO.dc_easel_l||c.geometry===GEO.dc_easel_p?'easel':'hang').join(',');
      window.PICS=s=>s.m.children.filter(c=>c.userData.frPic).length;
      /* 액자 뒤판(가운데)에서 뒤쪽 면까지 거리 */
      window.GAP=(s,inR)=>{const f=frDims(s.t),fx=Math.sin(s.r||0),fz=Math.cos(s.r||0),y=s.m.position.y+DCFR.Yc,L=frTargets(s.x,s.z,inR).filter(m=>m.userData.frS!==s);const c=frCast(L,s.x+fx*.9,y,s.z+fz*.9,fx,fz,inR?14:1.9);return c?+(c.d-.9).toFixed(3):null};return 1}""")
    # 1. 밖, 붙일 곳 없음 → 이젤에 세움
    R=json.loads(await ev("""()=>{const Q=FS(3),r={};window.OQ=Q;const a=TRY('frame_dog',Q.x,Q.z,1);r.ok1=a.ok;r.easel=a.easel;r.xt=XT(a.s);r.pics=PICS(a.s);r.yo=a.s.yo===undefined;r.y=+(a.s.m.position.y-(hAt(a.s.x,a.s.z)-.04)).toFixed(3);
      const b=TRY('frame_lh',Q.x+1.4,Q.z,1);r.ok2=b.ok;r.xt2=XT(b.s);return JSON.stringify(r)}"""))
    R['ok']=R['ok1'] and R['easel'] and R['xt']=='easel' and R['pics']==1 and R['yo'] and abs(R['y'])<.002 and R['ok2'] and R['xt2']=='easel';res['easel']=R
    # 2. 밖, 집 앞면에 붙이기: 면까지 0.05m, 높이 1.22, 못과 줄, 집과 겹쳐도 됨
    R=json.loads(await ev("""()=>{const Q=FS(6),r={};window.HQ=Q;const h=addStruct({t:'phouse',x:Q.x,z:Q.z,r:0,own:1});window.HS=h;h.m.updateMatrixWorld(true);const d=sdef(h);
      const fz=Q.z+d.bz+.6;const a=TRY('frame_map',Q.x+.42,fz,1);r.ok=a.ok;r.why=a.why;r.snap=a.snap;r.zMoved=+(a.z-fz).toFixed(3);r.yo=a.yo;if(a.s){r.xt=XT(a.s);r.gap=GAP(a.s,false);r.yc=+(a.s.m.position.y+DCFR.Yc-(hAt(a.s.x,a.s.z)-.04)).toFixed(3);window.HF=a.s}
      const ng=TRY('frame_boat',Q.x-1.05,fz+1.6,0);r.farEasel=ng.easel&&!ng.snap;return JSON.stringify(r)}"""))
    R['ok']=R['ok'] and R['snap'] and R['xt']=='hang' and R['gap'] is not None and abs(R['gap']-.05)<.01 and abs(R['yc']-1.22)<.01 and R['farEasel'];res['house']=R
    # 3. 밖, 낮은 긴 상자(0.55m) 앞: 높이를 낮춰 붙음 · 좁은 상자(0.6m 폭)는 액자보다 좁아서 이젤
    R=json.loads(await ev("""()=>{const Q=FS(4),r={};const c=TRY('crate_rect',Q.x,Q.z,1);r.crate=c.ok;const a=TRY('frame_camp',Q.x,Q.z+.3+.7,1);r.ok=a.ok;r.snap=a.snap;if(a.s){r.xt=XT(a.s);r.yc=+(a.s.m.position.y+DCFR.Yc-(hAt(a.s.x,a.s.z)-.04)).toFixed(3);r.gap=GAP(a.s,false)}
      const Q2=FS(4),c2=TRY('crate_sq',Q2.x,Q2.z,1),b=TRY('frame_whale',Q2.x,Q2.z+.3+.7,0);r.narrow=[c2.ok,b.easel,b.snap];return JSON.stringify(r)}"""))
    R['ok']=R['crate'] and R['ok'] and R['snap'] and R['xt']=='hang' and .38<R['yc']<.45 and abs(R['gap']-.05)<.03 and R['narrow']==[True,True,False];res['low']=R
    # 4. 미리보기: 집 앞 → 붙은 높이 + 못, 빈 땅 → 이젤
    R=json.loads(await ev("""()=>{const r={};const d=sdef(HS);S.inv.kit_frame_shark=(S.inv.kit_frame_shark||0)+1;setBuild('frame_shark');brot=0;BPIN.on=true;BPIN.x=HQ.x-1.05;BPIN.z=HQ.z+d.bz+.5;P.x=BPIN.x+.3;P.z=BPIN.z+4;
      let g=ghostPos();ghost.userData.g=g;ghost.position.set(g.x,groundY(g.x,g.z),g.z);R.render(scene,cam);r.g1=[g.ok,g.snap,ghost.userData.frw,+(ghost.position.y-(hAt(g.x,g.z)-.04)-(g.yo||0)).toFixed(3),ghost.children.length];
      BPIN.x=OQ.x+2.8;BPIN.z=OQ.z;P.x=BPIN.x+.3;P.z=BPIN.z+4;g=ghostPos();ghost.userData.g=g;ghost.position.set(g.x,groundY(g.x,g.z),g.z);R.render(scene,cam);r.g2=[g.ok,!!g.easel,ghost.userData.frw,ghost.children.length];BPIN.on=false;setBuild(null);return JSON.stringify(r)}"""))
    R['ok']=R['g1'][0] and R['g1'][1] and R['g1'][2]=='h' and abs(R['g1'][3])<.002 and R['g1'][4]==1 and R['g2'][0] and R['g2'][1] and R['g2'][2]=='e' and R['g2'][3]==1;res['ghost']=R
    # 사진: 집 앞 액자 + 이젤 + 카페트 + 눈사람
    await ev("""()=>{const Q=FS(5);window.PQ=Q;TRY('rug_rect',Q.x,Q.z,1);TRY('snowman',Q.x+2.2,Q.z-1.4,1);TRY('rug_round',Q.x-3.0,Q.z+.2,1);TRY('rug_oval',Q.x+.4,Q.z+2.6,1);
      P.x=HQ.x;P.z=HQ.z+6.5;P.rot=Math.PI;S.time=.42;try{ZOOM.t=.74}catch(e){};zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}""");await pg.wait_for_timeout(1800)
    await pg.screenshot(path=O('p63_out.jpg'),type='jpeg',quality=86)
    await ev("()=>{P.x=PQ.x;P.z=PQ.z+5.5;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
    await pg.wait_for_timeout(1200)
    R=json.loads(await ev("()=>{let n=0,t=0;for(const q of structs.filter(s=>s.own&&FRM.rugs[s.t]&&!s.in)){const rg=regions.find(r=>Math.abs(r.cx-q.x)<=REG/2&&Math.abs(r.cz-q.z)<=REG/2);if(!rg)continue;const ri=regions.indexOf(rg),it=dressItems(rg,ri);for(let i=0;i<it.length;i+=7){if(dist(it[i+1],it[i+3],q.x,q.z)<FRM.rugs[q.t].d/2-.05)n++;t++}}return JSON.stringify({onRug:n,items:t})}"))
    R['ok']=R['onRug']==0 and R['items']>0;res['grass']=R
    await pg.screenshot(path=O('p63_rugs.jpg'),type='jpeg',quality=86)
    await ev("()=>{P.x=OQ.x+.7;P.z=OQ.z+4.5;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O('p63_easel.jpg'),type='jpeg',quality=86)
    # 5. 받치던 집을 치우면 → 이젤로
    R=json.loads(await ev("""()=>{removeStruct(HS);return JSON.stringify({yo:HF.yo===undefined,xt:XT(HF),y:+(HF.m.position.y-(hAt(HF.x,HF.z)-.04)).toFixed(3)})}"""))
    R['ok']=R['yo'] and R['xt']=='easel' and abs(R['y'])<.002;res['unsupport']=R
    # 6. 텐트 안: 둥근 벽은 바닥 뒤 끝에서 3m 뒤에 선 배경이라, 액자는 예전처럼 바닥 뒤 끝(벽선)에 서요(못과 줄) · 방 가운데에 놓아도 뒤 끝으로
    print('tentA',await ev("""()=>{S.inv.kit_tent=(S.inv.kit_tent||0)+1;setBuild('ptent');let g=null;const Q=FS(6);for(let i=0;i<1600&&!g;i++){P.x=Q.x-30+(i%40)*1.6;P.z=Q.z+((i/40)|0)*1.7;P.rot=0;const q=ghostPos();if(q.ok)g=q}if(!g)return 'no spot';placeBuild();setBuild(null);const tn=structs.filter(q=>q.own&&q.t==='ptent').pop();window.TN=tn;intEnter(tn);return 'in'}"""))
    await pg.wait_for_timeout(2500)
    R=json.loads(await ev("""()=>{const r={inside:INT.on,kind:INT.kind};const T=(k,x,z,pl)=>{S.inv['kit_'+k]=(S.inv['kit_'+k]||0)+1;setBuild(k);brot=0;BPIN.on=true;BPIN.x=x;BPIN.z=z;P.x=INT.x+2.4;P.z=INT.z+1.6;const g=ghostPos();let s=null;if(g.ok&&pl){placeBuild();s=structs[structs.length-1]}BPIN.on=false;setBuild(null);return {g,s}};
      const a=T('frame_dog',INT.x-1.2,INT.z-INT.hd+.5,1);r.a=[a.g.ok,!!a.g.snap,a.s&&XT(a.s),a.s&&GAP(a.s,true),+(a.g.z-(INT.z-INT.hd)).toFixed(3)];
      const b=T('frame_plat',INT.x+1.2,INT.z,1);r.b=[b.g.ok,!!b.g.snap,b.s&&XT(b.s),b.s&&GAP(b.s,true),+(b.g.z-(INT.z-INT.hd)).toFixed(3)];
      T('rug_round',INT.x,INT.z+.2,1);r.rugPic=structs.filter(s=>s.in&&s.t==='rug_round').every(s=>PICS(s)===1);return JSON.stringify(r)}"""))
    R['ok']=R['inside'] and R['a'][0] and R['a'][2]=='hang' and abs(R['a'][4]-.05)<.002 and R['b'][0] and R['b'][2]=='hang' and abs(R['b'][4]-.05)<.002 and R['rugPic'];res['tent']=R
    await pg.wait_for_timeout(600);await pg.screenshot(path=O('p63_tent.jpg'),type='jpeg',quality=86)
    await ev("()=>{intOut()}");await pg.wait_for_timeout(800)
    # 7. 집 안: 흰 뒤 벽에 딱
    print('houseA',await ev("""()=>{const Q=FS(6);const h=addStruct({t:'phouse',x:Q.x,z:Q.z,r:0,own:1});window.HS2=h;P.x=Q.x;P.z=Q.z+3;intEnter(h);return INT.kind}"""))
    await pg.wait_for_timeout(2500)
    R=json.loads(await ev("""()=>{const r={inside:INT.on,kind:INT.kind};const T=(k,x,z)=>{S.inv['kit_'+k]=(S.inv['kit_'+k]||0)+1;setBuild(k);brot=0;BPIN.on=true;BPIN.x=x;BPIN.z=z;P.x=INT.x+2.4;P.z=INT.z+1.6;const g=ghostPos();let s=null;if(g.ok){placeBuild();s=structs[structs.length-1]}BPIN.on=false;setBuild(null);return {g,s}};
      const L=[['frame_whale',-2.4],['frame_map',-.6],['frame_boat',1.2],['frame_shark',3.0]].map(([k,dx])=>{const q=T(k,INT.x+dx,INT.z-INT.hd+.7);return [q.g.ok,!!q.g.snap,q.s&&GAP(q.s,true),+(q.g.z-(INT.z-INT.hd)).toFixed(3)]});r.L=L;return JSON.stringify(r)}"""))
    R['ok']=R['inside'] and R['kind']=='house' and all(q[0] and q[1] and q[2] is not None and abs(q[2]-.05)<.01 for q in R['L']);res['houseRoom']=R
    await pg.wait_for_timeout(600);await pg.screenshot(path=O('p63_house.jpg'),type='jpeg',quality=86)
    await ev("()=>{intOut()}");await pg.wait_for_timeout(800)
    # 8. 저장 → 이어하기: 붙은 액자(yo)·이젤·그림 그대로
    n0=await ev("()=>{save();const L=structs.filter(s=>s.own&&frIsF(s.t));return JSON.stringify({n:L.length,ea:L.filter(s=>XT(s)==='easel').length,yo:L.filter(s=>!s.in&&s.yo!=null).length})}")
    await pg.reload();await pg.wait_for_selector('#title:not(.hide)',timeout=120000);await pg.wait_for_timeout(1500);await pg.click('#tCont');await pg.wait_for_timeout(2500)
    n1=await ev("()=>{const XT=s=>s.m.children.filter(c=>c.userData.frX).map(c=>c.geometry===GEO.dc_easel_l||c.geometry===GEO.dc_easel_p?'easel':'hang').join(',');const L=structs.filter(s=>s.own&&frIsF(s.t));return JSON.stringify({n:L.length,ea:L.filter(s=>XT(s)==='easel').length,yo:L.filter(s=>!s.in&&s.yo!=null).length,pics:L.every(s=>s.m.children.some(c=>c.userData.frPic)),rugs:structs.filter(s=>s.own&&FRM.rugs[s.t]).every(s=>s.m.children.some(c=>c.userData.frPic))})}")
    R={'before':json.loads(n0),'after':json.loads(n1)};b,a=R['before'],R['after'];R['ok']=b['n']==a['n'] and b['ea']==a['ea'] and b['yo']==a['yo'] and a['pics'] and a['rugs'];res['save']=R
    for k,v in res.items(): print(k,json.dumps(v,ensure_ascii=False)[:420])
    print('ALL',all(v.get('ok') for v in res.values()))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
