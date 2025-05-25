import type { Request } from 'express';

import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

/**
 * Extiende el Request de Express con la propiedad `user`
 */
export interface RequestWithUser extends Request {
  user: UserResponseDto;
}
