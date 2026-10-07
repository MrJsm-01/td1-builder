import { GAME_DATA } from './data.js';
import { QUALITY_ORDER } from './constants.js';
import { BUILD, STATE } from './state.js';
import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { openModal } from './modal.js';
import { updateAddressBar } from './share2.js';

// Order of weapon types
const WP_TYPE_ORDER = [
  'ar',
  'smg',
  'lmg',
  'stg',
  'mmr',
  'hdg',
  'hdgstg'
];

export const GEAR_SCORE = [
  256,
  204
];

// Weapon slots
const WP_SLOT_TYPES = {
  primary   : 'primary_secondary',
  secondary : 'primary_secondary',
  handgun   : 'handgun'
};

// Weapon set bonuses
const BONUS_SLOTS = [
  'primary',
  'secondary',
  'handgun'
];

export function openWeaponPicker(slot) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'weapon';

  const ALLOWED_SLOT = WP_SLOT_TYPES[slot];
  const WEAPONS      = GAME_DATA.weapons.filter(w => GAME_DATA.weapon_types[w.type].slot === ALLOWED_SLOT);

  WEAPONS.sort((a, b) => {
    return (
      WP_TYPE_ORDER.indexOf(a.type) - WP_TYPE_ORDER.indexOf(b.type)
      || QUALITY_ORDER[a.quality] - QUALITY_ORDER[b.quality]
      || a.name.localeCompare(b.name)
    );
  });

  const TYPE_FILTERS = WP_TYPE_ORDER.filter(t => WEAPONS.some(w => w.type === t));

  openModal(`
    <div class="filters-container">
      <label class="filter-container">
        <input type="radio" name="weapon-filter" value="all" class="filter-radio" checked>
        <div class="filter">${STRINGS.filters.all}</div>
      </label>
      ${TYPE_FILTERS.map(t => `
        <label class="filter-container">
          <input type="radio" name="weapon-filter" value="${t}" class="filter-radio">
          <div class="filter">${GAME_DATA.weapon_types[t].short ?? GAME_DATA.weapon_types[t].label}</div>
        </label>
      `).join('')}
    </div>
    <div class="weapons-container">
      ${BUILD[slot] !== null
        ? `
        <button class="weapon" id="clear-slot" data-type="unknown" data-quality="worn">
          <div class="icon-container">
            <svg viewBox="0 0 24 24" class="icon empty" aria-hidden="true">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
          <div class="info-container">
            <div class="name">${STRINGS.weapons.empty.name}</div>
            <div class="desc">${STRINGS.weapons.empty.desc}</div>
          </div>
        </button>
      `
        : ''}
      ${WEAPONS.map(w => {
        const bgColors = {
          exotic: '#c82323',
          highend: '#de990f',
          specialized: '#0072ce',
          superior: '#0072ce'
        };
        const bgColor = bgColors[w.quality] || 'transparent';

        return `
          <button class="weapon" data-id="${w.id}" data-type="${w.type}" data-quality="${w.quality}">
            <div class="sprite-container">
              <div class="sprite ${w.id}" role="presentation"></div>
            </div>
            <div class="info-container">
              <div class="name">${w.name}</div>
              <div class="desc">${GAME_DATA.weapon_types[w.type].label}</div>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `, STRINGS.weapons.choose);

  document.querySelectorAll('.filter-radio').forEach(radio => {
    radio.addEventListener('change', () => filterWeapons(radio.value));
  });
}

function filterWeapons(type) {
  document.querySelectorAll('.weapons-container .weapon').forEach(el => {
    el.hidden = type !== 'all' && el.dataset.type !== type;
  });
}

function renderWeaponSlot(slot) {
  const WP_STATE  = BUILD[slot];
  const WEAPON    = GAME_DATA.weapons.find(w => w.id === WP_STATE.weaponId);
  const CONTAINER = document.getElementById(`wp-${slot}`);
  const SPRITE    = CONTAINER.querySelector('.type-container .sprite');
  const SCORE     = DOM.score[slot];

  CONTAINER.querySelector('.meta-container .name').textContent = WEAPON.name;
  CONTAINER.querySelector('.meta-container .quality').textContent = GAME_DATA.qualities[WEAPON.quality];
  CONTAINER.dataset.quality = WEAPON.quality;
  SPRITE.className = 'sprite';
  SPRITE.classList.add(WEAPON.type);
  CONTAINER.querySelector('.type-container .type').textContent = GAME_DATA.weapon_types[WEAPON.type].label;
  CONTAINER.querySelector('.type-container .bonus').textContent = GAME_DATA.weapon_types[WEAPON.type].bonus ?? '';
  CONTAINER.querySelector('.type-container').dataset.tooltip = GAME_DATA.weapon_types[WEAPON.type].desc;
  CONTAINER.querySelector('.type-container').dataset.position = 'bottom';
  SCORE.hidden = WEAPON.quality !== 'highend';
  SCORE.textContent = WP_STATE.gs;
}

export function selectWeapon(slot, weaponId) {
  const WEAPON = GAME_DATA.weapons.find(w => w.id === weaponId);

  BUILD[slot] = {
    weaponId : WEAPON.id,
    gs       : GEAR_SCORE[0],
    talents  : WEAPON.talents.slice(),
    // eslint-disable-next-line @stylistic/array-bracket-spacing
    mods     : Object.fromEntries(WEAPON.slots.map(s => [s, [null, null, null]]))
  };

  renderWeaponSlot(slot);
  renderWeaponTalentSlots(slot);
  renderWeaponModSlots(slot);
  renderWeaponBonuses();
}

export function clearWeaponSlot(slot) {
  BUILD[slot] = null;

  const CONTAINER = document.getElementById(`wp-${slot}`);
  const SPRITE    = CONTAINER.querySelector('.type-container .sprite');
  const SCORE     = DOM.score[slot];

  CONTAINER.querySelector('.meta-container .name').textContent = STRINGS.weapons.choose;
  CONTAINER.querySelector('.meta-container .quality').textContent = STRINGS.weapons.quality;
  CONTAINER.dataset.quality = 'worn';
  SPRITE.className = 'sprite';
  CONTAINER.querySelector('.type-container .type').textContent = STRINGS.weapons.type;
  CONTAINER.querySelector('.type-container .bonus').textContent = STRINGS.weapons.bonus;
  CONTAINER.querySelector('.type-container').removeAttribute('data-tooltip');
  CONTAINER.querySelector('.type-container').removeAttribute('data-position');
  SCORE.hidden = true;
  SCORE.textContent = '';

  for (let i = 0; i < 3; i++) {
    const TALENT_CONTAINER = document.getElementById(`wp-${slot}-talent${i + 1}`);

    TALENT_CONTAINER.hidden = false;
    TALENT_CONTAINER.classList.remove('locked');
    TALENT_CONTAINER.querySelector('.name-container .name').textContent = STRINGS.talents.name;
    TALENT_CONTAINER.querySelector('.desc').textContent = STRINGS.talents.desc;
    TALENT_CONTAINER.querySelector('.sprite').className = 'sprite';
    TALENT_CONTAINER.onclick = null;
  }

  [
    'magazine',
    'optics',
    'muzzle',
    'underbarrel'
  ].forEach(modSlot => {
    const MOD_CONTAINER = document.querySelector(`#wp-${slot} .sprite.${modSlot}`).closest('.mod-container');

    MOD_CONTAINER.hidden = false;

    for (let i = 0; i < 3; i++) {
      const BONUS_EL = document.getElementById(`wp-${slot}-${modSlot}${i + 1}`);

      BONUS_EL.textContent = STRINGS.mods.unknown.bonus;
      BONUS_EL.onclick = null;
    }
  });

  renderWeaponBonuses();
}

function openWeaponTalentPicker(slot, index) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'wp-talent';
  STATE.activeTalentIndex = index;

  const WEAPON          = GAME_DATA.weapons.find(w => w.id === BUILD[slot].weaponId);
  const CURRENT_TALENTS = BUILD[slot].talents.filter(id => id !== null);

  const TALENTS = GAME_DATA.weapon_talents.filter(t => {
    const COMPATIBLE = t.compat.weapon
      ? t.compat.weapon.includes(WEAPON.id)
      : t.compat.type.includes(WEAPON.type);

    return COMPATIBLE && !CURRENT_TALENTS.includes(t.id);
  });

  TALENTS.sort((a, b) => {
    const SPECIFIC_DIFF = (b.compat.weapon ? 1 : 0) - (a.compat.weapon ? 1 : 0);

    if (SPECIFIC_DIFF !== 0) return SPECIFIC_DIFF;

    return a.name.localeCompare(b.name);
  });

  openModal(
    TALENTS.map(t => `
      <button class="talent" data-id="${t.id}">
        <div class="name-container">
          <strong class="quality">${STRINGS.talents.talent}</strong>
          <span class="separator"> | </span>
          <span class="name">${t.name}</span>
        </div>
        <div class="desc">${t.desc}</div>
        <div class="sprite ${t.id}" role="presentation"></div>
      </button>
    `).join(''),
    STRINGS.talents.choose
  );
}

function renderWeaponTalentSlots(slot) {
  const WP_STATE = BUILD[slot];
  const WEAPON   = GAME_DATA.weapons.find(w => w.id === WP_STATE.weaponId);
  const PREFIX   = `wp-${slot}`;

  for (let i = 0; i < 3; i++) {
    const CONTAINER = document.getElementById(`${PREFIX}-talent${i + 1}`);

    if (i >= WEAPON.talents.length) {
      CONTAINER.hidden = true;
      continue;
    }
    CONTAINER.hidden = false;

    const IS_LOCKED = WEAPON.talents[i] !== null;
    const TALENT_ID = IS_LOCKED ? WEAPON.talents[i] : WP_STATE.talents[i];
    const SPRITE    = CONTAINER.querySelector('.sprite');

    SPRITE.className = 'sprite';

    if (TALENT_ID !== null) {
      const TALENT = GAME_DATA.weapon_talents.find(t => t.id === TALENT_ID);

      CONTAINER.querySelector('.name-container .name').textContent = TALENT.name;
      CONTAINER.querySelector('.desc').textContent = TALENT.desc;
      SPRITE.classList.add(TALENT_ID);
    } else {
      CONTAINER.querySelector('.name-container .name').textContent = STRINGS.talents.name;
      CONTAINER.querySelector('.desc').textContent = STRINGS.talents.desc;
    }

    CONTAINER.classList.toggle('locked', IS_LOCKED);
    CONTAINER.onclick = IS_LOCKED ? null : () => openWeaponTalentPicker(slot, i);
  }
}

function computeEquippedWeapons() {
  return BONUS_SLOTS
    .filter(slot => BUILD[slot] !== null)
    .map(slot => BUILD[slot].weaponId);
}

function renderWeaponBonuses() {
  const EQUIPPED_WPS = computeEquippedWeapons();

  BONUS_SLOTS.forEach(slot => {
    const CONTAINER       = document.getElementById(`wp-${slot}`);
    const BONUS_CONTAINER = CONTAINER.querySelector('.bonus-container');
    const BONUS_EL        = BONUS_CONTAINER.querySelector('.bonus');
    const SEPARATOR       = CONTAINER.querySelector('.bonus-separator');

    if (BUILD[slot] === null) {
      BONUS_CONTAINER.hidden = true;
      SEPARATOR.hidden = true;
      return;
    }

    const WEAPON_ID = BUILD[slot].weaponId;
    const BONUS     = GAME_DATA.weapon_bonus.find(b => b.weapons.includes(WEAPON_ID));

    BONUS_CONTAINER.hidden = !BONUS;
    SEPARATOR.hidden = !BONUS;

    if (!BONUS) return;

    const IS_COMPLETE = BONUS.weapons.every(id => EQUIPPED_WPS.includes(id));

    BONUS_EL.querySelector('.name').textContent = BONUS.name;
    BONUS_EL.querySelector('.desc').innerHTML = BONUS.desc;
    BONUS_EL.classList.toggle('highlight', IS_COMPLETE);
  });
}

export function selectWeaponTalent(slot, index, talentId) {
  BUILD[slot].talents[index] = talentId;
  renderWeaponTalentSlots(slot);
}

function openWeaponModPicker(slot, modSlot, index) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'wp-mod';
  STATE.activeModSlot = modSlot;
  STATE.activeModIndex = index;

  const CURRENT_MODS = BUILD[slot].mods[modSlot].filter(id => id !== null);
  const MODS         = GAME_DATA.weapon_mods.filter(m => m.slot.includes(modSlot) && !CURRENT_MODS.includes(m.id));

  MODS.sort((a, b) => a.label.localeCompare(b.label));

  openModal(
    MODS.map(m => `
      <button class="mod" data-id="${m.id}">${m.label}</button>
    `).join(''),
    STRINGS.mods.choose.bonus
  );
}

function renderWeaponModSlots(slot) {
  const WP_STATE = BUILD[slot];
  const WEAPON   = GAME_DATA.weapons.find(w => w.id === WP_STATE.weaponId);
  const PREFIX   = `wp-${slot}`;

  [
    'magazine',
    'optics',
    'muzzle',
    'underbarrel'
  ].forEach(modSlot => {
    const CONTAINER = document.querySelector(`#${PREFIX} .sprite.${modSlot}`).closest('.mod-container');
    const IS_ACTIVE = WEAPON.slots.includes(modSlot);

    CONTAINER.hidden = !IS_ACTIVE;

    if (!IS_ACTIVE) return;

    for (let i = 0; i < 3; i++) {
      const BONUS  = document.getElementById(`${PREFIX}-${modSlot}${i + 1}`);
      const MOD_ID = WP_STATE.mods[modSlot][i];

      BONUS.textContent = MOD_ID !== null
        ? GAME_DATA.weapon_mods.find(m => m.id === MOD_ID).label
        : STRINGS.mods.choose.bonus;
      BONUS.onclick = () => openWeaponModPicker(slot, modSlot, i);
    }
  });
}

export function selectWeaponMod(slot, modSlot, index, modId) {
  BUILD[slot].mods[modSlot][index] = Number(modId);
  renderWeaponModSlots(slot);
}

export function setWeaponScore(slot, gs) {
  BUILD[slot].gs = gs;
  renderWeaponSlot(slot);
}

function toggleWeaponScore(slot) {
  const WP_STATE = BUILD[slot];
  if (WP_STATE === null) return;

  const WEAPON = GAME_DATA.weapons.find(w => w.id === WP_STATE.weaponId);
  if (WEAPON.quality !== 'highend') return;

  setWeaponScore(slot, WP_STATE.gs === GEAR_SCORE[0] ? GEAR_SCORE[1] : GEAR_SCORE[0]);
  updateAddressBar();
}

document.querySelectorAll('.score').forEach(e => {
  e.addEventListener('click', () => {
    const SLOT = e.id.replace('wp-', '').replace('-gs', '');

    toggleWeaponScore(SLOT);
  });
});
