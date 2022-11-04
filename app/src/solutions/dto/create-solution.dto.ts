import {IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateSolutionDto{

    @IsString()
    @IsNotEmpty()
    question_id : string
        
    @IsString()
    @IsNotEmpty()
    content : string
}