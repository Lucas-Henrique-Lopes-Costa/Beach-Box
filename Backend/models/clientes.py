from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

clientes_bp = Blueprint("clientes", __name__)

# Configuração do banco de dados
config = Config()


@clientes_bp.route("/clientes", methods=["GET"])
def get_clientes():
    session = config.get_session()
    try:
        query = text(
            """
            SELECT id, nome, telefone, endereco
            FROM "beach-box"."Cliente";
            """
        )

        result = session.execute(query)
        clientes = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "telefone": row["telefone"],
                "endereco": row["endereco"],
            }
            for row in result.mappings()
        ]
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"{len(clientes)} clientes encontrados",
                    "data": clientes,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()


@clientes_bp.route("/clientes", methods=["POST"])
def create_cliente():
    session = config.get_session()
    try:
        data = request.json

        # Gerar ID automaticamente se não for fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Cliente";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Verificar se o ID já existe
        check_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Cliente" WHERE id = :id;
            """
        )
        result = session.execute(check_query, {"id": data["id"]}).mappings().fetchone()

        if result["count"] > 0:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Cliente com ID {data['id']} já existe.",
                    }
                ),
                400,
            )

        # Inserir novo cliente
        query_cliente = text(
            """
            INSERT INTO "beach-box"."Cliente" (id, nome, telefone, endereco)
            VALUES (:id, :nome, :telefone, :endereco);
            """
        )
        session.execute(
            query_cliente,
            {
                "id": data["id"],
                "nome": data["nome"],
                "telefone": data["telefone"],
                "endereco": data["endereco"],
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Cliente criado com sucesso",
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


@clientes_bp.route("/clientes/<int:id>", methods=["PUT"])
def update_cliente(id):
    session = config.get_session()
    try:
        data = request.json
        query_cliente = text(
            """
            UPDATE "beach-box"."Cliente"
            SET nome = :nome, telefone = :telefone, endereco = :endereco
            WHERE id = :id;
            """
        )
        session.execute(
            query_cliente,
            {
                "id": id,
                "nome": data["nome"],
                "telefone": data["telefone"],
                "endereco": data["endereco"],
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Cliente com ID {id} atualizado com sucesso",
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


@clientes_bp.route("/clientes/<int:id>", methods=["DELETE"])
def delete_cliente(id):
    session = config.get_session()
    try:
        query_delete_cliente = text(
            """
            DELETE FROM "beach-box"."Cliente" WHERE id = :id;
            """
        )
        session.execute(query_delete_cliente, {"id": id})

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Cliente com ID {id} excluído com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()
