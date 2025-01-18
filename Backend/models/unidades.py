from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

unidades_bp = Blueprint('unidades', __name__)

# Configuração do banco de dados
config = Config()

@unidades_bp.route('/unidades', methods=['GET'])
def get_unidades():
    session = config.get_session()
    try:
        query = text("""
            SELECT id, nome, localizacao, telefone
            FROM "beach-box"."Unidade";
        """)
        result = session.execute(query)
        unidades = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "telefone": row["telefone"]
            }
            for row in result.mappings()
        ]
        return jsonify(unidades), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
