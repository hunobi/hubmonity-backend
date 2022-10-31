import { IsNotEmpty, IsString } from "class-validator";

export class PatchRequestDto{
    @IsString()
    @IsNotEmpty()
    tag_name : string
}