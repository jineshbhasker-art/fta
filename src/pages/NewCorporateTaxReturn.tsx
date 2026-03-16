import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { ChevronRight, Save, Send, AlertCircle } from 'lucide-react';

const NewCorporateTaxReturn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountingPeriod: '',
    taxableIncome: '',
    taxAmount: '',
    dueDate: ''
  });

  const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Filed') => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const ctReturn = {
        userId: user.uid,
        accountingPeriod: formData.accountingPeriod,
        taxableIncome: parseFloat(formData.taxableIncome) || 0,
        taxAmount: parseFloat(formData.taxAmount) || 0,
        status,
        dueDate: formData.dueDate,
        filedAt: status === 'Filed' ? new Date().toISOString() : null,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'corporate_tax_returns'), ctReturn);
      navigate('/corporate-tax');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'corporate_tax_returns');
      setError('Failed to save Corporate Tax return. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/corporate-tax')}>Corporate Tax</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">New Corporate Tax Return</span>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0A192F] uppercase">File New Corporate Tax Return</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accounting Period</label>
                <input
                  type="text"
                  placeholder="e.g. 2025"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8860B] transition-all"
                  value={formData.accountingPeriod}
                  onChange={(e) => setFormData({ ...formData, accountingPeriod: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8860B] transition-all"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Taxable Income (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8860B] transition-all"
                  value={formData.taxableIncome}
                  onChange={(e) => setFormData({ ...formData, taxableIncome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Corporate Tax Amount (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8860B] transition-all font-bold text-[#B8860B]"
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/corporate-tax')}
              className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all uppercase tracking-wider disabled:opacity-50"
            >
              <Save size={18} />
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Filed')}
              className="flex items-center gap-2 px-8 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-bold hover:bg-[#9A6F09] transition-all uppercase tracking-wider disabled:opacity-50"
            >
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCorporateTaxReturn;
