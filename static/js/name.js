import { GAME_DATA } from './data.js';
import { STATE, BUILD } from './state.js';
import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { openModal } from './modal.js';

export function openNamePicker() {
  STATE.activeMode = 'loadout-name';

  const SORTED_NAMES = [...GAME_DATA.build_names].sort((a, b) => a.name.localeCompare(b.name));

  openModal(`
    ${BUILD.name !== null
      ? `<button class="build-name" id="clear-slot">${STRINGS.loadout.empty}</button>`
      : ''}
    ${SORTED_NAMES.map(item => `
      <button class="build-name" data-id="${item.id}">${item.name}</button>
    `).join('')}
  `, STRINGS.loadout.choose);
}

export function selectLoadoutName(id) {
  const NAME_ID     = Number(id);
  const MATCH       = GAME_DATA.build_names.find(name => name.id === NAME_ID);
  const IS_SELECTED = MATCH !== undefined;

  BUILD.name = NAME_ID;
  DOM.meta.name.textContent = MATCH ? MATCH.name : STRINGS.loadout.empty;
  DOM.meta.name.classList.toggle('selected', IS_SELECTED);
}

export function clearLoadoutName() {
  BUILD.name = null;
  DOM.meta.name.textContent = STRINGS.loadout.empty;
  DOM.meta.name.classList.remove('selected');
}
