import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { createColumns } from "./columns";

export type Quadra = {
  id: string;
  nome: string;
  localizacao: string;
  tipo: string;
  precobase: number;
  disponivel: boolean;
};

async function getQuadras(): Promise<Quadra[]> {
  const response = await fetch("http://localhost:5001/quadras");
  if (!response.ok) {
    throw new Error("Erro ao buscar quadras");
  }
  const data = await response.json();

  return data.map((quadra: any) => ({
    id: quadra.id.toString(),
    nome: quadra.nome,
    localizacao: quadra.localizacao,
    tipo: quadra.tipo,
    preco: quadra.precobase,
    disponivel: quadra.disponivel,
  }));
}

export default function QuadrasPage() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [search, setSearch] = useState("");
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | null>(null);

  useEffect(() => {
    getQuadras().then(setQuadras);
  }, []);

  const toggleDisponibilidade = (id: string) => {
    setQuadras((prevQuadras) =>
      prevQuadras.map((quadra) =>
        quadra.id === id
          ? { ...quadra, disponivel: !quadra.disponivel }
          : quadra
      )
    );
  };

  const handleEdit = (id: string) => {
    const quadra = quadras.find((q) => q.id === id);
    if (quadra) {
      setSelectedQuadra(quadra);
    }
  };

  const handleDelete = (id: string) => {
    setQuadras((prevQuadras) => prevQuadras.filter((quadra) => quadra.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedQuadra: Quadra = {
      id: selectedQuadra?.id || Date.now().toString(),
      nome: formData.get("nome") as string,
      localizacao: formData.get("localizacao") as string,
      tipo: formData.get("tipo") as string,
      precobase: parseFloat(formData.get("preco") as string),
      disponivel: selectedQuadra?.disponivel ?? true,
    };

    if (selectedQuadra) {
      // Editando
      setQuadras((prev) =>
        prev.map((q) => (q.id === selectedQuadra.id ? updatedQuadra : q))
      );
    } else {
      // Adicionando nova quadra
      setQuadras((prev) => [...prev, updatedQuadra]);
    }

    setSelectedQuadra(null);
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-10">Quadras</h1>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Pesquisar por nome ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={!!selectedQuadra} onOpenChange={() => setSelectedQuadra(null)}>
            <DialogTrigger asChild>
              <Button variant="outline">
                {selectedQuadra ? "Editar Quadra" : "Nova Quadra"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <h2 className="text-lg font-bold mb-4">
                {selectedQuadra ? "Editar Quadra" : "Cadastrar Nova Quadra"}
              </h2>
              <form onSubmit={handleSave}>
                <Input
                  name="nome"
                  placeholder="Nome da Quadra"
                  defaultValue={selectedQuadra?.nome || ""}
                  className="mb-2"
                />
                <Input
                  name="localizacao"
                  placeholder="Localização"
                  defaultValue={selectedQuadra?.localizacao || ""}
                  className="mb-2"
                />
                <select
                  name="tipo"
                  className="w-full mb-2 p-2 border rounded"
                  defaultValue={selectedQuadra?.tipo || "Beach Tênis"}
                >
                  <option value="Beach Tênis">Beach Tênis</option>
                  <option value="Vôlei">Vôlei</option>
                  <option value="Futebol">Futebol</option>
                  <option value="Frescobol">Frescobol</option>
                </select>
                <Input
                  name="preco"
                  placeholder="Preço Base (R$)"
                  type="number"
                  defaultValue={selectedQuadra?.precobase || ""}
                  className="mb-2"
                />
                <Button type="submit">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={createColumns(toggleDisponibilidade, handleEdit, handleDelete)}
          data={quadras.filter(
            (q) =>
              q.nome.toLowerCase().includes(search.toLowerCase()) ||
              q.localizacao.toLowerCase().includes(search.toLowerCase())
          )}
        />
      </div>
    </>
  );
}
