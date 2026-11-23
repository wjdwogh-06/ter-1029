# 64차(디자인): 요리 30종 — 아이템·그림·아이콘·자판기·먹기(에너지)
# 기대: ok true, errs []  · 그림만: tools/p64_view.py → tools/out/p64_icons.png
import json
async def steps(pg):
    ev=pg.evaluate
    r=json.loads(await ev("""()=>{const L=DISHES.map(d=>d[0]),pool=vendPool();const o={n:L.length,noItem:L.filter(k=>!ITEMS[k]||ITEMS[k].ty!=='food'||!(ITEMS[k].food>0)||!(ITEMS[k].p>0)),noGeo:L.filter(k=>!GEO['ds_'+k]),noIcon:L.filter(k=>!/^data:image/.test(ICON[k]||'')),
      notVend:L.filter(k=>!pool.includes(k)),rare:L.filter(k=>ITEMS[k].rare).length,cat:[lkCatOf('dish_steak'),lkCatOf('dish_feast')],dupName:L.length-new Set(L.map(k=>ITEMS[k].n)).size,noStruct:L.filter(k=>BUILDS[k]).length};
      S.hp=30;S.inv.dish_steak=1;const h0=S.hp;useItem('dish_steak');o.eat=[h0,S.hp,S.inv.dish_steak||0];return JSON.stringify(o)}"""))
    r['ok']=r['n']==30 and not r['noItem'] and not r['noGeo'] and not r['noIcon'] and not r['notVend'] and r['rare']==6 and r['cat']==['food','rare'] and r['dupName']==0 and r['noStruct']==0 and r['eat'][1]>r['eat'][0] and r['eat'][2]==0
    print('dishes',json.dumps(r,ensure_ascii=False));print('ALL',r['ok'])
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
