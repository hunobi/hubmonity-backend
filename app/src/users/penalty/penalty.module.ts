import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PenaltyController } from './penalty.controller';
import { PenaltyService } from './penalty.service';


@Module({
  providers: [PenaltyService],
  controllers: [PenaltyController],
  imports: [PrismaModule],
  exports: [PenaltyService]
})
export class PenaltyModule {}
