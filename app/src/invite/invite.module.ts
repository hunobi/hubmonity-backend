import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  imports: [PrismaModule],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService]
})
export class InviteModule {}
