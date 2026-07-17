import { GAME_DATA } from './data.js';
import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { GEAR_QUALITY_ORDER, GEAR_MOD_QUALITY_ORDER, BASE_PLAYER_STAT, BASE_GEAR_STAT, GEAR_SLOT_CONFIG } from './constants.js';
import { BUILD, STATE } from './state.js';
import { openModal } from './modal.js';
import { updateAddressBar } from './share.js';

// Gear Set bonuses
const BONUS_SLOTS = [
  'chest',
  'mask',
  'kneepads',
  'backpack',
  'gloves',
  'holster'
];

// Gear main stats
const STAT_SLOTS = [
  'chest',
  'mask',
  'kneepads',
  'backpack',
  'gloves',
  'holster'
];

document.querySelectorAll('.stat-radio').forEach(radio => {
  radio.disabled = true;
});

export function openGearPicker(slot) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'gear';

  const ITEMS = GAME_DATA.gear.filter(g => g.slot === slot);

  ITEMS.sort((a, b) => {
    return (
      GEAR_QUALITY_ORDER[a.quality] - GEAR_QUALITY_ORDER[b.quality]
      || a.name.localeCompare(b.name)
    );
  });

  openModal(`
    <div class="filters-container">
      <label class="filter-container">
        <input type="radio" name="gear-filter" value="all" class="filter-radio" checked>
        <div class="filter">${STRINGS.filters.all}</div>
      </label>
      <label class="filter-container">
        <input type="radio" name="gear-filter" value="classy" class="filter-radio">
        <div class="filter">${STRINGS.filters.classy}</div>
      </label>
      <label class="filter-container">
        <input type="radio" name="gear-filter" value="gearset" class="filter-radio">
        <div class="filter">${STRINGS.filters.gearset}</div>
      </label>
    </div>
    <div class="gear-container">
      ${ITEMS.map(g => `
        <div class="gear" data-id="${g.id}" data-quality="${g.quality}">
          <div class="sprite-container">
            <div class="sprite ${g.id}" role="presentation"></div>
          </div>
          <div class="info-container">
            <div class="name">${g.name}</div>
            <div class="desc">${GAME_DATA.qualities[g.quality]}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `, STRINGS.gear.slots[slot]);

  document.querySelectorAll('.filter-radio').forEach(radio => {
    radio.addEventListener('change', () => filterGear(radio.value));
  });
}

function filterGear(quality) {
  document.querySelectorAll('.gear-container .gear').forEach(el => {
    el.hidden = quality !== 'all' && el.dataset.quality !== quality;
  });
}

function renderGearSlot(slot) {
  const GEAR_STATE = BUILD[slot];
  const ITEM       = GAME_DATA.gear.find(g => g.id === GEAR_STATE.itemId);
  const CONTAINER  = document.querySelector(`.gear.${slot}`);
  const META       = document.getElementById(`gp-${slot}`);

  META.querySelector('.name').textContent = ITEM.name;
  META.querySelector('.quality').textContent = GAME_DATA.qualities[ITEM.quality];
  CONTAINER.dataset.quality = ITEM.quality;
  CONTAINER.dataset.setId = ITEM.setId ?? '';
}

export function selectGear(slot, itemId) {
  const ITEM   = GAME_DATA.gear.find(g => g.id === itemId);
  const CONFIG = GEAR_SLOT_CONFIG[slot];

  BUILD[slot] = {
    itemId       : ITEM.id,
    stat         : null,
    talent       : 'talent' in ITEM ? ITEM.talent : undefined,
    talentLocked : 'talent' in ITEM ? ITEM.talent !== null : undefined,
    majorAttrs   : new Array(CONFIG.major).fill(null),
    minorAttrs   : new Array(CONFIG.minor).fill(null),
    // eslint-disable-next-line @stylistic/object-property-newline
    gearMods     : Array.from({ length: CONFIG.gearMod }, () => ({ type: null, bonus: null })),
    perfMods     : new Array(CONFIG.perfMod).fill(null)
  };

  renderGearSlot(slot);
  document.querySelectorAll(`input[name="${slot}-stat"]`).forEach(radio => radio.disabled = false);
  document.querySelectorAll(`input[name="${slot}-stat"]`).forEach(radio => radio.checked = false);
  renderGearTalent(slot);
  renderGearAttrs(slot);
  renderGearMods(slot);
  renderPerfMods(slot);
  renderGearSetBonuses();
  renderGearStats();
}

function openGearAttrPicker(slot, attrType, index) {
  STATE.activeSlot = slot;
  STATE.activeMode = `gear-${attrType}`;
  STATE.activeAttrType = attrType;
  STATE.activeGearIndex = index;

  const CURRENT = BUILD[slot][`${attrType}Attrs`].filter(id => id !== null);
  const ATTRS   = GAME_DATA.gear_attr[attrType].filter(a => a.compat.slot.includes(slot) && !CURRENT.includes(a.id));

  ATTRS.sort((a, b) => a.name.localeCompare(b.name));

  openModal(
    ATTRS.map(a => `
      <div class="attr" data-id="${a.id}">${a.name}</div>
    `).join(''),
    STRINGS.attributes.choose
  );
}

function renderGearAttrs(slot) {
  const CONFIG = GEAR_SLOT_CONFIG[slot];

  [
    'major',
    'minor'
  ].forEach(attrType => {
    for (let i = 0; i < CONFIG[attrType]; i++) {
      const CONTAINER = document.getElementById(`gp-${slot}-${attrType}${i + 1}`);
      const ATTR_ID   = BUILD[slot][`${attrType}Attrs`][i];

      CONTAINER.textContent = ATTR_ID !== null
        ? GAME_DATA.gear_attr[attrType].find(a => a.id === ATTR_ID).name
        : STRINGS.attributes.choose;
      CONTAINER.onclick = () => openGearAttrPicker(slot, attrType, i);
    }
  });
}

export function selectGearAttr(slot, attrType, index, attrId) {
  BUILD[slot][`${attrType}Attrs`][index] = Number(attrId);
  renderGearAttrs(slot);
}

function openGearModTypePicker(slot, index) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'gear-mod-type';
  STATE.activeGearIndex = index;

  const MODS = [...GAME_DATA.gear_mods].sort((a, b) => {
    return GEAR_MOD_QUALITY_ORDER[a.quality] - GEAR_MOD_QUALITY_ORDER[b.quality]
      || a.name.localeCompare(b.name);
  });

  openModal(
    MODS.map(m => `
      <div class="gear-mod" data-id="${m.id}" data-quality="${m.quality}">
        <div class="sprite-container">
          <div class="sprite" role="presentation"></div>
        </div>
        <div class="info-container">
          <div class="name">${m.name}</div>
          <div class="desc">${GAME_DATA.qualities[m.quality]}</div>
        </div>
      </div>
    `).join(''),
    STRINGS.mods.choose.gear
  );
}

function openGearModBonusPicker(slot, index) {
  const MOD_TYPE_ID = BUILD[slot].gearMods[index].type;

  if (MOD_TYPE_ID === null) return;

  const MOD_QUALITY = GAME_DATA.gear_mods.find(m => m.id === MOD_TYPE_ID).quality;

  STATE.activeSlot = slot;
  STATE.activeMode = 'gear-mod-bonus';
  STATE.activeGearIndex = index;

  const BONUSES = GAME_DATA.gear_mods_bonus
    .filter(b => b.quality === MOD_QUALITY)
    .sort((a, b) => a.name.localeCompare(b.name));

  openModal(
    BONUSES.map(b => `
      <div class="gear-mod" data-id="${b.id}" data-quality="${b.quality}">
        <div class="sprite-container">
          <div class="sprite" role="presentation"></div>
        </div>
        <div class="info-container">
          <div class="name">${b.name}</div>
          <div class="desc">${GAME_DATA.qualities[b.quality]}</div>
        </div>
      </div>
    `).join(''),
    STRINGS.mods.choose.bonus
  );
}

function renderGearMods(slot) {
  const CONFIG = GEAR_SLOT_CONFIG[slot];

  for (let i = 0; i < CONFIG.gearMod; i++) {
    const MOD_STATE     = BUILD[slot].gearMods[i];
    const TYPE_CONTAINER = document.getElementById(`gp-${slot}-gear-mod${i + 1}-type`);
    const BONUS_CONTAINER = document.getElementById(`gp-${slot}-gear-mod${i + 1}-bonus`);
    const SPRITE        = TYPE_CONTAINER.querySelector('.sprite');

    SPRITE.className = 'sprite stat';

    if (MOD_STATE.type !== null) {
      const MOD = GAME_DATA.gear_mods.find(m => m.id === MOD_STATE.type);
      TYPE_CONTAINER.querySelector('strong').textContent = MOD.name;
      TYPE_CONTAINER.dataset.quality = MOD.quality;
      SPRITE.classList.add(MOD.type);
    } else {
      TYPE_CONTAINER.querySelector('strong').textContent = STRINGS.mods.choose.gear;
    }
    TYPE_CONTAINER.onclick = () => openGearModTypePicker(slot, i);

    BONUS_CONTAINER.textContent = MOD_STATE.bonus !== null
      ? GAME_DATA.gear_mods_bonus.find(b => b.id === MOD_STATE.bonus).name
      : STRINGS.mods.choose.bonus;
    BONUS_CONTAINER.classList.toggle('disabled', MOD_STATE.type === null);
    BONUS_CONTAINER.onclick = MOD_STATE.type === null ? null : () => openGearModBonusPicker(slot, i);
  }
}

export function selectGearModType(slot, index, modId) {
  BUILD[slot].gearMods[index].type = Number(modId);
  BUILD[slot].gearMods[index].bonus = null;
  renderGearMods(slot);
  renderGearStats();
}

export function selectGearModBonus(slot, index, bonusId) {
  BUILD[slot].gearMods[index].bonus = Number(bonusId);
  renderGearMods(slot);
}

function openPerfModPicker(slot, index) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'gear-perf';
  STATE.activeGearIndex = index;

  const MODS = [...GAME_DATA.gear_perf_mods].sort((a, b) => a.name.localeCompare(b.name));

  openModal(
    MODS.map(m => `
      <div class="gear-mod" data-id="${m.id}" data-quality="${m.quality}">
        <div class="sprite-container">
          <div class="sprite perf" role="presentation"></div>
        </div>
        <div class="info-container">
          <div class="name">${m.name}</div>
          <div class="desc">${GAME_DATA.qualities[m.quality]}</div>
        </div>
      </div>
    `).join(''),
    STRINGS.mods.choose.gear
  );
}

function renderPerfMods(slot) {
  const CONFIG = GEAR_SLOT_CONFIG[slot];

  for (let i = 0; i < CONFIG.perfMod; i++) {
    const CONTAINER = document.getElementById(`gp-${slot}-perf${i + 1}-bonus`);
    const MOD_ID    = BUILD[slot].perfMods[i];

    CONTAINER.textContent = MOD_ID !== null
      ? GAME_DATA.gear_perf_mods.find(m => m.id === MOD_ID).name
      : STRINGS.mods.choose.bonus;
    CONTAINER.onclick = () => openPerfModPicker(slot, i);
  }
}

export function selectPerfMod(slot, index, bonusId) {
  BUILD[slot].perfMods[index] = Number(bonusId);
  renderPerfMods(slot);
}

function computeSetState() {
  const COUNTS      = {};
  let ninjaEquipped = false;

  BONUS_SLOTS.forEach(slot => {
    const GEAR_STATE = BUILD[slot];

    if (GEAR_STATE === null) return;

    const ITEM = GAME_DATA.gear.find(g => g.id === GEAR_STATE.itemId);

    if (ITEM.id === 'ninja') {
      ninjaEquipped = true;
      return;
    }
    if (!ITEM.setId) return;

    // eslint-disable-next-line @stylistic/object-property-newline
    if (!COUNTS[ITEM.setId]) COUNTS[ITEM.setId] = { gearset: 0, classy: 0 };
    if (ITEM.quality === 'classy') COUNTS[ITEM.setId].classy++;
    else if (ITEM.quality === 'gearset') COUNTS[ITEM.setId].gearset++;
  });

  return {
    counts : COUNTS,
    ninjaEquipped
  };
}

function renderGearSetBonuses() {
  const { counts, ninjaEquipped } = computeSetState();

  BONUS_SLOTS.forEach(slot => {
    const GEAR_STATE = BUILD[slot];
    const CONTAINER  = document.querySelector(`.gear.${slot} .bonus-container`);
    const SEPARATOR  = document.querySelector(`.gear.${slot} .bonus-separator`);

    if (GEAR_STATE === null) {
      CONTAINER.hidden = true;
      SEPARATOR.hidden = true;

      return;
    }

    const ITEM = GAME_DATA.gear.find(g => g.id === GEAR_STATE.itemId);

    if (!ITEM.setId) {
      CONTAINER.hidden = true;
      SEPARATOR.hidden = true;

      return;
    }

    CONTAINER.hidden = false;
    SEPARATOR.hidden = false;

    const SET_BONUS = GAME_DATA.gear_bonus[ITEM.setId];
    const SET_COUNT = counts[ITEM.setId];
    const TOTAL     = SET_COUNT.gearset + SET_COUNT.classy;
    const EFFECTIVE = TOTAL + (ninjaEquipped && TOTAL >= 1 ? 1 : 0);

    SET_BONUS.gearset.forEach((bonus, i) => {
      const BONUS_NUM = i + 2;
      const EL        = CONTAINER.querySelector(`.bonus${BONUS_NUM}`);

      EL.querySelector('.name').textContent = bonus.name;
      EL.querySelector('.desc').innerHTML = bonus.desc;
      EL.classList.toggle('highlight', EFFECTIVE >= BONUS_NUM);
    });

    SET_BONUS.classy.forEach((bonus, i) => {
      const BONUS_NUM = i + 5;
      const EL        = CONTAINER.querySelector(`.bonus${BONUS_NUM}`);
      const REQUIRED  = i === 0 ? 5 : 6;

      EL.querySelector('.name').textContent = bonus.name;
      EL.querySelector('.desc').innerHTML = bonus.desc;
      EL.classList.toggle('highlight', SET_COUNT.classy >= REQUIRED);
    });
  });
}

function computeGearStats() {
  const TOTALS = {
    fa  : BASE_PLAYER_STAT,
    sta : BASE_PLAYER_STAT,
    ele : BASE_PLAYER_STAT
  };

  STAT_SLOTS.forEach(slot => {
    const GEAR_STATE = BUILD[slot];
    if (GEAR_STATE === null) return;

    const ITEM     = GAME_DATA.gear.find(g => g.id === GEAR_STATE.itemId);
    const STAT_MAX = ITEM.quality === 'classy' ? GAME_DATA.gear_attr.stats.classy : GAME_DATA.gear_attr.stats.highend;

    if (slot === 'holster') {
      TOTALS.fa += STAT_MAX;
      TOTALS.sta += STAT_MAX;
      TOTALS.ele += STAT_MAX;

      return;
    }

    TOTALS.fa += BASE_GEAR_STAT;
    TOTALS.sta += BASE_GEAR_STAT;
    TOTALS.ele += BASE_GEAR_STAT;

    if (GEAR_STATE.stat !== null) TOTALS[GEAR_STATE.stat] += STAT_MAX - BASE_GEAR_STAT;

    GEAR_STATE.gearMods.forEach(mod => {
      if (mod.type === null) return;

      const MOD = GAME_DATA.gear_mods.find(m => m.id === mod.type);

      TOTALS[MOD.type] += MOD.value;
    });
  });

  return TOTALS;
}

export function renderGearStats() {
  const TOTALS = computeGearStats();

  DOM.stats.fa.textContent = TOTALS.fa.toLocaleString('en-US');
  DOM.stats.sta.textContent = TOTALS.sta.toLocaleString('en-US');
  DOM.stats.ele.textContent = TOTALS.ele.toLocaleString('en-US');
}

function openGearTalentPicker(slot) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'gear-talent';

  const TALENTS = GAME_DATA.gear_talents.filter(t => t.compat.slot === slot);
  TALENTS.sort((a, b) => a.name.localeCompare(b.name));

  openModal(
    TALENTS.map(t => `
      <div class="talent" data-id="${t.id}">
        <div class="name-container">
          <strong class="quality">${STRINGS.talents.talent}</strong>
          <span class="separator"> | </span>
          <span class="name">${t.name}</span>
        </div>
        <div class="desc">${t.desc}</div>
      </div>
    `).join(''),
    STRINGS.talents.choose
  );
}

function renderGearTalent(slot) {
  const GEAR_STATE = BUILD[slot];
  const CONTAINER  = document.getElementById(`gp-${slot}-talent`);

  if (GEAR_STATE.talent === undefined) {
    CONTAINER.hidden = true;
    return;
  }
  CONTAINER.hidden = false;

  const IS_LOCKED = GEAR_STATE.talentLocked;
  const TALENT_ID = GEAR_STATE.talent;

  if (TALENT_ID !== null) {
    const TALENT = GAME_DATA.gear_talents.find(t => t.id === TALENT_ID);

    CONTAINER.querySelector('.name-container .name').textContent = TALENT.name;
    CONTAINER.querySelector('.desc').innerHTML = TALENT.desc;
  } else {
    CONTAINER.querySelector('.name-container .name').textContent = STRINGS.talents.name;
    CONTAINER.querySelector('.desc').textContent = STRINGS.talents.desc;
  }

  CONTAINER.classList.toggle('locked', IS_LOCKED);
  CONTAINER.onclick = IS_LOCKED ? null : () => openGearTalentPicker(slot);
}

export function selectGearTalent(slot, talentId) {
  BUILD[slot].talent = talentId;
  renderGearTalent(slot);
}

document.querySelectorAll('.stat-radio').forEach(radio => {
  radio.addEventListener('change', e => {
    const SLOT = e.target.name.split('-')[0];

    if (BUILD[SLOT] === null) return;

    BUILD[SLOT].stat = e.target.value;
    updateAddressBar();
    renderGearStats();
  });
});
