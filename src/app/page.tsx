
import MainLayout from "@/components/MainLayout";
import { DashboardGrid } from "@/features/dashboard/components/DashboardGrid";


export default function Home() {
  return (
    <MainLayout>
      <div className="mb-8 md:mb-12">
        <p className="text-sm font-bold text-panze-purple uppercase tracking-[0.2em] mb-2">Workspace Intelligence</p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-panze-gradient italic">HAMZA.</span>
        </h2>
      </div>

      <DashboardGrid />
    </MainLayout>
  );
}
