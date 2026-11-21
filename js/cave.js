'use strict';
/* ===== 46차(규칙, 기획자 11-21 13:14): 등대 2곳 없애기 · 맵 가운데 등대 자리에 동굴 =====
   기획자: '맵 기준 맨 아래 가운데 등대는 그냥 없애 주고, 맵 가운데 등대도 없앨 건데 맨 가운데 등대가 있던 곳에는 동굴을 만들 거야.
           거기 동굴은 텐트처럼 이동시켜 주는데 이동까지만 구현해 줘'.
   - 없앤 등대: LH_SITES[0] '남쪽 바다 등대'(맨 아래 가운데), LH_SITES[4] '안쪽만 등대'(가운데) — core.js LH_GONE.
     바위섬 땅·둘레 바위는 그대로 둬요(그 둘레 낚시 포인트 메모5·14·15·항구16~21을 계속 쓸 수 있게). 등대 빠른 이동 목록·지도에서도 빠져요.
   - 가운데 바위섬 한가운데(등대가 서 있던 자리)에 동굴 입구(DECO.cave, 정면 +z). [동굴 들어가기] → 텐트처럼 화면이 바뀌어 동굴 안(INT 방 'cave')으로,
     앞 가운데 문에서 [나가기]로 나와요(입구 앞). 안은 아직 비어 있어요('이동까지만').
   - 동굴 안에서는: 아무것도 놓을 수 없어요(ghostPos), 텐트처럼 에너지가 빨리 차지 않아요(actors.js), 내 기지(S.home)도 안 바뀌어요.
   - 설치 금지 원 이름: 동굴 바위섬 '동굴', 등대를 없앤 바위섬 '바위섬'. */
DECO.cave={g:'cave_ent',s:1,bx:2.3,bz:1.45};
INT_ROOM.cave={hw:4,hd:3.2,lc:0xffd2a0,ld:10,li:1.25};
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
/* 동굴 안: 어두운 돌 바닥 + 뒤쪽 울퉁불퉁한 바위 반구 벽 + 양옆 바위 + 앞 가운데 바깥 빛(문). 장식은 없어요(이동까지만) */
function caveRoom(){if(INT.gr.cave)return;const C=INT.gr.cave=new THREE.Group(),R=INT_ROOM.cave,W=R.hw,D=R.hd;C.visible=false;INT.g.add(C);
 const fg=new THREE.PlaneGeometry(2*W,2*D,20,16),cl=[];const pa=fg.attributes.position;for(let i=0;i<pa.count;i++){const v=.27+(hash(i,7,3)-.5)*.05;cl.push(v,v*.93,v*.86)}fg.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
 const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({vertexColors:true}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;C.add(fl);
 const ed=new THREE.Mesh(new THREE.BoxGeometry(2*W,.1,2*D),new THREE.MeshLambertMaterial({color:0x1b1816}));ed.position.y=-.051;C.add(ed);
 const wg=new THREE.SphereGeometry(W+.4,28,12,Math.PI,Math.PI,0,Math.PI/2),wp=wg.attributes.position;
 for(let i=0;i<wp.count;i++){const x=wp.getX(i),y=wp.getY(i),z=wp.getZ(i),k=1+(noise(x*1.3+5,y*1.3+z*.7,11)-.5)*.32*Math.min(1,y*1.5);wp.setXYZ(i,x*k,y*k*.82,z*k)}wg.computeVertexNormals();
 const wall=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:0x5a524b,flatShading:true,side:THREE.DoubleSide}));wall.position.z=-D;wall.receiveShadow=true;C.add(wall);
 const wb=new THREE.Mesh(new THREE.CircleGeometry(W+.4,28,0,Math.PI),new THREE.MeshLambertMaterial({color:0x2b2623}));wb.rotation.x=-Math.PI/2;wb.position.set(0,.004,-D);C.add(wb);
 const p=[];for(let i=0;i<14;i++){const sx=i%2?1:-1,z=-D+.4+((i>>1)/6)*(2*D-.6),s=.45+hash(i,3,9)*.5;p.push(pt(new THREE.DodecahedronGeometry(s),[0x5a524b,0x4d4640,0x655c54][i%3],[sx*(W+s*.55),s*.35,z],[i,i*.6,0],[1,.8,1.1]))}
 for(let i=0;i<9;i++){const x=(hash(i,5,2)-.5)*2*(W-.8),z=-D+.8+hash(i,6,2)*(2*D-2.4);p.push(pt(new THREE.DodecahedronGeometry(.07+hash(i,8,2)*.08),0x3c3632,[x,.04,z],[i,i,0]))}
 const rm=new THREE.Mesh(mg(p),new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));C.add(rm);
 /* 문: 앞 가운데로 들어오는 바깥 빛(텐트 문과 같은 빛, 발판은 없음) */
 const c=document.createElement('canvas');c.width=8;c.height=64;const k=c.getContext('2d'),g=k.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,1)');k.fillStyle=g;k.fillRect(0,0,8,64);
 const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),color:0xcfe6ff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));sp.rotation.x=-Math.PI/2;sp.position.set(0,.02,D-1.05);C.add(sp);
 const ln=new THREE.Mesh(new THREE.BoxGeometry(1.5,.012,.05),new THREE.MeshBasicMaterial({color:0xd8ecff}));ln.position.set(0,.006,D-.02);C.add(ln)}
{const _ib=intBuild;intBuild=function(){const first=!INT.g;_ib();if(first)caveRoom()}}
/* 들어가기: 텐트(intEnter)와 같지만 내 기지(S.home)를 바꾸지 않아요 */
function caveEnter(s){if(P.dead||busy||INT.on)return;const df=sdef(s);
 fadeDo('동굴 안으로…',()=>{intRoom('cave');setBuild(null);if(fishing)endFish();INT.ret={x:s.x,z:s.z+df.bz+1.1};INT.s=s;INT.on=true;INT.dock.hw=INT.full;INT.g.visible=true;intShow(true);
  INT.it=[addStruct({t:'int_exit',x:INT.x,z:INT.z+INT.door-.2,yo:INT.y-hAt(INT.x,INT.z+INT.door-.2),hp:1e9})];
  P.x=INT.x;P.z=INT.z+INT.door-1.75;P.rot=Math.PI;P.auto=null;enemies.forEach(e=>{if(!e.raid)e.agg=0});sfx(170,.2,'sine',.05,.6);sfx(120,.3,'sine',.03,.5)})}
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
