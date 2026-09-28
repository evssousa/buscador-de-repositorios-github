const { resetDom, flushPromises, dispatchSearch } = require("./support/domFixture");

describe("estado vazio", () => {
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

  test("mostra estado vazio quando a API não retorna repositórios", async () => {
    const app = require("../../src/app.js");
    app.init();

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });

    dispatchSearch("zzzzzzz-termo-sem-resultado");
    await flushPromises();

    expect(document.querySelectorAll("#results-list .repo-item")).toHaveLength(0);
    expect(document.getElementById("status-message").textContent.trim().length).toBeGreaterThan(0);
    expect(jest.getTimerCount()).toBe(0);
  });
});
