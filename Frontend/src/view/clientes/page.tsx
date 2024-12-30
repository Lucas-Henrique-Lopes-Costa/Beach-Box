import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Cliente, createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

async function getClientes(): Promise<Cliente[]> {
  return [
    {
      id: "1",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "2",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "3",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"],
    },
    {
      id: "4",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"],
    },
  ];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    getClientes().then((data) => {
      setClientes(data);
      setFilteredClientes(data);
    });
  }, []);

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
    }
  };

  const handleDelete = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setFilteredClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) {
      // Novo Cliente
      const newCliente: Cliente = {
        id: Date.now().toString(),
        nome: formData.nome,
        telefone: formData.telefone,
        enderecos: [formData.endereco],
      };
      setClientes((prev) => [...prev, newCliente]);
      setFilteredClientes((prev) => [...prev, newCliente]);
    } else {
      // Editar Cliente
      const updatedClientes = clientes.map((c) =>
        c.id === selectedCliente.id
          ? { ...c, nome: formData.nome, telefone: formData.telefone, enderecos: [formData.endereco] }
          : c
      );
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
      setSelectedCliente(null);
    }

    setFormData({ nome: "", telefone: "", endereco: "" });
  };

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
  });

  useEffect(() => {
    if (selectedCliente) {
      setFormData({
        nome: selectedCliente.nome,
        telefone: selectedCliente.telefone,
        endereco: selectedCliente.enderecos[0] || "",
      });
    } else {
      setFormData({ nome: "", telefone: "", endereco: "" });
    }
  }, [selectedCliente]);

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Clientes</h1>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Pesquisar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
            <DialogTrigger asChild>
              <Button variant="outline">
                {selectedCliente ? "Editar Cliente" : "Novo Cliente"}
              </Button>
            </DialogTrigger>
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
                <Button type="submit">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={createColumns(handleEdit, handleDelete)}
          data={filteredClientes}
        />
      </div>
    </>
  );
}
