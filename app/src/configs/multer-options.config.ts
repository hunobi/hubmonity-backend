import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import * as dotenv from 'dotenv'
import { mkdir } from "fs/promises";
import { HttpException, HttpStatus } from "@nestjs/common";
const env = dotenv.config({path: '.env'}).parsed;

export const userFileOptions : MulterOptions = {
    limits : {
        fileSize : 1000000000,
        files : 1
    }, 
    storage: diskStorage({
        async destination(req : Request, 
            file: Express.Multer.File, 
            callback : (error : Error | null, file_destination: string) => void) 
        {
            let date = new Date().toLocaleDateString().split('.');
            date.reverse();
            let file_destination= join(process.cwd(), env.FILES_STORAGE_PATH, ...date);
            await mkdir(file_destination, {recursive:true});
            callback(null, file_destination);
        },
        filename(req : Request, file: Express.Multer.File, callback : (error: Error | null, filename: string)=> void) {
            callback(null, Date.now().toString());
        },
    }),
}

export const userAvatarOption : MulterOptions = {
    limits: {
        fieldSize : 5000000,
        files : 1
    },
    fileFilter(req: Request, file: Express.Multer.File, callback : (error : Error | null, isValid : boolean) => void) {
        if(file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)){
            callback(null, true);
        }else{
            callback(
                new HttpException(`Unsupported file type ${extname(file.originalname)}`,HttpStatus.BAD_REQUEST),
                false);
        }
    },
    storage: diskStorage({
        async destination(req: Request, file: Express.Multer.File, callback : (error : Error | null, file_destination: string) => void) {
            const user = req.user as {user_id, username, time};
            let file_destination= join(process.cwd(), env.AVATARS_STORAGE_PATH, user.user_id);
            await mkdir(file_destination, {recursive:true});
            callback(null, file_destination);
        },
        filename(req: Request, file: Express.Multer.File, callback : (error : Error | null, file_name: string) => void){
            callback(null, "avatar");
        }
    })
}