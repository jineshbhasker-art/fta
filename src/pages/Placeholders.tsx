import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">{title}</span>
      </div>
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
          <FileText size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] uppercase">{title}</h2>
          <p className="text-sm text-gray-500 mt-2">This service is currently being updated. Please check back later.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-2 bg-[#0A192F] text-white text-[11px] font-bold uppercase rounded hover:bg-[#152A4A] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export const ExciseTax = () => <PlaceholderPage title="Excise Tax" />;
export const UserAuthorization = () => <PlaceholderPage title="User Authorization" />;
export const Audit = () => <PlaceholderPage title="Audit" />;
export const EInvoicing = () => <PlaceholderPage title="e-Invoicing" />;
