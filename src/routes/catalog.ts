import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/productController.js';
import { validate } from '../middleware/validate.js';
import { getProductsQuery } from '../schemas/productSchemas.js';

export const catalogRouter = Router();

catalogRouter.get('/', validate(getProductsQuery, 'query'), listProducts);
catalogRouter.get('/:id', getProduct);
