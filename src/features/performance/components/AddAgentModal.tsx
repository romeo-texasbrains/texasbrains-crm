'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createAgent } from '../api';
import { Loader2, User, UserPlus, Shield } from 'lucide-react';

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        role: 'sales_agent' as const
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAgent(formData);
            onSuccess();
            onClose();
            setFormData({ full_name: '', role: 'sales_agent' });
        } catch (err: any) {
            console.error('Failed to add agent', err);
            // Provide more specific error info if available
            const msg = err.message || 'Unknown database error';
            alert(`Error adding agent: ${msg}. Please ensure your database is connected.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register Sales Agent">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Agent Full Name</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                required
                                type="text"
                                placeholder="e.g. John Doe"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Assigned Role</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Shield size={18} />
                            </span>
                            <select
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none bg-no-repeat"
                                value={formData.role}
                                disabled
                            >
                                <option value="sales_agent">Sales Agent (Standard Access)</option>
                                <option value="admin">Administrator (Full Access)</option>
                            </select>
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
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Register Professional</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
