export class SellerController {
  constructor(sellerService) {
    this.sellerService = sellerService;
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
    
    if (error.field === 'email') {
      return res.status(409).json({
        error: error.message,
        field: 'email',
        code: 'DUPLICATE_ENTRY'
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

  async getAllSellers(req, res) {
    try {
      const sellers = await this.sellerService.getAllSellers();
      res.json({
        success: true,
        data: sellers,
        count: sellers.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async getSeller(req, res) {
    try {
      const seller = await this.sellerService.getSellerById(req.params.id);
      res.json({
        success: true,
        data: seller
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async createSeller(req, res) {
    try {
      const newSeller = await this.sellerService.createSeller(req.body);
      res.status(201).json({
        success: true,
        data: newSeller,
        message: 'Vendedor creado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async updateSeller(req, res) {
    try {
      const updatedSeller = await this.sellerService.updateSeller(
        req.params.id, 
        req.body
      );
      res.json({
        success: true,
        data: updatedSeller,
        message: 'Vendedor actualizado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }

  async deleteSeller(req, res) {
    try {
      const deletedSeller = await this.sellerService.deleteSeller(req.params.id);
      res.json({
        success: true,
        data: deletedSeller,
        message: 'Vendedor eliminado exitosamente'
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }
}