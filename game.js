import * as THREE from 'three';

const $ = id => document.getElementById(id);
const root = $('game');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86b9d2);
scene.fog = new THREE.Fog(0x86b9d2, 55, 210);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 320);
camera.position.set(0, 5.6, 10.8);
camera.lookAt(0, 2.1, -32);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff6ff, 0x29343a, 2.0));
const sun = new THREE.DirectionalLight(0xffe4bf, 4.2);
sun.position.set(-35, 55, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -55;
sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const M = {
  asphalt: new THREE.MeshStandardMaterial({color:0x252c31,roughness:.86}),
  concrete: new THREE.MeshStandardMaterial({color:0x737c80,roughness:.9}),
  steel: new THREE.MeshStandardMaterial({color:0xaeb8b9,metalness:.8,roughness:.25}),
  railDark: new THREE.MeshStandardMaterial({color:0x343b3d,metalness:.55,roughness:.4}),
  wood: new THREE.MeshStandardMaterial({color:0x584532,roughness:1}),
  red: new THREE.MeshStandardMaterial({color:0xc9342d,roughness:.38,metalness:.12}),
  redDark: new THREE.MeshStandardMaterial({color:0x731d23,roughness:.45}),
  cyan: new THREE.MeshStandardMaterial({color:0x2ca9c2,roughness:.28,metalness:.2}),
  yellow: new THREE.MeshStandardMaterial({color:0xffca28,roughness:.32,metalness:.2}),
  black: new THREE.MeshStandardMaterial({color:0x12191d,roughness:.5}),
  glass: new THREE.MeshPhysicalMaterial({color:0x9bdbe6,roughness:.08,metalness:.2,transmission:.15,transparent:true,opacity:.92}),
  skin: new THREE.MeshStandardMaterial({color:0xc98261,roughness:.72}),
  shirt: new THREE.MeshStandardMaterial({color:0x1685bd,roughness:.58}),
  pants: new THREE.MeshStandardMaterial({color:0x17283b,roughness:.65}),
  shoe: new THREE.MeshStandardMaterial({color:0xf2f4ef,roughness:.5})
};

function box(w,h,d,mat,shadow=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);if(shadow){m.castShadow=true;m.receiveShadow=true;}return m;}
function cyl(r,h,mat,seg=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.castShadow=true;m.receiveShadow=true;return m;}
function laneX(l){return (l-1)*2.2;}

// ---------------- WORLD ----------------
function trackSegment(z){
  const g=new THREE.Group();
  const bed=box(14.5,.32,30,M.asphalt);bed.position.y=-.22;bed.position.z=z;g.add(bed);
  for(const x of [-4.4,-2.2,0,2.2,4.4]){const sleeper=box(.16,.11,6.2,M.wood);sleeper.position.set(x,-.03,z);sleeper.rotation.y=Math.PI/2;g.add(sleeper);}
  for(const x of [-3.3,-1.1,1.1,3.3]){const rail=box(.09,.13,30,M.steel);rail.position.set(x,-.01,z);g.add(rail);}
  for(const x of [-5.2,5.2]){const curb=box(.7,.55,30,M.concrete);curb.position.set(x,-.05,z);g.add(curb);}
  return g;
}
for(let i=0;i<12;i++)world.add(trackSegment(-i*30));

function building(x,z,side){
  const h=8+Math.random()*16,w=5+Math.random()*5,d=7+Math.random()*5;
  const hue=side<0?.58:.54;
  const material=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(hue,.22,.19+Math.random()*.12),roughness:.82,metalness:.04});
  const g=new THREE.Group();
  const b=box(w,h,d,material);b.position.y=h/2-1;g.add(b);
  const roof=box(w+.25,.22,d+.25,M.steel);roof.position.y=h-.88;g.add(roof);
  for(let y=1.8;y<h-1;y+=2.15){
    for(let j=0;j<Math.max(2,Math.floor(w/1.5));j++){
      const wm=new THREE.MeshStandardMaterial({color:Math.random()>.2?0xf7c96d:0x8bd9e7,emissive:0x6b4b16,emissiveIntensity:.18});
      const win=box(.48,.72,.045,wm);
      win.position.set(-w/2+.8+j*1.25,y,side<0?d/2+.03:-d/2-.03);
      g.add(win);
    }
  }
  g.position.set(x,0,z);world.add(g);
}
for(let i=0;i<28;i++){building(-10.5-Math.random()*6,-15-i*17,-1);building(10.5+Math.random()*6,-15-i*17,1);}

function streetLamp(z,x){
  const g=new THREE.Group();
  const pole=box(.13,5.3,.13,M.black);pole.position.y=2.5;g.add(pole);
  const arm=box(1.15,.13,.13,M.black);arm.position.set(x<0?.48:-.48,5.0,0);g.add(arm);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.16,12,12),new THREE.MeshStandardMaterial({color:0xfff0ae,emissive:0xffb82e,emissiveIntensity:2}));bulb.position.set(x<0?1:-1,4.82,0);g.add(bulb);
  g.position.set(x,0,z);world.add(g);
}
for(let i=0;i<30;i++){streetLamp(-i*12-4,-5.5);streetLamp(-i*12-10,5.5);}

// Distant overhead bridge / skyline silhouettes
for(let i=0;i<8;i++){
  const z=-45-i*42;
  const bridge=box(19,.8,1.2,M.concrete);bridge.position.set(0,6.7,z);world.add(bridge);
  for(const x of [-8,-4,4,8]){const p=box(.45,6,.45,M.concrete);p.position.set(x,3.0,z);world.add(p);}
}

// ---------------- PLAYER ----------------
const player=new THREE.Group();scene.add(player);player.position.set(0,0,5);
const body=new THREE.Group();player.add(body);
const torso=box(1.0,1.45,.64,M.shirt);torso.position.y=2.12;body.add(torso);
const jacket=box(1.08,.16,.69,M.cyan);jacket.position.set(0,2.48,0);body.add(jacket);
const head=cyl(.43,.72,M.skin,24);head.rotation.x=Math.PI/2;head.position.y=3.28;body.add(head);
const hair=cyl(.45,.25,M.black,24);hair.rotation.x=Math.PI/2;hair.position.y=3.57;body.add(hair);
const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.045,10,10),new THREE.MeshBasicMaterial({color:0xffffff}));eyeL.position.set(-.14,3.28,.39);body.add(eyeL);const eyeR=eyeL.clone();eyeR.position.x=.14;body.add(eyeR);
const legL=box(.35,1.2,.4,M.pants),legR=legL.clone();legL.position.set(-.25,.76,0);legR.position.set(.25,.76,0);body.add(legL,legR);
const shoeL=box(.52,.23,.78,M.shoe),shoeR=shoeL.clone();shoeL.position.set(-.25,.16,-.16);shoeR.position.set(.25,.16,-.16);body.add(shoeL,shoeR);
const armL=box(.29,1.18,.34,M.shirt),armR=armL.clone();armL.position.set(-.7,2.12,0);armR.position.set(.7,2.12,0);body.add(armL,armR);
const board=box(2.35,.1,.5,M.yellow);board.position.y=.11;board.visible=false;player.add(board);
const boardGlow=box(1.5,.035,.58,new THREE.MeshStandardMaterial({color:0x59e9ff,emissive:0x20cfff,emissiveIntensity:1.5}));boardGlow.position.y=.17;boardGlow.visible=false;player.add(boardGlow);

// ---------------- OBJECTS ----------------
const objects=[];
function train(){
  const g=new THREE.Group();
  const body=box(3.05,4.4,8.2,M.red);body.position.y=2.2;g.add(body);
  const roof=box(3.18,.22,8.35,M.steel);roof.position.y=4.43;g.add(roof);
  const stripe=box(3.12,.42,8.25,M.yellow);stripe.position.y=2.25;g.add(stripe);
  const front=box(2.45,1.28,.18,M.cyan);front.position.set(0,3.12,4.18);g.add(front);
  for(const x of [-.8,.8]){const w=box(.88,.68,.1,M.glass);w.position.set(x,3.2,4.3);g.add(w);}
  for(const x of [-1.05,1.05]){const light=new THREE.Mesh(new THREE.SphereGeometry(.12,12,12),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2}));light.position.set(x,1.05,4.22);g.add(light);}
  for(const x of [-1.08,1.08]){const wheel=cyl(.38,.3,M.black,18);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.42,2.5);g.add(wheel);}
  return g;
}
function barrier(){
  const g=new THREE.Group();const base=box(3.05,.28,.82,M.black);base.position.y=.12;g.add(base);
  const b=box(2.8,1.15,.68,M.red);b.position.y=.78;g.add(b);const s=box(2.65,.2,.72,M.yellow);s.position.y=.82;g.add(s);
  for(const x of [-1.2,1.2]){const p=box(.15,1.5,.15,M.black);p.position.set(x,.55,0);g.add(p);}return g;
}
function low(){const g=new THREE.Group();const top=box(3.25,.62,.7,M.yellow);top.position.y=1.55;g.add(top);for(const x of [-1.3,1.3]){const p=box(.16,2,.16,M.black);p.position.set(x,.85,0);g.add(p);}return g;}
function coin(){const m=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.12,24),new THREE.MeshStandardMaterial({color:0xffd52a,metalness:.85,roughness:.16,emissive:0x704500,emissiveIntensity:.3}));m.rotation.z=Math.PI/2;m.castShadow=true;return m;}
function power(type){const colors={magnet:0x48d9ff,jetpack:0xff653f,sneakers:0x65e86d,x2:0xffc91e};const g=new THREE.Group();const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),new THREE.MeshStandardMaterial({color:colors[type],emissive:colors[type],emissiveIntensity:.65,metalness:.2,roughness:.2}));g.add(outer);const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.055,8,24),new THREE.MeshBasicMaterial({color:colors[type],transparent:true,opacity:.8}));g.add(ring);return g;}
function addObject(type,l,z){let mesh;if(type==='train')mesh=train();else if(type==='barrier')mesh=barrier();else if(type==='low')mesh=low();else if(type==='coin')mesh=coin();else mesh=power(type);mesh.position.set(laneX(l),type==='coin'?1.55:['magnet','jetpack','sneakers','x2'].includes(type)?1.8:0,z);world.add(mesh);objects.push({type,l,z,mesh,phase:Math.random()*10});}

function obstaclePattern(){const safe=Math.floor(Math.random()*3),r=Math.random();if(r<.3){for(let l=0;l<3;l++)if(l!==safe)addObject(Math.random()<.65?'train':'barrier',l,-105);}else if(r<.54){const l=Math.floor(Math.random()*3);addObject('train',l,-105);addObject('barrier',(l+1)%3,-126);}else if(r<.78){addObject(Math.random()<.5?'barrier':'low',Math.floor(Math.random()*3),-105);}else{const l=Math.floor(Math.random()*3);addObject('train',l,-105);addObject('train',(l+2)%3,-135);}}
function coinLine(){const l=Math.floor(Math.random()*3);for(let i=0;i<8;i++)addObject('coin',l,-80-i*7);}
function spawnPower(){const types=['magnet','jetpack','sneakers','x2'];addObject(types[Math.floor(Math.random()*4)],Math.floor(Math.random()*3),-105);}

let playing=false,lane=1,targetLane=1,jump=0,roll=0,boardTime=0;
let score=0,coins=0,distance=0,speed=17,powerActive=null,powerLeft=0;
let obstacleTimer=.8,coinTimer=.35,powerTimer=6;
let best=Number(localStorage.getItem('metro3DBest')||0);$('best').textContent=best.toLocaleString();

function clearObjects(){for(const o of objects)world.remove(o.mesh);objects.length=0;}
function resetGame(){clearObjects();playing=true;lane=targetLane=1;jump=roll=boardTime=0;score=coins=distance=0;speed=17;powerActive=null;powerLeft=0;obstacleTimer=.7;coinTimer=.35;powerTimer=5;player.position.set(0,0,5);player.rotation.set(0,0,0);board.visible=false;boardGlow.visible=false;$('start').classList.add('hidden');$('gameover').classList.add('hidden');}
function finishGame(){if(!playing)return;playing=false;const final=Math.floor(score),old=best;best=Math.max(best,final);localStorage.setItem('metro3DBest',best);$('finalScore').textContent=final.toLocaleString();$('finalCoins').textContent=coins.toLocaleString();$('finalDistance').textContent=Math.floor(distance)+'m';$('best').textContent=best.toLocaleString();$('newBest').classList.toggle('hidden',final<=old);$('gameover').classList.remove('hidden');}
function control(a){if(!playing)return;if(a==='left')targetLane=Math.max(0,targetLane-1);if(a==='right')targetLane=Math.min(2,targetLane+1);if(a==='jump'&&jump<=0&&roll<=0&&!powerActive)jump=.82;if(a==='roll'&&jump<=0)roll=.58;if(a==='board'&&boardTime<=0){boardTime=8;board.visible=true;boardGlow.visible=true;}}

$('play').addEventListener('click',resetGame);$('again').addEventListener('click',resetGame);$('home').addEventListener('click',()=>{playing=false;$('gameover').classList.add('hidden');$('start').classList.remove('hidden');});
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')control('left');else if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')control('right');else if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')control('jump');else if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')control('roll');else if(e.key===' ')control('board');});
let tx=0,ty=0;renderer.domElement.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});renderer.domElement.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.max(Math.abs(dx),Math.abs(dy))<30)control('board');else if(Math.abs(dx)>Math.abs(dy))control(dx>0?'right':'left');else control(dy<0?'jump':'roll')},{passive:true});

function collect(o){if(o.type==='coin'){coins++;score+=powerActive==='x2'?200:100;return true;}if(['magnet','jetpack','sneakers','x2'].includes(o.type)){powerActive=o.type;powerLeft=8;return true;}return false;}
function update(dt,time){
  if(!playing)return;
  distance+=speed*dt;score+=speed*dt*(powerActive==='x2'?12:6);speed=Math.min(35,speed+dt*.28);
  lane+=(targetLane-lane)*Math.min(1,dt*12);player.position.x=laneX(lane);
  if(jump>0){jump=Math.max(0,jump-dt);const p=1-jump/.82;player.position.y=Math.sin(p*Math.PI)*3.8;}else player.position.y=0;
  if(roll>0)roll=Math.max(0,roll-dt);
  player.rotation.z=(targetLane-lane)*-.1;player.rotation.x=roll?.55:0;
  const run=Math.sin(time*speed*.17);
  legL.rotation.x=run*.65;legR.rotation.x=-run*.65;armL.rotation.x=-run*.5;armR.rotation.x=run*.5;
  body.position.y=roll?-.65:Math.abs(Math.sin(time*speed*.17))*.04;
  body.rotation.x=roll?-1.15:0;
  boardTime=Math.max(0,boardTime-dt);board.visible=boardTime>0;boardGlow.visible=boardTime>0;
  if(powerActive){powerLeft-=dt;if(powerLeft<=0)powerActive=null;}
  obstacleTimer-=dt;coinTimer-=dt;powerTimer-=dt;
  if(obstacleTimer<=0){obstaclePattern();obstacleTimer=Math.max(.5,.82-Math.min(.22,(speed-17)*.012)+Math.random()*.3);}
  if(coinTimer<=0){coinLine();coinTimer=.95+Math.random()*.6;}
  if(powerTimer<=0){spawnPower();powerTimer=10+Math.random()*8;}
  for(let i=objects.length-1;i>=0;i--){
    const o=objects[i];o.z+=speed*dt;o.mesh.position.z=o.z;
    const collectible=o.type==='coin'||['magnet','jetpack','sneakers','x2'].includes(o.type);
    if(collectible){o.mesh.rotation.y+=dt*3;o.mesh.rotation.x=Math.sin(time*2+o.phase)*.18;o.mesh.position.y=(o.type==='coin'?1.55:1.8)+Math.sin(time*3+o.phase)*.14;}
    if(o.z>-1&&o.z<8.5&&Math.abs(o.l-lane)<.34){
      if(collectible){if(o.type==='coin'&&powerActive==='magnet'){/* handled below */}else if(collect(o)){world.remove(o.mesh);objects.splice(i,1);continue;}}
      else {const safe=(o.type==='low'&&roll>0)||(o.type!=='low'&&jump>0)||(boardTime>0)||(powerActive==='jetpack');if(safe){if(boardTime>0&&o.type!=='low'){boardTime=0;board.visible=false;boardGlow.visible=false;}world.remove(o.mesh);objects.splice(i,1);continue;}finishGame();return;}
    }
    if(o.z>20){world.remove(o.mesh);objects.splice(i,1);}
  }
  if(powerActive==='magnet'){for(const o of objects)if(o.type==='coin'&&o.z>-15&&o.z<25){o.l=targetLane;o.mesh.position.x=laneX(targetLane);}}
  $('distance').textContent=Math.floor(distance);$('score').textContent=Math.floor(score).toLocaleString();$('coins').textContent=coins.toLocaleString();
  if(powerActive){$('powerHud').classList.remove('hidden');$('powerName').textContent=powerActive.toUpperCase();$('powerIcon').textContent={magnet:'🧲',jetpack:'🚀',sneakers:'👟',x2:'2×'}[powerActive];$('powerBar').style.width=(powerLeft/8*100)+'%';}else $('powerHud').classList.add('hidden');
  // Stable chase camera. No orbiting / no per-frame camera roll.
  camera.position.x+=(player.position.x*.16-camera.position.x)*Math.min(1,dt*4.5);
  camera.position.y+=(5.65+player.position.y*.08-camera.position.y)*Math.min(1,dt*3.5);
  camera.position.z=10.8;
  camera.lookAt(player.position.x*.08,2.05+player.position.y*.08,-34);
}

let last=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.035,(now-last)/1000);last=now;update(dt,now*.001);renderer.render(scene,camera);}
animate(last);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
