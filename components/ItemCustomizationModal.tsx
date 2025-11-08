import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { MenuItem, ModifierGroup, SelectedModifier } from '../types';
import { CloseIcon } from './Icons';

const ItemCustomizationModal: React.FC = () => {
    const { itemToCustomize, cancelCustomization, addToCart } = useCart();
    const { modifierGroups: allModifierGroups } = useData();
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

    const relevantModifierGroups = useMemo(() => {
        if (!itemToCustomize || !itemToCustomize.modifierGroupIds) return [];
        return allModifierGroups.filter(g => itemToCustomize.modifierGroupIds!.includes(g.id));
    }, [itemToCustomize, allModifierGroups]);
    
    useEffect(() => {
        // Reset state when a new item is selected for customization
        setSelectedOptions({});
    }, [itemToCustomize]);


    const handleSelectionChange = (groupId: string, optionId: string, selectionType: 'single' | 'multiple') => {
        setSelectedOptions(prev => {
            const newSelections = { ...prev };
            if (selectionType === 'single') {
                newSelections[groupId] = [optionId];
            } else {
                const current = newSelections[groupId] || [];
                if (current.includes(optionId)) {
                    newSelections[groupId] = current.filter(id => id !== optionId);
                } else {
                    newSelections[groupId] = [...current, optionId];
                }
            }
            return newSelections;
        });
    };
    
    const handleAddToCart = () => {
        if (!itemToCustomize) return;

        const selectedModifiers: SelectedModifier[] = [];
        relevantModifierGroups.forEach(group => {
            const selectedIds = selectedOptions[group.id] || [];
            selectedIds.forEach(optionId => {
                const option = group.options.find(opt => opt.id === optionId);
                if (option) {
                    selectedModifiers.push({
                        groupId: group.id,
                        optionId: option.id,
                        name: option.name,
                        price: option.price
                    });
                }
            });
        });

        addToCart({
            menuItemId: itemToCustomize.id,
            name: itemToCustomize.name,
            quantity: 1,
            selectedModifiers: selectedModifiers
        });
    };
    
    const total = useMemo(() => {
        let currentTotal = itemToCustomize?.price || 0;
        Object.entries(selectedOptions).forEach(([groupId, optionIds]) => {
            const group = relevantModifierGroups.find(g => g.id === groupId);
            if (group) {
                optionIds.forEach(optionId => {
                    const option = group.options.find(opt => opt.id === optionId);
                    if (option) currentTotal += option.price;
                });
            }
        });
        return currentTotal;
    }, [itemToCustomize, selectedOptions, relevantModifierGroups]);

    if (!itemToCustomize) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={cancelCustomization}>
             <div className="relative w-full max-w-lg bg-gray-800 rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b rounded-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white">Customize {itemToCustomize.name}</h3>
                    <button type="button" onClick={cancelCustomization} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {relevantModifierGroups.map(group => (
                        <div key={group.id}>
                            <h4 className="font-semibold text-gray-100">{group.name}</h4>
                            <p className="text-xs text-gray-400 mb-2">{group.selectionType === 'single' ? 'Choose one' : 'Choose any'}</p>
                            <div className="space-y-2">
                                {group.options.map(option => (
                                    <label key={option.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedOptions[group.id]?.includes(option.id) ? 'border-amber-500 bg-amber-900/50' : 'border-gray-700 bg-gray-900'}`}>
                                        <div className="flex items-center">
                                            <input
                                                type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                                                name={group.id}
                                                checked={selectedOptions[group.id]?.includes(option.id) || false}
                                                onChange={() => handleSelectionChange(group.id, option.id, group.selectionType)}
                                                className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 focus:ring-amber-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-200">{option.name}</span>
                                        </div>
                                        {option.price > 0 && <span className="text-sm text-gray-400">+₹{option.price.toFixed(2)}</span>}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-900">
                    <span className="text-xl font-bold text-white">Total: ₹{total.toFixed(2)}</span>
                    <button onClick={handleAddToCart} className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default ItemCustomizationModal;