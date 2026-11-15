# 텐트 바닥 깔개 vs 땅: 무작위로 설치 가능한 자리 수백 곳에서, 렌더된 땅(2m 격자) 높이와 깔개 윗면을 비교
# buried = 땅이 깔개 위로 올라온 최대 깊이(박힘), gap = 깔개가 땅에서 뜬 최대 높이. 둘 다 0.06 이하가 목표
async def steps(pg):
    print(await pg.evaluate("""()=>{const gH=(x,z)=>{const st=2,x0=Math.floor(x/st)*st,z0=Math.floor(z/st)*st,fx=(x-x0)/st,fz=(z-z0)/st;return (hAt(x0,z0)*(1-fx)+hAt(x0+st,z0)*fx)*(1-fz)+(hAt(x0,z0+st)*(1-fx)+hAt(x0+st,z0+st)*fx)*fz};
      setBuild('ptent');give('kit_tent',5);let n=0,bur=[],gap=[],worst=null;for(let k=0;k<6000&&n<400;k++){const x=120+Math.random()*760,z=120+Math.random()*760;if(hAt(x,z)<1)continue;P.x=x;P.z=z;P.rot=Math.random()*6.28;const g=ghostPos();if(!g.ok)continue;n++;
        const top=footY(g.x,g.z,BUILDS.ptent.foot)-.04+.04;let b=-9,gp=-9;for(let i=-1.35;i<=1.35;i+=.27)for(let j=-1.4;j<=1.4;j+=.28){const h=gH(g.x+i,g.z+j);b=Math.max(b,h-top);gp=Math.max(gp,top-h)}bur.push(b);gap.push(gp);if(!worst||b>worst[0])worst=[+b.toFixed(3),g.x|0,g.z|0]}
      setBuild(null);bur.sort((a,b)=>a-b);gap.sort((a,b)=>a-b);const q=(a,p)=>+a[Math.min(a.length-1,Math.floor(a.length*p))].toFixed(3);
      return JSON.stringify({placements:n,buried:{p50:q(bur,.5),p95:q(bur,.95),max:q(bur,1)},gap:{p50:q(gap,.5),p95:q(gap,.95),max:q(gap,1)},worst})}"""))
