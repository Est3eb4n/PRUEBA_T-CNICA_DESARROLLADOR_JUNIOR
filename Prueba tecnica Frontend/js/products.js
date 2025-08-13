import { ApiClient } from './api.js';

class ProductsUI {
  constructor() {
    this.apiClient = new ApiClient();
    this.productForm = document.getElementById('product-form');
    this.productsTable = document.getElementById('products-table')?.querySelector('tbody');
    this.errorContainer = document.getElementById('error-container');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.editMode = false;
    this.currentProductId = null;

    if (!this.checkRequiredElements()) {
      console.error('Error: Elementos críticos del DOM no encontrados en ProductsUI');
      return;
    }

    this.init();
  }

  checkRequiredElements = () => {
    const requiredElements = [
      this.productForm,
      this.productsTable,
      this.errorContainer,
      this.loadingIndicator
    ];
    return requiredElements.every(element => element !== null);
  }

  init = () => {
    this.setupEventListeners();
    this.loadProducts();
  }

  setupEventListeners = () => {
    if (this.productForm) {
      this.productForm.addEventListener('submit', this.handleProductSubmit);
    }

    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.cancelEdit);
    }
  }

  handleProductSubmit = async (e) => {
    e.preventDefault();
    this.showLoading(true);
    this.clearError();

    const formData = new FormData(this.productForm);
    const productData = {
      name: formData.get('name'),
      price: formData.get('price'),
      stock: formData.get('stock'),
      description: formData.get('description')
    };

    try {
      if (this.editMode) {
        await this.apiClient.updateProduct(this.currentProductId, productData);
        this.showSuccess('Producto actualizado exitosamente');
      } else {
        await this.apiClient.createProduct(productData);
        this.showSuccess('Producto creado exitosamente');
      }

      this.productForm.reset();
      this.cancelEdit();
      await this.loadProducts();
    } catch (error) {
      this.showError(`Error al ${this.editMode ? 'actualizar' : 'crear'} producto: ${this.getUserFriendlyError(error)}`);
      console.error('Product form error:', error);
    } finally {
      this.showLoading(false);
    }
  }

  loadProducts = async () => {
    this.showLoading(true);
    this.clearError();

    try {
      const response = await this.apiClient.fetchProducts();
      
      if (!response.data || response.data.length === 0) {
        this.productsTable.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">No hay productos registrados</td>
          </tr>
        `;
        return;
      }

      this.productsTable.innerHTML = response.data.map(product => `
        <tr data-id="${product.id}">
          <td>${product.name}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>${product.stock}</td>
          <td>${product.description || 'N/A'}</td>
          <td>
            <button class="btn-edit" data-id="${product.id}">Editar</button>
            <button class="btn-delete" data-id="${product.id}">Eliminar</button>
          </td>
        </tr>
      `).join('');

      // Delegación de eventos
      this.productsTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
          this.startEdit(e.target.dataset.id);
        } else if (e.target.classList.contains('btn-delete')) {
          this.deleteProduct(e.target.dataset.id);
        }
      });

    } catch (error) {
      this.showError(`Error al cargar productos: ${this.getUserFriendlyError(error)}`);
      console.error('Error loading products:', error);
    } finally {
      this.showLoading(false);
    }
  }

  startEdit = async (productId) => {
    try {
      this.showLoading(true);
      this.clearError();

      const response = await this.apiClient.getProduct(productId);
      const product = response.data;

      // Llenar el formulario
      this.productForm.querySelector('[name="name"]').value = product.name;
      this.productForm.querySelector('[name="price"]').value = product.price;
      this.productForm.querySelector('[name="stock"]').value = product.stock;
      this.productForm.querySelector('[name="description"]').value = product.description || '';

      // Cambiar a modo edición
      this.editMode = true;
      this.currentProductId = productId;
      
      // Actualizar UI
      document.getElementById('form-title').textContent = 'Editar Producto';
      document.getElementById('submit-btn').textContent = 'Actualizar';
      document.getElementById('cancel-edit').style.display = 'inline-block';

      // Desplazarse al formulario
      this.productForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      this.showError(`Error al cargar producto: ${this.getUserFriendlyError(error)}`);
      console.error('Error starting edit:', error);
    } finally {
      this.showLoading(false);
    }
  }

  cancelEdit = () => {
    this.editMode = false;
    this.currentProductId = null;
    this.productForm.reset();
    
    // Restaurar UI
    document.getElementById('form-title').textContent = 'Agregar Producto';
    document.getElementById('submit-btn').textContent = 'Guardar';
    document.getElementById('cancel-edit').style.display = 'none';

    // Limpiar errores de validación
    this.clearValidationErrors();
  }

  deleteProduct = async (productId) => {
    if (!confirm('¿Está seguro que desea eliminar este producto?')) {
      return;
    }

    this.showLoading(true);
    this.clearError();

    try {
      await this.apiClient.deleteProduct(productId);
      this.showSuccess('Producto eliminado exitosamente');
      await this.loadProducts();
    } catch (error) {
      this.showError(`Error al eliminar producto: ${this.getUserFriendlyError(error)}`);
      console.error('Error deleting product:', error);
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

  clearValidationErrors = () => {
    this.productForm.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    
    this.productForm.querySelectorAll('.invalid-feedback').forEach(el => {
      el.remove();
    });
  }

  getUserFriendlyError = (error) => {
    if (error.message.includes('No se pudo conectar con el servidor')) {
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }
    
    if (error.code === 'INSUFFICIENT_STOCK') {
      return error.message;
    }
    
    if (error.code === 'REFERENCE_CONSTRAINT') {
      return 'No se puede eliminar porque tiene ventas asociadas.';
    }
    
    return error.message || 'Error desconocido';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new ProductsUI();
  } catch (error) {
    console.error('Error al inicializar ProductsUI:', error);
    const errorContainer = document.getElementById('error-container') || document.body;
    errorContainer.innerHTML = `
      <div class="alert alert-danger">
        Error crítico al iniciar el módulo de productos
      </div>
    `;
  }
});