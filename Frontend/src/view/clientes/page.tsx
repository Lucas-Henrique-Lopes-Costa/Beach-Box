import { useEffect, useState } from "react";
import { Cliente, columns } from "./columns";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "4",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "5",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "6",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "7",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "8",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "9",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "10",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "11",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "12",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "13",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "14",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "15",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "16",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "17",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "18",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "19",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "20",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "21",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "22",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "23",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "24",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
    {
      id: "25",
      nome: "João da Silva",
      telefone: "123456789",
      enderecos: ["Rua A, 123", "Avenida B, 456"],
    },
    {
      id: "26",
      nome: "Maria Oliveira",
      telefone: "987654321",
      enderecos: ["Praça C, 789"],
    },
    {
      id: "27",
      nome: "José Santos",
      telefone: "456123789",
      enderecos: ["Alameda D, 321"]
    },
    {
      id: "28",
      nome: "Ana Souza",
      telefone: "789456123",
      enderecos: ["Travessa E, 654"]
    },
  ];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();

    // const response = await fetch("/api/clientes", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // });

    if (true) {
      // const novoCliente = await response.json();
      // setClientes((prevClientes) => [...prevClientes, novoCliente]);
      // setFilteredClientes((prevClientes) => [...prevClientes, novoCliente]);
      setFormData({ nome: "", telefone: "", endereco: "" }); // Limpar o formulário
    } else {
      alert("Erro ao cadastrar cliente.");
    }
  };

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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <h2 className="text-lg font-bold mb-4">Cadastrar Novo Cliente</h2>
              <form onSubmit={handleSubmit}>
                <Input
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="mb-2"
                />
                <Input
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className="mb-2"
                />
                <Input
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
        <DataTable columns={columns} data={filteredClientes} />
      </div>
    </>
  );
}
