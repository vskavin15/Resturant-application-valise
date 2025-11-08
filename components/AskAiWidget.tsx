import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../context/DataContext';
import { SparklesIcon } from './Icons';
import Markdown from './Markdown';

const AskAiWidget: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const allData = useData();

    const examplePrompts = [
        "What are my top 3 best-selling items?",
        "Summarize today's performance.",
        "Which staff member is offline?",
        "Are there any low-stock items I should re-order?",
    ];

    const handleGenerate = async (currentPrompt = prompt) => {
        if (!currentPrompt || isLoading) return;

        setIsLoading(true);
        setResponse('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const { users, orders, menuItems } = allData;
            const sanitizedData = {
                totalUsers: users.length,
                totalOrders: orders.length,
                totalMenuItems: menuItems.length,
                // Pass only relevant, non-sensitive data to keep the context small
                users: users.map(({ id, name, role, status }) => ({ id, name, role, status })),
                menuItems: menuItems.map(({ id, name, category, price, stock }) => ({ id, name, category, price, stock })),
                orders: orders.map(({ id, customerName, total, status, type, createdAt, items }) => ({ id, customerName, total, status, type, createdAt, itemCount: items.length })),
            };

            const fullPrompt = `You are RMS-AI, a helpful restaurant management assistant. Analyze the following restaurant data and answer the user's question based *only* on this data. Format your response clearly using markdown (e.g., bolding for titles, bullet points for lists). Do not invent any information.

            Today's date is ${new Date().toLocaleDateString()}.

            Data (JSON format):
            ${JSON.stringify(sanitizedData, null, 2)}

            ---

            User's Question: "${currentPrompt}"`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });
            
            setResponse(result.text);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setResponse("Sorry, I couldn't fetch insights at the moment. Please ensure your API key is configured correctly and check the console for errors.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExampleClick = (example: string) => {
        setPrompt(example);
        handleGenerate(example);
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">AI-Powered Insights</h2>
            </div>
            
            <div className="relative">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Ask anything about your restaurant..."
                    className="w-full p-3 pr-28 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
                <button 
                    onClick={() => handleGenerate()}
                    disabled={isLoading}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:bg-amber-400"
                >
                    {isLoading ? 'Thinking...' : 'Generate'}
                </button>
            </div>

             <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {examplePrompts.map(p => (
                    <button 
                        key={p} 
                        onClick={() => handleExampleClick(p)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                    >
                        {p}
                    </button>
                ))}
            </div>

            {(isLoading || response) && (
                 <div className="mt-4 p-4 border-t dark:border-gray-700">
                    {isLoading && (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                             <SparklesIcon className="w-5 h-5 animate-pulse" />
                             <span>Generating insights...</span>
                        </div>
                    )}
                    {response && (
                        <Markdown content={response} />
                    )}
                 </div>
            )}
        </div>
    );
};

export default AskAiWidget;
