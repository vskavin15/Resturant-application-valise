import React, { useMemo } from 'react';
// FIX: Corrected import paths.
import { updateTable } from '../auth';
import { Table, TableStatus, Order } from '../types';
import TableCard from '../components/TableCard';
import { useData } from '../context/DataContext';

interface TableManagementScreenProps {
    onTableSelect: (table: Table) => void;
}

const TableManagementScreen: React.FC<TableManagementScreenProps> = ({ onTableSelect }) => {
  const { tables, orders } = useData();

  const handleStatusChange = (table: Table, newStatus: TableStatus) => {
    updateTable({ ...table, status: newStatus, orderId: newStatus === TableStatus.AVAILABLE ? undefined : table.orderId });
  };

  const getOrderForTable = (table: Table): Order | null => {
    if (table.status !== TableStatus.OCCUPIED || !table.orderId) return null;
    return orders.find(o => o.id === table.orderId) || null;
  };

  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) => a.number - b.number);
  }, [tables]);

  return (
    <div className="p-4 rounded-lg h-full overflow-y-auto">
        <h2 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Floor Plan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedTables.map(table => (
                <TableCard
                    key={table.id}
                    table={table}
                    order={getOrderForTable(table)}
                    onClick={() => onTableSelect(table)}
                    onStatusChange={handleStatusChange}
                />
            ))}
        </div>
    </div>
  );
};

export default TableManagementScreen;