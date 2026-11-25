/* ===== 81차(규칙, 기획자 11-25 20:13): 카약 · 모터보트 =====
   기획자: '현대 보트는 그냥 없애고 카약이랑 모터보트', '카약은 1인승, 노 젓는 애니메이션, 심플하게. 중력 개념 잘 넣어라 —
           물 안에 있거나 겹쳐지거나 그런 모습이 보이면 안 돼', '모터보트는 일반 보트인데 뒤 모터 힘으로 가고(노 아님) 카약보다 훨씬 빨라, 3인승'.
   - 25차 '보트 2인승'(boat2)·키트·제작법 없앰 → 예전 저장은 dropRemoved가 재료로 돌려줘요.
   - 키트 둘(kit_kayak·kit_mboat): 가방에서 눌러 바닷가·강가 물 위에 띄워요(예전 보트와 같은 자리 규칙 waterSpotWhy). 철거하면 키트가 돌아와요.
   - 타기: 배에 바짝 붙어(헤엄치는 중에도) 오른쪽 조이스틱 톡 = [타기]. 탄 동안 왼쪽 조이스틱 = 가고 싶은 쪽(배가 천천히 돌아서 나아가요), 톡 = [내리기].
     내리면 가까운 땅·부두(3m 안), 없으면 배 옆 물로(헤엄).
   - 물에 뜨기: 배 몸통의 물에 잠기는 부분(흘수)과 갑판·바닥 높이를 물(y 0)보다 위로 만들어서 배 안에 물이 비치지 않아요.
     사람이 타면 조금 가라앉고(스프링), 물결 따라 출렁이고, 빠르면 뱃머리가 들리고, 돌 때 기울어요.
     움직일 땐 배 둘레 점이 모두 충분히 깊은 물 · 부두 아님 · 다른 구조물 아님일 때만(옆으로 미끄러지기, 부딪히면 튕김).
   - 카약: 앉은 몸 아래(다리)는 갑판 속, 양날 노를 양손으로 쥐고 좌우로 번갈아 저어요(노 끝이 물에 들어가면 물결). 최고 속도 5.4m/초(걷기 5, 헤엄 2.8).
   - 모터보트: 3인승(뒤·가운데·앞 의자, 혼자 하기는 운전석만), 뒤 선외기 모터 — 오른손으로 키 손잡이, 모터가 돌고 프로펠러가 돌아요,
     뒤로 물보라·물결. 최고 속도 13.5m/초. 숫자는 임시(BOAT81).
   - 탄 동안: 헤엄 에너지가 안 닳고(물 밖으로 쳐요), 손에 든 것은 안 보이고, 설치·낚시·쏘기는 안 돼요. 쓰러지거나 빠른 이동하면 먼저 내려요.
   - 멀티: 아직 내 화면에서만(다른 사람은 앉은 모습만 보여요, 서버 마무리 때). */
/* ---------- 25차 보트 2인승 없앰 ---------- */
{delete ITEMS.kit_boat2;if(typeof CR_KITS!=='undefined')delete CR_KITS.kit_boat2;if(BUILDS.boat2){REMOVED.n.boat2='보트 2인승';REMOVED.c.boat2={wood:14,scrap:4};BUILDS.boat2.hide=1;delete BUILDS.boat2.kit}
 REMOVED.n.kit_boat2='보트 2인승';if(typeof RECIPES!=='undefined')for(let i=RECIPES.length-1;i>=0;i--){const r=RECIPES[i];if(!ITEMS[r.id]||Object.keys(r.c||{}).some(k=>!ITEMS[k]))RECIPES.splice(i,1)}}

const BOAT81={
 kayak:{n:'카약',ic:'🛶',L:4.0,W:1.16,vmax:5.4,acc:2.4,turn:2.0,turn0:1.3,drag:.6,draft:.15,sink:.045,
  seats:[[0,.06,-.12]],probe:[[0,1.98],[0,-1.98],[.56,0],[-.56,0],[.42,1.05],[-.42,1.05],[.42,-1.05],[-.42,-1.05]]},
 mboat:{n:'모터보트',ic:'🚤',L:5.6,W:2.1,vmax:13.5,acc:4.6,turn:1.25,turn0:.55,drag:.42,draft:.24,sink:.06,
  seats:[[.36,.47,-2.2],[0,.47,-.55],[0,.47,.95]],probe:[[0,2.78],[0,-2.78],[1.0,0],[-1.0,0],[.9,-2.7],[-.9,-2.7],[.75,1.6],[-.75,1.6]]}};
Object.assign(ITEMS,{
 kit_kayak:{n:'카약',ic:'b81_kayak',ty:'kit',b:'kayak',p:1500,d:'1인승 카약. 바닷가·강가 물 위에 띄우고 타요. 노를 저어 헤엄보다 훨씬 빨라요 (가격 임시)'},
 kit_mboat:{n:'모터보트',ic:'b81_mboat',ty:'kit',b:'mboat',p:6000,d:'3인승 모터보트. 뒤 모터로 카약보다 훨씬 빨리 달려요 (가격 임시)'}});
Object.assign(BUILDS,{
 kayak:{n:'카약',g:'b81_kayak',s:1,bx:.56,bz:1.95,hp:220,c:{plastic:8,wood:4},kit:'kit_kayak',water:1,flat:1,boat:1,d:'1인승 카약 (재료 임시)'},
 mboat:{n:'모터보트',g:'b81_mboat',s:1,bx:1.04,bz:2.82,hp:420,c:{splate:8,mparts:6,plank:6},kit:'kit_mboat',water:1,flat:1,boat:1,d:'3인승 모터보트 (재료 임시)'}});
for(const k of['plastic','wood','splate','mparts','plank'])for(const t of['kayak','mboat'])if(BUILDS[t].c[k]&&!ITEMS[k])delete BUILDS[t].c[k];

/* ---------- 모양 ---------- */
const B81C=(hex,k=1)=>{const c=new THREE.Color(hex).convertSRGBToLinear();return[c.r*k,c.g*k,c.b*k]};
/* 단면(닫힌 고리)들을 이어 붙인 몸통. 띠마다 색 하나(cols[j]: 고리의 j번째 점 → j+1번째 점) */
function b81Hull(rings,cols,flip){const v=[],c=[],n=rings[0].length;
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const k=(j+1)%n,a=rings[i][j],b=rings[i+1][j],d=rings[i][k],e=rings[i+1][k],C=cols[j];
  const T=flip?[a,d,b,b,d,e]:[a,b,d,d,b,e];for(const p of T){v.push(p[0],p[1],p[2]);c.push(C[0],C[1],C[2])}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(v),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(c),3));g.computeVertexNormals();return g}
/* 고리 하나를 평면으로 막기(배 뒤판) */
function b81Cap(ring,col,dir){const P2=ring.map(p=>new THREE.Vector2(p[0],p[1])),tri=THREE.ShapeUtils.triangulateShape(P2,[]),v=[],c=[];
 for(const t of tri){const o=dir>0?[t[0],t[1],t[2]]:[t[0],t[2],t[1]];for(const q of o){const p=ring[q];v.push(p[0],p[1],p[2]);c.push(col[0],col[1],col[2])}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(v),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(c),3));g.computeVertexNormals();
 const N=g.attributes.normal;if(N.count&&Math.sign(N.getZ(0))!==Math.sign(dir)){const a=g.attributes.position.array;for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++){const t=a[i+3+k];a[i+3+k]=a[i+6+k];a[i+6+k]=t}g.computeVertexNormals()}return g}
/* 바닥 쪽 삼각형의 법선이 아래를 보게(감기 방향 맞추기) */
function b81Orient(g){const P=g.attributes.position.array,N=g.attributes.normal.array;let lo=0,y=1e9;for(let i=0;i<P.length;i+=3)if(P[i+1]<y){y=P[i+1];lo=i}
 if(N[lo+1]>0){for(let i=0;i<P.length;i+=9)for(let k=0;k<3;k++){const t=P[i+3+k];P[i+3+k]=P[i+6+k];P[i+6+k]=t;const C=g.attributes.color.array,u=C[i+3+k];C[i+3+k]=C[i+6+k];C[i+6+k]=u}g.computeVertexNormals()}return g}
const B81K={hw:z=>{const D=BOAT81.kayak,t=Math.abs(z)/(D.L/2);return Math.max(0,D.W/2*Math.pow(Math.max(0,1-Math.pow(t,2.3)),.55))},
 kd:z=>{const t=Math.abs(z)/(BOAT81.kayak.L/2);return -.15+.2*Math.pow(t,2.4)},sh:z=>{const t=Math.abs(z)/(BOAT81.kayak.L/2);return .13+.07*t*t},
 dk:z=>{const t=Math.abs(z)/(BOAT81.kayak.L/2);return .13+.07*t*t+.075*(1-t*t)+.09*Math.exp(-Math.pow((z-.98)/.32,2))}};
const B81KC={zc:-.12,rx:.42,rz:.66};
function b81Kayak(){const D=BOAT81.kayak,K=B81K,NS=34,rings=[],HULL=0xec6a2c,LOW=0xc9542a,DECK=0xf27e34,TRIM=0xf7f0e3;
 for(let i=0;i<=NS;i++){const z=-D.L/2+D.L*i/NS,w=K.hw(z),kd=K.kd(z),sh=K.sh(z),dk=K.dk(z);
  const h=[[0,kd],[w*.55,kd*.82],[w*.9,kd*.28],[w,.02],[w*.99,sh],[w*.82,dk],[0,dk]],r=h.map(p=>[p[0],p[1],z]);for(let k=h.length-2;k>=1;k--)r.push([-h[k][0],h[k][1],z]);rings.push(r)}
 const band=[LOW,HULL,HULL,HULL,TRIM,DECK].map(c=>B81C(c)),cols=band.concat(band.slice().reverse());
 const p=[b81Orient(b81Hull(rings,cols))];
 /* 앉는 자리: 갑판 위 둥근 테두리 + 어두운 구멍 + 등받이 */
 const yc=K.dk(B81KC.zc)+.002,co=new THREE.TorusGeometry(1,.1,6,28);p.push(pt(co,0x33363b,[0,yc+.012,B81KC.zc],[Math.PI/2,0,0],[B81KC.rx,B81KC.rz,.42]));
 p.push(pt(new THREE.CircleGeometry(1,28),0x22252b,[0,yc+.006,B81KC.zc],[-Math.PI/2,0,0],[B81KC.rx*.96,B81KC.rz*.96,1]));
 p.push(pt(lkRb(.6,.3,.09,.08,.03),0x3aa6b0,[0,yc+.16,B81KC.zc-B81KC.rz+.1],[-.28,0,0]));
 /* 갑판 끈(앞·뒤 X자) + 앞뒤 손잡이 */
 const cord=(a,b)=>p.push(lkBeam([a[0],K.dk(a[1])+.012,a[1]],[b[0],K.dk(b[1])+.012,b[1]],.025,.012,0x2f3a4a));
 cord([.24,.75],[-.24,1.25]);cord([-.24,.75],[.24,1.25]);cord([.22,-.95],[-.22,-1.4]);cord([-.22,-.95],[.22,-1.4]);
 for(const s of[1,-1]){const z=s*(D.L/2-.12);p.push(pt(new THREE.TorusGeometry(.07,.018,5,10),0x33363b,[0,K.dk(z)+.03,z],[0,Math.PI/2,0]))}
 GEO.b81_kayak=mg(p);lkSmooth(GEO.b81_kayak,50);
 /* 양날 노 */
 const q=[pt(cyl(.034,.034,2.3,8),0x3a3f4a,[0,0,0],[0,0,Math.PI/2])];for(const s of[1,-1]){q.push(pt(lkRb(.5,.2,.032,.08,.012),0xf7c948,[s*1.36,0,0]),pt(cyl(.042,.042,.2,8),0x22252b,[s*.33,0,0],[0,0,Math.PI/2]),pt(cyl(.05,.05,.03,8),0xf7f0e3,[s*1.08,0,0],[0,0,Math.PI/2]))}
 GEO.b81_paddle=mg(q);GEO.b81_paddle.userData.half=1.61}
/* 모터보트: 바깥 몸통 + 난간 + 안쪽 벽 + 바닥을 한 고리로(흰 몸통 · 파란 띠 · 빨간 바닥) */
const B81M={t:z=>(z+BOAT81.mboat.L/2)/BOAT81.mboat.L,
 hw:z=>{const t=B81M.t(z),W=BOAT81.mboat.W/2;return W*(t<.55?.86+.14*Math.sin(t/.55*Math.PI/2):Math.pow(Math.max(0,Math.cos((t-.55)/.45*Math.PI/2)),.7))},
 kd:z=>{const t=B81M.t(z);return -.24+.34*Math.pow(Math.max(0,(t-.58)/.42),2)},
 sh:z=>{const t=B81M.t(z);return .64+.24*Math.pow(Math.max(0,(t-.45)/.55),1.8)},
 fl:z=>{const t=B81M.t(z);return lerp(.2,B81M.sh(z)-.03,sm(.8,.9,t))}};
function b81MBoat(){const D=BOAT81.mboat,M=B81M,NS=40,rings=[],WH=0xf4f1ea,BL=0x3f7fd0,RD=0xc84a3a,RAIL=0x8f9aa6,IN=0xdfe3e7,WD=0xd6965a;
 for(let i=0;i<=NS;i++){const z=-D.L/2+D.L*i/NS,w=M.hw(z),kd=M.kd(z),sh=M.sh(z),fl=M.fl(z),wo=w*1.03,wi=Math.max(0,wo-.1),wb=Math.max(0,wo-.13);
  const s1=lerp(.02,sh,.5),s2=lerp(.02,sh,.66);
  const h=[[0,kd],[w*.8,lerp(kd,-.06,.85)],[w*.97,.02],[w*1.0,s1],[w*1.015,s2],[wo,sh],[wi,sh],[wb,fl+.02],[0,fl]],r=h.map(p=>[p[0],p[1],z]);for(let k=h.length-2;k>=1;k--)r.push([-h[k][0],h[k][1],z]);rings.push(r)}
 const band=[RD,RD,WH,BL,WH,RAIL,IN,WD].map(c=>B81C(c)),cols=band.concat(band.slice().reverse());
 const p=[b81Orient(b81Hull(rings,cols)),b81Cap(rings[0],B81C(WH),-1)];
 /* 바닥 널 줄 · 의자 셋(크림 방석) · 앞 갑판 고리 */
 for(let k=-3;k<=3;k++)p.push(pt(box(.02,.006,D.L*.6),0xb8794a,[k*.22,.203,-.55]));
 for(const s of D.seats){const z=s[2],w=(M.hw(z)*1.03-.13)*2-.06;p.push(pt(lkRb(w,.07,.42,.04,.02),WD,[0,.395,z]),pt(lkRb(w-.12,.05,.36,.06,.02),0xf7f0e3,[0,.448,z]));
  for(const sx of[-1,1])p.push(pt(box(.05,.2,.3),0xb8794a,[sx*(w/2-.08),.3,z]))}
 p.push(pt(new THREE.TorusGeometry(.06,.016,5,10),0x8f9aa6,[0,M.sh(D.L/2-.35)+.03,D.L/2-.35],[0,Math.PI/2,0]));
 for(const sx of[-1,1]){p.push(pt(cyl(.035,.035,.09,6),0x8f9aa6,[sx*.75,M.sh(1.4)+.04,1.4]));p.push(pt(new THREE.TorusGeometry(.21,.055,6,14),0xe0533f,[sx*(M.hw(-.9)*1.03+.03),.42,-.9],[0,Math.PI/2,0]))}
 /* 선외기 모터(조각 motor = 뒤판 위 가운데에서 좌우로 돌고, 그 안의 prop = 프로펠러) */
 const mo=[pt(lkRb(.2,.34,.18,.04,.02),0x3a3f4a,[0,-.02,-.05]),pt(lkRb(.46,.5,.58,.16,.06),0x33363b,[0,.36,-.3]),pt(lkRb(.47,.07,.59,.03,.02),0xe0533f,[0,.3,-.3]),pt(lkRb(.3,.06,.36,.08,.03),0x4a4f57,[0,.63,-.3]),
  pt(lkRb(.16,.86,.2,.05,.03),0x3a3f4a,[0,-.42,-.32]),pt(lkRb(.2,.16,.42,.06,.04),0x33363b,[0,-.84,-.34]),pt(lkRb(.04,.22,.3,.02,.01),0x33363b,[0,-1.0,-.38]),pt(lkRb(.5,.03,.22,.02,.01),0x3a3f4a,[0,-.66,-.38]),
  lkBeam([0,.22,-.04],[0,.2,.66],.07,.06,0x3a3f4a),pt(cyl(.05,.05,.24,8),0x22252b,[0,.2,.74],[Math.PI/2,0,0]),pt(cyl(.055,.055,.05,8),0xe0533f,[0,.2,.87],[Math.PI/2,0,0])];
 const pr=[pt(cyl(.05,.05,.1,8),0x8f9aa6,[0,0,0],[Math.PI/2,0,0])];for(let k=0;k<3;k++){const a=k/3*Math.PI*2;pr.push(pt(lkRb(.26,.1,.02,.04,.01),0xc9d1db,[Math.cos(a)*.13,Math.sin(a)*.13,0],[0,.35,a]))}
 lkModel('b81_mboat',p,{motor:{g:mo,pv:[0,M.sh(-D.L/2),-D.L/2+.02]},prop:{g:pr,par:'motor',pv:[0,-.86,-.6]}},{wake:[0,0,-D.L/2-.6]});
 for(const k of['b81_mboat','b81_mboat_b','b81_mboat_motor','b81_mboat_prop'])if(GEO[k])lkSmooth(GEO[k],50)}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{b81Kayak();b81MBoat()}catch(e){console.error('81차 배 모양',e)}try{lkAOnew(b0)}catch(e){}}}
BOAT81.mboat.tiller=[0,.2,.8];   /* 모터 조각 안 키 손잡이 끝 */

/* ---------- 배 움직임(모든 배: 뜨기·출렁·흘러가다 멈추기) ---------- */
const RIDE={on:false,s:null,tw:0,from:null,ph:0,sfxT:0,wakeT:0,saveT:0};
const b81Def=s=>BOAT81[s.t];
function b81Init(s){if(s.bt)return s.bt;s.bt={h:s.r||0,v:0,w:0,y:0,vy:0,load:0,pitch:0,roll:0,ph:hash(s.x*3|0,s.z*3|0,811)*6.28,steer:0};return s.bt}
/* 배 둘레 점이 다닐 수 있는지(깊은 물 · 부두 아님 · 다른 구조물 아님 · 맵 안) → 막힌 점 수 */
function b81Bad(s,x,z,h){const D=b81Def(s),c=Math.cos(h),sn=Math.sin(h);let n=0;
 for(const [lx,lz] of D.probe){const px=x+lx*c+lz*sn,pz=z-lx*sn+lz*c;if(px<8||pz<8||px>WS-8||pz>WS-8||hAt(px,pz)>-(D.draft+.05)||onDock(px,pz)){n++;continue}
  for(const q of structs){if(q===s||Math.abs(q.x-px)>6||Math.abs(q.z-pz)>6)continue;const d=sdef(q);if(d.pass||d.g==='nil'&&!d.bx)continue;if(inStruct(q,px,pz,.12)){n++;break}}}return n}
function b81Move(s,dt){const D=b81Def(s),B=b81Init(s);let moved=false;
 const dx=Math.sin(B.h)*B.v*dt,dz=Math.cos(B.h)*B.v*dt;if(Math.abs(B.v)>.01){const b0=b81Bad(s,s.x,s.z,B.h);
  if(b81Bad(s,s.x+dx,s.z+dz,B.h)<=b0){s.x+=dx;s.z+=dz;moved=true}
  else if(b81Bad(s,s.x+dx,s.z,B.h)<=b0&&Math.abs(dx)>1e-4){s.x+=dx;B.v*=.9;moved=true}
  else if(b81Bad(s,s.x,s.z+dz,B.h)<=b0&&Math.abs(dz)>1e-4){s.z+=dz;B.v*=.9;moved=true}
  else{const hit=Math.abs(B.v);B.v=-B.v*.25;if(hit>1.2&&dist(s.x,s.z,P.x,P.z)<40){sfx(110,.12,'triangle',.05,.6);const fx=s.x+Math.sin(B.h)*D.L*.5,fz=s.z+Math.cos(B.h)*D.L*.5;splash(fx,fz,4);shake=Math.max(shake||0,.15*Math.min(1,hit/6))}}}
 return moved}
function b81Turn(s,dh){const B=b81Init(s),h=B.h+dh,b0=b81Bad(s,s.x,s.z,B.h);if(b81Bad(s,s.x,s.z,h)<=b0){B.h=h;return true}B.w*=.5;return false}
/* 뜨기: 물 높이 0 기준, 사람이 타면 조금 가라앉음(스프링), 물결, 속도에 따라 뱃머리 들림, 돌 때 기울기 */
function b81Float(s,dt,t){const D=b81Def(s),B=b81Init(s),rid=RIDE.on&&RIDE.s===s,load=rid?D.sink:0,sp=Math.abs(B.v)/D.vmax;
 const wave=.022*Math.sin(t*1.6+B.ph)+.012*Math.sin(t*2.7+B.ph*1.7),ty=-load+wave+(s.t==='mboat'?.035*sp:0);
 B.vy+=((ty-B.y)*34-B.vy*7.5)*dt;B.y+=B.vy*dt;
 const tp=(s.t==='mboat'?-.05*Math.pow(sp,1.15):-.012*sp)+.012*Math.sin(t*1.25+B.ph),tr=-B.w*(s.t==='mboat'?.09:.06)*Math.min(1,sp*2+.2)+.016*Math.sin(t*1.05+B.ph*2.3);
 B.pitch+=(tp-B.pitch)*Math.min(1,dt*3);B.roll+=(tr-B.roll)*Math.min(1,dt*3);
 s.r=B.h;const m=s.m;if(m){m.position.set(s.x,-.04+B.y,s.z);m.rotation.order='YXZ';m.rotation.set(B.pitch,B.h,B.roll)}}
function b81Tick(dt){if(mode!=='play')return;const t=performance.now()/1000;
 for(const s of structs){if(!BOAT81[s.t]||!s.m)continue;const B=b81Init(s);if(!(RIDE.on&&RIDE.s===s)){B.w*=Math.exp(-dt*3);if(Math.abs(B.v)>.02){B.v*=Math.exp(-dt*b81Def(s).drag*1.4);b81Move(s,dt)}else B.v=0}
  if(RIDE.on&&RIDE.s===s)continue;if(dist(s.x,s.z,P.x,P.z)<120)b81Float(s,dt,t)}}

/* ---------- 타기 · 내리기 ---------- */
const B81V=new THREE.Vector3(),B81Q=new THREE.Vector3();
function b81Seat(s,k=0){const D=b81Def(s),q=D.seats[k];B81V.set(q[0],q[1],q[2]);s.m.updateMatrixWorld(true);return s.m.localToWorld(B81V)}
function b81Board(s){if(RIDE.on||P.dead)return;if(typeof fishing!=='undefined'&&fishing)endFish();if(bmode)setBuild(null);b81Init(s);
 RIDE.on=true;RIDE.s=s;RIDE.tw=0;RIDE.from={x:P.x,z:P.z,y:P.yv===undefined?groundY(P.x,P.z):P.yv};RIDE.ph=0;P.auto=null;inp.fire=false;
 P.a.holder.visible=false;P.a.play('Sit_Floor_Idle',{force:1,fade:.2});WTR.st='land';WTR.depth=0;hudDirty=true;s.bt.vy-=.35;sfx(260,.1,'sine',.04,.6);
 if(!RIDE.told){RIDE.told=1;toast(BOAT81[s.t].ic+' 왼쪽 조이스틱으로 가고 싶은 쪽을 눌러요. 오른쪽 조이스틱 톡 = 내리기')}else toast(BOAT81[s.t].ic+' '+BOAT81[s.t].n+'에 탔어요')}
/* 내릴 자리: 3m 안 땅·부두(걸어서 갈 수 있는 곳), 없으면 배 옆 물 */
function b81Exit(s){const D=b81Def(s),B=b81Init(s),c=Math.cos(B.h),sn=Math.sin(B.h),seat=b81Seat(s,0),cand=[];
 for(let r=.6;r<=3.2;r+=.4)for(let k=0;k<20;k++){const a=k/20*Math.PI*2,lx=Math.cos(a)*(D.W/2+r),lz=Math.sin(a)*(D.L/2+r)*.8,x=s.x+lx*c+lz*sn,z=s.z-lx*sn+lz*c;cand.push([x,z,dist(x,z,seat.x,seat.z)])}
 cand.sort((a,b)=>a[2]-b[2]);let land=null,water=null;
 for(const [x,z] of cand){if(inStruct(s,x,z,.5))continue;if(walk(x,z,.42,P)!==null)continue;const h=groundY(x,z);if((hAt(x,z)>.12||onDock(x,z))&&h<1.9){land=[x,z];break}if(!water&&hAt(x,z)<-.3)water=[x,z]}
 return land?{x:land[0],z:land[1],land:1}:water?{x:water[0],z:water[1],land:0}:null}
function b81Off(quiet){if(!RIDE.on)return;const s=RIDE.s;let e=s&&s.m?b81Exit(s):null;RIDE.on=false;RIDE.s=null;
 const sy=P.yv;if(e){P.x=e.x;P.z=e.z}else if(s){const q=b81Seat(s,0);P.x=q.x+1.2;P.z=q.z}
 P.yv=Math.max(sy||0,.3);P.vy=1.2;P.a.holder.visible=true;P.a.play('Idle',{force:1,fade:.2});if(s&&s.bt){s.bt.vy+=.25;s.bt.v*=.5}
 if(!quiet){sfx(220,.1,'sine',.04,.5);toast(e&&!e.land?'배에서 물로 내렸어요':'배에서 내렸어요')}hudDirty=true}
/* 탄 동안 한 장면: 조이스틱 → 배 돌리기·나아가기, 사람은 의자에 */
function b81Ride(dt){const s=RIDE.s,a=P.a;if(typeof restoreGrip==='function')restoreGrip(a);
 if(!s||!s.m||structs.indexOf(s)<0||P.dead||busy||INT.on){b81Off(true);return false}
 const D=b81Def(s),B=b81Init(s);if(WTR.st!=='land'){WTR.st='land';hudDirty=true}P.cd-=dt;P.inv-=dt;P.lastHurt+=dt;a.lock-=dt;
 let mx=inp.mx,mz=inp.mz,l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l;l=1}const go=l>.15&&RIDE.tw>=1;P.moving=go;
 let thr=0,want=0;if(go){const hd=Math.atan2(mx,mz);let df=hd-B.h;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;
  const sp=Math.abs(B.v)/D.vmax,tr=lerp(D.turn0,D.turn,Math.min(1,sp*1.6))*(DEV.on?1.4:1);want=clamp(df*2.2,-1,1)*tr;thr=l*clamp(Math.cos(df)*1.2,0,1)*(Math.abs(df)<1.9?1:0)}
 B.w+=(want-B.w)*Math.min(1,dt*4);if(Math.abs(B.w)>1e-3)b81Turn(s,B.w*dt);
 const vt=D.vmax*thr*(DEV.on?DEV.sp:1)*(typeof bufSpeed==='function'&&s.t==='kayak'?Math.min(1.3,bufSpeed()):1);
 if(vt>B.v)B.v=Math.min(vt,B.v+D.acc*dt*(.4+.6*thr));else B.v-=(B.v-vt)*Math.min(1,dt*D.drag);
 b81Move(s,dt);RIDE.thr=thr;b81Float(s,dt,performance.now()/1000);   /* 탄 배는 여기서 먼저 옮겨야 사람이 한 장면 늦게 따라오지 않아요 */
 /* 사람: 의자 자리, 배와 같이 기울기 */
 const q=b81Seat(s,0);if(RIDE.tw<1){RIDE.tw=Math.min(1,RIDE.tw+dt/.42);const u=sm(0,1,RIDE.tw),f=RIDE.from;P.x=lerp(f.x,q.x,u);P.z=lerp(f.z,q.z,u);P.yv=lerp(f.y,q.y,u)+Math.sin(u*Math.PI)*.55}
 else{P.x=q.x;P.z=q.z;P.yv=q.y}P.vy=0;P.rot=B.h;
 a.play('Sit_Floor_Idle',{fade:.25});if(a.wid!==curId())a.weapon(curId());a.holder.visible=false;a.set(P.x,P.z,P.rot);a.root.position.y=P.yv;a.root.rotation.order='YXZ';
 if(RIDE.tw>=1)a.root.rotation.set(B.pitch,B.h,B.roll);unpose(a);a.mixer.update(dt);
 /* 소리·물결 */
 const t=performance.now()/1000,sp=Math.abs(B.v);RIDE.wakeT-=dt;
 if(sp>.6&&RIDE.wakeT<=0){RIDE.wakeT=s.t==='mboat'?.07:.22;const c=Math.cos(B.h),sn=Math.sin(B.h),bz=-D.L/2-.2;ripple(s.x+bz*sn,s.z+bz*c,s.t==='mboat'?1.2+sp*.06:.8,1.3);
  if(s.t==='mboat'&&sp>4){puff(s.x+bz*sn+(Math.random()-.5)*.6,.12,s.z+bz*c+(Math.random()-.5)*.6,0xf2f8ff,2,.5);if(Math.random()<.5){const f=D.L/2-.6,sx=(Math.random()<.5?-1:1)*D.W*.42;puff(s.x+f*sn+sx*c,.2,s.z+f*c-sx*sn,0xf2f8ff,1,.4)}}}
 RIDE.sfxT-=dt;if(s.t==='mboat'&&RIDE.sfxT<=0){RIDE.sfxT=.11;sfx(52+sp*5+thr*20,.12,'sawtooth',.006+thr*.01)}
 RIDE.saveT-=dt;if(RIDE.saveT<=0){RIDE.saveT=.5;const e=b81Exit(s);if(e){S.px=e.x;S.pz=e.z}}
 if(inp.actEdge||inp.act){inp.act=false;if(RIDE.tw>=1)b81Off(false)}inp.actEdge=false;inp.fire=false;return true}
{const _up=updPlayer;updPlayer=function(dt){if(RIDE.on&&b81Ride(dt))return;return _up.apply(this,arguments)}}
/* 탄 동안 상호작용 대상 = 내리기 하나 */
{const _ft=findTarget;findTarget=function(){if(RIDE.on){const s=RIDE.s;if(!s)return null;let z=P.z-2.4;for(let i=0;i<3;i++){const t=(groundY(P.x,z)+2.6-(P.yv+3.1))/-.742;z=P.z-t*.67}return{k:'ride',s,x:P.x,z,lab:'⬇ 내리기',rr:2}}
 const t=_ft.apply(this,arguments);if(bmode||P.dead||INT.on)return t;let b=null,bd=(typeof TREACH!=='undefined'?TREACH:.9)+.25;
 for(const s of structs){if(!BOAT81[s.t]||dist(s.x,s.z,P.x,P.z)>8)continue;const g=sGap(P.x,P.z,s);if(g<bd){bd=g;b=s}}
 if(b&&(!t||WTR.st==='swim'||isRod(curId())||t.k!=='s'||sGap(P.x,P.z,t.s)>bd))return{k:'s',s:b,x:b.x,z:b.z,lab:BOAT81[b.t].ic+' '+BOAT81[b.t].n+' 타기',rr:2};return t}}
{const _sl=sLabel;sLabel=function(s){if(BOAT81[s.t])return BOAT81[s.t].ic+' '+BOAT81[s.t].n+' 타기';return _sl.apply(this,arguments)}}
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='ride'){b81Off(false);return}if(t&&t.k==='s'&&BOAT81[t.s.t]){b81Board(t.s);return}return _ia.apply(this,arguments)}}
/* 헤엄 중에도 배에 탈 수 있게(원래는 헤엄치면 상호작용이 없어요) */
{const _up=updPlayer;updPlayer=function(dt){const r=_up.apply(this,arguments);if(!RIDE.on&&WTR.st==='swim'&&(inp.actEdge||inp.act)&&target&&target.k==='s'&&BOAT81[target.s.t]&&!P.dead)b81Board(target.s);return r}}
{const _sb=setBuild;setBuild=function(m){if(RIDE.on&&m){toast('배에서 내려서 해요');return}return _sb.apply(this,arguments)}}
/* 모든 배 뜨기 + 탄 동안 노 젓기(손) */
{const _ue=updEnv;updEnv=function(dt){const r=_ue.apply(this,arguments);try{b81Tick(dt);b81Arms(dt)}catch(e){console.error('81차 배',e)}return r}}
/* 카약 노: 배에 붙은 노를 좌우로 번갈아 담그고, 두 손은 노 손잡이로(68차 reachGrip) */
function b81Paddle(s){if(s.pad)return s.pad;const m=mesh(GEO.b81_paddle,MATT);s.m.add(m);s.pad=m;return m}
function b81Arms(dt){for(const s of structs){if(s.t!=='kayak'||!s.m)continue;const pd=b81Paddle(s),rid=RIDE.on&&RIDE.s===s;
  if(!rid){pd.position.set(0,B81K.dk(.72)+.04,.72);pd.rotation.set(Math.PI/2,0,0,'YZX');continue}}
 if(!RIDE.on||!RIDE.s||!RIDE.s.m||mode!=='play')return;const s=RIDE.s,a=P.a,B=b81Init(s),D=b81Def(s),bones=a.dog?a.dog.B:boneMap(a);if(!bones||!bones.upperarmr)return;
 const seat=D.seats[0];a.root.updateMatrixWorld(true);
 const shY=a.root.worldToLocal(bones.upperarmr.getWorldPosition(B81Q)).y,fw=(typeof carryFit!=='undefined'&&carryFit[a.dog?a.dog.v:'hero']||{forward:.4}).forward;
 if(s.t==='kayak'){const pd=b81Paddle(s),half=GEO.b81_paddle.userData.half,cy=seat[1]+shY-.22,thr=RIDE.thr||0,sp=Math.abs(B.v)/D.vmax;
  RIDE.ph+=dt*(1.1+5.2*Math.max(thr,sp*.8));const ph=RIDE.ph,act=Math.min(1,Math.max(thr,sp)*1.6),A=lerp(.08,Math.asin(clamp((cy+.12)/(half-.15),0,.95)),act),Y=lerp(.06,.38,act);
  pd.position.set(seat[0],cy,seat[2]+fw*.65);pd.rotation.set(0,Y*Math.cos(ph),A*Math.sin(ph),'YZX');
  /* 물에 들어간 노 끝 = 물결 */
  RIDE.dipT=(RIDE.dipT||0)-dt;if(act>.3&&RIDE.dipT<=0){for(const sx of[1,-1]){B81V.set(sx*(half-.2),0,0);pd.localToWorld(B81V);if(B81V.y<.02){ripple(B81V.x,B81V.z,.55,.8);RIDE.dipT=.28;if(Math.random()<.35)puff(B81V.x,.1,B81V.z,0xeaf6ff,1,.35)}}}
  if(RIDE.tw<1)return;saveGrip(a,bones);pd.updateMatrixWorld(true);
  for(const [side,sx] of [['r',-1],['l',1]]){B81V.set(sx*.27,0,0);pd.localToWorld(B81V);reachGrip(bones,side,B81V,a.root.rotation.y)}}
 else if(s.t==='mboat'&&RIDE.tw>=1){const mo=s.lk&&s.lk.parts.motor,pr=s.lk&&s.lk.parts.prop;if(mo){mo.rotation.y+=(-(B.w||0)*.42-mo.rotation.y)*Math.min(1,dt*6)}if(pr)pr.rotation.z+=dt*(6+60*(RIDE.thr||0));
  if(!mo)return;saveGrip(a,bones);mo.updateMatrixWorld(true);B81V.fromArray(D.tiller);mo.localToWorld(B81V);reachGrip(bones,'r',B81V,a.root.rotation.y);
  B81V.set(B81M.hw(seat[2]+.05)*.98,B81M.sh(seat[2]+.05)+.02,seat[2]+.05);s.m.localToWorld(B81V);reachGrip(bones,'l',B81V,a.root.rotation.y)}}
/* 안 탄 모터보트는 프로펠러가 천천히 멈춰요 */
{const _ue=updEnv;updEnv=function(dt){const r=_ue.apply(this,arguments);for(const s of structs){if(s.t!=='mboat'||!s.lk||RIDE.on&&RIDE.s===s)continue;const mo=s.lk.parts.motor;if(mo)mo.rotation.y*=Math.exp(-dt*2)}return r}}
/* 철거(키트로 돌려받기) 전에 타고 있으면 내려요 */
{const _rs=removeStruct;removeStruct=function(s){if(RIDE.on&&RIDE.s===s)b81Off(true);return _rs.apply(this,arguments)}}
/* 탄 동안 오른쪽 조이스틱 그림 = ✋(톡 = 내리기) */
{const _rm=rjMode;rjMode=function(){if(RIDE.on)return'tap';return _rm.apply(this,arguments)}}
