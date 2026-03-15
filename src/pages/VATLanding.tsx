import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Search, 
  Star, 
  FileText, 
  ChevronDown,
  LayoutGrid,
  Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VATLanding: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Returns & Refunds',
      items: [
        {
          title: 'My Filings',
          description: 'VAT Return',
          status: '1 Not filed',
          path: '/vat/my-filings'
        },
        {
          title: 'VAT Services',
          description: 'Manage all VAT related services',
          status: 'Active',
          path: '/vat/services'
        },
        {
          title: 'VAT 311',
          description: 'VAT Refunds',
          status: '0 Total Requests',
          path: '/vat/refund'
        },
        {
          title: 'VAT 301',
          description: 'Import Declarations Form for VAT Payment',
          status: null,
          path: '#'
        }
      ]
    },
    {
      title: 'Reporting & Analytics',
      items: [
        {
          title: 'VAT Dashboard',
          description: 'View VAT analytics and reports',
          status: 'Updated today',
          path: '/vat/reporting'
        }
      ]
    },
    {
      title: 'VAT Other Services',
      items: [
        {
          title: 'VAT Administrative Exceptions',
          description: null,
          status: '0 Total Requests',
          path: '#'
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">VAT</span>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={14} />
          </div>
          <input 
            type="text" 
            placeholder="Search"
            className="w-full pl-10 pr-32 py-2.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B]"
          />
          <button className="absolute right-0 top-0 bottom-0 px-8 bg-[#0A192F] text-white text-[11px] font-bold uppercase rounded-r hover:bg-[#152A4A] transition-colors">
            Search
          </button>
        </div>

        {/* My Favorites */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase">My Favorites</h3>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </section>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.title}>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">{section.title}</h3>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.items.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col group hover:border-[#B8860B] transition-all">
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-300">
                        <FileText size={20} />
                      </div>
                      <Star size={14} className="text-gray-300 hover:text-[#B8860B] cursor-pointer" />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#0A192F] uppercase mb-1">{item.title}</h4>
                    {item.description && <p className="text-[10px] text-gray-500 mb-2">{item.description}</p>}
                    {item.status && <p className="text-[9px] font-bold text-[#B8860B] uppercase">{item.status}</p>}
                  </div>
                    <div className="flex border-t border-gray-100">
                      <button 
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        className="flex-1 py-2 bg-[#0A192F] text-white text-[10px] font-bold uppercase hover:bg-[#152A4A] transition-colors"
                      >
                        View All
                      </button>
                      {(item.title === 'My Filings' || item.title === 'VAT 311' || item.title === 'VAT Administrative Exceptions' || item.title === 'VAT 301') && (
                        <button 
                          onClick={() => navigate('/vat/new')}
                          className="flex-1 py-2 bg-white text-[#B8860B] text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors border-l border-gray-100"
                        >
                          Create New
                        </button>
                      )}
                    </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default VATLanding;
