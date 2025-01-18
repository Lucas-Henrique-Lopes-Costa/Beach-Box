from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

agendamentos_bp = Blueprint("agendamentos", __name__)

# Configuração do banco de dados
config = Config()


@agendamentos_bp.route("/agendamentos", methods=["GET"])
def get_agendamentos():
    session = config.get_session()
    try:
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
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()


@agendamentos_bp.route("/agendamentos", methods=["POST"])
def create_agendamento():
    session = config.get_session()
    try:
        data = request.json

        # Verificar se a quadra está disponível
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
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "A quadra selecionada não está disponível para agendamento.",
                    }
                ),
                400,
            )

        # Verificar se já existe agendamento para o mesmo horário na mesma quadra
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
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Já existe um agendamento para esta quadra no horário selecionado.",
                    }
                ),
                400,
            )

        # Gerar ID automaticamente se não for fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Agendamento";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Inserir novo agendamento
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

        session.commit()
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
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()


@agendamentos_bp.route("/agendamentos/<int:id>", methods=["PUT"])
def update_agendamento(id):
    session = config.get_session()
    try:
        data = request.json

        # Verificar se a quadra está disponível
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
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "A quadra selecionada não está disponível para agendamento.",
                    }
                ),
                400,
            )

        # Verificar se já existe agendamento para o mesmo horário na mesma quadra
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
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Já existe um agendamento para esta quadra no horário selecionado.",
                    }
                ),
                400,
            )

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

        session.commit()
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
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()


@agendamentos_bp.route("/agendamentos/<int:id>", methods=["DELETE"])
def delete_agendamento(id):
    session = config.get_session()
    try:
        query = text(
            """
            DELETE FROM "beach-box"."Agendamento" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()
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
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()
