import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/hooks/use-toast";

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
  faturamento: number;
  faturamento_por_quadra: Record<string, number>;
  agendamentos_por_horario: Record<number, number>;
};

type RelatorioCustomizado = {
  faturamento_por_tempo: Record<string, number>;
  agendamentos_por_horario: Record<number, number>;
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
    const response = await fetchAPI("http://localhost:5001/unidades", { method: "GET" });
    const data = response.data; // Supondo que os dados estão em response.data
    setUnidades(data); // Salve todo o objeto (id e nome)
  } catch (error) {
    toast({ title: "Erro ao carregar unidades", description: String(error), variant: "destructive" });
  }
};


  const fetchQuadras = async () => {
    try {
      const response = await fetchAPI("http://localhost:5001/quadras", { method: "GET" });
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
        `http://localhost:5001/relatorios/diario?data=${today}`,
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
        `http://localhost:5001/relatorios/customizado`,
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

        {/* <Select onValueChange={(value) => handleFilterChange("unidade", value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a Unidade" />
          </SelectTrigger>
          <SelectContent>
            {unidades.map((unidade) => (
              <SelectItem key={unidade} value={unidade}>
                {unidade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange("quadra", value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a Quadra" />
          </SelectTrigger>
          <SelectContent>
            {quadras.map((quadra) => (
              <SelectItem key={quadra} value={quadra}>
                {quadra}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        <Button onClick={fetchRelatorioCustomizado} disabled={loading}>
          Gerar Relatório Customizado
        </Button>
      </div>

      {relatorioCustomizado && (
        <>
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
