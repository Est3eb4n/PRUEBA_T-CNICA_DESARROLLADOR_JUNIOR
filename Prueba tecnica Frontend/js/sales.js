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

  // Verificación mejorada de elementos
  if (!this.checkRequiredElements()) {
    console.error('Elementos críticos no encontrados');
    this.showError('Error al inicializar el módulo de ventas');
    return;
  }

  // Inicializar con valores por defecto
  this.resetProductInfo();
  
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

    // Validar respuestas
    if (!productsResponse?.data || productsResponse.data.length === 0) {
      throw new Error('No hay productos disponibles');
    }

    if (!sellersResponse?.data || sellersResponse.data.length === 0) {
      throw new Error('No hay vendedores disponibles');
    }

    // Llenar dropdowns
    this.populateSellersDropdown(sellersResponse.data);
    this.populateProductsDropdown(productsResponse.data);

    // Actualizar información inicial
    this.updateProductInfo();

  } catch (error) {
    console.error('Error en loadFormData:', error);
    this.showError(`Error al cargar datos: ${this.getUserFriendlyError(error)}`);
    this.resetProductInfo();
  } finally {
    this.showLoading(false);
  }
}

populateSellersDropdown = (sellers) => {
  if (!this.sellersDropdown) return;
  
  this.sellersDropdown.innerHTML = sellers.map(seller => `
    <option value="${seller.id}">${seller.name}</option>
  `).join('');
}

populateProductsDropdown = (products) => {
  if (!this.productsDropdown) return;
  
  this.productsDropdown.innerHTML = products.map(product => {
    const price = product.price || 0;
    const stock = product.stock || 0;
    
    return `
      <option value="${product.id}" 
              data-price="${price}" 
              data-stock="${stock}">
        ${product.name} ($${price.toFixed(2)})
      </option>
    `;
  }).join('');
}

  updateProductInfo = () => {
    try {
      // Verificar que el dropdown exista y tenga opciones
      if (!this.productsDropdown || this.productsDropdown.options.length === 0) {
        console.warn('Dropdown de productos no disponible o vacío');
        this.resetProductInfo();
        return;
      }

      // Obtener la opción seleccionada de manera segura
      const selectedIndex = this.productsDropdown.selectedIndex;
      const selectedProduct = selectedIndex >= 0
        ? this.productsDropdown.options[selectedIndex]
        : null;

      if (!selectedProduct || !selectedProduct.dataset) {
        console.warn('Producto seleccionado no válido');
        this.resetProductInfo();
        return;
      }

      // Obtener precio y stock con valores por defecto
      const price = parseFloat(selectedProduct.dataset.price) || 0;
      const stock = parseInt(selectedProduct.dataset.stock) || 0;

      // Actualizar UI
      this.updateProductUI(price, stock);

    } catch (error) {
      console.error('Error en updateProductInfo:', error);
      this.resetProductInfo();
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

  resetProductInfo = () => {
  if (this.productPriceElement) this.productPriceElement.textContent = '0.00';
  if (this.productStockElement) this.productStockElement.textContent = '0';
  
  const quantityInput = document.getElementById('sale-quantity');
  if (quantityInput) {
    quantityInput.max = 0;
    quantityInput.value = 0;
  }
  
  if (this.totalPriceElement) this.totalPriceElement.textContent = '0.00';
}

updateProductUI = (price, stock) => {
  if (this.productPriceElement) {
    this.productPriceElement.textContent = price.toFixed(2);
  }
  
  if (this.productStockElement) {
    this.productStockElement.textContent = stock;
  }
  
  const quantityInput = document.getElementById('sale-quantity');
  if (quantityInput) {
    quantityInput.max = stock;
    if (parseInt(quantityInput.value) > stock) {
      quantityInput.value = stock;
    }
  }
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