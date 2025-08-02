// src/firebase/firebase.service.ts
import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from './firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(private firebaseAdmin: FirebaseAdmin) {}

  getStorage() {
    return this.firebaseAdmin.getStorage();
  }

  getAuth() {
    return this.firebaseAdmin.getAuth();
  }

  getFirestore() {
    return this.firebaseAdmin.getFirestore();
  }
}
