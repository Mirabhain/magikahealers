// ═══════════════════════════════════════════════════
// js/data.js  —  Spells & NPC definitions
// ═══════════════════════════════════════════════════
'use strict';

const SPELLS = {
  water:{ icon:'💧', name:'WATER', color:0x38BDF8, css:'#38BDF8' },
  earth:{ icon:'🌿', name:'EARTH', color:0x84CC16, css:'#84CC16' },
  light:{ icon:'✨', name:'LIGHT', color:0xFDE047, css:'#FDE047' },
  heat: { icon:'🔥', name:'HEAT',  color:0xF97316, css:'#F97316' },
};

const NPCS_DATA = [
  {
    id:'badang', name:'BADANG',
    pos:{ x:-8, z:-8 }, bodyHex:0xcc4400, headHex:0xf0c898,
    ailment:'FRACTURE',
    intro:`Ugh... my arm! I cannot move it\nafter the battle. The pain is\nunbearable!\n\nChoose your healing spells wisely...`,
    combo:['earth','light'],
    comboLabels:['🌿 EARTH — Immobilise','✨ LIGHT — Purify wound'],
    lesson:`FRACTURE: Immobilise FIRST (Earth),\nthen purify to prevent infection (Light).\nNever try to straighten a broken bone!`,
    winMsg:`BADANG: "Thank you, healer!\nMy arm is protected. I can recover!"`,
    spells:['earth','light','water','heat'],
  },
  {
    id:'nenek', name:'NENEK KEBAYAN',
    pos:{ x:8, z:-8 }, bodyHex:0x884400, headHex:0xf0c898,
    ailment:'FEVER & DEHYDRATION',
    intro:`Aiyoo... so hot... I cannot drink\nenough water. My body is burning!\n\nI need your healing magic, child.`,
    combo:['water','heat'],
    comboLabels:['💧 WATER — Cool & hydrate','🔥 HEAT — Regulate fever'],
    lesson:`FEVER: Cool down with water first,\nthen regulate body temperature.\nAlways take medicine WITH food!`,
    winMsg:`NENEK: "Alhamdulillah...\nThe fever is breaking. Thank you!"`,
    spells:['water','heat','earth','light'],
  },
  {
    id:'pakpandir', name:'PAK PANDIR',
    pos:{ x:-8, z:8 }, bodyHex:0x008844, headHex:0xf0c898,
    ailment:'MEDICATION ERROR',
    intro:`Adoi! I ate all my medicine at once\non empty stomach. Perut sakit!\n\nI should have read the label... help!`,
    combo:['light','earth'],
    comboLabels:['✨ LIGHT — Cleanse toxins','🌿 EARTH — Stabilise stomach'],
    lesson:`MEDICATION: Always take at the RIGHT time!\nWith food or after food prevents vomiting.\nWrong timing = medicine doesn't work!`,
    winMsg:`PAK PANDIR: "Ohhh I feel better!\nNext time I will read directions. Maybe."`,
    spells:['light','earth','water','heat'],
  },
  {
    id:'pocong', name:'POCONG',
    pos:{ x:14, z:-14 }, bodyHex:0xffffff, headHex:0xf0f0f0,
    ailment:'UNCONSCIOUS (FAINTED)',
    intro:`Oooooh... I fainted after being\\nscared by my own reflection!\\nNow I cannot wake up properly...\\n\\nDon't leave me here, healer!`,
    combo:['water','light'],
    comboLabels:['💧 WATER — Recovery position','✨ LIGHT — Restore consciousness'],
    lesson:`FAINTING: Lay the person flat,\\nlift legs above heart level.\\nNever give water to an unconscious person!\\nCheck breathing — call for help if unresponsive.`,
    winMsg:`POCONG: \"Alhamdulillah I am awake!\\nSorry for the scare... I scared myself too.\\nThank you, healer!\"`,
    spells:['water','light','earth','heat'],
    behaviour:{ type:'wander', radius:4 },
  },

  // ── NEW CHARACTERS ──────────────────────────────

  {
    id:'bawangputih', name:'BAWANG PUTIH',
    pos:{ x:-14, z:0 }, bodyHex:0xffffff, headHex:0xf5d5b0,
    ailment:'HEAT STROKE',
    intro:`Kakak suruh aku kerja bawah panas terik...\nSekarang kepala berpusing,\nkulit panas tapi tak berpeluh!\n\nTolong aku, healer!`,
    combo:['water','water','light'],
    comboLabels:['💧 WATER — Cool the body','💧 WATER — Rehydrate','✨ LIGHT — Restore energy'],
    lesson:`HEAT STROKE: Move to shade FIRST.\nCool with water — sponge neck & armpits.\nNever give water if unconscious!`,
    winMsg:`BAWANG PUTIH: "Terima kasih...\nRasa sejuk semula. Saya akan rehat di tempat teduh!"`,
    spells:['water','light','earth','heat'],
  },

  {
    id:'bawangmerah', name:'BAWANG MERAH',
    pos:{ x:14, z:0 }, bodyHex:0xcc2244, headHex:0xf5d5b0,
    ailment:'FOOD POISONING',
    intro:`Aduh! Aku makan makanan semalam\nyang dah basi! Perut mulas,\nmuntah-muntah tak berhenti!\n\nAku rasa lemah sangat...`,
    combo:['water','earth','water'],
    comboLabels:['💧 WATER — Flush toxins','🌿 EARTH — Settle stomach','💧 WATER — Rehydrate lost fluids'],
    lesson:`FOOD POISONING: Drink lots of water\nto flush toxins out. Rest the stomach.\nSee a doctor if it lasts over 24 hours!`,
    winMsg:`BAWANG MERAH: "Ugh... lain kali\naku tak makan makanan basi dah. Janji!"`,
    spells:['water','earth','light','heat'],
  },

  {
    id:'hangtuah', name:'HANG TUAH',
    pos:{ x:0, z:-14 }, bodyHex:0xcc8800, headHex:0xc8904a,
    ailment:'DEEP SWORD WOUND',
    intro:`Pahlawan sejati tidak mengeluh...\nbut this wound from battle is deep\nand the bleeding will not stop!\n\nI need a skilled healer. Quickly!`,
    combo:['light','earth','heat'],
    comboLabels:['✨ LIGHT — Purify & disinfect','🌿 EARTH — Seal the wound','🔥 HEAT — Cauterise & clot'],
    lesson:`DEEP WOUND: Clean FIRST to prevent\ninfection. Apply pressure to stop bleeding.\nHeat helps clotting — never remove a clot!`,
    winMsg:`HANG TUAH: "Tun Perak will be pleased.\nA healer's skill rivals a warrior's blade!\nSetia sampai akhir — thank you!"`,
    spells:['light','earth','heat','water'],
  },

  {
    id:'hanglekir', name:'HANG LEKIR',
    pos:{ x:0, z:14 }, bodyHex:0x336699, headHex:0xc8904a,
    ailment:'BROKEN RIBS',
    intro:`Sahabat Hang Tuah pun kena jugak...\nI took a blow to the chest in battle.\nEvery breath... is agony.\n\nHelp me breathe again, healer!`,
    combo:['earth','light','water'],
    comboLabels:['🌿 EARTH — Immobilise chest','✨ LIGHT — Reduce inflammation','💧 WATER — Soothe internal bruising'],
    lesson:`BROKEN RIBS: Do NOT wrap tightly!\nThis restricts breathing and risks pneumonia.\nImmobilise gently — rest is the best cure.`,
    winMsg:`HANG LEKIR: "Alhamdulillah...\nBreathing is easier now.\nA true healer you are, kawan!"`,
    spells:['earth','light','water','heat'],
  },

  {
    id:'puterigunungledang', name:'PUTERI GUNUNG LEDANG',
    pos:{ x:-14, z:14 }, bodyHex:0xaaddff, headHex:0xffe8d0,
    ailment:'MAGICAL EXHAUSTION',
    intro:`I have cast too many spells...\nMy magic is drained, my spirit weak.\nThe mountain's power cannot\nrestore me alone.\n\nOnly a pure healing combo can save me.`,
    combo:['light','water','earth','light'],
    comboLabels:['✨ LIGHT — Rekindle spirit','💧 WATER — Cleanse aura','🌿 EARTH — Ground energy','✨ LIGHT — Seal & restore'],
    lesson:`EXHAUSTION: Rest is medicine!\nOverusing energy — magical or physical —\nleads to collapse. Pace yourself always.`,
    winMsg:`PUTERI GUNUNG LEDANG: "Remarkable...\nYou have healed what even mountains could not.\nThe mist of Ledang blesses you, young healer."`,
    spells:['light','water','earth','heat'],
  },
];