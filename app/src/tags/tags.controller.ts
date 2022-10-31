import { Controller, Param, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { PatchRequestDto } from './dto/patch-request.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
    constructor(private tag_service : TagsService){}

    @Get("/:tag_name")
    @UseGuards(JwtAuthGuard)
    get_tag_by_name(@Param() tag : PatchRequestDto){
        return this.tag_service.getByName_public(tag.tag_name);
    }

    @Patch('/follow')
    @UseGuards(JwtAuthGuard)
    follow_tag(@AuthUser() user : AuthUserDto, @Body() body : PatchRequestDto){
        return this.tag_service.follow_tag_public(user.user_id, body.tag_name);
    }

    @Patch('/unfollow')
    @UseGuards(JwtAuthGuard)
    unfollow_tag(@AuthUser() user : AuthUserDto, @Body() body : PatchRequestDto){
        return this.tag_service.unfollow_tag_public(user.user_id, body.tag_name);
    }

    @Patch('/block')
    @UseGuards(JwtAuthGuard)
    block_tag(@AuthUser() user : AuthUserDto, @Body() body : PatchRequestDto){
        return this.tag_service.block_tag_public(user.user_id, body.tag_name);
    }

    @Patch('/unlock')
    @UseGuards(JwtAuthGuard)
    unlock_tag(@AuthUser() user : AuthUserDto, @Body() body : PatchRequestDto){
        return this.tag_service.unlock_tag_public(user.user_id, body.tag_name);
    }

}
