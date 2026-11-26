# 37차 식물섬 검사: 절벽 닫힘(문 닫힘 → 밖으로 못 나감, 바다에서 못 들어옴, 안쪽 갇힌 칸 0), 문(도감 미완성 → 안 열림, 완성 → 열림, 안에서는 언제나),
# 주인 [말 걸기], 설치 금지 원·나무 비우기, 지도 점, 사진(tools/out/pi_*.jpg)
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};DEV.on=false;DEV.god=true}")
    res['basic']=await ev("""()=>{let no=0;objs.forEach(o=>{if(Math.hypot(o.x-PIS.x,o.z-PIS.z)<PIS.nr+2)no++});const nob=NOB.find(n=>n.k==='pis');
      let far=0;for(let a=0;a<64;a++){const th=a/64*Math.PI*2;far=Math.max(far,piR(th)+PIS.off+3.4)}
      return {nr:PIS.nr,objsIn:no,nob:!!nob&&nob.r,nobAt:!!nobAt(PIS.x,PIS.z,1),map:PLACES.some(p=>p.k==='pis'),gate:structs.filter(s=>s.t==='pgate').length,stall:structs.filter(s=>s.t==='pstall').length,
        plants:typeof PLANTS!=='undefined'&&PLANTS.every(q=>GEO['pw_'+q.id])}}""")
    res['seal']=await ev("""()=>{const g=structs.find(s=>s.t==='pgate');const st=.5,R=PIS.nr+8,X0=PIS.x-R,Z0=PIS.z-R,N=Math.ceil(2*R/st);const pass=(x,z)=>walk(x,z,.42,P)===null;
      const flood=(sx,sz)=>{const seen=new Uint8Array(N*N),q=[];const i0=Math.round((sx-X0)/st),j0=Math.round((sz-Z0)/st);seen[j0*N+i0]=1;q.push([i0,j0]);let leak=null,n=0;
        while(q.length){const [i,j]=q.pop();n++;const x=X0+i*st,z=Z0+j*st;if(Math.hypot(x-PIS.x,z-PIS.z)>PIS.nr+3)leak=leak||[+x.toFixed(1),+z.toFixed(1)];
          for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N||seen[b*N+a])continue;const nx=X0+a*st,nz=Z0+b*st;if(!pass(nx,nz))continue;if(!canStep({x,z,pl:1},nx,nz,di,dj))continue;seen[b*N+a]=1;q.push([a,b])}}return {n,leak,seen}};
      g.open=false;const A=flood(PIS.plaza[0]+2.5,PIS.plaza[1]);let pockets=0;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=X0+i*st,z=Z0+j*st;if(piInside(x,z,1.2)&&pass(x,z)&&!A.seen[j*N+i]&&!(groundY(x,z)>hAt(x,z)+3)&&!(typeof sh85Near==='function'&&sh85Near(x,z)&&[[.6,0],[-.6,0],[0,.6],[0,-.6]].some(([u,v])=>groundY(x+u,z+v)>hAt(x,z)+3)))pockets++}   /* 85차: 가게 마당의 벽(PRF) 바로 옆 칸은 앞끝 검사 때문에 칸 채우기로 안 닿아 보여서 세지 않아요(가게 문까지 걷기는 p85_check가 봐요) */   /* 81차: 52차 배치용 건물(오두막 등) 몸채 = 벽 높이(PRF)라 칸으로 세지 않아요 */
      g.open=true;const B=flood(PIS.plaza[0]+2.5,PIS.plaza[1]);g.open=false;const C=flood(PIS.x,PIS.z-40);let seaIn=0;for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(C.seen[j*N+i]&&piInside(X0+i*st,Z0+j*st,1.5))seaIn++;
      return {closedLeak:A.leak,inside:A.n,pockets,openReachesOut:!!B.leak,seaStartWater:hAt(PIS.x,PIS.z-40)<-.3,seaIn}}""")
    res['gate']=await ev("""()=>{const g=structs.find(s=>s.t==='pgate'),r={};S.pdex={};r.closedBlocks=walk(g.x,g.z,.42,P)!==null;
      P.x=g.x;P.z=g.z+sdef(g).bz+.7;P.rot=Math.PI;P.auto=null;let t=findTarget();r.outLocked=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.lockedStaysShut=!g.open;
      for(const q of PLANTS)S.pdex[q.id]=1;t=findTarget();r.outDone=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.openedWithDex=g.open;r.openPass=walk(g.x,g.z,.42,P)===null;
      g.open=false;S.pdex={};P.x=g.x;P.z=g.z-sdef(g).bz-.7;P.rot=0;t=findTarget();r.inLabel=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.insideOpens=g.open;return r}""")
    await pg.wait_for_timeout(5600)
    res['gateCloses']=await ev("()=>{const g=structs.find(s=>s.t==='pgate');P.x=g.x;P.z=g.z-4;return {closedAfter:!g.open,leafL:g.lk&&+g.lk.parts.l.rotation.y.toFixed(2)}}")
    res['npc']=await ev("""()=>{const s=SH84.plant.door;P.x=s.x;P.z=s.z+.9;P.rot=Math.PI;const t=findTarget();return {label:t&&t.lab}}""")   # 84차: 주인은 식물 가게 안
    await ev("()=>{S.pdex={};$('ui').style.visibility='hidden'}")
    L=[('pi_over','PIS.x','PIS.z+14',3.2,.42),('pi_gate','PIS.gx+2','PIS.gzo+5',1.2,.42),('pi_plaza','PIS.plaza[0]+1','PIS.plaza[1]+4',1.15,.42),('pi_garden','70.5','669.5',1.15,.42),
       ('pi_glass','88.6','658.5',1.1,.42),('pi_pond','105','668',1.15,.42),('pi_stall','93.8','673',.8,.42),('pi_night','PIS.x-3','PIS.z+9',2.0,.9)]
    for n,x,z,zk,t in L:
        await ev(f"()=>{{S.time={t};P.x={x};P.z={z};P.rot=Math.PI;P.auto=null;zoomK={zk};if(typeof ZOOM!=='undefined')ZOOM.t=null;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}}");await pg.wait_for_timeout(1500)
        await pg.screenshot(path=O(n+'.jpg'),type='jpeg',quality=85)
    await ev("()=>{$('ui').style.visibility=''}")
    b,s,g,c,n=res['basic'],res['seal'],res['gate'],res['gateCloses'],res['npc']
    res['ok']={'basic':b['objsIn']==0 and b['nob']==b['nr'] and b['nobAt'] and b['map'] and b['gate']==1 and b['stall']==0,
      'seal':s['closedLeak'] is None and s['pockets']==0 and s['openReachesOut'] and s['seaStartWater'] and s['seaIn']==0,
      'gate':g['closedBlocks'] and str(g['outLocked']).startswith('🔒') and g['lockedStaysShut'] and g['outDone']=='문 열기' and g['openedWithDex'] and g['openPass'] and g['inLabel']=='문 열기' and g['insideOpens'] and c['closedAfter'],
      'npc':n['label']=='식물 가게 들어가기'}
    print(json.dumps(res,ensure_ascii=False))
