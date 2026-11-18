# 식물 구역 고르기(19차): 초승달 본섬 위에 가장 작은 섬(조약돌섬, 반지름 22.3m) 크기 원 12곳을 골라 출력해요.
# 조건: 원 안 97% 넘게 본섬 마른 땅, 설치 금지 원(항구·보급지·등대)과 5m 넘게, 스폰 광장에서 67m 넘게, 나무가 아주 빽빽한 곳 빼기,
#       서로 56m 넘게 떨어지게 '가장 먼 점 고르기'로 섬 전체에 고르게. 결과를 core.js PLANT_SITES에 옮겨 적었어요(종류 배정은 거기 주석).
# 사용: python3 tools/gt.py tools/plant_zones.py
async def steps(pg):
    print(await pg.evaluate("""()=>{const R=22.3,MAIN='초승달 본섬';const cand=[];
      const land=(x,z)=>{let n=0,ok=0;for(let r=2;r<=R;r+=4)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Z=z+Math.sin(a/16*6.283)*r;n++;const I=islAt(X,Z);if(hAt(X,Z)>.95&&I&&I.n===MAIN&&!onDock(X,Z))ok++}return ok/n};
      const nobOk=(x,z)=>NOB.every(o=>dist(x,z,o.x,o.z)>=R+o.r+5);
      const trees=(x,z)=>{let n=0;for(const o of objs.values())if(Math.abs(o.x-x)<R&&Math.abs(o.z-z)<R&&dist(x,z,o.x,o.z)<R&&o.t<=3)n++;return n};
      for(let z=20;z<980;z+=8)for(let x=20;x<980;x+=8){const I=islAt(x,z);if(!I||I.n!==MAIN||hAt(x,z)<1)continue;if(!nobOk(x,z))continue;if(dist(x,z,VIL.px,VIL.pz)<R+45)continue;const f=land(x,z);if(f<.97)continue;cand.push({x,z,f,t:trees(x,z)})}
      const tm=cand.map(c=>c.t).sort((a,b)=>a-b),med=tm[tm.length>>1];
      const pool=cand.filter(c=>c.t<=med*1.6);const pick=[];
      /* 첫 구역: 스폰에서 가장 가까운 후보, 그다음은 가장 먼 점 고르기(겹침 없이 섬 전체에 고르게) */
      let first=pool.reduce((a,b)=>dist(a.x,a.z,VIL.x,VIL.z)<dist(b.x,b.z,VIL.x,VIL.z)?a:b);pick.push(first);
      while(pick.length<12){let best=null,bd=-1;for(const c of pool){const d=Math.min(...pick.map(p=>dist(c.x,c.z,p.x,p.z)));if(d<2*R+12)continue;const s=d-c.t*.15;if(s>bd){bd=s;best=c}}if(!best)break;pick.push(best)}
      return JSON.stringify({n:cand.length,pool:pool.length,med,pick:pick.map(p=>({x:p.x,z:p.z,f:+p.f.toFixed(2),t:p.t,dv:Math.round(dist(p.x,p.z,VIL.x,VIL.z))}))})}"""))
