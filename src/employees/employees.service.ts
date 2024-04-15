import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';

@Injectable()
export class EmployeesService {
  constructor(readonly prisma: PrismaService) { }
  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const employee = await this.prisma.employee.create({
        data: createEmployeeDto
      })
      return employee
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async findAll(filterQuery: any, include: any) {
    try {
      const employees = await this.prisma.employee.findMany({
        where: filterQuery,
        include
      })
      return employees
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
