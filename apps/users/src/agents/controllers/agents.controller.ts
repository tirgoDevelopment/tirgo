import { Body, Controller, Get, Patch, Post, Put, Delete, Query, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe, } from '@nestjs/common';
import { AgentsService } from '../services/agents.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AgentDto } from '../..';

@Controller('agents')
export class AgentsController {
  constructor(
    private staffsService: AgentsService
  ) { }

  @Post('register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'registrationCertificateFilePath', maxCount: 1 },
    { name: 'managerPassportFilePath', maxCount: 1 },
  ]),
  )
  createAgent(
    @UploadedFiles() files: { registrationCertificateFilePath?: any[], managerPassportFilePath?: any[] }, @Body() createAgentDto: AgentDto) {
    return this.staffsService.createAgent(files, createAgentDto);
  }

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

  @Patch('block-agent')
  blockAgent(@Query('id') id: number) {
    return this.staffsService.blockAgent(id);
  }

  @Patch('activate-agent')
  activateAgent(@Query('id') id: number) {
    return this.staffsService.activateAgent(id);
  }

  @Patch('restore-agent')
  restoreAgent(@Query('id') id: number) {
    return this.staffsService.restoreAgent(id);
  }

  @Delete()
  deleteAgent(@Query('id') id: number) {
    return this.staffsService.deleteAgent(id);
  }

  @Get()
  async getAgents(
    @Query('merchantId') id: number,
    @Query('companyName') companyName: string,
    @Query('createdFrom') createdFrom: string,
    @Query('createdAtTo') createdAtTo: string,
  ) {
    return this.staffsService.getAgents(id, companyName, createdFrom, createdAtTo)
  }
  
  @Get('agent-by')
  async getAgentById(@Query('id') id: number) {
    return this.staffsService.getAgentById(id)
  }

}
