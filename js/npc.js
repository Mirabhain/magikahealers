// ═══════════════════════════════════════════════════
// js/npc.js  —  GLB NPC loading + movement AI
// GLB models only — no box fallback meshes
// Behaviours: stay | wander | patrol
// ═══════════════════════════════════════════════════
'use strict';

const npcObjects = {}; // id → { group, data }

// ══════════════════════════════════════════════════
// SPRITE HELPER  (sick / healed label above NPC)
// ══════════════════════════════════════════════════
function makeTextSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle    = color || '#ffcc00';
  ctx.font         = 'bold 34px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(1.2, 0.6, 1);
  return sp;
}

// ══════════════════════════════════════════════════
// REGISTER NPC  —  creates the group, lights, sprites
// and wires up movement behaviour state.
// Called once per NPC entry in NPCS_DATA.
// The actual 3D model is loaded separately below.
// ══════════════════════════════════════════════════
function registerNPC(data) {
  const g = new THREE.Group();

  // Aura ring (ground glow)
  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 1.1, 24),
    new THREE.MeshBasicMaterial({ color: 0xC026D3, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.05;
  g.add(auraRing);
  g._auraRing = auraRing;

  // Aura light — dummy object (no GPU point light, saves perf)
  // Has .intensity and .position so existing code never crashes
  const auraLight = { intensity: 1.5, position: { x:0, y:1.0, z:0 } };
  g._auraLight = auraLight;

  // Sick sprite
  const sickSp = makeTextSprite('😷 !', '#ff4444');
  sickSp.position.set(0, 2.4, 0);
  g.add(sickSp);
  g._sickSprite = sickSp;

  // Healed sprite
  const healSp = makeTextSprite('✅', '#22ff88');
  healSp.position.set(0, 2.4, 0);
  healSp.visible = false;
  g.add(healSp);
  g._healSprite = healSp;

  // Core state
  g._state     = 'sick';
  g._bobOffset = Math.random() * Math.PI * 2;
  g._walkPhase = Math.random() * Math.PI * 2;
  g._walkSpeed = 1.8 + Math.random() * 0.8;

  // Leg refs — will point to GLB bones/meshes after model loads,
  // used by walk animation. Initialised as null so tickNPCMovement
  // safely skips leg swing until model is ready.
  g._legL = null;
  g._legR = null;

  g.position.set(data.pos.x, 0.0, data.pos.z);
  scene.add(g);

  // ── Movement behaviour AI ──
  const beh = data.behaviour || { type: 'stay' };
  g._beh = Object.assign({}, beh);

  if (beh.type === 'wander') {
    g._beh.homeX     = data.pos.x;
    g._beh.homeZ     = data.pos.z;
    g._beh.targetX   = data.pos.x;
    g._beh.targetZ   = data.pos.z;
    g._beh.moving    = false;
    g._beh.waitTimer = 1.5 + Math.random() * 2;
    g._beh.speed     = 1.0 + Math.random() * 0.5;
  }

  if (beh.type === 'patrol') {
    g._beh.wpIndex   = 0;
    g._beh.moving    = false;
    g._beh.waitTimer = 1.0 + Math.random() * 1.5;
    g._beh.speed     = 1.1 + Math.random() * 0.4;
  }

  npcObjects[data.id] = { group: g, data };
}

// Register all NPCs (group + lights + sprites + AI state)
NPCS_DATA.forEach(registerNPC);

// ══════════════════════════════════════════════════
// LOAD GLB MODEL INTO EXISTING NPC GROUP
// Replaces nothing — just adds the 3D model into
// the group that already has lights + sprites.
// ══════════════════════════════════════════════════
function loadNPCModelFromURL(npcId, url, targetH) {
  targetH = targetH || 1.7;

  const entry = npcObjects[npcId];
  if (!entry) {
    console.warn('loadNPCModelFromURL: unknown NPC id "' + npcId + '"');
    return;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;

    // Scale to targetH
    const bbox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    model.scale.setScalar(targetH / size.y);

    // Sit on ground (y=0 of group)
    const bbox2 = new THREE.Box3().setFromObject(model);
    model.position.y = -bbox2.min.y;

    entry.group.add(model);
    entry.group._model = model;

    // Try to find leg meshes by name for walk animation.
    model.traverse(child => {
      const n = child.name.toLowerCase();
      if (!entry.group._legL && (n.includes('leg_l') || n.includes('legl') || n.includes('left_leg')))  entry.group._legL = child;
      if (!entry.group._legR && (n.includes('leg_r') || n.includes('legr') || n.includes('right_leg'))) entry.group._legR = child;
    });

    // Raise sprites above model height
    const spriteY = targetH + 0.6;
    entry.group._sickSprite.position.y  = spriteY;
    entry.group._healSprite.position.y  = spriteY;
    entry.group._auraLight.position.y   = targetH * 0.6;

    console.log('✅ NPC GLB loaded: ' + npcId);
  }, undefined, (err) => {
    console.warn('❌ NPC GLB load error for ' + npcId + ' — building fallback mesh:', err);
    _buildFallbackMesh(entry.group, npcId, targetH);
  });
}

function _buildFallbackMesh(g, npcId, targetH) {
  if (g._model) return;
  const h = targetH || 1.7;
  const root = new THREE.Group();

  if (npcId === 'pocong') {
    const shroudMat = new THREE.MeshLambertMaterial({ color: 0xf0efe8 });
    const darkMat   = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const ropeMat   = new THREE.MeshLambertMaterial({ color: 0xd4c08a });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 1.1, 8), shroudMat);
    body.position.y = 0.55;
    root.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 8), shroudMat);
    head.position.y = 1.28;
    root.add(head);

    const knot = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.045, 5, 10), ropeMat);
    knot.position.y = 1.62;
    root.add(knot);

    [-0.06, 0.06].forEach(ox => {
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.01, 0.22, 4), ropeMat);
      tail.position.set(ox, 1.5, 0);
      root.add(tail);
    });

    [-0.1, 0.1].forEach(ox => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 5, 5), darkMat);
      eye.position.set(ox, 1.3, 0.23);
      root.add(eye);
    });

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), darkMat);
    mouth.position.set(0, 1.18, 0.24);
    root.add(mouth);

    root.position.y = 0.18; // pocong floats!

  } else {
    const data    = Object.values(npcObjects).find(e => e.group === g)?.data;
    const bodyMat = new THREE.MeshLambertMaterial({ color: data?.bodyHex || 0x888888 });
    const headMat = new THREE.MeshLambertMaterial({ color: data?.headHex || 0xf0c898 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.28), bodyMat);
    torso.position.y = 0.9; root.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 7), headMat);
    head.position.y = 1.55; root.add(head);

    [-0.13, 0.13].forEach((ox, i) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.22), bodyMat);
      leg.position.set(ox, 0.3, 0); root.add(leg);
      if (i === 0) g._legL = leg; else g._legR = leg;
    });

    [-0.38, 0.38].forEach(ox => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.18), bodyMat);
      arm.position.set(ox, 0.85, 0); root.add(arm);
    });
  }

  g.add(root);
  g._model = root;
  g._sickSprite.position.y = h + 0.5;
  g._healSprite.position.y = h + 0.5;
  console.log('🔧 Fallback mesh built for: ' + npcId);
}

// ══════════════════════════════════════════════════
// LOAD YOUR GLB MODELS HERE
// Add one line per NPC that has a GLB file.
// NPCs without a loadNPCModelFromURL call will still
// work (aura + sprites visible) — just no 3D mesh.
// ══════════════════════════════════════════════════
loadNPCModelFromURL('badang',  './models/badang.glb');
loadNPCModelFromURL('nenek',   './models/nenek kebayan.glb');
loadNPCModelFromURL('pakpandir','./models/pakcik.glb');
loadNPCModelFromURL('pocong',  './models/pocong.glb');
//loadNPCModelFromURL('ali',     './models/ali.glb');
//loadNPCModelFromURL('mak',     './models/mak.glb');
//loadNPCModelFromURL('wak',     './models/wak.glb');
//loadNPCModelFromURL('tok',     './models/tok.glb');
//loadNPCModelFromURL('puteri',  './models/puteri.glb');

// ══════════════════════════════════════════════════
// TICK MOVEMENT  —  called every frame from loop.js
// ══════════════════════════════════════════════════
function tickNPCMovement(dt) {
  Object.values(npcObjects).forEach(({ group }) => {
    const beh = group._beh;
    if (!beh || beh.type === 'stay') return;

    // ══ WANDER ══════════════════════════════════
    if (beh.type === 'wander') {
      if (!beh.moving) {
        beh.waitTimer -= dt;
        if (beh.waitTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist  = 2 + Math.random() * beh.radius;
          beh.targetX = beh.homeX + Math.cos(angle) * dist;
          beh.targetZ = beh.homeZ + Math.sin(angle) * dist;
          beh.targetX = Math.max(-WORLD + 2, Math.min(WORLD - 2, beh.targetX));
          beh.targetZ = Math.max(-WORLD + 2, Math.min(WORLD - 2, beh.targetZ));
          beh.moving  = true;
        }
      } else {
        const dx   = beh.targetX - group.position.x;
        const dz   = beh.targetZ - group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.3) {
          beh.moving    = false;
          beh.waitTimer = 2.5 + Math.random() * 3;
          // Ease legs to rest if available
          if (group._legL) group._legL.rotation.x *= 0.7;
          if (group._legR) group._legR.rotation.x *= 0.7;
        } else {
          group.position.x += (dx / dist) * beh.speed * dt;
          group.position.z += (dz / dist) * beh.speed * dt;
          group.rotation.y  = Math.atan2(dx, dz);
          // Walk animation if leg meshes found
          if (group._legL && group._legR) {
            group._walkPhase += dt * group._walkSpeed * 4.5;
            group._legL.rotation.x =  Math.sin(group._walkPhase) * 0.5;
            group._legR.rotation.x = -Math.sin(group._walkPhase) * 0.5;
          }
        }
      }
    }

    

    // ══ PATROL ══════════════════════════════════
    if (beh.type === 'patrol') {
      const wps = beh.waypoints;
      if (!wps || wps.length < 2) return;

      if (!beh.moving) {
        beh.waitTimer -= dt;
        if (beh.waitTimer <= 0) {
          beh.wpIndex = (beh.wpIndex + 1) % wps.length;
          beh.moving  = true;
        }
      } else {
        const wp   = wps[beh.wpIndex];
        const dx   = wp.x - group.position.x;
        const dz   = wp.z - group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.4) {
          beh.moving    = false;
          beh.waitTimer = 1.5 + Math.random() * 2;
          if (group._legL) group._legL.rotation.x *= 0.7;
          if (group._legR) group._legR.rotation.x *= 0.7;
        } else {
          group.position.x += (dx / dist) * beh.speed * dt;
          group.position.z += (dz / dist) * beh.speed * dt;
          group.rotation.y  = Math.atan2(dx, dz);
          if (group._legL && group._legR) {
            group._walkPhase += dt * group._walkSpeed * 4.5;
            group._legL.rotation.x =  Math.sin(group._walkPhase) * 0.5;
            group._legR.rotation.x = -Math.sin(group._walkPhase) * 0.5;
          }
        }
      }
    }

    // Ease leg swing to rest when standing
    if (!beh.moving) {
      if (group._legL) group._legL.rotation.x *= 0.88;
      if (group._legR) group._legR.rotation.x *= 0.88;
    }
  });

  
}
