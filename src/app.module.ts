import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { AiModule } from './ai/ai.module';
import { VersionModule } from './version/version.module';
import { DeckModule } from './deck/deck.module';
import { FirebaseModule } from './firebase/firebase.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AiModule,
    VersionModule,
    DeckModule,
    FirebaseModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
