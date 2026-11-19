# 33차 검사: 관리자 모드 크리에이티브 블록(쌓기·옆면·끌어 칠하기·지우기·되돌리기·저장·불러오기·클라우드 저장 흉내) + 설치는 누른 곳에, 철거는 누른 건물
# 진짜 터치(CDP). 기대: 각 줄 ok true, ALL True, errs []
import os, json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);window.updSpawns=()=>{};localStorage.removeItem('frontisle_blocks');let k=0;for(;k<80;k++){P.x=VIL.x+24+(k%9)*6;P.z=VIL.z+30+((k/9)|0)*6;unstuck();let ok=true;for(let dx=-6;dx<=6;dx+=2)for(let dz=-8;dz<=2;dz+=2){if(hAt(P.x+dx,P.z+dz)<.95||structs.some(s=>dist(s.x,s.z,P.x+dx,P.z+dz)<2.5))ok=false}if(ok)break}P.yv=undefined;P.rot=0;DEV.on=true;devHud()}")
    await pg.wait_for_timeout(600)
    cdp=await pg.context.new_cdp_session(pg)
    async def T(t,pts): await cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    async def tap(x,y,i=7):
        await T('touchStart',[(i,x,y)]);await pg.wait_for_timeout(160);await T('touchEnd',[(i,x,y)]);await pg.wait_for_timeout(250)
    res={}
    # 켜기
    b=await ev("()=>{const r=document.getElementById('devCre').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    await tap(b[0],b[1]);r=await ev("()=>JSON.stringify({on:CRV.on,bar:getComputedStyle(document.getElementById('creBar')).display})");res['on']=json.loads(r);res['on']['ok']=res['on']['on'] and res['on']['bar']!='none'
    # 1) 땅을 누르면 한 칸
    sp=await ev("()=>{const x=Math.floor(P.x)+3,z=Math.floor(P.z)-4,k=crvBase(x,z),q=scr(x+.5,groundY(x+.5,z+.5)+.02,z+.5);window._C=[x,z,k];return q}")
    await tap(sp[0],sp[1]);await pg.wait_for_timeout(200)
    r=await ev("()=>{const [x,z,k]=_C;return JSON.stringify({n:CRV.map.size,has:CRV.map.has(crvKey(x,z,k)),k})}");R=json.loads(r);R['ok']=R['n']==1 and R['has'];res['ground']=R
    # 2) 윗면을 누르면 위에
    sp=await ev("()=>{const [x,z,k]=_C;return scr(x+.5,k+1.0,z+.5)}")
    await tap(sp[0],sp[1])
    r=await ev("()=>{const [x,z,k]=_C;return JSON.stringify({n:CRV.map.size,up:CRV.map.has(crvKey(x,z,k+1))})}");R=json.loads(r);R['ok']=R['n']==2 and R['up'];res['top']=R
    # 3) 옆면(카메라 쪽 +z 면)을 누르면 앞에
    sp=await ev("()=>{const [x,z,k]=_C;return scr(x+.5,k+.5,z+1.0)}")
    await tap(sp[0],sp[1])
    r=await ev("()=>{const [x,z,k]=_C;return JSON.stringify({n:CRV.map.size,front:CRV.map.has(crvKey(x,z+1,k))})}");R=json.loads(r);R['ok']=R['n']==3 and R['front'];res['side']=R
    # 4) 누른 채 끌면 같은 층에 줄지어
    pts=await ev("()=>{const [x,z,k]=_C;const out=[];for(let i=0;i<=6;i++){out.push(scr(x-3-i+.5,k+.5,z-3+.5))}return out}")
    await T('touchStart',[(8,pts[0][0],pts[0][1])]);await pg.wait_for_timeout(200)
    for p in pts[1:]:
        await T('touchMove',[(8,p[0],p[1])]);await pg.wait_for_timeout(60)
    await T('touchEnd',[(8,pts[-1][0],pts[-1][1])]);await pg.wait_for_timeout(300)
    r=await ev("()=>{const [x,z,k]=_C;let row=0;for(let i=0;i<=6;i++)if(CRV.map.has(crvKey(x-3-i,z-3,k)))row++;return JSON.stringify({n:CRV.map.size,row,undo:CRV.undo.length})}");R=json.loads(r);R['ok']=R['row']>=6;res['drag']=R
    await pg.screenshot(path=O('p33_blocks.jpg'),type='jpeg',quality=85)
    # 5) 지우기 → 되돌리기
    db=await ev("()=>{const r=document.querySelector('#creBar [data-c=del]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");await tap(db[0],db[1])
    n0=await ev("()=>CRV.map.size");sp=await ev("()=>{const [x,z,k]=_C;return scr(x+.5,k+2.0,z+.5)}");await tap(sp[0],sp[1])
    n1=await ev("()=>CRV.map.size")
    ub=await ev("()=>{const r=document.querySelector('#creBar [data-c=undo]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");await tap(ub[0],ub[1])
    n2=await ev("()=>CRV.map.size");res['del+undo']={'n0':n0,'n1':n1,'n2':n2,'ok':n1==n0-1 and n2==n0}
    ab=await ev("()=>{const r=document.querySelector('#creBar [data-c=add]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");await tap(ab[0],ab[1])
    # 6) 두 손가락 확대 중에는 안 쌓임
    n3=await ev("()=>CRV.map.size")
    await T('touchStart',[(11,420,200),(12,520,200)])
    for k in range(1,6):
        await T('touchMove',[(11,420-k*12,200),(12,520+k*12,200)]);await pg.wait_for_timeout(30)
    await T('touchEnd',[(11,360,200)]);await T('touchEnd',[(12,580,200)]);await pg.wait_for_timeout(300)
    n4=await ev("()=>CRV.map.size");res['pinch']={'before':n3,'after':n4,'ok':n3==n4};await ev("()=>{ZOOM.t=1}")
    # 7) 저장(이 폰) → 다시 불러오기, 글 형식
    await pg.wait_for_timeout(1000)
    r=await ev("()=>{const raw=JSON.parse(localStorage.getItem('frontisle_blocks'));const n=CRV.map.size,s=crvStr();CRV.map.clear();CRV.inited=false;creInit();return JSON.stringify({saved:raw.blocks.split(';').length,n,back:CRV.map.size,fmt:/^-?\\d+\\.-?\\d+\\.-?\\d+\\.\\d$/.test(s.split(';')[0]),st:CRV.st})}")
    R=json.loads(r);R['ok']=R['saved']==R['n'] and R['back']==R['n'] and R['fmt'];res['local']=R
    # 8) 게임 링크 데이터(db) 흉내: 불러오기 + 바뀔 때 set
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const store={'creative/main':{v:1,at:Date.now()+5000,n:2,blocks:'0.0.1.3;1.0.1.4'}},log=[];
      window.claude={use:async n=>n==='db'?{doc:p=>({get:async()=>({exists:!!store[p],data:()=>store[p]}),set:async d=>{log.push(d.n);store[p]=d}})}:null};
      CRV.inited=false;CRV.db=null;creInit();await sl(400);const loaded=CRV.map.size;CRV.stroke={ops:[],k:null};creSet(crvKey(5,5,1),2);creEnd();await sl(1300);
      return JSON.stringify({loaded,setN:log,doc:store['creative/main'].n,st:CRV.st})}""")
    R=json.loads(r);R['ok']=R['loaded']==2 and R['doc']==3 and '저장됨' in R['st'];res['cloud']=R
    await ev("()=>{delete window.claude;CRV.db=null;creOff();crvLoad('');DEV.on=false;devHud()}")
    # 9) 설치: 누른 곳에 / 철거: 누른 건물
    r=await ev("""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));give('kit_stash',2);setBuild('stash');await sl(200);let spot=null;for(let a=0;a<16&&!spot;a++){const x=P.x+Math.cos(a*.39)*6,z=P.z-2+Math.sin(a*.39)*4;BPIN.on=1;BPIN.x=x;BPIN.z=z;if(ghostPos().ok)spot=[x,z]}BPIN.on=0;if(!spot)return 'nospot';window._SP=spot;const q=scr(spot[0],groundY(spot[0],spot[1]),spot[1]);return JSON.stringify(q)}""")
    if r!='nospot':
        q=json.loads(r);await T('touchStart',[(9,q[0],q[1])]);await pg.wait_for_timeout(300)
        mid=await ev("()=>{const g=ghost&&ghost.position;return g?[+g.x.toFixed(1),+g.z.toFixed(1)]:null}")
        await T('touchEnd',[(9,q[0],q[1])]);await pg.wait_for_timeout(300)
        r2=await ev("()=>{const s=structs.filter(s=>s.t==='stash'&&s.own).sort((a,b)=>dist(a.x,a.z,_SP[0],_SP[1])-dist(b.x,b.z,_SP[0],_SP[1]))[0];return JSON.stringify({placed:!!s,d:s?+dist(s.x,s.z,_SP[0],_SP[1]).toFixed(2):null,pin:BPIN.on})}")
        R=json.loads(r2);R['ghostMid']=mid;R['ok']=R['placed'] and R['d']<1.2 and not R['pin'];res['buildTap']=R
        await ev("()=>setBuild('demo')");await pg.wait_for_timeout(200)
        q=await ev("()=>{const s=structs.filter(s=>s.t==='stash'&&s.own)[0];window._S=s;return scr(s.x,groundY(s.x,s.z)+.4,s.z)}")
        await T('touchStart',[(10,q[0],q[1])]);await pg.wait_for_timeout(150);await T('touchEnd',[(10,q[0],q[1])]);await pg.wait_for_timeout(300)
        r3=await ev("()=>JSON.stringify({gone:!structs.includes(_S),kit:invN('kit_stash')})");R=json.loads(r3);R['ok']=R['gone'];res['demoTap']=R
        await ev("()=>setBuild(null)")
    for k,v in res.items():print(k,json.dumps(v,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values()) and len(res)>=11)
