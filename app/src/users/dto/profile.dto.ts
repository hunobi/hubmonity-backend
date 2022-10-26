import { IsString } from "class-validator";

export class ProfileDto{
    @IsString()
    avarar : string

    @IsString()
    description : string
}