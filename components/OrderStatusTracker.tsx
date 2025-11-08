import React, { useMemo } from 'react';
import { OrderStatus, OrderType } from '../types';
import { CheckIcon } from './Icons';

interface OrderStatusTrackerProps {
    status: OrderStatus;
    type: OrderType;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status, type }) => {
    const steps = useMemo(() => {
        const baseSteps = [
            { status: OrderStatus.AWAITING_ACCEPTANCE, label: 'Confirmed' },
            { status: OrderStatus.PREPARING, label: 'Preparing' },
            { status: OrderStatus.READY, label: 'Ready' },
            { status: OrderStatus.OUT_FOR_DELIVERY, label: 'On its way' },
            { status: OrderStatus.DELIVERED, label: 'Delivered' },
        ];
        
        if (type === OrderType.TAKEOUT) {
            const takeawaySteps = baseSteps.filter(step => step.status !== OrderStatus.OUT_FOR_DELIVERY);
            // Customize labels for Takeaway
            takeawaySteps.forEach(step => {
                if (step.status === OrderStatus.READY) step.label = 'Ready for Pickup';
                if (step.status === OrderStatus.DELIVERED) step.label = 'Completed';
            });
            return takeawaySteps;
        }
        
        if (type === OrderType.DINE_IN) {
             const dineInSteps = baseSteps.filter(step => step.status !== OrderStatus.OUT_FOR_DELIVERY);
             dineInSteps.forEach(step => {
                if (step.status === OrderStatus.READY) step.label = 'Ready to Serve';
                if (step.status === OrderStatus.DELIVERED) step.label = 'Completed';
             });
             return dineInSteps;
        }
        
        // Default for Delivery
        baseSteps.forEach(step => {
            if (step.status === OrderStatus.READY) step.label = 'Packed & Ready';
        });
        return baseSteps;

    }, [type]);

    const getStatusIndex = (s: OrderStatus) => {
        if (s === OrderStatus.PENDING) return -1;
        if (s === OrderStatus.CANCELLED) return -2;
        const index = steps.findIndex(step => step.status === s);
        return index;
    };
    
    const currentStatusIndex = getStatusIndex(status);

    if (status === OrderStatus.CANCELLED) {
        return (
            <div className="p-3 bg-red-900/50 rounded-lg text-center">
                <p className="font-semibold text-red-300">Order Cancelled</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = currentStatusIndex >= index;
                    const isCurrent = currentStatusIndex === index;

                    return (
                        <React.Fragment key={step.status}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isCompleted 
                                    ? 'bg-amber-600 border-amber-600 text-white' 
                                    : 'bg-gray-800 border-gray-600'
                                }`}>
                                    {isCompleted ? <CheckIcon className="w-5 h-5"/> : <div className="w-2.5 h-2.5 bg-gray-600 rounded-full"></div>}
                                </div>
                                <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${
                                    isCurrent ? 'text-amber-400' : isCompleted ? 'text-gray-200' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 transition-colors duration-500 mx-2 ${currentStatusIndex > index ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusTracker;