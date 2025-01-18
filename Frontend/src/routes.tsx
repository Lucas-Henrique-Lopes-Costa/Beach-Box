import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientesPage from "@/views/clientes/page";
import QuadrasPage from "@/views/quadras/page";
import UnidadesPage from "./views/unidades/page";
import HomePage from "./views/home/page";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/quadras" element={<QuadrasPage />} />
        <Route path="/unidades" element={<UnidadesPage />} />
      </Routes>
    </Router>
  );
}
