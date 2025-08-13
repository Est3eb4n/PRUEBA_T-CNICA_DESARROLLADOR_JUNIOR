export class SaleService {
  constructor(db) {
    this.db = db;
  }

  async validateSaleData(saleData) {
    const errors = {};
    
    // Validación de vendedor
    if (!saleData.seller_id || isNaN(saleData.seller_id)) {
      errors.seller_id = 'ID de vendedor inválido';
    }
    
    // Validación de producto
    if (!saleData.product_id || isNaN(saleData.product_id)) {
      errors.product_id = 'ID de producto inválido';
    }
    
    // Validación de cantidad
    if (!saleData.quantity || isNaN(saleData.quantity) || parseInt(saleData.quantity) <= 0) {
      errors.quantity = 'La cantidad debe ser un número mayor a cero';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new Error('Datos de venta inválidos');
      error.validationErrors = errors;
      throw error;
    }
  }

  async createSale(saleData) {
    await this.validateSaleData(saleData);
    
    // Verificar existencia de vendedor y producto
    const sellerService = new SellerService(this.db);
    const productService = new ProductService(this.db);
    
    const [seller, product] = await Promise.all([
      sellerService.getSellerById(saleData.seller_id),
      productService.getProductById(saleData.product_id)
    ]);
    
    // Verificar stock suficiente
    const quantity = parseInt(saleData.quantity);
    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
    }
    
    // Calcular precio total
    const totalPrice = product.price * quantity;
    
    // Iniciar transacción
    await this.db.run('BEGIN TRANSACTION');
    
    try {
      // Crear venta
      const { lastID } = await this.db.run(
        `INSERT INTO Sale (seller_id, product_id, quantity, total_price) 
         VALUES (?, ?, ?, ?)`,
        [seller.id, product.id, quantity, totalPrice]
      );
      
      // Actualizar stock
      await this.db.run(
        `UPDATE Product SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [quantity, product.id]
      );
      
      await this.db.run('COMMIT');
      
      return this.getSaleById(lastID);
    } catch (error) {
      await this.db.run('ROLLBACK');
      throw error;
    }
  }

  async getSaleById(id) {
    const sale = await this.db.get(
      `SELECT s.*, 
              p.name as product_name, 
              p.price as product_price,
              sl.name as seller_name
       FROM Sale s
       JOIN Product p ON s.product_id = p.id
       JOIN Seller sl ON s.seller_id = sl.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (!sale) {
      const error = new Error('Venta no encontrada');
      error.code = 'NOT_FOUND';
      throw error;
    }
    
    return sale;
  }

  async getAllSales() {
    return this.db.all(
      `SELECT s.id, 
              s.sale_date,
              s.quantity,
              s.total_price,
              p.name as product_name,
              sl.name as seller_name
       FROM Sale s
       JOIN Product p ON s.product_id = p.id
       JOIN Seller sl ON s.seller_id = sl.id
       ORDER BY s.sale_date DESC`
    );
  }
}