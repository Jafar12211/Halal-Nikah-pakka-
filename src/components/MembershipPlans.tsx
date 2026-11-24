import React from 'react';
import { Check, Crown, ShieldCheck } from 'lucide-react';

const plans = [
  { name: 'Monthly', duration: '1 month', price: 500, note: 'Flexible access' },
  { name: 'Quarterly', duration: '3 months', price: 1000, note: 'Three months of membership' },
  { name: 'Half-yearly', duration: '6 months', price: 1500, note: 'Six months of membership', featured: true },
  { name: 'Yearly', duration: '12 months', price: 2500, note: 'Best value for long-term search' },
];

export const MembershipPlans: React.FC = () => (
  <section id="membership-plans" className="py-14 sm:py-16 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-9">
        <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
          <Crown className="w-4 h-4" /> Nikah Pakka Membership
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold">Find meaningful connections</h2>
        <p className="mt-3 text-sm text-emerald-100/80">Explore the membership options for extended profile discovery. The five-profile free allowance and paid access controls will be activated after secure membership services are configured.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <article key={plan.name} className={`relative rounded-2xl p-5 border ${plan.featured ? 'border-amber-300 bg-white text-stone-900 shadow-xl' : 'border-white/15 bg-white/5 text-white'}`}>
            {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 text-emerald-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Popular</span>}
            <h3 className={`font-semibold text-lg ${plan.featured ? 'text-emerald-950' : 'text-white'}`}>{plan.name}</h3>
            <p className={`text-xs mt-1 ${plan.featured ? 'text-stone-500' : 'text-emerald-100/70'}`}>{plan.duration}</p>
            <p className="mt-5 text-3xl font-bold tabular-nums">₹{plan.price.toLocaleString('en-IN')}</p>
            <p className={`mt-2 text-xs ${plan.featured ? 'text-stone-600' : 'text-emerald-100/75'}`}>{plan.note}</p>
            <div className={`mt-5 pt-4 border-t ${plan.featured ? 'border-stone-200' : 'border-white/15'}`}>
              <p className={`flex items-center gap-2 text-xs ${plan.featured ? 'text-stone-700' : 'text-emerald-50'}`}><Check className="w-4 h-4 text-emerald-400" /> Membership after admin payment approval</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-amber-300/25 bg-black/10 p-4 flex gap-3 items-start">
        <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-emerald-50/85">Payment QR setup, payment requests, five-view counting and billing-enabled membership activation are intentionally pending. This page displays the confirmed prices only; no payment is collected and no paid access is granted yet.</p>
      </div>
    </div>
  </section>
);
