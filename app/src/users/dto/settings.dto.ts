import { LanguageDto } from "./Language.dto";
import { IsEnum} from "class-validator";

export class SettingsDto{
    @IsEnum(LanguageDto)
    language : LanguageDto
}