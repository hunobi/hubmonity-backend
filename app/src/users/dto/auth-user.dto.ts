import { IsInt, IsString } from "class-validator"

export class AuthUserDto{
    @IsString()
    user_id : string
    @IsString()
    username: string
    @IsInt()
    time : number
}