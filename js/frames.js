/* 63차(디자인): 액자 그림 · 카페트 무늬 · 액자 붙이기
   기획자 11-23 08:29: '카페트 종류는 모양은 좋으나 무늬가 아쉽고, 액자들도 다 이상해'
   ① 액자 그림 = 진짜 게임 장면: 리트리버·오리너구리(고르는 캐릭터 그대로), 게임 지도, 등대·고래·텐트와 모닥불·통통배·망치상어 모델을 그린 그림 위에 찍어요.
      그림은 텍스처(캔버스)라서 구조물 모양(GEO, 꼭짓점 색만)에 못 넣고, 구조물에 '그림 판' 메시를 자식으로 붙여요.
   ② 카페트 무늬도 같은 방식: 네모 = 페르시아·킬림 무늬, 원형 = 꽃 만다라(후킹 러그), 타원형 = 땋은 천 러그.
   ③ 액자 붙이기: 텐트·집 안에서는 뒤 벽 면에, 밖에서는 구조물 앞면에 딱 붙어요(진짜 면을 광선으로 재서 높이도 맞춤).
      밖에서 붙일 곳이 없으면 나무 이젤에 세워요. 벽에 붙은 액자는 위에 못과 줄이 보여요.
   빼면: 그림·무늬 판이 없어지고(빈 틀·민무늬 판), 액자는 땅에서 1.22m 높이에 떠 있어요. */
const FRM={tex:{},mat:{},pic:{},ign:null,cache:null,q:[],busy:0,R:null,S:512,
 rugs:{rug_rect:{w:2.38,d:1.58,sh:'rect',tw:1024,th:512,nw:1200,nh:794},rug_round:{w:1.985,d:1.985,sh:'round',tw:512,th:512,nw:1000,nh:1000},rug_oval:{w:2.58,d:1.685,sh:'oval',tw:1024,th:512,nw:1300,nh:850}}};
const frIsF=t=>typeof t==='string'&&t.indexOf('frame_')===0&&!!BUILDS[t]&&!!BUILDS[t].wall;
const frDef=t=>DCF.find(q=>q[0]===t);
function frDims(t){const d=frDef(t),k=.204;return{FW:d[2],FH:d[3],pw:d[2]-k,ph:d[3]-k}}

/* ---------------- 2D 도우미 ---------------- */
function frCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function frRng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function frLin(k,x0,y0,x1,y1,st){const g=k.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
function frRad(k,x,y,r0,r1,st){const g=k.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
function frGrain(k,w,h,a,seed,dark){const R=frRng(seed),im=k.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*a;d[i]=Math.max(0,Math.min(255,d[i]+n));d[i+1]=Math.max(0,Math.min(255,d[i+1]+n));d[i+2]=Math.max(0,Math.min(255,d[i+2]+n*(dark?1:.9)))}k.putImageData(im,0,0)}
function frVig(k,w,h,a,col){k.save();k.globalCompositeOperation='multiply';k.fillStyle=frRad(k,w/2,h/2,Math.min(w,h)*.35,Math.hypot(w,h)*.62,[[0,'rgba(255,255,255,0)'],[1,col||`rgba(60,40,60,${a})`]]);k.fillRect(0,0,w,h);k.restore()}
function frStars(k,w,y1,n,seed,big){const R=frRng(seed);for(let i=0;i<n;i++){const x=R()*w,y=R()*y1,r=.6+R()*1.4,a=.4+R()*.6;k.fillStyle=`rgba(255,248,215,${a*(1-y/y1*.6)})`;k.beginPath();k.arc(x,y,r,0,7);k.fill()}
 for(let i=0;i<(big||0);i++){const x=R()*w,y=R()*y1*.8,s=4+R()*4;k.save();k.translate(x,y);k.fillStyle='rgba(255,250,225,.95)';k.beginPath();for(let j=0;j<8;j++){const a=j/8*Math.PI*2,rr=j%2?s*.22:s;k.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}k.closePath();k.fill();k.restore()}}
function frCloud(k,x,y,s,c1,c2){k.save();k.translate(x,y);k.scale(s,s);const B=[[-38,6,22],[-14,-8,28],[14,-4,24],[36,8,18],[0,10,26],[-24,14,18],[24,14,18]];k.fillStyle=c2;for(const [a,b,r] of B){k.beginPath();k.arc(a,b+5,r,0,7);k.fill()}k.fillStyle=c1;for(const [a,b,r] of B){k.beginPath();k.arc(a,b,r,0,7);k.fill()}k.restore()}
function frBird(k,x,y,s,c){k.save();k.strokeStyle=c;k.lineWidth=Math.max(1.4,s*.22);k.lineCap='round';k.beginPath();k.moveTo(x-s,y-s*.3);k.quadraticCurveTo(x-s*.45,y-s*.75,x,y);k.quadraticCurveTo(x+s*.45,y-s*.75,x+s,y-s*.3);k.stroke();k.restore()}

/* ---------------- 3D 찍기: 게임 모델을 투명 배경에 찍어 캔버스로 ---------------- */
function frRen(W,H){let r=FRM.R;if(!r){r=FRM.R=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(1)}r.setSize(W,H,false);r.setClearColor(0x000000,0);return r}
function frShot(W,H,build){const r=frRen(W,H),sc=new THREE.Scene(),cam=build(sc);r.render(sc,cam);const c=frCv(W,H);c.getContext('2d').drawImage(r.domElement,0,0);c.cam=cam;sc.traverse(o=>{if(o.isMesh&&o._ftmpG)o.geometry.dispose()});return c}
function frDone(){if(FRM.R){FRM.R.dispose();if(FRM.R.forceContextLoss)FRM.R.forceContextLoss();FRM.R=null}}
const frM=(g,x,y,z,ry,s,mat)=>{const m=new THREE.Mesh(g,mat||MATT);m.position.set(x||0,y||0,z||0);m.rotation.y=ry||0;if(s)m.scale.setScalar(s);return m};
function frProj(cam,W,H,x,y,z){const v=new THREE.Vector3(x,y,z).project(cam);return[(v.x+1)/2*W,(1-v.y)/2*H]}
/* 한 모델(들)을 화면에 꼭 맞게: 방향(yaw·pitch)과 시야각으로 거리를 정해요 */
function frSprite(W,H,parts,o){return frShot(W,H,sc=>{const g=new THREE.Group();for(const p of parts)g.add(p);sc.add(g);
 sc.add(new THREE.HemisphereLight(o.sky||0xfff4e6,o.gnd||0x6f6a78,o.hi==null?1.0:o.hi));const d=new THREE.DirectionalLight(o.key||0xfff0dc,o.ki==null?.9:o.ki);d.position.set(...(o.kp||[3,5,4]));sc.add(d);
 if(o.fill){const f=new THREE.DirectionalLight(o.fill,o.fi||.35);f.position.set(-4,1,-2);sc.add(f)}
 const bx=new THREE.Box3().setFromObject(g),c=bx.getCenter(new THREE.Vector3()),sz=bx.getSize(new THREE.Vector3()),rad=sz.length()/2,fov=o.fov||22;
 const cam=new THREE.PerspectiveCamera(fov,W/H,.05,500),dist=rad/Math.sin(fov*Math.PI/360)*(o.zoom||1),yaw=o.yaw||0,pit=o.pitch||.12;
 cam.position.set(c.x+Math.sin(yaw)*Math.cos(pit)*dist,c.y+Math.sin(pit)*dist,c.z+Math.cos(yaw)*Math.cos(pit)*dist);cam.lookAt(c.x+(o.ox||0),c.y+(o.oy||0),c.z);return cam})}
/* 투명 캔버스에서 그려진 곳의 상자 [x0,y0,x1,y1] */
function frBox(c){const k=c.getContext('2d'),d=k.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(d[(y*W+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?[0,0,W,H]:[x0,y0,x1+2,y1+2]}
/* 상자를 (cx, 바닥 by)에 높이 hh로 맞춰 그리기 */
function frPut(k,c,cx,by,hh,flip){const b=frBox(c),w=b[2]-b[0],h=b[3]-b[1],s=hh/h;k.save();if(flip){k.translate(cx,by);k.scale(1,-1);k.drawImage(c,b[0],b[1],w,h,-w*s/2,-h*s,w*s,h*s)}else k.drawImage(c,b[0],b[1],w,h,cx-w*s/2,by-h*s,w*s,h*s);k.restore();return{x:cx-w*s/2,y:by-h*s,w:w*s,h:h*s,s,b}}
function frTint(c,col,a){const t=frCv(c.width,c.height),k=t.getContext('2d');k.drawImage(c,0,0);k.globalCompositeOperation='source-atop';k.globalAlpha=a;k.fillStyle=col;k.fillRect(0,0,t.width,t.height);return t}
/* 캐릭터 초상: dgPortrait과 같은 방식(Actor + dogApply), 머리·가슴만 크게 */
function frPortrait(v,W,H){const a=new Actor('hero');scene.remove(a.root);let c;try{a.root.rotation.y=.32;a.play('Idle',{force:1});a.mixer.update(.55);if(typeof DGV!=='undefined'&&DGV[v])dogApply(a,v);
  c=frShot(W,H,sc=>{sc.add(a.root);sc.add(new THREE.HemisphereLight(0xfff2e0,0x806a5a,1.0));const d=new THREE.DirectionalLight(0xfff4e4,1.0);d.position.set(2.5,4,6);sc.add(d);const f=new THREE.DirectionalLight(0xffe0b8,.35);f.position.set(-4,2,-3);sc.add(f);
   const cam=new THREE.PerspectiveCamera(FRM.pf||19,W/H,.1,50);cam.position.set(.35,1.55,6.6);cam.lookAt(0,FRM.py||1.12,0);return cam});
 }finally{if(a.dog)dogApply(a,null);if(a.root.parent)a.root.parent.remove(a.root)}return c}

/* ---------------- 액자 그림 8종 (가로 576×397 · 세로 380×513) ---------------- */
const FRP={
 frame_dog(k,W,H){k.fillStyle=frRad(k,W/2,H*.42,10,H*.75,[[0,'#fff3c9'],[.55,'#fbd27c'],[1,'#ee9f4f']]);k.fillRect(0,0,W,H);
  k.save();k.translate(W/2,H*.4);for(let i=0;i<18;i++){k.rotate(Math.PI*2/18);k.fillStyle=i%2?'rgba(255,248,215,.32)':'rgba(255,255,255,0)';k.beginPath();k.moveTo(0,0);k.lineTo(-H*.09,-H);k.lineTo(H*.09,-H);k.fill()}k.restore();
  const R=frRng(7);for(let i=0;i<9;i++){const x=R()*W,y=R()*H*.55,s=7+R()*5;k.save();k.translate(x,y);k.rotate(R()*.8-.4);k.fillStyle='rgba(214,120,60,.18)';k.beginPath();k.ellipse(0,s*.35,s*.55,s*.45,0,0,7);k.fill();for(let j=0;j<4;j++){k.beginPath();k.ellipse((j-1.5)*s*.42,-s*.25-Math.abs(j-1.5)*-s*.08,s*.17,s*.22,0,0,7);k.fill()}k.restore()}
  k.fillStyle=frLin(k,0,H*.78,0,H,[[0,'rgba(238,150,80,0)'],[1,'rgba(214,112,58,.55)']]);k.fillRect(0,H*.7,W,H*.3);
  const c=frPortrait('dog',W*2,H*2);if(c){const b=frBox(c);const s=(H*1.04)/(c.height);k.drawImage(c,W/2-c.width*s/2+W*.02,H*.03,c.width*s,c.height*s)}
  frVig(k,W,H,.28)},
 frame_plat(k,W,H){k.fillStyle=frLin(k,0,0,0,H,[[0,'#d9f3ea'],[.6,'#a6e0d0'],[1,'#7cc9b8']]);k.fillRect(0,0,W,H);
  k.strokeStyle='rgba(255,255,255,.45)';for(let i=0;i<5;i++){k.lineWidth=3-i*.4;k.beginPath();k.ellipse(W/2,H*.62,W*(.18+i*.12),H*(.05+i*.035),0,0,7);k.stroke()}
  const pad=(x,y,r,a)=>{k.save();k.translate(x,y);k.rotate(a);k.fillStyle='#5aa36a';k.beginPath();k.moveTo(0,0);k.arc(0,0,r,.35,Math.PI*2-.05);k.closePath();k.fill();k.fillStyle='#78c07c';k.beginPath();k.moveTo(0,0);k.arc(0,0,r*.82,.4,Math.PI*2-.1);k.closePath();k.fill();
   k.strokeStyle='rgba(60,120,70,.5)';k.lineWidth=1.5;for(let j=0;j<6;j++){const t=.5+j*.95;k.beginPath();k.moveTo(0,0);k.lineTo(Math.cos(t)*r*.8,Math.sin(t)*r*.8);k.stroke()}k.restore()};
  pad(W*.12,H*.86,46,-.6);pad(W*.9,H*.9,40,2.2);pad(W*.82,H*.74,26,1.1);pad(W*.2,H*.7,22,.4);
  const lotus=(x,y,s)=>{for(let j=0;j<7;j++){const a=-Math.PI/2+(j-3)*.42;k.save();k.translate(x,y);k.rotate(a+Math.PI/2);k.fillStyle=j%2?'#f6a7c1':'#f08bb0';k.beginPath();k.ellipse(0,-s*.55,s*.26,s*.6,0,0,7);k.fill();k.restore()}k.fillStyle='#ffd65c';k.beginPath();k.arc(x,y-s*.1,s*.2,0,7);k.fill()};
  lotus(W*.14,H*.8,30);lotus(W*.88,H*.84,24);
  const R=frRng(11);for(let i=0;i<14;i++){const x=R()*W,y=R()*H*.6,r=2+R()*5;k.strokeStyle='rgba(255,255,255,.75)';k.lineWidth=1.4;k.beginPath();k.arc(x,y,r,0,7);k.stroke();k.fillStyle='rgba(255,255,255,.5)';k.beginPath();k.arc(x-r*.35,y-r*.35,r*.25,0,7);k.fill()}
  const c=frPortrait('plat',W*2,H*2);if(c){const s=(H*1.04)/(c.height);k.drawImage(c,W/2-c.width*s/2+W*.02,H*.04,c.width*s,c.height*s)}
  frVig(k,W,H,.22,'rgba(30,80,80,.25)')},
 frame_map(k,W,H){const P=frCv(W,H),q=P.getContext('2d');
  q.fillStyle=frRad(q,W/2,H/2,20,W*.7,[[0,'#f3e6c4'],[.7,'#e8d4a6'],[1,'#c9a76c']]);q.fillRect(0,0,W,H);
  const m=Math.round(W*.06),iw=W-2*m,ih=H-2*m,x0=30,x1=970,zc=500,sp=(x1-x0)/iw,z0=zc-ih*sp/2,im=q.getImageData(m,m,iw,ih),d=im.data,src=MAPC.getContext('2d').getImageData(0,0,WS,WS).data;
  const land=new Uint8Array(iw*ih),dist=new Float32Array(iw*ih).fill(1e9);
  for(let j=0;j<ih;j++)for(let i=0;i<iw;i++){const wx=x0+i*sp,wz=z0+j*sp,h=hAt(wx,wz);land[j*iw+i]=h>=0?1:0}
  /* 바다: 땅까지 거리(픽셀) — 두 번 훑는 거리 변환 */
  for(let j=0;j<ih;j++)for(let i=0;i<iw;i++){const o=j*iw+i;if(land[o]){dist[o]=0;continue}let v=dist[o];if(i>0)v=Math.min(v,dist[o-1]+1);if(j>0)v=Math.min(v,dist[o-iw]+1);if(i>0&&j>0)v=Math.min(v,dist[o-iw-1]+1.41);if(i<iw-1&&j>0)v=Math.min(v,dist[o-iw+1]+1.41);dist[o]=v}
  for(let j=ih-1;j>=0;j--)for(let i=iw-1;i>=0;i--){const o=j*iw+i;let v=dist[o];if(i<iw-1)v=Math.min(v,dist[o+1]+1);if(j<ih-1)v=Math.min(v,dist[o+iw]+1);if(i<iw-1&&j<ih-1)v=Math.min(v,dist[o+iw+1]+1.41);if(i>0&&j<ih-1)v=Math.min(v,dist[o+iw-1]+1.41);dist[o]=v}
  for(let j=0;j<ih;j++)for(let i=0;i<iw;i++){const o=j*iw+i,wx=x0+i*sp,wz=z0+j*sp,so=((wz|0)*WS+(wx|0))*4,a=o*4;let r,g,b;
   if(land[o]){const h=hAt(wx,wz),coast=(i>0&&!land[o-1])||(i<iw-1&&!land[o+1])||(j>0&&!land[o-iw])||(j<ih-1&&!land[o+iw]);
    if(coast){r=96;g=70;b=46}else if(h<.9){r=232;g=212;b=158}else{const L=(src[so]+src[so+1]+src[so+2])/3/255,f=.72+L*.5;r=168*f;g=180*f;b=118*f;if(typeof pathD==='function'&&pathD(wx,wz)<2.2){r=178;g=146;b=102}}}
   else{const t=Math.min(1,dist[o]/40);r=168-60*t;g=214-62*t;b=212-40*t;const dd=dist[o];if(Math.abs(dd-3.2)<.7||Math.abs(dd-7.5)<.6){r=r*.82+255*.18;g=g*.82+255*.18;b=b*.82+255*.18}}
   const pr=d[a],pg=d[a+1],pb=d[a+2];d[a]=r*.86+pr*.14;d[a+1]=g*.86+pg*.14;d[a+2]=b*.86+pb*.14}
  q.putImageData(im,m,m);
  const W2P=(wx,wz)=>[m+(wx-x0)/sp,m+(wz-z0)/sp];
  q.strokeStyle='rgba(70,110,130,.45)';q.lineWidth=1.3;const R=frRng(3);for(let i=0;i<40;i++){const x=m+R()*iw,y=m+R()*ih,o=((y-m)|0)*iw+((x-m)|0);if(land[o]||dist[o]<12)continue;q.beginPath();q.moveTo(x-6,y);q.quadraticCurveTo(x-3,y-3,x,y);q.quadraticCurveTo(x+3,y+3,x+6,y);q.stroke()}
  q.save();q.beginPath();q.rect(m+6,m+6,iw-12,ih-12);q.clip();
  for(let i=0;i<LH_SITES.length;i++){if(LH_GONE.includes(i))continue;const [x,y]=W2P(LH_SITES[i][0],LH_SITES[i][1]);q.fillStyle='#f7f0e3';q.strokeStyle='#5b3d2b';q.lineWidth=1.2;q.beginPath();q.moveTo(x-3,y+5);q.lineTo(x+3,y+5);q.lineTo(x+2,y-5);q.lineTo(x-2,y-5);q.closePath();q.fill();q.stroke();q.fillStyle='#e0533f';q.fillRect(x-2.3,y-1,4.6,2);q.fillStyle='#f7d94a';q.beginPath();q.arc(x,y-7,2.2,0,7);q.fill()}
  for(const ps of PORT_SITES){const [x,y]=W2P(ps[0],ps[1]);q.fillStyle='#e0533f';q.strokeStyle='#fff7e6';q.lineWidth=1.6;q.beginPath();q.arc(x,y,4,0,7);q.fill();q.stroke()}q.restore();
  {const cx=W-m-34,cy=H-m-34,r=24;q.save();q.translate(cx,cy);q.fillStyle='rgba(243,230,196,.9)';q.beginPath();q.arc(0,0,r+6,0,7);q.fill();q.strokeStyle='#7a5236';q.lineWidth=1.2;q.beginPath();q.arc(0,0,r+3,0,7);q.stroke();
   for(let j=0;j<8;j++){const a=j*Math.PI/4,L=j%2?r*.55:r;q.fillStyle=j%2?'#c9a76c':(j===0?'#c9503f':'#5b3d2b');q.beginPath();q.moveTo(Math.sin(a)*L,-Math.cos(a)*L);q.lineTo(Math.sin(a+.32)*r*.18,-Math.cos(a+.32)*r*.18);q.lineTo(Math.sin(a-.32)*r*.18,-Math.cos(a-.32)*r*.18);q.fill()}
   q.fillStyle='#5b3d2b';q.font=`900 10px ${UIF}`;q.textAlign='center';q.fillText('N',0,-r-8);q.restore()}
  {const cx=W/2,y=m+4,w=150;q.fillStyle='#b5543a';q.beginPath();q.moveTo(cx-w/2-16,y+4);q.lineTo(cx-w/2,y+4);q.lineTo(cx-w/2,y+26);q.lineTo(cx-w/2-16,y+26);q.lineTo(cx-w/2-8,y+15);q.fill();q.beginPath();q.moveTo(cx+w/2+16,y+4);q.lineTo(cx+w/2,y+4);q.lineTo(cx+w/2,y+26);q.lineTo(cx+w/2+16,y+26);q.lineTo(cx+w/2+8,y+15);q.fill();
   q.fillStyle='#d9694c';q.fillRect(cx-w/2,y,w,24);q.fillStyle='#fff3dc';q.font=`900 15px ${UIF}`;q.textAlign='center';q.textBaseline='middle';q.fillText('초승달섬',cx,y+12.5)}
  q.strokeStyle='#7a5236';q.lineWidth=2;q.strokeRect(m-6,m-6,iw+12,ih+12);q.lineWidth=.8;q.strokeRect(m-2,m-2,iw+4,ih+4);
  frGrain(q,W,H,14,5);frVig(q,W,H,.0,'rgba(120,80,40,.45)');k.drawImage(P,0,0)},
 frame_lh(k,W,H){const hz=H*.63;k.fillStyle=frLin(k,0,0,0,hz,[[0,'#121a3c'],[.55,'#26316a'],[1,'#5d4f92']]);k.fillRect(0,0,W,hz);frStars(k,W,hz*.9,90,21,6);
  k.fillStyle=frRad(k,W*.8,H*.17,4,60,[[0,'rgba(255,246,210,.55)'],[1,'rgba(255,246,210,0)']]);k.fillRect(0,0,W,hz);k.fillStyle='#f8efc8';k.beginPath();k.arc(W*.8,H*.17,17,0,7);k.fill();k.fillStyle='#2a3570';k.beginPath();k.arc(W*.8+8,H*.17-5,15,0,7);k.fill();
  k.fillStyle='#202956';k.beginPath();k.moveTo(W*.62,hz);k.quadraticCurveTo(W*.72,hz-22,W*.84,hz-8);k.quadraticCurveTo(W*.92,hz-14,W,hz-6);k.lineTo(W,hz);k.fill();
  k.fillStyle=frLin(k,0,hz,0,H,[[0,'#24346a'],[1,'#0f1838']]);k.fillRect(0,hz,W,H-hz);
  const R=frRng(4);for(let i=0;i<70;i++){const y=hz+4+R()*(H-hz-6),x=W*.8+(R()-.5)*(30+(y-hz)*.9),w=4+R()*14;k.fillStyle=`rgba(250,238,190,${.25+R()*.5})`;k.fillRect(x-w/2,y,w,1.6)}
  for(let i=0;i<50;i++){const y=hz+6+R()*(H-hz),x=R()*W,w=6+R()*16;k.fillStyle=`rgba(120,150,220,${.15+R()*.25})`;k.fillRect(x,y,w,1.4)}
  const L=frSprite(600,700,[frM(GEO.lighthouse,0,0,0,0)],{yaw:-.5,pitch:.1,fov:18,sky:0x8fa4ff,gnd:0x1a2040,hi:.75,key:0xb8c6ff,ki:.55,kp:[-3,5,4],fill:0xffc070,fi:.5});
  const rx=W*.33,ry=hz+44;
  k.fillStyle='#3b4260';k.beginPath();k.moveTo(rx-112,ry+16);k.quadraticCurveTo(rx-90,ry-22,rx-52,ry-30);k.quadraticCurveTo(rx-10,ry-44,rx+40,ry-32);k.quadraticCurveTo(rx+86,ry-22,rx+112,ry+16);k.closePath();k.fill();
  k.fillStyle='#525a7c';for(const [a,b,c,d] of [[-70,-20,30,16],[-20,-32,36,18],[34,-24,30,15],[-96,-2,22,12],[82,0,24,12]]){k.beginPath();k.ellipse(rx+a,ry+b,c,d,0,0,7);k.fill()}
  k.fillStyle='#6d76a0';for(const [a,b,c,d] of [[-66,-28,16,6],[-14,-42,20,7],[38,-31,15,5]]){k.beginPath();k.ellipse(rx+a,ry+b,c,d,0,0,7);k.fill()}
  const lp=frPut(k,L,rx,ry-26,H*.66);const lx=lp.x+lp.w*.5,ly=lp.y+lp.h*.085;
  k.save();k.globalCompositeOperation='lighter';k.fillStyle=frLin(k,lx,ly,0,ly-30,[[0,'rgba(255,236,160,.55)'],[1,'rgba(255,236,160,0)']]);k.beginPath();k.moveTo(lx,ly);k.lineTo(-10,ly-70);k.lineTo(-10,ly+20);k.closePath();k.fill();
  k.fillStyle=frLin(k,lx,ly,W,ly,[[0,'rgba(255,236,160,.35)'],[1,'rgba(255,236,160,0)']]);k.beginPath();k.moveTo(lx,ly);k.lineTo(W*.72,ly-40);k.lineTo(W*.72,ly+6);k.closePath();k.fill();
  k.fillStyle=frRad(k,lx,ly,2,46,[[0,'rgba(255,240,180,.95)'],[.3,'rgba(255,214,120,.5)'],[1,'rgba(255,200,100,0)']]);k.fillRect(lx-50,ly-50,100,100);k.restore();
  k.strokeStyle='rgba(235,240,255,.75)';k.lineWidth=2;k.lineCap='round';for(let i=0;i<9;i++){const a=rx-104+i*26,b=ry+12+(i%2)*4;k.beginPath();k.moveTo(a,b);k.quadraticCurveTo(a+8,b-4,a+16,b);k.stroke()}
  frGrain(k,W,H,8,9);frVig(k,W,H,.3,'rgba(20,20,50,.45)')},
 frame_whale(k,W,H){const hz=H*.6;k.fillStyle=frLin(k,0,0,0,hz,[[0,'#6c5fa8'],[.45,'#e58aa0'],[.8,'#ffb56e'],[1,'#ffd88a']]);k.fillRect(0,0,W,hz);
  const sx=W*.7,sy=hz;k.fillStyle=frRad(k,sx,sy,10,150,[[0,'rgba(255,240,180,.8)'],[1,'rgba(255,200,140,0)']]);k.fillRect(0,0,W,hz);k.fillStyle='#fff1b8';k.beginPath();k.arc(sx,sy,42,Math.PI,0);k.fill();
  k.fillStyle='rgba(255,190,170,.55)';for(const [x,y,w,h] of [[.18,.22,.22,.035],[.32,.3,.18,.03],[.78,.16,.24,.035],[.6,.36,.2,.028]]){k.beginPath();k.ellipse(W*x,H*y,W*w/2,H*h,0,0,7);k.fill()}
  for(const [x,y,s] of [[.42,.18,9],[.47,.15,7],[.52,.2,6]])frBird(k,W*x,H*y,s,'rgba(80,50,90,.8)');
  k.fillStyle=frLin(k,0,hz,0,H,[[0,'#5672b0'],[1,'#2a3d7c']]);k.fillRect(0,hz,W,H-hz);
  const R=frRng(8);for(let i=0;i<80;i++){const y=hz+2+R()*(H-hz),x=sx+(R()-.5)*(50+(y-hz)*1.1),w=5+R()*18;k.fillStyle=`rgba(255,214,140,${.3+R()*.5})`;k.fillRect(x-w/2,y,w,1.8)}
  for(let i=0;i<60;i++){const y=hz+5+R()*(H-hz),x=R()*W,w=8+R()*18;k.fillStyle=`rgba(170,190,240,${.12+R()*.2})`;k.fillRect(x,y,w,1.5)}
  const wg=whGeo(),tail=new THREE.Mesh(wg.tg,MATT);tail.userData.tmpG=1;tail.position.set(0,.35,-5.8);tail.rotation.x=-.75;const body=new THREE.Mesh(wg.g,MATT);body.userData.tmpG=1;
  const G=new THREE.Group();G.add(body,tail);G.rotation.x=.1;const C=frSprite(900,520,[G],{yaw:-1.05,pitch:.32,fov:20,sky:0xffe2c8,gnd:0x40507a,hi:.95,key:0xffc890,ki:.95,kp:[4,4,-2],fill:0x8090d0,fi:.3});
  const wl=hz+44,T=frCv(W,H),t=T.getContext('2d'),wp=frPut(t,C,W*.4,wl+30,H*.27);
  k.save();k.globalAlpha=.32;k.drawImage(T,0,0);k.restore();k.save();k.beginPath();k.rect(0,0,W,wl+2);k.clip();k.drawImage(T,0,0);k.restore();
  k.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<26;i++){const a=wp.x+wp.w*(.08+R()*.84),b=wl-1+R()*4,w=6+R()*14;k.beginPath();k.ellipse(a,b,w,2.2,0,0,7);k.fill()}
  const bx=wp.x+wp.w*.8,by=wl-wp.h*.32;for(let i=0;i<34;i++){const a=-Math.PI/2+(R()-.5)*1.1,dd=10+R()*48,r=1.2+R()*2.6;k.fillStyle=`rgba(255,255,255,${.5+R()*.5})`;k.beginPath();k.arc(bx+Math.cos(a)*dd*.7,by+Math.sin(a)*dd,r,0,7);k.fill()}
  k.fillStyle=frRad(k,bx,by-36,2,30,[[0,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);k.fillRect(bx-40,by-76,80,80);
  frGrain(k,W,H,8,13);frVig(k,W,H,.25,'rgba(70,40,80,.35)')},
 frame_camp(k,W,H){const hz=H*.5;k.fillStyle=frLin(k,0,0,0,hz+40,[[0,'#101d33'],[.6,'#1f3a55'],[1,'#36586a']]);k.fillRect(0,0,W,H);frStars(k,W,hz*.95,80,31,5);
  k.fillStyle='#f6ecc6';k.beginPath();k.arc(W*.16,H*.15,12,0,7);k.fill();k.fillStyle=frRad(k,W*.16,H*.15,10,46,[[0,'rgba(246,236,198,.35)'],[1,'rgba(246,236,198,0)']]);k.fillRect(0,0,W*.4,H*.4);
  k.fillStyle='#1b3242';k.beginPath();k.moveTo(0,hz+10);k.quadraticCurveTo(W*.2,hz-30,W*.42,hz+4);k.quadraticCurveTo(W*.66,hz-34,W,hz-2);k.lineTo(W,H);k.lineTo(0,H);k.fill();
  const C=frShot(W*2,H*2,sc=>{const gnd=new THREE.Mesh(new THREE.CircleGeometry(18,48),new THREE.MeshLambertMaterial({color:0x3e6b3a}));gnd.rotation.x=-Math.PI/2;gnd.userData.tmpG=1;sc.add(gnd);
   sc.add(frM(GEO.mtent,-1.7,0,-.6,.35,1.45),frM(GEO.firepit,1.35,0,1.1,0,1));
   for(const [x,z,s,g] of [[-5.6,-4.2,4.2,'tree_single_B'],[-3.4,-6.4,3.8,'tree_single_A'],[.2,-6.8,4.4,'tree_single_B'],[3.2,-5.2,3.6,'tree_single_A'],[5.8,-3.6,4.4,'tree_single_B'],[6.6,-7,3.8,'tree_single_A'],[-7.2,-1.2,3.6,'tree_single_A']])if(GEO[g])sc.add(frM(GEO[g],x,0,z,x,s));
   if(GEO.lk_logs)sc.add(frM(GEO.lk_logs,2.9,0,.2,1.2,1.6));
   sc.add(new THREE.HemisphereLight(0x5e74a8,0x0e1620,.55));const m=new THREE.DirectionalLight(0x9fb4ff,.35);m.position.set(-3,6,2);sc.add(m);const f=new THREE.PointLight(0xffa850,3.2,14,1.6);f.position.set(1.35,1.1,1.1);sc.add(f);
   const cam=new THREE.PerspectiveCamera(26,W/H,.1,100);cam.position.set(.6,3.6,10.5);cam.lookAt(0,.9,-.4);return cam});
  const fp=frProj(C.cam,W*2,H*2,1.35,.75,1.1).map(v=>v/2);k.drawImage(C,0,0,W,H);
  k.save();k.globalCompositeOperation='lighter';k.fillStyle=frRad(k,fp[0],fp[1],4,150,[[0,'rgba(255,170,80,.45)'],[.5,'rgba(255,130,50,.12)'],[1,'rgba(255,120,40,0)']]);k.fillRect(0,0,W,H);
  const fl=(s,c,o)=>{k.fillStyle=c;k.beginPath();k.moveTo(fp[0]-s*.55+o,fp[1]);k.quadraticCurveTo(fp[0]-s*.6+o,fp[1]-s*1.1,fp[0]+o*.3,fp[1]-s*1.9);k.quadraticCurveTo(fp[0]+s*.6+o,fp[1]-s*1.1,fp[0]+s*.55+o,fp[1]);k.closePath();k.fill()};
  fl(22,'rgba(255,110,40,.9)',0);fl(16,'rgba(255,170,60,.9)',-3);fl(10,'rgba(255,236,150,.95)',2);k.restore();
  const R=frRng(17);for(let i=0;i<16;i++){k.fillStyle=`rgba(255,${180+R()*60|0},90,${.5+R()*.5})`;k.beginPath();k.arc(fp[0]+(R()-.5)*50,fp[1]-30-R()*90,.8+R()*1.6,0,7);k.fill()}
  for(let i=0;i<12;i++){const x=R()*W,y=hz-20+R()*H*.35;k.fillStyle=frRad(k,x,y,0,6,[[0,'rgba(220,255,140,.9)'],[1,'rgba(220,255,140,0)']]);k.fillRect(x-6,y-6,12,12)}
  frGrain(k,W,H,8,19);frVig(k,W,H,.35,'rgba(10,20,40,.5)')},
 frame_boat(k,W,H){const hz=H*.52;k.fillStyle=frLin(k,0,0,0,hz,[[0,'#7cc6ee'],[1,'#d6f0fa']]);k.fillRect(0,0,W,hz);
  k.fillStyle=frRad(k,W*.84,H*.14,4,60,[[0,'rgba(255,250,210,.95)'],[.3,'rgba(255,240,170,.6)'],[1,'rgba(255,240,170,0)']]);k.fillRect(W*.6,0,W*.4,H*.4);
  frCloud(k,W*.22,H*.18,.9,'#ffffff','#cfe6f4');frCloud(k,W*.56,H*.1,.6,'#ffffff','#d2e8f5');frCloud(k,W*.9,H*.33,.5,'#ffffff','#d2e8f5');
  k.fillStyle='#6f9fb5';k.beginPath();k.moveTo(W*.02,hz);k.quadraticCurveTo(W*.1,hz-24,W*.2,hz-14);k.quadraticCurveTo(W*.26,hz-20,W*.32,hz);k.fill();
  k.fillStyle='#f7f0e3';k.fillRect(W*.135,hz-36,5,16);k.fillStyle='#e0533f';k.fillRect(W*.135,hz-30,5,4);
  for(const [x,y,s] of [[.36,.24,8],[.42,.2,6],[.7,.3,7]])frBird(k,W*x,H*y,s,'#ffffff');
  k.fillStyle=frLin(k,0,hz,0,H,[[0,'#4fb0d6'],[1,'#2278a8']]);k.fillRect(0,hz,W,H-hz);
  const R=frRng(6);for(let i=0;i<90;i++){const y=hz+3+R()*(H-hz),x=R()*W,w=5+R()*16;k.fillStyle=`rgba(255,255,255,${.15+R()*.4})`;k.fillRect(x,y,w,1.6)}
  const px=W*.74,py=hz+30;k.fillStyle='#8a6340';for(let i=0;i<5;i++){const x=px+i*34;k.fillRect(x,py-6,7,70)}
  k.fillStyle='#c68f5a';k.beginPath();k.moveTo(px-12,py-16);k.lineTo(W+4,py-24);k.lineTo(W+4,py-4);k.lineTo(px-12,py+2);k.closePath();k.fill();k.strokeStyle='rgba(110,70,40,.6)';k.lineWidth=1;for(let i=0;i<12;i++){const x=px-6+i*14;k.beginPath();k.moveTo(x,py-16-i*.6);k.lineTo(x,py+2-i*.6);k.stroke()}
  k.fillStyle='#a8743f';k.fillRect(px-12,py+2,W-px+16,4);
  k.fillStyle='#f28c38';k.beginPath();k.arc(W*.6,hz+56,5,0,7);k.fill();k.fillStyle='#ffffff';k.fillRect(W*.6-5,hz+55,10,2);
  const parts=[frM(GEO.fboat,0,0,0,0)];if(GEO.lk_fboat_glow)parts.push(frM(GEO.lk_fboat_glow,0,0,0,0));
  const C=frSprite(820,620,parts,{yaw:-.75,pitch:.14,fov:20,sky:0xfff6e8,gnd:0x5a8aa8,hi:1.0,key:0xfff0d0,ki:1.0,kp:[4,6,5],fill:0x9cd0ff,fi:.3});
  const wl=hz+62,T=frCv(W,H),t=T.getContext('2d'),bp=frPut(t,C,W*.38,wl+16,H*.56);
  k.save();k.beginPath();k.rect(0,wl,W,H-wl);k.clip();k.globalAlpha=.22;k.translate(0,2*wl+8);k.scale(1,-1);k.drawImage(T,0,0);k.restore();
  k.save();k.beginPath();k.rect(0,0,W,wl+6);k.clip();k.drawImage(T,0,0);k.restore();
  k.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<18;i++){const a=bp.x+bp.w*(.1+R()*.8),b=wl+3+R()*5,w=6+R()*12;k.beginPath();k.ellipse(a,b,w,2,0,0,7);k.fill()}
  frGrain(k,W,H,7,23);frVig(k,W,H,.18,'rgba(40,70,110,.3)')},
 frame_shark(k,W,H){k.fillStyle=frLin(k,0,0,0,H,[[0,'#56b6d6'],[.45,'#2a82ad'],[1,'#103e66']]);k.fillRect(0,0,W,H);
  k.strokeStyle='rgba(220,248,255,.55)';k.lineWidth=2;for(let r=0;r<3;r++){k.beginPath();for(let x=0;x<=W;x+=8){const y=8+r*9+Math.sin(x*.05+r*2)*3;x?k.lineTo(x,y):k.moveTo(x,y)}k.stroke()}
  k.save();k.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const x=W*(.05+i*.18),w=26+i%3*14;k.fillStyle=frLin(k,0,0,0,H,[[0,'rgba(200,245,255,.22)'],[1,'rgba(200,245,255,0)']]);k.beginPath();k.moveTo(x,0);k.lineTo(x+w,0);k.lineTo(x+w+90,H);k.lineTo(x+40,H);k.closePath();k.fill()}k.restore();
  k.fillStyle='#c9b27c';k.beginPath();k.moveTo(0,H*.86);k.quadraticCurveTo(W*.25,H*.8,W*.5,H*.88);k.quadraticCurveTo(W*.75,H*.8,W,H*.85);k.lineTo(W,H);k.lineTo(0,H);k.fill();
  k.fillStyle='rgba(16,62,102,.35)';k.fillRect(0,H*.8,W,H*.2);
  const R=frRng(29);const weed=(x,h,c)=>{k.strokeStyle=c;k.lineWidth=5;k.lineCap='round';k.beginPath();k.moveTo(x,H);for(let i=1;i<=6;i++){const y=H-h*i/6;k.lineTo(x+Math.sin(i*1.3+x)*7,y)}k.stroke()};
  for(const [x,h] of [[.06,90],[.1,62],[.9,100],[.94,70],[.84,54],[.22,40]])weed(W*x,h,'#3f9a62');for(const [x,h] of [[.08,70],[.92,80]])weed(W*x,h,'#62b86e');
  for(const [x,c] of [[.3,'#f28c6a'],[.72,'#f6b14a'],[.58,'#e86f8f']]){k.fillStyle=c;for(let j=0;j<5;j++){k.beginPath();k.arc(W*x+(j-2)*7,H*.9-Math.abs(j-2)*-4-10-(j%2)*8,6,0,7);k.fill()}}
  const fish=(x,y,s,c)=>{k.fillStyle=c;k.beginPath();k.ellipse(x,y,s,s*.45,0,0,7);k.fill();k.beginPath();k.moveTo(x-s*.8,y);k.lineTo(x-s*1.5,y-s*.5);k.lineTo(x-s*1.5,y+s*.5);k.fill();k.fillStyle='#16324a';k.beginPath();k.arc(x+s*.5,y-s*.08,s*.12,0,7);k.fill()};
  for(let i=0;i<11;i++)fish(W*.62+R()*W*.3,H*.16+R()*H*.2,6+R()*3,i%3?'#f7d94a':'#f6a04a');
  const f=FISH.find(q=>q.id==='f_hammer'),g=fishGeoK(f),m=new THREE.Mesh(g,MATT);m.userData.tmpG=1;
  const C=frSprite(900,560,[m],{yaw:-1.32,pitch:.22,fov:20,sky:0xe0f4ff,gnd:0x16486e,hi:1.0,key:0xd8f0ff,ki:.95,kp:[1,6,3],fill:0x4a90c0,fi:.4});
  frPut(k,frTint(C,'#2c86b8',.16),W*.47,H*.72,H*.46);
  for(let i=0;i<22;i++){const x=W*.15+R()*W*.7,y=R()*H*.8,r=1.5+R()*4;k.strokeStyle='rgba(235,250,255,.75)';k.lineWidth=1.2;k.beginPath();k.arc(x,y,r,0,7);k.stroke();k.fillStyle='rgba(255,255,255,.55)';k.beginPath();k.arc(x-r*.3,y-r*.3,r*.3,0,7);k.fill()}
  frGrain(k,W,H,8,31);frVig(k,W,H,.3,'rgba(8,30,60,.5)')}};

/* 그림 한 장 → 512×512 캔버스(텍스처) */
function frPaint(t){if(FRM.pic[t])return FRM.pic[t];if(t==='frame_map'&&!MAPC){const P=frCv(8,8),q=P.getContext('2d');q.fillStyle='#e8d4a6';q.fillRect(0,0,8,8);P.tmp=1;return P}const {pw,ph}=frDims(t),land=pw>ph,W=land?576:380,H=land?Math.round(576*ph/pw):Math.round(380*ph/pw),c=frCv(W,H),k=c.getContext('2d');
 try{FRP[t](k,W,H)}catch(e){console.error('frames: 그림 실패',t,e);k.fillStyle='#e8dcc4';k.fillRect(0,0,W,H)}
 /* 유리에 비친 빛 한 줄 */
 k.save();k.globalCompositeOperation='screen';k.fillStyle=frLin(k,0,0,W,H,[[0,'rgba(255,255,255,0)'],[.28,'rgba(255,255,255,0)'],[.33,'rgba(255,255,255,.12)'],[.4,'rgba(255,255,255,0)'],[1,'rgba(255,255,255,0)']]);k.fillRect(0,0,W,H);k.restore();
 const P=frCv(FRM.S,FRM.S);P.getContext('2d').drawImage(c,0,0,FRM.S,FRM.S);P.src=c;return FRM.pic[t]=P}

/* ---------------- 카페트 무늬 3종 ---------------- */
const RUGC={red:'#b8433a',red2:'#a5372f',navy:'#2c3e63',cream:'#f1e3c3',must:'#e0a93b',teal:'#3b8c8f',rose:'#d9776a',brown:'#4a2f26',sage:'#8fae7a',denim:'#4d6f96',rust:'#c0573e',coral:'#e0705a'};
function rugStep(k,cx,cy,rx,ry,st,col){/* 계단 모양 마름모(킬림) */k.fillStyle=col;k.beginPath();const n=st;for(let i=0;i<=n;i++){const x=cx-rx+rx*i/n,y=cy-ry*i/n;k.lineTo(x,y);k.lineTo(x+rx/n,y)}for(let i=0;i<=n;i++){const x=cx+rx*i/n,y=cy-ry+ry*i/n;k.lineTo(x,y);k.lineTo(x,y+ry/n)}
 for(let i=0;i<=n;i++){const x=cx+rx-rx*i/n,y=cy+ry*i/n;k.lineTo(x,y);k.lineTo(x-rx/n,y)}for(let i=0;i<=n;i++){const x=cx-rx*i/n,y=cy+ry-ry*i/n;k.lineTo(x,y);k.lineTo(x,y-ry/n)}k.closePath();k.fill()}
function rugStar(k,cx,cy,r,col,ri){k.fillStyle=col;k.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=i%2?r*(ri||.55):r;k.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}k.closePath();k.fill()}
function rugWeave(k,W,H,seed,clip){const R=frRng(seed);k.save();if(clip)clip();k.globalAlpha=1;for(let y=0;y<H;y+=3){k.fillStyle=`rgba(40,20,10,${.035+R()*.03})`;k.fillRect(0,y,W,1)}for(let x=0;x<W;x+=4){k.fillStyle=`rgba(255,250,240,${.02+R()*.02})`;k.fillRect(x,0,1,H)}k.restore();frGrain(k,W,H,16,seed+1)}
const RUGP={
 rug_rect(k,W,H){const C=RUGC,R=frRng(41);
  k.fillStyle=C.brown;k.fillRect(0,0,W,H);
  const band=(m,c)=>{k.fillStyle=c;k.fillRect(m,m,W-2*m,H-2*m)};band(14,C.navy);band(30,C.must);band(38,C.cream);
  /* 큰 테두리: 크림 바탕에 계단 마름모 줄 + 지그재그 덩굴 */
  const bw=96,b0=38,b1=b0+bw;k.fillStyle=C.red;k.fillRect(b1,b1,W-2*b1,H-2*b1);
  const along=(x0,y0,x1,y1,horiz)=>{const L=horiz?x1-x0:y1-y0,n=Math.round(L/86),st=L/n;k.strokeStyle=C.red;k.lineWidth=7;k.lineJoin='round';k.beginPath();for(let i=0;i<=n*2;i++){const t=i*st/2,o=(i%2?1:-1)*24;horiz?k.lineTo(x0+t,(y0+y1)/2+o):k.lineTo((x0+x1)/2+o,y0+t)}k.stroke();
   for(let i=0;i<n;i++){const t=(i+.5)*st,cx=horiz?x0+t:(x0+x1)/2,cy=horiz?(y0+y1)/2:y0+t;rugStep(k,cx,cy,30,30,4,i%2?C.navy:C.teal);rugStep(k,cx,cy,17,17,3,C.cream);rugStep(k,cx,cy,7,7,1,i%2?C.must:C.rose)}};
  along(b1,b0,W-b1,b1,1);along(b1,H-b1,W-b1,H-b0,1);along(b0,b1,b1,H-b1,0);along(W-b1,b1,W-b0,H-b1,0);
  for(const [x,y] of [[b0,b0],[W-b1,b0],[b0,H-b1],[W-b1,H-b1]]){k.fillStyle=C.navy;k.fillRect(x+6,y+6,bw-12,bw-12);rugStar(k,x+bw/2,y+bw/2,36,C.must,.62);rugStar(k,x+bw/2,y+bw/2,20,C.red,.6);k.fillStyle=C.cream;k.beginPath();k.arc(x+bw/2,y+bw/2,6,0,7);k.fill()}
  k.fillStyle=C.must;k.fillRect(b1,b1,W-2*b1,8);k.fillRect(b1,H-b1-8,W-2*b1,8);k.fillRect(b1,b1,8,H-2*b1);k.fillRect(W-b1-8,b1,8,H-2*b1);
  k.fillStyle=C.cream;k.fillRect(b1+8,b1+8,W-2*b1-16,4);k.fillRect(b1+8,H-b1-12,W-2*b1-16,4);k.fillRect(b1+8,b1+8,4,H-2*b1-16);k.fillRect(W-b1-12,b1+8,4,H-2*b1-16);
  /* 바탕: 빨강 얼룩(아브라시) + 작은 무늬 격자 */
  const f0=b1+12,fw=W-2*f0,fh=H-2*f0;for(let y=f0;y<f0+fh;y+=6){k.fillStyle=`rgba(${R()<.5?120:200},30,25,${.03+R()*.06})`;k.fillRect(f0,y,fw,6)}
  for(let j=0;j<7;j++)for(let i=0;i<12;i++){const x=f0+30+i*(fw-60)/11,y=f0+28+j*(fh-56)/6;if(Math.abs(x-W/2)<260&&Math.abs(y-H/2)<150)continue;if((i+j)%2){k.fillStyle=C.cream;k.fillRect(x-6,y-1.5,12,3);k.fillRect(x-1.5,y-6,3,12)}else rugStep(k,x,y,7,7,2,C.must)}
  /* 모서리 반 마름모 */
  for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const cx=sx>0?f0:f0+fw,cy=sy>0?f0:f0+fh;k.save();k.beginPath();k.rect(f0,f0,fw,fh);k.clip();rugStep(k,cx,cy,150,110,6,C.cream);rugStep(k,cx,cy,136,96,6,C.navy);rugStep(k,cx,cy,90,64,5,C.teal);rugStep(k,cx,cy,44,32,3,C.must);k.restore()}
  /* 가운데 메달리온 + 양옆 펜던트 */
  for(const s of[-1,1]){rugStep(k,W/2+s*300,H/2,46,46,4,C.cream);rugStep(k,W/2+s*300,H/2,36,36,4,C.navy);rugStep(k,W/2+s*300,H/2,16,16,2,C.must);k.fillStyle=C.cream;k.fillRect(W/2+s*228-(s>0?0:24),H/2-4,24,8)}
  rugStep(k,W/2,H/2,250,150,8,C.cream);rugStep(k,W/2,H/2,236,138,8,C.navy);
  for(const [a,b] of [[-1,0],[1,0],[0,-1],[0,1]]){const x=W/2+a*200,y=H/2+b*114;rugStep(k,x,y,22,22,2,C.rose)}
  rugStep(k,W/2,H/2,170,100,7,C.teal);rugStep(k,W/2,H/2,150,86,7,C.cream);rugStep(k,W/2,H/2,134,74,6,C.red);
  rugStar(k,W/2,H/2,66,C.must,.58);rugStar(k,W/2,H/2,42,C.navy,.6);rugStep(k,W/2,H/2,20,20,2,C.cream);k.fillStyle=C.red;k.fillRect(W/2-5,H/2-5,10,10);
  for(const s of[-1,1])for(const t of[-1,1]){rugStar(k,W/2+s*96,H/2+t*44,13,C.cream,.5)}
  rugWeave(k,W,H,43)},
 rug_round(k,W,H){const C=RUGC,cx=W/2,cy=H/2,R0=W/2-2,clip=()=>{k.beginPath();k.arc(cx,cy,R0,0,7);k.clip()};k.save();clip();
  const ring=(r,c)=>{k.fillStyle=c;k.beginPath();k.arc(cx,cy,r,0,7);k.fill()};
  ring(R0,C.cream);const ns=30;for(let i=0;i<ns;i++){const a=i/ns*Math.PI*2;k.fillStyle=i%2?C.coral:C.must;k.beginPath();k.arc(cx+Math.cos(a)*(R0-26),cy+Math.sin(a)*(R0-26),27,0,7);k.fill()}
  ring(R0-40,C.cream);ring(R0-50,C.navy);
  /* 남색 띠: 작은 꽃 + 잎 덩굴 */
  const vr=R0-92,nv=22;k.strokeStyle=C.sage;k.lineWidth=5;k.beginPath();for(let i=0;i<=200;i++){const a=i/200*Math.PI*2,r=vr+Math.sin(a*nv)*14;k.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}k.stroke();
  for(let i=0;i<nv;i++){const a=(i+.25)/nv*Math.PI*2,x=cx+Math.cos(a)*(vr+14),y=cy+Math.sin(a)*(vr+14);for(let j=0;j<5;j++){const b=j/5*Math.PI*2;k.fillStyle=i%2?C.cream:C.rose;k.beginPath();k.arc(x+Math.cos(b)*8,y+Math.sin(b)*8,7,0,7);k.fill()}k.fillStyle=C.must;k.beginPath();k.arc(x,y,5,0,7);k.fill();
   const a2=(i+.75)/nv*Math.PI*2,x2=cx+Math.cos(a2)*(vr-14),y2=cy+Math.sin(a2)*(vr-14);k.save();k.translate(x2,y2);k.rotate(a2);k.fillStyle=C.sage;k.beginPath();k.ellipse(0,0,7,14,0,0,7);k.fill();k.restore()}
  ring(R0-134,C.must);ring(R0-142,C.cream);
  /* 큰 꽃잎 바탕 */
  ring(R0-152,C.teal);const np=12,pr=R0-160;for(let i=0;i<np;i++){const a=i/np*Math.PI*2;k.save();k.translate(cx,cy);k.rotate(a);k.fillStyle=C.coral;k.beginPath();k.moveTo(0,0);k.bezierCurveTo(-pr*.45,-pr*.35,-pr*.32,-pr*.95,0,-pr);k.bezierCurveTo(pr*.32,-pr*.95,pr*.45,-pr*.35,0,0);k.fill();
   k.fillStyle=C.rose;k.beginPath();k.moveTo(0,-pr*.12);k.bezierCurveTo(-pr*.3,-pr*.38,-pr*.2,-pr*.82,0,-pr*.86);k.bezierCurveTo(pr*.2,-pr*.82,pr*.3,-pr*.38,0,-pr*.12);k.fill();
   k.fillStyle=C.cream;k.beginPath();k.ellipse(0,-pr*.6,pr*.05,pr*.16,0,0,7);k.fill();
   k.rotate(Math.PI/np);k.fillStyle=C.sage;k.beginPath();k.moveTo(0,-pr*.38);k.bezierCurveTo(-pr*.14,-pr*.55,-pr*.08,-pr*.8,0,-pr*.84);k.bezierCurveTo(pr*.08,-pr*.8,pr*.14,-pr*.55,0,-pr*.38);k.fill();k.restore()}
  ring(pr*.42,C.must);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.fillStyle=C.cream;k.beginPath();k.ellipse(cx+Math.cos(a)*pr*.24,cy+Math.sin(a)*pr*.24,pr*.07,pr*.13,a+Math.PI/2,0,7);k.fill()}
  ring(pr*.13,C.red);ring(pr*.06,C.cream);
  for(let i=0;i<60;i++){const a=i/60*Math.PI*2;k.fillStyle=C.cream;k.beginPath();k.arc(cx+Math.cos(a)*(R0-146),cy+Math.sin(a)*(R0-146),2.6,0,7);k.fill()}
  /* 고리 털(후킹) 결: 둥근 줄로 작은 점 */
  for(let r=8;r<R0;r+=7){const n=Math.round(r*Math.PI*2/7);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;k.fillStyle='rgba(30,20,10,.07)';k.beginPath();k.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1.6,0,7);k.fill()}}
  k.restore();frGrain(k,W,H,14,47)},
 rug_oval(k,W,H){const C=RUGC,cx=W/2,cy=H/2,A=W/2-3,B=H/2-3,R=frRng(53);k.save();k.beginPath();k.ellipse(cx,cy,A,B,0,0,7);k.clip();
  /* 9줄: 바깥 청바지색 → 크림 → 녹슨 빨강 → 크림 → 겨자 → 쑥 → 크림 → 장미 → 가운데 녹슨 빨강. 가닥은 70% 줄 색 + 30% 섞인 색(헌 천 느낌) */
  const pal=[[C.denim,'#5d82ab',C.navy],[C.cream,'#e9d9b4',C.denim],[C.rust,'#d06a4e',C.red2],[C.cream,'#efe0bf',C.must],[C.must,'#e9b95a','#c98f2a'],[C.sage,'#a3c08e','#78966a'],[C.cream,'#f3e7cb',C.sage],[C.rose,'#e69a8a','#c86a5c'],[C.rust,C.red2,C.must]];
  const N=pal.length,dd=Math.min(A,B)/(N+.6);k.fillStyle=pal[0][0];k.fillRect(0,0,W,H);
  for(let r=0;r<N;r++){const a=A-r*dd,b=Math.max(4,B-r*dd),am=a-dd/2,bm=Math.max(2,b-dd/2),P=pal[r];k.fillStyle=P[0];k.beginPath();k.ellipse(cx,cy,a,b,0,0,7);k.fill();
   /* 땋은 줄: 고리를 따라 비스듬한 가닥을 엇갈려 */
   const per=Math.PI*(3*(am+bm)-Math.sqrt((3*am+bm)*(am+3*bm))),n=Math.max(8,Math.round(per/(dd*.62)));
   for(let i=0;i<n;i++){const t=i/n*Math.PI*2,x=cx+Math.cos(t)*am,y=cy+Math.sin(t)*bm,tg=Math.atan2(Math.cos(t)*bm,-Math.sin(t)*am),side=i%2?1:-1,nx=Math.cos(tg+Math.PI/2),ny=Math.sin(tg+Math.PI/2);
    const col=R()<.72?P[0]:R()<.5?P[1]:P[2],ox=x+nx*side*dd*.17,oy=y+ny*side*dd*.17;k.save();k.translate(ox,oy);k.rotate(tg+side*.75);
    k.fillStyle=col;k.beginPath();k.ellipse(0,0,dd*.42,dd*.2,0,0,7);k.fill();k.fillStyle='rgba(255,255,255,.18)';k.beginPath();k.ellipse(-dd*.06,-dd*.05,dd*.26,dd*.07,0,0,7);k.fill();
    k.strokeStyle='rgba(40,25,15,.28)';k.lineWidth=1.4;k.beginPath();k.ellipse(0,0,dd*.42,dd*.2,0,0,7);k.stroke();k.restore()}
   k.strokeStyle='rgba(40,25,15,.25)';k.lineWidth=1.5;k.beginPath();k.ellipse(cx,cy,a,b,0,0,7);k.stroke()}
  k.restore();frGrain(k,W,H,12,55)}};
function rugPaint(t){if(FRM.pic[t])return FRM.pic[t];const g=FRM.rugs[t],c=frCv(g.nw,g.nh),k=c.getContext('2d');try{RUGP[t](k,g.nw,g.nh)}catch(e){console.error('frames: 카페트 무늬 실패',t,e)}
 const P=frCv(g.tw,g.th);P.getContext('2d').drawImage(c,0,0,g.tw,g.th);P.src=c;return FRM.pic[t]=P}

/* ---------------- 텍스처 · 재질 · 판 ---------------- */
function frTexOf(t){const o=FRM.tex[t];if(o&&!o._ftmp)return o;const c=FRM.rugs[t]?rugPaint(t):frPaint(t);if(o){if(!c.tmp){o.image=c;o._ftmp=0;o.needsUpdate=true}return o}const x=new THREE.CanvasTexture(c);x._ftmp=c.tmp?1:0;x.encoding=THREE.sRGBEncoding;x.anisotropy=Math.min(4,(typeof R!=='undefined'&&R&&R.capabilities)?R.capabilities.getMaxAnisotropy():1);return FRM.tex[t]=x}
function frMatOf(t){return FRM.mat[t]||(FRM.mat[t]=new THREE.MeshLambertMaterial({map:frTexOf(t)}))}
function frPlaneGeo(t){const g=FRM.rugs[t];if(g){const q=g.sh==='rect'?new THREE.PlaneGeometry(g.w,g.d):new THREE.CircleGeometry(.5,72);if(g.sh!=='rect')q.scale(g.w,g.d,1);q.rotateX(-Math.PI/2);q.translate(0,.0605,0);return q}
 const {pw,ph}=frDims(t),q=new THREE.PlaneGeometry(pw+.004,ph+.004);q.translate(0,DCFR.Yc,DCFR.zp);return q}
function frPlane(t,mat){const k='pg_'+t;FRM[k]=FRM[k]||frPlaneGeo(t);const m=new THREE.Mesh(FRM[k],mat||frMatOf(t));m.receiveShadow=true;m.castShadow=false;m.userData.frPic=1;return m}

/* ---------------- 이젤 · 못과 줄 ---------------- */
function frEaselGeo(land){const k=land?'dc_easel_l':'dc_easel_p';if(GEO[k])return GEO[k];const FH=land?.7:.82,Yc=DCFR.Yc,yb=Yc-FH/2,top=Yc+FH/2+.15,W1=0xcf9a62,W2=0xa8743f,p=[];
 const ROD=(a,b,r,c,n=8)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)};
 for(const s of[1,-1])p.push(ROD([s*.05,top,-.078],[s*.34,0,-.078],.022,W1),pt(new THREE.SphereGeometry(.026,8,6),W2,[s*.34,.01,-.078]));
 p.push(ROD([0,top-.03,-.098],[0,0,-.56],.021,W2),pt(lkRb(.16,.05,.05,.015,.008),W2,[0,top-.02,-.085]));
 p.push(pt(lkRb(.66,.034,.1,.012,.006),W1,[0,yb-.019,-.035]),pt(lkRb(.66,.045,.016,.008,.004),W2,[0,yb-.004,.013]));
 for(const s of[1,-1])p.push(ROD([s*.2,yb-.03,-.075],[s*.24,yb-.12,-.078],.012,W2,6));
 p.push(ROD([-.27,.36,-.078],[.27,.36,-.078],.014,W2,6),ROD([0,.36,-.08],[0,.3,-.43],.006,0x6b4a35,4));
 const g=mg(p);lkSmooth(g,40);g.computeBoundingSphere();return GEO[k]=g}
function frHangGeo(t){const k='dc_hang_'+t;if(GEO[k])return GEO[k];const {FW,FH}=frDims(t),Yc=DCFR.Yc,ty=Yc+FH/2,ny=ty+.15,p=[];
 const ROD=(a,b,r,c,n=6)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)};
 for(const s of[1,-1])p.push(ROD([s*FW*.3,ty-.03,-.047],[0,ny,-.047],.0045,0x5b4636));
 p.push(pt(new THREE.SphereGeometry(.016,10,8),0xd8b25e,[0,ny,-.044],0,[1,1,.6]),pt(new THREE.SphereGeometry(.007,6,4),0xa8853a,[0,ny-.004,-.035]));
 const g=mg(p);g.computeBoundingSphere();return GEO[k]=g}
function frExtras(o){const d=sdef(o);if(!o.m||!frIsF(o.t))return;const g=o.m,mm=g.children[0];for(const c of g.children.slice())if(c.userData.frX)g.remove(c);
 const land=d.bx>.4,easel=!o.in&&o.yo==null;const add=(geo)=>{const m=mesh(geo);m.userData.frX=1;g.add(m)};if(easel)add(frEaselGeo(land));else add(frHangGeo(o.t))}

/* ---------------- 붙일 면 찾기(광선) ----------------
   액자 앞(+z, 돌린 방향)에서 0.9m 앞에 서서 뒤로 광선을 쏴, 앞을 보는 면(벽·구조물)에 닿는지 봐요.
   밖: 그 자리 위로 0.15m마다 쏴서 면의 높이를 재고, 액자 가운데 = min(1.22, 면 꼭대기 − 액자 반 − 0.04).
   (광선은 액자 자리 1.4m 뒤까지 — 집처럼 충돌 상자보다 벽이 안쪽에 있는 것도 붙어요) 3×3 광선 중 6개 넘게 닿아야 붙어요(가는 기둥에는 안 붙음). 닿은 곳 중 가장 앞에 액자 뒤판을 대요. */
const FR_RC=new THREE.Raycaster(),FR_V=new THREE.Vector3(),FR_D=new THREE.Vector3(),FR_N=new THREE.Vector3();
function frMeshes(o,L,st){o.traverseVisible(c=>{if(c.isMesh&&!c.isSkinnedMesh&&!c.isInstancedMesh&&!(c.userData&&(c.userData.frPic||c.userData.frX))){c.userData.frS=st;L.push(c)}})}
function frTargets(x,z,inR){const L=[];if(inR){const G=INT.gr&&INT.gr[INT.kind];if(G){G.updateMatrixWorld(true);frMeshes(G,L,null)}}
 for(const s of structs){if(!s.m||!s.m.parent||!s.m.visible)continue;if(!!s.in!==inR)continue;if(inR&&s.hk!==curHK())continue;const d=sdef(s);if(!d||d.pass||d.floor||frIsF(s.t)||d.water)continue;
  const R0=Math.max(d.bx||1,d.bz||1)*(d.s||1)+2.6;if(Math.abs(s.x-x)>R0||Math.abs(s.z-z)>R0)continue;s.m.updateMatrixWorld(true);frMeshes(s.m,L,s)}return L}
function frCast(L,ox,oy,oz,fx,fz,far){FR_RC.set(FR_V.set(ox,oy,oz),FR_D.set(-fx,0,-fz));FR_RC.far=far||2.3;const h=FR_RC.intersectObjects(L,false);
 for(const q of h){if(!q.face)continue;FR_N.copy(q.face.normal).transformDirection(q.object.matrixWorld);if(Math.abs(FR_N.x*fx+FR_N.z*fz)<.35)continue;return{d:q.distance,s:q.object.userData.frS}}return null}
function frSupport(t,x,z,r,inR){const {FW,FH}=frDims(t),fx=Math.sin(r),fz=Math.cos(r),sx=Math.cos(r),sz=-Math.sin(r),L=frTargets(x,z,inR);if(!L.length)return null;
 const gy=inR?INT.y:hAt(x,z)-.04;let yc=DCFR.Yc;
 if(!inR){let i0=-1,top=-1;for(let i=0;i<16;i++){const h=.25+i*.15,c=frCast(L,x+fx*.9,gy+h,z+fz*.9,fx,fz);if(c){if(i0<0){if(h>.6)break;i0=i}top=h}else if(i0>=0)break}
  if(i0<0||top<.55)return null;yc=Math.min(DCFR.Yc,top+.07-FH/2-.04);yc=Math.max(yc,FH/2+.06)}
 let n=0,dmin=99;const hit=new Set(),far=inR?14:2.3;for(const u of[-.36,0,.36])for(const v of[-.36,0,.36]){const c=frCast(L,x+sx*u*FW+fx*.9,gy+yc+v*FH,z+sz*u*FW+fz*.9,fx,fz,far);if(c){n++;dmin=Math.min(dmin,c.d);if(c.s)hit.add(c.s)}}
 if(n<6)return null;const k=.9-dmin+.05;return{x:x+fx*k,z:z+fz*k,yc,hit}}

{const _g=ghostPos;ghostPos=function(){const pr=_g.apply(this,arguments);const b=BUILDS[bmode];if(!b||!b.wall||!frIsF(bmode))return pr;
 const key=[bmode,pr.x.toFixed(2),pr.z.toFixed(2),(pr.r||0).toFixed(3),pr.in?curHK():'o',structs.length].join('|');let sp;
 if(FRM.cache&&FRM.cache.k===key)sp=FRM.cache.sp;else{try{sp=frSupport(bmode,pr.x,pr.z,pr.r||0,!!pr.in)}catch(e){sp=null}FRM.cache={k:key,sp}}
 if(!sp){if(!pr.in)pr.easel=1;return pr}
 const sv=[BPIN.on,BPIN.x,BPIN.z];BPIN.on=true;BPIN.x=sp.x;BPIN.z=sp.z;FRM.ign=sp.hit;
 try{const p2=_g.apply(this,arguments);if(p2.ok||!pr.ok){p2.snap=1;if(!p2.in)p2.yo=(sp.yc-DCFR.Yc)||1e-4;return p2}if(!pr.in)pr.easel=1;return pr}finally{BPIN.on=sv[0];BPIN.x=sv[1];BPIN.z=sv[2];FRM.ign=null}}}
/* 붙는 면이 된 구조물과는 겹침을 안 봐요(벽보다 충돌 상자가 큰 집 등) */
{const _bh=bldHit;bldHit=function(b,x,z,r,s){if(FRM.ign&&FRM.ign.has(s))return false;return _bh.apply(this,arguments)}}

/* 구조물에 그림·무늬 판 + 이젤/못 */
{const _as=addStruct;addStruct=function(s){const r=_as.apply(this,arguments),o=r||s;try{if(o&&o.m&&(frIsF(o.t)||FRM.rugs[o.t])){o.m.add(frPlane(o.t));if(frIsF(o.t))frExtras(o)}}catch(e){console.error('frames: 판 붙이기 실패',e)}return r}}
/* 받치던 구조물을 치우면: 밖에 붙어 있던 액자는 다시 재 보고, 붙을 곳이 없으면 이젤로 */
{const _rs=removeStruct;removeStruct=function(s){const r=_rs.apply(this,arguments);try{if(s&&!frIsF(s.t)&&!s.in)for(const f of structs){if(!frIsF(f.t)||f.in||f.yo==null||!f.m)continue;if(Math.abs(f.x-s.x)>6||Math.abs(f.z-s.z)>6)continue;
  const sp=frSupport(f.t,f.x-Math.sin(f.r||0)*.05,f.z-Math.cos(f.r||0)*.05,f.r||0,false);if(!sp){f.yo=undefined;f.m.position.y=hAt(f.x,f.z)-.04;frExtras(f)}}}catch(e){}return r}}
/* 미리보기: 붙은 높이 · 이젤/못도 같이 */
function frGhost(){if(!ghost||!bmode||!frIsF(bmode))return;const g=ghost.userData.g;if(!g)return;if(!g.in&&g.yo!=null)ghost.position.y=hAt(g.x,g.z)-.04+g.yo;
 const want=g.easel?'e':g.snap||g.in?'h':'';if(ghost.userData.frw!==want){for(const c of ghost.children.slice())ghost.remove(c);ghost.userData.frw=want;if(want){const m=new THREE.Mesh(want==='e'?frEaselGeo(BUILDS[bmode].bx>.4):frHangGeo(bmode),ghost.material);ghost.add(m)}}}
function frHook(){if(!R||R._fr)return;R._fr=1;const _r=R.render;R.render=function(sc,ca){if(sc===scene&&ca===cam)try{frGhost()}catch(e){}return _r.apply(this,arguments)}}
if(typeof R!=='undefined'&&R)frHook();else{const _ir=initRenderer;initRenderer=function(){_ir();frHook()}}

/* ---------------- 아이콘: 그림 판을 같이 찍어요 ---------------- */
function frIcon(t){const L=lkIconKit(),m=frPlane(t,new THREE.MeshToonMaterial({map:frTexOf(t),gradientMap:L.m.material.gradientMap}));L.m.add(m);
 try{const k='kit_'+t,rot=frIsF(t)?[.06,-.32,0]:lkRotOf(k);ICON[k]=lkIconFrom(GEO[BUILDS[t].g],rot,lkCatOf(k))}finally{L.m.remove(m);m.material.dispose()}}
/* 게임을 켤 때: 카페트(가벼움)는 바로, 액자 그림(캐릭터·모델 찍기)은 지도를 그린 뒤 하나씩 천천히 */
function frWarm(){for(const t in FRM.rugs)try{frIcon(t)}catch(e){console.error('frames: 카페트 아이콘',e)}
 FRM.q=DCF.map(d=>d[0]).sort((a,b)=>(a==='frame_dog'||a==='frame_plat')-(b==='frame_dog'||b==='frame_plat'));const step=()=>{const t=FRM.q.shift();if(!t){frDone();return}try{frTexOf(t);frIcon(t)}catch(e){console.error('frames: 액자 그림',t,e)}if(typeof hudDirty!=='undefined')hudDirty=true;setTimeout(step,FRM.q.length?90:0)};setTimeout(step,400)}
{const _mm=makeMap;makeMap=function(){const r=_mm.apply(this,arguments);try{frWarm()}catch(e){console.error('frames: 준비 실패',e)}return r}}

/* 카페트(지나갈 수 있는 판) 위에는 풀·꽃·자갈 장식이 안 나게(dress.js는 지나갈 수 없는 구조물만 비워요) */
{const _di=dressItems;dressItems=function(r,ri){const out=_di.apply(this,arguments);const L=structs.filter(q=>FRM.rugs[q.t]&&!q.in&&Math.abs(q.x-r.cx)<REG/2+3&&Math.abs(q.z-r.cz)<REG/2+3);if(!L.length)return out;const o2=[];
 for(let i=0;i<out.length;i+=7){const x=out[i+1],z=out[i+3];let hide=false;for(const q of L){const g=FRM.rugs[q.t],c=Math.cos(q.r||0),sn=Math.sin(q.r||0),dx=x-q.x,dz=z-q.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c,a=g.w/2+.18,b=g.d/2+.18;
   if(g.sh==='rect'?Math.abs(lx)<a+.12&&Math.abs(lz)<b:(lx*lx)/(a*a)+(lz*lz)/(b*b)<1){hide=true;break}}if(!hide)for(let j=0;j<7;j++)o2.push(out[i+j])}return o2}}
