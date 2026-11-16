'use strict';
/* ===== 화면 맞추기 (10차, 기획자: '휴대폰 전체로 안 켜지고, 실행할 때마다 화면이 조금씩 잘려요') =====
   1) 크기 다시 재기: 앱·브라우저가 화면 크기를 늦게 정하거나 resize 알림을 빠뜨려도 0.4초마다 확인해서 바뀌면 다시 맞춰요.
      방향 전환·전체 화면 전환·처음 켤 때는 몇 번 더(0.06·0.25·0.6·1.2초 뒤). UI는 실제로 보이는 크기(visualViewport)에 맞춰요.
   2) 안전 여백: 노치·둥근 모서리·홈 막대 안쪽에 UI를 놓아요(env(safe-area-inset-*)). 게임 화면(3D)은 끝까지 그대로.
   3) 전체 화면: 오른쪽 위 ⛶ 버튼, [새로 시작]·[이어하기]를 누를 때 자동으로 요청해요(되는 곳만. 아이폰 사파리와 앱 안 화면은 브라우저가 막아요).
   ui.js의 resize를 감싸요(ui.js 다음, chat.js 앞에 읽어요). */
const SAFE={l:0,r:0,t:0,b:0};
function readSafe(){let d=document.getElementById('safeProbe');
 if(!d){d=document.createElement('div');d.id='safeProbe';d.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(d)}
 const cs=getComputedStyle(d);SAFE.t=parseFloat(cs.paddingTop)||0;SAFE.r=parseFloat(cs.paddingRight)||0;SAFE.b=parseFloat(cs.paddingBottom)||0;SAFE.l=parseFloat(cs.paddingLeft)||0}
const typing=()=>{const a=document.activeElement;return !!a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')};   /* 채팅 자판이 올라와도 UI를 줄이지 않아요 */
let SCR={w:0,h:0};   /* 마지막으로 맞춘 보이는 크기 */
function visSize(){const vv=window.visualViewport;let w=innerWidth,h=innerHeight;if(vv&&!typing()){w=Math.min(w,Math.round(vv.width));h=Math.min(h,Math.round(vv.height))}if(typing()&&SCR.h)h=Math.max(h,SCR.h);return[w,h]}
{const _rs=resize;resize=function(){_rs();readSafe();const [vw,vh]=visSize(),{l,r,t,b}=SAFE,w=Math.max(200,vw-l-r),h=Math.max(200,vh-t-b);SCR={w:vw,h:vh};
  UIS=w>h?clamp(h/500,.5,1.5):clamp(w/560,.5,1.2);VW=w/UIS;VH=h/UIS;const u=$('ui');u.classList.toggle('port',w<=h);
  u.style.transform=(l||t?`translate(${l}px,${t}px) `:'')+`scale(${UIS})`;u.style.width=VW+'px';u.style.height=VH+'px';
  const sh=$('shade');sh.style.left=(-l/UIS)+'px';sh.style.top=(-t/UIS)+'px';sh.style.width=innerWidth/UIS+'px';sh.style.height=innerHeight/UIS+'px';layoutPanel();hudDirty=true}}
/* 조이스틱 자리: UI가 안전 여백만큼 밀려 있으면 손가락 자리에 맞게 되돌려요(ui.js 처리 뒤에 돌아요) */
cv.addEventListener('pointerdown',e=>{if(joy.id!==e.pointerId||!(SAFE.l||SAFE.t))return;const j=$('joy');j.style.left=((e.clientX-SAFE.l)/UIS-75)+'px';j.style.top=((e.clientY-SAFE.t)/UIS-75)+'px'});
let _sk='';function checkSize(force){const [w,h]=visSize(),k=w+'x'+h+'/'+innerWidth+'x'+innerHeight;if(!force&&k===_sk)return;_sk=k;if(typeof R!=='undefined'&&R)resize();if(panel==='fmap'&&typeof drawFmap==='function')drawFmap()}
const settle=()=>[60,250,600,1200].forEach(t=>setTimeout(()=>checkSize(true),t));
setInterval(()=>checkSize(false),400);addEventListener('orientationchange',settle);addEventListener('load',settle);addEventListener('pageshow',settle);
document.addEventListener('fullscreenchange',()=>{settle();fsIcon()});document.addEventListener('webkitfullscreenchange',()=>{settle();fsIcon()});if(window.visualViewport)visualViewport.addEventListener('resize',()=>checkSize(false));
/* ---- 전체 화면 ---- */
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
const FS_MSG='여기서는 전체 화면이 막혀 있어요. 안드로이드는 크롬·삼성 인터넷에서 링크를 열고 ⛶를 눌러 주세요(아이폰 사파리는 지원하지 않아요)';
function goFull(quiet){const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen,no=()=>{if(!quiet)toast(FS_MSG);return false};
 if(fsEl())return Promise.resolve(true);if(!f||(document.fullscreenEnabled===false&&!document.webkitFullscreenEnabled))return Promise.resolve(no());
 try{return Promise.resolve(f.call(d,{navigationUI:'hide'})).then(()=>true,no)}catch(e){return Promise.resolve(no())}}
function exitFull(){const f=document.exitFullscreen||document.webkitExitFullscreen;if(f&&fsEl())try{const r=f.call(document);if(r&&r.catch)r.catch(()=>{})}catch(e){}}
function fsIcon(){const b=$('bFull');if(b)b.firstChild.textContent=fsEl()?'↙':'⛶'}
{const st=document.createElement('style');st.textContent='#bFull{right:154px;top:166px;width:46px;height:46px}#bFull span{font-size:20px;font-weight:900}';document.head.appendChild(st);
 const bt=document.createElement('button');bt.id='bFull';bt.className='rb';bt.innerHTML='<span>⛶</span>';$('ui').insertBefore(bt,$('shade'));
 bt.onclick=()=>{if(fsEl())exitFull();else goFull(false)};
 for(const id of['tNew','tCont'])$(id).addEventListener('click',()=>{if(!fsEl())goFull(true)})}   /* 시작 버튼을 누르는 순간(사용자 동작 안)에만 요청할 수 있어요 */
