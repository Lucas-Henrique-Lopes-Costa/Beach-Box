from models.relatorio import Relatorio

class RelatorioController:
    def __init__(self):
        self.relatorio_model = Relatorio()

    def gerar_relatorio_diario(self, data):
        """
        Gera um relatório diário para a data fornecida.
        """
        try:
            relatorio = self.relatorio_model.gerar_relatorio_diario(data)
            return relatorio
        except Exception as e:
            return {"erro": str(e)}

    def gerar_relatorio_customizado(self, data_inicio, data_fim, unidades=None, quadras=None):
        """
        Gera um relatório customizado com base nos filtros fornecidos.
        """
        try:
            relatorio = self.relatorio_model.gerar_relatorio_customizado(data_inicio, data_fim, unidades, quadras)
            return relatorio
        except Exception as e:
            return {"erro": str(e)}