import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { VATReturn } from '../types';
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

  const fetchReturns = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'vat_returns'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedReturns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VATReturn));

      // Auto-seed 2026-Q2 if not exists
      const hasQ2 = fetchedReturns.some(r => r.period === '2026-Q2');
      if (!hasQ2) {
          const newReturn = {
            userId: user.uid,
            period: '2026-Q2',
            status: 'Draft' as const,
            totalSales: 750000,
            totalVAT: 37500,
            netVAT: 37500,
            dueDate: '2026-07-28',
            createdAt: Timestamp.now()
          };
          const docRef = await addDoc(collection(db, 'vat_returns'), newReturn);
          setReturns([{ id: docRef.id, ...newReturn }, ...fetchedReturns]);
      } else {
        setReturns(fetchedReturns);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'vat_returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      await deleteDoc(doc(db, 'vat_returns', id));
      setReturns(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vat_returns/${id}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading VAT Services...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span>Home</span>
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
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B] w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50">
                <Filter size={14} />
                Filter
              </button>
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
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          ret.status === 'Filed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
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
                        ret.status === 'Filed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {ret.status === 'Filed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
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
                        <button className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors">
                          <RotateCcw size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ret.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
          
          {returns.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No VAT Returns Found</p>
              <button className="mt-4 text-[10px] font-bold text-[#B8860B] hover:underline uppercase">
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
