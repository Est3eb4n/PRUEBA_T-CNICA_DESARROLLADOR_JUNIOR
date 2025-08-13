export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  async handleServiceError(error, res) {
    console.error('Controller Error:', error);
    
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ 
        error: error.message,
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    if (error.validationErrors) {
      return res.status(400).json({
        error: error.message,
        details: error.validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({
        error: error.message,
        code: 'INSUFFICIENT_STOCK'
      });
    }
    
    if (error.message.includes('eliminar')) {
      return res.status(400).json({
        error: error.message,
        code: 'REFERENCE_CONSTRAINT'
      });
    }
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }

  async getAllProducts(req, res) {
    try {
      const products = await this.productService.getAllProducts();
      res.json({
        success: true,
        data: products,
        count: products.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async getProduct(req, res) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async createProduct(req, res) {
    try {
      const newProduct = await this.productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Producto creado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async updateProduct(req, res) {
    try {
      const updatedProduct = await this.productService.updateProduct(
        req.params.id, 
        req.body
      );
      res.json({
        success: true,
        data: updatedProduct,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async deleteProduct(req, res) {
    try {
      const deletedProduct = await this.productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        data: deletedProduct,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }
}