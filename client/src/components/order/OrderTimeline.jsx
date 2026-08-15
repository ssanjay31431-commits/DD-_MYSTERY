import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, Gift, Check, ShieldAlert, CreditCard } from 'lucide-react';

export const OrderTimeline = ({ currentStatus, trackingHistory = [] }) => {
  const steps = [
    { key: 'Order Placed', label: 'Order Placed', icon: Clock },
    { key: 'Advance Payment Confirmed', label: 'Advance Paid', icon: CreditCard },
    { key: 'Order Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'Preparing', label: 'Preparing Box', icon: Gift },
    { key: 'Packed', label: 'Packed', icon: PackageCheck },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Advance Payment Confirmed': return 1;
      case 'Order Confirmed': case 'Confirmed': return 2;
      case 'Preparing': return 3;
      case 'Packed': return 4;
      case 'Shipped': return 5;
      case 'Out for Delivery': return 6;
      case 'Delivered': return 7;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center my-4">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <h4 className="text-lg font-bold text-rose-200">Order Cancelled</h4>
        <p className="text-xs text-rose-300/80 mt-1">This order was cancelled. Advance refund will be processed if payment was deducted.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      {/* Desktop Step Bar */}
      <div className="hidden md:flex items-center justify-between relative max-w-4xl mx-auto">
        
        {/* Connector Line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 z-0">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-purple-600 border-pink-400 text-white shadow-lg shadow-purple-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                } ${isCurrent ? 'ring-4 ring-pink-500/30 scale-110' : ''}`}
              >
                {isDone ? <Check className="w-5 h-5 font-bold" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span
                className={`mt-3 text-[11px] font-bold transition-colors text-center max-w-[70px] leading-tight ${
                  isDone ? 'text-white' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden space-y-4 relative border-l-2 border-purple-500/30 ml-4 pl-6">
        {trackingHistory.map((history, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-pink-400" />
            <h5 className="text-sm font-bold text-white">{history.status}</h5>
            <p className="text-xs text-slate-400">{history.comment}</p>
            <span className="text-[10px] text-slate-500">{new Date(history.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
