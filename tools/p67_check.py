# 67차: 제작법 — 개수·겹침 없음·아이콘, 한 칸에 하나, 총 모양(뒤집기)·재료만 맞추기, 고급 작업대 전용, 전부 만들기, 울타리·포탑 키트 설치, 고급 회로기판 없음
# 기대: ALL True, errs [] · 사진 tools/out/p67_bench.jpg
import json,os
async def steps(pg):
    ev=pg.evaluate
    r=json.loads(await ev("""()=>{const o={n:RECIPES.length,ids:RECIPES.map(x=>x.id)};const keys={};o.dup=[];for(const x of RECIPES){if(x.pat)continue;const k=crKey(x.c);if(keys[k])o.dup.push(keys[k]+'/'+x.id);keys[k]=x.id}
      o.over6=RECIPES.filter(x=>Object.values(x.c).reduce((a,b)=>a+b,0)>6).map(x=>x.id);o.noIcon=[...new Set(RECIPES.flatMap(x=>[x.id,...Object.keys(x.c)]))].filter(k=>!/^data:image/.test(ICON[k]||''));
      o.pcb2=!!ITEMS.pcb2||vendPool().includes('pcb2');o.notCraft=['axe','ammoS','rod','hat_lumber','shoes_boot','bag_travel','kit_bench','kit_bench2','kit_paintbench','kit_sofa','kit_rug_rect'].filter(k=>RECIPES.some(x=>x.id===k));
      o.turretKit=[ITEMS.kit_turret.ty,BUILDS.turret.kit,ITEMS.turret_auto.ty];return JSON.stringify(o)}"""))
    # 작업대 창에서 실제로 만들기
    t=json.loads(await ev("""()=>{const o={};const give0=(c)=>{for(const k in c)S.inv[k]=(S.inv[k]||0)+c[k]};openPanel('bench');CG.adv=0;
      /* 한 칸에 하나 */ S.inv.wood=10;CG.sel='wood';cgPut(0);o.onePer=(cgGrid()[0]&&cgGrid()[0].n)||0;cgPut(0);o.toggle=!cgGrid()[0];cgPut(0);cgPut(1);cgPut(2);o.fence=cgMatch()&&cgMatch().id;
      cgMake(999);o.fenceMade=S.inv.kit_fence||0;cgReturn();
      /* 총: 모양·뒤집기 */ give0({gp_sstock:1,gkit_pistol:1,gp_sbarrel:1,mparts:1});const g=cgGrid();g[0]={id:'gp_sbarrel',n:1};g[1]={id:'gkit_pistol',n:1};g[2]={id:'gp_sstock',n:1};g[4]={id:'mparts',n:1};
      for(const k of ['gp_sstock','gkit_pistol','gp_sbarrel','mparts'])S.inv[k]--;o.gunMirror=cgMatch()&&cgMatch().id;g[4]=null;g[3]={id:'mparts',n:1};o.gunBad=cgMatch()&&cgMatch().id||null;g[3]=null;g[4]={id:'mparts',n:1};
      cgMake(1);o.pistol=invN('pistol');cgReturn();
      /* 고급 작업대 전용 */ give0({plastic:2,mparts:1});cgFill(RECIPES.findIndex(x=>x.id==='att_grip'));cgMake(1);o.gripNormal=invN('att_grip');CG.adv=1;cgMake(1);o.gripAdv=invN('att_grip');cgReturn();CG.adv=0;
      /* 포탑 */ give0({kit_turret:1,pcb:1,rifle:1,mparts:1,ore_ti:1});cgFill(RECIPES.findIndex(x=>x.id==='turret_auto'));cgMake(1);o.turret=invN('turret_auto');o.kitLeft=invN('kit_turret');
      /* 판자 ×2 전부 */ S.inv.wood=6;cgFill(RECIPES.findIndex(x=>x.id==='plank'));cgMake(999);o.plank=invN('plank');o.woodLeft=invN('wood');closePanel();return JSON.stringify(o)}"""))
    r['t']=t
    await ev("()=>{S.inv.wood=12;S.inv.mparts=3;S.inv.bar_iron=6;S.inv.cloth=4;openPanel('bench');CG.adv=1;const g=cgGrid();g[0]={id:'gp_wstock',n:1};g[1]={id:'gkit_rifle',n:1};g[2]={id:'gp_rbarrel',n:1};g[4]={id:'mparts',n:1};S.inv.gp_wstock=0;S.inv.gkit_rifle=0;renderPanel()}")
    await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,'p67_bench.jpg'),type='jpeg',quality=82)
    await ev("()=>{cgReturn();closePanel()}")
    # 울타리·포탑 키트로 설치
    r['place']=json.loads(await ev("""()=>{const o={};const tryB=(k,b)=>{setBuild(b);let ok=false;for(let a=0;a<900&&!ok;a++){const rr=40+a*.4,an=a*.7;P.x=VIL.x+Math.cos(an)*rr;P.z=VIL.z+Math.sin(an)*rr;if(hAt(P.x,P.z)<.95||nobAt(P.x,P.z,4))continue;P.rot=0;const gp=ghostPos();window.__w=gp.why;if(gp.ok){const n0=invN(k);placeBuild();ok=invN(k)===n0-1}}o['why_'+b]=window.__w;setBuild(null);return ok};
      S.inv.kit_fence=2;o.fence=tryB('kit_fence','fence');S.inv.turret_auto=1;o.turret=tryB('turret_auto','turret');S.inv.kit_gwood=1;o.gwood=tryB('kit_gwood','gate_wood');const s=structs.find(q=>q.own&&q.t==='turret');
      if(s){P.x=s.x;P.z=s.z+1.5;setBuild('demo');const n0=invN('turret_auto');demoAt?demoAt(s.x,s.z):0;placeBuild();o.demoBack=invN('turret_auto')-n0;setBuild(null)}return JSON.stringify(o)}"""))
    p=r['place'];t=r['t']
    r['ok']=(not r['dup'] and not r['over6'] and not r['noIcon'] and not r['pcb2'] and not r['notCraft'] and r['turretKit']==['res','turret_auto','kit']
      and t['onePer']==1 and t['toggle'] and t['fence']=='kit_fence' and t['fenceMade']>=1 and t['gunMirror']=='pistol' and t['gunBad'] is None and t['pistol']==1
      and t['gripNormal']==0 and t['gripAdv']==1 and t['turret']==1 and t['kitLeft']==0 and t['plank']==6 and t['woodLeft']==0 and p['fence'] and p['turret'] and p['gwood'])
    print('p67',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
