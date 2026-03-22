import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const VATRefund: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Refund Requests');
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRefunds = async () => {
      if (!user) return;
      try {
        const data = await dataService.getVATRefunds();
        setRefunds(data);
      } catch (err) {
        console.error('Error fetching refunds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} />
        <span className="text-[#B8860B]">VAT Refund</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">VAT Refund</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded text-[11px] font-bold hover:bg-[#9A6F09] transition-all">
            <Plus size={14} />
            New Refund Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['Refund Requests', 'Refund History'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-[#B8860B] text-[#B8860B]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search requests..."
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B] w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50">
                <Filter size={14} />
                Filter
              </button>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50">
              <Download size={14} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Tax Period</th>
                  <th className="py-3 px-4">Amount (AED)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 font-bold uppercase">Loading...</td></tr>
                ) : refunds.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 font-bold uppercase">No requests found</td></tr>
                ) : (
                  refunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-[11px] font-bold text-gray-900">{ref.id}</td>
                      <td className="py-4 px-4 text-[11px] text-gray-600">{ref.period}</td>
                      <td className="py-4 px-4 text-[11px] font-bold text-gray-900">{(ref.amount || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit ${
                          ref.status === 'Approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {ref.status === 'Approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[11px] text-gray-600">{ref.date}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-[10px] font-bold text-[#B8860B] hover:underline uppercase">View Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-blue-600 shrink-0" size={18} />
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-blue-900 uppercase">VAT Refund Information</h4>
            <p className="text-[10px] text-blue-700 leading-relaxed">
              You can request a VAT refund if your input tax exceeds your output tax for a given period. 
              Refund requests are typically processed within 20 business days. 
              Please ensure all supporting documentation is ready if requested by the FTA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATRefund;
