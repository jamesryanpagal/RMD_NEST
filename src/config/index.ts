import { ValidationPipe } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";

dotenv.config();

const loadEnv = (key: string) => {
  return process.env[key] || "";
};

export const config = {
  db_url: loadEnv("DATABASE_URL"),
  port: Number(loadEnv("PORT") || "4001"),
  global_prefix: loadEnv("GLOBAL_PREFIX"),
  client: loadEnv("CLIENT"),
  jwt_secret: loadEnv("JWT_SECRET"),
  jwt_expiration: loadEnv("JWT_EXPIRATION"),
  refresh_jwt_secret: loadEnv("REFRESH_JWT_SECRET"),
  refresh_jwt_expiration: loadEnv("REFRESH_JWT_EXPIRATION"),
  transaction_timeout: Number(loadEnv("TRANSACTION_TIMEOUT") || "100000"),
  resend_api_key: loadEnv("RESEND_API_KEY"),
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
