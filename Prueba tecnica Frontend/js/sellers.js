import { ApiClient } from './api.js';

class SellersUI {
  constructor() {
    this.apiClient = new ApiClient();
    this.sellerForm = document.getElementById('seller-form');
    this.sellersList = document.getElementById('sellers-list');
    this.errorContainer = document.getElementById('error-container');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.editMode = false;
    this.currentSellerId = null;

    if (!this.checkRequiredElements()) {
      console.error('Error: Elementos críticos del DOM no encontrados en SellersUI');
      return;
    }

    this.init();
  }

  checkRequiredElements = () => {
    const requiredElements = [
      this.sellerForm, 
      this.sellersList,
      this.errorContainer,
      this.loadingIndicator
    ];
    return requiredElements.every(element => element !== null);
  }

  init = () => {
    this.setupEventListeners();
    this.loadSellers();
  }

  setupEventListeners = () => {
    if (this.sellerForm) {
      this.sellerForm.addEventListener('submit', this.handleFormSubmit);
    }

    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.cancelEdit);
    }
  }

  handleFormSubmit = async (e) => {
    e.preventDefault();
    this.showLoading(true);
    this.clearError();

    const formData = new FormData(this.sellerForm);
    const sellerData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    try {
      if (this.editMode) {
        await this.apiClient.updateSeller(this.currentSellerId, sellerData);
        this.showSuccess('Vendedor actualizado exitosamente');
      } else {
        await this.apiClient.createSeller(sellerData);
        this.showSuccess('Vendedor creado exitosamente');
      }

      this.sellerForm.reset();
      this.cancelEdit();
      await this.loadSellers();
    } catch (error) {
      this.showError(`Error al ${this.editMode ? 'actualizar' : 'crear'} vendedor: ${this.getUserFriendlyError(error)}`);
      console.error('Form submit error:', error);
    } finally {
      this.showLoading(false);
    }
  }

  loadSellers = async () => {
    this.showLoading(true);
    this.clearError();

    try {
      const response = await this.apiClient.fetchSellers();
      
      if (!response.data || response.data.length === 0) {
        this.sellersList.innerHTML = `
          <div class="alert alert-info">
            No hay vendedores registrados
          </div>
        `;
        return;
      }

      this.sellersList.innerHTML = response.data.map(seller => `
        <div class="seller-card" data-id="${seller.id}">
          <h3>${seller.name}</h3>
          <p><strong>Email:</strong> ${seller.email || 'No especificado'}</p>
          <p><strong>Teléfono:</strong> ${seller.phone || 'No especificado'}</p>
          <div class="seller-actions">
            <button class="btn-edit" data-id="${seller.id}">Editar</button>
            <button class="btn-delete" data-id="${seller.id}">Eliminar</button>
          </div>
        </div>
      `).join('');

      // Delegación de eventos
      this.sellersList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
          this.startEdit(e.target.dataset.id);
        } else if (e.target.classList.contains('btn-delete')) {
          this.deleteSeller(e.target.dataset.id);
        }
      });

    } catch (error) {
      this.showError(`Error al cargar vendedores: ${this.getUserFriendlyError(error)}`);
      console.error('Error loading sellers:', error);
    } finally {
      this.showLoading(false);
    }
  }

  startEdit = async (sellerId) => {
    try {
      this.showLoading(true);
      this.clearError();

      const response = await this.apiClient.getSeller(sellerId);
      const seller = response.data;

      // Llenar el formulario
      this.sellerForm.querySelector('[name="name"]').value = seller.name;
      this.sellerForm.querySelector('[name="email"]').value = seller.email || '';
      this.sellerForm.querySelector('[name="phone"]').value = seller.phone || '';

      // Cambiar a modo edición
      this.editMode = true;
      this.currentSellerId = sellerId;
      
      // Actualizar UI
      document.getElementById('form-title').textContent = 'Editar Vendedor';
      document.getElementById('submit-btn').textContent = 'Actualizar';
      
      // Mostrar botón cancelar
      const cancelBtn = document.getElementById('cancel-edit');
      if (cancelBtn) cancelBtn.style.display = 'inline-block';

      // Desplazarse al formulario
      this.sellerForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      this.showError(`Error al cargar vendedor: ${this.getUserFriendlyError(error)}`);
      console.error('Error starting edit:', error);
    } finally {
      this.showLoading(false);
    }
  }

  cancelEdit = () => {
    this.editMode = false;
    this.currentSellerId = null;
    this.sellerForm.reset();
    
    // Restaurar UI
    document.getElementById('form-title').textContent = 'Agregar Vendedor';
    document.getElementById('submit-btn').textContent = 'Guardar';
    
    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) cancelBtn.style.display = 'none';

    // Limpiar errores de validación
    this.clearValidationErrors();
  }

  deleteSeller = async (sellerId) => {
    if (!confirm('¿Está seguro que desea eliminar este vendedor?')) {
      return;
    }

    this.showLoading(true);
    this.clearError();

    try {
      await this.apiClient.deleteSeller(sellerId);
      this.showSuccess('Vendedor eliminado exitosamente');
      await this.loadSellers();
    } catch (error) {
      this.showError(`Error al eliminar vendedor: ${this.getUserFriendlyError(error)}`);
      console.error('Error deleting seller:', error);
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
    this.sellerForm.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    
    this.sellerForm.querySelectorAll('.invalid-feedback').forEach(el => {
      el.remove();
    });
  }

  getUserFriendlyError = (error) => {
    if (error.message.includes('No se pudo conectar con el servidor')) {
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    }
    
    if (error.code === 'DUPLICATE_ENTRY') {
      return 'El email ya está registrado por otro vendedor.';
    }
    
    if (error.code === 'REFERENCE_CONSTRAINT') {
      return 'No se puede eliminar porque tiene ventas asociadas.';
    }
    
    return error.message || 'Error desconocido';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new SellersUI();
  } catch (error) {
    console.error('Error al inicializar SellersUI:', error);
    const errorContainer = document.getElementById('error-container') || document.body;
    errorContainer.innerHTML = `
      <div class="alert alert-danger">
        Error crítico al iniciar el módulo de vendedores
      </div>
    `;
  }
});