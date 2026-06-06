import React from 'react';
import { useThemeConfig } from '../config/ThemeContext';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { normalizeUrl } from '../utils/urlHelpers';

export default function FooterSection() {
  const { editable, platform } = useThemeConfig();

  const instaUrl = normalizeUrl(editable.social_links?.instagram);
  const fbUrl = normalizeUrl(editable.social_links?.facebook);
  const ytUrl = normalizeUrl(editable.social_links?.youtube);
  const mapUrl = normalizeUrl(editable.google_maps_url);

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4" style={{ color: platform.theme_colors.accent }}>
              {platform.gym_name}
            </h2>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              {editable.about_text}
            </p>
            <div className="flex gap-4">
              {instaUrl && (
                <a href={instaUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
              )}
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
              )}
              {ytUrl && (
                <a href={ytUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-gray-400 shrink-0 mt-0.5" />
                {mapUrl ? (
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white hover:underline transition-colors">
                    {editable.address}
                  </a>
                ) : (
                  <span className="text-gray-300">{editable.address}</span>
                )}
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                <a href={`tel:+91${editable.phone}`} className="text-gray-300 hover:text-white hover:underline transition-colors">
                  +91 {editable.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                <a href={`mailto:${editable.email}`} className="text-gray-300 hover:text-white hover:underline transition-colors">
                  {editable.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Hours</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Mon - Fri</span>
                <span className="font-medium text-white">{editable.business_hours.mon_fri}</span>
              </li>
              <li className="flex items-start justify-between border-b border-gray-800 pb-2">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Saturday</span>
                <span className="font-medium text-white">{editable.business_hours.sat}</span>
              </li>
              <li className="flex items-start justify-between">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Sunday</span>
                <span className="font-medium text-red-400">{editable.business_hours.sun}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {platform.gym_name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Powered by GymOS</p>
        </div>
      </div>
    </footer>
  );
}