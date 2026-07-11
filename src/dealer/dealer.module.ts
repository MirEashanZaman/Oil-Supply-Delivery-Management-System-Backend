import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';
import { DealerController } from './dealer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer])],
  controllers: [DealerController],
  providers: [DealerService],
})
export class DealerModule { }