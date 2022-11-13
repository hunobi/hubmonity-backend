import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports : [PrismaModule, UsersModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports : [RolesService]
})
export class RolesModule {}
