export class ProductService {
  constructor(db) {
    this.db = db;
  }

  async validateProductData(productData, isUpdate = false) {
    const errors = {};
    
    // Validación de nombre
    if (!isUpdate || 'name' in productData) {
      if (!productData.name || productData.name.trim().length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres';
      }
    }
    
    // Validación de precio
    if (!isUpdate || 'price' in productData) {
      if (!productData.price || isNaN(productData.price) || Number(productData.price) <= 0) {
        errors.price = 'El precio debe ser un número mayor a cero';
      }
    }
    
    // Validación de stock (solo si se proporciona)
    if ('stock' in productData) {
      if (isNaN(productData.stock) || !Number.isInteger(Number(productData.stock)) || Number(productData.stock) < 0) {
        errors.stock = 'El stock debe ser un entero positivo';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new Error('Datos de producto inválidos');
      error.validationErrors = errors;
      throw error;
    }
  }

  async createProduct(productData) {
    await this.validateProductData(productData);
    
    const { lastID } = await this.db.run(
      `INSERT INTO Product (name, price, description, stock) 
       VALUES (?, ?, ?, ?)`,
      [
        productData.name.trim(),
        parseFloat(productData.price),
        productData.description?.trim(),
        parseInt(productData.stock) || 0
      ]
    );
    
    return this.getProductById(lastID);
  }

  async getProductById(id) {
    const product = await this.db.get(
      `SELECT * FROM Product WHERE id = ?`,
      [id]
    );
    
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.code = 'NOT_FOUND';
      throw error;
    }
    
    return product;
  }

  async getAllProducts() {
    return this.db.all(
      `SELECT id, name, price, description, stock 
       FROM Product 
       ORDER BY name ASC`
    );
  }

  async updateProduct(id, productData) {
    await this.validateProductData(productData, true);
    
    const existingProduct = await this.getProductById(id);
    const updatedData = { ...existingProduct, ...productData };
    
    await this.db.run(
      `UPDATE Product 
       SET name = ?, price = ?, description = ?, stock = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        updatedData.name.trim(),
        parseFloat(updatedData.price),
        updatedData.description?.trim(),
        parseInt(updatedData.stock) || 0,
        id
      ]
    );
    
    return this.getProductById(id);
  }

  async deleteProduct(id) {
    try {
      const product = await this.getProductById(id);
      
      await this.db.run(
        `DELETE FROM Product WHERE id = ?`,
        [id]
      );
      
      return product;
    } catch (error) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        throw new Error('No se puede eliminar el producto porque tiene ventas asociadas');
      }
      throw error;
    }
  }
}