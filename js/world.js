'use strict';
/* ===== world: renderer, assets, terrain, objects, structures, effects ===== */
const cv=$('game');let R;
/* ---- UI text on the canvas: one rounded font (assets/fonts, 나눔스퀘어라운드) and a Longvinter-style pill label ---- */
const UIF='"NanumSquareRound","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif',UIC={pn:'#FBF4E6',pn3:'#E6D4B4',tx:'#5B3D2B',brn:'#5A3A2E',nav:'#2E3754',grn:'#45B864',red:'#E5534B',org:'#C9772B',ink:'#3B2A20'};
if(document.fonts)['700','800'].forEach(w=>document.fonts.load(w+' 16px "NanumSquareRound"').catch(()=>{}));
/* centred pill with text; y is the text's middle. bg/fg/bd = fill, text and outline colours */
function uiPill(c,t,x,y,fs,bg,fg,bd,w8=800){c.save();c.font=`${w8} ${fs}px ${UIF}`;c.textAlign='center';c.textBaseline='middle';const w=c.measureText(t).width+fs*1.3,h=fs*1.75,r=h/2,l=x-w/2,tp=y-h/2;
 c.beginPath();c.moveTo(l+r,tp);c.arcTo(l+w,tp,l+w,tp+h,r);c.arcTo(l+w,tp+h,l,tp+h,r);c.arcTo(l,tp+h,l,tp,r);c.arcTo(l,tp,l+w,tp,r);c.closePath();
 c.shadowColor='rgba(40,24,12,.3)';c.shadowBlur=fs*.5;c.shadowOffsetY=fs*.15;c.fillStyle=bg;c.fill();c.shadowColor='transparent';if(bd){c.lineWidth=Math.max(1.5,fs*.13);c.strokeStyle=bd;c.stroke()}
 c.fillStyle=fg;c.fillText(t,x,y+fs*.04);c.restore()}
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1,.5,420);
const hemi=new THREE.HemisphereLight(0xbfdcff,0x7a8a50,.6),sun=new THREE.DirectionalLight(0xffe2b0,1.15);
const GEO={},C1=new THREE.Color(),C2=new THREE.Color(),dummy=new THREE.Object3D();
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_s=new THREE.Vector3();
function initRenderer(){R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.02;
 R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;scene.background=new THREE.Color(0xbfe3f2);scene.fog=new THREE.Fog(0xbfe3f2,55,185);
 sun.castShadow=true;sun.shadow.bias=-.0004;sun.shadow.normalBias=.06;Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:150});scene.add(hemi,sun,sun.target)}
/* material: vertex colours + snow in the north */
function snowMat(m){m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 #ifdef USE_COLOR
 vec4 wp4=vec4(transformed,1.0);vec3 wn=objectNormal;
 #ifdef USE_INSTANCING
 wp4=instanceMatrix*wp4;wn=mat3(instanceMatrix)*wn;
 #endif
 wp4=modelMatrix*wp4;wn=normalize(mat3(modelMatrix)*wn);
 float sf=smoothstep(.32,.72,wn.y);
 vColor.rgb=mix(vColor.rgb,vec3(.84,.89,.96),sf*.92);
 #endif`)};return m}
const MAT=new THREE.MeshLambertMaterial({vertexColors:true}),MATT=new THREE.MeshLambertMaterial({vertexColors:true}),C3=new THREE.Color();
const TERR=new THREE.MeshLambertMaterial({vertexColors:true});TERR.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(position,1.)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 vWP;float th(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}float tn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(th(i),th(i+vec2(1,0)),f.x),mix(th(i+vec2(0,1)),th(i+vec2(1,1)),f.x),f.y);}`).replace('#include <color_fragment>',`#include <color_fragment>
 float n1=tn(vWP.xz*.27)*.6+tn(vWP.xz*.8+7.3)*.4,v=n1*4.,pa=(floor(v)+smoothstep(.35,.65,fract(v)))/4.,n3=tn(vWP.xz*6.5),n4=tn(vWP.xz*15.);
 diffuseColor.rgb*=.83+.3*pa;diffuseColor.rgb*=1.-.085*smoothstep(.66,.72,n3)+.06*smoothstep(.3,.24,n3);diffuseColor.rgb*=1.-.06*step(.82,n4);
 diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.7,.74,.76),diffuseColor.rgb,smoothstep(.02,.4,vWP.y));`)};
const mesh=(g,m=MAT,sh=true)=>{const o=new THREE.Mesh(g,m);o.castShadow=sh;o.receiveShadow=sh;return o};
/* pack */
async function loadB64(p){const r=await fetch(p);if(!r.ok)throw new Error('파일을 불러오지 못했어요: '+p);const s=atob((await r.json()).b64),n=s.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=s.charCodeAt(i);return u.buffer}
async function loadPack(){const [j,b]=await Promise.all([fetch('assets/pack.json').then(r=>r.json()),loadB64('assets/pack_bin.json')]);
 const pos=new Float32Array(b,j.off[0],j.nv*3),nrm=new Int8Array(b,j.off[1],j.nv*3),col=new Uint8Array(b,j.off[2],j.nv*3),idx=new Uint32Array(b,j.off[3],j.ni);
 const lin=new Float32Array(256);for(let i=0;i<256;i++)lin[i]=Math.pow(i/255,2.2);
 for(const k in j.m){const m=j.m[k],g=new THREE.BufferGeometry(),c=new Float32Array(m.vc*3),n=new Float32Array(m.vc*3);
  for(let i=0;i<m.vc*3;i++){c[i]=lin[col[m.v*3+i]];n[i]=nrm[m.v*3+i]/127}
  g.setAttribute('position',new THREE.BufferAttribute(pos.slice(m.v*3,(m.v+m.vc)*3),3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
  const ix=idx.slice(m.i,m.i+m.ic);g.setIndex(new THREE.BufferAttribute(m.vc<65536?new Uint16Array(ix):ix,1));g.computeBoundingSphere();GEO[k]=g}}
/* procedural parts */
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,s=8)=>new THREE.CylinderGeometry(a,b,h,s),ico=(r,d=0)=>new THREE.IcosahedronGeometry(r,d),cone=(r,h,s=7)=>new THREE.ConeGeometry(r,h,s);
function ex(pts,depth,bev=.02){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:1,steps:1});g.translate(0,0,-depth/2);g.rotateY(-Math.PI/2);return g}
function pt(geo,color,pos,rot,scl){let g=geo.index?geo.toNonIndexed():geo.clone();pos=pos||[0,0,0];rot=rot||[0,0,0];scl=scl||[1,1,1];_m.compose(_v.set(pos[0],pos[1],pos[2]),_q.setFromEuler(_e.set(rot[0],rot[1],rot[2])),_s.set(scl[0],scl[1],scl[2]));g.applyMatrix4(_m);
 if(color!==null){const c=new THREE.Color(color).convertSRGBToLinear(),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(a,3))}return g}
function mg(parts){let n=0;parts.forEach(g=>n+=g.attributes.position.count);const pos=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;parts.forEach(g=>{pos.set(g.attributes.position.array,o*3);col.set(g.attributes.color.array,o*3);o+=g.attributes.position.count});
 const B=new THREE.BufferGeometry();B.setAttribute('position',new THREE.BufferAttribute(pos,3));B.setAttribute('color',new THREE.BufferAttribute(col,3));B.computeVertexNormals();B.computeBoundingSphere();return B}
const WOOD=0x9a6a42,WOOD2=0x7d5232,METAL=0x4d5560,METAL2=0x6b7480,OLIVE=0x5f6b3c,TAN=0xbfa77c,BRASS=0xd9a441;
function buildProc(){
 GEO.rifle=mg([pt(ex([[-.8,-.24],[-.76,.03],[-.3,.07],[.78,.07],[.78,-.05],[-.02,-.08],[-.3,-.17],[-.6,-.32]],.1,.025),WOOD),pt(box(.085,.085,.55),METAL,[0,.115,.08]),pt(cyl(.032,.032,1.2,8),METAL,[0,.115,.75],[Math.PI/2,0,0]),
  pt(cyl(.02,.02,.14,6),METAL2,[.08,.14,-.12],[0,0,-1.1]),pt(ico(.035),METAL2,[.14,.17,-.12]),pt(box(.02,.06,.03),METAL,[0,.17,1.3]),pt(box(.05,.03,.06),METAL,[0,.17,-.05]),pt(box(.03,.07,.14),METAL,[0,-.12,-.16]),pt(cyl(.045,.045,.06,8),METAL2,[0,.115,1.02],[Math.PI/2,0,0])]);
 GEO.pistol=mg([pt(ex([[-.16,-.36],[-.02,-.38],[.07,-.03],[-.08,-.03]],.085,.02),WOOD2),pt(box(.085,.1,.62),METAL,[0,.045,.16]),pt(box(.07,.035,.5),METAL2,[0,.11,.14]),pt(cyl(.028,.028,.1,6),METAL2,[0,.05,.5],[Math.PI/2,0,0]),pt(box(.02,.035,.03),METAL2,[0,.14,.42]),pt(box(.025,.02,.16),METAL,[0,-.1,.12]),pt(box(.025,.08,.02),METAL,[0,-.06,.2]),pt(box(.02,.06,.04),METAL2,[0,-.04,.1],[.3,0,0])]);
 GEO.smg=mg([pt(ex([[-.72,-.2],[-.7,.05],[-.24,.09],[-.24,-.03],[-.5,-.22]],.09,.022),WOOD),pt(box(.1,.13,.66),METAL,[0,.06,.12]),pt(cyl(.03,.03,.5,8),METAL,[0,.07,.68],[Math.PI/2,0,0]),pt(cyl(.05,.05,.3,8),METAL2,[0,.07,.58],[Math.PI/2,0,0]),
  pt(box(.07,.4,.1),METAL,[0,-.22,.26],[.12,0,0]),pt(ex([[-.08,-.28],[.04,-.27],[.07,-.02],[-.05,-.02]],.08,.02),WOOD2,[0,0,-.1]),pt(box(.05,.06,.14),WOOD2,[0,-.07,.5]),pt(box(.02,.05,.03),METAL,[0,.16,.9])]);
 GEO.shotgun=mg([pt(ex([[-.74,-.24],[-.7,.03],[-.26,.07],[.2,.07],[.2,-.06],[-.02,-.08],[-.28,-.17],[-.56,-.31]],.1,.025),WOOD2),pt(box(.09,.11,.4),METAL,[0,.1,.1]),pt(cyl(.04,.04,1.0,8),METAL,[0,.13,.75],[Math.PI/2,0,0]),pt(cyl(.035,.035,.72,8),METAL2,[0,.04,.6],[Math.PI/2,0,0]),pt(cyl(.06,.06,.3,8),WOOD,[0,.04,.62],[Math.PI/2,0,0])]);
 GEO.mggun=mg([pt(box(.16,.18,.8),METAL,[0,0,-.05]),pt(cyl(.075,.075,.85,8),METAL2,[0,.02,.75],[Math.PI/2,0,0]),pt(cyl(.045,.055,.14,8),METAL,[0,.02,1.22],[Math.PI/2,0,0]),pt(box(.2,.24,.3),OLIVE,[-.2,-.04,.05]),pt(box(.05,.05,.3),BRASS,[-.08,.06,.05]),
  pt(box(.04,.14,.04),WOOD2,[-.07,-.02,-.52]),pt(box(.04,.14,.04),WOOD2,[.07,-.02,-.52]),pt(box(.03,.08,.03),METAL,[0,.14,.3]),pt(cyl(.09,.09,.05,8),METAL,[0,.02,.4],[Math.PI/2,0,0]),pt(cyl(.09,.09,.05,8),METAL,[0,.02,.7],[Math.PI/2,0,0]),pt(cyl(.09,.09,.05,8),METAL,[0,.02,1.0],[Math.PI/2,0,0])]);
 const sack=(x,y,z,r,c)=>pt(ico(.5,1),c,[x,y,z],[0,r,0],[.56,.3,.36]);const sb=[];
 for(let row=0;row<4;row++){const n=row%2?3:4;for(let i=0;i<n;i++)sb.push(sack(-1+(i+.5)*(2/n)+(row%2?0:0),.17+row*.3,(row%2?.03:-.03),(i*7+row*3)%5*.08-.16,[0xc4ad82,0xb9a077,0xcdb68c][(i+row)%3]))}GEO.sandbag=mg(sb);
 const nest=[];for(let a=0;a<7;a++){const an=-.35+a*.64,x=Math.sin(an)*1.25,z=Math.cos(an)*1.25;for(let r=0;r<3;r++)nest.push(pt(ico(.5,1),[0xc4ad82,0xb9a077,0xcdb68c][(a+r)%3],[x*(1-r*.02),.17+r*.3,z*(1-r*.02)],[0,an+1.57+(r%2?.3:0),0],[.56,.3,.36]))}
 for(const a of[0,2.09,4.19])nest.push(pt(cyl(.035,.035,1.1,6),METAL,[Math.sin(a)*.3,.5,Math.cos(a)*.3],[Math.cos(a)*.5,0,-Math.sin(a)*.5]));nest.push(pt(cyl(.1,.1,.1,8),METAL2,[0,1.0,0]),pt(box(.5,.3,.34),OLIVE,[-.75,.15,-.3],[0,.4,0]),pt(box(.5,.3,.34),OLIVE,[-.2,.15,-.75],[0,-.2,0]));GEO.mgnest=mg(nest);
 GEO.helmet=mg([pt(new THREE.SphereGeometry(.57,10,5,0,6.3,0,1.5),OLIVE,[0,0,0],0,[1,.8,1.08]),pt(cyl(.6,.64,.06,12),0x55603a,[0,.02,.02],0,[1,1,1.08])]);
 GEO.grenade=mg([pt(cyl(.1,.1,.24,8),OLIVE,[0,.36,0]),pt(cyl(.035,.035,.42,6),WOOD,[0,.05,0]),pt(cyl(.05,.05,.04,6),METAL,[0,-.16,0])]);
 GEO.ammoS=mg([pt(box(.34,.2,.24),0xb0895a),pt(box(.35,.07,.25),0x8a6a42,[0,.07,0]),...[-.1,0,.1].map(x=>pt(cyl(.035,.035,.16,6),BRASS,[x,.19,0])),...[-.1,0,.1].map(x=>pt(cone(.035,.07,6),0xb87333,[x,.3,0]))]);
 GEO.ammoL=mg([pt(box(.46,.3,.22),OLIVE),pt(box(.47,.05,.23),0x4b552f,[0,.15,0]),pt(box(.2,.03,.04),METAL,[0,.22,0]),...[-.16,-.05,.06,.17].map(x=>pt(cyl(.03,.03,.24,6),BRASS,[x,.3,.02],[.3,0,0])),...[-.16,-.05,.06,.17].map(x=>pt(cone(.03,.1,6),0xb87333,[x,.46,.07],[.3,0,0]))]);
 GEO.can=mg([pt(cyl(.16,.16,.26,10),0xc9cfd6),pt(cyl(.165,.165,.14,10),0xc94f3d),pt(cyl(.165,.165,.03,10),0xf3e3ae,[0,.02,0]),pt(cyl(.15,.15,.02,10),0xaab2bb,[0,.14,0])]);
 GEO.bandage=mg([pt(cyl(.16,.16,.26,10),0xf4f1ea,[0,0,0],[0,0,1.57]),pt(cyl(.05,.05,.27,8),0xd9d2c4,[0,0,0],[0,0,1.57]),pt(box(.02,.12,.04),0xd9534f,[0,.165,0],[.0,0,0]),pt(box(.02,.04,.12),0xd9534f,[0,.165,0])]);
 GEO.scrap=mg([pt(box(.7,.08,.5),0x7d8794,[0,.1,0],[.2,.3,.1]),pt(box(.5,.06,.6),0x9a5a3a,[.15,.2,.1],[-.3,.8,.2]),pt(cyl(.2,.2,.07,8),0x6b7480,[-.2,.3,.1],[1.1,0,.3]),pt(cyl(.05,.05,.8,6),0x8a929c,[.1,.28,-.15],[1.3,.5,0]),pt(box(.3,.25,.3),0x8f5a3c,[-.25,.14,-.2],[0,.4,0]),pt(cyl(.13,.13,.05,6),0xa9b2bb,[.3,.35,.2],[.9,0,0])]);
 GEO.cloth=mg([pt(box(.5,.07,.4),0xcbbd9a,[0,.04,0]),pt(box(.48,.07,.38),0x9aa56f,[.01,.11,0],[0,.08,0]),pt(box(.46,.07,.36),0xd9cdb0,[0,.18,.01],[0,-.06,0])]);
 GEO.bush=mg([pt(ico(.62),0x3f8f5a,[-.32,.42,0]),pt(ico(.6),0x4c9d63,[.34,.42,.1]),pt(ico(.66),0x45965e,[0,.66,-.1])]);
 GEO.berries=mg([[-.5,.6,.38],[.3,.5,.56],[.62,.72,.1],[-.05,.98,.4],[-.72,.42,-.05],[.12,.62,-.62],[.5,.3,.42]].map(p=>pt(ico(.12),0xe2473c,p)));
 const fp=[];for(let a=0;a<10;a++)fp.push(pt(new THREE.DodecahedronGeometry(.19),a%2?0x9aa1a8:0x858c94,[Math.cos(a*.628)*.75,.08,Math.sin(a*.628)*.75],[a,a*2,0]));for(let a=0;a<4;a++)fp.push(pt(cyl(.1,.11,1.2,6),0x6b4426,[0,.12,0],[Math.PI/2,0,a*.8+.3]));GEO.firepit=mg(fp);
 GEO.bench=mg([pt(GEO.table_medium,null,[0,0,0],0,[1.25,.95,.75]),pt(box(.3,.22,.24),METAL,[-.7,1.07,0]),pt(box(.1,.3,.1),METAL2,[-.7,1.2,0]),pt(cyl(.03,.03,.5,6),WOOD,[.3,1.0,.1],[1.57,.6,0]),pt(box(.2,.1,.1),METAL,[.5,1.0,.3],[0,.6,0]),pt(box(.36,.2,.26),OLIVE,[.75,1.06,-.2],[0,-.3,0]),pt(box(2.5,.9,.06),WOOD2,[0,1.45,-.74]),pt(box(.08,2.0,.08),WOOD2,[-1.2,1,-.74]),pt(box(.08,2.0,.08),WOOD2,[1.2,1,-.74])]);
 GEO.fence=pt(GEO.fence_wood_straight,null,[1.74,0,0],[0,Math.PI/2,0],[1.74,1.9,1.74]);GEO.fence.translate(0,0,0);GEO.fence.computeBoundingBox();{const bb=GEO.fence.boundingBox;GEO.fence.translate(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2)}
 GEO.wallB=pt(GEO.wall_straight,null,[0,0,0],0,[1,2.0,1]);BUILDS.wall.g='wallB';GEO.gateB=pt(GEO.wall_straight_gate,null,[0,0,0],0,[1,2.0,1]);
 {const sp=[pt(box(1.7,.08,1.7),WOOD2,[0,.05,0]),pt(box(1.8,.06,.14),WOOD,[0,.1,.6]),pt(box(1.8,.06,.14),WOOD,[0,.1,-.6])];for(let i=0;i<4;i++)for(let j=0;j<4;j++)sp.push(pt(cone(.09,.5,5),(i+j)%2?METAL2:0x9aa3ad,[-.6+i*.4,.33,-.6+j*.4],[(hash(i,j,3)-.5)*.3,0,(hash(j,i,4)-.5)*.3]));GEO.spike=mg(sp)}
 GEO.gen=mg([pt(box(1.3,.7,.8),OLIVE,[0,.55,0]),pt(box(1.5,.1,.12),METAL,[0,.1,.34]),pt(box(1.5,.1,.12),METAL,[0,.1,-.34]),pt(cyl(.26,.26,.7,10),0x3d4436,[.2,.62,0],[Math.PI/2,0,0]),pt(cyl(.06,.06,.7,6),METAL,[-.45,1.15,.2]),pt(cyl(.09,.07,.14,6),0x2b2b2b,[-.45,1.5,.2]),pt(box(.3,.2,.04),BRASS,[-.3,.6,.41]),pt(cyl(.12,.12,.1,8),0xc94f3d,[.45,.95,.15]),pt(box(.5,.06,.5),0x4b552f,[.1,.93,0])]);
 GEO.slbase=mg([...[0,2.09,4.19].map(a=>pt(cyl(.05,.06,2.3,6),METAL,[Math.sin(a)*.42,1.1,Math.cos(a)*.42],[Math.cos(a)*.36,0,-Math.sin(a)*.36])),pt(cyl(.16,.16,.12,8),METAL2,[0,2.2,0]),pt(box(.5,.3,.36),OLIVE,[0,.15,0])]);
 GEO.slhead=mg([pt(cyl(.42,.38,.7,12),0x5b6650,[0,.25,.05],[Math.PI/2,0,0]),pt(cyl(.44,.44,.08,12),0x2c3128,[0,.25,.42],[Math.PI/2,0,0]),pt(cyl(.38,.38,.03,12),0xfff2b0,[0,.25,.45],[Math.PI/2,0,0]),pt(cyl(.2,.32,.2,10),0x5b6650,[0,.25,-.4],[Math.PI/2,0,0]),pt(box(.08,.5,.12),0x4b552f,[.5,.1,0]),pt(box(.08,.5,.12),0x4b552f,[-.5,.1,0]),pt(box(1.08,.08,.14),0x4b552f,[0,-.15,0])]);
 {/* sea lighthouse: stone plinth, tapered white tower with red bands, bracketed gallery, glazed lantern room */
  const W=0xf3f0e7,RD=0xc9443a,DK=0x3d444e,ST=0x8f8e86,ST2=0x7a7972,p=[pt(cyl(3.05,3.3,.5,8),ST2,[0,.25,0]),pt(cyl(2.7,2.9,.4,8),ST,[0,.68,0]),pt(cyl(2.36,2.5,.5,12),RD,[0,1.1,0])];
  const R=y=>2.3-(y-.9)*.085;for(let k=0;k<5;k++){const y0=1.35+k*1.66;p.push(pt(cyl(R(y0+1.66),R(y0),1.66,12),k%2?RD:W,[0,y0+.83,0]))}
  p.push(pt(cyl(1.7,1.55,.3,12),DK,[0,9.78,0]),pt(cyl(2.45,2.3,.16,12),DK,[0,10,0]),pt(new THREE.TorusGeometry(2.32,.045,4,16),DK,[0,10.72,0],[Math.PI/2,0,0]),pt(new THREE.TorusGeometry(2.32,.03,4,16),DK,[0,10.4,0],[Math.PI/2,0,0]));
  for(let a=0;a<12;a++){const c=Math.cos(a*.5236),sn=Math.sin(a*.5236);p.push(pt(cyl(.035,.035,.7,4),DK,[c*2.32,10.4,sn*2.32]));if(a%2===0)p.push(pt(box(.1,.42,.5),DK,[c*1.95,9.72,sn*1.95],[0,-a*.5236+Math.PI/2,0]))}
  p.push(pt(cyl(1.18,1.25,.3,8),W,[0,10.22,0]),pt(cyl(1.05,1.05,1.3,8),0xffe9a0,[0,11,0]),pt(cyl(1.3,1.18,.14,8),DK,[0,11.7,0]),pt(cone(1.42,1.15,8),RD,[0,12.33,0]),pt(ico(.2),DK,[0,13,0]),pt(cyl(.025,.025,.8,4),DK,[0,13.4,0]));
  for(let a=0;a<8;a++)p.push(pt(box(.07,1.3,.07),DK,[Math.cos(a*.785+.39)*1.07,11,Math.sin(a*.785+.39)*1.07]));
  p.push(pt(box(1.5,2.3,.3),ST,[0,2,2.22]),pt(box(1.02,1.75,.14),0x5a3d25,[0,1.82,2.36]),pt(box(.08,1.75,.16),0x3f2a18,[0,1.82,2.38]),pt(cyl(.07,.07,.06,6),0xd9a441,[.3,1.8,2.45],[Math.PI/2,0,0]),pt(box(1.7,.2,.5),ST2,[0,3.2,2.25]),pt(box(1.9,.22,1.1),ST,[0,.78,2.95]),pt(box(2.2,.22,1.2),ST2,[0,.5,3.5]),pt(box(2.5,.22,1.2),ST,[0,.2,4]));
  for(const[y,a]of[[4.6,0],[6.6,1.9],[8.2,-1.4],[5.4,3.5]]){const r=R(y)+.02,c=Math.sin(a),k=Math.cos(a);p.push(pt(box(.62,.9,.14),ST,[c*r,y,k*r],[0,a,0]),pt(box(.4,.66,.16),0x2f3a48,[c*(r+.02),y,k*(r+.02)],[0,a,0]))}
  p.push(pt(cyl(.09,.09,.9,6),0x4d5560,[-2.2,1.33,1.6]),pt(box(.28,.3,.28),0xffd98a,[-2.2,1.9,1.6]),pt(cone(.26,.2,4),DK,[-2.2,2.15,1.6],[0,.785,0]));GEO.lighthouse=mg(p)}
 GEO.bunker=mg([pt(box(4.6,1.9,3.6),0x8f948e,[0,.95,0]),pt(box(5,.3,4),0x7a7f79,[0,2.0,0]),pt(ico(2.6,1),0x5f9c48,[0,1.3,-2.3],0,[1.3,.55,.8]),pt(ico(2.2,1),0x6aa64f,[-2.9,.9,-.4],0,[.6,.6,1.1]),pt(ico(2.2,1),0x5f9c48,[2.9,.9,-.4],0,[.6,.6,1.1]),pt(box(1.5,1.5,.14),0x3f4650,[0,.8,1.84]),pt(box(.12,1.5,.16),0x2a2f36,[0,.8,1.88]),pt(cyl(.16,.16,.08,10),0xd9a441,[.35,.85,1.93],[Math.PI/2,0,0]),pt(box(1.9,.2,.3),0x6b706a,[0,1.68,1.86]),pt(cyl(.14,.14,1,6),0x4d5560,[1.6,2.6,-.8]),pt(cyl(.2,.14,.16,6),0x3a4048,[1.6,3.15,-.8]),pt(box(.5,.34,.04),0xe8c43a,[-1.5,1.2,1.82]),pt(box(.3,.05,.05),0x1c1c1c,[-1.5,1.2,1.85],[0,0,.78]),pt(box(.3,.05,.05),0x1c1c1c,[-1.5,1.2,1.85],[0,0,-.78])]);
 const oc=(r,h)=>new THREE.ConeGeometry(r,h,3,1,true);GEO.tuft=mg([[0,0,.25,.0],[.13,.05,.35,2.1],[-.1,-.09,-.32,4.2],[.02,.14,-.3,1.2]].map(([x,z,l,r],i)=>pt(oc(.075,.52+i*.06),i%2?0x6fae4e:0x5a9a44,[x,.26,z],[l,r,-l*.6])));
 FLW=[0xf6f2e8,0xf2d24a,0xe58fb2,0x9a8be0].map(c=>mg([pt(oc(.022,.36),0x4f8a40,[0,.18,0]),pt(new THREE.OctahedronGeometry(.1),c,[0,.4,0],[0,.6,0],[1,.55,1]),pt(oc(.06,.2),0x5a9a44,[.08,.1,0],[0,0,-.9])]));
 GEO.peb=mg([pt(ico(.2),0x9a9a92,[0,.06,0],[.4,.2,0],[1,.55,1.2])]);
 {/* the one auto turret: tripod, turntable, chunky armoured head with side ammo box and a single jacketed barrel */
  const DK=0x3d4436,OL2=0x6f7b46,GUN=0x2a2f36,HZ=0xe8c43a,p=[];for(const a of[0,2.09,4.19]){const c=Math.cos(a),sn=Math.sin(a);p.push(pt(box(.11,1.06,.13),METAL,[sn*.41,.45,c*.41],[-c*.647,0,sn*.647]),pt(box(.3,.07,.34),DK,[sn*.72,.04,c*.72],[0,a,0]),pt(cyl(.03,.03,.5,5),METAL2,[sn*.3,.36,c*.3],[-c*1.45,0,sn*1.45]),pt(cyl(.05,.05,.08,6),BRASS,[sn*.72,.1,c*.72]))}
  p.push(pt(cyl(.14,.18,.52,8),OLIVE,[0,.84,0]),pt(cyl(.2,.2,.07,8),DK,[0,.62,0]),pt(cyl(.27,.27,.1,10),DK,[0,1.12,0]),pt(cyl(.22,.22,.05,10),BRASS,[0,1.06,0]),pt(box(.12,.1,.12),HZ,[0,.9,.17]));GEO.tbase=mg(p);
  GEO.thead=mg([pt(box(.5,.4,.62),OLIVE,[0,.24,0]),pt(box(.6,.48,.1),DK,[0,.25,.34],[.1,0,0]),pt(box(.07,.38,.52),OL2,[.285,.24,-.02]),pt(box(.07,.38,.52),OL2,[-.285,.24,-.02]),pt(box(.44,.07,.52),DK,[0,.47,-.03]),
   pt(box(.24,.3,.36),0x55603a,[-.45,.2,-.06]),pt(box(.26,.05,.38),DK,[-.45,.37,-.06]),pt(box(.05,.08,.1),BRASS,[-.58,.24,-.06]),pt(box(.14,.1,.16),GUN,[-.3,.38,.14],[0,0,.5]),
   pt(box(.14,.13,.18),GUN,[.14,.57,.08]),pt(cyl(.045,.045,.03,8),0x66d9ff,[.14,.57,.18],[Math.PI/2,0,0]),pt(cyl(.012,.012,.55,4),0x1c1c1c,[-.16,.76,-.26]),pt(ico(.03),0xc94f3d,[-.16,1.04,-.26]),
   pt(box(.34,.22,.06),GUN,[0,.24,-.34]),pt(box(.5,.05,.03),HZ,[0,.4,-.325]),pt(box(.05,.05,.2),METAL2,[.18,.16,-.44]),pt(box(.05,.05,.2),METAL2,[-.18,.16,-.44]),pt(box(.41,.05,.05),METAL2,[0,.16,-.54]),pt(cyl(.1,.12,.12,8),DK,[0,-.02,0]),pt(cyl(.13,.13,.07,8),GUN,[0,.24,.39],[Math.PI/2,0,0])]);
  GEO.tbrl=mg([pt(cyl(.04,.04,.86,8),GUN,[0,0,.43],[Math.PI/2,0,0]),pt(cyl(.078,.078,.44,8),METAL,[0,0,.27],[Math.PI/2,0,0]),pt(cyl(.086,.086,.04,8),METAL2,[0,0,.08],[Math.PI/2,0,0]),pt(cyl(.086,.086,.04,8),METAL2,[0,0,.27],[Math.PI/2,0,0]),pt(cyl(.086,.086,.04,8),METAL2,[0,0,.47],[Math.PI/2,0,0]),pt(cyl(.085,.065,.14,8),0x1c1c1c,[0,0,.84],[Math.PI/2,0,0]),pt(box(.02,.06,.06),METAL2,[0,.07,.6])])}
 /* ---- modern gear (20~21세기): composite hatchet, dome tent, rugged storage case ---- */
 {const BK=0x23262b,OR=0xe8742a,ST=0x50565e,EDGE=0xd3d8de;
  GEO.axe_m=mg([pt(box(.07,1.1,.055),BK,[0,.33,0]),pt(box(.092,.52,.074),OR,[.004,.02,0]),pt(box(.1,.035,.078),BK,[.004,.29,0]),pt(box(.13,.09,.08),BK,[-.025,-.25,0],[0,0,.35]),pt(box(.098,.06,.078),BK,[.004,-.17,0]),
   pt(ex([[-.06,.75],[-.3,.69],[-.44,.66],[-.47,.86],[-.44,1.04],[-.3,1.01],[-.06,.95]],.045,.008),ST,[0,0,0],[0,Math.PI/2,0]),pt(ex([[-.42,.665],[-.47,.66],[-.5,.86],[-.47,1.06],[-.42,1.04],[-.44,.86]],.03,.006),EDGE,[0,0,0],[0,Math.PI/2,0]),
   pt(box(.16,.26,.085),BK,[.02,.85,0]),pt(box(.09,.12,.075),ST,[.13,.85,0]),pt(box(.02,.16,.09),OR,[-.07,.85,0])]);
  const TN=0x2f8a72,TN2=0x277664,FLY=0xe8742a,GR=0x454a52,p=[pt(box(2.7,.04,2.5),GR,[0,.02,0])];
  p.push(pt(new THREE.SphereGeometry(1.25,8,3,0,Math.PI*2,0,Math.PI/2),TN,[0,.03,0],[0,Math.PI/8,0],[1.05,1.12,1]));
  p.push(pt(new THREE.SphereGeometry(1.27,8,1,0,Math.PI*2,Math.PI*.38,Math.PI*.12),TN2,[0,.03,0],[0,Math.PI/8,0],[1.05,1.12,1]));
  for(const a of[Math.PI/4,-Math.PI/4])p.push(pt(new THREE.TorusGeometry(1.29,.028,4,12,Math.PI),0x30343a,[0,.03,0],[0,a,0],[1.05,1.12,1]));
  p.push(pt(new THREE.SphereGeometry(.42,6,2,0,Math.PI*2,0,Math.PI/2),FLY,[0,1.32,0],[0,0,0],[1,.32,1]),pt(box(.34,.1,.06),0x30343a,[0,1.32,.36]));
  p.push(pt(ex([[-.66,0],[.66,0],[0,1.08]],.75,.01),FLY,[0,.03,1.05],[0,Math.PI/2,0]),pt(ex([[-.42,0],[.42,0],[0,.82]],.02,.004),0x2a2f36,[0,.03,1.44],[0,Math.PI/2,0]),pt(box(.02,.8,.03),0xd0d4d8,[0,.44,1.46]));
  for(const[x,z,ex2,ez]of[[-1.15,-1.05,-1.55,-1.5],[1.15,-1.05,1.55,-1.5],[0,1.42,0,2.0]]){const ty=x===0?1.05:.85,dv=new THREE.Vector3(ex2-x,-ty,ez-z),L=dv.length(),eu=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dv.normalize()));p.push(pt(cyl(.008,.008,L,3),0xd8d2c0,[(x+ex2)/2,ty/2,(z+ez)/2],[eu.x,eu.y,eu.z]));p.push(pt(box(.05,.12,.05),0xb8bec6,[ex2,.05,ez]))}
  GEO.mtent=mg(p);
  const OD=0x4f5a3a,OD2=0x5c6844,q=[pt(box(1.42,.07,1.02),BK,[0,.035,0]),pt(box(1.36,.6,.96),OD,[0,.37,0]),pt(box(1.44,.17,1.04),OD2,[0,.75,0]),pt(box(1.2,.04,.84),OD,[0,.855,0])];
  for(const x of[-.42,0,.42])q.push(pt(box(.07,.5,.03),OD2,[x,.36,.49]));for(const x of[-.5,.5])q.push(pt(box(.14,.17,.05),BK,[x,.66,.52]),pt(box(.08,.06,.02),0x9aa3ad,[x,.69,.55]));
  for(const x of[-.73,.73])q.push(pt(box(.05,.05,.38),BK,[x,.56,0]),pt(box(.04,.12,.05),BK,[x,.5,.17]),pt(box(.04,.12,.05),BK,[x,.5,-.17]));
  for(const x of[-.7,.7])for(const z of[-.5,.5])q.push(pt(box(.1,.2,.1),BK,[x,.75,z]));q.push(pt(box(.36,.1,.01),0xe8d47a,[-.21,.3,.485]),pt(box(.1,.1,.01),0xe8d47a,[.2,.3,.485]));
  GEO.mstash=mg(q)}
 GEO.mine=mg([pt(cyl(.34,.4,.14,10),OLIVE,[0,.07,0]),pt(cyl(.36,.36,.03,10),0x4b552f,[0,.11,0]),pt(cyl(.1,.1,.07,8),METAL,[0,.17,0]),pt(box(.06,.03,.2),BRASS,[.2,.15,0])]);
 {const sp=[];for(let a=0;a<14;a++){const an=a*.449,rr=4.3+hash(a,3,8)*.6;sp.push(pt(new THREE.DodecahedronGeometry(.5+hash(a,1,8)*.5),a%2?0x4a4e57:0x3c4049,[Math.cos(an)*rr,.15,Math.sin(an)*rr],[a,a*2,0],[1,.7,1]))}GEO.pool=mg(sp)}
 GEO.dockp=mg([...Array.from({length:14},(_,i)=>pt(box(2.4,.12,.5),i%3?0xb98556:0x8d5f3b,[(hash(i,1,4)-.5)*.12,.7,i*.56],[0,(hash(i,2,4)-.5)*.06,0])),...[[-1.1,.3],[1.1,.3],[-1.1,3.9],[1.1,3.9],[-1.1,7.5],[1.1,7.5]].map(p=>pt(cyl(.13,.15,3,7),0x8d5f3b,[p[0],-.5,p[1]]))]);
 for(const k in GEO)if(!GEO[k].boundingSphere)GEO[k].computeBoundingSphere()}
/* terrain + water */
let terrain=null,water=null,hTex=null;
let tchunks=[],FLW=null;
function buildTerrain(){const st=2,n=REG/st+1,C4=new THREE.Color();tchunks=[];
 for(let cj=0;cj<RN;cj++)for(let ci=0;ci<RN;ci++){const x0=ci*REG,z0=cj*REG;let mxh=-9;for(let j=0;j<=REG;j+=5)for(let i=0;i<=REG;i+=5)mxh=Math.max(mxh,hAt(x0+i,z0+j));if(mxh<-3.3)continue;
  const pos=new Float32Array(n*n*3),col=new Float32Array(n*n*3),nrm=new Float32Array(n*n*3),idx=new Uint16Array((n-1)*(n-1)*6);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i,x=x0+i*st,z=z0+j*st,h=hAt(x,z);pos[k*3]=x;pos[k*3+1]=h;pos[k*3+2]=z;
   const gx=hAt(x+1,z)-hAt(x-1,z),gz=hAt(x,z+1)-hAt(x,z-1),gl=1/Math.hypot(gx,2,gz);nrm[k*3]=-gx*gl;nrm[k*3+1]=2*gl;nrm[k*3+2]=-gz*gl;
   if(h<-2.2){C1.setHex(0x3b5560).convertSRGBToLinear();col[k*3]=C1.r;col[k*3+1]=C1.g;col[k*3+2]=C1.b;continue}
   const nz=fbm(x*.05+20,z*.05+11,3),I=islAt(x,z),vol=I&&I.tint?1:0;
   C1.setHex(0x74b545).lerp(C2.setHex(0x4f9440),sm(.3,.8,nz)*.9).lerp(C2.setHex(0x9ad058),noise(x*.35,z*.35,7)*.25);C1.lerp(C2.setHex(0xa8cf4e),sm(.58,.78,noise(x*.06+7,z*.06+3,SEED+9))*.3);if(vol)C1.lerp(C2.setHex(0x6f7f5a),sm(.35,.75,fbm(x*.02+50,z*.02+9,4))*.6);
   const fr=sm(.5,.62,noise(x*.035+100,z*.035+100,SEED+4));C1.lerp(C2.setHex(0x3c8238),fr*.5);
   const tp=tundraAt(x,z,h);if(tp>0)C1.lerp(C2.setHex(0xb9bf62).lerp(C3.setHex(0x93a651),nz),tp*.6);{const H=UH(h);if(H>6)C1.lerp(C2.setHex(0x8f9a6e),sm(6,10,H)*.5)}
   const sl=Math.abs(hAt(x+1.5,z)-hAt(x-1.5,z))+Math.abs(hAt(x,z+1.5)-hAt(x,z-1.5));if(sl>1.1)C1.lerp(C2.setHex(vol?0x5a574f:0x7d776a),sm(1.1,2.4,sl));
   let dv=dist(x,z,VIL.px,VIL.pz);if(dv<27)C1.lerp(C2.setHex(0xb39a72),(1-sm(15,27,dv))*.8);
   {const sd2=supD(x,z);if(sd2<8.5)C1.lerp(C2.setHex(0xb39a72),(1-sm(3,8.5,sd2))*.75)}
   if(h>.6){const pd=pathD(x,z);if(pd<3.4)C1.lerp(C2.setHex(0xc4a878),(1-sm(1.1,3.4,pd))*.9)}
   const ld=lhD(x,z);if(ld<19){C1.setHex(0x8b8a82).lerp(C2.setHex(0x6c6b66),noise(x*.45,z*.45,9));if(h>1.3&&ld<6.5)C1.lerp(C2.setHex(0x74a04a),sm(.45,.7,noise(x*.3+4,z*.3,5))*.7);if(h<.25)C1.lerp(C2.setHex(0x55564f),sm(.25,-.6,h))}else if(h<.95)C1.lerp(C2.setHex(vol?0x8d8672:0xe8d49c),sm(.95,.5,h));if(h<-.1)C1.lerp(C2.setHex(0x3b5560),sm(-.1,-1.6,h));C1.convertSRGBToLinear();const v=.96+hash(x,z,5)*.08;col[k*3]=C1.r*v;col[k*3+1]=C1.g*v;col[k*3+2]=C1.b*v}
  let q=0;for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+1,c=a+n,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,TERR);m.receiveShadow=true;m.matrixAutoUpdate=false;scene.add(m);tchunks.push({m,cx:x0+REG/2,cz:z0+REG/2})}
 terrain=tchunks[0].m;
 const N=1024,d=new Uint8Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)d[j*N+i]=clamp((hAt(i/(N-1)*WS,j/(N-1)*WS)+4)/8,0,1)*255;
 hTex=new THREE.DataTexture(d,N,N,THREE.LuminanceFormat);hTex.magFilter=hTex.minFilter=THREE.LinearFilter;hTex.needsUpdate=true;
 const wg=new THREE.PlaneGeometry(3200,3200);wg.rotateX(-Math.PI/2);
 water=new THREE.Mesh(wg,new THREE.ShaderMaterial({transparent:true,uniforms:{tH:{value:hTex},uT:{value:0},uDim:{value:1},cS:{value:new THREE.Color(0x43c4cc).convertSRGBToLinear()},cD:{value:new THREE.Color(0x1a5c8e).convertSRGBToLinear()}},
  vertexShader:`varying vec3 vP;void main(){vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vP,1.);}`,
  fragmentShader:`varying vec3 vP;uniform sampler2D tH;uniform float uT,uDim;uniform vec3 cS,cD;
  float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
  void main(){vec2 uv=vP.xz/${WS}.;float th=(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)?-4.:texture2D(tH,uv).r*8.-4.;float d=-th;
   float n=vn(vP.xz*.35+uT*.3)*.6+vn(vP.xz*.9-uT*.2)*.4;float t=smoothstep(0.,3.,d+n*.4);vec3 c=mix(cS,cD,t);
   float f1=smoothstep(.2,.03,d+n*.09);c+=step(.972,vn(vP.xz*2.3+vec2(uT*.45,-uT*.3)))*smoothstep(.25,1.3,d)*.3;float band=sin((d-n*.3)*11.-uT*1.6)*.5+.5;float f2=smoothstep(.88,.98,band)*smoothstep(.7,.12,d)*.38;float foam=clamp(f1+f2,0.,1.);c=mix(c,vec3(.93,.97,1.),foam);
   float a=mix(.7,.95,smoothstep(0.,1.3,d));a=max(a,foam)*smoothstep(-.03,.04,d);gl_FragColor=vec4(c*uDim,a);
   #include <tonemapping_fragment>
   #include <encodings_fragment>
  }`}));water.position.set(WS/2,0,WS/2);water.renderOrder=2;scene.add(water)}
/* ===== resource objects (instanced per region) ===== */
const OBJT=[{g:'tree_single_A',s:[3.4,4.4],hp:4,r:.45,drop:['wood',3],re:260,stump:1,lab:'베기'},{g:'tree_single_B',s:[4.2,5.2],hp:5,r:.55,drop:['wood',4],re:300,stump:1,lab:'베기'},
 {g:'trees_A_small',s:[3.6,4.4],hp:9,r:1.5,drop:['wood',8],re:420,stump:1,lab:'베기'},{g:'rock_single_E',s:[4.6,6.6],hp:6,r:1.1,drop:['stone',3],re:420,lab:'캐기'},
 {g:'bush',s:[1,1.3],hp:1,r:0,drop:['berry',2],re:200,berry:1,lab:'따기'},{g:'scrap',s:[1.5,1.9],hp:4,r:.9,drop:['scrap',3],re:900,lab:'뒤지기'}];
let objs=new Map(),regions=[];const POI={camps:[],wrecks:[],springs:[],guards:[],lh:[],bunk:[]};
const okey=(x,z)=>((z/CELL)|0)*CN+((x/CELL)|0);
function genObjects(sd){objs=new Map();
 // points of interest
 POI.lh=LHS;POI.bunk=[];POI.camps=[];POI.wrecks=[];POI.springs=[];POI.guards=[];
 for(let cz=1;cz<CN-1;cz++)for(let cx=1;cx<CN-1;cx++){const x=(cx+.5)*CELL+(hash(cx,cz,sd+1)-.5)*1.8,z=(cz+.5)*CELL+(hash(cx,cz,sd+2)-.5)*1.8,h0=hAt(x,z);if(h0<.85||lhD(x,z)<17)continue;const h=UH(h0),I=islAt(x,z)||ISL[0];if(I.ty===2&&dist(x,z,I.x,I.z)<3.2)continue;
  {const sd2=supD(x,z);if(sd2<8.5||sd2<12.5&&hash(cx,cz,sd+31)<.65)continue}if(pathD(x,z)<2.6||PORTS.some(p=>dist(x,z,p.x-p.dx*p.R*.4,p.z-p.dz*p.R*.4)<p.R*(p.town?1.05:.9)))continue;if(POI.camps.some(c=>dist(x,z,c.x,c.z)<13)||POI.springs.some(c=>dist(x,z,c.x,c.z)<8)||POI.lh.some(c=>dist(x,z,c.x,c.z)<6)||POI.bunk.some(c=>dist(x,z,c.x,c.z)<7))continue;const r=hash(cx,cz,sd+9),f=noise(x*.035+100,z*.035+100,sd+4),dens=(h>9?.01:f>.57?.3:f>.45?.07:.015)*I.fo;let t=-1;
  const nw=POI.wrecks.some(c=>dist(x,z,c.x,c.z)<7);
  if(nw){if(r<.45)t=5}else if(r<dens){const r2=hash(cx,cz,sd+10);t=r2<.5?0:r2<.82?1:2}else if(r<dens+.05+I.ro+(h>7?.08:0))t=3;else if(r<dens+.068&&h<7)t=4;
  if(t<0)continue;const T=OBJT[t];objs.set(cz*CN+cx,{t,x,z,hp:T.hp,re:0,sc:lerp(T.s[0],T.s[1],hash(cx,cz,sd+11)),rot:hash(cx,cz,sd+12)*6.28,sh:0,gk:objKey(t,x,z,h,I,cx,cz,sd)});const o=objs.get(cz*CN+cx),sp=['t_oak','t_maple','t_gold'].indexOf(o.gk);if(sp>=0){o.gk=sp?'t_fall':'t_leaf';o.sp=sp}}}
/* which model an object uses: tree species grow in groves, rocks vary */
function objKey(t,x,z,h,I,cx,cz,sd){const T=OBJT[t];if(t===3)return hash(cx,cz,sd+14)<.3?'rockB':T.g;if(t>1)return T.g;const g=noise(x*.018+40,z*.018+7,sd+15),r=hash(cx,cz,sd+14);if(h>6.5)return T.g;if(I.tint)return r<.16?'t_dead':r<.3?'t_birch':T.g;
 if(g<.4)return r<.1?'t_oak':T.g;if(g<.62)return r<.42?'t_oak':r<.6?'t_birch':r<.66?'t_maple':T.g;return r<.4?'t_birch':r<.64?'t_maple':r<.74?'t_gold':r<.92?'t_oak':T.g}
/* after every building is placed: drop any tree, rock or bush that ended up inside one */
function pruneObjects(){const L=structs.filter(s=>!sdef(s).pass&&s.t!=='ruin');let n=0;objs.forEach((o,k)=>{if(CLEARS.some(c=>dist(o.x,o.z,c[0],c[1])<c[2])){objs.delete(k);n++;return}const r=(OBJT[o.t].r||.5)*.75+.35;for(const s of L){if(Math.abs(s.x-o.x)>8||Math.abs(s.z-o.z)>8)continue;if(inStruct(s,o.x,o.z,r)){objs.delete(k);n++;break}}if(objs.has(k)&&onDock(o.x,o.z)){objs.delete(k);n++}});return n}
function objMatrix(o,hide,tilt){dummy.position.set(o.x,hAt(o.x,o.z)-.05,o.z);dummy.rotation.set(0,o.rot,tilt||0);dummy.scale.setScalar(hide?1e-4:o.sc);dummy.updateMatrix();return dummy.matrix}
function refreshObj(o){const rg=regions[o.rg],T=OBJT[o.t],gone=o.re>0;if(T.berry){rg.m.berries.setMatrixAt(o.bi,objMatrix(o,gone));rg.m.berries.instanceMatrix.needsUpdate=true;return}
 rg.m[o.gk].setMatrixAt(o.ii,objMatrix(o,gone,o.sh>0?Math.sin(o.sh*40)*o.sh*.5:0));rg.m[o.gk].instanceMatrix.needsUpdate=true;
 if(T.stump){dummy.position.set(o.x,hAt(o.x,o.z)-.03,o.z);dummy.rotation.set(0,o.rot,0);dummy.scale.setScalar(gone?o.sc*.5:1e-4);dummy.updateMatrix();rg.m.stump.setMatrixAt(o.si,dummy.matrix);rg.m.stump.instanceMatrix.needsUpdate=true}}
const LEAFC=[[0x4e9a3c,0x5fae48,0x438a36],[0xe0872d,0xd9652a,0xe89a34],[0xe9c63c,0xd9b02e,0xf0cf4a]];
function buildRegions(){regions.forEach(r=>{scene.remove(r.g);if(r.d){scene.remove(r.d);r.d.geometry.dispose()}});regions=[];for(let i=0;i<RN*RN;i++)regions.push({g:new THREE.Group(),m:{},cnt:{},cx:(i%RN+.5)*REG,cz:((i/RN|0)+.5)*REG});
 objs.forEach(o=>{o.rg=clamp((o.z/REG)|0,0,RN-1)*RN+clamp((o.x/REG)|0,0,RN-1);const c=regions[o.rg].cnt,T=OBJT[o.t];o.ii=c[o.gk]=(c[o.gk]||0);c[o.gk]++;if(T.stump){o.si=c.stump=(c.stump||0);c.stump++}if(T.berry){o.bi=c.berries=(c.berries||0);c.berries++}});
 regions.forEach(r=>{for(const k in r.cnt){const im=new THREE.InstancedMesh(k==='stump'?GEO.tree_single_A_cut:GEO[k],MAT,r.cnt[k]);im.castShadow=k!=='berries';im.receiveShadow=true;im.frustumCulled=false;C1.setRGB(1,1,1);for(let q=0;q<r.cnt[k];q++)im.setColorAt(q,C1);r.m[k]=im;r.g.add(im)}scene.add(r.g)});
 objs.forEach(o=>{const T=OBJT[o.t];if(T.berry){regions[o.rg].m.bush.setMatrixAt(o.ii,objMatrix(o));refreshObj(o)}else{refreshObj(o);const k=hash(o.x*7|0,o.z*7|0,3),k2=hash(o.x*5|0,o.z*9|0,4),b=.84+k*.28;if(o.sp!==undefined){C1.setHex(LEAFC[o.sp][(k2*3)|0]).convertSRGBToLinear().multiplyScalar(.9+k*.22)}else C1.setRGB(b*(1+(k2-.5)*.16),b,b*(1-(k2-.5)*.12));regions[o.rg].m[o.gk].setColorAt(o.ii,C1)}});
 regions.forEach(r=>{for(const k in r.m)if(r.m[k].instanceColor)r.m[k].instanceColor.needsUpdate=true});}
const _fr=new THREE.Frustum(),_pm=new THREE.Matrix4(),_sp=new THREE.Sphere();
/* regions are shown only when near AND inside the camera view (with a margin so shadows from just off-screen still fall in) */
function cullRegions(x,z){cam.updateMatrixWorld();cam.matrixWorldInverse.copy(cam.matrixWorld).invert();_fr.setFromProjectionMatrix(_pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
 for(const r of regions){let v=Math.abs(r.cx-x)<REG*.5+72&&Math.abs(r.cz-z)<REG*.5+78;if(v){_sp.center.set(r.cx,2,r.cz);_sp.radius=REG*.71+14;v=_fr.intersectsSphere(_sp)}r.g.visible=v}dressCull(x,z);for(const t of tchunks)t.m.visible=Math.abs(t.cx-x)<REG*.5+105&&Math.abs(t.cz-z)<REG*.5+115}
/* ===== structures ===== */
const DECO={home_A:{g:'home_A',s:4.1,bx:1.5,bz:1.6},home_B:{g:'home_B',s:4.1,bx:1.7,bz:2.1},market:{g:'market',s:3.6,bx:3.1,bz:2.2},blacksmith:{g:'blacksmith',s:3.8,bx:2.3,bz:2.2},well:{g:'well',s:3.6,bx:1,bz:1.1},windmill:{g:'windmill',s:4.2,bx:2,bz:1.5},tavern:{g:'tavern',s:3.9,bx:2.1,bz:2.4},
 lumbermill:{g:'lumbermill',s:3.8,bx:2.4,bz:2},tent:{g:'tent',s:5,bx:.1,bz:.1,pass:1},loot:{g:'crate_A_big',s:5.2,bx:.55,bz:.55,loot:1},chest:{g:'chest',s:.8,bx:.65,bz:.55,loot:2},barrel:{g:'barrel',s:4.6,bx:.4,bz:.4},crate:{g:'crate_B_big',s:4.6,bx:.5,bz:.5},
 rack:{g:'weaponrack',s:4.6,bx:.5,bz:.3},target:{g:'target',s:4.6,bx:.5,bz:.3},flagR:{g:'flag_red',s:5,bx:.1,bz:.1,pass:1},flagB:{g:'flag_blue',s:5,bx:.1,bz:.1,pass:1},ruin:{g:'building_destroyed',s:4,bx:2.6,bz:2.2},towerR:{g:'tower_A_red',s:3.4,bx:1.6,bz:1.8},towerB:{g:'tower_A',s:3.4,bx:1.6,bz:1.8},
 lighthouse:{g:'lighthouse',s:1,bx:2.4,bz:2.4},bunker:{g:'bunker',s:1,bx:2.5,bz:2,loot:3},lumber:{g:'resource_lumber',s:4.6,bx:1.4,bz:.7},spring:{g:'pool',s:1,bx:.1,bz:.1,pass:1},dock:{g:'dockp',s:1,bx:.1,bz:.1,pass:1,flat:1},sackD:{g:'sack',s:7,bx:.1,bz:.1,pass:1},wheel:{g:'wheelbarrow',s:4.6,bx:.5,bz:1}};
let structs=[];const lightsrc=[],warmsrc=[];
const flameMat=[new THREE.MeshBasicMaterial({color:new THREE.Color(1.7,.33,.04)}),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,.95,.1)}),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.1,.5)})];
let glowTex=null;function glow(color,size,op=.5){if(!glowTex){const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=g;k.fillRect(0,0,64,64);glowTex=new THREE.CanvasTexture(c)}
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.scale.setScalar(size);return s}
function flames(g,y,s){const fl=[];const mk=(r,h,m,yy,ox,oz)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),flameMat[m]);b.position.set(ox,yy,oz);g.add(b);const t=new THREE.Mesh(new THREE.ConeGeometry(r*.93,h,8),flameMat[m]);t.position.set(ox*1.3,yy+r*.5+h/2,oz*1.3);g.add(t);fl.push(t)};
 mk(.4*s,.95*s,0,y+.42*s,0,0);mk(.27*s,.7*s,1,y+.4*s,.03,.05);mk(.15*s,.42*s,2,y+.36*s,-.02,.08);const gl=glow(0xff7a2a,6*s,.4);gl.position.y=y+.9*s;g.add(gl);return fl}
function sdef(s){return BUILDS[s.t]||DECO[s.t]}
/* ground as the terrain mesh draws it (2m grid, see buildTerrain) and the highest point of it under a footprint (half sizes f=[x,z]):
   structures with a ground sheet (d.foot, e.g. the tent) sit on that highest point so no part of the sheet sinks into the grass */
const gridH=(x,z)=>{const x0=Math.floor(x/2)*2,z0=Math.floor(z/2)*2,fx=(x-x0)/2,fz=(z-z0)/2;return (hAt(x0,z0)*(1-fx)+hAt(x0+2,z0)*fx)*(1-fz)+(hAt(x0,z0+2)*(1-fx)+hAt(x0+2,z0+2)*fx)*fz};
function footY(x,z,f){let m=-99;for(let i=-1;i<=1.001;i+=.25)for(let j=-1;j<=1.001;j+=.25)m=Math.max(m,gridH(x+i*f[0],z+j*f[1]));return m+.004}
function addStruct(s){const d=sdef(s),g=new THREE.Group();const m=mesh(GEO[d.g]);m.scale.setScalar(d.s);g.add(m);const y=d.flat?0:d.foot?footY(s.x,s.z,d.foot):hAt(s.x,s.z);g.position.set(s.x,y-.04+(s.yo||0),s.z);g.rotation.y=s.r||0;
 if(d.lamp){const gl=glow(0xffc46a,3.6,.6);gl.position.set(0,d.lamp,.48);gl.visible=false;g.add(gl);PLAMPS.push(gl);s.fl=[];lightsrc.push(s)}
 if(s.t==='fire'){s.fl=flames(g,0,1.1);lightsrc.push(s)}if(s.t==='torch'){s.fl=[];const gl=glow(0xff8a3a,3.5,.35);gl.position.y=1.8;g.add(gl);lightsrc.push(s)}
 if(s.t==='spring'){const d2=new THREE.Mesh(new THREE.CircleGeometry(4.3,24),new THREE.MeshBasicMaterial({color:new THREE.Color(.25,.85,.9),transparent:true,opacity:.82}));d2.rotation.x=-Math.PI/2;d2.position.y=.14;g.add(d2);s.steam=[];for(let i=0;i<7;i++){const sp=glow(0xffffff,4.5,.16);sp.material.blending=THREE.NormalBlending;sp.position.set(Math.cos(i*2.3)*2.4,1+i*.6,Math.sin(i*2.3)*2.4);sp.userData.p=i/7;g.add(sp);s.steam.push(sp)}warmsrc.push(s)}
 if(s.t==='lighthouse'){const b=new THREE.Mesh(new THREE.ConeGeometry(4.5,46,16,1,true),new THREE.MeshBasicMaterial({color:0xfff0b8,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));b.geometry.translate(0,-23,0);b.rotation.z=Math.PI/2+.12;const pv=new THREE.Group();pv.position.y=11;pv.add(b);g.add(pv);const gl=glow(0xffe08a,9,.8);gl.position.y=11;g.add(gl);s.beam=pv;s.gl=gl;POI.lhS.push(s)}
 if(s.t==='slight'){s.head=mesh(GEO.slhead,MATT);s.head.position.y=2.3;g.add(s.head);const b=new THREE.Mesh(new THREE.ConeGeometry(2.6,13,14,1,true),new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));b.geometry.translate(0,-6.5,0);b.rotation.x=-Math.PI/2+.16;b.position.set(0,.25,.45);s.head.add(b);s.beam=b;b.visible=false}
 if(s.t==='gen')s.fuel=s.fuel||0;
 if(d.tur){const T=d.tur,h=new THREE.Group();h.position.y=1.17;g.add(h);h.add(mesh(GEO[T.head],MATT));const b=mesh(GEO[T.brl],MATT);b.position.set(0,.24,T.bz);h.add(b);const L=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:0x55ff77,fog:false}));L.position.set(.14,.66,.02);h.add(L);const fl=glow(0xffc46a,1.5,.95);fl.position.set(0,.24,T.bz+(T.fl||.75));fl.visible=false;h.add(fl);
  Object.assign(s,{head:h,brl:b,lamp:L,flash:fl,cd:0,rec:0,spin:0,flT:0,dep:s.fresh?0:1,ammo:s.ammo||0,scanP:Math.random()*6})}
 if(s.t==='mg'){s.gun=mesh(GEO.mggun);s.gun.position.y=1.12;g.add(s.gun);s.cd=0;s.ammo=s.ammo||0}
 if(s.hp===undefined)s.hp=d.hp||1e9;s.max=d.hp||1e9;s.m=g;scene.add(g);structs.push(s);return s}
function removeStruct(s){scene.remove(s.m);const i=structs.indexOf(s);if(i>=0)structs.splice(i,1);const j=lightsrc.indexOf(s);if(j>=0)lightsrc.splice(j,1)}
function inStruct(s,x,z,r){const d=sdef(s);if(d.pass)return false;const dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz>36)return false;const c=Math.cos(s.r||0),sn=Math.sin(s.r||0),lx=dx*c-dz*sn,lz=dx*sn+dz*c,qx=clamp(lx,-d.bx,d.bx),qz=clamp(lz,-d.bz,d.bz);return (lx-qx)**2+(lz-qz)**2<r*r}
/* returns null (free), true (terrain/tree) or the struct in the way */
function blocked(x,z,r,wm=0,pl=0){if(x<4||z<4||x>WS-4||z>WS-4)return true;const hh=hAt(x,z);if(wm===0?hh<.12:wm===1?hh<-.45:false)return true;
 const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const o=objs.get((cz+j)*CN+cx+i);if(!o||o.re>0)continue;const rr=OBJT[o.t].r;if(rr&&(x-o.x)**2+(z-o.z)**2<(rr+r)**2)return true}
 for(const s of structs){if(pl&&sdef(s).gate)continue;if(inStruct(s,x,z,r))return s}return null}
/* world structures: only what the map owner asked for (ports are in ports.js, supply drops in dress.js) */
function villageAndPOI(){POI.lhS=[];POI.guards=[];POI.lh.forEach((c,i)=>{addStruct({t:'lighthouse',x:c.x,z:c.z,r:0}).li=i;lhIslet(c,i)});buildSupply();villageDress()}
/* boulders and moss around a sea lighthouse, set on the islet's real slope (the front path stays clear) */
function lhIslet(c,i){const y0=hAt(c.x,c.z),p=[];for(let a=0;a<17;a++){const an=a*.37+hash(a,i,90)*.3,far=a>9,rr=far?8.6+hash(a,i,92)*3.4:5.6+hash(a,i,91)*1.9,x=Math.cos(an)*rr,z=Math.sin(an)*rr,s=.5+hash(a,i,93)*(far?1:.55),h=hAt(c.x+x,c.z+z);if(h<-1.7||z>0&&Math.abs(x)<2.6)continue;
  p.push(pt(new THREE.DodecahedronGeometry(s),[0x8f8e86,0x7a7972,0x6a6964][a%3],[x,h-y0+s*.22,z],[a,a*1.7,a*.6],[1,.72,1.1]))}
 for(let a=0;a<5;a++){const an=a*1.3+i+2.2,rr=3.9+hash(a,i,94)*1.5,x=Math.cos(an)*rr,z=Math.sin(an)*rr;if(z>0&&Math.abs(x)<2.6)continue;p.push(pt(ico(.5,1),a%2?0x5f9c48:0x6aa64f,[x,hAt(c.x+x,c.z+z)-y0+.03,z],0,[1.3,.2,1.1]))}
 const m=mesh(mg(p),MATT);m.position.set(c.x,y0,c.z);scene.add(m)}
/* ===== fx ===== */
const tracers=[],parts=[],floats=[],booms=[];let flashL=null;
function initFx(){const tm=new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.4,.9),fog:false});for(let i=0;i<20;i++){const m=new THREE.Mesh(box(.05,.05,1),tm);m.visible=false;scene.add(m);tracers.push({m,t:0})}
 for(let i=0;i<40;i++){const m=new THREE.Mesh(box(.12,.12,.12),new THREE.MeshBasicMaterial({color:0xffffff}));m.visible=false;scene.add(m);parts.push({m,t:9,l:0,vx:0,vy:0,vz:0})}
 flashL=glow(0xffc46a,2.6,.9);flashL.visible=false;scene.add(flashL)}
function tracer(ax,ay,az,bx,by,bz){const t=tracers.find(t=>t.t<=0);if(!t)return;const d=Math.hypot(bx-ax,by-ay,bz-az);t.m.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2);t.m.lookAt(bx,by,bz);t.m.scale.set(1,1,d);t.m.visible=true;t.t=.07;flashL.position.set(ax,ay,az);flashL.visible=true;flashL.userData.t=.05}
function puff(x,y,z,col,n,sp=1){let c=0;for(const p of parts){if(c>=n)break;if(p.t<p.l)continue;p.m.material.color.set(col);p.m.position.set(x,y,z);p.vx=rand(-2,2)*sp;p.vy=rand(1.5,4)*sp;p.vz=rand(-2,2)*sp;p.t=0;p.l=rand(.35,.65);p.m.visible=true;c++}}
function boom(x,y,z,r){const m=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.4,.3),transparent:true,opacity:.9}));m.position.set(x,y,z);scene.add(m);booms.push({m,t:0,r});puff(x,y+.5,z,0x4a4038,14,2);puff(x,y+.5,z,0xff9a3c,10,2.2);sfx(90,.5,'sawtooth',.2,.3);buzz(80)}
function ftext(x,y,z,s,col='#fff'){floats.push({x,y,z,s,col,t:0})}
function updFx(dt){for(const t of tracers)if(t.t>0){t.t-=dt;if(t.t<=0)t.m.visible=false}if(flashL.visible){flashL.userData.t-=dt;if(flashL.userData.t<=0)flashL.visible=false}
 for(const p of parts){if(p.t>=p.l){p.m.visible=false;continue}p.t+=dt;p.vy-=11*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.rotation.x+=dt*8;p.m.scale.setScalar(1-p.t/p.l)}
 for(let i=booms.length-1;i>=0;i--){const b=booms[i];b.t+=dt;b.m.scale.setScalar(b.r*Math.min(1,b.t/.18));b.m.material.opacity=.9*(1-b.t/.4);if(b.t>.4){scene.remove(b.m);booms.splice(i,1)}}}
/* ===== environment per frame ===== */
const pLights=[];const camT=new THREE.Vector3();const cDay=new THREE.Color(0xbfe3f2),cDusk=new THREE.Color(0xf2bba6),cNight=new THREE.Color(0x0b1530);let gt=0,zoomK=1,shake=0,snowP=null,aurora=[];
function initLights(){for(let i=0;i<3;i++){const l=new THREE.PointLight(0xff8a3a,0,18,1.5);scene.add(l);pLights.push(l)}
 const n=420,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=rand(-26,26);p[i*3+1]=rand(0,22);p[i*3+2]=rand(-26,26)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));glow(0xffffff,1);
 snowP=new THREE.Points(g,new THREE.PointsMaterial({map:glowTex,color:0xfff6c8,size:.14,transparent:true,opacity:.4,depthWrite:false}));snowP.frustumCulled=false;scene.add(snowP);
 for(let k=0;k<2;k++){const ag=new THREE.PlaneGeometry(320,46,48,1),ap=ag.attributes.position;for(let i=0;i<ap.count;i++)ap.setZ(i,Math.sin(ap.getX(i)*.03+k*2)*22);
  const m=new THREE.Mesh(ag,new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uA:{value:0},uK:{value:k}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'varying vec2 vUv;uniform float uT,uA,uK;void main(){float b=sin(vUv.x*44.+uT*.6+uK*3.+sin(vUv.x*9.-uT*.25)*2.5)*.5+.5;float a=pow(1.-vUv.y,1.6)*smoothstep(0.,.12,vUv.y)*(.3+.7*b)*smoothstep(0.,.12,vUv.x)*smoothstep(1.,.88,vUv.x);vec3 c=mix(vec3(.15,1.,.55),vec3(.45,.3,1.),vUv.y*1.1);gl_FragColor=vec4(c*a*uA,a*uA);}'}));m.renderOrder=-5;scene.add(m);aurora.push(m)}}
function updEnv(dt,px,pz){gt+=dt;const dk=dark();C1.copy(cDay).lerp(cNight,dk);if(dk>.02&&dk<.98)C1.lerp(cDusk,Math.sin(dk*Math.PI)*.5);if(WX.b>0){C1.lerp(C2.setRGB(lerp(.78,.2,dk),lerp(.82,.23,dk),lerp(.88,.3,dk)),WX.b*.8)}scene.background.copy(C1);scene.fog.color.copy(C1);scene.fog.near=lerp(55,16,WX.b);scene.fog.far=lerp(185,72,WX.b);
 hemi.intensity=lerp(.56,.38,dk);{const au=sm(.6,1,dk)*(.5+.5*Math.sin(gt*.35));hemi.color.setRGB(lerp(.8,.4,dk)-au*.12,lerp(.88,.5,dk)+au*.3,lerp(1,.95,dk)-au*.2)}hemi.groundColor.setRGB(lerp(.55,.12,dk),lerp(.6,.15,dk),lerp(.68,.3,dk));
 sun.intensity=lerp(.95,.3,dk);sun.color.setRGB(lerp(1,.6,dk),lerp(.9,.72,dk),lerp(.76,1,dk));const sa=(S.time-.25)*Math.PI*2;sun.position.set(px+Math.cos(sa)*40+10,46,pz+28);sun.target.position.set(px,0,pz);
 water.material.uniforms.uT.value=gt;water.material.uniforms.uDim.value=lerp(1,.3,dk);
 lightsrc.sort((a,b)=>((a.x-px)**2+(a.z-pz)**2)-((b.x-px)**2+(b.z-pz)**2));
 pLights.forEach((L,i)=>{const s=lightsrc[i];if(!s||dist(s.x,s.z,px,pz)>50){L.intensity=0;return}L.position.set(s.x,hAt(s.x,s.z)+(s.t==='fire'?1.2:2),s.z);L.intensity=(s.t==='fire'?2.2:1.3)*(.25+dk*.9)*(1+Math.sin(gt*9+i)*.08)});
 if(POI.lhS)for(const s of POI.lhS){const on=!!(S.lh&&S.lh[s.li]);s.beam.visible=on&&dk>.25;s.gl.visible=on;s.beam.rotation.y=gt*.7+s.li}
 for(const s of lightsrc)if(s.fl)s.fl.forEach((f,i)=>{f.scale.y=1+Math.sin(gt*(9+i*3)+s.x)*.18;f.rotation.y=gt*2});
 for(const s of warmsrc)if(s.steam&&dist(s.x,s.z,px,pz)<70)s.steam.forEach(sp=>{const u=(sp.userData.p+gt*.12)%1;sp.position.y=.6+u*6;sp.material.opacity=.2*Math.sin(u*Math.PI);sp.scale.setScalar(3+u*5)});
 const sa2=snowP.geometry.attributes.position,arr=sa2.array;for(let i=0;i<arr.length;i+=3){arr[i+1]-=dt*((.25+(i%7)*.06)+WX.b*(20+(i%5)*2));arr[i]+=dt*(.5+Math.sin(gt+i)*.5+WX.b*5);if(arr[i+1]<0){arr[i+1]=22;arr[i]=rand(-26,26);arr[i+2]=rand(-26,26)}if(arr[i]>26)arr[i]-=52}sa2.needsUpdate=true;snowP.position.set(camT.x,camT.y-1,camT.z-2);snowP.visible=!INT.on;
 aurora.forEach((m,k)=>{m.material.uniforms.uT.value=gt;m.material.uniforms.uA.value=sm(.55,1,dk)*.9;m.position.set(camT.x-20+k*50,62+k*10,camT.z-150-k*30);m.visible=false});if(INT.on)intLight(dk)}
function updWeather(dt){WX.t-=dt;if(WX.t<=0){WX.on=!WX.on;WX.t=WX.on?rand(60,110):rand(260,540);toast(WX.on?'🌧 비바람이 몰아쳐요! 앞이 잘 안 보이고 몸이 식어요':'비가 그쳤어요');hudDirty=true}WX.b=clamp(WX.b+(WX.on?dt:-dt)*.22,0,1);snowP.material.size=.14+WX.b*.1;snowP.material.opacity=.4+WX.b*.4;snowP.material.color.setRGB(lerp(1,.75,WX.b),lerp(.96,.85,WX.b),lerp(.78,1,WX.b));windVol((.014+WX.b*.075)*(1+Math.sin(gt*.6)*.3+Math.sin(gt*1.7)*.15))}
function updCamera(dt,px,py,pz,snap){const k=snap?1:Math.min(1,dt*6);camT.x+=(px-camT.x)*k;camT.z+=(pz-camT.z)*k;camT.y+=(py-camT.y)*Math.min(1,dt*4);if(snap)camT.y=py;const pr=innerWidth<innerHeight?1.45:1;shake=Math.max(0,shake-dt*3);const sx=(Math.random()-.5)*shake,sz=(Math.random()-.5)*shake;if(INT.on){intCam(camT);return}   /* 텐트 안: 방 전체가 보이게 가까이, 거의 고정 */
 cam.position.set(camT.x+sx,camT.y+15.5*zoomK*pr,camT.z+14*zoomK*pr+sz);cam.lookAt(camT.x+sx,camT.y+1,camT.z-1+sz)}
