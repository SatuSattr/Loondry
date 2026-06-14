import { Platform } from 'react-native';

const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export let API_BASE = process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}:8000`;
export let API_BASE_URL = `${API_BASE}/api`;

let authToken: string | null = null;
let savedUser: any = null;

export function setApiBaseUrl(hostOrUrl: string) {
  let cleanUrl = hostOrUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `http://${cleanUrl}`;
  }
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  API_BASE = cleanUrl;
  API_BASE_URL = `${API_BASE}/api`;
  return API_BASE;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getSavedUser() {
  return savedUser;
}

export function setSavedUser(user: any) {
  savedUser = user;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  
  headers.set('Accept', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
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
    setAuthToken(null);
    setSavedUser(null);
    // You can handle auth expiration event here if needed
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: async (credentials: any) => {
    const res = await request('/login', { method: 'POST', body: credentials });
    if (res.access_token) {
      setAuthToken(res.access_token);
      setSavedUser(res.user);
    }
    return res;
  },
  
  logout: async () => {
    try {
      await request('/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
      setSavedUser(null);
    }
  },
  
  getProfile: async () => {
    const res = await request('/profile');
    if (res.user) {
      setSavedUser(res.user);
    }
    return res;
  },

  updateCustomerProfile: async (data: { name?: string; phone?: string; address?: string }) => {
    const res = await request('/profile/customer', { method: 'PUT', body: data });
    if (res.user) {
      setSavedUser(res.user);
    }
    return res;
  },

  updatePassword: async (data: any) => {
    return request('/profile/password', { method: 'PUT', body: data });
  },

  // Transactions (Customer-specific tracking endpoint)
  getMyTransactions: () => request('/status-laundry'),
  
  getTransactionDetails: (id: number) => request(`/transactions/${id}`),

  // Check voucher
  checkVoucherCode: (voucherCode: string, totalPrice: number, customerId: number) => {
    return request(`/vouchers/check/${encodeURIComponent(voucherCode)}?total_price=${totalPrice}&customer_id=${customerId}`);
  },

  // Upload payment proof & apply voucher
  uploadPaymentProof: (id: number, data: { payment_method?: string; payment_proof_base64?: string; payment_proof_name?: string; voucher_code?: string }) => {
    // Note: Laravel standard is multipart/form-data for files.
    // If we have a base64 string, we can send it or construct FormData.
    const formData = new FormData();
    if (data.payment_method) {
      formData.append('payment_method', data.payment_method);
    }
    if (data.voucher_code) {
      formData.append('voucher_code', data.voucher_code);
    }
    
    if (data.payment_proof_base64) {
      // Create file-like object from base64 for React Native Fetch FormData
      const uri = data.payment_proof_base64;
      const name = data.payment_proof_name || 'payment_proof.jpg';
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('payment_proof', {
        uri,
        name,
        type,
      } as any);
    }

    return request(`/transactions/${id}/payment`, {
      method: 'POST',
      body: formData,
      // Do not set Content-Type header when sending FormData in fetch, 
      // let the browser/native environment set it automatically with the boundary.
    });
  },

  cancelPayment: (id: number) => {
    return request(`/transactions/${id}/cancel-payment`, { method: 'POST' });
  },

  // Customer vouchers & redemptions
  getMyVouchers: (userId?: number) => request(`/vouchers${userId ? `?user_id=${userId}` : ''}`),
  
  redeemVoucher: (voucherId: number, customerId?: number) => {
    return request('/vouchers/redeem', {
      method: 'POST',
      body: { voucher_id: voucherId, customer_id: customerId }
    });
  },

  // Points history
  getMyPoints: () => request('/points'),

  // Voucher templates (to redeem)
  getVoucherTemplates: () => request('/vouchers-templates'),

  // Upload user avatar (Profile Photo)
  updateAvatar: async (imageUri: string, imageName: string = 'avatar.jpg') => {
    const formData = new FormData();
    const match = /\.(\w+)$/.exec(imageName);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('avatar', {
      uri: imageUri,
      name: imageName,
      type,
    } as any);

    const res = await request('/profile/avatar', {
      method: 'POST',
      body: formData,
    });
    if (res.user) {
      savedUser = res.user;
    }
    return res;
  },

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id: number) => request(`/notifications/${id}/read`, { method: 'POST' }),
  updateDeviceToken: (device_token: string | null) => request('/profile/device-token', { method: 'POST', body: { device_token } }),
};

export function formatImageUrl(url: string | null): string | null {
  if (!url) return null;
  // Replace localhost or 127.0.0.1 with correct API base host for android emulator support
  try {
    const apiBaseHost = API_BASE.split('://')[1];
    if (apiBaseHost) {
      const hostOnly = apiBaseHost.split(':')[0];
      let formattedUrl = url;
      if (url.includes('localhost')) {
        formattedUrl = url.replace('localhost', hostOnly);
      } else if (url.includes('127.0.0.1')) {
        formattedUrl = url.replace('127.0.0.1', hostOnly);
      }
      return formattedUrl;
    }
  } catch (e) {
    // ignore
  }
  return url;
}
