import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ObjectID } from 'bson';
import { CreateUserDto } from './dto/create-user.dto';
import { User, Profile, Setting, Language, Login_History, Session } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService){}

    // temp endpoint     TODO: Remove it
    async getUsers() : Promise<User[]>{
        return await this.prisma.user.findMany();
    }

    // Get user by ID
    async getUserByID(user_id: string) : Promise<any> {
        if(!ObjectID.isValid(user_id)){throw new NotFoundException()}
        const user = await this.prisma.user.findUnique({where: {id: user_id}})
        if(!user){throw new NotFoundException()}
        const {id, create_account_timestamp, nickname, public_key} = user 
        return {id, create_account_timestamp, nickname, public_key};
    }

    // Get my user data 
    async getInfoAboutMe(user_id : string) : Promise<User>{
        return await this.prisma.user.findFirst({where: {id : user_id}, include: {invited: true, invites: true}});
    }

/*-------------------------------------------------------------
                Hidden methods (only server)
-------------------------------------------------------------*/

    async create(body: CreateUserDto){
        const profile = {avatar: "", description: ""} as Profile ;

        const {create_account_timestamp, nickname, login, password, salt, settings} = body;
        
        return this.prisma.user.create({data:{create_account_timestamp, nickname, login, password, salt, profile: profile, settings: (settings as Setting)}});
    }

    async getUserByID_private(user_id: string): Promise<User>{
        if(!ObjectID.isValid(user_id)){return null}
        return await this.prisma.user.findUnique({where: {id: user_id}});
    }

    async getUserByLogin(login: string) : Promise<User>{
        return await this.prisma.user.findUnique({where: {login: login}})
    }

    async getUserByUsername(username: string) : Promise<User>{
        return await this.prisma.user.findUnique({where: {nickname: username}})
    }

    async add_login_history(history : Login_History, user: User){
        const new_login_history = [...user.logins_history, history]
        return await this.prisma.user.update({data: {
            logins_history: new_login_history
        }, where: {id: user.id} })
    }

    async add_session(session : Session, user: User){
        const new_session = [...user.sessions, session]
        return await this.prisma.user.update({data: {
            sessions: new_session
        }, where: {id: user.id} })
    }

    async update_session(new_sessions: Session[], user:User) {
        return await this.prisma.user.update({data:{sessions: new_sessions}, where: {id: user.id}})
    }

}
