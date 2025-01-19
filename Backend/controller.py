from flask import Flask
from flask_cors import CORS
from models.clientes import clientes_bp  # Importa o blueprint para rotas relacionadas a clientes
from models.quadras import quadras_bp  # Importa o blueprint para rotas relacionadas a quadras
from models.unidades import unidades_bp  # Importa o blueprint para rotas relacionadas a unidades
from models.agendamentos import agendamentos_bp  # Importa o blueprint para rotas relacionadas a agendamentos
from models.relatorios import relatorios_bp  # Importa o blueprint para rotas relacionadas a relatórios

# Cria uma instância do Flask
app = Flask(__name__)

# Configura o Flask para permitir requisições de outros domínios (CORS)
CORS(app)

# Registrar blueprints para organizar as rotas por funcionalidade
app.register_blueprint(clientes_bp)  # Rotas relacionadas a clientes
app.register_blueprint(quadras_bp)  # Rotas relacionadas a quadras
app.register_blueprint(unidades_bp)  # Rotas relacionadas a unidades
app.register_blueprint(agendamentos_bp)  # Rotas relacionadas a agendamentos
app.register_blueprint(relatorios_bp)  # Rotas relacionadas a relatórios

# Verifica se o arquivo está sendo executado diretamente
if __name__ == "__main__":
    # Inicia o servidor em modo de depuração, disponível em todos os IPs e na porta 5001
    app.run(debug=True, host="0.0.0.0", port=5001)