# 70차: 지뢰·못 삭제, 제작법 빼기(방수포·부착물·부적·도구·화살·석궁·총 부품), 철판·금속부품 = 철 주괴, 남쪽 보급지 셋 → 큰 보급 기지
# 기대: ALL True, errs [] · 사진 tools/out/p70_*.jpg
import json,os
async def steps(pg):
    ev=pg.evaluate
    r=json.loads(await ev("""()=>{const o={};const has=id=>RECIPES.some(x=>x.id===id);
      o.noRecipe=['tarp','att_scope','att_laser','att_grip','att_supp','charm','pick_adv','pick_elec','dhammer','chainsaw','harpoon','rod2','rod3','rod_lucky','arrow','crossbow','kit_tent','gp_wstock','gp_sstock','gp_rbarrel','gp_sbarrel','nails','kit_mine'].filter(has);
      const R=id=>{const x=RECIPES.find(q=>q.id===id);return x?crKey(x.c):null};o.mparts=R('mparts');o.splate=R('splate');o.guns=RECIPES.filter(x=>x.pat).length;o.n=RECIPES.length;
      const keys={};o.dup=[];for(const x of RECIPES){if(x.pat)continue;const k=crKey(x.c);if(keys[k])o.dup.push(keys[k]+'/'+x.id);keys[k]=x.id}
      o.gone=['nails','kit_mine'].filter(k=>ITEMS[k]||vendPool().includes(k));o.partsKept=['gp_wstock','gp_sstock','gp_rbarrel','gp_sbarrel','tarp','charm','att_scope'].filter(k=>!ITEMS[k]);
      o.mineHide=!!(BUILDS.mine&&BUILDS.mine.hide);o.mineKit=BUILDS.mine&&BUILDS.mine.kit||null;
      /* 예전 저장의 지뢰·못 */ S.inv.nails=7;const sc=invN('scrap'),pw=invN('powder');S.built=(S.built||[]).concat([{t:'mine',x:1,z:1,r:0}]);const got=dropRemoved();o.refund=[invN('scrap')-sc,invN('powder')-pw];o.nailsLeft=S.inv.nails||0;o.got=got;
      /* 큰 보급 기지 */ const s=SUPS.find(q=>q.i===SUP_BIG.i);o.sups=SUPS.map(q=>q.i).join(',');o.big=s?[s.x,s.z]:null;o.crates=s?s.cr.length:0;o.chests=s?s.cr.filter(c=>c.t==='chest').length:0;
      o.names=s?s.cr.map(c=>c.li).join(','):'';o.old78=structs.filter(q=>q.li&&/^s[78]_/.test(q.li)).length;o.totalSup=structs.filter(q=>q.t==='supply').length;o.totalChest=structs.filter(q=>q.t==='chest').length;
      const F=SPF.find(f=>f.i===SUP_BIG.i);o.fence=F?{th:+F.th.toFixed(2),posts:F.posts.length,cols:F.cols}:null;o.nob=NOB.filter(n=>n.k==='sup'&&dist(n.x,n.z,s.x,s.z)<1).map(n=>+n.r.toFixed(1));
      o.roads=ROADS.filter(q=>/HC/.test(q.k)).map(q=>q.k);o.hc=ROAD_NODES.HC;o.gate6=ROAD_GATE['6'];
      /* 식물 구역과 설치 금지 원 겹침 */ o.plantOv=PLANT_SITES.filter(p=>NOB.some(n=>dist(n.x,n.z,SUP_BIG.x,SUP_BIG.z)<5&&dist(p.x,p.z,n.x,n.z)<p.r+n.r)).map(p=>p.p);
      /* 전리품 두 번 */ const cnt=g=>Object.keys(g).filter(k=>k!=='coin').reduce((a,k)=>a+g[k],0);let A=0,B=0;const nb=SUPS.find(q=>q.i===0).cr[0];for(let i=0;i<300;i++){A+=cnt(lootGen(s.cr[1]));B+=cnt(lootGen(nb))}o.loot=[+(A/300).toFixed(2),+(B/300).toFixed(2)];
      return JSON.stringify(o)}"""))
    # 걸어서 닿기: 북쪽 문 앞에서 0.5m 칸 채우기 → 모든 상자·남쪽 문 밖까지
    r['reach']=json.loads(await ev("""()=>{const B=SUP_BIG,s=SUPS.find(q=>q.i===B.i),D=0.5,X0=B.x-26,Z0=B.z-24,NX=104,NZ=96,seen=new Uint8Array(NX*NZ),free=new Int8Array(NX*NZ).fill(-1);DEV.on=0;
      const ok=(i,j)=>{const k=j*NX+i;if(free[k]<0){const x=X0+i*D,z=Z0+j*D;free[k]=(hAt(x,z)>.95&&walk(x,z,.42,P)===null)?1:0}return free[k]===1};
      const st=[[Math.round((B.x-X0)/D),Math.round((B.z-B.hz-5-Z0)/D)]];seen[st[0][1]*NX+st[0][0]]=1;let n=0;
      while(st.length){const [i,j]=st.pop();n++;for(const [di,dj] of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=NX||b>=NZ||seen[b*NX+a])continue;if(!ok(a,b))continue;
        const y0=stepY(X0+i*D,Z0+j*D),y1=stepY(X0+a*D,Z0+b*D);if(y1-y0>.55)continue;seen[b*NX+a]=1;st.push([a,b])}}
      const near=(x,z,rr)=>{for(let j=Math.max(0,Math.floor((z-rr-Z0)/D));j<=Math.min(NZ-1,Math.ceil((z+rr-Z0)/D));j++)for(let i=Math.max(0,Math.floor((x-rr-X0)/D));i<=Math.min(NX-1,Math.ceil((x+rr-X0)/D));i++)if(seen[j*NX+i]&&Math.hypot(X0+i*D-x,Z0+j*D-z)<=rr)return true;return false};
      const miss=s.cr.filter(c=>!near(c.x,c.z,c.t==='chest'?1.45:1.35)).map(c=>c.li);const south=near(B.x,B.z+B.hz+4,1);const center=near(B.x,B.z,1.2);
      /* 울타리 안쪽 칸 중 갇힌 곳(문에서 못 가는 빈 칸) */ let trap=0;for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=X0+i*D,z=Z0+j*D;if(Math.abs(x-B.x)>B.hx-1||Math.abs(z-B.z)>B.hz-1)continue;if(ok(i,j)&&!seen[j*NX+i])trap++}
      return JSON.stringify({cells:n,miss,south,center,trap})}"""))
    await ev("()=>{DEV.on=true;S.time=.42;WX.on=false}")
    for nm,x,z,t in [('south',464,724,.42),('north',464,698,.42),('west',455,712,.42),('east',474,712,.42),('center',462,716,.42),('night',464,716,.9)]:
        await ev(f"()=>{{P.x={x};P.z={z};P.y=groundY(P.x,P.z);P.yv=0;S.time={t};zoomK=1.3;updCamera(0,P.x,P.y,P.z,true)}}")
        await pg.wait_for_timeout(1400);await pg.screenshot(path=os.path.join(OUT,'p70_'+nm+'.jpg'),type='jpeg',quality=82)
    q=r['reach']
    r['ok']=(not r['noRecipe'] and r['mparts']=='bar_iron:2' and r['splate']=='bar_iron:3' and r['guns']==7 and not r['dup'] and not r['gone'] and not r['partsKept']
      and r['mineHide'] and r['refund']==[4,4] and r['nailsLeft']==0 and r['big']==[464,710] and r['crates']==11 and r['chests']==2 and r['old78']==0 and '7' not in r['sups'].split(',') and '8' not in r['sups'].split(',')
      and r['fence'] and r['fence']['cols']>30 and not r['plantOv'] and 'HC-S7' not in r['roads'] and 'HC-S8' not in r['roads'] and r['gate6']>3.1 and r['loot'][0]>r['loot'][1]*1.6
      and not q['miss'] and q['south'] and q['center'] and q['trap']==0)
    print('p70',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
