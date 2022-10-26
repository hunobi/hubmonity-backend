import { Controller, Post, Delete, HttpCode, Body, Req, Ip} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

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
    @Delete('/logout')
    @HttpCode(204)
    logout(){

    }

}
