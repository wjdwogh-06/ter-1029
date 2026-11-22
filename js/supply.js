/* 54차(디자인) — 보급지마다 다른 모습 + 철조망 울타리
   기획자(11-22 15:53): '보급지역이 좀 심심한데, 비슷한 건 좋은데 똑같은 게 많아서 심심하고, 철조망 같은 것 좀 쳐져 있으면 좋겠어'.
   - 14곳 보급지에 테마 7가지를 두 번씩 나눠요(가까운 곳끼리는 다르게): 낙하 지점·검문소·무전 초소·컨테이너 야적장·감시탑·연료 저장소·버려진 트럭.
     상자 수·이름(s<i>_<k>)·보물 상자 자리 규칙은 예전 그대로(2+i%3개, i%4===2면 첫 상자가 보물 상자) → 저장·전리품·보급 상자 창은 그대로예요.
   - 모든 보급지를 철조망(나무 말뚝 + 가시 철선 / 쇠기둥 + 철선 + 윤형 철조망) 울타리로 두르고 문을 하나 내요.
     문 방향 = 길이 들어오는 쪽(roads.js ROAD_GATE), 길이 없는 곳은 땅이 트인 쪽(카메라 쪽이 먼저). 안 배치도 문을 앞(+z)으로 놓고 돌려요.
   - 울타리 모양(울타리 하나 = 메시 하나, 충돌은 칸마다 보이지 않는 'swire')은 보급지마다 크기가 조금씩 달라요. 물가·부두에 걸리는 칸은 비워요.
   - 설치 금지 원(NOB 'sup')은 울타리 바깥 + 3m까지 넓혀요(buildNoBuild 감싸기).
   - 옛 보급지 배치(dress.js SUPV·buildSupply)와 뒤 철조망(look.js lkSupplyFence)은 이 파일이 바꿔 끼워요. 이 파일을 빼면 예전 모습. */
Object.assign(DECO,{
 swire:{g:'nil',s:1,bx:1.3,bz:.12,n:'보급지 철조망'},swpost:{g:'nil',s:1,bx:.1,bz:.1,n:'감시탑 다리'},sp_drums:{g:'nil',s:1,bx:.95,bz:.85,n:'드럼통'},
 sp_booth:{g:'sp_booth',s:1,bx:.72,bz:.72,n:'초소'},sp_boom:{g:'sp_boom',s:1,bx:.26,bz:.26,n:'차단기'},sp_mast:{g:'sp_mast',s:1,bx:.48,bz:.48,n:'무전 안테나'},
 sp_cont:{g:'sp_cont_o',s:1,bx:2.32,bz:1.1,n:'컨테이너'},sp_cont2:{g:'sp_cont_t',s:1,bx:2.32,bz:1.1,n:'컨테이너'},sp_truck:{g:'sp_truck',s:1,bx:1.05,bz:2.62,n:'수송 트럭'},
 sp_sock:{g:'sp_sock',s:1,bx:.12,bz:.12,n:'바람자루'}});
/* ---------- 모델 ---------- */
const SPC={olive:0x6b7a45,oliveD:0x55623a,conc:0xb9b3a7,steel:0x8d949b,dark:0x34373c,red:0xe0533f,white:0xf4f1ea,glass:0x34506a,canvas:0x7f8656,rust:0xa0603a};
function spBooth(){const p=[pt(lkRb(1.56,.14,1.56,.03,.02),SPC.conc,[0,.07,0]),pt(lkRb(1.34,1.0,1.34,.04,.02),SPC.olive,[0,.64,0]),pt(lkRb(1.37,.09,1.37,.03,.015),SPC.white,[0,1.18,0]),
  pt(lkRb(1.3,.56,1.3,.02,.01),SPC.glass,[0,1.5,0]),pt(lkRb(1.74,.15,1.74,.04,.02),SPC.oliveD,[0,1.86,0]),pt(lkRb(1.2,.06,1.2,.02,.01),SPC.olive,[0,1.97,0]),
  pt(lkRb(.6,1.02,.03,.015,.01),SPC.oliveD,[.28,.64,.68]),pt(new THREE.SphereGeometry(.05,8,6),0xd9c49a,[.5,.68,.71]),pt(lkRb(.1,.1,.1,.02,.01),0xf2b84a,[0,2.07,0])];
 for(const x of[-.62,.62])for(const z of[-.62,.62])p.push(pt(lkRb(.1,.58,.1,.02,.01),SPC.olive,[x,1.5,z]));
 for(let k=0;k<5;k++)p.push(pt(lkRb(.26,.09,.012,.01,.004),k%2?SPC.white:SPC.red,[-.5+k*.25,1.18,.69]));return mg(p)}
function spBoom(){const p=[pt(lkRb(.52,.34,.52,.05,.03),SPC.conc,[0,.17,0]),pt(lkRb(.2,1.0,.2,.04,.02),0xd8d4c8,[0,.84,0]),pt(lkRb(.34,.26,.34,.04,.02),SPC.red,[0,1.42,0])],arm=[];
 for(let k=0;k<8;k++)arm.push(pt(box(.42,.1,.1),k%2?SPC.red:SPC.white,[.21+k*.42,0,0]));arm.push(pt(lkRb(.38,.24,.2,.04,.02),SPC.dark,[-.32,0,0]),pt(cyl(.07,.07,.4,8),SPC.dark,[0,0,0],[Math.PI/2,0,0]));
 const g=mg(arm);g.rotateZ(1.2);g.translate(0,1.42,.02);p.push(g);return mg(p)}
function spMast(){const p=[pt(lkRb(.96,.22,.96,.05,.03),SPC.conc,[0,.11,0])],L=[0,1,2].map(i=>i*Math.PI*2/3+.3),H=6.2,R0=.42,R1=.13,leg=(a,y)=>{const r=R0+(R1-R0)*y/H;return[Math.cos(a)*r,y,Math.sin(a)*r]};
 for(const a of L)for(let s=0;s<4;s++){const y0=.2+s*(H-.2)/4,y1=.2+(s+1)*(H-.2)/4;p.push(lkRod(leg(a,y0),leg(a,y1),.03,s===3?SPC.red:s===2?SPC.white:SPC.red,5))}
 for(let y=.6;y<H-.3;y+=.72)for(let i=0;i<3;i++)p.push(lkRod(leg(L[i],y),leg(L[(i+1)%3],y+.36),.012,0xb8bec4,4));
 p.push(lkRod([0,H,0],[0,H+1.25,0],.022,0xd8dcdf,5),pt(new THREE.SphereGeometry(.08,8,6),0xff5a3c,[0,H+1.3,0]),pt(lkRb(.5,.1,.5,.03,.015),SPC.steel,[0,H,0]));
 const dish=pt(cone(.36,.16,14),0xe8e8e2,[0,0,0],[0,0,Math.PI/2]);dish.translate(.33,4.4,0);p.push(dish,lkRod([.12,4.4,0],[.3,4.4,0],.03,SPC.steel,5));
 for(const a of L){const top=leg(a,4.9),an=[Math.cos(a)*2.7,.06,Math.sin(a)*2.7];p.push(lkRod(top,an,.009,0x55595e,4),pt(lkRb(.2,.12,.2,.03,.015),SPC.conc,an))}
 return mg(p)}
function spCont(col){const W=4.6,H=2.25,D=2.15,p=[pt(lkRb(W,H,D,.03,.02),col,[0,H/2+.02,0])],dk=new THREE.Color(col).multiplyScalar(.82).getHex(),lt=new THREE.Color(col).lerp(new THREE.Color(0xffffff),.12).getHex();
 for(let x=-W/2+.25;x<W/2-.1;x+=.3)for(const z of[-D/2-.015,D/2+.015])p.push(pt(box(.12,H-.18,.03),dk,[x,H/2+.02,z]));
 for(let z=-D/2+.2;z<D/2-.1;z+=.3)p.push(pt(box(W-.1,.03,.1),lt,[0,H+.03,z]));
 for(const x of[-W/2,W/2])for(const y of[.1,H-.06])for(const z of[-D/2,D/2])p.push(pt(lkRb(.2,.16,.2,.03,.015),SPC.dark,[x+(x<0?.06:-.06),y,z+(z<0?.06:-.06)]));
 p.push(pt(lkRb(.02,H-.25,D-.25,.01,.005),0x2a2c2f,[W/2+.005,H/2+.02,0]));   // 열린 문 안쪽(어둠)
 for(const sd of[-1,1]){const leaf=[pt(lkRb(.06,H-.12,D/2-.04,.02,.01),col,[0,0,-sd*(D/4)])];for(let z=.15;z<D/2-.1;z+=.26)leaf.push(pt(box(.03,H-.4,.06),dk,[.035,0,-sd*z]));
  leaf.push(lkRod([.06,-.4,-sd*.18],[.06,.6,-sd*.18],.02,SPC.steel,5),lkRod([.06,-.4,-sd*.42],[.06,.6,-sd*.42],.02,SPC.steel,5));
  const g=mg(leaf);g.rotateY(-sd*1.9);g.translate(W/2+.02,H/2+.02,sd*D/2);p.push(g)}
 p.push(pt(lkRb(1.0,.4,.02,.02,.01),SPC.white,[-.9,1.5,D/2+.03]),pt(lkRb(.8,.08,.025,.01,.005),dk,[-.9,1.56,D/2+.04]),pt(lkRb(.6,.06,.025,.01,.005),dk,[-1.0,1.42,D/2+.04]));
 return mg(p)}
function spTruck(){const O=SPC.olive,OD=SPC.oliveD,T=0x2a2b2d,p=[pt(lkRb(1.45,.24,4.9,.04,.02),SPC.dark,[0,.74,.1])];
 for(const z of[1.75,-.75,-1.75])for(const x of[-.93,.93]){const fl=z>1&&x<0;p.push(pt(cyl(.43,.43,.32,14),T,[x,fl?.36:.43,z],[0,0,Math.PI/2],[1,1,fl?.86:1]),pt(cyl(.19,.19,.34,10),0x6b7350,[x*1.01,fl?.36:.43,z],[0,0,Math.PI/2]))}
 p.push(pt(lkRb(1.95,1.1,1.45,.08,.04),O,[0,1.55,1.6]),pt(lkRb(1.78,.66,1.05,.08,.04),O,[0,1.18,2.72]),pt(lkRb(1.64,.5,.05,.03,.02),SPC.glass,[0,1.82,2.33],[-.12,0,0]));
 for(const x of[-.985,.985])p.push(pt(lkRb(.04,.42,.8,.02,.01),SPC.glass,[x,1.8,1.62]),pt(lkRb(.05,.18,.06,.02,.01),SPC.dark,[x*1.02,1.95,2.3]));
 p.push(pt(lkRb(2.0,.2,.16,.04,.02),SPC.dark,[0,.86,3.28]),pt(lkRb(1.3,.36,.04,.02,.01),OD,[0,1.18,3.25]));for(let k=0;k<5;k++)p.push(pt(lkRb(1.1,.03,.02,.01,.005),SPC.dark,[0,1.06+k*.07,3.27]));
 for(const x of[-.66,.66])p.push(pt(new THREE.SphereGeometry(.11,10,8),0xf2e6b0,[x,1.2,3.25],0,[1,1,.5]));
 p.push(pt(lkRb(2.0,.12,3.25,.03,.02),OD,[0,1.0,-.55]));for(const x of[-.98,.98])p.push(pt(lkRb(.08,.5,3.25,.02,.01),O,[x,1.3,-.55]));p.push(pt(lkRb(2.0,.5,.08,.02,.01),O,[0,1.3,-2.15]));
 const tarp=new THREE.CylinderGeometry(1.0,1.0,3.3,12,1,false,-Math.PI/2,Math.PI);tarp.rotateX(Math.PI/2);tarp.rotateZ(Math.PI);p.push(pt(tarp,SPC.canvas,[0,1.52,-.55],0,[1,.78,1]));
 for(const z of[-1.8,-.55,.7])p.push(pt(new THREE.TorusGeometry(1.01,.025,4,12,Math.PI),0x5c623c,[0,1.52,z],0,[1,.78,1]));
 p.push(pt(cyl(.4,.4,.28,12),T,[0,2.2,.62],[Math.PI/2,0,0]),pt(lkRb(.3,.42,.16,.04,.02),0x56603a,[1.08,1.15,.85]),pt(lkRb(.5,.03,.4,.01,.005),SPC.rust,[.3,1.52,2.8]),pt(lkRb(.3,.03,.25,.01,.005),SPC.rust,[-.5,2.11,1.5]));
 return mg(p)}
function spSock(){const p=[pt(lkRb(.3,.12,.3,.03,.02),SPC.conc,[0,.06,0]),lkRod([0,.1,0],[0,3.3,0],.04,0xd8dcdf,6),pt(new THREE.TorusGeometry(.22,.025,4,12),SPC.dark,[.06,3.25,0],[0,Math.PI/2,0])],seg=5;
 for(let k=0;k<seg;k++){const r0=.22-k*.026,r1=.22-(k+1)*.026,g=cyl(r1,r0,.26,10,1,true);g.rotateZ(-Math.PI/2);g.translate(.2+k*.26+.13,0,0);g.rotateZ(-.28);g.translate(0,3.25,0);p.push(pt(g,k%2?SPC.white:0xf07a2a))}
 return mg(p)}
function spModels(){GEO.sp_booth=spBooth();GEO.sp_boom=spBoom();GEO.sp_mast=spMast();GEO.sp_cont_o=spCont(0xd9792e);GEO.sp_cont_t=spCont(0x3a8f98);GEO.sp_truck=spTruck();GEO.sp_sock=spSock()}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{spModels()}catch(e){console.error('supply: 54차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}
/* ---------- 테마(문 = 앞 +z, x는 보급지마다 좌우 뒤집힘) ----------
   cr: 상자 자리 [x,z,돌림,받침 높이], st: 부딪히는 소품 [종류,x,z,돌림], de: 보이기만 하는 소품 [모델,x,z,돌림,크기], tw: 감시탑, sb: 모래주머니 반원(가림막 있음)
   f: 울타리 'wood'(나무 말뚝·가시 철선) | 'steel'(쇠기둥·윤형 철조망), boom: 문 앞 차단기, broken: 뒤쪽 울타리 몇 칸 무너짐 */
const SPT=[
 {n:'낙하 지점',f:'wood',cr:[[.3,-.4,.1,.37],[3.0,1.4,.45],[-2.8,1.6,-.3],[-.4,-3.8,.8]],st:[['sp_sock',5.4,-5.0,0]],de:[['pallet',.3,-.4,.1,4.6],['chute',-3.4,-2.4,-.4],['jerry',4.5,-1.4,.4],['tarppile',4.0,-3.6,.3]],lamp:[-4.6,3.0],smoke:[2.2,-2.6],sign:[3.4,4.6,-.15]},
 {n:'검문소',f:'steel',boom:1,cr:[[-1.9,.6,.2],[1.9,.4,-.25],[0,-2.6,.5],[-4.4,-.8,-.6]],st:[['sp_booth',4.2,4.0,0]],sb:[[-3.6,-4.6,0],[3.8,-3.8,-.55]],de:[['flag_blue',.9,-5.2,0,5],['ammostack',-4.6,2.6,.5],['jerry',1.8,-4.4,-.3]],lamp:[-4.4,4.4],smoke:[2.8,-1.6],sign:null},
 {n:'무전 초소',f:'steel',cr:[[-1.8,1.4,.2],[1.7,1.6,-.25],[.2,3.9,.3],[4.4,2.7,-.6]],st:[['sp_mast',-5.0,-4.0,0]],de:[['suptent',.8,-3.6,0],['radio',0,-3.7,.1],['lk_gen',4.8,-2.6,.3],['ammostack',-4.4,.6,.4]],cable:[[4.3,-2.6],[2.6,-3.0]],lamp:[-4.4,3.2],smoke:[3.2,-5.4],sign:[-3.4,5.0,.2]},
 {n:'컨테이너 야적장',f:'steel',cr:[[-1.4,-1.5,.15],[1.9,-.5,-.2],[-.2,1.7,.4],[3.9,2.3,-.5]],st:[['sp_cont',-1.0,-4.5,0]],de:[['lk_pallet',4.5,-3.4,.2,1],['lk_pallet',4.6,-2.2,-.1,1],['jerry',-4.7,1.0,.6],['tarppile',-5.0,-1.4,1.2]],lamp:[4.8,4.2],smoke:[-4.2,3.0],sign:[-3.4,4.8,.2]},
 {n:'감시탑',f:'wood',cr:[[-.6,.6,.1],[2.4,1.9,.4],[-2.8,2.2,-.3],[1.2,-3.0,.7]],tw:[-4.3,-3.7],sb:[[3.6,-4.4,-.35]],de:[['ammostack',4.8,-1.6,.6],['jerry',-1.2,-4.8,.2]],lamp:[4.8,3.6],smoke:[-1.6,-2.2],sign:[-3.4,4.8,.2]},
 {n:'연료 저장소',f:'steel',warn:1,cr:[[-1.4,.4,.15],[1.8,.8,-.25],[0,-2.4,.5],[-4.3,1.9,-.5]],st:[['well',-4.0,-3.8,Math.PI/2],['sp_drums',3.85,-4.1,0]],de:[['lk_drum_0',3.4,-4.4,0],['lk_drum_1',4.3,-4.5,.7],['lk_drum_2',3.85,-3.65,1.4],['jerry',5.2,-2.4,.3],['jerry',5.5,-1.7,1.2]],lamp:[4.6,3.6],smoke:[1.6,-4.8],sign:[-3.2,4.8,.2]},
 {n:'버려진 트럭',f:'wood',broken:1,cr:[[.6,-.4,.2],[3.1,1.2,-.3],[-.2,2.4,.4],[3.3,-2.4,.6]],st:[['sp_truck',-3.7,-1.5,.32]],de:[['tarppile',3.0,-4.6,.3],['jerry',-1.2,-4.6,1.0],['ammostack',1.3,-4.2,-.4]],lamp:[4.8,3.8],smoke:[-1.4,2.2],sign:[-3.8,4.8,.2]}];
const SP_THEME=[0,4,2,6,5,3,5,0,1,4,6,2,1,3];   /* 보급지 번호 → 테마(가까운 S6·S7·S8은 서로 다르게) */
const SPF=[];   /* 보급지마다 울타리 정보 {i,x,z,th,m,hx,hz,posts,mesh,cols} — 검사·설치 금지 원이 써요 */
/* 문 방향: 길이 있으면 그 방향, 없으면 앞(+z)부터 돌려 보며 문 앞 8~14m가 땅인 쪽 */
function spGateDir(s){if(typeof ROAD_GATE!=='undefined'&&ROAD_GATE[s.i]!==undefined)return ROAD_GATE[s.i];
 for(const th of[0,-.6,.6,-1.2,1.2,-1.8,1.8,Math.PI]){let ok=true;for(const r of[8,10,12,14])if(hAt(s.x+Math.sin(th)*r,s.z+Math.cos(th)*r)<.95){ok=false;break}if(ok)return th}return 0}
/* 둥근 네모 둘레(문 오른쪽 끝 → 뒤로 돌아 → 문 왼쪽 끝), 기둥 간격 2.5m 이하 */
function spLoop(hx,hz,rc,gap){const pts=[],A=(cx,cz,a0,a1)=>{for(let k=0;k<=6;k++){const a=a0+(a1-a0)*k/6;pts.push([cx+Math.cos(a)*rc,cz+Math.sin(a)*rc])}};
 pts.push([gap,hz]);A(hx-rc,hz-rc,Math.PI/2,0);A(hx-rc,-hz+rc,0,-Math.PI/2);A(-hx+rc,-hz+rc,-Math.PI/2,-Math.PI);A(-hx+rc,hz-rc,Math.PI,Math.PI/2);pts.push([-gap,hz]);
 let L=0;const cum=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(L)}
 const n=Math.ceil(L/2.45),out=[];for(let k=0;k<=n;k++){const t=L*k/n;let i=1;while(i<cum.length-1&&cum[i]<t)i++;const f=(t-cum[i-1])/((cum[i]-cum[i-1])||1);out.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f])}return out}
function spWarn(){const p=[pt(box(.46,.34,.03),0xf2c230,[0,0,0]),pt(box(.4,.28,.01),0x2b2b2b,[0,0,.017]),pt(box(.35,.23,.01),0xf2c230,[0,0,.021]),pt(box(.05,.13,.01),0x2b2b2b,[0,.035,.027]),pt(box(.05,.045,.01),0x2b2b2b,[0,-.08,.027])];return mg(p)}
let _spWarnG=null;
const spWire=(a,b,r,c)=>{const q=lkAim(a,b);return pt(new THREE.CylinderGeometry(r,r,q.L,3,1,true),c,q.pos,q.rot)};   /* 뚜껑 없는 세모 관(삼각형 6개) */
const _spOct=new THREE.OctahedronGeometry(.045),_spTor=new THREE.TorusGeometry(.22,.012,3,6);
/* 울타리 한 곳: 기둥·철선·가시·윤형 철조망·문 + 충돌 칸 */
function spFence(s,T,th,m){const h1=hash(s.i,3,71),h2=hash(s.i,5,72),hx=7.7+h1*.9,hz=7.2+h2*.8,rc=1.8+hash(s.i,7,73)*1.6,gap=1.95,c=Math.cos(th),sn=Math.sin(th);
 const W=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c],loop=spLoop(hx,hz,rc,gap),parts=[],cols=[],posts=[],steel=T.f==='steel';
 const wood=[0x8a5a34,0x7a5030,0x96643c],WIRE=0x474b52,BARB=0x3a3d42,POST=0x5b6450;
 const wet=(x,z)=>hAt(x,z)<.95||onDock(x,z);
 const P=loop.map(([lx,lz],k)=>{const j=k>0&&k<loop.length-1?(hash(s.i,k,74)-.5)*.22:0,[x,z]=W(lx+j,lz+j*.5);return{x,z,y:hAt(x,z)-.03,lx,lz,wet:wet(x,z)}});
 const rel=(q,yy)=>[q.x-s.x,q.y+yy,q.z-s.z];
 const skipBack=T.broken?[Math.floor(loop.length*.42),Math.floor(loop.length*.42)+1]:[];
 for(let k=0;k<P.length;k++){const q=P[k];if(q.wet)continue;posts.push(q);const gateP=k===0||k===P.length-1,lean=(hash(s.i,k,75)-.5)*.08;
  if(gateP)parts.push(pt(lkRb(.2,2.05,.2,.04,.02),steel?POST:0x6e4527,rel(q,1.02)),pt(lkRb(.26,.08,.26,.03,.015),steel?SPC.dark:0x5a3a20,rel(q,2.07)));
  else if(steel)parts.push(pt(box(.085,1.72,.085),POST,rel(q,.86),[lean,0,0]),pt(cyl(.07,.09,.14,5),SPC.conc,rel(q,.04)));
  else parts.push(pt(cyl(.065,.078,1.5,5),wood[k%3],rel(q,.72),[lean,0,lean*.6]));
}   /* 문 기둥은 옆 칸 충돌 상자가 덮어요(겹침 검사 0) */
 for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1];if(a.wet||b.wet||skipBack.includes(k))continue;const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);if(L<.3)continue;
  {const mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,hs=[[-1.3,-.12],[1.3,-.12],[-1.3,.12],[1.3,.12],[0,0]].map(q=>hAt(mx+q[0],mz+q[1]));if(Math.max(...hs)-Math.min(...hs)>.27)continue}   /* 비탈(강둑)에 걸치는 칸은 비워요 */
  // 충돌 칸(보이지 않음): 칸 방향으로 눕힌 1.3 × 0.12 상자
  cols.push(addStruct({t:'swire',x:(a.x+b.x)/2,z:(a.z+b.z)/2,r:Math.atan2(-dz,dx)}));
  const ys=steel?[.32,.7,1.08,1.46]:[.3,.64,.98,1.3],sag=.05;
  ys.forEach((y,yi)=>{const A=rel(a,y),B=rel(b,y),M=[(A[0]+B[0])/2,(A[1]+B[1])/2-sag,(A[2]+B[2])/2];parts.push(spWire(A,M,.017,WIRE),spWire(M,B,.017,WIRE));if(yi%2===0)return;
   for(let t=.14;t<1;t+=.24){const u=t<.5?t*2:(t-.5)*2,Q=t<.5?A:M,R2=t<.5?M:B;parts.push(pt(_spOct,BARB,[Q[0]+(R2[0]-Q[0])*u,Q[1]+(R2[1]-Q[1])*u,Q[2]+(R2[2]-Q[2])*u],[t*7,t*5,0]))}})
  if(steel){const yaw=Math.atan2(dx,dz),n=Math.max(3,Math.round(L/.33));for(let q=0;q<n;q++){const t=(q+.5)/n,X=a.x+dx*t-s.x,Z=a.z+dz*t-s.z,Y=a.y+(b.y-a.y)*t+1.86;parts.push(pt(_spTor,0x9aa1a8,[X,Y,Z],[0,yaw+(q%2?.18:-.18),0]))}}
  if(T.warn||k===0||k===P.length-2){if(k===0||k===P.length-2||(T.warn&&k%4===2)){if(!_spWarnG)_spWarnG=spWarn();const g=_spWarnG.clone(),mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,ox=mx-s.x,oz=mz-s.z,ol=Math.hypot(ox,oz)||1;
   g.rotateY(Math.atan2(ox,oz));g.translate(ox+ox/ol*.06,(a.y+b.y)/2+.95,oz+oz/ol*.06);parts.push(g)}}}
 // 무너진 칸: 쓰러진 기둥과 바닥에 늘어진 철선
 if(T.broken){const k=skipBack[0],a=P[k],b=P[k+1];if(a&&b&&!a.wet&&!b.wet){const A=rel(a,.07),B=rel(b,.07),M=[(A[0]+B[0])/2+.4,A[1],(A[2]+B[2])/2];parts.push(lkBeam(A,M,.13,.13,wood[0]),lkRod(M,B,.016,WIRE,4))}}
 // 문짝: 나무면 안쪽으로 활짝 열린 문 두 짝, 쇠면 철망 문 두 짝(검문소는 문짝 없이 차단기)
 if(!T.boom){for(const sd of[-1,1]){const lx=sd*gap,leaf=[],fw=gap-.1,fh=1.45,col=steel?POST:0x7a5030;
   leaf.push(lkBeam([0,.12,0],[0,.12+fh,0],.07,.07,col),lkBeam([-sd*fw,.12,0],[-sd*fw,.12+fh,0],.07,.07,col),lkBeam([0,.15,0],[-sd*fw,.15,0],.07,.07,col),lkBeam([0,.12+fh-.03,0],[-sd*fw,.12+fh-.03,0],.07,.07,col),lkBeam([0,.2,0],[-sd*fw,.1+fh-.08,0],.06,.06,col));
   for(const y of[.55,.95])leaf.push(lkRod([0,y,0],[-sd*fw,y,0],.014,WIRE,4));
   const g=mg(leaf);g.rotateY(-sd*1.75);const [gx,gz]=W(lx,hz);g.rotateY(th);g.translate(gx-s.x,hAt(gx,gz)-.03,gz-s.z);parts.push(g)}}
 const geo=mg(parts),mesh_=mesh(geo,MATT);mesh_.position.set(s.x,0,s.z);mesh_.castShadow=true;mesh_.receiveShadow=true;mesh_.userData.spFence=s.i;mesh_.userData.layoutName='보급지 철조망';mesh_.userData.layoutBlocks=cols;scene.add(mesh_);
 return{hx,hz,posts,mesh:mesh_,cols,W}}
/* ---------- 보급지 만들기(dress.js buildSupply 바꿔 끼우기) ---------- */
function spBuild(s){const i=s.i,T=SPT[SP_THEME[i]%SPT.length],m=i%2?-1:1,th=spGateDir(s),c=Math.cos(th),sn=Math.sin(th),n=2+i%3,y0=hAt(s.x,s.z);
 const W=(lx,lz)=>{lx*=m;return[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]},R=r=>r*m+th;s.cr=[];s.theme=T.n;
 for(let k=0;k<n;k++){const q=T.cr[k],[x,z]=W(q[0],q[1]),chest=k===0&&i%4===2,o=addStruct({t:chest?'chest':'supply',x,z,r:R(q[2]),yo:chest?0:q[3]||0});o.li='s'+i+'_'+k;s.cr.push(o)}
 const add3=(type,lx,lz,rot,scale=1)=>{const [x,z]=W(lx,lz);const m3=mesh(GEO[type],MATT);m3.scale.setScalar(scale);m3.position.set(x,hAt(x,z)-.03,z);m3.rotation.y=R(rot)+(type==='chute'&&m<0?Math.PI:0);m3.userData.layoutName=type;scene.add(m3);return m3};
 for(const d of T.de||[])if(GEO[d[0]]&&!(d[0]==='pallet'&&n<1))add3(...d);
 for(const [t,lx,lz,rot] of T.st||[]){const [x,z]=W(lx,lz);addStruct({t,x,z,r:R(rot)})}
 for(const [lx,lz,rot] of T.sb||[]){const g=add3('sbagArc',lx,lz,rot),r=g.rotation.y;g.userData.layoutBlock=addStruct({t:'blk',x:g.position.x+Math.sin(r)*.27,z:g.position.z+Math.cos(r)*.27,r})}
 if(T.tw){const [x,z]=W(T.tw[0],T.tw[1]),tm=mesh(plTowerGeo(),MATT);tm.position.set(x,hAt(x,z)-.03,z);tm.rotation.y=th;tm.userData.layoutName='감시탑';scene.add(tm);
  for(const a of[-.8,.8])for(const b of[-.8,.8]){const px=x+a*c+b*sn,pz=z-a*sn+b*c;(tm.userData.layoutBlocks??=[]).push(addStruct({t:'swpost',x:px,z:pz,r:0}))}}
 if(T.cable){const [a,b]=T.cable.map(q=>W(q[0],q[1]));const g=mg([lkRod([a[0]-s.x,hAt(a[0],a[1])+.04,a[1]-s.z],[b[0]-s.x,hAt(b[0],b[1])+.04,b[1]-s.z],.025,0x2b2b2b,5)]),cm=mesh(g,MATT,false);cm.position.set(s.x,0,s.z);cm.userData.layoutName='무전 케이블';scene.add(cm)}
 if(T.sign){const [x,z]=W(T.sign[0],T.sign[1]);const sg=mesh(GEO.supsign,MATT);sg.position.set(x,hAt(x,z)-.03,z);sg.rotation.y=R(T.sign[2]);sg.userData.layoutName='supsign';scene.add(sg)}
 const [fx,fz]=W(T.smoke[0],T.smoke[1]),flare=mesh(GEO.flarecan,MATT);flare.userData.layoutName='신호탄';flare.position.set(fx,hAt(fx,fz)-.03,fz);scene.add(flare);
 {const [lx,lz]=W(T.lamp[0],T.lamp[1]);addStruct({t:'suplamp',x:lx,z:lz,r:R(.4)})}
 const G=new THREE.Group();G.position.set(fx,hAt(fx,fz),fz);const sp=[];for(let q=0;q<9;q++){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex(),color:q%3?0xf26a1e:0xffa24a,transparent:true,opacity:.5,depthWrite:false}));g.userData.p=q/9;G.add(g);sp.push(g)}scene.add(G);flare.attach(G);SMOKES.push({s,G,sp,t:0});
 // 검문소 차단기: 문 바로 바깥 오른쪽
 const F=spFence(s,T,th,m);if(T.boom){const [bx,bz]=W(2.6,F.hz+1.65);addStruct({t:'sp_boom',x:bx,z:bz,r:th})}
 SPF.push({i,x:s.x,z:s.z,th,m,theme:T.n,hx:F.hx,hz:F.hz,posts:F.posts.map(p=>[p.x,p.z]),mesh:F.mesh,cols:F.cols.length});void y0}
buildSupply=function(){SPF.length=0;SUPS.forEach(s=>{try{spBuild(s)}catch(e){console.error('supply: 보급지 '+s.i,e)}})};
lkSupplyFence=function(){};   /* 예전 뒤 철조망 3+2칸 → 둘레 울타리로 바뀜 */
/* 설치 금지 원: 울타리 바깥 + 3m */
{const _bn=buildNoBuild;buildNoBuild=function(){_bn.apply(this,arguments);for(const n of NOB){if(n.k!=='sup')continue;const F=SPF.find(f=>Math.abs(f.x-n.x)<.5&&Math.abs(f.z-n.z)<.5);if(!F)continue;let e=0;for(const [x,z] of F.posts)e=Math.max(e,dist(x,z,n.x,n.z));n.r=Math.max(n.r,e+3)}}}
