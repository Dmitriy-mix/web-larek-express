import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

interface IError extends Error {
  statusCode?: number;
  code?: number;
}

export default (err: IError, req: Request, res: Response, _next: NextFunction) => {
  // 1. Валидация Mongoose → 400
  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  // 2. CastError (невалидный _id) → 400
  if (err instanceof MongooseError.CastError) {
    return res.status(400).json({ message: 'Некорректный идентификатор' });
  }

  // 3. Дубликат уникального поля → 409
  // Проверяем и по коду, и по тексту — для надёжности
  if (err.code === 11000 || (err instanceof Error && err.message.includes('E11000'))) {
    return res.status(409).json({
      message: 'Товар с таким названием уже существует',
    });
  }

  // 4. Кастомные ошибки с statusCode → соответствующий код
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // 5. Всё остальное → 500 без деталей
  return res.status(500).json({ message: 'Ошибка сервера' });
};