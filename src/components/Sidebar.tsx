import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mail, 
  CreditCard, 
  User, 
  LogOut,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Home,
  LayoutGrid,
  Briefcase,
  ChevronDown,
  FileSearch
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

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
    <aside className="w-64 bg-[#F2F2F2] border-r border-gray-200 flex flex-col shrink-0">
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {/* Home Item */}
        <NavLink
          to="/"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 transition-colors text-[10px] font-bold uppercase tracking-wider",
            isActive && !window.location.search.includes('entity=')
              ? "bg-[#B8860B] text-white shadow-sm" 
              : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Home size={16} />
          <span>HOME</span>
        </NavLink>

        {/* Active Entity Section */}
        <div className="bg-[#B8860B] text-white px-4 py-3 flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold opacity-80 uppercase">MOHAMMAD</span>
            <span className="text-[10px] font-bold leading-tight">
              SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C
            </span>
          </div>
          <ChevronDown size={14} />
        </div>

        {/* Sub-nav items */}
        {navItems.slice(1).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
              const isVatActive = item.name === 'VAT' && window.location.pathname.startsWith('/vat');
              return cn(
                "flex items-center gap-3 px-4 py-2.5 transition-colors text-[10px] font-bold uppercase tracking-wider",
                (isActive || isVatActive)
                  ? "bg-[#B8860B] text-white shadow-sm" 
                  : "text-gray-700 hover:bg-gray-200"
              );
            }}
          >
            <item.icon size={14} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-600 hover:bg-red-50 transition-colors text-[10px] font-bold uppercase"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
