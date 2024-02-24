import { Module } from '@nestjs/common';
import { CustomJwtService } from './services/jwt.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from './entites/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY, // Replace with your actual secret key
      signOptions: { expiresIn: '24h' }, // Optional: Set expiration time
    }),
  ],
  providers: [
    CustomJwtService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
  ],
})
export class AuthModule {}
