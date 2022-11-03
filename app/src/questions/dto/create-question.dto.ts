import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateQuestionDto{
    @IsString()
    @IsNotEmpty()
    title : string

    @IsString()
    @IsNotEmpty()
    detail : string
    
    @IsArray()
    @ArrayNotEmpty()
    tags : string[]
}