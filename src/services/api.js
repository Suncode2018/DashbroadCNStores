import config from '../config/config';

class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl;
    this.timeout = 10000; // 10 seconds
  }

  // Helper method to build full URL
  buildUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    
    // ถ้า endpoint ไม่มี api/v1 แล้ว ให้เพิ่มเข้าไป
    if (!endpoint.startsWith('/api/') && !endpoint.startsWith('api/')) {
      return `${cleanBaseUrl}api/v1/${cleanEndpoint}`;
    }
    
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem(config.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method with better error handling
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const defaultOptions = {
      headers: this.getAuthHeaders(),
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (config.debugMode) {
      console.log('🚀 API Request:', {
        url,
        method: requestOptions.method || 'GET',
        headers: requestOptions.headers,
        body: requestOptions.body,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (config.debugMode) {
        console.log(`📡 Response Status: ${response.status}`, response);
      }

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }

      if (config.debugMode) {
        console.log('✅ API Response:', data);
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      if (config.debugMode) {
        console.error('❌ API Error:', error);
      }

      // Handle different error types
      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      
      if (error.name === 'AbortError') {
        errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        status: error.status || 500,
      };
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    let url = endpoint;
    
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          searchParams.append(key, params[key]);
        }
      });
      url = `${endpoint}?${searchParams.toString()}`;
    }

    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.request('/');
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'ไม่สามารถเชื่อมต่อกับ API ได้',
      };
    }
  }

  // CN Stores specific API methods
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getSalesData() {
    return this.get('/sales');
  }

  async getBranches() {
    return this.get('/branches');
  }

  async getBranchById(id) {
    return this.get(`/branches/${id}`);
  }

  async exportSalesData(format = 'xlsx') {
    return this.get('/export/sales', { format });
  }

  async exportBranchesData(format = 'xlsx') {
    return this.get('/export/branches', { format });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

