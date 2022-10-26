import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv'

const env = dotenv.config({path: '.env'}).parsed;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    return { user_id: payload.user_id, username: payload.nickname, time: payload.time };
  }
}