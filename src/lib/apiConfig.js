/**
 * MSJ Enterprise Centralized API Configuration
 * Uses relative '/api' path — works automatically on any domain (localhost, Vercel, etc.)
 * No environment variable needed.
 */

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_FORGOT_PASSWORD: `${API_BASE_URL}/admin/forgot-password`,
  ADMIN_VERIFY_OTP: `${API_BASE_URL}/admin/verify-otp`,
  ADMIN_RESET_PASSWORD: `${API_BASE_URL}/admin/reset-password`,
};

/**
 * Standardized API Client with automatic JSON parsing and error handling
 */
export async function apiClient(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`API request failed [${url}]:`, error);
    return {
      ok: false,
      status: 500,
      data: { success: false, message: 'Network error. Please check server connectivity.' },
    };
  }
}
