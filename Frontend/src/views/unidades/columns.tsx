"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/ui/ActionCell";

export type Unidade = {
  id: string;
  nome: string;
  localizacao: string;
  telefone: string;
};

export const createColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Unidade>[] => [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "localizacao", header: "Localização" },
  { accessorKey: "telefone", header: "Telefone" },
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
