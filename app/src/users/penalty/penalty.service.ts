import { Injectable } from "@nestjs/common";
import { Penalty} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePenaltyDto } from "./dto/create-penalty.dto";

@Injectable()
export class PenaltyService {
    constructor(private prisma: PrismaService){}

    async getAll(user_id: string) : Promise<Penalty[]>{
        return (await this.prisma.user.findUnique({where: {id: user_id}, select: {penalties : true}})).penalties;
    }

    async getActive(user_id : string) : Promise<Penalty>{
        return (await this.getAll(user_id)).find(item => item.is_active);
    }

    /**
        @returns Return true if the account cannot be unlocked yet, false if panlty is terminated
    */
    async checkActive(user_id: string) : Promise<boolean>{
        const pen = await this.getActive(user_id);
        return Date.now() < pen.end_timestamp;
    }
    
    async deactivation(user_id : string){
        const all = await this.getAll(user_id);
        all.forEach(item => {if(item.is_active){item.is_active=false}});
        return await this.prisma.user.update({where:{id:user_id}, data:{
            penalties : all
        }});
    }

    async create(user_id : string, data : CreatePenaltyDto) : Promise<Penalty[]>{
        const all = await this.getAll(user_id);
        const new_pen = {} as Penalty;
        new_pen.start_timestamp = Date.now();
        new_pen.end_timestamp = data.end_timestamp;
        new_pen.is_active = true;
        new_pen.description = data.description;
        new_pen.is_perm = data.is_perm;
        all.push(new_pen); 
        await this.prisma.user.update({where: {id: user_id}, data:{
            penalties : all
        }});
        return all;
    }
}