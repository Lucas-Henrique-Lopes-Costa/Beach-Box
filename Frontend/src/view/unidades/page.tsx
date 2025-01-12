import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { createColumns } from "./columns";

export type Unidade = {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
};

async function getUnidades(): Promise<Unidade[]> {
  return [
    { id: "1", nome: "Unidade 1", endereco: "Rua A, 123", telefone: "123456789" },
    { id: "2", nome: "Unidade 2", endereco: "Rua B, 456", telefone: "987654321" },
  ];
}

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);

  useEffect(() => {
    getUnidades().then(setUnidades);
  }, []);

  const handleSave = (unidade: Unidade) => {
    if (unidade.id) {
      // Editar unidade existente
      setUnidades((prev) =>
        prev.map((u) => (u.id === unidade.id ? unidade : u))
      );
    } else {
      // Adicionar nova unidade
      setUnidades((prev) => [
        ...prev,
        { ...unidade, id: Date.now().toString() },
      ]);
    }
    setSelectedUnidade(null);
  };

  const handleEdit = (id: string) => {
    const unidade = unidades.find((u) => u.id === id);
    if (unidade) setSelectedUnidade(unidade);
  };

  const handleDelete = (id: string) => {
    setUnidades((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Unidades</h1>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Pesquisar por nome ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={!!selectedUnidade} onOpenChange={() => setSelectedUnidade(null)}>
            <DialogTrigger asChild>
              <Button variant="outline">Nova Unidade</Button>
            </DialogTrigger>
            <DialogContent>
              <h2 className="text-lg font-bold mb-4">
                {selectedUnidade ? "Editar Unidade" : "Nova Unidade"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSave({
                    id: selectedUnidade?.id || "",
                    nome: formData.get("nome") as string,
                    endereco: formData.get("endereco") as string,
                    telefone: formData.get("telefone") as string,
                  });
                }}
              >
                <Input
                  name="nome"
                  placeholder="Nome"
                  defaultValue={selectedUnidade?.nome || ""}
                  className="mb-2"
                />
                <Input
                  name="endereco"
                  placeholder="Endereço"
                  defaultValue={selectedUnidade?.endereco || ""}
                  className="mb-2"
                />
                <Input
                  name="telefone"
                  placeholder="Telefone"
                  defaultValue={selectedUnidade?.telefone || ""}
                  className="mb-2"
                />
                <Button type="submit">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={createColumns(handleEdit, handleDelete)}
          data={unidades.filter(
            (u) =>
              u.nome.toLowerCase().includes(search.toLowerCase()) ||
              u.endereco.toLowerCase().includes(search.toLowerCase())
          )}
        />
      </div>
    </>
  );
}
