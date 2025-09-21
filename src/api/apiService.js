import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl;
  }

  buildUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem(config.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

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
      console.log('API Request:', { url, method: requestOptions.method || 'GET' });
    }

    try {
      const response = await fetch(url, requestOptions);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let userFriendlyMessage;
        
        switch (response.status) {
          case 400:
            userFriendlyMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
            break;
          case 401:
            userFriendlyMessage = 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาเข้าสู่ระบบใหม่';
            break;
          case 403:
            userFriendlyMessage = 'ไม่มีสิทธิ์ใช้งานฟีเจอร์นี้';
            break;
          case 404:
            userFriendlyMessage = 'ไม่พบข้อมูลที่ต้องการ ระบบอาจยังไม่พร้อมใช้งาน';
            break;
          case 429:
            userFriendlyMessage = 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
            break;
          case 500:
            userFriendlyMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาติดต่อผู้ดูแลระบบ';
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = 'ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง';
            break;
          default:
            userFriendlyMessage = `เกิดข้อผิดพลาด (${response.status}) กรุณาลองใหม่อีกครั้ง`;
        }

        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = data.detail || data.message || response.statusText;
        throw error;
      }

      if (config.debugMode) {
        console.log('API Response:', data);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      if (config.debugMode) {
        console.error('API Error:', error);
      }

      let userFriendlyMessage = error.message;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (error.name === 'AbortError') {
        userFriendlyMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่';
      } else if (!error.status) {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่อ';
      }

      return {
        success: false,
        error: userFriendlyMessage,
        originalError: error.originalMessage || error.message,
        status: error.status || 0,
      };
    }
  }

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

  async testConnection() {
    return this.request('/');
  }

  async getSalesData() {
    return this.get('/api/v1/sales');
  }

  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async getAvailableDates() {
    return this.get('/reports/cn-date');
  }

  async getCnReportByDate(startDate, endDate) {
    return this.get(`/reports/cn-by-date?start_date=${startDate}&end_date=${endDate}`);
  }

  async exportSalesData() {
    return this.get('/api/v1/export/sales');
  }
}

const apiService = new ApiService();
export default apiService;
