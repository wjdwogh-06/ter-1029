/* ===== 81차(규칙, 기획자 11-25 20:13) =====
   ① 수상 텐트·채굴 텐트 없앰('채굴 텐트나 수상 텐트 걍 없애 버립시다'): 키트·업그레이드(채굴 기지·낚시집·석유 시추 기지)까지.
      예전 저장에 지어 둔 것은 dropRemoved가 치우고 재료를 돌려줘요(텐트 재료 + 업그레이드 재료 + 넣어 둔 재료). 안에 놓았던 것은 44차 hkMigrate가 가방으로.
   ② 상인이 있는 곳마다 항구처럼 자판기 묶음(랜덤 자판기 · 재활용 쓰레기통 · 일반 자판기, 생선 자판기는 빼고):
      낚시섬(까마귀섬 낚시 캠프) · 식물섬(pis81.js가 놓아요) · 수달섬(요리·사냥 상인이 같은 섬이라 한 묶음).
      랜덤 자판기 물건은 자리 번호(pi 8·9·10)로 정해요(항구 0~7과 따로). 겨울 광물 줄이기는 r79.js THIN79.wRock. */
const R81_GONE={wtent:'수상 텐트',minetent:'채굴 텐트',minebase:'채굴 기지',fhouse:'낚시집',oilbase:'석유 시추 기지'};
const R81_BASE={minebase:'minetent',fhouse:'wtent',oilbase:'wtent'};
{const G={kit_wtent:'수상 텐트',kit_minetent:'채굴 텐트'};for(const k in G)delete ITEMS[k];Object.assign(REMOVED.n,G);
 const add=(a,b)=>{for(const k in b||{})a[k]=(a[k]||0)+b[k];return a};
 for(const t in R81_GONE){const b=BUILDS[t];if(!b)continue;const c=add({},b.c);if(R81_BASE[t]&&BUILDS[R81_BASE[t]])add(c,BUILDS[R81_BASE[t]].c);for(const k in c)if(!ITEMS[k])delete c[k];
  REMOVED.n[t]=R81_GONE[t];REMOVED.c[t]=c}
 for(const t in R81_GONE){const b=BUILDS[t];if(!b)continue;b.hide=1;delete b.kit;delete b.upg;delete b.upgs}   /* 정의는 멀티·옛 저장 읽기용으로만(지뢰와 같음) */
 if(typeof RECIPES!=='undefined')for(let i=RECIPES.length-1;i>=0;i--){const r=RECIPES[i];if(!ITEMS[r.id]||Object.keys(r.c||{}).some(k=>!ITEMS[k]))RECIPES.splice(i,1)}}
/* 예전 저장: 업그레이드하려고 넣어 둔 재료(s.upc)도 돌려주고, 내 기지·서 있던 자리가 없앤 집 앞이면 항구마을로 */
{const _dr=dropRemoved;dropRemoved=function(){const gone=(S.built||[]).filter(b=>R81_GONE[b.t]);
  for(const b of gone)if(b.upc)for(const k in b.upc)if(ITEMS[k]&&b.upc[k]>0)give(k,b.upc[k]);
  const r=_dr.apply(this,arguments);
  if(gone.length){const near=(x,z)=>gone.some(b=>Math.hypot(b.x-x,b.z-z)<9);
   if(S.home&&near(S.home.x,S.home.z))S.home={x:VIL.x,z:VIL.z};if(S.px!=null&&near(S.px,S.pz)){S.px=VIL.x;S.pz=VIL.z}}
  return r}}

/* ---------- ② 자판기 묶음 ---------- */
const VS81={pi:{fish:8,plant:9,otter:10},at:{}};
/* 한 줄: 랜덤 자판기(x) · 재활용 쓰레기통 · 일반 자판기, 앞(+z)을 zf에 맞춰요 */
function vs81Row(x,zf){const rc=x+VEND_GAP,pv=rc+DECO.recycle.bx+.3+DECO.pvend.bx;return[['vend',x,zf-DECO.vend.bz],['recycle',rc,zf-DECO.recycle.bz],['pvend',pv,zf-DECO.pvend.bz]]}
/* 막힘: 물·구조물, 그리고 나중에 치워지지 않을(CLEARS 밖) 나무·바위 */
function vs81Blk(x,z,r){if(hAt(x,z)<.12)return true;const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const o=objs.get((cz+j)*CN+cx+i);if(!o||o.re>0)continue;const rr=OBJT[o.t].r;if(rr&&(x-o.x)**2+(z-o.z)**2<(rr+r)**2&&!CLEARS.some(c=>dist(o.x,o.z,c[0],c[1])<c[2]))return true}
 for(const s of structs){if(Math.abs(s.x-x)>6||Math.abs(s.z-z)>6)continue;if(inStruct(s,x,z,r))return true}return false}
function vs81Fits(x,zf,ok){const R=vs81Row(x,zf),x0=x-DECO.vend.bx-.45,x1=R[2][1]+DECO.pvend.bx+.45,z0=zf-2.6,z1=zf+1.9;   /* 뒤로도 1.4m 넘게 비어야(뒤에 갇힌 칸이 안 생기게) */let lo=9,hi=-9;
 for(let zz=z0;zz<=z1+1e-6;zz+=.35)for(let xx=x0;xx<=x1+1e-6;xx+=.35){const h=hAt(xx,zz);if(h<.95||onDock(xx,zz)||(ok&&!ok(xx,zz)))return false;lo=Math.min(lo,h);hi=Math.max(hi,h);if(vs81Blk(xx,zz,.2))return false}
 return hi-lo<.22}
function vs81Put(key,x,zf){const pi=VS81.pi[key],out=[];for(const [t,xx,zz] of vs81Row(x,zf))out.push(addStruct({t,x:xx,z:zz,r:0,pi,hp:1e9}));VS81.at[key]={x,zf,pi};return out}
/* 기준점(상인·마당) 둘레를 가까운 곳부터 찾아요 */
function vs81Find(key,ax,az,rMin,rMax,ok){const C=[];for(let r=rMin;r<=rMax;r+=.5)for(let a=0;a<24;a++){const th=a/24*Math.PI*2;C.push([ax+Math.cos(th)*r-1.8,az+Math.sin(th)*r,r])}
 for(const [x,zf] of C)if(vs81Fits(x,zf,ok))return vs81Put(key,x,zf);console.warn('81차 자판기 자리를 못 찾음',key);return null}
function vs81Place(){
 /* 낚시섬: 캠프 마당(모닥불) 둘레, 울타리 안 */
 try{if(typeof FNPC!=='undefined'&&FNPC){let A=[FNPC.x,FNPC.z],bd=30;for(const s of structs)if(s.t==='fire'){const d=Math.hypot(s.x-FNPC.x,s.z-FNPC.z);if(d<bd){bd=d;A=[s.x,s.z]}}
   const F=FISHISLE,cx=F.x+F.cx,cz=F.z+F.cz;vs81Find('fish',A[0],A[1],3.5,16,(x,z)=>Math.abs(x-cx)<F.rx-2&&Math.abs(z-cz)<F.rz-2)}}catch(e){console.error('81차 낚시섬 자판기',e)}
 /* 수달섬: 섬 가운데 둘레(두 상인 사이) */
 try{if(typeof OTR!=='undefined')vs81Find('otter',OTR.x,OTR.z,2,16,(x,z)=>Math.hypot(x-OTR.x,z-OTR.z)<30)}catch(e){console.error('81차 수달섬 자판기',e)}}
{const _bp=buildPorts;buildPorts=function(){_bp.apply(this,arguments);vs81Place()}}
