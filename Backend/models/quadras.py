from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

# Define um Blueprint para os endpoints relacionados às quadras
quadras_bp = Blueprint("quadras", __name__)

# Configuração do banco de dados
config = Config()

@quadras_bp.route("/quadras", methods=["GET"])
def get_quadras():
    """
    Endpoint para obter a lista de quadras, incluindo informações relacionadas à unidade.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para buscar as informações das quadras e suas unidades
        query = text(
            """
            SELECT q."id", q."nome", q."localizacao", q."idUnidade", u."nome" AS unidade, q."precobase", 
                   q."estaDisponivel", q.tipo
            FROM "beach-box"."Quadra" q
            LEFT JOIN "beach-box"."Unidade" u ON q."idUnidade" = u."id";
            """
        )

        # Executa a consulta e mapeia os resultados para uma lista de dicionários
        result = session.execute(query)
        quadras = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "idUnidade": row["idUnidade"],
                "unidade": row["unidade"],
                "precobase": row["precobase"],
                "estaDisponivel": row["estaDisponivel"],
                "tipo": row["tipo"],
            }
            for row in result.mappings()
        ]
        # Retorna as quadras encontradas em formato JSON
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
        # Retorna um erro caso ocorra uma exceção ao acessar o banco de dados
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@quadras_bp.route("/quadras", methods=["POST"])
def create_quadra():
    """
    Endpoint para criar uma nova quadra.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Gerar ID automaticamente, caso não seja fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX("id"), 0) + 1 AS next_id FROM "beach-box"."Quadra";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Insere a nova quadra no banco de dados
        query = text(
            """
            INSERT INTO "beach-box"."Quadra" ("id", "nome", "localizacao", "idUnidade", "precobase", "estaDisponivel", "tipo")
            VALUES (:id, :nome, :localizacao, :idUnidade, :precobase, :estaDisponivel, :tipo);
            """
        )
        session.execute(
            query,
            {
                "id": data["id"],
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "idUnidade": data["idUnidade"],
                "precobase": data["precobase"],
                "estaDisponivel": data["estaDisponivel"],
                "tipo": data["tipo"],
            },
        )

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso com os dados da quadra criada
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@quadras_bp.route("/quadras/<int:id>", methods=["PUT"])
def update_quadra(id):
    """
    Endpoint para atualizar os dados de uma quadra existente.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Valida e converte idUnidade, se necessário
        id_unidade = data.get("idUnidade")
        if isinstance(id_unidade, str) and id_unidade.isdigit():
            id_unidade = int(id_unidade)
        elif not isinstance(id_unidade, int):
            id_unidade = None

        # Atualiza as informações da quadra no banco de dados
        query = text(
            """
            UPDATE "beach-box"."Quadra"
            SET "nome" = :nome,
                "localizacao" = :localizacao,
                "idUnidade" = :idUnidade,
                "precobase" = :precobase,
                "estaDisponivel" = :estaDisponivel,
                "tipo" = :tipo
            WHERE "id" = :id;
            """
        )

        session.execute(
            query,
            {
                "id": id,
                "nome": data["nome"],
                "localizacao": data["localizacao"],
                "idUnidade": id_unidade,
                "precobase": data["precobase"],
                "estaDisponivel": data["estaDisponivel"],
                "tipo": data["tipo"],
            },
        )

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a atualização
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Quadra com ID {id} atualizada com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@quadras_bp.route("/quadras/<int:id>", methods=["PATCH"])
def update_quadra_status(id):
    """
    Endpoint para atualizar o status de disponibilidade de uma quadra.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição
        if "estaDisponivel" not in data:
            # Retorna erro caso o campo 'estaDisponivel' não seja fornecido
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Campo 'estaDisponivel' é obrigatório",
                    }
                ),
                400,
            )

        # Atualiza o status de disponibilidade da quadra no banco de dados
        query = text(
            """
            UPDATE "beach-box"."Quadra"
            SET "estaDisponivel" = :estaDisponivel
            WHERE "id" = :id;
            """
        )
        session.execute(
            query,
            {"id": id, "estaDisponivel": data["estaDisponivel"]},
        )

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a atualização
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Status de disponibilidade da quadra com ID {id} atualizado com sucesso",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@quadras_bp.route("/quadras/<int:id>", methods=["DELETE"])
def delete_quadra(id):
    """
    Endpoint para excluir uma quadra pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Remove a quadra do banco de dados pelo ID
        query = text(
            """
            DELETE FROM "beach-box"."Quadra" WHERE id = :id;
            """
        )
        session.execute(query, {"id": id})

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a exclusão
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados