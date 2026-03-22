import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VATReturn } from '../types';
import { dataService } from '../services/dataService';
import { 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  FileText,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';

const VATServices: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [returns, setReturns] = useState<VATReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('VAT Returns');
  const [activeSubTab, setActiveSubTab] = useState('VAT Returns');

  const mainTabs = [
    'VAT Returns', 
    'VAT Refund', 
    'VAT De-registration', 
    'VAT Registration Amendment', 
    'VAT Voluntary Disclosure', 
    'VAT 311', 
    'VAT 312'
  ];

  const subTabs = [
    'VAT Returns',
    'VAT 201 - New VAT Return',
    'VAT 201 - Submitted VAT Returns'
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReturns = async () => {
    if (!user) return;
    try {
      const data = await dataService.getVATReturns();
      setReturns(data as any);
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [user]);

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.period.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ret.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      await dataService.deleteVATReturn(id);
      setReturns(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting return:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading VAT Services...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="text-[#B8860B]">VAT Services</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">VAT Services</h1>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-[#B8860B] text-[#B8860B]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-4">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                activeSubTab === tab 
                  ? 'bg-[#0A192F] text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B] w-64"
                />
              </div>
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Filed">Filed</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50">
                <Download size={14} />
                Export
              </button>
              <button 
                onClick={() => navigate('/vat/new')}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#B8860B] text-white rounded text-[11px] font-bold hover:bg-[#9A6F09] transition-all"
              >
                <Plus size={14} />
                Add New VAT Return
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Tax Period</th>
                  <th className="py-3 px-4">Reference Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Sales (AED)</th>
                  <th className="py-3 px-4">Total VAT (AED)</th>
                  <th className="py-3 px-4">Net VAT (AED)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          ret.status === 'Filed' || ret.status === 'Submitted' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          <FileText size={16} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900">{ret.period}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[11px] font-mono text-gray-600">
                      {ret.id.substring(0, 12).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit ${
                        ret.status === 'Filed' || ret.status === 'Submitted'
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {ret.status === 'Filed' || ret.status === 'Submitted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[11px] font-bold text-gray-900">
                      {(ret.totalSales || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-[11px] font-bold text-gray-900">
                      {(ret.totalVAT || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-[11px] font-bold text-[#B8860B]">
                      {(ret.netVAT || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/vat/${ret.id}`)}
                          className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors"
                          title="View Details"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ret.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-black transition-colors">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReturns.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No VAT Returns Found</p>
              <button 
                onClick={() => navigate('/vat/new')}
                className="mt-4 text-[10px] font-bold text-[#B8860B] hover:underline uppercase"
              >
                Start your first filing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VATServices;
