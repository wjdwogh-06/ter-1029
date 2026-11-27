'''86차 새 몹 그림만 보기: 몹마다 여러 각도·자세를 한 장으로 → tools/out/p86_mobs.png (KINDS=m86_toad,... 로 고르기)'''
import base64,os
async def steps(pg):
    kinds=os.environ.get('KINDS','m86_ptar,m86_caper,m86_peac,m86_toad,m86_guard,m86_minic,m86_crab,snowHunter')
    await pg.evaluate('(s)=>{window.P86S=s}',int(os.environ.get('SZ','300')))
    url=await pg.evaluate("""(kinds)=>{const K=kinds.split(','),N=4,S=window.P86S||300,cv=document.createElement('canvas');cv.width=S*N;cv.height=S*K.length;const g=cv.getContext('2d');g.fillStyle='#cfd8c4';g.fillRect(0,0,cv.width,cv.height);
     const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.outputEncoding=THREE.sRGBEncoding;r.setSize(S,S);const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x8892a0,1.0));const d=new THREE.DirectionalLight(0xfff4e0,1.25);d.position.set(3,6,4);sc.add(d);
     const gr=new THREE.Mesh(new THREE.CircleGeometry(8,32),new THREE.MeshLambertMaterial({color:0x9bb37a}));gr.rotation.x=-Math.PI/2;sc.add(gr);const cam=new THREE.PerspectiveCamera(24,1,.05,80),bx=new THREE.Box3(),v=new THREE.Vector3();
     K.forEach((k,row)=>{const T=ENEMY[k];const views=[{ry:.6,el:.42},{ry:-1.57,el:.15},{ry:3.14,el:.5},{ry:.3,el:.62,act:1}];
      views.forEach((V,col)=>{const a=T.actor();scene.remove(a.root);sc.add(a.root);a.root.rotation.y=V.ry;
       if(V.act){if(a instanceof M86Bird){a.spd=3.5;a.flap=.8;a.dispT=5;a.disp=1}else if(a instanceof M86Toad){a.chg=.8;a.tng=.9;a.hop=.5;a.tq.visible=a.tt.visible=true;a.tq.scale.z=2.5;a.tt.position.z=.6+2.5}else if(a instanceof M86Guard){a.atk='slam';a.at=.8}else if(a instanceof M86Crab){a.spd=2;a.atkT=.4;if(!a.mini){a.lift=1;a.rock.visible=true;a.setRage(1)}}}
       for(let i=0;i<8;i++)a.mixer.update(.05);if(V.act&&a instanceof M86Bird)a.disp=1,a.pose(0);
       a.root.updateMatrixWorld(true);bx.setFromObject(a.root);bx.getSize(v);const s=Math.max(v.x,v.y,v.z);bx.getCenter(v);const D=s/(2*Math.tan(12*Math.PI/180))*1.05;
       cam.position.set(v.x,v.y+D*Math.sin(V.el),v.z+D*Math.cos(V.el));cam.lookAt(v);gr.position.y=0;r.render(sc,cam);g.drawImage(r.domElement,col*S,row*S);g.fillStyle='#333';g.font='bold 16px sans-serif';if(!col)g.fillText(T.n+' '+(s).toFixed(2)+'m',8,20);sc.remove(a.root)})});
     r.dispose();return cv.toDataURL()}""",kinds)
    open('tools/out/p86_mobs.png','wb').write(base64.b64decode(url.split(',')[1]));print('saved')
