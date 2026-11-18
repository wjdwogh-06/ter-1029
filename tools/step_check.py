# 높낮이 검사(13차): 한 걸음에 STEP_UP보다 높이 못 올라감. 물에서 부두로 못 올라가고, 땅에서는 모든 부두·데크에 걸어서 올라갈 수 있어야 함
# 기대: unreach=[] (땅에서 못 가는 부두 없음), waterClimb=0 (물에서 부두로 올라간 곳 없음), fall.smooth=true·swim, beach.out=land, errs=[]
import os
async def steps(pg):
    ev=pg.evaluate;O=lambda n:os.path.join(OUT,n)
    await ev("()=>{WX.t=1e9;WX.on=false;WX.b=0;S.time=.42;enemies.slice().forEach(dropEnemy);DEV.god=true;window.updSpawns=()=>{}}")
    print('reach',await ev("""()=>{const E={x:0,z:0,pl:1},st=.35,out=[];let n=0;
      for(const d of DOCKS){if(d.y>5)continue;n++;const R=Math.hypot(d.hw,d.hl)+26,x0=d.x-R,z0=d.z-R,N=Math.ceil(2*R/st)+1,H=new Float32Array(N*N),G=new Uint8Array(N*N);
       for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*st,z=z0+j*st,k=j*N+i;H[k]=stepY(x,z);if(walk(x,z,.42,E)===null)G[k]=1}
       const q=[];for(let k=0;k<N*N;k++){if(!G[k])continue;const x=x0+(k%N)*st,z=z0+((k/N)|0)*st;if(!onDock(x,z)&&hAt(x,z)>.9&&spSurf(x,z)===null){G[k]=2;q.push(k)}}
       while(q.length){const k=q.pop(),i=k%N,j=(k/N)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const kk=b*N+a;if(G[kk]!==1||H[kk]-H[k]>STEP_UP)continue;G[kk]=2;q.push(kk)}}
       let ok=false;for(let k=0;k<N*N&&!ok;k++)if(G[k]===2){const x=x0+(k%N)*st,z=z0+((k/N)|0)*st;if(onDock(x,z)===d)ok=true}
       if(!ok)out.push([+d.x.toFixed(1),+d.z.toFixed(1),d.y,+d.hw.toFixed(1),+d.hl.toFixed(1)])}
      return JSON.stringify({docks:n,unreach:out})}"""))
    # 물에서 부두로 밀어 보기(모든 부두 가장자리 바깥 물)
    print('water',await ev("""()=>{let tried=0,climb=0;const bad=[];for(const d of DOCKS){if(d.y>5)continue;for(let t=0;t<12;t++){const side=t%4,u=(Math.floor(t/4)+.5)/3*2-1;let lx,lz;if(side<2){lx=(side?1:-1)*(d.hw+.7);lz=u*d.hl*.9}else{lz=(side===2?1:-1)*(d.hl+.7);lx=u*d.hw*.9}
       const x=d.x+lx*d.c+lz*d.s,z=d.z-lx*d.s+lz*d.c;if(hAt(x,z)>-.45||onDock(x,z)||walk(x,z,.42,P)!==null)continue;tried++;P.x=x;P.z=z;const ux=d.x-x,uz=d.z-z,l=Math.hypot(ux,uz);
       for(let k=0;k<40;k++)moveEnt(P,ux/l*.1,uz/l*.1);if(onDock(P.x,P.z)){climb++;if(bad.length<6)bad.push([+x.toFixed(1),+z.toFixed(1)])}}}return JSON.stringify({tried,waterClimb:climb,bad})}"""))
    # 부두에서 물로 걸어 나가기: 보이는 높이가 부드럽게 떨어지는지 (실제로 물에 떨어지는 부두 가장자리를 찾아서)
    found=await ev("""()=>{for(const d of DOCKS){if(d.y>5||d.y<.7)continue;for(const [sx,sz] of [[-1,0],[1,0],[0,1]]){for(const u of[-.5,0,.5]){const lx=sx?sx*(d.hw-.45):u*d.hw*.8,lz=sz?d.hl-.45:u*d.hl*.8,x=d.x+lx*d.c+lz*d.s,z=d.z-lx*d.s+lz*d.c,ux=(sx*d.c+sz*d.s),uz=(-sx*d.s+sz*d.c);
       if(walk(x,z,.42,P)!==null)continue;P.x=x;P.z=z;for(let k=0;k<30;k++)moveEnt(P,ux*.075,uz*.075);if(!onDock(P.x,P.z)&&hAt(P.x,P.z)<-.6){P.x=x;P.z=z;P.auto=null;window._dir=[ux,uz];updCamera(0,P.x,groundY(P.x,P.z),P.z,true);return JSON.stringify([+x.toFixed(1),+z.toFixed(1)])}}}}return false}""")
    ys=[]
    if found:
        await pg.wait_for_timeout(300)
        await ev("()=>{const [dx,dz]=window._dir,l=Math.hypot(dx,dz);clearInterval(window._mv);window._mv=setInterval(()=>moveEnt(P,dx/l*.075,dz/l*.075),16)}")
        for i in range(30):
            ys.append(await ev("()=>[+P.a.root.position.y.toFixed(3),WTR.st]"));await pg.wait_for_timeout(35)
            if i==7:await pg.screenshot(path=O('step_fall.jpg'),type='jpeg',quality=85)
        await ev("()=>clearInterval(window._mv)")
    jumps=[abs(ys[i+1][0]-ys[i][0]) for i in range(len(ys)-1)]
    print('fall',{'found':found,'start':ys[0] if ys else None,'end':ys[-1] if ys else None,'maxJump':round(max(jumps),3) if jumps else None,'moving':len([j for j in jumps if j>.02]),'ys':[y[0] for y in ys[:16]]})
    # 다시 부두로 헤엄쳐 가 보기(못 올라가야 함) → 사진
    await ev("()=>{const [dx,dz]=window._dir||[0,1],l=Math.hypot(dx,dz);window._mv=setInterval(()=>moveEnt(P,-dx/l*.075,-dz/l*.075),16)}");await pg.wait_for_timeout(2500)
    print('back to pier',await ev("()=>{clearInterval(window._mv);let best=null;for(const d of DOCKS){if(d.y>5)continue;const ex=P.x-d.x,ez=P.z-d.z,lx=ex*d.c-ez*d.s,lz=ex*d.s+ez*d.c,ox=Math.max(Math.abs(lx)-d.hw,0),oz=Math.max(Math.abs(lz)-d.hl,0),g=Math.hypot(ox,oz);if(!best||g<best.g)best={g:+g.toFixed(2),lx:+lx.toFixed(2),lz:+lz.toFixed(2),hw:d.hw,hl:d.hl,y:d.y}}return JSON.stringify({onDock:!!onDock(P.x,P.z),st:WTR.st,edge:best,rot:+P.rot.toFixed(2)})}"));await pg.screenshot(path=O('step_blocked.jpg'),type='jpeg',quality=85)
    # 모래 바닷가로는 걸어서 나올 수 있음(부두 없는 바닷가 여러 곳)
    print('beach',await ev("""()=>{const res={tried:0,out:0,fail:[]};for(let a=0;a<48&&res.tried<16;a++){const an=a/48*6.283;let lx=null;for(let m=20;m<420;m+=1){const x=VIL.x+Math.cos(an)*m,z=VIL.z+Math.sin(an)*m;if(x<5||z<5||x>995||z>995)break;const h=hAt(x,z);if(h>.9){lx=[x,z];continue}
       if(h<-.9&&lx){let dk=false;for(let k=-8;k<=8;k+=2)for(let j=-8;j<=8;j+=2)if(onDock(x+k,z+j))dk=true;if(dk||dist(x,z,lx[0],lx[1])>12||walk(x,z,.42,P)!==null)break;res.tried++;P.x=x;P.z=z;const dx=lx[0]-x,dz=lx[1]-z,l=Math.hypot(dx,dz);let why='';
        for(let k=0;k<400&&hAt(P.x,P.z)<=.9;k++){if(!moveEnt(P,dx/l*.075,dz/l*.075)){const nx=P.x+dx/l*.075,nz=P.z+dz/l*.075;why=walk(nx,nz,.42,P)!==null?'walk':'step';break}}
        if(hAt(P.x,P.z)>.9)res.out++;else if(res.fail.length<5)res.fail.push([+x.toFixed(0),+z.toFixed(0),why,+hAt(P.x,P.z).toFixed(2)]);break}}}return JSON.stringify(res)}"""))
