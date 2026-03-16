import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { CorporateTaxReturn } from '../types';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';

const CorporateTax: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [recentReturns, setRecentReturns] = useState<CorporateTaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const filings = [
    { period: '2024', status: 'Active', trn: '200987654321001', dueDate: '2025-09-30' }
  ];

  const fetchCTReturns = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'corporate_tax_returns'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const fetchedReturns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CorporateTaxReturn));
      setRecentReturns(fetchedReturns);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'corporate_tax_returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCTReturns();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'corporate_tax_returns', id));
      setShowConfirmDelete(null);
      showToast('Corporate tax return deleted successfully', 'success');
      fetchCTReturns();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `corporate_tax_returns/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase">Corporate Tax</h1>
          <p className="text-gray-500">Manage your corporate tax registrations, filings, and exemptions.</p>
        </div>
        <button 
          onClick={() => navigate('/corporate-tax/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A6F09] transition-all uppercase"
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
            <Briefcase size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filings</h3>
          <p className="text-sm text-gray-500 mb-4">Manage your annual corporate tax returns.</p>
          <button className="text-sm font-bold text-[#B8860B] hover:underline">View Filings</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl w-fit mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Refunds</h3>
          <p className="text-sm text-gray-500 mb-4">Track and request corporate tax refunds.</p>
          <button className="text-sm font-bold text-[#B8860B] hover:underline">Track Refunds</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Exemptions</h3>
          <p className="text-sm text-gray-500 mb-4">Apply for corporate tax exemptions.</p>
          <button className="text-sm font-bold text-[#B8860B] hover:underline">Manage Exemptions</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Active Registrations</h2>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">Tax Period</th>
                <th className="pb-4">TRN</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Next Filing Due</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filings.map((f) => (
                <tr key={f.period} className="group">
                  <td className="py-4 font-bold text-gray-900">{f.period}</td>
                  <td className="py-4 text-sm text-gray-600 font-mono">{f.trn}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                      {f.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-500">{f.dueDate}</td>
                  <td className="py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#B8860B] transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Corporate Tax Returns</h2>
          <button className="text-sm font-bold text-[#B8860B] hover:underline">View All</button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm">Loading returns...</div>
          ) : recentReturns.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">No recent Corporate Tax returns found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-4">Accounting Period</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Tax Amount</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentReturns.map((ret) => (
                  <tr key={ret.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-gray-900">{ret.accountingPeriod}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                        ret.status === 'Filed' ? 'bg-green-100 text-green-700' : 
                        ret.status === 'Draft' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ret.status === 'Filed' ? <CheckCircle2 size={10} /> : 
                         ret.status === 'Draft' ? <Clock size={10} /> : <AlertCircle size={10} />}
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-gray-900">
                      AED {(ret.taxAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#B8860B] transition-colors">
                          <ArrowUpRight size={18} />
                        </button>
                        {ret.status === 'Draft' && (
                          <button 
                            onClick={() => setShowConfirmDelete(ret.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-sm font-bold uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Are you sure you want to delete this Corporate Tax return draft? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(showConfirmDelete)}
                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateTax;
