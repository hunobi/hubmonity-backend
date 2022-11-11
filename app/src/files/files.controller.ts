import { Controller, Delete, Get, Param, Post, UseGuards, HttpCode, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UseInterceptors, Query, BadRequestException, Res, Response } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { userFileOptions } from 'src/configs/multer-options.config';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { PaginationDto } from './dto/pagination.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(
        private files_service : FilesService
    ){}
    
    @Get()
    @UseGuards(JwtAuthGuard)
    getFiles(@AuthUser() userInfo : AuthUserDto, @Query() query : PaginationDto){
        return this.files_service.public_file_list(userInfo.user_id, query);
    }

    @Get('/@me')
    @UseGuards(JwtAuthGuard)
    getMyFiles(@AuthUser() userInfo : AuthUserDto, @Query() query : PaginationDto){
        return this.files_service.public_my_files(userInfo.user_id, query);
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    downloadFile(@Param("id") file_id : string, @AuthUser() userInfo : AuthUserDto, @Res() res: Response){
        return this.files_service.public_downloadFileById(file_id, "userInfo.user_id", res);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('file', userFileOptions))
    uploadFile(@AuthUser() userInfo : AuthUserDto, @UploadedFile() file : Express.Multer.File){
        console.log(file);
        return this.files_service.public_uploadFile(file, userInfo.user_id);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    deleteFile(@Param('id') file_id : string, @AuthUser() userInfo : AuthUserDto){
        return this.files_service.public_deleteFile(file_id, userInfo.user_id);
    }
}
