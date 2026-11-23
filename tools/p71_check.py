# 71차(디자인) 검사: 항구 생선 자판기 · 항구 지형지물 · 보급 창고(들어가면 투명) · 배치 도구 이름표·복사
# python3 tools/gt.py tools/p71_check.py   → 마지막 줄 ALL True
# 사진: tools/out/p71_fvend.jpg, p71_port<번호>.jpg, p71_terrace_top.jpg, p71_wh_out.jpg, p71_wh_in.jpg, p71_layout.jpg
import json,os,math
async def steps(pg):
    ev=pg.evaluate;res={}
    await ev("""()=>{window.walkPath=(pts)=>{P.x=pts[0][0];P.z=pts[0][1];let blocked=null,maxRise=0,prevY=stepY(P.x,P.z);for(let k=1;k<pts.length;k++){const [tx,tz]=pts[k];let n=Math.ceil(Math.hypot(tx-P.x,tz-P.z)/.1);const dx=(tx-P.x)/n,dz=(tz-P.z)/n,L=Math.hypot(dx,dz)||1;
        for(let i=0;i<n;i++){const nx=P.x+dx,nz=P.z+dz;if(!canStep(P,nx,nz,dx/L,dz/L)||walk(nx,nz,.42,P)!==null){blocked=[+P.x.toFixed(2),+P.z.toFixed(2)];return{blocked,y:+groundY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)}}P.x=nx;P.z=nz;const y=stepY(P.x,P.z);maxRise=Math.max(maxRise,y-prevY);prevY=y}}
        return{blocked,y:+groundY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)}};
      window.LW=(s,lx,lz)=>{const c=Math.cos(s.r||0),sn=Math.sin(s.r||0);return[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]}}""")
    # 1. 생선 자판기: 8곳, 사람 없음, 이름표·창 제목, 앞에서 닿음, 팔기 그대로
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const L=structs.filter(s=>s.t==='fbuy'),bad=[];
      for(const s of L){const d=sdef(s),Rr=Math.max(d.bx,d.bz)+3;let mg=9,mx=0,mz=0;for(let x=s.x-Rr;x<=s.x+Rr;x+=.15)for(let z=s.z-Rr;z<=s.z+Rr;z+=.15){if(!onDock(x,z)&&waterDepth(x,z)>DEEP-.05)continue;if(walk(x,z,.42,P)!==null)continue;const g=sGap(x,z,s);if(g<mg){mg=g;mx=x;mz=z}}
        P.x=mx;P.z=mz;P.rot=Math.atan2(s.x-mx,s.z-mz);const t=findTarget();if(!t||t.s!==s||t.lab!=='생선 자판기')bad.push([s.pi,+mg.toFixed(2),t&&t.lab]);
        const v=structs.find(q=>q.t==='vend'&&q.pi===s.pi);s._dv=v?+Math.hypot(v.x-s.x,v.z-s.z).toFixed(1):-1}
      const s=L[0];P.x=s.x;P.z=s.z+DECO.fbuy.bz+.75;P.rot=Math.PI;S.inv.f_trout=(S.inv.f_trout||0)+2;const c0=S.coins;S.quick[S.sel]='rod';await sl(150);const lab=target&&target.lab;inp.actEdge=true;interact();inp.actEdge=false;await sl(150);const tab=$('ptabs').textContent;
      const html=$('pbody').innerHTML;closePanel();S.quick[S.sel]=null;
      return JSON.stringify({n:L.length,npc:structs.filter(q=>q.t==='fbuy_npc').length,actors:(typeof FBUY!=='undefined'&&FBUY.L)?FBUY.L.length:0,bad,dv:L.map(q=>q._dv),labRod:lab,tab,hasTrout:/송어/.test(html),model:DECO.fbuy.g})}""")
    R=json.loads(r);R['ok']=R['n']==8 and R['npc']==0 and R['actors']==0 and not R['bad'] and R['labRod']=='생선 자판기' and '생선 자판기' in R['tab'] and R['hasTrout'] and R['model']=='hb_fvend' and all(0<d<9 for d in R['dv']);res['fvend']=R
    # 2. 지형지물: 16개(빠진 것 0), 부두·부활 길 비킴, 풀 둔덕 계단 오르기·옆 막힘, 풀 언덕 오르기, 바위 언덕·해안 바위 막힘, 설치 금지 원 = PORT_SAFE
    r=await ev("""()=>{const L=HB.list,o={n:L.length,miss:HB.miss,types:{}};for(const s of L)o.types[s.t]=(o.types[s.t]||0)+1;
      const tr=L.find(s=>/hb_terrace/.test(s.t)),kn=L.find(s=>/hb_knoll/.test(s.t)),bl=L.find(s=>/hb_bluff/.test(s.t)),sh=L.find(s=>/hb_shore/.test(s.t)),b=s=>s.m.position.y+.04;
      const rel=(w,s)=>({...w,rel:+(w.y-b(s)).toFixed(2)});
      o.terUp=rel(walkPath([LW(tr,1.65,4.2),LW(tr,1.65,.3),LW(tr,-1,-.5)]),tr);
      o.terSide=rel(walkPath([LW(tr,-4.6,-.6),LW(tr,0,-.6)]),tr);
      o.knoll=rel(walkPath([LW(kn,-5.4,.6),LW(kn,0,.4)]),kn);
      o.bluff=walkPath([LW(bl,0,4.2),LW(bl,0,0)]);o.shore=walkPath([LW(sh,0,3.6),LW(sh,0,0)]);
      o.nob=NOB.filter(n=>n.k==='port').map((n,i)=>+(n.r-PORT_SAFE[i][2]).toFixed(2));
      o.spawnOk=PORTS.map(p=>{let ok=0;for(let k=0;k<20;k++){const q=portSpawn(p.i);if(q&&!L.some(s=>Math.abs(q.x-s.x)<HB_T[s.t.replace('_w','')].fx+.3&&Math.abs(q.z-s.z)<HB_T[s.t.replace('_w','')].fz+.3))ok++}return ok});
      return JSON.stringify(o)}""")
    R=json.loads(r)
    R['ok']=R['n']==16 and not R['miss'] and R['terUp']['blocked'] is None and R['terUp']['rel']>.9 and R['terUp']['maxRise']<=.55 and R['terSide']['blocked'] is not None and abs(R['terSide']['rel'])<.3 \
      and R['knoll']['blocked'] is None and R['knoll']['rel']>1.2 and R['bluff']['blocked'] is not None and R['shore']['blocked'] is not None and all(abs(d)<.05 for d in R['nob']) and all(k>=18 for k in R['spawnOk'])
    res['harbor']=R
    # 3. 보급 창고: S5·S10·S13, 상자가 안에, 문 밖에서 걸어서 모든 상자에 닿음(0.25m 칸 채우기), 벽으로는 못 들어감, 들어가면 지붕 사라지고 앞벽 반투명
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
      for(const w of SPWH){const b=w.b,r0=b.rotation.y,c=Math.cos(r0),sn=Math.sin(r0),WL=(lx,lz)=>[b.position.x+lx*c+lz*sn,b.position.z-lx*sn+lz*c],q={i:w.s.i,cr:w.s.cr.length};
        q.inside=w.s.cr.every(o=>{const dx=o.x-b.position.x,dz=o.z-b.position.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<4.1&&lz>-3.1&&lz<3.1});
        const st=WL(0,6.0),G=.25,seen=new Set(),Q=[[Math.round(st[0]/G),Math.round(st[1]/G)]];seen.add(Q[0].join());let n=0;
        while(Q.length&&n<60000){const [i,j]=Q.pop();n++;for(const [a,bb] of [[1,0],[-1,0],[0,1],[0,-1]]){const I=i+a,J=j+bb,k=I+','+J;if(seen.has(k))continue;const x=I*G,z=J*G;if(Math.hypot(x-b.position.x,z-b.position.z)>13)continue;if(walk(x,z,.42,P)!==null)continue;seen.add(k);Q.push([I,J])}}
        q.reach=w.s.cr.map(o=>{let best=9;for(const k of seen){const [I,J]=k.split(',').map(Number),g=sGap(I*G,J*G,o);if(g<best)best=g}return +best.toFixed(2)});
        q.wall=walkPath([WL(-6,-1.5),WL(-2,-1.5)]).blocked!==null&&walkPath([WL(0,-7),WL(0,-3)]).blocked!==null;
        const [ix,iz]=WL(0,0);P.x=ix;P.z=iz;await sl(2500);q.inOp=[+w.op.toFixed(2),w.roof.visible,+w.front.userData.mt.opacity.toFixed(2)];
        const [ox,oz]=WL(0,8);P.x=ox;P.z=oz;await sl(2500);q.outOp=[+w.op.toFixed(2),w.roof.visible];out.push(q)}
      return JSON.stringify(out)}""")
    TR=await ev("()=>TREACH");R=json.loads(r);res['warehouse']={'list':R,'ok':len(R)==3 and all(q['inside'] and max(q['reach'])<=TR and q['wall'] and q['inOp'][0]<.06 and q['inOp'][2]<.25 and q['outOp'][0]>.88 and q['outOp'][1] for q in R)}
    # 사진: 창고 밖·안
    await ev("""()=>{const _uc=updCamera;updCamera=function(){if(window.__cam){const t=window.__cam;cam.position.set(t[0],t[1],t[2]);cam.lookAt(t[3],t[4],t[5]);cam.updateProjectionMatrix();return}return _uc.apply(this,arguments)};
      const _ue=updEnv;updEnv=function(){const r=_ue.apply(this,arguments);if(window.__cam&&scene.fog){scene.fog.near=900;scene.fog.far=2000}return r};S.time=.42}""")
    async def shot(name,cam,px,pz,wait=1300):
        await ev(f"()=>{{P.x={px};P.z={pz};window.__cam={json.dumps(cam)}}}");await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=80)
    w=json.loads(await ev("()=>{const b=SPWH[0].b;return JSON.stringify([b.position.x,b.position.z,b.position.y])}"))
    await shot('p71_wh_out.jpg',[w[0],w[2]+13,w[1]+17,w[0],w[2]+1,w[1]],w[0]+0,w[1]+9)
    await shot('p71_wh_in.jpg',[w[0],w[2]+13,w[1]+17,w[0],w[2]+1,w[1]],w[0],w[1]+.5)
    f=json.loads(await ev("()=>{const s=structs.find(q=>q.t==='fbuy');return JSON.stringify([s.x,s.z,s.m.position.y])}"))
    await shot('p71_fvend.jpg',[f[0]+.6,f[2]+3.2,f[1]+7.5,f[0]-.6,f[2]+1,f[1]],f[0],f[1]+2.5)
    for i in [0,2,3,5]:
        c=json.loads(await ev(f"()=>{{const p=PORTS[{i}],L=HB.list.filter(s=>s.pi==={i});let x=p.x,z=p.z;for(const s of L){{x+=s.x;z+=s.z}}return JSON.stringify([x/(L.length+1),z/(L.length+1),p.x,p.z])}}"))
        await shot(f'p71_port{i}.jpg',[c[0],44,c[1]+30,c[0],0,c[1]],c[2],c[3])
    t=json.loads(await ev("()=>{const s=HB.list.find(q=>/hb_terrace/.test(q.t));const [x,z]=LW(s,0,-.6);return JSON.stringify([x,z,s.m.position.y])}"))
    await ev("()=>{window.__cam=null}")
    await ev(f"()=>{{P.x={t[0]};P.z={t[1]}}}");await pg.wait_for_timeout(2500);await pg.screenshot(path=os.path.join(OUT,'p71_terrace_top.jpg'),type='jpeg',quality=80)
    res['terraceStand']={'y':await ev("()=>+(P.a.root.position.y).toFixed(2)"),'base':t[2]}
    res['terraceStand']['ok']=res['terraceStand']['y']>t[2]+.8
    # 4. 배치 도구: 개발자 모드 → 구조물 배치 → 이름표(지역 · 종류 번호)·고르면 주황·복사 글
    await ev("()=>{DEV.on=true;devHud&&devHud()}");await pg.wait_for_timeout(400)
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const btn=[...document.querySelectorAll('button')].find(b=>b.textContent==='구조물 배치');if(!btn)return JSON.stringify({err:'no button'});
      const s=structs.find(q=>q.t==='fbuy'&&q.pi===0);P.x=s.x;P.z=s.z+3;await sl(300);btn.click();await sl(600);
      const tags=[...document.querySelectorAll('button')].map(b=>b.textContent).filter(t=>/이름표|배치 복사/.test(t));
      let copied=null;const orig=navigator.clipboard&&navigator.clipboard.writeText;try{navigator.clipboard.writeText=async t=>{copied=t}}catch(e){}
      const cb=[...document.querySelectorAll('button')].find(b=>b.textContent==='📋 배치 복사');if(cb)cb.click();await sl(300);
      return JSON.stringify({tags,copied:copied&&copied.slice(0,60),copyOk:!!copied&&copied.startsWith('LAYOUT1:{"version":1')})}""")
    R=json.loads(r);res['layoutUi']=R;R['ok']=('copyOk' in R) and R['copyOk'] and any('이름표' in t for t in R['tags'])
    await pg.wait_for_timeout(800);await pg.screenshot(path=os.path.join(OUT,'p71_layout.jpg'),type='jpeg',quality=80)
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values()))
