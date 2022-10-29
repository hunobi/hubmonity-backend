import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, InviteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
