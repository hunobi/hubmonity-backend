import { Body, Controller, Delete, Get, HttpCode, UseGuards, Param, Patch, Post} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private users_service: UsersService){}

    @Get()
    getUsers(){
        return this.users_service.getUsers();
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('/@me')
    getInfoAboutMe(){
        return this.users_service.getInfoAboutMe();
    }
    
    @Get("/:id")
    getUser(@Param('id') id: string){
        return this.users_service.getUserByID(id);
    }

}
