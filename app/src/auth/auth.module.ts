import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv'
import { InviteModule } from 'src/invite/invite.module';
import { PenaltyModule } from 'src/users/penalty/penalty.module';

const env = dotenv.config({path: '.env'}).parsed;
/*
JwtModule.register({
    secret: env.TOKEN_SECRET,
    signOptions: { expiresIn: env.TOKEN_EXPIRE },
  }) 
*/
@Module({
  imports: [UsersModule,
    PassportModule,
    JwtModule,
    InviteModule,
    PenaltyModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
