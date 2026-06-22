import React, { useState, useEffect, useRef } from 'react';
import {
  FiX, FiSmartphone, FiCreditCard, FiCheckCircle, FiAlertCircle,
  FiLock, FiArrowLeft, FiLoader, FiShield
} from 'react-icons/fi';

/* ── helpers ─────────────────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const formatCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) =>
  v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

/* ── OTP input ───────────────────────────────────── */
const OtpInput = ({ value, onChange }) => {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handle = (i, e) => {
    const d = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join(''));
    if (d && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          value={digits[i]}
          onChange={(e) => handle(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          maxLength={1}
          className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white text-slate-800"
        />
      ))}
    </div>
  );
};

/* ── main modal ──────────────────────────────────── */
const PLAN = { name: 'Pro', price: '₹999', period: 'month' };

const PaymentModal = ({ isOpen, onClose }) => {
  /* steps: select | upi-enter | upi-pending | card-form | otp | result */
  const [step, setStep] = useState('select');
  const [method, setMethod] = useState(null); // 'upi' | 'credit' | 'debit'
  const [result, setResult] = useState(null); // 'success' | 'failed'

  /* UPI */
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  /* Card */
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  /* OTP */
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);

  /* loading */
  const [busy, setBusy] = useState(false);
  const [dots, setDots] = useState('');

  /* animated dots for UPI pending */
  useEffect(() => {
    if (step !== 'upi-pending') return;
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(t);
  }, [step]);

  /* OTP countdown */
  useEffect(() => {
    if (step !== 'otp') return;
    setOtpTimer(30);
    const t = setInterval(() => setOtpTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const reset = () => {
    setStep('select'); setMethod(null); setResult(null);
    setUpiId(''); setUpiError('');
    setCardNumber(''); setExpiry(''); setCvv(''); setCardName(''); setCardError('');
    setOtp(''); setOtpError('');
    setBusy(false);
  };

  const handleClose = () => { reset(); onClose(); };

  /* ── UPI flow ─── */
  const sendUpiRequest = async () => {
    if (!upiId.includes('@')) { setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiError('');
    setStep('upi-pending');
    await sleep(4000); // simulate waiting for approval
    // randomly 70% success
    const ok = Math.random() < 0.7;
    setResult(ok ? 'success' : 'failed');
    setStep('result');
  };

  /* ── Card flow ─── */
  const submitCard = async () => {
    if (cardNumber.replace(/\s/g, '').length < 16) { setCardError('Enter a valid 16-digit card number'); return; }
    if (!expiry || expiry.length < 5) { setCardError('Enter a valid expiry date'); return; }
    if (cvv.length < 3) { setCardError('Enter a valid CVV'); return; }
    if (!cardName.trim()) { setCardError('Enter the cardholder name'); return; }
    setCardError('');
    setBusy(true);
    await sleep(1500);
    setBusy(false);
    setStep('otp');
  };

  const submitOtp = async () => {
    if (otp.length < 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpError('');
    setBusy(true);
    await sleep(2000);
    setBusy(false);
    const ok = otp === '123456' || Math.random() < 0.7;
    setResult(ok ? 'success' : 'failed');
    setStep('result');
  };

  if (!isOpen) return null;

  /* ── Shared header ─── */
  const Header = ({ title, back }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={back} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500">
            <FiArrowLeft size={16} />
          </button>
        )}
        <div>
          <h3 className="text-base font-black text-slate-800">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">FreelanceFlow Pro · ₹999/month</p>
        </div>
      </div>
      <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400">
        <FiX size={18} />
      </button>
    </div>
  );

  /* ── Order summary strip ─── */
  const OrderSummary = () => (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 mb-5">
      <div>
        <p className="text-xs font-bold text-indigo-700">FreelanceFlow Pro</p>
        <p className="text-[10px] text-indigo-400">Unlimited clients · PDF invoices · Analytics</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-indigo-700">₹999</p>
        <p className="text-[10px] text-indigo-400">per month</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in">
        {/* top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#4f46e5,#a855f7)' }} />

        <div className="p-6">

          {/* ══════════ SELECT METHOD ══════════ */}
          {step === 'select' && (
            <>
              <Header title="Choose Payment Method" />
              <OrderSummary />

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pay via</p>
              <div className="space-y-3">
                {[
                  { id: 'upi',    icon: '🏦', label: 'UPI',         sub: 'GPay, PhonePe, Paytm, BHIM' },
                  { id: 'credit', icon: '💳', label: 'Credit Card', sub: 'Visa, Mastercard, RuPay' },
                  { id: 'debit',  icon: '🏧', label: 'Debit Card',  sub: 'All Indian bank debit cards' },
                ].map(({ id, icon, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => { setMethod(id); setStep(id === 'upi' ? 'upi-enter' : 'card-form'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition group text-left"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{label}</p>
                      <p className="text-[11px] text-slate-400">{sub}</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-400 text-lg">›</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 justify-center mt-5 text-[11px] text-slate-400">
                <FiShield size={12} className="text-green-500" />
                Payments are 256-bit SSL encrypted &amp; secure
              </div>
            </>
          )}

          {/* ══════════ UPI ENTER ID ══════════ */}
          {step === 'upi-enter' && (
            <>
              <Header title="Pay via UPI" back={() => setStep('select')} />
              <OrderSummary />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">UPI ID</label>
                  <div className="relative">
                    <FiSmartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition"
                    />
                  </div>
                  {upiError && <p className="text-xs text-red-500 mt-1.5">{upiError}</p>}
                  <p className="text-[11px] text-slate-400 mt-2">
                    A payment request of <strong>₹999</strong> will be sent to this UPI ID.
                  </p>
                </div>

                <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-700">
                  ⏱️ You'll have <strong>5 minutes</strong> to approve the request in your UPI app.
                </div>

                <button
                  onClick={sendUpiRequest}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-200"
                >
                  Send ₹999 Request →
                </button>
              </div>
            </>
          )}

          {/* ══════════ UPI PENDING ══════════ */}
          {step === 'upi-pending' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center mx-auto relative">
                <span className="text-3xl">🏦</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                  <FiLoader size={10} className="text-white animate-spin" />
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Request Sent{dots}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Payment request of <strong>₹999</strong> sent to<br />
                  <span className="font-bold text-indigo-600">{upiId}</span>
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                <p>📱 Open your UPI app (GPay / PhonePe / Paytm)</p>
                <p>✅ Approve the ₹999 payment request</p>
                <p>⏳ Do not close this window</p>
              </div>
              <div className="flex gap-1.5 justify-center">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ══════════ CARD FORM ══════════ */}
          {step === 'card-form' && (
            <>
              <Header
                title={method === 'credit' ? 'Credit Card' : 'Debit Card'}
                back={() => setStep('select')}
              />
              <OrderSummary />

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cardholder Name</label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                  <div className="relative">
                    <FiCreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-400 outline-none transition tracking-wider"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date</label>
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-400 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                    <div className="relative">
                      <input
                        value={cvv}
                        type="password"
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-400 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {cardError && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{cardError}</p>
                )}

                <button
                  onClick={submitCard}
                  disabled={busy}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {busy ? <FiLoader size={16} className="animate-spin" /> : <FiLock size={14} />}
                  {busy ? 'Processing...' : 'Proceed to OTP →'}
                </button>

                <div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-400">
                  <FiShield size={11} className="text-green-500" />
                  Your card details are secured with 256-bit encryption
                </div>
              </div>
            </>
          )}

          {/* ══════════ OTP ══════════ */}
          {step === 'otp' && (
            <>
              <Header title="Enter OTP" back={() => setStep('card-form')} />

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <FiSmartphone size={22} className="text-indigo-500" />
                </div>
                <p className="text-sm text-slate-600">
                  A 6-digit OTP has been sent to your registered<br />
                  mobile number &amp; email.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Authorising payment of <strong>₹999</strong> to FreelanceFlow
                </p>
              </div>

              <div className="space-y-4">
                <OtpInput value={otp} onChange={setOtp} />
                {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}

                <div className="text-center text-xs text-slate-400">
                  {otpTimer > 0 ? (
                    <>Resend OTP in <span className="font-bold text-indigo-600">{otpTimer}s</span></>
                  ) : (
                    <button onClick={() => setOtpTimer(30)} className="text-indigo-600 font-bold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  onClick={submitOtp}
                  disabled={busy || otp.length < 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
                >
                  {busy ? <FiLoader size={16} className="animate-spin" /> : null}
                  {busy ? 'Verifying...' : 'Verify & Pay ₹999'}
                </button>
              </div>
            </>
          )}

          {/* ══════════ RESULT ══════════ */}
          {step === 'result' && result === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto">
                <FiCheckCircle size={36} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Payment Successful! 🎉</h3>
                <p className="text-sm text-slate-500 mt-1">
                  ₹999 paid successfully via {method === 'upi' ? `UPI (${upiId})` : method === 'credit' ? 'Credit Card' : 'Debit Card'}
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-xs text-green-700 space-y-1 text-left">
                <p>✅ Your account has been upgraded to <strong>Pro</strong></p>
                <p>✅ Unlimited clients &amp; projects unlocked</p>
                <p>✅ PDF invoice generation enabled</p>
                <p>✅ Confirmation sent to your email</p>
              </div>
              <div className="text-[11px] text-slate-400">
                Transaction ID: <span className="font-mono font-bold">FF{Date.now().toString().slice(-8)}</span>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition"
              >
                Start using Pro →
              </button>
            </div>
          )}

          {step === 'result' && result === 'failed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto">
                <FiAlertCircle size={36} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Payment Failed</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {method === 'upi'
                    ? 'The UPI payment request was declined or timed out.'
                    : 'Your card payment could not be processed. Please check your details.'}
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 text-left space-y-1">
                <p>❌ Payment of ₹999 was not completed</p>
                <p>ℹ️ No amount has been debited from your account</p>
                <p>💡 Please try again or use a different payment method</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setOtp(''); setStep('select'); setResult(null); }}
                  className="flex-1 py-3 border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-in { animation: animate-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default PaymentModal;
