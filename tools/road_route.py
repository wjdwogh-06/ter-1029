# 54차(디자인): 본섬 길 경로 만들기 — 게임을 띄워 땅을 보고 A*로 항구·보급지를 잇는 길을 찾아요.
# 결과: tools/out/road_route.json (길마다 점 목록 + 보급지 문 방향) + tools/out/road_route_map.png(지도에 그린 길)
# js/roads.js 의 ROAD_PTS·ROAD_GATE 는 이 결과를 그대로 옮긴 것이에요. 길을 바꾸려면 EDGES를 고치고 다시 돌린 뒤 옮겨 적어요.
# 옮기는 법: json의 roads[] 하나 = ROAD_PTS 한 줄 ['a-b','x,z x,z …'](점은 공백으로), gates{보급지 번호: 각도} = ROAD_GATE. 갈림길 자리는 NODES와 roads.js ROAD_NODES를 같게.
import base64, json
# P=항구 번호, S=보급지 번호(core.js PORT_SITES·SUPPLY_SITES 순서), 그 밖의 이름 = NODES의 갈림길 자리.
# 보급지는 처음 닿는 길이 '문' 방향을 정하고(가운데에서 12m 지점), 그 뒤 길은 문 바깥(10.5m)에서 시작해요.
NODES = {'J0': [410, 553], 'H12': [409, 626], 'HC': [464, 715]}
EDGES = [
    ['P0', 'J0'], ['J0', 'H12'], ['H12', 'S12'], ['H12', 'HC'], ['HC', 'S8'], ['HC', 'S7'], ['HC', 'S6'],
    ['HC', 'P3'], ['P3', 'S13'], ['H12', 'P4'], ['J0', 'S10'], ['S10', 'P5'], ['P5', 'S11'],
]
async def steps(pg):
    ev = pg.evaluate
    res = await ev("""([EDGES,NODES])=>{
      const G=2,N=WS/G|0,INF=1e9,cost=new Float32Array(N*N);
      const main=ISL[0];
      const GATE={};
      const node=k=>{if(NODES[k])return {k,x:NODES[k][0],z:NODES[k][1]};const t=k[0],i=+k.slice(1);
        if(t==='P'){const p=PORTS[i],k2=p.town?22:12;return {k,x:p.x-p.dx*k2,z:p.z-p.dz*k2,port:p}}
        const s=SUPS.find(q=>q.i===i);if(GATE[k]!==undefined)return {k,x:s.x+Math.sin(GATE[k])*10.5,z:s.z+Math.cos(GATE[k])*10.5,gate:s};return {k,x:s.x,z:s.z,sup:s}};
      // 기본 비용
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i*G+1,z=j*G+1,h=hAt(x,z);let c=1;
        if(h<.75||islAt(x,z)!==main){cost[j*N+i]=INF;continue}
        if(h<.95)c*=3;
        const rd=riverD(x,z),rw=_rp?_rp.w:0;if(rd<rw+3)c=INF;else if(rd<rw+9)c*=2.2;
        for(const p of PLANT_SITES){const d=dist(x,z,p.x,p.z);if(d<p.r+4){c*=6;break}}
        for(const n of NOB){if(n.k==='port'||n.k==='sup')continue;if(dist(x,z,n.x,n.z)<n.r+2){c=INF;break}}
        for(const p of PORTS){if(dist(x,z,p.x,p.z)<(p.town?36:24))c*=3}
        for(const s of SUPS){const d=dist(x,z,s.x,s.z);if(d<10.5){c=INF*1.5;break}if(d<14)c*=4}
        // 나무가 많으면 조금 비싸게(빈 곳으로 지나가게)
        let tr=0;const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const o=objs.get((cz+b)*CN+cx+a);if(o&&o.t<3)tr++}
        c*=1+tr*.18;
        cost[j*N+i]=c}
      // 구조물(항구 건물·소품, 보급지 물건) 칸은 못 지나감 — 끝점 둘레는 뒤에서 풀어 줌
      const hard=new Uint8Array(N*N);
      for(const s of structs){const d=sdef(s);if(d.pass)continue;const R=Math.max(d.bx,d.bz)+1.6;for(let z=s.z-R;z<=s.z+R;z+=1)for(let x=s.x-R;x<=s.x+R;x+=1){const i=x/G|0,j=z/G|0;if(i<0||j<0||i>=N||j>=N)continue;if(inStruct(s,i*G+1,j*G+1,1.4))hard[j*N+i]=1}}
      const used=new Uint8Array(N*N);
      const astar=(A,B)=>{const si=(A.x/G|0)+(A.z/G|0)*N,ti=(B.x/G|0)+(B.z/G|0)*N,gS=new Float32Array(N*N).fill(INF),from=new Int32Array(N*N).fill(-1),cl=new Uint8Array(N*N);
        const free=k=>{const x=(k%N)*G+1,z=(k/N|0)*G+1;const nearEnd=dist(x,z,A.x,A.z)<(A.sup?11:6)||dist(x,z,B.x,B.z)<(B.sup?11:6);
          if(cost[k]>=INF&&!(nearEnd&&hAt(x,z)>.75&&riverD(x,z)>(_rp?_rp.w:0)+3))return INF;if(hard[k]&&!nearEnd)return INF;
          let c=cost[k]>=INF?3:cost[k];if(nearEnd)c=Math.min(c,2);if(used[k])c*=.3;return c};
        // 힙
        const hp=[],push=(k,f)=>{hp.push([f,k]);let i=hp.length-1;while(i>0){const p=(i-1)>>1;if(hp[p][0]<=hp[i][0])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p}},
          pop=()=>{const t=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&hp[a][0]<hp[m][0])m=a;if(b<hp.length&&hp[b][0]<hp[m][0])m=b;if(m===i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m}}return t};
        const hh=k=>dist((k%N),(k/N|0),(ti%N),(ti/N|0))*.3;
        gS[si]=0;push(si,hh(si));let it=0;
        while(hp.length&&it++<2e6){const [,k]=pop();if(cl[k])continue;cl[k]=1;if(k===ti)break;const i=k%N,j=k/N|0;
          for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N)continue;const nk=nj*N+ni;if(cl[nk])continue;const c=free(nk);if(c>=INF)continue;
            if(a&&b&&(free(j*N+ni)>=INF||free(nj*N+i)>=INF))continue;
            const g=gS[k]+c*(a&&b?1.414:1);if(g<gS[nk]){gS[nk]=g;from[nk]=k;push(nk,g+hh(nk))}}}
        if(from[ti]<0)return null;const path=[];for(let k=ti;k>=0;k=from[k]){path.push([(k%N)*G+1,(k/N|0)*G+1]);if(k===si)break}path.reverse();
        // 줄 당기기(지나갈 수 있고 비용이 너무 늘지 않으면 곧게)
        const segC=(p,q)=>{const L=dist(p[0],p[1],q[0],q[1]),n=Math.ceil(L/1);let s=0;for(let t=0;t<=n;t++){const x=lerp(p[0],q[0],t/n),z=lerp(p[1],q[1],t/n),k=(x/G|0)+(z/G|0)*N,c=free(k);if(c>=INF)return INF;s+=c}return s/(n+1)*L};
        const pathC=(a,b)=>{let s=0;for(let t=a;t<b;t++)s+=segC(path[t],path[t+1]);return s};
        const out=[path[0]];let a=0;while(a<path.length-1){let b=path.length-1;for(;b>a+1;b--){const sc=segC(path[a],path[b]);if(sc<INF&&sc<=pathC(a,b)*1.08+2)break}out.push(path[b]);a=b}
        return out};
      const chaikin=(P,n)=>{for(let r=0;r<n;r++){const Q=[P[0]];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75])}Q.push(P[P.length-1]);P=Q}return P};
      const resample=(P,st)=>{const out=[P[0]];let carry=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=dist(a[0],a[1],b[0],b[1]);let t=st-carry;while(t<=L){out.push([lerp(a[0],b[0],t/L),lerp(a[1],b[1],t/L)]);t+=st}carry=L-(t-st)}const e=P[P.length-1];if(dist(out[out.length-1][0],out[out.length-1][1],e[0],e[1])>.6)out.push(e);return out};
      const roads=[],fails=[];
      for(const [ka,kb] of EDGES){const A=node(ka),B=node(kb);const raw=astar(A,B);if(!raw){fails.push(ka+'-'+kb);continue}
        let P0r=raw;
        // 보급지 끝: 가운데에서 12m 지점의 방향 = 문. 그 안쪽은 문을 향해 곧게(12 → 5.5m)
        const fixEnd=(P,end)=>{const S=end.sup;if(!S)return P;let i=P.length-1;while(i>0&&dist(P[i][0],P[i][1],S.x,S.z)<12)i--;const q=P[i],th=Math.atan2(q[0]-S.x,q[1]-S.z);GATE[end.k]=th;
          const out=P.slice(0,i+1);for(const r of[10.5,9,7.5,6,5.5])out.push([S.x+Math.sin(th)*r,S.z+Math.cos(th)*r]);return out};
        P0r=fixEnd(P0r,B);if(A.sup){P0r=fixEnd(P0r.slice().reverse(),A).reverse()}
        let P=resample(chaikin(P0r,3),2);
        // 살짝 구불구불(자연스럽게): 옆으로 ±1.1m, 끝 20m는 그대로
        const L=P.length;let acc=0;const Q=P.map((p,i)=>{if(i===0||i===L-1)return p;const a=P[i-1],b=P[i+1],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1;acc+=2;const w=Math.min(1,Math.max(0,i-4)/8,Math.max(0,L-5-i)/8),o=Math.sin(acc/23+ka.length*1.7)*1.1*w;const q=[p[0]-tz/tl*o,p[1]+tx/tl*o];const k=(q[0]/G|0)+(q[1]/G|0)*N;return cost[k]<INF&&!hard[k]?q:p});
        P=Q;
        for(const p of P){const k=(p[0]/G|0)+(p[1]/G|0)*N;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)used[k+b*N+a]=1}
        roads.push({a:ka,b:kb,pts:P.map(p=>[+p[0].toFixed(1),+p[1].toFixed(1)]),len:Math.round(P.length*2)})}
      // 보급지 문 방향: 길이 보급지 가운데에서 8.5m 원을 지나는 곳
      const gates={};for(const k in GATE)gates[+k.slice(1)]=+GATE[k].toFixed(3);
      // 지도 그림
      const c=document.createElement('canvas');c.width=c.height=1000;const x=c.getContext('2d');x.drawImage(MAPC,0,0);x.lineCap='round';x.lineJoin='round';
      for(const r of roads){x.strokeStyle='#7a4b22';x.lineWidth=5;x.beginPath();r.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.strokeStyle='#e9c98f';x.lineWidth=2.5;x.stroke()}
      x.font='bold 13px sans-serif';PORTS.forEach(p=>{x.fillStyle='#c00';x.fillRect(p.x-5,p.z-5,10,10);x.fillText('P'+p.i,p.x+7,p.z-6)});SUPS.forEach(s=>{x.fillStyle='#f80';x.beginPath();x.arc(s.x,s.z,5,0,7);x.fill();x.fillStyle='#630';x.fillText('S'+s.i,s.x+7,s.z+4)});
      PLANT_SITES.forEach(p=>{x.strokeStyle='#0a0';x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.z,p.r,0,7);x.stroke()});
      return {roads,gates,fails,img:c.toDataURL('image/png')}}""", [EDGES, NODES])
    open(os.path.join(OUT, 'road_route_map.png'), 'wb').write(base64.b64decode(res.pop('img').split(',')[1]))
    json.dump(res, open(os.path.join(OUT, 'road_route.json'), 'w'), separators=(',', ':'))
    print('fails', res['fails'], 'gates', res['gates'])
    print('lens', [(r['a'], r['b'], r['len']) for r in res['roads']], 'total', sum(r['len'] for r in res['roads']))
