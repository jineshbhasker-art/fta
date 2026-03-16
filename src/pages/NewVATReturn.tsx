import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { 
  ChevronRight, 
  Save, 
  Send, 
  AlertCircle, 
  Info, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle2,
  ChevronLeft,
  HelpCircle,
  Clock,
  FileText,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NewVATReturn: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0: Instructions, 1: VAT Return, 2: Review
  const [editId, setEditId] = useState<string | null>(null);

  // Form State matching Screenshot 1
  const [formData, setFormData] = useState({
    // Header Info
    vatRef: '',
    periodFrom: '',
    periodTo: '',
    status: 'Draft' as 'Draft' | 'Filed',
    period: '01/12/2025 - 28/02/2026',
    stagger: 'Stagger 2 - Quarterly (Mar to Feb)',
    dueDate: '30/03/2026',
    taxYearEnd: '28/02/2026',

    // Section 1: VAT on Sales
    sales: {
      standardRated: {
        abuDhabi: { amount: 0, vat: 0, adjustment: 0 },
        dubai: { amount: 0, vat: 0, adjustment: 0 },
        sharjah: { amount: 0, vat: 0, adjustment: 0 },
        ajman: { amount: 0, vat: 0, adjustment: 0 },
        ummAlQuwain: { amount: 0, vat: 0, adjustment: 0 },
        rasAlKhaimah: { amount: 0, vat: 0, adjustment: 0 },
        fujairah: { amount: 0, vat: 0, adjustment: 0 },
      },
      touristRefunds: { amount: 0, vat: 0 },
      reverseCharge: { amount: 0, vat: 0 },
      zeroRated: { amount: 0 },
      exempt: { amount: 0 },
      goodsImported: { amount: 519580.13, vat: 25979.01 }, // Pre-filled as in screenshot
      adjustmentsImports: { amount: 0, vat: 0 },
    },

    // Section 2: VAT on Expenses
    expenses: {
      standardRated: { amount: 0, vat: 0, adjustment: 0 },
      reverseCharge: { amount: 0, vat: 0 },
    },

    // Section 4: Profit Margin Scheme
    profitMarginScheme: 'No'
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setEditId(id);
      fetchReturn(id);
      setStep(1); // Go straight to form if editing
    }
  }, [location]);

  const fetchReturn = async (id: string) => {
    if (id === 'sc1') {
      setFormData({
        ...formData,
        vatRef: '230010165962',
        periodFrom: '01/12/2025',
        periodTo: '28/02/2026',
        sales: {
          ...formData.sales,
          goodsImported: { amount: 519580.13, vat: 25979.01 }
        },
        status: 'Draft'
      });
      return;
    }
    try {
      const docRef = doc(db, 'vat_returns', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.formData) {
          setFormData(data.formData);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `vat_returns/${id}`);
    }
  };

  // Calculations
  const calculateSalesTotals = () => {
    let totalAmount = 0;
    let totalVat = 0;
    
    // Sum standard rated
    Object.values(formData.sales.standardRated).forEach((emirate: any) => {
      totalAmount += emirate.amount;
      totalVat += emirate.vat;
    });

    totalAmount += formData.sales.touristRefunds.amount;
    totalVat += formData.sales.touristRefunds.vat;
    
    totalAmount += formData.sales.reverseCharge.amount;
    totalVat += formData.sales.reverseCharge.vat;
    
    totalAmount += formData.sales.zeroRated.amount;
    totalAmount += formData.sales.exempt.amount;
    
    totalAmount += formData.sales.goodsImported.amount;
    totalVat += formData.sales.goodsImported.vat;
    
    totalAmount += formData.sales.adjustmentsImports.amount;
    totalVat += formData.sales.adjustmentsImports.vat;

    return { totalAmount, totalVat };
  };

  const calculateExpensesTotals = () => {
    const totalAmount = formData.expenses.standardRated.amount + formData.expenses.reverseCharge.amount;
    const totalVat = formData.expenses.standardRated.vat + formData.expenses.reverseCharge.vat;
    return { totalAmount, totalVat };
  };

  const salesTotals = calculateSalesTotals();
  const expensesTotals = calculateExpensesTotals();
  const netVatPayable = salesTotals.totalVat - expensesTotals.totalVat;

  const handleSave = async (status: 'Draft' | 'Submitted') => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: user.uid,
        status,
        period: formData.period,
        netVAT: netVatPayable,
        dueDate: formData.dueDate,
        filedAt: status === 'Submitted' ? new Date().toISOString() : null,
        updatedAt: Timestamp.now(),
        formData: formData // Save the full detailed form data
      };

      if (editId) {
        await updateDoc(doc(db, 'vat_returns', editId), payload);
      } else {
        await addDoc(collection(db, 'vat_returns'), {
          ...payload,
          createdAt: Timestamp.now()
        });
      }
      showToast(status === 'Submitted' ? 'VAT return submitted successfully' : 'VAT return saved as draft', 'success');
      navigate('/vat/my-filings');
    } catch (err) {
      handleFirestoreError(err, editId ? OperationType.UPDATE : OperationType.CREATE, 'vat_returns');
    } finally {
      setLoading(false);
    }
  };

  const emirates = [
    { key: 'abuDhabi', label: 'Abu Dhabi' },
    { key: 'dubai', label: 'Dubai' },
    { key: 'sharjah', label: 'Sharjah' },
    { key: 'ajman', label: 'Ajman' },
    { key: 'ummAlQuwain', label: 'Umm Al Quwain' },
    { key: 'rasAlKhaimah', label: 'Ras Al Khaimah' },
    { key: 'fujairah', label: 'Fujairah' },
  ];

  if (step === 0) {
    return (
      <div className="flex flex-col min-h-full bg-[#F8F9FA]">
        {/* Breadcrumbs */}
        <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat/my-filings')}>My Filings - VAT Return</span>
          <ChevronRight size={10} />
          <span className="text-gray-900">VAT 201 Return</span>
        </div>

        <div className="p-6 space-y-6">
          <h2 className="text-sm font-bold text-[#0A192F] uppercase">VAT 201 Return</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#E9ECEF] p-4 rounded flex items-start gap-3">
              <div className="p-2 bg-white rounded text-[#0A192F]">
                <HelpCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">No. of form steps</p>
                <p className="text-xs font-bold text-[#0A192F]">2 Steps</p>
              </div>
            </div>
            <div className="bg-[#D4EDDA] p-4 rounded flex items-start gap-3">
              <div className="p-2 bg-white rounded text-green-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Expected time to fill this form</p>
                <p className="text-xs font-bold text-[#0A192F]">20 minutes</p>
              </div>
            </div>
            <div className="bg-[#E9ECEF] p-4 rounded flex items-start gap-3">
              <div className="p-2 bg-white rounded text-[#0A192F]">
                <Info size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Expected fees for this service</p>
                <p className="text-xs font-bold text-[#0A192F]">Free of Charge</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Tutorial Materials</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[#B8860B] uppercase">
                  <span className="flex items-center gap-1 cursor-pointer hover:underline"><Eye size={12}/> Watch Video Tutorial</span>
                  <span className="flex items-center gap-1 cursor-pointer hover:underline"><Download size={12}/> Download User Manual</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Required Documents</p>
                <p className="text-[10px] font-bold text-[#0A192F]">NA</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Service Details</p>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded">
                  <div className="p-3 bg-gray-50 font-bold text-[10px] text-[#0A192F] uppercase">About the Service</div>
                  <div className="p-3 text-[10px] text-gray-600 leading-relaxed">
                    Use this service to submit your periodical VAT returns. If you are registered with the FTA, it is mandatory to submit your VAT return based on the allotted tax period. The VAT return needs to be submitted no later than 28th day following the end of the tax period. Failure to file the VAT return within the time period will lead to late filing penalties. You shall receive a confirmation email from the FTA once you have submitted the VAT return of the tax period. If you are a "Qualifying Registrant" for e-commerce purposes, then you will submit your VAT Return under e-commerce reporting.
                  </div>
                </div>
                {['Eligibility Criteria', 'Your service journey', 'FAQ'].map(item => (
                  <div key={item} className="border border-gray-200 rounded">
                    <div className="p-3 bg-white font-bold text-[10px] text-[#0A192F] uppercase flex justify-between items-center">
                      {item}
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="confirm" className="w-3 h-3 accent-[#B8860B]" />
            <label htmlFor="confirm" className="text-[10px] font-bold text-[#0A192F]">I confirm that I have read the above instructions and guidelines</label>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={() => navigate('/vat/my-filings')} className="px-8 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(1)} className="px-12 py-2 bg-[#B8860B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#9A6F09]">Start</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat/my-filings')}>My Filings - VAT Return</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">VAT 201 Return</span>
      </div>

      <div className="p-6 space-y-6">
        <h2 className="text-sm font-bold text-[#0A192F] uppercase">VAT 201 Return</h2>

        {/* Progress Bar */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center w-full max-w-2xl">
            <div className="flex flex-col items-center relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2", step >= 1 ? "bg-[#0A192F] text-white border-[#0A192F]" : "bg-white text-gray-400 border-gray-200")}>1</div>
              <span className="absolute -bottom-6 text-[8px] font-bold uppercase whitespace-nowrap">VAT Return</span>
            </div>
            <div className={cn("flex-1 h-0.5 mx-2", step >= 2 ? "bg-[#0A192F]" : "bg-gray-200")}></div>
            <div className="flex flex-col items-center relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2", step >= 2 ? "bg-[#0A192F] text-white border-[#0A192F]" : "bg-white text-gray-400 border-gray-200")}>2</div>
              <span className="absolute -bottom-6 text-[8px] font-bold uppercase whitespace-nowrap text-gray-400">Review & Declaration</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mt-8">
          <div className="grid grid-cols-6 divide-x divide-gray-100">
            <div className="p-3 bg-[#0A192F] text-white flex items-center gap-2">
              <FileText size={16} />
              <span className="text-[10px] font-bold uppercase">Filing Period</span>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Period:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{formData.period}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Stagger:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{formData.stagger}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Due Date:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{formData.dueDate}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Tax Year End:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{formData.taxYearEnd}</p>
            </div>
            <div className="p-3 bg-[#B8860B]/10">
              <p className="text-[8px] font-bold text-[#B8860B] uppercase">Net VAT Payable:</p>
              <p className="text-[10px] font-black text-[#B8860B]">{(netVatPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</p>
            </div>
          </div>
        </div>

        {/* Template Section */}
        <div className="bg-[#FDF3E1] border border-dashed border-[#B8860B] p-4 rounded flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-[#0A192F]">You have the option to file returns offline. You can download the template given below and then upload it after filing as mentioned in the template.</p>
            <button className="flex items-center gap-1 text-[10px] font-bold text-[#B8860B] uppercase hover:underline">
              <Download size={12} /> Download Template
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A192F] text-white text-[10px] font-bold uppercase rounded hover:bg-[#152A4A]">
            <Upload size={14} /> Upload Filled Template
          </button>
        </div>

        {/* Main Form Section */}
        <div className="space-y-6">
          {/* Section 1: Sales */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[11px] text-[#0A192F] uppercase">VAT on Sales and All Other Outputs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase w-1/2">Description</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">Amount (AED)</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">VAT Amount (AED)</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">Adjustment (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {emirates.map((emirate, idx) => (
                    <tr key={emirate.key}>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span className="text-gray-400 font-bold">1{String.fromCharCode(97 + idx)}</span>
                        <span>Standard rated supplies in {emirate.label}</span>
                        <Info size={12} className="text-gray-300" />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                          value={formData.sales.standardRated[emirate.key as keyof typeof formData.sales.standardRated].amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newStandard = { ...formData.sales.standardRated };
                            newStandard[emirate.key as keyof typeof formData.sales.standardRated].amount = val;
                            newStandard[emirate.key as keyof typeof formData.sales.standardRated].vat = val * 0.05;
                            setFormData({ ...formData, sales: { ...formData.sales, standardRated: newStandard } });
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                          value={formData.sales.standardRated[emirate.key as keyof typeof formData.sales.standardRated].vat}
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                          value={formData.sales.standardRated[emirate.key as keyof typeof formData.sales.standardRated].adjustment}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newStandard = { ...formData.sales.standardRated };
                            newStandard[emirate.key as keyof typeof formData.sales.standardRated].adjustment = val;
                            setFormData({ ...formData, sales: { ...formData.sales, standardRated: newStandard } });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  
                  {/* Row 2: Tourist Refunds */}
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">2</span>
                      <span>Tax refunds provided to tourists under the Tax Refunds for tourists scheme</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.touristRefunds.amount}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, touristRefunds: { ...formData.sales.touristRefunds, amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.touristRefunds.vat}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, touristRefunds: { ...formData.sales.touristRefunds, vat: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button className="text-[#B8860B] font-bold flex items-center gap-1 mx-auto"><Eye size={12}/> View Details</button>
                    </td>
                  </tr>

                  {/* Row 3: Reverse Charge */}
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">3</span>
                      <span>Supplies subject to reverse charge provisions</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.reverseCharge.amount}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, reverseCharge: { ...formData.sales.reverseCharge, amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.reverseCharge.vat}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, reverseCharge: { ...formData.sales.reverseCharge, vat: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>

                  {/* Row 4: Zero Rated */}
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">4</span>
                      <span>Zero rated supplies</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.zeroRated.amount}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, zeroRated: { amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>

                  {/* Row 5: Exempt */}
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">5</span>
                      <span>Exempt Supplies</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.exempt.amount}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, exempt: { amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>

                  {/* Row 6: Goods Imported */}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">6</span>
                      <span>Goods imported into the UAE</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-gray-700">{(formData.sales.goodsImported.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-bold text-gray-700">{(formData.sales.goodsImported.vat || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      <button className="text-[#B8860B] font-bold flex items-center gap-1 mx-auto"><Eye size={12}/> View Details</button>
                    </td>
                  </tr>

                  {/* Row 7: Adjustments to Imports */}
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">7</span>
                      <span>Adjustments to goods imported into the UAE</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.adjustmentsImports.amount}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, adjustmentsImports: { ...formData.sales.adjustmentsImports, amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.sales.adjustmentsImports.vat}
                        onChange={(e) => setFormData({ ...formData, sales: { ...formData.sales, adjustmentsImports: { ...formData.sales.adjustmentsImports, vat: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>

                  {/* Row 8: Totals */}
                  <tr className="bg-gray-200 font-bold">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">8</span>
                      <span>Totals</span>
                    </td>
                    <td className="px-4 py-2 text-right">{(salesTotals.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{(salesTotals.totalVat || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Expenses */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[11px] text-[#0A192F] uppercase">VAT on Expenses and All Other Inputs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase w-1/2">Description</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">Amount (AED)</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">VAT Amount (AED)</th>
                    <th className="px-4 py-2 font-bold text-gray-500 uppercase text-center">Adjustment (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">9</span>
                      <span>Standard rated expenses</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.expenses.standardRated.amount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, expenses: { ...formData.expenses, standardRated: { ...formData.expenses.standardRated, amount: val, vat: val * 0.05 } } });
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.expenses.standardRated.vat}
                        readOnly
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.expenses.standardRated.adjustment}
                        onChange={(e) => setFormData({ ...formData, expenses: { ...formData.expenses, standardRated: { ...formData.expenses.standardRated, adjustment: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">10</span>
                      <span>Supplies subject to the reverse charge provisions</span>
                      <Info size={12} className="text-gray-300" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.expenses.reverseCharge.amount}
                        onChange={(e) => setFormData({ ...formData, expenses: { ...formData.expenses, reverseCharge: { ...formData.expenses.reverseCharge, amount: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-right outline-none focus:border-[#B8860B]"
                        value={formData.expenses.reverseCharge.vat}
                        onChange={(e) => setFormData({ ...formData, expenses: { ...formData.expenses, reverseCharge: { ...formData.expenses.reverseCharge, vat: parseFloat(e.target.value) || 0 } } })}
                      />
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  <tr className="bg-gray-200 font-bold">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400 font-bold">11</span>
                      <span>Totals</span>
                    </td>
                    <td className="px-4 py-2 text-right">{(expensesTotals.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{(expensesTotals.totalVat || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Net VAT Due */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[11px] text-[#0A192F] uppercase">Net VAT Due</div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">12 Total value of tax due for the period (AED)</p>
                <div className="p-2 bg-gray-200 rounded text-[10px] font-bold text-[#0A192F] text-right">{(salesTotals.totalVat || 0).toLocaleString()}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">13 Total value of recoverable tax for the period (AED)</p>
                <div className="p-2 bg-gray-200 rounded text-[10px] font-bold text-[#0A192F] text-right">{(expensesTotals.totalVat || 0).toLocaleString()}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">14 Payable tax for the period (AED)</p>
                <div className="p-2 bg-gray-200 rounded text-[10px] font-bold text-[#0A192F] text-right">{(netVatPayable || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Section 4: Profit Margin Scheme */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[11px] text-[#0A192F] uppercase">Profit Margin Scheme</div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Did you apply the Profit Margin Scheme in respect of any supplies made during the tax period?</p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-[10px] font-bold text-[#0A192F] cursor-pointer">
                  <input 
                    type="radio" 
                    name="profitMargin" 
                    checked={formData.profitMarginScheme === 'Yes'} 
                    onChange={() => setFormData({ ...formData, profitMarginScheme: 'Yes' })}
                    className="w-3 h-3 accent-[#B8860B]"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-[#0A192F] cursor-pointer">
                  <input 
                    type="radio" 
                    name="profitMargin" 
                    checked={formData.profitMarginScheme === 'No'} 
                    onChange={() => setFormData({ ...formData, profitMarginScheme: 'No' })}
                    className="w-3 h-3 accent-[#B8860B]"
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={() => setStep(0)} className="px-8 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded hover:bg-gray-50">Previous Step</button>
            <div className="flex gap-4">
              <button 
                onClick={() => handleSave('Draft')}
                disabled={loading}
                className="px-8 py-2 border border-green-600 text-green-600 text-[10px] font-bold uppercase rounded hover:bg-green-50 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-12 py-2 bg-[#B8860B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#9A6F09] disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (step === 2) {
    return (
      <div className="flex flex-col min-h-full bg-[#F8F9FA]">
        {/* Breadcrumbs */}
        <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat/my-filings')}>My Filings - VAT Return</span>
          <ChevronRight size={10} />
          <span className="text-gray-900">VAT 201 Return</span>
        </div>

        <div className="p-6 space-y-6">
          <h2 className="text-sm font-bold text-[#0A192F] uppercase">Review & Declaration</h2>

          {/* Progress Bar */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center w-full max-w-2xl">
              <div className="flex flex-col items-center relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-[#0A192F] text-white border-[#0A192F]">1</div>
                <span className="absolute -bottom-6 text-[8px] font-bold uppercase whitespace-nowrap">VAT Return</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-[#0A192F]"></div>
              <div className="flex flex-col items-center relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-[#0A192F] text-white border-[#0A192F]">2</div>
                <span className="absolute -bottom-6 text-[8px] font-bold uppercase whitespace-nowrap">Review & Declaration</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mt-8">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-[11px] font-bold text-[#0A192F] uppercase">Summary of VAT Return</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Total value of tax due for the period</p>
                  <p className="text-sm font-bold text-[#0A192F]">AED {(salesTotals.totalVat || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Total value of recoverable tax for the period</p>
                  <p className="text-sm font-bold text-[#0A192F]">AED {(expensesTotals.totalVat || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 bg-[#0A192F] text-white rounded flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase">Net VAT Payable / (Recoverable) for the period</p>
                <p className="text-lg font-bold">AED {(netVatPayable || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 space-y-4">
            <h3 className="text-[11px] font-bold text-[#0A192F] uppercase">Declaration</h3>
            <div className="flex items-start gap-3">
              <input type="checkbox" id="declare" className="mt-1 w-4 h-4 accent-[#B8860B]" />
              <label htmlFor="declare" className="text-[10px] text-gray-600 leading-relaxed">
                I hereby declare that the information provided in this VAT return is true and correct to the best of my knowledge and belief. I understand that any false or misleading information may lead to penalties and legal action as per the UAE Tax Laws. I also confirm that I have the authority to submit this return on behalf of the taxable person.
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={() => setStep(1)} className="px-8 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded hover:bg-gray-50">Previous Step</button>
            <div className="flex gap-4">
              <button 
                onClick={() => handleSave('Draft')}
                disabled={loading}
                className="px-8 py-2 border border-green-600 text-green-600 text-[10px] font-bold uppercase rounded hover:bg-green-50 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                onClick={() => handleSave('Submitted')}
                disabled={loading}
                className="px-12 py-2 bg-[#B8860B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#9A6F09] disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={14} />
                {loading ? 'Submitting...' : 'Submit VAT Return'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NewVATReturn;
