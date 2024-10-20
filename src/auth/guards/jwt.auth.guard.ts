import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const secretOrPublicKey = this.configService.get('JWT_SECRET');

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    if (!this.isValidFormat(token)) {
      throw new UnauthorizedException('Token format is invalid');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: secretOrPublicKey,
      });
      request.user = payload;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  isValidFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3;
  }
}
