const { resetDom, flushPromises, dispatchSearch } = require("./support/domFixture");

describe("estados de erro", () => {
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

  test("exibe mensagem amigável em falha de rede (fetch rejeitada)", async () => {
    const app = require("../../src/app.js");
    app.init();

    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    dispatchSearch("hello");
    await flushPromises();

    const status = document.getElementById("status-message").textContent;
    expect(status.trim().length).toBeGreaterThan(0);
    expect(status).not.toMatch(/TypeError|\[object/i);
    expect(document.querySelectorAll("#results-list .repo-item")).toHaveLength(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("exibe mensagem amigável em falha HTTP (status não-ok)", async () => {
    const app = require("../../src/app.js");
    app.init();

    global.fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: "Validation Failed" }),
    });

    dispatchSearch("hello");
    await flushPromises();

    const status = document.getElementById("status-message").textContent;
    expect(status.trim().length).toBeGreaterThan(0);
    expect(document.querySelectorAll("#results-list .repo-item")).toHaveLength(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("exibe mensagem amigável quando o corpo da resposta não é um JSON válido", async () => {
    const app = require("../../src/app.js");
    app.init();

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    });

    dispatchSearch("hello");
    await flushPromises();

    const status = document.getElementById("status-message").textContent;
    expect(status.trim().length).toBeGreaterThan(0);
    expect(status).not.toMatch(/SyntaxError|\[object/i);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("permite uma nova tentativa após um erro", async () => {
    const app = require("../../src/app.js");
    app.init();

    global.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    dispatchSearch("hello");
    await flushPromises();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            owner: { login: "octocat", avatar_url: "https://avatars/octocat.png" },
            name: "Hello-World",
            description: "desc",
            language: "JavaScript",
            stargazers_count: 1,
            html_url: "https://github.com/octocat/Hello-World",
          },
        ],
      }),
    });
    dispatchSearch("hello");
    await flushPromises();

    expect(document.querySelectorAll("#results-list .repo-item")).toHaveLength(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
