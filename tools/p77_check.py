# 77차(규칙) 검사: 보급 창고 = 울타리 크기 · 새 보급지 5곳(특수 보급지 2곳) · 새 길 · 칠리 들판 옮김
# python3 tools/gt.py tools/p77_check.py   → 마지막 줄 ALL True   (사진은 tools/p77_shots.py)
import json
async def steps(pg):
    ev = pg.evaluate; res = {}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);if(typeof HZ!=='undefined')HZ.on=false;DEV.on=0}")
    await ev("""()=>{window.walkPath=(pts)=>{P.x=pts[0][0];P.z=pts[0][1];for(let k=1;k<pts.length;k++){const [tx,tz]=pts[k];const n=Math.ceil(Math.hypot(tx-P.x,tz-P.z)/.1),dx=(tx-P.x)/n,dz=(tz-P.z)/n,L=Math.hypot(dx,dz)||1;
        for(let i=0;i<n;i++){const nx=P.x+dx,nz=P.z+dz;if(!canStep(P,nx,nz,dx/L,dz/L)||walk(nx,nz,.42,P)!==null)return[+P.x.toFixed(2),+P.z.toFixed(2)];P.x=nx;P.z=nz}}return null};
      /* 칸 채우기(0.25m): 시작점에서 걸어서 닿는 칸, 반지름 R 안 */
      window.flood=(sx,sz,cx,cz,R)=>{const G=.25,seen=new Set(),Q=[[Math.round(sx/G),Math.round(sz/G)]];seen.add(Q[0].join());let n=0;
        while(Q.length&&n<120000){const [i,j]=Q.pop();n++;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const I=i+a,J=j+b,k=I+','+J;if(seen.has(k))continue;const x=I*G,z=J*G;if(Math.hypot(x-cx,z-cz)>R)continue;if(hAt(x,z)<.95||walk(x,z,.42,P)!==null)continue;
          const y0=stepY(i*G,j*G),y1=stepY(x,z);if(y1-y0>.55)continue;seen.add(k);Q.push([I,J])}}return seen};
      window.gapTo=(seen,o)=>{let best=9;for(const k of seen){const [I,J]=k.split(',').map(Number);if(Math.abs(I*.25-o.x)>3||Math.abs(J*.25-o.z)>3)continue;const g=sGap(I*.25,J*.25,o);if(g<best)best=g}return +best.toFixed(2)}}""")
    TR = await ev("()=>TREACH")
    # 1. 새 보급지 5곳: 자리·섬·테마·상자
    r = json.loads(await ev("""()=>JSON.stringify([14,15,16,17,18].map(i=>{const s=SUPS.find(q=>q.i===i);if(!s)return{i,miss:1};const I=islAt(s.x,s.z);
      return{i,x:+s.x.toFixed(1),z:+s.z.toFixed(1),isl:I&&I.n,theme:s.theme,cr:s.cr.length,types:[...new Set(s.cr.map(c=>c.t))],li:s.cr.map(c=>c.li)}}))"""))
    want = {14: [619, 668, '초승달 본섬'], 15: [720, 509, '초승달 본섬'], 16: [96, 885, '바람섬 남쪽'], 17: [922.5, 177.5, '동북섬 동쪽'], 18: [898.5, 222, '동북섬 동쪽']}
    ok = all(not q.get('miss') and abs(q['x'] - want[q['i']][0]) < .1 and abs(q['z'] - want[q['i']][1]) < .1 and q['isl'] == want[q['i']][2] for q in r)
    ok = ok and all(q['cr'] == 6 and q['types'] == ['spsupply'] and q['li'] == ['sx%d_%d' % (q['i'], k) for k in range(6)] and q['theme'] == '특수 보급지' for q in r if q['i'] >= 17)
    ok = ok and all(q['cr'] == 2 + q['i'] % 3 and q['li'][-1] == 's%d_%d' % (q['i'], q['cr'] - 1) for q in r if q['i'] < 17)
    res['sites'] = {'list': r, 'ok': ok}
    # 2. 특수 보급지: 울타리·문·차단기, 설치 금지 이름, 지도 점, 문 밖에서 걸어서 모든 상자에 닿음, 울타리 안 갇힌 칸 0, 상자 창 = 특수 보급
    r = json.loads(await ev("""()=>{const out=[];for(const i of [17,18]){const s=SUPS.find(q=>q.i===i),F=SPF.find(f=>f.i===i),Q=SUP_SPECIAL[i];
        const seen=flood(s.x,s.z+Q.hz+3,s.x,s.z,Math.hypot(Q.hx,Q.hz)+6),reach=s.cr.map(o=>gapTo(seen,o));
        let trap=0;for(let J=Math.ceil((s.z-Q.hz+1.2)/.25);J<=(s.z+Q.hz-1.2)/.25;J+=2)for(let I=Math.ceil((s.x-Q.hx+1.2)/.25);I<=(s.x+Q.hx-1.2)/.25;I+=2){const x=I*.25,z=J*.25;if(hAt(x,z)<.95||walk(x,z,.42,P)!==null)continue;if(!seen.has(I+','+J))trap++}
        const n=NOB.find(o=>Math.abs(o.x-s.x)<.5&&Math.abs(o.z-s.z)<.5);
        P.x=s.x;P.z=s.z+1;DEV.on=1;bmode='ptent';const g=ghostPos();bmode=null;DEV.on=0;
        out.push({i,fence:F.cols,boom:structs.some(o=>o.t==='sp_boom'&&Math.hypot(o.x-s.x,o.z-(s.z+Q.hz+1.65))<3),nob:n&&n.k,nobR:n&&+n.r.toFixed(1),why:g&&g.why,map:PLACES.some(p=>p.k==='sx'+i),
          reach,trap,outside:s.cr.filter(o=>Math.abs(o.x-s.x)>Q.hx-1||Math.abs(o.z-s.z)>Q.hz-1).length,wet:s.cr.filter(o=>hAt(o.x,o.z)<.95).length})}return JSON.stringify(out)}"""))
    res['special'] = {'list': r, 'ok': all(q['fence'] > 30 and q['boom'] and q['nob'] == 'sx77' and q['nobR'] > 20 and q['why'] == '특수 보급지 주변은 설치 금지 구역이에요' and q['map']
                                          and max(q['reach']) <= TR and q['trap'] == 0 and q['outside'] == 0 and q['wet'] == 0 for q in r)}
    r = json.loads(await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const c=SUPS.find(q=>q.i===17).cr[0];if(S.box)delete S.box[c.li];delete S.looted[c.li];P.x=c.x;P.z=c.z+1.3;await sl(300);boxOpen(c);await sl(200);
      const items=(S.box[c.li]||{c:[]}).c.filter(Boolean).map(q=>q[0]);const pan=panel;closePanel();return JSON.stringify({pan,items,cd:sdef(c).cd})}"""))
    res['open'] = {'r': r, 'ok': r['pan'] == 'box' and len(r['items']) >= 5 and r['cd'] == 5}
    # 3. 보급 창고: 철조망 없음 · 창고 = 울타리 크기 · 상자 모두 안 · 문으로만(벽 막힘) · 문 밖에서 모든 상자 닿음 · 들어가면 지붕 사라지고 카메라 쪽 벽 반투명 · 길 끝은 문 밖
    r = json.loads(await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
      for(const w of SPWH){const b=w.b,i=w.s.i,r0=b.rotation.y,c=Math.cos(r0),sn=Math.sin(r0),WL=(lx,lz)=>[b.position.x+lx*c+lz*sn,b.position.z-lx*sn+lz*c],D=sx77WhDims(i),F=SPF.find(f=>f.i===i);
        const q={i,hx:+w.hx.toFixed(2),hz:+w.hz.toFixed(2),dims:Math.abs(w.hx-D.hx)<1e-6&&Math.abs(w.hz-D.hz)<1e-6,fence:F.cols,swire:structs.filter(o=>o.t==='swire'&&Math.hypot(o.x-b.position.x,o.z-b.position.z)<14).length,cr:w.s.cr.length};
        q.inside=w.s.cr.every(o=>{const dx=o.x-b.position.x,dz=o.z-b.position.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<w.hx-1&&Math.abs(lz)<w.hz-1});
        const [sx,sz]=WL(0,w.hz+2.2),seen=flood(sx,sz,b.position.x,b.position.z,w.hx+w.hz+4);q.reach=w.s.cr.map(o=>gapTo(seen,o));
        q.wall=[[[-w.hx-2,0],[-w.hx+2,0]],[[w.hx+2,0],[w.hx-2,0]],[[0,-w.hz-2],[0,-w.hz+1.6]],[[w.hx*.6,w.hz+2],[w.hx*.6,w.hz-2]]].every(([a,bb])=>walkPath([WL(...a),WL(...bb)])!==null);
        q.door=walkPath([WL(0,w.hz+2.2),WL(0,0)])===null;
        const roadIn=ROADS.some(rd=>rd.p.some(([x,z])=>{const dx=x-b.position.x,dz=z-b.position.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<w.hx&&Math.abs(lz)<w.hz}));q.roadIn=roadIn;
        const fz={front:c,back:-c,left:sn,right:-sn},camW=Object.keys(fz).sort((a,bb)=>fz[bb]-fz[a])[0];
        const [ix,iz]=WL(0,0);P.x=ix;P.z=iz;await sl(2200);q.inOp=[+w.op.toFixed(2),w.parts.roof.visible,camW,+w.parts[camW].userData.mt.opacity.toFixed(2),+w.parts.back.userData.mt.opacity.toFixed(2)>.9||fz.back>.12];
        const [ox,oz]=WL(0,w.hz+6);P.x=ox;P.z=oz;await sl(2200);q.outOp=[+w.op.toFixed(2),w.parts.roof.visible,+w.parts[camW].userData.mt.opacity.toFixed(2)];out.push(q)}
      return JSON.stringify(out)}"""))
    res['warehouse'] = {'list': r, 'ok': len(r) == 3 and all(q['dims'] and q['fence'] == 0 and q['swire'] == 0 and q['inside'] and max(q['reach']) <= TR and q['wall'] and q['door'] and not q['roadIn']
                                                              and q['inOp'][0] < .06 and not q['inOp'][1] and q['inOp'][3] < .25 and q['outOp'][0] > .9 and q['outOp'][1] and q['outOp'][2] > .9 for q in r)}
    # 4. 길: 14·15가 본섬 길에 이어짐(갈림길 = 기존 길 위), 문이 길 쪽, 문 앞까지 걸어서 이어짐
    r = json.loads(await ev("""()=>{const out=[];for(const i of [14,15]){const s=SUPS.find(q=>q.i===i),rd=ROADS.find(o=>o.b==='S'+i),F=SPF.find(f=>f.i===i);if(!rd){out.push({i,miss:1});continue}
        const J=rd.p[0],onOld=ROADS.some(o=>o!==rd&&o.p.some(p=>Math.hypot(p[0]-J[0],p[1]-J[1])<2.1)),end=rd.p[rd.p.length-1],th=ROAD_GATE[i];
        const gate=[s.x+Math.sin(th)*F.hz,s.z+Math.cos(th)*F.hz];
        let gaps=0;for(let k=1;k<rd.p.length;k++)if(Math.hypot(rd.p[k][0]-rd.p[k-1][0],rd.p[k][1]-rd.p[k-1][1])>2.6)gaps++;
        let wet=0;for(const [x,z] of rd.p)if(hAt(x,z)<.95)wet++;
        const blocked=walkPath(rd.p.slice(0,-3));
        out.push({i,len:rd.p.length*2,onOld,gateTh:+F.th.toFixed(3),th,endGate:+Math.hypot(end[0]-s.x,end[1]-s.z).toFixed(1),gaps,wet,blocked,node:!!ROAD_NODES['J'+i],pathAtGate:+pathD(gate[0],gate[1]).toFixed(1)})}return JSON.stringify(out)}"""))
    res['roads'] = {'list': r, 'ok': all(not q.get('miss') and q['onOld'] and abs(q['gateTh'] - q['th']) < 1e-3 and q['endGate'] < 6 and q['gaps'] == 0 and q['wet'] == 0 and q['blocked'] is None and q['node'] and q['pathAtGate'] < 1.5 for q in r)}
    # 5. 칠리 들판: 15번 보급지에서 떨어짐 · 본섬 땅 · 다른 들판·설치 금지 원과 안 겹침 · 11포기 · 보급지 원 안 식물 0
    r = json.loads(await ev("""()=>{const c=PLANT_SITES.find(p=>p.p==='chili'),s=SUPS.find(q=>q.i===15),others=PLANT_SITES.filter(p=>p!==c);
      const nob=NOB.filter(o=>dist(c.x,c.z,o.x,o.z)<c.r+o.r+5).map(o=>o.k);const n=PL.list.filter(p=>p.id==='chili').length;
      const inSup=PL.list.filter(p=>NOB.some(o=>(o.k==='sup'||o.k==='sx77')&&dist(p.x,p.z,o.x,o.z)<o.r)).length;
      return JSON.stringify({x:c.x,z:c.z,dS15:+dist(c.x,c.z,s.x,s.z).toFixed(1),near:others.filter(p=>dist(c.x,c.z,p.x,p.z)<c.r*2+4).map(p=>p.p),nob,n,inSup,isl:(islAt(c.x,c.z)||{}).n})}"""))
    res['chili'] = {'r': r, 'ok': r['dS15'] > 38 and not r['near'] and not r['nob'] and r['n'] == 11 and r['inSup'] == 0 and r['isl'] == '초승달 본섬'}
    # 6. 겹침: 새 보급지 설치 금지 원이 항구·등대·다른 보급지·식물 들판과 안 겹침, 울타리 기둥 물 위 0
    r = json.loads(await ev("""()=>{const out=[];for(const i of [14,15,16,17,18]){const s=SUPS.find(q=>q.i===i),n=NOB.find(o=>Math.abs(o.x-s.x)<.5&&Math.abs(o.z-s.z)<.5),F=SPF.find(f=>f.i===i);
        out.push({i,r:+n.r.toFixed(1),hit:NOB.filter(o=>o!==n&&dist(o.x,o.z,n.x,n.z)<o.r+n.r).map(o=>o.k),plant:PLANT_SITES.filter(p=>dist(p.x,p.z,n.x,n.z)<p.r+n.r).map(p=>p.p),wetPost:F.posts.filter(([x,z])=>hAt(x,z)<.95).length})}return JSON.stringify(out)}"""))
    res['overlap'] = {'list': r, 'ok': all(not q['hit'] and not q['plant'] and q['wetPost'] == 0 for q in r)}
    for k, v in res.items():
        print(k, v['ok'], json.dumps({kk: vv for kk, vv in v.items() if kk != 'ok'}, ensure_ascii=False)[:1500])
    print('ALL', all(v['ok'] for v in res.values()))
