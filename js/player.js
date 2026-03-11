// ═══════════════════════════════════════════════════
// js/player.js  —  Player movement & camera control
// ═══════════════════════════════════════════════════
'use strict';

const playerBody = new THREE.Group();
scene.add(playerBody);

const pState = {
  pos:      new THREE.Vector3(0, 0, 6),
  yaw:      0,   // horizontal look (mouse L/R)
  pitch:    0,   // vertical look   (mouse U/D)
  speed:    6,
  onGround: true,
};

// ── Pointer Lock ──
const canvas3dEl = document.getElementById('c3d');
let pointerLocked = false;

canvas3dEl.addEventListener('click', () => {
  if (gameRunning && dialogPhase === 0) canvas3dEl.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas3dEl;
});
document.addEventListener('mousemove', e => {
  if (!pointerLocked || dialogPhase > 0) return;
  pState.yaw   -= e.movementX * 0.002;
  pState.pitch -= e.movementY * 0.002;
  pState.pitch  = Math.max(-0.5, Math.min(0.8, pState.pitch));
});

// ── Keyboard ──
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;

  // E / Space → interact (not during casting)
  if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && gameRunning && dialogPhase !== 2) {
    e.preventDefault();
    handleInteract();
  }

  // Spell hotkeys (fallback for no camera)
  if (gameRunning && dialogPhase === 2) {
    const map = { q:'water', w:'earth', z:'light', r:'heat' };
    const k = e.key.toLowerCase();
    if (map[k]) { e.preventDefault(); castSpell(map[k]); }
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// ── Update player position each frame ──
function updatePlayer(dt) {
  if (dialogPhase > 0) return;

  const move  = new THREE.Vector3();
  const fwd   = new THREE.Vector3(-Math.sin(pState.yaw), 0, -Math.cos(pState.yaw));
  const right = new THREE.Vector3( Math.cos(pState.yaw), 0, -Math.sin(pState.yaw));

  if (keys['w'] || keys['W'] || keys['ArrowUp'])    move.addScaledVector(fwd,   1);
  if (keys['s'] || keys['S'] || keys['ArrowDown'])  move.addScaledVector(fwd,  -1);
  if (keys['a'] || keys['A'] || keys['ArrowLeft'])  move.addScaledVector(right,-1);
  if (keys['d'] || keys['D'] || keys['ArrowRight']) move.addScaledVector(right,  1);

  if (move.length() > 0) {
    move.normalize().multiplyScalar(pState.speed * dt);
    const np = pState.pos.clone().add(move);

    // World bounds
    np.x = Math.max(-WORLD+1, Math.min(WORLD-1, np.x));
    np.z = Math.max(-WORLD+1, Math.min(WORLD-1, np.z));

    // Simple NPC collision
    let blocked = false;
    Object.values(npcObjects).forEach(({ group }) => {
      if (np.distanceTo(group.position) < 1.2) blocked = true;
    });
    if (!blocked) pState.pos.copy(np);
  }

  playerBody.position.copy(pState.pos);

  // Camera
  camera.position.set(pState.pos.x, pState.pos.y + 1.65, pState.pos.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = pState.yaw;
  camera.rotation.x = pState.pitch;
}