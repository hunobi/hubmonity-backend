import { IsInt, IsNotEmpty } from "class-validator";

export class InviteConfigDto{
    @IsInt()
    @IsNotEmpty()
    end_time : number
}