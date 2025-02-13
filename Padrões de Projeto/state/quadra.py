from estado_quadra import EstadoQuadra

class Quadra:
    def __init__(self, id, nome, localizacao, unidade, preco_base, estado):
        self.id = id
        self.nome = nome
        self.localizacao = localizacao
        self.unidade = unidade
        self.preco_base = preco_base
        self.estado = estado  # instância de EstadoQuadra

    def cadastrar(self):
        print(f"Quadra {self.nome} cadastrada com sucesso no local {self.localizacao}.")

    def editar(self, novo_nome, nova_localizacao, nova_unidade, novo_preco_base):
        self.nome = novo_nome
        self.localizacao = nova_localizacao
        self.unidade = nova_unidade
        self.preco_base = novo_preco_base
        print(f"Informações da quadra {self.id} atualizadas com sucesso.")

    def excluir(self):
        print(f"Quadra {self.id} - {self.nome} excluída com sucesso.")

    def obter(self):
        return self

    def verificar_disponibilidade(self):
        return self.estado.verificar_disponibilidade()

    def alterar_estado(self):
        self.estado.alterar_estado()
        print(f"Estado da quadra {self.id} alterado.")

# Exemplo de uso
if __name__ == "__main__":
    # Criar instância de QuadraDisponivel
    from quadra_disponivel import QuadraDisponivel
    estado_inicial = EstadoQuadra(QuadraDisponivel())

    # Criar uma instância da classe Quadra
    quadra = Quadra(1, "Quadra Poliesportiva", "Centro", 1.5, 100.0, estado_inicial)

    # Cadastrar a quadra
    quadra.cadastrar()

    # Verificar a disponibilidade
    print(f"Disponível: {quadra.verificar_disponibilidade()}")

    # Alterar o estado da quadra
    print("Alterando o estado da quadra...")
    quadra.alterar_estado()

    # Verificar a disponibilidade novamente
    print(f"Disponível: {quadra.verificar_disponibilidade()}")