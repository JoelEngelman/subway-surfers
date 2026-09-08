import * as THREE from 'three';

const $=id=>document.getElementById(id);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x86b9d2);
scene.fog=new THREE.Fog(0x86b9d2,48,150);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,220);
camera.position.set(0,5.2,10.5);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.BasicShadowMap;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe6f8ff,0x344047,2.2));
const sun=new THREE.DirectionalLight(0xffe5c1,3);
sun.position.set(-25,40,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-8;scene.add(sun);
const world=new THREE.Group();scene.add(world);
const M={
 asphalt:new THREE.MeshStandardMaterial({color:0x252c31,roughness:.9}),concrete:new THREE.MeshStandardMaterial({color:0x687277,roughness:1}),steel:new THREE.MeshStandardMaterial({color:0xaab3b4,metalness:.7,roughness:.3}),wood:new THREE.MeshStandardMaterial({color:0x594733,roughness:1}),red:new THREE.MeshStandardMaterial({color:0xc9342d,roughness:.45}),cyan:new THREE.MeshStandardMaterial({color:0x1c91b9,roughness:.45}),yellow:new THREE.MeshStandardMaterial({color:0xffc928,roughness:.35}),black:new THREE.MeshStandardMaterial({color:0x151b1e,roughness:.7}),skin:new THREE.MeshStandardMaterial({color:0xc98261,roughness:.8}),shirt:new THREE.MeshStandardMaterial({color:0x1685bd,roughness:.65}),pants:new THREE.MeshStandardMaterial({color:0x17283b,roughness:.75}),shoe:new THREE.MeshStandardMaterial({color:0xf2f4ef,roughness:.6}),glass:new THREE.MeshBasicMaterial({color:0x9bdbe6}),coin:new THREE.MeshStandardMaterial({color:0xffd52a,metalness:.75,roughness:.2})};
function box(w,h,d,mat,shadow=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.castShadow=shadow;m.receiveShadow=shadow;return m;}
function cyl(r,h,mat,seg=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.castShadow=true;return m;}
const laneX=l=>(l-1)*2.2;

// Lightweight static track. The old scene had thousands of shadow-casting meshes.
for(let i=0;i<8;i++){
 const z=-i*30,bed=box(14.5,.3,30,M.asphalt);bed.position.set(0,-.22,z);world.add(bed);
 for(const x of [-3.3,-1.1,1.1,3.3]){const r=box(.08,.12,30,M.steel);r.position.set(x,-.01,z);world.add(r);}
 for(let j=-12;j<=12;j+=2){const s=box(7,.1,.28,M.wood);s.position.set(0,-.03,z+j);world.add(s);}
 for(const x of [-5.1,5.1]){const c=box(.65,.5,30,M.concrete);c.position.set(x,-.05,z);world.add(c);}
}
function building(x,z,side){const h=8+Math.random()*11,w=5+Math.random()*3.5;const mat=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.55,.16,.2+Math.random()*.09),roughness:.9});const b=box(w,h,6,mat);b.position.set(x,h/2-1,z);world.add(b);const wm=new THREE.MeshBasicMaterial({color:0xf2c96b});for(let y=2;y<h-1;y+=2.8){const row=box(w*.65,.38,.04,wm);row.position.set(x,y,z+(side<0?3.02:-3.02));world.add(row);}}
for(let i=0;i<13;i++){building(-10.5-Math.random()*4,-15-i*20,-1);building(10.5+Math.random()*4,-15-i*20,1);}

// Player
const player=new THREE.Group();player.position.set(0,0,5);scene.add(player);const body=new THREE.Group();player.add(body);
const torso=box(1,1.45,.64,M.shirt,true);torso.position.y=2.12;body.add(torso);const jacket=box(1.06,.15,.68,M.cyan);jacket.position.y=2.5;body.add(jacket);
const head=cyl(.43,.72,M.skin,16);head.rotation.x=Math.PI/2;head.position.y=3.28;body.add(head);const hair=cyl(.45,.24,M.black,16);hair.rotation.x=Math.PI/2;hair.position.y=3.56;body.add(hair);
const legL=box(.35,1.2,.4,M.pants,true),legR=legL.clone();legL.position.set(-.25,.76,0);legR.position.set(.25,.76,0);body.add(legL,legR);
const shoeL=box(.52,.23,.76,M.shoe,true),shoeR=shoeL.clone();shoeL.position.set(-.25,.16,-.16);shoeR.position.set(.25,.16,-.16);body.add(shoeL,shoeR);
const armL=box(.29,1.18,.34,M.shirt,true),armR=armL.clone();armL.position.set(-.7,2.12,0);armR.position.set(.7,2.12,0);body.add(armL,armR);
const board=box(2.3,.1,.48,M.yellow);board.position.y=.11;board.visible=false;player.add(board);

function makeTrain(){const g=new THREE.Group();const b=box(3.05,4.2,7.8,M.red,true);b.position.y=2.1;g.add(b);const roof=box(3.15,.2,8,M.steel);roof.position.y=4.25;g.add(roof);const stripe=box(3.08,.38,7.9,M.yellow);stripe.position.y=2.2;g.add(stripe);const front=box(2.4,1.15,.12,M.cyan);front.position.set(0,3.05,3.96);g.add(front);for(const x of [-.78,.78]){const w=box(.8,.6,.06,M.glass);w.position.set(x,3.1,4.04);g.add(w);}return g;}
function makeBarrier(){const g=new THREE.Group(),b=box(2.8,1.1,.7,M.red,true);b.position.y=.7;g.add(b);const s=box(2.65,.18,.72,M.yellow);s.position.y=.73;g.add(s);for(const x of [-1.2,1.2]){const p=box(.14,1.45,.14,M.black);p.position.set(x,.5,0);g.add(p);}return g;}
function makeLow(){const g=new THREE.Group(),t=box(3.2,.58,.7,M.yellow,true);t.position.y=1.55;g.add(t);for(const x of [-1.3,1.3]){const p=box(.15,2,.15,M.black);p.position.set(x,.8,0);g.add(p);}return g;}
const objects=[];
function addObject(type,l,z){let mesh;if(type==='train')mesh=makeTrain();else if(type==='barrier')mesh=makeBarrier();else if(type==='low')mesh=makeLow();else if(type==='coin'){mesh=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.1,12),M.coin);mesh.rotation.z=Math.PI/2;}else{const colors={magnet:0x48d9ff,jetpack:0xff653f,sneakers:0x65e86d,x2:0xffc91e};mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.58),new THREE.MeshStandardMaterial({color:colors[type],emissive:colors[type],emissiveIntensity:.45}));}mesh.position.set(laneX(l),type==='coin'?1.5:(['magnet','jetpack','sneakers','x2'].includes(type)?1.75:0),z);world.add(mesh);objects.push({type,l,z,mesh,phase:Math.random()*6});}
function spawnObstacle(){const safe=Math.floor(Math.random()*3),r=Math.random();if(r<.34){for(let l=0;l<3;l++)if(l!==safe)addObject(Math.random()<.65?'train':'barrier',l,-105);}else if(r<.6){const l=Math.floor(Math.random()*3);addObject('train',l,-105);addObject('barrier',(l+1)%3,-125);}else addObject(Math.random()<.5?'barrier':'low',Math.floor(Math.random()*3),-105);}
function spawnCoins(){const l=Math.floor(Math.random()*3);for(let i=0;i<7;i++)addObject('coin',l,-72-i*7);}
let playing=false,lane=1,targetLane=1,jump=0,roll=0,boardTime=0,score=0,coins=0,distance=0,speed=17,obstacleTimer=.8,coinTimer=.8,powerTimer=6;
let best=Number(localStorage.getItem('metro3DBest')||0);$('best').textContent=best.toLocaleString();
function clearObjects(){for(const o of objects)world.remove(o.mesh);objects.length=0;}
function resetGame(){clearObjects();playing=true;lane=targetLane=1;jump=roll=boardTime=0;score=coins=distance=0;speed=17;obstacleTimer=.8;coinTimer=.6;powerTimer=6;player.position.set(0,0,5);player.rotation.set(0,0,0);board.visible=false;$('start').classList.add('hidden');$('gameover').classList.add('hidden');}
function finishGame(){if(!playing)return;playing=false;const final=Math.floor(score),old=best;best=Math.max(best,final);localStorage.setItem('metro3DBest',best);$('finalScore').textContent=final.toLocaleString();$('finalCoins').textContent=coins.toLocaleString();$('finalDistance').textContent=Math.floor(distance)+'m';$('best').textContent=best.toLocaleString();$('newBest').classList.toggle('hidden',final<=old);$('gameover').classList.remove('hidden');}
function control(a){if(!playing)return;if(a==='left')targetLane=Math.max(0,targetLane-1);if(a==='right')targetLane=Math.min(2,targetLane+1);if(a==='jump'&&jump<=0&&roll<=0)jump=.82;if(a==='roll'&&jump<=0)roll=.58;if(a==='board'&&boardTime<=0){boardTime=8;board.visible=true;}}
$('play').onclick=resetGame;$('again').onclick=resetGame;$('home').onclick=()=>{playing=false;$('gameover').classList.add('hidden');$('start').classList.remove('hidden');clearObjects();};
addEventListener('keydown',e=>{if(e.repeat)return;if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')control('left');else if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')control('right');else if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')control('jump');else if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')control('roll');else if(e.code==='Space')control('board');});
let touchX=0,touchY=0;addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))control(dx>0?'right':'left');else control(dy<0?'jump':'roll');},{passive:true});
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.033);if(playing){speed=Math.min(30,speed+dt*.55);distance+=speed*dt*.55;score+=speed*dt*1.6;lane+=(targetLane-lane)*Math.min(1,dt*14);player.position.x=laneX(lane);if(jump>0){jump-=dt;const t=1-jump/.82;player.position.y=Math.sin(t*Math.PI)*2.15;}else if(roll>0){roll-=dt;player.position.y=.15;}else player.position.y=0;const run=Math.sin(performance.now()*.012*speed/17);legL.rotation.x=run*.75;legR.rotation.x=-run*.75;armL.rotation.x=-run*.6;armR.rotation.x=run*.6;boardTime=Math.max(0,boardTime-dt);if(boardTime===0)board.visible=false;obstacleTimer-=dt;coinTimer-=dt;powerTimer-=dt;if(obstacleTimer<=0){spawnObstacle();obstacleTimer=Math.max(.8,1.4-speed*.018)+Math.random()*.3;}if(coinTimer<=0){spawnCoins();coinTimer=3+Math.random()*2;}if(powerTimer<=0){powerTimer=10+Math.random()*7;}
 for(let i=objects.length-1;i>=0;i--){const o=objects[i];o.z+=speed*dt;o.mesh.position.z=o.z;if(o.type==='coin')o.mesh.rotation.y+=dt*7;else if(['magnet','jetpack','sneakers','x2'].includes(o.type))o.mesh.rotation.y+=dt*2;const dz=Math.abs(o.z-player.position.z),dl=Math.abs(o.l-lane);if(dz<2.4&&dl<.48){if(o.type==='coin'){coins++;score+=50;world.remove(o.mesh);objects.splice(i,1);continue;}if(dz<1.8&&jump<.15&&roll<.15&&boardTime<=0){finishGame();break;}}if(o.z>18){world.remove(o.mesh);objects.splice(i,1);}}
 $('score').textContent=Math.floor(score).toLocaleString();$('coins').textContent=coins.toLocaleString();$('distance').textContent=Math.floor(distance).toLocaleString();}
camera.position.x+=(laneX(lane)*.14-camera.position.x)*Math.min(1,dt*5);camera.lookAt(camera.position.x*.22,2,-34);renderer.render(scene,camera);}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
