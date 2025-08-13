export class SellerService {
  constructor(db) {
    this.db = db;
  }

  async validateSellerData(sellerData, isUpdate = false) {
    const errors = {};
    
    // Validación de nombre
    if (!isUpdate || 'name' in sellerData) {
      if (!sellerData.name || sellerData.name.trim().length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres';
      }
    }
    
    // Validación de email
    if (!isUpdate || 'email' in sellerData) {
      if (sellerData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sellerData.email)) {
          errors.email = 'El email no tiene un formato válido';
        }
      }
    }
    
    // Validación de teléfono
    if (!isUpdate || 'phone' in sellerData) {
      if (sellerData.phone && sellerData.phone.replace(/\D/g, '').length < 8) {
        errors.phone = 'El teléfono debe tener al menos 8 dígitos';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new Error('Datos de vendedor inválidos');
      error.validationErrors = errors;
      throw error;
    }
  }

  async createSeller(sellerData) {
    await this.validateSellerData(sellerData);
    
    try {
      const { lastID } = await this.db.run(
        `INSERT INTO Seller (name, email, phone) 
         VALUES (?, ?, ?)`,
        [
          sellerData.name.trim(),
          sellerData.email?.trim(),
          sellerData.phone?.replace(/\D/g, '')
        ]
      );
      
      return this.getSellerById(lastID);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed: Seller.email')) {
        const uniqueError = new Error('El email ya está registrado');
        uniqueError.field = 'email';
        throw uniqueError;
      }
      throw error;
    }
  }

  async getSellerById(id) {
    const seller = await this.db.get(
      `SELECT * FROM Seller WHERE id = ?`,
      [id]
    );
    
    if (!seller) {
      const error = new Error('Vendedor no encontrado');
      error.code = 'NOT_FOUND';
      throw error;
    }
    
    return seller;
  }

  async getAllSellers() {
    return this.db.all(
      `SELECT id, name, email, phone 
       FROM Seller 
       ORDER BY name ASC`
    );
  }

  async updateSeller(id, sellerData) {
    await this.validateSellerData(sellerData, true);
    
    const existingSeller = await this.getSellerById(id);
    const updatedData = { ...existingSeller, ...sellerData };
    
    await this.db.run(
      `UPDATE Seller 
       SET name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        updatedData.name.trim(),
        updatedData.email?.trim(),
        updatedData.phone?.replace(/\D/g, ''),
        id
      ]
    );
    
    return this.getSellerById(id);
  }

  async deleteSeller(id) {
    try {
      const seller = await this.getSellerById(id);
      
      await this.db.run(
        `DELETE FROM Seller WHERE id = ?`,
        [id]
      );
      
      return seller;
    } catch (error) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        throw new Error('No se puede eliminar el vendedor porque tiene ventas asociadas');
      }
      throw error;
    }
  }
}