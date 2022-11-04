import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { UsersModule } from 'src/users/users.module';
import { SolutionsController } from './solutions.controller';
import { SolutionsService } from './solutions.service';

@Module({
  imports: [PrismaModule, RatingsModule, UsersModule],
  controllers: [SolutionsController],
  providers: [SolutionsService],
  exports: [SolutionsService]
})
export class SolutionsModule {}
