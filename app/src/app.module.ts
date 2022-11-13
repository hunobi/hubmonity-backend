import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';
import { TagsModule } from './tags/tags.module';
import { RatingsModule } from './ratings/ratings.module';
import { SolutionsModule } from './solutions/solutions.module';
import { QuestionsModule } from './questions/questions.module';
import { FilesModule } from './files/files.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, 
    InviteModule, TagsModule, RatingsModule, 
    SolutionsModule, QuestionsModule, FilesModule, RolesModule],
})
export class AppModule {}
