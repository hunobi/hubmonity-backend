import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SolutionsModule } from 'src/solutions/solutions.module';
import { TagsModule } from 'src/tags/tags.module';
import { UsersModule } from 'src/users/users.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [PrismaModule, TagsModule, UsersModule],
  controllers: [QuestionsController],
  providers: [QuestionsService]
})
export class QuestionsModule {}
