const { getFriendlyErrorMessage } = require("../../src/app.js");

describe("getFriendlyErrorMessage", () => {

  test("retorna uma mensagem para falha de rede (fetch rejeitada)", () => {
    const mensagem = getFriendlyErrorMessage(new TypeError("Failed to fetch"));

    expect(typeof mensagem).toBe("string");
    expect(mensagem.trim().length).toBeGreaterThan(0);
  });

  test("retorna uma mensagem para falha HTTP (status não-ok)", () => {
    const mensagem = getFriendlyErrorMessage({ ok: false, status: 404 });

    expect(typeof mensagem).toBe("string");
    expect(mensagem.trim().length).toBeGreaterThan(0);
  });

  test("retorna uma mensagem para falha ao interpretar o JSON", () => {
    const mensagem = getFriendlyErrorMessage(new SyntaxError("Unexpected token < in JSON"));

    expect(typeof mensagem).toBe("string");
    expect(mensagem.trim().length).toBeGreaterThan(0);
  });

  test("não expõe detalhes técnicos do erro original", () => {
    const mensagem = getFriendlyErrorMessage(new TypeError("Failed to fetch"));

    expect(mensagem).not.toMatch(/TypeError|SyntaxError|\[object/i);
  });
});
