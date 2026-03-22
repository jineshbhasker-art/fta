import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileText, 
  Mail, 
  CreditCard, 
  User, 
  LogOut,
  ShieldCheck,
  Home,
  LayoutGrid,
  Briefcase,
  ChevronDown,
  FileSearch,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'HOME', path: '/', icon: Home },
    { name: 'VAT', path: '/vat', icon: FileText },
    { name: 'EXCISE TAX', path: '/excise-tax', icon: ShieldCheck },
    { name: 'CORPORATE TAX', path: '/corporate-tax', icon: Briefcase },
    { name: 'MY PAYMENTS', path: '/payments', icon: CreditCard },
    { name: 'MY CORRESPONDENCE', path: '/correspondence', icon: Mail },
    { name: 'USER AUTHORIZATION', path: '/user-authorization', icon: User },
    { name: 'MY AUDIT', path: '/audit', icon: FileSearch },
    { name: 'OTHER SERVICES', path: '/other-services', icon: LayoutGrid },
    { name: 'E-INVOICING', path: '/e-invoicing', icon: FileText },
  ];

  return (
    <aside className="w-72 bg-brand-primary text-white flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-brand-accent/20">
          E
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest uppercase text-white/60">EmaraTax</span>
          <span className="text-sm font-black tracking-tight">Authority Portal</span>
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3 scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
              const isVatActive = item.name === 'VAT' && window.location.pathname.startsWith('/vat');
              return cn(
                "flex items-center gap-3 px-4 py-3.5 transition-all text-[11px] font-bold uppercase tracking-widest rounded-xl group",
                (isActive || isVatActive)
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              );
            }}
          >
            <item.icon size={18} className="group-hover:scale-110 transition-transform" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-white/10 bg-black/20">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest">
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-[11px] font-bold uppercase tracking-widest mt-2"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
