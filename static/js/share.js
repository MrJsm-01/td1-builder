/* global LZString */

import { BUILD_VERSION } from './constants.js';
import { STRINGS } from './strings.js';
import { BUILD } from './state.js';
import { openModal } from './modal.js';
import { selectWeapon, selectWeaponTalent, selectWeaponMod, setWeaponScore, GEAR_SCORE } from './weapons.js';
import { selectGear, renderGearStats, selectGearTalent, selectGearAttr, selectGearModType, selectGearModBonus, selectPerfMod } from './gear.js';
import { selectSkill } from './skills.js';
import { selectPlayerTalent } from './talents.js';

const WEAPON_SLOTS = [
  'primary',
  'secondary',
  'handgun'
];
const GEAR_SLOTS = [
  'chest',
  'mask',
  'kneepads',
  'backpack',
  'gloves',
  'holster'
];
const SKILL_SLOTS = [
  'skill1',
  'skill2',
  'skillUlt'
];
const PL_TALENT_SLOTS = [
  'talent1',
  'talent2',
  'talent3',
  'talent4'
];

let isLoadingFromUrl = false;

function compactArray(arr) {
  const PAIRS = [];
  arr.forEach((value, index) => {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    if (value !== null) PAIRS.push([index, value]);
  });

  return PAIRS;
}

function serializeWeaponSlot(slot) {
  const WEAPON_STATE = BUILD[slot];
  if (WEAPON_STATE === null) return null;

  const MOD_ENTRIES = {};

  Object.keys(WEAPON_STATE.mods).forEach(modSlot => {
    const PAIRS = compactArray(WEAPON_STATE.mods[modSlot]);

    if (PAIRS.length) MOD_ENTRIES[modSlot] = PAIRS;
  });

  const PAYLOAD = {
    id : WEAPON_STATE.weaponId,
    t  : compactArray(WEAPON_STATE.talents),
    m  : MOD_ENTRIES
  };

  if (WEAPON_STATE.gs !== GEAR_SCORE[0]) PAYLOAD.gs = WEAPON_STATE.gs;

  return PAYLOAD;
}

function serializeGearSlot(slot) {
  const GEAR_STATE = BUILD[slot];
  if (GEAR_STATE === null) return null;

  const PAYLOAD = { id: GEAR_STATE.itemId };

  if (GEAR_STATE.stat !== null) PAYLOAD.s = GEAR_STATE.stat;
  if (GEAR_STATE.talentLocked === false && GEAR_STATE.talent !== null) PAYLOAD.t = GEAR_STATE.talent;

  const MAJOR_PAIRS = compactArray(GEAR_STATE.majorAttrs);
  if (MAJOR_PAIRS.length) PAYLOAD.ma = MAJOR_PAIRS;

  const MINOR_PAIRS = compactArray(GEAR_STATE.minorAttrs);
  if (MINOR_PAIRS.length) PAYLOAD.mi = MINOR_PAIRS;

  const GEAR_MOD_PAIRS = [];

  GEAR_STATE.gearMods.forEach((mod, index) => {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    if (mod.type !== null) GEAR_MOD_PAIRS.push([index, mod.type, mod.bonus]);
  });
  if (GEAR_MOD_PAIRS.length) PAYLOAD.gm = GEAR_MOD_PAIRS;

  const PERF_PAIRS = compactArray(GEAR_STATE.perfMods);
  if (PERF_PAIRS.length) PAYLOAD.pm = PERF_PAIRS;

  return PAYLOAD;
}

function serializeBuild() {
  const PAYLOAD = { v: BUILD_VERSION };

  const WEAPONS = {};
  WEAPON_SLOTS.forEach(slot => {
    const DATA = serializeWeaponSlot(slot);
    if (DATA !== null) WEAPONS[slot] = DATA;
  });
  if (Object.keys(WEAPONS).length) PAYLOAD.w = WEAPONS;

  const GEAR = {};
  GEAR_SLOTS.forEach(slot => {
    const DATA = serializeGearSlot(slot);
    if (DATA !== null) GEAR[slot] = DATA;
  });
  if (Object.keys(GEAR).length) PAYLOAD.g = GEAR;

  const SKILLS = {};
  SKILL_SLOTS.forEach(slot => {
    if (BUILD[slot] !== null) SKILLS[slot] = BUILD[slot];
  });
  if (Object.keys(SKILLS).length) PAYLOAD.sk = SKILLS;

  const TALENTS = {};
  PL_TALENT_SLOTS.forEach(slot => {
    if (BUILD[slot] !== null) TALENTS[slot] = BUILD[slot];
  });
  if (Object.keys(TALENTS).length) PAYLOAD.pt = TALENTS;

  const JSON_STRING = JSON.stringify(PAYLOAD);

  return LZString.compressToEncodedURIComponent(JSON_STRING);
}

function generateShareUrl() {
  const ENCODED   = serializeBuild();
  const SHARE_URL = new URL(window.location.href);

  SHARE_URL.hash = ENCODED;

  return SHARE_URL.toString();
}

export function updateAddressBar() {
  if (isLoadingFromUrl) return;

  const ENCODED = serializeBuild();
  history.replaceState(null, '', `#${ENCODED}`);
}

function applyWeaponSlot(slot, data) {
  selectWeapon(slot, data.id);

  // eslint-disable-next-line @stylistic/array-bracket-spacing
  data.t.forEach(([index, talentId]) => {
    selectWeaponTalent(slot, index, talentId);
  });

  Object.keys(data.m).forEach(modSlot => {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    data.m[modSlot].forEach(([index, modId]) => {
      selectWeaponMod(slot, modSlot, index, modId);
    });
  });

  if (data.gs) setWeaponScore(slot, data.gs);
}

function applyGearSlot(slot, data) {
  selectGear(slot, data.id);

  if (data.s) {
    const RADIO = document.querySelector(`input[name="${slot}-stat"][value="${data.s}"]`);

    RADIO.checked = true;
    BUILD[slot].stat = data.s;
  }

  if (data.t) selectGearTalent(slot, data.t);

  if (data.ma) {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    data.ma.forEach(([index, attrId]) => selectGearAttr(slot, 'major', index, attrId));
  }

  if (data.mi) {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    data.mi.forEach(([index, attrId]) => selectGearAttr(slot, 'minor', index, attrId));
  }

  if (data.gm) {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    data.gm.forEach(([index, modId, bonusId]) => {
      selectGearModType(slot, index, modId);
      if (bonusId !== null) selectGearModBonus(slot, index, bonusId);
    });
  }

  if (data.pm) {
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    data.pm.forEach(([index, bonusId]) => selectPerfMod(slot, index, bonusId));
  }
}

function applyBuildData(payload) {
  if (payload.v !== BUILD_VERSION) {
    openModal(`
      <div class="title-container error">
        <div class="icon-container">
          <svg viewBox="0 0 24 24" class="icon exclamation" aria-hidden="true">
            <path d="M11 4h2v11h-2zm2 14v2h-2v-2z"/>
          </svg>
        </div>
        <div class="title">Invalid Share Link</div>
      </div>
      <div class="content">
        <p>The shared build link contains outdated data.</p>
        <p>The default build has been loaded instead.</p>
      </div>
    `, STRINGS.error.version);

    return;
  }

  if (payload.w) {
    Object.keys(payload.w).forEach(slot => applyWeaponSlot(slot, payload.w[slot]));
  }

  if (payload.g) {
    Object.keys(payload.g).forEach(slot => applyGearSlot(slot, payload.g[slot]));
  }

  if (payload.sk) {
    Object.keys(payload.sk).forEach(slot => selectSkill(slot, payload.sk[slot]));
  }

  if (payload.pt) {
    Object.keys(payload.pt).forEach(slot => selectPlayerTalent(slot, payload.pt[slot]));
  }

  renderGearStats();
}

export function loadBuildFromUrl() {
  const HASH = window.location.hash.slice(1);
  if (!HASH) return;

  const JSON_STRING = LZString.decompressFromEncodedURIComponent(HASH);
  if (!JSON_STRING) return;

  const PAYLOAD = JSON.parse(JSON_STRING);

  isLoadingFromUrl = true;
  applyBuildData(PAYLOAD);
  isLoadingFromUrl = false;
}

export function openShareModal() {
  const SHARE_URL = generateShareUrl();

  openModal(`
    <div class="title-container share">
      <div class="icon-container">
        <svg viewBox="0 0 24 24" class="icon exclamation" aria-hidden="true">
          <path d="M11 4h2v11h-2zm2 14v2h-2v-2z"/>
        </svg>
      </div>
      <div class="title">Share Build</div>
    </div>
    <div class="content">
      <div class="help">${STRINGS.help.clipboard.copy}</div>
      <input type="text" id="share-url" value="${SHARE_URL}" readonly>
    </div>
  `, STRINGS.help.share);
}
