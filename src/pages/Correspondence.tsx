import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { Correspondence } from '../types';
import { 
  Mail, 
  FileCheck, 
  ShieldAlert, 
  Search, 
  Filter,
  ChevronRight,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const CorrespondencePage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Correspondence[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Correspondences' | 'Certificates' | 'NOC Requests' | 'My Audit'>('Correspondences');

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'correspondence'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Correspondence)));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'correspondence');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  const tabs = ['Correspondences', 'Certificates', 'NOC Requests', 'My Audit'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Correspondence</h1>
        <p className="text-gray-500">View and manage all communications from the tax authority.</p>
      </div>

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-[#B8860B] text-[#B8860B]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search correspondence..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8860B]"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:text-[#B8860B]">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Mail className="mx-auto mb-3 text-gray-300" size={48} />
              <p>No correspondence found in this category.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    msg.type === 'Certificate' ? 'bg-green-50 text-green-600' :
                    msg.type === 'Audit' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {msg.type === 'Certificate' ? <FileCheck size={24} /> :
                     msg.type === 'Audit' ? <ShieldAlert size={24} /> : <Mail size={24} />}
                  </div>
                  <div>
                    <h3 className={`font-bold ${msg.status === 'Unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.subject}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-gray-400 uppercase">{msg.type}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {format(new Date(msg.createdAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {msg.status === 'Unread' && (
                    <span className="w-2 h-2 bg-[#B8860B] rounded-full" />
                  )}
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-[#B8860B] transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrespondencePage;
