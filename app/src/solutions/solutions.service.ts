import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ObjectID } from 'bson';
import { Prisma, Privilege, Question, Rating, RatingType, Solution } from '@prisma/client';
import { CreateRatingDto } from 'src/ratings/dto/create-rating.dto';
import { RatingsService } from 'src/ratings/ratings.service';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class SolutionsService {
    constructor(private prisma : PrismaService,
        private rating_service : RatingsService,
        private user_service : UsersService,
        private roles_service : RolesService
    ){}


    async public_getSolution(user_id : string, solution_id : string){
        const solution = await this.getSolutionByID(solution_id);
        if(!solution){throw new NotFoundException();}
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.SOLUTIONS_CAN_READ, Privilege.QUESTIONS_CAN_READ])){throw new ForbiddenException();}
        return solution;
    }

    async public_createSolution(user_id : string, body : CreateSolutionDto){
        if(!await this.roles_service.checkPrivilages(user_id, 
            [Privilege.SOLUTIONS_CAN_READ, Privilege.SOLUTIONS_CAN_WRITE, Privilege.QUESTIONS_CAN_READ]))
        {throw new ForbiddenException();}
        
        return this.createSolution(user_id, body);
    }

    async public_addRating(user_id : string, solution_id : string, value :RatingType){
        const solution = await this.getSolutionByID(solution_id);
        if(!solution){throw new NotFoundException();}
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.SOLUTIONS_CAN_READ, Privilege.QUESTIONS_CAN_READ, Privilege.RATINGS_CAN_WRITE])){throw new ForbiddenException();}
        const dto = new CreateRatingDto();
        dto.solution_id = solution_id;
        dto.voter_id = user_id;
        dto.value = value
        return await this.addRating(dto);
    }
    
    async public_removeRating(user_id : string, solution_id : string){
        const solution = await this.getSolutionByID(solution_id);
        if(!solution){throw new NotFoundException();}
        let rating = solution.ratings.find(rating => {
            return rating.voter_id === user_id;
        });
        if(rating.voter_id !== user_id){
            if(!await this.roles_service.checkPrivilages(user_id, [Privilege.SOLUTIONS_CAN_READ, Privilege.QUESTIONS_CAN_READ, Privilege.RATINGS_CAN_DELETE])){throw new ForbiddenException();}
        }
        await this.rating_service.cancelRating(rating);
        return;
    }

    async public_deleteSolution(user_id : string, solution_id : string){
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.SOLUTIONS_CAN_DELETE])){throw new ForbiddenException();}
        const solution = await this.getSolutionByID(solution_id);
        if(!solution){throw new NotFoundException();}
        await this.deleteSolution(solution_id);
        return;
    }
    
    // ---
    // Return aggregation types
    async getSolutionByID(solution_id : string) : Promise<Prisma.SolutionGetPayload<{include:{
            ratings:true,
            question:true,
            author:{select:{id: true, nickname:true, public_key: true, profile: true, create_account_timestamp: true}}}}>>
    {
        if(!ObjectID.isValid(solution_id)){return null}
        return await this.prisma.solution.findUnique({where: {id: solution_id},include:{
            ratings:true,
            question:true,
            author:{select:{id: true, nickname:true, public_key: true, profile: true, create_account_timestamp: true}},
        }});
    }

    async addRating(data : CreateRatingDto){
        this.rating_service.createRating(data);
    }

    async createSolution(author_id, data : CreateSolutionDto) : Promise<Solution>{
        return await this.prisma.solution.create({data:{
            author:{connect:{id:author_id}},
            question:{connect:{id:data.question_id}},
            create_time: Date.now(),
            content : data.content
        }});
    }

    async deleteSolution(solution_id:string){
        await this.prisma.solution.delete({where: {id: solution_id}});
    }
}
