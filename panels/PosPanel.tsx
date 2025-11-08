import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import TableManagementScreen from '../screens/TableManagementScreen';
import CompactOrderList from '../components/CompactOrderList';
import PosOrderView from '../components/PosOrderView';
import { useData } from '../context/DataContext';
import { Table, Order, OrderType, OrderStatus } from '../types';
import { useAuth, addOrder } from '../auth';

type PosTab = 'Dine-In' | 'Takeaway' | 'Delivery';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-semibold transition-colors
            ${isActive
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
    >
        {label}
    </button>
);

const PosPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PosTab>('Dine-In');
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { orders } = useData();
    const { currentUser } = useAuth();
    
    const activeOrderForTable = useMemo(() => {
        if (selectedTable && selectedTable.orderId) {
            return orders.find(o => o.id === selectedTable.orderId) || null;
        }
        return null;
    }, [selectedTable, orders]);
    
    const handleTableSelect = (table: Table) => {
        setSelectedOrder(null); // Clear order selection
        setSelectedTable(table);
    };

    const handleOrderSelect = (order: Order) => {
        setSelectedTable(null); // Clear table selection
        setSelectedOrder(order);
    };

    const handleCloseSidebar = () => {
        setSelectedTable(null);
        setSelectedOrder(null);
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Dine-In':
                return <TableManagementScreen onTableSelect={handleTableSelect} />;
            case 'Takeaway':
                return <CompactOrderList orders={orders} onOrderSelect={handleOrderSelect} type={OrderType.TAKEOUT} />;
            case 'Delivery':
                 return <CompactOrderList orders={orders} onOrderSelect={handleOrderSelect} type={OrderType.DELIVERY} />;
            default:
                return null;
        }
    };
    
    const createNewTakeawayOrder = () => {
        if (!currentUser) return;
        const tempId = `temp_${Date.now()}`;
        const newOrder: Order = {
            id: tempId,
            customerName: 'Takeaway Customer',
            items: [],
            total: 0,
            status: OrderStatus.PENDING,
            type: OrderType.TAKEOUT,
            paymentStatus: 'Unpaid',
            createdAt: new Date().toISOString(),
        };
        // This is a temporary client-side order for immediate editing
        handleOrderSelect(newOrder);
    }

    return (
        <div className="flex h-screen bg-gray-800 text-gray-200">
            <div className="flex flex-col flex-1 w-full">
                <Header />
                <main className="flex-1 flex overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="px-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                            <nav className="flex">
                                <TabButton label="Dine-In" isActive={activeTab === 'Dine-In'} onClick={() => setActiveTab('Dine-In')} />
                                <TabButton label="Takeaway" isActive={activeTab === 'Takeaway'} onClick={() => setActiveTab('Takeaway')} />
                                <TabButton label="Delivery" isActive={activeTab === 'Delivery'} onClick={() => setActiveTab('Delivery')} />
                            </nav>
                             <button onClick={createNewTakeawayOrder} className="px-4 py-2 my-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">New Takeaway</button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-800">
                           {renderContent()}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="w-[450px] border-l border-gray-700 shadow-lg flex-shrink-0 bg-gray-900">
                        <PosOrderView
                            table={selectedTable}
                            order={selectedOrder || activeOrderForTable}
                            onClose={handleCloseSidebar}
                            onOrderUpdate={handleCloseSidebar}
                        />
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default PosPanel;