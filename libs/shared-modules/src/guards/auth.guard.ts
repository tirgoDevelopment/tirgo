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
            request.url.startsWith('/api/v2/users/client-merchant-user/phone-verify') ||
            request.url.startsWith('/api/v2/users/client-merchant-user/verify-code') || 
            request.url.startsWith('/api/v2/users/login') ||
            request.url.startsWith('/api/v2/users/staffs/register') ||
            request.url.startsWith('/api/v2/users/client-merchant') ||
            request.url.startsWith('/api/v2/users/driver-merchants/register') ||
            request.url.startsWith('/api/v2/users/register/client-merchant') ||
            request.url.startsWith('/api/v2/users/client-merchant-user/send-code') ||
            request.url.startsWith('/api/v2/references/currencies/all')) {
            return true
        }
 
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.customJwtService.verifyTokenAndGetPayload(token);
            if (payload.merchantId && !payload.verified && request.url !== '/api/v2/users/driver-merchants/driver-merchant-by') {
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
                throw new InternalErrorException(ResponseStauses.UserNotFound);
            }
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
        } catch (err: any) {
            console.log(err)
            if (err instanceof HttpException) {
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