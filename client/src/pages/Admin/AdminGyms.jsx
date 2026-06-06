import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { ShieldAlert, Download } from 'lucide-react';

export default function AdminGyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const { data } = await apiClient.get('/admin/gyms');
      setGyms(data.gyms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (gymId, currentStatus, currentEndDate) => {
    const newStatus = prompt("Enter new status (ACTIVE, GRACE, RESTRICTED, DISABLED):", currentStatus);
    if (!newStatus) return;
    
    let newDate = currentEndDate;
    if (newStatus === 'ACTIVE') {
      const inputDate = prompt("Enter new end date (YYYY-MM-DD) or leave blank to keep current:", currentEndDate.split('T')[0]);
      if (inputDate) newDate = inputDate;
    }

    try {
      await apiClient.put(`/admin/gyms/${gymId}`, { 
        status: newStatus.toUpperCase(), 
        subscription_end_date: newDate 
      });
      fetchGyms();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update gym');
    }
  };

  if (loading) return <div className="p-8">Loading gyms...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center mb-6">
          <ShieldAlert className="mr-2 text-red-600" /> Platform Admin Console
        </h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {gyms.map((gym) => (
              <li key={gym.id}>
                <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{gym.name}</h3>
                    <p className="text-sm text-gray-500">{gym.phone} | {gym.address}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      Expiry: {new Date(gym.subscription_end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${gym.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        gym.status === 'DISABLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {gym.status}
                    </span>
                    <button 
                      onClick={() => handleStatusChange(gym.id, gym.status, gym.subscription_end_date)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}