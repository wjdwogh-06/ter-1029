'''87차 검사: 동굴 보스(거대 동굴게)가 소품·벽에 끼지 않고 쫓아와 때리는지
 - 쫓기: 방 자리·그 둘레 아무 데나 플레이어, 보스는 22~60m 떨어진 다른 방에서 → 40초 안에 때림, 못 움직인 시간
 - 몸 크기: 쫓는 동안 보스 가운데에서 소품 가장자리까지(B87.rs 아래로 안 내려감)
 - 돌아다니기 3분: 실제로 걸은 거리·멈춘 시간
 - 막힌 자리(옛 86차 광장 자리 [1,7] = 소품 안)에 생겨도 빠져나와 움직임
 - 보스가 못 가는 곳에 플레이어: 제자리에서 떨지 않음
 - 관리자 모드: 맞으면 덤비고 집게질, 피해는 '무적' 숫자만
 - 방 자리 11곳 모두 길 있음
 사진 tools/out/p87_chase.jpg(쫓아오는 중)·p87_pinch.jpg(관리자 모드 집게질) (SHOTS=0이면 사진 없이)'''
import json,os
OUTD='tools/out'
SIM='''window.SIMERR=[];window.SIM=(n,dt=.05,f)=>{busy=false;try{for(let i=0;i<n;i++){try{for(const e of enemies.slice())updEnemy(e,dt);updSpawns(dt)}catch(x){if(SIMERR.length<5)SIMERR.push(String(x.stack||x).slice(0,300))}if(f&&f(i))return i}}finally{busy=true}return n};
window.GAP=(lx,lz)=>{let g=99;for(const L of M74.solids.values())for(const q of L){const d=Math.hypot(q[0]-lx,q[1]-lz)-q[2];if(d<g)g=d}return g};
window.KIND=k=>enemies.filter(e=>e.kind===k&&!e.dead);window.PUT=(x,z)=>{P.x=x;P.z=z;P.dead=false;S.hp=100;P.inv=0;P.lastHurt=99;S.buffs=[]};'''
async def steps(pg):
    res={}
    def ok(k,c,v): res[k]=bool(c);print('OK ' if c else 'BAD',k,json.dumps(v,ensure_ascii=False)[:600])
    await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{"+SIM+"}")
    await pg.evaluate("()=>{busy=false;DEV.on=false;const s=structs.find(q=>q.t==='cave');PUT(s.x,s.z+3);caveEnter(s)}")
    await pg.wait_for_timeout(2500)
    r=await pg.evaluate("""()=>{SIM(20,.05);const b=KIND('m86_crab')[0],N=M86.cave.nav,W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz],L=e=>[e.x-INT.x-MINE.ox,e.z-INT.z-MINE.oz];
      if(!b)return{noBoss:1};const out={chase:[],B87:B87,pts:N.pts.length,cells:N.n};
      const reset=()=>{b.hp=b.max;b.agg=0;b.path=null;b.mv=null;b.a.atkT=0;b.thc=99;b.cd=0;b.lost=0;b.waitF=0;b.b87out=null;b.b87w=0};
      /* 방 자리 모두 길 있음 */
      let reach=0;for(const q of N.pts)if(m86Path(N,N.pts[0][0],N.pts[0][1],q[0],q[1]))reach++;out.reach=reach;
      /* A. 쫓기 */
      const cand=[];for(const q of N.pts)cand.push([q[0],q[1]]);for(let k=0;k<80&&cand.length<34;k++){const q=N.pts[k%N.pts.length];const x=q[0]+rand(-14,14),z=q[1]+rand(-14,14);if(mineOpen(x,z,.45)&&!m86Forb(x,z)&&m86NearCell(N,x,z,4)>=0)cand.push([x,z])}
      for(const c of cand){let s=null;for(const q of N.pts.slice().sort(()=>Math.random()-.5)){const d=Math.hypot(q[0]-c[0],q[1]-c[1]);if(d>22&&d<60){s=q;break}}if(!s)continue;
        reset();[b.x,b.z]=W(s[0],s[1]);b.agg=1;PUT(...W(c[0],c[1]));
        let stuck=0,hit=-1,gap=99;SIM(800,.05,i=>{const dp=dist(b.x,b.z,P.x,P.z);if(i%4==0){const[a,cc]=L(b);gap=Math.min(gap,GAP(a,cc))}if(b.agg&&dp>4.6&&b.a.spd<=0&&!b.mv)stuck++;if(S.hp<100){hit=i;return true}return false});
        out.chase.push({p:c.map(v=>Math.round(v)),s:s.slice(0,2).map(Math.round),hit:hit<0?-1:+(hit*.05).toFixed(1),stuck:+(stuck*.05).toFixed(1),gap:+gap.toFixed(2)})}
      /* B. 돌아다니기 3분(플레이어는 30m 뒤를 따라가요 — 140m 넘으면 보스가 멈춰서) */
      reset();PUT(...W(0,80));[b.x,b.z]=W(N.pts[3][0],N.pts[3][1]);let mv=0,stk=0,px=b.x,pz=b.z,hadPath=0,outs=0;const vis=new Set();
      SIM(3600,.05,i=>{P.x=b.x;P.z=b.z-30;const m=dist(px,pz,b.x,b.z);mv+=m;px=b.x;pz=b.z;if(b.path)hadPath++;if(b.path&&m<.004)stk++;if(b.b87out)outs++;const[lx,lz]=L(b);vis.add(Math.round(lx/10)+','+Math.round(lz/10));return false});
      out.wander={moved:Math.round(mv),stuckSec:+(stk*.05).toFixed(1),withPathSec:+(hadPath*.05).toFixed(1),outSec:+(outs*.05).toFixed(1),cells10:vis.size};
      /* C. 막힌 자리에 생기면(86차 광장 자리 [1,7]은 소품 안) */
      reset();[b.x,b.z]=W(1,7);PUT(...W(1,40));const blk0=!(b87Floor(1,7,B87.rw)&&!m74hitSolid(1,7,B87.rs-.05));let p0=[b.x,b.z];
      SIM(80,.05);const [bx1,bz1]=L(b);const free1=b87Floor(bx1,bz1,B87.rw-.01)&&!m74hitSolid(bx1,bz1,B87.rs-.06);let mv2=0;p0=[b.x,b.z];SIM(200,.05);mv2=dist(p0[0],p0[1],b.x,b.z);
      out.blocked={startBlocked:blk0,freeAfter4s:free1,movedNext10s:+mv2.toFixed(1)};
      /* D. 못 가는 곳에 플레이어: 바닥이지만 4m 안에 길 칸이 없는 곳 */
      let spot=null;for(let lx=-130;lx<130&&!spot;lx+=1.5)for(let lz=-120;lz<120&&!spot;lz+=1.5){if(!mineOpen(lx,lz,.45)||m86Forb(lx,lz)||m86NearCell(N,lx,lz,4)>=0)continue;const q=m86NearCell(N,lx,lz,9);if(q<0)continue;spot=[lx,lz]}
      if(spot){reset();const q=m86NearCell(N,spot[0],spot[1],9),qx=(((q/N.nJ)|0)+N.I0)*N.c,qz=(q%N.nJ+N.J0)*N.c;[b.x,b.z]=W(qx,qz);b.agg=1;PUT(...W(spot[0],spot[1]));let jit=0,outs2=0,pp=[b.x,b.z];
        SIM(240,.05,i=>{jit+=dist(pp[0],pp[1],b.x,b.z);pp=[b.x,b.z];if(b.b87out)outs2++;return false});out.unreach={spot:spot.map(Math.round),d:+dist(b.x,b.z,P.x,P.z).toFixed(1),moved12s:+jit.toFixed(1),outSec:+(outs2*.05).toFixed(1),agg:b.agg}}
      else out.unreach={none:1};
      /* E. 관리자 모드에서 맞으면 */
      DEV.on=true;reset();const c0=N.pts[5];[b.x,b.z]=W(c0[0],c0[1]);PUT(...W(c0[0]+8,c0[1]));hurtEnemy(b,10,1,0);let mx=0,nf=0;const ft0=ftext;ftext=function(x,y,z,t){if(String(t).includes('무적'))nf++;return ft0.apply(this,arguments)};
      SIM(200,.05,i=>{mx=Math.max(mx,b.a.atkT);return false});ftext=ft0;out.devHit={agg:b.agg,d:+dist(b.x,b.z,P.x,P.z).toFixed(1),atkMax:+mx.toFixed(2),hits:nf,hp:S.hp};
      /* 관리자 모드: 보이면(18m) 덤빔 */
      reset();[b.x,b.z]=W(c0[0],c0[1]);PUT(...W(c0[0]+6,c0[1]));SIM(20,.05);out.devSee={agg:b.agg};DEV.on=false;
      out.err=SIMERR;return out}""")
    if r.get('noBoss'): ok('boss',False,r); return
    ch=r['chase'];bad=[c for c in ch if c['hit']<0]
    ok('rooms_reach',r['reach']==r['pts']>=11,{'pts':r['pts'],'reach':r['reach'],'cells':r['cells']})
    ok('chase_hits',len(ch)>=20 and not bad,{'n':len(ch),'nohit':bad[:4],'avgHit':round(sum(c['hit'] for c in ch)/max(1,len(ch)),1)})
    ok('chase_not_stuck',max([c['stuck'] for c in ch] or [9])<1.5,{'avg':round(sum(c['stuck'] for c in ch)/max(1,len(ch)),2),'max':max([c['stuck'] for c in ch] or [9])})
    ok('body_clear_props',min([c['gap'] for c in ch] or [0])>=r['B87']['rs']-.06,{'minGap':min([c['gap'] for c in ch] or [0]),'rs':r['B87']['rs']})
    w=r['wander'];ok('wander_moves',w['moved']>200 and w['stuckSec']<5,w)
    bl=r['blocked'];ok('blocked_spawn_frees',bl['startBlocked'] and bl['freeAfter4s'] and bl['movedNext10s']>3,bl)
    u=r['unreach'];ok('unreachable_no_jitter',u.get('none') or (u['outSec']<2 and u['moved12s']<12),u)
    dh=r['devHit'];ok('dev_hit_fights_back',dh['agg']==1 and dh['atkMax']>0 and dh['hits']>=1 and dh['hp']==100,dh)
    ok('dev_sees',r['devSee']['agg']==1,r['devSee'])
    ok('no_errors',not r['err'],r['err'])
    if os.environ.get('SHOTS','1')!='0':
        # 진짜 시간으로: 보스가 다른 쪽에서 쫓아오는 모습 → 집게질(관리자 모드라 무적)
        await pg.evaluate("""()=>{const b=KIND('m86_crab')[0],N=M86.cave.nav,W=(lx,lz)=>[lx+INT.x+MINE.ox,lz+INT.z+MINE.oz];DEV.on=true;zoomK=1.05;
          const q=N.pts.find(p=>p[2]===5)||N.pts[0];let sp=null;for(let k=0;k<4000&&!sp;k++){const ax=q[0]+rand(-14,14),az=q[1]+rand(-10,10);if(mineOpen(ax,az,.6)&&m86NearCell(N,ax,az,2)>=0&&mineOpen(ax,az-9,1.4)&&m86NearCell(N,ax,az-9,1)>=0)sp=[ax,az]}
          if(!sp)sp=[q[0],q[1]+6];PUT(...W(sp[0],sp[1]));[b.x,b.z]=W(sp[0],sp[1]-9);b.agg=1;b.path=null;b.mv=null;b.thc=99;b.cd=0;b.hp=b.max*.7;P.rot=Math.PI;camT.set(P.x,INT.y,P.z);busy=false}""")
        await pg.wait_for_timeout(500);await pg.screenshot(path=f'{OUTD}/p87_chase.jpg',type='jpeg',quality=85)
        for _ in range(12):
            st=await pg.evaluate("()=>{const b=KIND('m86_crab')[0];busy=false;return [dist(b.x,b.z,P.x,P.z),b.a.atkT]}")
            if st[1]>.25 and st[1]<.7: break
            await pg.wait_for_timeout(250)
        await pg.screenshot(path=f'{OUTD}/p87_pinch.jpg',type='jpeg',quality=85)
        print('shots',st)
    print('ALL',all(res.values()))
