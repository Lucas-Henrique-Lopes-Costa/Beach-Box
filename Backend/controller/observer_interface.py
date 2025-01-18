class Observer:
    def atualizar(self, evento):
        """
        Recebe notificações sobre eventos do observable.
        """
        raise NotImplementedError("O método 'atualizar' deve ser implementado pela classe filha.")
