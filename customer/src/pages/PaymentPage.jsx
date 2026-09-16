import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Copy,
  Upload,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const orderIdParam = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [upiId, setUpiId] = useState('david468468@airtel');
  const [upiName, setUpiName] = useState('Sagariya David S');
  const [amountToPay, setAmountToPay] = useState(0);
  const [copied, setCopied] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [screenshotSubmitted, setScreenshotSubmitted] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchPaymentDetails = async (showLoader = false) => {
    if (!orderIdParam) {
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    try {
      const { data } = await API.get(`/payments/order/${orderIdParam}`);
      if (data && data.success) {
        setOrderData(data.order);
        setPaymentData(data.payment);
        if (data.upiId) setUpiId(data.upiId);
        if (data.upiName) setUpiName(data.upiName);
        if (data.amountToPay) setAmountToPay(data.amountToPay);

        const currentStatus = data.status || data.order?.orderStatus || 'PENDING';
        if (currentStatus === 'SCREENSHOT_SUBMITTED' || currentStatus === 'PAYMENT_VERIFICATION') {
          setScreenshotSubmitted(true);
        }
      }
    } catch (err) {
      console.error('[Fetch Payment Details Error]', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails(true);
  }, [orderIdParam]);

  // Status Polling when awaiting verification
  useEffect(() => {
    const currentStatus = paymentData?.status || orderData?.orderStatus;
    if (screenshotSubmitted || currentStatus === 'SCREENSHOT_SUBMITTED' || currentStatus === 'PAYMENT_VERIFICATION') {
      const interval = setInterval(() => {
        fetchPaymentDetails(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [screenshotSubmitted, paymentData, orderData]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    addToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('File size exceeds 10MB limit. Please select a smaller screenshot.', 'error');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!previewUrl) {
      addToast('Please select a payment screenshot image first', 'error');
      return;
    }

    setUploading(true);
    try {
      const { data } = await API.post('/payments/upload-screenshot', {
        orderId: orderIdParam || orderData?.orderNumber || orderData?.orderId,
        screenshot: previewUrl
      });

      if (data && data.success) {
        addToast('🎉 Payment screenshot submitted! Pending Admin approval.');
        setScreenshotSubmitted(true);
        fetchPaymentDetails(false);
      } else {
        throw new Error(data?.message || 'Screenshot submission failed');
      }
    } catch (err) {
      console.error('[Upload Screenshot Error]', err);
      addToast(err.response?.data?.message || err.message || 'Failed to submit screenshot', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="font-bold text-sm">Loading payment details...</span>
        </div>
      </div>
    );
  }

  const orderIdDisplay = orderIdParam || orderData?.orderNumber || orderData?.orderId || 'N/A';
  const currentStatus = paymentData?.status || orderData?.orderStatus || 'PENDING';
  const isVerified = currentStatus === 'ORDER_CONFIRMED' || currentStatus === 'CONFIRMED' || currentStatus === 'PAYMENT_COMPLETED';
  const isRejected = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';
  const isPendingVerification = screenshotSubmitted || currentStatus === 'SCREENSHOT_SUBMITTED' || currentStatus === 'PAYMENT_VERIFICATION';

  // Construct Dynamic UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountToPay}&tr=${encodeURIComponent(orderIdDisplay)}&tn=Order%20${encodeURIComponent(orderIdDisplay)}&cu=INR`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 space-y-8 text-center">

        {/* STATE 1: ORDER CONFIRMED & VERIFIED */}
        {isVerified ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5 mx-auto">
              <ShieldCheck className="w-4 h-4" /> Payment Approved & Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Payment Confirmed! 🎉
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your payment of <strong className="text-emerald-400 font-bold">₹{amountToPay}</strong> has been verified by the admin team. Your order is officially confirmed!
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 max-w-md mx-auto space-y-2 text-left text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Order Number:</span>
                <span className="font-mono font-bold text-pink-400">#{orderIdDisplay}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Method:</span>
                <span className="font-bold text-white">Manual UPI</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Status:</span>
                <span>ORDER CONFIRMED</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate(`/order-success/${orderIdDisplay}`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2"
              >
                View Order Bill & Invoice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isRejected ? (
          /* STATE 2: REJECTED */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest">
                Payment Verification Rejected
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                Order Payment Couldn't Be Verified
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                Your uploaded payment details could not be matched by our admin team.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 max-w-md mx-auto text-left text-xs space-y-2">
              <span className="font-bold text-rose-400 block">Need Help?</span>
              <p className="text-slate-400 text-[11px]">
                Please check your banking app transaction receipt and re-upload a clear screenshot or contact support via WhatsApp.
              </p>
            </div>

            <button
              onClick={() => { setScreenshotSubmitted(false); setPreviewUrl(''); setSelectedFile(null); }}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs uppercase hover:bg-purple-700 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Re-upload Payment Screenshot
            </button>
          </div>
        ) : isPendingVerification ? (
          /* STATE 3: SCREENSHOT SUBMITTED - PENDING ADMIN APPROVAL */
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mx-auto shadow-xl shadow-amber-500/20">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto">
                <Clock className="w-4 h-4" /> Pending Verification
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                Screenshot Submitted!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                We have received your payment screenshot for Order <strong className="text-pink-400 font-mono">#{orderIdDisplay}</strong>. Our admin team will verify it shortly.
              </p>
            </div>

            {/* Uploaded Screenshot Thumbnail */}
            {(previewUrl || paymentData?.screenshotUrl) && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-purple-500/30 max-w-sm mx-auto space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">Submitted Payment Proof</span>
                <img
                  src={previewUrl || paymentData?.screenshotUrl}
                  alt="Payment Screenshot"
                  className="max-h-48 rounded-xl object-contain mx-auto border border-purple-500/20"
                />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-slate-400 max-w-md mx-auto space-y-1">
              <p className="font-semibold text-purple-300 flex items-center justify-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-checking status...
              </p>
              <p className="text-[11px]">
                Status will update automatically once approved by admin. You can keep this page open or check My Orders.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => fetchPaymentDetails(true)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Re-check Status Now
              </button>
              <button
                onClick={() => navigate('/my-orders')}
                className="px-6 py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                Go to My Orders
              </button>
            </div>
          </div>
        ) : (
          /* STATE 4: SCAN QR & UPLOAD SCREENSHOT */
          <div className="space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 w-fit mx-auto">
                <QrCode className="w-4 h-4" /> Manual UPI Payment
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                💳 Complete Your Payment
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Scan the dynamic QR code below using GPay, PhonePe, Paytm, or any supported UPI app.
              </p>
            </div>

            {/* Order & Amount Box */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-left min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block uppercase truncate">Payment Ref</span>
                <span className="text-xs sm:text-sm font-black font-mono text-pink-400 truncate block">#{orderIdDisplay}</span>
              </div>
              <div className="text-right min-w-0">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block uppercase truncate">Amount to Pay</span>
                <span className="text-base sm:text-xl font-black text-emerald-400 font-display truncate block">₹{amountToPay}</span>
              </div>
            </div>

            {/* DYNAMIC QR CODE DISPLAY */}
            <div className="p-3.5 sm:p-6 rounded-3xl bg-white text-slate-950 w-full max-w-[250px] sm:max-w-xs mx-auto space-y-2.5 sm:space-y-4 shadow-2xl shadow-purple-500/20 border-4 border-pink-500/50">
              <div className="flex justify-center p-1.5 bg-white rounded-2xl overflow-hidden">
                <QRCodeSVG
                  value={upiUri}
                  size={190}
                  className="w-full max-w-[150px] sm:max-w-[190px] h-auto mx-auto"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center pt-1 border-t border-slate-200">
                <span className="text-[10px] sm:text-[11px] font-black text-purple-900 uppercase tracking-wider block truncate">Scan with GPay / UPI App</span>
                <span className="text-[10px] text-slate-600 font-semibold block truncate">Payee: {upiName}</span>
              </div>
            </div>

            {/* Pre-filled Amount Notification Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 max-w-md mx-auto text-xs text-emerald-200 space-y-1 text-left">
              <div className="flex items-center gap-2 font-black text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Automatic Amount Pre-filled
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Payment amount <strong className="text-emerald-400 font-bold">₹{amountToPay}</strong> is automatically encoded in the QR code.
              </p>
            </div>

            {/* UPI ID Details & Copy Box */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto flex items-center justify-between gap-2 sm:gap-3 text-left min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Official Admin UPI ID</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate block">{upiId}</span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-xs flex items-center gap-1 shrink-0 transition-all border border-purple-500/30"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* UPLOAD PAYMENT SCREENSHOT SECTION */}
            <div className="pt-6 border-t border-slate-800 space-y-4 max-w-md mx-auto text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Upload Payment Screenshot
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase text-amber-400">Required</span>
              </div>

              {/* Upload Drop Zone / Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-input"
                />
                <label
                  htmlFor="screenshot-input"
                  className="w-full p-5 sm:p-6 border-2 border-dashed border-purple-500/40 hover:border-pink-500 rounded-2xl bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 text-center"
                >
                  <Upload className="w-8 h-8 text-pink-400" />
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[240px]">
                    {selectedFile ? selectedFile.name : 'Click to select payment screenshot'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Preview Screenshot</span>
                    <button
                      onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                      className="text-pink-400 font-bold hover:underline text-[11px]"
                    >
                      Change
                    </button>
                  </div>
                  <img src={previewUrl} alt="Preview" className="max-h-60 rounded-xl object-contain mx-auto border border-purple-500/30" />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleUploadScreenshot}
                disabled={uploading || !previewUrl}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-pink-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Screenshot...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Submit Payment Screenshot →
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
