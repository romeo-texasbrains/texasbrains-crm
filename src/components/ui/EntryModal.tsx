
'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Loader2 } from 'lucide-react';

interface EntryModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}

export const EntryModal: React.FC<EntryModalProps> = ({ title, isOpen, onClose, onSave }) => {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        setLoading(true);
        try {
            await onSave(value);
            setValue('');
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="relative group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Reference Name</label>
                    <input
                        autoFocus
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="e.g. ADIB Main Account"
                        className="w-full bg-gray-50/50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-panze-purple focus:bg-white transition-all font-bold text-gray-800"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="flex-[2] bg-panze-gradient text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-panze hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Parameters'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
