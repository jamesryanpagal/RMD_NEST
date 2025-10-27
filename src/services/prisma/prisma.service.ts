import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "generated/prisma";
import { DefaultArgs } from "generated/prisma/runtime/library";
import { config } from "src/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.log({ error });
      throw new InternalServerErrorException();
    }
  }

  override async $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<any[]>;

  override async $transaction<R>(
    fn: (
      prisma: Omit<
        PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
        | "$on"
        | "$connect"
        | "$disconnect"
        | "$use"
        | "$transaction"
        | "$extends"
      >,
    ) => Promise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<R>;

  override async $transaction(
    arg: any,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<any> {
    return await super.$transaction(arg, {
      timeout: config.transaction_timeout,
      ...options,
    });
  }
}
