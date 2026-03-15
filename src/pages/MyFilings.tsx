import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { 
  ChevronRight, 
  Search, 
  MoreHorizontal, 
  ChevronDown,
  ChevronLeft,
  Eye,
  FileEdit,
  Copy,
  History,
  Download,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MyFilings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Filing Details');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('deleted_filings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deleted_filings', JSON.stringify(deletedIds));
  }, [deletedIds]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'vat_returns'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbFilings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          type: 'VAT Return',
          vatRef: data.vatRef || '230010165962',
          periodFrom: data.periodFrom || '01/12/2025',
          periodTo: data.periodTo || '28/02/2026',
          dueDate: data.dueDate || '30/03/2026',
          taxYearEnd: data.taxYearEnd || '28/02/2026',
          submittedDate: data.filedAt ? new Date(data.filedAt).toLocaleDateString('en-GB') : '-',
          netVatPosition: data.netVAT?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
          exemptionStatus: '-',
          status: data.status || 'Draft'
        };
      });

      // Screenshot data
      const screenshotData = [
        {
          id: 'sc1',
          type: 'VAT Return',
          vatRef: '230010165962',
          periodFrom: '01/12/2025',
          periodTo: '28/02/2026',
          dueDate: '30/03/2026',
          taxYearEnd: '28/02/2026',
          submittedDate: '-',
          netVatPosition: '25,979.01',
          exemptionStatus: '-',
          status: 'Draft'
        },
        {
          id: 'sc2',
          type: 'VAT Return',
          vatRef: '230009650203',
          periodFrom: '01/09/2025',
          periodTo: '30/11/2025',
          dueDate: '29/12/2025',
          taxYearEnd: '28/02/2026',
          submittedDate: '25/12/2025',
          netVatPosition: '22,298.81',
          exemptionStatus: '-',
          status: 'Submitted'
        },
        {
          id: 'sc3',
          type: 'VAT Return',
          vatRef: '230009007872',
          periodFrom: '01/06/2025',
          periodTo: '31/08/2025',
          dueDate: '29/09/2025',
          taxYearEnd: '28/02/2026',
          submittedDate: '26/09/2025',
          netVatPosition: '6,162.28',
          exemptionStatus: '-',
          status: 'Submitted'
        },
        {
          id: 'sc4',
          type: 'VAT Return',
          vatRef: '230008349468',
          periodFrom: '01/03/2025',
          periodTo: '31/05/2025',
          dueDate: '30/06/2025',
          taxYearEnd: '28/02/2026',
          submittedDate: '24/06/2025',
          netVatPosition: '6,646.98',
          exemptionStatus: '-',
          status: 'Submitted'
        },
        {
          id: 'sc5',
          type: 'VAT Return',
          vatRef: '230007923042',
          periodFrom: '01/12/2024',
          periodTo: '28/02/2025',
          dueDate: '28/03/2025',
          taxYearEnd: '28/02/2025',
          submittedDate: '25/03/2025',
          netVatPosition: '24,989.01',
          exemptionStatus: '-',
          status: 'Submitted'
        }
      ];

      // Merge: if database is empty, show screenshot data. 
      // If database has items, show them first, then screenshot data (excluding duplicates by vatRef)
      const merged = [...dbFilings];
      screenshotData.forEach(sc => {
        if (!merged.find(m => m.vatRef === sc.vatRef) && !deletedIds.includes(sc.id)) {
          merged.push(sc);
        }
      });

      setFilings(merged.filter(f => !deletedIds.includes(f.id)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vat_returns');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('sc')) {
        await deleteDoc(doc(db, 'vat_returns', id));
      }
      setDeletedIds(prev => [...prev, id]);
      setShowConfirmDelete(null);
      setShowActionMenu(null);
      showToast('VAT return deleted successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vat_returns/${id}`);
    }
  };

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
        <span className="text-gray-900">My Filings - VAT Return</span>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        <h2 className="text-sm font-bold text-[#0A192F] uppercase">My Filings</h2>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['Filing Details', 'Return Clarifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all",
                  activeTab === tab 
                    ? "border-[#B8860B] text-[#B8860B]" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0">
            {activeTab === 'Filing Details' ? (
              <div className="flex flex-col">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase cursor-pointer hover:text-[#B8860B]">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                      </div>
                      Customize Columns
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select className="pl-3 pr-8 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                          <option>Filing Type</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select className="pl-3 pr-8 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                          <option>Status</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search" className="pl-8 pr-4 py-1 bg-white border border-gray-200 rounded text-[10px] outline-none" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Type</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">VAT Reference Number</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Period From</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Period To</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Original Return Due Date</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Tax Year End</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Submitted Date</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Net VAT Position</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Exemption / UP Status failed</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-gray-400 font-bold uppercase">Loading...</td>
                        </tr>
                      ) : filings.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-gray-400 font-bold uppercase">No data</td>
                        </tr>
                      ) : filings.map((row) => {
                        // Determine if due date is in the future for color coding
                        const isFuture = row.status === 'Draft'; // Simple heuristic based on screenshot
                        
                        return (
                          <tr key={row.id} className="hover:bg-gray-50 relative">
                            <td className="px-4 py-3 text-gray-700">{row.type}</td>
                            <td className="px-4 py-3 font-bold text-gray-700">{row.vatRef}</td>
                            <td className="px-4 py-3 text-gray-700">{row.periodFrom}</td>
                            <td className="px-4 py-3 text-gray-700">{row.periodTo}</td>
                            <td className={cn("px-4 py-3 font-bold", isFuture ? "text-green-600" : "text-red-500")}>
                              {row.dueDate}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{row.taxYearEnd}</td>
                            <td className="px-4 py-3 text-gray-700">{row.submittedDate}</td>
                            <td className="px-4 py-3 text-gray-700">{row.netVatPosition}</td>
                            <td className="px-4 py-3 text-gray-700">{row.exemptionStatus}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", row.status === 'Draft' ? 'bg-gray-400' : 'bg-blue-600')} />
                                <span className="font-bold text-gray-700">{row.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center relative">
                              <button 
                                onClick={() => setShowActionMenu(showActionMenu === row.id ? null : row.id)}
                                className="text-gray-400 hover:text-[#B8860B]"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {showActionMenu === row.id && (
                                <div className="absolute right-4 top-8 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 py-1 text-left">
                                  {row.status === 'Draft' ? (
                                    <>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/vat/new?id=${row.id}`);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-gray-700"
                                      >
                                        <FileEdit size={12} className="text-[#B8860B]" />
                                        Edit
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowConfirmDelete(row.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-red-600"
                                      >
                                        <Trash2 size={12} className="text-red-600" />
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {[
                                        { label: 'View', icon: Eye, onClick: () => navigate(`/vat/${row.id}`) },
                                        { label: 'Voluntary Disclosure', icon: FileEdit, onClick: () => navigate('/vat/new?disclosure=true') },
                                        { label: 'Compare Filings', icon: Copy, onClick: () => showToast('Comparison tool coming soon.', 'info') },
                                        { label: 'View Previous Filings', icon: History, onClick: () => showToast('Viewing history for ' + row.vatRef, 'info') },
                                        { label: 'Download', icon: Download, onClick: () => window.print() }
                                      ].map((action) => (
                                        <button 
                                          key={action.label} 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick?.();
                                            setShowActionMenu(null);
                                          }}
                                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-gray-700"
                                        >
                                          <action.icon size={12} className="text-[#B8860B]" />
                                          {action.label}
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-2">
                  <button className="p-1 text-gray-400 hover:text-[#B8860B] disabled:opacity-30" disabled>
                    <ChevronLeft size={16} />
                  </button>
                  <button className="w-6 h-6 bg-[#0A192F] text-white text-[10px] font-bold rounded">1</button>
                  <button className="p-1 text-gray-400 hover:text-[#B8860B]">
                    <ChevronRight size={16} />
                  </button>
                  <div className="flex items-center gap-2 ml-4">
                    <input type="text" defaultValue="1" className="w-8 h-6 border border-gray-200 rounded text-[10px] text-center outline-none" />
                    <button className="px-3 py-1 bg-[#0A192F] text-white text-[10px] font-bold uppercase rounded">Go</button>
                  </div>
                  <div className="flex items-center gap-2 ml-4 text-[10px] text-gray-500">
                    <span>showing</span>
                    <select className="h-6 border border-gray-200 rounded text-[10px] outline-none">
                      <option>5</option>
                    </select>
                    <span>of 32 records per page</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-0">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase cursor-pointer hover:text-[#B8860B]">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                      </div>
                      Customize Columns
                    </div>
                    <div className="relative">
                      <select className="pl-3 pr-8 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                        <option>Review Status</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search" className="pl-8 pr-4 py-1 bg-white border border-gray-200 rounded text-[10px] outline-none" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Review Request Number</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Corporate Tax Period</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Taxpayer Name in English</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Taxpayer Name in Arabic</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">TRN</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Return Application Number</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Review Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 font-bold uppercase">No data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-sm font-bold uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Are you sure you want to delete this VAT return draft? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(showConfirmDelete)}
                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase rounded hover:bg-red-700"
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

export default MyFilings;
