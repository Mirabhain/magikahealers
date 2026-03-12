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
// Pre-allocated vectors — never create new THREE.Vector3 inside this function
const _pMove  = new THREE.Vector3();
const _pFwd   = new THREE.Vector3();
const _pRight = new THREE.Vector3();
const _pNp    = new THREE.Vector3();
// Cache NPC positions array so we don't call Object.values() every frame
let _npcPosList = null;

function updatePlayer(dt) {
  if (dialogPhase > 0) return;

  // Rebuild NPC cache if needed (uses same dirty flag as loop.js)
  if (!_npcPosList || _npcCacheDirty) {
    _npcPosList = Object.values(npcObjects).map(o => o.group);
  }

  _pMove.set(0, 0, 0);
  _pFwd.set(-Math.sin(pState.yaw), 0, -Math.cos(pState.yaw));
  _pRight.set( Math.cos(pState.yaw), 0, -Math.sin(pState.yaw));

  if (keys['w'] || keys['W'] || keys['ArrowUp'])    _pMove.addScaledVector(_pFwd,   1);
  if (keys['s'] || keys['S'] || keys['ArrowDown'])  _pMove.addScaledVector(_pFwd,  -1);
  if (keys['a'] || keys['A'] || keys['ArrowLeft'])  _pMove.addScaledVector(_pRight,-1);
  if (keys['d'] || keys['D'] || keys['ArrowRight']) _pMove.addScaledVector(_pRight,  1);

  if (_pMove.lengthSq() > 0) {
    _pMove.normalize().multiplyScalar(pState.speed * dt);
    _pNp.copy(pState.pos).add(_pMove);

    // World bounds
    _pNp.x = Math.max(-WORLD+1, Math.min(WORLD-1, _pNp.x));
    _pNp.z = Math.max(-WORLD+1, Math.min(WORLD-1, _pNp.z));

    // Simple NPC collision
    let blocked = false;
    for (let i = 0; i < _npcPosList.length; i++) {
      if (_pNp.distanceTo(_npcPosList[i].position) < 1.2) { blocked = true; break; }
    }
    if (!blocked) pState.pos.copy(_pNp);
  }

  playerBody.position.copy(pState.pos);

  // Camera
  camera.position.set(pState.pos.x, pState.pos.y + 1.65, pState.pos.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = pState.yaw;
  camera.rotation.x = pState.pitch;
}