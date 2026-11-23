/* 64차(디자인): 요리 30종 — 기획자 11-23 09:35: '요리 30종류 추가, 실물은 만들 필요 없고 인벤이나 자판기 같이 보이는 이미지에서만'
   그래서 땅에 놓이는 모양은 없고, 아이템(ITEMS)과 아이콘 그림(GEO 'ds_<id>' → look.js가 아이콘으로 찍음)만 있어요.
   먹으면 에너지가 차는 음식(ty:'food')으로 넣었어요. 에너지(food)·가격(p)은 모두 임시 — 기획자가 정하면 아래 표의 숫자만 고치기.
   향로버섯이 들어간 신비한 요리 6가지(rare:1)는 아이콘 원판이 보라(look.js lkCatOf 한 줄). 모닥불 조합은 아래 DISH_RECIPES를 사용해요. */
const DISHES=[
 ['dish_saltfish','소금구이 생선',30,120,'굵은 소금을 뿌려 구운 생선'],
 ['dish_jam','달콤한 과일잼',20,90,'딸기·포도를 졸인 달콤한 잼 한 병'],
 ['dish_potato','버터 없는 구운 감자',25,70,'호일에 싸서 구운 담백한 감자'],
 ['dish_corn','군옥수수',25,70,'불에 노릇하게 구운 옥수수'],
 ['dish_avotoast','아보카도 토스트',35,160,'으깬 아보카도를 올린 바삭한 토스트'],
 ['dish_tomtoast','토마토 잼 토스트',30,120,'새콤달콤한 토마토 잼을 바른 토스트'],
 ['dish_onionring','양파 링 튀김',30,110,'바삭하게 튀긴 양파 링'],
 ['dish_darkchoc','다크 초콜릿',20,140,'카카오로 만든 쌉싸름한 초콜릿'],
 ['dish_steak','후추 스테이크',55,320,'통후추를 듬뿍 뿌려 구운 스테이크'],
 ['dish_skewer','매운 고기 꼬치',40,180,'칠리로 매콤하게 구운 고기 꼬치'],
 ['dish_nachos','과카몰리 나초',35,170,'바삭한 나초와 아보카도 과카몰리'],
 ['dish_chili','칠리 콘 카르네',50,240,'고기·콩·칠리를 푹 끓인 매운 스튜'],
 ['dish_fishchips','피쉬 앤 칩스',50,260,'튀긴 생선과 감자튀김'],
 ['dish_fishstew','매운 생선 스튜',50,260,'칠리를 넣고 끓인 얼큰한 생선 스튜'],
 ['dish_mushsoup','버섯 크림 없는 수프',35,150,'버섯으로 맛을 낸 맑은 수프'],
 ['dish_truffle','트러플 스타일 버섯구이',40,220,'무쇠 팬에 향긋하게 구운 버섯'],
 ['dish_taco','살사 소스 타코',45,210,'살사 소스를 듬뿍 올린 타코'],
 ['dish_chowder','콘 차우더',45,200,'빵 그릇에 담은 옥수수 수프'],
 ['dish_shortcake','딸기 쇼트케이크',40,280,'생크림과 딸기를 겹겹이 올린 케이크'],
 ['dish_fondue','초코 딸기 퐁듀',40,300,'녹인 초콜릿에 딸기를 찍어 먹어요'],
 ['dish_grapetart','포도 타르트',40,260,'포도를 빼곡히 올린 바삭한 타르트'],
 ['dish_brownie','초코 브라우니',35,200,'꾸덕한 초콜릿 브라우니'],
 ['dish_avomousse','아보카도 초코 무스',40,260,'아보카도와 초콜릿을 겹친 무스'],
 ['dish_hotchoc','스파이시 핫초코',30,180,'칠리를 살짝 넣은 따끈한 핫초코'],
 ['dish_censertea','향로버섯 차',40,400,'향로버섯을 우린 신비한 차',1],
 ['dish_hallushroom','환각의 매운 버섯볶음',45,450,'눈앞이 빙글빙글 도는 매운 버섯볶음',1],
 ['dish_purifystew','정화의 향로 스튜',70,700,'은은하게 빛나는 맑은 향로버섯 스튜',1],
 ['dish_fishercenser','어부의 비법 향로구이',65,650,'어부만 아는 비법으로 구운 생선과 향로버섯',1],
 ['dish_feast','황제의 야생 만찬',100,1500,'섬의 모든 재료를 모은 황금 접시',1],
 ['dish_festcake','신비의 향로 축제 케이크',90,1200,'향로버섯으로 꾸민 축제의 케이크',1]];
for(const [id,n,food,p,d,rare] of DISHES)ITEMS[id]=Object.assign({n,ty:'food',food,p,ic:'ds_'+id,d:d+' (임시: 에너지·가격)'},rare?{rare:1}:{});

function dsModels(){
 const put=(k,p,sm=40)=>{const g=mg(p);lkSmooth(g,sm);g.computeBoundingSphere();GEO[k]=g;return g};
 const R=(w,h,d,c,p,r,cr=.03,bv=.016)=>pt(lkRb(w,h,d,cr,bv),c,p,r);
 const CY=(rt,rb,h,c,p,r,sc,n=20)=>pt(cyl(rt,rb,h,n),c,p,r,sc);
 const SP=(rad,c,p,sc,r,a=16,b=12)=>pt(new THREE.SphereGeometry(rad,a,b),c,p,r||0,sc);
 const IC=(rad,c,p,sc,r,d=0)=>pt(new THREE.IcosahedronGeometry(rad,d),c,p,r||0,sc);
 const CN=(rad,h,c,p,r,n=14)=>pt(cone(rad,h,n),c,p,r);
 const TO=(Rr,t,c,p,r,sc,arc=Math.PI*2,n=28)=>pt(new THREE.TorusGeometry(Rr,t,8,n,arc),c,p,r,sc);
 const ROD=(a,b,r,c,n=8)=>{const q=lkAim(a,b);return pt(cyl(r,r,q.L,n),c,q.pos,q.rot)};
 const LA=(prof,c,p,seg=32,sc)=>pt(new THREE.LatheGeometry(prof.map(q=>new THREE.Vector2(q[0],q[1])),seg),c,p,0,sc);
 const H=(i,j,k=64)=>hash(i,j,k),PI=Math.PI;
 const WH=0xf7f3ea,CRM=0xf7f0e3,BRN=0x7a3a22,GRN=0x5bae5f,RED=0xe0533f,YEL=0xf2c230,GOLD=0xd8b25e,BRZ=0xb08040,CHO=0x4a2a1c,TOAST=0xc98a4a,CRUMB=0xf0d29a;
 /* 바탕 그릇들 */
 const plate=(p,r=.5,c=WH,band,sc)=>{p.push(LA([[0,0],[r*.58,0],[r*.62,.014],[r*.9,.032],[r,.058],[r*.975,.066],[r*.9,.048],[r*.6,.032],[0,.032]],c,[0,0,0],40,sc));if(band)p.push(TO(r*.93,.007,band,[0,.055,0],[PI/2,0,0],sc?[sc[0],sc[2],1]:undefined,PI*2,48))};
 const bowl=(p,r,h,c,soup,fill=.84,inner)=>{p.push(LA([[0,0],[r*.42,0],[r*.46,.02],[r*.84,h*.48],[r,h],[r*.96,h*1.03],[r*.85,h*.56],[r*.42,h*.12],[0,h*.12]],c,[0,0,0],36));if(inner)p.push(LA([[r*.43,h*.13],[r*.83,h*.55],[r*.95,h*.99]],inner,[0,0,0],36));
  if(soup!=null)p.push(CY(r*.88*(.82+fill*.12),r*.88*(.82+fill*.12),.012,soup,[0,h*fill,0],0,undefined,36))};
 const board=(p,w,d,c=0xc08550)=>{p.push(R(w,.07,d,c,[0,.035,0],0,.03,.015));for(let i=1;i<4;i++)p.push(R(w-.06,.004,.006,0x9c6a3e,[0,.071,-d/2+i*d/4],0,.002,.001))};
 const fish=(p,x,y,z,s,col,ry=0,grill=0x5a3418)=>{const q=[SP(.32,col,[0,0,0],[1.55,.42,.5]),SP(.2,col,[.36,-.005,0],[1,.48,.55]),CN(.17,.24,col,[-.58,0,0],[0,0,PI/2],10),SP(.035,0xffffff,[.46,.06,.09]),SP(.02,0x22252a,[.47,.06,.105])];
  q[2]=pt(cone(.18,.26,10),col,[-.6,0,0],[0,0,PI/2],[1,1,.28]);for(let i=0;i<4;i++)q.push(R(.03,.012,.26,grill,[-.25+i*.15,.125,0],[0,.5,0],.006,.004));const m=mg(q);m.scale(s,s,s);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 const steam=(p,x,y,z,c=0xf3f1f6,n=3)=>{for(let i=0;i<n;i++)p.push(SP(.05+i*.012,c,[x+Math.sin(i*2.1)*.05,y+i*.11,z+Math.cos(i*1.7)*.03],[1,.9,1],0,10,8))};
 const leaf=(p,x,y,z,s,c=0x4f9a4a,ry=0)=>p.push(SP(.06*s,c,[x,y,z],[1.6,.25,.8],[0,ry,0],10,6));
 const strawberry=(p,x,y,z,s=1,ry=0)=>{p.push(pt(new THREE.SphereGeometry(.07*s,12,10),0xe0333f,[x,y,z],[PI,ry,0],[1,1.25,1]));for(let i=0;i<5;i++){const a=i/5*PI*2;p.push(SP(.03*s,0x4f9a3a,[x+Math.cos(a)*.035*s,y+.08*s,z+Math.sin(a)*.035*s],[1.4,.35,.7],[0,-a,0],6,4))}
  for(let i=0;i<6;i++){const a=i*1.3;p.push(SP(.008*s,0xf7d94a,[x+Math.cos(a)*.068*s,y-.01*s+(i%3)*.03*s,z+Math.sin(a)*.068*s],0,0,4,3))}};
 const bread=(p,x,y,z,ry=0)=>{const q=[R(.62,.12,.66,TOAST,[0,.06,0],0,.12,.04),R(.56,.02,.6,CRUMB,[0,.115,0],0,.1,.01)];const m=mg(q);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 const chili=(p,x,y,z,s=1,ry=0)=>{const c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.1,-.01,0),new THREE.Vector3(.2,-.04,0),new THREE.Vector3(.27,-.09,0)]),tg=new THREE.TubeGeometry(c,16,.04,10,false),po=tg.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<po.count;i++){v.fromBufferAttribute(po,i);const t=Math.min(1,Math.max(0,v.x/.27)),k=1-t*.75,cy=-.09*t*t;po.setXYZ(i,v.x,cy+(v.y-cy)*k,v.z*k)}tg.computeVertexNormals();const q=[pt(tg,0xd8302a),SP(.042,0xd8302a,[0,0,0],0,0,10,8),CY(.03,.03,.03,0x4f8a3a,[-.03,.005,0],[0,0,PI/2],undefined,8),CY(.01,.012,.07,0x4f8a3a,[-.08,.03,0],[0,0,1.0],undefined,6)];const m=mg(q);m.scale(s,s,s);m.rotateY(ry);m.translate(x,y,z);p.push(m)};
 const censer=(p,x,y,z,s=.35)=>{if(GEO.pw_mush_censer)p.push(pt(GEO.pw_mush_censer,null,[x,y,z],[0,.4,0],[s,s,s]))};
 const S={};
 S.dish_saltfish=p=>{plate(p,.55,WH,0x3f7fd0,[1.35,1,.82]);fish(p,0,.06,0,.95,0xc98a4a,0);for(let i=0;i<22;i++)p.push(R(.022,.018,.022,0xffffff,[-.4+H(i,1)*.8,.17+H(i,2)*.03,-.08+H(i,3)*.16],[H(i,4),H(i,5),0],.004,.003));
  p.push(pt(new THREE.CylinderGeometry(.11,.11,.05,16,1,false,0,PI),0xf7d94a,[.42,.09,.22],[PI/2,0,.3]),pt(new THREE.CylinderGeometry(.095,.095,.052,16,1,false,0,PI),0xfbf0b0,[.42,.09,.22],[PI/2,0,.3]));leaf(p,-.45,.07,.2,1.2,0x5aa04a,.5);leaf(p,-.38,.07,.26,1,0x6ab45a,1.4)};
 S.dish_jam=p=>{p.push(CY(.21,.21,.4,0xc8243c,[0,.2,0],0,undefined,24),CY(.215,.215,.13,CRM,[0,.2,0],0,undefined,24),CY(.17,.2,.05,0xd84a5c,[0,.41,0],0,undefined,24),CY(.23,.23,.07,0xd8b25e,[0,.45,0],0,undefined,24));
  p.push(CY(.3,.33,.035,CRM,[0,.5,0],0,undefined,24));for(let i=0;i<16;i++){const a=i/16*PI*2;p.push(SP(.035,i%2?RED:CRM,[Math.cos(a)*.31,.47,Math.sin(a)*.31],[1,.6,1],0,8,6))}for(let i=0;i<8;i++){const a=i/8*PI*2+.2;p.push(SP(.025,RED,[Math.cos(a)*.16,.52,Math.sin(a)*.16],[1,.3,1],0,8,4))}
  p.push(TO(.215,.012,0x9c6a3e,[0,.445,0],[PI/2,0,0]));strawberry(p,0,.2,.215,.7);p.push(SP(.06,0xd84a5c,[0,.2,.22],[1,1,.2]));strawberry(p,.32,.06,.18,1.1,.4);strawberry(p,.4,.06,-.04,.95,1.4);
  p.push(ROD([-.25,.03,.25],[-.5,.06,.05],.016,0xd0d4da,6),SP(.06,0xd0d4da,[-.22,.03,.28],[1.2,.3,1]),SP(.045,0xc8243c,[-.22,.045,.28],[1,.4,1]))};
 S.dish_potato=p=>{plate(p,.48,0xf2ece0);p.push(LA([[0,.03],[.3,.04],[.34,.1],[.3,.16],[.33,.2]],0xc9ced6,[0,0,0],14),SP(.3,0xa8693a,[0,.18,0],[1.2,.75,.85],0,18,14));
  p.push(SP(.22,0xf6e6b0,[0,.27,0],[1.15,.25,.75],0,16,10),R(.32,.03,.05,0xe9d590,[0,.3,0],[0,.6,0],.01,.006),R(.32,.03,.05,0xe9d590,[0,.3,0],[0,-.6,0],.01,.006));for(let i=0;i<14;i++)p.push(CY(.008,.008,.05,0x4f9a3a,[-.15+H(i,1)*.3,.31,-.1+H(i,2)*.2],[PI/2,H(i,3)*3,0],undefined,5));
  for(let i=0;i<10;i++)p.push(R(.014,.012,.014,0xffffff,[-.12+H(i,6)*.24,.31,-.08+H(i,7)*.16],0,.003,.002))};
 S.dish_corn=p=>{plate(p,.5,WH,0x5bae5f);const L=.62,q=[];q.push(CY(.11,.13,L,0xe8b23a,[0,0,0],[0,0,PI/2],undefined,16));for(let i=0;i<11;i++)for(let j=0;j<12;j++){const x=-L/2+.04+i*(L-.08)/10,a=j/12*PI*2,rr=.125-Math.abs(x)*.03,ch=H(i,j)<.18||(i+j)%7===0;q.push(pt(new THREE.IcosahedronGeometry(.03,0),ch?0x6a3a1c:(H(j,i)<.5?0xf7c948:0xf2b830),[x,Math.cos(a)*rr,Math.sin(a)*rr],[a,0,0],[1,1,.8]))}
  for(const s of[1,-1])q.push(SP(.12,0x9cc04a,[-L/2-.05,s*.06,s*.05],[1.6,.25,.7],[0,0,s*.6],10,6));q.push(ROD([L/2-.02,0,0],[L/2+.28,0,0],.018,0xd6a46a,8));const m=mg(q);m.rotateY(.5);m.translate(0,.18,0);p.push(m)};
 S.dish_avotoast=p=>{plate(p,.52,WH);bread(p,0,.03,0,.2);p.push(SP(.24,0x9cc56a,[0,.17,0],[1.05,.18,1.1],0,16,10));for(let i=0;i<5;i++){const a=-.6+i*.3;p.push(SP(.1,0x7fb04a,[Math.sin(a)*.12,.2,Math.cos(a)*.12-.05],[.45,.18,1],[0,a,0],12,8),SP(.085,0xd8e8a0,[Math.sin(a)*.12,.21,Math.cos(a)*.12-.05],[.38,.16,.9],[0,a,0],12,8))}
  for(let i=0;i<14;i++)p.push(R(.014,.008,.014,0xd8302a,[-.18+H(i,1)*.36,.235,-.18+H(i,2)*.36],0,.003,.002));leaf(p,.3,.06,.28,1,0x5aa04a,.8)};
 S.dish_tomtoast=p=>{plate(p,.52,WH,RED);bread(p,0,.03,0,-.2);p.push(SP(.24,0xc8243c,[0,.165,0],[1.05,.12,1.1],0,16,10),SP(.12,0xe85a5a,[-.06,.18,-.05],[1,.08,1],0,12,6));
  for(const [x,z] of [[.32,.25],[.4,.05]]){p.push(SP(.1,0xe0333f,[x,.1,z],[1,.85,1],0,14,10),CY(.085,.085,.01,0xf28a7a,[x,.17,z],0,undefined,14));for(let i=0;i<5;i++)p.push(SP(.012,0xf7e7a0,[x+Math.cos(i*1.25)*.045,.178,z+Math.sin(i*1.25)*.045],0,0,5,4))}leaf(p,-.3,.06,.3,1.2,0x4f9a3a,.4);leaf(p,-.24,.06,.36,1,0x5aa04a,1.8)};
 S.dish_onionring=p=>{p.push(R(.8,.16,.55,RED,[0,.08,0],0,.04,.02),R(.76,.02,.51,CRM,[0,.15,0],0,.03,.01));for(let i=0;i<6;i++)p.push(R(.8,.163,.04,0xf7f0e3,[0,.08,-.22+i*.088],0,.01,.006));
  for(let i=0;i<6;i++){const x=-.25+(i%3)*.25,z=-.1+((i/3)|0)*.18,y=.2+(i>2?.07:0);p.push(TO(.12,.045,i%2?0xe0a24a:0xd8963e,[x,y,z],[PI/2+(H(i,1)-.5)*.6,0,(H(i,2)-.5)*.6],undefined,PI*2,18))}
  p.push(CY(.1,.09,.08,WH,[.52,.04,.25],0,undefined,16),CY(.085,.085,.01,0xc8243c,[.52,.08,.25],0,undefined,16))};
 S.dish_darkchoc=p=>{p.push(R(.8,.08,.45,CHO,[0,.04,0],0,.02,.012));for(let i=0;i<4;i++)for(let j=0;j<2;j++)if(i<3||j)p.push(R(.17,.035,.18,0x5a3424,[-.29+i*.195,.095,-.1+j*.2],0,.02,.012));
  p.push(R(.36,.11,.47,0xc0392b,[.24,.055,0],0,.02,.01),R(.37,.115,.08,GOLD,[.24,.057,0],0,.01,.005),R(.06,.12,.48,0xe0d0a0,[.07,.058,0],0,.005,.003),R(.1,.004,.44,0xe8c868,[.04,.112,0],[0,0,-.4],.002,.001));
  for(const [x,z,r] of [[-.25,.36,.3],[-.08,.4,1.2]])p.push(R(.16,.07,.16,CHO,[x,.035,z],[0,r,0],.02,.012),R(.15,.03,.15,0x5a3424,[x,.075,z],[0,r,0],.02,.01))};
 S.dish_steak=p=>{plate(p,.55,WH,0x2f3b63);p.push(R(.5,.13,.34,0x6a3020,[-.05,.1,0],[0,.2,0],.12,.05),R(.46,.02,.3,0x8a4a2a,[-.05,.165,0],[0,.2,0],.11,.01));for(let i=0;i<4;i++)p.push(R(.03,.008,.3,0x3a1a10,[-.22+i*.11,.178,0],[0,.2+.7,0],.004,.003));
  for(let i=0;i<22;i++)p.push(SP(.012,0x1c1c1c,[-.25+H(i,1)*.4,.18,-.13+H(i,2)*.26],0,0,5,4));for(let i=0;i<3;i++)p.push(IC(.07,i%2?0x4f9a3a:0x5aae4a,[.32+(i%2)*.06,.13,-.18+i*.07],[1,.8,1],0,1),CY(.015,.02,.08,0x8ac06a,[.32+(i%2)*.06,.07,-.18+i*.07],0,undefined,6));
  for(let i=0;i<3;i++)p.push(R(.16,.06,.06,0xf2c860,[.25+i*.03,.07,.22+i*.04],[0,.6+i*.3,0],.02,.012));p.push(ROD([-.35,.19,-.12],[-.1,.2,-.2],.008,0x4f7a3a,5));for(let i=0;i<6;i++)leaf(p,-.33+i*.045,.2,-.13-i*.013,.45,0x4f8a3a,1.9)};
 S.dish_skewer=p=>{board(p,.95,.5);for(const z of[-.1,.12]){p.push(ROD([-.45,.15,z],[.48,.15,z],.012,0xd6a46a,6));const C=[0x8a4a2a,0xd8302a,0x8a4a2a,0xf3ead6,0x8a4a2a,0x5aa04a,0x8a4a2a];C.forEach((c,i)=>p.push(R(.1,.09,.09,c,[-.33+i*.11,.15,z],[H(i,z*10|0),.2,0],.025,.015)))}
  for(let i=0;i<10;i++)p.push(R(.01,.006,.01,0xd8302a,[-.3+H(i,4)*.6,.2,-.12+H(i,5)*.26],0,.002,.001));chili(p,.25,.1,.3,1.1,.3);chili(p,-.3,.1,.3,.9,2.6)};
 S.dish_nachos=p=>{bowl(p,.55,.22,0xd85a3a,0xf2b84a,.7,0xe8c070);const tri=new THREE.Shape();tri.moveTo(0,.12);tri.lineTo(-.1,-.07);tri.lineTo(.1,-.07);tri.closePath();const tg=new THREE.ExtrudeGeometry(tri,{depth:.012,bevelEnabled:false});
  for(let i=0;i<16;i++){const a=i/16*PI*2,r=.36+H(i,1)*.08;p.push(pt(tg,H(i,3)<.5?0xf2b84a:0xe8a83a,[Math.cos(a)*r,.2+H(i,2)*.06,Math.sin(a)*r],[-1.1+H(i,4)*.4,-a+PI/2,H(i,5)-.5]))}
  p.push(CY(.2,.16,.12,0xf7f0e3,[0,.2,0],0,undefined,20),SP(.18,0x8cbc4a,[0,.26,0],[1,.45,1],0,16,10));for(let i=0;i<8;i++)p.push(R(.03,.025,.03,0xe0333f,[-.1+H(i,6)*.2,.33,-.1+H(i,7)*.2],0,.006,.004));
  p.push(pt(new THREE.CylinderGeometry(.08,.08,.04,14,1,false,0,PI),0x8ad04a,[.15,.33,.12],[PI/2,0,-.5]))};
 S.dish_chili=p=>{bowl(p,.5,.26,0x8a3a2a,0x8a2e1e,.86,0xe8d8c0);for(let i=0;i<16;i++){const a=H(i,1)*PI*2,r=H(i,2)*.33;p.push(SP(.03,i%3?0x5a1a14:0x7a2a1a,[Math.cos(a)*r,.235,Math.sin(a)*r],[1.3,.6,.9],[0,a,0],8,6))}
  for(let i=0;i<8;i++)p.push(IC(.035,0x6a3a22,[-.25+H(i,3)*.5,.235,-.25+H(i,4)*.5],[1,.6,1]));p.push(SP(.09,0xfaf6ee,[.05,.25,-.02],[1,.45,1],0,12,8));for(let i=0;i<10;i++)p.push(R(.06,.008,.01,0xf2c230,[-.15+H(i,5)*.3,.245,-.15+H(i,6)*.3],[0,H(i,7)*3,0],.003,.002));
  for(let i=0;i<5;i++)leaf(p,.08+Math.cos(i*1.2)*.05,.27,.0+Math.sin(i*1.2)*.05,.5,0x4f9a3a,i);chili(p,.42,.04,.3,1,.6)};
 S.dish_fishchips=p=>{p.push(R(.8,.1,.55,0xf2ecdc,[0,.05,0],0,.04,.02));for(let i=0;i<7;i++)p.push(R(.5+H(i,1)*.2,.004,.02,0x8a8f98,[-.05,.101,-.2+i*.065],0,.002,.001));
  for(let k=0;k<2;k++){const q=[];for(let i=0;i<5;i++)q.push(SP(.1-Math.abs(i-2)*.015,0xd99a3c,[-.2+i*.1,0,(H(i,k)-.5)*.02],[1,.6,.85],0,10,8));const m=mg(q);m.rotateY(.3-k*.5);m.translate(-.05+k*.08,.15+k*.06,-.1+k*.16);p.push(m)}
  for(let i=0;i<14;i++)p.push(R(.25,.045,.045,i%3?0xf2c860:0xe8b850,[.22+H(i,2)*.12,.12+((i/5)|0)*.045,-.15+(i%5)*.07],[0,H(i,3)*.6-.3,0],.012,.008));
  p.push(pt(new THREE.CylinderGeometry(.09,.09,.05,14,1,false,0,PI),0xf7d94a,[-.32,.13,.2],[PI/2,0,.6]),CY(.08,.07,.07,WH,[.3,.1,.22],0,undefined,14),CY(.068,.068,.01,0xf6f0d8,[.3,.135,.22],0,undefined,14))};
 S.dish_fishstew=p=>{p.push(LA([[0,0],[.38,0],[.42,.3],[.44,.31],[.4,.3],[.36,.02],[0,.02]],0x3a3f46,[0,0,0],32),TO(.42,.025,0x50565e,[0,.3,0],[PI/2,0,0]),CY(.39,.39,.012,0xd0482e,[0,.27,0],0,undefined,28));for(const s of[1,-1])p.push(TO(.07,.022,0x2a2e34,[s*.46,.24,0],[0,PI/2,0]));
  for(let i=0;i<7;i++)p.push(R(.1,.05,.08,0xf0e6d6,[-.22+H(i,1)*.44,.285,-.22+H(i,2)*.44],[0,H(i,3)*3,0],.02,.012));for(let i=0;i<8;i++)p.push(TO(.025,.008,0xc8202a,[-.25+H(i,4)*.5,.282,-.25+H(i,5)*.5],[PI/2,0,0],undefined,PI*2,12));
  for(let i=0;i<10;i++)p.push(CY(.01,.01,.04,0x5aa04a,[-.25+H(i,6)*.5,.285,-.25+H(i,7)*.5],[PI/2,H(i,8)*3,0],undefined,5));steam(p,-.08,.42,0);steam(p,.12,.4,.06)};
 S.dish_mushsoup=p=>{plate(p,.5,0xf2ece0);bowl(p,.38,.2,0xf3ead6,0xb07a3e,.85,0xf7f0e3);
  for(let i=0;i<7;i++){const a=i/7*PI*2,r=.13+H(i,1)*.1;p.push(pt(new THREE.CylinderGeometry(.06,.06,.012,14,1,false,0,PI),i%2?0xa8774e:0x8a5a36,[Math.cos(a)*r,.175,Math.sin(a)*r],[0,a,0]),R(.018,.012,.05,0xe8d8b8,[Math.cos(a)*r,.175,Math.sin(a)*r+.0],[0,a,0],.004,.003))}
  for(let i=0;i<6;i++)leaf(p,-.05+H(i,2)*.1,.185,-.05+H(i,3)*.1,.4,0x4f9a3a,i);p.push(ROD([.3,.05,.3],[.55,.06,.12],.014,0xd0d4da,6),SP(.06,0xd0d4da,[.27,.05,.33],[1.2,.3,1]));steam(p,0,.3,0)};
 S.dish_truffle=p=>{p.push(CY(.42,.38,.08,0x2a2c30,[0,.04,0],0,undefined,28),TO(.42,.02,0x3a3d42,[0,.08,0],[PI/2,0,0]),CY(.38,.38,.01,0x3a3028,[0,.07,0],0,undefined,28),R(.42,.05,.08,0x2a2c30,[.6,.06,0],0,.02,.012));
  for(let i=0;i<7;i++){const a=i/7*PI*2,r=i?.2:0,x=Math.cos(a)*r,z=Math.sin(a)*r;p.push(SP(.1,0x8a5230,[x,.13,z],[1,.6,1],0,14,8),CY(.03,.035,.07,0xe8d6b0,[x,.08,z],0,undefined,8),R(.15,.008,.012,0x3a1a0c,[x,.18,z],[0,a,0],.003,.002))}
  for(let i=0;i<9;i++)p.push(CY(.03,.03,.006,0x2a1a14,[-.25+H(i,1)*.5,.2,-.25+H(i,2)*.5],[H(i,3)-.5,0,H(i,4)-.5],undefined,10));for(let i=0;i<5;i++)leaf(p,-.2+i*.1,.18,.25,.45,0x5a8a3a,i)};
 S.dish_taco=p=>{plate(p,.55,WH,0xf28c38);for(const [x,ry] of [[-.17,.12],[.19,-.12]]){const q=[pt(new THREE.CylinderGeometry(.19,.19,.3,20,1,true,-PI/2,PI),0xf2c870,[0,0,0],[PI/2,0,0]),pt(new THREE.CylinderGeometry(.185,.185,.29,20,1,true,-PI/2,PI),0xe8b860,[0,0,0],[PI/2,0,0],[-1,1,1])];   /* 안쪽 면(뒤집어 안을 보게) */
   for(let i=0;i<5;i++)q.push(IC(.05,0x7a3a22,[(H(i,4)-.5)*.1,-.06,(H(i,5)-.5)*.22],[1,.7,1]));for(let i=0;i<7;i++)q.push(IC(.055,i%2?0x7cc04a:0x9cd05a,[(H(i,1)-.5)*.14,-.01+H(i,2)*.03,(H(i,3)-.5)*.24],[1,.6,1]));for(let i=0;i<8;i++)q.push(R(.035,.03,.035,i%3?0xe0333f:0xf0e8d0,[(H(i,6)-.5)*.12,.03,(H(i,7)-.5)*.24],0,.006,.004));
   for(let i=0;i<6;i++)q.push(R(.08,.008,.01,0xf2c230,[(H(i,8)-.5)*.1,.05,(H(i,9)-.5)*.2],[0,H(i,2)*3,0],.003,.002));const m=mg(q);m.rotateY(ry);m.translate(x,.22,0);p.push(m)}
  p.push(CY(.1,.09,.07,WH,[.35,.1,.32],0,undefined,16),CY(.088,.088,.01,0xd8302a,[.35,.135,.32],0,undefined,16));for(let i=0;i<5;i++)p.push(R(.02,.015,.02,0xf28a3a,[.33+H(i,1)*.04,.142,.3+H(i,2)*.04],0,.004,.003))};
 S.dish_chowder=p=>{plate(p,.5,0xf2ece0);p.push(SP(.34,TOAST,[0,.2,0],[1,.72,1],0,22,16),TO(.25,.045,0xb07a3e,[0,.4,0],[PI/2,0,0]),CY(.25,.25,.012,0xf3e3b8,[0,.395,0],0,undefined,24));
  for(let i=0;i<16;i++)p.push(IC(.025,0xf7c948,[-.18+H(i,1)*.36,.405,-.18+H(i,2)*.36],[1,.7,1]));for(let i=0;i<6;i++)p.push(R(.04,.02,.03,0xc0503a,[-.15+H(i,3)*.3,.41,-.15+H(i,4)*.3],0,.006,.004));for(let i=0;i<10;i++)p.push(CY(.007,.007,.04,0x4f9a3a,[-.15+H(i,5)*.3,.412,-.15+H(i,6)*.3],[PI/2,H(i,7)*3,0],undefined,5));
  p.push(SP(.12,TOAST,[.36,.1,.22],[1,.6,1.1],0,14,10),SP(.1,CRUMB,[.36,.15,.22],[1,.3,1.05],0,12,8));steam(p,0,.5,0)};
 S.dish_shortcake=p=>{plate(p,.48,WH,0xf08bb0);const sec=new THREE.Shape(),A=.62;sec.moveTo(0,0);sec.absarc(0,0,.5,-A/2,A/2,false);sec.lineTo(0,0);
  const L=[[0xf2d49a,.08],[0xfaf6ee,.04],[0xf2d49a,.08],[0xfaf6ee,.04],[0xf2d49a,.06]];let y=.04;for(const [c,h] of L){const g=new THREE.ExtrudeGeometry(sec,{depth:h,bevelEnabled:false,curveSegments:10});p.push(pt(g,c,[-.22,y+h,0],[PI/2,0,0]));y+=h}
  for(let i=0;i<4;i++)p.push(pt(new THREE.CylinderGeometry(.04,.04,.015,12,1,false,0,PI),0xe0333f,[-.22+.2+i*.065,.16+(i%2)*.12,-.11+i*.07],[0,0,PI/2]));
  for(let i=0;i<5;i++)p.push(SP(.05,0xfaf6ee,[-.02+i*.06,y+.03,(i-2)*.02],[1,.8,1],0,10,8));strawberry(p,.13,y+.1,0,1.1);p.push(ROD([-.1,.05,.32],[.3,.06,.38],.012,0xd0d4da,6))};
 S.dish_fondue=p=>{plate(p,.55,WH);p.push(CY(.03,.03,.18,0xc0c4ca,[-.12,.12,-.1],0,undefined,6),CY(.03,.03,.18,0xc0c4ca,[.12,.12,-.1],0,undefined,6),CY(.03,.03,.18,0xc0c4ca,[0,.12,.12],0,undefined,6),CY(.05,.05,.06,0xfaf6ee,[0,.06,0],0,undefined,12),CN(.02,.05,0xf6a030,[0,.12,0],0,8));
  bowl(p,.26,.16,0x8a3a2a,0x5a2e1a,.9,0xc87a5a);const lift=mg(p.splice(p.length-3,3));lift.translate(0,.2,0);p.push(lift);
  for(let i=0;i<5;i++){const a=i/5*PI*2+.5,x=Math.cos(a)*.4,z=Math.sin(a)*.4;strawberry(p,x,.1,z,1);if(i===1)p.push(SP(.075,0x5a2e1a,[x,.08,z],[1,.8,1],0,10,8))}
  p.push(ROD([.12,.42,0],[.32,.62,.05],.008,0xc0c4ca,6));strawberry(p,.1,.38,0,.9);p.push(SP(.05,0x5a2e1a,[.1,.36,0],[1,.7,1],0,10,8))};
 S.dish_grapetart=p=>{plate(p,.52,WH,0x8b5cc9);p.push(CY(.42,.4,.1,0xe0a85a,[0,.08,0],0,undefined,28));for(let i=0;i<28;i++){const a=i/28*PI*2;p.push(CY(.03,.03,.11,0xd89a4a,[Math.cos(a)*.42,.085,Math.sin(a)*.42],0,undefined,6))}
  p.push(CY(.38,.38,.012,0xf7ecc8,[0,.13,0],0,undefined,28));for(let r=0;r<4;r++){const n=r?r*7:1;for(let i=0;i<n;i++){const a=i/n*PI*2+r,rr=r*.1;const c=r%2?0x6b3a8a:0x8a4ab0;p.push(SP(.05,c,[Math.cos(a)*rr,.165,Math.sin(a)*rr],[1,.9,1],0,10,8),SP(.014,0xe8d8f8,[Math.cos(a)*rr-.015,.2,Math.sin(a)*rr-.015],0,0,5,4))}}
  leaf(p,.05,.22,0,.8,0x5aae4a,.6);leaf(p,-.02,.22,.03,.7,0x4f9a3a,2.2)};
 S.dish_brownie=p=>{plate(p,.5,WH);const B=[[0,.04,0,.2],[.04,.17,.02,-.15],[-.02,.3,-.02,.5]];for(const [x,y,z,r] of B){p.push(R(.34,.12,.34,CHO,[x,y+.06,z],[0,r,0],.03,.015),R(.32,.02,.32,0x5c3626,[x,y+.12,z],[0,r,0],.03,.01))}
  for(let i=0;i<30;i++)p.push(SP(.01,0xffffff,[-.13+H(i,1)*.26,.435,-.13+H(i,2)*.26],0,0,5,4));for(let i=0;i<4;i++)p.push(IC(.035,0xc89a5a,[-.08+H(i,3)*.16,.44,-.08+H(i,4)*.16],[1.2,.6,1],0,0));
  p.push(TO(.08,.012,0x3a1a10,[.02,.44,0],[PI/2,0,0],undefined,PI*1.4,16))};
 S.dish_avomousse=p=>{plate(p,.36,WH);const q=[[0x6a4a2a,.07],[0x9cc56a,.14],[0x5a3424,.12],[0x9cc56a,.07],[0xfaf6ee,.07]];let y=.04;q.forEach(([c,h],i)=>{const r0=.14+y*.22,r1=.14+(y+h)*.22;p.push(CY(r1,r0,h,c,[0,y+h/2,0],0,undefined,24));y+=h});
  p.push(TO(.14+y*.22,.008,0xeaf6f8,[0,y+.005,0],[PI/2,0,0],undefined,PI*2,32),SP(.1,0xfaf6ee,[0,y+.04,0],[1,.6,1],0,14,10),SP(.06,0xfaf6ee,[0,y+.1,0],[1,.8,1],0,10,8));for(let i=0;i<10;i++)p.push(SP(.008,0x4a2a1c,[-.08+H(i,1)*.16,y+.12,-.08+H(i,2)*.16],0,0,4,3));
  leaf(p,.03,y+.15,0,.7,0x4fae4a,.3);leaf(p,-.02,y+.15,.02,.6,0x5abe5a,2);p.push(ROD([.18,.05,.22],[.4,.06,.05],.012,0xd0d4da,6))};
 S.dish_hotchoc=p=>{plate(p,.45,WH,RED);p.push(LA([[0,.03],[.19,.03],[.22,.39],[.23,.4],[.2,.39],[.175,.06],[0,.06]],RED,[0,0,0],28),CY(.198,.198,.012,0x6a3a22,[0,.35,0],0,undefined,24),TO(.1,.03,RED,[.25,.22,0],[0,0,0],undefined,PI*2,16));
  for(let i=0;i<6;i++)p.push(R(.06,.045,.06,0xfaf6ee,[-.1+H(i,1)*.2,.37,-.1+H(i,2)*.2],[H(i,3),H(i,4),0],.015,.01));chili(p,.2,.06,.3,1.2,-.6);p.push(ROD([-.32,.05,.18],[-.1,.05,.36],.025,0x8a5230,8));steam(p,0,.5,0)};
 S.dish_censertea=p=>{plate(p,.55,0xf2ece0,BRZ);p.push(SP(.2,BRZ,[-.18,.2,-.05],[1,.85,1],0,18,14),SP(.07,0xc89a50,[-.18,.38,-.05],[1,.4,1],0,10,6),SP(.03,GOLD,[-.18,.42,-.05],0,0,8,6),CN(.04,.2,BRZ,[.02,.24,-.05],[0,0,-1.1],8),TO(.1,.02,0x8a5a2a,[-.38,.22,-.05],[0,0,0],undefined,PI*1.4,14));
  p.push(CY(.12,.08,.1,CRM,[.24,.09,.2],0,undefined,18),TO(.12,.006,BRZ,[.24,.14,.2],[PI/2,0,0]),CY(.11,.11,.01,0xd89a3a,[.24,.13,.2],0,undefined,18));censer(p,.3,.05,-.28,.3);for(let i=0;i<3;i++)p.push(SP(.05+i*.012,0xd8c8f0,[.24+Math.sin(i*2)*.04,.22+i*.1,.2],[1,.8,1],0,10,8))};
 S.dish_hallushroom=p=>{p.push(CY(.42,.36,.1,0x2a2c30,[0,.05,0],0,undefined,28),TO(.42,.02,0x3a3d42,[0,.1,0],[PI/2,0,0]),ROD([.42,.08,0],[.75,.12,0],.03,0x5a3a22,8));const C=[0x9a5ad0,0xf28ab8,0x4ac0c0,0xf2c230,0x9a5ad0,0xf28ab8,0x4ac0c0,0x9a5ad0];
  for(let i=0;i<8;i++){const a=i/8*PI*2,r=i?.22:.0,x=Math.cos(a)*r+(i?0:.02),z=Math.sin(a)*r;p.push(SP(.085,C[i],[x,.15,z],[1,.55,1],0,12,8),CY(.025,.03,.06,0xf3ead6,[x,.1,z],0,undefined,8));for(let k=0;k<3;k++)p.push(SP(.014,0xffffff,[x+Math.cos(k*2)*.04,.19,z+Math.sin(k*2)*.04],0,0,5,4))}
  for(let i=0;i<8;i++)p.push(TO(.025,.008,0xd8202a,[-.25+H(i,1)*.5,.15,-.25+H(i,2)*.5],[PI/2,0,0],undefined,PI*2,10));
  const star=(x,y,z,s,c)=>{const st=new THREE.Shape();for(let i=0;i<8;i++){const r=i%2?s*.35:s,a=i/8*PI*2;st[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}const g=new THREE.ExtrudeGeometry(st,{depth:.01,bevelEnabled:false});p.push(pt(g,c,[x,y,z],[-.4,0,0]))};
  star(-.25,.4,.0,.06,0xf7d94a);star(.2,.45,-.1,.045,0xf28ab8);star(.02,.55,.1,.05,0x8ae0e0);star(.3,.32,.18,.035,0xf7d94a)};
 S.dish_purifystew=p=>{p.push(LA([[0,0],[.18,0],[.2,.03],[.4,.14],[.48,.26],[.46,.28],[.37,.16],[.16,.05],[0,.05]],BRZ,[0,0,0],36),TO(.47,.018,GOLD,[0,.27,0],[PI/2,0,0]),TO(.42,.012,GOLD,[0,.19,0],[PI/2,0,0]),CY(.2,.22,.04,0x8a5a2a,[0,.02,0],0,undefined,24));
  p.push(CY(.43,.43,.012,0x5fe0c8,[0,.245,0],0,undefined,36),CY(.28,.28,.013,0x9ff5e2,[0,.247,0],0,undefined,32),CY(.12,.12,.014,0xd8fff4,[0,.249,0],0,undefined,24));censer(p,.12,.24,-.05,.28);censer(p,-.15,.24,.1,.22);
  for(let i=0;i<7;i++){const a=i/7*PI*2;p.push(SP(.03,0xfaf6ee,[Math.cos(a)*.3,.255,Math.sin(a)*.3],[1.4,.25,.8],[0,-a,0],8,4))}for(let i=0;i<9;i++)p.push(SP(.018+H(i,1)*.015,0xc8fff0,[-.3+H(i,2)*.6,.35+H(i,3)*.3,-.2+H(i,4)*.4],0,0,8,6))};
 S.dish_fishercenser=p=>{board(p,1.0,.6,0xb07a4a);fish(p,-.05,.08,-.02,.9,0xc8864a,.15);censer(p,.36,.07,.16,.3);censer(p,.28,.07,-.2,.24);for(let i=0;i<3;i++)p.push(SP(.06+i*.015,0xd8d0e8,[-.1+i*.08,.3+i*.12,-.05],[1,.8,1],0,10,8));
  p.push(pt(new THREE.CylinderGeometry(.09,.09,.04,14,1,false,0,PI),0xf7d94a,[-.42,.1,.22],[PI/2,0,.4]));for(let i=0;i<5;i++)leaf(p,-.3+i*.05,.09,.25,.6,0x4f8a3a,i*.6);p.push(TO(.06,.01,0xc9a86a,[.0,.1,.26],[PI/2,0,0],undefined,PI*2,14))};
 S.dish_feast=p=>{p.push(LA([[0,0],[.45,0],[.5,.02],[.7,.06],[.74,.09],[.7,.095],[.5,.05],[0,.05]],GOLD,[0,0,0],44),TO(.72,.015,0xe8c870,[0,.09,0],[PI/2,0,0],undefined,PI*2,48));
  p.push(SP(.26,0xb5652e,[-.05,.2,0],[1.2,.75,.95],0,18,14),SP(.18,0xc87a3e,[-.05,.3,0],[1,.35,.8],0,14,8));for(const s of[1,-1])p.push(SP(.09,0xb5652e,[.24,.16,s*.16],[1.4,.8,.9],[0,s*.4,0],12,8),ROD([.33,.17,s*.2],[.44,.2,s*.24],.022,0xf3ead6,6),SP(.03,0xf3ead6,[.45,.2,s*.245],0,0,6,5));
  for(let i=0;i<9;i++)p.push(SP(.045,0x6b3a8a,[-.45+(i%3)*.06,.12+((i/3)|0)*.05,.3+((i*7)%3)*.03],0,0,8,6));p.push(ROD([-.4,.25,.32],[-.36,.3,.34],.008,0x4f7a3a,5));
  p.push(SP(.08,0xe0333f,[.45,.13,-.32],0,0,12,10),CY(.008,.008,.04,0x6b4a35,[.45,.22,-.32],0,undefined,5));{const q=[CY(.07,.08,.3,0xe8b23a,[0,0,0],[0,0,PI/2],undefined,12)];for(let i=0;i<5;i++)for(let j=0;j<8;j++){const a=j/8*PI*2;q.push(pt(new THREE.IcosahedronGeometry(.022,0),0xf7c948,[-.12+i*.06,Math.cos(a)*.075,Math.sin(a)*.075]))}const m=mg(q);m.rotateY(.7);m.translate(-.4,.12,-.25);p.push(m)}
  for(let i=0;i<8;i++)leaf(p,.0+Math.cos(i*.8)*.3,.08,.0+Math.sin(i*.8)*.45,.8,i%2?0x4f9a3a:0x6ab45a,i);
  p.push(CY(.06,.03,.06,GOLD,[.0,.43,.0],0,undefined,10),CN(.02,.05,GOLD,[-.035,.48,0],0,5),CN(.02,.05,GOLD,[.035,.48,0],0,5),CN(.02,.06,GOLD,[0,.49,0],0,5),SP(.012,RED,[0,.46,.06],0,0,6,4))};
 S.dish_festcake=p=>{p.push(CY(.36,.4,.08,GOLD,[0,.04,0],0,undefined,32),CY(.06,.08,.14,GOLD,[0,.15,0],0,undefined,16),CY(.46,.42,.04,GOLD,[0,.24,0],0,undefined,36));
  p.push(CY(.42,.42,.3,0xf6e8d8,[0,.41,0],0,undefined,36),CY(.43,.43,.05,0x8b5cc9,[0,.29,0],0,undefined,36));for(let i=0;i<12;i++){const a=i/12*PI*2;p.push(TO(.1,.016,0x8b5cc9,[Math.cos(a)*.425,.5,Math.sin(a)*.425],[0,-a+PI/2,0],undefined,PI,10),SP(.022,GOLD,[Math.cos(a)*.43,.53,Math.sin(a)*.43],0,0,6,5))}
  p.push(CY(.28,.28,.24,0xd8c8f0,[0,.68,0],0,undefined,32),TO(.285,.018,GOLD,[0,.58,0],[PI/2,0,0],undefined,PI*2,40),TO(.285,.018,GOLD,[0,.8,0],[PI/2,0,0],undefined,PI*2,40));for(let i=0;i<10;i++){const a=i/10*PI*2;p.push(SP(.035,0xfaf6ee,[Math.cos(a)*.38,.57,Math.sin(a)*.38],[1,.8,1],0,8,6))}
  censer(p,0,.8,0,.32);for(let i=0;i<4;i++){const a=i/4*PI*2+.4,x=Math.cos(a)*.19,z=Math.sin(a)*.19;p.push(CY(.014,.014,.12,i%2?0xf08bb0:0x8ae0e0,[x,.86,z],0,undefined,6),CN(.014,.04,0xf6a030,[x,.94,z],0,6))}
  for(let i=0;i<14;i++)p.push(SP(.012,i%2?GOLD:0xf7d94a,[-.25+H(i,1)*.5,.81,-.25+H(i,2)*.5],0,0,5,4))};
 for(const [id] of DISHES)try{const p=[];S[id](p);put('ds_'+id,p)}catch(e){console.error('dishes: 그림 실패',id,e)}}
{const _bg=lkBuildGeo;lkBuildGeo=function(){_bg();const b0=Object.assign({},GEO);try{dsModels()}catch(e){console.error('dishes: 64차 모델 실패',e)}try{lkAOnew(b0)}catch(e){}}}

// 모닥불의 각 칸은 가방의 재료 한 개를 예약한다. 완성할 때만 차감한다.
ITEMS.meat??={n:'고기',ty:'res',p:0,nov:1,d:'모닥불 요리에 쓰는 고기'};
if(!ICON.meat)ICON.meat='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#eed6ae" d="M7 39Q5 25 23 14Q44 3 56 19Q64 31 52 42Q40 55 25 56Q10 57 7 45Z"/><path fill="#ac5147" d="M10 37Q9 25 26 16Q43 8 54 21Q60 30 49 39Q35 53 22 51Q10 51 10 37"/><ellipse cx="39" cy="24" rx="8" ry="6" fill="#f4d7b9"/></svg>');
const DISH_RECIPES={
 dish_saltfish:'fish salt', dish_jam:'strawberry sugar', dish_potato:'potato salt pepper',
 dish_corn:'corn salt sugar', dish_avotoast:'wheat avocado salt', dish_tomtoast:'wheat tomato sugar',
 dish_onionring:'onion wheat salt', dish_darkchoc:'cacao sugar salt', dish_steak:'meat salt pepper',
 dish_skewer:'meat chili onion', dish_nachos:'avocado tomato onion corn', dish_chili:'meat tomato chili onion',
 dish_fishchips:'fish potato wheat salt', dish_fishstew:'fish chili potato pepper', dish_mushsoup:'mush potato onion pepper',
 dish_truffle:'mush meat salt pepper', dish_taco:'wheat meat tomato chili', dish_chowder:'corn potato onion salt',
 dish_shortcake:'wheat sugar strawberry', dish_fondue:'cacao sugar strawberry', dish_grapetart:'wheat grape sugar salt',
 dish_brownie:'cacao wheat sugar salt', dish_avomousse:'avocado cacao sugar strawberry', dish_hotchoc:'cacao sugar chili pepper',
 dish_censertea:'mush_censer sugar grape', dish_hallushroom:'mush_censer mush chili pepper',
 dish_purifystew:'mush_censer tomato onion salt', dish_fishercenser:'mush_censer fish avocado salt',
 dish_feast:'meat fish potato tomato onion mush salt pepper',
 dish_festcake:'mush_censer wheat cacao sugar strawberry grape avocado corn'
};
const cookKey=parts=>parts.slice().sort().join(' ');
const dishByParts=new Map(Object.entries(DISH_RECIPES).map(([id,parts])=>[cookKey(parts.split(' ')),id]));
dishByParts.set(cookKey(['grape','sugar']),'dish_jam');
const cookIngredients=new Set(Object.values(DISH_RECIPES).join(' ').split(' '));
const cookSlots=Array(8).fill(null);
function cookResult(slots){
 const ids=slots.filter(Boolean);
 if(ids.length===1&&ITEMS[ids[0]]?.ty==='fish'&&ITEMS['c'+ids[0]])return 'c'+ids[0];
 return dishByParts.get(cookKey(ids.map(id=>ITEMS[id]?.ty==='fish'?'fish':id)));
}
function cookCounts(){
 const counts={};
 for(const id of cookSlots)if(id)counts[id]=(counts[id]||0)+1;
 return counts;
}
function cookPanelHtml(){
 const result=cookResult(cookSlots),counts=cookCounts(),full=cookSlots.every(Boolean);
 const slots=cookSlots.map((id,i)=>id
  ? `<button class="slot" aria-label="${ITEMS[id].n} 빼기" data-a="cookRemove" data-i="${i}">${invIcon(id)}</button>`
  : '<div class="slot bxe" aria-label="빈 재료 칸"></div>').join('');
 const rows=bagList().filter(id=>cookIngredients.has(id)||ITEMS[id].ty==='fish').map(id=>{
  const left=invN(id)-(counts[id]||0);
  return `<div class="row">${invIcon(id)}<div class="tx">${ITEMS[id].n} ×${left}</div><button class="btn g" data-a="cookAdd" data-k="${id}" ${left<=0||full?'disabled':''}>넣기</button></div>`;
 }).join('');
 return `<div class="sec">조리 재료 · ${cookSlots.filter(Boolean).length}/8</div><div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${slots}</div>
 <div class="row"><div class="tx">${result?ITEMS[result].n:full||Object.keys(counts).length?'맞는 요리 조합이 없어요':'가방에서 재료를 골라 주세요'}<small>한 칸에 1개 · 넣은 재료를 누르면 빼요</small></div>
 <button class="btn" data-a="cookFinish" ${result?'':'disabled'}>요리하기</button></div>${rows||'<div class="sec">가방에 조리 재료가 없어요</div>'}`;
}
function cookAction(action,b){
 if(panel!=='cook')return;
 if(action==='cookRemove'){cookSlots[Number(b.dataset.i)]=null;return}
 const counts=cookCounts();
 if(action==='cookAdd'){
  const id=b.dataset.k,i=cookSlots.indexOf(null);
  if(i>=0&&(cookIngredients.has(id)||ITEMS[id]?.ty==='fish')&&invN(id)>(counts[id]||0))cookSlots[i]=id;
  return;
 }
 const result=cookResult(cookSlots);
 if(!result||Object.entries(counts).some(([id,n])=>invN(id)<n))return;
 const remaining=bagList().filter(id=>invN(id)>(counts[id]||0));
 if(!remaining.includes(result)&&remaining.length>=BAG_N){bagFullMsg();return}
 for(const [id,n] of Object.entries(counts))take(id,n);
 give(result,1);cookSlots.fill(null);S.st.cook++;
 S.cdex??={};S.cdex[result]=(S.cdex[result]||0)+1;
 sfx(420,.18,'sawtooth',.03,.7);toast(ITEMS[result].n+' 완성!');save();
}
