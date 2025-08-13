import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import { ProductService } from './services/product.Service.js';
import { SaleService } from './services/sale.Service.js';
import { SellerService } from './services/seller.Service.js';
import { ProductController } from './controller/product.Controller.js';
import { SaleController } from './controller/sale.Controller.js';
import { SellerController } from './controller/seller.Controller.js';
import { errorHandler } from './middlewares/errorHandler.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5500;

  // Configuración CORS
  const corsOptions = {
    origin: [
      'http://127.0.0.1:5500', 
      'http://localhost:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // Inicialización de la base de datos
  const db = await initializeDatabase();

  // Inicialización de servicios
  const productService = new ProductService(db);
  const saleService = new SaleService(db);
  const sellerService = new SellerService(db);

  // Inicialización de controladores
  const productController = new ProductController(productService);
  const saleController = new SaleController(saleService);
  const sellerController = new SellerController(sellerService);

  // Rutas de la API - Versión corregida
  // Productos
  app.get('/api/products', (req, res) => productController.getAllProducts(req, res));
  app.post('/api/products', (req, res) => productController.createProduct(req, res));
  app.get('/api/products/:id', (req, res) => productController.getProduct(req, res));
  app.put('/api/products/:id', (req, res) => productController.updateProduct(req, res));
  app.delete('/api/products/:id', (req, res) => productController.deleteProduct(req, res));

  // Ventas
  app.get('/api/sales', (req, res) => saleController.getAllSales(req, res));
  app.post('/api/sales', (req, res) => saleController.createSale(req, res));
  app.get('/api/sales/:id', (req, res) => saleController.getSale(req, res));

  // Vendedores
  app.get('/api/sellers', (req, res) => sellerController.getAllSellers(req, res));
  app.post('/api/sellers', (req, res) => sellerController.createSeller(req, res));
  app.get('/api/sellers/:id', (req, res) => sellerController.getSeller(req, res));
  app.put('/api/sellers/:id', (req, res) => sellerController.updateSeller(req, res));
  app.delete('/api/sellers/:id', (req, res) => sellerController.deleteSeller(req, res));

  // Ruta de salud
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
  });

  // Manejo de errores
  app.use(errorHandler);

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('⛔ Error al iniciar el servidor:', err);
  process.exit(1);
});