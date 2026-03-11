// ═══════════════════════════════════════════════════
// js/vfx.js  —  Spell visual effects (ring, orbs, column)
// ═══════════════════════════════════════════════════
'use strict';

// ── Spell Ring ──
const ringGeo = new THREE.TorusGeometry(1, 0.08, 8, 40);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xC026D3, transparent: true, opacity: 0 });
const spellRing = new THREE.Mesh(ringGeo, ringMat);
spellRing.rotation.x = Math.PI / 2;
scene.add(spellRing);
let ringT = 0, ringActive = false;

// ── Burst Orbs ──
const orbs = [];
for (let i = 0; i < 14; i++) {
  const om = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const oo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 5), om);
  scene.add(oo);
  orbs.push({ mesh: oo, angle: (i / 14) * Math.PI * 2, t: 0, active: false });
}

// ── Healing Column ──
const colGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16, 1, true);
const colMat = new THREE.MeshBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0, side: THREE.DoubleSide });
const healCol = new THREE.Mesh(colGeo, colMat);
healCol.position.y = 4;
scene.add(healCol);
let healColT = 0, healColActive = false;

// ── Fire a spell VFX at an NPC group ──
function fireSpellVFX(color, npcGroup, big = false) {
  const p = npcGroup.position;

  // Ring
  spellRing.position.set(p.x, 0.1, p.z);
  ringMat.color.setHex(color);
  ringMat.opacity = 1;
  spellRing.scale.set(0.1, 0.1, 0.1);
  ringT = 0; ringActive = true;

  // Orbs
  orbs.forEach((orb, i) => {
    orb.mesh.material.color.setHex(color);
    orb.mesh.material.opacity = 1;
    orb.mesh.position.set(p.x, 0.3, p.z);
    orb.active = true; orb.t = 0;
    orb.angle = (i / orbs.length) * Math.PI * 2;
  });

  // Particle flash
  mpMesh.material.color.setHex(color);
  setTimeout(() => mpMesh.material.color.setHex(0x8B5CF6), 1000);

  // Healing column (on full heal)
  if (big) {
    healCol.position.set(p.x, 4, p.z);
    colMat.color.setHex(color);
    colMat.opacity = 0.4;
    healColT = 0; healColActive = true;
  }
}

// ── Tick VFX each frame (called from render loop) ──
function tickVFX() {
  // Ring expand & fade
  if (ringActive) {
    ringT += 0.06;
    spellRing.scale.set(0.5 + ringT*4, 0.5 + ringT*4, 0.5 + ringT*4);
    ringMat.opacity = Math.max(0, 1 - ringT);
    if (ringT >= 1) { ringMat.opacity = 0; ringActive = false; }
  }

  // Orbs burst outward
  orbs.forEach(orb => {
    if (!orb.active) return;
    orb.t += 0.05;
    const sp = spellRing.position;
    orb.mesh.position.set(
      sp.x + Math.cos(orb.angle) * orb.t * 5,
      0.3  + orb.t * 2.5,
      sp.z + Math.sin(orb.angle) * orb.t * 5
    );
    orb.mesh.material.opacity = Math.max(0, 1 - orb.t);
    if (orb.t >= 1) { orb.active = false; orb.mesh.material.opacity = 0; }
  });

  // Heal column fade
  if (healColActive) {
    healColT += 0.02;
    colMat.opacity = Math.max(0, 0.4 - healColT * 0.4);
    if (healColT >= 1) { colMat.opacity = 0; healColActive = false; }
  }
}