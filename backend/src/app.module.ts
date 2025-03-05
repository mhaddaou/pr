import { Module } from '@nestjs/common';
import { TiktokModule } from './tiktok/tiktok.module';

@Module({
  imports: [TiktokModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
