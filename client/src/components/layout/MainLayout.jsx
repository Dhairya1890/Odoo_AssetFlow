import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Building2,
  LayoutDashboard, 
  Box, 
  ArrowRightLeft, 
  CalendarClock, 
  Wrench, 
  ClipboardCheck, 
  PieChart, 
  Settings,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Assets', path: '/assets', icon: Box },
  { name: 'Allocations', path: '/allocations', icon: ArrowRightLeft },
  { name: 'Bookings', path: '/bookings', icon: CalendarClock },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Audits', path: '/audits', icon: ClipboardCheck },
  { name: 'Reports', path: '/reports', icon: PieChart },
  { name: 'Org Setup', path: '/settings', icon: Settings },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen">
      {/* SideNavBar (Mini Sidebar Pattern) */}
      <aside className="flex flex-col fixed left-0 top-0 h-screen z-50 bg-surface border-r border-outline-variant transition-all duration-300 ease-in-out w-sidebar hover:w-sidebar-expanded group overflow-hidden">
        <div className="flex items-center h-16 px-4 shrink-0 overflow-hidden">
          <Building2 className="text-primary w-8 h-8 shrink-0" />
          <span className="ml-4 text-xl font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">AssetFlow</span>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.filter(item => {
            if (user?.role === 'employee') {
              return ['Dashboard', 'Assets', 'Bookings', 'Maintenance'].includes(item.name);
            }
            if (user?.role === 'department_head') {
              return ['Dashboard', 'Assets', 'Allocations', 'Bookings', 'Maintenance'].includes(item.name);
            }
            if (user?.role === 'asset_manager') {
              return true;
            }
            return true;
          }).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center h-10 px-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-secondary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="ml-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant shrink-0 cursor-pointer hover:bg-surface-container-high transition-colors" onClick={handleLogout}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-on-surface-variant truncate">Sign out</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-sidebar flex flex-col min-h-screen transition-all duration-300">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full h-16 px-gutter bg-surface border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors" 
                placeholder="Search assets, users, or tickets..." 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-2 hidden sm:block"></div>
            <span className="text-lg font-bold text-primary hidden sm:block">AssetFlow ERP</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
