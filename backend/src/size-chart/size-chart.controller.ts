import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SizeChartService } from './size-chart.service';
import { CreateSizeChartDto } from './dto/create-size-chart.dto';
import { UpdateSizeChartDto } from './dto/update-size-chart.dto';

@Controller('size-chart')
export class SizeChartController {
  constructor(private readonly sizeChartService: SizeChartService) {}

  @Post()
  create(@Body() createSizeChartDto: CreateSizeChartDto) {
    return this.sizeChartService.create(createSizeChartDto);
  }

  @Get()
  findAll() {
    return this.sizeChartService.findAll();
  }

  @Get('active')
  findAllActive() {
    return this.sizeChartService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizeChartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSizeChartDto: UpdateSizeChartDto) {
    return this.sizeChartService.update(+id, updateSizeChartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizeChartService.remove(+id);
  }
}
