from controllers.relatorio_controller import RelatorioController

class TelaRelatorio:
    def __init__(self):
        self.controller = RelatorioController()

    def exibir_relatorios(self, dados):
        """
        Exibe os dados do relatório no terminal.
        """
        if "erro" in dados:
            self.exibir_mensagem_erro(dados["erro"])
            return

        print("\n=== Relatório ===")
        for key, value in dados.items():
            if key in ["graficos", "rankings", "detalhes"]:
                continue  # Não exibir gráficos ou detalhes extensos no terminal
            print(f"{key}: {value}")

        # Exibir rankings
        print("\n--- Rankings ---")
        for ranking, valores in dados.get("rankings", {}).items():
            print(f"{ranking}: {valores}")

        # Informar que os gráficos foram gerados
        print("\nGráficos gerados. Consulte os arquivos ou as representações visuais correspondentes.")

    def exibir_mensagem_erro(self, mensagem):
        """
        Exibe uma mensagem de erro.
        """
        print(f"Erro: {mensagem}")

    def exibir_filtro_relatorio(self):
        """
        Captura filtros do usuário para o relatório customizado.
        """
        print("\n=== Filtros para Relatório Customizado ===")
        data_inicio = input("Digite a data de início (YYYY-MM-DD): ")
        data_fim = input("Digite a data de fim (YYYY-MM-DD): ")
        unidades = input("Digite os IDs das unidades (separados por vírgula, ou deixe vazio): ")
        quadras = input("Digite os IDs das quadras (separados por vírgula, ou deixe vazio): ")

        unidades = list(map(int, unidades.split(','))) if unidades else None
        quadras = list(map(int, quadras.split(','))) if quadras else None

        return data_inicio, data_fim, unidades, quadras

    def menu(self):
        """
        Menu principal para interação com o usuário.
        """
        while True:
            print("\n=== Menu Relatórios ===")
            print("1. Gerar Relatório Diário")
            print("2. Gerar Relatório Customizado")
            print("3. Sair")
            escolha = input("Escolha uma opção: ")

            if escolha == "1":
                data = input("Digite a data (YYYY-MM-DD): ")
                relatorio = self.controller.gerar_relatorio_diario(data)
                self.exibir_relatorios(relatorio)

            elif escolha == "2":
                filtros = self.exibir_filtro_relatorio()
                relatorio = self.controller.gerar_relatorio_customizado(*filtros)
                self.exibir_relatorios(relatorio)

            elif escolha == "3":
                print("Saindo...")
                break

            else:
                print("Opção inválida. Tente novamente.")