import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth, useAuthMutations } from '../auth';
import { MenuItem, MenuItemAiAnalysis } from '../types';
import { LightbulbIcon, SparklesIcon } from '../components/Icons';
import Markdown from '../components/Markdown';

const QUADRANT_CONFIG = {
    'Star': { title: 'Stars', description: 'High Profit, High Popularity', bg: 'bg-green-50 dark:bg-green-900/50', border: 'border-green-500' },
    'Plow-Horse': { title: 'Plow-Horses', description: 'Low Profit, High Popularity', bg: 'bg-blue-50 dark:bg-blue-900/50', border: 'border-blue-500' },
    'Puzzle': { title: 'Puzzles', description: 'High Profit, Low Popularity', bg: 'bg-yellow-50 dark:bg-yellow-900/50', border: 'border-yellow-500' },
    'Dog': { title: 'Dogs', description: 'Low Profit, Low Popularity', bg: 'bg-red-50 dark:bg-red-900/50', border: 'border-red-500' },
};

const ItemCard: React.FC<{ item: MenuItem; onClick: () => void }> = ({ item, onClick }) => (
    <button onClick={onClick} className="w-full p-3 text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
        <p className="text-xs text-gray-500">{item.category}</p>
    </button>
);

const AnalysisModal: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
    if (!item.aiAnalysis) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">AI Analysis for: {item.name}</h3>
                </div>
                <div className="p-6">
                    <h4 className="font-bold">Suggestions:</h4>
                    <Markdown content={item.aiAnalysis.suggestions.map(s => `* ${s}`).join('\n')} />
                </div>
                <div className="p-4 border-t dark:border-gray-700 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};

const MenuIntelligenceScreen: React.FC = () => {
    const { menuItems } = useData();
    const { currentUser } = useAuth();
    const { getMenuAnalysis } = useAuthMutations();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const handleGenerateAnalysis = () => {
        if (currentUser) {
            setIsLoading(true);
            getMenuAnalysis(currentUser);
            // The loading state will be turned off by the effect below
        }
    };
    
    // Turn off loading when any item receives analysis data
    useEffect(() => {
        if(menuItems.some(item => item.aiAnalysis)) {
            setIsLoading(false);
        }
    }, [menuItems]);

    const categorizedItems = menuItems.reduce((acc, item) => {
        const category = item.aiAnalysis?.category || 'Puzzle'; // Default to puzzle if not analyzed
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Menu Intelligence</h1>
                <button
                    onClick={handleGenerateAnalysis}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 font-semibold tracking-wide text-white capitalize transition-colors duration-200 transform bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:bg-amber-400"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                </button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-blue-800 dark:text-blue-200 mb-6 flex items-start gap-3">
                <LightbulbIcon className="w-6 h-6 flex-shrink-0 mt-1"/>
                <div>
                    <h3 className="font-bold">How it works</h3>
                    <p className="text-sm">This tool uses AI to analyze your menu items based on their sales popularity and ingredient profitability. It categorizes them into four groups to help you make smarter decisions about pricing, promotion, and menu placement.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(QUADRANT_CONFIG).map(([key, config]) => (
                    <div key={key} className={`p-4 rounded-lg border-l-4 ${config.bg} ${config.border}`}>
                        <h2 className="text-xl font-bold">{config.title}</h2>
                        <p className="text-sm text-gray-500 mb-4">{config.description}</p>
                        <div className="space-y-2">
                           {(categorizedItems[key as keyof typeof QUADRANT_CONFIG] || []).map(item => (
                               <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                           ))}
                           {(!categorizedItems[key as keyof typeof QUADRANT_CONFIG] || categorizedItems[key as keyof typeof QUADRANT_CONFIG].length === 0) && (
                               <p className="text-sm text-gray-400 text-center py-4">No items in this category yet.</p>
                           )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && <AnalysisModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

export default MenuIntelligenceScreen;