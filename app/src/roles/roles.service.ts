import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Privilege } from '@prisma/client';
import { ObjectID } from 'bson';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/universal-dto/pagination.dto';
import { UsersService } from 'src/users/users.service';
import { RoleDto } from './dto/role.dto';
import * as dotenv from 'dotenv'
const env = dotenv.config({path: '.env'}).parsed;
const number_of_list = (+env.PAGINATION_ELEMENTS_PER_PAGE)

@Injectable()
export class RolesService {
    constructor(
        private prisma : PrismaService,
        private user_service : UsersService
    ){}

    async getByID(user_id : string, role_id: string){
        if(!await this.checkPrivilages(user_id, [Privilege.ROLES_CAN_READ])){throw new ForbiddenException();}
        if(!ObjectID.isValid(role_id)){throw new NotFoundException()}
        return await this.prisma.role.findUnique({where: {id: role_id}, select:{
            id : true, name : true, privileges: true
        }});
    }

    async getAll(user_id : string, query : PaginationDto){
        if(!await this.checkPrivilages(user_id, [Privilege.ROLES_CAN_READ])){throw new ForbiddenException();}
        return await this.prisma.role.findMany({skip: query.offset*number_of_list, take: query.offset, select:{
            id: true, name: true, privileges: true
        }}); 
    }

    async createRole(user_id :string, data: RoleDto){
        if(!await this.checkPrivilages(user_id, [Privilege.ROLES_CAN_READ, Privilege.ROLES_CAN_WRITE])){throw new ForbiddenException();}
        const role = await this.prisma.role.findFirst({where:{name: data.name}});
        if(!role){throw new ConflictException();}
        return await this.prisma.role.create({data:{name: data.name, privileges: data.privileges}});
    }

    async updateRole(user_id : string, role_id : string ,data : RoleDto){
        if(!ObjectID.isValid(role_id)){throw new NotFoundException()}
        if(!await this.checkPrivilages(user_id, [Privilege.ROLES_CAN_READ, Privilege.ROLES_CAN_WRITE, Privilege.ROLES_CAN_UPDATE])){throw new ForbiddenException();}
        const role = await this.prisma.role.findFirst({where:{name: data.name}});
        if(!role){throw new ConflictException();}
        return await this.prisma.role.update({where:{id:role_id}, data:data});
    }

    async deleteRole(user_id : string, role_id: string){
        if(!ObjectID.isValid(role_id)){throw new NotFoundException()}
        if(!await this.checkPrivilages(user_id, [Privilege.ROLES_CAN_READ, Privilege.ROLES_CAN_DELETE, Privilege.ROLES_CAN_UPDATE])){throw new ForbiddenException();}
        await this.prisma.role.delete({where:{id: user_id}});
        return;
    }

    /**
     * @user_id User ID
     * @privileges_required Privileges that are needed to perform the operation.
     * @Return True if user has required privilages, else return false.
     */
    async checkPrivilages(user_id : string, privileges_required : Privilege[]){
        const role = await this.user_service.getUserRole(user_id);
        let flag = true;
        privileges_required.forEach(priv => {
            if(!role.privileges.includes(priv)){
                flag = false;
            }
        });
        return flag;
    }

    /**
     * @user_id User ID
     * @roleName Role name that is needed to perform the operation.
     * @Return True if user role name is equal to required role name. Else false.
     */
    async checkRoleName(user_id : string, roleName: string){
        const role = await this.user_service.getUserRole(user_id);
        return role.name === roleName;
    }
}
