import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, ArrowRight, Phone } from 'lucide-react';

export default function LeadsList() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await apiClient.get('/leads');
      setLeads(data.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (leadId) => {
    if (!['MANAGER', 'OWNER'].includes(user.role)) {
      alert("Only Managers and Owners can convert leads.");
      return;
    }
    const endDate = prompt("Enter membership end date (YYYY-MM-DD):");
    if (!endDate) return;

    try {
      await apiClient.post(`/leads/${leadId}/convert`, { membership_end_date: endDate });
      fetchLeads();
      alert("Lead successfully converted to Member!");
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to convert lead');
    }
  };

  if (loading) return <div className="p-8">Loading leads...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <UserPlus className="mr-2" /> Leads Pipeline
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add Lead
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <li key={lead.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{lead.name}</h3>
                      <div className="mt-1 flex text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" /> {lead.phone}
                      </div>
                      <div className="mt-1 flex text-xs text-gray-400">Source: {lead.source || 'WALK_IN'}</div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex items-center gap-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' : 
                          lead.status === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {lead.status}
                      </span>

                      {/* RBAC: Only Manager+ can convert */}
                      {lead.status !== 'CONVERTED' && ['MANAGER', 'OWNER'].includes(user.role) && (
                        <button 
                          onClick={() => handleConvert(lead.id)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Convert <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {leads.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No leads found in pipeline.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}