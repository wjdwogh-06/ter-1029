'use strict';
/* ===== ui: hud, panels, input, icons, minimap, boot, loop ===== */
let hudDirty=true,mode='load',panel=null,selItem=null,UIS=1,VW=0,VH=0,MAPC=null,toastT=0,hurtT=0,saveT=0,hudT=0,DPR=1,last=0;
const ICON={},fx=$('fx'),fctx=fx.getContext('2d'),keys={};
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');toastT=2.6}
function hurtFx(){$('hurt').style.opacity=1;hurtT=.35}
/* 쓰러지면(기획자 요청): 바로 일어나지 않고 어두운 화면에서 천천히 로딩 → 무작위 항구에서 깨어나요. cb는 부활을 처리하고 항구 이름을 돌려줘요 */
const RESP_T=4200;
function respawnLoad(cb){busy=true;const f=$('respawn'),bar=$('rsBar'),st=$('rsSt');f.classList.remove('ferry','house');f.querySelector('.rsT').textContent='쓰러졌어요…';f.querySelector('.rsH').textContent='무작위 항구에서 다시 깨어나요';f.classList.add('on');bar.style.width='0%';st.textContent='가방을 그 자리에 떨어뜨렸어요';
 const msgs=[[0,'가방을 그 자리에 떨어뜨렸어요'],[.34,'숨을 고르는 중…'],[.66,'무작위 항구를 찾는 중…']];let t0=0;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/RESP_T);bar.style.width=(k*100).toFixed(1)+'%';let m='';for(const [a,q] of msgs)if(k>=a)m=q;if(st.textContent!==m)st.textContent=m;
  if(k<1){requestAnimationFrame(step);return}
  const name=cb();unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent=(name||'항구')+' 앞에서 깨어났어요';hudDirty=true;
  setTimeout(()=>{f.classList.remove('on');setTimeout(()=>busy=false,500)},800)};
 setTimeout(()=>requestAnimationFrame(step),600)}
/* 자판기 창이 열려 있으면 남은 시간을 고치고, 정각이 지나면 새 물건으로 다시 그려요 */
let _vHr=-1;setInterval(()=>{if(panel!=='vend'){_vHr=-1;return}const hr=Math.floor(Date.now()/VEND.per);if(_vHr>=0&&hr!==_vHr)renderPanel();_vHr=hr;const e=$('vLeft');if(e)e.textContent=`다음 교체까지 ${Math.ceil(vendLeft()/60000)}분`},10000);
function fadeDo(msg,cb){busy=true;const f=$('fade');f.textContent=msg;f.classList.add('on');setTimeout(()=>{cb();unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);f.classList.remove('on');hudDirty=true;setTimeout(()=>busy=false,450)},1000)}
function resize(){const w=innerWidth,h=innerHeight;DPR=Math.min(window.devicePixelRatio||1,opt.gfx?2:1);R.setPixelRatio(DPR);R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?34:24;CAMK=Math.tan((w<h?46:36)*Math.PI/360)/Math.tan(cam.fov*Math.PI/360);cam.updateProjectionMatrix();fx.width=Math.round(w*DPR);fx.height=Math.round(h*DPR);
 UIS=w>h?clamp(h/500,.5,1.5):clamp(w/560,.5,1.2);VW=w/UIS;VH=h/UIS;const u=$('ui');u.classList.toggle('port',w<=h);u.style.transform=`scale(${UIS})`;u.style.width=VW+'px';u.style.height=VH+'px';$('shade').style.width=VW+'px';$('shade').style.height=VH+'px';layoutPanel();
 if(R.shadowMap.enabled!==!!opt.gfx){R.shadowMap.enabled=!!opt.gfx;sun.castShadow=!!opt.gfx;MAT.needsUpdate=true;for(const k in CMAT)CMAT[k].needsUpdate=true}sun.shadow.mapSize.set(2048,2048);$('tsT').classList.toggle('hide',!opt.gfx);$('tsB').classList.toggle('hide',!opt.gfx)}
/* ---- icons ---- */
function makeIcons(){const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setSize(128,128);const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x8892a0,1.15));const d=new THREE.DirectionalLight(0xfff4e0,1.25);d.position.set(2,4,3);sc.add(d);
 const m=new THREE.Mesh(GEO.can,new THREE.MeshLambertMaterial({vertexColors:true})),piv=new THREE.Group();piv.add(m);sc.add(piv);const c=new THREE.OrthographicCamera(-1,1,1,-1,.1,60);const v=new THREE.Vector3(),bx=new THREE.Box3();
 for(const id in ITEMS){const it=ITEMS[id],g=GEO[it.ic];if(!g)continue;m.geometry=g;g.computeBoundingBox();g.boundingBox.getCenter(v);m.position.copy(v).multiplyScalar(-1);if(it.ty==='gun')piv.rotation.set(.3,-1.0,.25);else if(/^c?f_hammer/.test(id))piv.rotation.set(.85,-Math.PI/2+.5,0);else if(/^c?f_/.test(id))piv.rotation.set(.32,-Math.PI/2+.32,0);else if(id==='rod')piv.rotation.set(0,-1.57,-.25);else if(it.ty==='tool'||id==='grenade')piv.rotation.set(.2,.3,-.6);else piv.rotation.set(.5,-.7,0);
  piv.updateMatrixWorld(true);bx.setFromObject(piv);bx.getSize(v);const rr=Math.max(v.x,v.y)*.56;c.left=-rr;c.right=rr;c.top=rr;c.bottom=-rr;bx.getCenter(v);c.position.set(v.x,v.y,20);c.updateProjectionMatrix();r.render(sc,c);ICON[id]=r.domElement.toDataURL()}
 ICON.coin=(()=>{m.geometry=GEO.coin_stack_small;GEO.coin_stack_small.computeBoundingBox();GEO.coin_stack_small.boundingBox.getCenter(v);m.position.copy(v).multiplyScalar(-1);piv.rotation.set(.6,-.6,0);c.left=-.75;c.right=.75;c.top=.75;c.bottom=-.75;c.position.set(0,0,20);c.updateProjectionMatrix();r.render(sc,c);return r.domElement.toDataURL()})();
 piv.visible=false;const a=new Actor('hero');a.helmet();scene.remove(a.root);sc.add(a.root);a.root.rotation.y=.4;a.play('Idle');a.mixer.update(.3);const pc=new THREE.PerspectiveCamera(15,1,.1,50);pc.position.set(.2,1.9,7);pc.lookAt(0,1.72,0);r.setSize(192,192);r.render(sc,pc);$('ava').innerHTML=`<img src="${r.domElement.toDataURL()}">`;r.dispose()}
function makeMap(){MAPC=document.createElement('canvas');MAPC.width=MAPC.height=WS;const x=MAPC.getContext('2d'),im=x.createImageData(WS,WS);for(let j=0;j<WS;j++)for(let i=0;i<WS;i++){const h=hAt(i,j);let r,g,b;if(h<0){const t=Math.min(1,-h/3);r=120-80*t;g=190-100*t;b=210-70*t}else if(h<.9){r=214;g=198;b=150}else if(pathD(i,j)<1.8){r=186;g=164;b=120}else{const n=noise(i*.08,j*.08,3),tp=tundraAt(i,j,h)*.6,rk=sm(7,10,h);r=lerp(lerp(128-n*26,180,tp),150,rk);g=lerp(lerp(178-n*18,186,tp),148,rk);b=lerp(lerp(84-n*10,96,tp),138,rk);const o=objs.get(((j/CELL)|0)*CN+((i/CELL)|0));if(o&&o.t<3){r*=.6;g*=.78;b*=.62}}
  const sh=1+clamp((hAt(i+1,j-1)-h)*.22,-.25,.25),o=(j*WS+i)*4;im.data[o]=r*sh;im.data[o+1]=g*sh;im.data[o+2]=b*sh;im.data[o+3]=255}x.putImageData(im,0,0)}
function drawMap(c,span,size){if(!INT.on)return drawMap0(c,span,size);const x=P.x,z=P.z;P.x=INT.ret.x;P.z=INT.ret.z;try{drawMap0(c,span,size)}finally{P.x=x;P.z=z}}
function drawMap0(c,span,size){c.fillStyle='#285a86';c.fillRect(0,0,size,size);const k=size/span;c.save();if(span<WS)c.translate(size/2-P.x*k,size/2-P.z*k);c.scale(k,k);c.imageSmoothingEnabled=true;c.drawImage(MAPC,0,0);const big=span>=WS;
 const dot=(x,z,col,r,sq)=>{c.fillStyle=col;c.strokeStyle='#fff';c.lineWidth=1.6/k;c.beginPath();if(sq)c.rect(x-r/k,z-r/k,2*r/k,2*r/k);else c.arc(x,z,r/k,0,7);c.fill();c.stroke()};
 dot(VIL.x,VIL.z,'#6CB8FF',5,1);dot(OUT.x,OUT.z,'#6CB8FF',4.5,1);dot(S.home.x,S.home.z,'#FFB547',5);POI.camps.forEach((p,i)=>dot(p.x,p.z,S.campDay[i]?'#888':'#d9534f',span<WS?5:7,1));POI.springs.forEach(p=>dot(p.x,p.z,'#3fd9e0',span<WS?5:6));if(span>=WS)POI.wrecks.forEach(p=>dot(p.x,p.z,'#9aa3ad',4));POI.lh.forEach((p,i)=>{if(LH_GONE.includes(i))return;dot(p.x,p.z,S.lh[i]?'#ffe27a':'#8a8f99',span<WS?5:6)});if(typeof CAVE!=='undefined'&&CAVE.s)dot(CAVE.s.x,CAVE.s.z,'#6b4a32',span<WS?5:6.5,1);PORTS.forEach(p=>dot(p.x,p.z,'#4fc3ff',p.town?7.5:5.5,1));SUPS.forEach(s=>dot(s.x,s.z,'#ffb547',big?3.6:4.5,1));if(typeof PLACES!=='undefined')PLACES.forEach(q=>dot(q.x,q.z,q.c,big?4.6:5.5,1));POI.bunk.forEach((p,i)=>dot(p.x,p.z,'#3a4048',span<WS?5:5.5,1));if(S.bag)dot(S.bag.x,S.bag.z,'#B79CFF',6);
 for(const e of enemies)if(!e.dead&&(e.raid||dist(e.x,e.z,P.x,P.z)<60))dot(e.x,e.z,'#FF6B5E',big?2.4:3.4);
 if(typeof NET!=='undefined'&&NET.on)NET.players.forEach(p=>{if(p.hp>0)dot(p.x,p.z,'#7BD88F',big?3:3.6)});
 if(big){c.textAlign='center';c.lineWidth=3/k;c.strokeStyle=UIC.brn;c.fillStyle='#fff';for(const I of ISL){if(I.ty===2||I.ty===4)continue;c.font=`800 ${(I.ty?11:14)/k}px ${UIF}`;const ly=I.z-(I.ty===1?I.r*.62:8);c.strokeText(I.n,I.x,ly);c.fillText(I.n,I.x,ly)}}
 if(DEV.on)DEV.marks.forEach(m=>{dot(m.x,m.z,MTYPE[m.t][2],big?5:6);if(big){c.font=`800 ${12/k}px ${UIF}`;c.textAlign='left';c.lineWidth=3/k;c.strokeStyle=UIC.brn;const t=MTYPE[m.t][1]+m.n;c.strokeText(t,m.x+8/k,m.z+4/k);c.fillStyle=MTYPE[m.t][2];c.fillText(t,m.x+8/k,m.z+4/k)}});
 c.translate(P.x,P.z);c.rotate(-P.rot+Math.PI);c.fillStyle='#fff';c.strokeStyle='#1a2433';c.lineWidth=1.5/k;c.beginPath();c.moveTo(0,-9/k);c.lineTo(6/k,7/k);c.lineTo(0,3/k);c.lineTo(-6/k,7/k);c.closePath();c.fill();c.stroke();c.restore()}
/* ---- dev mode ---- */
let devBar=null,markG=null;
function devInit(){devBar=document.createElement('div');devBar.id='devbar';devBar.className='pn hide';devBar.style.cssText='left:12px;top:182px;padding:8px 10px;border-radius:14px;font-size:13px;border-color:#4fc3ff;max-width:330px';
 devBar.innerHTML='<div id="devTx" style="font-weight:800;line-height:1.5;white-space:nowrap"></div><div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button class="btn" data-d="mark" style="min-height:38px;padding:8px 10px;font-size:13px;width:auto">📍 여기 표시</button><button class="btn g" data-d="type" id="devTy" style="min-height:38px;padding:8px 10px;font-size:13px;width:auto"></button><button class="btn g" data-d="sp" id="devSp" style="min-height:38px;padding:8px 10px;font-size:13px;width:auto"></button><button class="btn g" data-d="list" style="min-height:38px;padding:8px 10px;font-size:13px;width:auto">목록</button><button class="btn g" data-d="item" style="min-height:38px;padding:8px 10px;font-size:13px;width:auto;border:2px solid #7BD88F">🎁 아이템</button></div>';
 $('ui').insertBefore(devBar,$('shade'));devBar.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-d]');if(!b)return;e.preventDefault();e.stopPropagation();const d=b.dataset.d;
  if(d==='mark')addMark();else if(d==='type'){DEV.type=(DEV.type+1)%MTYPE.length;sfx(600,.04)}else if(d==='sp'){DEV.sp=DEV.sp===1?3:DEV.sp===3?8:1;devSave();sfx(600,.04)}else if(d==='list')openPanel('dev');else if(d==='item')openPanel('devitem');devHud()});
 markG=new THREE.Group();scene.add(markG);syncMarks();devHud()}
function addMark(x=P.x,z=P.z){const I=islAt(x,z),t=DEV.type,n=DEV.marks.reduce((a,m)=>m.t===t?Math.max(a,m.n):a,0)+1;DEV.marks.push({t,n,x:Math.round(x),z:Math.round(z),isl:I&&hAt(x,z)>0?I.n:'바다',memo:''});devSave();syncMarks();jingle([660,880]);toast(`${MTYPE[t][0]} ${MTYPE[t][1]} ${n} 표시 (x ${Math.round(x)}, z ${Math.round(z)})`)}
function syncMarks(){if(!markG)return;while(markG.children.length)markG.remove(markG.children[0]);markG.visible=DEV.on;DEV.marks.forEach(m=>{const c=new THREE.Color(MTYPE[m.t][2]),g=new THREE.Group(),y=Math.max(hAt(m.x,m.z),0);
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,14,6),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.75,fog:false}));b.position.y=7;g.add(b);const r=new THREE.Mesh(new THREE.RingGeometry(1.5,1.9,24),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,fog:false}));r.rotation.x=-Math.PI/2;r.position.y=.25;g.add(r);const s=glow(c.getHex(),5,.7);s.position.y=14;g.add(s);g.position.set(m.x,y,m.z);markG.add(g)})}
function devHud(){if(!devBar)return;devBar.classList.toggle('hide',!DEV.on||mode!=='play');if(markG)markG.visible=DEV.on;if(!DEV.on)return;const I=islAt(P.x,P.z),h=hAt(P.x,P.z);$('devTx').innerHTML=`🛠 x <b style="color:#2F7FC4">${Math.round(P.x)}</b> · z <b style="color:#2F7FC4">${Math.round(P.z)}</b> · ${h>=0?'높이 '+h.toFixed(1):'수심 '+(-h).toFixed(1)}<br><span style="color:var(--mut)">${I?I.n:'먼바다'} · 표시 ${DEV.marks.length}개</span>`;
 $('devTy').textContent=`종류: ${MTYPE[DEV.type][0]} ${MTYPE[DEV.type][1]}`;$('devSp').textContent=`속도 ×${DEV.sp}`}
const markText=()=>DEV.marks.map(m=>`${MTYPE[m.t][1]}${m.n}: x=${m.x}, z=${m.z} (${m.isl})${m.memo?' — '+m.memo:''}`).join('\n');
function devTp(x,z){P.x=clamp(x,6,WS-6);P.z=clamp(z,6,WS-6);P.auto=null;closePanel();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);toast(`순간이동: x ${Math.round(P.x)}, z ${Math.round(P.z)}`)}
/* ---- fullscreen map (tap the minimap) ---- */
let fmap=null;
function drawFmap(){const s=Math.min(innerWidth,innerHeight)-12,c=$('fmapC'),d=Math.min(1.5,window.devicePixelRatio||1);c.width=c.height=Math.round(s*d);c.style.width=c.style.height=s+'px';drawMap(c.getContext('2d'),WS,c.width);const st='width:auto;min-height:40px;padding:9px 12px;font-size:14px';
 $('fmapB').innerHTML=`<button class="btn r" data-f="x" style="${st}">✕ 닫기</button>`+(DEV.on?`<button class="btn" data-f="m" style="${st}">${DEV.mapMark?'누르면: 표시 찍기':'누르면: 순간이동'}</button><button class="btn g" data-f="t" style="${st}">종류: ${MTYPE[DEV.type][0]} ${MTYPE[DEV.type][1]}</button><button class="btn g" data-f="l" style="${st}">목록 (${DEV.marks.length})</button>`:'')}
function openFmap(){if(mode!=='play'||panel)return;if(!fmap){fmap=document.createElement('div');fmap.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(40,24,14,.62);display:none;align-items:center;justify-content:center';fmap.innerHTML='<canvas id="fmapC" style="border-radius:14px;border:5px solid #FBF4E6;box-shadow:0 0 0 2.5px #5A3A2E,0 14px 30px rgba(40,24,12,.45)"></canvas><div id="fmapB" style="position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:8px;align-items:flex-end"></div>';document.body.appendChild(fmap);
  fmap.addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){const f=b.dataset.f;if(f==='x'){closePanel();return}if(f==='l'){closePanel();openPanel('dev');return}if(f==='m')DEV.mapMark=!DEV.mapMark;if(f==='t')DEV.type=(DEV.type+1)%MTYPE.length;sfx(600,.04);drawFmap();return}
   if(e.target.id==='fmapC'&&DEV.on){const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*WS,z=(e.clientY-r.top)/r.height*WS;if(DEV.mapMark){addMark(x,z);drawFmap()}else devTp(x,z)}})}
 panel='fmap';inp.fire=inp.act=false;joyEnd();fmap.style.display='flex';drawFmap();sfx(600,.04)}
$('mmw').style.pointerEvents='auto';$('mmw').addEventListener('pointerdown',e=>{e.preventDefault();openFmap()});
/* ---- hud ---- */
const invIcon=id=>`<img src="${ICON[id]}">`;
function drawQuick(){$('quick').innerHTML=S.quick.map((id,i)=>`<div class="slot ${i===S.sel?'sel':''}" data-q="${i}">${id&&invN(id)?invIcon(id)+(ITEMS[id].one?'':`<b>${invN(id)}</b>`):''}<span class="key">${i+1}</span></div>`).join('')}
function hud(){$('bHp').style.width=clamp(S.hp,0,100)+'%';$('bHu').style.width=S.hunger+'%';$('bWa').style.width=S.warm+'%';$('tHp').textContent=Math.ceil(clamp(S.hp,0,100));$('tHu').textContent=Math.ceil(S.hunger);$('tWa').textContent=Math.ceil(S.warm);$('dayTx').textContent=`· ${S.day}일째`;
 const hh=S.time*24,h=hh|0,mi=((hh-h)*60)|0;$('clkTx').textContent=`${dark()>.5?'🌙':'☀'} ${h<12?'오전':'오후'} ${(h%12)||12}:${String(mi).padStart(2,'0')}`;
 if(raid.on)$('raidTx').textContent=`⚔ 습격 중! 남은 적 ${enemies.filter(e=>e.raid&&!e.dead).length}`;else{const s=raidEta()|0;$('raidTx').textContent=`⚔ 습격까지 ${(s/60)|0}:${String(s%60).padStart(2,'0')}`}
 const q=QUESTS[S.q];$('quest').innerHTML=q?`<small>목표 ${S.q+1}/${QUESTS.length} · 보상 ${q.r} 동전</small><div>${q.t}</div>`:'<small>모든 목표 달성</small><div>섬을 지배해 보세요!</div>';
 const id=curId(),w=WEAP[id];$('pills').innerHTML=`<div class="pn pill">${invIcon('coin')}${S.coins}</div>`+(w.ammo?`<div class="pn pill">${invIcon(w.ammo)}${invN(w.ammo)}</div>`:'')+(WTR.st==='swim'?'<div class="pn pill" style="color:#8fd3ff">🏊 깊은 물</div>':WTR.st==='wade'?'<div class="pn pill" style="color:#8fd3ff">🌊 얕은 물</div>':WTR.st==='spring'?'<div class="pn pill" style="color:#7fe6e0">♨ 온천</div>':'')+(WX.b>.3?'<div class="pn pill" style="color:#cfe3ff">🌧 비바람</div>':'')+(typeof NET!=='undefined'&&NET.on?`<div class="pn pill" style="color:#7BD88F">👥 ${NET.n}${dist(P.x,P.z,VIL.x,VIL.z)<NET.safe?' · 안전지대':''}</div>`:'');
 $('atkIc').style.display=id==='fist'?'none':'';if(id!=='fist')$('atkIc').src=ICON[id];const sw=WTR.st==='swim',wd=w.rod&&WTR.st==='wade';$('bAtk').style.opacity=sw||wd?.45:1;$('atkN').textContent=sw?'헤엄 중':wd?'물 밖에서':w.rod?(!fishing?'던지기':fishing.st==='bite'?'챔질!':fishing.st==='reel'?'꾹 눌러 감기':fishing.st==='wait'?'기다리는 중':''):id==='fist'?'주먹':w.ammo?invN(w.ammo):'';$('bAtk').classList.toggle('bite',!!fishing&&fishing.st==='bite');
 {const md=actMode(),lb=md==='build'?(bmode==='demo'?'철거':'설치'):md==='act'?target.lab:'',L=$('atkL');if(L.textContent!==lb)L.textContent=lb;$('bAtk').classList.toggle('act',md!=='fire');if(md!=='fire')$('bAtk').style.opacity=1}
 devHud();if(hudDirty){drawQuick();if(panel&&panel!=='dev'&&panel!=='fmap'&&panel!=='devitem')renderPanel();hudDirty=false}drawMap($('mm').getContext('2d'),110,198);$('cold').style.opacity=S.warm<30?(30-S.warm)/30*.9:0}
function buildUI(){const b=$('bbar');b.classList.toggle('hide',!bmode);if(!bmode)return;const d=BUILDS[bmode];b.innerHTML=(bmode==='demo'?'<span>철거할 내 건물 가까이에서 [철거]</span>':`<span>${d.n}</span><span style="color:var(--mut);font-weight:500">${costHtml(d.c)}</span><button class="btn g" data-b="rot">↻ ${ROT_N[rotStep()+1]}</button>`)+'<button class="btn r" data-b="x">그만</button>'}
const costHtml=c=>Object.keys(c).map(k=>`<span class="cost ${invN(k)>=c[k]?'ok':'no'}">${ITEMS[k].n} ${invN(k)}/${c[k]}</span>`).join('');
/* ---- panels ---- */
const TABS=[];   /* 27차(기획자): 가방 창의 제작·건설·지도 탭을 없앴어요. 창마다 제목 하나만 */
/* 가방(bag)은 옆에 붙는 창: 게임이 계속 돌고 조이스틱으로 움직일 수 있어요. 나머지 창은 화면 가운데(게임 멈춤) */
const sidePanel=()=>panel==='bag';
/* 가방이 열리면 화면을 살짝 밀어서 캐릭터가 남은 칸 가운데에 오게 (가로: 왼쪽, 세로: 위) */
const BV={x:0,y:0};function bagView(dt){const el=$('panel'),side=sidePanel()&&mode==='play',port=innerWidth<=innerHeight,k=Math.min(1,dt*9);let tx=0,ty=0;
 if(side){const r=el.getBoundingClientRect(),p=scr(P.x,groundY(P.x,P.z)+1,P.z);   /* 캐릭터가 실제로 보이는 자리를 재서, 남은 칸 가운데로 */
  if(port)ty=BV.y+(p[1]-r.top*.5);else tx=BV.x+(p[0]-r.left*.5);tx=clamp(tx,0,innerWidth*.45);ty=clamp(ty,-innerHeight*.2,innerHeight*.45)}
 BV.x+=(tx-BV.x)*k;BV.y+=(ty-BV.y)*k;if(Math.abs(BV.x)+Math.abs(BV.y)>.5)cam.setViewOffset(innerWidth,innerHeight,BV.x,BV.y,innerWidth,innerHeight);else if(cam.view&&cam.view.enabled){cam.clearViewOffset()}}
function layoutPanel(){const el=$('panel'),side=sidePanel(),port=VW<=VH;$('toast').style.left=side&&!port?Math.round((VW-clamp(VW*.48,360,540)-12)/2)+'px':'';el.classList.toggle('side',side);$('shade').classList.toggle('hide',!panel||side);
 if(side){if(port){const h=Math.round(clamp(VH*.5,300,560));Object.assign(el.style,{width:(VW-20)+'px',height:h+'px',left:'10px',top:(VH-h-10)+'px',transform:'none'})}
  else{const w=Math.round(clamp(VW*.48,360,540));Object.assign(el.style,{width:w+'px',height:(VH-24)+'px',left:(VW-w-12)+'px',top:'12px',transform:'none'})}}
 else Object.assign(el.style,{width:Math.min(1060,VW-20)+'px',height:Math.min(640,VH-24)+'px',left:'',top:'',transform:''})}
function openPanel(k){panel=k;if(k!=='bag'){inp.fire=inp.act=false;inp.aiming=false;joyEnd()}   /* 31차: 가방은 쏘기·낚시·걷기를 끊지 않아요 */$('panel').classList.remove('hide');layoutPanel();renderPanel()}
function closePanel(){if(fmap)fmap.style.display='none';panel=null;selItem=null;$('shade').classList.add('hide');$('panel').classList.add('hide');$('panel').classList.remove('side');$('toast').style.left='';$('title').style.zIndex=20;hudDirty=true}
const nearBench=()=>structs.some(s=>s.t==='bench'&&(!s.in||s.hk===curHK())&&dist(s.x,s.z,P.x,P.z)<7);   /* 44차: 들어와 있는 텐트의 작업대만 */
const craftRows=(nb,nf)=>RECIPES.map((r,i)=>{const it=ITEMS[r.id],has=it.one&&invN(r.id),ok=canPay(r.c)&&(!r.bench||nb||nf)&&(!r.forge||nf)&&!has;return`<div class="row">${invIcon(r.id)}<div class="tx">${it.n}${r.n>1?' ×'+r.n:''}${r.bench?' <span style="font-size:14px;color:var(--blu)">작업대</span>':r.forge?' <span style="font-size:14px;color:var(--amb)">대장간</span>':''}<small>${it.d}</small><div>${costHtml(r.c)}</div></div><button class="btn" data-a="craft" data-i="${i}" ${ok?'':'disabled'}>${has?'보유 중':'만들기'}</button></div>`}).join('');   /* 제작 목록: 가방의 제작 탭과 작업대 창(15차: 왼쪽 제작 + 오른쪽 업그레이드)이 같이 써요 */
const buyP=id=>SHOP.free?0:Math.ceil(ITEMS[id].p*1.7*((VEND.pack[id]||1))),sellP=id=>sellPrice(id);   /* 팔기는 어디서든 원래 가격의 20% (core.js ECON) */
let VENDAT=0;   /* 지금 열어 둔 랜덤 자판기의 항구 번호 */
/* 배편(11차, 기획자: '배 가까이 가서 누르면 가고 싶은 항구로, 로딩 기간 필요'): 항구마다 통통배 [배 타기] → 항구 고르기 → 거리만큼 3.5~7초 로딩 → 그 항구 통통배 바로 앞에 내려요(ferrySpot, 12차). 지금은 무료(뱃삯은 기획자가 정할 것) */
const FERRY={from:0,on:false};const ferrySec=d=>clamp(3.5+d/180,3.5,7);
const jong=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172?c%28:0},jo=(w,a,b)=>w+(jong(w)?a:b),ro=w=>w+(jong(w)&&jong(w)!==8?'으로':'로');   /* 받침에 맞는 조사 */
function ferryGo(i){const to=PORTS[i],fr=PORTS[FERRY.from];if(!to||FERRY.on)return;const T=ferrySec(dist(fr.x,fr.z,to.x,to.z))*1000;closePanel();if(typeof fishing!=='undefined'&&fishing)endFish();joyEnd();P.auto=null;
 FERRY.on=true;busy=true;const f=$('respawn'),bar=$('rsBar'),st=$('rsSt');f.classList.add('ferry','on');f.querySelector('.rsT').textContent='⛴ '+ro(to.n)+' 가는 중…';f.querySelector('.rsH').textContent='통통배를 타고 바다를 건너요';bar.style.width='0%';
 const msgs=[[0,jo(fr.n,'을','를')+' 떠나요'],[.3,'바다를 건너는 중…'],[.72,jo(to.n,'이','가')+' 보여요']];sfx(330,.15,'sine',.04);sfx(250,.25,'sine',.03);let t0=0;
 const step=now=>{if(!t0)t0=now;const k=Math.min(1,(now-t0)/T);bar.style.width=(k*100).toFixed(1)+'%';let m='';for(const [a,q] of msgs)if(k>=a)m=q;if(st.textContent!==m)st.textContent=m;if(k<1){requestAnimationFrame(step);return}
  const sp=ferrySpot(i)||portSpawn(i);P.x=sp.x;P.z=sp.z;if(sp.rot!=null)P.rot=sp.rot;P.auto=null;unstuck();updCamera(0,P.x,groundY(P.x,P.z),P.z,true);st.textContent=jo(to.n,'에','에')+' 도착했어요';hudDirty=true;save();jingle([523,659,784]);
  setTimeout(()=>{f.classList.remove('on');toast('⛴ '+to.n+'에 도착했어요');setTimeout(()=>{f.classList.remove('ferry');FERRY.on=false;busy=false},500)},700)};requestAnimationFrame(step)}
{const _up=updPlayer;updPlayer=function(dt){if(FERRY.on)return;_up(dt)}}   /* 배 타는 동안은 움직이지 않아요 */
function renderPanel(){const B=$('pbody');$('pcoin').innerHTML=mode==='play'?`<span style="display:flex;align-items:center;gap:6px;margin-right:14px">${invIcon('coin').replace('<img','<img style="width:36px;height:36px"')}${S.coins}</span>`:'';
 $('ptabs').innerHTML=TABS.some(t=>t[0]===panel)?TABS.map(t=>`<div class="tab ${t[0]===panel?'on':''}" data-tab="${t[0]}">${t[1]}</div>`).join(''):`<div class="tab on">${{bag:`🎒 가방 ${bagList().length}/${BAG_N}`,craft:'🔨 제작',build:'🏠 건설',map:'🗺 지도',shop:'🧺 보급상',vend:'🎰 랜덤 자판기',ferry:'⛴ 배 타기',bench:'🔨 작업대',recycle:'♻️ 재활용 쓰레기통',menu:'⚙ 메뉴',help:'📖 조작법',stash:'📦 보관 상자',cook:'🔥 모닥불 요리',lh:'🗼 등대 빠른 이동',dev:'🛠 관리자 모드 · 표시 목록',devitem:'🎁 관리자 모드 · 아이템 꺼내기'}[panel]}</div>`;let h='';
 if(panel==='bag'){const ks=bagList(),eq=curId()==='fist'?null:curId();if(selItem&&!invN(selItem))selItem=null;
  /* 27차(기획자: '가방 들어가면 지도·제작 전부 없애고 인벤 칸만, 총 20칸'): 장비 칸·탭 없이 20칸만. 손에 든 것은 칸에 '장착' 표시 */
  const cell=k=>k?`<div class="slot ${selItem===k?'sel':''}" data-a="sel" data-k="${k}" style="width:auto;height:auto;aspect-ratio:1">${invIcon(k)}${ITEMS[k].one?'':`<b>${S.inv[k]}</b>`}${k===eq?'<span class="eqm">장착</span>':''}</div>`:'<div class="slot" style="width:auto;height:auto;aspect-ratio:1;opacity:.5"></div>';
  h=`<div class="grid" style="grid-template-columns:repeat(5,1fr);gap:7px">${Array.from({length:Math.max(BAG_N,ks.length)},(_,i)=>cell(ks[i])).join('')}</div>`+(ks.length>BAG_N?`<div style="color:var(--red);font-weight:800;font-size:12.5px;margin:6px 2px">가방이 ${ks.length-BAG_N}칸 넘쳤어요. 팔거나 버려서 ${BAG_N}칸으로 줄여요</div>`:'');
  if(selItem){const it=ITEMS[selItem],w=WEAP[selItem];h+=`<div style="height:10px"></div><div class="row" style="align-items:flex-start;flex-direction:column;gap:8px"><div style="display:flex;gap:10px;align-items:center;width:100%"><img src="${ICON[selItem]}" style="width:56px;height:56px"><div class="tx"><div style="font-size:17px">${it.n} ${it.one?'':`<span style="color:var(--mut);font-size:13px">×${S.inv[selItem]}</span>`}</div><small>${it.d}</small></div></div>`+
   (w?`<div style="font-size:12.5px;color:var(--mut);font-weight:700">피해 ${w.dmg}${w.pel?'×'+w.pel:''} · ${w.melee?'근접':'사거리 '+w.range+'m'} · 초당 ${(1/w.cd).toFixed(1)}발${w.ammo?' · '+ITEMS[w.ammo].n:''}</div>`:'')+
   (it.ty==='food'||it.ty==='heal'||it.ty==='fish'?`<button class="btn" data-a="use" data-k="${selItem}" style="width:100%">사용하기</button>`:it.ty==='kit'?`<button class="btn" data-a="equip" data-k="${selItem}" style="width:100%">설치하기</button>`:it.ty==='throw'?`<button class="btn" data-a="equip" data-k="${selItem}" style="width:100%">던지기</button>`:it.ty==='gun'||it.ty==='tool'?(eq===selItem?`<button class="btn g" data-a="uneq" style="width:100%">장착 중 ✔ · 내려놓기</button>`:`<button class="btn" data-a="equip" data-k="${selItem}" style="width:100%">장착하기</button>`):'')+`<button class="btn g" data-a="drop" data-k="${selItem}" style="width:100%;min-height:38px">버리기</button>`+'</div>'}
  else h+=`<div style="color:var(--mut);font-weight:600;font-size:12.5px;line-height:1.6;margin:8px 4px">아이템을 누르면 정보가 나와요. 두 번 누르면 바로 쓰거나 장착해요.</div>`}
 else if(panel==='craft'){const nb=nearBench(),nf=nearForge();h=`<div class="sec">${nb||nf?'작업대 근처예요. 무기와 탄약을 만들 수 있어요':'맨손 제작만 가능해요. 무기와 탄약은 텐트 안 작업대에서 만들어요'}</div>`+craftRows(nb,nf)}
 else if(panel==='bench'){h=`<div class="cols bench"><div class="grow"><div class="sec" style="margin-top:0">🔨 제작 — 작업대에서는 무기와 탄약도 만들어요</div>${craftRows(true,false)}</div><div class="upw">${upCard()}</div></div>`}
 else if(panel==='build'){h='<div class="sec">짓고 싶은 것을 고른 뒤, 놓을 곳을 바라보고 [설치]</div>'+Object.keys(BUILDS).filter(k=>!BUILDS[k].hide).map(k=>{const b=BUILDS[k];const wr=b.indoor?!INT.on:INT.on&&!b.inok;return`<div class="row"><div class="tx">${b.n} <span style="font-size:14px;color:var(--mut)">내구도 ${b.hp}</span>${b.indoor?' <span style="font-size:12px;color:#fff;background:var(--org);border-radius:9px;padding:1px 7px">🏕 텐트 안에서만</span>':b.inok?' <span style="font-size:12px;color:#fff;background:var(--grn);border-radius:9px;padding:1px 7px">🏠 안에도 OK</span>':b.water?' <span style="font-size:12px;color:#fff;background:var(--nav);border-radius:9px;padding:1px 7px">🌊 물 위</span>':''}<small>${b.d}</small><div>${hasKit(k)?`<span style="color:var(--grn,#7bd88f)">키트 ${invN(b.kit)}개 — 재료 없이 설치</span>`:costHtml(b.c)}</div></div><button class="btn" data-a="build" data-k="${k}" ${canBuild(k)&&!wr?'':'disabled'}>${wr?(b.indoor?'텐트 안에서':'밖에서'):hasKit(k)?'설치':'짓기'}</button></div>`}).join('')+`<div class="row"><div class="tx">철거 모드<small>내가 지은 것을 치우고 재료 절반을 돌려받아요</small></div><button class="btn r" data-a="build" data-k="demo">철거</button></div>`}
 else if(panel==='map'){h=`<div class="cols"><canvas id="bigmap" width="640" height="640" style="width:${Math.min(420,VH-110)}px;height:${Math.min(420,VH-110)}px;border-radius:14px;border:2px solid var(--bd);flex:none"></canvas><div class="grow" style="font-size:13.5px;line-height:1.9;font-weight:600"><div class="sec">지도 표시</div>${DEV.on?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><button class="btn ${DEV.mapMark?'g':''}" data-a="mmode" data-k="0" style="width:auto;min-height:38px;padding:8px 10px;font-size:13px">누르면 순간이동</button><button class="btn ${DEV.mapMark?'':'g'}" data-a="mmode" data-k="1" style="width:auto;min-height:38px;padding:8px 10px;font-size:13px">누르면 표시 찍기</button><button class="btn g" data-a="mtype" style="width:auto;min-height:38px;padding:8px 10px;font-size:13px">종류: ${MTYPE[DEV.type][0]} ${MTYPE[DEV.type][1]}</button><button class="btn g" data-a="mlist" style="width:auto;min-height:38px;padding:8px 10px;font-size:13px">목록 (${DEV.marks.length})</button></div>`:''}⬜ 흰 화살표 — 나<br><span style="color:var(--blu)">■</span> 초승달 항구마을 (보급상)<br><span style="color:var(--amb)">●</span> 내 기지<br><span style="color:var(--pur)">●</span> 떨어뜨린 가방<br><span style="color:#4fc3ff">■</span> 항구 (큰 네모 = 항구마을)<br><span style="color:#ffb547">■</span> 보급 지점 (보급 상자, 3일마다 다시 채워짐)<br><span style="color:#ffe27a">●</span> 바다 등대 (불 켜면 빠른 이동)<br><span style="color:var(--red)">●</span> 가까운 적<div class="sec">초승달 본섬과 동북섬, 바깥 섬 7개, 그리고 바다 위 등대 8개</div></div></div>`}
 else if(panel==='shop'){h='<div class="cols"><div class="grow"><div class="sec">사기'+(SHOP.free?' — 지금은 무료':'')+'</div>'+SHOP.sell.map(k=>{const it=ITEMS[k],n=(VEND.pack[k]||1),has=it.one&&invN(k);return`<div class="row">${invIcon(k)}<div class="tx">${it.n}${n>1?' ×'+n:''}<small>${it.d}</small></div><button class="btn" data-a="buy" data-k="${k}" ${S.coins>=buyP(k)&&!has?'':'disabled'}>${has?'보유 중':buyP(k)?buyP(k)+' 동전':'무료로 받기'}</button></div>`}).join('')+'</div><div class="grow"><div class="sec">팔기</div>'+
  (Object.keys(S.inv).filter(k=>S.inv[k]>0&&!ITEMS[k].one).map(k=>`<div class="row">${invIcon(k)}<div class="tx">${ITEMS[k].n} ×${S.inv[k]}<small>개당 ${sellP(k)} 동전</small></div><button class="btn g" data-a="sell" data-k="${k}" data-n="1">1개</button><button class="btn g" data-a="sell" data-k="${k}" data-n="10">10개</button></div>`).join('')||'<div class="row"><div class="tx">팔 물건이 없어요</div></div>')+'</div></div>'}
 else if(panel==='ferry'){const fp=PORTS[FERRY.from];h='<div class="sec">가고 싶은 항구를 골라요. 배를 타고 가는 동안 잠깐 기다려요</div>'+PORTS.map((p,i)=>{const here=i===FERRY.from,d=Math.round(dist(fp.x,fp.z,p.x,p.z));return `<div class="row"><div class="tx">${p.town?'🏘':'⚓'} ${p.n}<small>${here?'지금 여기':'약 '+d+'m · '+ferrySec(d).toFixed(0)+'초'}</small></div><button class="btn" data-a="ferry" data-i="${i}" ${here?'disabled':''}>${here?'여기':'가기'}</button></div>`}).join('')}
 else if(panel==='vend'){const L=vendItems(VENDAT),mn=Math.ceil(vendLeft()/60000);
  h=`<div class="sec" style="margin-top:0">1시간마다 물건 5개가 무작위로 바뀌어요 · <span id="vLeft">다음 교체까지 ${mn}분</span></div>`+L.map(k=>{const it=ITEMS[k],n=VEND.pack[k]||1,pr=VEND.free?0:it.p*n,has=it.one&&invN(k),ok=!has&&S.coins>=pr;
   return`<div class="row">${invIcon(k)}<div class="tx">${it.n}${n>1?' ×'+n:''}<small>${it.d}</small></div><button class="btn" data-a="vbuy" data-k="${k}" ${ok?'':'disabled'}>${has?'보유 중':pr?pr+' 동전':'무료로 받기'}</button></div>`}).join('')}
 else if(panel==='recycle'){const ks=bagList(),eq=null;   /* 48차: 장비 칸에 낀 것은 빼고 팔아요 */
  h=`<div class="sec" style="margin-top:0">무엇이든 팔 수 있어요 · 원래 가격의 ${Math.round(ECON.sell*100)}%를 받아요</div>`+(ks.map(k=>{const it=ITEMS[k],n=S.inv[k],sp=sellPrice(k);
   return`<div class="row">${invIcon(k)}<div class="tx">${it.n}${it.one?'':' ×'+n}${k===eq?' <span style="font-size:13px;color:var(--grn)">장착 중</span>':''}<small>개당 ${sp} 동전 · 원래 가격 ${it.p}</small></div><button class="btn g" data-a="rsell" data-k="${k}" data-n="1">${it.one||n===1?'팔기 +'+sp:'1개'}</button>${!it.one&&n>1?`<button class="btn g" data-a="rsell" data-k="${k}" data-n="${n}">전부 +${sp*n}</button>`:''}</div>`}).join('')||'<div class="row"><div class="tx">팔 물건이 없어요</div></div>')}
 else if(panel==='stash'){const row=(k,n,a,l)=>`<div class="row">${invIcon(k)}<div class="tx">${ITEMS[k].n} ×${n}</div><button class="btn ${a==='put'?'':'g'}" data-a="${a}" data-k="${k}">${l}</button></div>`,iv=bagList(),st=Object.keys(S.stash).filter(k=>S.stash[k]>0);
  h=`<div class="cols"><div class="grow"><div class="sec">내 가방</div>${iv.map(k=>row(k,S.inv[k],'put','넣기')).join('')||'<div class="row"><div class="tx">비었어요</div></div>'}</div><div class="grow"><div class="sec">상자 안 (쓰러져도 안전해요)</div>${st.map(k=>row(k,S.stash[k],'get','꺼내기')).join('')||'<div class="row"><div class="tx">비었어요</div></div>'}</div></div>`}
 else if(panel==='cook'){const ks=Object.keys(S.inv).filter(k=>S.inv[k]>0&&ITEMS[k].ty==='fish');h=ks.length?ks.map(k=>`<div class="row">${invIcon(k)}<div class="tx">${ITEMS[k].n} ×${S.inv[k]}<small>구우면 ${nrgTx(ITEMS['c'+k].food)} · 판매가 ${sellP('c'+k)} 동전</small></div><button class="btn" data-a="cook" data-k="${k}" data-n="1">굽기</button><button class="btn g" data-a="cook" data-k="${k}" data-n="99">전부</button></div>`).join(''):'<div class="sec">구울 생선이 없어요. 낚싯대로 물고기를 낚아 오세요</div>'}
 else if(panel==='lh'){h='<div class="sec">불을 켠 등대로 바로 이동해요. 다른 등대는 직접 찾아가서 불을 켜야 해요</div>'+POI.lh.map((l,i)=>LH_GONE.includes(i)?'':`<div class="row"><div class="tx">🗼 ${l.n}<small>${S.lh[i]?'불 켜짐':'아직 못 찾았어요 (지도의 회색 세모)'}</small></div><button class="btn" data-a="lhgo" data-i="${i}" ${S.lh[i]&&dist(P.x,P.z,l.x,l.z)>12?'':'disabled'}>${dist(P.x,P.z,l.x,l.z)<=12?'여기':'이동'}</button></div>`).join('')}
 else if(panel==='devitem'){const bs='width:auto;min-height:38px;padding:8px 12px;font-size:13px';h=`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><input id="devQ" value="${DEV.q.replace(/"/g,'&quot;')}" placeholder="🔍 이름으로 찾기 (예: 소총, 탄, 연어)" style="flex:1;min-width:150px;background:#fff;color:var(--tx);border:2px solid var(--pn3);border-radius:12px;padding:10px 12px;font-family:inherit;font-weight:700;font-size:15px">
   <span style="font-size:13px;color:var(--mut)">한 번에</span>${[1,10,100].map(n=>`<button class="btn ${DEV.qty===n?'':'g'}" data-a="dqty" data-k="${n}" style="${bs}">×${n}</button>`).join('')}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button class="btn g" data-a="dtool" data-k="coin" style="${bs}">동전 +500</button><button class="btn g" data-a="dtool" data-k="day" style="${bs}">☀ 낮으로</button><button class="btn g" data-a="dtool" data-k="night" style="${bs}">🌙 밤으로</button><button class="btn g" data-a="dtool" data-k="rain" style="${bs}">🌧 비 전환</button><button class="btn g" data-a="dtool" data-k="mob" style="${bs}">👹 몹 4종 소환</button><button class="btn g" data-a="dtool" data-k="raid" style="${bs}">⚔ 약탈자 3명 소환</button><button class="btn r" data-a="dtool" data-k="clear" style="${bs}">적 모두 지우기</button></div>
  <div class="sec">아이템 — 누르면 가방에 들어와요</div><div id="devGrid">${devGrid()}</div>
  <div class="sec">설치물 — 누르면 재료 없이 바로 설치 모드 (포탑은 탄약이 가득 찬 채로 놓여요)</div><div style="display:flex;gap:6px;flex-wrap:wrap">${Object.keys(BUILDS).filter(k=>!BUILDS[k].hide).map(k=>`<button class="btn g" data-a="build" data-k="${k}" style="${bs}">${BUILDS[k].n}</button>`).join('')}</div>`}
 else if(panel==='dev'){h=`<div class="cols"><div class="grow"><div class="sec">표시한 곳 ${DEV.marks.length}개 — 항구 넣을 자리를 찍어서 아래 글을 복사해 보내 주세요</div>`+(DEV.marks.map((m,i)=>`<div class="row"><div class="tx" style="font-size:15px"><span style="color:${MTYPE[m.t][2]}">${MTYPE[m.t][0]} ${MTYPE[m.t][1]} ${m.n}</span><small>x ${m.x} · z ${m.z} · ${m.isl}</small><input data-memo="${i}" value="${(m.memo||'').replace(/"/g,'&quot;')}" placeholder="여기에 만들고 싶은 것 메모" style="width:100%;margin-top:4px;background:#fff;color:var(--tx);border:2px solid var(--pn3);border-radius:10px;padding:7px 8px;font-family:inherit;font-weight:600;font-size:13px;box-sizing:border-box"></div><button class="btn g" data-a="mgo" data-i="${i}">이동</button><button class="btn r" data-a="mdel" data-i="${i}">삭제</button></div>`).join('')||'<div class="row"><div class="tx">아직 없어요. 원하는 곳으로 가서 [📍 여기 표시]를 눌러요</div></div>')+
  `</div><div style="width:${Math.min(340,VW*.42)}px;flex:none"><div class="sec">복사해서 보내기</div><textarea id="devOut" readonly style="width:100%;height:150px;background:#fff;color:var(--tx);border:2px solid var(--pn3);border-radius:12px;padding:8px;font:600 12.5px/1.5 monospace;box-sizing:border-box">${markText()}</textarea><button class="btn" data-a="mcopy" style="width:100%;margin-top:8px">전체 복사</button><button class="btn r" data-a="mclear" style="width:100%;margin-top:8px">${devArm?'정말 모두 지울까요? 한 번 더':'표시 모두 지우기'}</button>
  <div class="sec" style="line-height:1.6">개발자 모드에서는 다치지 않고, 바다 위도 걷고, 적이 먼저 덤비지 않아요. 지도 탭에서 지도를 누르면 순간이동해요</div></div></div>`}
 else if(panel==='menu'){h=`<div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:10px"><button class="btn" data-a="save">저장하기</button><button class="btn g" data-a="dev" style="border:2px solid #4fc3ff">🛠 관리자 모드: ${DEV.on?'켜짐 (무적 · 빠른 이동 · 위치 표시)':'꺼짐'}</button><button class="btn g" data-a="snd">소리: ${opt.snd?'켜짐':'꺼짐'}</button><button class="btn g" data-a="gfx">그래픽: ${opt.gfx?'높음 (그림자·화면 효과)':'낮음 (빠름)'}</button><button class="btn g" data-a="stuck">끼었을 때: 기지로 순간이동</button><button class="btn g" data-a="help">조작법</button><button class="btn r" data-a="title">저장하고 타이틀로</button>
  <div class="sec">${S.day}일째 · 처치 ${S.st.kills} · 막아낸 습격 ${S.st.raids}</div>
  <div class="sec">물고기 도감 ${FISH_LIST.filter(f=>S.caught[f.id]).length} / ${FISH_LIST.length}</div>${['B','A'].map(zk=>`<div style="font-weight:800;font-size:12.5px;margin:6px 2px 4px">${zk==='A'?'🗼':'🏝'} ${FISH_ZONES[zk].n}</div><div class="grid" style="grid-template-columns:repeat(auto-fill,96px)">${FISH_LIST.filter(f=>FISH_ZONES[zk].t.some(q=>q[0]===f.id)).map(f=>{const c=S.caught[f.id],G=FGRADE[f.g];return`<div style="text-align:center;font-size:12px;line-height:1.3"><div class="slot" style="width:70px;height:70px;margin:0 auto 4px;border-color:${G[1]}"><img src="${ICON[f.id]}" style="${c?'':'filter:brightness(0) opacity(.35)'}"></div><span style="display:inline-block;background:${G[1]};color:#fff;border-radius:9px;padding:0 7px;font-size:10.5px;font-weight:800;margin-bottom:2px">${G[0]}</span><br>${c?f.n:'???'}<br><span style="color:var(--mut);font-weight:500">${c?`최대 ${S.best[f.id]||0}cm`:''}</span></div>`}).join('')}</div>`).join('')}${typeof plantDexHtml==='function'?plantDexHtml():''}</div>`}
 else if(panel==='help'){h=['왼쪽 아래 조이스틱을 밀면 이동해요. 살짝 밀면 걷고 끝까지 밀면 달려요 (PC: WASD)','오른쪽 아래 조이스틱은 쓰기예요. 가운데를 톡 누르면 가까운 대상과 상호작용(베기·캐기·열기·거래·들어가기). 총·석궁·수류탄은 끌어서 조준하고 떼면 쏴요(가운데로 돌아와 떼면 취소). 손도끼·전기톱은 끝까지 당기고 있으면 계속 휘둘러요. 낚싯대는 톡(꾹 누르면 감기). 조이스틱 둘 말고 화면을 눌러도 아무 일도 없어요','나무는 손도끼를 손에 들어야 벨 수 있어요(가방에서 장착). 낚싯대를 들고 있을 땐 던지기만 돼요','항구마다 랜덤 자판기와 재활용 쓰레기통이 있어요. 자판기는 1시간마다 물건 5개가 바뀌고, 쓰레기통에서는 무엇이든 원래 가격의 20%로 팔 수 있어요','쓰러지면 가방을 그 자리에 떨어뜨리고, 잠시 뒤 무작위 항구 앞에서 깨어나요','상호작용은 대상에 바짝 붙어야 돼요. 맨손일 땐 조준이 없고, 톡 = 상호작용(가까이 적이 있으면 주먹) (PC: E 상호작용, 스페이스 공격)','짓기는 🎒 가방의 [건설] 탭에서 골라요. 고른 뒤 놓을 곳을 누르거나, 앞에 들고 오른쪽 조이스틱을 톡 눌러요 (PC: B)','물에 들어갈 수 있어요. 얕은 물에선 느려지고, 깊은 물에선 헤엄쳐요. 오래 헤엄치면 몸이 식어요','낚시는 물고기 그림자가 맴도는 곳에서만 돼요. 낚싯대를 들고 8m 안에서 오른쪽 조이스틱을 톡 눌러 던져요. 물 안에서는 못 해요. ! 가 뜨면 바로 누르고, 꾹 눌러 감다가 물고기가 요동치면 손을 떼요. 등대 앞바다에서는 영웅·전설 물고기가 나와요','잡은 생선은 모닥불에서 구우면 훨씬 든든해요','🎒 가방에서 도구·무기를 골라 장착하고, 음식·붕대·수류탄을 써요. 가방이 열려 있어도 왼쪽 화면으로 움직일 수 있지만, 낚시·채집·공격은 가방을 닫아야 해요 (PC: Tab)','초승달 본섬에는 약탈자 무리 셋이 낮이고 밤이고 자기 구역을 돌아다녀요. 한 명이 나를 보면 무리가 다 같이 덤벼요. 항구 안전 구역 안으로는 쫓아오지 않아요','한 무리를 모두 쓰러뜨리면 얼마 뒤 그 구역 어딘가에 새 무리가 나타나요','가운데 바다의 바위섬에는 동굴이 있어요. 들어가면 동굴 안으로 옮겨져요','강은 산에서 시작해 바다로 갈수록 넓어져요. 위쪽 좁은 곳은 걸어서 건널 수 있어요','자동 포탑은 권총탄을 넣어야 움직여요. 사거리 안의 적을 스스로 찾아 쏴요','발전기에 나무를 넣으면 주변 탐조등이 밤에 켜져요. 빛에 비친 적은 피해를 더 받고 악령은 타요','바다 위 바위섬에 등대 8개가 있어요. 헤엄쳐 가서 불을 켜면 등대끼리 빠르게 오갈 수 있어요','성문은 나만 지나가요. 가시 함정과 지뢰를 길목에 깔면 습격이 훨씬 쉬워져요','권총·소총·산탄총·기관단총·수류탄과 탄약은 작업대 근처의 제작 창에서 만들어요','가끔 비바람이 와요. 앞이 잘 안 보이고 몸이 식으니 불 곁에서 기다려요','쓰러지면 무작위 항구 앞에서 다시 태어나요. 가방은 쓰러진 자리에 떨어져요. 지도의 보라색 점으로 가서 되찾아요','⚡ 에너지는 10칸이에요. 헤엄치거나 맞으면 줄고, 먹으면 차요. 텐트·집 안에서 쉬면 빨리 차요','자동 저장돼요 (이 기기의 브라우저에만)'].map(s=>`<div class="row"><div class="tx" style="font-size:17px;font-weight:600">${s}</div></div>`).join('')}
 B.innerHTML=h;if(panel==='map')drawMap($('bigmap').getContext('2d'),WS,640)}
const devGrid=()=>{const q=DEV.q.trim().toLowerCase(),ks=Object.keys(ITEMS).filter(k=>!q||ITEMS[k].n.toLowerCase().includes(q)||k.toLowerCase().includes(q));return ks.length?`<div class="grid" style="grid-template-columns:repeat(auto-fill,86px)">${ks.map(k=>`<div data-a="dgive" data-k="${k}" style="text-align:center;font-size:11.5px;line-height:1.25;font-weight:700"><div class="slot" style="width:66px;height:66px;margin:0 auto 3px">${invIcon(k)}${invN(k)?`<b>${invN(k)}</b>`:''}</div>${ITEMS[k].n}</div>`).join('')}</div>`:'<div class="row"><div class="tx">그런 이름의 아이템이 없어요</div></div>'};
let devArm=false;$('pbody').addEventListener('input',e=>{if(e.target.id==='devQ'){DEV.q=e.target.value;$('devGrid').innerHTML=devGrid()}});$('pbody').addEventListener('input',e=>{const i=e.target.dataset.memo;if(i!==undefined&&DEV.marks[+i]){DEV.marks[+i].memo=e.target.value.slice(0,80);devSave();const o=$('devOut');if(o)o.value=markText()}});$('pbody').addEventListener('click',e=>{if(e.target.id==='bigmap'&&DEV.on&&mode==='play'){const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*WS,z=(e.clientY-r.top)/r.height*WS;if(DEV.mapMark){addMark(x,z);renderPanel()}else devTp(x,z)}});
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,k=b.dataset.k;
 if(a==='sel'&&ITEMS[k].ty==='kit'){primary(k);return}if(a==='sel'){if(selItem===k&&performance.now()-selT<450)primary(k);selItem=k;selT=performance.now()}else if(a==='use')useItem(k);else if(a==='equip')primary(k);else if(a==='uneq'){S.quick[S.sel]=null;sfx(500,.05);toast('맨손이 됐어요')}else if(a==='cook'){const n=Math.min(+b.dataset.n,invN(k));if(n>0&&take(k,n)){give('c'+k,n);S.st.cook+=n;sfx(420,.18,'sawtooth',.03,.7);toast(`${ITEMS['c'+k].n} ×${n} 완성!`)}}else if(a==='put'||a==='get'){const n=a==='put'?invN(k):(S.stash[k]||0);if(n>0){if(a==='put'){take(k,n);S.stash[k]=(S.stash[k]||0)+n}else{delete S.stash[k];give(k,n)}sfx(600,.05)}}else if(a==='q'){const i=+b.dataset.i,j=S.quick.indexOf(k);if(j>=0)S.quick[j]=S.quick[i];S.quick[i]=k;if(WEAP[k])S.sel=i;sfx(600,.05)}
 else if(a==='craft'){const r=RECIPES[+b.dataset.i];if(canPay(r.c)){pay(r.c);give(r.id,r.n);const sk='c_'+r.id;if(S.st[sk]!==undefined)S.st[sk]++;jingle([523,784]);toast(`${ITEMS[r.id].n}${r.n>1?' ×'+r.n:''} 완성!`)}}
 else if(a==='build'){closePanel();if(INT.on&&k!=='demo'&&!BUILDS[k].indoor&&!BUILDS[k].inok){toast('밖에 나가서 지어요');return}if(!INT.on&&k!=='demo'&&BUILDS[k].indoor){toast(jo(BUILDS[k].n,'은','는')+' 텐트 안에서 지어요');return}setBuild(k);toast(k==='demo'?'철거할 건물 가까이에서 [철거]':'놓을 곳을 바라보고 [설치]');return}
 else if(a==='buy'){const p=buyP(k);if(S.coins>=p){S.coins-=p;give(k,(VEND.pack[k]||1));sfx(880,.07)}}
 else if(a==='vbuy'){if(!vendItems(VENDAT).includes(k)){toast('자판기 물건이 바뀌었어요');renderPanel();return}const it=ITEMS[k],n=VEND.pack[k]||1,pr=VEND.free?0:it.p*n;
  if(it.one&&invN(k)){toast('이미 갖고 있어요')}else if(S.coins<pr){toast('동전이 모자라요')}else{S.coins-=pr;give(k,n);sfx(880,.07);sfx(1320,.05,'sine',.03);toast(`${it.n}${n>1?' ×'+n:''} 샀어요`)}}
 else if(a==='rsell'){const n=Math.min(+b.dataset.n,invN(k));if(n>0&&take(k,n)){const g=sellPrice(k)*n;S.coins+=g;sfx(700,.07);sfx(980,.05,'sine',.03);toast(`${ITEMS[k].n}${n>1?' ×'+n:''} 팔았어요 · +${g} 동전`)}}
 else if(a==='sell'){const n=Math.min(+b.dataset.n,invN(k));if(take(k,n)){S.coins+=sellP(k)*n;sfx(700,.07)}}
 else if(a==='dev'){DEV.on=!DEV.on;devSave();syncMarks();unstuck();toast(DEV.on?'🛠 관리자 모드 켜짐: 왼쪽 패널이나 지도에서 위치를 표시해요':'관리자 모드 꺼짐');closePanel();return}
 else if(a==='dgive'){const n=ITEMS[k].one?1:DEV.qty;give(k,n);sfx(880,.05);toast(`${ITEMS[k].n} +${n}`);$('devGrid').innerHTML=devGrid();drawQuick();return}
 else if(a==='dqty'){DEV.qty=+k}
 else if(a==='dtool'){if(k==='coin')S.coins+=5000;else if(k==='day')S.time=.4;else if(k==='night')S.time=.92;else if(k==='rain')WX.t=0;else if(k==='clear')enemies.slice().forEach(dropEnemy);else{const L=k==='mob'?['rgolem','wgolem','plant','wraith']:['bandit','bandit','gunner'];L.forEach((m,i)=>{const a=P.rot+(-.6+i*.4),e=spawnEnemy(m,P.x+Math.sin(a)*11,P.z+Math.cos(a)*11,{wild:1});e.agg=k==='raid'?1:0});closePanel();toast('소환했어요. 관리자 모드에서는 적이 먼저 덤비지 않아요');return}sfx(600,.05)}
 else if(a==='mmode'){DEV.mapMark=k==='1'}else if(a==='mtype'){DEV.type=(DEV.type+1)%MTYPE.length}else if(a==='mlist'){panel='dev'}
 else if(a==='mgo'){const m=DEV.marks[+b.dataset.i];devTp(m.x,m.z);return}else if(a==='mdel'){DEV.marks.splice(+b.dataset.i,1);devSave();syncMarks()}else if(a==='mcopy'){const t=$('devOut');t.focus();t.select();try{navigator.clipboard.writeText(t.value).catch(()=>document.execCommand('copy'))}catch(_){try{document.execCommand('copy')}catch(__){}}toast('복사했어요. 채팅에 붙여넣어 주세요');return}
 else if(a==='mclear'){if(!devArm){devArm=true}else{devArm=false;DEV.marks=[];devSave();syncMarks()}}
 else if(a==='ferry'){ferryGo(+b.dataset.i);return}
 else if(a==='upput'){upPut(k,+b.dataset.n)}else if(a==='upgo'){upGo();return}
 else if(a==='lhgo'){const l=POI.lh[+b.dataset.i];closePanel();fadeDo('등대로 이동 중…',()=>{P.x=l.x;P.z=l.z+4.6;P.auto=null});return}
 else if(a==='save'){save();toast('저장했어요')}else if(a==='snd'){opt.snd=!opt.snd;sfx(600)}else if(a==='gfx'){opt.gfx=opt.gfx?0:1;resize()}
 else if(a==='stuck'){P.x=S.home.x;P.z=S.home.z;unstuck();closePanel();toast('기지로 돌아왔어요');return}else if(a==='help')panel='help';else if(a==='title'){save();closePanel();toTitle();return}
 renderPanel();hudDirty=true});
$('ptabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){panel=t.dataset.tab;selItem=null;if(panel!=='bag')joyEnd();layoutPanel();renderPanel()}});
$('pclose').onclick=closePanel;$('shade').onclick=closePanel;
let selT=0;function primary(k){const ty=ITEMS[k].ty;if(ty==='kit'){closePanel();const bk=BUILDS[ITEMS[k].b];if(INT.on&&!bk.indoor){toast('밖에 나가서 설치해요');return}if(!INT.on&&bk.indoor){toast(jo(bk.n,'은','는')+' 텐트 안에서 설치해요. 텐트에 들어가서 가방에서 눌러요');return}setBuild(ITEMS[k].b);toast('놓을 곳을 바라보고 [설치] — 초록색이면 놓을 수 있어요');return}if(ty==='food'||ty==='heal'||ty==='fish')useItem(k);else if(ty==='throw'){closePanel();throwNade()}else if(ty==='gun'||ty==='tool'){const j=S.quick.indexOf(k);if(j>=0&&j!==S.sel)S.quick[j]=null;S.quick[S.sel]=k;sfx(600,.05);toast(ITEMS[k].n+' 장착!')}}   /* 손(S.quick[S.sel])에 쥐어요. 화면 아래 칸은 없어요 */
function useItem(id){const it=ITEMS[id];if(it.ty==='food'||it.ty==='fish'){if(S.hp>=99.5){toast('⚡ 에너지가 가득해요');return}take(id,1);S.hp=Math.min(100,S.hp+it.food)}else if(it.ty==='heal'){if(S.hp>=99.5){toast('⚡ 에너지가 가득해요');return}take(id,1);S.hp=Math.min(100,S.hp+it.heal)}else return;if(!P.moving)P.a.play('Use_Item',{once:1,lock:.45,force:1,speed:1.7});sfx(520,.1);hudDirty=true}   /* 31차: 걸으면서 먹으면 걷는 모습 그대로 */
function useQuick(i){const id=S.quick[i];if(id&&invN(id)){const ty=ITEMS[id].ty;if(ty==='food'||ty==='heal')useItem(id);else if(ty==='throw')throwNade();else if(ty==='kit')primary(id);else S.sel=i}else S.sel=i;hudDirty=true}
/* ---- input ---- */
const joy={id:null,ox:0,oy:0},aimP={id:null};
function joyEnd(e){if(e&&e.pointerId!==undefined&&e.pointerId!==joy.id)return;joy.id=null;inp.mx=inp.mz=0;const j=$('joy');if(j&&j.firstChild)j.firstChild.style.transform=''}   /* 32차: 조이스틱은 늘 보여요(고정) */
const taps={};
/* 32차(기획자: '낚시·주먹질 같은 걸 조이스틱 같은 칸으로 만들지 말고, 조이스틱 칸 말고 다른 쪽을 누르면 상호작용하게. 조이스틱은 고정'):
   조이스틱은 왼쪽 아래에 늘 보이게 고정(joyFix). 그 둘레(반지름 1.5배)에서 시작한 손가락만 움직이기.
   그 밖의 화면 = 예전 큰 버튼: 설치 모드면 설치, 가까운 대상이 있으면 상호작용, 아니면 손에 든 것 쓰기(누른 곳 쪽으로 조준, 누르고 있으면 계속).
   두 손가락 확대와 헷갈리지 않게 누른 뒤 90ms에 시작해요(ACT.pend). 34차: 누르면 걸어가는 것(ACT.go)은 없앴어요 — 멀리 있는 물건을 누르면 '더 가까이 가요'만. */
const ACT={id:null,md:'fire',x:0,y:0,t:0,mv:0,g:null,go:0,pend:0,rel:0,e:null};
function joyC(){const r=$('joy').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.width/2]}
function joyMove(e){let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const l=Math.hypot(dx,dy),M=44*UIS;if(l>M){dx*=M/l;dy*=M/l}inp.mx=l<8?0:dx/M;inp.mz=l<8?0:dy/M;$('joy').firstChild.style.transform=`translate(${dx/UIS}px,${dy/UIS}px)`}
function actApply(){const e=ACT.e;if(!e)return;const w=WEAP[curId()]||{};let md=actMode();
 if(md==='fire'&&!w.ammo&&!w.nade&&ACT.g&&!(nearestEnemy(P.x,P.z,w.melee||curId()==='fist'?3.4:12))){const[gx,gz]=ACT.g;   /* 34차 */
  if(w.rod&&!fishing&&waterDepth(gx,gz)>.05&&spotAt(gx,gz)){worldTap(gx,gz);ACT.md='tap';return}   /* 낚싯대로 물고기 떼를 누르면 그 자리에 던지기(사거리 밖이면 안내만, 걸어가지 않아요) */
  const ft=tapThing(gx,gz);if(ft&&!sameT(ft,target)){farHint(ft);ACT.md='tap';return}}   /* 멀리 있는 자판기·상인 등을 누르면 걸어가지 않고 '더 가까이 가요' */
 if(md==='act'&&(w.ammo||w.nade)){const g=ACT.g,t=target;if(!(g&&t&&dist(g[0],g[1],t.x,t.z)<=2.8))md='fire'}   /* 총·수류탄을 들었으면 대상을 직접 누를 때만 상호작용, 아니면 누른 곳으로 쏘기·던지기 */
 ACT.md=md;if(md==='fire'){inp.fire=true;if(!w.rod)aimAt(e);else inp.aiming=false}else{inp.act=true;inp.actEdge=true}}
function actCancel(){ACT.id=null;ACT.go=0;ACT.pend=0;ACT.rel=0;inp.fire=inp.act=inp.actEdge=inp.aiming=false}
cv.addEventListener('pointerdown',e=>{if(mode!=='play'||panel&&!sidePanel())return;try{cv.setPointerCapture(e.pointerId)}catch(_){}
 const[jx,jy,jr]=joyC();if(joy.id===null&&Math.hypot(e.clientX-jx,e.clientY-jy)<=jr*1.5){joy.id=e.pointerId;joy.ox=jx;joy.oy=jy;joyMove(e);return}
 if(rjDown(e))return;   /* 41차: 오른쪽 조이스틱(조준·쓰기·가운데 톡 = 상호작용) */
 if(ACT.id!==null)return;touchHook('down',e)});   /* 41차(기획자: '조이스틱 양쪽 말고 다른 데를 아무리 눌러도 상호작용이 되면 안 돼'): 그 밖의 화면은 아무 일도 없어요 — 설치 모드 누른 곳 설치·크리에이티브만(touchHook) */
function aimAt(e){_v.set(P.x,groundY(P.x,P.z)+1.2,P.z).project(cam);const dx=e.clientX-(_v.x*.5+.5)*innerWidth,dy=e.clientY-(-_v.y*.5+.5)*innerHeight,l=Math.hypot(dx,dy)||1;inp.ax=dx/l;inp.az=dy/l;inp.aiming=true;inp.fire=true}
cv.addEventListener('pointermove',e=>{if(e.pointerId===joy.id){joyMove(e);return}if(e.pointerId===RJ.id){rjMove(e);return}if(touchHook('move',e))return;if(e.pointerId!==ACT.id)return;ACT.mv=Math.max(ACT.mv,Math.hypot(e.clientX-ACT.x,e.clientY-ACT.y));ACT.e={clientX:e.clientX,clientY:e.clientY};
 if(inp.fire&&!(WEAP[curId()]||{}).rod){aimAt(e);ACT.g=groundAt(e.clientX,e.clientY)}});
const cvUp=e=>{joyEnd(e);if(e.pointerId===RJ.id){rjUp(e);return}if(touchHook(e.type==='pointerup'?'up':'cancel',e))return;if(e.pointerId!==ACT.id)return;const up=e.type==='pointerup';
 if(ACT.pend&&up){ACT.pend=0;actApply();ACT.id=null;ACT.go=0;ACT.rel=1;return}   /* 90ms 안에 뗀 톡: 한 번만 쓰고 다음 장면에서 놓아요 */
 actCancel()};cv.addEventListener('pointerup',cvUp);cv.addEventListener('pointercancel',cvUp);
function holdAim(){const now=performance.now();for(const id in taps){const tp=taps[id];if(tp.right&&aimP.id===null&&!bmode&&tp.mv<=12&&now-tp.t>320){aimP.id=+id;aimAt({clientX:tp.lx||tp.x,clientY:tp.ly||tp.y})}}}
const _ray=new THREE.Raycaster();function groundAt(cx,cy){_ray.setFromCamera({x:cx/innerWidth*2-1,y:-(cy/innerHeight)*2+1},cam);const o=_ray.ray.origin,d=_ray.ray.direction;for(let t=4;t<140;t+=.4){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(x<0||z<0||x>WS||z>WS)continue;if(y<=Math.max(0,groundY(x,z))){let a=t-.4,b=t;for(let i=0;i<7;i++){const m=(a+b)/2,mx=o.x+d.x*m,mz=o.z+d.z*m;if(o.y+d.y*m<=Math.max(0,groundY(mx,mz)))b=m;else a=m}return[o.x+d.x*b,o.z+d.z*b]}}return null}   /* 33차: 마지막 칸은 반씩 나눠 정확하게(누른 곳 설치) */
/* 버튼 하나(기획자 요청: 가방 + 상호작용 버튼만): 설치 모드면 설치, 가까운 대상(베기·열기·거래·들어가기…)이 있으면 상호작용,
   아니면(또는 적이 가까우면) 손에 든 것 쓰기(공격·던지기·감기). 누른 채 끌면 그쪽으로 조준 */
function actMode(){if(bmode)return'build';const id=curId(),w=WEAP[id]||{};if(fishing)return'fire';if(!w.rod&&nearestEnemy(P.x,P.z,w.melee||id==='fist'?3.4:Math.min(w.range||3.4,12)))return'fire';return target&&target.lab?'act':'fire'}
{const b=$('bAtk');let id=null,ox=0,oy=0,md='fire';b.addEventListener('pointerdown',e=>{e.preventDefault();if(panel&&!sidePanel())return;id=e.pointerId;ox=e.clientX;oy=e.clientY;md=actMode();if(md==='fire'){inp.fire=true;inp.aiming=false}else{inp.act=true;inp.actEdge=true}try{b.setPointerCapture(id)}catch(_){}});
 b.addEventListener('pointermove',e=>{if(e.pointerId!==id||md!=='fire')return;const dx=e.clientX-ox,dy=e.clientY-oy,l=Math.hypot(dx,dy);if(l>14*UIS+6){inp.aiming=true;inp.ax=dx/l;inp.az=dy/l}});const up=e=>{if(e.pointerId!==id)return;id=null;inp.fire=false;inp.aiming=false;inp.act=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)}
{const b=$('bAct');b.addEventListener('pointerdown',e=>{e.preventDefault();inp.act=true;inp.actEdge=true});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>inp.act=false))}
$('bBag').onclick=()=>openPanel('bag');$('bBuild').onclick=()=>openPanel('build');$('bMenu').onclick=()=>openPanel('menu');$('bZoom').onclick=()=>{zoomK=zoomK===1?.74:zoomK<1?1.3:1};
$('quick').addEventListener('pointerdown',e=>{const s=e.target.closest('[data-q]');if(s){e.preventDefault();useQuick(+s.dataset.q)}});
$('bbar').addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b)return;if(b.dataset.b==='rot'){rotNext();sfx(500,.04)}else setBuild(null)});
addEventListener('keydown',e=>{keys[e.code]=1;if(mode!=='play')return;if(e.code==='Escape'){panel?closePanel():setBuild(null)}if(panel)return;if(e.code==='KeyE'&&!e.repeat){inp.act=true;inp.actEdge=true}if(e.code==='Space'){inp.fire=true;inp.aiming=false;e.preventDefault()}
 if(e.code==='Tab'||e.code==='KeyI'){e.preventDefault();openPanel('bag')}if(e.code==='KeyB')openPanel('build');if(e.code==='KeyR'&&bmode)rotNext()});
addEventListener('keyup',e=>{keys[e.code]=0;if(e.code==='KeyE')inp.act=false;if(e.code==='Space')inp.fire=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;inp.fire=inp.act=false;joyEnd()});document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('gesturestart',e=>e.preventDefault());
function readKeys(){if(joy.id!==null)return;const x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),z=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);inp.mx=x;inp.mz=z}
/* ---- overlay ---- */
function scr(x,y,z){_v.set(x,y,z).project(cam);return[(_v.x*.5+.5)*innerWidth,(-_v.y*.5+.5)*innerHeight,_v.z<1]}
function drawFx(dt){const c=fctx;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,innerWidth,innerHeight);if(mode!=='play')return;const k=Math.max(.8,UIS*1.25);c.textAlign='center';
 const bar=(x,y,z,f,col,w=38)=>{const s=scr(x,y,z);if(!s[2])return;c.fillStyle='rgba(59,42,32,.75)';c.fillRect(s[0]-w*k/2-1,s[1]-1,w*k+2,6*k+2);c.fillStyle=col;c.fillRect(s[0]-w*k/2,s[1],w*k*clamp(f,0,1),6*k)};
 for(const e of enemies)if(!e.dead&&e.hpT>0)bar(e.x,groundY(e.x,e.z)+(e.big?3.9:3.2),e.z,e.hp/e.max,'#FF6B5E',e.big?60:38);
 for(const s of structs){if(s.own&&s.hpT>0)bar(s.x,groundY(s.x,s.z)+2.6,s.z,s.hp/s.max,'#7BD88F',44);if((s.t==='mg'||sdef(s).tur)&&dist(s.x,s.z,P.x,P.z)<9){const p=scr(s.x,groundY(s.x,s.z)+2.9,s.z);const t=s.ammo>0?`탄약 ${s.ammo}`:'탄약 없음';if(s.ammo>0)uiPill(c,t,p[0],p[1],12*k,UIC.pn,UIC.tx,UIC.pn3);else uiPill(c,t,p[0],p[1],12*k,UIC.red,'#fff')}}
 if(merchant&&dist(merchant.x,merchant.z,P.x,P.z)<14){const p=scr(merchant.x,groundY(merchant.x,merchant.z)+3.4,merchant.z);uiPill(c,'보급상',p[0],p[1],12.5*k,UIC.grn,'#fff')}
 if(typeof FNPC!=='undefined'&&FNPC&&FNPC.a&&dist(FNPC.x,FNPC.z,P.x,P.z)<14&&!(CHAT.b&&CHAT.b.has('fisher'))){const p=scr(FNPC.x,groundY(FNPC.x,FNPC.z)+3.4,FNPC.z);uiPill(c,'낚시섬 주인',p[0],p[1],12.5*k,UIC.nav,'#fff')}
 if(target&&!bmode&&target.lab){const p=scr(target.x,groundY(target.x,target.z)+(target.k==='o'&&target.o.t<3?3.6:target.k==='s'&&target.s.t==='int_exit'?1.2:target.k==='pl'?1.1:2.6),target.z),t=target.lab;uiPill(c,t,p[0],p[1]-6*k,13.5*k,UIC.pn,UIC.tx,UIC.pn3)}
 drawNoBuild(c,k);drawFishUI(c,k);CHAT.draw(c,k,dt);
 c.font=`900 ${15*k}px ${UIF}`;c.lineWidth=3.5;for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t+=dt;if(f.t>1.1){floats.splice(i,1);continue}const s=scr(f.x,f.y+f.t*1.2,f.z);c.globalAlpha=1-f.t/1.1;c.strokeStyle=UIC.ink;c.strokeText(f.s,s[0],s[1]);c.fillStyle=f.col;c.fillText(f.s,s[0],s[1])}c.globalAlpha=1;
 if(raid.on){let b=null,bd=1e9;for(const e of enemies)if(e.raid&&!e.dead){const d=dist(e.x,e.z,P.x,P.z);if(d<bd){bd=d;b=e}}if(b&&bd>16){const a=Math.atan2(b.z-P.z,b.x-P.x),r=Math.min(innerWidth,innerHeight)*.36,x=innerWidth/2+Math.cos(a)*r,y=innerHeight*.46+Math.sin(a)*r;c.fillStyle='#FF6B5E';c.beginPath();c.moveTo(x+Math.cos(a)*18*k,y+Math.sin(a)*18*k);c.lineTo(x+Math.cos(a+2.5)*12*k,y+Math.sin(a+2.5)*12*k);c.lineTo(x+Math.cos(a-2.5)*12*k,y+Math.sin(a-2.5)*12*k);c.fill()}}}
/* ---- save / flow ---- */
function save(){if(mode!=='play'||!S)return;try{S.built=structs.filter(s=>s.own).map(s=>({t:s.t,x:s.x,z:s.z,r:s.r,in:s.in||undefined,hk:s.in?s.hk:undefined,yo:s.yo||undefined,kit:s.kit||undefined,upc:s.upc||undefined,at:s.at||undefined,hp:Math.round(s.hp),ammo:s.ammo||0,fuel:Math.round(s.fuel||0)}));S.dep={};depSet.forEach(k=>{const o=objs.get(k);if(o.re>0)S.dep[k]=Math.round(o.re)});localStorage.setItem(SAVE,JSON.stringify({S,opt}))}catch(e){}}
function loadSave(){try{const d=JSON.parse(localStorage.getItem(SAVE));if(d&&d.S&&d.S.seed){S=d.S;if(!S.cx){S.coins=Math.round((S.coins||0)*10);S.cx=1}   /* 동전 10배 단위(6차) */if(d.opt)opt=d.opt;return true}}catch(e){}return false}
function startPlay(){windInit();mode='play';if(titleT!==null){S.time=titleT;titleT=null}$('title').classList.add('hide');$('ui').classList.remove('hide');updCamera(0,P.x,groundY(P.x,P.z),P.z,true);hudDirty=true;hud();buildUI();sfx(600,.1);if(innerHeight>innerWidth)toast('폰을 가로로 돌리면 훨씬 편해요')}
let titleT=null;function toTitle(){mode='title';fctx.setTransform(1,0,0,1,0,0);fctx.clearRect(0,0,fx.width,fx.height);   /* no stale world labels behind the title */
 titleT=S.time;$('title').classList.remove('hide');$('ui').classList.add('hide');$('tCont').classList.toggle('hide',!hasSave);newArm=false;$('tNew').textContent='새로 시작'}
let hasSave=false,newArm=false;
$('tCont').onclick=startPlay;
$('tNew').onclick=()=>{if(!hasSave){startPlay();save();hasSave=true;toast('초승달섬에 도착했어요');return}if(!newArm){newArm=true;$('tNew').textContent='지금 섬이 지워져요. 한 번 더!';return}
 try{localStorage.setItem(SAVE,JSON.stringify({S:freshState(WORLD_SEED),opt}));location.reload()}catch(e){toast('새 게임을 저장할 수 없어요')}};
$('tHelp').onclick=()=>{$('title').style.zIndex=4;$('ui').classList.remove('hide');['st','quest','clock','mmw','pills','bAtk','bAct','bRoll','bBuild','bBag','quick','bMenu','bZoom'].forEach(i=>$(i).classList.add('hide'));openPanel('help');const c=closePanel;$('pclose').onclick=$('shade').onclick=()=>{c();$('ui').classList.add('hide');['st','quest','clock','mmw','pills','bAtk','bAct','bRoll','bBuild','bBag','quick','bMenu','bZoom'].forEach(i=>$(i).classList.remove('hide'));$('pclose').onclick=$('shade').onclick=closePanel}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});addEventListener('pagehide',save);addEventListener('resize',()=>{if(R)resize();if(panel==='fmap')drawFmap()});
function tick(dt){if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('on')}if(hurtT>0){hurtT-=dt;if(hurtT<=0)$('hurt').style.opacity=0}
 if(mode==='title'){S.time=.9;const a=gt*.05-1.2;camT.set(VIL.px,1.3,VIL.pz);updEnv(dt,VIL.px,VIL.pz);cam.position.set(VIL.px+Math.cos(a)*36*CAMK,19*CAMK,VIL.pz+8+Math.sin(a)*36*CAMK);cam.lookAt(VIL.px,2,VIL.pz);cullRegions(VIL.px,VIL.pz);P.a.mixer.update(dt);merchant.a.mixer.update(dt);for(const e of enemies)e.a.root.visible=false;R.render(scene,cam);return}
 if(mode!=='play')return;
 const live=!panel||sidePanel();   /* 31차(기획자: '뭔가 하면서 다른 것도 가능하게'): 가방이 열려 있어도 쏘기·상호작용·낚시·톡 누르기 모두 돼요 */
 if(live){readKeys();if(!panel||sidePanel())holdAim();if(!busy){updStats(dt);for(const e of enemies.slice())updEnemy(e,dt);updWorld(dt);updRaid(dt);updSpawns(dt)}updPlayer(dt);intUpd();target=panel&&!sidePanel()?null:findTarget();const q=QUESTS[S.q];if(q&&q.c(S)){S.coins+=q.r;S.q++;toast(`✅ 목표 달성! +${q.r} 동전`);jingle([659,784,1047]);hudDirty=true}}
 merchant.a.mixer.update(dt);if(typeof NET!=='undefined')NET.upd(dt);updFx(dt);updFishFx(dt);if(live&&!busy)updWeather(dt);updEnv(dt,P.x,P.z);updPorts(P.x,P.z);updDress(dt,P.x,P.z);updCamera(dt,P.x,P.yv===undefined||INT.on||P.dead?groundY(P.x,P.z):WTR.st==='swim'?groundY(P.x,P.z)+Math.max(0,P.yv+.45):P.yv,P.z);bagView(dt);cullRegions(camT.x,camT.z);
 updNoBuild();if(ghost){const g=ghostPos();ghost.userData.g=g;ghost.position.set(g.x,BUILDS[bmode]&&BUILDS[bmode].flat?0:groundY(g.x,g.z),g.z);ghost.rotation.y=g.r;ghost.material.color.set(g.ok?0x66dd77:0xe05a4f)}
 if(P.auto&&P.auto.k==='move'){ring.visible=true;ring.position.set(P.auto.x,groundY(P.auto.x,P.auto.z)+.12,P.auto.z);ring.scale.setScalar(.5)}else{ring.visible=!!target&&!bmode}if(ring.visible&&!(P.auto&&P.auto.k==='move')){ring.position.set(target.x,groundY(target.x,target.z)+.12,target.z);ring.scale.setScalar(target.rr*(1+Math.sin(gt*6)*.05))}
 R.render(scene,cam);drawFx(dt);hudT-=dt;if(hudT<=0||hudDirty){hud();hudT=.15}saveT+=dt;if(saveT>20){save();saveT=0}}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;try{tick(dt)}catch(e){console.error(e);if(!loop.err){loop.err=1;toast('오류: '+e.message)}}requestAnimationFrame(loop)}
async function boot(){const L=t=>$('loadTx').textContent=t;try{initRenderer();initLights();devLoad();hasSave=loadSave();if(!hasSave)S=freshState(WORLD_SEED);S.seed=WORLD_SEED;
 L('섬 모델을 불러오는 중…');await loadPack();buildProc();buildCreatures();buildWaterGeo();buildDressGeo();L('캐릭터를 불러오는 중…');await loadChars();L('바다와 섬을 만드는 중…');await new Promise(r=>setTimeout(r,30));
 buildHeights(S.seed);if(S.px==null){S.px=VIL.x;S.pz=VIL.z}if(!S.home)S.home={x:VIL.x,z:VIL.z};L('땅을 다듬는 중…');await new Promise(r=>setTimeout(r,30));buildTerrain();genObjects(S.seed);villageAndPOI();buildPorts();buildBridges();pruneObjects();fishSpotsInit();if(typeof plantsInit==='function')plantsInit();buildNoBuild();for(const k in S.dep){const o=objs.get(+k);if(o){o.re=S.dep[k];depSet.add(+k)}}buildRegions();
 for(const s of structs){const d=sdef(s);if(s.li&&S.looted[s.li]&&S.day-S.looted[s.li]<(d.cd||3)&&(d.loot===1||d.loot===4))s.m.children[0].geometry=GEO[d.og||'crate_open']}
 if(!window.MP){const rm=dropRemoved();if(rm.length){const m=`정리된 것: ${rm.join('·')} — 게임에서 빠졌어요${rm.refund?' (지어 둔 것은 재료를 돌려받았어요)':''}`,sh=()=>{if(mode==='play')setTimeout(()=>toast(m),1500);else setTimeout(sh,400)};sh()}   /* 24차: 없앤 것 정리(core.js dropRemoved), 알림은 게임을 시작한 뒤에 */let rf=0;S.built=(S.built||[]).filter(b=>{const d=BUILDS[b.t];if(d&&d.indoor&&!b.in){rf++;for(const k in d.c)give(k,d.c[k]);return false}return true});   /* 밖에 있던 작업대는 재료로 돌려줘요(14차) */
  S.built.filter(b=>BUILDS[b.t]).forEach(b=>{const s=addStruct(Object.assign({},b,{own:1}));if(s.in&&s.m)s.m.visible=false});if(rf)setTimeout(()=>toast('작업대는 이제 텐트 안에만 놓을 수 있어요. 밖에 있던 작업대 재료를 돌려받았어요'),1800)}initFx();initWater();S.lh=S.lh||{};S.st.b_tur=S.st.b_tur||0;S.st.b_ptent=S.st.b_ptent||0;S.st.b_slight=S.st.b_slight||0;S.st.bunk=S.st.bunk||0;S.caught=S.caught||{};S.best=S.best||{};S.stash=S.stash||{};S.st.fish=S.st.fish||0;S.st.cook=S.st.cook||0;
 P.a=new Actor('hero');P.a.helmet();P.a.xray();P.x=S.px;P.z=S.pz;unstuck();P.a.play('Idle',{force:1});P.a.set(P.x,P.z,0);
 merchant={a:new Actor('merchant'),x:VIL.mx,z:VIL.mz};merchant.a.play('Idle',{force:1});merchant.a.set(merchant.x,merchant.z,2.2);merchant.a.mixer.update(.5);
 ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,28),new THREE.MeshBasicMaterial({color:0x7BD88F,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
 placeBag();devInit();L('아이콘을 그리는 중…');await new Promise(r=>setTimeout(r,30));makeIcons();makeMap();resize();$('load').classList.add('hide');toTitle();if(typeof NET!=='undefined')NET.init();last=performance.now();requestAnimationFrame(loop)}
 catch(e){console.error(e);L('불러오지 못했어요: '+e.message+' — 새로고침 해주세요')}}
/* ===== 27차(기획자): 가방 20칸 · 에너지 10칸 =====
   가방: 아이템 한 종류 = 한 칸(개수는 한 칸에 얼마든지), 모두 20칸. 꽉 찼을 때 새 종류가 들어오면 발밑에 자루로 내려놓고(5분 뒤 사라짐),
   칸이 비면 그 자루를 다시 주워요. 상점·자판기·보관 상자 꺼내기·제작·굽기는 꽉 차 있으면 막혀요. 버리기 = 발 앞에 자루(멀어졌다 오면 다시 주움).
   에너지: 왼쪽 위에 ⚡ 10칸(S.hp 10 = 1칸). 배고픔·체온 줄은 숨겼어요(actors.js updStats). */
const BAG_N=20;
const bagList=()=>Object.keys(S.inv).filter(k=>S.inv[k]>0&&ITEMS[k]&&!(typeof eqHas==='function'&&eqHas(k)));   /* 48차: 장비 칸에 낀 것은 가방 칸에서 빠져요(gear.js) */
const bagHas=id=>id==='coin'||(S.inv[id]||0)>0||bagList().length<BAG_N;
const bagFits=items=>{let need=0;for(const k in items)if(k!=='coin'&&items[k]>0&&!(S.inv[k]>0))need++;return bagList().length+need<=BAG_N};
const BAGX={t:0};
function bagFullMsg(){if(performance.now()-BAGX.t<2500)return;BAGX.t=performance.now();toast(`🎒 가방이 꽉 찼어요 (${BAG_N}칸) — 팔거나 버려서 칸을 비워요`);sfx(240,.06,'square',.03)}
function bagSack(items,hold,ahead){if(typeof addDrop!=='function')return;const d=ahead?1.3:.6,x=P.x+Math.sin(P.rot)*d,z=P.z+Math.cos(P.rot)*d;addDrop(x,z,items);const q=drops[drops.length-1];if(q&&q.items===items){q.life=300;q.hold=hold?1:0}}
{const _g=give;give=function(id,n){if(id!=='coin'&&n>0&&mode==='play'&&P&&P.a&&!P.dead&&!INT.on&&!bagHas(id)){bagSack({[id]:n},0,0);bagFullMsg();return}_g(id,n)}}
/* 꽉 찼을 때 막는 버튼들(창 클릭보다 먼저 봐요) */
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,k=b.dataset.k;let id=null;
 if(a==='buy'||a==='vbuy'||a==='get')id=k;else if(a==='craft'){const r=RECIPES[+b.dataset.i];id=r&&r.id}else if(a==='cook'&&+b.dataset.n<invN(k))id='c'+k;
 if(id&&!bagHas(id)){bagFullMsg();e.stopPropagation()}},true);
/* 버리기 */
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="drop"]');if(!b)return;const k=b.dataset.k,n=invN(k);if(!n)return;
 if(INT.on){toast('밖에서 버려요');return}delete S.inv[k];for(let i=0;i<S.quick.length;i++)if(S.quick[i]===k)S.quick[i]=null;selItem=null;bagSack({[k]:n},1,1);sfx(300,.06,'square',.03);toast(`${ITEMS[k].n}${n>1?' ×'+n:''} 버렸어요`);hudDirty=true});
/* 에너지 10칸 (왼쪽 위). 예전 체력·배고픔·체온 줄은 숨겨요 */
const NRGUI={c:null};
function nrgInit(){if(NRGUI.c)return;const st=$('st');if(!st)return;for(const id of['bHp','bHu','bWa']){const r=$(id)&&$(id).closest('.br');if(r)r.style.display='none'}
 const w=document.createElement('div');w.id='nrg';w.className='br';w.innerHTML='<span style="background:var(--amb)">⚡</span><div style="flex:1;display:flex;gap:3px">'+Array.from({length:10},()=>'<i class="nc"><b></b></i>').join('')+'</div>';
 const box=$('bHp').closest('.br').parentNode;box.appendChild(w);st.style.height='62px';
 const css=document.createElement('style');css.textContent='#nrg .nc{flex:1;height:17px;border-radius:5px;background:var(--pn3);overflow:hidden;position:relative;box-shadow:inset 0 2px 0 rgba(120,86,52,.18)}#nrg .nc b{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--amb);border-radius:5px;box-shadow:inset 0 3px 0 rgba(255,255,255,.4);transition:width .25s}#nrg.low .nc b{background:var(--red)}#nrg.low{animation:nrgBlink 1s infinite}@keyframes nrgBlink{50%{opacity:.5}}'
  /* 30차(기획자: '에너지 한 칸당 전부 반투명한 에너지로, 이상한 테두리 없애고 깔끔하고 단순하게'): 크림색 판·테두리·이름 줄 없이 ⚡ + 반투명 10칸만 */
  +'#st.nrg1{background:none;border:0;box-shadow:none;height:auto!important;width:250px}#st.nrg1 #nrg{margin-top:0;gap:6px}#st.nrg1 #nrg>span{background:none!important;width:auto;height:auto;font-size:19px;filter:drop-shadow(0 1px 1.5px rgba(40,24,12,.45))}'
  +'#st.nrg1 #nrg>div{gap:4px!important}#st.nrg1 .nc{height:15px;border-radius:5px;background:rgba(70,48,28,.26);box-shadow:none}#st.nrg1 .nc b{background:rgba(255,190,40,.72);border-radius:5px;box-shadow:none}#st.nrg1 #nrg.low .nc b{background:rgba(236,78,58,.75)}';
 st.classList.add('nrg1');if(box.firstElementChild&&box.firstElementChild!==w)box.firstElementChild.style.display='none';
 document.head.appendChild(css);NRGUI.c=[...w.querySelectorAll('.nc b')];NRGUI.w=w}
{const _h=hud;hud=function(){_h();nrgInit();if(!NRGUI.c)return;const v=P.dead?0:clamp(S.hp,0,100)/10;NRGUI.c.forEach((b,i)=>{const f=Math.round(clamp(v-i,0,1)*100)+'%';if(b.style.width!==f)b.style.width=f});NRGUI.w.classList.toggle('low',v<=2.001&&v>0)}}
/* ===== 28차(기획자: '제작칸 총 6칸, 마크 제작법처럼 3×2'): 작업대 창의 제작 =====
   가방에서 재료를 눌러 고르고 제작 칸을 누르면 1개씩 놓여요(같은 칸을 또 누르면 더 쌓여요, 아무것도 안 고르고 누르면 그 칸은 가방으로).
   칸의 모양이 제작법(RECIPES[].pat, core.js CRAFT_PAT)과 맞으면 결과 칸에 떠요 → [만들기](칸마다 1개씩 씀)·[전부].
   제작법 목록의 [놓기]는 가방 재료로 칸을 모양대로 채워요. 창을 닫으면 칸에 남은 재료는 가방으로 돌아가요(S.cg — 저장된 채 꺼져도 다시 켤 때 돌려줘요). */
const CG={sel:null,boot:0};
const cgGrid=()=>{if(!Array.isArray(S.cg)||S.cg.length!==6)S.cg=[null,null,null,null,null,null];return S.cg};
const cgPatCells=p=>p.map(row=>[...row].map(ch=>CRAFT_KEY[ch]||null));
function cgNorm(ids){let r0=9,r1=-1,c0=9,c1=-1;for(let r=0;r<2;r++)for(let c=0;c<3;c++)if(ids[r*3+c]){r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c)}
 if(r1<0)return null;const o=[];for(let r=r0;r<=r1;r++){const row=[];for(let c=c0;c<=c1;c++)row.push(ids[r*3+c]||null);o.push(row)}return o}
function cgMatch(){const n=cgNorm(cgGrid().map(s=>s&&s.id));if(!n)return null;for(const r of RECIPES){if(!r.pat)continue;const q=cgPatCells(r.pat);if(q.length!==n.length||q[0].length!==n[0].length)continue;
  const eq=m=>q.every((row,i)=>row.every((v,j)=>v===n[i][m?row.length-1-j:j]));if(eq(0)||eq(1))return r}return null}
function cgReturn(){const g=cgGrid();for(let i=0;i<6;i++){const c=g[i];if(c&&c.n>0)S.inv[c.id]=(S.inv[c.id]||0)+c.n;g[i]=null}hudDirty=true}
function cgPut(i){const g=cgGrid(),c=g[i],k=CG.sel;
 if(k&&invN(k)>0){if(c&&c.id!==k){S.inv[c.id]=(S.inv[c.id]||0)+c.n;g[i]=null}take(k,1);g[i]=g[i]&&g[i].id===k?{id:k,n:g[i].n+1}:{id:k,n:1};if(!invN(k))CG.sel=null;sfx(620,.04)}
 else if(c){S.inv[c.id]=(S.inv[c.id]||0)+c.n;g[i]=null;sfx(480,.04)}hudDirty=true}
const cgBenchOK=()=>panel==='bench'||nearBench();
function cgMake(times){const r=cgMatch();if(!r)return;const it=ITEMS[r.id];if(r.bench&&!cgBenchOK()){toast('작업대에서 만들 수 있어요');return}let k=0;
 while(k<times){if(it.one&&invN(r.id)){if(!k)toast(`${jo(it.n,'은','는')} 이미 가지고 있어요`);break}if(!bagHas(r.id)){bagFullMsg();break}if(cgMatch()!==r)break;
  const g=cgGrid();for(let i=0;i<6;i++)if(g[i]){g[i].n--;if(g[i].n<=0)g[i]=null}give(r.id,r.n);const sk='c_'+r.id;if(S.st[sk]!==undefined)S.st[sk]++;k++}
 if(k){jingle([523,784]);toast(`${it.n}${r.n*k>1?' ×'+r.n*k:''} 완성!`)}hudDirty=true}
function cgFill(ri){const r=RECIPES[ri];if(!r||!r.pat)return;cgReturn();if(!canPay(r.c)){toast('재료가 모자라요');return}const q=cgPatCells(r.pat),g=cgGrid();
 q.forEach((row,rr)=>row.forEach((id,cc)=>{if(id){take(id,1);g[rr*3+cc]={id,n:1}}}));CG.sel=null;sfx(660,.05)}
function cgHtml(benchOK){const g=cgGrid(),r=cgMatch(),it=r&&ITEMS[r.id],lock=!!(r&&r.bench&&!benchOK),own=!!(r&&it.one&&invN(r.id)),can=!!r&&!lock&&!own,
  max=can?(it.one?1:Math.min(...g.filter(Boolean).map(c=>c.n))):0,bs='min-height:36px;padding:6px 12px;font-size:13px';
 const cell=(c,i)=>`<div class="slot" data-a="cgs" data-i="${i}" style="width:58px;height:58px;${CG.sel&&!c?'border-color:var(--grn);':''}">${c?invIcon(c.id)+(c.n>1?`<b>${c.n}</b>`:''):''}</div>`;
 let h=`<div class="sec" style="margin-top:0">🔨 제작 칸 3×2 — 재료를 모양대로 놓아요</div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
  <div class="grid" style="grid-template-columns:repeat(3,58px);gap:6px">${g.map(cell).join('')}</div><div style="font-size:24px;color:var(--mut);font-weight:900">➜</div>
  <div class="slot" style="width:66px;height:66px;${can?'border-color:var(--grn);background:#F2FFE9':''}">${r?invIcon(r.id)+(r.n>1?`<b>${r.n}</b>`:''):''}</div>
  <div style="display:flex;flex-direction:column;gap:5px;min-width:150px;flex:1"><div style="font-weight:900;font-size:14px">${r?it.n+(r.n>1?' ×'+r.n:''):'모양이 맞으면 여기에 떠요'}</div>${r?`<small style="color:var(--mut);font-weight:700;font-size:12px">${lock?'작업대에서 만들 수 있어요':own?'이미 가지고 있어요':`칸마다 1개씩 써요 · ${max}번 만들 수 있어요`}</small>`:''}
  <div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn" data-a="cgmake" data-n="1" ${can?'':'disabled'} style="${bs}">만들기</button><button class="btn g" data-a="cgmake" data-n="999" ${can&&max>1?'':'disabled'} style="${bs}">전부</button><button class="btn g" data-a="cgclr" ${g.some(Boolean)?'':'disabled'} style="${bs}">비우기</button></div></div></div>`;
 const ks=bagList();h+=`<div class="sec">가방 — ${CG.sel?`${ITEMS[CG.sel].n} 골랐어요 · 칸을 누르면 1개씩 놓여요`:'재료를 눌러 골라요'}</div><div class="grid" style="grid-template-columns:repeat(auto-fill,50px);gap:5px">${ks.map(k=>`<div class="slot ${CG.sel===k?'sel':''}" data-a="cgpick" data-k="${k}" style="width:50px;height:50px">${invIcon(k)}<b style="font-size:11px">${S.inv[k]}</b></div>`).join('')}</div>`;
 h+=`<div class="sec">제작법 — [놓기]를 누르면 가방 재료로 칸을 채워요</div>`+RECIPES.map((rc,i)=>{if(!rc.pat)return'';const q=cgPatCells(rc.pat),ri=ITEMS[rc.id],lk=rc.bench&&!benchOK,ok=!lk&&canPay(rc.c)&&!(ri.one&&invN(rc.id));
  const mini=`<div style="display:grid;grid-template-columns:repeat(3,24px);gap:2px;flex:none">${[0,1].map(a=>[0,1,2].map(b=>{const m=q[a]&&q[a][b];return`<div style="width:24px;height:24px;border-radius:6px;background:var(--pn2);border:1.5px solid var(--pn3);display:flex;align-items:center;justify-content:center">${m?`<img src="${ICON[m]}" style="width:21px;height:21px">`:''}</div>`}).join('')).join('')}</div>`;
  return`<div class="row" style="gap:8px">${mini}<div style="font-size:16px;color:var(--mut);flex:none">➜</div>${invIcon(rc.id)}<div class="tx">${ri.n}${rc.n>1?' ×'+rc.n:''}${lk?' <span style="font-size:12px;color:var(--blu)">작업대</span>':''}<small>${costHtml(rc.c)}</small></div><button class="btn g" data-a="cgfill" data-i="${i}" ${ok?'':'disabled'} style="min-height:34px;padding:6px 10px;font-size:13px;flex:none">놓기</button></div>`}).join('');
 return h}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel==='bench')$('pbody').innerHTML=`<div class="cols bench"><div class="grow">${cgHtml(true)}</div><div class="upw">${upCard()}</div></div>`;else if(panel==='craft')$('pbody').innerHTML=cgHtml(nearBench())}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;if(!/^cg/.test(a))return;
 if(a==='cgpick'){const k=b.dataset.k;CG.sel=CG.sel===k?null:k;sfx(700,.03)}else if(a==='cgs')cgPut(+b.dataset.i);else if(a==='cgmake')cgMake(+b.dataset.n);else if(a==='cgclr'){cgReturn();sfx(480,.05)}else if(a==='cgfill')cgFill(+b.dataset.i);renderPanel()});
{const _c=closePanel;closePanel=function(){if(panel==='bench'||panel==='craft')cgReturn();CG.sel=null;_c()}}
{const _o=openPanel;openPanel=function(k){if((panel==='bench'||panel==='craft')&&k!==panel)cgReturn();if(k!==panel)CG.sel=null;_o(k)}}
{const _h=hud;hud=function(){if(!CG.boot&&mode==='play'&&S){CG.boot=1;if(Array.isArray(S.cg)&&S.cg.some(Boolean))cgReturn()}_h()}}
/* ===== 30차(기획자, 11-19) =====
   ① 재화(동전)는 가방을 열었을 때만(가방 창 위 #pcoin). 오른쪽 위 동전 알약은 없앴어요.
   ② 탄알 수: 평소에는 없고, 탄을 쓰는 무기(총·석궁)를 들면 지도 아래에 숫자만(그림 없이).
   ③ 🔍 버튼 없음 → 두 손가락으로 벌리고 오므려 확대·축소(예전 버튼 범위 .74~1.3 안에서 부드럽게). PC는 마우스 휠.
   ④ 텐트는 친 뒤 12시간(실제 시간, s.at)이 지나면 사라져요. 텐트 위에 남은 시간. 집(업그레이드)은 안 사라져요.
   ⑤ 가방: 칸을 누르면 바로 장착·해제·먹기·설치(버튼 없이). 칸을 끌어서 가방 창 밖에 놓으면 버려요. */
{const _h=hud;hud=function(){_h();const pl=$('pills');if(!pl||!S)return;const f=pl.firstElementChild,fi=f&&f.querySelector('img');if(fi&&fi.getAttribute('src')===ICON.coin)f.remove();
 const w=WEAP[curId()]||{};if(w.ammo){const a=pl.firstElementChild;if(a&&a.querySelector('img')){a.textContent=String(invN(w.ammo));a.classList.add('ammoN')}}else if(w.nade)pl.insertAdjacentHTML('afterbegin',`<div class="pn pill ammoN">${invN(curId())}</div>`)}}
{const css=document.createElement('style');css.textContent='#pills .pill.ammoN{font-size:17px;padding:3px 13px;min-width:20px;justify-content:center}'
  +'#pbody .slot[data-a=sel]{touch-action:none;-webkit-user-select:none;user-select:none}#bagDrag{position:fixed;z-index:60;pointer-events:none;width:64px;height:64px;transform:translate(-50%,-50%);transition:opacity .1s}#bagDrag img{width:100%;height:100%;filter:drop-shadow(0 4px 6px rgba(40,24,12,.35))}'
  +'#bagDrag b{position:absolute;left:50%;top:-6px;transform:translate(-50%,-100%);white-space:nowrap;background:var(--red);color:#fff;font:800 12px var(--f);padding:3px 9px;border-radius:11px;display:none}#bagDrag.out b{display:block}#bagDrag.out img{opacity:.75}';
 document.head.appendChild(css)}
/* ③ 두 손가락 확대·축소 */
const ZOOM={t:null,min:.74,max:1.3,pts:{},on:0,d0:1,z0:1};
$('bZoom').style.display='none';
{const two=()=>Object.values(ZOOM.pts),stopOthers=()=>{aimP.id=null;actCancel();thCancel();for(const id in taps)delete taps[id]};   /* 쓰기·조준·톡 누르기를 끊어요(32차: 조이스틱 손가락은 그대로) */
 cv.addEventListener('pointerdown',e=>{if(mode!=='play'||panel&&!sidePanel()||e.pointerId===joy.id||e.pointerId===RJ.id)return;ZOOM.pts[e.pointerId]={x:e.clientX,y:e.clientY};const p=two();
  if(p.length>=2){ZOOM.on=1;ZOOM.d0=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1;ZOOM.z0=ZOOM.t==null?zoomK:ZOOM.t;stopOthers()}});
 cv.addEventListener('pointermove',e=>{const q=ZOOM.pts[e.pointerId];if(!q)return;q.x=e.clientX;q.y=e.clientY;if(!ZOOM.on)return;const p=two();if(p.length<2)return;
  const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1;ZOOM.t=clamp(ZOOM.z0*ZOOM.d0/d,ZOOM.min,ZOOM.max)});   /* 32차: 조이스틱 손가락은 따로라 걷기는 그대로 */
 const up=e=>{delete ZOOM.pts[e.pointerId];if(!two().length)ZOOM.on=0;else if(ZOOM.on)stopOthers()};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{if(mode!=='play')return;e.preventDefault();const z=ZOOM.t==null?zoomK:ZOOM.t;ZOOM.t=clamp(z*(1+Math.sign(e.deltaY)*Math.min(.25,Math.abs(e.deltaY)*.0015)),ZOOM.min,ZOOM.max)},{passive:false});
 const _uc=updCamera;updCamera=function(dt,px,py,pz,snap){if(ZOOM.t!=null&&!INT.on){const d=ZOOM.t-zoomK;zoomK=Math.abs(d)<.002?ZOOM.t:zoomK+d*Math.min(1,dt*12)}return _uc(dt,px,py,pz,snap)}}
/* ④ 텐트 12시간 */
const TENT_LIFE=12*3600e3;
{const _as=addStruct;addStruct=function(s){const r=_as(s);if(r&&r.t==='ptent'&&r.own&&!r.at)r.at=Date.now();
  if(r&&r.t==='phouse'&&r.m&&typeof PLAMPS!=='undefined'){const k=sdef(r).s;for(const ch of r.m.children)if(PLAMPS.includes(ch))ch.position.multiplyScalar(k)}return r}}   /* 집 문 옆 등불 자리도 집 크기(s)에 맞춰요 */   /* 예전 저장의 텐트는 불러온 때부터 12시간 */
const tentLeft=s=>s.at+TENT_LIFE-Date.now();
function tentLeftTx(ms){const m=Math.max(0,Math.ceil(ms/60e3)),h=(m/60)|0;return ms<60e3?Math.max(0,Math.ceil(ms/1e3))+'초':h?`${h}시간 ${m%60}분`:`${m}분`}
function tentGone(s){if(INT.on&&INT.s===s)intOut();const hx=s.x,hz=s.z+sdef(s).bz+1.1;removeStruct(s);
 if(S.home&&dist(S.home.x,S.home.z,hx,hz)<1.5){const o=structs.find(q=>q.own&&sdef(q).home);S.home=o?{x:o.x,z:o.z+sdef(o).bz+1.1}:{x:VIL.x,z:VIL.z}}
 if(typeof puff==='function')puff(s.x,groundY(s.x,s.z)+.6,s.z,0xffffff,10);sfx(260,.12,'sine',.04);toast('⛺ 텐트가 12시간이 지나 사라졌어요');hudDirty=true;save()}
{const _h=hud;let t=0;hud=function(){_h();if(mode!=='play'||!S||busy||P.dead)return;const now=performance.now();if(now-t<1000)return;t=now;for(const s of structs.slice())if(s.t==='ptent'&&s.own&&s.at&&tentLeft(s)<=0)tentGone(s)}}
{const _d=drawFx;drawFx=function(dt){_d(dt);if(mode!=='play'||INT.on||!S)return;const c=fctx,k=Math.max(.8,UIS*1.25);
 for(const s of structs){if(s.t!=='ptent'||!s.own||!s.at||dist(P.x,P.z,s.x,s.z)>40)continue;const q=scr(s.x,groundY(s.x,s.z)+3.25,s.z);if(!q[2])continue;const ms=tentLeft(s);
  uiPill(c,'⏳ '+tentLeftTx(ms),q[0],q[1],10.5*k,ms<3600e3?'rgba(229,83,75,.92)':'rgba(91,61,43,.86)','#fff','rgba(255,255,255,.35)')}}}
/* ⑤ 가방: 누르면 바로, 끌어서 밖에 놓으면 버리기 */
const BAGD={k:null,x:0,y:0,id:null,on:0,el:null,end:0};
function bagTap(k){const it=ITEMS[k];if(!it||!invN(k))return;selItem=k;const ty=it.ty;
 if(ty==='kit'||ty==='food'||ty==='heal'||ty==='fish'){primary(k);hudDirty=true;return}
 if(ty==='gun'||ty==='tool'||ty==='throw'){if(curId()===k){S.quick[S.sel]=null;sfx(500,.05);toast('맨손이 됐어요')}else if(ty==='throw'){const j=S.quick.indexOf(k);if(j>=0&&j!==S.sel)S.quick[j]=null;S.quick[S.sel]=k;sfx(600,.05);toast(ITEMS[k].n+' 장착! 오른쪽 조이스틱을 끌었다 떼면 던져요')}else primary(k);hudDirty=true;return}   /* 32차: 수류탄도 손에 들기만(던지기는 화면을 눌러서) */
 sfx(700,.03);hudDirty=true}
function bagDrop(k){const n=invN(k);if(!n)return;if(INT.on){toast('밖에서 버려요');return}delete S.inv[k];for(let i=0;i<S.quick.length;i++)if(S.quick[i]===k)S.quick[i]=null;if(selItem===k)selItem=null;
 bagSack({[k]:n},1,1);sfx(300,.06,'square',.03);toast(`${ITEMS[k].n}${n>1?' ×'+n:''} 버렸어요`);hudDirty=true}
$('pbody').addEventListener('click',e=>{if(panel!=='bag')return;const b=e.target.closest('[data-a="sel"]');if(!b)return;e.stopPropagation();if(performance.now()-BAGD.end<350)return;bagTap(b.dataset.k)},true);
$('pbody').addEventListener('pointerdown',e=>{if(panel!=='bag')return;const b=e.target.closest('[data-a="sel"]');if(!b)return;BAGD.k=b.dataset.k;BAGD.x=e.clientX;BAGD.y=e.clientY;BAGD.id=e.pointerId;BAGD.on=0});
{const outside=(x,y)=>{const r=$('panel').getBoundingClientRect();return x<r.left||x>r.right||y<r.top||y>r.bottom};
 addEventListener('pointermove',e=>{if(BAGD.k==null||e.pointerId!==BAGD.id)return;if(!BAGD.on){if(Math.hypot(e.clientX-BAGD.x,e.clientY-BAGD.y)<12)return;BAGD.on=1;const d=document.createElement('div');d.id='bagDrag';d.innerHTML=`<img src="${ICON[BAGD.k]}"><b>놓으면 버려요</b>`;document.body.appendChild(d);BAGD.el=d}
  e.preventDefault();BAGD.el.style.left=e.clientX+'px';BAGD.el.style.top=e.clientY+'px';BAGD.el.classList.toggle('out',outside(e.clientX,e.clientY))},{passive:false});
 const fin=e=>{if(BAGD.k==null||e.pointerId!==BAGD.id)return;const k=BAGD.k,was=BAGD.on;BAGD.k=null;BAGD.id=null;BAGD.on=0;if(BAGD.el){BAGD.el.remove();BAGD.el=null}
  if(!was)return;BAGD.end=performance.now();if(e.type==='pointerup'&&panel==='bag'&&outside(e.clientX,e.clientY))bagDrop(k)};
 addEventListener('pointerup',fin);addEventListener('pointercancel',fin)}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel!=='bag')return;const B=$('pbody'),g=B.querySelector('.grid');if(!g)return;let n=g.nextElementSibling;const keep=n&&n.textContent.includes('넘쳤어요')?n:null;
 for(const x of [...B.children])if(x!==g&&x!==keep)x.remove();const k=selItem&&invN(selItem)?selItem:null,eq=curId()==='fist'?null:curId();let h='';
 if(k){const it=ITEMS[k],w=WEAP[k],st=k===eq?'<span style="background:var(--grn);color:#fff;border-radius:9px;padding:1px 8px;font-size:11.5px;margin-left:6px">손에 듦</span>':'';
  h=`<div style="display:flex;gap:10px;align-items:center;margin-top:10px"><img src="${ICON[k]}" style="width:50px;height:50px"><div class="tx"><div style="font-size:16px">${it.n} ${it.one?'':`<span style="color:var(--mut);font-size:13px">×${S.inv[k]}</span>`}${st}</div><small>${it.d||''}</small>`
   +(w&&!w.rod?`<div style="font-size:12px;color:var(--mut);font-weight:700;margin-top:2px">피해 ${w.dmg}${w.pel?'×'+w.pel:''} · ${w.melee?'근접':'사거리 '+w.range+'m'}${w.ammo?' · '+ITEMS[w.ammo].n+' '+invN(w.ammo)+'발':''}</div>`:'')+'</div></div>'}
 h+=`<div style="color:var(--mut);font-weight:600;font-size:12px;line-height:1.55;margin:8px 2px 2px">누르면 바로 장착·먹기·설치해요. 든 것을 다시 누르면 내려놓아요. 끌어서 가방 밖에 놓으면 버려요.</div>`;
 B.insertAdjacentHTML('beforeend',h)}}
/* ===== 31차(기획자 11-19 20:14: '뭔가 하면서 다른 것도 가능하게 — 가방 연 채로 움직이기, 걸으면서 먹기, 걷다가 멈추지 않고 상호작용') =====
   ① 여러 손가락: 조이스틱(또는 쏘기)을 누른 채 다른 손가락으로 누른 버튼·가방 칸·✕도 바로 돼요.
      휴대폰 브라우저는 손가락이 둘 이상 닿아 있으면 톡(click)을 안 만들어 줘서, 손가락을 뗄 때 직접 눌러 줘요(원래 오는 click은 한 번만 되게 막음).
   ② 가방을 연 채로도 쏘기·상호작용·낚시·화면 톡 누르기가 돼요(위 줄들). 큰 버튼은 가방에 가리지 않게 가방 옆(가로)·위(세로)로 비켜요.
   ③ 걸으면서 가까운 것을 톡 누르면 멈추지 않고 바로 상호작용(멀면 예전처럼 조이스틱이 먼저).
   ④ 걸으면서 먹으면 걷는 모습 그대로(useItem), 가방을 열어도 쏘던 것·낚시를 끊지 않아요(openPanel). */
{const CL='button,[data-a],[data-tab],[data-q],#pclose,.rb',MT={},SUP={x:0,y:0,until:0};
 const pick=el=>{if(!el||!el.closest||el.closest('#bAtk,#bChat,#chatSend,input,textarea,select,label,canvas'))return null;return el.closest(CL)};
 const key=t=>t.id||['a','k','i','n','tab','q','c'].map(q=>t.dataset&&t.dataset[q]||'').join('|');
 document.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;const t=pick(e.target);if(t)MT[e.pointerId]={t,x:e.clientX,y:e.clientY,k:key(t)}},true);
 document.addEventListener('pointercancel',e=>{delete MT[e.pointerId]},true);
 document.addEventListener('pointerup',e=>{const r=MT[e.pointerId];delete MT[e.pointerId];if(!r||Math.hypot(e.clientX-r.x,e.clientY-r.y)>14)return;let t=r.t;
  if(!t.isConnected){const n=pick(document.elementFromPoint(e.clientX,e.clientY));if(!n||key(n)!==r.k)return;t=n}   /* 그 사이 창이 다시 그려졌으면 같은 칸을 다시 찾아요 */
  const b=t.getBoundingClientRect();if(t.disabled||e.clientX<b.left-6||e.clientX>b.right+6||e.clientY<b.top-6||e.clientY>b.bottom+6)return;
  SUP.x=e.clientX;SUP.y=e.clientY;SUP.until=performance.now()+650;t.click()},true);
 document.addEventListener('click',e=>{if(!e.isTrusted||performance.now()>SUP.until||Math.hypot(e.clientX-SUP.x,e.clientY-SUP.y)>40)return;e.stopPropagation();e.preventDefault()},true)}   /* 이미 눌러 준 톡 자리에 뒤늦게 오는 진짜 click은 버려요(그 사이 창이 열려 다른 칸이 눌리는 일 없게) */
/* ② 큰 버튼 비키기 */
function atkDodge(){const b=$('bAtk'),el=$('panel');if(!b)return;if(sidePanel()&&mode==='play'){const port=VW<=VH;if(port){const h=Math.round(clamp(VH*.5,300,560));b.style.bottom=(h+24)+'px';b.style.right=''}else{const w=Math.round(clamp(VW*.48,360,540));b.style.right=(w+28)+'px';b.style.bottom=''}b.classList.add('dodge')}
 else if(b.classList.contains('dodge')){b.style.bottom=b.style.right='';b.classList.remove('dodge')}}
{const css=document.createElement('style');css.textContent='#bAtk{transition:right .18s,bottom .18s}#bAtk.dodge{transform:scale(.86)}';document.head.appendChild(css)}
{const _l=layoutPanel;layoutPanel=function(){_l();atkDodge()}}
{const _c=closePanel;closePanel=function(){_c();atkDodge()}}
/* ③ 걸으면서 가까운 것 톡 → 34차: 누르면 걸어가는 게 없어져서 따로 할 일이 없어요(가까운 대상은 걸으면서 눌러도 바로 상호작용) */
/* ===== 32차(기획자 11-19 20:56) =====
   ① 큰 버튼 없음 → 조이스틱 말고 화면 아무 데나 누르면 상호작용·쓰기(위 cv 손가락 처리, ACT). ② 조이스틱은 왼쪽 아래에 고정·늘 보임(joyFix).
   ③ 수류탄은 가방에서 누르면 손에 들기만, 화면을 누를 때마다 누른 곳으로 하나씩 던져요(throwNadeAt, 3~14m). */
function joyFix(){const j=$('joy');if(!j)return;j.classList.remove('hide');const port=VW<=VH;let b=port?58:30;if(sidePanel()&&mode==='play'&&port)b=Math.round(clamp(VH*.5,300,560))+24;   /* 세로 화면에서 가방이 열리면 가방 위로 */
 Object.assign(j.style,{left:(port?22:34)+'px',top:'',bottom:b+'px',transition:'bottom .18s'})}
$('bAtk').style.display='none';
{const _l=layoutPanel;layoutPanel=function(){_l();joyFix()}}
{const _c=closePanel;closePanel=function(){_c();joyFix()}}
{const _r=resize;resize=function(){_r();joyFix()}}
joyFix();
{const _u=updPlayer;updPlayer=function(dt){if(ACT.pend&&performance.now()>=ACT.pend){ACT.pend=0;actApply()}_u(dt);if(ACT.rel){ACT.rel=0;if(ACT.id===null){inp.fire=false;inp.aiming=false;inp.act=false}}if(!inp.fire)NADE.held=false}}
const NADE={held:false};
function throwNadeAt(g){if(!g||!inp.aiming){throwNade();return}if(!take('grenade',1))return;let dx=g[0]-P.x,dz=g[1]-P.z,d=Math.hypot(dx,dz)||1;dx/=d;dz/=d;d=clamp(d,3,14);P.rot=Math.atan2(dx,dz);
 P.a.play('Throw',{once:1,lock:.5,force:1,speed:1.4});const m=mesh(GEO.grenade);m.scale.setScalar(.8);scene.add(m);nades.push({m,x:P.x,z:P.z,dx,dz,d,t:0,T:.75,y0:groundY(P.x,P.z)+1.6});hudDirty=true}
{const _a=attack;attack=function(){if(curId()!=='grenade')return _a();if(P.cd>0||NADE.held)return;NADE.held=true;P.cd=WEAP.grenade.cd;throwNadeAt(ACT.g)}}   /* 누를 때마다 하나(누르고 있어도 하나) */
/* ===== 33차(기획자 11-19 21:27) =====
   ① 설치: 설치 모드에서 화면을 누르면 미리보기가 누른 곳으로 가고(누른 채 끌면 따라와요), 떼면 거기에 놓아요(BPIN, actors.js ghostPos). 철거 모드는 누른 건물을 철거.
   ② 관리자 모드 크리에이티브(CRV): 1m 정사각형 블록. 땅을 누르면 그 칸에, 블록 윗면을 누르면 위에, 옆면을 누르면 옆에 쌓여요. 누른 채 끌면 같은 층에 줄지어 칠해요.
      지우기·되돌리기·색 6가지. 블록은 걸어서 지나갈 수 있어요(틀 그리기용). 바뀔 때마다 저장: 이 폰(localStorage 'frontisle_blocks') +
      게임 링크 데이터 'creative/main'(주인만 읽고 써요, Claude가 db_get으로 읽어요). 📋는 글로 복사(백업). */
const TCH={id:null,kind:null,pend:0,e:null};
function touchHook(type,e){
 if(type==='down'){
  if(CRV.on&&DEV.on){TCH.id=e.pointerId;TCH.kind='cre';TCH.e={clientX:e.clientX,clientY:e.clientY};TCH.pend=performance.now()+90;return true}   /* 두 손가락 확대와 헷갈리지 않게 90ms 뒤 */
  if(bmode){TCH.id=e.pointerId;TCH.kind='bld';bldPin(e);return true}
  return false}
 if(e.pointerId!==TCH.id)return false;
 if(type==='move'){if(TCH.kind==='cre'){TCH.e={clientX:e.clientX,clientY:e.clientY};if(!TCH.pend)creDrag(TCH.e)}else bldPin(e);return true}
 const k=TCH.kind;TCH.id=null;TCH.kind=null;
 if(k==='cre'){if(type==='up'&&TCH.pend){TCH.pend=0;creDown(TCH.e)}TCH.pend=0;creEnd()}
 else if(k==='bld'){if(type==='up'&&bmode){if(bmode==='demo')demoAt(BPIN.x,BPIN.z);else placeBuild()}BPIN.on=0}
 return true}
function thCancel(){if(TCH.kind==='cre'&&CRV.stroke){const st=CRV.stroke;CRV.stroke=null;creRevert(st)}TCH.id=null;TCH.kind=null;TCH.pend=0;BPIN.on=0}
function bldPin(e){const g=groundAt(e.clientX,e.clientY);if(g){BPIN.on=1;BPIN.x=g[0];BPIN.z=g[1]}}
function demoAt(x,z){let b=null,bd=2.8;for(const s of structs){if(!canDemo(s)||!!s.in!==!!INT.on)continue;const q=sdef(s),d=dist(x,z,s.x,s.z)-Math.max(q.bx,q.bz)*.6;if(d<bd){bd=d;b=s}}
 if(!b){toast('누른 곳에 철거할 내 건물이 없어요');return}if(dist(P.x,P.z,b.x,b.z)>16){toast('너무 멀어요. 조금 더 가까이 가요');return}
 const px=P.x,pz=P.z;P.x=b.x;P.z=b.z;try{placeBuild()}finally{P.x=px;P.z=pz}}   /* 철거 자체는 placeBuild(철거 모드)가 그대로(멀티 포함) */
{const _u=updPlayer;updPlayer=function(dt){if(TCH.pend&&performance.now()>=TCH.pend){TCH.pend=0;if(TCH.kind==='cre')creDown(TCH.e)}_u(dt)}}
/* ----- 크리에이티브 블록 ----- */
const CRV={on:false,col:0,mode:'add',map:new Map(),keys:[],mesh:null,cap:0,mat:null,undo:[],stroke:null,db:null,dbTried:false,saveT:0,saving:false,again:false,st:'',at:0,bar:null,clrArm:0,inited:false};
const CRV_COL=[[0xf0e6d0,'크림'],[0xb06c36,'나무'],[0x858c93,'돌'],[0xc93c36,'빨강'],[0x479a43,'초록'],[0x2f7cc8,'파랑']],CRV_MAX=12000;
const crvKey=(x,z,k)=>x+','+z+','+k;
function crvMat(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);g.strokeStyle='rgba(40,24,12,.32)';g.lineWidth=5;g.strokeRect(2.5,2.5,59,59);const t=new THREE.CanvasTexture(c);return new THREE.MeshLambertMaterial({map:t})}
function crvRebuild(){const n=CRV.map.size;if(!CRV.mat)CRV.mat=crvMat();if(!CRV.mesh||CRV.cap<n){const cap=Math.max(256,Math.ceil(n*1.5));if(CRV.mesh)scene.remove(CRV.mesh);const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),CRV.mat,cap);m.frustumCulled=false;m.renderOrder=2;scene.add(m);CRV.mesh=m;CRV.cap=cap}
 const m=CRV.mesh,M=new THREE.Matrix4(),C=new THREE.Color();let i=0;CRV.keys.length=0;for(const [key,c] of CRV.map){const [x,z,k]=key.split(',').map(Number);M.makeTranslation(x+.5,k+.5,z+.5);m.setMatrixAt(i,M);C.setHex((CRV_COL[c]||CRV_COL[0])[0]);m.setColorAt(i,C);CRV.keys[i]=key;i++}
 if(!i){m.setColorAt(0,C.setHex(0xffffff))}m.count=i;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.visible=DEV.on&&mode==='play'}
function crvRay(cx,cy){if(!CRV.mesh||!CRV.mesh.count)return null;_ray.setFromCamera({x:cx/innerWidth*2-1,y:-(cy/innerHeight)*2+1},cam);const h=_ray.intersectObject(CRV.mesh,false)[0];if(!h||h.instanceId==null||!CRV.keys[h.instanceId])return null;return {key:CRV.keys[h.instanceId],n:h.face.normal}}
const crvBase=(x,z)=>Math.floor(Math.max(groundY(x+.5,z+.5),0)+.35);
function creSet(key,c){if(c!=null&&!CRV.map.has(key)&&CRV.map.size>=CRV_MAX){toast(`블록은 ${CRV_MAX}개까지예요`);return}const prev=CRV.map.has(key)?CRV.map.get(key):null;if(prev===c)return;if(CRV.stroke)CRV.stroke.ops.push({key,prev,c});if(c==null)CRV.map.delete(key);else CRV.map.set(key,c);crvRebuild();sfx(c==null?300:640+Math.random()*80,.03,'triangle',.02)}
function creDown(ev){const h=crvRay(ev.clientX,ev.clientY);CRV.stroke={ops:[],k:null};if(CRV.mode==='del'){if(h)creSet(h.key,null);return}
 let x,z,k;if(h){[x,z,k]=h.key.split(',').map(Number);x+=Math.round(h.n.x);k+=Math.round(h.n.y);z+=Math.round(h.n.z)}
 else{const g=groundAt(ev.clientX,ev.clientY);if(!g)return;x=Math.floor(g[0]);z=Math.floor(g[1]);k=crvBase(x,z);while(CRV.map.has(crvKey(x,z,k)))k++}
 if(k<0||k>60)return;CRV.stroke.k=k;creSet(crvKey(x,z,k),CRV.col)}
function creDrag(ev){if(!CRV.stroke)return;if(CRV.mode==='del'){const h=crvRay(ev.clientX,ev.clientY);if(h)creSet(h.key,null);return}const k=CRV.stroke.k;if(k==null)return;
 _ray.setFromCamera({x:ev.clientX/innerWidth*2-1,y:-(ev.clientY/innerHeight)*2+1},cam);const o=_ray.ray.origin,d=_ray.ray.direction;if(Math.abs(d.y)<1e-4)return;const t=(k+.5-o.y)/d.y;if(t<0)return;   /* 같은 층(높이 k+0.5) 평면에서 칸을 찾아 줄지어 칠해요 */
 const key=crvKey(Math.floor(o.x+d.x*t),Math.floor(o.z+d.z*t),k);if(!CRV.map.has(key))creSet(key,CRV.col)}
function creEnd(){const st=CRV.stroke;CRV.stroke=null;if(st&&st.ops.length){CRV.undo.push(st);if(CRV.undo.length>300)CRV.undo.shift();creSaveSoon()}creBarUpd()}
function creRevert(st){for(let i=st.ops.length-1;i>=0;i--){const o=st.ops[i];if(o.prev==null)CRV.map.delete(o.key);else CRV.map.set(o.key,o.prev)}crvRebuild()}
function creUndo(){const st=CRV.undo.pop();if(!st){toast('되돌릴 것이 없어요');return}creRevert(st);sfx(420,.05);creSaveSoon();creBarUpd()}
function creClear(){if(!CRV.map.size)return;if(performance.now()-CRV.clrArm>2500){CRV.clrArm=performance.now();toast('🗑 한 번 더 누르면 블록을 모두 지워요 (↩로 되돌릴 수 있어요)');return}CRV.clrArm=0;const st={ops:[]};for(const [key,c] of CRV.map)st.ops.push({key,prev:c,c:null});CRV.map.clear();CRV.undo.push(st);crvRebuild();creSaveSoon();creBarUpd();toast('블록을 모두 지웠어요')}
function crvStr(){const a=[];for(const [key,c] of CRV.map){const [x,z,k]=key.split(',');a.push(x+'.'+z+'.'+k+'.'+c)}return a.join(';')}
function crvLoad(s){CRV.map.clear();if(s)for(const t of String(s).split(';')){const p=t.split('.').map(Number);if(p.length<4||p.some(isNaN))continue;CRV.map.set(crvKey(p[0],p[1],p[2]),p[3])}crvRebuild()}
function creSaveSoon(){clearTimeout(CRV.saveT);CRV.st='💾 저장 중…';creBarUpd();CRV.saveT=setTimeout(creSave,700)}
function creSave(){const s=crvStr(),at=Date.now();CRV.at=at;try{localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at,blocks:s}))}catch(e){}
 if(!CRV.db){CRV.st='📱 이 폰에 저장됨 · 📋로 복사해 보내기';creBarUpd();return}
 if(CRV.saving){CRV.again=true;return}CRV.saving=true;   /* 한 문서에는 한 번에 하나씩만 써요 */
 Promise.resolve().then(()=>CRV.db.doc('creative/main').set({v:1,at,n:CRV.map.size,blocks:s,px:Math.round(P.x),pz:Math.round(P.z)})).then(()=>{CRV.st='☁ 저장됨 · Claude가 볼 수 있어요'},err=>{CRV.st='📱 이 폰에만 저장(☁ 안 됨'+(err&&err.code?' · '+err.code:'')+')'}).then(()=>{CRV.saving=false;creBarUpd();if(CRV.again){CRV.again=false;creSave()}})}
function creInit(){if(CRV.inited)return;CRV.inited=true;try{const r=JSON.parse(localStorage.getItem('frontisle_blocks')||'null');if(r){CRV.at=r.at||0;crvLoad(r.blocks)}}catch(e){}crvRebuild();
 const cl=window.claude;if(!cl||typeof cl.use!=='function'){CRV.st='📱 이 폰에 저장됨 · 📋로 복사해 보내기';creBarUpd();return}CRV.dbTried=true;CRV.st='☁ 연결 중…';creBarUpd();
 const to=setTimeout(()=>{if(!CRV.db){CRV.st='📱 이 폰에만 저장(☁ 연결 안 됨)';creBarUpd()}},10000);
 Promise.resolve(cl.use('db')).then(d=>{if(!d){clearTimeout(to);CRV.st='📱 이 폰에 저장됨 · 📋로 복사해 보내기';creBarUpd();return}CRV.db=d;return d.doc('creative/main').get().then(sn=>{clearTimeout(to);const r=sn&&sn.exists?sn.data():null;
  if(r&&typeof r.blocks==='string'&&(r.at||0)>(CRV.at||0)){CRV.at=r.at;crvLoad(r.blocks);try{localStorage.setItem('frontisle_blocks',JSON.stringify({v:1,at:r.at,blocks:r.blocks}))}catch(e){}toast(`☁ 저장된 블록 ${CRV.map.size}개를 불러왔어요`)}
  else if(CRV.map.size&&!(r&&(r.at||0)>=(CRV.at||0)))creSave();   /* 이 폰에만 있던 것을 올려요 */
  CRV.st='☁ 연결됨';creBarUpd()})}).catch(err=>{clearTimeout(to);CRV.st='📱 이 폰에만 저장(☁ 안 됨)';creBarUpd()})}
function creCopy(){const s='BLK1:'+crvStr(),n=CRV.map.size;const done=()=>toast(`📋 블록 ${n}개를 글로 복사했어요. 대화창에 붙여 보내도 돼요`);
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(done,()=>creCopyBox(s));else creCopyBox(s)}
function creCopyBox(s){let t=$('creCopyBox');if(!t){t=document.createElement('textarea');t.id='creCopyBox';t.style.cssText='position:fixed;left:5%;top:20%;width:90%;height:40%;z-index:80;font:12px monospace;border-radius:12px;padding:10px';t.onblur=()=>t.remove();document.body.appendChild(t)}t.value=s;t.focus();t.select();toast('글을 길게 눌러 복사해요. 다른 곳을 누르면 닫혀요')}
function creBar(){if(CRV.bar)return CRV.bar;const b=document.createElement('div');b.id='creBar';b.className='pn';b.style.cssText='position:absolute;z-index:6;padding:7px 9px;border-radius:16px;border-color:#4fc3ff;font-size:12.5px;font-weight:800';
 b.innerHTML='<div id="creTx" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 2px 6px"></div><div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">'+CRV_COL.map((c,i)=>`<button data-c="col" data-i="${i}" title="${c[1]}" style="width:28px;height:28px;border-radius:8px;border:3px solid #fff;background:#${c[0].toString(16).padStart(6,'0')};box-shadow:0 0 0 2px rgba(91,61,43,.25);padding:0"></button>`).join('')
  +'<span style="width:4px"></span>'+[['add','＋ 쌓기'],['del','－ 지우기'],['undo','↩'],['copy','📋'],['clr','🗑'],['off','✕']].map(([k,t])=>`<button class="btn g" data-c="${k}" style="min-height:32px;padding:4px 8px;font-size:12px;width:auto">${t}</button>`).join('')+'</div>';
 b.addEventListener('pointerdown',e=>{const t=e.target.closest('[data-c]');if(!t)return;e.preventDefault();e.stopPropagation();const c=t.dataset.c;
  if(c==='col'){CRV.col=+t.dataset.i;CRV.mode='add';sfx(700,.03)}else if(c==='add'||c==='del'){CRV.mode=c;sfx(600,.03)}else if(c==='undo')creUndo();else if(c==='copy')creCopy();else if(c==='clr')creClear();else if(c==='off')creOff();creBarUpd()});
 $('ui').insertBefore(b,$('shade'));CRV.bar=b;return b}
function creBarUpd(){const b=CRV.bar;if(!b)return;const show=CRV.on&&DEV.on&&mode==='play';b.style.display=show?'':'none';if(!show)return;const port=VW<=VH;Object.assign(b.style,port?{left:'12px',right:'12px',top:'58px',transform:'none'}:{left:'50%',right:'',top:'8px',transform:'translateX(-50%)'});
 $('creTx').textContent=`🧱 크리에이티브 · 블록 ${CRV.map.size}개 · ${CRV.mode==='del'?'지우기':'쌓기'} · ${CRV.st}`;
 b.querySelectorAll('[data-c=col]').forEach(x=>x.style.boxShadow=+x.dataset.i===CRV.col&&CRV.mode==='add'?'0 0 0 3px #5B3D2B':'0 0 0 2px rgba(91,61,43,.25)');
 b.querySelectorAll('[data-c=add],[data-c=del]').forEach(x=>x.classList.toggle('on',x.dataset.c===CRV.mode));b.querySelectorAll('[data-c=add],[data-c=del]').forEach(x=>{x.style.background=x.dataset.c===CRV.mode?'var(--brn)':'';x.style.color=x.dataset.c===CRV.mode?'#fff':''})}
function creOn(){if(!DEV.on){toast('관리자 모드에서만 돼요');return}creInit();creBar();CRV.on=true;setBuild(null);crvRebuild();creBarUpd();devHud();toast('🧱 땅이나 블록 윗면·옆면을 누르면 쌓여요 · 누른 채 끌면 줄지어 · 조이스틱으로 걸으며 해요')}
function creOff(){CRV.on=false;creEnd();creBarUpd();devHud()}
{const _d=devInit;devInit=function(){_d();const row=devBar.querySelector('div[style*="flex-wrap"]');if(!row)return;const b=document.createElement('button');b.className='btn g';b.id='devCre';b.style.cssText='min-height:38px;padding:8px 10px;font-size:13px;width:auto;border:2px solid #4fc3ff';b.textContent='🧱 크리에이티브';row.appendChild(b);
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(CRV.on)creOff();else creOn()})}}
{const _h=devHud;devHud=function(){_h();const b=$('devCre');if(b)b.textContent=CRV.on?'🧱 크리에이티브 끄기':'🧱 크리에이티브';if(!DEV.on&&CRV.on){CRV.on=false}if(CRV.mesh)CRV.mesh.visible=DEV.on&&mode==='play';creBarUpd()}}
{const _h=hud;hud=function(){_h();if(DEV.on&&mode==='play'&&!CRV.inited&&!CRV.chk){CRV.chk=1;let has=false;try{has=!!localStorage.getItem('frontisle_blocks')}catch(e){}if(has)creInit()}if(CRV.mesh){const v=DEV.on&&mode==='play';if(CRV.mesh.visible!==v)CRV.mesh.visible=v}}}   /* 관리자 모드면 저장된 블록을 보여 줘요 */
{const _r=resize;resize=function(){_r();creBarUpd()}}
{const _f=findTarget;findTarget=function(){return CRV.on&&DEV.on?null:_f()}}   /* 크리에이티브 중에는 상호작용 글자·대상 없음 */
/* ===== 34차(기획자 11-19 22:01) =====
   ① 가방 버튼(🎒)은 오른쪽 아래 구석: 큰 버튼이 없어져서 가운데쯤 떠 있던 것을 조이스틱과 마주 보게(아래 줄을 조이스틱과 맞춤).
   ② 조이스틱이 아닌 곳을 눌러도 캐릭터가 걸어가지 않아요(actors.js worldTap, P.auto를 만드는 곳 없음). ③ 상호작용은 바짝 붙어야(actors.js TREACH). */
{const css=document.createElement('style');css.textContent='#ui #bBag{right:28px;bottom:30px;width:70px;height:70px}#ui.port #bBag{right:22px;bottom:58px}';document.head.appendChild(css)}
/* ===== 36차(기획자 11-19 22:09: '보급 상자 같은 것들 전부 열자마자 바로 먹어지는 게 아니라, 열면 상자 스무 칸이 나오고 몇 개씩만 아이템이 나오게.
   아래는 모두 가져가기, 옆에는 내 인벤. 누르면 내 인벤으로 넘어오고, 한 번 넘어온 건 다시 상자로 못 넘어가고, 내 인벤이 가득 차면 눌러도 못 가져가게') =====
   보급 상자(loot 1)·보물 상자(2)·벙커(3, 수류탄으로 폭파)·특수 보급(4)을 열면 상자 창(panel 'box'): 왼쪽 상자 20칸(들어 있는 것만 무작위 칸에) + 오른쪽 내 가방 20칸.
   상자 칸을 누르면 그 묶음이 통째로 내 가방으로(동전은 칸을 안 차지해요). 내 가방 칸을 눌러도 상자로는 안 가요. 가방이 꽉 차면(새 종류가 들어갈 칸이 없으면) 안 가져와져요.
   남은 것은 상자에 그대로(S.box[li] = {d:연 날, c:20칸}, 저장됨) → 다시 열면 그대로. 다 비우면 창이 닫히고, 예전처럼 며칠 뒤(보급 3일·벙커 5일·특수 5일) 새로 채워져요. */
const BOX={s:null,msg:''};
const boxCd=s=>{const d=sdef(s);return d.loot===3?5:(d.cd||3)};
function boxGet(s){if(!S.box)S.box={};const b=S.box[s.li];if(b&&S.day-b.d>=boxCd(s)){delete S.box[s.li];return null}return b||null}
const boxLeft=b=>b?b.c.filter(Boolean).length:0;
const boxName=s=>({supply:'📦 보급 상자',chest:'🧰 보물 상자',bunker:'🛡 벙커',spsupply:'⭐ 특수 보급 상자'})[s.t]||'📦 상자';
function boxOpen(s){const d=sdef(s);let b=boxGet(s);
 if(!b||!boxLeft(b)){if(S.looted[s.li]&&S.day-S.looted[s.li]<boxCd(s)){toast('비어 있어요. 며칠 뒤 다시 채워져요');return}
  if(d.loot===3){if(!take('grenade',1)){toast('벙커 문이 잠겨 있어요. 수류탄 1개가 있으면 폭파할 수 있어요');return}S.st.bunk++;boom(s.x+Math.sin(s.r)*2,groundY(s.x,s.z)+1,s.z+Math.cos(s.r)*2,3);shake=.7}
  const got=lootGen(s),c=Array(20).fill(null),free=[...Array(20).keys()];
  for(const k in got){if(!(got[k]>0)||!free.length)continue;const j=free.splice(Math.random()*free.length|0,1)[0];c[j]=[k,got[k]]}
  b=S.box[s.li]={d:S.day,c};S.looted[s.li]=S.day;
  if((d.loot===1||d.loot===4)&&s.m&&s.m.children[0])s.m.children[0].geometry=GEO[d.og||'crate_open'];if(d.loot===4&&s.lk&&s.lk.parts&&s.lk.parts.glow)s.lk.parts.glow.visible=false;
  P.a.play('PickUp',{once:1,lock:.5,force:1});jingle(d.loot===4?[659,880,1175]:[659,880]);save()}
 else sfx(520,.05,'sine',.03);
 BOX.s=s;BOX.msg='';openPanel('box')}
function boxTake(i){const b=BOX.s&&boxGet(BOX.s),e=b&&b.c[i];if(!e)return 0;const[k,n]=e;
 if(k!=='coin'){if(ITEMS[k].one&&invN(k)){BOX.msg=`${jo(ITEMS[k].n,'은','는')} 이미 가지고 있어요`;return 0}if(!bagHas(k)){BOX.msg='🎒 가방이 꽉 찼어요 — 팔거나 버려서 칸을 비워요';sfx(240,.06,'square',.03);return 0}}
 b.c[i]=null;give(k,n);ftext(P.x,groundY(P.x,P.z)+2.3,P.z,`+${n} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffe08a');hudDirty=true;return 1}
function boxAfter(){const b=BOX.s&&boxGet(BOX.s),nm=BOX.s?boxName(BOX.s):'상자';save();if(!boxLeft(b)){closePanel();toast(`${jo(nm,'을','를')} 다 비웠어요`);jingle([523,784]);return}renderPanel()}
function boxHtml(){const s=BOX.s,b=s&&boxGet(s);if(!b)return'';const num=(k,n)=>k==='coin'||!ITEMS[k].one?`<b>${n}</b>`:'';
 const box=b.c.map((e,i)=>e?`<div class="slot" data-a="boxget" data-i="${i}">${invIcon(e[0])}${num(e[0],e[1])}</div>`:'<div class="slot bxe"></div>').join('');
 const ks=bagList(),mine=Array.from({length:Math.max(BAG_N,ks.length)},(_,i)=>{const k=ks[i];return k?`<div class="slot" data-a="boxmine" data-k="${k}">${invIcon(k)}${num(k,S.inv[k])}</div>`:'<div class="slot bxe"></div>'}).join('');
 return `<div class="bx2"><div><div class="sec">${boxName(s)} · 누르면 내 가방으로</div><div class="grid bxg">${box}</div></div><div><div class="sec">🎒 내 가방 ${ks.length}/${BAG_N}</div><div class="grid bxg mine">${mine}</div></div></div>`+
  `<div class="bxf"><span class="bxm">${BOX.msg}</span><button class="btn" data-a="boxall"${boxLeft(b)?'':' disabled'}>모두 가져가기</button></div>`}
/* 상자 창 칸 크기: 창 안에 두 칸판(가로: 나란히, 세로: 위아래)과 [모두 가져가기]가 스크롤 없이 다 들어가게 */
function boxFit(){const B=$('pbody'),g=[...B.querySelectorAll('.bxg')];if(g.length<2)return;const port=VW<=VH,cs=getComputedStyle(B),pv=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),ph=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
 const gh=port?g[0].offsetHeight+g[1].offsetHeight:g[0].offsetHeight,bx=B.querySelector('.bx2'),bf=B.querySelector('.bxf'),extra=bx.offsetHeight+bf.offsetHeight+parseFloat(getComputedStyle(bf).marginTop)-gh+pv,rows=(port?(B.clientHeight-extra)/2:B.clientHeight-extra)-2,colW=port?B.clientWidth-ph:(B.clientWidth-ph-16)/2;
 const sz=Math.max(38,Math.floor(Math.min((rows-18)/4,(colW-24)/5,74)));for(const q of g){q.style.width=(5*sz+24)+'px';q.style.gridTemplateColumns=`repeat(5,${sz}px)`}}
{const css=document.createElement('style');css.textContent='#pbody .bx2{display:grid;grid-template-columns:1fr 1fr;gap:16px}#ui.port #pbody .bx2{grid-template-columns:1fr;gap:6px}'+
 '#pbody .bxg{grid-template-columns:repeat(5,1fr);gap:6px}#pbody .bxg .slot{width:auto;height:auto;aspect-ratio:1}#pbody .bxg .slot.bxe{opacity:.5}#pbody .bxg.mine .slot{opacity:.92}'+
 '#pbody .bxf{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:10px}#pbody .bxm{flex:1;color:var(--red);font-weight:800;font-size:13px}';document.head.appendChild(css)}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel!=='box')return;if(!BOX.s||!boxGet(BOX.s)){closePanel();return}$('ptabs').innerHTML=`<div class="tab on">${boxName(BOX.s)}</div>`;$('pbody').innerHTML=boxHtml();boxFit()}}
{const _c=closePanel;closePanel=function(){_c();BOX.s=null;BOX.msg=''}}
{const _l=layoutPanel;layoutPanel=function(){_l();if(panel==='box'&&VW<=VH)$('panel').style.height=(VH-24)+'px'}}   /* 세로 화면은 상자 창을 길게 써서 칸을 크게 */
$('pbody').addEventListener('click',e=>{if(panel!=='box')return;const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
 if(a==='boxget'){if(boxTake(+b.dataset.i)){BOX.msg='';sfx(660,.05,'sine',.03)}boxAfter()}
 else if(a==='boxall'){const bx=boxGet(BOX.s);let got=0,left=0;if(bx)for(let i=0;i<20;i++)if(bx.c[i]){if(boxTake(i))got++;else left++}if(got)sfx(700,.06,'sine',.03);if(left)BOX.msg=`${BOX.msg.startsWith('🎒')?'🎒 가방이 꽉 차서':'가져오지 못한 것'} ${left}가지가 남았어요`;boxAfter()}
 else if(a==='boxmine'){BOX.msg='가방에 넣은 건 상자로 다시 옮길 수 없어요';renderPanel()}});
/* 상자에 남은 게 있으면 며칠 안이라도 [열기]. 바로 먹던 예전 열기(actors.js·places.js)보다 먼저 상자 창을 열어요 */
{const _sl=sLabel;sLabel=function(s){const d=sdef(s);if(d.loot&&s.li!=null&&boxLeft(boxGet(s)))return'열기';return _sl(s)}}
{const _ia=interact;interact=function(){const t=target;if(t&&t.k==='s'&&sdef(t.s).loot){if(inp.actEdge)boxOpen(t.s);return}_ia()}}
/* ===== 38차(기획자 11-19 22:57: '가방을 누르면 캐릭터가 왼쪽으로 바뀌잖아 그냥 그대로 해', '가방에서 아래로 스크롤 기능 빼고 아래 문구 같은 거 없애고 그냥 칸만',
   '가방 누르고 위쯤 한쪽은 인벤토리 한쪽은 도감, 눌렀을 때 넘어가게', '도감 누르면 물고기 도감·요리 도감·식물 도감·사냥 도감, 그리고 설계도라는 품목') =====
   ① 가방을 열어도 카메라가 옮겨지지 않아요(bagView 끔). ② 인벤토리 = 20칸만(아래 정보·안내 글 없음, 칸 크기를 창에 맞춰 스크롤 없음).
      재료처럼 바로 쓸 수 없는 것을 누르면 이름·설명을 알림으로. ③ 창 위 탭 [🎒 인벤토리 N/20 | 📖 도감]. ④ 도감 안에 [물고기·요리·식물·사냥·설계도].
      요리 도감 = 모닥불에서 만든 요리(S.cdex), 사냥 도감 = 쓰러뜨린 적 종류(S.hdex). 설계도는 기획자가 설명해 줄 때까지 '준비 중'. */
const BAGT={t:'inv',d:'fish'};
bagView=function(){if(cam.view&&cam.view.enabled)cam.clearViewOffset();BV.x=BV.y=0};
{const _o=openPanel;openPanel=function(k){if(k==='bag'&&panel!=='bag')BAGT.t='inv';_o(k)}}
const DEXT=[['fish','🐟 물고기'],['cook','🍳 요리'],['plant','🌱 식물'],['hunt','🏹 사냥'],['bp','📜 설계도']];
const HUNT_IC={bandit:'🗡',gunner:'🎯',rgolem:'🪨',wgolem:'🌳',wraith:'👻',plant:'🌿',brute:'💀'};
const dexCard=(img,on,name,sub,col,tag)=>`<div style="text-align:center;font-size:11.5px;line-height:1.3;font-weight:700"><div class="slot" style="width:58px;height:58px;margin:0 auto 3px;${col?'border-color:'+col:''}">${img}</div>${tag||''}<div>${on?name:'???'}</div><div style="color:var(--mut);font-weight:600;font-size:10.5px">${sub||''}</div></div>`;
const dexGrid=h=>`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px 4px">${h}</div>`;
function fishDexHtml(){const n=FISH_LIST.filter(f=>S.caught[f.id]).length;return `<div class="sec">물고기 도감 ${n} / ${FISH_LIST.length}</div>`+['B','A'].map(zk=>`<div style="font-weight:800;font-size:12px;margin:6px 2px 4px">${zk==='A'?'🗼':'🏝'} ${FISH_ZONES[zk].n}</div>`+dexGrid(FISH_LIST.filter(f=>FISH_ZONES[zk].t.some(q=>q[0]===f.id)).map(f=>{const c=S.caught[f.id],G=FGRADE[f.g];
  return dexCard(`<img src="${ICON[f.id]}" style="${c?'':'filter:brightness(0) opacity(.35)'}">`,c,f.n,c?`최대 ${S.best[f.id]||0}cm`:'',G[1],`<span style="display:inline-block;background:${G[1]};color:#fff;border-radius:9px;padding:0 6px;font-size:10px;font-weight:800">${G[0]}</span>`)}).join(''))).join('')}
function cookDexHtml(){if(!S.cdex)S.cdex={};const L=FISH_LIST.map(f=>'c'+f.id).filter(id=>ITEMS[id]),n=L.filter(id=>S.cdex[id]).length;
 return `<div class="sec">요리 도감 ${n} / ${L.length}</div><div style="color:var(--mut);font-size:11.5px;font-weight:700;margin:0 2px 6px">모닥불에서 생선을 구우면 올라가요</div>`+dexGrid(L.map(id=>{const c=S.cdex[id];return dexCard(`<img src="${ICON[id]||''}" style="${c?'':'filter:brightness(0) opacity(.35)'}">`,c,ITEMS[id].n,c?`만든 수 ${c}`:'')}).join(''))}
function huntDexHtml(){if(!S.hdex)S.hdex={};const L=Object.keys(ENEMY),n=L.filter(k=>S.hdex[k]).length;
 return `<div class="sec">사냥 도감 ${n} / ${L.length}</div>`+dexGrid(L.map(k=>{const c=S.hdex[k];return dexCard(`<span style="font-size:30px;line-height:58px;${c?'':'filter:grayscale(1) brightness(.4);opacity:.5'}">${HUNT_IC[k]||'❔'}</span>`,c,ENEMY[k].n,c?`쓰러뜨림 ${c}`:'')}).join(''))}
function bpDexHtml(){return `<div class="sec">설계도</div><div class="row" style="justify-content:center;min-height:120px;color:var(--mut);font-weight:800">📜 설계도는 준비 중이에요</div>`}
function dexHtml(){const d=BAGT.d;return `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">${DEXT.map(([k,l])=>`<button class="btn ${k===d?'':'g'}" data-a="dext" data-k="${k}" style="padding:6px 10px;font-size:12.5px">${l}</button>`).join('')}</div>`+
 (d==='fish'?fishDexHtml():d==='cook'?cookDexHtml():d==='plant'?(typeof plantDexHtml==='function'?plantDexHtml():''):d==='hunt'?huntDexHtml():bpDexHtml())}
function bagFit(){const B=$('pbody'),g=B.querySelector('.grid');if(!g)return;const cs=getComputedStyle(B),pv=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),ph=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),n=g.children.length,rows=Math.ceil(n/5),gap=7;
 let extra=0;for(const x of B.children)if(x!==g)extra+=x.offsetHeight;const sz=Math.max(34,Math.floor(Math.min((B.clientWidth-ph-4*gap)/5,(B.clientHeight-pv-extra-(rows-1)*gap-2)/rows,90)));
 g.style.gridTemplateColumns=`repeat(5,${sz}px)`;g.style.justifyContent='center';for(const c of g.children){c.style.width=sz+'px';c.style.height=sz+'px';c.style.aspectRatio=''}}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel!=='bag'){$('pbody').style.overflowY='';return}const B=$('pbody');
  $('ptabs').innerHTML=`<div class="tab ${BAGT.t==='inv'?'on':''}" data-a="btab" data-k="inv">🎒 인벤토리 ${bagList().length}/${BAG_N}</div><div class="tab ${BAGT.t==='dex'?'on':''}" data-a="btab" data-k="dex">📖 도감</div>`;
  if(BAGT.t==='dex'){B.innerHTML=dexHtml();B.style.overflowY='auto';return}
  const g=B.querySelector('.grid');for(const x of [...B.children])if(x!==g&&!(x.textContent||'').includes('넘쳤어요'))x.remove();B.style.overflowY='hidden';bagFit()}}
{const _c=closePanel;closePanel=function(){_c();$('pbody').style.overflowY=''}}
$('ptabs').addEventListener('click',e=>{const t=e.target.closest('[data-a="btab"]');if(!t||panel!=='bag')return;BAGT.t=t.dataset.k;selItem=null;sfx(600,.03);renderPanel()});
$('pbody').addEventListener('click',e=>{const t=e.target.closest('[data-a="dext"]');if(!t||panel!=='bag')return;BAGT.d=t.dataset.k;sfx(600,.03);renderPanel()});
{const _rs=resize;resize=function(){_rs();if(panel==='bag'&&BAGT.t==='inv')setTimeout(bagFit,0)}}
/* 재료처럼 바로 쓸 수 없는 것을 누르면 이름·설명을 알림으로(아래 정보 글을 없앴으니까) */
{const _bt=bagTap;bagTap=function(k){const it=ITEMS[k];_bt(k);if(it&&invN(k)&&!['kit','food','heal','fish','gun','tool','throw'].includes(it.ty))toast(`${it.n}${it.one?'':' ×'+invN(k)}${it.d?' — '+it.d:''}`)}}
/* 요리 도감·사냥 도감 기록 */
{let c0=0;$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="cook"]');if(b)c0=S.st.cook},true);
 $('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="cook"]');if(!b)return;const d=S.st.cook-c0;if(d>0){if(!S.cdex)S.cdex={};const id='c'+b.dataset.k;const first=!S.cdex[id];S.cdex[id]=(S.cdex[id]||0)+d;if(first)toast(`🍳 새 요리: ${ITEMS[id].n}! 가방의 요리 도감에 올렸어요`)}})}
{const _k=killEnemy;killEnemy=function(e){const was=e.dead;_k(e);if(!was&&e.dead&&e.kind){if(!S.hdex)S.hdex={};S.hdex[e.kind]=(S.hdex[e.kind]||0)+1}}}
/* ===== 39차(기획자 11-19 22:57): 텐트 '내 구역' 표시 =====
   규칙·크기는 core.js ZONE·zoneRect·zoneIn·zoneOverlap, 설치·철거 막기는 actors.js zoneWhy·canDemo, 서버도 같은 규칙(server.js b·rb).
   ① 텐트·집마다 구역 네 모서리에 '못 박은 말뚝' + 모서리 꺾쇠(바닥 줄 두 개)가 늘 보여요(내 것 초록, 남의 텐트 주황, 남의 집 빨강).
   ② 설치 모드에선 구역 테두리 전체가 보여요: 텐트를 들고 있으면 놓을 자리의 구역(놓을 수 있으면 초록, 아니면 빨강)과 둘레 구역들. */
const ZMK={mats:{},geo:{},pre:null};
const ZCOL={me:0x1f9a3a,tent:0xe07a00,house:0xd23a28,bad:0xd23a28};const zoneCol=s=>s.own?ZCOL.me:s.t==='phouse'?ZCOL.house:ZCOL.tent;
/* 41차(기획자 11-20 20:10: '그 선 표시는 지워 버려, 설치되었으면 그냥 꼭짓점만, 꼭짓점 못 같은 거나 입체 같은 거 너무 티 나게 하지 말고'):
   말뚝·꺾쇠 줄·설치 모드 테두리를 없애고, 네 모서리에 땅에 붙은 얇은 ㄱ자 표시만(반투명). 텐트를 들고 있을 땐 놓을 자리의 네 모서리만 조금 또렷하게(초록/빨강). */
function zmMat(c,o){const k=c+'/'+o;return ZMK.mats[k]||(ZMK.mats[k]=(()=>{const m=new THREE.MeshBasicMaterial({fog:false,transparent:true,opacity:o,depthWrite:false});m.color.setHex(c).convertSRGBToLinear();return m})())}   /* 빛·안개를 안 받아서 색이 그대로 */
function zoneCornerGeo(big){const k=big?'b':'s';if(ZMK.geo[k])return ZMK.geo[k];const L=big?1.15:.8,W=big?.15:.11,H=.02,y=.04;   /* 모서리에서 안쪽(+x, +z)으로 짧은 두 팔, 겹치지 않게 */
 return ZMK.geo[k]=mg([pt(box(L+W/2,H,W),0xffffff,[(L-W/2)/2,y,0]),pt(box(W,H,L-W/2),0xffffff,[0,y,(L+W/2)/2])])}
const ZCOL_SOFT={[ZCOL.me]:0xeefbe6,[ZCOL.tent]:0xffc27a,[ZCOL.house]:0xff8a72};   /* 놓인 구역 표시는 옅은 색(내 것은 거의 흰색 — 잔디 위에서 은은하게 보이게) */
const ZC_ROT=[0,-Math.PI/2,Math.PI,Math.PI/2];   /* 뒤 왼쪽·뒤 오른쪽·앞 오른쪽·앞 왼쪽 모서리: 팔이 안쪽을 보게 */
const zcY=(x,z,r,i)=>{const a=r+ZC_ROT[i],c=Math.cos(a),n=Math.sin(a);let y=groundY(x,z);for(const[u,v]of[[.8,0],[0,.8]]){const px=x+u*c+v*n,pz=z-u*n+v*c;y=Math.max(y,groundY(px,pz))}return Math.max(y,-.05)};   /* 팔 끝까지 땅에 묻히지 않게 */
function zoneMark(s){zoneUnmark(s);if(!isZoneT(s.t)||s.in)return;const q=zoneRect(s.x,s.z,s.r),g=new THREE.Group(),cs=zoneCorners(q),geo=zoneCornerGeo(0),mat=zmMat(ZCOL_SOFT[zoneCol(s)]||0xffffff,.62);
 cs.forEach(([x,z],i)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,zcY(x,z,q.r,i),z);m.rotation.y=q.r+ZC_ROT[i];m.renderOrder=3;g.add(m)});scene.add(g);s.zg=g}
function zoneUnmark(s){if(s.zg){scene.remove(s.zg);s.zg=null}}
{const _a=addStruct;addStruct=function(o){const s=_a(o);if(s&&isZoneT(s.t)&&!s.in)zoneMark(s);return s}}
{const _r=removeStruct;removeStruct=function(s){zoneUnmark(s);_r(s)}}
/* 텐트를 들고 있을 때: 놓을 자리 구역의 네 모서리만 */
function zoneEdgesUpd(){const on=!!bmode&&bmode!=='demo'&&!INT.on&&mode==='play';
 const pre=on&&isZoneT(bmode)&&ghost&&ghost.userData.g;if(pre){const gg=ghost.userData.g;if(!ZMK.pre){ZMK.pre=new THREE.Group();const geo=zoneCornerGeo(1);
   ZMK.pre.userData.pegs=[0,1,2,3].map(i=>{const m=new THREE.Mesh(geo,zmMat(ZCOL.me,.9));m.renderOrder=3;ZMK.pre.add(m);return m});scene.add(ZMK.pre)}
  const q=zoneRect(gg.x,gg.z,gg.r),mat=zmMat(gg.ok?ZCOL.me:ZCOL.bad,.9);ZMK.pre.visible=true;
  zoneCorners(q).forEach(([x,z],i)=>{const m=ZMK.pre.userData.pegs[i];m.material=mat;m.position.set(x,zcY(x,z,q.r,i),z);m.rotation.y=q.r+ZC_ROT[i]})}
 else if(ZMK.pre)ZMK.pre.visible=false}
{const _u=updNoBuild;updNoBuild=function(){_u();zoneEdgesUpd()}}
/* 텐트를 치면 구역 안내 */
{const _p=placeBuild;placeBuild=function(){const t=bmode,n=structs.length;_p();if(isZoneT(t)&&structs.length>n){const s=structs[structs.length-1];if(s&&s.t===t&&s.own)toast(`🏕 텐트를 쳤어요! 둘레 ${+(ZONE.hw*2).toFixed(1)}×${+(ZONE.back+ZONE.front).toFixed(1)}m가 내 구역이에요 (네 모서리 표시)`)}}}
/* ===== 41차(기획자 11-20 20:10: '브롤스타즈처럼 조이스틱 두 개, 오른쪽은 에임 조절한 상태에서 쏠 수 있게. 도끼·전기톱 같은 근접 무기는 조이스틱을 끝까지 땡기면 계속 작동,
   원거리 무기는 전부 조준한 상태에서 떼야 나가게, 낚싯대는 그냥 클릭, 다른 데를 아무리 눌러도 상호작용이 되면 안 돼, 평소에는 조준 못 하게, 상호작용은 오른쪽 조이스틱 가운데 클릭 한 번') =====
   ① 왼쪽 조이스틱 = 걷기(그대로). 오른쪽 아래 = 쓰기 조이스틱(#rjoy, 고정). 그 둘 말고 화면을 눌러도 아무 일도 없어요(설치 모드의 누른 곳 설치·크리에이티브·두 손가락 확대만 그대로).
   ② 오른쪽 가운데를 톡 = 가까운 대상과 상호작용(설치 모드면 설치). 맨손·도구·음식 등을 들었을 땐 조준이 없어요(끌어도 손잡이가 안 움직여요). 맨손 톡에 대상이 없고 적이 가까우면 주먹 한 번.
   ③ 총·석궁·수류탄: 끌면 땅에 조준 표시 → 떼면 그쪽으로 한 번(수류탄은 끈 길이만큼 3~14m). 가운데(28% 안)로 돌아와서 떼면 취소. 톡만 하면 상호작용만(쏘지 않아요).
   ④ 손도끼·전기톱: 끌면 휘두를 쪽 표시, 끝까지(90%) 당기고 있는 동안 계속 휘둘러요(앞에 적이 없으면 앞의 나무·바위를 베요). 톡 = 상호작용(적이 가까우면 한 번 휘두름).
   ⑤ 낚싯대: 누르기 = 던지기·챔질, 누르고 있으면 감기(예전 큰 버튼과 같음), 조준 없음. 배 앞이면 톡 = 배 타기. */
const RJ={id:null,ox:0,oy:0,md:null,mv:0,k:0,aim:0,full:0,mf:0,ax:0,az:1,q:null,rel:0,ic:'',hintT:0};
const RJ_DZ=.28,RJ_FULL=.9;
function rjEl(){let j=$('rjoy');if(!j){j=document.createElement('div');j.id='rjoy';j.innerHTML='<i><b></b></i>';$('joy').parentNode.appendChild(j)}return j}
{const css=document.createElement('style');css.textContent=
 '#rjoy{position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(251,244,230,.12),rgba(251,244,230,.32));border:3px solid rgba(251,244,230,.85);pointer-events:none;transition:border-color .15s}'+
 '#rjoy i{position:absolute;left:43px;top:43px;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 38% 30%,#FFFDF8,#EAD8B6);box-shadow:0 4px 0 #CDB085,0 8px 14px rgba(40,24,12,.3);display:flex;align-items:center;justify-content:center}'+
 '#rjoy b{font-size:29px;line-height:1;font-style:normal}#rjoy.dim b{opacity:.38}#rjoy.w{border-color:rgba(224,83,63,.9)}#rjoy.full i{background:radial-gradient(circle at 38% 30%,#FFE9C9,#F2A65A)}#rjoy.on i{filter:brightness(.94)}'+
 '#ui #bBag{right:74px;bottom:196px}#ui.port #bBag{right:62px;bottom:224px}';   /* 가방 버튼은 오른쪽 조이스틱 위로 */
 document.head.appendChild(css)}
function rjC(){const r=rjEl().getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.width/2]}
function rjMode(){if(bmode)return'build';const id=curId(),w=WEAP[id]||{};if(w.rod)return fishing||!(target&&target.lab)?'rod':'act';if(w.ammo||w.nade)return'aim';if(w.melee&&id!=='fist')return'melee';return'tap'}
function rjKnob(dx,dy){const i=rjEl().firstChild;i.style.transform=dx||dy?`translate(${dx/UIS}px,${dy/UIS}px)`:''}
function rjDown(e){if(RJ.id!==null||P.dead||rjEl().style.visibility==='hidden')return false;const[cx,cy,r]=rjC();if(Math.hypot(e.clientX-cx,e.clientY-cy)>r*1.3)return false;
 Object.assign(RJ,{id:e.pointerId,ox:e.clientX,oy:e.clientY,md:rjMode(),mv:0,k:0,aim:0,full:0});   /* 누른 자리에서부터 끌어요(가장자리를 눌러도 바로 조준되지 않게) */
 if(RJ.md==='rod'){inp.fire=true;inp.aiming=false}rjEl().classList.add('on');return true}
function rjMove(e){if(e.pointerId!==RJ.id)return;let dx=e.clientX-RJ.ox,dy=e.clientY-RJ.oy;const l=Math.hypot(dx,dy),M=44*UIS;RJ.mv=Math.max(RJ.mv,l);
 if(RJ.md!=='aim'&&RJ.md!=='melee')return;   /* 평소(맨손·도구·낚싯대·설치)에는 조준이 없어요 */
 RJ.k=Math.min(1,l/M);if(RJ.k>=RJ_DZ){RJ.aim=1;RJ.ax=dx/(l||1);RJ.az=dy/(l||1)}else RJ.aim=0;if(l>M){dx*=M/l;dy*=M/l}RJ.full=RJ.md==='melee'&&RJ.k>=RJ_FULL;rjEl().classList.toggle('full',!!RJ.full);rjKnob(dx,dy)}
function rjHint(t){const n=performance.now();if(n<RJ.hintT)return;RJ.hintT=n+6000;toast(t)}
function rjUp(e){if(e.pointerId!==RJ.id)return;const up=e.type==='pointerup',md=RJ.md,tap=up&&RJ.mv<=14*UIS+6,aimed=RJ.aim,full=RJ.full,w=WEAP[curId()]||{};
 RJ.id=null;RJ.aim=0;RJ.full=0;rjKnob(0,0);rjEl().classList.remove('on','full');
 if(md==='rod'){inp.fire=false;return}
 if(full)return;   /* 계속 휘두르기는 손을 떼면 멈춰요(아래 updPlayer 감싸기) */
 if(md==='aim'&&aimed){if(up)RJ.q={ax:RJ.ax,az:RJ.az,nade:!!w.nade,d:3+11*clamp((RJ.k-RJ_DZ)/(1-RJ_DZ),0,1),t:performance.now()+800};return}   /* 조준한 채로 떼면 한 번(쏠 준비가 덜 됐으면 0.8초까지 기다렸다 쏴요) */
 if(!tap)return;   /* 끌다가 가운데로 돌아와 뗐으면 취소 */
 if(md==='build'){if(bmode)placeBuild();return}
 if(target&&target.lab){inp.act=true;inp.actEdge=true;RJ.rel=1;return}   /* 가운데 톡 = 상호작용 */
 if((md==='tap'&&curId()==='fist'||md==='melee')&&nearestEnemy(P.x,P.z,4)){RJ.q={hit:1,t:performance.now()+500};return}   /* 대상이 없고 적이 가까우면 한 번 치기 */
 if(md==='aim')rjHint(w.nade?'끌어서 던질 곳을 정하고 떼면 던져요':'끌어서 조준하고 떼면 쏴요');else if(md==='melee')rjHint('끝까지 당기고 있으면 계속 휘둘러요')}
function rjCancel(){if(RJ.id!==null&&(RJ.md==='rod'||RJ.mf)){inp.fire=false;inp.aiming=false}RJ.id=null;RJ.aim=RJ.full=RJ.mf=0;RJ.q=null;rjKnob(0,0);rjEl().classList.remove('on','full')}
{const _o=openPanel;openPanel=function(k){if(k!=='bag')rjCancel();return _o(k)}}
/* 놓는 자리: 왼쪽 조이스틱과 마주 보게. 42차(기획자: '가방 누를 때마다 오른쪽 조이스틱이 이상한 데 가'): 가방을 열어도 옮기지 않고, 가방에 가려지는 동안은 숨겨요 */
function rjFix(){const j=rjEl(),port=VW<=VH,side=sidePanel()&&mode==='play';Object.assign(j.style,{right:(port?22:34)+'px',bottom:(port?58:30)+'px',visibility:side?'hidden':''});if(side&&RJ.id!==null)rjCancel()}
{const _l=layoutPanel;layoutPanel=function(){_l();rjFix()}}
{const _c=closePanel;closePanel=function(){_c();rjFix()}}
{const _r=resize;resize=function(){_r();rjFix()}}
rjFix();
/* 손잡이 그림: 지금 누르면 무엇을 하는지 */
function rjIcon(){const j=rjEl(),md=RJ.id!==null?RJ.md:rjMode(),id=curId(),w=WEAP[id]||{};let ic='✋',dim=0;
 if(md==='build')ic='🔨';else if(md==='act')ic='✋';else if(md==='rod')ic='🎣';else if(RJ.id===null&&target&&target.lab)ic='✋';else if(md==='aim')ic=w.nade?'💣':'🎯';else if(md==='melee')ic=id==='chainsaw'?'🪚':'🪓';else dim=1;
 const k=ic+dim+(md==='aim'||md==='melee');if(k===RJ.ic)return;RJ.ic=k;j.firstChild.firstChild.textContent=ic;j.classList.toggle('dim',!!dim);j.classList.toggle('w',md==='aim'||md==='melee')}
/* 계속 휘두를 때 앞의 나무·바위(덤불 열매 따기는 톡으로) */
function rjObj(ax,az){const cx=(P.x/CELL)|0,cz=(P.z/CELL)|0;let best=null,bd=1e9;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const key=(cz+j)*CN+cx+i,o=objs.get(key);if(!o||o.re>0)continue;const T=OBJT[o.t];if(T.berry)continue;
 const dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz),gap=d-T.r;if(gap>TREACH+.5||(dx*ax+dz*az)/(d||1)<.35)continue;if(gap<bd){bd=gap;best={k:'o',o,key,x:o.x,z:o.z,lab:T.lab,rr:T.r+.7}}}return best}
{const _a=attack;attack=function(){const id=curId(),w=WEAP[id]||{};
 if(RJ.mf&&w.melee&&id!=='fist'&&P.cd<=0){const ax=P.adx,az=P.adz;let en=0;for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d<w.range+(e.big?.5:0)+.4&&(dx*ax+dz*az)/(d||1)>.3){en=1;break}}
  if(!en){const o=rjObj(ax,az);if(o){const t0=target;target=o;try{interact()}finally{target=t0}return}}}
 return _a()}}
/* 땅 위 조준 표시 — 42차(기획자: '조준할 때 사거리 표시 없애 버려'): 사거리 띠·근접 부채는 없앴어요. 수류탄만 떨어질 자리에 작은 고리(끈 길이로 거리를 정하니까).
   대신 조준하는 동안 캐릭터가 그쪽을 보고(아래 updPlayer 감싸기), 화면이 그쪽으로 부드럽게 밀려요(RJCAM). */
const RJV={ring:null};
function rjVisInit(){if(RJV.ring)return;const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:.55,depthWrite:false,fog:false,side:THREE.DoubleSide});mat.color.setHex(0xfff1d6).convertSRGBToLinear();
 const rg=new THREE.RingGeometry(.74,1,32);rg.rotateX(-Math.PI/2);RJV.ring=new THREE.Mesh(rg,mat);RJV.ring.frustumCulled=false;RJV.ring.renderOrder=6;scene.add(RJV.ring)}
const rjNadeD=()=>3+11*clamp((RJ.k-RJ_DZ)/(1-RJ_DZ),0,1);
function rjVis(){const w=WEAP[curId()]||{},on=RJ.id!==null&&RJ.aim&&RJ.md==='aim'&&w.nade&&!bmode&&mode==='play'&&!P.dead;
 if(!on){if(RJV.ring)RJV.ring.visible=false;return}rjVisInit();const d=rjNadeD(),gx=P.x+RJ.ax*d,gz=P.z+RJ.az*d;
 RJV.ring.position.set(gx,Math.max(groundY(gx,gz),0)+.08,gz);RJV.ring.scale.setScalar(1.1);RJV.ring.visible=true}
/* 조준하는 동안 화면을 조준한 쪽으로(롱빈터처럼): 총은 사거리의 30%(3~7m) × 당긴 정도, 수류탄은 떨어질 자리의 55%. 떼면 천천히 돌아와요 */
const RJCAM={x:0,z:0};
{const _uc=updCamera;updCamera=function(dt,px,py,pz,snap){let tx=0,tz=0;
 if(RJ.id!==null&&RJ.aim&&RJ.md==='aim'&&!INT.on&&!bmode&&mode==='play'&&!P.dead){const w=WEAP[curId()]||{},k=clamp((RJ.k-RJ_DZ)/(1-RJ_DZ),0,1),L=w.nade?rjNadeD()*.55:clamp((w.range||12)*.3,3,7)*(.45+.55*k);tx=RJ.ax*L;tz=RJ.az*L}
 if(snap||INT.on){RJCAM.x=RJCAM.z=0}else{const a=1-Math.exp(-(dt||0)*(tx||tz?3:2.2));RJCAM.x+=(tx-RJCAM.x)*a;RJCAM.z+=(tz-RJCAM.z)*a}
 return _uc(dt,px+RJCAM.x,py,pz+RJCAM.z,snap)}}
/* 매 장면: 낚싯대 누르는 중·계속 휘두르기·떼서 쏘기 대기열 */
{const _u=updPlayer;updPlayer=function(dt){let shot=0;const now=performance.now(),r0=P.rot;if(RJ.q&&now>RJ.q.t)RJ.q=null;
 if(RJ.id!==null&&RJ.md==='rod')inp.fire=true;
 const hold=RJ.id!==null&&RJ.md==='melee'&&RJ.full;if(hold){inp.fire=true;inp.aiming=true;inp.ax=RJ.ax;inp.az=RJ.az;RJ.mf=1}else if(RJ.mf){RJ.mf=0;inp.fire=false;inp.aiming=false}
 if(RJ.q&&P.cd<=0&&!bmode&&!hold){const q=RJ.q;RJ.q=null;shot=1;inp.fire=true;if(q.hit)inp.aiming=false;else{inp.aiming=true;inp.ax=q.ax;inp.az=q.az;if(q.nade)ACT.g=[P.x+q.ax*q.d,P.z+q.az*q.d]}}
 _u(dt);if(shot){inp.fire=false;inp.aiming=false}if(RJ.rel){RJ.rel=0;inp.act=false}
 if(RJ.id!==null&&RJ.aim&&!RJ.mf&&!shot&&(RJ.md==='aim'||RJ.md==='melee')&&!P.dead&&P.a){P.rot=turn(r0,Math.atan2(RJ.ax,RJ.az),dt*16);P.a.root.rotation.y=P.rot}   /* 42차: 조준하는 동안 캐릭터가 조준한 쪽을 봐요(걸어도) */
 rjVis();rjIcon()}}
/* ===== 43차(기획자 11-20 22:02: '무기나 장착류 할 때마다 조이스틱이 없어지는데') =====
   ※ 45차: 아래 좁은 가방 창은 없앴어요(기획자: 원래 크기·자리로). 조이스틱은 제자리·보이지만 창 뒤에 그려져요.
   가방을 열어도 조이스틱 둘은 제자리에 늘 보이고 쓸 수 있어요(숨기지도 옮기지도 않아요). 대신 가방 창이 조이스틱을 비켜서 놓여요:
   가로 화면 = 화면 가운데(캐릭터) 오른쪽 ~ 오른쪽 조이스틱 왼쪽 사이(위아래는 꽉), 세로 화면 = 예전 윗선 ~ 조이스틱 위 사이.
   그래서 가방을 연 채로 장착하자마자 오른쪽 조이스틱으로 바로 쏘고·휘두르고·낚시할 수 있어요. 🎒를 다시 누르면 닫혀요. */
/* ===== 45차(기획자 11-20 23:17: '인벤 크기가 작아졌고 위치도 변경됐다', '오른쪽 조이스틱이 상자 [모두 가져가기]랑 겹친다, 차라리 조이스틱을 상자보다 뒤로') =====
   43차의 좁은 가방 창(bagRect·.nrw)을 없애고 가방 창을 원래 크기·자리로 되돌렸어요(가로 = 오른쪽에 붙은 넓은 창, 세로 = 아래 절반).
   조이스틱 둘은 숨기지도 옮기지도 않고 제자리에 두되, 모든 창(가방·상자·상점…) 뒤에 그려져요 → 창이 덮은 곳에서는 창이 눌려요.
   세로 화면 왼쪽 조이스틱은 원래(32차)처럼 가방 위로 올라가요(가방을 연 채 걷기 — joyFix는 원래 것 그대로). */
rjFix=function(){const j=rjEl(),port=VW<=VH;Object.assign(j.style,{right:(port?22:34)+'px',bottom:(port?58:30)+'px',visibility:''})};   /* 함수 선언이 아니라 바꿔 끼우기 */
{const j=rjEl(),sh=$('shade');if(sh&&j.nextSibling!==sh)sh.parentNode.insertBefore(j,sh)}   /* 오른쪽 조이스틱을 창 뒤로(왼쪽 #joy처럼 #shade·#panel보다 앞 순서) */
joyFix();rjFix();
{const _l=layoutPanel;layoutPanel=function(){_l();if(panel==='bag')bagFit()}}   /* 화면 크기가 바뀌면 가방 칸 크기도 다시 */
$('pclose').onclick=()=>closePanel();$('shade').onclick=()=>closePanel();   /* ✕·바깥 누르기도 감싼 closePanel을 거치게(예전엔 맨 처음 것만 불려서 ✕로 닫으면 스크롤 막힘·조이스틱 자리·제작 칸 돌려주기가 안 됐어요) */
$('bBag').onclick=()=>panel==='bag'?closePanel():openPanel('bag');   /* 가방 버튼을 다시 누르면 닫기 */
/* ===== 44차 ① 텐트·집 안 물건은 그 텐트 것(기획자 11-20 22:25: '텐트 설치하고 안에 제작대는 없는 거고 내가 직접 구하거나 사야 하는 거야, 있으면 안 돼') =====
   예전엔 모든 텐트가 방 하나를 같이 써서, 한 번 놓은 작업대가 새로 친 텐트에도 그대로 보였어요. 이제 안에 놓은 것(s.in)은 놓을 때 들어가 있던 텐트·집에 붙어요(s.hk = 그 집 자리 열쇠):
   그 집에 들어갔을 때만 보이고·부딪히고·쓸 수 있어요. 집이 없어지면(걷기·12시간) 안의 것은 가방으로(키트가 있는 건 키트, 없는 건 재료). 텐트 → 집 업그레이드는 같은 자리라 그대로.
   예전 저장의 '주인 없는' 방 안 물건은 게임을 켤 때 한 번 가방으로 돌려드려요. */
const homeKey=s=>s?(s.hk||(s.hk=Math.round(s.x*10)+':'+Math.round(s.z*10))):null;
function curHK(){return INT.on&&INT.s?homeKey(INT.s):null}
const HKM={s:null};
{const _a=addStruct;addStruct=function(o){const s=_a(o);if(s&&s.in&&!s.hk&&INT.on&&INT.s)s.hk=homeKey(INT.s);return s}}
{const _i=inStruct;inStruct=function(s,x,z,r){if(s.in&&s.hk!==curHK())return false;return _i(s,x,z,r)}}   /* 다른 집 안의 것은 안 부딪혀요 */
{const _l=sLabel;sLabel=function(s){if(s.in&&s.hk!==curHK())return null;return _l(s)}}
intShow=function(on){const k=curHK();for(const s of structs)if(s.in&&s.m)s.m.visible=on&&s.hk===k};
function inRefund(q){const d=BUILDS[q.t];if(!d)return;if(d.kit&&ITEMS[d.kit])give(d.kit,1);else for(const k in d.c||{})give(k,d.c[k])}
{const _r=removeStruct;removeStruct=function(s){_r(s);if(!s||!isZoneT(s.t)||!s.own||(typeof HUP!=='undefined'&&HUP.on)||(typeof NET!=='undefined'&&NET.applying))return;const k=homeKey(s),its=structs.filter(q=>q.in&&q.own&&q.hk===k);if(!its.length)return;
  for(const q of its){inRefund(q);_r(q)}const nm=[...new Set(its.map(q=>BUILDS[q.t]?BUILDS[q.t].n:q.t))].join('·');setTimeout(()=>toast(`🎒 ${s.t==='phouse'?'집':'텐트'} 안에 있던 ${jo(nm,'을','를')} 가방에 넣었어요`),900);hudDirty=true}}
function hkMigrate(){const homes=new Set(structs.filter(s=>isZoneT(s.t)&&s.own&&!s.in).map(homeKey)),its=structs.filter(q=>q.in&&q.own&&(!q.hk||!homes.has(q.hk)));if(!its.length)return;
 for(const q of its){inRefund(q);removeStruct(q)}const nm=[...new Set(its.map(q=>BUILDS[q.t]?BUILDS[q.t].n:q.t))].join('·');setTimeout(()=>toast(`🎒 텐트 안에 남아 있던 ${jo(nm,'을','를')} 가방에 넣었어요 — 이제 텐트마다 안이 따로예요`),1600);hudDirty=true;save()}
/* ===== 44차 ② 항구 안전 구역 표시(규칙은 core.js PORT_SAFE·server.js) — 안에 있으면 에너지 칸 아래에 '🛡 안전 구역' ===== */
{const css=document.createElement('style');css.textContent='#safeP{position:absolute;left:14px;top:40px;padding:3px 11px;border-radius:13px;background:#3f9d5a;color:#fff;font-size:13px;font-weight:900;pointer-events:none;opacity:0;transition:opacity .35s;box-shadow:0 2px 0 rgba(0,0,0,.18);white-space:nowrap}#safeP.on{opacity:.95}';document.head.appendChild(css)}
{const e=document.createElement('div');e.id='safeP';e.textContent='🛡 안전 구역 · 사람끼리 다치지 않아요';$('ui').appendChild(e)}
{const _u=updPlayer;updPlayer=function(dt){_u(dt);if(HKM.s!==S&&mode==='play'){HKM.s=S;try{hkMigrate()}catch(e){console.warn(e)}}
  const on=mode==='play'&&!INT.on&&!P.dead&&!!inSafe(P.x,P.z),e=$('safeP');if(e&&e.classList.contains('on')!==on)e.classList.toggle('on',on)}}
/* ===== 48차(규칙, 기획자 11-21 14:18): 항구마다 생선 상인 · 가운데 항구 보급상 없앰 =====
   - 생선 상인(ports.js placeFishBuyer: 판매대 fbuy + 뒤에 선 사람): [생선 팔기] → 가방의 일반·희귀 물고기(날것)를 원래 가격 그대로 사요(쓰레기통은 20%).
     영웅·전설 물고기는 안 사요. 낚싯대를 들고 있어도 말을 걸 수 있어요(배 타기처럼).
   - 가운데 항구(초승달 항구마을)의 보급상(사람·[거래])은 없앴어요. 가게 건물은 그대로 서 있어요. */
const FBUY={L:[],far:72};
const fbFish=k=>{const f=FISH.find(q=>q.id===k);return f&&!f.old&&f.g<=1?f:null};
{const _sl=sLabel;sLabel=function(s){if(s.t==='fbuy')return'생선 팔기';if(s.t==='fbuy_npc'||s.t==='market')return null;return _sl(s)}}
{const _it=interact;interact=function(){const t=target;if(t&&t.k==='s'&&t.s.t==='fbuy'){if(inp.actEdge){FBUY.pi=t.s.pi;openPanel('fishbuy')}return}_it()}}
{const _ft=findTarget;findTarget=function(){if(isRod(curId())&&!INT.on&&!bmode&&!P.dead&&!fishing&&WTR.st!=='swim'){let b=null,bd=TREACH;for(const s of structs){if(s.t!=='fbuy'||dist(P.x,P.z,s.x,s.z)>6)continue;const g=sGap(P.x,P.z,s);if(g<=bd){bd=g;b={k:'s',s,x:s.x,z:s.z,lab:'생선 팔기',rr:1.7}}}if(b)return b}return _ft()}}
function fbuyHtml(){const ks=bagList().filter(k=>fbFish(k)),all=ks.reduce((a,k)=>a+ITEMS[k].p*invN(k),0);
 return`<div class="sec" style="margin-top:0">일반·희귀 물고기를 원래 가격 그대로 사요${ks.length?` · <button class="btn" data-a="fsell" data-k="*" style="padding:4px 10px;font-size:12.5px">모두 팔기 +${all}</button>`:''}</div>`+(ks.map(k=>{const it=ITEMS[k],n=invN(k),f=fbFish(k),G=FGRADE[f.g];
  return`<div class="row">${invIcon(k)}<div class="tx">${it.n} ×${n} <span style="display:inline-block;background:${G[1]};color:#fff;border-radius:9px;padding:0 6px;font-size:10px;font-weight:800">${G[0]}</span><small>개당 ${it.p} 동전</small></div><button class="btn g" data-a="fsell" data-k="${k}" data-n="1">${n===1?'팔기 +'+it.p:'1개'}</button>${n>1?`<button class="btn g" data-a="fsell" data-k="${k}" data-n="${n}">전부 +${it.p*n}</button>`:''}</div>`}).join('')||'<div class="row"><div class="tx">팔 물고기가 없어요<small>영웅·전설 물고기와 구운 생선은 사지 않아요</small></div></div>')}
{const _rp=renderPanel;renderPanel=function(){_rp();if(panel!=='fishbuy')return;$('ptabs').innerHTML='<div class="tab on">🐟 생선 상인</div>';$('pbody').innerHTML=fbuyHtml()}}
$('pbody').addEventListener('click',e=>{const b=e.target.closest('[data-a="fsell"]');if(!b||panel!=='fishbuy')return;const ks=b.dataset.k==='*'?bagList().filter(k=>fbFish(k)):[b.dataset.k];let g=0,c=0;
 for(const k of ks){if(!fbFish(k))continue;const n=b.dataset.k==='*'?invN(k):Math.min(+b.dataset.n,invN(k));if(n>0&&take(k,n)){g+=ITEMS[k].p*n;c+=n}}
 if(c){S.coins+=g;sfx(700,.07);sfx(980,.05,'sine',.03);toast(`🐟 물고기 ${c}마리를 팔았어요 · +${g} 동전`);hudDirty=true}renderPanel()});
/* 상인 사람: 가까이 가면 만들고(가게 보급상과 같은 모습), 판매대 뒤에서 가만히 서 있어요. 머리 위에 '생선 상인' */
{const _up=updPlayer;let s0=null;updPlayer=function(dt){_up(dt);if(mode!=='play')return;
 if(s0!==S){s0=S;if(typeof merchant!=='undefined'&&merchant&&merchant.a){merchant.a.root.visible=false;merchant.x=merchant.z=-9999}FBUY.L=structs.filter(s=>s.t==='fbuy_npc').map(s=>({s,a:null}))}
 for(const q of FBUY.L){const d=dist(P.x,P.z,q.s.x,q.s.z),near=d<FBUY.far&&!INT.on;if(near&&!q.a&&CMAT.merchant){q.a=new Actor('merchant');q.a.play('Idle',{force:1});q.a.set(q.s.x,q.s.z,0)}
  if(q.a){q.a.root.visible=near;if(near)q.a.mixer.update(dt)}}}}
{const _df=drawFx;drawFx=function(dt){_df(dt);if(mode!=='play'||INT.on)return;const c=fctx,k=Math.max(.8,UIS*1.25);for(const q of FBUY.L){if(!q.a||dist(P.x,P.z,q.s.x,q.s.z)>14)continue;const p=scr(q.s.x,groundY(q.s.x,q.s.z)+3.0,q.s.z);uiPill(c,'🐟 생선 상인',p[0],p[1],12.5*k,UIC.grn,'#fff')}}}
boot();
window.__g={PORTS,DEV,ISL,POI,VIL,OUT,hAt,devTp,addMark,get S(){return S},P,inp,get enemies(){return enemies},get structs(){return structs},get target(){return target},walk,give,spawnEnemy,get raid(){return raid},get mode(){return mode},objs};
