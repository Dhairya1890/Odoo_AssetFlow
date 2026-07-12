import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ClipboardList, BarChart2, Lock, CalendarRange,
  Users, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2
} from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import AssetChecklist from './AssetChecklist';
import DiscrepancyReport from './DiscrepancyReport';

function ProgressRing({ verified, total, size = 80 }) {
  const pct = total === 0 ? 0 : Math.round((verified / total) * 100);
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-surface-container-high" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor" strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-700 ${pct === 100 ? 'text-emerald-500' : 'text-primary'}`}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold text-on-surface leading-none">{pct}%</p>
        <p className="text-[9px] text-on-surface-variant leading-tight">done</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = status === 'active'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-emerald-100 text-emerald-800';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      {status}
    </span>
  );
}

const TABS = [
  { id: 'checklist', label: 'Asset Checklist', Icon: ClipboardList },
  { id: 'report', label: 'Discrepancy Report', Icon: BarChart2 },
];

export default function CycleDetail({ cycleId, onBack }) {
  const { user } = useAuthStore();
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checklist');
  const [showReport, setShowReport] = useState(false);
  const [reportKey, setReportKey] = useState(0); // bumped after close to force re-fetch
  const [closingConfirm, setClosingConfirm] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchCycle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/audits/${cycleId}`);
      setCycle(res.data?.data?.cycle);
    } catch {
      toast.error('Failed to load audit cycle');
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { fetchCycle(); }, [fetchCycle]);

  const handleItemUpdated = useCallback((updatedItem) => {
    setCycle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === updatedItem.id ? { ...i, ...updatedItem } : i),
      };
    });
  }, []);

  const handleCloseCycle = async () => {
    setClosing(true);
    try {
      await apiClient.patch(`/audits/${cycleId}/close`);
      toast.success('Audit cycle closed. Missing assets marked as Lost.');
      setClosingConfirm(false);
      // Refresh cycle data AND bump reportKey so the report modal re-fetches
      setReportKey(k => k + 1);
      setShowReport(true); // auto-open report to show final state
      fetchCycle();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close cycle');
    } finally {
      setClosing(false);
    }
  };

  // Compute progress stats
  const items = cycle?.items || [];
  const verified = items.filter(i => i.status === 'verified').length;
  const missing  = items.filter(i => i.status === 'missing').length;
  const damaged  = items.filter(i => i.status === 'damaged').length;
  const pending  = items.filter(i => i.status === 'pending').length;
  const total    = items.length;

  const statChips = [
    { label: 'Verified', val: verified, Icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Missing',  val: missing,  Icon: XCircle,      color: 'text-red-600' },
    { label: 'Damaged',  val: damaged,  Icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Pending',  val: pending,  Icon: Clock,        color: 'text-slate-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-container-padding">
        <p className="text-on-surface-variant">Cycle not found.</p>
        <button onClick={onBack} className="mt-4 text-sm text-primary hover:underline">← Back to list</button>
      </div>
    );
  }

  return (
    <div className="p-container-padding space-y-stack-lg">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
        id="audit-detail-back"
      >
        <ArrowLeft className="w-4 h-4" />
        All Audit Cycles
      </button>

      {/* Cycle Header Card */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Progress ring */}
          <div className="shrink-0">
            <ProgressRing verified={verified + damaged} total={total} size={88} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-on-surface truncate">{cycle.name}</h2>
              <StatusBadge status={cycle.status} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="font-medium capitalize">{cycle.scope}:</span> {cycle.scopeValue}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <CalendarRange className="w-3.5 h-3.5" />
                {cycle.startDate} → {cycle.endDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Users className="w-3.5 h-3.5" />
                {cycle.auditors?.length || 0} auditor(s)
              </span>
            </div>

            {/* Auditor avatars */}
            {cycle.auditors?.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3">
                {cycle.auditors.map(a => (
                  <div
                    key={a.id}
                    title={`${a.name} (${a.email})`}
                    className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center ring-2 ring-surface cursor-default"
                  >
                    {a.name?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
            {statChips.map(({ label, val, Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-semibold text-on-surface">{val}</span>
                <span className="text-xs text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              id="view-report-btn"
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              View Report
            </button>
            {user?.role === 'admin' && cycle.status === 'active' && (
              <button
                id="close-cycle-btn"
                onClick={() => setClosingConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-lg text-sm font-medium hover:opacity-90 transition-all"
              >
                <Lock className="w-4 h-4" />
                Close Cycle
              </button>
            )}
            {cycle.status === 'closed' && (
              <div className="flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 rounded-lg text-sm font-medium text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Cycle Closed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant flex gap-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`audit-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px
              ${activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'checklist' && (
        <AssetChecklist cycle={cycle} onItemUpdated={handleItemUpdated} />
      )}
      {activeTab === 'report' && (
        // Inline report summary (non-modal version when navigating to tab)
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',    val: total,    Icon: ClipboardList,  bg: 'bg-surface-container-high', color: 'text-on-surface' },
              { label: 'Verified', val: verified,  Icon: CheckCircle2,   bg: 'bg-emerald-50', color: 'text-emerald-700' },
              { label: 'Missing',  val: missing,   Icon: XCircle,        bg: 'bg-red-50',     color: 'text-red-700' },
              { label: 'Damaged',  val: damaged,   Icon: AlertTriangle,  bg: 'bg-amber-50',   color: 'text-amber-700' },
            ].map(({ label, val, Icon, bg, color }) => (
              <div key={label} className={`rounded-xl p-5 ${bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`text-3xl font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>
          <button
            id="open-full-report-btn"
            onClick={() => setShowReport(true)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <BarChart2 className="w-4 h-4" />
            Open full discrepancy report
          </button>
        </div>
      )}

      {/* Discrepancy Report Modal */}
      {showReport && (
        <DiscrepancyReport
          key={reportKey}
          cycleId={cycle.id}
          cycleName={cycle.name}
          cycleStatus={cycle.status}
          isCycleActive={cycle.status === 'active'}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Close Cycle Confirm Modal */}
      {closingConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setClosingConfirm(false)} />
          <div className="relative bg-surface w-full max-w-md rounded-xl border border-outline-variant shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <Lock className="w-5 h-5 text-on-error-container" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Close Audit Cycle?</h3>
                <p className="text-xs text-on-surface-variant">This action is irreversible.</p>
              </div>
            </div>
            <div className="text-sm text-on-surface-variant space-y-1 bg-surface-container-low rounded-lg p-4">
              <p>• The cycle will be <strong className="text-on-surface">locked</strong> — no more item edits.</p>
              {missing > 0 && (
                <p>• <strong className="text-red-700">{missing} missing asset(s)</strong> will be marked as <strong className="text-on-surface">Lost</strong>.</p>
              )}
              <p>• Audit history will be retained.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setClosingConfirm(false)}
                className="px-5 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-close-cycle-btn"
                onClick={handleCloseCycle}
                disabled={closing}
                className="px-5 py-2 bg-error text-on-error rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {closing && <Loader2 className="w-4 h-4 animate-spin" />}
                {closing ? 'Closing…' : 'Yes, Close Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
