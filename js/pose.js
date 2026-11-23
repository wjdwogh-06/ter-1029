/* Weapon coordinates are in each mesh's own space (forward +Z).
   Grip, supporting palm, bore, kick, recovery time. */
const weaponPose={
 pistol: [[0,-.17,-.07],[.045,-.20,-.045],[0,.065,.525],.060,.17],
 smg:    [[0,-.15,-.09],[0,-.10,.47],[0,.07,.85],.038,.10],
 ar:     [[0,-.16,-.13],[0,.0,.49],[0,.08,1.355],.052,.13],
 burst:  [[0,-.19,.24],[0,-.04,.51],[0,.03,1.11],.047,.11],
 rifle:  [[0,-.03,-.22],[0,.0,.29],[0,.10,1.30],.085,.23],
 sniper: [[0,-.15,-.22],[0,-.01,.28],[0,.08,1.745],.12,.32],
 shotgun:[[0,-.14,-.24],[0,-.025,.26],[.043,.06,.742],.13,.28],
 crossbow:[[0,-.06,-.32],[0,-.035,.13],[0,.075,.4],.026,.14],
 chainsaw:[[0,.12,-.21],[0,.32,.02],null,0,0]
};
const rigFit={
 hero:{side:.62,drop:.29,reach:.57,scale:.84},
 dog: {side:.68,drop:.28,reach:.57,scale:.72},
 plat:{side:.74,drop:.32,reach:.62,scale:.70}
};
const v3=()=>new THREE.Vector3(),quat=()=>new THREE.Quaternion();
const poseMath={shoulder:v3(),elbow:v3(),hand:v3(),axis:v3(),pole:v3(),bend:v3(),goal:v3(),target:v3(),
 from:v3(),to:v3(),parentQ:quat(),delta:quat(),worldQ:quat(),orient:quat(),euler:new THREE.Euler(0,0,0,'YXZ')};
function turnArm(bone,tip,target){
 const m=poseMath;
 bone.getWorldPosition(m.from);tip.getWorldPosition(m.to).sub(m.from).normalize();
 m.from.subVectors(target,m.from).normalize();
 m.delta.setFromUnitVectors(m.to,m.from);
 bone.getWorldQuaternion(m.worldQ).premultiply(m.delta);
 bone.parent.getWorldQuaternion(m.parentQ);
 bone.quaternion.copy(m.parentQ.invert()).multiply(m.worldQ);
}
function reachGrip(bones,side,target,yaw){
 const m=poseMath,upper=bones['upperarm'+side],lower=bones['lowerarm'+side],end=bones['handslot'+side];
 upper.getWorldPosition(m.shoulder);lower.getWorldPosition(m.elbow);end.getWorldPosition(m.hand);
 const a=m.shoulder.distanceTo(m.elbow),b=m.elbow.distanceTo(m.hand);
 m.axis.subVectors(target,m.shoulder);
 const distance=Math.max(Math.abs(a-b)+.0001,Math.min(a+b-.0001,m.axis.length()));
 m.axis.normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),sign=side==='r'?-1:1;
 m.pole.set(sign*.65*Math.cos(yaw),-.95,-sign*.65*Math.sin(yaw));
 m.pole.addScaledVector(m.axis,-m.pole.dot(m.axis)).normalize();
 m.bend.copy(m.shoulder).addScaledVector(m.axis,along).addScaledVector(m.pole,Math.sqrt(Math.max(0,a*a-along*along)));
 turnArm(upper,lower,m.bend);
 m.goal.copy(m.shoulder).addScaledVector(m.axis,distance);
 turnArm(lower,end,m.goal);
}
// Both palms constrain the same rigid object. Choose a reachable grip before
// bending either elbow, using the live pose and the lengths of this rig.
const gripBounds={right:v3(),left:v3(),temp:v3(),offset:v3()};
function armReach(bones,side,center){
 const t=gripBounds.temp;
 bones['upperarm'+side].getWorldPosition(center);
 bones['lowerarm'+side].getWorldPosition(t);
 const upper=center.distanceTo(t);
 return upper+t.distanceTo(bones['handslot'+side].getWorldPosition(poseMath.elbow))-.002;
}
function fitBothPalms(bones,profile,scale,orientation,target){
 const b=gripBounds,right=armReach(bones,'r',b.right),left=armReach(bones,'l',b.left);
 b.offset.fromArray(profile[1]).sub(b.temp.fromArray(profile[0])).multiplyScalar(scale).applyQuaternion(orientation);
 b.left.sub(b.offset);
 for(let i=0;i<6;i++){
  target.sub(b.left).clampLength(0,left).add(b.left);
  target.sub(b.right).clampLength(0,right).add(b.right);
 }
}
function beginWeaponShot(actor,id,dx,dz){
 const shot={id,yaw:Math.atan2(dx,dz),time:performance.now(),ends:[]};
 actor.lastWeaponShot=shot;actor.pendingWeaponShot=shot;return shot;
}
function restoreGrip(actor){
 if(!actor)return;
 if(actor.gripHolder){
  if(actor.gripHolder.id===actor.wid){
   actor.holder.quaternion.copy(actor.gripHolder.q);actor.holder.position.copy(actor.gripHolder.p);
  }
  actor.gripHolder=null;
 }
 if(!actor.savedGrip)return;
 for(const [bone,q] of actor.savedGrip)bone.quaternion.copy(q);
 actor.savedGrip=null;
}
function saveGrip(actor,bones){
 const tracked=actor.gripCache;
 if(!tracked||tracked[0][0]!==bones.upperarmr)
  actor.gripCache=[bones.upperarmr,bones.lowerarmr,bones.upperarml,bones.lowerarml].map(b=>[b,quat()]);
 for(const [b,q] of actor.gripCache)q.copy(b.quaternion);
 actor.savedGrip=actor.gripCache;
}
const toolGripY={axe:0,pick_adv:-.16,pick_elec:.13,dhammer:-.14,grenade:.04};
const rodGrip=[[0,0,-.12],[.10,-.18,.11],null,0,0];
function placeHeldWeapon(actor,dt){
 const id=actor.wid,rod=isRod(id),profile=weaponPose[id]||(rod&&fishing&&fishing.st!=='cast'?rodGrip:null),model=actor.holder.children[0];
 const fit=rigFit[actor.dog?actor.dog.v:'hero'],bones=actor.dog?actor.dog.B:boneMap(actor);
 if(id==='fist'&&actor.cur.includes('Attack')){
  saveGrip(actor,bones);
  const phase=Math.min(1,(actor.curA.time/actor.curA.timeScale)/.34);
  const extent=Math.sin(phase*Math.PI)**2;
  const side=actor.punchLeft?'l':'r',hand=poseMath.target;
  actor.root.worldToLocal(bones['upperarm'+side].getWorldPosition(hand));
  hand.x*=.72;hand.y-=.11;hand.z+=.16+extent*.56;
  reachGrip(bones,side,actor.root.localToWorld(hand),actor.root.rotation.y);
  return;
 }
 if(!model)return;
 const scale=fit.scale*(ITEMS[id].hs||1);
 if(!profile){
  // Keep cast, throw and tool swing clips attached to the actual palm.
 
  if(id in toolGripY||isRod(id)){
   model.scale.setScalar(scale);model.position.set(0,-(toolGripY[id]||0)*scale,0);
   if((id==='dhammer'||id==='pick_adv')&&actor.cur==='2H_Melee_Attack_Chop'){
    saveGrip(actor,bones);
    model.updateWorldMatrix(true,false);
    reachGrip(bones,'l',model.localToWorld(poseMath.target.set(0,.19,0)),actor.root.rotation.y);
   }
  }
  return;
 }
 const shot=actor.lastWeaponShot,age=shot&&shot.id===id?(performance.now()-shot.time)/1000:Infinity;
 const aiming=RJ.aim||inp.aiming||age<.28,saw=id==='chainsaw';
 const lift=actor.weaponLift=age<.06?1:THREE.MathUtils.lerp(actor.weaponLift||0,aiming?1:0,1-Math.exp(-dt*15));
 const yaw=rod?actor.root.rotation.y:age<.12?shot.yaw:RJ.aim?Math.atan2(RJ.ax,RJ.az):actor.root.rotation.y;
 const kick=age<profile[4]?profile[3]*Math.sin(Math.min(1,age/.035)*Math.PI/2)*Math.pow(1-age/profile[4],2):0;
 const m=poseMath,side=fit.side*(id==='pistol'?.48:1);
 const shoulder=bones.upperarmr.getWorldPosition(m.shoulder);
 const center=actor.root.worldToLocal(m.target.copy(shoulder));
 const span=Math.abs(center.x)||.30;
 const cycle=actor.curA?actor.curA.time:0;
 const thrust=saw&&actor.cur.includes('Attack')?Math.sin(Math.min(1,cycle/.35)*Math.PI)*.13:0;
 const target=actor.root.localToWorld(center.set(-side*span,center.y-fit.drop*(1-.72*lift),fit.reach*span+.12+thrust-kick));
 saveGrip(actor,bones);
 const holder=actor.holder;
 const rest=actor.holderRest||(actor.holderRest={q:quat(),p:v3()});
 rest.id=id;rest.q.copy(holder.quaternion);rest.p.copy(holder.position);actor.gripHolder=rest;
 let pitch=(saw?.11:.32)*(1-lift)-kick*1.2;
 if(rod){
  const reel=fishing.st==='reel'&&inp.fire;
  pitch=fishing.st==='bite'?.10*Math.sin(fishing.t*22):reel?-.24+.07*Math.sin(fishing.t*9):-.04;
  rodGrip[1][1]=-.18+(reel?.045*Math.sin(fishing.t*13):0);
  rodGrip[1][2]=.11+(reel?.045*Math.cos(fishing.t*13):0);
 }
 m.orient.setFromEuler(m.euler.set(pitch,yaw,0,'YXZ'));
 fitBothPalms(bones,profile,scale,m.orient,target);
 reachGrip(bones,'r',target,yaw);
 holder.parent.getWorldQuaternion(m.parentQ);
 holder.quaternion.copy(m.parentQ.invert()).multiply(m.orient);holder.position.set(0,0,0);
 model.scale.setScalar(scale);model.position.fromArray(profile[0]).multiplyScalar(-scale);
 model.updateWorldMatrix(true,false);
 model.localToWorld(m.target.fromArray(profile[1]));
 reachGrip(bones,'l',m.target,yaw);
}

/* Short travelling streaks and a two-colour flash. Reuse the meshes on mobile. */
const shotFX={streaks:[],flame:null,life:0,origin:v3()};
function makeShotMesh(geo,color){
 const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,fog:false,depthWrite:false}));
 mesh.visible=false;scene.add(mesh);return mesh;
}
function showShot(actor,shot){
 const profile=weaponPose[shot.id],model=actor.holder.children[0];
 if(!model||!profile||!profile[2]||actor.wid!==shot.id)return;
 const fx=shotFX,origin=model.localToWorld(fx.origin.fromArray(profile[2])),bolt=shot.id==='crossbow';
 for(const end of shot.ends){
  let streak=fx.streaks.find(s=>!s.mesh.visible);
  if(!streak){
   if(fx.streaks.length>=32)continue;
   streak={mesh:makeShotMesh(new THREE.BoxGeometry(1,1,1),0xffda8e),start:v3(),dir:v3()};
   fx.streaks.push(streak);
  }
  streak.start.copy(origin);streak.dir.subVectors(end,origin);streak.distance=streak.dir.length();
  streak.dir.normalize();streak.speed=bolt?48:210;streak.length=bolt?.39:shot.ends.length>1?.85:2.2;
  streak.travel=0;streak.width=bolt?.034:.027;
  streak.mesh.material.color.setHex(bolt?0x99714f:0xffda8e);
  streak.mesh.visible=true;streak.mesh.position.copy(origin);streak.mesh.lookAt(end);
  advanceStreak(streak,.002);
 }
 if(bolt)return;
 if(!fx.flame){
  const geo=new THREE.ConeGeometry(1,1,7);geo.translate(0,.5,0);geo.rotateX(Math.PI/2);
  fx.flame=makeShotMesh(geo,0xff9c32);
  const core=makeShotMesh(geo,0xfff2af);fx.flame.add(core);core.visible=true;core.scale.set(.60,.60,.75);
 }
 fx.life=.048;fx.flame.visible=true;fx.flame.position.copy(origin);model.getWorldQuaternion(fx.flame.quaternion);
 const power=profile[3];fx.flame.scale.set(.042+power*.52,.042+power*.52,.16+power*2.2);
 flashL.visible=true;flashL.position.copy(origin);flashL.userData.t=.045;
}
function advanceStreak(s,dt){
 s.travel+=s.speed*dt;
 const tail=Math.max(0,s.travel-s.length),head=Math.min(s.distance,s.travel);
 if(tail>=head){s.mesh.visible=false;return}
 s.mesh.position.copy(s.start).addScaledVector(s.dir,(head+tail)/2);
 s.mesh.scale.set(s.width,s.width,head-tail);
}
{const update=updPlayer;updPlayer=function(dt){restoreGrip(P.a);return update.apply(this,arguments)}}
{const update=updEnv;updEnv=function(dt){
 const actor=P.a;
 // Paused frames can still update the animal skeleton.
 restoreGrip(actor);update.apply(this,arguments);
 for(const s of shotFX.streaks)if(s.mesh.visible)advanceStreak(s,dt);
 if(shotFX.flame&&shotFX.flame.visible){
  shotFX.life-=dt;shotFX.flame.visible=shotFX.life>0;
 }
 if(!actor||mode!=='play')return;
 const shot=actor.pendingWeaponShot;actor.pendingWeaponShot=null;
 if(P.dead||!actor.holder.visible||(!shot&&/Death|PickUp|Interact|Hit_|Sit_|Throw/.test(actor.cur)))return;
 placeHeldWeapon(actor,dt);
 if(shot)showShot(actor,shot);
}}

/* Transient, resonant body, mechanism and a short reflection mixed into one
   cached buffer per sound. Rapid fire only needs a single playback node. */
const weaponSound={
 pistol:[175,.14,.36],smg:[210,.095,.28],ar:[150,.16,.37],burst:[183,.13,.33],
 rifle:[119,.24,.40],sniper:[87,.37,.46],shotgun:[99,.29,.43],crossbow:[330,.13,.19]
};
const shotBuffers=new Map();
function synthWeaponSound(ctx,id){
 const [hz,decay,level]=weaponSound[id],rate=ctx.sampleRate;
 const buffer=ctx.createBuffer(1,Math.ceil(rate*(decay*2+.06)),rate),samples=buffer.getChannelData(0);
 const delay=Math.round(rate*.053),bolt=id==='crossbow';
 let low=0,phase=0;
 for(let i=0;i<samples.length;i++){
  const t=i/rate,noise=Math.random()*2-1;low+=(noise-low)*.17;
  phase+=2*Math.PI*hz*(.62+1.55*Math.exp(-t/.024))/rate;
  const crack=(noise-low)*Math.exp(-t/(bolt?.002:.013));
  const body=(bolt?Math.sin(phase)*.75:low*1.55+Math.sin(phase)*.55)*Math.exp(-t/(decay*.24));
  const action=t>.035?(noise-low)*.19*Math.exp(-(t-.035)/.009):0;
  samples[i]=level*(crack+body+action)*Math.min(1,t/.0008)+(i>=delay?samples[i-delay]*(bolt?.055:.17):0);
 }
 return buffer;
}
{const previous=shotSfx;shotSfx=function(id){
 if(!weaponSound[id])return previous(id);
 if(!opt.snd)return;
 try{
  AC=AC||new(window.AudioContext||window.webkitAudioContext)();
  if(AC.state==='suspended')AC.resume();
  if(!shotBuffers.has(id))shotBuffers.set(id,synthWeaponSound(AC,id));
  const voice=AC.createBufferSource();voice.buffer=shotBuffers.get(id);
  voice.playbackRate.value=.97+Math.random()*.06;voice.connect(audioOutput());
  voice.onended=()=>voice.disconnect();voice.start();
 }catch(e){previous(id)}
}}

function toolSwing(id){
 if(id==='dhammer'||id==='pick_adv')return '2H_Melee_Attack_Chop';
 if(id==='axe'||id==='chainsaw')return '1H_Melee_Attack_Slice_Diagonal';
 return '1H_Melee_Attack_Chop';
}
