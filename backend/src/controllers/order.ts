import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

interface IOrderRequest {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const createOrder = async (
  req: Request<{}, {}, IOrderRequest>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { total, items } = req.body;

    // Ищем товары в базе
    const products = await Product.find({ _id: { $in: items } });

    // Проверяем, что все товары найдены
    if (products.length !== items.length) {
      throw new BadRequestError('Некоторые товары не найдены');
    }

    // Проверяем, что у всех товаров есть цена
    const notForSale = products.filter((p) => p.price === null);
    if (notForSale.length > 0) {
      throw new BadRequestError('Некоторые товары не продаются');
    }

    // Считаем сумму и сравниваем с total
    const calculatedTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
    if (calculatedTotal !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    // Генерируем ID и возвращаем ответ
    const orderId = faker.string.uuid();
    res.status(200).json({
      id: orderId,
      total: calculatedTotal,
    });
  } catch (err) {
    next(err);
  }
};

export default createOrder;
