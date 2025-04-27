import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtGlobalConfig } from './config';
import { PrismaService } from './services/prisma/prisma.service';

@Module({
  imports: [AuthModule, UserModule, JwtGlobalConfig],
  providers: [PrismaService],
})
export class AppModule {}
