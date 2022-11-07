import { IsBoolean, IsInt, IsNotEmpty, IsString, MinLength } from "class-validator"

export class CreatePenaltyDto{
    @IsBoolean()
    is_perm : boolean
    
    @IsInt()
    end_timestamp : number

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    description : string
}