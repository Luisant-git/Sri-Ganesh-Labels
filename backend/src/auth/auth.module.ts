import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProtectedController } from './protected.controller';
import { JwtStrategy } from './jwt.strategy';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma.service';
 
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, ProtectedController],
  providers: [AuthService, JwtStrategy, WhatsAppService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
 