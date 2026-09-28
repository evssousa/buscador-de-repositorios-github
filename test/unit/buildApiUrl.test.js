const { buildApiUrl } = require("../../src/app.js");

describe("buildApiUrl", () => {

  test("monta a URL da API com o termo codificado e os parâmetros de ordenação", () => {
    const url = buildApiUrl("react hooks");

    expect(url).toContain("https://api.github.com/search/repositories?q=");
    expect(url).toContain(encodeURIComponent("react hooks"));
    expect(url).toContain("sort=stars");
    expect(url).toContain("per_page=10");
  });

  test("codifica caracteres especiais do termo", () => {
    const url = buildApiUrl("c++ & c#");

    expect(url).toContain(encodeURIComponent("c++ & c#"));
    expect(url).not.toContain("c++ & c#");
  });
});
