import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Invite, Privilege } from '@prisma/client';
import {ObjectID} from 'bson';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from 'src/roles/roles.service';
import { InviteConfigDto } from './dto/inviteConfig.dto';

@Injectable()
export class InviteService {
    constructor(
        private prisma : PrismaService,
        private roles_service : RolesService    
    ){}
    
    async getMyInvites(user_id : string) : Promise<Invite[]>{
        return await this.prisma.invite.findMany({where: {
            inviterID: user_id
        }});
    }

    async createInvite(user_id : string, config : InviteConfigDto): Promise<Invite>{
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.INVITES_CAN_WRITE])){throw new ForbiddenException();}
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
            if(!await this.roles_service.checkPrivilages(user_id, [Privilege.INVITES_CAN_DELETE])){throw new ForbiddenException();}
        }
        // we can delete only active invitate
        if(invite.is_active){
            await this.prisma.invite.delete({where: {id: invite_id}});
        }
        return;
    }

    //----

    async useInvite(invite_id: string, user_id : string){
        return await this.prisma.invite.update({where:{id:invite_id}, data:{
            invited :{connect: {id: user_id}},
            is_active: false,
            end_time : Date.now()
        }})
    }

    async getInviteByID(invite_id) : Promise<Invite>{
        return await this.prisma.invite.findUnique({where: {id: invite_id}});
    }
}
