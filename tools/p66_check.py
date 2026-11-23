# 66차(디자인): 설치형 미끼(바다 깊은 물에만) + 작살 — 정의·아이콘·자판기·놓는 자리 규칙·실제 설치·출렁·작살 들기
# 기대: ALL True, errs []  · 그림: tools/out/p66_icons.png, p66_buoy.jpg, p66_harpoon.jpg
import json,os,base64
async def steps(pg):
    ev=pg.evaluate
    r=json.loads(await ev("""()=>{const L=['kit_baitbuoy','harpoon'],pool=vendPool();const b=BUILDS.baitbuoy;
      const o={noItem:L.filter(k=>!ITEMS[k]),noGeo:L.filter(k=>!GEO[ITEMS[k].ic]).concat(GEO.bt_harpoon?[]:['hg']).concat(GEO[b.g]?[]:['buoy']),noIcon:L.filter(k=>!/^data:image/.test(ICON[k]||'')),notVend:L.filter(k=>!pool.includes(k)),
        tris:[GEO.bt_baitbuoy,GEO.bt_harpoon].map(g=>Math.round(g.attributes.position.count/3))};
      /* 지도 전체 6m 칸: 물인 곳을 규칙으로 나눠 세기 */
      const cnt={},smp={};let riverDeep=0,riverOk=0,shallowOk=0,deepSea=0,deepSeaOk=0;
      for(let x=6;x<WS-6;x+=6)for(let z=6;z<WS-6;z+=6){const h=hAt(x,z);if(h>-.05)continue;const w=baitSeaWhy(x,z,0,b)||'ok';cnt[w]=(cnt[w]||0)+1;if(!smp[w])smp[w]=[x,z];
        const rd=riverD(x,z),inR=_rp&&rd<_rp.w;if(inR&&h<-1){riverDeep++;if(w==='ok')riverOk++}
        if(h>-.9&&w==='ok')shallowOk++;if(!inR&&h<-2.5&&!(_rp&&rd<_rp.w+8)&&!onDock(x,z)){deepSea++;if(w==='ok')deepSeaOk++}}
      o.cnt=cnt;o.riverDeep=riverDeep;o.riverOk=riverOk;o.shallowOk=shallowOk;o.deepSea=deepSea;o.deepSeaOk=deepSeaOk;
      /* 다른 물 위 설치물(그물)은 예전 규칙 그대로 */
      o.fnetSame=waterSpotWhy(smp.ok[0],smp.ok[1],0,BUILDS.fnet);window.TQs=smp;return JSON.stringify(o)}"""))
    # 실제로 설치: 바닷가 땅에서 바다 쪽으로 돌며 ghostPos가 되는 곳 찾기 (얕은 데서 막히는 이유도 모으기)
    r['place']=json.loads(await ev("""()=>{S.inv.kit_baitbuoy=2;setBuild('baitbuoy');const why={};let found=null;
      outer:for(let rr=40;rr<380&&!found;rr+=5)for(let k=0;k<90;k++){const a=k/90*Math.PI*2,x=VIL.x+Math.cos(a)*rr,z=VIL.z+Math.sin(a)*rr;const h=hAt(x,z);if(h<-.5||h>1.3||nobAt(x,z,2)||onDock(x,z))continue;
        for(let q=0;q<12;q++){P.x=x;P.z=z;P.rot=q/12*Math.PI*2;const g=ghostPos();if(g.ok){found={x,z,gx:g.x,gz:g.z};break outer}why[g.why]=(why[g.why]||0)+1}}
      const o={found:!!found,why:Object.keys(why).filter(w=>/바다|얕|물 위/.test(w))};
      if(found){const n0=S.inv.kit_baitbuoy;placeBuild();const s=structs.find(q=>q.own&&q.t==='baitbuoy');o.placed=!!s;o.kitUsed=n0-(S.inv.kit_baitbuoy||0);if(s){o.y=+s.m.position.y.toFixed(2);o.depth=+(-hAt(s.x,s.z)).toFixed(2);window.TQb=s}}
      setBuild(null);return JSON.stringify(o)}"""))
    await pg.wait_for_timeout(700)
    r['bob']=json.loads(await ev("()=>{const s=TQb;if(!s)return 'null';return JSON.stringify({y:+s.m.position.y.toFixed(3),by:s._by})}"))
    await ev("()=>{const s=TQb;if(!s)return;P.x=s.x;P.z=s.z+1.2;S.time=.45;zoomK=.74;P.a.root.visible=false;updCamera(0,s.x,0,s.z,true)}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p66_buoy.jpg'),type='jpeg',quality=86)
    await ev('()=>{P.a.root.visible=true}')
    r['demo']=json.loads(await ev("()=>{const s=TQb;if(!s)return '{}';const n0=S.inv.kit_baitbuoy||0;setBuild('demo');P.x=s.x;P.z=s.z+1.6;P.rot=Math.PI;const ok=canDemo(s);removeStruct(s);try{give('kit_baitbuoy',1)}catch(e){}setBuild(null);return JSON.stringify({canDemo:ok,gone:!structs.includes(s)})}"))
    r['harp']=json.loads(await ev("()=>{S.inv.harpoon=1;eqSet('gear','harpoon');P.x=VIL.x;P.z=VIL.z;unstuck();return JSON.stringify({held:curId(),melee:!!WEAP.harpoon.melee})}"))
    await ev("()=>{S.time=.42;zoomK=.74;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT,'p66_harpoon.jpg'),type='jpeg',quality=86)
    u=await ev("""async()=>{const A=['kit_baitbuoy','harpoon','bait_shrimp','rod_lucky'],N=150,c=document.createElement('canvas');c.width=A.length*(N+30);c.height=N+30;const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();k.drawImage(im,i*(N+30)+15,2,N,N);k.fillStyle='#5b3d2b';k.font='bold 13px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,i*(N+30)+15+N/2,N+20)}return c.toDataURL()}""")
    open(os.path.join(OUT,'p66_icons.png'),'wb').write(base64.b64decode(u.split(',')[1]))
    p=r['place']
    r['ok']=(not r['noItem'] and not r['noGeo'] and not r['noIcon'] and not r['notVend'] and r['riverOk']==0 and r['shallowOk']==0 and r['deepSeaOk']>=r['deepSea']*.95
             and r['fnetSame']!='' and p['found'] and p.get('placed') and p.get('kitUsed')==1 and p.get('depth',0)>=1.0 and len(p['why'])>0 and r['harp']['held']=='harpoon')
    print('p66',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
