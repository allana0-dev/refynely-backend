import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import admin from '../firebase/firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const idToken = authHeader.split('Bearer ')[1];
    console.log('idToken', idToken);

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      const user = await this.prisma.user.upsert({
        where: { id: uid },
        update: {},
        create: {
          id: uid,
          email: email ?? '',
          name,
        },
      });

      req.user = user;
      return true;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
