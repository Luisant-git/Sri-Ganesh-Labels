import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PincodeService } from './pincode.service';
import { CreatePincodeDto } from './create-pincode.dto';
import { UpdatePincodeDto } from './update-pincode.dto';

@ApiTags('Pincodes')
@Controller('pincodes')
export class PincodeController {
  constructor(private readonly pincodeService: PincodeService) {}

  @Post()
  @ApiOperation({ summary: 'Create pincode' })
  @ApiResponse({ status: 201, description: 'Pincode created successfully' })
  create(@Body() createPincodeDto: CreatePincodeDto) {
    return this.pincodeService.create(createPincodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pincodes' })
  @ApiResponse({ status: 200, description: 'List of pincodes' })
  findAll() {
    return this.pincodeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pincode by ID' })
  @ApiResponse({ status: 200, description: 'Pincode details' })
  findOne(@Param('id') id: string) {
    return this.pincodeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pincode' })
  @ApiResponse({ status: 200, description: 'Pincode updated successfully' })
  update(@Param('id') id: string, @Body() updatePincodeDto: UpdatePincodeDto) {
    return this.pincodeService.update(+id, updatePincodeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pincode' })
  @ApiResponse({ status: 200, description: 'Pincode deleted successfully' })
  remove(@Param('id') id: string) {
    return this.pincodeService.remove(+id);
  }
}
