import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Privilege, Question } from '@prisma/client';
import { ObjectID } from 'bson';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from 'src/roles/roles.service';
import { TagsService } from 'src/tags/tags.service';
import { UsersService } from 'src/users/users.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
    constructor(private prisma : PrismaService, 
        private tag_service : TagsService,
        private users_service : UsersService,
        private roles_service : RolesService
    ){}
        
    async public_getQuestionByID(user_id: string, quest_id : string) : Promise<Question>{
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.QUESTIONS_CAN_READ])){throw new ForbiddenException();}
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        return this.getQuestionByID(quest_id);
    }

    
    async public_createQuestion(user_id: string, data : CreateQuestionDto){
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.QUESTIONS_CAN_WRITE, Privilege.QUESTIONS_CAN_READ])){throw new ForbiddenException();}
        return await this.createQuestion(user_id, data);
    }

    async public_deleteQuestion(user_id : string, quest_id : string){
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.QUESTIONS_CAN_DELETE, Privilege.QUESTIONS_CAN_READ])){throw new ForbiddenException();}
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        return await this.prisma.question.delete({where:{id: quest_id}});
    }
    
    async public_set_solved_status(user_id : string, quest_id: string){
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        const question = await this.getQuestionByID(quest_id);
        if(question.author_id !== user_id){
            if(!await this.roles_service.checkPrivilages(user_id, [Privilege.QUESTIONS_CAN_READ, Privilege.QUESTIONS_CAN_UPDATE])){throw new ForbiddenException();}
        }
        return await this.prisma.question.update({
            where:{id: quest_id}, data: {solved: true}
        }) 
    }

    // ---------------

    async getQuestionByID(quest_id : string) : Promise<Question>{
        const select_user_fields = {id: true, nickname:true, public_key: true, profile: true, create_account_timestamp: true};
        return await this.prisma.question.findUnique({where:{id: quest_id}, include:{
            solutions:true, tags:true, 
            author:{select:select_user_fields},
            visitors:{select:select_user_fields}
        }});
    }

    async createQuestion(user_id: string, data : CreateQuestionDto){
        // scan tags, create if not exist and get ids
        const tag_ids = [];
        data.tags.forEach(async (tag)=>{
            const tmp = await this.tag_service.check_and_create_if_not_exist(tag);
            tag_ids.push(tmp.id);
        });
        // create new question
        const new_question = await this.prisma.question.create({data:{
            author: {connect:{id:user_id}},
            title : data.title,
            detail : data.detail,
            create_time : Date.now()
        }});
        // connect tags
        tag_ids.forEach(async (tag_id)=>{
            await this.prisma.question.update({where: {id: new_question.id}, data:{
                tags: {connect: {id:tag_id}}
            }})
        });
        return ;
    }
}
