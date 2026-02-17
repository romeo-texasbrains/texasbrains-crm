
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createProject } from '../api';
import { getClients } from '@/features/clients/api';
import { getAgents } from '@/features/performance/api';
import { Client, Profile } from '@/lib/types';
import { Loader2, Briefcase, User, Users, DollarSign, Calendar } from 'lucide-react';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedClientId?: string;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSuccess, preselectedClientId }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        client_id: preselectedClientId || '',
        agent_id: '',
        total_amount: 0,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (preselectedClientId) {
            setFormData(prev => ({ ...prev, client_id: preselectedClientId }));
        }
    }, [preselectedClientId]);

    useEffect(() => {
        if (isOpen) {
            Promise.all([getClients(), getAgents()])
                .then(([clientsData, agentsData]) => {
                    setClients(clientsData);
                    setAgents(agentsData);
                })
                .catch(err => console.error('Failed to load project requirements', err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_id) {
            alert('Please select a client');
            return;
        }
        setLoading(true);
        try {
            await createProject({
                ...formData,
                agent_id: formData.agent_id || undefined
            });
            onSuccess();
            onClose();
            setFormData({
                name: '',
                client_id: '',
                agent_id: '',
                total_amount: 0,
                status: 'active',
                start_date: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            console.error('Failed to create project', err);
            alert(`Error creating project: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initialize New Project">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Project Designation</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Briefcase size={18} />
                            </span>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Website Redesign 2024"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Partner / Client</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Users size={18} />
                                </span>
                                <select
                                    required
                                    disabled={!!preselectedClientId}
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none ${preselectedClientId ? 'opacity-60' : ''}`}
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                >
                                    <option value="">Select Partner</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Assigned Lead Agent</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User size={18} />
                                </span>
                                <select
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                    value={formData.agent_id}
                                    onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                                >
                                    <option value="">Select Agent (Optional)</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Contract Valuation (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <DollarSign size={18} />
                                </span>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.total_amount || ''}
                                    onChange={e => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Initialization Date</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar size={18} />
                                </span>
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
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
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Launch Project</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
