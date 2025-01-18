import { Navbar } from "@/components/ui/navbar";
import { AppRoutes } from "@/routes";
import { Toaster } from "@/components/ui/toaster"; // Certifique-se de ajustar o caminho para o seu projeto

export function App() {
  return (
    <>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Toaster />
    </>
  );
}
