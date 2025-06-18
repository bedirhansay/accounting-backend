import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const publicRoutes = [
      { method: 'POST', path: '/api/auth/login' },
      { method: 'POST', path: '/api/auth/register' },
      { method: 'GET', path: '/api-json' },
    ];

    const isPublic = publicRoutes.some(
      (route) => req.method === route.method && req.path.toLowerCase().startsWith(route.path.toLowerCase())
    );

    if (isPublic) {
      return true;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('JWT token gerekli');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      req.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş JWT token');
    }
  }
}
