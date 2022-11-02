import { Injectable } from '@nestjs/common';
import { Rating } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
    constructor(private prisma : PrismaService){}

    // -------

    async getRatingByID(rating_id : string) : Promise<Rating>{
        return await this.prisma.rating.findUnique({where: {id:rating_id}, 
            include:{
                voter: true,
                solution: true
            }
        });
    }

    async createRating(body : CreateRatingDto){
        return await this.prisma.rating.create({data:{
            voter : {
                connect:{id: body.voter_id}
            },
            solution:{
                connect: {id: body.solution_id}
            },
            value : body.value
        }})
    }

    /*
        Disconnect and delete rating
    */
    async cancelRating(rating : Rating){
        await this.prisma.$transaction([
            this.prisma.solution.update({where:{id:rating.solution_id}, data:{
                ratings: {disconnect:{id : rating.id}}
            }}),
            this.prisma.user.update({where: {id: rating.voter_id}, data:{
                rating_solutions:{disconnect:{id:rating.id}}
            }}),
            this.prisma.rating.delete({where:{id:rating.id}})
        ]) ;
    }
}
