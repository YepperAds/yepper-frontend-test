// utils/api.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for every backend call in Yepper.
// All pages should import from here — never hardcode URLs again.
// To switch environments just change REACT_APP_API_URL in .env
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────────
export const BASE_URL =
  process.env.REACT_APP_API_URL || 'https://yepper-backend-test.onrender.com';

// ── Axios instance with global defaults ───────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 s — never wait forever for a cold start
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

export default api;

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
export const authAPI = {
  register:             (data)          => api.post('/api/auth/register', data),
  registerWaitlist:     (data)          => api.post('/api/auth/register-waitlist', data),
  login:                (data)          => api.post('/api/auth/login', data),
  me:                   ()             => api.get('/api/auth/me'),
  resendVerification:   (data)          => api.post('/api/auth/resend-verification', data),
  resendWaitlist:       (data)          => api.post('/api/auth/resend-waitlist-verification', data),
  verifyEmail:          (token)         => api.get(`/api/auth/verify-email?token=${token}`),
  googleRedirect:       ()             => `${BASE_URL}/api/auth/google`,
};

// ═══════════════════════════════════════════════════════════════
// PASSWORD
// ═══════════════════════════════════════════════════════════════
export const passwordAPI = {
  forgot: (data) => api.post('/api/password/forgot-password', data),
  reset:  (data) => api.post('/api/password/reset-password', data),
};

// ═══════════════════════════════════════════════════════════════
// WEBSITES  (AdPromoter — publisher side)
// ═══════════════════════════════════════════════════════════════
export const websiteAPI = {
  getAll:               ()             => api.get('/api/createWebsite'),
  getById:              (id)           => api.get(`/api/createWebsite/website/${id}`),
  prepare:              (data)         => api.post('/api/createWebsite/prepareWebsite', data),
  createWithCategories: (data)         => api.post('/api/createWebsite/createWebsiteWithCategories', data),
  uploadScreenshot:     (id, formData) => api.post(`/api/createWebsite/upload/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateName:           (id, data)     => api.patch(`/api/createWebsite/${id}/name`, data),
};

// ═══════════════════════════════════════════════════════════════
// AD CATEGORIES  (publisher ad zones)
// ═══════════════════════════════════════════════════════════════
export const categoryAPI = {
  getByWebsite:         (websiteId)         => api.get(`/api/ad-categories/${websiteId}`),
  getByWebsiteAdvertiser: (websiteId)       => api.get(`/api/ad-categories/${websiteId}/advertiser`),
  getById:              (categoryId)        => api.get(`/api/ad-categories/categoriees/${categoryId}`),
  getCategoryLanguage:  (categoryId)        => api.get(`/api/ad-categories/category/${categoryId}/language`),
  create:               (data)             => api.post('/api/ad-categories', data),
  customize:            (categoryId, data) => api.post(`/api/ad-categories/categoriees/${categoryId}/customization`, data),
  resetUserCount:       (categoryId, data) => api.put(`/api/ad-categories/${categoryId}/reset-user-count`, data),
  updateLanguage:       (categoryId, data) => api.patch(`/api/ad-categories/category/${categoryId}/language`, data),
  delete:               (categoryId)       => api.delete(`/api/ad-categories/${categoryId}`),

  // Wallet
  getWallet:            ()                 => api.get('/api/ad-categories/wallet'),
  getWalletBalance:     (type)             => api.get(`/api/ad-categories/wallet/${type}/balance`),
  getTransactions:      (type, page = 1)   => api.get(`/api/ad-categories/wallet/${type}/transactions?page=${page}&limit=10`),
  requestWithdrawal:    (type, data)       => api.post(`/api/ad-categories/wallet/${type}/withdrawal-request`, data),
  getWithdrawalHistory: (type, page = 1)   => api.get(`/api/ad-categories/wallet/${type}/withdrawal-requests?page=${page}&limit=10`),
  cancelWithdrawal:     (requestId)        => api.post(`/api/ad-categories/wallet/withdrawal-request/${requestId}/cancel`),

  // Admin
  adminGetWithdrawals:  (params)           => api.get(`/api/ad-categories/admin/withdrawal-requests?${params}`),
  adminProcessWithdrawal: (id, data)       => api.post(`/api/ad-categories/admin/withdrawal-request/${id}/process`, data),

  // Ads management
  getPendingRejections: ()                 => api.get('/api/ad-categories/pending-rejections'),
  getActiveAds:         ()                 => api.get('/api/ad-categories/active-ads'),
  getPendingByUser:     (userId)           => api.get(`/api/ad-categories/pending/${userId}`),
  approveAd:            (adId, websiteId, categoryId) =>
    api.post(`/api/ad-categories/approve/${adId}/website/${websiteId}/${categoryId}`),
  rejectAd:             (adId, websiteId, categoryId) =>
    api.post(`/api/ad-categories/reject/${adId}/website/${websiteId}/${categoryId}`),
};

// ═══════════════════════════════════════════════════════════════
// WEB ADVERTISE  (AdOwner — advertiser side)
// ═══════════════════════════════════════════════════════════════
export const advertiseAPI = {
  create:               (formData)     => api.post('/api/web-advertise', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAdDetails:         (adId)         => api.get(`/api/web-advertise/ad-details/${adId}`),
  getAvailable:         (websiteId)    => api.get(`/api/web-advertise/available/${websiteId}`),
  getAvailableAll:      (params)       => api.get(`/api/web-advertise/available?${params}`),
  assign:               (data)         => api.post('/api/web-advertise/assign', data),
  selectForWebsite:     (data)         => api.post('/api/web-advertise/select-for-website', data),
  addSelections:        (adId, data)   => api.post(`/api/web-advertise/${adId}/add-selections`, data),

  // Payment
  initiatePayment:      (data)         => api.post('/api/web-advertise/payment/initiate', data),
  initiatePaymentModal: (data)         => api.post('/api/web-advertise/initiate-payment', data),
  verifyPayment:        (data)         => api.post('/api/web-advertise/payment/verify', data),
  verifyCallback:       (data)         => api.post('/api/web-advertise/payment/verify-callback', data),
  getWalletBalance:     ()             => api.get('/api/web-advertise/payment/wallet-balance'),
  calculateBreakdown:   (data)         => api.post('/api/web-advertise/payment/calculate-breakdown', data),
  processWallet:        (data)         => api.post('/api/web-advertise/payment/process-wallet', data),
};

// ═══════════════════════════════════════════════════════════════
// BUSINESS CATEGORIES
// ═══════════════════════════════════════════════════════════════
export const businessCategoryAPI = {
  getAll: () => api.get('/api/business-categories/categories'),
};

// ═══════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════
export const campaignAPI = {
  general:     (data) => api.post('/api/campaign-selections', data),
  adult:       (data) => api.post('/api/adult-campaign', data),
  carOwners:   (data) => api.post('/api/carOwners-campaign', data),
  countrySide: (data) => api.post('/api/countrySide-campaign', data),
  parents:     (data) => api.post('/api/parents-campaign', data),
  transport:   (data) => api.post('/api/transport-campaign', data),
  youth:       (data) => api.post('/api/youth-campaign', data),
};

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS & AI
// ═══════════════════════════════════════════════════════════════
export const conversationAPI = {
  getAll:    ()           => api.get('/api/conversations'),
  getById:   (id)         => api.get(`/api/conversations/${id}`),
  create:    (data)       => api.post('/api/conversations', data),
  delete:    (id)         => api.delete(`/api/conversations/${id}`),
  aiGenerate:(data)       => api.post('/api/ai/generate', data),
};

// ═══════════════════════════════════════════════════════════════
// BRAND
// ═══════════════════════════════════════════════════════════════
export const brandAPI = {
  auth:      (data) => api.post('/api/brandAuth', data),
  analytics: ()     => api.get('/api/brandAnalytics'),
};

// ═══════════════════════════════════════════════════════════════
// HEALTH  (used by keep-alive cron)
// ═══════════════════════════════════════════════════════════════
export const healthAPI = {
  ping: () => api.get('/health'),
};