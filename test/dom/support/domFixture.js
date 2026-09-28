/**
 * Constrói o DOM mínimo exigido pelo contrato técnico (docs/projeto.md, seção 8.2)
 * para os testes de integração, sem depender do index.html real que você irá criar.
 */
function resetDom() {
  document.body.innerHTML = `
    <form id="search-form">
      <label for="search-term">Buscar repositórios</label>
      <input id="search-term" type="text" />
    </form>
    <div id="status-message"></div>
    <ul id="results-list"></ul>
  `;
}

/** Aguarda algumas voltas da fila de microtasks, para permitir que cadeias de await dentro de app.js sejam concluídas mesmo com fake timers ativos. */
async function flushPromises(voltas = 5) {
  for (let i = 0; i < voltas; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

function dispatchSearch(termo) {
  const input = document.getElementById("search-term");
  const form = document.getElementById("search-form");
  input.value = termo;
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

module.exports = { resetDom, flushPromises, dispatchSearch };
