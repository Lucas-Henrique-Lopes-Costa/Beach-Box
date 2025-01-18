"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Unidade } from "./page";
import { ActionCell } from "@/components/ui/ActionCell";

export const createColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Unidade>[] => [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "endereco", header: "Endereço" },
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
