import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Registration, VATReturn, Payment } from '../types';
import { 
  ChevronRight, 
  Search, 
  LayoutGrid,
  Briefcase,
  User as UserIcon,
  MoreHorizontal,
  Star,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('Registration Overview');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  const reportData = [
    { name: 'Completed', value: 0 },
    { name: 'Pending', value: 0 },
  ];

  const COLORS = ['#B8860B', '#E5E7EB'];

  if (selectedEntity) {
    return (
      <div className="flex flex-col min-h-full bg-[#F8F9FA]">
        {/* Breadcrumbs */}
        <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">
          <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => setSelectedEntity(null)}>Home</span>
          <ChevronRight size={10} />
          <span className="text-gray-900">{selectedEntity}</span>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Muwafaq Banner */}
          <div className="bg-[#E9E4D4] border border-[#B8860B]/20 rounded p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                <img src="https://picsum.photos/seed/muwafaq/40/40" alt="Muwafaq" className="w-10 h-10" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] font-bold text-gray-800">
                  Dear registrant, you are eligible to register for "Muwafaq Package" which is a package designed for small and medium business in UAE (SMEs). Learn more about the privileges of this package here.
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#B8860B] text-white rounded text-[10px] font-bold uppercase hover:bg-[#9A6F09] transition-colors shrink-0 ml-4">
              Log In to Register
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Required Actions */}
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <FileText size={14} className="text-[#B8860B]" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#0A192F]">Required Actions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-50 text-left border-b border-gray-100">
                      <th className="px-4 py-2 font-bold text-gray-600">Due Date</th>
                      <th className="px-4 py-2 font-bold text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">• 24/02/2018</td>
                      <td className="px-4 py-3 text-gray-700 underline cursor-pointer hover:text-[#B8860B]">
                        Trade License Number 684210 belonging to MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C has expired.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">• 19/02/2025</td>
                      <td className="px-4 py-3 text-gray-700 underline cursor-pointer hover:text-[#B8860B]">
                        Passport Number EF0334248 belonging to MOHAMMAD BABUL ABUL BASHAR has expired.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Used Services */}
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Star size={14} className="text-[#B8860B]" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#0A192F]">Most Used Services</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { name: 'Request for Reconsiderations', path: '/correspondence' },
                  { name: 'Corporate Tax Registration', path: '/corporate-tax' },
                  { name: 'Corporate Tax Return', path: '/corporate-tax/new' },
                  { name: 'VAT - New Registration', path: '/vat/new' }
                ].map((service) => (
                  <div 
                    key={service.name} 
                    onClick={() => navigate(service.path)}
                    className="px-4 py-3 flex items-center justify-between group cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Star size={14} className="text-[#B8860B]" />
                      <span className="text-[10px] font-bold text-gray-700">{service.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#B8860B]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[
                'Registration Overview',
                'Taxable Person Details (!)',
                'Account Access',
                'Pending Requests (0)'
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={cn(
                    "px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all",
                    activeSubTab === tab 
                      ? "border-[#B8860B] text-[#B8860B]" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-0">
              {activeSubTab === 'Registration Overview' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-3 font-bold text-gray-600">Registration Type</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Registration Status</th>
                        <th className="px-4 py-3 font-bold text-gray-600">TRN/WHK No.</th>
                        <th className="px-4 py-3 font-bold text-gray-600">GIBAN</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Effective Date of Registration</th>
                        <th className="px-4 py-3 font-bold text-gray-600 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { type: 'Corporate Tax', status: 'Active', trn: '100354945600001', giban: 'AE527350100354945600001', date: '01/12/2023' },
                        { type: 'Value Added Tax', status: 'Active', trn: '100354945600003', giban: 'AE688680100354945600003', date: '01/01/2018' },
                        { type: 'Tax Group', status: 'Not Registered', trn: '-', giban: '-', date: '-' },
                        { type: 'VAT Clearing Company - TINCO', status: 'Not Registered', trn: '-', giban: '-', date: '-' },
                        { type: 'Excise Tax', status: 'Not Registered', trn: '-', giban: '-', date: '-' },
                        { type: 'Warehouse Keeper', status: 'Not Registered', trn: '-', giban: '-', date: '-' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-900">{row.type}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", row.status === 'Active' ? 'bg-green-500' : 'bg-gray-400')} />
                              <span className="font-bold text-gray-700">{row.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-700">{row.trn}</td>
                          <td className="px-4 py-3 font-bold text-gray-700">{row.giban}</td>
                          <td className="px-4 py-3 font-bold text-gray-700">{row.date}</td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-gray-400 hover:text-[#B8860B]">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeSubTab === 'Taxable Person Details (!)' && (
                <div className="p-6 space-y-8">
                  <div className="flex justify-end gap-2 mb-4">
                    <button className="px-3 py-1.5 bg-[#0A192F] text-white text-[10px] font-bold uppercase rounded hover:bg-black transition-colors">View Amendment History</button>
                    <button className="px-3 py-1.5 bg-[#B8860B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#9A6F09] transition-colors">Change Entity Type</button>
                    <button 
                      onClick={() => showToast('Amendment process initiated. Please follow the on-screen instructions.', 'info')}
                      className="px-3 py-1.5 bg-[#B8860B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#9A6F09] transition-colors"
                    >
                      Amend
                    </button>
                  </div>

                  {/* Entity Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Entity Details</h4>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-4 text-[10px]">
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Entity Type</p>
                        <p className="text-gray-900 font-medium">Legal Person - Incorporated</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Entity Sub-Type</p>
                        <p className="text-gray-900 font-medium">UAE Private Company (incl. an Establishment)</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Country of Registration/Incorporation</p>
                        <p className="text-gray-900 font-medium">United Arab Emirates</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Date of Incorporation</p>
                        <p className="text-gray-900 font-medium">25/02/2013</p>
                      </div>
                    </div>
                  </section>

                  {/* Identification Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Identification Details</h4>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="p-4 space-y-6">
                      <div className="border-b border-gray-100 pb-2">
                        <h5 className="text-[10px] font-bold text-[#B8860B] uppercase">Main License Details</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 text-[10px]">
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Trade License Issuing Authority</p>
                          <p className="text-gray-900 font-medium">Sharjah Economic Development Department</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Trade License Number</p>
                          <p className="text-gray-900 font-medium">684210</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Trade License Issue Date</p>
                          <p className="text-gray-900 font-medium">29/11/2017</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Trade License Expiry Date</p>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 font-medium">24/02/2018</p>
                            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">!</div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Legal Name in English</p>
                          <p className="text-gray-900 font-medium uppercase">MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase mb-1">Legal Name in Arabic</p>
                          <p className="text-gray-900 font-medium">محمد شفیع العالم لتجارة الخضار و الفواكه ش.ذ.م.م</p>
                        </div>
                      </div>

                      <div className="border-b border-gray-100 pb-2 pt-4">
                        <h5 className="text-[10px] font-bold text-[#B8860B] uppercase">Other License Details</h5>
                      </div>
                      <div className="p-4 text-center text-gray-400 text-[10px] font-bold uppercase">
                        No data
                      </div>
                    </div>
                  </section>

                  {/* Contact Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Contact Details</h4>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-4 text-[10px]">
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Email Address</p>
                        <p className="text-gray-900 font-medium">alampotato966@gmail.com</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Mobile Number</p>
                        <p className="text-gray-900 font-medium">+971 50 1234567</p>
                      </div>
                    </div>
                  </section>

                  {/* Owners List */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Owners List</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-100">
                            <th className="px-4 py-2 font-bold text-gray-600">Owner Type</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Name in English</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Name in Arabic</th>
                            <th className="px-4 py-2 font-bold text-gray-600">ID Number</th>
                            <th className="px-4 py-2 font-bold text-gray-600">ID Expiry Date</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Shareholding Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[
                            { type: 'Natural Person', en: 'MOHAMMAD SHAFIUL ALAM BADSHAH MEAH', ar: 'محمد شفیع علام بادشاه ميه', id: '784196035320365', expiry: '25/01/2027', share: '0.00' },
                            { type: 'Natural Person', en: 'MOHAMMAD SHAFIUL ALAM BADSHAH MEAH', ar: 'محمد شفیع علام بادشاه ميه', id: '784197230985752', expiry: '13/02/2034', share: '0.00' },
                            { type: 'Natural Person', en: 'MOHAMMAD BABUL ABUL BASHAR', ar: 'محمد بابول أبو البشار', id: '784198654802879', expiry: '31/08/2026', share: '0.00' },
                            { type: 'Natural Person', en: 'MOHAMMAD YASIN BADSHA MEAH', ar: 'محمد ياسين بادشاه ميه', id: '784198692506938', expiry: '24/08/2026', share: '0.00' }
                          ].map((owner, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-700">{owner.type}</td>
                              <td className="px-4 py-3 font-bold text-gray-900">{owner.en}</td>
                              <td className="px-4 py-3 text-gray-700">{owner.ar}</td>
                              <td className="px-4 py-3 text-gray-700">{owner.id}</td>
                              <td className="px-4 py-3 text-gray-700">{owner.expiry}</td>
                              <td className="px-4 py-3 text-gray-700">{owner.share}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Local Branch Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Local Branch Details</h4>
                    </div>
                    <div className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase">
                      No data
                    </div>
                  </section>

                  {/* Business Activities Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Business Activities Details</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-100">
                            <th className="px-4 py-2 font-bold text-gray-600">Trade License Number</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Primary Activity</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Industry</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Main Group</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Sub-Group</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Activity</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Sub-Activity</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Activity Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700">684210</td>
                            <td className="px-4 py-3 text-center">
                              <div className="w-4 h-4 border border-gray-300 rounded mx-auto flex items-center justify-center text-[#B8860B] text-[10px]">✓</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">Wholesale and retail trade; repair of motor vehicles and motorcycles</td>
                            <td className="px-4 py-3 text-gray-700">Wholesale trade, except of motor vehicles and motorcycles</td>
                            <td className="px-4 py-3 text-gray-700">Wholesale of food, beverages and tobacco</td>
                            <td className="px-4 py-3 text-gray-700">Wholesale of food, beverages and tobacco</td>
                            <td className="px-4 py-3 text-gray-700">Wholesale of Fresh Fruits and Vegetables Trading</td>
                            <td className="px-4 py-3 text-gray-700">4630</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Address Details */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Address Details</h4>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-4 text-[10px]">
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Country</p>
                        <p className="text-gray-900 font-medium">United Arab Emirates</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Building Name & Number</p>
                        <p className="text-gray-900 font-medium">SHOP G # 3, ADULLAH AHAMD MOHAMMEDABDUL</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Street</p>
                        <p className="text-gray-900 font-medium uppercase">RAK AL KHOR</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Area</p>
                        <p className="text-gray-900 font-medium uppercase">INDUSTRIAL AREA # 3</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">City</p>
                        <p className="text-gray-900 font-medium uppercase">DUBAI</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">Emirate</p>
                        <p className="text-gray-900 font-medium uppercase">Dubai</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold uppercase mb-1">P.O. Box (Optional)</p>
                        <p className="text-gray-900 font-medium">296466</p>
                      </div>
                    </div>
                  </section>

                  {/* Authorized Signatories */}
                  <section className="border border-gray-200 rounded">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-[#0A192F] uppercase">Authorized Signatories</h4>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-100">
                            <th className="px-4 py-2 font-bold text-gray-600">Name in English</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Name in Arabic</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Emirates ID Number</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Passport Issuing Country</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Passport Number</th>
                            <th className="px-4 py-2 font-bold text-gray-600 text-center">VAT</th>
                            <th className="px-4 py-2 font-bold text-gray-600 text-center">Excise Tax</th>
                            <th className="px-4 py-2 font-bold text-gray-600 text-center">Corporate Tax</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold text-gray-900 uppercase">MOHAMMAD SHAFIUL ALAM BADSHAH MEAH</td>
                            <td className="px-4 py-3 text-gray-700">محمد شفیع علام بادشاه ميه</td>
                            <td className="px-4 py-3 text-gray-700">784197230985752</td>
                            <td className="px-4 py-3 text-gray-700">Bangladesh</td>
                            <td className="px-4 py-3 text-gray-700 uppercase">EK0747097</td>
                            <td className="px-4 py-3 text-center text-green-600">✓</td>
                            <td className="px-4 py-3 text-center text-gray-300">-</td>
                            <td className="px-4 py-3 text-center text-green-600">✓</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {activeSubTab === 'Account Access' && (
                <div className="p-6">
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => navigate('/user-authorization')}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#B8860B] uppercase hover:underline"
                    >
                      <span className="text-lg">+</span> Add User
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div 
                          className="relative"
                          onMouseEnter={() => setShowColumnsDropdown(true)}
                          onMouseLeave={() => setShowColumnsDropdown(false)}
                        >
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase cursor-pointer hover:text-[#B8860B]">
                            <div className="flex flex-col gap-0.5">
                              <div className="w-3 h-0.5 bg-gray-400"></div>
                              <div className="w-3 h-0.5 bg-gray-400"></div>
                              <div className="w-3 h-0.5 bg-gray-400"></div>
                            </div>
                            Customize Columns
                          </div>
                          {showColumnsDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 p-2">
                              {['User Type', 'Name(EN)', 'Email ID', 'Start', 'End', 'Status', 'Authorizations'].map(col => (
                                <label key={col} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-[10px] font-bold text-gray-700">
                                  <input type="checkbox" defaultChecked className="accent-[#B8860B]" />
                                  {col}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search" className="pl-8 pr-4 py-1 bg-white border border-gray-200 rounded text-[10px] outline-none" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-100">
                            <th className="px-4 py-2 font-bold text-gray-600">User Type</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Name(EN)</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Email ID</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Start</th>
                            <th className="px-4 py-2 font-bold text-gray-600">End</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Status</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Authorizations</th>
                            <th className="px-4 py-2 font-bold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700">Portal User</td>
                            <td className="px-4 py-3 font-bold text-gray-900 uppercase">MOHAMMAD SHAFIUL ALAM</td>
                            <td className="px-4 py-3 text-gray-700">alampotato966@gmail.com</td>
                            <td className="px-4 py-3 text-gray-700">04/12/2017</td>
                            <td className="px-4 py-3 text-gray-700">31/12/9999</td>
                            <td className="px-4 py-3 font-bold text-green-600">Active</td>
                            <td className="px-4 py-3 text-gray-700">Admin</td>
                            <td className="px-4 py-3 text-gray-400">...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'Pending Requests (0)' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-3 font-bold text-gray-600">Tax Type</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Request Type</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Application Reference Number</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Requestor Name</th>
                        <th className="px-4 py-3 font-bold text-gray-600">Request Date</th>
                        <th className="px-4 py-3 font-bold text-gray-600 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 font-bold uppercase">No data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* E-invoicing Onboarding */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">Your TIN for e-Invoicing Onboarding</h3>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-[#B8860B] underline cursor-pointer">TIN ( 1003549456 )</span>
            </div>
          </div>

          {/* My Reports */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">My Reports</h3>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Application Status', 'Return Filing Status', 'Payment Status'].map((title) => (
                <div key={title} className="flex flex-col items-center">
                  <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-3 self-start">{title}</h4>
                  <div className="w-full aspect-square max-w-[120px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ name: 'No Data', value: 1 }]}
                          innerRadius={35}
                          outerRadius={45}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          <Cell fill="#E5E7EB" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">No data</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="p-6 space-y-6">
        {/* Banner */}
        <div className="bg-[#FDF8E9] border border-[#B8860B]/20 rounded p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B8860B]/10 rounded text-[#B8860B]">
              <Briefcase size={20} />
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">Create New Taxable Person Profile</span>
          </div>
          <button className="p-2 bg-[#B8860B] text-white rounded hover:bg-[#9A6F09] transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Taxable Person List Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-2">
            <LayoutGrid size={18} className="text-[#B8860B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Taxable Person List</h3>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search by TRN Number or Taxable Person"
              className="w-full pl-10 pr-32 py-2.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B]"
            />
            <button className="absolute right-0 top-0 bottom-0 px-8 bg-[#0A192F] text-white text-[11px] font-bold uppercase rounded-r hover:bg-[#152A4A] transition-colors">
              Search
            </button>
          </div>

          {/* Taxable Person Card */}
          <div 
            onClick={() => setSelectedEntity('MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C')}
            className="max-w-md bg-white border border-gray-200 rounded shadow-sm overflow-hidden group hover:border-[#B8860B] transition-all cursor-pointer"
          >
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <UserIcon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-gray-900 leading-tight uppercase">
                  MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C
                </h4>
              </div>
            </div>
            <div className="flex border-t border-gray-100">
              <button className="flex-1 py-2 bg-[#0A192F] text-white text-[10px] font-bold uppercase hover:bg-[#152A4A] transition-colors">
                View
              </button>
              <button className="px-4 py-2 bg-white text-gray-400 hover:text-[#B8860B] transition-colors border-l border-gray-100">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
