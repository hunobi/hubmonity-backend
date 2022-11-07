import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PenaltyModule } from './penalty/penalty.module';


@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [PrismaModule, PenaltyModule],
  exports: [UsersService]
})
export class UsersModule {}
