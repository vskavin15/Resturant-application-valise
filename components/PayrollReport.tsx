import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Role } from '../types';

const PayrollReport: React.FC = () => {
    const { users, shifts } = useData();
    const staff = users.filter(u => u.role !== Role.ADMIN && u.role !== Role.CUSTOMER);

    const payrollData = useMemo(() => {
        return staff.map(s => {
            const staffShifts = shifts.filter(sh => sh.cashierId === s.id && sh.endTime);
            const hoursWorked = staffShifts.reduce((total, shift) => {
                const start = new Date(shift.startTime).getTime();
                const end = new Date(shift.endTime!).getTime();
                return total + (end - start) / (1000 * 60 * 60);
            }, 0);

            const totalPay = hoursWorked * (s.hourlyRate || 0);

            return {
                ...s,
                hoursWorked,
                totalPay
            };
        }).sort((a,b) => b.totalPay - a.totalPay);

    }, [staff, shifts]);

    return (
        <div className="w-full overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full whitespace-no-wrap">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                    <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                        <th className="px-4 py-3">Staff Member</th>
                        <th className="px-4 py-3 text-right">Hours Worked</th>
                        <th className="px-4 py-3 text-right">Hourly Rate</th>
                        <th className="px-4 py-3 text-right">Estimated Pay</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {payrollData.map(p => (
                        <tr key={p.id} className="text-gray-700 dark:text-gray-400">
                            <td className="px-4 py-3 font-semibold">{p.name}</td>
                            <td className="px-4 py-3 text-right">{p.hoursWorked.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">₹{p.hourlyRate?.toFixed(2) || 'N/A'}</td>
                            <td className="px-4 py-3 text-right font-bold">₹{p.totalPay.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollReport;
