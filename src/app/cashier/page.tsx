"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { 
  CreditCard, Banknote, Smartphone, Search, 
  User, Receipt, CheckCircle2, AlertCircle,
  ArrowRight, Loader2, DollarSign, Wallet, ShieldCheck, Stethoscope
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import Breadcrumbs from "@/components/Breadcrumbs";
import CollectUGPaymentModal from "@/components/CollectUGPaymentModal";

export default function CashierPortal() {
  return (
    <RoleGuard allowedRole="cashier">
      <CashierContent />
    </RoleGuard>
  );
}

function CashierContent() {
  const { setActiveEpisode } = useApp();
  const [step, setStep] = useState<'search' | 'results' | 'payment' | 'paid'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectUGOpen, setCollectUGOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('consultation');
  const [customAmount, setCustomAmount] = useState('1000');
  const [customDescription, setCustomDescription] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try searching by code first
      const res = await fetch(`/api/episodes?code=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (res.ok && data.episode) {
        selectEpisode(data.episode);
      } else {
        // Try searching by name
        const resName = await fetch(`/api/episodes?name=${encodeURIComponent(searchQuery)}`);
        const dataName = await resName.json();
        if (resName.ok && dataName.episodes?.length > 0) {
          setSearchResults(dataName.episodes);
          setStep('results');
        } else {
          alert('No matching episodes found');
        }
      }
    } catch (err) {
      alert('Network error during search');
    } finally {
      setLoading(false);
    }
  };

  const selectEpisode = (episode: any) => {
    setEpisodeData(episode);
    setActiveEpisode(episode.id, episode.patient_id);
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!paymentMethod || !episodeData) return;
    const amount = Number(customAmount) || 1000;
    if (paymentMethod === 'mobile') {
      setCollectUGOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: episodeData.id,
          amount,
          method: paymentMethod,
          type: paymentType,
          description: customDescription || `${paymentType} payment for episode ${episodeData.episode_code}`,
        }),
      });
      if (res.ok) {
        setStep('paid');
      } else {
        alert('Transaction failed: Insufficient funds or system error');
      }
    } catch (err) {
      alert('Network error during payment');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setEpisodeData(null);
    setPaymentMethod('');
    setCollectUGOpen(false);
    setActiveEpisode(null);
    setPaymentType('consultation');
    setCustomAmount('1000');
    setCustomDescription('');
  };

  return (
    <>
    <div>
      <Breadcrumbs items={[{ label: 'Cashier & Billing Desk' }]} />

      <div className="container max-w-4xl mx-auto p-8 fade-in">
        {/* Page Header Banner */}
        <div className="page-header-banner">
          <h1 className="page-header-title">Billing &amp; Payment Settlement</h1>
          <p className="page-header-subtitle">
            Process healthcare service payments securely and promote patient episodes to active clinical queues.
          </p>
        </div>

      {step === 'search' && (
        <div className="glass-card p-10 max-w-2xl mx-auto shadow-2xl">
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Search className="w-4 h-4" /> Locate Medical Episode
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Episode Code (e.g. EP-XXXX) or Patient Name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  required 
                  className="input-modern pl-12 text-lg py-5 border-2 group-hover:border-amber-400 transition-colors"
                />
                <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </div>
            <button type="submit" className="w-full btn btn-primary py-5 mt-6 font-bold shadow-xl flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
              {loading ? 'Searching National DB...' : 'Search Episodes'}
            </button>
          </form>
        </div>
      )}

      {step === 'results' && (
        <div className="glass-card p-10 max-w-3xl mx-auto fade-in">
          <div className="flex justify-between items-center mb-8">
            <h3 className="m-0">Search Results</h3>
            <button onClick={reset} className="btn bg-gray-100 text-gray-700">Change Search</button>
          </div>
          <div className="space-y-4">
            {searchResults.map((ep, i) => (
              <div 
                key={i} 
                onClick={() => selectEpisode(ep)}
                className="p-6 bg-white/50 border border-border-color rounded-2xl flex justify-between items-center cursor-pointer hover:border-amber-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <User className="text-amber-600" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{ep.patients.first_name} {ep.patients.last_name}</div>
                    <div className="text-xs text-muted font-mono">{ep.episode_code} • {new Date(ep.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className={`badge-modern ${ep.status === 'created' ? 'badge-primary' : 'badge-secondary'}`}>
                    {ep.status.replace('_', ' ')}
                   </div>
                   <ArrowRight className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'payment' && episodeData && (
        <div className="glass-card p-10 max-w-2xl mx-auto fade-in shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Receipt className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Episode Settlement</h2>
              <p className="text-muted font-mono">{episodeData.episode_code} • {episodeData.patients.first_name} {episodeData.patients.last_name}</p>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
            </div>
            
            <div className="form-group mb-6">
              <label className="text-gray-400 font-bold uppercase tracking-widest text-xs block mb-3">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => {
                  setPaymentType(e.target.value);
                  if (e.target.value === 'consultation') setCustomAmount('1000');
                  else if (e.target.value === 'referral') setCustomAmount('5000');
                  else if (e.target.value === 'lab') setCustomAmount('15000');
                  else setCustomAmount('1000');
                }}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
              >
                <option value="consultation" className="text-gray-900">Consultation Fee</option>
                <option value="referral" className="text-gray-900">Referral Fee</option>
                <option value="lab" className="text-gray-900">Laboratory Test</option>
                <option value="pharmacy" className="text-gray-900">Pharmacy</option>
                <option value="other" className="text-gray-900">Other</option>
              </select>
            </div>

            <div className="form-group mb-6">
              <label className="text-gray-400 font-bold uppercase tracking-widest text-xs block mb-3">Amount (UGX)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-2xl"
                min="0"
                step="1"
              />
            </div>

            <div className="form-group mb-6">
              <label className="text-gray-400 font-bold uppercase tracking-widest text-xs block mb-3">Description (Optional)</label>
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
                placeholder="e.g., Referral to Specialist, Malaria RDT..."
              />
            </div>

            <div className="border-t border-white/10 my-6"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-amber-400 uppercase tracking-wider">Total Due</span>
              <span className="text-4xl font-black text-amber-400">UGX {Number(customAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="form-group mb-10">
            <label className="form-label text-center mb-6">Select Payment Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PaymentOption 
                icon={<Smartphone />} 
                label="Mobile" 
                active={paymentMethod === 'mobile'} 
                onClick={() => setPaymentMethod('mobile')} 
              />
              <PaymentOption 
                icon={<Banknote />} 
                label="Cash" 
                active={paymentMethod === 'cash'} 
                onClick={() => setPaymentMethod('cash')} 
              />
              <PaymentOption 
                icon={<CreditCard />} 
                label="Health Card" 
                active={paymentMethod === 'card'} 
                onClick={() => setPaymentMethod('card')} 
              />
            </div>
          </div>

          <button 
            className="w-full btn btn-primary py-5 text-xl font-black flex items-center justify-center gap-3 shadow-2xl hover:shadow-glass" 
            onClick={handlePayment} 
            disabled={!paymentMethod || loading || !customAmount || Number(customAmount) <= 0}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
            Authorize Payment
          </button>
        </div>
      )}

      {step === 'paid' && (
        <div className="glass-card p-12 max-w-2xl mx-auto text-center fade-in border-amber-200/50">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="mb-2">Transaction Approved</h1>
          <p className="text-xl text-muted mb-10">
            Consultation fee received. Episode <span className="font-black text-gray-900">{episodeData.episode_code}</span> has been promoted to clinical queue.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="p-6 bg-amber-50 text-amber-700 rounded-3xl font-bold border border-amber-100 flex items-center justify-center gap-4">
               <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                 <Stethoscope className="w-5 h-5" />
               </div>
               Next Step: Direct Patient to Doctor's Consultation Room
            </div>
            <button onClick={reset} className="btn btn-secondary py-5 font-bold mt-4 shadow-lg">
              Process Next Billing
            </button>
          </div>
        </div>
      )}
      </div>
    </div> 
    {episodeData && (
      <CollectUGPaymentModal
        isOpen={collectUGOpen}
        onClose={() => setCollectUGOpen(false)}
        episodeId={episodeData.id}
        defaultAmount={1000}
        onSuccess={() => {
          setCollectUGOpen(false);
          setStep('paid');
        }}
      />
    )}
    </>
  );
}

function PaymentOption({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
        active 
          ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-lg scale-105' 
          : 'border-gray-100 bg-white hover:border-amber-200 text-gray-400'
      }`}
    >
      <div className={`${active ? 'text-amber-500' : 'text-gray-300'}`}>{icon}</div>
      <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>
    </div>
  );
}

