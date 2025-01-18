import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientesPage from "@/views/clientes/page";
import QuadrasPage from "@/views/quadras/page";
import UnidadesPage from "./views/unidades/page";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientesPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/quadras" element={<QuadrasPage />} />
        <Route path="/unidades" element={<UnidadesPage />} />
      </Routes>
    </Router>
  );
}
