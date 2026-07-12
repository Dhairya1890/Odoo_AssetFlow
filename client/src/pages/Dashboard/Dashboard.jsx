import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  User, 
  Wrench, 
  CalendarClock, 
  ArrowRightLeft, 
  CornerDownLeft,
  Plus,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import apiClient from '../../api/client';
import RegisterAssetModal from '../../components/assets/RegisterAssetModal';
import { useAuthStore } from '../../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    overdueReturns: 0
  });
  const [overdueAssets, setOverdueAssets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiRes, overdueRes, activityRes] = await Promise.all([
          apiClient.get('/dashboard/kpis'),
          apiClient.get('/allocations/overdue'),
          apiClient.get('/activities')
        ]);
        
        if (kpiRes.data?.data?.kpis) {
          setStats(kpiRes.data.data.kpis);
        }
        if (overdueRes.data?.data?.allocations) {
          setOverdueAssets(overdueRes.data.data.allocations.slice(0, 5)); // Just show top 5 on dash
        }
        if (activityRes.data?.data?.logs) {
          setActivities(activityRes.data.data.logs.slice(0, 10)); // Top 10 activities
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-container-padding space-y-stack-lg">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-primary">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">System status and operational overview for today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['admin', 'asset_manager'].includes(user?.role) && (
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant text-primary rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all">
            <CalendarClock className="w-4 h-4" />
            Book Resource
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant text-primary rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all">
            <Wrench className="w-4 h-4" />
            Raise Maintenance
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-gutter">
        {/* Assets Available */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Available</span>
            <CheckCircle className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.assetsAvailable}</div>
        </div>
        
        {/* Assets Allocated */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Allocated</span>
            <User className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.assetsAllocated}</div>
        </div>
        
        {/* Under Maintenance */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Maintenance</span>
            <Wrench className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.maintenanceToday}</div>
          <div className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase">Today</div>
        </div>

        {/* Active Bookings */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Bookings</span>
            <CalendarClock className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.activeBookings}</div>
          <div className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase">Upcoming/Ongoing</div>
        </div>
        
        {/* Pending Transfers */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Transfers</span>
            <ArrowRightLeft className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.pendingTransfers}</div>
          <div className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase">Pending Approval</div>
        </div>
        
        {/* Upcoming Returns */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Overdue</span>
            <CornerDownLeft className="w-5 h-5 text-error" />
          </div>
          <div className="text-3xl font-bold text-error">{stats.overdueReturns}</div>
          <div className="text-[10px] font-bold text-error mt-1 uppercase">Action Required</div>
        </div>
      </div>

      {/* Bento Layout Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Overdue Returns Table */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-error w-5 h-5" />
              <h2 className="text-lg font-bold text-primary">Overdue Returns</h2>
            </div>
            {stats.overdueReturns > 0 && (
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-bold">Action Required</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Asset Tag</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Asset Name</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Assigned To</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Expected</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {overdueAssets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-on-surface-variant font-medium">No overdue assets!</td>
                  </tr>
                ) : overdueAssets.map((alloc) => {
                  const expected = new Date(alloc.expectedReturnDate);
                  const daysOverdue = Math.floor((new Date() - expected) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={alloc.id} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold">{alloc.asset?.assetTag}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">{alloc.asset?.name}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{alloc.user?.name}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{expected.toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-error font-bold text-sm">{daysOverdue} Days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-surface border border-outline-variant rounded-xl flex flex-col h-full max-h-[600px] shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-lg font-bold text-primary">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            {activities.length === 0 ? (
              <p className="text-center text-sm text-on-surface-variant mt-4">No recent activity.</p>
            ) : activities.map((log, idx) => {
              const isLast = idx === activities.length - 1;
              // Format time ago roughly
              const diffMs = new Date() - new Date(log.createdAt);
              const diffMins = Math.floor(diffMs / 60000);
              const timeAgo = diffMins < 60 ? `${diffMins} min ago` : 
                              diffMins < 1440 ? `${Math.floor(diffMins/60)} hr ago` : 
                              `${Math.floor(diffMins/1440)} days ago`;
              
              // Pick an icon based on action
              let Icon = Plus;
              let iconBg = 'bg-secondary-container text-primary';
              if (log.action.includes('MAINTENANCE')) { Icon = Wrench; iconBg = 'bg-orange-100 text-orange-700'; }
              else if (log.action.includes('ALLOCAT') || log.action.includes('RETURN') || log.action.includes('TRANSFER')) { Icon = ArrowRightLeft; iconBg = 'bg-blue-100 text-blue-700'; }
              else if (log.action.includes('BOOK')) { Icon = CalendarClock; iconBg = 'bg-purple-100 text-purple-700'; }
              else if (log.action.includes('USER')) { Icon = User; iconBg = 'bg-slate-100 text-slate-700'; }

              return (
                <div key={log.id} className="flex gap-4 relative">
                  {!isLast && <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-outline-variant"></div>}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${iconBg}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface">
                      <span className="font-bold">{log.user?.name || 'System'}</span> performed <span className="font-bold text-primary">{log.action}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">{timeAgo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Asset Allocation Trends (Visual Extra) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface border border-outline-variant rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-medium text-primary">System Health</h3>
              <p className="text-xs text-on-surface-variant mt-1">Real-time status of asset monitoring nodes.</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <div className="h-32 flex items-end gap-1">
            <div className="flex-1 bg-primary/10 h-[60%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/10 h-[80%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/10 h-[45%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary h-[90%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/10 h-[70%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/10 h-[55%] rounded-t-sm"></div>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium">Inventory Optimization</h3>
            <p className="text-on-primary/70 text-sm mt-2">Our AI suggests decommissioning 12 legacy workstations to save $4,200/mo in support costs.</p>
            <button className="mt-6 px-4 py-2 bg-on-primary text-primary rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
              Review Suggestion
            </button>
          </div>
        </div>
      </div>
      
      <RegisterAssetModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSuccess={() => {}}
      />
    </div>
  );
}
