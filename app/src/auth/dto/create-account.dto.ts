import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class CreateAccountDto{
    @IsString()
    @MinLength(3)
    login : string
    @IsString()
    @MinLength(8)
    password: string
    @IsString()
    @MinLength(3)
    username : string
    @IsString()
    @IsNotEmpty()
    ivite_code : string
}