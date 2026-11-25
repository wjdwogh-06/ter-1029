# 82차 그림만: 보석 5·키트 3·장식 20 아이콘 한 장
import os,base64
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    def save(n,u): open(O(n),'wb').write(base64.b64decode(u.split(',')[1]))
    print('defs',await ev("()=>{const A=[...GEM82.ids,'kit_floor2','kit_wiring','kit_power',...D82.map(d=>'kit_'+d[0])];return JSON.stringify({noIcon:A.filter(k=>!/^data:image/.test(ICON[k]||'')),tris:Object.fromEntries(D82.map(d=>[d[0],GEO['d82_'+d[0]]?Math.round(GEO['d82_'+d[0]].attributes.position.count/3):-1]))})}"))
    save('p82_icons.png',await ev("""async()=>{const A=[...GEM82.ids,'kit_floor2','kit_wiring','kit_power','fuel',...D82.map(d=>'kit_'+d[0])],N=110,C=8,rows=Math.ceil(A.length/C),c=document.createElement('canvas');c.width=C*(N+30);c.height=rows*(N+28);const k=c.getContext('2d');k.fillStyle='#fbf4e6';k.fillRect(0,0,c.width,c.height);
      for(let i=0;i<A.length;i++){if(!ICON[A[i]])continue;const im=new Image();im.src=ICON[A[i]];await im.decode();const x=(i%C)*(N+30)+15,y=((i/C)|0)*(N+28)+2;k.drawImage(im,x,y,N,N);k.fillStyle='#5b3d2b';k.font='bold 12px sans-serif';k.textAlign='center';k.fillText(ITEMS[A[i]].n,x+N/2,y+N+15)}
      return c.toDataURL()}"""))
