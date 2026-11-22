# 62차 그림만: 가구·액자·아이템·식물 아이콘 한 장 + 가구 3D + 식물 3D
import os,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    A=["kit_deco_bush","kit_rug_rect","kit_rug_round","kit_rug_oval","kit_stool_wood","kit_table_wround","kit_table_wsq","kit_chair_garden","kit_snowman","kit_xmas_tree","kit_crate_sq","kit_crate_rect","kit_crate_stair",
       "kit_frame_map","kit_frame_dog","kit_frame_plat","kit_frame_lh","kit_frame_whale","kit_frame_camp","kit_frame_boat","kit_frame_shark","rbox","sugar","bag_travel",
       "tomato","onion","corn","cacao","chili","seed_tomato","seed_onion","seed_corn","seed_cacao","seed_chili"]
    print('defs',await ev("""(A)=>JSON.stringify({noItem:A.filter(k=>!ITEMS[k]),noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),tris:Object.fromEntries(A.map(k=>[k,GEO[ITEMS[k]&&ITEMS[k].ic]?Math.round(GEO[ITEMS[k].ic].attributes.position.count/3):-1]))})""",A))
    url=await ev("""async(A)=>{const N=120,C=8,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+26);c.height=rows*(N+30);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+26)+13,y=((i/C)|0)*(N+30)+2;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 12px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+16)}
      return c.toDataURL()}""",A)
    open(O('p62_icons.png'),'wb').write(base64.b64decode(url.split(',')[1]))
    for nm,G,W,H,cam in [('p62_furn3d.png',['dc_deco_bush','dc_stool_wood','dc_table_wround','dc_table_wsq','dc_chair_garden','dc_snowman','dc_xmas_tree','dc_crate_sq','dc_crate_rect','dc_crate_stair','dc_rug_rect','dc_rug_round','dc_rug_oval'],1600,1000,[0,9,13,5,2.6,0,30,0]),
                         ('p62_frames3d.png',['dc_frame_map','dc_frame_dog','dc_frame_plat','dc_frame_lh','dc_frame_whale','dc_frame_camp','dc_frame_boat','dc_frame_shark'],1600,700,[0,1.0,5.2,4,1.05,1.0,28,.72]),
                         ('p62_plants3d.png',['pw_tomato','pw_onion','pw_corn','pw_cacao','pw_chili','pc_tomato_0','pc_tomato_1','pc_corn_1','pc_cacao_1','pc_chili_2'],1600,800,[0,3.5,8.5,5,1.7,0,30,.3])]:
        url=await ev("""(a)=>{const [G,W,H,cp]=a;const rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rr.setSize(W,H);rr.setClearColor(0xe7dcc6);rr.outputEncoding=THREE.sRGBEncoding;
          const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff2e0,0x7d6c5c,1.0));const dl=new THREE.DirectionalLight(0xfff4e4,.9);dl.position.set(3,6,5);sc.add(dl);
          const n=G.length,cols=cp[3],rows=Math.ceil(n/cols),sp=cp[4];
          G.forEach((g,i)=>{const m=new THREE.Mesh(GEO[g],MATT);const c=i%cols,r=(i/cols)|0;m.position.set((c-(cols-1)/2)*sp,cp[5]?-r*cp[5]:0,cp[5]?0:(r-(rows-1)/2)*sp);sc.add(m)});
          const cam=new THREE.PerspectiveCamera(cp[6]||28,W/H,.1,300);cam.position.set(0,cp[1],cp[2]);cam.lookAt(0,cp[7]||0,0);rr.render(sc,cam);return rr.domElement.toDataURL()}""",[G,W,H,cam])
        open(O(nm),'wb').write(base64.b64decode(url.split(',')[1]))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
