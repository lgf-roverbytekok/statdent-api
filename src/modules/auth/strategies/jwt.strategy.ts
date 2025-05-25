import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types/jwt-payload';
import { AppConfigService } from 'src/app-config/app-config.service';
import { UserService } from 'src/modules/user/user.service';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    appConfigService: AppConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract the token
      secretOrKey: appConfigService.jwtAccessSecret, // Use the secret
    });
  }

  // Method that is executed when the token is validated
  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    // Reutilizamos findOne() que lanza NotFoundException si no existe
    try {
      const user = await this.userService.findOne(payload.sub);
      return user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('Token inválido o usuario no existe');
    }
  }
}
