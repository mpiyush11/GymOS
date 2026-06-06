import React from 'react';
import { useThemeConfig } from '../config/ThemeContext';

export default function TrainersSection() {
  const { editable, platform } = useThemeConfig();

  if (!editable.trainers || editable.trainers.length === 0) return null;

  return (
    <section id="trainers" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Meet the Experts
          </h2>
          <p className="text-lg text-gray-600">
            Professional guidance for guaranteed results.
          </p>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
          {editable.trainers.map((trainer) => (
            <div 
              key={trainer.id} 
              className="flex-shrink-0 w-72 md:w-auto snap-center bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {trainer.image_url ? (
                <img 
                  src={trainer.image_url} 
                  alt={trainer.name} 
                  className="w-full h-64 object-cover object-top"
                />
              ) : (
                <div 
                  className="w-full h-64 flex items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: platform.theme_colors.primary }}
                >
                  {trainer.name.charAt(0)}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h3>
                <p className="text-sm font-semibold tracking-wide uppercase mb-3" style={{ color: platform.theme_colors.primary }}>
                  {trainer.designation}
                </p>
                {trainer.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">{trainer.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}