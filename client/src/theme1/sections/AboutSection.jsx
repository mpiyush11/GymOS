import React from 'react';
import { useThemeConfig } from '../config/ThemeContext';
import { ShieldCheck, Dumbbell, Wind } from 'lucide-react';

export default function AboutSection() {
  const { editable, platform } = useThemeConfig();

  // Tier 2/3 Trust Pillars (No fake stats, purely functional luxury)
  const pillars = [
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Premium Equipment",
      desc: "Biomechanically accurate machines for safe, effective workouts."
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: "Fully Air Conditioned",
      desc: "A clean, temperature-controlled environment ensuring maximum comfort."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Strict Hygiene",
      desc: "Daily sanitization and zero-tolerance crowding policies."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Text Block */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: platform.theme_colors.primary }}>
            Welcome to {platform.gym_name}
          </h2>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 leading-relaxed">
            {editable.about_text}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: `${platform.theme_colors.primary}15`, color: platform.theme_colors.primary }}
              >
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
              <p className="text-gray-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}