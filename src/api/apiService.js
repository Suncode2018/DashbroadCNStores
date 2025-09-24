import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl;
  }

  // ใช้ Arrow Function เพื่อผูก 'this'
  buildUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  // ใช้ Arrow Function เพื่อผูก 'this'
  getAuthHeaders = () => {
    const token = localStorage.getItem(config.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ใช้ Arrow Function เพื่อผูก 'this'
  request = async (endpoint, options = {}) => {
    const url = this.buildUrl(endpoint);
    const defaultOptions = { headers: this.getAuthHeaders() };
    const requestOptions = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };

    if (config.debugMode) { console.log('API Request:', { url, method: requestOptions.method || 'GET' }); }

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
        if (response.status === 404) {
          console.warn('API Info: Endpoint returned 404. Treating as empty data.');
          return { success: true, data: { data: [] }, status: 404 };
        }
        
        let userFriendlyMessage;
        switch (response.status) {
          case 401: userFriendlyMessage = 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาเข้าสู่ระบบใหม่'; break;
          case 403: userFriendlyMessage = 'คุณไม่มีสิทธิ์ใช้งานฟีเจอร์นี้'; break;
          case 500: userFriendlyMessage = 'เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแล'; break;
          default: userFriendlyMessage = (data && data.detail) ? data.detail : `เกิดข้อผิดพลาดที่ไม่รู้จัก (Status: ${response.status})`;
        }
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        throw error;
      }

      if (config.debugMode) { console.log('API Response:', data); }
      return { success: true, data, status: response.status };

    } catch (error) {
      if (config.debugMode) { console.error('API Error:', error); }
      let userFriendlyMessage = error.message;
      if (error.name === 'TypeError') {
        userFriendlyMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อและสถานะของ API';
      }
      return { success: false, error: userFriendlyMessage, status: error.status || 0 };
    }
  }

  // ใช้ Arrow Function เพื่อผูก 'this'
  get = async (endpoint, params = {}) => {
    let url = endpoint;
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      url = `${endpoint}?${searchParams.toString()}`;
    }
    return this.request(url, { method: 'GET' });
  }

  // ใช้ Arrow Function เพื่อผูก 'this'
  post = async (endpoint, data = {}) => {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  // --- ฟังก์ชันทั้งหมด เปลี่ยนเป็น Arrow Functions ---
  testConnection = () => this.request('/');
  login = (credentials) => this.post('/auth/login', credentials);
  logout = () => this.post('/auth/logout');
  getProfile = () => this.get('/auth/me');
  
  getCnReportByDate = (startDate, endDate) => {
    return this.get(`/reports/cn-by-date`, { start_date: startDate, end_date: endDate });
  }

  getCnProcess43App = (startDate, endDate) => {
    return this.get(`/reports/cn-process-43-app`, { start_date: startDate, end_date: endDate });
  }

  getCnProcess42App = (startDate, endDate) => {
    return this.get(`/reports/cn-process-42-app`, { start_date: startDate, end_date: endDate });
  }
  
  getAvailableDates = () => {
    return this.get('/reports/cn-date');
  }
}

const apiService = new ApiService();
export default apiService;


