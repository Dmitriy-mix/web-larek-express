import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';

import router from './routes';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import { requestLogger, errorLogger } from './middlewares/logger';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';


const app = express();

app.use(cors({ origin: ORIGIN_ALLOW }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// 1. Логгер запросов — ДО роутов
app.use(requestLogger);

// 2. Роуты
app.use(router);

// 3. 404 — ПОСЛЕ роутов, ДО логгера ошибок
app.use((_req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

// 4. Обработчик ошибок celebrate
app.use(errors());

// 5. Логгер ошибок — ПОСЛЕ всего, что может бросить ошибку
app.use(errorLogger);

// 6. Централизованный обработчик — последний
app.use(errorHandler);

mongoose.connect(DB_ADDRESS)
  .then(() => console.log('Подключение к MongoDB'))
  .catch((err) => console.error('MongoDB ошибка подключения:', err));

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));