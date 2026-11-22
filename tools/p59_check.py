# 59차(규칙): 블록으로 그린 섬 27개(core.js NEWISLES) + 섬으로 만든 테두리 블록 지우기(ui.js crvIsleClean)
# 기대: 27개 모두 있음·이름, 섬마다 키운 선 안쪽(작은 섬은 안쪽 반지름의 40%, 큰 섬은 4m) 100% 땅, 넓이는 그린 선의 0.9~2배,
#       따로 그린 섬끼리 땅이 붙지 않음(가장 가까운 두 선 사이 물), 땅 높이 1.32 아래, 본섬·다른 섬 구조물(항구·보급지·등대·식물 구역)과 안 겹침,
#       낚시 포인트 79곳은 물 위, 고래 길은 깊은 물·섬에서 8m 넘게, 블록 정리: 그린 선 블록만 지우고 다른 블록은 그대로·한 번만
import os,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    def put(k,v):res[k]=v;print(k,json.dumps(v,ensure_ascii=False)[:900])
    r=json.loads(await ev("""()=>{const o={n:NEWISLES.length,isl:0,bad:[],pairs:[],maxH:-9};const NI=NEWISLES.filter(N=>!ISLE_OFF.includes(N.n)),L=NI.map(N=>ISL.find(I=>I.pg&&I.n===N.n&&Math.abs(I.x-(mkPgIsle(N).x))<.01));
      o.isl=L.filter(Boolean).length;
      L.forEach((I,i)=>{if(!I)return;const N=NI[i];let core=0,cl=0,land=0,drawn=0;const m=I.br;const th=I.rin>10?-4:-I.rin*.4;
        for(let z=Math.floor(I.z-m);z<=I.z+m;z+=.5)for(let x=Math.floor(I.x-m);x<=I.x+m;x+=.5){const h=hAt(x,z),sd=pgSD(I.pg,x,z);if(pgSD(N.pg,x,z)<0)drawn++;if(h>0&&islAt(x,z)===I){land++;if(h>o.maxH)o.maxH=h}if(sd<th){core++;if(h>0)cl++}}
        const ratio=land/Math.max(1,drawn),cf=cl/Math.max(1,core);if(cf<.999||ratio<.9||ratio>2.1)o.bad.push({i,n:I.n,x:Math.round(I.x),z:Math.round(I.z),rin:+I.rin.toFixed(1),cf:+cf.toFixed(3),ratio:+ratio.toFixed(2)})});
      /* 따로 그린 섬끼리: 가장 가까운 두 점 사이 가장 낮은 땅 */
      const all=[NEWISLE,...NI];o.offLand=NEWISLES.filter(N=>ISLE_OFF.includes(N.n)).filter(N=>{const c=mkPgIsle(N);return hAt(c.x,c.z)>0||ISL.some(I=>I.n===N.n)}).length;o.off=NEWISLES.length-NI.length;for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){let best=1e9,pa,pb;for(const p of all[a].pg)for(const q of all[b].pg){const d=dist(p[0],p[1],q[0],q[1]);if(d<best){best=d;pa=p;pb=q}}if(best>25)continue;
        let lo=9;for(let t=0;t<=1;t+=.02){const x=pa[0]+(pb[0]-pa[0])*t,z=pa[1]+(pb[1]-pa[1])*t;if(pgSD(all[a].pg,x,z)>0&&pgSD(all[b].pg,x,z)>0)lo=Math.min(lo,hAt(x,z))}o.pairs.push({a,b,gap:+best.toFixed(1),lo:+lo.toFixed(2)})}
      o.joined=o.pairs.filter(p=>p.lo>0);o.pairs=o.pairs.length;o.maxH=+o.maxH.toFixed(2);
      /* 다른 것과 겹침: 새 섬 땅 위의 구조물·식물 구역·설치 금지 원 */
      const onNew=(x,z)=>{const I=islAt(x,z);return I&&I.pg&&I!==ISL.find(q=>q.n===NEWISLE.n)&&hAt(x,z)>0};
      o.structOn=structs.filter(s=>onNew(s.x,s.z)).map(s=>s.t).slice(0,10);o.nobOn=NOB.filter(n=>onNew(n.x,n.z)).map(n=>n.k);o.plantOn=PLANT_SITES.filter(p=>onNew(p.x,p.z)).length;
      o.ports=PORT_SITES.filter(p=>onNew(p[0],p[1])).length;o.sups=SUPS.filter(s=>onNew(s.x,s.z)).length;o.lh=LHS.filter(l=>onNew(l.x,l.z)).length;
      o.fsp=FSP.length;o.fspOn=FSP.filter(s=>hAt(s.x,s.z)>-.15).length;o.fspMoved=FSP.filter(s=>s.ox!=null).length;
      o.whaleDeep=WH.path?WH.path.every(p=>hAt(p[0],p[1])<WH.depth):null;o.whaleNear=WH.path?Math.round(Math.min(...WH.path.map(p=>Math.min(...ISL.filter(I=>I.pg).map(I=>pgSD(I.pg,p[0],p[1])))))):null;
      o.trees=0;o.rocks=0;for(const q of objs.values()){if(q.re>0)continue;if(onNew(q.x,q.z)){if(q.t<=2)o.trees++;else if(q.t===3)o.rocks++}}
      return JSON.stringify(o)}"""))
    r['ok']=r['n']==27 and r['isl']==9 and r['off']==18 and r['offLand']==0 and not r['bad'] and not r['joined'] and r['maxH']<1.32 and not r['structOn'] and not r['nobOn'] and r['plantOn']==0 and r['ports']==0 and r['sups']==0 and r['lh']==0 and r['fsp']==79 and r['fspOn']==0 and r['whaleDeep'] is True and r['whaleNear']>8
    put('isles',r)
    # 블록 정리: 그린 선 블록 + 다른 블록(본섬 위)을 넣고 개발자 모드 creInit → 그린 선만 사라지고 한 번만
    r=json.loads(await ev("""()=>{localStorage.removeItem('frontisle_blocks_isl');localStorage.setItem('frontisle_tidy57','1');const L=NEWISLES;const a=[];L.forEach(N=>N.pg.forEach(p=>a.push(Math.floor(p[0])+'.'+Math.floor(p[1])+'.0.0')));
      const keep=['300.300.1.2','301.300.1.2','302.300.2.3'];localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at:Date.now()-1000,blocks:a.concat(keep).join(';')}));
      CRV.inited=false;CRV.map.clear();creInit();const left=[...CRV.map.keys()],und=CRV.undo.length;let saved='';try{saved=JSON.parse(localStorage.getItem('frontisle_blocks')).blocks}catch(e){}
      const o={put:a.length+keep.length,left:left.length,leftKeys:left.slice(0,5),flag:localStorage.getItem('frontisle_blocks_isl'),saved:saved.split(';').filter(Boolean).length,undo:und};
      /* 두 번째(다시 켜기): 같은 자리에 새로 그린 블록은 그대로 */
      localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at:Date.now(),blocks:a.slice(0,10).concat(keep).join(';')}));CRV.inited=false;CRV.map.clear();creInit();o.second=CRV.map.size;localStorage.removeItem('frontisle_tidy57');
      localStorage.removeItem('frontisle_blocks');CRV.map.clear();crvRebuild();return JSON.stringify(o)}"""))
    r['ok']=r['left']==3 and r['saved']==3 and r['flag']=='59' and r['second']==13 and r['undo']>=1
    put('blocks',r)
    # 사진
    for nm,(x,z) in {'suda':(262,784),'banda':(660,402),'haeda':(872,62),'jing':(740,665)}.items():
        await ev("([x,z])=>{DEV.on=true;P.x=x;P.z=z+6;P.y=groundY(P.x,P.z);P.yv=0;zoomK=1.3;updCamera(0,P.x,P.y,P.z,true);WX.on=false;S.time=.42}",[x,z]);await pg.wait_for_timeout(1600);await pg.screenshot(path=O('p59_'+nm+'.jpg'),type='jpeg',quality=82)
    print('ALL',all(v.get('ok') for v in res.values()))
