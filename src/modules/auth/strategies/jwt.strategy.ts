import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types/jwt-payload';
import { AppConfigService } from 'src/app-config/app-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract the token
      secretOrKey: appConfigService.jwtAccessSecret, // Use the secret
    });
  }

  // Method that is executed if the token is valid
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub, // Attach to request.user
      email: payload.email,
      role: payload.role,
    };
  }
}
