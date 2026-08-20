import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { WhatsAppService } from './whatsapp.service';
import * as bcrypt from 'bcryptjs';
 
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private whatsappService: WhatsAppService,
  ) {}
 
  async registerUser(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async registerAdmin(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.prisma.admin.create({
      data: { email, password: hashedPassword, name },
    });
    return this.generateToken(admin.id, admin.email, 'admin');
  }
 
  async loginAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(admin.id, admin.email, 'admin');
  }
 
  private generateToken(id: number, email: string, role: string, phone?: string, name?: string) {
    const payload = { sub: id, email: email && email.includes('@') ? email : null, phone, name, role };
    return { access_token: this.jwtService.sign(payload) };
  }
 
  async requestOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
 
    await this.prisma.otp.deleteMany({ where: { phone, verified: false } });
    await this.prisma.otp.create({ data: { phone, otp, expiresAt } });
 
    const sent = await this.whatsappService.sendOtp(phone, otp);
    if (!sent) throw new BadRequestException('Failed to send OTP');
 
    const existingUser = await this.prisma.user.findUnique({ where: { phone } });
    return { message: 'OTP sent successfully', isNewUser: !existingUser };
  }
 
  async verifyOtpAndLogin(phone: string, otp: string, name?: string, email?: string) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { phone, otp, verified: false },
      orderBy: { createdAt: 'desc' }
    });
 
    if (!otpRecord) throw new UnauthorizedException('Invalid OTP');
    if (otpRecord.expiresAt < new Date()) throw new UnauthorizedException('OTP expired');
 
    await this.prisma.otp.update({ where: { id: otpRecord.id }, data: { verified: true } });
 
    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;
    
    if (!user) {
      user = await this.prisma.user.create({ data: { phone, name, email: email || undefined } });
    } else {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    }
 
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
}