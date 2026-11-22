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
  ox:1250,oz:155,cell:4,samples:new Float32Array(81*71),solids:[],
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
function mineSample(i,j){return MINE.samples[(i+40)*71+j+35]}
// Use the same two triangles per cell for the floor, walls, collision and taps.
function mineFloorAt(x,z){
  const u=x/4,v=z/4,i=Math.floor(u),j=Math.floor(v);
  if(i < -40||i>=40||j < -35||j>=35)return false;
  const dx=u-i,dz=v-j,a=mineSample(i,j),c=mineSample(i+1,j+1);
  return (dx<dz?a*(1-dz)+mineSample(i,j+1)*(dz-dx)+c*dx:
    a*(1-dx)+mineSample(i+1,j)*(dx-dz)+c*dz)>0;
}
function mineOpen(x,z,r){
  for(const [dx,dz] of [[-r,-r],[r,-r],[-r,r],[r,r]])
    if(!mineFloorAt(x+dx,z+dz))return false;
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
  // Hewn pit props retain a few bark faces and a pale cut at the end of the cap.
  const timberParts=[],post=cyl(.25,.32,3.55,9),cap=cyl(.32,.35,7.55,10);
  for(const side of [-1,1]){
    const tilt=-side*.055;
    timberParts.push(pt(post,side<0?0x916748:0xa57a53,[side*3.38,1.77,0],[0,.13,tilt]));
    timberParts.push(pt(cyl(.33,.34,.19,10),0x57575a,[side*3.44,.38,0]));
    timberParts.push(pt(cyl(.25,.24,1.34,8),0x896344,[side*2.99,3.04,0],[0,0,-side*.79]));
    timberParts.push(pt(cyl(.275,.275,.055,10),0xc69564,[side*3.79,3.61,0],[0,0,Math.PI/2]));
    timberParts.push(pt(cyl(.17,.17,.06,9),0xa97c55,[side*3.80,3.61,0],[0,0,Math.PI/2]));
    for(const offset of [-.08,.08])
      timberParts.push(pt(cyl(.355,.355,.085,10),0x514d47,[side*3.36+offset,3.61,0],[0,0,Math.PI/2]));
  }
  timberParts.push(pt(cap,0x96704c,[0,3.61,0],[0,0,Math.PI/2]));
  const frame=mg(timberParts);
  function timber(x,z,r){
    prop(frame,null,x,0,z,1,1,1,r);
    for(const side of [-1,1])MINE.solids.push([x+side*3.38*Math.cos(r),z-side*3.38*Math.sin(r),.30]);
  }
  // One reusable oil lantern: rolled base, bulged chimney, guard wires and bail.
  function turned(points){
    return new THREE.LatheGeometry(points.map(([radius,height])=>new THREE.Vector2(radius,height)),12);
  }
  const lanternParts=[
    pt(turned([[.01,0],[.26,0],[.30,.045],[.28,.11],[.21,.16],[.16,.22]]),0x59696a),
    pt(turned([[.15,.18],[.19,.23],[.225,.39],[.205,.51],[.14,.62]]),0xffce78),
    pt(turned([[.15,.58],[.27,.61],[.29,.65],[.21,.69],[.14,.76],[.13,.82],[.01,.84]]),0x4c6569),
    pt(new THREE.TorusGeometry(.24,.025,4,12,Math.PI),0xa68a61,[0,.82,0])
  ];
  for(let i=0;i<4;i++){
    const a=Math.PI*i/2+.55;
    const path=new THREE.CatmullRomCurve3([[.16,.14],[.255,.34],[.235,.52],[.17,.64]].map(([r,h])=>new THREE.Vector3(r*Math.cos(a),h,r*Math.sin(a))));
    lanternParts.push(pt(new THREE.TubeGeometry(path,4,.019,4,false),0x6f604d));
  }
  const lantern=mg(lanternParts);
  function lamp(x,z,r=0){
    // The hanger bends out over the path, with the bail resting in its hook.
    const px=x+.49*Math.cos(r),pz=z-.49*Math.sin(r);
    prop(cyl(.082,.115,3.0,8),0x755a43,px,1.50,pz,1,1,1);
    prop(unit,0x565c5b,(px+x)/2,3.01,(pz+z)/2,.62,.078,.082,r);
    prop(cyl(.034,.034,.23,8),0x625b4e,x,2.92,z,1,1,1);
    prop(lantern,null,x,1.76,z,1,1,1,r);
    const halo=glow(0xffb15a,2.35,.40);halo.position.set(x,2.19,z);C.add(halo);
    lamps.push([x,z]);
  }
  // Sweep the ballast and rail sections through shared cross sections on bends.
  function railway(points){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));
    const length=curve.getLength(),count=Math.ceil(length/1.55);
    const cross=[[ -1.42,.012],[-1.12,.066],[1.12,.066],[1.42,.012]];
    const rail=[[-.095,.135],[-.095,.157],[-.033,.165],[-.033,.22],[-.063,.23],[-.063,.257],[.063,.257],[.063,.23],[.033,.22],[.033,.165],[.095,.157],[.095,.135]];
    const steel=[0x6a5145,0x765a4e,0x6e554b,0x715949,0x786653,0xb5afa0,0x817361,0x655347,0x654b40,0x775e4d,0x644f45];
    let prev;
    for(let k=0;k<=count;k++){
      const t=k/count,p=curve.getPointAt(t),v=curve.getTangentAt(t);
      const offset=(d,h)=>[p.x+d*v.z,h,p.z-d*v.x];
      const row=[cross.map(([d,h])=>offset(d,h)),...[-.78,.78].map(side=>rail.map(([d,h])=>offset(side+d,h)))];
      if(prev){
        const positions=[],colors=[];
        for(let strip=0;strip<row.length;strip++)for(let n=1;n<row[strip].length;n++){
          const col=new THREE.Color(strip?steel[n-1]:[0x514b4a,0x645a55,0x534b49][n-1]).convertSRGBToLinear();
          for(const vertex of [prev[strip][n-1],row[strip][n-1],row[strip][n],prev[strip][n-1],row[strip][n],prev[strip][n]]){
            positions.push(...vertex);colors.push(col.r,col.g,col.b);
          }
        }
        const g=new THREE.BufferGeometry();
        g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
        const key=Math.floor(p.x/32)+','+Math.floor(p.z/32);
        if(!chunks.has(key))chunks.set(key,[]);
        chunks.get(key).push(g);
      }
      prev=row;
      const yaw=Math.atan2(v.x,v.z)+(hash(k,4,9)-.5)*.055;
      prop(unit,k%3?0x755a49:0x95745a,p.x,.098,p.z,2.06+.17*hash(k,6,2),.09,.24+.055*hash(k,8,2),yaw);
    }
    return curve;
  }
  const mainLine=railway([[0,126],[0,115],[-1,103],[0,78],[0,68],[-5,61],
    [-52,55],[-64,53],[-76,43],[-106,15],[-115,4],[-111,-13],[-95,-52],[-90,-60],[-75,-68],[-32,-90]]);
  const siding=railway([[-1,103],[0,106],[2.4,109],[4.2,113],[4.6,119]]);
  const oreLine=railway([[-32,-90],[-18,-92],[33,-101],[46,-96],[90,-66],[96,-55],[116,-9]]);
  function cart(line,fraction,loaded){
    const pos=line.getPointAt(fraction),tangent=line.getTangentAt(fraction),yaw=Math.atan2(tangent.x,tangent.z);
    const parts=[],wheel=cyl(.31,.31,.16,12),iron=0x454b51,paint=0x426666;
    for(const end of [-.76,.76])for(const side of [-1,1]){
      parts.push(pt(wheel,iron,[side*.78,.49,end],[0,0,Math.PI/2]));
      parts.push(pt(cyl(.13,.13,.06,8),0xab9170,[side*.89,.49,end],[0,0,Math.PI/2]));
    }
    parts.push(pt(lkRb(1.55,.22,2.42,.06,.035),iron,[0,.73,0]));
    for(let row=0;row<3;row++){
      const half=.72+row*.095,y=.93+row*.24;
      for(const side of [-1,1]){
        parts.push(pt(box(.12,.25,2.38),row===2?0x608782:paint,[side*half,y,0],[0,0,-side*.28]));
        parts.push(pt(box(2*half,.24,.12),paint,[0,y,side*1.14]));
      }
    }
    for(const side of [-1,1]){
      parts.push(pt(box(.16,.11,2.55),0xb4a583,[side*.98,1.61,0]));
      for(const end of [-.83,.83])parts.push(pt(box(.06,.83,.13),iron,[side*.87,1.18,end],[0,0,-side*.28]));
    }
    if(loaded)for(let n=0;n<10;n++)parts.push(pt(stone,n%3?0x676571:0xa58962,[(n%3-1)*.46,1.35+hash(n,2,4)*.22,(Math.floor(n/3)-1.4)*.47],[.4,n,.3],[.43,.33,.48]));
    prop(mg(parts),null,pos.x,.076,pos.z,1,1,1,yaw);
    MINE.solids.push([pos.x,pos.z,1.35]);
  }
  // A hand throw stands beside the points where the loading spur leaves the main line.
  prop(lkRb(.70,.16,.91,.07,.035),0x54585a,1.32,.16,104.1,1,1,1);
  prop(cyl(.16,.18,.42,10),0x676456,1.32,.43,104.1,1,1,1);
  prop(cyl(.046,.055,.86,8),0x685b4c,1.53,.94,104.1,1,1,1,0,-.52);
  prop(cyl(.086,.086,.23,9),0xc29555,1.76,1.34,104.1,1,1,1,0,-.52);
  const coil=new THREE.CatmullRomCurve3(Array.from({length:53},(_,i)=>{
    const a=i*Math.PI/6,r=.38+.003*i;
    return new THREE.Vector3(r*Math.cos(a),.06+.032*(i/12),r*Math.sin(a));
  }));
  prop(new THREE.TubeGeometry(coil,52,.041,5,false),0x987956,6.6,.38,115.4,1,1,1);
  cart(siding,.78,true);cart(mainLine,.55,false);cart(oreLine,.83,true);
  // Loading dock between the siding and the east wall. The planks face the cart.
  function landing(x,z,boards){
    for(let n=0;n<boards;n++)
      prop(unit,n%3===0?0xa57850:0x926a49,x,.23,z+n*.54,3.2,.30,.51);
    for(const side of [-1,1])prop(unit,0x55483d,x+side*1.15,.08,z+(boards-1)*.27,.28,.16,boards*.54);
  }
  landing(7.45,113,12);
  function cargo(name,x,y,z,scale,angle,radius){
    prop(GEO[name],null,x,y,z,scale,scale,scale,angle);
    if(radius)MINE.solids.push([x,z,radius]);
  }
  // Retaining boards hold the cut behind the deck; the short awning covers the far end.
  const cedar=0x946844,ironBlue=0x4e6267;
  for(const z of [112.7,115.9,119.1]){
    prop(unit,cedar,9.35,1.55,z,.26,3.1,.28);
    prop(unit,ironBlue,9.35,.33,z,.31,.35,.33);
  }
  for(let row=0;row<4;row++)
    prop(unit,row%2?0x795740:0x8c654a,9.48,.48+row*.36,115.9,.20,.32,6.65);
  for(const z of [112.7,115.9]){
    prop(unit,cedar,6.12,1.77,z,.22,2.86,.24);
    prop(unit,0xb0885e,7.78,3.04,z,3.7,.17,.25,0,-.11);
  }
  for(let n=0;n<7;n++)
    prop(unit,n%2?0x506f70:0x607f7d,7.76,3.23,112.51+n*.6,3.95,.105,.61,0,-.11);
  // Open buffer stop at the end of the siding.
  prop(unit,0x9e7754,4.6,.68,119.45,2.35,.30,.33);
  for(const x of [3.83,5.37])prop(unit,ironBlue,x,.40,119.52,.21,.8,.24);
  cargo('crate_A_big',7.6,.38,117.45,4.6,.06,.82);
  cargo('crate_B_small',7.9,.38,115.55,4.3,-.18,.57);
  cargo('sack',6.7,.38,118.6,5.4,.36,.4);
  cargo('barrel',-57,0,58,4.6,.24,.65);
  cargo('crate_A_big',-55.4,0,58.5,4.6,-.16,.85);
  cargo('sack',-56,0,60,5.5,-.7,.45);
  for(const [x,z,r] of [[0,103,0],[0,91,0],[-33,57,1.42],[-85,34,.81],[-104,-26,-.33],[63,-84,1.0]]){
    timber(x,z,r);
    lamp(x-3.87*Math.cos(r),z+3.87*Math.sin(r),r);
  }
  lamp(8.7,118.7);lamp(-57,60.8);
  // Veins run through exposed shelves along the wall, tapering at either end.
  for(const [x,z,r,color] of [[-138,6,.12,0x7eb7b4],[-32,-112,1.28,0xb799b5],[110,-78,.91,0x8bb6b6]]){
    for(let n=-4;n<=4;n++){
      const cx=x+n*1.65*Math.cos(r),cz=z+n*1.65*Math.sin(r)+Math.sin(n*.8)*.62;
      const size=1.15+(4-Math.abs(n))*.37;
      prop(stone,0x535461,cx,size*.35,cz,size*1.3,size*.93,size,n*.48);
      for(let k=0;k<3;k++)prop(crystal,color,cx+.35*k,size*.62+.17*k,cz+.23*k,.24,size*(.48+.16*k),.28,n+k,.28-.23*k);
      MINE.solids.push([cx,cz,size*.65]);
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
  prop(cyl(.72,.52,.85,10),0x526565,hx,2.7,hz,1,1,1);
  prop(cyl(.76,.76,.10,10),0xb59c78,hx,3.12,hz,1,1,1);
  prop(cyl(.62,.62,.04,10),0x363539,hx,3.18,hz,1,1,1);
  lamp(hx-3.2,hz+2.3);
  prop(unit,0x5c5147,hx-4,1.2,hz,2.3,2.4,1.8);
  // A flooded sump and a broken pipe identify the western pump chamber.
  const wx=-105,wz=-58;
  prop(stone,0x326272,wx,.04,wz,6,.14,4.5,.25);
  for(let n=0;n<7;n++){
    const a=n*.9;prop(stone,0x53646a,wx+5.8*Math.cos(a),.25,wz+4.2*Math.sin(a),1.3,.65,.85,a);
  }
  const pipe=cyl(.26,.26,1,10);
  prop(pipe,0x628181,wx-6,1.05,wz-3.6,1,6,1,0,Math.PI/2);
  for(const dx of [-8.5,-6,-3.5])prop(cyl(.36,.36,.13,10),0xba9c78,wx+dx,1.05,wz-3.6,1,1,1,0,Math.PI/2);
  prop(lkRb(1.7,1.15,1.32,.12,.055),0x527775,wx-9,.68,wz-3.6,1,1,1);
  lamp(wx-10,wz-2.4);
  prop(unit,0x84745f,wx-2.7,.7,wz-3.6,.7,1.1,.7);
  MINE.solids.push([wx,wz,4.5]);
  // Asymmetric buttresses sit at the rock face, clear of the haul roads.
  for(const [cx,cz,r,h] of [[-18,116,.31,2.4],[-15,111,.6,1.5],[22,65,-.6,3.6],[-136,-3,.51,3.2],
    [-119,-60,.42,4.1],[18,-120,.8,2.7],[118,-76,.3,2.2],[142,-4,-.3,3.7],[36,4,.52,3.4]]){
    for(let k=0;k<3;k++)prop(stone,[0x565565,0x676473,0x777077][k],cx+k*.46,h*(.19+k*.30),cz-k*.26,
      4.2-k*.5,h*(.56-k*.10),2.9-k*.16,r+k*.14);
    MINE.solids.push([cx,cz,2.5]);
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
  for(let i=-40;i<=40;i++)for(let j=-35;j<=35;j++)
    MINE.samples[(i+40)*71+j+35]=mineField(i*4,j*4);
  lamp(-3,124);lamp(3,124);
  // Build continuous, irregular cliff faces. Adjacent segments share endpoints.
  const wallPos=[],wallColor=[];
  const seams=[0x353342,0x534554,0x78635e,0x494756,0x666777];
  function ridge(x,z,k){
    const noise=.5+.5*Math.sin(x*.13+z*.06+k*.42);
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
  function vertex(x,z){
    let light=0;for(const [lx,lz] of lamps)light=Math.max(light,Math.max(0,1-Math.hypot(x-lx,z-lz)/10));
    const grain=.78+.18*Math.sin(x*.21+z*.13)+.16*hash(x,z,3);
    const daylight=Math.max(0,1-Math.hypot(x*.16,(z-128)*.071));
    floor.push(x,0,z);colors.push(.044*grain+.20*light+.09*daylight,.052*grain+.115*light+.15*daylight,.068*grain+.042*light+.18*daylight);
  }
  function cutFloor(triangle){
    const polygon=[],edge=[];
    for(let n=0;n<3;n++){
      const a=triangle[n],b=triangle[(n+1)%3];
      if(a[2]>0)polygon.push(a);
      if((a[2]>0)===(b[2]>0))continue;
      const t=a[2]/(a[2]-b[2]);
      const point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      polygon.push(point);edge.push(point);
    }
    for(let n=2;n<polygon.length;n++)
      for(const point of [polygon[0],polygon[n-1],polygon[n]])vertex(point[0],point[1]);
    if(edge.length===2)cliff(...edge[0],...edge[1]);
  }
  for(let i=-40;i<40;i++)for(let j=-35;j<35;j++){
    const x=i*4,z=j*4;
    const a=[x,z,mineSample(i,j)],b=[x,z+4,mineSample(i,j+1)];
    const c=[x+4,z+4,mineSample(i+1,j+1)],d=[x+4,z,mineSample(i+1,j)];
    cutFloor([a,b,c]);cutFloor([a,c,d]);
  }
  // Daylight, paired posts and a pale threshold distinguish the return tunnel.
  for(let i=0;i<5;i++)prop(unit,i%2?0x91775f:0xa08a6e,0,.055,126.25+i*.37,3.8,.11,.34);
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
  const d=(cam.aspect<1?28:30)*zoomK;
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
