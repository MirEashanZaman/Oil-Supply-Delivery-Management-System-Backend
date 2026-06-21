import { Module } from '@nestjs/common';
import { DealerController } from './dealer.controller';
import { DealerService } from './dealer.service';

@Module({
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService], // exported in case other modules need dealer data
})
export class DealerModule {}