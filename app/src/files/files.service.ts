import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {createHash} from 'crypto';
import { ObjectID } from 'bson';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { unlink, readFile } from 'fs/promises';
import * as dotenv from 'dotenv'
import { PaginationDto } from '../universal-dto/pagination.dto';
import { RolesService } from 'src/roles/roles.service';
import { Privilege } from '@prisma/client';
const env = dotenv.config({path: '.env'}).parsed;

const number_of_list = (+env.PAGINATION_ELEMENTS_PER_PAGE)

@Injectable()
export class FilesService {
    constructor(
        private prisma : PrismaService,
        private roles_service : RolesService
    ){}
    
    async public_file_list(user_id: string, query : PaginationDto){
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.FILES_CAN_READ])){throw new ForbiddenException();}
        return await this.prisma.file.findMany({skip: query.offset*number_of_list, take:number_of_list, include:{
            owners:{
                select:{
                    id: true,public_key : true, create_account_timestamp: true, nickname: true, profile: true
                }
            }
        }});
    }

    async public_my_files(user_id: string, query : PaginationDto){
        return await this.prisma.file.findMany({where:{owners_ids:{has:user_id}}, skip: query.offset*number_of_list, take:number_of_list, include:{
            owners:{
                select:{
                    id: true,public_key : true, create_account_timestamp: true, nickname: true, profile: true
                }
            }
        }});
    }

    async public_downloadFileById(file_id : string, user_id: string, res : any){
        if(!ObjectID.isValid(file_id)){throw new NotFoundException()}
        const file_entity = await this.prisma.file.findUnique({where:{id:file_id}});
        if(!file_entity.owners_ids.includes(user_id)){
            if(!await this.roles_service.checkPrivilages(user_id, [Privilege.FILES_CAN_READ])){throw new ForbiddenException();}
        }
        const file_data = createReadStream(file_entity.path);
        file_data.pipe(res);
    }

    async public_uploadFile(file : Express.Multer.File, user_id : string){
        if(!await this.roles_service.checkPrivilages(user_id, [Privilege.FILES_CAN_READ, Privilege.FILES_CAN_WRITE])){
            await unlink(file.path);
            throw new ForbiddenException();
        }
        let ext = extname(file.originalname);
        let size = file.size;
        const file_buffer = await readFile(file.path);
        const hash = createHash('sha256').update(file_buffer).digest('hex');
        const file_entity = await this.prisma.file.findFirst({where: {hash: hash},select:{
            id: true, hash: true, create_time: true, filename:true, extension:true, size:true, mime: true
        }});
        if(file_entity){
            await this.prisma.file.update({where:{id: file_entity.id}, data:{
                owners:{connect:{id: user_id}}
            }});
            return file_entity
        }else{
            const new_file_entity = await this.prisma.file.create({data:{
                filename: file.filename, extension: ext, size: size, hash: hash, create_time:Date.now(),
                owners:{connect:{id: user_id}}, path: file.path, mime: file.mimetype
            }});
            return {id : new_file_entity.id}
        }
    }

    async public_deleteFile(file_id : string, user_id : string){
        if(!ObjectID.isValid(file_id)){throw new NotFoundException()}
        let file = await this.prisma.file.findUnique({where: {id: file_id}});
        if(!file){throw new NotFoundException()}
        if(!file.owners_ids.includes(user_id)){
            if(!await this.roles_service.checkPrivilages(user_id, [Privilege.FILES_CAN_READ, Privilege.FILES_CAN_DELETE])){throw new ForbiddenException();}
        }
        file = await this.prisma.file.update({where: {id:file_id}, data:{owners:{disconnect:{id: user_id}}}});
        if(file.owners_ids.length === 0){
            await unlink(file.path);
            await this.prisma.file.delete({where:{id:file_id}});
        }
        return;
    }
    // -------

    
}
