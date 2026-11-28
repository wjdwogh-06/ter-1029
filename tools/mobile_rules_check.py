"""python3 tools/gt.py tools/mobile_rules_check.py"""
async def steps(pg):
    await pg.wait_for_function("mode === 'play'")
    await pg.evaluate("""() => {
      S.inv = {f_herring: 3, salt: 2}; S.quick.fill(null);
      P.dead = false; busy = false;
      openPanel('cook');
    }""")
    await pg.locator('[data-a="cookAdd"][data-k="f_herring"]').dispatch_event('click')
    assert '3초' in await pg.locator('[data-a="cookFinish"]').inner_text()
    await pg.screenshot(path=os.path.join(OUT,'mobile-cook.jpg'),type='jpeg')
    await pg.locator('[data-a="cookFinish"]').dispatch_event('click')
    assert await pg.evaluate("cookJob !== null && !invN('cf_herring') && invN('f_herring') === 3")
    await pg.wait_for_function("invN('cf_herring') === 1", timeout=20000)
    assert await pg.evaluate("invN('f_herring') === 2 && S.cdex.cf_herring === 1")
    await pg.evaluate("""() => {
      cookAction('cookAdd', {dataset:{k:'salt'}});
      cookAction('cookAdd', {dataset:{k:'f_herring'}});
      renderPanel();
    }""")
    assert '5초' in await pg.locator('[data-a="cookFinish"]').inner_text()
    await pg.locator('[data-a="cookFinish"]').dispatch_event('click')
    passed = await pg.evaluate("""() => {
      const cancelled = cookJob;
      closePanel();openPanel('cook');updateCooking(cancelled);
      if (cookJob || invN('salt') !== 2 || invN('dish_saltfish')) return false;
      for (const [id, recipe] of Object.entries(DISH_RECIPES)) {
        const parts = recipe.split(' ').map(k => k === 'fish' ? 'f_herring' : k);
        if (cookResult(parts) !== id) return false;
      }
      return cookSeconds(DISH_RECIPES.dish_feast.split(' ')) === 8;
    }""")
    assert passed
    assert await pg.evaluate("""() => {
      cookSlots[0]='salt';cookSlots[1]='f_herring';
      cookAction('cookFinish', {});const job=cookJob;
      cookAction('cookFinish', {});
      if (!job || cookJob !== job) return false;
      job.end=0;updateCooking(job);updateCooking(job);
      if (invN('dish_saltfish')!==1 || invN('salt')!==1 || S.st.cook!==2) return false;
      cookSlots[0]='f_herring';cookAction('cookFinish', {});
      const pending=cookJob;take('f_herring',1);pending.end=0;updateCooking(pending);
      return S.st.cook===2 && !cookJob && invN('cf_herring')===1;
    }""")
    assert await pg.evaluate("""() => {
      closePanel();const sent=[], send=NET.send, online=NET.on;
      try {
        NET.on=true;NET.send=m=>sent.push(m);
        S.inv.pistol=1;S.quick[S.sel]='pistol';P.cd=0;delete S.inv.ammoS;
        attack();if(sent.length) return false;
        S.inv.ammoS=1;P.cd=0;attack();attack();
        if(sent.length!==1 || sent[0].t!=='f' || invN('ammoS')) return false;
        S.quick[S.sel]=null;P.cd=0;attack();
        return sent.length===2;
      } finally { NET.send=send;NET.on=online }
    }""")
    assert await pg.evaluate("""() => {
      Object.assign(RJ,{id:88,md:'aim',aim:1,q:{t:Infinity}});
      joy.id=87;inp.mx=1;GUN.bl=2;GUN.hold=1;
      window.dispatchEvent(new Event('blur'));
      return RJ.id===null && !RJ.q && joy.id===null && !GUN.bl && !inp.mx && !inp.fire;
    }""")
    await pg.evaluate("openPanel('help')")
    assert '점사 소총' in await pg.locator('#pbody').inner_text()
    await pg.screenshot(path=os.path.join(OUT,'mobile-help.jpg'),type='jpeg')
    print("PASS: cooked fish, cancellation, recipes, single completion, inventory, fire input, blur and help")
