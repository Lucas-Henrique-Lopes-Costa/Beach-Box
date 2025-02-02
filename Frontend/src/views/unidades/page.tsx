import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Unidade, createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

async function fetchAPI(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const jsonResponse = await response.json();
  if (!response.ok || jsonResponse.status !== "success") {
    throw new Error(jsonResponse.message || "Erro na API");
  }
  return jsonResponse.data;
}

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [filteredUnidades, setFilteredUnidades] = useState<Unidade[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    localizacao: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(true);

  // Carrega as unidades ao abrir a tela
  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI("/api/unidades", {
        method: "GET",
      });
      setUnidades(data);
      setFilteredUnidades(data);
      toast({ title: "Unidades carregadas com sucesso", variant: "success" });
    } catch (error) {
      toast({
        title: "Erro ao carregar unidades",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtro de busca
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredUnidades(
      unidades.filter(
        (unidade) =>
          unidade.nome.toLowerCase().includes(lowerSearch) ||
          unidade.localizacao.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, unidades]);

  const handleEdit = (id: string) => {
    const unidade = unidades.find((u) => u.id === id);
    if (unidade) {
      setSelectedUnidade(unidade);
      setFormData({
        nome: unidade.nome,
        localizacao: unidade.localizacao,
        telefone: unidade.telefone,
      });
      setIsDialogOpen(true);
    }
  };

  const handleNewUnidade = () => {
    setSelectedUnidade(null);
    setFormData({ nome: "", localizacao: "", telefone: "" });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedUnidade) {
        // Atualizar unidade existente
        await fetchAPI(`/api/unidades/${selectedUnidade.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({
          title: "Unidade atualizada com sucesso",
          variant: "success",
        });
      } else {
        // Criar nova unidade
        await fetchAPI("/api/unidades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({
          title: "Unidade criada com sucesso",
          variant: "success",
        });
      }
      setIsDialogOpen(false); // Fecha o popup após salvar
    } catch (error) {
      toast({
        title: "Erro ao salvar unidade",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fetchAPI(`/api/unidades/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Unidade excluída com sucesso",
        variant: "success",
      });
      fetchUnidades(); // Atualiza a lista após excluir
    } catch (error) {
      toast({
        title: "Erro ao excluir unidade",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Unidades</h1>
      <div className="container mx-auto py-10">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Pesquisar por nome ou endereço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={handleNewUnidade}>
                Nova Unidade
              </Button>
            </div>
            <DataTable
              columns={createColumns(handleEdit, handleDelete)}
              data={filteredUnidades}
            />
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) fetchUnidades(); // Atualiza as unidades ao fechar o popup
              }}
            >
              <DialogContent>
                <h2 className="text-lg font-bold mb-4">
                  {selectedUnidade ? "Editar Unidade" : "Cadastrar Nova Unidade"}
                </h2>
                <form onSubmit={handleSave}>
                  <Input
                    name="nome"
                    placeholder="Nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Input
                    name="localizacao"
                    placeholder="Endereço"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Input
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Button type="submit">
                    {selectedUnidade ? "Atualizar" : "Criar"}
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
