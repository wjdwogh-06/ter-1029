'use strict';
/* ===== 46차(규칙, 기획자 11-21 13:14): 등대 2곳 없애기 · 맵 가운데 등대 자리에 동굴 =====
   기획자: '맵 기준 맨 아래 가운데 등대는 그냥 없애 주고, 맵 가운데 등대도 없앨 건데 맨 가운데 등대가 있던 곳에는 동굴을 만들 거야.
           거기 동굴은 텐트처럼 이동시켜 주는데 이동까지만 구현해 줘'.
   - 없앤 등대: LH_SITES[0] '남쪽 바다 등대'(맨 아래 가운데), LH_SITES[4] '안쪽만 등대'(가운데) — core.js LH_GONE.
     바위섬 땅·둘레 바위는 그대로 둬요(그 둘레 낚시 포인트 메모5·14·15·항구16~21을 계속 쓸 수 있게). 등대 빠른 이동 목록·지도에서도 빠져요.
   - 가운데 바위섬 한가운데(등대가 서 있던 자리)에 동굴 입구(DECO.cave, 정면 +z). [동굴 들어가기] → 텐트처럼 화면이 바뀌어 동굴 안(INT 방 'cave')으로,
     앞 가운데 문에서 [나가기]로 나와요(입구 앞). 내부는 광산 갱도로 이어져요.
   - 동굴 안에서는: 아무것도 놓을 수 없어요(ghostPos), 텐트처럼 에너지가 빨리 차지 않아요(actors.js), 내 기지(S.home)도 안 바뀌어요.
   - 설치 금지 원 이름: 동굴 바위섬 '동굴', 등대를 없앤 바위섬 '바위섬'. */
DECO.cave={g:'cave_ent',s:1,bx:2.3,bz:1.45};
INT_ROOM.cave={hw:156,hd:132,lc:0xffd2a0,ld:10,li:1.25};
NOB_N.cave='동굴';NOB_N.isle='바위섬';
/* 입구 모양: 섬 바위와 같은 색의 큰 바위 덩어리 + 앞(+z)에 까만 굴 입구 + 입구 둘레 아치 바위 + 이끼 */
function caveGeo(){const R=[0x8f8e86,0x7a7972,0x6a6964,0x858479],DK=0x0b0a09,p=[];
 const rk=(r,c,pos,rot,sc)=>p.push(pt(new THREE.DodecahedronGeometry(r),c,pos,rot,sc));
 rk(2.1,R[1],[0,1.15,-.9],[.3,.5,.1],[1.25,.82,.95]);rk(1.6,R[0],[-1.55,.85,-.35],[1,.2,.4],[1,.85,1.05]);rk(1.55,R[2],[1.6,.8,-.4],[.2,1.3,.7],[1,.8,1]);
 rk(1.15,R[3],[-.2,2.1,-.6],[.7,.9,.3],[1.3,.6,1]);rk(.8,R[0],[-2.25,.4,.55],[.4,.1,.9],[1,.7,1]);rk(.75,R[2],[2.3,.38,.5],[.9,.4,.2],[1,.68,1]);
 /* 아치: 입구 양옆 기둥 바위 + 위 이맛돌 */
 rk(.72,R[1],[-1.05,.7,.62],[.2,.8,.3],[.8,1.35,.75]);rk(.7,R[3],[1.08,.68,.6],[.6,.3,.9],[.8,1.35,.75]);rk(.7,R[0],[0,1.72,.6],[.4,.6,.1],[1.55,.6,.8]);
 /* 굴 입구: 앞에서 보이는 까만 반원 + 안쪽으로 들어가는 깊이 */
 p.push(pt(new THREE.CircleGeometry(.95,20,0,Math.PI),DK,[0,.02,.86],0,[1,1.3,1]),pt(box(1.8,1.25,.9),DK,[0,.62,.45]));
 p.push(pt(box(1.5,.04,.7),0x2a2622,[0,.03,1.05]));   /* 입구 바닥(밟힌 흙) */
 for(let i=0;i<5;i++){const a=i*1.7,x=Math.cos(a)*(1.3+i*.25),z=-.2+Math.sin(a)*.5;p.push(pt(ico(.45,1),i%2?0x5f9c48:0x6aa64f,[x,1.55+Math.sin(i)*.4,z],0,[1.3,.22,1.1]))}
 for(let i=0;i<6;i++){const x=-1.9+i*.75,z=1.25+((i*37)%5)*.08;p.push(pt(new THREE.DodecahedronGeometry(.16+(i%3)*.05),R[i%4],[x,.08,z],[i,i*.7,0]))}
 const g=mg(p);g.computeBoundingSphere();return g}
// Metres in mine-local coordinates. A lower haulage loop meets an upper ore loop.
const MINE={
  ox:1250,oz:155,cell:4,tiles:new Set(),solids:[],
  halls:[[0,112,19,20],[0,63,32,25],[-63,54,36,26],[-115,6,34,31],
    [-92,-59,34,30],[-32,-90,31,28],[36,-101,32,30],[93,-64,38,27],
    [116,-9,36,31],[64,42,31,26],[5,-8,47,40]],
  routes:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,1],[2,10],[10,7],[10,5],[10,9]]
};
function mineField(x,z){
  let f=-Infinity;
  for(const [cx,cz,rx,rz] of MINE.halls)f=Math.max(f,(1-Math.hypot((x-cx)/rx,(z-cz)/rz))*Math.min(rx,rz));
  for(const [i,j] of MINE.routes){
    const [ax,az]=MINE.halls[i],[bx,bz]=MINE.halls[j],dx=bx-ax,dz=bz-az;
    const u=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
    f=Math.max(f,8-Math.hypot(x-ax-u*dx,z-az-u*dz));
  }
  return f+2*Math.sin(x*.15+z*.09)+1.6*Math.cos(z*.21-x*.055);
}
function mineTile(i,j){return MINE.tiles.has((i+64)*128+j+64)}
function mineOpen(x,z,r){
  for(const [dx,dz] of [[-r,-r],[r,-r],[-r,r],[r,r]])
    if(!mineTile(Math.floor((x+dx)/4),Math.floor((z+dz)/4)))return false;
  return !MINE.solids.some(([cx,cz,rad])=>Math.hypot(x-cx,z-cz)<rad+r);
}
function mineShale(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=192;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#d7d4d0';ctx.fillRect(0,0,192,192);
  for(let i=0;i<1700;i++){
    const x=hash(i,1,81)*192,y=hash(i,2,81)*192,w=1+hash(i,3,81)*5;
    ctx.fillStyle=i%4?'rgba(60,53,65,.16)':'rgba(255,252,239,.52)';
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y-w*.22);
    ctx.lineTo(x+w*.58,y+1+w*.16);ctx.fill();
  }
  const tex=new THREE.CanvasTexture(canvas);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}
function caveRoom(){
  if(INT.gr.cave)return;
  const C=INT.gr.cave=new THREE.Group();C.position.set(MINE.ox,0,MINE.oz);C.visible=false;INT.g.add(C);
  const floor=[],colors=[],chunks=new Map(),lamps=[];
  const stone=ico(1,0),unit=box(1,1,1),crystal=cone(1,1,5);
  function prop(shape,color,x,y,z,sx,sy,sz,ry=0,rz=0){
    const key=Math.floor(x/32)+','+Math.floor(z/32);
    if(!chunks.has(key))chunks.set(key,[]);
    chunks.get(key).push(pt(shape,color,[x,y,z],[0,ry,rz],[sx,sy,sz]));
  }
  function timber(x,z,r){
    for(const side of [-1,1])prop(unit,0x68513e,x+3.4*side*Math.cos(r),1.8,z-3.4*side*Math.sin(r),.5,3.6,.55,r);
    prop(unit,0x85644a,x,3.65,z,7.6,.55,.65,r);
  }
  function lamp(x,z){
    const halo=glow(0xffb46c,2.7,.40);halo.position.set(x,2.52,z);C.add(halo);
    lamps.push([x,z]);prop(unit,0x493c36,x,1.25,z,.22,2.5,.22);
    prop(unit,0xffbf63,x,2.5,z,.55,.7,.55);prop(unit,0x644f40,x,2.94,z,.72,.16,.72);
  }
  function track(a,b){
    const [x,z]=a,dx=b[0]-x,dz=b[1]-z,len=Math.hypot(dx,dz),r=Math.atan2(dx,dz);
    for(const side of [-.78,.78])prop(unit,0x919496,x+dx/2+side*Math.cos(r),.12,z+dz/2-side*Math.sin(r),.12,.14,len,r);
    for(let d=0;d<len;d+=2.4)prop(unit,0x71553e,x+dx*d/len,.055,z+dz*d/len,2.25,.12,.34,r);
  }
  for(const [i,j] of MINE.routes){
    const a=MINE.halls[i],b=MINE.halls[j],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,r=Math.atan2(b[0]-a[0],b[1]-a[1]);
    timber(x,z,r);lamp(x+3*Math.cos(r),z-3*Math.sin(r));
    if(i<9&&j===i+1)track(a,b);
  }
  // The entrance opens onto a rail cutting, with a loading bay visible from spawn.
  track([0,126],[0,112]);
  for(const z of [116,105,92]){
    timber(0,z,0);
    for(const side of [-1,1]){
      prop(unit,0xa58057,side*2.85,3.06,z,.27,1.65,.38,0,-side*.7);
      prop(unit,0x495158,side*3.4,.48,z,.63,.24,.66);
    }
    lamp(-3.9,z-.5);
  }
  for(const side of [-1,1])for(let n=0;n<8;n++){
    const x=side*(7+2.3*Math.sin(n*.83)),z=122-n*2.6;
    prop(stone,0x44475a,x,1.25,z,2.8,2.9,3.5,n);
    prop(stone,0x6b6570,x+side*.9,2.6,z,2.9,1.35,3.3,n+.35);
    if(n%3===0)prop(crystal,0x59b8c8,x-side*1.5,.95,z,.35,1.8,.5,n,.3*side);
    MINE.solids.push([x,z,1.9]);
  }
  function cart(x,z){
    prop(unit,0x353941,x,.78,z,2.25,.35,3.4);
    for(const side of [-1,1]){
      prop(unit,0x93745a,x+side,1.26,z,.22,.95,3.35);
      prop(unit,0x806049,x,1.26,z+side*1.58,2,.95,.22);
      for(const end of [-1,1])prop(stone,0x3d4147,x+side*1.03,.48,z+end,.42,.45,.45);
    }
    for(let n=0;n<7;n++)prop(stone,0x525461,x+hash(n,4,1)-.5,1.53,z+2*hash(n,7,3)-1,.65,.52,.72,n);
    MINE.solids.push([x,z,1.55]);
  }
  cart(3.8,112);cart(-68,56);cart(-84,-58);cart(90,-60);
  for(const [i,[x,z]] of MINE.halls.entries()){
    lamp(x+5,z+3);
    if([3,5,7,8].includes(i)){
      for(let n=0;n<22;n++){
        const a=hash(n,i,5)*6.28,l=hash(n,i,7)*7,h=.9+hash(n,i,2)*3;
        prop(crystal,i%2?0x56c4c3:0xa68adc,x+11+Math.cos(a)*l,h/2,z+Math.sin(a)*l,.5,h,.7,n,.16*Math.sin(n));
      }
    }else if(i!==0){
      for(let n=0;n<5;n++){
        const cx=x-8+n%3*1.9,cz=z+6+Math.floor(n/3)*2;
        prop(unit,0x866344,cx,.8,cz,1.7,1.6,1.7);
        for(const offset of [-.55,.55])prop(unit,0x474544,cx+offset,.82,cz,.12,1.65,1.74);
        MINE.solids.push([cx,cz,.9]);
      }
    }
  }
  // Abandoned hoist at the central junction, with a hanging bucket and cable drum.
  const hx=11,hz=-17;
  for(const dx of [-2.8,2.8])for(const dz of [-2,2]){
    prop(unit,0x765740,hx+dx,3.1,hz+dz,.65,6.2,.65);
    MINE.solids.push([hx+dx,hz+dz,.48]);
  }
  for(const dz of [-2,2])prop(unit,0x967657,hx,6.25,hz+dz,6.7,.65,.65);
  prop(unit,0x544c4c,hx,6.7,hz,.7,.45,5.6);
  prop(unit,0x6c706f,hx,4.8,hz,.09,3.5,.09);
  prop(stone,0x8b7663,hx,2.65,hz,1.05,.9,1.05,1);
  prop(unit,0x5c5147,hx-4,1.2,hz,2.3,2.4,1.8);
  // A flooded sump and a broken pipe identify the western pump chamber.
  const wx=-105,wz=-58;
  prop(stone,0x326272,wx,.04,wz,6,.14,4.5,.25);
  for(let n=0;n<7;n++){
    const a=n*.9;prop(stone,0x53646a,wx+5.8*Math.cos(a),.25,wz+4.2*Math.sin(a),1.3,.65,.85,a);
  }
  prop(unit,0x695746,wx-5,1.05,wz-3.6,5,.55,.6);
  prop(unit,0x84745f,wx-2.7,.7,wz-3.6,.7,1.1,.7);
  MINE.solids.push([wx,wz,4.5]);
  // Tall freestanding columns break up the silhouettes in the larger chambers.
  for(const i of [2,3,4,7,8,10]){
    const [x,z]=MINE.halls[i];for(const side of [-1,1]){
      const cx=x+side*16,cz=z-9;
      prop(stone,0x505362,cx,2.4,cz,3.8,6.3,3.5,i);
      prop(stone,0x63636d,cx+.8,.75,cz+1.1,3.7,2.4,3,i+.5);MINE.solids.push([cx,cz,3.3]);
    }
  }
  // Broken shale and spoil banks along chamber margins keep paths clear.
  for(const [idx,[cx,cz,rx,rz]] of MINE.halls.entries()){
    for(let n=0;n<26;n++){
      const a=hash(idx,n,41)*Math.PI*2;
      const r=.52+.32*hash(idx,n,43),x=cx+rx*r*Math.cos(a),z=cz+rz*r*Math.sin(a);
      const size=.24+.68*hash(idx,n,47);
      for(let k=0;k<3;k++)prop(stone,k===0?0x66616c:0x4b4a56,x+hash(n,k,31)*1.5,.09,z+hash(n,k,13),size,.18+k*.09,size*.76,a+k);
    }
  }
  const wheel=new THREE.TorusGeometry(.82,.13,5,16);
  prop(wheel,0xa18566,hx,6.4,hz,.95,.95,.95);
  prop(wheel,0x626773,hx-4,2.1,hz+.95,.85,.85,.85);
  for(let n=0;n<4;n++)prop(unit,0x82766a,hx-4,2.1,hz+1,.09,1.45,.09,0,n*Math.PI/4);
  for(let i=-40;i<40;i++)for(let j=-35;j<35;j++)if(mineField(i*4+2,j*4+2)>0)MINE.tiles.add((i+64)*128+j+64);
  // Build continuous, irregular cliff faces. Adjacent segments share endpoints.
  const wallPos=[],wallColor=[];
  const seams=[0x353342,0x534554,0x78635e,0x494756,0x666777];
  function ridge(x,z,k){
    const noise=hash(x,z,11+k);
    const heightScale=z>=122&&Math.abs(x)<16?.16:1;
    return [x+.9*(hash(x,z,21+k)-.5),[0,.85,1.16,2.65,4.4,5.2][k]*heightScale*(.76+.48*noise)-.16,z+.9*(hash(x,z,31+k)-.5)];
  }
  function cliff(ax,az,bx,bz){
    for(let k=0;k<5;k++){
      const a=ridge(ax,az,k),b=ridge(bx,bz,k),c=ridge(ax,az,k+1),d=ridge(bx,bz,k+1);
      const col=new THREE.Color(seams[k]).convertSRGBToLinear().multiplyScalar(.78+.4*hash(ax,bz,k));
      for(const v of [a,c,b,b,c,d]){wallPos.push(...v);wallColor.push(col.r,col.g,col.b)}
    }
  }
  function vertex(x,z,v){
    let light=0;for(const [lx,lz] of lamps)light=Math.max(light,Math.max(0,1-Math.hypot(x-lx,z-lz)/10));
    const grain=.78+.18*Math.sin(x*.21+z*.13)+.16*hash(x,z,3);
    floor.push(x,0,z);colors.push(.051*v*grain+.26*light,.055*v*grain+.146*light,.075*v*grain+.053*light);
  }
  for(let i=-40;i<40;i++)for(let j=-35;j<35;j++){
    if(!mineTile(i,j))continue;
    const x=4*i,z=4*j,v=.88+.25*hash(i,j,18);
    for(const [a,b] of [[0,0],[0,4],[4,4],[0,0],[4,4],[4,0]])vertex(x+a,z+b,v);
    for(const [di,dj] of [[0,-1],[0,1],[-1,0],[1,0]]){
      if(mineTile(i+di,j+dj))continue;
      if(di)cliff(x+(di>0?4:0),z,x+(di>0?4:0),z+4);
      else cliff(x,z+(dj>0?4:0),x+4,z+(dj>0?4:0));
      if(z>=122&&Math.abs(x)<16)continue;
      const h=1.2+hash(i,j,19)*1.8;
      prop(stone,hash(i,j,8)>.5?0x525665:0x676273,x+2+di*3.4,.7,z+2+dj*3.4,3,h,3,hash(i,j,9)*3);
    }
  }
  // Daylight, paired posts and a pale threshold distinguish the return tunnel.
  lamp(-3,124);lamp(3,124);
  prop(unit,0xc2dfe5,0,.035,127,4,.07,1.6);
  for(const side of [-1,1]){
    for(let n=0;n<2;n++)prop(stone,0x69616a,side*(2.9+.07*n),.65+n*.94,128,1.3,1.05,1.3,n*.8);
    prop(unit,0xb99c70,side*3.1,2.05,128,.7,.19,.8);
  }
  const walls=new THREE.BufferGeometry();
  walls.setAttribute('position',new THREE.Float32BufferAttribute(wallPos,3));
  walls.setAttribute('color',new THREE.Float32BufferAttribute(wallColor,3));
  walls.computeVertexNormals();
  C.add(new THREE.Mesh(walls,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(floor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const uv=[];
  for(let n=0;n<floor.length;n+=3)uv.push(floor[n]/7,floor[n+2]/7);
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  C.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,map:mineShale()})));
  const material=new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x201c22});
  for(const parts of chunks.values())C.add(new THREE.Mesh(mg(parts),material));
  const backing=new THREE.Mesh(new THREE.PlaneGeometry(420,370),new THREE.MeshBasicMaterial({color:0x101019}));
  backing.rotation.x=-Math.PI/2;backing.position.y=-.16;C.add(backing);
}
// Isolate the underground floor from surface resources and actors.
const mineFloorDock={y:INT.y};
const outsideDock=onDock;
onDock=function(x,z){
  if(INT.on&&INT.kind==='cave'&&Math.abs(x-INT.x-MINE.ox)<170&&Math.abs(z-INT.z-MINE.oz)<145)return mineFloorDock;
  return outsideDock(x,z);
};
const oldMineWalk=intWalk,oldMineCam=intCam,oldMineLight=intLight;
intWalk=function(x,z,r){
  if(INT.kind!=='cave')return oldMineWalk(x,z,r);
  return mineOpen(x-INT.x-MINE.ox,z-INT.z-MINE.oz,r)?null:true;
};
intCam=function(ct){
  if(INT.kind!=='cave')return oldMineCam(ct);
  const d=cam.aspect<1?28:30;
  cam.position.set(P.x,INT.y+d,P.z+d*.9);cam.lookAt(P.x,INT.y+.6,P.z);
};
intLight=function(dk){
  oldMineLight(dk);
  if(INT.kind==='cave'){
    hemi.intensity=.82;sun.intensity=.55;
    INT.L.position.set(P.x-INT.x,3,P.z-INT.z);
    sun.position.set(P.x-10,INT.y+18,P.z+8);sun.target.position.set(P.x,INT.y,P.z);
  }
};
const oldMineRoom=intRoom;
intRoom=function(kind){
  if(kind==='cave'){intBuild();caveRoom()}
  oldMineRoom(kind);INT.L.position.set(0,2.5,.5);
};

// The mine doorway has a touch target independent of equipped tools.
const mineExitButton=document.createElement('button');
mineExitButton.className='btn';
mineExitButton.textContent='↗ 지상으로';
mineExitButton.style.cssText='position:absolute;left:50%;top:18%;transform:translateX(-50%);pointer-events:auto;z-index:8';
mineExitButton.hidden=true;
$('ui').appendChild(mineExitButton);
function nearMineExit(){
  const door=INT.it[0];
  return INT.on&&INT.kind==='cave'&&door&&Math.hypot(P.x-door.x,P.z-door.z)<=4;
}
mineExitButton.onclick=()=>{if(nearMineExit()&&!busy)intLeave()};
const beforeMineUpdate=intUpd;
intUpd=function(){
  beforeMineUpdate();
  mineExitButton.hidden=!nearMineExit()||busy||!!panel;
};
const beforeMineOut=intOut;
intOut=function(){mineExitButton.hidden=true;beforeMineOut()};

/* 들어가기: 텐트(intEnter)와 같지만 내 기지(S.home)를 바꾸지 않아요 */
function caveEnter(s){if(P.dead||busy||INT.on)return;const df=sdef(s);
 fadeDo('동굴 안으로…',()=>{intRoom('cave');setBuild(null);if(fishing)endFish();INT.ret={x:s.x+Math.sin(s.r||0)*(df.bz+1.1),z:s.z+Math.cos(s.r||0)*(df.bz+1.1)};INT.s=s;INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x+MINE.ox,z:INT.z+MINE.oz+127,yo:INT.y-hAt(INT.x+MINE.ox,INT.z+MINE.oz+127),hp:1e9})];
  P.x=INT.x+MINE.ox;P.z=INT.z+MINE.oz+124;camT.set(P.x,INT.y,P.z);P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(170,.2,'sine',.05,.6);sfx(120,.3,'sine',.03,.5)})}
{const _sl=sLabel;sLabel=function(s){if(s.t==='cave')return INT.on?null:'동굴 들어가기';return _sl(s)}}
{const _it=interact;interact=function(){const t=target;if(t&&t.k==='s'&&t.s.t==='cave'){if(inp.actEdge)caveEnter(t.s);return}_it()}}
{const _gp=ghostPos;ghostPos=function(){const pr=_gp();if(INT.on&&INT.kind==='cave'){pr.ok=false;pr.why='동굴 안에는 아무것도 놓을 수 없어요'}return pr}}
/* 없앤 등대: 등대 구조물·불빛을 치우고, 가운데 바위섬에 동굴 입구 */
{const _vp=villageAndPOI;villageAndPOI=function(){_vp();if(!GEO.cave_ent)GEO.cave_ent=caveGeo();
 for(const i of LH_GONE){const s=structs.find(q=>q.t==='lighthouse'&&q.li===i);if(s)removeStruct(s)}if(POI.lhS)POI.lhS=POI.lhS.filter(s=>structs.includes(s));
 const L=LHS[LH_CAVE];CAVE.s=addStruct({t:'cave',x:L.x,z:L.z,r:0})}}
const CAVE={s:null};
/* 설치 금지 원 이름(등대 → 동굴·바위섬) */
{const _nb=buildNoBuild;buildNoBuild=function(){_nb();for(const n of NOB){if(n.k!=='lh')continue;const i=LHS.findIndex(L=>Math.abs(L.x-n.x)<.01&&Math.abs(L.z-n.z)<.01);if(i===LH_CAVE)n.k='cave';else if(LH_GONE.includes(i))n.k='isle'}}}
