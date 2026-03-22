import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../services/dataService';
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
  TrendingUp,
  CreditCard,
  LayoutGrid,
  ChevronLeft,
  HelpCircle,
  Clock,
  FileText,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [step, setStep] = useState(0); // 0: Instructions, 1: VAT Return, 2: Review
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vatRef: '',
    periodFrom: '',
    periodTo: '',
    status: 'Draft' as 'Draft' | 'Submitted',
    period: '01/12/2025 - 28/02/2026',
    stagger: 'Stagger 2 - Quarterly (Mar to Feb)',
    dueDate: '30/03/2026',
    taxYearEnd: '28/02/2026',
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
      goodsImported: { amount: 519580.13, vat: 25979.01 },
      adjustmentsImports: { amount: 0, vat: 0 },
    },
    expenses: {
      standardRated: { amount: 0, vat: 0, adjustment: 0 },
      reverseCharge: { amount: 0, vat: 0 },
    },
    profitMarginScheme: 'No'
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setEditId(id);
      fetchReturn(id);
      setStep(1);
    }
  }, [location]);

  const fetchReturn = async (id: string) => {
    try {
      const data = await dataService.getVATReturn(id);
      if (data && data.formData) {
        const parsedFormData = typeof data.formData === 'string' ? JSON.parse(data.formData) : data.formData;
        setFormData(parsedFormData);
      }
    } catch (err) {
      console.error('Error fetching return:', err);
    }
  };

  const calculateSalesTotals = () => {
    let totalAmount = 0;
    let totalVat = 0;
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
    try {
      const payload = {
        id: editId || undefined,
        status,
        period: formData.period,
        totalSales: salesTotals.totalAmount,
        totalVAT: salesTotals.totalVat,
        totalExpenses: expensesTotals.totalAmount,
        totalRecoverableVAT: expensesTotals.totalVat,
        netVAT: netVatPayable,
        dueDate: formData.dueDate,
        formData: formData // dataService handles stringify if needed, but Firestore can store objects
      };

      await dataService.saveVATReturn(payload);

      showToast(status === 'Submitted' ? 'VAT return submitted successfully' : 'VAT return saved as draft', 'success');
      navigate('/vat/my-filings');
    } catch (err: any) {
      console.error('Error saving return:', err);
      showToast(err.message || 'Failed to save return', 'error');
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center w-full max-w-3xl">
        {[
          { id: 0, label: 'Instructions' },
          { id: 1, label: 'VAT Return' },
          { id: 2, label: 'Review & Declaration' }
        ].map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center relative group">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 shadow-lg",
                step >= s.id 
                  ? "bg-brand-primary text-white shadow-brand-primary/20 scale-110" 
                  : "bg-white text-gray-300 border border-gray-100"
              )}>
                {step > s.id ? <CheckCircle2 size={24} /> : s.id + 1}
              </div>
              <span className={cn(
                "absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500",
                step >= s.id ? "text-brand-primary" : "text-gray-300"
              )}>
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div className="flex-1 h-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                  className="h-full bg-brand-accent transition-all duration-700"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-brand-surface">
      {/* Advanced Breadcrumbs */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <span className="hover:text-brand-accent cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="hover:text-brand-accent cursor-pointer transition-colors" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={12} />
        <span className="text-brand-primary">VAT 201 Return</span>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-brand-primary tracking-tight uppercase">VAT 201 Return</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Period: {formData.period}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Net VAT Payable</p>
              <p className="text-lg font-black text-brand-primary">AED {netVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {renderStepIndicator()}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Form Steps', value: '2 Steps', icon: LayoutGrid, bg: 'bg-blue-50', color: 'text-blue-500' },
                  { label: 'Estimated Time', value: '20 Minutes', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-500' },
                  { label: 'Service Fees', value: 'Free of Charge', icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-500' }
                ].map((item) => (
                  <div key={item.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={cn("p-4 rounded-2xl", item.bg)}>
                      <item.icon size={24} className={item.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-black text-brand-primary uppercase">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-10 space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-brand-accent/10 rounded-2xl text-brand-accent">
                      <Info size={32} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-brand-primary uppercase tracking-tight">About the Service</h3>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Use this service to submit your periodical VAT returns. If you are registered with the FTA, it is mandatory to submit your VAT return based on the allotted tax period. The VAT return needs to be submitted no later than 28th day following the end of the tax period.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Tutorial Materials</h4>
                      <div className="flex flex-col gap-3">
                        <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-brand-surface rounded-2xl transition-all group">
                          <Eye size={20} className="text-brand-accent" />
                          <span className="text-xs font-bold text-gray-600 group-hover:text-brand-primary uppercase tracking-widest">Watch Video Tutorial</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-brand-surface rounded-2xl transition-all group">
                          <Download size={20} className="text-brand-accent" />
                          <span className="text-xs font-bold text-gray-600 group-hover:text-brand-primary uppercase tracking-widest">Download User Manual</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Required Documents</h4>
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">No documents required for this filing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8">
                <button onClick={() => navigate('/vat')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">
                  <ArrowLeft size={16} /> Cancel Filing
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="btn-primary px-12 py-4 rounded-2xl shadow-2xl shadow-brand-accent/20"
                >
                  Start Filing <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Filing Info Bar */}
              <div className="bg-brand-primary rounded-3xl p-8 shadow-2xl text-white grid grid-cols-2 md:grid-cols-4 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">VAT Return Period</p>
                  <p className="text-xs font-black uppercase">{formData.period}</p>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">VAT Stagger</p>
                  <p className="text-xs font-black uppercase">{formData.stagger}</p>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Due Date</p>
                  <p className="text-xs font-black uppercase">{formData.dueDate}</p>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Tax Year End</p>
                  <p className="text-xs font-black uppercase">{formData.taxYearEnd}</p>
                </div>
              </div>

              {/* VAT on Sales Section */}
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-accent/10 rounded-xl text-brand-accent">
                      <TrendingUp size={24} />
                    </div>
                    <h3 className="text-lg font-black text-brand-primary uppercase tracking-tight">VAT on Sales and All Other Outputs</h3>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/2">Description</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount (AED)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">VAT Amount (AED)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Adjustment (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {emirates.map((emirate, idx) => (
                        <tr key={emirate.key} className="hover:bg-brand-surface transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-brand-accent group-hover:text-white transition-all">
                                1{String.fromCharCode(97 + idx)}
                              </span>
                              <span className="text-xs font-bold text-brand-primary uppercase tracking-tight">Standard rated supplies in {emirate.label}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              className="input-field text-right"
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
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              className="input-field text-right bg-gray-50 font-black text-brand-accent"
                              value={formData.sales.standardRated[emirate.key as keyof typeof formData.sales.standardRated].vat}
                              readOnly
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              className="input-field text-right"
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
                      
                      {/* Special Rows */}
                      <tr className="bg-brand-surface/30">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-lg bg-brand-accent text-white flex items-center justify-center text-[10px] font-black">6</span>
                            <span className="text-xs font-black text-brand-primary uppercase tracking-tight">Goods imported into the UAE</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-brand-primary">AED {(formData.sales.goodsImported.amount || 0).toLocaleString()}</td>
                        <td className="px-8 py-6 text-right font-black text-brand-accent">AED {(formData.sales.goodsImported.vat || 0).toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                          <button className="text-[9px] font-black text-brand-accent uppercase tracking-widest hover:underline flex items-center gap-1 ml-auto">
                            <Eye size={12} /> View Details
                          </button>
                        </td>
                      </tr>

                      {/* Totals Row */}
                      <tr className="bg-brand-primary text-white">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">8</span>
                            <span className="text-sm font-black uppercase tracking-widest">Total Sales & Output VAT</span>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right font-black text-lg">AED {salesTotals.totalAmount.toLocaleString()}</td>
                        <td className="px-8 py-8 text-right font-black text-lg text-brand-accent">AED {salesTotals.totalVat.toLocaleString()}</td>
                        <td className="px-8 py-8 text-right font-black text-lg">AED 0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VAT on Expenses Section */}
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-black text-brand-primary uppercase tracking-tight">VAT on Expenses and All Other Inputs</h3>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/2">Description</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount (AED)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Recoverable VAT (AED)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Adjustment (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-brand-surface transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">9</span>
                            <span className="text-xs font-bold text-brand-primary uppercase tracking-tight">Standard rated expenses</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <input 
                            type="number" 
                            className="input-field text-right"
                            value={formData.expenses.standardRated.amount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, expenses: { ...formData.expenses, standardRated: { ...formData.expenses.standardRated, amount: val, vat: val * 0.05 } } });
                            }}
                          />
                        </td>
                        <td className="px-8 py-6">
                          <input 
                            type="number" 
                            className="input-field text-right bg-gray-50 font-black text-emerald-600"
                            value={formData.expenses.standardRated.vat}
                            readOnly
                          />
                        </td>
                        <td className="px-8 py-6">
                          <input 
                            type="number" 
                            className="input-field text-right"
                            value={formData.expenses.standardRated.adjustment}
                            onChange={(e) => setFormData({ ...formData, expenses: { ...formData.expenses, standardRated: { ...formData.expenses.standardRated, adjustment: parseFloat(e.target.value) || 0 } } })}
                          />
                        </td>
                      </tr>
                      <tr className="bg-emerald-600 text-white">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">11</span>
                            <span className="text-sm font-black uppercase tracking-widest">Total Recoverable VAT</span>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right font-black text-lg">AED {expensesTotals.totalAmount.toLocaleString()}</td>
                        <td className="px-8 py-8 text-right font-black text-lg">AED {expensesTotals.totalVat.toLocaleString()}</td>
                        <td className="px-8 py-8 text-right font-black text-lg">AED 0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net VAT Due Summary */}
              <div className="bg-white rounded-[40px] shadow-2xl border-4 border-brand-accent p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <h3 className="text-xl font-black text-brand-primary uppercase tracking-tight mb-8 relative z-10">Net VAT Calculation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Output VAT (12)</p>
                    <p className="text-2xl font-black text-brand-primary">AED {salesTotals.totalVat.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Recoverable VAT (13)</p>
                    <p className="text-2xl font-black text-emerald-600">AED {expensesTotals.totalVat.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-brand-primary text-white rounded-3xl space-y-2 shadow-xl shadow-brand-primary/20">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Net VAT Payable (14)</p>
                    <p className="text-2xl font-black text-brand-accent">AED {netVatPayable.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-8">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">
                  <ArrowLeft size={16} /> Previous Step
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleSave('Draft')}
                    disabled={loading}
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="btn-primary px-12 py-4 rounded-2xl shadow-2xl shadow-brand-accent/20"
                  >
                    Review & Declaration <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-10 space-y-10">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                    <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tight">Final Declaration</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <AlertCircle size={14} /> Review Required
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filing Summary</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">Total Sales</span>
                          <span className="text-sm font-black text-brand-primary">AED {salesTotals.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">Total Output VAT</span>
                          <span className="text-sm font-black text-brand-primary">AED {salesTotals.totalVat.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">Total Recoverable VAT</span>
                          <span className="text-sm font-black text-emerald-600">AED {expensesTotals.totalVat.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 bg-brand-surface rounded-2xl px-4 mt-4">
                          <span className="text-xs font-black text-brand-primary uppercase">Net VAT Payable</span>
                          <span className="text-lg font-black text-brand-accent">AED {netVatPayable.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Declaration Statement</h4>
                      <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                        <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                          "I hereby declare that the information provided in this VAT return is true, complete and accurate to the best of my knowledge and belief. I understand that any false or misleading information may lead to penalties and legal action as per the UAE Tax Laws."
                        </p>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                          <input type="checkbox" id="declare" className="w-5 h-5 accent-brand-accent rounded-lg" />
                          <label htmlFor="declare" className="text-[10px] font-black text-brand-primary uppercase tracking-widest cursor-pointer">
                            I agree to the declaration statement above
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">
                  <ArrowLeft size={16} /> Back to Form
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleSave('Draft')}
                    disabled={loading}
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => handleSave('Submitted')}
                    disabled={loading}
                    className="btn-primary px-16 py-4 rounded-2xl shadow-2xl shadow-brand-accent/40 bg-brand-accent hover:bg-brand-accent/90"
                  >
                    Submit VAT Return <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewVATReturn;
