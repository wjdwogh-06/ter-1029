'use strict';
/* ===== dress: extra tree species, ground dressing (one lazily built batch per region), supply spots, bridges, village touches ===== */
const DT={},CLEARS=[],SMOKES=[];
/* merge that keeps hand-set normals (grass blades are lit like the ground they stand on) */
function cat(parts){let n=0;parts.forEach(g=>{if(!g.userData.keepN)g.computeVertexNormals();n+=g.attributes.position.count});const pos=new Float32Array(n*3),col=new Float32Array(n*3),nr=new Float32Array(n*3);let o=0;
 parts.forEach(g=>{pos.set(g.attributes.position.array,o*3);col.set(g.attributes.color.array,o*3);nr.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count});
 const B=new THREE.BufferGeometry();B.setAttribute('position',new THREE.BufferAttribute(pos,3));B.setAttribute('color',new THREE.BufferAttribute(col,3));B.setAttribute('normal',new THREE.BufferAttribute(nr,3));B.computeBoundingSphere();return B}
/* flat two-sided blades: [x,z,height,width,lean,yaw,colour] */
function blades(list){const pos=[],col=[],nr=[],C=new THREE.Color();for(const[x,z,h,w,lean,yaw,c]of list){C.set(c).convertSRGBToLinear();const cs=Math.cos(yaw),sn=Math.sin(yaw),bx=cs*w/2,bz=sn*w/2,A=[x-bx,0,z-bz],B=[x+bx,0,z+bz],T=[x-sn*lean,h,z+cs*lean];
  for(const tri of[[A,B,T],[B,A,T]])for(const p of tri){pos.push(p[0],p[1],p[2]);const k=p===T?1.13:.82;col.push(C.r*k,C.g*k,C.b*k);nr.push(-sn*.25,1,cs*.25)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nr,3));g.userData.keepN=true;return g}
function segG(a,b,r,c,sides=4){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length(),g=cyl(r,r,L,sides);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())));return pt(g,c,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2])}
const ringN=(n,fn)=>{const o=[];for(let i=0;i<n;i++)o.push(fn(i,i/n*6.283));return o};
function ptTree(trunkC,cols,o={}){const p=[],h=o.h||.5,tr=o.tr||.06,oc=(a,b,hh,n)=>new THREE.CylinderGeometry(a,b,hh,n,1,true);p.push(pt(oc(tr*.72,tr*1.3,h+.1,5),trunkC,[0,h/2-.07,0]));
 for(let i=0;i<3;i++){const a=i*2.09+.4;p.push(pt(new THREE.ConeGeometry(tr*.9,.17,3,1,true),trunkC,[Math.cos(a)*tr*1.15,.0,Math.sin(a)*tr*1.15],[Math.sin(a)*.9,0,-Math.cos(a)*.9]))}
 p.push(pt(oc(tr*.3,tr*.48,.26,4),trunkC,[.1,h*.8,.02],[0,0,-.95]));
 (o.blobs||[[0,h+.31,0,.38],[.24,h+.15,.1,.28],[-.22,h+.2,-.12,.27],[.03,h+.6,.02,.22],[-.05,h+.1,.22,.21]]).forEach((b,i)=>p.push(pt(ico(b[3],0),cols[i%cols.length],[b[0],b[1],b[2]],[i*1.3,i*2.1,i*.7],[1,.84,1])));return mg(p)}
function buildDressGeo(){const G=0x5fa544,G2=0x4f9440,G3=0x7ab84f,GD=0x3f8f3c,WD=0x7a5a3a,WD2=0x5f432a,RK=0x9a9a92,RK2=0x86867f,MOSS=0x5f9a4a;
 /* trees (authored 1.2 tall like the pack trees, scaled ×4 in the world) */
 /* leafy trees have a grey canopy: the per-instance tint makes them oak (t_leaf) or maple / golden (t_fall). Trunk colours are pre-divided by the usual tint so they stay brown */
 for(const[k,tc]of[['t_leaf',[2.4,.25,.7]],['t_fall',[.25,.2,.9]]]){const g=ptTree(0xff00ff,[0xffffff,0xdedede,0xc4c4c4,0xf0f0f0,0xd2d2d2]),c=g.attributes.color.array;for(let i=0;i<c.length;i+=3)if(c[i]>.9&&c[i+1]<.1&&c[i+2]>.9){c[i]=tc[0];c[i+1]=tc[1];c[i+2]=tc[2]}GEO[k]=g}
 {const h=.82,p=[pt(new THREE.CylinderGeometry(.034,.052,h+.1,5,1,true),0xe9e5d8,[0,h/2-.06,0])];for(const y of[.16,.36,.56,.7])p.push(pt(new THREE.CylinderGeometry(.046,.05,.024,4,1,true),0x3a3a36,[0,y,0],[0,y*9,0],[1,1,.6]));
  [[0,h+.2,0,.28],[.15,h+.04,.05,.2],[-.13,h+.1,-.07,.19],[0,h+.44,0,.16],[.05,h+.06,-.16,.15]].forEach((b,i)=>p.push(pt(ico(b[3],b[4]||0),[0x8fc64a,0xa4d455,0x7db840,0x9ccf52,0x86bf46][i],[b[0],b[1],b[2]],[i,i*2,i*.6],[1,.9,1])));GEO.t_birch=mg(p)}
 {const c=0x7b7167,p=[pt(cyl(.04,.075,.9,6),c,[0,.4,0])];for(const[a,y,l,t]of[[.3,.55,.4,.9],[2.4,.68,.34,1.0],[4.4,.5,.3,.8],[1.3,.82,.26,.6]])p.push(segG([0,y,0],[Math.cos(a)*l*Math.sin(t),y+l*Math.cos(t),Math.sin(a)*l*Math.sin(t)],.018,c,5));GEO.t_dead=mg(p)}
 GEO.rockB=mg([pt(GEO.rock_single_C,null,[0,0,0],[0,.4,0],[1.3,1.55,1.3]),pt(GEO.rock_single_B,null,[.27,0,.16],[0,1.2,0],[1.1,1.2,1.1]),pt(GEO.rock_single_D,null,[-.2,0,.24],[0,2.2,0],[.9,.9,.9])]);
 /* ground dressing templates */
 const T=(k,g)=>{if(!g.attributes.normal||!g.userData.keepN)g.computeVertexNormals();DT[k]={p:g.attributes.position.array,c:g.attributes.color.array,n:g.attributes.normal.array,cnt:g.attributes.position.count}};
 T('tuft',blades(ringN(6,(i,a)=>[Math.cos(a)*.1,Math.sin(a)*.1,.15+hash(i,1,5)*.2,.14,.08+hash(i,2,5)*.1,a+1.57,i%2?G:G2])));
 T('tuftL',blades(ringN(8,(i,a)=>[Math.cos(a)*.17,Math.sin(a)*.17,.26+hash(i,3,5)*.26,.14,.1+hash(i,4,5)*.14,a+1.57,i%3?G:G3])));
 T('wheat',blades(ringN(8,(i,a)=>[Math.cos(a)*.17,Math.sin(a)*.17,.26+hash(i,5,5)*.24,.12,.1+hash(i,6,5)*.14,a+1.57,i%2?0xa9bd55:0x97ad4a])));
 T('bgrass',blades(ringN(6,(i,a)=>[Math.cos(a)*.1,Math.sin(a)*.1,.34+hash(i,7,5)*.3,.08,.18+hash(i,8,5)*.18,a+1.57,i%2?0xbfc27a:0xa9b566])));
 T('fern',blades(ringN(8,(i,a)=>[Math.cos(a)*.05,Math.sin(a)*.05,.2+hash(i,9,5)*.12,.2,.42+hash(i,10,5)*.16,a+1.57,i%2?GD:0x4d9c44])));
 T('reed',cat([blades(ringN(6,(i,a)=>[Math.cos(a)*.12,Math.sin(a)*.12,.8+hash(i,11,5)*.55,.07,.06+hash(i,12,5)*.14,a+1.57,i%2?0x6f9a3e:0x86ad4a])),pt(new THREE.CylinderGeometry(.035,.035,.24,4,1,true),0x6b4a2e,[.06,1.02,.02]),pt(new THREE.CylinderGeometry(.03,.03,.2,4,1,true),0x7a5634,[-.1,.86,-.06])]));
 [0xf6f2e8,0xf2d24a,0xe58fb2,0x9a8be0,0xe2473c,0x6fb6ee].forEach((c,k)=>T('flw'+k,cat([blades([...ringN(3,(i,a)=>[Math.cos(a)*.07,Math.sin(a)*.07,.18+hash(i,k,6)*.1,.09,.1,a+1.57,G2]),[0,0,.34,.03,0,.3,0x4f8a40],[.12,.06,.26,.03,0,1.3,0x4f8a40],[-.1,.09,.29,.03,0,2.3,0x4f8a40]]),
  ...[[0,0,.36],[.12,.06,.28],[-.1,.09,.31]].map(([x,z,h],i)=>pt(new THREE.OctahedronGeometry(.075+(i?0:.02)),c,[x,h,z],[0,i,0],[1,.6,1]))])));
 T('mush',mg([[0,0,.16,.085,0xd9483c],[.11,.05,.11,.06,0xd9483c],[-.07,.1,.09,.05,0xe8dcc0]].flatMap(([x,z,h,r,c])=>[pt(new THREE.CylinderGeometry(.022,.03,h,4,1,true),0xefe6d2,[x,h/2,z]),pt(cone(r,r*.9,5),c,[x,h+r*.3,z])])));
 T('log',mg([pt(cyl(.15,.17,1.3,7),WD,[0,.15,0],[Math.PI/2,0,0]),pt(cyl(.12,.12,.02,7),0xcaa878,[0,.15,.66],[Math.PI/2,0,0]),pt(cyl(.1,.1,.02,7),0xcaa878,[0,.15,-.66],[Math.PI/2,0,0]),pt(cyl(.04,.05,.26,5),WD2,[.14,.24,.2],[0,0,-1]),pt(ico(.2),MOSS,[0,.27,-.2],0,[.7,.3,1.4]),pt(ico(.13),0x6fae4e,[.03,.28,.34],0,[.8,.3,1]),pt(cone(.06,.06,5),0xd9483c,[-.16,.2,.4]),pt(cyl(.016,.02,.12,4),0xefe6d2,[-.16,.12,.4])]));
 T('stump',mg([pt(cyl(.2,.26,.3,7),WD,[0,.15,0]),pt(cyl(.17,.17,.02,7),0xcaa878,[0,.31,0]),pt(cyl(.07,.07,.022,6),0xb89668,[0,.315,0]),...ringN(4,(i,a)=>pt(cone(.09,.22,4),WD2,[Math.cos(a+.3)*.24,.05,Math.sin(a+.3)*.24],[Math.sin(a+.3)*1.0,0,-Math.cos(a+.3)*1.0])),pt(ico(.1),MOSS,[.12,.3,.08],0,[1,.4,1])]));
 T('rockS',mg([pt(new THREE.DodecahedronGeometry(.3),RK,[0,.14,0],[.4,.2,0],[1.1,.7,1]),pt(new THREE.DodecahedronGeometry(.19),RK2,[.34,.08,.12],[1,.6,0],[1,.7,1]),pt(new THREE.DodecahedronGeometry(.13),0xa8a8a0,[-.2,.06,.28],[.2,1,.5],[1,.7,1]),pt(ico(.14),MOSS,[-.03,.3,-.02],0,[1.2,.3,1])]));
 T('shrub',mg([pt(ico(.36,0),0x4a9a3c,[0,.24,0],[.3,.5,0],[1,.72,1]),pt(ico(.27,0),0x5fae48,[.3,.18,.1],[1,.2,.4],[1,.72,1]),pt(ico(.22,0),0x74bd54,[-.2,.3,-.08],[.5,1.4,.2],[1,.75,1])]));
 T('shell',mg([pt(cone(.075,.11,6),0xf2c7b8,[0,.035,0],[1.35,0,0]),pt(cone(.045,.07,5),0xfaf4ea,[.14,.025,.06],[1.3,1,0])]));
 T('star',mg([...ringN(5,(i,a)=>pt(new THREE.ConeGeometry(.045,.17,3,1,true),0xe8703a,[Math.cos(a)*.085,.02,Math.sin(a)*.085],[Math.PI/2,0,a-Math.PI/2],[1,1,.45])),pt(ico(.05),0xf08a4a,[0,.025,0],0,[1,.5,1])]));
 T('drift',mg([pt(cyl(.06,.085,1.15,5),0xb8ab98,[0,.07,0],[Math.PI/2,.2,0]),pt(cyl(.03,.045,.42,4),0xa89b88,[.16,.12,.14],[1.2,0,-.8]),pt(cyl(.025,.035,.3,4),0xc4b8a6,[-.12,.1,-.28],[1.3,0,.9])]));
 {const pad=c=>{const g=new THREE.CircleGeometry(.3,8,.35,5.6);g.rotateX(-Math.PI/2);return pt(g,c)};T('lily',mg([pad(0x4f9a4a),pt(new THREE.CircleGeometry(.17,7).rotateX(-Math.PI/2),0x5fae56,[.36,.002,.22])]));
  T('lilyF',mg([pad(0x57a552),...ringN(5,(i,a)=>pt(new THREE.ConeGeometry(.05,.13,3,1,true),0xf6b6d0,[Math.cos(a)*.045,.06,Math.sin(a)*.045],[Math.sin(a)*.7,0,-Math.cos(a)*.7])),pt(new THREE.OctahedronGeometry(.03),0xf2d24a,[0,.07,0])]))}
 T('peb',mg([pt(ico(.2),RK,[0,.06,0],[.4,.2,0],[1,.55,1.2]),pt(new THREE.OctahedronGeometry(.1),0xaaa9a0,[.24,.03,.1],[1,.4,0],[1,.6,1])]));
 ['rock_single_A','rock_single_B','rock_single_C','rock_single_D'].forEach((k,i)=>T('rk'+i,pt(GEO[k],null,[0,0,0],0,[3.4,3.4,3.4])));
 T('wplant',pt(GEO.waterplant_A,null,[0,0,0],0,[4.2,4.2,4.2]));
 /* supply-spot kit */
 const OL=0x5d6b3a,OL2=0x47532c,OL3=0x74834a,CR=0xe9e5d6,RP=0xc9b68a,IR=0x3a3f46;
 {const body=o=>[pt(box(.95,.62,.95),OL,[0,.33,0]),...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>pt(box(.1,.66,.1),OL2,[a*.45,.33,b*.45])),pt(box(1.0,.07,1.0),OL2,[0,.05,0]),pt(box(1.0,.06,1.0),OL2,[0,.6,0]),pt(box(.4,.2,.02),CR,[0,.34,.485]),pt(box(.06,.06,.02),0xc9443a,[-.12,.34,.5]),pt(box(.18,.03,.02),OL2,[.06,.37,.5]),pt(box(.18,.03,.02),OL2,[.06,.31,.5]),
   pt(new THREE.TorusGeometry(.1,.022,5,8,Math.PI),RP,[.49,.36,0],[0,Math.PI/2,Math.PI]),pt(new THREE.TorusGeometry(.1,.022,5,8,Math.PI),RP,[-.49,.36,0],[0,Math.PI/2,Math.PI]),pt(box(.1,.14,.03),BRASS,[-.26,.58,.49]),pt(box(.1,.14,.03),BRASS,[.26,.58,.49])];
  const lid=[pt(box(1.02,.09,1.02),OL3,[0,0,0]),pt(box(.72,.012,.09),CR,[0,.05,.16]),pt(box(.72,.012,.09),CR,[0,.05,-.16]),pt(box(1.04,.03,.12),OL2,[0,.0,.36]),pt(box(1.04,.03,.12),OL2,[0,.0,-.36])];
  const move=(L,p,r)=>L.map(g=>{_m.compose(_v.set(p[0],p[1],p[2]),_q.setFromEuler(_e.set(r[0],r[1],r[2])),_s.set(1,1,1));return g.clone().applyMatrix4(_m)});
  GEO.supcrate=mg([...body(),...move(lid,[0,.675,0],[0,0,0])]);
  GEO.supcrate_open=mg([...body(),pt(box(.84,.02,.84),0x2a2f1c,[0,.6,0]),pt(ico(.3),0xd9c48a,[.05,.56,0],0,[1.2,.3,1.1]),...move(lid,[0,1.02,-.6],[-1.15,0,0])])}
 {const p=[];for(let i=0;i<12;i++){const a0=i*.5236,a1=a0+.5236,am=a0+.2618,r0=1.5+((i*5)%4)*.12,r1=1.5+(((i+1)*5)%4)*.12,g=new THREE.BufferGeometry(),y=.1+((i*3)%3)*.05;
   g.setAttribute('position',new THREE.Float32BufferAttribute([0,.34,0,Math.cos(a1)*r1,.03,Math.sin(a1)*r1*.82,Math.cos(am)*(r0+r1)*.52,y+.12,Math.sin(am)*(r0+r1)*.43, 0,.34,0,Math.cos(am)*(r0+r1)*.52,y+.12,Math.sin(am)*(r0+r1)*.43,Math.cos(a0)*r0,.03,Math.sin(a0)*r0*.82],3));p.push(pt(g,i%2?0xf2ead8:0xe8622c))}
  for(let i=0;i<6;i++){const a=-1.0+i*.4;p.push(segG([Math.cos(a)*1.5,.05,Math.sin(a)*1.2],[2.35,.62,0],.012,0xd9cfae))}p.push(pt(ico(.3),0xf2ead8,[0,.2,0],0,[1.3,.7,1.2]));GEO.chute=mg(p)}
 GEO.suptent=mg([...[[-1.6,1.05,2.2],[1.6,1.05,2.2],[-1.6,-1.05,1.55],[1.6,-1.05,1.55]].map(([x,z,h])=>pt(cyl(.045,.055,h,6),WD2,[x,h/2,z])),pt(box(3.5,.05,2.4),0x6f7a48,[0,1.9,0],[.3,0,0]),pt(box(3.5,.052,.3),0x7f8b55,[0,2.03,.75],[.3,0,0]),pt(box(3.5,.052,.3),0x7f8b55,[0,1.78,-.55],[.3,0,0]),pt(box(3.5,.22,.04),0x5d683c,[0,2.14,1.15]),
  ...[[-1.6,1.05,2.2,-2.5,1.9],[1.6,1.05,2.2,2.5,1.9],[-1.6,-1.05,1.55,-2.4,-1.9],[1.6,-1.05,1.55,2.4,-1.9]].flatMap(([x,z,h,ex,ez])=>[segG([x,h,z],[ex,.02,ez],.012,RP),pt(cone(.04,.16,4),WD2,[ex,.06,ez])])]);
 GEO.radio=mg([pt(GEO.table_medium,null,[0,0,0],0,[.62,.72,.42]),pt(box(.46,.3,.22),0x4b552f,[-.22,.87,0]),pt(cyl(.045,.045,.02,8),BRASS,[-.32,.9,.115],[Math.PI/2,0,0]),pt(cyl(.03,.03,.02,8),IR,[-.14,.92,.115],[Math.PI/2,0,0]),pt(box(.2,.05,.02),0x1c1c1c,[-.22,.8,.115]),pt(cyl(.008,.008,1.1,4),IR,[-.4,1.5,-.06]),
  pt(box(.42,.012,.3),0xe8dcc0,[.28,.73,.02],[0,.3,0]),pt(box(.1,.004,.02),0xc9443a,[.3,.74,.04],[0,.9,0]),pt(cyl(.05,.06,.14,6),0xffe9a0,[.5,.8,-.1]),pt(cone(.07,.05,6),IR,[.5,.9,-.1])]);
 {const can=(c,x,z,r)=>[pt(box(.3,.4,.17),c,[x,.2,z],[0,r,0]),pt(box(.3,.03,.17),OL2,[x,.41,z],[0,r,0]),pt(cyl(.03,.03,.08,5),IR,[x+Math.cos(r)*.09,.45,z-Math.sin(r)*.09]),pt(box(.16,.03,.03),IR,[x-Math.cos(r)*.04,.47,z+Math.sin(r)*.04],[0,r,0]),pt(box(.2,.2,.012),0xf2ead8,[x+Math.sin(r)*.09,.22,z+Math.cos(r)*.09],[0,r,0])];
  GEO.jerry=mg([...can(0xc9443a,0,0,.1),...can(OL,.36,.06,-.2),...can(OL,.14,-.34,1.2)])}
 {const ab=(x,y,z,r)=>[pt(box(.46,.2,.24),0x4b552f,[x,y,z],[0,r,0]),pt(box(.47,.03,.25),0xd9a441,[x,y+.03,z],[0,r,0]),pt(box(.1,.04,.26),IR,[x,y+.1,z],[0,r,0])];GEO.ammostack=mg([...ab(0,.1,0,0),...ab(.5,.1,.04,.1),...ab(.25,.3,.02,.05),...ab(-.1,.1,.36,1.4),pt(box(.34,.26,.34),0xf2efe6,[.75,.13,.42],[0,.4,0]),pt(box(.2,.06,.02),0xc9443a,[.82,.14,.585],[0,.4,0]),pt(box(.06,.2,.02),0xc9443a,[.82,.14,.586],[0,.4,0])])}
 GEO.tarppile=mg([pt(box(1.2,.5,.9),0x8d5f3b,[0,.25,0]),pt(box(.6,.4,.6),0x8d5f3b,[.1,.7,.05],[0,.4,0]),pt(ico(.8,1),0x66713f,[0,.42,0],0,[1.05,.86,.85]),pt(ico(.5,1),0x717c48,[.1,.74,.05],0,[.95,.7,.9]),...[[-.85,.6],[.85,.6],[-.85,-.6],[.85,-.6]].flatMap(([x,z])=>[segG([x*.7,.4,z*.7],[x*1.15,.02,z*1.2],.012,RP),pt(cone(.035,.12,4),WD2,[x*1.15,.05,z*1.2])])]);
 GEO.suplamp=mg([pt(cyl(.05,.07,2.5,6),WD2,[0,1.25,0]),pt(box(.07,.07,.6),WD2,[0,2.42,.24]),pt(box(.05,.3,.05),WD2,[0,2.26,.1],[.7,0,0]),pt(cyl(.012,.012,.16,4),IR,[0,2.32,.48]),pt(box(.2,.26,.2),0xffe9a0,[0,2.12,.48]),pt(cone(.19,.12,4),IR,[0,2.31,.48],[0,Math.PI/4,0]),pt(box(.24,.03,.24),IR,[0,1.98,.48]),pt(cyl(.1,.14,.1,6),0x4b3520,[0,.05,0])]);
 GEO.supsign=mg([pt(cyl(.055,.07,1.9,5),WD2,[0,.95,0]),pt(box(1.15,.7,.07),0xb98556,[0,1.7,.03]),pt(box(1.2,.06,.1),WD2,[0,2.06,.03]),pt(box(.4,.3,.02),OL,[0,1.7,.075]),pt(box(.44,.05,.022),OL2,[0,1.86,.076]),pt(box(.26,.04,.024),CR,[0,1.72,.08]),pt(box(.26,.04,.024),CR,[0,1.64,.08])]);
 GEO.ropefence=mg([...[-1.3,0,1.3].map(x=>pt(cyl(.05,.065,.95,5),WD2,[x,.45,0])),...[-1.3,0].flatMap(x=>[segG([x,.82,0],[x+.65,.68,0],.016,RP),segG([x+.65,.68,0],[x+1.3,.82,0],.016,RP),segG([x,.5,0],[x+.65,.4,0],.016,RP),segG([x+.65,.4,0],[x+1.3,.5,0],.016,RP)])]);
 GEO.flarecan=mg([pt(cyl(.07,.07,.26,7),0xe8622c,[0,.04,0],[1.45,0,.4]),pt(cyl(.075,.075,.05,7),IR,[.045,.05,.11],[1.45,0,.4])]);
 GEO.sbagArc=mg([-.8,0,.8].flatMap((a,i)=>{const x=Math.sin(a)*1.9,z=1.9-Math.cos(a)*1.9;return[pt(GEO.sandbag,null,[x,0,z],[0,-a,0],[.62,.9,.9])]}));
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(9),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(9),3));GEO.nil=g}
 Object.assign(DECO,{supply:{g:'supcrate',s:1,bx:.5,bz:.5,loot:1,og:'supcrate_open'},suplamp:{g:'suplamp',s:1,bx:.1,bz:.1,pass:1,lamp:2.12},blk:{g:'nil',s:1,bx:1.4,bz:.42},blkF:{g:'nil',s:1,bx:1.5,bz:.14}});
 /* bridge, village bits */
 GEO.planter=mg([pt(box(1.5,.36,.56),0x8d5f3b,[0,.18,0]),pt(box(1.56,.06,.62),WD2,[0,.36,0]),pt(box(1.36,.04,.42),0x4b3a26,[0,.37,0]),...[-.5,-.17,.17,.5].flatMap((x,i)=>[pt(cyl(.012,.014,.26,4),0x4f8a40,[x,.5,(i%2-.5)*.14]),pt(new THREE.OctahedronGeometry(.085),[0xe2473c,0xf2d24a,0xe58fb2,0xf6f2e8][i],[x,.65,(i%2-.5)*.14],0,[1,.65,1]),pt(ico(.1),0x5a9a44,[x+.08,.42,0],0,[1,.6,1])])]);
 GEO.haybale=mg([pt(cyl(.5,.5,.9,10),0xd9bd5a,[0,.5,0],[0,0,Math.PI/2]),pt(cyl(.51,.51,.06,10),0xb89a44,[.2,.5,0],[0,0,Math.PI/2]),pt(cyl(.51,.51,.06,10),0xb89a44,[-.2,.5,0],[0,0,Math.PI/2]),pt(cyl(.2,.2,.02,8),0xc9aa4c,[.455,.5,0],[0,0,Math.PI/2])])}
function bridgeGeo(L){const p=[],n=Math.max(3,Math.round(L/.5));for(let i=0;i<n;i++)p.push(pt(box(2.5+(hash(i,5,3)-.5)*.12,.1,L/n-.05),i%3?0xb98556:i%2?0x9a6a42:0xa67848,[0,.76,-L/2+(i+.5)*L/n],[0,(hash(i,6,3)-.5)*.03,0]));
 for(const sx of[-1,1]){p.push(pt(box(.2,.2,L),0x6f4a2c,[sx*1.0,.62,0]),pt(box(.1,.1,L+.2),0x7a5232,[sx*1.26,1.62,0]),pt(box(.07,.07,L+.2),0x7a5232,[sx*1.26,1.2,0]));const m=Math.max(2,Math.round(L/2.4)+1);
  for(let i=0;i<m;i++){const z=-L/2+.1+i*(L-.2)/(m-1);p.push(pt(box(.14,1.1,.14),0x6f4a2c,[sx*1.26,1.18,z]),pt(box(.2,.06,.2),0x4b3520,[sx*1.26,1.75,z]),pt(cyl(.13,.15,2.6,6),0x7a5232,[sx*1.05,-.6,z]))}}return mg(p)}
/* ---- ground dressing: what grows where ---- */
function dressItems(r,ri){const out=[],x0=r.cx-REG/2,z0=r.cz-REG/2,SL=structs.filter(q=>Math.abs(q.x-r.cx)<REG/2+6&&Math.abs(q.z-r.cz)<REG/2+6);   /* no grass or pebbles inside buildings */
 for(let i=0;i<430;i++){const x=x0+hash(i,ri,61)*REG,z=z0+hash(i,ri,62)*REG,h=hAt(x,z);if(h<-1.4||h>9.5)continue;const k=hash(i,ri,63),k2=hash(i,ri,64),k3=hash(i,ri,65);let t=null,y=h-.03,s=.75+k3*.6;if(onDock(x,z))continue;
  if(h<1.02){const I=islAt(x,z);let rd=99,rw=0;if(I&&I.ty===0){rd=riverD(x,z);rw=_rp?_rp.w:0}
   if(h<-.12){if(rd<rw+.5&&h>-1.3&&k<.26){t=k2<.3?'lilyF':'lily';y=.03;s=.8+k3*.7}else if(h>-.45&&rd<rw+2.5&&k<.2){t=k2<.6?'reed':'wplant'}else continue}
   else if(rd<rw+7){t=k<.3?'reed':k<.46?'peb':k<.6?'tuft':k<.68?'rk'+((k2*4)|0):k<.72?'wplant':null}
   else if(h>.3){t=k<.1?'peb':k<.19?'bgrass':k<.24?'shell':k<.265?'star':k<.3?'drift':k<.33?'rk'+((k2*2)|0):null;if(t==='shell'||t==='star')s*=1.5}
   if(!t)continue}
  else{if(lhD(x,z)<8)continue;const rdD=PATHS.length?pathD(x,z):99;if(rdD<1.7&&k3<.93)continue;   /* 54차: 길 위는 비우고(가끔 자갈), 길가는 풀 포기 */
   const sd2=supD(x,z);if(sd2<6.5||sd2<10.5&&k3<.6)continue;if(CLEARS.some(c=>dist(x,z,c[0],c[1])<c[2]))continue;if(PORTS.some(p=>{const d=dist(x,z,p.x-p.dx*p.R*.4,p.z-p.dz*p.R*.4);return p.town?d<34:d<12&&k3<.8}))continue;
   if(rdD<1.7){t='peb';s=.55+k3*.4}else if(rdD<3.4&&k<.62){t=k<.42?'tuft':'tuftL';s*=1.1}else{
   const f=noise(x*.035+100,z*.035+100,SEED+4),fl=noise(x*.06+7,z*.06+3,SEED+9),tp=tundraAt(x,z,h);
   if(h>7)t=k<.3?'rk'+((k2*4)|0):k<.5?'peb':k<.72?'tuft':k<.76?'rockS':null;
   else if(tp>.35&&k<.55)t=k<.38?'wheat':'tuftL';
   else if(f>.5)t=k<.2?'fern':k<.25?'mush':k<.275?'log':k<.29?'stump':k<.33?'shrub':k<.72?'tuft':k<.78?'flw'+((k2*6)|0):k<.83?'peb':k<.87?'rk'+((k2*4)|0):k<.89?'rockS':null;
   else{const fb=sm(.55,.75,fl);t=k<.12+fb*.32?'flw'+((k2*6)|0):k<.2+fb*.32?'tuftL':k<.74?'tuft':k<.79?'peb':k<.82?'shrub':k<.865?'rk'+((k2*4)|0):k<.875?'stump':k<.89?'rockS':null}
   if(!t)continue;if(t==='log'||t==='rockS'||t==='stump')s=.9+k3*.5}}
  if(SL.length&&SL.some(q=>inStruct(q,x,z,.3*s)))continue;
  out.push(t,x,y,z,k2*6.283,s,.88+hash(i,ri,67)*.22)}return out}
function dressBuild(r,ri){const it=dressItems(r,ri),n=it.length/7;if(!n){r.dn=1;return}let tot=0;for(let i=0;i<n;i++)tot+=DT[it[i*7]].cnt;const pos=new Float32Array(tot*3),col=new Float32Array(tot*3),nr=new Float32Array(tot*3);let o=0;
 for(let i=0;i<n;i++){const T=DT[it[i*7]],x=it[i*7+1]-r.cx,y=it[i*7+2],z=it[i*7+3]-r.cz,a=it[i*7+4],s=it[i*7+5],tv=it[i*7+6],cs=Math.cos(a),sn=Math.sin(a),p=T.p,c=T.c,nn=T.n;
  for(let v=0;v<T.cnt;v++){const j=v*3,q=o*3,px=p[j]*s,pz=p[j+2]*s;pos[q]=x+px*cs+pz*sn;pos[q+1]=y+p[j+1]*s;pos[q+2]=z-px*sn+pz*cs;col[q]=c[j]*tv;col[q+1]=c[j+1]*tv;col[q+2]=c[j+2]*tv;nr[q]=nn[j]*cs+nn[j+2]*sn;nr[q+1]=nn[j+1];nr[q+2]=-nn[j]*sn+nn[j+2]*cs;o++}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3));
 const m=new THREE.Mesh(g,MATT);m.position.set(r.cx,0,r.cz);m.castShadow=false;m.receiveShadow=true;m.frustumCulled=false;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);r.d=m}
/* a building placed or removed: rebuild the ground dressing of the regions it touches */
function dressDirty(x,z,pad=4){for(const r of regions){if(Math.abs(r.cx-x)>REG/2+pad||Math.abs(r.cz-z)>REG/2+pad)continue;if(r.d){scene.remove(r.d);r.d.geometry.dispose();r.d=null}r.dn=0}}
{const _as=addStruct,_rs=removeStruct;addStruct=function(s){const r=_as(s);if(regions.length&&mode==='play')dressDirty(r.x,r.z);return r};removeStruct=function(s){_rs(s);if(regions.length&&mode==='play')dressDirty(s.x,s.z)}}
/* called every frame from cullRegions: build at most one region batch per frame, drop far ones */
function dressCull(x,z){let built=0;for(let ri=0;ri<regions.length;ri++){const r=regions[ri],ax=Math.abs(r.cx-x),az=Math.abs(r.cz-z),near=opt.gfx&&ax<REG*.5+46&&az<REG*.5+52;
  if(near&&!r.d&&!r.dn&&!built){dressBuild(r,ri);built=1}if(r.d){let v=!!near;if(v){_sp.center.set(r.cx,1,r.cz);_sp.radius=REG*.71+2;v=_fr.intersectsSphere(_sp)}r.d.visible=v;if(ax>REG*.5+110||az>REG*.5+110){scene.remove(r.d);r.d.geometry.dispose();r.d=null}}}}
let _smk=null;function smokeTex(){if(_smk)return _smk;const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.55,'rgba(255,255,255,.9)');g.addColorStop(.8,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=g;k.fillRect(0,0,64,64);return _smk=new THREE.CanvasTexture(c)}
/* ---- supply spots ---- */
const SUPV=[
/* 6차 정리(기획자 요청: 붙어 있거나 다니기 불편한 것 없게): 상자끼리 1.2m 넘게(사람이 편하게 지나가게) 띄우고, 장식은 철조망(뒤 z-5.4, 왼쪽 x-3.9)과 상자에서 떨어뜨림. 모래주머니로 둘러싸 갇히는 곳 없음 */
 {cr:[[0,.4,.1,.37],[2.5,1.6,.4],[-2.4,1.8,-.3],[.2,3.4,.8]],de:[['pallet',0,.4,.1,4.6],['chute',-1.2,-2.6,-.444],['jerry',3.7,-.2,.4],['supsign',3.6,3.6,-.15],['tuftdeco',0,0,0]],lamp:[3.3,-1.6],smoke:[2.0,-2.2]},
 {cr:[[-1.6,1.6,.2],[1.5,1.6,-.25],[0,3.9,.5],[3.3,3.7,-.6]],de:[['suptent',0,-2.0,0],['radio',-.9,-2.0,.1],['ammostack',.6,-2.2,-.2],['jerry',3.3,-.6,-.5],['supsign',-3.5,3.2,.2],['ropefence',3.7,-3.2,1.57]],lamp:[3.6,.9],smoke:[-2.8,-2.9]},
 {cr:[[0,-.6,0],[-2.3,1.3,.3],[2.3,1.4,-.3],[0,3.2,.1]],de:[['sbagArc',0,-3.6,0],['ammostack',-2.4,-1.6,.5],['jerry',1.6,-1.7,-.3],['supsign',3.6,3.2,-.2],['flag_blue',.9,-3.75,0,5]],lamp:[-3.6,2.6],smoke:[3.3,-2.8]},
 {cr:[[-1.6,0,-.1,.37],[1.8,.4,.25,.37],[0,2.6,.5],[-3.1,2.9,-.4]],de:[['pallet',-1.6,0,-.1,4.6],['pallet',1.8,.4,.25,4.6],['tarppile',3.0,-2.0,.3],['chute',-1.0,-3.0,2.6],['supsign',3.5,2.6,-.2],['ropefence',2.9,-4.0,0]],lamp:[-3.4,1.1],smoke:[.2,-1.2]}];
function buildSupply(){SUPS.forEach(s=>{const i=s.i,V=SUPV[i%SUPV.length],n=2+i%3,y0=hAt(s.x,s.z),mir=i%2?-1:1;s.cr=[];
  for(let k=0;k<n;k++){const c=V.cr[k],o=addStruct({t:k===0&&i%4===2?'chest':'supply',x:s.x+c[0]*mir,z:s.z+c[1],r:c[2]*mir,yo:k===0&&i%4===2?0:c[3]||0});o.li='s'+i+'_'+k;s.cr.push(o)}
  for(const [type,lx,lz,rot,scale=1] of V.de){
    if(type==='tuftdeco')continue;
    const x=s.x+lx*mir,z=s.z+lz,r=rot*mir;
    const m=mesh(GEO[type],MATT);m.scale.setScalar(scale);
    m.position.set(x,hAt(x,z)-.03,z);m.rotation.y=r+(type==='chute'&&mir<0?Math.PI:0);
    m.userData.layoutName=type;scene.add(m);
    if(type==='sbagArc')m.userData.layoutBlock=addStruct({t:'blk',x:x+Math.sin(r)*.27,z:z+Math.cos(r)*.27,r});
  }
  const flare=mesh(GEO.flarecan,MATT);flare.userData.layoutName='신호탄';
  flare.position.set(s.x+V.smoke[0]*mir,y0-.03,s.z+V.smoke[1]);scene.add(flare);
  addStruct({t:'suplamp',x:s.x+V.lamp[0]*mir,z:s.z+V.lamp[1],r:.4*mir});
  const G=new THREE.Group();G.position.set(s.x+V.smoke[0]*mir,y0,s.z+V.smoke[1]);const sp=[];for(let q=0;q<9;q++){const g=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex(),color:q%3?0xf26a1e:0xffa24a,transparent:true,opacity:.5,depthWrite:false}));g.userData.p=q/9;G.add(g);sp.push(g)}scene.add(G);flare.attach(G);SMOKES.push({s,G,sp,t:0})})}
/* ---- bridges where a path crosses a river ---- */
function buildBridges(){let a=-1;const P=PATHS,end=i=>{if(a<0)return;const A=P[Math.max(0,a-2)],B=P[Math.min(P.length-1,i+1)];const L=dist(A.x,A.z,B.x,B.z)+1.2;a=-1;if(L>34||L<3)return;if(hAt(A.x,A.z)<.4||hAt(B.x,B.z)<.4)return;const cx=(A.x+B.x)/2,cz=(A.z+B.z)/2,r=Math.atan2(B.x-A.x,B.z-A.z);
   if(DOCKS.some(d=>dist(d.x,d.z,cx,cz)<6))return;const m=mesh(bridgeGeo(L),MATT);m.position.set(cx,.06,cz);m.rotation.y=r;m.userData.layoutName="다리";scene.add(m);addDock(cx,cz,r,1.2,L/2,.87)};
 for(let i=0;i<P.length;i++){const wet=hAt(P[i].x,P[i].z)<.3,jump=i>0&&dist(P[i].x,P[i].z,P[i-1].x,P[i-1].z)>5;if(jump)end(i-1);if(wet){if(a<0)a=i}else end(i-1)}end(P.length-1)}
/* ---- village and outpost touches ---- */
function villageDress(){/* the old village and outpost were removed; town dressing lives in ports.js */}
let smokeT=0;
function updDress(dt,px,pz){smokeT-=dt;const chk=smokeT<=0;if(chk)smokeT=1.5;for(const m of SMOKES){if(chk){m.on=dist(m.s.x,m.s.z,px,pz)<120&&m.s.cr.some(c=>!(S.looted[c.li]&&S.day-S.looted[c.li]<3));m.G.visible=m.on}if(!m.on)continue;
  for(const g of m.sp){const u=(g.userData.p+gt*.085)%1;g.position.set(Math.sin(u*5+g.userData.p*9)*.4*u+u*1.1,.2+u*4.4,Math.cos(u*4+g.userData.p*7)*.3*u);g.scale.setScalar(.55+u*1.9);g.material.opacity=.7*Math.pow(Math.sin(Math.min(1,u*1.05+.08)*Math.PI),.5)}}}
