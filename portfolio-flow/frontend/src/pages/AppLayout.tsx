import { Outlet } from "react-router-dom";
import { Header } from "components/Header";

export default function AppLayout() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
