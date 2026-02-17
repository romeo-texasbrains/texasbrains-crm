
import MainLayout from "@/components/MainLayout";
import { ClientDetailPage } from "@/features/clients/components/ClientDetailPage";

interface ClientPageProps {
    params: Promise<{ id: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
    const { id } = await params;
    return (
        <MainLayout>
            <ClientDetailPage clientId={id} />
        </MainLayout>
    );
}
