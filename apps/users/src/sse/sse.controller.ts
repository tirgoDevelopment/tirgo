import { Controller, Get, Req, Res } from '@nestjs/common';
import { SseGateway } from './sse.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('sse')
export class SseController {
  constructor(private readonly sseGateway: SseGateway) {}

  @ApiOperation({ summary: 'Connection' })
  @Get('events')
  sse(@Req() req, @Res() res) {
    // Handle SSE connection in the gateway
    return this.sseGateway.handleSseConnection(req, res);
  }
}