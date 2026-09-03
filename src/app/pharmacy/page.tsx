"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/context";
import RoleGuard from "@/components/RoleGuard";
import { 
  Search, Pill, ChevronLeft, CheckCircle2, 
  AlertCircle, Loader2, Clipboard, Heart,
  PackageCheck, ShoppingBag, ShieldCheck, User
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Episode {
  id: string;
  episode_code: string;
  status: string;
  created_at: string;
  patients: {
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    dob?: string | null;
  } | null;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  paid: boolean;
  dispensed: boolean;
}

interface Diagnosis {
  id: string;
  notes: string;
}

export default function PharmacyPortal() {
  return (
    <RoleGuard allowedRole="pharmacy">
      <PharmacyContent />
    </RoleGuard>
  );
}

function PharmacyContent() {
  const { staffId } = useApp();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [dispensedSuccess, setDispensedSuccess] = useState(false);

  const fetchEpisodes = useCallback(async (code?: string) => {
    setLoadingList(true);
    try {
      const url = code ? `/api/pharmacy?code=${encodeURIComponent(code)}` : '/api/pharmacy';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setEpisodes(data.episodes || []);
      } else {
        setEpisodes([]);
      }
    } catch {
      setEpisodes([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEpisodes(searchCode.trim() || undefined);
  };

  const selectEpisode = async (episode: Episode) => {
    setSelectedEpisode(episode);
    setDispensedSuccess(false);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/pharmacy?episodeId=${encodeURIComponent(episode.id)}`);
      const data = await res.json();
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
        setDiagnoses(data.diagnoses || []);
      } else {
        setPrescriptions([]);
        setDiagnoses([]);
      }
    } catch {
      setPrescriptions([]);
      setDiagnoses([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDispense = async () => {
    if (!selectedEpisode) return;
    setDispensing(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: selectedEpisode.id,
          dispensed: true,
          pharmacyStaffId: staffId || 'demo-pharm-1',
        }),
      });
      if (res.ok) {
        setDispensedSuccess(true);
        setPrescriptions((prev) => prev.map((p) => ({ ...p, dispensed: true })));
        showSuccess();
      } else {
        alert('Failed to authorize dispensing');
      }
    } catch {
      alert('Network error during dispensing authorization');
    } finally {
      setDispensing(false);
    }
  };

  const showSuccess = () => {
    setDispensedSuccess(true);
    setTimeout(() => {
      // Refresh list and go back after success
      goBack();
    }, 2500);
  };

  const goBack = () => {
    setSelectedEpisode(null);
    setPrescriptions([]);
    setDiagnoses([]);
    setDispensedSuccess(false);
    fetchEpisodes(searchCode.trim() || undefined);
  };

  const allDispensed = prescriptions.length > 0 && prescriptions.every((p) => p.dispensed);
  const hasPending = prescriptions.some((p) => !p.dispensed);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Pharmacy & Dispensing Desk' }]} />

      <div className="container max-w-5xl mx-auto p-8 fade-in">
        {/* Page Header Banner */}
        <div className="page-header-banner">
          <h1 className="page-header-title">Pharmacy &amp; Prescription Dispensing</h1>
          <p className="page-header-subtitle">
            Review doctor-authorized medication prescriptions, verify clinical diagnoses, and confirm fulfillment.
          </p>
        </div>

      {selectedEpisode ? (
        <div className="max-w-4xl mx-auto">
          <button className="btn bg-white/50 backdrop-blur border-white/40 mb-8 hover:bg-white transition-all shadow-sm" onClick={goBack}>
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Queue
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient & Diagnosis Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 border-pink-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                    <User className="text-pink-600" />
                  </div>
                  <div>
                    <h3 className="m-0 text-lg">{selectedEpisode.patients?.first_name} {selectedEpisode.patients?.last_name}</h3>
                    <p className="text-xs text-muted font-mono">{selectedEpisode.episode_code}</p>
                  </div>
                </div>
                <div className="space-y-3 pt-6 border-t border-pink-50">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="font-bold text-gray-800">{selectedEpisode.patients?.dob ? new Date(selectedEpisode.patients.dob).toLocaleDateString() : '—'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Gender</span>
                     <span className="font-bold text-gray-800">{selectedEpisode.patients?.gender}</span>
                   </div>
                </div>
              </div>

              <div className="glass-card p-6 bg-emerald-50/50 border-emerald-100">
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Clinical Diagnosis
                </h4>
                <p className="text-sm font-semibold text-emerald-900 leading-relaxed italic">
                   "{diagnoses.length > 0 ? diagnoses.map(d => d.notes).join(', ') : 'No notes provided'}"
                </p>
              </div>
            </div>

            {/* Prescription List */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <PackageCheck className="w-32 h-32" />
                </div>
                <h3 className="mb-8 flex items-center gap-3">
                  <Clipboard className="text-pink-500" /> Authorized Medication
                </h3>

                {loadingDetail ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
                    <p className="text-muted">Fetching prescription details...</p>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted">No medications found for this episode.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => (
                      <div 
                        key={rx.id} 
                        className={`p-6 rounded-3xl border-2 transition-all flex justify-between items-center ${
                          rx.dispensed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-50 hover:border-pink-200'
                        }`}
                      >
                        <div>
                          <h4 className="font-black text-gray-900 text-lg mb-1">{rx.medication}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">{rx.dosage}</span>

                          </div>
                        </div>
                        {rx.dispensed ? (
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                             <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-gray-200" />
                        )}
                      </div>
                    ))}

                    <div className="pt-8 mt-8 border-t border-gray-100">
                      {dispensedSuccess ? (
                        <div className="p-6 bg-emerald-100 text-emerald-700 rounded-3xl font-black flex items-center justify-center gap-4 animate-bounce">
                           <ShieldCheck className="w-8 h-8" />
                           MEDICATION DISPENSED SUCCESSFULLY
                        </div>
                      ) : (
                        <button 
                          onClick={handleDispense}
                          disabled={dispensing || !hasPending}
                          className="w-full btn btn-primary py-5 text-xl font-black flex items-center justify-center gap-4 shadow-2xl"
                        >
                          {dispensing ? <Loader2 className="animate-spin" /> : <PackageCheck className="w-7 h-7" />}
                          Complete Dispensing
                        </button>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="glass-card p-4 mb-10 flex gap-4 shadow-xl border-white/50">
            <div className="relative flex-1 group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Dispensing Queue by Episode Code..." 
                value={searchCode}
                onChange={e => setSearchCode(e.target.value.toUpperCase())}
                className="input-modern pl-14 py-4 text-lg border-transparent hover:border-gray-100"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary px-10 font-bold">Search</button>
          </div>

          {/* Episode List */}
          {loadingList ? (
            <div className="py-20 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
              <p className="text-muted font-bold">Synchronizing prescription queue...</p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="glass-card p-20 text-center border-dashed border-gray-200">
               <Pill className="w-20 h-20 text-gray-100 mx-auto mb-6" />
               <h3 className="text-gray-400">Prescription Queue Empty</h3>
               <p className="text-muted">No pending prescriptions ready for dispensing at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {episodes.map((ep) => (
                <div 
                  key={ep.id} 
                  onClick={() => selectEpisode(ep)}
                  className="glass-card p-8 group hover:-translate-y-2 transition-all cursor-pointer border-white/60 hover:border-pink-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Pill className="text-pink-600" />
                    </div>
                    <div className="badge-modern badge-primary uppercase tracking-tighter">Ready</div>
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-1">{ep.episode_code}</h4>
                  <p className="text-muted font-bold">{ep.patients?.first_name} {ep.patients?.last_name}</p>
                  <div className="mt-6 flex items-center gap-2 text-pink-600 font-black text-[10px] uppercase tracking-widest">
                    View Prescription <ChevronLeft className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
