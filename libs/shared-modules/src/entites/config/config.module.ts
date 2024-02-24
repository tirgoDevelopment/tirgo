import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config]),
],
  providers: [],
  controllers: [],
  exports: [
    TypeOrmModule.forFeature([Config]),
  ]
})
export class ConfigsModule {}
