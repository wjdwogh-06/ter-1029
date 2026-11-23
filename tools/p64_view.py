# 64차 그림만: 요리 30종 아이콘 한 장 + 3D 한 장
import os,base64,json
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    def save(n,u): open(O(n),'wb').write(base64.b64decode(u.split(',')[1]))
    print('defs',await ev("()=>JSON.stringify({n:DISHES.length,noGeo:DISHES.filter(d=>!GEO['ds_'+d[0]]).map(d=>d[0]),noIcon:DISHES.filter(d=>!/^data:image/.test(ICON[d[0]]||'')).map(d=>d[0]),vend:DISHES.filter(d=>vendPool().includes(d[0])).length,tris:Object.fromEntries(DISHES.map(d=>[d[0],GEO['ds_'+d[0]]?Math.round(GEO['ds_'+d[0]].attributes.position.count/3):-1]))})"))
    save('p64_icons.png',await ev("""async()=>{const A=DISHES.map(d=>d[0]),N=120,C=6,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+40);c.height=rows*(N+30);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+40)+20,y=((i/C)|0)*(N+30)+2;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 12px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+16)}
      return c.toDataURL()}"""))
    print('errs',await ev("()=>JSON.stringify((window.__errs||[]).slice(0,5))"))
