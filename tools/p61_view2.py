import os,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    A=['shoes_boot','shoes_mil','shoes_light','shoes_rainbow']
    print('defs',await ev("""(A)=>JSON.stringify({noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),tris:Object.fromEntries(A.map(k=>[k,GEO[ITEMS[k].ic]?Math.round(GEO[ITEMS[k].ic].attributes.position.count/3):-1]))})""",A))
    url=await ev("""async(A)=>{const N=160,C=4,c=document.createElement('canvas');c.width=C*(N+30);c.height=N+34;const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=i*(N+30)+15,y=4;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 14px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+22)}
      return c.toDataURL()}""",A)
    open(O('p61_shoe_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    url=await ev("""()=>{const G=['boot','mil','light','rainbow'];const W=1400,H=700;const rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rr.setSize(W,H);rr.setClearColor(0xeee6d6);rr.outputEncoding=THREE.sRGBEncoding;
      const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff2e0,0x7d6c5c,1.0));const dl=new THREE.DirectionalLight(0xfff4e4,.9);dl.position.set(3,5,4);sc.add(dl);
      const cam=new THREE.OrthographicCamera(-1.4,1.4,.7,-.7,.1,50);cam.position.set(0,.2,9);cam.lookAt(0,.2,0);
      G.forEach((g,i)=>{for(const [j,ry] of [[0,Math.PI/2],[1,-.6]]){const m=new THREE.Mesh(GEO['lk_shoes_'+g+'_1'],MATT);m.rotation.y=ry;m.scale.setScalar(1.5);m.position.set(-1.05+i*.7,j?-.55:.12,0);sc.add(m)}});
      rr.render(sc,cam);return rr.domElement.toDataURL()}""")
    open(O('p61_shoes3d.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
