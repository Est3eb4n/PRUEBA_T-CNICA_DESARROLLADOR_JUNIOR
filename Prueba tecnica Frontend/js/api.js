export class ApiClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async handleRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.defaultHeaders,
      mode: 'cors',
      credentials: 'include'
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Manejar respuestas no exitosas
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        const error = new Error(errorData.message || 'Request failed');
        error.status = response.status;
        error.details = errorData.details;
        error.code = errorData.code;
        throw error;
      }

      // Manejar respuestas vacías
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request to ${url} failed:`, error);
      
      // Mejorar mensajes de error para el usuario
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      
      throw error;
    }
  }

  // Métodos para Vendedores
  async fetchSellers() {
    return this.handleRequest('/sellers');
  }

  async getSeller(id) {
    return this.handleRequest(`/sellers/${id}`);
  }

  async createSeller(sellerData) {
    return this.handleRequest('/sellers', 'POST', sellerData);
  }

  async updateSeller(id, sellerData) {
    return this.handleRequest(`/sellers/${id}`, 'PUT', sellerData);
  }

  async deleteSeller(id) {
    return this.handleRequest(`/sellers/${id}`, 'DELETE');
  }

  // Métodos para Productos
  async fetchProducts() {
    return this.handleRequest('/products');
  }

  async getProduct(id) {
    return this.handleRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.handleRequest('/products', 'POST', productData);
  }

  async updateProduct(id, productData) {
    return this.handleRequest(`/products/${id}`, 'PUT', productData);
  }

  async deleteProduct(id) {
    return this.handleRequest(`/products/${id}`, 'DELETE');
  }

  // Métodos para Ventas
  async fetchSales() {
    return this.handleRequest('/sales');
  }

  async getSale(id) {
    return this.handleRequest(`/sales/${id}`);
  }

  async createSale(saleData) {
    return this.handleRequest('/sales', 'POST', saleData);
  }

  // Método para verificar salud del servidor
  async checkHealth() {
    return this.handleRequest('/health');
  }
}