import { Controller, Post, Get, Body, Delete, Param, UseGuards, HttpCode} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { DeteleRequestDto } from './dto/deleteRequest.dto';
import { InviteConfigDto } from './dto/inviteConfig.dto';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
    constructor(private invite_service : InviteService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    getInvites(@AuthUser() user: AuthUserDto){
        return this.invite_service.getInvites(user.user_id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(201)
    createInvite(@AuthUser() user: AuthUserDto, @Body() body : InviteConfigDto){
        return this.invite_service.createInvite(user.user_id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/:id")
    @HttpCode(204)
    deleteInvite(@AuthUser() user: AuthUserDto, @Param() param : DeteleRequestDto){
        return this.invite_service.deleteInvite(param.id, user.user_id);
    }
}
