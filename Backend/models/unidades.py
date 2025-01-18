from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

unidades_bp = Blueprint("unidades", __name__)

# Configuração do banco de dados
config = Config()


@unidades_bp.route("/unidades", methods=["GET"])
def get_unidades():
    session = config.get_session()
    try:
        query = text(
            """
            SELECT id, nome, localizacao, telefone
            FROM "beach-box"."Unidade";
        """
        )

        result = session.execute(query)
        unidades = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "telefone": row["telefone"],
            }
            for row in result.mappings()
        ]
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"{len(unidades)} unidades encontradas",
                    "data": unidades,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()


@unidades_bp.route("/unidades", methods=["POST"])
def create_unidade():
    session = config.get_session()
    try:
        data = request.json

        # Gerar ID automaticamente se não for fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Unidade";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Verificar se o ID já existe
        check_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Unidade" WHERE id = :id;
            """
        )
        result = session.execute(check_query, {"id": data["id"]}).mappings().fetchone()

        if result["count"] > 0:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Unidade com ID {data['id']} já existe.",
                    }
                ),
                400,
            )

        # Inserir nova unidade
        query = text(
            """
            INSERT INTO "beach-box"."Unidade" (id, nome, localizacao, telefone)
            VALUES (:id, :nome, :localizacao, :telefone);
            """
        )
        session.execute(
            query,
            {
                "id": data["id"],
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "telefone": data["telefone"],
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Unidade criada com sucesso",
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


@unidades_bp.route("/unidades/<int:id>", methods=["PUT"])
def update_unidade(id):
    session = config.get_session()
    try:
        data = request.json
        query = text(
            """
            UPDATE "beach-box"."Unidade"
            SET nome = :nome, localizacao = :localizacao, telefone = :telefone
            WHERE id = :id;
            """
        )
        session.execute(
            query,
            {
                "id": id,
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "telefone": data["telefone"],
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Unidade com ID {id} atualizada com sucesso",
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


@unidades_bp.route("/unidades/<int:id>", methods=["DELETE"])
def delete_unidade(id):
    session = config.get_session()
    try:
        query = text(
            """
            DELETE FROM "beach-box"."Unidade" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Unidade com ID {id} excluída com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()
