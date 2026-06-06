// This file represents the exact mapping of MASTER_WEBSITE_VARIABLES.md
// In production, this would be fetched from the backend on page load or injected at build time.
// For Theme 1 foundation, we use this mock to build the UI components.

export const themeConfig = {
  // CATEGORY C: INTERNAL SYSTEM VARIABLES
  internal: {
    public_site_key: 'gpk_demo123456789',
    api_endpoint: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  },

  // CATEGORY B: PLATFORM CONTROLLED
  platform: {
    gym_name: 'Iron Paradise Fitness',
    logo_url: '/assets/logo-placeholder.png', // Will be replaced by real asset
    hero_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', // Platform controlled to maintain luxury aesthetic
    theme_id: 'theme_1_luxury',
    theme_colors: {
      primary: '#1E3A8A', // Tailwind blue-900
      accent: '#EAB308',  // Tailwind yellow-500
    }
  },

  // CATEGORY A: OWNER EDITABLE
  editable: {
    hero_headline: 'The Most Premium Fitness Experience in Nagpur',
    hero_subheadline: 'Imported equipment, certified trainers, and 100% transparent pricing.',
    cta_button_text: 'Get a Free Trial',
    about_text: 'Founded in 2020, Iron Paradise is the largest centrally air-conditioned fitness center in the city. We believe in strict hygiene, no crowding, and result-oriented training.',
    phone: '9876543210',
    whatsapp: '9876543210',
    email: 'hello@ironparadise.in',
    address: '1st Floor, Crystal Tower, Main Road, Nagpur 440001',
    google_maps_url: 'https://maps.google.com/?q=nagpur',
    business_hours: {
      mon_fri: '6:00 AM - 10:00 PM',
      sat: '6:00 AM - 8:00 PM',
      sun: 'Closed'
    },
    joining_fee: '500',
    membership_prices: [
      { id: 'p1', title: '1 Month', duration: '1 Month', price: 2000, highlight: false },
      { id: 'p3', title: '3 Months', duration: '3 Months', price: 5000, highlight: true },
      { id: 'p6', title: '6 Months', duration: '6 Months', price: 9000, highlight: false },
      { id: 'p12', title: '1 Year', duration: '12 Months', price: 15000, highlight: false }
    ],
    trainers: [
      { id: 't1', name: 'Rahul Sharma', designation: 'Head Coach', bio: 'Certified ACE Trainer with 5 years experience.', image_url: null },
      { id: 't2', name: 'Priya Patel', designation: 'Yoga & CrossFit', bio: 'Specializes in mobility and functional training.', image_url: null }
    ],
    social_links: {
      instagram: 'instagram.com', // Deliberately missing https:// to test normalization
      facebook: 'https://facebook.com',
      youtube: ''
    },
    lead_form_enabled: true,
    reviews: [] // Empty by default in V1
  }
};
