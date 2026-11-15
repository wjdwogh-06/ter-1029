/* 부하 시험: node bots.js 100 ws://localhost:8080/ws  → 가짜 접속자 N명이 돌아다니며 쏜다 */
const WebSocket=require('ws'),N=+process.argv[2]||50,URL=process.argv[3]||'ws://localhost:8080/ws';let rx=0,hits=0,kills=0;
for(let i=0;i<N;i++){const ws=new WebSocket(URL);let me=null,x=0,z=0,a=Math.random()*6.28;
 ws.on('open',()=>ws.send(JSON.stringify({t:'hi',name:'봇'+i})));
 ws.on('message',b=>{rx+=b.length;const m=JSON.parse(b);if(m.t==='yo'){me=m;x=m.x+(Math.random()-.5)*160;z=m.z-40-Math.random()*120;ws.send(JSON.stringify({t:'m',x,z,r:0,a:'Idle',w:'pistol',hp:100,tp:1}));
   setInterval(()=>{a+=(Math.random()-.5)*.6;x+=Math.cos(a)*.5;z+=Math.sin(a)*.5;ws.send(JSON.stringify({t:'m',x,z,r:a,a:'Running_A',w:'pistol',hp:100}));if(Math.random()<.08)ws.send(JSON.stringify({t:'f',dx:Math.cos(a),dz:Math.sin(a)}))},100)}
  if(m.t==='h')hits++;if(m.t==='k'){kills++;if(me&&m.v===me.id)ws.send(JSON.stringify({t:'up'}))}});ws.on('error',e=>console.log('err',e.message))}
setInterval(()=>{console.log(`받은 양 ${(rx/1024/5/N).toFixed(1)} KB/s (1명당) · 피격 ${hits} · 사망 ${kills}`);rx=0},5000);
