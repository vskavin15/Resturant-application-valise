import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';

const CustomerMenuScreen: React.FC = () => {
    const { menuItems } = useData();
    const { addToCart, customizeItem } = useCart();

    const categories = useMemo(() => {
        const cats = menuItems.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
        return Object.entries(cats);
    }, [menuItems]);

    const handleAddToCart = (item: MenuItem) => {
        if (item.modifierGroupIds && item.modifierGroupIds.length > 0) {
            customizeItem(item);
        } else {
            addToCart({
                menuItemId: item.id,
                name: item.name,
                quantity: 1,
                selectedModifiers: [],
            });
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-gray-100 mb-8">Our Menu</h1>

            <div className="space-y-12">
                {categories.map(([category, items]) => (
                    <div key={category}>
                        <h2 className="text-3xl font-bold text-amber-500 mb-6 pb-2 border-b-2 border-amber-500/20">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map(item => (
                                <div key={item.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="relative">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover" />
                                        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-amber-400 font-bold py-1 px-3 rounded-full">
                                            ₹{item.price.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                        <p className="mt-2 text-sm text-gray-400 flex-grow">{item.description}</p>
                                        <div className="mt-4">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.stock === 0}
                                                className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform transition-transform group-hover:scale-105"
                                            >
                                                {item.stock === 0 ? 'Out of Stock' : (item.modifierGroupIds && item.modifierGroupIds.length > 0 ? 'Customize & Add' : 'Add to Cart')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerMenuScreen;