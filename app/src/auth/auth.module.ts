import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv'

const env = dotenv.config({path: '.env'}).parsed;

@Module({
  imports: [UsersModule,
    PassportModule,
    JwtModule.register({
    secret: env.TOKEN_SECRET,
    signOptions: { expiresIn: env.TOKEN_EXPIRE },
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
