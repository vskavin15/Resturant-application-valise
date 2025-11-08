import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Order, OrderStatus } from '../types';

interface ProfitMarginReportProps {
    orders: Order[];
}

const ProfitMarginReport: React.FC<ProfitMarginReportProps> = ({ orders }) => {
    const { menuItems, ingredients } = useData();

    const reportData = useMemo(() => {
        return menuItems.map(item => {
            const soldItems = orders
                .filter(o => o.status === OrderStatus.DELIVERED)
                .flatMap(o => o.items)
                .filter(i => i.menuItemId === item.id);
            
            const unitsSold = soldItems.reduce((sum, i) => sum + i.quantity, 0);
            const totalRevenue = unitsSold * item.price;

            const costPerItem = item.recipe?.reduce((cost, recipeItem) => {
                const ingredient = ingredients.find(ing => ing.id === recipeItem.ingredientId);
                return cost + (ingredient ? ingredient.cost * recipeItem.quantity : 0);
            }, 0) || 0;

            const totalCost = unitsSold * costPerItem;
            const profit = totalRevenue - totalCost;

            return {
                ...item,
                unitsSold,
                totalRevenue,
                totalCost,
                profit,
                margin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
            };
        }).sort((a,b) => b.profit - a.profit);

    }, [menuItems, ingredients, orders]);

    return (
        <div className="w-full overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full whitespace-no-wrap">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                    <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3 text-right">Revenue</th>
                        <th className="px-4 py-3 text-right">Cost</th>
                        <th className="px-4 py-3 text-right">Profit</th>
                        <th className="px-4 py-3 text-right">Margin</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {reportData.map(item => (
                        <tr key={item.id} className="text-gray-700 dark:text-gray-400">
                            <td className="px-4 py-3 font-semibold">{item.name}</td>
                            <td className="px-4 py-3 text-right">₹{item.totalRevenue.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-red-500">₹{item.totalCost.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-500">₹{item.profit.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">{item.margin.toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfitMarginReport;
