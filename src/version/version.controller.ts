import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { VersionService } from './version.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('slides/:slideId/versions')
@UseGuards(FirebaseAuthGuard)
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  async list(
    @CurrentUser('id') userId: string,
    @Param('slideId') slideId: string,
  ) {
    return this.versionService.listVersions(userId, slideId);
  }

  @Post(':versionId/revert')
  async revert(
    @CurrentUser('id') userId: string,
    @Param('slideId') slideId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionService.revertVersion(userId, slideId, versionId);
  }
}
