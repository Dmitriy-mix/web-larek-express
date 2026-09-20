import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import router from './routes';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import { requestLogger, errorLogger } from './middlewares/logger';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';
import { errors } from 'celebrate';


const app = express();

app.use(cors({ origin: ORIGIN_ALLOW }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// 1. Логгер запросов — ДО всех роутов
app.use(requestLogger);

app.use(router);

// 2. Логгер ошибок — ПОСЛЕ роутов, но ДО обработчиков ошибок
app.use(errorLogger);

// 3. Обработчик ошибок celebrate
app.use(errors());

// 4. 404 — маршрут не найден
app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

// 5. Централизованный обработчик — последний
app.use(errorHandler);

mongoose.connect(DB_ADDRESS)
  .then(() => console.log('Подключение к MongoDB'))
  .catch((err) => console.error('MongoDB ошибка подключения:', err));

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));