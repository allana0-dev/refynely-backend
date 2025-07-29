import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UserController {
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getAuthenticatedUser(@Req() req: Request) {
    return {
      message: 'Authenticated!',
      user: req.user,
    };
  }
}
