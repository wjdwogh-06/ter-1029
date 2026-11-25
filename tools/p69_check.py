# 69차: 수달섬(요리·사냥 상인 섬) + 씨앗 제작법 + 통조림·붕대·천·산딸기 삭제
# 기대: ALL True, errs [] · 사진 tools/out/p69_top.jpg, p69_bridge.jpg, p69_cook.jpg, p69_hunt.jpg, p69_gate.jpg
import json,os
async def steps(pg):
    ev=pg.evaluate
    O=lambda n:os.path.join(OUT,n)
    await ev("""()=>{window.goWalk=(pts,r=.42)=>{P.x=pts[0][0];P.z=pts[0][1];let maxRise=0,prevY=stepY(P.x,P.z);
      for(let k=1;k<pts.length;k++){const [tx,tz]=pts[k];let guard=0;while(Math.hypot(tx-P.x,tz-P.z)>.12&&guard++<4000){const L=Math.hypot(tx-P.x,tz-P.z),dx=(tx-P.x)/L*.08,dz=(tz-P.z)/L*.08;
        const ok=moveEnt(P,dx,dz,r),L2=Math.hypot(tx-P.x,tz-P.z);if(!ok||L2>L-.03||guard>=3999)return{stuck:[+P.x.toFixed(1),+P.z.toFixed(1)],seg:k,y:+stepY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)};const y=stepY(P.x,P.z);maxRise=Math.max(maxRise,y-prevY);prevY=y}}
      return{stuck:null,y:+stepY(P.x,P.z).toFixed(2),maxRise:+maxRise.toFixed(2)}}}""")
    r=json.loads(await ev("""()=>{const o={};const b=OTB;o.built=!!b&&!!GEO.ot_cookstall;o.miss=OTR.miss;o.len=b&&+b.len.toFixed(1);o.fenceN=b&&b.fence&&b.fence.length;
      o.gate=structs.filter(s=>s.t==='cgate'&&Math.hypot(s.x-OTR.x,s.z-OTR.z)<60).length;o.safe=!!inSafe(OTR.x,OTR.z);o.safeIdx=PORT_SAFE.length;o.nob=NOB.some(q=>q.k==='otter');
      o.nobMsg=(()=>{const n=nobAt(OTR.x+5,OTR.z+5,1);return n?n.k:null})();
      o.seeds=RECIPES.filter(x=>/^seed_/.test(x.id)).length;o.seedItems=Object.keys(ITEMS).filter(k=>/^seed_/.test(k)).length;
      o.gone=['can','bandage','cloth','berry'].filter(k=>ITEMS[k]||vendPool().includes(k));o.berryObjs=0;objs.forEach(q=>{if(OBJT[q.t]&&OBJT[q.t].berry)o.berryObjs++});
      o.recipeBad=RECIPES.filter(x=>Object.keys(x.c).some(k=>!ITEMS[k])||!ITEMS[x.id]).map(x=>x.id);
      o.lootBad=LOOT.filter(l=>!ITEMS[l[0]]&&l[0]!=='coin').length;
      o.npc={cook:OTN.cook.x!==undefined,hunt:OTN.hunt.x!==undefined,gap:+Math.hypot(OTN.cook.x-OTN.hunt.x,OTN.cook.z-OTN.hunt.z).toFixed(1)};
      return JSON.stringify(o)}"""))
    # 씨앗 만들기 · 옛 저장 정리
    r['craft']=json.loads(await ev("""()=>{const o={};S.inv.wheat=8;openPanel('bench');CG.adv=0;cgFill(RECIPES.findIndex(x=>x.id==='seed_wheat'));o.match=cgMatch()&&cgMatch().id;cgMake(999);o.seed=invN('seed_wheat');o.wheat=invN('wheat');cgReturn();closePanel();
      S.inv.can=3;S.inv.cloth=2;S.box=S.box||{};S.box.__t={d:S.day,c:[['can',2],['wood',3],null,['bandage',1]]};dropRemoved();o.inv=[S.inv.can||0,S.inv.cloth||0];o.box=S.box.__t.c.filter(Boolean).map(q=>q[0]);delete S.box.__t;return JSON.stringify(o)}"""))
    # 다리 ↔ 문 ↔ 섬 걷기
    r['walk']=json.loads(await ev("""()=>{const o={},b=OTB;DEV.on=0;const g=structs.find(s=>s.t==='cgate'&&Math.hypot(s.x-b.G[0],s.z-b.G[1])<1);g.open=false;
      const main=[b.S1[0]+b.dx*4,b.S1[1]+b.dz*4],in1=[b.G[0]-b.dx*3.5,b.G[1]-b.dz*3.5];
      o.closed=goWalk([main,b.S1,b.S0,b.G,in1]);g.open=true;g.ot=performance.now()+1e9;o.open=goWalk([main,b.S1,b.S0,b.G,in1]);
      const c=OTN.cook,h=OTN.hunt,W=(s,v)=>otW(s,v);o.toCook=goWalk([in1,W(20,0),W(9,-1),[c.x+.3,c.z+7.6],[c.x+.3,c.z+2.2]]);o.toHunt=goWalk([in1,W(20,0),W(9,-1),[h.x+2.9,h.z+.98-12.5],[h.x+2.4,h.z+.98-2],[h.x+2.3,h.z+.98+1.3],[h.x,h.z+.98+2.4]]);   /* 82차: 길 = 문 → 가운데 마당 → 두 상인 */
      o.toFarm=goWalk([in1,W(20,0),W(9,-1),W(-4,-5),W(-16,-6),W(-24,-5)]);o.toRange=goWalk([in1,W(20,0),W(9,-1),[h.x+2.9,h.z+.98-12.5],W(-6,7),W(-16,6),W(-26,4)]);o.back=goWalk([in1,b.G,b.S0,b.S1,main]);
      /* 다리 옆으로 떨어지기 */const mid=[b.S0[0]+b.dx*b.len*.5,b.S0[1]+b.dz*b.len*.5];o.side=goWalk([mid,[mid[0]+b.px*3,mid[1]+b.pz*3]]);o.midY=+groundY(mid[0],mid[1]).toFixed(2);
      /* 문 닫고 안에서 바깥으로 나가 보기(24방향) */g.open=false;let esc=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2,tx=OTR.x+Math.cos(a)*62,tz=OTR.z+Math.sin(a)*62;const w=goWalk([[OTR.x,OTR.z],[tx,tz]]);if(!w.stuck)esc.push(i)}o.escape=esc;
      return JSON.stringify(o)}"""))
    # 상인 말 걸기 · 안전 구역 알약
    await ev("()=>{const c=OTN.cook;P.x=c.x;P.z=c.z+1.95;P.rot=Math.PI}")
    await pg.wait_for_timeout(900)
    r['talk']=json.loads(await ev("""()=>{const o={};findTarget();o.label=target&&target.k==='s'?sLabel(target.s):null;inp.actEdge=true;interact();inp.actEdge=false;o.said=!!(CHAT.b&&CHAT.b.has('ot_cook'));o.actor=!!OTN.cook.a;
      const sp=document.getElementById('safeP');o.safePill=!!sp&&getComputedStyle(sp).display!=='none';
      setBuild('fence');S.inv.wood=20;P.rot=0;const gp=ghostPos();o.buildWhy=gp.why||null;setBuild(null);return JSON.stringify(o)}"""))
    # 사진
    await ev("()=>{P.a.root.visible=true;const c=OTN.cook;P.x=c.x+1.6;P.z=c.z+2.6}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('p69_cook.jpg'),type='jpeg',quality=82)
    await ev("()=>{const h=OTN.hunt;P.x=h.x-1.2;P.z=h.z+2.8}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('p69_hunt.jpg'),type='jpeg',quality=82)
    await ev("()=>{const b=OTB;P.x=b.G[0]+b.dx*3;P.z=b.G[1]+b.dz*3+1.5}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('p69_gate.jpg'),type='jpeg',quality=82)
    await ev("()=>{const b=OTB;P.x=b.S0[0]+b.dx*b.len*.55;P.z=b.S0[1]+b.dz*b.len*.55}")
    await pg.wait_for_timeout(1200);await pg.screenshot(path=O('p69_bridge.jpg'),type='jpeg',quality=82)
    await ev("()=>{P.x=OTR.x+6;P.z=OTR.z+2;zoomK=1.3}")
    await pg.wait_for_timeout(1400);await pg.screenshot(path=O('p69_top.jpg'),type='jpeg',quality=82)
    w=r['walk'];c=r['craft'];t=r['talk']
    r['ok']=(r['built'] and not r['miss'] and r['gate']==1 and r['safe'] and r['nob'] and r['nobMsg']=='otter' and r['seeds']==r['seedItems']>=14 and not r['gone'] and r['berryObjs']==0
      and not r['recipeBad'] and r['lootBad']==0 and r['npc']['gap']>25 and c['match']=='seed_wheat' and c['seed']==2 and c['wheat']==0 and c['inv']==[0,0] and c['box']==['wood']
      and w['closed']['stuck'] is not None and w['open']['stuck'] is None and w['open']['maxRise']<=.56 and w['toCook']['stuck'] is None and w['toHunt']['stuck'] is None and w['toFarm']['stuck'] is None and w['toRange']['stuck'] is None and w['back']['stuck'] is None
      and w['side']['stuck'] is not None and not w['escape'] and t['label']=='말 걸기' and t['said'] and t['actor'] and t['safePill'] and t['buildWhy'] and '설치 금지' in t['buildWhy'])
    print('p69',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
