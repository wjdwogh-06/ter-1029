'use strict';
/* ===== 채팅 =====
   💬 버튼(PC는 Enter)으로 입력창을 열고 보내면, 그 말이 캐릭터 머리 위 말풍선으로 떠요(롱빈터처럼 흰 말풍선).
   - 혼자 하기: 바로 내 머리 위에.  멀티: 서버를 거쳐 모두에게 → NET._c 가 CHAT.say(id, 글) 를 불러요.
   - 말풍선은 2D 오버레이(fctx)에 매 프레임 그려요: 줄바꿈(최대 3줄), 튀어나오는 등장, 흐려지며 사라짐.
   - 입력창이 열려 있으면 내 머리 위에 "입력 중" 점 세 개가 떠요. */
const CHAT={open:false,max:60,b:new Map(),cool:0,font:UIF,
 init(){const st=document.createElement('style');st.textContent=`
#bChat{right:154px;top:114px;width:46px;height:46px}#bChat span{font-size:19px}
#chatBar{position:absolute;left:50%;top:12px;transform:translateX(-50%);width:max(280px,min(500px,calc(100% - 520px)));display:flex;align-items:center;gap:8px;padding:6px 6px 6px 16px;border-radius:999px;background:var(--pn);border:2.5px solid var(--bd);box-shadow:0 5px 0 rgba(120,86,52,.22),0 12px 26px rgba(40,24,12,.35);z-index:40;animation:chatIn .16s ease-out}
#chatBar.hide{display:none}
#ui.port #chatBar{top:226px;width:calc(100% - 24px)}
@keyframes chatIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
#chatIn{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--tx);font-family:inherit;font-size:16px;font-weight:700;padding:6px 0}
#chatIn::placeholder{color:var(--mut)}
#chatN{font-size:12px;color:var(--mut);font-weight:800;flex:none;min-width:34px;text-align:right}
#chatSend{width:40px;height:40px;border-radius:50%;border:0;background:var(--grn);display:flex;align-items:center;justify-content:center;flex:none;padding:0;box-shadow:0 3px 0 var(--grnD)}
#chatSend:disabled{background:var(--pn3);box-shadow:none}#chatSend svg{width:20px;height:20px;margin-left:2px}`;document.head.appendChild(st);
  const ui=$('ui'),sh=$('shade'),bt=document.createElement('button');bt.id='bChat';bt.className='rb';bt.innerHTML='<span>💬</span>';ui.insertBefore(bt,sh);
  const bar=document.createElement('div');bar.id='chatBar';bar.className='hide';bar.innerHTML=`<input id="chatIn" maxlength="${this.max}" placeholder="할 말을 쓰고 보내기" autocomplete="off" enterkeyhint="send"><span id="chatN">0/${this.max}</span><button id="chatSend" disabled><svg viewBox="0 0 24 24"><path d="M3 11.5 20.5 3.6c.6-.3 1.2.3.9.9L13.5 22c-.3.6-1.1.5-1.2-.1l-1.5-7.2-7.2-1.5c-.6-.1-.7-.9-.1-1.2Z" fill="#ffffff"/></svg></button>`;ui.insertBefore(bar,sh);
  const ci=$('chatIn'),sb=$('chatSend'),cnt=()=>{$('chatN').textContent=ci.value.length+'/'+this.max;sb.disabled=!ci.value.trim()};
  bt.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();this.toggle(!this.open)});
  sb.addEventListener('pointerdown',e=>{e.preventDefault();this.send()});
  ci.addEventListener('input',cnt);
  ci.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();this.send()}else if(e.key==='Escape')this.toggle(false)});ci.addEventListener('keyup',e=>e.stopPropagation());
  if(document.fonts)document.fonts.ready.then(()=>this.b.forEach(o=>o.lines=null));   /* re-measure bubbles once the round font has loaded */
  addEventListener('keydown',e=>{if(e.code==='Enter'&&mode==='play'&&!panel&&!this.open&&document.activeElement!==ci){e.preventDefault();this.toggle(true)}});
  document.addEventListener('pointerdown',e=>{if(this.open&&!bar.contains(e.target)&&e.target!==bt&&!bt.contains(e.target))this.toggle(false)},true);this.cnt=cnt},
 toggle(on){const bar=$('chatBar'),ci=$('chatIn');if(on&&(mode!=='play'||panel))return;this.open=on;bar.classList.toggle('hide',!on);
  if(on){for(const k in keys)keys[k]=0;inp.mx=inp.mz=0;inp.fire=false;ci.value='';this.cnt();ci.focus()}else ci.blur()},
 send(){const ci=$('chatIn'),s=ci.value.replace(/[\u0000-\u001f]/g,'').trim().slice(0,this.max);if(!s)return;if(this.cool>0){toast('조금 천천히 말해요');return}this.cool=.7;
  if(typeof NET!=='undefined'&&NET.on)NET.send({t:'c',s});else this.say('me',s);sfx(820,.05,'sine',.03);ci.value='';this.toggle(false)},
 /* show a bubble over someone: key 'me' = my character, otherwise a multiplayer id */
 say(key,s){const o=this.b.get(key),alive=o&&o.t<o.life;this.b.set(key,{s:String(s).slice(0,this.max),t:0,life:clamp(3.4+s.length*.1,4,9),from:alive?.86:.5,lines:null})},
 anchor(key){if(key==='me')return P.dead?null:{x:P.x,z:P.z,y:2.62};if(typeof NET==='undefined')return null;const p=NET.players.get(key);if(!p||p.hp<=0||dist(p.x,p.z,P.x,P.z)>40)return null;return{x:p.x,z:p.z,y:3.55}},
 wrap(c,s,maxW){const out=[];let line='';for(const ch of s){const t=line+ch;if(line&&c.measureText(t).width>maxW){if(ch===' '){out.push(line);line='';continue}const sp=line.lastIndexOf(' ');if(sp>0&&line.length-sp<9){out.push(line.slice(0,sp));line=line.slice(sp+1)+ch}else{out.push(line);line=ch}}else line=t}
  if(line)out.push(line);if(out.length>3){out.length=3;let l=out[2];while(l&&c.measureText(l+'…').width>maxW)l=l.slice(0,-1);out[2]=l+'…'}return out.map(l=>l.trim())},
 /* one rounded bubble with a tail whose tip is at (0,0) */
 shape(c,w,h,r,tl,tw){const x=-w/2,y=-tl-h;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arcTo(x+w,y,x+w,y+r,r);c.lineTo(x+w,y+h-r);c.arcTo(x+w,y+h,x+w-r,y+h,r);c.lineTo(tw/2,y+h);c.quadraticCurveTo(tw*.12,y+h+tl*.55,0,0);c.quadraticCurveTo(-tw*.12,y+h+tl*.55,-tw/2,y+h);c.lineTo(x+r,y+h);c.arcTo(x,y+h,x,y+h-r,r);c.lineTo(x,y+r);c.arcTo(x,y,x+r,y,r);c.closePath()},
 bubble(c,k,sx,sy,o,dots){const fs=14.5*k,lh=fs*1.34,px=11*k,py=7.5*k,tl=8*k,tw=13*k;c.font=`700 ${fs}px ${this.font}`;
  if(!dots&&(!o.lines||o.k!==k)){o.lines=this.wrap(c,o.s,200*k);o.k=k;o.w=Math.max(...o.lines.map(l=>c.measureText(l).width))}
  const n=dots?1:o.lines.length,h=n*lh+py*2-(lh-fs)*.35,r=Math.min(13*k,h/2),w=Math.max(dots?44*k:(o.w+px*2),r*2+tw+6*k);
  c.save();c.translate(sx,sy);
  /* pop in with a little overshoot, drift up and fade at the end */
  const t=o.t,inT=clamp(t/.24,0,1),back=1+2.2*Math.pow(inT-1,3)+1.2*Math.pow(inT-1,2),sc=dots?1:lerp(o.from,1,back),out=dots?0:clamp((t-(o.life-.45))/.45,0,1);
  c.globalAlpha=dots?.92:Math.min(1,t/.1)*(1-out);c.translate(0,-out*9*k);c.scale(sc,sc);
  c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=9*k;c.shadowOffsetY=3*k;c.fillStyle='#ffffff';this.shape(c,w,h,r,tl,tw);c.fill();
  c.shadowColor='transparent';c.lineWidth=1.4*k;c.strokeStyle='rgba(120,86,52,.25)';c.stroke();
  const top=-tl-h;if(dots){for(let i=0;i<3;i++){const ph=(gt*3.2-i*.45)%3,a=ph<1?Math.sin(ph*Math.PI):0;c.fillStyle=`rgba(91,61,43,${.35+a*.55})`;c.beginPath();c.arc((i-1)*9*k,top+h/2-a*2.2*k,3.1*k,0,6.283);c.fill()}}
  else{c.fillStyle=UIC.tx;c.textAlign='center';c.textBaseline='middle';o.lines.forEach((l,i)=>c.fillText(l,0,top+py+lh*i+fs*.55))}
  c.restore()},
 draw(c,k,dt){this.cool=Math.max(0,this.cool-dt);if(this.open&&(panel||mode!=='play'))this.toggle(false);
  for(const[key,o]of this.b){o.t+=dt;if(o.t>=o.life){this.b.delete(key);continue}const a=this.anchor(key);if(!a)continue;const s=scr(a.x,groundY(a.x,a.z)+a.y,a.z);if(!s[2])continue;this.bubble(c,k,s[0],s[1],o,false)}
  if(this.open&&!this.b.has('me')&&!P.dead){const s=scr(P.x,groundY(P.x,P.z)+2.62,P.z);if(s[2])this.bubble(c,k,s[0],s[1],{t:1},true)}}};
CHAT.init();
