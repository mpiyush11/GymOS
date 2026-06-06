import React from 'react';
import Theme1Layout from '../layouts/Theme1Layout';

// Section Imports
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import PlansSection from '../sections/PlansSection';
import TrainersSection from '../sections/TrainersSection';
import LeadFormSection from '../sections/LeadFormSection';
import FooterSection from '../sections/FooterSection';
import { useThemeConfig } from '../config/ThemeContext';

export default function Theme1Index() {
  const { editable } = useThemeConfig();

  return (
    <Theme1Layout>
      <HeroSection />
      <AboutSection />
      <PlansSection />
      <TrainersSection />
      
      {/* 
        ReviewsSection removed due to P0 Hardcoded Trust Signal violation.
        V1 relies purely on functional trust (Prices, Photos, Trainers).
      */}
      
      {editable.lead_form_enabled && <LeadFormSection />}
      
      <FooterSection />
    </Theme1Layout>
  );
}