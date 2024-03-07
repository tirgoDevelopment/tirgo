import { Body, Controller, Post, Get, Query, Delete, UsePipes, ValidationPipe, Put, Req, Patch } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateStaffDto } from '..';
import { UpdateStaffDto } from '@app/shared-modules/entites/staffs/staff.dto';

@ApiTags('Staff users')
@Controller('staffs')
export class StaffsController {
  constructor(
    private staffsService: StaffsService
  ) { }


  @ApiOperation({ summary: 'Create staff user' })
  @Post('register')
  @UsePipes(ValidationPipe)
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.staffsService.createStaff(createStaffDto);
  }

  @ApiOperation({ summary: 'Update staff user' })
  @Put()
  @UsePipes(ValidationPipe)
  updateStaff(@Body() updateStaffDto: UpdateStaffDto) {
    return this.staffsService.updateStaff(updateStaffDto);
  }


  @ApiOperation({ summary: 'Get all staff users' })
  @Get('all-staffs')
  getStaffs(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string
    ) {
    return this.staffsService.getAllStaffs(pageSize, pageIndex, sortBy, sortType);
  }

  @ApiOperation({ summary: 'Get staff user by id' })
  @Get('staff-by')
  getStaff(@Query('id') id: number) {
    return this.staffsService.getStaff(id);
  }

  @ApiOperation({ summary: 'Delete staff user' })
  @Delete()
  @UsePipes(ValidationPipe)
  deleteStaff(@Query('id') id: number) {
    return this.staffsService.deleteStaff(id);
  }

  @ApiOperation({ summary: 'Block staff user' })
  @Patch()
  @UsePipes(ValidationPipe)
  blockStaff(@Query('id') id: number, @Body() blockDto: { blockReason: string }, @Req() req: Request) {
    return this.staffsService.blockStaff(id, blockDto.blockReason, req['user']);
  }

}
