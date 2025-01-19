from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

# Define um Blueprint para os endpoints relacionados aos clientes
clientes_bp = Blueprint("clientes", __name__)

# Configuração do banco de dados
config = Config()

@clientes_bp.route("/clientes", methods=["GET"])
def get_clientes():
    """
    Endpoint para obter a lista de clientes.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para obter as informações dos clientes
        query = text(
            """
            SELECT id, nome, telefone, endereco
            FROM "beach-box"."Cliente";
            """
        )

        # Executa a consulta e mapeia os resultados para um formato de lista de dicionários
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
        # Retorna os clientes encontrados em formato JSON
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
        # Retorna um erro caso ocorra uma exceção ao acessar o banco de dados
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@clientes_bp.route("/clientes", methods=["POST"])
def create_cliente():
    """
    Endpoint para criar um novo cliente.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição

        # Gerar um novo ID automaticamente, caso não seja fornecido
        if "id" not in data or data["id"] is None:
            get_max_id_query = text(
                """
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM "beach-box"."Cliente";
                """
            )
            result = session.execute(get_max_id_query).mappings().fetchone()
            data["id"] = result["next_id"]

        # Verifica se o ID fornecido já existe
        check_query = text(
            """
            SELECT COUNT(*) AS count FROM "beach-box"."Cliente" WHERE id = :id;
            """
        )
        result = session.execute(check_query, {"id": data["id"]}).mappings().fetchone()

        if result["count"] > 0:
            # Retorna erro se o ID já estiver em uso
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Cliente com ID {data['id']} já existe.",
                    }
                ),
                400,
            )

        # Insere o novo cliente no banco de dados
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

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso e os dados do novo cliente criado
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@clientes_bp.route("/clientes/<int:id>", methods=["PUT"])
def update_cliente(id):
    """
    Endpoint para atualizar um cliente existente pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        data = request.json  # Obtém os dados da requisição
        # Consulta SQL para atualizar os dados do cliente
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

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a atualização
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@clientes_bp.route("/clientes/<int:id>", methods=["DELETE"])
def delete_cliente(id):
    """
    Endpoint para excluir um cliente existente pelo ID.
    """
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta SQL para excluir o cliente pelo ID
        query_delete_cliente = text(
            """
            DELETE FROM "beach-box"."Cliente" WHERE id = :id;
            """
        )
        session.execute(query_delete_cliente, {"id": id})

        session.commit()  # Confirma a transação no banco de dados
        # Retorna sucesso após a exclusão
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
        session.rollback()  # Reverte a transação em caso de erro
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados