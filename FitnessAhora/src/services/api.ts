import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitness_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. LA MAGIA: Interceptor de Respuestas
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (200, 201), la dejamos pasar sin hacer nada
    return response;
  },
  (error) => {
    // Si el backend nos rechaza con un 401 (Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o no autorizada. Cerrando sesión...');
      
      // Limpiamos todo rastro del usuario en el dispositivo
      localStorage.removeItem('fitness_token');
      localStorage.removeItem('fitness_user');
      delete api.defaults.headers.common['Authorization'];

      // Redirigimos al Login solo si no estamos ya allí
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Devolvemos el error para que los componentes puedan manejar mensajes específicos si lo desean
    return Promise.reject(error);
  }
);

export default api;