import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestWithUser } from 'src/modules/auth/types/request-with-user';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Comprueba si es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. Primero delega a JwtAuthGuard para validar token y poblar request.user
    const can = await super.canActivate(context);
    if (!can) return false;

    // 3. Extrae roles requeridos
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    // 4. Si no hay roles definidos, basta con que JWT sea válido
    if (requiredRoles.length === 0) {
      return true;
    }

    // 5. Comprueba rol del usuario
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: UserResponseDto = request.user;
    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `No tienes los permisos necesarios para acceder a este recurso.`,
      );
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any) {
    // Este método no se usará, porque ya hemos delegado en super.canActivate()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
