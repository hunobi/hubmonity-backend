import { IsString, MinLength } from "class-validator"

export class CreateAccountDto{
    @IsString()
    @MinLength(3)
    login : string
    @IsString()
    @MinLength(6)
    password: string
    @IsString()
    @MinLength(3)
    username : string
}