import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText,
  Calendar,
  Filter,
  Download,
  Clock
} from 'lucide-react';

const VATReporting: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'vat_returns'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFilings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Prepare data for charts
  const barData = filings
    .filter(f => f.status === 'Submitted')
    .map(f => ({
      name: f.period,
      netVat: f.netVAT || 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalNetVat = filings.reduce((acc, curr) => acc + (curr.netVAT || 0), 0);
  const submittedCount = filings.filter(f => f.status === 'Submitted').length;
  const draftCount = filings.filter(f => f.status === 'Draft').length;

  const pieData = [
    { name: 'Submitted', value: submittedCount },
    { name: 'Draft', value: draftCount },
  ];

  const COLORS = ['#B8860B', '#0A192F'];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Reports...</div>;

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} />
        <span className="text-gray-900">VAT Reporting & Analytics</span>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0A192F] uppercase">VAT Reporting & Analytics</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">
              <Filter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Net VAT</span>
              <DollarSign size={16} className="text-[#B8860B]" />
            </div>
            <p className="text-xl font-bold text-[#0A192F]">{totalNetVat.toLocaleString()} AED</p>
            <div className="flex items-center gap-1 text-green-600 text-[9px] font-bold">
              <TrendingUp size={10} />
              <span>+12.5% from last year</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Submitted Returns</span>
              <FileText size={16} className="text-green-600" />
            </div>
            <p className="text-xl font-bold text-[#0A192F]">{submittedCount}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase">All periods up to date</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Draft Returns</span>
              <Calendar size={16} className="text-orange-500" />
            </div>
            <p className="text-xl font-bold text-[#0A192F]">{draftCount}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Requires attention</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Next Due Date</span>
              <Clock size={16} className="text-red-500" />
            </div>
            <p className="text-xl font-bold text-[#0A192F]">30 Mar 2026</p>
            <p className="text-[9px] text-red-500 font-bold uppercase">15 Days Remaining</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#0A192F] uppercase mb-6">Net VAT Position by Period</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0A192F' }}
                  />
                  <Bar dataKey="netVat" fill="#B8860B" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#0A192F] uppercase mb-6">Filing Status Distribution</h3>
            <div className="h-[300px] flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-[11px] font-bold text-[#0A192F] uppercase">Recent VAT Activity Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase">Period</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase">Total Sales</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase">Net VAT</th>
                  <th className="px-4 py-3 font-bold text-gray-600 uppercase">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filings.slice(0, 5).map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-700">{f.period}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-[4px] font-bold uppercase text-[8px]",
                        f.status === 'Submitted' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(f.totalSales || 0).toLocaleString()} AED</td>
                    <td className="px-4 py-3 font-bold text-[#B8860B]">{(f.netVAT || 0).toLocaleString()} AED</td>
                    <td className="px-4 py-3 text-gray-500">{f.filedAt ? new Date(f.filedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATReporting;
