import { Controller } from "@nestjs/common";
import { PenaltyService } from "./penalty.service";

@Controller('users/penalty')
export class PenaltyController {
    constructor(private penalty_service: PenaltyService){}
}