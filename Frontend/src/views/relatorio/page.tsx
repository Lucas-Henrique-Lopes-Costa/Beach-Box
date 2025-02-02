import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

type FilterData = {
  dataInicio: string;
  dataFim: string;
  unidade: string | null;
  quadra: string | null;
};

type RelatorioDiario = {
  capacidade_restante: number;
  faturamento_maximo: number;
  gap_faturamento: number;
  faturamento: number;
  total_agendamentos: number;
  faturamento_por_quadra: Record<string, number>;
  agendamentos_por_horario: Record<number, number>;
};

type RelatorioCustomizado = {
  faturamento_por_tempo: Record<string, number>;
  agendamentos_por_horario: Record<number, number>;
  total_agendamentos: number;
  faturamento_maximo: number;
  faturamento: number;
  gap_faturamento: number;
};

async function fetchAPI(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const jsonResponse = await response.json();
  if (!response.ok) {
    throw new Error(jsonResponse.erro || "Erro na API");
  }
  return jsonResponse;
}

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const [filterData, setFilterData] = useState<FilterData>({
    dataInicio: today,
    dataFim: today,
    unidade: null,
    quadra: null,
  });

  const [unidades, setUnidades] = useState<string[]>([]);
  const [quadras, setQuadras] = useState<string[]>([]);
  const [relatorioDiario, setRelatorioDiario] = useState<RelatorioDiario | null>(null);
  const [relatorioCustomizado, setRelatorioCustomizado] = useState<RelatorioCustomizado | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnidades();
    fetchQuadras();
    fetchRelatorioDiario();
  }, []);

  const fetchUnidades = async () => {
    try {
      const response = await fetchAPI("/api/unidades", { method: "GET" });
      const data = response.data; // Supondo que os dados estão em response.data
      setUnidades(data); // Salve todo o objeto (id e nome)
    } catch (error) {
      toast({ title: "Erro ao carregar unidades", description: String(error), variant: "destructive" });
    }
  };


  const fetchQuadras = async () => {
    try {
      const response = await fetchAPI("/api/quadras", { method: "GET" });
      const data = response.data; // Supondo que os dados estão em response.data
      setQuadras(data.map((q: { nome: string }) => q.nome));
    } catch (error) {
      toast({ title: "Erro ao carregar quadras", description: String(error), variant: "destructive" });
    }
  };


  const fetchRelatorioDiario = async () => {
    try {
      setLoading(true);
      const data: RelatorioDiario = await fetchAPI(
        `/api/relatorios/diario?data=${today}`,
        { method: "GET" }
      );
      setRelatorioDiario(data);
    } catch (error) {
      toast({ title: "Erro ao carregar relatório diário", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatorioCustomizado = async () => {
    try {
      setLoading(true);
      const data: RelatorioCustomizado = await fetchAPI(
        `/api/relatorios/customizado`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data_inicio: filterData.dataInicio,
            data_fim: filterData.dataFim,
            unidades: filterData.unidade ? [filterData.unidade] : null,
            quadras: filterData.quadra ? [filterData.quadra] : null,
          }),
        }
      );
      setRelatorioCustomizado(data);
    } catch (error) {
      toast({ title: "Erro ao carregar relatório customizado", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterData, value: string | null) => {
    setFilterData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Dashboard de Relatórios</h1>

      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <Button onClick={fetchRelatorioDiario} disabled={loading}>
          Atualizar Relatório Diário
        </Button>
      </div>

      {relatorioDiario && (
        <>
          <h2 className="text-2xl font-bold mb-4">Relatório Diário - {today}</h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{relatorioDiario.total_agendamentos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Horários Restantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{relatorioDiario.capacidade_restante}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioDiario.faturamento.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioDiario.faturamento_maximo.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gap de Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioDiario.gap_faturamento.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Bar
            data={{
              labels: Object.keys(relatorioDiario.faturamento_por_quadra),
              datasets: [
                {
                  label: "Faturamento por Quadra",
                  data: Object.values(relatorioDiario.faturamento_por_quadra),
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              scales: { x: { beginAtZero: true } },
            }}
          />


          {/* Tabela de Faturamento por Quadra */}
          <h3 className="text-xl font-bold mt-10 mb-4">Faturamento por Quadra</h3>
          <Table>
            <TableBody>
              {Object.entries(relatorioDiario.faturamento_por_quadra).map(([quadra, faturamento]) => (
                <TableRow key={quadra}>
                  <TableCell>{quadra}</TableCell>
                  <TableCell>R$ {faturamento.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </>
      )}

      <h2 className="text-2xl font-bold mt-10 mb-4">Relatório Customizado</h2>

      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex flex-col">
          <label>Data Início</label>
          <Input
            type="date"
            value={filterData.dataInicio}
            onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label>Data Fim</label>
          <Input
            type="date"
            value={filterData.dataFim}
            onChange={(e) => handleFilterChange("dataFim", e.target.value)}
          />
        </div>

        <Button onClick={fetchRelatorioCustomizado} disabled={loading}>
          Gerar Relatório Customizado
        </Button>
      </div>

      {relatorioCustomizado && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{relatorioCustomizado.total_agendamentos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioCustomizado.faturamento.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioCustomizado.faturamento_maximo.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gap de Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">R$ {relatorioCustomizado.gap_faturamento.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Line
            data={{
              labels: Object.keys(relatorioCustomizado.faturamento_por_tempo),
              datasets: [
                {
                  label: "Faturamento por Dia",
                  data: Object.values(relatorioCustomizado.faturamento_por_tempo),
                  backgroundColor: "rgba(255, 159, 64, 0.2)",
                  borderColor: "rgba(255, 159, 64, 1)",
                  borderWidth: 1,
                },
              ],
            }}
          />
        </>
      )}
    </div>
  );
}
