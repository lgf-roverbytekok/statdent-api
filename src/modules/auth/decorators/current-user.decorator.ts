import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';
import { RequestWithUser } from 'src/modules/auth/types/request-with-user';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): UserResponseDto => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
