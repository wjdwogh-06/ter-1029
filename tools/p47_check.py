# 47차(디자인): 새 아이템 그림 10종 · 씨앗 9종 심기·3단계·10분·거두기 · 곡괭이 · 철거 망치 · 고급 작업대 · 고기잡이 그물 · 흰 울타리 · 랜턴 가로등 검사
# 기대: defs 모두 있고 아이콘·모델 빠진 것 0·자판기 목록에 모두 / 심기: 씨앗 1개 씀·단계 0 → 6분 1 → 11분 2(모양 키도 바뀜)·덜 자람 라벨 🌱·다 자람 라벨 '감자 캐기'
#       덜 자랐을 때 눌러도 그대로, 다 자라면 감자 +2·도감·밭 없어짐 / 망치: 라벨 '🔨 철거'·누르면 철거·씨앗 돌아옴 / 곡괭이: 맨손 1, 고급 3, 전기 5
#       고급 작업대: 밖 막힘·텐트 안 설치·누르면 작업대 창 / 그물: 땅 막힘·물 위 됨·높이 0 / 흰 울타리 두 칸 붙여 놓기 / 랜턴 가로등 밤에 켜짐 / 저장에 밭·심은 시각 / 다시 켜면 단계 그대로 / errs []
import os,json
RES=['bulb','plank','wbottle','ebottle','aabatt','splate','pcb','att_laser','att_grip','att_supp']
TOOLS=['pick_adv','pick_elec','dhammer']
KITS=['kit_lamp2','kit_bench2','kit_fnet','kit_fwhite']
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    async def shot(n,w=600):
        await pg.wait_for_timeout(w);await pg.screenshot(path=O(n),type='jpeg',quality=85)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('defs',await ev("""(a)=>{const [R,T,K]=a,seeds=FARM.ids.map(i=>'seed_'+i),all=[...R,...T,...K,...seeds],pool=vendPool();
      return JSON.stringify({n:all.length,noItem:all.filter(k=>!ITEMS[k]),noIcon:all.filter(k=>!ICON[k]),noGeo:all.filter(k=>!GEO[ITEMS[k].ic]),notVend:all.filter(k=>!pool.includes(k)),
       stages:FARM.ids.filter(i=>[0,1,2].every(s=>GEO['pc_'+i+'_'+s])).length,builds:['lamp2','bench2','fnet','fence_white',...FARM.ids.map(i=>'crop_'+i)].filter(k=>BUILDS[k]&&GEO[BUILDS[k].g]).length,
       held:T.filter(k=>GEO[ITEMS[k].hg]&&WEAP[k]&&WEAP[k].melee).length,T:FARM.T})}""",[RES,TOOLS,KITS]))
    # 빈 평지 찾기(설치 모드 k로 ghostPos가 되는 곳)
    await ev("""()=>{window.findSpot=(k,x0,z0)=>{setBuild(k);for(let i=0;i<1600;i++){P.x=x0+(i%40)*2.3;P.z=z0+((i/40)|0)*2.4;P.rot=0;const g=ghostPos();if(g.ok)return g}return null}}""")
    # 씨앗 심기 → 단계 → 거두기
    print('farm',await ev("""()=>{S.inv.seed_potato=3;S.inv.potato=0;const g=findSpot('crop_potato',VIL.x-70,VIL.z+40);if(!g)return 'no spot';const n0=invN('seed_potato');placeBuild();setBuild(null);
      const s=structs.find(q=>q.own&&q.t==='crop_potato');window.TQc=s;const r={placed:!!s,used:n0-invN('seed_potato'),at:!!(s&&s.at),stg0:s.stg,geo0:s.m.children[0].geometry===GEO.pc_potato_0,lab0:sLabel(s)};return JSON.stringify(r)}"""))
    await ev("()=>{TQc.at=Date.now()-6*60e3}");await pg.wait_for_timeout(900)
    print('farm1',await ev("""()=>{const s=TQc;P.x=s.x;P.z=s.z+1.05;P.rot=Math.PI;P.cd=0;const t=findTarget();const r={stg:s.stg,geo1:s.m.children[0].geometry===GEO.pc_potato_1,lab:t&&t.lab};
      target=t;inp.actEdge=true;interact();inp.actEdge=false;r.stillThere=structs.includes(s);r.potato=invN('potato');return JSON.stringify(r)}"""))
    await ev("()=>{TQc.at=Date.now()-11*60e3}");await pg.wait_for_timeout(900)
    print('farm2',await ev("""()=>{const s=TQc;P.cd=0;const t=findTarget();const r={stg:s.stg,geo2:s.m.children[0].geometry===GEO.pc_potato_2,lab:t&&t.lab};const d0=(S.pdex&&S.pdex.potato)||0;
      target=t;inp.actEdge=true;interact();inp.actEdge=false;r.gone=!structs.includes(s);r.potato=invN('potato');r.dex=((S.pdex&&S.pdex.potato)||0)-d0;return JSON.stringify(r)}"""))
    # 철거 망치: 심은 밭을 철거 → 씨앗이 돌아와요
    print('hammer',await ev("""()=>{S.inv.dhammer=1;const g=findSpot('crop_wheat',VIL.x-70,VIL.z+46);S.inv.seed_wheat=1;placeBuild();setBuild(null);const s=structs.find(q=>q.own&&q.t==='crop_wheat');
      S.quick[S.sel]='dhammer';P.a.weapon('dhammer');P.x=s.x;P.z=s.z+1.05;P.rot=Math.PI;P.cd=0;const t=findTarget();const r={lab:t&&t.lab,seed0:invN('seed_wheat')};target=t;inp.actEdge=true;interact();inp.actEdge=false;
      r.gone=!structs.includes(s);r.seed=invN('seed_wheat');S.quick[S.sel]=null;P.a.weapon('fist');return JSON.stringify(r)}"""))
    # 곡괭이: 바위 한 번 캘 때 줄어드는 양
    print('pick',await ev("""()=>{let o=null;for(const q of objs.values()){if(q.re>0||q.t!==3)continue;if(dist(q.x,q.z,VIL.x,VIL.z)<70)continue;o=q;break}delete S.inv.axe;const r={};
      for(const w of [null,'pick_adv','pick_elec']){if(w)S.inv[w]=1;S.quick[S.sel]=w;P.a.weapon(w||'fist');o.hp=99;P.x=o.x;P.z=o.z+OBJT[o.t].r+.6;P.rot=Math.PI;P.cd=0;const t=findTarget();target=t;interact();r[w||'fist']=99-o.hp;r.lab=t&&t.lab}
      o.hp=OBJT[o.t].hp;S.quick[S.sel]=null;P.a.weapon('fist');return JSON.stringify(r)}"""))
    # 흰 울타리 두 칸, 랜턴 가로등 하나, 심은 밭 9종(단계 섞기) → 사진
    print('outdoor',await ev("""()=>{S.inv.kit_fwhite=4;S.inv.kit_lamp2=1;for(const i of FARM.ids)S.inv['seed_'+i]=1;const r={};let g=findSpot('fence_white',VIL.x-40,VIL.z+60);placeBuild();const f1=structs.filter(q=>q.own&&q.t==='fence_white').length;
      BPIN.on=true;BPIN.x=g.x+2;BPIN.z=g.z;const g2=ghostPos();r.fence2=g2.ok||g2.why;if(g2.ok)placeBuild();BPIN.on=false;setBuild(null);r.fences=structs.filter(q=>q.own&&q.t==='fence_white').length;
      setBuild('lamp2');BPIN.on=true;BPIN.x=g.x-2.2;BPIN.z=g.z+1.4;let gl=ghostPos();r.lamp=gl.ok||gl.why;if(gl.ok)placeBuild();BPIN.on=false;setBuild(null);
      FARM.ids.forEach((id,i)=>{setBuild('crop_'+id);BPIN.on=true;BPIN.x=g.x-3.4+(i%5)*1.7;BPIN.z=g.z+3.2+((i/5)|0)*1.8;P.x=BPIN.x;P.z=BPIN.z+3;const q=ghostPos();if(q.ok){placeBuild();const s=structs[structs.length-1];s.at=Date.now()-[0,6,11][i%3]*60e3}else r['crop_'+id]=q.why;BPIN.on=false;setBuild(null)});
      r.crops=structs.filter(q=>q.own&&BUILDS[q.t].crop).length;window.TQg=g;P.x=g.x+.5;P.z=g.z+6.5;P.rot=Math.PI;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return JSON.stringify(r)}"""))
    await pg.wait_for_timeout(900);await ev("()=>{zoomK=.85;if(typeof ZOOM!=='undefined')ZOOM.t=null}")
    await shot('p47_farm.jpg',900)
    await ev("()=>{S.time=.93}");await pg.wait_for_timeout(1400)
    print('lampNight',await ev("()=>{const s=structs.find(q=>q.own&&q.t==='lamp2');return JSON.stringify({lit:!!(s&&s.m.children.some(c=>c.isSprite&&c.visible))})}"))
    await shot('p47_night.jpg',200);await ev("()=>{S.time=.42}")
    # 고기잡이 그물: 땅은 막히고 바닷가 물 위는 돼요
    print('fnet',await ev("""()=>{S.inv.kit_fnet=1;setBuild('fnet');P.x=VIL.x-60;P.z=VIL.z+50;P.rot=0;const land=ghostPos();let found=null;
      outer:for(let r=40;r<340&&!found;r+=6)for(let k=0;k<72;k++){const a=k/72*Math.PI*2,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(hAt(x,z)<-.3||hAt(x,z)>1.4||nobAt(x,z,2))continue;
        for(let q=0;q<8;q++){P.x=x;P.z=z;P.rot=q/8*Math.PI*2;const g=ghostPos();if(g.ok){found={x,z};break outer}}}
      const r={land:land.why,found:!!found};if(found){placeBuild();const s=structs.find(q=>q.own&&q.t==='fnet');r.y=s&&+s.m.position.y.toFixed(2);window.TQn=s}setBuild(null);return JSON.stringify(r)}"""))
    await ev("()=>{const s=TQn;if(!s)return;P.x=s.x;P.z=s.z;unstuck();zoomK=.85;updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('p47_fnet.jpg',900)
    # 고급 작업대: 밖은 막히고, 텐트 안에 놓고 누르면 작업대 창
    print('bench2',await ev("""()=>{S.inv.kit_bench2=1;S.inv.kit_tent=1;setBuild('bench2');P.x=VIL.x-60;P.z=VIL.z+40;const out=ghostPos().why;setBuild('ptent');let g=null;
      const clear=(x,z)=>{for(const o of objs.values())if(!(o.re>0)&&Math.abs(o.x-x)<7&&o.z-z<9&&o.z-z>-5)return false;return true};
      for(let k=0;k<1600&&!(g&&g.ok&&clear(g.x,g.z));k++){P.x=VIL.x-80+(k%40)*3.1;P.z=VIL.z-50+((k/40)|0)*3.3;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);return JSON.stringify({out,tent:!!structs.find(s=>s.t==='ptent'&&s.own)})}"""))
    await ev("()=>{const t=structs.find(s=>s.t==='ptent'&&s.own);intEnter(t)}");await pg.wait_for_timeout(1800)
    print('bench2in',await ev("""()=>{const r={on:INT.on};setBuild('bench2');let ok=false;for(let t=0;t<30&&!ok;t++){P.x=INT.x+(t%5-2)*.4;P.z=INT.z-.6+((t/5)|0)*.3;P.rot=Math.PI;const g=ghostPos();if(g.ok&&g.in){placeBuild();ok=true}else r.why=g.why}setBuild(null);
      const s=structs.find(q=>q.own&&q.t==='bench2');r.placed=!!s;if(s){P.x=s.x;P.z=s.z+sdef(s).bz+.75;P.rot=Math.PI;P.cd=0;const t=findTarget();r.lab=t&&t.lab;target=t;inp.actEdge=true;interact();inp.actEdge=false;r.panel=panel}return JSON.stringify(r)}"""))
    await ev("()=>{closePanel();const s=structs.find(q=>q.own&&q.t==='bench2');if(s){P.x=s.x;P.z=s.z+2.2}}");await shot('p47_bench2.jpg',900)
    await ev("()=>{INT.on&&intOut()}");await pg.wait_for_timeout(1200)
    # 저장 → 다시 켜기: 밭·심은 시각·단계 그대로
    print('save',await ev("""()=>{save();const d=JSON.parse(localStorage.getItem(SAVE));const c=d.S.built.filter(b=>BUILDS[b.t]&&BUILDS[b.t].crop);return JSON.stringify({crops:c.length,at:c.every(b=>b.at>0)})}"""))
    await ev("()=>{mode='title'}");await pg.reload()
    for _ in range(60):
        await pg.wait_for_timeout(500)
        if await ev("()=>{try{return mode==='title'&&!!MAPC&&!document.getElementById('title').classList.contains('hide')}catch(e){return false}}"): break
    await ev("()=>document.getElementById('tCont').click()");await pg.wait_for_timeout(2500)
    print('reload',await ev("""()=>{const c=structs.filter(s=>s.own&&BUILDS[s.t]&&BUILDS[s.t].crop);return JSON.stringify({mode,crops:c.length,stages:c.map(s=>s.stg).join(''),geoOk:c.every(s=>s.m.children[0].geometry===GEO['pc_'+BUILDS[s.t].crop+'_'+s.stg]),others:['lamp2','fence_white','fnet','bench2'].map(k=>structs.filter(s=>s.own&&s.t===k).length)})}"""))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
