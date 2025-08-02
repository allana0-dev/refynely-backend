// src/firebase/firebase-admin.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../secrets/firebase-service-account.json';

@Injectable()
export class FirebaseAdmin implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        storageBucket: `${serviceAccount.project_id}.appspot.com`, // Auto-generate from service account
      });
    } else {
      this.app = admin.app();
    }
  }

  getStorage() {
    return this.app.storage();
  }

  getAuth() {
    return this.app.auth();
  }

  getFirestore() {
    return this.app.firestore();
  }
}
