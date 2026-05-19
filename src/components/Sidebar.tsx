import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  LogOut, 
  Settings, 
  FileText,
  ParkingCircle
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/check-in', icon: Car, label: 'Check-In' },
  { path: '/check-out', icon: LogOut, label: 'Check-Out' },
  { path: '/rate-settings', icon: Settings, label: 'Pengaturan Tarif' },
  { path: '/reports', icon: FileText, label: 'Laporan' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-amber-500/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ParkingCircle className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ParkirPro</h1>
            <p className="text-xs text-amber-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-500/20">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500">© 2024 ParkirPro</p>
          <p className="text-xs text-amber-400 mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}