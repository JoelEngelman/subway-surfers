import * as THREE from 'three';

const $ = id => document.getElementById(id);
const root = $('game');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b6c2);
scene.fog = new THREE.Fog(0x91b6c2, 45, 180);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 5.6, 10.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x34312c, 2.1));
const sun = new THREE.DirectionalLight(0xffe4bd, 3.5);
sun.position.set(-30, 45, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -55;
sun.shadow.camera.right = 55;
sun.shadow.camera.top = 45;
sun.shadow.camera.bottom = -15;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const mat = {
  track: new THREE.MeshStandardMaterial({ color: 0x30383b, roughness: 0.95 }),
  rail: new THREE.MeshStandardMaterial({ color: 0xbfc2bb, metalness: 0.65, roughness: 0.3 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x624b36, roughness: 1 }),
  red: new THREE.MeshStandardMaterial({ color: 0xd94734, roughness: 0.45 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x26778b, roughness: 0.3 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xffd027, roughness: 0.4 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1c2529, roughness: 0.65 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xb9e6ea, roughness: 0.12, metalness: 0.15 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xe6a57e, roughness: 0.75 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0xef4d37, roughness: 0.7 }),
  pants: new THREE.MeshStandardMaterial({ color: 0x293746, roughness: 0.7 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0xf2f3ed, roughness: 0.6 })
};

function box(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function cylinder(r, h, material, segments = 18) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function laneX(lane) { return (lane - 1) * 2.2; }

// Track
function makeTrack(z) {
  const g = new THREE.Group();
  const bed = box(15, 0.35, 28, mat.track);
  bed.position.set(0, -0.22, z);
  g.add(bed);
  for (const x of [-2.2, 2.2]) {
    const rail = box(0.12, 0.12, 28, mat.rail);
    rail.position.set(x, -0.01, z);
    g.add(rail);
  }
  for (let i = -13; i <= 13; i++) {
    const sleeper = box(6.3, 0.12, 0.32, mat.wood);
    sleeper.position.set(0, -0.06, z + i);
    g.add(sleeper);
  }
  return g;
}
for (let i = 0; i < 11; i++) world.add(makeTrack(-i * 28));

// City
function makeBuilding(x, z) {
  const h = 7 + Math.random() * 13;
  const w = 4 + Math.random() * 4;
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.55, 0.18, 0.18 + Math.random() * 0.12),
    roughness: 0.9
  });
  const b = box(w, h, 5, material);
  b.position.set(x, h / 2 - 1, z);
  world.add(b);
  for (let y = 2; y < h - 1; y += 2.4) {
    const winMat = new THREE.MeshStandardMaterial({ color: 0xffd66d, emissive: 0xffa52c, emissiveIntensity: 0.28 });
    const win = box(0.55, 0.7, 0.08, winMat);
    win.position.set(x + (x > 0 ? -w / 2 - 0.04 : w / 2 + 0.04), y, z + 0.2);
    world.add(win);
  }
}
for (let i = 0; i < 20; i++) {
  makeBuilding(-10 - Math.random() * 5, -20 - i * 17);
  makeBuilding(10 + Math.random() * 5, -20 - i * 17);
}

// Player
const player = new THREE.Group();
scene.add(player);
const torso = box(1.05, 1.5, 0.65, mat.shirt); torso.position.y = 2.15; player.add(torso);
const head = cylinder(0.42, 0.72, mat.skin); head.rotation.x = Math.PI / 2; head.position.y = 3.25; player.add(head);
const hair = cylinder(0.44, 0.25, mat.dark); hair.rotation.x = Math.PI / 2; hair.position.y = 3.55; player.add(hair);
const legL = box(0.36, 1.2, 0.42, mat.pants); legL.position.set(-0.27, 0.78, 0); player.add(legL);
const legR = legL.clone(); legR.position.x = 0.27; player.add(legR);
const shoeL = box(0.5, 0.22, 0.72, mat.shoe); shoeL.position.set(-0.27, 0.16, -0.12); player.add(shoeL);
const shoeR = shoeL.clone(); shoeR.position.x = 0.27; player.add(shoeR);
const armL = box(0.3, 1.25, 0.34, mat.shirt); armL.position.set(-0.72, 2.2, 0); player.add(armL);
const armR = armL.clone(); armR.position.x = 0.72; player.add(armR);
player.position.set(0, 0, 5);

const board = box(2.3, 0.1, 0.48, mat.yellow);
board.position.y = 0.1;
board.visible = false;
player.add(board);

// Objects
const objects = [];
function addObject(type, lane, z) {
  let mesh;
  if (type === 'train') {
    mesh = new THREE.Group();
    const body = box(3.1, 4.3, 8, mat.red); body.position.y = 2.15; mesh.add(body);
    const front = box(2.35, 1.1, 0.18, mat.blue); front.position.set(0, 3.1, 4.1); mesh.add(front);
    for (const x of [-0.78, 0.78]) { const w = box(0.9, 0.7, 0.15, mat.glass); w.position.set(x, 3.15, 4.2); mesh.add(w); }
    const stripe = box(3.15, 0.38, 8, mat.yellow); stripe.position.y = 2.15; mesh.add(stripe);
  } else if (type === 'barrier') {
    mesh = new THREE.Group();
    const b = box(3.2, 1.35, 0.75, mat.red); b.position.y = 0.68; mesh.add(b);
    const stripe = box(2.8, 0.22, 0.8, mat.yellow); stripe.position.y = 0.72; mesh.add(stripe);
    for (const x of [-1.2, 1.2]) { const p = box(0.16, 1.5, 0.16, mat.dark); p.position.set(x, 0.55, 0); mesh.add(p); }
  } else if (type === 'low') {
    mesh = new THREE.Group();
    const b = box(3.4, 0.65, 0.75, mat.yellow); b.position.y = 1.55; mesh.add(b);
    for (const x of [-1.35, 1.35]) { const p = box(0.16, 2, 0.16, mat.dark); p.position.set(x, 0.85, 0); mesh.add(p); }
  } else if (type === 'coin') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20), new THREE.MeshStandardMaterial({ color: 0xffd21f, metalness: 0.7, roughness: 0.2, emissive: 0x664000 }));
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
  } else {
    const colors = { magnet: 0x4dd8ff, jetpack: 0xff673d, sneakers: 0x69e86b, x2: 0xffc51c };
    const g = new THREE.Group();
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), new THREE.MeshStandardMaterial({ color: colors[type], emissive: colors[type], emissiveIntensity: 0.3 }));
    g.add(s); mesh = g;
  }
  mesh.position.set(laneX(lane), (type === 'coin' ? 1.5 : ['magnet','jetpack','sneakers','x2'].includes(type) ? 1.8 : 0), z);
  world.add(mesh);
  objects.push({ type, lane, z, mesh, phase: Math.random() * 10 });
}

function obstaclePattern() {
  const safe = Math.floor(Math.random() * 3);
  const r = Math.random();
  if (r < 0.35) {
    for (let l = 0; l < 3; l++) if (l !== safe) addObject(Math.random() < 0.7 ? 'train' : 'barrier', l, -100);
  } else if (r < 0.65) {
    const l = Math.floor(Math.random() * 3);
    addObject('train', l, -100);
    addObject('barrier', (l + 1) % 3, -116);
  } else {
    addObject(Math.random() < 0.5 ? 'barrier' : 'low', Math.floor(Math.random() * 3), -100);
  }
}
function coinLine() {
  const l = Math.floor(Math.random() * 3);
  for (let i = 0; i < 7; i++) addObject('coin', l, -80 - i * 7);
}
function powerUp() {
  const types = ['magnet', 'jetpack', 'sneakers', 'x2'];
  addObject(types[Math.floor(Math.random() * types.length)], Math.floor(Math.random() * 3), -100);
}

let playing = false;
let lane = 1, targetLane = 1;
let jump = 0, roll = 0, boardTime = 0;
let score = 0, coins = 0, distance = 0, speed = 16;
let power = null, powerLeft = 0;
let obstacleTimer = 1, coinTimer = 0.5, powerTimer = 5;
let best = Number(localStorage.getItem('metro3DBest') || 0);
$('best').textContent = best.toLocaleString();

function resetGame() {
  for (const o of objects) world.remove(o.mesh);
  objects.length = 0;
  playing = true;
  lane = targetLane = 1;
  jump = roll = boardTime = 0;
  score = coins = distance = 0;
  speed = 16;
  power = null; powerLeft = 0;
  obstacleTimer = 0.7; coinTimer = 0.4; powerTimer = 5;
  player.position.set(0, 0, 5);
  player.rotation.set(0, 0, 0);
  board.visible = false;
  $('start').classList.add('hidden');
  $('gameover').classList.add('hidden');
}

function finishGame() {
  if (!playing) return;
  playing = false;
  const final = Math.floor(score);
  const oldBest = best;
  best = Math.max(best, final);
  localStorage.setItem('metro3DBest', best);
  $('finalScore').textContent = final.toLocaleString();
  $('finalCoins').textContent = coins.toLocaleString();
  $('finalDistance').textContent = Math.floor(distance) + 'm';
  $('best').textContent = best.toLocaleString();
  $('newBest').classList.toggle('hidden', final <= oldBest);
  $('gameover').classList.remove('hidden');
}

function control(action) {
  if (!playing) return;
  if (action === 'left') targetLane = Math.max(0, targetLane - 1);
  if (action === 'right') targetLane = Math.min(2, targetLane + 1);
  if (action === 'jump' && jump <= 0 && roll <= 0 && !power) jump = 0.82;
  if (action === 'roll' && jump <= 0 && !power) roll = 0.58;
  if (action === 'board' && boardTime <= 0) { boardTime = 8; board.visible = true; }
}

$('play').addEventListener('click', resetGame);
$('again').addEventListener('click', resetGame);
$('home').addEventListener('click', () => {
  playing = false;
  $('gameover').classList.add('hidden');
  $('start').classList.remove('hidden');
});

addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') control('left');
  else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') control('right');
  else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') control('jump');
  else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') control('roll');
  else if (e.key === ' ') control('board');
});

let touchX = 0, touchY = 0;
renderer.domElement.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
renderer.domElement.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) control('board');
  else if (Math.abs(dx) > Math.abs(dy)) control(dx > 0 ? 'right' : 'left');
  else control(dy < 0 ? 'jump' : 'roll');
}, { passive: true });

function update(dt, time) {
  distance += speed * dt;
  score += speed * dt * (power === 'x2' ? 12 : 6);
  speed = Math.min(34, speed + dt * 0.3);

  lane += (targetLane - lane) * Math.min(1, dt * 14);
  player.position.x = laneX(lane);
  player.rotation.z = (targetLane - lane) * -0.16;

  if (jump > 0) {
    jump = Math.max(0, jump - dt);
    const p = 1 - jump / 0.82;
    player.position.y = Math.sin(p * Math.PI) * 4.1;
  } else player.position.y = 0;
  if (roll > 0) roll = Math.max(0, roll - dt);
  player.rotation.x = roll > 0 ? -0.8 : 0;

  boardTime = Math.max(0, boardTime - dt);
  board.visible = boardTime > 0;
  if (power) { powerLeft -= dt; if (powerLeft <= 0) power = null; }

  obstacleTimer -= dt; coinTimer -= dt; powerTimer -= dt;
  if (obstacleTimer <= 0) { obstaclePattern(); obstacleTimer = Math.max(0.42, 0.85 + Math.random() * 0.4 - (speed - 16) * 0.012); }
  if (coinTimer <= 0) { coinLine(); coinTimer = 1 + Math.random() * 0.6; }
  if (powerTimer <= 0) { powerUp(); powerTimer = 9 + Math.random() * 8; }

  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    o.z += speed * dt;
    o.mesh.position.z = o.z;
    o.mesh.rotation.y += dt * 2.4;
    if (o.type === 'coin' || ['magnet','jetpack','sneakers','x2'].includes(o.type)) {
      o.mesh.position.y = (o.type === 'coin' ? 1.5 : 1.8) + Math.sin(time * 0.004 + o.phase) * 0.18;
    }

    if (o.z > 0.5 && o.z < 8.5 && Math.abs(o.lane - lane) < 0.42) {
      if (o.type === 'coin') {
        coins++;
        score += power === 'x2' ? 200 : 100;
        world.remove(o.mesh); objects.splice(i, 1); continue;
      }
      if (['magnet','jetpack','sneakers','x2'].includes(o.type)) {
        power = o.type; powerLeft = 8;
        world.remove(o.mesh); objects.splice(i, 1); continue;
      }

      const safe = (o.type === 'low' && roll > 0) || (o.type !== 'low' && jump > 0) || power === 'jetpack';
      if (!safe) {
        if (boardTime > 0) {
          boardTime = 0;
          board.visible = false;
          world.remove(o.mesh); objects.splice(i, 1); continue;
        }
        finishGame();
        return;
      }
      world.remove(o.mesh); objects.splice(i, 1); continue;
    }

    if (o.z > 18) { world.remove(o.mesh); objects.splice(i, 1); }
  }

  if (power === 'magnet') {
    for (const o of objects) {
      if (o.type === 'coin' && o.z > -30 && o.z < 9) {
        o.lane = lane;
        o.mesh.position.x = laneX(lane);
      }
    }
  }

  $('distance').textContent = Math.floor(distance);
  $('score').textContent = Math.floor(score).toLocaleString();
  $('coins').textContent = coins.toLocaleString();
  if (power) {
    $('powerHud').classList.remove('hidden');
    $('powerName').textContent = power.toUpperCase();
    $('powerIcon').textContent = { magnet:'🧲', jetpack:'🚀', sneakers:'👟', x2:'2×' }[power];
    $('powerBar').style.width = `${Math.max(0, powerLeft / 8 * 100)}%`;
  } else $('powerHud').classList.add('hidden');

  camera.position.x += (player.position.x * 0.18 - camera.position.x) * dt * 4;
  camera.position.y += ((5.6 + player.position.y * 0.12) - camera.position.y) * dt * 3;
  camera.lookAt(player.position.x * 0.2, 2.1 + player.position.y * 0.12, -25);
}

let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (playing) update(dt, now);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
