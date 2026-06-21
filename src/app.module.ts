import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DealerModule } from './dealer/dealer.module';
@Module({
  imports: [ DealerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
