import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, CreditCard, Activity, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Only Managers and above can see the full dashboard metrics based on our RBAC
    if (user.role === 'ADMIN') return; // Platform Admin has a different view

    const fetchMetrics = async () => {
      try {
        const { data } = await apiClient.get('/dashboard');
        setMetrics(data.metrics);
      } catch (e) {
        console.error('Could not fetch dashboard metrics', e);
      }
    };
    if (['MANAGER', 'OWNER'].includes(user.role)) {
      fetchMetrics();
    }
  }, [user.role]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">GYMOS</span>
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">{user.role}</span>
            </div>
            <div className="flex items-center">
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 flex items-center">
                <LogOut className="h-5 w-5 mr-1"/> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Overview</h1>
          
          {['MANAGER', 'OWNER'].includes(user.role) && metrics ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Active Members" value={metrics.active_members} icon={<Users />} color="bg-blue-500" />
              <MetricCard title="Today's Check-ins" value={metrics.todays_attendance} icon={<Activity />} color="bg-green-500" />
              <MetricCard title="Pending Leads" value={metrics.pending_leads} icon={<UserPlus />} color="bg-yellow-500" />
              <MetricCard title="Monthly Revenue" value={`₹${metrics.monthly_revenue}`} icon={<CreditCard />} color="bg-purple-500" />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
              Welcome to the Reception Desk. Please select an action from the menu.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color} text-white`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}