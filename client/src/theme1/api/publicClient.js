import axios from 'axios';
import { themeConfig } from '../config/mockData';

/**
 * Public API client specifically for the Theme.
 * Bypasses the standard admin/staff auth interceptors.
 * Injects the X-Gym-Public-Key required by the backend.
 */
export const publicApiClient = axios.create({
  baseURL: themeConfig.internal.api_endpoint,
  headers: {
    'Content-Type': 'application/json',
    'X-Gym-Public-Key': themeConfig.internal.public_site_key
  }
});

export const submitLead = async (name, phone, message = '') => {
  try {
    const response = await publicApiClient.post('/public/leads', {
      name,
      phone,
      message,
      source: 'WEBSITE'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to submit lead. Please try again or contact via WhatsApp.';
  }
};