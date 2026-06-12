const API_BASE_URL = 'http://localhost:8000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('lnd_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('lnd_token', token);
  } else {
    localStorage.removeItem('lnd_token');
  }
}

export function getSavedUser() {
  const userStr = localStorage.getItem('lnd_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setSavedUser(user: any) {
  if (user) {
    localStorage.setItem('lnd_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('lnd_user');
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Handle bodies
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: body as any,
  } as any);

  if (response.status === 401) {
    // Session expired or unauthenticated
    setAuthToken(null);
    setSavedUser(null);
    window.dispatchEvent(new Event('auth-expired'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: (credentials: any) => request('/login', { method: 'POST', body: credentials }),
  logout: () => request('/logout', { method: 'POST' }),
  getProfile: () => request('/profile'),
  
  // Dashboard
  getDashboard: (revenueRange?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (revenueRange) params.append('revenue_range', revenueRange);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryString = params.toString();
    return request(`/dashboard${queryString ? `?${queryString}` : ''}`);
  },
  
  // Customers
  getCustomers: (search?: string) => request(`/customers${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  createCustomer: (data: any) => request('/customers', { method: 'POST', body: data }),
  updateCustomer: (id: number, data: any) => request(`/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id: number) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => request('/services'),
  createService: (data: any) => request('/services', { method: 'POST', body: data }),
  updateService: (id: number, data: any) => request(`/services/${id}`, { method: 'PUT', body: data }),
  deleteService: (id: number) => request(`/services/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request('/transactions'),
  createTransaction: (data: any) => request('/transactions', { method: 'POST', body: data }),
  updateTransactionStatus: (id: number, status: string) => request(`/transactions/${id}/status`, { method: 'PUT', body: { status } }),
  applyVoucher: (id: number, voucherCode: string) => request(`/transactions/${id}/apply-voucher`, { method: 'POST', body: { voucher_code: voucherCode } }),
  
  // Upload payment proof
  uploadPaymentProof: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('payment_proof', file);
    return request(`/transactions/${id}/payment`, {
      method: 'POST',
      body: formData,
    });
  },

  // Customer vouchers & redemptions
  getCustomerVouchers: (userId?: number) => request(`/vouchers${userId ? `?user_id=${userId}` : ''}`),
  getAllRedeemedVouchers: () => request('/admin/vouchers'),
  redeemVoucher: (voucherId: number, customerId?: number) => request('/vouchers/redeem', { method: 'POST', body: { voucher_id: voucherId, customer_id: customerId } }),

  // Voucher Templates CRUD
  getVoucherTemplates: () => request('/vouchers-templates'),
  createVoucherTemplate: (data: any) => request('/vouchers-templates', { method: 'POST', body: data }),
  updateVoucherTemplate: (id: number, data: any) => request(`/vouchers-templates/${id}`, { method: 'PUT', body: data }),
  deleteVoucherTemplate: (id: number) => request(`/vouchers-templates/${id}`, { method: 'DELETE' }),
  
  // Reports
  getRevenueReport: () => request('/reports/revenue'),
  getStatisticsReport: () => request('/reports/statistics'),
};
