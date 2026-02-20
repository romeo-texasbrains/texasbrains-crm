
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ComboBox, ComboBoxOption } from '@/components/ui/ComboBox';
import { createProject } from '@/features/ledger/api';
import { createPayment, getBankAccounts } from '@/features/income/api';
import { getClients } from '@/features/clients/api';
import { getAgents } from '@/features/performance/api';
import { getLedger } from '@/features/ledger/api';
import { Client, Profile, ProjectLedger, BankAccount } from '@/lib/types';
import {
    Loader2, Users, User, Briefcase, DollarSign, Calendar,
    FileText, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NewEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type EntryMode = 'new_project' | 'existing_project';

export const NewEntryModal: React.FC<NewEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [projects, setProjects] = useState<ProjectLedger[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [mode, setMode] = useState<EntryMode>('new_project');

    // Form state
    const [clientId, setClientId] = useState('');
    const [agentId, setAgentId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [existingProjectId, setExistingProjectId] = useState('');
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [bankAccountId, setBankAccountId] = useState('');
    const [note, setNote] = useState('');

    const remaining = useMemo(() => {
        if (mode === 'new_project') {
            return Math.max(0, totalAmount - amountPaid);
        }
        // For existing project, show remaining from project data
        const proj = projects.find(p => p.project_id === existingProjectId);
        if (proj) {
            return Math.max(0, proj.remaining_amount - amountPaid);
        }
        return 0;
    }, [mode, totalAmount, amountPaid, existingProjectId, projects]);

    // Load data on open
    useEffect(() => {
        if (isOpen) {
            Promise.all([getClients(), getAgents(), getLedger(), getBankAccounts()])
                .then(([c, a, l, b]) => {
                    setClients(c);
                    setAgents(a);
                    setProjects(l);
                    setBankAccounts(b);
                })
                .catch(err => console.error('Failed to load form data', err));
        }
    }, [isOpen]);

    // Filter projects by selected client
    const clientProjects = useMemo(() => {
        if (!clientId) return [];
        return projects.filter(p => p.client_id === clientId);
    }, [clientId, projects]);

    // Auto-switch mode when client changes
    useEffect(() => {
        setExistingProjectId('');
        // If client has no projects, force new project mode
        if (clientProjects.length === 0) {
            setMode('new_project');
        }
    }, [clientId, clientProjects.length]);

    // When selecting an existing project, populate the amount context
    useEffect(() => {
        if (mode === 'existing_project' && existingProjectId) {
            const proj = projects.find(p => p.project_id === existingProjectId);
            if (proj) {
                setTotalAmount(Number(proj.total_amount));
            }
        }
    }, [existingProjectId, mode, projects]);

    // ComboBox options
    const clientOptions: ComboBoxOption[] = clients.map(c => ({
        value: c.id,
        label: c.name,
        sublabel: c.company || c.email || undefined,
    }));

    const agentOptions: ComboBoxOption[] = agents.map(a => ({
        value: a.id,
        label: a.full_name || 'Unknown Agent',
    }));

    const projectOptions: ComboBoxOption[] = clientProjects.map(p => ({
        value: p.project_id,
        label: p.project_name,
        sublabel: `${formatCurrency(p.paid_amount)} / ${formatCurrency(Number(p.total_amount))} paid`,
    }));

    const bankOptions: ComboBoxOption[] = bankAccounts.map(b => ({
        value: b.id,
        label: b.name,
    }));

    const resetForm = () => {
        setClientId('');
        setAgentId('');
        setProjectName('');
        setExistingProjectId('');
        setTotalAmount(0);
        setAmountPaid(0);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setBankAccountId('');
        setNote('');
        setMode('new_project');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientId) {
            alert('Please select a client');
            return;
        }
        if (mode === 'new_project' && !projectName) {
            alert('Please enter a project name');
            return;
        }
        if (mode === 'existing_project' && !existingProjectId) {
            alert('Please select a project');
            return;
        }
        if (amountPaid <= 0) {
            alert('Please enter a payment amount');
            return;
        }
        if (!bankAccountId) {
            alert('Please select a bank account');
            return;
        }

        setLoading(true);
        try {
            let projectId: string;

            if (mode === 'new_project') {
                // Create the project first
                const newProject = await createProject({
                    client_id: clientId,
                    agent_id: agentId || undefined,
                    name: projectName,
                    total_amount: totalAmount,
                    status: 'active',
                    start_date: paymentDate,
                });
                projectId = newProject.id;
            } else {
                projectId = existingProjectId;
            }

            // Create the payment
            await createPayment({
                project_id: projectId,
                amount: amountPaid,
                payment_date: paymentDate,
                bank_account_id: bankAccountId,
                note: note || undefined,
                is_verified: true,
            });

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Failed to create entry', err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Entry">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ── Step 1: Client ── */}
                <div className="relative group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                        Client
                    </label>
                    <ComboBox
                        options={clientOptions}
                        value={clientId}
                        onChange={setClientId}
                        placeholder="Search clients..."
                        icon={<Users size={18} />}
                        required
                    />
                </div>

                {/* ── Mode Toggle (only if client has existing projects) ── */}
                {clientId && clientProjects.length > 0 && (
                    <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1">
                        <button
                            type="button"
                            onClick={() => setMode('new_project')}
                            className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5
                                ${mode === 'new_project'
                                    ? 'bg-white shadow-sm border border-gray-100 text-gray-800'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Sparkles size={12} /> New Project
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('existing_project')}
                            className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5
                                ${mode === 'existing_project'
                                    ? 'bg-white shadow-sm border border-gray-100 text-gray-800'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <FileText size={12} /> Existing Project
                        </button>
                    </div>
                )}

                {/* ── Step 2: Project Details ── */}
                {clientId && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {mode === 'new_project' ? (
                            <>
                                {/* Project Name */}
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Project Name
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Briefcase size={18} />
                                        </span>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Website Redesign 2025"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                            value={projectName}
                                            onChange={e => setProjectName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Agent (optional) */}
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Assigned Agent (Optional)
                                    </label>
                                    <ComboBox
                                        options={agentOptions}
                                        value={agentId}
                                        onChange={setAgentId}
                                        placeholder="Select agent..."
                                        icon={<User size={18} />}
                                    />
                                </div>

                                {/* Contract Value */}
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Total Contract Value (USD)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <DollarSign size={18} />
                                        </span>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                            value={totalAmount || ''}
                                            onChange={e => setTotalAmount(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Existing Project Selector */
                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    Select Project
                                </label>
                                <ComboBox
                                    options={projectOptions}
                                    value={existingProjectId}
                                    onChange={setExistingProjectId}
                                    placeholder="Search projects..."
                                    icon={<FileText size={18} />}
                                    required
                                />
                            </div>
                        )}

                        {/* ── Step 3: Payment ── */}
                        <div className="border-t border-gray-100 pt-4 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center">
                                    <CheckCircle size={12} className="text-green-600" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Payment Details
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Amount Paid */}
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Amount Paid Now (USD)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <DollarSign size={18} />
                                        </span>
                                        <input
                                            required
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                            value={amountPaid || ''}
                                            onChange={e => setAmountPaid(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Payment Date */}
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Payment Date
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Calendar size={18} />
                                        </span>
                                        <input
                                            required
                                            type="date"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                            value={paymentDate}
                                            onChange={e => setPaymentDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remaining Balance Display */}
                            {(totalAmount > 0 || existingProjectId) && amountPaid > 0 && (
                                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between animate-in fade-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${remaining > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                            <ArrowRight size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Remaining After Payment</p>
                                            <p className={`text-lg font-black tabular-nums ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {formatCurrency(remaining)}
                                            </p>
                                        </div>
                                    </div>
                                    {remaining === 0 && (
                                        <span className="panze-badge panze-badge-success text-[9px]">Fully Paid</span>
                                    )}
                                </div>
                            )}

                            {/* Bank Account + Note */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Destination Account
                                    </label>
                                    <ComboBox
                                        options={bankOptions}
                                        value={bankAccountId}
                                        onChange={setBankAccountId}
                                        placeholder="Select account..."
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Note (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Milestone 1 payment"
                                        className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Submit ── */}
                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 panze-btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading || !clientId}
                        type="submit"
                        className="flex-[2] panze-btn-primary"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <span>
                                {mode === 'new_project' ? 'Create & Record' : 'Record Payment'}
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
