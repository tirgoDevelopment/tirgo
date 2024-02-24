import { Module } from "@nestjs/common";
import { SseController } from "./sse.controller";
import { SseGateway } from "./sse.service";

@Module({
  controllers: [
    SseController
  ],
  providers: [
    SseGateway
  ],
  exports: [
    SseGateway
  ]
})
export class SseModule {

}