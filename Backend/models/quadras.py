from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

quadras_bp = Blueprint('quadras', __name__)

# Configuração do banco de dados
config = Config()

@quadras_bp.route('/quadras', methods=['GET'])
def get_quadras():
    session = config.get_session()
    try:
        query = text("""
            SELECT q.id, q.nome, q.localizacao, u.nome AS unidade, q.precoBase, 
                   q.estaDisponivel, q.tipo
            FROM "beach-box"."Quadra" q
            LEFT JOIN "beach-box"."Unidade" u ON q.idUnidade = u.id;
        """)

        result = session.execute(query)
        quadras = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "unidade": row["unidade"],
                "precoBase": row["precoBase"],
                "estaDisponivel": row["estaDisponivel"],
                "tipo": row["tipo"]
            }
            for row in result.mappings()
        ]
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"{len(quadras)} quadras encontradas",
                    "data": quadras,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()

@quadras_bp.route('/quadras', methods=['POST'])
def create_quadra():
    session = config.get_session()
    try:
        data = request.json

        # Gerar ID automaticamente se não for fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Quadra";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Inserir nova quadra
        query = text(
            """
            INSERT INTO "beach-box"."Quadra" (id, nome, localizacao, idUnidade, precoBase, estaDisponivel, tipo)
            VALUES (:id, :nome, :localizacao, :idUnidade, :precoBase, :estaDisponivel, :tipo);
            """
        )
        session.execute(
            query,
            {
                "id": data["id"],
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "idUnidade": data["idUnidade"],
                "precoBase": data["precoBase"],
                "estaDisponivel": data["estaDisponivel"],
                "tipo": data["tipo"]
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Quadra criada com sucesso",
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

@quadras_bp.route('/quadras/<int:id>', methods=['PUT'])
def update_quadra(id):
    session = config.get_session()
    try:
        data = request.json
        query = text(
            """
            UPDATE "beach-box"."Quadra"
            SET nome = :nome, localizacao = :localizacao, idUnidade = :idUnidade, 
                precoBase = :precoBase, estaDisponivel = :estaDisponivel, tipo = :tipo
            WHERE id = :id;
            """
        )
        session.execute(
            query,
            {
                "id": id,
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "idUnidade": data["idUnidade"],
                "precoBase": data["precoBase"],
                "estaDisponivel": data["estaDisponivel"],
                "tipo": data["tipo"]
            },
        )

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Quadra com ID {id} atualizada com sucesso",
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

@quadras_bp.route('/quadras/<int:id>', methods=['DELETE'])
def delete_quadra(id):
    session = config.get_session()
    try:
        query = text(
            """
            DELETE FROM "beach-box"."Quadra" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Quadra com ID {id} excluída com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()
