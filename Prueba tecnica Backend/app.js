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
  const PORT = process.env.PORT || 3000;

  // Configuración CORS mejorada
  const corsOptions = {
    origin: [
      'http://127.0.0.1:5500', 
      'http://localhost:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
  };

  // Middleware para log de peticiones
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.use(cors(corsOptions));
  
  // Manejar preflight requests
  app.options('*', cors(corsOptions));
  
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

  // Middleware para verificar conexión
  app.use('/api', (req, res, next) => {
    console.log('Conexión recibida en /api');
    next();
  });

  // Rutas de la API
  // Productos
  app.get('/api/products', (req, res) => {
    console.log('Accediendo a /api/products');
    productController.getAllProducts(req, res);
  });
  
  // Productos
app.get('/api/products', (req, res) => productController.getAllProducts(req, res));
app.post('/api/products', (req, res) => productController.createProduct(req, res));
app.get('/api/products/:id', (req, res) => productController.getProduct(req, res)); // Asegúrate que :id tenga nombre
app.put('/api/products/:id', (req, res) => productController.updateProduct(req, res)); // Asegúrate que :id tenga nombre
app.delete('/api/products/:id', (req, res) => productController.deleteProduct(req, res)); // Asegúrate que :id tenga nombre

// Ventas
app.get('/api/sales', (req, res) => saleController.getAllSales(req, res));
app.post('/api/sales', (req, res) => saleController.createSale(req, res));
app.get('/api/sales/:id', (req, res) => saleController.getSale(req, res)); // Asegúrate que :id tenga nombre

// Vendedores
app.get('/api/sellers', (req, res) => sellerController.getAllSellers(req, res));
app.post('/api/sellers', (req, res) => sellerController.createSeller(req, res));
app.get('/api/sellers/:id', (req, res) => sellerController.getSeller(req, res)); // Asegúrate que :id tenga nombre
app.put('/api/sellers/:id', (req, res) => sellerController.updateSeller(req, res)); // Asegúrate que :id tenga nombre
app.delete('/api/sellers/:id', (req, res) => sellerController.deleteSeller(req, res)); // Asegúrate que :id tenga nombre
  // Ruta de salud
  app.get('/api/health', (req, res) => {
    console.log('Health check');
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      routes: {
        products: '/api/products',
        sales: '/api/sales',
        sellers: '/api/sellers'
      }
    });
  });

  // Middleware para rutas no encontradas
  app.use('/api', (req, res) => {
    console.warn(`Ruta no encontrada: ${req.originalUrl}`);
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Manejo de errores
  app.use(errorHandler);

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log('- GET /api/health');
    console.log('- GET /api/products');
    console.log('- GET /api/sales');
    console.log('- GET /api/sellers');
  });
}

startServer().catch(err => {
  console.error('⛔ Error al iniciar el servidor:', err);
  process.exit(1);
});