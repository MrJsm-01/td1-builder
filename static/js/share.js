/* global LZString */

import { BUILD_VERSION } from './constants.js';
import { STRINGS } from './strings.js';
import { BUILD } from './state.js';
import { openModal } from './modal.js';
import { selectLoadoutName } from './name.js';
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
  if (Array.isArray(arr)) {
    arr.forEach((value, index) => {
      if (value !== null && value !== undefined) PAIRS.push([index, value]);
    });
  }
  return PAIRS;
}

function serializeWeaponSlot(slot) {
  const WEAPON_STATE = BUILD[slot];
  if (!WEAPON_STATE) return null;

  const MOD_ENTRIES = {};

  if (WEAPON_STATE.mods) {
    Object.keys(WEAPON_STATE.mods).forEach(modSlot => {
      const PAIRS = compactArray(WEAPON_STATE.mods[modSlot]);
      if (PAIRS.length) MOD_ENTRIES[modSlot] = PAIRS;
    });
  }

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
  if (!GEAR_STATE) return null;

  const PAYLOAD = { id: GEAR_STATE.itemId };

  if (GEAR_STATE.stat !== null) PAYLOAD.s = GEAR_STATE.stat;
  if (GEAR_STATE.talentLocked === false && GEAR_STATE.talent !== null) PAYLOAD.t = GEAR_STATE.talent;

  const MAJOR_PAIRS = compactArray(GEAR_STATE.majorAttrs);
  if (MAJOR_PAIRS.length) PAYLOAD.ma = MAJOR_PAIRS;

  const MINOR_PAIRS = compactArray(GEAR_STATE.minorAttrs);
  if (MINOR_PAIRS.length) PAYLOAD.mi = MINOR_PAIRS;

  const GEAR_MOD_PAIRS = [];
  if (Array.isArray(GEAR_STATE.gearMods)) {
    GEAR_STATE.gearMods.forEach((mod, index) => {
      if (mod && mod.type !== null && mod.type !== undefined) {
        GEAR_MOD_PAIRS.push([index, mod.type, mod.bonus]);
      }
    });
  }
  if (GEAR_MOD_PAIRS.length) PAYLOAD.gm = GEAR_MOD_PAIRS;

  const PERF_PAIRS = compactArray(GEAR_STATE.perfMods);
  if (PERF_PAIRS.length) PAYLOAD.pm = PERF_PAIRS;

  return PAYLOAD;
}

function serializeBuild() {
  const PAYLOAD = { v: BUILD_VERSION };

  if (BUILD.name !== null) PAYLOAD.n = BUILD.name;

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
    if (BUILD[slot] !== null && BUILD[slot] !== undefined) SKILLS[slot] = BUILD[slot];
  });
  if (Object.keys(SKILLS).length) PAYLOAD.sk = SKILLS;

  const TALENTS = {};
  PL_TALENT_SLOTS.forEach(slot => {
    if (BUILD[slot] !== null && BUILD[slot] !== undefined) TALENTS[slot] = BUILD[slot];
  });
