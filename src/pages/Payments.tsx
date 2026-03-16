import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { Payment } from '../types';
import { 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  const outstanding = payments.filter(p => p.status === 'Outstanding');
  const totalOutstanding = outstanding.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-gray-500">View outstanding balances and payment history.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A6F09] transition-all">
          <Plus size={18} />
          Make Advance Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A192F] text-white p-6 rounded-2xl shadow-xl">
          <p className="text-sm text-gray-400 mb-1">Total Outstanding</p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">AED {(totalOutstanding || 0).toLocaleString()}</h2>
          <button className="w-full py-3 bg-[#B8860B] rounded-xl font-bold text-sm hover:bg-[#9A6F09] transition-all">
            Pay All Now
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Funds Available</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">AED 0.00</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Installment Plans</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">0 Active</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Paid Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-gray-500">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-gray-500">No payment records found.</td></tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                        <CreditCard size={18} />
                      </div>
                      <span className="font-bold text-gray-900">{pay.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">AED {(pay.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                      pay.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      pay.status === 'Outstanding' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {pay.status === 'Paid' ? <CheckCircle2 size={10} /> : 
                       pay.status === 'Outstanding' ? <AlertCircle size={10} /> : <Clock size={10} />}
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pay.dueDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {pay.paidAt ? format(new Date(pay.paidAt), 'dd MMM yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#B8860B] transition-colors">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
