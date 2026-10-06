import api from './axios';

export const authService = {
  // Autenticación de usuario
  async login(username, password) {
    const response = await api.post('/auth/login', {
      username: username,
      email: username,
      password: password,
    });
    return response.data;
  },

  // Consulta de perfil por ID
  async getProfile(id) {
    const response = await api.get(`/auth/profile/${id}`);
    return response.data;
  },

  // Listado de usuarios del sistema
  async getAllUsers() {
    const response = await api.get('/auth/users');
    return response.data;
  },

  // Obtención de métricas en tiempo real para el Dashboard
  async getDashboardMetrics() {
    try {
      const [productosRes, stockBajoRes, pedidosRes, despachosRes] = await Promise.allSettled([
        api.get('/productos'),
        api.get('/productos/stock-bajo'),
        api.get('/pedidos'),
        api.get('/despachos'),
      ]);

      const totalProductos = productosRes.status === 'fulfilled' && Array.isArray(productosRes.value.data)
        ? productosRes.value.data.length
        : 0;

      const totalStockBajo = stockBajoRes.status === 'fulfilled' && Array.isArray(stockBajoRes.value.data)
        ? stockBajoRes.value.data.length
        : 0;

      const pedidos = pedidosRes.status === 'fulfilled' && Array.isArray(pedidosRes.value.data)
        ? pedidosRes.value.data
        : [];
      const totalPedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION').length;

      const despachos = despachosRes.status === 'fulfilled' && Array.isArray(despachosRes.value.data)
        ? despachosRes.value.data
        : [];
      const totalDespachosEnCurso = despachos.filter(d => d.estado === 'EN_RUTA' || d.estado === 'EN_TRANSITO').length;

      return {
        totalProductos,
        totalStockBajo,
        totalPedidosPendientes: totalPedidosPendientes || pedidos.length,
        totalDespachosEnCurso: totalDespachosEnCurso || despachos.length,
        pedidos,
        despachos,
      };
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      return {
        totalProductos: 0,
        totalStockBajo: 0,
        totalPedidosPendientes: 0,
        totalDespachosEnCurso: 0,
        pedidos: [],
        despachos: [],
      };
    }
  },
};

export default authService;
