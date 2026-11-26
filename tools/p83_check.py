# 83차 검사: 2층 집 새 모양·크기, 안 계단(뒤 벽), 업그레이드해도 안 그 자리에(텐트 → 집, 집 → 2층 집), 넓어질 자리 검사·나무 치우기, 계단 자리 설치 막힘
# 사진: tools/out/p83_up_house.jpg(텐트 → 집 직후 안), p83_up_h2.jpg(2층 직후 안), p83_out.jpg(바깥)
import os,json
async def steps(pg):
    ev=pg.evaluate;res={}
    async def shot(n,w=1200):
        await pg.wait_for_timeout(w);await pg.screenshot(path=os.path.join(OUT,n),type='jpeg',quality=84)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    # 1. 모양·정의
    r=await ev("""()=>{const g=GEO.phouse2;g.computeBoundingBox();const b=g.boundingBox,d=BUILDS.phouse2;return JSON.stringify({tri:g.attributes.position.count/3|0,w:+(b.max.x-b.min.x).toFixed(2),dz:[+b.min.z.toFixed(2),+b.max.z.toFixed(2)],h:+b.max.y.toFixed(2),s:d.s,bx:d.bx,bz:d.bz,glow:!!GEO.phouse2_glow,stair:H82.stair})}""")
    R=json.loads(r);R['ok']=R['s']==1 and 5.5<R['w']<7.6 and R['dz'][0]>-3.4 and R['dz'][1]<3.8 and 5.5<R['h']<8 and R['tri']<60000 and R['glow'];res['model']=R
    # 2. 자리 찾기 → 텐트 → 안에 작업대
    r=await ev("""()=>{let site=null;for(let r=40;r<200&&!site;r+=6)for(let a=0;a<6.28&&!site;a+=.21){const x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;S.inv.kit_tent=(S.inv.kit_tent||0)+1;P.x=x;P.z=z+6;setBuild('ptent');BPIN.on=true;BPIN.x=x;BPIN.z=z;const g=ghostPos();
        if(g.ok&&!h83Why({x,z,r:0})&&!h82Hit({x,z,r:0},'phouse2')){const big=zoneRect(x,z,0,'phouse2');let ok=true;for(const s of structs){if(s.own&&isZoneT(s.t)&&zoneOverlap(big,zoneRect(s.x,s.z,s.r,s.t)))ok=false}if(ok){placeBuild();site=[x,z]}}BPIN.on=false;setBuild(null)}
      const t=structs.filter(s=>s.own&&s.t==='ptent').pop();window.T83=t;return JSON.stringify({site,t:!!t})}""")
    res['site']=json.loads(r)
    await ev("()=>{intEnter(T83);return 1}");await pg.wait_for_timeout(1700)
    r=await ev("""()=>{S.inv.kit_bench=1;setBuild('bench');BPIN.on=true;BPIN.x=INT.x+1.8;BPIN.z=INT.z-1.6;const g=ghostPos();const ok=g.ok;if(ok)placeBuild();BPIN.on=false;setBuild(null);const b=structs.find(s=>s.in&&s.t==='bench'&&s.own);window.B83=b;
      P.x=INT.x-1.2;P.z=INT.z+.4;P.rot=.7;window.PP=[P.x,P.z,P.rot];S.inv.wood=(S.inv.wood||0)+200;openPanel('bench');upPut('wood',9999);renderPanel();const btn=document.querySelector('[data-a="upgo"]');const can=btn&&!btn.disabled;if(can)btn.click();return JSON.stringify({bench:!!b,ok,can,k0:INT.kind})}""")
    R0=json.loads(r);await pg.wait_for_timeout(5200)
    r=await ev("""()=>{const h=structs.find(s=>s.own&&s.t==='phouse');window.H83S=h;const ex=INT.it[0];return JSON.stringify({in:INT.on,kind:INT.kind,same:INT.s===h,tent:structs.filter(s=>s.own&&s.t==='ptent').length,dp:+Math.hypot(P.x-PP[0],P.z-PP[1]).toFixed(3),rot:Math.abs(P.rot-PP[2])<1e-6,
      exitZ:ex&&+(ex.z-(INT.z+INT.door-.2)).toFixed(3),door:+INT.door.toFixed(2),home:+Math.hypot(S.home.x-h.x,S.home.z-(h.z+BUILDS.phouse.bz+1.1)).toFixed(2),bench:B83&&structs.includes(B83)&&B83.m.visible,busy,hk:h&&B83&&B83.hk===homeKey(h)})}""")
    R=json.loads(r);R.update(R0);R['ok']=R0['can'] and R['in'] and R['kind']=='house' and R['same'] and R['tent']==0 and R['dp']<.01 and R['rot'] and R['exitZ']==0 and R['home']<.05 and R['bench'] and not R['busy'] and R['hk'];res['tent_house']=R
    await shot('p83_up_house.jpg',300)
    # 3. 나가기 문이 새 방 문 자리에서 돼요
    r=await ev("""()=>{const ex=INT.it[0];P.x=ex.x;P.z=ex.z-.5;const t=findTarget&&findTarget();return JSON.stringify({lab:t&&t.lab||(t&&t.s&&sLabel(t.s))||null})}""")
    res['exitLab']=json.loads(r)
    # 4. 집 → 2층 집: 새 계단 자리에 서 있어도 안 끼고, 그 자리에 그대로
    r=await ev("""()=>{P.x=INT.x-2.2;P.z=INT.z-2.75;P.rot=2.1;window.PP=[P.x,P.z];const wasFree=intWalk(P.x,P.z,.42)===null;S.inv.kit_floor2=1;openPanel('bench');renderPanel();const q=document.querySelector('[data-a="h82up"][data-k="floor2"]');const can=q&&!q.disabled;
      if(can)q.click();return JSON.stringify({wasFree,can})}""")
    R0=json.loads(r);await pg.wait_for_timeout(5600)
    r=await ev("""()=>{const h=structs.find(s=>s.own&&s.t==='phouse2');window.H83S=h;const ex=INT.it[0];return JSON.stringify({in:INT.on,kind:INT.kind,same:INT.s===h,old:structs.filter(s=>s.own&&s.t==='phouse').length,dx:+Math.abs(P.x-PP[0]).toFixed(3),dz:+(P.z-PP[1]).toFixed(2),free:intWalk(P.x,P.z,.42)===null,
      exitZ:ex&&+(ex.z-(INT.z+INT.door-.2)).toFixed(3),home:+Math.hypot(S.home.x-h.x,S.home.z-(h.z+BUILDS.phouse2.bz+1.1)).toFixed(2),bench:B83&&structs.includes(B83)&&B83.m.visible,busy,kit:S.inv.kit_floor2||0})}""")
    R=json.loads(r);R.update(R0);R['ok']=R0['wasFree'] and R0['can'] and R['in'] and R['kind']=='house2' and R['same'] and R['old']==0 and R['dx']<.01 and 0<=R['dz']<.5 and R['free'] and R['exitZ']==0 and R['home']<.05 and R['bench'] and not R['busy'] and R['kit']==0;res['house_h2']=R
    await ev("()=>{P.x=INT.x+.5;P.z=INT.z+1.2;return 1}");await shot('p83_up_h2.jpg',600)
    # 5. 계단 자리에 물건 못 놓음, 다른 자리는 됨
    r=await ev("""()=>{S.inv.kit_chair=(S.inv.kit_chair||0)+1;const t=BUILDS.chair?'chair':BUILDS.stool_wood?'stool_wood':null;if(!t)return JSON.stringify({none:1});S.inv[BUILDS[t].kit]=(S.inv[BUILDS[t].kit]||0)+1;setBuild(t);BPIN.on=true;const [sx,sz]=H82.stair;BPIN.x=INT.x+sx;BPIN.z=INT.z+sz+.4;P.x=INT.x+2;P.z=INT.z+1;
      const g1=ghostPos();BPIN.x=INT.x+3.4;BPIN.z=INT.z-1.6;const g2=ghostPos();BPIN.on=false;setBuild(null);return JSON.stringify({t,why1:g1.why,ok2:g2.ok,why2:g2.why})}""")
    R=json.loads(r);R['ok']=R.get('why1')=='계단과 겹쳐요' and R.get('ok2');res['stairBlock']=R
    # 6. 나가기 → 문 앞, 바깥: 집 크기 충돌·나무 없음·문 앞 걸을 수 있음
    await ev("()=>{intOut();return 1}");await pg.wait_for_timeout(700)
    r=await ev("""()=>{const h=H83S,q=h83Box(h),c=Math.cos(q.r),sn=Math.sin(q.r);let trees=0;objs.forEach(o=>{if(o.re>0)return;const dx=o.x-q.x,dz=o.z-q.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<q.hw&&lz>-q.b&&lz<q.f)trees++});
      let plants=0;if(typeof PL!=='undefined')for(const p of PL.list){if(plGone(p))continue;const dx=p.x-q.x,dz=p.z-q.z;if(Math.abs(dx)<q.hw&&Math.abs(dz)<q.b)plants++}
      return JSON.stringify({out:!INT.on,atDoor:+Math.hypot(P.x-h.x,P.z-(h.z+BUILDS.phouse2.bz+1.1)).toFixed(2),wallL:!!blocked(h.x-2.6,h.z,.42),wallBack:!!blocked(h.x,h.z-2.6,.42),porch:!!blocked(h.x+.5,h.z+2.9,.42),doorFree:!blocked(P.x,P.z,.42),trees,plants,lab:target&&target.lab||null})}""")
    R=json.loads(r);R['ok']=R['out'] and R['atDoor']<.05 and R['wallL'] and R['wallBack'] and R['porch'] and R['doorFree'] and R['trees']==0 and R['plants']==0;res['outside']=R
    await ev("()=>{P.x=H83S.x+.4;P.z=H83S.z+5.2;P.rot=Math.PI;zoomK=1.05;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await shot('p83_out.jpg',1500)
    # 7. 넓어질 자리 검사: 옆 구조물·물가·길이면 막힘
    r=await ev("""()=>{const h=H83S;const L=addStruct({t:'lamp',x:h.x+2.6,z:h.z+.5,r:0,own:1,hp:50});const fake={x:h.x,z:h.z,r:0,t:'phouse'};const w1=h83Why(fake);removeStruct(L);const w0=h83Why({x:h.x,z:h.z+40,r:0});
      let coast=null;for(let a=0;a<6.28&&!coast;a+=.3){let x=VIL.x,z=VIL.z;for(let k=0;k<400;k++){x+=Math.cos(a)*.5;z+=Math.sin(a)*.5;if(hAt(x,z)<.3){coast=[x-Math.cos(a)*2,z-Math.sin(a)*2];break}}}
      const wc=coast?h83Why({x:coast[0],z:coast[1],r:0}):'no coast';let road=null;if(PATHS.length){const p=PATHS[Math.floor(PATHS.length/2)];road=h83Why({x:p.x+.3,z:p.z+.3,r:0})}
      return JSON.stringify({w1,wc,road})}""")
    R=json.loads(r);R['ok']=bool(R['w1']) and '가로등' in R['w1'] and bool(R['wc']) and bool(R['road']);res['why']=R
    allok=all(v.get('ok',True) for v in res.values() if isinstance(v,dict))
    for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False)[:600])
    print('ALL',allok)
