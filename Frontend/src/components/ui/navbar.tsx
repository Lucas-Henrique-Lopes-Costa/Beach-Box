import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Nome da Aplicação */}
        <h1 className="text-xl font-bold">BeachBox</h1>
        {/* Links do Menu */}
        <nav className="flex space-x-4">
          <a href="/">
            Home
          </a>
          <a href="/clientes">
            Clientes
          </a>
          <a href="/quadras">
            Quadras
          </a>
          <a href="/unidades">
            Unidades
          </a>
          <a href="/agendamentos">
            Agendamentos
          </a>
          <a href="/relatorios">
            Relatórios
          </a>
        </nav>
        {/* Botão de Ação */}
        <Button variant="outline" className="border-white text-black">
          Sair
        </Button>
      </div>
    </header>
  );
}
