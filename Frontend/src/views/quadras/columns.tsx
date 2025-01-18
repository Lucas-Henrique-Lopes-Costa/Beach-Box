"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActionCell } from "@/components/ui/ActionCell";

type Unidade = {
  id: string;
  nome: string;
};

export type Quadra = {
  id: string;
  nome: string;
  localizacao: string;
  tipo: string;
  precobase: number;
  estaDisponivel: boolean;
  unidades: Unidade[];
};

export const createColumns = (
  toggleDisponibilidade: (id: string) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Quadra>[] => [{ accessorKey: "nome", header: "Nome" },
{ accessorKey: "localizacao", header: "Localização" },
{ accessorKey: "tipo", header: "Tipo" },
{ accessorKey: "preco", header: "Preço", cell: ({ row }) => `R$ ${row.original.precobase}` },
{
  accessorKey: "disponivel",
  header: "Disponibilidade",
  cell: ({ row }) => (
    <div className="flex items-center">
      <span
        className={`mr-2 ${row.original.estaDisponivel ? "text-green-600" : "text-red-600"
          }`}
      >
        {row.original.estaDisponivel ? "Disponível" : "Indisponível"}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleDisponibilidade(row.original.id)}
      >
        Alterar
      </Button>
    </div>
  ),
},
{
  id: "actions",
  header: "Ações",
  cell: ({ row }) => (
    <ActionCell
      id={row.original.id}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ),
},
  ];
