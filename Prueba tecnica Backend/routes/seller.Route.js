import { Router } from 'express';
import { SellerController } from '../controller/seller.Controller.js';
import { SellerService } from '../services/seller.Service.js';
import { connectDB } from '../config/database.js';

const sellerRouter = Router();
const db = await connectDB();
const sellerService = new SellerService(db);
const sellerController = new SellerController(sellerService);

sellerRouter.get('/', sellerController.getAll.bind(sellerController));
sellerRouter.get('/:id', sellerController.getById.bind(sellerController));
sellerRouter.post('/', sellerController.create.bind(sellerController));
sellerRouter.put('/:id', sellerController.update.bind(sellerController));
sellerRouter.delete('/:id', sellerController.delete.bind(sellerController));

export default sellerRouter;