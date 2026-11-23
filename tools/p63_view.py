# 63차 그림만: 액자 그림 8장 · 카페트 무늬 3장 · 3D(액자·카페트·눈사람) · 아이콘
import os,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    def save(n,u): open(O(n),'wb').write(base64.b64decode(u.split(',')[1]))
    t=await ev("""()=>{const t0=performance.now();for(const d of DCF){frTexOf(d[0]);frIcon(d[0])}for(const k in FRM.rugs)frTexOf(k);return Math.round(performance.now()-t0)}""")
    print('paint ms',t)
    save('p63_pics.png',await ev("""()=>{const L=DCF.map(d=>d[0]),c=document.createElement('canvas');c.width=4*600;c.height=2*540;const k=c.getContext('2d');k.fillStyle='#3a332c';k.fillRect(0,0,c.width,c.height);
      L.forEach((t,i)=>{const s=FRM.pic[t].src,x=(i%4)*600+12,y=((i/4)|0)*540+12,sc=Math.min(576/s.width,516/s.height);k.drawImage(s,x,y,s.width*sc,s.height*sc)});return c.toDataURL()}"""))
    save('p63_rugtex.png',await ev("""()=>{const L=Object.keys(FRM.rugs),c=document.createElement('canvas');c.width=3*720;c.height=620;const k=c.getContext('2d');k.fillStyle='#3a332c';k.fillRect(0,0,c.width,c.height);
      L.forEach((t,i)=>{const s=FRM.pic[t].src,sc=Math.min(700/s.width,600/s.height);k.drawImage(s,i*720+10,10,s.width*sc,s.height*sc)});return c.toDataURL()}"""))
    for nm,G,W,H,cam in [('p63_frames3d.png',[d for d in ['frame_map','frame_dog','frame_plat','frame_lh','frame_whale','frame_camp','frame_boat','frame_shark']],1800,800,[0,1.25,5.6,4,1.08,1.0,26,.72]),
                         ('p63_furn3d.png',['snowman','rug_rect','rug_round','rug_oval'],1800,900,[0,6.2,8.4,4,2.7,0,30,.3])]:
        save(nm,await ev("""(a)=>{const [G,W,H,cp]=a;const rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rr.setSize(W,H);rr.setClearColor(0xe7dcc6);rr.outputEncoding=THREE.sRGBEncoding;
          const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff2e0,0x7d6c5c,1.0));const dl=new THREE.DirectionalLight(0xfff4e4,.9);dl.position.set(3,6,5);sc.add(dl);
          const n=G.length,cols=cp[3],rows=Math.ceil(n/cols),sp=cp[4];
          G.forEach((t,i)=>{const g=new THREE.Group();g.add(new THREE.Mesh(GEO[BUILDS[t].g],MATT));if(FRM.rugs[t]||frIsF(t))g.add(frPlane(t));const c=i%cols,r=(i/cols)|0;g.position.set((c-(cols-1)/2)*sp,cp[5]?-r*cp[5]:0,cp[5]?0:(r-(rows-1)/2)*sp);sc.add(g)});
          const cam=new THREE.PerspectiveCamera(cp[6]||28,W/H,.1,300);cam.position.set(0,cp[1],cp[2]);cam.lookAt(0,cp[7]||0,0);rr.render(sc,cam);return rr.domElement.toDataURL()}""",[G,W,H,cam]))
    A=['kit_snowman','kit_rug_rect','kit_rug_round','kit_rug_oval']+['kit_'+d for d in ['frame_map','frame_dog','frame_plat','frame_lh','frame_whale','frame_camp','frame_boat','frame_shark']]
    save('p63_icons.png',await ev("""async(A)=>{const N=120,C=6,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+26);c.height=rows*(N+30);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+26)+13,y=((i/C)|0)*(N+30)+2;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 12px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+16)}
      return c.toDataURL()}""",A))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
