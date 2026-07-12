import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, XCircle, CheckCircle2, Clock, Info, Download, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

// ─── CSV Export helper ────────────────────────────────────────────────────────
function buildCSV({ cycle, summary, report, allItems }) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = [];

  // ── Header block ──
  rows.push(['ASSET AUDIT REPORT']);
  rows.push(['Cycle Name', esc(cycle.name)]);
  rows.push(['Scope', `${esc(cycle.scope)}: ${esc(cycle.scopeValue)}`]);
  rows.push(['Date Range', `${esc(cycle.startDate)} to ${esc(cycle.endDate)}`]);
  rows.push(['Status', esc(cycle.status?.toUpperCase())]);
  rows.push(['Auditors', esc((cycle.auditors || []).map(a => a.name).join(', '))]);
  rows.push(['Exported At', esc(new Date().toLocaleString())]);
  rows.push([]);

  // ── Summary block ──
  rows.push(['SUMMARY']);
  rows.push(['Total Assets', summary?.total ?? 0]);
  rows.push(['Verified', summary?.verified ?? 0]);
  rows.push(['Missing', summary?.missing ?? 0]);
  rows.push(['Damaged', summary?.damaged ?? 0]);
  rows.push(['Pending', summary?.pending ?? 0]);
  rows.push([]);

  // ── All items detail ──
  rows.push(['ALL AUDIT ITEMS']);
  rows.push(['Asset Tag', 'Asset Name', 'Location', 'Auditor', 'Status', 'Notes']);
  for (const item of allItems) {
    rows.push([
      esc(item.asset?.assetTag),
      esc(item.asset?.name),
      esc(item.asset?.location),
      esc(item.auditor?.name),
      esc(item.status?.toUpperCase()),
      esc(item.notes),
    ]);
  }

  return rows.map(r => r.join(',')).join('\r\n');
}

function triggerDownload(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({ label, value, Icon, colorClass, bgClass }) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-2 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wide ${colorClass}`}>{label}</p>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

function ItemTable({ items }) {
  const COLS = ['Asset Tag', 'Name', 'Location', 'Auditor', 'Notes'];
  if (!items || items.length === 0) {
    return <p className="text-sm text-on-surface-variant py-4 text-center">No items in this category.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low">
            {COLS.map(c => (
              <th key={c} className="px-4 py-2.5 text-xs font-medium text-on-surface-variant border-b border-outline-variant">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
              <td className="px-4 py-3 text-sm font-bold font-mono text-on-surface">{item.asset?.assetTag || '—'}</td>
              <td className="px-4 py-3 text-sm text-on-surface">{item.asset?.name || '—'}</td>
              <td className="px-4 py-3 text-sm text-on-surface-variant">{item.asset?.location || '—'}</td>
              <td className="px-4 py-3 text-sm text-on-surface-variant">{item.auditor?.name || '—'}</td>
              <td className="px-4 py-3 text-sm text-on-surface-variant italic">{item.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DiscrepancyReport({ cycleId, cycleName, cycleStatus, isCycleActive, onClose }) {
  const [report, setReport]     = useState(null);
  const [summary, setSummary]   = useState(null);
  const [allItems, setAllItems] = useState([]);   // full item list for export
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch report (flagged items + summary) and full cycle (all items) in parallel
      const [reportRes, cycleRes] = await Promise.all([
        apiClient.get(`/audits/${cycleId}/report`),
        apiClient.get(`/audits/${cycleId}`),
      ]);
      setReport(reportRes.data?.data?.report || {});
      setSummary(reportRes.data?.data?.summary || {});
      setAllItems(cycleRes.data?.data?.cycle?.items || []);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch cycle meta for header (auditors, dates, etc.)
      const cycleRes = await apiClient.get(`/audits/${cycleId}`);
      const cycle = cycleRes.data?.data?.cycle || {};
      const csv = buildCSV({ cycle, summary, report, allItems });
      const safeName = cycleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      triggerDownload(csv, `audit_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const isClosed = cycleStatus === 'closed';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-3xl rounded-xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface">Discrepancy Report</h2>
              {isClosed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                  <CheckCircle2 className="w-3 h-3" /> Final
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">{cycleName}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-on-surface-variant">Loading latest data…</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard label="Total Assets" value={summary?.total ?? 0}    Icon={CheckCircle2}  colorClass="text-on-surface"   bgClass="bg-surface-container-high" />
                <SummaryCard label="Verified"     value={summary?.verified ?? 0} Icon={CheckCircle2}  colorClass="text-emerald-700"  bgClass="bg-emerald-50" />
                <SummaryCard label="Missing"      value={summary?.missing ?? 0}  Icon={XCircle}       colorClass="text-red-700"      bgClass="bg-red-50" />
                <SummaryCard label="Damaged"      value={summary?.damaged ?? 0}  Icon={AlertTriangle} colorClass="text-amber-700"    bgClass="bg-amber-50" />
              </div>

              {/* Pending note */}
              {(summary?.pending ?? 0) > 0 && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-surface-container-high border border-outline-variant rounded-lg text-sm text-on-surface-variant">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    <strong className="text-on-surface">{summary.pending}</strong> asset(s) still pending — not included in the flagged tables.
                  </span>
                </div>
              )}

              {/* Missing Assets */}
              {(summary?.missing ?? 0) > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-semibold text-on-surface">
                      Missing Assets ({summary.missing})
                      {isClosed && <span className="ml-2 text-xs font-normal text-red-600">→ marked as Lost</span>}
                    </h3>
                  </div>
                  <ItemTable items={report?.missing} />
                </section>
              )}

              {/* Damaged Assets */}
              {(summary?.damaged ?? 0) > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-on-surface">Damaged Assets ({summary.damaged})</h3>
                  </div>
                  <ItemTable items={report?.damaged} />
                </section>
              )}

              {/* No discrepancies */}
              {(summary?.missing ?? 0) === 0 && (summary?.damaged ?? 0) === 0 && (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-on-surface">No discrepancies found</p>
                  <p className="text-xs text-on-surface-variant mt-1">All accounted-for assets passed verification.</p>
                </div>
              )}

              {/* Warning: active cycle with missing items */}
              {isCycleActive && (summary?.missing ?? 0) > 0 && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Closing this cycle will mark all <strong>{summary.missing} missing</strong> asset(s) as <strong>Lost</strong> in the system. This action cannot be undone.
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between gap-3">
          {/* Export button */}
          <button
            id="export-audit-report-btn"
            onClick={handleExport}
            disabled={loading || exporting}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            {exporting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>

          <button
            onClick={onClose}
            id="close-report-modal"
            className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
