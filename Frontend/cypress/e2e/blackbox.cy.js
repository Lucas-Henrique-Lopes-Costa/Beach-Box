describe("CRUD Agendamento", () => {
  describe("Gerenciamento de Agendamentos", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/agendamentos");

      // Aguarda enquanto "Carregando..." estiver visível
      cy.contains("div", "Carregando...", { timeout: 20000 }).should(
        "not.exist"
      );
    });

    it("Deve criar, editar e excluir um agendamento", () => {
      const dataHora = "2025-01-15T14:30";
      const dataFormatada = "16/01/2025, 16:30";
      const precoInicial = "100.00";
      const precoEditado = "150.00";
      const cliente = "Heitor";
      const quadra = "Quadra E";

      // Criar um novo agendamento
      cy.wait(300); // Aguarda o carregamento do formulário
      cy.contains("button", "Novo Agendamento").click();
      cy.get("form").should("be.visible");
      cy.wait(1500); // Aguarda o carregamento do formulário
      cy.get('input[name="dataHoraAgendamento"]').type(dataHora);
      cy.wait(500);
      cy.get('input[name="preco"]').type(precoInicial);
      cy.wait(500);
      cy.get('select[name="idCliente"]').select(cliente);
      cy.wait(500);
      cy.get('select[name="idQuadra"]').select(quadra);
      cy.wait(500);
      cy.contains("button", "Criar").click();

      // Função para percorrer a tabela até encontrar o agendamento
      function encontrarAgendamento() {
        cy.wait(6500); // Aguarda carregamento da tabela
        cy.get("table tbody").then(($tbody) => {
          if ($tbody.text().includes(cliente)) {
            cy.log("✅ Agendamento encontrado!");
          } else {
            cy.get("button")
              .contains("Próximo")
              .then(($btn) => {
                if (!$btn.is(":disabled")) {
                  cy.wrap($btn).click();
                  cy.wait(2000); // Aguarda troca de página
                  encontrarAgendamento();
                }
              });
          }
        });
      }

      // Percorrer a tabela até encontrar o agendamento
      encontrarAgendamento();

      // Clicar no botão "Editar"
      cy.contains("tr", cliente).within(() => {
        cy.wait(1000); // Aguarda antes de clicar
        cy.contains("button", "Editar").click();
      });

      // Editar o preço do agendamento
      cy.get("form").should("be.visible");
      cy.wait(2000); // Aguarda carregamento do popup
      cy.get('input[name="preco"]').clear().type(precoEditado);
      cy.wait(500);
      cy.contains("button", "Atualizar").click();

      // Reencontrar o agendamento editado
      encontrarAgendamento();

      // Verificar se o preço foi atualizado
      cy.contains("tr", cliente).within(() => {
        cy.contains("td", precoEditado).should("exist");
      });

      // Excluir o agendamento
      cy.contains("tr", cliente).within(() => {
        cy.contains("button", "Excluir").click();
      });

      // Verificar que o agendamento foi removido
      encontrarAgendamento();
      cy.get("table tbody").should("not.contain", cliente);
    });
  });
});

describe("CRUD Cliente", () => {
  describe("Gerenciamento de Clientes", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/clientes");

      // Aguarda enquanto "Carregando..." estiver visível
      cy.contains("div", "Carregando...", { timeout: 20000 }).should(
        "not.exist"
      );
    });

    it("Deve criar, editar e excluir um cliente", () => {
      const nomeCliente = "Teste Cypress";
      const telefone = "(35) 99999-8888";
      const endereco = "Rua Cypress, 123 - Teste, MG";
      const telefoneEditado = "(35) 98888-7777";

      // Criar um novo cliente
      cy.contains("button", "Novo Cliente").click();
      cy.get("form").should("be.visible");
      cy.wait(1500); // Aguarda o carregamento do formulário
      cy.get('input[name="nome"]').type(nomeCliente);
      cy.wait(500);
      cy.get('input[name="telefone"]').type(telefone);
      cy.wait(500);
      cy.get('input[name="endereco"]').type(endereco);
      cy.wait(500);
      cy.contains("button", "Criar").click();

      // Função para percorrer a tabela até encontrar o cliente
      function encontrarCliente() {
        cy.wait(6500); // Aguarda carregamento da tabela
        cy.get("table tbody").then(($tbody) => {
          if ($tbody.text().includes(nomeCliente)) {
            cy.log("✅ Cliente encontrado!");
          } else {
            cy.get("button")
              .contains("Próximo")
              .then(($btn) => {
                if (!$btn.is(":disabled")) {
                  cy.wrap($btn).click();
                  cy.wait(2000); // Aguarda troca de página
                  encontrarCliente();
                }
              });
          }
        });
      }

      // Percorrer a tabela até encontrar o cliente
      encontrarCliente();

      // Clicar no botão "Editar"
      cy.contains("tr", nomeCliente).within(() => {
        cy.wait(1000); // Aguarda antes de clicar
        cy.contains("button", "Editar").click();
      });

      // Editar o telefone do cliente
      cy.get("form").should("be.visible");
      cy.wait(2000); // Aguarda carregamento do popup
      cy.get('input[name="telefone"]').clear().type(telefoneEditado);
      cy.wait(500);
      cy.contains("button", "Atualizar").click();

      // Reencontrar o cliente editado
      encontrarCliente();

      // Verificar se o telefone foi atualizado
      cy.contains("tr", nomeCliente).within(() => {
        cy.contains("td", telefoneEditado).should("exist");
      });

      // Excluir o cliente
      cy.contains("tr", nomeCliente).within(() => {
        cy.contains("button", "Excluir").click();
      });

      // Verificar que o cliente foi removido
      encontrarCliente();
      cy.get("table tbody").should("not.contain", nomeCliente);
    });
  });
});

describe("CRUD Unidade", () => {
  describe("Gerenciamento de Unidades", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/unidades");

      // Aguarda enquanto "Carregando..." estiver visível
      cy.contains("div", "Carregando...", { timeout: 20000 }).should(
        "not.exist"
      );
    });

    it("Deve criar, editar e excluir uma unidade", () => {
      const nomeUnidade = "Unidade Cypress";
      const localizacao = "Rua Cypress, 999 - Teste, MG";
      const telefone = "(35) 99999-1234";
      const telefoneEditado = "(35) 98888-5678";

      // Criar uma nova unidade
      cy.contains("button", "Nova Unidade").click();
      cy.get("form").should("be.visible");
      cy.wait(1500); // Aguarda o carregamento do formulário
      cy.get('input[name="nome"]').type(nomeUnidade);
      cy.wait(500);
      cy.get('input[name="localizacao"]').type(localizacao);
      cy.wait(500);
      cy.get('input[name="telefone"]').type(telefone);
      cy.wait(500);
      cy.contains("button", "Criar").click();

      // Função para percorrer a tabela até encontrar a unidade
      function encontrarUnidade() {
        // reload na pagina
        cy.reload();
        cy.wait(6500); // Aguarda carregamento da tabela
        cy.get("table tbody").then(($tbody) => {
          if ($tbody.text().includes(nomeUnidade)) {
            cy.log("✅ Unidade encontrada!");
          } else {
            cy.get("button")
              .contains("Próximo")
              .then(($btn) => {
                if (!$btn.is(":disabled")) {
                  cy.wrap($btn).click();
                  cy.wait(2000); // Aguarda troca de página
                  encontrarUnidade();
                }
              });
          }
        });
      }

      // Percorrer a tabela até encontrar a unidade
      encontrarUnidade();

      // Clicar no botão "Editar"
      cy.contains("tr", nomeUnidade).within(() => {
        cy.wait(1000); // Aguarda antes de clicar
        cy.contains("button", "Editar").click();
      });

      // Editar o telefone da unidade
      cy.get("form").should("be.visible");
      cy.wait(2000); // Aguarda carregamento do popup
      cy.get('input[name="telefone"]').clear().type(telefoneEditado);
      cy.wait(500);
      cy.contains("button", "Atualizar").click();

      // Reencontrar a unidade editada
      encontrarUnidade();

      // Verificar se o telefone foi atualizado
      cy.contains("tr", nomeUnidade).within(() => {
        cy.contains("td", telefoneEditado).should("exist");
      });

      // Excluir a unidade
      cy.contains("tr", nomeUnidade).within(() => {
        cy.contains("button", "Excluir").click();
      });

      // Verificar que a unidade foi removida
      encontrarUnidade();
      cy.get("table tbody").should("not.contain", nomeUnidade);
    });
  });
});

describe("CRUD Quadra", () => {
  describe("Gerenciamento de Quadras", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/quadras");

      // Aguarda enquanto "Carregando..." estiver visível
      cy.contains("div", "Carregando...", { timeout: 20000 }).should(
        "not.exist"
      );
    });

    it("Deve criar, editar, alterar disponibilidade e excluir uma quadra", () => {
      const nomeQuadra = "Quadra Cypress";
      const localizacao = "Rua Cypress, 500 - Teste, MG";
      const tipo = "Beach Tênis";
      const unidade = "Unidade Centro";
      const preco = "80";
      const precoEditado = "90";

      // Criar uma nova quadra
      cy.contains("button", "Nova Quadra").click();
      cy.get("form").should("be.visible");
      cy.wait(1500); // Aguarda o carregamento do formulário
      cy.get('input[name="nome"]').type(nomeQuadra);
      cy.wait(500);
      cy.get('input[name="localizacao"]').type(localizacao);
      cy.wait(500);
      cy.get('select[name="tipo"]').select(tipo);
      cy.wait(500);
      cy.get('select[name="idUnidade"]').select(unidade);
      cy.wait(500);
      cy.get('input[name="precobase"]').type(preco);
      cy.wait(500);
      cy.contains("button", "Criar").click();

      // Função para percorrer a tabela até encontrar a quadra
      function encontrarQuadra() {
        cy.wait(6500); // Aguarda carregamento da tabela
        cy.get("table tbody").then(($tbody) => {
          if ($tbody.text().includes(nomeQuadra)) {
            cy.log("✅ Quadra encontrada!");
          } else {
            cy.get("button")
              .contains("Próximo")
              .then(($btn) => {
                if (!$btn.is(":disabled")) {
                  cy.wrap($btn).click();
                  cy.wait(2000); // Aguarda troca de página
                  encontrarQuadra();
                }
              });
          }
        });
      }

      // Percorrer a tabela até encontrar a quadra
      encontrarQuadra();

      // Clicar no botão "Editar"
      cy.contains("tr", nomeQuadra).within(() => {
        cy.wait(1000); // Aguarda antes de clicar
        cy.contains("button", "Editar").click();
      });

      // Editar o preço da quadra
      cy.get("form").should("be.visible");
      cy.wait(2000); // Aguarda carregamento do formulário
      cy.get('input[name="precobase"]').clear().type(precoEditado);
      cy.wait(500);
      cy.contains("button", "Atualizar").click();

      // Reencontrar a quadra editada
      encontrarQuadra();

      // Verificar se o preço foi atualizado
      cy.contains("tr", nomeQuadra).within(() => {
        cy.contains("td", `R$ ${precoEditado}.00`).should("exist");
      });

      // Alterar disponibilidade da quadra
      cy.contains("tr", nomeQuadra).within(() => {
        cy.contains("button", "Alterar").click();
      });

      // Verificar se o status de disponibilidade mudou
      cy.contains("tr", nomeQuadra).within(() => {
        cy.wait(1000);
        cy.get("td")
          .contains(/Disponível|Indisponível/)
          .should("exist");
      });

      // Excluir a quadra
      cy.contains("tr", nomeQuadra).within(() => {
        cy.contains("button", "Excluir").click();
      });

      // Verificar que a quadra foi removida
      encontrarQuadra();
      cy.get("table tbody").should("not.contain", nomeQuadra);
    });
  });
});

describe("Relatórios", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/relatorios");

    // Aguarda enquanto "Carregando..." estiver visível
    cy.contains("div", "Carregando...", { timeout: 20000 }).should("not.exist");
  });

  it("Deve carregar o relatório diário automaticamente", () => {
    // Verifica se o relatório diário inicial contém a frase "Relatório Diário"
    cy.contains("h2", "Relatório Diário").should("exist");
  });

  it("Deve gerar um relatório customizado", () => {
    // Obtém a data atual no formato YYYY-MM-DD
    const hoje = new Date();
    const doisDiasAntes = new Date();
    const doisDiasDepois = new Date();

    doisDiasAntes.setDate(hoje.getDate() - 2);
    doisDiasDepois.setDate(hoje.getDate() + 2);

    const formatarData = (data) => data.toISOString().split("T")[0]; // Converte para YYYY-MM-DD

    const dataInicio = formatarData(doisDiasAntes);
    const dataFim = formatarData(doisDiasDepois);

    // Preenche as datas do relatório customizado
    cy.get('input[type="date"]').first().clear().type(dataInicio);
    cy.get('input[type="date"]').last().clear().type(dataFim);

    // Clica no botão "Gerar Relatório Customizado"
    cy.contains("button", "Gerar Relatório Customizado").click();

    // Aguarda o carregamento do relatório customizado
    cy.wait(5000); // Tempo para gerar os dados

    // Verifica se o relatório customizado contém "Relatório Customizado"
    cy.contains("h2", "Relatório Customizado").should("exist");

    // Verifica se há métricas carregadas no relatório customizado
    cy.get("div.rounded-xl").should("have.length.greaterThan", 0);
  });
});
