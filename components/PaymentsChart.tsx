import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PAYMENTS_DATA } from '../constants';

const PaymentsChart: React.FC = () => {
    const totalRevenue = PAYMENTS_DATA.reduce((acc, day) => acc + day.Card + day.Mobile + day.Cash + day.Tips, 0);
    const totalTips = PAYMENTS_DATA.reduce((acc, day) => acc + day.Tips, 0);
    const cardTotal = PAYMENTS_DATA.reduce((acc, day) => acc + day.Card, 0);
    const mobileTotal = PAYMENTS_DATA.reduce((acc, day) => acc + day.Mobile, 0);
    const cashTotal = PAYMENTS_DATA.reduce((acc, day) => acc + day.Cash, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={PAYMENTS_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                borderColor: 'rgba(55, 65, 81, 1)',
                                color: '#d1d5db',
                                borderRadius: '0.75rem',
                            }}
                        />
                        <Legend wrapperStyle={{color: '#9ca3af'}} />
                        <Bar dataKey="Card" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Mobile" stackId="a" fill="#84cc16" />
                        <Bar dataKey="Cash" stackId="a" fill="#f97316" />
                        <Bar dataKey="Tips" fill="#f59e0b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-100">Weekly Summary</h3>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Revenue</span>
                        <span className="font-bold text-gray-100">₹{totalRevenue.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400">Total Tips</span>
                        <span className="font-bold text-gray-100">₹{totalTips.toLocaleString()}</span>
                    </div>
                </div>
                 <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-200 mb-2">By Payment Method</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 flex items-center"><span className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></span>Card</span>
                            <span className="font-medium text-gray-200">₹{cardTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 flex items-center"><span className="w-3 h-3 rounded-full bg-[#84cc16] mr-2"></span>Mobile Wallet</span>
                            <span className="font-medium text-gray-200">₹{mobileTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 flex items-center"><span className="w-3 h-3 rounded-full bg-[#f97316] mr-2"></span>Cash</span>
                            <span className="font-medium text-gray-200">₹{cashTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsChart;