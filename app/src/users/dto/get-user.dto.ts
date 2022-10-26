import { Type } from "class-transformer";
import { IsString, IsNumber } from "class-validator";
import { ProfileDto } from "./profile.dto";

// Info about other users
export class GetUserDto{
    @IsString()
    id : string

    @IsNumber()
    create_account_timestamp : number
    
    @IsString() 
    nickname : string
    
    @IsString()
    public_key : string

    @Type(()=>ProfileDto)
    profile : ProfileDto
}