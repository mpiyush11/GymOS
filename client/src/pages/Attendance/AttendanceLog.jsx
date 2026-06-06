import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Activity, Clock } from 'lucide-react';

export default function AttendanceLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await apiClient.get('/attendance/history');
      setHistory(data.history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!memberId) return;
    try {
      await apiClient.post('/attendance/checkin', { member_id: memberId });
      setMemberId('');
      fetchHistory(); // Refresh list
    } catch (e) {
      alert(e.response?.data?.error || 'Check-in failed');
    }
  };

  if (loading) return <div className="p-8">Loading attendance...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center mb-6">
          <Activity className="mr-2" /> Attendance Log
        </h1>

        {/* Check-In Bar */}
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <form onSubmit={handleCheckIn} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Member UUID (In V1.1 this will be a search bar/scanner)"
              className="flex-1 border-gray-300 border rounded-md px-4 py-2"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
              Check In
            </button>
          </form>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {history.map((record) => (
              <li key={record.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{record.name}</p>
                      <p className="text-sm text-gray-500">{record.phone}</p>
                    </div>
                    <div className="mt-2 flex-shrink-0 sm:mt-0 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(record.check_in_time).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {history.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No check-ins today.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}