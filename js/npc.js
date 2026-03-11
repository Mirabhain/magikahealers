// ═══════════════════════════════════════════════════
// js/npcs.js  —  NPC building, GLB loading, sprites
// ═══════════════════════════════════════════════════
'use strict';

const npcObjects = {}; // id → { group, data }

// ── Build box-style NPC (used as fallback if no GLB) ──
function buildNPC(data) {
  const g = new THREE.Group();

  // Legs
  const legMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
  [-0.2, 0.2].forEach((ox, i) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), legMat);
    leg.position.set(ox, -0.25, 0); leg.castShadow = true;
    g.add(leg);
    if (i === 0) g._legL = leg; else g._legR = leg;
  });

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.9, 0.45),
    new THREE.MeshLambertMaterial({ color: data.bodyHex })
  );
  body.position.y = 0.5; body.castShadow = true;
  g.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 0.52),
    new THREE.MeshLambertMaterial({ color: data.headHex })
  );
  head.position.y = 1.22; head.castShadow = true;
  g.add(head);
  g._head = head;

  // Eyes
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1a0a00 });
  [-0.13, 0.13].forEach(ox => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), eyeM);
    eye.position.set(ox, 1.25, 0.27);
    g.add(eye);
  });

  // Arms
  const armMat = new THREE.MeshLambertMaterial({ color: data.bodyHex });
  [-0.5, 0.5].forEach((ox, i) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), armMat);
    arm.position.set(ox, 0.5, 0); arm.castShadow = true;
    g.add(arm);
    if (i === 0) g._armL = arm; else g._armR = arm;
  });

  // Aura light
  const auraLight = new THREE.PointLight(0xff2222, 1.5, 4);
  auraLight.position.y = 1;
  g.add(auraLight);
  g._auraLight = auraLight;

  g._nameData  = data.name;
  g._data      = data;
  g._state     = 'sick';
  g._bobOffset = Math.random() * Math.PI * 2;

  g.position.set(data.pos.x, 0.6, data.pos.z);
  scene.add(g);

  npcObjects[data.id] = { group: g, data };
}

// Build all NPCs from data
NPCS_DATA.forEach(buildNPC);

// ── Load GLB model and replace box mesh inside NPC group ──
function loadNPCModelFromURL(npcId, url, targetH = 1.5) {
  if (!npcObjects[npcId]) {
    console.warn(`❌ loadNPCModelFromURL: unknown NPC id "${npcId}"`);
    return;
  }
  const loader = new THREE.GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;

    // Scale to target height
    const bbox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const scale = targetH / size.y;
    model.scale.setScalar(scale);

    // Sit on y=0 of the group
    const bbox2 = new THREE.Box3().setFromObject(model);
    model.position.y = -bbox2.min.y;

    model.traverse(child => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });

    // Remove old box meshes, keep lights & sprites
    const npcGroup = npcObjects[npcId].group;
    const toRemove = [];
    npcGroup.children.forEach(c => { if (c.isMesh) toRemove.push(c); });
    toRemove.forEach(c => npcGroup.remove(c));

    npcGroup.add(model);
    npcGroup._head = model;
    console.log(`✅ GLB loaded for ${npcId}`);
  },
  undefined,
  (err) => console.warn(`❌ GLB load error for ${npcId}:`, err));
}

// ── Load your GLB models here ──
// Make sure files exist at ./models/nenek.glb etc.
// and you are running a local server (python -m http.server 8000)
loadNPCModelFromURL('nenek',  './models/nenek.glb');
loadNPCModelFromURL('badang', './models/badang.glb');

// ── Sick / Healed sprites above NPCs ──
function makeTextSprite(text, color = '#ffcc00') {
  const c   = document.createElement('canvas');
  c.width   = 128; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle    = color;
  ctx.font         = 'bold 36px "Press Start 2P", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(1.2, 0.6, 1);
  return sp;
}

Object.values(npcObjects).forEach(({ group }) => {
  const sickSp = makeTextSprite('😷 !', '#ff4444');
  sickSp.position.set(0, 2.4, 0);
  group.add(sickSp);
  group._sickSprite = sickSp;

  const healSp = makeTextSprite('✅', '#22ff88');
  healSp.position.set(0, 2.4, 0);
  healSp.visible = false;
  group.add(healSp);
  group._healSprite = healSp;
});