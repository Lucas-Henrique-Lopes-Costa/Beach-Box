/// <reference types="cypress" />

describe("Testes Black-Box no Beach-Box", () => {
  beforeEach(() => {
    cy.visit("/"); // Visita a página inicial do projeto
  });

  it("Deve carregar a página inicial corretamente", () => {
    cy.contains("Beach Box").should("be.visible"); // Verifica se o título está presente
  });

  // it("Deve navegar entre as páginas corretamente", () => {
  //   cy.get("nav a").contains("Reservas").click(); // Clica no link de reservas
  //   cy.url().should("include", "/reservas"); // Verifica se a URL mudou corretamente
  // });

  // it("Deve validar o formulário de login", () => {
  //   cy.get('input[name="email"]').type("teste@teste.com");
  //   cy.get('input[name="password"]').type("senha123");
  //   cy.get('button[type="submit"]').click();
  //   cy.contains("Login realizado com sucesso").should("be.visible");
  // });

  // it("Deve exibir erro ao tentar login com credenciais inválidas", () => {
  //   cy.get('input[name="email"]').type("emailinvalido@teste.com");
  //   cy.get('input[name="password"]').type("senhaerrada");
  //   cy.get('button[type="submit"]').click();
  //   cy.contains("Credenciais inválidas").should("be.visible");
  // });
});
