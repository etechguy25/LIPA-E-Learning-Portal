import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { X, CreditCard, Landmark, Check, ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { PaymentTransaction } from '../../types';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, closePaymentModal, currentUser, tuitionStatement, makePayment, openReceiptModal } = useLms();

  const currentBalance = currentUser?.balanceOwed ?? tuitionStatement?.balanceDue ?? 0;
  const [paymentOption, setPaymentOption] = useState<'full' | 'minimum' | 'custom'>(
    currentBalance > 0 ? 'full' : 'custom'
  );
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['method']>('Credit Card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('412');
  const [accountNumber, setAccountNumber] = useState('••• ••• 4910');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTx, setSuccessTx] = useState<PaymentTransaction | null>(null);

  if (!isPaymentModalOpen) return null;

  const computedAmount =
    paymentOption === 'full'
      ? currentBalance
      : paymentOption === 'minimum'
      ? Math.min(500, currentBalance)
      : parseFloat(customAmount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (computedAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newTx = makePayment(
        computedAmount,
        paymentMethod,
        `Tuition Payment via ${paymentMethod} (${paymentOption === 'full' ? 'Full Balance Settlement' : 'Partial Remittance'})`
      );
      setSuccessTx(newTx);
    }, 1200);
  };

  const handleFinishAndOpenReceipt = () => {
    if (successTx) {
      const tx = successTx;
      setSuccessTx(null);
      closePaymentModal();
      openReceiptModal(tx);
    } else {
      closePaymentModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        id="payment-modal-box"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-red-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bursar Payment Gateway</h3>
              <p className="text-xs text-slate-500">256-Bit TLS Encrypted Transaction</p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {successTx ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Payment Processed Successfully</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your payment of <span className="font-semibold text-slate-800">${(successTx.amount || 0).toLocaleString()}</span> has been applied to your student account.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{successTx.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="text-slate-700 truncate max-w-[200px]">{successTx.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{successTx.date}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleFinishAndOpenReceipt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center"
              >
                View Official Receipt
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
              <button
                type="button"
                onClick={closePaymentModal}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Amount to Pay
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === 'full'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 block uppercase">Full Balance</span>
                  <span className="text-sm font-bold mt-0.5 block">${(currentBalance || 0).toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('minimum')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === 'minimum'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 block uppercase">Min. Installment</span>
                  <span className="text-sm font-bold mt-0.5 block">${(Math.min(500, currentBalance) || 0).toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('custom')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === 'custom'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 block uppercase">Custom</span>
                  <span className="text-sm font-bold mt-0.5 block">Other Amt</span>
                </button>
              </div>

              {paymentOption === 'custom' && (
                <div className="mt-3">
                  <div className="relative rounded-lg shadow-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      min="1"
                      max={currentBalance > 0 ? currentBalance : undefined}
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'border-slate-900 bg-slate-900 text-white font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all ${
                    paymentMethod === 'Bank Transfer'
                      ? 'border-slate-900 bg-slate-900 text-white font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>ACH Direct Wire</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'Credit Card' ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">Security Code (CVV)</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Routing Transit Number (9 digits)</label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={e => setRoutingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center text-[11px] text-slate-500 space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PCI-DSS Level 1 Compliant. No card credentials stored in plain-text.</span>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || computedAmount <= 0}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Remittance...</span>
                  </>
                ) : (
                  <span>
                    Pay ${(computedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} Now
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
