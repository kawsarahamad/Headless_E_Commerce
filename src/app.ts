import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { docsRouter } from './routes/docs.js';
import { catalogRouter } from './routes/catalog.js';
import { cartRouter } from './routes/cart.js';
import { orderRouter } from './routes/order.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

app.get('/', (_req, res) => res.redirect('/docs'));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/docs', docsRouter);
app.use('/products', catalogRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
