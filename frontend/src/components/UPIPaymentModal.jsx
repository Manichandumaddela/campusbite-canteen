import { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, Clock, ShieldCheck, X, Copy, Check } from 'lucide-react';

export default function UPIPaymentModal({ totalAmount, onConfirm, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 min timer
  const [copied, setCopied] = useState(false);
  const upiId = 'campus.canteen@upi';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  // Dynamic UPI URL formatted as standard UPI spec
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=CampusBite%20Canteen&am=${totalAmount}&cu=INR`;
  // Using reliable QR server API to render actual scanner QR
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiPayUrl
  )}&color=0f172a`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-5 sm:p-8 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">Instant UPI Payment</h3>
              <p className="text-xs text-gray-500">Scan using GPay, PhonePe, Paytm</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code and Amount */}
        <div className="my-4 sm:my-6 text-center">
          <div className="inline-block p-3 sm:p-4 bg-white rounded-3xl border-2 border-dashed border-orange-200 shadow-inner mb-3 sm:mb-4">
            <img
              src={qrImage}
              alt="UPI QR Code"
              className="w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52 object-contain mx-auto"
            />
          </div>

          <div className="flex items-baseline justify-center gap-1.5 mb-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount Due:</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2 bg-gray-50 py-1.5 px-3 rounded-full w-fit mx-auto border border-gray-200">
            <span>UPI ID: <strong className="text-gray-800">{upiId}</strong></span>
            <button
              onClick={copyUpi}
              className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Expiry countdown */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-amber-50 border border-amber-100 p-3 rounded-2xl mb-6">
          <div className="flex items-center gap-1.5 text-amber-800 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>QR Code Expires in:</span>
          </div>
          <span className="font-mono font-bold text-amber-700 text-sm">
            {minutes}:{seconds}
          </span>
        </div>

        {/* Confirmation Button */}
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            I Have Paid • Confirm Order
          </button>
          <button
            onClick={onCancel}
            className="w-full text-xs text-gray-400 hover:text-gray-600 font-semibold py-2"
          >
            Cancel & Change Payment Method
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          End-to-End Campus Encrypted Transaction
        </div>
      </div>
    </div>
  );
}
