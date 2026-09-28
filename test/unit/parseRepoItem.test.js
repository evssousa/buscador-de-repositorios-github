const { parseRepoItem } = require("../../src/app.js");

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

describe("parseRepoItem", () => {
  test("mapeia um item completo da API para o formato usado na interface", () => {
    const resultado = parseRepoItem(criarItemDaApi());

    expect(resultado).toEqual({
      author: "octocat",
      avatarUrl: "https://avatars/octocat.png",
      name: "Hello-World",
      description: "My first repository on GitHub!",
      language: "JavaScript",
      stars: 1500,
      htmlUrl: "https://github.com/octocat/Hello-World",
    });
  });

  test("usa um texto substituto quando description é null", () => {
    const resultado = parseRepoItem(criarItemDaApi({ description: null }));

    expect(typeof resultado.description).toBe("string");
    expect(resultado.description.trim().length).toBeGreaterThan(0);
  });

  test("usa um texto substituto quando language é null", () => {
    const resultado = parseRepoItem(criarItemDaApi({ language: null }));

    expect(typeof resultado.language).toBe("string");
    expect(resultado.language.trim().length).toBeGreaterThan(0);
  });

  test("preserva o número de estrelas como número", () => {
    const resultado = parseRepoItem(criarItemDaApi({ stargazers_count: 0 }));

    expect(resultado.stars).toBe(0);
  });
});
