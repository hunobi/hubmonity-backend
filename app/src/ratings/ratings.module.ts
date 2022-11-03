import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingsService } from './ratings.service';

@Module({
  imports: [PrismaModule],
  providers: [RatingsService],
  exports: [RatingsService]
})
export class RatingsModule {}
