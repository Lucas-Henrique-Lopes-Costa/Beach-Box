"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/ui/ActionCell";

export type Agendamento = {
  id: string;
  dataHoraAgendamento: string;
  preco: number;
  cliente: string;
  quadra: string;
};

export const createColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Agendamento>[] => [
  {
    accessorKey: "dataHoraAgendamento",
    header: "Data e Hora",
    cell: ({ row }) => new Date(row.original.dataHoraAgendamento).toLocaleString("pt-BR"),
  },
  {
    accessorKey: "preco",
    header: "Preço",
    cell: ({ row }) => `R$ ${parseFloat(row.original.preco.toString()).toFixed(2)}`,
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
  },
  {
    accessorKey: "quadra",
    header: "Quadra",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionCell id={row.original.id} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
