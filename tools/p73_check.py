# 73차(디자인) 검사: 특수 보급섬 둘(조약돌섬·안개섬) · 깊은 바다(해안 10m) · 동북 대각선 섬 겨울 · 돌다리
# python3 tools/gt.py tools/p73_check.py   → 마지막 줄 ALL True
# 사진: tools/out/p73_si3.jpg, p73_si5.jpg, p73_bridge.jpg, p73_bridge2.jpg, p73_deep.jpg, p73_map.png
import json,os
async def steps(pg):
    ev=pg.evaluate;res={}
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await ev("""()=>{window.walkPath=(pts)=>{P.x=pts[0][0];P.z=pts[0][1];let blocked=null,maxRise=0,prevY=stepY(P.x,P.z),minY=9;for(let k=1;k<pts.length;k++){const [tx,tz]=pts[k];let n=Math.ceil(Math.hypot(tx-P.x,tz-P.z)/.1);const dx=(tx-P.x)/n,dz=(tz-P.z)/n,L=Math.hypot(dx,dz)||1;
        for(let i=0;i<n;i++){const nx=P.x+dx,nz=P.z+dz;if(!canStep(P,nx,nz,dx/L,dz/L)||walk(nx,nz,.42,P)!==null){blocked=[+P.x.toFixed(2),+P.z.toFixed(2)];return{blocked,maxRise:+maxRise.toFixed(2),minY:+minY.toFixed(2)}}P.x=nx;P.z=nz;const y=stepY(P.x,P.z);maxRise=Math.max(maxRise,y-prevY);minY=Math.min(minY,y);prevY=y}}
        return{blocked,maxRise:+maxRise.toFixed(2),minY:+minY.toFixed(2)}}}""")
    # 1. 깊은 바다(74차): 섬 해안 28m 안 물은 모두 얕음(등대에서 60m 넘는 곳), 등대 바위섬은 둘레 10m 뒤부터 깊음(24m 고리 대부분 깊음),
    #    해안 9m 안은 어디든 얕음, 40m 넘는 넓은 바다는 거의 깊음, 좁은 물길(띠섬↔해달섬)은 얕음, 셰이더에 붙음, 맵 밖 깊음
    r=await ev("""()=>{const LH=LH_SITES.filter((L,i)=>!LH_GONE.includes(i)&&!LH_ISLE.includes(i));let sh=0,shBad=0,mid=0,midBad=0,far=0,farDeep=0;
      for(let x=2;x<WS;x+=3)for(let z=2;z<WS;z+=3){if(hAt(x,z)>=-.05)continue;const d=seaShore(x,z),dp=seaDeep(x,z);if(d<=9){sh++;if(dp)shBad++}
        if(d<=28&&LH.every(L=>Math.hypot(x-L[0],z-L[1])>60)){mid++;if(dp)midBad++}if(d>=40){far++;if(dp)farDeep++}}
      const ring=LH.map(L=>{let n=0,k=0;for(let a=0;a<48;a++){const x=L[0]+Math.cos(a/48*6.283)*24,z=L[1]+Math.sin(a/48*6.283)*24;if(hAt(x,z)>-.05)continue;n++;if(seaDeep(x,z))k++}return +(k/Math.max(1,n)*100).toFixed(0)});
      return JSON.stringify({nd:SEA73.nd,n0:SEA73.n0,sh,shBad,mid,midBad,far,farPct:+(farDeep/far*100).toFixed(1),ring,chan:seaDeep(844.7,68.6),edge:seaDeep(-5,500),
        open:seaDeep(500,985),shader:water.material.fragmentShader.includes('tDp')&&!!water.material.uniforms.tDp})}""")
    R=json.loads(r);R['ok']=R['nd']>0 and R['shBad']==0 and R['midBad']==0 and R['farPct']>97 and min(R['ring'])>=70 and not R['chan'] and R['edge'] and R['shader'];res['deep']=R
    # 2. 겨울: 동북섬·띠섬·해달섬 물건 모두 '_w', 다른 섬 0
    r=await ev("""()=>{const L=wntIsls().map(i=>i.n);let on=0,onW=0,off=0;objs.forEach(o=>{const I=islAt(o.x,o.z);if(!I||OBJT[o.t].berry)return;if(L.includes(I.n)){on++;if(o.gk&&o.gk.endsWith('_w'))onW++}else if(o.gk&&o.gk.endsWith('_w'))off++});
      const per={};for(const n of L){per[n]=0}objs.forEach(o=>{const I=islAt(o.x,o.z);if(I&&per[I.n]!=null&&o.gk&&o.gk.endsWith('_w'))per[I.n]++});return JSON.stringify({L,on,onW,off,per,nv:WNT.nv})}""")
    R=json.loads(r);R['ok']=len(R['L'])==4 and R['on']==R['onW'] and R['off']==0 and all(v>0 for v in R['per'].values());res['winter']=R
    # 3. 특수 보급섬: 상자 6·초소 4·설치 금지 원이 섬을 다 덮음·빠진 것 0
    r=await ev("""()=>JSON.stringify(SI73.map(Q=>{const n=NOB.find(q=>q.k===Q.k);let out=0;for(let x=Q.cx-60;x<=Q.cx+60;x+=2)for(let z=Q.cz-60;z<=Q.cz+60;z+=2)if(hAt(x,z)>0&&islAt(x,z)===Q.I&&Math.hypot(x-n.x,z-n.z)>n.r)out++;
      const nb=nobAt(Q.cx,Q.cz,1);return{n:Q.isl,cr:structs.filter(s=>s.t==='spsupply'&&s.si===Q.k).length,g:Q.g.length,miss:Q.miss,r:n&&n.r,out,nob:nb&&nb.k}}))""")
    R=json.loads(r);res['islands']={'list':R,'ok':all(q['cr']==6 and q['g']==4 and not q['miss'] and q['out']==0 and q['nob']==q.get('nob') and q['nob'] is not None for q in R)}
    # 설치하면 막힘(이유 글)
    r=await ev("""()=>{const Q=SI73[0];DEV.on=false;S.inv.wood=99;S.inv.stone=99;P.x=Q.cx+1;P.z=Q.cz+5;setBuild('fence');const g=ghostPos();setBuild(null);return JSON.stringify(g&&{ok:g.ok,why:g.why})}""")
    R=json.loads(r);res['nobuild']={'g':R,'ok':R and not R['ok'] and '조약돌섬' in (R['why'] or '')}
    # 상자 모두 걸어서 닿음(섬 바닷가에서 0.5m 칸 채우기)
    r=await ev("""()=>JSON.stringify(SI73.map(Q=>{const G=.5,seen=new Set(),q=[];let sx=null;for(let a=0;a<64&&!sx;a++){const dx=Math.cos(a/64*6.283),dz=Math.sin(a/64*6.283);for(let r=Q.R;r>2;r-=.5){const x=Q.cx+dx*r,z=Q.cz+dz*r;if(hAt(x,z)>.95&&walk(x,z,.42,P)===null){sx=[x,z];break}}}
      const k0=Math.round(sx[0]/G)+','+Math.round(sx[1]/G);seen.add(k0);q.push(k0);while(q.length){const k=q.pop(),[I,J]=k.split(',').map(Number);for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const kk=(I+a)+','+(J+b);if(seen.has(kk))continue;const x=(I+a)*G,z=(J+b)*G;if(Math.hypot(x-Q.cx,z-Q.cz)>Q.R+2||hAt(x,z)<.3||walk(x,z,.42,P)!==null)continue;seen.add(kk);q.push(kk)}}
      const cr=structs.filter(s=>s.t==='spsupply'&&s.si===Q.k);return cr.map(s=>{let b=9;for(const k of seen){const [I,J]=k.split(',').map(Number);b=Math.min(b,sGap(I*G,J*G,s))}return +b.toFixed(2)})}))""")
    R=json.loads(r);TR=await ev("()=>TREACH");res['reach']={'gaps':R,'ok':all(max(L)<=TR for L in R)}
    # 4. 경계병: 가까이 가면 넷이 나타남, 섬에 오르면 다 같이 덤빔, 떠나면 그만, 쓰러지면 20분 뒤
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const Q=SI73[1];DEV.on=false;P.dead=false;P.x=Q.cx;P.z=Q.cz+80;await sl(800);for(let i=0;i<3;i++){si73Tick();await sl(100)}
      const n=Q.g.filter(g=>g.e&&!g.e.dead).length,kinds=Q.g.map(g=>g.e&&g.e.kind);
      // 섬 위로
      P.x=Q.cx;P.z=Q.cz;const e0=Q.g.find(g=>g.e).e;P.x=e0.x+3;P.z=e0.z+3;for(let i=0;i<4;i++){for(const g of Q.g)if(g.e)updEnemy(g.e,.05);await sl(30)}
      const agg=Q.g.filter(g=>g.e&&g.e.agg).length;
      // 섬을 떠남
      P.x=Q.cx;P.z=Q.cz+Q.R+12;for(let i=0;i<3;i++)for(const g of Q.g)if(g.e)updEnemy(g.e,.05);const agg2=Q.g.filter(g=>g.e&&g.e.agg).length;
      // 쓰러짐 → 다시
      const g0=Q.g[0];g0.e.dead=true;g0.e.deadT=.1;si73Tick();const gone=!g0.e&&g0.dt>0;P.x=Q.cx;P.z=Q.cz+80;si73Tick();const notYet=!g0.e;g0.dt=Date.now()-SI73_RE-1;si73Tick();const back=!!g0.e;
      // 멀어지면 사라짐
      P.x=Q.cx;P.z=Q.cz+200;si73Tick();const gone2=Q.g.every(g=>!g.e);
      return JSON.stringify({n,kinds,agg,agg2,gone,notYet,back,gone2,name:ENEMY.sentry.n})}""")
    R=json.loads(r);R['ok']=R['n']==4 and R['agg']==4 and R['agg2']==0 and R['gone'] and R['notYet'] and R['back'] and R['gone2'];res['guards']=R
    # 5. 돌다리: 동북섬 → 띠섬 → 해달섬 걸어서, 옆으로 못 떨어짐, 한 걸음 0.55 아래
    r=await ev("""()=>{DEV.on=false;const out=SB73.built.map(b=>{const a=[b.G0[0]-b.dx*1.5,b.G0[1]-b.dz*1.5],e=[b.G1[0]+b.dx*1.5,b.G1[1]+b.dz*1.5];const w=walkPath([a,e]),back=walkPath([e,a]);
        const m=[b.S0[0]+b.dx*b.len*.5,b.S0[1]+b.dz*b.len*.5];const side=walkPath([m,[m[0]+b.px*4,m[1]+b.pz*4]]);
        return{len:+b.len.toFixed(1),w,back,side:side.blocked!==null,fromI:islAt(...a)&&islAt(...a).n,toI:islAt(...e)&&islAt(...e).n}});return JSON.stringify(out)}""")
    R=json.loads(r);res['bridges']={'list':R,'ok':len(R)==2 and all(q['w']['blocked'] is None and q['back']['blocked'] is None and q['side'] and q['w']['maxRise']<.56 and q['w']['minY']>.5 for q in R) and R[0]['fromI']=='동북섬' and R[0]['toI']=='띠섬' and R[1]['toI']=='해달섬'}
    # 사진
    await ev("""()=>{const _uc=updCamera;updCamera=function(){if(window.__cam){const t=window.__cam;cam.position.set(t[0],t[1],t[2]);cam.lookAt(t[3],t[4],t[5]);cam.updateProjectionMatrix();return}return _uc.apply(this,arguments)};
      const _ue=updEnv;updEnv=function(){const r=_ue.apply(this,arguments);if(window.__cam&&scene.fog){scene.fog.near=900;scene.fog.far=2000}return r};S.time=.42;DEV.on=true}""")
    async def shot(name,c,px,pz,wait=1800):
        await ev(f"()=>{{P.x={px};P.z={pz};window.__cam={json.dumps(c)}}}");await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    async def gshot(name,px,pz,wait=2600):   # 게임 카메라 그대로(가장 멀리)
        await ev(f"()=>{{window.__cam=null;P.x={px};P.z={pz};zoomK=1.3}}");await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    await ev("()=>{for(const Q of SI73)for(const g of Q.g){g.dt=0}}")
    for Q in [0,1]:
        c=json.loads(await ev(f"()=>{{const Q=SI73[{Q}];P.x=Q.cx;P.z=Q.cz+90;si73Tick();return JSON.stringify([Q.cx,Q.cz,Q.R])}}"))
        await gshot(f'p73_si{[3,5][Q]}.jpg',c[0],c[1]+2)
    b=json.loads(await ev("()=>{const b=SB73.built[0];return JSON.stringify([b.S0[0]+b.dx*b.len*.5,b.S0[1]+b.dz*b.len*.5,b.len])}"))
    await shot('p73_bridge.jpg',[b[0]+4,26,b[1]+30,b[0],1,b[1]],b[0],b[1])
    b=json.loads(await ev("()=>{const b=SB73.built[1];return JSON.stringify([b.S0[0]+b.dx*b.len*.5,b.S0[1]+b.dz*b.len*.5])}"))
    await shot('p73_bridge2.jpg',[b[0],16,b[1]+18,b[0],1,b[1]],b[0],b[1])
    await gshot('p73_deep.jpg',652,436)
    b=json.loads(await ev("()=>{const b=SB73.built[0];return JSON.stringify([b.S0[0]+b.dx*b.len*.4,b.S0[1]+b.dz*b.len*.4])}"))
    await gshot('p73_bridge_game.jpg',b[0],b[1])
    await ev("()=>{window.__cam=null}")
    # 지도 그림
    await ev("""()=>{const c=document.createElement('canvas');c.width=c.height=500;c.getContext('2d').drawImage(MAPC,0,0,500,500);window.__map=c.toDataURL('image/png')}""")
    import base64
    d=await ev("()=>window.__map");open(os.path.join(OUT,'p73_map.png'),'wb').write(base64.b64decode(d.split(',')[1]))
    res['errs']={'list':errs[:5],'ok':not errs}
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values()))
