from quadra_disponivel import QuadraDisponivel
from quadra_indisponivel import QuadraIndisponivel

class EstadoQuadra:
    def __init__(self, estado_inicial):
        self.estado = estado_inicial  # instância de QuadraDisponivel ou QuadraIndisponivel

    def verificar_disponibilidade(self):
        return self.estado.verificar_disponibilidade()

    def alterar_estado(self):
        if isinstance(self.estado, QuadraDisponivel):
            self.estado = QuadraIndisponivel()
        else:
            self.estado = QuadraDisponivel()