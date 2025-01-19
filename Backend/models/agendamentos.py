from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

# Define um Blueprint para os endpoints relacionados aos agendamentos
agendamentos_bp = Blueprint("agendamentos", __name__)

# Configuração do banco de dados
config = Config()

@agendamentos_bp.route("/agendamentos", methods=["GET"])
def get_agendamentos():
    """
    Endpoint para obter a lista de agendamentos com informações detalhadas, 
    incluindo cliente, quadra e unidade associada.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para buscar os agendamentos e informações relacionadas
        query = text(
            """
            SELECT a.id, 
                   a."dataHoraAgendamento", 
                   a."preco", 
                   a."idCliente", 
                   c.nome AS cliente, 
                   a."idQuadra", 
                   q.nome AS quadra, 
                   q."idUnidade", 
                   u.nome AS unidade
            FROM "beach-box"."Agendamento" a
            LEFT JOIN "beach-box"."Cliente" c ON a."idCliente" = c.id
            LEFT JOIN "beach-box"."Quadra" q ON a."idQuadra" = q.id
            LEFT JOIN "beach-box"."Unidade" u ON q."idUnidade" = u.id;
            """
        )

        # Executa a consulta e mapeia os resultados para uma lista de dicionários
        result = session.execute(query)
        agendamentos = [
            {
                "id": row["id"],
                "dataHoraAgendamento": row["dataHoraAgendamento"],
                "preco": row["preco"],
                "idCliente": row["idCliente"],
                "cliente": row["cliente"],
                "idQuadra": row["idQuadra"],
                "quadra": row["quadra"],
                "idUnidade": row["idUnidade"],
                "unidade": row["unidade"],
            }
            for row in result.mappings()
        ]
        # Retorna os agendamentos encontrados
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"{len(agendamentos)} agendamentos encontrados",
                    "data": agendamentos,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        # Retorna um erro caso ocorra uma exceção ao acessar o banco de dados
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@agendamentos_bp.route("/agendamentos", methods=["POST"])
def create_agendamento():
    """
    Endpoint para criar um novo agendamento.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Verifica se a quadra está disponível para agendamento
        check_disponibilidade_query = text(
            """
            SELECT "estaDisponivel" FROM "beach-box"."Quadra" WHERE id = :idQuadra;
            """
        )
        result = (
            session.execute(check_disponibilidade_query, {"idQuadra": data["idQuadra"]})
            .mappings()
            .fetchone()
        )

        if not result or not result["estaDisponivel"]:
            # Retorna erro caso a quadra não esteja disponível
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "A quadra selecionada não está disponível para agendamento.",
                    }
                ),
                400,
            )

        # Verifica se já existe um agendamento para o mesmo horário na mesma quadra
        check_horario_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Agendamento"
            WHERE "idQuadra" = :idQuadra AND "dataHoraAgendamento" = :dataHoraAgendamento;
            """
        )
        result = (
            session.execute(
                check_horario_query,
                {
                    "idQuadra": data["idQuadra"],
                    "dataHoraAgendamento": data["dataHoraAgendamento"],
                },
            )
            .mappings()
            .fetchone()
        )

        if result["count"] > 0:
            # Retorna erro caso já exista um agendamento no mesmo horário
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Já existe um agendamento para esta quadra no horário selecionado.",
                    }
                ),
                400,
            )

        # Gerar ID automaticamente caso não seja fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Agendamento";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Insere o novo agendamento no banco de dados
        query = text(
            """
            INSERT INTO "beach-box"."Agendamento" (id, "dataHoraAgendamento", "preco", "idQuadra", "idCliente")
            VALUES (:id, :dataHoraAgendamento, :preco, :idQuadra, :idCliente);
            """
        )
        session.execute(
            query,
            {
                "id": data["id"],
                "dataHoraAgendamento": data["dataHoraAgendamento"],
                "preco": data["preco"],
                "idQuadra": data["idQuadra"],
                "idCliente": data["idCliente"],
            },
        )

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a criação do agendamento
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Agendamento criado com sucesso",
                    "data": data,
                }
            ),
            201,
        )
    except SQLAlchemyError as e:
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@agendamentos_bp.route("/agendamentos/<int:id>", methods=["PUT"])
def update_agendamento(id):
    """
    Endpoint para atualizar os dados de um agendamento existente.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Verifica se a quadra está disponível para agendamento
        check_disponibilidade_query = text(
            """
            SELECT "estaDisponivel" FROM "beach-box"."Quadra" WHERE id = :idQuadra;
            """
        )
        result = (
            session.execute(check_disponibilidade_query, {"idQuadra": data["idQuadra"]})
            .mappings()
            .fetchone()
        )

        if not result or not result["estaDisponivel"]:
            # Retorna erro caso a quadra não esteja disponível
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "A quadra selecionada não está disponível para agendamento.",
                    }
                ),
                400,
            )

        # Verifica se já existe um agendamento no mesmo horário e quadra
        check_horario_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Agendamento"
            WHERE "idQuadra" = :idQuadra AND "dataHoraAgendamento" = :dataHoraAgendamento AND id != :id;
            """
        )
        result = (
            session.execute(
                check_horario_query,
                {
                    "idQuadra": data["idQuadra"],
                    "dataHoraAgendamento": data["dataHoraAgendamento"],
                    "id": id,
                },
            )
            .mappings()
            .fetchone()
        )

        if result["count"] > 0:
            # Retorna erro caso já exista um agendamento no mesmo horário
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Já existe um agendamento para esta quadra no horário selecionado.",
                    }
                ),
                400,
            )

        # Atualiza os dados do agendamento no banco de dados
        query = text(
            """
            UPDATE "beach-box"."Agendamento"
            SET "dataHoraAgendamento" = :dataHoraAgendamento, "preco" = :preco, 
                "idQuadra" = :idQuadra, "idCliente" = :idCliente
            WHERE id = :id;
            """
        )
        session.execute(
            query,
            {
                "id": id,
                "dataHoraAgendamento": data["dataHoraAgendamento"],
                "preco": data["preco"],
                "idQuadra": data["idQuadra"],
                "idCliente": data["idCliente"],
            },
        )

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a atualização
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Agendamento com ID {id} atualizado com sucesso",
                    "data": data,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@agendamentos_bp.route("/agendamentos/<int:id>", methods=["DELETE"])
def delete_agendamento(id):
    """
    Endpoint para excluir um agendamento pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Remove o agendamento do banco de dados
        query = text(
            """
            DELETE FROM "beach-box"."Agendamento" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a exclusão
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Agendamento com ID {id} excluído com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados