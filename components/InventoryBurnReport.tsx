

import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
// FIX: Import Order type to be used in props.
import { Order, OrderStatus } from '../types';

// FIX: Add props interface to accept filtered orders.
interface InventoryBurnReportProps {
    orders: Order[];
}

// FIX: Update component to accept orders as a prop instead of using the global context.
const InventoryBurnReport: React.FC<InventoryBurnReportProps> = ({ orders }) => {
  const { menuItems } = useData();

  const inventoryData = useMemo(() => {
    return menuItems.map(item => {
        const unitsSold = orders
            .filter(o => o.status === OrderStatus.DELIVERED)
            .flatMap(o => o.items)
            .filter(i => i.menuItemId === item.id)
            .reduce((sum, i) => sum + i.quantity, 0);
        return { ...item, unitsSold };
    }).sort((a,b) => b.unitsSold - a.unitsSold);
  }, [menuItems, orders]);

  return (
    <div className="w-full overflow-hidden">
        <div className="w-full overflow-x-auto max-h-96">
            <table className="w-full whitespace-no-wrap">
                <thead>
                    <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800 sticky top-0">
                    <th className="px-4 py-3">Menu Item</th>
                    <th className="px-4 py-3 text-center">Units Sold</th>
                    <th className="px-4 py-3 text-center">Stock Left</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {inventoryData.map((item) => (
                    <tr key={item.id} className="text-gray-700 dark:text-gray-400">
                        <td className="px-4 py-3">
                            <div className="flex items-center text-sm">
                                <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{item.category}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold">{item.unitsSold}</td>
                        <td className="px-4 py-3 text-sm text-center">
                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                                item.stock < 15 
                                ? 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100' 
                                : 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                            }`}>
                                {item.stock}
                            </span>
                        </td>
                    </tr>
                    ))}
                     {inventoryData.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-4 text-gray-500">No inventory data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default InventoryBurnReport;