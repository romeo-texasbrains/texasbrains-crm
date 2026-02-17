
import React from 'react';
import MainLayout from '@/components/MainLayout';
import { ClientsList } from '@/features/clients/components/ClientsList';

export default function ClientsPage() {
    return (
        <MainLayout>
            <ClientsList />
        </MainLayout>
    );
}
