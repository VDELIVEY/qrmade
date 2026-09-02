'use client';

import React, { useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import { useApp } from '@/lib/context';
import {
  Activity, Users, Clock, TrendingUp, TrendingDown,
  Stethoscope, FlaskConical, Pill, CreditCard,
  AlertTriangle, CheckCircle, BarChart3, Heart,
  Thermometer, Droplet, BedDouble, UserCheck,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  LineChart, Line, Legend,
} from 'recharts';

export default function InstitutionDashboard() {
  return (
    <RoleGuard allowedRole="admin">
      <InstitutionDashboardContent />
    </RoleGuard>
  );
}

/* ─────────────────────────── MOCK DATA ─────────────────────────── */

const weeklyAdmissions = [
  { day: 'Mon', Admissions: 118, Discharged: 102, Emergency: 22 },
  { day: 'Tue', Admissions: 134, Discharged: 118, Emergency: 28 },
  { day: 'Wed', Admissions: 152, Discharged: 139, Emergency: 35 },
  { day: 'Thu', Admissions: 141, Discharged: 130, Emergency: 31 },
  { day: 'Fri', Admissions: 168, Discharged: 151, Emergency: 40 },
  { day: 'Sat', Admissions: 98,  Discharged: 95,  Emergency: 19 },
  { day: 'Sun', Admissions: 82,  Discharged: 79,  Emergency: 14 },
  { day: 'Today', Admissions: 142, Discharged: 108, Emergency: 27 },
];

const departmentLoad = [
  { dept: 'OPD', patients: 65, color: '#0ea5e9' },
  { dept: 'Emergency', patients: 42, color: '#ef4444' },
  { dept: 'Pediatrics', patients: 38, color: '#10b981' },
  { dept: 'Maternity', patients: 24, color: '#8b5cf6' },
  { dept: 'Surgery', patients: 18, color: '#f59e0b' },
  { dept: 'Dental/Eye', patients: 15, color: '#06b6d4' },
];

const diagnosisBreakdown = [
  { name: 'Malaria', value: 28, color: '#ef4444' },
  { name: 'Hypertension', value: 18, color: '#0ea5e9' },
  { name: 'Respiratory', value: 15, color: '#10b981' },
  { name: 'Diabetes', value: 12, color: '#f59e0b' },
  { name: 'Trauma/Injury', value: 10, color: '#8b5cf6' },
  { name: 'Other', value: 17, color: '#94a3b8' },
];

const labTurnover = [
  { day: 'Mon', Tests: 45, Completed: 41, Pending: 4 },
  { day: 'Tue', Tests: 52, Completed: 48, Pending: 4 },
  { day: 'Wed', Tests: 60, Completed: 55, Pending: 5 },
  { day: 'Thu', Tests: 50, Completed: 47, Pending: 3 },
  { day: 'Fri', Tests: 72, Completed: 65, Pending: 7 },
  { day: 'Sat', Tests: 30, Completed: 29, Pending: 1 },
  { day: 'Sun', Tests: 25, Completed: 24, Pending: 1 },
  { day: 'Today', Tests: 58, Completed: 44, Pending: 14 },
];

const prescriptionData = [
  { day: 'Mon', Issued: 78, Dispensed: 72 },
  { day: 'Tue', Issued: 85, Dispensed: 80 },
  { day: 'Wed', Issued: 98, Dispensed: 91 },
  { day: 'Thu', Issued: 88, Dispensed: 83 },
  { day: 'Fri', Issued: 112, Dispensed: 104 },
  { day: 'Sat', Issued: 60, Dispensed: 58 },
  { day: 'Sun', Issued: 45, Dispensed: 43 },
  { day: 'Today', Issued: 92, Dispensed: 71 },
];

const revenueData = [
  { month: 'Jan', Revenue: 18200000, Claims: 14100000 },
  { month: 'Feb', Revenue: 21500000, Claims: 16800000 },
  { month: 'Mar', Revenue: 19800000, Claims: 15200000 },
  { month: 'Apr', Revenue: 24200000, Claims: 18900000 },
  { month: 'May', Revenue: 22600000, Claims: 17400000 },
  { month: 'Jun', Revenue: 26800000, Claims: 20300000 },
  { month: 'Jul', Revenue: 23100000, Claims: 18100000 },
];

const bedOccupancy = [
  { ward: 'General Male', total: 60, occupied: 52 },
  { ward: 'General Female', total: 60, occupied: 55 },
  { ward: 'Pediatrics', total: 30, occupied: 24 },
  { ward: 'Maternity', total: 24, occupied: 20 },
  { ward: 'ICU', total: 12, occupied: 11 },
  { ward: 'Surgery', total: 20, occupied: 14 },
];

const alerts = [
  { type: 'critical', msg: 'ICU capacity at 92% — 11/12 beds occupied' },
  { type: 'warning', msg: 'Pharmacy stock low: Amoxicillin (3 days remaining)' },
  { type: 'warning', msg: 'Lab turnaround >2h for 14 pending haematology tests' },
  { type: 'info', msg: 'OPD patient throughput 14% above weekly average' },
  { type: 'info', msg: '5 patients scheduled for discharge today' },
];

/* ─────────────────────────── STYLES ─────────────────────────── */

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(16px)',
  borderRadius: '1.1rem',
  border: '1px solid rgba(226,232,240,0.8)',
  boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
  padding: '1.5rem',
};

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.97)',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  fontSize: 12,
};

const TABS = ['Overview', 'Patient Flow', 'Clinical', 'Finance'];

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

function InstitutionDashboardContent() {
  const { staffName, institutionId } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Institution Admin Portal' }]} />

      <div style={{ padding: '2rem 2.5rem', maxWidth: 1300, margin: '0 auto' }} className="fade-in">
        {/* ── Header Banner ────────────────────────────────────────────── */}
        <div className="page-header-banner flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="page-header-title">Facility Administration &amp; Operational Intelligence</h1>
            <p className="page-header-subtitle">
              Mulago National Referral Hospital &nbsp;·&nbsp; {dateStr}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur px-5 py-2.5 rounded-2xl border border-white/20 shadow-sm flex flex-col gap-0.5 text-white">
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Administrator</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{staffName || 'Dr. Admin'}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#7dd3fc' }}>{institutionId || 'MULAGO-HQ-001'}</span>
          </div>
        </div>

      {/* ── Alert Strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 1rem', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
            background: a.type === 'critical' ? 'rgba(239,68,68,0.1)' : a.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(14,165,233,0.1)',
            color: a.type === 'critical' ? '#dc2626' : a.type === 'warning' ? '#b45309' : '#0284c7',
            border: `1px solid ${a.type === 'critical' ? 'rgba(239,68,68,0.25)' : a.type === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(14,165,233,0.25)'}`,
          }}>
            {a.type === 'critical'
              ? <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />
              : a.type === 'warning'
              ? <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />
              : <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />}
            {a.msg}
          </div>
        ))}
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <KpiCard icon={<Activity />} color="#0ea5e9" label="Patients Today" value="142" delta="+14%" up />
        <KpiCard icon={<BedDouble />} color="#8b5cf6" label="Bed Occupancy" value="86%" delta="+4% vs avg" up={false} />
        <KpiCard icon={<Clock />} color="#10b981" label="Avg Wait Time" value="14 min" delta="−3m vs target" up />
        <KpiCard icon={<FlaskConical />} color="#f59e0b" label="Lab Tests Today" value="58" delta="14 pending" neutral />
        <KpiCard icon={<Pill />} color="#06b6d4" label="Prescriptions" value="92" delta="71 dispensed" neutral />
        <KpiCard icon={<UserCheck />} color="#ef4444" label="Discharged Today" value="108" delta="On track" up />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(241,245,249,0.9)', borderRadius: '1rem', padding: '0.3rem', marginBottom: '1.5rem', width: 'fit-content', border: '1px solid #e2e8f0' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.55rem 1.35rem', borderRadius: '0.75rem', fontWeight: 700,
              fontSize: '0.875rem', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      {activeTab === 'Overview' && <OverviewTab />}
      {activeTab === 'Patient Flow' && <PatientFlowTab />}
      {activeTab === 'Clinical' && <ClinicalTab />}
      {activeTab === 'Finance' && <FinanceTab />}
    </div>
    </div>
  );
}

/* ─────────────────────────── OVERVIEW TAB ─────────────────────────── */
function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Main area chart + dept bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

        {/* Admissions area chart */}
        <div style={card}>
          <ChartHeader title="Weekly Admissions & Discharges" sub="Inpatient flow over the past 8 days" />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyAdmissions} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAdmit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDisch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Admissions" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gradAdmit)" />
                <Area type="monotone" dataKey="Discharged" stroke="#10b981" strokeWidth={2} fill="url(#gradDisch)" />
                <Area type="monotone" dataKey="Emergency" stroke="#ef4444" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department load */}
        <div style={card}>
          <ChartHeader title="Department Load" sub="Current patient distribution" />
          <div style={{ height: 240, marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentLoad} layout="vertical" margin={{ top: 0, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(226,232,240,0.5)" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="dept" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="patients" radius={[0, 6, 6, 0]}>
                  {departmentLoad.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#94a3b8' }}>Busiest dept:</span>
            <span style={{ fontWeight: 800, color: '#0ea5e9' }}>OPD — 65 pts</span>
          </div>
        </div>
      </div>

      {/* Bed occupancy table */}
      <div style={card}>
        <ChartHeader title="Bed Occupancy by Ward" sub="Real-time inpatient capacity" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {bedOccupancy.map((w) => {
            const pct = Math.round((w.occupied / w.total) * 100);
            const color = pct >= 90 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#10b981';
            return (
              <div key={w.ward} style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.9rem 1.1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{w.ward}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: '0.35rem' }}>{w.occupied} / {w.total} beds</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PATIENT FLOW TAB ─────────────────────────── */
function PatientFlowTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Hourly arrivals line chart */}
        <div style={card}>
          <ChartHeader title="Today's Patient Arrivals (Hourly)" sub="Walk-ins vs referrals throughout the day" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { hour: '06:00', WalkIn: 4, Referral: 1 }, { hour: '07:00', WalkIn: 8, Referral: 2 },
                  { hour: '08:00', WalkIn: 18, Referral: 5 }, { hour: '09:00', WalkIn: 24, Referral: 8 },
                  { hour: '10:00', WalkIn: 21, Referral: 6 }, { hour: '11:00', WalkIn: 16, Referral: 4 },
                  { hour: '12:00', WalkIn: 10, Referral: 3 }, { hour: '13:00', WalkIn: 12, Referral: 5 },
                  { hour: '14:00', WalkIn: 17, Referral: 7 }, { hour: '15:00', WalkIn: 9, Referral: 3 },
                ]}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="WalkIn" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Referral" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis breakdown pie */}
        <div style={card}>
          <ChartHeader title="Top Diagnoses This Week" sub="Distribution of presenting conditions" />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diagnosisBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                  {diagnosisBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {diagnosisBreakdown.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ color: '#64748b' }}>{d.name} <strong style={{ color: 'var(--text-main)' }}>{d.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wait time insight */}
      <div style={card}>
        <ChartHeader title="Average Wait Time by Department (Today)" sub="Minutes from registration to consultation" />
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { dept: 'OPD', mins: 14 }, { dept: 'Emergency', mins: 4 },
                { dept: 'Pediatrics', mins: 19 }, { dept: 'Maternity', mins: 22 },
                { dept: 'Surgery', mins: 35 }, { dept: 'Dental/Eye', mins: 28 },
              ]}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
              <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit=" m" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} min`]} />
              <Bar dataKey="mins" radius={[6, 6, 0, 0]}>
                {[14, 4, 19, 22, 35, 28].map((v, i) => (
                  <Cell key={i} fill={v <= 15 ? '#10b981' : v <= 25 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── CLINICAL TAB ─────────────────────────── */
function ClinicalTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Lab tests */}
        <div style={card}>
          <ChartHeader title="Laboratory Throughput" sub="Tests ordered vs completed this week" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labTurnover} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} stackId="lab" />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="lab" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prescriptions */}
        <div style={card}>
          <ChartHeader title="Prescription Fulfilment" sub="Issued vs dispensed by pharmacy" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prescriptionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDispensed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Issued" stroke="#8b5cf6" strokeWidth={2} fill="url(#gIssued)" />
                <Area type="monotone" dataKey="Dispensed" stroke="#06b6d4" strokeWidth={2} fill="url(#gDispensed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vital signs summary table */}
      <div style={card}>
        <ChartHeader title="Clinical Indicators — Inpatient Summary" sub="Key health metrics across admitted patients (today)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { icon: <Heart style={{ width: 18, height: 18 }} />, label: 'Avg Heart Rate', value: '82 bpm', color: '#ef4444', status: 'normal' },
            { icon: <Thermometer style={{ width: 18, height: 18 }} />, label: 'Avg Temperature', value: '37.2 °C', color: '#f59e0b', status: 'normal' },
            { icon: <Droplet style={{ width: 18, height: 18 }} />, label: 'Avg Blood Pressure', value: '124/82', color: '#0ea5e9', status: 'borderline' },
            { icon: <Activity style={{ width: 18, height: 18 }} />, label: 'Avg SpO₂', value: '97.4%', color: '#10b981', status: 'normal' },
            { icon: <Users style={{ width: 18, height: 18 }} />, label: 'Critical Patients', value: '11', color: '#dc2626', status: 'alert' },
            { icon: <Stethoscope style={{ width: 18, height: 18 }} />, label: 'Doctor Consultations', value: '142', color: '#8b5cf6', status: 'normal' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem 1.1rem', border: `1px solid ${item.status === 'alert' ? 'rgba(220,38,38,0.2)' : '#f1f5f9'}`, display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '0.6rem', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: item.color, lineHeight: 1.2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── FINANCE TAB ─────────────────────────── */
function FinanceTab() {
  const totalRevenue = revenueData.reduce((s, r) => s + r.Revenue, 0);
  const totalClaims = revenueData.reduce((s, r) => s + r.Claims, 0);
  const collectionRate = Math.round((totalClaims / totalRevenue) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Finance KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Revenue (YTD)', value: `UGX ${(totalRevenue / 1e6).toFixed(1)}M`, icon: <CreditCard style={{ width: 18, height: 18 }} />, color: '#10b981' },
          { label: 'Insurance Claims', value: `UGX ${(totalClaims / 1e6).toFixed(1)}M`, icon: <BarChart3 style={{ width: 18, height: 18 }} />, color: '#0ea5e9' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: <TrendingUp style={{ width: 18, height: 18 }} />, color: '#8b5cf6' },
          { label: 'Outstanding Bills', value: 'UGX 3.8M', icon: <TrendingDown style={{ width: 18, height: 18 }} />, color: '#f59e0b' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={card}>
        <ChartHeader title="Monthly Revenue vs Insurance Claims (2025)" sub="Gross revenue and insurance reimbursements" />
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gClaims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`UGX ${(v / 1e6).toFixed(1)}M`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#gRev)" />
              <Area type="monotone" dataKey="Claims" stroke="#0ea5e9" strokeWidth={2} fill="url(#gClaims)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payer breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <ChartHeader title="Payment Method Breakdown" sub="How patients are settling bills" />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cash', value: 42, color: '#10b981' },
                    { name: 'NHIF/Insurance', value: 31, color: '#0ea5e9' },
                    { name: 'Corporate', value: 15, color: '#8b5cf6' },
                    { name: 'Waiver/Gov', value: 8, color: '#f59e0b' },
                    { name: 'Pending', value: 4, color: '#ef4444' },
                  ]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}
                >
                  {['#10b981','#0ea5e9','#8b5cf6','#f59e0b','#ef4444'].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {[
              { name: 'Cash 42%', c: '#10b981' }, { name: 'Insurance 31%', c: '#0ea5e9' },
              { name: 'Corporate 15%', c: '#8b5cf6' }, { name: 'Gov Waiver 8%', c: '#f59e0b' }, { name: 'Pending 4%', c: '#ef4444' },
            ].map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.c, flexShrink: 0 }} />
                <span style={{ color: '#64748b' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <ChartHeader title="Daily Billing Activity" sub="This week's billed vs collected amounts" />
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Mon', Billed: 3800000, Collected: 3200000 },
                  { day: 'Tue', Billed: 4200000, Collected: 3700000 },
                  { day: 'Wed', Billed: 5100000, Collected: 4600000 },
                  { day: 'Thu', Billed: 4600000, Collected: 4100000 },
                  { day: 'Fri', Billed: 5800000, Collected: 5200000 },
                  { day: 'Sat', Billed: 2900000, Collected: 2700000 },
                  { day: 'Today', Billed: 4300000, Collected: 3100000 },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`UGX ${(v / 1e6).toFixed(2)}M`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Billed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── HELPERS ─────────────────────────── */

function ChartHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.2rem' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
    </div>
  );
}

interface KpiProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  delta: string;
  up?: boolean;
  neutral?: boolean;
}

function KpiCard({ icon, color, label, value, delta, up, neutral }: KpiProps) {
  const deltaColor = neutral ? '#64748b' : up ? '#059669' : '#dc2626';
  return (
    <div style={{ ...card, padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: '0.6rem', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {React.cloneElement(icon as React.ReactElement, { style: { width: 16, height: 16 } })}
        </div>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: '0.4rem', fontSize: 11, fontWeight: 700, color: deltaColor }}>{neutral ? '' : up ? '▲ ' : '▼ '}{delta}</div>
    </div>
  );
}
