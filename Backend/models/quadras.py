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
            SELECT q.id, q.nome, q.localizacao, q."idUnidade", q.precobase, q."estaDisponivel",
                   u.nome AS unidade_nome
            FROM "beach-box"."Quadra" q
            JOIN "beach-box"."Unidade" u ON q."idUnidade" = u.id;
        """)
        
        result = session.execute(query)
        quadras = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "idUnidade": row["idUnidade"],
                "precobase": float(row["precobase"]) if row["precobase"] else None,
                "estaDisponivel": row["estaDisponivel"],
                "unidade_nome": row["unidade_nome"]
            }
            for row in result.mappings()
        ]
        return jsonify(quadras), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
