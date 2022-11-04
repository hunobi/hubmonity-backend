import { Controller, Delete, Get, Patch, Post, UseGuards, Param, HttpCode } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { RatingType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { SolutionsService } from './solutions.service';

@Controller('solutions')
export class SolutionsController {
    constructor(
        private solutions_service : SolutionsService
    ){}

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    getSolution(@AuthUser() userInfo : AuthUserDto, @Param('id') id_solution : string){
        return this.solutions_service.public_getSolution(userInfo.user_id, id_solution);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(201)
    createSolution(@AuthUser() userInfo : AuthUserDto, @Body() data : CreateSolutionDto){
        return this.solutions_service.public_createSolution(userInfo.user_id, data);
    }

    @Patch('/:id/add_rating')
    @UseGuards(JwtAuthGuard)
    addRatingToSolution(@AuthUser() userInfo : AuthUserDto, 
        @Param('id') id_solution : string, 
        @Body() value : RatingType
    ){
        return this.solutions_service.public_addRating(userInfo.user_id, id_solution, value);
    }

    @Patch('/:id/remove_rating')
    @UseGuards(JwtAuthGuard)
    removeRatingFromSolution(@AuthUser() userInfo : AuthUserDto, @Param('id') id_solution : string){
        return this.solutions_service.public_removeRating(userInfo.user_id, id_solution);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    deleteSolution(@AuthUser() userInfo : AuthUserDto, @Param('id') id_solution : string){
        return this.solutions_service.public_deleteSolution(userInfo.user_id, id_solution);
    }
}
