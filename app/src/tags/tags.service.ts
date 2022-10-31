import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma : PrismaService){}

    async getByName_public(tagName : string){
        if(!tagName){throw new NotFoundException()}
        const ans = await this.getByName(tagName);
        if(!ans) {throw new NotFoundException();}
        return ans;
    }

    async follow_tag_public(user_id : string, tag_name : string){
        // Does tag exist?
        const tag = await this.getByName(tag_name);
        if(!tag) {throw new NotFoundException();}
        // Am I follower?
        if(tag.follower_id.indexOf(user_id) > -1){throw new BadRequestException();}
        // Am I black lister?
        if(tag.black_lister_id.indexOf(user_id) > -1){throw new BadRequestException();}
        // I am okay,so...
        await this.prisma.tag.update({where: {id: tag.id}, data:{
            followers :{
                connect : {
                    id: user_id
                }
            }
        }})
        return;
    }

    async unfollow_tag_public(user_id : string, tag_name : string){
        const tag = await this.getByName(tag_name);
        if(!tag) {throw new NotFoundException();}
        // I am not a follower
        if(tag.follower_id.indexOf(user_id) === -1){throw new BadRequestException();}
        // Oh no! I am a follower. Let's change it!
        await this.prisma.tag.update({where: {id: tag.id}, data:{
            followers: {
                disconnect : {
                    id: user_id
                }
            }
        }});
        return;
    }

    async block_tag_public(user_id : string, tag_name : string){
        const tag = await this.getByName(tag_name);
        if(!tag) {throw new NotFoundException();}
        // I am a black lister.
        if(tag.black_lister_id.indexOf(user_id) > -1){throw new BadRequestException();}
        // Eh. Let's go work..
        // First we must unfollow tag, so..
        await this.unfollow_tag_public(user_id, tag_name);
        // Now, Let's go to the black list
        await this.prisma.tag.update({where: {id: tag.id}, data: {
            black_list: {
                connect: {
                    id: user_id
                }
            }
        }});

        return;
         
    }

    async unlock_tag_public(user_id : string, tag_name : string){
        const tag = await this.getByName(tag_name);
        if(!tag) {throw new NotFoundException();}
        if(tag.black_lister_id.indexOf(user_id) === -1){throw new BadRequestException();}
        await this.prisma.tag.update({where:{id: tag.id}, 
            data:{black_list: {disconnect: {id: user_id}}}});
        return ;
    }


    // -------------

    async getByName(tagName : string): Promise<Tag>{
        const ans = await this.prisma.tag.findUnique({
            where:{name: tagName},
            include:{
                _count:{
                    select: {
                        followers : true,
                        questions : true,
                        black_list : true
                    }
                }
            }
        });
        return ans;
    }

    async create_tag(tagName:string) : Promise<Tag>{
        const ans = await this.getByName(tagName);
        if(ans){throw new ConflictException();}
        
        return this.prisma.tag.create({data: {name : tagName}});
    }

    async check_and_create_if_not_exist(tag_name : string): Promise<Tag>{
        const ans = await this.getByName(tag_name);
        if(ans){
            return ans;
        }
        return await this.create_tag(tag_name);
    }
}
