import { Body, Controller, Post, Get, Query, Delete, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { StaffsService } from './staffs.service';

@Controller('staffs')
export class StaffsController {
  constructor(
    private staffsService: StaffsService
  ) { }

  @Post('register')
  @UsePipes(ValidationPipe)
  createStaff(@Body() createStaffDto: any) {
    return this.staffsService.createStaff(createStaffDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  updateStaff(@Body() updateStaffDto: any) {
    return this.staffsService.createStaff(updateStaffDto);
  }

  @Get('all-staffs')
  getStaffs(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string
    ) {
    return this.staffsService.getAllStaffs(pageSize, pageIndex, sortBy, sortType);
  }

  @Get('staff-by')
  getStaff(@Query('id') id: number) {
    return this.staffsService.getStaff(id);
  }

  @Delete()
  @UsePipes(ValidationPipe)
  deleteStaff(@Query('id') id: number) {
    return this.staffsService.deleteStaff(id);
  }

}
