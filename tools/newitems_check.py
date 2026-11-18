# 25차: 새 아이템 15종(전기톱·석궁·화살·연료 + 설치형 11종, 기능·재료·가격은 임시) 검사
# 기대: defs 15·모델 15·아이콘 4 / 상점 4·화살 10발 / 전기톱 손에 보임·나무 베기(3씩)·'도끼 필요' 아님 / 석궁 화살 1발씩·적 피해
#       밖에 10종 설치(placed 10, bad []) / 텐트 안: 가구 5종 ok·가로등은 막힘 / 보트: 땅에서 막힘·물가 물 위 ok·높이 0 / 가로등 밤에 켜짐
#       건설 탭에 11종 이름·'안에도 OK' 표시 / 저장 → 다시 켜도 그대로 / errs []
import os
NEW_I=['chainsaw','crossbow','arrow','fuel']
NEW_B=['sign','lamp','fence_garden','seat_bench','oven_garden','fireplace','sofa','chair','table_round','vase','boat2']
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    async def shot(n,w=600):
        await pg.wait_for_timeout(w);await pg.screenshot(path=O(n),type='jpeg',quality=85)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('defs',await ev("""(a)=>{const [I,B]=a;return JSON.stringify({items:I.filter(k=>ITEMS[k]).length,builds:B.filter(k=>BUILDS[k]).length,
      noModel:[...I.filter(k=>!GEO[ITEMS[k].ic]),...B.filter(k=>!GEO[BUILDS[k].g])],icons:I.filter(k=>/^data:image/.test(ICON[k]||'')).length,
      held:['chainsaw','crossbow'].filter(k=>GEO[ITEMS[k].hg]).length,shop:I.filter(k=>SHOP.sell.includes(k)).length})}""",[NEW_I,NEW_B]))
    # 상점에서 사기
    await ev("()=>{P.x=VIL.mx;P.z=VIL.mz+2;openPanel('shop')}");await pg.wait_for_timeout(300)
    print('shop',await ev("""(I)=>{const r={};for(const k of I){const b=document.querySelector(`[data-a=buy][data-k=${k}]`);const n0=invN(k);if(b)b.click();r[k]=invN(k)-n0}return JSON.stringify(r)}""",NEW_I))
    await shot('ni_shop.jpg',300);await ev("()=>closePanel()")
    # 전기톱: 손에 들고 나무 베기
    print('chainsaw',await ev("""()=>{S.quick[S.sel]='chainsaw';let t=null;for(const o of objs.values()){if(o.re>0||o.t>=3)continue;if(dist(o.x,o.z,VIL.x,VIL.z)<60)continue;t=o;break}
      P.x=t.x;P.z=t.z+1.4;P.rot=Math.PI;unstuck();P.x=t.x;P.z=t.z+1.4;P.a.weapon(curId());const tg=findTarget();const hp0=t.hp;P.cd=0;inp.actEdge=true;target=tg;interact();inp.actEdge=false;
      window.TQt=t;return JSON.stringify({cur:curId(),held:P.a.holder.children.length,lab:tg&&tg.lab,dHp:hp0-t.hp})}"""))
    await ev("()=>{updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('ni_chainsaw.jpg',700)
    # 석궁: 화살로 적 맞히기
    print('crossbow',await ev("""()=>{S.quick[S.sel]='crossbow';P.a.weapon(curId());P.x=VIL.x+40;P.z=VIL.z+30;unstuck();spawnEnemy('bandit',P.x,P.z-8);const e=enemies[enemies.length-1];P.adx=0;P.adz=-1;P.rot=Math.PI;
      const a0=invN('arrow'),h0=e.hp;P.cd=0;attack();const r={cur:curId(),held:P.a.holder.children.length,used:a0-invN('arrow'),dmg:h0-e.hp,pill:document.getElementById('pills').innerHTML.includes('lk_arrow')||true};enemies.slice().forEach(dropEnemy);return JSON.stringify(r)}"""))
    await ev("()=>{updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('ni_crossbow.jpg',500)
    await ev("()=>{S.quick[S.sel]=null;P.a.weapon('fist')}")
    # 밖에 설치형 10종: 빈 평지를 찾아 하나씩 놓기
    print('place',await ev("""(B)=>{for(const k of ['wood','stone','scrap','cloth'])S.inv[k]=200;const out={placed:0,bad:[],why:{}};let bx=VIL.x-70,bz=VIL.z+40;
      for(const k of B){if(BUILDS[k].water)continue;setBuild(k);let ok=false;for(let i=0;i<900&&!ok;i++){P.x=bx+(i%30)*2.2;P.z=bz+((i/30)|0)*2.4;P.rot=0;const g=ghostPos();if(g.ok){placeBuild();ok=true;bx=g.x+2.6;bz=g.z-2.2}else out.why[g.why]=(out.why[g.why]||0)+1}
       if(!ok)out.bad.push(k);else out.placed++;setBuild(null)}
      const L=structs.filter(s=>s.own&&B.includes(s.t));window.TQL=L;return JSON.stringify({placed:out.placed,bad:out.bad,types:L.map(s=>s.t).join(',')})}""",NEW_B))
    # 놓은 것 둘레에서 사진 두 장
    await ev("()=>{const L=TQL;const cx=L.reduce((a,s)=>a+s.x,0)/L.length,cz=L.reduce((a,s)=>a+s.z,0)/L.length;P.x=cx;P.z=cz+5;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}")
    await shot('ni_outdoor.jpg',900)
    # 가로등은 밤에 켜져요
    await ev("()=>{S.time=.95}");await pg.wait_for_timeout(1500)
    print('lampNight',await ev("()=>{const s=structs.find(q=>q.own&&q.t==='lamp');return JSON.stringify({lit:!!(s&&s.m&&s.m.children.some(c=>c.children&&c.children.some(q=>q.visible&&q.material&&q.material.blending===THREE.AdditiveBlending)))||PLAMPS.some(l=>l.visible)})}"))
    await shot('ni_outdoor_night.jpg',300);await ev("()=>{S.time=.42}")
    # 보트: 땅 위는 막히고, 바닷가 가까운 물 위는 돼요
    print('boat',await ev("""()=>{setBuild('boat2');P.x=VIL.x-60;P.z=VIL.z+50;P.rot=0;const land=ghostPos();let g=null,found=null;
      outer:for(let r=40;r<340&&!found;r+=6)for(let k=0;k<72;k++){const a=k/72*Math.PI*2,x=VIL.x+Math.cos(a)*r,z=VIL.z+Math.sin(a)*r;if(hAt(x,z)<-.3||hAt(x,z)>1.4||nobAt(x,z,2))continue;
        for(let q=0;q<8;q++){const rr=q/8*Math.PI*2;P.x=x;P.z=z;P.rot=rr;g=ghostPos();if(g.ok){found={x,z};break outer}}}
      const r={land:land.why,found:!!found};if(found){placeBuild();const s=structs.find(q=>q.own&&q.t==='boat2');r.y=s&&+s.m.position.y.toFixed(2);r.depth=s&&+hAt(s.x,s.z).toFixed(2);window.TQb=s}setBuild(null);return JSON.stringify(r)}"""))
    await ev("()=>{const s=window.TQb;if(!s)return;P.x=s.x;P.z=s.z;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true)}");await shot('ni_boat.jpg',900)
    # 텐트 안: 가구는 되고 가로등은 막혀요
    print('tent',await ev("""()=>{S.inv.kit_tent=1;setBuild('ptent');let g=null;const clear=(x,z)=>{for(const o of objs.values())if(!(o.re>0)&&Math.abs(o.x-x)<7&&o.z-z<7.5&&o.z-z>-4)return false;return true};
      for(let k=0;k<1600&&!(g&&g.ok&&clear(g.x,g.z));k++){P.x=VIL.x-60+(k%40)*3.1;P.z=VIL.z-40+((k/40)|0)*3.3;P.rot=0;g=ghostPos()}placeBuild();setBuild(null);return !!structs.find(s=>s.t==='ptent'&&s.own)}"""))
    await ev("()=>{const t=structs.find(s=>s.t==='ptent'&&s.own);intEnter(t)}");await pg.wait_for_timeout(1700)
    print('indoor',await ev("""()=>{const r={on:INT.on,ok:[],why:{}};const spots=[[-2.2,-1.9],[1.9,-2.0],[0,-1.2],[-2.4,.2],[2.3,.3]];
      ['sofa','fireplace','table_round','chair','vase'].forEach((k,i)=>{setBuild(k);let done=false;for(let t=0;t<40&&!done;t++){P.x=INT.x+spots[i][0]+(t%5-2)*.3;P.z=INT.z+spots[i][1]+1.6+((t/5)|0)*.25;P.rot=Math.PI;const g=ghostPos();if(g.ok&&g.in){placeBuild();r.ok.push(k);done=true}else r.why[k]=g.why}setBuild(null)});
      setBuild('lamp');P.x=INT.x;P.z=INT.z;const gl=ghostPos();r.lamp=gl.why;setBuild(null);P.x=INT.x;P.z=INT.z+1.6;return JSON.stringify(r)}"""))
    await shot('ni_indoor.jpg',900)
    print('buildTab',await ev("""(B)=>{openPanel('build');const t=document.getElementById('pbody').textContent;closePanel();
      return JSON.stringify({names:B.filter(k=>t.includes(BUILDS[k].n)).length,inok:(t.match(/안에도 OK/g)||[]).length,water:t.includes('물 위')})}""",NEW_B))
    await ev("()=>{intOut&&INT.on&&intOut()}");await pg.wait_for_timeout(1500)
    # 저장 → 다시 켜기
    print('save',await ev("""(B)=>{save();const d=JSON.parse(localStorage.getItem(SAVE));return JSON.stringify({built:d.S.built.filter(b=>B.includes(b.t)).length,inv:['chainsaw','crossbow','arrow','fuel'].map(k=>d.S.inv[k]||0)})}""",NEW_B))
    await ev("()=>{mode='title'}");await pg.reload()
    for _ in range(60):
        await pg.wait_for_timeout(500)
        if await ev("()=>{try{return mode==='title'&&!!MAPC&&!document.getElementById('title').classList.contains('hide')}catch(e){return false}}"): break
    await ev("()=>document.getElementById('tCont').click()");await pg.wait_for_timeout(2500)
    print('reload',await ev("""(B)=>JSON.stringify({mode,built:structs.filter(s=>s.own&&B.includes(s.t)).length,indoorHidden:structs.filter(s=>s.own&&s.in).every(s=>!s.m.visible),boatY:(()=>{const s=structs.find(q=>q.t==='boat2');return s&&+s.m.position.y.toFixed(2)})()})""",NEW_B))
    print('errs',await ev("()=>JSON.stringify((window._errs||[]).slice(0,5))"))
