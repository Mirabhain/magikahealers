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
    id:'siti', name:'SITI',
    pos:{ x:8, z:8 }, bodyHex:0x9933aa, headHex:0xf0c898,
    ailment:'INFECTED WOUND',
    intro:`The cut on my arm is spreading\nred lines... I covered it without\ncleaning first. It is getting worse!\n\nPlease help before infection spreads!`,
    combo:['light','light','earth'],
    comboLabels:['✨ LIGHT — Purify wound','✨ LIGHT — Deep clean','🌿 EARTH — Seal & protect'],
    lesson:`WOUND INFECTION: ALWAYS clean BEFORE\ncovering! Red streaks = infection in blood.\nRun clean water 5+ mins, then seal.`,
    winMsg:`SITI: "The red lines are fading...\nNext time I will clean first. Thank you!"`,
    spells:['light','earth','water','heat'],
  },
];