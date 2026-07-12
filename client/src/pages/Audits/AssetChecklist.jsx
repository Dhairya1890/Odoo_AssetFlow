import { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Save } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  Icon: Clock,          bg: 'bg-slate-100',  text: 'text-slate-600', border: '' },
  verified: { label: 'Verified', Icon: CheckCircle2,   bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-l-4 border-l-emerald-500' },
  missing:  { label: 'Missing',  Icon: XCircle,        bg: 'bg-red-50',     text: 'text-red-700',   border: 'border-l-4 border-l-red-500' },
  damaged:  { label: 'Damaged',  Icon: AlertTriangle,  bg: 'bg-amber-50',   text: 'text-amber-700', border: 'border-l-4 border-l-amber-500' },
};

function ItemRow({ item, cycleId, cycleStatus, onItemUpdated }) {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.notes || '');
  const [notesOpen, setNotesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleStatusChange = (newStatus) => {
    if (cycleStatus === 'closed') return;
    setStatus(newStatus);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch(`/audits/${cycleId}/items/${item.id}`, { status, notes });
      onItemUpdated(res.data?.data?.item || { ...item, status, notes });
      setDirty(false);
      toast.success('Item updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isClosed = cycleStatus === 'closed';

  return (
    <tr className={`transition-colors group ${cfg.border} ${dirty ? 'bg-primary/5' : 'hover:bg-surface-container-low'}`}>
      {/* Asset Tag */}
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-on-surface font-mono">{item.asset?.assetTag || '—'}</p>
      </td>
      {/* Asset Name */}
      <td className="px-5 py-3.5">
        <p className="text-sm text-on-surface">{item.asset?.name || '—'}</p>
      </td>
      {/* Location */}
      <td className="px-5 py-3.5 text-sm text-on-surface-variant">
        {item.asset?.location || '—'}
      </td>
      {/* Auditor */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center">
            {item.auditor?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-on-surface-variant">{item.auditor?.name || '—'}</span>
        </div>
      </td>
      {/* Status Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          {[
            { s: 'verified', Icon: CheckCircle2, activeClass: 'bg-emerald-600 text-white border-emerald-600', hoverClass: 'hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700' },
            { s: 'missing',  Icon: XCircle,      activeClass: 'bg-red-600 text-white border-red-600',     hoverClass: 'hover:bg-red-50 hover:border-red-400 hover:text-red-700' },
            { s: 'damaged',  Icon: AlertTriangle, activeClass: 'bg-amber-500 text-white border-amber-500', hoverClass: 'hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700' },
          ].map(({ s, Icon, activeClass, hoverClass }) => (
            <button
              key={s}
              id={`audit-item-${item.id}-${s}`}
              disabled={isClosed}
              onClick={() => handleStatusChange(s)}
              title={s}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed capitalize
                ${status === s ? activeClass : `border-outline-variant text-on-surface-variant bg-surface ${hoverClass}`}
              `}
            >
              <Icon className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>
      </td>
      {/* Notes + Save */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotesOpen(p => !p)}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
            disabled={isClosed}
          >
            {notesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Notes
          </button>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              id={`audit-item-${item.id}-save`}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary text-on-primary hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {saving ? '…' : 'Save'}
            </button>
          )}
        </div>
        {notesOpen && !isClosed && (
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setDirty(true); }}
            className="mt-2 w-full text-xs px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={2}
            placeholder="Add notes for this item…"
          />
        )}
        {notesOpen && isClosed && notes && (
          <p className="mt-2 text-xs text-on-surface-variant italic">{notes}</p>
        )}
      </td>
    </tr>
  );
}

export default function AssetChecklist({ cycle, onItemUpdated }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const items = cycle?.items || [];

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.asset?.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
        item.asset?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, filterStatus]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    verified: items.filter(i => i.status === 'verified').length,
    missing: items.filter(i => i.status === 'missing').length,
    damaged: items.filter(i => i.status === 'damaged').length,
  }), [items]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            id="checklist-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tag or name…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'verified', 'missing', 'damaged'].map(s => (
            <button
              key={s}
              id={`filter-${s}`}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all border
                ${filterStatus === s
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}
              `}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {['Asset Tag', 'Name', 'Location', 'Auditor', 'Status', 'Notes'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                    {items.length === 0
                      ? "No assets found in this cycle's scope."
                      : 'No items match your filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    cycleId={cycle.id}
                    cycleStatus={cycle.status}
                    onItemUpdated={onItemUpdated}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
