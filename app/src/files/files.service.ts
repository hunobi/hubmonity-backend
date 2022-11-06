import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {createHash} from 'crypto';
import { ObjectID } from 'bson';
import { createReadStream, fstat } from 'fs';
import { join } from 'path';
import { writeFile, unlink, access, mkdir } from 'fs/promises';
import * as dotenv from 'dotenv'
import { PaginationDto } from './dto/pagination.dto';
const env = dotenv.config({path: '.env'}).parsed;

const number_of_list = 50;

@Injectable()
export class FilesService {
    constructor(
        private prisma : PrismaService
    ){}
    
    async public_file_list(user_id: string, query : PaginationDto){
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
        const file_data = createReadStream(join(process.cwd(),file_entity.path));
        file_data.pipe(res);
        //env.FILES_STORAGE_PATH
    }

    async public_uploadFile(file : Express.Multer.File, user_id : string){
        let tmp = file.originalname.split('.');
        let ext = tmp[tmp.length-1]
        let filename = tmp.slice(0,tmp.length-1).join('.')
        let size = file.size
        let hash = createHash('sha256').update(file.buffer).digest('hex');
        let file_path = join(env.FILES_STORAGE_PATH, hash);
        const file_entity = await this.prisma.file.findFirst({where: {hash: hash},select:{
            id: true, hash: true, create_time: true, filename:true, extension:true, size:true
        }});
        if(file_entity){
            await this.prisma.file.update({where:{id: file_entity.id}, data:{
                owners:{connect:{id: user_id}}
            }});
            return file_entity
        }else{
            await mkdir(join(process.cwd(), env.FILES_STORAGE_PATH), {recursive:true});
            await writeFile(join(process.cwd(),file_path), file.buffer);
            return await this.prisma.file.create({data:{
                filename: filename, extension: ext, size: size, hash: hash, create_time:Date.now(),
                owners:{connect:{id: user_id}}, path: file_path
            }});
        }
    }

    async public_deleteFile(file_id : string, user_id : string){
        if(!ObjectID.isValid(file_id)){throw new NotFoundException()}
        let file = await this.prisma.file.findUnique({where: {id: file_id}});
        if(!file){throw new NotFoundException()}
        file = await this.prisma.file.update({where: {id:file_id}, data:{owners:{disconnect:{id: user_id}}}});
        if(file.owners_ids.length === 0){
            await unlink(join(process.cwd(), file.path));
            await this.prisma.file.delete({where:{id:file_id}});
        }
        return;
    }
    // -------

    
}
