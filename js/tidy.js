/* 57차(디자인) — 한 번만 하는 정리
   기획자(11-22 18:50): '가운데 맨 아래 새로운 섬을 만들면서 썼던 정사각형 구조물은 없애버려'
   → 거북섬(55차, core.js NEWISLE) 테두리를 그릴 때 쓴 관리자 크리에이티브 블록(1m 네모, ui.js CRV)을 지워요.
   블록은 기획자 폰에만 저장돼 있어서(localStorage 'frontisle_blocks') 코드로 한 번 지워요:
   관리자 모드에서 블록을 처음 불러올 때(creInit) 섬 둘레 네모 안 블록만 빼고 다시 저장. 다른 곳 블록은 그대로.
   한 번 하면 'frontisle_tidy57' 표시를 남겨서, 나중에 그 자리에 일부러 쌓은 블록은 지우지 않아요.
   지운 것은 크리에이티브 막대의 ↩(되돌리기)로 한 번 되돌릴 수 있어요(게임을 끄기 전까지). */
const TIDY57_KEY='frontisle_tidy57';
function tidy57Box(){   /* 키운 섬 테두리(55차 그대로) + 4m */
 const I=NEWISLE;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 for(const [px,pz] of I.pg){const X=I.x+(px-I.x)*I.k,Z=I.z+(pz-I.z)*I.k;x0=Math.min(x0,X);x1=Math.max(x1,X);z0=Math.min(z0,Z);z1=Math.max(z1,Z)}
 return [x0-4,x1+4,z0-4,z1+4]}
function tidy57(){let done=false;try{done=!!localStorage.getItem(TIDY57_KEY)}catch(e){}if(done||typeof NEWISLE==='undefined')return 0;
 const [x0,x1,z0,z1]=tidy57Box(),st={ops:[]};
 for(const [key,c] of CRV.map){const [x,z]=key.split(',').map(Number);if(x+1>=x0&&x<=x1&&z+1>=z0&&z<=z1)st.ops.push({key,prev:c,c:null})}
 for(const o of st.ops)CRV.map.delete(o.key);
 if(st.ops.length){CRV.undo.push(st);crvRebuild();creSave();
  toast(`🧱 거북섬을 그릴 때 쓴 블록 ${st.ops.length}개를 지웠어요 (크리에이티브 ↩로 되돌릴 수 있어요)`)}
 try{localStorage.setItem(TIDY57_KEY,String(Date.now()))}catch(e){}
 return st.ops.length}
{const _ci=creInit;creInit=function(){const was=CRV.inited;_ci.apply(this,arguments);if(!was&&CRV.inited)tidy57()}}
