# 끼임 검사: 항구·센터·보급지·등대 둘레를 0.5m 칸으로 나눠, 바깥과 이어지지 않은 '갇힌 빈 칸'(철조망·건물 사이)이 있는지 찾아요. 부활 자리도 바깥과 이어져야 해요
async def steps(pg):
    r=await pg.evaluate("""()=>{const out=[];const E={x:0,z:0,pl:1};const ok=(x,z)=>walk(x,z,.42,E)===null;
      for(const n of NOB){const R=n.r+6,st=.5,N=Math.ceil(2*R/st)+1,x0=n.x-R,z0=n.z-R,G=new Uint8Array(N*N);   /* 0 막힘, 1 빈칸, 2 바깥과 이어짐 */
       for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(ok(x0+i*st,z0+j*st))G[j*N+i]=1;
       const q=[];for(let i=0;i<N;i++)for(const j of[0,N-1]){for(const [a,b] of [[i,j],[j,i]]){const k=b*N+a;if(G[k]===1){G[k]=2;q.push(k)}}}
       while(q.length){const k=q.pop(),i=k%N,j=(k/N)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const kk=b*N+a;if(G[kk]===1){G[kk]=2;q.push(kk)}}}
       const seen=new Uint8Array(N*N);for(let k=0;k<N*N;k++){if(G[k]!==1||seen[k])continue;let cnt=0,sx=0,sz=0;const s=[k];seen[k]=1;while(s.length){const c=s.pop(),i=c%N,j=(c/N)|0;cnt++;sx+=x0+i*st;sz+=z0+j*st;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const kk=b*N+a;if(G[kk]===1&&!seen[kk]){seen[kk]=1;s.push(kk)}}}
        if(cnt>=2)out.push({zone:n.k+(n.n?':'+n.n:''),cells:cnt,at:[Math.round(sx/cnt),Math.round(sz/cnt)]})}}
      /* 부활 자리 40번: 바깥으로 30m 걸어 나갈 수 있는지(간단히: 주변 8방향 중 하나로 20m 직선 이동이 막히지 않는 길이 있는지 대신, 칸 검사에서 갇힌 칸 안이 아닌지) */
      let spawnBad=0;for(let t=0;t<40;t++){const s=portSpawn();for(const p of out)if(dist(p.at[0],p.at[1],s.x,s.z)<3)spawnBad++}
      return JSON.stringify({pockets:out.slice(0,30),count:out.length,spawnBad})}""")
    print('stuck',r)
