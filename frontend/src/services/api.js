// api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Intercepteur de requête ────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // ✅ Ne pas envoyer le token sur les endpoints publics
    const isPublicEndpoint =
      config.url?.includes('/api/auth/login') ||
      config.url?.includes('/api/auth/register');

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📡 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur de réponse ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 || status === 403) {
      // ✅ Ne PAS déclencher la boucle si on est déjà sur /login ou /register
      const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register');
      const isAlreadyOnLoginPage = window.location.pathname === '/login';

      if (!isAuthEndpoint && !isAlreadyOnLoginPage) {
        console.warn(`🔒 ${status} - Nettoyage du token et redirection`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // Sur /login, on laisse l'erreur remonter au composant pour afficher le message
        console.warn(`${status} sur ${url} (endpoint public — pas de redirection)`);
      }
    } else if (error.response) {
      console.error(`❌ ${status} - ${error.response.data?.message || error.message}`);
    } else {
      console.error('❌ Erreur réseau:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;