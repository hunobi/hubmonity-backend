import { Controller, Post, Delete, HttpCode, Body, Req, Ip, UseGuards} from '@nestjs/common';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { AuthService } from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private auth_service: AuthService){}
    // Create new account
    @Post('/signup')
    @HttpCode(201)
    registr(@Body() body : CreateAccountDto){
        return this.auth_service.registr(body);
    }

    // Authentication 
    @Post('/signin')
    @HttpCode(200)
    login(@Body() body: LoginDto, @Req() req, @Ip() ip)
    {
        return this.auth_service.login(body, req.headers, ip);
    }

    // Create new access token
    @Post('/refresh')
    @HttpCode(201)
    refresh(@Body() body : RefreshDto){
        
        return this.auth_service.refresh(body.refresh_token);
    }

    // Disable your refresh token and logout
    @UseGuards(JwtAuthGuard)
    @Delete('/logout')
    @HttpCode(204)
    logout(@Body() body : RefreshDto, @AuthUser() user: AuthUserDto){
        return this.auth_service.logout(user.user_id,body.refresh_token);
    }

}
