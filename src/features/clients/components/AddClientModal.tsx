
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '../api';
import { getAgents } from '@/features/performance/api';
import { Profile } from '@/lib/types';
import { Loader2, User, Mail, Phone, MapPin, Building2, Tag, Briefcase } from 'lucide-react';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        industry: '',
        source: '',
        assigned_agent_id: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            getAgents().then(setAgents).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createClient({
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                company: formData.company || null,
                industry: formData.industry || null,
                source: formData.source || null,
                assigned_agent_id: formData.assigned_agent_id || null,
                notes: formData.notes || null,
                status: 'active',
            });
            onSuccess();
            onClose();
            setFormData({
                name: '', email: '', phone: '', address: '',
                company: '', industry: '', source: '',
                assigned_agent_id: '', notes: '',
            });
        } catch (err) {
            console.error('Failed to create client', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Client">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Name + Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Client Name *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-panze-purple transition-colors">
                                <User size={18} />
                            </span>
                            <input
                                required
                                type="text"
                                placeholder="e.g. John Smith"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Company</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-panze-purple transition-colors">
                                <Building2 size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-panze-purple transition-colors">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                placeholder="contact@email.com"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:font-medium"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Phone</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-panze-purple transition-colors">
                                <Phone size={18} />
                            </span>
                            <input
                                type="tel"
                                placeholder="+971 ..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:font-medium"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Row 3: Industry + Source */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Industry</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Briefcase size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="e.g. Technology"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                value={formData.industry}
                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Source</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Tag size={18} />
                            </span>
                            <select
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="">Select Source</option>
                                <option value="Referral">Referral</option>
                                <option value="Website">Website</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Partner">Partner</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Row 4: Agent */}
                <div className="relative group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Assigned Agent</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <User size={18} />
                        </span>
                        <select
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                            value={formData.assigned_agent_id}
                            onChange={e => setFormData({ ...formData, assigned_agent_id: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {agents.map(a => (
                                <option key={a.id} value={a.id}>{a.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 5: Address */}
                <div className="relative group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Address</label>
                    <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-400 group-focus-within:text-panze-purple transition-colors">
                            <MapPin size={18} />
                        </span>
                        <textarea
                            rows={2}
                            placeholder="Street, City, Country"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800 resize-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 panze-btn-secondary">
                        Cancel
                    </button>
                    <button disabled={loading} type="submit" className="flex-[2] panze-btn-primary">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Onboard Client</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
