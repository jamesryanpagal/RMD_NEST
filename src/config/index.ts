import { ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

const loadEnv = (key: string) => {
  return process.env[key] || '';
};

export const config = {
  db_url: loadEnv('DATABASE_URL'),
  port: Number(loadEnv('PORT') || '4001'),
  jwt_secret: loadEnv('JWT_SECRET'),
  global_prefix: loadEnv('GLOBAL_PREFIX'),
  dev_cors: loadEnv('DEV_CORS'),
  jwt_expiration: loadEnv('JWT_EXPIRATION'),
};

export const JwtGlobalConfig = JwtModule.register({
  global: true,
  secret: config.jwt_secret,
  signOptions: {
    expiresIn: config.jwt_expiration,
  },
});

export const GlobalValidationPipes = new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,
});
