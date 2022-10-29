import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Invite } from '@prisma/client';
import {ObjectID} from 'bson';
import { PrismaService } from 'src/prisma/prisma.service';
import { InviteConfigDto } from './dto/inviteConfig.dto';

@Injectable()
export class InviteService {
    constructor(
        private prisma : PrismaService){}
    
    async getInvites(user_id : string) : Promise<Invite[]>{
        return await this.prisma.invite.findMany({where: {
            inviterID: user_id
        }});
    }

    async createInvite(user_id : string, config : InviteConfigDto): Promise<Invite>{
        let time_tmp = config.end_time - Date.now(); 
        // expiration time must be greater than 0 and less than 1 week
        if(time_tmp <= 0 || time_tmp > 604800000){throw new BadRequestException() } 
        return await this.prisma.invite.create({data: {
                inviter: {
                    connect:{
                        id: user_id
                    }
                },
                is_active : true,
                create_time: Date.now(),
                end_time: config.end_time
            }
        });
    }

    async deleteInvite(invite_id :string, user_id :string){
        if(!ObjectID.isValid(invite_id)){throw new BadRequestException();}
        const invite = await this.getInviteByID(invite_id);
        if(!invite){throw new NotFoundException();}
        if(invite.inviterID !== user_id){
            throw new ForbiddenException();
        }
        // we can delete only active invitate
        if(invite.is_active){
            await this.prisma.invite.delete({where: {id: invite_id}});
        }
        return;
    }



    async getInviteByID(invite_id) : Promise<Invite>{
        return await this.prisma.invite.findUnique({where: {id: invite_id}});
    }
}