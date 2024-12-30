import { Navbar } from "@/components/ui/navbar";
import { AppRoutes } from "@/routes";

export function App() {
  return (
    <>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </>
  );
}
