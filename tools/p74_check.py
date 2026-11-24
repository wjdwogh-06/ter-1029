# 74차(디자인) 검사: 동굴 안 지하 광산(동북섬 크기) · 깊은 바다 30m · 수상 텐트 · 채굴 텐트 → 채굴 기지
# 실행: python3 tools/gt.py tools/p74_check.py
# 사진: tools/out/p74_mine_top.jpg(광산 전체 위에서), p74_mine_<구역>.jpg, p74_wtent.jpg, p74_minetent.jpg, p74_minebase.jpg
import json,os
ZONES=[('entrance',0,124),('yard',-4,80),('office',-20,68),('powder',62,94),('old',-62,94),('pump',-100,58),('hub',-2,18),('camp',-84,22),('lake',-84,-50),('crystal',-14,-74),('mush',64,-70),('dig',96,-2),('drift',124,-50)]
async def steps(pg):
    res={}
    async def ev(js):
        try:return await pg.evaluate(js.strip())
        except Exception as e:print('FAIL',js.strip()[:120],str(e)[:300]);raise
    # 0. 깊은 바다 30m(등대 바위섬 10m) — p73_check와 같은 기준
    r=await ev("""()=>{const LH=LH_SITES.filter((L,i)=>!LH_GONE.includes(i)&&!LH_ISLE.includes(i));let sh=0,shBad=0,mid=0,midBad=0,far=0,farDeep=0;
      for(let x=2;x<WS;x+=4)for(let z=2;z<WS;z+=4){if(hAt(x,z)>=-.05)continue;const d=seaShore(x,z),dp=seaDeep(x,z);if(d<=9){sh++;if(dp)shBad++}
        if(d<=28&&LH.every(L=>Math.hypot(x-L[0],z-L[1])>60)){mid++;if(dp)midBad++}if(d>=40){far++;if(dp)farDeep++}}
      const ring=LH.map(L=>{let n=0,k=0;for(let a=0;a<48;a++){const x=L[0]+Math.cos(a/48*6.283)*24,z=L[1]+Math.sin(a/48*6.283)*24;if(hAt(x,z)>-.05)continue;n++;if(seaDeep(x,z))k++}return +(k/Math.max(1,n)*100).toFixed(0)});
      return JSON.stringify({R:SEA73.R,RL:SEA73.RL,shBad,mid,midBad,farPct:+(farDeep/far*100).toFixed(1),ring})}""")
    R=json.loads(r);R['ok']=R['R']==30 and R['RL']==10 and R['shBad']==0 and R['midBad']==0 and R['farPct']>97 and min(R['ring'])>=70;res['deep']=R
    # 1. 광산: 들어가기 → 크기·넓이(동북섬과 비교)·만드는 시간·삼각형
    await ev("()=>{const s=structs.find(q=>q.t==='cave');caveEnter(s)}")
    await pg.wait_for_timeout(2500)
    r=await ev("""()=>{let n=0,a=1e9,b=-1e9,c=1e9,d=-1e9;for(let x=-160;x<160;x+=1)for(let z=-140;z<145;z+=1)if(mineFloorAt(x+.5,z+.5)){n++;a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,z);d=Math.max(d,z)}
      const I=ISL.find(i=>i.n==='동북섬');let m=0,e=1e9,f=-1e9,g=1e9,h=-1e9;for(let x=0;x<WS;x+=2)for(let z=0;z<WS;z+=2)if(hAt(x,z)>0&&islAt(x,z)===I){m++;e=Math.min(e,x);f=Math.max(f,x);g=Math.min(g,z);h=Math.max(h,z)}
      let pt=0;INT.gr.cave.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position)pt+=o.geometry.attributes.position.count/3});
      return JSON.stringify({inCave:INT.on&&INT.kind==='cave',area:n,box:[b-a+1,d-c+1],ne:{area:m*4,box:[f-e,h-g]},built:Math.round(M74.built),terrainTris:M74.tris|0,allTris:pt|0,lights:M74.lights.length})}""")
    R=json.loads(r);R['ok']=R['inCave'] and 20000<R['area']<40000 and abs(R['box'][0]-R['ne']['box'][0])<60 and abs(R['box'][1]-R['ne']['box'][1])<60 and R['built']<4000 and R['allTris']<400000;res['mine']=R
    # 2. 걸어서 다 닿나: 입구에서 1m 칸 채우기(몸 반지름 0.42, 소품 충돌 포함) → 방마다 닿음, 못 닿는 바닥 칸 적음
    r=await ev("""()=>{const X0=-160,Z0=-140,NX=320,NZ=285,seen=new Uint8Array(NX*NZ),q=[];const id=(x,z)=>(z-Z0)*NX+(x-X0);const ok=(x,z)=>x>=X0&&x<X0+NX&&z>=Z0&&z<Z0+NZ&&mineOpen(x+.5,z+.5,.42);
      const sx=0,sz=124;seen[id(sx,sz)]=1;q.push([sx,sz]);let n=0;while(q.length){const [x,z]=q.pop();n++;for(const [dx,dz] of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz;if(a<X0||a>=X0+NX||b<Z0||b>=Z0+NZ)continue;const k=id(a,b);if(seen[k]||!ok(a,b))continue;seen[k]=1;q.push([a,b])}}
      let open=0;for(let x=X0;x<X0+NX;x++)for(let z=Z0;z<Z0+NZ;z++)if(ok(x,z))open++;
      const halls=M74.halls.map((h,i)=>{let c=0;for(let x=Math.floor(h[0]-h[2]);x<h[0]+h[2];x++)for(let z=Math.floor(h[1]-h[3]);z<h[1]+h[3];z++)if(m74hall(x+.5,z+.5,h)>0&&seen[id(x,z)])c++;return c});
      return JSON.stringify({reach:n,open,pct:+(n/open*100).toFixed(1),hallsMin:Math.min(...halls),halls})}""")
    R=json.loads(r);R['ok']=R['pct']>=96 and R['hallsMin']>=150;res['reach']=R
    # 3. 호수·수직갱 구멍은 못 들어가고, 입구 문에서 [지상으로]
    r=await ev("""()=>{const L=M74.lakes[0];const o={lake:mineOpen(L[0],L[1],.42),shaft:mineOpen(-6,8,.42),spawn:mineOpen(0,124,.42)};
      P.x=INT.x+MINE.ox;P.z=INT.z+MINE.oz+125;intUpd();o.exitBtn=!document.querySelector('#ui').querySelector('button.btn[style*="18%"]').hidden;return JSON.stringify(o)}""")
    R=json.loads(r);R['ok']=not R['lake'] and not R['shaft'] and R['spawn'] and R['exitBtn'];res['walls']=R
    # 4. 구역 사진(게임 화면) + 위에서 본 전체
    for name,x,z in ZONES:
        await ev(f"()=>{{P.x=INT.x+MINE.ox+{x};P.z=INT.z+MINE.oz+{z};camT.set(P.x,INT.y,P.z)}}")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT,f'p74_mine_{name}.jpg'),type='jpeg',quality=78)
    vp=pg.viewport_size
    await pg.set_viewport_size({'width':1100,'height':1000});await pg.wait_for_timeout(500)
    await ev("""()=>{const cx=INT.x+MINE.ox+4,cz=INT.z+MINE.oz+14;window._ic=intCam;intCam=function(){cam.aspect=1.1;cam.fov=38;cam.far=2000;cam.near=5;cam.updateProjectionMatrix();cam.position.set(cx,INT.y+420,cz+2);cam.up.set(0,0,-1);cam.lookAt(cx,INT.y,cz)};document.getElementById('ui').style.display='none'}""")
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(OUT,'p74_mine_top.jpg'),type='jpeg',quality=85)
    await ev("()=>{intCam=window._ic;cam.up.set(0,1,0);cam.fov=24;cam.near=.5;cam.updateProjectionMatrix();document.getElementById('ui').style.display='';intLeave()}")
    await pg.set_viewport_size(vp);await pg.wait_for_timeout(2000)
    res['leave']={'ok':await ev("()=>!INT.on")}
    res['defs']=json.loads(await ev("""()=>JSON.stringify({geo:['t74_wtent','t74_minetent','t74_minebase'].map(k=>!!GEO[k]&&GEO[k].attributes.position.count/3|0),icon:!!ICON.kit_wtent&&!!ICON.kit_minetent,vend:['kit_wtent','kit_minetent'].map(k=>vendPool().includes(k)),zone:isZoneT('wtent')&&isZoneT('minetent')&&isZoneT('minebase')})"""))
    # 깊은 바다 자리 찾기
    r=await ev("""()=>{let deep=null,shal=null,land=null,edge=null;for(let rr=60;rr<480;rr+=4)for(let k=0;k<120;k++){const a=k/120*6.283,x=500+Math.cos(a)*rr,z=500+Math.sin(a)*rr;if(x<10||z<10||x>990||z>990)continue;if(nobAt(x,z,5))continue;const d=seaShore(x,z);
        if(!deep&&seaDeep(x,z)&&d>45&&d<70&&!t74deepWhy(x,z,0,BUILDS.wtent))deep=[x,z];if(!shal&&hAt(x,z)<-.6&&d>12&&d<20)shal=[x,z];if(!land&&hAt(x,z)<-.4&&d>1.5&&d<3)land=[x,z];
        if(!edge&&seaDeep(x,z)&&d>30&&d<40&&t74deepWhy(x,z,0,BUILDS.wtent))edge=[x,z]}
      window.T74={deep,shal,land,edge};return JSON.stringify({deep,shal:shal&&t74deepWhy(shal[0],shal[1],0,BUILDS.wtent),land:land&&t74deepWhy(land[0],land[1],0,BUILDS.wtent),edge:edge&&[edge,t74deepWhy(edge[0],edge[1],0,BUILDS.wtent)],deepWhy:deep&&t74deepWhy(deep[0],deep[1],0,BUILDS.wtent)})}""")
    res['spots']=json.loads(r)
    # 실제로 펴기
    r=await ev("""()=>{const [x,z]=T74.deep;S.inv.kit_wtent=2;P.x=x;P.z=z+7;P.rot=Math.PI;setBuild('wtent');BPIN.on=true;BPIN.x=x;BPIN.z=z;const g=ghostPos();const o={ok:g.ok,why:g.why};
      if(g.ok){placeBuild();const s=structs.find(q=>q.own&&q.t==='wtent');o.placed=!!s;o.kit=S.inv.kit_wtent;if(s){window.T74s=s;o.y=+s.m.position.y.toFixed(2);const d=onDock(x,z+3.5);o.deckY=d&&+d.y.toFixed(2);o.home=S.home&&[+(S.home.x-x).toFixed(1),+(S.home.z-z).toFixed(1)];o.at=!!s.at;
        /* 물에서 마루로 올라오기 */P.x=x;P.z=z+5.6;o.swimY=+stepY(P.x,P.z).toFixed(2);o.climb=canStep(P,x,z+4.0,0,-1);
        /* 다른 수상 텐트 겹치면 안 됨 */P.x=x+12;P.z=z+12;BPIN.x=x+3;BPIN.z=z+1;o.overlap=ghostPos().why}}
      BPIN.on=false;setBuild(null);return JSON.stringify(o)}""")
    res['place']=json.loads(r)
    # 마루에 서서 사진, 들어가기 / 나가기
    await ev("()=>{const s=T74s;P.x=s.x;P.z=s.z+3;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p74_wtent.jpg'),type='jpeg',quality=82)
    r=await ev("""()=>{const s=T74s;P.x=s.x;P.z=s.z+2.75;P.rot=Math.PI;const t=findTarget();const o={label:t&&t.label,ty:t&&t.s&&t.s.t};if(t&&t.s===s){target=t;inp.actEdge=true;interact();inp.actEdge=false}o.in=INT.on;return JSON.stringify(o)}""")
    res['enter']=json.loads(r)
    await pg.wait_for_timeout(1600)
    res['enter']['in2']=await pg.evaluate("()=>INT.on&&INT.s===T74s")
    r=await ev("()=>{if(INT.on)intOut();const s=T74s;return JSON.stringify({out:!INT.on,py:+groundY(P.x,P.z).toFixed(2),dz:+(P.z-s.z).toFixed(2)})}")
    res['exit']=json.loads(r)
    # 12시간
    r=await ev("()=>{T74s.at=Date.now()-13*3600e3;return 1}")
    await pg.wait_for_timeout(2500)
    res['life']=await ev("()=>!structs.includes(T74s)")
    # 채굴 텐트 → 채굴 기지
    r=await ev("""()=>{S.inv.kit_minetent=1;setBuild('minetent');let ok=null;for(let rr=30;rr<200&&!ok;rr+=4)for(let k=0;k<40;k++){const a=k/40*6.283,x=VIL.x+Math.cos(a)*rr,z=VIL.z+Math.sin(a)*rr;P.x=x;P.z=z+6;P.rot=Math.PI;BPIN.on=true;BPIN.x=x;BPIN.z=z;if(ghostPos().ok){ok=[x,z];break}}
      const o={found:!!ok};if(ok){placeBuild();const s=structs.find(q=>q.own&&q.t==='minetent');o.placed=!!s;window.T74m=s;o.at=!!(s&&s.at)}BPIN.on=false;setBuild(null);return JSON.stringify(o)}""")
    res['mtent']=json.loads(r)
    await ev("()=>{const s=T74m;P.x=s.x+.3;P.z=s.z+4.2;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(OUT,'p74_minetent.jpg'),type='jpeg',quality=82)
    await ev("()=>{intEnter(T74m)}");await pg.wait_for_timeout(1600)
    r=await ev("""()=>{const s=T74m;S.inv.bar_iron=20;S.inv.bar_ti=20;S.inv.pick_elec=1;for(const k in BUILDS.minetent.upg.c)upPut(k,999);   /* 78차: 채굴 기지 재료 = 철 주괴·티타늄 주괴·전기 곡괭이 */const I=upInfo();const h=upCard();return JSON.stringify({in:INT.on,ok:I&&I.ok,to:I&&I.to&&I.to.n,card:/채굴 기지/.test(h)&&!/나무를 다 넣으면/.test(h),btn:/data-a="upgo"(?![^>]*disabled)/.test(h)})}""")
    res['upg']=json.loads(r)
    await ev("()=>upGo()")
    await pg.wait_for_timeout(5500)
    r=await ev("()=>{const b=structs.find(q=>q.own&&q.t==='minebase');window.T74b=b;return JSON.stringify({base:!!b,tentGone:!structs.includes(T74m),home:S.home&&b&&+dist(S.home.x,S.home.z,b.x,b.z+BUILDS.minebase.bz+1.1).toFixed(2),busy})}")
    res['base']=json.loads(r)
    await ev("()=>{const s=T74b;P.x=s.x+.3;P.z=s.z+4.4;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(OUT,'p74_minebase.jpg'),type='jpeg',quality=82)
    T=res
    T['tents']={'ok':T['defs']['icon'] and all(T['defs']['vend']) and T['defs']['zone'] and T['spots']['deepWhy']=='' and '얕은' in (T['spots']['shal'] or '') and '땅' in (T['spots']['land'] or '')
        and T['place']['placed'] and T['place']['deckY']==0.22 and T['place']['climb'] and T['enter']['in2'] and T['exit']['out'] and T['exit']['py']==0.22 and T['life']
        and T['mtent']['placed'] and T['upg']['ok'] and T['upg']['card'] and T['base']['base'] and T['base']['tentGone']}
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values() if isinstance(v,dict) and 'ok' in v))
