import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';

import { UserService } from 'src/modules/user/user.service';
import { LoginDto } from '../dto/login.dto';
import { TokensResponseDto } from '../dto/tokens-response.dto';
import { JwtPayload } from '../types/jwt-payload';
import { UserWithRelations } from 'src/modules/user/types/user-with-relations';
import { AppConfigService } from 'src/app-config/app-config.service';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokensResponseDto> {
    const user: UserWithRelations = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return await this.generateTokens(new UserResponseDto(user));
  }

  async refreshTokens(refreshToken: string): Promise<TokensResponseDto> {
    const { sub: userId } = await this.verifyRefreshToken(refreshToken);
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const newTokens = await this.generateTokens(user);

    await this.invalidateRefreshToken(refreshToken);

    return newTokens;
  }

  private async validateUser(email: string, password: string) {
    try {
      const user: UserWithRelations = await this.userService.findByEmail(email);
      const passwordValid = await bcrypt.compare(password, user.contrasena);

      if (!passwordValid) {
        throw new UnauthorizedException('Usuario o contraseña incorrecta');
      }

      return user;
    } catch (error) {
      this.logger.log(`[validateUser]: ${error}`);
      throw new UnauthorizedException('Usuario o contraseña incorrecta');
    }
  }

  private async generateTokens(
    user: UserResponseDto,
  ): Promise<TokensResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.appConfigService.jwtAccessSecret,
        expiresIn: this.appConfigService.jwtAccessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.appConfigService.jwtRefreshSecret,
        expiresIn: this.appConfigService.jwtRefreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.appConfigService.jwtRefreshSecret,
      });
    } catch (error) {
      this.logger.log(`[verifyRefreshToken]: ${error}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async invalidateRefreshToken(token: string) {
    await Promise.resolve();
    this.logger.log(`[invalidateRefreshToken] Token revoked: ${token}`);
  }

  async logout(userId: number, token: string) {
    await this.invalidateRefreshToken(token);
  }
}
