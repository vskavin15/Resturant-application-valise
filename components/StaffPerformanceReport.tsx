

import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
// FIX: Import Order type to be used in props.
import { Role, OrderType, OrderStatus, Order } from '../types';

// FIX: Add props interface to accept filtered orders.
interface StaffPerformanceReportProps {
    orders: Order[];
}

// FIX: Update component to accept orders as a prop instead of using the global context.
const StaffPerformanceReport: React.FC<StaffPerformanceReportProps> = ({ orders }) => {
  const { users } = useData();

  const staffPerformance = useMemo(() => {
    const staff = users.filter(u => [Role.SERVER, Role.DELIVERY_PARTNER].includes(u.role));
    return staff.map(s => {
        const handledOrders = orders.filter(o => 
          (s.role === Role.SERVER && o.type === OrderType.DINE_IN && o.status === OrderStatus.DELIVERED) || 
          (s.role === Role.DELIVERY_PARTNER && o.deliveryPartnerId === s.id && o.status === OrderStatus.DELIVERED)
        );
        return {
            ...s,
            ordersHandled: handledOrders.length,
            totalValue: handledOrders.reduce((sum, order) => sum + order.total, 0),
        };
    }).sort((a,b) => b.totalValue - a.totalValue);
  }, [users, orders]);

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
              <th className="px-4 py-3">Staff Member</th>
              <th className="px-4 py-3 text-center">Orders Handled</th>
              <th className="px-4 py-3 text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {staffPerformance.map((staff) => (
              <tr key={staff.id} className="text-gray-700 dark:text-gray-400">
                <td className="px-4 py-3">
                  <div className="flex items-center text-sm">
                    <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                      <img className="object-cover w-full h-full rounded-full" src={staff.avatarUrl} alt={staff.name} loading="lazy" />
                    </div>
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{staff.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center">{staff.ordersHandled}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">${staff.totalValue.toFixed(2)}</td>
              </tr>
            ))}
            {staffPerformance.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">No performance data available.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformanceReport;