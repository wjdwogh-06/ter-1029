# 84차 검사: 상인 넷이 큰 건물 안으로 · 안 자판기 묶음 · 바깥 꾸밈 없앰 · 2층 집 0.88배
# python3 tools/gt.py tools/p84_check.py   (SHOTS=0 이면 사진 안 찍음)
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.coins=99999}")
    # 1) 건물·자리·없앤 것
    r=await ev("""()=>{const o={b:{}};const otIn=(x,z,m)=>{const F=OTB.fence;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;const dx=q[0]-a[0],dz=q[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t))}return c&&d>m};
      for(const k in SH84){const q=SH84[k],c=q.sc,sw=SH84SOL[k][0]*c,sd=SH84SOL[k][1]*c;let wet=0,lo=9,hi=-9,out=0;for(let u=-sw;u<=sw+1e-6;u+=.5)for(let v=-sd;v<=sd+1e-6;v+=.5){const x=q.x+u,z=q.z+v,h=hAt(x,z);if(h<.97)wet++;lo=Math.min(lo,h);hi=Math.max(hi,h);
          if(k==='plant'&&!piInside(x,z,.5))out++;if((k==='cook'||k==='hunt')&&!otIn(x,z,1))out++;if(k==='fish'&&!nobAt(x,z))out++}
        o.b[k]={x:+q.x.toFixed(1),z:+q.z.toFixed(1),w:+(2*sw).toFixed(1),d:+(2*sd).toFixed(1),wet,dh:+(hi-lo).toFixed(2),out,tri:(GEO['sh84_'+k].attributes.position.count/3)|0,ins:structs.filter(s=>s.in&&s.hk===q.hk).map(s=>s.t)}}
      o.lodge=[6.0,4.6];   /* 산장 벽 바깥 크기(lodge79 lg79Geo W=3·D=2.3) */
      o.gone={fstall:structs.filter(s=>s.t==='fstall').length,pstall:structs.filter(s=>s.t==='pstall').length,ot:structs.filter(s=>s.t==='ot_cook'||s.t==='ot_hunt').length,big:structs.filter(s=>/^pr_/.test(s.t)&&(dist(s.x,s.z,OTR.x,OTR.z)<50||dist(s.x,s.z,PIS.x,PIS.z)<40)).length,
        vs81:Object.keys(VS81.at).length,vendOut:structs.filter(s=>(s.t==='vend'||s.t==='recycle'||s.t==='pvend')&&!s.in&&s.pi>=8).length,smoke:PLSMOKE.length,boats:PLBOATS.length,fire:structs.filter(s=>s.t==='fire'&&dist(s.x,s.z,FISHISLE.x,FISHISLE.z)<35).length,FNPC:!!FNPC,GNPC:!!GNPC,otn:Object.values(OTN).filter(q=>q.x!==undefined).length};
      o.keep={cgate:structs.filter(s=>s.t==='cgate').length,pgate:structs.filter(s=>s.t==='pgate').length,nob:NOB.filter(n=>n.k==='fish'||n.k==='pis'||n.k==='otter').length,safeOtter:!!inSafe(OTR.x,OTR.z)};
      o.ph2=[BUILDS.phouse2.s,BUILDS.phouse2.bx,BUILDS.phouse2.bz];return JSON.stringify(o)}""")
    d=json.loads(r);g=d['gone']
    res['build']={'d':d['b'],'lodge':d['lodge'],'ok':all(v['wet']==0 and v['dh']<.3 and v['out']==0 and len(v['ins'])==6 and v['w']*v['d']>=4*6.0*4.6 for v in d['b'].values())}
    res['gone']={'d':g,'ok':g['fstall']==0 and g['pstall']==0 and g['ot']==0 and g['big']==0 and g['vs81']==0 and g['vendOut']==0 and g['smoke']==0 and g['boats']==0 and g['fire']==0 and not g['FNPC'] and not g['GNPC'] and g['otn']==0}
    res['keep']={'d':d['keep'],'ok':d['keep']['cgate']>=2 and d['keep']['pgate']==1 and d['keep']['nob']==3 and d['keep']['safeOtter']}
    res['phouse2']={'d':d['ph2'],'ok':abs(d['ph2'][0]-.88)<1e-6 and abs(d['ph2'][1]-2.64)<1e-6}
    # 2) 문에서 건물 문 앞까지 걸어서(문 열고), 건물은 막힘
    r=await ev("""()=>{const o={};for(const s of structs)if(s.t==='cgate'||s.t==='pgate')s.open=true;const G={fish:structs.find(s=>s.t==='cgate'&&dist(s.x,s.z,FISHISLE.x,FISHISLE.z)<30),plant:structs.find(s=>s.t==='pgate'),otter:structs.find(s=>s.t==='cgate'&&dist(s.x,s.z,OTR.x,OTR.z)<50)};
      const bfs=(sx,sz,tx,tz,R)=>{const st=.5,seen=new Set(),q=[[sx,sz]];seen.add(Math.round(sx/st)+','+Math.round(sz/st));let n=0;while(q.length&&n<60000){const [x,z]=q.shift();n++;if(Math.hypot(x-tx,z-tz)<.8)return true;
        for(const [dx,dz] of[[st,0],[-st,0],[0,st],[0,-st]]){const nx=x+dx,nz=z+dz,k=Math.round(nx/st)+','+Math.round(nz/st);if(seen.has(k)||Math.hypot(nx-tx,nz-tz)>R)continue;seen.add(k);if(walk(nx,nz,.42,P)===null)q.push([nx,nz])}}return false};
      for(const k in SH84){const q=SH84[k],g=G[k==='fish'?'fish':k==='plant'?'plant':'otter'],front=[q.door.x,q.door.z+.9];o[k]={walk:bfs(g.x,g.z+(k==='fish'||k==='plant'?1.2:0)+(k==='cook'||k==='hunt'?0:0),front[0],front[1],90)};
        if(k==='cook'||k==='hunt'){const b=OTB;o[k].walk=bfs(b.G[0]-b.dx*1.5,b.G[1]-b.dz*1.5,front[0],front[1],70)}
        o[k].inside=walk(q.x,q.z,.42,P)!==null&&walk(q.x+SH84SOL[k][0]*q.sc*.8,q.z,.42,P)!==null&&walk(q.door.x,q.door.z-1.0,.42,P)!==null;
        let wm=0;for(let dz=.5;dz<=4;dz+=.25)wm=Math.max(wm,plWornAt(q.door.x,q.door.z+dz));o[k].worn=+wm.toFixed(2)}
      for(const s of structs)if(s.t==='cgate'||s.t==='pgate')s.open=false;
      const f=SH84.fish.dock;o.pier=f?{len:+(f.x1-f.x0).toFixed(1),end:!!onDock(f.x0+.6,(f.z0+f.z1)/2),y:+f.y.toFixed(2),water:hAt(f.x0+.6,(f.z0+f.z1)/2)<0}:null;return JSON.stringify(o)}""")
    d=json.loads(r);res['walk']={'d':d,'ok':all(d[k]['walk'] and d[k]['inside'] and d[k]['worn']>.3 for k in['fish','plant','cook','hunt']) and d['pier'] and d['pier']['end'] and d['pier']['water'] and d['pier']['len']>10}
    # 3) 문 앞 이름표(맨손·낚싯대) → 들어가기 → 안
    res['in']={}
    for k in ['fish','plant','cook','hunt']:
        r=await ev(f"""()=>{{const q=SH84.{k},o={{}};P.x=q.door.x;P.z=q.door.z+.9;P.rot=Math.PI;const L=()=>{{const t=findTarget();return t?(t.lab||(t.s&&sLabel(t.s))):null}};o.lab=L();
          const h=S.home&&[S.home.x,S.home.z];S.inv.rod=Math.max(1,S.inv.rod||0);S.quick[S.sel]='rod';o.rodLab=L();S.quick[S.sel]=null;window._h84=h;return JSON.stringify(o)}}""")
        o=json.loads(r)
        await ev(f"()=>{{sh84Enter('{k}');return 1}}");await pg.wait_for_timeout(2300)
        r=await ev(f"""()=>{{const q=SH84.{k},o={{}};o.on=INT.on;o.kind=INT.kind;o.home=JSON.stringify([S.home.x,S.home.z])===JSON.stringify(window._h84);o.visIn=structs.filter(s=>s.in&&s.m&&s.m.visible).map(s=>s.t).sort().join(',');
          for(let i=0;i<30;i++)updEnv(.05,P.x,P.z);o.npcIn=!!(q.a&&q.a.root.visible);o.npcAt=q.a?+dist(q.a.root.position.x,q.a.root.position.z,INT.x+SH84NPC[0],INT.z+SH84NPC[1]).toFixed(2):-1;
          /* 방 안 1m 칸 채우기 → 모든 안 구조물에 0.9m 안으로 닿는지 */
          const st=.25,seen=new Set(),Q=[[INT.x,INT.z+INT.hd-.6]];let n=0,cells=[];while(Q.length&&n<20000){{const [x,z]=Q.shift();n++;cells.push([x,z]);for(const [dx,dz] of[[st,0],[-st,0],[0,st],[0,-st]]){{const nx=x+dx,nz=z+dz,kk=Math.round(nx/st)+','+Math.round(nz/st);if(seen.has(kk))continue;seen.add(kk);if(intWalk(nx,nz,.42)===null)Q.push([nx,nz])}}}}
          o.cells=cells.length;o.reach={{}};for(const s of structs.filter(s=>s.in&&s.hk===q.hk)){{let b=9;for(const [x,z] of cells)b=Math.min(b,sGap(x,z,s));o.reach[s.t]=+b.toFixed(2)}}
          o.labs={{}};for(const s of structs.filter(s=>s.in&&s.hk===q.hk)){{const lab=sLabel(s);o.labs[s.t]=lab}}
          return JSON.stringify(o)}}""")
        o.update(json.loads(r))
        # 말 걸기 · 자판기 셋 창 · 랜덤 자판기 · 쓰레기통
        r=await ev(f"""()=>{{const q=SH84.{k},o={{}};const near=s=>{{P.x=s.x;P.z=s.z+(sdef(s).bz||.5)+.5;P.rot=Math.PI;const t=findTarget();return t&&t.s===s}};
          o.ctrNear=near(q.ctr);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.say=!!(CHAT.b&&CHAT.b.has('sh84_{k}'));
          const pv=structs.find(s=>s.t==='pv84b'&&s.hk===q.hk);o.pvNear=near(pv);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.panel=panel+'|'+$('ptabs').textContent+'|'+$('pbody').textContent.slice(0,14);closePanel();
          PV84.items.b=[['ammoS',12,50]];near(pv);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;const a0=invN('ammoS'),c0=S.coins;const btn=document.querySelector('[data-a=pv84buy]');if(btn)btn.click();o.buy=[c0-S.coins,invN('ammoS')-a0];closePanel();PV84.items.b=[];
          const v=structs.find(s=>s.t==='vend'&&s.hk===q.hk);o.vNear=near(v);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.vpanel=panel+':'+VENDAT;closePanel();
          const rc=structs.find(s=>s.t==='recycle'&&s.hk===q.hk);o.rNear=near(rc);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.rpanel=panel;closePanel();
          setBuild('fence');const gp=ghostPos();setBuild(null);o.noBuild=gp&&!gp.ok;o.why=gp&&gp.why;return JSON.stringify(o)}}""")
        o.update(json.loads(r))
        if os.environ.get('SHOTS','1')!='0':
            await ev("()=>{P.x=INT.x+1.5;P.z=INT.z+1.4;P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(900)
            await pg.screenshot(path=O(f'p84_{k}_in.jpg'),type='jpeg',quality=84)
        # 나가기
        r=await ev("""()=>{P.x=INT.x;P.z=INT.z+INT.door-.6;P.rot=0;const t=findTarget();const lab=t&&t.s&&sLabel(t.s);return lab||''}""")
        o['exitLab']=r
        await ev("()=>{intLeave();return 1}");await pg.wait_for_timeout(1800)
        r=await ev(f"()=>{{const q=SH84.{k};return JSON.stringify({{out:!INT.on,at:+dist(P.x,P.z,q.door.x,q.door.z+q.ret).toFixed(2),free:walk(P.x,P.z,.42,P)===null,vis:structs.filter(s=>s.in&&s.hk===q.hk&&s.m&&s.m.visible).length,npc:!!(q.a&&q.a.root.visible)}})}}")
        o.update(json.loads(r))
        o['ok']=o['on'] and o['kind']=='sh84_'+k and o['home'] and o['visIn']=='pv84b,pv84g,pv84r,recycle,sh84_ctr,vend' and o['npcIn'] and o['npcAt']<.05 and all(v<=.9 for v in o['reach'].values()) and len(o['reach'])==6 \
            and o['ctrNear'] and o['say'] and o['pvNear'] and o['panel'].startswith('pvend84|🥤 파란 일반 자판기|아직') and o['buy']==[50,12] and o['vNear'] and o['vpanel']=='vend:'+str({'fish':8,'plant':9,'cook':10,'hunt':11}[k]) and o['rNear'] and o['rpanel']=='recycle' \
            and o['noBuild'] and o['exitLab']=='나가기' and o['out'] and o['at']<.3 and o['free'] and o['vis']==0 and not o['npc']
        res['in'][k]=o
    labs=await ev("()=>JSON.stringify(Object.fromEntries(Object.keys(SH84).map(k=>[k,SH84[k].n])))");N=json.loads(labs)
    for k,o in res['in'].items():o['ok']=o['ok'] and o['lab']==N[k]+' 들어가기' and o['rodLab']==N[k]+' 들어가기'
    # 4) 사진
    if os.environ.get('SHOTS','1')!='0':
        for k,dz,zk,nm in [('fish',3,2.7,'far'),('fish',9,1.3,'near'),('plant',3,2.7,'far'),('plant',10,1.3,'near'),('cook',2,2.7,'far'),('cook',9,1.3,'near'),('hunt',3,2.7,'far'),('hunt',10,1.3,'near')]:
            await ev(f"()=>{{const q=SH84.{k};P.x=q.x;P.z=q.z+{dz};P.rot=Math.PI;zoomK={zk};ZOOM.t=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1400)
            await pg.screenshot(path=O(f'p84_{k}_{nm}.jpg'),type='jpeg',quality=84)
        await ev("()=>{zoomK=1;S.time=.95;const q=SH84.fish;P.x=q.x;P.z=q.z+9;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1800)
        await pg.screenshot(path=O('p84_fish_night.jpg'),type='jpeg',quality=84)
        await ev("()=>{S.time=.42;zoomK=1}")
        await pg.set_viewport_size({'width':430,'height':900});await pg.wait_for_timeout(900)
        await ev("()=>{const q=SH84.cook;P.x=q.door.x;P.z=q.door.z+.9;sh84Enter('cook');return 1}");await pg.wait_for_timeout(2400)
        await ev("()=>{P.x=INT.x+4;P.z=INT.z-3.2;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(900)
        await pg.screenshot(path=O('p84_cook_in_port.jpg'),type='jpeg',quality=84)
        await ev("()=>{intOut();return 1}")
        await pg.set_viewport_size({'width':880,'height':400})
    for k,v in res.items():
        if k=='in':
            for kk,vv in v.items():print('in.'+kk,vv['ok'],json.dumps({x:vv[x] for x in vv if x!='ok'},ensure_ascii=False)[:900])
        else:print(k,v['ok'],json.dumps(v.get('d'),ensure_ascii=False)[:700])
    print('ALL',all(v['ok'] for k,v in res.items() if k!='in') and all(v['ok'] for v in res['in'].values()))
