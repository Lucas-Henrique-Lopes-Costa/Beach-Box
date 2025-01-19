class Observable:
    def adicionar_observer(self, observer):
        """
        Adiciona um observer para ser notificado sobre mudanças.
        """
        raise NotImplementedError("O método 'adicionar_observer' deve ser implementado pela classe filha.")

    def remover_observer(self, observer):
        """
        Remove um observer da lista de notificação.
        """
        raise NotImplementedError("O método 'remover_observer' deve ser implementado pela classe filha.")

    def notificar_observers(self, evento):
        """
        Notifica todos os observers sobre um evento específico.
        """
        raise NotImplementedError("O método 'notificar_observers' deve ser implementado pela classe filha.")