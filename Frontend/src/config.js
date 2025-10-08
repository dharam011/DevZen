// API Configuration
const config = {
  // Use environment variable or fallback to localhost for development
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // API endpoints
  endpoints: {
    REVIEW: '/ai/get-review',
    OUTPUT: '/ai/get-output',
    CHAT: '/ai/chat'
  }
};

export default config;
