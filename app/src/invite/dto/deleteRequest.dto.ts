import { IsNotEmpty, IsString } from "class-validator";

export class DeteleRequestDto{
    @IsNotEmpty()
    @IsString()
    id : string
}