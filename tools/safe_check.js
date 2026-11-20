// 44차 검사: 항구 안전 구역(멀티 서버). node tools/safe_check.js → 기대: 각 줄 ok true, ALL true
// 서버를 따로 켜서(포트 18089, 임시 저장 파일) 두 사람을 붙이고, 안전 구역 안·밖에서 쏴 봐요.
'use strict';
const {spawn}=require('child_process'),path=require('path'),fs=require('fs'),WebSocket=require(path.join(__dirname,'../server/node_modules/ws'));
const PORT=18089,DATA='/tmp/safe_check_world.json';try{fs.unlinkSync(DATA)}catch(e){}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const srv=spawn('node',[path.join(__dirname,'../server/server.js')],{env:Object.assign({},process.env,{PORT:String(PORT),DATA}),stdio:['ignore','pipe','pipe']});
let up=false;srv.stdout.on('data',d=>{if(String(d).includes('서버 켜짐'))up=true});srv.stderr.on('data',d=>process.stderr.write(d));
function client(name){return new Promise(res=>{const ws=new WebSocket(`ws://localhost:${PORT}/ws`),c={ws,name,hp:100,msgs:[],id:0};
 ws.on('open',()=>ws.send(JSON.stringify({t:'hi',name})));ws.on('message',b=>{const m=JSON.parse(b);c.msgs.push(m);if(m.t==='yo'){c.id=m.id;res(c)}if(m.t==='h'&&m.v===c.id)c.hp=m.hp});c.send=o=>ws.send(JSON.stringify(o))})}
(async()=>{for(let i=0;i<200&&!up;i++)await sleep(100);if(!up){console.log('서버가 안 켜졌어요');srv.kill();process.exit(1)}
 const src=fs.readFileSync(path.join(__dirname,'../js/core.js'),'utf8');const PS=JSON.parse(src.match(/const PORT_SAFE=(\[\[.*?\]\]);/)[1]);
 const A=await client('가'),B=await client('나');await sleep(200);const res={};
 const put=async(c,x,z,w)=>{c.send({t:'m',x,z,r:0,a:'Idle',w:w||'fist',hp:c.hp,tp:1});await sleep(150)};
 const shoot=async(c,dx,dz)=>{c.send({t:'f',dx,dz});await sleep(450)};
 const [cx,cz]=PS[0];
 // 1. 센터 안전 구역 안: A가 B를 쏨 → B는 그대로, A는 -20
 await put(A,cx,cz,'pistol');await put(B,cx+4,cz);await put(A,cx,cz,'pistol');
 await shoot(A,1,0);res.inside={B:B.hp,A:A.hp,zap:A.msgs.some(m=>m.t==='h'&&m.v===A.id&&m.zap),ok:B.hp===100&&A.hp===80};
 // 2. 또 쏘면 또 -20(쌓임), 체력을 100이라고 보내도 되돌아가지 않음
 A.send({t:'m',x:cx,z:cz,r:0,a:'Idle',w:'pistol',hp:100});await sleep(120);await shoot(A,1,0);res.again={B:B.hp,A:A.hp,ok:B.hp===100&&A.hp===60};
 // 3. 근접(도끼)도 같음
 await put(A,cx,cz,'axe');await put(B,cx+1.6,cz);await put(A,cx,cz,'axe');await shoot(A,1,0);res.melee={B:B.hp,A:A.hp,ok:B.hp===100&&A.hp===40};
 // 4. 밖에서 안에 있는 사람을 쏴도(안전 구역 가장자리) 피해 없음 + 포탑
 const r0=PS[0][2];await put(B,cx+r0-2,cz);await put(A,cx+r0+4,cz,'pistol');await shoot(A,-1,0);res.intoZone={B:B.hp,A:A.hp,ok:B.hp===100&&A.hp===20};
 // 5. 안전 구역 밖끼리는 원래대로 맞음
 A.hp=100;B.hp=100;await put(A,380,450,'pistol');await put(B,384,450);
 const hb=B.msgs.length;await shoot(A,1,0);const hit=B.msgs.slice(hb).find(m=>m.t==='h'&&m.v===B.id);res.outside={hit:hit?hit.d:null,zapA:A.msgs.slice(-3).some(m=>m.zap),ok:!!hit&&hit.d===16};
 // 6. 다섯 번 쌓이면 쓰러짐(쓰러진 알림에 zone)
 const C=await client('다'),D=await client('라');await sleep(150);await put(C,PS[2][0],PS[2][1],'pistol');await put(D,PS[2][0]+3,PS[2][1]);await put(C,PS[2][0],PS[2][1],'pistol');
 for(let i=0;i<5;i++)await shoot(C,1,0);const k=C.msgs.find(m=>m.t==='k'&&m.v===C.id);res.five={C:C.hp,D:D.hp,dead:!!k,zone:k&&k.zone,ok:C.hp===0&&D.hp===100&&!!k&&k.zone===1};
 for(const k in res)console.log(k,JSON.stringify(res[k]));console.log('ALL',Object.values(res).every(v=>v.ok));
 [A,B,C,D].forEach(c=>c.ws.close());srv.kill();try{fs.unlinkSync(DATA)}catch(e){}process.exit(0)})().catch(e=>{console.error(e);srv.kill();process.exit(1)});
