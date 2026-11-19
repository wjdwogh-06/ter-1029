# 크리에이티브 블록을 게임 화면 그대로 찍어 보기(33차). 기획자의 블록 글(BLK1:… 또는 db_get JSON)을 파일로 저장한 뒤:
#   BLK=/tmp/blocks.txt python3 tools/gt.py tools/cre_shot.py
# 결과: tools/out/cre_shot_near.jpg·cre_shot_far.jpg(나무·바위를 잠깐 숨기고 찍어요), cre_shot_trees.jpg(그대로)
import os, re, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    txt=open(os.environ['BLK'],encoding='utf-8').read().strip()
    m=re.search(r'"blocks"\s*:\s*"([^"]*)"',txt)
    if m: txt=m.group(1)
    if txt.startswith('BLK1:'): txt=txt[5:]
    r=await ev("""(s)=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};DEV.on=true;CRV.inited=true;crvLoad(s);devHud();
      let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k of CRV.map.keys()){const [x,z]=k.split(',').map(Number);x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
      const cx=(x0+x1+1)/2,cz=(z0+z1+1)/2;P.x=cx;P.z=z1+3;P.yv=undefined;DEV.noclip=1;updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return JSON.stringify({n:CRV.map.size,cx,cz,w:x1-x0+1,d:z1-z0+1})}""",txt)
    print('blocks',r)
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('cre_shot_trees.jpg'),type='jpeg',quality=88)
    await ev("()=>{scene.traverse(o=>{if(o.isInstancedMesh&&o!==CRV.mesh)o.visible=false})}")
    await ev("()=>{ZOOM.t=.8}");await pg.wait_for_timeout(1200);await pg.screenshot(path=O('cre_shot_near.jpg'),type='jpeg',quality=88)
    await ev("()=>{ZOOM.t=1.3}");await pg.wait_for_timeout(1200);await pg.screenshot(path=O('cre_shot_far.jpg'),type='jpeg',quality=88)
