# 51차(디자인): 플라스틱 그림 다시 · 페인트 8색 · 도색 작업대 검사
# 기대: 페인트 8색·도색 작업대 키트 정의·아이콘·모델·자판기 빠진 것 0 / 도색 작업대: 밖에 설치(키트 씀)·라벨 '🎨 도색 작업대'·누르면 안내 / 텐트 안에도 설치·밖에선 안 보임 / 철거 → 키트 / errs []
# 사진: tools/out/p51_icons.png(아이콘 판), p51_bench.jpg(밖에 놓은 도색 작업대)
import os,json,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('defs',await ev("""()=>{const A=[...PAINTS.map(q=>'paint_'+q[0]),'kit_paintbench','plastic'],pool=vendPool();return JSON.stringify({n:A.length,noItem:A.filter(k=>!ITEMS[k]),noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),
      noGeo:A.filter(k=>!GEO[ITEMS[k].ic]),notVend:A.filter(k=>!pool.includes(k)),bench:!!(BUILDS.paintbench&&GEO[BUILDS.paintbench.g]),tris:Object.fromEntries(A.map(k=>[k,Math.round(GEO[ITEMS[k].ic].attributes.position.count/3)]))})}"""))
    url=await ev("""async()=>{const A=['plastic',...PAINTS.map(q=>'paint_'+q[0]),'kit_paintbench'],N=128,C=5,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+16);c.height=rows*(N+34);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+16)+8,y=((i/C)|0)*(N+34)+4;k.drawImage(im,x,y);k.fillStyle='#5b3d2b';k.font='bold 15px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+20)}
      return c.toDataURL()}""")
    open(O('p51_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    await ev("""()=>{window.findSpot=(k,x0,z0)=>{setBuild(k);for(let i=0;i<1600;i++){P.x=x0+(i%40)*2.3;P.z=z0+((i/40)|0)*2.4;P.rot=0;const g=ghostPos();if(g.ok)return g}return null}}""")
    print('out',await ev("""()=>{S.inv.kit_paintbench=2;for(const k in BUILDS.paintbench.c)S.inv[k]=0;const clear=(x,z)=>{for(const o of objs.values())if(o.re<=0&&Math.abs(o.x-x)<7&&Math.abs(o.z-z)<7)return false;return true};let g=null;setBuild('paintbench');for(let i=0;i<3000&&!g;i++){P.x=VIL.x-150+(i%60)*2.7;P.z=VIL.z-40+((i/60)|0)*2.9;P.rot=0;const q=ghostPos();if(q.ok&&clear(q.x,q.z))g=q};if(!g)return 'no spot';setBuild(null);primary('kit_paintbench');const r={mode:bmode};
      const g2=ghostPos();r.ok=g2.ok||g2.why;placeBuild();setBuild(null);const s=structs.find(q=>q.own&&q.t==='paintbench'&&!q.in);window.TQp=s;r.placed=!!s;r.kitLeft=invN('kit_paintbench');
      P.x=s.x;P.z=s.z+BUILDS.paintbench.bz+.7;P.rot=Math.PI;const t=findTarget();r.lab=t&&t.lab;let msg='';const _t=toast;toast=m=>{msg=m};target=t;inp.actEdge=true;interact();inp.actEdge=false;toast=_t;r.toast=msg;return JSON.stringify(r)}"""))
    await ev("()=>{P.x=TQp.x+1.6;P.z=TQp.z+3.4;P.rot=Math.PI;S.time=.42;try{ZOOM.t=.74}catch(e){};zoomK=.74}");await pg.wait_for_timeout(1600)
    await pg.screenshot(path=O('p51_bench.jpg'),type='jpeg',quality=85)
    # 텐트 안에도
    print('tent',await ev("""()=>{S.inv.kit_tent=(S.inv.kit_tent||0)+1;const g=findSpot('ptent',VIL.x-60,VIL.z+80);if(!g)return 'no tent spot';placeBuild();setBuild(null);const tn=structs.find(q=>q.own&&q.t==='ptent');
      intEnter(tn);window.TQt=tn;return 'entering'}"""));
    await pg.wait_for_timeout(2500)
    print('tent2',await ev("""()=>{setBuild('paintbench');const g2=ghostPos();const r={inside:INT.on,ok:g2.ok||g2.why};if(g2.ok)placeBuild();setBuild(null);const s=structs.find(q=>q.own&&q.t==='paintbench'&&q.in);r.placedIn=!!s;r.visIn=!!(s&&s.m.visible);
      if(s){P.x=s.x;P.z=s.z+BUILDS.paintbench.bz+.7;P.rot=Math.PI;const t=findTarget();r.labIn=t&&t.lab}
      intOut();r.visOut=!!(s&&s.m.visible);return JSON.stringify(r)}"""))
    print('demo',await ev("""()=>{const s=TQp;const k0=invN('kit_paintbench');bmode='demo';P.x=s.x;P.z=s.z+1.4;BPIN.on=true;BPIN.x=s.x;BPIN.z=s.z;placeBuild();BPIN.on=false;setBuild(null);bmode=null;return JSON.stringify({gone:!structs.includes(s),kitBack:invN('kit_paintbench')-k0})}"""))
