'use strict';
/* 초승달섬 전초기지 — 멀티 서버 뼈대
   한 프로세스 = 한 월드(최대 100명). 클라이언트 파일도 같이 내려준다.
   서버가 판정: 접속/이름, 이동 속도 검사, PvP 사격·피해·사망, 건물 목록, 낮밤 시간, 채팅, 저장.
   아직 클라이언트가 판정: 가방, 제작, 채집, 몹(PvE). → TODO 표시된 곳부터 서버로 옮긴다. */
const http=require('http'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),{WebSocketServer}=require('ws');
const ROOT=path.join(__dirname,'..'),PORT=+process.env.PORT||8080,DATA=process.env.DATA||path.join(__dirname,'world.json'),MAXP=+process.env.MAXP||100;
const TICK=10,VIEW=95,SAFE=40;            // 초당 스냅샷, 보이는 거리, 마을 안전지대 반경
/* 게임 규칙(맵·무기·건물 표)은 클라이언트와 같은 core.js 를 그대로 읽어서 쓴다 */
const sb={document:{getElementById:()=>null},window:{},navigator:{},localStorage:{getItem:()=>null,setItem(){}},console};vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/core.js'),'utf8')+';this.G={WS,WORLD_SEED,buildHeights,hAt,WEAP,BUILDS,VIL,DAYLEN,isZoneT,isHouseT,zoneRect,zoneIn,zoneOverlap,PORT_SAFE,SAFE_PCT,inSafe}',sb);
const G=sb.G;console.log('맵 만드는 중…');G.buildHeights(G.WORLD_SEED);const {WS,hAt,WEAP,BUILDS,VIL,DAYLEN,inSafe,SAFE_PCT}=G;
const dist=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz),clamp=(v,a,b)=>v<a?a:v>b?b:v,now=()=>Date.now()/1000;
/* ---- world state ---- */
let W={time:.3,day:1,nextId:1,structs:[],saved:{}};
try{W=Object.assign(W,JSON.parse(fs.readFileSync(DATA,'utf8')));console.log('저장 불러옴:',Object.keys(W.saved).length,'명,',W.structs.length,'건물')}catch(e){}
const players=new Map();let pid=1,stat={in:0,out:0,msgs:0,t0:now()};
function saveWorld(){players.forEach(p=>{W.saved[p.tok]={name:p.name,x:p.x,z:p.z,hp:p.hp,kills:p.kills,deaths:p.deaths}});fs.writeFile(DATA+'.tmp',JSON.stringify(W),e=>{if(!e)fs.rename(DATA+'.tmp',DATA,()=>{})})}
setInterval(saveWorld,30000);
const send=(p,o)=>{if(p.ws.readyState!==1)return;const s=JSON.stringify(o);stat.out+=s.length;p.ws.send(s)};
const cast=(o,x,z,r=VIEW,ex)=>{const s=JSON.stringify(o);players.forEach(p=>{if(p!==ex&&p.ws.readyState===1&&(x===undefined||dist(p.x,p.z,x,z)<r)){stat.out+=s.length;p.ws.send(s)}})};
const spawn=()=>({x:VIL.x+(Math.random()-.5)*4,z:VIL.z+(Math.random()-.5)*4});
const cleanName=s=>String(s||'').replace(/[<>&"'\s]+/g,' ').trim().slice(0,12)||'생존자';
/* ---- messages ---- */
const H={
 hi(p,m){if(p.id)return;if(players.size>=MAXP){p.ws.send(JSON.stringify({t:'full'}));p.ws.close();return}
  const tok=/^[a-z0-9]{16,40}$/.test(m.tok||'')?m.tok:crypto.randomBytes(12).toString('hex');for(const o of players.values())if(o.tok===tok){o.ws.close()}
  const sv=W.saved[tok],sp=sv&&sv.x?sv:spawn();Object.assign(p,{id:pid++,tok,name:cleanName(m.name||(sv&&sv.name)),x:sp.x,z:sp.z,r:0,a:'Idle',w:'fist',hp:sv&&sv.hp>0?sv.hp:100,alive:true,cd:0,last:now(),kills:sv?sv.kills||0:0,deaths:sv?sv.deaths||0:0,chatT:0,free:true});
  players.set(p.id,p);send(p,{t:'yo',id:p.id,tok,name:p.name,x:p.x,z:p.z,hp:p.hp,time:W.time,day:W.day,max:MAXP,safe:SAFE,structs:W.structs.map(s=>Object.assign({mine:s.o===tok},s,{o:undefined})),who:[...players.values()].map(o=>[o.id,o.name])});
  cast({t:'in',id:p.id,n:p.name},undefined,undefined,0,p);console.log('+',p.name,'('+players.size+'명)')},
 /* 이동: 클라이언트가 보낸 위치를 속도·맵 범위로 검사한다. TODO: 지형 충돌까지 서버에서 다시 계산 */
 m(p,m){const t=now(),dt=clamp(t-p.last,.02,1),x=+m.x,z=+m.z;if(!isFinite(x)||!isFinite(z))return;p.last=t;
  const d=dist(x,z,p.x,p.z);if(d>15*dt+2.5&&!p.free&&!m.tp){send(p,{t:'pos',x:p.x,z:p.z});return}    // TODO: tp(등대 이동·부활)도 서버가 직접 처리
  p.free=false;p.x=clamp(x,4,WS-4);p.z=clamp(z,4,WS-4);p.r=+m.r||0;p.a=String(m.a||'Idle').slice(0,32);p.w=WEAP[m.w]?m.w:'fist';
  if(p.alive&&isFinite(+m.hp))p.hp=t<(p.hpLock||0)?Math.min(p.hp,clamp(+m.hp,0,100)):clamp(Math.min(+m.hp,p.hp+50*dt+1),0,100)},   /* 44차: 서버가 깎은 직후 0.8초는 클라이언트의 옛 체력으로 되돌아가지 않게 */        // TODO: 체력(음식·붕대·몹 피해)도 서버 계산으로
 /* 사격·근접: 서버가 가진 위치로 맞았는지 계산한다 */
 f(p,m){if(!p.alive)return;const w=WEAP[p.w];if(!w||w.rod)return;const t=now();if(t<p.cd)return;p.cd=t+w.cd*.8;let dx=+m.dx,dz=+m.dz;const l=Math.hypot(dx,dz);if(!(l>0))return;dx/=l;dz/=l;
  cast({t:'f',id:p.id,dx:+dx.toFixed(2),dz:+dz.toFixed(2)},p.x,p.z,VIEW,p);
  /* 44차: 항구 안전 구역(core.js PORT_SAFE) — 쏜 사람이나 맞을 사람이 그 안에 있으면 피해 없음, 대신 쏜 사람이 '투명 포탑'에게 최대 에너지의 20%(한 번 쏠 때마다, 쌓여요) */
  const pS=inSafe(p.x,p.z);let bad=false;
  for(let i=0;i<(w.pel||1);i++){const a=Math.atan2(dx,dz)+(w.melee?0:(Math.random()-.5)*2*w.spread),sx=Math.sin(a),sz=Math.cos(a);let best=null,bt=w.range+(w.melee?.4:0);
   players.forEach(o=>{if(o===p||!o.alive)return;const rx=o.x-p.x,rz=o.z-p.z,k=rx*sx+rz*sz;if(k<0||k>bt)return;if(Math.abs(rx*sz-rz*sx)<(w.melee?1.1:.8)){bt=k;best=o}});
   if(best){if(pS||inSafe(best.x,best.z))bad=true;else hurt(best,w.dmg,p)}}
  if(bad)zap(p)},
 dead(p){if(p.alive)die(p,null)},                                                       // 몹·추위로 쓰러졌을 때 (TODO: 서버 판정)
 up(p){p.alive=true;p.hp=70;p.free=true},
 c(p,m){const t=now();if(t<p.chatT)return;p.chatT=t+.8;const s=String(m.s||'').replace(/[<>&]/g,'').trim().slice(0,100);if(s)cast({t:'c',id:p.id,n:p.name,s})},
 /* 건물: 목록은 서버가 갖고 모두에게 알린다. TODO: 재료 차감·겹침 검사를 서버에서 */
 b(p,m){const d=BUILDS[m.k],x=+m.x,z=+m.z;if(!d||!isFinite(x)||!isFinite(z)||dist(x,z,p.x,p.z)>9||hAt(x,z)<.35||W.structs.length>4000)return;
  const G_=sb.G,rr=+(+m.r||0);   /* 39차: 텐트 구역 — 구역끼리 겹치면 안 되고, 남의 집 구역 안에는 못 지어요 */
  if(G_.isZoneT(m.k)){const q=G_.zoneRect(x,z,rr,m.k);if(W.structs.some(o=>G_.isZoneT(o.t)&&G_.zoneOverlap(q,G_.zoneRect(o.x,o.z,o.r,o.t))))return}
  else if(W.structs.some(o=>G_.isHouseT(o.t)&&o.o!==p.tok&&G_.zoneIn(G_.zoneRect(o.x,o.z,o.r,o.t),x,z,Math.max(d.bx,d.bz))))return;
  const s={id:W.nextId++,t:m.k,x:+x.toFixed(2),z:+z.toFixed(2),r:+(+m.r||0).toFixed(2),hp:d.hp,o:p.tok,n:p.name};W.structs.push(s);
  players.forEach(o=>send(o,{t:'b',s:Object.assign({mine:o===p},s,{o:undefined}),ref:o===p?m.ref:undefined}))},
 rb(p,m){const i=W.structs.findIndex(s=>s.id===m.id);if(i<0)return;const t=W.structs[i],G_=sb.G;
  if(t.o!==p.tok){if(G_.isZoneT(t.t))return;let inT=false;for(const h of W.structs){if(!G_.isZoneT(h.t)||!G_.zoneIn(G_.zoneRect(h.x,h.z,h.r,h.t),t.x,t.z,0))continue;if(G_.isHouseT(h.t))return;inT=true}if(!inT)return}   /* 39차: 남의 것은 텐트 구역 안에서만 철거 */W.structs.splice(i,1);cast({t:'rb',id:m.id})},
 ping(p,m){send(p,{t:'pong',k:m.k})}};
function hurt(v,d,by){v.hp-=d;v.hpLock=now()+.8;cast({t:'h',a:by.id,v:v.id,d,hp:Math.max(0,Math.round(v.hp))},v.x,v.z);if(v.hp<=0)die(v,by)}
const TURRET={id:0,name:'🛡 안전 구역',kills:0,zone:1};
function zap(p){const d=Math.round(100*SAFE_PCT);p.hp-=d;p.hpLock=now()+.8;p.zaps=(p.zaps||0)+1;cast({t:'h',a:0,v:p.id,d,hp:Math.max(0,Math.round(p.hp)),zap:1},p.x,p.z);if(p.hp<=0)die(p,TURRET)}   /* 44차: 투명 포탑 */
function die(v,by){v.alive=false;v.hp=0;v.deaths++;if(by)by.kills++;cast({t:'k',a:by?by.id:0,an:by?by.name:'',v:v.id,vn:v.name,x:+v.x.toFixed(1),z:+v.z.toFixed(1),zone:by&&by.zone?1:undefined})}
/* ---- tick ---- */
setInterval(()=>{W.time+=1/TICK/DAYLEN;if(W.time>=1){W.time-=1;W.day++}
 const L=[...players.values()];for(const p of L){const near=[];for(const o of L)if(o!==p&&dist(o.x,o.z,p.x,p.z)<VIEW)near.push([o.id,Math.round(o.x*10),Math.round(o.z*10),Math.round(o.r*100),o.a,o.w,o.alive?Math.round(o.hp):0]);
  send(p,{t:'s',tm:+W.time.toFixed(4),d:W.day,n:L.length,p:near})}},1000/TICK);
/* ---- http + ws ---- */
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);
 if(u==='/status'){const up=now()-stat.t0;r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify({players:players.size,max:MAXP,day:W.day,structs:W.structs.length,outKBs:+(stat.out/1024/up).toFixed(1),inKBs:+(stat.in/1024/up).toFixed(1),cpu:process.cpuUsage(),memMB:Math.round(process.memoryUsage().rss/1048576),up:Math.round(up)}));return}
 if(u==='/')u='/index.html';const f=path.normalize(path.join(ROOT,u));if(!f.startsWith(ROOT)||f.startsWith(__dirname)){r.writeHead(403);r.end();return}
 fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end('not found');return}if(u==='/index.html')b=Buffer.from(b.toString().replace('<script src="js/core.js">','<script>window.MP=1</script><script src="js/core.js">'));
  r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream','cache-control':u==='/index.html'?'no-cache':'public, max-age=3600'});r.end(b)})});
const wss=new WebSocketServer({server:srv,path:'/ws',maxPayload:2048});
wss.on('connection',ws=>{const p={ws,n:0,nt:now()};
 ws.on('message',buf=>{stat.in+=buf.length;stat.msgs++;const t=now();if(t-p.nt>1){p.nt=t;p.n=0}if(++p.n>60){ws.close();return}let m;try{m=JSON.parse(buf)}catch(e){return}if(!m||typeof m.t!=='string')return;if(m.t!=='hi'&&!p.id)return;const h=H[m.t];if(h)try{h(p,m)}catch(e){console.error(e)}});
 ws.on('close',()=>{if(!p.id)return;if(players.get(p.id)===p){W.saved[p.tok]={name:p.name,x:p.x,z:p.z,hp:p.hp,kills:p.kills,deaths:p.deaths};players.delete(p.id);cast({t:'out',id:p.id});console.log('-',p.name,'('+players.size+'명)')}});
 ws.on('error',()=>{})});
srv.listen(PORT,()=>console.log('서버 켜짐: http://localhost:'+PORT+'  (최대 '+MAXP+'명)'));
process.on('SIGTERM',()=>{saveWorld();setTimeout(()=>process.exit(0),300)});process.on('SIGINT',()=>{saveWorld();setTimeout(()=>process.exit(0),300)});
