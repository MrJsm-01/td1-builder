import { DOM } from './dom.js';

export function openModal(html) {
  DOM.modal.container.innerHTML = html;
  DOM.modal.backdrop.classList.remove('d-none');
  DOM.modal.container.scrollTop = 0;
  DOM.modal.backdrop.focus();
  DOM.body.classList.add('no-overflow');
}

export function closeModal() {
  DOM.modal.container.classList.add('closing');
  // See also: _sass/components/_modals.scss .modal-container.animated
  setTimeout(() => {
    DOM.modal.backdrop.classList.add('d-none');
    DOM.body.classList.remove('no-overflow');
    DOM.modal.container.textContent = '';
    DOM.modal.container.classList.remove('closing');
  }, 250);
}
