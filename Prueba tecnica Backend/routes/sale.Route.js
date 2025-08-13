import { Router } from 'express';
import { SaleController } from '../controller/sale.Controller.js';
import { SaleService } from '../services/sale.Service.js';
import { connectDB } from '../config/database.js';

const saleRouter = Router();
const db = await connectDB();
const saleService = new SaleService(db);
const saleController = new SaleController(saleService);

saleRouter.get('/', saleController.getAll.bind(saleController));
saleRouter.get('/:id', saleController.getById.bind(saleController));
saleRouter.post('/', saleController.create.bind(saleController));
saleRouter.delete('/:id', saleController.delete.bind(saleController));
saleRouter.get('/seller/:seller_id', saleController.getBySeller.bind(saleController));  // Corregido de "seler" a "seller"
saleRouter.get('/product/:product_id', saleController.getByProduct.bind(saleController));

export default saleRouter;