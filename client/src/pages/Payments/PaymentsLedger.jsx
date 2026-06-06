import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, AlertCircle, Trash2 } from 'lucide-react';

export default function PaymentsLedger() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await apiClient.get('/payments');
      setPayments(data.payments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async (paymentId) => {
    if (!['MANAGER', 'OWNER'].includes(user.role)) return;
    
    const reason = prompt("Enter void reason:");
    if (!reason) return;

    try {
      await apiClient.post(`/payments/${paymentId}/void`, { void_reason: reason });
      fetchPayments();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to void payment');
    }
  };

  if (loading) return <div className="p-8">Loading ledger...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="mr-2" /> Financial Ledger
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Record Payment
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className={payment.status === 'VOID' ? 'bg-gray-50 opacity-75' : ''}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {payment.member_name} <span className="text-gray-500 font-normal">({payment.member_phone})</span>
                      </h3>
                      <div className="mt-1 flex text-sm text-gray-500">
                        ₹{payment.amount} via {payment.payment_mode}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Collected by: {payment.collected_by || 'System'}
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex flex-col items-end gap-2">
                      <div className="text-sm text-gray-500">
                        {new Date(payment.transaction_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-3">
                        {payment.status === 'SUCCESS' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            SUCCESS
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> VOID
                          </span>
                        )}

                        {/* RBAC: Only Manager+ can VOID */}
                        {payment.status === 'SUCCESS' && ['MANAGER', 'OWNER'].includes(user.role) && (
                          <button 
                            onClick={() => handleVoid(payment.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Void Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {payments.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No payments found in ledger.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}