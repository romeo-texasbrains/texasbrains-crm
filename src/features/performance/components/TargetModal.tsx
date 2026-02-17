
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { setSalesTarget } from '../api';
import { Profile } from '@/lib/types';
import { Loader2, Target, Calendar, User, DollarSign } from 'lucide-react';

interface TargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    agents: Profile[];
}

export const TargetModal: React.FC<TargetModalProps> = ({ isOpen, onClose, onSuccess, agents }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        agent_id: '',
        period_type: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
        target_amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agent_id) return;
        setLoading(true);
        try {
            await setSalesTarget(formData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to set target', err);
            alert('Error setting target. Please ensure all fields are correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Performance Target">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Sales Agent</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={18} />
                            </span>
                            <select
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                value={formData.agent_id}
                                onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                            >
                                <option value="">Select an Agent</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Period Type</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar size={18} />
                                </span>
                                <select
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                    value={formData.period_type}
                                    onChange={e => setFormData({ ...formData, period_type: e.target.value as any })}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Target Value ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <DollarSign size={18} />
                                </span>
                                <input
                                    required
                                    type="number"
                                    placeholder="50,000"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.target_amount || ''}
                                    onChange={e => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Start Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">End Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
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
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Establish KPI</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
