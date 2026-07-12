import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeAllocations: 0,
    pendingMaintenance: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/assets');
        const assets = response.data?.data?.assets || [];
        setStats({
          totalAssets: assets.length,
          activeAllocations: assets.filter(a => a.status === 'ALLOCATED').length,
          pendingMaintenance: assets.filter(a => a.status === 'IN_MAINTENANCE').length,
          alerts: 2 // Mock
        });
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
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Register Asset
          </button>
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
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Available</span>
            <CheckCircle className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">{stats.totalAssets}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">
            +12% vs last month
          </div>
        </div>
        
        {/* Assets Allocated */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Allocated</span>
            <User className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">{stats.activeAllocations}</div>
          <div className="text-xs text-on-surface-variant mt-1">66% utilization rate</div>
        </div>
        
        {/* Under Maintenance */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Maintenance</span>
            <Wrench className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">{stats.pendingMaintenance}</div>
          <div className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" />
            3 critical delays
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Bookings</span>
            <CalendarClock className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">118</div>
          <div className="text-xs text-on-surface-variant mt-1">Next 24 hours</div>
        </div>
        
        {/* Pending Transfers */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Transfers</span>
            <ArrowRightLeft className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">24</div>
          <div className="text-xs text-on-surface-variant mt-1">Pending approval</div>
        </div>
        
        {/* Upcoming Returns */}
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Returns</span>
            <CornerDownLeft className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="text-3xl font-medium text-primary">63</div>
          <div className="text-xs text-on-surface-variant mt-1">Due today</div>
        </div>
      </div>

      {/* Bento Layout Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Overdue Returns Table */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-error w-5 h-5" />
              <h2 className="text-lg font-medium text-primary">Overdue Returns</h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-bold">Action Required</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-3 text-sm font-medium text-on-surface-variant border-b border-outline-variant">Asset Tag</th>
                  <th className="px-6 py-3 text-sm font-medium text-on-surface-variant border-b border-outline-variant">Asset Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-on-surface-variant border-b border-outline-variant">Assigned To</th>
                  <th className="px-6 py-3 text-sm font-medium text-on-surface-variant border-b border-outline-variant">Expected</th>
                  <th className="px-6 py-3 text-sm font-medium text-on-surface-variant border-b border-outline-variant">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {[1,2,3].map((i) => (
                  <tr key={i} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">AST-409{i}</td>
                    <td className="px-6 py-4 text-sm font-medium">MacBook Pro 16"</td>
                    <td className="px-6 py-4 text-sm">Sarah Jenkins</td>
                    <td className="px-6 py-4 text-sm">Oct 24, 2023</td>
                    <td className="px-6 py-4 text-error font-bold text-sm">5 Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-auto p-4 border-t border-outline-variant bg-surface-container-lowest">
            <button className="text-primary text-sm font-medium flex items-center gap-2 hover:underline">
              View all overdue assets <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-surface border border-outline-variant rounded-xl flex flex-col h-full max-h-[600px]">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-lg font-medium text-primary">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
             <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-outline-variant"></div>
              <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0 z-10">
                <Plus className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-sm text-on-surface"><strong>AST-5521</strong> registered by Alex Chen.</p>
                <p className="text-xs text-on-surface-variant mt-1">2 minutes ago</p>
              </div>
            </div>
             <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-outline-variant"></div>
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 z-10">
                <Wrench className="w-3 h-3 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-on-surface">Maintenance request for <strong>H-Vehicle-09</strong>.</p>
                <p className="text-xs text-on-surface-variant mt-1">45 minutes ago</p>
              </div>
            </div>
             <div className="flex gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 z-10">
                <User className="w-3 h-3 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-on-surface">New user <strong>Jordan Smith</strong> added.</p>
                <p className="text-xs text-on-surface-variant mt-1">3 hours ago</p>
              </div>
            </div>
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
    </div>
  );
}
