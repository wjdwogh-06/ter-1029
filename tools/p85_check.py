# 85차 검사: 상인 가게 넷 — 건물은 작게(가장 멀리 보기에서 한 화면) · 둘레 마당(데크·돌·자갈·흙)과 꾸밈 · 걸어서 문까지 ·
#   안은 넓게(가운데 방 + 옆방들, 모두 걸어서 닿음) · 요리·사냥 가게는 마주 봄 · 84차 것(자판기 묶음·상인·없앤 꾸밈·2층 집 0.88) 그대로
# python3 tools/gt.py tools/p85_check.py   (SHOTS=0 이면 사진 안 찍음)
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{};S.coins=99999}")
    # 1) 건물·마당·자리
    r=await ev("""()=>{const o={b:{}};const otIn=(x,z,m)=>{const F=OTB.fence;let c=false,d=1e9;for(let i=0,j=F.length-1;i<F.length;j=i++){const a=F[i],q=F[j];if((a[1]>z)!=(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c;const dx=q[0]-a[0],dz=q[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t))}return c&&d>m};
      for(const k in SH84){const q=SH84[k],g=GEO['sh84_'+k],pa=g.attributes.position;let top=0;for(let i=0;i<pa.count;i+=3){const x=pa.getX(i),z=pa.getZ(i);if(Math.abs(x)<q.B[0]+.8&&Math.abs(z)<q.B[1]+1.0)top=Math.max(top,pa.getY(i))}
        const L0=q.lots[0];let out=0,foreign=[],n=0,lo=9,hi=-9;for(let a=L0[0];a<=L0[1]+1e-6;a+=.5)for(let b=L0[2];b<=L0[3]+1e-6;b+=.5){const [x,z]=q.L(a,b);n++;const h=hAt(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);
          if(k==='plant'&&!piInside(x,z,.3))out++;if((k==='cook'||k==='hunt')&&!otIn(x,z,.6))out++;if(k==='fish'&&!nobAt(x,z))out++}
        for(const s of structs){if(s.sk||s.sk85||s.in||s===q.s)continue;const d=sdef(s);if(d.pass)continue;const r=q.r||0,dx=s.x-q.x,dz=s.z-q.z,c=Math.cos(r),sn=Math.sin(r),lx=dx*c-dz*sn,lz=dx*sn+dz*c;for(const L of q.lots)if(lx>L[0]-.3&&lx<L[1]+.3&&lz>L[2]-.3&&lz<L[3]+.3)foreign.push(s.t)}
        const base=q.s.m.position.y;o.b[k]={x:+q.x.toFixed(1),z:+q.z.toFixed(1),w:+(2*q.B[0]).toFixed(1),d:+(2*q.B[1]).toFixed(1),top:+top.toFixed(2),lot:[+(L0[1]-L0[0]).toFixed(1),+(L0[3]-L0[2]).toFixed(1)],
          out,foreign,groundDh:+(hi-lo).toFixed(2),yo:+(q.yo||0).toFixed(2),lift:+(base+.04+q.LY-hi).toFixed(2),tri:(pa.count/3)|0,walls:q.walls.length,ins:structs.filter(s=>s.in&&s.hk===q.hk).map(s=>s.t).sort().join(',')}}
      const f=SH84.fish,pe=f.L(-20.2,2.8),pd=onDock(pe[0],pe[1]);o.pier={water:hAt(pe[0],pe[1])<-.2,dock:!!pd,y:pd?+(pd.y-hAt(f.x,f.z)).toFixed(2):null};
      o.lodge=[6.0,4.6];o.old84=[[14.3,9.7],[19,12.8],[15.2,10.6],[15.2,10.6]];
      o.gone={fstall:structs.filter(s=>s.t==='fstall').length,pstall:structs.filter(s=>s.t==='pstall').length,ot:structs.filter(s=>s.t==='ot_cook'||s.t==='ot_hunt').length,big:structs.filter(s=>/^pr_/.test(s.t)&&(dist(s.x,s.z,OTR.x,OTR.z)<50||dist(s.x,s.z,PIS.x,PIS.z)<40)).length,
        vs81:Object.keys(VS81.at).length,vendOut:structs.filter(s=>(s.t==='vend'||s.t==='recycle'||s.t==='pvend')&&!s.in&&s.pi>=8).length,smoke:PLSMOKE.length,boats:PLBOATS.length,FNPC:!!FNPC,GNPC:!!GNPC,otn:Object.values(OTN).filter(q=>q.x!==undefined).length};
      o.keep={cgate:structs.filter(s=>s.t==='cgate').length,pgate:structs.filter(s=>s.t==='pgate').length,nob:NOB.filter(n=>n.k==='fish'||n.k==='pis'||n.k==='otter').length,safeOtter:!!inSafe(OTR.x,OTR.z),trees:SH84T.n};
      o.ph2=[BUILDS.phouse2.s,BUILDS.phouse2.bx,BUILDS.phouse2.bz];
      /* 요리·사냥: 서로 마주 봄(정면이 상대 쪽으로 20~35°) · 붙지 않음 */
      const c=SH84.cook,h=SH84.hunt,v=[h.x-c.x,h.z-c.z],dd=Math.hypot(v[0],v[1]),fc=[Math.sin(c.r),Math.cos(c.r)],fh=[Math.sin(h.r),Math.cos(h.r)];
      o.face={dist:+dd.toFixed(1),cook:+(c.r*180/Math.PI).toFixed(1),hunt:+(h.r*180/Math.PI).toFixed(1),cookTo:+((fc[0]*v[0]+fc[1]*v[1])/dd).toFixed(2),huntTo:+((-fh[0]*v[0]-fh[1]*v[1])/dd).toFixed(2),gap:+(dd-2*8.2*Math.cos(Math.abs(c.r))).toFixed(1)};
      return JSON.stringify(o)}""")
    d=json.loads(r);g=d['gone'];B=d['b']
    res['build']={'d':B,'ok':all(v['out']==0 and not v['foreign'] and v['lift']>=0 and v['lift']<.6 and v['ins']=='pv84b,pv84g,pv84r,recycle,sh84_ctr,vend' and v['top']<9.6 and v['w']*v['d']>=2.0*6.0*4.6 for v in B.values())
        and all(B[k]['lot'][0]*B[k]['lot'][1]>=.9*o84[0]*o84[1] for k,o84 in zip(['fish','plant','cook','hunt'],d['old84'])) and d['pier']['water'] and d['pier']['dock']}
    res['face']={'d':d['face'],'ok':d['face']['cookTo']>.3 and d['face']['huntTo']>.3 and 20<=abs(d['face']['cook'])<=35 and 20<=abs(d['face']['hunt'])<=35 and d['face']['gap']>8}
    res['gone']={'d':g,'ok':g['fstall']==0 and g['pstall']==0 and g['ot']==0 and g['big']==0 and g['vs81']==0 and g['vendOut']==0 and g['smoke']==0 and g['boats']==0 and not g['FNPC'] and not g['GNPC'] and g['otn']==0}
    res['keep']={'d':d['keep'],'ok':d['keep']['cgate']>=2 and d['keep']['pgate']==1 and d['keep']['nob']==3 and d['keep']['safeOtter'] and d['keep']['trees']>=4}
    res['phouse2']={'d':d['ph2'],'ok':abs(d['ph2'][0]-.88)<1e-6 and abs(d['ph2'][1]-2.64)<1e-6}
    # 2) 가장 멀리 보기(zoom 1.3)에서 건물이 한 화면에: 가로 화면은 문 앞·건물 앞에서 위끝, 세로 화면은 건물 앞 가운데에서 좌우
    fit={}
    for vw,vh,tag in [(880,400,'L'),(430,900,'P')]:
        await pg.set_viewport_size({'width':vw,'height':vh});await pg.wait_for_timeout(700)
        r=await ev("""()=>{const out={};for(const k in SH84){const q=SH84[k],r=q.r||0;for(const st of['door','front','ctr']){
          if(st==='door'){P.x=q.door.x+Math.sin(r)*q.ret;P.z=q.door.z+Math.cos(r)*q.ret}else if(st==='front'){const w=q.L(0,q.B[1]+2.4);P.x=w[0];P.z=w[1]}else{const w=q.L(0,1.2);P.x=w[0];P.z=w[1]}
          zoomK=ZOOM.max;ZOOM.t=null;updCamera(0,P.x,st==='ctr'?q.s.m.position.y+q.LY:groundY(P.x,P.z),P.z,true);cam.updateMatrixWorld();
          const m=q.s.m;m.updateMatrixWorld(true);const g=GEO['sh84_'+k],pa=g.attributes.position,v=new THREE.Vector3();let y=-9,x0=9,x1=-9;
          for(let i=0;i<pa.count;i+=2){v.fromBufferAttribute(pa,i);if(Math.abs(v.x)>q.B[0]+1.4||Math.abs(v.z)>q.B[1]+1.9)continue;v.applyMatrix4(m.matrixWorld);v.project(cam);y=Math.max(y,v.y);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x)}
          out[k+'_'+st]=[+y.toFixed(2),+x0.toFixed(2),+x1.toFixed(2)]}}zoomK=1;return JSON.stringify(out)}""")
        fit[tag]=json.loads(r)
    await pg.set_viewport_size({'width':880,'height':400});await pg.wait_for_timeout(700)
    res['fit']={'d':fit,'ok':all(fit['L'][k+'_'+st][0]<=.98 for k in['fish','plant','cook','hunt'] for st in['door','front']) and all(max(-fit['P'][k+'_ctr'][1],fit['P'][k+'_ctr'][2])<=.98 for k in['fish','plant','cook','hunt'])}
    # 3) 문에서 가게 문 앞까지 걸어서(높이 차 0.55 넘게 못 올라감 — 데크·마당·현관 그대로), 건물·소품은 막힘
    r=await ev("""()=>{const o={};for(const s of structs)if(s.t==='cgate'||s.t==='pgate')s.open=true;const G={fish:structs.find(s=>s.t==='cgate'&&dist(s.x,s.z,FISHISLE.x,FISHISLE.z)<30),plant:structs.find(s=>s.t==='pgate')};
      const ok=(x0,z0,x,z)=>{if(walk(x,z,.42,P)!==null)return false;const y0=stepY(x0,z0);if(stepY(x,z)-y0>STEP_UP)return false;const dx=Math.sign(x-x0),dz=Math.sign(z-z0),px=x+dx*.38,pz=z+dz*.38;return !onDock(px,pz)||stepY(px,pz)-y0<=STEP_UP};
      const bfs=(sx,sz,door,R)=>{const st=.5,seen=new Set(),q=[[sx,sz]];seen.add(Math.round(sx/st)+','+Math.round(sz/st));let n=0;while(q.length&&n<90000){const [x,z]=q.shift();n++;if(sGap(x,z,door)<=TREACH)return n;
        for(const [dx,dz] of[[st,0],[-st,0],[0,st],[0,-st]]){const nx=x+dx,nz=z+dz,k=Math.round(nx/st)+','+Math.round(nz/st);if(seen.has(k)||Math.hypot(nx-door.x,nz-door.z)>R)continue;seen.add(k);if(ok(x,z,nx,nz))q.push([nx,nz])}}return 0};
      for(const k in SH84){const q=SH84[k];let sx,sz;if(k==='fish'){sx=G.fish.x;sz=G.fish.z+1.2}else if(k==='plant'){sx=G.plant.x;sz=G.plant.z-1.2}else{const b=OTB;sx=b.G[0]-b.dx*1.5;sz=b.G[1]-b.dz*1.5}
        o[k]={walk:bfs(sx,sz,q.door,95)>0};const c=q.L(0,0),f=q.L(0,q.B[1]+.05),y=q.s.m.position.y+.04;o[k].bld=groundY(c[0],c[1])-y>5&&groundY(f[0],f[1])-y>5;
        const lp=q.L(q.dp[0],q.lots[0][3]-.5);o[k].lotY=+(groundY(lp[0],lp[1])-y-q.LY).toFixed(2);
        let wm=0;for(let dz=.5;dz<=6;dz+=.25){const p2=q.L(q.dp[0],q.lots[0][3]+dz);wm=Math.max(wm,plWornAt(p2[0],p2[1]))}o[k].worn=+wm.toFixed(2)}
      for(const s of structs)if(s.t==='cgate'||s.t==='pgate')s.open=false;return JSON.stringify(o)}""")
    d=json.loads(r);res['walk']={'d':d,'ok':all(d[k]['walk'] and d[k]['bld'] and abs(d[k]['lotY'])<.05 and d[k]['worn']>.3 for k in['fish','plant','cook','hunt'])}
    # 4) 문 앞 이름표(맨손·낚싯대) → 들어가기 → 안(방 여러 개 · 모두 닿음 · 상인 · 자판기)
    res['in']={}
    for k in ['fish','plant','cook','hunt']:
        r=await ev(f"""()=>{{const q=SH84.{k},o={{}},r=q.r||0;P.x=q.door.x+Math.sin(r)*.9;P.z=q.door.z+Math.cos(r)*.9;P.rot=r+Math.PI;const L=()=>{{const t=findTarget();return t?(t.lab||(t.s&&sLabel(t.s))):null}};o.lab=L();
          const h=S.home&&[S.home.x,S.home.z];S.inv.rod=Math.max(1,S.inv.rod||0);S.quick[S.sel]='rod';o.rodLab=L();S.quick[S.sel]=null;window._h85=h;return JSON.stringify(o)}}""")
        o=json.loads(r)
        await ev(f"()=>{{sh84Enter('{k}');return 1}}");await pg.wait_for_timeout(2300)
        r=await ev(f"""()=>{{const q=SH84.{k},C=SH85IN.{k},o={{}};o.on=INT.on;o.kind=INT.kind;o.size=[INT.hw*2,INT.hd*2];o.home=JSON.stringify([S.home.x,S.home.z])===JSON.stringify(window._h85);o.visIn=structs.filter(s=>s.in&&s.m&&s.m.visible).map(s=>s.t).sort().join(',');
          for(let i=0;i<30;i++)updEnv(.05,P.x,P.z);o.npcIn=!!(q.a&&q.a.root.visible);o.npcAt=q.a?+dist(q.a.root.position.x,q.a.root.position.z,INT.x+C.npc[0],INT.z+C.npc[1]).toFixed(2):-1;
          const st=.25,seen=new Set(),Q=[[INT.x,INT.z+INT.hd-.6]];let n=0,cells=[];while(Q.length&&n<60000){{const [x,z]=Q.shift();n++;cells.push([x,z]);for(const [dx,dz] of[[st,0],[-st,0],[0,st],[0,-st]]){{const nx=x+dx,nz=z+dz,kk=Math.round(nx/st)+','+Math.round(nz/st);if(seen.has(kk))continue;seen.add(kk);if(intWalk(nx,nz,.42)===null)Q.push([nx,nz])}}}}
          o.cells=cells.length;o.reach={{}};for(const s of structs.filter(s=>s.in&&s.hk===q.hk)){{let b=9;for(const [x,z] of cells)b=Math.min(b,sGap(x,z,s));o.reach[s.t]=+b.toFixed(2)}}
          /* 방마다: 걸어서 닿는 칸이 방 넓이의 몇 % */
          o.rooms=C.rooms.map(([x0,x1,z0,z1])=>{{let c=0;for(const [x,z] of cells){{const lx=x-INT.x,lz=z-INT.z;if(lx>x0+.3&&lx<x1-.3&&lz>z0+.3&&lz<z1-.3)c++}}return Math.round(100*c*st*st/((x1-x0)*(z1-z0)))}});
          o.signs=INT.gr[q.room].children.filter(m=>m.material&&m.material.map).length;o.parts=C.part.length;
          o.labs={{}};for(const s of structs.filter(s=>s.in&&s.hk===q.hk)){{o.labs[s.t]=sLabel(s)}}
          return JSON.stringify(o)}}""")
        o.update(json.loads(r))
        r=await ev(f"""()=>{{const q=SH84.{k},o={{}};const near=s=>{{P.x=s.x;P.z=s.z+(sdef(s).bz||.5)+.5;P.rot=Math.PI;const t=findTarget();return t&&t.s===s}};
          o.ctrNear=near(q.ctr);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.say=!!(CHAT.b&&CHAT.b.has('sh84_{k}'));
          const pv=structs.find(s=>s.t==='pv84b'&&s.hk===q.hk);o.pvNear=near(pv);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.panel=panel+'|'+$('ptabs').textContent+'|'+$('pbody').textContent.slice(0,14);closePanel();
          PV84.items.b=[['ammoS',12,50]];near(pv);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;const a0=invN('ammoS'),c0=S.coins;const btn=document.querySelector('[data-a=pv84buy]');if(btn)btn.click();o.buy=[c0-S.coins,invN('ammoS')-a0];closePanel();PV84.items.b=[];
          const v=structs.find(s=>s.t==='vend'&&s.hk===q.hk);o.vNear=near(v);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.vpanel=panel+':'+VENDAT;closePanel();
          const rc=structs.find(s=>s.t==='recycle'&&s.hk===q.hk);o.rNear=near(rc);target=findTarget();inp.actEdge=1;interact();inp.actEdge=0;o.rpanel=panel;closePanel();
          setBuild('fence');const gp=ghostPos();setBuild(null);o.noBuild=gp&&!gp.ok;o.why=gp&&gp.why;return JSON.stringify(o)}}""")
        o.update(json.loads(r))
        if os.environ.get('SHOTS','1')!='0':
            for nm,dx,dz in [('in',0,1.0),('inL',-8.4,1.6),('inR',8.4,1.6)]:
                await ev(f"()=>{{P.x=INT.x+{dx};P.z=INT.z+{dz};P.rot=Math.PI;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);$('toast').classList.remove('on');return 1}}");await pg.wait_for_timeout(900)
                await pg.screenshot(path=O(f'p85_{k}_{nm}.jpg'),type='jpeg',quality=84)
        r=await ev("""()=>{P.x=INT.x;P.z=INT.z+INT.door-.6;P.rot=0;const t=findTarget();const lab=t&&t.s&&sLabel(t.s);return lab||''}""")
        o['exitLab']=r
        await ev("()=>{intLeave();return 1}");await pg.wait_for_timeout(1800)
        r=await ev(f"""()=>{{const q=SH84.{k},y=q.s.m.position.y+.04;return JSON.stringify({{out:!INT.on,at:+dist(P.x,P.z,q.door.x,q.door.z).toFixed(2),free:groundY(P.x,P.z)-y<1.2&&walk(P.x,P.z,.42,P)===null,vis:structs.filter(s=>s.in&&s.hk===q.hk&&s.m&&s.m.visible).length,npc:!!(q.a&&q.a.root.visible)}})}}""")
        o.update(json.loads(r))
        lab=json.loads(await ev("()=>JSON.stringify(SH84."+k+".n)"))
        o['ok']=o['on'] and o['kind']=='sh84_'+k and o['home'] and o['visIn']=='pv84b,pv84g,pv84r,recycle,sh84_ctr,vend' and o['npcIn'] and o['npcAt']<.05 and all(v<=.9 for v in o['reach'].values()) and len(o['reach'])==6 \
            and o['size'][0]*o['size'][1]>=1.9*15*10.4 and o['parts']>=3 and o['signs']>=3 and len(o['rooms'])>=4 and min(o['rooms'])>=18 \
            and o['ctrNear'] and o['say'] and o['pvNear'] and o['panel'].startswith('pvend84|🥤 파란 일반 자판기|아직') and o['buy']==[50,12] and o['vNear'] and o['vpanel']=='vend:'+str({'fish':8,'plant':9,'cook':10,'hunt':11}[k]) and o['rNear'] and o['rpanel']=='recycle' \
            and o['noBuild'] and o['exitLab']=='나가기' and o['out'] and o['free'] and o['vis']==0 and not o['npc'] and o['lab']==lab+' 들어가기' and o['rodLab']==lab+' 들어가기'
        res['in'][k]=o
    # 5) 사진
    if os.environ.get('SHOTS','1')!='0':
        await ev("()=>{$('toast').classList.remove('on');return 1}")
        for k in ['fish','plant','cook','hunt']:
            for nm,zk,st in [('max',1.3,'door'),('near',.85,'side')]:
                await ev(f"()=>{{const q=SH84.{k},r=q.r||0;if('{st}'==='door'){{P.x=q.door.x+Math.sin(r)*q.ret;P.z=q.door.z+Math.cos(r)*q.ret}}else{{const w=q.L(-2.8,q.B[1]+3.0);P.x=w[0];P.z=w[1]}}P.rot=Math.PI;zoomK={zk};ZOOM.t=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);$('toast').classList.remove('on')}}");await pg.wait_for_timeout(1400)
                await pg.screenshot(path=O(f'p85_{k}_{nm}.jpg'),type='jpeg',quality=84)
        await ev("()=>{const c=SH84.cook,h=SH84.hunt;P.x=(c.x+h.x)/2;P.z=(c.z+h.z)/2+9;zoomK=1.3;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(1400)
        await pg.screenshot(path=O('p85_otter_pair.jpg'),type='jpeg',quality=84)
        await ev("()=>{zoomK=1;S.time=.95;const q=SH84.cook;P.x=q.door.x;P.z=q.door.z+3;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(1800)
        await pg.screenshot(path=O('p85_cook_night.jpg'),type='jpeg',quality=84)
        await ev("()=>{S.time=.42;zoomK=1}")
        await pg.set_viewport_size({'width':430,'height':900});await pg.wait_for_timeout(900)
        await ev("()=>{const q=SH84.plant;P.x=q.door.x;P.z=q.door.z+.9;sh84Enter('plant');return 1}");await pg.wait_for_timeout(2400)
        await ev("()=>{P.x=INT.x-8;P.z=INT.z+1;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return 1}");await pg.wait_for_timeout(900)
        await pg.screenshot(path=O('p85_plant_in_port.jpg'),type='jpeg',quality=84)
        await ev("()=>{intOut();return 1}")
        await pg.set_viewport_size({'width':880,'height':400})
    for k,v in res.items():
        if k=='in':
            for kk,vv in v.items():print('in.'+kk,vv['ok'],json.dumps({x:vv[x] for x in vv if x!='ok'},ensure_ascii=False)[:1100])
        else:print(k,v['ok'],json.dumps(v.get('d'),ensure_ascii=False)[:900])
    print('ALL',all(v['ok'] for k,v in res.items() if k!='in') and all(v['ok'] for v in res['in'].values()))
