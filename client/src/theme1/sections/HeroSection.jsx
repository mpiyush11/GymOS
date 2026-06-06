import React from 'react';
import { useThemeConfig } from '../config/ThemeContext';
import { MapPin, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { editable, platform } = useThemeConfig();

  const handleScrollToPlans = () => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Luxury Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gray-900/80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        
        {/* Local Validation Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8 animate-fade-in-up">
          <MapPin className="w-4 h-4 mr-2" style={{ color: platform.theme_colors.accent }} />
          <span>Located in {editable.address.split(',').pop().trim()}</span>
        </div>

        {/* H1 Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-4xl">
          {editable.hero_headline}
        </h1>

        {/* H2 Subheadline */}
        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl font-light leading-relaxed">
          {editable.hero_subheadline}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={handleScrollToContact}
            className="w-full sm:w-auto px-8 py-4 rounded-md text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center"
            style={{ backgroundColor: platform.theme_colors.primary }}
          >
            {editable.cta_button_text} <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          <button 
            onClick={handleScrollToPlans}
            className="w-full sm:w-auto px-8 py-4 rounded-md text-white font-semibold text-lg bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/5 transition-all duration-300"
          >
            View Pricing
          </button>
        </div>
      </div>
    </section>
  );
}