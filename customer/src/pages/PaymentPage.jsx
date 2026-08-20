import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Upload, CheckCircle2, Clock, Copy, ShieldCheck, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const orderIdParam = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);

  useEffect(() => {
    // Check if there is a pending checkout in sessionStorage (order not saved in MongoDB yet)
    const storedPendingStr = sessionStorage.getItem('dd_pending_checkout');
    if (storedPendingStr) {
      try {
        const parsed = JSON.parse(storedPendingStr);
        if (parsed && parsed.items && parsed.deliveryAddress) {
          setPendingCheckout(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing pending checkout', e);
      }
    }

    if (!orderIdParam) {
      setLoading(false);
      return;
    }

    fetchPaymentDetails();

    // Auto-polling for real-time status update every 4 seconds
    const interval = setInterval(() => {
      fetchPaymentDetails();
    }, 4000);

    return () => clearInterval(interval);
  }, [orderIdParam]);

  const fetchPaymentDetails = async () => {
    if (!orderIdParam) return;
    try {
      const { data } = await API.get(`/payments/order/${orderIdParam}`);
      if (data && data.success) {
        setPaymentDetails(data);
        if (data.screenshotUrl) {
          setPreviewUrl(data.screenshotUrl);
        }
      }
    } catch (err) {
      console.error('[Fetch Payment Details Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = () => {
    const targetUpi = paymentDetails?.upiId || 'david468468@airtel';
    navigator.clipboard.writeText(targetUpi);
    setCopied(true);
    addToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be under 10MB', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadScreenshot = async () => {
    if (!previewUrl) {
      addToast('Please select a payment screenshot image first', 'error');
      return;
    }

    setUploading(true);

    try {
      const payload = {
        screenshotUrl: previewUrl
      };

      if (pendingCheckout) {
        payload.pendingCheckout = pendingCheckout;
      } else {
        payload.orderId = paymentDetails?.orderId || orderIdParam;
      }

      const { data } = await API.post('/payments/upload-screenshot', payload);

      if (data && data.success) {
        sessionStorage.removeItem('dd_pending_checkout');
        setPendingCheckout(null);
        
        addToast('🎉 Payment screenshot submitted! Our team will verify it shortly.');
        
        setPaymentDetails({
          orderId: data.orderId,
          orderMongoId: data.orderMongoId,
          amount: data.amount,
          paymentStatus: 'PAYMENT_VERIFICATION',
          orderStatus: 'PAYMENT_VERIFICATION',
          screenshotUrl: previewUrl
        });

        if (data.orderId) {
          navigate(`/payment?order_id=${data.orderId}`, { replace: true });
        }
      } else {
        addToast(data?.message || 'Screenshot upload failed', 'error');
      }
    } catch (err) {
      console.error('[Upload Screenshot Error]', err);
      addToast(err.response?.data?.message || 'Failed to submit payment screenshot', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="font-bold text-sm">Loading payment QR details...</span>
        </div>
      </div>
    );
  }

  const amountToPay = pendingCheckout?.totalAmount || paymentDetails?.amount || 499;
  const upiId = paymentDetails?.upiId || 'david468468@airtel';
  const upiName = paymentDetails?.upiName || 'Sagariya David S';
  const orderIdDisplay = paymentDetails?.orderId || (pendingCheckout ? 'NEW_ORDER' : orderIdParam || 'DM1001');
  const upiUri = paymentDetails?.upiUri || `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amountToPay}&cu=INR&tn=${orderIdDisplay}`;
  
  const status = paymentDetails?.paymentStatus || paymentDetails?.orderStatus || (pendingCheckout ? 'PENDING_PAYMENT' : 'PENDING_PAYMENT');

  const isVerified = status === 'PAYMENT_COMPLETED' || status === 'ORDER_CONFIRMED' || status === 'CONFIRMED';
  const isPendingVerification = status === 'SCREENSHOT_SUBMITTED' || status === 'PAYMENT_VERIFICATION';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="glass-panel p-5 sm:p-10 rounded-3xl border border-purple-500/30 space-y-6 sm:space-y-8 text-center">
        
        {/* Header section based on status */}
        {isVerified ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              ✅ Confirmed Your Order
            </h1>
            <p className="text-sm text-emerald-400 font-semibold max-w-md mx-auto">
              Your payment of ₹{amountToPay} has been verified successfully. Your DD Mystery Box order is now confirmed!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate(`/order/${paymentDetails?.orderMongoId || orderIdDisplay}`)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
              >
                View Order Details <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/my-orders')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700"
              >
                My Orders
              </button>
            </div>
          </div>
        ) : isPendingVerification ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mx-auto shadow-xl shadow-amber-500/20 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                Verification in Progress
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-2">
                ⏳ Payment Verification is Going On...
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                "Your payment screenshot has been submitted. Our team is verifying your payment."
              </p>
            </div>

            {/* Display submitted screenshot preview */}
            {previewUrl && (
              <div className="max-w-xs mx-auto p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Uploaded Payment Screenshot</span>
                <img src={previewUrl} alt="Payment Screenshot" className="max-h-60 rounded-xl object-contain mx-auto border border-purple-500/30" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-slate-400 max-w-md mx-auto">
              💡 Status will update automatically once verified by our admin team. No need to refresh the page.
            </div>
          </div>
        ) : (
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
                <span className="text-xs sm:text-sm font-black font-mono text-pink-400 truncate block">{orderIdDisplay}</span>
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
                Payment amount <strong className="text-emerald-400 font-bold">₹{amountToPay}</strong> is already included in the QR code. You do not need to type the amount manually.
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
                <span className="text-[10px] text-slate-400">Required</span>
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
