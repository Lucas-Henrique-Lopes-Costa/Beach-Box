import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";

type Cliente = {
  id: string;
  nome: string;
};

type Quadra = {
  id: string;
  nome: string;
  idUnidade: string;
  unidade: string;
  estaDisponivel: boolean;
};

type Agendamento = {
  id: string;
  dataHoraAgendamento: string;
  preco: number;
  cliente: string;
  quadra: string;
  idCliente: string;
  idQuadra: string;
  unidade: string;
};

async function fetchAPI(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const jsonResponse = await response.json();
  if (!response.ok || jsonResponse.status !== "success") {
    throw new Error(jsonResponse.message || "Erro na API");
  }
  return jsonResponse.data;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [searchByUnit, setSearchByUnit] = useState<Record<string, string>>({});
  const [filteredByUnit, setFilteredByUnit] = useState<Record<string, Agendamento[]>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [filteredQuadras, setFilteredQuadras] = useState<Quadra[]>([]);
  const [formData, setFormData] = useState({
    dataHoraAgendamento: "",
    preco: "",
    idCliente: "",
    idQuadra: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamentos();
    fetchClientes();
    fetchQuadras();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const data: Agendamento[] = await fetchAPI("/api/agendamentos", { method: "GET" });
      setAgendamentos(data);
      initializeFilters(data);
      toast({ title: "Agendamentos carregados com sucesso", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao carregar agendamentos", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const data = await fetchAPI("/api/clientes", { method: "GET" });
      setClientes(data);
    } catch (error) {
      toast({ title: "Erro ao carregar clientes", description: String(error), variant: "destructive" });
    }
  };

  const fetchQuadras = async () => {
    try {
      const data = await fetchAPI("/api/quadras", { method: "GET" });
      setQuadras(data);
    } catch (error) {
      toast({ title: "Erro ao carregar quadras", description: String(error), variant: "destructive" });
    }
  };

  const initializeFilters = (data: Agendamento[]) => {
    const groupedByUnit = groupByUnit(data);
    setFilteredByUnit(groupedByUnit);
    setSearchByUnit(Object.keys(groupedByUnit).reduce((acc, unit) => ({ ...acc, [unit]: "" }), {}));
  };

  const groupByUnit = (data: Agendamento[]): Record<string, Agendamento[]> => {
    return data.reduce((acc, agendamento) => {
      const unidade = agendamento.unidade || "Sem Unidade";
      if (!acc[unidade]) acc[unidade] = [];
      acc[unidade].push(agendamento);
      return acc;
    }, {} as Record<string, Agendamento[]>);
  };

  const handleSearch = (unidade: string, value: string) => {
    setSearchByUnit((prev) => ({ ...prev, [unidade]: value }));
    const lowerSearch = value.toLowerCase();
    setFilteredByUnit((prev) => ({
      ...prev,
      [unidade]: agendamentos.filter(
        (a) =>
          a.unidade === unidade &&
          (a.cliente.toLowerCase().includes(lowerSearch) || a.quadra.toLowerCase().includes(lowerSearch))
      ),
    }));
  };

  const handleEdit = (id: string) => {
    const agendamento = agendamentos.find((a) => a.id === id);
    if (agendamento) {
      setSelectedAgendamento(agendamento);
      setFormData({
        dataHoraAgendamento: agendamento.dataHoraAgendamento,
        preco: agendamento.preco.toString(),
        idCliente: agendamento.idCliente,
        idQuadra: agendamento.idQuadra,
      });
      setIsDialogOpen(true);
    }
  };

  const handleNewAgendamento = (unidade: string) => {
    const availableQuadras = quadras.filter(
      (q) => q.unidade === unidade && q.estaDisponivel
    );
    setFilteredQuadras(availableQuadras);
    setSelectedAgendamento(null);
    setFormData({
      dataHoraAgendamento: "",
      preco: "",
      idCliente: "",
      idQuadra: "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        dataHoraAgendamento: formData.dataHoraAgendamento,
        preco: formData.preco,
        idCliente: formData.idCliente,
        idQuadra: formData.idQuadra,
      };

      if (selectedAgendamento) {
        await fetchAPI(`/api/agendamentos/${selectedAgendamento.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({ title: "Agendamento atualizado com sucesso", variant: "success" });
      } else {
        await fetchAPI("/api/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({ title: "Agendamento criado com sucesso", variant: "success" });
      }

      setIsDialogOpen(false);
      fetchAgendamentos();
    } catch (error) {
      toast({ title: "Erro ao salvar agendamento", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fetchAPI(`/api/agendamentos/${id}`, { method: "DELETE" });
      toast({ title: "Agendamento excluído com sucesso", variant: "success" });
      fetchAgendamentos();
    } catch (error) {
      toast({ title: "Erro ao excluir agendamento", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Agendamentos por Unidade</h1>
      <div className="container mx-auto py-10">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <>
            {Object.entries(filteredByUnit).map(([unidade, unitAgendamentos]) => (
              <div key={unidade} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{unidade}</h2>
                <div className="flex justify-between items-center mb-4">
                  <Input
                    placeholder="Pesquisar por cliente ou quadra..."
                    value={searchByUnit[unidade] || ""}
                    onChange={(e) => handleSearch(unidade, e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline" onClick={() => handleNewAgendamento(unidade)}>
                    Novo Agendamento
                  </Button>
                </div>
                <DataTable
                  columns={createColumns(handleEdit, handleDelete)}
                  data={unitAgendamentos}
                />
              </div>
            ))}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) fetchAgendamentos();
              }}
            >
              <DialogContent>
                <h2 className="text-lg font-bold mb-4">
                  {selectedAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
                </h2>
                <form onSubmit={handleSave}>
                  <Input
                    type="datetime-local"
                    name="dataHoraAgendamento"
                    value={formData.dataHoraAgendamento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataHoraAgendamento: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Input
                    name="preco"
                    type="number"
                    placeholder="Preço (R$)"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({ ...formData, preco: e.target.value })
                    }
                    className="mb-2"
                  />
                  <select
                    name="idCliente"
                    value={formData.idCliente}
                    onChange={(e) =>
                      setFormData({ ...formData, idCliente: e.target.value })
                    }
                    className="w-full mb-2 p-2 border rounded"
                  >
                    <option value="">Selecione um Cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                  <select
                    name="idQuadra"
                    value={formData.idQuadra}
                    onChange={(e) =>
                      setFormData({ ...formData, idQuadra: e.target.value })
                    }
                    className="w-full mb-2 p-2 border rounded"
                  >
                    <option value="">Selecione uma Quadra</option>
                    {filteredQuadras.map((quadra) => (
                      <option key={quadra.id} value={quadra.id}>
                        {quadra.nome}
                      </option>
                    ))}
                  </select>
                  <Button type="submit">
                    {selectedAgendamento ? "Atualizar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
}
