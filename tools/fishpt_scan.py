# 기획자가 찍은 낚시 포인트 88곳: 물 깊이, 등대섬 위인지, 가장 가까운 설 수 있는 땅까지 거리
A=[[250,892],[80,909],[563,453],[928,527],[836,889],[479,903],[480,908],[239,892],[255,904],[85,922],[91,910],[841,899],[914,524],[937,538],[76,281],[84,288],[575,74],[554,77],[571,465],[557,465],[551,458],[553,446],[553,461],[574,460]]
B=[[677,672],[681,669],[685,666],[727,641],[729,622],[760,622],[790,597],[804,572],[804,567],[785,508],[765,496],[719,475],[695,477],[639,536],[621,558],[599,591],[580,590],[586,587],[513,581],[465,557],[457,574],[445,615],[457,522],[427,478],[418,455],[404,450],[402,447],[421,438],[442,375],[534,324],[537,322],[540,319],[545,242],[509,197],[505,195],[456,189],[451,191],[363,218],[345,231],[345,236],[313,227],[318,227],[244,293],[217,302],[160,376],[157,379],[115,457],[127,493],[182,582],[181,578],[207,656],[212,660],[219,664],[279,688],[273,690],[307,707],[359,753],[393,753],[431,775],[478,785],[516,766],[514,761],[597,728],[650,695]]
import json
async def steps(pg):
    r=await pg.evaluate("""(arg)=>{const [A,B]=arg;const stand=(x,z)=>waterDepth(x,z)<=SHALLOW&&walk(x,z,.42,P)===null;
     const one=(q,zone,i)=>{const [x,z]=q;let best=1e9,bx=0,bz=0;for(let dx=-25;dx<=25;dx+=.5)for(let dz=-25;dz<=25;dz+=.5){const d=Math.hypot(dx,dz);if(d>=best)continue;if(stand(x+dx,z+dz)){best=d;bx=x+dx;bz=z+dz}}
       let wbest=1e9;for(let dx=-25;dx<=25;dx+=.5)for(let dz=-25;dz<=25;dz+=.5){const d=Math.hypot(dx,dz);if(d>=wbest)continue;if(waterDepth(x+dx,z+dz)>.5){wbest=d}}
       return {zone,i:i+1,x,z,h:+hAt(x,z).toFixed(2),dock:onDock(x,z)?1:0,lh:+lhD(x,z).toFixed(1),land:+best.toFixed(1),water:+wbest.toFixed(1),port:PORTS.map(p=>[p.n,Math.round(dist(p.x,p.z,x,z))]).sort((a,b)=>a[1]-b[1])[0]}};
     return JSON.stringify([...A.map((q,i)=>one(q,'A',i)),...B.map((q,i)=>one(q,'B',i))])}""",[A,B])
    rows=json.loads(r)
    for o in rows: print(o['zone'],o['i'],(o['x'],o['z']),'h',o['h'],'dock',o['dock'],'lh',o['lh'],'land',o['land'],'water',o['water'],o['port'])
    json.dump(rows,open(os.path.join(OUT,'fishpt_scan.json'),'w'),ensure_ascii=False)
