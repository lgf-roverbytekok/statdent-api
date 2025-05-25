import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

import type { Request } from 'express';

/**
 * Extiende el Request de Express con la propiedad `user`
 */
interface RequestWithUser extends Request {
  user: UserResponseDto;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): UserResponseDto => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
