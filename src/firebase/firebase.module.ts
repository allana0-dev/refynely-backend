// src/firebase/firebase.module.ts
import { Module, Global } from '@nestjs/common';
import { FirebaseAdmin } from './firebase-admin';
import { FirebaseService } from './firebase.service';

@Global() // Makes this module global so you don't need to import it everywhere
@Module({
  providers: [FirebaseAdmin, FirebaseService],
  exports: [FirebaseAdmin, FirebaseService],
})
export class FirebaseModule {}
