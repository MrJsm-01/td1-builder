import { GAME_DATA } from './data.js';
import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { BUILD, STATE } from './state.js';
import { openModal } from './modal.js';

const PL_TALENT_SLOTS = [
  'talent1',
  'talent2',
  'talent3',
  'talent4'
];

export function openPlayerTalentPicker(slot) {
  STATE.activeSlot = slot;
  STATE.activeMode = 'player-talent';

  const CURRENT_IDS = PL_TALENT_SLOTS
    .filter(s => s !== slot)
    .map(s => BUILD[s])
    .filter(id => id !== null);
  const WINGS       = Object.keys(GAME_DATA.wings);
  const HTML        = WINGS.map(wing => {
    const TALENTS = GAME_DATA.player_talents[wing].filter(t => !CURRENT_IDS.includes(t.id));

    return `
      <div class="wing">
        <div class="wing-name ${GAME_DATA.wings[wing].toLowerCase()}">${GAME_DATA.wings[wing].toUpperCase()}</div>
        ${TALENTS.map(t => `
          <div class="player-talent" data-id="${t.id}">
            <div class="sprite-container">
              <div class="sprite ${t.id}" role="presentation"></div>
            </div>
            <div class="info-container">
              <div class="name">${t.name}</div>
              <div class="desc">${t.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  openModal(HTML, STRINGS.talents.choose_player);
}

function findPlayerTalent(talentId) {
  for (const WING of Object.keys(GAME_DATA.player_talents)) {
    const FOUND = GAME_DATA.player_talents[WING].find(t => t.id === talentId);

    if (FOUND) return FOUND;
  }

  return null;
}

function renderPlayerTalentSlot(slot) {
  const TALENT_ID = BUILD[slot];
  const TALENT    = findPlayerTalent(TALENT_ID);
  const CONTAINER = DOM.player_talents[slot];
  const SPRITE    = CONTAINER.querySelector('.sprite');

  SPRITE.className = 'sprite';
  SPRITE.classList.add(TALENT.id);
  CONTAINER.dataset.tooltip = `${TALENT.name}\n${TALENT.desc}`;
  CONTAINER.setAttribute('aria-label', `${TALENT.name} - Click to change`);
}

export function selectPlayerTalent(slot, talentId) {
  BUILD[slot] = talentId;
  renderPlayerTalentSlot(slot);
}
