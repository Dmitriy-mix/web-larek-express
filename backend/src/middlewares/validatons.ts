import { celebrate, Joi, Segments } from 'celebrate';

// Валидация для создания товара
export const validateCreateProduct = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

// Валидация для создания заказа
export const validateCreateOrder = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array()
      .items(Joi.string().hex().length(24))
      .min(1)
      .required(),
  }),
});
