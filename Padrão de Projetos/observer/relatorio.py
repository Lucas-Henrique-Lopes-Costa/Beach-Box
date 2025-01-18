from observer import Observer
from typing import List


class Relatorio(Observer):
    def __init__(self):
        self._agendamentos: List = []

    def atualizar(self, evento):
        print(f"[Relatorio] Recebendo atualização: {evento}")

    def adicionar_agendamento(self, agendamento):
        self._agendamentos.append(agendamento)

    def obter_faturamento(self):
        return sum(a.preco for a in self._agendamentos)

    def obter_agendamentos(self):
        return len(self._agendamentos)