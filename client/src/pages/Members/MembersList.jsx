import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Edit2, Play, Pause, RefreshCw } from 'lucide-react';

export default function MembersList() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await apiClient.get('/members');
      setMembers(data.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!['MANAGER', 'OWNER'].includes(user.role)) return;
    try {
      await apiClient.patch(`/members/${id}/status`, { status: newStatus });
      fetchMembers();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8">Loading members...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Users className="mr-2" /> Members
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add Member
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-blue-600 truncate">{member.name}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          - {member.phone}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          Expires: {new Date(member.membership_end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex -space-x-1 overflow-hidden items-center gap-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            member.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {member.status}
                        </span>
                        
                        {/* RBAC: Only Manager/Owner can freeze/unfreeze directly from list */}
                        {['MANAGER', 'OWNER'].includes(user.role) && (
                          <>
                            {member.status === 'ACTIVE' && (
                              <button onClick={() => handleStatusChange(member.id, 'FROZEN')} className="text-blue-500 hover:text-blue-700" title="Freeze">
                                <Pause className="h-5 w-5" />
                              </button>
                            )}
                            {member.status === 'FROZEN' && (
                              <button onClick={() => handleStatusChange(member.id, 'ACTIVE')} className="text-green-500 hover:text-green-700" title="Unfreeze">
                                <Play className="h-5 w-5" />
                              </button>
                            )}
                            <button className="text-gray-400 hover:text-gray-600" title="Edit">
                              <Edit2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No members found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}