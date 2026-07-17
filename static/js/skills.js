import { GAME_DATA } from './data.js';
import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { BUILD, STATE } from './state.js';
import { openModal } from './modal.js';

function findSkill(pool, skillId) {
  for (const WING of Object.keys(pool)) {
    const FOUND = pool[WING].find(s => s.id === skillId);

    if (FOUND) return FOUND;
  }

  return null;
}

export function openSkillPicker(slot) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'skill';

  const IS_ULT  = slot === 'skillUlt';
  const POOL    = IS_ULT ? GAME_DATA.skills_ult : GAME_DATA.skills;
  let otherSlot = null;

  if (slot === 'skill1') otherSlot = 'skill2';
  else if (slot === 'skill2') otherSlot = 'skill1';

  const OTHER_ID   = otherSlot ? BUILD[otherSlot] : null;
  const OTHER_BASE = OTHER_ID ? OTHER_ID.split('-')[0] : null;

  const HTML = Object.keys(POOL).map(wing => {
    const SKILLS = POOL[wing].filter(s => !OTHER_BASE || s.id.split('-')[0] !== OTHER_BASE);

    if (!IS_ULT) {
      SKILLS.sort((a, b) => {
        const BASE_A = a.id.split('-')[0];
        const BASE_B = b.id.split('-')[0];

        if (BASE_A !== BASE_B) {
          const INDEX_A = POOL[wing].findIndex(s => s.id === BASE_A);
          const INDEX_B = POOL[wing].findIndex(s => s.id === BASE_B);
          return INDEX_A - INDEX_B;
        }
        if (a.id === BASE_A) return -1;
        if (b.id === BASE_B) return 1;

        return a.name.localeCompare(b.name);
      });
    }

    if (SKILLS.length === 0) return '';

    return `
      <div class="wing">
        <div class="wing-name ${GAME_DATA.wings[wing].toLowerCase()}">${GAME_DATA.wings[wing].toUpperCase()}</div>
        ${SKILLS.map(s => `
          <div class="skill" data-id="${s.id}">
            <div class="sprite-container">
              <div class="sprite ${s.id}" role="presentation"></div>
            </div>
            <div class="info-container">
              <div class="name">${s.name}</div>
              <div class="desc">${s.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  openModal(HTML, STRINGS.skills.choose);
}

function renderSkill(slot) {
  const SKILL_ID  = BUILD[slot];
  const POOL      = slot === 'skillUlt' ? GAME_DATA.skills_ult : GAME_DATA.skills;
  const SKILL     = findSkill(POOL, SKILL_ID);
  const CONTAINER = DOM.skills[slot];
  const SPRITE    = CONTAINER.querySelector('.sprite');

  SPRITE.className = 'sprite';
  SPRITE.classList.add(SKILL.id);
  CONTAINER.dataset.tooltip = `${SKILL.name}\n${SKILL.desc}`;
  CONTAINER.setAttribute('aria-label', `${SKILL.name} - Click to change`);
}

export function selectSkill(slot, skillId) {
  BUILD[slot] = skillId;
  renderSkill(slot);
}
