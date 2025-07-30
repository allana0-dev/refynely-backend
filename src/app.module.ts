import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, AiModule],
  controllers: [UserController],
})
export class AppModule {}
