import { DOM } from './dom.js';

// See _sass/components/_modals.scss .modal-container.animated
const ANIM_CLOSE_DURATION = 250;

export function openModal(html) {
  DOM.modal.container.innerHTML = html;
  DOM.modal.backdrop.classList.remove('d-none');
  DOM.modal.close.classList.remove('d-none');
  DOM.modal.container.scrollTop = 0;
  DOM.modal.backdrop.focus();
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
  }, ANIM_CLOSE_DURATION);
}
