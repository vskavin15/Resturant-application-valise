import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CloseIcon, TrashIcon } from './Icons';
import CheckoutModal from './CheckoutModal'; // Import the new modal
import { useData } from '../context/DataContext';

const ShoppingCartIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);


const CartDrawer: React.FC = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const { cart, removeFromCart, updateQuantity, cartTotal, totalItems } = useCart();
    const { menuItems } = useData();
    
    const handleProceedToCheckout = () => {
        setIsDrawerOpen(false); // Close the drawer
        setIsCheckoutModalOpen(true); // Open the checkout modal
    };
    
    const handleCloseCheckout = () => {
        setIsCheckoutModalOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-700 transition-transform transform hover:scale-110"
                aria-label="Open Cart"
            >
                <ShoppingCartIcon className="w-8 h-8" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {totalItems}
                    </span>
                )}
            </button>

            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsDrawerOpen(false)}
            ></div>

            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-100">Your Cart</h2>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full text-gray-400 hover:bg-gray-700">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
                        ) : (
                            <ul className="space-y-3">
                                {cart.map((item, index) => {
                                    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                    const basePrice = menuItem?.price || 0;
                                    const modifierPrice = item.selectedModifiers?.reduce((acc, mod) => acc + mod.price, 0) || 0;
                                    const finalPrice = basePrice + modifierPrice;

                                    return (
                                        <li key={`${item.menuItemId}-${index}`} className="flex items-start justify-between p-3 rounded-md bg-gray-700/50">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-100">{item.name}</p>
                                                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                                    <div className="pl-2 mt-1 text-xs text-gray-400">
                                                        {item.selectedModifiers.map(mod => <div key={mod.optionId}>+ {mod.name}</div>)}
                                                    </div>
                                                )}
                                                <div className="flex items-center mt-2">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={e => updateQuantity(item.menuItemId, parseInt(e.target.value))}
                                                        className="w-16 p-1 text-center text-white bg-gray-700 border border-gray-600 rounded-md"
                                                        min="1"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-300">x ₹{finalPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                             <div className="text-right">
                                                <p className="font-semibold text-gray-100">₹{(finalPrice * item.quantity).toFixed(2)}</p>
                                                 <button onClick={() => removeFromCart(item.menuItemId)} className="p-1 mt-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-900/50">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                    
                    {cart.length > 0 && (
                        <div className="p-4 border-t border-gray-700 bg-gray-800">
                            <div className="flex justify-between items-center text-lg font-bold mb-4 text-gray-100">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </aside>
            {isCheckoutModalOpen && <CheckoutModal onClose={handleCloseCheckout} />}
        </>
    );
};

export default CartDrawer;