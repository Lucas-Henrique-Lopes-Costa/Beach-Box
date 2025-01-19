from observable import Observable
from typing import List
from datetime import datetime


class Agendamento(Observable):
    def __init__(self, id, dataHoraAgendamento, preco, idQuadra, idCliente):
        self.id = id
        self.dataHoraAgendamento = dataHoraAgendamento
        self.preco = preco
        self.idQuadra = idQuadra
        self.idCliente = idCliente
        self._observers: List = []

    def adicionar_observer(self, observer):
        self._observers.append(observer)

    def remover_observer(self, observer):
        self._observers.remove(observer)

    def notificar_observers(self, evento):
        for observer in self._observers:
            observer.atualizar(evento)

    def obter(self):
        return {
            "id": self.id,
            "dataHoraAgendamento": self.dataHoraAgendamento,
            "preco": self.preco,
            "idQuadra": self.idQuadra,
            "idCliente": self.idCliente,
        }

    def editar(self, preco=None, dataHoraAgendamento=None):
        if preco is not None:
            self.preco = preco
        if dataHoraAgendamento is not None:
            self.dataHoraAgendamento = dataHoraAgendamento
        self.notificar_observers(f"Edição: Agendamento {self.id} foi editado.")