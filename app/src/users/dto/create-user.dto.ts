import { IsString, IsNumber } from "class-validator";
import { Setting } from "@prisma/client";

export class CreateUserDto{
    @IsNumber()
    create_account_timestamp : number
    
    @IsString()
    login : string

    @IsString()
    password : string

    @IsString()
    salt : string
    
    @IsString() 
    nickname : string
    
    settings : Setting
}