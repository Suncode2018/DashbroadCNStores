// src/config.js

const config = {
  // **สำคัญ:** ตรวจสอบให้แน่ใจว่า URL นี้ถูกต้อง และ Backend ของคุณรันอยู่ที่พอร์ต 8001
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8001',

  // คีย์ที่ใช้เก็บ token ใน localStorage
  tokenKey: process.env.REACT_APP_TOKEN_KEY || 'auth-token',

  // โหมด Debug สำหรับแสดง console.log เพิ่มเติม
  // debugMode: process.env.NODE_ENV === 'development',
  // debugMode: process.env.REACT_APP_ENV === 'development',

  // appName
  appName: process.env.REACT_APP_APP_NAME || 'CN Dashboard',
};

export default config;