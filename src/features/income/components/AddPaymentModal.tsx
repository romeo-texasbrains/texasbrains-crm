
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createPayment, getBankAccounts, getIncomeCategories } from '../api';
import { getLedger } from '@/features/ledger/api';
import { ProjectLedger, BankAccount, IncomeCategory } from '@/lib/types';
import { Loader2, DollarSign, Calendar, FileText, CreditCard, Tag, CheckCircle } from 'lucide-react';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedClientId?: string;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onSuccess, preselectedClientId }) => {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<ProjectLedger[]>([]);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [categories, setCategories] = useState<IncomeCategory[]>([]);

    const [formData, setFormData] = useState({
        project_id: '',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        bank_account_id: '',
        category_id: '',
        note: '',
        is_verified: true
    });

    useEffect(() => {
        if (isOpen) {
            Promise.all([getLedger(), getBankAccounts(), getIncomeCategories()])
                .then(([ledgerData, accountsData, categoriesData]) => {
                    // Filter projects by client if preselectedClientId is provided
                    const filteredProjects = preselectedClientId
                        ? ledgerData.filter(p => p.client_id === preselectedClientId)
                        : ledgerData;

                    setProjects(filteredProjects);
                    setAccounts(accountsData);
                    setCategories(categoriesData);
                })
                .catch(err => console.error('Failed to load payment requirements', err));
        }
    }, [isOpen, preselectedClientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.project_id) {
            alert('Please select a project');
            return;
        }
        setLoading(true);
        try {
            await createPayment({
                ...formData,
                bank_account_id: formData.bank_account_id || undefined,
                category_id: formData.category_id || undefined
            });
            onSuccess();
            onClose();
            setFormData({
                project_id: '',
                amount: 0,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'Bank Transfer',
                bank_account_id: '',
                category_id: '',
                note: '',
                is_verified: true
            });
        } catch (err: any) {
            console.error('Failed to record payment', err);
            alert(`Error recording payment: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Project Collection">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Link to Project</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <FileText size={18} />
                            </span>
                            <select
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                value={formData.project_id}
                                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => (
                                    <option key={p.project_id} value={p.project_id}>
                                        {p.project_name} ({p.client_name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Collection Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <DollarSign size={18} />
                                </span>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Transaction Date</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar size={18} />
                                </span>
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.payment_date}
                                    onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Destination Bank Account</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <CreditCard size={18} />
                                </span>
                                <select
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                    value={formData.bank_account_id}
                                    onChange={e => setFormData({ ...formData, bank_account_id: e.target.value })}
                                >
                                    <option value="">Select Account (Optional)</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Income Classification</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Tag size={18} />
                                </span>
                                <select
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Select Category (Optional)</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Audit Notes / Narrative</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Milestone 1 Payment..."
                            className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 resize-none"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 panze-btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="flex-[2] panze-btn-primary"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Secure Collection</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
