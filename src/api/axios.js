// =============================
// CONFIGURACIÓN DE AXIOS
// =============================

// Instancia de axios con la URL base del backend
// Así no repetimos http://localhost:3000 en cada archivo

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de peticiones
// Agrega el token JWT automáticamente en cada petición
// Si el usuario está autenticado, el token se manda solo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('isc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api