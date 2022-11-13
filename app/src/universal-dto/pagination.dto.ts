import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class PaginationDto{
    @IsInt()
    @Type(()=>Number)
    offset : number
}