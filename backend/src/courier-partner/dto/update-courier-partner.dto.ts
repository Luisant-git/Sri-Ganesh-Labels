import { PartialType } from '@nestjs/mapped-types';
import { CreateCourierPartnerDto } from './create-courier-partner.dto';

export class UpdateCourierPartnerDto extends PartialType(CreateCourierPartnerDto) {}
