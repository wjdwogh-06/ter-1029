'''86차 몹 검사: 옛 몹 없음 · 새 몹 자리 · 새 도망 · 독두꺼비 혀/독/자폭 · 파수꾼 · 동굴(미니 동굴게·거대 동굴게: 입구 금지·길 찾기·자힐·분노·바위 던지기·30분) · 사냥 도감 · 사진
사용: python3 tools/gt.py tools/p86_check.py   (SHOTS=0 이면 사진 없이)'''
import os,json
OUTD='tools/out'
SIM='''window.SIMERR=[];window.SIM=(n,dt=.05,f)=>{busy=false;try{for(let i=0;i<n;i++){try{for(const e of enemies.slice())updEnemy(e,dt);updSpawns(dt);if(typeof bufTick==='function')bufTick(dt)}catch(x){if(SIMERR.length<5)SIMERR.push(String(x.stack||x).slice(0,300))}if(f&&f(i))return i}}finally{busy=true}return n};
window.KIND=k=>enemies.filter(e=>e.kind===k&&!e.dead);window.PUT=(x,z)=>{P.x=x;P.z=z;P.dead=false;S.hp=100;P.inv=0;P.lastHurt=99;S.buffs=[]};'''
async def steps(pg):
    R={}
    def ok(k,v,info=''):
        R[k]=bool(v);print(('OK  ' if v else 'BAD ')+k,info)
    await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{"+SIM+"}")
    # ① 옛 몹·약탈자 무리·경계병 없음, 새 몹 정의
    r=await pg.evaluate("""()=>({keys:Object.keys(ENEMY),hz:typeof HZ,horde:[...document.scripts].some(s=>/horde/.test(s.src)),mobs:[...document.scripts].some(s=>/mobs86/.test(s.src)),
      kinds:[...new Set(enemies.map(e=>e.kind))],snow:snowSlots.map(s=>s.kind),dtool:typeof updRaid})""")
    ok('old_gone',not any(k in r['keys'] for k in ['bandit','gunner','rgolem','wgolem','wraith','plant','brute','sentry','polarBear','ptarmigan']) and r['hz']=='undefined' and not r['horde'] and r['mobs'],r['keys'])
    ok('new_defs',set(['m86_ptar','m86_caper','m86_peac','m86_toad','m86_guard','m86_minic','m86_crab','snowHunter'])==set(r['keys']),r['kinds'])
    ok('snow_hunter_only',r['snow']==['snowHunter'],r['snow'])
    # ② 자리: 섬·수·겹침·설치 금지·항구
    r=await pg.evaluate("""()=>{const out={};const isl=e=>(islAt(e.x,e.z)||{}).n;for(const e of enemies){if(!e.m86)continue;const k=e.kind+'@'+isl(e);out[k]=(out[k]||0)+1}
      const L=enemies.filter(e=>e.m86);let minD=1e9;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)minD=Math.min(minD,dist(L[i].x,L[i].z,L[j].x,L[j].z));
      const main=L.filter(e=>e.main),badMain=main.filter(e=>NOB.some(n=>dist(e.x,e.z,n.x,n.z)<n.r)||PORT_SAFE.some(q=>dist(e.x,e.z,q[0],q[1])<q[2]+20)).length;
      const blk=L.filter(e=>blocked(e.x,e.z,e.r,0)!==null||hAt(e.x,e.z)<.9).length,nob=L.filter(e=>!e.main&&NOB.some(n=>dist(e.x,e.z,n.x,n.z)<n.r)).length;
      return{out,minD,badMain,blk,nob}}""")
    o=r['out']
    ok('spawn_counts',o.get('m86_ptar@동북섬',0)+o.get('m86_ptar@동북섬 동쪽',0)==8 and o.get('m86_caper@바람섬',0)+o.get('m86_caper@바람섬 남쪽',0)==5 and o.get('m86_peac@거북섬',0)==3 and o.get('m86_peac@갈매기섬',0)==2 and o.get('m86_toad@초승달 본섬',0)==3 and o.get('m86_guard@초승달 본섬',0)==2,o)
    ok('spawn_spots',r['minD']>=8.9 and r['badMain']==0 and r['blk']==0 and r['nob']==0,r)
    # ③ 새: 가까이 가면 빠르게 도망, 맞으면 바로
    r=await pg.evaluate("""()=>{const res={};DEV.on=true;for(const k of['m86_ptar','m86_caper','m86_peac']){const e=KIND(k)[0];PUT(e.x+3,e.z+2);P.moving=true;const d0=dist(e.x,e.z,P.x,P.z),x0=e.x,z0=e.z;let mx=0;
       SIM(40,.05,()=>{mx=Math.max(mx,e.a.spd);return false});res[k]={d0:+d0.toFixed(1),d1:+dist(e.x,e.z,P.x,P.z).toFixed(1),moved:+dist(x0,z0,e.x,e.z).toFixed(1),vmax:+mx.toFixed(1),hp:S.hp}}P.moving=false;return res}""")
    ok('birds_flee',all(v['d1']>v['d0']+3 and v['vmax']>=5.5 and v['hp']==100 for v in r.values()),r)
    # ④ 독두꺼비: 혀 → 독 4초(1초 5) + 느려짐, 쓰러지면 부풀다 자폭
    r=await pg.evaluate("""()=>{DEV.on=false;const e=KIND('m86_toad')[0];const a=Math.atan2(1,0);let px=e.x+6,pz=e.z;for(let k=0;k<16;k++){const an=k*.39,x=e.x+Math.sin(an)*6,z=e.z+Math.cos(an)*6;if(hAt(x,z)>.9&&!inSafe(x,z)&&blocked(x,z,.4,0)===null){px=x;pz=z;break}}
      PUT(px,pz);e.agg=1;e.cd=0;e.rest=0;e.hopping=0;S.buffs=[];let t=-1;const n=SIM(120,.05,i=>{if(bufHas('poi86')){t=i;return true}});const hp0=S.hp,sp=bufSpeed();
      SIM(84,.05);const hp1=S.hp;PUT(px,pz);S.buffs=[];
      /* 자폭 */const x2=e.x+2.6,z2=e.z;PUT(x2,z2);e.agg=0;e.hurtT=0;const hp=e.hp;e.hp=1;e.tg=null;hurtEnemy(e,5,1,0);const dead=e.dead;SIM(25,.05);const boom=100-S.hp;PUT(px,pz);
      return{hitAt:t,hp0,sp:+sp.toFixed(2),poison:+(hp0-hp1).toFixed(1),dead,boom,boomed:!!e.boomed,hpMax:ENEMY.m86_toad.hp}}""")
    ok('toad_tongue_poison',r['hitAt']>=0 and abs(r['poison']-20)<=5.1 and r['sp']<=.7,r)
    ok('toad_selfdestruct',r['dead'] and r['boomed'] and r['boom']>=15,r)
    # ⑤ 파수꾼: 느림·체력·내려찍기
    r=await pg.evaluate("""()=>{const e=KIND('m86_guard')[0];let px=e.x,pz=e.z+2.4;for(let k=0;k<16;k++){const an=k*.39,x=e.x+Math.sin(an)*2.4,z=e.z+Math.cos(an)*2.4;if(hAt(x,z)>.9&&blocked(x,z,.4,0)===null){px=x;pz=z;break}}
      PUT(px,pz);e.agg=1;e.cd=0;e.stc=99;let hit=-1;SIM(80,.05,i=>{if(S.hp<100){hit=i;return true}});const dmg=100-S.hp;
      PUT(e.x+9,e.z);e.cd=99;e.vnc=99;e.a.atk=null;let mx=0;SIM(30,.05,()=>{mx=Math.max(mx,e.a.spd);return false});PUT(e.x+40,e.z+40);return{hit,dmg,vmax:+mx.toFixed(2),hp:e.max}}""")
    ok('guardian',r['hit']>=0 and r['dmg']>=20 and r['vmax']<=2.2 and r['hp']>=1000,r)
    # ⑥ 동굴: 들어가기
    await pg.evaluate("()=>{busy=false;DEV.on=false;const s=structs.find(q=>q.t==='cave');PUT(s.x,s.z+3);caveEnter(s)}")
    await pg.wait_for_timeout(3500)
    r=await pg.evaluate("""()=>{SIM(30,.05);const C=M86.cave,N=C.nav,mini=KIND('m86_minic'),b=KIND('m86_crab')[0];const L=e=>[e.x-INT.x-MINE.ox,e.z-INT.z-MINE.oz];
      /* 길: 보스 칸에서 모든 방 자리에 닿나 */let reach=0;for(const q of N.pts){const p=m86Path(N,...L(b),q[0],q[1]);if(p)reach++}
      const outsideMobs=enemies.filter(e=>e.m86&&!e.cave&&e.a.root.visible).length;
      return{in:INT.on&&INT.kind==='cave',mini:mini.length,boss:!!b,bossForb:b?m86Forb(...L(b)):null,navMs:C.navMs,cells:N.n,pts:N.pts.length,reach,outsideMobs,bar:!!document.getElementById('m86boss')}}""")
    ok('cave_spawn',r['in'] and r['mini']==9 and r['boss'] and not r['bossForb'] and r['outsideMobs']==0,r)
    ok('cave_nav',r['pts']>=11 and r['reach']==r['pts'],r)
    # 보스: 쫓기(빠름) · 집게 · 입구 둘레 금지 · 자힐 · 분노 · 바위 던지기 · 30분
    r=await pg.evaluate("""()=>{const b=KIND('m86_crab')[0],W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz],L=e=>[e.x-INT.x-MINE.ox,e.z-INT.z-MINE.oz],N=M86.cave.nav,res={};
      /* 방 5(중앙) 안 두 점 */const h=M74.halls[5];const pick2=()=>{for(let k=0;k<400;k++){const ax=h[0]+rand(-25,25),az=h[1]+rand(-18,18),bx=ax+rand(-14,14),bz=az+rand(-14,14);const d=Math.hypot(bx-ax,bz-az);if(d<11||d>15)continue;if(mineOpen(ax,az,1.1)&&mineOpen(bx,bz,.5)&&m86LOS(ax,az,bx,bz)&&!m86Forb(ax,az))return[ax,az,bx,bz]}return null};
      const q=pick2();res.q=!!q;if(!q)return res;[b.x,b.z]=W(q[0],q[1]);b.hp=b.max;b.agg=0;b.path=null;b.mv=null;b.a.atkT=0;b.thc=99;const[px,pz]=W(q[2],q[3]);PUT(px,pz);
      let mx=0,t=-1;SIM(200,.05,i=>{mx=Math.max(mx,b.a.spd);if(S.hp<100){t=i;return true}});res.chaseV=+mx.toFixed(2);res.hitAt=t;res.pinch=100-S.hp;
      /* 입구 둘레: 플레이어가 광차 기지에 있으면 못 들어와요 */const[ex,ez]=W(0,80);PUT(ex,ez);const[sx,sz]=W(0,46);b.x=sx;b.z=sz;b.agg=1;b.path=null;b.mv=null;b.a.atkT=0;let forb=0;
      SIM(240,.05,()=>{if(m86Forb(...L(b)))forb++;return false});res.forbSteps=forb;res.aggAfter=b.agg;res.distE=+Math.hypot(...L(b).map((v,i)=>v-[0,80][i])).toFixed(1);
      /* 자힐: 5초에 2% */const[fx,fz]=W(-92,-60);b.agg=0;b.hp=b.max*.5;PUT(...W(110,-14));const h0=b.hp;SIM(103,.05);res.heal=Math.round(b.hp-h0);
      /* 분노: 체력이 낮을수록 빨라요 */b.hp=b.max*.15;b.a.setRage(.85);res.rage=+b.a.rage.toFixed(2);
      return res}""")
    ok('boss_chase_pinch',r.get('q') and r['chaseV']>=4.5 and r['hitAt']>=0 and r['pinch']>=40,r)
    ok('boss_no_entrance',r.get('forbSteps')==0 and r.get('aggAfter')==0,r)
    ok('boss_heal',abs(r.get('heal',0)-160)<=1 or abs(r.get('heal',0)-320)<=1,r)
    r=await pg.evaluate("""()=>{const b=KIND('m86_crab')[0],W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz],L=e=>[e.x-INT.x-MINE.ox,e.z-INT.z-MINE.oz],res={};
      /* 분노 빠르기 */const h=M74.halls[5];let q=null;for(let k=0;k<400&&!q;k++){const ax=h[0]+rand(-25,25),az=h[1]+rand(-18,18),bx=ax+rand(-14,14),bz=az+rand(-14,14);const d=Math.hypot(bx-ax,bz-az);if(d>11&&d<15&&mineOpen(ax,az,1.1)&&mineOpen(bx,bz,.5)&&m86LOS(ax,az,bx,bz)&&!m86Forb(ax,az))q=[ax,az,bx,bz]}
      [b.x,b.z]=W(q[0],q[1]);b.hp=b.max*.1;b.agg=1;b.path=null;b.mv=null;b.thc=99;b.a.atkT=0;PUT(...W(q[2],q[3]));let mx=0;SIM(20,.05,()=>{mx=Math.max(mx,b.a.spd);return false});res.rageV=+mx.toFixed(2);
      /* 바위 던지기: 바위 옆에 두고 12m 떨어져서 */let o=null;for(const m of MO79.list){if(m.re>0)continue;for(let k=0;k<12&&!o;k++){const an=k*.52,bx=m.lx+Math.cos(an)*3.5,bz=m.lz+Math.sin(an)*3.5;if(!mineOpen(bx,bz,1.1)||m86Forb(bx,bz))continue;
         for(let j=0;j<12;j++){const a2=j*.52,px=bx+Math.cos(a2)*12,pz=bz+Math.sin(a2)*12;if(mineOpen(px,pz,.5)&&m86LOS(bx,bz,px,pz)&&!m86Forb(px,pz)){o={m,bx,bz,px,pz};break}}}if(o)break}
      res.rockSetup=!!o;if(o){[b.x,b.z]=W(o.bx,o.bz);b.hp=b.max;b.agg=1;b.thc=0;b.mv=null;b.path=null;b.a.atkT=0;PUT(...W(o.px,o.pz));S.hp=1e4;let thrown=0,ore=0,hit=-1;
        SIM(140,.05,i=>{if(M86.pj.length)thrown=1;if(o.m.re>0)ore=1;if(S.hp<1e4&&hit<0)hit=i;return thrown&&!M86.pj.length});res.thrown=thrown;res.oreTaken=ore;res.rockHit=hit}
      /* 쓰러뜨리면 30분 */PUT(...W(110,-14));hurtEnemy(b,1e6,1,0);res.dead=b.dead;res.reMin=Math.round((S.m86.crab-Date.now())/60000);SIM(140,.05);res.respawnEarly=KIND('m86_crab').length;
      S.m86.crab=Date.now()-1000;SIM(30,.05);res.respawn=KIND('m86_crab').length;res.bar=!!document.getElementById('m86boss');return res}""")
    ok('boss_rage_speed',r['rageV']>=6.5,r)
    ok('boss_throw_rock',r['rockSetup'] and r['thrown'] and r['oreTaken'],r)
    print('SIMERR',await pg.evaluate('()=>SIMERR'))
    ok('boss_respawn_30min',r['dead'] and r['reMin']==30 and r['respawnEarly']==0 and r['respawn']==1,r)
    # 미니 동굴게: 도망만
    r=await pg.evaluate("""()=>{const e=KIND('m86_minic')[0];PUT(e.x+2,e.z+1.5);const d0=dist(e.x,e.z,P.x,P.z);let mx=0;SIM(40,.05,()=>{mx=Math.max(mx,e.a.spd);return false});return{d0:+d0.toFixed(1),d1:+dist(e.x,e.z,P.x,P.z).toFixed(1),vmax:+mx.toFixed(1),hp:S.hp}}""")
    ok('mini_flee_no_attack',r['d1']>r['d0']+2.5 and r['vmax']>=6 and r['hp']==100,r)
    if os.environ.get('SHOTS','1')!='0':
        await pg.evaluate("""()=>{const b=KIND('m86_crab')[0],W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz];DEV.on=true;const h=M74.halls[5];
          for(let k=0;k<300;k++){const ax=h[0]+rand(-20,20),az=h[1]+rand(-15,15);if(mineOpen(ax,az,1.2)&&mineOpen(ax,az+7,.5)){[b.x,b.z]=W(ax,az);PUT(...W(ax,az+7.5));break}}b.rot=0;b.agg=0;b.path=null;
          const mm=KIND('m86_minic');mm.slice(0,2).forEach((m,i)=>{m.x=P.x+(i?3:-3);m.z=P.z-1.2;m.ft=0});SIM(6,.03);busy=false;b.a.atkT=.35;b.a.mixer.update(.01)}""")
        await pg.wait_for_timeout(900);await pg.screenshot(path=f'{OUTD}/p86_cave.jpg',type='jpeg',quality=85)
        await pg.evaluate("()=>{busy=true}")
    # 나가기 → 동굴 몹 치움
    await pg.evaluate("()=>{busy=false;DEV.on=false;intLeave()}")
    await pg.wait_for_timeout(3000)
    r=await pg.evaluate("()=>{SIM(5,.05);return{cave:enemies.filter(e=>e.cave).length,on:M86.cave.on,intOn:INT.on}}")
    ok('cave_leave',r['cave']==0 and not r['on'] and not r['intOn'],r)
    # 사냥 도감
    r=await pg.evaluate("()=>{const h=huntDexHtml();return{img:(h.match(/<img/g)||[]).length,n:(h.match(/class=\"slot\"/g)||[]).length,ic:Object.keys(M86.ic).length}}")
    ok('hunt_dex',r['img']==8 and r['n']==8,r)
    # 오래 돌려 보기: 섬마다 플레이어를 옮겨 가며
    r=await pg.evaluate("""()=>{let err=0;const L=['m86_ptar','m86_caper','m86_peac','m86_toad','m86_guard'];DEV.on=false;
      for(const k of L){const e=KIND(k)[0];if(!e)continue;PUT(e.x+7,e.z+5);try{SIM(200,.05)}catch(x){err++;console.error(x)}if(P.dead){P.dead=false}}S.hp=100;return{err,n:enemies.length}}""")
    ok('soak',r['err']==0,r)
    if os.environ.get('SHOTS','1')!='0':
        for k,off,nm in [('m86_ptar',(0,5.5),'ptar'),('m86_caper',(0,6),'caper'),('m86_peac',(0,7),'peac'),('m86_toad',(0,7.5),'toad'),('m86_guard',(0,9),'guard')]:
            await pg.evaluate("""([k,ox,oz])=>{DEV.on=true;busy=false;const e=KIND(k)[0];let x=e.x+ox,z=e.z+oz;PUT(x,z);e.rot=0;e.ft=0;e.agg=0;e.a.spd=0;if(k==='m86_peac'){e.a.dispT=6;e.a.disp=1}
               for(const o of enemies)if(o!==e&&o.m86&&dist(o.x,o.z,x,z)<12){o.ft=0}SIM(4,.03);if(k==='m86_peac'){e.a.disp=1;e.a.dispT=6;e.a.pose(0)}busy=false}""",[k,off[0],off[1]])
            await pg.wait_for_timeout(1100);await pg.screenshot(path=f'{OUTD}/p86_{nm}.jpg',type='jpeg',quality=85)
        await pg.evaluate("()=>{DEV.on=false;busy=false}")
    print('RESULT',json.dumps(R,ensure_ascii=False));print('ALL',all(R.values()))
