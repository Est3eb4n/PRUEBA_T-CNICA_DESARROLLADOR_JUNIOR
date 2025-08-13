import { ApiClient } from './api.js';

class SalesUI {
  constructor() {
    this.apiClient = new ApiClient();
    this.saleForm = document.getElementById('sale-form');
    this.salesTable = document.getElementById('sales-table')?.querySelector('tbody');
    this.errorContainer = document.getElementById('error-container');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.sellersDropdown = document.getElementById('sale-seller');
    this.productsDropdown = document.getElementById('sale-product');
    this.productPriceElement = document.getElementById('product-price');
    this.productStockElement = document.getElementById('product-stock');
    this.totalPriceElement = document.getElementById('total-price');

    if (!this.checkRequiredElements()) {
      console.error('Error: Elementos críticos del DOM no encontrados en SalesUI');
      return;
    }

    this.init();
  }

  checkRequiredElements = () => {
    const requiredElements = [
      this.saleForm,
      this.salesTable,
      this.errorContainer,
      this.loadingIndicator,
      this.sellersDropdown,
      this.productsDropdown,
      this.productPriceElement,
      this.productStockElement,
      this.totalPriceElement
    ];
    return requiredElements.every(element => element !== null);
  }

  init = () => {
    this.setupEventListeners();
    this.loadSales();
    this.loadFormData();
  }

  setupEventListeners = () => {
    if (this.saleForm) {
      this.saleForm.addEventListener('submit', this.handleSaleSubmit);
    }

    const quantityInput = document.getElementById('sale-quantity');
    if (quantityInput) {
      quantityInput.addEventListener('input', this.calculateTotal);
    }

    if (this.productsDropdown) {
      this.productsDropdown.addEventListener('change', () => {
        this.updateProductInfo();
        this.calculateTotal();
      });
    }
  }

  handleSaleSubmit = async (e) => {
    e.preventDefault();
    this.showLoading(true);
    this.clearError();

    const formData = new FormData(this.saleForm);
    const saleData = {
      seller_id: formData.get('seller_id'),
      product_id: formData.get('product_id'),
      quantity: formData.get('quantity')
    };

    try {
      await this.apiClient.createSale(saleData);
      this.showSuccess('Venta registrada exitosamente');
      this.saleForm.reset();
      await this.loadSales();
      await this.loadFormData();
    } catch (error) {
      this.showError(`Error al registrar venta: ${this.getUserFriendlyError(error)}`);
      console.error('Sale form error:', error);
    } finally {
      this.showLoading(false);
    }
  }

  loadSales = async () => {
    this.showLoading(true);
    this.clearError();

    try {
      const response = await this.apiClient.fetchSales();
      
      if (!response.data || response.data.length === 0) {
        this.salesTable.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">No hay ventas registradas</td>
          </tr>
        `;
        return;
      }

      this.salesTable.innerHTML = response.data.map(sale => `
        <tr>
          <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
          <td>${sale.seller_name}</td>
          <td>${sale.product_name}</td>
          <td>${sale.quantity}</td>
          <td>$${sale.total_price.toFixed(2)}</td>
          <td>
            <button class="btn-view" data-id="${sale.id}">Ver</button>
          </td>
        </tr>
      `).join('');

      // Delegación de eventos
      this.salesTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-view')) {
          this.viewSaleDetails(e.target.dataset.id);
        }
      });

    } catch (error) {
      this.showError(`Error al cargar ventas: ${this.getUserFriendlyError(error)}`);
      console.error('Error loading sales:', error);
    } finally {
      this.showLoading(false);
    }
  }

  loadFormData = async () => {
    this.showLoading(true);
    this.clearError();

    try {
      const [sellersResponse, productsResponse] = await Promise.all([
        this.apiClient.fetchSellers(),
        this.apiClient.fetchProducts()
      ]);

      // Llenar dropdown de vendedores
      if (this.sellersDropdown) {
        this.sellersDropdown.innerHTML = sellersResponse.data.map(seller => `
          <option value="${seller.id}">${seller.name}</option>
        `).join('');
      }

      // Llenar dropdown de productos
      if (this.productsDropdown) {
        this.productsDropdown.innerHTML = productsResponse.data.map(product => `
          <option value="${product.id}" 
                  data-price="${product.price}" 
                  data-stock="${product.stock}">
            ${product.name} ($${product.price.toFixed(2)})
          </option>
        `).join('');
      }

      // Actualizar información del producto seleccionado
      await this.updateProductInfo();

    } catch (error) {
      this.showError(`Error al cargar datos del formulario: ${this.getUserFriendlyError(error)}`);
      console.error('Error loading form data:', error);
    } finally {
      this.showLoading(false);
    }
  }

  updateProductInfo = async () => {
    if (!this.productsDropdown) return;

    const selectedProduct = this.productsDropdown.options[this.productsDropdown.selectedIndex];
    const price = parseFloat(selectedProduct.dataset.price);
    const stock = parseInt(selectedProduct.dataset.stock);

    if (this.productPriceElement) {
      this.productPriceElement.textContent = price.toFixed(2);
    }
    
    if (this.productStockElement) {
      this.productStockElement.textContent = stock;
    }
    
    // Actualizar cantidad máxima
    const quantityInput = document.getElementById('sale-quantity');
    if (quantityInput) {
      quantityInput.max = stock;
      if (parseInt(quantityInput.value) > stock) {
        quantityInput.value = stock;
      }
    }
  }

  calculateTotal = () => {
    const quantityInput = document.getElementById('sale-quantity');
    if (!quantityInput || !this.productPriceElement || !this.totalPriceElement) return;

    const quantity = parseInt(quantityInput.value) || 0;
    const price = parseFloat(this.productPriceElement.textContent) || 0;
    const total = quantity * price;
    
    this.totalPriceElement.textContent = total.toFixed(2);
  }

  viewSaleDetails = async (saleId) => {
    try {
      this.showLoading(true);
      this.clearError();

      const response = await this.apiClient.getSale(saleId);
      const sale = response.data;

      // Mostrar detalles en un modal o alerta
      alert(`
        Detalles de Venta #${sale.id}
        ----------------------------
        Fecha: ${new Date(sale.sale_date).toLocaleString()}
        Vendedor: ${sale.seller_name}
        Producto: ${sale.product_name} ($${sale.product_price.toFixed(2)})
        Cantidad: ${sale.quantity}
        Total: $${sale.total_price.toFixed(2)}
      `);
    } catch (error) {
      this.showError(`Error al cargar detalles: ${this.getUserFriendlyError(error)}`);
      console.error('Error viewing sale:', error);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading = (show) => {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = show ? 'block' : 'none';
    }
  }

  showError = (message) => {
    if (this.errorContainer) {
      this.errorContainer.innerHTML = `
        <div class="alert alert-danger">
          ${message}
        </div>
      `;
      this.errorContainer.style.display = 'block';
    }
  }

  showSuccess = (message) => {
    const successElement = document.createElement('div');
    successElement.className = 'alert alert-success';
    successElement.textContent = message;
    document.body.appendChild(successElement);
    
    setTimeout(() => {
      successElement.remove();
    }, 3000);
  }

  clearError = () => {
    if (this.errorContainer) {
      this.errorContainer.style.display = 'none';
      this.errorContainer.innerHTML = '';
    }
  }

  getUserFriendlyError = (error) => {
    if (error.message.includes('No se pudo conectar con el servidor')) {
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }
    
    if (error.code === 'INSUFFICIENT_STOCK') {
      return error.message;
    }
    
    return error.message || 'Error desconocido';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new SalesUI();
  } catch (error) {
    console.error('Error al inicializar SalesUI:', error);
    const errorContainer = document.getElementById('error-container') || document.body;
    errorContainer.innerHTML = `
      <div class="alert alert-danger">
        Error crítico al iniciar el módulo de ventas
      </div>
    `;
  }
});