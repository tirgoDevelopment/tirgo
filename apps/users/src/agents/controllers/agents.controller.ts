import { Body, Controller, Get, Patch, Post, Put, Delete, Query, Req, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe, } from '@nestjs/common';
import { AgentsService } from '../services/agents.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AgentDto } from '../..';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(
    private staffsService: AgentsService
  ) { }

  @ApiOperation({ summary: 'Create agent' })
  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificateFilePath', maxCount: 1 },
    { name: 'managerPassportFilePath', maxCount: 1 },
  ]),
  )
  createAgent(
    @UploadedFiles() files: { registrationCertificateFilePath?: any[], managerPassportFilePath?: any[] }, @Body() createAgentDto: AgentDto,
    @Req() req: Request) {
    return this.staffsService.createAgent(files, createAgentDto, req['user']);
  }

  @ApiOperation({ summary: 'Update agent' })
  @Put('update')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificateFilePath', maxCount: 1 },
    { name: 'managerPassportFilePath', maxCount: 1 },
  ]),
  )
  updateAgent(
    @UploadedFiles() files: { registrationCertificateFilePath?: any[], managerPassportFilePath?: any[] }, @Body() createAgentDto: any) {
    return this.staffsService.updateAgent(files, createAgentDto);
  }

  @ApiOperation({ summary: 'Block agent' })
  @Patch('block-agent')
  blockAgent(@Query('id') id: number, @Req() req: Request) {
    return this.staffsService.blockAgent(id, req['user']);
  }

  @ApiOperation({ summary: 'Activate agent' })
  @Patch('activate-agent')
  activateAgent(@Query('id') id: number, @Req() req: Request) {
    return this.staffsService.activateAgent(id, req['user']);
  }

  @ApiOperation({ summary: 'Restore agent' })
  @Patch('restore-agent')
  restoreAgent(@Query('id') id: number) {
    return this.staffsService.restoreAgent(id);
  }

  @ApiOperation({ summary: 'Delete agent' })
  @Delete()
  deleteAgent(@Query('id') id: number) {
    return this.staffsService.deleteAgent(id);
  }

  @ApiOperation({ summary: 'Get all agents' })
  @Get()
  async getAgents(
    @Query('pageSize') pageSize: string,
    @Query('pageIndex') pageIndex: string,
    @Query('sortBy') sortBy: string,
    @Query('sortType') sortType: string,
    @Query('merchantId') id: number,
    @Query('companyName') companyName: string,
    @Query('createdFrom') createdFrom: string,
    @Query('createdAtTo') createdAtTo: string,
  ) {
    return this.staffsService.getAgents(id, pageSize, pageIndex, sortBy, sortType, companyName, createdFrom, createdAtTo)
  }
  
  @ApiOperation({ summary: 'Get agent by id' })
  @Get('agent-by')
  async getAgentById(@Query('id') id: number) {
    return this.staffsService.getAgentById(id)
  }

}
