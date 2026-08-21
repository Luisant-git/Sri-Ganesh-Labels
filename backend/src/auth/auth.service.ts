import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
 
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
 
  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  }

  private async findUserByPhone(phone: string) {
    const normalized = this.normalizePhone(phone);
    const variants = normalized.length === 10 ? [normalized, '91' + normalized] : [normalized];
    return this.prisma.user.findFirst({
      where: { OR: variants.map((v) => ({ phone: v })) },
    });
  }

  async registerUser(mobile: string, password: string, name?: string) {
    const phone = this.normalizePhone(mobile);
    const existing = await this.findUserByPhone(phone);
    if (existing) throw new ConflictException('Mobile number already registered. Please login.');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { phone, password: hashedPassword, name: (name || '').trim() },
    });
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async loginUser(mobile: string, password: string) {
    const user = await this.findUserByPhone(mobile);
    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id, user.email || '', 'user', user.phone || undefined, user.name || undefined);
  }
 
  async userExists(mobile: string) {
    const user = await this.findUserByPhone(mobile);
    return { exists: !!user };
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
}
