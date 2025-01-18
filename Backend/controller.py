from flask import Flask
from flask_cors import CORS
from models.clientes import clientes_bp
from models.quadras import quadras_bp
from models.unidades import unidades_bp
from models.agendamentos import agendamentos_bp
from models.relatorios import relatorios_bp

app = Flask(__name__)
CORS(app)  # Permite requisições de outros domínios

# Registrar blueprints
app.register_blueprint(clientes_bp)
app.register_blueprint(quadras_bp)
app.register_blueprint(unidades_bp)
app.register_blueprint(agendamentos_bp)
app.register_blueprint(relatorios_bp)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
