import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChevronRight, RefreshCw, ClipboardList, CheckCircle2, Circle, Users, CalendarRange } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const EMPTY_FORM = {
  name: '',
  scope: 'department',
  scopeValue: '',
  startDate: '',
  endDate: '',
  auditorIds: [],
};

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
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

export default function AuditCyclesList({ onSelectCycle }) {
  const { user } = useAuthStore();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/audits');
      setCycles(res.data?.data?.cycles || []);
    } catch {
      toast.error('Failed to load audit cycles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycles();
    // Pre-fetch deps for modal
    apiClient.get('/departments').then(r => setDepartments(r.data?.data?.departments || [])).catch(() => {});
    apiClient.get('/users').then(r => {
      const all = r.data?.data?.users || [];
      setAuditors(all.filter(u => ['admin', 'asset_manager'].includes(u.role)));
    }).catch(() => {});
  }, [fetchCycles]);

  const toggleAuditor = (id) => {
    setFormData(prev => ({
      ...prev,
      auditorIds: prev.auditorIds.includes(id)
        ? prev.auditorIds.filter(a => a !== id)
        : [...prev.auditorIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.scopeValue || !formData.startDate || !formData.endDate) {
      toast.error('All fields are required');
      return;
    }
    if (formData.auditorIds.length === 0) {
      toast.error('Assign at least one auditor');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/audits', {
        name: formData.name,
        scope: formData.scope,
        scopeValue: String(formData.scopeValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        auditorIds: formData.auditorIds,
      });
      toast.success('Audit cycle created');
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cycle');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cycles.length;
  const active = cycles.filter(c => c.status === 'active').length;
  const closed = cycles.filter(c => c.status === 'closed').length;

  return (
    <div className="p-container-padding space-y-stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Asset Audits</h2>
          <p className="text-sm text-on-surface-variant mt-1">Run structured verification cycles to reconcile asset inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCycles}
            className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-on-surface-variant ${loading ? 'animate-spin' : ''}`} />
          </button>
          {user?.role === 'admin' && (
            <button
              id="create-audit-cycle-btn"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Audit Cycle
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Cycles" value={total} icon={ClipboardList} colorClass="bg-secondary-container text-on-secondary-container" />
        <StatCard label="Active" value={active} icon={Circle} colorClass="bg-amber-100 text-amber-700" />
        <StatCard label="Closed" value={closed} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-700" />
        <StatCard label="Auditors Pool" value={auditors.length} icon={Users} colorClass="bg-primary-container text-on-primary-container" />
      </div>

      {/* Cycles Table */}
      <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
          <h3 className="text-sm font-semibold text-on-surface">All Audit Cycles</h3>
          <span className="text-xs text-on-surface-variant">{total} cycle{total !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {['Cycle Name', 'Scope', 'Date Range', 'Auditors', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-on-surface-variant border-b border-outline-variant whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-surface-container-high rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cycles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <ClipboardList className="w-10 h-10 text-on-surface-variant mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium text-on-surface-variant">No audit cycles yet</p>
                    {user?.role === 'admin' && (
                      <p className="text-xs text-on-surface-variant mt-1">Click "New Audit Cycle" to get started.</p>
                    )}
                  </td>
                </tr>
              ) : (
                cycles.map(cycle => (
                  <tr
                    key={cycle.id}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    onClick={() => onSelectCycle(cycle.id)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-on-surface">{cycle.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">by {cycle.createdBy?.name || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium capitalize">
                        {cycle.scope}: {cycle.scopeValue}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                        <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                        <span>{cycle.startDate}</span>
                        <span>→</span>
                        <span>{cycle.endDate}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex -space-x-1.5">
                        {(cycle.auditors || []).slice(0, 4).map(a => (
                          <div
                            key={a.id}
                            title={a.name}
                            className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center ring-2 ring-surface"
                          >
                            {a.name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {(cycle.auditors?.length || 0) > 4 && (
                          <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
                            +{cycle.auditors.length - 4}
                          </div>
                        )}
                        {(!cycle.auditors || cycle.auditors.length === 0) && (
                          <span className="text-xs text-on-surface-variant">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={cycle.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Cycle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-surface w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-on-surface">New Audit Cycle</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Define scope and assign auditors.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                {/* Cycle Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Cycle Name</label>
                  <input
                    required
                    id="audit-cycle-name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all"
                    placeholder="e.g. Q3 2025 IT Assets Audit"
                  />
                </div>

                {/* Scope */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Scope Type</label>
                  <div className="flex gap-3">
                    {['department', 'location'].map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value={s}
                          checked={formData.scope === s}
                          onChange={() => setFormData({ ...formData, scope: s, scopeValue: '' })}
                          className="accent-primary"
                        />
                        <span className="text-sm capitalize text-on-surface">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scope Value */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">
                    {formData.scope === 'department' ? 'Department' : 'Location'}
                  </label>
                  {formData.scope === 'department' ? (
                    <select
                      required
                      id="audit-scope-value"
                      value={formData.scopeValue}
                      onChange={e => setFormData({ ...formData, scopeValue: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer"
                    >
                      <option value="">— Select Department —</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      id="audit-scope-value-text"
                      value={formData.scopeValue}
                      onChange={e => setFormData({ ...formData, scopeValue: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      placeholder="e.g. Floor 3, Warehouse A"
                    />
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">Start Date</label>
                    <input
                      required
                      type="date"
                      id="audit-start-date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface">End Date</label>
                    <input
                      required
                      type="date"
                      id="audit-end-date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                {/* Auditors */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">
                    Assign Auditors
                    <span className="text-on-surface-variant font-normal ml-1">(admins & asset managers)</span>
                  </label>
                  <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-y-auto bg-surface-container-low">
                    {auditors.length === 0 ? (
                      <p className="p-3 text-xs text-on-surface-variant">No eligible auditors found.</p>
                    ) : (
                      auditors.map(a => (
                        <label key={a.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-container-high transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.auditorIds.includes(a.id)}
                            onChange={() => toggleAuditor(a.id)}
                            className="accent-primary rounded"
                          />
                          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center shrink-0">
                            {a.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{a.name}</p>
                            <p className="text-xs text-on-surface-variant capitalize">{a.role?.replace('_', ' ')}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.auditorIds.length > 0 && (
                    <p className="text-xs text-on-surface-variant">
                      {formData.auditorIds.length} auditor(s) selected. All audit items will be initially assigned to the first selected auditor.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="create-audit-cycle-submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
