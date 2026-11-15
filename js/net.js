'use strict';
/* ===== net: multiplayer client. Runs only when the page is served by server/server.js (window.MP) ===== */
const NET={on:false,ws:null,id:0,name:'',players:new Map(),names:{},n:1,sendT:0,lx:0,lz:0,log:[],safe:40,ping:0,
 send(o){if(this.ws&&this.ws.readyState===1)this.ws.send(JSON.stringify(o))},
 init(){if(!window.MP)return;let tok=null;try{tok=localStorage.getItem('fi_tok');this.name=localStorage.getItem('fi_name')||''}catch(e){}
  /* name box on the title screen + chat log (the chat box itself is js/chat.js) */
  const ni=document.createElement('input');ni.id='nameIn';ni.maxLength=12;ni.placeholder='이름 (12자까지)';ni.value=this.name;ni.style.cssText='width:min(70vw,270px);padding:12px;border-radius:12px;border:2px solid rgba(255,255,255,.3);background:rgba(0,0,0,.4);color:#fff;font:800 17px inherit;text-align:center;box-sizing:border-box';$('title').insertBefore(ni,$('tCont'));
  const cb=document.createElement('div');cb.id='chat';cb.style.cssText='position:absolute;left:12px;bottom:92px;width:330px;pointer-events:none;font-size:13.5px;font-weight:700;line-height:1.45;text-shadow:0 1px 3px #000';$('ui').insertBefore(cb,$('shade'));
  this.connect(tok)},
 connect(tok){const ws=this.ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');
  ws.onopen=()=>ws.send(JSON.stringify({t:'hi',tok,name:this.name}));
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}const h=this['_'+m.t];if(h)h.call(this,m)};
  ws.onclose=()=>{const was=this.on;this.on=false;this.players.forEach(p=>p.a.dispose());this.players.clear();if(was)toast('서버와 연결이 끊겼어요. 다시 연결하는 중…');setTimeout(()=>{let t=null;try{t=localStorage.getItem('fi_tok')}catch(e){}this.connect(t)},3000)}},
 say(s,col){this.log.push({s,col:col||'#fff',t:12});if(this.log.length>6)this.log.shift();this.drawLog()},
 drawLog(){const c=$('chat');if(c)c.innerHTML=this.log.map(l=>`<div style="color:${l.col};opacity:${Math.min(1,l.t/2)}">${l.s}</div>`).join('')},
 _full(){toast('서버가 가득 찼어요 (정원 초과)')},
 _yo(m){this.on=true;this.id=m.id;this.safe=m.safe;this.name=m.name;try{localStorage.setItem('fi_tok',m.tok);localStorage.setItem('fi_name',m.name)}catch(e){}
  m.who.forEach(w=>this.names[w[0]]=w[1]);this.n=m.who.length;S.time=m.time;S.day=m.day;
  if(mode!=='play'||dist(P.x,P.z,m.x,m.z)>3){P.x=m.x;P.z=m.z;unstuck()}this.lx=P.x;this.lz=P.z;
  this.applying=true;structs.filter(s=>s.own||s.nid).forEach(removeStruct);m.structs.forEach(s=>this.addS(s));this.applying=false;this.say(`🌐 서버에 접속했어요 · ${this.n}명 접속 중`,'#7BD88F');hudDirty=true},
 addS(s){const o=addStruct({t:s.t,x:s.x,z:s.z,r:s.r,hp:s.hp,own:s.mine?1:0,nid:s.id,by:s.n});return o},
 _in(m){this.names[m.id]=m.n;this.say(`➕ ${m.n} 님이 들어왔어요`,'#A9B6C6')},
 _out(m){const p=this.players.get(m.id);if(p){p.a.dispose();this.players.delete(m.id)}this.say(`➖ ${this.names[m.id]||'누군가'} 님이 나갔어요`,'#A9B6C6')},
 _pos(m){P.x=m.x;P.z=m.z;this.lx=m.x;this.lz=m.z},
 _s(m){this.n=m.n;if(Math.abs(S.time-m.tm)>.002&&mode==='play')S.time=m.tm;S.day=m.d;const now=performance.now(),seen=new Set();
  for(const q of m.p){const id=q[0];seen.add(id);let p=this.players.get(id);if(!p){const a=new Actor('hero');a.helmet();p={id,a,buf:[],x:q[1]/10,z:q[2]/10,r:q[3]/100,hp:q[6],anim:'',w:''};this.players.set(id,p)}
   p.buf.push({t:now,x:q[1]/10,z:q[2]/10,r:q[3]/100});if(p.buf.length>6)p.buf.shift();p.hp=q[6];p.na=q[4];if(p.w!==q[5]){p.w=q[5];p.a.weapon(q[5])}}
  this.players.forEach((p,id)=>{if(!seen.has(id)){p.a.dispose();this.players.delete(id)}})},
 _f(m){const p=this.players.get(m.id);if(!p)return;const w=WEAP[p.w];if(!w||w.melee)return;const y=groundY(p.x,p.z);tracer(p.x+m.dx*1.3,y+1.45,p.z+m.dz*1.3,p.x+m.dx*w.range,y+1.3,p.z+m.dz*w.range);if(dist(p.x,p.z,P.x,P.z)<45)shotSfx(p.w)},
 _h(m){if(m.v===this.id){S.hp=m.hp;P.lastHurt=0;hurtFx();ftext(P.x,groundY(P.x,P.z)+3,P.z,'-'+Math.round(m.d),'#ff7a6e');sfx(120,.18,'sawtooth',.07);buzz(50);if(S.hp<=0)die()}
  else{const p=this.players.get(m.v);if(p){const y=groundY(p.x,p.z);ftext(p.x,y+2.9,p.z,String(Math.round(m.d)),m.a===this.id?'#ffe08a':'#fff');puff(p.x,y+1.4,p.z,0xb3352b,3,.7)}}},
 _k(m){this.say(m.a?`⚔ ${m.an} ▶ ${m.vn}`:`☠ ${m.vn} 님이 쓰러졌어요`,m.a===this.id?'#ffe08a':m.v===this.id?'#ff7a6e':'#dfe8f2');if(m.a===this.id){S.st.kills++;jingle([659,880])}},
 _c(m){this.say(`<b style="color:#8fd3ff">${m.n}</b> ${m.s}`);CHAT.say(m.id===this.id?'me':m.id,m.s);if(m.id!==this.id)sfx(900,.04,'sine',.02)},
 _b(m){if(m.ref){const s=structs.find(q=>q.ref===m.ref);if(s){s.nid=m.s.id;return}}if(structs.some(q=>q.nid===m.s.id))return;this.applying=true;this.addS(m.s);this.applying=false},
 _rb(m){const s=structs.find(q=>q.nid===m.id);if(s){this.applying=true;removeStruct(s);this.applying=false}},
 upd(dt){if(!this.on)return;this.sendT-=dt;if(this.sendT<=0&&mode==='play'){this.sendT=.1;const tp=dist(P.x,P.z,this.lx,this.lz)>12;this.lx=P.x;this.lz=P.z;
   this.send({t:'m',x:+P.x.toFixed(2),z:+P.z.toFixed(2),r:+P.rot.toFixed(2),a:P.dead?'Death_A_Pose':WTR.st==='swim'?'Lie_Idle':P.a.cur,w:curId(),hp:Math.round(S.hp),tp:tp?1:undefined})}
  const rt=performance.now()-160;this.players.forEach(p=>{const b=p.buf;if(!b.length)return;let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const A=b[Math.max(0,i-1)],B=b[i],u=B.t>A.t?clamp((rt-A.t)/(B.t-A.t),0,1.3):1;
   p.x=lerp(A.x,B.x,u);p.z=lerp(A.z,B.z,u);p.r=turn(A.r,B.r,u);const n=p.hp<=0?'Death_A_Pose':p.na||'Idle';if(n!==p.anim&&CLIPS[n]){p.anim=n;p.a.lock=0;p.a.play(n,{force:1})}p.a.set(p.x,p.z,p.r);if(n==='Lie_Idle')p.a.root.position.y=-.55;p.a.mixer.update(dt)});
  let ch=false;for(const l of this.log){l.t-=dt;if(l.t<2)ch=true}if(this.log.length&&this.log[0].t<=0){this.log.shift();ch=true}if(ch)this.drawLog()},
 draw(c,k){if(!this.on)return;c.textAlign='center';this.players.forEach(p=>{const s=scr(p.x,groundY(p.x,p.z)+3.25,p.z);if(!s[2]||p.hp<=0)return;const n=this.names[p.id]||'?';c.font=`800 ${12.5*k}px sans-serif`;c.lineWidth=3;c.strokeStyle='#101820';c.strokeText(n,s[0],s[1]);c.fillStyle='#bfe9c8';c.fillText(n,s[0],s[1]);
   const w=36*k;c.fillStyle='rgba(10,16,26,.8)';c.fillRect(s[0]-w/2-1,s[1]+4*k-1,w+2,5*k+2);c.fillStyle='#7BD88F';c.fillRect(s[0]-w/2,s[1]+4*k,w*clamp(p.hp/100,0,1),5*k)})}};
/* ---- hooks into the single-player code ---- */
{const _attack=attack;attack=function(){const was=P.cd;_attack();if(NET.on&&was<=0&&P.cd>0){const w=WEAP[curId()];if(w&&!w.rod)NET.send(w.melee?{t:'f',dx:Math.sin(P.rot),dz:Math.cos(P.rot)}:{t:'f',dx:P.adx,dz:P.adz})}};
 const _place=placeBuild;placeBuild=function(){const n=structs.length;_place();if(NET.on&&structs.length>n){const s=structs[structs.length-1];s.ref=Math.random().toString(36).slice(2);NET.send({t:'b',k:s.t,x:s.x,z:s.z,r:s.r||0,ref:s.ref})}};
 const _rm=removeStruct;removeStruct=function(s){_rm(s);if(NET.on&&!NET.applying&&s.nid&&s.own)NET.send({t:'rb',id:s.nid})};
 const _die=die;die=function(){const was=P.dead;_die();if(NET.on&&!was&&P.dead){NET.send({t:'dead'});setTimeout(()=>NET.send({t:'up'}),2900)}};
 const _fx=drawFx;drawFx=function(dt){_fx(dt);if(mode==='play')NET.draw(fctx,Math.max(.8,UIS*1.25))};
 const _start=startPlay;startPlay=function(){const ni=$('nameIn');if(ni&&ni.value.trim()&&ni.value.trim()!==NET.name){NET.name=ni.value.trim();try{localStorage.setItem('fi_name',NET.name)}catch(e){}if(NET.ws)NET.ws.close()}_start()};
 $('tCont').onclick=()=>startPlay()}
