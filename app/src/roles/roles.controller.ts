import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from 'src/universal-dto/pagination.dto';
import { AuthUserDto } from 'src/users/dto/auth-user.dto';
import { AuthUser } from 'src/users/user.decorator';
import { RoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    constructor(private roles_service : RolesService){}

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    getByID(@AuthUser() userInfo : AuthUserDto, @Param('id') id : string ){
        return this.roles_service.getByID(userInfo.user_id, id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(@AuthUser() userInfo : AuthUserDto, @Query() query : PaginationDto){
        return this.roles_service.getAll(userInfo.user_id, query);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(201)
    create(@AuthUser() userInfo : AuthUserDto, @Body() body : RoleDto){
        return this.roles_service.createRole(userInfo.user_id, body);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    update(@AuthUser() userInfo : AuthUserDto, @Param('id') id : string , @Body() body : RoleDto){
        return this.roles_service.updateRole(userInfo.user_id, id, body);
    }

    @Delete('/:id')
    @HttpCode(204)
    delete(@AuthUser() userInfo : AuthUserDto, @Param('id') id : string){
        return this.roles_service.deleteRole(userInfo.user_id, id);
    }
}
