const express = require('express');
const ProductController = require('../controllers/product.Controller');

const router = express.Router();

module.exports = (services) => {
  const controller = new ProductController(services.productService);
  
  router.get('/', controller.getAllProducts.bind(controller));
  router.get('/:id', controller.getProductById.bind(controller));
  router.post('/', controller.createProduct.bind(controller));
  router.put('/:id', controller.updateProduct.bind(controller));
  router.delete('/:id', controller.deleteProduct.bind(controller));
  
  return router;
};