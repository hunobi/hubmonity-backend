import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(
        private question_service : QuestionsService
    ){}

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    getQuestionByID(@AuthUser() userInfo : AuthUserDto,@Param('id') quest_id : string){
        return this.question_service.public_getQuestionByID(userInfo.user_id, quest_id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    createQuestion(@AuthUser() userInfo : AuthUserDto, data : CreateQuestionDto){
        return this.question_service.public_createQuestion(userInfo.user_id, data);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    solvedQuestion(@AuthUser() userInfo : AuthUserDto, @Param('id') id : string){
        return this.question_service.public_set_solved_status(userInfo.user_id, id);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    deleteQuestion(@AuthUser() userInfo : AuthUserDto, @Param('id') quest_id : string){
        return this.question_service.public_deleteQuestion(userInfo.user_id, quest_id);
    }
}
