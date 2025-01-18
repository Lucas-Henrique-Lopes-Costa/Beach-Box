from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

clientes_bp = Blueprint('clientes', __name__)

# Configuração do banco de dados
config = Config()

@clientes_bp.route('/clientes', methods=['GET'])
def get_clientes():
    session = config.get_session()
    try:
        query = text("""
            SELECT c.id, c.nome, c.telefone, 
                   ARRAY_AGG(ce.endereco) AS enderecos
            FROM "beach-box"."Cliente" c
            LEFT JOIN "beach-box"."ClienteEndereco" ce ON c.id = ce."idCliente"
            GROUP BY c.id, c.nome, c.telefone;
        """)
        
        # Executa a consulta e utiliza `.mappings()` para acessar como dicionário
        result = session.execute(query)
        clientes = [
            {
                "id": row["id"],
                "nome": row["nome"],
                "telefone": row["telefone"],
                "enderecos": row["enderecos"] if row["enderecos"] else []
            }
            for row in result.mappings()
        ]
        return jsonify(clientes), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
