import * as Joi from 'joi';

import { Environment } from 'src/core/enums/environment.enum';

export const appConfigValidationSchema = Joi.object({
  ENVIRONMENT: Joi.string().valid(Environment.DEV, Environment.PROD).required(),
  APP_NAME: Joi.string().default('NestJS 🖥 StatDent'),
  APP_URL: Joi.string().default('https://statdent.dev'),
  PORT: Joi.number().default(3000),
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  IS_SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_DESCRIPTION: Joi.string().default('NestJS 🖥 StatDent API'),
  SWAGGER_VERSION: Joi.string().default('1'),
  SWAGGER_PATH: Joi.string().default('api'),
});
