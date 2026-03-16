import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Info,
  AlertCircle,
  Download,
  FileText,
  Printer,
  ChevronRight
} from 'lucide-react';

const VATReturnDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Sales');
  const [loading, setLoading] = useState(true);
  const [returnDetails, setReturnDetails] = useState<any>(null);

  // Screenshot data mapping
  const screenshotData: Record<string, any> = {
    'sc1': { vatRef: '230010165962', netVAT: 25979.01, period: '01/12/2025 - 28/02/2026', status: 'Submitted', totalSales: 519580.20, totalExpenses: 0 },
    'sc2': { vatRef: '230009650203', netVAT: 22298.81, period: '01/09/2025 - 30/11/2025', status: 'Submitted', totalSales: 445976.20, totalExpenses: 0 },
    'sc3': { vatRef: '230009007872', netVAT: 6162.28, period: '01/06/2025 - 31/08/2025', status: 'Submitted', totalSales: 123245.60, totalExpenses: 0 },
    'sc4': { vatRef: '230008349468', netVAT: 6646.98, period: '01/03/2025 - 31/05/2025', status: 'Submitted', totalSales: 132939.60, totalExpenses: 0 },
    'sc5': { vatRef: '230007923042', netVAT: 24989.01, period: '01/12/2024 - 28/02/2025', status: 'Submitted', totalSales: 499780.20, totalExpenses: 0 },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      if (screenshotData[id]) {
        setReturnDetails(screenshotData[id]);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'vat_returns', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReturnDetails(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching VAT return:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Return Details...</div>;
  if (!returnDetails) return <div className="flex items-center justify-center h-screen">Return not found.</div>;

  const sections = [
    { id: 'Sales', title: 'VAT on Sales/Outputs' },
    { id: 'Expenses', title: 'VAT on Expenses/Inputs' },
    { id: 'NetDue', title: 'Net VAT Due' },
    { id: 'Declaration', title: 'Review & Declaration' }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat/services')}>VAT Services</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">VAT 201 Return Detail</span>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vat/services')} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#0A192F] uppercase">VAT 201 Return Detail</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                Filing for Period: {returnDetails.period} | VAT Ref: {returnDetails.vatRef}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">
              <Printer size={14} />
              Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#B8860B] text-white rounded text-[10px] font-bold hover:bg-[#9A6F09]">
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Header Info Card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="grid grid-cols-6 divide-x divide-gray-100">
            <div className="p-3 bg-[#0A192F] text-white flex items-center gap-2">
              <FileText size={16} />
              <span className="text-[10px] font-bold uppercase">Filing Status</span>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Current Status:</p>
              <span className={cn(
                "px-2 py-0.5 rounded-[4px] font-bold uppercase text-[8px]",
                returnDetails.status === 'Submitted' || returnDetails.status === 'Filed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              )}>
                {returnDetails.status || 'Draft'}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Period:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{returnDetails.period}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Due Date:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{returnDetails.dueDate || '30 Mar 2026'}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Total Sales (AED):</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{(returnDetails.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-[#B8860B]/10">
              <p className="text-[8px] font-bold text-[#B8860B] uppercase">Net VAT Payable:</p>
              <p className="text-[10px] font-black text-[#B8860B]">{(returnDetails.netVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  "px-6 py-3 text-[10px] font-bold uppercase transition-all border-b-2",
                  activeTab === s.id 
                    ? 'border-[#B8860B] text-[#B8860B] bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'Sales' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 rounded border border-blue-100 flex gap-3 text-blue-800 text-[11px]">
                  <Info size={16} className="shrink-0" />
                  <p>Details of all supplies of goods and services made during this tax period.</p>
                </div>
                
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-left font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">Amount (AED)</th>
                      <th className="pb-3 text-right">VAT Amount (AED)</th>
                      <th className="pb-3 text-right">Adjustment (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Standard rated supplies in Abu Dhabi', amount: returnDetails.totalSales || 0, vat: (returnDetails.totalSales || 0) * 0.05 },
                      { label: 'Standard rated supplies in Dubai', amount: 0, vat: 0 },
                      { label: 'Standard rated supplies in Sharjah', amount: 0, vat: 0 },
                      { label: 'Supplies subject to the reverse charge provisions', amount: 0, vat: 0 },
                      { label: 'Zero rated supplies', amount: 0, vat: 0 },
                      { label: 'Exempt supplies', amount: 0, vat: 0 }
                    ].map((item) => (
                      <tr key={item.label} className="hover:bg-gray-50/50">
                        <td className="py-3 font-medium text-gray-700">{item.label}</td>
                        <td className="py-3 text-right text-gray-600">{(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right font-bold text-[#0A192F]">{(item.vat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right text-gray-400">0.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'NetDue' && (
              <div className="max-w-2xl mx-auto py-8 space-y-8">
                <div className="bg-gray-50 p-8 rounded border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Total Output Tax</span>
                    <span className="text-lg font-bold text-[#0A192F]">AED {(returnDetails.netVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Total Input Tax Recoverable</span>
                    <span className="text-lg font-bold text-[#0A192F]">AED 0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">Net VAT Due</span>
                    <span className="text-2xl font-black text-[#B8860B]">AED {(returnDetails.netVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="p-4 border border-orange-100 bg-orange-50 rounded flex gap-4">
                  <AlertCircle className="text-orange-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-[11px] font-bold text-orange-900 uppercase">Profit Margin Scheme</h4>
                    <p className="text-[10px] text-orange-800 mt-1">Are you entitled to use the Profit Margin Scheme? If yes, please ensure you have maintained all required records.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Declaration' && (
              <div className="max-w-3xl mx-auto py-8 space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[11px] font-bold text-[#0A192F] uppercase border-b border-gray-100 pb-2">Taxable Person Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Name</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">TRN</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">{returnDetails.vatRef || '100234567890003'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Address</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">Business Bay, Dubai, UAE</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-gray-100 rounded bg-gray-50/50 space-y-6">
                  <h3 className="text-[11px] font-bold text-[#0A192F] uppercase text-center">Declaration and Authorized Signature</h3>
                  <p className="text-[10px] text-gray-500 text-center italic">
                    I hereby certify that the information provided in this return is true, correct, and complete to the best of my knowledge and belief.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Authorized Signatory</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">Mohammad Shafiulalam</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Date of Declaration</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">{returnDetails.filedAt ? new Date(returnDetails.filedAt).toLocaleDateString() : format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATReturnDetail;
