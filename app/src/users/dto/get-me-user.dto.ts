import { Type } from "class-transformer";
import { IsString, IsNumber } from "class-validator";
import { ProfileDto } from "./profile.dto";
import { SettingsDto } from "./settings.dto";

// Info about only my account
export class GetMeUserDto{
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
    
    @Type(()=>SettingsDto)
    settings : SettingsDto

    // TODO OTHER ELEMENTS
}