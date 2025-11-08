import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../context/DataContext';
import { useAuth } from '../auth';
import { MenuItem } from '../types';
import { SparklesIcon } from './Icons';
import { useCart } from '../context/CartContext';

const AiRecommendations: React.FC = () => {
    const [recommendations, setRecommendations] = useState<{itemName: string, reason: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { menuItems, orders } = useData();
    const { currentUser } = useAuth();
    const { addToCart, customizeItem } = useCart();
    
    const myOrders = useMemo(() => {
        if (!currentUser) return [];
        return orders.filter(o => o.customerId === currentUser.id);
    }, [currentUser, orders]);

    useEffect(() => {
        const generateRecs = async () => {
            if (myOrders.length === 0 || menuItems.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const orderHistory = myOrders.flatMap(o => o.items.map(i => i.name));

                const prompt = `
                    You are a helpful restaurant recommender. Based on a customer's order history and the full menu, suggest 3 unique items they might enjoy.
                    - Prioritize items the customer has NOT ordered before.
                    - Provide a short, personalized reason for each suggestion.
                    - Respond ONLY with a JSON array of objects, each with "itemName" and "reason" keys.
                    
                    Example response: [{"itemName": "Carbonara Pasta", "reason": "Since you enjoy savory dishes, you might love our creamy Carbonara."}]

                    Full Menu:
                    ${JSON.stringify(menuItems.map(item => item.name))}

                    Customer Order History:
                    [${orderHistory.join(', ')}]
                `;
                
                const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                
                // FIX: Extract JSON from potential markdown code block before parsing.
                const responseText = result.text;
                const match = responseText.match(/```(json)?\s*([\s\S]*?)\s*```/);
                const jsonString = match ? match[2].trim() : responseText.trim();
                
                const recs = JSON.parse(jsonString);
                setRecommendations(recs);

            } catch (error) {
                console.error("AI recommendation error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        generateRecs();
    }, [myOrders, menuItems]);

    const handleAddToCart = (rec: {itemName: string, reason: string}) => {
        const item = menuItems.find(mi => mi.name === rec.itemName);
        if (!item) return;

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


    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Generating recommendations...</div>;
    }

    if (recommendations.length === 0) return null;

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amber-500"/> Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map(rec => {
                    const item = menuItems.find(mi => mi.name === rec.itemName);
                    if (!item) return null;
                    return (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-md mb-3" />
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">"{rec.reason}"</p>
                            <button
                                onClick={() => handleAddToCart(rec)}
                                className="mt-3 w-full py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 text-sm"
                            >
                                Add to Cart
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AiRecommendations;