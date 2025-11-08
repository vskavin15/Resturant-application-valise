import React, { useState, useEffect } from 'react';
// FIX: Corrected import paths.
import { MenuItem, RecipeItem } from '../types';
// FIX: Import useAuth to get the current user for action logging.
import { addMenuItem, updateMenuItem, useAuth } from '../auth';
import { CloseIcon, TrashIcon, SparklesIcon } from './Icons';
import { useData } from '../context/DataContext';
import { getSocket } from '../services/socketService';

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onSave: () => void;
}

const socket = getSocket();

// FIX: Add missing 'prepTime' property to initial form state to match MenuItem type.
const initialFormState: Omit<MenuItem, 'id'> = {
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    modifierGroupIds: [],
    recipe: [],
    prepTime: 0,
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentUser } = useAuth();
  const { modifierGroups, ingredients } = useData();
  
  const inputStyles = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  useEffect(() => {
    if (item) {
      // FIX: Add missing 'prepTime' property when setting form data from an existing item.
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description || '',
        price: item.price,
        stock: item.stock,
        imageUrl: item.imageUrl,
        modifierGroupIds: item.modifierGroupIds || [],
        recipe: item.recipe || [],
        prepTime: item.prepTime,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // FIX: Include 'prepTime' in the numeric field conversion.
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' || name === 'prepTime' ? parseFloat(value) || 0 : value }));
  };
  
  const handleModifierChange = (groupId: string) => {
    setFormData(prev => {
        const newIds = prev.modifierGroupIds?.includes(groupId)
            ? prev.modifierGroupIds.filter(id => id !== groupId)
            : [...(prev.modifierGroupIds || []), groupId];
        return { ...prev, modifierGroupIds: newIds };
    })
  };

  const handleRecipeChange = (index: number, field: keyof RecipeItem, value: string | number) => {
    setFormData(prev => {
        const newRecipe = [...(prev.recipe || [])];
        newRecipe[index] = { ...newRecipe[index], [field]: value };
        return { ...prev, recipe: newRecipe };
    });
  };
  
  const addRecipeItem = () => {
      if (ingredients.length === 0) return;
      setFormData(prev => ({...prev, recipe: [...(prev.recipe || []), { ingredientId: ingredients[0].id, quantity: 0 }]}));
  };
  
  const removeRecipeItem = (index: number) => {
      setFormData(prev => ({...prev, recipe: prev.recipe?.filter((_, i) => i !== index)}));
  };

  const generateDescription = () => {
      if (!formData.name) return;
      setIsGenerating(true);
      socket.emit('generateMenuItemDescription', formData.name, (description: string) => {
          setFormData(prev => ({ ...prev, description }));
          setIsGenerating(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      if (currentUser) updateMenuItem({ ...item, ...formData }, currentUser);
    } else {
      if (currentUser) addMenuItem(formData, currentUser);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {item ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1.5 ml-auto inline-flex items-center">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
              </div>
              <div>
                  <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={inputStyles} rows={3}></textarea>
                  <button type="button" onClick={generateDescription} disabled={isGenerating || !formData.name} className="flex items-center gap-2 mt-2 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50">
                      <SparklesIcon className="w-4 h-4" />
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
              </div>
              <div>
                  <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                  <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className={inputStyles} required />
              </div>
              {/* FIX: Add input for 'prepTime' and adjust grid layout. */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price (₹)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className={inputStyles} required min="0" step="0.01" />
                </div>
                <div>
                    <label htmlFor="stock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock</label>
                    <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className={inputStyles} required min="0" />
                </div>
                <div>
                    <label htmlFor="prepTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prep Time (min)</label>
                    <input type="number" id="prepTime" name="prepTime" value={formData.prepTime} onChange={handleChange} className={inputStyles} required min="0" />
                </div>
              </div>
              <div>
                  <label htmlFor="imageUrl" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image URL</label>
                  <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputStyles} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modifier Groups</label>
                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {modifierGroups.map(group => (
                        <label key={group.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                            <input
                                type="checkbox"
                                checked={formData.modifierGroupIds?.includes(group.id)}
                                onChange={() => handleModifierChange(group.id)}
                                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm">{group.name}</span>
                        </label>
                    ))}
                </div>
              </div>
              
               <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipe (for inventory tracking)</label>
                <div className="p-2 space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {formData.recipe?.map((recipeItem, index) => (
                        <div key={index} className="flex items-center gap-2">
                           <select value={recipeItem.ingredientId} onChange={e => handleRecipeChange(index, 'ingredientId', e.target.value)} className={`flex-grow ${inputStyles}`}>
                               {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                           </select>
                           <input type="number" value={recipeItem.quantity} onChange={e => handleRecipeChange(index, 'quantity', parseFloat(e.target.value))} className={`w-24 ${inputStyles}`} placeholder="Qty"/>
                           <button type="button" onClick={() => removeRecipeItem(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addRecipeItem} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200">Add Ingredient</button>
                </div>
              </div>

          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/50">
                  Save Item
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;