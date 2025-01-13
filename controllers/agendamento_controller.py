from .observer_interface import Observer
from models.agendamento import Agendamento
from models.relatorio import Relatorio
from datetime import datetime

class AgendamentoController(Observer):
    
    def __init__(self):
        self.relatorio = Relatorio()
        self.conectar_observer()

    def conectar_observer(self):
        """
        Conecta o controller como observer dos eventos disparados pelo Agendamento.
        """
        Agendamento.adicionar_observer(self)

    def atualizar(self, evento):
        """
        Lida com eventos disparados por Agendamento e aciona as atualizações necessárias.
        """
        if evento in ["cadastrar", "editar", "excluir"]:
            self.relatorio.gerar_relatorio_diario(datetime.now().date())

    def cadastrar_agendamento(self, data_hora_agendamento, preco, id_cliente, id_quadra):
        """
        Cadastra um novo agendamento com os dados fornecidos.
        """
        agendamento = Agendamento(
            data_hora_agendamento=data_hora_agendamento,
            preco=preco,
            id_cliente=id_cliente,
            id_quadra=id_quadra
        )
        resultado = agendamento.cadastrar()
        return resultado

    def editar_agendamento(self, id, data_hora_agendamento=None, preco=None, id_cliente=None, id_quadra=None):
        """
        Edita um agendamento existente com base no ID.
        """
        agendamento = Agendamento.obter(id)
        if isinstance(agendamento, dict) and "erro" in agendamento:
            return agendamento
        return agendamento.editar(data_hora_agendamento, preco, id_cliente, id_quadra)

    def excluir_agendamento(self, id):
        """
        Exclui um agendamento com base no ID.
        """
        agendamento = Agendamento.obter(id)
        if isinstance(agendamento, dict) and "erro" in agendamento:
            return agendamento
        return agendamento.excluir()

    def obter_agendamento(self, id):
        """
        Obtém os dados de um agendamento com base no ID.
        """
        return Agendamento.obter(id)