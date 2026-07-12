import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, AlertTriangle, TrendingUp, Activity, Users, CalendarDays, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    utilization: [],
    maintenance: [],
    departments: [],
    overdue: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [utilRes, maintRes, deptRes, overdueRes] = await Promise.all([
        apiClient.get('/reports/utilization'),
        apiClient.get('/reports/maintenance-frequency'),
        apiClient.get('/reports/department-summary'),
        apiClient.get('/reports/overdue-assets')
      ]);

      // Format utilization for Pie Chart
      const rawUtil = utilRes.data?.data?.rows || [];
      const utilData = rawUtil.reduce((acc, curr) => {
        const status = curr.status.replace('_', ' ').toUpperCase();
        const existing = acc.find(item => item.name === status);
        if (existing) {
          existing.value += parseInt(curr.count);
        } else {
          acc.push({ name: status, value: parseInt(curr.count) });
        }
        return acc;
      }, []);

      // Format maintenance for Bar Chart
      const rawMaint = maintRes.data?.data?.rows || [];
      const maintData = rawMaint.slice(0, 10).map(item => ({
        name: item.asset?.assetTag || 'Unknown',
        fullName: item.asset?.name || 'Unknown Asset',
        incidents: parseInt(item.count)
      }));

      // Format department summary for Stacked Bar Chart
      const rawDept = deptRes.data?.data?.rows || [];
      const deptMap = {};
      rawDept.forEach(item => {
        const deptName = item.department?.name || 'Unassigned';
        if (!deptMap[deptName]) {
          deptMap[deptName] = { name: deptName, allocated: 0, available: 0, maintenance: 0 };
        }
        const status = item.status.toLowerCase();
        if (status.includes('allocate')) deptMap[deptName].allocated += parseInt(item.count);
        else if (status.includes('available')) deptMap[deptName].available += parseInt(item.count);
        else deptMap[deptName].maintenance += parseInt(item.count);
      });

      setData({
        utilization: utilData,
        maintenance: maintData,
        departments: Object.values(deptMap),
        overdue: overdueRes.data?.data?.allocations || []
      });
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async (type) => {
    try {
      toast.loading(`Exporting ${type} report...`, { id: 'export' });
      const response = await apiClient.get(`/reports/export?type=${type}`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded successfully', { id: 'export' });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report', { id: 'export' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  return (
    <div className="p-container-padding space-y-stack-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reports & Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Actionable operational insights and asset intelligence.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2 flex flex-col gap-1">
                <button onClick={() => handleExport('utilization')} className="text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high rounded-md">Utilization Report</button>
                <button onClick={() => handleExport('department-summary')} className="text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high rounded-md">Department Summary</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        
        {/* Asset Utilization Pie Chart */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">Global Asset Utilization</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.utilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.utilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2f', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Frequency Bar Chart */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-primary">Top 10 High-Maintenance Assets</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.maintenance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e1e2f', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="incidents" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Allocation Stacked Bar */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-primary">Department-wise Asset Distribution</h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e1e2f', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="allocated" stackId="a" fill="#3b82f6" name="Allocated" radius={[0, 0, 4, 4]} />
                <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
                <Bar dataKey="maintenance" stackId="a" fill="#ef4444" name="Under Maintenance" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Actionable Insights Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-error w-5 h-5" />
            <h2 className="text-lg font-bold text-primary">Assets Requiring Immediate Attention (Overdue Returns)</h2>
          </div>
          <span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-1 rounded">
            {data.overdue.length} Action Items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Asset Tag</th>
                <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Asset Name</th>
                <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Expected Return</th>
                <th className="px-6 py-3 text-xs font-bold uppercase text-on-surface-variant border-b border-outline-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {data.overdue.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-on-surface-variant font-medium">All assets are currently healthy and returned on time!</td>
                </tr>
              ) : data.overdue.map((alloc) => {
                const expected = new Date(alloc.expectedReturnDate);
                const daysOverdue = Math.floor((new Date() - expected) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={alloc.id} className="hover:bg-red-50/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold">{alloc.asset?.assetTag}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{alloc.asset?.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{expected.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-error font-bold text-sm bg-error/10 px-2 py-1 rounded">
                        Overdue by {daysOverdue} days
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
