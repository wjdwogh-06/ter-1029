# 62차: 새 식물 5종(토마토·양파·옥수수·카카오·칠리) 구역 고르기 — 19차 12곳은 그대로 두고 5곳 더(같은 조건 + 길에서 4m 넘게, 다른 구역과 가장 멀게)
# 사용: python3 tools/gt.py tools/plant_zones62.py → core.js 62차 덩어리 PLANT_SITES에 옮겨 적었어요
async def steps(pg):
    print(await pg.evaluate("""()=>{const R=22.3,MAIN='초승달 본섬';const cand=[];const old=PLANT_SITES.slice(0,12);
      const land=(x,z)=>{let n=0,ok=0;for(let r=2;r<=R;r+=4)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Z=z+Math.sin(a/16*6.283)*r;n++;const I=islAt(X,Z);if(hAt(X,Z)>.95&&I&&I.n===MAIN&&!onDock(X,Z))ok++}return ok/n};
      const nobOk=(x,z)=>NOB.every(o=>dist(x,z,o.x,o.z)>=R+o.r+5);
      const road=(x,z)=>{let n=0;for(let r=0;r<=R;r+=3)for(let a=0;a<12;a++){const X=x+Math.cos(a/12*6.283)*r,Z=z+Math.sin(a/12*6.283)*r;if(typeof pathD==='function'&&pathD(X,Z)<4)n++}return n};
      const trees=(x,z)=>{let n=0;for(const o of objs.values())if(Math.abs(o.x-x)<R&&Math.abs(o.z-z)<R&&dist(x,z,o.x,o.z)<R&&o.t<=3)n++;return n};
      const strOk=(x,z)=>!structs.some(s=>dist(s.x,s.z,x,z)<R+3);
      for(let z=20;z<980;z+=6)for(let x=20;x<980;x+=6){const I=islAt(x,z);if(!I||I.n!==MAIN||hAt(x,z)<1)continue;if(!nobOk(x,z)||!strOk(x,z))continue;if(dist(x,z,VIL.px,VIL.pz)<R+45)continue;const f=land(x,z);if(f<.97)continue;const rd=road(x,z);if(rd>2)continue;cand.push({x,z,f,t:trees(x,z),rd})}
      const tm=cand.map(c=>c.t).sort((a,b)=>a-b),med=tm[tm.length>>1];const pool=cand.filter(c=>c.t<=med*1.8);const pick=[];
      while(pick.length<5){let best=null,bd=-1;for(const c of pool){const d=Math.min(...old.map(p=>dist(c.x,c.z,p.x,p.z)),...pick.map(p=>dist(c.x,c.z,p.x,p.z)));if(d<2*R+4)continue;const s=d-c.t*.15-c.rd*3;if(s>bd){bd=s;best=c}}if(!best)break;pick.push(Object.assign(best,{dmin:Math.round(bd)}))}
      return JSON.stringify({n:cand.length,pool:pool.length,med,pick:pick.map(p=>({x:p.x,z:p.z,f:+p.f.toFixed(2),t:p.t,rd:p.rd,dv:Math.round(dist(p.x,p.z,VIL.x,VIL.z)),dmin:p.dmin}))})}"""))
