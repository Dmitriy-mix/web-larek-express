import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';


interface IOrderRequest {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export const createOrder = async (
  req: Request<{}, {}, IOrderRequest>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payment, email, phone, address, total, items } = req.body;

    // 1. Проверка обязательных полей
    if (!payment || !email || !phone || !address || !items || !total) {
      throw new BadRequestError('Все поля обязательны');
    }

    // 2. payment — только card или online
    if (!['card', 'online'].includes(payment)) {
      throw new BadRequestError('Некорректный способ оплаты');
    }

    // 3. email — валидный
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Некорректный email');
    }

    // 4. items — непустой массив
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Список товаров не может быть пустым');
    }

    // 5. Ищем товары в базе
    const products = await Product.find({ _id: { $in: items } });

    // 6. Проверяем, что все товары найдены
    if (products.length !== items.length) {
      throw new NotFoundError('Некоторые товары не найдены');
    }

    // 7. Проверяем, что у всех товаров есть цена (товар продаётся)
    const notForSale = products.filter((p) => p.price === null);
    if (notForSale.length > 0) {
      throw new BadRequestError('Некоторые товары не продаются');
    }

    // 8. Считаем сумму и сравниваем с total
    const calculatedTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
    if (calculatedTotal !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    // 9. Генерируем ID и возвращаем ответ
    const orderId = faker.string.uuid();
    res.status(201).json({
      id: orderId,
      total: calculatedTotal,
    });
  } catch (err) {
    next(err);
  }
};