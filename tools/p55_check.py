# 55차(규칙): 블록으로 그린 자리에 새 섬(거북섬, core.js NEWISLE)
# 기대: 섬이 있고(islAt), 그린 선 안은 모두 땅·선보다 조금 큰 땅(1.2~1.6배 넓이), 북쪽 작은 만 두 곳은 물, 땅은 평평(1.0~1.3),
#       옛 바위섬 흔적 없음(바위섬 높이 1.5·설치 금지 원·등대·바위 장식), 나무·바위가 자람, 가장자리 바닷가에서 걸어 올라감,
#       본섬과 이어지지 않음(헤엄 거리), 고래 길은 그대로 깊은 물, 낚시 포인트 79곳 그대로
import os,json
NAME='거북섬'
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n);res={}
    def put(k,v):res[k]=v;print(k,json.dumps(v,ensure_ascii=False)[:600])
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true}")
    r=json.loads(await ev("""()=>{const I=ISL.find(q=>q.n===NEWISLE.n),N=NEWISLE;const o={has:!!I,idx:ISL.indexOf(I),at:(islAt(N.x,N.z)||{}).n};
      let land=0,inPg=0,core=0,coreLand=0,deep=0,deepLand=0,maxH=-9,minIn=9,out=0;for(let z=830;z<=960;z++)for(let x=420;x<=560;x++){const h=hAt(x,z),sd=pgSD(I.pg,x,z),d0=pgSD(N.pg,x,z);if(h>0)land++;if(d0<0)inPg++;
        if(sd<-4){core++;if(h>0)coreLand++;minIn=Math.min(minIn,h)}if(d0<-5){deep++;if(h>0)deepLand++}if(h>0){maxH=Math.max(maxH,h);if(sd>8)out++}}
      o.land=land;o.drawn=inPg;o.ratio=+(land/inPg).toFixed(2);o.coreLand=+(coreLand/core).toFixed(3);o.drawnInLand=+(deepLand/deep).toFixed(3);o.minCore=+minIn.toFixed(2);o.maxH=+maxH.toFixed(2);o.farOut=out;
      /* 북쪽 작은 만 두 곳: 그린 선의 만 가운데(V 487.5,866 · U 512,866)를 섬을 키운 비율대로 옮긴 자리 */
      const sc=(x,z)=>[N.x+(x-N.x)*N.k,N.z+(z-N.z)*N.k],v=sc(487.5,866),u=sc(512,866);o.coveV=+hAt(v[0],v[1]).toFixed(2);o.coveU=+hAt(u[0],u[1]).toFixed(2);
      o.center=+hAt(LHS[0].x,LHS[0].z).toFixed(2);o.nobNear=NOB.filter(n=>dist(n.x,n.z,LHS[0].x,LHS[0].z)<30).map(n=>n.k);
      o.lh0=structs.some(s=>s.t==='lighthouse'&&s.li===0);o.cave=!!(CAVE.s&&structs.includes(CAVE.s));o.lh4isle=hAt(LHS[4].x,LHS[4].z)>1.3;
      let trees=0,rocks=0;for(const q of objs.values()){if(q.re>0)continue;if(islAt(q.x,q.z)!==I)continue;if(q.t<=2)trees++;else if(q.t===3)rocks++}o.trees=trees;o.rocks=rocks;
      /* 본섬까지 헤엄 거리(가장 가까운 두 땅) */
      let bd=1e9;const A=[],B=[];for(let z=780;z<=960;z+=2)for(let x=400;x<=600;x+=2){if(hAt(x,z)<=0)continue;const q=islAt(x,z);if(q===I)A.push([x,z]);else if(q===ISL[0])B.push([x,z])}
      for(const a of A)if(a[1]<880)for(const b of B){const d=dist(a[0],a[1],b[0],b[1]);if(d<bd)bd=d}o.swim=Math.round(bd);
      o.fsp=FSP.length;o.fspOn=FSP.filter(s=>islAt(s.x,s.z)===I&&hAt(s.x,s.z)>-.3).length;
      o.whaleDeep=WH.path?WH.path.every(p=>hAt(p[0],p[1])<WH.depth):null;o.whaleNear=WH.path?Math.round(Math.min(...WH.path.map(p=>pgSD(I.pg,p[0],p[1])))):null;
      return JSON.stringify(o)}"""))
    r['ok']=(r['has'] and r['at']==NAME and r['coreLand']>=.999 and r['drawnInLand']>=.999 and 1.15<r['ratio']<1.7 and r['coveV']<-.3 and r['coveU']<-.3 and r['maxH']<1.32 and r['minCore']>.3
        and not r['nobNear'] and not r['lh0'] and r['cave'] and r['lh4isle'] and r['trees']>20 and r['farOut']==0 and r['swim']>25 and r['fsp']==76 and r['fspOn']==0 and r['whaleDeep'] is True and r['whaleNear']>8)
    put('isle',r)
    # 바닷가에서 걸어 올라가기: 섬 둘레 16곳에서 물(1.5m 밖)부터 가운데 쪽으로 걸어서 땅 위(1m 넘게)에 닿는지
    r=json.loads(await ev("""async()=>{const N=NEWISLE,I=ISL.find(q=>q.n===N.n),res=[];DEV.on=false;
      for(let a=0;a<16;a++){const an=a/16*Math.PI*2;let x=N.x,z=N.z;for(let k=0;k<160&&hAt(x,z)>-.6;k++){x+=Math.cos(an)*.5;z+=Math.sin(an)*.5}
        P.x=x;P.z=z;P.y=hAt(x,z);P.yv=0;let ok=false;const dx=-Math.cos(an)*.075,dz=-Math.sin(an)*.075;for(let t=0;t<900&&!ok;t++){moveEnt(P,dx,dz);if(hAt(P.x,P.z)>1)ok=true}
        res.push(ok?1:0)}return JSON.stringify({up:res.reduce((a,b)=>a+b,0),n:res.length,bad:res.map((v,i)=>v?null:i).filter(v=>v!==null)})}"""))
    r['ok']=r['up']>=14;put('walkUp',r)
    # 그린 선(빨강)·새 땅 높이 그림
    await ev("""()=>{const N=NEWISLE,I=ISL.find(q=>q.n===N.n),S2=4,x0=420,z0=830,W=140,H=130,c=document.createElement('canvas');c.width=W*S2;c.height=H*S2;const g=c.getContext('2d');
      for(let z=0;z<H;z++)for(let x=0;x<W;x++){const h=hAt(x0+x,z0+z);g.fillStyle=h<-1.5?'#2a5d8a':h<0?'#4f8fc0':h<.5?'#e8d9a0':h<1.05?'#9fc46a':'#6fa64a';g.fillRect(x*S2,z*S2,S2,S2)}
      for(const q of objs.values()){if(q.re>0||q.x<x0||q.x>x0+W||q.z<z0||q.z>z0+H)continue;g.fillStyle=q.t<=2?'#2f5d2a':q.t===3?'#888':'#b55';g.fillRect((q.x-x0)*S2-3,(q.z-z0)*S2-3,6,6)}
      g.strokeStyle='#e03030';g.lineWidth=2;g.beginPath();N.pg.forEach((p,i)=>{const X=(p[0]-x0)*S2,Y=(p[1]-z0)*S2;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.stroke();
      window._mapURL=c.toDataURL('image/png')}""")
    import base64
    u=await ev("()=>window._mapURL");open(O('p55_map.png'),'wb').write(base64.b64decode(u.split(',')[1]))
    # 게임 화면 사진: 가운데·북쪽 만·남쪽 바닷가
    for nm,js in [('center','P.x=NEWISLE.x;P.z=NEWISLE.z+4'),('north','P.x=500;P.z=884'),('south','P.x=486;P.z=930'),('west','P.x=452;P.z=900')]:
        await ev("()=>{"+js+";P.y=groundY(P.x,P.z);P.yv=0;zoomK=1.3;updCamera(0,P.x,P.y,P.z,true)}");await pg.wait_for_timeout(1800);await pg.screenshot(path=O('p55_'+nm+'.jpg'),type='jpeg',quality=85)
    print('ALL',all(v.get('ok') for v in res.values()))
