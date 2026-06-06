import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { ShieldAlert, Plus, Dumbbell, MapPin, Phone, Building2 } from 'lucide-react';

export default function AdminGyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    phone: '',
    address: '',
    adminEmail: '',
    adminPassword: ''
  });

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const { data } = await apiClient.get('/admin/gyms');
      setGyms(data.gyms || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGym = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/gyms', {
        name: formData.name,
        subdomain: formData.subdomain.toLowerCase().trim(),
        phone: formData.phone,
        address: formData.address,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      });
      
      alert('🎉 Gym Successfully Onboarded on Platform!');
      setIsModalOpen(false);
      setFormData({ name: '', subdomain: '', phone: '', address: '', adminEmail: '', adminPassword: '' });
      fetchGyms();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to onboard gym');
    }
  };

  const handleStatusChange = async (gymId, currentStatus, currentEndDate) => {
    const newStatus = prompt("Enter new status (ACTIVE, GRACE, RESTRICTED, DISABLED):", currentStatus);
    if (!newStatus) return;
    
    let newDate = currentEndDate;
    if (newStatus === 'ACTIVE') {
      const inputDate = prompt("Enter new end date (YYYY-MM-DD):", currentEndDate ? currentEndDate.split('T')[0] : '');
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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading platform gyms...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        
        {/* Header Dashboard section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldAlert className="mr-2 text-blue-600 h-7 w-7" /> Platform Admin Console
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Gym
          </button>
        </div>

        {/* Empty State Banner */}
        {gyms.length === 0 && (
          <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No gyms registered yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first SaaS business tenant.</p>
          </div>
        )}

        {/* Gyms List Representation Grid */}
        {gyms.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {gyms.map((gym) => (
                <li key={gym.id}>
                  <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{gym.name}</h3>
                        <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                          {gym.subdomain}.gymos.in
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {gym.phone} | <MapPin className="h-3 w-3" /> {gym.address}
                      </p>
                      <p className="text-xs font-semibold text-gray-600 mt-1">
                        Subscription Expiry: {gym.subscription_end_date ? new Date(gym.subscription_end_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${gym.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          gym.status === 'DISABLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {gym.status}
                      </span>
                      <button 
                        onClick={() => handleStatusChange(gym.id, gym.status, gym.subscription_end_date)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Onboarding Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5" /> Register New Tenant Gym
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 font-bold text-xl">×</button>
            </div>
            <form onSubmit={handleCreateGym} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gym Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Gold's Gym" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subdomain String</label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                    <input type="text" name="subdomain" required value={formData.subdomain} onChange={handleInputChange} className="w-full p-2 bg-white outline-none" placeholder="golds" />
                    <span className="px-2 text-gray-500 text-sm font-mono">.gymos</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Physical Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md outline-none" placeholder="Kota, Rajasthan" />
                </div>
              </div>
              <div className="border-t border-gray-200 my-2 pt-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Master Owner Initial Account</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Email Address</label>
                    <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md outline-none" placeholder="owner@gym.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Secure Password</label>
                    <input type="password" name="adminPassword" required value={formData.adminPassword} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md outline-none" placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow transition">Deploy Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
