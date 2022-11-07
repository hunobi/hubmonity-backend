import { BadRequestException, ConflictException, ForbiddenException ,Injectable, NotFoundException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Language, Setting, Session, Login_History } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';
import * as dotenv from 'dotenv'
import { InviteService } from 'src/invite/invite.service';
import { ObjectID } from 'bson';
import { PenaltyService } from 'src/users/penalty/penalty.service';

const env = dotenv.config({path: '.env'}).parsed;

@Injectable()
export class AuthService {
    constructor(
        private jwt_service: JwtService,
        private user_service: UsersService,
        private invite_service : InviteService,
        private penalty_service : PenaltyService
    ){}

    // Create new account
    async registr(body : CreateAccountDto){
        // check invite code
        if(!ObjectID.isValid(body.ivite_code)){throw new NotFoundException()}
        const invite_obj = await this.invite_service.getInviteByID(body.ivite_code); 
        if(!invite_obj){throw new NotFoundException();}
        // next step
        const user_by_login = await this.user_service.getUserByLogin(body.login);
        const user_by_username = await this.user_service.getUserByUsername(body.username);
        if(!user_by_login && !user_by_username){   
            const userdto = new CreateUserDto();
            userdto.create_account_timestamp = Date.now();
            userdto.login = body.login;
            userdto.nickname = body.username;
            userdto.settings = { language: Language.EN as Language } as Setting;
            userdto.salt = await bcrypt.genSalt(12);
            userdto.password = await bcrypt.hash(body.password, userdto.salt);
            const created_user = await this.user_service.create(userdto);
            await this.invite_service.useInvite(body.ivite_code, created_user.id)
            return;
        }
        throw(new ConflictException());
    }

    // Authentication 
    async login(body: LoginDto, headers: Object, ip:string){
        const user = await this.user_service.getUserByLogin(body.login);
        if(!user) throw new ForbiddenException();
        const time = Date.now();
        const new_login_history = new Object as Login_History;
        new_login_history.ip = ip;
        new_login_history.time = time;
        new_login_history.user_agent = headers['user-agent'];
        const body_password_hash = await bcrypt.hash(body.password, user.salt);
        if(body_password_hash === user.password){
            // check penalty - get first because only one can be active in the same time
            const my_penalty = await this.penalty_service.getActive(user.id);
            if(my_penalty){
                if(my_penalty.is_perm){
                    new ForbiddenException({msg: "Account permanently locked.", info: my_penalty.description});
                }
                if(await this.penalty_service.checkActive(user.id)){
                    const unlocked_date = new Date(my_penalty.end_timestamp).toLocaleDateString() + ' ' + new Date(my_penalty.end_timestamp).toLocaleTimeString();
                    new ForbiddenException({msg:"Your account will be unblocked on " + unlocked_date, info: my_penalty.description})
                }else{
                    await this.penalty_service.deactivation(user.id);
                }
            }
            // is ok ...
            const refresh_token = this.jwt_service.sign({time: time, user_id: user.id, nickname: user.nickname}, {secret: env.TOKEN_REFRESH_SECRET, expiresIn: env.TOKEN_REFRESH_EXPIRE});
            const token = this.jwt_service.sign({time: time, user_id: user.id, nickname: user.nickname}, {expiresIn: env.TOKEN_EXPIRE, secret: env.TOKEN_SECRET});
            const new_session = new Object as Session;
            new_session.start_timestamp = time;
            new_session.is_active = true;
            new_session.token = refresh_token
            new_session.end_timestamp = null
            new_session.user_agent = headers['user-agent'];
            new_session.ip = ip
            new_login_history.status = true;
            await this.user_service.add_login_history(new_login_history, user);
            await this.user_service.add_session(new_session, user);

            return {token, refresh_token}
        }
        else{
            new_login_history.status = false;
            await this.user_service.add_login_history(new_login_history, user);
            throw new ForbiddenException();
        }
    }

    // Create new access token
    async refresh(refresh_token : string){
        try{
            await this.jwt_service.verifyAsync(refresh_token,{secret: env.TOKEN_REFRESH_SECRET})
            const data = this.jwt_service.decode(refresh_token) as Object 
            const user = await this.user_service.getUserByID_private(data['user_id']);
            const verify = user.sessions.find((session) => {return (session.token===refresh_token && session.is_active)})
            if(verify){
                const new_token = await this.jwt_service.signAsync({user_id: user.id, nickname: user.nickname, time: Date.now()},{secret: env.TOKEN_SECRET, expiresIn: env.TOKEN_EXPIRE})
                return {token: new_token}
            }
            else{
                throw new ForbiddenException();
            }
        }catch{
            throw new ForbiddenException();
        }
    }

    // Disable your refresh token and logout
    async logout(user_id: string, refresh_token : string) : Promise<any>{
        try{
            await this.jwt_service.verifyAsync(refresh_token, {secret: env.TOKEN_REFRESH_SECRET});
            const refresh_token_decoded = this.jwt_service.decode(refresh_token)
            if(refresh_token_decoded['user_id'] !== user_id){
                throw new ForbiddenException();
            }
            const user = await this.user_service.getUserByID_private(user_id);
            user.sessions.forEach(session=>{
                if(session.token === refresh_token){
                    session.is_active = false;
                    session.end_timestamp = Date.now();
                }
            });
            await this.user_service.update_session(user.sessions, user);
            return ;
        }
        catch{
            throw new BadRequestException();
        }
    }
}
