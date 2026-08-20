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
    if (!status) return 0;
    const s = String(status).trim().toUpperCase().replace(/_/g, ' ');
    switch (s) {
      case 'ORDER PLACED':
      case 'PLACED':
      case 'PENDING':
        return 0;
      case 'ADVANCE PAYMENT CONFIRMED':
      case 'ADVANCE PAID':
        return 1;
      case 'ORDER CONFIRMED':
      case 'CONFIRMED':
      case 'PAYMENT CONFIRMED':
        return 2;
      case 'PREPARING':
      case 'PREPARING BOX':
        return 3;
      case 'PACKED':
        return 4;
      case 'SHIPPED':
        return 5;
      case 'OUT FOR DELIVERY':
        return 6;
      case 'DELIVERED':
        return 7;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const normalizedStatus = (currentStatus || '').trim().toUpperCase();
  const isCancelled = normalizedStatus === 'CANCELLED' || normalizedStatus === 'CANCELED';

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
        {trackingHistory && trackingHistory.length > 0 ? (
          trackingHistory.map((history, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-pink-400" />
              <h5 className="text-sm font-bold text-white">{history.status}</h5>
              <p className="text-xs text-slate-400">{history.comment}</p>
              <span className="text-[10px] text-slate-500">{new Date(history.timestamp).toLocaleString()}</span>
            </div>
          ))
        ) : (
          steps.map((step, idx) => {
            const isDone = idx <= currentIndex;
            return (
              <div key={step.key} className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isDone ? 'bg-purple-600 border-pink-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-pink-400' : 'bg-slate-600'}`} />
                </div>
                <h5 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>{step.label}</h5>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
