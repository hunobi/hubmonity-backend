import { Privilege } from "@prisma/client";
import { IsArray, IsAscii, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RoleDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @IsAscii()
    name : string;

    @IsArray()
    @IsEnum(Privilege, {each: true})
    privileges: Privilege[];
}