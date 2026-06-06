import React, { useState } from 'react';
import { useThemeConfig } from '../config/ThemeContext';
import { submitLead } from '../api/publicClient';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LeadFormSection() {
  const { editable, platform } = useThemeConfig();
  
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  if (!editable.lead_form_enabled) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      setStatus('error');
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setStatus('loading');
    try {
      await submitLead(formData.name, formData.phone);
      setStatus('success');
      setFormData({ name: '', phone: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Take the First Step</h2>
            <p className="text-gray-600">Enter your details and our team will contact you instantly.</p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in-up">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Request Received!</h3>
              <p className="text-green-700">Thank you. Our manager will call you shortly to schedule your visit.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm font-semibold text-green-600 hover:text-green-800"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {status === 'error' && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50"
                  style={{ '--tw-ring-color': platform.theme_colors.primary }}
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    required
                    disabled={status === 'loading'}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50"
                    style={{ '--tw-ring-color': platform.theme_colors.primary }}
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-lg text-white font-bold text-lg transition-all duration-300 hover:opacity-90 disabled:opacity-70 flex justify-center items-center"
                style={{ backgroundColor: platform.theme_colors.primary }}
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Submitting...</>
                ) : (
                  'Request Callback'
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}