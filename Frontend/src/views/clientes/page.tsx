import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Cliente, createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/hooks/use-toast";

async function fetchAPI(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const jsonResponse = await response.json();
  if (!response.ok || jsonResponse.status !== "success") {
    throw new Error(jsonResponse.message || "Erro na API");
  }
  return jsonResponse.data;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "" });
  const [loading, setLoading] = useState(true);

  // Carrega os clientes ao abrir a tela
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI("/api/clientes", { method: "GET" });
      setClientes(data);
      setFilteredClientes(data);
      toast({ title: "Clientes carregados com sucesso", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao carregar clientes", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Filtro de busca
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredClientes(
      clientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(lowerSearch) ||
          cliente.telefone.includes(lowerSearch)
      )
    );
  }, [search, clientes]);

  const handleEdit = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setSelectedCliente(cliente);
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco, // Corrigido para "endereco"
      });
      setIsDialogOpen(true);
    }
  };

  const handleNewCliente = () => {
    setSelectedCliente(null);
    setFormData({ nome: "", telefone: "", endereco: "" });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedCliente) {
        // Atualizar cliente existente
        await fetchAPI(`/api/clientes/${selectedCliente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formData.nome,
            telefone: formData.telefone,
            endereco: formData.endereco, // Corrigido para "endereco"
          }),
        });
        toast({ title: "Cliente atualizado com sucesso", variant: "success" });
      } else {
        // Criar novo cliente
        await fetchAPI("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formData.nome,
            telefone: formData.telefone,
            endereco: formData.endereco, // Corrigido para "endereco"
          }),
        });
        toast({ title: "Cliente criado com sucesso", variant: "success" });
      }
      setIsDialogOpen(false); // Fecha o popup após salvar
      fetchClientes(); // Atualiza a lista
    } catch (error) {
      toast({ title: "Erro ao salvar cliente", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fetchAPI(`/api/clientes/${id}`, { method: "DELETE" });
      toast({ title: "Cliente excluído com sucesso", variant: "success" });
      fetchClientes(); // Atualiza a lista após excluir
    } catch (error) {
      toast({ title: "Erro ao excluir cliente", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Clientes</h1>
      <div className="container mx-auto py-10">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Pesquisar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={handleNewCliente}>
                Novo Cliente
              </Button>
            </div>
            <DataTable
              columns={createColumns(handleEdit, handleDelete)}
              data={filteredClientes}
            />
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) fetchClientes(); // Atualiza os clientes ao fechar o popup
              }}
            >
              <DialogContent>
                <h2 className="text-lg font-bold mb-4">
                  {selectedCliente ? "Editar Cliente" : "Cadastrar Novo Cliente"}
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
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Input
                    name="endereco"
                    placeholder="Endereço"
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Button type="submit">
                    {selectedCliente ? "Atualizar" : "Criar"}
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
