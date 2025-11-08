import React, { createContext, useState, useContext, useMemo } from 'react';
import { OrderItem, MenuItem } from '../types';
import { useData } from './DataContext';

interface CartContextType {
    cart: OrderItem[];
    addToCart: (item: OrderItem) => void;
    removeFromCart: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    totalItems: number;
    itemToCustomize: MenuItem | null;
    customizeItem: (item: MenuItem) => void;
    cancelCustomization: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);
    const { menuItems: allMenuItems } = useData();
    
    const customizeItem = (item: MenuItem) => setItemToCustomize(item);
    const cancelCustomization = () => setItemToCustomize(null);

    const addToCart = (orderItem: OrderItem) => {
        setCart(prevCart => {
            // A simple check to see if an identical item is already in the cart.
            // For items with modifiers, we treat each unique combination as a separate cart entry.
            // A more advanced implementation might merge identical items.
            const existingItem = prevCart.find(item => 
                item.menuItemId === orderItem.menuItemId &&
                JSON.stringify(item.selectedModifiers) === JSON.stringify(orderItem.selectedModifiers)
            );
            if (existingItem) {
                return prevCart.map(item => 
                    item.menuItemId === existingItem.menuItemId && JSON.stringify(item.selectedModifiers) === JSON.stringify(existingItem.selectedModifiers)
                    ? { ...item, quantity: item.quantity + orderItem.quantity } 
                    : item
                );
            }
            return [...prevCart, orderItem];
        });
        cancelCustomization();
    };

    const removeFromCart = (menuItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(menuItemId);
            return;
        }
        setCart(prevCart => prevCart.map(item => 
            item.menuItemId === menuItemId ? { ...item, quantity } : item
        ));
    };
    
    const clearCart = () => {
        setCart([]);
    };

    const { cartTotal, totalItems } = useMemo(() => {
        let total = 0;
        let itemsCount = 0;
        cart.forEach(cartItem => {
            const menuItem = allMenuItems.find(mi => mi.id === cartItem.menuItemId);
            let itemPrice = menuItem ? menuItem.price : 0;
            
            if (cartItem.selectedModifiers) {
                itemPrice += cartItem.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
            }

            total += itemPrice * cartItem.quantity;
            itemsCount += cartItem.quantity;
        });
        return { cartTotal: total, totalItems: itemsCount };
    }, [cart, allMenuItems]);


    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, totalItems, itemToCustomize, customizeItem, cancelCustomization }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};