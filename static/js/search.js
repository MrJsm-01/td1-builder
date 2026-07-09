// Adapted from: https://github.com/DivisionBuilds/divisionbuilds.github.io/blob/master/js/index.js

const SEARCH_INPUT = document.querySelector('#search');

function debounce(func, delay) {
  let t = null;

  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => func(...args), delay);
  };
}

function search(query) {
  const BUILD_CARDS  = document.querySelectorAll('.cards .card.build');
  const SEARCH_QUERY = query.toLowerCase().trim();
  const RE           = new RegExp('^(?=.*' + SEARCH_QUERY.replace(/ /g, ')(?=.*') + ').*$');

  BUILD_CARDS.forEach(card => {
    const TEXT = [
      card.querySelector('.build-title__name').textContent,
      card.querySelector('.build-author__name').textContent,
      ...Array.from(card.querySelectorAll('.build-tag')).map(t => t.textContent)
    ].join(' ').toLowerCase();

    if (RE.test(TEXT)) {
      card.classList.remove('d-none');
    } else {
      card.classList.add('d-none');
    }
  });
}

if (SEARCH_INPUT) SEARCH_INPUT.addEventListener('input', debounce(e => search(e.target.value), 300));
