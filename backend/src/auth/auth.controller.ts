import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsString, IsOptional } from 'class-validator';
 
class UserAuthDto {
  @ApiProperty({ example: '9999468263' })
  @IsString()
  mobile: string;
 
  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
 
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
}
 
class AdminAuthDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  email: string;
 
  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
 
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
}
 
class UserCheckDto {
  @ApiProperty({ example: '9999468263' })
  @IsString()
  mobile: string;
}

class TokenResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
 
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
 
  @Post('user/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: TokenResponse })
  async registerUser(@Body() { mobile, password, name }: UserAuthDto) {
    return this.authService.registerUser(mobile, password, name);
  }
 
  @Post('user/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async loginUser(@Body() { mobile, password }: UserAuthDto) {
    return this.authService.loginUser(mobile, password);
  }
 
  @Post('user/check')
  @ApiOperation({ summary: 'Check if a user is already registered' })
  @ApiResponse({ status: 200, description: 'Returns whether the user exists' })
  async checkUser(@Body() { mobile }: UserCheckDto) {
    return this.authService.userExists(mobile);
  }
 
  @Post('admin/register')
  @ApiOperation({ summary: 'Register new admin' })
  @ApiResponse({ status: 201, type: TokenResponse })
  async registerAdmin(@Body() { email, password, name }: AdminAuthDto) {
    return this.authService.registerAdmin(email, password, name);
  }
 
  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async loginAdmin(@Body() { email, password }: AdminAuthDto) {
    return this.authService.loginAdmin(email, password);
  }
}
