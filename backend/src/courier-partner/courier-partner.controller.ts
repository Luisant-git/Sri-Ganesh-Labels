import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourierPartnerService } from './courier-partner.service';
import { CreateCourierPartnerDto } from './dto/create-courier-partner.dto';
import { UpdateCourierPartnerDto } from './dto/update-courier-partner.dto';

@Controller('courier-partners')
export class CourierPartnerController {
  constructor(private readonly service: CourierPartnerService) {}

  @Post()
  create(@Body() dto: CreateCourierPartnerDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourierPartnerDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
