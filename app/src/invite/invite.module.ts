import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesModule } from 'src/roles/roles.module';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  imports: [PrismaModule, RolesModule],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService]
})
export class InviteModule {}
