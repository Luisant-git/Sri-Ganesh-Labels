import { Injectable } from '@nestjs/common';
import { CreateSizeChartDto } from './dto/create-size-chart.dto';
import { UpdateSizeChartDto } from './dto/update-size-chart.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SizeChartService {
  constructor(private prisma: PrismaService) {}
  
    create(createSizeChartDto: CreateSizeChartDto) {
      return this.prisma.sizeChart.create({
        data: createSizeChartDto,
      });
    }
  
    findAll() {
      return this.prisma.sizeChart.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }
  
    findAllActive() {
      return this.prisma.sizeChart.findMany({
        where: {
          rowNumber: {
            gt: 0,
          },
        },
        orderBy: {
          rowNumber: 'asc'
        }
      });
    }
  
    findOne(id: number) {
      return this.prisma.sizeChart.findUnique({
        where: { id },
      });
    }
  
    update(id: number, updateBannerDto: UpdateSizeChartDto) {
      return this.prisma.sizeChart.update({
        where: { id },
        data: updateBannerDto,
      });
    }
  
    remove(id: number) {
      return this.prisma.sizeChart.delete({
        where: { id },
      });
    }
}
