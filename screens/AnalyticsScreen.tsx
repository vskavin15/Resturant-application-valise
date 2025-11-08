import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { SALES_DATA, ORDER_TYPE_DATA } from '../constants';
import PaymentsChart from '../components/PaymentsChart';
import StaffPerformanceReport from '../components/StaffPerformanceReport';
import InventoryBurnReport from '../components/InventoryBurnReport';
import { CreditCardIcon, UsersGroupIcon, TrendingUpIcon, CalculatorIcon } from '../components/Icons';
import { useData } from '../context/DataContext';
import ProfitMarginReport from '../components/ProfitMarginReport';
import PayrollReport from '../components/PayrollReport';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6'];

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold text-lg">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#9ca3af">{`Orders: ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#6b7280">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

const AnalyticsScreen: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { orders } = useData();
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const filteredOrders = useMemo(() => {
        if (!startDate || !endDate) return orders;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // include the whole end day
        return orders.filter(o => {
            const orderDate = new Date(o.createdAt).getTime();
            return orderDate >= start && orderDate <= end;
        });
    }, [orders, startDate, endDate]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    // Note: The mock charts are not updated with filtered data for simplicity.
    // A real implementation would re-calculate chart data based on `filteredOrders`.

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Analytics & Reports</h1>
        <div className="flex items-center gap-4">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-200"/>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-lg bg-gray-700 border-gray-600 text-gray-200"/>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Sales Chart */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Weekly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12}/>
              <YAxis stroke="#9ca3af" fontSize={12}/>
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    borderColor: 'rgba(55, 65, 81, 1)',
                    color: '#d1d5db',
                    borderRadius: '0.75rem',
                }}
              />
              <Legend wrapperStyle={{color: '#9ca3af'}} />
              <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Types Chart */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Order Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={ORDER_TYPE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="#f59e0b"
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {ORDER_TYPE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-200">Financial Overview & Payments</h2>
          </div>
          <PaymentsChart />
      </div>

      {/* New Reports */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-green-500/10 rounded-lg">
                    <UsersGroupIcon className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Staff Performance</h2>
            </div>
            <StaffPerformanceReport orders={filteredOrders} />
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <TrendingUpIcon className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Inventory Burn Report</h2>
            </div>
            <InventoryBurnReport orders={filteredOrders} />
        </div>
      </div>
      
       <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-purple-500/10 rounded-lg">
                    <TrendingUpIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Profit Margin Report</h2>
            </div>
            <ProfitMarginReport orders={filteredOrders} />
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CalculatorIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-200">Payroll Report</h2>
            </div>
            <PayrollReport />
        </div>
      </div>

    </div>
  );
};

export default AnalyticsScreen;