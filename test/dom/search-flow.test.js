const { resetDom, flushPromises, dispatchSearch } = require("./support/domFixture");

function criarItemDaApi(overrides = {}) {
  return {
    owner: { login: "octocat", avatar_url: "https://avatars/octocat.png" },
    name: "Hello-World",
    description: "My first repository on GitHub!",
    language: "JavaScript",
    stargazers_count: 1500,
    html_url: "https://github.com/octocat/Hello-World",
    ...overrides,
  };
}

function criarRespostaOk(items) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ items }),
  };
}

describe("fluxo de busca com sucesso", () => {
  beforeEach(() => {
    jest.resetModules();
    resetDom();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete global.fetch;
  });

  test("não dispara requisição enquanto a pessoa apenas digita", () => {
    const app = require("../../src/app.js");
    app.init();

    document.getElementById("search-term").value = "hello";
    document.getElementById("search-term").dispatchEvent(new Event("input", { bubbles: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("ignora ENTER com termo vazio ou somente espaços", () => {
    const app = require("../../src/app.js");
    app.init();

    dispatchSearch("   ");

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("dispara a busca ao pressionar ENTER e mostra carregamento com contador de segundos", () => {
    const app = require("../../src/app.js");
    app.init();

    let resolverFetch;
    global.fetch.mockImplementation(() => new Promise((resolve) => { resolverFetch = resolve; }));

    dispatchSearch("hello");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [urlChamada] = global.fetch.mock.calls[0];
    expect(urlChamada).toContain(encodeURIComponent("hello"));

    const status = document.getElementById("status-message").textContent;
    expect(status).toMatch(/busc/i);

    jest.advanceTimersByTime(1000);
    expect(document.getElementById("status-message").textContent).toMatch(/1/);

    jest.advanceTimersByTime(2000);
    expect(document.getElementById("status-message").textContent).toMatch(/3/);

    resolverFetch(criarRespostaOk([]));
  });

  test("exibe aviso de demora após 5 segundos sem cancelar a requisição", async () => {
    const app = require("../../src/app.js");
    app.init();

    let resolverFetch;
    global.fetch.mockImplementation(() => new Promise((resolve) => { resolverFetch = resolve; }));

    dispatchSearch("hello");
    jest.advanceTimersByTime(5000);

    expect(document.getElementById("status-message").textContent.length).toBeGreaterThan(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolverFetch(criarRespostaOk([]));
    await flushPromises();
  });

  test("renderiza os repositórios retornados e encerra os timers ao concluir", async () => {
    const app = require("../../src/app.js");
    app.init();

    const items = [
      criarItemDaApi({ name: "repo-um", stargazers_count: 10 }),
      criarItemDaApi({ name: "repo-dois", stargazers_count: 5, description: null, language: null }),
    ];
    global.fetch.mockResolvedValue(criarRespostaOk(items));

    dispatchSearch("hello");
    await flushPromises();

    const cartoes = document.querySelectorAll("#results-list .repo-item");
    expect(cartoes).toHaveLength(2);

    const primeiro = cartoes[0];
    expect(primeiro.querySelector(".repo-fullname").textContent).toMatch(/octocat/i);
    expect(primeiro.querySelector(".repo-fullname").textContent).toMatch(/repo-um/i);
    expect(primeiro.querySelector(".repo-stars").textContent).toMatch(/10/);
    expect(primeiro.querySelector("img.repo-avatar").getAttribute("src")).toBe(
      "https://avatars/octocat.png"
    );

    const link = primeiro.querySelector("a.repo-link");
    expect(link.getAttribute("href")).toBe("https://github.com/octocat/Hello-World");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toEqual(expect.stringContaining("noopener"));

    const segundo = cartoes[1];
    expect(segundo.querySelector(".repo-description").textContent.trim().length).toBeGreaterThan(0);
    expect(segundo.querySelector(".repo-language").textContent.trim().length).toBeGreaterThan(0);

    expect(jest.getTimerCount()).toBe(0);
  });

  test("uma nova busca substitui a anterior e limpa os timers antigos", async () => {
    const app = require("../../src/app.js");
    app.init();

    let resolverPrimeiraBusca;
    global.fetch.mockImplementationOnce(
      () => new Promise((resolve) => { resolverPrimeiraBusca = resolve; })
    );

    dispatchSearch("primeiro-termo");
    jest.advanceTimersByTime(2000);

    global.fetch.mockResolvedValueOnce(
      criarRespostaOk([criarItemDaApi({ name: "repo-novo" })])
    );
    dispatchSearch("segundo-termo");
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelectorAll("#results-list .repo-item")).toHaveLength(1);
    expect(
      document.querySelector("#results-list .repo-item .repo-fullname").textContent
    ).toMatch(/repo-novo/i);
    expect(jest.getTimerCount()).toBe(0);

    if (resolverPrimeiraBusca) {
      resolverPrimeiraBusca(criarRespostaOk([]));
    }
  });
});
