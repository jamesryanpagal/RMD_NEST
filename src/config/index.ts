import { ValidationPipe } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";

dotenv.config();

const enum ENVIRONMENT {
  DEV = "DEV",
  PROD = "PROD",
}

type EnvBaseConfigKey = {
  db: string;
  port: string;
  client: string;
  email_from: string;
  file_prefix: string;
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
};

const envBaseConfig: Record<ENVIRONMENT, EnvBaseConfigKey> = {
  [ENVIRONMENT.DEV]: {
    client: loadEnvbaseConfig("CLIENT", ENVIRONMENT.DEV),
    db: loadEnvbaseConfig("DATABASE_URL", ENVIRONMENT.DEV),
    port: loadEnvbaseConfig("PORT", ENVIRONMENT.DEV),
    file_prefix: loadEnvbaseConfig("FILE_PREFIX", ENVIRONMENT.DEV),
    email_from: loadEnvbaseConfig("EMAIL_FROM", ENVIRONMENT.DEV),
  },
  [ENVIRONMENT.PROD]: {
    client: loadEnvbaseConfig("CLIENT", ENVIRONMENT.PROD),
    db: loadEnvbaseConfig("DATABASE_URL", ENVIRONMENT.PROD),
    port: loadEnvbaseConfig("PORT", ENVIRONMENT.PROD),
    file_prefix: loadEnvbaseConfig("FILE_PREFIX", ENVIRONMENT.PROD),
    email_from: loadEnvbaseConfig("EMAIL_FROM", ENVIRONMENT.PROD),
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
