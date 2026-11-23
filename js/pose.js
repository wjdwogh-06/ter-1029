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
 chainsaw:[[0,.26,-.19],[0,.30,.055],null,0,0]
};
// Radii in the avatar's local coordinates. Hands are intentionally excluded.
const carryFit={
 hero:{gripX:.31,forward:.40,scale:.85,body:[['chest',0,1.05,0,.32,.54,.26],['head',0,1.76,0,.38,.39,.32]]},
 dog:{gripX:.35,forward:.39,scale:.76,body:[['hips',0,.68,0,.48,.52,.43],['chest',0,1.04,.02,.40,.32,.36],['head',0,1.67,.02,.49,.46,.46],['head',0,1.49,.40,.22,.14,.23]]},
 plat:{gripX:.38,forward:.42,scale:.76,body:[['hips',0,.65,0,.54,.54,.47],['chest',0,1.02,.02,.43,.37,.42],['head',0,1.64,0,.49,.45,.44],['head',0,1.46,.53,.29,.12,.32]]}
};
const toolPose={
 axe:[[0,-.10,0],null],grenade:[[0,.04,0],null],
 pick_adv:[[0,-.16,0],[0,.13,0]],pick_elec:[[0,.08,0],[0,.33,0]],dhammer:[[0,-.14,0],[0,.16,0]]
};
const rodPose=[[0,0,-.12],null];
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
// Cache small boxes covering each mesh. A long stock and a wide crossbow
// limb then have different clearance without checking every vertex per frame.
const carryBoxes=new WeakMap();
function equipmentBounds(geometry){
 if(!geometry)return [];
 if(carryBoxes.has(geometry))return carryBoxes.get(geometry);
 const cells=new Map(),p=v3(),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  p.fromBufferAttribute(positions,i);
  const key=[p.x,p.y,p.z].map(n=>Math.floor(n/.14)).join(',');
  if(!cells.has(key))cells.set(key,new THREE.Box3());
  cells.get(key).expandByPoint(p);
 }
 const boxes=Array.from(cells.values(),box=>({center:box.getCenter(v3()),radius:box.getSize(v3()).length()*.5}));
 carryBoxes.set(geometry,boxes);return boxes;
}
const clearPoint=v3(),localRotation=quat(),inverseRoot=quat();
const carryRootInverse=new THREE.Matrix4(),bodyTransform=new THREE.Matrix4();
function movingBody(actor,bones,fit){
 if(actor.carryBody?.fit!==fit){
  const rest=actor.dog?actor.dog.RIG.W:dgRest();
  actor.carryBody={fit,parts:fit.body.map(([name,x,y,z,rx,ry,rz])=>({
   bone:bones[name],inverse:rest[name].clone().invert(),center:v3().set(x,y,z),
   radii:[rx,ry,rz],position:v3(),extent:v3()
  }))};
 }
 carryRootInverse.copy(actor.root.matrixWorld).invert();
 for(const part of actor.carryBody.parts){
  part.bone.updateWorldMatrix(true,false);
  bodyTransform.multiplyMatrices(carryRootInverse,part.bone.matrixWorld).multiply(part.inverse);
  part.position.copy(part.center).applyMatrix4(bodyTransform);
  const e=bodyTransform.elements,[x,y,z]=part.radii;
  part.extent.set(Math.hypot(e[0]*x,e[4]*y,e[8]*z),Math.hypot(e[1]*x,e[5]*y,e[9]*z),Math.hypot(e[2]*x,e[6]*y,e[10]*z));
 }
 return actor.carryBody.parts;
}
function clearEquipment(actor,bones,model,fit,profile,scale,orientation,target){
 const points=equipmentBounds(model.geometry),body=movingBody(actor,bones,fit);
 actor.root.getWorldQuaternion(inverseRoot).invert();
 localRotation.copy(inverseRoot).multiply(orientation);
 let offset=0,forward=0;
 for(const box of points){
  const p=clearPoint.copy(box.center);
  p.x-=profile[0][0];p.y-=profile[0][1];p.z-=profile[0][2];
  p.multiplyScalar(scale).applyQuaternion(localRotation).add(target);
  const pad=box.radius*scale+.015;
  for(const part of body){
   const {x,y,z}=part.position,{x:rx,y:ry,z:rz}=part.extent;
   const slice=1-((p.y-y)/(ry+pad))**2-((p.z-z)/(rz+pad))**2;
   if(slice>0)offset=Math.max(offset,p.x-x+(rx+pad)*Math.sqrt(slice));
   const frontSlice=1-((p.x-x)/(rx+pad))**2-((p.y-y)/(ry+pad))**2;
   if(frontSlice>0)forward=Math.max(forward,z-p.z+(rz+pad)*Math.sqrt(frontSlice));
  }
 }
 if(forward<offset)target.z+=forward;else target.x-=offset;
}
// The shoulder can roll forward to meet the grip. Restore the animated
// shoulder positions before the next mixer tick, just like the elbow angles.
function bringSupportShoulderForward(actor,bones){
 const shoulder=bones.upperarml,point=poseMath.hand;
 actor.root.worldToLocal(shoulder.getWorldPosition(point));
 const pivot=bones.chest.getWorldPosition(poseMath.elbow);
 actor.root.worldToLocal(pivot);
 const x=point.x-pivot.x,z=point.z-pivot.z;
 // Roll the supporting shoulder across the front of the chest; preserve
 // its radius about the spine and the original two arm segment lengths.
 const angle=actor.dog?1.10:.62,c=Math.cos(angle),s=Math.sin(angle);
 point.x=pivot.x+c*x-s*z;point.z=pivot.z+s*x+c*z;
 shoulder.position.copy(shoulder.parent.worldToLocal(actor.root.localToWorld(point)));
}
function leadShoulder(bones,side,target){
 const upper=bones['upperarm'+side],lower=bones['lowerarm'+side],end=bones['handslot'+side],m=poseMath;
 upper.getWorldPosition(m.shoulder);lower.getWorldPosition(m.elbow);end.getWorldPosition(m.hand);
 const length=m.shoulder.distanceTo(m.elbow)+m.elbow.distanceTo(m.hand);
 m.axis.subVectors(target,m.shoulder);
 const extra=m.axis.length()-length*.96;
 if(extra<=0)return;
 m.shoulder.addScaledVector(m.axis.normalize(),extra);
 upper.position.copy(upper.parent.worldToLocal(m.shoulder));
}
function beginWeaponShot(actor,id,dx,dz){
 const shot={id,yaw:Math.atan2(dx,dz),time:performance.now(),ends:[]};
 actor.lastWeaponShot=shot;actor.pendingWeaponShot=shot;return shot;
}
function restoreGrip(actor){
 if(!actor)return;
 if(actor.stanceYaw!==undefined){actor.root.rotation.y=actor.stanceYaw;actor.stanceYaw=undefined}
 if(actor.gripHolder){
  if(actor.gripHolder.id===actor.wid){
   actor.holder.quaternion.copy(actor.gripHolder.q);actor.holder.position.copy(actor.gripHolder.p);
  }
  actor.gripHolder=null;
 }
 if(!actor.savedGrip)return;
 for(const [bone,q,p] of actor.savedGrip){bone.quaternion.copy(q);bone.position.copy(p)}
 actor.savedGrip=null;
}
function saveGrip(actor,bones){
 const tracked=actor.gripCache;
 if(!tracked||tracked[0][0]!==bones.upperarmr)
  actor.gripCache=[bones.upperarmr,bones.lowerarmr,bones.upperarml,bones.lowerarml].map(b=>[b,quat(),v3()]);
 for(const [b,q,p] of actor.gripCache){q.copy(b.quaternion);p.copy(b.position)}
 actor.savedGrip=actor.gripCache;
}
function placeHeldWeapon(actor,dt){
 const id=actor.wid,rod=isRod(id),profile=weaponPose[id]||toolPose[id]||(rod?rodPose:null),model=actor.holder.children[0];
 const fit=carryFit[actor.dog?actor.dog.v:'hero'],bones=actor.dog?actor.dog.B:boneMap(actor);
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
 if(!model||!profile)return;
 const gun=!!weaponPose[id]&&id!=='chainsaw',twoHands=!!profile[1]&&id!=='pistol';
 const shot=actor.lastWeaponShot,age=shot&&shot.id===id?(performance.now()-shot.time)/1000:Infinity;
 const aiming=gun&&(RJ.aim||inp.aiming||age<.28);
 const lift=actor.weaponLift=age<.06?1:THREE.MathUtils.lerp(actor.weaponLift||0,aiming?1:0,1-Math.exp(-dt*15));
 const heading=actor.root.rotation.y;
 const yaw=age<.12?shot.yaw:aiming&&RJ.aim?Math.atan2(RJ.ax,RJ.az):heading;
 const inward=twoHands?.52:.23;
 actor.stanceYaw=heading;
 const angleToAim=Math.atan2(Math.sin(yaw-heading),Math.cos(yaw-heading));
 actor.root.rotation.y+=(angleToAim-inward)*lift;
 const bearing=yaw+inward*(1-lift);
 const kick=age<profile[4]?profile[3]*Math.sin(Math.min(1,age/.035)*Math.PI/2)*(1-age/profile[4])**2:0;
 const m=poseMath,scale=fit.scale*(ITEMS[id].hs||1);
 const swing=actor.cur.includes('Attack')?Math.sin(Math.PI*Math.min(1,(actor.curA.time/actor.curA.timeScale)/.34)):0;
 let pitch=.06*(1-lift)-kick;
 if(toolPose[id]&&id!=='grenade')pitch=.32+swing*1.08;
 if(id==='chainsaw')pitch=.12-swing*.15;
 if(rod){
  pitch=-.04;
  if(typeof fishing!=='undefined'&&fishing){
   if(fishing.st==='cast')pitch=-.9+1.18*Math.sin(Math.min(1,fishing.t/fishing.T)*Math.PI*.5);
   if(fishing.st==='reel')pitch=-.2+.08*Math.sin(fishing.t*9);
   if(fishing.st==='bite')pitch+=.09*Math.sin(fishing.t*22);
  }
 }
 m.orient.setFromEuler(m.euler.set(pitch,bearing,0,'YXZ'));
 const shoulderHeight=actor.root.worldToLocal(bones.upperarmr.getWorldPosition(m.target)).y;
 const target=m.target.set(-fit.gripX,shoulderHeight-.20+.08*lift,fit.forward+.05*swing-kick*.45);
 clearEquipment(actor,bones,model,fit,profile,scale,m.orient,target);
 actor.root.localToWorld(target);
 saveGrip(actor,bones);
 leadShoulder(bones,'r',target);
 reachGrip(bones,'r',target,actor.root.rotation.y);
 const holder=actor.holder;
 const rest=actor.holderRest||(actor.holderRest={q:quat(),p:v3()});
 rest.id=id;rest.q.copy(holder.quaternion);rest.p.copy(holder.position);actor.gripHolder=rest;
 holder.parent.getWorldQuaternion(m.parentQ);
 holder.quaternion.copy(m.parentQ.invert()).multiply(m.orient);holder.position.set(0,0,0);
 model.scale.setScalar(scale);model.position.fromArray(profile[0]).multiplyScalar(-scale);
 model.updateWorldMatrix(true,false);
 if(twoHands){
  bringSupportShoulderForward(actor,bones);
  model.localToWorld(m.target.fromArray(profile[1]));
  leadShoulder(bones,'l',m.target);reachGrip(bones,'l',m.target,actor.root.rotation.y);
 }
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
 if(P.dead||!actor.holder.visible||(!shot&&/Death|PickUp|Interact|Hit_|Sit_/.test(actor.cur)))return;
 if(actor.cur==='Throw'&&!isRod(actor.wid))return;
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
