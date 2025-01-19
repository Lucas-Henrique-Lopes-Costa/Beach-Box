from flask import Blueprint, jsonify, request
from db.config import Config
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text
from datetime import datetime
import pandas as pd

# Define um Blueprint para os endpoints relacionados aos relatórios
relatorios_bp = Blueprint('relatorios', __name__)

# Configuração do banco de dados
config = Config()

@relatorios_bp.route('/relatorios/diario', methods=['GET'])
def gerar_relatorio_diario():
    """
    Endpoint para gerar o relatório diário de agendamentos.
    Requer o parâmetro de data na query string (?data=YYYY-MM-DD).
    """
    data = request.args.get('data')  # Obtém a data passada como parâmetro
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta os agendamentos do dia especificado
        query_agendamentos = text(f"""
            SELECT ag.id, ag."dataHoraAgendamento", ag.preco, q.nome AS quadra, q.id AS quadra_id
            FROM "beach-box"."Agendamento" ag
            JOIN "beach-box"."Quadra" q ON ag."idQuadra" = q.id
            WHERE DATE(ag."dataHoraAgendamento") = :data;
        """)
        # Executa a consulta e carrega os resultados em um DataFrame
        agendamentos_df = pd.read_sql(query_agendamentos, con=session.bind, params={"data": data})

        # Calcula o faturamento total do dia
        faturamento = agendamentos_df['preco'].sum()

        # Consulta as quadras disponíveis
        query_disponiveis = text("""
            SELECT id AS quadra_id, "precobase"
            FROM "beach-box"."Quadra"
            WHERE "estaDisponivel" = TRUE;
        """)
        quadras_disponiveis = pd.read_sql(query_disponiveis, con=session.bind)

        # Cálculos adicionais para o relatório
        horario_inicio = 8  # Início do horário de funcionamento
        horario_fim = 22  # Fim do horário de funcionamento
        total_horas_dia = horario_fim - horario_inicio  # Total de horas no dia
        faturamento_maximo = _calcular_faturamento_maximo(quadras_disponiveis, total_horas_dia)
        horas_vagas = total_horas_dia * len(quadras_disponiveis) - len(agendamentos_df)
        gap_faturamento = faturamento_maximo - faturamento

        # Prepara os dados para o frontend
        faturamento_por_quadra = agendamentos_df.groupby('quadra')['preco'].sum().to_dict()
        agendamentos_por_horario = agendamentos_df['dataHoraAgendamento'].dt.hour.value_counts().sort_index().to_dict()

        # Retorna o relatório em formato JSON
        return jsonify({
            "data": data,
            "total_agendamentos": len(agendamentos_df),
            "capacidade_restante": horas_vagas,
            "faturamento": faturamento,
            "faturamento_maximo": faturamento_maximo,
            "gap_faturamento": gap_faturamento,
            "faturamento_por_quadra": faturamento_por_quadra,
            "agendamentos_por_horario": agendamentos_por_horario,
            "detalhes": agendamentos_df.to_dict(orient='records')
        }), 200

    except SQLAlchemyError as e:
        # Retorna um erro caso ocorra uma exceção
        return jsonify({"erro": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

@relatorios_bp.route('/relatorios/customizado', methods=['POST'])
def gerar_relatorio_customizado():
    """
    Endpoint para gerar um relatório customizado.
    Aceita filtros de data de início, data de fim, unidades e quadras.
    """
    data = request.json  # Obtém os dados enviados no corpo da requisição
    data_inicio = data.get('data_inicio')  # Data inicial do filtro
    data_fim = data.get('data_fim')  # Data final do filtro
    unidades = data.get('unidades')  # Filtro de unidades (opcional)
    quadras = data.get('quadras')  # Filtro de quadras (opcional)
    session = config.get_session()  # Cria uma sessão com o banco de dados
    try:
        # Consulta principal para obter agendamentos no intervalo de datas
        query = f"""
            SELECT ag.id, ag."dataHoraAgendamento", ag.preco, q.nome AS quadra, u.nome AS unidade, c.nome AS cliente, q."precobase"
            FROM "beach-box"."Agendamento" ag
            JOIN "beach-box"."Quadra" q ON ag."idQuadra" = q.id
            JOIN "beach-box"."Unidade" u ON q."idUnidade" = u.id
            JOIN "beach-box"."Cliente" c ON ag."idCliente" = c.id
            WHERE DATE(ag."dataHoraAgendamento") BETWEEN :data_inicio AND :data_fim
        """

        # Adiciona filtros opcionais para unidades e quadras
        params = {"data_inicio": data_inicio, "data_fim": data_fim}

        if unidades:
            query += " AND u.id IN :unidades"
            params["unidades"] = tuple(unidades)

        if quadras:
            query += " AND q.id IN :quadras"
            params["quadras"] = tuple(quadras)

        # Executa a consulta e carrega os resultados em um DataFrame
        agendamentos_df = pd.read_sql(text(query), con=session.bind, params=params)

        # Calcula o faturamento total no período
        faturamento = agendamentos_df['preco'].sum()

        # Consulta as quadras disponíveis
        query_disponiveis = text("""
            SELECT id AS quadra_id, "precobase"
            FROM "beach-box"."Quadra"
            WHERE "estaDisponivel" = TRUE;
        """)
        quadras_disponiveis = pd.read_sql(query_disponiveis, con=session.bind)

        # Cálculos adicionais para o relatório
        horario_inicio = 8  # Início do horário de funcionamento
        horario_fim = 22  # Fim do horário de funcionamento
        total_horas_dia = horario_fim - horario_inicio  # Total de horas por dia
        dias_periodo = (datetime.strptime(data_fim, '%Y-%m-%d') - datetime.strptime(data_inicio, '%Y-%m-%d')).days + 1
        faturamento_maximo = _calcular_faturamento_maximo(quadras_disponiveis, total_horas_dia, dias_periodo)
        gap_faturamento = faturamento_maximo - faturamento

        # Prepara os dados para o frontend
        faturamento_por_tempo = {
            str(key): value for key, value in agendamentos_df.groupby(
                agendamentos_df['dataHoraAgendamento'].dt.date
            )['preco'].sum().to_dict().items()
        }
        agendamentos_por_horario = agendamentos_df['dataHoraAgendamento'].dt.hour.value_counts().sort_index().to_dict()

        # Retorna o relatório em formato JSON
        return jsonify({
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "total_agendamentos": len(agendamentos_df),
            "faturamento": faturamento,
            "faturamento_maximo": faturamento_maximo,
            "gap_faturamento": gap_faturamento,
            "faturamento_por_tempo": faturamento_por_tempo,
            "agendamentos_por_horario": agendamentos_por_horario,
            "detalhes": agendamentos_df.to_dict(orient='records')
        }), 200

    except SQLAlchemyError as e:
        # Retorna um erro caso ocorra uma exceção
        return jsonify({"erro": str(e)}), 500
    finally:
        session.close()  # Fecha a sessão com o banco de dados

def _calcular_faturamento_maximo(quadras_disponiveis, total_horas_dia, dias_periodo=1):
    """
    Função auxiliar para calcular o faturamento máximo possível.
    """
    faturamento_maximo = 0
    for _, quadra in quadras_disponiveis.iterrows():
        # Calcula o faturamento máximo considerando o preço base da quadra, o número de horas e dias
        faturamento_maximo += dias_periodo * total_horas_dia * quadra['precobase']
    return faturamento_maximo