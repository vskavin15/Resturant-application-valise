import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ModifierGroup, ModifierOption } from '../types';
import { useAuth, saveModifierGroup, deleteModifierGroup } from '../auth';
import { CloseIcon, EditIcon, TrashIcon, XMarkIcon } from '../components/Icons';

const ModifierGroupModal: React.FC<{
    group: ModifierGroup | null;
    onClose: () => void;
}> = ({ group, onClose }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState<ModifierGroup>(
        group || {
            id: `mod_grp_${Date.now()}`,
            name: '',
            selectionType: 'single',
            options: [{ id: `opt_${Date.now()}`, name: '', price: 0 }]
        }
    );

    const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], [e.target.name]: e.target.name === 'price' ? parseFloat(e.target.value) : e.target.value };
        setFormData({ ...formData, options: newOptions });
    };
    
    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, { id: `opt_${Date.now()}`, name: '', price: 0 }] });
    };

    const removeOption = (index: number) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            saveModifierGroup(formData, currentUser);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <form className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{group ? 'Edit' : 'Create'} Modifier Group</h3>
                    <button type="button" onClick={onClose} className="p-1.5"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleGroupChange} placeholder="Group Name (e.g., Toppings)" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                        <select name="selectionType" value={formData.selectionType} onChange={handleGroupChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="single">Single Choice</option>
                            <option value="multiple">Multiple Choice</option>
                        </select>
                    </div>
                    <h4 className="font-semibold pt-2">Options</h4>
                    <div className="space-y-2">
                        {formData.options.map((opt, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <input name="name" value={opt.name} onChange={e => handleOptionChange(index, e)} placeholder="Option Name" className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                                <input name="price" value={opt.price} onChange={e => handleOptionChange(index, e)} type="number" step="0.01" placeholder="Price (₹)" className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                                <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addOption} className="mt-2 px-3 py-1.5 text-sm font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200">Add Option</button>
                </div>
                <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save Group</button>
                </div>
            </form>
        </div>
    );
};


const ModifiersScreen: React.FC = () => {
    const { modifierGroups } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

    const handleOpenModal = (group: ModifierGroup | null) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleDelete = (groupId: string) => {
        if (currentUser && window.confirm('Are you sure you want to delete this modifier group?')) {
            deleteModifierGroup(groupId, currentUser);
        }
    }

    return (
        <div className="container mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Menu Modifiers</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="px-4 py-2 font-semibold tracking-wide text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                    Create New Group
                </button>
            </div>
            <div className="space-y-4">
                {modifierGroups.map(group => (
                    <div key={group.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">{group.name}</h3>
                                <p className="text-sm text-gray-500">{group.selectionType === 'single' ? 'Select one' : 'Select multiple'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleOpenModal(group)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(group.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                            </div>
                        </div>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {group.options.map(opt => (
                                <span key={opt.id} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">{opt.name} (+₹{opt.price})</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <ModifierGroupModal group={editingGroup} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ModifiersScreen;
