// API Configuration for Unified Server
// All APIs are now consolidated under http://localhost:3000

export const API_CONFIG = {
  // Base URL for the unified server
  BASE_URL: 'http://localhost:3000',
  
  // Route prefixes for each service
  ROUTES: {
    ADMIN: '/admin',
    STUDENT: '/student', 
    POC: '/poc',
    BPRND_POC: '/bprnd-poc',
    BPRND_STUDENT: '/bprnd-student'
  }
};

// Helper functions to build API URLs
export const buildApiUrl = (service: keyof typeof API_CONFIG.ROUTES, endpoint: string) => {
  const route = API_CONFIG.ROUTES[service];
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${route}${cleanEndpoint}`;
};

// Legacy endpoint mapping to new unified endpoints
export const ENDPOINT_MAPPING = {
  // Admin endpoints (port 3002 -> /admin)
  'http://localhost:3000/admin/login': buildApiUrl('ADMIN', '/login'),
  'http://localhost:3000/admin/pending-credits': buildApiUrl('ADMIN', '/pending-credits'),
  'http://localhost:3000/admin/certificate-course-mappings': buildApiUrl('ADMIN', '/certificate-course-mappings'),
  'http://localhost:3000/admin/bprnd/claims': buildApiUrl('ADMIN', '/bprnd/claims'),
  'http://localhost:3000/admin/pending-credits/count': buildApiUrl('ADMIN', '/pending-credits/count'),
  'http://localhost:3000/admin/bprnd-claims/count': buildApiUrl('ADMIN', '/bprnd-claims/count'),
  'http://localhost:3000/admin/declined-requests': buildApiUrl('ADMIN', '/declined-requests'),
  'http://localhost:3000/admin/declined-requests/count': buildApiUrl('ADMIN', '/declined-requests/count'),
  'http://localhost:3000/admin/courses': buildApiUrl('ADMIN', '/courses'),
  'http://localhost:3000/admin/fields': buildApiUrl('ADMIN', '/fields'),
  'http://localhost:3000/admin/mous/import': buildApiUrl('ADMIN', '/mous/import'),
  'http://localhost:3000/admin/courses/import': buildApiUrl('ADMIN', '/courses/import'),
  'http://localhost:3000/admin/participants/import': buildApiUrl('ADMIN', '/participants/import'),
  'http://localhost:3000/files/': `${API_CONFIG.BASE_URL}/files/`,
  
  // Student endpoints (port 3001 -> /student)
  'http://localhost:3000/student/login': buildApiUrl('STUDENT', '/login'),
  
  // POC endpoints (port 3002 -> /poc) - Note: Some POC endpoints were on 3002
  
  // BPR&D POC endpoints (port 3003 -> /bprnd-poc)
  'http://localhost:3000/bprnd-poc/pending-credits': buildApiUrl('BPRND_POC', '/pending-credits'),
  'http://localhost:3000/bprnd-poc/students': buildApiUrl('BPRND_POC', '/students'),
  'http://localhost:3000/bprnd-poc/claims': buildApiUrl('BPRND_POC', '/claims'),
  'http://localhost:3000/bprnd-poc/disciplines/count': buildApiUrl('BPRND_POC', '/disciplines/count'),
  'http://localhost:3000/bprnd-poc/declined-requests': buildApiUrl('BPRND_POC', '/declined-requests'),
  'http://localhost:3000/bprnd-poc/declined-requests/count': buildApiUrl('BPRND_POC', '/declined-requests/count'),
  'http://localhost:3000/bprnd-poc/students/upload': buildApiUrl('BPRND_POC', '/students/upload'),
  'http://localhost:3000/bprnd-poc/login': buildApiUrl('BPRND_POC', '/login'),
  'http://localhost:3000/files/': `${API_CONFIG.BASE_URL}/files/`,
  
  // BPR&D Student endpoints (port 3004 -> /bprnd-student)
  'http://localhost:3000/bprnd-student/login': buildApiUrl('BPRND_STUDENT', '/login'),
  'http://localhost:3000/bprnd-student/values': buildApiUrl('BPRND_STUDENT', '/values'),
  'http://localhost:3000/bprnd-student/pending-credits': buildApiUrl('BPRND_STUDENT', '/pending-credits'),
  'http://localhost:3000/bprnd-student/': buildApiUrl('BPRND_STUDENT', '/'),
  'http://localhost:3000/bprnd-student/change-password': buildApiUrl('BPRND_STUDENT', '/change-password'),
  'http://localhost:3000/files/': `${API_CONFIG.BASE_URL}/files/`,
  'http://localhost:3000/bprnd-student/umbrellas': buildApiUrl('BPRND_STUDENT', '/umbrellas'),
};

// Helper function to replace legacy URLs with new unified URLs
export const replaceApiUrl = (oldUrl: string): string => {
  // Handle dynamic URLs with parameters
  for (const [pattern, replacement] of Object.entries(ENDPOINT_MAPPING)) {
    if (oldUrl.startsWith(pattern)) {
      return oldUrl.replace(pattern, replacement);
    }
  }
  
  // Handle specific dynamic patterns
  if (oldUrl.includes('localhost:3004/student/') && oldUrl.includes('/course-history/')) {
    return oldUrl.replace('http://localhost:3000/bprnd-student/', `${API_CONFIG.BASE_URL}/bprnd-student/`);
  }
  
  if (oldUrl.includes('localhost:3004/student/') && oldUrl.includes('/credits/breakdown')) {
    return oldUrl.replace('http://localhost:3000/bprnd-student/', `${API_CONFIG.BASE_URL}/bprnd-student/`);
  }
  
  if (oldUrl.includes('localhost:3004/student/') && oldUrl.includes('/certifications/request')) {
    return oldUrl.replace('http://localhost:3000/bprnd-student/', `${API_CONFIG.BASE_URL}/bprnd-student/`);
  }
  
  if (oldUrl.includes('localhost:3004/student/certificate/') && oldUrl.includes('/pdf')) {
    return oldUrl.replace('http://localhost:3000/bprnd-student/certificate/', `${API_CONFIG.BASE_URL}/bprnd-student/certificate/`);
  }
  
  if (oldUrl.includes('localhost:3003/api/bprnd/pending-credits/') && (oldUrl.includes('/accept') || oldUrl.includes('/reject'))) {
    return oldUrl.replace('http://localhost:3000/bprnd-poc/pending-credits/', `${API_CONFIG.BASE_URL}/bprnd-poc/pending-credits/`);
  }
  
  if (oldUrl.includes('localhost:3002/api/pending-credits/') && (oldUrl.includes('/approve') || oldUrl.includes('/decline'))) {
    return oldUrl.replace('http://localhost:3000/admin/pending-credits/', `${API_CONFIG.BASE_URL}/admin/pending-credits/`);
  }
  
  if (oldUrl.includes('localhost:3002/api/bprnd/claims/') && (oldUrl.includes('/approve') || oldUrl.includes('/decline'))) {
    return oldUrl.replace('http://localhost:3000/admin/bprnd/claims/', `${API_CONFIG.BASE_URL}/admin/bprnd/claims/`);
  }
  
  if (oldUrl.includes('localhost:3003/api/bprnd/claims/') && (oldUrl.includes('/approve') || oldUrl.includes('/decline'))) {
    return oldUrl.replace('http://localhost:3000/bprnd-poc/claims/', `${API_CONFIG.BASE_URL}/bprnd-poc/claims/`);
  }
  
  // Return original URL if no mapping found (shouldn't happen in production)
  console.warn(`⚠️ No API mapping found for: ${oldUrl}`);
  return oldUrl;
};

export default API_CONFIG;
