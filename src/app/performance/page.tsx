
import { PerformanceOverview } from "@/features/performance/components/PerformanceOverview";
import MainLayout from "@/components/MainLayout";

export default function PerformancePage() {
    // In a real app, this ID would come from the current session
    const mockAgentId = "00000000-0000-0000-0000-000000000000";

    return (
        <MainLayout>
            <PerformanceOverview agentId={mockAgentId} />
        </MainLayout>
    );
}
