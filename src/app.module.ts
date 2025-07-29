import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
})
export class AppModule {}
