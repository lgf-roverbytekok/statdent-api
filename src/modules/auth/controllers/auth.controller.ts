import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokensResponseDto } from '../dto/tokens-response.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from '../types/jwt-payload';
import { LogoutDto } from '../dto/logout.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión de usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Tokens JWT generados exitosamente',
    type: TokensResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<TokensResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('token/refresh')
  @ApiOperation({ summary: 'Refrescar tokens de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Nuevos tokens JWT generados',
    type: TokensResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token de refresh inválido' })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokensResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() logoutDto: LogoutDto,
  ): Promise<void> {
    await this.authService.logout(user.sub, logoutDto.refreshToken);
  }
}
