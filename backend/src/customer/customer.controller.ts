import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

@Get()
findAll(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('search') search: string = '',
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('statusFilter') statusFilter?: string,
) {
  return this.customerService.findAll(+page, +limit, search, startDate, endDate, statusFilter);
}

@Get('stats')
async getStats(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.customerService.getCustomerStats(startDate, endDate);
}

  @Get('search/phone')
  searchByPhone(@Query('phone') phone: string) {
    return this.customerService.searchByPhone(phone);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
