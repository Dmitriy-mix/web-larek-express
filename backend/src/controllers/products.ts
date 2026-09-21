import { Request, Response, NextFunction } from 'express';
import Product, { IProduct } from '../models/product';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    res.json({ items: products, total: products.length });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: Request<{}, {}, IProduct>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};
