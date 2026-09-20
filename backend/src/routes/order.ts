import { Router } from 'express';
import { validateCreateOrder } from '../middlewares/validatons';
import createOrder from '../controllers/order';

const router = Router();

router.post('/', validateCreateOrder, createOrder);

export default router;
