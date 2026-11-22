# 52차(디자인): 관리자 '구조물 배치' 목록의 새 구조물 30종 검사
# 기대: DECO·모델 30종 모두 있음·배치 목록(select '추가할 구조물')에 30종 / 올라설 수 있는 것: 계단으로 걸어 올라가면 높이가 맞고, 옆면·난간·연못은 막히고(canStep false),
#       돌려 놓아도(0.7rad) 같음, 지우면(부모에서 떼면) 바로 사라짐, 관리자 모드에선 벽 무시 / errs []
# 사진: tools/out/p52_row1~6.jpg(종류별 줄), p52_walk.jpg(데크 위에 선 모습)
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.4;enemies.slice().forEach(dropEnemy);DEV.god=true;DEV.on=false;window.updSpawns=()=>{}}")
    print('defs',await ev("""()=>{const K=Object.keys(DECO).filter(k=>/^pr_/.test(k));const sel=[...document.querySelectorAll('select')].find(s=>s.getAttribute('aria-label')==='추가할 구조물');
      const opts=sel?[...sel.options].map(o=>o.value):[];return JSON.stringify({n:K.length,noGeo:K.filter(k=>!GEO[DECO[k].g]),notInCatalog:K.filter(k=>!opts.includes(k)),catalogN:opts.length,
      tris:Object.fromEntries(K.map(k=>[k,Math.round(GEO[DECO[k].g].attributes.position.count/3)]))})}"""))
    # 넓고 평평한 빈 땅 찾기
    spot=await ev("""()=>{let best=null;L:for(let cz=120;cz<880;cz+=10)for(let cx=120;cx<880;cx+=10){let ok=true;for(let j=-4;j<=4&&ok;j++)for(let i=-6;i<=6&&ok;i++){const h=hAt(cx+i*6,cz+j*6);if(h<.95||h>1.3||islAt(cx+i*6,cz+j*6)!==ISL[0])ok=false}
      if(!ok)continue;if(structs.some(s=>Math.abs(s.x-cx)<46&&Math.abs(s.z-cz)<34))continue;best=[cx,cz];break L}return best}""")
    print('spot',spot)
    await ev("""([cx,cz])=>{const K=Object.keys(DECO).filter(k=>/^pr_/.test(k)&&k!=='pr_bridge');window.PRS={};K.forEach((k,i)=>{const col=i%6,row=(i/6)|0;const s=addStruct({t:k,x:cx-30+col*12,z:cz-22+row*11,r:0});PRS[k]=s});
      scene.traverse(o=>{if(o.isInstancedMesh)o.visible=false});}""",spot)
    # 걷기 흉내: 점들을 0.1m씩 따라가며 canStep으로 막히면 멈춤
    await ev("""()=>{window.walkPath=(pts)=>{P.x=pts[0][0];P.z=pts[0][1];let blocked=null,maxRise=0,prevY=stepY(P.x,P.z);for(let k=1;k<pts.length;k++){const [tx,tz]=pts[k];let n=Math.ceil(Math.hypot(tx-P.x,tz-P.z)/.1);const dx=(tx-P.x)/n,dz=(tz-P.z)/n,L=Math.hypot(dx,dz)||1;
        for(let i=0;i<n;i++){const nx=P.x+dx,nz=P.z+dz;if(!canStep(P,nx,nz,dx/L,dz/L)){blocked=[+P.x.toFixed(2),+P.z.toFixed(2)];return{blocked,y:+groundY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)}}P.x=nx;P.z=nz;const y=stepY(P.x,P.z);maxRise=Math.max(maxRise,y-prevY);prevY=y}}
        return{blocked,y:+groundY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)}};
      window.W=(k,lx,lz)=>{const s=PRS[k],c=Math.cos(s.r||0),sn=Math.sin(s.r||0);return[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]};window.base=k=>PRS[k].m.position.y+.04}""")
    print('walk',await ev("""()=>{const r={},b=k=>+base(k).toFixed(2),rel=(o,k)=>({...o,rel:+(o.y-base(k)).toFixed(2)});
      r.stairWood=rel(walkPath([W('pr_stair_wood',0,2.4),W('pr_stair_wood',0,-.9)]),'pr_stair_wood');
      r.stairWoodSide=rel(walkPath([W('pr_stair_wood',2,-.9),W('pr_stair_wood',0,-.9)]),'pr_stair_wood');
      r.stairStone=rel(walkPath([W('pr_stair_stone',0,2.2),W('pr_stair_stone',0,-.8)]),'pr_stair_stone');
      r.deckUp=rel(walkPath([W('pr_deck',0,4.6),W('pr_deck',0,0),W('pr_deck',1.2,-1.2)]),'pr_deck');
      r.deckSide=rel(walkPath([W('pr_deck',3.4,0),W('pr_deck',0,0)]),'pr_deck');
      r.deckRailOut=rel(walkPath([W('pr_deck',0,4.6),W('pr_deck',0,0),W('pr_deck',0,-3.5)]),'pr_deck');
      r.deckFallOffFront=rel(walkPath([W('pr_deck',0,4.6),W('pr_deck',0,1.0),W('pr_deck',1.4,1.0),W('pr_deck',1.4,4.0)]),'pr_deck');
      r.lookout=rel(walkPath([W('pr_lookout',0,5.6),W('pr_lookout',0,0)]),'pr_lookout');
      r.ramp=rel(walkPath([W('pr_ramp',0,2.6),W('pr_ramp',0,-1.5)]),'pr_ramp');
      r.rampSide=rel(walkPath([W('pr_ramp',2.4,-1.2),W('pr_ramp',0,-1.2)]),'pr_ramp');
      r.mound=rel(walkPath([W('pr_mound',-4.2,0),W('pr_mound',0,0)]),'pr_mound');
      r.plateau=rel(walkPath([W('pr_plateau',0,3.4),W('pr_plateau',0,-.6)]),'pr_plateau');
      r.plateauSide=rel(walkPath([W('pr_plateau',3.4,-.6),W('pr_plateau',0,-.6)]),'pr_plateau');
      r.gazebo=rel(walkPath([W('pr_gazebo',0,3.4),W('pr_gazebo',0,0)]),'pr_gazebo');
      r.gazeboBack=rel(walkPath([W('pr_gazebo',0,-3.4),W('pr_gazebo',0,0)]),'pr_gazebo');
      r.pond=rel(walkPath([W('pr_pond',3,0),W('pr_pond',0,0)]),'pr_pond');
      r.cabinPorch=rel(walkPath([W('pr_cabin',0,3.6),W('pr_cabin',0,2.0),W('pr_cabin',0,0)]),'pr_cabin');
      r.busstop=rel(walkPath([W('pr_busstop',0,1.6),W('pr_busstop',0,-.1),W('pr_busstop',0,-1.6)]),'pr_busstop');
      return JSON.stringify(r)}"""))
    # 돌려 놓기 · 지우기 · 관리자 모드
    print('rot',await ev("""()=>{const s=PRS.pr_deck;s.r=.7;s.m.rotation.y=.7;const up=walkPath([W('pr_deck',0,4.6),W('pr_deck',0,0)]),side=walkPath([W('pr_deck',3.4,0),W('pr_deck',0,0)]);
      const c=W('pr_deck',0,0);const p0=!!onDock(c[0],c[1]);s.m.parent.remove(s.m);const p1=!!onDock(c[0],c[1]);scene.add(s.m);DEV.on=true;const wall=W('pr_deck',0,-1.95),dv=onDock(wall[0],wall[1]);DEV.on=false;const nv=onDock(wall[0],wall[1]);
      s.r=0;s.m.rotation.y=0;return JSON.stringify({upRel:+(up.y-base('pr_deck')).toFixed(2),upBlocked:up.blocked,sideBlocked:!!side.blocked,dockBefore:p0,afterDetach:p1,devWallIgnored:!dv,wallNormally:!!nv&&+(nv.y-base('pr_deck')).toFixed(1)})}"""))
    # 사진: 줄마다
    for row in range(5):
        for half in range(2):
            await ev(f"""([cx,cz])=>{{P.x=cx-30+({half}*3+1)*12;P.z=cz-22+{row}*11+4.2;P.rot=Math.PI;S.time=.4;zoomK=1.05;try{{ZOOM.t=1.05}}catch(e){{}}}}""",spot)
            await pg.wait_for_timeout(1300)
            await pg.screenshot(path=O(f'p52_r{row+1}{"ab"[half]}.jpg'),type='jpeg',quality=82)
    await ev("""()=>{const c=W('pr_deck',.8,-.6);P.x=c[0];P.z=c[1];P.rot=Math.PI*.8;zoomK=.8;try{ZOOM.t=.8}catch(e){}}""")
    await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O('p52_walk.jpg'),type='jpeg',quality=82)
    print("standY",await ev("()=>JSON.stringify({ground:+groundY(P.x,P.z).toFixed(2),mesh:+P.a.root.getWorldPosition(new THREE.Vector3()).y.toFixed(2)})"))
    # 다리: 물 위(가운데가 물, 양 끝이 땅인 곳) 찾아 놓고 건너기
    print('bridge',await ev("""()=>{let found=null;for(let cz=100;cz<900&&!found;cz+=3)for(let cx=100;cx<900&&!found;cx+=3){if(hAt(cx,cz)>-.5)continue;for(const [dx,dz] of [[0,1],[1,0]]){const a=hAt(cx-dx*3.9,cz-dz*3.9),b=hAt(cx+dx*3.9,cz+dz*3.9);if(a>.15&&b>.15&&a<1.3&&b<1.3){found=[cx,cz,dx?Math.PI/2:0];break}}}
      if(!found)return 'no river';const [x,z,r]=found;const s=addStruct({t:'pr_bridge',x,z,r});PRS.pr_bridge=s;for(let i=0;i<3;i++)updDress(.016,P.x,P.z);
      const res=walkPath([W('pr_bridge',0,4.8),W('pr_bridge',0,0),W('pr_bridge',0,-4.8)]);const mid=W('pr_bridge',0,0);P.x=mid[0];P.z=mid[1];updWaterState(.016);
      const sideIn=walkPath([W('pr_bridge',2.2,0),W('pr_bridge',0,0)]);return JSON.stringify({at:found.map(v=>+v.toFixed(1)),baseY:+PRS.pr_bridge.m.position.y.toFixed(2),cross:res,midY:+groundY(mid[0],mid[1]).toFixed(2),waterAtMid:+hAt(mid[0],mid[1]).toFixed(2),stateOnBridge:WTR.st,fromWaterBlocked:!!sideIn.blocked})}"""))
    await ev("()=>{const c=W('pr_bridge',0,2.4);P.x=c[0];P.z=c[1];P.rot=Math.PI;zoomK=1.1;try{ZOOM.t=1.1}catch(e){}}")
    await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O('p52_bridge.jpg'),type='jpeg',quality=82)
