'use strict';
/* ===== actors: characters, player, enemies, combat, turrets, raids, loot ===== */
const inp={mx:0,mz:0,ax:0,az:1,aiming:false,fire:false,act:false,actEdge:false,roll:false};
const CH={},CLIPS={},CMAT={},CMATN={};let enemies=[],shots=[],drops=[],nades=[],target=null,bmode=null,brot=0,ghost=null,ring=null,merchant=null,bagM=null;
const P={a:null,x:0,z:0,rot:0,cd:0,inv:0,rollT:0,rollCd:0,rdx:0,rdz:1,adx:0,adz:1,dead:false,hitT:0,lastHurt:9,firing:false,auto:null,side:1,autoT:0,tapE:null,tapT:0,stepT:0,pl:1,fireWas:false};
const depSet=new Set();let raid={on:false,warned:false},busy=false;
function recolor(map,fn){const im=map.image,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const k=c.getContext('2d');k.drawImage(im,0,0);const d=k.getImageData(0,0,c.width,c.height),a=d.data;
 for(let i=0;i<a.length;i+=4){const o=fn(a[i],a[i+1],a[i+2]);if(o){a[i]=o[0];a[i+1]=o[1];a[i+2]=o[2]}}k.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.flipY=map.flipY;t.encoding=THREE.sRGBEncoding;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return t}
const hueTo=(test,tr,tg,tb)=>(r,g,b)=>{if(!test(r,g,b))return null;const k=(.3*r+.59*g+.11*b)/(.3*tr+.59*tg+.11*tb);return[Math.min(255,tr*k),Math.min(255,tg*k),Math.min(255,tb*k)]};
const isGreen=(r,g,b)=>g>r*1.1&&g>b*1.1,isBlue=(r,g,b)=>b>r*1.08&&b>g*1.02;
async function loadChars(){const L=new THREE.GLTFLoader(),ld=async p=>{const buf=await loadB64(p);return new Promise((res,rej)=>L.parse(buf,'',res,()=>rej(new Error('모델을 읽지 못했어요: '+p))))};
 const [h,b,r]=await Promise.all([ld('assets/hero_glb.json'),ld('assets/hood_glb.json'),ld('assets/brute_glb.json')]);h.animations.forEach(c=>CLIPS[c.name]=c);CH.hero=h.scene;CH.hood=b.scene;CH.brute=r.scene;
 const map=s=>{let m=null;s.traverse(o=>{if(o.isMesh&&o.material.map&&!m)m=o.material.map});return m},mk=(k,t)=>{CMAT[k]=new THREE.MeshLambertMaterial({map:t,skinning:true});CMATN[k]=new THREE.MeshLambertMaterial({map:t})};
 const hm=map(CH.hero),bm=map(CH.hood),rm=map(CH.brute);
 mk('hero',recolor(hm,hueTo(isGreen,104,118,62)));mk('bandit',recolor(bm,hueTo(isGreen,150,48,42)));mk('gunner',recolor(bm,hueTo(isGreen,78,88,108)));
 mk('brute',recolor(rm,hueTo(isBlue,128,40,36)));mk('merchant',recolor(rm,(r,g,b)=>null));mk('fisher',recolor(rm,hueTo(isBlue,232,178,56)))}   /* 낚시섬 주인: 파란 옷을 노란 비옷 색으로 */
const XRC={},XRAY=new THREE.MeshBasicMaterial({color:0xa8ecff,transparent:true,opacity:.4,depthFunc:THREE.GreaterDepth,depthWrite:false,skinning:true,fog:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc});
function xrMat(m){if(XRC[m.uuid])return XRC[m.uuid];const c=m.clone();c.stencilWrite=true;c.stencilRef=1;c.stencilFunc=THREE.AlwaysStencilFunc;c.stencilZPass=THREE.ReplaceStencilOp;return XRC[m.uuid]=c}
class Actor{constructor(kind){this.kind=kind;const src=kind==='hero'?CH.hero:(kind==='brute'||kind==='merchant'||kind==='fisher')?CH.brute:CH.hood;const root=this.root=THREE.SkeletonUtils.clone(src);
  root.traverse(o=>{if(o.isMesh){o.material=o.isSkinnedMesh?CMAT[kind]:CMATN[kind];o.castShadow=true;o.frustumCulled=false}if(/^handslot/.test(o.name))o.children.slice().forEach(c=>{if(!c.isBone)o.remove(c)});if(/^handslot\.?r$/.test(o.name))this.hand=o;if(o.name==='head'&&o.isBone)this.head=o});
  this.holder=new THREE.Object3D();this.hand.add(this.holder);this.mixer=new THREE.AnimationMixer(root);this.acts={};this.cur='';this.curA=null;this.lock=0;scene.add(root);if(kind==='brute')root.scale.setScalar(1.22)}
 play(n,o={}){if(this.cur===n&&!o.force)return;if(this.lock>0&&!o.lock&&!o.force)return;let a=this.acts[n];if(!a){a=this.acts[n]=this.mixer.clipAction(CLIPS[n])}a.reset();a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=!!o.once;a.timeScale=o.speed||1;
  if(this.curA&&this.curA!==a)a.crossFadeFrom(this.curA,o.fade===undefined?.14:o.fade,false);a.play();this.curA=a;this.cur=n;if(o.lock)this.lock=o.lock}
 weapon(id){const h=this.holder;while(h.children.length)h.remove(h.children[0]);this.wid=id;if(!id||id==='fist')return;const g=GEO[id==='axe'?'axe_m':ITEMS[id]&&ITEMS[id].hg||id];if(!g)return;const m=mesh(g,MATT);if(this.xr){m.material=xrMat(MATT);m.renderOrder=5}
  const it=ITEMS[id];if(it&&it.hs)m.scale.setScalar(it.hs);   /* 25차: 손에 든 모양 크기(hs)·총처럼 앞으로 드는 근접 도구(gh) */
  this.tip=null;if(WEAP[id]&&(!WEAP[id].melee||it&&it.gh)){h.rotation.set(0,Math.PI/2,0);h.position.set(-.1,-.02,0)}else{h.rotation.set(0,Math.PI,0);h.position.set(0,0,0)}h.add(m);if(isRod(id)){const t=new THREE.Object3D();t.position.fromArray(g.userData.tip||GEO.rod.userData.tip);m.add(t);this.tip=t}}
 /* show a faint silhouette of this actor wherever something hides it (the camera cannot be turned) */
 xray(){this.xr=1;const sk=[];this.root.traverse(o=>{if(o.isMesh){o.renderOrder=5;o.material=xrMat(o.material);if(o.isSkinnedMesh)sk.push(o)}});for(const o of sk){const c=new THREE.SkinnedMesh(o.geometry,XRAY);c.bind(o.skeleton,o.bindMatrix);c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.frustumCulled=false;c.renderOrder=30;o.parent.add(c)}}
 helmet(){const m=mesh(GEO.helmet,MATT);m.position.set(0,.6,.03);m.rotation.x=-.08;this.head.add(m)}
 set(x,z,rot){this.root.position.set(x,groundY(x,z),z);this.root.rotation.y=rot}
 dispose(){scene.remove(this.root)}}

/* ===== procedural creatures: rock golem, wood golem, wraith, man-eating vine ===== */
const CRG={},EYEM={},eyeMat=c=>EYEM[c]||(EYEM[c]=new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(1.6),fog:false}));
const GHOST=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.9,emissive:0x16204a}),PLANTM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function buildCreatures(){const dod=r=>new THREE.DodecahedronGeometry(r),S1=0x7d838c,S2=0x666b74,S3=0x8f959e,MOSS=0x5f8a4a,CRY=0x8fe9ff;CRG.eye=new THREE.SphereGeometry(1,8,6);
 CRG.rg={body:mg([pt(dod(1),S1,[0,1.95,0],[.3,.5,0],[1.25,1.05,1]),pt(dod(.72),S2,[0,1.1,.05],[.2,1,0],[1.1,.9,1]),pt(dod(.56),S3,[1.05,2.55,0],[1,0,.4]),pt(dod(.6),S3,[-1.05,2.5,0],[0,1,.2]),pt(ico(.34,1),MOSS,[-1.0,2.98,.05],0,[1.2,.45,1.1]),pt(ico(.3,1),MOSS,[.25,2.88,-.3],0,[1.3,.4,1.1]),pt(ico(.22,1),MOSS,[-.5,1.5,.78],0,[1.2,.8,.4]),pt(ico(.4,1),0x6f9a52,[-1.05,3.02,-.1],0,[1.25,.4,1.2]),pt(ico(.36,1),0x5f8a4a,[.85,2.98,-.2],0,[1.2,.35,1.1]),pt(ico(.3,1),0x6f9a52,[0,2.92,-.5],0,[1.5,.3,1]),pt(cone(.15,.62,5),CRY,[1.22,3.12,-.1],[0,0,-.35]),pt(cone(.1,.42,5),CRY,[.95,3.06,.2],[.3,0,-.1]),pt(cone(.08,.3,5),CRY,[1.4,2.95,.15],[.2,0,-.7])]),
  head:mg([pt(dod(.5),S3,[0,.25,.05],[.4,.2,0],[1.05,.9,1]),pt(box(.78,.14,.3),S2,[0,.44,.36],[.3,0,0])]),
  arm:mg([pt(dod(.36),S2,[0,-.4,0],[1,2,0]),pt(dod(.42),S1,[0,-1.0,.05],[2,1,0]),pt(dod(.56),S2,[0,-1.68,.1],[.5,.3,1],[1,1,1.12])]),
  leg:mg([pt(dod(.42),S2,[0,-.3,0],[1,0,2],[1,1.25,1]),pt(dod(.42),S1,[0,-.72,.1],[0,1,0],[1.15,.55,1.45])])};
 const BK=0x6b4a2e,BK2=0x54391f,LF=0x3f7d55,LF2=0x4f9466;
 CRG.wg={body:mg([pt(cyl(.46,.6,1.5,7),BK,[0,1.25,0]),pt(cyl(.5,.52,.1,7),BK2,[0,.92,0]),pt(cyl(.51,.5,.09,7),BK2,[0,1.66,0],[0,.4,0]),pt(box(.32,.15,.12),0x26170c,[0,1.28,.47]),pt(ico(.15),BK2,[.3,1.0,.44]),pt(cyl(.03,.03,.14,5),0xe8e0d0,[-.4,2.0,.12]),pt(cone(.11,.1,6),0xd9483c,[-.4,2.1,.12]),pt(cyl(.025,.025,.1,5),0xe8e0d0,[-.26,2.0,.26]),pt(cone(.08,.08,6),0xd9483c,[-.26,2.07,.26]),
   ...[0,1,2,3,4].map(a=>pt(cyl(.07,.14,.5,5),BK2,[Math.cos(a*1.26)*.55,.52,Math.sin(a*1.26)*.55],[Math.sin(a*1.26)*.9,0,-Math.cos(a*1.26)*.9]))]),
  head:mg([pt(cyl(.4,.46,.2,7),BK,[0,-.05,0]),pt(cone(.66,.8,7),LF,[0,.3,0]),pt(cone(.5,.7,7),LF2,[0,.78,0]),pt(cone(.3,.55,7),LF,[0,1.2,0])]),
  arm:mg([pt(cyl(.09,.13,1.05,6),BK,[0,-.5,0]),pt(cyl(.035,.06,.42,5),BK2,[.1,-1.12,.05],[0,0,.5]),pt(cyl(.035,.06,.42,5),BK2,[-.1,-1.14,0],[0,0,-.5]),pt(cyl(.035,.06,.38,5),BK2,[0,-1.16,.12],[.6,0,0]),pt(ico(.22),LF2,[0,-.12,0],0,[1,.7,1]),pt(ico(.14),LF,[.06,-.7,-.08],0,[1,.6,1])]),
  leg:mg([pt(cyl(.17,.22,.6,6),BK2,[0,-.3,0]),pt(cyl(.09,.2,.42,5),BK,[0,-.56,.14],[1.3,0,0])])};
 const CL=0x2c2648,CL2=0x1c1830,PALE=0xcfe3f2;
 CRG.wr={body:mg([pt(cone(.8,2.0,9),CL,[0,1.2,0]),pt(cone(.98,.55,9),CL2,[0,1.82,0]),...[0,1,2,3,4,5,6].map(a=>pt(cone(.2,.6,4),a%2?CL:CL2,[Math.cos(a*.9)*.6,.02,Math.sin(a*.9)*.6],[Math.PI,a,0]))]),
  head:mg([pt(ico(.44,1),CL2,[0,0,0],0,[1,1.08,1.05]),pt(ico(.27,1),PALE,[0,-.05,.25],0,[.95,1.12,.6]),pt(cone(.2,.55,5),CL2,[0,.46,-.2],[-.7,0,0])]),
  arm:mg([pt(cone(.18,.9,6),CL,[0,-.38,0]),pt(ico(.11,1),PALE,[0,-.9,0]),pt(cone(.03,.16,4),PALE,[.06,-1.02,.04],[Math.PI,0,0]),pt(cone(.03,.16,4),PALE,[-.06,-1.02,.04],[Math.PI,0,0])])};
 const G1=0x3f8f4f,G2=0x2f6f3c,PU=0x8a4a94,PU2=0x6d3878,RD=0xc9302c,TH=0xf4f1e6,dome=()=>new THREE.SphereGeometry(.62,10,5,0,6.3,0,Math.PI/2);
 const jaw=(up)=>{const f=up?1:-1,p=[pt(dome(),PU,[0,0,.55],[0,0,up?0:Math.PI],[1,.52,1.2]),pt(cyl(.56,.56,.03,10),RD,[0,f*.02,.55],0,[1,1,1.2])];for(let i=0;i<7;i++){const a=-1.25+i*.416;p.push(pt(cone(.065,.22,4),TH,[Math.sin(a)*.57,-f*.1,.55+Math.cos(a)*.68],[up?Math.PI:0,0,0]))}
  if(up){for(const[x,y,z,r]of[[.25,.24,.5,.1],[-.2,.27,.75,.08],[.05,.3,.3,.09],[-.35,.18,.35,.07]])p.push(pt(ico(r,1),0xe9d36a,[x,y,z],0,[1,.5,1]))}else p.push(pt(box(.22,.05,.7),0xe0607a,[0,.04,.6]));return mg(p)};
 CRG.pl={body:mg([pt(ico(.44,1),G2,[0,.3,0],0,[1,.8,1]),...[0,1,2,3,4,5].map(a=>pt(ico(.5,1),a%2?G1:G2,[Math.cos(a*1.047)*.72,.12,Math.sin(a*1.047)*.72],[0,-a*1.047,.22],[1.15,.13,.5])),
   ...[0,1,2].flatMap(a=>{const an=a*2.09+.5,c=Math.cos(an),sn=Math.sin(an);return[pt(cyl(.07,.1,.8,5),G2,[c*.9,.3,sn*.9],[0,-an,1.1]),pt(cyl(.05,.07,.7,5),G1,[c*1.45,.62,sn*1.45],[0,-an,.5]),pt(cone(.05,.16,4),TH,[c*1.1,.52,sn*1.1]),pt(cone(.05,.16,4),TH,[c*1.5,.9,sn*1.5],[0,0,-.4]),pt(ico(.1),PU,[c*1.62,.98,sn*1.62])]})]),
  neck:mg([pt(cyl(.13,.19,1.45,6),G1,[0,.72,.08],[.12,0,0]),pt(ico(.3,1),G2,[.27,.6,0],[0,0,.6],[1,.14,.5]),pt(ico(.26,1),G1,[-.25,.95,.05],[0,0,-.7],[1,.14,.5]),pt(ico(.24,1),PU2,[0,1.5,.12],0,[1,.9,1])]),jawU:jaw(1),jawL:jaw(0)}}
class Creature{constructor(kind){this.kind=kind;this.proc=1;const r=this.root=new THREE.Group(),G=CRG[kind],p=this.p={};this.lock=0;this.cur='';this.st='idle';this.t=0;this.ph=Math.random()*6;this.gy=0;this.sc=.94+Math.random()*.14;this.mixer={update:dt=>this.anim(dt)};
  const add=(g,x,y,z,mat,par)=>{const m=mesh(g,mat||MAT);m.position.set(x,y,z);m.frustumCulled=false;(par||r).add(m);return m},eye=(par,x,y,z,rad,c)=>{const m=new THREE.Mesh(CRG.eye,eyeMat(c));m.scale.setScalar(rad);m.position.set(x,y,z);par.add(m);return m};
  if(kind==='rg'){p.body=add(G.body,0,0,0,MATT);p.head=add(G.head,0,2.95,.15,MATT);eye(p.head,.19,.27,.5,.09,0x54e6ff);eye(p.head,-.19,.27,.5,.09,0x54e6ff);const e=eye(p.body,0,1.95,.97,.16,0x54e6ff);e.scale.set(.13,.2,.06);p.aL=add(G.arm,1.38,2.4,0,MATT);p.aR=add(G.arm,-1.38,2.4,0,MATT);p.lL=add(G.leg,.5,.92,0,MATT);p.lR=add(G.leg,-.5,.92,0,MATT)}
  else if(kind==='wg'){p.body=add(G.body,0,0,0);eye(p.body,.19,1.56,.46,.075,0xffb22e);eye(p.body,-.19,1.56,.46,.075,0xffb22e);p.head=add(G.head,0,2.02,0);p.aL=add(G.arm,.62,1.72,0);p.aR=add(G.arm,-.62,1.72,0);p.aL.rotation.z=.28;p.aR.rotation.z=-.28;p.lL=add(G.leg,.26,.62,0);p.lR=add(G.leg,-.26,.62,0)}
  else if(kind==='wr'){p.body=add(G.body,0,0,0,GHOST);p.head=add(G.head,0,2.38,.04,GHOST);eye(p.head,.1,-.02,.41,.055,0x54e6ff);eye(p.head,-.1,-.02,.41,.055,0x54e6ff);p.aL=add(G.arm,.62,1.8,.1,GHOST);p.aR=add(G.arm,-.62,1.8,.1,GHOST);p.aL.rotation.z=.3;p.aR.rotation.z=-.3;const g=glow(0x54b8ff,2.6,.16);g.position.y=.45;r.add(g);r.traverse(o=>{if(o.isMesh)o.castShadow=false})}
  else{p.body=add(G.body,0,0,0,PLANTM);p.neck=add(G.neck,0,.4,0,PLANTM);p.jU=add(G.jawU,0,1.55,.1,PLANTM,p.neck);p.jL=add(G.jawL,0,1.55,.1,PLANTM,p.neck);eye(p.jU,.3,.2,.95,.06,0xffe14a);eye(p.jU,-.3,.2,.95,.06,0xffe14a)}
  r.scale.setScalar(this.sc);scene.add(r)}
 play(n,o={}){if(this.cur===n&&!o.force)return;if(this.lock>0&&!o.lock&&!o.force)return;this.cur=n;this.t=0;this.dur=o.lock||.5;if(o.lock)this.lock=o.lock;this.st=/Death/.test(n)?'die':/Hit/.test(n)?'hit':/Attack|Shoot/.test(n)?'atk':/Aiming/.test(n)?'aim':/Running/.test(n)?'run':/Walking/.test(n)?'walk':'idle'}
 weapon(){}helmet(){}
 set(x,z,rot){this.gy=groundY(x,z);this.root.position.set(x,this.gy,z);this.root.rotation.y=rot}
 dispose(){scene.remove(this.root)}
 anim(dt){const p=this.p,k=this.kind,r=this.root,st=this.st;this.t+=dt;const mv=st==='run'?1:st==='walk'?.6:0;this.ph+=dt*(st==='run'?8.5:st==='walk'?5:2.2);const s=Math.sin(this.ph),t=this.t;let yo=0,sc=this.sc;
  const u=st==='atk'?Math.min(1,t/this.dur):0;if(st==='hit')sc*=1+.07*Math.sin(Math.min(1,t/.2)*Math.PI);
  if(k==='rg'||k==='wg'){const big=k==='rg',f=big?.82:.5,am=big?.5:.8;let ax=-s*am*mv,ar=s*am*mv;
   if(st==='atk'){const up=u<f*.65?u/(f*.65):u<f?1-(u-f*.65)/(f*.35)*1.3:-.3*(1-(u-f)/(1-f));ax=ar=-2.5*up;p.body.rotation.x=up*-.12+(u>f?.2*(1-(u-f)/(1-f)):0)}else p.body.rotation.x=mv*.06;
   p.aL.rotation.x=ax+(mv?0:Math.sin(this.ph*.7)*.05);p.aR.rotation.x=ar-(mv?0:Math.sin(this.ph*.7)*.05);p.lL.rotation.x=s*.6*mv;p.lR.rotation.x=-s*.6*mv;yo=Math.abs(Math.cos(this.ph))*.09*mv+(mv?0:Math.sin(this.ph*.8)*.02);
   p.head.rotation.y=mv?0:Math.sin(this.ph*.4)*.25;if(!big){p.head.rotation.z=s*.06;p.head.rotation.x=Math.sin(this.ph*.5)*.05}
   if(st==='die'){const d=Math.min(1,t/.9),e=d*d;r.rotation.z=e*1.5;yo=-e*(big?.2:.1);p.aL.rotation.x=p.aR.rotation.x=-e*.8;if(t>2.2)sc*=Math.max(.01,1-(t-2.2))}}
  else if(k==='wr'){yo=.5+Math.sin(this.ph*.8)*.14;p.body.rotation.x=mv*.2;p.body.rotation.z=Math.sin(this.ph*.6)*.05;p.head.rotation.x=mv*.12+Math.sin(this.ph*.5)*.06;p.head.rotation.z=Math.sin(this.ph*.37)*.08;
   let a=-.35+Math.sin(this.ph*.9)*.14-mv*.5;if(st==='aim')a=-1.15;if(st==='atk')a=-1.5-Math.sin(u*Math.PI)*.5;p.aL.rotation.x=a;p.aR.rotation.x=a+(st==='atk'?0:Math.sin(this.ph*.9+1)*.1);
   if(st==='die'){const d=Math.min(1,t/1.1);sc*=Math.max(.01,1-d);yo+=d*1.6;r.rotation.y+=dt*9}}
  else{let open=.22+.1*Math.sin(this.ph*1.3),nx=.1+Math.sin(this.ph*.7)*.06,nz=Math.sin(this.ph*.9)*.1;if(st==='run'||st==='aim'){open=.62+.08*Math.sin(t*22);nx=.22}
   if(st==='atk'){nx=.15+Math.sin(u*Math.PI)*1.05;open=u<.42?.95:.03}if(st==='die'){const d=Math.min(1,t/.9);nx=.2+d*1.7;open=.5;nz=d*.4;p.body.scale.setScalar(1-d*.25);if(t>2.2)sc*=Math.max(.01,1-(t-2.2))}
   p.neck.rotation.x=nx;p.neck.rotation.z=nz;p.jU.rotation.x=-open;p.jL.rotation.x=open*.55}
  r.scale.setScalar(sc);r.position.y=this.gy+yo}}
/* walkable platforms (piers, quays): oriented rectangles in a coarse grid */
const DOCKS=[],DOCKG={};
function addDock(x,z,r,hw,hl,y=.76){const d={x,z,c:Math.cos(r),s:Math.sin(r),hw,hl,y},R=Math.hypot(hw,hl);DOCKS.push(d);for(let cz=((z-R)/16)|0;cz<=((z+R)/16)|0;cz++)for(let cx=((x-R)/16)|0;cx<=((x+R)/16)|0;cx++){const k=cz*64+cx;(DOCKG[k]=DOCKG[k]||[]).push(d)}return d}
function onDock(x,z){const L=DOCKG[((z/16)|0)*64+((x/16)|0)];if(!L)return null;for(const d of L){const ex=x-d.x,ez=z-d.z,lx=ex*d.c-ez*d.s,lz=ex*d.s+ez*d.c;if(lx>-d.hw&&lx<d.hw&&lz>-d.hl&&lz<d.hl)return d}return null}
const groundY=(x,z)=>{const sp=spSurf(x,z);if(sp!==null)return sp;   /* 특수 보급지 테두리·경사로·계단(core.js) */
 const d=onDock(x,z);return d?Math.max(hAt(x,z),d.y):DEV.on?Math.max(hAt(x,z),.02):hAt(x,z)};
const walk=(x,z,r,e)=>{if(INT.on&&e===P)return intWalk(x,z,r);if(DEV.on&&e===P)return x<4||z<4||x>WS-4||z>WS-4?true:null;if(onDock(x,z))return null;return blocked(x,z,r,e?(e.pl?2:1):0,e&&e.pl)};
/* 높낮이(13차, 기획자: '높낮이 차이가 나면 못 올라가게. 바다에 빠졌을 때 부두 나무판에 순간이동하듯 올라가면 안 됨'):
   발 높이 = 땅·부두·특수 보급지 높이, 물속이면 물 표면 근처(STEP_WL). 한 걸음에 STEP_UP보다 높이 올라가는 곳은 못 가요. 내려가는 건 돼요(떨어지기 → plFall).
   땅은 가장 가파른 곳도 0.2m 걸음에 0.34m라 막히지 않고, 부두·데크 가장자리처럼 뚝 끊긴 곳만 막혀요. 개발자 모드(벽 통과)·텐트 안은 그대로. */
/* 30차(기획자: '항구와 일반 땅 사이를 못 지나가고 걸린다, 저 정도는 지나가져야'): 센터 콘크리트 부두 옆 모래가 부두보다 0.46m 낮아서 .45에 막혔어요 → .55.
   물에서 부두(0.64m 넘게)·특수 보급지 절벽은 그대로 막혀요. */
const STEP_UP=.55,STEP_WL=-.2,stepY=(x,z)=>Math.max(groundY(x,z),STEP_WL),canStep=(e,x,z,fx=0,fz=0)=>{if(e===P&&(DEV.on||INT.on))return true;const y0=stepY(e.x,e.z),k=e===P&&WTR.st==='swim'?1.35:.38,px=x+fx*k,pz=z+fz*k;if(stepY(x,z)-y0>STEP_UP)return false;return !(fx||fz)||!(onDock(px,pz)||spSurf(px,pz)!==null)||stepY(px,pz)-y0<=STEP_UP};   /* 앞쪽 끝은 부두·특수 보급지 같은 '끊긴 바닥'만 봐요(땅 비탈은 막지 않게) */   /* 헤엄칠 땐 머리가 앞으로 나와 있어서 더 앞까지 봐요 */   /* fx·fz: 가는 방향(몸 앞쪽 끝도 봐서 부두 가장자리에 몸이 겹치지 않게) */
function moveEnt(e,dx,dz,r=.42){let m=false;if(walk(e.x+dx,e.z,r,e)===null&&canStep(e,e.x+dx,e.z,Math.sign(dx),0)){e.x+=dx;m=true}if(walk(e.x,e.z+dz,r,e)===null&&canStep(e,e.x,e.z+dz,0,Math.sign(dz))){e.z+=dz;m=true}return m}
/* 보이는 높이: 내려갈 땐 중력으로 떨어지고(물이면 첨벙, 땅이면 먼지), 작은 계단은 부드럽게 올라가요. 순간이동(3m 넘게)은 바로 맞춰요 */
function plFall(dt){const g=groundY(P.x,P.z),tg=WTR.st==='swim'?-.6:g;   /* 헤엄칠 땐 몸이 물에 잠긴 높이(-.6)까지 선 채로 떨어진 뒤 헤엄 자세로(waterPose) */if(P.yv===undefined||Math.hypot(P.x-P.ylx,P.z-P.ylz)>3){P.yv=tg;P.vy=0}P.ylx=P.x;P.ylz=P.z;
 if(tg<P.yv-.03){const y0=P.yv;P.vy-=22*dt;P.yv+=P.vy*dt;if(WTR.st!=='land'&&y0>.05&&P.yv<=.05&&P.vy<-2){splash(P.x,P.z,12);sfx(160,.22,'sine',.05,.4)}   /* 물 표면을 지날 때 첨벙 */
  if(P.yv<=tg){const v=-P.vy;P.yv=tg;P.vy=0;if(v>2.6&&WTR.st==='land'){puff(P.x,tg+.1,P.z,0xd9cbb0,6,.6);sfx(110,.08,'square',.025)}}}
 else{P.vy=0;P.yv+=(tg-P.yv)*Math.min(1,dt*16)}return P.yv}
const turn=(a,b,k)=>{let d=b-a;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;return a+d*Math.min(1,k)};
function unstuck(){if(walk(P.x,P.z,.42,P)===null)return;for(let r=.3;r<14;r+=.3)for(let a=0;a<16;a++){const x=P.x+Math.cos(a*.39)*r,z=P.z+Math.sin(a*.39)*r;if(walk(x,z,.42,P)===null){P.x=x;P.z=z;return}}P.x=S.home.x;P.z=S.home.z}
const curId=()=>{const q=S.quick[S.sel];return q&&WEAP[q]&&invN(q)>0?q:'fist'};
const canChop=()=>{const c=curId();return c==='axe'||c==='chainsaw'};
/* 48차: 설치 방향 = brot(-1 왼쪽 사선 · 0 정면 · 1 오른쪽 사선) × ROT_A(30°). 카메라를 돌릴 수 없어서 세 가지만 */
const ROT_A=Math.PI/6,rotStep=()=>clamp(Math.round(brot)||0,-1,1),rotExt=(bx,bz,r)=>{const c=Math.abs(Math.cos(r)),n=Math.abs(Math.sin(r));return[c*bx+n*bz,n*bx+c*bz]};
let adminBuildDegrees=0;
function placementAngle(){return DEV.on?adminBuildDegrees*Math.PI/180:rotStep()*ROT_A}
const ROT_N=['왼쪽 사선','정면','오른쪽 사선'];function rotNext(){if(DEV.on)adminBuildDegrees=(adminBuildDegrees+1)%360;else brot=brot===0?-1:brot===-1?1:0;if(typeof buildUI==='function')buildUI()}   /* [↻] 정면 → 왼쪽 → 오른쪽 → 정면 */
/* 46차(기획자: '나무·바위가 너무 쉽게 부서져, 어느 정도 도끼질을 해야 부서지게, 전기톱은 더 빠르게'): 한 번에 깎는 양과 다음 휘두르기까지(초). 나무·바위 체력은 아래 OBJT_HP */
const CHOP={hit:1,saw:2,cd:.42,sawCd:.3};   /* 25차: 전기톱도 나무를 벨 수 있어요(임시) */
function nearestEnemy(x,z,r){let b=null,bd=r;for(const e of enemies){if(e.dead)continue;const d=dist(x,z,e.x,e.z);if(d<bd){bd=d;b=e}}return b}
/* ---- combat ---- */
function hitscan(ox,oz,dx,dz,range,dmg){let best=null,bt=range;for(const e of enemies){if(e.dead)continue;const rx=e.x-ox,rz=e.z-oz,t=rx*dx+rz*dz;if(t<0||t>bt)continue;if(Math.abs(rx*dz-rz*dx)<(e.big?1.05:.78)){bt=t;best=e}}
 if(best)hurtEnemy(best,dmg,dx,dz);return bt}
function hurtEnemy(e,d,dx,dz){if(e.dead)return;if(e.litT>0)d*=1.3;e.hp-=d;e.agg=1;e.hpT=3;const y=groundY(e.x,e.z);ftext(e.x,y+2.9,e.z,String(Math.round(d)),'#ffe08a');puff(e.x,y+1.4,e.z,ENEMY[e.kind].blood||0xb3352b,3,.7);
 if(!e.big&&!ENEMY[e.kind].root){const kx=e.x+dx*.35,kz=e.z+dz*.35;if(walk(kx,kz,.42,e)===null){e.x=kx;e.z=kz}if(e.a.lock<=0)e.a.play('Hit_A',{once:1,lock:.22,force:1})}
 if(e.camp!==undefined)enemies.forEach(o=>{if(o.camp===e.camp)o.agg=1});if(e.hp<=0)killEnemy(e)}
function killEnemy(e){e.dead=true;e.deadT=3.2;e.a.play('Death_A',{once:1,lock:9,force:1});S.st.kills++;sfx(160,.2,'sawtooth',.05,.5);const it={};ENEMY[e.kind].loot.forEach(([id,n,p])=>{if(Math.random()<p)it[id]=Math.ceil(n*rand(.6,1.2))});addDrop(e.x,e.z,it);
 if(e.kind==='brute')S.st.boss++;if(e.camp!==undefined&&!enemies.some(o=>!o.dead&&o.camp===e.camp)){S.st.camps++;S.campDay[e.camp]=S.day;toast('🏴 야영지를 소탕했어요! 상자를 열어보세요');jingle([523,659,784,1047])}}
function addDrop(x,z,items){if(!Object.keys(items).length)return;const m=mesh(GEO.sack);m.scale.setScalar(6);m.position.set(x,surfY(x,z)+.1,z);scene.add(m);drops.push({x,z,items,m,t:0})}
function hurtPlayer(d){if(P.dead||P.inv>0||busy||DEV.on)return;if(fishing)endFish('공격받아서 낚시를 놓쳤어요');S.hp-=d;P.lastHurt=0;hurtFx();ftext(P.x,groundY(P.x,P.z)+3,P.z,'-'+Math.round(d),'#ff7a6e');sfx(120,.18,'sawtooth',.07);buzz(50);if(P.a.lock<=0)P.a.play('Hit_A',{once:1,lock:.2,force:1});if(S.hp<=0)die()}
function die(){if(P.dead)return;if(INT.on)intOut();P.dead=true;S.hp=0;P.a.play('Death_A',{once:1,lock:9,force:1});setBuild(null);inp.fire=false;
 setTimeout(()=>respawnLoad(()=>{const keep={},bag={};for(const k in S.inv){if(k==='pistol'||k==='axe')keep[k]=S.inv[k];else bag[k]=S.inv[k]}if(keep.pistol)keep.ammoS=Math.min(12,bag.ammoS||0),bag.ammoS=(bag.ammoS||0)-keep.ammoS;
  if(Object.keys(bag).some(k=>bag[k]>0)){if(S.bag)for(const k in S.bag.inv)bag[k]=(bag[k]||0)+S.bag.inv[k];S.bag={x:P.x,z:P.z,inv:bag};placeBag()}for(const k in keep)if(!keep[k])delete keep[k];S.inv=keep;S.quick=S.quick.map(q=>q&&S.inv[q]?q:null);
  const sp=portSpawn();P.x=sp.x;P.z=sp.z;P.rot=Math.atan2(sp.p.dx,sp.p.dz);unstuck();S.hp=70;S.hunger=Math.max(S.hunger,50);S.warm=80;P.dead=false;P.a.lock=0;P.a.play('Idle',{force:1});enemies.forEach(e=>{if(!e.raid)e.agg=0});toast(sp.p.n+' 앞에서 깨어났어요. 지도에 가방 위치가 표시돼요');return sp.p.n}),1600)}
/* respawn rule (기획자 결정): every death puts you in front of a random port, on clear land.
   Tries ports in random order; on each one, walks rings of spots on the land side of the port and takes the first spot that is
   walkable, on solid ground, out of every structure, and at least 2.5m from other players (multiplayer) and 10m from enemies. */
function portSpawn(only){const order=only!=null?[only]:PORTS.map((p,i)=>i).sort(()=>Math.random()-.5),others=typeof NET!=='undefined'&&NET.on?[...NET.players.values()]:[];
 for(const i of order){const p=PORTS[i],ix=-p.dx,iz=-p.dz,lx=-iz,lz=ix,base=p.town?13:7;
  for(let ring=0;ring<6;ring++)for(let k=0;k<9;k++){const fw=base+ring*1.6+Math.random()*.8,side=(k%2?1:-1)*Math.ceil(k/2)*1.5+(Math.random()-.5)*.6,x=p.x+ix*fw+lx*side,z=p.z+iz*fw+lz*side;
   if(hAt(x,z)<1||onDock(x,z)||walk(x,z,.6,P)!==null||structs.some(s=>Math.abs(s.x-x)<6&&Math.abs(s.z-z)<6&&inStruct(s,x,z,.7)))continue;
   if(others.some(o=>dist(o.x,o.z,x,z)<2.5)||enemies.some(e=>!e.dead&&dist(e.x,e.z,x,z)<10))continue;return{x,z,p}}}
 if(only!=null){const p=PORTS[only],b=p.town?13:7;return{x:p.x-p.dx*b,z:p.z-p.dz*b,p}}   /* only: 그 항구에서만 찾기(배편) */
 return{x:VIL.x,z:VIL.z,p:PORTS[0]}}
function placeBag(){if(bagM){scene.remove(bagM);bagM=null}if(!S.bag)return;bagM=new THREE.Group();const m=mesh(GEO.sack);m.scale.setScalar(9);bagM.add(m);const g=glow(0x6cb8ff,3,.5);g.position.y=1.2;bagM.add(g);bagM.position.set(S.bag.x,surfY(S.bag.x,S.bag.z)+.1,S.bag.z);scene.add(bagM)}
function attack(){const id=curId(),w=WEAP[id];if(P.cd>0)return;const y=groundY(P.x,P.z);
 if(w.melee){P.cd=w.cd;P.a.play('1H_Melee_Attack_Chop',{once:1,lock:.36,force:1,speed:1.5});P.hitT=.16;P.hitW=w;sfx(260,.08,'triangle',.03,.6);return}
 if(invN(w.ammo)<=0){P.cd=.4;sfx(900,.03,'square',.03);toast(ITEMS[w.ammo].n+'이 없어요! 제작하거나 상인에게 사요');return}
 P.cd=w.cd;take(w.ammo,1);shotSfx(id);shake=Math.min(.5,shake+(id==='smg'?.1:id==='pistol'?.14:.32));const mxp=P.x+P.adx*1.3,mzp=P.z+P.adz*1.3;
 for(let i=0;i<(w.pel||1);i++){const a=Math.atan2(P.adx,P.adz)+(Math.random()-.5)*2*w.spread,dx=Math.sin(a),dz=Math.cos(a),t=hitscan(P.x,P.z,dx,dz,w.range,w.dmg);tracer(mxp,y+1.45,mzp,P.x+dx*t,y+1.3,P.z+dz*t)}
 if(!P.moving)P.a.play(w.h1?'1H_Ranged_Shoot':'2H_Ranged_Shoot',{once:1,lock:Math.min(.22,w.cd*.9),force:1,speed:1.6,fade:.04});hudDirty=true}
function throwNade(){if(!take('grenade',1))return;const e=nearestEnemy(P.x,P.z,16);let dx=Math.sin(P.rot),dz=Math.cos(P.rot),d=9;if(e){d=dist(P.x,P.z,e.x,e.z);dx=(e.x-P.x)/d;dz=(e.z-P.z)/d;P.rot=Math.atan2(dx,dz)}
 P.a.play('Throw',{once:1,lock:.5,force:1,speed:1.4});const m=mesh(GEO.grenade);m.scale.setScalar(.8);scene.add(m);nades.push({m,x:P.x,z:P.z,dx,dz,d,t:0,T:.75,y0:groundY(P.x,P.z)+1.6})}
function explode(x,z,r,dmg){shake=.8;boom(x,groundY(x,z)+.6,z,r);for(const e of enemies.slice()){const d=dist(x,z,e.x,e.z);if(!e.dead&&d<r)hurtEnemy(e,dmg*(1-d/r*.6),(e.x-x)/(d||1),(e.z-z)/(d||1))}if(dist(x,z,P.x,P.z)<r*.7)hurtPlayer(18)}
/* ---- interaction ---- */
function sLabel(s){const df=sdef(s);if(s.t==='lighthouse')return S.lh[s.li]?'빠른 이동':'불 켜기';if(df.loot===3)return S.looted[s.li]&&S.day-S.looted[s.li]<5?null:'폭파';if(s.t==='gen')return s.fuel>=GEN_CAP-1?null:invN('fuel')>0?'연료 넣기':'연료 필요';   /* 27차: 발전기는 연료 아이템으로 */if(df.loot)return S.looted[s.li]&&S.day-S.looted[s.li]<3?null:'열기';if(s.t==='market')return'거래';if(s.t==='ferry')return'배 타기';if(s.t==='vend')return'자판기';if(s.t==='recycle')return'팔기';if(s.t==='bench')return'작업대';if(s.t==='forge'||s.t==='blacksmith')return'제작';if(df.home)return s.own?'들어가기':null;if(s.t==='int_exit')return dist(P.x,P.z,s.x,s.z)<1.5||P.auto&&P.auto.s===s?'나가기':null;if(s.t==='stash')return'보관';if(s.t==='fire'&&Object.keys(S.inv).some(k=>ITEMS[k]&&ITEMS[k].ty==='fish'))return'요리';if(s.t==='mg'&&invN('ammoS')>0&&s.ammo<240)return'장전';if(df.tur&&s.own&&invN(df.tur.ammo)>0&&s.ammo<df.tur.cap)return'장전';if(s.own&&s.hp<s.max-1&&invN('wood')>0)return'수리';return null}
/* 34차(기획자 11-19 22:01: '자판기나 거래상 같은 모든 것, 좀 더 많이 붙어야 상호작용하게. 좀 떨어져 있는데도 눌리냐'):
   상호작용은 몸이 대상에 거의 닿아야 돼요. reach = 대상 가장자리까지 거리(구조물은 충돌 상자 가장자리, 나무·바위는 몸통 반지름 바깥).
   몸 반지름이 0.42라 닿으면 0.42, TREACH(0.9)면 몸과 대상 사이가 반 뼘쯤. 배(통통배)는 물 위에 떠 있어서 항구마다 따로(ferThr) */
const TREACH=.9;
/* 배는 물에 떠 있어서 항구마다 부두에서 닿을 수 있는 거리가 달라요(0~1.6m) → 그 항구에서 가장 가까이 설 수 있는 자리 + 0.6m까지(처음 가까이 갈 때 한 번 재요) */
function ferThr(s){if(s.fthr==null){let mg=9;for(let x=s.x-6;x<=s.x+6;x+=.15)for(let z=s.z-6;z<=s.z+6;z+=.15){if(!onDock(x,z)&&waterDepth(x,z)>DEEP-.05)continue;const g=sGap(x,z,s);if(g>=mg||walk(x,z,.42,P)!==null)continue;mg=g}s.fthr=Math.max(TREACH,mg+.6)}return s.fthr}
function sGap(x,z,s){const d=sdef(s),dx=x-s.x,dz=z-s.z,c=Math.cos(s.r||0),sn=Math.sin(s.r||0),lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.hypot(Math.max(0,Math.abs(lx)-d.bx),Math.max(0,Math.abs(lz)-d.bz))}
function findNear(ox,oz,fx,fz,reach){let best=null,bs=1e9;const con=(d,o)=>{if(d<bs){bs=d;best=o}};
 if(S.bag&&dist(ox,oz,S.bag.x,S.bag.z)<reach+.4)con(-1,{k:'bag',x:S.bag.x,z:S.bag.z,lab:'가방 줍기',rr:1});
 for(const s of structs){const df=sdef(s),ex=Math.max(df.bx,df.bz);if(dist(ox,oz,s.x,s.z)>reach+2+ex)continue;if(sGap(ox,oz,s)>reach+(s.t==='ferry'?ferThr(s)-TREACH:0))continue;const lab=sLabel(s);if(lab)con(sGap(fx,fz,s),{k:'s',s,x:s.x,z:s.z,lab,rr:s.t==='ferry'?3.4:ex+.4})}
 const cx=(ox/CELL)|0,cz=(oz/CELL)|0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const key=(cz+j)*CN+cx+i,o=objs.get(key);if(!o||o.re>0)continue;const T=OBJT[o.t];if(dist(ox,oz,o.x,o.z)>reach+T.r)continue;con(Math.max(0,dist(fx,fz,o.x,o.z)-T.r),{k:'o',o,key,x:o.x,z:o.z,lab:isTree(T)&&!canChop()?'도끼 필요':T.lab,rr:T.r+.7})}
 return best}
const isTree=T=>T.drop&&T.drop[0]==='wood';
/* 낚싯대를 들고 있으면 상호작용 없음(기획자 요청 6차): 던지기만 */
/* 배편 자리 찾기(12차, 기획자: 낚싯대 등 무엇을 들고 있어도 배 가까이서 누르면 [배 타기]) */
function ferryTarget(x,z,r){let b=null,bd=r;for(const s of structs){if(s.t!=='ferry')continue;const d=dist(x,z,s.x,s.z);if(d<bd){bd=d;b={k:'s',s,x:s.x,z:s.z,lab:'배 타기',rr:3.4}}}return b}
/* 배에서 내릴 자리: 그 항구 통통배 바로 앞(부두·땅에서 걸을 수 있는 가장 가까운 곳), 배를 등지고 서요 */
/* 28차(기획자: '배에서 내릴 때 판자와 배 사이에 걸쳐서 낄 수 있으니 판자 가운데쯤에'): 배 옆 부두가 있으면 그 판자의 가운데 줄(폭 4.4m까지는 정가운데,
   넓은 부두는 가장자리에서 1.4m 안쪽)에서 배와 가장 가까운 곳, 판자 끝에서도 0.9m 안쪽에 내려요. 걸을 수 없으면 가운데 줄을 따라 조금씩 비켜요. 없으면 예전 방식 */
function ferryDockSpot(s){let best=null,bs=1e9;for(const d of DOCKS){if(dist(d.x,d.z,s.x,s.z)>Math.hypot(d.hw,d.hl)+7)continue;const ex=s.x-d.x,ez=s.z-d.z,blx=ex*d.c-ez*d.s,blz=ex*d.s+ez*d.c;
  const gx=Math.max(0,Math.abs(blx)-d.hw),gz=Math.max(0,Math.abs(blz)-d.hl);if(Math.hypot(gx,gz)>5)continue;   /* 배에서 5m 안에 있는 판자만 */
  const ins=d.hw<=2.2?d.hw:Math.min(1.4,d.hw*.5),lx=d.hw<=2.2?0:clamp(blx,-d.hw+ins,d.hw-ins),m=Math.min(.9,d.hl*.4),lz0=clamp(blz,-d.hl+m,d.hl-m);
  for(let k=0;k<=20;k++){const lz=lz0+(k%2?1:-1)*Math.ceil(k/2)*.3;if(lz<-d.hl+m||lz>d.hl-m)continue;const x=d.x+lx*d.c+lz*d.s,z=d.z-lx*d.s+lz*d.c,db=dist(x,z,s.x,s.z);
   if(db<1.6||walk(x,z,.42,P)!==null||onDock(x,z)!==d)continue;const sc=db+Math.abs(lz-lz0)*.5;if(sc<bs){bs=sc;best={x,z,rot:Math.atan2(x-s.x,z-s.z),dock:1}}break}}return best}
function ferrySpot(i){const s=structs.find(q=>q.t==='ferry'&&q.pi===i);if(!s)return null;{const q=ferryDockSpot(s);if(q){q.p=PORTS[i];return q}}let best=null,bs=1e9;for(let r=1.7;r<5.2;r+=.15)for(let a=0;a<36;a++){const an=a/36*Math.PI*2,x=s.x+Math.cos(an)*r,z=s.z+Math.sin(an)*r,dk=onDock(x,z);if(!dk&&hAt(x,z)<.9)continue;if(walk(x,z,.42,P)!==null)continue;const sc=r-(dk?.35:0);if(sc<bs){bs=sc;best={x,z,rot:Math.atan2(x-s.x,z-s.z),p:PORTS[i]}}}return best}
function ferryNear(){let b=null,bd=1e9;for(const s of structs){if(s.t!=='ferry'||dist(P.x,P.z,s.x,s.z)>8)continue;const g=sGap(P.x,P.z,s);if(g<=ferThr(s)&&g<bd){bd=g;b={k:'s',s,x:s.x,z:s.z,lab:'배 타기',rr:3.4}}}return b}   /* 34차: 낚싯대를 들었을 때 배 타기도 바짝 붙어야 */
function findTarget(){if(bmode||P.dead||WTR.st==='swim'||fishing)return null;if(isRod(curId())&&!INT.on)return ferryNear();return findNear(P.x,P.z,P.x+Math.sin(P.rot)*1.1,P.z+Math.cos(P.rot)*1.1,TREACH)}
/* 34차(기획자: '조이스틱이 아닌 다른 곳을 터치했는데 캐릭터가 움직이면 이상하다, 멀리 있는 자판기를 클릭했다고 따라가는 것 없애라'):
   누르면 걸어가는 것(P.auto: 물건·문·배·낚시 자리·땅으로 걸어가기)을 모두 없앴어요. 움직임은 조이스틱으로만.
   worldTap(x,z) = 그 자리를 누름: 적이면 그쪽으로 공격, 낚싯대로 사거리 안 떼면 던지기, 바짝 붙은 대상이면 상호작용, 멀면 '더 가까이' 알림만 */
function tapThing(x,z){if(S.bag&&dist(x,z,S.bag.x,S.bag.z)<1.2)return{k:'bag',x:S.bag.x,z:S.bag.z};let b=null,bd=1.4;
 for(const s of structs){if(dist(x,z,s.x,s.z)>9)continue;const g=sGap(x,z,s);if(g<bd&&(s.t==='ferry'||s.t==='int_exit'||sLabel(s))){bd=g;b={k:'s',s,x:s.x,z:s.z}}}
 if(typeof plNear==='function'&&!INT.on){const p=plNear(x,z,1);if(p&&!b)b={k:'pl',pl:p,x:p.x,z:p.z}}return b}   /* 누른 자리의 상호작용 대상(가까이 있든 멀든) */
const sameT=(a,b)=>!!a&&!!b&&a.k===b.k&&(a.k==='s'?a.s===b.s:a.k==='pl'?a.pl===b.pl:a.k==='o'?a.o===b.o:true);
function farHint(t){const y=(t.k==='s'?groundY(t.x,t.z)+Math.min(3.2,1.4+(sdef(t.s).s||1)*.5):groundY(t.x,t.z)+1.4);ftext(t.x,y,t.z,'더 가까이 가요','#fff3d6');sfx(300,.05,'sine',.03)}
function worldTap(x,z){if(bmode||P.dead||busy)return 0;let e=null,bd=2.6;for(const o of enemies){if(o.dead)continue;const d=dist(x,z,o.x,o.z);if(d<bd){bd=d;e=o}}
 if(e&&!isRod(curId())){P.tapE=e;P.tapT=WEAP[curId()].melee?.6:.9;return 1}
 if(isRod(curId())&&!INT.on&&!fishing&&waterDepth(x,z)>.05&&WTR.st!=='swim'){const sp=spotAt(x,z);if(sp){if(inWater()){fishWarn('물 안에서는 낚시할 수 없어요. 물 밖으로 나가요');return 0}const d=dist(P.x,P.z,x,z);if(d<=ROD_R&&d>=1.6){castAt(x,z,sp);return 1}fishWarn(d>ROD_R?'너무 멀어요. 물가로 더 가까이 가서 던져요':'너무 가까워요');return 0}}
 const t=tapThing(x,z);if(!t)return 0;const tg=findTarget();if(sameT(tg,t)||t.k==='bag'&&tg&&tg.k==='bag'){target=tg;P.rot=Math.atan2(tg.x-P.x,tg.z-P.z)||P.rot;if(tg.k==='o'||tg.k==='pl')interact();else{inp.actEdge=true;interact();inp.actEdge=false}return 1}
 farHint(t);return 0}
const LOOT=[['ammoS',12,22],['can',1,2],['cloth',2,3],['powder',2,4],['bandage',1,1],['wood',4,8]];
/* 36차: 상자 안에 들어갈 것(예전에 열자마자 가방에 넣던 것과 같은 양). 이미 가진 총처럼 하나만 갖는 것(one)은 고철로 바꿔요 */
function lootGen(s){const df=sdef(s),got={};const add=(k,n)=>got[k]=(got[k]||0)+n;
 if(df.loot===4)Object.assign(got,SPLOOT());
 else if(df.loot===3){add('coin',80+(Math.random()*60|0));add('ammoS',70);add('powder',8);add('scrap',14);add('can',3);add('bandage',2);add(pick(['rifle','shotgun','smg']),1)}
 else if(df.loot===2){add('coin',200+(Math.random()*400|0));add('powder',4);add('ammoS',12);add('scrap',6);if(Math.random()<.35)add(pick(['rifle','shotgun']),1)}
 else{add('scrap',3+(Math.random()*4|0));for(let i=0;i<2;i++){const l=pick(LOOT);add(l[0],l[1]+(Math.random()*(l[2]-l[1]+1)|0))}}
 for(const k in got)if(k!=='coin'&&ITEMS[k]&&ITEMS[k].one&&invN(k)){delete got[k];add('scrap',df.loot===3?12:df.loot===4?8:6)}
 return got}
function interact(){const t=target;if(!t)return;
 if(t.k==='o'){if(P.cd>0)return;const o=t.o,T=OBJT[o.t];P.cd=curId()==='chainsaw'?CHOP.sawCd:CHOP.cd;P.rot=Math.atan2(o.x-P.x,o.z-P.z);
  if(isTree(T)&&!canChop()){P.cd=.9;P.auto=null;toast(invN('axe')||invN('chainsaw')?'가방에서 손도끼나 전기톱을 장착해야 나무를 벨 수 있어요':'나무는 손도끼나 전기톱으로만 벨 수 있어요. 상인에게 받거나 제작해요');sfx(240,.06,'square',.03);return}
  if(T.berry){P.a.play('PickUp',{once:1,lock:.4,force:1,speed:1.6})}else{P.a.play('1H_Melee_Attack_Chop',{once:1,lock:.34,force:1,speed:1.6});sfx(o.t===3?330:o.t===5?520:170,.06,'square',.04)}
  o.hp-=curId()==='chainsaw'?CHOP.saw:CHOP.hit;o.sh=.28;depSet.add(t.key);puff(o.x,groundY(o.x,o.z)+1.2,o.z,o.t===3?0xb9c0c9:o.t===5?0x8a929c:0x6fae5a,4);
  if(o.hp<=0){const n=T.drop[1]+(Math.random()<.4?1:0);give(T.drop[0],n);ftext(o.x,groundY(o.x,o.z)+2.6,o.z,`+${n} ${ITEMS[T.drop[0]].n}`,'#b8f0c0');o.re=T.re;depSet.add(t.key);sfx(520,.1);hudDirty=true}refreshObj(o);return}
 if(!inp.actEdge)return;
 if(t.k==='bag'){for(const k in S.bag.inv)if(S.bag.inv[k]>0)give(k,S.bag.inv[k]);S.bag=null;placeBag();P.a.play('PickUp',{once:1,lock:.5,force:1});toast('가방을 되찾았어요!');jingle([523,784]);hudDirty=true;return}
 const s=t.s,df=sdef(s);
 if(s.t==='lighthouse'){if(!S.lh[s.li]){S.lh[s.li]=1;toast('🗼 등대에 불을 켰어요! 불 켜진 등대끼리 빠르게 오갈 수 있어요');jingle([523,659,784,1047]);hudDirty=true}else openPanel('lh');return}
 if(df.tur){const T=df.tur,n=Math.min(T.load,invN(T.ammo),T.cap-s.ammo);take(T.ammo,n);s.ammo+=n;sfx(500,.08);sfx(760,.05,'square',.03);ftext(s.x,groundY(s.x,s.z)+2.7,s.z,`탄약 ${s.ammo}/${T.cap}`,'#ffe08a');hudDirty=true;return}
 if(s.t==='gen'){if(!invN('fuel')){toast('발전기에는 연료(기름통)를 넣어요. 상점에서 받을 수 있어요');sfx(240,.06,'square',.03);return}const n=Math.min(invN('fuel'),Math.ceil((GEN_CAP-s.fuel)/GEN_PER));take('fuel',n);s.fuel=Math.min(GEN_CAP,s.fuel+n*GEN_PER);sfx(300,.1,'square',.04);ftext(s.x,groundY(s.x,s.z)+2.2,s.z,`연료 ${Math.ceil(s.fuel/60)}분`,'#ffe08a');hudDirty=true;return}
 if(df.loot){if(inp.actEdge&&typeof boxOpen==='function')boxOpen(s);return}   /* 36차: 보급 상자·보물 상자·벙커·특수 보급은 바로 먹지 않고 상자 창(ui.js boxOpen) */
 if(s.t==='market')openPanel('shop');else if(s.t==='ferry'){FERRY.from=s.pi|0;openPanel('ferry')}else if(s.t==='vend'){VENDAT=s.pi|0;openPanel('vend')}else if(s.t==='recycle')openPanel('recycle');else if(s.t==='bench')openPanel('bench');else if(s.t==='forge'||s.t==='blacksmith')openPanel('craft');else if(s.t==='stash')openPanel('stash');else if(s.t==='fire')openPanel('cook');
 else if(df.home)intEnter(s);else if(s.t==='int_exit')intLeave();
 else if(s.t==='mg'){const n=Math.min(40,invN('ammoS'),240-s.ammo);take('ammoS',n);s.ammo+=n;sfx(500,.08);ftext(s.x,groundY(s.x,s.z)+2.6,s.z,`탄약 ${s.ammo}`,'#ffe08a');hudDirty=true}
 else if(s.own){take('wood',1);s.hp=Math.min(s.max,s.hp+s.max*.34);sfx(300,.07,'square',.04);P.a.play('1H_Melee_Attack_Chop',{once:1,lock:.3,force:1,speed:1.7})}}
/* ---- building ---- */
function setBuild(m){if(!bmode&&m){brot=0;adminBuildDegrees=0}bmode=m;if(ghost){scene.remove(ghost);ghost=null}if(m&&m!=='demo'){ghost=new THREE.Mesh(GEO[BUILDS[m].g],new THREE.MeshBasicMaterial({color:0x66dd77,transparent:true,opacity:.55,depthWrite:false}));ghost.scale.setScalar(BUILDS[m].s);scene.add(ghost)}if(typeof buildUI==='function')buildUI()}
/* ---- 설치 금지 구역 (기획자 요청): 등대·보급지·항구 둘레에 그곳보다 조금 큰 원. 설치할 때만 빨갛게 보여요 ----
   크기는 그 자리에 실제로 놓인 것(등대섬 땅, 보급 상자·모래주머니·철조망, 부두·배·가게·소품)의 가장 먼 곳 + 여유(NOB_PAD)로 정해요.
   새 게임 시작 때 한 번(buildNoBuild), 플레이어가 지은 건 빼고 월드 구조물만 봐요 */
const NOB=[],NOB_PAD={lh:3,sup:3.5,port:4},NOB_N={lh:'등대',sup:'보급지',port:'항구'};let nobG=null;
function buildNoBuild(){NOB.length=0;
 for(const L of LHS){let e=0;for(let a=0;a<48;a++){const an=a/48*Math.PI*2;for(let r=0;r<26;r+=.5)if(hAt(L.x+Math.cos(an)*r,L.z+Math.sin(an)*r)>0)e=Math.max(e,r)}NOB.push({k:'lh',x:L.x,z:L.z,r:Math.max(12,e+NOB_PAD.lh)})}
 const supT={supply:1,chest:1,blk:1,suplamp:1,cfence:1};
 for(const s of SUPS){let e=6;for(const q of structs)if(!q.own&&supT[q.t]){const d=dist(q.x,q.z,s.x,s.z);if(d<14)e=Math.max(e,d+Math.max(sdef(q).bx,sdef(q).bz))}NOB.push({k:'sup',x:s.x,z:s.z,r:e+NOB_PAD.sup})}
 for(const p of PORTS){const pts=[];if(p.g)p.g.children.forEach(m=>{if(!m.geometry)return;if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();const bs=m.geometry.boundingSphere,sc=m.scale.x;pts.push([m.position.x,m.position.z,Math.min(bs.radius*sc,14)])});
  for(const q of structs){if(q.own||q.t==='lighthouse'||supT[q.t]&&q.t!=='cfence')continue;if(dist(q.x,q.z,p.x,p.z)>44||SUPS.some(s=>dist(q.x,q.z,s.x,s.z)<14))continue;pts.push([q.x,q.z,Math.max(sdef(q).bx,sdef(q).bz)])}
  if(!pts.length)continue;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[x,z,r]of pts){x0=Math.min(x0,x-r);x1=Math.max(x1,x+r);z0=Math.min(z0,z-r);z1=Math.max(z1,z+r)}
  const cx=(x0+x1)/2,cz=(z0+z1)/2;let e=0;for(const[x,z,r]of pts)e=Math.max(e,dist(x,z,cx,cz)+r);NOB.push({k:'port',x:cx,z:cz,r:e+NOB_PAD.port,n:p.n})}}
const nobAt=(x,z,r=0)=>{for(const n of NOB)if(dist(x,z,n.x,n.z)<n.r+r)return n;return null};
/* 빨간 원(설치 모드에서만): 땅·물 높이를 따라 휘는 원판. 안쪽은 거의 투명하고 가장자리로 갈수록 부드럽게 붉어지며, 옅은 사선 무늬가 천천히 흘러요. 테두리는 얇고 또렷한 선 하나 */
function nobMeshes(){if(nobG)return;nobG=new THREE.Group();nobG.visible=false;scene.add(nobG);
 const fm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{uT:{value:0},uA:{value:1},uC:{value:new THREE.Color(0xff4438)}},
  vertexShader:'attribute float aR;varying float vR;varying vec3 vW;void main(){vR=aR;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uT,uA;uniform vec3 uC;varying float vR;varying vec3 vW;void main(){float e=smoothstep(.55,1.,vR);float st=smoothstep(.42,.5,abs(fract((vW.x-vW.z)*.28+uT*.06)-.5))*(1.-e*.7);float a=(.035+e*e*.3+st*.045)*uA;gl_FragColor=vec4(uC,a);}'}),
  em=new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 for(const n of NOB){const A=Math.max(48,Math.round(n.r*3.5)),y=(x,z)=>Math.max(hAt(x,z),0)+.09,P0=[],R0=[],I=[],E=[],EI=[],rings=[];
  const Rn=Math.max(5,Math.round(n.r/3));for(let j=1;j<=Rn;j++)rings.push(.8*j/Rn);rings.push(.88,.94,.98,1);   /* 가장자리 쪽은 촘촘하게(부드러운 붉은 기) */
  P0.push(n.x,y(n.x,n.z),n.z);R0.push(0);for(const f of rings){const rr=n.r*f;for(let i=0;i<A;i++){const an=i/A*Math.PI*2,x=n.x+Math.cos(an)*rr,z=n.z+Math.sin(an)*rr;P0.push(x,y(x,z),z);R0.push(f)}}
  for(let i=0;i<A;i++)I.push(0,1+(i+1)%A,1+i);for(let j=1;j<rings.length;j++){const a0=1+(j-1)*A,a1=1+j*A;for(let i=0;i<A;i++){const i1=(i+1)%A;I.push(a0+i,a1+i1,a1+i,a0+i,a0+i1,a1+i1)}}
  for(let i=0;i<A;i++){const an=i/A*Math.PI*2;for(const rr of[n.r-.13,n.r]){const x=n.x+Math.cos(an)*rr,z=n.z+Math.sin(an)*rr;E.push(x,y(x,z)+.025,z)}const i1=(i+1)%A;EI.push(i*2,i1*2+1,i*2+1,i*2,i1*2,i1*2+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P0,3));g.setAttribute('aR',new THREE.Float32BufferAttribute(R0,1));g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,fm);m.renderOrder=3;
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(E,3));ge.setIndex(EI);ge.computeBoundingSphere();const me=new THREE.Mesh(ge,em);me.renderOrder=3;nobG.add(m,me)}
 nobG.userData={fm,em}}
function updNoBuild(){const on=!!bmode&&bmode!=='demo'&&!INT.on;if(on)nobMeshes();if(!nobG)return;nobG.visible=on;if(on){const k=.5+.5*Math.sin(gt*3);nobG.userData.fm.uniforms.uT.value=gt;nobG.userData.fm.uniforms.uA.value=.85+.25*k;nobG.userData.em.opacity=.75+.2*k}}
/* 설치 모드: 가까운 금지 구역 테두리(나와 가장 가까운 곳)에 알약 */
function drawNoBuild(c,k){if(!bmode||bmode==='demo')return;const g=ghost&&ghost.userData.g;
 if(g&&!g.ok){const q=scr(g.x,groundY(g.x,g.z)+2.4,g.z);if(q[2])uiPill(c,'🚫 '+g.why,q[0],q[1],11.5*k,UIC.red,'#fff','rgba(255,255,255,.3)')}   /* 미리보기가 빨가면 이유를 그 위에 */
 if(!nobG||!nobG.visible)return;for(const n of NOB){const d=dist(P.x,P.z,n.x,n.z);if(d>n.r+22||d<=n.r)continue;const t=n.r/d,x=n.x+(P.x-n.x)*t,z=n.z+(P.z-n.z)*t;if(g&&!g.ok&&dist(x,z,g.x,g.z)<6)continue;const q=scr(x,Math.max(hAt(x,z),0)+.4,z);if(!q[2])continue;uiPill(c,`${NOB_N[n.k]} 주변 설치 금지`,q[0],q[1],10.5*k,'rgba(229,83,75,.9)','#fff','rgba(255,255,255,.3)')}}
/* where the next build would go, and why it cannot go there (pr.why) */
const BPIN={on:0,x:0,z:0};   /* 33차(기획자: '들고 왔다 갔다 하다가 놓고 싶은 곳을 누르면 거기에'): 화면을 누르는 동안 미리보기가 누른 곳으로 (ui.js bldTouch) */
function ghostPos(){const b=BUILDS[bmode],d=Math.max(b.bx,b.bz)+1.6;let x=BPIN.on?BPIN.x:P.x+Math.sin(P.rot)*d,z=BPIN.on?BPIN.z:P.z+Math.cos(P.rot)*d,r=placementAngle();if(b.grid){x=Math.round(x);z=Math.round(z)}   /* 48차(기획자: '360도 말고 원래 각도·왼쪽·오른쪽 사선 세 가지만'): 정면(+z)·왼쪽 사선·오른쪽 사선 */
 const pr={t:bmode,x,z,r},R0=Math.max(b.bx,b.bz);let why='';
 /* 실내 설치(14차): 작업대(b.indoor)는 텐트 안에서만, 텐트 안에는 실내 설치물만. 방 안으로 끌어당기고 앞쪽 1.2m(나가는 길)는 비워요 */
 if(INT.on||b.indoor){if(!INT.on)why='작업대는 텐트 안에서만 놓을 수 있어요';else if(!b.indoor&&!b.inok)why='텐트 안에는 작업대와 가구만 놓을 수 있어요';else{const E=rotExt(b.bx,b.bz,r),ax=INT.hw-E[0]-.1;pr.x=clamp(x,INT.x-ax,INT.x+ax);pr.z=clamp(z,INT.z-INT.hd+E[1]+.1,INT.z+INT.hd-1.3-E[1]);pr.r=r;pr.in=1;pr.yo=INT.y-hAt(pr.x,pr.z);
   if(!canBuild(bmode))why='재료가 부족해요';else if(Math.abs(P.x-pr.x)<E[0]+.45&&Math.abs(P.z-pr.z)<E[1]+.45)why='너무 가까워요. 조금 물러나요';else for(const s of structs){if(!s.in||s.hk!==curHK())continue;const q=sdef(s),F=rotExt(q.bx,q.bz,s.r||0);if(Math.abs(s.x-pr.x)<F[0]+E[0]+.1&&Math.abs(s.z-pr.z)<F[1]+E[1]+.1){why='다른 물건과 겹쳐요';break}}}
  pr.why=why;pr.ok=!why;return pr}
 if(INT.on)why='텐트 안에서는 설치할 수 없어요';else if(!canBuild(bmode))why='재료가 부족해요';else if(nobAt(x,z,R0)){const n=nobAt(x,z,R0);why=`${NOB_N[n.k]} 주변은 설치 금지 구역이에요`}else if(onDock(x,z))why='부두 위에는 놓을 수 없어요';else if(dist(x,z,P.x,P.z)<=R0+.5)why='너무 가까워요';else if(BPIN.on&&dist(x,z,P.x,P.z)>16+R0)why='너무 멀어요. 조금 더 가까이 가요';
 if(!why&&b.water)why=waterSpotWhy(x,z,r,b);   /* 25차: 보트처럼 물 위에만 놓는 것 */
 if(!why&&!b.water){let lo=9,hi=-9;const c=Math.cos(r),sn=Math.sin(r),fx=b.foot?b.foot[0]:b.bx,fz=b.foot?b.foot[1]:b.bz,st=b.foot?.25:1;   /* ground sheets (b.foot) are checked over their whole area */
  for(let ax=-1;ax<=1.001;ax+=st)for(let az=-1;az<=1.001;az+=st){const lx=ax*fx,lz=az*fz,h=b.foot?gridH(x+lx*c+lz*sn,z-lx*sn+lz*c):hAt(x+lx*c+lz*sn,z-lx*sn+lz*c);if(h<lo)lo=h;if(h>hi)hi=h}
  if(lo<.35)why='물가에는 놓을 수 없어요';else if(hi-lo>(b.tilt||(b.grid?.4:.16+R0*.07)))why='땅이 기울어서 놓을 수 없어요'}
 if(!why)for(const s of structs){if(dist(s.x,s.z,x,z)<.9||(!b.grid||!sdef(s).grid)&&inStruct(s,x,z,R0+.12)){why='다른 구조물과 겹쳐요';break}}
 if(!why){const n=Math.ceil((R0+2.2)/CELL),cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-n;j<=n&&!why;j++)for(let i=-n;i<=n;i++){const o=objs.get((cz+j)*CN+cx+i);if(!o||o.re>0)continue;const cl=o.t<3?(R0<.9?.75:1.35)+(o.t===2?.7:0):o.t===3?OBJT[3].r*o.sc/5.6+.3:.6;if(dist(o.x,o.z,x,z)<cl+R0){why=o.t<3?'나무와 겹쳐요':o.t===3?'바위와 겹쳐요':'덤불과 겹쳐요';break}}}
 if(!why)why=zoneWhy(bmode,x,z,r,R0);   /* 39차: 텐트 구역 */
 pr.why=why;pr.ok=!why;return pr}
/* 물 위 설치(25차, 보트 2인승): 배 밑 9점이 모두 물(깊이 0.25 넘게, 배 바닥이 0.22)·부두 아님, 7m 안에 땅이 있어야 해요(바닷가 가까운 물) */
function waterSpotWhy(x,z,r,b){const c=Math.cos(r),sn=Math.sin(r);for(let ax=-1;ax<=1;ax++)for(let az=-1;az<=1;az++){const lx=ax*(b.bx+.15),lz=az*(b.bz+.15),px=x+lx*c+lz*sn,pz=z-lx*sn+lz*c;
  if(onDock(px,pz))return'부두와 겹쳐요';if(hAt(px,pz)>-.25)return'물이 얕거나 땅에 걸려요. 조금 더 물 쪽에 놓아요'}
 for(const rr of[3,5,7])for(let k=0;k<16;k++){const a=k/16*Math.PI*2;if(hAt(x+Math.cos(a)*rr,z+Math.sin(a)*rr)>.3)return''}return'바닷가 가까운 물에만 띄울 수 있어요'}
/* 39차: 구역 규칙 — 텐트·집의 구역끼리는 겹칠 수 없고(내 것끼리도), 남의 '집' 구역 안에는 아무것도 못 놓아요. 남의 '텐트' 구역에는 놓아도 돼요 */
function zoneWhy(t,x,z,r,R0){if(isZoneT(t)){const q=zoneRect(x,z,r);for(const s of structs){if(!isZoneT(s.t)||s.in)continue;if(zoneOverlap(q,zoneRect(s.x,s.z,s.r)))return s.own?'내 구역과 겹쳐요. 텐트 구역끼리는 겹칠 수 없어요':'다른 사람 구역과 겹쳐요'}return''}
 if(INT.on)return'';for(const s of structs){if(s.t!=='phouse'||s.own||s.in)continue;if(zoneIn(zoneRect(s.x,s.z,s.r),x,z,R0))return'다른 사람 집 구역이에요. 집 주인만 설치할 수 있어요'}return''}
/* 철거: 내 것은 어디서든. 남이 지은 것(멀티, s.by)은 누군가의 '텐트' 구역 안에 있을 때만 — '집' 구역 안이면 못 해요. 텐트·집 자체는 남이 못 없애요 */
function canDemo(s){if(s.in&&s.hk!==curHK())return false;   /* 44차: 다른 텐트 안의 것은 안 보이니 철거도 안 돼요 */if(s.own)return true;if(!BUILDS[s.t]||isZoneT(s.t)||!s.by||s.in)return false;let inT=false;for(const h of structs){if(!isZoneT(h.t)||h.in)continue;if(zoneIn(zoneRect(h.x,h.z,h.r),s.x,s.z,0)){if(h.t==='phouse')return false;inT=true}}return inT}
function placeBuild(){if(bmode==='demo'){let b=null,bd=3.6;for(const s of structs)if(canDemo(s)){const d=dist(P.x,P.z,s.x,s.z);if(d<bd){bd=d;b=s}}if(!b){toast('가까이에 철거할 수 있는 건물이 없어요');return}const c=BUILDS[b.t].c;if(!b.own)b.zdemo=1;if(b.kit&&b.own)give(BUILDS[b.t].kit,1);if(!b.kit||BUILDS[b.t].hide||!b.own)for(const k in c)give(k,Math.ceil(c[k]*.5));if(b.upc)for(const k in b.upc)give(k,b.upc[k]);removeStruct(b);sfx(200,.1,'square',.05);toast(b.kit?'걷어서 가방에 넣었어요':'철거했어요 (재료 절반 반환)');hudDirty=true;return}
 const g=ghostPos(),b=BUILDS[bmode];if(!g.ok){toast(g.why||'여기엔 놓을 수 없어요');sfx(160,.1,'square',.04);return}const kit=payBuild(bmode);const s=addStruct({t:bmode,x:g.x,z:g.z,r:g.r,own:1,fresh:1,kit,in:g.in,yo:g.yo});const k='b_'+bmode;if(S.st[k]!==undefined)S.st[k]++;if(b.tur){S.st.b_tur++;sfx(180,.25,'sawtooth',.04,2.2);if(DEV.on)s.ammo=b.tur.cap}
 if(b.home){S.home={x:g.x,z:g.z+b.bz+1.1};toast('텐트를 쳤어요. 여기가 내 기지예요')}puff(g.x,groundY(g.x,g.z)+.6,g.z,0xffffff,8);sfx(300,.08,'square',.05);P.a.play('Interact',{once:1,lock:.3,force:1,speed:1.5});hudDirty=true;if(!canBuild(bmode)){toast(kit?'키트를 다 썼어요':'재료를 다 썼어요');setBuild(null)}}
/* ---- enemies ---- */
function spawnEnemy(kind,x,z,o={}){const T=ENEMY[kind],a=T.proc?new Creature(T.proc):new Actor(kind==='gunner'?'gunner':kind==='brute'?'brute':'bandit');a.weapon(T.w);if(T.helmet)a.helmet();const e=Object.assign({a,kind,x,z,rot:rand(0,6),hp:T.hp,max:T.hp,cd:rand(.3,1),agg:0,ax:x,az:z,wt:0,wx:x,wz:z,dead:false,aimT:0,hitT:0,side:Math.random()<.5?1:-1,big:!!T.big,hpT:0,sT:null,scan:0},o);enemies.push(e);return e}
function spawnCamps(force){POI.camps.forEach((c,i)=>{if(dist(P.x,P.z,c.x,c.z)>130||enemies.some(e=>e.camp===i))return;if(S.campDay[i]&&S.day-S.campDay[i]<3&&!force)return;if(S.campDay[i]){delete S.campDay[i];for(const k of['a','b','c'])delete S.looted['c'+i+k]}
  const mk=(k,dx,dz)=>spawnEnemy(k,c.x+dx,c.z+dz,{camp:i});mk('bandit',3,-1);mk('bandit',-3,1);mk('gunner',-6,4);mk('gunner',5,4);if(i%3===2||S.day>6)mk('brute',0,-3);else mk('bandit',1,5)})}
function steer(e,tx,tz,sp,dt){const an=Math.atan2(tx-e.x,tz-e.z);for(const off of[0,.6,-.6,1.2,-1.2,1.9,-1.9]){const a=an+off*e.side,nx=e.x+Math.sin(a)*sp*dt,nz=e.z+Math.cos(a)*sp*dt,b=canStep(e,nx,nz,Math.sin(a),Math.cos(a))?walk(nx,nz,.42,e):true;
  if(b===null){e.x=nx;e.z=nz;e.rot=turn(e.rot,a,dt*10);return true}if(off===0&&b!==true&&b.own&&e.raid){e.sT=b;return false}}e.side=-e.side;return false}
function updEnemy(e,dt){const T=ENEMY[e.kind],a=e.a,dp=dist(e.x,e.z,P.x,P.z);
 if(e.dead){e.deadT-=dt;a.mixer.update(dt);if(e.deadT<0){a.dispose();enemies.splice(enemies.indexOf(e),1)}return}
 if(dp>85&&!e.raid){a.root.visible=false;return}a.root.visible=true;e.cd-=dt;a.lock-=dt;e.hpT-=dt;if(e.litT>0)e.litT-=dt;let moving=false;
 if(!P.dead&&!DEV.on&&dp<(e.raid?24:15))e.agg=1;if(e.agg&&(P.dead||(!e.raid&&dist(e.x,e.z,e.ax,e.az)>55)||dp>60))e.agg=0;
 if(e.hitT>0){e.hitT-=dt;if(e.hitT<=0&&dp<T.reach+.7)hurtPlayer(T.dmg)}
 if(e.sT&&(!structs.includes(e.sT)||(e.agg&&dp<5)))e.sT=null;
 if(e.sT){const s=e.sT;e.rot=turn(e.rot,Math.atan2(s.x-e.x,s.z-e.z),dt*8);if(e.cd<=0){e.cd=e.big?1.4:1.1;a.play(e.big?'2H_Melee_Attack_Chop':'1H_Melee_Attack_Chop',{once:1,lock:.5,force:1});s.hp-=T.dmg*(e.big?1.8:1);s.hpT=4;puff(s.x,groundY(s.x,s.z)+1,s.z,0xc9b089,4);sfx(140,.08,'square',.04);if(s.hp<=0){removeStruct(s);e.sT=null;toast('⚠ '+BUILDS[s.t].n+'이(가) 부서졌어요')}}}
 else if(e.agg&&T.range&&dp<T.range){e.rot=turn(e.rot,Math.atan2(P.x-e.x,P.z-e.z),dt*8);if(dp<6){moving=steer(e,e.x*2-P.x,e.z*2-P.z,T.sp*.7,dt);e.rot=Math.atan2(P.x-e.x,P.z-e.z)}
  e.aimT+=dt;if(e.aimT>1&&e.cd<=0){e.cd=2;e.aimT=.2;const d=dp||1,sp=(Math.random()-.5)*.12,an=Math.atan2(P.x-e.x,P.z-e.z)+sp;let m;if(T.proc){m=new THREE.Mesh(CRG.eye,eyeMat(0x54e6ff));m.scale.setScalar(.2);const g=glow(0x54b8ff,9,.6);m.add(g)}else m=new THREE.Mesh(box(.12,.12,.5),tracers[0].m.material);scene.add(m);shots.push({m,x:e.x+Math.sin(an),z:e.z+Math.cos(an),dx:Math.sin(an),dz:Math.cos(an),t:0,y:groundY(e.x,e.z)+(T.proc?1.9:1.4),sp:T.proc?12:26,life:T.proc?2:1.3});if(dp<40){if(T.proc)sfx(620,.35,'sine',.05,.4);else shotSfx('rifle')}a.play('2H_Ranged_Shoot',{once:1,lock:.3,force:1,speed:1.5})}
  else if(a.lock<=0&&!moving)a.play('2H_Ranged_Aiming')}
 else if(e.agg&&!T.range&&dp<T.reach){e.rot=turn(e.rot,Math.atan2(P.x-e.x,P.z-e.z),dt*10);if(e.cd<=0){e.cd=e.big?1.5:1;a.play(e.big?'2H_Melee_Attack_Chop':'1H_Melee_Attack_Slice_Diagonal',{once:1,lock:.5,force:1,speed:e.big?1:1.2});e.hitT=e.big?.42:.26}}
 else{let tx,tz,sp=T.sp;if(e.agg){tx=P.x;tz=P.z}else if(e.raid){e.scan-=dt;if(e.scan<=0){e.scan=2;let b=null,bd=60;for(const s of structs)if(s.own&&!sdef(s).home&&!sdef(s).pass){const d=dist(e.x,e.z,s.x,s.z);if(d<bd){bd=d;b=s}}e.goal=b}
    if(e.goal&&structs.includes(e.goal)){tx=e.goal.x;tz=e.goal.z;const df=sdef(e.goal);if(dist(e.x,e.z,tx,tz)<Math.max(df.bx,df.bz)+1.5){e.sT=e.goal}}else{tx=S.home.x;tz=S.home.z;if(dist(e.x,e.z,tx,tz)<4){tx=P.x;tz=P.z;e.agg=!P.dead}}}
  else{e.wt-=dt;if(e.wt<=0){e.wt=rand(2.5,6);const an=rand(0,6.28),r=rand(0,7);e.wx=e.ax+Math.cos(an)*r;e.wz=e.az+Math.sin(an)*r}tx=e.wx;tz=e.wz;sp*=.4}
  if(tx!==undefined&&dist(e.x,e.z,tx,tz)>1.2)moving=steer(e,tx,tz,sp,dt)}
 if(a.lock<=0&&!e.sT){if(moving)a.play(e.agg||e.raid?'Running_A':'Walking_A');else if(!(e.agg&&T.range&&dp<T.range))a.play(e.big?'2H_Melee_Idle':'Idle')}
 for(const o of enemies)if(o!==e&&!o.dead){const d=dist(e.x,e.z,o.x,o.z);if(d<1&&d>0){const px=(e.x-o.x)/d*dt*2,pz=(e.z-o.z)/d*dt*2;if(walk(e.x+px,e.z+pz,.42,e)===null){e.x+=px;e.z+=pz}}}
 a.set(e.x,e.z,e.rot);a.mixer.update(dt)}
/* ---- wild creatures, guards, lazy camps ---- */
let wildT=0;
function dropEnemy(e){if(e.gd)e.gd.e=null;e.a.dispose();const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}
function updSpawns(dt){wildT-=dt;if(wildT>0)return;wildT=1.2;const dk=dark();
 for(const e of enemies.slice()){if(e.dead||e.raid)continue;const d=dist(e.x,e.z,P.x,P.z),gone=e.kind==='wraith'&&e.wild&&dk<.25;if((e.wild&&(d>100||gone))||(e.camp!==undefined&&d>170)||(e.gd&&d>140)){if(gone&&d<70)puff(e.x,groundY(e.x,e.z)+1.5,e.z,0x9fe8ff,8);dropEnemy(e)}}
 spawnCamps();
 for(const g of POI.guards){if(g.e&&g.e.dead){g.day=S.day;g.e=null}const d=dist(g.x,g.z,P.x,P.z);if(!g.e&&!(g.day&&S.day-g.day<3)&&d<95&&d>38&&hAt(g.x,g.z)>.4)g.e=spawnEnemy(g.k,g.x,g.z,{gd:g})}
 if(DEV.on)return;const wild=enemies.filter(e=>e.wild&&!e.dead).length;if(wild>=(dk>.5?8:5))return;
 for(let i=0;i<6;i++){const a=rand(0,6.28),r=rand(38,54),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(x<8||z<8||x>WS-8||z>WS-8)continue;const h=hAt(x,z);if(h<1||walk(x,z,.7)!==null)continue;
  if(dist(x,z,VIL.px,VIL.pz)<70||dist(x,z,S.home.x,S.home.z)<36||PORTS.some(p=>dist(x,z,p.x,p.z)<(p.town?75:42)))continue;const I=islAt(x,z);if(!I||I.ty===2)continue;
  const f=noise(x*.035+100,z*.035+100,SEED+4),r2=Math.random();let k;if(dk>.55&&r2<.5)k='wraith';else if(h>5.5)k=r2<.75?'rgolem':'wgolem';else if(f>.5)k=r2<.55?'wgolem':r2<.85?'plant':'rgolem';else k=r2<.4?'plant':r2<.78?'wgolem':'rgolem';
  if(Math.random()<.55)spawnEnemy(k,x,z,{wild:1});return}}
/* ---- raids ---- */
const dirName=a=>['북','북동','동','남동','남','남서','서','북서'][Math.round(((Math.atan2(Math.cos(a),-Math.sin(a))*180/Math.PI+360)%360)/45)%8];
const nearForge=()=>structs.some(s=>(s.t==='forge'||s.t==='blacksmith')&&dist(s.x,s.z,P.x,P.z)<9);
function raidEta(){const t=S.time;if(raid.on)return 0;return S.raidDone<S.day&&t<.82?(.82-t)*DAYLEN:(1-t+.82)*DAYLEN}
function updRaid(dt){const t=S.time;if(!raid.on&&S.raidDone<S.day){if(t>.7&&t<.82&&!raid.warned){raid.warned=true;raid.ang=rand(0,6.28);toast(`⚔ 곧 밤이에요. ${dirName(raid.ang)}쪽에서 약탈자가 몰려와요!`);sfx(220,.5,'sawtooth',.06,.6)}
  if(t>.82&&t<.97){raid.on=true;raid.warned=false;S.raidDone=S.day;const own=structs.filter(s=>s.own).length,n=clamp(2+Math.floor(S.day*1.4)+Math.floor(own/7),2,11),ang=raid.ang===undefined?rand(0,6.28):raid.ang;raid.ang=undefined;let c=0;
   for(let i=0;i<60&&c<n;i++){const a=ang+rand(-.5,.5),r=rand(36,46),x=S.home.x+Math.cos(a)*r,z=S.home.z+Math.sin(a)*r;if(walk(x,z,.5)!==null)continue;const k=(S.day>=4&&c===0&&S.day%2===0)?'brute':Math.random()<.3&&S.day>1?'gunner':S.day>=3&&Math.random()<.2?'wraith':'bandit';spawnEnemy(k,x,z,{raid:1});c++}
   raid.dir=ang;toast(`⚔ 습격! ${dirName(ang)}쪽에서 ${c}명이 몰려와요`);jingle([220,196,165])}}
 if(raid.on){const alive=enemies.some(e=>e.raid&&!e.dead);if(!alive){raid.on=false;S.st.raids++;const rw=200+S.day*100;S.coins+=rw;toast(`✅ 습격을 막아냈어요! +${rw} 동전`);jingle([523,659,784,1047])}
  else if(t>.26&&t<.4){enemies.filter(e=>e.raid).forEach(e=>{e.a.dispose()});enemies=enemies.filter(e=>!e.raid);raid.on=false;toast('날이 밝자 약탈자들이 물러갔어요')}}}
/* ---- per-frame ---- */
function updPlayer(dt){const a=P.a;P.cd-=dt;P.inv-=dt;P.rollCd-=dt;P.lastHurt+=dt;a.lock-=dt;if(P.dead||busy){unpose(a);a.mixer.update(dt);a.set(P.x,P.z,P.rot);waterPose(dt);return}
 const ws=updWaterState(dt),swim=ws==='swim',smul=speedMul()*(DEV.on?DEV.sp:1);
 let mx=inp.mx,mz=inp.mz,l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l;l=1}P.moving=l>.15;if(P.moving&&l<.55){const k=.45/l;mx*=k;mz*=k}const id=curId(),w=WEAP[id],press=inp.fire&&!P.fireWas;P.fireWas=inp.fire;
 if(fishing&&!isRod(id))endFish();
 if(false&&inp.roll&&P.rollT<=0&&P.rollCd<=0&&!swim&&!fishing){   /* 구르기는 없앴어요(기획자 요청) */P.rollT=.4;P.rollCd=.85;P.inv=.42;if(P.moving){P.rdx=mx/l;P.rdz=mz/l}else{P.rdx=Math.sin(P.rot);P.rdz=Math.cos(P.rot)}a.play('Dodge_Forward',{once:1,lock:.4,force:1,speed:1.6});sfx(300,.14,'sine',.04,.5)}inp.roll=false;
 if(P.rollT>0){P.rollT-=dt;moveEnt(P,P.rdx*12*smul*dt,P.rdz*12*smul*dt);P.rot=Math.atan2(P.rdx,P.rdz)}
 else{const firing=(inp.fire||P.tapT>0)&&!bmode&&!swim&&!w.rod;if(P.moving||firing)P.auto=null;
  if(P.auto&&!P.moving){const t=P.auto,d=dist(P.x,P.z,t.x,t.z),reach=t.k==='move'?.5:t.rr+1.15;P.autoT+=dt;
   if(t.k==='cast'&&(d<=reach||waterDepth(P.x+Math.sin(P.rot)*.8,P.z+Math.cos(P.rot)*.8)>SHALLOW)){P.auto=null;castAt(t.x,t.z,t.sp)}
   else if(d>reach&&P.autoT<12){if(steer(P,t.x,t.z,5*smul,dt)){l=1;P.moving=true}else if(P.autoT>1.5&&!P.moving)P.auto=null}
   else if(t.k==='move'||P.autoT>=12)P.auto=null;else{P.rot=turn(P.rot,Math.atan2(t.x-P.x,t.z-P.z),dt*14);target=t;if(t.k==='o'){if(t.o.re>0)P.auto=null;else interact()}else{inp.actEdge=true;interact();inp.actEdge=false;P.auto=null}}}
  else if(P.moving){const sl=firing&&!w.melee?.62:1,n=Math.ceil(5*dt/.2);for(let i=0;i<n;i++)moveEnt(P,mx*5*sl*smul*dt/n,mz*5*sl*smul*dt/n)}
  if(P.tapT>0){P.tapT-=dt;if(!P.tapE||P.tapE.dead)P.tapT=0}
  if(firing){if(inp.fire&&inp.aiming){P.adx=inp.ax;P.adz=inp.az}else{const e=!inp.fire&&P.tapE?P.tapE:nearestEnemy(P.x,P.z,w.melee?4:w.range);if(e){const d=dist(P.x,P.z,e.x,e.z)||1;P.adx=(e.x-P.x)/d;P.adz=(e.z-P.z)/d}else{P.adx=Math.sin(P.rot);P.adz=Math.cos(P.rot)}}
   P.rot=turn(P.rot,Math.atan2(P.adx,P.adz),dt*22);attack()}else if(P.moving&&!P.auto)P.rot=turn(P.rot,Math.atan2(mx,mz),dt*(swim?6:12));
  if(P.hitT>0){P.hitT-=dt;if(P.hitT<=0){const fx=Math.sin(P.rot),fz=Math.cos(P.rot);for(const e of enemies.slice()){if(e.dead)continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d<P.hitW.range+(e.big?.5:0)&&(dx*fx+dz*fz)/(d||1)>.3)hurtEnemy(e,P.hitW.dmg,dx/(d||1),dz/(d||1))}}}
  if(w.rod&&!bmode&&!swim)updFishing(dt,press);else if(fishing)endFish();
  if(bmode){if(inp.actEdge)placeBuild()}else if((inp.act||inp.actEdge)&&!P.auto&&!swim)interact();
  if(a.lock<=0){if(swim)a.play('T-Pose',{fade:.3});else if(fishing)a.play('1H_Ranged_Aiming',{fade:.2});
   else if(P.moving){const run=(l>.55||P.auto)&&ws==='land';a.play(run?'Running_A':'Walking_A');a.curA.timeScale=run?(firing&&!w.melee?.85:1.18)*(P.auto?1:.55+.45*l):ws==='land'?.7+l*1.1:.6+l*.35;P.stepT-=dt*(run?1:.6);if(P.stepT<=0){P.stepT=.3;if(ws==='land')sfx(90+Math.random()*30,.04,'triangle',.018);else sfx(300+Math.random()*90,.06,'sine',.02,.5)}}
   else if(ws==='spring')a.play('Sit_Floor_Idle',{fade:.35});else if(firing&&!w.melee)a.play(w.h1?'1H_Ranged_Aiming':'2H_Ranged_Aiming');else a.play(w.melee||w.h1?'Idle':'2H_Melee_Idle')}}
 inp.actEdge=false;if(a.wid!==id)a.weapon(id);a.set(P.x,P.z,P.rot);if(!INT.on)a.root.position.y=plFall(dt);unpose(a);a.mixer.update(dt);waterPose(dt);S.px=INT.on?INT.ret.x:P.x;S.pz=INT.on?INT.ret.z:P.z}
function updWorld(dt){
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.t+=dt;s.x+=s.dx*s.sp*dt;s.z+=s.dz*s.sp*dt;s.m.position.set(s.x,s.y,s.z);s.m.rotation.y=Math.atan2(s.dx,s.dz);let hit=s.t>s.life;const b=walk(s.x,s.z,.1,P);
  if(dist(s.x,s.z,P.x,P.z)<.75&&!P.dead){if(P.inv<=0)hurtPlayer(10);hit=P.inv<=0}else if(b&&b!==true&&b.own){b.hp-=4;b.hpT=4;hit=true;if(b.hp<=0)removeStruct(b)}else if(b)hit=true;if(hit){scene.remove(s.m);shots.splice(i,1)}}
 for(let i=nades.length-1;i>=0;i--){const n=nades[i];n.t+=dt;const u=Math.min(1,n.t/n.T),x=n.x+n.dx*n.d*u,z=n.z+n.dz*n.d*u;n.m.position.set(x,lerp(n.y0,groundY(x,z)+.2,u)+Math.sin(u*Math.PI)*3,z);n.m.rotation.x+=dt*10;if(u>=1){scene.remove(n.m);nades.splice(i,1);explode(x,z,5.5,90)}}
 for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.t+=dt;d.m.rotation.y+=dt*2;d.m.position.y=surfY(d.x,d.z)+.25+Math.sin(d.t*4)*.12;const dP=dist(d.x,d.z,P.x,P.z);if(d.hold&&dP>3)d.hold=0;const fit=!d.hold&&(typeof bagFits!=='function'||bagFits(d.items));if(!fit&&!d.hold&&dP<1.2&&!P.dead&&typeof bagFullMsg==='function')bagFullMsg();   /* 27차: 가방 20칸 — 들어갈 자리가 있을 때만 주워요, 버린 자루(hold)는 멀어졌다 와야 주워요 */
 if(fit&&!P.dead&&dP<4.5&&d.t>.4){const dd=dist(d.x,d.z,P.x,P.z)||1;d.x+=(P.x-d.x)/dd*dt*9;d.z+=(P.z-d.z)/dd*dt*9;d.m.position.x=d.x;d.m.position.z=d.z}if(fit&&!P.dead&&dist(d.x,d.z,P.x,P.z)<1.2){let j=0;for(const k in d.items){give(k,d.items[k]);ftext(d.x,groundY(d.x,d.z)+2+j++*.55,d.z,`+${d.items[k]} ${k==='coin'?'동전':ITEMS[k].n}`,'#ffe08a')}sfx(880,.06);scene.remove(d.m);drops.splice(i,1);hudDirty=true}else if(d.t>(d.life||120)){scene.remove(d.m);drops.splice(i,1)}}
 for(const s of structs)if(s.t==='mg'){s.cd-=dt;if(s.hpT>0)s.hpT-=dt;if(s.ammo>0&&s.cd<=0){s.cd=.25;const e=nearestEnemy(s.x,s.z,18);if(e){s.cd=.15;s.ammo--;const d=dist(s.x,s.z,e.x,e.z)||1,dx=(e.x-s.x)/d,dz=(e.z-s.z)/d,y=groundY(s.x,s.z)+1.2;s.gun.rotation.y=Math.atan2(dx,dz)-(s.r||0);tracer(s.x+dx*1.3,y,s.z+dz*1.3,e.x,groundY(e.x,e.z)+1.3,e.z);hurtEnemy(e,9,dx,dz);if(dist(s.x,s.z,P.x,P.z)<45)shotSfx('smg')}}}else if(s.hpT>0&&!sdef(s).tur)s.hpT-=dt;
 {const dk=dark();for(const s of structs){if(s.t==='gen'){if(s.fuel>0){s.fuel=Math.max(0,s.fuel-dt);if(Math.random()<dt*3&&dist(s.x,s.z,P.x,P.z)<30)puff(s.x-.45,groundY(s.x,s.z)+1.6,s.z+.2,0x555555,1,.3)}}}}   /* 24차: 탐조등 없앰(발전기만 남음) */
 /* auto turrets: deploy, scan, track, fire, recoil */
 for(const s of structs){const T=sdef(s).tur;if(!T)continue;const y=groundY(s.x,s.z),near=dist(s.x,s.z,P.x,P.z)<70;
  if(s.dep<1){s.dep=Math.min(1,s.dep+dt*1.6);const u=s.dep,e=1-Math.pow(1-u,3);s.m.scale.set(.55+.45*e,Math.max(.05,e*(1+.18*Math.sin(u*Math.PI))),.55+.45*e);s.head.rotation.y=(1-e)*6;s.head.position.y=1.17-(1-e)*.5;if(s.dep>=1){s.m.scale.setScalar(1);sfx(700,.06,'square',.03);puff(s.x,y+.3,s.z,0xd9cfae,6,.8)}continue}
  s.cd-=dt;if(s.rec>0)s.rec=Math.max(0,s.rec-dt*(T.cd>.5?3:14));if(s.flT>0){s.flT-=dt;if(s.flT<=0)s.flash.visible=false}
  const e=s.ammo>0?nearestEnemy(s.x,s.z,T.range):null;let firing=false;
  if(e){const want=Math.atan2(e.x-s.x,e.z-s.z)-(s.r||0),cur=s.head.rotation.y,nx=turn(cur,want,dt*(T.cd>1?4.5:8));s.head.rotation.y=nx;let df=want-nx;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;
   if(Math.abs(df)<.12&&s.cd<=0){s.cd=T.cd;s.ammo--;s.rec=1;firing=true;const a0=nx+(s.r||0),mx=s.x+Math.sin(a0)*1.1,mz=s.z+Math.cos(a0)*1.1;
    for(let i=0;i<(T.pel||1);i++){const a=a0+(Math.random()-.5)*2*(T.spread||.02),dx=Math.sin(a),dz=Math.cos(a),t=hitscan(s.x,s.z,dx,dz,T.range+1,T.dmg);tracer(mx,y+1.42,mz,s.x+dx*t,y+1.3,s.z+dz*t)}
    s.flash.visible=true;s.flT=.05;s.flash.scale.setScalar(T.pel?2.4:T.cd>1?2.2:1.3+Math.random()*.5);if(near){shotSfx(T.snd);if(Math.random()<.5)puff(s.x+Math.sin(a0+1.5)*.4,y+1.4,s.z+Math.cos(a0+1.5)*.4,0xd9a441,1,.6)}if(s.ammo===0&&near){toast('⚠ 포탑 탄약이 떨어졌어요');sfx(300,.2,'square',.04,.5)}}}
  else if(s.ammo>0){s.scanP+=dt*.7;s.head.rotation.y=turn(s.head.rotation.y,Math.sin(s.scanP)*1.15,dt*1.6)}
  s.spin=lerp(s.spin,e?1:0,Math.min(1,dt*(e?6:1.5)));if(T.spin)s.brl.rotation.z+=dt*s.spin*26;s.brl.position.z=T.bz-s.rec*(T.cd>.5?.16:.05);s.head.rotation.x=s.ammo>0?-s.rec*(T.cd>.5?.07:.015):.22;
  s.lamp.material.color.setHex(s.ammo<=0?(Math.sin(gt*6)>0?0xff3b30:0x3a1512):e?0xff5a36:0x55ff77);if(s.hpT>0)s.hpT-=dt}
 for(const s of structs.slice()){const tr=s.own&&sdef(s).trap;if(!tr)continue;s.cd=(s.cd||0)-dt;if(s.cd>0)continue;for(const e of enemies){if(e.dead||dist(s.x,s.z,e.x,e.z)>(tr===2?1.5:1.3))continue;if(tr===2){removeStruct(s);explode(s.x,s.z,5.5,95)}else{s.cd=.7;hurtEnemy(e,16,0,0);s.hp-=6;s.hpT=3;sfx(240,.06,'square',.03);if(s.hp<=0){removeStruct(s);toast('가시 함정이 다 닳았어요')}}break}}
 depSet.forEach(k=>{const o=objs.get(k);if(o.sh>0){o.sh-=dt;refreshObj(o)}if(o.re>0){o.re-=dt;if(o.re<=0){if(dist(o.x,o.z,P.x,P.z)<4)o.re=6;else{o.re=0;o.hp=OBJT[o.t].hp;refreshObj(o)}}}if(o.re<=0&&o.sh<=0)depSet.delete(k)})}
function nearWarm(){for(const s of lightsrc)if(s.t==='fire'&&dist(s.x,s.z,P.x,P.z)<6)return 2;for(const s of warmsrc)if(dist(s.x,s.z,P.x,P.z)<6.5)return 2;for(const s of structs)if((s.t==='home'&&s.own||s.t==='torch')&&dist(s.x,s.z,P.x,P.z)<(s.t==='home'?7:3))return 1;return 0}
function updStats(dt){const dk=dark(),nw=nearWarm(),h=hAt(P.x,P.z);S.time+=dt/DAYLEN;if(S.time>=1){S.time-=1;S.day++}S.hunger=100;S.warm=100;if(DEV.on){S.hp=100;return}
 /* 27차(기획자: '체력바만, 에너지 개념 10칸, 수영할 때도 계속 소비되고 맞아도 소비'): 배고픔·체온은 없어요(값은 100으로 묶어 둠).
    에너지 = S.hp(10 = 1칸). 헤엄치는 동안 NRG.swim/초씩 줄고, 맞으면 줄어요. 물 밖에서 5초 안 맞으면 천천히 차요(텐트·집 안은 빨리, 불 옆은 조금 빨리). 숫자는 임시 */
 if(WTR.st==='swim'){hurtSoft(dt*NRG.swim);if((P.nrgT=(P.nrgT||0)-dt)<=0&&S.hp<30&&!P.dead){P.nrgT=12;toast('⚡ 에너지가 얼마 안 남았어요! 물 밖으로 나가요')}}
 else if(P.lastHurt>5&&!P.dead)S.hp=Math.min(100,S.hp+dt*(INT.on&&INT.kind!=='cave'?NRG.rest:nw?NRG.fire:NRG.idle))}
const NRG={swim:2,idle:.25,fire:.8,rest:2.5};   /* 에너지(0~100)가 1초에 줄거나 차는 양: 헤엄 1칸/5초, 쉬기(밖) 1칸/40초, 불 옆 1칸/12초, 텐트·집 안 1칸/4초 */
function hurtSoft(d){if(P.dead)return;S.hp-=d;if(S.hp<=0)die()}
/* ===== 46차(규칙, 기획자 11-21 13:14) 나무·바위 더 단단하게 · 뭉친 나무 따로따로 =====
   - 체력(OBJT_HP): 나무 7·8, 바위 9. 손도끼·맨손은 한 번에 1(0.42초마다) → 나무 7~8번, 바위 9번. 전기톱은 한 번에 2(0.3초마다) → 나무 4번(약 1초).
   - 예전엔 나무 3~4그루가 한 덩어리 모델(OBJT[2] 'trees_A_small')이라 한 번 베면 여러 그루가 같이 사라졌어요.
     이제 그 덩어리는 만들지 않고, 그 자리에 낱그루 하나 + 바로 옆 빈 칸에 낱그루 0~2그루를 따로 심어요(splitClusters, 해시로 정해서 누구에게나 같음). */
const OBJT_HP=[7,8,9,9];OBJT_HP.forEach((h,i)=>{if(OBJT[i])OBJT[i].hp=h});
function objSpotOk(x,z,sd){const h0=hAt(x,z);if(h0<.85||lhD(x,z)<17)return false;const I=islAt(x,z)||ISL[0];if(I.ty===2&&dist(x,z,I.x,I.z)<3.2)return false;
 if(supD(x,z)<8.5||pathD(x,z)<2.6||PORTS.some(p=>dist(x,z,p.x-p.dx*p.R*.4,p.z-p.dz*p.R*.4)<p.R*(p.town?1.05:.9)))return false;if(POI.lh.some(c=>dist(x,z,c.x,c.z)<6))return false;return true}
function objSingle(t,x,z,cx,cz,sd){const T=OBJT[t],I=islAt(x,z)||ISL[0],o={t,x,z,hp:T.hp,re:0,sc:lerp(T.s[0],T.s[1],hash(cx,cz,sd+11)),rot:hash(cx,cz,sd+12)*6.28,sh:0,gk:objKey(t,x,z,UH(hAt(x,z)),I,cx,cz,sd)};
 const sp=['t_oak','t_maple','t_gold'].indexOf(o.gk);if(sp>=0){o.gk=sp?'t_fall':'t_leaf';o.sp=sp}return o}
/* 48차: 새로 심는 나무는 둘레 나무·바위와 사람이 지나갈 틈(나무 사이 2.1m, 바위는 반지름 + 1.5m)을 남겨요 → 나무로 둘러싸여 갇히는 작은 칸이 안 생겨요 */
function objRoom(x,z,ci,cj,add){for(let j=cj-2;j<=cj+2;j++)for(let i=ci-2;i<=ci+2;i++){const k=j*CN+i,o=add.get(k)||objs.get(k);if(!o||o.t>3)continue;const d=dist(o.x,o.z,x,z);if(o.t===3?d<OBJT[3].r*o.sc/5.6+1.5:d<2.1)return false}return true}
function splitClusters(sd){const add=new Map(),NB=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]];let n=0;
 objs.forEach((o,k)=>{if(o.t!==2)return;n++;const cx=k%CN,cz=(k/CN)|0;objs.set(k,objSingle(hash(cx,cz,sd+51)<.5?0:1,o.x,o.z,cx,cz,sd));
  const want=hash(cx,cz,sd+52)<.35?1:2,st=(hash(cx,cz,sd+53)*8)|0;let got=0;
  for(let q=0;q<8&&got<want;q++){const d=NB[(st+q)%8],i=cx+d[0],j=cz+d[1],key=j*CN+i;if(i<1||j<1||i>=CN-1||j>=CN-1||objs.has(key)||add.has(key))continue;
   const x=(i+.5)*CELL+(hash(i,j,sd+1)-.5)*1.8,z=(j+.5)*CELL+(hash(i,j,sd+2)-.5)*1.8;if(!objSpotOk(x,z,sd)||!objRoom(x,z,i,j,add))continue;add.set(key,objSingle(hash(i,j,sd+54)<.5?0:1,x,z,i,j,sd));got++}});
 add.forEach((o,k)=>objs.set(k,o));return {clusters:n,added:add.size}}
/* 48차: 덩어리를 낱그루로 바꾼 자리 둘레에 나무로 둘러싸인 작은 빈칸(못 들어가는 칸)이 생기면 가장 가까운 나무를 하나씩 빼서 열어요(최대 3그루) */
function objPockets(keys,wins){let cut=0;const free=(x,z)=>{if(hAt(x,z)<.12)return false;const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const o=objs.get((cz+j)*CN+cx+i);if(!o)continue;const rr=OBJT[o.t].r;if(rr&&(x-o.x)**2+(z-o.z)**2<(rr+.42)**2)return false}return true};
 const W=[];for(const k of keys){const c=objs.get(k);if(c)W.push([c.x,c.z,4,3])}for(const w of wins||[])W.push(w);
 for(const [wx,wz,H,TR] of W){for(let tries=0;tries<TR;tries++){const st=.5,N=Math.ceil(2*H/st)+1,x0=wx-H,z0=wz-H,G=new Uint8Array(N*N),q=[];
   for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(free(x0+i*st,z0+j*st))G[j*N+i]=1;
   for(let i=0;i<N;i++)for(const j of[0,N-1])for(const[a,b]of[[i,j],[j,i]]){const kk=b*N+a;if(G[kk]===1){G[kk]=2;q.push(kk)}}
   while(q.length){const kk=q.pop(),i=kk%N,j=(kk/N)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const m=b*N+a;if(G[m]===1){G[m]=2;q.push(m)}}}
   let n=0,sx=0,sz=0;{const sn=new Uint8Array(N*N);for(let k0=0;k0<N*N&&n<2;k0++){if(G[k0]!==1||sn[k0])continue;n=0;sx=sz=0;const s2=[k0];sn[k0]=1;while(s2.length){const c2=s2.pop(),i=c2%N,j=(c2/N)|0;n++;sx+=x0+i*st;sz+=z0+j*st;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const m=b*N+a;if(G[m]===1&&!sn[m]){sn[m]=1;s2.push(m)}}}}}if(n<2)break;   /* 갇힌 칸 덩어리 하나씩 */
   const px=sx/n,pz=sz/n;let bk=null,bd=1e9;objs.forEach((o,kk)=>{if(o.t>2||Math.abs(o.x-px)>4||Math.abs(o.z-pz)>4)return;const d=dist(o.x,o.z,px,pz);if(d<bd){bd=d;bk=kk}});if(bk===null)break;objs.delete(bk);cut++}}return cut}
{const _go=genObjects;genObjects=function(sd){_go(sd);const keys=[];objs.forEach((o,k)=>{if(o.t===2)keys.push(k)});genObjects.split=splitClusters(sd);genObjects.split.opened=objPockets(keys,[...PORT_SAFE.map(q=>[q[0],q[1],q[2]+6,12]),...SUPS.map(q=>[q.x,q.z,20,6])])}}   /* 항구·보급지 둘레(갇힌 칸 검사 자리)도 한 번 더 */
