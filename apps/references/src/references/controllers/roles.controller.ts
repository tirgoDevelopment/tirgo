import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Put, Query } from '@nestjs/common';
import { RoleDto } from '../..';
import { RolesService } from '../services/roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createRole(@Body() createRoleDto: RoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateRole(@Body() updateRoleDto: RoleDto) {
    return this.rolesService.updateRole(updateRoleDto);
  }

  @Get('get-by')
  async getRole(@Query('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Get('all-roles')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('all-permissions')
  async getAllPermission() {
    return this.rolesService.getAllPermissions();
  }
}
