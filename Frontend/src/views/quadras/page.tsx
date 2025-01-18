import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Quadra, createColumns } from "./columns";

type Unidade = {
  id: string;
  nome: string;
};

async function fetchAPI(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const jsonResponse = await response.json();
  if (!response.ok || jsonResponse.status !== "success") {
    throw new Error(jsonResponse.message || "Erro na API");
  }
  return jsonResponse.data;
}

export default function QuadrasPage() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [filteredQuadras, setFilteredQuadras] = useState<Quadra[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    localizacao: "",
    tipo: "Beach Tênis",
    precobase: "",
    idUnidade: "",
    estaDisponivel: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuadras();
    fetchUnidades();
  }, []);

  const fetchQuadras = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI("http://localhost:5001/quadras", { method: "GET" });
      setQuadras(data);
      setFilteredQuadras(data);
      toast({ title: "Quadras carregadas com sucesso", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao carregar quadras", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidades = async () => {
    try {
      const data = await fetchAPI("http://localhost:5001/unidades", { method: "GET" });
      setUnidades(data);
    } catch (error) {
      toast({ title: "Erro ao carregar unidades", description: String(error), variant: "destructive" });
    }
  };

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredQuadras(
      quadras.filter(
        (quadra) =>
          quadra.nome.toLowerCase().includes(lowerSearch) ||
          quadra.localizacao.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, quadras]);

  const handleEdit = (id: string) => {
    const quadra = quadras.find((q) => q.id === id);
    if (quadra) {
      setSelectedQuadra(quadra);

      // Verificação adicional para quadra.unidades
      const unidadeId = Array.isArray(quadra.unidades) && quadra.unidades.length > 0
        ? quadra.unidades[0].id
        : "";

      setFormData({
        nome: quadra.nome,
        localizacao: quadra.localizacao,
        tipo: quadra.tipo,
        precobase: quadra.precobase.toString(),
        idUnidade: unidadeId,
        estaDisponivel: quadra.estaDisponivel,
      });

      setIsDialogOpen(true); // Abre o popup
    } else {
      toast({ title: "Erro", description: "Quadra não encontrada.", variant: "destructive" });
    }
  };


  const handleNewQuadra = () => {
    setSelectedQuadra(null);
    setFormData({
      nome: "",
      localizacao: "",
      tipo: "Beach Tênis",
      precobase: "",
      idUnidade: "",
      estaDisponivel: true,
    });
    setIsDialogOpen(true); // Abre o popup
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        nome: formData.nome,
        localizacao: formData.localizacao,
        tipo: formData.tipo,
        precobase: formData.precobase,
        idUnidade: formData.idUnidade || null, // Garante que idUnidade seja null se vazio
        estaDisponivel: formData.estaDisponivel,
      };

      if (selectedQuadra) {
        await fetchAPI(`http://localhost:5001/quadras/${selectedQuadra.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({ title: "Quadra atualizada com sucesso", variant: "success" });
      } else {
        await fetchAPI("http://localhost:5001/quadras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast({ title: "Quadra criada com sucesso", variant: "success" });
      }

      setIsDialogOpen(false);
      fetchQuadras(); // Atualiza a lista de quadras
    } catch (error) {
      toast({ title: "Erro ao salvar quadra", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fetchAPI(`http://localhost:5001/quadras/${id}`, { method: "DELETE" });
      toast({ title: "Quadra excluída com sucesso", variant: "success" });
      fetchQuadras();
    } catch (error) {
      toast({ title: "Erro ao excluir quadra", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilidade = async (id: string) => {
    try {
      const quadra = quadras.find((q) => q.id === id);
      if (!quadra) return;

      const updatedDisponibilidade = !quadra.estaDisponivel;

      await fetchAPI(`http://localhost:5001/quadras/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estaDisponivel: updatedDisponibilidade }),
      });

      setQuadras((prevQuadras) =>
        prevQuadras.map((q) =>
          q.id === id ? { ...q, estaDisponivel: updatedDisponibilidade } : q
        )
      );

      toast({
        title: `Quadra ${updatedDisponibilidade ? "disponibilizada" : "indisponibilizada"} com sucesso`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar disponibilidade",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Quadras</h1>
      <div className="container mx-auto py-10">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Pesquisar por nome ou local..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={handleNewQuadra}>
                Nova Quadra
              </Button>
            </div>
            <DataTable
              columns={createColumns(toggleDisponibilidade, handleEdit, handleDelete)}
              data={filteredQuadras}
            />
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) fetchQuadras();
              }}
            >
              <DialogContent>
                <h2 className="text-lg font-bold mb-4">
                  {selectedQuadra ? "Editar Quadra" : "Cadastrar Nova Quadra"}
                </h2>
                <form onSubmit={handleSave}>
                  <Input
                    name="nome"
                    placeholder="Nome da Quadra"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Input
                    name="localizacao"
                    placeholder="Localização"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className="mb-2"
                  />
                  <select
                    name="tipo"
                    className="w-full mb-2 p-2 border rounded"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                  >
                    <option value="Beach Tênis">Beach Tênis</option>
                    <option value="Vôlei">Vôlei</option>
                    <option value="Futebol">Futebol</option>
                    <option value="Frescobol">Frescobol</option>
                  </select>
                  <select
                    name="idUnidade"
                    className="w-full mb-2 p-2 border rounded"
                    value={formData.idUnidade}
                    onChange={(e) =>
                      setFormData({ ...formData, idUnidade: e.target.value })
                    }
                  >
                    <option value="">Selecione uma Unidade</option>
                    {unidades.map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </select>
                  <Input
                    name="precobase"
                    placeholder="Preço Base (R$)"
                    type="number"
                    value={formData.precobase}
                    onChange={(e) =>
                      setFormData({ ...formData, precobase: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Button type="submit">
                    {selectedQuadra ? "Atualizar" : "Criar"}
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
