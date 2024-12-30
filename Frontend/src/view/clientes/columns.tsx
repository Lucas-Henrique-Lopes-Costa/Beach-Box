"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  enderecos: string[];
};

export const columns: ColumnDef<Cliente>[] = [
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
    accessorKey: "enderecos",
    header: "Endereços",
    cell: ({ row }) => (
      <ul>
        {row.original.enderecos.map((endereco, index) => (
          <li key={index}>{endereco}</li>
        ))}
      </ul>
    ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const cliente = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert(`Editar: ${cliente.nome}`)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert(`Excluir: ${cliente.nome}`)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
