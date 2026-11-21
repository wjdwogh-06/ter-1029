'use strict';
// Persistent solo residents. Destinations are rebuilt from the current world's objects.
const residents = (() => {
  const names = '모래 달래 보리 윤슬 갈대 노을 산호 달콩 미루 봄비 여울 솔개 칼바람 회오리 까치 잿빛 해무 파도 매화 가람'.split(' ');
  const views = new Map(), goals = new Map();
  let world, elapsed = 0, banks, boxes, buyers;
  const near = (b,q) => dist(b.x,b.z,q.x,q.z);
  const nearest = (b,list) => list.reduce((a,q)=>!a || near(b,q)<near(b,a)?q:a,null);
  function initialize() {
    for (const actor of views.values()) actor.dispose();
    views.clear(); goals.clear(); world=S;
    boxes=structs.filter(s=>s.li!=null && [1,2,4].includes(sdef(s).loot));
    buyers=structs.filter(s=>s.t==='fbuy');
    banks=[];
    for (const sp of FSP) for (let i=0;i<32;i++) {
      const a=i*Math.PI/8, r=i<16?5:7.8, x=sp.x+r*Math.cos(a), z=sp.z+r*Math.sin(a);
      if ((onDock(x,z)||hAt(x,z)>.4) && !walk(x,z,.35,{pl:true})) {banks.push({x,z,sp});break}
    }
    if (!S.residents) S.residents=names.map((name,i)=>{
      const p=portSpawn(i===0||i===10?nearest(P,PORTS).i:i%PORTS.length);
      return {name,id:i,x:p.x,z:p.z,coins:100,bag:{},dex:{},wait:Math.random()*2,hp:100};
    });
    for(const b of S.residents) if(b.home && !structs.some(s=>s.resident===b.id))
      addStruct({...b.home,resident:b.id});
  }
  function set(b,kind,q) {if(q) goals.set(b.id,{kind,q,age:0});}
  function choose(b) {
    const port=nearest(b,PORTS);
    if(b.id>=10 && b.armed && !INT.on && !P.dead && !inSafe(P.x,P.z) && near(b,P)<28)
      return set(b,'raid',P);
    if(b.id>=10 && b.armed && S.bag && near(b,S.bag)<55) return set(b,'bag',S.bag);
    if(b.trip || Math.random()<(b.id>=10 && !b.armed?0:.16)) return set(b,'port',ferrySpot(port.i)||port);
    if(b.id>=10) {
      const available=boxes.filter(s=>boxLeft(boxGet(s)) || !S.looted[s.li] || S.day-S.looted[s.li]>=boxCd(s));
      const chest=nearest(b,available);
      if(chest) return set(b,'loot',chest);
      return set(b,'port',port);
    }
    if(b.home?.t==='ptent' && b.coins>=500){
      if((b.wood||0)>=120)return set(b,'upgrade',b.home);
      const trees=[];
      for(const [key,o] of objs)if(!o.re && OBJT[o.t].drop?.[0]==='wood' && near(b,o)<70)trees.push({...o,key});
      if(trees.length)return set(b,'wood',nearest(b,trees));
    }
    if(b.coins>=600 && !b.home) {
      for(let i=0;i<32;i++){
        const x=b.x+rand(-40,40),z=b.z+rand(-40,40);
        if(hAt(x,z)>1 && !blocked(x,z,3) && !nobAt(x,z,4) && !zoneWhy('ptent',x,z,0,4))
          return set(b,'build',{x,z});
      }
    }
    if(Object.values(b.bag).reduce((a,n)=>a+n,0)>=4) return set(b,'sell',nearest(b,buyers)||port);
    const local=banks.slice().sort((a,c)=>near(b,a)-near(b,c)).slice(0,4);
    set(b,'fish',pick(local));
  }
  function arrive(b,g) {
    const q=g.q;
    if(g.kind==='fish'){
      if(!g.cast){g.cast=true;b.wait=rand(8,15);return}
      const f=pickFish(q.sp); b.dex[f.id]=(b.dex[f.id]||0)+1;b.bag[f.id]=(b.bag[f.id]||0)+1;
    } else if(g.kind==='sell'){
      for(const [id,n] of Object.entries(b.bag)) b.coins+=ITEMS[id].p*n;
      b.bag={};
    } else if(g.kind==='port'){
      if(!b.trip){b.trip=pick(PORTS.filter(p=>p!==nearest(b,PORTS))).i+1;b.wait=5;return}
      const p=ferrySpot(b.trip-1)||portSpawn(b.trip-1);b.x=p.x;b.z=p.z;b.trip=0;
    } else if(g.kind==='wood'){
      const o=objs.get(q.key);
      if(o && !o.re){o.hp-=Math.max(1,OBJT[o.t].hp/8);if(o.hp<=0){b.wood=(b.wood||0)+OBJT[o.t].drop[1];o.re=OBJT[o.t].re;depSet.add(q.key)}refreshObj(o)}
    } else if(g.kind==='upgrade'){
      const tent=structs.find(s=>s.resident===b.id);
      if(tent){removeStruct(tent);b.home.t='phouse';addStruct({...b.home,resident:b.id});b.coins-=500;b.wood-=120}
    } else if(g.kind==='build'){
      if(!zoneWhy('ptent',q.x,q.z,0,4)){
        b.home={t:'ptent',x:q.x,z:q.z,r:0};addStruct({...b.home,resident:b.id});b.coins-=600;
      }
    } else if(g.kind==='loot'){
      let box=boxGet(q);
      if(!box && (!S.looted[q.li] || S.day-S.looted[q.li]>=boxCd(q))){
        box=S.box[q.li]={d:S.day,c:Object.entries(lootGen(q))};S.looted[q.li]=S.day;
      }
      if(box){const j=box.c.findIndex(Boolean);if(j>=0){const [id,n]=box.c[j];box.c[j]=null;b.bag[id]=(b.bag[id]||0)+n;b.armed=true}}
    } else if(g.kind==='bag' && S.bag===q){
      const id=Object.keys(q.inv).find(k=>q.inv[k]>0);
      if(id){b.bag[id]=(b.bag[id]||0)+1;if(!--q.inv[id])delete q.inv[id]}
      if(!Object.keys(q.inv).length){S.bag=null;placeBag()}
    } else if(g.kind==='raid' && !inSafe(b.x,b.z) && !inSafe(P.x,P.z) && !INT.on && !P.dead){
      hurtPlayer(6);
    }
    goals.delete(b.id);b.wait=rand(1,3);
  }
  function update(b,dt){
    b.wait-=dt;
    if(b.wait>0)return;
    if(!goals.has(b.id))choose(b);
    if(b.armed && !P.dead && !INT.on && !inSafe(P.x,P.z) && near(b,P)<18)set(b,'raid',P);
    const g=goals.get(b.id);if(!g)return;
    if(g.kind==='raid' && (P.dead||INT.on||inSafe(P.x,P.z)||near(b,P)>35)){goals.delete(b.id);return}
    const q=g.q,d=near(b,q),reach=['wood','upgrade','loot'].includes(g.kind)?3.8:g.kind==='sell'?3:1.4;
    if(d<reach){arrive(b,g);return}
    const a=Math.atan2(q.x-b.x,q.z-b.z),step=Math.min(d,dt*3.8);
    for(const offset of [0,.65,-.65,1.4,-1.4]){
      const r=a+offset,x=b.x+step*Math.sin(r),z=b.z+step*Math.cos(r);
      if(!walk(x,z,.35,{pl:true})){b.x=x;b.z=z;b.r=r;break}
    }
    if((g.age+=dt)>100){goals.delete(b.id);b.trip=0}
  }
  function tick(dt){
    if(window.MP||mode!=='play')return;
    if(world!==S)initialize();
    elapsed+=dt;
    const step=elapsed>=.15?elapsed:0;if(step)elapsed=0;
    for(const b of S.residents){
      if(step)update(b,step);
      let a=views.get(b.id);
      if(INT.on||near(P,b)>48){if(a){a.dispose();views.delete(b.id)}continue}
      if(!a){a=new Actor('hero');views.set(b.id,a)}
      const weapon=b.id<10?'rod':Object.keys(b.bag).find(k=>WEAP[k]&&WEAP[k].melee)||'fist';
      if(a.wid!==weapon)a.weapon(weapon);
      a.play(b.wait>0?'Idle':'Walking_A');a.set(b.x,b.z,b.r||0);a.mixer.update(dt);
    }
  }
  function hit(x,z,dx,dz,range,damage){
    if(window.MP || INT.on || inSafe(x,z))return range;
    let target, best=range;
    for(const b of S.residents||[]){
      const rx=b.x-x,rz=b.z-z,t=rx*dx+rz*dz;
      if(t>=0 && t<best && Math.abs(rx*dz-rz*dx)<.85 && !inSafe(b.x,b.z)){target=b;best=t}
    }
    if(target){
      target.hp-=damage;
      if(target.hp<=0){const p=portSpawn();target.x=p.x;target.z=p.z;target.hp=100;target.bag={};target.armed=false;target.wait=8}
      goals.delete(target.id);
    }
    return best;
  }
  return {tick,hit};
})();
