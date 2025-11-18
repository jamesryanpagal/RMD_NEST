import { ValidationPipe } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";

dotenv.config();

export const enum ENVIRONMENT {
  DEV = "DEV",
  PROD = "PROD",
}

type EnvBaseConfigKey = {
  db: string;
  port: string;
  email_from: string;
  file_prefix: string;
  database_port: string;
  database_user: string;
  database_password: string;
  database_db: string;
  pg_admin_email: string;
  pg_admin_password: string;
  pg_admin_host_port: string;
  pg_admin_container_port: string;
};

type StandAlongConfigKey = {
  environment: string;
  global_prefix: string;
  jwt_secret: string;
  jwt_expiration: string;
  refresh_jwt_secret: string;
  refresh_jwt_expiration: string;
  transaction_timeout: number;
  resend_api_key: string;
  domain: string;
  email_reply_to: string;
  cors_prod_full: string;
  cors_prod: string;
  cors_local: string;
};

const loadEnvbaseConfig = (key: string, environment: ENVIRONMENT) => {
  return process.env[`${key}_${environment}`] || "";
};

const loadConfig = (key: string) => {
  return process.env[key] || "";
};

export const standAloneConfig: StandAlongConfigKey = {
  environment: loadConfig("ENVIRONMENT"),
  global_prefix: loadConfig("GLOBAL_PREFIX"),
  jwt_secret: loadConfig("JWT_SECRET"),
  jwt_expiration: loadConfig("JWT_EXPIRATION"),
  refresh_jwt_secret: loadConfig("REFRESH_JWT_SECRET"),
  refresh_jwt_expiration: loadConfig("REFRESH_JWT_EXPIRATION"),
  transaction_timeout: Number(loadConfig("TRANSACTION_TIMEOUT") || "100000"),
  resend_api_key: loadConfig("RESEND_API_KEY"),
  domain: loadConfig("DOMAIN"),
  email_reply_to: loadConfig("EMAIL_REPLY_TO"),
  cors_prod_full: loadConfig("CORS_PROD_FULL"),
  cors_prod: loadConfig("CORS_PROD"),
  cors_local: loadConfig("CORS_LOCAL"),
};

const envBaseConfig: Record<ENVIRONMENT, EnvBaseConfigKey> = {
  [ENVIRONMENT.DEV]: {
    db: loadEnvbaseConfig("DATABASE_URL", ENVIRONMENT.DEV),
    port: loadEnvbaseConfig("PORT", ENVIRONMENT.DEV),
    file_prefix: loadEnvbaseConfig("FILE_PREFIX", ENVIRONMENT.DEV),
    email_from: loadEnvbaseConfig("EMAIL_FROM", ENVIRONMENT.DEV),
    database_port: loadEnvbaseConfig("DATABASE_PORT", ENVIRONMENT.DEV),
    database_user: loadEnvbaseConfig("DATABASE_USER", ENVIRONMENT.DEV),
    database_password: loadEnvbaseConfig("DATABASE_PASSWORD", ENVIRONMENT.DEV),
    database_db: loadEnvbaseConfig("DATABASE_DB", ENVIRONMENT.DEV),
    pg_admin_email: loadEnvbaseConfig("PG_ADMIN_EMAIL", ENVIRONMENT.DEV),
    pg_admin_password: loadEnvbaseConfig("PG_ADMIN_PASSWORD", ENVIRONMENT.DEV),
    pg_admin_host_port: loadEnvbaseConfig(
      "PG_ADMIN_HOST_PORT",
      ENVIRONMENT.DEV,
    ),
    pg_admin_container_port: loadEnvbaseConfig(
      "PG_ADMIN_CONTAINER_PORT",
      ENVIRONMENT.DEV,
    ),
  },
  [ENVIRONMENT.PROD]: {
    db: loadEnvbaseConfig("DATABASE_URL", ENVIRONMENT.PROD),
    port: loadEnvbaseConfig("PORT", ENVIRONMENT.PROD),
    file_prefix: loadEnvbaseConfig("FILE_PREFIX", ENVIRONMENT.PROD),
    email_from: loadEnvbaseConfig("EMAIL_FROM", ENVIRONMENT.PROD),
    database_port: loadEnvbaseConfig("DATABASE_PORT", ENVIRONMENT.PROD),
    database_user: loadEnvbaseConfig("DATABASE_USER", ENVIRONMENT.PROD),
    database_password: loadEnvbaseConfig("DATABASE_PASSWORD", ENVIRONMENT.PROD),
    database_db: loadEnvbaseConfig("DATABASE_DB", ENVIRONMENT.PROD),
    pg_admin_email: loadEnvbaseConfig("PG_ADMIN_EMAIL", ENVIRONMENT.PROD),
    pg_admin_password: loadEnvbaseConfig("PG_ADMIN_PASSWORD", ENVIRONMENT.PROD),
    pg_admin_host_port: loadEnvbaseConfig(
      "PG_ADMIN_HOST_PORT",
      ENVIRONMENT.PROD,
    ),
    pg_admin_container_port: loadEnvbaseConfig(
      "PG_ADMIN_CONTAINER_PORT",
      ENVIRONMENT.PROD,
    ),
  },
};

export const config = {
  ...envBaseConfig[standAloneConfig.environment],
  ...standAloneConfig,
} as EnvBaseConfigKey & StandAlongConfigKey;

export const JwtGlobalConfig = JwtModule.register({
  global: true,
  secret: standAloneConfig.jwt_secret,
  signOptions: {
    expiresIn: standAloneConfig.jwt_expiration,
  },
});

export const GlobalValidationPipes = new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,
});
