import { DOM } from './dom.js';

// See: _sass/components/_modals.scss .modal-container.animated
const ANIM_CLOSE_DURATION = 250;
// Re-focus on the element that opened the modal
let triggerElement = null;

export function openModal(html, title) {
  triggerElement = document.activeElement;
  DOM.modal.container.innerHTML = html;
  DOM.modal.container.setAttribute('aria-label', title);
  DOM.modal.backdrop.classList.remove('d-none');
  DOM.modal.close.classList.remove('d-none');
  DOM.modal.container.scrollTop = 0;
  DOM.modal.container.focus();
  DOM.body.classList.add('no-overflow');
}

export function closeModal() {
  DOM.modal.container.classList.add('closing');
  DOM.modal.close.classList.add('d-none');
  setTimeout(() => {
    DOM.modal.backdrop.classList.add('d-none');
    DOM.body.classList.remove('no-overflow');
    DOM.modal.container.textContent = '';
    DOM.modal.container.classList.remove('closing');
    DOM.modal.container.removeAttribute('aria-label');
    triggerElement?.focus();
    triggerElement = null;
  }, ANIM_CLOSE_DURATION);
}
