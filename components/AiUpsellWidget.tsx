import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../context/DataContext';
import { OrderItem, MenuItem } from '../types';
import { SparklesIcon } from './Icons';

interface AiUpsellWidgetProps {
    currentItems: OrderItem[];
    onAddItem: (item: MenuItem) => void;
}

const AiUpsellWidget: React.FC<AiUpsellWidgetProps> = ({ currentItems, onAddItem }) => {
    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { menuItems } = useData();

    useEffect(() => {
        const generateSuggestions = async () => {
            if (currentItems.length === 0) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const itemNames = currentItems.map(i => i.name).join(', ');

                const prompt = `
                    Based on the following restaurant menu and the items currently in the order, suggest 2 relevant items to upsell or pair.
                    - The suggestions should not already be in the order.
                    - Suggest popular and profitable pairings. For example, a beverage with a main course, or a dessert.
                    - Respond ONLY with a JSON array of the names of the suggested menu items. Example: ["Iced Tea", "Chocolate Brownie"]

                    Menu (available items):
                    ${JSON.stringify(menuItems.map(({name, category, price}) => ({name, category, price})))}

                    Current Order:
                    [${itemNames}]
                `;
                
                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                // FIX: Extract JSON from potential markdown code block before parsing.
                const responseText = result.text;
                const match = responseText.match(/```(json)?\s*([\s\S]*?)\s*```/);
                const jsonString = match ? match[2].trim() : responseText.trim();

                const suggestedNames: string[] = JSON.parse(jsonString);
                const suggestedMenuItems = menuItems.filter(item => suggestedNames.includes(item.name));
                setSuggestions(suggestedMenuItems);

            } catch (error) {
                console.error("AI suggestion error:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            generateSuggestions();
        }, 1000); // Debounce to avoid rapid API calls

        return () => clearTimeout(debounceTimer);

    }, [currentItems, menuItems]);

    return (
        <div className="p-3 border-y dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5"/> AI Assistant
            </h4>
            {isLoading ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">Thinking...</p>
            ) : suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => onAddItem(item)}
                            className="px-2 py-1 bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-200 text-xs font-medium rounded-md hover:bg-amber-200"
                        >
                            + Add {item.name}
                        </button>
                    ))}
                </div>
            ) : (
                 <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Add items to see suggestions.</p>
            )}
        </div>
    );
};

export default AiUpsellWidget;