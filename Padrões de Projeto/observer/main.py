from agendamento import Agendamento
from relatorio import Relatorio
from datetime import datetime


def executar_demo_observer():
    print("1. Criando o objeto Relatorio...")
    relatorio = Relatorio()
    input("Pressione Enter para continuar...")

    print("\n2. Criando os objetos Agendamento...")
    agendamento1 = Agendamento(1, datetime(2025, 1, 20, 10, 0), 100.0, 1, 1)
    agendamento2 = Agendamento(2, datetime(2025, 1, 21, 15, 0), 150.0, 2, 2)
    print(f"Agendamentos criados:\n{agendamento1.obter()}\n{agendamento2.obter()}")
    input("Pressione Enter para continuar...")

    print("\n3. Adicionando o relatório como observer dos agendamentos...")
    agendamento1.adicionar_observer(relatorio)
    agendamento2.adicionar_observer(relatorio)
    input("Pressione Enter para continuar...")

    print("\n4. Adicionando agendamentos ao relatório...")
    relatorio.adicionar_agendamento(agendamento1)
    relatorio.adicionar_agendamento(agendamento2)
    print(f"Faturamento inicial: {relatorio.obter_faturamento()}")
    print(f"Quantidade de agendamentos: {relatorio.obter_agendamentos()}")
    input("Pressione Enter para continuar...")

    print("\n5. Editando um agendamento (alterando preço)...")
    agendamento1.editar(preco=120.0)
    print(f"Novo faturamento: {relatorio.obter_faturamento()}")
    input("Pressione Enter para continuar...")


executar_demo_observer()