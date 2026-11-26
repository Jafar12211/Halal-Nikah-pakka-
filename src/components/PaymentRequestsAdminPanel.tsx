import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { CheckCircle2, XCircle, RefreshCw, CreditCard } from 'lucide-react';
import { auth, db } from '../services/firebase';

type PaymentRequest = {
  id: string; userId: string; planId: string; planName: string;
  duration: string; amountINR: number; paymentMethod: string;
  transactionReference: string; status: 'pending' | 'approved' | 'rejected';
  createdAt?: { toDate?: () => Date } | string;
};

export const PaymentRequestsAdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'paymentRequests'), limit(100)));
      const rows = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() } as PaymentRequest));
      rows.sort((a, b) => {
        const date = (v: PaymentRequest['createdAt']) => v && typeof v === 'object' && v.toDate ? v.toDate().getTime() : typeof v === 'string' ? Date.parse(v) : 0;
        return date(b.createdAt) - date(a.createdAt);
      });
      setRequests(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load payment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const review = async (request: PaymentRequest, status: 'approved' | 'rejected') => {
    if (!auth.currentUser || busyId) return;
    setBusyId(request.id);
    setMessage('');
    try {
      if (status === 'approved') {
        const months = request.planId === 'monthly' ? 1 : request.planId === 'quarterly' ? 3 : request.planId === 'half_yearly' ? 6 : request.planId === 'yearly' ? 12 : 0;
        const expectedAmounts: Record<string, number> = { monthly: 500, quarterly: 1000, half_yearly: 1500, yearly: 2500 };
        if (!months || expectedAmounts[request.planId] !== request.amountINR) {
          throw new Error('The selected plan or amount is invalid. This request cannot be approved.');
        }
        const startsAt = new Date();
        const endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + months);
        const batch = writeBatch(db);
        batch.update(doc(db, 'paymentRequests', request.id), {
          status: 'approved',
          reviewedBy: auth.currentUser.email || auth.currentUser.uid,
          reviewNote: 'Payment manually verified by administrator.',
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'memberships', request.userId), {
          userId: request.userId,
          planId: request.planId,
          planName: request.planName,
          amountINR: request.amountINR,
          status: 'active',
          paymentRequestId: request.id,
          transactionReference: request.transactionReference,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          expiresAt: Timestamp.fromDate(endsAt),
          approvedBy: auth.currentUser.email || auth.currentUser.uid,
          approvedAt: serverTimestamp(),
        });
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'paymentRequests', request.id), {
          status: 'rejected',
          reviewedBy: auth.currentUser.email || auth.currentUser.uid,
          reviewNote: 'Payment not verified by administrator.',
          updatedAt: serverTimestamp(),
        });
      }
      setMessage(status === 'approved' ? 'Payment request approved and membership record activated.' : 'Payment request rejected.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not review this request.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-bold text-stone-900">Membership payment requests</h3><p className="text-xs text-stone-500">Verify each UPI transaction in your BharatPe account before approving.</p></div>
        <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>
      {message && <p role="status" className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">{message}</p>}
      {loading ? <p className="py-8 text-center text-sm text-stone-500">Loading payment requests…</p> : requests.length === 0 ? <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">No payment requests have been submitted yet.</div> : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-800" /><h4 className="font-bold text-stone-900">{request.planName} · ₹{request.amountINR?.toLocaleString('en-IN')}</h4></div><p className="mt-1 text-xs text-stone-500">Customer UID: {request.userId}</p><p className="mt-1 text-xs text-stone-600">Transaction reference: <strong>{request.transactionReference}</strong></p><p className="mt-1 text-xs text-stone-500">Method: {request.paymentMethod === 'qr' ? 'BharatPe QR' : 'UPI app / ID'}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : request.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>{request.status}</span>
              </div>
              {request.status === 'pending' && <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busyId === request.id} onClick={() => void review(request, 'approved')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Verify & approve</button><button type="button" disabled={busyId === request.id} onClick={() => void review(request, 'rejected')} className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"><XCircle className="h-4 w-4" /> Reject</button></div>}
            </article>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-stone-500">Approval creates a membership record after manual verification. Profile-view limits and paid-directory access enforcement are separate controls and are not changed by this payment-request workflow.</p>
    </section>
  );
};
