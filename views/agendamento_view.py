from controllers.agendamento_controller import AgendamentoController

class TelaAgendamento:
    def __init__(self):
        self.controller = AgendamentoController()

    def menu(self):
        while True:
            print("\n=== Menu Agendamento ===")
            print("1. Cadastrar Agendamento")
            print("2. Editar Agendamento")
            print("3. Excluir Agendamento")
            print("4. Obter Agendamento")
            print("5. Sair")
            escolha = input("Escolha uma opção: ")

            if escolha == "1":
                data_hora = input("Digite a data e hora (YYYY-MM-DD HH:MM:SS): ")
                preco = input("Digite o preço: ")
                id_cliente = input("Digite o ID do cliente: ")
                id_quadra = input("Digite o ID da quadra: ")
                resultado = self.controller.cadastrar_agendamento(
                    data_hora, float(preco), int(id_cliente), int(id_quadra)
                )
                print(resultado)

            elif escolha == "2":
                id = int(input("Digite o ID do agendamento: "))
                data_hora = input("Nova data e hora (ou deixe vazio): ")
                preco = input("Novo preço (ou deixe vazio): ")
                id_cliente = input("Novo ID do cliente (ou deixe vazio): ")
                id_quadra = input("Novo ID da quadra (ou deixe vazio): ")
                resultado = self.controller.editar_agendamento(
                    id,
                    data_hora if data_hora else None,
                    float(preco) if preco else None,
                    int(id_cliente) if id_cliente else None,
                    int(id_quadra) if id_quadra else None
                )
                print(resultado)

            elif escolha == "3":
                id = int(input("Digite o ID do agendamento: "))
                resultado = self.controller.excluir_agendamento(id)
                print(resultado)

            elif escolha == "4":
                id = int(input("Digite o ID do agendamento: "))
                resultado = self.controller.obter_agendamento(id)
                print(resultado)

            elif escolha == "5":
                print("Saindo do menu...")
                break

            else:
                print("Opção inválida. Por favor, escolha uma opção válida.")
