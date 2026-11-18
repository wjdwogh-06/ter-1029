'use strict';
/* ===== 식물 (17차, 기획자: '식물 도감. 디자인은 안 해도 되고 감자면 감자라고 글자로, 어느 지역에 자라는지만') =====
   데이터는 core.js(PCAT, PLANTS, PLANT_SITES). 여기서는:
   - 기획자 좌표(PLANT_SITES) 둘레에 넓게 흩어 심기(plantsInit, 새 게임 시작 때 한 번, 지형·구조물·나무만 보고 정해서 누구에게나 같은 자리)
   - 땅 위에는 모양 없이 이름표(글자 알약)만 보여요(24m 안). 가까이 가면 [감자 캐기] 같은 버튼 → 가방에 + 식물 도감에 기록
   - 뽑은 자리는 re초 뒤 다시 자라요(S.pgone, 저장됨). 도감 기록은 S.pdex(모은 수)
   - 가방 아이콘도 글자(plTextIcon). 모양·색은 나중에 디자인 담당이 바꿔도 돼요(ITEMS[id].ic에 모델을 넣으면 그게 먼저)
   - 낚싯대를 들고 있으면 다른 상호작용처럼 못 따요(6차 규칙). 텐트 안에는 없어요. 멀티는 아직 각자 따로(서버 마무리 때).
   - 식물 위에는 건물을 못 놓아요('식물과 겹쳐요').
   - 모양(디자인 담당, 18차~): GEO['pw_'+id](자라 있는 모습), GEO['pw_'+id+'_e'](딴 뒤 잎만 남은 모습, 있으면)가 있으면 그 모양을 심어요(종류마다 InstancedMesh 하나).
     모양이 있는 식물은 땅 위 이름표를 안 띄워요(가까이 가면 [감자 캐기] 버튼·라벨은 그대로). 도감·가방 그림은 ITEMS[id].ic(GEO['pi_'+id])가 있으면 그것, 없으면 글자. */
const PL={list:[],where:{},R:24};
const PLD=Object.fromEntries(PLANTS.map(q=>[q.id,q]));
/* ---- 글자 아이콘: 분류 색 칸 + 이름 ---- */
function plTextIcon(q){const N=128,c=document.createElement('canvas');c.width=c.height=N;const k=c.getContext('2d'),C=PCAT[q.cat];
 const rr=(x,y,w,h,r)=>{k.beginPath();k.moveTo(x+r,y);k.arcTo(x+w,y,x+w,y+h,r);k.arcTo(x+w,y+h,x,y+h,r);k.arcTo(x,y+h,x,y,r);k.arcTo(x,y,x+w,y,r);k.closePath()};
 rr(8,8,N-16,N-16,26);k.fillStyle=C[2];k.fill();k.lineWidth=6;k.strokeStyle=C[1];k.stroke();
 const L=q.n.includes(' ')?q.n.split(' '):[q.n],m=Math.max(...L.map(s=>s.length)),fs=m<=2?46:m<=3?38:30;
 k.fillStyle='#5B3D2B';k.textAlign='center';k.textBaseline='middle';k.font=`900 ${fs}px ${UIF}`;
 L.forEach((s,i)=>k.fillText(s,N/2,N/2+(i-(L.length-1)/2)*fs*1.08+2));return c.toDataURL()}
function plIcons(){for(const q of PLANTS){const it=ITEMS[q.id];if(it&&(!it.ic||!GEO[it.ic]))ICON[q.id]=plTextIcon(q)}}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{try{if(PL.list.ready)plIcons()}catch(e){}});
/* ---- 심기: 좌표마다 반지름 r 안에 c포기, 서로 1.6m 넘게, 물·부두·구조물·나무·바위는 피해서 ---- */
function plOk(x,z){if(hAt(x,z)<.95||onDock(x,z))return false;for(const s of structs)if(!sdef(s).pass&&inStruct(s,x,z,.55))return false;
 const cx=(x/CELL)|0,cz=(z/CELL)|0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const o=objs.get((cz+j)*CN+cx+i);if(o&&dist(x,z,o.x,o.z)<(o.t<3?Math.max(OBJT[o.t].r+.7,2.3):OBJT[o.t].r+.7))return false}   /* 나무는 2.3m 넘게 띄워 잎 그늘에 안 가려지게 */
 for(const p of PL.list)if(dist(x,z,p.x,p.z)<1.6)return false;return true}
/* 자라는 곳 이름: 섬 이름 + 섬 가운데에서 본 방향(8방향, 위가 북쪽) + 같은 섬의 가까운 항구(110m 안) */
const PL_DIR=['동쪽','북동쪽','북쪽','북서쪽','서쪽','남서쪽','남쪽','남동쪽'];
function plPlace(x,z){const I=islAt(x,z);if(!I)return'바다 섬';const dx=x-I.x,dz=z-I.z,dir=Math.hypot(dx,dz)<40?'가운데':PL_DIR[Math.round(((Math.atan2(-dz,dx)*180/Math.PI+360)%360)/45)%8];
 let pn=null,pd=110;for(const p of PORTS){const d=dist(x,z,p.x,p.z),J=islAt(p.x,p.z);if(d<pd&&J===I){pd=d;pn=p.n}}return I.n+' '+dir+(pn?' · '+pn+' 근처':'')}
function plantsInit(){if(PL.list.ready)return;PL.list.ready=1;
 PLANT_SITES.forEach((st,si)=>{const ids=[].concat(st.p).filter(id=>PLD[id]),r=st.r||12,c=st.c||14;if(!ids.length)return;let put=0;
  /* 골고루(19차): 해바라기 씨 나선(황금각)으로 구역 전체에 c자리를 고르게 잡고, 나무·바위 등에 막히면 3.6m 안에서 가장 가까운 빈 곳으로 비켜요.
     그래도 못 놓으면 무작위 자리로 채워서 c포기를 맞춰요 */
  const rot=hash(si,1,73)*Math.PI*2;
  for(let k=0;k<c*4&&put<c;k++){const t=k<c?(k+.5)/c:hash(si,k,74),rad=r*.9*Math.sqrt(t),a=rot+k*2.39996323,bx=st.x+Math.cos(a)*rad,bz=st.z+Math.sin(a)*rad;let ok=null;
   for(let d=0;d<=3.61&&!ok;d+=.6)for(let j=0;j<(d?12:1)&&!ok;j++){const aa=j/12*Math.PI*2+k,x=bx+Math.cos(aa)*d,z=bz+Math.sin(aa)*d;if(dist(x,z,st.x,st.z)<=r&&plOk(x,z))ok=[x,z]}
   if(ok){PL.list.push({i:PL.list.length,id:ids[put%ids.length],x:ok[0],z:ok[1],si});put++}}
  const w=plPlace(st.x,st.z);for(const id of ids){const L=PL.where[id]=PL.where[id]||[];if(!L.includes(w))L.push(w)}});
 for(const p of PL.list){const cr=PLD[p.id].cr;if(cr&&typeof PLB==='function')addStruct({t:PLB(cr,cr),x:p.x,z:p.z,r:0,hp:1e9})}   /* 아보카도 나무·포도 말뚝은 부딪혀요(디자인 18차 크기) */
 try{plIcons()}catch(e){console.error('식물 아이콘 실패',e)}try{plMeshes()}catch(e){console.error('식물 모양 실패',e)}}
const plGone=p=>!!(S&&S.pgone&&S.pgone[p.i]>0);
/* 모양 심기: 종류마다 InstancedMesh 둘(자라 있음 / 딴 뒤). 가까운 것(PL.VD m 안)만 앞에서부터 채워 그려요(count) → 맵 전체 식물을 매번 그리지 않아요.
   0.25초마다, 또는 따거나 다시 자랄 때 바로 맞춰요. 저장·새 게임으로 상태가 바뀌어도 이 갱신이 알아서 맞춰요 */
const _plQ=new THREE.Quaternion(),_plS=new THREE.Vector3(),_plV=new THREE.Vector3(),_plY=new THREE.Vector3(0,1,0),_plW=new THREE.Color(1,1,1);PL.VD=60;PL.tU=0;
function plMeshes(){PL.im={};for(const q of PLANTS){const g=GEO['pw_'+q.id];if(!g)continue;const L=PL.list.filter(p=>p.id===q.id);if(!L.length)continue;const e=GEO['pw_'+q.id+'_e'];
  const mk=geo=>{const m=new THREE.InstancedMesh(geo,MAT,L.length);m.frustumCulled=false;m.castShadow=m.receiveShadow=true;for(let i=0;i<L.length;i++)m.setColorAt(i,_plW);m.instanceColor.needsUpdate=true;m.count=0;scene.add(m);return m};   /* r128: MAT 인스턴스는 instanceColor가 꼭 있어야 해요 */
  PL.im[q.id]={a:mk(g),e:e?mk(e):null,L};for(const p of L){_plQ.setFromAxisAngle(_plY,hash(p.i,3,77)*Math.PI*2);const k=.9+hash(p.i,4,77)*.2;_plS.set(k,k,k);_plV.set(p.x,hAt(p.x,p.z),p.z);p.M=new THREE.Matrix4().compose(_plV,_plQ,_plS)}}
 plUpdate()}
function plUpdate(){if(!PL.im)return;const cx=P.x,cz=P.z,D=PL.VD;for(const id in PL.im){const M=PL.im[id];let na=0,ne=0;
  for(const p of M.L){if(Math.abs(p.x-cx)>D||Math.abs(p.z-cz)>D)continue;if(!plGone(p))M.a.setMatrixAt(na++,p.M);else if(M.e)M.e.setMatrixAt(ne++,p.M)}
  M.a.count=na;M.a.instanceMatrix.needsUpdate=true;if(M.e){M.e.count=ne;M.e.instanceMatrix.needsUpdate=true}}}
function plNear(x,z,r){let b=null,bd=r;for(const p of PL.list){if(plGone(p))continue;const d=dist(x,z,p.x,p.z);if(d<bd){bd=d;b=p}}return b}
const plTarget=p=>({k:'pl',pl:p,x:p.x,z:p.z,lab:PLD[p.id].n+' '+PLD[p.id].v,rr:.7});
/* 가까운 대상 찾기에 식물을 끼워 넣어요(나무·상자 등과 거리로 겨뤄서 더 가까운 쪽) */
{const _fn=findNear;findNear=function(ox,oz,fx,fz,reach){const b=_fn(ox,oz,fx,fz,reach);if(INT.on||!PL.list.length)return b;
 const p=plNear(ox,oz,reach+.6);if(!p)return b;if(b&&b.k!=='move'&&dist(fx,fz,b.x,b.z)<=dist(fx,fz,p.x,p.z))return b;return plTarget(p)}}
function plantPick(t){const p=t.pl,q=PLD[p.id];if(!p||plGone(p)||P.cd>0)return;P.cd=.45;P.rot=Math.atan2(p.x-P.x,p.z-P.z);P.a.play('PickUp',{once:1,lock:.4,force:1,speed:1.6});
 const first=!(S.pdex&&S.pdex[q.id]);give(q.id,q.n1);S.pdex=S.pdex||{};S.pdex[q.id]=(S.pdex[q.id]||0)+q.n1;S.pgone=S.pgone||{};S.pgone[p.i]=q.re;PL.tU=0;
 const y=groundY(p.x,p.z);puff(p.x,y+.4,p.z,q.cat==='flower'?0xe9a3c4:q.cat==='mush'?0xc9a27a:0x8fc46a,4,.5);ftext(p.x,y+1.6,p.z,`+${q.n1} ${q.n}`,'#b8f0c0');sfx(620,.06,'sine',.04);
 if(first){toast(`🌱 새 식물: ${q.n}! 메뉴의 식물 도감에 올렸어요`);jingle([523,659,784])}P.auto=null;target=null;hudDirty=true}
{const _it=interact;interact=function(){if(target&&target.k==='pl'){plantPick(target);return}_it()}}
/* 식물 위에는 건물을 못 놓아요 */
{const _gp=ghostPos;ghostPos=function(){const g=_gp();if(!g||!g.ok||g.in||!PL.list.length||!bmode||bmode==='demo')return g;const b=BUILDS[bmode],c=Math.cos(g.r||0),s=Math.sin(g.r||0),fx=(b.foot?b.foot[0]:b.bx)+.3,fz=(b.foot?b.foot[1]:b.bz)+.3;
 for(const p of PL.list){if(plGone(p))continue;const dx=p.x-g.x,dz=p.z-g.z;if(Math.abs(dx)>6||Math.abs(dz)>6)continue;const lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<fx&&Math.abs(lz)<fz){g.ok=false;g.why='식물과 겹쳐요';break}}return g}}
/* 땅 위 이름표 + 다시 자라기 */
{const _df=drawFx;drawFx=function(dt){_df(dt);if(mode!=='play'||!PL.list.length)return;
 if(!busy&&S.pgone)for(const k in S.pgone){S.pgone[k]-=dt;if(S.pgone[k]<=0){delete S.pgone[k];PL.tU=0}}
 if(PL.im&&(PL.tU-=dt)<=0){PL.tU=.25;plUpdate()}
 if(INT.on)return;const c=fctx,k=Math.max(.8,UIS*1.25),tp=target&&target.k==='pl'?target.pl:null;
 for(const p of PL.list){if(p===tp||plGone(p)||PL.im&&PL.im[p.id]||Math.abs(p.x-P.x)>PL.R||Math.abs(p.z-P.z)>PL.R)continue;const s=scr(p.x,groundY(p.x,p.z)+.35,p.z);if(!s[2])continue;const C=PCAT[PLD[p.id].cat];uiPill(c,PLD[p.id].n,s[0],s[1],10.5*k,UIC.pn,C[1],C[1])}}}
/* 메뉴의 식물 도감 (ui.js 메뉴 창에서 불러요) */
function plantDexHtml(){const got=PLANTS.filter(q=>S.pdex&&S.pdex[q.id]).length;
 return `<div class="sec">식물 도감 ${got} / ${PLANTS.length}</div>`+Object.keys(PCAT).map(cat=>`<div style="font-weight:800;font-size:12.5px;margin:6px 2px 4px;color:${PCAT[cat][1]}">${PCAT[cat][0]}</div>`+PLANTS.filter(q=>q.cat===cat).map(q=>{const n=S.pdex&&S.pdex[q.id]||0,w=PL.where[q.id];
  return `<div class="row" style="${n?'':'opacity:.72'}"><img src="${ICON[q.id]||''}" style="${n?'':'filter:grayscale(1)'}"><div class="tx">${q.n}${q.col?` <span style="font-size:12px;color:var(--mut)">${q.col}</span>`:''}<small>자라는 곳: ${w&&w.length?w.join(', '):'아직 정해지지 않았어요'}</small><small>${n?`모은 수 ${n}개`:'아직 못 찾았어요'}</small></div></div>`}).join('')).join('')}
