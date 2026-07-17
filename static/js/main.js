import { DOM } from './dom.js';
import { STRINGS } from './strings.js';
import { STATE } from './state.js';
import { openModal, closeModal } from './modal.js';
import { openWeaponPicker, selectWeapon, selectWeaponTalent, selectWeaponMod, clearWeaponSlot } from './weapons.js';
import { openGearPicker, selectGear, selectGearTalent, selectGearAttr, selectGearModType, selectGearModBonus, selectPerfMod } from './gear.js';
import { openSkillPicker, selectSkill } from './skills.js';
import { openPlayerTalentPicker, selectPlayerTalent } from './talents.js';
import { loadBuildFromUrl, updateAddressBar, openShareModal } from './share.js';

// Primary Weapon
DOM.slots.primary.addEventListener('click', () => openWeaponPicker('primary'));

// Secondary Weapon
DOM.slots.secondary.addEventListener('click', () => openWeaponPicker('secondary'));

// Sidearm
DOM.slots.handgun.addEventListener('click', () => openWeaponPicker('handgun'));

// Gear
DOM.gear.chest.addEventListener('click', () => openGearPicker('chest'));
DOM.gear.mask.addEventListener('click', () => openGearPicker('mask'));
DOM.gear.kneepads.addEventListener('click', () => openGearPicker('kneepads'));
DOM.gear.backpack.addEventListener('click', () => openGearPicker('backpack'));
DOM.gear.gloves.addEventListener('click', () => openGearPicker('gloves'));
DOM.gear.holster.addEventListener('click', () => openGearPicker('holster'));

// Skills
DOM.skills.skill1.addEventListener('click', () => openSkillPicker('skill1'));
DOM.skills.skillUlt.addEventListener('click', () => openSkillPicker('skillUlt'));
DOM.skills.skill2.addEventListener('click', () => openSkillPicker('skill2'));

// Player Talents
DOM.player_talents.talent1.addEventListener('click', () => openPlayerTalentPicker('talent1'));
DOM.player_talents.talent2.addEventListener('click', () => openPlayerTalentPicker('talent2'));
DOM.player_talents.talent3.addEventListener('click', () => openPlayerTalentPicker('talent3'));
DOM.player_talents.talent4.addEventListener('click', () => openPlayerTalentPicker('talent4'));

// Share Build URL
DOM.shareButton.addEventListener('click', () => openShareModal());

// Issues button
DOM.issueButton.addEventListener('click', () => openModal(`
  <div class="issues">
    <p>
      If you're having an issue with the builder, please open a ticket
      <a href="https://github.com/Strappazzon/td1-builder/issues/new?template=bug-report.yml">on GitHub</a>.
      <br>
      You can also <a href="https://strappazzon.xyz/contact/">contact me</a> directly if you don't have an account.
    </p>
  </div>
`, STRINGS.help.issues));

// Modal
DOM.modal.container.addEventListener('click', e => {
  if (e.target.closest('#share-url')) {
    const INPUT = e.target.closest('#share-url');
    const HELP  = document.querySelector('.help');

    INPUT.select();
    navigator.clipboard.writeText(INPUT.value);

    HELP.textContent = STRINGS.help.clipboard.copied;
    setTimeout(() => {
      HELP.textContent = STRINGS.help.clipboard.copy;
    }, 2000);

    return;
  }

  if (e.target.closest('#clear-slot')) {
    STATE.activeMode === 'weapon' && clearWeaponSlot(STATE.activeSlot);

    updateAddressBar();
    closeModal();

    return;
  }

  const ITEM = e.target.closest('[data-id]');
  if (!ITEM) return;

  if (STATE.activeMode === 'weapon') {
    selectWeapon(STATE.activeSlot, ITEM.dataset.id);
  } else if (STATE.activeMode === 'wp-talent') {
    selectWeaponTalent(STATE.activeSlot, STATE.activeTalentIndex, ITEM.dataset.id);
  } else if (STATE.activeMode === 'wp-mod') {
    selectWeaponMod(STATE.activeSlot, STATE.activeModSlot, STATE.activeModIndex, ITEM.dataset.id);
  } else if (STATE.activeMode === 'skill') {
    selectSkill(STATE.activeSlot, ITEM.dataset.id);
  } else if (STATE.activeMode === 'player-talent') {
    selectPlayerTalent(STATE.activeSlot, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear') {
    selectGear(STATE.activeSlot, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear-talent') {
    selectGearTalent(STATE.activeSlot, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear-major' || STATE.activeMode === 'gear-minor') {
    selectGearAttr(STATE.activeSlot, STATE.activeAttrType, STATE.activeGearIndex, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear-mod-type') {
    selectGearModType(STATE.activeSlot, STATE.activeGearIndex, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear-mod-bonus') {
    selectGearModBonus(STATE.activeSlot, STATE.activeGearIndex, ITEM.dataset.id);
  } else if (STATE.activeMode === 'gear-perf') {
    selectPerfMod(STATE.activeSlot, STATE.activeGearIndex, ITEM.dataset.id);
  }

  updateAddressBar();
  closeModal();
});

// Modal: Close button
DOM.modal.close.addEventListener('click', () => {
  closeModal();
});

// Modal: Close shortcut
DOM.modal.backdrop.addEventListener('keydown', e => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    closeModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadBuildFromUrl();
  DOM.loader.remove();
  DOM.body.classList.remove('no-overflow');
});
