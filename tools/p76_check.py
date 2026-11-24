# 76차(디자인) 검사: 블록으로 그린 땅 덧붙이기(동북섬 동쪽 = 겨울, 바람섬 남쪽 = 그 안 '땅끝 등대' 없앰) · 채굴 텐트 새 모양
# python3 tools/gt.py tools/p76_check.py   → 마지막 줄 ALL True
# BLK=블록 글 파일(기본: 기획자가 보낸 첨부) — 그린 선 블록이 땅이 됐는지 봐요
# 사진: tools/out/p76_ne.jpg, p76_ne_game.jpg, p76_sw.jpg, p76_sw_game.jpg, p76_sw_south.jpg, p76_map.png, p76_minetent.jpg
import json,os,base64
BLK=os.environ.get('BLK','/mnt/user-data/uploads/bcfa83b8-attachment.txt')
async def steps(pg):
    ev=pg.evaluate;res={};OUT=os.path.join(os.path.dirname(__file__),'out')
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    blk=[]
    if os.path.exists(BLK):
        for t in open(BLK).read().strip()[5:].split(';'):
            if t:
                x,z,k,c=map(int,t.split('.'));blk.append([x,z])
    # 1. 새 땅: 섬 둘, 그린 블록(큰 테두리 둘)이 거의 다 땅, 테두리 안쪽(8m 넘게)은 모두 마른 땅, 넓이
    r=await ev("""(B)=>{const N=['동북섬 동쪽','바람섬 남쪽'],box=[[840,130,965,270],[40,760,160,945]];const out={};
      N.forEach((n,i)=>{const I=ISL.find(q=>q.n===n);if(!I){out[n]=null;return}const b=box[i];let bl=0,bLand=0;for(const p of B){if(p[0]<b[0]||p[0]>b[2]||p[1]<b[1]||p[1]>b[3])continue;bl++;if(hAt(p[0]+.5,p[1]+.5)>0)bLand++}
        let inn=0,innDry=0,area=0;for(let x=b[0];x<=b[2];x++)for(let z=b[1];z<=b[3];z++){const s=pgSD(I.pg,x,z);if(s<-8){inn++;if(hAt(x,z)>.9)innDry++}if(islAt(x,z)===I&&hAt(x,z)>0)area++}
        let tr=0;objs.forEach(o=>{if(islAt(o.x,o.z)===I)tr++});
        out[n]={pts:I.pg.length,bl,blkLand:+(bLand/Math.max(1,bl)*100).toFixed(1),inn,innDry:+(innDry/Math.max(1,inn)*100).toFixed(1),area,objs:tr,maxH:0}});
      let mx=0;for(let x=40;x<=965;x+=2)for(let z=130;z<=945;z+=2){if(!(x<160&&z>760)&&!(x>840&&z<270))continue;mx=Math.max(mx,hAt(x,z))}out.maxH=+mx.toFixed(2);return JSON.stringify(out)}""",blk)
    R=json.loads(r);ok=all(R.get(n) and R[n]['blkLand']>=97 and R[n]['innDry']>=99.5 and R[n]['objs']>40 for n in ['동북섬 동쪽','바람섬 남쪽']) and R['maxH']<1.32
    R['ok']=ok;res['land']=R
    # 2. 걸어서 이어짐: 옛 땅에서 새 땅 끝까지(1m 칸, 한 걸음 0.55 아래, 마른 땅)
    r=await ev("""()=>{const go=(a,b)=>{const seen=new Set([a[0]+','+a[1]]),q=[a];let hit=false;while(q.length){const [x,z]=q.pop();if(Math.abs(x-b[0])<=1&&Math.abs(z-b[1])<=1){hit=true;break}
        for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Z=z+dz,k=X+','+Z;if(seen.has(k))continue;const h=hAt(X,Z);if(h<.3||Math.abs(h-hAt(x,z))>.55)continue;seen.add(k);q.push([X,Z])}}return hit};
      return JSON.stringify({ne:go([820,240],[938,200]),ne2:go([820,240],[925,150]),sw:go([100,745],[95,925]),sw2:go([100,745],[60,915])})}""")
    R=json.loads(r);R['ok']=all(R.values());res['walk']=R
    # 3. '땅끝 등대'(3) 없앰: 등대 구조물·바위섬·설치 금지 원·낚시 포인트·빠른 이동·고래 길
    r=await ev("""()=>{const L=LH_SITES[3];const lh=structs.filter(s=>s.t==='lighthouse').map(s=>s.li).sort();const nob=NOB.filter(n=>Math.hypot(n.x-L[0],n.z-L[1])<5).map(n=>n.k);
      const fsp=FSP.filter(f=>Math.hypot(f.x-L[0],f.z-L[1])<45).length;let wMin=1e9,wDry=0;for(const p of WH.path){const d=seaShore(p[0],p[1]);if(d<wMin)wMin=d;if(hAt(p[0],p[1])>-1)wDry++}
      const fast=POI.lh.map((l,i)=>LH_GONE.includes(i)?null:l.n).filter(Boolean);
      return JSON.stringify({lh,nob,fsp,nFsp:FSP.length,a:FISH_PTS_A.length,lhD:+lhD(L[0],L[1]).toFixed(1),rock:LH_ISLE.includes(3),wLh:WH.lh.length,wMin,wDry,fast,
        isl:islAt(L[0],L[1])&&islAt(L[0],L[1]).n,h:+hAt(L[0],L[1]).toFixed(2)})}""")
    R=json.loads(r);R['ok']=3 not in R['lh'] and len(R['lh'])==5 and not R['nob'] and R['fsp']==0 and R['nFsp']==76 and R['a']==12 and R['lhD']>100 and R['rock'] and R['wLh']==5 and R['wDry']==0 and R['wMin']>=8 and len(R['fast'])==5 and R['isl']=='바람섬 남쪽' and R['h']>.9
    res['lh3']=R
    # 4. 겨울: 동북섬 동쪽 물건 모두 '_w', 땅 눈 색, 바닷가 얼음
    r=await ev("""()=>{const I=ISL.find(q=>q.n==='동북섬 동쪽');let on=0,onW=0;objs.forEach(o=>{if(islAt(o.x,o.z)!==I||OBJT[o.t].berry)return;on++;if(o.gk&&o.gk.endsWith('_w'))onW++});
      wntTick(.016);let ice=0;if(WNT.ice){const a=WNT.ice.geometry.attributes.position.array;for(let k=0;k<a.length;k+=9){const x=a[k],z=a[k+2];if(x>855&&z>140&&z<262&&islAt(x,z)===I)ice++}}
      let snow=0,tot=0;for(const t of tchunks){const P=t.m.geometry.attributes.position.array,C=t.m.geometry.attributes.color.array;for(let k=0;k<P.length;k+=3){const x=P[k],h=P[k+1],z=P[k+2];if(h<.95||islAt(x,z)!==I)continue;tot++;if(C[k]>.7&&C[k+1]>.75&&C[k+2]>.8)snow++}}
      return JSON.stringify({in:wntIsls().map(q=>q.n),on,onW,ice,snowPct:+(snow/Math.max(1,tot)*100).toFixed(1),tot})}""")
    R=json.loads(r);R['ok']='동북섬 동쪽' in R['in'] and R['on']>20 and R['on']==R['onW'] and R['ice']>50 and R['snowPct']>90;res['winter']=R
    # 5. 깊은 바다: 새 땅 둘레도 해안 30m 안은 얕음, 40m 넘으면 깊음
    r=await ev("""()=>{const box=[[820,110,1000,300],[0,740,200,1000]];let sh=0,shBad=0,far=0,farD=0;for(const b of box)for(let x=b[0];x<=b[2];x+=2)for(let z=b[1];z<=b[3];z+=2){if(x<1||z<1||x>WS-1||z>WS-1||hAt(x,z)>=-.05)continue;const d=seaShore(x,z),dp=seaDeep(x,z);if(d<=28){sh++;if(dp)shBad++}if(d>=40){far++;if(dp)farD++}}
      return JSON.stringify({sh,shBad,far,farPct:+(farD/Math.max(1,far)*100).toFixed(1),e:[seaShore(975,200),seaDeep(975,200),seaDeep(995,205)],w:[seaShore(15,860),seaDeep(10,860)]})}""")
    R=json.loads(r);R['ok']=R['shBad']==0 and R['farPct']>97 and not R['e'][1] and R['e'][2];res['deep']=R
    # 6. 그대로인 것: 바람섬 항구·보급지 0·식물섬 문과 원·동북섬 보급지·돌다리·항구 안전 구역
    r=await ev("""()=>{const p=PORTS.find(q=>q.i===1),s0=SUPS.find(s=>s.i===0),s2=SUPS.find(s=>s.i===2),pis=NOB.find(n=>n.k==='pis'),fs=typeof ferrySpot==='function'?ferrySpot(1):null;
      return JSON.stringify({port:[+p.x.toFixed(1),+p.z.toFixed(1),+p.dx.toFixed(2),+p.dz.toFixed(2)],s0:[s0.x,s0.z],s2:[s2.x,s2.z],pis:pis&&+pis.r.toFixed(1),gate:structs.some(s=>s.t==='pgate'),fs:fs&&[+fs.x.toFixed(1),+fs.z.toFixed(1)],
        safe:PORT_SAFE[1],sb:SB73.built.length,lhNob:NOB.filter(n=>n.k==='lh').length})}""")
    R=json.loads(r);R['ok']=abs(R['port'][0]-143.8)<3 and abs(R['port'][1]-779)<4 and R['s0']==[103,754] and R['s2']==[822,266] and R['pis'] and R['gate'] and R['fs'] and R['sb']==2 and R['lhNob']==5;res['keep']=R
    # 7. 채굴 텐트 새 모양: 땅 텐트와 다른 모델, 크기는 땅 텐트 안
    r=await ev("""()=>{const a=GEO.t74_minetent,b=GEO.mtent;a.computeBoundingBox();b.computeBoundingBox();const bb=a.boundingBox,b2=b.boundingBox,S=BUILDS.ptent.s||1.45;let tri=a.index?a.index.count/3:a.attributes.position.count/3;
      return JSON.stringify({diff:a!==b,tri:Math.round(tri),w:+(bb.max.x-bb.min.x).toFixed(2),d:+(bb.max.z-bb.min.z).toFixed(2),h:+(bb.max.y-bb.min.y).toFixed(2),z0:+bb.min.z.toFixed(2),z1:+bb.max.z.toFixed(2),pw:+((b2.max.x-b2.min.x)*S).toFixed(2),pd:+((b2.max.z-b2.min.z)*S).toFixed(2)})}""")
    R=json.loads(r);R['ok']=R['diff'] and R['tri']<30000 and R['w']<=R['pw']+.2 and R['d']<=R['pd']+.2;res['minetent']=R   # 땅 텐트(밧줄 말뚝까지)보다 크지 않게
    # 사진
    await ev("""()=>{const _uc=updCamera;updCamera=function(){if(window.__cam){const t=window.__cam;cam.position.set(t[0],t[1],t[2]);cam.lookAt(t[3],t[4],t[5]);cam.updateProjectionMatrix();return}return _uc.apply(this,arguments)};
      const _ue=updEnv;updEnv=function(){const r=_ue.apply(this,arguments);if(window.__cam&&scene.fog){scene.fog.near=900;scene.fog.far=2000}return r};S.time=.42;DEV.on=true}""")
    async def shot(name,c,px,pz,wait=2200):
        await ev(f"()=>{{P.x={px};P.z={pz};window.__cam={json.dumps(c)}}}");await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    async def gshot(name,px,pz,wait=2600):
        await ev(f"()=>{{window.__cam=null;P.x={px};P.z={pz};zoomK=1.3}}");await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,name),type='jpeg',quality=82)
    await shot('p76_ne.jpg',[905,120,330,900,0,200],905,205)
    await gshot('p76_ne_game.jpg',915,195)
    await gshot('p76_ne_coast.jpg',940,215)
    await shot('p76_sw.jpg',[100,170,1010,100,0,850],100,850)
    await gshot('p76_sw_game.jpg',95,860)
    await gshot('p76_sw_south.jpg',82,912)
    # 채굴 텐트 가까이
    await ev("""()=>{const x=915,z=200;window.__mt=addStruct({t:'minetent',x,z,r:0,own:1,at:Date.now()});}""")
    await shot('p76_minetent.jpg',[915+3.2,5.2,200+9.2,915,1.4,200],915,203,2600)
    await ev("""()=>{const t=addStruct({t:'ptent',x:921,z:200,r:0,own:1,at:Date.now()});window.__pt=t}""")
    await shot('p76_tents.jpg',[918+2,6.5,200+12.5,918,1.2,200],918,204,2600)
    await ev("()=>{window.__cam=null;removeStruct(window.__mt);removeStruct(window.__pt)}")
    await ev("""()=>{const c=document.createElement('canvas');c.width=c.height=600;c.getContext('2d').drawImage(MAPC,0,0,600,600);window.__map=c.toDataURL('image/png')}""")
    d=await ev("()=>window.__map");open(os.path.join(OUT,'p76_map.png'),'wb').write(base64.b64decode(d.split(',')[1]))
    # 8. 그린 블록 한 번 지우기(tidy.js 76차): 덧붙인 땅 선 안쪽 블록만, 다른 곳 작은 블록은 그대로, 두 번째는 안 지움
    if os.path.exists(BLK):
        r=await ev("""(t)=>{try{localStorage.removeItem('frontisle_tidy76')}catch(e){}crvLoad(t.trim().slice(5));const n0=CRV.map.size;const d=tidy76();const left=[...CRV.map.keys()].map(k=>k.split(',').slice(0,2).map(Number));
          const far=left.every(p=>!ADDLAND.some(N=>pgSD(N.pg,p[0]+.5,p[1]+.5)<2));const again=tidy76();crvLoad('');try{localStorage.removeItem('frontisle_tidy76')}catch(e){}return JSON.stringify({n0,d,left:left.length,far,again})}""",open(BLK).read())
        R=json.loads(r);R['ok']=R['d']>600 and R['left']>0 and R['far'] and R['again']==0;res['tidy']=R
    res['errs']={'list':errs[:5],'ok':not errs}
    print(json.dumps(res,ensure_ascii=False))
    print('ALL',all(v.get('ok') for v in res.values()))
