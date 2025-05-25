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

  /**
   * Se ejecuta automáticamente tras la validación de firma y expiración.
   * Aquí hacemos un lookup a la base de datos para devolver al usuario completo,
   * validando que exista y esté activo, y cargando su rol.
   */
  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    // Reutilizamos findOne() que lanza NotFoundException si no existe
    try {
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException(
          'No autorizado para realizar esta acción',
        );
      }

      // Si se tiene un flag de activo/deshabilitado:
      // if (!user.isActive) {
      //   throw new UnauthorizedException('Usuario deshabilitado');
      // }

      return user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('Token inválido o usuario no existe');
    }
  }
}
