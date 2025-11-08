import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import path.
import { Table, TableStatus, Order } from '../types';
import { CheckIcon, SparklesIcon, UserCircleIcon, ClockIcon } from './Icons';

interface TableCardProps {
  table: Table;
  order: Order | null;
  onClick: () => void;
  onStatusChange: (table: Table, newStatus: TableStatus) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, order, onClick, onStatusChange }) => {
  const statusConfig = useMemo(() => {
    switch (table.status) {
      case TableStatus.AVAILABLE:
        return {
          bg: 'bg-gray-800',
          text: 'text-green-400',
          border: 'border-green-500',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case TableStatus.OCCUPIED:
        return {
          bg: 'bg-gray-800',
          text: 'text-amber-400',
          border: 'border-amber-500',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      case TableStatus.NEEDS_CLEANING:
        return {
          bg: 'bg-gray-800',
          text: 'text-blue-400',
          border: 'border-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case TableStatus.RESERVED:
         return {
          bg: 'bg-gray-800',
          text: 'text-indigo-400',
          border: 'border-indigo-500',
          button: 'bg-indigo-600 hover:bg-indigo-700'
        };
      default:
        return {
          bg: 'bg-gray-800',
          text: 'text-gray-400',
          border: 'border-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  }, [table.status]);

  const buttonText = table.status === TableStatus.AVAILABLE ? 'New Order' : 'View';

  return (
    <div
      className={`rounded-xl shadow-md transition-all duration-300 ${statusConfig.bg} border-2 ${statusConfig.border} flex flex-col justify-between aspect-[4/5] p-3 cursor-pointer hover:shadow-lg hover:-translate-y-1`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
          <span className="text-5xl font-extrabold text-gray-300">{table.number}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-black/20 ${statusConfig.text}`}>
                {table.status}
            </span>
      </div>
      
      <div className="text-center my-2">
        {table.status === TableStatus.OCCUPIED && order ? (
            <div>
                <p className="text-gray-400 text-xs">Order #{order.id.split('_')[1]}</p>
                <p className="font-bold text-2xl text-white">₹{order.total.toFixed(2)}</p>
            </div>
        ) : table.status === TableStatus.NEEDS_CLEANING ? (
            <SparklesIcon className={`w-10 h-10 mx-auto ${statusConfig.text}`} />
        ) : table.status === TableStatus.RESERVED ? (
            <ClockIcon className={`w-10 h-10 mx-auto ${statusConfig.text}`} />
        ) : (
            <div className="h-14"></div>
        )}
      </div>

      <div className="mt-2">
        {table.status === TableStatus.NEEDS_CLEANING ? (
             <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(table, TableStatus.AVAILABLE); }}
                className={`w-full py-2 text-sm font-semibold text-white ${statusConfig.button} rounded-md transition-colors`}
            >
                Mark as Clean
            </button>
        ) : (
            <div className={`w-full py-2 text-sm font-semibold text-white ${statusConfig.button} rounded-md transition-colors text-center`}>
                {buttonText}
            </div>
        )}
      </div>

    </div>
  );
};

export default TableCard;