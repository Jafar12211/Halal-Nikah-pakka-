import React, { useState } from 'react';
import { Check, Crown, ShieldCheck, Copy, Smartphone, QrCode, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import bharatPeQr from '../assets/images/bharatpe-membership-qr.png';

const plans = [
  { name: 'Monthly', duration: '1 month', price: 500, note: 'Flexible access' },
  { name: 'Quarterly', duration: '3 months', price: 1000, note: 'Three months of membership' },
  { name: 'Half-yearly', duration: '6 months', price: 1500, note: 'Six months of membership', featured: true },
  { name: 'Yearly', duration: '12 months', price: 2500, note: 'Best value for long-term search' },
];

const UPI_ID = 'BHARATPE2O0M0S1F8W06214@unitype';
const PAYEE_NAME = 'MOHAMMED IMAM JAFAR';

export const MembershipPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi'>('qr');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const paymentLink = selectedPlan
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(`Nikah Pakka ${selectedPlan.name} Membership`)}`
    : '';

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setNotice('UPI ID copied. Open your UPI app to pay.');
    } catch {
      setNotice(`UPI ID: ${UPI_ID}`);
    }
  };

  const submitPaymentRequest = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Please sign in before submitting a payment request.');
      return;
    }
    if (!selectedPlan) return;
    const reference = transactionId.trim();
    if (reference.length < 8 || reference.length > 80) {
      setError('Enter a valid UPI transaction reference (at least 8 characters).');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await addDoc(collection(db, 'paymentRequests'), {
        userId: user.uid,
        planId: selectedPlan.name.toLowerCase().replace(/[^a-z]+/g, '_'),
        planName: selectedPlan.name,
        duration: selectedPlan.duration,
        amountINR: selectedPlan.price,
        paymentMethod,
        upiId: UPI_ID,
        transactionReference: reference,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNotice('Payment request submitted. Your membership will remain pending until the administrator verifies the payment.');
      setTransactionId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit the payment request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="membership-plans" className="py-14 sm:py-16 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            <Crown className="w-4 h-4" /> Nikah Pakka Membership
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Find meaningful connections</h2>
          <p className="mt-3 text-sm text-emerald-100/80">Choose a membership plan to view payment options. Paid access starts only after administrator verification.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-2xl p-5 border ${plan.featured ? 'border-amber-300 bg-white text-stone-900 shadow-xl' : 'border-white/15 bg-white/5 text-white'}`}>
              {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 text-emerald-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Popular</span>}
              <h3 className={`font-semibold text-lg ${plan.featured ? 'text-emerald-950' : 'text-white'}`}>{plan.name}</h3>
              <p className={`text-xs mt-1 ${plan.featured ? 'text-stone-500' : 'text-emerald-100/70'}`}>{plan.duration}</p>
              <p className="mt-5 text-3xl font-bold tabular-nums">₹{plan.price.toLocaleString('en-IN')}</p>
              <p className={`mt-2 text-xs ${plan.featured ? 'text-stone-600' : 'text-emerald-100/75'}`}>{plan.note}</p>
              <button type="button" onClick={() => { setSelectedPlan(plan); setNotice(''); setError(''); }} className="mt-5 w-full rounded-xl bg-amber-300 hover:bg-amber-200 text-emerald-950 font-bold text-sm py-3 transition-colors">
                Select {plan.name}
              </button>
              <div className={`mt-4 pt-4 border-t ${plan.featured ? 'border-stone-200' : 'border-white/15'}`}>
                <p className={`flex items-center gap-2 text-xs ${plan.featured ? 'text-stone-700' : 'text-emerald-50'}`}><Check className="w-4 h-4 text-emerald-400" /> Membership after admin payment approval</p>
              </div>
            </article>
          ))}
        </div>

        {selectedPlan && (
          <div className="mt-8 max-w-2xl mx-auto rounded-2xl border border-amber-300/40 bg-white text-stone-900 p-5 sm:p-7 shadow-xl">
            <button type="button" onClick={() => setSelectedPlan(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"><ArrowLeft className="w-4 h-4" /> Back to plans</button>
            <div className="mt-4 flex flex-wrap justify-between gap-3 items-end">
              <div><p className="text-xs uppercase tracking-wider text-stone-500">Selected membership</p><h3 className="text-2xl font-bold text-emerald-950">{selectedPlan.name}</h3><p className="text-sm text-stone-500">{selectedPlan.duration}</p></div>
              <p className="text-3xl font-bold tabular-nums">₹{selectedPlan.price.toLocaleString('en-IN')}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPaymentMethod('qr')} className={`rounded-xl border p-3 flex items-center justify-center gap-2 text-sm font-semibold ${paymentMethod === 'qr' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-200 text-stone-600'}`}><QrCode className="w-4 h-4" /> Scan QR</button>
              <button type="button" onClick={() => setPaymentMethod('upi')} className={`rounded-xl border p-3 flex items-center justify-center gap-2 text-sm font-semibold ${paymentMethod === 'upi' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-200 text-stone-600'}`}><Smartphone className="w-4 h-4" /> UPI app / ID</button>
            </div>
            {paymentMethod === 'qr' ? (
              <div className="mt-5 text-center">
                <p className="text-sm font-semibold text-stone-800">Scan this BharatPe QR using any UPI app</p>
                <img src={bharatPeQr} alt="BharatPe UPI payment QR for Nikah Pakka membership" className="mx-auto mt-3 w-64 max-w-full rounded-lg border border-stone-200" />
                <p className="mt-2 text-xs text-stone-500">Enter exactly ₹{selectedPlan.price.toLocaleString('en-IN')} in your UPI app before paying.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-stone-50 border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Payee UPI ID</p>
                <div className="mt-1 flex items-center justify-between gap-2"><p className="font-semibold text-sm break-all">{UPI_ID}</p><button type="button" onClick={copyUpi} aria-label="Copy UPI ID" className="p-2 rounded-lg bg-white border border-stone-200"><Copy className="w-4 h-4" /></button></div>
                <a href={paymentLink} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-800 text-white py-3 text-sm font-bold">Pay ₹{selectedPlan.price.toLocaleString('en-IN')} with UPI app</a>
              </div>
            )}
            <div className="mt-5 border-t border-stone-200 pt-5">
              <label htmlFor="membership-transaction-reference" className="block text-sm font-semibold text-stone-800">UPI transaction reference / UTR</label>
              <input id="membership-transaction-reference" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} maxLength={80} placeholder="Enter the transaction reference after paying" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 text-sm text-stone-900" />
              <button type="button" disabled={submitting} onClick={submitPaymentRequest} className="mt-3 w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white py-3 font-bold text-sm flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit payment for verification'}
              </button>
              {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
              {notice && <p role="status" className="mt-3 text-sm text-emerald-800 flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{notice}</p>}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">Submitting a request does not confirm payment or activate membership. The administrator will verify the transaction independently.</p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-amber-300/25 bg-black/10 p-4 flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-emerald-50/85">Payments are made directly to the displayed BharatPe UPI destination. Nikah Pakka does not receive automatic payment confirmation. Membership remains pending until an administrator verifies the transaction.</p>
        </div>
      </div>
    </section>
  );
};
