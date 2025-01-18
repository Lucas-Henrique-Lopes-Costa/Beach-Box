from Backend.db.config import Config
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from datetime import datetime

class Relatorio:
    def __init__(self):
        self.engine = Config().conectar_bd()

    def gerar_relatorio_diario(self, data):
        """
        Gera o relatório diário com base nos agendamentos do dia fornecido.
        """
        try:
            # Consulta os agendamentos do dia
            query_agendamentos = f"""
            SELECT ag.id, ag."dataHoraAgendamento", ag.preco, q.nome AS quadra, q.id AS quadra_id
            FROM "beach-box"."Agendamento" ag
            JOIN "beach-box"."Quadra" q ON ag."idQuadra" = q.id
            WHERE DATE(ag."dataHoraAgendamento") = '{data}';
            """
            agendamentos_df = pd.read_sql(query_agendamentos, con=self.engine)

            # Faturamento total do dia
            faturamento = agendamentos_df['preco'].sum()

            # Consulta quadras disponíveis
            query_disponiveis = """
            SELECT id AS quadra_id, "precobase"
            FROM "beach-box"."Quadra"
            WHERE "estaDisponivel" = TRUE;
            """
            quadras_disponiveis = pd.read_sql(query_disponiveis, con=self.engine)

            # Cálculo
            horario_inicio = 8
            horario_fim = 22
            total_horas_dia = horario_fim - horario_inicio
            faturamento_maximo = self._calcular_faturamento_maximo(quadras_disponiveis, total_horas_dia)
            horas_vagas = total_horas_dia * len(quadras_disponiveis) - len(agendamentos_df)
            gap_faturamento = faturamento_maximo - faturamento

            return {
                "data": data,
                "total_agendamentos": len(agendamentos_df),
                "capacidade_restante": horas_vagas,
                "faturamento": faturamento,
                "faturamento_maximo": faturamento_maximo,
                "gap_faturamento": gap_faturamento,
                "detalhes": agendamentos_df.to_dict(orient='records'),
            }

        except Exception as e:
            return {"erro": str(e)}

    def gerar_relatorio_customizado(self, data_inicio, data_fim, unidades=None, quadras=None):
        """
        Gera um relatório customizado com base em filtros de período, unidades e quadras.
        Inclui gráficos, rankings e indicadores de faturamento.
        """
        try:
            # Consulta principal
            query = f"""
            SELECT ag.id, ag."dataHoraAgendamento", ag.preco, q.nome AS quadra, u.nome AS unidade, c.nome AS cliente, q."precobase"
            FROM "beach-box"."Agendamento" ag
            JOIN "beach-box"."Quadra" q ON ag."idQuadra" = q.id
            JOIN "beach-box"."Unidade" u ON q."idUnidade" = u.id
            JOIN "beach-box"."Cliente" c ON ag."idCliente" = c.id
            WHERE DATE(ag."dataHoraAgendamento") BETWEEN '{data_inicio}' AND '{data_fim}'
            """
            if unidades:
                unidades_filter = ','.join(map(str, unidades))
                query += f" AND u.id IN ({unidades_filter})"
            if quadras:
                quadras_filter = ','.join(map(str, quadras))
                query += f" AND q.id IN ({quadras_filter})"

            agendamentos_df = pd.read_sql(query, con=self.engine)

            # Faturamento real
            faturamento = agendamentos_df['preco'].sum()

            # Consulta quadras disponíveis
            query_disponiveis = """
            SELECT id AS quadra_id, "precobase"
            FROM "beach-box"."Quadra"
            WHERE "estaDisponivel" = TRUE;
            """
            quadras_disponiveis = pd.read_sql(query_disponiveis, con=self.engine)

            # Cálculos
            horario_inicio = 8
            horario_fim = 22
            total_horas_dia = horario_fim - horario_inicio
            dias_periodo = (datetime.strptime(data_fim, '%Y-%m-%d') - datetime.strptime(data_inicio, '%Y-%m-%d')).days + 1
            faturamento_maximo = self._calcular_faturamento_maximo(quadras_disponiveis, total_horas_dia, dias_periodo)
            gap_faturamento = faturamento_maximo - faturamento

            # Gráficos e Rankings
            faturamento_tempo = agendamentos_df.groupby(agendamentos_df['dataHoraAgendamento'].dt.date)['preco'].sum()
            plt.figure(figsize=(10, 6))
            faturamento_tempo.plot(kind='line', marker='o', title='Faturamento ao Longo do Tempo', xlabel='Data', ylabel='Faturamento')
            faturamento_grafico = self._salvar_grafico_base64()

            agendamentos_df['hora'] = agendamentos_df['dataHoraAgendamento'].dt.hour
            agendamentos_por_horario = agendamentos_df.groupby('hora').size()
            plt.figure(figsize=(10, 6))
            agendamentos_por_horario.plot(kind='bar', title='Número de Agendamentos por Horário', xlabel='Horário', ylabel='Agendamentos')
            agendamentos_horario_grafico = self._salvar_grafico_base64()

            top_clientes_agendamentos = agendamentos_df['cliente'].value_counts().head(3)
            top_clientes_faturamento = agendamentos_df.groupby('cliente')['preco'].sum().sort_values(ascending=False).head(3)
            top_quadras_agendamentos = agendamentos_df['quadra'].value_counts().head(3)
            top_quadras_faturamento = agendamentos_df.groupby('quadra')['preco'].sum().sort_values(ascending=False).head(3)

            return {
                "data_inicio": data_inicio,
                "data_fim": data_fim,
                "total_agendamentos": len(agendamentos_df),
                "faturamento": faturamento,
                "faturamento_maximo": faturamento_maximo,
                "gap_faturamento": gap_faturamento,
                "graficos": {
                    "faturamento_tempo": faturamento_grafico,
                    "agendamentos_horario": agendamentos_horario_grafico,
                },
                "rankings": {
                    "top_clientes_agendamentos": top_clientes_agendamentos.to_dict(),
                    "top_clientes_faturamento": top_clientes_faturamento.to_dict(),
                    "top_quadras_agendamentos": top_quadras_agendamentos.to_dict(),
                    "top_quadras_faturamento": top_quadras_faturamento.to_dict(),
                },
                "detalhes": agendamentos_df.to_dict(orient='records')
            }

        except Exception as e:
            return {"erro": str(e)}

    def _salvar_grafico_base64(self):
        """
        Salva o gráfico atual em Base64 para inclusão no relatório.
        """
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        base64_grafico = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close()
        return base64_grafico
    
    def _calcular_faturamento_maximo(self, quadras_disponiveis, total_horas_dia, dias_periodo=1):
        """
        Calcula o faturamento máximo com base nas quadras disponíveis, horas e dias do período.
        """
        faturamento_maximo = 0
        for _, quadra in quadras_disponiveis.iterrows():
            faturamento_maximo += dias_periodo * total_horas_dia * quadra['precobase']
        return faturamento_maximo