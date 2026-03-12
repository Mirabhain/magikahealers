// ═══════════════════════════════════════════════════
// js/loop.js — Main render / animation loop (OPTIMISED)
// ═══════════════════════════════════════════════════
'use strict';

const clock = new THREE.Clock();

// reusable vectors — never allocate inside animate()
const _toPlayer = new THREE.Vector3();
const _moveVec  = new THREE.Vector3();
const _fwdVec   = new THREE.Vector3();
const _rightVec = new THREE.Vector3();

// ── Stars ──
let _starTick = 0;
function tickStars(t) {
  if (++_starTick % 6 !== 0) return; // only update every 6 frames
  const isNight = currentSkyMode === 'night';
  const m0 = allStarMats[0];
  const m1 = allStarMats[1];
  if (isNight) {
    m0.opacity = 0.85 + Math.sin(t * 1.3) * 0.15;
    m1.opacity = 0.75 + Math.sin(t * 2.1 + 1.0) * 0.20;
  } else if (m0.opacity !== 0) {
    m0.opacity = m1.opacity = 0;
  }
}

// ── Lamp flicker ──
let _lampTick = 0;
function tickLamps(t) {
  if (++_lampTick % 6 !== 0) return; // was 3, now 6

  const isNight = currentSkyMode === 'night';

  for (let i = 0; i < _lampZoneLights.length; i++) {
    _lampZoneLights[i].intensity = isNight
      ? 1.8 + Math.sin(t * 2.4 + i * 0.7) * 0.5
      : 0;
  }

  for (let i = 0; i < lampObjects.length; i++) {
    if (lampObjects[i].glow) lampObjects[i].glow.visible = isNight;
  }
}

// ── NPC bob + face player ──
const _npcCache = [];
let _npcCacheDirty = true;
let _npcTick = 0;

function tickNPCs(t) {

  if (_npcCacheDirty) {
    _npcCache.length = 0;
    Object.values(npcObjects).forEach(v => _npcCache.push(v));
    _npcCacheDirty = false;
  }

  const doFacing = (++_npcTick % 4 === 0); // slower: every 4 frames

  for (let i = 0; i < _npcCache.length; i++) {

    const group = _npcCache[i].group;

    group.position.y = 0.6 + Math.sin(t * 1.2 + group._bobOffset) * 0.06;

    if (!doFacing) continue;

    _toPlayer.set(
      pState.pos.x - group.position.x,
      0,
      pState.pos.z - group.position.z
    );

    if (_toPlayer.lengthSq() > 0.01) {

      const angle = Math.atan2(_toPlayer.x, _toPlayer.z);

      group.rotation.y += (angle - group.rotation.y) * 0.08;

      const sick = group._state === 'sick';

      group._auraLight.intensity = sick
        ? 1.2 + Math.sin(t * 2 + group._bobOffset) * 0.5
        : 1.8 + Math.sin(t * 1.5) * 0.4;
    }
  }
}

// ── Tree sway ──
let _treeTick = 0;

function tickTrees(t) {

  if (++_treeTick % 5 !== 0) return; // was 3, now 5

  for (let i = 0; i < trees.length; i++) {

    const tree = trees[i];

    tree.rotation.z = Math.sin(t * 0.6 + tree._sway) * 0.015;
    tree.rotation.x = Math.cos(t * 0.4 + tree._sway) * 0.01;
  }
}

// ── Magic particles ──
const _mp = mpGeo.attributes.position.array;
const PARTICLE_COUNT = 50; // matches world.js
let _particleTick = 0;

function tickParticles() {

  if (++_particleTick % 2 !== 0) return; // only every 2 frames

  for (let i = 0; i < PARTICLE_COUNT; i++) {

    const i3 = i * 3;

    _mp[i3]   += mpVel[i].x;
    _mp[i3+1] += mpVel[i].y;
    _mp[i3+2] += mpVel[i].z;

    if (_mp[i3+1] > 7) {
      _mp[i3+1] = 0;
      _mp[i3]   = (Math.random() - 0.5) * 40;
      _mp[i3+2] = (Math.random() - 0.5) * 40;
    }
  }

  mpGeo.attributes.position.needsUpdate = true;
}

// ── Fireflies ──
let _ffTick = 0;

function tickFireflies(t) {

  if (++_ffTick % 4 !== 0 || !window._ffData) return; // was 3, now 4

  const { pos, vel, phase, geo, mesh } = window._ffData;

  const isNight = currentSkyMode === 'night';

  mesh.material.opacity = isNight ? 0.85 : 0;

  if (!isNight) return;

  const count = pos.length / 3;

  for (let i = 0; i < count; i++) {

    const i3 = i * 3;

    pos[i3]   += vel[i].x;
    pos[i3+1] += vel[i].y + Math.sin(t * 1.1 + phase[i]) * 0.003;
    pos[i3+2] += vel[i].z;

    if (Math.abs(pos[i3]) > 35) vel[i].x *= -1;
    if (pos[i3+1] < 0.2 || pos[i3+1] > 2.4) vel[i].y *= -1;
    if (Math.abs(pos[i3+2]) > 35) vel[i].z *= -1;
  }

  geo.attributes.position.needsUpdate = true;
}

// ── Ritual rings ──
let _ritualTick = 0;

function tickRitual(t) {

  if (++_ritualTick % 4 !== 0 || !window._ritualRings) return;

  const r0 = window._ritualRings[0];
  const r1 = window._ritualRings[1];

  r0.material.opacity = 0.3 + Math.sin(t * 1.8) * 0.12;
  r1.material.opacity = 0.2 + Math.sin(t * 2.4 + 1) * 0.10;

  r0.rotation.z = t * 0.3;
  r1.rotation.z = -t * 0.5;
}

// ── Nearby NPC hint ──
let _hintEl = null;
let _hintTick = 0;

function tickHint() {

  if (++_hintTick % 10 !== 0) return; // was 6, now 10 — UI doesn't need fast updates

  if (!_hintEl) _hintEl = document.getElementById('interact-hint');

  const nearNPC = getNearbyNPC();

  _hintEl.style.display =
    (nearNPC && dialogPhase === 0 && gameRunning) ? 'block' : 'none';

  if (nearNPC) _hintEl.textContent = '[E] Talk to ' + nearNPC.name;
}

// ── FPS limiter — target 45fps to avoid burning CPU at 120fps ──
let _lastTime = 0;
const TARGET_INTERVAL = 1000 / 45; // ~22ms per frame

// ── Main loop ──
function animate(timestamp) {

  requestAnimationFrame(animate);

  // Skip frame if too soon (FPS cap)
  if (timestamp - _lastTime < TARGET_INTERVAL) return;
  _lastTime = timestamp;

  const dt = Math.min(clock.getDelta(), 0.05);
  const t  = clock.getElapsedTime();

  if (gameRunning) updatePlayer(dt);

  tickNPCs(t);
  tickNPCMovement(dt);
  tickTrees(t);
  tickParticles();
  tickVFX();
  tickSkyMode();
  tickStars(t);
  tickLamps(t);
  tickFireflies(t);
  tickRitual(t);
  tickHint();

  renderer.render(scene, camera);
}

animate(0);