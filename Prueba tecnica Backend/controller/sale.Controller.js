export class SaleController {
  constructor(saleService) {
    this.saleService = saleService;
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
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }

  async getAllSales(req, res) {
    try {
      const sales = await this.saleService.getAllSales();
      res.json({
        success: true,
        data: sales,
        count: sales.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async getSale(req, res) {
    try {
      const sale = await this.saleService.getSaleById(req.params.id);
      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async createSale(req, res) {
    try {
      const newSale = await this.saleService.createSale(req.body);
      res.status(201).json({
        success: true,
        data: newSale,
        message: 'Venta registrada exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }
}