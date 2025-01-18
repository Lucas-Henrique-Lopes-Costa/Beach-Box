from .observable_interface import Observable
from sqlalchemy import text
from Backend.db.config import Config
import pandas as pd

class Agendamento(Observable):
    observers = []  # Lista de observers

    def __init__(self, id=None, data_hora_agendamento=None, preco=None, id_cliente=None, id_quadra=None):
        self.engine = Config().conectar_bd()
        self.id = id
        self.data_hora_agendamento = data_hora_agendamento
        self.preco = preco
        self.id_cliente = id_cliente
        self.id_quadra = id_quadra

    @classmethod
    def adicionar_observer(cls, observer):
        cls.observers.append(observer)

    @classmethod
    def remover_observer(cls, observer):
        cls.observers.remove(observer)

    @classmethod
    def notificar_observers(cls, evento):
        for observer in cls.observers:
            observer.atualizar(evento)

    def cadastrar(self):
        """
        Insere um novo agendamento no banco de dados.
        Retorna o ID do agendamento criado ou uma mensagem de erro.
        """
        try:
            query = text("""
            INSERT INTO "beach-box"."Agendamento" ("dataHoraAgendamento", "preco", "idCliente", "idQuadra")
            VALUES (:dataHoraAgendamento, :preco, :idCliente, :idQuadra)
            RETURNING id;
            """)
            with self.engine.connect() as connection:
                transaction = connection.begin()  # Inicia uma transação
                try:
                    result = connection.execute(
                        query,
                        {
                            "dataHoraAgendamento": self.data_hora_agendamento,
                            "preco": self.preco,
                            "idCliente": self.id_cliente,
                            "idQuadra": self.id_quadra
                        }
                    )
                    self.id = result.fetchone()[0]
                    transaction.commit()  # Confirma a transação
                    self.notificar_observers("cadastrar")
                    return {"sucesso": f"Agendamento cadastrado com ID {self.id}"}
                except Exception as e:
                    transaction.rollback()  # Reverte em caso de erro
                    raise e
        except Exception as e:
            return {"erro": f"Erro ao cadastrar agendamento: {str(e)}"}

    def editar(self, data_hora_agendamento=None, preco=None, id_cliente=None, id_quadra=None):
        """
        Atualiza os dados do agendamento no banco de dados.
        Retorna uma mensagem de sucesso ou erro.
        """
        if not self.id:
            return {"erro": "Agendamento não possui ID. Certifique-se de que foi obtido antes de editar."}

        try:
            updates = []
            params = {"id": int(self.id)}  # Certifica-se de que o ID é um inteiro nativo

            if data_hora_agendamento:
                updates.append('"dataHoraAgendamento" = :dataHoraAgendamento')
                params["dataHoraAgendamento"] = data_hora_agendamento
            if preco is not None:
                updates.append('"preco" = :preco')
                params["preco"] = preco
            if id_cliente:
                updates.append('"idCliente" = :idCliente')
                params["idCliente"] = id_cliente
            if id_quadra:
                updates.append('"idQuadra" = :idQuadra')
                params["idQuadra"] = id_quadra

            if updates:
                query = text(f"""
                UPDATE "beach-box"."Agendamento"
                SET {', '.join(updates)}
                WHERE id = :id;
                """)
                with self.engine.connect() as connection:
                    transaction = connection.begin()  # Inicia uma transação
                    try:
                        connection.execute(query, params)  # Executa a query com os parâmetros
                        transaction.commit()  # Confirma a transação
                        self.notificar_observers("editar", self.id)
                        return {"sucesso": f"Agendamento {self.id} atualizado com sucesso."}
                    except Exception as e:
                        transaction.rollback()  # Reverte em caso de erro
                        raise e
            else:
                return {"aviso": "Nenhuma atualização foi solicitada."}

        except Exception as e:
            return {"erro": f"Erro ao editar agendamento: {str(e)}"}

    def excluir(self):
        """
        Remove o agendamento do banco de dados.
        Retorna uma mensagem de sucesso ou erro.
        """
        if not self.id:
            return {"erro": "Agendamento não possui ID. Certifique-se de que foi obtido antes de excluir."}

        try:
            query = text("""
            DELETE FROM "beach-box"."Agendamento"
            WHERE id = :id;
            """)
            with self.engine.connect() as connection:
                transaction = connection.begin()  # Inicia uma transação
                try:
                    connection.execute(query, {"id": int(self.id)})  # Converte para inteiro nativo
                    transaction.commit()  # Confirma a transação
                    self.notificar_observers("excluir")
                    return {"sucesso": f"Agendamento {self.id} excluído com sucesso."}
                except Exception as e:
                    transaction.rollback()  # Reverte em caso de erro
                    raise e
        except Exception as e:
            return {"erro": f"Erro ao excluir agendamento: {str(e)}"}

    @staticmethod
    def obter(id):
        """
        Obtém um agendamento do banco de dados com base no ID.
        Retorna uma instância de Agendamento ou uma mensagem de erro.
        """
        try:
            engine = Config().conectar_bd()
            query = f"""
            SELECT * FROM "beach-box"."Agendamento"
            WHERE id = {id};
            """
            agendamento_df = pd.read_sql(query, con=engine)

            if agendamento_df.empty:
                return {"erro": f"Agendamento com ID {id} não encontrado."}

            agendamento = Agendamento(
                id=agendamento_df.iloc[0]["id"],
                data_hora_agendamento=agendamento_df.iloc[0]["dataHoraAgendamento"],
                preco=agendamento_df.iloc[0]["preco"],
                id_cliente=agendamento_df.iloc[0]["idCliente"],
                id_quadra=agendamento_df.iloc[0]["idQuadra"]
            )
            return agendamento

        except Exception as e:
            return {"erro": f"Erro ao obter agendamento: {str(e)}"}

    def obter_todos(self):
        """
        Obtém todos os agendamentos do banco de dados.
        Retorna uma lista de instâncias de Agendamento ou uma mensagem de erro.
        """
        try:
            query = text("""
            SELECT * FROM "beach-box"."Agendamento";
            """)
            with self.engine.connect() as connection:
                result = connection.execute(query)
                agendamentos = []
                for row in result:
                    agendamento = Agendamento(
                        id=row["id"],
                        data_hora_agendamento=row["dataHoraAgendamento"],
                        preco=row["preco"],
                        id_cliente=row["idCliente"],
                        id_quadra=row["idQuadra"]
                    )
                    agendamentos.append(agendamento)
                return agendamentos

        except Exception as e:
            return {"erro": f"Erro ao obter agendamentos: {str(e)}"}

    def __str__(self):
        """
        Retorna uma representação legível do objeto Agendamento.
        """
        return (
            f"Agendamento(ID: {self.id}, "
            f"DataHora: {self.data_hora_agendamento}, "
            f"Preço: {self.preco}, "
            f"ClienteID: {self.id_cliente}, "
            f"QuadraID: {self.id_quadra})"
        )