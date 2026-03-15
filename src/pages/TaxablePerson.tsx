import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  MapPin, 
  Users, 
  FileText, 
  ShieldCheck,
  Globe,
  Phone,
  Mail
} from 'lucide-react';

const TaxablePerson: React.FC = () => {
  const { profile } = useAuth();

  const sections = [
    { title: 'Entity Details', icon: Building2 },
    { title: 'Licenses', icon: FileText },
    { title: 'Owners', icon: Users },
    { title: 'Business Activities', icon: Globe },
    { title: 'Address Details', icon: MapPin },
    { title: 'Authorized Signatories', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxable Person Details</h1>
          <p className="text-gray-500">View and manage your entity information and registration details.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#B8860B] hover:bg-gray-50 transition-all">
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 bg-[#0A192F] text-white flex items-center gap-6">
              <div className="w-20 h-20 bg-[#B8860B] rounded-2xl flex items-center justify-center text-3xl font-bold">
                {profile?.displayName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.displayName || 'Entity Name'}</h2>
                <p className="text-gray-400">TRN: 100234567890003</p>
                <div className="flex gap-4 mt-4">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                  <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider">Corporate</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Legal Form</label>
                  <p className="text-gray-900 font-bold">Limited Liability Company (LLC)</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registration Date</label>
                  <p className="text-gray-900 font-bold">12 Jan 2024</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Trade Name (English)</label>
                  <p className="text-gray-900 font-bold">{profile?.displayName || 'Entity Name'}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country of Establishment</label>
                  <p className="text-gray-900 font-bold">United Arab Emirates</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Email</label>
                  <p className="text-gray-900 font-bold">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Phone</label>
                  <p className="text-gray-900 font-bold">+971 50 123 4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <div key={section.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-[#B8860B]/10 group-hover:text-[#B8860B] rounded-xl transition-all">
                    <section.icon size={24} />
                  </div>
                  <button className="text-sm font-bold text-[#B8860B] opacity-0 group-hover:opacity-100 transition-all">View</button>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Manage and update your {section.title.toLowerCase()}.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900">+971 4 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-bold text-gray-900">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-bold text-gray-900">Business Bay, Dubai, UAE</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={20} />
              Verification Status
            </h3>
            <p className="text-sm text-orange-800 mb-4">Your account is fully verified and active. No further action is required at this time.</p>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full w-full" />
            </div>
            <p className="text-[10px] font-bold text-orange-600 mt-2 uppercase">100% Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxablePerson;
