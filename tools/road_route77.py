# 77차(규칙): 새 보급지 길 + 칠리 들판 새 자리 찾기 → tools/out/road_route77.json, road_route77_map.png
# ① 칠리 들판(62차 710,500)이 새 보급지 S15(720,509) 안이라, 19·62차와 같은 조건(본섬 마른 땅 97%·설치 금지 원·구조물·다른 들판·길에서 떨어짐)으로 가장 가까운 새 자리를 골라요.
# ② 새 보급지(SITES)마다 '이미 있는 길'까지 A*(road_route.py와 같은 비용: 물·강가·식물 들판·설치 금지 원·구조물 피하고 나무 적은 쪽) → 닿은 길 점 = 갈림길(J<번호>).
#    보급지 쪽 끝은 문 방향(가운데에서 12m 지점) → 문 안 5.5m까지 곧게. 결과는 js/supply77.js의 SX77_ROADS·SX77_GATE·SX77_NODES·SX77_CHILI로 옮겨 적어요.
import base64, json
SITES = [14, 15]
async def steps(pg):
    ev = pg.evaluate
    res = await ev("""(SITES)=>{
      const out={};
      /* ① 칠리 */
      {const R=22.3,MAIN='초승달 본섬',ch=PLANT_SITES.find(p=>p.p==='chili'),others=PLANT_SITES.filter(p=>p!==ch),old=[ch.x,ch.z];
       const land=(x,z)=>{let n=0,ok=0;for(let r=2;r<=R;r+=4)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Z=z+Math.sin(a/16*6.283)*r;n++;const I=islAt(X,Z);if(hAt(X,Z)>.95&&I&&I.n===MAIN&&!onDock(X,Z))ok++}return ok/n};
       const nobOk=(x,z)=>NOB.every(o=>dist(x,z,o.x,o.z)>=R+o.r+5);
       const road=(x,z)=>{let n=0;for(let r=0;r<=R;r+=3)for(let a=0;a<12;a++){const X=x+Math.cos(a/12*6.283)*r,Z=z+Math.sin(a/12*6.283)*r;if(pathD(X,Z)<4)n++}return n};
       const strOk=(x,z)=>!structs.some(s=>!s.own&&dist(s.x,s.z,x,z)<R+3);
       let best=null;for(let z=old[1]-110;z<=old[1]+110;z+=3)for(let x=old[0]-110;x<=old[0]+110;x+=3){const d=dist(x,z,old[0],old[1]);if(best&&d>=best.d)continue;const I=islAt(x,z);if(!I||I.n!==MAIN||hAt(x,z)<1)continue;
        if(others.some(p=>dist(x,z,p.x,p.z)<2*R+4))continue;if(!nobOk(x,z)||!strOk(x,z))continue;if(dist(x,z,VIL.px,VIL.pz)<R+45)continue;if(road(x,z)>2)continue;const f=land(x,z);if(f<.97)continue;best={x,z,d:+d.toFixed(1),f:+f.toFixed(2)}}
       out.chili=best;if(best){ch.x=best.x;ch.z=best.z}}
      /* ② 길 */
      const G=2,N=WS/G|0,INF=1e9,cost=new Float32Array(N*N),main=ISL[0],GATE={};
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i*G+1,z=j*G+1,h=hAt(x,z);let c=1;
        if(h<.75||islAt(x,z)!==main){cost[j*N+i]=INF;continue}if(h<.95)c*=3;
        const rd=riverD(x,z),rw=_rp?_rp.w:0;if(rd<rw+3)c=INF;else if(rd<rw+9)c*=2.2;
        for(const p of PLANT_SITES){const d=dist(x,z,p.x,p.z);if(d<p.r+4){c*=6;break}}
        for(const n of NOB){if(n.k==='port'||n.k==='sup')continue;if(dist(x,z,n.x,n.z)<n.r+2){c=INF;break}}
        for(const p of PORTS){if(dist(x,z,p.x,p.z)<(p.town?36:24))c*=3}
        for(const s of SUPS){const d=dist(x,z,s.x,s.z),R0=SUP_WIDE[s.i]?13:10.5;if(d<R0){c=INF*1.5;break}if(d<R0+3.5)c*=4}
        let tr=0;const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const o=objs.get((cz+b)*CN+cx+a);if(o&&o.t<3)tr++}c*=1+tr*.18;cost[j*N+i]=c}
      const hard=new Uint8Array(N*N);
      for(const s of structs){const d=sdef(s);if(d.pass)continue;const R=Math.max(d.bx,d.bz)+1.6;for(let z=s.z-R;z<=s.z+R;z+=1)for(let x=s.x-R;x<=s.x+R;x+=1){const i=x/G|0,j=z/G|0;if(i<0||j<0||i>=N||j>=N)continue;if(inStruct(s,i*G+1,j*G+1,1.4))hard[j*N+i]=1}}
      /* 갈림길이 될 수 있는 기존 길 점: 보급지·항구에서 16m 넘게, 다른 길 끝에서 6m 넘게 */
      const goal=new Int32Array(N*N).fill(-1),gp=[];
      for(const r of ROADS)for(let q=0;q<r.p.length;q++){const [x,z]=r.p[q];if(SUPS.some(s=>dist(x,z,s.x,s.z)<16)||PORTS.some(p=>dist(x,z,p.x,p.z)<26))continue;const k=(x/G|0)+(z/G|0)*N;if(goal[k]<0){goal[k]=gp.length;gp.push([x,z,r.k])}}
      const astar=(S)=>{const si=(S.x/G|0)+(S.z/G|0)*N,gS=new Float32Array(N*N).fill(INF),from=new Int32Array(N*N).fill(-1),cl=new Uint8Array(N*N);
        const free=k=>{const x=(k%N)*G+1,z=(k/N|0)*G+1;const nearEnd=dist(x,z,S.x,S.z)<11.5;if(cost[k]>=INF&&!(nearEnd&&hAt(x,z)>.75))return INF;if(hard[k]&&!nearEnd)return INF;let c=cost[k]>=INF?3:cost[k];if(nearEnd)c=Math.min(c,2);return c};
        const hp=[],push=(k,f)=>{hp.push([f,k]);let i=hp.length-1;while(i>0){const p=(i-1)>>1;if(hp[p][0]<=hp[i][0])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p}},
          pop=()=>{const t=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&hp[a][0]<hp[m][0])m=a;if(b<hp.length&&hp[b][0]<hp[m][0])m=b;if(m===i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m}}return t};
        gS[si]=0;push(si,0);let end=-1,it=0;
        while(hp.length&&it++<3e6){const [,k]=pop();if(cl[k])continue;cl[k]=1;if(goal[k]>=0&&dist((k%N)*G+1,(k/N|0)*G+1,S.x,S.z)>14){end=k;break}const i=k%N,j=k/N|0;
          for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N)continue;const nk=nj*N+ni;if(cl[nk])continue;const c=free(nk);if(c>=INF)continue;
            if(a&&b&&(free(j*N+ni)>=INF||free(nj*N+i)>=INF))continue;const g=gS[k]+c*(a&&b?1.414:1);if(g<gS[nk]){gS[nk]=g;from[nk]=k;push(nk,g)}}}
        if(end<0)return null;const path=[];for(let k=end;k>=0;k=from[k]){path.push([(k%N)*G+1,(k/N|0)*G+1]);if(k===si)break}
        const J=gp[goal[end]];path[0]=[J[0],J[1]];   /* 시작 = 갈림길(기존 길 점), 끝 = 보급지 */
        const segC=(p,q)=>{const L=dist(p[0],p[1],q[0],q[1]),n=Math.ceil(L/1);let s=0;for(let t=0;t<=n;t++){const x=lerp(p[0],q[0],t/n),z=lerp(p[1],q[1],t/n),k=(x/G|0)+(z/G|0)*N,c=free(k);if(c>=INF)return INF;s+=c}return s/(n+1)*L};
        const pathC=(a,b)=>{let s=0;for(let t=a;t<b;t++)s+=segC(path[t],path[t+1]);return s};
        const o=[path[0]];let a=0;while(a<path.length-1){let b=path.length-1;for(;b>a+1;b--){const sc=segC(path[a],path[b]);if(sc<INF&&sc<=pathC(a,b)*1.08+2)break}o.push(path[b]);a=b}
        return {pts:o,J}};
      const chaikin=(P,n)=>{for(let r=0;r<n;r++){const Q=[P[0]];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75])}Q.push(P[P.length-1]);P=Q}return P};
      const resample=(P,st)=>{const out=[P[0]];let carry=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=dist(a[0],a[1],b[0],b[1]);let t=st-carry;while(t<=L){out.push([lerp(a[0],b[0],t/L),lerp(a[1],b[1],t/L)]);t+=st}carry=L-(t-st)}const e=P[P.length-1];if(dist(out[out.length-1][0],out[out.length-1][1],e[0],e[1])>.6)out.push(e);return out};
      out.roads=[];out.gates={};out.nodes={};out.fails=[];
      for(const i of SITES){const S=SUPS.find(q=>q.i===i);if(!S){out.fails.push(i);continue}const r=astar(S);if(!r){out.fails.push(i);continue}
        let P=r.pts;let q=P.length-1;while(q>0&&dist(P[q][0],P[q][1],S.x,S.z)<12)q--;const th=Math.atan2(P[q][0]-S.x,P[q][1]-S.z);P=P.slice(0,q+1);for(const rr of[10.5,9,7.5,6,5.5])P.push([S.x+Math.sin(th)*rr,S.z+Math.cos(th)*rr]);
        P=resample(chaikin(P,3),2);const L=P.length;let acc=0;
        P=P.map((p,k)=>{if(k===0||k===L-1)return p;const a=P[k-1],b=P[k+1],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1;acc+=2;const w=Math.min(1,Math.max(0,k-4)/8,Math.max(0,L-5-k)/8),o=Math.sin(acc/23+i*1.7)*1.1*w;const qq=[p[0]-tz/tl*o,p[1]+tx/tl*o];const kk=(qq[0]/G|0)+(qq[1]/G|0)*N;return cost[kk]<INF&&!hard[kk]?qq:p});
        out.gates[i]=+th.toFixed(3);out.nodes['J'+i]=[+r.J[0].toFixed(1),+r.J[1].toFixed(1)];out.roads.push({k:'J'+i+'-S'+i,on:r.J[2],pts:P.map(p=>[+p[0].toFixed(1),+p[1].toFixed(1)]),len:Math.round(P.length*2)})}
      const c=document.createElement('canvas');c.width=c.height=1000;const x=c.getContext('2d');x.drawImage(MAPC,0,0);x.lineCap='round';
      for(const rr of out.roads){x.strokeStyle='#d02010';x.lineWidth=4;x.beginPath();rr.pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}
      SUPS.forEach(s=>{x.fillStyle='#f80';x.beginPath();x.arc(s.x,s.z,5,0,7);x.fill();x.fillStyle='#630';x.font='bold 13px sans-serif';x.fillText('S'+s.i,s.x+7,s.z+4)});
      PLANT_SITES.forEach(p=>{x.strokeStyle=p.p==='chili'?'#e00':'#0a0';x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.z,p.r,0,7);x.stroke()});
      out.img=c.toDataURL('image/png');return out}""", SITES)
    open(os.path.join(OUT, 'road_route77_map.png'), 'wb').write(base64.b64decode(res.pop('img').split(',')[1]))
    json.dump(res, open(os.path.join(OUT, 'road_route77.json'), 'w'), separators=(',', ':'))
    print('chili', res['chili'], 'fails', res['fails'], 'gates', res['gates'], 'nodes', res['nodes'])
    print('lens', [(r['k'], r['on'], r['len']) for r in res['roads']])
