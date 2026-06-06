import React from 'react';
import { useThemeConfig } from '../config/ThemeContext';
import { CheckCircle2 } from 'lucide-react';

export default function PlansSection() {
  const { editable, platform } = useThemeConfig();

  const handleScrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="plans" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            No hidden fees. Choose the duration that fits your goals.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {editable.membership_prices.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative flex flex-col p-8 rounded-2xl ${
                plan.highlight 
                  ? 'bg-gray-900 text-white shadow-2xl scale-100 lg:scale-105 z-10' 
                  : 'bg-white text-gray-900 shadow-lg border border-gray-100'
              }`}
            >
              {/* Goldilocks Highlight Badge */}
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span 
                    className="px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm"
                    style={{ backgroundColor: platform.theme_colors.accent, color: '#000' }}
                  >
                    Best Value
                  </span>
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                {plan.title}
              </h3>
              
              <div className="mt-4 mb-8 flex items-baseline text-4xl font-extrabold">
                ₹{plan.price.toLocaleString('en-IN')}
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 ${plan.highlight ? 'text-gray-300' : 'text-green-500'}`} />
                  <span className={`text-sm ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                    Full gym access
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 ${plan.highlight ? 'text-gray-300' : 'text-green-500'}`} />
                  <span className={`text-sm ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                    Duration: {plan.duration}
                  </span>
                </li>
              </ul>

              <button
                onClick={handleScrollToContact}
                className={`w-full py-3 px-4 rounded-md font-semibold transition-colors duration-200 ${
                  plan.highlight
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'text-white hover:opacity-90'
                }`}
                style={!plan.highlight ? { backgroundColor: platform.theme_colors.primary } : {}}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>

        {/* Joining Fee Transparency */}
        {editable.joining_fee && editable.joining_fee !== '0' && (
          <div className="mt-12 text-center text-sm text-gray-500 bg-white inline-block mx-auto py-2 px-6 rounded-full border border-gray-200 shadow-sm">
            A one-time registration fee of <span className="font-bold text-gray-900">₹{parseInt(editable.joining_fee).toLocaleString('en-IN')}</span> applies to all new memberships.
          </div>
        )}

      </div>
    </section>
  );
}