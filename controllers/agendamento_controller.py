from models.agendamento import Agendamento

class AgendamentoController:
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