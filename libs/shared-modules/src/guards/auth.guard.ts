import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomJwtService } from '../services/jwt.service';
import { InternalErrorException } from '../exceptions/internal.exception';
import { BadRequestException, ResponseStauses } from '..';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private customJwtService: CustomJwtService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        let token = this.extractTokenFromHeader(request);

        if (request.url.startsWith('/api/v2/users/sse/events')) {
            token = request.query.token
        }

        if (
           ( request.url.includes('register') ||
            request.url.includes('phone-verify') ||
            request.url.includes('verify-code') ||
            request.url.includes('send-code') ||
            request.url == '/api/v2/users/login') && !token
            ) {
                console.log('kirdi', token)
            return true
        }
        if (!token) {
            throw new UnauthorizedException();
        }
        try { 
            const payload = await this.customJwtService.verifyTokenAndGetPayload(token);
            if(payload.merchantId && !payload.verified 
                && (request.url.includes('/driver-merchant-by') || request.url.includes('/client-merchant-by') || request.url.includes('register') || request.url == '/api/v2/references/currencies/all')) {
                    return true
            } else if(payload.merchantId && !payload.verified ) {
                throw new BadRequestException(ResponseStauses.AccessDenied);
            }
            if (payload && !isNaN(payload.userId)) {
                const user = await this.customJwtService.findUserById(payload.userId, payload.userType);
                if (user) {
                    request['user'] = user;
                    await this.customJwtService.updateUserLastLogin(user.id);
                } else {
                    console.log('throw')
                    throw new InternalErrorException(ResponseStauses.UserNotFound);
                }
            } else {
                if(payload.merchantId && !payload.verified && !request.url.includes('driver-merchant-by') && !request.url.includes('client-merchant-by')) {
                    throw new InternalErrorException(ResponseStauses.UserNotFound);
                }
            }
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
        } catch (err: any) {
            console.log(err)
            if(err.message.includes('Token verification failed')) {
                throw new BadRequestException(ResponseStauses.TokenExpired);
            } if (err instanceof HttpException) {
                throw err
            } else {
                throw new UnauthorizedException();
            }
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}