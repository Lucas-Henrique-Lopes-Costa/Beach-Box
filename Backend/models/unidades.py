from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

# Define um Blueprint para os endpoints relacionados às unidades
unidades_bp = Blueprint("unidades", __name__)

# Configuração do banco de dados
config = Config()

@unidades_bp.route("/unidades", methods=["GET"])
def get_unidades():
    """
    Endpoint para obter a lista de unidades.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para obter as informações das unidades
        query = text(
            """
            SELECT id, nome, localizacao, telefone
            FROM "beach-box"."Unidade";
        """
        )

        # Executa a consulta e mapeia os resultados para um formato de lista de dicionários
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
        # Retorna as unidades encontradas em formato JSON
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
        # Retorna um erro caso ocorra uma exceção ao acessar o banco de dados
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@unidades_bp.route("/unidades", methods=["POST"])
def create_unidade():
    """
    Endpoint para criar uma nova unidade.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Gerar um novo ID automaticamente, caso não seja fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Unidade";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Verifica se o ID fornecido já existe
        check_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Unidade" WHERE id = :id;
            """
        )
        result = session.execute(check_query, {"id": data["id"]}).mappings().fetchone()

        if result["count"] > 0:
            # Retorna erro se o ID já estiver em uso
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Unidade com ID {data['id']} já existe.",
                    }
                ),
                400,
            )

        # Insere a nova unidade no banco de dados
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

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso e os dados da nova unidade criada
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@unidades_bp.route("/unidades/<int:id>", methods=["PUT"])
def update_unidade(id):
    """
    Endpoint para atualizar uma unidade existente pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição
        # Consulta SQL para atualizar os dados da unidade
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

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a atualização
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@unidades_bp.route("/unidades/<int:id>", methods=["DELETE"])
def delete_unidade(id):
    """
    Endpoint para excluir uma unidade existente pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para excluir a unidade pelo ID
        query = text(
            """
            DELETE FROM "beach-box"."Unidade" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a exclusão
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados