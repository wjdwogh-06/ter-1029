# 월드 무결성 검사: 부두/땅 겹침, 구조물 겹침, 물에 잠긴 구조물, 기울어진 땅 위 구조물, 건물 속 나무, 시작점 끼임
# 기대값: dockGround[0]=0, nOv=0, wet=[], tilt=[], objInStruct=0, objNearTown=0, errs=[]  (stuck 은 보급상자 위에서 시작하는 점 때문에 0이 아닐 수 있음)
async def steps(pg):
    ev=pg.evaluate
    r=await ev("""()=>{const o={};
      let bad=0,tot=0;const badP={};for(const d of DOCKS){for(let a=-d.hl+.3;a<=d.hl-.3;a+=.7)for(let b=-d.hw+.3;b<=d.hw-.3;b+=.6){const x=d.x+b*d.c+a*d.s,z=d.z-b*d.s+a*d.c;tot++;if(hAt(x,z)>d.y-.06){bad++;const p=PORTS.find(p=>dist(p.x,p.z,x,z)<60);badP[p?p.n:'?']=(badP[p?p.n:'?']||0)+1}}}o.dockGround=[bad,tot,badP];
      let ov=[];const L=structs.filter(s=>!sdef(s).pass&&!/^(iblk|pb_)/.test(s.t));   /* iblk·pb_: 특별한 곳의 보이지 않는 벽(일부러 겹치고 비탈·물에 놓임) */for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.x-b.x)>8||Math.abs(a.z-b.z)>8)continue;if(inStruct(a,b.x,b.z,Math.min(sdef(b).bx,sdef(b).bz)*.8)||inStruct(b,a.x,a.z,Math.min(sdef(a).bx,sdef(a).bz)*.8))ov.push(a.t+'/'+b.t+'@'+(a.x|0)+','+(a.z|0))}o.overlaps=ov.slice(0,12);o.nOv=ov.length;
      o.wet=structs.filter(s=>!s.in&&!/^(iblk|pb_)/.test(s.t)&&!sdef(s).pass&&!onDock(s.x,s.z)&&hAt(s.x,s.z)<.3).map(s=>s.t+'@'+(s.x|0)+','+(s.z|0)).slice(0,10);
      // ground tilt under each solid structure (corner height spread)
      o.tilt=L.map(s=>{const d=sdef(s),bx=d.bx*1,bz=d.bz*1;const hs=[[-bx,-bz],[bx,-bz],[-bx,bz],[bx,bz],[0,0]].map(q=>hAt(s.x+q[0],s.z+q[1]));return[s.t,(s.x|0),(s.z|0),+(Math.max(...hs)-Math.min(...hs)).toFixed(2)]}).filter(q=>q[3]>.3).slice(0,15);
      let inb=0;objs.forEach(ob=>{if(OBJT[ob.t].r)for(const s of L)if(Math.abs(s.x-ob.x)<7&&Math.abs(s.z-ob.z)<7&&inStruct(s,ob.x,ob.z,OBJT[ob.t].r*.6)){inb++;break}});o.objInStruct=inb;
      const tp=PORTS[0];let near=0;objs.forEach(ob=>{if(dist(ob.x,ob.z,VIL.px,VIL.pz)<24)near++});o.objNearTown=near;
      let stuck=0,sb=[];const spots=[...PORTS.map(p=>[p.x+p.dx*2,p.z+p.dz*2]),...SUPS.map(s=>[s.x,s.z+1.2]),[VIL.x,VIL.z],[VIL.mx,VIL.mz],...LHS.map(l=>[l.x,l.z+4.6])];for(const sp of spots)for(let k=0;k<25;k++){let e={x:sp[0],z:sp[1],pl:1};if(walk(e.x,e.z,.42,e)!==null){stuck++;if(k===0)sb.push('start@'+(sp[0]|0)+','+(sp[1]|0));continue}for(let s=0;s<300;s++){const an=Math.random()*6.28;moveEnt(e,Math.cos(an)*.5,Math.sin(an)*.5)}if(walk(e.x,e.z,.42,e)!==null)stuck++}o.stuck=stuck;o.sb=sb;
      let mx=0;for(let z=5;z<995;z+=3)for(let x=5;x<995;x+=3)mx=Math.max(mx,hAt(x,z));o.maxH=+mx.toFixed(2);
      o.types={};structs.forEach(s=>o.types[s.t]=(o.types[s.t]||0)+1);o.objs=objs.size;o.spawn=[P.x|0,P.z|0,+hAt(P.x,P.z).toFixed(2)];o.builds=Object.keys(BUILDS);return JSON.stringify(o)}""")
    print(r)
    await pg.screenshot(path=os.path.join(OUT,'spawn.jpg'),type='jpeg',quality=88)
