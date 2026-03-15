import React from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  FileText, 
  Scale, 
  UserCheck,
  Plus,
  ArrowRight
} from 'lucide-react';

const OtherServices: React.FC = () => {
  const services = [
    { 
      title: 'Waivers', 
      description: 'Request waivers for administrative penalties or interest.',
      icon: Scale,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Penalty Plans', 
      description: 'Apply for installment plans to pay administrative penalties.',
      icon: ShieldAlert,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      title: 'Tax Agent Infraction', 
      description: 'Report or manage tax agent related infractions.',
      icon: UserCheck,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      title: 'Administrative Exceptions', 
      description: 'Apply for exceptions to standard tax procedures.',
      icon: Wrench,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      title: 'Clarifications', 
      description: 'Request official clarifications on tax laws and regulations.',
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Other Services</h1>
        <p className="text-gray-500">Access additional tax-related services and applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${service.bg} ${service.color}`}>
                <service.icon size={24} />
              </div>
              <button className="p-2 text-gray-400 hover:text-[#B8860B] transition-colors">
                <Plus size={20} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{service.description}</p>
            <button className="flex items-center gap-2 text-sm font-bold text-[#B8860B] hover:gap-3 transition-all">
              View All Requests
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherServices;
