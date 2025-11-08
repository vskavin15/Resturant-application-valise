import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Ingredient } from '../types';
import { useAuth, saveIngredient, deleteIngredient } from '../auth';
import { CloseIcon, EditIcon, TrashIcon } from '../components/Icons';

const IngredientModal: React.FC<{
    ingredient: Ingredient | null;
    onClose: () => void;
}> = ({ ingredient, onClose }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>(
        ingredient || {
            name: '',
            unit: 'kg',
            stock: 0,
            cost: 0,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: (name === 'stock' || name === 'cost') ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            const dataToSave: Ingredient = ingredient 
                ? { ...ingredient, ...formData } 
                : { id: `ing_${Date.now()}`, ...formData };
            saveIngredient(dataToSave, currentUser);
            onClose();
        }
    };
    
    const inputStyles = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <form className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 className="text-xl font-semibold">{ingredient ? 'Edit' : 'Add'} Ingredient</h3>
                    <button type="button" onClick={onClose} className="p-1.5"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Ingredient Name" className={inputStyles} required/>
                    <div className="grid grid-cols-3 gap-4">
                        <input name="stock" value={formData.stock} onChange={handleChange} type="number" placeholder="Stock" className={inputStyles} required/>
                        <select name="unit" value={formData.unit} onChange={handleChange} className={inputStyles}>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="litre">litre</option>
                            <option value="ml">ml</option>
                            <option value="piece">piece</option>
                        </select>
                        <input name="cost" value={formData.cost} onChange={handleChange} type="number" step="0.01" placeholder="Cost per Unit" className={inputStyles} required/>
                    </div>
                </div>
                <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save Ingredient</button>
                </div>
            </form>
        </div>
    );
};

const IngredientsScreen: React.FC = () => {
    const { ingredients } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    const handleOpenModal = (ingredient: Ingredient | null) => {
        setEditingIngredient(ingredient);
        setIsModalOpen(true);
    };

    const handleDelete = (ingredientId: string) => {
        if (currentUser && window.confirm('Are you sure? This will affect recipe calculations.')) {
            deleteIngredient(ingredientId, currentUser);
        }
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ingredient Inventory</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="px-4 py-2 font-semibold tracking-wide text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                    Add Ingredient
                </button>
            </div>
            <div className="w-full overflow-hidden rounded-lg shadow-sm border dark:border-gray-700">
                <table className="w-full whitespace-no-wrap">
                    <thead>
                        <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-900">
                            <th className="px-4 py-3">Ingredient</th>
                            <th className="px-4 py-3">Stock Level</th>
                            <th className="px-4 py-3">Cost per Unit</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                        {ingredients.map(ing => (
                            <tr key={ing.id} className="text-gray-700 dark:text-gray-400">
                                <td className="px-4 py-3 font-semibold">{ing.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold ${ing.stock < 10 ? 'text-red-500' : ''}`}>
                                        {ing.stock} {ing.unit}
                                    </span>
                                </td>
                                <td className="px-4 py-3">₹{ing.cost.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenModal(ing)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(ing.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <IngredientModal ingredient={editingIngredient} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default IngredientsScreen;
