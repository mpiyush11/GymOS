import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    try {
      // For CSV downloads via Axios, we need to handle the blob
      const response = await apiClient.get(`/reports/revenue/export`, {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("Export failed. Make sure you are an OWNER.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports & Exports</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Revenue Export Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <Download className="mr-2 h-5 w-5 text-gray-500" /> Export Revenue CSV
            </h2>
            {user.role !== 'OWNER' ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <p className="ml-3 text-sm text-yellow-700">Only Gym Owners can export financial data.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Download CSV
                </button>
              </form>
            )}
          </div>

          {/* Additional Report Cards (e.g. Expiring Members) can go here */}

        </div>
      </div>
    </div>
  );
}