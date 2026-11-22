import os,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    print('errs0',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
    A=['pistol','rifle','ar','burst','smg','sniper','shotgun','gkit_pistol','gkit_rifle','gkit_ar','gkit_burst','gkit_smg','gkit_sniper','gkit_shotgun']
    print('defs',await ev("""(A)=>JSON.stringify({noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),noGeo:A.filter(k=>!GEO[ITEMS[k].ic]),tris:Object.fromEntries(A.map(k=>[k,GEO[ITEMS[k].ic]?Math.round(GEO[ITEMS[k].ic].attributes.position.count/3):-1]))})""",A))
    url=await ev("""async(A)=>{const N=128,C=7,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+30);c.height=rows*(N+34);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+30)+15,y=((i/C)|0)*(N+34)+4;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 13px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+20)}
      return c.toDataURL()}""",A)
    open(O('p61_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    # 3D side views of the guns
    url=await ev("""()=>{const G=['gn_pistol','gn_rifle','gn_ar','gn_burst','gn_smg','gn_sniper','gn_shotgun'];const W=1400,H=900;const rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rr.setSize(W,H);rr.setClearColor(0xeee6d6);
      const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x887766,.75));const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(3,5,4);sc.add(dl);
      const cam=new THREE.OrthographicCamera(-3.6,3.6,2.3,-2.3,.1,50);cam.position.set(9,3,5);cam.lookAt(0,0,0);
      G.forEach((g,i)=>{const m=new THREE.Mesh(GEO[g],MATT);const col=i%2,row=(i/2)|0;m.position.set(0,1.6-row*1.05,(col?1.6:-1.4));sc.add(m)});
      rr.render(sc,cam);return rr.domElement.toDataURL()}""")
    open(O('p61_guns3d.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
