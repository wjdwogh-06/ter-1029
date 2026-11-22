# 57차(디자인): 길 안 진한 두 줄(바퀴 자국) 없애기 · 거북섬 그릴 때 쓴 크리에이티브 블록 한 번 지우기
# 기대: road 색 = 흙색 하나(가운데 줄도 거의 같은 색, 진한 줄 없음) / tidy: 섬 둘레 블록만 지워지고 다른 곳 블록은 그대로,
#       저장 글에서도 빠짐, 표시 남음, ↩로 되돌리면 다시 생김, 표시가 있으면 두 번째부터는 안 지움 / errs []
# 사진: tools/out/p57_road.jpg(56차 p56_road.jpg와 같은 자리), p57_road_far.jpg
import json
async def steps(pg):
    ev=pg.evaluate
    O=lambda n:'tools/out/'+n
    # 1) 길 색: 한 단면 13점 중 안쪽(투명도 1) 점들의 밝기 차이
    print('road',await ev("""()=>{const g=roadMeshObj.geometry,c=g.attributes.color.array,W=13,n=c.length/4/W;let maxDiff=0,dark=0,cnt=0;
      for(let i=0;i<n;i++){const L=[];for(let k=3;k<=9;k++){const j=(i*W+k)*4;L.push(c[j]*.3+c[j+1]*.59+c[j+2]*.11)}const mn=Math.min(...L),mx=Math.max(...L);maxDiff=Math.max(maxDiff,(mx-mn)/mx);cnt++}
      return JSON.stringify({sections:cnt,maxInnerDiff:+maxDiff.toFixed(3),hasTr:'tr' in ROADC,keys:Object.keys(ROADC)})}"""))
    # 2) 블록 정리
    print('tidy',await ev("""()=>{const I=NEWISLE,isl=[],other=[];
      for(const [px,pz] of I.pg){isl.push([Math.floor(px),Math.floor(pz),1]);isl.push([Math.floor(px)+1,Math.floor(pz),1])}
      isl.push([Math.floor(I.x),Math.floor(I.z),2]);                     // 섬 가운데 높은 층도
      other.push([88,660,1],[89,660,1],[VIL.x|0,(VIL.z|0)+6,1],[700,300,3]); // 다른 곳(식물섬 그린 자리·마을·먼 곳)
      const s=[...isl,...other].map(b=>b.join('.')+'.2').join(';');
      localStorage.removeItem('frontisle_tidy57');localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at:Date.now()-1000,blocks:s}));
      DEV.on=true;CRV.inited=false;CRV.map.clear();CRV.undo.length=0;creInit();
      const left=CRV.map.size,saved=JSON.parse(localStorage.getItem('frontisle_blocks')).blocks.split(';').filter(Boolean).length,flag=!!localStorage.getItem('frontisle_tidy57');
      const otherKept=other.every(b=>CRV.map.has(crvKey(b[0],b[1],b[2])));
      creUndo();const afterUndo=CRV.map.size;
      // 두 번째: 표시가 있으면 안 지움
      localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at:Date.now(),blocks:s}));CRV.inited=false;CRV.map.clear();CRV.undo.length=0;creInit();const second=CRV.map.size;
      // 정리
      CRV.map.clear();crvRebuild();localStorage.removeItem('frontisle_blocks');localStorage.removeItem('frontisle_tidy57');DEV.on=false;CRV.inited=false;
      const ok=left===other.length&&saved===other.length&&flag&&otherKept&&afterUndo===isl.length+other.length&&second===isl.length+other.length;
      return JSON.stringify({total:isl.length+other.length,isl:isl.length,left,saved,flag,otherKept,afterUndo,second,box:tidy57Box().map(v=>+v.toFixed(1)),ok})}"""))
    # 3) 사진: 56차와 같은 자리
    await ev("()=>{setBuild(null);const p=PATHS[60];P.x=p.x+3;P.z=p.z+4;S.time=.42;try{ZOOM.t=.9}catch(e){};zoomK=.9;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p57_road.jpg'),type='jpeg',quality=86)
    await ev("()=>{const p=PATHS[140]||PATHS[20];P.x=p.x+2;P.z=p.z+3;try{ZOOM.t=1.3}catch(e){};zoomK=1.3;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await pg.wait_for_timeout(1500);await pg.screenshot(path=O('p57_road_far.jpg'),type='jpeg',quality=86)
