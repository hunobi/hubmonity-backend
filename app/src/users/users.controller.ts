import { Body, Controller, Get, HttpCode, UseGuards, Param, Patch, Post} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthUserDto } from './dto/auth-user.dto';
import { AuthUser } from './user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private users_service: UsersService){}

    @Get()
    getUsers(){
        return this.users_service.getUsers();
    }
    
    @Get('/@me')
    @UseGuards(JwtAuthGuard)
    getInfoAboutMe(@AuthUser() user: AuthUserDto){
        return this.users_service.getInfoAboutMe(user.user_id);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get("/:id")
    getUser(@Param('id') id: string){
        return this.users_service.getUserByID(id);
    }

}
