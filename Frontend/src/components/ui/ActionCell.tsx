import { Button } from "@/components/ui/button";

type ActionCellProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  id: string;
};

export function ActionCell({ onEdit, onDelete, id }: ActionCellProps) {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
        Editar
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
        Excluir
      </Button>
    </div>
  );
}
