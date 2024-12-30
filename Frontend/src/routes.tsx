import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientesPage from "@/view/clientes/page";
import QuadrasPage from "@/view/quadras/page";
import UnidadesPage from "./view/unidades/page";

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
