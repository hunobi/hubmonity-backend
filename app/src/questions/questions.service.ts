import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Privilege, Question } from '@prisma/client';
import { ObjectID } from 'bson';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagsService } from 'src/tags/tags.service';
import { UsersService } from 'src/users/users.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
    constructor(private prisma : PrismaService, 
        private tag_service : TagsService,
        private users_service : UsersService
    ){}
        
    async public_getQuestionByID(user_id: string, quest_id : string) : Promise<Question>{
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        const role = await this.users_service.getUserRole(user_id);
        if(!role || role.questions.indexOf(Privilege.CAN_READ) === -1){throw new ForbiddenException()}
        return this.getQuestionByID(quest_id);
    }

    
    async public_createQuestion(user_id: string, data : CreateQuestionDto){

        const role = await this.users_service.getUserRole(user_id);
        if(!role || role.questions.indexOf(Privilege.CAN_WRITE) === -1){throw new ForbiddenException()}
        
        return await this.createQuestion(user_id, data);
    }

    async public_deleteQuestion(user_id : string, quest_id : string){
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        const role = await this.users_service.getUserRole(user_id);
        if(!role || role.questions.indexOf(Privilege.CAN_DELETE) === -1){throw new ForbiddenException()}
        return await this.prisma.question.delete({where:{id: quest_id}});
    }
    
    async public_set_solved_status(user_id : string, quest_id: string){
        if(ObjectID.isValid(quest_id)){throw new NotFoundException()}
        const question = await this.getQuestionByID(quest_id);
        if(question.author_id !== user_id){
            const role = await this.users_service.getUserRole(user_id);
            if(!role || role.questions.indexOf(Privilege.CAN_UPDATE) === -1){throw new ForbiddenException()}
        }
        return await this.prisma.question.update({
            where:{id: quest_id}, data: {solved: true}
        }) 
    }

    // ---------------

    async getQuestionByID(quest_id : string) : Promise<Question>{
        return await this.prisma.question.findUnique({where:{id: quest_id}, include:{
            solutions:true, tags:true, 
            author:{select:{id: true, nickname:true, public_key: true, profile: true, create_account_timestamp: true}},
            visitors:{select:{id: true, nickname:true, public_key: true, profile: true, create_account_timestamp: true}}
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
