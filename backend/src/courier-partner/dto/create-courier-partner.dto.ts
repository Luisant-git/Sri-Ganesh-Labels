import { IsString, IsOptional } from 'class-validator';

export class CreateCourierPartnerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  trackingLink?: string;
}
