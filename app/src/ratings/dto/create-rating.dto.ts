import { RatingType } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsString } from "class-validator"

export class CreateRatingDto{
    @IsString()
    @IsNotEmpty()
    voter_id : string
    
    @IsString()
    @IsNotEmpty()
    solution_id : string

    @IsNotEmpty()
    @IsEnum(()=>RatingType)
    value: RatingType
}