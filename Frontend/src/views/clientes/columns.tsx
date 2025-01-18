"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/ui/ActionCell";

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
};

// Função para criar colunas com parâmetros onEdit e onDelete
export const createColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Cliente>[] => [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
    },
    {
      accessorKey: "endereco",
      header: "Endereços",
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
