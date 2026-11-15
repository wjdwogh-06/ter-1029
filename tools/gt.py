'''헤드리스 크롬으로 게임을 띄우고 새 게임을 시작한 뒤, 인자로 받은 스크립트의 steps(pg)를 실행한다.
사용: python3 tools/gt.py tools/check_world.py   (필요: pip install playwright, 크롬. CHROME 환경변수로 경로 지정 가능)'''
import asyncio,sys,subprocess,time,random,json,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'tools','out');os.makedirs(OUT,exist_ok=True)
from playwright.async_api import async_playwright
async def main():
    srv=subprocess.Popen(['python3','-m','http.server','8765','--directory',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
    try:
        async with async_playwright() as p:
            b=await p.chromium.launch(executable_path=os.environ.get('CHROME','/usr/bin/google-chrome'),args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
            c=await b.new_context(viewport={'width':880,'height':400},device_scale_factor=1,has_touch=True,is_mobile=True)
            pg=await c.new_page();errs=[];pg.set_default_timeout(60000)
            pg.on('console',lambda m: errs.append(m.text[:300]) if m.type=='error' and 'GPU stall' not in m.text else None)
            pg.on('pageerror',lambda e: errs.append('PAGE '+str(e)[:400]))
            pg.on('response',lambda r: print('404',r.url) if r.status==404 else None)
            await pg.goto('http://localhost:8765/index.html')
            t0=time.time()
            try: await pg.wait_for_selector('#title:not(.hide)',timeout=120000)
            except Exception as e: print('no title',await pg.inner_text('#loadTx'),errs[:5]);return
            print('boot s',round(time.time()-t0,1));await pg.wait_for_timeout(1500);await pg.screenshot(path=os.path.join(OUT,'title.jpg'),type='jpeg',quality=85)
            await pg.click('#tNew');await pg.wait_for_timeout(2500);await pg.screenshot(path=os.path.join(OUT,'play.jpg'),type='jpeg',quality=85)
            await globals()['steps'](pg) if 'steps' in globals() else None
            print('errs',errs[:8])
            await b.close()
    finally: srv.kill()
if len(sys.argv)>1: exec(open(sys.argv[1]).read())
asyncio.run(main())
